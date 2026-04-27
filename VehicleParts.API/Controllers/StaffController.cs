using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;
using BCrypt.Net;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class StaffController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StaffController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStaff()
        {
            var staffList = await _context.Users
                .Where(u => u.Role == UserRole.Staff)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Staff members retrieved successfully", staffList));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _context.Users
                .Where(u => u.Id == id && u.Role == UserRole.Staff)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (staff == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Staff member not found"));
            }

            return Ok(ApiResponse<object>.SuccessResponse("Staff member retrieved successfully", staff));
        }

        [HttpPost]
        public async Task<IActionResult> AddStaff([FromBody] CreateStaffDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (existingUser != null)
                return BadRequest(ApiResponse<object>.ErrorResponse("Email already exists"));

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newStaff = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = passwordHash,
                Role = UserRole.Staff
            };

            _context.Users.Add(newStaff);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Staff member added successfully", new { id = newStaff.Id }));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            var staff = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Staff);
            if (staff == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Staff member not found"));

            staff.FullName = dto.FullName;
            staff.PhoneNumber = dto.PhoneNumber;

            _context.Users.Update(staff);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Staff member updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            var staff = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Staff);
            if (staff == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Staff member not found"));

            _context.Users.Remove(staff);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Staff member deleted successfully"));
        }

        [HttpPost("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(ApiResponse<object>.ErrorResponse("User not found"));

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse($"Account {(user.IsActive ? "Activated" : "Deactivated")} successfully", new { isActive = user.IsActive }));
        }
    }
}
