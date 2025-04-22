// client/src/pages/Admin/ManageFeePackages.jsx
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
// import moment from 'moment'; // Not needed for Fee Packages

function ManageFeePackages() {
  const [feePackages, setFeePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentFeePackage, setCurrentFeePackage] = useState(null); // For editing
  const [newFeePackageData, setNewFeePackageData] = useState({
    // State for Create Fee Package form
    name: "",
    duration: "",
    cost: "",
    description: "",
  });
  const [editFeePackageData, setEditFeePackageData] = useState({
    // State for Edit Fee Package form
    name: "",
    duration: "",
    cost: "",
    description: "",
  });

  const { user } = useAuth(); // Get logged-in user (optional, route protection is key)

  // TODO: Implement client-side role check if this page is not fully protected via routing
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false); // Stop loading if access is denied
    } else {
      fetchFeePackages(); // Fetch fee packages if user is Admin
    }
  }, [user]); // Re-run effect if user object changes

  // Function to fetch fee packages from the backend
  const fetchFeePackages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/fee-packages"); // Assuming your backend route is /api/fee-packages
      setFeePackages(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching fee packages:", err);
      setError(err.response?.data?.message || "Failed to fetch fee packages.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle creating a new fee package
  const handleCreateFeePackage = async () => {
    // TODO: Add frontend validation for new fee package data

    try {
      setError("");
      // Ensure cost is a number
      const cost = parseFloat(newFeePackageData.cost);
      if (isNaN(cost)) {
        return setError("Cost must be a valid number.");
      }

      // Assuming your backend expects name, duration, cost, description
      const res = await api.post("/api/fee-packages", {
        ...newFeePackageData,
        cost: cost, // Send as number
      }); // Assuming backend route is /api/fee-packages POST

      console.log("Fee package created:", res.data);
      setShowCreateModal(false); // Close the modal on success
      setNewFeePackageData({
        name: "",
        duration: "",
        cost: "",
        description: "",
      }); // Clear form
      fetchFeePackages(); // Refresh the list
    } catch (err) {
      console.error("Error creating fee package:", err);
      setError(err.response?.data?.message || "Failed to create fee package.");
    }
  };

  // Function to handle updating an existing fee package
  const handleUpdateFeePackage = async () => {
    if (!currentFeePackage) return;

    // TODO: Add frontend validation for edit fee package data

    try {
      setError("");
      // Ensure cost is a number if being updated
      const cost =
        editFeePackageData.cost !== undefined
          ? parseFloat(editFeePackageData.cost)
          : currentFeePackage.cost;
      if (isNaN(cost)) {
        return setError("Cost must be a valid number.");
      }

      // Assuming your backend update route is PUT /api/fee-packages/:id
      // Send updated data
      const res = await api.put(`/api/fee-packages/${currentFeePackage._id}`, {
        ...editFeePackageData,
        cost: cost, // Send as number
      });

      console.log("Fee package updated:", res.data);
      setShowEditModal(false); // Close the modal on success
      setCurrentFeePackage(null); // Clear current fee package
      fetchFeePackages(); // Refresh the list
    } catch (err) {
      console.error("Error updating fee package:", err);
      setError(err.response?.data?.message || "Failed to update fee package.");
    }
  };

  // Function to handle deleting a fee package
  const handleDeleteFeePackage = async (packageId) => {
    // TODO: Add a confirmation prompt before deleting
    if (window.confirm("Are you sure you want to delete this fee package?")) {
      try {
        setError("");
        // Assuming your backend delete route is DELETE /api/fee-packages/:id
        await api.delete(`/api/fee-packages/${packageId}`);

        console.log(`Fee package with ID ${packageId} deleted.`);
        // Remove the deleted fee package from the state
        setFeePackages(feePackages.filter((pkg) => pkg._id !== packageId));
      } catch (err) {
        console.error("Error deleting fee package:", err);
        setError(
          err.response?.data?.message || "Failed to delete fee package."
        );
      }
    }
  };

  // Handle opening the Create Fee Package modal
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setNewFeePackageData({ name: "", duration: "", cost: "", description: "" }); // Reset form state
    setShowCreateModal(false);
  };

  // Handle opening the Edit Fee Package modal and pre-populating the form
  const handleShowEditModal = (pkg) => {
    setCurrentFeePackage(pkg);
    setEditFeePackageData({
      name: pkg.name,
      duration: pkg.duration,
      cost: pkg.cost,
      description: pkg.description || "", // Handle potential null description
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setCurrentFeePackage(null);
    setEditFeePackageData({
      name: "",
      duration: "",
      cost: "",
      description: "",
    }); // Clear form
    setShowEditModal(false);
  };

  if (loading && !error) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading fee packages...</p>
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
      <h2>Manage Fee Packages</h2>

      <Button
        variant="primary"
        onClick={handleShowCreateModal}
        className="mb-3"
      >
        Create New Fee Package
      </Button>

      {feePackages.length === 0 ? (
        <p>No fee packages found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Duration</th>
              <th>Cost</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feePackages.map((pkg) => (
              <tr key={pkg._id}>
                <td>{pkg._id}</td>
                <td>{pkg.name}</td>
                <td>{pkg.duration}</td>
                <td>${pkg.cost.toFixed(2)}</td> {/* Format cost */}
                <td>{pkg.description || "N/A"}</td>{" "}
                {/* Display description or N/A */}
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowEditModal(pkg)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteFeePackage(pkg._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create Fee Package Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Fee Package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="createPackageName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter package name"
                value={newFeePackageData.name}
                onChange={(e) =>
                  setNewFeePackageData({
                    ...newFeePackageData,
                    name: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createPackageDuration">
              <Form.Label>Duration</Form.Label>
              <Form.Control
                type="text" // Or could be a select with predefined options
                placeholder="e.g., 1 Month, 3 Months"
                value={newFeePackageData.duration}
                onChange={(e) =>
                  setNewFeePackageData({
                    ...newFeePackageData,
                    duration: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createPackageCost">
              <Form.Label>Cost ($)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter cost"
                value={newFeePackageData.cost}
                onChange={(e) =>
                  setNewFeePackageData({
                    ...newFeePackageData,
                    cost: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createPackageDescription">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={newFeePackageData.description}
                onChange={(e) =>
                  setNewFeePackageData({
                    ...newFeePackageData,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateFeePackage}>
            Create Package
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Fee Package Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Fee Package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentFeePackage && ( // Ensure currentFeePackage is not null
            <Form>
              <Form.Group className="mb-3" controlId="editPackageName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter package name"
                  value={editFeePackageData.name}
                  onChange={(e) =>
                    setEditFeePackageData({
                      ...editFeePackageData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editPackageDuration">
                <Form.Label>Duration</Form.Label>
                <Form.Control
                  type="text" // Or could be a select
                  placeholder="e.g., 1 Month"
                  value={editFeePackageData.duration}
                  onChange={(e) =>
                    setEditFeePackageData({
                      ...editFeePackageData,
                      duration: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editPackageCost">
                <Form.Label>Cost ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter cost"
                  value={editFeePackageData.cost}
                  onChange={(e) =>
                    setEditFeePackageData({
                      ...editFeePackageData,
                      cost: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editPackageDescription">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter description"
                  value={editFeePackageData.description}
                  onChange={(e) =>
                    setEditFeePackageData({
                      ...editFeePackageData,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateFeePackage}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageFeePackages;
