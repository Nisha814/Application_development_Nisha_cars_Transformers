using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StaffSalesAPI.Models
{
    [Table("customer_credits")]
    public class CustomerCredit
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Required]
        [Column("total_credit_limit")]
        public decimal TotalCreditLimit { get; set; }

        [Required]
        [Column("current_balance")]
        public decimal CurrentBalance { get; set; } = 0; // Amount owed

        [Column("last_updated")]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        [JsonIgnore]
        public Customer? Customer { get; set; }
    }
}
