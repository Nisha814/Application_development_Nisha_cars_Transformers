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
                TempData["Success"] = "Vehicle added successfully!";
            }
            return RedirectToAction(nameof(Index));
        }
    }
}
