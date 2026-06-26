using System.Net;

namespace GreenVendor.Application.Exceptions;
public class NotFoundException : BaseException
{
    public NotFoundException(string message) : base(message, HttpStatusCode.NotFound) {}
}