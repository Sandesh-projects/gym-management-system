// client/src/pages/Members/MemberDashboard.jsx
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
import { Link } from "react-router-dom"; // Import Link

function MemberDashboard() {
  // You might fetch some member-specific stats here if your backend provides them
  // const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false); // Set to true if fetching stats
  const [error, setError] = useState("");

  const { user } = useAuth(); // Get logged-in user

  // You might use useEffect to fetch stats here if needed
  // useEffect(() => {
  //     if (user && user.role === 'Member') {
  //         fetchMemberStats(); // Example function
  //     }
  // }, [user]);

  // const fetchMemberStats = async () => {
  //     try {
  //          setLoading(true);
  //          // Assuming a backend route like GET /api/members/my/stats
  //          const res = await api.get('/api/members/my/stats');
  //          setStats(res.data);
  //          setError('');
  //     } catch (err) {
  //         console.error('Error fetching member stats:', err);
  //         setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  if (loading && !error) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading dashboard...</p>
      </Container>
    );
  }

  if (error && !loading) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Member Dashboard</h2>
      {user && <p>Welcome back, {user.username}!</p>}{" "}
      {/* Display welcome message */}
      {/* Example quick links to member specific pages */}
      <Row className="mt-4">
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>View My Bills</Card.Title>
              <Card.Text>Check the status and details of your bills.</Card.Text>
              <Button variant="primary" as={Link} to="/member/bills">
                Go to Bills
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>View My Notifications</Card.Title>
              <Card.Text>
                See important messages from the gym administration.
              </Card.Text>
              <Button variant="secondary" as={Link} to="/member/notifications">
                Go to Notifications
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>View My Profile</Card.Title>
              <Card.Text>Manage or view your profile details.</Card.Text>
              <Button variant="info" as={Link} to="/users/profile">
                Go to Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>
        {/* TODO: Add more cards/links for other member features like Diet Plans, Supplements, etc. */}
      </Row>
      {/* TODO: Display member-specific data like upcoming classes, personalized messages, etc. */}
    </Container>
  );
}

export default MemberDashboard;
