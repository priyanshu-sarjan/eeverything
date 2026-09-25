import React, { useState, useEffect } from 'react';
import { Smartphone, Zap, Truck, Bike, BatteryCharging, MapPin, CheckCircle2, ShieldCheck, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

export default function MicroTransitDispatch({ onDispatchMicroTransit }) {
  const [city, setCity] = useState('Bengaluru');
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // Booking Form State
  const [pickupAddress, setPickupAddress] = useState('Koramangala 5th Block, Bengaluru');
  const [dropoffAddress, setDropoffAddress] = useState('Whitefield IT Park, Bengaluru');
  const [itemDescription, setItemDescription] = useState('Fresh Farm Milk & Organic Vegetables Basket');
  const [packageWeightKg, setPackageWeightKg] = useState(15);
  const [distanceKm, setDistanceKm] = useState(14);
  const [needInsulatedBox, setNeedInsulatedBox] = useState(true);

  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Fetch available micro-transit drivers for selected city
  useEffect(() => {
    fetch(`/api/micro-vehicles?city=${encodeURIComponent(city)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableDrivers(data.data);
          if (data.data.length > 0) setSelectedDriver(data.data[0]);
        }
      })
      .catch(() => {});
  }, [city]);

  // Calculate estimated fare
  const basePrice = selectedDriver ? selectedDriver.priceBaseRs : 50;
  const kmPrice = selectedDriver ? selectedDriver.pricePerKmRs : 12;
  const coldBoxFee = needInsulatedBox ? 30 : 0;
  const estimatedFareRs = Math.round(basePrice + (distanceKm * kmPrice) + coldBoxFee);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    setIsBooking(true);

    try {
      const res = await fetch('/api/micro-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: selectedDriver.id,
          pickupAddress,
          dropoffAddress,
          packageWeightKg: parseFloat(packageWeightKg),
          itemDescription
        })
      });
      const data = await res.json();
      setIsBooking(false);

      if (data.success) {
        setBookingResult(data);
        if (onDispatchMicroTransit) onDispatchMicroTransit(data.data);
      }
    } catch (err) {
      setIsBooking(false);
    }
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel glass-panel-glow-amber" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-micro">Tier 4 • Hyperlocal Micro-Transit</span>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Rapido & Uber Freight Dispatch Model</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
              Instant On-Demand Vehicle Dispatch & Last-Mile Delivery
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Book 2-Wheeler EV Bikes, 3-Wheel E-Cargo Rickshaws, Tata Ace Mini-Trucks & E-Loaders with live GPS tracking
            </p>
          </div>

          {/* City Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={18} color="#fbbf24" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '10px',
                padding: '8px 14px',
                color: '#fbbf24',
                fontSize: '0.9rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Bengaluru">Bengaluru Metro</option>
              <option value="Mumbai">Mumbai MMR</option>
              <option value="Delhi NCR">Delhi NCR Region</option>
              <option value="Hyderabad">Hyderabad Metropolitan</option>
              <option value="Kolkata">Kolkata City</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Modal / Result view */}
      {bookingResult ? (
        <div className="glass-panel glass-panel-glow-green" style={{ padding: '32px', textAlign: 'center' }}>
          <CheckCircle2 size={56} color="#34d399" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>Micro-Transit Vehicle Dispatched!</h3>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '6px' }}>
            Driver <strong style={{ color: '#34d399' }}>{bookingResult.driver.name}</strong> ({bookingResult.driver.vehicleType}) is en route to pickup.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '14px', padding: '12px 24px', margin: '20px 0' }}>
            <KeyRound size={22} color="#fbbf24" />
            <span style={{ fontSize: '1.1rem', color: '#fbbf24', fontWeight: 800 }}>
              Delivery OTP Code: {bookingResult.data.otpVerificationCode}
            </span>
          </div>

          <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'left', background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ color: '#94a3b8' }}>Tracking Number:</span>
              <strong style={{ color: '#fff' }}>{bookingResult.data.trackingNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ color: '#94a3b8' }}>Vehicle Number:</span>
              <strong style={{ color: '#fbbf24' }}>{bookingResult.driver.vehicleNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ color: '#94a3b8' }}>Driver Contact:</span>
              <strong style={{ color: '#34d399' }}>{bookingResult.driver.phone}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span style={{ color: '#94a3b8' }}>Est. Arrival:</span>
              <strong style={{ color: '#fff' }}>Within {bookingResult.driver.etaMins} mins</strong>
            </div>
          </div>

          <button className="btn-secondary" onClick={() => setBookingResult(null)} style={{ marginTop: '24px' }}>
            Book Another Micro-Transit Order
          </button>
        </div>
      ) : (
        /* Dispatch Interface */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Driver / Vehicle Selector Cards */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#fbbf24" /> Select Vehicle Tier ({availableDrivers.length} Nearby)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availableDrivers.map(drv => {
                const isSelected = selectedDriver && selectedDriver.id === drv.id;
                return (
                  <div
                    key={drv.id}
                    onClick={() => setSelectedDriver(drv)}
                    className="glass-panel"
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      borderColor: isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(15, 23, 42, 0.75)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {drv.vehicleType.includes('2-Wheel') ? <Bike size={22} color="#fbbf24" /> : <Truck size={22} color="#fbbf24" />}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{drv.vehicleType}</h4>
                          <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Driver: <strong>{drv.name}</strong> • Rating ⭐ {drv.rating}
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>
                          ₹{drv.priceBaseRs} base
                        </span>
                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>+₹{drv.pricePerKmRs}/km</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.75rem' }}>
                      <span style={{ color: '#94a3b8' }}>Payload Limit: <strong>Up to {drv.capacityKg} kg</strong></span>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>⚡ {drv.etaMins} mins away ({drv.locationName.split(',')[0]})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              Dispatch Order Details
            </h3>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pickup Location:</label>
                <input className="form-input" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Dropoff Destination:</label>
                <input className="form-input" value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Commodity / Item Description:</label>
                <input className="form-input" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Weight (Kg):</label>
                  <input type="number" className="form-input" value={packageWeightKg} onChange={(e) => setPackageWeightKg(e.target.value)} min="1" max="1000" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Distance (Km):</label>
                  <input type="number" className="form-input" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} min="1" max="100" />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <input type="checkbox" id="coldBox" checked={needInsulatedBox} onChange={(e) => setNeedInsulatedBox(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
                <label htmlFor="coldBox" style={{ fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  Attach Insulated AgriFresh Cold Box (+₹30 for perishables)
                </label>
              </div>

              {/* Fare Summary Box */}
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '14px', marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>Estimated Instant Fare:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>₹{estimatedFareRs}</span>
                </div>
              </div>

              <button type="submit" className="btn-amber" disabled={isBooking} style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }}>
                {isBooking ? 'Matching Nearby Driver...' : 'Confirm Instant Micro-Transit Dispatch'}
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
