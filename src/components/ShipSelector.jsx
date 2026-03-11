import { useState } from 'react';
import { SHIPS, getShipByCode } from '../data/ships';
import { useAISStream } from '../hooks/useAISStream';
import { getMMSIList } from '../data/aisConfig';
import { SHIP_ROUTES } from '../data/routes';
import { Ship, MapPin, Database, Radio, Activity, Anchor } from 'lucide-react';

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
      case 'connected': return '#22c55e';
      case 'connecting': return '#f59e0b';
      case 'reconnecting': return '#f59e0b';
      case 'stale': return '#f59e0b';
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
      default: return '○ OFFLINE';
    }
  };

  const getRouteInfo = (shipId) => {
    const route = SHIP_ROUTES[shipId];
    if (!route) return '';
    return `${route.origin.name} → ${route.destination.name}`;
  };

  const getCountryCode = (flag) => {
    const codes = {
      'Panama': 'PA',
      'Liberia': 'LR', 
      'Hong Kong': 'HK'
    };
    return codes[flag] || 'UN';
  };

  const getVesselColor = (shipId) => {
    // Map ship IDs to route colors
    const colorMap = {
      'MSCGULSUN': '#3b82f6', // Blue - Shanghai → Rotterdam
      'EVERAPEX': '#f59e0b',   // Amber - LA → Tokyo
      'COSCOFORTUNE': '#a855f7' // Purple - Santos → Antwerp
    };
    
    return colorMap[shipId] || '#3b82f6';
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
      backgroundColor: '#0a0f1e',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        height: '56px',
        backgroundColor: '#0a0f1e',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.07)'
          }}>
            <Anchor size="16" strokeWidth="1.5" style={{ color: '#f1f5f9' }} />
          </div>
          <div>
            <h3 style={{
              color: '#f1f5f9',
              fontWeight: '600',
              fontSize: '16px',
              fontFamily: 'Syne, sans-serif',
              letterSpacing: '0.02em',
              marginBottom: '2px'
            }}>Fleet Command</h3>
            <div style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              color: getStatusColor(),
              fontWeight: '400',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>{getStatusText()}</div>
          </div>
        </div>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.07)'
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" style={{ color: '#f1f5f9' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Search Section */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '400'
          }}>Vessel Search</div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search the fleet..."
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0d1526',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 200ms ease'
              }}
            />
            <div style={{
              position: 'absolute',
              right: '16px',
              top: '14px',
              color: '#64748b'
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Fleet */}
        <div>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '400'
          }}>Active Fleet ({filteredShips.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredShips.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px 0',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px'
              }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" style={{ color: '#64748b', marginBottom: '12px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div style={{ color: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                  No vessels found
                </div>
                <div style={{ color: '#334155', fontSize: '12px', marginTop: '4px' }}>
                  Try different search terms
                </div>
              </div>
            ) : (
              filteredShips.map(ship => {
                const vesselColor = getVesselColor(ship.id);
                const isSelected = selectedShip === ship.id;
                
                return (
                  <button
                    key={ship.id}
                    onClick={() => handleShipSelect(ship.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '16px',
                      borderRadius: '10px',
                      border: `2px solid ${isSelected ? vesselColor : 'rgba(255,255,255,0.07)'}`,
                      borderLeft: `4px solid ${vesselColor}`,
                      background: isSelected 
                        ? 'rgba(255,255,255,0.08)' 
                        : 'rgba(255,255,255,0.04)',
                      color: '#f1f5f9',
                      transition: 'all 200ms ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.background = 'rgba(255,255,255,0.06)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.14)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.background = 'rgba(255,255,255,0.04)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.07)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Ship size="20" strokeWidth="1.5" style={{ color: vesselColor }} />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                            {ship.name}
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '10px',
                              fontFamily: 'JetBrains Mono, monospace',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              color: '#64748b'
                            }}>
                              {getCountryCode(ship.flag)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: vesselColor,
                          boxShadow: `0 0 6px ${vesselColor}`
                        }}
                      />
                    </div>

                    <div style={{ fontSize: '12px', lineHeight: '1.4', color: '#64748b' }}>
                      <div style={{ marginBottom: '4px' }}>{ship.description}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                        <MapPin size="14" strokeWidth="1.5" style={{ color: '#64748b' }} />
                        <span>{getRouteInfo(ship.id)}</span>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', marginTop: '4px', color: '#334155' }}>
                        ID: {ship.id} • MMSI: {ship.mmsi}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Track */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '400'
          }}>Quick Track</div>
          <form onSubmit={handleCodeSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={shipCode}
              onChange={(e) => setShipCode(e.target.value)}
              placeholder="Enter vessel ID..."
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#0d1526',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
                color: '#ffffff',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 200ms ease'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 20px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                color: '#f1f5f9',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                fontWeight: '400',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.target.style.borderColor = 'rgba(255,255,255,0.14)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.04)';
                e.target.style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              Track
            </button>
          </form>
        </div>

        {selectedShip && (
          <div style={{
            backgroundColor: 'rgba(10,15,30,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px 16px 0 0',
            padding: '20px 24px'
          }}>
            {/* Selected Vessel */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px',
                fontWeight: '400'
              }}>Selected Vessel</div>
              {(() => {
                const ship = SHIPS.find(s => s.id === selectedShip);
                const vesselColor = getVesselColor(selectedShip);
                return ship ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Ship size="24" strokeWidth="1.5" style={{ color: vesselColor }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '16px', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                          {ship.name}
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '10px',
                            fontFamily: 'JetBrains Mono, monospace',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '4px',
                            padding: '2px 5px',
                            color: '#64748b'
                          }}>
                            {getCountryCode(ship.flag)}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {ship.description}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size="12" strokeWidth="1.5" style={{ color: '#64748b' }} />
                        <span>{getRouteInfo(ship.id)}</span>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#334155' }}>
                        ID: {ship.id} • MMSI: {ship.mmsi}
                      </div>
                    </div>
                    <button
                      onClick={() => onShipSelect('')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: '#64748b',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '12px',
                        fontWeight: '400',
                        border: '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer',
                        transition: 'all 200ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.14)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.04)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.07)';
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Voyage Details */}
            <div>
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px',
                fontWeight: '400'
              }}>Voyage Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Ship size="12" strokeWidth="1.5" style={{ color: '#64748b' }} />
                    Origin
                  </span>
                  <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                    {SHIP_ROUTES[selectedShip]?.origin.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.114.732a9 9 0 00-6.086-.71l-.108.054a9 9 0 01-6.208-.682L3 4.5M3 15V4.5" />
                    </svg>
                    Destination
                  </span>
                  <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                    {SHIP_ROUTES[selectedShip]?.destination.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3.75 3.75 0 11-7.5 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>
                    Waypoints
                  </span>
                  <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                    {SHIP_ROUTES[selectedShip]?.waypoints.length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.114.732a9 9 0 00-6.086-.71l-.108.054a9 9 0 01-6.208-.682L3 4.5M3 15V4.5" />
                    </svg>
                    Distance
                  </span>
                  <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>
                    ~{Math.round(SHIP_ROUTES[selectedShip]?.waypoints.length * 500)}nm
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fleet Statistics */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '400'
          }}>Fleet Statistics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size="14" strokeWidth="1.5" style={{ color: '#64748b' }} />
                Data Source
              </span>
              <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>AISStream.io</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Radio size="14" strokeWidth="1.5" style={{ color: '#64748b' }} />
                Tracked
              </span>
              <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{mmsiList.length} vessels</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Ship size="14" strokeWidth="1.5" style={{ color: '#64748b' }} />
                Available
              </span>
              <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{SHIPS.length} ships</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size="14" strokeWidth="1.5" style={{ color: '#64748b' }} />
                Status
              </span>
              <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
