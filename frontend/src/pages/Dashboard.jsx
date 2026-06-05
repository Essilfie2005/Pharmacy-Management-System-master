import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import '../index.css';

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${apiUrl}/api/students`)
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return <div style={{padding: '40px'}}>Loading metrics...</div>;
  if (students.length === 0) return (
    <div style={{padding: '40px', textAlign: 'center'}}>
      <h2 style={{fontFamily: 'Outfit', fontSize: '2rem'}}>Dashboard is Empty</h2>
      <p style={{color: 'var(--text-muted)', marginTop: '10px'}}>Head over to the Data Ingestion page to upload student records.</p>
    </div>
  );

  const atRiskCount = students.filter(s => s.is_flagged).length;
  
  const riskData = [
    { name: 'Critical (>80%)', count: students.filter(s => s.risk_score > 0.8).length, fill: '#ef4444' },
    { name: 'High (50-80%)', count: students.filter(s => s.risk_score > 0.5 && s.risk_score <= 0.8).length, fill: '#f97316' },
    { name: 'Moderate (30-50%)', count: students.filter(s => s.risk_score > 0.3 && s.risk_score <= 0.5).length, fill: '#eab308' },
    { name: 'Low (<30%)', count: students.filter(s => s.risk_score <= 0.3).length, fill: '#10b981' }
  ];

  return (
    <div>
      <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', marginBottom: '20px' }}>Cohort Overview</h2>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '15px', borderRadius: '12px' }}>
            <Users size={28} color="#6366f1" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Students</p>
            <h3 style={{ fontSize: '1.8rem', fontFamily: 'Outfit' }}>{students.length}</h3>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '15px', borderRadius: '12px' }}>
            <AlertTriangle size={28} color="#ef4444" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>At Risk (Flagged)</p>
            <h3 style={{ fontSize: '1.8rem', fontFamily: 'Outfit', color: '#ef4444' }}>{atRiskCount}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: '12px' }}>
            <CheckCircle size={28} color="#10b981" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>On Track</p>
            <h3 style={{ fontSize: '1.8rem', fontFamily: 'Outfit', color: '#10b981' }}>{students.length - atRiskCount}</h3>
          </div>
        </div>
      </div>

      <section className="glass-panel" style={{ padding: '30px' }}>
        <h3 style={{ fontFamily: 'Outfit', marginBottom: '20px' }}>Risk Distribution Heatmap</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={riskData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {riskData.map((entry, index) => (
                  <cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
