const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
    // create a connection without database so CREATE DATABASE works
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      console.log('Running:', stmt.split('\n')[0].slice(0, 120));
      await conn.query(stmt);
    }
    await conn.end();
    console.log('Done running schema.sql');
    process.exit(0);
  } catch (err) {
    console.error('Error running schema:', err);
    process.exit(1);
  }
}

run();
