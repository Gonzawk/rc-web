import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, X } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'

export default function MobileCartToast() {
  const {cart}=useAppData();
  const location=useLocation();
  const [visible,setVisible]=useState(false);
  const previous=useRef(null);
  const timer=useRef(null);
  const total=cart.reduce((sum,item)=>sum+Number(item.quantity||0),0);
  useEffect(()=>{
    if(previous.current!==null && total>previous.current && location.pathname!=='/carrito' && location.pathname!=='/checkout') {
      setVisible(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setVisible(false),3600);
    }
    previous.current=total;
    return ()=>clearTimeout(timer.current);
  },[total,location.pathname]);
  useEffect(()=>{setVisible(false);clearTimeout(timer.current)},[location.pathname]);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  if(!visible)return null;
  return <div className="rc-mobile-cart-toast" role="status" aria-live="polite"><ShoppingCart size={19}/><span>Producto agregado · {total} {total===1?'unidad':'unidades'}</span><Link to="/carrito" onClick={()=>setVisible(false)}>Ver carrito</Link><button aria-label="Cerrar aviso" onClick={()=>setVisible(false)}><X size={16}/></button></div>;
}
