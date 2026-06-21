using Microsoft.AspNetCore.Mvc;
using GreenVendor.Application.DTOs;

namespace GreenVendor.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("register/buyer")]
    public ActionResult RegisterBuyer([FromBody] RegisterRequest req)
    {
        return Ok();
    }
    
    [HttpPost("register/supplier")]
    public ActionResult RegisterSupplier([FromBody] RegisterRequest req)
    {
        return Ok();
    }

    [HttpPost("login")]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest req)
    {
        var fakeResponse = new AuthResponse
        {
            AccessToken = "fake-jwt-access-token",
            RefreshToken = "fake-refresh-token",
            Role = Domain.Enums.UserRole.Buyer
        };
        return Ok(fakeResponse);
    }
}