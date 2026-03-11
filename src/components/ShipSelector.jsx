import { useState } from 'react';
import { SHIPS, getShipByCode } from '../data/ships';

export function ShipSelector({ selectedShip, onShipSelect }) {
  const [shipCode, setShipCode] = useState('');

  const handleShipSelect = (shipId) => {
    onShipSelect(shipId);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const ship = getShipByCode(shipCode);
    if (ship) {
      onShipSelect(ship.id);
      setShipCode('');
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-navy/90 border border-white/20 rounded-lg p-4 w-80">
      <h3 className="text-white font-bold mb-3 font-syne">Ship Tracker</h3>
      
      {/* Ship List */}
      <div className="space-y-2 mb-4">
        {SHIPS.map(ship => (
          <button
            key={ship.id}
            onClick={() => handleShipSelect(ship.id)}
            className={`w-full text-left px-3 py-2 rounded font-mono text-sm transition-colors ${
              selectedShip === ship.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <div className="font-medium">{ship.name}</div>
            <div className="text-xs opacity-75">{ship.description}</div>
          </button>
        ))}
      </div>

      {/* Ship Code Input */}
      <form onSubmit={handleCodeSubmit} className="space-y-2">
        <input
          type="text"
          value={shipCode}
          onChange={(e) => setShipCode(e.target.value)}
          placeholder="Enter ship code..."
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white font-mono text-sm placeholder-gray-400"
        />
        <button
          type="submit"
          className="w-full px-3 py-2 bg-blue-600 text-white rounded font-mono text-sm hover:bg-blue-700 transition-colors"
        >
          Track Ship
        </button>
      </form>

      {selectedShip && (
        <button
          onClick={() => onShipSelect('')}
          className="w-full mt-2 px-3 py-2 bg-red-600/20 text-red-400 rounded font-mono text-sm hover:bg-red-600/30 transition-colors"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
}
