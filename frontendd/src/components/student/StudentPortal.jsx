import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BookOpen, 
  Calendar, 
  Award, 
  AlertTriangle, 
  Layers, 
  User, 
  Building, 
  Mail, 
  ShieldCheck, 
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

export default function StudentPortal({ currentUser }) {
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects', 'timeline', 'profile'
  const studentId = currentUser?.profile?.student_id || 5;

  const [dashboardData, setDashboardData] = useState({
    student_name: currentUser?.full_name || 'Rahul Kumar',
    roll_number: currentUser?.profile?.roll_number || 'CS2024-001',
    department: currentUser?.profile?.department || 'Computer Science',
    semester: currentUser?.profile?.semester || 4,
    batch: currentUser?.profile?.batch || '2023-2027',
    section: currentUser?.profile?.section || 'A',
    overall_percentage: 88.5,
    total_classes: 12,
    present_count: 10,
    late_count: 1,
    absent_count: 1,
    attendance_status: 'Safe',
    status_color: 'emerald',
    status_message: 'Your attendance is safely above the required 75% threshold.'
  });

  const [subjects, setSubjects] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      try {
        const [dash, subs, logs] = await Promise.all([
          api.getStudentDashboard(studentId),
          api.getStudentCoursesAttendance(studentId),
          api.getStudentHistory(studentId)
        ]);
        setDashboardData(dash);
        setSubjects(subs);
        setHistoryLogs(logs);
      } catch (err) {
        console.error('Error loading student info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [studentId]);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
      
      {/* Student Hero Banner with Gauge */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(99, 102, 241, 0.12))',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        {/* Left info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-amber">Student Academic Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Roll No: <strong style={{ color: '#fcd34d' }}>{dashboardData.roll_number}</strong>
            </span>
          </div>
          <h2 style={{ fontSize: '1.9rem', margin: '0 0 6px 0' }}>Welcome, {dashboardData.student_name}!</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '580px' }}>
            {dashboardData.department} • Semester {dashboardData.semester} • Section {dashboardData.section} (Batch {dashboardData.batch})
          </p>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge badge-${dashboardData.status_color}`} style={{ fontSize: '0.82rem' }}>
              ● Status: {dashboardData.attendance_status}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {dashboardData.status_message}
            </span>
          </div>
        </div>

        {/* Right Gauge / Percentage Card */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '24px 32px',
          textAlign: 'center',
          minWidth: '220px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Attendance
          </span>
          <div style={{
            fontSize: '3.2rem',
            fontWeight: '800',
            fontFamily: 'var(--font-heading)',
            color: dashboardData.overall_percentage >= 75 ? '#34d399' : dashboardData.overall_percentage >= 65 ? '#fbbf24' : '#fb7185',
            lineHeight: 1.1,
            margin: '6px 0'
          }}>
            {dashboardData.overall_percentage}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Min 75% required by college
          </span>
        </div>
      </div>

      {/* 4 Stat Breakdown Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Classes</span>
            <BookOpen size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{dashboardData.total_classes}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Conducted this term</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Attended (Present)</span>
            <CheckCircle2 size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#34d399' }}>{dashboardData.present_count}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Full attendance earned</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Late Arrivals</span>
            <Clock size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fbbf24' }}>{dashboardData.late_count}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Partial credit</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Absences</span>
            <XCircle size={18} color="#fb7185" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fb7185' }}>{dashboardData.absent_count}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Classes missed</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
        <button
          onClick={() => setActiveTab('subjects')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'subjects' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'subjects' ? '600' : '500',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--border-color)'
          }}
        >
          <BookOpen size={16} />
          <span>Subject-wise Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'timeline' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'timeline' ? '600' : '500',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--border-color)'
          }}
        >
          <Calendar size={16} />
          <span>Day-by-Day Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'profile' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'profile' ? '600' : '500',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--border-color)'
          }}
        >
          <User size={16} />
          <span>My Profile & Credentials</span>
        </button>
      </div>

      {/* TAB 1: SUBJECT BREAKDOWN */}
      {activeTab === 'subjects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          {subjects.map(sub => (
            <div key={sub.course_id} className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span className="badge badge-primary">{sub.course_code}</span>
                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.05rem' }}>{sub.course_name}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Instructor: {sub.faculty_name} • {sub.credits} Credits
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.6rem',
                    fontWeight: '800',
                    color: sub.percentage >= 75 ? '#34d399' : sub.percentage >= 65 ? '#fbbf24' : '#fb7185'
                  }}>
                    {sub.percentage}%
                  </div>
                  <span className={`badge badge-${sub.badge_color}`} style={{ fontSize: '0.68rem' }}>
                    {sub.badge}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                margin: '16px 0 12px 0'
              }}>
                <div style={{
                  width: `${Math.min(sub.percentage, 100)}%`,
                  height: '100%',
                  background: sub.percentage >= 75 
                    ? 'linear-gradient(90deg, #10b981, #34d399)' 
                    : sub.percentage >= 65 
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                    : 'linear-gradient(90deg, #f43f5e, #fb7185)'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>Present: <strong style={{ color: '#34d399' }}>{sub.present_count}</strong></span>
                <span>Late: <strong style={{ color: '#fbbf24' }}>{sub.late_count}</strong></span>
                <span>Absent: <strong style={{ color: '#fb7185' }}>{sub.absent_count}</strong></span>
                <span>Total: <strong>{sub.total_classes} Classes</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: DAY-BY-DAY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 18px 0', fontSize: '1.1rem' }}>
            Day-by-Day Attendance History Log
          </h4>

          {historyLogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No lecture sessions marked for you yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '12px 14px' }}>DATE & TIME</th>
                    <th style={{ padding: '12px 14px' }}>COURSE & TOPIC</th>
                    <th style={{ padding: '12px 14px' }}>INSTRUCTOR</th>
                    <th style={{ padding: '12px 14px' }}>LOCATION</th>
                    <th style={{ padding: '12px 14px' }}>ATTENDANCE STATUS</th>
                    <th style={{ padding: '12px 14px' }}>REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLogs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.86rem' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '600' }}>{log.date}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.time}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-primary">{log.course_code}</span>
                          <span style={{ fontWeight: '500' }}>{log.topic || 'Class Lecture'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                        {log.faculty_name}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {log.room_number || 'Main Lab'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {log.status === 'present' && (
                          <span className="badge badge-emerald">
                            <CheckCircle2 size={12} /> Present
                          </span>
                        )}
                        {log.status === 'late' && (
                          <span className="badge badge-amber">
                            <Clock size={12} /> Late
                          </span>
                        )}
                        {log.status === 'absent' && (
                          <span className="badge badge-rose">
                            <XCircle size={12} /> Absent
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {log.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDENT PROFILE & CREDENTIALS */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white'
              }}>
                {dashboardData.student_name.charAt(0)}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem' }}>{dashboardData.student_name}</h3>
                <div style={{ color: '#fcd34d', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                  {dashboardData.roll_number}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Email</span>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>{currentUser?.email || 'rahul.kumar@student.edu'}</div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Department</span>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>{dashboardData.department}</div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Semester</span>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>Semester {dashboardData.semester} (Sec {dashboardData.section})</div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Batch</span>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>{dashboardData.batch}</div>
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '14px 18px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <ShieldCheck size={20} color="#34d399" />
              <div style={{ fontSize: '0.82rem', color: '#34d399' }}>
                Account verified and officially enrolled by Maintainer. Attendance logged in real-time.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
