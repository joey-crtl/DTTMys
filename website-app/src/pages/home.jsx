import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/main.css";
import Multiclock from "../components/multiclock";

function Home() {
  const navigate = useNavigate();

  // Hero slider logic
  useEffect(() => {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".slide");
    const slidesContainer = document.getElementById("slides");
    const dots = document.querySelectorAll(".dot");
    const totalSlides = slides.length;

    function updateDots() {
      dots.forEach((dot) => dot.classList.remove("active"));
      dots[currentSlide].classList.add("active");
    }

    function moveSlide(direction) {
      currentSlide += direction;
      if (currentSlide < 0) currentSlide = totalSlides - 1;
      if (currentSlide >= totalSlides) currentSlide = 0;
      slidesContainer.style.transform = `translateX(-${currentSlide * 100}vw)`;
      updateDots();
    }

    const interval = setInterval(() => moveSlide(1), 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const destinations = [
    { name: "Japan", img: "/img/japan.jpg" },
    { name: "Hongkong", img: "/img/hongkong.jpg" },
    { name: "Vietnam", img: "/img/vietnam.jpg" },
    { name: "China", img: "/img/SHANGHAI.jpg" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-slider" id="home">
        <div className="slides" id="slides">
          {["/img/hp1.png", "/img/hp2.png", "/img/hp3.png", "/img/hp4.png"].map(
            (img, idx) => (
              <div
                key={idx}
                className="slide"
                style={{ backgroundImage: `url(${img})` }}
              >
                <div className="slide-text">
                  {idx === 0 && "You can See the World."}
                  {idx === 1 && "At Your Own Pace."}
                  {idx === 2 && "At Your Own Time."}
                  {idx === 3 && (
                    <>
                      LIVE,<br />
                      ENJOY, and<br />
                      TRAVEL to the FULLEST.
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        <div className="slider-dots" id="sliderDots">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <span key={idx} className={`dot ${idx === 0 ? "active" : ""}`}></span>
            ))}
        </div>
      </section>

      <Multiclock />

      {/* What We Do Section */}
      <section className="what-we-do">
        <div className="what-we-do-box">
          <h2>What We Do</h2>
          <p>
            We take care of the details—booking your flights, finding the perfect stay,
            and scheduling every part of your journey so you can travel stress-free.
          </p>
          <button onClick={() => scrollToSection("features")}>Our Service</button>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="featured-destinations" id="features">
        <h2>Feature Destination</h2>
        <div className="destination-grid">
          {destinations.map((dest, idx) => (
            <div key={idx} className="destination-card">
              <img src={dest.img} alt={dest.name} />
              <h3>{dest.name}</h3>
              <button
                className="book-btn"
                onClick={() =>
                  navigate("/international", { state: { destination: dest.name } })
                }
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
