/**
 * Secure Storage Manager
 * Handles all localStorage operations with validation and error handling
 */

class StorageManager {
  constructor() {
    this.isAvailable = this.checkStorageAvailability();
  }

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      Utils.logError('Storage', new Error('localStorage not available'));
      return false;
    }
  }

  /**
   * Safely get item from localStorage with validation
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} - Stored value or default
   */
  getItem(key, defaultValue = null) {
    if (!this.isAvailable) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (error) {
      Utils.logError('Storage.getItem', error);
      return defaultValue;
    }
  }

  /**
   * Safely set item in localStorage with validation
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} - Success status
   */
  setItem(key, value) {
    if (!this.isAvailable) return false;

    try {
      // Check storage quota before setting
      if (this.isStorageFull()) {
        Utils.showToast(CONFIG.ERRORS.STORAGE_FULL, 'warn');
        return false;
      }

      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      Utils.logError('Storage.setItem', error);
      if (error.name === 'QuotaExceededError') {
        Utils.showToast(CONFIG.ERRORS.STORAGE_FULL, 'warn');
      }
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  removeItem(key) {
    if (!this.isAvailable) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      Utils.logError('Storage.removeItem', error);
      return false;
    }
  }

  /**
   * Clear all storage
   * @returns {boolean} - Success status
   */
  clear() {
    if (!this.isAvailable) return false;

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      Utils.logError('Storage.clear', error);
      return false;
    }
  }

  /**
   * Check if storage is approaching quota limit
   * @returns {boolean}
   */
  isStorageFull() {
    if (!this.isAvailable) return true;

    try {
      // Estimate storage usage (rough calculation)
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      
      // Assume 5MB limit for localStorage (varies by browser)
      const estimatedLimit = 5 * 1024 * 1024;
      return totalSize > estimatedLimit * 0.9; // 90% threshold
    } catch (error) {
      Utils.logError('Storage.isStorageFull', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} - Storage statistics
   */
  getStorageStats() {
    if (!this.isAvailable) {
      return { available: false, totalSize: 0, itemCount: 0 };
    }

    try {
      let totalSize = 0;
      let itemCount = 0;

      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
          itemCount++;
        }
      }

      return {
        available: true,
        totalSize,
        itemCount,
        formattedSize: Utils.formatFileSize(totalSize)
      };
    } catch (error) {
      Utils.logError('Storage.getStorageStats', error);
      return { available: false, totalSize: 0, itemCount: 0 };
    }
  }

  // Specific storage methods for application data

  /**
   * Get photos from storage
   * @returns {Array} - Array of photo objects
   */
  getPhotos() {
    const photos = this.getItem(CONFIG.STORAGE.KEYS.PHOTOS, []);
    return Array.isArray(photos) ? photos : [];
  }

  /**
   * Save photos to storage with cleanup if needed
   * @param {Array} photos - Array of photo objects
   * @returns {boolean} - Success status
   */
  setPhotos(photos) {
    if (!Array.isArray(photos)) return false;

    // Cleanup old photos if we have too many
    if (photos.length > CONFIG.STORAGE.MAX_PHOTOS) {
      photos = photos.slice(-CONFIG.STORAGE.CLEANUP_THRESHOLD);
    }

    return this.setItem(CONFIG.STORAGE.KEYS.PHOTOS, photos);
  }

  /**
   * Add single photo to storage
   * @param {Object} photo - Photo object
   * @returns {boolean} - Success status
   */
  addPhoto(photo) {
    const photos = this.getPhotos();
    photos.push(photo);
    return this.setPhotos(photos);
  }

  /**
   * Remove photo from storage
   * @param {string} photoId - Photo ID
   * @returns {boolean} - Success status
   */
  removePhoto(photoId) {
    const photos = this.getPhotos();
    const filteredPhotos = photos.filter(photo => photo.id !== photoId);
    return this.setPhotos(filteredPhotos);
  }

  /**
   * Get settings PIN
   * @returns {string} - PIN or default
   */
  getPin() {
    return this.getItem(CONFIG.STORAGE.KEYS.SETTINGS_PIN, CONFIG.SECURITY.DEFAULT_PIN);
  }

  /**
   * Set settings PIN
   * @param {string} pin - New PIN
   * @returns {boolean} - Success status
   */
  setPin(pin) {
    if (typeof pin !== 'string' || pin.length !== CONFIG.SECURITY.PIN_LENGTH) {
      return false;
    }
    return this.setItem(CONFIG.STORAGE.KEYS.SETTINGS_PIN, pin);
  }

  /**
   * Get payment enabled status
   * @returns {boolean} - Payment enabled status
   */
  getPaymentEnabled() {
    return this.getItem(CONFIG.STORAGE.KEYS.PAYMENT_ENABLED, true);
  }

  /**
   * Set payment enabled status
   * @param {boolean} enabled - Payment enabled status
   * @returns {boolean} - Success status
   */
  setPaymentEnabled(enabled) {
    return this.setItem(CONFIG.STORAGE.KEYS.PAYMENT_ENABLED, Boolean(enabled));
  }

  /**
   * Get approved QR codes
   * @returns {Array} - Array of approved codes
   */
  getApprovedCodes() {
    const codes = this.getItem(CONFIG.STORAGE.KEYS.APPROVED_CODES);
    if (codes && typeof codes === 'string') {
      return codes.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    }
    return CONFIG.QR.DEFAULT_APPROVED_CODES.slice();
  }

  /**
   * Set approved QR codes
   * @param {Array} codes - Array of approved codes
   * @returns {boolean} - Success status
   */
  setApprovedCodes(codes) {
    if (!Array.isArray(codes)) return false;
    const codesString = codes.join('\n');
    return this.setItem(CONFIG.STORAGE.KEYS.APPROVED_CODES, codesString);
  }

  /**
   * Get session data
   * @returns {Object|null} - Session data
   */
  getSession() {
    return this.getItem(CONFIG.STORAGE.KEYS.SESSION);
  }

  /**
   * Set session data
   * @param {Object} session - Session data
   * @returns {boolean} - Success status
   */
  setSession(session) {
    return this.setItem(CONFIG.STORAGE.KEYS.SESSION, session);
  }

  /**
   * Clear session data
   * @returns {boolean} - Success status
   */
  clearSession() {
    return this.removeItem(CONFIG.STORAGE.KEYS.SESSION) && 
           this.removeItem(CONFIG.STORAGE.KEYS.PENDING_SESSION);
  }
}

// Create global storage instance
const Storage = new StorageManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
