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
                    From = new MailAddress(smtpUser!),
                    Subject = "Verify Your Account - AdminCore",
                    Body = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;'>
                            <h2 style='color: #4f46e5; text-align: center;'>Welcome to AdminCore!</h2>
                            <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
                            <div style='background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;'>
                                <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;'>{otpCode}</span>
                            </div>
                            <p style='color: #64748b; font-size: 14px;'>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                            <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                            <p style='text-align: center; color: #94a3b8; font-size: 12px;'>© 2026 VehicleParts Inventory System</p>
                        </div>",
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}
