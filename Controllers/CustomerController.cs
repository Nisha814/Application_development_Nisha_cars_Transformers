using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    public class RegisterCustomerDto {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = "Temp123!"; // Give default temp password
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")] // Assuming staff and admin can manage customers
    public class CustomerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CustomerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _context.Users
                .Where(u => u.Role == UserRole.Customer)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.IsVerified,
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Customers retrieved successfully", customers));
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchCustomers([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
                return BadRequest(ApiResponse<object>.ErrorResponse("Search term is required"));

            var customers = await _context.Users
                .Where(u => u.Role == UserRole.Customer && 
                           (u.FullName.ToLower().Contains(term.ToLower()) || 
                            (u.PhoneNumber != null && u.PhoneNumber.Contains(term)) ||
                            u.Email.ToLower().Contains(term.ToLower())))
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Customers found", customers));
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetCustomerHistory(int id)
        {
            var customer = await _context.Users
                .Include(u => u.SalesInvoices)
                .Include(u => u.CustomerCredits)
                .Include(u => u.Vehicles)
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Customer);

            if (customer == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var history = new
            {
                Customer = new { customer.Id, customer.FullName, customer.Email, customer.PhoneNumber },
                Vehicles = customer.Vehicles.Select(v => new { v.Id, v.Make, v.Model, v.LicensePlate }),
                Sales = customer.SalesInvoices.OrderByDescending(s => s.Date).Select(s => new { s.Id, s.Date, s.TotalAmount, s.PaymentStatus }),
                Credits = customer.CustomerCredits.Select(c => new { c.Id, c.SalesInvoiceId, c.AmountDue, c.DueDate, c.IsPaid, c.PaidDate })
            };

            return Ok(ApiResponse<object>.SuccessResponse("Customer history retrieved successfully", history));
        }

        [HttpPost]
        public async Task<IActionResult> RegisterCustomer([FromBody] RegisterCustomerDto dto)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (existingUser != null)
                return BadRequest(ApiResponse<object>.ErrorResponse("Email already exists"));

            var newCustomer = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.Customer,
                IsVerified = true // Auto verify if staff creates
            };

            _context.Users.Add(newCustomer);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Customer registered successfully", new { id = newCustomer.Id }));
        }
    }
}
