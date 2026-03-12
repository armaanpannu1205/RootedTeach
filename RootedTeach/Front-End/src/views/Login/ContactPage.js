import React, { useState } from "react";
import "./ContactPage.css";

function ContactPage() {
  const [copied, setCopied] = useState("");

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
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

          <div className="contact-card">
            <div className="contact-card-icon">✉</div>
            <div className="contact-card-body">
              <div className="contact-card-label">Email</div>
              <div className="contact-card-value">armpbruin420723@ucla.edu</div>
              <button
                className="contact-copy-btn"
                onClick={() => handleCopy("armpbruin420723@ucla.edu", "email")}
              >
                {copied === "email" ? "✓ Copied!" : "Copy email"}
              </button>
            </div>
          </div>

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

        <p className="contact-note">
          We typically respond within 1–2 business days.
        </p>

      </div>
    </div>
  );
}

export default ContactPage;