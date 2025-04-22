// client/src/pages/Admin/ManageMembers.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap"; // Added Row and Col
import api from "../../utils/api"; // Import your API utility
import { useAuth } from "../../context/AuthContext"; // Import useAuth for potential role check
import moment from "moment"; // For date formatting

function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [allFeePackages, setAllFeePackages] = useState([]); // To store available fee packages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for Create Member modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    username: "",
    password: "",
    role: "Member",
  });

  // State for Edit Member modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null); // For editing
  const [editMemberData, setEditMemberData] = useState({
    username: "",
    role: "",
  });

  // State for Assign Package modal
  const [showAssignPackageModal, setShowAssignPackageModal] = useState(false);
  const [memberToAssignPackage, setMemberToAssignPackage] = useState(null); // Member selected for package assignment
  const [assignPackageData, setAssignPackageData] = useState({
    // State for Assign Package form
    packageId: "",
    startDate: moment().format("YYYY-MM-DD"), // Default to today's date
  });
  const [assignPackageLoading, setAssignPackageLoading] = useState(false); // Loading state for assign package action

  const { user } = useAuth(); // Get logged-in user (optional, route protection is key)

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false);
    } else {
      fetchData(); // Fetch members and fee packages if user is Admin
    }
  }, [user]); // Re-run effect if user object changes

  // Function to fetch initial data (members and fee packages)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch Members (backend now populates membership)
      const membersRes = await api.get("/api/members");
      setMembers(membersRes.data);

      // Fetch Fee Packages to populate dropdown for assignment
      const packagesRes = await api.get("/api/fee-packages"); // Assuming this is the route for packages
      setAllFeePackages(packagesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle creating a new member (Copy from previous)
  const handleCreateMember = async () => {
    // TODO: Add frontend validation
    try {
      setError("");
      const res = await api.post("/api/members", newMemberData);
      console.log("Member created:", res.data);
      setShowCreateModal(false);
      setNewMemberData({ username: "", password: "", role: "Member" });
      fetchData(); // Refresh both lists
    } catch (err) {
      console.error("Error creating member:", err);
      setError(err.response?.data?.message || "Failed to create member.");
    }
  };

  // Function to handle updating an existing member (Copy from previous)
  const handleUpdateMember = async () => {
    if (!currentMember) return;
    // TODO: Add frontend validation
    try {
      setError("");
      const res = await api.put(
        `/api/members/${currentMember._id}`,
        editMemberData
      );
      console.log("Member updated:", res.data);
      setShowEditModal(false);
      setCurrentMember(null);
      fetchData(); // Refresh both lists
    } catch (err) {
      console.error("Error updating member:", err);
      setError(err.response?.data?.message || "Failed to update member.");
    }
  };

  // Function to handle deleting a member (Copy from previous)
  const handleDeleteMember = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        setError("");
        await api.delete(`/api/members/${memberId}`);
        console.log(`Member with ID ${memberId} deleted.`);
        setMembers(members.filter((member) => member._id !== memberId));
        // No need to refetch packages here
      } catch (err) {
        console.error("Error deleting member:", err);
        setError(err.response?.data?.message || "Failed to delete member.");
      }
    }
  };

  // --- NEW FUNCTION: Handle Assigning Package ---
  const handleAssignPackage = async () => {
    if (
      !memberToAssignPackage ||
      !assignPackageData.packageId ||
      !assignPackageData.startDate
    ) {
      return setError("Please select a package and start date.");
    }

    setAssignPackageLoading(true);
    try {
      setError("");
      // Call the new backend endpoint to assign the package
      // Assuming backend route is PUT /api/members/:id/assign-package
      const res = await api.put(
        `/api/members/${memberToAssignPackage._id}/assign-package`,
        {
          packageId: assignPackageData.packageId,
          startDate: assignPackageData.startDate, // Send as string or Date object
        }
      );

      console.log("Membership assigned:", res.data);
      setShowAssignPackageModal(false); // Close modal
      setMemberToAssignPackage(null); // Clear selected member
      setAssignPackageData({
        packageId: "",
        startDate: moment().format("YYYY-MM-DD"),
      }); // Reset form
      fetchData(); // Refresh the member list to show updated membership
    } catch (err) {
      console.error("Error assigning package:", err);
      setError(err.response?.data?.message || "Failed to assign package.");
    } finally {
      setAssignPackageLoading(false);
    }
  };

  // Handle opening modals
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => {
    setNewMemberData({ username: "", password: "", role: "Member" });
    setShowCreateModal(false);
  };

  const handleShowEditModal = (member) => {
    setCurrentMember(member);
    setEditMemberData({
      username: member.username,
      role: member.role,
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setCurrentMember(null);
    setEditMemberData({ username: "", role: "" });
    setShowEditModal(false);
  };

  // --- NEW: Handle opening the Assign Package modal ---
  const handleShowAssignPackageModal = (member) => {
    setMemberToAssignPackage(member);
    // Optionally pre-select the current package if they have one, and set default date
    setAssignPackageData({
      packageId: member.currentMembership ? member.currentMembership._id : "",
      startDate: member.membershipStartDate
        ? moment(member.membershipStartDate).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
    });
    setShowAssignPackageModal(true);
  };
  const handleCloseAssignPackageModal = () => {
    setMemberToAssignPackage(null);
    setAssignPackageData({
      packageId: "",
      startDate: moment().format("YYYY-MM-DD"),
    });
    setShowAssignPackageModal(false);
    setAssignPackageLoading(false); // Reset loading state
  };

  if (loading && !error) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading members...</p>
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
      <h2>Manage Members</h2>

      {/* Display general error */}
      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        variant="primary"
        onClick={handleShowCreateModal}
        className="mb-3"
      >
        Add New Member
      </Button>

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Membership</th> {/* New Column */}
              <th>Membership Dates</th> {/* New Column */}
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member._id}>
                <td>{member._id}</td>
                <td>{member.username}</td>
                <td>{member.role}</td>
                {/* Display Membership Info */}
                <td>
                  {member.currentMembership
                    ? member.currentMembership.name
                    : "None"}
                </td>
                <td>
                  {member.membershipStartDate && member.membershipEndDate
                    ? `${moment(member.membershipStartDate).format(
                        "YYYY-MM-DD"
                      )} to ${moment(member.membershipEndDate).format(
                        "YYYY-MM-DD"
                      )}`
                    : "N/A"}
                </td>
                <td>{moment(member.createdAt).format("YYYY-MM-DD")}</td>{" "}
                {/* Format date */}
                <td>
                  {/* Prevent Admin from editing/deleting their own account via this member list */}
                  {user && member._id !== user._id ? (
                    <>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleShowEditModal(member)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      {/* NEW BUTTON: Assign Package */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleShowAssignPackageModal(member)}
                        className="me-2"
                      >
                        Assign Package
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteMember(member._id)}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <span className="text-muted">Your Account</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create Member Modal (Copy from previous) */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="createMemberUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={newMemberData.username}
                onChange={(e) =>
                  setNewMemberData({
                    ...newMemberData,
                    username: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createMemberPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Set initial password"
                value={newMemberData.password}
                onChange={(e) =>
                  setNewMemberData({
                    ...newMemberData,
                    password: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="createMemberRole">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                value={newMemberData.role}
                onChange={(e) =>
                  setNewMemberData({ ...newMemberData, role: e.target.value })
                }
                required
              >
                <option value="Member">Member</option>
                <option value="User">User</option>
                {/* Admin can also create other Admins, but maybe restrict this in UI or backend */}
                {/* <option value="Admin">Admin</option> */}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateMember}>
            Add Member
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Member Modal (Copy from previous, no membership fields here) */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentMember && (
            <Form>
              <Form.Group className="mb-3" controlId="editMemberUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={editMemberData.username}
                  onChange={(e) =>
                    setEditMemberData({
                      ...editMemberData,
                      username: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editMemberRole">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  value={editMemberData.role}
                  onChange={(e) =>
                    setEditMemberData({
                      ...editMemberData,
                      role: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Member">Member</option>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </Form.Control>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateMember}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- NEW MODAL: Assign Package Modal --- */}
      <Modal
        show={showAssignPackageModal}
        onHide={handleCloseAssignPackageModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Membership Package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {memberToAssignPackage && ( // Ensure member is selected
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Member:</Form.Label>
                <Form.Control
                  type="text"
                  value={memberToAssignPackage.username}
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="assignPackageSelect">
                <Form.Label>Select Package</Form.Label>
                <Form.Control
                  as="select"
                  value={assignPackageData.packageId}
                  onChange={(e) =>
                    setAssignPackageData({
                      ...assignPackageData,
                      packageId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Choose...</option>
                  {/* Populate with fetched fee packages */}
                  {allFeePackages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.name} ({pkg.duration}, ${pkg.cost.toFixed(2)})
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3" controlId="assignPackageStartDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={assignPackageData.startDate}
                  onChange={(e) =>
                    setAssignPackageData({
                      ...assignPackageData,
                      startDate: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              {/* Optional: Display calculated end date based on selection (read-only) */}
              {assignPackageData.packageId && assignPackageData.startDate && (
                <Form.Group className="mb-3">
                  <Form.Label>Calculated End Date:</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      moment(assignPackageData.startDate).isValid() &&
                      allFeePackages.find(
                        (pkg) => pkg._id === assignPackageData.packageId
                      )
                        ? moment(assignPackageData.startDate)
                            .add(
                              parseInt(
                                allFeePackages
                                  .find(
                                    (pkg) =>
                                      pkg._id === assignPackageData.packageId
                                  )
                                  .duration.split(" ")[0]
                              ),
                              allFeePackages
                                .find(
                                  (pkg) =>
                                    pkg._id === assignPackageData.packageId
                                )
                                .duration.split(" ")[1]
                                .toLowerCase()
                            ) // Simple duration parsing
                            .format("YYYY-MM-DD")
                        : "Invalid Date or Package"
                    }
                    readOnly
                  />
                </Form.Group>
              )}
            </Form>
          )}
          {assignPackageLoading && (
            <Spinner animation="border" size="sm" className="mt-3" />
          )}{" "}
          {/* Loading spinner */}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseAssignPackageModal}
            disabled={assignPackageLoading}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignPackage}
            disabled={assignPackageLoading}
          >
            Assign Package
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageMembers;
