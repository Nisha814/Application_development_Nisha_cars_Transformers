using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleParts.API.Models
{
    public class Inventory
    {
        public int Id { get; set; }

        [Required]
        public int PartId { get; set; }

        public Part? Part { get; set; }

        public int MinStockLevel { get; set; } = 5;

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitCost { get; set; }

        public int? WarehouseId { get; set; }

        public Warehouse? Warehouse { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
