import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('voucher_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('voucher_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('voucher_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('voucher_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('voucher_token', token);
    } else {
      localStorage.removeItem('voucher_token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  // Quick Role Switcher for instant testing in Demo mode
  const switchRoleDemo = async (roleEmail) => {
    return await login(roleEmail, 'Password123!');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('voucher_user');
    localStorage.removeItem('voucher_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, switchRoleDemo, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
