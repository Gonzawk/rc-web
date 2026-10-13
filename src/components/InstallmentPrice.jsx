import { money } from '../utils/commerce'

const INSTALLMENTS = 3

/** Solo informativo. El cobro real y las cuotas se verifican en el proveedor de pagos. */
export default function InstallmentPrice({ price, showPrices = true, from = false }) {
  const amount = Number(price)
  if (!showPrices || !Number.isFinite(amount) || amount <= 0) return null

  const installment = Math.round((amount / INSTALLMENTS) * 100) / 100

  return (
    <span className="rc-installment-price">
      {from ? 'Desde ' : ''}3 cuotas sin interés de {money(installment)}
    </span>
  )
}
