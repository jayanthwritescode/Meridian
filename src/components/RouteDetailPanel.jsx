import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Ship } from 'lucide-react';
import { WAYPOINT_FACTS } from '../data/routes';
import { SHIPS } from '../data/ships';
import { VoyageScrubber } from './VoyageScrubber';

export function RouteDetailPanel({ route, routeId, onClose, isMobile, onShipPositionChange }) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const panelRef = useRef(null);

  // Auto-cycle facts
  useEffect(() => {
    if (!route) return;
    
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => {
        const allFacts = [];
        [route.origin, ...route.waypoints, route.destination].forEach(waypoint => {
          const facts = WAYPOINT_FACTS[waypoint.name] || [];
          allFacts.push(...facts);
        });
        
        return (prev + 1) % allFacts.length;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [route]);

  const handleFactPrev = () => {
    setCurrentFactIndex((prev) => {
      const allFacts = [];
      [route.origin, ...route.waypoints, route.destination].forEach(waypoint => {
        const facts = WAYPOINT_FACTS[waypoint.name] || [];
        allFacts.push(...facts);
      });
      
      return prev === 0 ? allFacts.length - 1 : prev - 1;
    });
  };

  const handleFactNext = () => {
    setCurrentFactIndex((prev) => {
      const allFacts = [];
      [route.origin, ...route.waypoints, route.destination].forEach(waypoint => {
        const facts = WAYPOINT_FACTS[waypoint.name] || [];
        allFacts.push(...facts);
      });
      
      return (prev + 1) % allFacts.length;
    });
  };

  const getCurrentFact = () => {
    const allFacts = [];
    [route.origin, ...route.waypoints, route.destination].forEach(waypoint => {
      const facts = WAYPOINT_FACTS[waypoint.name] || [];
      allFacts.push(...facts);
    });
    
    return allFacts[currentFactIndex] || '';
  };

  if (!route) return null;

  // Log the full route object for debugging
  console.log('selected route fields:', JSON.stringify(route));
  console.log('RouteDetailPanel received route:', route);
  console.log('RouteDetailPanel received routeId:', routeId);
  console.log('Route stats:', route.stats);
  console.log('Route vessel:', route.vessel);
  console.log('Route schedule:', route.schedule);

  const vessel = route.vessel || {};
  const stats = route.stats || {};
  const waypoints = [route.origin, ...route.waypoints, route.destination];

  // Get ship data for additional info
  const ship = SHIPS.find(s => s.id === routeId);

  return (
    <div 
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px 16px 0 0',
        zIndex: 40,
        maxHeight: '380px',
        overflow: 'hidden'
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '32px',
          height: '32px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        <X size="16" style={{ color: '#f1f5f9' }} />
      </button>

      {/* Content */}
      <div style={{
        display: isMobile ? 'flex' : 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        padding: '24px',
        gap: '32px',
        height: '100%',
        overflowY: 'auto'
      }}>
        {/* Column 1 - Vessel Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: '18px',
            fontFamily: 'Syne, sans-serif',
            fontWeight: '600',
            color: '#f1f5f9',
            margin: '0 0 8px 0'
          }}>
            {ship?.name || vessel.name || 'Unknown Vessel'}
          </h2>
          
          <div style={{
            fontSize: '13px',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            {route.vessel?.carrier || 'Unknown Carrier'}
          </div>
          
          <div style={{
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            MMSI: {route.vessel?.mmsi || ship?.mmsi || 'Unknown'}
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '8px'
          }}>
            {route.vessel?.class || ship?.description || 'Container Vessel'}
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            Cargo: {route.vessel?.cargo || 'Container Goods'} • {route.vessel?.teu || ship?.description?.includes('TEU') ? ship.description.match(/[\d,]+ TEU/)?.[0] : 'Unknown'}
          </div>
        </div>

        {/* Column 2 - Voyage Stats & Scrubber */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '4px'
              }}>
                {route.stats?.distance?.toLocaleString() || '0'}
              </div>
              <div style={{
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#64748b'
              }}>
                DISTANCE (KM)
              </div>
            </div>
            
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '4px'
              }}>
                {route.stats?.duration ? `${route.stats.duration}d` : '0d'}
              </div>
              <div style={{
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#64748b'
              }}>
                DURATION
              </div>
            </div>
            
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '4px'
              }}>
                {route.stats?.co2 || '0'}
              </div>
              <div style={{
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#64748b'
              }}>
                CO₂ (TONNES)
              </div>
            </div>
            
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '4px'
              }}>
                50%
              </div>
              <div style={{
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#64748b'
              }}>
                PROGRESS
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#94a3b8',
          marginBottom: '8px'
        }}>
          {route.vessel?.class || ship?.description || 'Container Vessel'}
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#94a3b8',
          marginBottom: '4px'
        }}>
          Cargo: {route.vessel?.cargo || 'Container Goods'} • {route.vessel?.teu || ship?.description?.includes('TEU') ? ship.description.match(/[\d,]+ TEU/)?.[0] : 'Unknown'}
        </div>
      </div>

      {/* Column 2 - Voyage Stats & Scrubber */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '4px'
            }}>
              {route.stats?.distance?.toLocaleString() || 'N/A'}
            </div>
            <div style={{
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#64748b'
            }}>
              DISTANCE (KM)
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '4px'
            }}>
              {route.stats?.duration ? `${route.stats.duration}d` : 'N/A'}
            </div>
            <div style={{
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#64748b'
            }}>
              DURATION
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '4px'
            }}>
              {route.stats?.co2 || 'N/A'}
            </div>
            <div style={{
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#64748b'
            }}>
              CO₂ (TONNES)
            </div>
          </div>
          
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '4px'
            }}>
              50%
            </div>
            <div style={{
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#64748b'
            }}>
              PROGRESS
            </div>
          </div>
        </div>
        
        {/* Voyage Scrubber */}
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#f1f5f9',
            marginBottom: '16px',
            fontFamily: 'Syne, sans-serif'
          }}>
            VOYAGE PROGRESS
          </div>
          
          <VoyageScrubber 
            route={route} 
            routeId={routeId} 
            ship={ship}
            onPositionChange={onShipPositionChange}
          />
        </div>

        {/* Column 3 - Journey Timeline & Facts */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#f1f5f9',
            marginBottom: '16px',
            fontFamily: 'Syne, sans-serif'
          }}>
            Journey Timeline
          </div>
          
          {/* Timeline */}
          <div style={{
            position: 'relative',
            paddingLeft: '16px',
            marginBottom: '24px'
          }}>
            {waypoints.map((waypoint, index) => {
              const isActive = index / (waypoints.length - 1) <= 0.5; // Default to middle
              const isCurrent = Math.abs(index / (waypoints.length - 1) - 0.5) < 0.1;
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    marginBottom: '16px',
                    paddingLeft: '20px'
                  }}
                >
                  {/* Timeline line */}
                  {index < waypoints.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '6px',
                        top: '8px',
                        width: '2px',
                        height: '32px',
                        backgroundColor: isActive ? (ship?.color || vessel.color || '#3b82f6') : 'rgba(255,255,255,0.1)'
                      }}
                    />
                  )}
                  
                  {/* Waypoint dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '0',
                      top: '0',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent ? (ship?.color || vessel.color || '#3b82f6') : isActive ? (ship?.color || vessel.color || '#3b82f6') : 'rgba(255,255,255,0.2)',
                      border: isCurrent ? '2px solid #ffffff' : 'none'
                    }}
                  >
                    {isCurrent && (
                      <Ship
                        size="8"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#ffffff'
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Waypoint info */}
                  <div>
                    <div style={{
                      fontSize: '13px',
                      color: '#f1f5f9',
                      marginBottom: '2px'
                    }}>
                      {waypoint.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#64748b'
                    }}>
                      ETA: Day {Math.round(index / (waypoints.length - 1) * (stats.duration || 1))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Educational Facts */}
          <div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#64748b',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>DID YOU KNOW?</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleFactPrev}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size="14" style={{ color: '#64748b' }} />
                </button>
                <button
                  onClick={handleFactNext}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size="14" style={{ color: '#64748b' }} />
                </button>
              </div>
            </div>
            
            <div style={{
              fontSize: '13px',
              color: '#f1f5f9',
              lineHeight: '1.4',
              fontStyle: 'italic'
            }}>
              {getCurrentFact()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
