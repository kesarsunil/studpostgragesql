import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import LoginView from './components/auth/LoginView';
import MaintainerPortal from './components/maintainer/MaintainerPortal';
import FacultyPortal from './components/faculty/FacultyPortal';
import StudentPortal from './components/student/StudentPortal';
import { api } from './services/api';
import { ShieldCheck, UserCheck, GraduationCap, X, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('studp_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [backendStatus, setBackendStatus] = useState({
    postgres_connected: false,
    engine_type: 'Checking...'
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Poll / check backend health on mount
  useEffect(() => {
    async function check() {
      const res = await api.checkHealth();
      setBackendStatus(res.dbInfo || { postgres_connected: false });
    }
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('studp_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('studp_current_user');
  };

  const handleQuickSwitch = async (role) => {
    setIsRoleModalOpen(false);
    let targetEmail = 'admin@attendance.edu';
    let targetPass = 'admin123';

    if (role === 'faculty') {
      targetEmail = 'dr.sharma@attendance.edu';
      targetPass = 'faculty123';
    } else if (role === 'student') {
      targetEmail = 'rahul.kumar@student.edu';
      targetPass = 'student123';
    }

    try {
      const res = await api.login(targetEmail, targetPass, role);
      handleLoginSuccess(res.user);
    } catch (e) {
      console.error('Quick switch error:', e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        backendStatus={backendStatus}
        onLogout={handleLogout}
        onSwitchRole={() => setIsRoleModalOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {!currentUser ? (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {currentUser.role === 'maintainer' && (
              <MaintainerPortal currentUser={currentUser} />
            )}
            {currentUser.role === 'faculty' && (
              <FacultyPortal currentUser={currentUser} />
            )}
            {currentUser.role === 'student' && (
              <StudentPortal currentUser={currentUser} />
            )}
          </>
        )}
      </main>

      {/* Quick Role Switcher Modal */}
      {isRoleModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '28px',
            background: '#131b2e'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Switch Active Portal</h3>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                style={{ background: 'transparent', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Select a portal role to simulate different user experiences:
            </p>

            <div style={{ display: 'grid', gap: '12px' }}>
              <button
                onClick={() => handleQuickSwitch('maintainer')}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left'
                }}
              >
                <div style={{ padding: '8px', borderRadius: '8px', background: '#10b981', color: 'white' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>Maintainer (Admin) Portal</div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Create faculty & students, manage credentials</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickSwitch('faculty')}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left'
                }}
              >
                <div style={{ padding: '8px', borderRadius: '8px', background: '#6366f1', color: 'white' }}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>Faculty (Teacher) Portal</div>
                  <div style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Select courses, mark attendance & view records</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickSwitch('student')}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left'
                }}
              >
                <div style={{ padding: '8px', borderRadius: '8px', background: '#f59e0b', color: 'white' }}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>Student Portal</div>
                  <div style={{ fontSize: '0.75rem', color: '#fcd34d' }}>View attendance %, subject progress, timeline log</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Footer */}
      <footer style={{
        padding: '20px 24px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <span>CampusTrack Attendance Management System • PostgreSQL & FastAPI Architecture</span>
        <div style={{ marginTop: '6px', fontSize: '0.74rem' }}>
          Database scripts ready at <code>/database/schema.sql</code> and <code>/database/seed_data.sql</code>
        </div>
      </footer>

    </div>
  );
}
