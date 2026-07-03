namespace GreenVendor.Application.DTOs;
public class ProductsCatalog
{
    public Guid Id {get;set;}
    public Guid SupplierId {get;set;}
    public string Name {get;set;} = string.Empty;
    public string CompanyName {get;set;} = string.Empty;
    public string ProductCategory {get;set;} = string.Empty;
    public decimal Price {get;set;}
}