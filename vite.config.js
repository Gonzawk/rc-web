import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// SITE_URL debe ser el dominio público canónico, por ejemplo https://tudominio.com.ar

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.SITE_URL || env.VITE_RC_DOMAIN || '').trim().replace(/\/$/, '')
  const validOrigin = /^https:\/\/[^\s/]+(?::\d+)?$/i.test(siteUrl)
  return {
  plugins: [
    react(),
    {
      name: 'rc-seo-absolute-urls',
      transformIndexHtml(html, ctx) {
        if (command === 'serve' || ctx?.server) return html.replaceAll('__SITE_ORIGIN__', siteUrl || 'http://localhost:5173')
        if (!validOrigin) throw new Error('SEO: configurar SITE_URL con dominio HTTPS público (ej.: https://www.tudominio.com.ar)')
        return html.replaceAll('__SITE_ORIGIN__', siteUrl)
      },
    },
  ],
}})
