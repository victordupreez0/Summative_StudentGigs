# StudentGigs

> A full-stack marketplace platform connecting students with freelance opportunities and gig work.
studentgigs.xyz

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21.1-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.15-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)

---

## Overview

StudentGigs is a comprehensive web application designed to connect students with flexible work opportunities. The platform handles the complete job lifecycle including posting, applications, interviews, messaging, and reviews.

### Key Features

**Authentication & Authorization**
- JWT-based secure authentication
- Role-based access control (Student, Employer, Admin)
- Protected routes and API endpoints

**Job Management**
- Create, edit, and manage job postings
- Advanced search and filtering
- Category-based organization
- Budget tracking (hourly/fixed rates)

**Application System**
- Apply with cover letters and portfolio links
- Track application status
- Interview scheduling
- Feedback system

**Communication**
- Real-time messaging between users
- Notification system
- Interview coordination

**Review & Rating**
- Bilateral review system
- Star ratings and written feedback
- Reputation building

**Localization**
- South African Rand (ZAR) currency
- Localized pricing and formatting

---

## Features

### Student Features

- Browse and search available jobs
- Apply to jobs with custom cover letters
- Track application status dashboard
- Schedule and manage interviews
- Direct messaging with employers
- Receive and view reviews
- Profile management with portfolio
- Save jobs for later
- Earnings tracking

### Employer Features

- Post detailed job listings
- Hourly or fixed-price budgets
- Review and manage applicants
- Schedule interviews
- Accept/reject applications
- Direct messaging with students
- Leave reviews for completed work
- Active jobs dashboard

### Admin Features

- User management
- Platform statistics
- Job moderation
- Application oversight
- System monitoring

### SEO & Optimization

- **Search Engine Optimized** - robots.txt, sitemap.xml, and meta tags
- **Structured Data** - Schema.org JSON-LD for rich snippets
- **Dynamic Meta Tags** - Page-specific SEO with Open Graph and Twitter Cards
- **Social Media Ready** - Optimized sharing previews
- **Performance Optimized** - Fast load times and responsive design

📄 See [SEO_GUIDE.md](./SEO_GUIDE.md) for complete documentation

---

## Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.15-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7.0.1-CA4245?style=flat-square&logo=reactrouter&logoColor=white)

- **React 18** - UI library with hooks and context
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **shadcn/ui** - Accessible component library
- **Lucide Icons** - Icon library

### Backend

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21.1-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

- **Node.js 20** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **mysql2** - MySQL client with connection pooling

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
node --version  # v14.0.0 or higher
npm --version   # v6.0.0 or higher
mysql --version # v8.0 or higher
```

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/victordupreez0/Summative_StudentGigs.git
cd Summative_StudentGigs
```

**2. Install dependencies**

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
cd ..
```

**3. Set up MySQL database**

Create a new database (or let the app create it automatically):

```sql
CREATE DATABASE studentgigs;
```

The application will automatically create all required tables on first run.

**4. Configure database connection (optional)**

The application uses these default values for local MySQL:

```
Host: 127.0.0.1
Port: 3306
User: root
Password: (empty)
Database: studentgigs
```

If your MySQL setup is different, you can create a `.env` file in the `backend` directory:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=studentgigs
```

**Note:** No `.env` file is required if you're using the default MySQL configuration.

**5. Start the development servers**

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**6. Access the application**

Open your browser and navigate to:
```
http://localhost:5173
```

The backend API will be running on:
```
http://localhost:4000
```

### Default Configuration

The application works out-of-the-box with these defaults:

**Backend (can be customized via `.env` in `backend/` if needed)**
- `DB_HOST`: `127.0.0.1`
- `DB_PORT`: `3306`
- `DB_USER`: `root`
- `DB_PASS`: `` (empty)
- `DB_NAME`: `studentgigs`
- `PORT`: `4000`
- `JWT_SECRET`: Auto-generated

**Frontend**
- `VITE_API_BASE`: `http://localhost:4000` (development)
- Auto-detects production environment

No configuration files are required for local development with default MySQL settings.

---

## Project Structure

```
StudentGigs/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/              # Route pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── BrowseJobs.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   ├── PostJob.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Messages.jsx
│   │   ├── context/            # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── config/             # Configuration
│   │   │   └── api.js
│   │   └── lib/                # Utilities
│   │       └── utils.js
│   └── public/                 # Static assets
│
├── backend/
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── messageController.js
│   │   └── profileController.js
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── messageRoutes.js
│   ├── middleware/             # Middleware
│   │   └── auth.js
│   ├── config/                 # Configuration
│   │   └── database.js
│   └── server.js               # Entry point
│
└── package.json
```

---

## API Documentation

### Authentication

```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "user_type": "student"
}
```

```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Jobs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/jobs` | Get all active jobs | No |
| GET | `/api/jobs/:id` | Get job details | No |
| POST | `/api/jobs` | Create new job | Yes (Employer) |
| PUT | `/api/jobs/:id` | Update job | Yes (Owner) |
| DELETE | `/api/jobs/:id` | Delete job | Yes (Owner) |
| GET | `/api/jobs/my-jobs` | Get user's jobs | Yes |

### Applications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/applications` | Submit application | Yes (Student) |
| GET | `/api/applications/my-applications` | Get applications | Yes |
| PUT | `/api/applications/:id/status` | Update status | Yes (Employer) |
| GET | `/api/applications/job/:jobId` | Get job applicants | Yes (Owner) |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/conversations` | Get conversations | Yes |
| GET | `/api/messages/:userId` | Get messages | Yes |
| POST | `/api/messages` | Send message | Yes |

### Profiles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile/:id` | Get user profile | No |
| PUT | `/api/profile` | Update profile | Yes |
| POST | `/api/profile/photo` | Upload photo | Yes |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type ENUM('student', 'employer', 'admin') NOT NULL,
  business_name VARCHAR(255),
  profile_picture VARCHAR(255),
  avatar_color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  project_type VARCHAR(50),
  budget_type ENUM('hourly', 'fixed') NOT NULL,
  hourly_rate_min DECIMAL(10,2),
  hourly_rate_max DECIMAL(10,2),
  fixed_budget DECIMAL(10,2),
  status ENUM('open', 'closed', 'completed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Applications Table
```sql
CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  user_id INT NOT NULL,
  cover_letter TEXT,
  resume_url VARCHAR(500),
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

See `backend/config/database.js` for complete schema.

---

## Testing Locally

### Test Accounts

Create test accounts using these credentials:

**Student Account**
```
Email: student@test.com
Password: student123
```

**Employer Account**
```
Email: employer@test.com
Password: employer123
```

### Testing Workflow

**1. Test Student Flow**
```bash
# Register as student
# Browse jobs
# Apply to a job
# View application status
# Check messages
```

**2. Test Employer Flow**
```bash
# Register as employer
# Create a job posting
# View applicants
# Accept/reject applications
# Send messages
```

**3. Test Communication**
```bash
# Login as employer
# Message an applicant
# Login as student
# View and reply to message
```

### Troubleshooting

**Database Connection Issues**
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check user permissions
SHOW GRANTS FOR 'root'@'localhost';
```

**Port Already in Use**
```bash
# Kill process on port 4000 (backend)
npx kill-port 4000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

**Frontend Can't Connect to Backend**
- Verify backend is running on `http://localhost:4000`
- Check for CORS errors in browser console
- Ensure MySQL is running and database is created

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## Author

**Victor du Preez**

- GitHub: [@victordupreez0](https://github.com/victordupreez0)
- Repository: [Summative_StudentGigs](https://github.com/victordupreez0/Summative_StudentGigs)

---

## Acknowledgments

- Built with modern web technologies
- Designed for the South African student market
- Inspired by freelance platforms like Upwork and Fiverr

---

<div align="center">

**Built for students, by students**

</div>