using Microsoft.EntityFrameworkCore;
using StaffSalesAPI.Models;

namespace StaffSalesAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Staff> Staffs { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<CustomerCredit> CustomerCredits { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal precision
            modelBuilder.Entity<Sale>()
                .Property(s => s.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Sale>()
                .Property(s => s.Discount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Sale>()
                .Property(s => s.NetAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SaleItem>()
                .Property(si => si.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SaleItem>()
                .Property(si => si.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<CustomerCredit>()
                .Property(cc => cc.TotalCreditLimit)
                .HasPrecision(18, 2);

            modelBuilder.Entity<CustomerCredit>()
                .Property(cc => cc.CurrentBalance)
                .HasPrecision(18, 2);

            // Seed initial admin user if not present (optional, we can also seed inside Program.cs or let migration handle it)
            // Let's configure table relationships to be explicit if needed, but EF Core defaults are good
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Credit)
                .WithOne(cc => cc.Customer)
                .HasForeignKey<CustomerCredit>(cc => cc.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
