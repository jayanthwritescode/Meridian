import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { SHIPS, getShipById, getShipByMMSI } from '../data/ships';
import { useAISStream } from '../hooks/useAISStream';
import { getMMSIList } from '../data/aisConfig';
import { getRouteCoordinates, getShipProgress } from '../data/routes';

export function GlobeView({ selectedShip }) {
  const globeEl = useRef();
  const mmsiList = getMMSIList();
  const { positions, connectionStatus } = useAISStream(mmsiList);
  const [shipProgress, setShipProgress] = useState(0);

  // Merge static ship data with AIS positions
  const displayShips = selectedShip 
    ? SHIPS.filter(ship => ship.id === selectedShip).map(ship => {
        const aisData = positions.get(ship.mmsi);
        const currentPosition = aisData 
          ? { lat: aisData.lat, lon: aisData.lon }
          : { lat: ship.lat, lon: ship.lon };
          
        return {
          ...ship,
          lat: currentPosition.lat,
          lon: currentPosition.lon,
          speed: aisData?.speed || null,
          heading: aisData?.heading || null,
          live: !!aisData,
          lastUpdate: aisData?.timestamp || null
        };
      })
    : [];

  // Get route arcs for selected ship - simplified approach
  const routeArcs = selectedShip 
    ? (() => {
        const coords = getRouteCoordinates(selectedShip);
        const shipColor = getShipById(selectedShip)?.color || '#3b82f6';
        
        const arcs = coords.map((coord, index) => {
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
        
        return arcs;
      })()
    : [];

  // Get port markers with enhanced styling
  const portMarkers = selectedShip 
    ? getRouteCoordinates(selectedShip).map((coord, index) => {
      const isOrigin = index === 0;
      const isDestination = index === getRouteCoordinates(selectedShip).length - 1;
      
      return {
        lat: coord.lat,
        lon: coord.lon,
        size: isOrigin || isDestination ? 2.0 : 0.5,
        color: isOrigin ? '#10b981' : isDestination ? '#ef4444' : '#6b7280',
        label: coord.name,
        isOrigin,
        isDestination,
        id: `port-${index}`
      };
    })
    : [];

  // Port labels as points
  const portLabels = selectedShip 
    ? portMarkers.filter(p => p.isOrigin || p.isDestination).map(port => ({
        lat: port.lat,
        lon: port.lon,
        size: 0.1,
        color: port.color,
        label: port.isOrigin ? `🚢 ${port.label}` : `🏁 ${port.label}`,
        isLabel: true
      }))
    : [];

  // Ship position marker with trail effect
  const shipMarkers = selectedShip && displayShips.length > 0 
    ? displayShips.map(ship => ({
        ...ship,
        size: 6,
        isShip: true
      }))
    : [];

  // Ship trail (recent positions)
  const shipTrail = selectedShip && displayShips.length > 0
    ? Array.from({ length: 5 }, (_, i) => {
        const ship = displayShips[0];
        const progress = (i + 1) * 0.02; // Small trail behind ship
        return {
          lat: ship.lat - progress * 0.1,
          lon: ship.lon - progress * 0.1,
          size: 1.5 - i * 0.2,
          color: ship.color,
          opacity: 0.3 - i * 0.05,
          isTrail: true
        };
      })
    : [];

  // Combined all markers for single rendering
  const allMarkers = selectedShip 
    ? [
        ...portMarkers,
        ...portLabels,
        ...shipTrail,
        ...shipMarkers
      ]
    : [];

  // Pulsing rings for origin/destination ports
  const portRings = selectedShip 
    ? portMarkers.filter(p => p.isOrigin || p.isDestination).map(port => ({
      lat: port.lat,
      lng: port.lon,
      color: port.color,
      maxRadius: 3,
      propagationSpeed: 1.5,
      repeatPeriod: 2000
    }))
    : [];

  // Update ship progress
  useEffect(() => {
    if (selectedShip && displayShips.length > 0) {
      const progress = getShipProgress(selectedShip, displayShips[0]);
      setShipProgress(progress);
    }
  }, [selectedShip, displayShips]);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.4;
      
      // Focus on selected ship
      if (selectedShip) {
        const ship = getShipById(selectedShip);
        if (ship) {
          setTimeout(() => {
            globeEl.current.pointOfView(
              { lat: ship.lat, lng: ship.lon, altitude: 1.5 },
              1000
            );
          }, 500);
        }
      }
    }
  }, [selectedShip]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="#0a0f1e"
        atmosphereColor="#1a6eff"
        atmosphereAltitude={0.15}
        
        // Fixed route lines using correct API
        arcsData={routeArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcStroke={2}
        arcAltitude={0.01}
        arcDashLength={0}
        arcDashGap={0}
        arcDashAnimateTime={0}
        
        // All markers in single pointsData call
        pointsData={allMarkers}
        pointLat="lat"
        pointLng="lon"
        pointColor="color"
        pointRadius="size"
        pointAltitude={d => d.isShip ? 0.2 : 0.02}
        pointOpacity={d => d.opacity || 1}
        
        // Pulsing rings for ports
        ringsData={portRings}
        ringLat="lat"
        ringLng="lon"
        ringColor="color"
        ringMaxRadius="maxRadius"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />
      
      {/* Ship progress indicator */}
      {selectedShip && (
        <div className="absolute bottom-4 left-4 bg-navy/90 border border-white/20 rounded-lg p-3 font-mono text-xs">
          <div className="text-white font-bold mb-2">Route Progress</div>
          <div className="w-48 bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${shipProgress * 100}%` }}
            />
          </div>
          <div className="text-gray-400">
            {Math.round(shipProgress * 100)}% complete
          </div>
        </div>
      )}
    </div>
  );
}
