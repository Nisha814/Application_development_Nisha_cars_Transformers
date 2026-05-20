using System;

namespace NishaCarRental.API.Models
{
    public class AnalyticsCache
    {
        public int Id { get; set; }
        public string CacheKey { get; set; } = string.Empty; // e.g. DashboardSummary, MonthlyRevenueStats
        public string CacheValue { get; set; } = string.Empty; // Serialized JSON payload
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
