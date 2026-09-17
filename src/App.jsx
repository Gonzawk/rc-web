import { BrowserRouter,Route,Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppDataProvider } from './context/AppDataContext'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderStatusPage from './pages/OrderStatusPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminCatalogPage from './pages/admin/AdminCatalogPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminWebContentPage from './pages/admin/AdminWebContentPage'
import AdminSuppliersPage from './pages/admin/AdminSuppliersPage'
import AdminPurchasesPage from './pages/admin/AdminPurchasesPage'
import AdminSalesPage from './pages/admin/AdminSalesPage'
import AdminPointOfSalePage from './pages/admin/AdminPointOfSalePage'
import AdminSaleDetailPage from './pages/admin/AdminSaleDetailPage'
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminCashPage from './pages/admin/AdminCashPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App(){return <ThemeProvider><AppDataProvider><BrowserRouter><Routes>
 <Route element={<PublicLayout/>}><Route path="/" element={<HomePage/>}/><Route path="/catalogo" element={<StorePage/>}/><Route path="/store" element={<StorePage/>}/><Route path="/carrito" element={<CartPage/>}/><Route path="/checkout" element={<CheckoutPage/>}/><Route path="/pedido/:code" element={<OrderStatusPage/>}/><Route path="/admin" element={<AdminLoginPage/>}/></Route>
 <Route path="/admin" element={<AdminLayout/>}><Route path="dashboard" element={<AdminDashboardPage/>}/><Route path="productos" element={<AdminProductsPage/>}/><Route path="inventario" element={<AdminInventoryPage/>}/><Route path="compras" element={<AdminPurchasesPage/>}/><Route path="proveedores" element={<AdminSuppliersPage/>}/><Route path="pedidos" element={<AdminOrdersPage/>}/><Route path="caja" element={<AdminCashPage/>}/><Route path="ventas" element={<AdminSalesPage/>}/><Route path="ventas/nueva" element={<AdminPointOfSalePage/>}/><Route path="ventas/:id" element={<AdminSaleDetailPage/>}/><Route path="estadisticas" element={<AdminStatisticsPage/>}/><Route path="catalogo" element={<AdminCatalogPage/>}/><Route path="contenido-web" element={<AdminWebContentPage/>}/><Route path="configuracion" element={<AdminSettingsPage/>}/></Route>
 <Route path="*" element={<NotFoundPage/>}/>
 </Routes></BrowserRouter></AppDataProvider></ThemeProvider>}
