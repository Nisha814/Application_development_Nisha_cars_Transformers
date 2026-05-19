using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StaffSalesAPI.Models
{
    [Table("invoices")]
    public class Invoice
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("invoice_number")]
        public string InvoiceNumber { get; set; } = string.Empty;

        [Required]
        [Column("sale_id")]
        public int SaleId { get; set; }

        [Column("issued_date")]
        public DateTime IssuedDate { get; set; } = DateTime.UtcNow;

        [Column("due_date")]
        public DateTime DueDate { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        [Column("sent_to_email")]
        public string SentToEmail { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "Sent"; // Sent, Paid, Overdue

        // Navigation properties
        [ForeignKey(nameof(SaleId))]
        [JsonIgnore]
        public Sale? Sale { get; set; }
    }
}
