using AutoCarePro.Data;
using AutoCarePro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCarePro.Controllers
{
    public class InventoryController : Controller
    {
        private readonly AppDbContext _db;
        public InventoryController(AppDbContext db) { _db = db; }

        // ─── GET /Inventory ───────────────────────────────────────────────────────
        // Lists all parts with optional search, sort, and category filter.
        public async Task<IActionResult> Index(string? search, string? sort, string? category)
        {
            var query = _db.Parts.AsQueryable();

            // Filter by search term
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p =>
                    p.Name.Contains(search) ||
                    p.PartNumber.Contains(search) ||
                    p.Category.Contains(search) ||
                    p.Description.Contains(search));

            // Filter by category
            if (!string.IsNullOrWhiteSpace(category) && category != "All")
                query = query.Where(p => p.Category == category);

            // Sort
            query = sort switch
            {
                "name_asc"   => query.OrderBy(p => p.Name),
                "name_desc"  => query.OrderByDescending(p => p.Name),
                "price_asc"  => query.OrderBy(p => p.UnitPrice),
                "price_desc" => query.OrderByDescending(p => p.UnitPrice),
                "qty_asc"    => query.OrderBy(p => p.Quantity),
                "qty_desc"   => query.OrderByDescending(p => p.Quantity),
                _            => query.OrderBy(p => p.Name),
            };

            var parts = await query.ToListAsync();

            // Summary stats
            var allParts = await _db.Parts.ToListAsync();
            ViewBag.TotalParts       = allParts.Count;
            ViewBag.TotalStockValue  = allParts.Sum(p => p.UnitPrice * p.Quantity);
            ViewBag.LowStockCount    = allParts.Count(p => p.IsLowStock);
            ViewBag.CategoryCount    = allParts.Select(p => p.Category).Distinct().Count();

            ViewBag.Parts            = parts;
            ViewBag.Categories       = await _db.Parts.Select(p => p.Category).Distinct().OrderBy(c => c).ToListAsync();
            ViewBag.Search           = search;
            ViewBag.Sort             = sort ?? "name_asc";
            ViewBag.SelectedCategory = category ?? "All";

            return View();
        }

        // ─── GET /Inventory/Create ────────────────────────────────────────────────
        public IActionResult Create()
        {
            return View(new Part());
        }

        // ─── POST /Inventory/Create ───────────────────────────────────────────────
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Part part)
        {
            if (ModelState.IsValid)
            {
                part.CreatedDate = DateTime.Now;
                _db.Parts.Add(part);
                await _db.SaveChangesAsync();

                // Write initial stock history if opening stock > 0
                if (part.Quantity > 0)
                {
                    _db.StockHistories.Add(new StockHistory
                    {
                        PartId         = part.Id,
                        ChangeType     = "Manual Adjustment",
                        QuantityBefore = 0,
                        QuantityChange = part.Quantity,
                        QuantityAfter  = part.Quantity,
                        Date           = DateTime.Now,
                        Notes          = "Opening stock on part creation",
                        Reference      = "OPENING",
                    });
                    await _db.SaveChangesAsync();
                }

                TempData["Success"] = $"Part '{part.Name}' added successfully!";
                return RedirectToAction(nameof(Index));
            }

            return View(part);
        }

        // ─── GET /Inventory/Edit/{id} ─────────────────────────────────────────────
        public async Task<IActionResult> Edit(int id)
        {
            var part = await _db.Parts.FindAsync(id);
            if (part == null) return NotFound();
            return View(part);
        }

        // ─── POST /Inventory/Edit/{id} ────────────────────────────────────────────
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Part updated)
        {
            if (id != updated.Id) return BadRequest();

            if (ModelState.IsValid)
            {
                var existing = await _db.Parts.FindAsync(id);
                if (existing == null) return NotFound();

                // Detect quantity change — write a stock history entry
                if (existing.Quantity != updated.Quantity)
                {
                    int change = updated.Quantity - existing.Quantity;
                    _db.StockHistories.Add(new StockHistory
                    {
                        PartId         = existing.Id,
                        ChangeType     = "Manual Adjustment",
                        QuantityBefore = existing.Quantity,
                        QuantityChange = change,
                        QuantityAfter  = updated.Quantity,
                        Date           = DateTime.Now,
                        Notes          = "Quantity updated via Edit Part",
                        Reference      = "EDIT",
                    });
                }

                existing.Name         = updated.Name;
                existing.PartNumber   = updated.PartNumber;
                existing.Category     = updated.Category;
                existing.Description  = updated.Description;
                existing.UnitPrice    = updated.UnitPrice;
                existing.Quantity     = updated.Quantity;
                existing.ReorderLevel = updated.ReorderLevel;

                await _db.SaveChangesAsync();
                TempData["Success"] = $"Part '{existing.Name}' updated successfully!";
                return RedirectToAction(nameof(Index));
            }

            return View(updated);
        }

        // ─── POST /Inventory/Delete/{id} ──────────────────────────────────────────
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var part = await _db.Parts
                .Include(p => p.PurchaseItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (part == null) return NotFound();

            // Prevent deleting a part that is used in a purchase invoice
            if (part.PurchaseItems.Any())
            {
                TempData["Error"] = $"Cannot delete '{part.Name}' — it is referenced in one or more purchase invoices.";
                return RedirectToAction(nameof(Index));
            }

            _db.Parts.Remove(part);
            await _db.SaveChangesAsync();
            TempData["Success"] = $"Part '{part.Name}' deleted.";
            return RedirectToAction(nameof(Index));
        }

        // ─── POST /Inventory/UpdateStock ──────────────────────────────────────────
        // Manual stock quantity adjustment (add or subtract).
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateStock(int partId, int quantityChange, string? notes)
        {
            var part = await _db.Parts.FindAsync(partId);
            if (part == null) return NotFound();

            int before = part.Quantity;
            int after  = before + quantityChange;

            if (after < 0)
            {
                TempData["Error"] = "Stock cannot go below 0.";
                return RedirectToAction(nameof(Index));
            }

            part.Quantity = after;

            _db.StockHistories.Add(new StockHistory
            {
                PartId         = part.Id,
                ChangeType     = "Manual Adjustment",
                QuantityBefore = before,
                QuantityChange = quantityChange,
                QuantityAfter  = after,
                Date           = DateTime.Now,
                Notes          = notes ?? string.Empty,
                Reference      = "MANUAL",
            });

            await _db.SaveChangesAsync();
            TempData["Success"] = $"Stock for '{part.Name}' updated: {before} → {after}";
            return RedirectToAction(nameof(Index));
        }

        // ─── GET /Inventory/StockHistory ──────────────────────────────────────────
        // View full stock change log, optionally filtered by part.
        public async Task<IActionResult> StockHistory(int? partId, string? changeType)
        {
            var query = _db.StockHistories
                .Include(sh => sh.Part)
                .AsQueryable();

            if (partId.HasValue && partId > 0)
                query = query.Where(sh => sh.PartId == partId);

            if (!string.IsNullOrWhiteSpace(changeType) && changeType != "All")
                query = query.Where(sh => sh.ChangeType == changeType);

            ViewBag.Histories       = await query.OrderByDescending(sh => sh.Date).ToListAsync();
            ViewBag.Parts           = await _db.Parts.OrderBy(p => p.Name).ToListAsync();
            ViewBag.SelectedPartId  = partId ?? 0;
            ViewBag.SelectedType    = changeType ?? "All";

            return View();
        }
    }
}
