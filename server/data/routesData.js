// Major Logistics Corridors across India
export const INDIAN_LOGISTICS_CORRIDORS = [
  {
    id: "CORR-01",
    name: "Golden Quadrilateral West (Mumbai - Delhi)",
    highway: "NH-48",
    distanceKm: 1415,
    expressType: "High Priority Green Freight Corridor",
    states: ["Maharashtra", "Gujarat", "Rajasthan", "Haryana", "Delhi"],
    waypoints: [
      { name: "JNPT Port, Mumbai", lat: 18.95, lng: 72.95 },
      { name: "Surat Logistics Hub", lat: 21.17, lng: 72.83 },
      { name: "Ahmedabad Agri Hub", lat: 23.02, lng: 72.57 },
      { name: "Jaipur Cold Terminal", lat: 26.91, lng: 75.78 },
      { name: "Delhi Azadpur Mandi", lat: 28.70, lng: 77.18 }
    ],
    tollBypassEnabled: true,
    avgTransitHours: 24,
    reeferSupport: "100% Ultra-Fast Charging & Cold Docking"
  },
  {
    id: "CORR-02",
    name: "South-North Fresh Agri Corridor (Bengaluru - Delhi)",
    highway: "NH-44",
    distanceKm: 2150,
    expressType: "Tier-1 AgriFresh Express",
    states: ["Karnataka", "Telangana", "Maharashtra", "MP", "UP", "Delhi"],
    waypoints: [
      { name: "Kolar Tomato Terminal, KA", lat: 13.13, lng: 78.13 },
      { name: "Hyderabad Cold Chain Hub", lat: 17.38, lng: 78.48 },
      { name: "Nagpur Orange Cargo Park", lat: 21.14, lng: 79.08 },
      { name: "Agra Cold Storage Zone", lat: 27.17, lng: 78.00 },
      { name: "Delhi NCR Distribution Center", lat: 28.61, lng: 77.20 }
    ],
    tollBypassEnabled: true,
    avgTransitHours: 36,
    reeferSupport: "Automated Nitrogen Purge & Ethylene Scrubber Nodes"
  },
  {
    id: "CORR-03",
    name: "Deccan West Express (Nashik - Mumbai - Pune)",
    highway: "NH-160 / Samruddhi Mahamarg",
    distanceKm: 340,
    expressType: "Perishable Fast Track",
    states: ["Maharashtra"],
    waypoints: [
      { name: "Nashik Grape & Onion Terminal", lat: 19.99, lng: 73.78 },
      { name: "Thane Distribution Hub", lat: 19.21, lng: 72.97 },
      { name: "Navi Mumbai Vashi APMC Mandi", lat: 19.07, lng: 73.00 },
      { name: "Pune Hadapsar Agri Terminal", lat: 18.52, lng: 73.85 }
    ],
    tollBypassEnabled: true,
    avgTransitHours: 6,
    reeferSupport: "Real-time Telematics & Solar Reefer Support"
  },
  {
    id: "CORR-04",
    name: "Himalayan Fresh Produce Corridor (Shimla - Chandigarh - NCR)",
    highway: "NH-5",
    distanceKm: 370,
    expressType: "Hilly Perishable Route",
    states: ["Himachal Pradesh", "Punjab", "Haryana", "Delhi"],
    waypoints: [
      { name: "Shimla Apple Yard, HP", lat: 31.10, lng: 77.17 },
      { name: "Solan Cold Chain Node", lat: 30.90, lng: 77.09 },
      { name: "Chandigarh Air Cargo Complex", lat: 30.73, lng: 76.77 },
      { name: "Gurugram Logistics Center", lat: 28.45, lng: 77.02 }
    ],
    tollBypassEnabled: true,
    avgTransitHours: 8,
    reeferSupport: "Anti-shock Air Suspension & Sub-Zero Blast Freezers"
  },
  {
    id: "CORR-05",
    name: "Eastern Supply Corridor (Kolkata - Patna - Ranchi)",
    highway: "NH-19",
    distanceKm: 580,
    expressType: "Multimodal Freight Line",
    states: ["West Bengal", "Jharkhand", "Bihar"],
    waypoints: [
      { name: "Kolkata Port Terminal", lat: 22.57, lng: 88.36 },
      { name: "Durgapur Cargo Park", lat: 23.52, lng: 87.31 },
      { name: "Ranchi Cold Terminal", lat: 23.34, lng: 85.30 },
      { name: "Patna Wholesale Hub", lat: 25.59, lng: 85.13 }
    ],
    tollBypassEnabled: false,
    avgTransitHours: 14,
    reeferSupport: "Standard Reefer & GPS Lock"
  }
];
