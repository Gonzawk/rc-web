import { BrowserRouter,Route,Routes,Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppDataProvider } from './context/AppDataContext'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderTrackingSearchPage from './pages/OrderTrackingSearchPage'
import OrderStatusPage from './pages/OrderStatusPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCatalogPage from './pages/admin/AdminCatalogPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminSuppliersPage from './pages/admin/AdminSuppliersPage'
import AdminPurchasesPage from './pages/admin/AdminPurchasesPage'
import AdminPurchaseHistoryPage from './pages/admin/AdminPurchaseHistoryPage'
import AdminPurchaseDetailPage from './pages/admin/AdminPurchaseDetailPage'
import AdminPointOfSalePage from './pages/admin/AdminPointOfSalePage'
import AdminSalesPage from './pages/admin/AdminSalesPage'
import AdminSaleDetailPage from './pages/admin/AdminSaleDetailPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage'
import AdminCashPage from './pages/admin/AdminCashPage'
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminWebContentPage from './pages/admin/AdminWebContentPage'
import NotFoundPage from './pages/NotFoundPage'
import { ADMIN_LOGIN_PATH } from './config/admin'

export default function App(){return <ThemeProvider><AppDataProvider><BrowserRouter><Routes>
  <Route element={<PublicLayout/>}>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/catalogo" element={<StorePage/>}/><Route path="/store" element={<StorePage/>}/>
    <Route path="/producto/:slug" element={<ProductDetailPage/>}/>
    <Route path="/carrito" element={<CartPage/>}/><Route path="/checkout" element={<CheckoutPage/>}/>
    <Route path="/seguimiento" element={<OrderTrackingSearchPage/>}/><Route path="/seguimiento/:trackingCode" element={<OrderStatusPage/>}/>
  </Route>
  <Route path={ADMIN_LOGIN_PATH} element={<AdminLoginPage/>}/>
  <Route path="/admin" element={<AdminLayout/>}>
    <Route index element={<Navigate to="dashboard" replace/>}/>
    <Route path="dashboard" element={<AdminDashboardPage/>}/><Route path="catalogo" element={<AdminCatalogPage/>}/><Route path="productos" element={<AdminProductsPage/>}/>
    <Route path="inventario" element={<AdminInventoryPage/>}/><Route path="proveedores" element={<AdminSuppliersPage/>}/><Route path="compras" element={<AdminPurchasesPage/>}/><Route path="compras/historial" element={<AdminPurchaseHistoryPage/>}/><Route path="compras/:id" element={<AdminPurchaseDetailPage/>}/>
    <Route path="pos" element={<AdminPointOfSalePage/>}/><Route path="ventas" element={<Navigate to="/admin/ventas/historial" replace/>}/><Route path="ventas/historial" element={<AdminSalesPage/>}/><Route path="ventas/:id" element={<AdminSaleDetailPage/>}/>
    <Route path="pedidos" element={<AdminOrdersPage/>}/><Route path="pedidos/:id" element={<AdminOrderDetailPage/>}/><Route path="caja" element={<AdminCashPage/>}/>
    <Route path="estadisticas" element={<AdminStatisticsPage/>}/><Route path="configuracion" element={<AdminSettingsPage/>}/><Route path="contenido" element={<AdminWebContentPage/>}/>
  </Route>
  <Route path="*" element={<NotFoundPage/>}/>
</Routes></BrowserRouter></AppDataProvider></ThemeProvider>}
