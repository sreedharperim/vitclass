// frontend/src/components/Navbar.js
import React, { useContext, useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import API from '../api';

// Optional: enable socket by installing `socket.io-client` and uncommenting code
// import { io } from "socket.io-client";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const pollTimer = useRef(null);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    let mounted = true;

    async function fetchUnread() {
      try {
        // We use GET /api/messages/my and count unread (backend returns read_at)
        const res = await API.get('/messages/my?limit=200');
        if (!mounted) return;
        const unread = (res.data || []).filter(m => !m.read_at).length;
        setUnreadCount(unread);
      } catch (err) {
        // ignore quietly
      }
    }

    fetchUnread();
    // poll every 15s for new messages
    pollTimer.current = setInterval(fetchUnread, 15000);

    // Optional: socket.io real-time (commented — requires server socket)
    /*
    const socket = io(process.env.REACT_APP_API_WS || 'http://localhost:5000', { auth: { token: localStorage.getItem('token') }});
    socket.on('connect', () => console.log('socket connected'));
    socket.on('message.created', (payload) => {
      // increment count and optionally show toast
      setUnreadCount(c => c + 1);
    });
    socket.on('disconnect', () => console.log('socket disconnected'));
    */

    return () => { mounted = false; clearInterval(pollTimer.current); /* socket?.disconnect(); */ };
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" end className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>Dashboard</NavLink>
        <NavLink to="/assignments" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>Assignments</NavLink>
        <NavLink to="/grades" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>Grades</NavLink>

        <NavLink to="/messages" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")} style={{ position: 'relative' }}>
          Messages
          {unreadCount > 0 && (
            <span style={{
              marginLeft: 8,
              background: '#ef4444',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              marginTop: -2,
              display: 'inline-block'
            }}>{unreadCount}</span>
          )}
        </NavLink>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
          </>
        ) : (
          <NavLink to="/login" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>Login</NavLink>
        )}
      </div>
    </nav>
  );
}

