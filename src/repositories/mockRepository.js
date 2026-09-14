import seed from '../data/demoData.json'

const KEY = 'rc-repuestos-y-accesorios-demo-data-v10'
const clone = value => JSON.parse(JSON.stringify(value))

export const mockRepository = {
  async load() {
    try {
      const stored = localStorage.getItem(KEY)
      return stored ? JSON.parse(stored) : clone(seed)
    } catch {
      return clone(seed)
    }
  },

  async save(data) {
    localStorage.setItem(KEY, JSON.stringify(data))
    return clone(data)
  },

  async reset() {
    localStorage.removeItem(KEY)
    return clone(seed)
  }
}

/*
  En producción esta implementación se reemplaza por apiRepository:
  GET    /api/settings
  PUT    /api/settings
  GET    /api/products
  POST   /api/products
  PUT    /api/products/{id}
  PATCH  /api/products/{id}/status
  GET    /api/catalog/brands
  GET    /api/catalog/product-categories

*/

/*
  Comercio / inventario previsto para API:
  GET/POST/PUT  /api/products
  GET/POST/PUT  /api/suppliers
  GET/POST      /api/purchases
  GET           /api/inventory
  GET           /api/inventory/movements
  POST          /api/inventory/adjustments
  POST          /api/orders
  GET/PATCH     /api/admin/orders/{id}
  POST          /api/admin/orders/{id}/confirm
  POST          /api/sales
  GET           /api/sales
  GET           /api/cash/movements
  POST          /api/cash/movements
  GET           /api/cash/summary

  Operaciones críticas (compra, venta, confirmación de pedido y ajuste)
  deberán ser transacciones atómicas en PostgreSQL.
*/
