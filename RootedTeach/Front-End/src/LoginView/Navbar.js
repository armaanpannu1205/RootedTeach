import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { Images } from "../Images/Images.js";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIcon from "@mui/icons-material/Phone";
import ReceiptIcon from "@mui/icons-material/Receipt";

function Navbar() {
  return (
    <nav>
      <NavLink to="/">
        <img src={Images.Logo.src} alt="RootedTeach logo" className="logo-img" />
      </NavLink>

      <h2 className="LogoName">RootedTeach AI</h2>

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