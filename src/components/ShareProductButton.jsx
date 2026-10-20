import {useState} from 'react'
import {Share2,Check,Copy} from 'lucide-react'
import {productShareUrl} from '../utils/productShare'

export default function ShareProductButton({product}) {
 const [feedback,setFeedback]=useState('')
 async function share(){
  const url=productShareUrl(product)
  try {
   if(navigator.share){
    await navigator.share({title:product.name,text:`Mirá este producto: ${product.name}`,url})
    return
   }
   if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url)}
   else {const field=document.createElement('textarea');field.value=url;field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw new Error('No se pudo copiar')}
   setFeedback('¡Enlace copiado!')
  } catch(error){
   if(error?.name==='AbortError')return
   setFeedback('No se pudo copiar. Abrí el producto y copiá la dirección.')
  }
  window.setTimeout(()=>setFeedback(''),3500)
 }
 return <div className="rc-product-share-wrap"><button type="button" className="rc-product-share-button" onClick={share} aria-label={`Compartir ${product.name}`}><Share2 size={16}/> Compartir</button>{feedback&&<span className="rc-product-share-feedback" role="status">{feedback}</span>}</div>
}
