  import React, { useState, useEffect, useRef } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  import { supabase } from "../supabaseClient";
  import "../styles/flight.css";

  function International() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialDestination = location.state?.destination || "";

    const [searchDestination, setSearchDestination] = useState(initialDestination);
    const [searchDate, setSearchDate] = useState("");
    const [flightsData, setFlightsData] = useState([]);
    const [filteredFlights, setFilteredFlights] = useState([]);
    const [visibleFlights, setVisibleFlights] = useState([]);
    const [loading, setLoading] = useState(true);

    const flightContainerRef = useRef(null);

    // Fetch flights/packages
    useEffect(() => {
      const fetchFlights = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("package_info")
          .select("id, name, price, available, main_photo, add_photo, description, destination");

        if (error) console.error(error);
        else {
          setFlightsData(data || []);
          setFilteredFlights(data || []);
        }
        setLoading(false);
      };

      fetchFlights();

      // Listen for booking updates (available seats changed)
      const handleBookingUpdate = () => {
        fetchFlights(); // refetch packages
      };

      window.addEventListener("bookingUpdated", handleBookingUpdate);

      return () => {
        window.removeEventListener("bookingUpdated", handleBookingUpdate);
      };
    }, []);

    // Filter flights by search
    useEffect(() => {
      const term = (searchDestination || initialDestination).toLowerCase().trim();
      if (!term) {
        setFilteredFlights(flightsData);
        return;
      }
      const results = flightsData.filter(
        (flight) =>
          flight.name.toLowerCase().includes(term) ||
          flight.destination?.toLowerCase().includes(term)
      );
      setFilteredFlights(results);
    }, [searchDestination, initialDestination, flightsData]);

    // Animate when container scrolls into view
    useEffect(() => {
      if (!flightContainerRef.current) return;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              filteredFlights.forEach((_, index) => {
                setTimeout(() => {
                  setVisibleFlights((prev) => [...prev, filteredFlights[index].id]);
                }, index * 150);
              });
              obs.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(flightContainerRef.current);

      return () => observer.disconnect();
    }, [filteredFlights]);

    // Select a package and navigate
    const selectFlight = (flight) => {
      navigate("/search", { state: { packageId: flight.id } });
    };

    return (
      <div id="packageSection">
        {/* Hero Section */}
        <section className="hero">
          <img src="./img/tokyoo.jpg" alt="Image" className="no-button-img" />
          <div className="hero-text">
            <h2>Your Rx for Adventure</h2>
            <p>
              With Doctor Travel & Tours, book packages tailored to
              your trip—easy, affordable, and all in one place.
            </p>
          </div>
        </section>

        {/* Search Form */}
        <section className="booking">
          <h2>Find International Packages</h2>
          <form>
            <div className="form-inputs">
              <div className="form-group">
                <input
                  type="text"
                  id="searchDestination"
                  placeholder="Search Destination"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="date"
                  id="searchDate"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
            </div>
          </form>
        </section>

        {/* Flight Cards Intro */}
        <div className="flight-card-intro">
          <h3>Book your Package</h3>
          <p>
            Whether you're seeking luxury, convenience, or great value, these
            top-rated packages—combining flights and hotels—offer everything you
            need for an unforgettable journey.
          </p>
        </div>

        {/* Flight Cards */}
        <div className="flight-card-container" ref={flightContainerRef}>
          {loading ? (
            <p>Loading packages...</p>
          ) : filteredFlights.length === 0 ? (
            <p>No packages found.</p>
          ) : (
            filteredFlights.map((flight) => (
              <div
                key={flight.id}
                className={`flight-card ${
                  visibleFlights.includes(flight.id) ? "show" : ""
                }`}
              >
                <img
                  src={
                    flight.main_photo ||
                    "https://via.placeholder.com/400x250?text=No+Image"
                  }
                  alt={flight.name}
                />
                <div className="flight-info">
                  <h3>{flight.name}</h3>
                  <p>
                    From ₱{Number(flight.price).toLocaleString()} per head round-trip
                  </p>
                  <p className="availability">
                    Available: {flight.available ?? 0} seats
                  </p>
                  <button
                    className="see-available-btn"
                    onClick={() => selectFlight(flight)}
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

  export default International;
