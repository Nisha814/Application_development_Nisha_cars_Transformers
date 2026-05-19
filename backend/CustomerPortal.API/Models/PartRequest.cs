using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CustomerPortal.API.Models
{
    [Table("part_requests")]
    public class PartRequest
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
        [Column("part_name")]
        public string PartName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        [Column("vehicle_info")]
        public string VehicleInfo { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("urgency")]
        public string Urgency { get; set; } = "Medium"; // Low, Medium, High

        [Required]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        [Column("status")]
        public string Status { get; set; } = "Pending"; // Pending, Sourcing, Available, Delivered

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
