using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.DTOs;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class PartsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetParts()
        {
            var parts = await _context.Parts
                .Include(p => p.Vendor)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<Part>>.SuccessResponse("Parts inventory retrieved successfully", parts));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPart(int id)
        {
            var part = await _context.Parts
                .Include(p => p.Vendor)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (part == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Part not found"));
            }

            return Ok(ApiResponse<Part>.SuccessResponse("Part retrieved successfully", part));
        }

        [HttpPost]
        public async Task<IActionResult> CreatePart(CreatePartDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            // Check if SKU is unique
            var skuExists = await _context.Parts.AnyAsync(p => p.SKU.ToLower() == dto.SKU.ToLower());
            if (skuExists)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("A part with this SKU already exists in inventory"));
            }

            // Verify Vendor exists
            var vendorExists = await _context.Vendors.AnyAsync(v => v.Id == dto.VendorId);
            if (!vendorExists)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Selected supplier (Vendor) does not exist"));
            }

            var part = new Part
            {
                PartName = dto.PartName,
                SKU = dto.SKU,
                Category = dto.Category,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                VendorId = dto.VendorId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Parts.Add(part);
            await _context.SaveChangesAsync();

            // Load Vendor before returning
            await _context.Entry(part).Reference(p => p.Vendor).LoadAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Part added to inventory successfully", part));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePart(int id, UpdatePartDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ApiResponse<object>.ErrorResponse(errors));
            }

            var part = await _context.Parts.FindAsync(id);
            if (part == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Part not found"));
            }

            // Check if SKU is used by another part
            var skuExists = await _context.Parts.AnyAsync(p => p.Id != id && p.SKU.ToLower() == dto.SKU.ToLower());
            if (skuExists)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("A part with this SKU already exists in inventory"));
            }

            // Verify Vendor exists
            var vendorExists = await _context.Vendors.AnyAsync(v => v.Id == dto.VendorId);
            if (!vendorExists)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Selected supplier (Vendor) does not exist"));
            }

            part.PartName = dto.PartName;
            part.SKU = dto.SKU;
            part.Category = dto.Category;
            part.Price = dto.Price;
            part.StockQuantity = dto.StockQuantity;
            part.VendorId = dto.VendorId;

            _context.Entry(part).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Load Vendor before returning
            await _context.Entry(part).Reference(p => p.Vendor).LoadAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Part updated successfully", part));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePart(int id)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Part not found"));
            }

            _context.Parts.Remove(part);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Part deleted successfully from inventory"));
        }
    }
}
