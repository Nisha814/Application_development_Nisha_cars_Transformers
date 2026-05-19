using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("financial")]
        public async Task<IActionResult> GetFinancialReport([FromQuery] string period = "monthly")
        {
            period = period.ToLower();
            if (period != "daily" && period != "monthly" && period != "yearly")
            {
                period = "monthly";
            }

            // 1. Fetch baseline totals
            var allInvoices = await _context.PurchaseInvoices.ToListAsync();
            var allParts = await _context.Parts.ToListAsync();

            decimal totalSpending = allInvoices.Sum(i => i.TotalAmount);
            int invoicesCount = allInvoices.Count;
            int activeSuppliersCount = allInvoices.Select(i => i.VendorId).Distinct().Count();

            // Stock Inventory valuation
            decimal inventoryValuation = allParts.Sum(p => p.Price * p.StockQuantity);

            // 2. Category Breakdown
            var categoryGroups = allParts
                .GroupBy(p => p.Category)
                .Select(g => new CategoryValuationDto
                {
                    CategoryName = g.Key,
                    TotalValuation = g.Sum(p => p.Price * p.StockQuantity),
                    PartsCount = g.Count(),
                    Percentage = inventoryValuation > 0 
                        ? Math.Round((double)(g.Sum(p => p.Price * p.StockQuantity) / inventoryValuation) * 100, 2)
                        : 0
                })
                .OrderByDescending(c => c.TotalValuation)
                .ToList();

            // 3. Generate Time-Series Groupings
            var timeSeries = new List<ReportTimeSeriesEntryDto>();

            if (period == "daily")
            {
                // Generate last 30 days list to ensure no gaps
                var startDate = DateTime.UtcNow.AddDays(-29).Date;
                var dailyGroups = allInvoices
                    .Where(i => i.InvoiceDate >= startDate)
                    .GroupBy(i => i.InvoiceDate.Date)
                    .ToDictionary(g => g.Key, g => new { Sum = g.Sum(i => i.TotalAmount), Count = g.Count() });

                for (int d = 0; d < 30; d++)
                {
                    var currentDate = startDate.AddDays(d);
                    decimal amount = dailyGroups.TryGetValue(currentDate, out var details) ? details.Sum : 0;
                    int count = dailyGroups.TryGetValue(currentDate, out var details2) ? details2.Count : 0;

                    timeSeries.Add(new ReportTimeSeriesEntryDto
                    {
                        Label = currentDate.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture),
                        Amount = amount,
                        TransactionsCount = count
                    });
                }
            }
            else if (period == "monthly")
            {
                // Monthly for current year
                var currentYear = DateTime.UtcNow.Year;
                var monthlyGroups = allInvoices
                    .Where(i => i.InvoiceDate.Year == currentYear)
                    .GroupBy(i => i.InvoiceDate.Month)
                    .ToDictionary(g => g.Key, g => new { Sum = g.Sum(i => i.TotalAmount), Count = g.Count() });

                for (int m = 1; m <= 12; m++)
                {
                    decimal amount = monthlyGroups.TryGetValue(m, out var details) ? details.Sum : 0;
                    int count = monthlyGroups.TryGetValue(m, out var details2) ? details2.Count : 0;

                    timeSeries.Add(new ReportTimeSeriesEntryDto
                    {
                        Label = CultureInfo.InvariantCulture.DateTimeFormat.GetMonthName(m),
                        Amount = amount,
                        TransactionsCount = count
                    });
                }
            }
            else if (period == "yearly")
            {
                // Group by year
                var yearlyGroups = allInvoices
                    .GroupBy(i => i.InvoiceDate.Year)
                    .OrderBy(g => g.Key)
                    .Select(g => new ReportTimeSeriesEntryDto
                    {
                        Label = g.Key.ToString(),
                        Amount = g.Sum(i => i.TotalAmount),
                        TransactionsCount = g.Count()
                    })
                    .ToList();

                timeSeries.AddRange(yearlyGroups);
            }

            var report = new FinancialReportDto
            {
                Period = period,
                TotalSpending = totalSpending,
                InvoicesCount = invoicesCount,
                ActiveSuppliersCount = activeSuppliersCount,
                InventoryValuation = inventoryValuation,
                CategoryBreakdown = categoryGroups,
                TimeSeries = timeSeries
            };

            return Ok(ApiResponse<FinancialReportDto>.SuccessResponse("Financial report generated successfully", report));
        }
    }
}
