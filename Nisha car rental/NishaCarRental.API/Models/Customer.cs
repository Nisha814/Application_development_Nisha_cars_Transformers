using System;
using System.Collections.Generic;

namespace NishaCarRental.API.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
    }
}
