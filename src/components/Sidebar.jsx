import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function Sidebar({ vessels, selectedVessel, onVesselSelect, onVesselFocus }) {
  const [expandedCards, setExpandedCards] = useState(new Set(['477307900']));

  const toggleCard = (vesselId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vesselId)) {
        newSet.delete(vesselId);
      } else {
        newSet.add(vesselId);
      }
      return newSet;
    });
  };

  const handleCardClick = (vessel) => {
    onVesselSelect?.(vessel);
    onVesselFocus?.(vessel);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="fixed left-0 top-32 bottom-0 w-80 bg-navy/95 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
      <div className="p-4 space-y-3">
        <h2 className="font-syne font-bold text-lg text-white mb-4">Active Vessels</h2>
        
        {vessels.map(vessel => (
          <div
            key={vessel.id}
            className={`bg-slate-dark/40 border rounded-lg transition-all cursor-pointer ${
              selectedVessel?.id === vessel.id 
                ? 'border-white/30 shadow-lg' 
                : 'border-white/10 hover:border-white/20'
            }`}
            onClick={() => handleCardClick(vessel)}
          >
            {/* Card Header */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vessel.color }}
                  />
                  <h3 className="font-syne font-semibold text-sm text-white">
                    {vessel.route.name}
                  </h3>
                </div>
                <div className="font-mono text-xs text-gray-400 mt-1">
                  {vessel.carrier} • {vessel.name}
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCard(vessel.id);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {expandedCards.has(vessel.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedCards.has(vessel.id) && (
              <div className="px-3 pb-3 border-t border-white/5">
                <div className="pt-3 space-y-2">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        vessel.live ? 'bg-success-green animate-pulse' : 'bg-warning-amber'
                      }`} />
                      <span className="font-mono text-xs text-gray-300">
                        {vessel.live ? '● LIVE' : '○ AIS LOST'}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {vessel.speed ? `${vessel.speed.toFixed(1)} kn` : '— kn'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{Math.round(vessel.progress * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${vessel.progress * 100}%`,
                          backgroundColor: vessel.color,
                          boxShadow: `0 0 8px ${vessel.color}66`
                        }}
                      />
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div>
                      <div className="text-gray-500">Depart</div>
                      <div className="text-gray-300">{formatDate(vessel.depart)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">ETA</div>
                      <div className="text-gray-300">{formatDate(vessel.eta)}</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-gray-500">Distance</span>
                      <span className="text-gray-300">{vessel.distance.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-gray-500">Cargo</span>
                      <span className="text-gray-300">{vessel.teu.toLocaleString()} TEU</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-gray-500">CO₂</span>
                      <span className="text-gray-300">{vessel.co2.toLocaleString()} tonnes</span>
                    </div>
                  </div>

                  {/* Delay Warning */}
                  {vessel.status === 'delayed' && vessel.delay && (
                    <div className="mt-2 p-2 bg-warning-amber/20 border border-warning-amber/40 rounded">
                      <div className="font-mono text-xs text-warning-amber">
                        ⚠ {vessel.delay}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
