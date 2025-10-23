# Heroku Deployment Guide for Student Gigs

## Changes Made to Fix Network Errors

### Backend Changes (server.js)
1. **Fixed CORS Configuration**: Updated to properly allow Heroku origins
2. **Fixed Database Initialization**: JawsDB users don't have CREATE DATABASE privileges
3. **Added Better Logging**: Detailed error messages for debugging

### Frontend Changes
1. **Created centralized API config**: `/frontend/src/config/api.js`
2. **Updated all pages** to use the new API config
3. **Fixed production environment**: Empty `VITE_API_BASE` now correctly uses relative URLs

## Deployment Steps

### 1. Commit and Push Your Changes
```bash
git add .
git commit -m "Fix Heroku deployment with JawsDB and CORS"
git push origin main
```

### 2. Deploy to Heroku
```bash
# Push to Heroku
git push heroku main

# Or if you need to force push
git push heroku main --force
```

### 3. Set Environment Variables on Heroku
```bash
# Set JWT secret (replace with your own strong secret)
heroku config:set JWT_SECRET=your-strong-random-secret-key-here --app YOUR_APP_NAME

# Optional: Set frontend URL if needed
heroku config:set FRONTEND_URL=https://YOUR_APP_NAME.herokuapp.com --app YOUR_APP_NAME

# Verify config
heroku config --app YOUR_APP_NAME
```

### 4. Check Heroku Logs
```bash
# View real-time logs
heroku logs --tail --app YOUR_APP_NAME

# View last 200 lines
heroku logs -n 200 --app YOUR_APP_NAME
```

### 5. Test Your Deployment
Open these URLs in your browser:
```
https://YOUR_APP_NAME.herokuapp.com/api/ping
https://YOUR_APP_NAME.herokuapp.com/api/dbstatus
https://YOUR_APP_NAME.herokuapp.com/
```

## Troubleshooting

### If you see "Database connection failed" in logs:
1. Check that JawsDB is provisioned: `heroku addons --app YOUR_APP_NAME`
2. Verify JAWSDB_URL exists: `heroku config:get JAWSDB_URL --app YOUR_APP_NAME`
3. Check logs for specific error: `heroku logs --tail --app YOUR_APP_NAME`

### If you see CORS errors:
1. Make sure frontend is using relative URLs in production
2. Check that VITE_API_BASE is empty in .env.production
3. Rebuild frontend: `cd frontend && npm run build`

### If pages don't load:
1. Make sure frontend was built: `cd frontend && npm run build`
2. Check that dist folder exists: `ls frontend/dist`
3. Verify Procfile is correct: `web: node backend/server.js`

### Common Issues:
- **Network Error**: Usually means API_BASE is pointing to wrong URL
- **404 on API calls**: Check CORS and ensure backend is running
- **Database errors**: JawsDB permissions or connection issues

## Local Testing Before Deploy
```bash
# Build frontend
cd frontend
npm run build

# Start backend (it will serve frontend from dist)
cd ../backend
npm start

# Test at http://localhost:4000
```

## What Was Fixed

### The Network Error Issue
The network error was caused by:
1. Frontend using `localhost:4000` in production instead of relative URLs
2. CORS not properly configured for Heroku domains
3. JawsDB initialization failing due to permission errors

### How It's Fixed Now
1. ✅ Frontend uses relative URLs in production (empty VITE_API_BASE)
2. ✅ CORS allows all Heroku domains (`.herokuapp.com`)
3. ✅ Database initialization skips CREATE DATABASE for JawsDB
4. ✅ Better error logging for debugging
5. ✅ Centralized API configuration

## Environment Variables Summary

### Heroku (Required)
- `JAWSDB_URL` - Automatically set by JawsDB addon
- `JWT_SECRET` - You must set this manually

### Heroku (Optional)
- `FRONTEND_URL` - Only if you need to explicitly set it
- `NODE_ENV` - Automatically set to "production" by Heroku

### Local Development
- No environment variables needed
- Uses defaults: localhost:4000, local MySQL
