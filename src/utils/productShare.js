// Alias público de React. No es un acortador externo ni un código opaco.
export const productSharePath = product => `/p/${encodeURIComponent(String(product.slug || product.id))}`
export const productShareUrl = product => `${window.location.origin}${productSharePath(product)}`
