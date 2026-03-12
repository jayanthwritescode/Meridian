import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Haversine distance calculation
function haversineDistance(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const x = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

// Position interpolation function
function interpolatePosition(waypoints, t) {
  if (!waypoints || waypoints.length < 2) return { lat: 0, lon: 0 };
  
  // Build segments
  const segments = [];
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = haversineDistance(waypoints[i], waypoints[i + 1]);
    segments.push({ from: waypoints[i], to: waypoints[i + 1], distance: d });
    totalDistance += d;
  }
  
  // Find position at t
  let target = t * totalDistance;
  for (const seg of segments) {
    if (target <= seg.distance) {
      const f = target / seg.distance;
      return {
        lat: seg.from.lat + (seg.to.lat - seg.from.lat) * f,
        lon: seg.from.lon + (seg.to.lon - seg.from.lon) * f,
      };
    }
    target -= seg.distance;
  }
  
  // Clamp to destination
  const last = waypoints[waypoints.length - 1];
  return { lat: last.lat, lon: last.lon };
}

export function DetailPanel({ route, onClose, globeRef, onPositionChange }) {
  const [scrubPosition, setScrubPosition] = useState(0.0);

  // Reset scrub position when route changes
  useEffect(() => {
    setScrubPosition(0.0);
  }, [route]);

  // Build waypoints array
  const allWaypoints = [
    { lat: route.origin.lat, lon: route.origin.lon },
    ...(route.waypoints || []).map(w => ({ lat: w.lat, lon: w.lon })),
    { lat: route.destination.lat, lon: route.destination.lon }
  ];

  // Compute ship position inline during render
  const shipPosition = interpolatePosition(allWaypoints, scrubPosition);

  // Notify parent of position change
  useEffect(() => {
    console.log('DetailPanel useEffect - shipPosition:', shipPosition);
    console.log('DetailPanel useEffect - onPositionChange exists:', !!onPositionChange);
    
    if (onPositionChange && shipPosition) {
      const positionWithColor = {
        ...shipPosition,
        color: route.color || '#3b82f6'
      };
      console.log('DetailPanel calling onPositionChange with:', positionWithColor);
      onPositionChange(positionWithColor);
    }
  }, [shipPosition, route.color, onPositionChange]);

  // Read stats from route object with fallbacks
  const distance = route.distanceKm || route.distance_km || route.distance || 0;
  const duration = route.daysAtSea || route.days_at_sea || route.duration || 0;
  const co2 = route.co2 || route.co2Tonnes || route.co2_tonnes || '—';
  const carrier = route.carrier || route.carrierName || 'Unknown Carrier';
  const goods = route.goods || route.cargo || 'Unknown';
  const weight = route.weight || route.teu || '';

  // Debug logs
  console.log('ROUTE DATA:', route);
  console.log('COMPUTED STATS:', { distance, duration, co2, carrier });
  console.log('SHIP POSITION AT scrub', scrubPosition, ':', shipPosition);

  if (!route) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(10,15,30,0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px 16px 0 0',
      zIndex: 40,
      padding: '20px',
      maxHeight: '50vh',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            fontFamily: 'Syne, sans-serif',
            margin: '0 0 4px 0'
          }}>
            {route.origin.name} → {route.destination.name}
          </h2>
          <div style={{
            fontSize: '13px',
            color: '#94a3b8'
          }}>
            {carrier}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '4px'
          }}>
            {distance.toLocaleString() || 'N/A'}
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
            {duration ? `${duration}d` : 'N/A'}
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
            {co2}
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
            {Math.round(scrubPosition * 100)}%
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

      {/* Cargo Info */}
      <div style={{
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#94a3b8',
          marginBottom: '4px'
        }}>
          Cargo: {goods} {weight && `• ${weight}`}
        </div>
      </div>

      {/* Scrubber */}
      <div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#f1f5f9',
          marginBottom: '8px',
          fontFamily: 'Syne, sans-serif'
        }}>
          Voyage Progress
        </div>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={scrubPosition}
          onChange={(e) => setScrubPosition(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '4px',
            accentColor: route.color || '#3b82f6',
            cursor: 'pointer',
            margin: '8px 0'
          }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#64748b',
          marginTop: '4px'
        }}>
          <div>{route.origin.name}</div>
          <div>{route.destination.name}</div>
        </div>
      </div>
    </div>
  );
}
