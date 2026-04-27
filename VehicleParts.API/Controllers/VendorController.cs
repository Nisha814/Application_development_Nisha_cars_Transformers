using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class VendorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VendorController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetVendors()
        {
            var vendors = await _context.Vendors.ToListAsync();
            return Ok(ApiResponse<IEnumerable<Vendor>>.SuccessResponse("Vendors retrieved successfully", vendors));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVendor(int id)
        {
            var vendor = await _context.Vendors.FindAsync(id);

            if (vendor == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Vendor not found"));
            }

            return Ok(ApiResponse<Vendor>.SuccessResponse("Vendor retrieved successfully", vendor));
        }

        [HttpPost]
        public async Task<IActionResult> CreateVendor(VendorDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            var vendor = new Vendor
            {
                VendorName = dto.VendorName,
                ContactPerson = dto.ContactPerson,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address
            };

            _context.Vendors.Add(vendor);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Vendor added successfully", vendor));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVendor(int id, VendorDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            var vendor = await _context.Vendors.FindAsync(id);

            if (vendor == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Vendor not found"));
            }

            vendor.VendorName = dto.VendorName;
            vendor.ContactPerson = dto.ContactPerson;
            vendor.Email = dto.Email;
            vendor.PhoneNumber = dto.PhoneNumber;
            vendor.Address = dto.Address;

            _context.Entry(vendor).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Vendor updated successfully", vendor));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            var vendor = await _context.Vendors.FindAsync(id);
            if (vendor == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Vendor not found"));
            }

            _context.Vendors.Remove(vendor);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Vendor deleted successfully"));
        }
    }
}
