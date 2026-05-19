using System;
using System.Linq;
using StaffSalesAPI.Models;
using StaffSalesAPI.Services;

namespace StaffSalesAPI.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context, IPasswordHasher passwordHasher)
        {
            // Seed Staff members
            if (!context.Staffs.Any())
            {
                var admin = new Staff
                {
                    Username = "admin",
                    PasswordHash = passwordHasher.HashPassword("admin123"),
                    FullName = "Alexander Wright",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };

                var staff = new Staff
                {
                    Username = "staff",
                    PasswordHash = passwordHasher.HashPassword("staff123"),
                    FullName = "Sarah Jenkins",
                    Role = "Staff",
                    CreatedAt = DateTime.UtcNow
                };

                context.Staffs.AddRange(admin, staff);
                context.SaveChanges();
                Console.WriteLine("Database Seed: Default staff accounts created (admin/admin123, staff/staff123).");
            }

            // Optional: Seed a few sample customers to make the dashboard look rich out-of-the-box
            if (!context.Customers.Any())
            {
                var customer1 = new Customer
                {
                    FullName = "Liam Henderson",
                    Email = "liam.h@example.com",
                    PhoneNumber = "+1-555-0199",
                    Address = "742 Evergreen Terrace, Springfield",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                };

                var customer2 = new Customer
                {
                    FullName = "Sophia Martinez",
                    Email = "sophia.m@example.com",
                    PhoneNumber = "+1-555-0143",
                    Address = "104 Main Street, Boston",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                };

                context.Customers.AddRange(customer1, customer2);
                context.SaveChanges();

                // Seed Credit for the first customer
                var credit = new CustomerCredit
                {
                    CustomerId = customer1.Id,
                    TotalCreditLimit = 2000.00m,
                    CurrentBalance = 450.00m,
                    LastUpdated = DateTime.UtcNow
                };

                context.CustomerCredits.Add(credit);
                context.SaveChanges();
                Console.WriteLine("Database Seed: Sample customers and credits seeded.");
            }
        }
    }
}
