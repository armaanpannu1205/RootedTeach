/* Navbar.js - Main navigation component for the public pages. */
/* Using NavLink for automatic "active" class handling on the current page. */

import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { Images } from "../../assets/Images.js";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIcon from "@mui/icons-material/Phone";
import ReceiptIcon from "@mui/icons-material/Receipt";

function Navbar() {
  return (
    <nav className="public-nav">
      {/* Clicking the logo always takes you back to the landing page */}
      <NavLink to="/">
        <img src={Images.Logo.src} alt="RootedTeach logo" className="logo-img" />
      </NavLink>

      <h2 className="LogoName">RootedTeach AI</h2>

      {/* Navigation links section */}
      <ul>
        <li>
          <NavLink className="nav-link" to="/about">
            <ReceiptIcon />
            About
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-link" to="/team">
            <PeopleIcon />
            Our Team
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-link" to="/contact">
            <PhoneIcon />
            Contact Us
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;