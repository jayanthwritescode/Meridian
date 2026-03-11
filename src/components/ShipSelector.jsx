import { useState, useEffect, useMemo } from 'react';
import { SHIPS, getShipByCode } from '../data/ships';
import { useVesselPosition } from '../hooks/useVesselPosition';
import { SHIP_ROUTES } from '../data/routes';
import { Ship, MapPin, Database, Radio, Activity, Anchor, X, Menu } from 'lucide-react';

export function ShipSelector({ selectedShip, onShipSelect, isMobile, onMobileMenuToggle }) {
  const [shipCode, setShipCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState(new Map());
  const [showCursor, setShowCursor] = useState(true);
  
  const { featuredVessels: featuredData, liveVessels: liveData, connectionStatus, liveCount } = useVesselPosition();

  // Blinking cursor for loading state
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Handle watchlist management
  useEffect(() => {
    if (shipCode.length === 9 && /^\d{9}$/.test(shipCode)) {
      const mmsi = shipCode;
      if (!watchlist.has(mmsi)) {
        const newWatchlist = new Map(watchlist);
        newWatchlist.set(mmsi, {
          addedAt: Date.now(),
          hasSignal: false
        });
        setWatchlist(newWatchlist);
      }
    }
  }, [shipCode, watchlist]);

  // Update watchlist when vessels receive signal
  useEffect(() => {
    const updatedWatchlist = new Map(watchlist);
    let hasUpdates = false;
    
    for (const [mmsi, watchInfo] of updatedWatchlist) {
      if (liveData.has(mmsi) && !watchInfo.hasSignal) {
        watchInfo.hasSignal = true;
        watchInfo.firstSignalAt = Date.now();
        hasUpdates = true;
      }
    }
    
    if (hasUpdates) {
      setWatchlist(updatedWatchlist);
    }
  }, [liveData, watchlist]);

  const handleShipSelect = (shipId) => {
    console.log('handleShipSelect called with:', shipId);
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
    const colorMap = {
      'MSCGULSUN': '#3b82f6',
      'EVERAPEX': '#f59e0b',
      'COSCOFORTUNE': '#a855f7'
    };
    return colorMap[shipId] || '#3b82f6';
  };

  const getSignalFreshnessColor = (timestamp) => {
    const age = Date.now() - timestamp;
    if (age < 30000) return '#22c55e'; // Green - within 30s
    if (age < 120000) return '#f59e0b'; // Amber - 30-120s
    return '#6b7280'; // Gray - older
  };

  const formatTimeAgo = (timestamp) => {
    const age = Math.floor((Date.now() - timestamp) / 1000);
    if (age < 60) return `${age}s ago`;
    if (age < 3600) return `${Math.floor(age / 60)}m ago`;
    return `${Math.floor(age / 3600)}h ago`;
  };

  const getShipTypeColor = (shipType) => {
    if (!shipType) return 'rgba(255,255,255,0.25)';
    // AIS ship type mapping
    if (shipType >= 70 && shipType <= 79) return '#3b82f6'; // Cargo
    if (shipType >= 80 && shipType <= 89) return '#f59e0b'; // Tanker
    if (shipType >= 60 && shipType <= 69) return '#22c55e'; // Passenger
    return 'rgba(255,255,255,0.25)';
  };

  // Filter and sort vessels
  const { featuredVessels: filteredFeatured, liveVessels: filteredLive } = useMemo(() => {
    // Featured vessels from the new data layer
    const featured = Object.values(featuredData);
    
    // Live vessels from AIS data (excluding featured)
    const featuredMMSIs = new Set(featured.map(v => v.mmsi));
    const live = Array.from(liveData.values()).filter(vessel => !featuredMMSIs.has(vessel.mmsi));
    
    // Apply search filter
    const searchLower = searchTerm.toLowerCase();
    const filteredFeatured = searchLower 
      ? featured.filter(ship => 
          ship.name?.toLowerCase().includes(searchLower) ||
          ship.mmsi?.includes(searchLower)
        )
      : featured;
      
    const filteredLive = searchLower
      ? live.filter(vessel => 
          vessel.name?.toLowerCase().includes(searchLower) ||
          vessel.mmsi?.includes(searchLower)
        )
      : live;
    
    return {
      featuredVessels: filteredFeatured,
      liveVessels: filteredLive.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    };
  }, [featuredData, liveData, searchTerm]);

  const clearSearch = () => {
    setShipCode('');
    setSearchTerm('');
  };

  // Check for watchlist timeout
  const watchlistTimeout = useMemo(() => {
    for (const [mmsi, info] of watchlist) {
      if (!info.hasSignal && Date.now() - info.addedAt > 60000) {
        return mmsi;
      }
    }
    return null;
  }, [watchlist]);

  if (isMobile) {
    // Mobile drawer view
    return (
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '300px',
        height: '100vh',
        backgroundColor: '#0a0f1e',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: 'translateX(0%)'
      }}>
        {/* Mobile Header */}
        <div style={{
          height: '56px',
          backgroundColor: '#0a0f1e',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onMobileMenuToggle}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer'
              }}
            >
              <X size="16" strokeWidth="1.5" style={{ color: '#f1f5f9' }} />
            </button>
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
        </div>

        {/* Mobile Content - same as desktop but narrower */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Search Section */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{
              fontSize: '11px',
              color: '#64748b',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px',
              fontWeight: '400'
            }}>Vessel Search</div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={shipCode}
                onChange={(e) => {
                  setShipCode(e.target.value);
                  setSearchTerm(e.target.value);
                }}
                placeholder="Search by name or MMSI..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingRight: shipCode ? '36px' : '12px',
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
              {shipCode && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                >
                  <X size="14" strokeWidth="1.5" style={{ color: '#64748b' }} />
                </button>
              )}
            </div>
            {watchlistTimeout && (
              <div style={{
                fontSize: '10px',
                color: '#64748b',
                fontFamily: 'JetBrains Mono, monospace',
                marginTop: '6px'
              }}>
                No signal for MMSI {watchlistTimeout} — vessel may be out of range
              </div>
            )}
          </div>

          {/* Live Vessels List */}
          <div>
            <div style={{
              fontSize: '11px',
              color: '#64748b',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px',
              fontWeight: '400'
            }}>
              LIVE VESSELS ({filteredLive.length})
            </div>
            
            {liveCount === 0 && connectionStatus === 'live' ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '24px 0',
                color: '#64748b',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px'
              }}>
                Awaiting AIS signal{showCursor ? '_' : ''}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Featured vessels */}
                {filteredFeatured.map(ship => (
                  <button
                    key={ship.mmsi}
                    onClick={() => handleShipSelect(ship.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${selectedShip === ship.id ? ship.color : 'rgba(255,255,255,0.07)'}`,
                      borderLeft: `4px solid ${ship.color}`,
                      background: selectedShip === ship.id 
                        ? 'rgba(255,255,255,0.08)' 
                        : 'rgba(255,255,255,0.04)',
                      color: '#f1f5f9',
                      transition: 'all 200ms ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                      FEATURED
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                      {ship.name}
                      <span style={{
                        marginLeft: '6px',
                        fontSize: '9px',
                        fontFamily: 'JetBrains Mono, monospace',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '3px',
                        padding: '1px 3px',
                        color: '#64748b'
                      }}>
                        {getCountryCode(ship.flag)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {ship.speed}kt • {formatTimeAgo(ship.timestamp)}
                    </div>
                  </button>
                ))}

                {/* Live vessels */}
                {filteredLive.map(vessel => (
                  <button
                    key={vessel.mmsi}
                    onClick={() => handleShipSelect(vessel.id || vessel.mmsi)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.07)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#f1f5f9',
                      transition: 'all 200ms ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getSignalFreshnessColor(vessel.timestamp),
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '500', 
                        fontSize: '12px', 
                        marginBottom: '2px', 
                        fontFamily: 'Inter, sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {vessel.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                        {vessel.speed}kt • {formatTimeAgo(vessel.timestamp)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div style={{
      width: '280px',
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
              value={shipCode}
              onChange={(e) => {
                setShipCode(e.target.value);
                setSearchTerm(e.target.value);
              }}
              placeholder="Search by name or MMSI..."
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingRight: shipCode ? '40px' : '16px',
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
            {shipCode && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0'
                }}
              >
                <X size="14" strokeWidth="1.5" style={{ color: '#64748b' }} />
              </button>
            )}
          </div>
          {watchlistTimeout && (
            <div style={{
              fontSize: '10px',
              color: '#64748b',
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: '8px'
            }}>
              No signal for MMSI {watchlistTimeout} — vessel may be out of range
            </div>
          )}
        </div>

        {/* Live Vessels */}
        <div>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '400'
          }}>
            LIVE VESSELS ({filteredLive.length})
          </div>
          
          {liveCount === 0 && connectionStatus === 'live' ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '32px 0',
              color: '#64748b',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px'
            }}>
              Awaiting AIS signal{showCursor ? '_' : ''}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Featured vessels */}
              {filteredFeatured.map(ship => (
                <button
                  key={ship.mmsi}
                  onClick={() => handleShipSelect(ship.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px',
                    borderRadius: '10px',
                    border: `2px solid ${selectedShip === ship.id ? ship.color : 'rgba(255,255,255,0.07)'}`,
                    borderLeft: `4px solid ${ship.color}`,
                    background: selectedShip === ship.id 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(255,255,255,0.04)',
                    color: '#f1f5f9',
                    transition: 'all 200ms ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedShip !== ship.id) {
                      e.target.style.background = 'rgba(255,255,255,0.06)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.14)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedShip !== ship.id) {
                      e.target.style.background = 'rgba(255,255,255,0.04)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.07)';
                    }
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                    FEATURED
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Ship size="20" strokeWidth="1.5" style={{ color: ship.color }} />
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
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{ship.description}</div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: ship.color,
                        boxShadow: `0 0 6px ${ship.color}`
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
                      ID: {ship.id} • MMSI: {ship.mmsi} • {ship.speed}kt • {formatTimeAgo(ship.timestamp)}
                    </div>
                  </div>
                </button>
              ))}

              {/* Live vessels */}
              {filteredLive.map(vessel => (
                <button
                  key={vessel.mmsi}
                  onClick={() => handleShipSelect(vessel.id || vessel.mmsi)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    border: 'none',
                    backgroundColor: vessel.id ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = vessel.id ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = vessel.id ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)';
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getSignalFreshnessColor(vessel.timestamp),
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: '500', 
                      fontSize: '13px', 
                      marginBottom: '4px', 
                      fontFamily: 'Inter, sans-serif',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {vessel.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {vessel.speed}kt • {formatTimeAgo(vessel.timestamp)}
                      {vessel.destination && ` • ${vessel.destination}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
