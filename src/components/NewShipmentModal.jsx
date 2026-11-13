import React, { useState, useEffect } from 'react';
import { X, Truck, Thermometer, ShieldCheck, Plus, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { REAL_INDIAN_CROPS } from '../../server/data/realCropDataset.js';

export default function NewShipmentModal({ isOpen, onClose, onCreateShipment, initialCrop = null }) {
  const [selectedCropId, setSelectedCropId] = useState('');
  const [commodity, setCommodity] = useState('Ratnagiri Alphonso Mango (Hapus)');
  const [quantity, setQuantity] = useState('14.0 Metric Tons');
  const [origin, setOrigin] = useState('Ratnagiri APMC Mandi, Maharashtra');
  const [destination, setDestination] = useState('Azadpur Mandi, Delhi NCR');
  const [isPerishable, setIsPerishable] = useState(true);
  const [cargoValueRs, setCargoValueRs] = useState('25,90,000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If opened with a preselected crop from the dataset explorer
  useEffect(() => {
    if (initialCrop) {
      applyCropData(initialCrop);
    }
  }, [initialCrop, isOpen]);

  const applyCropData = (crop) => {
    setSelectedCropId(crop.id);
    setCommodity(`${crop.name} (${crop.variety})`);
    setOrigin(`${crop.primaryMandi}, ${crop.state}`);
    setDestination(crop.destinationHub);
    setIsPerishable(crop.category === 'Fruits' || crop.category === 'Vegetables' || crop.category === 'Dairy');
    
    const approxTons = 12.0;
    setQuantity(`${approxTons} Metric Tons`);
    const val = Math.round(crop.wholesalePriceRsQuintal * approxTons * 10);
    setCargoValueRs(val.toLocaleString('en-IN'));
  };

  const handleSelectCropChange = (e) => {
    const cropId = e.target.value;
    setSelectedCropId(cropId);
    const found = REAL_INDIAN_CROPS.find(c => c.id === cropId);
    if (found) {
      applyCropData(found);
    }
  };

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
      <div className="glass-panel glass-panel-glow-green" style={{ maxWidth: '580px', width: '100%', padding: '28px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={22} color="#34d399" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Dispatch National Freight Shipment</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Automated priority classification & IoT Reefer pairing from Real Indian Datasets</p>
          </div>
        </div>

        {/* Quick Fill from Real Indian Crops Dataset */}
        <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
          <label style={{ fontSize: '0.78rem', color: '#facc15', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} /> Quick Auto-Fill from Real Indian Crops (Data.gov.in / Agmarknet):
          </label>
          <select
            value={selectedCropId}
            onChange={handleSelectCropChange}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Choose a Verified Crop from Mandi Dataset --</option>
            {REAL_INDIAN_CROPS.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.primaryMandi} ({c.state}) [₹{c.wholesalePriceRsKg}/kg]
              </option>
            ))}
          </select>
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
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Origin Supply Hub / Mandi:</label>
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
                Perishable / High Maintenance Produce (AgriFresh IoT Tier 1)
              </label>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', marginLeft: '28px', marginBottom: 0 }}>
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
