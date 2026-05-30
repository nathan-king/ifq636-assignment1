import { Link, useNavigate } from 'react-router-dom';
import ClassList from '../components/ClassList';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-white md:flex">
      <aside className="border-r border-slate-200 bg-[#eefaff] px-4 py-5 md:min-h-[calc(100vh-57px)] md:w-72 md:shrink-0 md:px-5 md:py-8">
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-4 md:overflow-visible">
          <Link
            to="/classes"
            className="whitespace-nowrap rounded-md bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm md:w-full"
          >
            Browse Classes
          </Link>
          <Link
            to="/bookings"
            className="whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-slate-800 transition hover:bg-white md:w-full"
          >
            My Bookings
          </Link>
          <Link
            to="/profile"
            className="whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-slate-800 transition hover:bg-white md:w-full"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-slate-800 transition hover:bg-white md:w-full"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 md:px-10 lg:px-14 lg:py-16">
        <ClassList />
      </main>
    </div>
  );
};

export default Classes;
