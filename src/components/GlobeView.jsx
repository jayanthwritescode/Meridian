import { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { SHIPS, getShipById } from '../data/ships';
import { useVesselPosition } from '../hooks/useVesselPosition';
import { SHIP_ROUTES } from '../data/routes';

export function GlobeView({ selectedShip, width, height }) {
  const globeEl = useRef();
  const { featuredVessels: featuredData, liveVessels } = useVesselPosition();
  const [shipProgress, setShipProgress] = useState(0);

  console.log('GlobeView rendered with selectedShip:', selectedShip);

  // Get selected featured vessel
  const selectedVessel = useMemo(() => {
    if (!selectedShip) return null;
    return featuredData[selectedShip] || null;
  }, [selectedShip, featuredData]);

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

  // Get route arcs for selected ship
  const routeArcs = useMemo(() => {
    if (!selectedShip) return [];
    
    const coords = getRouteCoordinates(selectedShip);
    const shipColor = getShipById(selectedShip)?.color || '#3b82f6';
    
    return coords.map((coord, index) => {
      if (index === 0) return null;
      const prevCoord = coords[index - 1];
      
      return {
        startLat: prevCoord.lat,
        startLng: prevCoord.lon,
        endLat: coord.lat,
        endLng: coord.lon,
        color: shipColor
      };
    }).filter(Boolean);
  }, [selectedShip]);

  // Get port markers
  const portMarkers = useMemo(() => {
    if (!selectedShip) return [];
    
    return getRouteCoordinates(selectedShip).map((coord, index) => {
      const isOrigin = index === 0;
      const isDestination = index === getRouteCoordinates(selectedShip).length - 1;
      
      return {
        lat: coord.lat,
        lon: coord.lon,
        size: isOrigin || isDestination ? 2.0 : 0.5,
        color: isOrigin ? '#10b981' : isDestination ? '#ef4444' : '#6b7280',
        label: coord.name,
        isOrigin,
        isDestination
      };
    });
  }, [selectedShip]);

  // Port labels for featured vessels only
  const portLabels = useMemo(() => {
    return portMarkers.filter(p => p.isOrigin || p.isDestination).map(port => ({
      lat: port.lat,
      lon: port.lon,
      size: 0.1,
      color: port.color,
      label: port.label,
      isLabel: true
    }));
  }, [portMarkers]);

  // Pulsing rings for featured vessel ports only
  const portRings = useMemo(() => {
    return portMarkers.filter(p => p.isOrigin || p.isDestination).map(port => ({
      lat: port.lat,
      lng: port.lon,
      color: port.color,
      maxRadius: 3,
      propagationSpeed: 1.5,
      repeatPeriod: 2000
    }));
  }, [portMarkers]);

  // Combine all points for single rendering
  const allPoints = useMemo(() => {
    const points = [];
    
    // Add featured vessel points
    featuredVesselMarkers.forEach(ship => {
      points.push({
        lat: ship.lat,
        lon: ship.lon,
        size: 1.5,
        color: ship.color,
        altitude: 0.1
      });
    });
    
    // Add live vessel points (smaller, non-featured)
    liveVesselsPoints.forEach(vessel => {
      points.push({
        lat: vessel.lat,
        lon: vessel.lon,
        size: 0.8,
        color: getShipTypeColor(vessel.shipType),
        altitude: 0.05
      });
    });
    
    console.log('allPoints debug:', points);
    return points;
  }, [featuredVesselMarkers, liveVesselsPoints]);

  // Sonar rings for featured vessels only
  const vesselRings = useMemo(() => {
    return featuredVesselMarkers.map(ship => ({
      lat: ship.lat,
      lng: ship.lon,
      color: ship.color,
      maxRadius: 4,
      propagationSpeed: 1.5,
      repeatPeriod: 1500
    }));
  }, [featuredVesselMarkers]);

  // Update ship progress
  useEffect(() => {
    if (selectedVessel) {
      setShipProgress(selectedVessel.progress || 0);
    }
  }, [selectedVessel]);

  // Globe controls
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.4;
      
      if (selectedVessel) {
        setTimeout(() => {
          globeEl.current.pointOfView(
            { lat: selectedVessel.lat, lng: selectedVessel.lon, altitude: 1.5 },
            1000
          );
        }, 500);
      }
    }
  }, [selectedVessel]);

  return (
    <div style={{ width: width || '100%', height: height || '100vh' }}>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="#0a0f1e"
        atmosphereColor="#1a6eff"
        atmosphereAltitude={0.15}
        
        // Route arcs
        arcsData={routeArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcStroke={2}
        arcAltitude={0.08}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        
        // Combined points data
        // Port labels (featured only)
        htmlElementsData={portLabels}
        htmlLat="lat"
        htmlLng="lon"
        htmlElement={d => {
          const el = document.createElement('div');
          el.innerHTML = d.label;
          el.style.color = '#ffffff';
          el.style.fontSize = '10px';
          el.style.fontFamily = 'JetBrains Mono, monospace';
          el.style.textAlign = 'center';
          el.style.pointerEvents = 'none';
          return el;
        }}
        
        // Port rings (featured only)
        ringsData={portRings}
        ringLat={d => d.lat}
        ringLng={d => d.lng}
        ringColor={d => () => d.color}
        ringMaxRadius={3}
        ringPropagationSpeed={1.5}
        ringRepeatPeriod={2000}
      />
      
      {/* Ship progress indicator */}
      {selectedShip && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'rgba(10,15,30,0.9)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          color: '#ffffff',
          zIndex: 40
        }}>
          <div style={{ 
            color: '#ffffff', 
            fontWeight: '600', 
            marginBottom: '8px',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Route Progress
          </div>
          <div style={{
            width: '192px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            height: '6px',
            marginBottom: '6px',
            overflow: 'hidden'
          }}>
            <div 
              style={{
                backgroundColor: '#3b82f6',
                height: '8px',
                borderRadius: '4px',
                transition: 'all 1s ease',
                width: `${shipProgress * 100}%`
              }}
            />
          </div>
          <div style={{ color: '#9ca3af' }}>
            {Math.round(shipProgress * 100)}% complete
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getShipTypeColor(shipType) {
  if (!shipType) return 'rgba(255,255,255,0.25)';
  if (shipType >= 70 && shipType <= 79) return '#3b82f6'; // Cargo
  if (shipType >= 80 && shipType <= 89) return '#f59e0b'; // Tanker
  if (shipType >= 60 && shipType <= 69) return '#22c55e'; // Passenger
  return 'rgba(255,255,255,0.25)';
}

function getRouteCoordinates(shipId) {
  console.log('getRouteCoordinates called with shipId:', shipId);
  const route = SHIP_ROUTES[shipId];
  console.log('found route:', route);
  if (!route) return [];
  
  const coords = [
    route.origin,
    ...route.waypoints,
    route.destination
  ];
  console.log('route coordinates:', coords);
  return coords;
}

function getShipProgress(shipId, ship) {
  const route = SHIP_ROUTES[shipId];
  if (!route || !ship) return 0;
  
  const coords = getRouteCoordinates(shipId);
  if (coords.length < 2) return 0;
  
  // Simple progress calculation based on route waypoints
  // In a real implementation, you'd calculate actual distance along the route
  const totalWaypoints = coords.length;
  const currentWaypoint = Math.floor(Math.random() * totalWaypoints); // Placeholder
  
  return currentWaypoint / (totalWaypoints - 1);
}
