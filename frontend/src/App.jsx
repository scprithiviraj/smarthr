import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import LeaveHistory from './pages/LeaveHistory';
import CalendarPage from './pages/CalendarPage';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import AdminLeaveRequests from './pages/AdminLeaveRequests';
import Layout from './components/Layout';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/leaves" element={
          <PrivateRoute>
            <AdminLeaveRequests />
          </PrivateRoute>
        } />
        <Route path="/attendance" element={
          <PrivateRoute>
            <Attendance />
          </PrivateRoute>
        } />
        <Route path="/leave" element={
          <PrivateRoute>
            <Leave />
          </PrivateRoute>
        } />
        <Route path="/leave-history" element={
          <PrivateRoute>
            <LeaveHistory />
          </PrivateRoute>
        } />
        <Route path="/calendar" element={
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        <Route path="/employees" element={
          <PrivateRoute>
            <Employees />
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
