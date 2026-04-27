using AutoCarePro.Data;
using AutoCarePro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCarePro.Controllers
{
    public class HomeController : Controller
    {
        private readonly AppDbContext _db;
        public HomeController(AppDbContext db) { _db = db; }

        public async Task<IActionResult> Index()
        {
            ViewBag.TotalCustomers = await _db.Customers.CountAsync();
            ViewBag.TotalVehicles = await _db.Vehicles.CountAsync();
            ViewBag.TotalServices = await _db.Services.CountAsync();
            ViewBag.TotalRevenue = await _db.Services.SumAsync(s => s.Cost);

            ViewBag.RecentServices = await _db.Services
                .Include(s => s.Vehicle).ThenInclude(v => v!.Customer)
                .OrderByDescending(s => s.Date)
                .Take(5)
                .ToListAsync();

            ViewBag.NewCustomers = await _db.Customers
                .Include(c => c.Vehicles)
                .OrderByDescending(c => c.RegisteredDate)
                .Take(5)
                .ToListAsync();

            return View();
        }
    }
}
