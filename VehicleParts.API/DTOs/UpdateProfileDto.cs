using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.DTOs
{
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Full Name is required")]
        public string FullName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public string? Password { get; set; }
    }
}
