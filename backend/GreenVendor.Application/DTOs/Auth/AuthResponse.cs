using GreenVendor.Domain.Enums;

namespace GreenVendor.Application.DTOs;
public class AuthResponse
{
    public string AccessToken {get;set;} = string.Empty;
    public string RefreshToken {get;set;} = string.Empty;
    public UserRole Role {get;set;}
}