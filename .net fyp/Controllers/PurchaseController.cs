using AutoCarePro.Data;
using AutoCarePro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoCarePro.Controllers
{
    public class PurchaseController : Controller
    {
        private readonly AppDbContext _db;
        public PurchaseController(AppDbContext db) { _db = db; }

        // ─── GET /Purchase ────────────────────────────────────────────────────────
        // Lists all purchase invoices ordered newest first.
        public async Task<IActionResult> Index(string? search, string? status)
        {
            var query = _db.PurchaseInvoices
                .Include(i => i.Vendor)
                .Include(i => i.Items)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(i =>
                    i.InvoiceNumber.Contains(search) ||
                    i.Vendor!.Name.Contains(search) ||
                    i.Notes.Contains(search));

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
                query = query.Where(i => i.Status == status);

            ViewBag.Invoices         = await query.OrderByDescending(i => i.Date).ToListAsync();
            ViewBag.TotalInvoices    = await _db.PurchaseInvoices.CountAsync();
            ViewBag.TotalSpent       = await _db.PurchaseInvoices.SumAsync(i => i.TotalAmount);
            ViewBag.TotalItemsBought = await _db.PurchaseInvoiceItems.SumAsync(i => (int?)i.Quantity) ?? 0;
            ViewBag.Search           = search;
            ViewBag.SelectedStatus   = status ?? "All";

            return View();
        }

        // ─── GET /Purchase/Create ─────────────────────────────────────────────────
        public async Task<IActionResult> Create()
        {
            ViewBag.Vendors = await _db.Vendors.OrderBy(v => v.Name).ToListAsync();
            ViewBag.Parts   = await _db.Parts.OrderBy(p => p.Name).ToListAsync();
            return View();
        }

        // ─── POST /Purchase/Create ────────────────────────────────────────────────
        // Saves the invoice, auto-updates Part.Quantity, and writes StockHistory.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(
            int vendorId,
            string invoiceNumber,
            DateTime date,
            string? notes,
            string? status,
            // Line item arrays (posted as parallel arrays from the form)
            int[]  partIds,
            int[]  quantities,
            decimal[] unitCosts)
        {
            // ── Basic validation ──────────────────────────────────────────────────
            if (vendorId <= 0 || string.IsNullOrWhiteSpace(invoiceNumber) ||
                partIds == null || partIds.Length == 0)
            {
                TempData["Error"] = "Please fill all required fields and add at least one line item.";
                ViewBag.Vendors = await _db.Vendors.OrderBy(v => v.Name).ToListAsync();
                ViewBag.Parts   = await _db.Parts.OrderBy(p => p.Name).ToListAsync();
                return View();
            }

            // ── Duplicate invoice number check ────────────────────────────────────
            if (await _db.PurchaseInvoices.AnyAsync(i => i.InvoiceNumber == invoiceNumber))
            {
                TempData["Error"] = $"Invoice number '{invoiceNumber}' already exists.";
                ViewBag.Vendors = await _db.Vendors.OrderBy(v => v.Name).ToListAsync();
                ViewBag.Parts   = await _db.Parts.OrderBy(p => p.Name).ToListAsync();
                return View();
            }

            // ── Build the invoice header ──────────────────────────────────────────
            decimal total = 0;
            for (int i = 0; i < partIds.Length; i++)
                total += quantities[i] * unitCosts[i];

            var invoice = new PurchaseInvoice
            {
                VendorId      = vendorId,
                InvoiceNumber = invoiceNumber.Trim(),
                Date          = date,
                Notes         = notes ?? string.Empty,
                Status        = status ?? "Received",
                TotalAmount   = total,
            };

            _db.PurchaseInvoices.Add(invoice);
            await _db.SaveChangesAsync(); // need invoice.Id for line items

            // ── Process each line item ────────────────────────────────────────────
            for (int i = 0; i < partIds.Length; i++)
            {
                int     pid   = partIds[i];
                int     qty   = quantities[i];
                decimal cost  = unitCosts[i];

                if (pid <= 0 || qty <= 0) continue;

                var part = await _db.Parts.FindAsync(pid);
                if (part == null) continue;

                int before = part.Quantity;

                // Save line item
                _db.PurchaseInvoiceItems.Add(new PurchaseInvoiceItem
                {
                    PurchaseInvoiceId = invoice.Id,
                    PartId            = pid,
                    Quantity          = qty,
                    UnitCost          = cost,
                    SubTotal          = qty * cost,
                });

                // Auto-update stock
                part.Quantity += qty;

                // Write stock history
                _db.StockHistories.Add(new StockHistory
                {
                    PartId         = pid,
                    ChangeType     = "Purchase",
                    QuantityBefore = before,
                    QuantityChange = qty,
                    QuantityAfter  = part.Quantity,
                    Date           = date,
                    Notes          = $"Purchased via invoice {invoiceNumber}",
                    Reference      = invoiceNumber,
                });
            }

            await _db.SaveChangesAsync();

            TempData["Success"] = $"Purchase invoice '{invoiceNumber}' saved and stock updated!";
            return RedirectToAction(nameof(Details), new { id = invoice.Id });
        }

        // ─── GET /Purchase/Details/{id} ───────────────────────────────────────────
        public async Task<IActionResult> Details(int id)
        {
            var invoice = await _db.PurchaseInvoices
                .Include(i => i.Vendor)
                .Include(i => i.Items)
                    .ThenInclude(li => li.Part)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return NotFound();

            ViewBag.Invoice = invoice;
            return View();
        }
    }
}
