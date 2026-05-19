using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.DTOs
{
    public class UpdateStaffDto
    {
        [Required(ErrorMessage = "Full Name is required")]
        public string FullName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
    }
}
