using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoCarePro.Models
{
    public class Part
    {
        public int Id { get; set; }

        [Required]
        [Display(Name = "Part Name")]
        public string Name { get; set; } = string.Empty;

        [Display(Name = "Part Number / SKU")]
        public string PartNumber { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        [Display(Name = "Unit Price (₹)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Display(Name = "Current Quantity")]
        public int Quantity { get; set; }

        [Display(Name = "Reorder Level")]
        public int ReorderLevel { get; set; } = 10;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Navigation
        public ICollection<StockHistory> StockHistories { get; set; } = new List<StockHistory>();
        public ICollection<PurchaseInvoiceItem> PurchaseItems { get; set; } = new List<PurchaseInvoiceItem>();

        // Computed helper
        [NotMapped]
        public bool IsLowStock => Quantity < ReorderLevel;

        [NotMapped]
        public decimal TotalValue => UnitPrice * Quantity;
    }
}
