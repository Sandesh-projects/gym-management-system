// client/src/pages/Auth/SignUpPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate

function SignUpPage() {
  // State for form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("User"); // Default role for signup, usually 'User' or 'Member'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Local loading state for the form

  const { signup, user } = useAuth(); // Get the signup function from auth context
  const navigate = useNavigate(); // Get navigate function

  // If user is already logged in, redirect them (same logic as signin)
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "Admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "Member":
          navigate("/member/dashboard", { replace: true });
          break;
        default: // Default to general user dashboard or home
          navigate("/user/dashboard", { replace: true }); // Or '/'
      }
    }
  }, [user, navigate]); // Dependency array includes user and navigate

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors

    // Basic validation
    if (!username || !password || !confirmPassword) {
      return setError("Please fill in all fields");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 6) {
      // Optional: Add minimum password length check
      return setError("Password must be at least 6 characters long");
    }

    setLoading(true); // Start local loading
    try {
      // Call the signup function from context, passing username, password, and role
      await signup(username, password, role);
      // Successful signup will typically redirect to signin, handled in AuthContext
    } catch (err) {
      console.error("Sign-up error:", err); // Log the error
      setError(
        err.response?.data?.message || "Sign-up failed. Please try again."
      ); // Display error message
    } finally {
      setLoading(false); // End local loading
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">Sign Up</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}{" "}
              {/* Display error message */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formSignupUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Choose username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formSignupPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Choose password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="formSignupConfirmPassword"
                >
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* Optional: Allow user to select role on signup, usually restricted */}
                {/* If you want users to sign up as 'Member' by default, remove this */}
                <Form.Group className="mb-3" controlId="formSignupRole">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    as="select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    {/* Usually users can only sign up as 'User' or 'Member' */}
                    <option value="User">User</option>
                    <option value="Member">Member</option>
                    {/* Prevent signing up as Admin via this public route */}
                  </Form.Control>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Sign Up"}{" "}
                  {/* Button text changes */}
                </Button>
              </Form>
              <div className="mt-3 text-center">
                Already have an account? <Link to="/signin">Sign In</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default SignUpPage;
