import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockRepository } from '../repositories/mockRepository'
import { calculateSuggestedPrice, nextDocumentNumber } from '../utils/commerce'

const AppDataContext = createContext(null)
const nextId = list => Math.max(0, ...(list || []).map(x => Number(x.id) || 0)) + 1
const CART_KEY = 'rc-repuestos-y-accesorios-cart-v10'
const clone = value => JSON.parse(JSON.stringify(value))

export function AppDataProvider({ children }) {
  const [data, setData] = useState(null)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => { mockRepository.load().then(setData) }, [])
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)) }, [cart])

  const commit = async producer => {
    const next = typeof producer === 'function' ? producer(data) : producer
    setData(next)
    await mockRepository.save(next)
    return next
  }

  const api = useMemo(() => ({
    data,
    loading: !data,
    cart,
    cartCount: cart.reduce((sum, x) => sum + x.quantity, 0),

    async resetDemo() {
      const fresh = await mockRepository.reset()
      setData(fresh)
      setCart([])
    },

    addToCart(productId, quantity = 1) {
      if (!data) return
      const product = data.products.find(x => x.id === productId && x.active)
      if (!product || product.stock <= 0) return
      setCart(current => {
        const found = current.find(x => x.productId === productId)
        const desired = Math.min(product.stock, (found?.quantity || 0) + Number(quantity || 1))
        if (found) return current.map(x => x.productId === productId ? { ...x, quantity: desired } : x)
        return [...current, { productId, quantity: Math.min(product.stock, Number(quantity || 1)) }]
      })
    },

    updateCartQuantity(productId, quantity) {
      if (!data) return
      const product = data.products.find(x => x.id === productId)
      const safe = Math.max(0, Math.min(product?.stock || 0, Number(quantity) || 0))
      setCart(current => safe === 0 ? current.filter(x => x.productId !== productId) : current.map(x => x.productId === productId ? { ...x, quantity: safe } : x))
    },

    removeFromCart(productId) { setCart(current => current.filter(x => x.productId !== productId)) },
    clearCart() { setCart([]) },

    async saveSettings(settings) {
      await commit(d => {
        const normalized = {
          ...settings,
          priceRoundingStep: Math.max(1, Number(settings.priceRoundingStep) || 500),
          priceRoundingMode: ['up','nearest','down'].includes(settings.priceRoundingMode) ? settings.priceRoundingMode : 'up'
        }
        const products = d.products.map(product => product.autoPrice ? {
          ...product,
          price: calculateSuggestedPrice(product.costPrice, product.pricingRules || [], normalized.priceRoundingStep, normalized.priceRoundingMode)
        } : product)
        return { ...d, settings:normalized, products }
      })
    },


    async saveProduct(product) {
      await commit(d => {
        const exists = d.products.some(x => x.id === product.id)
        const rules = product.pricingRules || []
        const suggested = calculateSuggestedPrice(product.costPrice, rules, d.settings?.priceRoundingStep || 500, d.settings?.priceRoundingMode || 'up')
        const item = {
          ...product,
          id: exists ? product.id : nextId(d.products),
          costPrice: Number(product.costPrice) || 0,
          price: product.autoPrice ? suggested : Number(product.price) || suggested,
          stock: Number(product.stock) || 0,
          minStock: Number(product.minStock) || 0,
          pricingRules: rules.map((r, index) => ({ ...r, id: r.id || index + 1, percent: Number(r.percent) || 0 }))
        }
        return { ...d, products: exists ? d.products.map(x => x.id === item.id ? item : x) : [...d.products, item] }
      })
    },
    async toggleProduct(id) { await commit(d => ({ ...d, products: d.products.map(x => x.id === id ? { ...x, active: !x.active } : x) })) },

    async saveBrand(brand) {
      await commit(d => {
        const exists = d.brands.some(x => x.id === brand.id)
        const item = exists ? brand : { ...brand, id: nextId(d.brands) }
        return { ...d, brands: exists ? d.brands.map(x => x.id === item.id ? item : x) : [...d.brands, item] }
      })
    },
    async toggleBrand(id) { await commit(d => ({ ...d, brands: d.brands.map(x => x.id === id ? { ...x, active: !x.active } : x) })) },


    async saveProductCategory(category) {
      await commit(d => {
        const exists = d.productCategories.some(x => x.id === category.id)
        const item = exists ? category : { ...category, id: nextId(d.productCategories), subcategories: category.subcategories || [] }
        return { ...d, productCategories: exists ? d.productCategories.map(x => x.id === item.id ? item : x) : [...d.productCategories, item] }
      })
    },
    async toggleProductCategory(id) { await commit(d => ({ ...d, productCategories: d.productCategories.map(x => x.id === id ? { ...x, active: !x.active } : x) })) },
    async saveSubcategory(categoryId, subcategory) {
      await commit(d => ({ ...d, productCategories: d.productCategories.map(category => {
        if (category.id !== categoryId) return category
        const exists = category.subcategories.some(x => x.id === subcategory.id)
        const item = exists ? subcategory : { ...subcategory, id: nextId(category.subcategories) }
        return { ...category, subcategories: exists ? category.subcategories.map(x => x.id === item.id ? item : x) : [...category.subcategories, item] }
      }) }))
    },
    async toggleSubcategory(categoryId, subcategoryId) {
      await commit(d => ({ ...d, productCategories: d.productCategories.map(category => category.id !== categoryId ? category : { ...category, subcategories: category.subcategories.map(x => x.id === subcategoryId ? { ...x, active: !x.active } : x) }) }))
    },


    async saveSupplier(supplier) {
      await commit(d => {
        const list = d.suppliers || []
        const exists = list.some(x => x.id === supplier.id)
        const item = exists ? supplier : { ...supplier, id:nextId(list), active:true }
        return { ...d, suppliers: exists ? list.map(x => x.id === item.id ? item : x) : [...list, item] }
      })
    },
    async toggleSupplier(id) { await commit(d => ({ ...d, suppliers:(d.suppliers || []).map(x => x.id === id ? { ...x, active:!x.active } : x) })) },

    async saveWebBanner(banner) {
      await commit(d => {
        const webContent = d.webContent || { banners:[], brandCarousel:[] }
        const list = webContent.banners || []
        const exists = list.some(x => x.id === banner.id)
        const item = { ...banner, id: exists ? banner.id : nextId(list), order:Number(banner.order)||list.length+1, active:banner.active !== false }
        return { ...d, webContent:{ ...webContent, banners: exists ? list.map(x => x.id === item.id ? item : x) : [...list,item] } }
      })
    },
    async deleteWebBanner(id) { await commit(d => ({ ...d, webContent:{ ...(d.webContent||{}), banners:(d.webContent?.banners||[]).filter(x=>x.id!==id) } })) },
    async saveBrandCarouselItem(item) {
      await commit(d => {
        const webContent=d.webContent||{banners:[],brandCarousel:[]}; const list=webContent.brandCarousel||[]; const exists=list.some(x=>x.id===item.id)
        const normalized={...item,id:exists?item.id:nextId(list),order:Number(item.order)||list.length+1,active:item.active!==false}
        return {...d,webContent:{...webContent,brandCarousel:exists?list.map(x=>x.id===normalized.id?normalized:x):[...list,normalized]}}
      })
    },
    async deleteBrandCarouselItem(id) { await commit(d => ({ ...d, webContent:{ ...(d.webContent||{}), brandCarousel:(d.webContent?.brandCarousel||[]).filter(x=>x.id!==id) } })) },

    async registerPurchase(purchase) {
      let result
      await commit(d => {
        const purchases = d.purchases || []
        const movements = [...(d.stockMovements || [])]
        const number = nextDocumentNumber('COMP', purchases)
        const createdAt = new Date().toISOString()
        const rawItems = purchase.items.map(row => {
          const product = d.products.find(x => x.id === row.productId)
          const quantity = Number(row.quantity) || 0
          const listUnitCost = Number(row.unitCost) || 0
          return { productId:product.id, sku:product.sku, name:product.name, quantity, listUnitCost, grossSubtotal:quantity * listUnitCost }
        }).filter(x => x.quantity > 0)
        const grossTotal = rawItems.reduce((s,x)=>s+x.grossSubtotal,0)
        const discountType = purchase.discountType || 'none'
        const discountValue = Math.max(0, Number(purchase.discountValue)||0)
        const discountAmount = discountType === 'percent' ? Math.min(grossTotal, grossTotal * Math.min(100,discountValue) / 100) : discountType === 'amount' ? Math.min(grossTotal, discountValue) : 0
        const factor = grossTotal ? (grossTotal-discountAmount)/grossTotal : 1
        const items = rawItems.map(row => {
          const subtotal = row.grossSubtotal * factor
          const unitCost = row.quantity ? subtotal / row.quantity : 0
          return { ...row, unitCost, discountAllocated:row.grossSubtotal-subtotal, subtotal }
        })
        const products = d.products.map(product => {
          const row = items.find(x => x.productId === product.id)
          if (!row) return product
          const newStock = Number(product.stock || 0) + row.quantity
          const newPrice = product.autoPrice ? calculateSuggestedPrice(row.unitCost, product.pricingRules || [], d.settings?.priceRoundingStep || 500, d.settings?.priceRoundingMode || 'up') : product.price
          movements.push({ id:nextId(movements), productId:product.id, sku:product.sku, productName:product.name, type:'purchase', quantity:row.quantity, stockAfter:newStock, unitCost:row.unitCost, reference:number, note:`Compra a ${purchase.supplierName}${discountAmount ? ' · costo neto con descuento' : ''}`, createdAt })
          return { ...product, stock:newStock, costPrice:row.unitCost, price:newPrice, lastCostAt:createdAt }
        })
        result = { ...purchase, id:nextId(purchases), number, items, grossTotal, discountType, discountValue, discountAmount, totalCost:grossTotal-discountAmount, paymentMethod:purchase.paymentMethod || 'Transferencia', status:'confirmed', createdAt }
        const cashMovements = [...(d.cashMovements || [])]
        cashMovements.unshift({ id:nextId(cashMovements), direction:'out', category:'purchase', concept:`Compra de mercadería · ${purchase.supplierName}`, amount:result.totalCost, paymentMethod:result.paymentMethod, reference:number, source:'purchase', sourceId:result.id, notes:purchase.invoiceNumber || purchase.notes || '', createdAt })
        return { ...d, products, stockMovements:movements, purchases:[result, ...purchases], cashMovements }
      })
      return result
    },

    async createOrder(order) {
      let created
      await commit(d => {
        const orders = d.orders || []
        const items = order.items.map(row => {
          const product = d.products.find(x => x.id === row.productId)
          return { productId:product.id, sku:product.sku, name:product.name, quantity:Number(row.quantity), unitPrice:Number(product.price), subtotal:Number(row.quantity)*Number(product.price) }
        })
        const id = nextId(orders)
        created = { ...order, id, publicCode:`PED-${String(id).padStart(5,'0')}`, items, total:items.reduce((s,x)=>s+x.subtotal,0), status:'pending', source:'whatsapp', createdAt:new Date().toISOString() }
        return { ...d, orders:[created, ...orders] }
      })
      setCart([])
      return created
    },

    async updateOrder(id, patch) {
      await commit(d => ({ ...d, orders:(d.orders || []).map(x => x.id === id ? { ...x, ...patch, updatedAt:new Date().toISOString() } : x) }))
    },

    async confirmSale(payload) {
      let sale
      let error = null
      await commit(d => {
        for (const row of payload.items) {
          const product = d.products.find(x => x.id === row.productId)
          if (!product || Number(row.quantity) <= 0) { error = 'La venta contiene un producto inválido.'; return d }
          if (product.trackStock !== false && product.stock < Number(row.quantity)) { error = `Stock insuficiente para ${product.name}. Disponible: ${product.stock}.`; return d }
        }
        const sales = d.sales || []
        const movements = [...(d.stockMovements || [])]
        const number = nextDocumentNumber('VTA', sales)
        const createdAt = new Date().toISOString()
        const rawItems = payload.items.map(row => {
          const product = d.products.find(x => x.id === row.productId)
          const quantity = Number(row.quantity)
          const listUnitPrice = Number(row.unitPrice ?? product.price)
          const unitCost = Number(product.costPrice || 0)
          return { productId:product.id, sku:product.sku, name:product.name, quantity, listUnitPrice, unitCost, grossSubtotal:quantity*listUnitPrice }
        })
        const grossTotal=rawItems.reduce((s,x)=>s+x.grossSubtotal,0)
        const discountType=payload.discountType||'none'
        const discountValue=Math.max(0,Number(payload.discountValue)||0)
        const discountAmount=discountType==='percent'?Math.min(grossTotal,grossTotal*Math.min(100,discountValue)/100):discountType==='amount'?Math.min(grossTotal,discountValue):0
        const factor=grossTotal?(grossTotal-discountAmount)/grossTotal:1
        const items=rawItems.map(row=>{const subtotal=row.grossSubtotal*factor;return {...row,unitPrice:row.quantity?subtotal/row.quantity:0,discountAllocated:row.grossSubtotal-subtotal,subtotal}})
        const products = d.products.map(product => {
          const row = items.find(x => x.productId === product.id)
          if (!row || product.trackStock === false) return product
          const newStock = product.stock - row.quantity
          movements.push({ id:nextId(movements), productId:product.id, sku:product.sku, productName:product.name, type:'sale', quantity:-row.quantity, stockAfter:newStock, unitCost:row.unitCost, reference:number, note:payload.source === 'whatsapp_order' ? 'Pedido confirmado' : 'Venta presencial', createdAt })
          return { ...product, stock:newStock }
        })
        const total = grossTotal-discountAmount
        const costTotal = items.reduce((s,x)=>s+x.quantity*x.unitCost,0)
        sale = { id:nextId(sales), number, source:payload.source || 'pos', orderId:payload.orderId || null, customerName:payload.customerName || 'Venta mostrador', phone:payload.phone || '', paymentMethod:payload.paymentMethod || 'Sin especificar', notes:payload.notes || '', items, grossTotal, discountType, discountValue, discountAmount, total, costTotal, grossProfit:total-costTotal, createdAt }
        const orders = (d.orders || []).map(order => order.id === payload.orderId ? { ...order, status:'confirmed', saleId:sale.id, confirmedAt:createdAt, items:items.map(({unitCost,...x})=>x), grossTotal, discountAmount, total } : order)
        const cashMovements = [...(d.cashMovements || [])]
        cashMovements.unshift({ id:nextId(cashMovements), direction:'in', category:'product_sale', concept:`Venta de productos · ${number}`, amount:total, paymentMethod:sale.paymentMethod, reference:number, source:'sale', sourceId:sale.id, notes:sale.customerName, createdAt })
        return { ...d, products, stockMovements:movements, sales:[sale, ...sales], orders, cashMovements }
      })
      return error ? { ok:false, error } : { ok:true, sale }
    },

    async registerCashMovement(payload) {
      let movement
      await commit(d => {
        const list = d.cashMovements || []
        const amount = Math.max(0, Number(payload.amount) || 0)
        const category = payload.category || 'manual_income'
        const isOut = ['owner_withdrawal','manual_expense'].includes(category)
        const prefix = category === 'owner_withdrawal' ? 'RET' : category === 'capital_deposit' ? 'APORTE' : category === 'manual_expense' ? 'EGR' : 'ING'
        movement = {
          id:nextId(list),
          direction:isOut ? 'out' : 'in',
          category,
          concept:payload.concept || (isOut ? 'Egreso manual' : 'Ingreso manual'),
          amount,
          paymentMethod:payload.paymentMethod || 'Efectivo',
          reference:nextDocumentNumber(prefix, list.map(x => ({ number:x.reference }))),
          source:'manual',
          sourceId:null,
          notes:payload.notes || '',
          createdAt:new Date().toISOString()
        }
        return { ...d, cashMovements:[movement, ...list] }
      })
      return movement
    },

    async adjustStock(productId, newStock, note) {
      await commit(d => {
        const product = d.products.find(x => x.id === productId)
        const target = Math.max(0, Number(newStock) || 0)
        const diff = target - Number(product.stock || 0)
        if (!diff) return d
        const movement = { id:nextId(d.stockMovements || []), productId:product.id, sku:product.sku, productName:product.name, type:diff > 0 ? 'adjustment_in' : 'adjustment_out', quantity:diff, stockAfter:target, unitCost:Number(product.costPrice || 0), reference:'AJUSTE', note:note || 'Corrección manual de inventario', createdAt:new Date().toISOString() }
        return { ...d, products:d.products.map(x => x.id === productId ? { ...x, stock:target } : x), stockMovements:[movement, ...(d.stockMovements || [])] }
      })
    }
  }), [data, cart])

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>
}

export const useAppData = () => useContext(AppDataContext)
