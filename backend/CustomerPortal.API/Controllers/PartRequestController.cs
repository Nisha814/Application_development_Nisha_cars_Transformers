using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerPortal.API.Data;
using CustomerPortal.API.DTOs;
using CustomerPortal.API.Models;

namespace CustomerPortal.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PartRequestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartRequestController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetPartRequests()
        {
            var userId = GetUserId();
            var requests = await _context.PartRequests
                .Where(r => r.CustomerId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost]
        public async Task<IActionResult> SubmitPartRequest([FromBody] PartRequestCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            var request = new PartRequest
            {
                CustomerId = userId,
                PartName = dto.PartName,
                VehicleInfo = dto.VehicleInfo,
                Urgency = dto.Urgency,
                Description = dto.Description,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.PartRequests.Add(request);
            await _context.SaveChangesAsync();

            // Create notification
            var notification = new CustomerNotification
            {
                CustomerId = userId,
                Title = "Part Request Submitted",
                Message = $"Your request for part '{dto.PartName}' has been received. Our team will start sourcing it.",
                Type = "part",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerNotifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(request);
        }
    }
}
