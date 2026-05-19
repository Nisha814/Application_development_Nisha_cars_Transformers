using AutoCarePro.Data;
using AutoCarePro.Models;

namespace AutoCarePro.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            if (!context.UserProfiles.Any())
            {
                context.UserProfiles.Add(new UserProfile
                {
                    FullName = "Nisha Admin",
                    Email = "admin@nishacars.com",
                    Phone = "+977-9800000000",
                    Department = "Operations",
                    Role = "Operations Manager",
                    Bio = "Experienced automotive operations specialist managing The Nisha Cars Transformers service system.",
                    Location = "Kathmandu, Nepal",
                    NotifyNewCustomer = true,
                    NotifyNewVehicle = true,
                    NotifyServiceReminder = false,
                    NotifyRecordUpdate = false,
                    NotifyDailySummary = true,
                    NotifySystemAlerts = true,
                    JoinedDate = new DateTime(2023, 1, 1),
                    PasswordHash = "admin123"
                });
                context.SaveChanges();
            }

            if (context.Customers.Any()) return;

            var customers = new List<Customer>
            {
                new Customer { FullName = "Rajesh Sharma", Email = "rajesh.sharma@gmail.com", Phone = "+91 98765 43210", Address = "42 MG Road, Bangalore", CNIC = "35202-1234567-1", City = "Bangalore", Status = "Active", RegisteredDate = new DateTime(2024, 1, 15) },
                new Customer { FullName = "Priya Patel", Email = "priya.patel@yahoo.com", Phone = "+91 87654 32109", Address = "88 Nehru Street, Mumbai", CNIC = "35202-1234567-2", City = "Mumbai", Status = "Active", RegisteredDate = new DateTime(2024, 2, 20) },
                new Customer { FullName = "Amit Kumar", Email = "amit.kumar@outlook.com", Phone = "+91 76543 21098", Address = "15 Park Avenue, Delhi", CNIC = "35202-1234567-3", City = "Delhi", Status = "Active", RegisteredDate = new DateTime(2024, 3, 5) },
                new Customer { FullName = "Sunita Devi", Email = "sunita.devi@gmail.com", Phone = "+91 65432 10987", Address = "77 Lake View, Chennai", CNIC = "35202-1234567-4", City = "Chennai", Status = "Active", RegisteredDate = new DateTime(2024, 4, 10) },
                new Customer { FullName = "Vikram Singh", Email = "vikram.singh@rediff.com", Phone = "+91 54321 09876", Address = "33 Hill Road, Pune", CNIC = "35202-1234567-5", City = "Pune", Status = "Active", RegisteredDate = new DateTime(2024, 5, 18) },
                new Customer { FullName = "Anita Gupta", Email = "anita.gupta@gmail.com", Phone = "+91 43210 98765", Address = "56 Green Park, Hyderabad", CNIC = "35202-1234567-6", City = "Hyderabad", Status = "Active", RegisteredDate = new DateTime(2024, 6, 22) },
                new Customer { FullName = "Ravi Verma", Email = "ravi.verma@hotmail.com", Phone = "+91 32109 87654", Address = "99 River Side, Kolkata", CNIC = "35202-1234567-7", City = "Kolkata", Status = "Active", RegisteredDate = new DateTime(2024, 7, 30) },
                new Customer { FullName = "Meera Joshi", Email = "meera.joshi@gmail.com", Phone = "+91 21098 76543", Address = "22 Sunrise Colony, Ahmedabad", CNIC = "35202-1234567-8", City = "Ahmedabad", Status = "Active", RegisteredDate = new DateTime(2024, 8, 14) },
            };

            context.Customers.AddRange(customers);
            context.SaveChanges();

            var vehicles = new List<Vehicle>
            {
                new Vehicle { CustomerId = customers[0].Id, Make = "Maruti Suzuki", Model = "Swift Dzire", LicensePlate = "KA-01-AB-1234", Year = 2022, FuelType = "Petrol", Color = "Pearl White", VIN = "MA3ENB1SL5K123456", Mileage = 15000, Status = "Active" },
                new Vehicle { CustomerId = customers[0].Id, Make = "Hyundai", Model = "Creta", LicensePlate = "KA-01-CD-5678", Year = 2023, FuelType = "Diesel", Color = "Phantom Black", VIN = "MALB7418MPK789012", Mileage = 25000, Status = "Active" },
                new Vehicle { CustomerId = customers[1].Id, Make = "Tata Motors", Model = "Nexon", LicensePlate = "MH-02-EF-9012", Year = 2023, FuelType = "Petrol", Color = "Calgary White", VIN = "MAT6123456345678", Mileage = 12000, Status = "Active" },
                new Vehicle { CustomerId = customers[2].Id, Make = "Mahindra", Model = "XUV700", LicensePlate = "DL-03-GH-3456", Year = 2024, FuelType = "Diesel", Color = "Midnight Blue", VIN = "MAH123456789ABCD", Mileage = 5000, Status = "Active" },
                new Vehicle { CustomerId = customers[2].Id, Make = "Tata Motors", Model = "Harrier", LicensePlate = "DL-03-ST-7890", Year = 2023, FuelType = "Diesel", Color = "Oberon Black", VIN = "MAT611234SK987654", Mileage = 18000, Status = "Inactive" },
                new Vehicle { CustomerId = customers[3].Id, Make = "Honda", Model = "City", LicensePlate = "TN-04-IJ-7890", Year = 2021, FuelType = "Petrol", Color = "Golden Brown", VIN = "HON12345678EFGH", Mileage = 30000, Status = "Active" },
                new Vehicle { CustomerId = customers[4].Id, Make = "Toyota", Model = "Innova Crysta", LicensePlate = "MH-05-KL-1234", Year = 2023, FuelType = "Diesel", Color = "Super White", VIN = "TOY12345678901KL", Mileage = 22000, Status = "Active" },
                new Vehicle { CustomerId = customers[5].Id, Make = "Kia", Model = "Seltos", LicensePlate = "TS-06-MN-5678", Year = 2022, FuelType = "Petrol", Color = "Intelligence Blue", VIN = "KIA12345678MNOP", Mileage = 14000, Status = "Active" },
                new Vehicle { CustomerId = customers[6].Id, Make = "Maruti Suzuki", Model = "Baleno", LicensePlate = "WB-07-OP-9012", Year = 2023, FuelType = "Petrol", Color = "Nexa Blue", VIN = "MA3ENB1SL5K789010", Mileage = 8000, Status = "Active" },
                new Vehicle { CustomerId = customers[7].Id, Make = "Hyundai", Model = "Verna", LicensePlate = "GJ-08-QR-3456", Year = 2024, FuelType = "Petrol", Color = "Fiery Red", VIN = "MALB7418MPK123456", Mileage = 3000, Status = "Active" },
            };

            context.Vehicles.AddRange(vehicles);
            context.SaveChanges();

            var services = new List<Service>
            {
                new Service { VehicleId = vehicles[2].Id, ServiceType = "Full Service", Description = "Annual maintenance package", Cost = 7800, Date = new DateTime(2025, 1, 10), Status = "Completed" },
                new Service { VehicleId = vehicles[4].Id, ServiceType = "Suspension Check", Description = "Shock absorbers inspected", Cost = 2200, Date = new DateTime(2024, 12, 15), Status = "Completed" },
                new Service { VehicleId = vehicles[1].Id, ServiceType = "Oil Change", Description = "Diesel engine oil change", Cost = 4200, Date = new DateTime(2024, 12, 1), Status = "Completed" },
                new Service { VehicleId = vehicles[9].Id, ServiceType = "Paint Protection", Description = "Ceramic coating applied", Cost = 12000, Date = new DateTime(2024, 11, 8), Status = "Completed" },
                new Service { VehicleId = vehicles[8].Id, ServiceType = "General Checkup", Description = "Routine inspection, all systems OK", Cost = 1500, Date = new DateTime(2024, 10, 25), Status = "Completed" },
                new Service { VehicleId = vehicles[7].Id, ServiceType = "Battery Replacement", Description = "Exide 60Ah battery installed", Cost = 6500, Date = new DateTime(2024, 9, 12), Status = "Completed" },
                new Service { VehicleId = vehicles[6].Id, ServiceType = "Wheel Alignment", Description = "4-wheel alignment and camber check", Cost = 1800, Date = new DateTime(2024, 8, 20), Status = "Completed" },
                new Service { VehicleId = vehicles[3].Id, ServiceType = "Full Service", Description = "Complete 100,000 km service package", Cost = 8500, Date = new DateTime(2024, 7, 5), Status = "Completed" },
                new Service { VehicleId = vehicles[0].Id, ServiceType = "Tire Rotation", Description = "All four tires rotated and balanced", Cost = 1200, Date = new DateTime(2024, 6, 15), Status = "Completed" },
                new Service { VehicleId = vehicles[5].Id, ServiceType = "AC Service", Description = "AC gas refill, filter cleaning", Cost = 2500, Date = new DateTime(2024, 5, 18), Status = "Completed" },
                new Service { VehicleId = vehicles[2].Id, ServiceType = "Brake Inspection", Description = "Brake pads checked, minor adjustment", Cost = 800, Date = new DateTime(2024, 4, 22), Status = "Completed" },
                new Service { VehicleId = vehicles[0].Id, ServiceType = "Oil Change", Description = "Full synthetic oil, filter replaced", Cost = 3500, Date = new DateTime(2024, 3, 10), Status = "Completed" },
            };

            context.Services.AddRange(services);
            context.SaveChanges();

            // Seed activity logs
            var activityLogs = new List<ActivityLog>
            {
                new ActivityLog { Action = "Registered new customer", Description = "Rajesh Sharma (C001)", Icon = "person_add", IconColor = "#2563eb", IconBg = "#dbeafe", Timestamp = DateTime.Now.AddHours(-2) },
                new ActivityLog { Action = "Updated vehicle details", Description = "Hyundai Creta KA-01-CD-5678", Icon = "edit", IconColor = "#d97706", IconBg = "#fef3c7", Timestamp = DateTime.Now.AddHours(-3) },
                new ActivityLog { Action = "Added service history", Description = "Tata Nexon MH-02-EF-9012 - Full Service", Icon = "build", IconColor = "#059669", IconBg = "#d1fae5", Timestamp = DateTime.Now.AddDays(-1) },
                new ActivityLog { Action = "Viewed customer profile", Description = "Priya Patel (C002)", Icon = "visibility", IconColor = "#6b7280", IconBg = "#f3f4f6", Timestamp = DateTime.Now.AddDays(-1).AddHours(-2) },
                new ActivityLog { Action = "Updated customer status", Description = "Sunita Devi (C004) - Active", Icon = "edit", IconColor = "#d97706", IconBg = "#fef3c7", Timestamp = DateTime.Now.AddDays(-1).AddHours(-5) },
                new ActivityLog { Action = "Added new vehicle", Description = "Toyota Innova Crysta MH-05-KL-1234", Icon = "directions_car", IconColor = "#2563eb", IconBg = "#dbeafe", Timestamp = DateTime.Now.AddDays(-2) },
                new ActivityLog { Action = "Completed service", Description = "Oil Change - Maruti Suzuki Swift Dzire", Icon = "check_circle", IconColor = "#059669", IconBg = "#d1fae5", Timestamp = DateTime.Now.AddDays(-2).AddHours(-3) },
                new ActivityLog { Action = "Registered new customer", Description = "Meera Joshi (C008)", Icon = "person_add", IconColor = "#2563eb", IconBg = "#dbeafe", Timestamp = DateTime.Now.AddDays(-3) },
                new ActivityLog { Action = "Deleted vehicle record", Description = "Old entry removed - DL-99-XX-0000", Icon = "delete", IconColor = "#ef4444", IconBg = "#fee2e2", Timestamp = DateTime.Now.AddDays(-3).AddHours(-4) },
                new ActivityLog { Action = "Updated profile settings", Description = "Changed notification preferences", Icon = "settings", IconColor = "#6b7280", IconBg = "#f3f4f6", Timestamp = DateTime.Now.AddDays(-4) },
            };

            context.ActivityLogs.AddRange(activityLogs);
            context.SaveChanges();
        }
    }
}
