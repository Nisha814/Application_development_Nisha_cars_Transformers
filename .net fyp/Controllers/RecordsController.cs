using AutoCarePro.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace AutoCarePro.Controllers
{
    public class RecordsController : Controller
    {
        private readonly AppDbContext _db;
        public RecordsController(AppDbContext db) { _db = db; }

        public async Task<IActionResult> Index(string? search, string? sort)
        {
            var query = _db.Customers
                .Include(c => c.Vehicles).ThenInclude(v => v.Services)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(c =>
                    c.FullName.Contains(search) ||
                    c.Email.Contains(search) ||
                    c.Phone.Contains(search));

            query = sort switch
            {
                "name" => query.OrderBy(c => c.FullName),
                "vehicles" => query.OrderByDescending(c => c.Vehicles.Count),
                _ => query.OrderByDescending(c => c.RegisteredDate)
            };

            ViewBag.Customers = await query.ToListAsync();
            ViewBag.Search = search;
            ViewBag.Sort = sort ?? "newest";
            return View();
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
    }
}
