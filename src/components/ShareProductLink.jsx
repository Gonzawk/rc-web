import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

/** Solo se monta en ProductDetailPage. Comparte exclusivamente la URL, sin texto añadido. */
export default function ShareProductLink() {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = window.location.origin + window.location.pathname
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const input = document.createElement('textarea')
        input.value = url
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.select()
        const success = document.execCommand('copy')
        input.remove()
        if (!success) throw new Error('No se pudo copiar el enlace')
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.error('No se pudo copiar el enlace', error)
    }
  }
  return <button type="button" className="rc-share-product-btn" onClick={share} title="Copiar enlace" aria-label={copied ? 'Enlace copiado' : 'Copiar enlace'}>{copied ? <Check size={19} /> : <Share2 size={19} />}</button>
}
