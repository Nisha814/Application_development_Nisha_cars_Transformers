using System;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerPortal.API.Data;
using CustomerPortal.API.Models;

namespace CustomerPortal.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceHistoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceHistoryController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetServiceHistory()
        {
            var userId = GetUserId();
            var history = await _context.ServiceHistories
                .Where(h => h.CustomerId == userId)
                .OrderByDescending(h => h.ServiceDate)
                .ToListAsync();

            if (history.Count == 0)
            {
                // Seed mock service history for a newly registered customer
                var sample1 = new ServiceHistory
                {
                    CustomerId = userId,
                    ServiceType = "Full Tune-Up & Oil Change",
                    VehicleInfo = "Tesla Model 3 2022 (Plate: AA-1234)",
                    ServiceDate = DateTime.UtcNow.AddMonths(-2).Date,
                    TechnicianName = "John Doe",
                    Cost = 189.99m,
                    Status = "Completed",
                    Notes = "Replaced cabin air filters, topped off windshield wiper fluid, checked tire wear and adjusted pressure, ran onboard battery diagnostics (health status 98%)."
                };

                var sample2 = new ServiceHistory
                {
                    CustomerId = userId,
                    ServiceType = "Wheel Alignment & Balancing",
                    VehicleInfo = "Tesla Model 3 2022 (Plate: AA-1234)",
                    ServiceDate = DateTime.UtcNow.AddMonths(-5).Date,
                    TechnicianName = "Jane Smith",
                    Cost = 120.00m,
                    Status = "Completed",
                    Notes = "Performed 4-wheel electronic alignment. Re-balanced front and rear tires. Corrected minor right-drift issue."
                };

                _context.ServiceHistories.AddRange(sample1, sample2);
                await _context.SaveChangesAsync();

                history = new List<ServiceHistory> { sample1, sample2 };
            }

            return Ok(history);
        }
    }
}
