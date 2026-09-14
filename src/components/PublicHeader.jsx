import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, Headphones, Menu, MessageCircle, Search, ShoppingCart, UserRound, X } from 'lucide-react'
import BrandLogo from './BrandLogo'
import ProductMegaMenu from './ProductMegaMenu'
import { useAppData } from '../context/AppDataContext'

export default function PublicHeader(){
  const [open,setOpen]=useState(false)
  const [mega,setMega]=useState(false)
  const [search,setSearch]=useState('')
  const navigate=useNavigate()
  const {data,cartCount}=useAppData()
  if(!data)return null
  const submit=e=>{e.preventDefault();const q=search.trim();navigate(q?`/catalogo?q=${encodeURIComponent(q)}`:'/catalogo');setOpen(false);setMega(false)}
  const wa=`https://wa.me/${data.settings.whatsapp}`
  const close=()=>{setOpen(false);setMega(false)}
  return <>
    <div className="shop-utility"><div className="container shop-utility-inner"><div className="utility-left"><span>🚚 Envíos a todo el país</span><span>💳 3 cuotas sin interés</span><span>🏷️ Venta por mayor y menor</span></div><a href={wa} target="_blank" rel="noreferrer"><MessageCircle size={14}/> Atención por <b>WhatsApp</b></a></div></div>
    <header className="shop-header">
      <div className="container shop-header-main">
        <Link to="/" className="shop-logo-link" aria-label="RC Repuestos y Accesorios" onClick={close}><BrandLogo/></Link>
        <form className="shop-search" onSubmit={submit}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="¿Qué estás buscando? Ej: pastillas, carburador, NGK, Wave 110..."/><button aria-label="Buscar"><Search size={21}/></button></form>
        <div className="shop-actions"><a className="shop-action desktop-action" href={wa} target="_blank" rel="noreferrer"><Headphones size={23}/><span>Ayuda</span></a><Link className="shop-action desktop-action" to="/admin"><UserRound size={23}/><span>Mi cuenta</span></Link><Link className="shop-action" to="/carrito"><span className="shop-cart-wrap"><ShoppingCart size={26}/>{cartCount>0&&<b>{cartCount}</b>}</span><span>Mi pedido</span></Link><button className="shop-menu-btn" onClick={()=>setOpen(v=>!v)} aria-label="Abrir menú">{open?<X/>:<Menu/>}</button></div>
      </div>
      <nav className={`shop-nav ${open?'open':''}`}><div className="container shop-nav-inner">
        <NavLink to="/" end onClick={close}>Inicio</NavLink>
        <button className={`nav-products-button ${mega?'active':''}`} onClick={()=>setMega(v=>!v)} onMouseEnter={()=>window.innerWidth>900&&setMega(true)}>Productos <ChevronDown size={14}/></button>
        <a href="/#marcas" onClick={close}>Marcas</a><a href="/#motos" onClick={close}>Motos por modelo</a><a href="/#accesorios" onClick={close}>Accesorios</a><a href="/#ofertas" onClick={close}>Ofertas</a><a href={wa} target="_blank" rel="noreferrer">Contacto</a><a href={wa} target="_blank" rel="noreferrer" className="wholesale-nav">Mayoristas</a><a href="/#como-comprar" onClick={close}>¿Cómo comprar?</a>
      </div></nav>
      {mega&&<div onMouseLeave={()=>window.innerWidth>900&&setMega(false)}><ProductMegaMenu onNavigate={close}/></div>}
    </header>
  </>
}
