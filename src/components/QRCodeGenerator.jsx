import React, { useState, useRef, useEffect } from 'react'

const QRCodeGenerator = ({ certificate, certificates, onSelectCertificate }) => {
  const [qrSize, setQrSize] = useState(200)
  const [includeLogo, setIncludeLogo] = useState(true)
  const qrCanvasRef = useRef(null)

  useEffect(() => {
    if (certificate && qrCanvasRef.current) {
      generateQRCode()
    }
  }, [certificate, qrSize, includeLogo])

  const generateQRCode = () => {
    const canvas = qrCanvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.clearRect(0, 0, qrSize, qrSize)
    
    // Set white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, qrSize, qrSize)
    
    // Simple QR code pattern (for demonstration)
    // In a real app, you would use a proper QR code library
    const qrData = certificate.qrData
    const cellSize = qrSize / 21 // Simple 21x21 grid
    
    // Draw QR code pattern
    ctx.fillStyle = '#000000'
    
    // Position markers (corners)
    drawPositionMarker(ctx, 3, 3, cellSize)
    drawPositionMarker(ctx, 3, 17, cellSize)
    drawPositionMarker(ctx, 17, 3, cellSize)
    
    // Simple data pattern (just for demo)
    for (let i = 0; i < qrData.length; i++) {
      const row = Math.floor(i / 7) + 7
      const col = (i % 7) + 7
      if (row < 21 && col < 21) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
      }
    }
    
    // Draw logo if enabled
    if (includeLogo) {
      drawLogo(ctx, qrSize)
    }
  }

  const drawPositionMarker = (ctx, x, y, cellSize) => {
    // Outer square
    ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize)
    
    // Inner white square
    ctx.fillStyle = '#ffffff'
    ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize)
    
    // Center black square
    ctx.fillStyle = '#000000'
    ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize)
  }

  const drawLogo = (ctx, size) => {
    const center = size / 2
    const logoSize = size / 5
    
    // Draw medical cross logo
    ctx.fillStyle = '#007bff'
    ctx.fillRect(center - logoSize/10, center - logoSize/2, logoSize/5, logoSize)
    ctx.fillRect(center - logoSize/2, center - logoSize/10, logoSize, logoSize/5)
  }

  if (!certificate && certificates.length > 0) {
    return (
      <div className="text-center">
        <h4 className="form-gradient fw-bold mb-3">🔗 QR Code Generator</h4>
        <div className="alert alert-info">
          <p>Please select a certificate from the list below to generate QR code:</p>
          <div className="d-grid gap-2">
            {certificates.map(cert => (
              <button
                key={cert.id}
                className="btn btn-outline-primary"
                onClick={() => onSelectCertificate(cert)}
              >
                {cert.fileName} - {cert.patientName}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="text-center">
        <h4 className="form-gradient fw-bold mb-3">🔗 QR Code Generator</h4>
        <div className="alert alert-warning">
          <p>No certificate selected. Please upload a certificate first.</p>
        </div>
      </div>
    )
  }

  const downloadQRCode = () => {
    const canvas = qrCanvasRef.current
    const pngUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `QR-${certificate.fileName.replace('.pdf', '')}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(certificate.qrData)
    alert('URL copied to clipboard!')
  }

  return (
    <div>
      <h4 className="form-gradient fw-bold mb-3">🔗 QR Code Generator</h4>
      
      {/* Certificate Info */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title">Selected Certificate</h6>
          <p className="mb-1"><strong>File:</strong> {certificate.fileName}</p>
          <p className="mb-1"><strong>Patient:</strong> {certificate.patientName}</p>
          <p className="mb-0"><strong>Type:</strong> {certificate.certificateType}</p>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="text-center mb-4">
        <div className="qr-container p-4 bg-white rounded-3 border">
          <canvas
            ref={qrCanvasRef}
            width={qrSize}
            height={qrSize}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
        </div>
        
        <p className="text-muted small mt-2">
          Scan this QR code to view the certificate
        </p>
        
        <div className="small text-break bg-light p-2 rounded">
          <strong>URL:</strong> {certificate.qrData}
        </div>
      </div>

      {/* Controls */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label small fw-semibold">QR Code Size</label>
          <select
            className="form-select"
            value={qrSize}
            onChange={(e) => setQrSize(parseInt(e.target.value))}
          >
            <option value={150}>Small (150px)</option>
            <option value={200}>Medium (200px)</option>
            <option value={300}>Large (300px)</option>
            <option value={400}>Extra Large (400px)</option>
          </select>
        </div>
        
        <div className="col-md-6">
          <label className="form-label small fw-semibold">Options</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={includeLogo}
              onChange={(e) => setIncludeLogo(e.target.checked)}
              id="includeLogo"
            />
            <label className="form-check-label small" htmlFor="includeLogo">
              Include Medical Logo
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-grid gap-2 mt-4">
        <button
          className="btn btn-success"
          onClick={downloadQRCode}
        >
          📥 Download QR Code
        </button>
        
        <button
          className="btn btn-outline-primary"
          onClick={copyToClipboard}
        >
          📋 Copy URL
        </button>
        
        <a
          href={certificate.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          👁️ View PDF Certificate
        </a>
      </div>

      {/* Usage Instructions */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">How to use:</h6>
        <ol className="mb-0 small">
          <li>Download the QR code image</li>
          <li>Print it or attach to documents</li>
          <li>Anyone can scan it to view the certificate</li>
        </ol>
      </div>
    </div>
  )
}

export default QRCodeGenerator