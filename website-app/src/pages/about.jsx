import "../styles/main.css";

function About() {
  return (
    <>
      {/* ✅ About Us */}
      <section className="about" id="about">
        <h2>About Us</h2>
        <p>Learn about our journey and what drives us. </p>

        <div className="mv-container">
          <div className="mission-box">
            <h3>Mission</h3>
            <p>
              To provide accessible, reliable, and comfortable travel
              experiences that connect people and cultures worldwide.
            </p>
          </div>
          <div className="vision-box">
            <h3>Vision</h3>
            <p>
              To become a global leader in air travel services, recognized for
              customer satisfaction, innovation, and excellence.
            </p>
          </div>
        </div>
      </section>

      {/* ✅ Meet Our Team */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <img src="/img/DOC.jpg" alt="Kryshia Dean" />
            <p className="team-desc">
              “With over 15 years of experience in global travel, Kryshia founded
              Horizon Travels to help others explore the world with ease and
              confidence.”
            </p>
            <h3>Kryshia Dean</h3>
            <span>Manager</span>
          </div>

          <div className="team-member">
            <img src="/img/SOLI.jpg" alt="Jose Enrique Soliman" />
            <p className="team-desc">
              “With over 15 years of experience in global travel, Kryshia founded
              Horizon Travels to help others explore the world with ease and
              confidence.”
            </p>
            <h3>Jose Enrique Soliman</h3>
            <span>Team Leader</span>
          </div>

          <div className="team-member">
            <img src="/img/KATH.jpg" alt="Kathlyn Leal" />
            <p className="team-desc">
              “With over 15 years of experience in global travel, Kryshia founded
              Horizon Travels to help others explore the world with ease and
              confidence.”
            </p>
            <h3>Kathlyn Leal</h3>
            <span>Designer</span>
          </div>

          <div className="team-member">
            <img src="/img/GIE.jpg" alt="Rogie Cabunas" />
            <p className="team-desc">
              “With over 15 years of experience in global travel, Kryshia founded
              Horizon Travels to help others explore the world with ease and
              confidence.”
            </p>
            <h3>Rogie Cabunas</h3>
            <span>Documentation</span>
          </div>

          <div className="team-member">
            <img src="/img/LEE.jpg" alt="Jhon Lee Teofilo" />
            <p className="team-desc">
              “With over 15 years of experience in global travel, Kryshia founded
              Horizon Travels to help others explore the world with ease and
              confidence.”
            </p>
            <h3>Jhon Lee Teofilo</h3>
            <span>Developer</span>
          </div>
        </div>
      </section>

      {/* ✅ Our Story */}
      <section className="our-story">
        <h2>Our Story</h2>

        <div className="story-block">
          <img src="/img/hp1.png" alt="Story 1" />
          <div className="story-text">
            <h3>Where It All Began</h3>
            <p>
              In 2018, I founded (Company Name) Travel Agency after a life
              changing solo trip across Southeast Asia. I realized how many
              people dreamed of traveling but felt overwhelmed by the planning.
              I wanted to create a company that made travel easy, personal, and
              unforgettable. That passion sparked the birth of (Company Name).
            </p>
          </div>
        </div>

        <div className="story-block reverse">
          <img src="/img/hp2.png" alt="Story 2" />
          <div className="story-text">
            <h3>Growing with Passion</h3>
            <p>
              Now, we continue to grow adapting, exploring, and creating
              unforgettable travel experiences. But no matter how far we go, our
              heart remains in helping others see the world.
            </p>
          </div>
        </div>

        <div className="story-block">
          <img src="/img/hp3.png" alt="Story 3" />
          <div className="story-text">
            <h3>Looking Ahead</h3>
            <p>
              We’re here to guide, support, and inspire every step of your
              journey. Whether it’s your first trip or your fiftieth, we treat
              every adventure like it’s our own.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
