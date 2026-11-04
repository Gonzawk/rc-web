import { apiFetch } from '../api/apiClient'

const base='/api/admin/modelos-moto'
export const motoModelsRepository={
 list:()=>apiFetch(base),
 save:model=>apiFetch(base,{method:'POST',body:JSON.stringify({id:model.id||null,marca:model.marca.trim(),nombre:model.nombre.trim(),imagenUrl:model.imagenUrl?.trim()||null,activo:model.activo!==false,orden:Number(model.orden)||0})}),
 setActive:(id,activo)=>apiFetch(`${base}/${encodeURIComponent(id)}/estado`,{method:'PATCH',body:JSON.stringify(!!activo)}),
 compatibility:productId=>apiFetch(`${base}/productos/${encodeURIComponent(productId)}/compatibilidad`),
 saveProductCompatibility:(id,{universal,modeloIds})=>apiFetch(`${base}/productos/${encodeURIComponent(id)}/compatibilidad`,{method:'PUT',body:JSON.stringify({universal,modeloIds})}),
 saveVariantCompatibility:(id,modeloIds)=>apiFetch(`${base}/variantes/${encodeURIComponent(id)}/compatibilidad`,{method:'PUT',body:JSON.stringify({modeloIds})})
}
