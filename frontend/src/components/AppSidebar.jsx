import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppSidebar = ({ active }) => {
  const { isAdmin, logout, previewMemberView, togglePreviewMemberView, user } = useAuth();
  const navigate = useNavigate();
  const adminMode = isAdmin;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handlePreviewToggle = () => {
    const nextPreviewMode = !previewMemberView;
    togglePreviewMemberView();
    navigate(nextPreviewMode ? '/classes' : '/admin/classes');
  };

  const sidebarClassName = adminMode
    ? 'min-h-screen bg-[#053342] px-4 py-6 text-white md:w-72 md:shrink-0 md:px-5 md:py-16'
    : 'min-h-screen border-r border-slate-200 bg-[#eefaff] px-4 py-5 md:w-72 md:shrink-0 md:px-5 md:py-8';
  const inactiveLinkClassName = adminMode
    ? 'whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-white transition hover:bg-white/10 md:w-full'
    : 'whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-slate-800 transition hover:bg-white md:w-full';
  const activeLinkClassName =
    'whitespace-nowrap rounded-md bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm md:w-full';

  const classLinkPath = adminMode ? '/admin/classes' : '/classes';
  const classLinkLabel = adminMode ? 'Classes' : 'Browse Classes';

  return (
    <aside className={sidebarClassName}>
      <h1 className={`mb-8 px-4 font-bold ${adminMode ? 'text-3xl' : 'text-2xl text-slate-950'}`}>
        {adminMode ? 'Admin Panel' : 'Fitness Class Booking System'}
      </h1>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-4 md:overflow-visible">
        <Link to={classLinkPath} className={active === 'classes' ? activeLinkClassName : inactiveLinkClassName}>
          {classLinkLabel}
        </Link>
        <Link to="/bookings" className={active === 'bookings' ? activeLinkClassName : inactiveLinkClassName}>
          {adminMode ? 'Bookings' : 'My Bookings'}
        </Link>
        <Link to="/profile" className={active === 'profile' ? activeLinkClassName : inactiveLinkClassName}>
          Profile
        </Link>
        {user?.role === 'admin' && (
          <button type="button" onClick={handlePreviewToggle} className={inactiveLinkClassName}>
            {previewMemberView ? 'Return to Admin' : 'Preview Member View'}
          </button>
        )}
        <button type="button" onClick={handleLogout} className={inactiveLinkClassName}>
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default AppSidebar;
