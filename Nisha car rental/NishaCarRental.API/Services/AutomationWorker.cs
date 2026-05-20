using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using NishaCarRental.API.Data;
using NishaCarRental.API.Models;

namespace NishaCarRental.API.Services
{
    public class AutomationWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AutomationWorker> _logger;

        public AutomationWorker(IServiceProvider serviceProvider, ILogger<AutomationWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Automation Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Automation Worker checking for overdue rentals and sending reminders...");

                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<RentalDbContext>();
                        var now = DateTime.UtcNow;

                        // 1. Find rentals that are past end date but status is still 'Active'
                        var overdueRentals = await context.Rentals
                            .Include(r => r.Customer)
                            .Include(r => r.Car)
                            .Where(r => r.EndDate < now && r.Status == "Active")
                            .ToListAsync(stoppingToken);

                        foreach (var rental in overdueRentals)
                        {
                            rental.Status = "Overdue";
                            _logger.LogInformation($"Marking Rental #{rental.Id} as Overdue.");

                            // Create notification
                            var message = $"Rental Return Overdue: {rental.Customer?.Name} has not returned the {rental.Car?.Make} {rental.Car?.Model} (Due: {rental.EndDate:yyyy-MM-dd}).";
                            context.Notifications.Add(new Notification
                            {
                                Message = message,
                                IsRead = false,
                                CreatedAt = now
                            });

                            // Log simulated email reminder
                            if (rental.Customer != null)
                            {
                                context.EmailLogs.Add(new EmailLog
                                {
                                    RecipientEmail = rental.Customer.Email,
                                    Subject = "URGENT: Rental Return Overdue - Nisha Car Rental",
                                    Body = $"Dear {rental.Customer.Name},\n\nOur records show that your rental for the {rental.Car?.Make} {rental.Car?.Model} was due on {rental.EndDate:yyyy-MM-dd}. Please return the vehicle immediately to avoid additional late fees.\n\nBest regards,\nNisha Car Rental Support",
                                    Status = "Sent",
                                    SentAt = now
                                });
                            }
                        }

                        // 2. Find rentals starting in 24 hours that are 'Pending' and send booking reminder
                        var startingSoonRentals = await context.Rentals
                            .Include(r => r.Customer)
                            .Include(r => r.Car)
                            .Where(r => r.StartDate <= now.AddDays(1) && r.StartDate > now && r.Status == "Pending")
                            .ToListAsync(stoppingToken);

                        foreach (var rental in startingSoonRentals)
                        {
                            // In a real app we'd flag that we sent the reminder to avoid duplicates.
                            // For this simulation we check if we already sent one in the last 24 hours.
                            if (rental.Customer != null)
                            {
                                bool alreadySent = await context.EmailLogs
                                    .AnyAsync(e => e.RecipientEmail == rental.Customer.Email && 
                                                   e.Subject.Contains("Upcoming Rental Reminder") &&
                                                   e.SentAt >= now.AddDays(-1), stoppingToken);

                                if (!alreadySent)
                                {
                                    context.EmailLogs.Add(new EmailLog
                                    {
                                        RecipientEmail = rental.Customer.Email,
                                        Subject = "Upcoming Rental Reminder - Nisha Car Rental",
                                        Body = $"Dear {rental.Customer.Name},\n\nThis is a friendly reminder that your booking for the {rental.Car?.Make} {rental.Car?.Model} starts tomorrow, {rental.StartDate:yyyy-MM-dd} at {rental.StartDate:HH:mm}. We look forward to serving you!\n\nBest regards,\nNisha Car Rental Team",
                                        Status = "Sent",
                                        SentAt = now
                                    });

                                    _logger.LogInformation($"Sent upcoming booking reminder to {rental.Customer.Email} for Rental #{rental.Id}.");
                                }
                            }
                        }

                        await context.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred during background automation execution.");
                }

                // Check every 30 seconds for simulation responsiveness
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }

            _logger.LogInformation("Automation Background Service is stopping.");
        }
    }
}
