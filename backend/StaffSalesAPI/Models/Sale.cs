using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StaffSalesAPI.Models
{
    [Table("sales")]
    public class Sale
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("staff_id")]
        public int StaffId { get; set; }

        [Column("customer_id")]
        public int? CustomerId { get; set; }

        [Column("sale_date")]
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("total_amount")]
        public decimal TotalAmount { get; set; }

        [Column("discount")]
        public decimal Discount { get; set; } = 0;

        [Required]
        [Column("net_amount")]
        public decimal NetAmount { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("payment_method")]
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Credit

        [Required]
        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "Paid"; // Paid, Pending, Cancelled

        // Navigation properties
        [ForeignKey(nameof(StaffId))]
        [JsonIgnore]
        public Staff? Staff { get; set; }

        [ForeignKey(nameof(CustomerId))]
        [JsonIgnore]
        public Customer? Customer { get; set; }

        public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();

        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}
