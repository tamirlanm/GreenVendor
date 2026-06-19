FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["GreenVendor.Api/GreenVendor.Api.csproj", "GreenVendor.Api/"]
COPY ["GreenVendor.Domain/GreenVendor.Domain.csproj", "GreenVendor.Domain/"]
COPY ["GreenVendor.Application/GreenVendor.Application.csproj", "GreenVendor.Application/"]
COPY ["GreenVendor.Infrastructure/GreenVendor.Infrastructure.csproj", "GreenVendor.Infrastructure/"]
RUN dotnet restore "GreenVendor.Api/GreenVendor.Api.csproj"
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT [ "dotnet", "GreenVendor.Api.dll" ]