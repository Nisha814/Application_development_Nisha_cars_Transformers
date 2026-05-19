using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.DTOs
{
    public class CreatePurchaseInvoiceDto
    {
        [Required(ErrorMessage = "Invoice Number is required")]
        [StringLength(50, ErrorMessage = "Invoice Number cannot exceed 50 characters")]
        public string InvoiceNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Invoice Date is required")]
        public DateTime InvoiceDate { get; set; }

        [Required(ErrorMessage = "Vendor ID is required")]
        public int VendorId { get; set; }

        [Required(ErrorMessage = "Invoice Status is required")]
        [StringLength(20)]
        public string Status { get; set; } = "Paid"; // Paid, Pending

        [Required(ErrorMessage = "Invoice must contain at least one item")]
        [MinLength(1, ErrorMessage = "Invoice must contain at least one item")]
        public List<CreatePurchaseInvoiceItemDto> Items { get; set; } = new();
    }

    public class CreatePurchaseInvoiceItemDto
    {
        [Required(ErrorMessage = "Part ID is required")]
        public int PartId { get; set; }

        [Required(ErrorMessage = "Quantity is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Unit Price is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Unit Price must be greater than zero")]
        public decimal UnitPrice { get; set; }
    }
}
