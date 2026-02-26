# Bridge In - Whistleblowing Platform

A multi-tenant whistleblowing platform for EU companies built with **Django + DRF** (backend) and **React + Vite** (frontend).
Each company gets a unique anonymous reporting link for their employees.

---

## Requirements

- Docker
- Docker Compose

No other dependencies are required. Everything runs inside containers.

---

## Project Structure

```text
bridgein/
├── backend/               Django + DRF API
│   ├── config/            Settings, URLs, WSGI
│   ├── users/             User model, register, /me endpoint
│   ├── companies/         Company model, magic link
│   └── reports/           Report model, public and manager endpoints
├── frontend/              React + Vite SPA
│   └── src/
│       ├── pages/         Login, Register, Dashboard, PublicReport
│       ├── contexts/      AuthContext (JWT state management)
│       └── api.js         Axios instance with automatic token refresh
├── docker-compose.yml
├── .env.example
└── .env                   (created by you, not committed)
```

---

## Architecture Diagram

```text
+-------------------------+          +---------------------------+
|   Browser / Employee    |          |   Browser / Manager       |
|                         |          |                           |
|  /report/{magic_link}   |          |  /login  /dashboard       |
+----------+--------------+          +-------------+-------------+
           |                                       |
           |           HTTP / Axios                |
           +-------------------+-------------------+
                               |
                    +----------+----------+
                    |                     |
                    |   React (Vite)      |
                    |   localhost:5173    |
                    |                     |
                    |   Pages:            |
                    |   - LoginPage       |
                    |   - RegisterPage    |
                    |   - DashboardPage   |
                    |   - ReportDetail    |
                    |   - PublicReport    |
                    +----------+----------+
                               |
                     Proxy /api -> :8000
                               |
                    +----------+----------+
                    |                     |
                    |   Django + DRF      |
                    |   localhost:8000    |
                    |                     |
                    |   Apps:             |
                    |   - users           |
                    |   - companies       |
                    |   - reports         |
                    |                     |
                    |   JWT Auth          |
                    |   Tenant Isolation  |
                    |   Signals + Email   |
                    +----------+----------+
                               |
                    +----------+----------+
                    |                     |
                    |   PostgreSQL        |
                    |   localhost:5432    |
                    |                     |
                    |   Tables:           |
                    |   - users           |
                    |   - companies       |
                    |   - reports         |
                    +---------------------+

All three services run inside Docker containers via docker-compose.
```

---

## Local Setup

### Step 1 - Clone the repository

```bash
git clone https://github.com/trmsantos/bridgein.git
cd bridgein
```

---

### Step 2 - Configure environment variables

Linux / macOS:

```bash
cp .env.example .env
```

Windows (Command Prompt):

```bat
copy .env.example .env
```

Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

The default values in `.env.example` work out of the box for local development.
You do not need to change anything to get started.

If you want to use a custom secret key, open `.env` and replace `SECRET_KEY`:

Linux / macOS:

```bash
nano .env
```

Windows:

```bat
notepad .env
```

---

### Step 3 - Build and start all services

```bash
docker compose up --build
```

On the first run this will:
- Download the PostgreSQL, Python and Node Docker images
- Install all Python and Node dependencies
- Start all three services (database, backend, frontend)

This takes approximately 2 to 3 minutes on the first run.
Subsequent runs are much faster.

> IMPORTANT: `docker compose up --build` does **not** automatically run database migrations in this project.
> On a fresh database you must run migrations manually (see Step 4).

---

### Step 4 - Run database migrations (first run)

If this is your first time running the project (or if you reset the database volume), run:

```bash
docker compose exec backend python manage.py migrate --noinput
```

If you try to register/login before migrations, you may see errors like:

- `django.db.utils.ProgrammingError: relation "users" does not exist`

---

### Step 5 - Access the application

| Service        | URL                          |
|----------------|------------------------------|
| Frontend       | http://localhost:5173        |
| Backend API    | http://localhost:8000/api/   |
| Django Admin   | http://localhost:8000/admin/ |

---

## Creating your first user

Go to http://localhost:5173/register and fill in:

- Company Name: the name of your company
- Username: your chosen username
- Email: your email address
- Password: minimum 8 characters, not entirely numeric

After registration you will be redirected to the dashboard where you will find
your unique employee reporting link to share with your team.

---

## API Endpoints

| Method    | URL                               | Auth     | Description                          |
|-----------|-----------------------------------|----------|--------------------------------------|
| POST      | /api/auth/register/               | Public   | Register manager and create company  |
| POST      | /api/auth/token/                  | Public   | Login and get JWT tokens             |
| POST      | /api/auth/token/refresh/          | Public   | Refresh access token                 |
| GET       | /api/auth/me/                     | JWT      | Get current user info                |
| GET       | /api/companies/me/                | JWT      | Get current user company info        |
| GET       | /api/reports/                     | JWT      | List all reports for your company    |
| GET/PATCH | /api/reports/{id}/                | JWT      | View or update a report status       |
| POST      | /api/reports/public/{magic_link}/ | Public   | Submit an anonymous report           |

---

## Stopping the application

Stop containers but keep the database:

```bash
docker compose down
```

Stop containers and delete all data (full reset):

```bash
docker compose down -v
```

---

## Running migrations manually

Run all migrations:

```bash
docker compose exec backend python manage.py migrate --noinput
```

If you also need to generate migration files (rare, typically only during development):

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate --noinput
```

---

## Running Tests

```bash
docker compose exec backend python manage.py test
```

Expected output:

```text
Found 13 tests.
..............
Ran 13 tests in 0.XXXs
OK
```

---

## Creating a Django superuser (for Admin panel)

```bash
docker compose exec backend python manage.py createsuperuser
```

Then access the admin panel at http://localhost:8000/admin/

---

## Email notifications (development)

When a report is created, the backend sends notifications using Django’s email system.
In development, the default configuration prints emails to the console (no SMTP required).

To use a real SMTP server, configure the email variables in `.env` (see `.env.example`).

---

## Architecture notes

- Authentication uses JWT (access token + refresh token)
- Tenant isolation is enforced at the queryset level on the backend (never trusting the frontend)
- Each company has a unique UUID magic link for anonymous report submission
- The backend uses Django development server which is suitable for local development and MVP use
  - For production replace with Gunicorn

---

## Tradeoffs for MVP

- JWT is stored in localStorage for simplicity. For higher security use httpOnly cookies.
- Django `runserver` is used instead of Gunicorn. Swap for production deployments.
- Email notifications in development are printed to console by default.
- Single manager per company is supported. Multi-manager support can be added with minimal changes.
