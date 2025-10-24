import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Header from "./pages/header";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import International from "./pages/international";
import Domestic from "./pages/domestic";
import Search from "./pages/search";
import Details from "./pages/details";
import "./styles/main.css";

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
