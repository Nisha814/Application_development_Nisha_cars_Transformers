using System;

namespace VehicleParts.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Customer;
        public string? ProfilePictureUrl { get; set; }
        public bool IsVerified { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public string? OtpCode { get; set; }
        public DateTime? OtpExpiry { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
