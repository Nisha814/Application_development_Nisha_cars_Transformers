using System;

namespace NishaCarRental.API.Models
{
    public class AIPrediction
    {
        public int Id { get; set; }
        public DateTime TargetDate { get; set; }
        public string MetricName { get; set; } = string.Empty; // e.g. Revenue, Demand_Sedan, Demand_SUV
        public decimal PredictedValue { get; set; }
        public decimal Confidence { get; set; } // Percentage e.g. 0.85 (85%)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
