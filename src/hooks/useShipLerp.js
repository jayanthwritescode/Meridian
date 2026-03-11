import { useState, useEffect, useRef } from 'react';
import { interpolatePosition } from '../utils/geo';

export function useShipLerp(targetPosition, duration = 5000) {
  const [currentPosition, setCurrentPosition] = useState(targetPosition);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startPositionRef = useRef(targetPosition);

  useEffect(() => {
    if (!targetPosition || !currentPosition) return;

    // If positions are the same, no animation needed
    if (targetPosition.lat === currentPosition.lat && 
        targetPosition.lon === currentPosition.lon) {
      return;
    }

    startPositionRef.current = currentPosition;
    startTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newPosition = interpolatePosition(
        startPositionRef.current,
        targetPosition,
        easeProgress
      );

      setCurrentPosition(newPosition);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition, duration]);

  return currentPosition;
}
