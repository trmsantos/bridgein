# BridgeIn - Whistleblowing Platform

A multi-tenant whistleblowing platform for EU companies built with Django and React.
Each company gets a unique anonymous reporting link for their employees.

---

## Requirements

- Docker
- Docker Compose

No other dependencies are required. Everything runs inside containers.

---

## Project Structure

```
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

```
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

Windows and Linux:
```
git clone https://github.com/trmsantos/bridgein.git
cd bridgein
```

---

### Step 2 - Configure environment variables

Linux / macOS:
```
cp .env.example .env
```

Windows (Command Prompt):
```
copy .env.example .env
```

Windows (PowerShell):
```
Copy-Item .env.example .env
```

The default values in .env.example work out of the box for local development.
You do not need to change anything to get started.

If you want to use a custom secret key, open .env and replace the SECRET_KEY value:

Linux / macOS:
```
nano .env
```

Windows:
```
notepad .env
```

---

### Step 3 - Build and start all services

Windows and Linux:
```
docker compose up --build
```

On the first run this will:
- Download the PostgreSQL, Python and Node Docker images
- Install all Python and Node dependencies
- Run database migrations automatically
- Start all three services (database, backend, frontend)

This takes approximately 2 to 3 minutes on the first run.
Subsequent runs are much faster.

---

### Step 4 - Access the application

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

| Method    | URL                                    | Auth     | Description                          |
|-----------|----------------------------------------|----------|--------------------------------------|
| POST      | /api/auth/register/                    | Public   | Register manager and create company  |
| POST      | /api/auth/token/                       | Public   | Login and get JWT tokens             |
| POST      | /api/auth/token/refresh/               | Public   | Refresh access token                 |
| GET       | /api/auth/me/                          | JWT      | Get current user info                |
| GET       | /api/companies/me/                     | JWT      | Get current user company info        |
| GET       | /api/reports/                          | JWT      | List all reports for your company    |
| GET/PATCH | /api/reports/{id}/                     | JWT      | View or update a report status       |
| POST      | /api/reports/public/{magic_link}/      | Public   | Submit an anonymous report           |

---

## Stopping the application

Stop containers but keep the database:
```
docker compose down
```

Stop containers and delete all data (full reset):
```
docker compose down -v
```

---

## Running migrations manually

If for any reason migrations did not run automatically:

```
docker compose exec backend python manage.py migrate
```

---

## Running Tests

```
docker compose exec backend python manage.py test
```

Expected output:
```
Found 13 tests.
..............
Ran 13 tests in 0.XXXs
OK
```

---

## Creating a Django superuser (for Admin panel)

```
docker compose exec backend python manage.py createsuperuser
```

Then access the admin panel at http://localhost:8000/admin/

---

## Architecture notes

- Authentication uses JWT (access token + refresh token)
- Tenant isolation is enforced at the queryset level on the backend, never trusting the frontend
- Each company has a unique UUID magic link for anonymous report submission
- When a report is created a Django signal logs a notification to the console
  The signal is structured so that email integration can be added later without changing the report creation logic
- The backend uses Django development server which is suitable for local development and MVP use
  For production replace with Gunicorn

---

## Tradeoffs for MVP

- JWT is stored in localStorage for simplicity. For higher security use httpOnly cookies.
- Django runserver is used instead of Gunicorn. Swap for production deployments.
- No email notifications yet. The signal hook is ready, add an email backend to enable it.
- Single manager per company is supported. Multi-manager support can be added with minimal changes.