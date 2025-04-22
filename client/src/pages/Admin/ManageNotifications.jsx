// client/src/pages/Admin/ManageNotifications.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import api from "../../utils/api"; // Import your API utility
import { useAuth } from "../../context/AuthContext"; // Import useAuth for potential role check
import moment from "moment"; // For date formatting

function ManageNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]); // To populate the member dropdown in create notification modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null); // For editing
  const [newNotificationData, setNewNotificationData] = useState({
    // State for Create Notification form
    memberId: "",
    message: "",
    type: "Other", // Default type
  });
  const [editNotificationData, setEditNotificationData] = useState({
    // State for Edit Notification form
    message: "",
    type: "",
    read: false, // Can mark as read/unread
  });

  const { user } = useAuth(); // Get logged-in user (optional, route protection is key)

  // TODO: Implement client-side role check if this page is not fully protected via routing
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false); // Stop loading if access is denied
    } else {
      fetchData(); // Fetch notifications and members if user is Admin
    }
  }, [user]); // Re-run effect if user object changes

  // Function to fetch initial data (notifications and members)
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Notifications
      const notificationsRes = await api.get("/api/notifications"); // Assuming backend route is /api/notifications GET
      setNotifications(notificationsRes.data);

      // Fetch Members to populate dropdown for assigning notifications
      const membersRes = await api.get("/api/members"); // Assuming backend route is /api/members GET
      // Filter out Admin users if notifications are only for Members/Users
      const nonAdmins = membersRes.data.filter(
        (member) => member.role !== "Admin"
      );
      setMembers(nonAdmins);

      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle creating a new notification
  const handleCreateNotification = async () => {
    // TODO: Add frontend validation for new notification data

    try {
      setError("");
      // Assuming your backend expects memberId, message, type
      const res = await api.post("/api/notifications", newNotificationData); // Assuming backend route is /api/notifications POST

      console.log("Notification created:", res.data);
      setShowCreateModal(false); // Close the modal on success
      setNewNotificationData({ memberId: "", message: "", type: "Other" }); // Clear form
      fetchData(); // Refresh the list
    } catch (err) {
      console.error("Error creating notification:", err);
      setError(err.response?.data?.message || "Failed to create notification.");
    }
  };

  // Function to handle updating an existing notification
  const handleUpdateNotification = async () => {
    if (!currentNotification) return;

    // TODO: Add frontend validation for edit notification data

    try {
      setError("");

      // Assuming your backend update route is PUT /api/notifications/:id
      // Send updated data
      const res = await api.put(
        `/api/notifications/${currentNotification._id}`,
        editNotificationData
      );

      console.log("Notification updated:", res.data);
      setShowEditModal(false); // Close the modal on success
      setCurrentNotification(null); // Clear current notification
      fetchData(); // Refresh the list
    } catch (err) {
      console.error("Error updating notification:", err);
      setError(err.response?.data?.message || "Failed to update notification.");
    }
  };

  // Function to handle deleting a notification
  const handleDeleteNotification = async (notificationId) => {
    // TODO: Add a confirmation prompt before deleting
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        setError("");
        // Assuming your backend delete route is DELETE /api/notifications/:id
        await api.delete(`/api/notifications/${notificationId}`);

        console.log(`Notification with ID ${notificationId} deleted.`);
        // Remove the deleted notification from the state
        setNotifications(
          notifications.filter((notif) => notif._id !== notificationId)
        );
      } catch (err) {
        console.error("Error deleting notification:", err);
        setError(
          err.response?.data?.message || "Failed to delete notification."
        );
      }
    }
  };

  // Handle opening the Create Notification modal
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setNewNotificationData({ memberId: "", message: "", type: "Other" }); // Reset form state
    setShowCreateModal(false);
  };

  // Handle opening the Edit Notification modal and pre-populating the form
  const handleShowEditModal = (notif) => {
    setCurrentNotification(notif);
    setEditNotificationData({
      message: notif.message,
      type: notif.type,
      read: notif.read,
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setCurrentNotification(null);
    setEditNotificationData({ message: "", type: "", read: false }); // Clear form
    setShowEditModal(false);
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
      <h2>Manage Notifications</h2>

      <Button
        variant="primary"
        onClick={handleShowCreateModal}
        className="mb-3"
      >
        Assign New Notification
      </Button>

      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th> {/* Display member username */}
              <th>Message</th>
              <th>Type</th>
              <th>Date</th>
              <th>Read</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notif) => (
              <tr key={notif._id}>
                <td>{notif._id}</td>
                <td>{notif.member ? notif.member.username : "N/A"}</td>{" "}
                {/* Display member username */}
                <td>{notif.message}</td>
                <td>{notif.type}</td>
                <td>
                  {moment(notif.createdAt).format("YYYY-MM-DD HH:mm")}
                </td>{" "}
                {/* Display creation date */}
                <td>
                  {notif.read ? (
                    <Badge bg="success">Yes</Badge>
                  ) : (
                    <Badge bg="secondary">No</Badge>
                  )}
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowEditModal(notif)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteNotification(notif._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create Notification Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Assign New Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="createNotificationMember">
              <Form.Label>Member</Form.Label>
              <Form.Control
                as="select"
                value={newNotificationData.memberId}
                onChange={(e) =>
                  setNewNotificationData({
                    ...newNotificationData,
                    memberId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.username} ({member.role})
                  </option>
                ))}
              </Form.Control>
              {/* TODO: Consider using react-select for a searchable dropdown if you have many members */}
            </Form.Group>

            <Form.Group className="mb-3" controlId="createNotificationMessage">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter notification message"
                value={newNotificationData.message}
                onChange={(e) =>
                  setNewNotificationData({
                    ...newNotificationData,
                    message: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createNotificationType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={newNotificationData.type}
                onChange={(e) =>
                  setNewNotificationData({
                    ...newNotificationData,
                    type: e.target.value,
                  })
                }
                required
              >
                <option value="Other">Other</option>
                <option value="Fee Reminder">Fee Reminder</option>
                <option value="Announcement">Announcement</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateNotification}>
            Assign Notification
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Notification Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentNotification && ( // Ensure currentNotification is not null
            <Form>
              <Form.Group className="mb-3" controlId="editNotificationMessage">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter notification message"
                  value={editNotificationData.message}
                  onChange={(e) =>
                    setEditNotificationData({
                      ...editNotificationData,
                      message: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editNotificationType">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  value={editNotificationData.type}
                  onChange={(e) =>
                    setEditNotificationData({
                      ...editNotificationData,
                      type: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Other">Other</option>
                  <option value="Fee Reminder">Fee Reminder</option>
                  <option value="Announcement">Announcement</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3" controlId="editNotificationRead">
                <Form.Check
                  type="checkbox"
                  label="Mark as Read"
                  checked={editNotificationData.read}
                  onChange={(e) =>
                    setEditNotificationData({
                      ...editNotificationData,
                      read: e.target.checked,
                    })
                  }
                />
              </Form.Group>

              {/* TODO: Potentially add read-only field for Member associated with the notification */}
              <Form.Group className="mb-3">
                <Form.Label>Member</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    currentNotification.member
                      ? currentNotification.member.username
                      : "N/A"
                  }
                  readOnly
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateNotification}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageNotifications;
