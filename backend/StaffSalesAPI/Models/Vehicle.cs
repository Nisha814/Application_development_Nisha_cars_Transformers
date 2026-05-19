using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StaffSalesAPI.Models
{
    [Table("vehicles")]
    public class Vehicle
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("make")]
        public string Make { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("model")]
        public string Model { get; set; } = string.Empty;

        [Required]
        [Column("year")]
        public int Year { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("license_plate")]
        public string LicensePlate { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("vin")]
        public string VIN { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        [JsonIgnore]
        public Customer? Customer { get; set; }
    }
}
