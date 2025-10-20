// frontend/src/pages/AssignmentSubmissions.js
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../contexts/AuthContext';

export default function AssignmentSubmissions() {
  const { id } = useParams(); // assignment id
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState({});
  const [error, setError] = useState('');


  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // fetch assignment info (if backend has /api/assignments/:id)
      try {
        const a = await API.get(`/assignments/${id}`);
        setAssignment(a.data);
      } catch (e) {
        // ignore if endpoint missing
      }

      // fetch submissions
      const res = await API.get(`/submissions/${id}`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load submissions', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGrade(submissionId) {
    const value = prompt('Enter numeric grade (e.g. 85) — leave blank to cancel');
    if (value === null || value === '') return;
    const grade = parseInt(value, 10);
    if (isNaN(grade)) return alert('Invalid number');
    setGrading(g => ({ ...g, [submissionId]: true }));
    try {
      await API.post(`/submissions/${submissionId}/grade`, { grade, feedback: '' });
      alert('Graded');
      load();
    } catch (err) {
      alert('Grade failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGrading(g => ({ ...g, [submissionId]: false }));
    }
  }

  if (loading) return <div className="center-container"><div className="card">Loading submissions…</div></div>;
  if (error) return <div className="center-container"><div className="card" style={{color:'#DC2626'}}>{error}</div></div>;

  return (
    <div className="center-container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <h1 style={{margin:0}}>Submissions</h1>
          <div className="small-muted">{assignment ? `${assignment.title} — due ${assignment.due_date || '—'}` : `Assignment ${id}`}</div>
        </div>
        <div>
          <Link to={`/class/${assignment?.class_id || ''}`} className="btn btn-ghost">← Back to class</Link>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="card small-muted">No submissions yet.</div>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {submissions.map(s => (
            <div key={s.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{s.name || s.student_name || 'Student'}</div>
                <div className="small-muted">{s.email || s.student_email}</div>
                <div className="small-muted" style={{marginTop:6}}>Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '—'}</div>
                {s.content && <div style={{marginTop:8,whiteSpace:'pre-wrap'}}>{s.content}</div>}
                {s.file_path && <div style={{marginTop:8}}><a href={API.defaults.baseURL.replace('/api','') + s.file_path} target="_blank" rel="noreferrer">Download file</a></div>}
              </div>

              <div style={{minWidth:160,textAlign:'right'}}>
                <div style={{marginBottom:8,fontWeight:700}}>{s.grade != null ? `${s.grade} pts` : 'Not graded'}</div>
                {user?.role === 'teacher' && (
                  <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
                    <button onClick={()=>handleGrade(s.id)} className="btn btn-primary" disabled={grading[s.id]}>
                      {grading[s.id] ? 'Saving…' : 'Grade'}
                    </button>
                    <button onClick={load} className="btn btn-ghost">Refresh</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

