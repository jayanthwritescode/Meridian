import { useState, useRef } from 'react';
import { Header } from './components/Header';
import { GlobeView } from './components/GlobeView';
import { TestGlobe } from './components/TestGlobe';
import { Sidebar } from './components/Sidebar';
import { DetailPanel } from './components/DetailPanel';
import { vessels } from './data/routes';
import { getVesselPositionAlongRoute } from './utils/geo';

function App() {
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [hoveredVessel, setHoveredVessel] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [useTestGlobe, setUseTestGlobe] = useState(true);
  const globeRef = useRef(null);

  // Update vessel positions with fallback data
  const [vesselPositions, setVesselPositions] = useState(() => 
    vessels.map(vessel => ({
      ...vessel,
      lat: getVesselPositionAlongRoute(vessel).lat,
      lon: getVesselPositionAlongRoute(vessel).lon,
      live: false
    }))
  );

  const handleVesselSelect = (vessel) => {
    setSelectedVessel(vessel);
  };

  const handleVesselHover = (vessel) => {
    setHoveredVessel(vessel);
  };

  const handleVesselFocus = (vessel) => {
    // Globe will handle camera focus internally
  };

  const handleCloseDetail = () => {
    setSelectedVessel(null);
  };

  return (
    <div className="w-full h-full bg-navy relative overflow-hidden">
      {/* Header */}
      <Header connectionStatus={connectionStatus} />

      {/* Test toggle */}
      <div className="absolute top-20 right-4 z-50">
        <button
          onClick={() => setUseTestGlobe(!useTestGlobe)}
          className="bg-navy/90 border border-white/20 rounded px-3 py-2 font-mono text-xs text-white hover:bg-navy"
        >
          {useTestGlobe ? 'Use Full App' : 'Use Test Globe'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-full pt-32">
        {useTestGlobe ? (
          <div className="flex-1">
            <TestGlobe />
          </div>
        ) : (
          <div className="flex-1">
            <GlobeView />
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedVessel && (
        <DetailPanel 
          vessel={selectedVessel}
          onClose={handleCloseDetail}
        />
      )}

      {/* Hover tooltip */}
      {hoveredVessel && !selectedVessel && (
        <div 
          className="absolute top-40 left-96 glass rounded-lg p-3 font-mono text-xs pointer-events-none z-40"
          style={{ 
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

export default App;
