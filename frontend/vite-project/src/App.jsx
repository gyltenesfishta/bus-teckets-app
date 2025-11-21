import { useState } from "react";
import "./App.css";

const ROUTES = [
  { from: "Prishtinë", to: "Podujevë", price: 1.5 },
  { from: "Prishtinë", to: "Fushë Kosovë", price: 1.5 },
  { from: "Prishtinë", to: "Lipjan", price: 1.5 },
  { from: "Prishtinë", to: "Pejë", price: 4.5 },
  { from: "Prishtinë", to: "Gjilan", price: 4.0 },
  { from: "Prishtinë", to: "Ferizaj", price: 4.0 },
  { from: "Prishtinë", to: "Prizren", price: 5.0 },
  { from: "Prishtinë", to: "Deçan", price: 5.0 },
  { from: "Prishtinë", to: "Malishevë", price: 3.5 },
];

function getRoutePrice(from, to) {
  const r = ROUTES.find(
    (rr) =>
      (rr.from === from && rr.to === to) ||
      (rr.from === to && rr.to === from)
  );
  return r ? r.price : 0;
}

function App() {
  const [tripType, setTripType] = useState("oneWay");
  const [from, setFrom] = useState("Prishtinë");
  const [to, setTo] = useState("Gjilan");
  const [departure, setDeparture] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [passengers, setPassengers] = useState(1);

  const basePrice = getRoutePrice(from, to);
  const isRoundTrip = tripType === "roundTrip";
  const total = basePrice * passengers * (isRoundTrip ? 2 : 1);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // këtu më vonë thërrasim backend-in /api/trips ose /api/tickets
    console.log("Search clicked", {
      tripType,
      from,
      to,
      departure,
      returnDate,
      passengers,
    });
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <h1>Udhëtime me autobus me kosto të ulët</h1>
          <p>
            Rezervo online biletat për linjat ndërmjet Prishtinës dhe qyteteve
            përreth.
          </p>
        </div>
      </header>

      <main className="main">
        <div className="search-card">
          {/* One way / Round trip */}
          <div className="trip-type-row">
            <label className="radio-pill">
              <input
                type="radio"
                name="tripType"
                value="oneWay"
                checked={tripType === "oneWay"}
                onChange={() => setTripType("oneWay")}
              />
              <span>One Way</span>
            </label>
            <label className="radio-pill">
              <input
                type="radio"
                name="tripType"
                value="roundTrip"
                checked={tripType === "roundTrip"}
                onChange={() => setTripType("roundTrip")}
              />
              <span>Round Trip</span>
            </label>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            {/* From */}
            <div className="field">
              <label>From</label>
              <div className="field-with-button">
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                >
                  {ROUTES.map((r) => (
                    <option key={r.to} value={r.from}>
                      {r.from}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="swap-btn"
                  onClick={handleSwap}
                  title="Ndërro drejtimin"
                >
                  ⇄
                </button>
              </div>
            </div>

            {/* To */}
            <div className="field">
              <label>To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {ROUTES.map((r) => (
                  <option key={r.to} value={r.to}>
                    {r.to}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure */}
            <div className="field">
              <label>Departure</label>
              <input
                type="date"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
              />
            </div>

            {/* Return only if Round Trip */}
            {isRoundTrip && (
              <div className="field">
                <label>Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
            </div>
            )}

            {/* Passengers */}
            <div className="field">
              <label>Passengers</label>
              <input
                type="number"
                min={1}
                max={10}
                value={passengers}
                onChange={(e) =>
                  setPassengers(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </div>

            {/* Search button */}
            <div className="field field-button">
              <button type="submit" className="primary-btn">
                Search
              </button>
            </div>
          </form>

          {/* Summary */}
          <div className="price-summary">
            <p>
              Çmimi bazë:{" "}
              <strong>{basePrice.toFixed(2)} €</strong> / pasagjer (një
              drejtim)
            </p>
            <p>
              Totali për këtë kërkim:{" "}
              <strong>{total.toFixed(2)} €</strong>{" "}
              {isRoundTrip && <span>(vajtje–ardhje)</span>}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
