import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Assignments from './pages/Assignments';
import Grades from './pages/Grades';
import ClassPage from './pages/ClassPage';
import CreateAssignment from './pages/CreateAssignment';
import RosterPage from './pages/RosterPage';

import MessagesPage from './pages/MessagesPage';
import MessageDetail from './pages/MessageDetail';

import AssignmentDetail from './pages/AssignmentDetail';
import TeacherDashboard from './pages/TeacherDashboard';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import AssignmentEdit from './pages/AssignmentEdit';

export default function App(){ return (<AuthProvider><HashRouter><Navbar /><Routes><Route path='/' element={<Dashboard/>} /><Route path='/login' element={<Login/>} /><Route path='/register' element={<Register/>} /><Route path='/assignments' element={<Assignments/>} /><Route path="/dashboard" element={<TeacherDashboard />} /><Route path="/assignments/:id" element={<AssignmentDetail />} /><Route path='/grades' element={<Grades/>} /><Route path='/class/:id' element={<ClassPage/>} /><Route path="/assignments/:id/submissions" element={<AssignmentSubmissions />} /><Route path="/assignments/:id/edit" element={<AssignmentEdit />} /><Route path='/class/:id/create' element={<CreateAssignment/>} /><Route path='/class/:id/roster' element={<RosterPage/>} /><Route path="/messages" element={<MessagesPage/>} /><Route path="/messages/:id" element={<MessageDetail />} /></Routes></HashRouter></AuthProvider>) }
