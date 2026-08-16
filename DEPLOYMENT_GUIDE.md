# Vendor Reliability Intelligence Platform — Deployment Guide

## Overview

This guide walks you through deploying the platform using Docker and AWS EC2. The application consists of three services:

| Service  | Technology       | Port |
|----------|-----------------|------|
| Database | PostgreSQL 15   | 5432 |
| Backend  | FastAPI (Python) | 8000 |
| Frontend | Angular + Nginx  | 80   |

---

## Part 1 — Answering Your Question About Seeded Data

> **Will my seeded data be lost after deployment?**

**Yes, you will need to seed data again on the server.** Here is why:

- Your local database runs on your Windows machine. Docker creates a **brand-new PostgreSQL container** with an empty database.
- However, thanks to the `volumes: postgres_data:/var/lib/postgresql/data` setting in `docker-compose.yml`, data is **persisted across container restarts** (i.e., if you restart the Docker containers, data will NOT be lost).
- Once the backend container starts, the database schema (tables) will be created automatically via SQLAlchemy's `Base.metadata.create_all()`.
- You then run the seed scripts **once** inside the server to populate data.

**Command to seed data after deployment:**
```bash
docker exec -it vendor_backend python scripts/seed_rich_data.py
```

---

## Part 2 — Before You Deploy (Local Checklist)

1. Make sure `git status` is clean and all changes are committed.
2. Make sure the project runs locally with `uvicorn app.main:app --reload`.
3. Confirm your `.env` file is in `.gitignore` (never push secrets to GitHub).

---

## Part 3 — Step-by-Step Local Docker Test

### Step 1 — Install Docker Desktop

Download and install Docker Desktop from: https://www.docker.com/products/docker-desktop/

Verify installation:
```bash
docker --version
docker compose version
```

### Step 2 — Update the Production API URL

Open `frontend/src/environments/environment.prod.ts` and replace `YOUR_EC2_PUBLIC_IP` with `localhost` for local Docker testing:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000'
};
```

### Step 3 — Create a `.env` file in the project root

Copy your existing `.env` values and make sure it includes:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourStrongPassword123!
POSTGRES_DB=vendor_reliability
DATABASE_URL=postgresql://postgres:YourStrongPassword123!@db:5432/vendor_reliability
SECRET_KEY=your_long_random_secret_key_here
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

> **Important:** Notice `DATABASE_URL` now points to `@db:5432` (not `@localhost:5432`). The `db` is the Docker service name.

### Step 4 — Build and Run with Docker Compose

```bash
# From the project root directory
docker compose up --build
```

Wait for all 3 containers to start. You will see output from all services.

### Step 5 — Seed the Database

Open a **new terminal** and run:
```bash
docker exec -it vendor_backend python scripts/seed_rich_data.py
```

### Step 6 — Verify Locally

- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Part 4 — AWS EC2 Deployment (Step-by-Step)

### Step 7 — Create an AWS Account & EC2 Instance

1. Go to https://aws.amazon.com and sign up / log in.
2. Navigate to **EC2 → Launch Instance**.
3. Configure:
   - **Name:** `vendor-reliability-server`
   - **AMI:** Ubuntu Server 22.04 LTS (free tier eligible)
   - **Instance Type:** `t2.micro` (free tier) or `t3.small` for better performance
   - **Key Pair:** Create a new key pair → Download the `.pem` file (e.g., `vendor-key.pem`)
   - **Network Settings:** Check "Allow SSH", "Allow HTTP", "Allow HTTPS"
4. Click **Launch Instance**.
5. After launch, go to your instance → copy the **Public IPv4 address** (e.g., `3.92.100.45`).

### Step 8 — Configure Security Groups (Open Required Ports)

In AWS Console → EC2 → Your Instance → Security → Security Groups → Edit Inbound Rules:

| Type        | Protocol | Port | Source    |
|-------------|----------|------|-----------|
| SSH         | TCP      | 22   | My IP     |
| HTTP        | TCP      | 80   | 0.0.0.0/0 |
| Custom TCP  | TCP      | 8000 | 0.0.0.0/0 |

Click **Save Rules**.

### Step 9 — Connect to EC2 via SSH

On your Windows machine (use PowerShell or Windows Terminal):

```bash
# Move your .pem key to a safe location first, then:
chmod 400 vendor-key.pem       # Linux/Mac
# On Windows PowerShell use:
icacls vendor-key.pem /reset
icacls vendor-key.pem /grant:r "%USERNAME%:R"
icacls vendor-key.pem /inheritance:r

# Connect:
ssh -i "vendor-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 10 — Install Docker on EC2

Once connected to your EC2 server via SSH:
```bash
# Update packages
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group (no sudo required)
sudo usermod -aG docker ubuntu

# Apply group change
newgrp docker

# Verify Docker
docker --version

# Install Docker Compose plugin
sudo apt-get install docker-compose-plugin -y
docker compose version
```

### Step 11 — Install Git and Clone Your Repository

```bash
sudo apt-get install git -y

# Clone your GitHub repository
git clone https://github.com/YOUR_USERNAME/vendor_reliability.git
cd vendor_reliability
```

### Step 12 — Update the Production API URL

Before building, update the frontend environment with your EC2 IP:

```bash
nano frontend/src/environments/environment.prod.ts
```

Change to:
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://YOUR_EC2_PUBLIC_IP:8000'
};
```

Save and exit (Ctrl+O, Enter, Ctrl+X).

### Step 13 — Configure Environment Variables on EC2

```bash
# Create and fill .env file (never commit this to GitHub)
nano .env
```

Paste your credentials (same as your local `.env` but with updated `DATABASE_URL`):
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourStrongPassword123!
POSTGRES_DB=vendor_reliability
DATABASE_URL=postgresql://postgres:YourStrongPassword123!@db:5432/vendor_reliability
SECRET_KEY=your_long_random_secret_key_here
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

### Step 14 — Deploy with Docker Compose

```bash
# Build and start all containers in detached (background) mode
docker compose up --build -d

# Watch logs to verify startup
docker compose logs -f
```

### Step 15 — Seed the Database on EC2

```bash
docker exec -it vendor_backend python scripts/seed_rich_data.py
```

### Step 16 — Test the Deployed Application

Open your browser and navigate to:

- **Frontend:** `http://YOUR_EC2_PUBLIC_IP`
- **Backend API:** `http://YOUR_EC2_PUBLIC_IP:8000`
- **API Docs:** `http://YOUR_EC2_PUBLIC_IP:8000/docs`

Test the following workflows:
- [ ] Login with seeded admin credentials
- [ ] JWT authentication working
- [ ] Role-based access (Admin vs Procurement Manager vs Vendor)
- [ ] Vendor Management (list, create, edit)
- [ ] Procurement workflow
- [ ] Purchase Orders
- [ ] Contracts & Compliance
- [ ] Reports & Export (PDF/Excel)
- [ ] Notifications

---

## Part 5 — Useful Docker Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v

# Restart a specific service
docker compose restart backend

# Shell into a container
docker exec -it vendor_backend bash
docker exec -it vendor_db psql -U postgres -d vendor_reliability
```

---

## Part 6 — Alternative Deployment: Render

If AWS EC2 gives issues, Render (https://render.com) is a simpler alternative:

1. Push your code to GitHub.
2. Create a Render account at https://render.com.
3. Create a **New Web Service** → connect your GitHub repo → select the backend folder.
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render's dashboard.
5. Create a **PostgreSQL** database in Render (free tier available).
6. For the frontend, create a **Static Site** in Render → build command: `npm run build` → publish directory: `dist/frontend/browser`.
7. Render assigns a domain like `your-app.onrender.com`.

---

## Security Reminders

> **NEVER commit to GitHub:**
> - `.env` file
> - `SECRET_KEY` values
> - Database passwords
> - API keys (SMTP, Twilio, etc.)

Verify `.gitignore` includes:
```
.env
*.pem
vendor_reliability.db
__pycache__/
```

---

## Issues & Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend can't connect to DB | Ensure `DATABASE_URL` uses `@db:5432` not `@localhost:5432` |
| Port 8000 not accessible | Check AWS Security Group inbound rules |
| Frontend shows "Network Error" | Ensure `environment.prod.ts` has the correct EC2 IP |
| Docker build fails for frontend | Check that Node.js version in Dockerfile matches project requirements |
| Permission denied on `.pem` file | Run `icacls` command on Windows or `chmod 400` on Linux |
