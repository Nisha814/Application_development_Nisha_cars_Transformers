using System;

namespace StaffSalesAPI.DTOs
{
    public class CreditPaymentDto
    {
        public int CustomerId { get; set; }
        public decimal PaymentAmount { get; set; }
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Card
    }

    public class CreditResponseDto
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public decimal TotalCreditLimit { get; set; }
        public decimal CurrentBalance { get; set; }
        public decimal AvailableLimit { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
