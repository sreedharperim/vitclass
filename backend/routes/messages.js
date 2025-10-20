const express = require('express');
const pool = require('./db');
const auth = require('./middleware_auth');
const router = express.Router();

router.post('/classes/:classId/messages', auth, async (req,res)=>{
  const classId = Number(req.params.classId); const senderId = req.user.id; const { subject, body, target_student_ids } = req.body;
  if(!body || body.trim()==='') return res.status(400).json({error:'Message body required'});
  try{
    const [members] = await pool.query('SELECT * FROM class_members WHERE class_id = ? AND user_id = ?', [classId, senderId]);
    if(members.length === 0) return res.status(403).json({error:'Not a member of this class'});
    const [result] = await pool.query('INSERT INTO messages (class_id, sender_id, subject, body) VALUES (?,?,?,?)', [classId, senderId, subject||null, body]);
    const messageId = result.insertId;
    if(Array.isArray(target_student_ids) && target_student_ids.length>0){
      const values = target_student_ids.map(uid=>[messageId, uid]);
      await pool.query('INSERT IGNORE INTO message_targets (message_id, user_id) VALUES ?', [values]);
    } else {
      const [classMembers] = await pool.query('SELECT user_id FROM class_members WHERE class_id = ?', [classId]);
      if(classMembers.length>0){
        const readValues = classMembers.map(m=>[messageId, m.user_id, null]);
        await pool.query('INSERT IGNORE INTO message_reads (message_id, user_id, read_at) VALUES ?', [readValues]);
      }
    }
    await pool.query('INSERT INTO activities (class_id, user_id, type, message) VALUES (?,?,?,?)', [classId, senderId, 'message', `Message created`]);
    res.json({id: messageId});
  }catch(err){ console.error(err); res.status(500).json({error:err.message}); }
});

router.get('/classes/:classId/messages', auth, async (req,res)=>{
  const classId = Number(req.params.classId); const userId = req.user.id; const limit = Math.min(Number(req.query.limit)||100,500);
  try{
    const sql = `SELECT m.*, u.name AS sender_name, EXISTS(SELECT 1 FROM message_targets mt WHERE mt.message_id = m.id) AS has_targets, (SELECT mr.read_at FROM message_reads mr WHERE mr.message_id = m.id AND mr.user_id = ?) AS read_at FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.class_id = ? AND (EXISTS (SELECT 1 FROM message_targets mt WHERE mt.message_id = m.id AND mt.user_id = ?) OR NOT EXISTS (SELECT 1 FROM message_targets mt2 WHERE mt2.message_id = m.id)) ORDER BY m.created_at DESC LIMIT ?`;
    const [rows] = await pool.query(sql, [userId, classId, userId, limit]);
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({error:err.message}); }
});

router.get('/my', auth, async (req,res)=>{
  const userId = req.user.id; const limit = Math.min(Number(req.query.limit)||200,1000);
  try{
    const sql = `SELECT m.*, u.name AS sender_name, c.title AS class_title FROM messages m JOIN users u ON u.id = m.sender_id JOIN classes c ON c.id = m.class_id WHERE (EXISTS (SELECT 1 FROM message_targets mt WHERE mt.message_id = m.id AND mt.user_id = ?)) OR NOT EXISTS (SELECT 1 FROM message_targets mt2 WHERE mt2.message_id = m.id) ORDER BY m.created_at DESC LIMIT ?`;
    const [rows] = await pool.query(sql, [userId, limit]);
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({error:err.message}); }
});

router.post('/:id/read', auth, async (req,res)=>{
  const messageId = Number(req.params.id); const userId = req.user.id;
  try{
    await pool.query('INSERT INTO message_reads (message_id, user_id, read_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP', [messageId, userId]);
    res.json({ok:true});
  }catch(err){ console.error(err); res.status(500).json({error:err.message}); }
});

module.exports = router;
