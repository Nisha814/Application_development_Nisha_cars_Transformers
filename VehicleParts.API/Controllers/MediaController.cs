using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VehicleParts.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MediaController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public MediaController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string type = "profiles")
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file uploaded" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { success = false, message = "Invalid file type. Only JPG, PNG and WEBP are allowed." });

            // Normalize type
            var folderName = type == "vendors" ? "vendors" : "profiles";
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", folderName);
            
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL
            var fileUrl = $"/uploads/{folderName}/{fileName}";
            return Ok(new { success = true, message = "File uploaded successfully", data = new { url = fileUrl } });
        }
    }
}
