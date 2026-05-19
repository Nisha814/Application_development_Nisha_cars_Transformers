using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using CustomerPortal.API.Data;
using CustomerPortal.API.DTOs;
using CustomerPortal.API.Models;

namespace CustomerPortal.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CustomerController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            var customer = await _context.CustomerAccounts.FindAsync(userId);
            
            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            return Ok(new
            {
                customer.Id,
                customer.FullName,
                customer.Email,
                customer.Phone,
                customer.Address,
                customer.ProfileImageUrl,
                customer.CreatedAt
            });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var customer = await _context.CustomerAccounts.FindAsync(userId);
            
            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            customer.FullName = request.FullName;
            customer.Phone = request.Phone;
            customer.Address = request.Address;
            customer.ProfileImageUrl = request.ProfileImageUrl;
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully", customer = new {
                customer.FullName,
                customer.Phone,
                customer.Address,
                customer.ProfileImageUrl
            }});
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var customer = await _context.CustomerAccounts.FindAsync(userId);
            
            if (customer == null)
                return NotFound(new { message = "Customer not found" });

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, customer.PasswordHash))
                return BadRequest(new { message = "Incorrect current password" });

            customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            customer.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }
    }
}
