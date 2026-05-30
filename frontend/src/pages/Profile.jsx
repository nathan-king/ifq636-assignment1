import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch profile data from the backend
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile');
        setFormData({
          name: response.data.name,
          email: response.data.email,
          university: response.data.university || '',
          address: response.data.address || '',
        });
      } catch (error) {
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="mt-20 text-center text-base font-medium text-slate-700">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#eefaff] px-4 py-8 sm:px-6 lg:py-16">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 md:px-12"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold leading-tight text-slate-950">Your Profile</h1>
          <p className="mt-4 text-base text-slate-700">Keep your account details up to date</p>
        </div>

        <div className="space-y-6">
          <label className="block text-base font-semibold text-slate-950">
            Name
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-base font-semibold text-slate-950">
            Email
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-base font-semibold text-slate-950">
            University
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-base font-semibold text-slate-950">
            Address
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-8 h-12 w-full rounded-md bg-blue-600 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
