const raw=(import.meta.env.VITE_ADMIN_LOGIN_PATH||'/gestion-privada-rc').trim()
export const ADMIN_LOGIN_PATH=`/${raw.replace(/^\/+|\/+$/g,'')||'gestion-privada-rc'}`
