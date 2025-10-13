# Heroku Environment Variables Setup

## Required Environment Variables

Add these in your Heroku Dashboard → Settings → Config Vars:

### 1. JWT Authentication
```
JWT_SECRET = your-super-secure-random-string-here
```
**Value**: Generate a secure random string (at least 32 characters)
**Example**: `JWT_SECRET = 7f8a9b2c4d6e8f1a3b5c7d9e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2`

### 2. Database Configuration

**Option A: Using JawsDB MySQL Add-on (Recommended)**
1. Go to Resources tab in Heroku
2. Add "JawsDB MySQL" add-on (free tier available)
3. No additional config needed - it automatically sets JAWSDB_URL

**Option B: External MySQL Database**
If you're using your own MySQL database, add:
```
DB_HOST = your-mysql-host.com
DB_PORT = 3306
DB_USER = your-username
DB_PASS = your-password
DB_NAME = studentgigs
```

### 3. Node.js Configuration (Optional)
```
NODE_ENV = production
```

## Steps to Set Environment Variables:

1. **Go to your Heroku app dashboard**
2. **Click on "Settings" tab**
3. **Scroll down to "Config Vars" section**
4. **Click "Reveal Config Vars"**
5. **Add each environment variable:**
   - KEY: `JWT_SECRET`
   - VALUE: `your-generated-secret-here`
   - Click "Add"

6. **For database: Add JawsDB MySQL add-on:**
   - Go to "Resources" tab
   - Search "JawsDB MySQL"
   - Click "Submit Order Form" (free tier)

## Generate JWT Secret

You can generate a secure JWT secret using Node.js:

```javascript
// Run this in Node.js console or browser console
require('crypto').randomBytes(32).toString('hex')
```

Or use an online generator: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

## Verification

After setting up, your Config Vars should show:
- `JAWSDB_URL` (automatically added by JawsDB add-on)
- `JWT_SECRET` (manually added by you)
- `NODE_ENV` (optional, set to "production")

The application will automatically use these values when deployed to Heroku.