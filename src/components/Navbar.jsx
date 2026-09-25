import React from 'react';
import { Truck, ShieldCheck, Zap, Activity, Plus, Smartphone, Radio } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewShipment, onOpenMicroDispatch, isLiveStreamConnected }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('overview')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Truck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #a7f3d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                BharatLogistics
              </span>
              <span className="badge badge-agri" style={{ fontSize: '0.65rem' }}>AgriFresh IoT</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Unified Multi-Tier India Transit & Last-Mile Network
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{
              background: activeTab === 'overview' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'overview' ? '#34d399' : '#94a3b8',
              border: activeTab === 'overview' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Activity size={16} /> Overview & Map
          </button>

          <button 
            onClick={() => setActiveTab('agrifresh')}
            style={{
              background: activeTab === 'agrifresh' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'agrifresh' ? '#34d399' : '#94a3b8',
              border: activeTab === 'agrifresh' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={16} /> AgriFresh IoT Console
          </button>

          <button 
            onClick={() => setActiveTab('micro')}
            style={{
              background: activeTab === 'micro' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'micro' ? '#fbbf24' : '#94a3b8',
              border: activeTab === 'micro' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Smartphone size={16} /> Micro-Transit (Rapido/Uber)
          </button>

          <button 
            onClick={() => setActiveTab('shipments')}
            style={{
              background: activeTab === 'shipments' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'shipments' ? '#22d3ee' : '#94a3b8',
              border: activeTab === 'shipments' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Truck size={16} /> Shipments Directory
          </button>
        </nav>

        {/* Status indicator & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.7)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span className={`pulse-dot ${isLiveStreamConnected ? 'pulse-dot-green' : 'pulse-dot-amber'}`}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isLiveStreamConnected ? '#34d399' : '#fbbf24' }}>
              {isLiveStreamConnected ? 'IoT Live Stream Active' : 'Connecting Stream...'}
            </span>
          </div>

          <button className="btn-amber" onClick={onOpenMicroDispatch} style={{ fontSize: '0.82rem', padding: '8px 12px' }}>
            <Zap size={15} /> Book Micro-Transit
          </button>

          <button className="btn-primary" onClick={onOpenNewShipment} style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
            <Plus size={16} /> Dispatch Freight
          </button>
        </div>

      </div>
    </header>
  );
}
