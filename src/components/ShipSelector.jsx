import { useState } from 'react';
import { SHIPS, getShipByCode } from '../data/ships';
import { useAISStream } from '../hooks/useAISStream';
import { getMMSIList } from '../data/aisConfig';
import { SHIP_ROUTES } from '../data/routes';

export function ShipSelector({ selectedShip, onShipSelect }) {
  const [shipCode, setShipCode] = useState('');
  const mmsiList = getMMSIList();
  const { connectionStatus } = useAISStream(mmsiList);

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

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'reconnecting': return 'text-orange-400';
      case 'stale': return 'text-orange-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '● LIVE';
      case 'connecting': return '● CONNECTING';
      case 'reconnecting': return '● RECONNECTING';
      case 'stale': return '● STALE DATA';
      case 'error': return '● CONNECTION ERROR';
      default: return '○ DISCONNECTED';
    }
  };

  const getRouteInfo = (shipId) => {
    const route = SHIP_ROUTES[shipId];
    if (!route) return '';
    return `${route.origin.name} → ${route.destination.name}`;
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-navy/90 border border-white/20 rounded-lg p-4 w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold font-syne">Ship Tracker</h3>
        <div className={`text-xs font-mono ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>
      
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
            <div className="text-xs opacity-50 truncate">{getRouteInfo(ship.id)}</div>
            <div className="text-xs opacity-50">MMSI: {ship.mmsi}</div>
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
        <>
          <button
            onClick={() => onShipSelect('')}
            className="w-full mt-2 px-3 py-2 bg-red-600/20 text-red-400 rounded font-mono text-sm hover:bg-red-600/30 transition-colors"
          >
            Clear Selection
          </button>
          
          {/* Route Info */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-gray-400 font-mono">
              <div className="font-bold text-white mb-1">Route Details</div>
              <div>🚢 {SHIP_ROUTES[selectedShip]?.origin.name}</div>
              <div>🏁 {SHIP_ROUTES[selectedShip]?.destination.name}</div>
              <div>⚓ {SHIP_ROUTES[selectedShip]?.waypoints.length} waypoints</div>
            </div>
          </div>
        </>
      )}

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-gray-400 font-mono">
          <div>API: AISStream.io</div>
          <div>Tracking: {mmsiList.length} vessels</div>
        </div>
      </div>
    </div>
  );
}
