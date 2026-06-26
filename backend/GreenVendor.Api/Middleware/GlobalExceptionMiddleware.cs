using GreenVendor.Application.Exceptions;
namespace GreenVendor.Api.Middleware;
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch(Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            BaseException baseEx => ((int)baseEx.StatusCode, baseEx.Message),
            _ => (StatusCodes.Status500InternalServerError, "Internal Server Error")
        };

        if(exception is BaseException)
        {
            _logger.LogWarning("Business-exception ({StatusCode}): {Message}", statusCode, message);
        }
        else
        {
            _logger.LogError(exception, "Unhandled system exception has occured.");
        }
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var responseBody = new {error = message};
        await context.Response.WriteAsJsonAsync(responseBody);
    }
}