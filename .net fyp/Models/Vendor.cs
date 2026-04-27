using System.ComponentModel.DataAnnotations;

namespace AutoCarePro.Models
{
    public class Vendor
    {
        public int Id { get; set; }

        [Required]
        [Display(Name = "Vendor Name")]
        public string Name { get; set; } = string.Empty;

        [Display(Name = "Contact Person")]
        public string ContactPerson { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Navigation
        public ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
    }
}
