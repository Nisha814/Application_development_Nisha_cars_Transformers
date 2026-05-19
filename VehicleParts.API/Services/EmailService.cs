using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace VehicleParts.API.Services
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string toEmail, string otpCode);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendOtpEmailAsync(string toEmail, string otpCode)
        {
            var smtpServer = _configuration["EmailSettings:Host"];
            var smtpPort = int.Parse(_configuration["EmailSettings:Port"]!);
            var smtpUser = _configuration["EmailSettings:Email"];
            var smtpPass = _configuration["EmailSettings:Password"];

            using (var client = new SmtpClient(smtpServer, smtpPort))
            {
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(smtpUser, smtpPass);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(smtpUser!, "VehicleParts Security"),
                    Subject = "Verify Your Account - VehicleParts Portal",
                    Body = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); background-color: #ffffff;'>
                            <h2 style='color: #00f2fe; text-align: center; font-family: Helvetica, Arial, sans-serif;'>Welcome to VehicleParts Portal!</h2>
                            <p style='color: #334155; font-size: 16px; line-height: 1.5;'>Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
                            <div style='background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;'>
                                <span style='font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #0f172a; font-family: monospace;'>{otpCode}</span>
                            </div>
                            <p style='color: #64748b; font-size: 14px; line-height: 1.5;'>This code will expire in 10 minutes. If you did not request this verification, please safely ignore this email.</p>
                            <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;' />
                            <p style='text-align: center; color: #94a3b8; font-size: 12px;'>© 2026 VehicleParts Management Portal. All rights reserved.</p>
                        </div>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}
