using FluentValidation;
using GreenVendor.Application.DTOs;
using GreenVendor.Application.Exceptions;
using GreenVendor.Application.Interfaces;
using GreenVendor.Domain.Entities;
using GreenVendor.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GreenVendor.Application.Services;

public class ProductService : IProductService
{
    private readonly IAppDbContext _db;
    private readonly IFileStorageService _fileStorage;
    private readonly IValidator<FileDTO> _validatorFile;
    private readonly IValidator<UpdateProductRequest> _validatorUpdate;
    private readonly IValidator<CreateProductRequest> _validatorCreate;
    public ProductService(IAppDbContext db, IFileStorageService fileStorage, IValidator<FileDTO> validatorFile, IValidator<UpdateProductRequest> validatorUpdate, IValidator<CreateProductRequest> validatorCreate)
    {
        _db = db;
        _fileStorage = fileStorage;
        _validatorFile = validatorFile;
        _validatorUpdate = validatorUpdate;
        _validatorCreate = validatorCreate;
    }

    public async Task<PagedResult<ProductsCatalog>> GetProductsAsync(ProductQuery query)
    {
        var queryable = _db.Products.Include(p => p.Supplier).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            queryable = queryable.Where(p => p.Name.Contains(query.Name));
        }

        if(!string.IsNullOrWhiteSpace(query.Category) && Enum.TryParse<ProductCategory>(query.Category, ignoreCase: true, out var parsedCategory))
        {
            queryable = queryable.Where(p => p.Category == parsedCategory);
        }

        if (query.MinPrice.HasValue)
        {
            queryable = queryable.Where(p => p.Price >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            queryable = queryable.Where(p => p.Price <= query.MaxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.MinEsgGrade))
        {
            var minScore = query.MinEsgGrade.ToUpperInvariant() switch
            {
                "A" => 85m,
                "B" => 70m,
                "C" => 55m,
                "D" => 40m,
                "F" => 0m,
                _ => (decimal?) null
            };
            if (minScore.HasValue)
            {
                queryable = queryable.Where(p => p.Supplier.LatestScore != null && p.Supplier.LatestScore.Total >= minScore.Value);
            }
        }

        var totalProducts = await queryable.CountAsync();

        var items = await queryable.OrderBy(p => p.Name)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(p => new ProductsCatalog
            {
                Id = p.Id,
                SupplierId = p.SupplierId,
                Name = p.Name,
                ProductCategory = p.Category.ToString(),
                Price = p.Price,
                ImageUrl = p.ImageUrl
            }).ToListAsync();

            
        return new PagedResult<ProductsCatalog>
        {
            Items = items,
            PageNumber = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalProducts
        };
    }

    public async Task<ProductResponse> GetProductAsync(Guid id)
    {
        var product = await _db.Products.Include(p => p.Supplier).FirstOrDefaultAsync(p => p.Id == id);
        if(product is null)
        {
            throw new NotFoundException($"Product not found.");
        }

        return new ProductResponse
        {
            Id = id,
            SupplierId = product.SupplierId,
            Name = product.Name,
            Description = product.Description,
            Category = product.Category.ToString(),
            Price = product.Price,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            Supplier = product.Supplier.CompanyName,
            ImageUrl = product.ImageUrl
        };
    }

    public async Task<PagedResult<SupplierProductsCatalog>> GetMyProductsAsync(Guid supplierId, ProductQuery query)
    {

        var supplier = await _db.SupplierProfiles.FirstOrDefaultAsync(s => s.Id == supplierId);
        if(supplier is null)
        {
            throw new NotFoundException($"Supplier with Id={supplierId} not found.");
        }

        var queryable = _db.Products.AsQueryable();

        queryable = queryable.Where(p => p.SupplierId == supplierId);

        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            queryable = queryable.Where(p => p.Name.Contains(query.Name));
        }

        if(!string.IsNullOrWhiteSpace(query.Category) && Enum.TryParse<ProductCategory>(query.Category, ignoreCase: true, out var parsedCategory))
        {
            queryable = queryable.Where(p => p.Category == parsedCategory);
        }

        if (query.MinPrice.HasValue)
        {
            queryable = queryable.Where(p => p.Price >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            queryable = queryable.Where(p => p.Price <= query.MaxPrice.Value);
        }

        var totalProducts = await queryable.CountAsync();

        var items = await queryable.OrderBy(p => p.Name)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(p => new SupplierProductsCatalog
            {
                Id = p.Id,
                SupplierId = p.SupplierId,
                Name = p.Name,
                ProductCategory = p.Category.ToString(),
                Price = p.Price,
                ImageUrl = p.ImageUrl
            }).ToListAsync();
        
        return new PagedResult<SupplierProductsCatalog>
        {
            Items = items,
            PageNumber = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalProducts
        };
    } 

    public async Task<ProductResponse?> CreateProductAsync(Guid id, CreateProductRequest request)
    {
        var validatorResult = await _validatorCreate.ValidateAsync(request);
        if (!validatorResult.IsValid)
        {
            var error = string.Join("; ", validatorResult.Errors.Select(e => e.ErrorMessage));
            throw new BadRequestException($"Error validation: {error}");
        }

        var supplier = await _db.SupplierProfiles.FirstOrDefaultAsync(s => s.Id == id);
        if(supplier is null)
        {
            throw new NotFoundException($"Supplier profile with Id={id} not found.");
        }

        Enum.TryParse<ProductCategory>(request.Category, ignoreCase: true, out var parsedCategory);

        var newProduct = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Category = parsedCategory,
            Price = request.Price,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            SupplierId = supplier.Id,
            Supplier = supplier
        };

        _db.Products.Add(newProduct);
        await _db.SaveChangesAsync();

        var response = new ProductResponse
        {
            Id = newProduct.Id,
            SupplierId = newProduct.SupplierId,
            Name = newProduct.Name,
            Description = newProduct.Description,
            Category = newProduct.Category.ToString(),
            Price = newProduct.Price,
            IsActive = newProduct.IsActive,
            CreatedAt = newProduct.CreatedAt,
            Supplier = supplier.CompanyName,
            ImageUrl = newProduct.ImageUrl
        };
        return response;
    }

    public async Task<ProductResponse?> UpdateProductAsync(Guid id, Guid supplierId, UpdateProductRequest request)
    {
        
        var validatorResult = await _validatorUpdate.ValidateAsync(request);
        if (!validatorResult.IsValid)
        {
            var error = string.Join("; ", validatorResult.Errors.Select(e => e.ErrorMessage));
            throw new BadRequestException($"Error validation: {error}");
        }

        var supplier = await _db.SupplierProfiles.FirstOrDefaultAsync(s => s.Id == supplierId);
        if(supplier is null)
        {
            throw new NotFoundException($"Supplier with Id={supplierId} not found.");
        }
        var productExists = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.SupplierId == supplierId);

        if(productExists is null)
        {
            throw new NotFoundException($"Product with Id={id} not found.");
        }   

        Enum.TryParse<ProductCategory>(request.Category, ignoreCase: true, out var parsedCategory);
        
        productExists.Name = request.Name;
        productExists.Description = request.Description;
        productExists.Category = parsedCategory;
        productExists.Price = request.Price;
        productExists.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        var response = new ProductResponse
        {
            Id = productExists.Id,
            SupplierId = productExists.SupplierId,
            Name = productExists.Name,
            Description = productExists.Description,
            Category = productExists.Category.ToString(),
            Price = productExists.Price,
            IsActive = productExists.IsActive,
            CreatedAt = productExists.CreatedAt,
            Supplier = supplier.CompanyName,
            ImageUrl = productExists.ImageUrl    
        };
        return response;
    }

    public async Task<bool> DeleteProductAsync(Guid id, Guid supplierId)
    {
        var supplier = await _db.SupplierProfiles.FirstOrDefaultAsync(s => s.Id == supplierId);
        if(supplier is null)
        {
            throw new NotFoundException($"Supplier with Id={supplierId} not found.");
        }

        var productExists = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.SupplierId == supplierId);
        if(productExists is null)
        {
            throw new NotFoundException($"Current product with Id={id} not found.");
        }

        _db.Products.Remove(productExists);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<ProductResponse> UploadProductPhotoAsync(Guid productId, Guid supplierId, FileDTO file)
    {
        var fileValidation = await _validatorFile.ValidateAsync(file);
        if (!fileValidation.IsValid)
        {
            var error = string.Join("; ", fileValidation.Errors.Select(e => e.ErrorMessage));
            throw new BadRequestException($"Error validation: {error}");
        }

        var product = await _db.Products.Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.Id == productId && p.SupplierId == supplierId);
        if (product is null)
        {
            throw new NotFoundException($"Product with Id={productId} not found.");
        }

        var oldImageUrl = product.ImageUrl;
        product.ImageUrl = await _fileStorage.SaveFileAsync(file, "products");
        await _db.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(oldImageUrl))
        {
            _fileStorage.DeleteFile(oldImageUrl); 
        }

        return new ProductResponse
        {
            Id = product.Id,
            SupplierId = product.SupplierId,
            Name = product.Name,
            Description = product.Description,
            Category = product.Category.ToString(),
            Price = product.Price,
            IsActive = product.IsActive,
            ImageUrl = product.ImageUrl,
            CreatedAt = product.CreatedAt,
            Supplier = product.Supplier.CompanyName
        };
    }

    public async Task<bool> DeleteProductPhotoAsync(Guid productId, Guid supplierId)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == productId && p.SupplierId == supplierId);
        if (product is null)
        {
            throw new NotFoundException($"Product with Id={productId} not found.");
        }
        if (!string.IsNullOrWhiteSpace(product.ImageUrl))
        {
            _fileStorage.DeleteFile(product.ImageUrl);
            product.ImageUrl = null;
            await _db.SaveChangesAsync();
        }
        return true;
    }
}