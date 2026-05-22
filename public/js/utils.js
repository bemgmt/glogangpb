/**
 * Utility Functions
 * Common utility functions used throughout the application
 */

class Utils {
  /**
   * Secure DOM element selector
   * @param {string} selector - CSS selector
   * @param {Element} root - Root element to search within
   * @returns {Element|null}
   */
  static $(selector, root = document) {
    return root.querySelector(selector);
  }

  /**
   * Secure DOM elements selector
   * @param {string} selector - CSS selector
   * @param {Element} root - Root element to search within
   * @returns {Element[]}
   */
  static $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  /**
   * Sanitize HTML content to prevent XSS
   * @param {string} html - HTML content to sanitize
   * @returns {string} - Sanitized HTML
   */
  static sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Safely set text content
   * @param {Element} element - Target element
   * @param {string} text - Text content
   */
  static setTextContent(element, text) {
    if (element) {
      element.textContent = text || '';
    }
  }

  /**
   * Safely create element with text content
   * @param {string} tagName - HTML tag name
   * @param {string} textContent - Text content
   * @param {string} className - CSS class name
   * @returns {Element}
   */
  static createElement(tagName, textContent = '', className = '') {
    const element = document.createElement(tagName);
    if (textContent) element.textContent = textContent;
    if (className) element.className = className;
    return element;
  }

  /**
   * Generate UUID with fallback for older browsers
   * @returns {string} - UUID string
   */
  static generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} - Throttled function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Format file size in human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file type and size
   * @param {File} file - File to validate
   * @returns {Object} - Validation result
   */
  static validateFile(file) {
    const result = { valid: true, errors: [] };

    if (!file) {
      result.valid = false;
      result.errors.push('No file provided');
      return result;
    }

    // Check file type
    if (!CONFIG.PHOTOS.ALLOWED_TYPES.includes(file.type)) {
      result.valid = false;
      result.errors.push(CONFIG.ERRORS.INVALID_FILE);
    }

    // Check file size
    if (file.size > CONFIG.PHOTOS.MAX_SIZE) {
      result.valid = false;
      result.errors.push(CONFIG.ERRORS.FILE_TOO_LARGE);
    }

    return result;
  }

  /**
   * Convert data URL to File object
   * @param {string} dataURL - Data URL
   * @param {string} filename - File name
   * @returns {File} - File object
   */
  static dataURLtoFile(dataURL, filename = 'photo.png') {
    const [meta, b64] = dataURL.split(',');
    const mime = (meta.match(/data:(.*?);base64/) || [])[1] || 'image/png';
    const bin = atob(b64);
    const len = bin.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8[i] = bin.charCodeAt(i);
    }
    return new File([u8], filename, { type: mime });
  }

  /**
   * Load image with promise
   * @param {string} src - Image source
   * @returns {Promise<HTMLImageElement>}
   */
  static loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  /**
   * Check if feature is supported
   * @param {string} feature - Feature name
   * @returns {boolean}
   */
  static isFeatureSupported(feature) {
    switch (feature) {
      case 'camera':
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      case 'barcode':
        return 'BarcodeDetector' in window;
      case 'share':
        return 'share' in navigator;
      case 'shareFiles':
        return navigator.canShare && navigator.canShare({ files: [new File([], 'test')] });
      case 'crypto':
        return 'crypto' in window && 'randomUUID' in crypto;
      default:
        return false;
    }
  }

  /**
   * Format date for display
   * @param {Date|number} date - Date object or timestamp
   * @returns {string} - Formatted date string
   */
  static formatDate(date) {
    const d = new Date(date);
    return d.toLocaleString();
  }

  /**
   * Clean up object URLs to prevent memory leaks
   * @param {string[]} urls - Array of object URLs
   */
  static cleanupObjectURLs(urls) {
    urls.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }

  /**
   * Log error with context
   * @param {string} context - Error context
   * @param {Error} error - Error object
   */
  static logError(context, error) {
    if (CONFIG.APP.DEBUG) {
      console.error(`[${context}]`, error);
    }
  }

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type (success, error, warning)
   * @param {number} duration - Display duration in milliseconds
   */
  static showToast(message, type = '', duration = CONFIG.UI.TOAST_DURATION) {
    const toast = Utils.$('#toast') || Utils.createToast();
    Utils.setTextContent(toast, message);
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, duration);
  }

  /**
   * Create toast element if it doesn't exist
   * @returns {Element} - Toast element
   */
  static createToast() {
    const toast = Utils.createElement('div', '', 'toast');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; left: 50%; bottom: 6vh; transform: translateX(-50%);
      background: #12161f; border: 1px solid rgba(255,255,255,.12); color: #fff;
      padding: 12px 16px; border-radius: 12px; box-shadow: 0 14px 34px rgba(0,0,0,.5);
      z-index: 50; display: none; font-weight: 800;
    `;
    document.body.appendChild(toast);
    return toast;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
