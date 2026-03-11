import { useState } from 'react';
import { Header } from './components/Header';
import { GlobeView } from './components/GlobeView';
import { TestGlobe } from './components/TestGlobe';

function App() {
  const [useTestGlobe, setUseTestGlobe] = useState(true);

  return (
    <div className="w-full h-full bg-navy relative overflow-hidden">
      {/* Header */}
      <Header connectionStatus="live" />

      {/* Test toggle */}
      <div className="absolute top-20 right-4 z-50">
        <button
          onClick={() => setUseTestGlobe(!useTestGlobe)}
          className="bg-navy/90 border border-white/20 rounded px-3 py-2 font-mono text-xs text-white hover:bg-navy"
        >
          {useTestGlobe ? 'Use Full App' : 'Use Test Globe'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-full pt-32">
        {useTestGlobe ? (
          <div className="flex-1">
            <TestGlobe />
          </div>
        ) : (
          <div className="flex-1">
            <GlobeView />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
