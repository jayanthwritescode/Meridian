import { useState, useEffect, useMemo } from 'react';
import { useComputedPosition } from './useComputedPosition';
import { useAISStream } from './useAISStream';
import { SHIPS } from '../data/ships';

// Featured vessels mapping
const FEATURED_VESSELS = {
  'MSCGULSUN': { mmsi: '477307900', color: '#3b82f6' },
  'EVERAPEX': { mmsi: '352003000', color: '#f59e0b' },
  'COSCOFORTUNE': { mmsi: '477425500', color: '#a855f7' }
};

export function useVesselPosition() {
  const { positions: computedPositions, getPositionAt } = useComputedPosition();
  const { liveVessels, featuredSignals, connectionStatus, liveCount } = useAISStream();
  
  const [justAcquired, setJustAcquired] = useState(new Set());

  // Debug logging
  console.log('useVesselPosition debug:', {
    computedPositions,
    liveVessels: Array.from(liveVessels.values()),
    featuredSignals: Array.from(featuredSignals.values()),
    connectionStatus,
    liveCount
  });

  // Track signal transitions to emit justAcquired flag
  useEffect(() => {
    const newJustAcquired = new Set();
    const now = Date.now();

    for (const [shipId, vessel] of Object.entries(FEATURED_VESSELS)) {
      const signal = featuredSignals.get(vessel.mmsi);
      const wasLive = signal && (now - signal.receivedAt) < 120000; // 2 minutes
      
      // Check if we just acquired a live signal (transition from computed to live)
      if (wasLive) {
        // This is a simplified check - in production we'd track previous state
        newJustAcquired.add(shipId);
      }
    }

    // Only emit justAcquired for one render cycle
    if (newJustAcquired.size > 0) {
      setJustAcquired(newJustAcquired);
      const timeout = setTimeout(() => setJustAcquired(new Set()), 100);
      return () => clearTimeout(timeout);
    }
  }, [featuredSignals]);

  // Resolve positions for featured vessels
  const featuredVessels = useMemo(() => {
    const result = {};
    const now = Date.now();

    for (const [shipId, vessel] of Object.entries(FEATURED_VESSELS)) {
      const computed = computedPositions[shipId];
      const signal = featuredSignals.get(vessel.mmsi);
      
      let position = null;
      let source = 'computed';
      let signalAge = null;
      let justAcquiredFlag = false;

      // Default to computed position
      if (computed) {
        position = {
          lat: computed.lat,
          lon: computed.lon,
          speed: null, // Computed doesn't have real speed
          heading: null, // Computed doesn't have heading
          progress: computed.progress,
          distanceTraveledKm: computed.distanceTraveledKm,
          distanceRemainingKm: computed.distanceRemainingKm,
          estimatedArrival: computed.estimatedArrival
        };
      }

      // Use AIS signal if available and recent (within 120 seconds)
      if (signal) {
        const age = now - signal.receivedAt;
        if (age < 120000) { // 2 minutes
          position = {
            lat: signal.lat,
            lon: signal.lon,
            speed: signal.speed,
            heading: signal.heading,
            progress: computed?.progress || 0, // Keep computed progress
            distanceTraveledKm: computed?.distanceTraveledKm || 0,
            distanceRemainingKm: computed?.distanceRemainingKm || 0,
            estimatedArrival: computed?.estimatedArrival || null
          };
          source = 'live';
          signalAge = age;
          justAcquiredFlag = justAcquired.has(shipId);
        }
      }

      // Get ship data from SHIPS
      const shipData = SHIPS.find(ship => ship.id === shipId);

      result[shipId] = {
        ...shipData,
        ...position,
        mmsi: vessel.mmsi,
        color: vessel.color,
        source,
        signalAge,
        justAcquired: justAcquiredFlag,
        hasSignalToday: signal !== null
      };
    }

    return result;
  }, [computedPositions, featuredSignals, justAcquired]);

  return {
    // Featured vessels with resolved positions
    featuredVessels,
    
    // Non-featured vessels (pass through from AIS)
    liveVessels,
    
    // System status
    connectionStatus,
    liveCount,
    
    // Utilities
    getPositionAt
  };
}
