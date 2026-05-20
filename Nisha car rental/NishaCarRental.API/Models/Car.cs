using System;
using System.Collections.Generic;

namespace NishaCarRental.API.Models
{
    public class Car
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public decimal DailyRate { get; set; }
        public string Category { get; set; } = string.Empty; // e.g. Sedan, SUV, Luxury, Economy

        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
    }
}
