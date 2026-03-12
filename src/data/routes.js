export const SHIP_ROUTES = {
  'MSCGULSUN': {
    origin: { 
      name: 'Shanghai', 
      lat: 31.2, 
      lon: 121.5,
      country: 'China'
    },
    destination: { 
      name: 'Rotterdam', 
      lat: 51.9, 
      lon: 4.5,
      country: 'Netherlands'
    },
    waypoints: [
      { name: 'Taiwan Strait', lat: 24.5, lon: 121.0 },
      { name: 'Strait of Malacca', lat: 1.3, lon: 103.8 },
      { name: 'Indian Ocean', lat: -5.0, lon: 72.0 },
      { name: 'Suez Canal', lat: 30.0, lon: 32.5 },
      { name: 'Mediterranean', lat: 36.0, lon: 14.0 }
    ]
  },
  'EVERAPEX': {
    origin: { 
      name: 'Los Angeles', 
      lat: 33.7, 
      lon: -118.2,
      country: 'USA'
    },
    destination: { 
      name: 'Tokyo', 
      lat: 35.7, 
      lon: 139.7,
      country: 'Japan'
    },
    waypoints: [
      { name: 'Pacific Crossing', lat: 35.0, lon: -140.0 },
      { name: 'Mid-Pacific', lat: 30.0, lon: -170.0 },
      { name: 'Approach Japan', lat: 35.0, lon: 140.0 }
    ]
  },
  'COSCOFORTUNE': {
    origin: { 
      name: 'Santos', 
      lat: -23.9, 
      lon: -46.3,
      country: 'Brazil'
    },
    destination: { 
      name: 'Antwerp', 
      lat: 51.3, 
      lon: 4.4,
      country: 'Belgium'
    },
    waypoints: [
      { name: 'South Atlantic', lat: -15.0, lon: -30.0 },
      { name: 'Equator Crossing', lat: 0.0, lon: -20.0 },
      { name: 'North Atlantic', lat: 25.0, lon: -30.0 },
      { name: 'European Approach', lat: 45.0, lon: -10.0 },
      { name: 'English Channel', lat: 50.0, lon: 2.0 }
    ]
  },
  'MSCELBE': {
    origin: { 
      name: 'Hamburg', 
      lat: 53.5461, 
      lon: 9.9669,
      country: 'Germany'
    },
    destination: { 
      name: 'New York', 
      lat: 40.6643, 
      lon: -74.0143,
      country: 'USA'
    },
    waypoints: [
      { name: 'English Channel', lat: 50.5, lon: 1.5 },
      { name: 'Bay of Biscay', lat: 45.0, lon: -10.0 },
      { name: 'Mid Atlantic', lat: 40.0, lon: -30.0 },
      { name: 'Georges Bank', lat: 41.0, lon: -66.0 }
    ],
    vessel: {
      name: 'MSC Elbe',
      mmsi: '636092045',
      carrier: 'MSC Mediterranean',
      class: 'Large Container Vessel',
      cargo: 'Machinery, Chemicals, Manufactured Goods',
      teu: '9,200 TEU',
      color: '#06b6d4'
    },
    stats: {
      distance: 9100,
      duration: 13,
      co2: 890
    },
    schedule: {
      departure: new Date('2026-03-05T10:00:00Z'),
      eta: new Date('2026-03-18T00:00:00Z')
    }
  },
  'OOCLARABIA': {
    origin: { 
      name: 'Dubai', 
      lat: 25.0657, 
      lon: 55.1713,
      country: 'UAE'
    },
    destination: { 
      name: 'Mumbai', 
      lat: 18.9322, 
      lon: 72.8264,
      country: 'India'
    },
    waypoints: [
      { name: 'Strait of Hormuz', lat: 26.5, lon: 56.8 },
      { name: 'Gulf of Oman', lat: 23.0, lon: 60.0 },
      { name: 'Arabian Sea', lat: 20.0, lon: 65.0 }
    ],
    vessel: {
      name: 'OOCL Arabia',
      mmsi: '477334300',
      carrier: 'OOCL',
      class: 'Feeder Container Vessel',
      cargo: 'Electronics, Textiles, Consumer Goods',
      teu: '4,800 TEU',
      color: '#10b981'
    },
    stats: {
      distance: 2780,
      duration: 4,
      co2: 310
    },
    schedule: {
      departure: new Date('2026-03-12T06:00:00Z'),
      eta: new Date('2026-03-16T00:00:00Z')
    }
  },
  'COSCOAFRICA': {
    origin: { 
      name: 'Guangzhou', 
      lat: 22.5431, 
      lon: 113.8010,
      country: 'China'
    },
    destination: { 
      name: 'Lagos', 
      lat: 6.4541, 
      lon: 3.3947,
      country: 'Nigeria'
    },
    waypoints: [
      { name: 'South China Sea', lat: 15.0, lon: 112.0 },
      { name: 'Strait of Malacca', lat: 1.3, lon: 103.8 },
      { name: 'Indian Ocean', lat: -10.0, lon: 75.0 },
      { name: 'Cape of Good Hope', lat: -34.5, lon: 19.9 },
      { name: 'Gulf of Guinea', lat: 3.0, lon: 5.0 }
    ],
    vessel: {
      name: 'COSCO Africa',
      mmsi: '477219600',
      carrier: 'COSCO Shipping',
      class: 'Large Container Vessel',
      cargo: 'Electronics, Solar Panels, Construction Materials',
      teu: '14,200 TEU',
      color: '#f97316'
    },
    stats: {
      distance: 21400,
      duration: 29,
      co2: 1960
    },
    schedule: {
      departure: new Date('2026-02-25T08:00:00Z'),
      eta: new Date('2026-03-26T00:00:00Z')
    }
  },
  'EVERGLOBE': {
    origin: { 
      name: 'Yokohama', 
      lat: 35.4437, 
      lon: 139.6380,
      country: 'Japan'
    },
    destination: { 
      name: 'Vancouver', 
      lat: 49.2827, 
      lon: -123.1207,
      country: 'Canada'
    },
    waypoints: [
      { name: 'North Pacific', lat: 40.0, lon: 160.0 },
      { name: 'Aleutian Arc', lat: 48.0, lon: -175.0 },
      { name: 'Gulf of Alaska', lat: 50.0, lon: -145.0 },
      { name: 'Pacific Northwest', lat: 48.0, lon: -130.0 }
    ],
    vessel: {
      name: 'Ever Globe',
      mmsi: '352003100',
      carrier: 'Evergreen Line',
      class: 'Large Container Vessel',
      cargo: 'Vehicles, Electronics, Industrial Equipment',
      teu: '11,800 TEU',
      color: '#ec4899'
    },
    stats: {
      distance: 8200,
      duration: 11,
      co2: 810
    },
    schedule: {
      departure: new Date('2026-03-08T12:00:00Z'),
      eta: new Date('2026-03-19T00:00:00Z')
    }
  },
  'ANLBINDAREE': {
    origin: { 
      name: 'Singapore', 
      lat: 1.3521, 
      lon: 103.8198,
      country: 'Singapore'
    },
    destination: { 
      name: 'Sydney', 
      lat: -33.8688, 
      lon: 151.2093,
      country: 'Australia'
    },
    waypoints: [
      { name: 'Java Sea', lat: -5.0, lon: 110.0 },
      { name: 'Timor Sea', lat: -10.0, lon: 127.0 },
      { name: 'Coral Sea', lat: -20.0, lon: 150.0 }
    ],
    vessel: {
      name: 'ANL Bindaree',
      mmsi: '503000001',
      carrier: 'ANL Container Line',
      class: 'Panamax Container Vessel',
      cargo: 'Electronics, Palm Oil, Rubber, Manufactured Goods',
      teu: '6,400 TEU',
      color: '#14b8a6'
    },
    stats: {
      distance: 8320,
      duration: 11,
      co2: 780
    },
    schedule: {
      departure: new Date('2026-03-11T09:00:00Z'),
      eta: new Date('2026-03-22T00:00:00Z')
    }
  }
};

// Educational facts for each waypoint
export const WAYPOINT_FACTS = {
  'Shanghai': [
    "World's busiest container port by volume since 2005",
    "Handles over 43 million TEU annually",
    "Located at Yangtze River estuary"
  ],
  'Taiwan Strait': [
    "One of world's most critical shipping chokepoints",
    "Over 50% of global container traffic passes through",
    "Average depth: 60 meters, maximum 120 meters"
  ],
  'Strait of Malacca': [
    "Shortest route between Indian & Pacific Oceans",
    "Over 94,000 vessels transit annually",
    "Named after Malaysian Sultanate of Malacca"
  ],
  'Indian Ocean': [
    "Covers 20% of Earth's ocean surface",
    "Average depth: 3,964 meters",
    "Connects Asia, Africa, Australia"
  ],
  'Suez Canal': [
    "193 km artificial waterway",
    "8% of global trade passes through",
    "Saves 7,000 km compared to Africa route"
  ],
  'Mediterranean': [
    "Largest sea entirely enclosed by land",
    "Connected to Atlantic via Strait of Gibraltar",
    "Average depth: 1,500 meters"
  ],
  'Rotterdam': [
    "Europe's largest port by cargo tonnage",
    "Handles 440 million tons of cargo annually",
    "Pioneered automated container handling"
  ],
  'Los Angeles': [
    "Busiest US container port",
    "Gateway to trans-Pacific trade",
    "Handles 9.3 million TEU annually"
  ],
  'Tokyo': [
    "World's most advanced automated port",
    "Handles 40% of Japan's trade",
    "Bay of Tokyo: 1,500 km² area"
  ],
  'Santos': [
    "Latin America's largest container port",
    "Handles 4.5 million TEU annually",
    "Major gateway for Brazilian exports"
  ],
  'North Atlantic': [
    "Covers 106 million km²",
    "Primary route between Europe & Americas",
    "Strong currents affect fuel efficiency"
  ],
  'Antwerp': [
    "Europe's second-largest port",
    "Handles 12 million TEU annually",
    "Located 80 km inland on Scheldt River"
  ],
  'English Channel': [
    "World's busiest shipping lane",
    "Over 500 vessels transit daily",
    "Critical link between North Sea and Atlantic"
  ],
  'Bay of Biscay': [
    "Notorious for severe winter storms",
    "Average depth: 1,700 meters",
    "Major route between Western Europe and Iberia"
  ],
  'Mid Atlantic': [
    "Part of North Atlantic Gyre circulation",
    "Important weather waypoint for Europe-Americas routes",
    "Average depth: 5,300 meters"
  ],
  'Georges Bank': [
    "Rich fishing grounds off New England",
    "Shallow waters require careful navigation",
    "Average depth: 50 meters, maximum 180 meters"
  ],
  'Strait of Hormuz': [
    "Critical chokepoint for global oil trade",
    "21 million barrels of oil pass daily",
    "Width at narrowest point: 21 nautical miles"
  ],
  'Gulf of Oman': [
    "Connects Arabian Sea to Strait of Hormuz",
    "Average depth: 3,200 meters",
    "Important weather waypoint for Middle East routes"
  ],
  'Arabian Sea': [
    "Part of Indian Ocean north of equator",
    "Monsoon winds affect shipping December-March",
    "Average depth: 2,700 meters"
  ],
  'South China Sea': [
    "One of world's most disputed waters",
    "Over $3 trillion in trade passes annually",
    "Average depth: 1,200 meters"
  ],
  'Cape of Good Hope': [
    "Historic rounding point for pre-canal trade",
    "Notorious for rough seas and strong winds",
    "Average depth: 4,700 meters"
  ],
  'Gulf of Guinea': [
    "Major oil-producing region offshore",
    "Piracy concerns affect shipping routes",
    "Average depth: 3,000 meters"
  ],
  'North Pacific': [
    "Largest ocean by area at 165 million km²",
    "Contains Mariana Trench (11,000m deep)",
    "Pacific Ring of Fire creates frequent volcanic activity"
  ],
  'Aleutian Arc': [
    "Chain of volcanic islands between Alaska and Russia",
    "Critical weather waypoint for trans-Pacific routes",
    "Strong Aleutian Low pressure systems form here"
  ],
  'Gulf of Alaska': [
    "Rich fishing grounds and oil reserves",
    "Complex tidal patterns affect navigation",
    "Average depth: 2,400 meters"
  ],
  'Pacific Northwest': [
    "Temperate rainforest creates frequent fog",
    "Major timber export region",
    "Average depth: 2,600 meters"
  ],
  'Java Sea': [
    "Shallow sea between Indonesian islands",
    "Average depth: 46 meters",
    "Monsoon patterns create seasonal hazards"
  ],
  'Timor Sea': [
    "Located between Timor and Australia",
    "Average depth: 2,100 meters",
    "Important route for Australia-Indonesia trade"
  ],
  'Coral Sea': [
    "Contains Great Barrier Reef system",
    "Average depth: 2,300 meters",
    "Cyclone season November-April affects shipping"
  ]
};

// Get full route coordinates for arc drawing
export const getRouteCoordinates = (shipId) => {
  const route = SHIP_ROUTES[shipId];
  if (!route) return [];
  
  return [
    route.origin,
    ...route.waypoints,
    route.destination
  ];
};

// Calculate ship progress along route (0-1)
export const getShipProgress = (shipId, currentPosition) => {
  const route = SHIP_ROUTES[shipId];
  if (!route || !currentPosition) return 0;
  
  const coords = getRouteCoordinates(shipId);
  let totalDistance = 0;
  let currentDistance = 0;
  
  // Calculate total route distance
  for (let i = 0; i < coords.length - 1; i++) {
    totalDistance += calculateDistance(coords[i], coords[i + 1]);
  }
  
  // Calculate distance from origin to current position
  for (let i = 0; i < coords.length - 1; i++) {
    const segmentDistance = calculateDistance(coords[i], coords[i + 1]);
    const distanceToNext = calculateDistance(currentPosition, coords[i + 1]);
    
    if (distanceToNext <= segmentDistance) {
      currentDistance += calculateDistance(coords[i], currentPosition);
      break;
    }
    currentDistance += segmentDistance;
  }
  
  return totalDistance > 0 ? currentDistance / totalDistance : 0;
};

// Simple distance calculation (simplified)
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lon - point1.lon) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
