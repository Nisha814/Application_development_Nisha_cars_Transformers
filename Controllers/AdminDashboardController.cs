using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminDashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardOverview()
        {
            var now = System.DateTime.UtcNow;

            var totalUsers = await _context.Users.CountAsync();
            var totalAdmins = await _context.Users.CountAsync(u => u.Role == UserRole.Admin);
            var totalStaff = await _context.Users.CountAsync(u => u.Role == UserRole.Staff);
            var totalCustomers = await _context.Users.CountAsync(u => u.Role == UserRole.Customer);

            var totalRevenue = await _context.SalesInvoices.SumAsync(i => i.TotalAmount);
            var thisMonthRevenue = await _context.SalesInvoices
                .Where(i => i.Date.Year == now.Year && i.Date.Month == now.Month)
                .SumAsync(i => i.TotalAmount);

            var totalInvoices = await _context.SalesInvoices.CountAsync();
            var pendingCredits = await _context.CustomerCredits.CountAsync(c => !c.IsPaid);
            var totalOutstanding = await _context.CustomerCredits.Where(c => !c.IsPaid).SumAsync(c => c.AmountDue);

            var newCustomersThisWeek = await _context.Users
                .CountAsync(u => u.Role == UserRole.Customer && u.CreatedAt >= now.AddDays(-7));

            return Ok(ApiResponse<object>.SuccessResponse("Dashboard data retrieved successfully", new
            {
                totalUsers,
                totalAdmins,
                totalStaff,
                totalCustomers,
                totalRevenue,
                thisMonthRevenue,
                totalInvoices,
                pendingCredits,
                totalOutstanding,
                newCustomersThisWeek
            }));
        }
    }
}
