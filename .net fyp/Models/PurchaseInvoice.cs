using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoCarePro.Models
{
    public class PurchaseInvoice
    {
        public int Id { get; set; }

        [Required]
        public int VendorId { get; set; }

        [ForeignKey("VendorId")]
        public Vendor? Vendor { get; set; }

        [Required]
        [Display(Name = "Invoice Number")]
        public string InvoiceNumber { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(10,2)")]
        [Display(Name = "Total Amount")]
        public decimal TotalAmount { get; set; }

        public string Notes { get; set; } = string.Empty;

        /// <summary>Received | Pending</summary>
        public string Status { get; set; } = "Received";

        // Navigation
        public ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();
    }
}
