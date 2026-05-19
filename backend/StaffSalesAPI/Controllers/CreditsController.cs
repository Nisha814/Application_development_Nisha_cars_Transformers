using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StaffSalesAPI.Data;
using StaffSalesAPI.DTOs;
using StaffSalesAPI.Models;

namespace StaffSalesAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreditsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CreditsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/credits
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CreditResponseDto>>> GetCredits()
        {
            var credits = await _context.CustomerCredits
                .Include(cc => cc.Customer)
                .ToListAsync();

            var response = credits.Select(cc => new CreditResponseDto
            {
                CustomerId = cc.CustomerId,
                CustomerName = cc.Customer?.FullName ?? "Unknown Customer",
                TotalCreditLimit = cc.TotalCreditLimit,
                CurrentBalance = cc.CurrentBalance,
                AvailableLimit = cc.TotalCreditLimit - cc.CurrentBalance,
                LastUpdated = cc.LastUpdated
            });

            return Ok(response);
        }

        // POST: api/credits/payment
        [HttpPost("payment")]
        public async Task<ActionResult<CreditResponseDto>> RecordPayment([FromBody] CreditPaymentDto dto)
        {
            if (dto == null || dto.PaymentAmount <= 0)
            {
                return BadRequest("Invalid transaction. Payment amount must be greater than zero.");
            }

            var credit = await _context.CustomerCredits
                .Include(cc => cc.Customer)
                .FirstOrDefaultAsync(cc => cc.CustomerId == dto.CustomerId);

            if (credit == null)
            {
                return NotFound("Credit profile not found for this customer.");
            }

            if (credit.CurrentBalance <= 0)
            {
                return BadRequest("Customer does not have an active outstanding balance to pay.");
            }

            // Deduct payment from debt
            credit.CurrentBalance -= dto.PaymentAmount;
            if (credit.CurrentBalance < 0)
            {
                credit.CurrentBalance = 0; // prevent negative debt balance
            }
            credit.LastUpdated = DateTime.UtcNow;

            // Optional: If outstanding balance is paid off, update related Sales statuses to "Paid"
            if (credit.CurrentBalance == 0)
            {
                var pendingSales = await _context.Sales
                    .Where(s => s.CustomerId == dto.CustomerId && s.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                    .ToListAsync();
                
                foreach (var sale in pendingSales)
                {
                    sale.Status = "Paid";
                }
            }

            await _context.SaveChangesAsync();

            var response = new CreditResponseDto
            {
                CustomerId = credit.CustomerId,
                CustomerName = credit.Customer?.FullName ?? "Unknown Customer",
                TotalCreditLimit = credit.TotalCreditLimit,
                CurrentBalance = credit.CurrentBalance,
                AvailableLimit = credit.TotalCreditLimit - credit.CurrentBalance,
                LastUpdated = credit.LastUpdated
            };

            return Ok(response);
        }
    }
}
