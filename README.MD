# 🧪 LMS Backend (Laboratory Management System)

Backend service for LMS (Laboratory Management System) built with Node.js, Express, Sequelize, and MySQL.
This system supports multi-branch labs, role-based access control, bookings, payments (partial + refunds), reports, and audit logs.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- Multer (File Uploads)
- bcrypt (Password Hashing)

---

## 📂 Project Structure

```
src/
├── app.js
├── server.js
├── config/
│   └── database.js
├── models/
├── routes/
├── controllers/
├── services/
├── repositories/
├── middlewares/
├── utils/
├── seeders/
└── uploads/
    ├── payments/
    └── reports/
```

---

## 🔐 Roles Supported

- SUPER_ADMIN – Pan India access
- BRANCH_ADMIN – Branch-level management
- RECEPTIONIST – Bookings, customers, payments
- TECHNICIAN – Sample collection, reports, payments
- CUSTOMER – View bookings, reports, payments (read-only)

---

## ⚙️ Prerequisites

Make sure you have installed:

- Node.js (v18+ recommended)
- MySQL (v8+)
- Git

---

## 🛠️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/sauravsaran99/LMS-backend.git
cd LMS-backend
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Create `.env` File

Create a `.env` file in the root directory:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lms_db

JWT_SECRET=your_jwt_secret_key
```

---

### 4️⃣ Create Database

Login to MySQL and create database:

```sql
CREATE DATABASE lms_db;
```

---

### 5️⃣ Run Migrations / Sync Models

If you are using Sequelize `sync()`:

```bash
npm run dev
```

> Tables will be auto-created on first run.

---

## 🌱 Seed Initial Data (Required)

Basic Seeders will run automatically.

````

(Optional – large data testing)

```bash
node src/seeders/seedCustomers.js
node src/seeders/seedTests.js
````

---

## 🔑 Default Super Admin Login

```
Email: admin@lms.com
Password: Admin@123
```

## ▶️ Run Project

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will start on:

```
http://localhost:5000
```

---

## 📦 File Uploads

Ensure these folders exist:

```bash
mkdir -p uploads/payments uploads/reports
```

---

## 📊 Key Features

- ✅ Role-based access control
- ✅ Multi-branch architecture
- ✅ Test booking & scheduling
- ✅ Partial payments & refunds
- ✅ Technician workflows
- ✅ Daily & Monthly reports
- ✅ Branch / Technician / Test-wise analytics
- ✅ Audit logging for critical actions
- ✅ Pagination-ready APIs

---


## 🧪 API Authentication (Token-based)

All authentication is handled using JWT tokens. Cookies are NOT used for authentication.

### Login

Send a POST request to `/auth/login` with email and password:

```
POST /auth/login
Content-Type: application/json

{
    "email": "admin@lms.com",
    "password": "Admin@123"
}
```

**Response:**
```
{
    "user": { ... },
    "token": "<JWT_TOKEN>"
}
```

### Using the Token

For all protected routes, add this header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Logout

Logout is handled on the client by deleting the stored token. There is no server-side session or cookie to clear.

---

## 🧾 Audit Logs

Audit logs are recorded for:

- Booking creation & updates
- Sample collection
- Payment & refund actions
- User status changes
- Master data updates

---

## 🛡️ Security Notes

- Passwords are hashed using bcrypt
- JWT-based authentication
- Role middleware enforced on routes
- Branch-level data isolation

---

## 📌 Notes

- This is a backend-only repository
- Frontend is handled separately
- Designed for scalability (100k+ records)

---

## 👨‍💻 Author

Saurav Kumar
Backend Engineer
