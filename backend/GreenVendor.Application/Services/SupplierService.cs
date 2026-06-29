namespace GreenVendor.Infrastructure.Services;

using System.Reflection.Metadata.Ecma335;
using FluentValidation;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

public class SupplierService : ISupplierService
{
    private readonly IAppDbContext _db;
    private readonly IValidator<UpdateSupplierRequest> _validator;
    public SupplierService(IAppDbContext db, IValidator<UpdateSupplierRequest> validator){
        _db = db;
        _validator = validator;
    }

    public async Task<IEnumerable<SupplierCatalogItemResponse>> GetSuppliersQueryAsync(SupplierQuery query)
    {
        var queryable = _db.SupplierProfiles.AsQueryable();
        if (!string.IsNullOrEmpty(query.CompanyName))
        {
            queryable = queryable.Where(s => s.CompanyName.Contains(query.CompanyName));
        }
        if (!string.IsNullOrEmpty(query.Industry) && Enum.TryParse<Industry>(query.Industry, true, out var industryEnum))
        {
            queryable = queryable.Where(s => s.Industry == industryEnum);
        }
        if (query.LatestEsgScore.HasValue)
        {
            queryable = queryable.Where(s => s.LatestScore != null && s.LatestScore.Total >= query.LatestEsgScore);
        }
        var result = await queryable
        .Skip((query.Page - 1) * query.PageSize)
        .Take(query.PageSize)
        .Select(supplier => new SupplierCatalogItemResponse
            {
                Id = supplier.Id,
                CompanyName = supplier.CompanyName,
                Industry = supplier.Industry.ToString(), 
                Description = supplier.Description ?? string.Empty,
                IsVerified = supplier.IsVerified,
                LatestEsgScore = supplier.LatestScore != null ? supplier.LatestScore.Total : null
            })
        .ToListAsync();

        return result;
    }

    public async Task<SupplierDetailsResponse?> GetSupplierDetailsAsync(Guid id)
    {
        var supplier  = await _db.SupplierProfiles.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if(supplier is null)
        {
            throw new NotFoundException($"Supplier with this Id={id} not found.");
        }
        return new SupplierDetailsResponse
        {
            Id = id,
            CompanyName = supplier.CompanyName,
            Industry = supplier.Industry.ToString(),
            Description = supplier.Description,
            IsVerified = supplier.IsVerified,
            Email = supplier.User.Email,
            Phone = supplier.Phone,
            TotalEsgScore = supplier.LatestScore != null ? supplier.LatestScore.Total : null,
            EsgGrade = supplier.LatestScore != null ? supplier.LatestScore.Grade : null
        };
    }

    public async Task<Guid> GetMySupplierIdAsync(Guid userId)
    {
        var supplier = await _db.SupplierProfiles.FirstOrDefaultAsync(s => s.UserId == userId);
        if(supplier is null)
        {
            throw new NotFoundException("Supplier profile not found for this user.");
        }
        return supplier.Id;
    }

    public async Task<SupplierDetailsResponse?> UpdateSupplierAsync(Guid id, UpdateSupplierRequest request)
    {
        var validatorResult = await _validator.ValidateAsync(request);
        if (!validatorResult.IsValid)
        {
            var error = string.Join("; ", validatorResult.Errors.Select(e => e.ErrorMessage));
            throw new BadRequestException($"Error validation: {error}");
        }

        var supplierExists = await _db.SupplierProfiles.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if(supplierExists is null)
        {
            throw new NotFoundException("Supplier Id={id} is not found");
        }

        supplierExists.CompanyName = request.CompanyName;
        supplierExists.Description = request.Description;
        supplierExists.User.Email = request.Email;
        supplierExists.Phone = request.Phone;

        supplierExists.Industry = Enum.TryParse<Industry>
                        (request.Industry, ignoreCase: true, out var parsedIndustry)
                        && !int.TryParse(request.Industry, out _) ? parsedIndustry : Industry.Other;

        await _db.SaveChangesAsync();
        return new SupplierDetailsResponse
        {
            Id = id,
            CompanyName = supplierExists.CompanyName,
            Industry = supplierExists.Industry.ToString(),
            Description = supplierExists.Description,
            IsVerified = supplierExists.IsVerified,
            Email = supplierExists.User.Email,
            Phone = supplierExists.Phone,
            TotalEsgScore = supplierExists.LatestScore != null ? supplierExists.LatestScore.Total : null,
            EsgGrade = supplierExists.LatestScore != null ? supplierExists.LatestScore.Grade : null  
        };
    }

    public async Task<bool> UploadCertificateAsync(Guid id, Stream fileStream, string fileName)
    {
        string extension = ValidateCertificate(fileStream, fileName);

        var supplier = await _db.SupplierProfiles.FirstOrDefaultAsync(s => s.Id == id);
        if(supplier is null)
        {
            throw new NotFoundException($"Supplier with Id={id} not found.");
        }

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";   
        var folderPath = GetCertificateFolderPath();
        var filePath = Path.Combine(folderPath, uniqueFileName);

        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }
        using(var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(stream);
        }

        supplier.CertificatePath = uniqueFileName;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)> GetCertificateAsync(Guid supplierId)
    {
        var supplier = await _db.SupplierProfiles.FirstOrDefaultAsync(s => s.Id == supplierId);
        if(supplier is null)
        {
            throw new NotFoundException($"Supplier with Id={supplierId} not found");
        }
        if (string.IsNullOrWhiteSpace(supplier.CertificatePath))
        {
            throw new NotFoundException("This supplier has not uploaded a certificate yet.");
        }
        var filePath = Path.Combine(GetCertificateFolderPath(), supplier.CertificatePath);

        if (!File.Exists(filePath))
        {
            throw new NotFoundException("Certificate file is missing from storage.");
        }

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        var contentType = GetContentType(supplier.CertificatePath);
        return (stream, contentType, supplier.CertificatePath);
    }
    
    private static string GetCertificateFolderPath() => Path.Combine(Directory.GetCurrentDirectory(), "ProtectedStorage", "Certificates");

    private static string GetContentType(string fileName) => Path.GetExtension(fileName).ToLowerInvariant() switch
    {
        ".pdf" => "application/pdf",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".pem" or ".crt" or ".cer" or ".der" => "application/x-x509-ca-cert",
        _ => "application/octet-stream" 
    };
    
    private string ValidateCertificate(Stream fileStream, string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new BadRequestException("File name cannot be empty.");
        }
        var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
        var allowedExtensions = new[] {".pdf", ".jpg", ".jpeg", ".png", ".pem", ".crt", ".cer", ".der"};

        if(string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
        {
            throw new BadRequestException($"Invalid file type. Allowed extensions are: {string.Join(", ", allowedExtensions)}");
        }

        long maxFileSize = 10 * 1024 * 1024;
        if(fileStream == null || fileStream.Length == 0)
        {
            throw new BadRequestException("File is empty");
        }
        if(fileStream.Length > maxFileSize)
        {
            throw new BadRequestException("File size exceeds the 10MB limit.");
        }
        return extension;
    }
}