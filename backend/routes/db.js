const mysql = require('mysql2/promise');

async function connectToDatabase() {
  try {
    const pool = mysql.createPool({
      uri: "mysql://root:kvydyRHKEvHbkoBbQJHdVXtFZwvKcdij@ballast.proxy.rlwy.net:47338/railway",   // e.g. mysql://user:pass@host:port/db
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,        // 10s timeout
      ssl: {
        rejectUnauthorized: false,  // Railway provides SSL, no local cert needed
      },
    });

    // Test connection
    const [rows] = await pool.query("SELECT NOW() AS current_time");
    console.log("✅ Connected to Railway MySQL. Time:", rows[0].current_time);

    return pool;
  } catch (err) {
    console.error("❌ MySQL connection error:", err.code, err.message);
    throw err;
  }
}

// Export a ready-to-use pool
const pool = await connectToDatabase();
//export default pool;




/*
require('dotenv').config();
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'gclass',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true // accept self-signed or provider certs
  },
});
*/
console.log(`DB connect attempt ${process.env.DB_HOST}, ${process.env.DB_USER}, ${process.env.DB_USER}, ${process.env.DB_PASS} ${process.env.DB_NAME}`);

module.exports = pool;
