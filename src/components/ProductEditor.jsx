import { useEffect, useMemo, useState } from 'react'
import { Calculator, X } from 'lucide-react'
import { calculatePriceBreakdown, money } from '../utils/commerce'

const empty = { id:0, sku:'', oemCode:'', name:'', brand:'', supplier:'', category:'', subcategory:'', price:0, costPrice:0, stock:0, minStock:3, trackStock:true, autoPrice:true, productMarkupPercent:10, pricingRules:[], size:'Unidad', compatibility:'', active:true, featured:false, image:'', description:'' }

export default function ProductEditor({ product, data, onClose, onSave }) {
  const defaults = { ...empty, brand:data.brands.find(x=>x.active)?.name || '', supplier:data.suppliers?.find(x=>x.active)?.name || '', category:data.productCategories.find(x=>x.active)?.name || '' }
  const inferMarkup = p => Number(p?.productMarkupPercent ?? p?.pricingRules?.find(r=>r.name==='Producto')?.percent ?? 10)
  const [form, setForm] = useState(product ? { ...defaults, ...product, productMarkupPercent:inferMarkup(product) } : defaults)
  useEffect(() => setForm(product ? { ...defaults, ...product, productMarkupPercent:inferMarkup(product) } : defaults), [product])

  const subs = useMemo(() => data.productCategories.find(x=>x.name===form.category)?.subcategories.filter(x=>x.active) || [], [data.productCategories, form.category])
  useEffect(() => { if (!subs.some(x=>x.name===form.subcategory)) setForm(current=>({ ...current, subcategory:subs[0]?.name || '' })) }, [form.category])
  const brand = data.brands.find(x=>x.name===form.brand)
  const supplier = (data.suppliers||[]).find(x=>x.name===form.supplier)
  const rules = [
    {id:1,name:`Proveedor · ${supplier?.name||'Sin proveedor'}`,percent:Number(supplier?.defaultMarkupPercent||0)},
    {id:2,name:`Marca · ${brand?.name||'Sin marca'}`,percent:Number(brand?.defaultMarkupPercent||0)},
    {id:3,name:'Producto',percent:Number(form.productMarkupPercent||0)}
  ]
  const priceBreakdown = calculatePriceBreakdown(form.costPrice, rules, data.settings?.priceRoundingStep || 500, data.settings?.priceRoundingMode || 'up')
  const suggested = priceBreakdown.roundedPrice

  const submit = e => {
    e.preventDefault()
    onSave({ ...form, costPrice:Number(form.costPrice), price:form.autoPrice?suggested:Number(form.price), stock:Number(form.stock), minStock:Number(form.minStock), productMarkupPercent:Number(form.productMarkupPercent), pricingRules:rules })
  }

  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal modal-wide">
    <button className="modal-close" onClick={onClose}><X size={20}/></button><span className="section-kicker">{form.id?'Editar':'Nuevo'} producto</span><h2>{form.id?form.name:'Crear repuesto'}</h2>
    <form className="editor-form" onSubmit={submit}>
      <label><span>Nombre del repuesto</span><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <div className="form-grid"><label><span>Marca</span><select value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}>{data.brands.filter(x=>x.active).map(x=><option key={x.id}>{x.name}</option>)}</select></label><label><span>Proveedor habitual</span><select value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})}>{(data.suppliers||[]).filter(x=>x.active).map(x=><option key={x.id}>{x.name}</option>)}</select></label></div>
      <div className="form-grid"><label><span>SKU interno</span><input required value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></label><label><span>Código OEM / referencia</span><input value={form.oemCode||''} onChange={e=>setForm({...form,oemCode:e.target.value})}/></label></div>
      <div className="form-grid"><label><span>Categoría</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{data.productCategories.filter(x=>x.active).map(x=><option key={x.id}>{x.name}</option>)}</select></label><label><span>Subcategoría</span><select value={form.subcategory} onChange={e=>setForm({...form,subcategory:e.target.value})}>{subs.map(x=><option key={x.id}>{x.name}</option>)}</select></label></div>
      <label><span>Compatibilidad / aplicación</span><input value={form.compatibility||''} onChange={e=>setForm({...form,compatibility:e.target.value})} placeholder="Ej. Honda Wave 110 S 2019-2026"/></label>

      <div className="pricing-box"><div className="pricing-box-head"><div><strong>Formación de precio heredada</strong><small>Proveedor → Marca → Producto. Los porcentajes se encadenan y luego se aplica el redondeo comercial.</small></div><Calculator size={20}/></div>
        <div className="form-grid"><label><span>Costo actual</span><input type="number" min="0" value={form.costPrice} onChange={e=>setForm({...form,costPrice:e.target.value})}/></label><label><span>Margen adicional del producto</span><div className="percent-input"><input type="number" step="0.01" value={form.productMarkupPercent} onChange={e=>setForm({...form,productMarkupPercent:e.target.value})}/><span>%</span></div></label></div>
        <div className="pricing-rules inherited-rules">{rules.map(r=><div className="pricing-rule" key={r.id}><strong>{r.name}</strong><span>+ {r.percent}%</span></div>)}</div>
        <div className="price-result"><span>Precio sugerido</span><strong>{money(suggested)}</strong><label><input type="checkbox" checked={form.autoPrice} onChange={e=>setForm({...form,autoPrice:e.target.checked})}/> Recalcular cuando cambia el costo</label></div>
        {!form.autoPrice&&<label><span>Precio final manual</span><input type="number" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>}
        <div className="rounding-preview"><span>Antes de redondear: <strong>{money(priceBreakdown.rawPrice)}</strong></span><span>Redondeo: <strong>{money(data.settings?.priceRoundingStep || 500)}</strong></span><span>Diferencia: <strong>{money(priceBreakdown.roundingDifference)}</strong></span></div>
      </div>

      <div className="form-grid"><label><span>Stock actual</span><input type="number" min="0" value={form.stock} disabled/><small className="field-hint">Solo cambia por compra, venta o ajuste.</small></label><label><span>Stock mínimo</span><input type="number" min="0" value={form.minStock} onChange={e=>setForm({...form,minStock:e.target.value})}/></label></div>
      <div className="form-grid"><label><span>Presentación</span><input value={form.size} onChange={e=>setForm({...form,size:e.target.value})}/></label><label><span>Imagen URL</span><input value={form.image} onChange={e=>setForm({...form,image:e.target.value})}/></label></div>
      <label><span>Descripción</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <div className="toggle-row"><label><input type="checkbox" checked={form.trackStock} onChange={e=>setForm({...form,trackStock:e.target.checked})}/> Controlar stock</label><label><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Activo</label><label><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Destacado</label></div>
      <button className="btn btn-primary full-width">Guardar producto</button>
    </form>
  </div></div>
}
