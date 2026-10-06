import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => { const saved=localStorage.getItem('rc-repuestos-y-accesorios-theme'); return saved==='dark'||saved==='light'?saved:'light' })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('rc-repuestos-y-accesorios-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark')
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
