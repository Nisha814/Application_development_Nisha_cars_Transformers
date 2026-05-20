using System;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.Models
{
    public class DamagedStock
    {
        public int Id { get; set; }

        [Required]
        public int PartId { get; set; }

        public Part? Part { get; set; }

        public int Quantity { get; set; }

        public string Reason { get; set; } = string.Empty;

        public int ReportedByUserId { get; set; }

        public User? ReportedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
