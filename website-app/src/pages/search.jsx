  import React, { useState, useEffect } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import "../styles/search.css";
  import "../styles/details.css";
  import "../styles/thankyou.css";
  import { supabase } from "../supabaseClient";
  import emailjs from '@emailjs/browser';

  function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const pkgId = location.state?.packageId;
    const table = location.state?.table || "package_info"; // Dynamic table
    const [showWarningModal, setShowWarningModal] = useState(false);

    const [pkg, setPkg] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [galleryImages, setGalleryImages] = useState([]);
    const [itinerary, setItinerary] = useState([]);
    const [addons, setAddons] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [total, setTotal] = useState(0);
    const [documentNumberPlaceholder, setDocumentNumberPlaceholder] = useState("Document Type (optional)");
    const [passportExpiration, setPassportExpiration] = useState("");

    const [showItineraryModal, setShowItineraryModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);

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
    adults: 1,      // default 1 adult
    children: 0,    // default 0 children
    address: "",
  });

    const extractPrice = (str) => {
      const match = str.match(/₱?([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
    };

    const fetchPackage = async () => {
      if (!pkgId) return;
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", pkgId)
        .single();

      if (error) {
        console.error("Error fetching package:", error);
        return;
      }

      let parsedItinerary = [];
      if (data.itinerary) {
        try {
          parsedItinerary =
            typeof data.itinerary === "string" ? JSON.parse(data.itinerary) : data.itinerary;
        } catch (err) {
          console.error("Error parsing itinerary JSON:", err);
        }
      }

      let parsedAddons = [];
      if (data.addons) {
        try {
          parsedAddons =
            typeof data.addons === "string" ? JSON.parse(data.addons) : data.addons;
        } catch (err) {
          console.error("Error parsing addons JSON:", err);
        }
      }

      setPkg(data);
      setMainImage(data.main_photo || "");
      setGalleryImages(data.add_photo || []);
      setItinerary(parsedItinerary || []);
      setAddons(parsedAddons || []);
      setTotal(parseFloat(data.price) || 0);
    };

    useEffect(() => {
      fetchPackage();
    }, [pkgId, table]);

    const toggleAddon = (addon) => {
      setSelectedAddons((prev) => (prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]));
    };

    useEffect(() => {
      if (!pkg) return;
      const base = parseFloat(pkg.price) || 0;
      const addonTotal = selectedAddons.reduce((sum, addon) => sum + extractPrice(addon), 0);
      setTotal(base + addonTotal);
    }, [selectedAddons, pkg]);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "documentType") {
      switch (value) {
        case "Passport":
          setDocumentNumberPlaceholder("Passport No.");
          break;
        case "Driver's License":
          setDocumentNumberPlaceholder("Driver's License No.");
          break;
        case "National ID":
          setDocumentNumberPlaceholder("National ID No.");
          break;
        case "Visa":
          setDocumentNumberPlaceholder("Visa Number");
          break;
        case "Other":
          setDocumentNumberPlaceholder("Document Number");
          break;
        default:
          setDocumentNumberPlaceholder("Passport No. (optional)");
      }
    }
  };

    const handleDetailsSubmit = async (e) => {
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
        "nationality"
      ];

      if (!requiredFields.every((f) => formData[f])) {
        alert("Please fill all required fields.");
        return;
      }

      if (parseInt(formData.adults) + parseInt(formData.children) < 1) {
        alert("Please add at least one passenger.");
        return;
      }

      if (formData.documentType === "Passport" && !passportExpiration) {
        alert("Please fill your passport expiration date.");
        return;
      }

      const fullName = `${formData.firstName} ${formData.middleName || ""} ${formData.lastName}`.trim();
      const totalPassengers = parseInt(formData.adults) + parseInt(formData.children);

      try {
        const { error } = await supabase.from("booking_info").insert([{
          full_name: fullName,
          first_name: formData.firstName,
          middle_name: formData.middleName || null,
          last_name: formData.lastName,
          email: formData.email,
          package_id: table === "package_info" ? pkgId : null,
          local_package_id: table === "local_package_info" ? pkgId : null,
          status: "Pending",
          travel_date: null,
          passengers: totalPassengers,
          adults: parseInt(formData.adults),
          children: parseInt(formData.children),
          age: parseInt(formData.age),
          dob: formData.dob,
          birth_place: formData.birthPlace || null,
          gender: formData.gender,
          phone: formData.phone,
          passport: formData.passport || null,
          document_type: formData.documentType,
          nationality: formData.nationality,
          address: formData.address,
        }]);

        if (error) throw error;

        // -----------------------
        // Send email to owner
        // -----------------------
        const emailParams = {
          owner_email: "solimanjoey01@gmail.com", 
          user_name: fullName,
          user_email: formData.email,
          package_name: pkg.name,
          passengers: totalPassengers,
          adults: formData.adults,
          children: formData.children,
          phone: formData.phone,
          nationality: formData.nationality,
          document_type: formData.documentType,
          passport: formData.passport || "N/A",
          address: formData.address,
        };

        await emailjs.send(
          "service_26qqg9m",      
          "template_qfae6hj",   
          emailParams,
          "tIRbjOPzlE_tlYGoB"       
        );

        setShowDetailsModal(false);
        setShowThankYouModal(true);

      } catch (err) {
        console.error(err);
        alert("Failed to submit booking. Please try again.");
      }
    };

    if (!pkg) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading package details...</p>;


    return (
      <div className="search-page">
        <section className="bali-content">
          {/* Left Card */}
          <div className="card left-card">
            <h3>{pkg.name || "Special Deals"}</h3>

            {mainImage ? (
              <div className="main-image">
                <img src={mainImage} alt={pkg.name} />
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#555" }}>No main image available</p>
            )}

            {galleryImages.length > 0 ? (
              <div className="small-images">
                {galleryImages.map((img, idx) =>
                  img ? (
                    <img
                      key={idx}
                      src={img}
                      alt={`${pkg.name} image ${idx + 1}`}
                      onClick={() => setMainImage(img)}
                    />
                  ) : null
                )}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#555" }}>No gallery images available</p>
            )}
          </div>

          {/* Right Card */}
          <div className="card right-card">
            <div className="property-overview">
              <h3>Property Overview</h3>
              <p>{pkg.description || "No description available."}</p>
            </div>

            <div className="hotel-offers-side-by-side">
              <div className="hotel-offers-column">
                <h3>Inclusions</h3>
                <ul>
                  {pkg.inclusions ? (
                    pkg.inclusions.split("\n").map((inc, idx) => <li key={idx}>{inc}</li>)
                  ) : (
                    <li>No inclusions provided.</li>
                  )}
                </ul>
              </div>

              <div className="hotel-offers-column">
                <h3>Exclusions</h3>
                <ul>
                  {pkg.exclusions ? (
                    pkg.exclusions.split("\n").map((exc, idx) => <li key={idx}>{exc}</li>)
                  ) : (
                    <li>No exclusions provided.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="itinerary-button">
              <button onClick={() => setShowItineraryModal(true)}>View Sample Itinerary</button>
            </div>
          </div>
        </section>

        {/* Itinerary Modal */}
        {showItineraryModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Sample Itinerary</h3>
              <ul className="itinerary-list">
                {Array.isArray(itinerary) && itinerary.length > 0 ? (
                  itinerary.map((dayObj, idx) => (
                    <li key={idx}>
                      <strong>{dayObj.day ? `Day ${dayObj.day}` : ""}:</strong>
                      <ul>
                        {dayObj.activities.map((act, aIdx) => (
                          <li key={aIdx}>{act}</li>
                        ))}
                      </ul>
                    </li>
                  ))
                ) : (
                  <li>No itinerary available.</li>
                )}
              </ul>

              {/* Display Package Price */}
              <div className="total-price">
                <p>
                  <strong>Price:</strong> ₱{total.toLocaleString()}
                </p>
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowItineraryModal(false)}>Close</button>
                <button
                  onClick={() => {
                    setShowWarningModal(true); // Show warning modal
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warning Modal */}
        {showWarningModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Warning</h3>
              <p>
                Price may vary depending on the number of passengers.<br/>
                Current total: ₱{total.toLocaleString()}
              </p>
              <div className="modal-actions">
                <button onClick={() => setShowWarningModal(false)}>Cancel</button>
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setShowItineraryModal(false);
                    setShowDetailsModal(true);
                  }}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && (
          <div className="modal-overlay details-modal">
            <div className="modal">
              <h3>Enter Your Details</h3>
              <form className="details-form-grid" onSubmit={handleDetailsSubmit}>
                <div className="form-row">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="middleName"
                    placeholder="Middle Name"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    min="0"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="date"
                    name="dob"
                    placeholder="Date of Birth"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="birthPlace"
                    placeholder="Birth Place"
                    value={formData.birthPlace}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone No."
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    name="passport"
                    placeholder={documentNumberPlaceholder}
                    value={formData.passport}
                    onChange={handleChange}
                  />
                  {formData.documentType === "Passport" && (
                    <div className="form-row">
                      <input
                        type="date"
                        name="passportExpiration"
                        placeholder="Passport Expiration"
                        value={passportExpiration}
                        onChange={(e) => setPassportExpiration(e.target.value)}
                        required
                      />
                    </div>
                  )}
                                    
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Document Type</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="National ID">National ID</option>
                    <option value="Visa">Visa</option>
                    <option value="Other">Other</option>
                  </select>

                  <input
                    type="text"
                    name="nationality"
                    placeholder="Nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <label>Adult</label>
                  <input
                    type="number"
                    name="adults"
                    min="1"
                    placeholder="Adults"
                    value={formData.adults}
                    onChange={handleChange}
                    required
                  />
                  <label>Children</label>
                  <input
                    type="number"
                    name="children"
                    min="0"
                    placeholder="Children"
                    value={formData.children}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowDetailsModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Thank You Modal */}
        {showThankYouModal && (
          <div className="modal-overlay">
            <div className="thank-you-box modal">
              <div className="thank-you-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>Congratulations!</h2>
              <p>Your booking was successfully completed.</p>
              <p>A receipt has been sent to your email.</p>
              <div className="modal-actions">
                <button onClick={() => navigate("/")}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default Search;
