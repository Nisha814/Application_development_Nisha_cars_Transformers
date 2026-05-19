using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerPortal.API.Models
{
    [Table("appointments")]
    public class Appointment
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
        [MaxLength(100)]
        [Column("service_type")]
        public string ServiceType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        [Column("vehicle_info")]
        public string VehicleInfo { get; set; } = string.Empty;

        [Required]
        [Column("preferred_date", TypeName = "date")]
        public DateTime PreferredDate { get; set; }

        [Required]
        [Column("preferred_time")]
        public TimeSpan PreferredTime { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Cancelled

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
