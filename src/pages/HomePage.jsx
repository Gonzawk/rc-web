import { ArrowRight, BadgeCheck, BatteryCharging, Bike, CarFront, CircleGauge, Cog, CreditCard, Disc3, MessageCircle, PackageCheck, Search, ShieldCheck, ShoppingCart, Sparkles, Truck, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { money } from '../utils/commerce'
import HeroCarousel from '../components/HeroCarousel'
import BrandMarquee from '../components/BrandMarquee'

const iconMap={Motor:Cog,Transmisión:CircleGauge,Frenos:Disc3,Electricidad:BatteryCharging,Carburación:Sparkles,Suspensión:Wrench,Accesorios:Bike,Lubricantes:CarFront}

export default function HomePage(){
  const {data,loading,addToCart}=useAppData()
  if(loading)return <div className="screen-loader">Cargando RC Repuestos…</div>
  const products=data.products.filter(x=>x.active)
  const featured=(products.filter(x=>x.featured).length?products.filter(x=>x.featured):products).slice(0,8)
  const categories=(data.productCategories||[]).filter(x=>x.active).slice(0,8)
  const transfer=p=>Math.max(1000,Math.round((p.price*.90)/500)*500)
  const wa=`https://wa.me/${data.settings.whatsapp}`
  const wholesaleText=encodeURIComponent('Hola RC Repuestos, quisiera consultar precio mayorista. Producto: ____ / Cantidad aproximada: ____ / Moto o aplicación: ____')
  return <main className="shop-home">
    <HeroCarousel/>

    <section className="shop-category-rail"><div className="container shop-category-grid">{categories.map(cat=>{const Icon=iconMap[cat.name]||Cog;return <Link key={cat.id} to={`/catalogo?categoria=${encodeURIComponent(cat.name)}`} className="shop-cat-card"><Icon size={38}/><strong>{cat.name}</strong><small>{cat.subcategories?.length||0} secciones</small></Link>})}</div></section>

    <section className="shop-brands" id="marcas"><div className="container"><div className="shop-section-title"><h2><span>///</span> MARCAS QUE TRABAJAMOS</h2><Link to="/catalogo">Ver catálogo <ArrowRight size={16}/></Link></div></div><BrandMarquee/></section>

    <section className="shop-promo" id="motos"><div className="container shop-promo-inner"><div className="shop-promo-copy"><span>NGK</span><h2>ENCENDÉ<br/>TU <em>POTENCIA</em></h2><p>Bujías y componentes de encendido para un rendimiento confiable en cada viaje.</p><Link className="shop-red-btn" to="/catalogo?q=NGK">VER BUJÍAS <ArrowRight size={18}/></Link></div><div className="shop-promo-product"><div className="spark-plug">NGK</div><div className="promo-box">NGK<br/><small>Performance Parts</small></div></div><div className="shop-promo-rider"><strong>CONFIANZA<br/>EN CADA<br/>KILÓMETRO</strong></div></div></section>

    <section className="shop-featured" id="ofertas"><div className="container"><div className="shop-section-title"><h2><span>///</span> PRODUCTOS DESTACADOS</h2><Link to="/catalogo">Ver todos <ArrowRight size={16}/></Link></div><div className="shop-product-grid">{featured.map((p,i)=><article className="shop-product" key={p.id}><div className="shop-product-image"><img src={p.image} alt={p.name}/><span className="discount-badge">{[10,12,8,15,7,11,9,13][i%8]}% OFF</span>{i===0&&<span className="shipping-badge">DESTACADO</span>}</div><div className="shop-product-body"><small>{p.brand} · {p.subcategory}</small><h3>{p.name}</h3><p className="product-compatibility">{p.compatibility}</p><div className="product-price"><del>{money(p.price)}</del><strong>{money(transfer(p))}</strong><span>precio orientativo transferencia</span></div><button onClick={()=>addToCart(p.id)}><ShoppingCart size={17}/> Agregar al pedido</button></div></article>)}</div></div></section>

    <section className="wholesale-banner"><div className="container wholesale-inner"><div><span className="shop-kicker">/// VENTA MAYORISTA</span><h2>¿Comprás para taller, comercio o reventa?</h2><p>{data.settings.wholesaleMessage}</p><div className="wholesale-tags"><span>Precio por cantidad</span><span>Cotización personalizada</span><span>Atención directa</span></div></div><a className="shop-red-btn" href={`${wa}?text=${wholesaleText}`} target="_blank" rel="noreferrer"><MessageCircle size={18}/> CONSULTAR MAYORISTA</a></div></section>

    <section className="shop-benefit-strip"><div className="container shop-benefit-grid"><div><Truck/><span><strong>ENVÍOS A TODO EL PAÍS</strong><small>Coordinamos antes de despachar</small></span></div><div><CreditCard/><span><strong>FORMAS DE PAGO</strong><small>Efectivo, transferencia y tarjetas</small></span></div><div><ShieldCheck/><span><strong>COMPATIBILIDAD VERIFICADA</strong><small>Confirmamos antes de cerrar</small></span></div><div><MessageCircle/><span><strong>ATENCIÓN PERSONALIZADA</strong><small>Por WhatsApp</small></span></div></div></section>

    <section className="shop-editorials" id="accesorios"><div className="container shop-editorial-grid"><Link to="/catalogo?categoria=Accesorios" className="shop-editorial editorial-one"><div><h3>ACCESORIOS<br/>QUE HACEN<br/>LA DIFERENCIA</h3><span>EXPLORAR ACCESORIOS</span></div></Link><Link to="/catalogo?categoria=Carburación" className="shop-editorial editorial-two"><div><h3>PREPARÁ TU MOTO<br/>PARA NUEVAS<br/>AVENTURAS</h3><span>VER PERFORMANCE</span></div></Link></div></section>

    <section className="shop-how" id="como-comprar"><div className="container"><div className="shop-section-title centered"><h2><span>///</span> ASÍ FUNCIONA TU PEDIDO</h2><p>El catálogo es online, pero la confirmación es humana para evitar errores de compatibilidad y stock.</p></div><div className="shop-how-grid"><article><Search/><b>01</b><h3>Buscá tu repuesto</h3><p>Por pieza, marca, código o modelo.</p></article><article><ShoppingCart/><b>02</b><h3>Armá el pedido</h3><p>Agregá productos y cantidades.</p></article><article><MessageCircle/><b>03</b><h3>Enviá por WhatsApp</h3><p>El pedido queda pendiente de revisión.</p></article><article><PackageCheck/><b>04</b><h3>Confirmamos</h3><p>Stock, compatibilidad y total final.</p></article></div></div></section>

    <a className="shop-floating-wa" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={28}/><span>¿Necesitás ayuda?</span></a>
  </main>
}
