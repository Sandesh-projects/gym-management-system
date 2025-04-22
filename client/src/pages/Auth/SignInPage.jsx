// client/src/pages/Auth/SignInPage.jsx
import React, { useState, useEffect } from "react";
// import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import {
  Container,
  Form,
  Button,
  Card,
  Alert,
  Row,
  Col,
} from "react-bootstrap"; // Added Row and Col
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate

function SignInPage() {
  // State for form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Local loading state for the form

  const { login, user } = useAuth(); // Get the login function and user from auth context
  const navigate = useNavigate(); // Get navigate function

  // If user is already logged in, redirect them based on their role
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "Admin":
          navigate("/admin/dashboard", { replace: true }); // replace: true prevents going back to signin
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
    if (!username || !password) {
      return setError("Please enter username and password");
    }

    setLoading(true); // Start local loading
    try {
      await login(username, password); // Call the login function from context
      // Redirection is handled within the login function in AuthContext
    } catch (err) {
      console.error("Sign-in error:", err); // Log the error
      setError(
        err.response?.data?.message ||
          "Sign-in failed. Please check your credentials."
      ); // Display error message from backend or default
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
              <Card.Title className="text-center">Sign In</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}{" "}
              {/* Display error message */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}{" "}
                  {/* Button text changes based on loading state */}
                </Button>
              </Form>
              <div className="mt-3 text-center">
                New User? <Link to="/signup">Sign Up</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default SignInPage;
