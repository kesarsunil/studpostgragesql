import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  UserPlus, 
  Trash2, 
  Search, 
  CheckCircle, 
  ShieldAlert,
  Mail,
  Key,
  Calendar,
  Building,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import AddFacultyModal from './AddFacultyModal';
import AddStudentModal from './AddStudentModal';

export default function MaintainerPortal({ currentUser }) {
  const [activeTab, setActiveTab] = useState('faculty'); // 'faculty', 'students', 'courses'
  const [stats, setStats] = useState({
    total_faculty: 0,
    total_students: 0,
    total_courses: 0,
    avg_attendance_rate: 88.5
  });
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, f, st, c] = await Promise.all([
        api.getMaintainerStats(),
        api.listFaculty(),
        api.listStudents(),
        api.listCourses()
      ]);
      setStats(s);
      setFacultyList(f);
      setStudentList(st);
      setCourseList(c);
    } catch (e) {
      console.error('Error loading maintainer data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddFaculty = async (payload) => {
    const res = await api.addFaculty(payload);
    showToast(`Faculty "${payload.full_name}" registered! They can now log in using "${payload.email}".`);
    await loadData();
  };

  const handleDeleteFaculty = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete faculty ${name}?`)) {
      await api.deleteFaculty(id);
      showToast(`Faculty member removed.`);
      await loadData();
    }
  };

  const handleAddStudent = async (payload) => {
    const res = await api.addStudent(payload);
    showToast(`Student "${payload.full_name}" (Roll: ${payload.roll_number}) registered! Credentials ready.`);
    await loadData();
  };

  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove student ${name}?`)) {
      await api.deleteStudent(id);
      showToast(`Student removed.`);
      await loadData();
    }
  };

  const filteredFaculty = facultyList.filter(f => 
    f.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = studentList.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle size={18} />
          <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.12))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-emerald">Admin Control Center</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Centralized Credential Provisioning</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', margin: '0 0 6px 0' }}>Maintainer Operations Portal</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '620px' }}>
            Add and manage Faculty and Student login credentials. All accounts created here can immediately sign into their respective faculty and student dashboards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsAddFacultyOpen(true)}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
            }}
          >
            <UserPlus size={16} />
            <span>Add Faculty</span>
          </button>

          <button
            onClick={() => setIsAddStudentOpen(true)}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
            }}
          >
            <GraduationCap size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Active Faculty</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800' }}>{stats.total_faculty}</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '6px' }}>Instructors provisioned</div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Students</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <GraduationCap size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800' }}>{stats.total_students}</div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '6px' }}>Enrolled & monitored</div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Courses / Subjects</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800' }}>{stats.total_courses}</div>
          <div style={{ fontSize: '0.75rem', color: '#22d3ee', marginTop: '6px' }}>Curriculum modules</div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Avg. Attendance</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#34d399' }}>{stats.avg_attendance_rate}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Across all departments</div>
        </div>

      </div>

      {/* Main Tab Controls & Search Bar */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '22px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '18px'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('faculty')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: activeTab === 'faculty' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'faculty' ? '#a5b4fc' : 'var(--text-secondary)',
                border: activeTab === 'faculty' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                fontWeight: '600',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Users size={16} />
              <span>Faculty Directory ({facultyList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: activeTab === 'students' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: activeTab === 'students' ? '#fbbf24' : 'var(--text-secondary)',
                border: activeTab === 'students' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                fontWeight: '600',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <GraduationCap size={16} />
              <span>Student Directory ({studentList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: activeTab === 'courses' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: activeTab === 'courses' ? '#22d3ee' : 'var(--text-secondary)',
                border: activeTab === 'courses' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                fontWeight: '600',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <BookOpen size={16} />
              <span>Course Allocations ({courseList.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.84rem'
              }}
            />
          </div>
        </div>

        {/* TAB 1: FACULTY DIRECTORY */}
        {activeTab === 'faculty' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing {filteredFaculty.length} registered faculty accounts
              </span>
              <button
                onClick={() => setIsAddFacultyOpen(true)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserPlus size={14} /> Add Faculty
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '12px 14px' }}>FACULTY NAME</th>
                    <th style={{ padding: '12px 14px' }}>EMPLOYEE ID</th>
                    <th style={{ padding: '12px 14px' }}>LOGIN EMAIL</th>
                    <th style={{ padding: '12px 14px' }}>DEPARTMENT & TITLE</th>
                    <th style={{ padding: '12px 14px' }}>ASSIGNED SUBJECTS</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.map((f) => (
                    <tr key={f.faculty_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.86rem' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '0.82rem'
                          }}>
                            {f.full_name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: '600' }}>{f.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px', fontFamily: 'monospace', color: '#a5b4fc' }}>
                        {f.employee_id}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={13} color="var(--text-muted)" />
                          <span>{f.email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div>{f.department}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.designation}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        {f.assigned_courses && f.assigned_courses.length > 0 ? (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {f.assigned_courses.map(c => (
                              <span key={c} style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#a5b4fc',
                                fontSize: '0.72rem',
                                border: '1px solid rgba(99, 102, 241, 0.25)'
                              }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No classes assigned</span>
                        )}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteFaculty(f.faculty_id, f.full_name)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            color: '#fb7185',
                            border: '1px solid rgba(244, 63, 94, 0.2)'
                          }}
                          title="Delete Faculty"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT DIRECTORY */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing {filteredStudents.length} enrolled student accounts
              </span>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <GraduationCap size={14} /> Add Student
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '12px 14px' }}>STUDENT NAME</th>
                    <th style={{ padding: '12px 14px' }}>ROLL NUMBER</th>
                    <th style={{ padding: '12px 14px' }}>LOGIN EMAIL</th>
                    <th style={{ padding: '12px 14px' }}>DEPARTMENT / BATCH</th>
                    <th style={{ padding: '12px 14px' }}>ATTENDANCE RATE</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.student_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.86rem' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '0.82rem'
                          }}>
                            {s.full_name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{s.full_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sec {s.section || 'A'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px', fontFamily: 'monospace', color: '#fcd34d' }}>
                        {s.roll_number}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={13} color="var(--text-muted)" />
                          <span>{s.email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div>{s.department}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sem {s.semester} | {s.batch}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '60px',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255,255,255,0.1)',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${Math.min(s.attendance_rate || 0, 100)}%`,
                              height: '100%',
                              backgroundColor: (s.attendance_rate || 0) >= 75 ? '#10b981' : (s.attendance_rate || 0) >= 65 ? '#f59e0b' : '#f43f5e'
                            }} />
                          </div>
                          <span style={{
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            color: (s.attendance_rate || 0) >= 75 ? '#34d399' : (s.attendance_rate || 0) >= 65 ? '#fbbf24' : '#fb7185'
                          }}>
                            {s.attendance_rate || 100}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteStudent(s.student_id, s.full_name)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            color: '#fb7185',
                            border: '1px solid rgba(244, 63, 94, 0.2)'
                          }}
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COURSE ALLOCATIONS */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {courseList.map((c) => (
                <div key={c.id} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span className="badge badge-primary">{c.course_code}</span>
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.05rem' }}>{c.course_name}</h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {c.department} • Semester {c.semester} • {c.credits} Credits
                      </p>
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid var(--border-color)',
                    marginTop: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Assigned Faculty:</span>
                      <span style={{ fontWeight: '600', color: '#a5b4fc' }}>
                        {c.faculty_assigned && c.faculty_assigned.length > 0 ? c.faculty_assigned.join(', ') : 'Pending Allocation'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Enrolled Students:</span>
                      <span style={{ fontWeight: '600', color: '#34d399' }}>{c.enrolled_count || 5} Students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Add Faculty Modal */}
      <AddFacultyModal
        isOpen={isAddFacultyOpen}
        onClose={() => setIsAddFacultyOpen(false)}
        onFacultyAdded={handleAddFaculty}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onStudentAdded={handleAddStudent}
      />

    </div>
  );
}
