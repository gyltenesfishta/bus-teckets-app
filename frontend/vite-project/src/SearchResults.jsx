// src/SearchResults.jsx
import React, { useState } from "react";
import { routes } from "./routesData";

// kthen "07:00" -> minuta totale
function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// kthen minuta totale -> "07:00"
function formatMinutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// p.sh. 07:00 - 07:45 => "0:45 hrs"
function getDuration(departure, arrival) {
  const start = parseTimeToMinutes(departure);
  const end = parseTimeToMinutes(arrival);
  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")} hrs`;
}

// llogarit orarin për çdo ndalesë
function getStopSchedule(route, trip) {
  const start = parseTimeToMinutes(trip.departure);
  const end = parseTimeToMinutes(trip.arrival);
  const totalDiff = end - start;

  const stops = route.stops || [];
  if (stops.length === 0 || totalDiff <= 0) {
    return stops.map((name, idx) => ({
      name,
      time: trip.departure,
      index: idx,
    }));
  }

  // 9 ndalesa => 8 intervale midis tyre
  const segments = stops.length - 1;
  const minutesPerSegment = totalDiff / segments;

  return stops.map((name, idx) => {
    const minutesOffset = Math.round(minutesPerSegment * idx);
    const time = formatMinutesToTime(start + minutesOffset);
    return { name, time, index: idx };
  });
}

export default function SearchResults({ searchParams, onSelectTrip, t }) {
  const { from, to, date } = searchParams || {};
  const [expandedTripId, setExpandedTripId] = useState(null);

  const route = routes.find((r) => r.from === from && r.to === to);

  // Nëse nuk ka linjë për këtë drejtim
  if (!route) {
    return (
      <div style={{ padding: "24px" }}>
        <h2>{t("noTripsFound")}</h2>
        <p>{t("tryAnother")}</p>
      </div>
    );
  }

  const stopsCount = route.stops.length;

  return (
    <div style={{ padding: "24px" }}>
      {date && (
        <p style={{ color: "#555", fontSize: "14px" }}>
          {t("outboundTrips")} • {date}
        </p>
      )}

      {/* Lista e udhëtimeve */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {route.trips.map((trip) => {
          const duration = getDuration(trip.departure, trip.arrival);
          const isExpanded = expandedTripId === trip.id;
          const stopSchedule = isExpanded ? getStopSchedule(route, trip) : [];

          return (
            <div
              key={trip.id}
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "16px 20px",
                background: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
              }}
            >
              {/* rreshti kryesor: ora, info, cmimi + butoni */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {/* Info majtas */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontSize: "20px", fontWeight: 600 }}>
                      {trip.departure}
                    </span>
                    <span
                      style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                      }}
                    >
                      {duration}
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: 500 }}>
                      {trip.arrival}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#4b5563" }}>
                    {route.from} {t("busStation")} → {route.to}{" "}
                    {t("busStation")}
                  </div>

                  {/* "9 ndalesa • Autobus • Direkt" klikues */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTripId(isExpanded ? null : trip.id)
                    }
                    style={{
                      marginTop: "6px",
                      padding: 0,
                      border: "none",
                      background: "none",
                      fontSize: "12px",
                      color: "#16a34a",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {stopsCount} {t("stops")} • {t("bus")} • {t("direct")}
                    {isExpanded ? " ▲" : " ▼"}
                  </button>
                </div>

                {/* Cmimi mbi buton */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "6px",
                    minWidth: "90px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    {route.basePrice.toFixed(2)} €
                  </div>

                  <button
                    onClick={() =>
                      onSelectTrip && onSelectTrip({ route, trip })
                    }
                    style={{
                      border: "none",
                      borderRadius: "9999px",
                      padding: "10px 22px",
                      background: "#16a34a",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t("select")}
                  </button>
                </div>
              </div>

              {/* Lista e ndalesave – hapet si dropdown */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop: "1px solid #e5e7eb",
                    fontSize: "13px",
                    color: "#4b5563",
                  }}
                >
                  {stopSchedule.map((stop) => (
                    <div
                      key={stop.index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 0",
                      }}
                    >
                      <span>{stop.time}</span>
                      <span>{stop.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

