using System;
using System.Collections.Generic;
using System.Linq;
using NishaCarRental.API.Models;

namespace NishaCarRental.API.Data
{
    public static class DbInitializer
    {
        public static void Seed(RentalDbContext context)
        {
            // Ensure database is created and migrations are applied
            context.Database.EnsureCreated();

            // Check if database has already been seeded
            if (context.Cars.Any())
            {
                return; // Database has been seeded
            }

            // 1. Seed Cars
            var cars = new List<Car>
            {
                new Car { Make = "Toyota", Model = "Camry", Year = 2022, DailyRate = 60.00m, Category = "Sedan" },
                new Car { Make = "Honda", Model = "Accord", Year = 2021, DailyRate = 65.00m, Category = "Sedan" },
                new Car { Make = "Ford", Model = "Explorer", Year = 2022, DailyRate = 95.00m, Category = "SUV" },
                new Car { Make = "Jeep", Model = "Grand Cherokee", Year = 2023, DailyRate = 110.00m, Category = "SUV" },
                new Car { Make = "Tesla", Model = "Model 3", Year = 2023, DailyRate = 120.00m, Category = "Luxury" },
                new Car { Make = "Mercedes-Benz", Model = "C-Class", Year = 2022, DailyRate = 150.00m, Category = "Luxury" },
                new Car { Make = "Hyundai", Model = "Elantra", Year = 2020, DailyRate = 45.00m, Category = "Economy" },
                new Car { Make = "Kia", Model = "Rio", Year = 2021, DailyRate = 40.00m, Category = "Economy" }
            };
            context.Cars.AddRange(cars);
            context.SaveChanges();

            // 2. Seed Customers
            var customers = new List<Customer>
            {
                new Customer { Name = "Bishal Rai", Email = "bishal.rai@example.com", Phone = "9801234567" },
                new Customer { Name = "Algina Tumkhewa", Email = "algina.t@example.com", Phone = "9812345678" },
                new Customer { Name = "Himanshu Chaudhary", Email = "himanshu.c@example.com", Phone = "9841234567" },
                new Customer { Name = "Nisha Gurung", Email = "nisha.g@example.com", Phone = "9851234567" },
                new Customer { Name = "Aashish Shrestha", Email = "aashish.s@example.com", Phone = "9861234567" },
                new Customer { Name = "Suman Thapa", Email = "suman.t@example.com", Phone = "9809876543" },
                new Customer { Name = "Pooja Sharma", Email = "pooja.s@example.com", Phone = "9819876543" },
                new Customer { Name = "Ramesh KC", Email = "ramesh.kc@example.com", Phone = "9849876543" }
            };
            context.Customers.AddRange(customers);
            context.SaveChanges();

            // 3. Seed Rentals & Payments over the last 12 months
            var random = new Random(42); // Seeded for reproducibility
            var now = DateTime.UtcNow;
            var rentals = new List<Rental>();
            var payments = new List<Payment>();

            // Generate about 100 historical rentals
            for (int i = 0; i < 120; i++)
            {
                var customer = customers[random.Next(customers.Count)];
                var car = cars[random.Next(cars.Count)];

                // Start date between 365 days ago and 5 days in the future
                int daysAgo = random.Next(-5, 365);
                var startDate = now.AddDays(-daysAgo).AddHours(random.Next(8, 18));
                int duration = random.Next(1, 15);
                var endDate = startDate.AddDays(duration);

                decimal totalAmount = car.DailyRate * duration;

                string status;
                if (endDate < now)
                {
                    // Rental is in the past
                    // 90% Completed, 10% Overdue (unpaid)
                    status = random.NextDouble() < 0.9 ? "Completed" : "Overdue";
                }
                else if (startDate <= now)
                {
                    // Rental is current
                    status = "Active";
                }
                else
                {
                    // Rental is in the future
                    status = "Pending";
                }

                var rental = new Rental
                {
                    Customer = customer,
                    Car = car,
                    StartDate = startDate,
                    EndDate = endDate,
                    TotalAmount = totalAmount,
                    Status = status
                };
                rentals.Add(rental);
            }
            context.Rentals.AddRange(rentals);
            context.SaveChanges();

            // Now generate payments for these rentals
            foreach (var rental in rentals)
            {
                if (rental.Status == "Completed")
                {
                    // Completed rentals are fully paid
                    payments.Add(new Payment
                    {
                        Rental = rental,
                        Amount = rental.TotalAmount,
                        PaymentDate = rental.StartDate.AddHours(random.Next(1, 4)),
                        Status = "Paid"
                    });
                }
                else if (rental.Status == "Overdue")
                {
                    // Overdue rentals are unpaid or partially paid
                    bool partiallyPaid = random.NextDouble() < 0.4;
                    if (partiallyPaid)
                    {
                        payments.Add(new Payment
                        {
                            Rental = rental,
                            Amount = rental.TotalAmount * 0.3m, // paid 30% deposit
                            PaymentDate = rental.StartDate,
                            Status = "Paid"
                        });
                        payments.Add(new Payment
                        {
                            Rental = rental,
                            Amount = rental.TotalAmount * 0.7m,
                            PaymentDate = rental.EndDate.AddDays(2),
                            Status = "Pending"
                        });
                    }
                    else
                    {
                        payments.Add(new Payment
                        {
                            Rental = rental,
                            Amount = rental.TotalAmount,
                            PaymentDate = rental.StartDate,
                            Status = "Pending"
                        });
                    }
                }
                else if (rental.Status == "Active")
                {
                    // Active rentals are usually paid (deposit or full)
                    payments.Add(new Payment
                    {
                        Rental = rental,
                        Amount = rental.TotalAmount,
                        PaymentDate = rental.StartDate.AddHours(-2),
                        Status = "Paid"
                    });
                }
                else if (rental.Status == "Pending")
                {
                    // Future bookings
                    // 50% paid in advance, 50% unpaid
                    if (random.NextDouble() < 0.5)
                    {
                        payments.Add(new Payment
                        {
                            Rental = rental,
                            Amount = rental.TotalAmount,
                            PaymentDate = now.AddDays(-1),
                            Status = "Paid"
                        });
                    }
                    else
                    {
                        payments.Add(new Payment
                        {
                            Rental = rental,
                            Amount = rental.TotalAmount,
                            PaymentDate = rental.StartDate,
                            Status = "Pending"
                        });
                    }
                }
            }
            context.Payments.AddRange(payments);
            context.SaveChanges();

            // 4. Seed Notifications
            var notifications = new List<Notification>
            {
                new Notification { Message = "Overdue rental detected: Himanshu Chaudhary is 4 days late returning Ford Explorer.", IsRead = false, CreatedAt = now.AddHours(-2) },
                new Notification { Message = "Top spender milestone: Bishal Rai reached $2,400 in total rental spending.", IsRead = false, CreatedAt = now.AddDays(-1) },
                new Notification { Message = "System notification: Daily automated email reminders dispatched successfully.", IsRead = true, CreatedAt = now.AddDays(-1).AddHours(8) },
                new Notification { Message = "New booking: Algina Tumkhewa reserved Tesla Model 3 for tomorrow.", IsRead = false, CreatedAt = now.AddHours(-5) }
            };
            context.Notifications.AddRange(notifications);

            // 5. Seed Email Logs
            var emailLogs = new List<EmailLog>
            {
                new EmailLog { RecipientEmail = "himanshu.c@example.com", Subject = "Rental Return Reminder - Nisha Car Rental", Body = "Hi Himanshu, this is a reminder that your rental for Ford Explorer is due back. Please return the car or contact support.", Status = "Sent", SentAt = now.AddHours(-1) },
                new EmailLog { RecipientEmail = "algina.t@example.com", Subject = "Booking Confirmation - Nisha Car Rental", Body = "Hi Algina, your reservation for Tesla Model 3 has been confirmed for tomorrow. Thank you!", Status = "Sent", SentAt = now.AddHours(-5) },
                new EmailLog { RecipientEmail = "bishal.rai@example.com", Subject = "Pending Payment Notice", Body = "Hi Bishal, you have a pending payment of $120.00 for your recent rental. Please pay online.", Status = "Failed", SentAt = now.AddDays(-2) }
            };
            context.EmailLogs.AddRange(emailLogs);

            // 6. Seed AI Predictions (historical & forecasted values)
            var aiPredictions = new List<AIPrediction>();
            // Demand predictions for vehicle categories
            aiPredictions.Add(new AIPrediction { TargetDate = now.AddDays(7), MetricName = "Demand_SUV", PredictedValue = 18.5m, Confidence = 0.88m });
            aiPredictions.Add(new AIPrediction { TargetDate = now.AddDays(7), MetricName = "Demand_Luxury", PredictedValue = 8.2m, Confidence = 0.79m });
            aiPredictions.Add(new AIPrediction { TargetDate = now.AddDays(7), MetricName = "Demand_Sedan", PredictedValue = 24.1m, Confidence = 0.91m });
            aiPredictions.Add(new AIPrediction { TargetDate = now.AddDays(7), MetricName = "Demand_Economy", PredictedValue = 30.5m, Confidence = 0.94m });

            // Monthly revenue projections
            aiPredictions.Add(new AIPrediction { TargetDate = new DateTime(now.Year, now.Month, 1).AddMonths(1), MetricName = "Revenue_Forecast", PredictedValue = 8500.00m, Confidence = 0.85m });

            context.AIPredictions.AddRange(aiPredictions);
            context.SaveChanges();
        }
    }
}
