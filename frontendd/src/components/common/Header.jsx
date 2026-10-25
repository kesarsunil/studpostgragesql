import React from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Database, 
  LogOut, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function Header({ currentUser, backendStatus, onLogout, onSwitchRole }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'maintainer':
        return (
          <span className="badge badge-emerald">
            <ShieldCheck size={14} /> Maintainer / Admin
          </span>
        );
      case 'faculty':
        return (
          <span className="badge badge-primary">
            <UserCheck size={14} /> Faculty Member
          </span>
        );
      case 'student':
        return (
          <span className="badge badge-amber">
            <GraduationCap size={14} /> Student Portal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '14px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Layers size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>
                CampusTrack <span style={{ color: '#818cf8', fontWeight: '400', fontSize: '0.9rem' }}>| Attendance Pro</span>
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Next-Gen Academic Attendance & Student Performance Management
            </p>
          </div>
        </div>

        {/* Status & User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Database / Backend Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: backendStatus.postgres_connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${backendStatus.postgres_connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            fontSize: '0.78rem',
            color: backendStatus.postgres_connected ? '#34d399' : '#a5b4fc'
          }}>
            <Database size={14} />
            <span>
              {backendStatus.postgres_connected ? 'PostgreSQL Active' : 'PostgreSQL Ready (Local Sync)'}
            </span>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendStatus.postgres_connected ? '#10b981' : '#6366f1',
              boxShadow: backendStatus.postgres_connected ? '0 0 8px #10b981' : '0 0 8px #6366f1'
            }} />
          </div>

          {/* User Profile Info */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.full_name}`}
                alt={currentUser.full_name}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.15)'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {currentUser.full_name}
                </span>
                <div>{getRoleBadge(currentUser.role)}</div>
              </div>

              {/* Switch Role Quick Button */}
              <button
                onClick={onSwitchRole}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Switch between Maintainer, Faculty, and Student"
              >
                <Sparkles size={14} color="#818cf8" />
                <span>Switch Portal</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '500',
                  color: '#fb7185',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
