import React, { useState } from 'react';
import { Truck, Search, ShieldCheck, Zap, Thermometer, ChevronRight, Phone, User, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

export default function ShipmentsList({ shipments, onSelectShipment }) {
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = shipments.filter(s => {
    if (filterTier === 'TIER1' && !s.tier.includes('Tier 1')) return false;
    if (filterTier === 'TIER2' && !s.tier.includes('Tier 2')) return false;
    if (filterTier === 'TIER3' && !s.tier.includes('Tier 3')) return false;
    if (filterTier === 'TIER4' && !s.tier.includes('Tier 4')) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.commodity.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.trackingNumber.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      
      {/* Search & Tier Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            National Supply Chain Shipment Directory
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Active freight orders & on-demand transit across India
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search shipment or tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Tier Selector */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setFilterTier('ALL')}
              style={{
                background: filterTier === 'ALL' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: filterTier === 'ALL' ? '#ffffff' : '#94a3b8',
                border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              All ({shipments.length})
            </button>
            <button
              onClick={() => setFilterTier('TIER1')}
              style={{
                background: filterTier === 'TIER1' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: filterTier === 'TIER1' ? '#34d399' : '#94a3b8',
                border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              AgriFresh ❄️
            </button>
            <button
              onClick={() => setFilterTier('TIER4')}
              style={{
                background: filterTier === 'TIER4' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: filterTier === 'TIER4' ? '#fbbf24' : '#94a3b8',
                border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Micro-Transit ⚡
            </button>
          </div>
        </div>
      </div>

      {/* Shipment Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px' }}>Tracking & ID</th>
              <th style={{ padding: '12px 16px' }}>Priority Tier & Commodity</th>
              <th style={{ padding: '12px 16px' }}>Origin → Destination</th>
              <th style={{ padding: '12px 16px' }}>Status & Transit Progress</th>
              <th style={{ padding: '12px 16px' }}>IoT Telemetry / Driver</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const isAgri = s.tier.includes('Tier 1');
              const isMicro = s.tier.includes('Tier 4');

              return (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s ease' }} className="hover:bg-slate-800/40">
                  {/* ID & Tracking */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{s.id}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.trackingNumber}</div>
                  </td>

                  {/* Commodity & Priority */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className={`badge ${isAgri ? 'badge-agri' : isMicro ? 'badge-micro' : 'badge-iot'}`} style={{ fontSize: '0.62rem' }}>
                        {s.tier.split(':')[0]}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{s.commodity}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Qty: {s.quantity}</div>
                  </td>

                  {/* Route */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{s.origin.split(',')[0]}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>↓ to {s.destination.split(',')[0]}</div>
                  </td>

                  {/* Progress bar */}
                  <td style={{ padding: '14px 16px', minWidth: '180px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
                      <span>{s.status}</span>
                      <strong style={{ color: '#34d399' }}>{s.progressPercent}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.progressPercent}%`, height: '100%', background: isAgri ? '#10b981' : isMicro ? '#f59e0b' : '#06b6d4', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                      ETA: {s.etaHours > 0 ? `${s.etaHours} Hours` : 'Arrived'}
                    </div>
                  </td>

                  {/* Telemetry / Driver */}
                  <td style={{ padding: '14px 16px' }}>
                    {s.telemetry ? (
                      <div style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 10px', borderRadius: '8px', color: '#34d399' }}>
                        Temp: <strong>{s.telemetry.currentTempC}°C</strong> | Fresh: <strong>{s.telemetry.freshnessIndexPercent}%</strong>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Driver: <strong>{s.driver?.name}</strong> ({s.vehicleNumber})
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => onSelectShipment(s)}
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    >
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
