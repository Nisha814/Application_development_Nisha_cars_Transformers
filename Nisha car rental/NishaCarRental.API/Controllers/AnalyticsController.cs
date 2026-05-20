using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NishaCarRental.API.Data;

namespace NishaCarRental.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly RentalDbContext _context;

        public AnalyticsController(RentalDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            // Total Revenue (Sum of paid payments)
            var totalRevenue = await _context.Payments
                .Where(p => p.Status == "Paid")
                .SumAsync(p => p.Amount);

            // Active Rentals count
            var activeRentals = await _context.Rentals
                .CountAsync(r => r.Status == "Active");

            // Pending Payments
            var pendingPaymentsCount = await _context.Payments
                .CountAsync(p => p.Status == "Pending");

            var pendingPaymentsAmount = await _context.Payments
                .Where(p => p.Status == "Pending")
                .SumAsync(p => p.Amount);

            // Total Customers
            var totalCustomers = await _context.Customers.CountAsync();

            // Monthly Revenue Over Time (Group by Year-Month)
            var payments = await _context.Payments
                .Where(p => p.Status == "Paid")
                .Select(p => new { p.Amount, p.PaymentDate })
                .ToListAsync();

            var monthlyRevenue = payments
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .Select(g => new
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Revenue = g.Sum(p => p.Amount)
                })
                .OrderBy(m => m.Month)
                .ToList();

            // Bookings by Vehicle Category
            var categoryBookings = await _context.Rentals
                .Include(r => r.Car)
                .Where(r => r.Car != null)
                .GroupBy(r => r.Car!.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Count = g.Count(),
                    Revenue = g.Sum(r => r.TotalAmount)
                })
                .ToListAsync();

            // Top Spenders (Top 5 Customers by total spend)
            var topSpenders = await _context.Payments
                .Include(p => p.Rental)
                    .ThenInclude(r => r!.Customer)
                .Where(p => p.Status == "Paid" && p.Rental != null && p.Rental.Customer != null)
                .GroupBy(p => p.Rental!.Customer!.Name)
                .Select(g => new
                {
                    CustomerName = g.Key,
                    TotalSpent = g.Sum(p => p.Amount)
                })
                .OrderByDescending(s => s.TotalSpent)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                Metrics = new
                {
                    TotalRevenue = totalRevenue,
                    ActiveRentals = activeRentals,
                    PendingPaymentsCount = pendingPaymentsCount,
                    PendingPaymentsAmount = pendingPaymentsAmount,
                    TotalCustomers = totalCustomers
                },
                MonthlyRevenue = monthlyRevenue,
                CategoryBookings = categoryBookings,
                TopSpenders = topSpenders
            });
        }
    }
}
