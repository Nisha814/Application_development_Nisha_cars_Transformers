using System;
using System.ComponentModel.DataAnnotations;

namespace CustomerPortal.API.DTOs
{
    public class AppointmentCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string ServiceType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string VehicleInfo { get; set; } = string.Empty;

        [Required]
        public DateTime PreferredDate { get; set; }

        [Required]
        public string PreferredTime { get; set; } = string.Empty; // Format HH:mm

        public string? Notes { get; set; }
    }

    public class AppointmentUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string ServiceType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string VehicleInfo { get; set; } = string.Empty;

        [Required]
        public DateTime PreferredDate { get; set; }

        [Required]
        public string PreferredTime { get; set; } = string.Empty; // Format HH:mm

        public string? Notes { get; set; }
    }

    public class ReviewCreateDto
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Comment { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ServiceType { get; set; } = string.Empty;
    }

    public class PartRequestCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string PartName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string VehicleInfo { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Urgency { get; set; } = "Medium"; // Low, Medium, High

        [Required]
        public string Description { get; set; } = string.Empty;
    }
}
