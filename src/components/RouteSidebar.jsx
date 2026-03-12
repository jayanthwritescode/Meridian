import { useState, useRef, useEffect } from 'react';
import { SHIP_ROUTES } from '../data/routes';
import { SHIPS } from '../data/ships';
import { Search } from 'lucide-react';

export function RouteSidebar({ selectedRoute, onRouteSelect, isMobile, onMobileMenuToggle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setErrorMessage('');
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const results = [];
    const queryLower = query.toLowerCase().trim();

    // Check if it's a 9-digit MMSI
    if (/^\d{9}$/.test(query)) {
      const matchingShip = SHIPS.find(ship => ship.mmsi === query);
      if (matchingShip) {
        const route = SHIP_ROUTES[matchingShip.id];
        if (route) {
          results.push({
            id: matchingShip.id,
            ship: matchingShip,
            route,
            type: 'mmsi'
          });
        }
      } else {
        setErrorMessage(`MMSI ${query} not in current database`);
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
    } else {
      // Text search - partial match against vessel names and route names
      Object.entries(SHIP_ROUTES).forEach(([routeId, route]) => {
        const ship = SHIPS.find(s => s.id === routeId);
        if (ship) {
          const vesselNameMatch = ship.name.toLowerCase().includes(queryLower);
          const routeNameMatch = `${route.origin.name} → ${route.destination.name}`.toLowerCase().includes(queryLower);
          const originMatch = route.origin.name.toLowerCase().includes(queryLower);
          const destinationMatch = route.destination.name.toLowerCase().includes(queryLower);
          
          if (vesselNameMatch || routeNameMatch || originMatch || destinationMatch) {
            results.push({
              id: routeId,
              ship,
              route,
              type: 'text',
              matchType: vesselNameMatch ? 'vessel' : routeNameMatch ? 'route' : originMatch ? 'origin' : 'destination'
            });
          }
        }
      });
    }

    setSearchResults(results);
    setShowDropdown(true);
  };

  const handleResultClick = (result) => {
    onRouteSelect(result.id);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    if (isMobile && onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length === 1) {
      handleResultClick(searchResults[0]);
    }
  };

  const getRouteStatus = (routeId) => {
    // Simple status logic - could be enhanced with real data
    const statuses = ['ON ROUTE', 'DELAYED', 'COMPLETED'];
    const weights = [0.7, 0.2, 0.1];
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i];
      }
    }
    return statuses[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ON ROUTE': return '#10b981';
      case 'DELAYED': return '#f59e0b';
      case 'COMPLETED': return '#64748b';
      default: return '#64748b';
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#1a1f2e',
      borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.07)',
      overflowY: 'auto',
      padding: '24px'
    }}>
      {/* Search Section */}
      <div style={{
        marginBottom: '32px'
      }}>
        <div style={{
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#64748b',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}>
          MMSI OR VESSEL NAME
        </div>
        
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <div ref={searchInputRef} style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Enter MMSI or vessel name..."
              style={{
                width: 'calc(100% - 88px)',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '13px',
                fontFamily: 'JetBrains Mono, monospace',
                padding: '0 12px'
              }}
            />
            
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '0',
                top: '0',
                width: '80px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '13px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
            >
              SEARCH
            </button>
            
            {/* Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '44px',
                left: 0,
                right: 0,
                backgroundColor: '#0a0f1e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                zIndex: 10,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      color: '#f1f5f9',
                      marginBottom: '4px'
                    }}>
                      {result.ship.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#94a3b8'
                    }}>
                      {result.route.origin.name} → {result.route.destination.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
        
        {/* Error Message */}
        {errorMessage && (
          <div style={{
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#ef4444',
            marginTop: '8px'
          }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Routes Section */}
      <div>
        <div style={{
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '600',
          color: '#64748b',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          ROUTES
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {Object.entries(SHIP_ROUTES).map(([routeId, route]) => {
            const ship = SHIPS.find(s => s.id === routeId);
            const status = getRouteStatus(routeId);
            const isSelected = selectedRoute === routeId;
            
            return (
              <div
                key={routeId}
                onClick={() => onRouteSelect(routeId)}
                style={{
                  padding: '16px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  borderLeft: `2px solid ${ship?.color || '#64748b'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  maxHeight: '72px',
                  overflow: 'hidden',
                  ...(isSelected && {
                    boxShadow: `inset 3px 0 0 ${ship?.color || '#64748b'}`
                  })
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: '500',
                  color: '#f1f5f9',
                  marginBottom: '4px'
                }}>
                  {ship?.name || 'Unknown Vessel'}
                </div>
                
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '8px'
                }}>
                  {route.origin.name} → {route.destination.name}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: '500',
                    color: getStatusColor(status),
                    backgroundColor: `${getStatusColor(status)}20`,
                    border: `1px solid ${getStatusColor(status)}40`,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    letterSpacing: '0.05em'
                  }}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
