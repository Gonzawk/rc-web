import { useEffect, useState } from 'react'
import { LockKeyhole, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { useAppData } from '../context/AppDataContext'

export default function AdminLoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const { adminState, adminError, loginAdmin, checkAdminSession } = useAppData()
  const navigate = useNavigate()

  useEffect(() => { if (adminState === 'authenticated') navigate('/admin/productos', { replace:true }) }, [adminState, navigate])

  const submit = async e => {
    e.preventDefault(); setError(''); setSending(true)
    try { await loginAdmin(code); navigate('/admin/productos', { replace:true }) }
    catch (err) {
      if (err.status === 401) setError('Código de acceso incorrecto.')
      else if (err.kind === 'network') setError('No se pudo conectar con la API. Verificá que el backend esté ejecutándose.')
      else setError(err.message || 'No se pudo iniciar sesión.')
    } finally { setSending(false) }
  }

  if (adminState === 'checking') return <div className="screen-loader">Validando sesión…</div>

  if (adminState === 'unavailable') return <section className="admin-login-page"><div className="admin-login-card"><BrandLogo/><div className="lock-circle"><LockKeyhole size={25}/></div><h1>Administración temporalmente no disponible</h1><p>{adminError || 'No pudimos validar la sesión con la API.'}</p><button className="btn btn-primary full-width" onClick={checkAdminSession}><RefreshCw size={17}/> Reintentar conexión</button></div></section>

  return <section className="admin-login-page"><div className="admin-login-card"><BrandLogo/><div className="lock-circle"><LockKeyhole size={25}/></div><span className="section-kicker">RC Repuestos y Accesorios</span><h1>Administración</h1><p>Ingresá el código administrativo configurado de forma segura en la API.</p>{adminError&&<small className="form-error">{adminError}</small>}<form onSubmit={submit}><label><span>Código de acceso</span><input type="password" autoComplete="current-password" value={code} onChange={e=>setCode(e.target.value)} placeholder="Código de acceso" required/></label>{error&&<small className="form-error">{error}</small>}<button className="btn btn-primary full-width" disabled={sending||!code.trim()}>{sending?'Ingresando…':'Ingresar'}</button></form></div></section>
}
