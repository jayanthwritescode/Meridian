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
  }
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
