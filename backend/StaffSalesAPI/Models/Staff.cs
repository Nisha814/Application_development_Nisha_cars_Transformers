using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StaffSalesAPI.Models
{
    [Table("staff")]
    public class Staff
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("username")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("role")]
        public string Role { get; set; } = "Staff"; // Admin, Staff

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
