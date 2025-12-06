import { useState, useMemo } from "react";
import "./App.css";
import SearchResults from "./SearchResults";
import { QRCodeCanvas } from "qrcode.react";
import { QrReader } from "react-qr-reader";

const translations = {
  en: {
    heroTitle: "Low cost bus travel",
    heroSubtitle: "Book bus tickets online for routes between Prishtina and nearby cities",
    conductorView: "Conductor view",
    viewStats: "View statistics",
    oneWay: "One Way",
    roundTrip: "Round Trip",
    from: "FROM",
    to: "TO",
    oneway: "One way",
    roundtrip: "Round Trip",
    departure: "DEPARTURE",
    return: "RETURN",
    passengers: "PASSENGERS",
    search: "Search",
    outboundTrips: "Outbound trips",
    returnTrips: "Return trips",
    ticketReservation: "Ticket reservation",
    confirmPayment: "Confirm payment",
    ticketsConfirmed: "ticket confirmed",
    ticketsConfirmedPlural: "tickets confirmed",
    checkTicket: "Check ticket",
    routeStatistics: "Route statistics",
    route: "Route",
    ticketsSold: "Tickets sold",
    totalRevenue: "Total revenue (€)",
    avgPrice: "Avg price (€)",
    priceSummary: "Price summary",
    adults: "Adults",
    children: "Children (0–14)",
    totalPrice: "Total price",
    savings: "You saved",
    search: "Search",
    conductorView: "Conductor view",
    viewStats: "View statistics",
    ticketReservation: "Ticket reservation",
    confirmPayment: "Confirm payment",
    checkTicket: "Check ticket",
    routeStatistics: "Route statistics",
    route: "Route",
    ticketsSold: "Tickets sold",
    totalRevenue: "Total revenue (€)",
    avgPrice: "Avg price (€)",
    priceSummary: "Price summary",
    adults: "Adults",
    children: "Children (0–14)",
    totalPrice: "Total price",
    savings: "You saved",
    backToSearch: "Back to search",
    backToResults: "Back to results",
    basePriceLabel: "Base price",
    Passenger: "passenger",
    adultsAgeHint: "15+ years",
    childrenLabel: "Children (0–14)",
    childrenAgeHint: "0 to 14 years",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    adultsLabel: "Adults",
    conductorPanel: "Conductor panel",
    scanOrEnter: "Scan ticket or enter token manually:",
    openScanner: "Open camera scanner",
    checkTicketBox: "Check ticket",
    ticketToken: "Ticket token",
    checkButton: "Check",
    openCamera: "Open camera scanner",
    closeCamera: "Close camera scanner",
    pointCamera: "Point the camera at the QR code. When the token appears below, click “Check”.",
    ticketReservation: "Ticket reservation",
    youReserved: "You reserved",
    ticketSingular: "ticket",
    ticketPlural: "tickets",
    seatLabel: "Seat",
    childDiscountLabel: "Child -10%",
    priceSummary: "Price summary",
    adults: "Adults",
    children: "Children (0–14)",
    totalPrice: "Total price",
    youSaved: "You saved",
    confirmPaymentBtn: "Confirm payment",
    confirming: "Confirming...",
    paymentSuccess: "Payment successful. Tickets have been confirmed.",
    paymentFailed: "Payment failed. Please try again.",
    routeNotFound: "No valid route was found for this direction. Please choose another From / To combination.",
    roundTrip: "Round trip",
  oneWay: "One way",
  departureDate: "Departure date",
  returnDate: "Return date",
  emailForTicket: "Email for ticket",
  emailPlaceholder: "example@gmail.com",
  reserving: "Reserving...",
  reserveTickets: "Reserve tickets",
  Total:"Total:",
  Triptype: "Trip Type",
  Select: "Select",
  outboundTrips: "Outbound trips",
  stops: "stops",
  bus: "Bus",
  direct: "Direct",
  select: "Select",
  noTripsFound: "No trips found",
  tryAnother: "Try selecting another destination",
  busStation: "bus station",
  outboundTrips: "Outbound trips",
    busStation: "bus station",
    stops: "stops",
    bus: "Bus",
    direct: "Direct",
    select: "Select",
    noTripsFound: "No trips found",
    tryAnother: "Try selecting another destination.",
    routeStatsTitle: "Route statistics",
    routeColumn: "Route",
    ticketsSoldColumn: "Tickets sold",
    totalRevenueColumn: "Total revenue (€)",
    avgPriceColumn: "Avg price (€)",

  },
  sq: {
    routeStatsTitle: "Statistikat e linjave",
    routeColumn: "Linja",
    ticketsSoldColumn: "Bileta të shitura",
    totalRevenueColumn: "Të ardhura totale (€)",
    avgPriceColumn: "Çmimi mesatar (€)",
    outboundTrips: "Udhëtime të daljes",
    busStation: "stacion i autobusëve",
    stops: "ndalesa",
    bus: "Autobus",
    direct: "Direkt",
    select: "Zgjidh",
    noTripsFound: "Nuk u gjetën udhëtime",
    tryAnother: "Provo një destinacion tjetër.",
    adultsAgeHint: "15+ vjeç",
    childrenLabel: "Fëmijë (0–14)",
    childrenAgeHint: "0 deri në 14 vjeç",
    emailLabel: "Email",
    emailPlaceholder: "ju@example.com",
    heroTitle: "Udhëtime me autobus me kosto të ulët",
    heroSubtitle: "Rezervo bileta autobusi online për linjat ndërmjet Prishtinës dhe qyteteve përreth",
    conductorView: "Pamja e konduktorit",
    viewStats: "Statistikat e linjave",
    oneWay: "Vetëm një drejtim",
    roundTrip: "Udhëtim vajtje-ardhje",
    from: "PREJ",
    to: "DERI",
    departure: "NISJA",
    return: "KTHIMI",
    passengers: "PASAGJERËT",
    search: "Kërko",
    oneway: "Një drejtim",
    roundtrip: "Kthim & vajtje",
    outboundTrips: "Udhëtimet në dalje",
    returnTrips: "Udhëtimet në kthim",
    ticketReservation: "Rezervimi i biletës",
    confirmPayment: "Konfirmo pagesën",
    ticketsConfirmed: "biletë u konfirmua",
    ticketsConfirmedPlural: "bileta u konfirmuan",
    checkTicket: "Kontrollo biletën",
    routeStatistics: "Statistikat e linjave",
    route: "Linja",
    ticketsSold: "Bileta të shitura",
    totalRevenue: "Të ardhura totale (€)",
    avgPrice: "Çmimi mesatar (€)",
    priceSummary: "Përmbledhje e çmimit",
    adults: "Të rritur",
    children: "Fëmijë (0–14)",
    totalPrice: "Çmimi total",
    savings: "Kursyet",
    search: "Kërko",
    conductorView: "Pamja e konduktorit",
    viewStats: "Shiko statistikat",
    ticketReservation: "Rezervimi i biletës",
    confirmPayment: "Konfirmo pagesën",
    checkTicket: "Kontrollo biletën",
    routeStatistics: "Statistikat e linjave",
    route: "Linja",
    ticketsSold: "Bileta të shitura",
    totalRevenue: "Të ardhura totale (€)",
    avgPrice: "Çmimi mesatar (€)",
    priceSummary: "Përmbledhje e çmimit",
    adults: "Të rritur",
    children: "Fëmijë (0–14)",
    totalPrice: "Çmimi total",
    savings: "Kursyet",
    backToSearch: "Kthehu te kërkimi",
    backToResults: "Kthehu te rezultatet",
    basePriceLabel: "Çmimi bazë",
    Passenger: "për pasagjer",
    adultsLabel: "Të rritur",
    conductorPanel: "Paneli i konduktorit",
    scanOrEnter: "Skanoni biletën ose shkruani token-in manualisht:",
    openScanner: "Hape kamerën për skanim",
    checkTicketBox: "Kontrollo biletën",
    ticketToken: "Token i biletës",
    checkButton: "Kontrollo",
    openCamera: "Hap kamerën",
    closeCamera: "Mbyll kamerën",
    pointCamera: "Drejto kamerën kah kodi QR. Kur të shfaqet token më poshtë, kliko “Kontrollo”.",
    ticketReservation: "Rezervimi i biletës",
    youReserved: "Keni rezervuar",
    ticketSingular: "biletë",
    ticketPlural: "bileta",
    seatLabel: "Ulësja",
    childDiscountLabel: "Fëmijë -10%",
    priceSummary: "Përmbledhje e çmimit",
    adults: "Të rritur",
    children: "Fëmijë (0–14)",
    totalPrice: "Çmimi total",
    youSaved: "Keni kursyer",
    confirmPaymentBtn: "Konfirmo pagesën",
    confirming: "Duke u konfirmuar...",
    paymentSuccess: "Pagesa u krye me sukses. Biletat u konfirmuan.",
    paymentFailed: "Pagesa dështoi. Ju lutem provoni përsëri.",
    routeNotFound: "Nuk u gjet asnjë linjë valide për këtë drejtim. Ju lutemi zgjidhni kombinim tjetër Prej / Deri.",
  roundTrip: "Kthim & vajtje",
  oneWay: "Një drejtim",
  departureDate: "Data e nisjes",
  returnDate: "Data e kthimit",
  emailForTicket: "Email për biletën",
  emailPlaceholder: "shembull@gmail.com",
  reserving: "Duke rezervuar...",
  reserveTickets: "Rezervo biletat",
  Total: "Totali:",
  Triptype: "Lloji i udhëtimit",
  stops: "ndalesa",
    bus: "Autobus",
    direct: "Direkt",
    select: "Zgjidh",
    outboundTrips: "Udhëtime të daljes",
  stops: "ndalesa",
  bus: "Autobus",
  direct: "Direkt",
  select: "Zgjedh",
  noTripsFound: "Nuk u gjetën udhëtime",
  tryAnother: "Provo një destinacion tjetër",
  busStation: "stacion i autobusëve",
  
  },
};


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
  const [searchError, setSearchError] = useState(null);


  // state për rezervimin real
  const [reservationResult, setReservationResult] = useState(null);
  const [reserveError, setReserveError] = useState(null);
  const [isReserving, setIsReserving] = useState(false);

  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const [view, setView] = useState("search");
  const [lang, setLang] = useState("en");

  const t = (key) => translations[lang]?.[key] || key;


  // për kontrollimin e biletës
  const [validateToken, setValidateToken] = useState("");
  const [validateResult, setValidateResult] = useState(null);
  const [validateError, setValidateError] = useState(null);

  const [scanMode, setScanMode] = useState(false);

  const [checkinMessage, setCheckinMessage] = useState(null);
  const [checkinError, setCheckinError] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);



  // Përmbledhja e çmimit në bazë të biletave të rezervuara (adult/child + zbritja 10%)
  const priceSummary = useMemo(() => {
    if (!reservationResult || !reservationResult.tickets) return null;

    const tickets = reservationResult.tickets;
    let adultCount = 0;
    let childCount = 0;
    let totalPrice = 0;
    let fullPriceIfNoDiscount = 0;

    for (const t of tickets) {
      const price = Number(t.price) || 0;
      totalPrice += price;

      if (t.passenger_type === "child") {
        childCount += 1;
        // rikthe çmimin para zbritjes 10% (përafërsisht)
        fullPriceIfNoDiscount += price / 0.9;
      } else {
        adultCount += 1;
        fullPriceIfNoDiscount += price;
      }
    }

    const savings = fullPriceIfNoDiscount - totalPrice;

    return {
      adultCount,
      childCount,
      totalPrice,
      savings: savings > 0 ? savings : 0,
    };
  }, [reservationResult]);


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


const handleBack = () => {
  if (view === "payment") {
    setView("results");
  } else if (view === "results") {
    setView("trips");
  } else if (view === "trips") {
    setView("search");
  } else if (view === "conductor" || view === "stats") {
    setView("trips");
  } else {
    setView("search");
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

     setSearchError(null);

  // 1) Nuk ka asnjë pasagjer
  if (passengers <= 0) {
    setSearchError("Please select at least one passenger.");
    return;
  }

  // 2) Round trip me datë kthimi më të vogël se nisja
  if (isRoundTrip && returnDate < departureDate) {
    setSearchError("Return date cannot be earlier than departure date.");
    return;
  }

  // 3) nëse nuk ka linjë valide (p.sh. From == To)
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
          adults,      
          children, 
          email: email, 
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

    const handleCheckin = async () => {
    const token = validateToken.trim();
    if (!token) return;

    try {
      setCheckinError(null);
      setCheckinMessage(null);

      const response = await fetch(
        `http://127.0.0.1:5000/api/tickets/${encodeURIComponent(token)}/checkin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setCheckinError(data.error || "Error while checking in ticket.");
        return;
      }

      // update status në UI
      setCheckinMessage("Ticket marked as used.");
      setValidateResult((prev) =>
        prev ? { ...prev, status: "used" } : prev
      );
    } catch (err) {
      setCheckinError("Could not connect to server for check-in.");
    }
  };

    const handleLoadStats = async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);

      const response = await fetch("http://127.0.0.1:5000/api/stats/routes");
      const data = await response.json();

      if (!response.ok) {
        setStatsError(data.error || "Error loading statistics.");
        setStats(null);
        return;
      }

      setStats(data.routes || []);
      setView("stats");
    } catch (err) {
      setStatsError("Could not connect to server for statistics.");
      setStats(null);
    } finally {
      setIsLoadingStats(false);
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
        ` ${data.paid_count} tickets confirmed. ${
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
      {view !== "search" && (
  <button className="back-button" onClick={handleBack}>
    ←
  </button>
)}

{/* Language toggle */}
    <div className="lang-toggle">
      <button
        type="button"
        className={lang === "en" ? "lang-btn active" : "lang-btn"}
        onClick={() => setLang("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === "sq" ? "lang-btn active" : "lang-btn"}
        onClick={() => setLang("sq")}
      >
        SQ
      </button>
    </div>

    <header className="hero">
      <h1>{t("heroTitle")}</h1>
      <p>{t("heroSubtitle")}</p>
      
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
                <span>{t("oneway")}</span>
              </label>

              <label className="radio">
                <input
                  type="radio"
                  name="tripType"
                  value="round-trip"
                  checked={tripType === "round-trip"}
                  onChange={() => setTripType("round-trip")}
                />
                <span>{t("roundtrip")}</span>
              </label>
            </div>

            {/* Forma e kërkimit */}
            <form className="search-form" onSubmit={handleSubmit}>
              {/* From & To */}
          
            <div className="row city-row">

                <div className="field">
                  <label>{t("from")}</label>
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
                  <label>{t("to")}</label>
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
              
                  <div className="field">
    <label>{t("emailLabel")}</label>
    <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        required
    />
</div>
</div>
              

              
              {/* Dates + Passengers */}
              <div className="row date-passenger-row">
                <div className="field">
                  <label>{t("departure")}</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={todayISO}
                  />
                </div>

                <div className="field">
                  <label>{t("return")}</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate}
                    disabled={tripType !== "round-trip"}
                  />
                </div>

                <div className="field passengers-dropdown">
  <label>{t("passengers")}</label>

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
          <div className="title">{t("adults")}:</div>
          <div className="subtitle">{t("adultsAgeHint")}</div>
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
          <div className="title">{t("children")}</div>
          <div className="subtitle">{t("childrenAgeHint")}</div>
        </div>
        <div className="passengers-counter">
          <button
            type="button"
            onClick={handleChildrenDecrement}
            className="counter-btn"
          >
            -
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
                  {t("search")}
                </button>
              </div>
            </form>

            {searchError && (
  <p
    style={{
      marginTop: "10px",
      color: "#b91c1c",
      fontSize: "14px",
      textAlign: "center",
    }}
  >
    {searchError}
  </p>
)}


            {/* Price Summary */}
            <div className="price-summary">
              <p>
                {t("basePriceLabel")}:{" "}
                {basePrice ? (
                  <>
                    <strong>{basePrice.toFixed(2)} €</strong> / {t("Passenger")}
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
   
    <div className="top-actions">
  <button
    type="button"
    className="top-button"
    onClick={() => setView("conductor")}
  >
    {t("conductorView")}
  </button>

    <button
    type="button"
    className="top-button"
    onClick={handleLoadStats}
  >
    {t("viewStats")}
  </button>

</div>






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
          <span>{t("oneWay")}</span>
        </label>

        <label className="radio">
          <input
            type="radio"
            name="tripTypeTrips"
            value="round-trip"
            checked={tripType === "round-trip"}
            onChange={() => setTripType("round-trip")}
          />
          <span>{t("roundTrip")}</span>
        </label>
      </div>

      {/* Forma – por vetëm për shfaqje, pa onSubmit dhe pa buton Search */}
      <form className="search-form">
        {/* From & To */}
        <div className="row city-row">
          <div className="field">
            <label>{t("from")}</label>
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
            <label>{t("to")}</label>
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
            <label>{t("departure")}</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={todayISO}
              disabled
            />
          </div>

          <div className="field">
            <label>{t("return")}</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate}
              disabled={tripType !== "round-trip"}
            />
          </div>

          <div className="field passengers-dropdown">
            <label>{t("passengers")}</label>

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
      t={t}   
    />
  </>
)}


{view === "stats" && (
  <section className="result-card" style={{ marginTop: "20px" }}>
    <h2>{t("routeStatsTitle")}</h2>

    {isLoadingStats && <p>Loading statistics...</p>}

    {statsError && (
      <p style={{ color: "red" }}>{statsError}</p>
    )}

    {stats && stats.length > 0 && !isLoadingStats && !statsError && (
      <table className="stats-table">
        <thead>
          <tr>
          <th>{t("routeColumn")}</th>
          <th>{t("ticketsSoldColumn")}</th>
          <th>{t("totalRevenueColumn")}</th>
          <th>{t("avgPriceColumn")}</th>
        </tr>
        </thead>
        <tbody>
          {stats.map((row, idx) => (
            <tr key={idx}>
              <td>{row.route_name}</td>
              <td>{row.tickets_sold}</td>
              <td>{row.total_revenue.toFixed(2)}</td>
              <td>{row.avg_price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {stats && stats.length === 0 && !isLoadingStats && !statsError && (
      <p>No sold tickets yet.</p>
    )}

  
  </section>
)}


        {/* --------------- FAQJA 2: REZULTATET --------------- */}
{view === "results" && searchResult && (
  <>
    {/* REZULTATI I KËRKIMIT */}
    {searchResult && (
      <section className="result-card">
        {searchResult.error === "route-not-found" ? (
          <p className="result-error">
            {t("routeNotFound")}
          </p>
        ) : (
          <>
            <h2>{t("Searchresult")}</h2>

            <ul className="result-details">
              <li>
                <strong>{t("Route:")}</strong> {searchResult.from} → {searchResult.to}
              </li>

              <li>
                <strong>{t("Triptype")}:</strong>{" "}
                {searchResult.trip_type === "round-trip"
                  ? t("roundTrip")
                  : t("oneWay")}
              </li>

              <li>
                <strong>{t("departureDate")}:</strong> {searchResult.departureDate}
              </li>

              {searchResult.trip_type === "round-trip" && searchResult.returnDate && (
                <li>
                  <strong>{t("returnDate")}:</strong> {searchResult.returnDate}
                </li>
              )}

              <li>
                <strong>{t("Passengers")}:</strong> {searchResult.passengers}
              </li>

              <li>
                <strong>{t("basePriceLabel")}:</strong>{" "}
                {searchResult.price_per_leg.toFixed(2)} € / {t("Passenger")}
              </li>

              <li>
                <strong>{t("Total:")}</strong>{" "}
                {searchResult.total_price.toFixed(2)} €
              </li>
            </ul>

            <div className="field" style={{ marginTop: "16px" }}>
              <label>{t("emailForTicket")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
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
              {isReserving ? t("reserving") : t("reserveTickets")}
            </button>
          </>
        )}
      </section>
    )}
  </>
)}




        {view === "conductor" && (
          
  <div style={{ textAlign: "center", marginTop: "40px" }}>
    <h2>{t("conductorPanel")}</h2>
    <p>{t("scanOrEnter")}:</p>

    {/* Buton për ndez/fik kamerën */}
    <button
      type="button"
      className="conductor-button"
      style={{ marginBottom: "20px" }}
      onClick={() => setScanMode((prev) => !prev)}
    >
      {scanMode ? t("closeCamera") : t("openCamera")}
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
          {t("pointCamera")}
        </p>
      </div>
    )}

    {/* Forma për check token */}
    <section
      className="result-card"
      style={{ maxWidth: "500px", margin: "0 auto" }}
    >
      <h3>{t("checkTicket")}</h3>

      <input
        value={validateToken}
        onChange={(e) => setValidateToken(e.target.value)}
        placeholder="Ticket token"
      />

      <button onClick={handleValidateTicket}>{t("checkButton")}</button>

      {validateError && (
        <p style={{ color: "red", marginTop: "8px" }}>{validateError}</p>
      )}

            {validateResult && (
        <>
          <ul className="result-details">
            <li>{t("status")}: {validateResult.status}</li>
            <li>
              {t("route")}: {validateResult.from} → {validateResult.to}
            </li>
            <li>{t("departure")}: {validateResult.departure_at}</li>
            <li>{t("seat")}: {validateResult.seat_no}</li>
            <li>{t("price")}: {validateResult.price} €</li>
          </ul>

          {/* Butoni "Mark as used" vetëm kur statusi është paid */}
          {validateResult.status === "paid" && (
            <button
              type="button"
              className="search-button"
              style={{ marginTop: "10px" }}
              onClick={handleCheckin}
            >
              {t("Markasused")}
            </button>
          )}

          {checkinMessage && (
            <p style={{ color: "green", marginTop: "8px" }}>
              {checkinMessage}
            </p>
          )}

          {checkinError && (
            <p style={{ color: "red", marginTop: "8px" }}>
              {checkinError}
            </p>
          )}
        </>
      )}

    </section>

    
  </div>
)}

        {/* --------------- FAQJA 3: PAGESA / REZERVIMI --------------- */}
        {/* Ticket reservation */}
        {view === "payment" && reservationResult && (
          <section className="result-card">

    <h2>{t("ticketReservation")}</h2>

    <p>
      {t("youReserved")} <strong>
        {reservationResult.count}{" "}
        {reservationResult.count === 1
          ? t("ticketSingular")
          : t("ticketPlural")}
      </strong>
    </p>

        <ul className="result-details">
      {reservationResult.tickets.map((ticket, idx) => (
        <li key={idx} style={{ marginBottom: "20px" }}>
          {t("seatLabel")}: {ticket.seat_no} — {ticket.price} €
          {ticket.passenger_type === "child" && (
            <span> ({t("childDiscountLabel")})</span>
          )}
          <br />

          {/* QR Code */}
          <div style={{ marginTop: "10px" }}>
            <QRCodeCanvas value={ticket.token} size={120} />
          </div>
        </li>
      ))}
    </ul>
    {priceSummary && (
      <div style={{ marginTop: "16px" }}>
        <h3>{t("priceSummary")}</h3>
        <ul className="result-details">
          <li>{t("adults")}:{priceSummary.adultCount}</li>
          <li>{t("children")}: (0–14): {priceSummary.childCount}</li>
          <li>
            {t("totalPrice")}: {priceSummary.totalPrice.toFixed(2)} €
          </li>
          {priceSummary.savings > 0 && (
            <li>
              {t("Yousaved")} {priceSummary.savings.toFixed(2)} € with 10% child discount.
            </li>
          )}
        </ul>
      </div>
    )}





            {/* Confirm payment */}
<button
  className="search-button reserve-button"
  onClick={handleConfirmPayment}
  disabled={isPaying}
  style={{ marginTop: "12px" }}
>
  {isPaying ? t("confirming") : t("confirmPaymentBtn")}
</button>


            {paymentStatus && (
              <p style={{ color: "green", marginTop: "8px" }}>
                {paymentStatus}
              </p>
            )}
            {paymentError && (
              <p style={{ color: "red", marginTop: "8px" }}>{paymentError}</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
