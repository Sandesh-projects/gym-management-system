// client/src/pages/Admin/ManageBills.jsx
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
import moment from "moment"; // For date formatting

function ManageBills() {
  const [bills, setBills] = useState([]);
  const [members, setMembers] = useState([]); // To populate the member dropdown in create bill modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBill, setCurrentBill] = useState(null); // For editing
  const [newBillData, setNewBillData] = useState({
    // State for Create Bill form
    memberId: "", // To link the bill to a member
    amount: "",
    date: "", // Store date as string initially
    status: "Pending", // Default status
  });
  const [editBillData, setEditBillData] = useState({
    // State for Edit Bill form
    amount: "",
    date: "", // Store date as string initially
    status: "",
    // memberId should probably not be editable after creation
  });

  const { user } = useAuth(); // Get logged-in user (optional, route protection is key)

  // TODO: Implement client-side role check if this page is not fully protected via routing
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false); // Stop loading if access is denied
    } else {
      fetchData(); // Fetch bills and members if user is Admin
    }
  }, [user]); // Re-run effect if user object changes

  // Function to fetch initial data (bills and members)
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Bills
      const billsRes = await api.get("/api/bills"); // Assuming backend route is GET /api/bills
      setBills(billsRes.data);

      // Fetch Members to populate dropdown for assigning bills
      const membersRes = await api.get("/api/members"); // Assuming backend route is GET /api/members
      setMembers(membersRes.data);

      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle creating a new bill
  const handleCreateBill = async () => {
    // TODO: Add frontend validation for new bill data

    try {
      setError("");
      // Ensure amount is a number and date is valid
      const amount = parseFloat(newBillData.amount);
      if (isNaN(amount)) {
        return setError("Amount must be a valid number.");
      }
      if (!moment(newBillData.date).isValid()) {
        return setError("Date is invalid.");
      }

      // Assuming your backend expects memberId, amount, date, status
      const res = await api.post("/api/bills", {
        ...newBillData,
        amount: amount, // Send as number
        date: newBillData.date ? new Date(newBillData.date) : undefined, // Convert date string to Date object
      }); // Assuming backend route is /api/bills POST

      console.log("Bill created:", res.data);
      setShowCreateModal(false); // Close the modal on success
      setNewBillData({ memberId: "", amount: "", date: "", status: "Pending" }); // Clear form
      fetchData(); // Refresh the list
    } catch (err) {
      console.error("Error creating bill:", err);
      setError(err.response?.data?.message || "Failed to create bill.");
    }
  };

  // Function to handle updating an existing bill
  const handleUpdateBill = async () => {
    if (!currentBill) return;

    // TODO: Add frontend validation for edit bill data

    try {
      setError("");
      // Ensure amount is a number if being updated
      const amount =
        editBillData.amount !== undefined
          ? parseFloat(editBillData.amount)
          : currentBill.amount;
      if (isNaN(amount)) {
        return setError("Amount must be a valid number.");
      }
      if (editBillData.date && !moment(editBillData.date).isValid()) {
        return setError("Date is invalid.");
      }

      // Assuming your backend update route is PUT /api/bills/:id
      // Send updated data
      const res = await api.put(`/api/bills/${currentBill._id}`, {
        ...editBillData,
        amount: amount, // Send as number
        date: editBillData.date
          ? new Date(editBillData.date)
          : currentBill.date, // Convert date string to Date object or keep existing
      });

      console.log("Bill updated:", res.data);
      setShowEditModal(false); // Close the modal on success
      setCurrentBill(null); // Clear current bill
      fetchData(); // Refresh the list
    } catch (err) {
      console.error("Error updating bill:", err);
      setError(err.response?.data?.message || "Failed to update bill.");
    }
  };

  // Function to handle deleting a bill
  const handleDeleteBill = async (billId) => {
    // TODO: Add a confirmation prompt before deleting
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        setError("");
        // Assuming your backend delete route is DELETE /api/bills/:id
        await api.delete(`/api/bills/${billId}`);

        console.log(`Bill with ID ${billId} deleted.`);
        // Remove the deleted bill from the state
        setBills(bills.filter((bill) => bill._id !== billId));
      } catch (err) {
        console.error("Error deleting bill:", err);
        setError(err.response?.data?.message || "Failed to delete bill.");
      }
    }
  };

  // Handle opening the Create Bill modal
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setNewBillData({ memberId: "", amount: "", date: "", status: "Pending" }); // Reset form state
    setShowCreateModal(false);
  };

  // Handle opening the Edit Bill modal and pre-populating the form
  const handleShowEditModal = (bill) => {
    setCurrentBill(bill);
    setEditBillData({
      amount: bill.amount,
      date: moment(bill.date).format("YYYY-MM-DD"), // Format date for input field
      status: bill.status,
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setCurrentBill(null);
    setEditBillData({ amount: "", date: "", status: "" }); // Clear form
    setShowEditModal(false);
  };

  if (loading && !error) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading bills...</p>
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
      <h2>Manage Bills</h2>

      <Button
        variant="primary"
        onClick={handleShowCreateModal}
        className="mb-3"
      >
        Create New Bill
      </Button>

      {bills.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Member</th> {/* Display member username */}
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id}>
                <td>{bill._id}</td>
                <td>{bill.member ? bill.member.username : "N/A"}</td>{" "}
                {/* Display member username */}
                <td>${bill.amount.toFixed(2)}</td> {/* Format amount */}
                <td>{moment(bill.date).format("YYYY-MM-DD")}</td>{" "}
                {/* Format date */}
                <td>{bill.status}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowEditModal(bill)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteBill(bill._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create Bill Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="createBillMember">
              <Form.Label>Member</Form.Label>
              <Form.Control
                as="select"
                value={newBillData.memberId}
                onChange={(e) =>
                  setNewBillData({ ...newBillData, memberId: e.target.value })
                }
                required
              >
                <option value="">Select Member</option>
                {/* Map over members fetched from backend */}
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.username} ({member.role})
                  </option>
                ))}
              </Form.Control>
              {/* TODO: Consider using react-select for a searchable dropdown if you have many members */}
            </Form.Group>

            <Form.Group className="mb-3" controlId="createBillAmount">
              <Form.Label>Amount ($)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={newBillData.amount}
                onChange={(e) =>
                  setNewBillData({ ...newBillData, amount: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createBillDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date" // Use date input type
                value={newBillData.date}
                onChange={(e) =>
                  setNewBillData({ ...newBillData, date: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createBillStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={newBillData.status}
                onChange={(e) =>
                  setNewBillData({ ...newBillData, status: e.target.value })
                }
                required
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateBill}>
            Create Bill
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Bill Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentBill && ( // Ensure currentBill is not null
            <Form>
              {/* Member field is typically read-only in edit */}
              <Form.Group className="mb-3">
                <Form.Label>Member</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    currentBill.member ? currentBill.member.username : "N/A"
                  }
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editBillAmount">
                <Form.Label>Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter amount"
                  value={editBillData.amount}
                  onChange={(e) =>
                    setEditBillData({ ...editBillData, amount: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editBillDate">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date" // Use date input type
                  value={editBillData.date}
                  onChange={(e) =>
                    setEditBillData({ ...editBillData, date: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editBillStatus">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={editBillData.status}
                  onChange={(e) =>
                    setEditBillData({ ...editBillData, status: e.target.value })
                  }
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Due">Due</option>
                </Form.Control>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateBill}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageBills;
