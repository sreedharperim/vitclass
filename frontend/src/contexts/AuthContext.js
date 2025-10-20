import React,{createContext,useState,useEffect} from 'react';
import API from '../api';
export const AuthContext = createContext();
export const AuthProvider = ({children})=>{
  const [user,setUser]=useState(null);
  useEffect(()=>{ const token=localStorage.getItem('token'); if(token){ API.get('/me').then(r=>setUser(r.data)).catch(()=>setUser(null)); } },[]);
  const login = async(email,password)=>{ const {data}=await API.post('/auth/login',{email,password}); localStorage.setItem('token',data.token); const me=await API.get('/me'); setUser(me.data); }
  const logout = ()=>{ localStorage.removeItem('token'); setUser(null); }
  return <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>
}
