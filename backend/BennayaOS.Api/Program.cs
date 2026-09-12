using BennayaOS.Api.Data;
using BennayaOS.Api.Extensions;
using BennayaOS.Api.Middleware;
using BennayaOS.Api.Models;
using BennayaOS.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// 1. Database
// ---------------------------------------------------------------------------
// The connection string is NEVER written in this file or in appsettings.json.
// Development: .NET User Secrets. Production: environment variable.
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
// 2. Authentication and the current-user context
// ---------------------------------------------------------------------------
builder.Services.AddJwtAuthentication(builder.Configuration);

// ICurrentUser reads the JWT claims of the in-flight request, so it must be
// Scoped (one per request) and needs access to HttpContext.
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();

// PasswordHasher is stateless, so a single instance serves every request.
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

// The .NET default is 100,000 PBKDF2 iterations. OWASP recommends 210,000 for
// PBKDF2-HMAC-SHA512, so we raise it: each extra iteration multiplies the cost
// of an offline brute-force attack if the database is ever stolen.
//
// Existing hashes keep working. VerifyHashedPassword notices the older
// iteration count and reports SuccessRehashNeeded, and AuthService then
// re-hashes the password transparently at the user next login.
builder.Services.Configure<PasswordHasherOptions>(options =>
{
    options.IterationCount = 210_000;
});

// ---------------------------------------------------------------------------
// 3. Application services
// ---------------------------------------------------------------------------
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IClientService, ClientService>();

// ---------------------------------------------------------------------------
// 4. Error handling
// ---------------------------------------------------------------------------
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ---------------------------------------------------------------------------
// 5. CORS
// ---------------------------------------------------------------------------
// The browser blocks the React app (localhost:5173) from calling the API
// (localhost:5160) unless the API explicitly allows that origin.
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
// 6. MVC controllers + OpenAPI document
// ---------------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddOpenApiWithAuth();

var app = builder.Build();

// ---------------------------------------------------------------------------
// 7. HTTP pipeline (order matters - each piece wraps the next)
// ---------------------------------------------------------------------------

// First, so it can catch exceptions thrown by everything after it.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                 // raw document at /openapi/v1.json
    app.MapScalarApiReference();      // interactive explorer at /scalar
}
else
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

app.UseCors(FrontendCorsPolicy);

// Authentication answers "who is this?" and must run before authorization,
// which answers "are they allowed?".
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
