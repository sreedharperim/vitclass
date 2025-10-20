// frontend/src/pages/MessagesPage.js
import React, { useEffect, useState } from 'react';
import { useCallback, useNavigate, useParams, useLocation } from 'react-router-dom';
import API from '../api';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const navigate = useNavigate();
  const { id: routeMessageId } = useParams(); // supports /messages/:id if nested route used
  const location = useLocation();

  useEffect(() => {
    if (routeMessageId && messages.length) {
      const m = messages.find(x => String(x.id) === String(routeMessageId));
      if (m) setSelected(m);
    }
  }, [routeMessageId, messages]);


  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get('/messages/my');
        setMessages(res.data || []);
      } catch (err) {
        console.error('Failed to load messages', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
    // try to open detail if route contains id (deep link)
    // note: if App uses separate route /messages/:id it will mount MessageDetail; this is a safe fallback
  }, []);

  async function markRead(msgId) {
    try {
      await API.post(`/messages/${msgId}/read`);
      setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, read_at: new Date().toISOString() } : m)));
      if (selected && selected.id === msgId) setSelected({ ...selected, read_at: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  }

  function openDetail(m) {
    setSelected(m);
    // deep-link: update URL to /messages/:id
    // prefer navigation (keeps browser history)
    if (!location.pathname.endsWith(`/${m.id}`)) {
      navigate(`/messages/${m.id}`, { replace: false });
    }
    // optimistic mark-read UI; actual API call below or on button
    if (!m.read_at) markRead(m.id);
  }

  if (loading) return <div className="center-container"><div className="card">Loading messages…</div></div>;
  if (error) return <div className="center-container"><div className="card" style={{ color: '#DC2626' }}>{error}</div></div>;

  const byClass = messages.reduce((acc, m) => {
    const key = m.class_title || `Class ${m.class_id || '—'}`;
    acc[key] = acc[key] || [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="center-container" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1>Messages</h1>
        <div className="small-muted">{messages.length} messages</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 18 }}>
        <main>
          {Object.keys(byClass).length === 0 ? (
            <div className="card small-muted">No messages found.</div>
          ) : (
            Object.entries(byClass).map(([classTitle, msgs]) => (
              <section key={classTitle} style={{ marginBottom: 18 }}>
                <h3 style={{ marginTop: 0 }}>{classTitle}</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {msgs.map(m => (
                    <div
                      key={m.id}
                      className="card"
                      style={{ display: 'flex', justifyContent: 'space-between', gap: 12, cursor: 'pointer', background: selected?.id === m.id ? '#f1f8ff' : undefined }}
                      onClick={() => openDetail(m)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{m.subject || (m.body || '').slice(0, 80)}</div>
                        <div className="small-muted">From: {m.sender_name || 'Unknown'} — {new Date(m.created_at).toLocaleString()}</div>
                        <div style={{ marginTop: 8, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.body}</div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div className="small-muted" style={{ fontSize: 13 }}>{m.read_at ? 'Read' : 'Unread'}</div>
                        <div>
                          {!m.read_at && <button onClick={(e) => { e.stopPropagation(); markRead(m.id); }} className="btn btn-ghost">Mark read</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        <aside>
          <div className="card">
            <h4 style={{ marginTop: 0 }}>Message details</h4>
            {!selected ? (
              <div className="small-muted">Select a message to view details.</div>
            ) : (
              <>
                <div style={{ fontWeight: 700 }}>{selected.subject || '(No subject)'}</div>
                <div className="small-muted" style={{ marginBottom: 8 }}>From: {selected.sender_name || 'Unknown'} — {new Date(selected.created_at).toLocaleString()}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{selected.body}</div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => { markRead(selected.id); setSelected(null); navigate('/messages'); }} className="btn btn-primary">Mark read and close</button>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

