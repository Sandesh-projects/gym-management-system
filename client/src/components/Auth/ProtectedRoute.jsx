// client/src/components/Auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner, Container, Alert } from "react-bootstrap"; // Using Bootstrap for loading/error

// This component wraps a Route and checks if the user is authenticated and has the required role
// 'element' is the component to render if authorized
// 'requiredRole' is an optional string ('Admin' or 'Member')
const ProtectedRoute = ({ element: Element, requiredRole, ...rest }) => {
  const { user, loading } = useAuth();

  // Show a loading indicator while checking auth status from localStorage/token
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Checking authentication...</p>
      </Container>
    );
  }

  // If user is NOT logged in, redirect to signin page
  if (!user) {
    // Pass the current location in state so we can redirect back after login
    return <Navigate to="/signin" state={{ from: rest.path }} replace />;
  }

  // If a required role is specified AND the user is logged in but doesn't have that role
  if (requiredRole && user.role !== requiredRole) {
    // TODO: Redirect to a dedicated Unauthorized page or a different appropriate route
    console.warn(
      `User ${user.username} (Role: ${user.role}) attempted to access a ${requiredRole} page.`
    );
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          You are not authorized to view this page.
        </Alert>
        <div className="mt-3 text-center">
          {/* Provide a link back to their dashboard or home */}
          <Button
            variant="secondary"
            as={Link}
            to={`/${user.role.toLowerCase()}/dashboard`}
          >
            Go to Your Dashboard
          </Button>
        </div>
      </Container>
    );
    // return <Navigate to="/" replace />; // Or redirect to home as a fallback
  }

  // If authenticated AND authorized (role matches or no role required), render the component
  return <Element {...rest} />;
};

export default ProtectedRoute;
