import { useEffect, useState } from 'react'
import { operationsRepository as ops } from '../repositories/operationsRepository'

const empty = { enabled: false, bank: '', holder: '', taxId: '', accountNumber: '', cbuCvu: '', alias: '', instructions: '' }
const fields = [
  ['bank', 'Banco o billetera'], ['holder', 'Titular'], ['taxId', 'CUIT / CUIL'],
  ['accountNumber', 'Número de cuenta (opcional)'], ['cbuCvu', 'CBU / CVU'], ['alias', 'Alias']
]

export default function AdminBankTransferSettings() {
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    ops.bankTransferAdmin()
      .then(x => { if (active) setForm({ ...empty, ...x }) })
      .catch(e => { if (active) { setError(true); setMessage(e.message || 'No se pudo consultar la configuración bancaria.') } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const save = async e => {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError(false); setMessage('')
    try {
      const result = await ops.saveBankTransfer(form)
      setForm({ ...empty, ...result })
      setMessage('Datos bancarios guardados correctamente.')
    } catch (e) {
      setError(true)
      setMessage(e.message || 'No se pudieron guardar los datos bancarios.')
    } finally { setBusy(false) }
  }

  return <form className="settings-form bank-settings-form" onSubmit={save}>
    <h2 id="bank-settings-title">Transferencia bancaria</h2>
    <p className="settings-help">Configurá los datos visibles al cliente. El pago solo se confirma después de verificar su acreditación.</p>
    {loading ? <p>Cargando cuenta bancaria…</p> : <>
      <label className="bank-settings-toggle"><input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })}/> Habilitar transferencia para nuevos pedidos</label>
      <div className="form-grid">{fields.map(([key, label]) => <label key={key}><span>{label}</span><input type="text" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} maxLength={key === 'alias' || key === 'cbuCvu' ? undefined : 120} autoComplete="off" /></label>)}</div>
      <label><span>Instrucciones adicionales</span><textarea maxLength={500} value={form.instructions || ''} onChange={e => setForm({ ...form, instructions: e.target.value })}/></label>
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar datos bancarios'}</button>
    </>}
    {message && <p role={error ? 'alert' : 'status'}>{message}</p>}
  </form>
}
