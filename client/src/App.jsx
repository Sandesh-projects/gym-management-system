// client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Pages
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/Auth/SignInPage";
import SignUpPage from "./pages/Auth/SignUpPage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageMembers from "./pages/Admin/ManageMembers";
import ManageBills from "./pages/Admin/ManageBills";
import ManageFeePackages from "./pages/Admin/ManageFeePackages";
import ManageNotifications from "./pages/Admin/ManageNotifications";
import ManageSupplements from "./pages/Admin/ManageSupplements";
import ManageDietDetails from "./pages/Admin/ManageDietDetails";

// Member Pages
import MemberDashboard from "./pages/Members/MemberDashboard";
import ViewBillsPage from "./pages/Members/ViewBillsPage";
import ViewNotificationsPage from "./pages/Members/ViewNotificationsPage";

// User Pages
import UserDashboard from "./pages/User/UserDashboard";
import ViewProfilePage from "./pages/User/ViewProfilePage";

// Import Context Provider
import { AuthProvider } from "./context/AuthContext";

// Import Layout components
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      {" "}
      {/* Router should wrap the entire application */}
      <AuthProvider>
        {" "}
        {/* AuthProvider should also wrap the application */}
        <Navbar /> {/* Include Navbar */}
        <main className="py-3" style={{ height: "81.5vh" }}>
          {" "}
          {/* Added some padding */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected Routes using ProtectedRoute */}

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute element={AdminDashboard} requiredRole="Admin" />
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedRoute element={ManageMembers} requiredRole="Admin" />
              }
            />
            <Route
              path="/admin/bills"
              element={
                <ProtectedRoute element={ManageBills} requiredRole="Admin" />
              }
            />
            <Route
              path="/admin/fee-packages"
              element={
                <ProtectedRoute
                  element={ManageFeePackages}
                  requiredRole="Admin"
                />
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute
                  element={ManageNotifications}
                  requiredRole="Admin"
                />
              }
            />
            <Route
              path="/admin/supplements"
              element={
                <ProtectedRoute
                  element={ManageSupplements}
                  requiredRole="Admin"
                />
              }
            />
            <Route
              path="/admin/diet-details"
              element={
                <ProtectedRoute
                  element={ManageDietDetails}
                  requiredRole="Admin"
                />
              }
            />

            {/* Member Routes */}
            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute
                  element={MemberDashboard}
                  requiredRole="Member"
                />
              }
            />
            <Route
              path="/member/bills"
              element={
                <ProtectedRoute element={ViewBillsPage} requiredRole="Member" />
              }
            />
            <Route
              path="/member/notifications"
              element={
                <ProtectedRoute
                  element={ViewNotificationsPage}
                  requiredRole="Member"
                />
              }
            />

            {/* General Authenticated User Routes */}
            {/* UserDashboard might be a fallback or redirect based on role */}
            <Route
              path="/user/dashboard"
              element={<ProtectedRoute element={UserDashboard} />} // Protected, but no specific role required
            />
            {/* View Profile page - accessible to any authenticated user */}
            <Route
              path="/users/profile"
              element={<ProtectedRoute element={ViewProfilePage} />} // Protected, but no specific role required
            />

            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <div className="footer" style={{ bottom: 0 }}>
          <Footer /> {/* Include Footer */}
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
