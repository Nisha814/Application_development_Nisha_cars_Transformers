using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoCarePro.Models
{
    public class StockHistory
    {
        public int Id { get; set; }

        [Required]
        public int PartId { get; set; }

        [ForeignKey("PartId")]
        public Part? Part { get; set; }

        /// <summary>Purchase | Manual Adjustment</summary>
        [Display(Name = "Change Type")]
        public string ChangeType { get; set; } = "Manual Adjustment";

        [Display(Name = "Qty Before")]
        public int QuantityBefore { get; set; }

        /// <summary>Positive = stock added, Negative = stock removed</summary>
        [Display(Name = "Change")]
        public int QuantityChange { get; set; }

        [Display(Name = "Qty After")]
        public int QuantityAfter { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        /// <summary>Optional note for manual adjustments</summary>
        public string Notes { get; set; } = string.Empty;

        /// <summary>e.g. Invoice number for purchase entries</summary>
        public string Reference { get; set; } = string.Empty;
    }
}
