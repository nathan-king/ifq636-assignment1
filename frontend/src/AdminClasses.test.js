import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminClasses from './pages/AdminClasses';
import axiosInstance from './axiosConfig';
import { AuthProvider } from './context/AuthContext';

jest.mock('./axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const renderAdminClasses = () => {
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 'admin-id',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      token: 'admin-token',
    })
  );

  return render(
    <AuthProvider>
      <MemoryRouter>
        <AdminClasses />
      </MemoryRouter>
    </AuthProvider>
  );
};

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('admin can edit a class row and submit the update request', async () => {
  axiosInstance.get.mockResolvedValue({
    data: [
      {
        _id: 'class-id',
        class: 'Yoga',
        instructor: 'Jack Jones',
        date: '2026-06-03T00:00:00.000Z',
        time: '19:00',
        capacity: 20,
        status: 'confirmed',
      },
    ],
  });
  axiosInstance.put.mockResolvedValue({
    data: {
      _id: 'class-id',
      class: 'Pilates',
      instructor: 'Jessica Smith',
      date: '2026-06-04',
      time: '18:30',
      capacity: 15,
      status: 'confirmed',
    },
  });

  renderAdminClasses();

  fireEvent.click(await screen.findByRole('button', { name: /^edit$/i }));

  expect(screen.getByLabelText(/edit class name/i)).toHaveValue('Yoga');
  expect(screen.getByLabelText(/edit instructor/i)).toHaveValue('Jack Jones');
  expect(screen.getByLabelText(/edit date/i)).toHaveValue('2026-06-03');
  expect(screen.getByLabelText(/edit time/i)).toHaveValue('19:00');
  expect(screen.getByLabelText(/edit capacity/i)).toHaveValue(20);

  fireEvent.change(screen.getByLabelText(/edit class name/i), {
    target: { value: 'Pilates' },
  });
  fireEvent.change(screen.getByLabelText(/edit instructor/i), {
    target: { value: 'Jessica Smith' },
  });
  fireEvent.change(screen.getByLabelText(/edit date/i), {
    target: { value: '2026-06-04' },
  });
  fireEvent.change(screen.getByLabelText(/edit time/i), {
    target: { value: '18:30' },
  });
  fireEvent.change(screen.getByLabelText(/edit capacity/i), {
    target: { value: '15' },
  });

  fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

  await waitFor(() => {
    expect(axiosInstance.put).toHaveBeenCalledWith('/api/fitness-classes/class-id', {
      class: 'Pilates',
      instructor: 'Jessica Smith',
      date: '2026-06-04',
      time: '18:30',
      capacity: 15,
    });
  });

  expect(await screen.findByText('Pilates')).toBeInTheDocument();
  expect(screen.getByText('Jessica Smith')).toBeInTheDocument();
  expect(screen.queryByLabelText(/edit class name/i)).not.toBeInTheDocument();
});
