using Microsoft.EntityFrameworkCore;
using AutoCarePro.Models;

namespace AutoCarePro.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // --- Existing ---
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Service> Services { get; set; }

        // --- Inventory & Purchase System ---
        public DbSet<Part> Parts { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
        public DbSet<StockHistory> StockHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Existing relationships ---
            modelBuilder.Entity<Customer>()
                .HasMany(c => c.Vehicles)
                .WithOne(v => v.Customer)
                .HasForeignKey(v => v.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Vehicle>()
                .HasMany(v => v.Services)
                .WithOne(s => s.Vehicle)
                .HasForeignKey(s => s.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- Vendor → PurchaseInvoices ---
            modelBuilder.Entity<Vendor>()
                .HasMany(v => v.PurchaseInvoices)
                .WithOne(p => p.Vendor)
                .HasForeignKey(p => p.VendorId)
                .OnDelete(DeleteBehavior.Restrict); // Don't cascade-delete invoices when vendor deleted

            // --- PurchaseInvoice → PurchaseInvoiceItems ---
            modelBuilder.Entity<PurchaseInvoice>()
                .HasMany(i => i.Items)
                .WithOne(li => li.PurchaseInvoice)
                .HasForeignKey(li => li.PurchaseInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- Part → PurchaseInvoiceItems (restrict deletion if used in an invoice) ---
            modelBuilder.Entity<Part>()
                .HasMany(p => p.PurchaseItems)
                .WithOne(li => li.Part)
                .HasForeignKey(li => li.PartId)
                .OnDelete(DeleteBehavior.Restrict);

            // --- Part → StockHistories ---
            modelBuilder.Entity<Part>()
                .HasMany(p => p.StockHistories)
                .WithOne(sh => sh.Part)
                .HasForeignKey(sh => sh.PartId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
