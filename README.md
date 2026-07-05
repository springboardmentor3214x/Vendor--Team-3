# Vendor Reliability Intelligence Platform

## 📌 Project Overview

The Vendor Reliability Intelligence Platform is a full-stack web application developed to help organizations evaluate vendor performance, manage procurement operations, and improve supplier reliability through centralized dashboards and analytics.

---

## 🚀 Week 1 Backend Progress

### ✅ Completed

- FastAPI project initialization
- Project folder structure setup
- User Registration API
- User Login API
- JWT Authentication
- Home API
- Swagger API Documentation
- Requirements file generation

---

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- Uvicorn
- JWT Authentication (python-jose)
- Passlib (Password Hashing)
- Pydantic

### Database
- PostgreSQL (Integration Pending)

### Frontend
- Angular (Under Development)

---

## 📂 Project Structure


VendorReliabilityBackend/
│
├── app/
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── models/
│   ├── routers/
│   │   └── auth.py
│   │
│   ├── schemas/
│   ├── utils/
│   └── main.py
│
└── requirements.txt


---

## ⚙️ Installation

Clone the repository

bash
git clone <repository-url>


Create Virtual Environment

bash
python -m venv venv


Activate Virtual Environment

Windows

bash
venv\Scripts\activate


Install Dependencies

bash
pip install -r requirements.txt


Run the Server

bash
uvicorn app.main:app --reload


---

## 📖 API Documentation

Swagger UI


http://127.0.0.1:8000/docs


---

## 🔐 Available APIs

### POST /register
Registers a new user.

### POST /login
Authenticates the user and returns a JWT Access Token.

### GET /
Returns the Home API response.

---

## 📅 Current Status

✅ Week 1 Backend Setup Completed

- FastAPI Initialized
- JWT Authentication Implemented
- Register API Completed
- Login API Completed
- Swagger Tested
- GitHub Branch Created
- Code Pushed Successfully
