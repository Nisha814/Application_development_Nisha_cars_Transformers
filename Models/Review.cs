using System;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }
        public User? Customer { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
