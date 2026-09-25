import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, Leaf, TrendingUp, Award, Thermometer, Clock } from 'lucide-react';

export default function AnalyticsESG({ analyticsData }) {
  // Sample chart dataset for food waste prevention before vs after AgriFresh IoT
  const foodWasteData = [
    { region: 'North (Delhi-NCR)', legacyWastePercent: 34, agriFreshWastePercent: 0.6 },
    { region: 'West (MH-GJ)', legacyWastePercent: 28, agriFreshWastePercent: 0.4 },
    { region: 'South (KA-TN-TS)', legacyWastePercent: 31, agriFreshWastePercent: 0.5 },
    { region: 'East (WB-BH)', legacyWastePercent: 38, agriFreshWastePercent: 0.8 },
  ];

  const pieData = [
    { name: 'Tier 1 Perishables', value: 45, color: '#10b981' },
    { name: 'Tier 2 Pharma Express', value: 20, color: '#a855f7' },
    { name: 'Tier 3 Industrial Bulk', value: 20, color: '#06b6d4' },
    { name: 'Tier 4 Micro-Transit', value: 15, color: '#f59e0b' },
  ];

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* ESG Dashboard Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-agri">National Logistics Analytics & ESG</span>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Zero Food Spoilage Initiative</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
              Impact & Carbon Footprint Reduction Console
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Quantitative measurement of food waste prevented, EV micro-transit carbon offset, and toll green corridor performance
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        
        <div className="glass-panel glass-panel-glow-green" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Prevented Food Spoilage</span>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '8px' }}>
            1,428.5 <span style={{ fontSize: '0.9rem' }}>Tons</span>
          </p>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Fresh Fruits, Veggies & Dairy Saved</span>
        </div>

        <div className="glass-panel glass-panel-glow-cyan" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Carbon Offset (CO₂)</span>
            <Leaf size={20} color="#06b6d4" />
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22d3ee', marginTop: '8px' }}>
            612.4 <span style={{ fontSize: '0.9rem' }}>Tons CO₂</span>
          </p>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Solar Reefer & EV Micro-Transit</span>
        </div>

        <div className="glass-panel glass-panel-glow-amber" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Green Highway Bypass</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '8px' }}>
            -48 <span style={{ fontSize: '0.9rem' }}>Mins Avg</span>
          </p>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>FASTag Green Priority Waves</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>National SLA Health</span>
            <Award size={20} color="#a855f7" />
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '8px' }}>
            98.7%
          </p>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>On-Time Temperature Holding</span>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Food Waste Reduction Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#10b981" /> Post-Harvest Food Loss Comparison (% Spoilage)
          </h3>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={foodWasteData}>
                <XAxis dataKey="region" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="legacyWastePercent" name="Legacy Supply Chain Waste %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="agriFreshWastePercent" name="AgriFresh IoT System Waste %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Tier Distribution Pie Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
            Volume Distribution by Priority Tier
          </h3>

          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
