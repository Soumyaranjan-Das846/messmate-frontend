# 🍽️ MessMate – Frontend

### Modern & Responsive Mess Management System | IIIT Bhubaneswar

MessMate Frontend is the user interface of **MessMate – IIIT Bhubaneswar**, a full-stack web application designed to digitize and simplify mess administration and student services.

Built using **React.js, Vite, JavaScript, and CSS**, the frontend provides dedicated Admin and Student portals with interactive dashboards, intuitive navigation, and a responsive user experience.

## 🌐 Live Application

**Deployed Website:** https://messmate-frontend-xi.vercel.app

**Backend Repository:** https://github.com/Soumyaranjan-Das846/messmate-iiit-bhubaneswar

**Backend API:** https://messmate-iiit-bhubaneswar.onrender.com

> The backend is hosted on Render's free tier. The first API request may take some time if the server has been inactive.

## ✨ Features

### 👨‍💼 Admin Portal

The Admin Portal provides a centralized interface for managing mess operations.

- Secure administrator registration and login
- Dashboard with mess statistics and financial summaries
- Student information and account management
- Payment recording and collection tracking
- Expense management and transaction records
- Meal management
- Weekly mess menu management
- Reports and financial insights
- Student feedback and complaint management

### 🎓 Student Portal

The Student Portal provides students with convenient access to mess-related information and services.

- Student registration and login
- Personalized student dashboard
- View mess menu and meal information
- View payment-related details
- Submit feedback and complaints
- Contact mess administrators

## 🎨 User Interface

MessMate is designed with a focus on usability, visual consistency, and clear navigation.

- Separate interfaces for Admin and Student roles
- Dashboard-based navigation
- Responsive layouts
- Interactive forms and data tables
- Organized financial and meal information
- Clear loading, success, and error messages

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Component-based user interface |
| Vite | Development server and production build |
| JavaScript | Frontend application logic |
| HTML5 | Page structure |
| CSS3 | Styling and responsive layouts |
| REST APIs | Communication with the backend |
| Vercel | Frontend deployment |
| Git & GitHub | Version control and source code hosting |

## 🏗️ Application Architecture

```text
                 User
                   |
          MessMate Frontend
              React + Vite
                   |
           Admin / Student
              Interfaces
                   |
            REST API Calls
                   |
        Node.js + Express API
                   |
              MongoDB Atlas
```

The frontend communicates with the Express backend to perform authentication, retrieve information, and manage mess-related records.

## 🔐 Authentication & Role-Based Access

MessMate provides separate Admin and Student login experiences.

- Users authenticate through backend APIs.
- JWT-based authentication is handled through the backend.
- Role-based access determines the appropriate portal.
- Protected operations are authorized by the backend.

## 📂 Project Structure

```text
messmate-frontend/
├── public/
├── src/
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── StudentPortal.jsx
│   ├── Reports.jsx
│   ├── Payments.jsx
│   ├── Students.jsx
│   ├── Expenses.jsx
│   ├── Meals.jsx
│   ├── Menu.jsx
│   ├── Feedback.jsx
│   └── login.jsx
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

*This structure highlights the main application files and components.*

## 🚀 Run Locally

### Prerequisites

- Node.js
- npm
- Running MessMate backend API

### 1. Clone the Repository

```bash
git clone https://github.com/Soumyaranjan-Das846/messmate-frontend.git
cd messmate-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend project root:

```env
VITE_API_URL=http://localhost:3000
```

Replace the URL with the deployed backend address when using the hosted API.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

`http://localhost:5173`

### 5. Create a Production Build

```bash
npm run build
```

## ☁️ Deployment

The frontend is deployed on **Vercel** and connected to the backend hosted on **Render**.

The backend uses **MongoDB Atlas** for database storage.

**Live Website:** https://messmate-frontend-xi.vercel.app

## 🎯 Project Objective

The objective of MessMate is to provide a modern digital interface for managing mess operations, reducing manual recordkeeping, improving financial transparency, and simplifying communication between administrators and students.

## 👨‍💻 Developed By

**Soumyaranjan Das**

B.Tech – Information Technology

International Institute of Information Technology, Bhubaneswar

## 📚 Academic Project

Developed as part of the Full-Stack Web Development / Internet and Web Technology laboratory project at IIIT Bhubaneswar.
