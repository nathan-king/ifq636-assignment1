import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClassList from './components/ClassList';
import axiosInstance from './axiosConfig';

jest.mock('./axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('books a class when the book button is clicked', async () => {
  axiosInstance.get.mockResolvedValue({
    data: [
      {
        _id: 'class-id',
        class: 'Yoga',
        instructor: 'Jack Jones',
        date: '2026-06-03T00:00:00.000Z',
        time: '19:00',
        capacity: 20,
      },
    ],
  });
  axiosInstance.post.mockResolvedValue({
    data: {
      id: 'booking-id',
      fitnessClass: 'class-id',
      status: 'booked',
    },
  });

  render(<ClassList />);

  fireEvent.click(await screen.findByRole('button', { name: /^book$/i }));

  await waitFor(() => {
    expect(axiosInstance.post).toHaveBeenCalledWith('/api/bookings', {
      fitnessClassId: 'class-id',
    });
  });

  expect(await screen.findByText('Yoga has been added to your bookings.')).toBeInTheDocument();
});

test('shows an error when booking fails', async () => {
  axiosInstance.get.mockResolvedValue({
    data: [
      {
        _id: 'class-id',
        class: 'Yoga',
        instructor: 'Jack Jones',
        date: '2026-06-03T00:00:00.000Z',
        time: '19:00',
        capacity: 20,
      },
    ],
  });
  axiosInstance.post.mockRejectedValue({
    response: {
      data: {
        message: 'Class already booked',
      },
    },
  });

  render(<ClassList />);

  fireEvent.click(await screen.findByRole('button', { name: /^book$/i }));

  expect(await screen.findByText('Class already booked')).toBeInTheDocument();
});
