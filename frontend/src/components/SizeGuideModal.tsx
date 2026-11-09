import { XIcon } from './icons'

const TABLE = [
  { eu: '39', us: '6.5', uk: '6', cm: '24.5' },
  { eu: '40', us: '7', uk: '6.5', cm: '25' },
  { eu: '41', us: '8', uk: '7.5', cm: '26' },
  { eu: '42', us: '8.5', uk: '8', cm: '26.5' },
  { eu: '43', us: '9.5', uk: '9', cm: '27.5' },
  { eu: '44', us: '10', uk: '9.5', cm: '28' },
  { eu: '45', us: '11', uk: '10.5', cm: '29' },
]

export default function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-surface pop-in" style={{ maxWidth: 420, width: '100%', background: 'var(--surface-2)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 17 }}>Guide des tailles</h3>
            <button className="icon-btn" onClick={onClose}><XIcon size={16} /></button>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 14px' }}>
            Correspondances approximatives pour une chaussure homme/mixte — mesure ton pied en fin de journée pour plus de précision.
          </p>
          <div style={{ overflow: 'hidden', borderRadius: 10, border: '1px solid var(--line)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--chip-bg)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>EU</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>US</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>UK</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>CM</th>
                </tr>
              </thead>
              <tbody>
                {TABLE.map((row, i) => (
                  <tr key={row.eu} style={{ borderTop: '1px solid var(--line)', background: i % 2 ? 'transparent' : 'var(--surface)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.eu}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row.us}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row.uk}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
