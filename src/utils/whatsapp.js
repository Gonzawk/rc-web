/** Construye enlaces de WhatsApp únicamente a partir de números configurados. */
export function whatsappNumber(settings = {}) {
  const value = String(settings.whatsapp || settings.phone || '').trim()
  return value.replace(/\D/g, '')
}

export function whatsappUrl(settings = {}, message = '') {
  const number = whatsappNumber(settings)
  if (!number) return null
  const base = `https://wa.me/${number}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
