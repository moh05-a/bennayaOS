# Render has no native .NET runtime, so the API ships as a container.
# Build stage: restore and publish with the full SDK.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first, on its own layer, so code changes do not re-download packages.
COPY BennayaOS.Api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

# Runtime stage: only the ASP.NET runtime and the published output.
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Render tells the app which port to use through $PORT; 8080 when run elsewhere.
CMD ["sh", "-c", "ASPNETCORE_HTTP_PORTS=${PORT:-8080} exec dotnet BennayaOS.Api.dll"]
