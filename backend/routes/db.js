const mysql = require('mysql2/promise');
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

console.log(`DB connect attempt ${process.env.DB_HOST}, ${process.env.DB_USER}, ${process.env.DB_USER}, ${process.env.DB_PASS} ${process.env.DB_NAME}`);

module.exports = pool;
