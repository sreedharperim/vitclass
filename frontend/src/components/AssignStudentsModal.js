// frontend/src/components/AssignStudentsModal.js
import React, { useCallback, useEffect, useState } from 'react';
import API from '../api';

export default function AssignStudentsModal({ classId, open, onClose, onAssigned }) {
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadAvailable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/classes/${classId}/available-students`);
      setAvailable(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (!open) return;
    loadAvailable();
  }, [open, loadAvailable]);


  function toggle(id) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  }

  async function assign() {
    if (!selected.size) return alert('Select at least one student');
    setAssigning(true);
    try {
      const student_ids = Array.from(selected);
      await API.post(`/classes/${classId}/members`, { student_ids });
      // success, refresh available list & notify parent
      setSelected(new Set());
      loadAvailable();
      if (onAssigned) onAssigned();
      alert('Assigned successfully');
      onClose && onClose();
    } catch (err) {
      alert('Assign failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAssigning(false);
    }
  }

  const filtered = available.filter(s => (s.name||'').toLowerCase().includes(search.toLowerCase()) || (s.email||'').toLowerCase().includes(search.toLowerCase()));

  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(6,8,15,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:120, padding:16
    }}>
      <div style={{ width:720, maxWidth:'96%' }} className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin:0 }}>Assign students</h3>
          <div>
            <button className="btn btn-ghost" onClick={() => { setSelected(new Set()); onClose && onClose(); }}>Close</button>
          </div>
        </div>

        <div style={{ marginTop:12 }}>
          <input placeholder="Search by name or email" value={search} onChange={e=>setSearch(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div style={{ marginTop:12, maxHeight:300, overflow:'auto', border:'1px solid rgba(0,0,0,0.05)', padding:8, borderRadius:8 }}>
          {loading && <div className="small-muted">Loading students…</div>}
          {error && <div style={{ color:'#DC2626' }}>{error}</div>}
          {!loading && filtered.length === 0 && <div className="small-muted">No available students</div>}
          {filtered.map(s => (
            <label key={s.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'8px 4px' }}>
              <input type="checkbox" checked={selected.has(s.id)} onChange={()=>toggle(s.id)} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{s.name}</div>
                <div className="small-muted">{s.email}</div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ marginTop:12, display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => { setSelected(new Set()); onClose && onClose(); }}>Cancel</button>
          <button className="btn btn-primary" onClick={assign} disabled={assigning}>{assigning ? 'Assigning…' : `Assign (${selected.size})`}</button>
        </div>
      </div>
    </div>
  );
}

