import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Menu, Moon, Sun } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { useAppData } from '../context/AppDataContext'
import { useTheme } from '../context/ThemeContext'
import { ADMIN_LOGIN_PATH } from '../config/admin'
export default function AdminLayout(){const[open,setOpen]=useState(false);const{data,adminState}=useAppData();const{theme,toggleTheme}=useTheme();if(adminState==='checking')return <div className="screen-loader">Validando sesión…</div>;if(adminState!=='authenticated')return <Navigate to={ADMIN_LOGIN_PATH} replace/>;return <div className="admin-shell"><AdminSidebar open={open} onClose={()=>setOpen(false)}/><div className="admin-main"><header className="admin-mobile-header"><button onClick={()=>setOpen(true)} aria-label="Abrir menú"><Menu size={21}/></button><strong>{data?.settings.displayName||'RC Repuestos y Accesorios'}</strong><button onClick={toggleTheme} aria-label="Cambiar tema">{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button></header><div className="admin-desktop-tools"><button className="theme-admin-btn" onClick={toggleTheme}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}<span>{theme==='dark'?'Modo claro':'Modo oscuro'}</span></button></div><main className="admin-content"><Outlet/></main></div></div>}
