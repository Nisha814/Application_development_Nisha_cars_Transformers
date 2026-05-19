using Microsoft.EntityFrameworkCore;
using CustomerPortal.API.Models;

namespace CustomerPortal.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<CustomerAccount> CustomerAccounts { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<PartRequest> PartRequests { get; set; }
        public DbSet<CustomerNotification> CustomerNotifications { get; set; }
        public DbSet<ServiceHistory> ServiceHistories { get; set; }
        public DbSet<PurchaseHistory> PurchaseHistories { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ServiceCenter> ServiceCenters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal properties precision
            modelBuilder.Entity<ServiceHistory>()
                .Property(s => s.Cost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseHistory>()
                .Property(p => p.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseHistory>()
                .Property(p => p.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceCenter>()
                .Property(s => s.Latitude)
                .HasPrecision(10, 7);

            modelBuilder.Entity<ServiceCenter>()
                .Property(s => s.Longitude)
                .HasPrecision(10, 7);

            // Seed Service Centers
            modelBuilder.Entity<ServiceCenter>().HasData(
                new ServiceCenter
                {
                    Id = 1,
                    Name = "The Nisha Cars Transformers - Downtown Service Center",
                    Address = "123 Main Street, Downtown Cityville",
                    Phone = "+1 (555) 019-2834",
                    Email = "downtown@nishacars.example.com",
                    OperatingHours = "Mon - Sat: 8:00 AM - 6:00 PM",
                    ServicesOffered = "Oil Change, Brake Inspection & Repair, Diagnostics, Tire Rotation & Balance, Battery Service",
                    Latitude = 40.7128m,
                    Longitude = -74.0060m
                },
                new ServiceCenter
                {
                    Id = 2,
                    Name = "The Nisha Cars Transformers - Westside Express Center",
                    Address = "789 Auto Mall Parkway, Westside Industrial Park",
                    Phone = "+1 (555) 014-9876",
                    Email = "westside@nishacars.example.com",
                    OperatingHours = "Mon - Sun: 7:00 AM - 8:00 PM",
                    ServicesOffered = "Express Oil & Filter change, Tire Sales & Installation, Wheel Alignment, Air Filter Replacement",
                    Latitude = 40.7306m,
                    Longitude = -73.9352m
                }
            );
        }
    }
}
