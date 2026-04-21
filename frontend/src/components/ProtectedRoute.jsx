import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-big-spinner" />
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
