import { useState, useEffect, useRef } from 'react';

export function useAISStream(mmsiList) {
  const [positions, setPositions] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  const connect = () => {
    try {
      setConnectionStatus('connecting');
      // Temporarily disable AIS connection to show ship properly
      console.log('AIS connection temporarily disabled for testing');
      setConnectionStatus('disconnected');
      return;

      socketRef.current.onopen = () => {
        console.log('AIS WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;

        const message = {
          Apikey: import.meta.env.VITE_AISSTREAM_KEY || 'demo',
          BoundingBoxes: [[[-90, -180], [90, 180]]],
          FiltersShipMMSI: mmsiList,
          FilterMessageTypes: ['PositionReport']
        };

        socketRef.current.send(JSON.stringify(message));
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.MessageType === 'PositionReport') {
            const { MetaData, PositionReport } = data;
            const mmsi = MetaData.MMSI;
            
            if (mmsiList.includes(mmsi.toString())) {
              const newPosition = {
                lat: PositionReport.Latitude,
                lon: PositionReport.Longitude,
                speed: PositionReport.Sog,
                heading: PositionReport.Cog,
                timestamp: new Date().toISOString()
              };

              setPositions(prev => new Map(prev.set(mmsi, newPosition)));
              setLastUpdate(new Date());
            }
          }
        } catch (error) {
          console.error('Error parsing AIS message:', error);
        }
      };

      socketRef.current.onclose = () => {
        console.log('AIS WebSocket disconnected');
        setConnectionStatus('reconnecting');
        scheduleReconnect();
      };

      socketRef.current.onerror = (error) => {
        console.error('AIS WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to create AIS WebSocket:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delays = [5000, 10000, 20000, 30000];
    const delay = delays[Math.min(reconnectAttempts.current, delays.length - 1)];
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      connect();
    }, delay);
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [mmsiList]);

  // Check for stale data
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdate) {
        const now = new Date();
        const secondsSinceUpdate = (now - lastUpdate) / 1000;
        
        if (secondsSinceUpdate > 30) {
          setConnectionStatus('stale');
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return { positions, connectionStatus, lastUpdate };
}
