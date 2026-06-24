using Microsoft.AspNetCore.Mvc;
using GreenVendor.Application.DTOs;
using GreenVendor.Infrastructure.Data;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Entities;

namespace GreenVendor.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) => _authService = authService;
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var response = await _authService.RegisterAsync(request);
        if(response is null)
        {
            return BadRequest(new {message = "User with this Email already registered."});
        }
        return response;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if(response == null)
        {
            return Unauthorized(new {message = "Incorrect Email or Password."});
        }
        return response;
    }
    
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var response = await _authService.RefreshTokenAsync(request.RefreshToken);
        if(response == null)
        {
            return BadRequest(new {message = "Invalid or expired refresh-token."});
        }
        return response;
    }
}