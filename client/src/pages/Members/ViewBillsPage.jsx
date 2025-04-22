// client/src/pages/Members/ViewBillsPage.jsx
import React, { useState, useEffect } from "react";
import { Container, Table, Alert, Spinner } from "react-bootstrap";
import api from "../../utils/api"; // Import your API utility
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook
import moment from "moment"; // For date formatting

function ViewBillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth(); // Get the logged-in user from context

  // TODO: Implement client-side role check if this page is not fully protected via routing
  useEffect(() => {
    // Check if user is logged in AND is a Member before fetching
    if (!user) {
      setError("Access Denied: You need to be logged in to view your bills.");
      setLoading(false);
    } else if (user.role !== "Member") {
      setError("Access Denied: You are not authorized to view this page.");
      setLoading(false);
    } else {
      fetchMemberBills(); // Fetch bills if user is a Member
    }
  }, [user]); // Re-run effect if user object changes

  // Function to fetch bills for the logged-in member
  const fetchMemberBills = async () => {
    try {
      setLoading(true);
      // Assuming your backend route for a member's bills is GET /api/members/my/bills
      // The backend controller uses req.user._id to find the bills
      const res = await api.get("/api/members/my/bills");
      setBills(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching member bills:", err);
      setError(err.response?.data?.message || "Failed to fetch your bills.");
    } finally {
      setLoading(false);
    }
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
      <h2>My Bill Receipts</h2>

      {bills.length === 0 ? (
        <p>You have no bills recorded yet.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              {/* Add other relevant columns if needed */}
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id}>
                <td>{bill._id}</td>
                <td>${bill.amount.toFixed(2)}</td> {/* Format amount */}
                <td>{moment(bill.date).format("YYYY-MM-DD")}</td>{" "}
                {/* Format date */}
                <td>{bill.status}</td>
                {/* Render other bill details */}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ViewBillsPage;
