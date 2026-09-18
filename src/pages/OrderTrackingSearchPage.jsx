import { useState } from 'react'
import { Search, ShieldCheck, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export default function OrderTrackingSearchPage(){
  const [code,setCode]=useState('')
  const [error,setError]=useState('')
  const navigate=useNavigate()
  const {data,loading}=useAppData()
  const submit=e=>{
    e.preventDefault(); setError('')
    const normalized=code.trim().toUpperCase()
    if(!normalized)return setError('Ingresá tu código de seguimiento.')
    const order=(data?.orders||[]).find(x=>(x.trackingCode||'').toUpperCase()===normalized)
    if(!order)return setError('No encontramos un pedido con ese código de seguimiento.')
    navigate(`/seguimiento/${encodeURIComponent(order.trackingCode)}`)
  }
  return <section className="tracking-page page-section"><div className="container tracking-shell">
    <div className="tracking-search-card">
      <div className="tracking-icon"><Truck/></div>
      <span className="section-kicker">RC Repuestos y Accesorios</span>
      <h1>Seguimiento de pedido</h1>
      <p>Ingresá el código de seguimiento que te enviamos para consultar el estado actual de tu pedido.</p>
      <form onSubmit={submit} className="tracking-form">
        <label htmlFor="tracking-code">Código de seguimiento</label>
        <div className="tracking-input-wrap"><Search size={20}/><input id="tracking-code" autoComplete="off" spellCheck="false" placeholder="Ej: RC-7K4M-92QX" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} disabled={loading}/></div>
        {error&&<div className="tracking-error">{error}</div>}
        <button className="btn btn-primary" disabled={loading}>Consultar estado</button>
      </form>
      <div className="tracking-privacy"><ShieldCheck size={18}/><span>La consulta pública muestra únicamente el estado y el destino general del pedido.</span></div>
    </div>
  </div></section>
}
