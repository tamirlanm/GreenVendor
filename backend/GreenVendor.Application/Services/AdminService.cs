using System.Data.Common;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GreenVendor.Application.Services;

public class AdminService : IAdminService
{   
    private readonly IAppDbContext _db;
    private readonly IQuestionnaireService _questionnaireService;
    public AdminService(IAppDbContext db, IQuestionnaireService questionnaireService)
    {
        _db = db;
        _questionnaireService = questionnaireService;
    }

    public async Task<IEnumerable<SupplierCatalogItemResponse>> GetSuppliersAdminAsync()
    {
        var supppiers = await _db.SupplierProfiles.ToListAsync();

        return supppiers.Select(supplier => new SupplierCatalogItemResponse
        {
            Id = supplier.Id,
            CompanyName = supplier.CompanyName,
            Industry = supplier.Industry.ToString(),
            Description = supplier.Description ?? string.Empty,
            IsVerified = supplier.IsVerified,
            LatestEsgScore = supplier.LatestScore != null ? supplier.LatestScore.Total : null
        });
    }

    public async Task<SupplierDetailsResponse?> VerifySupplierAsync(Guid id)
    {
        var supplier = await _db.SupplierProfiles.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if(supplier is null)
        {
            throw new NotFoundException("Supplier not found.");
        }    
        
        supplier.IsVerified = true;
        await _db.SaveChangesAsync();

        
        return new SupplierDetailsResponse
        {
            Id = id,
            CompanyName = supplier.CompanyName,
            Industry = supplier.Industry.ToString(),
            Description = supplier.Description,
            IsVerified = supplier.IsVerified,
            Email = supplier.User.Email,
            Phone = supplier.Phone,
            TotalEsgScore = supplier.LatestScore?.Total,
            EsgGrade = supplier.LatestScore?.Grade
        };
    }

    public async Task<PlatformAnalyticsDTO> GetAnalyticsAsync()
    {
        var totalSuppliers = await _db.SupplierProfiles.CountAsync();
        var verifiedSuppliers = await _db.SupplierProfiles.CountAsync(s => s.IsVerified);

        var questionnaireSubmitted = await _db.Questionnaires.CountAsync(q => q.Status == Domain.Enums.QuestionnaireStatus.Submitted);
        var averageEsgScore = await _db.EsgScores.AnyAsync() ? await _db.EsgScores.AverageAsync(e => e.Total) : 0m;
        
        return new PlatformAnalyticsDTO
        {
            TotalSuppliers = totalSuppliers,
            VerifiedSuppliersCount = verifiedSuppliers,
            SubmittedQuestionnairesCount = questionnaireSubmitted,
            AverageEsgScore = averageEsgScore
        };
    }
    
    public async Task CreateQuestionnaireForSupplierAsync(Guid supplierId)
    {
        await _questionnaireService.CreateQuestionnaireAsync(supplierId);
    }

}