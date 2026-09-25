/** Saturated yellow and sky-blue families, with unique RGB values per collection. */
export function fragmentColors(ids: string[]): string[] {
  const used = new Set<string>()
  const colors = new Map<string, string>()
  // Resolve rare collisions in ID order, independent of the gallery's sort order.
  for (const id of [...ids].sort()) {
    let hash = 2166136261
    for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0
    const yellow = hash % 2 === 0
    const capacity = yellow ? 16 * 56 * 116 : 111 * 60 * 46
    let slot = (hash >>> 1) % capacity
    let color: string
    do {
      let value = slot
      const r = (yellow ? 240 : 35) + value % (yellow ? 16 : 111)
      value = Math.floor(value / (yellow ? 16 : 111))
      const g = (yellow ? 184 : 150) + value % (yellow ? 56 : 60)
      value = Math.floor(value / (yellow ? 56 : 60))
      const b = (yellow ? 25 : 210) + value
      color = '#' + [r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('')
      slot = (slot + 1) % capacity
    } while (used.has(color))
    used.add(color)
    colors.set(id, color)
  }
  return ids.map(id => colors.get(id)!)
}
