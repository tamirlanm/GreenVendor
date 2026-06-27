using GreenVendor.Domain.Enums;
namespace GreenVendor.Domain.Entities;
public class Product
{
    public Guid Id {get;set;}
    public Guid SupplierId {get;set;}
    public string Name {get;set;} = string.Empty;
    public string? Description {get;set;}
    public ProductCategory Category {get;set;}
    public decimal Price {get;set;}
    public bool IsActive {get;set;}
    public DateTime CreatedAt {get;set;}
    public SupplierProfile Supplier {get;set;} = null!;
}