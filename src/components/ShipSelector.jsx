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
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'reconnecting': return '#fb923c';
      case 'stale': return '#fb923c';
      case 'error': return '#ef4444';
      default: return '#6b7280';
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
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      borderLeft: '3px solid #3b82f6',
      boxShadow: '0 0 60px rgba(59, 130, 246, 0.4), inset 0 0 40px rgba(59, 130, 246, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Fleet Command Header */}
      <div style={{
        height: '80px',
        background: 'linear-gradient(135deg, #1e40af, #2563eb, #1e40af)',
        borderBottom: '3px solid #3b82f6',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9), rgba(37, 99, 235, 0.5))'
        }} />
        
        {/* Wave Pattern */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '32px',
          opacity: 0.7
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
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.3))',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '3px solid #3b82f6',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
            }}>
              <span style={{ fontSize: '28px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4)' }}>⚓</span>
            </div>
            <div>
              <h3 style={{
                color: 'white',
                fontWeight: '800',
                fontSize: '24px',
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.02em',
                textShadow: '0 4px 8px rgba(0,0,0,0.4)',
                marginBottom: '2px'
              }}>Fleet Command</h3>
              <div style={{
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                color: getStatusColor(),
                fontWeight: '600',
                letterSpacing: '0.05em',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>{getStatusText()}</div>
            </div>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '2px solid #3b82f6'
          }}>
            <span style={{ color: 'white', fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)' }}>🌊</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ 
        padding: '24px', 
        flex: 1, 
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#3b82f6 transparent'
      }}>
        {/* Vessel Search */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '12px',
            color: '#93c5fd',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '700'
          }}>Vessel Search</div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search the fleet..."
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '2px solid #3b82f6',
                borderRadius: '16px',
                color: 'white',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
              }}
            />
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '18px',
              color: '#93c5fd'
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Fleet */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '12px',
            color: '#93c5fd',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '700'
          }}>Active Fleet ({filteredShips.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredShips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔭</div>
                <div style={{ color: '#93c5fd', fontFamily: 'JetBrains Mono, monospace', fontSize: '16px' }}>
                  No vessels found
                </div>
                <div style={{ color: '#60a5fa', fontSize: '13px', marginTop: '6px' }}>
                  Try different search terms
                </div>
              </div>
            ) : (
              filteredShips.map(ship => (
                <button
                  key={ship.id}
                  onClick={() => handleShipSelect(ship.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '20px',
                    borderRadius: '20px',
                    border: selectedShip === ship.id 
                      ? '3px solid #3b82f6' 
                      : '2px solid rgba(59, 130, 246, 0.3)',
                    background: selectedShip === ship.id 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.3))' 
                      : 'rgba(59, 130, 246, 0.08)',
                    color: selectedShip === ship.id ? 'white' : '#e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    boxShadow: selectedShip === ship.id 
                      ? '0 8px 32px rgba(59, 130, 246, 0.4)' 
                      : '0 4px 20px rgba(59, 130, 246, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedShip !== ship.id) {
                      e.target.style.background = 'rgba(59, 130, 246, 0.15)';
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.transform = 'translateX(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedShip !== ship.id) {
                      e.target.style.background = 'rgba(59, 130, 246, 0.08)';
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      e.target.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '28px' }}>{getShipTypeIcon(ship.description)}</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{ship.name}</div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>{getShipFlag(ship.flag)}</div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        backgroundColor: ship.color
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <div style={{ opacity: 0.9, marginBottom: '6px' }}>{ship.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7, fontSize: '12px' }}>
                      <span>📍</span>
                      <span>{getRouteInfo(ship.id)}</span>
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', opacity: 0.6, fontSize: '11px', marginTop: '6px' }}>
                      ID: {ship.id} • MMSI: {ship.mmsi}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quick Track */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '12px',
            color: '#93c5fd',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '700'
          }}>Quick Track</div>
          <form onSubmit={handleCodeSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={shipCode}
              onChange={(e) => setShipCode(e.target.value)}
              placeholder="Enter vessel ID..."
              style={{
                flex: 1,
                padding: '16px 20px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '2px solid #3b82f6',
                borderRadius: '16px',
                color: 'white',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '16px 28px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white',
                borderRadius: '16px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '15px',
                fontWeight: '700',
                border: '2px solid #3b82f6',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 24px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #1d4ed8, #2563eb)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #2563eb, #3b82f6)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.4)';
              }}
            >
              Track
            </button>
          </form>
        </div>

        {selectedShip && (
          <div style={{ marginBottom: '24px' }}>
            {/* Selected Vessel */}
            <div style={{
              marginBottom: '20px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
              border: '2px solid #3b82f6',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#93c5fd',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                fontWeight: '700'
              }}>Selected Vessel</div>
              {(() => {
                const ship = SHIPS.find(s => s.id === selectedShip);
                return ship ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '36px' }}>{getShipTypeIcon(ship.description)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: 'white', fontSize: '18px', marginBottom: '6px' }}>{ship.name}</div>
                        <div style={{ fontSize: '14px', color: '#93c5fd' }}>
                          {getShipFlag(ship.flag)} • {ship.description}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#93c5fd', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>📍 {getRouteInfo(ship.id)}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', opacity: 0.8 }}>
                        ID: {ship.id} • MMSI: {ship.mmsi}
                      </div>
                    </div>
                    <button
                      onClick={() => onShipSelect('')}
                      style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: 'rgba(239, 68, 68, 0.25)',
                        color: '#f87171',
                        borderRadius: '16px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '14px',
                        fontWeight: '700',
                        border: '2px solid #ef4444',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Voyage Details */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(30, 58, 138, 0.4))',
              border: '2px solid #3b82f6',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#93c5fd',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                fontWeight: '700'
              }}>Voyage Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#93c5fd' }}>🚢 Origin</span>
                  <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace' }}>
                    {SHIP_ROUTES[selectedShip]?.origin.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#93c5fd' }}>🏁 Destination</span>
                  <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace' }}>
                    {SHIP_ROUTES[selectedShip]?.destination.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#93c5fd' }}>⚓ Waypoints</span>
                  <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace' }}>
                    {SHIP_ROUTES[selectedShip]?.waypoints.length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#93c5fd' }}>📏 Distance</span>
                  <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace' }}>
                    ~{Math.round(SHIP_ROUTES[selectedShip]?.waypoints.length * 500)}nm
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fleet Statistics */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(30, 58, 138, 0.3))',
          border: '2px solid #3b82f6',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#93c5fd',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '16px',
            fontWeight: '700'
          }}>Fleet Statistics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd' }}>📡 Data Source</span>
              <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace' }}>AISStream.io</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd' }}>🚢 Tracked</span>
              <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace' }}>{mmsiList.length} vessels</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd' }}>📋 Available</span>
              <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace' }}>{SHIPS.length} ships</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd' }}>🌊 Status</span>
              <span style={{ color: 'white', fontFamily: 'JetBrains Mono, monospace' }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
