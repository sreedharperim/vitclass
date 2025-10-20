// frontend/src/components/AssignmentDetailsModal.js
import React from 'react';

export default function AssignmentDetailsModal({ open, assignment, onClose }) {
  if (!open || !assignment) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(6,8,15,0.45)', zIndex: 120, padding: 18
    }}>
      <div className="card" style={{ width: 720, maxWidth: '96%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin: 0 }}>{assignment.title}</h3>
          <button onClick={onClose} className="btn btn-ghost">Close</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="small-muted">Due:</div>
          <div style={{ fontWeight: 600 }}>{assignment.due_date ? new Date(assignment.due_date).toLocaleString() : '—'}</div>

          {assignment.description && (
            <>
              <div style={{ marginTop: 12, fontWeight: 600 }}>Description</div>
              <div style={{ whiteSpace:'pre-wrap' }}>{assignment.description}</div>
            </>
          )}

          <div style={{ marginTop: 12, display:'flex', gap:8 }}>
            <div className="small-muted">Points:</div>
            <div>{assignment.total_points ?? '100'}</div>
          </div>

          {assignment.class_id && (
            <div style={{ marginTop: 10 }} className="small-muted">Class ID: {assignment.class_id}</div>
          )}
        </div>

        <div style={{ marginTop: 14, display:'flex', gap:8 }}>
          <button onClick={onClose} className="btn btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
}

