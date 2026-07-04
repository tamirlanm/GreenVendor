using System.Data;
using FluentValidation;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GreenVendor.Application.Validators;
public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Product name must be not empty.").MaximumLength(200);
        
        RuleFor(x => x.Description)
            .MinimumLength(50).MaximumLength(800)
            .When(CreateProductRequest => !string.IsNullOrWhiteSpace(CreateProductRequest.Description));;
        
        RuleFor(x => x.Category).NotEmpty().WithMessage("Product Category cannot be empty.")
            .Must(category => !category.All(char.IsDigit) && Enum.TryParse<ProductCategory>(category, true, out _))
            .WithMessage("Invalid category value. Please check for typos.");

        RuleFor(x => x.Price).NotEmpty().GreaterThan(0).LessThan(1000000000);
    }
}