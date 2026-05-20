using System;

namespace NishaCarRental.API.Models
{
    public class EmailLog
    {
        public int Id { get; set; }
        public string RecipientEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Sent, Failed, Pending
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
