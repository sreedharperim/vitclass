// frontend/src/pages/ClassPage.js
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../contexts/AuthContext';

import AssignmentCard from '../components/AssignmentCard';
import MessageList from '../components/MessageList';
import MessageForm from '../components/MessageForm';
import SubmissionForm from '../components/SubmissionForm';
import CalendarView from '../components/CalendarView';
import AssignmentDetailsModal from '../components/AssignmentDetailsModal';
import RosterPreview from '../components/RosterPreview';
import AssignStudentsModal from '../components/AssignStudentsModal';

export default function ClassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [cls, setCls] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSubmitFor, setShowSubmitFor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);


  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classRes, assignRes, rosterRes] = await Promise.all([
        API.get(`/classes/${id}`),
        API.get(`/assignments/class/${id}`),
        API.get(`/classes/${id}/roster`)
      ]);
      setCls(classRes.data || null);
      setAssignments(assignRes.data || []);
      setMembers(rosterRes.data || []);
    } catch (err) {
      console.error('Failed to load class page data', err);
      setError(err.response?.data?.error || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    loadAll();
  }, [id, loadAll]);


  function refresh() {
    setRefreshKey(k => k + 1);
  }

  function goCreate() {
    navigate(`/class/${id}/create`);
  }

  function openSubmit(assignmentId) {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowSubmitFor(assignmentId);
  }

  function onSubmitted() {
    setShowSubmitFor(null);
    refresh();
  }

  // teacher-only: open assign modal
  function openAssignModal() {
    setAssignModalOpen(true);
  }
  function onAssigned() {
    // refresh roster and assignments
    refresh();
  }

  if (loading) return <div className="center-container"><div className="card">Loading class…</div></div>;
  if (error) return <div className="center-container"><div className="card" style={{ color: '#DC2626' }}>{error}</div></div>;
  if (!cls) return <div className="center-container"><div className="card">Class not found</div></div>;

  const isTeacher = user && user.role === 'teacher' && user.id === cls.teacher_id;

  return (
    <div className="center-container" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{cls.title}</h1>
          <div className="small-muted">{cls.description}</div>
          <div style={{ marginTop: 6 }} className="small-muted">Code: <strong>{cls.code}</strong></div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isTeacher && <button onClick={goCreate} className="btn btn-primary">+ Create Assignment</button>}
          {isTeacher && <button onClick={openAssignModal} className="btn btn-ghost">Assign students</button>}
          <button onClick={refresh} className="btn btn-ghost">Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18 }}>
        <main>
          <section aria-labelledby="assignments-heading" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 id="assignments-heading" style={{ margin: 0 }}>Assignments</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setCalendarOpen(c => !c)} className="btn btn-ghost">{calendarOpen ? 'Back to list' : 'View calendar'}</button>
              </div>
            </div>

            {calendarOpen ? (
              <>
                <CalendarView classId={id} onEventClick={(assignment) => setSelectedAssignment(assignment)} />
                <AssignmentDetailsModal open={!!selectedAssignment} assignment={selectedAssignment} onClose={() => setSelectedAssignment(null)} />
              </>
            ) : (
              assignments.length === 0 ? (
                <div className="card small-muted">No assignments yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {assignments.map(a => (
                    <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <AssignmentCard a={a} />
                      </div>

                      <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <div className="small-muted" style={{ fontSize: 13 }}>Due: {a.due_date ? new Date(a.due_date).toLocaleString() : '—'}</div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          {user?.role === 'student' && <button onClick={() => openSubmit(a.id)} className="btn btn-primary">Submit</button>}
                          {isTeacher && <Link to={`/assignments/${a.id}/submissions`} className="btn btn-ghost" style={{ textDecoration: 'none' }}>Submissions</Link>}
                          {isTeacher && <Link to={`/assignments/${a.id}/edit`} className="btn btn-ghost" style={{ textDecoration: 'none' }}>Edit</Link>}
                          <Link to={`/assignments/${a.id}`} className="btn btn-ghost" style={{ textDecoration: 'none' }}>View</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <Link to="/grades" className="btn btn-ghost" style={{ textDecoration: 'none' }}>Grades</Link>
            <Link to={`/class/${id}/roster`} className="btn btn-ghost" style={{ textDecoration: 'none' }}>Roster</Link>
          </div>
        </main>

        <aside>
          <div style={{ position: 'sticky', top: 18 }}>
            {isTeacher && <div style={{ marginBottom: 12 }}><MessageForm classId={id} onSent={() => refresh()} /></div>}

            <div style={{ marginBottom: 12 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Messages</h4>
              <MessageList classId={id} />
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>Roster</div>
                <Link to={`/class/${id}/roster`} style={{ fontSize: 13, color: '#1A73E8', textDecoration: 'none' }}>View full</Link>
              </div>
              <RosterPreview classId={id} />
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {isTeacher && <button className="btn btn-ghost" onClick={() => setAssignModalOpen(true)}>Manage students</button>}
                <button className="btn btn-ghost" onClick={() => refresh()}>Refresh roster</button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showSubmitFor && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,8,15,0.45)', zIndex: 60, padding: 18 }}>
          <div className="card" style={{ width: 720, maxWidth: '96%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Submit assignment</h3>
              <button onClick={() => setShowSubmitFor(null)} className="btn btn-ghost">Close</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <SubmissionForm assignmentId={showSubmitFor} onSubmitted={onSubmitted} />
            </div>
          </div>
        </div>
      )}

      <AssignStudentsModal
        classId={id}
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssigned={() => { onAssigned(); setAssignModalOpen(false); }}
      />
    </div>
  );
}

