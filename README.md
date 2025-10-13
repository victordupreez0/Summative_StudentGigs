# Student Gigs

A full-stack web application for connecting students with gig opportunities.

## Architecture

- **Frontend**: React with Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MySQL

## Deployment

This application is configured for Heroku deployment with the following setup:

1. **Root package.json**: Handles build process and dependencies
2. **Procfile**: Defines how Heroku should start the application
3. **Build process**: 
   - Installs backend dependencies
   - Installs frontend dependencies  
   - Builds frontend for production
   - Serves frontend through Express backend

## Environment Variables

For production deployment, set these environment variables in Heroku:

- `DB_HOST`: MySQL database host
- `DB_USER`: MySQL database username
- `DB_PASS`: MySQL database password
- `DB_NAME`: MySQL database name
- `JWT_SECRET`: Secret key for JWT authentication

## Local Development

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Start both frontend and backend in development mode:
   ```bash
   npm run dev
   ```

## Production Build

The application will automatically build during Heroku deployment via the `heroku-postbuild` script.