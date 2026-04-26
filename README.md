# 📚 Smart Classroom Manager

A full-stack, role-based school management web application built with React, Express, tRPC, and PostgreSQL/MySQL.

---

## 🎯 Overview

Smart Classroom Manager enables seamless collaboration between teachers and students.

- Teachers can manage students, attendance, assignments, marks, and feedback  
- Students can track progress, submit assignments, and view feedback  

---

## ✨ Features

### 👩‍🏫 Teacher
- Manage student records (CRUD + search)
- Mark attendance with percentage calculation
- Create and manage assignments
- Record marks and grades
- Provide personalized feedback
- View analytics and export data (CSV)

### 👨‍🎓 Student
- View attendance dashboard
- Submit assignments
- Track marks and grades
- View feedback
- Responsive UI (mobile + desktop)

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS  
- **Backend**: Node.js, Express, tRPC  
- **Database**: MySQL / PostgreSQL (Drizzle ORM)  
- **Auth**: JWT (email/password)  
- **Testing**: Vitest  

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies
```bash
pnpm install
```

### 2️⃣ Setup Environment
Create `.env` file:
```env
DATABASE_URL=mysql://user:password@localhost:3306/smart_classroom
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 3️⃣ Setup Database
```bash
pnpm drizzle-kit generate
```

### 4️⃣ Seed Data
```bash
node seed-data.mjs
```

### 5️⃣ Run Project
```bash
pnpm dev
```

App runs at: **http://localhost:3000**

---

## 🔐 Demo Accounts

| Role    | Email                 | Password    |
|--------|----------------------|------------|
| Teacher | teacher@example.com  | teacher123 |
| Student | student1@example.com | student123 |

---

## 📂 Project Structure

```
smart-classroom-manager/
│── client/          # Frontend (React)
│── server/          # Backend (Express + tRPC)
│── drizzle/         # Database schema & migrations
│── seed-data.mjs    # Sample data
│── package.json
```

---

## 🔑 Core Modules

- Authentication (JWT-based)
- Student Management
- Attendance System
- Assignment & Submission
- Marks & Feedback

---

## 🎨 UI Design

- Cream background, navy text, gold accents  
- Clean, modern, responsive design  
- Typography: Playfair Display + Inter  

---

## 📦 Deployment

- Supports Manus / Vercel / Railway  
- Requires environment variables and database setup  

---

## 📄 License

MIT License

---

⭐ Built for efficient and smart classroom management
