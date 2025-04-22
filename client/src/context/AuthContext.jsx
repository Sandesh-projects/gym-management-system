// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api"; // Import your API utility
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State to hold the user object and loading status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Get the navigate function

  // Check for user data in local storage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      // Assuming the user object includes the token and role
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // TODO: Optional - Verify token with backend to ensure it's still valid
    }
    setLoading(false); // Set loading to false after checking storage
  }, []); // Empty dependency array means this runs once on mount

  // Login function
  const login = async (username, password) => {
    setLoading(true); // Start loading
    try {
      const res = await api.post("/api/auth/signin", { username, password });

      // Assuming backend sends user data and token on successful login
      const loggedInUser = res.data; // Assuming res.data is { _id, username, role, token }

      setUser(loggedInUser); // Set user in state
      localStorage.setItem("user", JSON.stringify(loggedInUser)); // Store user data (including token)

      // Set the token in the api utility for authenticated requests
      // This part should ideally be handled by an Axios interceptor in api.js
      // but for simplicity, you might set it here temporarily if not using an interceptor
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${loggedInUser.token}`;

      console.log("Login successful:", loggedInUser); // Log success

      // Redirect user based on role after successful login
      switch (loggedInUser.role) {
        case "Admin":
          navigate("/admin/dashboard");
          break;
        case "Member":
          navigate("/member/dashboard");
          break;
        default: // Default to general user dashboard or home
          navigate("/user/dashboard"); // Or '/'
      }
    } catch (error) {
      console.error("Login failed:", error); // Log error
      // Clear user data and token on login failure
      setUser(null);
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"]; // Remove token header

      // TODO: Handle login error feedback to user (e.g., display error message)
      throw error; // Re-throw error so components can handle it
    } finally {
      setLoading(false); // End loading
    }
  };

  // Logout function
  const logout = () => {
    setUser(null); // Clear user in state
    localStorage.removeItem("user"); // Remove user data from storage
    delete api.defaults.headers.common["Authorization"]; // Remove token from api utility headers
    navigate("/signin"); // Redirect to signin page after logout
  };

  // Signup function (basic placeholder - will need to send data to backend)
  const signup = async (username, password, role) => {
    setLoading(true); // Start loading
    try {
      // Assuming backend signup route is /api/auth/signup
      const res = await api.post("/api/auth/signup", {
        username,
        password,
        role,
      });

      // Depending on your backend, signup might automatically log the user in
      // If it does, handle setting user and token here similar to login
      console.log("Signup successful (placeholder)", res.data); // Log success

      // Often, after signup, you might redirect to a login page
      navigate("/signin"); // Redirect to signin after successful signup

      // If signup automatically logs in, you'd have:
      // const newUser = res.data;
      // setUser(newUser);
      // localStorage.setItem('user', JSON.stringify(newUser));
      // api.defaults.headers.common['Authorization'] = `Bearer ${newUser.token}`;
      // navigate('/dashboard based on role');
    } catch (error) {
      console.error("Signup failed:", error); // Log error
      // TODO: Handle signup error feedback to user
      throw error; // Re-throw error
    } finally {
      setLoading(false); // End loading
    }
  };

  // Context value to be provided to consuming components
  const contextValue = {
    user,
    loading,
    login,
    logout,
    signup, // Include signup in the context
  };

  // Provide the context value to children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to easily access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
