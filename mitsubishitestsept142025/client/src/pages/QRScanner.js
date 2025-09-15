import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import './QRScanner.css';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      if (scannerRef.current) {
        scannerRef.current.destroy();
      }

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data);
          stopScanning();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
    } catch (err) {
      console.error('QR Scanner error:', err);
      setError('Failed to start camera. Please check permissions and try again.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
  };

  const handleScanResult = (data) => {
    try {
      // Try to parse as JSON (equipment QR code)
      const qrData = JSON.parse(data);
      if (qrData.id && qrData.name) {
        navigate(`/equipment/${qrData.id}`);
        return;
      }
    } catch (e) {
      // Not JSON, might be a simple URL or ID
    }

    // Check if it's a URL
    if (data.startsWith('http')) {
      window.open(data, '_blank');
      return;
    }

    // Check if it's an equipment ID (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(data)) {
      navigate(`/equipment/${data}`);
      return;
    }

    // Show the raw data for unrecognized formats
    alert(`QR Code Content: ${data}`);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-header">
        <h1>QR Code Scanner</h1>
        <p>Scan equipment QR codes to quickly access machine details</p>
      </div>

      <div className="scanner-container">
        <div className="camera-section">
          <video 
            ref={videoRef}
            className="camera-preview"
            style={{ display: isScanning ? 'block' : 'none' }}
          />
          
          {!isScanning && (
            <div className="camera-placeholder">
              <div className="scanner-icon">📷</div>
              <p>Camera will appear here when scanning</p>
            </div>
          )}

          <div className="scanner-controls">
            {!isScanning ? (
              <button onClick={startScanning} className="start-scan-btn">
                📱 Start Scanning
              </button>
            ) : (
              <button onClick={stopScanning} className="stop-scan-btn">
                ⏹️ Stop Scanning
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="manual-input-section">
          <h3>Manual Entry</h3>
          <p>Or enter equipment ID manually:</p>
          
          <form onSubmit={handleManualSubmit} className="manual-form">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter equipment ID or QR code data"
              className="manual-input"
            />
            <button type="submit" className="submit-btn">
              Go
            </button>
          </form>
        </div>
      </div>

      <div className="scanner-help">
        <h3>How to Use</h3>
        <ul>
          <li>📱 Tap "Start Scanning" to activate camera</li>
          <li>🎯 Point camera at QR code on equipment</li>
          <li>✅ App will automatically detect and redirect</li>
          <li>📝 Use manual entry if camera isn't available</li>
        </ul>
        
        <div className="supported-formats">
          <h4>Supported QR Code Formats:</h4>
          <ul>
            <li>Equipment data (JSON format)</li>
            <li>Equipment URLs</li>
            <li>Equipment IDs (UUID)</li>
            <li>Web URLs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;