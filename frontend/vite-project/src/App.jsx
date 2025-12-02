import { useState, useMemo } from "react";
import "./App.css";
import SearchResults from "./SearchResults";
import { QRCodeCanvas } from "qrcode.react";
import { QrReader } from "react-qr-reader";




// Linjat tona me çmimet bazë (për një drejtim)
const ROUTES = [
  { id: 1, from: "Pristina", to: "Podujevo", price: 1.5 },
  { id: 2, from: "Pristina", to: "Fushe Kosove", price: 1.5 },
  { id: 3, from: "Pristina", to: "Lipjan", price: 1.5 },
  { id: 4, from: "Pristina", to: "Peja", price: 4.5 },
  { id: 5, from: "Pristina", to: "Gjilan", price: 4.0 },
  { id: 6, from: "Pristina", to: "Ferizaj", price: 4.0 },
  { id: 7, from: "Pristina", to: "Prizren", price: 5.0 },
  { id: 8, from: "Pristina", to: "Deçan", price: 5.0 },
  { id: 9, from: "Pristina", to: "Malisheva", price: 3.5 },
];

// çmimi për një drejtim, pavarësisht kahjes
function getRoutePrice(from, to) {
  if (from === to) return null;

  const route = ROUTES.find(
    (r) =>
      (r.from === from && r.to === to) ||
      (r.from === to && r.to === from)
  );
  return route ? route.price : null;
}

// ID e linjës sipas from/to
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
  const [from, setFrom] = useState("Pristina");
  const [to, setTo] = useState("Gjilan");
  const [email, setEmail] = useState("");
  



  const todayISO = new Date().toISOString().slice(0, 10);
  const [departureDate, setDepartureDate] = useState(todayISO);
  const [returnDate, setReturnDate] = useState(todayISO);
  const [isPassengersOpen, setIsPassengersOpen] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

// total pasagjerë = adults + children
  const passengers = useMemo(
  () => adults + children,
  [adults, children]
);

  // rezultati i fundit i Search
  const [searchResult, setSearchResult] = useState(null);

  // state për rezervimin real
  const [reservationResult, setReservationResult] = useState(null);
  const [reserveError, setReserveError] = useState(null);
  const [isReserving, setIsReserving] = useState(false);

  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // view: "search" | "results" | "payment"
  const [view, setView] = useState("search");

  // për kontrollimin e biletës
  const [validateToken, setValidateToken] = useState("");
  const [validateResult, setValidateResult] = useState(null);
  const [validateError, setValidateError] = useState(null);

  const [scanMode, setScanMode] = useState(false);



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

  const handleAdultsIncrement = () => {
  setAdults((prev) => Math.min(10, prev + 1));
};

const handleAdultsDecrement = () => {
  setAdults((prev) => Math.max(1, prev - 1)); // të paktën 1 adult
};

const handleChildrenIncrement = () => {
  setChildren((prev) => Math.min(10, prev + 1));
};

const handleChildrenDecrement = () => {
  setChildren((prev) => Math.max(0, prev - 1));
};

// Teksti që shfaqet në butonin "Passengers"
const passengerLabel = useMemo(() => {
  const parts = [];
  if (adults === 1) parts.push("1 Adult");
  else if (adults > 1) parts.push(`${adults} Adults`);

  if (children === 1) parts.push("1 Child");
  else if (children > 1) parts.push(`${children} Children`);

  if (parts.length === 0) return "Passengers";
  return parts.join(", ");
}, [adults, children]);


  const handleAdultsChange = (e) => {
  const value = parseInt(e.target.value, 10);
  if (Number.isNaN(value) || value < 1) {
    setAdults(1);
  } else if (value > 10) {
    setAdults(10);
  } else {
    setAdults(value);
  }
};

const handleChildrenChange = (e) => {
  const value = parseInt(e.target.value, 10);
  if (Number.isNaN(value) || value < 0) {
    setChildren(0);
  } else if (value > 10) {
    setChildren(10);
  } else {
    setChildren(value);
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
      setView("trips");
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
    setPaymentStatus(null);
    setPaymentError(null);
    setView("trips");
  };

  // Kur shtypet "Rezervo biletat" – thërrasim /api/tickets
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
          count: passengers,
          email: "gyltene.sfishta@gmail.com", 
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
      setView("payment");
    } catch (err) {
      setReserveError("Nuk mund të lidhem me serverin.");
    } finally {
      setIsReserving(false);
    }
  };

  const handleValidateTicket = async (e) => {
    e.preventDefault?.();

    const token = validateToken.trim();
    if (!token) return;

    try {
      setValidateError(null);
      setValidateResult(null);

      const response = await fetch(
        `http://127.0.0.1:5000/api/tickets/${encodeURIComponent(token)}`
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setValidateError(errData.error || "Gabim gjatë kontrollit të biletës.");
        return;
      }

      const data = await response.json();
      setValidateResult(data);
    } catch (err) {
      setValidateError("Nuk mund të lidhem me serverin.");
    }
  };

  const handleConfirmPayment = async () => {
    if (!reservationResult || !reservationResult.tickets) return;

    const tokens = reservationResult.tickets.map((t) => t.token);

    try {
      setIsPaying(true);
      setPaymentError(null);
      setPaymentStatus(null);

      const response = await fetch("http://127.0.0.1:5000/api/tickets/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setPaymentError(errData.error || "Gabim gjatë konfirmimit të pagesës.");
        return;
      }

      const data = await response.json();
      setPaymentStatus(
        `U konfirmuan ${data.paid_count} bileta. ${
          data.already_paid && data.already_paid.length
            ? "Disa bileta kanë qenë tashmë të paguara."
            : ""
        }`
      );
    } catch (err) {
      setPaymentError("Nuk mund të lidhem me serverin për pagesë.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="app-root">
      {/* HERO */}
      <header className="hero">
        <h1>Low cost bus travel</h1>
        <p>
          Book bus tickets online for routes between Prishtina and nearby cities
        </p>
      </header>

      <main className="search-section">
        {/* --------------- FAQJA 1: KËRKIMI --------------- */}
        {view === "search" && (
          <div className="search-card">
            {/* Tipi i udhëtimit */}
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

            {/* Forma e kërkimit */}
            <form className="search-form" onSubmit={handleSubmit}>
              {/* From & To */}
          
            <div className="row city-row">

                <div className="field">
                  <label>From</label>
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  >
                    <option value="Pristina">Pristina</option>
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

              
<div className="row city-row">
    <label>Email</label>
    <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
    />
</div>


              {/* Dates + Passengers */}
              <div className="row date-passenger-row">
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
                    disabled={tripType !== "round-trip"}
                  />
                </div>

                <div className="field passengers-dropdown">
  <label>Passengers</label>

  {/* Butoni që shfaq totalin dhe hap menunë */}
  <button
    type="button"
    className="passengers-toggle"
    onClick={() => setIsPassengersOpen((prev) => !prev)}
  >
    <span>{passengerLabel}</span>
    <span className="chevron">▾</span>
  </button>

  {isPassengersOpen && (
    <div className="passengers-menu">
      {/* Adults */}
      <div className="passengers-row">
        <div className="passengers-row-text">
          <div className="title">Adults</div>
          <div className="subtitle">15+ years</div>
        </div>
        <div className="passengers-counter">
          <button
            type="button"
            onClick={handleAdultsDecrement}
            className="counter-btn"
          >
            –
          </button>
          <span className="counter-value">{adults}</span>
          <button
            type="button"
            onClick={handleAdultsIncrement}
            className="counter-btn"
          >
            +
          </button>
        </div>
      </div>

      {/* Children */}
      <div className="passengers-row">
        <div className="passengers-row-text">
          <div className="title">Children</div>
          <div className="subtitle">0 to 14 years</div>
        </div>
        <div className="passengers-counter">
          <button
            type="button"
            onClick={handleChildrenDecrement}
            className="counter-btn"
          >
            –
          </button>
          <span className="counter-value">{children}</span>
          <button
            type="button"
            onClick={handleChildrenIncrement}
            className="counter-btn"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )}
</div>
              </div>




              <div className="row row-bottom">
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </form>

            {/* Price Summary */}
            <div className="price-summary">
              <p>
                Base price:{" "}
                {basePrice ? (
                  <>
                    <strong>{basePrice.toFixed(2)} €</strong> / passenger
                  </>
                ) : (
                  "- €"
                )}
              </p>
            </div>
          </div>
        )}


{/* --------------- FAQJA 2: LISTA E ORAREVE --------------- */}
{view === "trips" && searchResult && (
  <>
   <button
      type="button"
      className="search-button"
      onClick={() => setView("search")}
      style={{ marginBottom: "16px" }}
    >
      ← Back to search
    </button>
    {/* Kartela lart me From / To / Dates / Passengers – PA butonin Search */}
    <div className="search-card">
      {/* Tipi i udhëtimit (njësoj si në faqen e parë) */}
      <div className="trip-type-row">
        <label className="radio">
          <input
            type="radio"
            name="tripTypeTrips"
            value="one-way"
            checked={tripType === "one-way"}
            onChange={() => setTripType("one-way")}
          />
          <span>One Way</span>
        </label>

        <label className="radio">
          <input
            type="radio"
            name="tripTypeTrips"
            value="round-trip"
            checked={tripType === "round-trip"}
            onChange={() => setTripType("round-trip")}
          />
          <span>Round Trip</span>
        </label>
      </div>

      {/* Forma – por vetëm për shfaqje, pa onSubmit dhe pa buton Search */}
      <form className="search-form">
        {/* From & To */}
        <div className="row city-row">
          <div className="field">
            <label>From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled
            >
              <option value="Pristina">Pristina</option>
            </select>
          </div>

          <button
            type="button"
            className="swap-btn"
            onClick={handleSwapCities}
            disabled
          >
            ⇄
          </button>

          <div className="field">
            <label>To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled
            >
              {ROUTES.map((r) => (
                <option key={r.to} value={r.to}>
                  {r.to}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates + Passengers */}
        <div className="row date-passenger-row">
          <div className="field">
            <label>Departure</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={todayISO}
              disabled
            />
          </div>

          <div className="field">
            <label>Return</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate}
              disabled={tripType !== "round-trip"}
            />
          </div>

          <div className="field passengers-dropdown">
            <label>Passengers</label>

            <button
              type="button"
              className="passengers-toggle"
              disabled
            >
              <span>{passengerLabel}</span>
              <span className="chevron">▾</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    {/* Lista e orareve poshtë formës */}
    <SearchResults
      searchParams={{
        from,
        to,
        date: departureDate,
        passengers,
      }}
      onSelectTrip={({ route, trip }) => {
        // ruajmë udhëtimin e zgjedhur dhe kalojmë në faqen tjetër
        setSearchResult((prev) => ({
          ...prev,
          selectedRouteId: route.id,
          selectedTripId: trip.id,
        }));
        setView("results");
      }}
    />
  </>
)}




        {/* --------------- FAQJA 2: REZULTATET --------------- */}
        {view === "results" && searchResult && (
          <>
            {/* Kthehu mbrapa */}
            <button
              type="button"
              className="search-button"
              onClick={() => setView("search")}
              style={{ marginBottom: "20px" }}
            >
              ← Back to search
            </button>
            <button
  type="button"
  className="conductor-button"
  onClick={() => setView("conductor")}
>
  Conductor view
</button>


 


            {/* REZULTATI I KËRKIMIT */}
            {searchResult && (
  <section className="result-card">
    {searchResult.error === "route-not-found" ? (
      <p className="result-error">
        No valid route was found for this direction. Please choose another
        From / To combination.
      </p>
    ) : (
      <>
        <h2>Search result</h2>
        <ul className="result-details">
          <li>
            <strong>Route:</strong> {searchResult.from} → {searchResult.to}
          </li>
          <li>
            <strong>Trip type:</strong>{" "}
            {searchResult.trip_type === "round-trip"
              ? "Round trip"
              : "One way"}
          </li>
          <li>
            <strong>Departure date:</strong> {searchResult.departureDate}
          </li>
          {searchResult.trip_type === "round-trip" &&
            searchResult.returnDate && (
              <li>
                <strong>Return date:</strong> {searchResult.returnDate}
              </li>
            )}
          <li>
            <strong>Passengers:</strong> {searchResult.passengers}
          </li>
          <li>
            <strong>Base price:</strong>{" "}
            {searchResult.price_per_leg.toFixed(2)} € / passenger (one way)
          </li>
          <li>
            <strong>Total:</strong>{" "}
            {searchResult.total_price.toFixed(2)} €
          </li>
        </ul>

        <div className="field" style={{ marginTop: "16px" }}>
          <label>Email for ticket</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
          />
        </div>

        <button
          type="button"
          className="search-button reserve-button"
          onClick={handleReserve}
          disabled={isReserving || !email}
          style={{ marginTop: "16px" }}
        >
          {isReserving ? "Reserving..." : "Reserve tickets"}
        </button>
      </>
    )}
  </section>
)}

          </>
        )}


        {view === "conductor" && (
  <div style={{ textAlign: "center", marginTop: "40px" }}>
    <h2>Conductor panel</h2>
    <p>Scan ticket or enter token manually:</p>

    {/* Buton për ndez/fik kamerën */}
    <button
      type="button"
      className="conductor-button"
      style={{ marginBottom: "20px" }}
      onClick={() => setScanMode((prev) => !prev)}
    >
      {scanMode ? "Close camera" : "Open camera scanner"}
    </button>

    {/* KËTU ËSHTË SKANERI I VËRTETË */}
    {scanMode && (
      <div style={{ width: "280px", margin: "0 auto 24px" }}>
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={(result, error) => {
            if (!!result) {
              const text = result?.text || "";
              console.log("SCANNED:", text); // SHIKOJE NË CONSOLE
              setValidateToken(text);
            }
            if (error) {
              // vetëm për debug nëse don
              // console.log(error);
            }
          }}
          videoStyle={{ width: "100%" }}
        />
        <p style={{ fontSize: "14px", marginTop: "6px" }}>
          Point the camera at the QR code. When the token appears below, click "Check".
        </p>
      </div>
    )}

    {/* Forma për check token */}
    <section
      className="result-card"
      style={{ maxWidth: "500px", margin: "0 auto" }}
    >
      <h3>Check ticket</h3>

      <input
        value={validateToken}
        onChange={(e) => setValidateToken(e.target.value)}
        placeholder="Ticket token"
      />

      <button onClick={handleValidateTicket}>Check</button>

      {validateError && (
        <p style={{ color: "red", marginTop: "8px" }}>{validateError}</p>
      )}

      {validateResult && (
        <ul className="result-details">
          <li>Status: {validateResult.status}</li>
          <li>
            Route: {validateResult.from} → {validateResult.to}
          </li>
          <li>Departure: {validateResult.departure_at}</li>
          <li>Seat: {validateResult.seat_no}</li>
          <li>Price: {validateResult.price} €</li>
        </ul>
      )}
    </section>

    <button
      className="search-button"
      style={{ marginTop: "20px" }}
      onClick={() => setView("results")}
    >
      ← Back to results
    </button>
  </div>
)}



        {/* --------------- FAQJA 3: PAGESA / REZERVIMI --------------- */}
        {/* Ticket reservation */}
        {view === "payment" && reservationResult && (
          <section className="result-card">

    <h2>Ticket reservation</h2>

    <p>
      You reserved <strong>{reservationResult.count}</strong> ticket(s)
    </p>

    <ul className="result-details">
      {reservationResult.tickets.map((t, idx) => (
        <li key={idx} style={{ marginBottom: "20px" }}>
  Seat: {t.seat_no} — {t.price} €
  <br />
  

  {/* QR Code */}
  <div style={{ marginTop: "10px" }}>
    <QRCodeCanvas value={t.token} size={120} />
  </div>
</li>

      ))}
    </ul>




            {/* Confirm payment */}
<button
  className="search-button reserve-button"
  onClick={handleConfirmPayment}
  disabled={isPaying}
  style={{ marginTop: "12px" }}
>
  {isPaying ? "Confirming..." : "Confirm payment"}
</button>


            {paymentStatus && (
              <p style={{ color: "green", marginTop: "8px" }}>
                {paymentStatus}
              </p>
            )}
            {paymentError && (
              <p style={{ color: "red", marginTop: "8px" }}>{paymentError}</p>
            )}

            {/* Opsion kthehu te rezultatet */}
            <button
              type="button"
              className="search-button"
              onClick={() => setView("results")}
              style={{ marginTop: "16px" }}
            >
              ← Back to results
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
