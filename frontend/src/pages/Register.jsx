import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const { confirmPassword, ...registrationData } = formData;

    try {
      await axiosInstance.post('/api/auth/register', registrationData);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#eefaff] px-4 py-8 sm:px-6 lg:py-16">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 md:px-12 lg:py-12"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold leading-tight text-slate-950">
            Create Your Account
          </h1>
          <p className="mt-4 text-base text-slate-700">Fill in your details to get started</p>
        </div>

        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          <label className="block text-base font-semibold text-slate-950">
            Full Name
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block text-base font-semibold text-slate-950">
            Email
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block text-base font-semibold text-slate-950">
            Password
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block text-base font-semibold text-slate-950">
            Confirm Password
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-8 h-12 w-full rounded-md bg-blue-600 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Register
        </button>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-base text-slate-700 sm:flex-row sm:gap-6">
          <span>Already have an account?</span>
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
