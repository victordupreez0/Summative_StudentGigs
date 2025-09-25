StudentGigs backend (minimal auth)

Setup
1. Ensure MySQL is running (XAMPP control panel).
2. Create the database and users table: import `schema.sql` using phpMyAdmin or the MySQL CLI.
3. Copy `.env.example` to `.env` and adjust values (DB user/password, JWT_SECRET).
4. Install dependencies:
   npm install
5. Start server:
   npm run dev

Notes
- Routes: POST /api/auth/signup and POST /api/auth/login
- Responses: { token, user }
- This is a minimal implementation for local development. Use HTTPS and stronger JWT handling for production.
