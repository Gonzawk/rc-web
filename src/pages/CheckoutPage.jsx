import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  MapPin,
  PackageCheck,
  Store,
  Truck
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { money } from '../utils/commerce'

const steps = ['Entrega', 'Datos', 'Pago', 'Confirmación']

const paymentLabels = {
  mercadopago: 'Mercado Pago',
  cash: 'Efectivo',
  transfer: 'Transferencia'
}

export default function CheckoutPage() {
  const { data, loading, cart, createOrder } = useAppData()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [delivery, setDelivery] = useState('pickup')
  const [payment, setPayment] = useState('mercadopago')
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    postalCode: '',
    street: '',
    number: '',
    city: '',
    province: 'Catamarca',
    notes: ''
  })

  const items = useMemo(() => {
    if (!data) return []

    return cart
      .map(row => {
        const product = data.products.find(x => x.id === row.productId)
        return product
          ? {
              ...product,
              quantity: row.quantity,
              subtotal: product.price * row.quantity
            }
          : null
      })
      .filter(Boolean)
  }, [data, cart])

  if (loading) {
    return <div className="screen-loader">Preparando checkout…</div>
  }

  if (!items.length) {
    return <Navigate to="/carrito" replace />
  }

  const gross = items.reduce((sum, item) => sum + item.subtotal, 0)

  // La demo conserva la política comercial existente:
  // 10% OFF sólo para retiro + efectivo/transferencia.
  const cashDiscount =
    delivery === 'pickup' && ['cash', 'transfer'].includes(payment)
      ? gross * 0.1
      : 0

  const total = gross - cashDiscount

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const canContinue = () => {
    // Paso 1: elegir entrega. Siempre existe una opción seleccionada.
    if (step === 0) return Boolean(delivery)

    // Paso 2: para la demo sólo exigimos los datos mínimos de contacto.
    // El domicilio puede completarse total o parcialmente para mostrar el flujo.
    if (step === 1) {
      return Boolean(form.name.trim() && form.phone.trim() && (delivery === 'pickup' || (form.postalCode.trim() && form.street.trim() && form.number.trim() && form.city.trim() && form.province.trim())))
    }

    // Paso 3: elegir medio de pago.
    if (step === 2) return Boolean(payment)

    return true
  }

  const goNext = () => {
    if (!canContinue()) return
    setStep(current => Math.min(current + 1, steps.length - 1))
  }

  const goBack = () => {
    setCompleted(false)
    setStep(current => Math.max(current - 1, 0))
  }

  const finishDemo = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await createOrder({
        customerName: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(),
        deliveryType: delivery, paymentMethod: payment,
        paymentStatus: payment === 'cash' ? 'pending_at_store' : payment === 'transfer' ? 'awaiting_transfer' : 'pending',
        shippingAddress: delivery === 'shipping' ? { postalCode:form.postalCode, street:form.street, number:form.number, city:form.city, province:form.province, notes:form.notes } : null,
        notes: form.notes,
        discountType: cashDiscount > 0 ? 'percent' : 'none', discountValue: cashDiscount > 0 ? 10 : 0,
        items: items.map(item => ({ productId:item.id, quantity:item.quantity }))
      })
      setCompleted(true)
      navigate(`/seguimiento/${created.trackingCode}`)
    } finally { setSubmitting(false) }
  }

  const shippingAddress = [
    [form.street, form.number].filter(Boolean).join(' '),
    form.city,
    form.postalCode ? `CP ${form.postalCode}` : '',
    form.province
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <section className="checkout-page">
      <div className="container checkout-shell">
        <Link className="checkout-back" to="/carrito">
          <ChevronLeft size={17} /> Volver al carrito
        </Link>

        <div className="checkout-heading">
          <span className="section-kicker">Compra online</span>
          <h1>Finalizá tu pedido</h1>
          <p>
            Completá tus datos y enviá el pedido. RC Repuestos y Accesorios confirmará disponibilidad y te informará el siguiente paso del pago y la entrega.
          </p>
        </div>

        <div className="checkout-steps">
          {steps.map((label, index) => (
            <div
              className={`checkout-step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`}
              key={label}
            >
              <span>
                {index < step ? <CheckCircle2 size={17} /> : index + 1}
              </span>
              <b>{label}</b>
            </div>
          ))}
        </div>

        <div className="checkout-grid">
          <main className="checkout-main-card">
            {step === 0 && (
              <>
                <h2>¿Cómo querés recibir tu compra?</h2>
                <div className="delivery-options">
                  <button
                    type="button"
                    className={delivery === 'pickup' ? 'selected' : ''}
                    onClick={() => setDelivery('pickup')}
                  >
                    <Store />
                    <strong>Retiro en sucursal</strong>
                    <span>
                      Coordinamos el retiro cuando el pedido esté preparado.
                    </span>
                    <small>Sin costo de envío</small>
                  </button>

                  <button
                    type="button"
                    className={delivery === 'shipping' ? 'selected' : ''}
                    onClick={() => { setDelivery('shipping'); setPayment('mercadopago') }}
                  >
                    <Truck />
                    <strong>Envío a domicilio</strong>
                    <span>
                      Ingresá el domicilio donde querés recibir el pedido.
                    </span>
                    <small>Costo de envío a coordinar</small>
                  </button>
                </div>

                <div className="payment-demo-note">
                  <strong>Costo de envío a coordinar</strong>
                  <span>El sistema registra tu dirección. El valor del envío se acuerda directamente con el vendedor y no está incluido en el total de productos.</span>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2>Datos del comprador</h2>
                <div className="checkout-form-grid">
                  <label>
                    <span>Nombre y apellido *</span>
                    <input
                      value={form.name}
                      onChange={event => updateField('name', event.target.value)}
                      placeholder="Ej. Juan Pérez"
                    />
                  </label>

                  <label>
                    <span>WhatsApp *</span>
                    <input
                      value={form.phone}
                      onChange={event => updateField('phone', event.target.value)}
                      placeholder="Ej. 383 400-0000"
                    />
                  </label>

                  <label className="wide">
                    <span>Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={event => updateField('email', event.target.value)}
                      placeholder="cliente@email.com"
                    />
                  </label>

                  {delivery === 'shipping' && (
                    <>
                      <label>
                        <span>Código postal</span>
                        <input
                          value={form.postalCode}
                          onChange={event => updateField('postalCode', event.target.value)}
                          placeholder="4700"
                        />
                      </label>

                      <label>
                        <span>Ciudad</span>
                        <input
                          value={form.city}
                          onChange={event => updateField('city', event.target.value)}
                          placeholder="San Fernando del Valle de Catamarca"
                        />
                      </label>

                      <label>
                        <span>Calle</span>
                        <input
                          value={form.street}
                          onChange={event => updateField('street', event.target.value)}
                          placeholder="Av. Example"
                        />
                      </label>

                      <label>
                        <span>Número</span>
                        <input
                          value={form.number}
                          onChange={event => updateField('number', event.target.value)}
                          placeholder="123"
                        />
                      </label>

                      <label className="wide">
                        <span>Provincia</span>
                        <input
                          value={form.province}
                          onChange={event => updateField('province', event.target.value)}
                        />
                      </label>
                    </>
                  )}

                  <label className="wide">
                    <span>Observaciones</span>
                    <textarea
                      value={form.notes}
                      onChange={event => updateField('notes', event.target.value)}
                      placeholder="Piso, departamento, referencia, modelo de moto, compatibilidad que necesitás confirmar, etc."
                    />
                  </label>
                </div>


              </>
            )}

            {step === 2 && (
              <>
                <h2>Elegí cómo pagar</h2>
                <div className="payment-options">
                  <button
                    type="button"
                    className={payment === 'mercadopago' ? 'selected' : ''}
                    onClick={() => setPayment('mercadopago')}
                  >
                    <CreditCard />
                    <div>
                      <strong>Mercado Pago</strong>
                      <span>
                        Tarjetas, dinero en cuenta y medios disponibles en Mercado Pago.
                      </span>
                    </div>
                    <b>Precio publicado</b>
                  </button>

                  {delivery === 'pickup' && <button
                    type="button"
                    className={payment === 'cash' ? 'selected' : ''}
                    onClick={() => setPayment('cash')}
                  >
                    <PackageCheck />
                    <div>
                      <strong>Efectivo</strong>
                      <span>
                        {delivery === 'pickup'
                          ? 'Pago al retirar en el local.'
                          : 'Forma de pago a coordinar con el comercio.'}
                      </span>
                    </div>
                    {delivery === 'pickup' && (
                      <b className="discount-badge">10% OFF</b>
                    )}
                  </button>}

                  {delivery === 'pickup' && <button
                    type="button"
                    className={payment === 'transfer' ? 'selected' : ''}
                    onClick={() => setPayment('transfer')}
                  >
                    <CreditCard />
                    <div>
                      <strong>Transferencia</strong>
                      <span>
                        Al confirmar disponibilidad te mostraremos los datos bancarios para realizar el pago y enviar el comprobante.
                      </span>
                    </div>
                    {delivery === 'pickup' && (
                      <b className="discount-badge">10% OFF</b>
                    )}
                  </button>}
                </div>


              </>
            )}

            {step === 3 && !completed && (
              <>
                <h2>Revisá y confirmá</h2>

                <div className="review-block">
                  <div>
                    <MapPin />
                    <span>
                      <b>
                        {delivery === 'pickup'
                          ? 'Retiro en sucursal'
                          : 'Envío a domicilio'}
                      </b>
                      {delivery === 'shipping'
                        ? shippingAddress || 'Domicilio a coordinar con el cliente'
                        : 'RC Repuestos y Accesorios · retiro coordinado'}
                    </span>
                  </div>

                  <div>
                    <CreditCard />
                    <span>
                      <b>{paymentLabels[payment]}</b>
                      {cashDiscount
                        ? '10% de descuento aplicado'
                        : payment === 'transfer' ? 'Datos bancarios disponibles cuando RC confirme el pedido' : 'Pago según la modalidad elegida'}
                    </span>
                  </div>
                </div>

                <div className="checkout-items-review">
                  {items.map(item => (
                    <div key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <span>
                        <b>{item.name}</b>
                        <small>
                          {item.quantity} × {money(item.price)}
                        </small>
                      </span>
                      <strong>{money(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>

                {delivery === 'shipping' && (
                  <div className="payment-demo-note">
                    <strong>Costo de envío a coordinar</strong>
                    <span>
                      El total mostrado corresponde a los productos. El envío se define
                      posteriormente según el pedido y el destino.
                    </span>
                  </div>
                )}
              </>
            )}

            {step === 3 && completed && (
              <div className="order-success">
                <CheckCircle2 size={42} />
                <span className="section-kicker">Pedido recibido</span>
                <h2>Recibimos tu pedido.</h2>
                <p>
                  RC Repuestos y Accesorios revisará disponibilidad y confirmará el pedido antes de avanzar con el pago y la entrega.
                </p>

              </div>
            )}

            <div className="checkout-actions">
              {step > 0 && !completed && (
                <button type="button" className="btn btn-secondary" onClick={goBack}>
                  Atrás
                </button>
              )}

              {step < 3 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canContinue()}
                  onClick={goNext}
                >
                  Continuar
                </button>
              )}

              {step === 3 && !completed && (
                <button type="button" className="btn btn-primary" disabled={submitting} onClick={finishDemo}>
                  {submitting ? 'Registrando…' : 'Confirmar pedido'}
                </button>
              )}

              {step === 3 && completed && (
                <Link className="btn btn-primary" to="/catalogo">
                  Volver al catálogo
                </Link>
              )}
            </div>
          </main>

          <aside className="checkout-order-card">
            <h3>Resumen</h3>

            {items.map(item => (
              <div className="checkout-mini-item" key={item.id}>
                <span>
                  {item.quantity} × {item.name}
                </span>
                <b>{money(item.subtotal)}</b>
              </div>
            ))}

            <hr />

            <div>
              <span>Subtotal</span>
              <b>{money(gross)}</b>
            </div>

            {cashDiscount > 0 && (
              <div className="checkout-discount">
                <span>
                  Descuento {payment === 'cash' ? 'efectivo' : 'transferencia'} (10%)
                </span>
                <b>- {money(cashDiscount)}</b>
              </div>
            )}

            <div>
              <span>Envío</span>
              <b>{delivery === 'pickup' ? 'Gratis' : 'A coordinar'}</b>
            </div>

            <div className="checkout-grand-total">
              <span>Total productos</span>
              <strong>{money(total)}</strong>
            </div>

            <small>
              {delivery === 'shipping'
                ? 'El costo de envío no está incluido y se coordina posteriormente según destino y características del pedido.'
                : 'Los precios publicados corresponden al precio general/tarjeta. Efectivo y transferencia al retirar obtienen 10% OFF.'}
            </small>
          </aside>
        </div>
      </div>
    </section>
  )
}
