import { useState, useEffect, useMemo, useRef } from 'react';

// Featured vessels configuration
const FEATURED_VESSELS = {
  'MSCGULSUN': {
    mmsi: '477307900',
    departureTime: new Date('2026-03-01T08:00:00Z').getTime(),
    route: [
      { name: 'Shanghai', lat: 31.2, lon: 121.5 },
      { name: 'Taiwan Strait', lat: 24.5, lon: 121.0 },
      { name: 'Strait of Malacca', lat: 1.3, lon: 103.8 },
      { name: 'Indian Ocean', lat: -5.0, lon: 72.0 },
      { name: 'Suez Canal', lat: 30.0, lon: 32.5 },
      { name: 'Mediterranean', lat: 36.0, lon: 14.0 },
      { name: 'Rotterdam', lat: 51.9, lon: 4.5 }
    ]
  },
  'EVERAPEX': {
    mmsi: '352003000',
    departureTime: new Date('2026-03-10T14:00:00Z').getTime(),
    route: [
      { name: 'Los Angeles', lat: 33.7, lon: -118.2 },
      { name: 'Pacific Ocean', lat: 30.0, lon: -140.0 },
      { name: 'Honolulu', lat: 21.3, lon: -157.8 },
      { name: 'Tokyo Bay', lat: 35.6, lon: 139.8 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 }
    ]
  },
  'COSCOFORTUNE': {
    mmsi: '477425500',
    departureTime: new Date('2026-02-20T06:00:00Z').getTime(),
    route: [
      { name: 'Santos', lat: -23.9500, lon: -46.3333 },
      { name: 'South Atlantic', lat: -20.0, lon: -30.0 },
      { name: 'Cape Town', lat: -33.9, lon: 18.4 },
      { name: 'Atlantic Ocean', lat: 20.0, lon: -30.0 },
      { name: 'Strait of Gibraltar', lat: 36.0, lon: -5.3 },
      { name: 'Mediterranean', lat: 40.0, lon: 10.0 },
      { name: 'Antwerp', lat: 51.3, lon: 4.4 }
    ]
  }
};

// Haversine formula for great-circle distance
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Linear interpolation between two points
function interpolate(lat1, lon1, lat2, lon2, fraction) {
  return {
    lat: lat1 + (lat2 - lat1) * fraction,
    lon: lon1 + (lon2 - lon1) * fraction
  };
}

// Compute cumulative distances for all route segments
function computeRouteSegments(route) {
  const segments = [];
  let cumulativeDistance = 0;
  
  for (let i = 0; i < route.length - 1; i++) {
    const distance = haversineDistance(
      route[i].lat, route[i].lon,
      route[i + 1].lat, route[i + 1].lon
    );
    segments.push({
      from: route[i],
      to: route[i + 1],
      distance,
      startDistance: cumulativeDistance,
      endDistance: cumulativeDistance + distance
    });
    cumulativeDistance += distance;
  }
  
  return { segments, totalDistance: cumulativeDistance };
}

// Compute vessel position at a specific time
export function getPositionAt(mmsi, datetime) {
  const vessel = Object.values(FEATURED_VESSELS).find(v => v.mmsi === mmsi);
  if (!vessel) return null;
  
  const { segments, totalDistance } = computeRouteSegments(vessel.route);
  const elapsedHours = (datetime - vessel.departureTime) / (1000 * 60 * 60);
  const distanceTraveled = elapsedHours * 37.04; // 20 knots = 37.04 km/h
  
  if (distanceTraveled <= 0) {
    return {
      lat: vessel.route[0].lat,
      lon: vessel.route[0].lon,
      progress: 0,
      segmentIndex: 0,
      distanceTraveledKm: 0,
      distanceRemainingKm: totalDistance,
      estimatedArrival: vessel.departureTime + (totalDistance / 37.04) * 60 * 60 * 1000
    };
  }
  
  if (distanceTraveled >= totalDistance) {
    const lastPoint = vessel.route[vessel.route.length - 1];
    return {
      lat: lastPoint.lat,
      lon: lastPoint.lon,
      progress: 1,
      segmentIndex: segments.length - 1,
      distanceTraveledKm: totalDistance,
      distanceRemainingKm: 0,
      estimatedArrival: vessel.departureTime + (totalDistance / 37.04) * 60 * 60 * 1000
    };
  }
  
  // Find current segment
  let currentSegment = null;
  let segmentIndex = -1;
  
  for (let i = 0; i < segments.length; i++) {
    if (distanceTraveled >= segments[i].startDistance && distanceTraveled <= segments[i].endDistance) {
      currentSegment = segments[i];
      segmentIndex = i;
      break;
    }
  }
  
  if (!currentSegment) {
    // Fallback to last segment
    currentSegment = segments[segments.length - 1];
    segmentIndex = segments.length - 1;
  }
  
  // Interpolate within segment
  const segmentDistance = distanceTraveled - currentSegment.startDistance;
  const segmentFraction = segmentDistance / currentSegment.distance;
  const position = interpolate(
    currentSegment.from.lat, currentSegment.from.lon,
    currentSegment.to.lat, currentSegment.to.lon,
    segmentFraction
  );
  
  return {
    lat: position.lat,
    lon: position.lon,
    progress: distanceTraveled / totalDistance,
    segmentIndex,
    distanceTraveledKm: distanceTraveled,
    distanceRemainingKm: totalDistance - distanceTraveled,
    estimatedArrival: vessel.departureTime + (totalDistance / 37.04) * 60 * 60 * 1000
  };
}

export function useComputedPosition() {
  const [positions, setPositions] = useState({});
  const updatePositions = () => {
    const now = Date.now();
    const newPositions = {};
    
    for (const [shipId, config] of Object.entries(FEATURED_VESSELS)) {
      const position = getPositionAt(config.mmsi, now);
      newPositions[shipId] = position;
      
      console.log(`Computed position for ${shipId}:`, position);
    }
    
    setPositions(newPositions);
  };

  useEffect(() => {
    updatePositions(); // Initial update
    const interval = setInterval(updatePositions, 60000); // Update every 60 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    positions,
    getPositionAt
  };
}
