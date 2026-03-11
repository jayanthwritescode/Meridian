import { useRef, useEffect, useState, useMemo } from 'react';
import { SHIPS, getShipById } from '../data/ships';
import { useAISStream } from '../hooks/useAISStream';
import { SHIP_ROUTES } from '../data/routes';

export function GlobeView({ selectedShip, width, height }) {
  const globeEl = useRef();
  const { vessels } = useAISStream([]);
  const [shipProgress, setShipProgress] = useState(0);

  // Get featured vessels (enriched live data)
  const featuredVessels = useMemo(() => {
    if (!selectedShip) return [];
    
    const featuredShip = SHIPS.find(ship => ship.id === selectedShip);
    if (!featuredShip) return [];
    
    // Find corresponding live vessel data
    const liveVessel = vessels.get(featuredShip.mmsi);
    
    return [{
      ...featuredShip,
      lat: liveVessel?.lat || featuredShip.lat,
      lon: liveVessel?.lon || featuredShip.lon,
      speed: liveVessel?.speed || null,
      heading: liveVessel?.heading || null,
      live: !!liveVessel,
      lastUpdate: liveVessel?.timestamp || null
    }];
  }, [selectedShip, vessels]);

  // Get non-featured live vessels for performance rendering
  const liveVesselsPoints = useMemo(() => {
    const featuredMMSIs = new Set(SHIPS.map(ship => ship.mmsi));
    
    return Array.from(vessels.values())
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
  }, [vessels]);

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

  // Featured vessel markers with enhanced styling
  const featuredVesselMarkers = useMemo(() => {
    return featuredVessels.map(ship => ({
      ...ship,
      size: 6,
      isFeatured: true,
      color: getShipById(ship.id)?.color || '#3b82f6'
    }));
  }, [featuredVessels]);

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

  // Update ship progress
  useEffect(() => {
    if (selectedShip && featuredVessels.length > 0) {
      const progress = getShipProgress(selectedShip, featuredVessels[0]);
      setShipProgress(progress);
    }
  }, [selectedShip, featuredVessels]);

  // Globe controls
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.4;
      
      if (selectedShip && featuredVessels.length > 0) {
        const ship = featuredVessels[0];
        setTimeout(() => {
          globeEl.current.pointOfView(
            { lat: ship.lat, lng: ship.lon, altitude: 1.5 },
            1000
          );
        }, 500);
      }
    }
  }, [selectedShip, featuredVessels]);

  // Combine all points for single rendering
  const allPoints = useMemo(() => {
    const points = [];
    
    // Add featured vessels first (non-merged)
    featuredVesselMarkers.forEach(ship => {
      points.push({
        ...ship,
        isFeatured: true,
        altitude: 0.2
      });
    });
    
    // Add live vessels (merged)
    liveVesselsPoints.forEach(vessel => {
      points.push({
        ...vessel,
        isLive: true,
        altitude: 0.02
      });
    });
    
    return points;
  }, [featuredVesselMarkers, liveVesselsPoints]);

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
        pointsData={allPoints}
        pointLat="lat"
        pointLng="lon"
        pointColor="color"
        pointRadius="size"
        pointAltitude={d => d.altitude}
        pointsMerge={d => !d.isFeatured} // Only merge non-featured vessels
        
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
        ringLat="lat"
        ringLng="lng"
        ringColor="color"
        ringMaxRadius="maxRadius"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
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
