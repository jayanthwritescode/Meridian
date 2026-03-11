import { useState } from 'react';
import { SHIPS, getShipByCode } from '../data/ships';
import { useAISStream } from '../hooks/useAISStream';
import { getMMSIList } from '../data/aisConfig';
import { SHIP_ROUTES } from '../data/routes';

export function ShipSelector({ selectedShip, onShipSelect }) {
  const [shipCode, setShipCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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

  const getShipFlag = (flag) => {
    const flags = {
      'Panama': '🇵🇦',
      'Liberia': '🇱🇷', 
      'Hong Kong': '🇭🇰'
    };
    return flags[flag] || '🚢';
  };

  const getShipTypeIcon = (description) => {
    if (description.includes('Ultra Large')) return '🚢';
    if (description.includes('Panamax')) return '⛴️';
    if (description.includes('Post-Panamax')) return '🛳️';
    return '🚢';
  };

  const filteredShips = SHIPS.filter(ship => 
    ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      background: 'linear-gradient(to bottom, #0f172a, #1e3a8a 50%, #0f172a)',
      borderLeft: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Ocean Wave Header */}
      <div style={{ 
        position: 'relative', 
        height: '80px', 
        background: 'linear-gradient(to right, #2563eb, #06b6d4, #2563eb)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(30, 58, 138, 0.5), transparent)'
        }} />
        
        {/* Wave Effect */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '48px'
        }}>
          <svg style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }} viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z" fill="rgba(59, 130, 246, 0.3)" />
            <path d="M0,15 Q25,5 50,15 T100,15 L100,20 L0,20 Z" fill="rgba(37, 99, 235, 0.4)" />
          </svg>
        </div>
        
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          height: '100%', 
          padding: '0 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span style={{ fontSize: '24px' }}>⚓</span>
            </div>
            <div>
              <h3 style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '20px',
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.05em'
              }}>Fleet Command</h3>
              <div style={{ 
                fontSize: '12px', 
                fontFamily: 'JetBrains Mono, monospace',
                color: getStatusColor()
              }}>{getStatusText()}</div>
            </div>
          </div>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <span style={{ color: 'white', fontSize: '14px' }}>🌊</span>
          </div>
        </div>
      </div>
      {/* Ocean Wave Header */}
      <div className="relative h-20 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-800/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-900 to-transparent opacity-60"></div>
        
        {/* Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-12">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-800/30 to-transparent"></div>
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z" fill="rgba(59, 130, 246, 0.3)" />
            <path d="M0,15 Q25,5 50,15 T100,15 L100,20 L0,20 Z" fill="rgba(37, 99, 235, 0.4)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-2xl">⚓</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl font-syne tracking-wide">Fleet Command</h3>
              <div className={`text-xs font-mono ${getStatusColor()}`}>{getStatusText()}</div>
            </div>
          </div>
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-sm">🌊</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 h-full overflow-y-auto pb-32">
        {/* Search Section */}
        <div className="space-y-3">
          <div className="text-xs text-blue-300 font-mono tracking-wider uppercase">Vessel Search</div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search the fleet..."
              className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white font-mono text-sm placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm"
            />
            <div className="absolute right-3 top-3 text-blue-300/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Ship Fleet */}
        <div className="space-y-3">
          <div className="text-xs text-blue-300 font-mono tracking-wider uppercase">Active Fleet ({filteredShips.length})</div>
          <div className="space-y-3">
            {filteredShips.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🔭</div>
                <div className="text-blue-300 font-mono text-sm">No vessels found</div>
                <div className="text-blue-400/60 text-xs mt-1">Try different search terms</div>
              </div>
            ) : (
              filteredShips.map(ship => (
                <button
                  key={ship.id}
                  onClick={() => handleShipSelect(ship.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedShip === ship.id 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-600/30 border border-blue-400/50' 
                      : 'bg-white/10 text-gray-200 hover:bg-white/20 hover:shadow-lg border border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getShipTypeIcon(ship.description)}</div>
                      <div>
                        <div className="font-semibold text-sm">{ship.name}</div>
                        <div className="text-xs opacity-80">{getShipFlag(ship.flag)}</div>
                      </div>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: ship.color }}
                    />
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="opacity-80">{ship.description}</div>
                    <div className="flex items-center gap-1 opacity-60">
                      <span>📍</span>
                      <span className="truncate">{getRouteInfo(ship.id)}</span>
                    </div>
                    <div className="font-mono opacity-50 text-xs">ID: {ship.id} • MMSI: {ship.mmsi}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quick Track */}
        <div className="space-y-3">
          <div className="text-xs text-blue-300 font-mono tracking-wider uppercase">Quick Track</div>
          <form onSubmit={handleCodeSubmit} className="flex gap-2">
            <input
              type="text"
              value={shipCode}
              onChange={(e) => setShipCode(e.target.value)}
              placeholder="Enter vessel ID..."
              className="flex-1 px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white font-mono text-sm placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-mono text-sm hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-blue-600/30 border border-blue-400/30"
            >
              Track
            </button>
          </form>
        </div>

        {selectedShip && (
          <div className="space-y-4">
            {/* Selected Ship Panel */}
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-xs text-blue-300 font-mono tracking-wider uppercase mb-3">Selected Vessel</div>
              {(() => {
                const ship = SHIPS.find(s => s.id === selectedShip);
                return ship ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getShipTypeIcon(ship.description)}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{ship.name}</div>
                        <div className="text-sm text-blue-200">{getShipFlag(ship.flag)} • {ship.description}</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-300 space-y-1">
                      <div>📍 {getRouteInfo(ship.id)}</div>
                      <div className="font-mono opacity-70">ID: {ship.id} • MMSI: {ship.mmsi}</div>
                    </div>
                    <button
                      onClick={() => onShipSelect('')}
                      className="w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-lg font-mono text-sm hover:bg-red-600/30 transition-colors border border-red-400/30"
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : null;
              })()}
            </div>
            
            {/* Route Details */}
            <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/50 border border-blue-400/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-xs text-blue-300 font-mono tracking-wider uppercase mb-3">Voyage Details</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">🚢 Origin</span>
                  <span className="text-white font-mono">{SHIP_ROUTES[selectedShip]?.origin.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">🏁 Destination</span>
                  <span className="text-white font-mono">{SHIP_ROUTES[selectedShip]?.destination.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">⚓ Waypoints</span>
                  <span className="text-white font-mono">{SHIP_ROUTES[selectedShip]?.waypoints.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">📏 Distance</span>
                  <span className="text-white font-mono">~{Math.round(SHIP_ROUTES[selectedShip]?.waypoints.length * 500)}nm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fleet Statistics */}
        <div className="bg-gradient-to-br from-slate-800/30 to-blue-900/30 border border-blue-400/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-xs text-blue-300 font-mono tracking-wider uppercase mb-3">Fleet Statistics</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-200">📡 Data Source</span>
              <span className="text-white font-mono">AISStream.io</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">🚢 Tracked</span>
              <span className="text-white font-mono">{mmsiList.length} vessels</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">📋 Available</span>
              <span className="text-white font-mono">{SHIPS.length} ships</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">🌊 Status</span>
              <span className="text-white font-mono">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
