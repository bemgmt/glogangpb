/**
 * Application Configuration
 * Centralized configuration management for the photobooth application
 */

const CONFIG = {
  // Application settings
  APP: {
    NAME: 'GLO GANG Photobooth',
    VERSION: '1.0.0',
    DEBUG: false
  },

  // Security settings
  SECURITY: {
    DEFAULT_PIN: '1234',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 3,
    PIN_LENGTH: 4
  },

  // Camera settings
  CAMERA: {
    DEFAULT_FACING_MODE: 'user',
    IDEAL_WIDTH: 1920,
    IDEAL_HEIGHT: 2560,
    ASPECT_RATIOS: {
      '3:4': { width: 3, height: 4 },
      '1:1': { width: 1, height: 1 },
      '9:16': { width: 9, height: 16 }
    },
    DEFAULT_ASPECT: '3:4'
  },

  // Photo settings
  PHOTOS: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    QUALITY: 0.8,
    MAX_DIMENSION: 2048
  },

  // UI settings
  UI: {
    COUNTDOWN_DURATION: 3,
    COUNTDOWN_INTERVAL: 800,
    TOAST_DURATION: 2200,
    STICKER_BASE_SIZE: 220,
    MIN_SCALE: 0.2,
    MAX_SCALE: 4.0
  },

  // Storage settings
  STORAGE: {
    KEYS: {
      PHOTOS: 'photos',
      SETTINGS_PIN: 'settings_pin',
      PAYMENT_ENABLED: 'payment_enabled',
      APPROVED_CODES: 'approved_codes',
      SESSION: 'session',
      PENDING_SESSION: 'pendingSession'
    },
    MAX_PHOTOS: 100,
    CLEANUP_THRESHOLD: 50
  },

  // Payment settings (should be moved to server-side in production)
  PAYMENT: {
    SQUARE_APP_ID: '', // Configure in production
    AMOUNT_CENTS: 100,
    CURRENCY: 'USD',
    PAYMENT_LINK_URL: '' // Configure in production
  },

  // Asset paths
  ASSETS: {
    OVERLAYS_PATH: 'img/overlays/',
    PROPS_PATH: 'img/props/',
    DEFAULT_OVERLAYS: [
      { name: 'GG Frame', src: 'img/overlays/gg_frame.png' },
      { name: 'Drip', src: 'img/overlays/drip.png' },
      { name: 'Starburst', src: 'img/overlays/starburst.png' }
    ],
    DEFAULT_PROPS: [
      { name: 'Sunglasses', src: 'img/props/sunglasses.png' },
      { name: 'Crown', src: 'img/props/crown.png' },
      { name: 'Chain', src: 'img/props/chain.png' }
    ]
  },

  // QR Code settings
  QR: {
    DEFAULT_APPROVED_CODES: ['GG-TEST-2025', 'VIP-1234'],
    SCAN_TIMEOUT: 30000 // 30 seconds
  },

  // Error messages
  ERRORS: {
    CAMERA_PERMISSION: 'Camera permission denied. Please allow camera access and try again.',
    CAMERA_NOT_FOUND: 'No camera found. Please check your device and try again.',
    CAMERA_GENERIC: 'Camera error occurred. Please refresh the page and try again.',
    STORAGE_FULL: 'Storage is full. Please delete some photos and try again.',
    INVALID_FILE: 'Invalid file type. Please select a valid image file.',
    FILE_TOO_LARGE: 'File is too large. Please select a smaller image.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    PAYMENT_ERROR: 'Payment processing error. Please try again.',
    QR_SCAN_ERROR: 'QR code scanning failed. Please try manual entry.',
    INVALID_PIN: 'Invalid PIN. Please try again.',
    SESSION_EXPIRED: 'Session expired. Please log in again.'
  }
};

// Freeze configuration to prevent modifications
Object.freeze(CONFIG);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
