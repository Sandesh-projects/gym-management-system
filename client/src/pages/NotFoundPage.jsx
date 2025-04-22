// client/src/pages/NotFoundPage.jsx
import React from "react";
import { Container, Row, Col, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link

function NotFoundPage() {
  return (
    <Container className="mt-5 text-center">
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Alert variant="danger">
            <Alert.Heading>404 - Page Not Found</Alert.Heading>
            <p>The page you are looking for does not exist.</p>
            <hr />
            <p className="mb-0">
              Please check the URL or navigate back to the home page.
            </p>
            <div className="mt-3">
              <Button variant="outline-danger" as={Link} to="/">
                {" "}
                {/* Link back to home */}
                Go to Home
              </Button>
            </div>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
}

export default NotFoundPage;
