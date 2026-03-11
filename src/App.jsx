import { useState } from 'react';
import { GlobeView } from './components/GlobeView';
import { ShipSelector } from './components/ShipSelector';

function App() {
  const [selectedShip, setSelectedShip] = useState('');

  return (
    <div className="w-full h-screen bg-navy relative overflow-hidden">
      <ShipSelector 
        selectedShip={selectedShip} 
        onShipSelect={setSelectedShip} 
      />
      
      <GlobeView selectedShip={selectedShip} />
    </div>
  );
}

export default App;
