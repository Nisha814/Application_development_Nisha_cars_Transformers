using AutoCarePro.Data;
using AutoCarePro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCarePro.Controllers
{
    public class RegistrationController : Controller
    {
        private readonly AppDbContext _db;
        public RegistrationController(AppDbContext db) { _db = db; }

        public async Task<IActionResult> Index()
        {
            ViewBag.RecentCustomers = await _db.Customers
                .OrderByDescending(c => c.RegisteredDate)
                .Take(10)
                .ToListAsync();
            return View(new Customer());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(Customer customer)
        {
            if (ModelState.IsValid)
            {
                customer.RegisteredDate = DateTime.Now;
                _db.Customers.Add(customer);
                await _db.SaveChangesAsync();
                TempData["Success"] = $"Customer '{customer.FullName}' registered successfully!";
                return RedirectToAction(nameof(Index));
            }

            ViewBag.RecentCustomers = await _db.Customers
                .OrderByDescending(c => c.RegisteredDate)
                .Take(10)
                .ToListAsync();
            return View(customer);
        }
    }
}
