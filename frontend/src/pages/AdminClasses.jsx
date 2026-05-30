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

const formatDateForInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

const formatTimeForInput = (time) => {
  if (!time) return '';
  if (/^\d{2}:\d{2}$/.test(time)) return time;

  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return '';

  const [, hourValue, minute, suffix] = match;
  let hour = Number(hourValue);

  if (suffix.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (suffix.toUpperCase() === 'AM' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${minute}`;
};

const AdminClasses = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editFormData, setEditFormData] = useState(initialFormData);
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

  const handleEdit = (fitnessClass) => {
    setEditingClassId(fitnessClass._id);
    setEditFormData({
      class: fitnessClass.class,
      instructor: fitnessClass.instructor,
      date: formatDateForInput(fitnessClass.date),
      time: formatTimeForInput(fitnessClass.time),
      capacity: String(fitnessClass.capacity),
    });
  };

  const handleCancelEdit = () => {
    setEditingClassId(null);
    setEditFormData(initialFormData);
  };

  const handleSaveEdit = async (fitnessClassId) => {
    setSaving(true);

    try {
      const response = await axiosInstance.put(`/api/fitness-classes/${fitnessClassId}`, {
        ...editFormData,
        capacity: Number(editFormData.capacity),
      });

      setClasses(
        classes.map((fitnessClass) =>
          fitnessClass._id === fitnessClassId ? response.data : fitnessClass
        )
      );
      handleCancelEdit();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update class.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fitnessClassId) => {
    try {
      await axiosInstance.delete(`/api/fitness-classes/${fitnessClassId}`);
      setClasses(classes.filter((fitnessClass) => fitnessClass._id !== fitnessClassId));

      if (editingClassId === fitnessClassId) {
        handleCancelEdit();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete class.');
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
                  classes.map((fitnessClass) => {
                    const isEditing = editingClassId === fitnessClass._id;

                    return (
                      <tr
                        key={fitnessClass._id}
                        className={`border-t border-slate-200 transition ${isEditing ? 'bg-amber-50/80' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-6 py-5 text-base font-medium text-slate-950">
                          {isEditing ? (
                            <input
                              type="text"
                              aria-label="Edit class name"
                              value={editFormData.class}
                              onChange={(event) => setEditFormData({ ...editFormData, class: event.target.value })}
                              className="h-11 w-full rounded-md border border-amber-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          ) : (
                            fitnessClass.class
                          )}
                        </td>
                        <td className="px-6 py-5 text-base text-slate-700">
                          {isEditing ? (
                            <input
                              type="text"
                              aria-label="Edit instructor"
                              value={editFormData.instructor}
                              onChange={(event) => setEditFormData({ ...editFormData, instructor: event.target.value })}
                              className="h-11 w-full rounded-md border border-amber-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          ) : (
                            fitnessClass.instructor
                          )}
                        </td>
                        <td className="px-6 py-5 text-base text-slate-700">
                          {isEditing ? (
                            <input
                              type="date"
                              aria-label="Edit date"
                              value={editFormData.date}
                              onChange={(event) => setEditFormData({ ...editFormData, date: event.target.value })}
                              className="h-11 w-full rounded-md border border-amber-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          ) : (
                            formatDate(fitnessClass.date)
                          )}
                        </td>
                        <td className="px-6 py-5 text-base text-slate-700">
                          {isEditing ? (
                            <input
                              type="time"
                              aria-label="Edit time"
                              value={editFormData.time}
                              onChange={(event) => setEditFormData({ ...editFormData, time: event.target.value })}
                              className="h-11 w-full rounded-md border border-amber-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          ) : (
                            formatTime(fitnessClass.time)
                          )}
                        </td>
                        <td className="px-6 py-5 text-base text-slate-700">
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              aria-label="Edit capacity"
                              value={editFormData.capacity}
                              onChange={(event) => setEditFormData({ ...editFormData, capacity: event.target.value })}
                              className="h-11 w-full rounded-md border border-amber-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                              required
                            />
                          ) : (
                            fitnessClass.capacity
                          )}
                        </td>
                        <td className="px-6 py-5 text-base">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(fitnessClass._id)}
                                disabled={saving}
                                className="mr-4 font-medium text-emerald-600 hover:underline"
                              >
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="font-medium text-slate-600 hover:underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEdit(fitnessClass)}
                                className="mr-4 font-medium text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(fitnessClass._id)}
                                className="font-medium text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
