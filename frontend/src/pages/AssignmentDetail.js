// frontend/src/pages/AssignmentDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';

export default function AssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    API.get(`/assignments/${id}`)
      .then(res => { if(mounted) setAssignment(res.data); })
      .catch(err => { if(mounted) setError(err.response?.data?.error || err.message); })
      .finally(() => { if(mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="center-container"><div className="card">Loading...</div></div>;
  if (error) return <div className="center-container"><div className="card" style={{color:'#DC2626'}}>{error}</div></div>;
  if (!assignment) return <div className="center-container"><div className="card">Assignment not found</div></div>;

  return (
    <div className="center-container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <h1 style={{margin:0}}>{assignment.title}</h1>
          <div className="small-muted">Class: {assignment.class_title ?? assignment.class_id}</div>
        </div>
        <Link to={`/class/${assignment.class_id}`} className="btn btn-ghost">Back to class</Link>
      </div>

      <div className="card">
        <div className="small-muted">Due</div>
        <div style={{ fontWeight:700 }}>{assignment.due_date ? new Date(assignment.due_date).toLocaleString() : '—'}</div>
        {assignment.description && (<><h4 style={{marginTop:12}}>Description</h4><div style={{whiteSpace:'pre-wrap'}}>{assignment.description}</div></>)}
      </div>
    </div>
  );
}

