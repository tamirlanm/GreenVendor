namespace GreenVendor.Application.DTOs;
public class SupplierOrdersResponse
{
    public Guid Id {get;set;}
    public string ProductName {get;set;} = string.Empty;
    public int Quantity {get;set;}
    public decimal TotalPrice {get;set;}
    public string Status {get;set;} = string.Empty;
    public string CreateAt {get;set;} = string.Empty;
}