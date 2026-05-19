using System.ComponentModel.DataAnnotations;

namespace AutoCarePro.Models
{
    public class Customer
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^[0-9\-\+\s]+$", ErrorMessage = "Phone number must contain only numbers.")]
        public string Phone { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        [Required]
        public string CNIC { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string Status { get; set; } = "Active";

        public DateTime RegisteredDate { get; set; } = DateTime.Now;

        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    }
}
