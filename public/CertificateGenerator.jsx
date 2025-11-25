import React, { useState, useRef } from "react";
import QRCode from "qrcode";

function CertificateForm() {
const [loading, setLoading] = useState(false);
const [progressText, setProgressText] = useState("");
const [certFile, setCertFile] = useState(null);
const canvasRef = useRef(null);

const handleFileChange = async (e) => {
if (!e.target.files[0]) return;
setLoading(true);
setProgressText("Загрузка файла на сервер...");

const file = e.target.files[0];
const fileUrl = URL.createObjectURL(file);
setCertFile(fileUrl);

// Заготовка для отправки на сервер
const formData = new FormData();
formData.append("certificate", file);

try {
  // TODO: бекенд разработка на Java
  // const response = await fetch("/upload", { method: "POST", body: formData });
  // const data = await response.json();
  // const link = data.link;

  // Для демонстрации используем локальный Data URL
  const link = "https://example.com/demo_certificate";
  setProgressText("Генерация QR-кода...");
  generateCertificateWithQR(fileUrl, link);
} catch (err) {
  console.error(err);
  setProgressText("Ошибка загрузки");
  setLoading(false);
}


};

const generateCertificateWithQR = async (fileUrl, link) => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");


// Загружаем сертификат
const certImg = new Image();
certImg.crossOrigin = "anonymous";
certImg.src = fileUrl;
certImg.onload = async () => {
  canvas.width = certImg.width;
  canvas.height = certImg.height;
  ctx.drawImage(certImg, 0, 0);

  // Генерируем QR-код в Data URL
  const qrDataUrl = await QRCode.toDataURL(link, { width: 150, margin: 1 });
  const qrImg = new Image();
  qrImg.crossOrigin = "anonymous";
  qrImg.src = qrDataUrl;
  qrImg.onload = () => {
    // Накладываем QR-код на левый верхний угол сертификата
    ctx.drawImage(qrImg, 0, 0, 150, 150);
    setProgressText("Готово!");
    setLoading(false);
  };
};


};

const handleDownload = () => {
const canvas = canvasRef.current;
const link = document.createElement("a");
link.download = "certificate_with_qr.png";
link.href = canvas.toDataURL();
link.click();
};

return (
<div style={{
display: "flex",
justifyContent: "center",
alignItems: "center",
minHeight: "100vh",
background: "linear-gradient(to right, #6a11cb, #2575fc)",
fontFamily: "Arial, sans-serif",
}}>
<div style={{
backgroundColor: "white",
padding: "30px",
borderRadius: "15px",
boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
textAlign: "center",
maxWidth: "400px",
width: "100%",
}}>
<h2 style={{ marginBottom: "20px", color: "#333" }}>Загрузка сертификата</h2>
<input
type="file"
onChange={handleFileChange}
style={{ marginBottom: "15px", padding: "10px", width: "100%", borderRadius: "5px", border: "1px solid #ccc" }}
/>
{loading && <p style={{ color: "#555", marginBottom: "15px" }}>{progressText}</p>}
<canvas ref={canvasRef} style={{ border: "1px solid #ccc", marginBottom: "15px", maxWidth: "100%" }} />
<button
onClick={handleDownload}
disabled={loading}
style={{
background: "#2575fc",
color: "white",
padding: "12px 25px",
border: "none",
borderRadius: "8px",
cursor: loading ? "not-allowed" : "pointer",
fontSize: "16px",
transition: "background 0.3s",
}}
onMouseOver={e => e.currentTarget.style.background = "#6a11cb"}
onMouseOut={e => e.currentTarget.style.background = "#2575fc"}
>
Скачать сертификат </button> </div> </div>
);
}

export default CertificateForm;
