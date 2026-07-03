namespace GreenVendor.Application.DTOs;
public class UpdateProductRequest
{
    // public Guid SupplierId {get;set;}
    public string Name {get;set;} = string.Empty;
    public string? Description {get;set;} = string.Empty;
    public string Category {get;set;} = string.Empty;
    public decimal Price {get;set;}
    public bool IsActive {get;set;}
    // public string Supplier {get;set;} = string.Empty;
}