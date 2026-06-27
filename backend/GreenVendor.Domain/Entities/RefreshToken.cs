namespace GreenVendor.Domain.Entities;

public class RefreshToken
{
    public Guid Id {get;set;}
    public string Token {get;set;} = string.Empty;
    public Guid UserId {get;set;}
    public User User {get;set;} = null!;
    public DateTime CreatedAt {get;set;}
    public DateTime ExpiresAt {get;set;}
    public DateTime? RevokedAt {get;set;}
    public bool IsRevokedAt => RevokedAt.HasValue;
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevokedAt && !IsExpired;

}