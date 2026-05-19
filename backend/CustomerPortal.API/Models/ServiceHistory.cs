using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerPortal.API.Models
{
    [Table("service_history")]
    public class ServiceHistory
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
        [Column("service_date", TypeName = "date")]
        public DateTime ServiceDate { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("technician_name")]
        public string TechnicianName { get; set; } = string.Empty;

        [Required]
        [Column("cost")]
        public decimal Cost { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Completed"; // Completed, In Progress

        [Column("notes")]
        public string? Notes { get; set; }
    }
}
