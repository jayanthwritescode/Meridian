import { useState, useEffect, useRef } from 'react';
import { GlobeView } from './components/GlobeView';
import { RouteSidebar } from './components/RouteSidebar';
import { DetailPanel } from './components/DetailPanel';
import { SHIP_ROUTES } from './data/routes';

function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [shipPosition, setShipPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [globeDimensions, setGlobeDimensions] = useState({ width: 0, height: 0 });
  const globeContainerRef = useRef(null);

  // Check mobile width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle globe container resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setGlobeDimensions({ width, height });
    });

    if (globeContainerRef.current) {
      resizeObserver.observe(globeContainerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);

  const handleRouteSelect = (routeId) => {
    setSelectedRoute(routeId);
    setShipPosition(null); // Reset ship position when route changes
  };

  const handleShipPositionChange = (position) => {
    console.log('App handleShipPositionChange called with:', position);
    setShipPosition(position);
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0f1e',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        backgroundColor: '#0a0f1e',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 40,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Anchor Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#f1f5f9' }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            <path d="M20.5 7.5L16 12l4.5 4.5M3.5 7.5L8 12l-4.5 4.5"/>
          </svg>
          
          <div>
            <h1 style={{
              color: '#f1f5f9',
              fontWeight: '600',
              fontSize: '16px',
              fontFamily: 'Syne, sans-serif',
              letterSpacing: '0.02em',
              margin: 0
            }}>Meridian</h1>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontFamily: 'Syne, sans-serif',
              letterSpacing: '0.01em',
              marginTop: '2px'
            }}>
              Atlas of Global Trade
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={handleMobileMenuToggle}
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
            <Menu size="16" strokeWidth="1.5" style={{ color: '#f1f5f9' }} />
          </button>
        )}
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}>
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <div style={{
            width: '300px',
            height: 'calc(100vh - 56px)',
            marginTop: '56px',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 30
          }}>
            <RouteSidebar 
              selectedRoute={selectedRoute}
              onRouteSelect={handleRouteSelect}
              isMobile={false}
            />
          </div>
        )}

        {/* Globe Container */}
        <div 
          ref={globeContainerRef}
          style={{
            flex: 1,
            height: 'calc(100vh - 56px)',
            marginTop: '56px',
            marginLeft: isMobile ? '0' : '300px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <GlobeView 
            selectedRoute={selectedRoute}
            width={globeDimensions.width}
            height={globeDimensions.height}
          />
        </div>

        {/* Mobile Menu Drawer */}
        {isMobile && showMobileMenu && (
          <div 
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 45
            }}
            onClick={handleMobileMenuToggle}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '300px',
                height: '100vh',
                backgroundColor: '#0a0f1e',
                zIndex: 46
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <RouteSidebar 
                selectedRoute={selectedRoute}
                onRouteSelect={handleRouteSelect}
                isMobile={true}
                onMobileMenuToggle={handleMobileMenuToggle}
              />
            </div>
          </div>
        )}

        {/* Detail Panel */}
        {selectedRoute && (
          <DetailPanel 
            route={SHIP_ROUTES[selectedRoute]}
            onClose={() => setSelectedRoute(null)}
            globeRef={null} // Not needed for now
            onPositionChange={handleShipPositionChange}
          />
        )}
      </div>
    </div>
  );
}

export default App;
