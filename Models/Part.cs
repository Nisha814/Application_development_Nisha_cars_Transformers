using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleParts.API.Models
{
    public class Part
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? PartNumber { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        public int StockQuantity { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Inventory? InventoryRecord { get; set; }
        public ICollection<StockLog> StockLogs { get; set; } = new List<StockLog>();
        public ICollection<StockAlert> StockAlerts { get; set; } = new List<StockAlert>();
        public ICollection<DamagedStock> DamagedStockRecords { get; set; } = new List<DamagedStock>();
    }
}
