namespace GreenVendor.Application.DTOs
{
    public class UpdateBuyerRequest
    {
        public string CompanyName {get;set;} = string.Empty;
        public string Industry {get;set;} = string.Empty;
        public string Email {get;set;} = string.Empty;
        public string? PreferredMinGrade {get;set;} = string.Empty;
    }
}