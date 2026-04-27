using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoCarePro.Models
{
    public class PurchaseInvoiceItem
    {
        public int Id { get; set; }

        [Required]
        public int PurchaseInvoiceId { get; set; }

        [ForeignKey("PurchaseInvoiceId")]
        public PurchaseInvoice? PurchaseInvoice { get; set; }

        [Required]
        public int PartId { get; set; }

        [ForeignKey("PartId")]
        public Part? Part { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        [Display(Name = "Unit Cost (₹)")]
        public decimal UnitCost { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        [Display(Name = "Sub Total")]
        public decimal SubTotal { get; set; }
    }
}
