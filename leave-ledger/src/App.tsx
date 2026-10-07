import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CalendarView from './pages/CalendarView';
import Applications from './pages/Applications';
import ApplicationGenerator from './pages/ApplicationGenerator';
import Settings from './pages/Settings';
import Login from './pages/Login';
import UpdatePassword from './pages/UpdatePassword';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/new" element={<ApplicationGenerator />} />
            <Route path="settings" element={<Settings />} />
            <Route path="update-password" element={<UpdatePassword />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
