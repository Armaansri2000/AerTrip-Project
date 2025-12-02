import React from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

export default function PriceSlider({ min, max, value, onChange }) {
  return (
    <div className="price-slider">
      <div className="price-values">
        <div>Min: ₹{value[0]}</div>
        <div>Max: ₹{value[1]}</div>
      </div>

      <Slider
        range         // enables range mode (two handles)
        min={min}
        max={max}
        value={value}
        allowCross={false}
        onChange={onChange}
      />
    </div>
  )
}

