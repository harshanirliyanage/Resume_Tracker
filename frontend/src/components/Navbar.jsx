import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">⚡</div>
          <span>ResumeAI</span>
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/history" className="btn btn-ghost btn-sm">
                📋 History
              </Link>
              <Link to="/analyze" className="btn btn-secondary btn-sm">
                ✨ New Analysis
              </Link>
              <div className="navbar-user">
                <div className="user-avatar">{initials}</div>
                <span style={{ display: 'none' }}>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
