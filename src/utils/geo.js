export function interpolatePosition(origin, destination, progress) {
  const lat = origin.lat + (destination.lat - origin.lat) * progress;
  const lon = origin.lon + (destination.lon - origin.lon) * progress;
  return { lat, lon };
}

export function calculateBearing(origin, destination) {
  const lat1 = origin.lat * Math.PI / 180;
  const lat2 = destination.lat * Math.PI / 180;
  const deltaLon = (destination.lon - origin.lon) * Math.PI / 180;
  
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - 
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

export function calculateDistance(origin, destination) {
  const R = 6371; // Earth's radius in km
  const lat1 = origin.lat * Math.PI / 180;
  const lat2 = destination.lat * Math.PI / 180;
  const deltaLat = (destination.lat - origin.lat) * Math.PI / 180;
  const deltaLon = (destination.lon - origin.lon) * Math.PI / 180;
  
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

export function getVesselPositionAlongRoute(vessel) {
  const { route, progress } = vessel;
  const waypoints = [route.origin, ...route.waypoints, route.destination];
  
  const totalSegments = waypoints.length - 1;
  const segmentProgress = progress * totalSegments;
  const currentSegment = Math.floor(segmentProgress);
  const segmentFraction = segmentProgress - currentSegment;
  
  if (currentSegment >= totalSegments) {
    return waypoints[waypoints.length - 1];
  }
  
  const start = waypoints[currentSegment];
  const end = waypoints[currentSegment + 1];
  
  return interpolatePosition(start, end, segmentFraction);
}

export function formatCoordinates(lat, lon) {
  return `${lat.toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${lon.toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
}

export function formatSpeed(speed) {
  return speed ? `${speed.toFixed(1)} kn` : '— kn';
}

export function formatHeading(heading) {
  if (!heading) return '—°';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return `${heading.toFixed(0)}° ${directions[index]}`;
}
