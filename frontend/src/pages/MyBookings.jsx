import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sampleBookings = [
  {
    id: 'booking-1',
    class: 'Yoga',
    instructor: 'Jack Jones',
    date: '2nd June',
    time: '10:00 AM',
    status: 'Confirmed',
  },
  {
    id: 'booking-2',
    class: 'Pilates',
    instructor: 'Jessica Smith',
    date: '4th June',
    time: '5:30 PM',
    status: 'Confirmed',
  },
];

const MyBookings = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebarClassName = isAdmin
    ? 'bg-[#053342] px-4 py-6 text-white md:min-h-[calc(100vh-57px)] md:w-72 md:shrink-0 md:px-5 md:py-16'
    : 'border-r border-slate-200 bg-[#eefaff] px-4 py-5 md:min-h-[calc(100vh-57px)] md:w-72 md:shrink-0 md:px-5 md:py-8';
  const inactiveLinkClassName = isAdmin
    ? 'whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-white transition hover:bg-white/10 md:w-full'
    : 'whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-slate-800 transition hover:bg-white md:w-full';

  return (
    <div className="min-h-[calc(100vh-57px)] bg-white md:flex">
      <aside className={sidebarClassName}>
        {isAdmin && <h1 className="mb-8 px-4 text-3xl font-bold">Admin Panel</h1>}
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-4 md:overflow-visible">
          <Link to={isAdmin ? '/admin/classes' : '/classes'} className={inactiveLinkClassName}>
            {isAdmin ? 'Classes' : 'Browse Classes'}
          </Link>
          <Link
            to="/bookings"
            className="whitespace-nowrap rounded-md bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm md:w-full"
          >
            My Bookings
          </Link>
          <Link to="/profile" className={inactiveLinkClassName}>
            Profile
          </Link>
          <button type="button" onClick={handleLogout} className={inactiveLinkClassName}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16 lg:py-16">
        <h2 className="mb-6 text-3xl font-bold text-slate-950">My Bookings</h2>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#eefaff]">
                <tr>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Class</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Instructor</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Date</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Time</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Status</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Action</th>
                </tr>
              </thead>
              <tbody>
                {sampleBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-200 transition hover:bg-slate-50">
                    <td className="px-6 py-5 text-base font-medium text-slate-950">{booking.class}</td>
                    <td className="px-6 py-5 text-base text-slate-700">{booking.instructor}</td>
                    <td className="px-6 py-5 text-base text-slate-700">{booking.date}</td>
                    <td className="px-6 py-5 text-base text-slate-700">{booking.time}</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button type="button" className="font-medium text-red-600 hover:underline">
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyBookings;
