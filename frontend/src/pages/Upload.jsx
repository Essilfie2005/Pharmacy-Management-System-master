import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import '../index.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'text/csv') {
      setFile(selected);
      setStatus('idle');
    } else {
      setFile(null);
      setStatus('error');
      setMessage('Please select a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setMessage('Processing records through XGBoost AI Model...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage(`Successfully ingested and scored ${data.inserted} student records!`);
        setFile(null);
      } else {
        setStatus('error');
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error while connecting to the AI backend.');
    }
  };

  const handleReset = async () => {
    if(window.confirm("Are you sure you want to wipe all records from the database?")) {
      try {
        const res = await fetch(`${apiUrl}/api/reset`, { method: 'DELETE' });
        if(res.ok) alert("Database wiped successfully. You can now upload a fresh CSV.");
      } catch(e) {
        alert("Failed to reset database.");
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', marginBottom: '10px' }}>Data Ingestion Pipeline</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Upload your university registry CSV to score student dropout risk.</p>

      <div 
        style={{
          border: '2px dashed var(--glass-border)',
          borderRadius: '16px',
          padding: '50px 20px',
          background: 'rgba(0,0,0,0.2)',
          marginBottom: '30px',
          position: 'relative'
        }}
      >
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'
          }} 
        />
        
        {file ? (
          <div>
            <FileText size={48} color="var(--primary)" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ marginBottom: '10px' }}>{file.name}</h3>
            <p style={{ color: 'var(--text-muted)' }}>Ready for processing</p>
          </div>
        ) : (
          <div>
            <UploadCloud size={48} color="var(--text-muted)" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ marginBottom: '10px' }}>Drag & Drop your CSV here</h3>
            <p style={{ color: 'var(--text-muted)' }}>Must include: student_id, attendance_rate, quiz_average, assignment_rate, mobile_engagement, financial_aid</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button 
          className="alert-btn" 
          style={{ background: 'var(--primary)', opacity: (!file || status === 'uploading') ? 0.5 : 1, padding: '12px 30px', fontSize: '1rem' }}
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
        >
          {status === 'uploading' ? 'Analyzing...' : 'Run AI Scoring Pipeline'}
        </button>
        
        <button 
          className="alert-btn" 
          style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px 30px', fontSize: '1rem' }}
          onClick={handleReset}
        >
          Wipe Database
        </button>
      </div>

      {status === 'success' && (
        <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} /> {message}
        </div>
      )}
      
      {status === 'error' && (
        <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <AlertCircle size={20} /> {message}
        </div>
      )}
    </div>
  );
}

export default Upload;
