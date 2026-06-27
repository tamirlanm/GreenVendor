using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreenVendor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class dommodelsupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "SupplierProfiles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "SupplierProfiles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "RevokedAt",
                table: "RefreshTokens",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "SupplierProfiles");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "SupplierProfiles");

            migrationBuilder.DropColumn(
                name: "RevokedAt",
                table: "RefreshTokens");
        }
    }
}
