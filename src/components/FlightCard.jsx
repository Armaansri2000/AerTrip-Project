
import React, { useState } from "react";

function minutesToHours(min) {
  if (min === null || min === undefined || isNaN(min)) return "";
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}

function timeOnly(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return iso;
  }
}

function airlineInitials(airline) {
  if (!airline) return "—";
  const parts = airline.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.map(p => p[0]).join("").slice(0, 3).toUpperCase();
}

export default function FlightCard({ flight }) {
  const {
    origin,
    destination,
    departureTime,
    arrivalTime,
    durationMinutes,
    price,
    airline,
    logo,
    stops,
  } = flight;

  const [imgFailed, setImgFailed] = useState(false);

  const EMPTY_SVG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='100%25' height='100%25' fill='none'/%3E%3C/svg%3E";

  const showImage = !!logo && !imgFailed;

  return (
    <div className="flight-card">
      <div className="left">
        {showImage ? (
          <img
            className="airline-logo"
            src={logo}
            alt={airline}
            onError={(e) => {
              setImgFailed(true);
              e.currentTarget.onerror = null;
              e.currentTarget.src = EMPTY_SVG;
            }}
          />
        ) : (
          <div className="airline-initials">{airlineInitials(airline)}</div>
        )}

        <div className="airline-name">{airline}</div>
      </div>

      <div className="middle">
        <div className="times">
          <div className="dep">
            <div className="time">{timeOnly(departureTime)}</div>
            <div className="city">{origin}</div>
          </div>

          <div className="duration">
            <div>{minutesToHours(durationMinutes)}</div>
            <div className="stops">
              {stops ? `${stops} Stop${stops > 1 ? "s" : ""}` : "Non-stop"}
            </div>
          </div>

          <div className="arr">
            <div className="time">{timeOnly(arrivalTime)}</div>
            <div className="city">{destination}</div>
          </div>
        </div>
      </div>

      <div className="right">
        <div className="price">₹{price}</div>
        <button className="book-btn">Book</button>
      </div>
    </div>
  );
}
