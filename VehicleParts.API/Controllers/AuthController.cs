using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;
using VehicleParts.API.Services;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System;
using System.Linq;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(AppDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (existingUser != null)
            {
                if (existingUser.IsVerified)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Email already exists and is verified. Please log in."));
                }
                
                // If not verified, we'll delete the old record or just update it.
                // For simplicity, let's remove the old unverified record to allow a fresh start.
                _context.Users.Remove(existingUser);
                await _context.SaveChangesAsync();
            }

            var otp = new Random().Next(100000, 999999).ToString();
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = passwordHash,
                Role = UserRole.Customer,
                IsVerified = false,
                OtpCode = otp,
                OtpExpiry = DateTime.UtcNow.AddMinutes(10)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendOtpEmailAsync(user.Email, otp);
                return Ok(ApiResponse<object>.SuccessResponse("Registration successful. Please check your email for the verification code.", new { email = user.Email }));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("User registered, but failed to send verification email. Please contact support."));
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            
            if (user == null)
                return NotFound(ApiResponse<object>.ErrorResponse("User not found"));

            if (user.IsVerified)
                return BadRequest(ApiResponse<object>.ErrorResponse("Account is already verified"));

            if (user.OtpCode != dto.OtpCode || user.OtpExpiry < DateTime.UtcNow)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid or expired OTP code"));

            user.IsVerified = true;
            user.OtpCode = null;
            user.OtpExpiry = null;
            
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Account verified successfully! You can now log in."));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid email or password"));
            }

            // ABSOLUTE BYPASS: Main Admin account never needs verification
            if (!user.IsVerified && user.Role != UserRole.Admin && user.Email.ToLower() != "admin@vehicleparts.com")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Your account is not verified. Please check your email for the OTP."));
            }

            if (!user.IsActive)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Your account has been deactivated. Please contact support."));
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(ApiResponse<object>.SuccessResponse("Login successful", new
            {
                token = tokenString,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role.ToString(),
                profilePictureUrl = user.ProfilePictureUrl
            }));
        }
    }

    public class VerifyOtpDto
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }
}
