import { useState, useEffect } from 'react';
import { Anchor, Activity } from 'lucide-react';

export function Header({ connectionStatus }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setUtcTime(new Date().toUTCString().split(' ')[4]);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'live': return 'bg-success-green';
      case 'connecting': return 'bg-warning-amber animate-pulse';
      case 'reconnecting': return 'bg-warning-amber animate-pulse';
      case 'stale': return 'bg-warning-amber';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'live': return '● LIVE';
      case 'connecting': return '● CONNECTING';
      case 'reconnecting': return '● RECONNECTING';
      case 'stale': return '○ STALE DATA';
      default: return '● OFFLINE';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-white/10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <Anchor className="w-6 h-6 text-route-blue" />
            <div>
              <h1 className="font-syne font-bold text-xl text-white">TRACKR</h1>
              <p className="font-mono text-xs text-gray-400">Global Container Intelligence</p>
            </div>
          </div>

          {/* Status and time */}
          <div className="flex items-center space-x-8">
            {/* AIS Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${connectionStatus === 'live' ? 'animate-pulse' : ''}`} />
              <span className="font-mono text-xs text-gray-300">{getStatusText()}</span>
            </div>

            {/* UTC Clock */}
            <div className="font-mono text-xs text-gray-300">
              UTC {utcTime}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-center space-x-6 font-mono text-xs text-gray-400">
            <span>50,000+ vessels at sea</span>
            <span>•</span>
            <span>11B tonnes/year</span>
            <span>•</span>
            <span>90% of world trade by ship</span>
          </div>
        </div>
      </div>

      {/* Fact ticker */}
      <div className="bg-slate-dark/50 border-t border-white/5 overflow-hidden">
        <div className="flex animate-scroll">
          <div className="flex space-x-8 px-4 py-2 font-mono text-xs text-gray-400 whitespace-nowrap">
            <span>90% of everything you own has traveled by ship</span>
            <span>•</span>
            <span>50,000 merchant ships at sea right now</span>
            <span>•</span>
            <span>Sea freight emits 50× less CO₂ than air</span>
            <span>•</span>
            <span>One supertanker takes 5km to stop</span>
            <span>•</span>
            <span>The global fleet would circle Earth 3 times</span>
            <span>•</span>
            <span>11 billion tonnes shipped every year</span>
            <span>•</span>
            <span>90% of everything you own has traveled by ship</span>
            <span>•</span>
            <span>50,000 merchant ships at sea right now</span>
            <span>•</span>
            <span>Sea freight emits 50× less CO₂ than air</span>
            <span>•</span>
            <span>One supertanker takes 5km to stop</span>
            <span>•</span>
            <span>The global fleet would circle Earth 3 times</span>
            <span>•</span>
            <span>11 billion tonnes shipped every year</span>
          </div>
        </div>
      </div>
    </header>
  );
}
