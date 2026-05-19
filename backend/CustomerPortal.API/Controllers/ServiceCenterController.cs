using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerPortal.API.Data;

namespace CustomerPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceCenterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceCenterController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetServiceCenters()
        {
            var centers = await _context.ServiceCenters.ToListAsync();
            return Ok(centers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceCenter(int id)
        {
            var center = await _context.ServiceCenters.FindAsync(id);
            if (center == null)
                return NotFound(new { message = "Service Center not found" });

            return Ok(center);
        }
    }
}
