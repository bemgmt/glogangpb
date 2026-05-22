/**
 * Camera Manager
 * Handles camera operations with proper error handling and browser compatibility
 */

class CameraManager {
  constructor() {
    this.stream = null;
    this.video = null;
    this.facingMode = CONFIG.CAMERA.DEFAULT_FACING_MODE;
    this.currentAspect = CONFIG.CAMERA.DEFAULT_ASPECT;
    this.mirror = true;
    this.isInitialized = false;
  }

  /**
   * Initialize camera manager
   * @param {HTMLVideoElement} videoElement - Video element
   */
  init(videoElement) {
    this.video = videoElement;
    this.isInitialized = true;
  }

  /**
   * Check if camera is supported
   * @returns {boolean}
   */
  isSupported() {
    return Utils.isFeatureSupported('camera');
  }

  /**
   * Start camera with error handling
   * @returns {Promise<boolean>} - Success status
   */
  async startCamera() {
    if (!this.isInitialized || !this.video) {
      throw new Error('Camera manager not initialized');
    }

    if (!this.isSupported()) {
      throw new Error(CONFIG.ERRORS.CAMERA_NOT_FOUND);
    }

    try {
      // Stop existing stream
      this.stopCamera();

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: CONFIG.CAMERA.IDEAL_WIDTH },
          height: { ideal: CONFIG.CAMERA.IDEAL_HEIGHT }
        },
        audio: false
      });

      // Set video source and play
      this.video.srcObject = this.stream;
      await this.video.play();

      return true;
    } catch (error) {
      Utils.logError('Camera.startCamera', error);
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        throw new Error(CONFIG.ERRORS.CAMERA_PERMISSION);
      } else if (error.name === 'NotFoundError') {
        throw new Error(CONFIG.ERRORS.CAMERA_NOT_FOUND);
      } else {
        throw new Error(CONFIG.ERRORS.CAMERA_GENERIC);
      }
    }
  }

  /**
   * Stop camera and cleanup
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  /**
   * Switch between front and back camera
   * @returns {Promise<boolean>} - Success status
   */
  async switchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.mirror = this.facingMode === 'user';
    
    try {
      await this.startCamera();
      return true;
    } catch (error) {
      Utils.logError('Camera.switchCamera', error);
      return false;
    }
  }

  /**
   * Toggle mirror mode
   */
  toggleMirror() {
    this.mirror = !this.mirror;
  }

  /**
   * Set aspect ratio
   * @param {string} aspectRatio - Aspect ratio (e.g., '3:4')
   */
  setAspectRatio(aspectRatio) {
    if (CONFIG.CAMERA.ASPECT_RATIOS[aspectRatio]) {
      this.currentAspect = aspectRatio;
    }
  }

  /**
   * Get current camera status
   * @returns {Object} - Camera status
   */
  getStatus() {
    return {
      isActive: !!this.stream,
      facingMode: this.facingMode,
      mirror: this.mirror,
      aspectRatio: this.currentAspect,
      isSupported: this.isSupported()
    };
  }

  /**
   * Capture photo from video stream
   * @param {HTMLCanvasElement} canvas - Canvas element for capture
   * @returns {Promise<string>} - Data URL of captured image
   */
  async capturePhoto(canvas) {
    if (!this.video || !this.stream) {
      throw new Error('Camera not active');
    }

    const vw = this.video.videoWidth;
    const vh = this.video.videoHeight;

    if (!vw || !vh) {
      throw new Error('Camera not ready');
    }

    // Calculate crop dimensions based on aspect ratio
    const aspectConfig = CONFIG.CAMERA.ASPECT_RATIOS[this.currentAspect];
    const targetAR = aspectConfig.width / aspectConfig.height;
    
    let cropW = vw;
    let cropH = Math.round(vw / targetAR);
    
    if (cropH > vh) {
      cropH = vh;
      cropW = Math.round(vh * targetAR);
    }

    const sx = Math.floor((vw - cropW) / 2);
    const sy = Math.floor((vh - cropH) / 2);

    // Set canvas dimensions
    canvas.width = cropW;
    canvas.height = cropH;
    
    const ctx = canvas.getContext('2d');

    // Apply mirror effect if enabled
    ctx.save();
    if (this.mirror) {
      ctx.translate(cropW, 0);
      ctx.scale(-1, 1);
    }

    // Draw video frame to canvas
    ctx.drawImage(this.video, sx, sy, cropW, cropH, 0, 0, cropW, cropH);
    ctx.restore();

    // Return data URL
    return canvas.toDataURL('image/png', CONFIG.PHOTOS.QUALITY);
  }

  /**
   * Get available cameras
   * @returns {Promise<Array>} - Array of camera devices
   */
  async getAvailableCameras() {
    if (!this.isSupported()) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      Utils.logError('Camera.getAvailableCameras', error);
      return [];
    }
  }

  /**
   * Check camera permissions
   * @returns {Promise<string>} - Permission state
   */
  async checkPermissions() {
    if (!navigator.permissions) {
      return 'unknown';
    }

    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      return result.state;
    } catch (error) {
      Utils.logError('Camera.checkPermissions', error);
      return 'unknown';
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopCamera();
    this.video = null;
    this.isInitialized = false;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CameraManager;
}
