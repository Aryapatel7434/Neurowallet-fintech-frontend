import {
  createContext,
  useState,
  useEffect
} from "react";

export const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {

  const [user, setUser] =
    useState(null);

  useEffect(() => {

    const accessToken =
      localStorage.getItem(
        "accessToken"
      );

    const refreshToken =
      localStorage.getItem(
        "refreshToken"
      );

    if (
      accessToken &&
      refreshToken
    ) {

      setUser({
        accessToken,
        refreshToken
      });
    }

  }, []);

  const login = (data) => {

    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    localStorage.setItem(
      "refreshToken",
      data.refreshToken
    );

    setUser(data);
  };

  const logout = () => {

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    setUser(null);
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>

  );
};