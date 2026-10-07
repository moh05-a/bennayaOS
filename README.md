# BennayaOS

Financial and operational project management for small and medium construction
contractors. Arabic-first, starting in Jordan.

## Repository layout

```
bennaya/
├── BennayaOS.slnx                     .NET solution
├── backend/
│   └── BennayaOS.Api/                 ASP.NET Core 10 Web API
│       ├── Controllers/               HTTP endpoints (thin)
│       ├── Services/                  Business logic
│       ├── DTOs/                      Request/response shapes
│       ├── Models/                    EF Core entities
│       ├── Data/                      AppDbContext, migrations
│       ├── Middleware/                Cross-cutting (error handling)
│       └── Extensions/                DI / pipeline setup helpers
└── frontend/
    └── bennaya-os-web/                React 19 + TypeScript + Vite + Tailwind 4
        └── src/
            ├── components/            Reusable UI
            ├── pages/                 Route-level screens
            ├── services/              API client
            └── types/                 Shared TypeScript types
```

## Tech stack

| Layer    | Choice                                    |
|----------|-------------------------------------------|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind 4|
| Backend  | ASP.NET Core 10, C#, EF Core 10           |
| Database | PostgreSQL 18                             |
| API docs | OpenAPI + Scalar (`/scalar`)              |

## Prerequisites

- .NET SDK 10
- Node.js 22+
- PostgreSQL 18 running on localhost:5432

## First-time setup

### 1. Create the database and application role

Run in a terminal (you will be prompted for your `postgres` superuser password):

```bash
psql -U postgres -h localhost -c "CREATE ROLE bennaya_app WITH LOGIN PASSWORD 'choose-a-dev-password';"
psql -U postgres -h localhost -c "CREATE DATABASE bennaya_dev OWNER bennaya_app;"
```

### 2. Store the connection string outside the repository

```bash
cd backend/BennayaOS.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=bennaya_dev;Username=bennaya_app;Password=choose-a-dev-password"
```

User Secrets are stored in your Windows user profile, never in the repo.

### 3. Frontend environment

```bash
cd frontend/bennaya-os-web
cp .env.example .env.local
```

## Running

Backend (http://localhost:5160, API explorer at http://localhost:5160/scalar):

```bash
cd backend/BennayaOS.Api
dotnet run
```

Frontend (http://localhost:5173):

```bash
cd frontend/bennaya-os-web
npm run dev
```

## Languages (English / Arabic)

The language switcher is in the sidebar and on the sign-in pages. Arabic flips
the whole layout to right-to-left. The choice is remembered per browser, and
the frontend sends it to the API as `Accept-Language`, so server error messages
come back in the same language.

Adding user-facing text:

- **Frontend:** add the key to `src/i18n/en.ts` and `src/i18n/ar.ts` (the build
  fails if Arabic is missing a key), then use `t('section.key')` from
  `useLanguage()`.
- **Backend:** write the message in English in code as usual, then add an entry
  to `Resources/SharedResource.ar.resx` whose `name` is that exact English text.
- **Layout:** use logical Tailwind classes (`ms-`/`me-`, `ps-`/`pe-`,
  `start-`/`end-`, `text-start`/`text-end`) instead of left/right ones.

## Security notes

- Connection strings and signing keys live in User Secrets (dev) or environment
  variables (production). Never in `appsettings.json`.
- Anything prefixed `VITE_` is bundled into the browser. Public values only.
