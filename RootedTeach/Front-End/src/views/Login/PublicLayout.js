/* PublicLayout.js - The main wrapper for all public-facing pages. */
/* Keeps the Navbar visible at the top while switching the content underneath. */

import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <>
      {/* Navbar stays here regardless of which page we're on */}
      <Navbar />

      {/* This is where the specific page content (About, Contact, etc.) gets injected */}
      <Outlet />
    </>
  );
}

export default PublicLayout;