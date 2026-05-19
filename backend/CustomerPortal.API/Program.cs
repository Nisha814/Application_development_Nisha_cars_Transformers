using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using CustomerPortal.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Perform TCP port check to determine if PostgreSQL database is running locally
bool useSqlite = false;
try
{
    using (var tcpClient = new System.Net.Sockets.TcpClient())
    {
        var result = tcpClient.BeginConnect("127.0.0.1", 5432, null, null);
        var success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromMilliseconds(500));
        if (!success)
        {
            useSqlite = true;
        }
        else
        {
            tcpClient.EndConnect(result);
        }
    }
}
catch
{
    useSqlite = true;
}

// Add Database Context with fallback detection
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (useSqlite)
    {
        Console.WriteLine("--> PostgreSQL database offline. Falling back to SQLite: CustomerPortal.db");
        options.UseSqlite("Data Source=CustomerPortal.db");
    }
    else
    {
        Console.WriteLine("--> PostgreSQL database online. Using Npgsql Connection.");
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings.GetValue<string>("Secret") ?? "DefaultSuperSecretKeyThatIsVeryLongAndSecure123!";
var issuer = jwtSettings.GetValue<string>("Issuer");
var audience = jwtSettings.GetValue<string>("Audience");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Add Controllers and configure JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Configure OpenAPI
builder.Services.AddOpenApi(options =>
{
    // Document transformer to add the security scheme
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        var securityScheme = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Name = "Authorization",
            Scheme = JwtBearerDefaults.AuthenticationScheme,
            BearerFormat = "JWT",
            In = ParameterLocation.Header
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes[JwtBearerDefaults.AuthenticationScheme] = securityScheme;
        return Task.CompletedTask;
    });

    // Operation transformer to add security requirement for endpoints with [Authorize]
    options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        var hasAuthorize = context.Description.ActionDescriptor.EndpointMetadata
            .Any(em => em is Microsoft.AspNetCore.Authorization.IAuthorizeData);

        var hasAllowAnonymous = context.Description.ActionDescriptor.EndpointMetadata
            .Any(em => em is Microsoft.AspNetCore.Authorization.IAllowAnonymous);

        if (hasAuthorize && !hasAllowAnonymous)
        {
            operation.Security ??= new List<OpenApiSecurityRequirement>();
            operation.Security.Add(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, null),
                    new List<string>()
                }
            });
        }

        return Task.CompletedTask;
    });
});

var app = builder.Build();

// Automatically initialize/migrate database on startup
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (useSqlite)
        {
            dbContext.Database.EnsureCreated();
            Console.WriteLine("--> SQLite database schema verified/created.");
        }
        else
        {
            dbContext.Database.Migrate();
            Console.WriteLine("--> PostgreSQL database migrations applied.");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"--> Database initialization failed: {ex.Message}");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("The Nisha Cars Transformers Customer Portal API")
               .WithTheme(ScalarTheme.Mars);
    });
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
