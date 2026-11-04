import {useEffect,useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {Search,Bike,ArrowRight} from 'lucide-react'
import {apiFetch} from '../api/apiClient'
import '../styles/motoModelsPublic.css'

export default function MotoModelsPage(){
 const [models,setModels]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[brand,setBrand]=useState('Todas')
 const load=()=>{setLoading(true);setError('');apiFetch('/api/public/modelos-moto').then(r=>setModels(Array.isArray(r)?r:[])).catch(e=>setError(e.message||'No se pudieron cargar los modelos')).finally(()=>setLoading(false))}
 useEffect(()=>{load()},[])
 const brands=useMemo(()=>[...new Set(models.map(m=>m.marca).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')),[models])
 const visible=useMemo(()=>models.filter(m=>(brand==='Todas'||m.marca===brand)&&`${m.marca} ${m.nombre}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))),[models,brand,query])
 return <main className="rc-motos-page"><div className="container"><div className="rc-motos-heading"><Link to="/catalogo">← Catálogo completo</Link><h1>Repuestos por modelo de moto</h1><p>Elegí tu moto para ver repuestos compatibles y productos universales.</p></div><div className="rc-motos-toolbar"><label className="rc-motos-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar Honda Wave, CG Titan…" aria-label="Buscar modelo de moto"/></label><label className="rc-motos-brand"><span>Marca</span><select value={brand} onChange={e=>setBrand(e.target.value)}><option>Todas</option>{brands.map(b=><option key={b}>{b}</option>)}</select></label></div>{loading?<div className="screen-loader">Cargando modelos…</div>:error?<div className="rc-motos-empty" role="alert">{error}<button type="button" className="btn btn-secondary" onClick={load}>Reintentar</button></div>:visible.length?<div className="rc-motos-grid">{visible.map(m=><Link key={m.id} className="rc-moto-card" to={`/motos/${encodeURIComponent(m.slug)}`}><div className="rc-moto-image">{m.imagenUrl?<img src={m.imagenUrl} alt={`${m.marca} ${m.nombre}`} loading="lazy"/>:<Bike size={48} strokeWidth={1.3}/>}</div><div className="rc-moto-card-body"><small>{m.marca}</small><h2>{m.nombre}</h2><span>Ver repuestos compatibles <ArrowRight size={16}/></span></div></Link>)}</div>:<div className="rc-motos-empty">{models.length?'No hay modelos que coincidan con la búsqueda.':'Todavía no hay modelos disponibles.'}</div>}</div></main>
}
