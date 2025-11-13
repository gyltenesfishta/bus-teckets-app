-- Fshi tabelat nëse ekzistojnë (për zhvillim)
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS routes;

-- Rutat (linjat kryesore)
CREATE TABLE routes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    origin      TEXT NOT NULL,
    destination TEXT NOT NULL
);

-- Udhëtimet (një rutë mund të ketë shumë udhëtime në orare të ndryshme)
CREATE TABLE trips (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id     INTEGER NOT NULL,
    departure_at TEXT NOT NULL,
    base_price   REAL NOT NULL,
    total_seats  INTEGER NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id)
);

-- Biletat
CREATE TABLE tickets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id     INTEGER NOT NULL,
    seat_no     INTEGER NOT NULL,
    price       REAL NOT NULL,
    status      TEXT NOT NULL DEFAULT 'reserved',
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, seat_no),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);
