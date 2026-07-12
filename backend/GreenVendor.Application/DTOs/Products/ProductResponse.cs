namespace GreenVendor.Application.DTOs;
public class ProductResponse
{
    public Guid Id {get;set;}
    public Guid SupplierId {get;set;}
    public string Name {get;set;} = string.Empty;
    public string? Description {get;set;}
    public string Category {get;set;} = string.Empty;
    public decimal Price {get;set;}
    public bool IsActive {get;set;}
    public DateTime CreatedAt {get;set;}
    public string Supplier {get;set;} = null!;
    public string? ImageUrl {get;set;}
    public int Quantity {get;set;}
}