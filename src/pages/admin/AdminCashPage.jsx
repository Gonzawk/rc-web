import { useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Banknote, CircleDollarSign, Plus, Search, WalletCards, X } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { dateTime, money } from '../../utils/commerce'
import { cashCategoryLabel, cashSummary, signedCashAmount } from '../../utils/cash'

const PERIODS = { 7:7, 30:30, 90:90, all:null }
const paymentOptions = ['Efectivo','Transferencia','Mercado Pago','Tarjeta / banco','Otro']

export default function AdminCashPage(){
  const {data,loading,registerCashMovement}=useAppData()
  const [period,setPeriod]=useState('30')
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('all')
  const [modal,setModal]=useState(false)
  const [movementType,setMovementType]=useState('capital_deposit')
  const [form,setForm]=useState({amount:'',paymentMethod:'Efectivo',concept:'',notes:''})
  const [message,setMessage]=useState('')
  if(loading)return <div className="screen-loader">Cargando caja…</div>

  const all=[...(data.cashMovements||[])].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
  const totalSummary=cashSummary(all)
  const days=PERIODS[period]
  const cutoff=days?new Date(Date.now()-days*86400000):null
  const periodRows=all.filter(m=>!cutoff||new Date(m.createdAt)>=cutoff)
  const periodSummary=cashSummary(periodRows)
  const visible=periodRows.filter(m=>{
    const text=`${m.reference||''} ${m.concept||''} ${m.notes||''} ${m.paymentMethod||''}`.toLowerCase()
    return (category==='all'||m.category===category)&&(!query||text.includes(query.toLowerCase()))
  })
  const byMethod=all.reduce((acc,m)=>{acc[m.paymentMethod||'Otro']=(acc[m.paymentMethod||'Otro']||0)+signedCashAmount(m);return acc},{})

  const open=()=>{setModal(true);setMovementType('capital_deposit');setMessage('');setForm({amount:'',paymentMethod:'Efectivo',concept:'',notes:''})}
  const submit=async e=>{
    e.preventDefault(); const amount=Number(form.amount)||0; if(amount<=0)return
    const labels={capital_deposit:'Ingreso de fondos',owner_withdrawal:'Retiro de fondos',manual_income:'Otro ingreso',manual_expense:'Otro egreso'}
    const movement=await registerCashMovement({category:movementType,amount,paymentMethod:form.paymentMethod,concept:form.concept||labels[movementType],notes:form.notes})
    setModal(false);setMessage(`${movement.reference} registrado correctamente en Caja.`)
  }

  return <>
    <div className="admin-page-header compact-page-header"><div><span className="section-kicker">Tesorería</span><h1>Caja general</h1><p>Trazabilidad unificada para ventas, compras, ingresos de fondos y retiros de RC Repuestos y Accesorios.</p></div><div className="cash-header-actions"><button className="btn btn-primary" onClick={open}><Plus size={17}/> Movimiento manual</button></div></div>
    {message&&<div className="notice-success">{message}</div>}

    <section className="cash-balance-hero admin-panel"><div><span>Saldo actual de caja</span><strong>{money(totalSummary.balance)}</strong><small>Incluye todos los ingresos y egresos registrados históricamente.</small></div><WalletCards size={34}/></section>

    <div className="cash-kpi-grid">
      <article><ArrowUpCircle/><div><span>Ingresos operativos · período</span><strong>{money(periodSummary.operationalIncome)}</strong><small>Ventas + otros ingresos</small></div></article>
      <article><ArrowDownCircle/><div><span>Egresos operativos · período</span><strong>{money(periodSummary.operationalExpense)}</strong><small>Compras + otros egresos</small></div></article>
      <article><CircleDollarSign/><div><span>Resultado de caja operativo</span><strong className={periodSummary.operatingCashResult>=0?'profit-text':'danger-text'}>{money(periodSummary.operatingCashResult)}</strong><small>No equivale a utilidad contable.</small></div></article>
      <article><Banknote/><div><span>Movimientos de capital</span><strong>{money(periodSummary.deposits-periodSummary.withdrawals)}</strong><small>Ingresos de fondos − retiros</small></div></article>
    </div>

    <section className="admin-panel cash-account-panel"><div className="panel-title-row"><div><h2>Saldo por medio / cuenta</h2><p>Vista operativa para saber dónde está distribuido el dinero registrado.</p></div></div><div className="cash-method-grid">{Object.entries(byMethod).map(([name,value])=><div key={name}><span>{name}</span><strong>{money(value)}</strong></div>)}</div></section>

    <section className="admin-panel"><div className="cash-toolbar"><div><h2>Movimientos</h2><p>Ventas y compras generan movimientos automáticos. Las correcciones deben asentarse como movimientos manuales compensatorios.</p></div><div className="cash-periods">{[['7','7 días'],['30','30 días'],['90','90 días'],['all','Todo']].map(([v,l])=><button key={v} className={period===v?'active':''} onClick={()=>setPeriod(v)}>{l}</button>)}</div></div><div className="list-toolbar cash-filter-toolbar"><label className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar concepto, referencia o medio…"/></label><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Todos los movimientos</option><option value="product_sale">Ventas</option><option value="purchase">Compras</option><option value="capital_deposit">Ingresos de fondos</option><option value="owner_withdrawal">Retiros</option><option value="manual_income">Otros ingresos</option><option value="manual_expense">Otros egresos</option></select></div>
      <div className="cash-movement-list">{visible.map(m=><article key={m.id}><div className={`cash-direction ${m.direction}`}>{m.direction==='in'?<ArrowUpCircle/>:<ArrowDownCircle/>}</div><div className="cash-movement-main"><div><strong>{m.concept}</strong><span className="status-pill neutral">{cashCategoryLabel(m.category)}</span></div><small>{dateTime(m.createdAt)} · {m.reference||'Sin referencia'} · {m.paymentMethod}</small>{m.notes&&<p>{m.notes}</p>}</div><strong className={m.direction==='in'?'cash-in':'cash-out'}>{m.direction==='in'?'+':'−'} {money(m.amount)}</strong></article>)}{!visible.length&&<div className="empty-agenda">No hay movimientos para los filtros seleccionados.</div>}</div>
    </section>

    {modal&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><div className="modal cash-modal"><button className="modal-close" onClick={()=>setModal(false)}><X size={18}/></button><span className="section-kicker">Caja general</span><h2>Registrar movimiento manual</h2><p className="modal-subtitle">El movimiento quedará asentado en el historial y modificará el saldo inmediatamente.</p><form className="editor-form" onSubmit={submit}>
      <label><span>Tipo de movimiento</span><select value={movementType} onChange={e=>setMovementType(e.target.value)}><option value="capital_deposit">Ingresar fondos / saldo</option><option value="owner_withdrawal">Retirar fondos</option><option value="manual_income">Otro ingreso operativo</option><option value="manual_expense">Otro egreso operativo</option></select></label>
      <div className="form-grid"><label><span>Monto</span><input required type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label><span>Medio / cuenta</span><select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})}>{paymentOptions.map(x=><option key={x}>{x}</option>)}</select></label></div>
      <label><span>Concepto</span><input value={form.concept} onChange={e=>setForm({...form,concept:e.target.value})} placeholder="Descripción clara del movimiento"/></label><label><span>Notas</span><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Motivo, referencia u observación…"/></label><button className="btn btn-primary full-width">Confirmar movimiento</button>
    </form></div></div>}
  </>
}
