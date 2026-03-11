import { useState, useEffect, useRef } from 'react';
import { GlobeView } from './components/GlobeView';
import { ShipSelector } from './components/ShipSelector';
import { Menu } from 'lucide-react';

function App() {
  const [selectedShip, setSelectedShip] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [globeDimensions, setGlobeDimensions] = useState({ width: 0, height: 0 });
  const globeContainerRef = useRef(null);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ResizeObserver for globe dimensions
  useEffect(() => {
    if (!globeContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setGlobeDimensions({ width, height });
      }
    });

    resizeObserver.observe(globeContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleShipSelect = (shipId) => {
    setSelectedShip(shipId);
    // Close mobile menu after selection
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0f1e',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Mobile Header */}
      {isMobile && (
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
          padding: '0 16px',
          zIndex: 40,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <div>
              <h1 style={{
                color: '#f1f5f9',
                fontWeight: '600',
                fontSize: '16px',
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.02em',
                margin: 0
              }}>Meridian</h1>
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            Live Fleet Tracking
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}>
        {/* Globe Container */}
        <div 
          ref={globeContainerRef}
          style={{
            flex: 1,
            height: isMobile ? '100vh' : 'calc(100vh - 56px)',
            marginTop: isMobile ? '56px' : '0',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <GlobeView 
            selectedShip={selectedShip} 
            width={globeDimensions.width}
            height={globeDimensions.height}
          />
        </div>

        {/* Sidebar - Desktop */}
        {!isMobile && (
          <div style={{
            width: '280px',
            height: 'calc(100vh - 56px)',
            marginTop: '56px',
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: 30
          }}>
            <ShipSelector 
              selectedShip={selectedShip} 
              onShipSelect={handleShipSelect}
              isMobile={false}
            />
          </div>
        )}

        {/* Mobile Menu Drawer */}
        {isMobile && showMobileMenu && (
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 45,
            onClick={handleMobileMenuToggle}
          }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '300px',
                height: '100vh',
                backgroundColor: '#0a0f1e',
                zIndex: 46,
                onClick={(e) => e.stopPropagation()}
              }}
            >
              <ShipSelector 
                selectedShip={selectedShip} 
                onShipSelect={handleShipSelect}
                isMobile={true}
                onMobileMenuToggle={handleMobileMenuToggle}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
