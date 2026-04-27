using MailKit.Net.Smtp;
using MimeKit;
using AutoCarePro.Models;

namespace AutoCarePro.Services
{
    public class EmailService
    {
        public void SendInvoice(string toEmail, byte[] pdfBytes)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Vehicle Parts Shop", "your@gmail.com"));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "Your Invoice";

            var builder = new BodyBuilder
            {
                TextBody = "Please find your invoice attached."
            };

            builder.Attachments.Add("invoice.pdf", pdfBytes);
            message.Body = builder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                client.Connect("smtp.gmail.com", 587, false);
                client.Authenticate("your@gmail.com", "your-app-password"); // use app password
                client.Send(message);
                client.Disconnect(true);
            }
        }
    }
}