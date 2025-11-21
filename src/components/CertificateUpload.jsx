import React, { useState } from 'react'

const CertificateUpload = ({ onCertificateUpload }) => {
  const [uploadData, setUploadData] = useState({
    patientName: '',
    patientId: '',
    certificateType: 'medical_report',
    issueDate: '',
    file: null
  })
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUploadData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setUploadData(prev => ({
        ...prev,
        file,
        fileName: file.name,
        fileSize: file.size
      }))
    } else {
      alert('Please select a PDF file')
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!uploadData.file) {
      alert('Please select a PDF file')
      return
    }

    if (!uploadData.patientName) {
      alert('Please enter patient name')
      return
    }

    setIsUploading(true)

    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create object URL for the file (in real app, this would be a server URL)
      const fileUrl = URL.createObjectURL(uploadData.file)
      
      const certificateData = {
        ...uploadData,
        fileUrl,
        qrData: `${window.location.origin}/view/${Date.now()}`,
        uploadDate: new Date().toISOString()
      }

      onCertificateUpload(certificateData)
      
      // Reset form
      setUploadData({
        patientName: '',
        patientId: '',
        certificateType: 'medical_report',
        issueDate: '',
        file: null
      })
      
      // Reset file input
      const fileInput = document.getElementById('pdfFile')
      if (fileInput) fileInput.value = ''
      
      alert('Certificate uploaded successfully! 🎉')
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading certificate. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <h4 className="form-gradient fw-bold mb-4">📤 Upload Certificate</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label fw-semibold">Patient Full Name *</label>
            <input
              type="text"
              className="form-control"
              name="patientName"
              value={uploadData.patientName}
              onChange={handleInputChange}
              placeholder="Enter patient's full name"
              required
            />
          </div>
          
          <div className="col-md-6">
            <label className="form-label fw-semibold">Patient ID</label>
            <input
              type="text"
              className="form-control"
              name="patientId"
              value={uploadData.patientId}
              onChange={handleInputChange}
              placeholder="Optional patient ID"
            />
          </div>
          
          <div className="col-md-6">
            <label className="form-label fw-semibold">Certificate Type</label>
            <select
              className="form-select"
              name="certificateType"
              value={uploadData.certificateType}
              onChange={handleInputChange}
            >
              <option value="medical_report">Medical Report</option>
              <option value="lab_results">Lab Results</option>
              <option value="prescription">Prescription</option>
              <option value="vaccination">Vaccination Certificate</option>
              <option value="health_certificate">Health Certificate</option>
            </select>
          </div>
          
          <div className="col-12">
            <label className="form-label fw-semibold">Issue Date</label>
            <input
              type="date"
              className="form-control"
              name="issueDate"
              value={uploadData.issueDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="col-12">
            <label className="form-label fw-semibold">PDF Certificate File *</label>
            <div className="file-upload-area border rounded-3 p-4 text-center">
              <input
                type="file"
                id="pdfFile"
                className="form-control"
                accept=".pdf"
                onChange={handleFileChange}
                style={{display: 'none'}}
              />
              
              {!uploadData.file ? (
                <div>
                  <div className="mb-3">
                    <i className="fas fa-cloud-upload-alt display-4 text-muted"></i>
                  </div>
                  <p className="text-muted mb-2">Click to select PDF certificate</p>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => document.getElementById('pdfFile').click()}
                  >
                    Choose PDF File
                  </button>
                  <p className="small text-muted mt-2 mb-0">Maximum file size: 10MB</p>
                </div>
              ) : (
                <div>
                  <div className="mb-2">
                    <i className="fas fa-file-pdf display-4 text-danger"></i>
                  </div>
                  <p className="fw-semibold mb-1">{uploadData.fileName}</p>
                  <p className="small text-muted mb-2">
                    Size: {(uploadData.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => document.getElementById('pdfFile').click()}
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setUploadData(prev => ({ ...prev, file: null }))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="d-grid mt-4">
          <button
            type="submit"
            className="btn btn-gradient btn-lg"
            disabled={isUploading || !uploadData.file}
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Uploading...
              </>
            ) : (
              '📤 Upload Certificate'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CertificateUpload