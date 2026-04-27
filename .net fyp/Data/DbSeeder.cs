using AutoCarePro.Data;
using AutoCarePro.Models;

namespace AutoCarePro.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            SeedCustomersVehiclesServices(context);
            SeedInventory(context);
        }

        // ─── Existing seed (unchanged) ────────────────────────────────────────────
        private static void SeedCustomersVehiclesServices(AppDbContext context)
        {
            if (context.Customers.Any()) return;

            var customers = new List<Customer>
            {
                new Customer { FullName = "Rajesh Sharma",  Email = "rajesh.sharma@gmail.com",  Phone = "+91 98765 43210", Address = "42 MG Road, Bangalore, Karnataka",          RegisteredDate = new DateTime(2024, 1, 15) },
                new Customer { FullName = "Priya Patel",    Email = "priya.patel@yahoo.com",     Phone = "+91 87654 32109", Address = "88 Nehru Street, Mumbai, Maharashtra",      RegisteredDate = new DateTime(2024, 2, 20) },
                new Customer { FullName = "Amit Kumar",     Email = "amit.kumar@outlook.com",    Phone = "+91 76543 21098", Address = "15 Park Avenue, Delhi, NCR 110001",         RegisteredDate = new DateTime(2024, 3, 5)  },
                new Customer { FullName = "Sunita Devi",    Email = "sunita.devi@gmail.com",     Phone = "+91 65432 10987", Address = "77 Lake View, Chennai, Tamil Nadu",         RegisteredDate = new DateTime(2024, 4, 10) },
                new Customer { FullName = "Vikram Singh",   Email = "vikram.singh@rediff.com",   Phone = "+91 54321 09876", Address = "33 Hill Road, Pune, Maharashtra",           RegisteredDate = new DateTime(2024, 5, 18) },
                new Customer { FullName = "Anita Gupta",    Email = "anita.gupta@gmail.com",     Phone = "+91 43210 98765", Address = "56 Green Park, Hyderabad, Telangana",       RegisteredDate = new DateTime(2024, 6, 22) },
                new Customer { FullName = "Ravi Verma",     Email = "ravi.verma@hotmail.com",    Phone = "+91 32109 87654", Address = "99 River Side, Kolkata, West Bengal",       RegisteredDate = new DateTime(2024, 7, 30) },
                new Customer { FullName = "Meera Joshi",    Email = "meera.joshi@gmail.com",     Phone = "+91 21098 76543", Address = "22 Sunrise Colony, Ahmedabad, Gujarat",     RegisteredDate = new DateTime(2024, 8, 14) },
            };

            context.Customers.AddRange(customers);
            context.SaveChanges();

            var vehicles = new List<Vehicle>
            {
                new Vehicle { CustomerId = customers[0].Id, Make = "Maruti Suzuki", Model = "Swift Dzire",    LicensePlate = "KA-01-AB-1234", Year = 2022, FuelType = "Petrol",  Color = "Pearl White",       VIN = "MA3ENB1SL5K123456"  },
                new Vehicle { CustomerId = customers[0].Id, Make = "Hyundai",       Model = "Creta",          LicensePlate = "KA-01-CD-5678", Year = 2023, FuelType = "Diesel",  Color = "Phantom Black",     VIN = "MALB7418MPK789012"  },
                new Vehicle { CustomerId = customers[1].Id, Make = "Tata Motors",   Model = "Nexon",          LicensePlate = "MH-02-EF-9012", Year = 2023, FuelType = "Petrol",  Color = "Calgary White",     VIN = "MAT6123456345678"   },
                new Vehicle { CustomerId = customers[2].Id, Make = "Mahindra",      Model = "XUV700",         LicensePlate = "DL-03-GH-3456", Year = 2024, FuelType = "Diesel",  Color = "Midnight Blue",     VIN = "MAH123456789ABCD"   },
                new Vehicle { CustomerId = customers[2].Id, Make = "Tata Motors",   Model = "Harrier",        LicensePlate = "DL-03-ST-7890", Year = 2023, FuelType = "Diesel",  Color = "Oberon Black",      VIN = "MAT611234SK987654"  },
                new Vehicle { CustomerId = customers[3].Id, Make = "Honda",         Model = "City",           LicensePlate = "TN-04-IJ-7890", Year = 2021, FuelType = "Petrol",  Color = "Golden Brown",      VIN = "HON12345678EFGH"    },
                new Vehicle { CustomerId = customers[4].Id, Make = "Toyota",        Model = "Innova Crysta",  LicensePlate = "MH-05-KL-1234", Year = 2023, FuelType = "Diesel",  Color = "Super White",       VIN = "TOY12345678901KL"   },
                new Vehicle { CustomerId = customers[5].Id, Make = "Kia",           Model = "Seltos",         LicensePlate = "TS-06-MN-5678", Year = 2022, FuelType = "Petrol",  Color = "Intelligence Blue", VIN = "KIA12345678MNOP"    },
                new Vehicle { CustomerId = customers[6].Id, Make = "Maruti Suzuki", Model = "Baleno",         LicensePlate = "WB-07-OP-9012", Year = 2023, FuelType = "Petrol",  Color = "Nexa Blue",         VIN = "MA3ENB1SL5K789010"  },
                new Vehicle { CustomerId = customers[7].Id, Make = "Hyundai",       Model = "Verna",          LicensePlate = "GJ-08-QR-3456", Year = 2024, FuelType = "Petrol",  Color = "Fiery Red",         VIN = "MALB7418MPK123456"  },
            };

            context.Vehicles.AddRange(vehicles);
            context.SaveChanges();

            var services = new List<Service>
            {
                new Service { VehicleId = vehicles[2].Id, ServiceType = "Full Service",       Description = "Annual maintenance package",               Cost = 7800,  Date = new DateTime(2025, 1, 10),  Status = "Completed" },
                new Service { VehicleId = vehicles[4].Id, ServiceType = "Suspension Check",   Description = "Shock absorbers inspected",                Cost = 2200,  Date = new DateTime(2024, 12, 15), Status = "Completed" },
                new Service { VehicleId = vehicles[1].Id, ServiceType = "Oil Change",         Description = "Diesel engine oil change",                 Cost = 4200,  Date = new DateTime(2024, 12, 1),  Status = "Completed" },
                new Service { VehicleId = vehicles[9].Id, ServiceType = "Paint Protection",   Description = "Ceramic coating applied",                  Cost = 12000, Date = new DateTime(2024, 11, 8),  Status = "Completed" },
                new Service { VehicleId = vehicles[8].Id, ServiceType = "General Checkup",    Description = "Routine inspection, all systems OK",       Cost = 1500,  Date = new DateTime(2024, 10, 25), Status = "Completed" },
                new Service { VehicleId = vehicles[7].Id, ServiceType = "Battery Replacement",Description = "Exide 60Ah battery installed",             Cost = 6500,  Date = new DateTime(2024, 9, 12),  Status = "Completed" },
                new Service { VehicleId = vehicles[6].Id, ServiceType = "Wheel Alignment",    Description = "4-wheel alignment and camber check",       Cost = 1800,  Date = new DateTime(2024, 8, 20),  Status = "Completed" },
                new Service { VehicleId = vehicles[3].Id, ServiceType = "Full Service",       Description = "Complete 100,000 km service package",      Cost = 8500,  Date = new DateTime(2024, 7, 5),   Status = "Completed" },
                new Service { VehicleId = vehicles[0].Id, ServiceType = "Tire Rotation",      Description = "All four tires rotated and balanced",      Cost = 1200,  Date = new DateTime(2024, 6, 15),  Status = "Completed" },
                new Service { VehicleId = vehicles[5].Id, ServiceType = "AC Service",         Description = "AC gas refill, filter cleaning",           Cost = 2500,  Date = new DateTime(2024, 5, 18),  Status = "Completed" },
                new Service { VehicleId = vehicles[2].Id, ServiceType = "Brake Inspection",   Description = "Brake pads checked, minor adjustment",     Cost = 800,   Date = new DateTime(2024, 4, 22),  Status = "Completed" },
                new Service { VehicleId = vehicles[0].Id, ServiceType = "Oil Change",         Description = "Full synthetic oil, filter replaced",      Cost = 3500,  Date = new DateTime(2024, 3, 10),  Status = "Completed" },
            };

            context.Services.AddRange(services);
            context.SaveChanges();
        }

        // ─── Inventory & Purchase System seed ─────────────────────────────────────
        private static void SeedInventory(AppDbContext context)
        {
            if (context.Parts.Any()) return;

            // ── Parts ──────────────────────────────────────────────────────────────
            var parts = new List<Part>
            {
                new Part { Name = "Engine Oil (5W-30)",      PartNumber = "EO-5W30-1L",  Category = "Engine",      Description = "Fully synthetic 5W-30 engine oil, 1 litre",       UnitPrice = 420,   Quantity = 0, ReorderLevel = 10, CreatedDate = new DateTime(2024, 11, 1) },
                new Part { Name = "Oil Filter",              PartNumber = "OF-UNI-001",   Category = "Engine",      Description = "Universal spin-on oil filter",                     UnitPrice = 180,   Quantity = 0, ReorderLevel = 10, CreatedDate = new DateTime(2024, 11, 1) },
                new Part { Name = "Air Filter",              PartNumber = "AF-PANEL-002", Category = "Engine",      Description = "Panel air filter for hatchbacks and sedans",       UnitPrice = 350,   Quantity = 0, ReorderLevel = 10, CreatedDate = new DateTime(2024, 11, 2) },
                new Part { Name = "Brake Pad Set (Front)",   PartNumber = "BP-FRONT-01",  Category = "Brakes",      Description = "Ceramic front brake pad set, pair",               UnitPrice = 1200,  Quantity = 0, ReorderLevel = 5,  CreatedDate = new DateTime(2024, 11, 2) },
                new Part { Name = "Brake Fluid (DOT4)",      PartNumber = "BF-DOT4-500",  Category = "Brakes",      Description = "DOT4 brake fluid, 500ml bottle",                  UnitPrice = 280,   Quantity = 0, ReorderLevel = 8,  CreatedDate = new DateTime(2024, 11, 3) },
                new Part { Name = "Spark Plug (Iridium)",    PartNumber = "SP-IRI-NG1",   Category = "Engine",      Description = "Iridium long-life spark plug",                    UnitPrice = 650,   Quantity = 0, ReorderLevel = 10, CreatedDate = new DateTime(2024, 11, 3) },
                new Part { Name = "Car Battery 12V 45Ah",    PartNumber = "BAT-12V-45",   Category = "Electrical",  Description = "Maintenance-free sealed lead-acid battery",       UnitPrice = 3800,  Quantity = 0, ReorderLevel = 5,  CreatedDate = new DateTime(2024, 11, 4) },
                new Part { Name = "Wiper Blade (22 inch)",   PartNumber = "WB-22IN-001",  Category = "Body",        Description = "Frameless flat wiper blade, 22 inch",             UnitPrice = 420,   Quantity = 0, ReorderLevel = 10, CreatedDate = new DateTime(2024, 11, 4) },
                new Part { Name = "Coolant (50% Pre-mix)",   PartNumber = "CL-PREMIX-1L", Category = "Engine",      Description = "Pre-mixed radiator coolant, 1 litre",             UnitPrice = 320,   Quantity = 0, ReorderLevel = 10, CreatedDate = new DateTime(2024, 11, 5) },
                new Part { Name = "AC Cabin Filter",         PartNumber = "ACF-UNI-003",  Category = "AC",          Description = "Activated carbon cabin air filter",                UnitPrice = 520,   Quantity = 0, ReorderLevel = 8,  CreatedDate = new DateTime(2024, 11, 5) },
            };

            context.Parts.AddRange(parts);
            context.SaveChanges();

            // ── Vendors ────────────────────────────────────────────────────────────
            var vendors = new List<Vendor>
            {
                new Vendor { Name = "AutoParts India Pvt Ltd",    ContactPerson = "Suresh Rajan",  Email = "supply@autopartsindia.com",  Phone = "+91 80012 34567", Address = "Plot 12, Industrial Area, Pune, Maharashtra"       },
                new Vendor { Name = "Speedway Spares & Co.",       ContactPerson = "Kapil Mehra",   Email = "kapil@speedwayspares.in",   Phone = "+91 98110 22334", Address = "44 Ring Road Market, Delhi, NCR 110040"            },
                new Vendor { Name = "BharatAuto Distributors",    ContactPerson = "Nandini Rao",   Email = "orders@bharatauto.co.in",   Phone = "+91 73456 78901", Address = "87 Anna Salai, Chennai, Tamil Nadu 600002"         },
            };

            context.Vendors.AddRange(vendors);
            context.SaveChanges();

            // ── Purchase Invoice 1 ─────────────────────────────────────────────────
            // Vendor: AutoParts India — buying Engine oils, oil filters, air filters, spark plugs, coolant
            var inv1Items = new List<(Part part, int qty, decimal unitCost)>
            {
                (parts[0], 30, 390m),   // Engine Oil
                (parts[1], 25, 160m),   // Oil Filter
                (parts[2], 20, 310m),   // Air Filter
                (parts[5], 15, 580m),   // Spark Plug
                (parts[8], 20, 290m),   // Coolant
            };

            var invoice1 = new PurchaseInvoice
            {
                VendorId      = vendors[0].Id,
                InvoiceNumber = "INV-2024-001",
                Date          = new DateTime(2024, 11, 10),
                Notes         = "First bulk stock-up for workshop",
                Status        = "Received",
                TotalAmount   = inv1Items.Sum(x => x.qty * x.unitCost),
            };
            context.PurchaseInvoices.Add(invoice1);
            context.SaveChanges();

            ApplyPurchaseInvoice(context, invoice1, inv1Items, "INV-2024-001", new DateTime(2024, 11, 10));

            // ── Purchase Invoice 2 ─────────────────────────────────────────────────
            // Vendor: Speedway Spares — buying brakes, battery, wipers, AC filter
            var inv2Items = new List<(Part part, int qty, decimal unitCost)>
            {
                (parts[3], 10, 1050m),  // Brake Pads
                (parts[4], 15, 250m),   // Brake Fluid
                (parts[6], 8,  3500m),  // Battery
                (parts[7], 20, 380m),   // Wiper Blade
                (parts[9], 12, 460m),   // AC Cabin Filter
            };

            var invoice2 = new PurchaseInvoice
            {
                VendorId      = vendors[1].Id,
                InvoiceNumber = "INV-2024-002",
                Date          = new DateTime(2024, 12, 5),
                Notes         = "Brakes and electrical stock replenishment",
                Status        = "Received",
                TotalAmount   = inv2Items.Sum(x => x.qty * x.unitCost),
            };
            context.PurchaseInvoices.Add(invoice2);
            context.SaveChanges();

            ApplyPurchaseInvoice(context, invoice2, inv2Items, "INV-2024-002", new DateTime(2024, 12, 5));
        }

        /// <summary>
        /// Saves invoice line items, updates Part.Quantity, and writes StockHistory for each line.
        /// </summary>
        private static void ApplyPurchaseInvoice(
            AppDbContext context,
            PurchaseInvoice invoice,
            List<(Part part, int qty, decimal unitCost)> lines,
            string reference,
            DateTime date)
        {
            foreach (var (part, qty, unitCost) in lines)
            {
                var before = part.Quantity;

                // Line item
                context.PurchaseInvoiceItems.Add(new PurchaseInvoiceItem
                {
                    PurchaseInvoiceId = invoice.Id,
                    PartId            = part.Id,
                    Quantity          = qty,
                    UnitCost          = unitCost,
                    SubTotal          = qty * unitCost,
                });

                // Update stock
                part.Quantity += qty;

                // Stock history entry
                context.StockHistories.Add(new StockHistory
                {
                    PartId         = part.Id,
                    ChangeType     = "Purchase",
                    QuantityBefore = before,
                    QuantityChange = qty,
                    QuantityAfter  = part.Quantity,
                    Date           = date,
                    Notes          = $"Received via purchase invoice",
                    Reference      = reference,
                });
            }

            context.SaveChanges();
        }
    }
}

