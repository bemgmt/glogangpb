/**
 * Gesture Handler
 * Handles touch and mouse gestures for prop manipulation
 */

class GestureHandler {
  constructor() {
    this.canvas = null;
    this.controller = null;
    this.isActive = false;
    this.pointers = new Map();
    this.lastGesture = null;
    this.boundHandlers = {};
  }

  init(canvas, controller) {
    this.canvas = canvas;
    this.controller = controller;
    this.setupEventListeners();
    this.isActive = true;
  }

  setupEventListeners() {
    if (!this.canvas) return;

    // Bind event handlers to maintain context
    this.boundHandlers = {
      pointerDown: this.handlePointerDown.bind(this),
      pointerMove: this.handlePointerMove.bind(this),
      pointerUp: this.handlePointerUp.bind(this),
      pointerCancel: this.handlePointerCancel.bind(this)
    };

    // Use pointer events for unified touch/mouse handling
    this.canvas.addEventListener('pointerdown', this.boundHandlers.pointerDown);
    this.canvas.addEventListener('pointermove', this.boundHandlers.pointerMove);
    this.canvas.addEventListener('pointerup', this.boundHandlers.pointerUp);
    this.canvas.addEventListener('pointercancel', this.boundHandlers.pointerCancel);

    // Prevent default touch behaviors
    this.canvas.addEventListener('touchstart', this.preventDefault);
    this.canvas.addEventListener('touchmove', this.preventDefault);
    this.canvas.addEventListener('touchend', this.preventDefault);

    // Set touch-action CSS property
    this.canvas.style.touchAction = 'none';
  }

  preventDefault(event) {
    event.preventDefault();
  }

  handlePointerDown(event) {
    if (!this.isActive) return;

    event.preventDefault();
    this.canvas.setPointerCapture(event.pointerId);
    
    const pointer = this.getPointerFromEvent(event);
    this.pointers.set(event.pointerId, pointer);

    if (this.pointers.size === 1) {
      // Single pointer - check for prop selection
      this.handleSinglePointerDown(pointer);
    }

    this.updateGesture();
  }

  handlePointerMove(event) {
    if (!this.isActive || !this.pointers.has(event.pointerId)) return;

    event.preventDefault();
    
    const pointer = this.getPointerFromEvent(event);
    this.pointers.set(event.pointerId, pointer);

    this.updateGesture();
    this.applyGesture();
  }

  handlePointerUp(event) {
    if (!this.isActive) return;

    event.preventDefault();
    this.canvas.releasePointerCapture(event.pointerId);
    this.pointers.delete(event.pointerId);

    if (this.pointers.size === 0) {
      this.lastGesture = null;
    } else {
      this.updateGesture();
    }
  }

  handlePointerCancel(event) {
    this.handlePointerUp(event);
  }

  getPointerFromEvent(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      id: event.pointerId,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      timestamp: Date.now()
    };
  }

  handleSinglePointerDown(pointer) {
    // Convert canvas coordinates to normalized coordinates
    const normalizedX = pointer.x / this.canvas.offsetWidth;
    const normalizedY = pointer.y / this.canvas.offsetHeight;

    // Check if pointer is over any prop
    const selectedProp = this.findPropAtPosition(normalizedX, normalizedY);
    
    if (selectedProp) {
      this.controller.selectedProp = selectedProp;
      Utils.showToast(`Selected: ${selectedProp.name}`, 'ok');
    } else {
      this.controller.selectedProp = null;
    }
  }

  findPropAtPosition(x, y) {
    // Check props in reverse order (top to bottom)
    for (let i = this.controller.props.length - 1; i >= 0; i--) {
      const prop = this.controller.props[i];
      
      // Calculate prop bounds
      const halfWidth = (prop.width * prop.scale) / 2 / this.canvas.offsetWidth;
      const halfHeight = (prop.height * prop.scale) / 2 / this.canvas.offsetHeight;
      
      const left = prop.x - halfWidth;
      const right = prop.x + halfWidth;
      const top = prop.y - halfHeight;
      const bottom = prop.y + halfHeight;
      
      if (x >= left && x <= right && y >= top && y <= bottom) {
        return prop;
      }
    }
    
    return null;
  }

  updateGesture() {
    const pointerArray = Array.from(this.pointers.values());
    
    if (pointerArray.length === 0) {
      this.lastGesture = null;
      return;
    }

    if (pointerArray.length === 1) {
      // Single pointer - translation
      this.lastGesture = {
        type: 'translate',
        x: pointerArray[0].x / this.canvas.offsetWidth,
        y: pointerArray[0].y / this.canvas.offsetHeight
      };
    } else if (pointerArray.length === 2) {
      // Two pointers - scale and rotate
      const gesture = this.computeTwoPointerGesture(pointerArray[0], pointerArray[1]);
      this.lastGesture = gesture;
    }
  }

  computeTwoPointerGesture(p1, p2) {
    const centerX = (p1.x + p2.x) / 2 / this.canvas.offsetWidth;
    const centerY = (p1.y + p2.y) / 2 / this.canvas.offsetHeight;
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    return {
      type: 'transform',
      centerX,
      centerY,
      distance,
      angle,
      scale: distance / 100, // Normalize scale
      rotation: angle
    };
  }

  applyGesture() {
    if (!this.lastGesture || !this.controller.selectedProp) return;

    const prop = this.controller.selectedProp;

    if (this.lastGesture.type === 'translate') {
      // Update prop position
      prop.x = Math.max(0, Math.min(1, this.lastGesture.x));
      prop.y = Math.max(0, Math.min(1, this.lastGesture.y));
    } else if (this.lastGesture.type === 'transform') {
      // Update prop position, scale, and rotation
      prop.x = Math.max(0, Math.min(1, this.lastGesture.centerX));
      prop.y = Math.max(0, Math.min(1, this.lastGesture.centerY));
      
      // Apply scale with limits
      const newScale = Math.max(CONFIG.UI.MIN_SCALE, Math.min(CONFIG.UI.MAX_SCALE, this.lastGesture.scale));
      prop.scale = newScale;
      
      // Apply rotation
      prop.rotation = this.lastGesture.rotation;
    }

    // Trigger a redraw if needed
    this.requestRedraw();
  }

  requestRedraw() {
    // Debounced redraw to avoid excessive updates
    if (this.redrawTimeout) {
      clearTimeout(this.redrawTimeout);
    }
    
    this.redrawTimeout = setTimeout(() => {
      this.redraw();
    }, 16); // ~60fps
  }

  redraw() {
    // This would trigger a canvas redraw in a more complete implementation
    // For now, we'll just update the visual feedback
    this.updateVisualFeedback();
  }

  updateVisualFeedback() {
    // Add visual feedback for selected prop
    if (this.controller.selectedProp) {
      // This could add selection indicators, handles, etc.
      // For now, we'll just ensure the prop is marked as selected
    }
  }

  // Utility methods for gesture recognition

  getDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  getCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }

  // Gesture validation and smoothing

  isValidGesture(gesture) {
    if (!gesture) return false;
    
    if (gesture.type === 'translate') {
      return gesture.x >= 0 && gesture.x <= 1 && gesture.y >= 0 && gesture.y <= 1;
    }
    
    if (gesture.type === 'transform') {
      return gesture.scale >= CONFIG.UI.MIN_SCALE && gesture.scale <= CONFIG.UI.MAX_SCALE;
    }
    
    return false;
  }

  smoothGesture(gesture, previousGesture, smoothingFactor = 0.1) {
    if (!previousGesture || gesture.type !== previousGesture.type) {
      return gesture;
    }
    
    const smoothed = { ...gesture };
    
    if (gesture.type === 'translate') {
      smoothed.x = previousGesture.x + (gesture.x - previousGesture.x) * smoothingFactor;
      smoothed.y = previousGesture.y + (gesture.y - previousGesture.y) * smoothingFactor;
    } else if (gesture.type === 'transform') {
      smoothed.centerX = previousGesture.centerX + (gesture.centerX - previousGesture.centerX) * smoothingFactor;
      smoothed.centerY = previousGesture.centerY + (gesture.centerY - previousGesture.centerY) * smoothingFactor;
      smoothed.scale = previousGesture.scale + (gesture.scale - previousGesture.scale) * smoothingFactor;
      smoothed.rotation = previousGesture.rotation + (gesture.rotation - previousGesture.rotation) * smoothingFactor;
    }
    
    return smoothed;
  }

  destroy() {
    if (!this.canvas) return;

    // Remove event listeners
    this.canvas.removeEventListener('pointerdown', this.boundHandlers.pointerDown);
    this.canvas.removeEventListener('pointermove', this.boundHandlers.pointerMove);
    this.canvas.removeEventListener('pointerup', this.boundHandlers.pointerUp);
    this.canvas.removeEventListener('pointercancel', this.boundHandlers.pointerCancel);
    
    this.canvas.removeEventListener('touchstart', this.preventDefault);
    this.canvas.removeEventListener('touchmove', this.preventDefault);
    this.canvas.removeEventListener('touchend', this.preventDefault);

    // Clear timeouts
    if (this.redrawTimeout) {
      clearTimeout(this.redrawTimeout);
    }

    // Reset state
    this.pointers.clear();
    this.lastGesture = null;
    this.isActive = false;
    this.canvas = null;
    this.controller = null;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GestureHandler;
}
