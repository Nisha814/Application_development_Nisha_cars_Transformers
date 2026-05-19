using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehicleParts.API.Data;
using System.Threading.Tasks;
using System.Linq;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/database-test")]
    public class DatabaseTestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DatabaseTestController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (await _context.Database.CanConnectAsync())
            {
                return Ok(ApiResponse<string>.SuccessResponse("Database connection works successfully"));
            }

            return StatusCode(500, ApiResponse<string>.ErrorResponse("Database connection failed"));
        }

        [HttpGet("list-users")]
        public async Task<IActionResult> ListUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.FullName, u.Email, u.IsVerified, u.OtpCode, u.Role, u.PasswordHash })
                .ToListAsync();
            return Ok(ApiResponse<object>.SuccessResponse("Users list retrieved", users));
        }

        [HttpPost("delete-user")]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("User not found"));
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.SuccessResponse($"User with email {dto.Email} deleted successfully"));
        }

        [HttpPost("verify-user")]
        public async Task<IActionResult> VerifyUser([FromBody] VerifyUserDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("User not found"));
            }

            user.IsVerified = true;
            user.OtpCode = null;
            user.OtpExpiry = null;
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.SuccessResponse($"User with email {dto.Email} force-verified successfully"));
        }
    }

    public class DeleteUserDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyUserDto
    {
        public string Email { get; set; } = string.Empty;
    }
}
