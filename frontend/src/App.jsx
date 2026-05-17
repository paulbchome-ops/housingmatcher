import React, { useState } from 'react'
import ComparisonTable from './components/ComparisonTable'

export default function App() {
  const [query, setQuery] = useState('2 bedroom Vancouver')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Customization criteria
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(4000)
  const [minSqft, setMinSqft] = useState(0)
  const [weightPrice, setWeightPrice] = useState(0.7)
  const [weightSqft, setWeightSqft] = useState(0.3)
  const [useSkytrain, setUseSkytrain] = useState(false)
  const [maxDistanceKm, setMaxDistanceKm] = useState(5)
  const [useWork, setUseWork] = useState(false)
  const [workAddress, setWorkAddress] = useState('')

  // Cost assumptions
  const [utilitiesPerMonth, setUtilitiesPerMonth] = useState(150)
  const [commuteMode, setCommuteMode] = useState('drive')
  const [commuteKmOneWay, setCommuteKmOneWay] = useState(10)
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState(22)
  const [fuelPrice, setFuelPrice] = useState(1.6) // CAD per litre
  const [carEfficiency, setCarEfficiency] = useState(8) // L/100km
  const [transitFare, setTransitFare] = useState(3.25)

  async function handleSearch(e) {
    e && e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const filters = {
    minPrice: Number(minPrice) || 0,
    maxPrice: Number(maxPrice) || 999999,
    minSqft: Number(minSqft) || 0,
    weights: {
      price: Number(weightPrice) || 0.7,
      sqft: Number(weightSqft) || 0.3
    },
    proximity: {
      useSkytrain,
      maxDistanceKm: Number(maxDistanceKm) || 5,
      useWork,
      workAddress
    }
  }

  const costParams = {
    utilitiesPerMonth: Number(utilitiesPerMonth) || 0,
    commute: {
      mode: commuteMode,
      kmOneWay: Number(commuteKmOneWay) || 0,
      workDaysPerMonth: Number(workDaysPerMonth) || 22,
      fuelPrice: Number(fuelPrice) || 0,
      carEfficiency: Number(carEfficiency) || 8, // L/100km
      transitFare: Number(transitFare) || 0
    }
  }

  return (
    <div className="container">
      <h1>Housing Matcher — Price Comparison</h1>
      <form onSubmit={handleSearch} className="search">
        <input value={query} onChange={e => setQuery(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      <section className="customization">
        <h3>Customize scoring & filters</h3>
        <div className="row">
          <label>Price min</label>
          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <label>Price max</label>
          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
        <div className="row">
          <label>Min square footage</label>
          <input type="number" value={minSqft} onChange={e => setMinSqft(e.target.value)} />
        </div>

        <div className="row">
          <label>Weight — price</label>
          <input type="range" min="0" max="1" step="0.05" value={weightPrice} onChange={e => setWeightPrice(parseFloat(e.target.value))} />
          <span>{Math.round(weightPrice * 100)}%</span>
          <label>Weight — sqft</label>
          <input type="range" min="0" max="1" step="0.05" value={weightSqft} onChange={e => setWeightSqft(parseFloat(e.target.value))} />
          <span>{Math.round(weightSqft * 100)}%</span>
        </div>

        <div className="row">
          <label>
            <input type="checkbox" checked={useSkytrain} onChange={e => setUseSkytrain(e.target.checked)} />
            Prefer proximity to SkyTrain
          </label>
          <label>Max distance (km)</label>
          <input type="number" value={maxDistanceKm} onChange={e => setMaxDistanceKm(e.target.value)} />
        </div>

        <div className="row">
          <label>
            <input type="checkbox" checked={useWork} onChange={e => setUseWork(e.target.checked)} />
            Prefer proximity to work
          </label>
          <input placeholder="Work address (optional)" value={workAddress} onChange={e => setWorkAddress(e.target.value)} />
        </div>

        <p className="note">Note: proximity scoring requires geocoding / distance APIs; currently enabled controls adjust filters and scoring where data exists.</p>
      </section>

      <section className="customization">
        <h3>Cost assumptions (monthly)</h3>
        <div className="row">
          <label>Estimated utilities / month</label>
          <input type="number" value={utilitiesPerMonth} onChange={e => setUtilitiesPerMonth(e.target.value)} />
        </div>
        <div className="row">
          <label>Commute mode</label>
          <select value={commuteMode} onChange={e => setCommuteMode(e.target.value)}>
            <option value="drive">Drive</option>
            <option value="transit">Transit</option>
            <option value="none">None / work from home</option>
          </select>
          <label>One-way km</label>
          <input type="number" value={commuteKmOneWay} onChange={e => setCommuteKmOneWay(e.target.value)} />
          <label>Work days / month</label>
          <input type="number" value={workDaysPerMonth} onChange={e => setWorkDaysPerMonth(e.target.value)} />
        </div>
        <div className="row">
          <label>Fuel price (CAD / L)</label>
          <input type="number" step="0.01" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)} />
          <label>L / 100km</label>
          <input type="number" step="0.1" value={carEfficiency} onChange={e => setCarEfficiency(e.target.value)} />
          <label>Transit fare (one-way)</label>
          <input type="number" step="0.01" value={transitFare} onChange={e => setTransitFare(e.target.value)} />
        </div>
      </section>

      {loading ? <p>Loading...</p> : <ComparisonTable items={results} filters={filters} />}

    </div>
  )
}
