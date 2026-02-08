import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
        <Link to="/">Home Page</Link>
        <Link to="/about">About</Link>
        <Link to="/team">Our Team</Link>
        <Link to="/contact">Contact Us</Link>
        
    </nav>
  );
}

export default Navbar;
