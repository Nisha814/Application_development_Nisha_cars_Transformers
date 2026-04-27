# 🚗 VehicleParts — Authentication & Admin Dashboard

> A secure, full-stack web application featuring JWT-based authentication, OTP email verification, and a professional admin dashboard for managing staff, customers, and vendors.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Backend** | ASP.NET Core (.NET 10), C# |
| **Database** | PostgreSQL + Entity Framework Core |
| **Auth** | JWT Tokens + BCrypt Password Hashing |
| **Email** | SMTP via Gmail (OTP Verification) |

---

## ✨ Key Features

### 🔐 Authentication System
- **Secure Registration** with real-time password strength meter
- **Email OTP Verification** — accounts are locked until verified
- **JWT Login** with role-based access control
- **Password Requirements**: Lowercase, Uppercase, Numbers, Special Characters

### 🛡️ Admin Dashboard
- **Live Stats**: Real-time Staff, Customer, and Vendor counts from the database
- **Staff Management**: Add, Edit, Delete, Activate/Deactivate employees
- **Customer Management**: View all registered customers with verification and active status
- **Vendor Management**: Full CRUD with phone number validation (Nepal 10-digit rule)
- **Profile Management**: Upload profile picture, update personal details

### 🌍 UX Features
- International phone input with country flags (200+ countries)
- Role-based route protection (Admin / Staff / Customer)
- Responsive, modern UI with micro-animations

---

## 🚀 Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

### 1. Clone the repository
```bash
git clone https://github.com/Nisha814/VehicleParts-Auth-AdminDashboard.git
cd VehicleParts-Auth-AdminDashboard
```

### 2. Configure the API secrets
Create `VehicleParts.API/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=VehiclePartsDb;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY_MIN_32_CHARACTERS"
  },
  "EmailSettings": {
    "Host": "smtp.gmail.com",
    "Port": "587",
    "Email": "your@gmail.com",
    "Password": "your_gmail_app_password"
  }
}
```

### 3. Run the Backend
```bash
cd VehicleParts.API
dotnet ef database update
dotnet run
# API running at http://localhost:5026
```

### 4. Run the Frontend
```bash
cd VehicleParts.Frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 👤 Default Admin Account
```
Email:    admin@vehicleparts.com
Password: Admin123
```

---

## 📁 Project Structure
```
VehicleParts-Auth-AdminDashboard/
├── VehicleParts.API/          # ASP.NET Core Backend
│   ├── Controllers/           # API Endpoints
│   ├── Models/                # Database Models
│   ├── DTOs/                  # Data Transfer Objects
│   ├── Services/              # Email Service
│   └── Migrations/            # EF Core Migrations
└── VehicleParts.Frontend/     # React Frontend
    └── src/
        ├── pages/             # Login, Register, Dashboard, Management Pages
        ├── components/        # DashboardLayout, ProtectedRoute
        └── services/          # API Service Layer
```

---

## 🎓 Academic Context
This project was developed as coursework for **Application Development**, focusing on secure authentication patterns and enterprise admin dashboard design.
