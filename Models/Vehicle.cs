using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleParts.API.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        
        [Required]
        public int CustomerId { get; set; }
        
        [ForeignKey("CustomerId")]
        public User? Customer { get; set; }
        
        [Required]
        public string Make { get; set; } = string.Empty;
        
        [Required]
        public string Model { get; set; } = string.Empty;
        
        [Required]
        public string LicensePlate { get; set; } = string.Empty;
        
        public int Year { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
