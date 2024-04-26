import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const navigate = useNavigate();
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true,
  });

  const handleError = (error) => {
    if (error.response && error.response.status === 401) {
      handleUserLogout();
    }
    console.error("Error during request:", error);
  };

  useEffect(() => {
    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        handleError(error);
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(0);
    };
  }, []);

  const handleUserLogout = async () => {
    try {
      await apiClient.get("/logout");
    } catch (error) {
      handleError(error);
    } finally {
      localStorage.clear();
      setIsUserLoggedIn(false);
      navigate("/");
    }
  };

  const handleSubmitLogin = async (values) => {
    const { email, password } = values;
    const userData = { email, password };

    try {
      const response = await apiClient.post("/login", userData);

      if (response.data.ok) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("firstName", user.firstName);
        localStorage.setItem("lastName", user.lastName);
        localStorage.setItem("role", user.role);
        localStorage.setItem("id", user._id);
        setIsUserLoggedIn(true);
        navigate("/");
      }
    } catch (error) {
      handleError(error);
      setErrorMessage("Invalid email or password");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isUserLoggedIn,
        handleUserLogout,
        handleSubmitLogin,
        errorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
