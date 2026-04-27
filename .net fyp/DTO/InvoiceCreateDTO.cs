namespace AutoCarePro.DTO
{
    public class InvoiceCreateDTO
    {
        public List<InvoiceItemCreateDTO> Items { get; set; } = new List<InvoiceItemCreateDTO>();
    }

    public class InvoiceItemCreateDTO
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
    }
}
