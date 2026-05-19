using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehicleParts.API.Data;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HealthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(ApiResponse<string>.SuccessResponse("Backend is running successfully"));
        }

        [HttpGet("seed-admin")]
        public async Task<IActionResult> SeedAdmin()
        {
            var adminEmail = "admin@vehicleparts.com";
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == adminEmail);

            if (adminUser == null)
            {
                adminUser = new User
                {
                    FullName = "System Admin",
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"),
                    Role = UserRole.Admin,
                    PhoneNumber = "+9779800000000",
                    IsVerified = true
                };
                _context.Users.Add(adminUser);
            }
            else
            {
                adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123");
                adminUser.Role = UserRole.Admin;
                adminUser.IsVerified = true;
                _context.Users.Update(adminUser);
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Admin user 'admin@vehicleparts.com' is now ready with password 'Admin123'" });
        }
    }
}
