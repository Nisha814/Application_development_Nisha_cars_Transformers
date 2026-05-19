using System.Collections.Generic;

namespace VehicleParts.API.DTOs
{
    public class FinancialReportDto
    {
        public string Period { get; set; } = string.Empty;
        public decimal TotalSpending { get; set; }
        public int InvoicesCount { get; set; }
        public int ActiveSuppliersCount { get; set; }
        public decimal InventoryValuation { get; set; }
        public List<CategoryValuationDto> CategoryBreakdown { get; set; } = new();
        public List<ReportTimeSeriesEntryDto> TimeSeries { get; set; } = new();
    }

    public class CategoryValuationDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal TotalValuation { get; set; }
        public int PartsCount { get; set; }
        public double Percentage { get; set; }
    }

    public class ReportTimeSeriesEntryDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int TransactionsCount { get; set; }
    }
}
