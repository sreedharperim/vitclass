const express = require('express');
const pool = require('./db');
const auth = require('./middleware_auth');
const router = express.Router();

// GET /api/assignments/:id  <-- add this
router.get('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT a.*, c.title as class_title, c.code as class_code 
       FROM assignments a
       JOIN classes c ON c.id = a.class_id
       WHERE a.id = ? LIMIT 1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Assignment not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Failed to fetch assignment', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/assignments/:id  (teacher only)
router.put('/:id', auth, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { title, description, due_date, total_points } = req.body;
    // verify assignment exists and teacher owns class
    const [[assignment]] = await pool.query(
      `SELECT a.*, c.teacher_id FROM assignments a JOIN classes c ON a.class_id = c.id WHERE a.id = ? LIMIT 1`,
      [assignmentId]
    );
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (req.user.role !== 'teacher' || req.user.id !== assignment.teacher_id) {
      return res.status(403).json({ error: 'Only the owning teacher can edit this assignment' });
    }

    const updates = [];
    const params = [];
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (due_date !== undefined) { updates.push('due_date = ?'); params.push(due_date); }
    if (total_points !== undefined) { updates.push('total_points = ?'); params.push(total_points); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(assignmentId);
    const sql = `UPDATE assignments SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to update assignment', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/class/:classId', auth, async (req, res) => {
  try {
    const classId = req.params.classId;
    if (req.user.role === 'teacher') {
      const [rows] = await pool.query('SELECT * FROM vw_assignments WHERE class_id = ? ORDER BY due_date ASC', [classId]);
      return res.json(rows);
    } else {
      const [rows] = await pool.query(
        `SELECT a.* FROM assignments a
         LEFT JOIN (SELECT at.assignment_id FROM assignment_targets at WHERE at.user_id = ?) targeted ON targeted.assignment_id = a.id
         WHERE a.class_id = ? AND (targeted.assignment_id IS NOT NULL OR NOT EXISTS (SELECT 1 FROM assignment_targets at2 WHERE at2.assignment_id = a.id))
         ORDER BY a.due_date ASC`,
        [req.user.id, classId]
      );
      return res.json(rows);
    }
  } catch (err) { console.error(err); return res.status(500).json({ error: err.message }); }
});

router.post('/class/:classId', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'only teachers can create assignments' });
  const classId = req.params.classId;
  const { title, description, due_date, total_points, target_student_ids } = req.body;
  try {
    const [r] = await pool.query('INSERT INTO assignments (class_id, title, description, due_date, total_points) VALUES (?,?,?,?,?)', [classId, title, description, due_date || null, total_points || 100]);
    const assignmentId = r.insertId;
    if (Array.isArray(target_student_ids) && target_student_ids.length > 0) {
      const values = target_student_ids.map(sid => [assignmentId, sid, req.user.id]);
      await pool.query('INSERT IGNORE INTO assignment_targets (assignment_id, user_id, assigned_by) VALUES ?', [values]);
    }
    await pool.query('INSERT INTO activities (class_id, user_id, type, message) VALUES (?,?,?,?)', [classId, req.user.id, 'assignment_created', `Assignment "${title}" created`]);
    return res.json({ id: assignmentId, title });
  } catch (err) { console.error(err); return res.status(500).json({ error: err.message }); }
});

router.get('/class/:classId/calendar', auth, async (req,res)=>{
  const classId = req.params.classId;
  const start = req.query.start || null; const end = req.query.end || null;
  try{
    let sql = 'SELECT * FROM assignments WHERE class_id = ? AND due_date IS NOT NULL'; const params=[classId];
    if(start){ sql += ' AND due_date >= ?'; params.push(start); }
    if(end){ sql += ' AND due_date <= ?'; params.push(end); }
    sql += ' ORDER BY due_date ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({error:err.message}); }
});

module.exports = router;
