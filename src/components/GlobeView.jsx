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
        size: 6,
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
        size: 1,
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

  // Get all route arcs
  const routeArcs = useMemo(() => {
    const arcs = [];
    
    Object.entries(SHIP_ROUTES).forEach(([routeId, route]) => {
      const ship = SHIPS.find(s => s.id === routeId);
      const coords = [
        route.origin,
        ...route.waypoints,
        route.destination
      ];
      
      // Create arc segments
      for (let i = 0; i < coords.length - 1; i++) {
        arcs.push({
          startLat: coords[i].lat,
          startLng: coords[i].lon,
          endLat: coords[i + 1].lat,
          endLng: coords[i + 1].lon,
          color: ship?.color || '#64748b',
          stroke: selectedRoute === routeId ? 2 : 0.8,
          opacity: selectedRoute === routeId ? 1 : 0.2
        });
      }
    });
    
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

  // Auto-rotation control
  useEffect(() => {
    if (!globeEl.current) return;
    
    const globe = globeEl.current;
    
    // Auto-rotate when no route is selected
    if (!selectedRoute) {
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.4;
    } else {
      globe.controls().autoRotate = false;
      
      // Fly to selected route midpoint
      const route = SHIP_ROUTES[selectedRoute];
      if (route) {
        const coords = [route.origin, ...route.waypoints, route.destination];
        const midIndex = Math.floor(coords.length / 2);
        const midpoint = coords[midIndex];
        
        globe.pointOfView(
          { lat: midpoint.lat, lng: midpoint.lon, altitude: 1.8 },
          1200
        );
      }
    }
  }, [selectedRoute]);

  // Handle user interaction to pause auto-rotation
  useEffect(() => {
    if (!globeEl.current) return;
    
    const globe = globeEl.current;
    
    const handleInteraction = () => {
      globe.controls().autoRotate = false;
    };
    
    globe.controls().addEventListener('start', handleInteraction);
    
    return () => {
      globe.controls().removeEventListener('start', handleInteraction);
    };
  }, []);

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
        arcStroke="stroke"
        arcDashLength={selectedRoute ? 0.5 : 0}
        arcDashGap={selectedRoute ? 0.3 : 0}
        arcDashAnimateTime={selectedRoute ? 1500 : 0}
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
