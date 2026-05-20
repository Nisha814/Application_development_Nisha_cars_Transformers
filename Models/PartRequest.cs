using System;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.Models
{
    public class PartRequest
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }
        public User? Customer { get; set; }

        [Required]
        public string PartName { get; set; } = string.Empty;

        public string VehicleMakeModel { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        // Pending, Ordered, Arrived, Cancelled
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
