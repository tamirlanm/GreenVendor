namespace GreenVendor.Application.DTOs;
public class OrderResponse
{
    public Guid Id {get;set;}
    public Guid BuyerId {get;set;}
    public Guid ProductId {get;set;}
    public string ProductName {get;set;} = string.Empty;
    public int Quantity {get;set;}
    public decimal TotalPrice {get;set;}
    public string Status {get;set;} = string.Empty;
    public DateTime CreatedAt {get;set;}
    public DateTime? UpdatedAt {get;set;}
}