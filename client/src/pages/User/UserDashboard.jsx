// client/src/pages/User/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
// import api from '../../utils/api'; // Might not need API calls directly on the dashboard
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate

function UserDashboard() {
  // This dashboard is for any authenticated user.
  // You might redirect based on role from here, or show general info/links.

  const [loading, setLoading] = useState(false); // Set to true if fetching stats
  const [error, setError] = useState("");

  const { user, loading: authLoading } = useAuth(); // Get logged-in user and auth loading state
  const navigate = useNavigate(); // Get navigate function

  // Redirect logic if this dashboard isn't intended for all roles
  // Example: if you only want Admin/Member dashboards
  // useEffect(() => {
  //     if (!authLoading && user) { // Wait until auth loading is done
  //          if (user.role === 'Admin') {
  //              navigate('/admin/dashboard', { replace: true });
  //          } else if (user.role === 'Member') {
  //              navigate('/member/dashboard', { replace: true });
  //          }
  //          // If the user has a different role or 'User', they stay here
  //     } else if (!authLoading && !user) {
  // If not logged in after auth loading, redirect to signin (though ProtectedRoute handles this)
  //          navigate('/signin', { replace: true });
  //     }
  // }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    // Consider authLoading as well
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading dashboard...</p>
      </Container>
    );
  }

  if (error) {
    // Only show local error
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // If user is null after authLoading, ProtectedRoute should have redirected, but adding a check is safe
  if (!user) {
    return null; // Or a redirect message
  }

  return (
    <Container className="mt-4">
      <h2>User Dashboard</h2>
      {user && (
        <p>
          Welcome back, {user.username}! Your role is {user.role}.
        </p>
      )}{" "}
      {/* Display welcome message and role */}
      <Row className="mt-4">
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>View My Profile</Card.Title>
              <Card.Text>Access and manage your personal details.</Card.Text>
              <Button variant="primary" as={Link} to="/users/profile">
                Go to Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Conditionally show links based on role if needed */}
        {user.role === "Member" && (
          <>
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>View My Bills</Card.Title>
                  <Card.Text>Check your bill receipts.</Card.Text>
                  <Button variant="secondary" as={Link} to="/member/bills">
                    Go to Bills
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>View My Notifications</Card.Title>
                  <Card.Text>See important messages.</Card.Text>
                  <Button variant="info" as={Link} to="/member/notifications">
                    Go to Notifications
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        {/* Add more general user links here */}
      </Row>
      {/* TODO: Display general user info, announcements, etc. */}
    </Container>
  );
}

export default UserDashboard;
