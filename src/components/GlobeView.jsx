import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { vessels, ports, getRoutesData } from '../data/routes';
import { getVesselPositionAlongRoute } from '../utils/geo';
import { useAISStream } from '../hooks/useAISStream';
import { useShipLerp } from '../hooks/useShipLerp';

export function GlobeView({ selectedVessel, onVesselSelect, onVesselHover }) {
  const globeEl = useRef();
  const [vesselPositions, setVesselPositions] = useState([]);
  const [hoveredVessel, setHoveredVessel] = useState(null);
  
  const mmsiList = vessels.map(v => v.mmsi);
  const { positions, connectionStatus } = useAISStream(mmsiList);

  // Update vessel positions based on AIS data or fallback
  useEffect(() => {
    const updatedPositions = vessels.map(vessel => {
      const aisData = positions.get(vessel.mmsi);
      
      if (aisData) {
        return {
          ...vessel,
          lat: aisData.lat,
          lon: aisData.lon,
          speed: aisData.speed,
          heading: aisData.heading,
          live: true,
          lastUpdate: aisData.timestamp
        };
      } else {
        // Fallback to interpolated position
        const fallbackPos = getVesselPositionAlongRoute(vessel);
        return {
          ...vessel,
          lat: fallbackPos.lat,
          lon: fallbackPos.lon,
          speed: null,
          heading: null,
          live: false,
          lastUpdate: null
        };
      }
    });

    setVesselPositions(updatedPositions);
  }, [positions]);

  // Auto-rotate and initial focus
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.4;
      
      // Focus on Shanghai-Rotterdam route initially
      setTimeout(() => {
        globeEl.current.pointOfView(
          { lat: 25, lng: 60, altitude: 2 }, 
          1500
        );
      }, 100);
    }
  }, []);

  // Handle vessel selection
  useEffect(() => {
    if (selectedVessel && globeEl.current) {
      const vessel = vesselPositions.find(v => v.id === selectedVessel);
      if (vessel) {
        globeEl.current.pointOfView(
          { lat: vessel.lat, lng: vessel.lon, altitude: 1.8 },
          1000
        );
      }
    }
  }, [selectedVessel, vesselPositions]);

  const routesData = getRoutesData(vessels);

  return (
    <div className="w-full h-full relative">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.jpg"
        atmosphereColor="#1a6eff"
        atmosphereAltitude={0.15}
        
        // Route arcs
        arcsData={routesData}
        arcStartLat={d => d.originLat}
        arcStartLng={d => d.originLng}
        arcEndLat={d => d.destinationLat}
        arcEndLng={d => d.destinationLng}
        arcColor={d => [d.color, `${d.color}33`]}
        arcAltitude={0.3}
        arcStroke={1.5}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={3000}
        arcLabel={d => d.name}
        
        // Ship points
        pointsData={vesselPositions}
        pointLat={d => d.lat}
        pointLng={d => d.lon}
        pointColor={d => d.color}
        pointAltitude={0.02}
        pointRadius={0.6}
        pointsMerge={false}
        onPointClick={vessel => onVesselSelect?.(vessel)}
        onPointHover={vessel => {
          setHoveredVessel(vessel);
          onVesselHover?.(vessel);
        }}
        
        // Pulsing halos around ships
        pointsData={vesselPositions.map(v => ({...v, id: `${v.id}-halo`}))}
        pointLat={d => d.lat}
        pointLng={d => d.lon}
        pointColor={d => d.color}
        pointAltitude={0.01}
        pointRadius={1.2}
        pointOpacity={0.3}
        
        // Port labels
        labelsData={ports}
        labelLat={d => d.lat}
        labelLng={d => d.lon}
        labelText={d => d.name}
        labelSize={d => d.size}
        labelColor={() => "rgba(255,255,255,0.75)"}
        labelDotRadius={0.4}
        labelDotOrientation={() => "bottom"}
        
        // HTML overlays for vessel info
        htmlElementsData={vesselPositions}
        htmlLat={d => d.lat}
        htmlLng={d => d.lon}
        htmlAltitude={0.05}
        htmlElement={d => {
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="
              background: rgba(10,15,30,0.85);
              border: 1px solid ${d.color};
              border-radius: 6px;
              padding: 4px 8px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              color: ${d.color};
              white-space: nowrap;
              pointer-events: none;
              box-shadow: 0 0 12px ${d.color}44;
            ">
              ${d.name} · ${d.speed ? d.speed.toFixed(1) : '—'} kn
            </div>
          `;
          return el;
        }}
        
        // Ring pulses around ships
        ringsData={vesselPositions}
        ringLat={d => d.lat}
        ringLng={d => d.lon}
        ringColor={d => d.color}
        ringMaxRadius={3}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1200}
      />
      
      {/* Hover tooltip */}
      {hoveredVessel && (
        <div 
          className="absolute top-4 left-4 bg-navy/90 border border-white/10 rounded-lg p-3 font-mono text-xs"
          style={{ 
            background: 'rgba(10,15,30,0.9)',
            borderColor: hoveredVessel.color,
            boxShadow: `0 0 12px ${hoveredVessel.color}44`
          }}
        >
          <div className="text-white font-bold">{hoveredVessel.name}</div>
          <div style={{ color: hoveredVessel.color }}>
            {hoveredVessel.speed ? `${hoveredVessel.speed.toFixed(1)} kn` : 'No signal'}
          </div>
          <div className="text-gray-400">
            {hoveredVessel.live ? '● LIVE' : '○ AIS LOST'}
          </div>
        </div>
      )}
    </div>
  );
}
