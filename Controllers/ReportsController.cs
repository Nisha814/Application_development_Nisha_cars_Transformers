using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using VehicleParts.API.Data;
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

        // GET /api/Reports/financial
        [HttpGet("financial")]
        public async Task<IActionResult> GetFinancialReport()
        {
            var invoices = await _context.SalesInvoices.ToListAsync();
            var credits = await _context.CustomerCredits.ToListAsync();

            var monthlyRevenue = invoices
                .GroupBy(i => new { i.Date.Year, i.Date.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Revenue = g.Sum(i => i.TotalAmount),
                    PaidRevenue = g.Where(i => i.PaymentStatus == "Paid").Sum(i => i.TotalAmount),
                    CreditRevenue = g.Where(i => i.PaymentStatus == "Credit").Sum(i => i.TotalAmount),
                    InvoiceCount = g.Count()
                }).ToList();

            var totalRevenue = invoices.Sum(i => i.TotalAmount);
            var totalPaid = invoices.Where(i => i.PaymentStatus == "Paid").Sum(i => i.TotalAmount);
            var totalCredit = invoices.Where(i => i.PaymentStatus == "Credit").Sum(i => i.TotalAmount);
            var totalOutstanding = credits.Where(c => !c.IsPaid).Sum(c => c.AmountDue);

            return Ok(ApiResponse<object>.SuccessResponse("Financial report generated", new
            {
                Summary = new { totalRevenue, totalPaid, totalCredit, totalOutstanding },
                MonthlyBreakdown = monthlyRevenue
            }));
        }

        // GET /api/Reports/sales
        [HttpGet("sales")]
        public async Task<IActionResult> GetSalesReport()
        {
            var items = await _context.SalesInvoiceItems
                .Include(i => i.Part)
                .Include(i => i.SalesInvoice)
                .ToListAsync();

            var topParts = items
                .GroupBy(i => new { i.PartId, Name = i.Part?.Name ?? "Unknown" })
                .Select(g => new
                {
                    PartName = g.Key.Name,
                    TotalSold = g.Sum(i => i.Quantity),
                    TotalRevenue = g.Sum(i => i.TotalPrice)
                })
                .OrderByDescending(p => p.TotalSold)
                .Take(10)
                .ToList();

            var dailySales = items
                .GroupBy(i => i.SalesInvoice!.Date.Date)
                .OrderByDescending(g => g.Key)
                .Take(30)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(i => i.TotalPrice),
                    UnitsSold = g.Sum(i => i.Quantity)
                })
                .OrderBy(d => d.Date)
                .ToList();

            var totalInvoices = await _context.SalesInvoices.CountAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Sales report generated", new
            {
                TotalInvoices = totalInvoices,
                TopSellingParts = topParts,
                DailySales = dailySales
            }));
        }

        // GET /api/Reports/customers
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomerReport()
        {
            var customers = await _context.Users
                .Where(u => u.Role == UserRole.Customer)
                .Include(u => u.SalesInvoices)
                .ToListAsync();

            var monthlyNewCustomers = customers
                .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    NewCustomers = g.Count()
                }).ToList();

            var withPurchases = customers.Count(c => c.SalesInvoices.Any());
            var withoutPurchases = customers.Count - withPurchases;

            return Ok(ApiResponse<object>.SuccessResponse("Customer report generated", new
            {
                TotalCustomers = customers.Count,
                WithPurchases = withPurchases,
                WithoutPurchases = withoutPurchases,
                MonthlyGrowth = monthlyNewCustomers
            }));
        }

        // GET /api/Reports/top-spenders
        [HttpGet("top-spenders")]
        public async Task<IActionResult> GetTopSpenders()
        {
            var topSpenders = await _context.Users
                .Where(u => u.Role == UserRole.Customer)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    TotalSpent = u.SalesInvoices.Sum(s => s.TotalAmount),
                    TotalOrders = u.SalesInvoices.Count()
                })
                .OrderByDescending(u => u.TotalSpent)
                .Take(10)
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Top spenders retrieved", topSpenders));
        }

        // GET /api/Reports/pending-payments
        [HttpGet("pending-payments")]
        public async Task<IActionResult> GetPendingPayments()
        {
            var pending = await _context.CustomerCredits
                .Where(c => !c.IsPaid)
                .Include(c => c.Customer)
                .Include(c => c.SalesInvoice)
                .Select(c => new
                {
                    c.Id,
                    CustomerName = c.Customer!.FullName,
                    CustomerEmail = c.Customer.Email,
                    c.AmountDue,
                    c.DueDate,
                    InvoiceId = c.SalesInvoiceId,
                    IsOverdue = c.DueDate < DateTime.UtcNow
                })
                .OrderBy(c => c.DueDate)
                .ToListAsync();

            var totalOutstanding = pending.Sum(p => p.AmountDue);
            var overdueCount = pending.Count(p => p.IsOverdue);

            return Ok(ApiResponse<object>.SuccessResponse("Pending payments retrieved", new
            {
                TotalOutstanding = totalOutstanding,
                OverdueCount = overdueCount,
                Items = pending
            }));
        }

        // GET /api/Reports/predictions
        [HttpGet("predictions")]
        public async Task<IActionResult> GetPredictions()
        {
            var invoices = await _context.SalesInvoices.ToListAsync();
            var customers = await _context.Users.Where(u => u.Role == UserRole.Customer).ToListAsync();

            var now = DateTime.UtcNow;
            var thisMonth = invoices.Where(i => i.Date.Year == now.Year && i.Date.Month == now.Month);
            var lastMonth = invoices.Where(i => i.Date.Year == now.AddMonths(-1).Year && i.Date.Month == now.AddMonths(-1).Month);

            var thisMonthRevenue = thisMonth.Sum(i => i.TotalAmount);
            var lastMonthRevenue = lastMonth.Sum(i => i.TotalAmount);
            var revenueChange = lastMonthRevenue == 0 ? 0 : Math.Round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100, 1);

            var thisMonthCustomers = customers.Count(c => c.CreatedAt.Year == now.Year && c.CreatedAt.Month == now.Month);
            var lastMonthCustomers = customers.Count(c => c.CreatedAt.Year == now.AddMonths(-1).Year && c.CreatedAt.Month == now.AddMonths(-1).Month);
            var customerChange = lastMonthCustomers == 0 ? 0 : Math.Round(((decimal)(thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100, 1);

            var thisMonthOrders = thisMonth.Count();
            var lastMonthOrders = lastMonth.Count();
            var ordersChange = lastMonthOrders == 0 ? 0 : Math.Round(((decimal)(thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100, 1);

            var projectedNextMonth = thisMonthRevenue * (1 + (revenueChange / 100));

            return Ok(ApiResponse<object>.SuccessResponse("Predictions generated", new
            {
                Revenue = new
                {
                    ThisMonth = thisMonthRevenue,
                    LastMonth = lastMonthRevenue,
                    ChangePercent = revenueChange,
                    ProjectedNextMonth = Math.Round(projectedNextMonth, 2),
                    Trend = revenueChange >= 0 ? "up" : "down"
                },
                Orders = new
                {
                    ThisMonth = thisMonthOrders,
                    LastMonth = lastMonthOrders,
                    ChangePercent = ordersChange,
                    Trend = ordersChange >= 0 ? "up" : "down"
                },
                CustomerGrowth = new
                {
                    ThisMonth = thisMonthCustomers,
                    LastMonth = lastMonthCustomers,
                    ChangePercent = customerChange,
                    Trend = customerChange >= 0 ? "up" : "down"
                }
            }));
        }

        // GET /api/Reports/partrequests
        [HttpGet("partrequests")]
        public async Task<IActionResult> GetCustomerPartRequests()
        {
            var requests = await _context.PartRequests
                .Include(pr => pr.Customer)
                .OrderByDescending(pr => pr.CreatedAt)
                .Select(pr => new
                {
                    pr.Id,
                    CustomerName = pr.Customer!.FullName,
                    CustomerEmail = pr.Customer.Email,
                    pr.PartName,
                    pr.VehicleMakeModel,
                    pr.Description,
                    pr.Status,
                    pr.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Customer part requests retrieved", requests));
        }

        // GET /api/Reports/reviews
        [HttpGet("reviews")]
        public async Task<IActionResult> GetCustomerReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Customer)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    CustomerName = r.Customer!.FullName,
                    CustomerEmail = r.Customer.Email,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Customer reviews retrieved", reviews));
        }
    }
}
