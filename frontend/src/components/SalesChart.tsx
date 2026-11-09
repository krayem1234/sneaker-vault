type Order = { status: string; totalCents: number; createdAt: string }

export default function SalesChart({ orders, days = 14 }: { orders: Order[]; days?: number }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets: { date: Date; cents: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    buckets.push({ date: d, cents: 0 })
  }
  for (const o of orders) {
    if (o.status !== 'paid') continue
    const d = new Date(o.createdAt)
    d.setHours(0, 0, 0, 0)
    const bucket = buckets.find((b) => b.date.getTime() === d.getTime())
    if (bucket) bucket.cents += o.totalCents
  }

  const max = Math.max(1, ...buckets.map((b) => b.cents))
  const width = 600
  const height = 140
  const barGap = 4
  const barWidth = width / buckets.length - barGap

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <line x1={0} y1={height} x2={width} y2={height} stroke="var(--line)" strokeWidth={1} />
      {buckets.map((b, i) => {
        const h = b.cents === 0 ? 0 : Math.max(3, (b.cents / max) * (height - 8))
        const x = i * (barWidth + barGap)
        const showLabel = days <= 14 || i % 2 === 0
        return (
          <g key={i}>
            <rect
              x={x}
              y={height - h}
              width={barWidth}
              height={h}
              rx={3}
              fill={b.cents > 0 ? 'var(--accent)' : 'var(--line)'}
            >
              <title>{b.date.toLocaleDateString('fr-FR')} — {(b.cents / 100).toFixed(2)} €</title>
            </rect>
            {showLabel && (
              <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" fontSize={9} fill="var(--muted)">
                {b.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
