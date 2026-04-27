using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using System.IdentityModel.Tokens.Jwt;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfileController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            // Extract the user ID from the JWT token
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token claims"));
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("User not found"));
            }

            // Update only allowed fields
            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.ProfilePictureUrl = dto.ProfilePictureUrl;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Profile updated successfully", new { 
                user.Id, 
                user.FullName, 
                user.Email, 
                user.PhoneNumber, 
                user.Role,
                user.ProfilePictureUrl
            }));
        }
    }
}
