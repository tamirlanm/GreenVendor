using System.Net;

namespace GreenVendor.Application.Exceptions;
public class ForbiddenException : BaseException
{
    public ForbiddenException(string message) : base(message, HttpStatusCode.Forbidden) {}
} 