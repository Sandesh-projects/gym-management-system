// client/src/pages/HomePage.jsx
import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap"; // Using Card as a Jumbotron alternative
import { Link } from "react-router-dom"; // Import Link for navigation
import { useAuth } from "../context/AuthContext"; // Import useAuth if you want to conditionally render buttons

function HomePage() {
  const { user } = useAuth(); // Get the logged-in user

  return (
    <Container className="mt-4 text-center">
      {/* Using a simple Card as a Jumbotron alternative in newer Bootstrap */}
      <Card className="bg-light py-5">
        <Card.Body>
          <Card.Title as="h1" className="display-4">
            Welcome to GYM Management System!
          </Card.Title>
          <Card.Text className="lead">
            Manage members, bills, fee packages, supplements, diet details, and
            more.
          </Card.Text>
          <hr className="my-4" />
          <Card.Text>
            {user
              ? `Welcome back, ${user.username}!`
              : "Sign in or sign up to get started."}
          </Card.Text>

          {/* Conditionally render buttons based on authentication status */}
          {!user ? (
            <div>
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to="/signin"
                className="me-2"
              >
                Sign In
              </Button>
              <Button variant="secondary" size="lg" as={Link} to="/signup">
                Sign Up
              </Button>
            </div>
          ) : (
            // If logged in, maybe show a link to their dashboard
            <Button
              variant="primary"
              size="lg"
              as={Link}
              to={`/${user.role.toLowerCase()}/dashboard`}
            >
              Go to Dashboard
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* TODO: Add more content, features, or sections for the home page */}
    </Container>
  );
}

export default HomePage;
