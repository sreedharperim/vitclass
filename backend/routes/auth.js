const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();
const router = express.Router();
router.post('/register', async (req,res)=>{
  const {name,email,password,role} = req.body;
  if(!name||!email||!password) return res.status(400).json({error:'missing fields'});
  const [exists] = await pool.query('SELECT id FROM users WHERE email = ?',[email]);
  if(exists.length) return res.status(400).json({error:'email exists'});
  const hash = await bcrypt.hash(password,10);
  try{ const [result] = await pool.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',[name,email,hash,role||'student']); return res.json({id:result.insertId, name, email}); }
  catch(err){ console.error(err); return res.status(500).json({error:err.message}); }
});
router.post('/login', async (req,res)=>{
  /*
  for (let i = 0; i < 2; i++) {
    try {
      await pool.query('SELECT 1'); // quick health check
      console.log('DB connected');
      //return pool;
    } catch (err) {
      console.error(`DB connect attempt ${i+1} failed:`, err.code || err.message);
      const backoff = 2000 * Math.pow(2, i);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
  */
  const {email,password} = req.body;
  try{ const [rows] = await pool.query('SELECT * FROM users WHERE email = ?',[email]); const user = rows[0]; if(!user) return res.status(400).json({error:'no user'});
    const ok = await bcrypt.compare(password, user.password_hash); if(!ok) return res.status(400).json({error:'invalid creds'});
    const token = jwt.sign({id:user.id,role:user.role,name:user.name,email:user.email}, process.env.JWT_SECRET || 'supersecret', {expiresIn:'7d'});
    res.json({token});
    console.log(`Login success ${email}, ${password}` );
  }catch(err){ console.error(err); res.status(500).json({error:err.message}); }
});
module.exports = router;
