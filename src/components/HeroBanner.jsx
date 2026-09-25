import React from 'react';
import { ShieldCheck, Truck, Zap, Activity, Thermometer, Layers, Clock, ArrowRight } from 'lucide-react';

export default function HeroBanner({ analyticsData, setActiveTab }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Top Banner Card */}
      <div className="glass-panel glass-panel-glow-green" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative Grid Accent */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, width: '40%',
          background: 'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '750px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '16px' }}>
              <ShieldCheck size={16} color="#34d399" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Unified Supply Chain Architecture for India
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, color: '#ffffff', marginBottom: '14px' }}>
              IoT-Enabled AgriFresh Cold Chain & On-Demand Micro-Transit Network
            </h1>

            <p style={{ fontSize: '0.98rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
              Eliminating agricultural post-harvest food waste across India through an intelligent multi-tiered transit matrix. From high-maintenance perishable goods with real-time IoT thermal & ethylene monitoring, to hyperlocal 2-wheeler/3-wheeler micro-transit dispatch (Rapido & Uber freight model).
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => setActiveTab('agrifresh')}>
                <Thermometer size={18} /> Launch AgriFresh IoT Console
              </button>
              <button className="btn-amber" onClick={() => setActiveTab('micro')}>
                <Zap size={18} /> Hyperlocal Dispatch Engine <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', minWidth: '320px' }}>
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.8)' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Food Waste Prevented</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                {analyticsData ? `${analyticsData.foodWasteReductionPercent}%` : '99.4%'}
              </p>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Zero Spoilage SLA Target</span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.8)' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>IoT Reefer Health</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#22d3ee', marginTop: '4px' }}>
                {analyticsData ? `±${analyticsData.avgColdChainTempVarianceC}°C` : '±0.3°C'}
              </p>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Precision Thermal Hold</span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.8)' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Green Bypass Time</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
                {analyticsData ? `-${analyticsData.greenCorridorBypassAvgSavedMins}m` : '-48 mins'}
              </p>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Highway Toll Prioritization</span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.8)' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Micro-Dispatches</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
                {analyticsData ? `${analyticsData.microTransitDispatches24h}` : '3,840'}
              </p>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>2W / 3W / Tata Ace Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* Unified Priority Tier Matrix Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
        
        {/* Tier 1 */}
        <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-agri">Tier 1 • Top Priority</span>
            <Thermometer size={18} color="#34d399" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>AgriFresh Perishable IoT</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Alphonso Mangoes, Apples, Tomatoes, Dairy & Vaccines. Solar Reefers with Ethylene & Temp sensors.
          </p>
        </div>

        {/* Tier 2 */}
        <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-pharma">Tier 2 • High Value</span>
            <ShieldCheck size={18} color="#c084fc" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>Pharma & High-Tech Express</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Biologicals, Medical Diagnostics & Electronics. Tamper-proof smart container GPS seals.
          </p>
        </div>

        {/* Tier 3 */}
        <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-iot">Tier 3 • Industrial</span>
            <Truck size={18} color="#22d3ee" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>Bulk & Intercity Freight</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Textiles, Grains, Heavy Machinery. Multimodal Rail-Road hub routing & freight logistics.
          </p>
        </div>

        {/* Tier 4 */}
        <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-micro">Tier 4 • Hyperlocal</span>
            <Zap size={18} color="#fbbf24" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>Micro-Transit On-Demand</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
            Rapido & Uber style instant dispatch. Bike couriers, 3-Wheelers & Tata Ace for urban last-mile.
          </p>
        </div>

      </div>
    </div>
  );
}
