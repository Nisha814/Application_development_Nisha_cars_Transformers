using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerPortal.API.Models
{
    [Table("payments")]
    public class Payment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public CustomerAccount? Customer { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column("amount")]
        public decimal Amount { get; set; }

        [Required]
        [Column("due_date", TypeName = "date")]
        public DateTime DueDate { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Pending"; // Pending, Paid, Overdue

        [Column("paid_at")]
        public DateTime? PaidAt { get; set; }
    }
}
