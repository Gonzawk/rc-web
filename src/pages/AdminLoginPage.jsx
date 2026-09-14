import { useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const CODE = '2468'

export default function AdminLoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = e => {
    e.preventDefault()
    if (code === CODE) {
      sessionStorage.setItem('rc-repuestos-y-accesorios-admin', '1')
      navigate('/admin/dashboard')
    } else setError('Código incorrecto. Para la presentación utilizá 2468.')
  }

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <BrandLogo/>
        <div className="lock-circle"><LockKeyhole size={25}/></div>
        <span className="section-kicker">RC Repuestos y Accesorios</span>
        <h1>Administración</h1>
        <p>Gestión integral de productos, compras, stock, pedidos, ventas, caja y contenido web.</p>
        <form onSubmit={submit}>
          <label><span>Código de acceso</span><input value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" placeholder="Ingresá el código"/></label>
          {error && <small className="form-error">{error}</small>}
          <button className="btn btn-primary full-width">Ingresar</button>
        </form>
        <small className="demo-hint">Código de presentación: 2468</small>
      </div>
    </section>
  )
}
