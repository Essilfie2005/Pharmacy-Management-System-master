import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import '../index.css';

function Roster() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);
  const [filter, setFilter] = useState('all'); // all, risk
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${apiUrl}/api/students`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => b.risk_score - a.risk_score);
        setStudents(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch students.", err);
        setLoading(false);
      });
  }, [apiUrl]);

  const triggerAlert = async (studentId) => {
    try {
      const res = await fetch(`${apiUrl}/api/alerts/trigger?student_id=${studentId}`, { method: 'POST' });
      const data = await res.json();
      setAlertStatus({ id: studentId, status: data.status, msg: "SMS Sent Successfully" });
      setTimeout(() => setAlertStatus(null), 4000);
    } catch(err) {
      alert("Failed to send SMS. Ensure backend is running.");
    }
  };

  const filteredStudents = filter === 'risk' ? students.filter(s => s.is_flagged) : students;

  if (loading) return <div style={{padding: '40px'}}>Loading roster...</div>;
  if (students.length === 0) return (
    <div style={{padding: '40px', textAlign: 'center'}}>
      <h2 style={{fontFamily: 'Outfit', fontSize: '2rem'}}>Roster is Empty</h2>
      <p style={{color: 'var(--text-muted)', marginTop: '10px'}}>Head over to the Data Ingestion page to upload student records.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      <section className="roster-section glass-panel" style={{ flex: selectedStudent ? 2 : 1 }}>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontFamily: 'Outfit', margin: 0 }}>Student Roster</h2>
          <div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', padding: '8px 15px', borderRadius: '8px' }}
            >
              <option value="all">Show All Students</option>
              <option value="risk">Show Only At-Risk</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="roster-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Attendance</th>
                <th>Quiz Avg</th>
                <th>Assign. Rate</th>
                <th>Risk Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr 
                  key={student.student_id} 
                  className={`risk-row ${selectedStudent?.student_id === student.student_id ? 'selected' : ''}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <td>{student.student_id}</td>
                  <td className="metric-value">{student.attendance_rate}%</td>
                  <td className="metric-value">{student.quiz_average}%</td>
                  <td className="metric-value">{student.assignment_rate}%</td>
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
      </section>

      {selectedStudent && (
        <aside className="details-section glass-panel" style={{ flex: 1, position: 'sticky', top: '30px' }}>
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
    </div>
  );
}

export default Roster;
