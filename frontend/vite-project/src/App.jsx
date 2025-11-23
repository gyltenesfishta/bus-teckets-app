import { useState, useMemo } from "react";
import "./App.css";

// Linjat tona me çmimet bazë (për një drejtim)
const ROUTES = [
  { id: 1, from: "Prishtinë", to: "Podujevë", price: 1.5 },
  { id: 2, from: "Prishtinë", to: "Fushë Kosovë", price: 1.5 },
  { id: 3, from: "Prishtinë", to: "Lipjan", price: 1.5 },
  { id: 4, from: "Prishtinë", to: "Pejë", price: 4.5 },
  { id: 5, from: "Prishtinë", to: "Gjilan", price: 4.0 },
  { id: 6, from: "Prishtinë", to: "Ferizaj", price: 4.0 },
  { id: 7, from: "Prishtinë", to: "Prizren", price: 5.0 },
  { id: 8, from: "Prishtinë", to: "Deçan", price: 5.0 },
  { id: 9, from: "Prishtinë", to: "Malishevë", price: 3.5 },
];

// gjej çmimin për një drejtim, pavarësisht drejtimit
function getRoutePrice(from, to) {
  if (from === to) return null;

  const route = ROUTES.find(
    (r) =>
      (r.from === from && r.to === to) ||
      (r.from === to && r.to === from)
  );
  return route ? route.price : null;
}

// gjej ID-në e linjës (route_id) sipas from/to
function getRouteId(from, to) {
  if (from === to) return null;

  const route = ROUTES.find(
    (r) =>
      (r.from === from && r.to === to) ||
      (r.from === to && r.to === from)
  );
  return route ? route.id : null;
}

function App() {
  const [tripType, setTripType] = useState("round-trip"); // "one-way" / "round-trip"
  const [from, setFrom] = useState("Prishtinë");
  const [to, setTo] = useState("Gjilan");

  const todayISO = new Date().toISOString().slice(0, 10);
  const [departureDate, setDepartureDate] = useState(todayISO);
  const [returnDate, setReturnDate] = useState(todayISO);
  const [passengers, setPassengers] = useState(1);

  // rezultati i fundit i Search
  const [searchResult, setSearchResult] = useState(null);

  // state për rezervimin real
  const [reservationResult, setReservationResult] = useState(null);
  const [reserveError, setReserveError] = useState(null);
  const [isReserving, setIsReserving] = useState(false);

  const isRoundTrip = tripType === "round-trip";

  // çmimi bazë për një drejtim, sipas From/To
  const basePrice = useMemo(
    () => getRoutePrice(from, to),
    [from, to]
  );

  const handleSwapCities = () => {
    setFrom(to);
    setTo(from);
  };

  const handlePassengersChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (Number.isNaN(value) || value < 1) {
      setPassengers(1);
    } else if (value > 10) {
      setPassengers(10);
    } else {
      setPassengers(value);
    }
  };

  // kur shtypet Search – vetëm llogari, pa backend
  const handleSubmit = (e) => {
    e.preventDefault();

    // nëse nuk ka linjë valide (p.sh. From == To)
    if (!basePrice) {
      setSearchResult({
        error: "route-not-found",
      });
      return;
    }

    const price_per_leg = basePrice;
    const legs = isRoundTrip ? 2 : 1;
    const total_price = price_per_leg * passengers * legs;

    setSearchResult({
      from,
      to,
      trip_type: tripType,
      departureDate,
      returnDate: isRoundTrip ? returnDate : null,
      passengers,
      price_per_leg,
      total_price,
    });

    // sa herë bëjmë Search, pastro rezultatin e vjetër të rezervimit
    setReservationResult(null);
    setReserveError(null);
  };

  // b) Kur shtypet "Rezervo biletat" – thërrasim /api/tickets
  const handleReserve = async () => {
    if (!searchResult || searchResult.error) return;

    const tripId = getRouteId(from, to);
    if (!tripId) {
      setReserveError("Nuk u gjet asnjë linjë për këtë drejtim.");
      setReservationResult(null);
      return;
    }

    try {
      setIsReserving(true);
      setReserveError(null);
      setReservationResult(null);

      const response = await fetch("http://127.0.0.1:5000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          count: passengers, // sa bileta po blejmë
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setReserveError(errData.error || "Gabim gjatë rezervimit.");
        return;
      }

      const data = await response.json();
      // data: { trip_id, count, tickets: [{ seat_no, price, token }, ...] }
      setReservationResult(data);
    } catch (err) {
      setReserveError("Nuk mund të lidhem me serverin.");
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="app-root">
      {/* HERO JESHIL SIPËR */}
      <header className="hero">
        <h1>Udhëtime me autobus me kosto të ulët</h1>
        <p>
          Rezervo online biletat për linjat ndërmjet Prishtinës
          dhe qyteteve përreth.
        </p>
      </header>

      {/* FORMA + REZULTATET */}
      <main className="search-section">
        <div className="search-card">
          {/* One way / Round trip */}
          <div className="trip-type-row">
            <label className="radio">
              <input
                type="radio"
                name="tripType"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={() => setTripType("one-way")}
              />
              <span>One Way</span>
            </label>
            <label className="radio">
              <input
                type="radio"
                name="tripType"
                value="round-trip"
                checked={tripType === "round-trip"}
                onChange={() => setTripType("round-trip")}
              />
              <span>Round Trip</span>
            </label>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            {/* From / To */}
            <div className="row">
              <div className="field">
                <label>From</label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                >
                  <option value="Prishtinë">Prishtinë</option>
                </select>
              </div>

              <button
                type="button"
                className="swap-btn"
                onClick={handleSwapCities}
              >
                ⇄
              </button>

              <div className="field">
                <label>To</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                >
                  {ROUTES.map((r) => (
                    <option key={r.to} value={r.to}>
                      {r.to}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Datat + pasagjerët */}
            <div className="row">
              <div className="field">
                <label>Departure</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={todayISO}
                />
              </div>

              <div className="field">
                <label>Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departureDate}
                  disabled={!isRoundTrip}
                />
              </div>

              <div className="field">
                <label>Passengers</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={passengers}
                  onChange={handlePassengersChange}
                />
              </div>
            </div>

            {/* Butonat poshtë */}
            <div className="row row-bottom">
              <button type="submit" className="search-button">
                Search
              </button>

              {searchResult && !searchResult.error && (
                <button
                  type="button"
                  className="search-button reserve-button"
                  onClick={handleReserve}
                  disabled={isReserving}
                >
                  {isReserving ? "Duke rezervuar..." : "Rezervo biletat"}
                </button>
              )}
            </div>
          </form>

          {/* Përmbledhja e çmimit */}
          <div className="price-summary">
            <p>
              Çmimi bazë:{" "}
              {basePrice ? (
                <>
                  <strong>{basePrice.toFixed(2)} €</strong> / pasagjer
                  (një drejtim)
                </>
              ) : (
                "- € / pasagjer (zgjedh relacione valide)"
              )}
            </p>

            <p>
              Totali për këtë kërkim:{" "}
              {searchResult && !searchResult.error ? (
                <>
                  <strong>
                    {searchResult.total_price.toFixed(2)} €
                  </strong>{" "}
                  {isRoundTrip ? "(vajtje–ardhje)" : "(një drejtim)"}
                </>
              ) : (
                "- € (shtyp Search)"
              )}
            </p>
          </div>
        </div>

        {/* REZULTATI I KËRKIMIT */}
        {searchResult && (
          <section className="result-card">
            {searchResult.error === "route-not-found" ? (
              <p className="result-error">
                Nuk u gjet linjë valide për këtë drejtim. Të lutem
                zgjidh një kombinim tjetër From / To.
              </p>
            ) : (
              <>
                <h2>Rezultati i kërkimit</h2>
                <ul className="result-details">
                  <li>
                    <strong>Drejtimi:</strong> {searchResult.from} →{" "}
                    {searchResult.to}
                  </li>
                  <li>
                    <strong>Lloji udhëtimit:</strong>{" "}
                    {searchResult.trip_type === "round-trip"
                      ? "Vajtje–ardhje"
                      : "Një drejtim"}
                  </li>
                  <li>
                    <strong>Data e nisjes:</strong>{" "}
                    {searchResult.departureDate}
                  </li>
                  {searchResult.trip_type === "round-trip" &&
                    searchResult.returnDate && (
                      <li>
                        <strong>Data e kthimit:</strong>{" "}
                        {searchResult.returnDate}
                      </li>
                    )}
                  <li>
                    <strong>Pasagjerë:</strong>{" "}
                    {searchResult.passengers}
                  </li>
                  <li>
                    <strong>Çmimi bazë:</strong>{" "}
                    {searchResult.price_per_leg.toFixed(2)} € / pasagjer
                    (një drejtim)
                  </li>
                  <li>
                    <strong>Totali:</strong>{" "}
                    {searchResult.total_price.toFixed(2)} €
                  </li>
                </ul>
              </>
            )}
          </section>
        )}

        {/* REZULTATI I REZERVIMIT REAL */}
        {reservationResult && (
          <section className="result-card">
            <h2>Rezervimi i biletave</h2>
            <p>
              U rezervuan{" "}
              <strong>{reservationResult.count}</strong> bileta
              për këtë udhëtim.
            </p>
            <ul className="result-details">
              {reservationResult.tickets.map((t, idx) => (
                <li key={idx}>
                  Vendi: <strong>{t.seat_no}</strong>, Çmimi:{" "}
                  <strong>{t.price.toFixed(2)} €</strong>
                  <br />
                  Token: <code>{t.token}</code>
                </li>
              ))}
            </ul>
          </section>
        )}

        {reserveError && (
          <section className="result-card error-card">
            <strong>{reserveError}</strong>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

