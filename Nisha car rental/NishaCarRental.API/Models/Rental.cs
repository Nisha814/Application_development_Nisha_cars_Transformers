using System;
using System.Collections.Generic;

namespace NishaCarRental.API.Models
{
    public class Rental
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int CarId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Active, Completed, Overdue

        // Navigation properties
        public Customer? Customer { get; set; }
        public Car? Car { get; set; }
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
