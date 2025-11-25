import React, { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";

function CertificateForm() {
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [certFile, setCertFile] = useState(null);
  const [error, setError] = useState("");
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [qrPosition, setQrPosition] = useState({ x: 10, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const qrSize = 150;

  // Doctor and certificate data
  const [doctorData, setDoctorData] = useState({
    fullName: "",
    specialty: "",
    licenseNumber: "",
    issuingOrganization: "",
    issueDate: "",
    expiryDate: "",
  });

  // Reset state
  const resetState = useCallback(() => {
    setLoading(false);
    setProgressText("");
    setError("");
    setPdfPages([]);
    setCurrentPage(0);
    setQrPosition({ x: 10, y: 10 });
    setDoctorData({
      fullName: "",
      specialty: "",
      licenseNumber: "",
      issuingOrganization: "",
      issueDate: "",
      expiryDate: "",
    });
  }, []);

  // Handle doctor data input changes
  const handleDoctorDataChange = (field, value) => {
    setDoctorData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate expiry date if issue date is set
    if (field === "issueDate" && value) {
      const issueDate = new Date(value);
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const formattedExpiry = expiryDate.toISOString().split("T")[0];
      setDoctorData((prev) => ({
        ...prev,
        expiryDate: formattedExpiry,
      }));
    }
  };

  // File validation
  const validateFile = (file) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Please select an image file (JPEG, PNG, GIF, WebP) or PDF"
      );
    }

    if (file.size > maxSize) {
      throw new Error("The file is too large. Maximum size: 10MB");
    }

    return true;
  };

  // Validate doctor data
  const validateDoctorData = () => {
    if (!doctorData.fullName.trim()) {
      throw new Error("Doctor's full name is required");
    }
    if (!doctorData.specialty.trim()) {
      throw new Error("Specialty is required");
    }
    if (!doctorData.licenseNumber.trim()) {
      throw new Error("License number is required");
    }
    if (!doctorData.issuingOrganization.trim()) {
      throw new Error("Issuing organization is required");
    }
    if (!doctorData.issueDate) {
      throw new Error("Issue date is required");
    }
    if (!doctorData.expiryDate) {
      throw new Error("Expiry date is required");
    }
  };

  // Simple way to check if file is PDF
  const isPDFFile = (file) => {
    return (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    );
  };

  // Show message that PDF requires server processing
  const handlePDFFile = async (file) => {
    setError(
      "PDF processing requires server-side support. Please convert your PDF to images first or use the image upload feature."
    );
    setLoading(false);
    return;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    resetState();
    setLoading(true);

    try {
      validateFile(file);
      setProgressText("Processing file...");

      if (isPDFFile(file)) {
        // For PDF files show message
        await handlePDFFile(file);
        return;
      } else {
        // Process image
        const fileUrl = URL.createObjectURL(file);
        setCertFile(fileUrl);

        const link =
          "https://example.com/verify-certificate?code=" +
          Math.random().toString(36).substr(2, 9);
        await generateCertificateWithQR(fileUrl, link);

        // For compatibility with existing logic
        setPdfPages([
          {
            dataUrl: fileUrl,
            width: 0,
            height: 0,
            pageNumber: 1,
          },
        ]);
      }

      setProgressText("Ready!");
    } catch (err) {
      console.error("File processing error:", err);
      setError(err.message || "An error occurred while processing the file.");
      setProgressText("");
    } finally {
      setLoading(false);
    }
  };

  const generateCertificateWithQR = async (
    fileUrl,
    link,
    width = null,
    height = null
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas not found");

    const ctx = canvas.getContext("2d");

    return new Promise((resolve, reject) => {
      const certImg = new Image();
      certImg.crossOrigin = "anonymous";
      certImg.src = fileUrl;

      certImg.onload = async () => {
        try {
          // Calculate dimensions to fit in preview while maintaining aspect ratio
          const maxWidth = 600;
          const maxHeight = 500;
          let renderWidth = certImg.width;
          let renderHeight = certImg.height;

          if (certImg.width > maxWidth || certImg.height > maxHeight) {
            const ratio = Math.min(
              maxWidth / certImg.width,
              maxHeight / certImg.height
            );
            renderWidth = certImg.width * ratio;
            renderHeight = certImg.height * ratio;
          }

          // Set canvas dimensions for preview
          canvas.width = renderWidth;
          canvas.height = renderHeight;

          // Clear canvas and draw certificate centered
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw image centered on canvas
          ctx.drawImage(certImg, 0, 0, renderWidth, renderHeight);

          // Generate QR code with certificate data
          const qrData = generateQRData();
          const qrDataUrl = await QRCode.toDataURL(qrData, {
            width: Math.min(150, renderWidth * 0.15),
            margin: 1,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });

          const qrImg = new Image();
          qrImg.crossOrigin = "anonymous";
          qrImg.src = qrDataUrl;

          qrImg.onload = () => {
            drawQRCode(ctx, qrImg, renderWidth, renderHeight);
            resolve();
          };

          qrImg.onerror = () => reject(new Error("Error loading QR code"));
        } catch (err) {
          reject(err);
        }
      };

      certImg.onerror = () => reject(new Error("Error loading image"));
    });
  };

  // Generate QR code data with certificate information
  const generateQRData = () => {
    const data = {
      doctorName: doctorData.fullName,
      specialty: doctorData.specialty,
      licenseNumber: doctorData.licenseNumber,
      issuingOrganization: doctorData.issuingOrganization,
      issueDate: doctorData.issueDate,
      expiryDate: doctorData.expiryDate,
      validUntil: calculateValidUntil(),
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  // Calculate valid until text
  const calculateValidUntil = () => {
    if (!doctorData.issueDate) return "1 year from issue date";
    const issueDate = new Date(doctorData.issueDate);
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    return `Valid until: ${expiryDate.toLocaleDateString()}`;
  };

  // Function to draw QR code
  const drawQRCode = (ctx, qrImg, canvasWidth, canvasHeight) => {
    const padding = 5;
    const actualQrSize = Math.min(150, canvasWidth * 0.15);

    // Add white background under QR code for better readability
    ctx.fillStyle = "white";
    ctx.fillRect(
      qrPosition.x - padding,
      qrPosition.y - padding,
      actualQrSize + padding * 2,
      actualQrSize + padding * 2
    );

    // Draw QR code
    ctx.drawImage(
      qrImg,
      qrPosition.x,
      qrPosition.y,
      actualQrSize,
      actualQrSize
    );

    // Draw border around QR code (optional)
    ctx.strokeStyle = "#2575fc";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      qrPosition.x - padding,
      qrPosition.y - padding,
      actualQrSize + padding * 2,
      actualQrSize + padding * 2
    );
  };

  // Handlers for moving QR code
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const actualQrSize = Math.min(150, canvas.width * 0.15);

    // Check if clicked on QR code
    if (
      x >= qrPosition.x &&
      x <= qrPosition.x + actualQrSize &&
      y >= qrPosition.y &&
      y <= qrPosition.y + actualQrSize
    ) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const actualQrSize = Math.min(150, canvas.width * 0.15);
    const x = e.clientX - rect.left - actualQrSize / 2;
    const y = e.clientY - rect.top - actualQrSize / 2;

    // Limit position within canvas bounds
    const newX = Math.max(0, Math.min(x, canvas.width - actualQrSize));
    const newY = Math.max(0, Math.min(y, canvas.height - actualQrSize));

    setQrPosition({ x: newX, y: newY });
    redrawCanvas();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Redraw canvas with new QR code position
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !certFile) return;

    const ctx = canvas.getContext("2d");
    const certImg = new Image();
    certImg.src = certFile;

    certImg.onload = () => {
      // Clear and redraw main image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(certImg, 0, 0, canvas.width, canvas.height);

      // Redraw QR code
      const qrData = generateQRData();
      QRCode.toDataURL(qrData, {
        width: Math.min(150, canvas.width * 0.15),
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      }).then((qrDataUrl) => {
        const tempQrImg = new Image();
        tempQrImg.onload = () => {
          const actualQrSize = Math.min(150, canvas.width * 0.15);
          const padding = 5;
          ctx.fillStyle = "white";
          ctx.fillRect(
            qrPosition.x - padding,
            qrPosition.y - padding,
            actualQrSize + padding * 2,
            actualQrSize + padding * 2
          );
          ctx.drawImage(
            tempQrImg,
            qrPosition.x,
            qrPosition.y,
            actualQrSize,
            actualQrSize
          );
          ctx.strokeStyle = "#2575fc";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            qrPosition.x - padding,
            qrPosition.y - padding,
            actualQrSize + padding * 2,
            actualQrSize + padding * 2
          );
        };
        tempQrImg.src = qrDataUrl;
      });
    };
  };

  // Preset positions
  const presetPositions = [
    { label: "↖ Top Left", x: 10, y: 10 },
    { label: "↗ Top Right", x: -10, y: 10 },
    { label: "↙ Bottom Left", x: 10, y: -10 },
    { label: "↘ Bottom Right", x: -10, y: -10 },
    { label: "⦿ Center", x: "center", y: "center" },
  ];

  const applyPresetPosition = (preset) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const actualQrSize = Math.min(150, canvas.width * 0.15);
    let newX, newY;

    if (preset.x === "center") {
      newX = (canvas.width - actualQrSize) / 2;
    } else if (preset.x < 0) {
      newX = canvas.width - actualQrSize + preset.x;
    } else {
      newX = preset.x;
    }

    if (preset.y === "center") {
      newY = (canvas.height - actualQrSize) / 2;
    } else if (preset.y < 0) {
      newY = canvas.height - actualQrSize + preset.y;
    } else {
      newY = preset.y;
    }

    setQrPosition({ x: newX, y: newY });
    redrawCanvas();
  };

  const handleDownload = async () => {
    try {
      validateDoctorData();
    } catch (err) {
      setError(err.message);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Create a new canvas for download with original image dimensions
      const downloadCanvas = document.createElement("canvas");
      const ctx = downloadCanvas.getContext("2d");
      const certImg = new Image();

      certImg.onload = () => {
        // Set download canvas to original image dimensions
        downloadCanvas.width = certImg.width;
        downloadCanvas.height = certImg.height;

        // Draw original image
        ctx.drawImage(certImg, 0, 0, certImg.width, certImg.height);

        // Calculate QR size for original image
        const downloadQrSize = Math.min(150, certImg.width * 0.15);

        // Calculate position for original image (scale from preview position)
        const scaleX = certImg.width / canvas.width;
        const scaleY = certImg.height / canvas.height;
        const downloadX = qrPosition.x * scaleX;
        const downloadY = qrPosition.y * scaleY;

        // Generate QR code for download
        const qrData = generateQRData();
        QRCode.toDataURL(qrData, {
          width: downloadQrSize,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        }).then((qrDataUrl) => {
          const qrImg = new Image();
          qrImg.onload = () => {
            const padding = 5;
            // Draw white background
            ctx.fillStyle = "white";
            ctx.fillRect(
              downloadX - padding,
              downloadY - padding,
              downloadQrSize + padding * 2,
              downloadQrSize + padding * 2
            );
            // Draw QR code
            ctx.drawImage(
              qrImg,
              downloadX,
              downloadY,
              downloadQrSize,
              downloadQrSize
            );
            // Draw border
            ctx.strokeStyle = "#2575fc";
            ctx.lineWidth = 2;
            ctx.strokeRect(
              downloadX - padding,
              downloadY - padding,
              downloadQrSize + padding * 2,
              downloadQrSize + padding * 2
            );

            // Download
            const link = document.createElement("a");
            link.download = `certificate_${doctorData.fullName.replace(
              /\s+/g,
              "_"
            )}_${Date.now()}.png`;
            link.href = downloadCanvas.toDataURL("image/png", 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
          qrImg.src = qrDataUrl;
        });
      };
      certImg.src = certFile;
    } catch (err) {
      setError("Error downloading file: " + err.message);
      console.error("Download error:", err);
    }
  };

  const handleReset = () => {
    resetState();
    setCertFile(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleConvertPDFInfo = () => {
    setError(
      "To use PDF files:\n\n1. Take screenshots of each PDF page\n2. Save as PNG/JPEG images\n3. Upload the images here\n\nOr use online tools to convert PDF to images."
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          textAlign: "center",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          Medical Certificate QR Generator
        </h2>

        {/* Doctor Information Section */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
            border: "1px solid #e9ecef",
          }}
        >
          <h3
            style={{
              marginBottom: "15px",
              color: "#495057",
              textAlign: "left",
            }}
          >
            Doctor Information
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                value={doctorData.fullName}
                onChange={(e) =>
                  handleDoctorDataChange("fullName", e.target.value)
                }
                placeholder="Dr. John Smith"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                Specialty *
              </label>
              <input
                type="text"
                value={doctorData.specialty}
                onChange={(e) =>
                  handleDoctorDataChange("specialty", e.target.value)
                }
                placeholder="Cardiology"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                License Number *
              </label>
              <input
                type="text"
                value={doctorData.licenseNumber}
                onChange={(e) =>
                  handleDoctorDataChange("licenseNumber", e.target.value)
                }
                placeholder="MED123456"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                Issuing Organization *
              </label>
              <input
                type="text"
                value={doctorData.issuingOrganization}
                onChange={(e) =>
                  handleDoctorDataChange("issuingOrganization", e.target.value)
                }
                placeholder="Medical Board of Certification"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                Issue Date *
              </label>
              <input
                type="date"
                value={doctorData.issueDate}
                onChange={(e) =>
                  handleDoctorDataChange("issueDate", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#495057",
                }}
              >
                Expiry Date *
              </label>
              <input
                type="date"
                value={doctorData.expiryDate}
                onChange={(e) =>
                  handleDoctorDataChange("expiryDate", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ced4da",
                  borderRadius: "5px",
                  fontSize: "14px",
                  backgroundColor: doctorData.expiryDate ? "#e8f5e8" : "white",
                }}
                readOnly={!!doctorData.issueDate}
              />
              <small style={{ color: "#6c757d", fontSize: "12px" }}>
                {doctorData.issueDate
                  ? "Automatically set to 1 year from issue date"
                  : "Will be auto-calculated"}
              </small>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div
          style={{
            backgroundColor: "#e3f2fd",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #bbdefb",
          }}
        >
          <p
            style={{
              margin: "0 0 10px 0",
              color: "#1565c0",
              fontWeight: "bold",
            }}
          >
            Supported Formats:
          </p>
          <p style={{ margin: "0", color: "#1976d2", fontSize: "14px" }}>
            JPEG, PNG, GIF, WebP images
          </p>
          <p
            style={{ margin: "10px 0 0 0", color: "#757575", fontSize: "12px" }}
          >
            For PDF files, please convert to images first
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
          style={{
            marginBottom: "15px",
            padding: "10px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ccc",
            opacity: loading ? 0.6 : 1,
          }}
        />

        <button
          onClick={handleConvertPDFInfo}
          style={{
            background: "transparent",
            color: "#2575fc",
            padding: "8px 15px",
            border: "1px solid #2575fc",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "15px",
            width: "100%",
          }}
        >
          Need to convert PDF? Click here for instructions
        </button>

        {loading && (
          <div style={{ marginBottom: "15px" }}>
            <p style={{ color: "#555", marginBottom: "5px" }}>{progressText}</p>
            <div
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#f0f0f0",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#2575fc",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              color: "#d32f2f",
              backgroundColor: "#ffebee",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              border: "1px solid #ffcdd2",
              whiteSpace: "pre-line",
            }}
          >
            {error}
          </div>
        )}

        {certFile && (
          <div style={{ marginBottom: "15px" }}>
            <p
              style={{
                marginBottom: "10px",
                color: "#555",
                fontWeight: "bold",
              }}
            >
              Position QR Code:
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              {presetPositions.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPresetPosition(preset)}
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #2575fc",
                    background: "white",
                    color: "#2575fc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#2575fc1a")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>
              💡 Or drag the QR code on the image below
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "15px",
            minHeight: "400px",
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              border: certFile ? "2px solid #2575fc" : "none",
              maxWidth: "100%",
              maxHeight: "400px",
              display: certFile ? "block" : "none",
              cursor: isDragging ? "grabbing" : "grab",
              margin: "0 auto",
              boxShadow: certFile ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={handleDownload}
            disabled={loading || !certFile}
            style={{
              background: "#2575fc",
              color: "white",
              padding: "12px 25px",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !certFile ? "not-allowed" : "pointer",
              fontSize: "16px",
              transition: "all 0.3s",
              flex: 1,
              opacity: loading || !certFile ? 0.6 : 1,
            }}
          >
            Download Certificate
          </button>

          {certFile && (
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                background: "#6c757d",
                color: "white",
                padding: "12px 15px",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                transition: "all 0.3s",
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default CertificateForm;
