using System.Data;
using FluentValidation;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GreenVendor.Application.Validators;
public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    private readonly IAppDbContext _db;
    public UpdateProductValidator(IAppDbContext db)
    {
        _db = db;
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Product name must be not empty.").MaximumLength(200);
        
        RuleFor(x => x.Description)
            .MinimumLength(50).MaximumLength(800)
            .When(CreateProductRequest => !string.IsNullOrWhiteSpace(CreateProductRequest.Description));;
        
        RuleFor(x => x.Category).NotEmpty().WithMessage("Product category cannot be empty.")
            .Must(category => !category.All(char.IsDigit) && Enum.TryParse<ProductCategory>(category, true, out _))
            .WithMessage("Invalid category value. Please check for typos.");

        RuleFor(x => x.Price).NotEmpty().GreaterThan(0).LessThan(1000000000);

        RuleFor(x => x.IsActive).NotEmpty();

        RuleFor( x => x.SupplierId).
        MustAsync(SupplierMustExist).WithMessage("Supplier profile does not exists.");
    }
    private async Task<bool> SupplierMustExist(Guid supplierId, CancellationToken cancellationToken)
    {
        var supplier = await _db.Products.Include(p => p.Supplier).FirstOrDefaultAsync(p => p.SupplierId == supplierId);
        return supplier != null;
    }
}