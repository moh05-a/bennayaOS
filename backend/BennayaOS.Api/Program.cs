using System.Text.Json.Serialization;
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
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IClientPaymentService, ClientPaymentService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<ISubcontractorService, SubcontractorService>();
builder.Services.AddScoped<IProjectTaskService, ProjectTaskService>();
builder.Services.AddScoped<IMaterialService, MaterialService>();

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

// Browsers send the origin as "https://host" with no trailing slash, and the
// match is exact - so stray quotes, spaces or a "/" pasted into a hosting
// dashboard would silently block the frontend. Normalise them away.
var allowedOrigins = (builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? [])
    .Select(origin => origin.Trim().Trim('"', '\'').Trim().TrimEnd('/'))
    .Where(origin => origin.Length > 0)
    .ToArray();

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
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as their names ("Active") rather than integers (1).
        // The frontend then works with readable values, and reordering the enum
        // cannot silently change what an API response means.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    })
    // Validation messages come back in the caller's language.
    .AddAppValidationLocalization();
builder.Services.AddOpenApiWithAuth();

// Strips internal .NET type names out of automatic 400 responses.
builder.Services.AddCleanValidationResponses();

// ---------------------------------------------------------------------------
// 7. Localization (English / Arabic, chosen by the Accept-Language header)
// ---------------------------------------------------------------------------
builder.Services.AddAppLocalization();

var app = builder.Build();

// Shown in the hosting logs at startup, so a CORS misconfiguration is visible
// without guessing. Origins are public URLs, not secrets.
app.Logger.LogInformation(
    "CORS allowed origins: {Origins}",
    allowedOrigins.Length > 0 ? string.Join(", ", allowedOrigins) : "(none)");

// ---------------------------------------------------------------------------
// 8. HTTP pipeline (order matters - each piece wraps the next)
// ---------------------------------------------------------------------------

// Before the exception handler, so that error responses are translated too:
// the language is set on the way in, and the handler runs inside that scope.
app.UseRequestLocalization();

// Catches exceptions thrown by everything after it.
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
