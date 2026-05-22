/**
 * iPad Safari Desktop Mode Fixes
 * Specific fixes for iPad running Safari in desktop mode
 */

class DesktopModeFixes {
  constructor() {
    this.isIPadDesktopMode = this.detectIPadDesktopMode();
    this.debugMode = false;
    this.fixes = [];
    this.init();
  }

  /**
   * Detect iPad in desktop mode (tricky since it reports as macOS)
   */
  detectIPadDesktopMode() {
    // iPad in desktop mode reports as macOS but has touch support
    const isMacOS = navigator.platform === 'MacIntel';
    const hasTouch = navigator.maxTouchPoints > 0;
    const isLikelyIPad = isMacOS && hasTouch && window.screen.width <= 1366;
    
    // Additional checks for iPad-specific behavior
    const hasIPadViewport = window.screen.width === 1024 || window.screen.width === 1366;
    const hasIPadRatio = Math.abs(window.screen.width / window.screen.height - 4/3) < 0.1 ||
                        Math.abs(window.screen.width / window.screen.height - 3/4) < 0.1;
    
    return isLikelyIPad || (isMacOS && hasTouch && (hasIPadViewport || hasIPadRatio));
  }

  /**
   * Force containers to be visible with aggressive CSS
   */
  forceContainerVisibility() {
    const selectors = [
      '#overlayThumbs',
      '#propThumbs', 
      '.grid2',
      '.wrap > .card',
      '.thumbs',
      '.card'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element) {
          // Aggressive visibility forcing
          element.style.setProperty('display', 'block', 'important');
          element.style.setProperty('visibility', 'visible', 'important');
          element.style.setProperty('opacity', '1', 'important');
          element.style.setProperty('position', 'relative', 'important');
          element.style.setProperty('z-index', '1', 'important');
          element.style.setProperty('min-height', '100px', 'important');
          element.style.setProperty('min-width', '100px', 'important');
          
          // Remove any transforms that might hide content
          element.style.setProperty('transform', 'none', 'important');
          element.style.setProperty('clip', 'auto', 'important');
          element.style.setProperty('clip-path', 'none', 'important');
        }
      });
    });

    this.fixes.push('Forced aggressive container visibility');
  }

  /**
   * Fix layout with flexbox fallback
   */
  fixLayoutWithFlexbox() {
    const wrap = document.querySelector('.wrap');
    const grid2 = document.querySelector('.grid2');

    if (wrap) {
      wrap.style.setProperty('display', 'flex', 'important');
      wrap.style.setProperty('flex-direction', 'row', 'important');
      wrap.style.setProperty('gap', '16px', 'important');
      wrap.style.setProperty('align-items', 'flex-start', 'important');
      
      // Ensure children have proper flex properties
      const stageCard = wrap.querySelector('.stage-card');
      const rightCard = wrap.querySelector('.card');
      
      if (stageCard) {
        stageCard.style.setProperty('flex', '1.2', 'important');
        stageCard.style.setProperty('min-width', '0', 'important');
      }
      
      if (rightCard) {
        rightCard.style.setProperty('flex', '0.8', 'important');
        rightCard.style.setProperty('min-width', '300px', 'important');
      }
    }

    if (grid2) {
      grid2.style.setProperty('display', 'flex', 'important');
      grid2.style.setProperty('flex-direction', 'column', 'important');
      grid2.style.setProperty('gap', '12px', 'important');
      
      // For wider screens, use row layout
      if (window.innerWidth > 800) {
        grid2.style.setProperty('flex-direction', 'row', 'important');
      }
      
      // Ensure children are visible
      const cards = grid2.querySelectorAll('.card');
      cards.forEach(card => {
        card.style.setProperty('flex', '1', 'important');
        card.style.setProperty('min-height', '200px', 'important');
      });
    }

    this.fixes.push('Applied flexbox layout fixes');
  }

  /**
   * Fix thumbs containers specifically
   */
  fixThumbsContainers() {
    const thumbsContainers = document.querySelectorAll('.thumbs');
    
    thumbsContainers.forEach(container => {
      container.style.setProperty('display', 'flex', 'important');
      container.style.setProperty('flex-wrap', 'wrap', 'important');
      container.style.setProperty('gap', '10px', 'important');
      container.style.setProperty('min-height', '120px', 'important');
      container.style.setProperty('padding', '10px', 'important');
      container.style.setProperty('background', 'rgba(255,0,0,0.1)', 'important');
      container.style.setProperty('border', '2px dashed red', 'important');
      
      // Ensure thumb children are visible
      const thumbs = container.querySelectorAll('.thumb');
      thumbs.forEach(thumb => {
        thumb.style.setProperty('flex', '0 0 90px', 'important');
        thumb.style.setProperty('height', '90px', 'important');
        thumb.style.setProperty('display', 'flex', 'important');
        thumb.style.setProperty('align-items', 'center', 'important');
        thumb.style.setProperty('justify-content', 'center', 'important');
      });
    });

    this.fixes.push('Fixed thumbs containers with flexbox');
  }

  /**
   * Add debugging borders to all containers
   */
  addDebugBorders() {
    const containers = document.querySelectorAll('.wrap, .card, .grid2, .thumbs, #overlayThumbs, #propThumbs');
    
    containers.forEach((container, index) => {
      const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan'];
      const color = colors[index % colors.length];
      
      container.style.setProperty('border', `3px solid ${color}`, 'important');
      container.style.setProperty('position', 'relative', 'important');
      
      // Add label
      const label = document.createElement('div');
      label.textContent = container.className || container.id || 'container';
      label.style.cssText = `
        position: absolute; top: -20px; left: 0; z-index: 1000;
        background: ${color}; color: white; padding: 2px 6px;
        font-size: 10px; font-weight: bold;
      `;
      container.appendChild(label);
    });

    this.fixes.push('Added debug borders and labels');
  }

  /**
   * Create a floating debug panel
   */
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'desktop-debug-panel';
    panel.style.cssText = `
      position: fixed; top: 10px; left: 10px; z-index: 10000;
      background: rgba(0,0,0,0.9); color: white; padding: 15px;
      border-radius: 8px; font-family: monospace; font-size: 11px;
      max-width: 350px; max-height: 400px; overflow: auto;
      border: 2px solid #00ff00;
    `;

    const info = this.getDebugInfo();
    panel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px; color: #00ff00;">
        🔍 iPad Desktop Mode Debug Panel
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Detection:</strong><br>
        iPad Desktop Mode: ${this.isIPadDesktopMode ? 'YES' : 'NO'}<br>
        Platform: ${navigator.platform}<br>
        Touch Points: ${navigator.maxTouchPoints}<br>
        Screen: ${window.screen.width}x${window.screen.height}<br>
        Viewport: ${window.innerWidth}x${window.innerHeight}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Applied Fixes:</strong><br>
        ${this.fixes.map(fix => `• ${fix}`).join('<br>')}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Container Status:</strong><br>
        ${this.getContainerStatus()}
      </div>
      <div>
        <button onclick="this.parentElement.remove()" style="background: #ff0000; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Close</button>
        <button onclick="window.location.reload()" style="background: #0066cc; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-left: 5px;">Reload</button>
      </div>
    `;

    document.body.appendChild(panel);
  }

  /**
   * Get container status for debugging
   */
  getContainerStatus() {
    const containers = [
      { name: 'overlayThumbs', selector: '#overlayThumbs' },
      { name: 'propThumbs', selector: '#propThumbs' },
      { name: 'grid2', selector: '.grid2' },
      { name: 'rightCard', selector: '.wrap > .card' }
    ];

    return containers.map(({ name, selector }) => {
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0;
        return `${name}: ${visible ? '✅' : '❌'} (${Math.round(rect.width)}x${Math.round(rect.height)})`;
      }
      return `${name}: ❌ NOT FOUND`;
    }).join('<br>');
  }

  /**
   * Get comprehensive debug information
   */
  getDebugInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      screen: { width: window.screen.width, height: window.screen.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      isIPadDesktopMode: this.isIPadDesktopMode,
      cssSupport: {
        grid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        customProperties: CSS.supports('color', 'var(--test)')
      }
    };
  }

  /**
   * Initialize all fixes
   */
  init() {
    console.log('Desktop Mode Fixes initializing...', {
      isIPadDesktopMode: this.isIPadDesktopMode,
      platform: navigator.platform,
      touchPoints: navigator.maxTouchPoints
    });

    // Apply fixes immediately
    this.applyFixes();

    // Apply fixes after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.applyFixes(), 500);
      });
    } else {
      setTimeout(() => this.applyFixes(), 500);
    }

    // Re-apply fixes on resize/orientation change
    window.addEventListener('resize', () => {
      setTimeout(() => this.applyFixes(), 100);
    });

    // Expose global functions for manual debugging
    window.fixContainersNow = () => this.applyFixes();
    window.showDesktopDebug = () => this.createDebugPanel();
    window.addDebugBorders = () => this.addDebugBorders();
  }

  /**
   * Apply all fixes
   */
  applyFixes() {
    console.log('Applying desktop mode fixes...');
    
    this.forceContainerVisibility();
    this.fixLayoutWithFlexbox();
    this.fixThumbsContainers();
    
    // If still having issues, add debug borders
    setTimeout(() => {
      const overlayThumbs = document.querySelector('#overlayThumbs');
      const propThumbs = document.querySelector('#propThumbs');
      
      if (!overlayThumbs || !propThumbs || 
          overlayThumbs.getBoundingClientRect().width === 0 ||
          propThumbs.getBoundingClientRect().width === 0) {
        console.warn('Containers still not visible, adding debug borders');
        this.addDebugBorders();
        this.createDebugPanel();
      }
    }, 1000);

    console.log('Desktop mode fixes applied:', this.fixes);
  }
}

// Initialize immediately
window.DesktopModeFixes = new DesktopModeFixes();

// Also expose for manual testing
window.enableDesktopDebug = () => {
  window.DesktopModeFixes.createDebugPanel();
  window.DesktopModeFixes.addDebugBorders();
};
