using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.DTOs
{
    public class VendorDto
    {
        [Required(ErrorMessage = "Vendor Name is required")]
        public string VendorName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contact Person is required")]
        public string ContactPerson { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone Number is required")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; } = string.Empty;
    }
}
