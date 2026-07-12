namespace GreenVendor.Application.DTOs;
public class SupplierProductsCatalog
{
    public Guid Id {get;set;}
    public Guid SupplierId {get;set;} 
    public string Name{get;set;} = string.Empty;
    public string ProductCategory {get;set;} = string.Empty;
    public decimal Price {get;set;}
    public int Quantity {get;set;}
    public string? ImageUrl {get;set;}
}