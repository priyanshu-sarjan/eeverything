import React from 'react';
import { X, Thermometer, ShieldCheck, Zap, Lock, MapPin, Truck, Phone, User, Activity, AlertTriangle } from 'lucide-react';

export default function ShipmentDetailModal({ shipment, onClose, onActivateBooster }) {
  if (!shipment) return null;

  const t = shipment.telemetry;
  const isAgri = shipment.tier.includes('Tier 1');
  const isMicro = shipment.tier.includes('Tier 4');

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ maxWidth: '680px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className={`badge ${isAgri ? 'badge-agri' : isMicro ? 'badge-micro' : 'badge-iot'}`}>
              {shipment.tier}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
              {shipment.priorityLevel}
            </span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            {shipment.commodity}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Tracking ID: <strong style={{ color: '#fff' }}>{shipment.id}</strong> ({shipment.trackingNumber})
          </p>
        </div>

        {/* Status Progress */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
            <span>Status: <strong style={{ color: '#fff' }}>{shipment.status}</strong></span>
            <span>Progress: <strong style={{ color: '#34d399' }}>{shipment.progressPercent}%</strong></span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${shipment.progressPercent}%`, height: '100%', background: isAgri ? '#10b981' : isMicro ? '#f59e0b' : '#06b6d4' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
            <span>Origin: {shipment.origin}</span>
            <span>Destination: {shipment.destination}</span>
          </div>
        </div>

        {/* IoT Telemetry Inspector Grid (If Applicable) */}
        {t && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} /> Live Reefer IoT Telemetry ({t.containerId})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reefer Temperature</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                  {t.currentTempC}°C <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(Target {t.targetTempC}°C)</span>
                </p>
              </div>

              <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ethylene Ripening Gas</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22d3ee', marginTop: '2px' }}>
                  {t.ethylenePpm} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ppm</span>
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Freshness Quality Score</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  {t.freshnessIndexPercent}%
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Est. Shelf Life Remaining</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                  {t.estimatedFreshnessHoursRemaining} Hours
                </p>
              </div>
            </div>

            <button 
              className="btn-amber"
              onClick={() => onActivateBooster(shipment.id)}
              style={{ width: '100%', marginTop: '14px', justifyContent: 'center', padding: '10px' }}
            >
              <Zap size={16} /> Trigger Sub-Zero Nitrogen Booster Cooling
            </button>
          </div>
        )}

        {/* Driver & Transporter Information */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
            Driver & Fleet Vehicle Info
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>
                {shipment.driver?.name} (Rating ⭐ {shipment.driver?.rating})
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Vehicle: <strong>{shipment.vehicleNumber}</strong> • {shipment.transporterName}
              </p>
            </div>
            <a 
              href={`tel:${shipment.driver?.phone}`} 
              className="btn-secondary"
              style={{ fontSize: '0.78rem', textDecoration: 'none', padding: '8px 12px' }}
            >
              <Phone size={14} /> {shipment.driver?.phone}
            </a>
          </div>
        </div>

        {/* Delivery OTP verification Code if Micro-Transit */}
        {shipment.otpVerificationCode && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '14px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Delivery Handoff Security OTP:</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.1em', marginTop: '2px' }}>
              {shipment.otpVerificationCode}
            </div>
          </div>
        )}

        <button className="btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
          Close Inspector Window
        </button>

      </div>
    </div>
  );
}
