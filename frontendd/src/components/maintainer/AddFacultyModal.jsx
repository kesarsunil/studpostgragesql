import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Building, IdCard, Phone, Briefcase } from 'lucide-react';

export default function AddFacultyModal({ isOpen, onClose, onFacultyAdded }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onFacultyAdded({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        employee_id: employeeId.trim(),
        department,
        designation,
        phone: phone.trim()
      });
      onClose();
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setEmployeeId('');
      setPhone('');
    } catch (err) {
      setError(err.message || 'Failed to add faculty member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '30px',
        background: '#131b2e',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={20} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Add Faculty Member</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Create instructor credentials for portal login
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.12)',
            color: '#fb7185',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Employee ID *
              </label>
              <input
                type="text"
                required
                placeholder="EMP-CS-105"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Faculty Email (Login ID) *
              </label>
              <input
                type="email"
                required
                placeholder="faculty@attendance.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Password (Login Credential) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. faculty123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a2238',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.88rem'
                }}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Designation
              </label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a2238',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.88rem'
                }}
              >
                <option value="Professor & HOD">Professor & HOD</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Contact Phone (Optional)
            </label>
            <input
              type="text"
              placeholder="+1-555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                fontSize: '0.86rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.86rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Faculty Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
