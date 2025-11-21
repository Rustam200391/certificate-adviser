import React, { useState } from 'react'
import CertificateUpload from './components/CertificateUpload'
import QRCodeGenerator from './components/QRCodeGenerator'
import './App.css'

function App() {
  const [certificates, setCertificates] = useState([])
  const [selectedCertificate, setSelectedCertificate] = useState(null)

  const handleCertificateUpload = (certificateData) => {
    const newCertificate = {
      id: Date.now(),
      ...certificateData,
      createdAt: new Date().toISOString(),
      viewUrl: `${window.location.origin}/view/${Date.now()}`
    }
    setCertificates(prev => [newCertificate, ...prev])
    setSelectedCertificate(newCertificate)
  }

  return (
    <div className="App">
      <div className="container-fluid p-0 vh-100">
        <div className="min-vh-100 bg-gradient">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-12 col-lg-10">
                {/* Header */}
                <div className="text-center mb-5">
                  <h1 className="display-4 fw-bold text-white mb-3">
                    📄 PDF Certificate System
                  </h1>
                  <p className="lead text-white opacity-75">
                    Upload medical certificates and generate QR codes for easy access
                  </p>
                </div>

                <div className="row g-4">
                  {/* Upload Section */}
                  <div className="col-md-6">
                    <div className="glass-card h-100">
                      <CertificateUpload onCertificateUpload={handleCertificateUpload} />
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="col-md-6">
                    <div className="glass-card h-100">
                      <QRCodeGenerator 
                        certificate={selectedCertificate}
                        certificates={certificates}
                        onSelectCertificate={setSelectedCertificate}
                      />
                    </div>
                  </div>
                </div>

                {/* Certificates List */}
                {certificates.length > 0 && (
                  <div className="glass-card mt-4">
                    <h5 className="text-primary mb-3">📋 Uploaded Certificates</h5>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Certificate Name</th>
                            <th>Patient Name</th>
                            <th>Upload Date</th>
                            <th>File Size</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {certificates.map(cert => (
                            <tr 
                              key={cert.id}
                              className={selectedCertificate?.id === cert.id ? 'table-active' : ''}
                            >
                              <td>
                                <strong>{cert.fileName}</strong>
                              </td>
                              <td>{cert.patientName}</td>
                              <td>{new Date(cert.createdAt).toLocaleDateString()}</td>
                              <td>{(cert.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => setSelectedCertificate(cert)}
                                >
                                  Show QR
                                </button>
                                <a
                                  href={cert.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-success"
                                >
                                  View PDF
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App