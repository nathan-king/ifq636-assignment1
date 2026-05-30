import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAdmin, logout, previewMemberView, togglePreviewMemberView, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handlePreviewToggle = () => {
    const nextPreviewMode = !previewMemberView;
    togglePreviewMemberView();

    if (nextPreviewMode) {
      navigate('/classes');
    } else {
      navigate('/admin/classes');
    }
  };

  return (
    <nav className="flex items-center justify-between border-b border-blue-700 bg-blue-600 px-4 py-3 text-white shadow-sm sm:px-6">
      <Link to="/classes" className="text-lg font-bold sm:text-xl">
        Fitness Class Booking System
      </Link>
      <div className="flex items-center gap-2 text-sm font-medium sm:gap-4 sm:text-base">
        {user ? (
          <>
            {isAdmin && (
              <Link to="/admin/classes" className="rounded-md px-2 py-2 transition hover:bg-blue-700 sm:px-3">
                Admin
              </Link>
            )}
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={handlePreviewToggle}
                className="rounded-md border border-white/40 px-2 py-2 text-white transition hover:bg-blue-700 sm:px-3"
              >
                {previewMemberView ? 'Return to Admin' : 'Preview Member View'}
              </button>
            )}
            <Link to="/classes" className="rounded-md px-2 py-2 transition hover:bg-blue-700 sm:px-3">
              Classes
            </Link>
            <Link to="/tasks" className="rounded-md px-2 py-2 transition hover:bg-blue-700 sm:px-3">
              CRUD
            </Link>
            <Link to="/profile" className="rounded-md px-2 py-2 transition hover:bg-blue-700 sm:px-3">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md bg-white px-3 py-2 font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="rounded-md px-2 py-2 transition hover:bg-blue-700 sm:px-3">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-white px-3 py-2 font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
