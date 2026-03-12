import { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { SHIPS, getShipById } from '../data/ships';
import { useVesselPosition } from '../hooks/useVesselPosition';
import { SHIP_ROUTES } from '../data/routes';

export function GlobeView({ selectedRoute, width, height }) {
  const globeEl = useRef();
  const { featuredVessels: featuredData, liveVessels } = useVesselPosition();
  const [shipProgress, setShipProgress] = useState(0);

  console.log('GlobeView rendered with selectedRoute:', selectedRoute);

  // Get selected vessel from route
  const selectedVessel = useMemo(() => {
    if (!selectedRoute) return null;
    const ship = SHIPS.find(s => s.id === selectedRoute);
    return featuredData[selectedRoute] || ship || null;
  }, [selectedRoute, featuredData]);

  // Get non-featured live vessels for performance rendering
  const liveVesselsPoints = useMemo(() => {
    const featuredMMSIs = new Set(Object.values(featuredData).map(v => v.mmsi));
    
    return Array.from(liveVessels.values())
      .filter(vessel => !featuredMMSIs.has(vessel.mmsi))
      .map(vessel => ({
        lat: vessel.lat,
        lon: vessel.lon,
        size: 1,
        color: getShipTypeColor(vessel.shipType),
        mmsi: vessel.mmsi,
        name: vessel.name,
        speed: vessel.speed,
        heading: vessel.heading,
        timestamp: vessel.timestamp
      }));
  }, [liveVessels, featuredData]);

  // Get featured vessel markers for selected ship
  const featuredVesselMarkers = useMemo(() => {
    if (!selectedVessel) return [];
    
    return [{
      ...selectedVessel,
      size: 6,
      isFeatured: true,
      color: selectedVessel.color || '#3b82f6'
    }];
  }, [selectedVessel]);

  // Get all vessel points (featured + live)
  const allPoints = useMemo(() => {
    const points = [];
    
    // Add featured vessel
    if (selectedVessel) {
      points.push({
        lat: selectedVessel.lat,
        lon: selectedVessel.lon,
        size: 0.5,
        color: selectedVessel.color || '#3b82f6',
        altitude: 0.01,
        isFeatured: true
      });
    }
    
    // Add live vessels (dimmed)
    liveVesselsPoints.forEach(vessel => {
      points.push({
        lat: vessel.lat,
        lon: vessel.lon,
        size: 0.3,
        color: 'rgba(255,255,255,0.3)',
        altitude: 0.005
      });
    });
    
    console.log('allPoints debug:', points);
    return points;
  }, [selectedVessel, liveVesselsPoints]);

  // Get vessel rings for selected ship
  const vesselRings = useMemo(() => {
    if (!selectedVessel) return [];
    
    return [{
      lat: selectedVessel.lat,
      lon: selectedVessel.lon,
      maxRadius: 4,
      propagationSpeed: 1.5,
      repeatPeriod: 1500,
      color: [selectedVessel.color || '#3b82f6', selectedVessel.color || '#3b82f6']
    }];
  }, [selectedVessel]);

  // Get route arcs - only show selected route
  const routeArcs = useMemo(() => {
    if (!selectedRoute) return [];
    
    const arcs = [];
    const route = SHIP_ROUTES[selectedRoute];
    const ship = SHIPS.find(s => s.id === selectedRoute);
    
    if (route && ship) {
      const coords = [
        route.origin,
        ...route.waypoints,
        route.destination
      ];
      
      // Create arc segments for selected route only
      for (let i = 0; i < coords.length - 1; i++) {
        arcs.push({
          startLat: coords[i].lat,
          startLng: coords[i].lon,
          endLat: coords[i + 1].lat,
          endLng: coords[i + 1].lon,
          color: ship.color || '#64748b',
          stroke: 2,
          opacity: 1
        });
      }
    }
    
    return arcs;
  }, [selectedRoute]);

  // Get port labels - simplified approach
  const portLabels = useMemo(() => {
    const uniquePorts = new Map();
    
    Object.values(SHIP_ROUTES).forEach(route => {
      // Origin port
      uniquePorts.set(route.origin.name, {
        name: route.origin.name,
        lat: route.origin.lat,
        lon: route.origin.lon
      });
      
      // Destination port
      uniquePorts.set(route.destination.name, {
        name: route.destination.name,
        lat: route.destination.lat,
        lon: route.destination.lon
      });
    });
    
    return Array.from(uniquePorts.values());
  }, []);

  // Globe controls setup - runs once after mount
  useEffect(() => {
    if (!globeEl.current) return;
    
    const globe = globeEl.current;
    
    // Enable auto-rotation
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.4;
  }, []);

  // Calculate great-circle distance between two points
  const calculateGreatCircleDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate optimal camera position for route
  const calculateOptimalCameraPosition = (route) => {
    // Get all waypoints including origin and destination
    const allWaypoints = [route.origin, ...route.waypoints, route.destination];
    
    // Calculate geographic center (centroid of all waypoints)
    const centerLat = allWaypoints.reduce((sum, wp) => sum + wp.lat, 0) / allWaypoints.length;
    const centerLon = allWaypoints.reduce((sum, wp) => sum + wp.lon, 0) / allWaypoints.length;
    
    // Calculate angular spread - max distance between any two waypoints
    let maxDistance = 0;
    for (let i = 0; i < allWaypoints.length; i++) {
      for (let j = i + 1; j < allWaypoints.length; j++) {
        const distance = calculateGreatCircleDistance(
          allWaypoints[i].lat, allWaypoints[i].lon,
          allWaypoints[j].lat, allWaypoints[j].lon
        );
        maxDistance = Math.max(maxDistance, distance);
      }
    }
    
    // Map spread to altitude
    let altitude;
    if (maxDistance < 3000) altitude = 1.2;
    else if (maxDistance < 8000) altitude = 1.8;
    else if (maxDistance < 15000) altitude = 2.2;
    else altitude = 2.6;
    
    // Adjust tilt based on hemisphere
    let finalLat = centerLat;
    if (centerLat < 15) {
      // Route crosses equator significantly, tilt slightly south
      finalLat = centerLat - 8;
    }
    
    return { lat: finalLat, lng: centerLon, altitude };
  };

  // Camera fly to selected route with cinematic animation
  useEffect(() => {
    if (!globeEl.current || !selectedRoute) return;
    
    const globe = globeEl.current;
    const route = SHIP_ROUTES[selectedRoute];
    
    if (route) {
      const optimalPosition = calculateOptimalCameraPosition(route);
      
      // Stage 1: Pull back to altitude 3.5 over 400ms
      globe.pointOfView({ altitude: 3.5 }, 400);
      
      // Stage 2: Fly to optimal position after 400ms delay
      setTimeout(() => {
        globe.pointOfView(optimalPosition, 1200);
        
        // Stage 3: Slow rotation after fly completes (1600ms total)
        setTimeout(() => {
          globe.controls().autoRotateSpeed = 0.2;
        }, 1200);
      }, 400);
    }
  }, [selectedRoute]);

  // Reset rotation speed when no route selected
  useEffect(() => {
    if (!globeEl.current) return;
    
    if (!selectedRoute) {
      globeEl.current.controls().autoRotateSpeed = 0.4;
    }
  }, [selectedRoute]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={allPoints}
        pointLat="lat"
        pointLng="lon"
        pointColor="color"
        pointAltitude="altitude"
        pointRadius="size"
        pointLabel="name"
        arcsData={routeArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={0.15}
        arcDashAnimateTime={4000}
        arcOpacity="opacity"
        arcLabel={() => ''}
        ringsData={vesselRings}
        ringLat="lat"
        ringLng="lon"
        ringColor="color"
        ringMaxRadius="maxRadius"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        labelsData={portLabels}
        labelLat={d => d.lat}
        labelLng={d => d.lon}
        labelText={d => d.name}
        labelSize={0.5}
        labelColor={() => 'rgba(255,255,255,0.7)'}
        labelDotRadius={0.3}
        labelAltitude={0.01}
        labelResolution={2}
        animateIn={true}
        width={width}
        height={height}
      />
    </div>
  );
}

// Helper function to get ship type color
function getShipTypeColor(shipType) {
  const colors = {
    'Cargo': '#64748b',
    'Tanker': '#ef4444',
    'Passenger': '#3b82f6',
    'Fishing': '#10b981',
    'Tug': '#f59e0b',
    'Other': '#94a3b8'
  };
  return colors[shipType] || '#94a3b8';
}
