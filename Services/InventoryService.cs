using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.Models;

namespace VehicleParts.API.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;

        public InventoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string? Error)> AdjustStockAsync(
            int partId,
            int quantityChange,
            string movementType,
            int? userId,
            string reference = "",
            string notes = "")
        {
            var part = await _context.Parts
                .Include(p => p.InventoryRecord)
                .FirstOrDefaultAsync(p => p.Id == partId);

            if (part == null)
                return (false, "Part not found");

            var before = part.StockQuantity;
            var after = before + quantityChange;

            if (after < 0)
                return (false, $"Insufficient stock. Available: {before}");

            part.StockQuantity = after;

            if (part.InventoryRecord != null)
                part.InventoryRecord.LastUpdated = DateTime.UtcNow;

            _context.StockLogs.Add(new StockLog
            {
                PartId = partId,
                MovementType = movementType,
                Quantity = Math.Abs(quantityChange),
                QuantityBefore = before,
                QuantityAfter = after,
                Reference = reference ?? "",
                Notes = notes ?? "",
                PerformedByUserId = userId
            });

            await _context.SaveChangesAsync();
            await CheckAndCreateAlertsAsync(partId);

            return (true, null);
        }

        public async Task ProcessSaleStockAsync(
            IEnumerable<(int PartId, int Quantity)> items,
            int staffId,
            string invoiceReference)
        {
            foreach (var (partId, quantity) in items)
            {
                await AdjustStockAsync(
                    partId,
                    -quantity,
                    "Sale",
                    staffId,
                    invoiceReference,
                    "Auto stock deduction from sale");
            }
        }

        public async Task CheckAndCreateAlertsAsync(int partId)
        {
            var part = await _context.Parts
                .Include(p => p.InventoryRecord)
                .FirstOrDefaultAsync(p => p.Id == partId);

            if (part == null) return;

            var threshold = part.InventoryRecord?.MinStockLevel ?? 10;
            if (threshold < 10) threshold = 10; // Rule: "the stock alert should be on if there is stock less than 10"
            var qty = part.StockQuantity;

            var existingAlerts = await _context.StockAlerts
                .Where(a => a.PartId == partId && !a.IsResolved)
                .ToListAsync();

            if (qty < threshold)
            {
                var alertType = qty == 0 ? "OutOfStock" : "LowStock";
                var message = qty == 0
                    ? $"{part.Name} is out of stock"
                    : $"{part.Name} is low on stock ({qty} remaining, threshold: {threshold})";

                if (!existingAlerts.Any(a => a.AlertType == alertType))
                {
                    _context.StockAlerts.Add(new StockAlert
                    {
                        PartId = partId,
                        AlertType = alertType,
                        Message = message,
                        CurrentQuantity = qty,
                        Threshold = threshold
                    });
                    await _context.SaveChangesAsync();
                }
                else
                {
                    foreach (var alert in existingAlerts)
                    {
                        alert.CurrentQuantity = qty;
                        alert.Message = message;
                    }
                    await _context.SaveChangesAsync();
                }
            }
            else if (existingAlerts.Any())
            {
                foreach (var alert in existingAlerts)
                {
                    alert.IsResolved = true;
                    alert.ResolvedAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }
        }

        public async Task CheckAllAlertsAsync()
        {
            var parts = await _context.Parts.Include(p => p.InventoryRecord).ToListAsync();
            var activeAlerts = await _context.StockAlerts.Where(a => !a.IsResolved).ToListAsync();

            foreach (var part in parts)
            {
                var threshold = part.InventoryRecord?.MinStockLevel ?? 10;
                if (threshold < 10) threshold = 10;

                var qty = part.StockQuantity;
                var existingAlert = activeAlerts.FirstOrDefault(a => a.PartId == part.Id);

                if (qty < threshold)
                {
                    var alertType = qty == 0 ? "OutOfStock" : "LowStock";
                    var message = qty == 0
                        ? $"{part.Name} is out of stock"
                        : $"{part.Name} is low on stock ({qty} remaining, threshold: {threshold})";

                    if (existingAlert == null)
                    {
                        _context.StockAlerts.Add(new StockAlert
                        {
                            PartId = part.Id,
                            AlertType = alertType,
                            Message = message,
                            CurrentQuantity = qty,
                            Threshold = threshold,
                            IsResolved = false,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    else
                    {
                        existingAlert.AlertType = alertType;
                        existingAlert.CurrentQuantity = qty;
                        existingAlert.Message = message;
                        existingAlert.Threshold = threshold;
                    }
                }
                else if (existingAlert != null)
                {
                    existingAlert.IsResolved = true;
                    existingAlert.ResolvedAt = DateTime.UtcNow;
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
