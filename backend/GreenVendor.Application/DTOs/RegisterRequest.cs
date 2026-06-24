namespace GreenVendor.Application.DTOs;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;

public class RegisterRequest{
    public string Email {get;set;} = string.Empty;
    public string Password {get;set;} = string.Empty;
    public string Role {get;set;} = "Buyer";
}