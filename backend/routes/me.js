const express = require('express');
const pool = require('./db');
const auth = require('./middleware_auth');
const router = express.Router();
router.get('/', auth, async (req,res)=>{ try{ const [rows] = await pool.query('SELECT id,name,email,role,created_at FROM users WHERE id = ?',[req.user.id]); res.json(rows[0]); }catch(err){ console.error(err); res.status(500).json({error:err.message}); } });
module.exports = router;
