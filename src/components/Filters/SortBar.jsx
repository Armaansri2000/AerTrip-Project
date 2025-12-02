import React from 'react'

const options = [
  { key: 'priceAsc', label: 'Price Low to high' },
  { key: 'durationAsc', label: 'Duration Shortest First' },
  { key: 'departAsc', label: 'Depart Earliest First' },
  { key: 'arriveAsc', label: 'Arrival Earliest First' }
]

export default function SortBar({ current, onChange }){
  return (
    <div className="sortbar">
      <div className="sort-options">
        {options.map(o => (
          <button
            key={o.key}
            className={`sort-btn ${current === o.key ? 'active' : ''}`}
            onClick={()=>onChange(o.key)}
          >
            {o.label}
            <span className="arrow">{current === o.key ? '▼' : '△' }</span>
          </button>
        ))}
      </div>
    </div>
  )
}
