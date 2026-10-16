import { Facebook, Instagram, MessageCircle, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { useAppData } from '../context/AppDataContext'

function socialUrl(value, host) {
  const raw = String(value || '').trim()
  if (!raw) return null
  if (/^https:\/\//i.test(raw)) {
    try { const url = new URL(raw); return url.hostname === host || url.hostname.endsWith('.' + host) ? url.href : null } catch { return null }
  }
  const username = raw.replace(/^@/, '').replace(/\/$/, '')
  return /^[a-zA-Z0-9._-]+$/.test(username) ? `https://${host}/${username}` : null
}

export default function Footer() {
  const { data } = useAppData()
  if (!data) return null
  const settings = data.settings || {}
  const waNumber = String(settings.whatsapp || '').replace(/\D/g, '')
  const wa = waNumber ? `https://wa.me/${waNumber}` : null
  const instagram = socialUrl(settings.instagram, 'instagram.com')
  const facebook = socialUrl(settings.facebook, 'facebook.com')
  const youtube = socialUrl(settings.youtube, 'youtube.com')
  const email = String(settings.email || '').trim()
  const phone = String(settings.phone || '').trim()
  const address = String(settings.address || '').trim()
  return <footer className="shop-footer"><div className="container shop-footer-grid">
    <div className="shop-footer-brand"><BrandLogo/><p>{settings.tagline || 'Repuestos y accesorios para motos. Atención personalizada.'}</p></div>
    <div><strong>INFORMACIÓN</strong><a href="/#como-comprar">¿Cómo comprar?</a><Link to="/catalogo">Envíos</Link><span>Formas de pago</span><span>Cambios y devoluciones</span></div>
    <div><strong>CONTACTO</strong>{phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}><Phone size={16}/> {phone}</a>}{email && <a href={`mailto:${email}`}><Mail size={16}/> {email}</a>}{address && <span><MapPin size={16}/> {address}</span>}{settings.businessHours && <span>{settings.businessHours}</span>}</div>
    <div><strong>SEGUINOS</strong><div className="shop-socials">{instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram/></a>}{facebook && <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook/></a>}{youtube && <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube/></a>}</div>{wa && <a className="footer-wa" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/> Escribinos por WhatsApp</a>}</div>
  </div><div className="container shop-footer-bottom"><span>© {new Date().getFullYear()} {settings.displayName || 'RC Repuestos y Accesorios'}. Todos los derechos reservados.</span><b>/// TU MOTO, NUESTRA PASIÓN</b></div></footer>
}
