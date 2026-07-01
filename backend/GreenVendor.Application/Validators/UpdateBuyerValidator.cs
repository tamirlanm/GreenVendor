
using FluentValidation;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Enums;

namespace GreenVendor.Application.Validators;
public class UpdateBuyerValidator : AbstractValidator<UpdateBuyerRequest>
{
    private readonly IAppDbContext _db;
    public UpdateBuyerValidator(IAppDbContext db)
    {
        _db = db;

        RuleFor(x => x.CompanyName).NotEmpty().WithMessage("Company name must be a required field.").MaximumLength(100);

        RuleFor(x => x.Industry).NotEmpty().WithMessage("Industry cannot be empty.")
            .Must(industry => !industry.All(char.IsDigit) && Enum.TryParse<Industry>(industry, true, out _))
            .WithMessage("Invalid industry value. Please check for typos.");

        RuleFor(x => x.Email).NotEmpty().WithMessage("Email must be a required field.")
            .EmailAddress().WithMessage("Incorrect Email address format entered.")
            .MaximumLength(256).WithMessage("The length of Email address must not exceed 256 characters.");

        RuleFor(x => x.PreferredMinGrade)
        .Must(g => g is null or "A" or "B" or "C" or "D" or "F").WithMessage("Grade must be one of: A, B, C, D, F");
    }
}