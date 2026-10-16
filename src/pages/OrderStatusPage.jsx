import BankTransferDetails from '../components/BankTransferDetails'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock3, MapPin, PackageCheck, Store, Truck, CreditCard, RefreshCw } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { operationsRepository as ops } from '../repositories/operationsRepository'
import { orderStatusLabel } from '../utils/orderWorkflow'
import { money } from '../utils/commerce'

const status = { 1:'received',2:'confirmed',3:'awaiting_payment',4:'ready_for_pickup',5:'pending_shipment',6:'shipped',7:'completed',8:'cancelled' }
const delivery = { 1:'pickup',2:'shipping' }
const paymentNames = { 1:'Pendiente',2:'Esperando transferencia',3:'Aprobado',4:'Rechazado',5:'Reintegrado',6:'Cancelado' }
const stepsFor = o => o.deliveryType === 'shipping'
  ? [{key:'received',label:'Pedido recibido'},{key:'confirmed',label:'Disponibilidad confirmada'},{key:'pending_shipment',label:'Pendiente de envío'},{key:'shipped',label:'Enviado / en camino'},{key:'completed',label:'Completado'}]
  : [{key:'received',label:'Pedido recibido'},{key:'confirmed',label:'Disponibilidad confirmada'},{key:'ready_for_pickup',label:'Listo para retirar'},{key:'completed',label:'Completado'}]
const reached = (o,key) => o.status === key || o.statusHistory.some(x => x.status === key) ||
  (key === 'confirmed' && ['awaiting_payment','pending_shipment','ready_for_pickup','shipped','completed'].includes(o.status)) ||
  (key === 'pending_shipment' && ['shipped','completed'].includes(o.status)) ||
  (key === 'ready_for_pickup' && o.status === 'completed') ||
  (key === 'shipped' && o.status === 'completed' && o.deliveryType === 'shipping')
const validCheckoutUrl = value => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' &&
      ['mercadopago.com','mercadopago.com.ar'].some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))
  } catch { return false }
}
const toOrder = x => ({
  trackingCode: x.trackingCode,
  number: x.numero,
  status: status[x.estado] || 'received',
  paymentStatus: Number(x.estadoPago),
  paymentMethod: Number(x.metodoPago),
  total: Number(x.totalProductos),
  mercadoPago: x.mercadoPago || null,
  pagoVenceEn: x.pagoVenceEn || x.mercadoPago?.pagoVenceEn || null,
  devolucion: x.devolucion || null,
  transferenciaDatos: x.transferenciaDatos || null,
  deliveryType: delivery[x.tipoEntrega] || 'pickup',
  destination: x.destino ? [x.destino.ciudad,x.destino.provincia].filter(Boolean).join(', ') : 'Retiro en RC Repuestos y Accesorios',
  statusHistory: (x.historial || []).map(h => ({status:status[h.estadoNuevo] || 'received',at:h.creadoEn}))
})

export default function OrderStatusPage() {
  const { trackingCode } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  // El proveedor adjunta parámetros de navegación, nunca una confirmación de pago.
  // Guardamos el resultado de retorno antes de limpiar la URL pública.
  const [providerReturn] = useState(() => {
    const p = new URLSearchParams(window.location.search)
    const keys = ['payment_id','collection_id','collection_status','status','merchant_order_id','preference_id']
    if (!keys.some(k => p.has(k))) return null
    const raw = (p.get('collection_status') || p.get('status') || '').toLowerCase()
    const hasPaymentId = !![p.get('payment_id'), p.get('collection_id')].find(v => v && v !== 'null')
    return { kind: ['rejected','cancelled','failure'].includes(raw) ? 'rejected' :
      ['approved','accredited'].includes(raw) ? 'approved' :
      ['pending','in_process','in_mediation','authorized'].includes(raw) ? 'pending' :
      !hasPaymentId ? 'abandoned' : 'unknown' }
  })
  useEffect(() => {
    if (!providerReturn) return
    const cleaned = new URLSearchParams(searchParams)
    for (const key of ['payment_id','collection_id','collection_status','status','merchant_order_id','preference_id','external_reference','payment_type','site_id','processing_mode','merchant_account_id']) cleaned.delete(key)
    setSearchParams(cleaned, { replace: true })
  }, [providerReturn, searchParams, setSearchParams])
  const { trackOrder } = useAppData()
  const [bank,setBank] = useState(null)
  useEffect(()=>{let active=true;ops.bankTransferPublic().then(x=>{if(active)setBank(x)}).catch(()=>{if(active)setBank({enabled:false})});return()=>{active=false}},[])
  const [order,setOrder] = useState(null)
  const [loading,setLoading] = useState(true)
  const [refreshing,setRefreshing] = useState(false)
  const [paying,setPaying] = useState(false)
  const [error,setError] = useState('')
  const code = trackingCode || ''
  const refresh = useCallback(async () => {
    const result = await trackOrder(code)
    const mapped = toOrder(result)
    setOrder(mapped)
    return mapped
  },[code,trackOrder])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    trackOrder(code).then(x => { if (active) setOrder(toOrder(x)) })
      .catch(() => { if (active) { setOrder(null); setError('No pudimos consultar el pedido. Revisá el código o reintentá.') } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  },[code,trackOrder])

  // Al volver de Mercado Pago, actualizar temporalmente sin confiar en sus query params.
  const fromProvider = providerReturn !== null
  useEffect(() => {
    if (!fromProvider || !order || order.paymentStatus === 3) return
    let count = 0
    const timer = setInterval(() => {
      if (++count > 6) { clearInterval(timer); return }
      refresh().then(x => { if (x.paymentStatus === 3) clearInterval(timer) }).catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  },[fromProvider,order?.trackingCode,order?.paymentStatus,refresh])

  const refreshNow = async () => {
    if (refreshing) return
    setRefreshing(true); setError('')
    try { await refresh() } catch(e) { setError(e.message || 'No pudimos actualizar el estado.') }
    finally { setRefreshing(false) }
  }
  const pay = async () => {
    if (paying || !order?.mercadoPago?.puedeIniciarPago) return
    if (order.mercadoPago.reintentarDespuesDe && new Date(order.mercadoPago.reintentarDespuesDe).getTime() > Date.now()) {
      setError('El inicio del pago está en proceso. Esperá unos instantes y actualizá el estado.')
      return
    }
    setPaying(true); setError('')
    try {
      // Verificar nuevamente antes de solicitar una preferencia para evitar cobros repetidos.
      const current = await refresh()
      if (!current.mercadoPago?.puedeIniciarPago) { setError('Este pedido ya no admite iniciar un pago.'); return }
      const preference = await ops.createMercadoPagoPreference(code)
      if (!validCheckoutUrl(preference?.checkoutUrl)) throw new Error('Mercado Pago devolvió un enlace inválido.')
      window.location.assign(preference.checkoutUrl)
    } catch(e) {
      setError(e.message || 'No pudimos iniciar el pago. Tu pedido sigue registrado y podés reintentar desde aquí.')
      try { await refresh() } catch { /* conservar el error original */ }
    } finally { setPaying(false) }
  }

  if (loading) return <div className="screen-loader">Consultando pedido…</div>
  if (!order) return <section className="tracking-page page-section"><div className="container tracking-shell"><div className="tracking-search-card"><h1>No pudimos mostrar el seguimiento</h1><p>{error || 'Revisá el código recibido e intentá nuevamente.'}</p><button type="button" className="btn btn-secondary" onClick={refreshNow} disabled={refreshing}>{refreshing?'Consultando…':'Reintentar consulta'}</button> <Link className="btn btn-primary" to="/seguimiento">Consultar otro código</Link></div></div></section>

  const o = order
  const steps = stepsFor(o)
  const canPay = o.paymentMethod === 3 && o.mercadoPago?.puedeIniciarPago === true
  const waitUntil = o.mercadoPago?.reintentarDespuesDe
  const waiting = waitUntil && new Date(waitUntil).getTime() > Date.now()
  return <section className="tracking-page page-section"><div className="container tracking-shell"><div className="tracking-result-card">
    <div className="tracking-result-head"><div className="tracking-code-block"><span className="section-kicker">Seguimiento de pedido</span><h1 className="tracking-code-text" title={o.trackingCode}>{o.trackingCode}</h1>{o.number && <p>{o.number}</p>}</div><span className={`tracking-status-pill status-${o.status}`}>{orderStatusLabel[o.status] || o.status}</span></div>
    {providerReturn && o.paymentMethod === 3 && <div className="payment-demo-note" role="status" style={{marginTop:18}}>
      <strong>{o.paymentStatus === 3 ? 'Pago aprobado y confirmado' : providerReturn.kind === 'rejected' ? 'El intento de pago fue rechazado o cancelado' : providerReturn.kind === 'abandoned' ? 'Volviste sin completar el pago' : 'Estamos verificando el resultado de Mercado Pago'}</strong>
      <p>{o.paymentStatus === 3 ? 'Mercado Pago confirmó la operación y el pedido continúa normalmente.' : providerReturn.kind === 'rejected' ? 'El intento no fue aprobado. Tu pedido conserva su estado actual; si sigue vigente, podés volver a intentar desde esta página.' : providerReturn.kind === 'abandoned' ? 'No recibimos confirmación de un pago. Podés continuar con el seguimiento y, si el plazo sigue vigente, intentar nuevamente.' : 'No damos por aprobado ningún pago basándonos en la dirección de regreso. Consultamos el estado real del pedido en el servidor.'}</p>
      <Link className="btn btn-secondary" to="/">Volver a la tienda</Link>
    </div>}
    <div className="tracking-summary-grid">
      <article><PackageCheck/><div><small>Estado actual</small><strong>{orderStatusLabel[o.status] || o.status}</strong></div></article>
      <article>{o.deliveryType === 'shipping'?<Truck/>:<Store/>}<div><small>Destino</small><strong>{o.destination}</strong></div></article>
    </div>
    <div className="tracking-summary-grid" style={{marginTop:16}}>
      <article><CreditCard/><div><small>Estado del pago</small><strong>{paymentNames[o.paymentStatus] || 'Sin confirmar'}</strong></div></article>
      <article><CreditCard/><div><small>Medio de pago</small><strong>{o.paymentMethod === 3 ? 'Mercado Pago' : o.paymentMethod === 2 ? 'Transferencia' : 'Efectivo'}</strong>{Number.isFinite(o.total) && <small>Total productos: {money(o.total)}</small>}</div></article>
    </div>
    {o.status !== 'cancelled' && o.paymentStatus !== 3 && o.paymentStatus !== 5 && o.paymentStatus !== 6 && o.pagoVenceEn && <div className="payment-demo-note" role="status" style={{marginTop:20}}><strong>Plazo para acreditar el pago: 24 horas</strong><p>Este pedido vence el <strong>{new Date(o.pagoVenceEn).toLocaleString('es-AR')}</strong> si el pago no fue aprobado y registrado. Una vez vencido, el stock reservado se libera y deberás crear un pedido nuevo.</p>{o.paymentMethod !== 3 && <p>Para {o.paymentMethod === 2 ? 'transferencia' : 'efectivo'}, el administrador debe verificar y registrar el cobro dentro de las 24 horas.</p>}{o.mercadoPago?.plazoVencido && <p>El plazo ya terminó. No se admiten nuevos intentos de pago para este pedido.</p>}</div>}
    {o.paymentMethod === 2 && o.paymentStatus !== 3 && o.status !== 'cancelled' && <div className="payment-demo-note" style={{marginTop:20}}><h3>Datos para transferencia</h3><BankTransferDetails settings={o.transferenciaDatos || bank}/><p>Transferí el importe de productos indicado. El envío, si corresponde, se coordina aparte. La acreditación debe ser verificada por el comercio; no se confirma automáticamente.</p></div>}
    {o.status === 'cancelled' && <div className="payment-demo-note" role="status" style={{marginTop:20}}><strong>Pedido vencido</strong><p>El plazo de 24 horas finalizó y el stock reservado fue liberado. Para comprar estos productos, realizá un pedido nuevo.</p>{o.devolucion?.estado === 'reintegrado' ? <p>Mercado Pago confirmó el reintegro al medio de pago original. La acreditación puede depender de los plazos del proveedor o entidad emisora.</p> : o.devolucion?.estado === 'en_proceso' ? <p>Se detectó un pago posterior al vencimiento. Estamos verificando y gestionando su devolución. Actualizá este seguimiento para conocer el resultado.</p> : null}</div>}
    {o.paymentMethod === 3 && <div className="payment-demo-note" style={{marginTop:20}}>
      <strong>{o.paymentStatus === 3 ? 'Pago acreditado' : o.paymentStatus === 4 ? 'Pago rechazado' : 'Pago pendiente de confirmación'}</strong>
      <p>{o.paymentStatus === 3 ? 'El pago fue confirmado por el sistema.' : 'La confirmación depende de Mercado Pago y puede demorar unos instantes. Volvé a consultar antes de realizar otro intento.'}</p>

      {canPay && <button type="button" className="btn btn-primary" disabled={paying || waiting} onClick={pay}>{paying ? 'Preparando pago…' : waiting ? 'Preparando el pago, esperá…' : o.mercadoPago?.estadoInicio === 'sin_iniciar' ? 'Pagar con Mercado Pago' : 'Ir a Mercado Pago / Reintentar pago'}</button>}
      {waiting && <p>Podrás reintentar después de {new Date(waitUntil).toLocaleTimeString('es-AR')}.</p>}

    </div>}
    {error && <div role="alert" className="admin-inline-message" style={{marginTop:16}}>{error}</div>}
    <div className="tracking-timeline">{steps.map(step => {const done = reached(o,step.key);const current = o.status === step.key;return <div key={step.key} className={`tracking-step ${done?'done':''} ${current?'current':''}`}><span className="tracking-step-dot">{done?<CheckCircle2 size={18}/>:<Clock3 size={16}/>}</span><div><strong>{step.label}</strong>{current&&<small>Estado actual</small>}</div></div>})}</div>
    {o.deliveryType === 'shipping' && <div className="tracking-destination-note"><MapPin size={18}/><span>Destino registrado: <strong>{o.destination}</strong>. Por privacidad, no mostramos la dirección completa.</span></div>}
    <div className="tracking-actions"><button type="button" className="btn btn-secondary" disabled={refreshing} onClick={refreshNow}><RefreshCw size={16}/>{refreshing?' Actualizando…':' Actualizar estado'}</button><Link className="btn btn-secondary" to="/seguimiento">Consultar otro pedido</Link><Link className="btn btn-primary" to="/">Volver al inicio</Link></div>
  </div></div></section>
}
