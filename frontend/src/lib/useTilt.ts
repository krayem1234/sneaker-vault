// Imperative 3D tilt helpers: mutate the hovered element directly via
// e.currentTarget (no refs, no re-renders), so they drop into any element,
// including ones rendered inside a .map(). Pair with the "tilt-card" /
// "tilt-glare" CSS classes for the glare + perspective transition.
export function tiltMove(e: React.MouseEvent<HTMLElement>, maxTilt = 10, scale = 1.03) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height
  const rx = (0.5 - py) * maxTilt
  const ry = (px - 0.5) * maxTilt
  el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
  el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
  el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
}

export function tiltLeave(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
}
