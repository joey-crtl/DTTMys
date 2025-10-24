import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/flight.css"; // reuse same styles

function Domestic() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialDestination = location.state?.destination || "";

  const [searchDestination, setSearchDestination] = useState(initialDestination);
  const [searchDate, setSearchDate] = useState("");
  const [packagesData, setPackagesData] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [visiblePackages, setVisiblePackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);

  // Fetch domestic packages from local_package_info
  useEffect(() => {
    const fetchPackages = async () => {
        setLoading(true);
        const { data, error } = await supabase
        .from("local_package_info")
        .select("*");

        if (error) console.error("Error fetching domestic packages:", error);
        else {
        setPackagesData(data || []);
        setFilteredPackages(data || []);
        }
        setLoading(false);
    };

    fetchPackages();

    // Listen for updates from booking.js
    const handleBookingUpdate = () => {
        fetchPackages();
    };

    window.addEventListener("bookingUpdated", handleBookingUpdate);

    return () => {
        window.removeEventListener("bookingUpdated", handleBookingUpdate);
    };
    }, []);

  // Filter packages by search
  useEffect(() => {
    const term = (searchDestination || initialDestination).toLowerCase().trim();
    if (!term) {
      setFilteredPackages(packagesData);
      return;
    }
    const results = packagesData.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(term) ||
        pkg.destination?.toLowerCase().includes(term)
    );
    setFilteredPackages(results);
  }, [searchDestination, initialDestination, packagesData]);

  // Animate packages on scroll
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            filteredPackages.forEach((_, index) => {
              setTimeout(() => {
                setVisiblePackages((prev) => [...prev, filteredPackages[index].id]);
              }, index * 150);
            });
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [filteredPackages]);

  // Navigate to package details
  const selectPackage = (pkg) => {
    navigate("/search", { state: { packageId: pkg.id, table: "local_package_info" } });
  };

  return (
    <div id="packageSection">
      {/* Hero Section */}
      <section className="hero">
        <img src="./img/tokyoo.jpg" alt="Domestic Travel" className="no-button-img" />
        <div className="hero-text">
          <h2>Your RX for Adventure</h2>
          <p>
            Discover top domestic destinations with tailored packages for every traveler.
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="booking">
        <h2>Find Domestic Packages</h2>
        <form>
          <div className="form-inputs">
            <div className="form-group">
              <input
                type="text"
                placeholder="Search Destination"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
          </div>
        </form>
      </section>

      {/* Packages Intro */}
      <div className="flight-card-intro">
        <h3>Book Your Domestic Package</h3>
        <p>
          Explore the beauty of your own country with packages combining
          accommodations, transport, and exciting activities.
        </p>
      </div>

      {/* Package Cards */}
      <div className="flight-card-container" ref={containerRef}>
        {loading ? (
          <p>Loading packages...</p>
        ) : filteredPackages.length === 0 ? (
          <p>No domestic packages found.</p>
        ) : (
          filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flight-card ${
                visiblePackages.includes(pkg.id) ? "show" : ""
              }`}
            >
              <img
                src={pkg.main_photo || "https://via.placeholder.com/400x250?text=No+Image"}
                alt={pkg.name}
              />
              <div className="flight-info">
                <h3>{pkg.name}</h3>
                <p>
                  From ₱{Number(pkg.price).toLocaleString()} per head
                </p>
                <p className="availability">
                  Available: {pkg.available ?? 0} seats
                </p>
                <button
                  className="see-available-btn"
                  onClick={() => selectPackage(pkg)}
                >
                  See Available
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Doctor Travel & Tours. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Domestic;
