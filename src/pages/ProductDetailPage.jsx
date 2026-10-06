import {useEffect,useMemo,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowLeft,Check,ShoppingCart} from 'lucide-react'
import {useAppData} from '../context/AppDataContext'
import {money} from '../utils/commerce'
const variantLabel=v=>[v.color,v.size,v.name].filter(Boolean).join(' · ')||v.sku||'Opción'
const isColorOnly=variants=>variants.length>1&&variants.every(v=>v.color&&!v.size&&!v.name)
const swatchStyle=v=>({background:v.colorHex||'#d5d9de'})
export default function ProductDetailPage(){
 const{slug}=useParams();const{data,loading,catalogState,catalogError,retryPublicCatalog,addToCart}=useAppData();const[selectedId,setSelectedId]=useState(null);const[added,setAdded]=useState(false)
 useEffect(()=>{window.scrollTo({top:0,left:0,behavior:'auto'});setSelectedId(null);setAdded(false)},[slug])
 const product=useMemo(()=>data?.products?.find(x=>x.slug===slug||String(x.id)===String(slug)),[data?.products,slug])
 const variants=useMemo(()=>product?.variants?.filter(v=>v.active!==false&&v.available!==false)||[],[product]);const selected=variants.find(v=>v.id===selectedId)||variants.find(v=>v.isDefault)||variants[0]
 if(loading)return <div className="screen-loader">Cargando producto…</div>
 if(catalogState==='error')return <section className="surface-section"><div className="container"><h1>No pudimos cargar el producto</h1><p>{catalogError}</p><button className="btn btn-primary" onClick={retryPublicCatalog}>Reintentar</button></div></section>
 if(!product)return <section className="surface-section"><div className="container"><h1>Producto no encontrado</h1><p>El producto no existe o ya no está publicado.</p><Link className="btn btn-primary" to="/catalogo">Volver al catálogo</Link></div></section>
 const stock=Number(selected?.availableStock||0);const selectedImage=selected?.image||product.image
 return <section className="rc-detail-page"><div className="container"><Link className="rc-detail-back" to="/catalogo"><ArrowLeft size={16}/> Volver al catálogo</Link><div className="rc-detail-grid">
  <div className="rc-detail-image">{selectedImage?<img key={selected?.id||product.id} src={selectedImage} alt={`${product.name}${selected?` - ${variantLabel(selected)}`:''}`}/>:<div>Sin imagen</div>}</div>
  <div className="rc-detail-copy"><span className="section-kicker">{product.brand||'RC REPUESTOS'}</span><h1>{product.name}</h1><p>{product.description||'Consultá compatibilidad y disponibilidad.'}</p>
   {product.compatibility&&<div className="rc-detail-meta"><b>Aplicación</b><span>{product.compatibility}</span></div>}{product.oemCode&&<div className="rc-detail-meta"><b>Referencia OEM</b><span>{product.oemCode}</span></div>}
   {variants.length>1&&<div className={`rc-detail-variants ${isColorOnly(variants)?'rc-color-only':''}`}><strong>{isColorOnly(variants)?'Elegí un color':'Elegí una opción'}</strong><div>{variants.map(v=>{const colorOnly=isColorOnly(variants);return <button type="button" className={selected?.id===v.id?'selected':''} onClick={()=>{setSelectedId(v.id);setAdded(false)}} key={v.id} aria-label={colorOnly?`Color ${v.color}`:variantLabel(v)} title={colorOnly?v.color:variantLabel(v)}>{v.color&&<i style={swatchStyle(v)}/>} {!colorOnly&&<span>{[v.size,v.name].filter(Boolean).join(' · ')||(v.color?null:variantLabel(v))}</span>}</button>})}</div></div>}
   {variants.length===1&&selected?.name&&<div className="rc-detail-meta"><b>Presentación</b><span>{selected.name}</span></div>}
   <div className="rc-detail-price"><span>Precio</span>{data.settings.showPrices&&product.offerActive&&Number(selected?.listPrice)>Number(selected?.price)&&<del>{money(selected.listPrice)}</del>}<strong>{data.settings.showPrices&&Number(selected?.price)>0?money(selected.price):'Consultar'}</strong>{product.offerActive&&Number(selected?.listPrice)>Number(selected?.price)&&<em className="offer-badge">OFERTA</em>}<small>{stock>0?`${stock} disponibles`:'Sin stock'}</small></div>
   <button className="rc-add-btn" disabled={!selected||stock<=0} onClick={()=>{addToCart(product.id,1,selected.id);setAdded(true)}}>{added?<><Check size={18}/> Agregado</>:<><ShoppingCart size={18}/> Agregar al pedido</>}</button>
  </div></div></div></section>
}