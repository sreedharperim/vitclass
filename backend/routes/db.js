const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool({
  uri: process.env.DB_URI,   // e.g. mysql://user:pass@host:port/db
  /*
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'gclass',
  */
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false // accept self-signed or provider certs
  },
});

console.log(`DB connect attempt ${process.env.DB_URI} ${process.env.DB_HOST}, ${process.env.DB_USER}, ${process.env.DB_USER}, ${process.env.DB_PASS} ${process.env.DB_NAME}`);

module.exports = pool;
