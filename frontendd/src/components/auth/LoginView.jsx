import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Info,
  CheckCircle2,
  Database
} from 'lucide-react';
import { api } from '../../services/api';

export default function LoginView({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('maintainer');
  const [email, setEmail] = useState('admin@attendance.edu');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick preset autofills for instantaneous testing
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'maintainer') {
      setEmail('admin@attendance.edu');
      setPassword('admin123');
    } else if (role === 'faculty') {
      setEmail('dr.sharma@attendance.edu');
      setPassword('faculty123');
    } else if (role === 'student') {
      setEmail('rahul.kumar@student.edu');
      setPassword('student123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email, password, selectedRole);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '36px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)'
      }}>

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '14px'
          }}>
            <Sparkles size={14} /> Multi-Role Attendance Portal
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px 0' }}>Sign In to CampusTrack</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Select your assigned portal role to access your dashboard
          </p>
        </div>

        {/* 3 Role Selection Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '6px',
          borderRadius: '14px',
          marginBottom: '26px'
        }}>
          <button
            type="button"
            onClick={() => handleRoleSelect('maintainer')}
            style={{
              padding: '10px 8px',
              borderRadius: '10px',
              background: selectedRole === 'maintainer' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: selectedRole === 'maintainer' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: selectedRole === 'maintainer' ? '600' : '500',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              boxShadow: selectedRole === 'maintainer' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            <ShieldCheck size={18} />
            <span>Maintainer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('faculty')}
            style={{
              padding: '10px 8px',
              borderRadius: '10px',
              background: selectedRole === 'faculty' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: selectedRole === 'faculty' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: selectedRole === 'faculty' ? '600' : '500',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              boxShadow: selectedRole === 'faculty' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            <UserCheck size={18} />
            <span>Faculty</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            style={{
              padding: '10px 8px',
              borderRadius: '10px',
              background: selectedRole === 'student' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: selectedRole === 'student' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: selectedRole === 'student' ? '600' : '500',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              boxShadow: selectedRole === 'student' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
            }}
          >
            <GraduationCap size={18} />
            <span>Student</span>
          </button>
        </div>

        {/* Role Explanation Callout */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <Info size={16} color="#818cf8" style={{ flexShrink: 0 }} />
          <span>
            {selectedRole === 'maintainer' && 'Maintainer adds faculty & students with credentials and manages courses.'}
            {selectedRole === 'faculty' && 'Faculty members view assigned courses, take attendance, and review session stats.'}
            {selectedRole === 'student' && 'Students log in with credentials provided by the Maintainer to view attendance %.'}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.84rem',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@attendance.edu"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Switcher Banner */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
            ⚡ Instant 1-Click Demo Accounts:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleRoleSelect('maintainer')}
              style={{
                padding: '6px 4px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                background: 'rgba(16, 185, 129, 0.08)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              Admin (admin@...)
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('faculty')}
              style={{
                padding: '6px 4px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                background: 'rgba(99, 102, 241, 0.08)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              Faculty (dr.sharma@...)
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              style={{
                padding: '6px 4px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                background: 'rgba(245, 158, 11, 0.08)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              Student (rahul.kumar@...)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
