using GreenVendor.Domain.Enums;

namespace GreenVendor.Domain.Entities;
public class Order
{
    public Guid Id {get;set;}
    public Guid BuyerId {get;set;}
    public Guid ProductId {get;set;}
    public int Quantity {get;set;}
    public decimal TotalPrice {get;set;}
    public OrderStatus Status {get;set;}
    public DateTime CreatedAt {get;set;}
    public DateTime? UpdatedAt {get;set;}
    public Product Product {get;set;} = null!;
    public BuyerProfile Buyer {get;set;} = null!;
}