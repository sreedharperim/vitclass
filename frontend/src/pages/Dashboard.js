import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const r = await API.get('/classes'); setClasses(r.data); } catch (err) { setClasses([]); } finally { setLoading(false); }
  }

  return (
    <div className="center-container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div>
          <h1 className="text-3xl" style={{margin:0}}>Welcome{user?`, ${user.name}`:''}</h1>
          <div className="small-muted">Your classes</div>
        </div>
      </div>

      {loading ? <div className="card">Loading...</div> : classes.length===0 ? <div className="card small-muted">No classes</div> : (
        <div className="course-grid">
          {classes.map(c => (
            <div key={c.id} className="card" role="button" tabIndex={0} onClick={() => window.location.href=`/class/${c.id}`} style={{cursor:'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div>
                  <h3 style={{margin:'0 0 6px 0'}}>{c.title}</h3>
                  <div className="small-muted">{c.description}</div>
                </div>
                <div style={{minWidth:120,textAlign:'right'}}>
                  <div className="small-muted">Code</div>
                  <div style={{fontWeight:700,marginTop:6}}>{c.code}</div>
                  <div style={{marginTop:6}}><button onClick={(e)=>{ e.stopPropagation(); navigator.clipboard && navigator.clipboard.writeText(c.code); }} className="btn btn-ghost">Copy</button></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
