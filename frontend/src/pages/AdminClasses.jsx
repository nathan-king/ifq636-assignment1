import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const initialFormData = {
  class: '',
  instructor: '',
  date: '',
  time: '',
  capacity: '',
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (time) => {
  if (!time || !time.includes(':')) return time;

  const [hourValue, minute] = time.split(':');
  const hour = Number(hourValue);

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
};

const AdminClasses = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axiosInstance.get('/api/fitness-classes');
        setClasses(response.data);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to load fitness classes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await axiosInstance.post('/api/fitness-classes', {
        ...formData,
        capacity: Number(formData.capacity),
        status: 'confirmed',
      });

      setClasses([...classes, response.data]);
      setFormData(initialFormData);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create class.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-white md:flex">
      <aside className="bg-[#053342] px-4 py-6 text-white md:min-h-[calc(100vh-57px)] md:w-72 md:shrink-0 md:px-5 md:py-16">
        <h1 className="mb-8 px-4 text-3xl font-bold">Admin Panel</h1>
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-4 md:overflow-visible">
          <Link
            to="/admin/classes"
            className="whitespace-nowrap rounded-md bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white shadow-sm md:w-full"
          >
            Classes
          </Link>
          <Link
            to="/classes"
            className="whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-white transition hover:bg-white/10 md:w-full"
          >
            Bookings
          </Link>
          <Link
            to="/profile"
            className="whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-white transition hover:bg-white/10 md:w-full"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="whitespace-nowrap rounded-md px-6 py-3 text-center text-base font-medium text-white transition hover:bg-white/10 md:w-full"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16 lg:py-16">
        <h2 className="mb-6 text-3xl font-bold text-slate-950">Manage Classes</h2>

        <form onSubmit={handleSubmit} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead className="bg-[#eefaff]">
                <tr>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Class</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Instructor</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Date</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Time</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Capacity</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-base font-medium text-slate-700">
                      Loading classes...
                    </td>
                  </tr>
                ) : (
                  classes.map((fitnessClass) => (
                    <tr key={fitnessClass._id} className="border-t border-slate-200 transition hover:bg-slate-50">
                      <td className="px-6 py-5 text-base font-medium text-slate-950">{fitnessClass.class}</td>
                      <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.instructor}</td>
                      <td className="px-6 py-5 text-base text-slate-700">{formatDate(fitnessClass.date)}</td>
                      <td className="px-6 py-5 text-base text-slate-700">{formatTime(fitnessClass.time)}</td>
                      <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.capacity}</td>
                      <td className="px-6 py-5 text-base">
                        <button type="button" className="mr-4 font-medium text-blue-600 hover:underline">
                          Edit
                        </button>
                        <button type="button" className="font-medium text-red-600 hover:underline">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                <tr className="border-t border-blue-200 bg-blue-50/80">
                  <td colSpan="6" className="px-6 pb-0 pt-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                        +
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-950">Add a new class</h3>
                        <p className="text-sm text-slate-600">Enter class details below, then confirm to publish it.</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="bg-blue-50/80">
                  <td className="px-6 py-5">
                    <input
                      type="text"
                      aria-label="Class name"
                      placeholder="Class name"
                      value={formData.class}
                      onChange={(event) => setFormData({ ...formData, class: event.target.value })}
                      className="h-11 w-full rounded-md border border-blue-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </td>
                  <td className="px-6 py-5">
                    <input
                      type="text"
                      aria-label="Instructor"
                      placeholder="Instructor"
                      value={formData.instructor}
                      onChange={(event) => setFormData({ ...formData, instructor: event.target.value })}
                      className="h-11 w-full rounded-md border border-blue-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </td>
                  <td className="px-6 py-5">
                    <input
                      type="date"
                      aria-label="Date"
                      value={formData.date}
                      onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                      className="h-11 w-full rounded-md border border-blue-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </td>
                  <td className="px-6 py-5">
                    <input
                      type="time"
                      aria-label="Time"
                      value={formData.time}
                      onChange={(event) => setFormData({ ...formData, time: event.target.value })}
                      className="h-11 w-full rounded-md border border-blue-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </td>
                  <td className="px-6 py-5">
                    <input
                      type="number"
                      min="1"
                      aria-label="Capacity"
                      placeholder="Capacity"
                      value={formData.capacity}
                      onChange={(event) => setFormData({ ...formData, capacity: event.target.value })}
                      className="h-11 w-full rounded-md border border-blue-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </td>
                  <td className="px-6 py-5">
                    <button
                      type="submit"
                      disabled={saving}
                      className="h-11 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Add Class'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminClasses;
