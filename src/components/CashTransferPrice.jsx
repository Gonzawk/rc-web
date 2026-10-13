import { money } from '../utils/commerce'

const DISCOUNT_RATE = 0.20

/** Presentación informativa; el backend es quien calcula el total del pedido. */
export default function CashTransferPrice({ product, showPrices = true, compact = false }) {
  if (!showPrices || !product) return null

  const eligible = (product.variants || []).filter(variant =>
    variant.active && variant.available &&
    !(product.offerActive && variant.offerActive) &&
    Number.isFinite(Number(variant.price)) && Number(variant.price) > 0
  )

  if (!eligible.length) return null

  const prices = eligible.map(variant => Number(variant.price))
  const minimum = Math.min(...prices)
  const maximum = Math.max(...prices)
  const discounted = Math.round(minimum * (1 - DISCOUNT_RATE) * 100) / 100
  const priceLabel = minimum === maximum ? money(discounted) : `Desde ${money(discounted)}`

  return (
    <div className={`rc-payment-discount ${compact ? 'rc-payment-discount--compact' : ''}`}>
      <span className="rc-payment-discount-note">20% de descuento en efectivo o transferencia</span>
      <span className="rc-payment-discount-value">
        <span>Precio final:</span> <strong>{priceLabel}</strong>
      </span>
    </div>
  )
}
