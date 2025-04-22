// client/src/components/Common/Button.jsx
import React from "react";
import { Button as BootstrapButton } from "react-bootstrap"; // Import Bootstrap's Button

// A simple wrapper for a Bootstrap Button for potential future customization
const Button = ({ children, ...props }) => {
  return <BootstrapButton {...props}>{children}</BootstrapButton>;
};

export default Button;
