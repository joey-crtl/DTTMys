import { useState } from "react";
import { supabase } from "../supabaseClient"; // make sure this points to your Supabase client
import "../styles/main.css";

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        {question}
      </button>
      <div className={`faq-answer ${isOpen ? "open" : ""}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const faqs = [
    {
      question: "Do you offer group discounts?",
      answer:
        "Yes, we offer discounts for group travel. Please reach out to our team for more information.",
    },
    {
      question: "How will I receive my ticket?",
      answer:
        "Tickets are sent to your email address after successful booking. Make sure to check your spam folder as well.",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.from("feedback_info").insert([
      {
        name,
        email,
        message,
        created_at: new Date(),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to send message. Please try again.");
    } else {
      alert("Thank you for your feedback!");
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <>
      {/* Contact Form Section */}
      <section className="contact" id="contact">
        <h2>Contact Us</h2>
        <p>Have questions or need help? Send us a message below!</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="contact-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions (FAQ's)</h2>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Branch Maps */}
      <section className="branch-maps">
        <h2>Our Branch Locations</h2>
        <div className="map-grid">
          <div className="map-card">
            <h3>Dagupan City, Pangasinan</h3>
            <iframe
              src="https://www.google.com/maps?q=Dagupan+City,+Pangasinan&output=embed"
            ></iframe>
          </div>
          <div className="map-card">
            <h3>Calasiao, Pangasinan</h3>
            <iframe
              src="https://www.google.com/maps?q=Calasiao,+Pangasinan&output=embed"
            ></iframe>
          </div>
          <div className="map-card">
            <h3>Bayambang, Pangasinan</h3>
            <iframe
              src="https://www.google.com/maps?q=Bayambang,+Pangasinan&output=embed"
            ></iframe>
          </div>
          <div className="map-card">
            <h3>Tarlac, Camiling</h3>
            <iframe
              src="https://www.google.com/maps?q=Tarlac,+Camiling&output=embed"
            ></iframe>
          </div>
          <div className="map-card">
            <h3>Montalban, Rizal</h3>
            <iframe
              src="https://www.google.com/maps?q=Montalban,+Rizal&output=embed"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="connect-section">
        <div className="connect-top">
          <div className="connect-brand">
            <img src="./img/logoo.png" alt="Logo" className="connect-logo" />
            <span className="brand-name">Doctor Travel & Tours</span>
          </div>
        </div>
        <div className="connect-container">
          <div className="connect-social">
            <h2>You can also visit us on social media</h2>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-tiktok"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="connect-info">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> +1-800-555-FLY</p>
            <p><strong>Email:</strong> support@skyhigh.com</p>
            <p><strong>Address:</strong> 123 Airway Blvd, Manila, Philippines</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
