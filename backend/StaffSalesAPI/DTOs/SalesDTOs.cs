using System;
using System.Collections.Generic;

namespace StaffSalesAPI.DTOs
{
    public class SaleCreateDto
    {
        public int StaffId { get; set; }
        public int? CustomerId { get; set; }
        public decimal Discount { get; set; }
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Credit
        public List<SaleItemCreateDto> Items { get; set; } = new List<SaleItemCreateDto>();
    }

    public class SaleItemCreateDto
    {
        public string PartName { get; set; } = string.Empty;
        public string PartNumber { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class SaleResponseDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public int? CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public DateTime SaleDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal NetAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<SaleItemResponseDto> Items { get; set; } = new List<SaleItemResponseDto>();
        public string? InvoiceNumber { get; set; }
    }

    public class SaleItemResponseDto
    {
        public int Id { get; set; }
        public string PartName { get; set; } = string.Empty;
        public string PartNumber { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
