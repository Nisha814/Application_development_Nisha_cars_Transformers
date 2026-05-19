using System;

namespace StaffSalesAPI.DTOs
{
    public class CustomerCreateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal? InitialCreditLimit { get; set; } // Nullable, if set, configures credit limit
    }

    public class CustomerResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal TotalCreditLimit { get; set; }
        public decimal CurrentBalance { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
