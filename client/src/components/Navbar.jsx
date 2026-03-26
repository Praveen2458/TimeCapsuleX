import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          TimeCapsuleX
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <NavLink to="/create" className={({ isActive }) => (isActive ? 'text-sky-400' : 'text-slate-300')}>
            Create
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'text-sky-400' : 'text-slate-300')}>
                Dashboard
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-sky-500 hover:text-sky-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'text-sky-400' : 'text-slate-300')}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'text-sky-400' : 'text-slate-300')}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
