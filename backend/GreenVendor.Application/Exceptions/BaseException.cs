using System.Net;

namespace GreenVendor.Application.Exceptions;
public abstract class BaseException : Exception
{
    public HttpStatusCode StatusCode {get;}
    protected BaseException(string message, HttpStatusCode statusCode) : base(message)
    {
        StatusCode = statusCode;
    }
}