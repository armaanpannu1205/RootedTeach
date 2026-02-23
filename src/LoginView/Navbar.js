import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { Images } from "../Images/Images.js";
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PhoneIcon from '@mui/icons-material/Phone';
import ReceiptIcon from '@mui/icons-material/Receipt';

function Navbar() {
  return (
    <nav>
      <NavLink to="/">
        <img src={Images.Logo.src} alt="logo" className="logo-img" />
      </NavLink>
      <h2 className="LogoName">RootedTeach AI</h2>
      <ul>
        <li>
        </li>
        <li>
          <NavLink className="nav-link" to="/about">
            About
          <ReceiptIcon />
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-link" to="/team">
            Our Team
          <PeopleIcon />
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-link" to="/contact">
            Contact Us
            <PhoneIcon />
          </NavLink>
        </li>
      </ul>  
    </nav>
  );
}

export default Navbar;
