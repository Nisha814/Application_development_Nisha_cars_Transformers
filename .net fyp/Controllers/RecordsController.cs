using AutoCarePro.Data;
using AutoCarePro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace AutoCarePro.Controllers
{
    public class RecordsController : Controller
    {
        private readonly AppDbContext _db;
        public RecordsController(AppDbContext db) { _db = db; }

        public async Task<IActionResult> Index(string? search, string? sort, string? city, string? status)
        {
            var query = _db.Customers
                .Include(c => c.Vehicles).ThenInclude(v => v.Services)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var cleanSearch = search.Trim();
                int idSearch = -1;
                if (cleanSearch.StartsWith("C", StringComparison.OrdinalIgnoreCase) && int.TryParse(cleanSearch.Substring(1), out var idVal))
                {
                    idSearch = idVal;
                }
                else if (int.TryParse(cleanSearch, out var idVal2))
                {
                    idSearch = idVal2;
                }

                query = query.Where(c =>
                    c.FullName.Contains(search) ||
                    c.Email.Contains(search) ||
                    c.Phone.Contains(search) ||
                    c.Vehicles.Any(v => v.LicensePlate.Contains(search)) ||
                    (idSearch != -1 && c.Id == idSearch));
            }

            if (!string.IsNullOrWhiteSpace(city) && city != "All")
            {
                query = query.Where(c => c.City == city);
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
            {
                query = query.Where(c => c.Status == status);
            }

            query = sort switch
            {
                "name" => query.OrderBy(c => c.FullName),
                "vehicles" => query.OrderByDescending(c => c.Vehicles.Count),
                _ => query.OrderByDescending(c => c.RegisteredDate)
            };

            ViewBag.Customers = await query.ToListAsync();
            ViewBag.Cities = await _db.Customers
                .Where(c => !string.IsNullOrEmpty(c.City))
                .Select(c => c.City)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            ViewBag.Search = search;
            ViewBag.Sort = sort ?? "newest";
            ViewBag.SelectedCity = city ?? "All";
            ViewBag.SelectedStatus = status ?? "All";
            return View();
        }

        public async Task<IActionResult> Details(int id)
        {
            var customer = await _db.Customers
                .Include(c => c.Vehicles)
                .ThenInclude(v => v.Services)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null) return NotFound();

            ViewBag.TotalSpent = customer.Vehicles.Sum(v => v.Services.Sum(s => s.Cost));
            ViewBag.TotalJobs = customer.Vehicles.Sum(v => v.Services.Count);
            ViewBag.CompletedJobs = customer.Vehicles.Sum(v => v.Services.Count(s => s.Status == "Completed"));
            ViewBag.PendingJobs = customer.Vehicles.Sum(v => v.Services.Count(s => s.Status == "Pending"));

            return View(customer);
        }

        public async Task<IActionResult> Export()
        {
            var customers = await _db.Customers
                .Include(c => c.Vehicles).ThenInclude(v => v.Services)
                .OrderByDescending(c => c.RegisteredDate)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("Name,Email,Phone,Address,Vehicles,Services,Registered");

            foreach (var c in customers)
            {
                var vehicleCount = c.Vehicles.Count;
                var serviceCount = c.Vehicles.Sum(v => v.Services.Count);
                sb.AppendLine($"\"{c.FullName}\",\"{c.Email}\",\"{c.Phone}\",\"{c.Address}\",{vehicleCount},{serviceCount},{c.RegisteredDate:d}");
            }

            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            return File(bytes, "text/csv", "customers_export.csv");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Customer customer)
        {
            if (ModelState.IsValid)
            {
                var existing = await _db.Customers.FindAsync(customer.Id);
                if (existing != null)
                {
                    existing.FullName = customer.FullName;
                    existing.Email = customer.Email ?? string.Empty;
                    existing.Phone = customer.Phone;
                    existing.Address = customer.Address ?? string.Empty;
                    existing.CNIC = customer.CNIC;
                    existing.City = customer.City ?? string.Empty;
                    existing.Status = customer.Status;

                    await _db.SaveChangesAsync();

                    _db.ActivityLogs.Add(new ActivityLog
                    {
                        Action = "Updated customer records",
                        Description = $"Updated {customer.FullName} (C{customer.Id:D3})",
                        Icon = "edit",
                        IconColor = "#d97706",
                        IconBg = "#fef3c7",
                        Timestamp = DateTime.Now
                    });
                    await _db.SaveChangesAsync();

                    TempData["Success"] = "Customer records updated successfully!";
                }
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var customer = await _db.Customers.FindAsync(id);
            if (customer != null)
            {
                var desc = $"{customer.FullName} (C{customer.Id:D3})";
                _db.Customers.Remove(customer);
                await _db.SaveChangesAsync();

                _db.ActivityLogs.Add(new ActivityLog
                {
                    Action = "Deleted customer record",
                    Description = desc,
                    Icon = "delete",
                    IconColor = "#ef4444",
                    IconBg = "#fee2e2",
                    Timestamp = DateTime.Now
                });
                await _db.SaveChangesAsync();

                TempData["Success"] = "Customer record deleted successfully!";
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
