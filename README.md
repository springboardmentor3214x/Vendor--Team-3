# Vendor Reliability Intelligence Platform

Welcome to the **Vendor Reliability Intelligence Platform** repository! This application is designed to streamline and centralize the procurement process, providing robust vendor management, dynamic notifications, and insightful reliability metrics.

## 🚀 Features
- **Vendor Management**: End-to-end vendor lifecycle management, from onboarding to continuous performance evaluation.
- **Procurement Workflows**: Fully digitized Request for Quotes (RFQs), Purchase Orders (POs), and Contracts management.
- **3-Way Matching**: Automated invoice processing validating Purchase Orders and Goods Receipts (GRN) to flag discrepancies.
- **Dynamic Notifications**: Real-time application-wide WebSocket notification system tailored to each user's specific role.
- **Role-Based Access Control**: Granular permissions scaling from Vendor and Auditor to Procurement Managers and System Administrators.
- **Reliability Metrics**: Data-driven vendor scoring with Chart.js based visualizations for monitoring compliance, performance, and risk levels.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database ORM**: SQLAlchemy
- **Authentication**: JWT & OAuth2

### Frontend
- **Framework**: [Angular](https://angular.io/) (TypeScript)
- **Styling**: SCSS, Responsive UI

---

## 🏗️ Getting Started

### Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 1. Backend Setup (FastAPI)

Navigate to the root directory where the python backend is housed.

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Configuration:**
   Ensure your `.env` file is properly configured with your local or cloud database credentials.

4. **Run the backend server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).*
   *View the Swagger UI documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).*

### 2. Frontend Setup (Angular)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   *(Note: Due to recent Chart.js and Angular CDK version conflicts, you MUST use the --legacy-peer-deps flag)*
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   *The frontend application will be available at [http://localhost:4200](http://localhost:4200).*

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
