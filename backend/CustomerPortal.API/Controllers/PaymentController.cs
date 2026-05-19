using System;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerPortal.API.Data;
using CustomerPortal.API.Models;

namespace CustomerPortal.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetPayments()
        {
            var userId = GetUserId();

            // Refresh status for pending payments that have passed their due date
            var pendingPayments = await _context.Payments
                .Where(p => p.CustomerId == userId && p.Status == "Pending" && p.DueDate < DateTime.UtcNow.Date)
                .ToListAsync();

            if (pendingPayments.Count > 0)
            {
                foreach (var payment in pendingPayments)
                {
                    payment.Status = "Overdue";
                }
                await _context.SaveChangesAsync();
            }

            var payments = await _context.Payments
                .Where(p => p.CustomerId == userId)
                .OrderBy(p => p.Status == "Paid" ? 1 : 0) // Pending/Overdue first
                .ThenBy(p => p.DueDate)
                .ToListAsync();

            if (payments.Count == 0)
            {
                // Seed mock payments
                var sample1 = new Payment
                {
                    CustomerId = userId,
                    Description = "Diagnostics Fee - Electrical Issue Inquiry",
                    Amount = 85.00m,
                    DueDate = DateTime.UtcNow.AddDays(5).Date,
                    Status = "Pending",
                    PaidAt = null
                };

                var sample2 = new Payment
                {
                    CustomerId = userId,
                    Description = "Annual Service Pack #2 (Full Maintenance)",
                    Amount = 350.00m,
                    DueDate = DateTime.UtcNow.AddDays(-3).Date, // Overdue
                    Status = "Overdue",
                    PaidAt = null
                };

                var sample3 = new Payment
                {
                    CustomerId = userId,
                    Description = "Spark Plug Replacement & Cleaning Ref #9812",
                    Amount = 145.00m,
                    DueDate = DateTime.UtcNow.AddDays(-20).Date,
                    Status = "Paid",
                    PaidAt = DateTime.UtcNow.AddDays(-20)
                };

                _context.Payments.AddRange(sample1, sample2, sample3);
                await _context.SaveChangesAsync();

                payments = new List<Payment> { sample1, sample2, sample3 };
            }

            return Ok(payments);
        }

        [HttpPost("{id}/pay")]
        public async Task<IActionResult> ProcessPayment(int id)
        {
            var userId = GetUserId();
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.Id == id && p.CustomerId == userId);

            if (payment == null)
                return NotFound(new { message = "Payment record not found or not owned by you" });

            if (payment.Status == "Paid")
                return BadRequest(new { message = "Payment has already been processed" });

            payment.Status = "Paid";
            payment.PaidAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Create notification
            var notification = new CustomerNotification
            {
                CustomerId = userId,
                Title = "Payment Received",
                Message = $"Thank you! We've received your payment of ${payment.Amount} for '{payment.Description}'. Receipt code: TXN-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}.",
                Type = "payment",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerNotifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(payment);
        }
    }
}
