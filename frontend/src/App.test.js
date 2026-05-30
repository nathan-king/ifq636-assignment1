import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const renderWithAuth = (ui, initialEntries = ['/']) => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthProvider>
  );
};

beforeEach(() => {
  localStorage.clear();
});

test('logout clears the stored user session and shows logged-out navigation', () => {
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      token: 'test-token',
    })
  );

  renderWithAuth(<Navbar />);

  fireEvent.click(screen.getByRole('button', { name: /logout/i }));

  expect(localStorage.getItem('user')).toBeNull();
  expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
});

test('protected routes redirect logged-out users to login', () => {
  renderWithAuth(
    <Routes>
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <div>Protected profile content</div>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<div>Login page</div>} />
    </Routes>,
    ['/profile']
  );

  expect(screen.getByText(/login page/i)).toBeInTheDocument();
  expect(screen.queryByText(/protected profile content/i)).not.toBeInTheDocument();
});
