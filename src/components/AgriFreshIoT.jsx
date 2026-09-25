import React, { useState, useEffect } from 'react';
import { Thermometer, ShieldCheck, Zap, AlertTriangle, Activity, Droplets, Wind, Lock, RefreshCw, CheckCircle2, ChevronRight, Gauge } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AgriFreshIoT({ shipments, onActivateBooster }) {
  // Filter Tier 1 shipments with active telemetry
  const agriShipments = shipments.filter(s => s.telemetry);
  const [selectedShipment, setSelectedShipment] = useState(agriShipments[0] || null);
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [boosterLoading, setBoosterLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  useEffect(() => {
    if (agriShipments.length > 0 && (!selectedShipment || !agriShipments.find(s => s.id === selectedShipment.id))) {
      setSelectedShipment(agriShipments[0]);
    }
  }, [shipments]);

  // Keep telemetry history for chart visualization
  useEffect(() => {
    if (!selectedShipment || !selectedShipment.telemetry) return;
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTelemetryHistory(prev => {
      const nextArr = [...prev, {
        time: now,
        temp: selectedShipment.telemetry.currentTempC,
        targetTemp: selectedShipment.telemetry.targetTempC,
        humidity: selectedShipment.telemetry.humidityPercent,
        ethylene: selectedShipment.telemetry.ethylenePpm * 10, // Scaled for chart visibility
        spoilage: selectedShipment.telemetry.spoilageRiskScore
      }];
      if (nextArr.length > 15) return nextArr.slice(nextArr.length - 15);
      return nextArr;
    });
  }, [selectedShipment?.telemetry?.currentTempC, selectedShipment?.telemetry?.ethylenePpm]);

  if (!selectedShipment) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <Thermometer size={48} color="#10b981" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>No Active AgriFresh IoT Reefer Containers Found</h3>
        <p style={{ color: '#94a3b8' }}>Create or dispatch a new perishable shipment to view live IoT telemetry.</p>
      </div>
    );
  }

  const t = selectedShipment.telemetry;
  const isTempWarning = t.currentTempC > t.maxTempThresholdC || t.currentTempC < t.minTempThresholdC;

  const handleBoosterClick = async () => {
    setBoosterLoading(true);
    await onActivateBooster(selectedShipment.id);
    setBoosterLoading(false);
    setNotificationMsg('⚡ Sub-Zero Nitrogen Booster Cooling Activated! Temperature drop initiated.');
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      
      {/* Console Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-agri">AgriFresh IoT Telemetry Console</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Container ID: <strong style={{ color: '#34d399' }}>{t.containerId}</strong></span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
              {selectedShipment.commodity} • Freshness & Climate Control
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Origin: {selectedShipment.origin} → Destination: {selectedShipment.destination} ({selectedShipment.transporterName})
            </p>
          </div>

          {/* Active Container Dropdown Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Switch Perishable Cargo:</label>
            <select
              value={selectedShipment.id}
              onChange={(e) => {
                const found = agriShipments.find(s => s.id === e.target.value);
                if (found) {
                  setSelectedShipment(found);
                  setTelemetryHistory([]);
                }
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '10px',
                padding: '8px 14px',
                color: '#34d399',
                fontSize: '0.85rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {agriShipments.map(s => (
                <option key={s.id} value={s.id}>
                  {s.commodity} ({s.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: '12px', padding: '12px 18px', color: '#34d399', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} /> {notificationMsg}
        </div>
      )}

      {/* Telemetry Sensor Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        
        {/* Sensor 1: Reefer Temperature */}
        <div className={`glass-panel ${isTempWarning ? 'glass-panel-glow-amber' : 'glass-panel-glow-green'}`} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Container Temperature</span>
            <Thermometer size={20} color={isTempWarning ? '#f59e0b' : '#10b981'} />
          </div>
          
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: isTempWarning ? '#f59e0b' : '#34d399' }}>
              {t.currentTempC}°C
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Target: <strong>{t.targetTempC}°C</strong>
            </span>
          </div>

          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            Threshold Range: {t.minTempThresholdC}°C to {t.maxTempThresholdC}°C
          </div>

          {isTempWarning && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
              <AlertTriangle size={14} /> Thermal Drift Warning Detected!
            </div>
          )}
        </div>

        {/* Sensor 2: Ethylene Ripening Gas Concentration */}
        <div className="glass-panel glass-panel-glow-cyan" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Ethylene Gas (C₂H₄)</span>
            <Wind size={20} color="#06b6d4" />
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#22d3ee' }}>
              {t.ethylenePpm} <span style={{ fontSize: '1rem' }}>ppm</span>
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Max Limit: <strong>{t.gasSafetyLimitPpm} ppm</strong>
            </span>
          </div>

          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            Nitrogen Scrubber: <strong style={{ color: t.nitrogenPurgeActive ? '#34d399' : '#f59e0b' }}>{t.nitrogenPurgeActive ? 'ACTIVE (Scubbing Ripening Gas)' : 'STANDBY'}</strong>
          </div>
        </div>

        {/* Sensor 3: Freshness Lifespan & Spoilage Index */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Predictive Freshness Score</span>
            <ShieldCheck size={20} color="#10b981" />
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#34d399' }}>
              {t.freshnessIndexPercent}%
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Est. Shelf Life: <strong style={{ color: '#ffffff' }}>{t.estimatedFreshnessHoursRemaining} Hrs</strong>
            </span>
          </div>

          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            Spoilage Risk Index: <strong style={{ color: t.spoilageRiskScore > 10 ? '#ef4444' : '#34d399' }}>{t.spoilageRiskScore}%</strong>
          </div>
        </div>

        {/* Sensor 4: Relative Humidity & Security Seal */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Relative Humidity & Seal</span>
            <Droplets size={20} color="#a855f7" />
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#c084fc' }}>
              {t.humidityPercent}%
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Target: <strong>{t.targetHumidityPercent}%</strong>
            </span>
          </div>

          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} color="#34d399" /> Container Seal: <strong style={{ color: '#34d399' }}>{t.doorStatus}</strong>
          </div>
        </div>

      </div>

      {/* Main Telemetry Chart & Emergency Cooling Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Real-time Telemetry Trend Graph */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#10b981" /> Live Climate Telemetry Chart
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sampling Every 3.5 Seconds</span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="ethyleneGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="temp" name="Container Temp (°C)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" />
                <Area type="monotone" dataKey="ethylene" name="Ethylene Gas (ppm x 10)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#ethyleneGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Climate Control Action Panel */}
        <div className="glass-panel glass-panel-glow-green" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={18} color="#f59e0b" /> Climate Control Override
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              If ambient temperatures spike along highway corridors, trigger immediate Sub-Zero Nitrogen Booster Cooling to preserve perishable cell walls & prevent ethylene gas buildup.
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cooling Compressor State:</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: t.coolingSystemState.includes('BOOSTER') ? '#f59e0b' : '#34d399', marginTop: '2px' }}>
                {t.coolingSystemState}
              </div>
            </div>
          </div>

          <button 
            className="btn-amber"
            onClick={handleBoosterClick}
            disabled={boosterLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {boosterLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
            Trigger Sub-Zero Booster Cooling
          </button>
        </div>

      </div>
    </div>
  );
}
