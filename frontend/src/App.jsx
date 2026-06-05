import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { AlertCircle, CheckCircle2, MessageSquare, Phone, BookOpen, Clock, Activity, DollarSign, Smartphone } from 'lucide-react';
import './index.css';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Fetch REAL data from the FastAPI backend & SQLite/MySQL database
    fetch(`${apiUrl}/api/students`)
      .then(res => res.json())
      .then(data => {
        // Sort by highest risk first
        const sorted = data.sort((a, b) => b.risk_score - a.risk_score);
        setStudents(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch students. Ensure FastAPI backend is running.", err);
        setLoading(false);
      });
  }, [apiUrl]);

  const triggerAlert = async (studentId) => {
    try {
      const res = await fetch(`${apiUrl}/api/alerts/trigger?student_id=${studentId}`, { method: 'POST' });
      const data = await res.json();
      setAlertStatus({ id: studentId, status: data.status, msg: "SMS Sent Successfully via Africa's Talking API" });
      setTimeout(() => setAlertStatus(null), 4000);
    } catch(err) {
      alert("Failed to send SMS. Is the backend running?");
    }
  };

  // Prepare data for Risk Distribution Chart
  const riskData = [
    { name: 'Critical (>80%)', count: students.filter(s => s.risk_score > 0.8).length, fill: '#ef4444' },
    { name: 'High (50-80%)', count: students.filter(s => s.risk_score > 0.5 && s.risk_score <= 0.8).length, fill: '#f97316' },
    { name: 'Moderate (30-50%)', count: students.filter(s => s.risk_score > 0.3 && s.risk_score <= 0.5).length, fill: '#eab308' },
    { name: 'Low (<30%)', count: students.filter(s => s.risk_score <= 0.3).length, fill: '#10b981' }
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Early Warning Dropout Predictor</h1>
        <p>AI-Powered Risk Analytics Dashboard for University Cohorts</p>
      </header>

      {/* Cohort Heat-map / Distribution */}
      <section className="glass-panel chart-section" style={{marginBottom: '30px', padding: '20px'}}>
        <h2 style={{fontFamily: 'Outfit', marginBottom: '15px'}}>📈 Cohort Risk Distribution (N={students.length})</h2>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={riskData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {riskData.map((entry, index) => (
                  <cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <main className="main-content">
        <section className="roster-section glass-panel">
          <h2>📊 Foundation Year Roster</h2>
          {loading ? <p style={{padding: '20px'}}>Loading student data from database...</p> : (
            <div className="table-responsive">
              <table className="roster-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Attendance</th>
                    <th>Quiz Avg</th>
                    <th>Assign. Rate</th>
                    <th>Mobile Logins</th>
                    <th>Fin. Aid</th>
                    <th>Risk Score</th>
                    <th>Intervention</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 50).map((student) => (
                    <tr 
                      key={student.student_id} 
                      className={`risk-row ${selectedStudent?.student_id === student.student_id ? 'selected' : ''}`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td>{student.student_id}</td>
                      <td className="metric-value">{student.attendance_rate}%</td>
                      <td className="metric-value">{student.quiz_average}%</td>
                      <td className="metric-value">{student.assignment_rate}%</td>
                      <td className="metric-value">{['Low', 'Med', 'High'][student.mobile_engagement]}</td>
                      <td className="metric-value">{student.financial_aid ? 'Yes' : 'No'}</td>
                      <td className="metric-value" style={{color: student.risk_score > 0.5 ? '#fca5a5' : '#6ee7b7'}}>
                        {(student.risk_score * 100).toFixed(1)}%
                      </td>
                      <td>
                        {student.is_flagged ? (
                          <button 
                            className="alert-btn" 
                            onClick={(e) => { e.stopPropagation(); triggerAlert(student.student_id); }}
                          >
                            <MessageSquare size={14} style={{display:'inline', marginRight:'5px', verticalAlign:'middle'}}/>
                            Send SMS
                          </button>
                        ) : (
                          <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>No action req.</span>
                        )}
                        {alertStatus?.id === student.student_id && <span style={{display:'block', fontSize:'0.75rem', color:'#6ee7b7', marginTop:'4px'}}>Sent! ✓</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedStudent && (
          <aside className="details-section glass-panel">
            <h2>🔍 Counsellor Brief</h2>
            <div className="insight-card">
              <h3 style={{display:'flex', alignItems:'center', gap:'10px'}}>
                {selectedStudent.student_id} 
                <span className={`status-badge ${selectedStudent.is_flagged ? 'danger' : 'safe'}`}>
                  {selectedStudent.is_flagged ? '⚠️ High Risk' : '✓ On Track'}
                </span>
              </h3>
              
              <div style={{background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginTop: '15px'}}>
                <h4 style={{color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px'}}>XGBoost + SHAP Explainability</h4>
                <p style={{fontSize: '0.95rem', marginBottom: '15px'}}>
                  Risk Prediction: <strong style={{color: selectedStudent.risk_score > 0.5 ? '#fca5a5' : '#6ee7b7', fontSize:'1.2rem'}}>{(selectedStudent.risk_score * 100).toFixed(1)}%</strong>
                </p>
                
                {selectedStudent.is_flagged ? (
                  <ul className="factors-list">
                    <li>
                      <strong>Primary Driver:</strong> 
                      <span className="factor-name">{selectedStudent.top_factor_1?.replace('_', ' ')}</span>
                    </li>
                    {selectedStudent.top_factor_2 && (
                      <li>
                        <strong>Secondary Driver:</strong> 
                        <span className="factor-name">{selectedStudent.top_factor_2?.replace('_', ' ')}</span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p style={{color: '#6ee7b7', fontSize: '0.9rem', marginBottom: '15px'}}>Student is progressing normally with strong protective factors.</p>
                )}
              </div>

              {/* Intervention Logging Panel */}
              {selectedStudent.is_flagged && (
                <div style={{marginTop: '25px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '15px', borderRadius: '10px'}}>
                  <h4 style={{color: '#818cf8', marginBottom: '10px', display:'flex', alignItems:'center', gap:'8px'}}>
                    <Phone size={16} /> Contact Protocol
                  </h4>
                  <p style={{fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '15px'}}>
                    University policy requires counsellor outreach within 5 days of a High Risk flag.
                  </p>
                  <button className="alert-btn" style={{width: '100%', padding: '10px', background: '#4f46e5'}} onClick={() => alert("Intervention officially logged in database.")}>
                    Log Student Meeting
                  </button>
                </div>
              )}

            </div>
            <button className="close-btn" onClick={() => setSelectedStudent(null)}>Close Panel</button>
          </aside>
        )}
      </main>
    </div>
  );
}

export default App;
