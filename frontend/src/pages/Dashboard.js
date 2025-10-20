import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'teacher') loadClasses();
    else load();
  }, []);

  async function load() {
    setLoading(true);
    try { const r = await API.get('/classes'); setClasses(r.data); } catch (err) { setClasses([]); } finally { setLoading(false); }
  }


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

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await API.post('/classes', form);
      setShowForm(false);
      setForm({ title: '', code: '', description: '' });
      loadClasses();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="center-container" style={{ paddingBottom: 40 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <h1 style={{ margin:0 }}>Dashboard</h1>
        {user?.role === 'teacher' && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Create Class'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Create a New Class</h3>
          <label>Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <label>Code</label>
          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
          <label>Description</label>
          <textarea
            rows="3"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
            Create
          </button>
        </form>
      )}

      {loading && <div className="card">Loading classes...</div>}
      {error && <div className="card" style={{ color:'#DC2626' }}>{error}</div>}

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',
        gap:16
      }}>
        {classes.length === 0 && !loading ? (
          <div className="card small-muted">No classes yet. Create one to get started!</div>
        ) : (
          classes.map(c => (
            <div key={c.id} className="card">
              <h3 style={{ marginTop:0 }}>{c.title}</h3>
              <div className="small-muted">Code: {c.code}</div>
              {c.description && <p style={{ marginTop:8 }}>{c.description}</p>}
              <Link to={`/class/${c.id}`} className="btn btn-ghost" style={{ marginTop:12 }}>
                View Class →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

