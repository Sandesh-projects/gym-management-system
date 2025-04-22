// client/src/pages/User/ViewProfilePage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  ListGroup,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import api from "../../utils/api"; // Import your API utility
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook
import moment from "moment"; // For date formatting

function ViewProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, loading: authLoading } = useAuth(); // Get the logged-in user from context and auth loading

  // TODO: Implement client-side check if this page is not fully protected via routing
  useEffect(() => {
    // Wait for auth loading to complete before checking user
    if (!authLoading) {
      if (!user) {
        // Check if user is logged in at all
        setError(
          "Access Denied: You need to be logged in to view your profile."
        );
        setLoading(false); // Stop local loading if access is denied
      } else {
        fetchUserProfile(); // Fetch profile if user is logged in
      }
    }
  }, [user, authLoading]); // Re-run effect if user or authLoading changes

  // Function to fetch the logged-in user's profile from the backend
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Assuming your backend route for logged-in user profile is GET /api/users/profile
      // The backend controller uses req.user._id to find the profile
      const res = await api.get("/api/users/profile");
      setProfile(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.response?.data?.message || "Failed to fetch your profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    // Consider authLoading as well
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading profile...</p>
      </Container>
    );
  }

  if (error && !loading) {
    // Only show error if not currently loading data
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Only render if profile data is available and no error
  if (!profile && !loading) {
    return (
      <Container className="mt-5 text-center">
        <p>Profile data not available.</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>My Profile</h2>

      {/* Use a Row and Col for better layout */}
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>{profile.username}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Role: {profile.role}
              </Card.Subtitle>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>User ID:</strong> {profile._id}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Joined:</strong>{" "}
                  {moment(profile.createdAt).format("YYYY-MM-DD HH:mm")}
                </ListGroup.Item>
                {/* TODO: Add other profile details if available in the User model and fetched */}
                {/* <ListGroup.Item><strong>Email:</strong> {profile.email}</ListGroup.Item> */}
                {/* <ListGroup.Item><strong>Contact:</strong> {profile.contact}</ListGroup.Item> */}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* TODO: Add a button/link to edit profile if allowed */}
          {/* <div className="mt-3">
                   <LinkContainer to="/users/edit-profile"> // Assuming an edit profile route
                       <Button variant="secondary">Edit Profile</Button>
                   </LinkContainer>
              </div> */}
        </Col>
      </Row>
    </Container>
  );
}

export default ViewProfilePage;
