using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using VehicleParts.API.Data;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class PartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetParts()
        {
            var parts = await _context.Parts
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.PartNumber,
                    p.Price,
                    p.StockQuantity
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse("Parts retrieved successfully", parts));
        }
    }
}
