using GreenVendor.Application.DTOs;
using GreenVendor.Application.Interfaces;

namespace GreenVendor.Infrastructure.Services;
public class LocalFileStorageService : IFileStorageService
{
    public async Task<string> SaveFileAsync(FileDTO file, string folderName)
    {
        var extension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", folderName);
        if(!Directory.Exists(basePath)) Directory.CreateDirectory(basePath);

        var fullFilePath = Path.Combine(basePath, uniqueFileName);

        using(var fileStream = new FileStream(fullFilePath, FileMode.Create))
        {
            await file.Content.CopyToAsync(fileStream);
        }

        return $"/images/{folderName}/{uniqueFileName}";
    }

    public void DeleteFile(string fileUrl)
    {
        if(string.IsNullOrWhiteSpace(fileUrl)) return;

        var relativePath = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);

        var fullFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);
        if (File.Exists(fullFilePath))
        {
            File.Delete(fullFilePath);
        }
    }

}