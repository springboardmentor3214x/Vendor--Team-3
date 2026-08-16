# Vendor Reliability Intelligence Platform

A full-stack procurement platform for end-to-end vendor lifecycle management, reliability scoring, and procurement workflows.

## 🚀 Features
- **Vendor Management**: Onboarding, approval workflows, and continuous performance evaluation.
- **Procurement Workflows**: RFQs, Purchase Orders, and Contracts management.
- **3-Way Matching**: Automated invoice validation against POs and Goods Receipts (GRN).
- **Dynamic Notifications**: Real-time WebSocket notifications tailored to each user's role.
- **Role-Based Access Control**: Six roles — Administrator, Procurement Manager, Supply Chain Manager, Finance Officer, Auditor, and Vendor.
- **Reliability Metrics**: Data-driven vendor scoring with Chart.js visualizations.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.10+), SQLAlchemy, PostgreSQL |
| Auth | JWT & OAuth2 |
| Frontend | Angular (TypeScript), SCSS |
| Containerization | Docker & Docker Compose |

---

## 🏗️ Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **PostgreSQL** (local or cloud instance)
- **Docker & Docker Compose** *(optional, for containerized setup)*

---

### Option A — Docker (Recommended)

```bash
cp .env.example .env
# Fill in your credentials in .env
docker-compose up --build
```

- Backend: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:4200](http://localhost:4200)
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B — Manual Setup

#### 1. Backend (FastAPI)

```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Configure your `.env` file (see `.env.example`):
```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
```

Initialize the database schema and seed required data:
```bash
psql -U <username> -d <database_name> -f database/schema.sql
python scripts/seed_data.py
```

Run the backend:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Frontend (Angular)

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

> **Note:** The `--legacy-peer-deps` flag is required due to Chart.js and Angular CDK version conflicts.

Frontend available at [http://localhost:4200](http://localhost:4200).

---

## 📁 Project Structure

```
vendor_reliability/
├── app/                  # FastAPI application
│   ├── core/             # Config, auth, security
│   ├── database/         # SQLAlchemy session
│   ├── models/           # ORM models
│   ├── routers/          # API route handlers
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── utils/            # Email, SMS helpers
│   └── main.py
├── database/
│   ├── schema.sql        # PostgreSQL schema
│   └── ER_Diagram.png
├── frontend/             # Angular application
├── scripts/              # DB seeding & utility scripts
├── ui-ux/                # UI/UX design references
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## 🧑‍💻 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
