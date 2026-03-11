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
      display: 'flex',
      overflow: 'hidden'
    }}>
      {/* Main Globe Area */}
      <div style={{ 
        flex: 1, 
        position: 'relative'
      }}>
        <GlobeView selectedShip={selectedShip} />
      </div>
      
      {/* Right Sidebar */}
      <div style={{ 
        width: '384px', 
        flexShrink: 0
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
