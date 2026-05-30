import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate(response.data.role === 'admin' ? '/admin/classes' : '/classes');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#eefaff] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
          Fitness Class
          <span className="block">Booking System</span>
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-lg rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 md:px-12 lg:py-12"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold leading-tight text-slate-950">
            Welcome Back!
          </h2>
          <p className="mt-4 text-base text-slate-700">Login to your account</p>
        </div>

        <div className="space-y-6">
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
        </div>

        <div className="mt-5 text-right text-base">
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="mt-7 h-12 w-full rounded-md bg-blue-600 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Login
        </button>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-base text-slate-700 sm:flex-row sm:gap-6">
          <span>Don't have an account?</span>
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
