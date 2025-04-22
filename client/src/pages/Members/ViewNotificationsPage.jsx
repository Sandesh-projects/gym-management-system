// client/src/pages/Members/ViewNotificationsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  ListGroup,
  Alert,
  Spinner,
  Card,
  Button,
  Badge,
} from "react-bootstrap";
import api from "../../utils/api"; // Import your API utility
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook
import moment from "moment"; // For date formatting

function ViewNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth(); // Get the logged-in user from context

  // TODO: Implement client-side role check if this page is not fully protected via routing
  useEffect(() => {
    // Check if user is logged in AND is a Member before fetching
    if (!user) {
      setError(
        "Access Denied: You need to be logged in to view your notifications."
      );
      setLoading(false);
    } else if (user.role !== "Member") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false);
    } else {
      fetchMemberNotifications(); // Fetch notifications if user is a Member
    }
  }, [user]); // Re-run effect if user object changes

  // Function to fetch notifications for the logged-in member
  const fetchMemberNotifications = async () => {
    try {
      setLoading(true);
      // Assuming your backend route for a member's notifications is GET /api/members/my/notifications
      // The backend controller uses req.user._id to find the notifications
      const res = await api.get("/api/members/my/notifications");
      // Sort notifications by date, newest first
      const sortedNotifications = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sortedNotifications);
      setError("");
    } catch (err) {
      console.error("Error fetching member notifications:", err);
      setError(
        err.response?.data?.message || "Failed to fetch your notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  // Optional function to mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      setError(""); // Clear previous errors
      // Assuming your backend route to update a notification is PUT /api/members/my/notifications/:id
      // Send { read: true } in the body
      await api.put(`/api/members/my/notifications/${notificationId}`, {
        read: true,
      });

      // Update the notification's read status in the local state
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      console.log(`Notification ${notificationId} marked as read.`);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(
        err.response?.data?.message || "Failed to mark notification as read."
      );
    }
  };

  if (loading && !error) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading notifications...</p>
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
      <h2>My Notifications</h2>

      {notifications.length === 0 ? (
        <p>You have no notifications.</p>
      ) : (
        <>
          <ListGroup>
            {notifications.map((notif) => (
              <ListGroup.Item
                key={notif._id}
                className={`d-flex justify-content-between align-items-start ${
                  notif.read ? "text-muted" : "font-weight-bold"
                }`}
              >
                <div className="ms-2 me-auto">
                  <div className={`fw-bold ${notif.read ? "text-muted" : ""}`}>
                    {notif.type || "Notification"}
                  </div>
                  <p className={`mb-1 ${notif.read ? "text-muted" : ""}`}>
                    {notif.message}
                  </p>
                  <small className={notif.read ? "text-muted" : ""}>
                    Received on{" "}
                    {moment(notif.createdAt).format("YYYY-MM-DD HH:mm")}
                  </small>
                </div>
                {!notif.read && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => markAsRead(notif._id)}
                  >
                    Mark as Read
                  </Button>
                )}
                {notif.read && <Badge bg="secondary">Read</Badge>}
              </ListGroup.Item>
            ))}
          </ListGroup>

          {/* Alternative using Cards (commented out in previous response) */}
        </>
      )}
    </Container>
  );
}

export default ViewNotificationsPage;
