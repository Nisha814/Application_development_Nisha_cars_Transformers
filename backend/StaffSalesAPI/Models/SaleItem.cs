using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StaffSalesAPI.Models
{
    [Table("sales_items")]
    public class SaleItem
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("sale_id")]
        public int SaleId { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("part_name")]
        public string PartName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("part_number")]
        public string PartNumber { get; set; } = string.Empty;

        [Required]
        [Column("quantity")]
        public int Quantity { get; set; }

        [Required]
        [Column("unit_price")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column("total_price")]
        public decimal TotalPrice { get; set; }

        // Navigation properties
        [ForeignKey(nameof(SaleId))]
        [JsonIgnore]
        public Sale? Sale { get; set; }
    }
}
