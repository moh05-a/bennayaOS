using BennayaOS.Api.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// 1. Database
// ---------------------------------------------------------------------------
// The connection string is NEVER written in this file or in appsettings.json.
// In development it comes from .NET User Secrets (stored outside the repo).
// In production it comes from an environment variable.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is not configured. " +
        "In development run: dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"...\"");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
           // Maps ContractValue -> contract_value, ProjectTasks -> project_tasks.
           // Keeps the PostgreSQL schema idiomatic so hand-written SQL does not
           // need double quotes around every identifier.
           .UseSnakeCaseNamingConvention());

// ---------------------------------------------------------------------------
// 2. CORS
// ---------------------------------------------------------------------------
// The browser blocks the React app (localhost:5173) from calling the API
// (localhost:5160) unless the API explicitly allows that origin.
// Origins come from configuration so production can differ from development.
const string FrontendCorsPolicy = "FrontendCorsPolicy";

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ---------------------------------------------------------------------------
// 3. MVC controllers + OpenAPI document
// ---------------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// ---------------------------------------------------------------------------
// 4. HTTP pipeline (order matters - each piece wraps the next)
// ---------------------------------------------------------------------------
if (app.Environment.IsDevelopment())
{
    // Serves the raw OpenAPI JSON at /openapi/v1.json ...
    app.MapOpenApi();
    // ... and the interactive API explorer at /scalar
    app.MapScalarApiReference();
}
else
{
    // Only force HTTPS outside development. In development this would make
    // the React dev server follow redirects across ports for no benefit.
    app.UseHttpsRedirection();
    app.UseHsts();
}

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
