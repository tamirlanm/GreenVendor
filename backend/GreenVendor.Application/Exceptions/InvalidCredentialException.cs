using System.Net;

namespace GreenVendor.Application.Exceptions;
public class InvalidCredentialException : BaseException
{
    public InvalidCredentialException(string message) : base(message, HttpStatusCode.Unauthorized) {}
}