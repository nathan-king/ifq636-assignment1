import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [previewMemberView, setPreviewMemberView] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setPreviewMemberView(false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setPreviewMemberView(false);
    localStorage.removeItem('user');
  };

  const togglePreviewMemberView = () => {
    setPreviewMemberView((currentPreviewMode) => !currentPreviewMode);
  };

  const isAdmin = user?.role === 'admin' && !previewMemberView;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, previewMemberView, togglePreviewMemberView }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
