using System.Net;
namespace GreenVendor.Application.Exceptions;
public class UserUnauthorizedException : BaseException
{
    public UserUnauthorizedException(string message) : base(message, HttpStatusCode.Unauthorized){}
}