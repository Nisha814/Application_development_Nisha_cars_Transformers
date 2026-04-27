using System.ComponentModel.DataAnnotations;
using VehicleParts.API.Models;

namespace VehicleParts.API.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Full Name is required")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role is required")]
        [EnumDataType(typeof(UserRole), ErrorMessage = "Role must be Admin, Staff, or Customer")]
        public UserRole Role { get; set; }
    }
}
