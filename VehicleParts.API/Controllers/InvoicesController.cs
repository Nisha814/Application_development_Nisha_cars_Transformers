using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class InvoicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InvoicesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetInvoices()
        {
            var invoices = await _context.PurchaseInvoices
                .Include(i => i.Vendor)
                .Include(i => i.Items)
                    .ThenInclude(item => item.Part)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<PurchaseInvoice>>.SuccessResponse("Purchase invoices retrieved successfully", invoices));
        }

        [HttpPost]
        public async Task<IActionResult> CreateInvoice(CreatePurchaseInvoiceDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            // Verify Invoice Number uniqueness
            var invoiceExists = await _context.PurchaseInvoices.AnyAsync(i => i.InvoiceNumber.ToLower() == dto.InvoiceNumber.ToLower());
            if (invoiceExists)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse($"A purchase invoice with number '{dto.InvoiceNumber}' already exists"));
            }

            // Verify Vendor exists
            var vendorExists = await _context.Vendors.AnyAsync(v => v.Id == dto.VendorId);
            if (!vendorExists)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Selected supplier (Vendor) does not exist"));
            }

            // Use DbTransaction to ensure atomic stock updates alongside invoice creation
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var invoice = new PurchaseInvoice
                {
                    InvoiceNumber = dto.InvoiceNumber,
                    InvoiceDate = dto.InvoiceDate,
                    VendorId = dto.VendorId,
                    Status = dto.Status,
                    TotalAmount = 0, // Calculated dynamically below
                    CreatedAt = DateTime.UtcNow
                };

                _context.PurchaseInvoices.Add(invoice);
                await _context.SaveChangesAsync(); // Generates Invoice Id

                decimal calculatedTotal = 0;

                foreach (var itemDto in dto.Items)
                {
                    var part = await _context.Parts.FindAsync(itemDto.PartId);
                    if (part == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(ApiResponse<object>.ErrorResponse($"Vehicle part with ID {itemDto.PartId} does not exist"));
                    }

                    // Automatic Stock Quantity Update!
                    part.StockQuantity += itemDto.Quantity;
                    _context.Entry(part).State = EntityState.Modified;

                    var invoiceItem = new PurchaseInvoiceItem
                    {
                        PurchaseInvoiceId = invoice.Id,
                        PartId = itemDto.PartId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemDto.UnitPrice
                    };

                    _context.PurchaseInvoiceItems.Add(invoiceItem);
                    calculatedTotal += (itemDto.Quantity * itemDto.UnitPrice);
                }

                // Update final total amount
                invoice.TotalAmount = calculatedTotal;
                _context.Entry(invoice).State = EntityState.Modified;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Load relationships for response payload
                await _context.Entry(invoice).Reference(i => i.Vendor).LoadAsync();
                await _context.Entry(invoice).Collection(i => i.Items).Query().Include(item => item.Part).LoadAsync();

                return Ok(ApiResponse<PurchaseInvoice>.SuccessResponse("Purchase invoice created and stock levels updated successfully", invoice));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred while creating the invoice: {ex.Message}"));
            }
        }
    }
}
