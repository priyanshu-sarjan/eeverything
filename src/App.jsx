import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import UnifiedMap from './components/UnifiedMap';
import AgriFreshIoT from './components/AgriFreshIoT';
import MicroTransitDispatch from './components/MicroTransitDispatch';
import ShipmentsList from './components/ShipmentsList';
import NewShipmentModal from './components/NewShipmentModal';
import ShipmentDetailModal from './components/ShipmentDetailModal';
import AnalyticsESG from './components/AnalyticsESG';
import confetti from 'canvas-confetti';
import { INITIAL_SHIPMENTS } from '../server/data/shipmentsData.js';
import { INDIAN_LOGISTICS_CORRIDORS } from '../server/data/routesData.js';

export default function App() {
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [corridors, setCorridors] = useState(INDIAN_LOGISTICS_CORRIDORS);
  const [analyticsData, setAnalyticsData] = useState({
    totalActiveShipments: 6,
    tier1AgriFreshActive: 3,
    foodSpoilagePreventedTons: 1428.5,
    foodWasteReductionPercent: 99.4,
    avgColdChainTempVarianceC: 0.3,
    greenCorridorBypassAvgSavedMins: 48,
    microTransitDispatches24h: 3840,
    carbonOffsetCo2Tons: 612.4,
    nationalSupplyChainHealthScore: 98.7
  });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'agrifresh', 'micro', 'shipments'
  const [isLiveStreamConnected, setIsLiveStreamConnected] = useState(false);

  // Modal States
  const [isNewShipmentOpen, setIsNewShipmentOpen] = useState(false);
  const [isMicroDispatchOpen, setIsMicroDispatchOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Initial Fetch of Data
  useEffect(() => {
    fetch('/api/shipments')
      .then(res => res.json())
      .then(data => {
        if (data.success) setShipments(data.data);
      })
      .catch(console.error);

    fetch('/api/corridors')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCorridors(data.data);
      })
      .catch(console.error);

    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnalyticsData(data.data);
      })
      .catch(console.error);
  }, []);

  // Server-Sent Events (SSE) & Polling Fallback for Vercel Serverless
  useEffect(() => {
    let eventSource = null;

    try {
      eventSource = new EventSource('/api/live-stream');

      eventSource.onopen = () => {
        setIsLiveStreamConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INIT' || payload.type === 'TELEMETRY_UPDATE') {
            setShipments(payload.shipments);
          } else if (payload.type === 'NEW_SHIPMENT') {
            setShipments(prev => [payload.shipment, ...prev]);
          }
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };

      eventSource.onerror = () => {
        setIsLiveStreamConnected(false);
      };
    } catch (e) {
      setIsLiveStreamConnected(false);
    }

    // Polling Ticker Fallback for Vercel Serverless environment
    const pollInterval = setInterval(() => {
      fetch('/api/shipments')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setShipments(data.data);
            setIsLiveStreamConnected(true);
          }
        })
        .catch(() => {});
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Handler: Create New Shipment
  const handleCreateShipment = async (shipmentData) => {
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentData)
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Sub-Zero Booster Cooling
  const handleActivateBooster = async (shipmentId) => {
    try {
      await fetch(`/api/shipments/${shipmentId}/booster-cooling`, {
        method: 'POST'
      });
      confetti({ particleCount: 50, spread: 60, colors: ['#06b6d4', '#10b981', '#ffffff'] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewShipment={() => setIsNewShipmentOpen(true)}
        onOpenMicroDispatch={() => {
          setActiveTab('micro');
        }}
        isLiveStreamConnected={isLiveStreamConnected}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        
        {/* Tab 1: Overview & Pan-India Map */}
        {activeTab === 'overview' && (
          <>
            <HeroBanner analyticsData={analyticsData} setActiveTab={setActiveTab} />
            <UnifiedMap
              shipments={shipments}
              corridors={corridors}
              onSelectShipment={(shipment) => setSelectedShipment(shipment)}
            />
            <AnalyticsESG analyticsData={analyticsData} />
            <ShipmentsList
              shipments={shipments}
              onSelectShipment={(shipment) => setSelectedShipment(shipment)}
            />
          </>
        )}

        {/* Tab 2: AgriFresh Perishable IoT Console */}
        {activeTab === 'agrifresh' && (
          <>
            <AgriFreshIoT
              shipments={shipments}
              onActivateBooster={handleActivateBooster}
            />
            <UnifiedMap
              shipments={shipments.filter(s => s.tier.includes('Tier 1'))}
              corridors={corridors}
              onSelectShipment={(shipment) => setSelectedShipment(shipment)}
            />
          </>
        )}

        {/* Tab 3: Rapido / Uber Style Micro-Transit Dispatch Engine */}
        {activeTab === 'micro' && (
          <MicroTransitDispatch
            onDispatchMicroTransit={(newMicroShipment) => {
              confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            }}
          />
        )}

        {/* Tab 4: Shipments Directory */}
        {activeTab === 'shipments' && (
          <ShipmentsList
            shipments={shipments}
            onSelectShipment={(shipment) => setSelectedShipment(shipment)}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(7, 9, 14, 0.95)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: '#ffffff' }}>BharatLogistics & AgriFresh IoT</strong> — Multi-Tier Unified Supply Chain Network for India
          </div>
          <div>
            Built with React, Express, Leaflet, Recharts & IoT Telematics • SLA Target: 99.4% Zero Spoilage
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewShipmentModal
        isOpen={isNewShipmentOpen}
        onClose={() => setIsNewShipmentOpen(false)}
        onCreateShipment={handleCreateShipment}
      />

      <ShipmentDetailModal
        shipment={selectedShipment}
        onClose={() => setSelectedShipment(null)}
        onActivateBooster={handleActivateBooster}
      />

    </div>
  );
}
