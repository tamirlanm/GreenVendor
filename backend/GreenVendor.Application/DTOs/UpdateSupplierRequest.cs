
namespace GreenVendor.Application.DTOs;
public class UpdateSupplierRequest
{
    public string CompanyName {get;set;} = string.Empty;
    public string Industry {get;set;} = string.Empty;
    public string? Description {get;set;} = string.Empty;
    public string Email {get;set;} = string.Empty;
    public string Phone {get;set;} = string.Empty;
}