using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Customer")]
    public class PortalController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public PortalController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private int GetCustomerId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return int.TryParse(idClaim, out int id) ? id : 0;
        }

        private async Task NotifyAsync(int customerId, string title, string message)
        {
            _context.CustomerNotifications.Add(new CustomerNotification
            {
                CustomerId = customerId,
                Title = title,
                Message = message
            });
            await _context.SaveChangesAsync();
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var customer = await _context.Users
                .Include(u => u.SalesInvoices)
                .Include(u => u.CustomerCredits)
                .Include(u => u.Vehicles)
                .FirstOrDefaultAsync(u => u.Id == customerId);

            if (customer == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Customer not found"));

            var upcomingAppointments = await _context.Appointments
                .Where(a => a.CustomerId == customerId && a.ServiceDate >= DateTime.UtcNow && a.Status != "Cancelled")
                .Include(a => a.Vehicle)
                .OrderBy(a => a.ServiceDate)
                .Take(3)
                .Select(a => new { a.Id, a.ServiceDate, a.ServiceType, a.Status, Vehicle = a.Vehicle == null ? null : a.Vehicle.Make + " " + a.Vehicle.Model })
                .ToListAsync();

            var recentSales = customer.SalesInvoices
                .OrderByDescending(s => s.Date)
                .Take(5)
                .Select(s => new { s.Id, s.Date, s.TotalAmount, s.PaymentStatus });

            var outstandingCredit = customer.CustomerCredits
                .Where(c => !c.IsPaid)
                .Sum(c => c.AmountDue);

            var unreadNotifications = await _context.CustomerNotifications
                .CountAsync(n => n.CustomerId == customerId && !n.IsRead);

            var result = new
            {
                TotalVehicles = customer.Vehicles.Count,
                OutstandingCredit = outstandingCredit,
                RecentPurchases = recentSales,
                UpcomingAppointments = upcomingAppointments,
                UnreadNotifications = unreadNotifications
            };

            return Ok(ApiResponse<object>.SuccessResponse("Dashboard loaded", result));
        }

        [HttpGet("service-center")]
        public IActionResult GetServiceCenter()
        {
            var center = _configuration.GetSection("ServiceCenter");
            var result = new
            {
                Name = center["Name"],
                Address = center["Address"],
                Phone = center["Phone"],
                Email = center["Email"],
                Hours = center["Hours"],
                Services = center["Services"]
            };
            return Ok(ApiResponse<object>.SuccessResponse("Service center info retrieved", result));
        }

        [HttpGet("service-history")]
        public async Task<IActionResult> GetServiceHistory()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var history = await _context.Appointments
                .Where(a => a.CustomerId == customerId && (a.Status == "Completed" || a.ServiceDate < DateTime.UtcNow))
                .Include(a => a.Vehicle)
                .OrderByDescending(a => a.ServiceDate)
                .Select(a => new
                {
                    a.Id,
                    a.ServiceDate,
                    a.ServiceType,
                    a.Status,
                    a.Notes,
                    Vehicle = a.Vehicle == null ? null : a.Vehicle.Make + " " + a.Vehicle.Model + " (" + a.Vehicle.LicensePlate + ")"
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Service history retrieved", history));
        }

        [HttpGet("purchases")]
        public async Task<IActionResult> GetPurchases()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var purchases = await _context.SalesInvoices
                .Where(s => s.CustomerId == customerId)
                .OrderByDescending(s => s.Date)
                .Select(s => new { s.Id, s.Date, s.TotalAmount, s.PaymentStatus })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Purchase history retrieved", purchases));
        }

        [HttpGet("pending-payments")]
        public async Task<IActionResult> GetPendingPayments()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var credits = await _context.CustomerCredits
                .Where(c => c.CustomerId == customerId && !c.IsPaid)
                .Include(c => c.SalesInvoice)
                .OrderBy(c => c.DueDate)
                .Select(c => new
                {
                    c.Id,
                    c.SalesInvoiceId,
                    c.AmountDue,
                    c.DueDate,
                    InvoiceDate = c.SalesInvoice != null ? c.SalesInvoice.Date : (DateTime?)null
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Pending payments retrieved", credits));
        }

        [HttpPost("pending-payments/{creditId}/pay")]
        public async Task<IActionResult> PayMyCredit(int creditId)
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var credit = await _context.CustomerCredits
                .FirstOrDefaultAsync(c => c.Id == creditId && c.CustomerId == customerId);

            if (credit == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Payment record not found"));

            if (credit.IsPaid)
                return BadRequest(ApiResponse<object>.ErrorResponse("This payment is already completed"));

            credit.IsPaid = true;
            credit.PaidDate = DateTime.UtcNow;

            var invoice = await _context.SalesInvoices.FindAsync(credit.SalesInvoiceId);
            if (invoice != null)
                invoice.PaymentStatus = "Paid";

            await _context.SaveChangesAsync();
            await NotifyAsync(customerId, "Payment received", $"Your payment for invoice #{credit.SalesInvoiceId} has been recorded.");

            return Ok(ApiResponse<object>.SuccessResponse("Payment recorded successfully"));
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var notifications = await _context.CustomerNotifications
                .Where(n => n.CustomerId == customerId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new { n.Id, n.Title, n.Message, n.IsRead, n.CreatedAt })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Notifications retrieved", notifications));
        }

        [HttpPost("notifications/{id}/read")]
        public async Task<IActionResult> MarkNotificationRead(int id)
        {
            var customerId = GetCustomerId();
            var notification = await _context.CustomerNotifications
                .FirstOrDefaultAsync(n => n.Id == id && n.CustomerId == customerId);

            if (notification == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Notification not found"));

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Notification marked as read"));
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var appointments = await _context.Appointments
                .Where(a => a.CustomerId == customerId)
                .Include(a => a.Vehicle)
                .OrderByDescending(a => a.ServiceDate)
                .Select(a => new
                {
                    a.Id,
                    a.ServiceDate,
                    a.ServiceType,
                    a.Status,
                    a.Notes,
                    Vehicle = a.Vehicle == null ? null : a.Vehicle.Make + " " + a.Vehicle.Model + " (" + a.Vehicle.LicensePlate + ")"
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Appointments retrieved", appointments));
        }

        [HttpPost("appointments")]
        public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentDto dto)
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            if (dto.VehicleId.HasValue)
            {
                var ownsVehicle = await _context.Vehicles
                    .AnyAsync(v => v.Id == dto.VehicleId && v.CustomerId == customerId);
                if (!ownsVehicle)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Vehicle not found on your account"));
            }

            var appointment = new Appointment
            {
                CustomerId = customerId,
                VehicleId = dto.VehicleId,
                ServiceDate = dto.ServiceDate.ToUniversalTime(),
                ServiceType = dto.ServiceType,
                Notes = dto.Notes ?? string.Empty
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            await NotifyAsync(customerId, "Appointment booked",
                $"Your {dto.ServiceType} appointment on {dto.ServiceDate:MMM dd, yyyy} is pending confirmation.");

            return Ok(ApiResponse<object>.SuccessResponse("Appointment booked successfully", new { id = appointment.Id }));
        }

        [HttpPut("appointments/{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] BookAppointmentDto dto)
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.CustomerId == customerId);

            if (appointment == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Appointment not found"));

            if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
                return BadRequest(ApiResponse<object>.ErrorResponse("Completed or cancelled appointments cannot be modified"));

            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data"));

            if (dto.VehicleId.HasValue)
            {
                var ownsVehicle = await _context.Vehicles
                    .AnyAsync(v => v.Id == dto.VehicleId && v.CustomerId == customerId);
                if (!ownsVehicle)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Vehicle not found on your account"));
            }

            appointment.VehicleId = dto.VehicleId;
            appointment.ServiceDate = dto.ServiceDate.ToUniversalTime();
            appointment.ServiceType = dto.ServiceType;
            appointment.Notes = dto.Notes ?? string.Empty;

            await _context.SaveChangesAsync();
            await NotifyAsync(customerId, "Appointment updated",
                $"Your appointment was rescheduled to {dto.ServiceDate:MMM dd, yyyy}.");

            return Ok(ApiResponse<object>.SuccessResponse("Appointment updated successfully"));
        }

        [HttpPost("appointments/{id}/cancel")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.CustomerId == customerId);

            if (appointment == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Appointment not found"));

            if (appointment.Status == "Completed")
                return BadRequest(ApiResponse<object>.ErrorResponse("Completed appointments cannot be cancelled"));

            appointment.Status = "Cancelled";
            await _context.SaveChangesAsync();
            await NotifyAsync(customerId, "Appointment cancelled",
                $"Your {appointment.ServiceType} appointment has been cancelled.");

            return Ok(ApiResponse<object>.SuccessResponse("Appointment cancelled successfully"));
        }

        [HttpPost("reviews")]
        public async Task<IActionResult> SubmitReview([FromBody] SubmitReviewDto dto)
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(ApiResponse<object>.ErrorResponse("Rating must be between 1 and 5"));

            var review = new Review
            {
                CustomerId = customerId,
                Rating = dto.Rating,
                Comment = dto.Comment ?? string.Empty
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            await NotifyAsync(customerId, "Review submitted", "Thank you for your feedback!");

            return Ok(ApiResponse<object>.SuccessResponse("Review submitted successfully", new { id = review.Id }));
        }

        [HttpGet("reviews")]
        public async Task<IActionResult> GetMyReviews()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var reviews = await _context.Reviews
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new { r.Id, r.Rating, r.Comment, r.CreatedAt })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Reviews retrieved", reviews));
        }

        [HttpPost("partrequests")]
        public async Task<IActionResult> SubmitPartRequest([FromBody] SubmitPartRequestDto dto)
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            if (string.IsNullOrWhiteSpace(dto.PartName))
                return BadRequest(ApiResponse<object>.ErrorResponse("Part name is required"));

            var request = new PartRequest
            {
                CustomerId = customerId,
                PartName = dto.PartName,
                VehicleMakeModel = dto.VehicleMakeModel ?? string.Empty,
                Description = dto.Description ?? string.Empty
            };

            _context.PartRequests.Add(request);
            await _context.SaveChangesAsync();
            await NotifyAsync(customerId, "Part request received",
                $"We received your request for \"{dto.PartName}\". We'll notify you when it's available.");

            return Ok(ApiResponse<object>.SuccessResponse("Part request submitted successfully", new { id = request.Id }));
        }

        [HttpGet("partrequests")]
        public async Task<IActionResult> GetMyPartRequests()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var requests = await _context.PartRequests
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new { r.Id, r.PartName, r.VehicleMakeModel, r.Description, r.Status, r.CreatedAt })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Part requests retrieved", requests));
        }

        [HttpGet("vehicles")]
        public async Task<IActionResult> GetMyVehicles()
        {
            var customerId = GetCustomerId();
            if (customerId == 0)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

            var vehicles = await _context.Vehicles
                .Where(v => v.CustomerId == customerId)
                .Select(v => new { v.Id, v.Make, v.Model, v.Year, v.LicensePlate })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Vehicles retrieved", vehicles));
        }
    }

    public class BookAppointmentDto
    {
        public int? VehicleId { get; set; }
        public DateTime ServiceDate { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class SubmitReviewDto
    {
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class SubmitPartRequestDto
    {
        public string PartName { get; set; } = string.Empty;
        public string? VehicleMakeModel { get; set; }
        public string? Description { get; set; }
    }
}
