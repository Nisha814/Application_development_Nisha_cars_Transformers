using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StaffSalesAPI.Data;
using StaffSalesAPI.DTOs;
using StaffSalesAPI.Models;

namespace StaffSalesAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/customers?search=John
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerResponseDto>>> GetCustomers([FromQuery] string? search)
        {
            var query = _context.Customers
                .Include(c => c.Credit)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(c => 
                    c.FullName.ToLower().Contains(lowerSearch) ||
                    c.Email.ToLower().Contains(lowerSearch) ||
                    c.PhoneNumber.Contains(lowerSearch)
                );
            }

            var customers = await query.ToListAsync();

            var response = customers.Select(c => new CustomerResponseDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Email = c.Email,
                PhoneNumber = c.PhoneNumber,
                Address = c.Address,
                TotalCreditLimit = c.Credit?.TotalCreditLimit ?? 0,
                CurrentBalance = c.Credit?.CurrentBalance ?? 0,
                CreatedAt = c.CreatedAt
            });

            return Ok(response);
        }

        // GET: api/customers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerResponseDto>> GetCustomer(int id)
        {
            var customer = await _context.Customers
                .Include(c => c.Credit)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
            {
                return NotFound("Customer not found.");
            }

            return Ok(new CustomerResponseDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber,
                Address = customer.Address,
                TotalCreditLimit = customer.Credit?.TotalCreditLimit ?? 0,
                CurrentBalance = customer.Credit?.CurrentBalance ?? 0,
                CreatedAt = customer.CreatedAt
            });
        }

        // GET: api/customers/5/vehicles
        [HttpGet("{id}/vehicles")]
        public async Task<ActionResult<IEnumerable<VehicleResponseDto>>> GetCustomerVehicles(int id)
        {
            var customerExists = await _context.Customers.AnyAsync(c => c.Id == id);
            if (!customerExists)
            {
                return NotFound("Customer not found.");
            }

            var vehicles = await _context.Vehicles
                .Where(v => v.CustomerId == id)
                .ToListAsync();

            var response = vehicles.Select(v => new VehicleResponseDto
            {
                Id = v.Id,
                CustomerId = v.CustomerId,
                Make = v.Make,
                Model = v.Model,
                Year = v.Year,
                LicensePlate = v.LicensePlate,
                VIN = v.VIN
            });

            return Ok(response);
        }

        // POST: api/customers
        [HttpPost]
        public async Task<ActionResult<CustomerResponseDto>> CreateCustomer([FromBody] CustomerCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest("Full Name and Email are required.");
            }

            // Create Customer
            var customer = new Customer
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // Set up customer credit record (default limit of $1000 if not specified)
            var limit = dto.InitialCreditLimit ?? 1000.00m;
            var credit = new CustomerCredit
            {
                CustomerId = customer.Id,
                TotalCreditLimit = limit,
                CurrentBalance = 0.00m,
                LastUpdated = DateTime.UtcNow
            };

            _context.CustomerCredits.Add(credit);
            await _context.SaveChangesAsync();

            var response = new CustomerResponseDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber,
                Address = customer.Address,
                TotalCreditLimit = limit,
                CurrentBalance = 0.00m,
                CreatedAt = customer.CreatedAt
            };

            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, response);
        }
    }
}
