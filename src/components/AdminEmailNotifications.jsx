import { useEffect, useState } from 'react'
import { apiFetch } from '../api/apiClient'
export default function AdminEmailNotifications() {
  const [form,setForm]=useState({enabled:false,orderEmail:''})
  const [busy,setBusy]=useState(false)
  const [status,setStatus]=useState('')
  const [history,setHistory]=useState([])
  useEffect(()=>{let mounted=true; Promise.all([
    apiFetch('/api/admin/notificaciones/configuracion'),
    apiFetch('/api/admin/notificaciones/historial')
  ]).then(([cfg,items])=>{if(mounted){setForm(cfg);setHistory(items)}})
    .catch(e=>{if(mounted)setStatus(e.message||'No se pudo cargar la configuración')});return()=>{mounted=false}},[])
  const save=async()=>{setBusy(true);setStatus('');try{const cfg=await apiFetch('/api/admin/notificaciones/configuracion',{method:'PUT',body:JSON.stringify(form)});setForm(cfg);setStatus('Configuración guardada')}catch(e){setStatus(e.message||'No se pudo guardar')}finally{setBusy(false)}}
  return <section className="settings-section">
    <h2>Correos transaccionales · Brevo</h2>
    <p className="settings-help">Los avisos se generan desde el backend. La clave de Brevo se configura solamente en User Secrets o en el VPS.</p>
    <label><span>Email que recibe los pedidos</span><input type="email" value={form.orderEmail||''} onChange={e=>setForm({...form,orderEmail:e.target.value})} placeholder="pedidos@tudominio.com"/></label>
    <label><input type="checkbox" checked={!!form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})}/> Habilitar notificaciones de pedidos</label>
    <div><button className="btn btn-secondary" type="button" disabled={busy} onClick={save}>{busy?'Guardando…':'Guardar notificaciones'}</button></div>
    {status&&<p role="status">{status}</p>}
    <h3>Últimos envíos</h3>
    <div style={{overflowX:'auto'}}><table style={{width:'100%'}}><thead><tr><th>Evento</th><th>Destinatario</th><th>Estado</th><th>Intentos</th></tr></thead><tbody>{history.slice(0,15).map(x=><tr key={x.id}><td>{x.evento}</td><td>{x.destinatario}</td><td>{x.estado}</td><td>{x.intentos}</td></tr>)}</tbody></table></div>
  </section>
}
