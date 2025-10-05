import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loginAsAdmin = () => {
    setUser({
      id: 1,
      name: 'Administrador',
      email: 'admin@facefind.com',
      role: 'admin'
    });
  };

  const loginAsUser = () => {
    setUser({
      id: 2,
      name: 'Usuario',
      email: 'usuario@facefind.com',
      role: 'user'
    });
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginAsAdmin,
      loginAsUser,
      logout,
      isAdmin,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
