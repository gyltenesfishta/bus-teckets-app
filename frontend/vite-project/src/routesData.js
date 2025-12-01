// src/routesData.js

export const routes = [
  {
    id: "pristina-podujevo",
    from: "Pristina",
    to: "Podujevo",
    basePrice: 1.5,
    stops: [
      "Bardhosh",
      "Besi",
      "Vranidoll",
      "Lupq",
      "Lluzhan",
      "Gllamnik",
      "Sekiraq",
      "Qendra",
      "Podujevo bus station",
    ],
    trips: [
      { id: "pod-1", departure: "07:00", arrival: "07:45" },
      { id: "pod-2", departure: "09:00", arrival: "09:45" },
      { id: "pod-3", departure: "12:00", arrival: "12:45" },
      { id: "pod-4", departure: "15:00", arrival: "15:45" },
      { id: "pod-5", departure: "18:00", arrival: "18:45" },
    ],
  },

  // 👉 LINJA E RE PRISTINA → FUSHE KOSOVE
  {
    id: "pristina-fushe-kosove",
    from: "Pristina",
    to: "Fushe Kosove",
    basePrice: 1.2, // vendose çmimin që do ti (p.sh. 1.20 €)
    stops: [
      "Veternik",
      "Cagllavice",
      "Fushe Kosove center",
      "Fushe Kosove bus station",
    ],
    trips: [
      { id: "fk-1", departure: "07:00", arrival: "07:20" },
      { id: "fk-2", departure: "09:00", arrival: "09:20" },
      { id: "fk-3", departure: "12:00", arrival: "12:20" },
      { id: "fk-4", departure: "15:00", arrival: "15:20" },
      { id: "fk-5", departure: "18:00", arrival: "18:20" },
    ],
  },



{
  id: "pristina-lipjan",
  from: "Pristina",
  to: "Lipjan",
  basePrice: 2.0, // vendose çmimin që dëshiron, p.sh. 2.00 €
  stops: [
    "Veternik",
    "Çagllavicë",
    "Miradi e Epërme",
    "Miradi e Ulët",
    "Babush i Muhaxherëve",
    "Dobrajë e Madhe",
    "Gadime",
    "Lipjan center",
    "Lipjan bus station"
  ],
  trips: [
    { id: "lip-1", departure: "07:00", arrival: "07:35" },
    { id: "lip-2", departure: "09:00", arrival: "09:35" },
    { id: "lip-3", departure: "12:00", arrival: "12:35" },
    { id: "lip-4", departure: "15:00", arrival: "15:35" },
    { id: "lip-5", departure: "18:00", arrival: "18:35" }
  ]
},

{
  id: "pristina-peja",
  from: "Pristina",
  to: "Peja",
  basePrice: 4.0, // p.sh. 4.00 € për udhëtim
  stops: [
    "Fushe Kosove",
    "Sllatine",
    "Obiliq",
    "Bardh i Madh",
    "Komoran",
    "Drenas",
    "Gllareva",
    "Kline",
    "Zahaq",
    "Peja bus station"
  ],
  trips: [
    { id: "peja-1", departure: "07:00", arrival: "08:45" },
    { id: "peja-2", departure: "09:00", arrival: "10:45" },
    { id: "peja-3", departure: "12:00", arrival: "13:45" },
    { id: "peja-4", departure: "15:00", arrival: "16:45" },
    { id: "peja-5", departure: "18:00", arrival: "19:45" }
  ]
},

{
  id: "pristina-gjilan",
  from: "Pristina",
  to: "Gjilan",
  basePrice: 3.0,
  stops: [
    "Veternik",
    "Graçanica",
    "Kishnica",
    "Badovc",
    "Mogillë",
    "Zhegër",
    "Ponesh",
    "Gjilan center",
    "Gjilan bus station"
  ],
  trips: [
    { id: "gj-1", departure: "07:00", arrival: "07:55" },
    { id: "gj-2", departure: "09:00", arrival: "09:55" },
    { id: "gj-3", departure: "12:00", arrival: "12:55" },
    { id: "gj-4", departure: "15:00", arrival: "15:55" },
    { id: "gj-5", departure: "18:00", arrival: "18:55" }
  ]
},
{
  id: "pristina-ferizaj",
  from: "Pristina",
  to: "Ferizaj",
  basePrice: 2.5,
  stops: [
    "Veternik",
    "Çagllavicë",
    "Bresje",
    "Grackë",
    "Komogllavë",
    "Doganaj",
    "Bibaj",
    "Ferizaj center",
    "Ferizaj bus station"
  ],
  trips: [
    { id: "fe-1", departure: "07:00", arrival: "07:50" },
    { id: "fe-2", departure: "09:00", arrival: "09:50" },
    { id: "fe-3", departure: "12:00", arrival: "12:50" },
    { id: "fe-4", departure: "15:00", arrival: "15:50" },
    { id: "fe-5", departure: "18:00", arrival: "18:50" }
  ]
},

{
  id: "pristina-prizren",
  from: "Pristina",
  to: "Prizren",
  basePrice: 5.0,
  stops: [
    "Fushe Kosove",
    "Suharekë",
    "Duhël",
    "Malishevë",
    "Rahovec",
    "Xërxë",
    "Landovica",
    "Prizren center",
    "Prizren bus station"
  ],
  trips: [
    { id: "pr-1", departure: "07:00", arrival: "08:45" },
    { id: "pr-2", departure: "09:00", arrival: "10:45" },
    { id: "pr-3", departure: "12:00", arrival: "13:45" },
    { id: "pr-4", departure: "15:00", arrival: "16:45" },
    { id: "pr-5", departure: "18:00", arrival: "19:45" }
  ]
},

{
  id: "pristina-decan",
  from: "Pristina",
  to: "Deçan",
  basePrice: 4.5,
  stops: [
    "Fushe Kosove",
    "Obiliq",
    "Drenas",
    "Kline",
    "Zahaq",
    "Peja",
    "Raushiq",
    "Isniq",
    "Decan bus station"
  ],
  trips: [
    { id: "dec-1", departure: "07:00", arrival: "09:05" },
    { id: "dec-2", departure: "09:00", arrival: "11:05" },
    { id: "dec-3", departure: "12:00", arrival: "14:05" },
    { id: "dec-4", departure: "15:00", arrival: "17:05" },
    { id: "dec-5", departure: "18:00", arrival: "20:05" }
  ]
},

{
  id: "pristina-malisheve",
  from: "Pristina",
  to: "Malisheva",
  basePrice: 3.5,
  stops: [
    "Fushe Kosove",
    "Suharekë",
    "Duhël",
    "Kijevë",
    "Drenoc",
    "Dragobil",
    "Banje",
    "Malishevë center",
    "Malishevë bus station"
  ],
  trips: [
    { id: "mal-1", departure: "07:00", arrival: "08:20" },
    { id: "mal-2", departure: "09:00", arrival: "10:20" },
    { id: "mal-3", departure: "12:00", arrival: "13:20" },
    { id: "mal-4", departure: "15:00", arrival: "16:20" },
    { id: "mal-5", departure: "18:00", arrival: "19:20" }
  ]
},
];