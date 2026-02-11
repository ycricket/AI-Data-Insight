import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { GeoPoint } from '../../../types';

// Fix Leaflet's default icon path issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ActiveIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface DataMapProps {
  data: GeoPoint[];
  hoveredRowId: string | number | null;
  onMarkerClick: (id: string | number) => void;
}

const DataMap: React.FC<DataMapProps> = ({ data, hoveredRowId, onMarkerClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([39.9042, 116.4074], 11);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  // Update Markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
    markersRef.current = {};

    if (data.length === 0) return;

    const bounds = L.latLngBounds([]);

    data.forEach(point => {
      if (point.lat && point.lng) {
        const marker = L.marker([point.lat, point.lng], {
            icon: DefaultIcon
        })
          .addTo(map)
          .bindPopup(`
            <div class="font-sans text-sm">
              <strong class="block mb-1">ID: ${point.id}</strong>
              <pre class="text-xs bg-gray-100 p-1 rounded overflow-auto max-w-[200px]">
                ${JSON.stringify(point.properties, null, 2)}
              </pre>
            </div>
          `);

        marker.on('click', () => {
          onMarkerClick(point.id);
        });

        markersRef.current[point.id] = marker;
        bounds.extend([point.lat, point.lng]);
      }
    });

    if (data.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [data, onMarkerClick]);

  // Handle Hover Effects
  useEffect(() => {
    if (!hoveredRowId) {
      // Reset all icons to default
      Object.values(markersRef.current).forEach((m: L.Marker) => m.setIcon(DefaultIcon));
      return;
    }

    const marker = markersRef.current[hoveredRowId];
    if (marker) {
      // Reset others
      Object.values(markersRef.current).forEach((m: L.Marker) => m.setIcon(DefaultIcon));
      // Highlight target
      marker.setIcon(ActiveIcon);
      marker.openPopup();
    }
  }, [hoveredRowId]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow z-[1000] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 block"></span>
          <span>数据点</span>
        </div>
      </div>
    </div>
  );
};

export default DataMap;