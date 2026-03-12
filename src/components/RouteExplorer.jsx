import { useState, useMemo } from 'react';
import { SHIP_ROUTES } from '../data/routes';
import { SHIPS } from '../data/ships';
import { MapPin, Ship, Package, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export function RouteExplorer({ isMobile }) {
  const [selectedRoute, setSelectedRoute] = useState('MSCGULSUN');
  const [expandedFact, setExpandedFact] = useState(null);

  // Debug logging
  console.log('RouteExplorer render debug:', {
    selectedRoute,
    isMobile,
    expandedFact
  });

  // Route data with simplified calculations
  const routes = useMemo(() => {
    return Object.entries(SHIP_ROUTES).map(([shipId, route]) => {
      const ship = SHIPS.find(s => s.id === shipId);
      
      return {
        shipId,
        ship,
        route,
        totalDistance: 1000, // Simplified for debugging
        totalDuration: 25, // Simplified for debugging
        co2Emissions: 150, // Simplified for debugging
        cargo: shipId === 'MSCGULSUN' ? '23,656 TEU' : shipId === 'EVERAPEX' ? '13,100 TEU' : '15,000 TEU'
      };
    });
  }, []);

  // Calculate distance between two points
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Educational facts for waypoints
  const educationalFacts = {
    'Shanghai': {
      facts: [
        "World's busiest container port by volume since 2005",
        "Handles over 43 million TEU annually",
        "Located at Yangtze River estuary"
      ]
    },
    'Taiwan Strait': {
      facts: [
        "One of world's most critical shipping chokepoints",
        "Over 50% of global container traffic passes through",
        "Average depth: 60 meters, maximum 120 meters"
      ]
    },
    'Strait of Malacca': {
      facts: [
        "Shortest route between Indian & Pacific Oceans",
        "Over 94,000 vessels transit annually",
        "Named after Malaysian Sultanate of Malacca"
      ]
    },
    'Indian Ocean': {
      facts: [
        "Covers 20% of Earth's ocean surface",
        "Average depth: 3,964 meters",
        "Connects Asia, Africa, Australia"
      ]
    },
    'Suez Canal': {
      facts: [
        "193 km artificial waterway",
        "8% of global trade passes through",
        "Saves 7,000 km compared to Africa route"
      ]
    },
    'Mediterranean': {
      facts: [
        "Largest sea entirely enclosed by land",
        "Connected to Atlantic via Strait of Gibraltar",
        "Average depth: 1,500 meters"
      ]
    },
    'Rotterdam': {
      facts: [
        "Europe's largest port by cargo tonnage",
        "Handles 440 million tons of cargo annually",
        "Pioneered automated container handling"
      ]
    },
    'Los Angeles': {
      facts: [
        "Busiest US container port",
        "Gateway to trans-Pacific trade",
        "Handles 9.3 million TEU annually"
      ]
    },
    'Tokyo': {
      facts: [
        "World's most advanced automated port",
        "Handles 40% of Japan's trade",
        "Bay of Tokyo: 1,500 km² area"
      ]
    },
    'Santos': {
      facts: [
        "Latin America's largest container port",
        "Handles 4.5 million TEU annually",
        "Major gateway for Brazilian exports"
      ]
    },
    'North Atlantic': {
      facts: [
        "Covers 106 million km²",
        "Primary route between Europe & Americas",
        "Strong currents affect fuel efficiency"
      ]
    },
    'Antwerp': {
      facts: [
        "Europe's second-largest port",
        "Handles 12 million TEU annually",
        "Located 80 km inland on Scheldt River"
      ]
    }
  };

  const selectedRouteData = routes.find(r => r.shipId === selectedRoute);

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100vh',
      backgroundColor: '#0a0f1e'
    }}>
      {/* Left Panel - Route Selector */}
      <div style={{
        width: isMobile ? '100%' : '360px',
        height: isMobile ? '40%' : '100vh',
        backgroundColor: '#1a1f2e',
        borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.07)',
        overflowY: 'auto',
        padding: '24px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#f1f5f9',
          marginBottom: '24px',
          letterSpacing: '0.02em'
        }}>
          Select Route
        </div>

        {/* Route Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {routes.map(route => (
            <div
              key={route.shipId}
              onClick={() => setSelectedRoute(route.shipId)}
              style={{
                backgroundColor: selectedRoute === route.shipId ? 'rgba(241,245,249,0.1)' : 'rgba(30,41,59,0.05)',
                border: `1px solid ${selectedRoute === route.shipId ? route.ship.color : 'rgba(255,255,255,0.07)'}`,
                borderLeft: `4px solid ${route.ship.color}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                boxShadow: selectedRoute === route.shipId ? 'inset 2px 0 8px rgba(59,130,246,0.3)' : 'none'
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  {route.ship.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '4px'
                }}>
                  {route.route.waypoints[0].name} → {route.route.waypoints[route.route.waypoints.length - 1].name}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgba(34,197,94,0.1)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: '500',
                  color: '#ffffff'
                }}>
                  ON ROUTE
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {route.totalDuration} days
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Voyage Stats */}
        {selectedRouteData && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: 'rgba(30,41,59,0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.07)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '8px'
                }}>
                  {Math.round(selectedRouteData.totalDistance).toLocaleString()}
                </div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#94a3b8'
                }}>
                  DISTANCE
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '8px'
                }}>
                  {selectedRouteData.totalDuration}
                </div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#94a3b8'
                }}>
                  DURATION
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '8px'
                }}>
                  {selectedRouteData.co2Emissions.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#94a3b8'
                }}>
                  CO₂ EMITTED
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '8px'
                }}>
                  {selectedRouteData.cargo}
                </div>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#94a3b8'
                }}>
                  CARGO
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Journey Timeline */}
        {selectedRouteData && (
          <div style={{
            marginTop: '32px',
            maxHeight: isMobile ? '300px' : '600px',
            overflowY: 'auto'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#f1f5f9',
              marginBottom: '16px',
              letterSpacing: '0.02em'
            }}>
              Journey Timeline
            </div>

            {selectedRouteData.route.waypoints.map((waypoint, index) => {
              const isDelayBlock = selectedRouteData.shipId === 'COSCOFORTUNE' && waypoint.name === 'North Atlantic';
              const isDeparted = index === 0;
              const isUpcoming = index > getCurrentWaypointIndex(selectedRouteData.shipId);

              return (
                <div key={index} style={{ marginBottom: '16px' }}>
                  {/* Waypoint Node */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: isDeparted ? selectedRouteData.ship.color : isUpcoming ? 'transparent' : '#64748b',
                      border: `2px solid ${isDeparted ? selectedRouteData.ship.color : '#64748b'}`,
                      position: 'relative'
                    }}>
                      {isDeparted && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: selectedRouteData.ship.color,
                          animation: 'pulse 2s infinite'
                        }} />
                      )}
                    </div>

                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '4px'
                      }}>
                        {waypoint.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        fontFamily: 'JetBrains Mono, monospace',
                        marginBottom: '4px'
                      }}>
                        {waypoint.lat.toFixed(2)}°, {waypoint.lon.toFixed(2)}°
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#64748b',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        {getCountryCode(waypoint.name)}
                      </div>
                    </div>
                  </div>

                  {/* Leg Details */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: '12px',
                    borderRadius: '6px',
                    borderLeft: `2px solid ${selectedRouteData.ship.color}33`
                  }}>
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#94a3b8',
                      marginBottom: '4px'
                    }}>
                      Distance: {Math.round(calculateDistance(
                        selectedRouteData.route.waypoints[index - 1]?.lat || waypoint.lat,
                        selectedRouteData.route.waypoints[index - 1]?.lon || waypoint.lon,
                        waypoint.lat,
                        waypoint.lon
                      ))} km
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#94a3b8',
                      marginBottom: '4px'
                    }}>
                      Duration: {Math.round(calculateDistance(
                        selectedRouteData.route.waypoints[index - 1]?.lat || waypoint.lat,
                        selectedRouteData.route.waypoints[index - 1]?.lon || waypoint.lon,
                        waypoint.lat,
                        waypoint.lon
                      ) / 37.04 * 24)} hours
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748b',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>
                      {getLegName(selectedRouteData.route.waypoints[index - 1], waypoint)}
                    </div>
                  </div>

                  {/* Delay Block */}
                  {isDelayBlock && (
                    <div style={{
                      backgroundColor: 'rgba(217,119,6,0.1)',
                      border: '1px solid rgba(217,119,6,0.3)',
                      borderRadius: '6px',
                      padding: '12px',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <AlertTriangle size="16" style={{ color: '#f59e0b' }} />
                        <div style={{
                          fontSize: '11px',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: '500',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#f59e0b'
                        }}>
                          WEATHER DELAY
                        </div>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#f59e0b',
                        marginBottom: '4px'
                      }}>
                        +3 days · Storm systems in North Atlantic
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        REVISED ETA: 28 Mar · 14:30 UTC
                      </div>
                    </div>
                  )}

                  {/* Educational Facts */}
                  <div style={{
                    marginTop: expandedFact === index ? '0' : '8px'
                  }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                        fontFamily: 'JetBrains Mono, monospace',
                        marginBottom: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => setExpandedFact(expandedFact === index ? null : index)}
                    >
                      <span style={{ color: '#94a3b8' }}>LEARN MORE</span>
                    </div>

                    {expandedFact === index && educationalFacts[waypoint.name] && (
                      <div style={{
                        backgroundColor: 'rgba(30,41,59,0.05)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginTop: '8px'
                      }}>
                        {educationalFacts[waypoint.name].facts.map((fact, i) => (
                          <div key={i} style={{
                            fontSize: '13px',
                            color: '#e2e8f0',
                            lineHeight: '1.4',
                            marginBottom: i < educationalFacts[waypoint.name].facts.length - 1 ? '8px' : '0'
                          }}>
                            {fact}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Panel - Route Map */}
      <div style={{
        flex: 1,
        height: isMobile ? '60%' : '100vh',
        position: 'relative',
        backgroundColor: '#0a0f1e'
      }}>
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          fontSize: '12px',
          color: '#64748b',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          zIndex: 10
        }}>
          {selectedRouteData?.route.waypoints[0]?.name} → {selectedRouteData?.route.waypoints[selectedRouteData?.route.waypoints.length - 1]?.name}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCurrentWaypointIndex(shipId) {
  // Simplified: return current leg based on elapsed time
  const now = Date.now();
  const departureTimes = {
    'MSCGULSUN': new Date('2026-03-01T08:00:00Z').getTime(),
    'EVERAPEX': new Date('2026-03-10T14:00:00Z').getTime(),
    'COSCOFORTUNE': new Date('2026-02-20T06:00:00Z').getTime()
  };
  
  const elapsed = (now - departureTimes[shipId]) / (1000 * 60 * 60); // days
  const route = SHIP_ROUTES[shipId];
  if (!route) return 0;
  
  const totalDistance = route.waypoints.reduce((sum, wp, index) => {
    if (index === 0) return sum;
    const prev = route.waypoints[index - 1];
    const distance = calculateDistance(prev.lat, prev.lon, wp.lat, wp.lon);
    return sum + distance;
  }, 0);
  
  const avgSpeed = 37.04; // km/day at 20 knots
  const distanceTraveled = elapsed * avgSpeed;
  let accumulated = 0;
  
  for (let i = 0; i < route.waypoints.length - 1; i++) {
    accumulated += calculateDistance(
      route.waypoints[i].lat,
      route.waypoints[i].lon,
      route.waypoints[i + 1].lat,
      route.waypoints[i + 1].lon
    );
    if (distanceTraveled <= accumulated) return i;
  }
  
  return Math.min(route.waypoints.length - 2, Math.max(0, getCurrentWaypointIndex(shipId)));
}

function getCountryCode(locationName) {
  const countryMap = {
    'Shanghai': 'CN', 'Los Angeles': 'US', 'Tokyo': 'JP',
    'Rotterdam': 'NL', 'Santos': 'BR', 'Antwerp': 'BE',
    'Suez Canal': 'EG', 'Strait of Malacca': 'MY',
    'Taiwan Strait': 'TW', 'Indian Ocean': 'IO',
    'North Atlantic': 'INTL', 'Mediterranean': 'INTL'
  };
  return countryMap[locationName] || 'INTL';
}

function getLegName(from, to) {
  if (!from || !to) return 'Open Ocean';
  
  const straits = {
    'Strait of Malacca': 'Strait of Malacca',
    'Suez Canal': 'Suez Canal',
    'English Channel': 'English Channel',
    'Taiwan Strait': 'Taiwan Strait'
  };
  
  return straits[from?.name] || straits[to?.name] || 'Open Ocean';
}
