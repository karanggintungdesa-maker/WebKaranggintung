'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import untuk menghindari SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
) as any;
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
) as any;
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
) as any;
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
) as any;

export function VillageMap() {
  const [isClient, setIsClient] = useState(false);
  const [leafletInstance, setLeafletInstance] = useState<any>(null);

  // Koordinat Desa Karanggintung, Gandrungmangu, Cilacap
  const center: [number, number] = [-7.4584795, 108.8565081];
  const zoom = 15;

  useEffect(() => {
    setIsClient(true);
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    // Load Leaflet JS dan L untuk Marker icons
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      import('leaflet').then(L => {
        // Setup default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        setLeafletInstance(L);
      });
    };
    document.head.appendChild(script);

    return () => {
      link.remove();
      script.remove();
    };
  }, []);

  if (!isClient || !leafletInstance) {
    return <Skeleton className="w-full h-full rounded-3xl" />;
  }

  return (
    <div className="w-full h-full rounded-[3rem] overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <Marker position={center}>
          <Popup>
            <div className="text-center p-1 space-y-1">
              <p className="font-black text-slate-900 text-sm">Kantor Desa Karanggintung</p>
              <p className="text-slate-600 text-xs">Kec. Gandrungmangu, Kab. Cilacap</p>
              <div className="bg-slate-100 rounded-lg p-1.5 text-[11px] font-mono text-slate-700 font-semibold my-1">
                -7.4584795, 108.8565081
              </div>
              <a
                href="https://www.google.com/maps?q=-7.4584795,108.8565081"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[11px] font-bold text-primary hover:underline mt-1"
              >
                Buka di Google Maps ↗
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
