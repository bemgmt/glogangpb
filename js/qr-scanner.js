/**
 * QR Code Scanner
 * Handles QR code scanning with fallbacks and error handling
 */

class QRScanner {
  constructor() {
    this.stream = null;
    this.video = null;
    this.detector = null;
    this.isScanning = false;
    this.animationFrame = null;
    this.onScanCallback = null;
    this.scanTimeout = null;
  }

  /**
   * Initialize QR scanner
   * @param {HTMLVideoElement} videoElement - Video element
   * @param {Function} onScan - Callback for successful scan
   */
  init(videoElement, onScan) {
    this.video = videoElement;
    this.onScanCallback = onScan;
  }

  /**
   * Check if QR scanning is supported
   * @returns {boolean}
   */
  isSupported() {
    return Utils.isFeatureSupported('barcode') && Utils.isFeatureSupported('camera');
  }

  /**
   * Start QR code scanning
   * @returns {Promise<boolean>} - Success status
   */
  async startScanning() {
    if (!this.video || !this.onScanCallback) {
      throw new Error('QR scanner not initialized');
    }

    if (!Utils.isFeatureSupported('camera')) {
      throw new Error(CONFIG.ERRORS.CAMERA_NOT_FOUND);
    }

    try {
      // Stop any existing scanning
      this.stopScanning();

      // Request camera access (front camera for QR scanning)
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      this.video.srcObject = this.stream;
      await this.video.play();

      // Initialize barcode detector if supported
      if (Utils.isFeatureSupported('barcode')) {
        this.detector = new BarcodeDetector({ formats: ['qr_code'] });
        this.isScanning = true;
        this.startDetectionLoop();
        
        // Set timeout for scanning
        this.scanTimeout = setTimeout(() => {
          this.stopScanning();
          Utils.showToast('QR scan timeout. Please try manual entry.', 'warn');
        }, CONFIG.QR.SCAN_TIMEOUT);
        
        return true;
      } else {
        throw new Error('QR code detection not supported on this browser');
      }
    } catch (error) {
      Utils.logError('QRScanner.startScanning', error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error(CONFIG.ERRORS.CAMERA_PERMISSION);
      } else if (error.name === 'NotFoundError') {
        throw new Error(CONFIG.ERRORS.CAMERA_NOT_FOUND);
      } else {
        throw new Error(CONFIG.ERRORS.QR_SCAN_ERROR);
      }
    }
  }

  /**
   * Stop QR code scanning
   */
  stopScanning() {
    this.isScanning = false;

    // Clear animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Clear timeout
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }

    // Stop camera stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Clear video source
    if (this.video) {
      this.video.srcObject = null;
    }

    // Clear detector
    this.detector = null;
  }

  /**
   * Detection loop for QR codes
   */
  startDetectionLoop() {
    if (!this.isScanning || !this.detector || !this.video.videoWidth) {
      this.animationFrame = requestAnimationFrame(() => this.startDetectionLoop());
      return;
    }

    this.detector.detect(this.video)
      .then(codes => {
        if (codes && codes.length > 0 && this.isScanning) {
          const code = codes[0].rawValue;
          if (code && this.onScanCallback) {
            this.handleScanResult(code);
          }
        }
      })
      .catch(error => {
        // Ignore intermittent detection errors
        Utils.logError('QRScanner.detect', error);
      });

    if (this.isScanning) {
      this.animationFrame = requestAnimationFrame(() => this.startDetectionLoop());
    }
  }

  /**
   * Handle scan result
   * @param {string} code - Scanned QR code
   */
  handleScanResult(code) {
    if (!this.isScanning) return;

    // Validate code format (basic validation)
    const sanitizedCode = this.sanitizeCode(code);
    if (!sanitizedCode) {
      Utils.showToast('Invalid QR code format', 'warn');
      return;
    }

    // Check if code is approved
    const approvedCodes = Storage.getApprovedCodes();
    const isApproved = approvedCodes.includes(sanitizedCode);

    // Stop scanning after successful read
    this.stopScanning();

    // Call callback with result
    if (this.onScanCallback) {
      this.onScanCallback(sanitizedCode, isApproved);
    }
  }

  /**
   * Sanitize QR code to prevent XSS
   * @param {string} code - Raw QR code
   * @returns {string|null} - Sanitized code or null if invalid
   */
  sanitizeCode(code) {
    if (typeof code !== 'string') return null;
    
    // Remove any HTML tags and trim whitespace
    const sanitized = code.replace(/<[^>]*>/g, '').trim();
    
    // Basic validation - only allow alphanumeric, hyphens, and underscores
    if (!/^[A-Za-z0-9\-_]+$/.test(sanitized)) {
      return null;
    }
    
    // Limit length
    if (sanitized.length > 50) {
      return null;
    }
    
    return sanitized;
  }

  /**
   * Manually verify QR code
   * @param {string} code - Manual code input
   * @returns {Object} - Verification result
   */
  verifyManualCode(code) {
    const sanitizedCode = this.sanitizeCode(code);
    
    if (!sanitizedCode) {
      return {
        valid: false,
        approved: false,
        error: 'Invalid code format'
      };
    }

    const approvedCodes = Storage.getApprovedCodes();
    const isApproved = approvedCodes.includes(sanitizedCode);

    return {
      valid: true,
      approved: isApproved,
      code: sanitizedCode
    };
  }

  /**
   * Get scanner status
   * @returns {Object} - Scanner status
   */
  getStatus() {
    return {
      isScanning: this.isScanning,
      isSupported: this.isSupported(),
      hasCamera: !!this.stream,
      hasDetector: !!this.detector
    };
  }

  /**
   * Load sample codes for testing
   */
  loadSampleCodes() {
    const success = Storage.setApprovedCodes(CONFIG.QR.DEFAULT_APPROVED_CODES);
    if (success) {
      Utils.showToast('Sample codes loaded successfully', 'ok');
    } else {
      Utils.showToast('Failed to load sample codes', 'warn');
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopScanning();
    this.video = null;
    this.onScanCallback = null;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QRScanner;
}
