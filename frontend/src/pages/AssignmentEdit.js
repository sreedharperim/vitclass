// frontend/src/pages/AssignmentEdit.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../contexts/AuthContext';

export default function AssignmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    total_points: 100,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await API.get(`/assignments/${id}`);
        if (!mounted) return;
        setAssignment(res.data);
        setForm({
          title: res.data.title || '',
          description: res.data.description || '',
          // Map backend datetime to input-friendly ISO local (without timezone) if possible
          due_date: res.data.due_date ? res.data.due_date.replace(' ', 'T').slice(0, 16) : '',
          total_points: res.data.total_points ?? 100,
        });
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Build payload; convert local datetime back to server format if needed
      const payload = {
        title: form.title,
        description: form.description,
        due_date: form.due_date ? new Date(form.due_date).toISOString().slice(0,19).replace('T',' ') : null,
        total_points: Number(form.total_points) || 100,
      };
      await API.put(`/assignments/${id}`, payload);
      navigate(`/class/${assignment.class_id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="center-container"><div className="card">Loading assignment…</div></div>;
  if (error && !assignment) return <div className="center-container"><div className="card" style={{color:'#DC2626'}}>{error}</div></div>;
  if (!assignment) return <div className="center-container"><div className="card">Assignment not found</div></div>;

  // Only teacher who owns the class should edit — UI-level guard (backend also enforces)
  if (user?.role !== 'teacher') {
    return <div className="center-container"><div className="card">Only teachers can edit assignments.</div></div>;
  }

  return (
    <div className="center-container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <h1 style={{margin:0}}>Edit Assignment</h1>
          <div className="small-muted">{assignment.title}</div>
        </div>
        <div>
          <Link to={`/class/${assignment.class_id}`} className="btn btn-ghost">Back to class</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{maxWidth:760}}>
        <label>Title</label>
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />

        <label>Description</label>
        <textarea rows={6} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />

        <label>Due Date</label>
        <input type="datetime-local" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} />

        <label>Total points</label>
        <input type="number" min="0" value={form.total_points} onChange={e=>setForm({...form, total_points:e.target.value})} />

        {error && <div style={{color:'#DC2626', marginTop:8}}>{error}</div>}

        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <Link to={`/class/${assignment.class_id}`} className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

