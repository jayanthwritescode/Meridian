import { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';

export function TestGlobe() {
  const globeEl = useRef();

  useEffect(() => {
    console.log('TestGlobe mounted');
    if (globeEl.current) {
      console.log('Globe ref is available');
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="#0a0f1e"
      />
    </div>
  );
}
