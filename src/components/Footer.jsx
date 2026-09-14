import { Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { useAppData } from '../context/AppDataContext'

export default function Footer(){
  const {data}=useAppData(); if(!data)return null
  const wa=`https://wa.me/${data.settings.whatsapp}`
  return <footer className="shop-footer"><div className="container shop-footer-grid">
    <div className="shop-footer-brand"><BrandLogo/><p>Repuestos y accesorios para motos. Venta minorista y mayorista con atención personalizada.</p></div>
    <div><strong>INFORMACIÓN</strong><a href="/#como-comprar">¿Cómo comprar?</a><Link to="/catalogo">Envíos</Link><span>Formas de pago</span><span>Cambios y devoluciones</span><span>Preguntas frecuentes</span></div>
    <div><strong>NOSOTROS</strong><span>Quiénes somos</span><a href={wa} target="_blank" rel="noreferrer">Contacto</a><span>Trabajá con nosotros</span><span>Ventas mayoristas</span></div>
    <div><strong>SEGUINOS</strong><div className="shop-socials"><Instagram/><Facebook/><Youtube/></div><a className="footer-wa" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={18}/> Escribinos por WhatsApp</a></div>
  </div><div className="container shop-footer-bottom"><span>© 2026 RC Repuestos y Accesorios. Todos los derechos reservados.</span><b>/// TU MOTO, NUESTRA PASIÓN</b></div></footer>
}
