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
            var totalUsers = await _context.Users.CountAsync();
            var totalAdmins = await _context.Users.CountAsync(u => u.Role == UserRole.Admin);
            var totalStaff = await _context.Users.CountAsync(u => u.Role == UserRole.Staff);
            var totalCustomers = await _context.Users.CountAsync(u => u.Role == UserRole.Customer);

            return Ok(ApiResponse<object>.SuccessResponse("Dashboard data retrieved successfully", new
            {
                totalUsers,
                totalAdmins,
                totalStaff,
                totalCustomers
            }));
        }
    }
}
