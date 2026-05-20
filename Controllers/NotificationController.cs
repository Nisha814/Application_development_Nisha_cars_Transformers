using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.Models;
using VehicleParts.API.Services;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public NotificationController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out int id) ? id : 0;
        }

        // GET /api/Notification
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetUserId();
            var notifications = await _context.CustomerNotifications
                .Where(n => n.CustomerId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new { n.Id, n.Title, n.Message, n.IsRead, n.CreatedAt })
                .ToListAsync();

            var unreadCount = notifications.Count(n => !n.IsRead);

            return Ok(ApiResponse<object>.SuccessResponse("Notifications retrieved", new
            {
                UnreadCount = unreadCount,
                Items = notifications
            }));
        }

        // POST /api/Notification/{id}/read
        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetUserId();
            var notification = await _context.CustomerNotifications
                .FirstOrDefaultAsync(n => n.Id == id && n.CustomerId == userId);

            if (notification == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Notification not found"));

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Notification marked as read"));
        }

        // POST /api/Notification/read-all
        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserId();
            var unread = await _context.CustomerNotifications
                .Where(n => n.CustomerId == userId && !n.IsRead)
                .ToListAsync();

            unread.ForEach(n => n.IsRead = true);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse($"Marked {unread.Count} notifications as read"));
        }

        // POST /api/Notification/remind/{creditId}
        [HttpPost("remind/{creditId}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> SendReminderEmail(int creditId)
        {
            var credit = await _context.CustomerCredits
                .Include(c => c.Customer)
                .Include(c => c.SalesInvoice)
                .FirstOrDefaultAsync(c => c.Id == creditId);

            if (credit == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer credit record not found"));

            if (credit.IsPaid)
                return BadRequest(ApiResponse<object>.ErrorResponse("This invoice has already been paid"));

            var customer = credit.Customer;
            if (customer == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer details not found"));

            if (string.IsNullOrWhiteSpace(customer.Email) || !customer.Email.Contains("@") || !customer.Email.EndsWith("@gmail.com", System.StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse($"Invalid customer Gmail address: '{customer.Email}'. Only Gmail accounts (@gmail.com) are supported."));
            }

            if (!customer.IsVerified)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse($"Customer email verification status is pending. Reminder emails cannot be sent."));
            }

            try
            {
                await _emailService.SendPaymentReminderEmailAsync(
                    customer.Email,
                    customer.FullName,
                    credit.SalesInvoiceId,
                    credit.AmountDue,
                    credit.DueDate
                );

                _context.CustomerNotifications.Add(new CustomerNotification
                {
                    CustomerId = customer.Id,
                    Title = "Payment Reminder Email Sent",
                    Message = $"A payment reminder email has been sent to your email ({customer.Email}) for invoice #{credit.SalesInvoiceId} of ${credit.AmountDue:F2} due on {credit.DueDate:yyyy-MM-dd}."
                });

                await _context.SaveChangesAsync();

                return Ok(ApiResponse<object>.SuccessResponse("Reminder email sent successfully"));
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Failed to send email: {ex.Message}"));
            }
        }

        // POST /api/Notification/remind-all-overdue
        [HttpPost("remind-all-overdue")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> SendAllOverdueReminders()
        {
            var overdueCredits = await _context.CustomerCredits
                .Include(c => c.Customer)
                .Include(c => c.SalesInvoice)
                .Where(c => !c.IsPaid && c.DueDate < System.DateTime.UtcNow)
                .ToListAsync();

            if (overdueCredits.Count == 0)
                return Ok(ApiResponse<object>.SuccessResponse("No overdue credits found to remind"));

            int successCount = 0;
            int failCount = 0;

            foreach (var credit in overdueCredits)
            {
                var customer = credit.Customer;
                if (customer == null || 
                    string.IsNullOrWhiteSpace(customer.Email) || 
                    !customer.Email.Contains("@") || 
                    !customer.Email.EndsWith("@gmail.com", System.StringComparison.OrdinalIgnoreCase) || 
                    !customer.IsVerified)
                {
                    failCount++;
                    continue;
                }

                try
                {
                    await _emailService.SendPaymentReminderEmailAsync(
                        customer.Email,
                        customer.FullName,
                        credit.SalesInvoiceId,
                        credit.AmountDue,
                        credit.DueDate
                    );

                    _context.CustomerNotifications.Add(new CustomerNotification
                    {
                        CustomerId = customer.Id,
                        Title = "Payment Reminder Email Sent",
                        Message = $"An automated payment reminder email was sent to {customer.Email} for overdue invoice #{credit.SalesInvoiceId}."
                    });

                    successCount++;
                }
                catch
                {
                    failCount++;
                }
            }

            if (successCount > 0)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(ApiResponse<object>.SuccessResponse($"Overdue reminders processed. Sent: {successCount}, Failed: {failCount}"));
        }
    }
}
