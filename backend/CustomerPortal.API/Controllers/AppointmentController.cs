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
    public class AppointmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetAppointments()
        {
            var userId = GetUserId();
            var appointmentsList = await _context.Appointments
                .Where(a => a.CustomerId == userId)
                .ToListAsync();

            var appointments = appointmentsList
                .OrderByDescending(a => a.PreferredDate)
                .ThenByDescending(a => a.PreferredTime)
                .ToList();

            return Ok(appointments);
        }

        [HttpPost]
        public async Task<IActionResult> BookAppointment([FromBody] AppointmentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            if (!TimeSpan.TryParse(dto.PreferredTime, out var preferredTime))
            {
                return BadRequest(new { message = "Invalid time format. Please use HH:mm format." });
            }

            var appointment = new Appointment
            {
                CustomerId = userId,
                ServiceType = dto.ServiceType,
                VehicleInfo = dto.VehicleInfo,
                PreferredDate = DateTime.SpecifyKind(dto.PreferredDate.Date, DateTimeKind.Unspecified),
                PreferredTime = preferredTime,
                Status = "Pending",
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Create notification
            var notification = new CustomerNotification
            {
                CustomerId = userId,
                Title = "Appointment Booked",
                Message = $"Your appointment for '{dto.ServiceType}' on {dto.PreferredDate.ToString("yyyy-MM-dd")} at {dto.PreferredTime} has been submitted. Status: Pending.",
                Type = "appointment",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerNotifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(appointment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> RescheduleAppointment(int id, [FromBody] AppointmentUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.CustomerId == userId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found or not owned by you" });

            if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
                return BadRequest(new { message = "Cannot modify a completed or cancelled appointment" });

            if (!TimeSpan.TryParse(dto.PreferredTime, out var preferredTime))
            {
                return BadRequest(new { message = "Invalid time format. Please use HH:mm format." });
            }

            appointment.ServiceType = dto.ServiceType;
            appointment.VehicleInfo = dto.VehicleInfo;
            appointment.PreferredDate = DateTime.SpecifyKind(dto.PreferredDate.Date, DateTimeKind.Unspecified);
            appointment.PreferredTime = preferredTime;
            appointment.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            // Create notification
            var notification = new CustomerNotification
            {
                CustomerId = userId,
                Title = "Appointment Rescheduled",
                Message = $"Your appointment for '{dto.ServiceType}' was updated to {dto.PreferredDate.ToString("yyyy-MM-dd")} at {dto.PreferredTime}.",
                Type = "appointment",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerNotifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(appointment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var userId = GetUserId();
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.CustomerId == userId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found or not owned by you" });

            if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
                return BadRequest(new { message = "Appointment is already completed or cancelled" });

            appointment.Status = "Cancelled";
            await _context.SaveChangesAsync();

            // Create notification
            var notification = new CustomerNotification
            {
                CustomerId = userId,
                Title = "Appointment Cancelled",
                Message = $"Your appointment for '{appointment.ServiceType}' on {appointment.PreferredDate.ToString("yyyy-MM-dd")} has been cancelled.",
                Type = "appointment",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.CustomerNotifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment cancelled successfully" });
        }
    }
}
