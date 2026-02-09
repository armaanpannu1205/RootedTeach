import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { Images } from "../Images/Images.js";
import HomeIcon from '@mui/icons-material/Home';

function Navbar() {
  return (
    <nav>
      <NavLink className="title" to="/">
        <img src={Images.Logo.src} alt="logo" className="logo-img" />
        <HomeIcon /></NavLink>
      <ul>
        <li>
          <NavLink className="nav-link" to="/about">About</NavLink>
        </li>
        <li>
          <NavLink className="nav-link" to="/team">Our Team</NavLink>
        </li>
        <li>
          <NavLink className="nav-link" to="/contact">Contact Us</NavLink>
        </li>
      </ul>  
    </nav>
  );
}

export default Navbar;
