import React, { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    // Patient
    patientFirstName: "",
    patientLastName: "",
    patientBirthDate: "",
    documentSeries: "",
    documentNumber: "",
    documentIssuer: "",

    // Doctor
    doctorFirstName: "",
    doctorLastName: "",
    doctorSpecialization: "",

    // Certificate data
    entryDate: "",
    certificateExpiryDate: "",
    certificateFile: null,
  });

  const specializations = [
    "Therapist",
    "Surgeon",
    "Cardiologist",
    "Neurologist",
    "Ophthalmologist",
    "Dentist",
    "Dermatologist",
    "Pediatrician",
    "Gynecologist",
    "Urologist",
    "Oncologist",
    "Psychiatrist",
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "certificateFile") {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real application, this would send data to the server
    console.log("Form data:", formData);

    // Create FormData for file submission
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    alert("Form submitted! Check console for data.");

    // Reset form (optional)
    // setFormData({
    //   patientFirstName: '',
    //   patientLastName: '',
    //   patientBirthDate: '',
    //   documentSeries: '',
    //   documentNumber: '',
    //   documentIssuer: '',
    //   doctorFirstName: '',
    //   doctorLastName: '',
    //   doctorSpecialization: '',
    //   entryDate: '',
    //   certificateExpiryDate: '',
    //   certificateFile: null
    // });
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>Medical Form: Certificate Registration</h1>

        <form onSubmit={handleSubmit} className="medical-form">
          {/* Patient Information */}
          <div className="form-section">
            <h2>Patient Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patientFirstName">First Name *</label>
                <input
                  type="text"
                  id="patientFirstName"
                  name="patientFirstName"
                  value={formData.patientFirstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientLastName">Last Name *</label>
                <input
                  type="text"
                  id="patientLastName"
                  name="patientLastName"
                  value={formData.patientLastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="patientBirthDate">Date of Birth *</label>
              <input
                type="date"
                id="patientBirthDate"
                name="patientBirthDate"
                value={formData.patientBirthDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="documentSeries">ID Document Series *</label>
                <input
                  type="text"
                  id="documentSeries"
                  name="documentSeries"
                  value={formData.documentSeries}
                  onChange={handleInputChange}
                  required
                  placeholder="Example: 1234"
                  maxLength="4"
                  pattern="[0-9]{4}"
                />
              </div>

              <div className="form-group">
                <label htmlFor="documentNumber">ID Document Number *</label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Example: 567890"
                  maxLength="6"
                  pattern="[0-9]{6}"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="documentIssuer">Issued By *</label>
              <input
                type="text"
                id="documentIssuer"
                name="documentIssuer"
                value={formData.documentIssuer}
                onChange={handleInputChange}
                required
                placeholder="Example: Moscow City Police Department"
              />
            </div>
          </div>

          {/* Doctor Information */}
          <div className="form-section">
            <h2>Doctor Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="doctorFirstName">Doctor's First Name *</label>
                <input
                  type="text"
                  id="doctorFirstName"
                  name="doctorFirstName"
                  value={formData.doctorFirstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter doctor's first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctorLastName">Doctor's Last Name *</label>
                <input
                  type="text"
                  id="doctorLastName"
                  name="doctorLastName"
                  value={formData.doctorLastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter doctor's last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="doctorSpecialization">Specialization *</label>
              <select
                id="doctorSpecialization"
                name="doctorSpecialization"
                value={formData.doctorSpecialization}
                onChange={handleInputChange}
                required
              >
                <option value="">Select specialization</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Certificate Data */}
          <div className="form-section">
            <h2>Certificate Data</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="entryDate">Data Entry Date *</label>
                <input
                  type="date"
                  id="entryDate"
                  name="entryDate"
                  value={formData.entryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="certificateExpiryDate">
                  Certificate Expiry Date *
                </label>
                <input
                  type="date"
                  id="certificateExpiryDate"
                  name="certificateExpiryDate"
                  value={formData.certificateExpiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="certificateFile">Upload Certificate *</label>
              <input
                type="file"
                id="certificateFile"
                name="certificateFile"
                onChange={handleInputChange}
                required
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <small>Supported formats: PDF, JPG, PNG, DOC, DOCX</small>
            </div>

            {formData.certificateFile && (
              <div className="file-info">
                <strong>Selected file:</strong> {formData.certificateFile.name}
                <br />
                <small>
                  Size:{" "}
                  {(formData.certificateFile.size / 1024 / 1024).toFixed(2)} MB
                </small>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Submit Form
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={() =>
                setFormData({
                  patientFirstName: "",
                  patientLastName: "",
                  patientBirthDate: "",
                  documentSeries: "",
                  documentNumber: "",
                  documentIssuer: "",
                  doctorFirstName: "",
                  doctorLastName: "",
                  doctorSpecialization: "",
                  entryDate: "",
                  certificateExpiryDate: "",
                  certificateFile: null,
                })
              }
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
