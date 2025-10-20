// frontend/src/pages/MessageDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api';

export default function MessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // Backend: GET /api/messages/my returns list; we have no single-message endpoint in current backend,
        // so fetch my messages and pick the one matching id. If you prefer, add GET /api/messages/:id backend route.
        const res = await API.get('/messages/my');
        const found = (res.data || []).find(m => String(m.id) === String(id));
        if (!found) {
          setError('Message not found');
        } else if (mounted) {
          setMsg(found);
          // Mark read if unread
          if (!found.read_at) {
            try { await API.post(`/messages/${found.id}/read`); found.read_at = new Date().toISOString(); }
            catch (err) { /* ignore */ }
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="center-container"><div className="card">Loading message…</div></div>;
  if (error) return <div className="center-container"><div className="card" style={{ color: '#DC2626' }}>{error}</div></div>;
  if (!msg) return null;

  return (
    <div className="center-container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <h1 style={{ margin: 0 }}>Message</h1>
        <div>
          <Link to="/messages" className="btn btn-ghost" style={{ textDecoration:'none', marginRight:8 }}>← Back</Link>
          <button onClick={() => navigate(`/class/${msg.class_id}`)} className="btn btn-ghost">Go to class</button>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight:700, fontSize:18 }}>{msg.subject || '(No subject)'}</div>
        <div className="small-muted" style={{ marginBottom: 12 }}>
          From: {msg.sender_name || 'Unknown'} — {new Date(msg.created_at).toLocaleString()}
        </div>
        <div style={{ whiteSpace:'pre-wrap' }}>{msg.body}</div>
        <div style={{ marginTop: 12 }}>
          <div className="small-muted">Targets: {msg.has_targets ? 'Specific' : 'Entire class'}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => navigate('/messages')} className="btn btn-ghost">Back to messages</button>
          </div>
        </div>
      </div>
    </div>
  );
}

