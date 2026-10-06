import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export default function HeroCarousel(){
 const {data}=useAppData()
 const slides=useMemo(()=>[...(data?.webContent?.banners||[])].filter(x=>x.active&&x.desktopImage).sort((a,b)=>(a.order||0)-(b.order||0)),[data])
 const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const touch=useRef(null)
 useEffect(()=>{if(index>=slides.length)setIndex(0)},[slides.length,index])
 useEffect(()=>{if(paused||slides.length<2)return;const id=setInterval(()=>setIndex(v=>(v+1)%slides.length),6500);return()=>clearInterval(id)},[paused,slides.length])
 if(!slides.length)return null
 const go=n=>setIndex((n+slides.length)%slides.length)
 const destination=s=>s.ctaLink==='whatsapp'?`https://wa.me/${data.settings.whatsapp}`:(s.ctaLink||'/catalogo')
 const media=s=><picture><source media="(max-width: 767px)" srcSet={s.mobileImage||s.desktopImage}/><img src={s.desktopImage} alt={s.title||'Promoción RC Repuestos'} fetchPriority="high"/></picture>
 return <section className="rc-hero-carousel home-image-hero" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onTouchStart={e=>touch.current=e.touches[0].clientX} onTouchEnd={e=>{if(touch.current==null)return;const dx=e.changedTouches[0].clientX-touch.current;if(Math.abs(dx)>45)go(index+(dx<0?1:-1));touch.current=null}}>
  {slides.map((s,i)=><article key={s.id} className={`rc-hero-slide ${i===index?'active':''}`} aria-hidden={i!==index}>{s.ctaLink==='whatsapp'?<a className="hero-image-link" href={destination(s)} target="_blank" rel="noreferrer" aria-label={s.title||'Ver promoción'}>{media(s)}</a>:<Link className="hero-image-link" to={destination(s)} aria-label={s.title||'Ver promoción'}>{media(s)}</Link>}</article>)}
  {slides.length>1&&<><button className="hero-arrow prev" onClick={()=>go(index-1)} aria-label="Banner anterior"><ChevronLeft/></button><button className="hero-arrow next" onClick={()=>go(index+1)} aria-label="Banner siguiente"><ChevronRight/></button><div className="hero-dots">{slides.map((s,i)=><button key={s.id} className={i===index?'active':''} onClick={()=>setIndex(i)} aria-label={`Ir al banner ${i+1}`}/>)}</div></>}
 </section>
}
