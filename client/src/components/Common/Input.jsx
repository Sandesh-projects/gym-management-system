// client/src/components/Common/Input.jsx
import React from "react";
import { Form } from "react-bootstrap"; // Import Bootstrap's Form components

// A simple wrapper for a Bootstrap Form.Control
const Input = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  controlId,
  ...props
}) => {
  return (
    <Form.Group className="mb-3" controlId={controlId}>
      {label && <Form.Label>{label}</Form.Label>}{" "}
      {/* Render label if provided */}
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props} // Spread any other props (like required, disabled etc.)
      />
    </Form.Group>
  );
};

export default Input;
