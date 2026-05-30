import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import AppSidebar from '../components/AppSidebar';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get('/api/auth/profile');
        setFormData({
          name: response.data.name,
          email: response.data.email,
          university: response.data.university || '',
          address: response.data.address || '',
          role: response.data.role || user?.role || 'user',
        });
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await axiosInstance.put('/api/auth/profile', {
        name: formData.name,
        email: formData.email,
        university: formData.university,
        address: formData.address,
      });
      setFormData({
        name: response.data.name,
        email: response.data.email,
        university: response.data.university || '',
        address: response.data.address || '',
        role: response.data.role || formData.role,
      });
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-white md:flex">
      <AppSidebar active="profile" />

      <main className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16 lg:py-16">
        <h2 className="mb-6 text-3xl font-bold text-slate-950">Your Profile</h2>

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

        <form onSubmit={handleSubmit} className="max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[#eefaff] px-6 py-5">
            <h3 className="text-base font-bold text-slate-950">Account Details</h3>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-base font-medium text-slate-700">Loading profile...</div>
          ) : (
            <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">
              <label className="block text-base font-semibold text-slate-950">
                Name
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-normal text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block text-base font-semibold text-slate-950">
                Email
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-normal text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block text-base font-semibold text-slate-950">
                University
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-normal text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block text-base font-semibold text-slate-950">
                Address
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-base font-normal text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="block text-base font-semibold text-slate-950">
                Account Type
                <div className="mt-2 flex h-11 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-base font-medium text-slate-700">
                  {formData.role === 'admin' ? 'Admin' : 'Member'}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 px-6 py-5">
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Profile;
