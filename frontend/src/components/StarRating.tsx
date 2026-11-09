import { StarIcon } from './icons'

type Props = {
  value: number
  size?: number
  interactive?: boolean
  onChange?: (value: number) => void
}

export default function StarRating({ value, size = 14, interactive = false, onChange }: Props) {
  const rounded = Math.round(value)
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => interactive && onChange?.(n)}
          style={{ color: n <= rounded ? 'var(--volt)' : 'var(--line-strong)', cursor: interactive ? 'pointer' : 'default', display: 'inline-flex' }}
        >
          <StarIcon size={size} filled={n <= rounded} />
        </span>
      ))}
    </div>
  )
}
