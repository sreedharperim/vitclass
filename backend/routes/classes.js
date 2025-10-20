const express = require('express');
const pool = require('./db');
const auth = require('./middleware_auth');
const router = express.Router();
router.get('/', auth, async (req,res)=>{ try{ const [rows] = await pool.query('SELECT v.* FROM vw_classes v JOIN class_members m ON m.class_id = v.id WHERE m.user_id = ?',[req.user.id]); res.json(rows); } catch(err){ console.error(err); res.status(500).json({error:err.message}); } });
router.get('/:id', auth, async (req,res)=>{ try{ const [rows] = await pool.query('SELECT c.*, u.name as teacher_name FROM classes c JOIN users u ON u.id = c.teacher_id WHERE c.id = ?',[req.params.id]); const cls = rows[0]; if(!cls) return res.status(404).json({error:'not found'}); res.json(cls); } catch(err){ console.error(err); res.status(500).json({error:err.message}); } });
router.post('/', auth, async (req,res)=>{ if(req.user.role!=='teacher') return res.status(403).json({error:'only teachers can create classes'}); const {title,description,code} = req.body; try{ const [r] = await pool.query('CALL sp_create_class(?, ?, ?, ?, @class_id)', [title, description, code, req.user.id]); const [[out]] = await pool.query('SELECT @class_id as class_id'); res.json({id: out.class_id, title, description, code}); }catch(err){ console.error(err); res.status(500).json({error:err.message}); } });
router.post('/join', auth, async (req,res)=>{ const {code} = req.body; try{ await pool.query('CALL sp_join_class_by_code(?, ?, @cid)', [code, req.user.id]); const [[out]] = await pool.query('SELECT @cid as cid'); if(!out || out.cid === 0) return res.status(404).json({error:'class not found'}); res.json({joined:true, classId: out.cid}); }catch(err){ console.error(err); res.status(500).json({error:err.message}); } });
router.get('/:id/roster', auth, async (req,res)=>{
  try{
    const [rows] = await pool.query(`SELECT u.id, u.name, u.email, m.role, m.joined_at FROM class_members m JOIN users u ON u.id = m.user_id WHERE m.class_id = ? ORDER BY u.name`, [req.params.id]);
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({error:err.message}); }
});
module.exports = router;
