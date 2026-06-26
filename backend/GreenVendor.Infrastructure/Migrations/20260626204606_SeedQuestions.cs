using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GreenVendor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Questions",
                columns: new[] { "Id", "Category", "IsActive", "OptionsJson", "Text", "Weight" },
                values: new object[,]
                {
                    { 1, 0, true, "[{\"Text\":\"No\", \"Points\":0}, {\"Text\":\"Partially (up to 30%)\", \"Points\":0.5}, {\"Text\":\"Yes (more than 30%)\", \"Points\": 1.0}]", "Does your company use renewable energy sources (RES)?", 1.0m },
                    { 2, 0, true, "[{\"Text\":\"No\", \"Points\":0}, {\"Text\":\"In the production process\", \"Points\":0.3}, {\"Text\":\"Yes it works completely\", \"Points\": 1.0}]", "Has the company implemented a system for the separate collection and safe disposal of hazardous waste?", 1.2m },
                    { 3, 0, true, "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"Accounting is maintained, but auditing is not carried out\",\"Points\":0.5},{\"Text\":\"Yes, the data is certified by an external auditor\",\"Points\":1.0}]", "Does your company regularly record and audit its greenhouse gas (CO2) emissions?", 1.0m },
                    { 4, 0, true, "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"Yes, in some areas\",\"Points\":0.6},{\"Text\":\"Yes, in all production\",\"Points\":1.0}]", "Does the company use closed-loop water supply technologies?", 0.8m },
                    { 5, 1, true, "[{\"Text\":\"There are no basic regulations\",\"Points\":0},{\"Text\":\"There are basic instructions\",\"Points\":0.5},{\"Text\":\"Yes, international standards (ISO 45001) have been implemented\",\"Points\":1.0}]", "Does the company have formal occupational safety and health and injury reduction programs?", 1.2m },
                    { 6, 1, true, "[{\"Text\":\"No, employees train themselves.\",\"Points\":0},{\"Text\":\"Yes, for some departments\",\"Points\":0.5},{\"Text\":\"Yes, systematically for all staff\",\"Points\":1.0}]", "Does the company provide regular training, workshops, or advanced training courses for employees at its own expense?", 1.0m },
                    { 7, 1, true, "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"Declared orally\",\"Points\":0.4},{\"Text\":\"Yes, it is enshrined in the Company Code\",\"Points\":1.0}]", "Does the company have a formal equality, inclusion and non-discrimination policy?", 0.9m },
                    { 8, 1, true, "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"Rarely / one-time promotions\",\"Points\":0.5},{\"Text\":\"Yes, on a regular long-term basis\",\"Points\":1.0}]", "Does the company finance charitable, environmental, or social projects in the regions where it operates?", 0.9m },
                    { 9, 2, true, "[{\"Text\":\"No\",\"Points\":0},{\"Text\":\"There are only general rules in contracts\",\"Points\":0.4},{\"Text\":\"Yes, there is a dedicated compliance officer and regulations.\",\"Points\":1.0}]", "Has the company adopted a Code of Business Ethics and an anti-corruption compliance policy?", 1.2m },
                    { 10, 2, true, "[{\"Text\":\"No, only government audits\",\"Points\":0},{\"Text\":\"Once every few years\",\"Points\":0.5},{\"Text\":\"Yes, annually by independent auditors\",\"Points\":1.0}]", "Are your company's financial statements regularly audited by an independent external auditor?", 1.1m },
                    { 11, 2, true, "[{\"Text\":\"No channels\",\"Points\":0},{\"Text\":\"There is a regular suggestion box (does not guarantee anonymity)\",\"Points\":0.4},{\"Text\":\"Yes, there is a dedicated hotline / anonymous portal\",\"Points\":1.0}]", "Does the company have transparent and secure channels for anonymous whistleblowing?", 1.0m },
                    { 12, 2, true, "[{\"Text\":\"Information is completely closed\",\"Points\":0},{\"Text\":\"Partially disclosed upon request\",\"Points\":0.6},{\"Text\":\"Yes, the information is completely public and transparent\",\"Points\":1.0}]", "Does the company disclose the structure of its ultimate beneficial owners and top management on its official website?", 0.7m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Questions",
                keyColumn: "Id",
                keyValue: 12);
        }
    }
}
