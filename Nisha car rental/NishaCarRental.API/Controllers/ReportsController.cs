using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NishaCarRental.API.Data;
using NishaCarRental.API.Models;
using PdfSharp.Drawing;
using PdfSharp.Pdf;

namespace NishaCarRental.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly RentalDbContext _context;

        public ReportsController(RentalDbContext context)
        {
            _context = context;
        }

        [HttpGet("financial")]
        public async Task<IActionResult> GetFinancialReport()
        {
            var totalRevenue = await _context.Payments
                .Where(p => p.Status == "Paid")
                .SumAsync(p => p.Amount);

            var totalPending = await _context.Payments
                .Where(p => p.Status == "Pending")
                .SumAsync(p => p.Amount);

            var payments = await _context.Payments
                .Include(p => p.Rental)
                    .ThenInclude(r => r!.Customer)
                .OrderByDescending(p => p.PaymentDate)
                .Take(50)
                .Select(p => new
                {
                    PaymentId = p.Id,
                    CustomerName = p.Rental != null && p.Rental.Customer != null ? p.Rental.Customer.Name : "N/A",
                    Amount = p.Amount,
                    Date = p.PaymentDate,
                    Status = p.Status
                })
                .ToListAsync();

            return Ok(new
            {
                Summary = new
                {
                    TotalCollected = totalRevenue,
                    TotalOutstanding = totalPending,
                    TotalExpected = totalRevenue + totalPending
                },
                Transactions = payments
            });
        }

        [HttpGet("sales")]
        public async Task<IActionResult> GetSalesReport()
        {
            var totalBookings = await _context.Rentals.CountAsync();
            var activeBookings = await _context.Rentals.CountAsync(r => r.Status == "Active");
            var completedBookings = await _context.Rentals.CountAsync(r => r.Status == "Completed");

            var carSales = await _context.Rentals
                .Include(r => r.Car)
                .Where(r => r.Car != null)
                .GroupBy(r => new { r.Car!.Make, r.Car.Model })
                .Select(g => new
                {
                    CarName = $"{g.Key.Make} {g.Key.Model}",
                    BookingsCount = g.Count(),
                    TotalRevenue = g.Sum(r => r.TotalAmount)
                })
                .OrderByDescending(c => c.BookingsCount)
                .ToListAsync();

            return Ok(new
            {
                Summary = new
                {
                    TotalBookings = totalBookings,
                    ActiveBookings = activeBookings,
                    CompletedBookings = completedBookings
                },
                CarSales = carSales
            });
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomerReport()
        {
            var customers = await _context.Customers
                .Include(c => c.Rentals)
                    .ThenInclude(r => r.Payments)
                .Select(c => new
                {
                    CustomerId = c.Id,
                    Name = c.Name,
                    Email = c.Email,
                    Phone = c.Phone,
                    TotalRentals = c.Rentals.Count,
                    TotalSpent = c.Rentals.SelectMany(r => r.Payments).Where(p => p.Status == "Paid").Sum(p => p.Amount)
                })
                .OrderByDescending(c => c.TotalRentals)
                .ToListAsync();

            return Ok(customers);
        }

        [HttpGet("top-spenders")]
        public async Task<IActionResult> GetTopSpendersReport()
        {
            var topSpenders = await _context.Payments
                .Include(p => p.Rental)
                    .ThenInclude(r => r!.Customer)
                .Where(p => p.Status == "Paid" && p.Rental != null && p.Rental.Customer != null)
                .GroupBy(p => new { p.Rental!.Customer!.Id, p.Rental.Customer.Name, p.Rental.Customer.Email })
                .Select(g => new
                {
                    CustomerId = g.Key.Id,
                    Name = g.Key.Name,
                    Email = g.Key.Email,
                    TotalSpent = g.Sum(p => p.Amount),
                    RentalCount = g.Select(p => p.RentalId).Distinct().Count()
                })
                .OrderByDescending(s => s.TotalSpent)
                .Take(20)
                .ToListAsync();

            return Ok(topSpenders);
        }

        [HttpGet("pending-payments")]
        public async Task<IActionResult> GetPendingPaymentsReport()
        {
            var pending = await _context.Payments
                .Include(p => p.Rental)
                    .ThenInclude(r => r!.Customer)
                .Include(p => p.Rental)
                    .ThenInclude(r => r!.Car)
                .Where(p => p.Status == "Pending" && p.Rental != null && p.Rental.Customer != null)
                .Select(p => new
                {
                    PaymentId = p.Id,
                    CustomerName = p.Rental!.Customer!.Name,
                    CustomerPhone = p.Rental.Customer.Phone,
                    CarName = p.Rental.Car != null ? $"{p.Rental.Car.Make} {p.Rental.Car.Model}" : "N/A",
                    Amount = p.Amount,
                    DueDate = p.Rental.EndDate,
                    RentalStatus = p.Rental.Status
                })
                .OrderBy(p => p.DueDate)
                .ToListAsync();

            return Ok(pending);
        }

        [HttpGet("download-pdf")]
        public async Task<IActionResult> DownloadPdfReport([FromQuery] string type)
        {
            // PDF generation using PdfSharp
            var doc = new PdfDocument();
            doc.Info.Title = $"{type.ToUpper()} REPORT - NISHA CAR RENTAL";
            var page = doc.AddPage();
            var gfx = XGraphics.FromPdfPage(page);

            var fontTitle = new XFont("Arial", 18, XFontStyleEx.Bold);
            var fontHeader = new XFont("Arial", 12, XFontStyleEx.Bold);
            var fontBody = new XFont("Arial", 10, XFontStyleEx.Regular);
            var fontBold = new XFont("Arial", 10, XFontStyleEx.Bold);

            // Draw Header
            gfx.DrawString("NISHA CAR RENTAL", fontTitle, XBrushes.DarkBlue, new XPoint(40, 50));
            gfx.DrawString($"{type.ToUpper()} REPORT", fontHeader, XBrushes.DarkGray, new XPoint(40, 80));
            gfx.DrawString($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}", fontBody, XBrushes.Black, new XPoint(40, 100));
            gfx.DrawLine(XPens.DarkBlue, 40, 110, page.Width - 40, 110);

            int yPos = 140;

            if (type.ToLower() == "financial")
            {
                var totalRevenue = await _context.Payments.Where(p => p.Status == "Paid").SumAsync(p => p.Amount);
                var totalPending = await _context.Payments.Where(p => p.Status == "Pending").SumAsync(p => p.Amount);

                gfx.DrawString("Financial Summary:", fontHeader, XBrushes.DarkBlue, new XPoint(40, yPos));
                yPos += 25;
                gfx.DrawString($"Total Revenue Collected: ${totalRevenue:N2}", fontBody, XBrushes.Black, new XPoint(50, yPos));
                yPos += 20;
                gfx.DrawString($"Total Outstanding Balance: ${totalPending:N2}", fontBody, XBrushes.Black, new XPoint(50, yPos));
                yPos += 20;
                gfx.DrawString($"Total Expected Billings: ${(totalRevenue + totalPending):N2}", fontBold, XBrushes.Black, new XPoint(50, yPos));

                yPos += 40;
                gfx.DrawString("Recent Transactions:", fontHeader, XBrushes.DarkBlue, new XPoint(40, yPos));
                yPos += 20;

                // Draw Table Headers
                gfx.DrawString("Cust. Name", fontBold, XBrushes.Black, new XPoint(40, yPos));
                gfx.DrawString("Amount", fontBold, XBrushes.Black, new XPoint(220, yPos));
                gfx.DrawString("Date", fontBold, XBrushes.Black, new XPoint(340, yPos));
                gfx.DrawString("Status", fontBold, XBrushes.Black, new XPoint(460, yPos));
                yPos += 15;
                gfx.DrawLine(XPens.LightGray, 40, yPos, page.Width - 40, yPos);
                yPos += 15;

                var txs = await _context.Payments
                    .Include(p => p.Rental).ThenInclude(r => r!.Customer)
                    .OrderByDescending(p => p.PaymentDate).Take(15).ToListAsync();

                foreach (var tx in txs)
                {
                    if (yPos > page.Height - 50) break;
                    var name = tx.Rental?.Customer?.Name ?? "N/A";
                    gfx.DrawString(name.Length > 25 ? name.Substring(0, 22) + "..." : name, fontBody, XBrushes.Black, new XPoint(40, yPos));
                    gfx.DrawString($"${tx.Amount:N2}", fontBody, XBrushes.Black, new XPoint(220, yPos));
                    gfx.DrawString(tx.PaymentDate.ToString("yyyy-MM-dd"), fontBody, XBrushes.Black, new XPoint(340, yPos));
                    gfx.DrawString(tx.Status, fontBody, tx.Status == "Paid" ? XBrushes.Green : XBrushes.Red, new XPoint(460, yPos));
                    yPos += 20;
                }
            }
            else if (type.ToLower() == "sales")
            {
                var total = await _context.Rentals.CountAsync();
                var active = await _context.Rentals.CountAsync(r => r.Status == "Active");

                gfx.DrawString("Sales Overview:", fontHeader, XBrushes.DarkBlue, new XPoint(40, yPos));
                yPos += 25;
                gfx.DrawString($"Total Booking Count: {total}", fontBody, XBrushes.Black, new XPoint(50, yPos));
                yPos += 20;
                gfx.DrawString($"Active Rentals currently: {active}", fontBody, XBrushes.Black, new XPoint(50, yPos));

                yPos += 40;
                gfx.DrawString("Vehicle Sales Summary (Top Performing):", fontHeader, XBrushes.DarkBlue, new XPoint(40, yPos));
                yPos += 20;

                // Draw Table Headers
                gfx.DrawString("Vehicle", fontBold, XBrushes.Black, new XPoint(40, yPos));
                gfx.DrawString("Bookings", fontBold, XBrushes.Black, new XPoint(250, yPos));
                gfx.DrawString("Total Earned", fontBold, XBrushes.Black, new XPoint(380, yPos));
                yPos += 15;
                gfx.DrawLine(XPens.LightGray, 40, yPos, page.Width - 40, yPos);
                yPos += 15;

                var sales = await _context.Rentals
                    .Include(r => r.Car).Where(r => r.Car != null)
                    .GroupBy(r => new { r.Car!.Make, r.Car.Model })
                    .Select(g => new { Name = $"{g.Key.Make} {g.Key.Model}", Count = g.Count(), Total = g.Sum(r => r.TotalAmount) })
                    .OrderByDescending(s => s.Count).Take(15).ToListAsync();

                foreach (var s in sales)
                {
                    if (yPos > page.Height - 50) break;
                    gfx.DrawString(s.Name, fontBody, XBrushes.Black, new XPoint(40, yPos));
                    gfx.DrawString(s.Count.ToString(), fontBody, XBrushes.Black, new XPoint(250, yPos));
                    gfx.DrawString($"${s.Total:N2}", fontBody, XBrushes.Black, new XPoint(380, yPos));
                    yPos += 20;
                }
            }
            else if (type.ToLower() == "pending-payments")
            {
                gfx.DrawString("Outstanding Client Payments:", fontHeader, XBrushes.DarkBlue, new XPoint(40, yPos));
                yPos += 25;

                gfx.DrawString("Client", fontBold, XBrushes.Black, new XPoint(40, yPos));
                gfx.DrawString("Phone", fontBold, XBrushes.Black, new XPoint(180, yPos));
                gfx.DrawString("Vehicle", fontBold, XBrushes.Black, new XPoint(280, yPos));
                gfx.DrawString("Owed", fontBold, XBrushes.Black, new XPoint(420, yPos));
                gfx.DrawString("Due Date", fontBold, XBrushes.Black, new XPoint(500, yPos));
                yPos += 15;
                gfx.DrawLine(XPens.LightGray, 40, yPos, page.Width - 40, yPos);
                yPos += 15;

                var overdue = await _context.Payments
                    .Include(p => p.Rental).ThenInclude(r => r!.Customer)
                    .Include(p => p.Rental).ThenInclude(r => r!.Car)
                    .Where(p => p.Status == "Pending" && p.Rental != null && p.Rental.Customer != null)
                    .OrderBy(p => p.Rental!.EndDate).Take(20).ToListAsync();

                foreach (var p in overdue)
                {
                    if (yPos > page.Height - 50) break;
                    var name = p.Rental!.Customer!.Name;
                    var car = p.Rental.Car != null ? $"{p.Rental.Car.Make} {p.Rental.Car.Model}" : "N/A";
                    gfx.DrawString(name.Length > 20 ? name.Substring(0, 17) + "..." : name, fontBody, XBrushes.Black, new XPoint(40, yPos));
                    gfx.DrawString(p.Rental.Customer.Phone, fontBody, XBrushes.Black, new XPoint(180, yPos));
                    gfx.DrawString(car.Length > 20 ? car.Substring(0, 17) + "..." : car, fontBody, XBrushes.Black, new XPoint(280, yPos));
                    gfx.DrawString($"${p.Amount:N2}", fontBody, XBrushes.Black, new XPoint(420, yPos));
                    gfx.DrawString(p.Rental.EndDate.ToString("yyyy-MM-dd"), fontBody, XBrushes.Black, new XPoint(500, yPos));
                    yPos += 20;
                }
            }
            else // Default list (like top spenders)
            {
                gfx.DrawString("Top Customers Ranking:", fontHeader, XBrushes.DarkBlue, new XPoint(40, yPos));
                yPos += 25;

                gfx.DrawString("Customer", fontBold, XBrushes.Black, new XPoint(40, yPos));
                gfx.DrawString("Email", fontBold, XBrushes.Black, new XPoint(200, yPos));
                gfx.DrawString("Rentals", fontBold, XBrushes.Black, new XPoint(400, yPos));
                gfx.DrawString("Total Paid", fontBold, XBrushes.Black, new XPoint(480, yPos));
                yPos += 15;
                gfx.DrawLine(XPens.LightGray, 40, yPos, page.Width - 40, yPos);
                yPos += 15;

                var top = await _context.Payments
                    .Include(p => p.Rental).ThenInclude(r => r!.Customer)
                    .Where(p => p.Status == "Paid" && p.Rental != null && p.Rental.Customer != null)
                    .GroupBy(p => new { p.Rental!.Customer!.Name, p.Rental.Customer.Email })
                    .Select(g => new { Name = g.Key.Name, Email = g.Key.Email, Count = g.Select(p => p.RentalId).Distinct().Count(), Total = g.Sum(p => p.Amount) })
                    .OrderByDescending(t => t.Total).Take(20).ToListAsync();

                foreach (var t in top)
                {
                    if (yPos > page.Height - 50) break;
                    gfx.DrawString(t.Name.Length > 22 ? t.Name.Substring(0, 19) + "..." : t.Name, fontBody, XBrushes.Black, new XPoint(40, yPos));
                    gfx.DrawString(t.Email, fontBody, XBrushes.Black, new XPoint(200, yPos));
                    gfx.DrawString(t.Count.ToString(), fontBody, XBrushes.Black, new XPoint(400, yPos));
                    gfx.DrawString($"${t.Total:N2}", fontBold, XBrushes.Black, new XPoint(480, yPos));
                    yPos += 20;
                }
            }

            // Save pdf to MemoryStream and return File
            using var ms = new MemoryStream();
            doc.Save(ms);
            var fileBytes = ms.ToArray();
            return File(fileBytes, "application/pdf", $"{type}_report_{DateTime.Now:yyyyMMdd}.pdf");
        }
    }
}
