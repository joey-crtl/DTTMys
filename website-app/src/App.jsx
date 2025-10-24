import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import International from "./pages/international";
import Domestic from "./pages/domestic";
import Search from "./pages/search";
import Details from "./pages/details";
import "./styles/main.css";
import { useEffect } from "react";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      // Navigate back to home first
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

  useEffect(() => {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }, []);

  return (
    <header>
      <div className="container">
        <h1 className="logo">
          <img src="./img/logoo.png" alt="Travista Logo" className="logo-img" />
          Doctor Travel & Tours
        </h1>

        <nav id="nav-menu">
          <ul>
            <li>
              <button className="nav-link" onClick={() => scrollToSection("home")}>
                Home
              </button>
            </li>
            <li>
              <Link className="nav-link" to="/international">
                International
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/domestic">
                Domestic
              </Link>
            </li>
            <li>
              <button className="nav-link" onClick={() => scrollToSection("about")}>
                About
              </button>
            </li>
            <li>
              <button className="nav-link" onClick={() => scrollToSection("contact")}>
                Contact
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div id="home">
                <Home />
              </div>

              <div id="about">
                <About />
              </div>

              <div id="contact">
                <Contact />
              </div>
            </>
          }
        />
        <Route path="/international" element={<International />} />
        <Route path="/domestic" element={<Domestic />} /> {/* <-- new route */}
        <Route path="/search" element={<Search />} />
        <Route path="/details" element={<Details />} />
      </Routes>
    </Router>
  );
}

export default App;
