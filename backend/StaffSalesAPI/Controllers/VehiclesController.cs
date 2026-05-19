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
    public class VehiclesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VehiclesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/vehicles?search=Camry
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleResponseDto>>> GetVehicles([FromQuery] string? search)
        {
            var query = _context.Vehicles
                .Include(v => v.Customer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(v => 
                    v.Make.ToLower().Contains(lowerSearch) ||
                    v.Model.ToLower().Contains(lowerSearch) ||
                    v.LicensePlate.ToLower().Contains(lowerSearch)
                );
            }

            var vehicles = await query.ToListAsync();

            var response = vehicles.Select(v => new VehicleResponseDto
            {
                Id = v.Id,
                CustomerId = v.CustomerId,
                CustomerName = v.Customer?.FullName ?? "Unknown Customer",
                Make = v.Make,
                Model = v.Model,
                Year = v.Year,
                LicensePlate = v.LicensePlate,
                VIN = v.VIN
            });

            return Ok(response);
        }

        // POST: api/vehicles
        [HttpPost]
        public async Task<ActionResult<VehicleResponseDto>> CreateVehicle([FromBody] VehicleCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Make) || string.IsNullOrWhiteSpace(dto.Model) || string.IsNullOrWhiteSpace(dto.LicensePlate))
            {
                return BadRequest("Make, Model, and License Plate are required.");
            }

            // Verify customer exists
            var customer = await _context.Customers.FindAsync(dto.CustomerId);
            if (customer == null)
            {
                return BadRequest("Invalid Customer ID. Customer does not exist.");
            }

            var vehicle = new Vehicle
            {
                CustomerId = dto.CustomerId,
                Make = dto.Make,
                Model = dto.Model,
                Year = dto.Year,
                LicensePlate = dto.LicensePlate,
                VIN = dto.VIN,
                CreatedAt = DateTime.UtcNow
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            var response = new VehicleResponseDto
            {
                Id = vehicle.Id,
                CustomerId = vehicle.CustomerId,
                CustomerName = customer.FullName,
                Make = vehicle.Make,
                Model = vehicle.Model,
                Year = vehicle.Year,
                LicensePlate = vehicle.LicensePlate,
                VIN = vehicle.VIN
            };

            return CreatedAtAction(nameof(GetVehicles), new { search = vehicle.LicensePlate }, response);
        }
    }
}
