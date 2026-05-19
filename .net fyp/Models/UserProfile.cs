using System.ComponentModel.DataAnnotations;

namespace AutoCarePro.Models
{
    public class UserProfile
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = "Nisha Admin";

        [Required, EmailAddress]
        public string Email { get; set; } = "admin@nishacars.com";

        public string Phone { get; set; } = "+977-9800000000";

        public string Department { get; set; } = "Operations";

        public string Role { get; set; } = "Operations Manager";

        public string Bio { get; set; } = "Experienced automotive operations specialist managing The Nisha Cars Transformers service system.";

        public string Location { get; set; } = "Kathmandu, Nepal";

        // Notification preferences (stored as comma-separated flags)
        public bool NotifyNewCustomer { get; set; } = true;
        public bool NotifyNewVehicle { get; set; } = true;
        public bool NotifyServiceReminder { get; set; } = false;
        public bool NotifyRecordUpdate { get; set; } = false;
        public bool NotifyDailySummary { get; set; } = true;
        public bool NotifySystemAlerts { get; set; } = true;

        public DateTime JoinedDate { get; set; } = DateTime.Now;

        // Hashed password (for demo we store plaintext; production should hash)
        public string PasswordHash { get; set; } = "admin123";

        // Computed initials
        public string Initials => string.IsNullOrWhiteSpace(FullName)
            ? "NA"
            : string.Join("", FullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Take(2).Select(w => w[0].ToString().ToUpper()));
    }
}
