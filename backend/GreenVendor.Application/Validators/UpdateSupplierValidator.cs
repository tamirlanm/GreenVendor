using GreenVendor.Application.DTOs;
using FluentValidation;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Enums;
namespace GreenVendor.Application.Validators;
public class UpdateSupplierValidator : AbstractValidator<UpdateSupplierRequest>
{
    private readonly IAppDbContext _db;
    public UpdateSupplierValidator(IAppDbContext db)
    {
        _db = db;
        RuleFor(x => x.CompanyName).NotEmpty().WithMessage("Company name must be a required field.").MaximumLength(100);

        RuleFor(x => x.Industry).NotEmpty().WithMessage("Industry cannot be empty.")
            .Must(industry => !industry.All(char.IsDigit) && Enum.TryParse<Industry>(industry, true, out _))
            .WithMessage("Invalid industry value. Please check for typos.");

        RuleFor(x => x.Description)
            .MinimumLength(50).MaximumLength(800)
            .When(UpdateSupplierRequest => !string.IsNullOrWhiteSpace(UpdateSupplierRequest.Description));;
        
        RuleFor(x => x.Email).NotEmpty().WithMessage("Email must be a required field.")
            .EmailAddress().WithMessage("Incorrect email address format entered.")  
            .MaximumLength(256).WithMessage("The length of the Email must not exceed 256 characters.");
        
        RuleFor(x => x.Phone)
            .Matches(@"^\+[1-9]\d{1,14}$")
            .WithMessage("Number of phone is need to be in international format, for example: +77771234567")
            .MaximumLength(20)
            .WithMessage("The length of number phone must not exceed 20 characters.")
            .When(UpdateSupplierRequest => !string.IsNullOrWhiteSpace(UpdateSupplierRequest.Phone));
    }
}