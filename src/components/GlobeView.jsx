import { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import { SHIPS, getShipById } from '../data/ships';

export function GlobeView({ selectedShip }) {
  const globeEl = useRef();

  // Only show selected ship
  const displayShips = selectedShip 
    ? SHIPS.filter(ship => ship.id === selectedShip)
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
        
        // Only render selected ship
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
