import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar.css"; // Your navbar-specific CSS

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Determine active link
  const isActive = (pathOrId) => {
    if (pathOrId.startsWith("/")) return location.pathname === pathOrId;
    // For home page sections
    return location.pathname === "/" && document.getElementById(pathOrId);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        <div
          className="navbar-logo"
          onClick={() => {
            navigate("/");
            setIsOpen(false);
          }}
        >
          <img src="./img/logoo.png" alt="Logo" className="logo-img" />
          Doctor Travel & Tours
        </div>
      </div>

      <nav className={`navbar-links ${isOpen ? "open" : ""}`}>
        <button
          className={`nav-link ${isActive("home") ? "active" : ""}`}
          onClick={() => scrollToSection("home")}
        >
          Home
        </button>
        <Link
          to="/international"
          className={`nav-link ${isActive("/international") ? "active" : ""}`}
        >
          International
        </Link>
        <Link
          to="/domestic"
          className={`nav-link ${isActive("/domestic") ? "active" : ""}`}
        >
          Domestic
        </Link>
        <button
          className={`nav-link ${isActive("about") ? "active" : ""}`}
          onClick={() => scrollToSection("about")}
        >
          About
        </button>
        <button
          className={`nav-link ${isActive("contact") ? "active" : ""}`}
          onClick={() => scrollToSection("contact")}
        >
          Contact
        </button>
      </nav>
    </header>
  );
}

export default Header;
