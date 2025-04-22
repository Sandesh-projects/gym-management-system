// client/src/pages/Admin/ManageDietDetails.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import api from "../../utils/api"; // Import your API utility
import { useAuth } from "../../context/AuthContext"; // Import useAuth for potential role check

function ManageDietDetails() {
  const [dietDetails, setDietDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDietDetail, setCurrentDietDetail] = useState(null); // For editing
  const [newDietDetailData, setNewDietDetailData] = useState({
    // State for Create Diet Detail form
    title: "",
    content: "",
  });
  const [editDietDetailData, setEditDietDetailData] = useState({
    // State for Edit Diet Detail form
    title: "",
    content: "",
  });

  const { user } = useAuth(); // Get logged-in user (optional, route protection is key)

  // TODO: Implement client-side role check if this page is not fully protected via routing
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false); // Stop loading if access is denied
    } else {
      fetchDietDetails(); // Fetch diet details if user is Admin
    }
  }, [user]); // Re-run effect if user object changes

  // Function to fetch diet details from the backend
  const fetchDietDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/diet-details"); // Assuming your backend route is /api/diet-details
      setDietDetails(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching diet details:", err);
      setError(err.response?.data?.message || "Failed to fetch diet details.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle creating a new diet detail
  const handleCreateDietDetail = async () => {
    // TODO: Add frontend validation for new diet detail data

    try {
      setError("");
      // Assuming your backend expects title, content, potentially memberId
      const res = await api.post("/api/diet-details", newDietDetailData); // Assuming backend route is /api/diet-details POST

      console.log("Diet detail created:", res.data);
      setShowCreateModal(false); // Close the modal on success
      setNewDietDetailData({ title: "", content: "" }); // Clear form
      fetchDietDetails(); // Refresh the list
    } catch (err) {
      console.error("Error creating diet detail:", err);
      setError(err.response?.data?.message || "Failed to create diet detail.");
    }
  };

  // Function to handle updating an existing diet detail
  const handleUpdateDietDetail = async () => {
    if (!currentDietDetail) return;

    // TODO: Add frontend validation for edit diet detail data

    try {
      setError("");

      // Assuming your backend update route is PUT /api/diet-details/:id
      // Send updated data
      const res = await api.put(
        `/api/diet-details/${currentDietDetail._id}`,
        editDietDetailData
      );

      console.log("Diet detail updated:", res.data);
      setShowEditModal(false); // Close the modal on success
      setCurrentDietDetail(null); // Clear current diet detail
      fetchDietDetails(); // Refresh the list
    } catch (err) {
      console.error("Error updating diet detail:", err);
      setError(err.response?.data?.message || "Failed to update diet detail.");
    }
  };

  // Function to handle deleting a diet detail
  const handleDeleteDietDetail = async (detailId) => {
    // TODO: Add a confirmation prompt before deleting
    if (window.confirm("Are you sure you want to delete this diet detail?")) {
      try {
        setError("");
        // Assuming your backend delete route is DELETE /api/diet-details/:id
        await api.delete(`/api/diet-details/${detailId}`);

        console.log(`Diet detail with ID ${detailId} deleted.`);
        // Remove the deleted diet detail from the state
        setDietDetails(dietDetails.filter((detail) => detail._id !== detailId));
      } catch (err) {
        console.error("Error deleting diet detail:", err);
        setError(
          err.response?.data?.message || "Failed to delete diet detail."
        );
      }
    }
  };

  // Handle opening the Create Diet Detail modal
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setNewDietDetailData({ title: "", content: "" }); // Reset form state
    setShowCreateModal(false);
  };

  // Handle opening the Edit Diet Detail modal and pre-populating the form
  const handleShowEditModal = (detail) => {
    setCurrentDietDetail(detail);
    setEditDietDetailData({
      title: detail.title,
      content: detail.content,
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setCurrentDietDetail(null);
    setEditDietDetailData({ title: "", content: "" }); // Clear form
    setShowEditModal(false);
  };

  if (loading && !error) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading diet details...</p>
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
      <h2>Manage Diet Details</h2>

      <Button
        variant="primary"
        onClick={handleShowCreateModal}
        className="mb-3"
      >
        Add New Diet Detail
      </Button>

      {dietDetails.length === 0 ? (
        <p>No diet details found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dietDetails.map((detail) => (
              <tr key={detail._id}>
                <td>{detail._id}</td>
                <td>{detail.title}</td>
                <td>{detail.content}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowEditModal(detail)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteDietDetail(detail._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create Diet Detail Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Diet Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="createDetailTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={newDietDetailData.title}
                onChange={(e) =>
                  setNewDietDetailData({
                    ...newDietDetailData,
                    title: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createDetailContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Enter content"
                value={newDietDetailData.content}
                onChange={(e) =>
                  setNewDietDetailData({
                    ...newDietDetailData,
                    content: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            {/* TODO: If linking to a member, add member selection here */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateDietDetail}>
            Add Diet Detail
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Diet Detail Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Diet Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDietDetail && ( // Ensure currentDietDetail is not null
            <Form>
              <Form.Group className="mb-3" controlId="editDetailTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter title"
                  value={editDietDetailData.title}
                  onChange={(e) =>
                    setEditDietDetailData({
                      ...editDietDetailData,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editDetailContent">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Enter content"
                  value={editDietDetailData.content}
                  onChange={(e) =>
                    setEditDietDetailData({
                      ...editDietDetailData,
                      content: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              {/* TODO: If linking to a member, add read-only field for member or allow changing */}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateDietDetail}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageDietDetails;
