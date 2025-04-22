// client/src/pages/Admin/ManageSupplements.jsx
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

function ManageSupplements() {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSupplement, setCurrentSupplement] = useState(null); // For editing
  const [newSupplementData, setNewSupplementData] = useState({
    // State for Create Supplement form
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [editSupplementData, setEditSupplementData] = useState({
    // State for Edit Supplement form
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const { user } = useAuth(); // Get logged-in user (optional, route protection is key)

  // TODO: Implement client-side role check if this page is not fully protected via routing
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false); // Stop loading if access is denied
    } else {
      fetchSupplements(); // Fetch supplements if user is Admin
    }
  }, [user]); // Re-run effect if user object changes

  // Function to fetch supplements from the backend
  const fetchSupplements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/supplements"); // Assuming your backend route is /api/supplements
      setSupplements(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching supplements:", err);
      setError(err.response?.data?.message || "Failed to fetch supplements.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle creating a new supplement
  const handleCreateSupplement = async () => {
    // TODO: Add frontend validation for new supplement data

    try {
      setError("");
      // Ensure price and stock are numbers
      const price = parseFloat(newSupplementData.price);
      const stock = parseInt(newSupplementData.stock, 10);
      if (isNaN(price)) {
        // Check price first as it's required
        return setError("Price must be a valid number.");
      }
      if (isNaN(stock)) {
        // Check stock
        return setError("Stock must be a valid number.");
      }

      // Assuming your backend expects name, description, price, stock
      const res = await api.post("/api/supplements", {
        ...newSupplementData,
        price: price, // Send as number
        stock: stock, // Send as number
      }); // Assuming backend route is /api/supplements POST

      console.log("Supplement created:", res.data);
      setShowCreateModal(false); // Close the modal on success
      setNewSupplementData({ name: "", description: "", price: "", stock: "" }); // Clear form
      fetchSupplements(); // Refresh the list
    } catch (err) {
      console.error("Error creating supplement:", err);
      setError(err.response?.data?.message || "Failed to create supplement.");
    }
  };

  // Function to handle updating an existing supplement
  const handleUpdateSupplement = async () => {
    if (!currentSupplement) return;

    // TODO: Add frontend validation for edit supplement data

    try {
      setError("");
      // Ensure price and stock are numbers if being updated
      const price =
        editSupplementData.price !== undefined
          ? parseFloat(editSupplementData.price)
          : currentSupplement.price;
      const stock =
        editSupplementData.stock !== undefined
          ? parseInt(editSupplementData.stock, 10)
          : currentSupplement.stock;
      if (isNaN(price)) {
        // Check price
        return setError("Price must be a valid number.");
      }
      if (isNaN(stock)) {
        // Check stock
        return setError("Stock must be a valid number.");
      }

      // Assuming your backend update route is PUT /api/supplements/:id
      // Send updated data
      const res = await api.put(`/api/supplements/${currentSupplement._id}`, {
        ...editSupplementData,
        price: price, // Send as number
        stock: stock, // Send as number
      });

      console.log("Supplement updated:", res.data);
      setShowEditModal(false); // Close the modal on success
      setCurrentSupplement(null); // Clear current supplement
      fetchSupplements(); // Refresh the list
    } catch (err) {
      console.error("Error updating supplement:", err);
      setError(err.response?.data?.message || "Failed to update supplement.");
    }
  };

  // Function to handle deleting a supplement
  const handleDeleteSupplement = async (supplementId) => {
    // TODO: Add a confirmation prompt before deleting
    if (window.confirm("Are you sure you want to delete this supplement?")) {
      try {
        setError("");
        // Assuming your backend delete route is DELETE /api/supplements/:id
        await api.delete(`/api/supplements/${supplementId}`);

        console.log(`Supplement with ID ${supplementId} deleted.`);
        // Remove the deleted supplement from the state
        setSupplements(supplements.filter((supp) => supp._id !== supplementId));
      } catch (err) {
        console.error("Error deleting supplement:", err);
        setError(err.response?.data?.message || "Failed to delete supplement.");
      }
    }
  };

  // Handle opening the Create Supplement modal
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setNewSupplementData({ name: "", description: "", price: "", stock: "" }); // Reset form state
    setShowCreateModal(false);
  };

  // Handle opening the Edit Supplement modal and pre-populating the form
  const handleShowEditModal = (supp) => {
    setCurrentSupplement(supp);
    setEditSupplementData({
      name: supp.name,
      description: supp.description,
      price: supp.price,
      stock: supp.stock,
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setCurrentSupplement(null);
    setEditSupplementData({ name: "", description: "", price: "", stock: "" }); // Clear form
    setShowEditModal(false);
  };

  if (loading && !error) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading supplements...</p>
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
      <h2>Manage Supplements</h2>

      <Button
        variant="primary"
        onClick={handleShowCreateModal}
        className="mb-3"
      >
        Add New Supplement
      </Button>

      {supplements.length === 0 ? (
        <p>No supplements found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {supplements.map((supp) => (
              <tr key={supp._id}>
                <td>{supp._id}</td>
                <td>{supp.name}</td>
                <td>{supp.description}</td>
                <td>${supp.price.toFixed(2)}</td> {/* Format price */}
                <td>{supp.stock}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowEditModal(supp)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteSupplement(supp._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create Supplement Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Supplement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="createSupplementName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter supplement name"
                value={newSupplementData.name}
                onChange={(e) =>
                  setNewSupplementData({
                    ...newSupplementData,
                    name: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group
              className="mb-3"
              controlId="createSupplementDescription"
            >
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={newSupplementData.description}
                onChange={(e) =>
                  setNewSupplementData({
                    ...newSupplementData,
                    description: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createSupplementPrice">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={newSupplementData.price}
                onChange={(e) =>
                  setNewSupplementData({
                    ...newSupplementData,
                    price: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createSupplementStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter stock quantity"
                value={newSupplementData.stock}
                onChange={(e) =>
                  setNewSupplementData({
                    ...newSupplementData,
                    stock: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateSupplement}>
            Add Supplement
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Supplement Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Supplement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSupplement && ( // Ensure currentSupplement is not null
            <Form>
              <Form.Group className="mb-3" controlId="editSupplementName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter supplement name"
                  value={editSupplementData.name}
                  onChange={(e) =>
                    setEditSupplementData({
                      ...editSupplementData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group
                className="mb-3"
                controlId="editSupplementDescription"
              >
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter description"
                  value={editSupplementData.description}
                  onChange={(e) =>
                    setEditSupplementData({
                      ...editSupplementData,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editSupplementPrice">
                <Form.Label>Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter price"
                  value={editSupplementData.price}
                  onChange={(e) =>
                    setEditSupplementData({
                      ...editSupplementData,
                      price: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editSupplementStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter stock quantity"
                  value={editSupplementData.stock}
                  onChange={(e) =>
                    setEditSupplementData({
                      ...editSupplementData,
                      stock: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateSupplement}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageSupplements;
