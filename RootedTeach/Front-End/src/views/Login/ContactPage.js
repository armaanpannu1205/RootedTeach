/* ContactPage.js - Component for the contact screen. */
/* Handles basic info display and a "click-to-copy" feature for UX. */

import React, { useState } from "react";
import "./ContactPage.css";

function ContactPage() {
  // Track which item was copied so we can show a "✓ Copied!" message
  const [copied, setCopied] = useState("");

  const handleCopy = (text, label) => {
    // Copy the actual string to the user's clipboard
    navigator.clipboard.writeText(text);
    
    // Trigger the success message
    setCopied(label);
    
    // Reset the button text after 2 seconds to keep the UI clean
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="contact-container">
      <div className="contact-content">

        <div className="contact-tag">Get In Touch</div>

        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-lead">
          Have a question, partnership inquiry, or feedback? We'd love to hear from you.
        </p>

        <div className="contact-divider" />

        <div className="contact-cards">

          {/* Email Section */}
          <div className="contact-card">
            <div className="contact-card-icon">✉</div>
            <div className="contact-card-body">
              <div className="contact-card-label">Email</div>
              <div className="contact-card-value">armpbruin420723@ucla.edu</div>
              <button
                className="contact-copy-btn"
                onClick={() => handleCopy("armpbruin420723@ucla.edu", "email")}
              >
                {/* Toggle button text based on copy state */}
                {copied === "email" ? "✓ Copied!" : "Copy email"}
              </button>
            </div>
          </div>

          {/* Phone Section */}
          <div className="contact-card">
            <div className="contact-card-icon">📞</div>
            <div className="contact-card-body">
              <div className="contact-card-label">Phone</div>
              <div className="contact-card-value">(916) 218-5560</div>
              <button
                className="contact-copy-btn"
                onClick={() => handleCopy("9162185560", "phone")}
              >
                {copied === "phone" ? "✓ Copied!" : "Copy number"}
              </button>
            </div>
          </div>

        </div>

        {/* Small footer note about response time */}
        <p className="contact-note">
          We typically respond within 1–2 business days.
        </p>

      </div>
    </div>
  );
}

export default ContactPage;