import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Thermometer, Zap, ShieldCheck, Navigation, Filter } from 'lucide-react';

// Custom Map Marker Icons using SVG Data URIs (UTF-8 safe)
const createCustomIcon = (color, label) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="42" viewBox="0 0 36 42">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="${color}" flood-opacity="0.6"/>
      </filter>
      <path d="M18 0 C8 0 0 8 0 18 C0 30 18 42 18 42 C18 42 36 30 36 18 C36 8 28 0 18 0 Z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="18" cy="16" r="10" fill="#0f172a"/>
      <text x="18" y="20" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${label}</text>
    </svg>
  `;
  return L.icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38]
  });
};

const agriIcon = createCustomIcon('#10b981', '❄️');
const microIcon = createCustomIcon('#f59e0b', '⚡');
const expressIcon = createCustomIcon('#a855f7', '📦');
const bulkIcon = createCustomIcon('#06b6d4', '🚛');

export default function UnifiedMap({ shipments, corridors, onSelectShipment }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Center of India (Nagpur/Bhopal region)
  const indiaCenter = [21.5, 78.5];
  const defaultZoom = 5;

  const filteredShipments = shipments.filter(s => {
    if (activeFilter === 'TIER1') return s.tier.includes('Tier 1');
    if (activeFilter === 'MICRO') return s.tier.includes('Tier 4');
    if (activeFilter === 'EXPRESS') return s.tier.includes('Tier 2');
    return true;
  });

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
      
      {/* Map Header & Corridor Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Navigation size={22} color="#10b981" />
            Pan-India Unified Freight & Micro-Transit Corridor Map
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Real-time IoT Reefer tracking on National Highways & Urban Last-Mile Micro-Vehicle nodes
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Filter size={15} color="#94a3b8" style={{ marginLeft: '6px' }} />
          <button 
            onClick={() => setActiveFilter('ALL')}
            style={{
              background: activeFilter === 'ALL' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: activeFilter === 'ALL' ? '#ffffff' : '#94a3b8',
              border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            All Corridors ({shipments.length})
          </button>
          
          <button 
            onClick={() => setActiveFilter('TIER1')}
            style={{
              background: activeFilter === 'TIER1' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: activeFilter === 'TIER1' ? '#34d399' : '#94a3b8',
              border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Tier 1 AgriFresh ❄️
          </button>

          <button 
            onClick={() => setActiveFilter('MICRO')}
            style={{
              background: activeFilter === 'MICRO' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
              color: activeFilter === 'MICRO' ? '#fbbf24' : '#94a3b8',
              border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Tier 4 Micro-Transit ⚡
          </button>
        </div>
      </div>

      {/* Map Container Container */}
      <div style={{ width: '100%', height: '520px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        
        <MapContainer center={indiaCenter} zoom={defaultZoom} style={{ width: '100%', height: '100%' }}>
          
          {/* CartoDB Dark Matter Tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> | BharatLogistics & AgriFresh IoT'
            maxZoom={18}
          />

          {/* Render National Logistics Corridors (Polylines) */}
          {corridors && corridors.map(corridor => {
            const positions = corridor.waypoints.map(w => [w.lat, w.lng]);
            const isAgriExpress = corridor.expressType.includes('Agri') || corridor.expressType.includes('Perishable');
            return (
              <Polyline 
                key={corridor.id}
                positions={positions}
                pathOptions={{
                  color: isAgriExpress ? '#10b981' : '#06b6d4',
                  weight: isAgriExpress ? 4 : 3,
                  dashArray: isAgriExpress ? '8, 6' : '1, 0',
                  opacity: 0.85
                }}
              >
                <Tooltip sticky>
                  <div style={{ padding: '4px' }}>
                    <strong style={{ color: isAgriExpress ? '#34d399' : '#22d3ee' }}>{corridor.name}</strong>
                    <br/>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{corridor.highway} • {corridor.distanceKm} km</span>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}

          {/* Render Active Shipments & Micro-Transit Vehicle Pins */}
          {filteredShipments.map(shipment => {
            if (!shipment.currentCoords || !shipment.currentCoords.lat) return null;

            let icon = agriIcon;
            if (shipment.tier.includes('Tier 4')) icon = microIcon;
            else if (shipment.tier.includes('Tier 2')) icon = expressIcon;
            else if (shipment.tier.includes('Tier 3')) icon = bulkIcon;

            return (
              <Marker
                key={shipment.id}
                position={[shipment.currentCoords.lat, shipment.currentCoords.lng]}
                icon={icon}
              >
                <Popup>
                  <div style={{ minWidth: '240px', padding: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className={`badge ${shipment.tier.includes('Tier 1') ? 'badge-agri' : shipment.tier.includes('Tier 4') ? 'badge-micro' : 'badge-iot'}`} style={{ fontSize: '0.65rem' }}>
                        {shipment.id}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                        {shipment.progressPercent}% Complete
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                      {shipment.commodity}
                    </h4>

                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '4px 0' }}>
                      <strong>Route:</strong> {shipment.origin.split(',')[0]} → {shipment.destination.split(',')[0]}
                    </p>

                    {shipment.telemetry && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '8px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: '#94a3b8' }}>IoT Reefer Temp:</span>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>{shipment.telemetry.currentTempC}°C (Target: {shipment.telemetry.targetTempC}°C)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Freshness Index:</span>
                          <span style={{ color: '#22d3ee', fontWeight: 700 }}>{shipment.telemetry.freshnessIndexPercent}%</span>
                        </div>
                      </div>
                    )}

                    {shipment.otpVerificationCode && (
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '6px', marginTop: '6px', fontSize: '0.75rem', color: '#fbbf24', textAlign: 'center' }}>
                        🔑 Delivery OTP Code: <strong>{shipment.otpVerificationCode}</strong>
                      </div>
                    )}

                    <button 
                      className="btn-primary"
                      onClick={() => onSelectShipment(shipment)}
                      style={{ width: '100%', marginTop: '10px', padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      Inspect Full IoT Telemetry
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>

        {/* Floating Map Legend */}
        <div style={{
          position: 'absolute',
          bottom: '16px', right: '16px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: '0.75rem',
          color: '#cbd5e1'
        }}>
          <div style={{ fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Network Legend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
            <span>Tier 1 AgriFresh IoT Perishables</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
            <span>Tier 4 Rapido/Uber Micro-Transit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <span style={{ width: '12px', height: '3px', background: '#10b981' }}></span>
            <span>Green Express Highway Corridor</span>
          </div>
        </div>

      </div>
    </div>
  );
}
