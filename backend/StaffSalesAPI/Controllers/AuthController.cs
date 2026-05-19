using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StaffSalesAPI.Data;
using StaffSalesAPI.DTOs;
using StaffSalesAPI.Models;
using StaffSalesAPI.Services;

namespace StaffSalesAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public AuthController(ApplicationDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new LoginResponse
                {
                    Success = false,
                    Message = "Username and password are required."
                });
            }

            var staff = await _context.Staffs.FirstOrDefaultAsync(s => s.Username.ToLower() == request.Username.ToLower());
            if (staff == null)
            {
                return Unauthorized(new LoginResponse
                {
                    Success = false,
                    Message = "Invalid username or password."
                });
            }

            var isValid = _passwordHasher.VerifyPassword(request.Password, staff.PasswordHash);
            if (!isValid)
            {
                return Unauthorized(new LoginResponse
                {
                    Success = false,
                    Message = "Invalid username or password."
                });
            }

            return Ok(new LoginResponse
            {
                Success = true,
                Message = "Login successful.",
                User = new UserDetailsDto
                {
                    Id = staff.Id,
                    Username = staff.Username,
                    FullName = staff.FullName,
                    Role = staff.Role
                }
            });
        }

        // Optional check session endpoint to verify current status
        [HttpGet("profile/{id}")]
        public async Task<ActionResult<UserDetailsDto>> GetProfile(int id)
        {
            var staff = await _context.Staffs.FindAsync(id);
            if (staff == null)
            {
                return NotFound("Staff member not found.");
            }

            return Ok(new UserDetailsDto
            {
                Id = staff.Id,
                Username = staff.Username,
                FullName = staff.FullName,
                Role = staff.Role
            });
        }
    }
}
