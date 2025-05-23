// client/src/components/Layout/Footer.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <footer className="bg-dark text-white mt-4 py-3" style={{ bottom: 0 }}>
      {" "}
      {/* Added margin-top and padding */}
      <Container>
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} GYM Management System. All
              Rights Reserved.
            </p>
            {/* TODO: Add more footer content like links or contact info */}
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
