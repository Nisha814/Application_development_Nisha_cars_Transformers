using Microsoft.EntityFrameworkCore;
using VehicleParts.API.Models;

namespace VehicleParts.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<TestConnection> TestConnections { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        
        // Sales & Staff System
        public DbSet<Part> Parts { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesInvoiceItem> SalesInvoiceItems { get; set; }
        public DbSet<CustomerCredit> CustomerCredits { get; set; }

        // Customer Portal System
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<PartRequest> PartRequests { get; set; }
        public DbSet<CustomerNotification> CustomerNotifications { get; set; }

        // Inventory & Stock Management
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<StockLog> StockLogs { get; set; }
        public DbSet<StockAlert> StockAlerts { get; set; }
        public DbSet<DamagedStock> DamagedStocks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<SalesInvoice>()
                .HasOne(si => si.Customer)
                .WithMany(u => u.SalesInvoices)
                .HasForeignKey(si => si.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SalesInvoice>()
                .HasOne(si => si.Staff)
                .WithMany()
                .HasForeignKey(si => si.StaffId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CustomerCredit>()
                .HasOne(cc => cc.Customer)
                .WithMany(u => u.CustomerCredits)
                .HasForeignKey(cc => cc.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CustomerCredit>()
                .HasOne(cc => cc.SalesInvoice)
                .WithMany()
                .HasForeignKey(cc => cc.SalesInvoiceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SalesInvoiceItem>()
                .HasOne(si => si.SalesInvoice)
                .WithMany(s => s.Items)
                .HasForeignKey(si => si.SalesInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Customer)
                .WithMany(u => u.Appointments)
                .HasForeignKey(a => a.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Vehicle)
                .WithMany()
                .HasForeignKey(a => a.VehicleId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Customer)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PartRequest>()
                .HasOne(p => p.Customer)
                .WithMany(u => u.PartRequests)
                .HasForeignKey(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CustomerNotification>()
                .HasOne(n => n.Customer)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Part)
                .WithOne(p => p.InventoryRecord)
                .HasForeignKey<Inventory>(i => i.PartId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Warehouse)
                .WithMany(w => w.Inventories)
                .HasForeignKey(i => i.WarehouseId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<StockLog>()
                .HasOne(s => s.Part)
                .WithMany(p => p.StockLogs)
                .HasForeignKey(s => s.PartId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StockLog>()
                .HasOne(s => s.PerformedBy)
                .WithMany()
                .HasForeignKey(s => s.PerformedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<StockAlert>()
                .HasOne(a => a.Part)
                .WithMany(p => p.StockAlerts)
                .HasForeignKey(a => a.PartId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DamagedStock>()
                .HasOne(d => d.Part)
                .WithMany(p => p.DamagedStockRecords)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DamagedStock>()
                .HasOne(d => d.ReportedBy)
                .WithMany()
                .HasForeignKey(d => d.ReportedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
