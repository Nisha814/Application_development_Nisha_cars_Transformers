using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StaffSalesAPI.Data;
using StaffSalesAPI.DTOs;
using StaffSalesAPI.Models;

namespace StaffSalesAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SalesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/sales
        [HttpPost]
        public async Task<ActionResult<SaleResponseDto>> ProcessSale([FromBody] SaleCreateDto dto)
        {
            if (dto == null || dto.Items == null || !dto.Items.Any())
            {
                return BadRequest("Invalid transaction. Sale must contain at least one item.");
            }

            // Verify Staff exists
            var staff = await _context.Staffs.FindAsync(dto.StaffId);
            if (staff == null)
            {
                return BadRequest("Invalid Staff ID. Operations restricted to registered staff.");
            }

            // Start Transaction to guarantee data integrity across Sale, Items, Invoices, and Credits
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    Customer? customer = null;
                    if (dto.CustomerId.HasValue)
                    {
                        customer = await _context.Customers
                            .Include(c => c.Credit)
                            .FirstOrDefaultAsync(c => c.Id == dto.CustomerId.Value);
                        
                        if (customer == null)
                        {
                            return BadRequest("Invalid Customer ID.");
                        }
                    }

                    // Calculate totals
                    decimal totalAmount = dto.Items.Sum(item => item.Quantity * item.UnitPrice);
                    decimal netAmount = totalAmount - dto.Discount;
                    if (netAmount < 0) netAmount = 0;

                    string saleStatus = "Paid";
                    
                    // Credit Sales Business Logic
                    if (dto.PaymentMethod.Equals("Credit", StringComparison.OrdinalIgnoreCase))
                    {
                        if (customer == null)
                        {
                            return BadRequest("Credit sales require a registered customer profile.");
                        }

                        var credit = customer.Credit;
                        if (credit == null)
                        {
                            // Auto-create a credit record if somehow missing
                            credit = new CustomerCredit
                            {
                                CustomerId = customer.Id,
                                TotalCreditLimit = 1000.00m,
                                CurrentBalance = 0.00m,
                                LastUpdated = DateTime.UtcNow
                            };
                            _context.CustomerCredits.Add(credit);
                            await _context.SaveChangesAsync();
                        }

                        // Check credit limit
                        decimal availableCredit = credit.TotalCreditLimit - credit.CurrentBalance;
                        if (netAmount > availableCredit)
                        {
                            return BadRequest($"Credit transaction declined. Insufficient credit limit. Available: ${availableCredit:F2}, Required: ${netAmount:F2}");
                        }

                        // Update customer credit balance (increase debt)
                        credit.CurrentBalance += netAmount;
                        credit.LastUpdated = DateTime.UtcNow;
                        
                        // Credit sale remains "Pending" until balance is cleared
                        saleStatus = "Pending";
                    }

                    // Save Sale record
                    var sale = new Sale
                    {
                        StaffId = dto.StaffId,
                        CustomerId = dto.CustomerId,
                        SaleDate = DateTime.UtcNow,
                        TotalAmount = totalAmount,
                        Discount = dto.Discount,
                        NetAmount = netAmount,
                        PaymentMethod = dto.PaymentMethod,
                        Status = saleStatus
                    };

                    _context.Sales.Add(sale);
                    await _context.SaveChangesAsync(); // Generates sale.Id

                    // Save individual SaleItems
                    var saleItems = dto.Items.Select(item => new SaleItem
                    {
                        SaleId = sale.Id,
                        PartName = item.PartName,
                        PartNumber = item.PartNumber,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.Quantity * item.UnitPrice
                    }).ToList();

                    _context.SaleItems.AddRange(saleItems);
                    await _context.SaveChangesAsync();

                    // Generate dynamic invoice number: INV-{Year}-{SaleId:D5}
                    string invoiceNumber = $"INV-{DateTime.UtcNow.Year}-{sale.Id:D5}";

                    // Create Invoice record
                    var invoice = new Invoice
                    {
                        InvoiceNumber = invoiceNumber,
                        SaleId = sale.Id,
                        IssuedDate = DateTime.UtcNow,
                        DueDate = DateTime.UtcNow.AddDays(30), // 30-day payment term
                        SentToEmail = customer?.Email ?? "walkin-sales@veloparts.com",
                        Status = saleStatus.Equals("Paid", StringComparison.OrdinalIgnoreCase) ? "Paid" : "Sent"
                    };

                    _context.Invoices.Add(invoice);
                    await _context.SaveChangesAsync();

                    // Commit db transaction
                    await transaction.CommitAsync();

                    // Prepare DTO response
                    var response = new SaleResponseDto
                    {
                        Id = sale.Id,
                        StaffId = sale.StaffId,
                        StaffName = staff.FullName,
                        CustomerId = sale.CustomerId,
                        CustomerName = customer?.FullName ?? "Walk-in Customer",
                        SaleDate = sale.SaleDate,
                        TotalAmount = sale.TotalAmount,
                        Discount = sale.Discount,
                        NetAmount = sale.NetAmount,
                        PaymentMethod = sale.PaymentMethod,
                        Status = sale.Status,
                        InvoiceNumber = invoiceNumber,
                        Items = saleItems.Select(si => new SaleItemResponseDto
                        {
                            Id = si.Id,
                            PartName = si.PartName,
                            PartNumber = si.PartNumber,
                            Quantity = si.Quantity,
                            UnitPrice = si.UnitPrice,
                            TotalPrice = si.TotalPrice
                        }).ToList()
                    };

                    return Ok(response);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, $"An error occurred while processing the sale: {ex.Message}");
                }
            }
        }

        // GET: api/sales/history/{customerId}
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<SaleResponseDto>>> GetCustomerSalesHistory(int customerId)
        {
            var sales = await _context.Sales
                .Include(s => s.Staff)
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                .Include(s => s.Invoices)
                .Where(s => s.CustomerId == customerId)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();

            var response = sales.Select(s => new SaleResponseDto
            {
                Id = s.Id,
                StaffId = s.StaffId,
                StaffName = s.Staff?.FullName ?? "Unknown Staff",
                CustomerId = s.CustomerId,
                CustomerName = s.Customer?.FullName ?? "Unknown Customer",
                SaleDate = s.SaleDate,
                TotalAmount = s.TotalAmount,
                Discount = s.Discount,
                NetAmount = s.NetAmount,
                PaymentMethod = s.PaymentMethod,
                Status = s.Status,
                InvoiceNumber = s.Invoices.FirstOrDefault()?.InvoiceNumber,
                Items = s.SaleItems.Select(si => new SaleItemResponseDto
                {
                    Id = si.Id,
                    PartName = si.PartName,
                    PartNumber = si.PartNumber,
                    Quantity = si.Quantity,
                    UnitPrice = si.UnitPrice,
                    TotalPrice = si.TotalPrice
                }).ToList()
            });

            return Ok(response);
        }
    }
}
