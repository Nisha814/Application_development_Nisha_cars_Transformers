using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehicleParts.API.Data;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var totalStaff = await _context.Users.CountAsync(u => u.Role == UserRole.Staff);
            var totalCustomers = await _context.Users.CountAsync(u => u.Role == UserRole.Customer);
            var totalVendors = await _context.Vendors.CountAsync();
            var pendingApprovals = await _context.Users.CountAsync(u => !u.IsVerified);
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);

            var data = new
            {
                totalStaff,
                totalCustomers,
                totalVendors,
                pendingApprovals,
                activeUsers,
                systemStatus = "Operational"
            };

            return Ok(new { success = true, message = "Stats fetched", data });
        }
    }
}
