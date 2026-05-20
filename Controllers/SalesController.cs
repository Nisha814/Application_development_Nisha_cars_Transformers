using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;
using VehicleParts.API.Services;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class SalesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IInventoryService _inventoryService;

        public SalesController(AppDbContext context, IInventoryService inventoryService)
        {
            _context = context;
            _inventoryService = inventoryService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSale([FromBody] CreateSalesInvoiceDto dto)
        {
            if (!ModelState.IsValid || dto.Items == null || !dto.Items.Any())
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid sale data or empty items"));

            var customer = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.CustomerId && u.Role == UserRole.Customer);
            if (customer == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var staffIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(staffIdClaim) || !int.TryParse(staffIdClaim, out int staffId))
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid staff token"));

            var invoice = new SalesInvoice
            {
                CustomerId = dto.CustomerId,
                StaffId = staffId,
                Date = DateTime.UtcNow,
                PaymentStatus = dto.PaymentStatus,
                Items = new List<SalesInvoiceItem>()
            };

            decimal totalAmount = 0;
            var stockItems = new List<(int PartId, int Quantity)>();

            foreach (var itemDto in dto.Items)
            {
                var part = await _context.Parts.FindAsync(itemDto.PartId);
                if (part == null || part.StockQuantity < itemDto.Quantity)
                    return BadRequest(ApiResponse<object>.ErrorResponse($"Part ID {itemDto.PartId} not found or insufficient stock"));

                var totalPrice = part.Price * itemDto.Quantity;

                invoice.Items.Add(new SalesInvoiceItem
                {
                    PartId = part.Id,
                    Quantity = itemDto.Quantity,
                    UnitPrice = part.Price,
                    TotalPrice = totalPrice
                });

                stockItems.Add((part.Id, itemDto.Quantity));
                totalAmount += totalPrice;
            }

            invoice.TotalAmount = totalAmount;
            _context.SalesInvoices.Add(invoice);

            if (dto.PaymentStatus == "Credit")
            {
                var credit = new CustomerCredit
                {
                    CustomerId = dto.CustomerId,
                    SalesInvoice = invoice,
                    AmountDue = totalAmount,
                    DueDate = DateTime.UtcNow.AddDays(30)
                };
                _context.CustomerCredits.Add(credit);
            }

            await _context.SaveChangesAsync();

            await _inventoryService.ProcessSaleStockAsync(
                stockItems, staffId, $"INV-{invoice.Id}");

            // Mock Email Trigger
            Console.WriteLine($"[EMAIL TRIGGER] Sending invoice #{invoice.Id} to customer {customer.Email}.");

            return Ok(ApiResponse<object>.SuccessResponse("Sale processed successfully", new { invoiceId = invoice.Id }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoice(int id)
        {
            var invoice = await _context.SalesInvoices
                .Include(i => i.Customer)
                .Include(i => i.Staff)
                .Include(i => i.Items)
                    .ThenInclude(li => li.Part)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Invoice not found"));

            var invoiceDto = new
            {
                invoice.Id,
                invoice.Date,
                invoice.TotalAmount,
                invoice.PaymentStatus,
                Customer = new { invoice.Customer?.FullName, invoice.Customer?.Email, invoice.Customer?.PhoneNumber },
                Staff = new { invoice.Staff?.FullName },
                Items = invoice.Items.Select(i => new { i.Part?.Name, i.Part?.PartNumber, i.Quantity, i.UnitPrice, i.TotalPrice })
            };

            return Ok(ApiResponse<object>.SuccessResponse("Invoice retrieved successfully", invoiceDto));
        }

        [HttpPost("credit/{creditId}/pay")]
        public async Task<IActionResult> PayCredit(int creditId)
        {
            var credit = await _context.CustomerCredits.FindAsync(creditId);
            if (credit == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Credit record not found"));

            if (credit.IsPaid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Credit is already paid"));

            credit.IsPaid = true;
            credit.PaidDate = DateTime.UtcNow;

            var invoice = await _context.SalesInvoices.FindAsync(credit.SalesInvoiceId);
            if (invoice != null)
                invoice.PaymentStatus = "Paid";

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Credit marked as paid successfully"));
        }
    }
}
