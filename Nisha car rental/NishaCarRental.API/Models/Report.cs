using System;

namespace NishaCarRental.API.Models
{
    public class Report
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // e.g. Financial, Sales, Customers, TopSpenders, PendingPayments
        public string Parameters { get; set; } = string.Empty; // JSON or descriptive string of parameters
        public string FilePath { get; set; } = string.Empty; // Path or URL to the downloadable PDF/CSV
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
