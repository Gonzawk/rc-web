import { ArrowRight, Flame, Gauge, PackageSearch } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export default function ProductMegaMenu({onNavigate}){
 const {data}=useAppData(); if(!data)return null
 const cats=(data.productCategories||[]).filter(x=>x.active)
 const featured=(data.products||[]).filter(x=>x.active&&x.featured).slice(0,4)
 return <div className="product-mega-menu"><div className="container mega-inner">
   <div className="mega-categories">{cats.map(cat=><section key={cat.id}><Link onClick={onNavigate} to={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}><strong>{cat.name}</strong><ArrowRight size={13}/></Link>{(cat.subcategories||[]).filter(x=>x.active).slice(0,7).map(sub=><Link onClick={onNavigate} key={sub.id} to={`/catalogo?categoria=${encodeURIComponent(cat.name)}&q=${encodeURIComponent(sub.name)}`}>{sub.name}</Link>)}</section>)}</div>
   <aside className="mega-smart"><span className="mega-label"><Flame size={15}/> BÚSQUEDAS RÁPIDAS</span><Link onClick={onNavigate} to="/catalogo?q=Wave 110"><Gauge/> Honda Wave 110</Link><Link onClick={onNavigate} to="/catalogo?q=CG 150"><Gauge/> Honda CG / Titan 150</Link><Link onClick={onNavigate} to="/catalogo?q=competicion"><PackageSearch/> Competición</Link><div className="mega-best"><small>MÁS BUSCADOS</small>{featured.map(p=><Link onClick={onNavigate} key={p.id} to={`/catalogo?q=${encodeURIComponent(p.name)}`}>{p.name}</Link>)}</div></aside>
 </div></div>
}
