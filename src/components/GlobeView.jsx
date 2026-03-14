import { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import { SHIPS, getShipById, getShipByMMSI } from '../data/ships';
import { useAISStream } from '../hooks/useAISStream';
import { getMMSIList } from '../data/aisConfig';

export function GlobeView({ selectedShip }) {
  const globeEl = useRef();
  const mmsiList = getMMSIList();
  const { positions, connectionStatus } = useAISStream(mmsiList);

  // Merge static ship data with AIS positions
  const displayShips = selectedShip 
    ? SHIPS.filter(ship => ship.id === selectedShip).map(ship => {
        const aisData = positions.get(ship.mmsi);
        return {
          ...ship,
          lat: aisData ? aisData.lat : ship.lat,
          lon: aisData ? aisData.lon : ship.lon,
          speed: aisData?.speed || null,
          heading: aisData?.heading || null,
          live: !!aisData,
          lastUpdate: aisData?.timestamp || null
        };
      })
    : [];

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
        
        // Render selected ship with real-time data
        pointsData={displayShips}
        pointLat="lat"
        pointLng="lon"
        pointColor="color"
        pointRadius={1}
        pointAltitude={0.02}
      />
    </div>
  );
}
