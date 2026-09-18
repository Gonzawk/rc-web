import { Link,useParams } from 'react-router-dom'
import { CheckCircle2,Clock3,MapPin,PackageCheck,Store,Truck } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { orderStatusLabel } from '../utils/orderWorkflow'

const stepsFor=order=>order.deliveryType==='shipping'
  ? [
      {key:'received',label:'Pedido recibido'},
      {key:'confirmed',label:'Disponibilidad confirmada'},
      {key:'pending_shipment',label:'Pendiente de envío'},
      {key:'shipped',label:'Enviado / en camino'},
      {key:'completed',label:'Completado'}
    ]
  : [
      {key:'received',label:'Pedido recibido'},
      {key:'confirmed',label:'Disponibilidad confirmada'},
      {key:'ready_for_pickup',label:'Listo para retirar'},
      {key:'completed',label:'Completado'}
    ]

const reached=(order,key)=>{
  if(order.status===key)return true
  const history=(order.statusHistory||[]).map(x=>x.status)
  if(history.includes(key))return true
  if(key==='confirmed'&&['awaiting_payment','pending_shipment','ready_for_pickup','shipped','completed'].includes(order.status))return true
  if(key==='pending_shipment'&&['shipped','completed'].includes(order.status))return true
  if(key==='ready_for_pickup'&&order.status==='completed')return true
  if(key==='shipped'&&order.status==='completed'&&order.deliveryType==='shipping')return true
  return false
}

export default function OrderStatusPage(){
 const {trackingCode}=useParams(); const {data,loading}=useAppData()
 if(loading)return <div className="screen-loader">Consultando pedido…</div>
 const normalized=decodeURIComponent(trackingCode||'').toUpperCase()
 const o=(data.orders||[]).find(x=>(x.trackingCode||'').toUpperCase()===normalized)
 if(!o)return <section className="tracking-page page-section"><div className="container tracking-shell"><div className="tracking-search-card"><h1>Seguimiento no encontrado</h1><p>Revisá el código recibido e intentá nuevamente.</p><Link className="btn btn-primary" to="/seguimiento">Consultar otro código</Link></div></div></section>
 const destination=o.deliveryType==='shipping'
   ? [o.shippingAddress?.city,o.shippingAddress?.province].filter(Boolean).join(', ')||'Envío a domicilio'
   : 'Retiro en RC Repuestos y Accesorios'
 const steps=stepsFor(o)
 return <section className="tracking-page page-section"><div className="container tracking-shell"><div className="tracking-result-card">
   <div className="tracking-result-head"><div><span className="section-kicker">Seguimiento de pedido</span><h1>{o.trackingCode}</h1></div><span className={`tracking-status-pill status-${o.status}`}>{orderStatusLabel[o.status]||o.status}</span></div>
   <div className="tracking-summary-grid">
     <article><PackageCheck/><div><small>Estado actual</small><strong>{orderStatusLabel[o.status]||o.status}</strong></div></article>
     <article>{o.deliveryType==='shipping'?<Truck/>:<Store/>}<div><small>Destino</small><strong>{destination}</strong></div></article>
   </div>
   <div className="tracking-timeline">{steps.map(step=>{const done=reached(o,step.key);const current=o.status===step.key;return <div key={step.key} className={`tracking-step ${done?'done':''} ${current?'current':''}`}><span className="tracking-step-dot">{done?<CheckCircle2 size={18}/>:<Clock3 size={16}/>}</span><div><strong>{step.label}</strong>{current&&<small>Estado actual</small>}</div></div>})}</div>
   {o.deliveryType==='shipping'&&<div className="tracking-destination-note"><MapPin size={18}/><span>Destino registrado: <strong>{destination}</strong>. Por privacidad, no mostramos la dirección completa en el seguimiento público.</span></div>}
   <div className="tracking-actions"><Link className="btn btn-secondary" to="/seguimiento">Consultar otro pedido</Link><Link className="btn btn-primary" to="/">Volver al inicio</Link></div>
 </div></div></section>
}
