// backend/routes/classes.js  (append or merge into existing router)
const express = require('express');
const router = express.Router();
const pool = require('./db');         // adjust path if needed
const auth = require('./middleware_auth'); // your JWT middleware

//Get all classes owned by the logged-in teacher
router.get('/my', auth, async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can view their classes.' });
    }

    const [rows] = await pool.query(
      `SELECT c.*, COUNT(cm.user_id) AS student_count
       FROM classes c
       LEFT JOIN class_members cm ON c.id = cm.class_id AND cm.role = 'student'
       WHERE c.teacher_id = ?
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch classes failed:', err);
    res.status(500).json({ error: err.message });
  }
});


// POST /api/classes/:id/members  -- assign one or more students to class (teacher only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const teacherId = req.user.id;
    const role = req.user.role;

    if (role !== 'teacher') return res.status(403).json({ error: 'Only teachers can assign students' });

    // Ensure the teacher owns the class
    const [clsRows] = await pool.query('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
    if (!clsRows.length) return res.status(404).json({ error: 'Class not found' });
    if (clsRows[0].teacher_id !== teacherId) return res.status(403).json({ error: 'Not the class owner' });

    // Accept either a single id or an array
    let { student_ids } = req.body;
    if (!student_ids) return res.status(400).json({ error: 'student_ids required' });
    if (!Array.isArray(student_ids)) student_ids = [student_ids];

    // Filter valid numeric ids
    student_ids = student_ids.map(x => Number(x)).filter(x => Number.isInteger(x) && x > 0);
    if (!student_ids.length) return res.status(400).json({ error: 'No valid student ids provided' });

    // Ensure all are students and exist
    const [users] = await pool.query('SELECT id, role FROM users WHERE id IN (?)', [student_ids]);
    const invalid = student_ids.filter(sid => !users.find(u => u.id === sid && u.role === 'student'));
    if (invalid.length) return res.status(400).json({ error: 'Some ids are invalid or not students', invalid });

    // Bulk insert ignore duplicates (INSERT IGNORE or ON DUPLICATE)
    const values = student_ids.map(sid => [classId, sid, 'student', new Date()]);
    // Using INSERT IGNORE to avoid duplicate key errors
    await pool.query('INSERT IGNORE INTO class_members (class_id, user_id, role, joined_at) VALUES ?', [values]);

    // Optionally return updated roster
    const [roster] = await pool.query(
      'SELECT u.id, u.name, u.email, m.role, m.joined_at FROM class_members m JOIN users u ON u.id = m.user_id WHERE m.class_id = ? ORDER BY u.name',
      [classId]
    );
    res.json({ ok: true, added: student_ids, roster });
  } catch (err) {
    console.error('Assign students failed', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/classes/:id/members/:userId -- unassign a student (teacher only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const userIdToRemove = Number(req.params.userId);
    const teacherId = req.user.id;
    const role = req.user.role;

    if (role !== 'teacher') return res.status(403).json({ error: 'Only teachers can remove students' });

    // ownership check
    const [clsRows] = await pool.query('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
    if (!clsRows.length) return res.status(404).json({ error: 'Class not found' });
    if (clsRows[0].teacher_id !== teacherId) return res.status(403).json({ error: 'Not the class owner' });

    // Prevent removing the teacher record itself (can't remove teacher)
    const [memberRows] = await pool.query('SELECT role FROM class_members WHERE class_id = ? AND user_id = ?', [classId, userIdToRemove]);
    if (!memberRows.length) return res.status(404).json({ error: 'Member not found' });
    if (memberRows[0].role === 'teacher') return res.status(400).json({ error: 'Cannot remove teacher from class via this endpoint' });

    await pool.query('DELETE FROM class_members WHERE class_id = ? AND user_id = ?', [classId, userIdToRemove]);

    res.json({ ok: true, removed: userIdToRemove });
  } catch (err) {
    console.error('Remove student failed', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classes/:id/available-students
// returns students NOT already in the class so teacher can choose
router.get('/:id/available-students', auth, async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const teacherId = req.user.id;
    const role = req.user.role;

    // Only teacher-owner can see available student list (optional)
    if (role !== 'teacher') return res.status(403).json({ error: 'Only teachers can fetch students list' });
    const [clsRows] = await pool.query('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
    if (!clsRows.length) return res.status(404).json({ error: 'Class not found' });
    if (clsRows[0].teacher_id !== teacherId) return res.status(403).json({ error: 'Not the class owner' });

    // Students not already members
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       WHERE u.role = 'student' AND u.id NOT IN (SELECT user_id FROM class_members WHERE class_id = ?) 
       ORDER BY u.name
       LIMIT 1000`, [classId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Available students failed', err);
    res.status(500).json({ error: err.message });
  }
});

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
