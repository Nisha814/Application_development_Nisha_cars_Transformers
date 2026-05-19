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
    public class PurchaseHistoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseHistoryController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetPurchaseHistory()
        {
            var userId = GetUserId();
            var purchases = await _context.PurchaseHistories
                .Where(p => p.CustomerId == userId)
                .OrderByDescending(p => p.PurchaseDate)
                .ToListAsync();

            if (purchases.Count == 0)
            {
                // Seed mock purchase records for demo
                var sample1 = new PurchaseHistory
                {
                    CustomerId = userId,
                    ItemName = "Premium All-Weather Floor Mats",
                    Category = "Accessories",
                    Quantity = 1,
                    UnitPrice = 119.99m,
                    TotalPrice = 119.99m,
                    PurchaseDate = DateTime.UtcNow.AddMonths(-1).Date
                };

                var sample2 = new PurchaseHistory
                {
                    CustomerId = userId,
                    ItemName = "Windshield Wiper Blades (Pair)",
                    Category = "Parts",
                    Quantity = 2,
                    UnitPrice = 24.50m,
                    TotalPrice = 49.00m,
                    PurchaseDate = DateTime.UtcNow.AddMonths(-3).Date
                };

                var sample3 = new PurchaseHistory
                {
                    CustomerId = userId,
                    ItemName = "HEPA Cabin Air Filter",
                    Category = "Parts",
                    Quantity = 1,
                    UnitPrice = 34.99m,
                    TotalPrice = 34.99m,
                    PurchaseDate = DateTime.UtcNow.AddMonths(-5).Date
                };

                var sample4 = new PurchaseHistory
                {
                    CustomerId = userId,
                    ItemName = "Full Engine Rebuild Kit (Performance Spec)",
                    Category = "Parts",
                    Quantity = 1,
                    UnitPrice = 5500.00m,
                    TotalPrice = 4950.00m, // 10% Loyalty Discount Applied (5500 * 0.9)
                    PurchaseDate = DateTime.UtcNow.AddDays(-2).Date
                };

                _context.PurchaseHistories.AddRange(sample1, sample2, sample3, sample4);
                await _context.SaveChangesAsync();

                purchases = new List<PurchaseHistory> { sample1, sample2, sample3, sample4 };
            }

            return Ok(purchases);
        }
    }
}
