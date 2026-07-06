import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Suppliers from './pages/Suppliers';
import Attendants from './pages/Attendants';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Summary from './pages/Summary';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'ATTENDANT']}><Dashboard /></ProtectedRoute>} />
        <Route path="products"   element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Products /></ProtectedRoute>} />
        <Route path="stock"      element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Stock /></ProtectedRoute>} />
        <Route path="suppliers"  element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Suppliers /></ProtectedRoute>} />
        <Route path="attendants" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Attendants /></ProtectedRoute>} />
        <Route path="sales"      element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'ATTENDANT']}><Sales /></ProtectedRoute>} />
        <Route path="customers"  element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'ATTENDANT']}><Customers /></ProtectedRoute>} />
        <Route path="summary"    element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Summary /></ProtectedRoute>} />
        <Route path="reports"    element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Reports /></ProtectedRoute>} />
        <Route path="settings"   element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Settings /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
