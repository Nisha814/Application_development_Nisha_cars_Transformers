using System.ComponentModel.DataAnnotations;

namespace AutoCarePro.Models
{
    public class ActivityLog
    {
        public int Id { get; set; }

        [Required]
        public string Action { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Icon { get; set; } = "info";

        public string IconColor { get; set; } = "#6b7280";

        public string IconBg { get; set; } = "#f3f4f6";

        public DateTime Timestamp { get; set; } = DateTime.Now;
    }
}
