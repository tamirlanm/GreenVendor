using FluentValidation;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using GreenVendor.Application.Validators;
using GreenVendor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GreenVendor.Application.Services;
public class BuyerService : IBuyerService
{
    private readonly IAppDbContext _db;
    private readonly IValidator<UpdateBuyerRequest> _validator;
    public BuyerService(IAppDbContext db, IValidator<UpdateBuyerRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<Guid> GetMyBuyerIdAsync(Guid userId)
    {
        var buyer = await _db.BuyerProfiles.FirstOrDefaultAsync(b => b.UserId == userId);
        if(buyer is null)
        {
            throw new NotFoundException("Buyer profile not found for this user.");
        }
        return buyer.Id;
    }
    public async Task<BuyerDetailsResponse?> GetBuyerDetailsAsync(Guid id)
    {
        var buyer = await _db.BuyerProfiles.Include(s => s.User).FirstOrDefaultAsync(b => b.Id == id);
        if(buyer is null)
        {
            throw new NotFoundException($"Buyer with Id={id} not found.");
        }
        return new BuyerDetailsResponse
        {
            Id = id,
            CompanyName = buyer.CompanyName,
            Industry = buyer.Industry.ToString(),
            Email = buyer.User.Email,
            PreferredMinGrade = buyer.PreferredMinGrade
        };
    }

    public async Task<BuyerDetailsResponse?> UpdateMyBuyerProfileAsync(Guid id, UpdateBuyerRequest request)
    {
        var validatorResult = await _validator.ValidateAsync(request);
        if (!validatorResult.IsValid)
        {
            var error = string.Join("; ", validatorResult.Errors.Select(e => e.ErrorMessage));
            throw new BadRequestException($"Error validator: {error}");
        }

        var buyerExists = await _db.BuyerProfiles.Include(b => b.User).FirstOrDefaultAsync(b => b.Id == id);
        if(buyerExists is null)
        {
            throw new NotFoundException($"Buyer with Id={id} is not found.");
        }
        buyerExists.CompanyName = request.CompanyName;
        buyerExists.User.Email = request.Email;
        buyerExists.PreferredMinGrade = request.PreferredMinGrade;
        buyerExists.Industry = Enum.TryParse<Industry>
                                (request.Industry, ignoreCase: true, out var parsedIndustry) 
                                && !int.TryParse(request.Industry, out _) ? parsedIndustry : Industry.Other;
        
        await _db.SaveChangesAsync();

        return new BuyerDetailsResponse
        {
            Id = id,
            CompanyName = buyerExists.CompanyName,
            Industry = buyerExists.Industry.ToString(),
            Email = buyerExists.User.Email,
            PreferredMinGrade = buyerExists.PreferredMinGrade
        };
    }
}