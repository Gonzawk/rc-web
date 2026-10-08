import { ArrowRight, MessageCircle, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { money } from '../utils/commerce'
import HeroCarousel from '../components/HeroCarousel'
import BrandMarquee from '../components/BrandMarquee'

function ProductRail({title,products,data,addToCart}){
 if(!products.length)return null
 return <section className="home-product-section"><div className="container"><div className="home-section-head"><h2>{title}</h2><Link to="/catalogo">Ver todos <ArrowRight size={15}/></Link></div><div className="shop-product-grid home-product-grid">{products.map(p=><article className="shop-product" key={p.id}><Link to={`/producto/${p.id}`} className="shop-product-image"><img src={p.image} alt={p.name} loading="lazy"/>{Number(p.availableStock)<=0&&<span className="stock-badge">SIN STOCK</span>}</Link><div className="shop-product-body"><small>{[p.brand,p.subcategory].filter(Boolean).join(' · ')}</small><h3><Link to={`/producto/${p.id}`}>{p.name}</Link></h3><div className={`product-price ${data.settings.showPrices&&p.offerActive&&Number(p.listPrice)>Number(p.price)?'has-offer':''}`}>{data.settings.showPrices?(p.offerActive&&Number(p.listPrice)>Number(p.price)?<><span className="offer-old-price">{money(p.listPrice)}</span><strong className="offer-current-price">{money(p.price)}</strong><span className="offer-badge">OFERTA</span></>:<strong className="regular-current-price">{money(p.price)}</strong>):<strong className="regular-current-price">Consultar</strong>}</div>{data.settings.showPrices&&!p.offerActive&&<p className="rc-payment-discount-note">20% de descuento en efectivo o transferencia</p>}<button disabled={Number(p.availableStock)<=0} onClick={()=>addToCart(p.id)}><ShoppingCart size={16}/> {Number(p.availableStock)>0?'Agregar al pedido':'Sin stock'}</button></div></article>)}</div></div></section>
}

export default function HomePage(){
 const {data,loading,addToCart}=useAppData()
 if(loading)return <div className="screen-loader">Cargando RC Repuestos…</div>
 const products=(data.products||[]).filter(x=>x.active)
 const featured=products.filter(x=>x.featured).slice(0,4)
 const news=products.filter(x=>x.newArrival).slice(0,4)
 const wa=`https://wa.me/${data.settings.whatsapp}`
 const wholesaleText=encodeURIComponent('Hola RC Repuestos, quisiera consultar precio mayorista.')
 return <main className="shop-home shop-home-v21">
   <HeroCarousel/>
   <section className="home-brand-strip" id="marcas"><BrandMarquee/></section>
   <ProductRail title="Destacados" products={featured} data={data} addToCart={addToCart}/>
   <ProductRail title="Novedades" products={news} data={data} addToCart={addToCart}/>
   <section className="home-wholesale-min"><div className="container"><div><small>VENTA MAYORISTA</small><h2>¿Comprás para taller, comercio o reventa?</h2></div><a className="shop-red-btn" href={`${wa}?text=${wholesaleText}`} target="_blank" rel="noreferrer"><MessageCircle size={17}/> Consultar por WhatsApp</a></div></section>
   <a className="shop-floating-wa" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={28}/><span>¿Necesitás ayuda?</span></a>
 </main>
}
