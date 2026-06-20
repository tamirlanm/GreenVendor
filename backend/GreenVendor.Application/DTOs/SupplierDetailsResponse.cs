
using GreenVendor.Domain.Enums;

namespace GreenVendor.Application.DTOs;
public class SupplierDetailsResponse
{
    public Guid Id {get;set;}
    public string CompanyName = string.Empty;
    public string Industry {get;set;} = string.Empty;
    public string? Description {get;set;}
    public bool IsVerified {get;set;}
    public string Email = string.Empty;
    public string Phone = string.Empty;
    public decimal? TotalEsgScore {get;set;}
    public string? EsgGrade {get;set;}
}