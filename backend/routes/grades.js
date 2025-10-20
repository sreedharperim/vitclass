const express = require('express');
const pool = require('./db');
const auth = require('./middleware_auth');
const router = express.Router();
router.get('/', auth, async (req,res)=>{ const userId = req.user.id; const role = req.user.role; try{ let rows; if(role === 'student'){ [rows] = await pool.query('SELECT a.title AS assignment_title, s.grade, a.total_points, s.feedback, a.class_id FROM submissions s JOIN assignments a ON a.id = s.assignment_id WHERE s.student_id = ? ORDER BY a.due_date DESC',[userId]); } else if(role === 'teacher'){ [rows] = await pool.query("SELECT s.id, a.title AS assignment_title, u.name AS student_name, s.grade, s.feedback FROM submissions s JOIN assignments a ON a.id = s.assignment_id JOIN users u ON u.id = s.student_id WHERE a.class_id IN (SELECT id FROM classes WHERE teacher_id = ?) ORDER BY s.submitted_at DESC",[userId]); } res.json(rows); }catch(err){ console.error(err); res.status(500).json({error:err.message}); } }); module.exports = router;
