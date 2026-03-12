import { useState, useRef, useEffect, useCallback } from 'react';
import { WAYPOINT_FACTS } from '../data/routes';

// Haversine distance calculation
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Interpolate position along route
const interpolatePosition = (route, progress) => {
  const waypoints = [route.origin, ...route.waypoints, route.destination];
  
  // Calculate cumulative distances
  const distances = [];
  let totalDistance = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segmentDistance = haversineDistance(
      waypoints[i].lat, waypoints[i].lon,
      waypoints[i + 1].lat, waypoints[i + 1].lon
    );
    distances.push(segmentDistance);
    totalDistance += segmentDistance;
  }
  
  // Find which segment we're on
  const targetDistance = progress * totalDistance;
  let accumulatedDistance = 0;
  let segmentIndex = 0;
  
  for (let i = 0; i < distances.length; i++) {
    if (accumulatedDistance + distances[i] >= targetDistance) {
      segmentIndex = i;
      break;
    }
    accumulatedDistance += distances[i];
  }
  
  // Interpolate within the segment
  const segmentProgress = (targetDistance - accumulatedDistance) / distances[segmentIndex];
  const start = waypoints[segmentIndex];
  const end = waypoints[segmentIndex + 1];
  
  return {
    lat: start.lat + (end.lat - start.lat) * segmentProgress,
    lon: start.lon + (end.lon - start.lon) * segmentProgress,
    segmentIndex,
    segmentProgress,
    currentLegName: end.legName || 'Open Ocean'
  };
};

// Format datetime
const formatDateTime = (date) => {
  return date.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }) + ' · ' + date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  }) + ' UTC';
};

// Format duration
const formatDuration = (hours) => {
  const days = Math.floor(hours / 24);
  const hrs = Math.floor(hours % 24);
  return `${days}d ${hrs}h`;
};

export function VoyageScrubber({ route, routeId, ship, onPositionChange }) {
  const [scrubPosition, setScrubPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const [hoveredWaypoint, setHoveredWaypoint] = useState(null);
  const [currentFact, setCurrentFact] = useState('');
  
  const scrubberRef = useRef(null);
  const dragTimeoutRef = useRef(null);
  const positionRef = useRef(null);
  
  // Initialize scrubber position to 0 on route select
  useEffect(() => {
    setScrubPosition(0);
  }, [routeId]);
  
  // Calculate position and notify parent
  const updatePosition = useCallback((progress) => {
    if (!route) return;
    
    const position = interpolatePosition(route, progress);
    positionRef.current = position;
    
    if (onPositionChange) {
      onPositionChange({
        lat: position.lat,
        lon: position.lon,
        color: ship?.color || '#3b82f6',
        size: 0.5,
        altitude: 0.01
      });
    }
    
    // Update current fact based on position
    updateCurrentFact(position);
  }, [route, ship, onPositionChange]);
  
  // Update current educational fact
  const updateCurrentFact = (position) => {
    const waypoints = [route.origin, ...route.waypoints, route.destination];
    const totalWaypoints = waypoints.length;
    
    // Find nearest waypoint
    let nearestWaypoint = null;
    let minDistance = Infinity;
    
    waypoints.forEach((waypoint, index) => {
      const waypointProgress = index / (totalWaypoints - 1);
      const distance = Math.abs(position.segmentIndex + position.segmentProgress - waypointProgress);
      
      if (distance < minDistance && distance < 0.03) {
        minDistance = distance;
        nearestWaypoint = waypoint;
      }
    });
    
    if (nearestWaypoint) {
      // Use waypoint-specific fact
      const facts = WAYPOINT_FACTS[nearestWaypoint.name];
      if (facts && facts.length > 0) {
        setCurrentFact(facts[Math.floor(Math.random() * facts.length)]);
        return;
      }
    }
    
    // Use leg-specific fact or default
    setCurrentFact(`Sailing through ${position.currentLegName} - one of the world's major shipping routes.`);
  };
  
  // Handle scrubber change
  const handleScrubberChange = (e) => {
    const newPosition = parseFloat(e.target.value);
    setScrubPosition(newPosition);
    updatePosition(newPosition);
  };
  
  // Handle drag start
  const handleMouseDown = () => {
    setIsDragging(true);
    setShowFloatingCard(true);
    clearTimeout(dragTimeoutRef.current);
  };
  
  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    dragTimeoutRef.current = setTimeout(() => {
      setShowFloatingCard(false);
    }, 1500);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    let newPosition = scrubPosition;
    
    switch(e.key) {
      case 'ArrowLeft':
        newPosition = Math.max(0, scrubPosition - 0.02);
        break;
      case 'ArrowRight':
        newPosition = Math.min(1, scrubPosition + 0.02);
        break;
      case 'Home':
        newPosition = 0;
        break;
      case 'End':
        newPosition = 1;
        break;
      case 'n':
      case 'N':
        newPosition = 0.5; // NOW position (could be computed from real-time data)
        break;
      default:
        return;
    }
    
    e.preventDefault();
    setScrubPosition(newPosition);
    updatePosition(newPosition);
  };
  
  // Reset to NOW
  const resetToNow = () => {
    setScrubPosition(0.5); // Would be computed from real-time position
    updatePosition(0.5);
  };
  
  if (!route) return null;
  
  const waypoints = [route.origin, ...route.waypoints, route.destination];
  const position = interpolatePosition(route, scrubPosition);
  const totalDistance = waypoints.reduce((acc, wp, i) => {
    if (i === 0) return 0;
    return acc + haversineDistance(waypoints[i-1].lat, waypoints[i-1].lon, wp.lat, wp.lon);
  }, 0);
  
  const distanceFromOrigin = scrubPosition * totalDistance;
  const remainingDistance = totalDistance - distanceFromOrigin;
  
  const totalHours = (route.stats?.duration || 1) * 24;
  const elapsedHours = scrubPosition * totalHours;
  const remainingHours = totalHours - elapsedHours;
  
  const departureDate = route.schedule?.departure || new Date();
  const currentTime = new Date(departureDate.getTime() + elapsedHours * 60 * 60 * 1000);
  
  return (
    <div style={{ position: 'relative' }}>
      {/* Reset to Now button */}
      {Math.abs(scrubPosition - 0.5) > 0.01 && (
        <div style={{
          position: 'absolute',
          top: '-24px',
          right: '0',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: ship?.color || '#3b82f6',
          cursor: 'pointer',
          zIndex: 10
        }} onClick={resetToNow}>
          RESET TO NOW
        </div>
      )}
      
      {/* Scrubber Track */}
      <div
        ref={scrubberRef}
        style={{
          position: 'relative',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: '999px',
          margin: '16px 0 8px 0'
        }}
      >
        {/* Filled portion */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${scrubPosition * 100}%`,
            backgroundColor: ship?.color || '#3b82f6',
            borderRadius: '999px'
          }}
        />
        
        {/* Waypoint ticks */}
        {waypoints.map((waypoint, index) => {
          const position = index / (waypoints.length - 1);
          const isNear = Math.abs(scrubPosition - position) < 0.02;
          
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${position * 100}%`,
                top: '-2px',
                width: '2px',
                height: '8px',
                backgroundColor: isNear ? (ship?.color || '#3b82f6') : 'rgba(255,255,255,0.25)',
                borderRadius: '1px',
                cursor: 'pointer',
                transform: 'translateX(-50%)'
              }}
              onMouseEnter={() => setHoveredWaypoint(waypoint)}
              onMouseLeave={() => setHoveredWaypoint(null)}
              onClick={() => {
                setScrubPosition(position);
                updatePosition(position);
              }}
            />
          );
        })}
        
        {/* NOW marker */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '-8px',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: ship?.color || '#3b82f6'
          }} />
          <div style={{
            fontSize: '9px',
            fontFamily: 'JetBrains Mono, monospace',
            color: ship?.color || '#3b82f6',
            marginTop: '2px'
          }}>
            NOW
          </div>
        </div>
        
        {/* Scrubber thumb */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={scrubPosition}
          onChange={handleScrubberChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'grab',
            zIndex: 5
          }}
        />
        
        {/* Thumb visual */}
        <div
          style={{
            position: 'absolute',
            left: `${scrubPosition * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: isDragging ? '22px' : '16px',
            height: isDragging ? '22px' : '16px',
            backgroundColor: '#ffffff',
            border: `2px solid ${ship?.color || '#3b82f6'}`,
            borderRadius: '50%',
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'all 150ms ease',
            zIndex: 10
          }}
        />
      </div>
      
      {/* Port labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#64748b',
        marginBottom: '4px'
      }}>
        <div>{route.origin.name}</div>
        <div>{route.destination.name}</div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#64748b'
      }}>
        <div>{formatDateTime(departureDate)}</div>
        <div>{formatDateTime(route.schedule?.eta || new Date())}</div>
      </div>
      
      {/* Waypoint tooltip */}
      {hoveredWaypoint && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: `${(waypoints.indexOf(hoveredWaypoint) / (waypoints.length - 1)) * 100}%`,
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(10,15,30,0.9)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#f1f5f9',
          marginBottom: '8px',
          zIndex: 20
        }}>
          {hoveredWaypoint.name}
        </div>
      )}
      
      {/* Floating voyage card */}
      {showFloatingCard && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: `${scrubPosition * 100}%`,
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(10,15,30,0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          minWidth: '200px',
          pointerEvents: 'none',
          zIndex: 15,
          opacity: showFloatingCard ? 1 : 0,
          transition: 'opacity 300ms ease'
        }}>
          <div style={{
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#f1f5f9',
            marginBottom: '4px',
            fontWeight: '500'
          }}>
            {position.currentLegName}
          </div>
          
          <div style={{
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#94a3b8',
            marginBottom: '8px'
          }}>
            {formatDateTime(currentTime)}
          </div>
          
          <div style={{
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            margin: '8px 0'
          }} />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#ffffff',
            marginBottom: '4px'
          }}>
            <span>DISTANCE FROM ORIGIN</span>
            <span style={{ textAlign: 'right' }}>
              {Math.round(distanceFromOrigin).toLocaleString()} km
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#ffffff',
            marginBottom: '8px'
          }}>
            <span>REMAINING</span>
            <span style={{ textAlign: 'right' }}>
              {Math.round(remainingDistance).toLocaleString()} km
            </span>
          </div>
          
          <div style={{
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            margin: '8px 0'
          }} />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            <span>ELAPSED</span>
            <span style={{ textAlign: 'right' }}>
              {formatDuration(elapsedHours)}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#94a3b8'
          }}>
            <span>REMAINING</span>
            <span style={{ textAlign: 'right' }}>
              {formatDuration(remainingHours)}
            </span>
          </div>
        </div>
      )}
      
      {/* Current fact display */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '13px',
        color: '#f1f5f9',
        lineHeight: '1.4',
        fontStyle: 'italic',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        transition: 'opacity 300ms ease'
      }}>
        {currentFact || 'Loading educational fact...'}
      </div>
    </div>
  );
}
