namespace GreenVendor.Application.DTOs;
public class RefreshTokenDTO
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt {get;set;} 
}