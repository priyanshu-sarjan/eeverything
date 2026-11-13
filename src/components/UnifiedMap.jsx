import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, Filter, Settings, Key, 
  Layers, Compass, CheckCircle2, BatteryCharging
} from 'lucide-react';
import { REAL_APMC_MANDIS } from '../../server/data/realMandiDataset.js';
import { REAL_VEHICLE_FLEET } from '../../server/data/realVehicleDataset.js';

// Custom SVG Map Marker Icons
const createSvgIcon = (color, emoji, size = 38) => {
  const height = Math.round(size * 1.18);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 36 42">
      <defs>
        <filter id="shadow-${emoji}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M18 0 C8 0 0 8 0 18 C0 30 18 42 18 42 C18 42 36 30 36 18 C36 8 28 0 18 0 Z" fill="${color}" filter="url(#shadow-${emoji})"/>
      <circle cx="18" cy="16" r="10" fill="#0b1120"/>
      <text x="18" y="20.5" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${emoji}</text>
    </svg>
  `;
  return L.icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 4]
  });
};

const agriIcon = createSvgIcon('#10b981', '❄️');
const microIcon = createSvgIcon('#f59e0b', '⚡');
const expressIcon = createSvgIcon('#a855f7', '📦');
const bulkIcon = createSvgIcon('#06b6d4', '🚛');
const mandiIcon = createSvgIcon('#eab308', '🌾', 34);
const coldStorageIcon = createSvgIcon('#38bdf8', '🧊', 34);

// Map Controller for smooth flyTo and container size recalculations
function MapController({ targetCenter, targetZoom }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size on initial mount and whenever container renders to prevent grey tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (targetCenter && targetZoom) {
      map.flyTo(targetCenter, targetZoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [targetCenter, targetZoom, map]);

  return null;
}

export default function UnifiedMap({ shipments = [], corridors = [], onSelectShipment, onSelectMandi }) {
  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const safeCorridors = Array.isArray(corridors) ? corridors : [];

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'TIER1', 'MICRO', 'MANDIS', 'COLD_CHAIN'
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Map Provider & API Key State
  const envMapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
  const envGoogleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const envMapKey = import.meta.env.VITE_MAP_API_KEY || '';

  const [mapProvider, setMapProvider] = useState(() => {
    return localStorage.getItem('bharat_map_provider') || 'esri-hybrid';
  });

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('bharat_map_api_key') || envMapboxToken || envGoogleKey || envMapKey || '';
  });

  const [tempApiKeyInput, setTempApiKeyInput] = useState(apiKey);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Camera presets
  const indiaCenter = [22.5, 78.9];
  const [camera, setCamera] = useState({ center: indiaCenter, zoom: 5 });

  // Filter Shipments
  const filteredShipments = safeShipments.filter(s => {
    if (!s) return false;
    if (activeFilter === 'TIER1') return s.tier && s.tier.includes('Tier 1');
    if (activeFilter === 'MICRO') return s.tier && s.tier.includes('Tier 4');
    if (activeFilter === 'EXPRESS') return s.tier && s.tier.includes('Tier 2');
    return true;
  });

  // Handle Save API Key
  const handleSaveApiKey = () => {
    const cleaned = tempApiKeyInput.trim();
    setApiKey(cleaned);
    localStorage.setItem('bharat_map_api_key', cleaned);
    localStorage.setItem('bharat_map_provider', mapProvider);
    setSaveSuccessMsg('Settings saved! Realistic map layer updated.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Quick preset jump
  const jumpToRegion = (center, zoom) => {
    setCamera({ center, zoom });
  };

  // Determine Tile Layer URLs and Attributions based on selected provider and API key
  const getTileConfig = () => {
    switch (mapProvider) {
      case 'esri-hybrid':
        return {
          base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          overlay: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          subdomains: 'abc',
          attribution: '&copy; Esri & NASA Earth Observation | Pan-India High-Res Satellite',
          maxZoom: 19
        };
      case 'esri-satellite':
        return {
          base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          subdomains: 'abc',
          overlay: null,
          attribution: '&copy; Esri & Open Data Contributors | Satellite Imagery',
          maxZoom: 19
        };
      case 'carto-dark':
        return {
          base: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          subdomains: 'abcd',
          overlay: null,
          attribution: '&copy; CARTO & OpenStreetMap | BharatLogistics Tactical Ops',
          maxZoom: 19
        };
      case 'osm-streets':
        return {
          base: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          subdomains: 'abc',
          overlay: null,
          attribution: '&copy; OpenStreetMap contributors | India Highway Grid',
          maxZoom: 19
        };
      case 'opentopo':
        return {
          base: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          subdomains: 'abc',
          overlay: null,
          attribution: '&copy; OpenTopoMap | Elevation & Mountain Corridors',
          maxZoom: 17
        };
      case 'mapbox-dark':
        return {
          base: apiKey 
            ? `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/256/{z}/{x}/{y}@2x?access_token=${apiKey}`
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          subdomains: 'abcd',
          overlay: null,
          attribution: apiKey ? '&copy; Mapbox & OpenStreetMap | High-Res Navigation' : '&copy; CARTO (Fallback - Enter Mapbox Key)',
          maxZoom: 20
        };
      case 'mapbox-satellite':
        return {
          base: apiKey
            ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${apiKey}`
            : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          subdomains: 'abc',
          overlay: apiKey ? null : 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          attribution: apiKey ? '&copy; Mapbox High-Res Satellite' : '&copy; Esri World Imagery (Fallback)',
          maxZoom: 20
        };
      case 'google-hybrid':
        return {
          base: apiKey
            ? `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${apiKey}`
            : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          subdomains: 'abc',
          overlay: apiKey ? null : 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          attribution: apiKey ? '&copy; Google Maps Platform' : '&copy; Esri Satellite (Fallback - Enter Google Key)',
          maxZoom: 20
        };
      default:
        return {
          base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          overlay: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          subdomains: 'abc',
          attribution: '&copy; Esri & Open Data Contributors | Pan-India Satellite',
          maxZoom: 19
        };
    }
  };

  const tileConfig = getTileConfig();

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px', position: 'relative' }}>
      
      {/* Map Header & Corridor Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-agri" style={{ fontSize: '0.65rem' }}>Pan-India GIS Live Grid</span>
            <span style={{ fontSize: '0.72rem', color: apiKey ? '#34d399' : '#60a5fa', fontWeight: 600 }}>
              ● {apiKey ? 'High-Definition Custom API Active' : 'Photorealistic Open Satellite Mode'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <Navigation size={22} color="#10b981" />
            Pan-India Multi-Tier Freight, Mandi & Micro-Transit Corridor Map
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Real-time IoT Reefer tracking on National Highways, APMC Mandi Hubs, and Last-Mile EV Micro-Nodes
          </p>
        </div>

        {/* Action Controls & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.85)', padding: '5px 8px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Filter size={14} color="#94a3b8" />
            <button 
              onClick={() => setActiveFilter('ALL')}
              style={{
                background: activeFilter === 'ALL' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: activeFilter === 'ALL' ? '#ffffff' : '#94a3b8',
                border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              All Fleet ({safeShipments.length})
            </button>
            
            <button 
              onClick={() => setActiveFilter('TIER1')}
              style={{
                background: activeFilter === 'TIER1' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: activeFilter === 'TIER1' ? '#34d399' : '#94a3b8',
                border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              AgriFresh ❄️
            </button>

            <button 
              onClick={() => setActiveFilter('MICRO')}
              style={{
                background: activeFilter === 'MICRO' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: activeFilter === 'MICRO' ? '#fbbf24' : '#94a3b8',
                border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Micro-Transit ⚡
            </button>

            <button 
              onClick={() => setActiveFilter('MANDIS')}
              style={{
                background: activeFilter === 'MANDIS' ? 'rgba(234, 179, 8, 0.25)' : 'transparent',
                color: activeFilter === 'MANDIS' ? '#facc15' : '#94a3b8',
                border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              APMC Mandis 🌾
            </button>
          </div>

          {/* Map Layer & API Key Settings Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: apiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              border: apiKey ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
              color: apiKey ? '#34d399' : '#93c5fd',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Settings size={15} />
            <span>Map Layers & API Key</span>
          </button>

        </div>
      </div>

      {/* Regional Quick-Focus Camera Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Compass size={13} color="#10b981" /> Quick Focus:
        </span>
        <button 
          onClick={() => jumpToRegion(indiaCenter, 5)}
          className="badge" 
          style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '0.72rem' }}
        >
          🇮🇳 Pan-India Overview
        </button>
        <button 
          onClick={() => jumpToRegion([30.5, 77.0], 7)}
          className="badge" 
          style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#38bdf8', cursor: 'pointer', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.72rem' }}
        >
          🍎 North (Shimla Apples & Delhi Azadpur)
        </button>
        <button 
          onClick={() => jumpToRegion([19.2, 73.8], 7)}
          className="badge" 
          style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#34d399', cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.72rem' }}
        >
          🥭 West (Ratnagiri Alphonso & Nashik Onions)
        </button>
        <button 
          onClick={() => jumpToRegion([13.8, 77.8], 7)}
          className="badge" 
          style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#f59e0b', cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.72rem' }}
        >
          🍅 South (Kolar Tomatoes & Bengaluru EV Grid)
        </button>
        <button 
          onClick={() => jumpToRegion([21.2, 79.1], 7)}
          className="badge" 
          style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#c084fc', cursor: 'pointer', border: '1px solid rgba(192, 132, 252, 0.2)', fontSize: '0.72rem' }}
        >
          🍊 Central (Nagpur Oranges & Zero Mile Hub)
        </button>
      </div>

      {/* Map Leaflet Container */}
      <div style={{ width: '100%', height: '540px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        
        <MapContainer 
          center={camera.center} 
          zoom={camera.zoom} 
          style={{ width: '100%', height: '100%', background: '#0a0f1d' }}
          scrollWheelZoom={true}
        >
          {/* Controller to handle dynamic camera flying and resize invalidation */}
          <MapController targetCenter={camera.center} targetZoom={camera.zoom} />

          {/* Primary Base Tile Layer */}
          <TileLayer
            key={mapProvider + (apiKey || '')}
            url={tileConfig.base}
            subdomains={tileConfig.subdomains || 'abc'}
            attribution={tileConfig.attribution}
            maxZoom={tileConfig.maxZoom || 19}
          />

          {/* Optional Overlay Layer (e.g. Street Labels & Highway Numbers on Satellite) */}
          {tileConfig.overlay && (
            <TileLayer
              key={`overlay-${mapProvider}`}
              url={tileConfig.overlay}
              subdomains="abc"
              maxZoom={tileConfig.maxZoom || 19}
              opacity={0.9}
            />
          )}

          {/* National Logistics Corridors (Polylines) */}
          {safeCorridors.map(corridor => {
            if (!corridor || !corridor.waypoints) return null;
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
                  opacity: 0.88
                }}
              >
                <Tooltip sticky>
                  <div style={{ padding: '6px', fontFamily: 'sans-serif' }}>
                    <div style={{ fontWeight: 800, color: isAgriExpress ? '#34d399' : '#22d3ee', fontSize: '0.85rem' }}>
                      {corridor.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                      Highway: <strong>{corridor.highway}</strong> • Distance: <strong>{corridor.distanceKm} km</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '2px' }}>
                      ⚡ FASTag Green Corridor Bypass Active
                    </div>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}

          {/* Real APMC Mandis Pins */}
          {(activeFilter === 'ALL' || activeFilter === 'MANDIS') && REAL_APMC_MANDIS.map(mandi => {
            const isColdHub = mandi.category.includes('Cold');
            return (
              <Marker
                key={mandi.id}
                position={[mandi.coords.lat, mandi.coords.lng]}
                icon={isColdHub ? coldStorageIcon : mandiIcon}
              >
                <Popup>
                  <div style={{ minWidth: '240px', padding: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className={`badge ${isColdHub ? 'badge-iot' : 'badge-agri'}`} style={{ fontSize: '0.65rem' }}>
                        {mandi.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#facc15', fontWeight: 700 }}>
                        {mandi.state}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                      {mandi.name}
                    </h4>

                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '4px 0' }}>
                      <strong>Daily Inflow:</strong> {mandi.dailyArrivalTons.toLocaleString()} Metric Tons
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', margin: '4px 0' }}>
                      <strong>Cold Storage:</strong> {mandi.coldStorageCapacityMT.toLocaleString()} MT Capacity
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0' }}>
                      <strong>Corridor Link:</strong> {mandi.nearestHighway}
                    </div>

                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '6px', padding: '6px', marginTop: '8px', fontSize: '0.72rem', color: '#fef08a' }}>
                      🌾 Major Arrivals: {mandi.majorCommodities.join(', ')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Active Shipments & Commercial Vehicles Pins */}
          {(activeFilter !== 'MANDIS') && filteredShipments.map(shipment => {
            if (!shipment.currentCoords || !shipment.currentCoords.lat) return null;

            let icon = agriIcon;
            if (shipment.tier && shipment.tier.includes('Tier 4')) icon = microIcon;
            else if (shipment.tier && shipment.tier.includes('Tier 2')) icon = expressIcon;
            else if (shipment.tier && shipment.tier.includes('Tier 3')) icon = bulkIcon;

            return (
              <Marker
                key={shipment.id}
                position={[shipment.currentCoords.lat, shipment.currentCoords.lng]}
                icon={icon}
              >
                <Popup>
                  <div style={{ minWidth: '250px', padding: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className={`badge ${shipment.tier.includes('Tier 1') ? 'badge-agri' : shipment.tier.includes('Tier 4') ? 'badge-micro' : 'badge-iot'}`} style={{ fontSize: '0.65rem' }}>
                        {shipment.id}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                        {shipment.progressPercent}% Transit
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                      {shipment.commodity}
                    </h4>

                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '4px 0' }}>
                      <strong>Route:</strong> {shipment.origin.split(',')[0]} → {shipment.destination.split(',')[0]}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0' }}>
                      <strong>Vehicle:</strong> {shipment.vehicleNumber}
                    </div>

                    {shipment.telemetry && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px', padding: '8px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: '#94a3b8' }}>Reefer Temp:</span>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>{shipment.telemetry.currentTempC}°C (Target: {shipment.telemetry.targetTempC}°C)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Freshness Index:</span>
                          <span style={{ color: '#22d3ee', fontWeight: 700 }}>{shipment.telemetry.freshnessIndexPercent}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginTop: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Ethylene Gas:</span>
                          <span style={{ color: '#facc15', fontWeight: 700 }}>{shipment.telemetry.ethylenePpm} ppm</span>
                        </div>
                      </div>
                    )}

                    {shipment.otpVerificationCode && (
                      <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '6px', marginTop: '6px', fontSize: '0.75rem', color: '#fbbf24', textAlign: 'center' }}>
                        🔑 Instant Delivery OTP: <strong>{shipment.otpVerificationCode}</strong>
                      </div>
                    )}

                    <button 
                      className="btn-primary"
                      onClick={() => onSelectShipment && onSelectShipment(shipment)}
                      style={{ width: '100%', marginTop: '10px', padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      Inspect Full IoT Telemetry
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Real Commercial Vehicle Fleet Pins (From National Fleet Register) */}
          {(activeFilter === 'ALL' || activeFilter === 'TIER1' || activeFilter === 'MICRO') && REAL_VEHICLE_FLEET.map(veh => {
            // Avoid duplicate marker if vehicle already has an active shipment shown
            if (filteredShipments.some(s => s.vehicleNumber && s.vehicleNumber.includes(veh.registrationNumber))) return null;
            if (activeFilter === 'TIER1' && !veh.category.includes('Tier 1')) return null;
            if (activeFilter === 'MICRO' && !veh.category.includes('Tier 4')) return null;

            let icon = agriIcon;
            if (veh.category.includes('Tier 4')) icon = microIcon;
            else if (veh.category.includes('Tier 2')) icon = expressIcon;
            else if (veh.category.includes('Tier 3')) icon = bulkIcon;

            return (
              <Marker
                key={veh.id}
                position={[veh.currentCoords.lat, veh.currentCoords.lng]}
                icon={icon}
              >
                <Popup>
                  <div style={{ minWidth: '250px', padding: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge badge-agri" style={{ fontSize: '0.65rem' }}>
                        {veh.registrationNumber}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                        {veh.currentSpeedKmH} km/h
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                      {veh.model}
                    </h4>

                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '2px 0 6px 0' }}>
                      {veh.currentCommodity} • {veh.assignedCorridor}
                    </div>

                    <div style={{ background: 'rgba(15, 23, 42, 0.85)', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                        <span style={{ color: '#94a3b8' }}>Battery/Fuel:</span>
                        <strong style={{ color: veh.batteryOrFuelPercent > 70 ? '#34d399' : '#fbbf24' }}>{veh.batteryOrFuelPercent}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                        <span style={{ color: '#94a3b8' }}>Reefer Temp:</span>
                        <strong style={{ color: '#34d399' }}>{veh.telematics ? `${veh.telematics.cabinTempC}°C` : 'Ambient'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ color: '#94a3b8' }}>FASTag Bypass:</span>
                        <strong style={{ color: veh.greenCorridorClearance ? '#34d399' : '#94a3b8' }}>{veh.greenCorridorClearance ? 'Green Corridors Active' : 'Standard'}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0' }}>
                      👤 Driver: <strong>{veh.driver.name}</strong> ({veh.driver.phone})
                    </div>
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
          background: 'rgba(11, 17, 32, 0.92)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontWeight: 800, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="#10b981" /> GIS Layer Legend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
            <span>Tier 1 AgriFresh Perishable Reefer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></span>
            <span>Tier 4 EV Micro-Transit (Rapido / Porter)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></span>
            <span>🌾 Real APMC Agricultural Mandi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }}></span>
            <span>🧊 Mega Cold Storage & Food Park</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <span style={{ width: '14px', height: '3px', background: '#10b981', display: 'inline-block' }}></span>
            <span>National Green Express Corridor (NH-44 / NH-48)</span>
          </div>
        </div>

      </div>

      {/* Map Settings & API Key Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '620px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '10px' }}>
                  <Settings size={22} color="#34d399" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Map Layers & API Key Manager
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Configure realistic high-resolution satellite tiles, dark operations, or Mapbox/Google APIs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Provider Options Grid */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '10px' }}>
                Select Active Map Layer & Visual Style:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                
                {/* 1. Esri Hybrid Satellite */}
                <div 
                  onClick={() => setMapProvider('esri-hybrid')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: mapProvider === 'esri-hybrid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                    border: mapProvider === 'esri-hybrid' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>🛰️ Photorealistic Satellite + Hybrid</strong>
                    <span className="badge badge-agri" style={{ fontSize: '0.62rem' }}>Recommended</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    High-res Esri satellite imagery with road overlays, highway numbers & cities. (No API Key Required)
                  </p>
                </div>

                {/* 2. Carto Dark Matter */}
                <div 
                  onClick={() => setMapProvider('carto-dark')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: mapProvider === 'carto-dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                    border: mapProvider === 'carto-dark' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>🌌 Obsidian Tactical Dark</strong>
                    <span className="badge badge-iot" style={{ fontSize: '0.62rem' }}>Open Source</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    Ultra-clean dark operational canvas. Highlights neon vehicle pins and refrigerated corridors.
                  </p>
                </div>

                {/* 3. OpenStreetMap Streets */}
                <div 
                  onClick={() => setMapProvider('osm-streets')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: mapProvider === 'osm-streets' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                    border: mapProvider === 'osm-streets' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>🗺️ OpenStreetMap Street Grid</strong>
                    <span className="badge" style={{ fontSize: '0.62rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>Free</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    Authentic road geography, village routes, and state border markings across India.
                  </p>
                </div>

                {/* 4. Mapbox Navigation Night (Requires Token) */}
                <div 
                  onClick={() => setMapProvider('mapbox-dark')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: mapProvider === 'mapbox-dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                    border: mapProvider === 'mapbox-dark' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>⚡ Mapbox Navigation Dark</strong>
                    <span className="badge badge-micro" style={{ fontSize: '0.62rem' }}>API Key</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    HD Vector Navigation style from Mapbox. (Enter your Mapbox Access Token below)
                  </p>
                </div>

                {/* 5. Mapbox Satellite Streets */}
                <div 
                  onClick={() => setMapProvider('mapbox-satellite')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: mapProvider === 'mapbox-satellite' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                    border: mapProvider === 'mapbox-satellite' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>🛰️ Mapbox HD Satellite Streets</strong>
                    <span className="badge badge-micro" style={{ fontSize: '0.62rem' }}>API Key</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    Ultra high-detail satellite imaging with crisp typography and real-time building footprints.
                  </p>
                </div>

                {/* 6. Google Maps Hybrid */}
                <div 
                  onClick={() => setMapProvider('google-hybrid')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: mapProvider === 'google-hybrid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                    border: mapProvider === 'google-hybrid' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>🌐 Google Maps Hybrid</strong>
                    <span className="badge badge-micro" style={{ fontSize: '0.62rem' }}>API Key</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    Google Maps Platform satellite tiles with traffic and roads. (Enter Google Maps Key)
                  </p>
                </div>

              </div>
            </div>

            {/* API Key Input Section */}
            <div style={{ background: 'rgba(2, 6, 23, 0.7)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Key size={16} color="#fbbf24" />
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
                  Custom Map API Key / Token:
                </label>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
                Paste your Mapbox token (<code>pk.eyJ1...</code>) or Google Maps API key (<code>AIza...</code>). Keys are saved safely in your browser local storage.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={tempApiKeyInput}
                  onChange={(e) => setTempApiKeyInput(e.target.value)}
                  placeholder="e.g. pk.eyJ1... (or leave empty for Open Satellite)"
                  style={{
                    flex: 1,
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />

                {tempApiKeyInput && (
                  <button
                    onClick={() => {
                      setTempApiKeyInput('');
                      setApiKey('');
                      localStorage.removeItem('bharat_map_api_key');
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Key
                  </button>
                )}
              </div>

              {saveSuccessMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#34d399', fontSize: '0.78rem', fontWeight: 600 }}>
                  <CheckCircle2 size={15} /> {saveSuccessMsg}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn-amber"
                onClick={() => {
                  setMapProvider('esri-hybrid');
                  setTempApiKeyInput('');
                  setApiKey('');
                  localStorage.setItem('bharat_map_provider', 'esri-hybrid');
                  localStorage.removeItem('bharat_map_api_key');
                  setShowSettingsModal(false);
                }}
                style={{ fontSize: '0.8rem', padding: '8px 14px' }}
              >
                Reset to Open Satellite (No Key)
              </button>

              <button
                className="btn-primary"
                onClick={() => {
                  handleSaveApiKey();
                  setShowSettingsModal(false);
                }}
                style={{ fontSize: '0.8rem', padding: '8px 18px' }}
              >
                Apply & Update Map
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
