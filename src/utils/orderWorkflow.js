export const orderStatusLabel = {
  received: 'Pedido recibido',
  confirmed: 'Disponibilidad confirmada',
  awaiting_payment: 'Esperando pago',
  pending_shipment: 'Pendiente de envío',
  ready_for_pickup: 'Listo para retirar',
  shipped: 'Enviado / en camino',
  completed: 'Completado',
  cancelled: 'Cancelado'
}

export const paymentStatusLabel = {
  pending: 'Pendiente',
  awaiting_transfer: 'Esperando transferencia',
  pending_at_store: 'A pagar al retirar',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  refunded: 'Reintegrado'
}

export const paymentMethodLabel = {
  mercadopago: 'Mercado Pago',
  cash: 'Efectivo',
  transfer: 'Transferencia'
}

export const isFinalOrderStatus = status => ['completed', 'cancelled'].includes(status)

export const nextOperationalStatus = order => {
  if (!order || isFinalOrderStatus(order.status)) return null
  if (order.status === 'received') return 'confirmed'
  if (order.status === 'confirmed') return order.paymentStatus === 'approved'
    ? (order.deliveryType === 'shipping' ? 'pending_shipment' : 'ready_for_pickup')
    : 'awaiting_payment'
  if (order.status === 'awaiting_payment') return order.paymentStatus === 'approved'
    ? (order.deliveryType === 'shipping' ? 'pending_shipment' : 'ready_for_pickup')
    : null
  if (order.status === 'pending_shipment') return 'shipped'
  if (order.status === 'shipped' || order.status === 'ready_for_pickup') return 'completed'
  return null
}

export const canCancelOrder = order => Boolean(order && !order.saleId && ['received', 'confirmed', 'awaiting_payment'].includes(order.status))

export const canConfirmPayment = order => {
  if (!order || order.saleId || order.paymentStatus === 'approved' || isFinalOrderStatus(order.status)) return false
  return ['confirmed', 'awaiting_payment', 'ready_for_pickup'].includes(order.status)
}

export const paymentActionLabel = order => {
  if (order?.paymentMethod === 'transfer') return 'Confirmar transferencia recibida'
  if (order?.paymentMethod === 'cash') return 'Registrar efectivo recibido'
  return 'Confirmar pago acreditado'
}
