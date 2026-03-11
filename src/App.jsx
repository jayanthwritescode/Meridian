import { useState } from 'react';
import { GlobeView } from './components/GlobeView';
import { ShipSelector } from './components/ShipSelector';

function App() {
  const [selectedShip, setSelectedShip] = useState('');

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#0a0f1e',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Globe takes full viewport */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
      }}>
        <GlobeView selectedShip={selectedShip} />
      </div>
      
      {/* Permanent Fleet Panel - Overlays on top */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        right: 0,
        width: '384px',
        height: '100vh',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}>
        <ShipSelector 
          selectedShip={selectedShip} 
          onShipSelect={setSelectedShip} 
        />
      </div>
    </div>
  );
}

export default App;
