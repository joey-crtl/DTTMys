import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/details.css";

function Details() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    age: "",
    dob: "",
    birthPlace: "",
    gender: "",
    phone: "",
    email: "",
    passport: "",
    documentType: "",
    nationality: "",
    passengers: 1,
  });

  const [total, setTotal] = useState(Number(localStorage.getItem("totalPackagePrice")) || 0);
  const [finalTotal, setFinalTotal] = useState(total);

  useEffect(() => {
    const paxCount = parseInt(formData.passengers) || 1;
    setFinalTotal(total * paxCount);
  }, [formData.passengers, total]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = [
      "lastName",
      "firstName",
      "age",
      "dob",
      "gender",
      "phone",
      "email",
      "documentType",
      "nationality",
      "passengers",
    ];
    const allFilled = requiredFields.every((field) => formData[field] !== "");

    if (allFilled) {
      localStorage.setItem("passengerDetails", JSON.stringify(formData));
      navigate("/thankyou");
    } else {
      alert("Please fill in all required fields.");
    }
  };

  return (
    <div className="details-page">
      <main className="details-section">
        <h2>Enter Your Details</h2>
        <form className="details-form" onSubmit={handleSubmit}>
          {/* Personal Info */}
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Middle Name</label>
            <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="number" name="age" value={formData.age} min="0" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Birth Place</label>
            <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone No.</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          {/* Travel Info */}
          <div className="form-group">
            <label>Passport No. (optional)</label>
            <input type="text" name="passport" value={formData.passport} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Document Type</label>
            <input type="text" name="documentType" value={formData.documentType} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nationality</label>
            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Passengers</label>
            <input type="number" name="passengers" min="1" value={formData.passengers} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Total Price</label>
            <span id="final-total">₱{finalTotal.toLocaleString()}</span>
          </div>

          <div className="confirm-itinerary">
            <button type="submit">Done</button>
          </div>
        </form>
      </main>

      <footer>
        <p>&copy; 2025 SkyHigh Airlines. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Details;
