import { useState, useMemo } from "react";
import "./App.css";

// 1. Linjat tona me çmimet bazë (për drejtim)
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

// 2. Kthe çmimin pavarësisht drejtimit (Prishtinë–Pejë = Pejë–Prishtinë)
function getRoutePrice(from, to) {
  const route = ROUTES.find(
    (r) =>
      (r.from === from && r.to === to) ||
      (r.from === to && r.to === from)
  );
  return route ? route.price : 0;
}

function App() {
  // lloji i udhëtimit
  const [tripType, setTripType] = useState("one-way"); // "one-way" ose "round"

  // From / To
  const [from, setFrom] = useState("Prishtinë");
  const [to, setTo] = useState("Gjilan");

  // Datat
  const today = new Date().toISOString().slice(0, 10);
  const [departureDate, setDepartureDate] = useState(today);
  const [returnDate, setReturnDate] = useState(today);

  // Numri i pasagjerëve
  const [passengers, setPassengers] = useState(1);

  // Çmimi
  const [basePrice, setBasePrice] = useState(getRoutePrice("Prishtinë", "Gjilan"));
  const [totalPrice, setTotalPrice] = useState(basePrice);

  // Sa herë që ndryshon from/to/passengers/tripType → ri-llogarit çmimin
  useMemo(() => {
    const pricePerDirection = getRoutePrice(from, to);
    setBasePrice(pricePerDirection);

    const directionMultiplier = tripType === "round" ? 2 : 1; // vajtje-ardhje
    const total = pricePerDirection * passengers * directionMultiplier;
    setTotalPrice(total);
  }, [from, to, passengers, tripType]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // këtu më vonë bëjmë thirrjen në backend me trip_id, dates, passengers, etj.
    console.log({
      tripType,
      from,
      to,
      departureDate,
      returnDate: tripType === "round" ? returnDate : null,
      passengers,
    });
    alert("Kërkimi u dërgua (front-end demonstruese).");
  };

  return (
    <div className="app">
      {/* Hero bar i gjelbër */}
      <header className="hero">
        <h1>Udhëtime me autobus me kosto të ulët</h1>
        <p>
          Rezervo online biletat për linjat ndërmjet Prishtinës dhe qyteteve përreth.
        </p>
      </header>

      {/* Karta kryesore */}
      <main className="search-container">
        <form className="search-card" onSubmit={handleSearch}>
          {/* One-way / Round-trip */}
          <div className="trip-type">
            <label>
              <input
                type="radio"
                name="tripType"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={() => setTripType("one-way")}
              />
              One Way
            </label>
            <label>
              <input
                type="radio"
                name="tripType"
                value="round"
                checked={tripType === "round"}
                onChange={() => setTripType("round")}
              />
              Round Trip
            </label>
          </div>

          {/* From / To */}
          <div className="row">
            <div className="field">
              <label>From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                <option>Prishtinë</option>
                <option>Podujevë</option>
                <option>Fushë Kosovë</option>
                <option>Lipjan</option>
                <option>Pejë</option>
                <option>Gjilan</option>
                <option>Ferizaj</option>
                <option>Prizren</option>
                <option>Deçan</option>
                <option>Malishevë</option>
              </select>
            </div>

            <button
              type="button"
              className="swap-btn"
              onClick={handleSwap}
              title="Ndërro drejtimin"
            >
              ⇅
            </button>

            <div className="field">
              <label>To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                <option>Prishtinë</option>
                <option>Podujevë</option>
                <option>Fushë Kosovë</option>
                <option>Lipjan</option>
                <option>Pejë</option>
                <option>Gjilan</option>
                <option>Ferizaj</option>
                <option>Prizren</option>
                <option>Deçan</option>
                <option>Malishevë</option>
              </select>
            </div>
          </div>

          {/* Datat + Passengers */}
          <div className="row">
            <div className="field">
              <label>Departure</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>

            {tripType === "round" && (
              <div className="field">
                <label>Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            )}

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
          </div>

          {/* Butoni + çmimet */}
          <div className="bottom-row">
            <button type="submit" className="search-btn">
              Search
            </button>

            <div className="price-info">
              <div>
                Çmimi bazë:{" "}
                <strong>{basePrice.toFixed(2)} €</strong> / pasagjer (një drejtim)
              </div>
              <div>
                Totali për këtë kërkim:{" "}
                <strong>{totalPrice.toFixed(2)} €</strong>
                {tripType === "round" && " (vajtje–ardhje)"}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default App;


