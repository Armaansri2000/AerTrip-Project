import React, { useEffect, useRef, useState } from "react";
import flightsData from "../data/flights.json";

const RECENT_KEY = "aertrip_recent_searches";

function qsToState() {
  const p = new URLSearchParams(window.location.search);
  return {
    origin: p.get("origin") || "",
    destination: p.get("destination") || "",
    depart: p.get("depart") || "",
    retDepart: p.get("return") || "",
    adults: Number(p.get("adult") || 1),
  };
}

function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw).slice(0, 6) : [];
  } catch {
    return [];
  }
}

function saveRecent(entry) {
  const all = loadRecent();
  const merged = [
    entry,
    ...all.filter((e) => JSON.stringify(e) !== JSON.stringify(entry)),
  ].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(merged));
}

/* ----- Helper: extract YYYY-MM-DD from ISO datetime ----- */
function datePart(iso) {
  if (!iso) return "";
  return String(iso).split("T")[0];
}

/* ----- Helper: normalize for comparison ----- */
function norm(v) {
  return (v || "").toString().trim().toUpperCase();
}

/* ----- Filter flights array for one-way matching criteria ----- */
function filterFlightsArray(flights, { origin, destination, date }) {
  const o = norm(origin);
  const d = norm(destination);
  const dt = date || "";

  return flights.filter((f) => {
    if (o && norm(f.origin) !== o) return false;
    if (d && norm(f.destination) !== d) return false;
    // flights might already have date/departureDate; fallback to departureTime
    const fdate = (f.date || datePart(f.departureTime) || "").toString();
    if (dt && fdate.indexOf(dt) !== 0) return false;
    return true;
  });
}

export default function Header() {
  const preset = qsToState();

  const [search, setSearch] = useState({
    origin: preset.origin,
    destination: preset.destination,
    depart: preset.depart,
    retDepart: preset.retDepart,
    adults: preset.adults || 1,
  });

  const [recent, setRecent] = useState(loadRecent());
  const [showRecent, setShowRecent] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setShowRecent(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function update(k, v) {
    setSearch((p) => ({ ...p, [k]: v }));
  }

  function swap() {
    setSearch((p) => ({
      ...p,
      origin: p.destination,
      destination: p.origin,
    }));
  }

  function submit(e) {
    e.preventDefault();

    // build URL params and push (unchanged)
    const params = new URLSearchParams();
    if (search.origin) params.set("origin", search.origin);
    if (search.destination) params.set("destination", search.destination);
    if (search.depart) params.set("depart", search.depart);
    if (search.retDepart) params.set("return", search.retDepart);
    params.set("adult", search.adults);

    const newUrl = `${window.location.pathname}?${params.toString()}#searched`;
    window.history.pushState({}, "", newUrl);

    saveRecent({
      origin: search.origin,
      destination: search.destination,
      depart: search.depart,
      retDepart: search.retDepart,
    });

    // ----- NEW: filter flightsData here (one-place integration) -----
    // make a defensive copy of flights array
    const allFlights = Array.isArray(flightsData.flights) ? flightsData.flights : [];

    const departDate = search.depart || "";
    const returnDate = search.retDepart || "";

    // one-way/outbound
    const outbound = filterFlightsArray(allFlights, {
      origin: search.origin,
      destination: search.destination,
      date: departDate,
    });

    // if return date provided, find inbound flights (swap origin/destination)
    let inbound = [];
    if (returnDate) {
      inbound = filterFlightsArray(allFlights, {
        origin: search.destination,
        destination: search.origin,
        date: returnDate,
      });
    }

    // Dispatch detailed results so other parts of app can render them immediately.
    // detail: { outbound: [...], inbound: [...] } (inbound empty when one-way)
    try {
      window.dispatchEvent(
        new CustomEvent("searchResults", {
          detail: { outbound, inbound, params: { origin: search.origin, destination: search.destination, depart: departDate, ret: returnDate, adults: search.adults } },
        })
      );
    } catch (err) {
      // fallback for older browsers
      window.dispatchEvent(new Event("searchResults"));
    }

    // keep the old event too for backward compatibility
    window.dispatchEvent(new Event("searchChanged"));
  }

  return (
    <header className="aer-header" ref={ref}>

      {/* HEADER 1 — TOP BAR */}
      <div className="header-top">
        <div className="top-left">
          <a className="brand" href="/">
           <svg width="32" height="22" viewBox="0 0 30 20">
  <path
    d="M15 1 L23 15 L15 13 L7 15 L15 1"
    stroke="#fff"
    fill="none"
    strokeWidth="1.3"
  />
</svg>

            <span>A E R T R I P</span>
          </a>
        </div>

        <nav className="top-nav">
          <a href="/flights">FLIGHT</a>
          <a href="/hotel">HOTEL</a>
          <a href="/visa">VISA</a>
          <a href="/ai">AI TRIP</a>
        </nav>

        <div className="top-right">
          <button className="login-btn">LOGIN</button>
        </div>
      </div>

      {/* HEADER 2 — SEARCH SECTION  */}
      <div className="header-second">

        {/* Tabs */}
        <div className="search-tabs"></div>

        {/* Search Box */}
      <form className="search-row" onSubmit={submit}>
  
  {/* FROM */}
  <div className="field">
    <input
      value={search.origin}
      onChange={(e) => update("origin", e.target.value)}
      placeholder="From"
    />
  </div>

  {/* SWAP BUTTON BETWEEN BOXES */}
  <button type="button" className="swap-center" onClick={swap}>⇄</button>

  {/* TO */}
  <div className="field">
    <input
      value={search.destination}
      onChange={(e) => update("destination", e.target.value)}
      placeholder="To"
    />
  </div>

  {/* Depart */}
  <div className="field">
    <input
      type="date"
      value={search.depart}
      onChange={(e) => update("depart", e.target.value)}
    />
  </div>

  {/* Return */}
  <div className="field">
    <input
      type="date"
      value={search.retDepart}
      onChange={(e) => update("retDepart", e.target.value)}
    />
  </div>

  {/* Adults */}
  <div className="field small">
    <select
      value={search.adults}
      onChange={(e) => update("adults", Number(e.target.value))}
    >
      {[1,2,3,4,5,6,7].map(n => (
        <option key={n} value={n}>{n} Adult{n>1?"s":""}</option>
      ))}
    </select>
  </div>

  {/* Search Button */}
  <button type="submit" className="search-btn">Search</button>

</form>

        {/* Recent overlay */}
        {showRecent && recent.length > 0 && (
          <div className="recent-overlay">
            {recent.map((r, i) => (
              <div
                key={i}
                className="recent-item"
                onMouseDown={() => {
                  update("origin", r.origin);
                  update("destination", r.destination);
                  update("depart", r.depart);
                  update("retDepart", r.retDepart);
                  setShowRecent(false);
                }}
              >
                <strong>{r.origin}</strong> → <strong>{r.destination}</strong>
                <div className="sub">
                  {r.depart || "Any"} {r.retDepart ? `• ${r.retDepart}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </header>
  );
}
