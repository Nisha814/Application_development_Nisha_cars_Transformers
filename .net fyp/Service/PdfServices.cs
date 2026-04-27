using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using AutoCarePro.Models;

namespace AutoCarePro.Services
{
    public class PdfService
    {
        public byte[] GenerateInvoicePdf(Invoice invoice)
        {
            using (var stream = new MemoryStream())
            {
                var writer = new PdfWriter(stream);
                var pdf = new PdfDocument(writer);
                var doc = new Document(pdf);

                doc.Add(new Paragraph("INVOICE").SetBold().SetFontSize(20));
                doc.Add(new Paragraph($"Date: {invoice.Date}"));
                doc.Add(new Paragraph(" "));

                foreach (var item in invoice.Items)
                {
                    doc.Add(new Paragraph(
                        $"Part ID: {item.PartId} | Qty: {item.Quantity} | Price: {item.Price}"
                    ));
                }

                doc.Add(new Paragraph(" "));
                doc.Add(new Paragraph($"Total: {invoice.TotalAmount}"));
                doc.Add(new Paragraph($"Discount: {invoice.Discount}"));
                doc.Add(new Paragraph($"Final Amount: {invoice.FinalAmount}").SetBold());

                doc.Close();
                return stream.ToArray();
            }
        }
    }
}