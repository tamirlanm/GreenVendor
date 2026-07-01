namespace GreenVendor.Application.DTOs;
public class BuyerDetailsResponse
{
    public Guid Id {get; set;}
    public string CompanyName {get;set;} = string.Empty;
    public string Industry {get;set;} = string.Empty;
    public string Email {get;set;} = string.Empty;
    public string? PreferredMinGrade {get;set;}
}