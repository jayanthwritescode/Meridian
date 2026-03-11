import { useState, useEffect, useRef } from 'react';

export function useAISStream(watchlistMMSIs = []) {
  const [positions, setPositions] = useState(new Map());
  const [vessels, setVessels] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState('offline');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const lastMessageRef = useRef(null);

  const boundingBoxes = [
    // English Channel / North Sea
    [[48, -5], [58, 10]],
    // Strait of Malacca
    [[-2, 99], [8, 105]],
    // Suez Canal approaches
    [[27, 31], [35, 37]],
    // South China Sea
    [[0, 108], [25, 122]],
    // US East Coast ports
    [[25, -82], [45, -65]],
    // Santos / South Atlantic
    [[-28, -50], [-18, -38]]
  ];

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        console.log('AIS WebSocket connected');
        
        // Subscribe to bounding boxes
        const subscribeMessage = {
          APIKey: import.meta.env.VITE_AISSTREAM_KEY || 'demo', // Use demo key for testing
          FilterMessageTypes: ["PositionReport"],
          BoundingBoxes: boundingBoxes
        };

        // Add watchlist MMSIs if any
        if (watchlistMMSIs.length > 0) {
          subscribeMessage.FiltersShipMMSI = watchlistMMSIs;
        }

        ws.send(JSON.stringify(subscribeMessage));
        console.log('Subscribed to AIS stream with bounding boxes:', boundingBoxes);
      };

      ws.onmessage = (event) => {
        lastMessageRef.current = Date.now();
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.MessageType === 'PositionReport') {
            const { MMSI, Latitude, Longitude, Speed, Heading, Course, ShipName, ShipType, IMO, Destination } = data;
            
            if (Latitude && Longitude) {
              // Update positions map (for backward compatibility)
              setPositions(prev => {
                const newMap = new Map(prev);
                newMap.set(MMSI, {
                  lat: Latitude,
                  lon: Longitude,
                  speed: Speed,
                  heading: Heading,
                  course: Course,
                  timestamp: Date.now()
                });
                return newMap;
              });

              // Update vessels map with full AIS data
              setVessels(prev => {
                const newMap = new Map(prev);
                const existingVessel = newMap.get(MMSI);
                
                const vesselData = {
                  mmsi: MMSI,
                  name: ShipName || `MMSI: ${MMSI}`,
                  lat: Latitude,
                  lon: Longitude,
                  speed: Speed || 0,
                  heading: Heading || 0,
                  course: Course || 0,
                  shipType: ShipType,
                  shipName: ShipName,
                  imo: IMO,
                  destination: Destination,
                  timestamp: Date.now(),
                  firstSeen: existingVessel?.firstSeen || Date.now()
                };
                
                newMap.set(MMSI, vesselData);
                
                // Cap at 200 vessels - remove oldest if exceeded
                if (newMap.size > 200) {
                  let oldestMMSI = null;
                  let oldestTimestamp = Infinity;
                  
                  for (const [mmsi, vessel] of newMap) {
                    if (vessel.timestamp < oldestTimestamp) {
                      oldestTimestamp = vessel.timestamp;
                      oldestMMSI = mmsi;
                    }
                  }
                  
                  if (oldestMMSI) {
                    newMap.delete(oldestMMSI);
                    console.log(`Removed oldest vessel ${oldestMMSI} to maintain 200 vessel cap`);
                  }
                }
                
                return newMap;
              });
            }
          }
        } catch (error) {
          console.error('Error parsing AIS message:', error);
        }
      };

      ws.onclose = (event) => {
        setConnectionStatus('reconnecting');
        console.log('AIS WebSocket disconnected, attempting reconnect...');
        
        // Attempt reconnection after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        setConnectionStatus('error');
        console.error('AIS WebSocket error:', error);
      };

    } catch (error) {
      setConnectionStatus('error');
      console.error('Failed to create AIS WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionStatus('offline');
  };

  // Check for stale data
  useEffect(() => {
    const checkStale = setInterval(() => {
      if (connectionStatus === 'connected' && lastMessageRef.current) {
        const timeSinceLastMessage = Date.now() - lastMessageRef.current;
        if (timeSinceLastMessage > 30000) { // 30 seconds
          setConnectionStatus('stale');
        }
      }
    }, 10000);

    return () => clearInterval(checkStale);
  }, [connectionStatus]);

  // Initial connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []); // Remove watchlistMMSIs dependency to avoid reconnections

  // Reconnect when watchlist changes
  useEffect(() => {
    if (connectionStatus === 'connected' && wsRef.current?.readyState === WebSocket.OPEN) {
      // Send updated subscription with new watchlist
      const subscribeMessage = {
        APIKey: import.meta.env.VITE_AISSTREAM_KEY || 'demo',
        FilterMessageTypes: ["PositionReport"],
        BoundingBoxes: boundingBoxes
      };

      if (watchlistMMSIs.length > 0) {
        subscribeMessage.FiltersShipMMSI = watchlistMMSIs;
      }

      wsRef.current.send(JSON.stringify(subscribeMessage));
      console.log('Updated AIS subscription with watchlist:', watchlistMMSIs);
    }
  }, [watchlistMMSIs, connectionStatus]);

  return {
    positions,
    vessels,
    connectionStatus,
    connect,
    disconnect
  };
}
