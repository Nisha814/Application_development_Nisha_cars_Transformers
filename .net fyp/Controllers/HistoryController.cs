using AutoCarePro.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCarePro.Controllers
{
    public class HistoryController : Controller
    {
        private readonly AppDbContext _db;
        public HistoryController(AppDbContext db) { _db = db; }

        public async Task<IActionResult> Index(string? search, string? serviceType)
        {
            var query = _db.Services
                .Include(s => s.Vehicle).ThenInclude(v => v!.Customer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(s =>
                    s.ServiceType.Contains(search) ||
                    s.Vehicle!.Customer!.FullName.Contains(search) ||
                    s.Vehicle.Make.Contains(search) ||
                    s.Vehicle.Model.Contains(search));

            if (!string.IsNullOrWhiteSpace(serviceType) && serviceType != "All")
                query = query.Where(s => s.ServiceType == serviceType);

            ViewBag.Services = await query.OrderByDescending(s => s.Date).ToListAsync();
            ViewBag.ServiceTypes = await _db.Services.Select(s => s.ServiceType).Distinct().OrderBy(t => t).ToListAsync();
            ViewBag.Search = search;
            ViewBag.SelectedType = serviceType ?? "All";
            ViewBag.TotalCount = await query.CountAsync();
            return View();
        }
    }
}
