import { Outlet } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'
import MobileCartToast from '../components/MobileCartToast'
import FloatingCartButton from '../components/FloatingCartButton'

export default function PublicLayout() {
  return <div className="public-site"><PublicHeader/><main><Outlet/></main><Footer/><FloatingCartButton/><MobileCartToast/></div>
}
