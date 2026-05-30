import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyBookings from './pages/MyBookings';
import axiosInstance from './axiosConfig';
import { AuthProvider } from './context/AuthContext';

jest.mock('./axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const renderMyBookings = () => {
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      token: 'test-token',
    })
  );

  return render(
    <AuthProvider>
      <MemoryRouter>
        <MyBookings />
      </MemoryRouter>
    </AuthProvider>
  );
};

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('loads bookings from the API', async () => {
  axiosInstance.get.mockResolvedValue({
    data: [
      {
        _id: 'booking-id',
        status: 'booked',
        fitnessClass: {
          _id: 'class-id',
          class: 'Yoga',
          instructor: 'Jack Jones',
          date: '2026-06-03T00:00:00.000Z',
          time: '19:00',
        },
      },
    ],
  });

  renderMyBookings();

  expect(axiosInstance.get).toHaveBeenCalledWith('/api/bookings');
  expect(await screen.findByText('Yoga')).toBeInTheDocument();
  expect(screen.getByText('Jack Jones')).toBeInTheDocument();
  expect(screen.getByText('3 June 2026')).toBeInTheDocument();
  expect(screen.getByText('7:00 PM')).toBeInTheDocument();
  expect(screen.getByText('Booked')).toBeInTheDocument();
});

test('shows an empty state when there are no bookings', async () => {
  axiosInstance.get.mockResolvedValue({ data: [] });

  renderMyBookings();

  expect(await screen.findByText('You have no bookings yet.')).toBeInTheDocument();
});

test('shows an error when bookings cannot be loaded', async () => {
  axiosInstance.get.mockRejectedValue({
    response: {
      data: {
        message: 'Failed to load bookings',
      },
    },
  });

  renderMyBookings();

  expect(await screen.findByText('Failed to load bookings')).toBeInTheDocument();
});

test('cancels a booking from the bookings table', async () => {
  axiosInstance.get.mockResolvedValue({
    data: [
      {
        _id: 'booking-id',
        status: 'booked',
        fitnessClass: {
          _id: 'class-id',
          class: 'Yoga',
          instructor: 'Jack Jones',
          date: '2026-06-03T00:00:00.000Z',
          time: '19:00',
        },
      },
    ],
  });
  axiosInstance.patch.mockResolvedValue({
    data: {
      _id: 'booking-id',
      status: 'cancelled',
      fitnessClass: {
        _id: 'class-id',
        class: 'Yoga',
        instructor: 'Jack Jones',
        date: '2026-06-03T00:00:00.000Z',
        time: '19:00',
      },
    },
  });

  renderMyBookings();

  fireEvent.click(await screen.findByRole('button', { name: /^cancel$/i }));

  await waitFor(() => {
    expect(axiosInstance.patch).toHaveBeenCalledWith('/api/bookings/booking-id/cancel');
  });

  expect(await screen.findByText('Booking cancelled.')).toBeInTheDocument();
  expect(screen.getByText('Cancelled')).toBeInTheDocument();
});

test('shows an error when booking cancellation fails', async () => {
  axiosInstance.get.mockResolvedValue({
    data: [
      {
        _id: 'booking-id',
        status: 'booked',
        fitnessClass: {
          _id: 'class-id',
          class: 'Yoga',
          instructor: 'Jack Jones',
          date: '2026-06-03T00:00:00.000Z',
          time: '19:00',
        },
      },
    ],
  });
  axiosInstance.patch.mockRejectedValue({
    response: {
      data: {
        message: 'Booking already cancelled',
      },
    },
  });

  renderMyBookings();

  fireEvent.click(await screen.findByRole('button', { name: /^cancel$/i }));

  expect(await screen.findByText('Booking already cancelled')).toBeInTheDocument();
});
