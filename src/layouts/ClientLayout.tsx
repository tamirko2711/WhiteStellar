import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function ClientLayout() {
  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh' }}>
      <Navbar />
      <Outlet />
    </div>
  )
}
