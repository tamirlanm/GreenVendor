using System.Net;

namespace GreenVendor.Application.Exceptions;
public class BadRequestException : BaseException
{
    public BadRequestException(string message) : base(message, HttpStatusCode.BadRequest) {}
}
