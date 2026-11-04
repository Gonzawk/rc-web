import ShareProductLink from '../components/ShareProductLink'
import {useEffect,useMemo,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowLeft,Check,ShoppingCart} from 'lucide-react'
import {useAppData} from '../context/AppDataContext'
import {money} from '../utils/commerce'
import {priceForQuantity} from '../utils/wholesalePricing'
import {apiCatalogRepository} from '../repositories/apiCatalogRepository'
import InstallmentPrice from '../components/InstallmentPrice'
import CashTransferPrice from '../components/CashTransferPrice'
const variantLabel=v=>[v.color,v.size,v.name].filter(Boolean).join(' · ')||v.sku||'Opción'
const isColorOnly=variants=>variants.length>1&&variants.every(v=>v.color&&!v.size&&!v.name)
const swatchStyle=v=>({background:v.colorHex||'#d5d9de'})
export default function ProductDetailPage(){
 const{slug}=useParams();const{data,loading,catalogState,catalogError,retryPublicCatalog,addToCart,ensurePublicProduct}=useAppData();const[selectedId,setSelectedId]=useState(null);const[added,setAdded]=useState(false);const[quantity,setQuantity]=useState(1)
 useEffect(()=>{window.scrollTo({top:0,left:0,behavior:'auto'});setSelectedId(null);setAdded(false);setQuantity(1)},[slug])
 const [remote,setRemote]=useState(null);const [fetching,setFetching]=useState(true);const [fetchError,setFetchError]=useState('');
 useEffect(()=>{let live=true;setFetching(true);setFetchError('');setRemote(null);apiCatalogRepository.publicDetail(slug).then(p=>{if(live){setRemote(p);ensurePublicProduct(p)}}).catch(e=>{if(live)setFetchError(e.status===404?'Producto no encontrado':e.message)}).finally(()=>{if(live)setFetching(false)});return()=>{live=false}},[slug,ensurePublicProduct]);
 const product=remote;
 const variants=useMemo(()=>product?.variants?.filter(v=>v.active!==false&&v.available!==false)||[],[product]);const selected=variants.find(v=>v.id===selectedId)||variants.find(v=>v.isDefault)||variants[0]
 if(loading||fetching)return <div className="screen-loader">Cargando producto…</div>
 if(fetchError)return <section className="surface-section"><div className="container"><h1>No se pudo cargar el producto</h1><p>{fetchError}</p><Link to="/catalogo">Volver al catálogo</Link></div></section>
 if(catalogState==='error')return <section className="surface-section"><div className="container"><h1>No pudimos cargar el producto</h1><p>{catalogError}</p><button className="btn btn-primary" onClick={retryPublicCatalog}>Reintentar</button></div></section>
 if(!product)return <section className="surface-section"><div className="container"><h1>Producto no encontrado</h1><p>El producto no existe o ya no está publicado.</p><Link className="btn btn-primary" to="/catalogo">Volver al catálogo</Link></div></section>
 const stock=Math.max(0,Math.floor(Number(selected?.availableStock||0)));const safeQuantity=Math.min(Math.max(1,quantity),Math.max(1,stock));const pricing=priceForQuantity(product,selected,safeQuantity);const selectedImage=selected?.image||product.image
 return <section className="rc-detail-page"><div className="container"><Link className="rc-detail-back" to="/catalogo"><ArrowLeft size={16}/> Volver al catálogo</Link><div className="rc-detail-grid">
  <div className="rc-detail-image">{selectedImage?<img key={selected?.id||product.id} src={selectedImage} alt={`${product.name}${selected?` - ${variantLabel(selected)}`:''}`}/>:<div>Sin imagen</div>}</div>
  <div className="rc-detail-copy"><span className="section-kicker">{product.brand||'RC REPUESTOS'}</span><div className="rc-detail-title-share"><h1>{product.name}</h1><ShareProductLink /></div><p>{product.description||'Consultá compatibilidad y disponibilidad.'}</p>
   {(product.compatibilityUniversal||product.compatibleModels?.length>0)&&<div className="rc-detail-meta"><b>Compatibilidad</b><span>{product.compatibilityUniversal?'Universal · Todas las motos':product.compatibleModels.map(m=>`${m.brand} ${m.name}`.trim()).join(' · ')}</span></div>}{product.oemCode&&<div className="rc-detail-meta"><b>Referencia OEM</b><span>{product.oemCode}</span></div>}
   {variants.length>1&&<div className={`rc-detail-variants ${isColorOnly(variants)?'rc-color-only':''}`}><strong>{isColorOnly(variants)?'Elegí un color':'Elegí una opción'}</strong><div>{variants.map(v=>{const colorOnly=isColorOnly(variants);return <button type="button" className={selected?.id===v.id?'selected':''} onClick={()=>{setSelectedId(v.id);setAdded(false);setQuantity(1)}} key={v.id} aria-label={colorOnly?`Color ${v.color}`:variantLabel(v)} title={colorOnly?v.color:variantLabel(v)}>{v.color&&<i style={swatchStyle(v)}/>} {!colorOnly&&<span>{[v.size,v.name].filter(Boolean).join(' · ')||(v.color?null:variantLabel(v))}</span>}</button>})}</div></div>}
   {variants.length===1&&selected?.name&&<div className="rc-detail-meta"><b>Presentación</b><span>{selected.name}</span></div>}
   <div className="rc-detail-price">
    <span>Precio unitario según cantidad</span>
    {data.settings.showPrices&&Number(selected?.listPrice)>Number(pricing.price)&&<del>{money(selected.listPrice)}</del>}
    <strong>{data.settings.showPrices&&Number(pricing.price)>0?money(pricing.price):'Consultar'}</strong>
    {pricing.wholesaleWins?<em className="offer-badge">MAYORISTA</em>:pricing.offer?<em className="offer-badge">OFERTA</em>:null}
    {selected?.wholesaleEnabled&&Number(selected.wholesaleMinQuantity)>=2&&Number(selected.wholesalePrice)>0&&<small>Mayorista desde {selected.wholesaleMinQuantity} unidades: {money(selected.wholesalePrice)} c/u.</small>}
    {data.settings.showPrices&&stock>0&&<small>Total por {safeQuantity} {safeQuantity===1?'unidad':'unidades'}: <b>{money(pricing.price*safeQuantity)}</b></small>}
    {pricing.promotional?<small>Oferta o mayorista: sin cuotas ni descuento adicional del 20%. Retiro: efectivo o transferencia. Envío: solo transferencia.</small>:<InstallmentPrice price={pricing.price} showPrices={data.settings.showPrices} eligible={!pricing.promotional}/>}
    {!pricing.promotional&&<CashTransferPrice product={{...product,variants:selected?[selected]:[]}} showPrices={data.settings.showPrices}/>}
    <small>{stock>0?`${stock} disponibles`:'Sin stock'}</small>
   </div>
   <div className="rc-detail-quantity" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',margin:'12px 0'}}>
    <label htmlFor="rc-detail-qty">Cantidad</label>
    <input id="rc-detail-qty" type="number" inputMode="numeric" min="1" max={Math.max(1,stock)} step="1" disabled={stock<=0} value={safeQuantity} onChange={e=>{const n=Number(e.target.value);setQuantity(Number.isFinite(n)?Math.min(Math.max(1,Math.floor(n)),Math.max(1,stock)):1);setAdded(false)}} style={{width:90,padding:'10px',borderRadius:8}}/>
   </div>
   <button className="rc-add-btn" disabled={!selected||stock<=0} onClick={()=>{addToCart(product.id,safeQuantity,selected.id);setAdded(true)}}>{added?<><Check size={18}/> Agregado</>:<><ShoppingCart size={18}/> Agregar {safeQuantity} al pedido</>}</button>
  </div></div></div></section>
}