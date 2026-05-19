using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StaffSalesAPI.Models
{
    [Table("customers")]
    public class Customer
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("phone_number")]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("address")]
        public string Address { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [JsonIgnore]
        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();

        [JsonIgnore]
        public ICollection<Sale> Sales { get; set; } = new List<Sale>();

        [JsonIgnore]
        public CustomerCredit? Credit { get; set; }
    }
}
