using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.DTOs
{
    public class CreateSalesInvoiceDto
    {
        [Required]
        public int CustomerId { get; set; }

        [Required]
        public string PaymentStatus { get; set; } = "Cash"; // Cash or Credit

        [Required]
        public List<SalesInvoiceItemDto> Items { get; set; } = new List<SalesInvoiceItemDto>();
    }

    public class SalesInvoiceItemDto
    {
        [Required]
        public int PartId { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
