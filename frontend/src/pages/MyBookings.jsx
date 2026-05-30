import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import AppSidebar from '../components/AppSidebar';

const formatDate = (date) => {
  if (!date) return '';

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

const formatStatus = (status) => {
  if (!status) return '';

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get('/api/bookings');
        setBookings(response.data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    setCancellingBookingId(bookingId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.patch(`/api/bookings/${bookingId}/cancel`);

      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                ...response.data,
                fitnessClass: response.data.fitnessClass || booking.fitnessClass,
              }
            : booking
        )
      );
      setSuccessMessage('Booking cancelled.');
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-white md:flex">
      <AppSidebar active="bookings" />

      <main className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16 lg:py-16">
        <h2 className="mb-6 text-3xl font-bold text-slate-950">My Bookings</h2>

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-base font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-base font-medium text-red-700">
            {error}
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
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Status</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-950">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-base font-medium text-slate-700">
                      Loading bookings...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-base font-medium text-slate-700">
                      You have no bookings yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => {
                    const fitnessClass = booking.fitnessClass || {};

                    return (
                      <tr key={booking._id} className="border-t border-slate-200 transition hover:bg-slate-50">
                        <td className="px-6 py-5 text-base font-medium text-slate-950">
                          {fitnessClass.class || 'Unavailable class'}
                        </td>
                        <td className="px-6 py-5 text-base text-slate-700">{fitnessClass.instructor || '-'}</td>
                        <td className="px-6 py-5 text-base text-slate-700">{formatDate(fitnessClass.date)}</td>
                        <td className="px-6 py-5 text-base text-slate-700">{formatTime(fitnessClass.time)}</td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${
                              booking.status === 'cancelled'
                                ? 'bg-slate-100 text-slate-600 ring-slate-200'
                                : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            }`}
                          >
                            {formatStatus(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={booking.status === 'cancelled' || cancellingBookingId === booking._id}
                            className="font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                          >
                            {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyBookings;
