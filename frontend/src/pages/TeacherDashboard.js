import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'teacher') loadClasses();
  }, [user]);

  async function loadClasses() {
    setLoading(true);
    try {
      const res = await API.get('/classes/my');
      setClasses(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await API.post('/classes', form);
      setShowForm(false);
      setForm({ title: '', code: '', description: '' });
      loadClasses();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  if (user?.role !== 'teacher') {
    return <div className="center-container"><div className="card">Access denied. Only teachers can view this page.</div></div>;
  }

  return (
    <div className="center-container" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Teacher Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Class'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Create New Class</h3>
          <label>Title</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Physics 101"
            required
          />
          <label>Code (unique)</label>
          <input
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            placeholder="PHY101"
            required
          />
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows="3"
          />
          {error && <div className="small-muted" style={{ color: 'red' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Create Class</button>
        </form>
      )}

      {loading && <div className="card">Loading classes...</div>}

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        {classes.map(c => (
          <div key={c.id} className="card">
            <h3 style={{ marginTop: 0 }}>{c.title}</h3>
            <div className="small-muted">Code: {c.code}</div>
            <div className="small-muted">Students: {c.student_count || 0}</div>
            <p style={{ marginTop: 8 }}>{c.description || 'No description'}</p>
            <Link to={`/class/${c.id}`} className="btn btn-ghost" style={{ marginTop: 10 }}>
              View Class →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

