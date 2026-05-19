using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using CustomerPortal.API.Data;
using CustomerPortal.API.DTOs;
using CustomerPortal.API.Models;

namespace CustomerPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var emailExists = await _context.CustomerAccounts.AnyAsync(c => c.Email.ToLower() == request.Email.ToLower());
            if (emailExists)
                return BadRequest(new { message = "Email is already registered" });

            var customer = new CustomerAccount
            {
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Address = request.Address,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.CustomerAccounts.Add(customer);
            await _context.SaveChangesAsync();

            // Create welcome notification
            var notification = new CustomerNotification
            {
                CustomerId = customer.Id,
                Title = "Welcome to The Nisha Cars Transformers",
                Message = $"Hello {customer.FullName}! Thank you for registering with us. You can now book services, track purchases, and request parts.",
                Type = "general",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerNotifications.Add(notification);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(customer);

            return Ok(new AuthResponse
            {
                Token = token,
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customer = await _context.CustomerAccounts
                .FirstOrDefaultAsync(c => c.Email.ToLower() == request.Email.ToLower() && c.IsActive);

            if (customer == null || !BCrypt.Net.BCrypt.Verify(request.Password, customer.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password" });

            var token = GenerateJwtToken(customer);

            return Ok(new AuthResponse
            {
                Token = token,
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email
            });
        }

        private string GenerateJwtToken(CustomerAccount customer)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings.GetValue<string>("Secret") ?? "DefaultSuperSecretKeyThatIsVeryLongAndSecure123!";
            var issuer = jwtSettings.GetValue<string>("Issuer");
            var audience = jwtSettings.GetValue<string>("Audience");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
                new Claim(ClaimTypes.Name, customer.FullName),
                new Claim(ClaimTypes.Email, customer.Email),
                new Claim(ClaimTypes.Role, "Customer")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
