# ⚓ VesselIQ — Vessel Market Performance Platform

A full-stack web application for tracking vessel hire rates vs. market rates by region.

---

## 📖 Project Overview (ELI5)

Imagine you have a bunch of big ships sailing around the world. Every ship costs money to hire for the day, like renting a toy. Now, there's also a "fair price" that everyone in the market agrees on — that's the market rate.

This app is like a **report card for ships**. Every day, someone (an Admin) writes down:
- "How much did we pay to hire this ship today?" (Hire Rate)
- "How much should we have paid, based on what everyone else is paying?" (Market Rate)
- A secret code called an **HS Code** that describes what cargo is on the ship

Then, you can look at pretty charts to see:
- **Per Ship:** Is our ship costing us more or less than the fair price? (Only Admins can see the secret HS code)
- **All Ships Together:** Looking at all our ships as a team, are we spending too much or too little? (No secret codes shown here)

There are two kinds of people who use this app:
- 👑 **Admin:** Can look at everything AND enter new data
- 👤 **Office User:** Can only look at the charts, cannot enter data

---

## 🔬 Technical Documentation

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)            │
│  TypeScript · React Router · Recharts · Axios            │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP REST (JWT Bearer Token)
┌───────────────────────────▼─────────────────────────────┐
│                   Django Backend (Port 8000)             │
│  DRF · SimpleJWT · django-cors-headers                   │
└───────────────────────────┬─────────────────────────────┘
                            │ psycopg2
┌───────────────────────────▼─────────────────────────────┐
│               PostgreSQL Database (Port 5432)            │
│  vessel_market_db                                        │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer     | Technology                                         |
|-----------|----------------------------------------------------|
| Frontend  | React 18 · TypeScript · React Router v6 · Recharts |
| Backend   | Django 4.2 · Django REST Framework · SimpleJWT     |
| Database  | PostgreSQL 15                                      |
| Auth      | JWT (access 8h · refresh 1d)                       |
| Container | Docker · Docker Compose                            |

---

### Data Models

#### `Region`
Represents a geographic shipping region (e.g. East Asia, Middle East).

| Field       | Type        | Notes                   |
|-------------|-------------|-------------------------|
| name        | CharField   | Human-readable name     |
| code        | CharField   | Short code, e.g. `EA`   |
| description | TextField   | Optional                |

#### `Vessel`
A physical vessel assigned to a region.

| Field       | Type        | Notes                   |
|-------------|-------------|-------------------------|
| name        | CharField   | Vessel name             |
| imo_number  | CharField   | Unique IMO ID           |
| vessel_type | CharField   | e.g. Bulk Carrier       |
| region      | FK→Region   |                         |
| is_active   | BooleanField|                         |

#### `MarketRate`
Daily rate entry for a vessel in a region. **Unique per (vessel, region, date).**

| Field        | Type           | Notes                            |
|--------------|----------------|----------------------------------|
| vessel       | FK→Vessel      |                                  |
| region       | FK→Region      |                                  |
| date         | DateField      | The calendar date                |
| hire_rate    | DecimalField   | Daily hire rate in USD           |
| market_rate  | DecimalField   | Market benchmark rate in USD     |
| hs_code      | CharField      | Hidden from non-admin users      |
| entered_by   | FK→User        | Auto-set on create/update        |

---

### API Endpoints

All endpoints require `Authorization: Bearer <access_token>` except login.

| Method | URL                              | Access      | Description                        |
|--------|----------------------------------|-------------|------------------------------------|
| POST   | `/api/auth/login/`               | Public      | Obtain JWT tokens                  |
| POST   | `/api/auth/refresh/`             | Public      | Refresh access token               |
| GET    | `/api/auth/me/`                  | Any user    | Current user profile               |
| GET    | `/api/regions/`                  | Any user    | List all regions                   |
| POST   | `/api/regions/`                  | Admin only  | Create region                      |
| GET    | `/api/vessels/`                  | Any user    | List vessels (filter: `?region=N`) |
| POST   | `/api/vessels/`                  | Admin only  | Create vessel                      |
| GET    | `/api/market-rates/`             | Any user    | List rates (filters below)         |
| POST   | `/api/market-rates/`             | Admin only  | Create rate entry                  |
| PATCH  | `/api/market-rates/<id>/`        | Admin only  | Update rate entry                  |
| DELETE | `/api/market-rates/<id>/`        | Admin only  | Delete rate entry                  |
| GET    | `/api/performance/aggregated/`   | Any user    | Daily sums across all vessels      |
| GET    | `/api/dashboard/summary/`        | Any user    | Dashboard KPI counts               |

**Market Rate Query Parameters:**
- `?vessel=<id>` — Filter by vessel
- `?region=<id>` — Filter by region
- `?date_from=YYYY-MM-DD` — Start date
- `?date_to=YYYY-MM-DD` — End date

**HS Code visibility:** The `hs_code` field is present in `GET /api/market-rates/` responses **only when the requesting user is an Admin** (`is_staff=True` or `is_superuser=True`). It is stripped from the serializer for all other users.

---

### Role-Based Access Control

| Feature              | Admin (`is_staff`) | Office User |
|----------------------|--------------------|-------------|
| View vessel charts   | ✅                  | ✅           |
| View aggregated view | ✅                  | ✅           |
| See HS codes         | ✅                  | ❌           |
| Enter market data    | ✅                  | ❌           |
| Manage vessels/regions| ✅                 | ❌           |
| Django Admin panel   | ✅                  | ❌           |

---

## 🚀 How to Run

### Option A — Docker Compose (Recommended)

**Prerequisites:** Docker Desktop installed and running.

```bash
# 1. Clone / unzip the project
cd vessel-market-performance

# 2. Start all services (DB + Backend + Frontend)
docker-compose up --build

# 3. Open in browser
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# Admin:     http://localhost:8000/admin
```

The `seed_data` management command runs automatically and creates:
- **Admin user:** `admin` / `admin123`
- **Office user:** `user` / `user123`
- 5 regions, 5 vessels, ~750 daily market rate entries (May–Sep 2025)

---

### Option B — Manual Setup (Without Docker)

#### 1. PostgreSQL Setup

```sql
CREATE DATABASE vessel_market_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE vessel_market_db TO postgres;
```

#### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables (or edit settings.py directly)
export DB_NAME=vessel_market_db
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432

# Run migrations and seed
python manage.py migrate
python manage.py seed_data

# Start Django dev server
python manage.py runserver
# → Running at http://localhost:8000
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000/api npm start
# → Running at http://localhost:3000
```

---

## 📁 Project Structure

```
vessel-market-performance/
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/
│   │   ├── settings.py          # Django settings (DB, JWT, CORS, DRF)
│   │   └── urls.py              # Root URL routing
│   └── market/
│       ├── models.py            # Region, Vessel, MarketRate
│       ├── serializers.py       # DRF serializers + HS code gating
│       ├── views.py             # All API views + aggregation logic
│       ├── permissions.py       # IsAdminOrReadOnly, IsAdminUser
│       ├── urls.py              # Market app URL patterns
│       ├── admin.py             # Django admin registration
│       └── management/
│           └── commands/
│               └── seed_data.py # Demo data seeder
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.tsx            # React entry point
        ├── index.css            # Global CSS variables & typography
        ├── App.tsx              # Router, auth guards
        ├── api.ts               # Axios client + interceptors
        ├── AuthContext.tsx      # JWT auth state (React Context)
        ├── components/
        │   └── Layout.tsx       # Sidebar navigation shell
        └── pages/
            ├── Login.tsx        # Sign-in page
            ├── Dashboard.tsx    # KPI cards + quick actions
            ├── VesselPerformance.tsx  # Per-vessel hire vs market chart
            ├── Aggregated.tsx   # All-vessel aggregated chart
            ├── DataEntry.tsx    # Admin: add daily rate records
            └── Manage.tsx       # Admin: manage vessels & regions
```

---

## 🔐 Security Notes (Production Checklist)

- [ ] Change `SECRET_KEY` in `settings.py` to a strong random value
- [ ] Set `DEBUG = False`
- [ ] Use environment variables (`.env` file) for all secrets
- [ ] Restrict `ALLOWED_HOSTS` to your actual domain
- [ ] Set `CORS_ALLOWED_ORIGINS` to your frontend domain only
- [ ] Use HTTPS with a proper SSL certificate
- [ ] Consider adding rate limiting (e.g., `django-ratelimit`)
