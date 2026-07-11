import {
  createContext,
  useMemo,
  useState,
} from "react";

import { STORAGE_KEYS } from "../constants/storageKeys";
import { getInitials } from "../utils/userUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {

    const savedUser = localStorage.getItem(
      STORAGE_KEYS.USER
    );

    return savedUser
      ? JSON.parse(savedUser)
      : null;

  });

  const login = (data) => {

    localStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      data.accessToken
    );

    localStorage.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      data.refreshToken
    );

    localStorage.setItem(
      STORAGE_KEYS.EMAIL,
      data.email
    );

    const userData = {

      name: data.name,

      email: data.email,

      initials: getInitials(data.name),

    };

    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(userData)
    );

    setUser(userData);

  };

  const logout = () => {

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    localStorage.removeItem(STORAGE_KEYS.USER);

    setUser(null);

  };

  const isAuthenticated = !!user;

  const value = useMemo(() => ({

    user,

    login,

    logout,

    isAuthenticated,

  }), [user]);

  return (

    <AuthContext.Provider value={value}>

      {children}

    </AuthContext.Provider>

  );

};