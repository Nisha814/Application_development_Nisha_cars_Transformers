using Microsoft.AspNetCore.Mvc;
using AutoCarePro.Data;
using AutoCarePro.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoCarePro.Controllers
{
    public class ProfileController : Controller
    {
        private readonly AppDbContext _context;

        public ProfileController(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(string tab = "profile")
        {
            var profile = await _context.UserProfiles.FirstOrDefaultAsync();
            if (profile == null)
            {
                profile = new UserProfile();
                _context.UserProfiles.Add(profile);
                await _context.SaveChangesAsync();
            }

            // Load activity logs for the activity log tab
            ViewBag.ActivityLogs = await _context.ActivityLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(15)
                .ToListAsync();

            ViewBag.ActiveTab = tab.ToLower();
            return View(profile);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProfile(UserProfile model)
        {
            var profile = await _context.UserProfiles.FirstOrDefaultAsync();
            if (profile != null)
            {
                profile.FullName = model.FullName;
                profile.Email = model.Email;
                profile.Phone = model.Phone;
                profile.Department = model.Department;
                profile.Role = model.Role;
                profile.Bio = model.Bio;
                profile.Location = model.Location;

                // Log the activity
                _context.ActivityLogs.Add(new ActivityLog
                {
                    Action = "Updated profile information",
                    Description = $"Profile updated for {model.FullName}",
                    Icon = "edit",
                    IconColor = "#d97706",
                    IconBg = "#fef3c7",
                    Timestamp = DateTime.Now
                });

                await _context.SaveChangesAsync();
                TempData["Success"] = "Profile updated successfully!";
            }

            return RedirectToAction("Index", new { tab = "profile" });
        }

        [HttpPost]
        public async Task<IActionResult> UpdatePassword(string currentPassword, string newPassword, string confirmPassword)
        {
            var profile = await _context.UserProfiles.FirstOrDefaultAsync();
            
            if (profile == null) return RedirectToAction("Index", new { tab = "security" });

            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            {
                TempData["Error"] = "New password must be at least 6 characters!";
                return RedirectToAction("Index", new { tab = "security" });
            }

            if (newPassword != confirmPassword)
            {
                TempData["Error"] = "New passwords do not match!";
                return RedirectToAction("Index", new { tab = "security" });
            }

            if (profile.PasswordHash != currentPassword)
            {
                TempData["Error"] = "Current password is incorrect!";
                return RedirectToAction("Index", new { tab = "security" });
            }

            profile.PasswordHash = newPassword;

            // Log the activity
            _context.ActivityLogs.Add(new ActivityLog
            {
                Action = "Changed password",
                Description = "Account password was updated",
                Icon = "lock",
                IconColor = "#d97706",
                IconBg = "#fef3c7",
                Timestamp = DateTime.Now
            });

            await _context.SaveChangesAsync();

            TempData["Success"] = "Password updated successfully!";
            return RedirectToAction("Index", new { tab = "security" });
        }

        [HttpPost]
        public async Task<IActionResult> SavePreferences(UserProfile preferences)
        {
            var profile = await _context.UserProfiles.FirstOrDefaultAsync();
            if (profile != null)
            {
                profile.NotifyNewCustomer = preferences.NotifyNewCustomer;
                profile.NotifyNewVehicle = preferences.NotifyNewVehicle;
                profile.NotifyServiceReminder = preferences.NotifyServiceReminder;
                profile.NotifyRecordUpdate = preferences.NotifyRecordUpdate;
                profile.NotifyDailySummary = preferences.NotifyDailySummary;
                profile.NotifySystemAlerts = preferences.NotifySystemAlerts;

                // Log the activity
                _context.ActivityLogs.Add(new ActivityLog
                {
                    Action = "Updated notification preferences",
                    Description = "Changed notification settings",
                    Icon = "notifications",
                    IconColor = "#059669",
                    IconBg = "#d1fae5",
                    Timestamp = DateTime.Now
                });

                await _context.SaveChangesAsync();
                TempData["Success"] = "Preferences saved successfully!";
            }
            
            return RedirectToAction("Index", new { tab = "notifications" });
        }
    }
}
