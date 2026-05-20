using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class VehicleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VehicleController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddVehicle([FromBody] CreateVehicleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid vehicle data"));

            var customer = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.CustomerId && u.Role == UserRole.Customer);
            if (customer == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var vehicle = new Vehicle
            {
                CustomerId = dto.CustomerId,
                Make = dto.Make,
                Model = dto.Model,
                LicensePlate = dto.LicensePlate,
                Year = dto.Year
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Vehicle added successfully", new { id = vehicle.Id }));
        }
    }
}
