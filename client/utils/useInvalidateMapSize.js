import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function useInvalidateMapSize(trigger) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [trigger, map]);

  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
}