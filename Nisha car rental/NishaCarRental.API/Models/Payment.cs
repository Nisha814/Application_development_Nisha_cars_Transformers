using System;

namespace NishaCarRental.API.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int RentalId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; } = "Pending"; // Paid, Pending

        // Navigation property
        public Rental? Rental { get; set; }
    }
}
