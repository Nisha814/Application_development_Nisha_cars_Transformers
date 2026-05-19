using AutoCarePro.Data;
using AutoCarePro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCarePro.Controllers
{
    public class VehicleController : Controller
    {
        private readonly AppDbContext _db;
        public VehicleController(AppDbContext db) { _db = db; }

        public async Task<IActionResult> Index(string? search, string? make)
        {
            var query = _db.Vehicles.Include(v => v.Customer).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(v => v.Make.Contains(search) || v.Model.Contains(search) || v.LicensePlate.Contains(search));

            if (!string.IsNullOrWhiteSpace(make) && make != "All")
                query = query.Where(v => v.Make == make);

            ViewBag.Vehicles = await query.ToListAsync();
            ViewBag.Makes = await _db.Vehicles.Select(v => v.Make).Distinct().OrderBy(m => m).ToListAsync();
            ViewBag.Customers = await _db.Customers.OrderBy(c => c.FullName).ToListAsync();
            ViewBag.Search = search;
            ViewBag.SelectedMake = make ?? "All";
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Add(Vehicle vehicle)
        {
            if (ModelState.IsValid)
            {
                _db.Vehicles.Add(vehicle);
                await _db.SaveChangesAsync();

                _db.ActivityLogs.Add(new AutoCarePro.Models.ActivityLog
                {
                    Action = "Added new vehicle",
                    Description = $"{vehicle.Make} {vehicle.Model} {vehicle.LicensePlate}",
                    Icon = "directions_car",
                    IconColor = "#2563eb",
                    IconBg = "#dbeafe",
                    Timestamp = DateTime.Now
                });
                await _db.SaveChangesAsync();

                TempData["Success"] = "Vehicle added successfully!";
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Vehicle vehicle)
        {
            var existing = await _db.Vehicles.FindAsync(vehicle.Id);
            if (existing != null)
            {
                existing.Make = vehicle.Make;
                existing.Model = vehicle.Model;
                existing.LicensePlate = vehicle.LicensePlate;
                existing.Color = vehicle.Color;
                existing.VIN = vehicle.VIN;
                existing.Mileage = vehicle.Mileage;
                existing.Status = vehicle.Status;

                await _db.SaveChangesAsync();

                _db.ActivityLogs.Add(new AutoCarePro.Models.ActivityLog
                {
                    Action = "Updated vehicle details",
                    Description = $"{vehicle.Make} {vehicle.Model} {vehicle.LicensePlate}",
                    Icon = "edit",
                    IconColor = "#d97706",
                    IconBg = "#fef3c7",
                    Timestamp = DateTime.Now
                });
                await _db.SaveChangesAsync();

                TempData["Success"] = "Vehicle updated successfully!";
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var vehicle = await _db.Vehicles.FindAsync(id);
            if (vehicle != null)
            {
                var desc = $"{vehicle.Make} {vehicle.Model} {vehicle.LicensePlate}";
                _db.Vehicles.Remove(vehicle);
                await _db.SaveChangesAsync();

                _db.ActivityLogs.Add(new AutoCarePro.Models.ActivityLog
                {
                    Action = "Deleted vehicle record",
                    Description = desc,
                    Icon = "delete",
                    IconColor = "#ef4444",
                    IconBg = "#fee2e2",
                    Timestamp = DateTime.Now
                });
                await _db.SaveChangesAsync();

                TempData["Success"] = "Vehicle deleted successfully!";
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
