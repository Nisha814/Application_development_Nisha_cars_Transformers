using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.API.Models;

namespace VehicleParts.API.Controllers
{
    [ApiController]
    [Route("api/admin-test")]
    public class AdminTestController : ControllerBase
    {
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult Get()
        {
            return Ok(ApiResponse<string>.SuccessResponse("Admin access successful"));
        }
    }
}
