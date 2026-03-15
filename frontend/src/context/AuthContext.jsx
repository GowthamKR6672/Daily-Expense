import React, { createContext, useState, useEffect } from 'react';
import API from '../api';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState('none');

  const checkSiteStatus = async () => {
    try {
      const { data } = await API.get('/admin/settings');
      setMaintenanceMode(data.maintenanceMode || 'none');
    } catch {
      // If check fails, don't block the user
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser(data.user);
        } catch (error) {
          Cookies.remove('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
    checkSiteStatus();

    // Poll every 30 seconds for maintenance mode changes
    const interval = setInterval(checkSiteStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const login = (userData, token) => {
    Cookies.set('token', token, { expires: 30 });
    setUser(userData);
    checkSiteStatus();
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, maintenanceMode, setMaintenanceMode }}>
      {children}
    </AuthContext.Provider>
  );
};
