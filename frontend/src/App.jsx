import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Roster from './pages/Roster';
import Upload from './pages/Upload';
import './index.css';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
        
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/roster" element={<Roster />} />
              <Route path="/upload" element={<Upload />} />
            </Routes>
            
          </div>
        </main>

      </div>
    </Router>
  );
}

export default App;
