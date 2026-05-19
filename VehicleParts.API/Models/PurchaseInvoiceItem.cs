using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace VehicleParts.API.Models
{
    public class PurchaseInvoiceItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PurchaseInvoiceId { get; set; }

        [ForeignKey("PurchaseInvoiceId")]
        [JsonIgnore] // Avoid cyclic reference loops during serialization
        public PurchaseInvoice? PurchaseInvoice { get; set; }

        [Required]
        public int PartId { get; set; }

        [ForeignKey("PartId")]
        public Part? Part { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }
    }
}
