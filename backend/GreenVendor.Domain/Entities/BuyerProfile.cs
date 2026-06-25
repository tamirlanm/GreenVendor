using GreenVendor.Domain.Enums;

namespace GreenVendor.Domain.Entities;
public class BuyerProfile
{
    public Guid Id {get;set;}
    public Guid UserId {get;set;} 
    public string CompanyName {get;set;} = string.Empty;
    public Industry Industry {get;set;}
    public string? PreferredMinGrade {get;set;}
    public DateTime CreatedAt {get;set;}
    public User User {get;set;} = null!;
    public ICollection<Order> Orders {get;set;} = [];
}