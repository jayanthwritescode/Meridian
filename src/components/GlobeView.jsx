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

  // Get route arcs for selected ship with proper altitude and animation
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

  // Get all unique ports from all routes for labeling
  const allPorts = selectedShip 
    ? (() => {
        const route = getRouteCoordinates(selectedShip);
        const uniquePorts = new Set();
        const portData = [];
        
        // Add origin and destination with labels
        if (route.length > 0) {
          // Origin
          const origin = route[0];
          if (!uniquePorts.has(`${origin.lat},${origin.lon}`)) {
            uniquePorts.add(`${origin.lat},${origin.lon}`);
            portData.push({
              lat: origin.lat,
              lon: origin.lon,
              size: 1.5,
              color: '#10b981',
              label: origin.name,
              isPort: true,
              isOrigin: true
            });
          }
          
          // Destination
          const destination = route[route.length - 1];
          if (!uniquePorts.has(`${destination.lat},${destination.lon}`)) {
            uniquePorts.add(`${destination.lat},${destination.lon}`);
            portData.push({
              lat: destination.lat,
              lon: destination.lon,
              size: 1.5,
              color: '#ef4444',
              label: destination.name,
              isPort: true,
              isDestination: true
            });
          }
        }
        
        return portData;
      })()
    : [];

  // Ship position markers - flat dots on surface
  const shipMarkers = selectedShip && displayShips.length > 0 
    ? displayShips.map(ship => ({
        ...ship,
        size: 2,
        isShip: true,
        color: ship.color
      }))
    : [];

  // Sonar pulse rings for ships
  const shipRings = selectedShip && displayShips.length > 0
    ? displayShips.map(ship => ({
        lat: ship.lat,
        lng: ship.lon,
        color: ship.color,
        maxRadius: 2,
        propagationSpeed: 1,
        repeatPeriod: 3000
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
        atmosphereAltitude={0.25}
        
        // Route arcs with proper altitude and animation
        arcsData={routeArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={() => ['#ffffff', '#ffffff']}
        arcStroke={1.5}
        arcAltitude={0.08}
        arcDashLength={0.4}
        arcDashGap={0.3}
        arcDashAnimateTime={1500}
        
        // Port markers
        pointsData={allPorts}
        pointLat="lat"
        pointLng="lon"
        pointColor="color"
        pointRadius="size"
        pointAltitude={0.01}
        pointLabel="label"
        pointLabelSize={12}
        pointLabelColor="#ffffff"
        pointLabelResolution={2}
        pointLabelAltitude={0.02}
        
        // Ship markers
        pointsMerge={false}
        pointsData={shipMarkers}
        pointLat="lat"
        pointLng="lon"
        pointColor="color"
        pointRadius="size"
        pointAltitude={0.0}
        pointOpacity={1}
        
        // Sonar rings for ships
        ringsData={shipRings}
        ringLat="lat"
        ringLng="lng"
        ringColor="color"
        ringMaxRadius="maxRadius"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringResolution={64}
      />
      
      {/* Ship progress indicator */}
      {selectedShip && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'rgba(10, 15, 30, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px'
        }}>
          <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px' }}>Route Progress</div>
          <div style={{ 
            width: '192px', 
            backgroundColor: '#374151', 
            borderRadius: '4px', 
            height: '8px', 
            marginBottom: '8px' 
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
