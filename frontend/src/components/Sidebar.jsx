import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UploadCloud, ShieldAlert } from 'lucide-react';
import '../index.css';

function Sidebar() {
  return (
    <aside className="glass-panel" style={{ 
      width: '260px', 
      height: 'calc(100vh - 60px)', 
      position: 'sticky', 
      top: '30px',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      <div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert color="var(--primary)" />
          Dropout Predictor
        </h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <NavLink 
          to="/" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/roster" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Users size={20} />
          Student Roster
        </NavLink>

        <NavLink 
          to="/upload" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <UploadCloud size={20} />
          Data Ingestion
        </NavLink>
      </nav>
      
      <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        v2.0 (Multi-Page SaaS)
      </div>
    </aside>
  );
}

export default Sidebar;
