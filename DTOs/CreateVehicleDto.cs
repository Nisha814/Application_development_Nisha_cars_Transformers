using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.DTOs
{
    public class CreateVehicleDto
    {
        [Required]
        public int CustomerId { get; set; }
        
        [Required]
        public string Make { get; set; } = string.Empty;
        
        [Required]
        public string Model { get; set; } = string.Empty;
        
        [Required]
        public string LicensePlate { get; set; } = string.Empty;
        
        public int Year { get; set; }
    }
}
