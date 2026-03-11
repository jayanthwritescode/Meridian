import { useState, useEffect } from 'react';
import { X, MapPin, Package, Cloud, Navigation } from 'lucide-react';
import { formatCoordinates, formatSpeed, formatHeading } from '../utils/geo';

export function DetailPanel({ vessel, onClose }) {
  const [currentFact, setCurrentFact] = useState(0);
  const [liveData, setLiveData] = useState({
    speed: vessel.speed || null,
    heading: vessel.heading || null,
    lastAIS: vessel.lastUpdate ? new Date(vessel.lastUpdate) : null
  });

  // Rotate through facts
  useEffect(() => {
    if (!vessel?.facts) return;
    
    const interval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % vessel.facts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [vessel?.facts]);

  // Update live data
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        lastAIS: prev.lastAIS ? new Date() : null
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!vessel) return null;

  const getTimeSinceLastAIS = () => {
    if (!liveData.lastAIS) return 'No signal';
    const seconds = Math.floor((new Date() - liveData.lastAIS) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="fixed bottom-0 left-80 right-0 bg-navy/95 backdrop-blur-sm border-t border-white/10 transform transition-transform duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: vessel.color }}
            />
            <div>
              <h2 className="font-syne font-bold text-xl text-white">{vessel.name}</h2>
              <div className="font-mono text-sm text-gray-400">
                MMSI: {vessel.mmsi} • {vessel.carrier}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Vessel Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-syne font-semibold text-sm text-white mb-2">Vessel Details</h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Container ID</span>
                  <span className="text-gray-300">{vessel.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cargo</span>
                  <span className="text-gray-300">{vessel.cargo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacity</span>
                  <span className="text-gray-300">{vessel.teu.toLocaleString()} TEU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CO₂ Emissions</span>
                  <span className="text-gray-300">{vessel.co2.toLocaleString()} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Distance</span>
                  <span className="text-gray-300">{vessel.distance.toLocaleString()} km</span>
                </div>
              </div>
            </div>

            {/* Educational Facts */}
            <div>
              <h3 className="font-syne font-semibold text-sm text-white mb-2">Did You Know?</h3>
              <div className="bg-slate-dark/40 border border-white/10 rounded-lg p-3">
                <p className="font-mono text-xs text-gray-300 leading-relaxed">
                  {vessel.facts[currentFact]}
                </p>
              </div>
            </div>
          </div>

          {/* Center Column - Live Data Strip */}
          <div className="space-y-4">
            <div>
              <h3 className="font-syne font-semibold text-sm text-white mb-2">Live Telemetry</h3>
              <div className="bg-slate-dark/40 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-3 h-3 text-route-blue" />
                    <span className="text-gray-500">Speed</span>
                    <span className="text-gray-300 ml-auto">
                      {formatSpeed(liveData.speed)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-3 h-3 text-route-amber" />
                    <span className="text-gray-500">Heading</span>
                    <span className="text-gray-300 ml-auto">
                      {formatHeading(liveData.heading)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-route-purple" />
                    <span className="text-gray-500">Position</span>
                    <span className="text-gray-300 ml-auto">
                      {formatCoordinates(vessel.lat, vessel.lon)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-3 h-3 text-success-green" />
                    <span className="text-gray-500">Last AIS</span>
                    <span className={`ml-auto ${
                      vessel.live ? 'text-success-green' : 'text-warning-amber'
                    }`}>
                      {getTimeSinceLastAIS()}
                    </span>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      vessel.live ? 'bg-success-green animate-pulse' : 'bg-warning-amber'
                    }`} />
                    <span className="font-mono text-xs text-gray-300">
                      {vessel.live ? '● LIVE TRACKING' : '○ SIMULATED POSITION'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="font-syne font-semibold text-sm text-white mb-2">Schedule</h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Departed</span>
                  <span className="text-gray-300">{new Date(vessel.depart).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ETA</span>
                  <span className="text-gray-300">{new Date(vessel.eta).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-gray-300">{Math.round(vessel.progress * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Route Timeline */}
          <div className="space-y-4">
            <div>
              <h3 className="font-syne font-semibold text-sm text-white mb-2">Route Timeline</h3>
              <div className="space-y-2">
                {/* Origin */}
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-route-blue" />
                  <div className="flex-1">
                    <div className="font-mono text-xs text-white">{vessel.route.origin.name}</div>
                    <div className="font-mono text-xs text-gray-500">
                      {formatCoordinates(vessel.route.origin.lat, vessel.route.origin.lon)}
                    </div>
                  </div>
                </div>

                {/* Waypoints */}
                {vessel.route.waypoints.map((waypoint, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                    <div className="flex-1">
                      <div className="font-mono text-xs text-gray-300">{waypoint.name}</div>
                      <div className="font-mono text-xs text-gray-600">
                        {formatCoordinates(waypoint.lat, waypoint.lon)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Destination */}
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: vessel.color }}
                  />
                  <div className="flex-1">
                    <div className="font-mono text-xs text-white">{vessel.route.destination.name}</div>
                    <div className="font-mono text-xs text-gray-500">
                      {formatCoordinates(vessel.route.destination.lat, vessel.route.destination.lon)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delay Warning */}
            {vessel.status === 'delayed' && vessel.delay && (
              <div className="bg-warning-amber/20 border border-warning-amber/40 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-warning-amber" />
                  <div>
                    <div className="font-mono text-xs text-warning-amber font-semibold">Route Delay</div>
                    <div className="font-mono text-xs text-warning-amber">{vessel.delay}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
