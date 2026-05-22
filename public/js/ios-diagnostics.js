/**
 * iOS Safari Diagnostics and Fixes
 * Detects and fixes common iOS Safari issues
 */

class IOSDiagnostics {
  constructor() {
    this.isIOS = this.detectIOS();
    this.isSafari = this.detectSafari();
    this.debugMode = false;
    this.fixes = [];
  }

  /**
   * Detect if running on iOS
   */
  detectIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Detect if running on Safari
   */
  detectSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  /**
   * Get device and browser information
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isIOS: this.isIOS,
      isSafari: this.isSafari,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      cssSupport: {
        grid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        customProperties: CSS.supports('color', 'var(--test)'),
        inset: CSS.supports('inset', '0')
      }
    };
  }

  /**
   * Enable debug mode with visual indicators
   */
  enableDebugMode() {
    this.debugMode = true;
    document.body.classList.add('debug');
    
    // Add debug info panel
    this.createDebugPanel();
    
    console.log('iOS Diagnostics Debug Mode Enabled');
    console.log('Device Info:', this.getDeviceInfo());
  }

  /**
   * Create debug information panel
   */
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'ios-debug-panel';
    panel.style.cssText = `
      position: fixed; top: 10px; right: 10px; z-index: 9999;
      background: rgba(0,0,0,0.9); color: white; padding: 10px;
      border-radius: 5px; font-family: monospace; font-size: 12px;
      max-width: 300px; max-height: 200px; overflow: auto;
    `;
    
    const info = this.getDeviceInfo();
    panel.innerHTML = `
      <strong>iOS Diagnostics</strong><br>
      iOS: ${info.isIOS ? 'Yes' : 'No'}<br>
      Safari: ${info.isSafari ? 'Yes' : 'No'}<br>
      Viewport: ${info.viewport.width}x${info.viewport.height}<br>
      CSS Grid: ${info.cssSupport.grid ? 'Yes' : 'No'}<br>
      CSS Flexbox: ${info.cssSupport.flexbox ? 'Yes' : 'No'}<br>
      CSS Variables: ${info.cssSupport.customProperties ? 'Yes' : 'No'}<br>
      CSS Inset: ${info.cssSupport.inset ? 'Yes' : 'No'}<br>
      <button onclick="this.parentElement.remove()">Close</button>
    `;
    
    document.body.appendChild(panel);
  }

  /**
   * Check if elements are visible
   */
  checkElementVisibility() {
    const elements = [
      { name: 'Overlays Container', selector: '#overlayThumbs' },
      { name: 'Props Container', selector: '#propThumbs' },
      { name: 'Grid2 Container', selector: '.grid2' },
      { name: 'Right Card', selector: '.wrap > .card' }
    ];

    const results = [];
    
    elements.forEach(({ name, selector }) => {
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         styles.visibility !== 'hidden' && 
                         styles.display !== 'none' &&
                         parseFloat(styles.opacity) > 0;
        
        results.push({
          name,
          selector,
          element,
          visible: isVisible,
          rect: {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left
          },
          styles: {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            position: styles.position
          }
        });
      } else {
        results.push({
          name,
          selector,
          element: null,
          visible: false,
          error: 'Element not found'
        });
      }
    });

    return results;
  }

  /**
   * Apply iOS-specific fixes
   */
  applyIOSFixes() {
    if (!this.isIOS || !this.isSafari) {
      console.log('Not iOS Safari, skipping iOS-specific fixes');
      return;
    }

    console.log('Applying iOS Safari fixes...');

    // Fix 1: Force flexbox layout if grid is not supported
    if (!CSS.supports('display', 'grid')) {
      this.applyFlexboxFallback();
    }

    // Fix 2: Fix viewport height issues
    this.fixViewportHeight();

    // Fix 3: Ensure containers are visible
    this.forceContainerVisibility();

    // Fix 4: Fix CSS custom properties
    this.fixCSSVariables();

    // Fix 5: Add touch improvements
    this.addTouchImprovements();

    console.log('iOS Safari fixes applied:', this.fixes);
  }

  /**
   * Apply flexbox fallback for grid layout
   */
  applyFlexboxFallback() {
    const wrap = document.querySelector('.wrap');
    const grid2 = document.querySelector('.grid2');
    
    if (wrap) {
      wrap.style.display = 'flex';
      wrap.style.flexDirection = window.innerWidth > 1080 ? 'row' : 'column';
      this.fixes.push('Flexbox fallback for .wrap');
    }
    
    if (grid2) {
      grid2.style.display = 'flex';
      grid2.style.flexDirection = window.innerWidth > 768 ? 'row' : 'column';
      this.fixes.push('Flexbox fallback for .grid2');
    }
  }

  /**
   * Fix viewport height calculation
   */
  fixViewportHeight() {
    const wrap = document.querySelector('.wrap');
    if (wrap) {
      // Use window.innerHeight instead of 100vh for better iOS Safari support
      const height = window.innerHeight - 74;
      wrap.style.height = `${height}px`;
      wrap.style.minHeight = '600px';
      this.fixes.push('Fixed viewport height calculation');
    }
  }

  /**
   * Force container visibility
   */
  forceContainerVisibility() {
    const containers = document.querySelectorAll('.card, .grid2, .thumbs');
    containers.forEach(container => {
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      container.classList.add('force-visible');
    });
    this.fixes.push('Forced container visibility');
  }

  /**
   * Fix CSS custom properties for older Safari
   */
  fixCSSVariables() {
    if (!CSS.supports('color', 'var(--test)')) {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.style.background = '#171a21';
        card.style.color = '#f6f7fb';
      });
      
      const muted = document.querySelectorAll('.muted');
      muted.forEach(el => {
        el.style.color = '#8b93a7';
      });
      
      this.fixes.push('Applied CSS variable fallbacks');
    }
  }

  /**
   * Add touch improvements for iOS
   */
  addTouchImprovements() {
    const touchElements = document.querySelectorAll('.btn, .thumb');
    touchElements.forEach(el => {
      el.style.webkitTapHighlightColor = 'rgba(255, 255, 255, 0.1)';
      el.style.webkitTouchCallout = 'none';
      el.style.webkitUserSelect = 'none';
    });
    this.fixes.push('Added touch improvements');
  }

  /**
   * Run comprehensive diagnostics
   */
  runDiagnostics() {
    console.log('Running iOS Safari diagnostics...');
    
    const deviceInfo = this.getDeviceInfo();
    const visibilityResults = this.checkElementVisibility();
    
    const report = {
      timestamp: new Date().toISOString(),
      deviceInfo,
      visibilityResults,
      fixes: this.fixes,
      recommendations: this.generateRecommendations(visibilityResults)
    };

    console.log('Diagnostics Report:', report);
    
    if (this.debugMode) {
      this.displayDiagnosticsReport(report);
    }
    
    return report;
  }

  /**
   * Generate recommendations based on diagnostics
   */
  generateRecommendations(visibilityResults) {
    const recommendations = [];
    
    visibilityResults.forEach(result => {
      if (!result.visible) {
        if (result.error) {
          recommendations.push(`${result.name}: Element not found - check HTML structure`);
        } else if (result.rect.width === 0 || result.rect.height === 0) {
          recommendations.push(`${result.name}: Zero dimensions - check CSS layout`);
        } else if (result.styles.display === 'none') {
          recommendations.push(`${result.name}: Hidden with display:none`);
        } else if (result.styles.visibility === 'hidden') {
          recommendations.push(`${result.name}: Hidden with visibility:hidden`);
        }
      }
    });
    
    if (!CSS.supports('display', 'grid')) {
      recommendations.push('CSS Grid not supported - use flexbox fallback');
    }
    
    if (!CSS.supports('inset', '0')) {
      recommendations.push('CSS inset property not supported - use top/right/bottom/left');
    }
    
    return recommendations;
  }

  /**
   * Display diagnostics report in UI
   */
  displayDiagnosticsReport(report) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000;
      background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white; padding: 20px; border-radius: 10px; max-width: 90%;
      max-height: 90%; overflow: auto; font-family: monospace; font-size: 12px;
    `;
    
    content.innerHTML = `
      <h3>iOS Safari Diagnostics Report</h3>
      <pre>${JSON.stringify(report, null, 2)}</pre>
      <button onclick="this.closest('div').remove()">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  /**
   * Initialize diagnostics and fixes
   */
  init() {
    console.log('Initializing iOS Safari diagnostics...');
    
    // Apply fixes immediately if on iOS Safari
    this.applyIOSFixes();
    
    // Run diagnostics after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.runDiagnostics(), 1000);
      });
    } else {
      setTimeout(() => this.runDiagnostics(), 1000);
    }
    
    // Re-run fixes on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.applyIOSFixes();
        this.runDiagnostics();
      }, 500);
    });
    
    // Re-run fixes on resize
    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.fixViewportHeight();
      }, 100);
    });
  }
}

// Create global instance
window.IOSDiagnostics = new IOSDiagnostics();

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.IOSDiagnostics.init();
  });
} else {
  window.IOSDiagnostics.init();
}

// Expose debug function globally
window.enableIOSDebug = () => {
  window.IOSDiagnostics.enableDebugMode();
};
