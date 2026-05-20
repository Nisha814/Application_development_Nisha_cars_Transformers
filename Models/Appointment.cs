using System;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }
        public User? Customer { get; set; }

        public int? VehicleId { get; set; }
        public Vehicle? Vehicle { get; set; }

        [Required]
        public DateTime ServiceDate { get; set; }

        [Required]
        public string ServiceType { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        // Pending, Confirmed, Completed, Cancelled
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
