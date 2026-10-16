export default function BankTransferDetails({ settings, admin = false }) {
  if (!admin && !settings?.enabled) return <p>Los datos bancarios no están disponibles en este momento. Contactá al comercio antes de transferir.</p>
  const fields = [['Banco / billetera',settings.bank],['Titular',settings.holder],['CUIT / CUIL',settings.taxId],['CBU / CVU',settings.cbuCvu],['Alias',settings.alias],['Número de cuenta',settings.accountNumber]]
  return <div className="bank-data-grid admin-bank-grid bank-data-safe">{fields.filter(([,v])=>v).map(([label,value])=><span key={label}><small>{label}</small><b className="bank-data-value">{value}</b><button type="button" className="btn btn-secondary" onClick={()=>navigator.clipboard?.writeText(value)}>Copiar</button></span>)}{settings.instructions&&<p>{settings.instructions}</p>}</div>
}
