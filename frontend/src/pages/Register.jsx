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
    <div className="min-h-[calc(100vh-64px)] bg-[#eaf8fd] px-4 py-12 sm:px-6 lg:py-24">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl rounded-lg border border-gray-300 bg-white px-6 py-10 sm:px-12 md:px-16 lg:py-16"
      >
        <div className="mb-12">
          <h1 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
            Create Your Account
          </h1>
          <p className="mt-6 text-lg text-black">Fill in your details to get started</p>
        </div>

        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          <label className="block text-lg font-bold text-black">
            Full Name
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-3 h-14 w-full rounded-md border border-gray-300 px-4 text-base font-normal outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block text-lg font-bold text-black">
            Email
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-3 h-14 w-full rounded-md border border-gray-300 px-4 text-base font-normal outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block text-lg font-bold text-black">
            Password
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-3 h-14 w-full rounded-md border border-gray-300 px-4 text-base font-normal outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block text-lg font-bold text-black">
            Confirm Password
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="mt-3 h-14 w-full rounded-md border border-gray-300 px-4 text-base font-normal outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-12 h-14 w-full rounded-md bg-blue-600 text-lg font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Register
        </button>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-lg text-black sm:flex-row sm:gap-20">
          <span>Already have an account?</span>
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
