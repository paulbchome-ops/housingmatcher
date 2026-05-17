import React, { useState } from 'react'

function groupBySource(items) {
  return items.reduce((acc, it) => {
    acc[it.source] = acc[it.source] || []
    acc[it.source].push(it)
    return acc
  }, {})
}

function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)) }

export default function ComparisonTable({ items = [], filters = {}, costParams = {} }) {
  if (!items.length) return <p>No results yet — try a search.</p>

  const { minPrice = 0, maxPrice = 999999, minSqft = 0, weights = { price: 0.7, sqft: 0.3 } } = filters

  // Apply basic filters (price)
  const filtered = items.filter(it => {
    const price = Number(it.price) || null
    if (price === null) return true
    return price >= minPrice && price <= maxPrice
  })

  // Compute score for each item
  const [expandedId, setExpandedId] = useState(null)

  const scored = filtered.map(it => {
    const price = Number(it.price) || null
    const sqft = Number(it.sqft) || null

    // Price score: higher is better. Normalize using filter range.
    let priceScore = 0
    if (price !== null) {
      if (maxPrice > minPrice) {
        priceScore = 1 - (price - minPrice) / (maxPrice - minPrice)
      } else {
        priceScore = 0
      }
      priceScore = clamp(priceScore)
    }

    // Sqft score: higher is better relative to minSqft up to a heuristic max
    let sqftScore = 0
    if (sqft !== null) {
      const maxSqft = Math.max(minSqft + 100, sqft, 1000)
      sqftScore = (sqft - minSqft) / (maxSqft - minSqft)
      sqftScore = clamp(sqftScore)
    }

    const wPrice = weights.price != null ? Number(weights.price) : 0.7
    const wSqft = weights.sqft != null ? Number(weights.sqft) : 0.3
    const totalWeight = (wPrice + wSqft) || 1

    const score = ((priceScore * wPrice) + (sqftScore * wSqft)) / totalWeight

    return { ...it, _score: Math.round(score * 100) }
  })

  // Sort by score descending
  scored.sort((a, b) => (b._score || 0) - (a._score || 0))

  const groups = groupBySource(scored)

  const averages = Object.fromEntries(
    Object.entries(groups).map(([k, list]) => {
      const avg = Math.round(list.reduce((s, i) => s + (Number(i.price) || 0), 0) / (list.length || 1))
      return [k, avg]
    })
  )

  // Helper to compute cost breakdown
  function costBreakdown(item) {
    const rent = Number(item.price) || 0
    const utilities = Number(costParams.utilitiesPerMonth) || 0
    const commute = (function() {
      const c = costParams.commute || {}
      if (!c || c.mode === 'none') return 0
      const days = Number(c.workDaysPerMonth) || 22
      const kmOneWay = Number(c.kmOneWay) || 0
      if (c.mode === 'transit') {
        const fare = Number(c.transitFare) || 0
        return fare * 2 * days
      }
      if (c.mode === 'drive') {
        const fuelPrice = Number(c.fuelPrice) || 0
        const eff = Number(c.carEfficiency) || 8 // L/100km
        // monthly km
        const monthlyKm = kmOneWay * 2 * days
        const liters = (monthlyKm * (eff / 100))
        return liters * fuelPrice
      }
      return 0
    })()

    const total = rent + utilities + commute
    return { rent, utilities, commute: Math.round(commute), total: Math.round(total) }
  }

  return (
    <div>
      <h2>Summary</h2>
      <ul>
        {Object.entries(averages).map(([src, avg]) => (
          <li key={src}><strong>{src}:</strong> {avg} CAD (avg)</li>
        ))}
      </ul>

      <h2>Listings (ranked)</h2>
      <table>
        <thead>
          <tr>
            <th>Score</th>
            <th>Source</th>
            <th>Title</th>
            <th>Price</th>
            <th>Sqft</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {scored.map(it => {
            const breakdown = costBreakdown(it)
            const isOpen = expandedId === it.id
            return (
              <React.Fragment key={it.id}>
                <tr onClick={() => setExpandedId(isOpen ? null : it.id)} style={{ cursor: 'pointer' }}>
                  <td>{it._score}</td>
                  <td>{it.source}</td>
                  <td>{it.title}</td>
                  <td>{it.price != null ? `${it.price} ${it.currency || ''}` : 'N/A'}</td>
                  <td>{it.sqft != null ? it.sqft : 'N/A'}</td>
                  <td><a href={it.url} target="_blank" rel="noreferrer">Open</a></td>
                </tr>
                {isOpen && (
                  <tr className="breakdown-row">
                    <td colSpan={6}>
                      <div className="breakdown">
                        <strong>Monthly cost breakdown:</strong>
                        <ul>
                          <li>Rent: {breakdown.rent} CAD</li>
                          <li>Estimated utilities: {breakdown.utilities} CAD</li>
                          <li>Estimated commute: {breakdown.commute} CAD</li>
                          <li><strong>Total estimated monthly:</strong> {breakdown.total} CAD</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
