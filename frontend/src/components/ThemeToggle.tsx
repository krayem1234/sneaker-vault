import { useTheme } from '../lib/theme'
import { SunIcon, MoonIcon } from './icons'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button className="icon-btn" onClick={toggle} title={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
