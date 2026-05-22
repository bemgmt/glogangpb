/**
 * Session Manager
 * Handles user sessions with security and timeout management
 */

class SessionManager {
  constructor() {
    this.currentSession = null;
    this.timeoutId = null;
    this.loginAttempts = 0;
    this.lastActivity = Date.now();
  }

  /**
   * Initialize session manager
   */
  init() {
    // Load existing session
    this.loadSession();
    
    // Set up activity tracking
    this.setupActivityTracking();
    
    // Start session timeout monitoring
    this.startTimeoutMonitoring();
  }

  /**
   * Create new session
   * @param {string} type - Session type ('qr', 'payment', 'free')
   * @param {Object} data - Session data
   * @returns {Object} - Session object
   */
  createSession(type, data = {}) {
    const session = {
      id: Utils.generateUUID(),
      type: type,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + CONFIG.SECURITY.SESSION_TIMEOUT,
      data: { ...data },
      isActive: true
    };

    this.currentSession = session;
    this.saveSession();
    this.resetTimeout();
    
    return session;
  }

  /**
   * Load session from storage
   */
  loadSession() {
    const sessionData = Storage.getSession();
    
    if (sessionData && this.isValidSession(sessionData)) {
      this.currentSession = sessionData;
      this.resetTimeout();
    } else {
      this.clearSession();
    }
  }

  /**
   * Save session to storage
   */
  saveSession() {
    if (this.currentSession) {
      Storage.setSession(this.currentSession);
    }
  }

  /**
   * Validate session
   * @param {Object} session - Session object
   * @returns {boolean} - Is valid
   */
  isValidSession(session) {
    if (!session || typeof session !== 'object') {
      return false;
    }

    // Check required fields
    if (!session.id || !session.type || !session.createdAt) {
      return false;
    }

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return false;
    }

    // Check if session is active
    if (!session.isActive) {
      return false;
    }

    return true;
  }

  /**
   * Update session activity
   */
  updateActivity() {
    this.lastActivity = Date.now();
    
    if (this.currentSession) {
      this.currentSession.lastActivity = this.lastActivity;
      this.currentSession.expiresAt = this.lastActivity + CONFIG.SECURITY.SESSION_TIMEOUT;
      this.saveSession();
      this.resetTimeout();
    }
  }

  /**
   * Get current session
   * @returns {Object|null} - Current session
   */
  getCurrentSession() {
    if (this.currentSession && this.isValidSession(this.currentSession)) {
      return this.currentSession;
    }
    return null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Is authenticated
   */
  isAuthenticated() {
    return !!this.getCurrentSession();
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.currentSession = null;
    Storage.clearSession();
    this.clearTimeout();
  }

  /**
   * End session
   */
  endSession() {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.currentSession.endedAt = Date.now();
      this.saveSession();
    }
    
    this.clearSession();
  }

  /**
   * Setup activity tracking
   */
  setupActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = Utils.throttle(() => {
      this.updateActivity();
    }, 30000); // Update at most every 30 seconds

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
  }

  /**
   * Start session timeout monitoring
   */
  startTimeoutMonitoring() {
    this.resetTimeout();
  }

  /**
   * Reset session timeout
   */
  resetTimeout() {
    this.clearTimeout();
    
    if (this.currentSession) {
      const timeUntilExpiry = this.currentSession.expiresAt - Date.now();
      
      if (timeUntilExpiry > 0) {
        this.timeoutId = setTimeout(() => {
          this.handleSessionTimeout();
        }, timeUntilExpiry);
      } else {
        this.handleSessionTimeout();
      }
    }
  }

  /**
   * Clear session timeout
   */
  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Handle session timeout
   */
  handleSessionTimeout() {
    Utils.showToast(CONFIG.ERRORS.SESSION_EXPIRED, 'warn');
    this.endSession();
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  }

  /**
   * Validate PIN with rate limiting
   * @param {string} pin - PIN to validate
   * @returns {boolean} - Is valid PIN
   */
  validatePin(pin) {
    // Check rate limiting
    if (this.loginAttempts >= CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS) {
      Utils.showToast('Too many failed attempts. Please wait.', 'warn');
      return false;
    }

    const storedPin = Storage.getPin();
    const isValid = pin === storedPin;

    if (!isValid) {
      this.loginAttempts++;
      
      // Reset attempts after some time
      setTimeout(() => {
        this.loginAttempts = Math.max(0, this.loginAttempts - 1);
      }, 60000); // 1 minute
    } else {
      this.loginAttempts = 0;
    }

    return isValid;
  }

  /**
   * Get session statistics
   * @returns {Object} - Session statistics
   */
  getSessionStats() {
    const session = this.getCurrentSession();
    
    if (!session) {
      return { active: false };
    }

    const now = Date.now();
    const duration = now - session.createdAt;
    const timeUntilExpiry = session.expiresAt - now;

    return {
      active: true,
      id: session.id,
      type: session.type,
      duration: duration,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    };
  }

  /**
   * Extend session
   * @param {number} additionalTime - Additional time in milliseconds
   */
  extendSession(additionalTime = CONFIG.SECURITY.SESSION_TIMEOUT) {
    if (this.currentSession) {
      this.currentSession.expiresAt = Date.now() + additionalTime;
      this.saveSession();
      this.resetTimeout();
    }
  }

  /**
   * Check payment status from URL parameters
   * @returns {boolean} - Payment completed
   */
  checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    return urlParams.get('paid') === '1' || hashParams.get('paid') === '1';
  }

  /**
   * Handle payment completion
   */
  handlePaymentComplete() {
    if (this.checkPaymentStatus()) {
      // Clear payment flags from URL
      const url = new URL(window.location);
      url.searchParams.delete('paid');
      url.hash = '';
      window.history.replaceState({}, document.title, url.toString());
      
      // Create payment session
      this.createSession('payment', { 
        amount: CONFIG.PAYMENT.AMOUNT_CENTS,
        currency: CONFIG.PAYMENT.CURRENCY,
        completedAt: Date.now()
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Cleanup session manager
   */
  destroy() {
    this.clearTimeout();
    this.currentSession = null;
  }
}

// Create global session manager instance
const Session = new SessionManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}
