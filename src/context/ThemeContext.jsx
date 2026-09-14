import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('rc-repuestos-y-accesorios-theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
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
