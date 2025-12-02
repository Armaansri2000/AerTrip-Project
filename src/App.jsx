

import React, { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import FlightList from './components/FlightList'
import SortBar from './components/Filters/SortBar'
import PriceSlider from './components/Filters/PriceSlider'
import flightsRaw from './data/flights.json' // ensure JSON is present here

function normalizeData(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map(f => ({
      origin: f.origin ?? f.fr ?? '',
      destination: f.destination ?? f.to ?? '',
      departureTime: f.departureTime ?? f.dt ?? '',
      arrivalTime: f.arrivalTime ?? f.at ?? '',
      durationMinutes: f.durationMinutes ?? f.ft ?? (f.tt ? Number(f.tt) : 0),
      price: Number(f.price ?? f.farepr ?? (f.fare && f.fare.gross_fare && f.fare.gross_fare.value) ?? 0),
      stops: Number(f.stp ?? f.stops ?? 0),
      refundable: f.refundable ?? false,
      airline: f.airline ?? (Array.isArray(f.al) ? f.al[0] : f.al) ?? f.al ?? '',
      flightNumber: f.flightNumber ?? f.fn ?? f.id ?? ''
    }))
  }

  if (raw.flights && Array.isArray(raw.flights)) {
    return normalizeData(raw.flights)
  }

  const flights = []
  function findJ(obj) {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj.j)) {
      obj.j.forEach(entry => {
        flights.push({
          origin: entry.fr ?? '',
          destination: entry.to ?? '',
          departureTime: entry.dt ?? '',
          arrivalTime: entry.at ?? '',
          durationMinutes: (entry.tt ? Number(entry.tt) : 0),
          price: Number(entry.farepr ?? 0),
          airline: (Array.isArray(entry.al) ? entry.al[0] : entry.al) ?? entry.al ?? '',
          stops: Number(entry.stp ?? 0),
          flightNumber: entry.fn ?? ''
        })
      })
    } else {
      Object.values(obj).forEach(v => findJ(v))
    }
  }
  findJ(raw)
  return flights
}

const flights = normalizeData(flightsRaw)

export default function App(){
  // price range default based on data
  const prices = flights.map(f => Number(f.price || 0))
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 10000

  const [sortKey, setSortKey] = useState('priceAsc') // default per spec = Price low to high
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])

  // NEW: search params state
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    depart: '',
    retDepart: ''
  })

  useEffect(() => {
    setPriceRange([minPrice, maxPrice])
  }, [minPrice, maxPrice])

  // read URL params initially and whenever 'searchChanged' event fires
  useEffect(() => {
    function readParams() {
      const p = new URLSearchParams(window.location.search)
      setSearchParams({
        origin: p.get('origin') ?? '',
        destination: p.get('destination') ?? '',
        depart: p.get('depart') ?? '',
        retDepart: p.get('return') ?? ''
      })
    }
    readParams()
    window.addEventListener('searchChanged', readParams)
    // also update on popstate to support back/forward
    window.addEventListener('popstate', readParams)
    return () => {
      window.removeEventListener('searchChanged', readParams)
      window.removeEventListener('popstate', readParams)
    }
  }, [])

  const filtered = useMemo(() => {
    const [low, high] = priceRange
    let filteredList = flights.filter(f => {
      const p = Number(f.price || 0)
      return p >= low && p <= high
    })

    // Apply origin/destination/depart filters from URL (if provided)
    const orig = (searchParams.origin || '').trim().toLowerCase()
    const dest = (searchParams.destination || '').trim().toLowerCase()
    const depart = (searchParams.depart || '').trim()
    const ret = (searchParams.retDepart || '').trim()

    if (orig) {
      filteredList = filteredList.filter(f => (String(f.origin || '')).toLowerCase().includes(orig))
    }
    if (dest) {
      filteredList = filteredList.filter(f => (String(f.destination || '')).toLowerCase().includes(dest))
    }

    // If departure time stored as date string in departureTime, allow exact match if user provided a date.
    // This assumes departureTime may contain a date or time — adjust if your JSON uses separate date fields.
    if (depart) {
      filteredList = filteredList.filter(f => {
        const dt = String(f.departureDate || f.departureTime || f.dt || '').slice(0,10)
        return dt ? dt === depart : true
      })
    }
    if (ret) {
      filteredList = filteredList.filter(f => {
        const at = String(f.arrivalDate || f.arrivalTime || f.at || '').slice(0,10)
        return at ? at === ret : true
      })
    }

    // Sort
    if (sortKey === 'priceAsc') filteredList.sort((a,b) => a.price - b.price)
    else if (sortKey === 'priceDesc') filteredList.sort((a,b) => b.price - a.price)
    else if (sortKey === 'durationAsc') filteredList.sort((a,b) => a.durationMinutes - b.durationMinutes)
    else if (sortKey === 'departAsc') filteredList.sort((a,b) => (a.departureTime || '').localeCompare(b.departureTime || ''))
    else if (sortKey === 'arriveAsc') filteredList.sort((a,b) => (a.arrivalTime || '').localeCompare(b.arrivalTime || ''))

    return filteredList
  }, [priceRange, sortKey, searchParams])

  function clearFilters(){
    setPriceRange([minPrice, maxPrice])
    setSortKey('priceAsc')
    // Clear URL params (optional)
    // window.history.pushState({}, '', window.location.pathname)
    setSearchParams({ origin: '', destination: '', depart: '', retDepart: '' })
  }

  return (
    <div className="app">
      <Header />
      <div className="container">
        <aside className="left-panel">
          <div className="filters-card">
            <h3>Filters</h3>
            <PriceSlider
              min={minPrice}
              max={maxPrice}
              value={priceRange}
              onChange={(v)=>setPriceRange(v)}
            />
            <button className="clear-btn" onClick={clearFilters}>Clear Filters</button>
            <div className="flight-count">Results: {filtered.length}</div>
          </div>
        </aside>

        <main className="results">
          <SortBar
            current={sortKey}
            onChange={(key)=>setSortKey(key)}
          />
          <FlightList flights={filtered} />
        </main>
      </div>
    </div>
  )
}
