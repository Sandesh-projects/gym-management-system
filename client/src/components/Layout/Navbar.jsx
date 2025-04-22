// client/src/components/Layout/Navbar.jsx
import React from "react";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  NavDropdown,
} from "react-bootstrap"; // Import Bootstrap Navbar components
import { LinkContainer } from "react-router-bootstrap"; // For integrating react-router-dom with react-bootstrap Nav.Link
import { useAuth } from "../../context/AuthContext"; // Import useAuth

function Navbar() {
  const { user, logout } = useAuth(); // Get the logged-in user and logout function

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        {/* Brand/Logo - links to home */}
        <LinkContainer to="/">
          <BootstrapNavbar.Brand>GYM Management</BootstrapNavbar.Brand>
        </LinkContainer>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {" "}
            {/* ms-auto pushes links to the right */}
            {/* Public Links (Visible when not logged in) */}
            {!user && (
              <>
                <LinkContainer to="/signin">
                  <Nav.Link>Sign In</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/signup">
                  <Nav.Link>Sign Up</Nav.Link>
                </LinkContainer>
              </>
            )}
            {/* Authenticated User Links (Visible when logged in) */}
            {user && (
              <>
                {/* Link to User Dashboard (or specific role dashboard) */}
                <LinkContainer to={`/${user.role.toLowerCase()}/dashboard`}>
                  <Nav.Link>{user.role} Dashboard</Nav.Link>
                </LinkContainer>

                {/* Admin Specific Links */}
                {user.role === "Admin" && (
                  <NavDropdown title="Admin Actions" id="admin-nav-dropdown">
                    <LinkContainer to="/admin/members">
                      <NavDropdown.Item>Manage Members</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/bills">
                      <NavDropdown.Item>Manage Bills</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/fee-packages">
                      <NavDropdown.Item>Manage Fee Packages</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/notifications">
                      <NavDropdown.Item>Manage Notifications</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/supplements">
                      <NavDropdown.Item>Manage Supplements</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/admin/diet-details">
                      <NavDropdown.Item>Manage Diet Details</NavDropdown.Item>
                    </LinkContainer>
                    {/* TODO: Add link for Report Export if it has a dedicated page/modal */}
                  </NavDropdown>
                )}

                {/* Member Specific Links */}
                {user.role === "Member" && (
                  <NavDropdown title="My Account" id="member-nav-dropdown">
                    <LinkContainer to="/member/bills">
                      <NavDropdown.Item>My Bills</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/member/notifications">
                      <NavDropdown.Item>My Notifications</NavDropdown.Item>
                    </LinkContainer>
                    {/* TODO: Add other member links like View Diet, View Supplements, etc. */}
                  </NavDropdown>
                )}

                {/* General User Links (for any authenticated user) */}
                <LinkContainer to="/users/profile">
                  <Nav.Link>My Profile</Nav.Link>
                </LinkContainer>

                {/* Logout Button */}
                {/* Using a regular button or a Nav.Link with onClick */}
                <Nav.Link onClick={logout}>
                  Logout ({user.username}) {/* Display username */}
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
