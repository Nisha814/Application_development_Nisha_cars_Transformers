using System.Collections.Generic;
using System.Threading.Tasks;
using VehicleParts.API.Models;

namespace VehicleParts.API.Services
{
    public interface IInventoryService
    {
        Task<(bool Success, string? Error)> AdjustStockAsync(
            int partId,
            int quantityChange,
            string movementType,
            int? userId,
            string reference = "",
            string notes = "");

        Task ProcessSaleStockAsync(
            IEnumerable<(int PartId, int Quantity)> items,
            int staffId,
            string invoiceReference);

        Task CheckAndCreateAlertsAsync(int partId);
        Task CheckAllAlertsAsync();
    }
}
