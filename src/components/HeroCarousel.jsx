import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export default function HeroCarousel(){
  const {data}=useAppData()
  const slides=useMemo(()=>[...(data?.webContent?.banners||[])].filter(x=>x.active).sort((a,b)=>(a.order||0)-(b.order||0)),[data])
  const [index,setIndex]=useState(0)
  const [paused,setPaused]=useState(false)
  const touch=useRef(null)
  useEffect(()=>{ if(index>=slides.length)setIndex(0) },[slides.length,index])
  useEffect(()=>{ if(paused||slides.length<2)return; const id=setInterval(()=>setIndex(v=>(v+1)%slides.length),6500); return()=>clearInterval(id)},[paused,slides.length])
  if(!slides.length)return null
  const go=n=>setIndex((n+slides.length)%slides.length)
  const slide=slides[index]
  const content=<><span className="hero-eyebrow">/// {slide.eyebrow}</span><h1>{slide.title}</h1><p>{slide.subtitle}</p><span className="hero-cta">{slide.ctaText}<ArrowRight size={18}/></span></>
  return <section className="rc-hero-carousel" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touch.current==null)return;const dx=e.changedTouches[0].clientX-touch.current;if(Math.abs(dx)>45)go(index+(dx<0?1:-1));touch.current=null}}>
    {slides.map((item,i)=><article key={item.id} className={`rc-hero-slide ${i===index?'active':''}`} aria-hidden={i!==index}>
      <picture><source media="(max-width: 720px)" srcSet={item.mobileImage||item.desktopImage}/><img src={item.desktopImage} alt={item.title}/></picture>
      <div className="rc-hero-shade"/><div className="container rc-hero-content">
        {item.ctaLink==='whatsapp'?<a href={`https://wa.me/${data.settings.whatsapp}`} target="_blank" rel="noreferrer" className="rc-hero-copy">{content}</a>:<Link className="rc-hero-copy" to={item.ctaLink||'/catalogo'}>{content}</Link>}
      </div>
    </article>)}
    {slides.length>1&&<><button className="hero-arrow prev" onClick={()=>go(index-1)} aria-label="Banner anterior"><ChevronLeft/></button><button className="hero-arrow next" onClick={()=>go(index+1)} aria-label="Banner siguiente"><ChevronRight/></button><div className="hero-dots">{slides.map((s,i)=><button key={s.id} className={i===index?'active':''} onClick={()=>setIndex(i)} aria-label={`Ir al banner ${i+1}`}/>)}</div></>}
    <div className="hero-mobile-help"><MessageCircle size={17}/> Deslizá para ver promociones</div>
  </section>
}
