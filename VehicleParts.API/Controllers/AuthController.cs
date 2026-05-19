using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
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

            // Log OTP to console for easy development diagnostics
            Console.WriteLine($"\n==================================================");
            Console.WriteLine($"[DIAGNOSTICS] Generated OTP for {user.Email}: {otp}");
            Console.WriteLine($"==================================================\n");

            // Dispatch SMTP email in the background to prevent blocking the HTTP response thread
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendOtpEmailAsync(user.Email, otp);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] Background email dispatch failed for {user.Email}: {ex.Message}");
                }
            });

            return Ok(ApiResponse<object>.SuccessResponse("Registration successful. Please check your email for the verification code.", new { email = user.Email }));
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

            // ABSOLUTE BYPASS: Main Admin and Staff accounts never need verification
            if (!user.IsVerified && user.Role != UserRole.Admin && user.Role != UserRole.Staff && user.Email.ToLower() != "admin@vehicleparts.com")
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Your account is not verified. Please check your email for the OTP."));
            }

            // Set user status to active (logged in)
            user.IsActive = true;
            await _context.SaveChangesAsync();

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

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("User not found"));
            }

            if (user.IsVerified)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Account is already verified. Please log in."));
            }

            var otp = new Random().Next(100000, 999999).ToString();
            user.OtpCode = otp;
            user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);

            await _context.SaveChangesAsync();

            // Log OTP to console for easy development diagnostics
            Console.WriteLine($"\n==================================================");
            Console.WriteLine($"[DIAGNOSTICS] Resent OTP for {user.Email}: {otp}");
            Console.WriteLine($"==================================================\n");

            // Dispatch SMTP email in the background to prevent blocking the HTTP response thread
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendOtpEmailAsync(user.Email, otp);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] Background email dispatch failed for {user.Email}: {ex.Message}");
                }
            });

            return Ok(ApiResponse<object>.SuccessResponse("A new OTP verification code has been sent to your email."));
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value 
                             ?? User.FindFirst(JwtRegisteredClaimNames.Email)?.Value;

            if (string.IsNullOrEmpty(emailClaim))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid user context"));
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailClaim.ToLower());
            if (user != null)
            {
                user.IsActive = false;
                await _context.SaveChangesAsync();
            }

            return Ok(ApiResponse<object>.SuccessResponse("Logged out successfully"));
        }
    }

    public class VerifyOtpDto
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }

    public class ResendOtpDto
    {
        public string Email { get; set; } = string.Empty;
    }
}
