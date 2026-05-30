import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

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

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingClassId, setBookingClassId] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axiosInstance.get('/api/fitness-classes');
        setClasses(response.data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Failed to load fitness classes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleBookClass = async (fitnessClass) => {
    setBookingClassId(fitnessClass._id);
    setBookingMessage('');
    setBookingError('');

    try {
      await axiosInstance.post('/api/bookings', {
        fitnessClassId: fitnessClass._id,
      });
      setBookingMessage(`${fitnessClass.class} has been added to your bookings.`);
    } catch (bookError) {
      setBookingError(bookError.response?.data?.message || 'Failed to book class.');
    } finally {
      setBookingClassId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-base font-medium text-slate-700 shadow-sm">
        Loading classes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-8 text-center text-base font-medium text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-base font-medium text-slate-700 shadow-sm">
        No fitness classes are available yet.
      </div>
    );
  }

  return (
    <div>
      {bookingMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-base font-medium text-emerald-700">
          {bookingMessage}
        </div>
      )}
      {bookingError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-base font-medium text-red-700">
          {bookingError}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[#eefaff]">
              <tr>
                <th className="px-6 py-5 text-base font-bold text-slate-950">Class</th>
                <th className="px-6 py-5 text-base font-bold text-slate-950">Instructor</th>
                <th className="px-6 py-5 text-base font-bold text-slate-950">Date</th>
                <th className="px-6 py-5 text-base font-bold text-slate-950">Time</th>
                <th className="px-6 py-5 text-base font-bold text-slate-950">Capacity</th>
                <th className="px-6 py-5 text-base font-bold text-slate-950">Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((fitnessClass) => (
                <tr key={fitnessClass._id} className="border-t border-slate-200 transition hover:bg-slate-50">
                  <td className="px-6 py-5 text-base font-medium text-slate-950">{fitnessClass.class}</td>
                  <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.instructor}</td>
                  <td className="px-6 py-5 text-base text-slate-700">{formatDate(fitnessClass.date)}</td>
                  <td className="px-6 py-5 text-base text-slate-700">{formatTime(fitnessClass.time)}</td>
                  <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.capacity}</td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => handleBookClass(fitnessClass)}
                      disabled={bookingClassId === fitnessClass._id}
                      className="h-10 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {bookingClassId === fitnessClass._id ? 'Booking...' : 'Book'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassList;
