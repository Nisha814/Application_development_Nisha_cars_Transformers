using Microsoft.AspNetCore.Mvc;
using VehicleParts.API.Data;
using System.Threading.Tasks;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/database-test")]
    public class DatabaseTestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DatabaseTestController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (await _context.Database.CanConnectAsync())
            {
                return Ok(ApiResponse<string>.SuccessResponse("Database connection works successfully"));
            }

            return StatusCode(500, ApiResponse<string>.ErrorResponse("Database connection failed"));
        }
    }
}
