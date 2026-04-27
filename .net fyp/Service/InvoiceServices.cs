using AutoCarePro.Data;
using AutoCarePro.Models;
using AutoCarePro.DTO;
using Microsoft.EntityFrameworkCore;

namespace AutoCarePro.Services
{
    public class InvoiceServices
{
    private readonly AppDbContext _context;

    public InvoiceServices(AppDbContext context)
    {
        _context = context;
    }

    public Invoice CreateInvoice(InvoiceCreateDTO dto)
    {
        decimal total = 0;
        var items = new List<InvoiceItem>();

        foreach (var i in dto.Items)
        {
            var part = _context.Parts.FirstOrDefault(p => p.Id == i.PartId);

            if (part == null)
                throw new Exception("Part not found");

            if (part.Stock < i.Quantity)
                throw new Exception("Insufficient stock");

            var item = new InvoiceItem
            {
                PartId = part.Id,
                Quantity = i.Quantity,
                Price = part.Price
            };

            total += part.Price * i.Quantity;
            part.Stock -= i.Quantity;

            items.Add(item);
        }

        decimal discount = total > 5000 ? total * 0.10m : 0;

        var invoice = new Invoice
        {
            Date = DateTime.Now,
            TotalAmount = total,
            Discount = discount,
            FinalAmount = total - discount,
            Items = items
        };

        _context.Invoices.Add(invoice);
        _context.SaveChanges();

        return invoice;
    }

    public Invoice GetInvoice(int id)
    {
        return _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefault(i => i.Id == id);
    }

    public List<Invoice> GetAll()
    {
        return _context.Invoices
            .Include(i => i.Items)
            .OrderByDescending(i => i.Date)
            .ToList();
    }
    }
}