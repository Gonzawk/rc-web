import { apiFetch } from '../api/apiClient'
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
export const imageRepository={
 async upload(file,purpose='product',entityId=null){
   if(!file) throw new Error('Seleccioná una imagen.')
   if(!file.type?.startsWith('image/')) throw new Error('El archivo seleccionado no es una imagen válida.')
   if(file.size>10*1024*1024) throw new Error('La imagen supera el límite de 10 MB.')
   const ticket=await apiFetch('/api/admin/images/direct-upload',{method:'POST',body:JSON.stringify({purpose,entityId,fileName:file.name})})
   const body=new FormData();body.append('file',file,file.name)
   const response=await fetch(ticket.uploadUrl,{method:'POST',body})
   if(!response.ok) throw new Error('Cloudflare Images no pudo recibir el archivo.')
   // Cloudflare procesa asíncronamente. No usamos URLs fabricadas: esperamos la respuesta real de Cloudflare.
   for(let attempt=0;attempt<12;attempt++){
     if(attempt) await sleep(500+attempt*150)
     const status=await apiFetch(`/api/admin/images/${encodeURIComponent(ticket.imageId)}/status`,{cache:'no-store'})
     if(status.uploaded&&Object.keys(status.deliveryUrls||{}).length) return status
   }
   throw new Error('La imagen se subió, pero Cloudflare todavía no terminó de generar sus variantes. Intentá nuevamente en unos segundos.')
 },
 status:imageId=>apiFetch(`/api/admin/images/${encodeURIComponent(imageId)}/status`,{cache:'no-store'}),
 remove:imageId=>apiFetch(`/api/admin/images/${encodeURIComponent(imageId)}`,{method:'DELETE'}),
 repairReferences:()=>apiFetch('/api/admin/images/repair-references',{method:'POST'})
}
