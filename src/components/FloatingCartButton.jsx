import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'

/** Acceso persistente al carrito solo cuando hay artículos. */
export default function FloatingCartButton(){
  const {cartCount,cartHydrating}=useAppData()
  const {pathname}=useLocation()
  if(cartHydrating || cartCount<=0 || pathname==='/carrito' || pathname==='/checkout')return null
  return <Link to="/carrito" className="rc-floating-cart" aria-label={`Ver carrito, ${cartCount} ${cartCount===1?'producto':'productos'}`} title="Ver mi carrito">
    <ShoppingCart size={23} aria-hidden="true"/>
    <span className="rc-floating-cart-count" aria-hidden="true">{cartCount>99?'99+':cartCount}</span>
    <span className="rc-floating-cart-label">Mi carrito</span>
  </Link>
}
