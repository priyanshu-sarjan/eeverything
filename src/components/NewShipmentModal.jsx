import React, { useState } from 'react';
import { X, Truck, Thermometer, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

export default function NewShipmentModal({ isOpen, onClose, onCreateShipment }) {
  const [commodity, setCommodity] = useState('Nashik Premium Grapes (Grade A)');
  const [quantity, setQuantity] = useState('12.0 Metric Tons');
  const [origin, setOrigin] = useState('Nashik APMC Mandi, Maharashtra');
  const [destination, setDestination] = useState('Azadpur Mandi, Delhi NCR');
  const [isPerishable, setIsPerishable] = useState(true);
  const [cargoValueRs, setCargoValueRs] = useState('18,50,000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onCreateShipment({
      commodity,
      quantity,
      origin,
      destination,
      isPerishable,
      cargoValueRs
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel glass-panel-glow-green" style={{ maxWidth: '540px', width: '100%', padding: '28px', position: 'relative' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={22} color="#34d399" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Dispatch National Freight Shipment</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Automated priority classification & IoT Reefer pairing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Commodity Name:</label>
            <input className="form-input" value={commodity} onChange={(e) => setCommodity(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Quantity / Tonnage:</label>
              <input className="form-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Declared Value (₹):</label>
              <input className="form-input" value={cargoValueRs} onChange={(e) => setCargoValueRs(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Origin Supply Hub:</label>
            <input className="form-input" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Destination Demand Hub:</label>
            <input className="form-input" value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="perishableCheck" checked={isPerishable} onChange={(e) => setIsPerishable(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
              <label htmlFor="perishableCheck" style={{ fontSize: '0.88rem', color: '#34d399', fontWeight: 700, cursor: 'pointer' }}>
                Perishable / High Maintenance Commodity (AgriFresh IoT Tier 1)
              </label>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', marginLeft: '28px' }}>
              Automatically provisions Solar-Powered Reefer Container with Ethylene Gas Scrubbing & Green Highway Toll Bypass.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1, justifyContent: 'center' }}>
              {isSubmitting ? 'Provisioning IoT Reefer...' : 'Confirm Shipment Dispatch'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
