using AutoCarePro.Data;
using AutoCarePro.Models;

namespace AutoCarePro.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            if (context.Customers.Any()) return;

            var customers = new List<Customer>
            {
                new Customer { FullName = "Rajesh Sharma", Email = "rajesh.sharma@gmail.com", Phone = "+91 98765 43210", Address = "42 MG Road, Bangalore, Karnataka", RegisteredDate = new DateTime(2024, 1, 15) },
                new Customer { FullName = "Priya Patel", Email = "priya.patel@yahoo.com", Phone = "+91 87654 32109", Address = "88 Nehru Street, Mumbai, Maharashtra", RegisteredDate = new DateTime(2024, 2, 20) },
                new Customer { FullName = "Amit Kumar", Email = "amit.kumar@outlook.com", Phone = "+91 76543 21098", Address = "15 Park Avenue, Delhi, NCR 110001", RegisteredDate = new DateTime(2024, 3, 5) },
                new Customer { FullName = "Sunita Devi", Email = "sunita.devi@gmail.com", Phone = "+91 65432 10987", Address = "77 Lake View, Chennai, Tamil Nadu", RegisteredDate = new DateTime(2024, 4, 10) },
                new Customer { FullName = "Vikram Singh", Email = "vikram.singh@rediff.com", Phone = "+91 54321 09876", Address = "33 Hill Road, Pune, Maharashtra", RegisteredDate = new DateTime(2024, 5, 18) },
                new Customer { FullName = "Anita Gupta", Email = "anita.gupta@gmail.com", Phone = "+91 43210 98765", Address = "56 Green Park, Hyderabad, Telangana", RegisteredDate = new DateTime(2024, 6, 22) },
                new Customer { FullName = "Ravi Verma", Email = "ravi.verma@hotmail.com", Phone = "+91 32109 87654", Address = "99 River Side, Kolkata, West Bengal", RegisteredDate = new DateTime(2024, 7, 30) },
                new Customer { FullName = "Meera Joshi", Email = "meera.joshi@gmail.com", Phone = "+91 21098 76543", Address = "22 Sunrise Colony, Ahmedabad, Gujarat", RegisteredDate = new DateTime(2024, 8, 14) },
            };

            context.Customers.AddRange(customers);
            context.SaveChanges();

            var vehicles = new List<Vehicle>
            {
                new Vehicle { CustomerId = customers[0].Id, Make = "Maruti Suzuki", Model = "Swift Dzire", LicensePlate = "KA-01-AB-1234", Year = 2022, FuelType = "Petrol", Color = "Pearl White", VIN = "MA3ENB1SL5K123456" },
                new Vehicle { CustomerId = customers[0].Id, Make = "Hyundai", Model = "Creta", LicensePlate = "KA-01-CD-5678", Year = 2023, FuelType = "Diesel", Color = "Phantom Black", VIN = "MALB7418MPK789012" },
                new Vehicle { CustomerId = customers[1].Id, Make = "Tata Motors", Model = "Nexon", LicensePlate = "MH-02-EF-9012", Year = 2023, FuelType = "Petrol", Color = "Calgary White", VIN = "MAT6123456345678" },
                new Vehicle { CustomerId = customers[2].Id, Make = "Mahindra", Model = "XUV700", LicensePlate = "DL-03-GH-3456", Year = 2024, FuelType = "Diesel", Color = "Midnight Blue", VIN = "MAH123456789ABCD" },
                new Vehicle { CustomerId = customers[2].Id, Make = "Tata Motors", Model = "Harrier", LicensePlate = "DL-03-ST-7890", Year = 2023, FuelType = "Diesel", Color = "Oberon Black", VIN = "MAT611234SK987654" },
                new Vehicle { CustomerId = customers[3].Id, Make = "Honda", Model = "City", LicensePlate = "TN-04-IJ-7890", Year = 2021, FuelType = "Petrol", Color = "Golden Brown", VIN = "HON12345678EFGH" },
                new Vehicle { CustomerId = customers[4].Id, Make = "Toyota", Model = "Innova Crysta", LicensePlate = "MH-05-KL-1234", Year = 2023, FuelType = "Diesel", Color = "Super White", VIN = "TOY12345678901KL" },
                new Vehicle { CustomerId = customers[5].Id, Make = "Kia", Model = "Seltos", LicensePlate = "TS-06-MN-5678", Year = 2022, FuelType = "Petrol", Color = "Intelligence Blue", VIN = "KIA12345678MNOP" },
                new Vehicle { CustomerId = customers[6].Id, Make = "Maruti Suzuki", Model = "Baleno", LicensePlate = "WB-07-OP-9012", Year = 2023, FuelType = "Petrol", Color = "Nexa Blue", VIN = "MA3ENB1SL5K789010" },
                new Vehicle { CustomerId = customers[7].Id, Make = "Hyundai", Model = "Verna", LicensePlate = "GJ-08-QR-3456", Year = 2024, FuelType = "Petrol", Color = "Fiery Red", VIN = "MALB7418MPK123456" },
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
        }
    }
}
