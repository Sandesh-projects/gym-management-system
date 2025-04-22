// client/src/pages/Admin/AdminDashboard.jsx
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
import api from "../../utils/api"; // Import your API utility
import { useAuth } from "../../context/AuthContext"; // Import useAuth for potential role check
import { Link } from "react-router-dom"; // <= UNCOMMENTED THIS LINE

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth(); // Get logged-in user (optional, route protection is key)

  // TODO: Implement client-side role check if this page is not fully protected via routing
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false); // Stop loading if access is denied
    } else {
      fetchAdminStats(); // Fetch stats if user is Admin
    }
  }, [user]); // Re-run effect if user object changes

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      // Assuming your backend route for admin dashboard stats is GET /api/admin/dashboard-stats
      const res = await api.get("/api/admin/dashboard-stats");
      setStats(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError(
        err.response?.data?.message || "Failed to fetch dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger report export (example)
  const handleExportReport = async () => {
    try {
      setError(""); // Clear previous errors
      // Assuming your backend report export route is GET /api/admin/export-report
      // This backend route should handle file generation and sending the file
      const res = await api.get("/api/admin/export-report", {
        responseType: "blob", // Important for file downloads
      });

      // TODO: Implement client-side file download logic
      // Example basic download using a Blob
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Get filename from headers if possible (e.g., Content-Disposition) or use a default
      const contentDisposition = res.headers["content-disposition"];
      let filename = "report.csv"; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Clean up object URL

      console.log("Report export requested.");
    } catch (err) {
      console.error("Error exporting report:", err);
      setError(err.response?.data?.message || "Failed to export report.");
    }
  };

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

  // If user is null after loading, it means access was denied by the route or useEffect check
  // The error message will be displayed by the Alert above
  if (!user) {
    return null; // Don't render the rest of the component if user is not authorized/loaded
  }

  return (
    <Container className="mt-4">
      <h2>Admin Dashboard</h2>
      {user && <p>Welcome, Admin {user.username}!</p>}{" "}
      {/* Display welcome message */}
      {/* Display Key Stats */}
      <Row className="mt-4">
        <Col md={4} className="mb-4">
          <Card bg="primary" text="white" className="h-100">
            <Card.Body>
              <Card.Title>
                {stats.totalMembers !== undefined ? (
                  stats.totalMembers
                ) : (
                  <Spinner animation="border" size="sm" />
                )}
              </Card.Title>{" "}
              {/* Show spinner while stats load */}
              <Card.Text>Total Members</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card bg="warning" text="dark" className="h-100">
            <Card.Body>
              <Card.Title>
                {stats.pendingBills !== undefined ? (
                  stats.pendingBills
                ) : (
                  <Spinner animation="border" size="sm" />
                )}
              </Card.Title>{" "}
              {/* Show spinner while stats load */}
              <Card.Text>Pending Bills</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card bg="success" text="white" className="h-100">
            <Card.Body>
              <Card.Title>
                {stats.totalRevenue !== undefined ? (
                  `$${stats.totalRevenue.toFixed(2)}`
                ) : (
                  <Spinner animation="border" size="sm" />
                )}{" "}
                {/* Show spinner while stats load */}
              </Card.Title>
              <Card.Text>Total Revenue (Paid Bills)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        {/* Add more stat cards as needed */}
      </Row>
      {/* Admin Actions */}
      <Row className="mt-4">
        <Col>
          <h3>Actions</h3>
          {/* Link to management pages */}
          <Button
            variant="secondary"
            className="me-2 mb-2"
            as={Link}
            to="/admin/members"
          >
            Manage Members
          </Button>
          <Button
            variant="secondary"
            className="me-2 mb-2"
            as={Link}
            to="/admin/bills"
          >
            Manage Bills
          </Button>
          <Button
            variant="secondary"
            className="me-2 mb-2"
            as={Link}
            to="/admin/fee-packages"
          >
            Manage Fee Packages
          </Button>
          <Button
            variant="secondary"
            className="me-2 mb-2"
            as={Link}
            to="/admin/notifications"
          >
            Manage Notifications
          </Button>
          <Button
            variant="secondary"
            className="me-2 mb-2"
            as={Link}
            to="/admin/supplements"
          >
            Manage Supplements
          </Button>
          <Button
            variant="secondary"
            className="me-2 mb-2"
            as={Link}
            to="/admin/diet-details"
          >
            Manage Diet Details
          </Button>

          {/* Report Export Button */}
          <Button variant="info" className="mb-2" onClick={handleExportReport}>
            Export Report
          </Button>
        </Col>
      </Row>
      {/* TODO: Add charts, recent activity feed, etc. */}
    </Container>
  );
}

export default AdminDashboard;
