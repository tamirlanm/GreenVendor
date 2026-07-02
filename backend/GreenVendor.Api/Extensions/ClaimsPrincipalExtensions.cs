using System.Security.Claims;
using GreenVendor.Application.Exceptions;
using GreenVendor.Infrastructure.Services;

namespace GreenVendor.Api.Extensions;
public static class ClaimsPrincipalExtensions
{
    public static string GetEmail(this ClaimsPrincipal user) 
        => user.FindFirstValue(ClaimTypes.Email) 
        ?? throw new InvalidCredentialException("Email claim not found."); 

    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(id))
        {
            throw new UserUnauthorizedException("Id claim not found.");
        }
        if(!Guid.TryParse(id, out var guid))
        {
            throw new UserUnauthorizedException("Id claim has an invalid format.");
        }
        return guid;
    }
}