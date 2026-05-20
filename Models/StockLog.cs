using System;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.Models
{
    public class StockLog
    {
        public int Id { get; set; }

        [Required]
        public int PartId { get; set; }

        public Part? Part { get; set; }

        // StockIn, StockOut, Sale, Adjustment, Damaged
        [Required]
        public string MovementType { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public int QuantityBefore { get; set; }

        public int QuantityAfter { get; set; }

        public string Reference { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public int? PerformedByUserId { get; set; }

        public User? PerformedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
