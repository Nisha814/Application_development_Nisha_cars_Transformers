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
    public class ReviewController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetReviews()
        {
            var userId = GetUserId();
            var reviews = await _context.Reviews
                .Where(r => r.CustomerId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost]
        public async Task<IActionResult> SubmitReview([FromBody] ReviewCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            var review = new Review
            {
                CustomerId = userId,
                Rating = dto.Rating,
                Title = dto.Title,
                Comment = dto.Comment,
                ServiceType = dto.ServiceType,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Create notification
            var notification = new CustomerNotification
            {
                CustomerId = userId,
                Title = "Review Submitted",
                Message = $"Thank you for sharing your feedback on '{dto.ServiceType}'. We appreciate your {dto.Rating}-star review!",
                Type = "review",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerNotifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(review);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditReview(int id, [FromBody] ReviewCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == id && r.CustomerId == userId);

            if (review == null)
                return NotFound(new { message = "Review not found or not owned by you" });

            review.Rating = dto.Rating;
            review.Title = dto.Title;
            review.Comment = dto.Comment;
            review.ServiceType = dto.ServiceType;

            await _context.SaveChangesAsync();

            return Ok(review);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = GetUserId();
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == id && r.CustomerId == userId);

            if (review == null)
                return NotFound(new { message = "Review not found or not owned by you" });

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review deleted successfully" });
        }
    }
}
