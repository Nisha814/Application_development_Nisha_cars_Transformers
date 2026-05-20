using System;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.Models
{
    public class StockAlert
    {
        public int Id { get; set; }

        [Required]
        public int PartId { get; set; }

        public Part? Part { get; set; }

        // LowStock, OutOfStock
        [Required]
        public string AlertType { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public int CurrentQuantity { get; set; }

        public int Threshold { get; set; }

        public bool IsResolved { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ResolvedAt { get; set; }
    }
}
