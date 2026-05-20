using Microsoft.EntityFrameworkCore;
using NishaCarRental.API.Models;

namespace NishaCarRental.API.Data
{
    public class RentalDbContext : DbContext
    {
        public RentalDbContext(DbContextOptions<RentalDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Car> Cars { get; set; }
        public DbSet<Rental> Rentals { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<EmailLog> EmailLogs { get; set; }
        public DbSet<AIPrediction> AIPredictions { get; set; }
        public DbSet<AnalyticsCache> AnalyticsCaches { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Relationships

            // Rental -> Customer (1-to-many)
            modelBuilder.Entity<Rental>()
                .HasOne(r => r.Customer)
                .WithMany(c => c.Rentals)
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Rental -> Car (1-to-many)
            modelBuilder.Entity<Rental>()
                .HasOne(r => r.Car)
                .WithMany(c => c.Rentals)
                .HasForeignKey(r => r.CarId)
                .OnDelete(DeleteBehavior.Cascade);

            // Payment -> Rental (1-to-many)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Rental)
                .WithMany(r => r.Payments)
                .HasForeignKey(p => p.RentalId)
                .OnDelete(DeleteBehavior.Cascade);

            // Precision for decimals (critical for PostgreSQL decimal mapping)
            modelBuilder.Entity<Car>()
                .Property(c => c.DailyRate)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Rental>()
                .Property(r => r.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<AIPrediction>()
                .Property(p => p.PredictedValue)
                .HasPrecision(18, 2);

            modelBuilder.Entity<AIPrediction>()
                .Property(p => p.Confidence)
                .HasPrecision(5, 4); // E.g., 0.9500 (95.00%)
        }
    }
}
