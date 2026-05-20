using System;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.Models
{
    public class CustomerNotification
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }
        public User? Customer { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
