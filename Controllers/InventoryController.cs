using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.Models;
using VehicleParts.API.Services;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IInventoryService _inventoryService;

        public InventoryController(AppDbContext context, IInventoryService inventoryService)
        {
            _context = context;
            _inventoryService = inventoryService;
        }

        private int? GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return int.TryParse(claim, out int id) ? id : null;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            await _inventoryService.CheckAllAlertsAsync();
            var parts = await _context.Parts.Include(p => p.InventoryRecord).ToListAsync();
            var totalItems = parts.Count;
            var totalUnits = parts.Sum(p => p.StockQuantity);
            var totalValuation = parts.Sum(p => p.StockQuantity * (p.InventoryRecord?.UnitCost ?? p.Price * 0.6m));
            var lowStockCount = parts.Count(p => p.StockQuantity < Math.Max(10, p.InventoryRecord?.MinStockLevel ?? 10));
            var outOfStockCount = parts.Count(p => p.StockQuantity == 0);
            var activeAlerts = await _context.StockAlerts.CountAsync(a => !a.IsResolved);
            var recentLogs = await _context.StockLogs
                .Include(s => s.Part)
                .OrderByDescending(s => s.CreatedAt)
                .Take(10)
                .Select(s => new
                {
                    s.Id,
                    s.MovementType,
                    s.Quantity,
                    s.QuantityBefore,
                    s.QuantityAfter,
                    s.Reference,
                    s.CreatedAt,
                    PartName = s.Part != null ? s.Part.Name : ""
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Inventory dashboard loaded", new
            {
                TotalItems = totalItems,
                TotalUnits = totalUnits,
                TotalValuation = totalValuation,
                LowStockCount = lowStockCount,
                OutOfStockCount = outOfStockCount,
                ActiveAlerts = activeAlerts,
                RecentLogs = recentLogs
            }));
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetItems()
        {
            await _inventoryService.CheckAllAlertsAsync();
            var items = await _context.Parts
                .Include(p => p.InventoryRecord)
                    .ThenInclude(i => i!.Warehouse)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.PartNumber,
                    p.Price,
                    p.StockQuantity,
                    MinStockLevel = p.InventoryRecord != null ? Math.Max(10, p.InventoryRecord.MinStockLevel) : 10,
                    UnitCost = p.InventoryRecord != null ? p.InventoryRecord.UnitCost : p.Price * 0.6m,
                    Valuation = p.StockQuantity * (p.InventoryRecord != null ? p.InventoryRecord.UnitCost : p.Price * 0.6m),
                    WarehouseId = p.InventoryRecord != null ? p.InventoryRecord.WarehouseId : null,
                    WarehouseName = p.InventoryRecord != null && p.InventoryRecord.Warehouse != null ? p.InventoryRecord.Warehouse.Name : null,
                    IsLowStock = p.StockQuantity < (p.InventoryRecord != null ? Math.Max(10, p.InventoryRecord.MinStockLevel) : 10)
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Inventory items retrieved", items));
        }

        [HttpPost("items")]
        public async Task<IActionResult> CreateItem([FromBody] CreateInventoryItemDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(ApiResponse<object>.ErrorResponse("Part name is required"));

            // Check for duplicate part number
            if (!string.IsNullOrWhiteSpace(dto.PartNumber))
            {
                var duplicate = await _context.Parts.AnyAsync(p => p.PartNumber == dto.PartNumber);
                if (duplicate)
                    return BadRequest(ApiResponse<object>.ErrorResponse($"A part with part number '{dto.PartNumber}' already exists."));
            }

            var part = new Part
            {
                Name = dto.Name,
                PartNumber = dto.PartNumber,
                Price = dto.Price,
                StockQuantity = 0
            };

            _context.Parts.Add(part);
            await _context.SaveChangesAsync();

            var inventory = new Inventory
            {
                PartId = part.Id,
                MinStockLevel = dto.MinStockLevel,
                UnitCost = dto.UnitCost > 0 ? dto.UnitCost : dto.Price * 0.6m,
                WarehouseId = dto.WarehouseId
            };
            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            if (dto.InitialStock > 0)
            {
                await _inventoryService.AdjustStockAsync(
                    part.Id, dto.InitialStock, "StockIn", GetUserId(),
                    "INIT", "Initial stock on item creation");
            }

            return Ok(ApiResponse<object>.SuccessResponse("Inventory item created", new { part.Id }));
        }

        [HttpDelete("items/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var part = await _context.Parts.Include(p => p.InventoryRecord).FirstOrDefaultAsync(p => p.Id == id);
            if (part == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Item not found"));

            // Check if part is used in any sales invoice
            var usedInSales = await _context.SalesInvoiceItems.AnyAsync(s => s.PartId == id);
            if (usedInSales)
                return BadRequest(ApiResponse<object>.ErrorResponse("Cannot delete this part — it has existing sales records."));

            // Remove inventory record first
            if (part.InventoryRecord != null)
                _context.Inventories.Remove(part.InventoryRecord);

            // Remove stock logs
            var logs = _context.StockLogs.Where(l => l.PartId == id);
            _context.StockLogs.RemoveRange(logs);

            // Remove stock alerts
            var alerts = _context.StockAlerts.Where(a => a.PartId == id);
            _context.StockAlerts.RemoveRange(alerts);

            _context.Parts.Remove(part);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Item deleted successfully"));
        }

        [HttpPut("items/{id}")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateInventoryItemDto dto)
        {
            var part = await _context.Parts.Include(p => p.InventoryRecord).FirstOrDefaultAsync(p => p.Id == id);
            if (part == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Item not found"));

            part.Name = dto.Name ?? part.Name;
            part.PartNumber = dto.PartNumber ?? part.PartNumber;
            part.Price = dto.Price > 0 ? dto.Price : part.Price;

            if (part.InventoryRecord == null)
            {
                part.InventoryRecord = new Inventory { PartId = part.Id };
                _context.Inventories.Add(part.InventoryRecord);
            }

            part.InventoryRecord.MinStockLevel = dto.MinStockLevel;
            part.InventoryRecord.UnitCost = dto.UnitCost;
            part.InventoryRecord.WarehouseId = dto.WarehouseId;
            part.InventoryRecord.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _inventoryService.CheckAndCreateAlertsAsync(id);

            return Ok(ApiResponse<object>.SuccessResponse("Inventory item updated"));
        }

        [HttpPost("stock-in")]
        public async Task<IActionResult> StockIn([FromBody] StockMovementDto dto)
        {
            if (dto.Quantity <= 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Quantity must be positive"));

            var result = await _inventoryService.AdjustStockAsync(
                dto.PartId, dto.Quantity, "StockIn", GetUserId(), dto.Reference, dto.Notes ?? "Manual stock in");

            if (!result.Success)
                return BadRequest(ApiResponse<object>.ErrorResponse(result.Error!));

            return Ok(ApiResponse<object>.SuccessResponse("Stock added successfully"));
        }

        [HttpPost("stock-out")]
        public async Task<IActionResult> StockOut([FromBody] StockMovementDto dto)
        {
            if (dto.Quantity <= 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Quantity must be positive"));

            var result = await _inventoryService.AdjustStockAsync(
                dto.PartId, -dto.Quantity, "StockOut", GetUserId(), dto.Reference, dto.Notes ?? "Manual stock out");

            if (!result.Success)
                return BadRequest(ApiResponse<object>.ErrorResponse(result.Error!));

            return Ok(ApiResponse<object>.SuccessResponse("Stock removed successfully"));
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] int? partId, [FromQuery] string? movementType)
        {
            var query = _context.StockLogs.Include(s => s.Part).Include(s => s.PerformedBy).AsQueryable();

            if (partId.HasValue)
                query = query.Where(s => s.PartId == partId.Value);
            if (!string.IsNullOrWhiteSpace(movementType))
                query = query.Where(s => s.MovementType == movementType);

            var logs = await query
                .OrderByDescending(s => s.CreatedAt)
                .Take(200)
                .Select(s => new
                {
                    s.Id,
                    s.PartId,
                    PartName = s.Part != null ? s.Part.Name : "",
                    s.MovementType,
                    s.Quantity,
                    s.QuantityBefore,
                    s.QuantityAfter,
                    s.Reference,
                    s.Notes,
                    PerformedBy = s.PerformedBy != null ? s.PerformedBy.FullName : "System",
                    s.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Stock logs retrieved", logs));
        }

        [HttpGet("alerts")]
        public async Task<IActionResult> GetAlerts([FromQuery] bool activeOnly = true)
        {
            await _inventoryService.CheckAllAlertsAsync();
            var query = _context.StockAlerts.Include(a => a.Part).AsQueryable();
            if (activeOnly)
                query = query.Where(a => !a.IsResolved);

            var alerts = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.PartId,
                    PartName = a.Part != null ? a.Part.Name : "",
                    a.AlertType,
                    a.Message,
                    a.CurrentQuantity,
                    a.Threshold,
                    a.IsResolved,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Stock alerts retrieved", alerts));
        }

        [HttpPost("alerts/{id}/resolve")]
        public async Task<IActionResult> ResolveAlert(int id)
        {
            var alert = await _context.StockAlerts.FindAsync(id);
            if (alert == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Alert not found"));

            alert.IsResolved = true;
            alert.ResolvedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Alert resolved"));
        }

        [HttpGet("damaged")]
        public async Task<IActionResult> GetDamagedStock()
        {
            var records = await _context.DamagedStocks
                .Include(d => d.Part)
                .Include(d => d.ReportedBy)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.PartId,
                    PartName = d.Part != null ? d.Part.Name : "",
                    d.Quantity,
                    d.Reason,
                    ReportedBy = d.ReportedBy != null ? d.ReportedBy.FullName : "",
                    d.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Damaged stock records retrieved", records));
        }

        [HttpPost("damaged")]
        public async Task<IActionResult> ReportDamaged([FromBody] ReportDamagedDto dto)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
                return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user"));

            if (dto.Quantity <= 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Quantity must be positive"));

            var result = await _inventoryService.AdjustStockAsync(
                dto.PartId, -dto.Quantity, "Damaged", userId,
                $"DMG-{DateTime.UtcNow:yyyyMMdd}", dto.Reason);

            if (!result.Success)
                return BadRequest(ApiResponse<object>.ErrorResponse(result.Error!));

            _context.DamagedStocks.Add(new DamagedStock
            {
                PartId = dto.PartId,
                Quantity = dto.Quantity,
                Reason = dto.Reason ?? "",
                ReportedByUserId = userId.Value
            });
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Damaged stock recorded"));
        }

        [HttpGet("valuation")]
        public async Task<IActionResult> GetValuation()
        {
            var items = await _context.Parts
                .Include(p => p.InventoryRecord)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.StockQuantity,
                    UnitCost = p.InventoryRecord != null ? p.InventoryRecord.UnitCost : p.Price * 0.6m,
                    RetailValue = p.StockQuantity * p.Price,
                    CostValue = p.StockQuantity * (p.InventoryRecord != null ? p.InventoryRecord.UnitCost : p.Price * 0.6m)
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Inventory valuation calculated", new
            {
                TotalCostValue = items.Sum(i => i.CostValue),
                TotalRetailValue = items.Sum(i => i.RetailValue),
                Items = items
            }));
        }

        [HttpGet("warehouses")]
        public async Task<IActionResult> GetWarehouses()
        {
            var warehouses = await _context.Warehouses
                .Where(w => w.IsActive)
                .Select(w => new { w.Id, w.Name, w.Location })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Warehouses retrieved", warehouses));
        }

        [HttpPost("warehouses")]
        public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(ApiResponse<object>.ErrorResponse("Warehouse name is required"));

            var warehouse = new Warehouse { Name = dto.Name, Location = dto.Location ?? "" };
            _context.Warehouses.Add(warehouse);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Warehouse created", new { warehouse.Id }));
        }
    }

    public class CreateInventoryItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string? PartNumber { get; set; }
        public decimal Price { get; set; }
        public decimal UnitCost { get; set; }
        public int InitialStock { get; set; }
        public int MinStockLevel { get; set; } = 10;
        public int? WarehouseId { get; set; }
    }

    public class UpdateInventoryItemDto
    {
        public string? Name { get; set; }
        public string? PartNumber { get; set; }
        public decimal Price { get; set; }
        public decimal UnitCost { get; set; }
        public int MinStockLevel { get; set; } = 10;
        public int? WarehouseId { get; set; }
    }

    public class StockMovementDto
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
    }

    public class ReportDamagedDto
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
        public string? Reason { get; set; }
    }

    public class CreateWarehouseDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Location { get; set; }
    }
}
