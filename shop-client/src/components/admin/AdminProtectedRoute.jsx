import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
export default function AdminProtectedRoute({ children }) { const { admin, loading } = useAdminAuth(); const location = useLocation(); if (loading) return <div className="admin-loading">Checking secure session…</div>; return admin ? children : <Navigate to="/admin/login" replace state={{ from: location }} />; }
