import { useState, useEffect, useRef } from 'react';

// Featured MMSIs for separate signal tracking
const FEATURED_MMSIS = ['477307900', '352003000', '477425500'];

// Bounding boxes for major shipping corridors
const BOUNDING_BOXES = [
  // English Channel / North Sea
  [[48, -5], [58, 10]],
  // Strait of Malacca
  [[-2, 99], [8, 105]],
  // Suez Canal
  [[27, 31], [35, 37]],
  // South China Sea
  [[0, 108], [25, 122]],
  // US East / Gulf Coast
  [[25, -82], [45, -65]],
  // South Atlantic / Santos
  [[-28, -50], [-18, -38]],
  // Taiwan Strait
  [[22, 119], [27, 123]]
];

export function useAISStream() {
  const [liveVessels, setLiveVessels] = useState(new Map());
  const [featuredSignals, setFeaturedSignals] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [liveCount, setLiveCount] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const lastMessageRef = useRef(null);

  // Calculate backoff delay
  const getBackoffDelay = (attempts) => {
    const delays = [5000, 10000, 20000]; // 5s, 10s, 20s
    return attempts < delays.length ? delays[attempts] : 30000; // Cap at 30s
  };

  // Connect to AIS stream
  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('live');
        reconnectAttemptsRef.current = 0;
        console.log('AIS WebSocket connected');
        
        // Subscribe with bounding boxes
        const subscribeMessage = {
          APIKey: import.meta.env.VITE_AISSTREAM_KEY,
          FilterMessageTypes: ["PositionReport"],
          BoundingBoxes: BOUNDING_BOXES
        };

        ws.send(JSON.stringify(subscribeMessage));
        console.log('Subscribed to AIS stream with bounding boxes');
      };

      ws.onmessage = (event) => {
        lastMessageRef.current = Date.now();
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.MessageType === 'PositionReport') {
            const { MMSI, Latitude, Longitude, Speed, Heading, Course, ShipName, ShipType } = data;
            
            if (Latitude && Longitude) {
              const timestamp = Date.now();
              
              // Update live vessels map (capped at 200)
              setLiveVessels(prev => {
                const newMap = new Map(prev);
                newMap.set(MMSI, {
                  mmsi: MMSI,
                  name: ShipName || `MMSI: ${MMSI}`,
                  lat: Latitude,
                  lon: Longitude,
                  speed: Speed || 0,
                  heading: Heading || 0,
                  course: Course || 0,
                  shipType: ShipType,
                  shipName: ShipName,
                  timestamp
                });
                
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
                  }
                }
                
                return newMap;
              });

              // Track featured vessels separately
              if (FEATURED_MMSIS.includes(MMSI)) {
                setFeaturedSignals(prev => {
                  const newMap = new Map(prev);
                  newMap.set(MMSI, {
                    mmsi: MMSI,
                    name: ShipName,
                    lat: Latitude,
                    lon: Longitude,
                    speed: Speed,
                    heading: Heading,
                    course: Course,
                    shipType: ShipType,
                    receivedAt: timestamp
                  });
                  return newMap;
                });
              }
            }
          }
        } catch (error) {
          console.error('Error parsing AIS message:', error);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('reconnecting');
        console.log('AIS WebSocket disconnected, attempting reconnect...');
        
        // Exponential backoff reconnection
        const delay = getBackoffDelay(reconnectAttemptsRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        setConnectionStatus('reconnecting');
        console.error('AIS WebSocket error:', error);
      };

    } catch (error) {
      setConnectionStatus('reconnecting');
      console.error('Failed to create AIS WebSocket connection:', error);
    }
  };

  // Start connection if API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_AISSTREAM_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.log('AIS API key not found - AIS layer disabled');
      setConnectionStatus('disabled');
      return;
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update live count
  useEffect(() => {
    setLiveCount(liveVessels.size);
  }, [liveVessels]);

  return {
    liveVessels,
    featuredSignals,
    connectionStatus,
    liveCount
  };
}
