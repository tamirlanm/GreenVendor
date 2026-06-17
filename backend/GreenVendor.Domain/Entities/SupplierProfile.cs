using GreenVendor.Domain.Enums;
namespace GreenVendor.Domain.Entities;
public class SupplierProfile
{
    public Guid Id {get;set;}
    public Guid UserId {get;set;}
    public string CompanyName {get;set;} = string.Empty;
    public Industry Industry {get;set;}
    public string? Description {get;set;}
    public string? CertificatePath {get;set;}
    public bool IsVerified {get;set;}
    public DateTime CreatedAt {get;set;}
    public User User {get;set;} = null!;
    public EsgScore? LatestScore {get;set;}
}