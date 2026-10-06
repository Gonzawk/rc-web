import {useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {Check,ChevronDown,History,PackagePlus,Plus,Search,Trash2} from 'lucide-react'
import {useAppData} from '../../context/AppDataContext'
import {money} from '../../utils/commerce'

const variantName=v=>[v.color,v.size,v.name].filter(Boolean).join(' · ')||'Referencia única'
const emptyRow=()=>({variantId:'',quantity:1,unitCost:0,search:'',open:false})

function VariantPicker({row,onChange,products}){
 const q=row.search.trim().toLowerCase()
 const options=useMemo(()=>products.flatMap(p=>(p.variants||[]).filter(v=>v.active!==false).map(v=>({product:p,variant:v}))).filter(x=>!q||`${x.product.name} ${x.product.brand||''} ${x.variant.sku||''} ${variantName(x.variant)}`.toLowerCase().includes(q)).slice(0,30),[products,q])
 const selected=products.flatMap(p=>(p.variants||[]).map(v=>({product:p,variant:v}))).find(x=>String(x.variant.id)===String(row.variantId))
 return <div className="purchase-product-picker">
   <div className={`purchase-search-control ${row.open?'open':''}`}><Search size={15}/><input value={row.open?row.search:(selected?`${selected.product.name} · ${variantName(selected.variant)} · ${selected.variant.sku}`:row.search)} onFocus={()=>onChange({open:true,search:selected?'':row.search})} onChange={e=>onChange({search:e.target.value,open:true})} placeholder="Buscar por producto, variante o SKU…"/><ChevronDown size={15}/></div>
   {row.open&&<div className="purchase-picker-results">{options.length?options.map(({product,variant})=><button type="button" key={variant.id} onMouseDown={e=>e.preventDefault()} onClick={()=>onChange({variantId:variant.id,unitCost:Number(variant.costPrice||0),search:'',open:false})}>
     <span className="purchase-picker-thumb">{variant.image||product.image?<img src={variant.image||product.image} alt=""/>:<PackagePlus size={17}/>}</span>
     <span><strong>{product.name}</strong><small>{variantName(variant)} · SKU {variant.sku}</small></span>
     <span className="purchase-picker-meta"><b>{money(variant.costPrice)}</b><small>Stock {variant.stock}</small></span>
   </button>):<div className="purchase-picker-empty">No encontramos referencias con esa búsqueda.</div>}</div>}
 </div>
}

export default function AdminPurchasesPage(){
 const{data,loading,registerPurchase}=useAppData()
 const[supplierId,setSupplierId]=useState('');const[invoice,setInvoice]=useState('');const[paymentMethod,setPaymentMethod]=useState('Transferencia');const[notes,setNotes]=useState('');const[rows,setRows]=useState([emptyRow()]);const[message,setMessage]=useState('');const[error,setError]=useState('');const[saving,setSaving]=useState(false);const[discountType,setDiscountType]=useState('none');const[discountValue,setDiscountValue]=useState(0)
 if(loading)return <div className="screen-loader">Cargando…</div>
 const suppliers=data.suppliers.filter(x=>x.active);const products=data.products.filter(x=>x.active)
 const grossTotal=rows.reduce((sum,r)=>sum+(Number(r.quantity)||0)*(Number(r.unitCost)||0),0)
 const discountAmount=discountType==='percent'?Math.min(grossTotal,grossTotal*Math.min(100,Number(discountValue)||0)/100):discountType==='amount'?Math.min(grossTotal,Number(discountValue)||0):0
 const total=grossTotal-discountAmount
 const update=(i,patch)=>setRows(current=>current.map((r,index)=>index===i?{...r,...patch}:r))
 const submit=async e=>{e.preventDefault();setError('');setMessage('');const supplier=suppliers.find(x=>String(x.id)===String(supplierId));const valid=rows.filter(r=>r.variantId&&Number(r.quantity)>0&&Number(r.unitCost)>0);if(!supplier){setError('Seleccioná un proveedor.');return}if(valid.length!==rows.length){setError('Cada renglón debe tener una variante, cantidad y costo mayor a cero.');return}if(new Set(valid.map(x=>x.variantId)).size!==valid.length){setError('La misma variante no puede repetirse en dos renglones.');return}setSaving(true);try{const result=await registerPurchase({supplierId:supplier.id,invoiceNumber:invoice,paymentMethod,notes,discountType,discountValue:Number(discountValue)||0,items:valid.map(r=>({variantId:r.variantId,quantity:Number(r.quantity),unitCost:Number(r.unitCost)}))});setMessage(`Compra ${result.number} registrada. El stock fue aplicado a cada variante seleccionada.`);setRows([emptyRow()]);setInvoice('');setNotes('');setDiscountType('none');setDiscountValue(0)}catch(err){setError(err?.message||'No se pudo registrar la compra.')}finally{setSaving(false)}}
 return <><div className="admin-page-header purchase-page-head"><div><span className="section-kicker">Abastecimiento</span><h1>Nueva compra</h1><p>Ingresá exactamente las referencias recibidas. Cada renglón actualiza stock, costo y pricing de la variante seleccionada.</p></div><Link className="btn btn-secondary" to="/admin/compras/historial"><History size={16}/> Historial de compras</Link></div>
 {message&&<div className="notice-success"><Check size={16}/>{message}</div>}{error&&<div className="notice-error">{error}</div>}
 <form className="admin-panel purchase-form purchase-form-v17" onSubmit={submit}>
  <div className="panel-title-row"><div><h2>Datos de la compra</h2><p>La confirmación genera el movimiento de stock y el egreso asociado.</p></div><PackagePlus size={22}/></div>
  <div className="purchase-header-grid"><label><span>Proveedor *</span><select required value={supplierId} onChange={e=>setSupplierId(e.target.value)}><option value="">Seleccionar…</option>{suppliers.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label><label><span>Comprobante</span><input value={invoice} onChange={e=>setInvoice(e.target.value)} placeholder="FC-A 0001-000123"/></label><label><span>Medio de pago</span><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option>Efectivo</option><option>Transferencia</option><option>Mercado Pago</option><option>Tarjeta / banco</option><option>Otro</option></select></label></div>
  <section className="purchase-items-section"><div className="purchase-section-title"><div><h3>Productos recibidos</h3><p>Buscá el producto y elegí la variante exacta por color, talle, presentación o SKU.</p></div><button type="button" className="inline-add" onClick={()=>setRows(v=>[...v,emptyRow()])}><Plus size={15}/> Agregar referencia</button></div>
   <div className="purchase-lines-v17">{rows.map((r,i)=>{const found=products.flatMap(p=>(p.variants||[]).map(v=>({p,v}))).find(x=>String(x.v.id)===String(r.variantId));return <article className="purchase-line-v17" key={i}>
    <div className="purchase-line-number">{i+1}</div><VariantPicker row={r} products={products} onChange={patch=>update(i,patch)}/>
    <label><span>Cantidad *</span><input type="number" min="0.001" step="0.001" value={r.quantity} onChange={e=>update(i,{quantity:e.target.value})}/></label>
    <label><span>Costo lista unit. *</span><input type="number" min="0.01" step="0.01" value={r.unitCost} onChange={e=>update(i,{unitCost:e.target.value})}/></label>
    <div className="purchase-line-summary"><span>Subtotal</span><strong>{money((Number(r.quantity)||0)*(Number(r.unitCost)||0))}</strong>{found&&<small>Stock actual: {found.v.stock}</small>}</div>
    <button type="button" className="purchase-remove" disabled={rows.length===1} onClick={()=>setRows(v=>v.length===1?v:v.filter((_,idx)=>idx!==i))}><Trash2 size={16}/></button>
   </article>})}</div>
  </section>
  <div className="purchase-bottom-grid"><div><div className="discount-box"><label><span>Descuento de compra</span><select value={discountType} onChange={e=>setDiscountType(e.target.value)}><option value="none">Sin descuento</option><option value="percent">Por porcentaje (%)</option><option value="amount">Por monto ($)</option></select></label>{discountType!=='none'&&<label><span>{discountType==='percent'?'Porcentaje':'Monto'}</span><input type="number" min="0" max={discountType==='percent'?100:undefined} value={discountValue} onChange={e=>setDiscountValue(e.target.value)}/></label>}</div><label className="purchase-notes"><span>Notas</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observaciones internas de la compra…"/></label></div>
   <aside className="purchase-totals-card"><span>Subtotal <b>{money(grossTotal)}</b></span>{discountAmount>0&&<span>Descuento <b>- {money(discountAmount)}</b></span>}<div><small>Costo neto de compra</small><strong>{money(total)}</strong></div><button disabled={saving||!rows.length} className="btn btn-primary full-width">{saving?'Registrando…':'Confirmar compra y actualizar stock'}</button></aside>
  </div>
 </form></>
}