/**
 * Student Attendance System API Service
 * Handles communication with the FastAPI / PostgreSQL backend,
 * with seamless reactive fallback so testing and demos work instantly out of the box!
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:8000' : '');

// Default initial state for local fallback demo
const INITIAL_DEMO_DATA = {
  users: [
    { id: 1, email: 'admin@attendance.edu', password: 'admin123', full_name: 'System Administrator', role: 'maintainer', phone: '+1-555-0100', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 2, email: 'dr.sharma@attendance.edu', password: 'faculty123', full_name: 'Dr. Ramesh Sharma', role: 'faculty', phone: '+1-555-0101', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', employee_id: 'EMP-CS-001', department: 'Computer Science', designation: 'Professor & HOD' },
    { id: 3, email: 'prof.patel@attendance.edu', password: 'faculty123', full_name: 'Prof. Priya Patel', role: 'faculty', phone: '+1-555-0102', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', employee_id: 'EMP-CS-002', department: 'Computer Science', designation: 'Associate Professor' },
    { id: 5, email: 'rahul.kumar@student.edu', password: 'student123', full_name: 'Rahul Kumar', role: 'student', phone: '+1-555-0201', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', roll_number: 'CS2024-001', department: 'Computer Science', semester: 4, batch: '2023-2027', section: 'A' },
    { id: 6, email: 'ananya.singh@student.edu', password: 'student123', full_name: 'Ananya Singh', role: 'student', phone: '+1-555-0202', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', roll_number: 'CS2024-002', department: 'Computer Science', semester: 4, batch: '2023-2027', section: 'A' },
    { id: 7, email: 'rohit.verma@student.edu', password: 'student123', full_name: 'Rohit Verma', role: 'student', phone: '+1-555-0203', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', roll_number: 'CS2024-003', department: 'Computer Science', semester: 4, batch: '2023-2027', section: 'A' },
    { id: 8, email: 'sneha.reddy@student.edu', password: 'student123', full_name: 'Sneha Reddy', role: 'student', phone: '+1-555-0204', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', roll_number: 'CS2024-004', department: 'Computer Science', semester: 4, batch: '2023-2027', section: 'A' },
    { id: 9, email: 'vikram.aditya@student.edu', password: 'student123', full_name: 'Vikram Aditya', role: 'student', phone: '+1-555-0205', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', roll_number: 'CS2024-005', department: 'Computer Science', semester: 4, batch: '2023-2027', section: 'A' },
  ],
  courses: [
    { id: 1, course_code: 'CS401', course_name: 'Database Management Systems', department: 'Computer Science', semester: 4, credits: 4, faculty_id: 2, faculty_name: 'Dr. Ramesh Sharma' },
    { id: 2, course_code: 'CS402', course_name: 'Operating Systems', department: 'Computer Science', semester: 4, credits: 4, faculty_id: 3, faculty_name: 'Prof. Priya Patel' },
    { id: 3, course_code: 'CS403', course_name: 'Computer Networks', department: 'Computer Science', semester: 4, credits: 3, faculty_id: 2, faculty_name: 'Dr. Ramesh Sharma' },
    { id: 4, course_code: 'CS404', course_name: 'Design & Analysis of Algorithms', department: 'Computer Science', semester: 4, credits: 4, faculty_id: 2, faculty_name: 'Dr. Ramesh Sharma' },
  ],
  sessions: [
    {
      id: 1, course_id: 1, course_code: 'CS401', faculty_id: 2,
      session_date: '2026-10-21', session_time: '09:00 AM',
      topic: 'ER Modeling & Relational Schema', room_number: 'Lab 301',
      records: [
        { student_id: 5, status: 'present', remarks: 'Active engagement' },
        { student_id: 6, status: 'present', remarks: '' },
        { student_id: 7, status: 'absent', remarks: 'Unexcused' },
        { student_id: 8, status: 'present', remarks: '' },
        { student_id: 9, status: 'late', remarks: '15 mins late' },
      ]
    },
    {
      id: 2, course_id: 1, course_code: 'CS401', faculty_id: 2,
      session_date: '2026-10-23', session_time: '09:00 AM',
      topic: 'SQL Joins & Aggregations', room_number: 'Lab 301',
      records: [
        { student_id: 5, status: 'present', remarks: '' },
        { student_id: 6, status: 'present', remarks: '' },
        { student_id: 7, status: 'present', remarks: '' },
        { student_id: 8, status: 'present', remarks: '' },
        { student_id: 9, status: 'absent', remarks: 'Medical' },
      ]
    },
    {
      id: 3, course_id: 2, course_code: 'CS402', faculty_id: 3,
      session_date: '2026-10-24', session_time: '11:00 AM',
      topic: 'Process Scheduling & Semaphores', room_number: 'Room 204',
      records: [
        { student_id: 5, status: 'present', remarks: '' },
        { student_id: 6, status: 'late', remarks: 'Bus delay' },
        { student_id: 7, status: 'present', remarks: '' },
        { student_id: 8, status: 'present', remarks: '' },
        { student_id: 9, status: 'present', remarks: '' },
      ]
    }
  ]
};

// Local storage persistent helper
function getLocalStore() {
  const data = localStorage.getItem('studp_attendance_db');
  if (!data) {
    localStorage.setItem('studp_attendance_db', JSON.stringify(INITIAL_DEMO_DATA));
    return INITIAL_DEMO_DATA;
  }
  return JSON.parse(data);
}

function setLocalStore(data) {
  localStorage.setItem('studp_attendance_db', JSON.stringify(data));
}

export const api = {
  // Check backend health & PostgreSQL connection
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return { isBackendOnline: true, dbInfo: data.database };
      }
    } catch {
      // Backend not running yet
    }
    return {
      isBackendOnline: false,
      dbInfo: { postgres_connected: false, engine_type: 'Local In-Memory Cache (Connect PostgreSQL anytime)' }
    };
  },

  // Role-based Login
  async login(email, password, role) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
      // Fallback
      const store = getLocalStore();
      const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) throw new Error('User not found with this email.');
      if (user.password !== password) throw new Error('Invalid credentials. Please verify your password.');
      if (role && user.role.toLowerCase() !== role.toLowerCase()) {
        throw new Error(`This account is registered as '${user.role.toUpperCase()}', not '${role.toUpperCase()}'.`);
      }

      let profile = {};
      if (user.role === 'faculty') {
        profile = { faculty_id: user.id, employee_id: user.employee_id, department: user.department, designation: user.designation };
      } else if (user.role === 'student') {
        profile = { student_id: user.id, roll_number: user.roll_number, department: user.department, semester: user.semester, batch: user.batch, section: user.section };
      }

      return {
        access_token: `mock_jwt_${user.id}_${user.role}`,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          avatar_url: user.avatar,
          profile
        }
      };
    }
  },

  // Maintainer: System Stats
  async getMaintainerStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintainer/stats`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    const faculties = store.users.filter(u => u.role === 'faculty');
    const students = store.users.filter(u => u.role === 'student');
    return {
      total_faculty: faculties.length,
      total_students: students.length,
      total_courses: store.courses.length,
      total_sessions: store.sessions.length,
      avg_attendance_rate: 87.5
    };
  },

  // Maintainer: Add Faculty
  async addFaculty(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintainer/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || 'Failed to add faculty');
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }
    const store = getLocalStore();
    const newId = Date.now();
    const newFaculty = {
      id: newId,
      email: payload.email,
      password: payload.password,
      full_name: payload.full_name,
      role: 'faculty',
      phone: payload.phone || '+1-555-0000',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.full_name)}`,
      employee_id: payload.employee_id,
      department: payload.department,
      designation: payload.designation || 'Assistant Professor'
    };
    store.users.push(newFaculty);
    setLocalStore(store);
    return { message: 'Faculty added successfully!', faculty: newFaculty };
  },

  // Maintainer: List Faculty
  async listFaculty() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintainer/faculty`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    return store.users
      .filter(u => u.role === 'faculty')
      .map(f => ({
        faculty_id: f.id,
        user_id: f.id,
        full_name: f.full_name,
        email: f.email,
        employee_id: f.employee_id,
        department: f.department,
        designation: f.designation,
        phone: f.phone,
        assigned_courses: store.courses.filter(c => c.faculty_id === f.id).map(c => c.course_code)
      }));
  },

  // Maintainer: Delete Faculty
  async deleteFaculty(facultyId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintainer/faculty/${facultyId}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    store.users = store.users.filter(u => u.id !== facultyId);
    setLocalStore(store);
    return { message: 'Faculty deleted' };
  },

  // Maintainer: Add Student
  async addStudent(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintainer/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || 'Failed to add student');
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }
    const store = getLocalStore();
    const newId = Date.now();
    const newStudent = {
      id: newId,
      email: payload.email,
      password: payload.password,
      full_name: payload.full_name,
      role: 'student',
      phone: payload.phone || '+1-555-0000',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.full_name)}`,
      roll_number: payload.roll_number,
      department: payload.department,
      semester: payload.semester || 1,
      batch: payload.batch || '2024-2028',
      section: payload.section || 'A'
    };
    store.users.push(newStudent);
    setLocalStore(store);
    return { message: 'Student added successfully!', student: newStudent };
  },

  // Maintainer: List Students
  async listStudents() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintainer/students`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    return store.users
      .filter(u => u.role === 'student')
      .map(s => {
        let total = 0, present = 0;
        store.sessions.forEach(sess => {
          const rec = sess.records.find(r => r.student_id === s.id);
          if (rec) {
            total++;
            if (rec.status === 'present') present++;
            else if (rec.status === 'late') present += 0.5;
          }
        });
        const pct = total > 0 ? Math.round((present / total) * 100) : 100;
        return {
          student_id: s.id,
          user_id: s.id,
          full_name: s.full_name,
          email: s.email,
          roll_number: s.roll_number,
          department: s.department,
          semester: s.semester,
          batch: s.batch,
          section: s.section,
          phone: s.phone,
          attendance_rate: pct,
          total_classes: total,
          present_count: present
        };
      });
  },

  // Maintainer: Delete Student
  async deleteStudent(studentId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintainer/student/${studentId}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    store.users = store.users.filter(u => u.id !== studentId);
    setLocalStore(store);
    return { message: 'Student deleted' };
  },

  // Maintainer: List Courses
  async listCourses() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintainer/courses`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    return store.courses.map(c => ({
      ...c,
      faculty_assigned: [c.faculty_name],
      enrolled_count: store.users.filter(u => u.role === 'student').length
    }));
  },

  // Faculty: Dashboard Stats
  async getFacultyDashboard(facultyId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/dashboard?faculty_id=${facultyId}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    const myCourses = store.courses.filter(c => c.faculty_id === facultyId);
    const mySessions = store.sessions.filter(s => s.faculty_id === facultyId);
    return {
      faculty_name: 'Dr. Ramesh Sharma',
      employee_id: 'EMP-CS-001',
      department: 'Computer Science',
      total_courses: myCourses.length || 2,
      total_students: store.users.filter(u => u.role === 'student').length,
      total_sessions_conducted: mySessions.length,
      average_attendance: 89.2
    };
  },

  // Faculty: Courses
  async getFacultyCourses(facultyId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/courses?faculty_id=${facultyId}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    const myCourses = store.courses.filter(c => c.faculty_id === facultyId);
    const list = myCourses.length > 0 ? myCourses : store.courses.slice(0, 2);
    return list.map(c => ({
      course_id: c.id,
      course_code: c.course_code,
      course_name: c.course_name,
      department: c.department,
      semester: c.semester,
      section: 'A',
      academic_year: '2026-2027',
      enrolled_students: store.users.filter(u => u.role === 'student').length,
      sessions_taken: store.sessions.filter(s => s.course_id === c.id).length
    }));
  },

  // Faculty: Student Roster for taking attendance
  async getCourseStudents(courseId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/courses/${courseId}/students`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    const course = store.courses.find(c => c.id === Number(courseId)) || store.courses[0];
    const students = store.users.filter(u => u.role === 'student').map(s => {
      let total = 0, attended = 0;
      store.sessions.filter(sess => sess.course_id === course.id).forEach(sess => {
        const rec = sess.records.find(r => r.student_id === s.id);
        if (rec) {
          total++;
          if (rec.status === 'present') attended++;
          else if (rec.status === 'late') attended += 0.5;
        }
      });
      return {
        student_id: s.id,
        user_id: s.id,
        roll_number: s.roll_number,
        full_name: s.full_name,
        email: s.email,
        department: s.department,
        section: s.section,
        current_attendance_pct: total > 0 ? Math.round((attended / total) * 100) : 100,
        classes_attended: attended,
        total_classes: total
      };
    });

    return {
      course_id: course.id,
      course_code: course.course_code,
      course_name: course.course_name,
      students
    };
  },

  // Faculty: Submit Attendance
  async submitAttendance(payload, facultyId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/attendance?faculty_id=${facultyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || 'Failed to submit attendance');
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }
    const store = getLocalStore();
    const course = store.courses.find(c => c.id === Number(payload.course_id));
    const newSession = {
      id: Date.now(),
      course_id: Number(payload.course_id),
      course_code: course ? course.course_code : 'CS401',
      faculty_id: facultyId,
      session_date: payload.session_date || new Date().toISOString().split('T')[0],
      session_time: payload.session_time || '10:00 AM',
      topic: payload.topic || 'Class Lecture',
      room_number: payload.room_number || 'Room 101',
      records: payload.records
    };
    store.sessions.unshift(newSession);
    setLocalStore(store);

    const present = payload.records.filter(r => r.status === 'present').length;
    const late = payload.records.filter(r => r.status === 'late').length;
    const absent = payload.records.filter(r => r.status === 'absent').length;

    return {
      message: 'Attendance successfully recorded!',
      session_id: newSession.id,
      total_marked: payload.records.length,
      present,
      late,
      absent,
      percentage: Math.round(((present + 0.5 * late) / payload.records.length) * 100)
    };
  },

  // Faculty: Attendance History
  async getFacultyHistory(facultyId, courseId) {
    try {
      const url = courseId 
        ? `${API_BASE_URL}/api/faculty/attendance-history?faculty_id=${facultyId}&course_id=${courseId}`
        : `${API_BASE_URL}/api/faculty/attendance-history?faculty_id=${facultyId}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    return store.sessions.map(s => {
      const total = s.records.length;
      const present = s.records.filter(r => r.status === 'present').length;
      const late = s.records.filter(r => r.status === 'late').length;
      const absent = s.records.filter(r => r.status === 'absent').length;
      const pct = total > 0 ? Math.round(((present + 0.5 * late) / total) * 100) : 0;
      return {
        session_id: s.id,
        course_id: s.course_id,
        course_code: s.course_code,
        course_name: 'Database Management Systems',
        session_date: s.session_date,
        session_time: s.session_time,
        topic: s.topic,
        room_number: s.room_number,
        total_students: total,
        present_count: present,
        late_count: late,
        absent_count: absent,
        attendance_rate: pct
      };
    });
  },

  // Student: Dashboard
  async getStudentDashboard(studentId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/dashboard?student_id=${studentId}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    const student = store.users.find(u => u.id === Number(studentId)) || store.users.find(u => u.role === 'student');

    let total = 0, present = 0, late = 0, absent = 0;
    store.sessions.forEach(s => {
      const rec = s.records.find(r => r.student_id === student.id);
      if (rec) {
        total++;
        if (rec.status === 'present') present++;
        else if (rec.status === 'late') late++;
        else absent++;
      }
    });

    const pct = total > 0 ? Math.round(((present + 0.5 * late) / total) * 100) : 90;
    const status = pct >= 75 ? 'Safe' : pct >= 65 ? 'Warning' : 'Critical';
    const color = pct >= 75 ? 'emerald' : pct >= 65 ? 'amber' : 'rose';

    return {
      student_name: student.full_name,
      roll_number: student.roll_number || 'CS2024-001',
      department: student.department || 'Computer Science',
      semester: student.semester || 4,
      section: student.section || 'A',
      batch: student.batch || '2023-2027',
      overall_percentage: pct,
      total_classes: total,
      present_count: present,
      late_count: late,
      absent_count: absent,
      enrolled_courses: store.courses.length,
      attendance_status: status,
      status_color: color,
      status_message: pct >= 75 
        ? 'Your attendance is above the mandatory 75% threshold. Keep it up!'
        : 'Your attendance is at risk. Please attend regular classes.'
    };
  },

  // Student: Subject-wise breakdown
  async getStudentCoursesAttendance(studentId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/courses-attendance?student_id=${studentId}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    const student = store.users.find(u => u.id === Number(studentId)) || store.users.find(u => u.role === 'student');

    return store.courses.map(c => {
      let total = 0, present = 0, late = 0, absent = 0;
      store.sessions.filter(s => s.course_id === c.id).forEach(s => {
        const rec = s.records.find(r => r.student_id === student.id);
        if (rec) {
          total++;
          if (rec.status === 'present') present++;
          else if (rec.status === 'late') late++;
          else absent++;
        }
      });

      const pct = total > 0 ? Math.round(((present + 0.5 * late) / total) * 100) : 92;
      return {
        course_id: c.id,
        course_code: c.course_code,
        course_name: c.course_name,
        faculty_name: c.faculty_name,
        credits: c.credits,
        total_classes: total,
        present_count: present,
        late_count: late,
        absent_count: absent,
        percentage: pct,
        badge: pct >= 75 ? 'Safe' : pct >= 65 ? 'Warning' : 'Critical',
        badge_color: pct >= 75 ? 'emerald' : pct >= 65 ? 'amber' : 'rose'
      };
    });
  },

  // Student: Day-by-day logs
  async getStudentHistory(studentId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/attendance-history?student_id=${studentId}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const store = getLocalStore();
    const student = store.users.find(u => u.id === Number(studentId)) || store.users.find(u => u.role === 'student');

    const history = [];
    store.sessions.forEach(s => {
      const rec = s.records.find(r => r.student_id === student.id);
      if (rec) {
        history.push({
          record_id: s.id,
          date: s.session_date,
          time: s.session_time,
          course_code: s.course_code,
          course_name: 'Course Lecture',
          faculty_name: 'Faculty Instructor',
          topic: s.topic,
          room_number: s.room_number,
          status: rec.status,
          remarks: rec.remarks || ''
        });
      }
    });
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};
