using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VehicleParts.API.Models
{
    public class Warehouse
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    }
}
