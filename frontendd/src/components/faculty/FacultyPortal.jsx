import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BookOpen, 
  Users, 
  Calendar, 
  Save, 
  Sparkles, 
  History, 
  AlertTriangle,
  FileCheck,
  Check,
  Building,
  GraduationCap
} from 'lucide-react';
import { api } from '../../services/api';

export default function FacultyPortal({ currentUser }) {
  const [activeTab, setActiveTab] = useState('take-attendance'); // 'take-attendance', 'history', 'at-risk'
  const facultyId = currentUser?.profile?.faculty_id || 2;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [roster, setRoster] = useState([]);
  
  // Session details
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState('09:00 AM');
  const [topic, setTopic] = useState('');
  const [roomNumber, setRoomNumber] = useState('Lab 301');

  // Attendance state map: student_id -> { status: 'present'|'absent'|'late', remarks: '' }
  const [attendanceMap, setAttendanceMap] = useState({});

  // History & Metrics
  const [historyList, setHistoryList] = useState([]);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load faculty courses
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const cList = await api.getFacultyCourses(facultyId);
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourseId(cList[0].course_id);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [facultyId]);

  // Load student roster when course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    async function loadRoster() {
      try {
        const res = await api.getCourseStudents(selectedCourseId);
        setRoster(res.students || []);

        // Initialize all students to "present" by default for faster workflow
        const initialMap = {};
        (res.students || []).forEach(s => {
          initialMap[s.student_id] = { status: 'present', remarks: '' };
        });
        setAttendanceMap(initialMap);
      } catch (err) {
        console.error('Error loading roster:', err);
      }
    }
    loadRoster();
  }, [selectedCourseId]);

  // Load history
  const loadHistory = async () => {
    try {
      const h = await api.getFacultyHistory(facultyId, selectedCourseId);
      setHistoryList(h);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, selectedCourseId]);

  // Attendance toggles
  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status
      }
    }));
  };

  const handleRemarkChange = (studentId, remarks) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        remarks
      }
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    roster.forEach(s => {
      updated[s.student_id] = {
        ...(attendanceMap[s.student_id] || {}),
        status
      };
    });
    setAttendanceMap(updated);
  };

  // Live Stats
  const totalRoster = roster.length;
  const presentCount = Object.values(attendanceMap).filter(v => v.status === 'present').length;
  const lateCount = Object.values(attendanceMap).filter(v => v.status === 'late').length;
  const absentCount = Object.values(attendanceMap).filter(v => v.status === 'absent').length;
  const livePct = totalRoster > 0 ? Math.round(((presentCount + 0.5 * lateCount) / totalRoster) * 100) : 0;

  // Submit Attendance
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    const records = roster.map(s => ({
      student_id: s.student_id,
      status: attendanceMap[s.student_id]?.status || 'present',
      remarks: attendanceMap[s.student_id]?.remarks || ''
    }));

    setLoading(true);
    try {
      const res = await api.submitAttendance({
        course_id: selectedCourseId,
        session_date: sessionDate,
        session_time: sessionTime,
        topic: topic || 'Class Lecture',
        room_number: roomNumber,
        records
      }, facultyId);

      showToast(`Attendance recorded! ${res.present} Present, ${res.absent} Absent, ${res.late} Late (${res.percentage}% attendance).`);
      setTopic('');
    } catch (err) {
      alert('Failed to submit attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.12))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
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
            <span className="badge badge-primary">Faculty Portal</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {currentUser?.full_name} • {currentUser?.profile?.department || 'Computer Science'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', margin: '0 0 6px 0' }}>Daily Attendance Recorder</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Mark student attendance, log lecture topics, track classroom engagement, and monitor students below the 75% attendance threshold.
          </p>
        </div>

        {/* Course Selector in Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Selected Subject</span>
            <select
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: '#1a2238',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {courses.map(c => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
        <button
          onClick={() => setActiveTab('take-attendance')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'take-attendance' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'take-attendance' ? '600' : '500',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--border-color)'
          }}
        >
          <FileCheck size={16} />
          <span>Mark Class Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'history' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'history' ? '600' : '500',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--border-color)'
          }}
        >
          <History size={16} />
          <span>Attendance History & Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('at-risk')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeTab === 'at-risk' ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontWeight: activeTab === 'at-risk' ? '600' : '500',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--border-color)'
          }}
        >
          <AlertTriangle size={16} />
          <span>Low Attendance Alert (&lt; 75%)</span>
        </button>
      </div>

      {/* TAB 1: MARK ATTENDANCE */}
      {activeTab === 'take-attendance' && (
        <div>
          {/* Lecture Info Card */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#a5b4fc' }}>
              Lecture Session Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Session Date
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Time Slot
                </label>
                <input
                  type="text"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  placeholder="09:00 AM - 10:00 AM"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Classroom / Lab
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Lab 301 / Hall B"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Topic / Unit Taught
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Transactions & ACID Properties"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.86rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Roster Batch Bar & Live Tally */}
          <div className="glass-panel" style={{
            padding: '16px 24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'rgba(17, 24, 39, 0.85)'
          }}>
            {/* Live Counts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Enrolled: </span>
                <span style={{ fontWeight: '700' }}>{totalRoster} Students</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#34d399' }}>
                <span style={{ fontWeight: '700' }}>{presentCount}</span> Present
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fbbf24' }}>
                <span style={{ fontWeight: '700' }}>{lateCount}</span> Late
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fb7185' }}>
                <span style={{ fontWeight: '700' }}>{absentCount}</span> Absent
              </div>
              <div className="badge badge-emerald">
                {livePct}% Class Attendance
              </div>
            </div>

            {/* Quick Batch Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                ✓ Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: '#fb7185',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                ✗ Clear All
              </button>
            </div>
          </div>

          {/* Student Roster Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {roster.map((student, idx) => {
              const currentStatus = attendanceMap[student.student_id]?.status || 'present';
              const remarks = attendanceMap[student.student_id]?.remarks || '';

              return (
                <div
                  key={student.student_id}
                  className="glass-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    borderLeft: `4px solid ${
                      currentStatus === 'present' ? '#10b981' : currentStatus === 'late' ? '#f59e0b' : '#f43f5e'
                    }`
                  }}
                >
                  {/* Student Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '260px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}>
                      {student.full_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{student.full_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontFamily: 'monospace', color: '#fcd34d' }}>{student.roll_number}</span>
                        <span>•</span>
                        <span>Sec {student.section || 'A'}</span>
                        <span>•</span>
                        <span style={{
                          color: student.current_attendance_pct >= 75 ? '#34d399' : '#fb7185',
                          fontWeight: '600'
                        }}>
                          {student.current_attendance_pct}% Overall
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remarks Input */}
                  <div style={{ flex: '1', minWidth: '180px', maxWidth: '300px' }}>
                    <input
                      type="text"
                      placeholder="Remarks (e.g. excused, bus delay)"
                      value={remarks}
                      onChange={(e) => handleRemarkChange(student.student_id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Status Toggle Buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.student_id, 'present')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: currentStatus === 'present' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                        color: currentStatus === 'present' ? '#ffffff' : '#34d399',
                        fontWeight: '600',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        boxShadow: currentStatus === 'present' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Present</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.student_id, 'late')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: currentStatus === 'late' ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
                        color: currentStatus === 'late' ? '#ffffff' : '#fbbf24',
                        fontWeight: '600',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        boxShadow: currentStatus === 'late' ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none'
                      }}
                    >
                      <Clock size={15} />
                      <span>Late</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.student_id, 'absent')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: currentStatus === 'absent' ? '#f43f5e' : 'rgba(244, 63, 94, 0.1)',
                        color: currentStatus === 'absent' ? '#ffffff' : '#fb7185',
                        fontWeight: '600',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(244, 63, 94, 0.4)',
                        boxShadow: currentStatus === 'absent' ? '0 2px 8px rgba(244, 63, 94, 0.4)' : 'none'
                      }}
                    >
                      <XCircle size={15} />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Attendance Floating/Bottom Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '14px',
            padding: '20px 0',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              onClick={handleSubmitAttendance}
              disabled={loading || roster.length === 0}
              style={{
                padding: '14px 32px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.96rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Save size={18} />
              <span>{loading ? 'Recording to Database...' : 'Save & Submit Attendance'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE HISTORY */}
      {activeTab === 'history' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 18px 0', fontSize: '1.1rem' }}>
            Past Attendance Sessions Log
          </h4>

          {historyList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No past attendance records found.</p>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {historyList.map(item => (
                <div key={item.session_id} className="glass-card" style={{ padding: '18px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-primary">{item.course_code}</span>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.topic || 'Class Lecture'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>📅 {item.session_date}</span>
                        <span>⏰ {item.session_time}</span>
                        <span>📍 {item.room_number || 'Main Lab'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right', fontSize: '0.82rem' }}>
                        <div>
                          <span style={{ color: '#34d399', fontWeight: '600' }}>{item.present_count} Present</span> •{' '}
                          <span style={{ color: '#fbbf24', fontWeight: '600' }}>{item.late_count} Late</span> •{' '}
                          <span style={{ color: '#fb7185', fontWeight: '600' }}>{item.absent_count} Absent</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                          Total: {item.total_students} Students
                        </div>
                      </div>

                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: item.attendance_rate >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: item.attendance_rate >= 75 ? '#34d399' : '#fb7185',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        border: `1px solid ${item.attendance_rate >= 75 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                      }}>
                        {item.attendance_rate}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AT-RISK STUDENTS (<75%) */}
      {activeTab === 'at-risk' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="#fb7185" />
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fb7185' }}>
              Attendance Deficit Warning List (&lt; 75%)
            </h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '20px' }}>
            The university mandates a minimum of 75% attendance to sit for final semester examinations. Students listed below are falling below the threshold:
          </p>

          <div style={{ display: 'grid', gap: '12px' }}>
            {roster.filter(s => s.current_attendance_pct < 75).length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <span style={{ fontWeight: '600' }}>Great news! All students currently meet the 75% attendance threshold.</span>
              </div>
            ) : (
              roster.filter(s => s.current_attendance_pct < 75).map(s => (
                <div key={s.student_id} className="glass-card" style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: '4px solid #f43f5e'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{student.full_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Roll: {s.roll_number} • Email: {s.email}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#fb7185', fontWeight: '800', fontSize: '1.1rem' }}>
                      {s.current_attendance_pct}%
                    </div>
                    <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>Action Required</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
