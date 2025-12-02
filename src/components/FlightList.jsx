import React from 'react'
import FlightCard from './FlightCard'

export default function FlightList({ flights }) {
  if (!flights || flights.length === 0) {
    return <div className="no-results">No flights found for selected filters</div>
  }
  return (
    <div className="flight-list">
      {flights.map((f, idx) => <FlightCard key={idx + '_' + (f.flightNumber||idx)} flight={f} />)}
    </div>
  )
}
