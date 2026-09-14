import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export default function BrandMarquee(){
 const {data}=useAppData()
 const brands=useMemo(()=>[...(data?.webContent?.brandCarousel||[])].filter(x=>x.active).sort((a,b)=>(a.order||0)-(b.order||0)),[data])
 if(!brands.length)return null
 const items=[...brands,...brands]
 return <section className="brand-marquee" aria-label="Marcas disponibles"><div className="brand-marquee-track">{items.map((b,i)=><Link to={`/catalogo?q=${encodeURIComponent(b.searchQuery||b.name)}`} key={`${b.id}-${i}`} className="brand-logo-tile" title={`Ver ${b.name}`}><img src={b.logoUrl} alt={b.name} loading="lazy"/></Link>)}</div></section>
}
