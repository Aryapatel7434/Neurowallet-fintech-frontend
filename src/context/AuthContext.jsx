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
  useState(() => {

    const savedUser =
      localStorage.getItem(
        "user"
      );

    return savedUser
      ? JSON.parse(savedUser)
      : null;

  });
 useEffect(() => {

  const savedUser =
    localStorage.getItem(
      "user"
    );

  if (savedUser) {

    setUser(
      JSON.parse(savedUser)
    );
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

  const userData = {

    name: "Arya",
    initials: "AP"
  };

  localStorage.setItem(
    "user",
    JSON.stringify(userData)
  );

  setUser(userData);
};

  const logout = () => {

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );
     localStorage.removeItem(
    "user"
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