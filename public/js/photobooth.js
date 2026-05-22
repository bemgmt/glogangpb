/**
 * Photobooth Controller
 * Main controller for the photobooth functionality
 */

class PhotoboothController {
  constructor() {
    this.camera = new CameraManager();
    this.overlays = [];
    this.props = [];
    this.currentOverlay = null;
    this.selectedProp = null;
    this.isCapturing = false;
    this.countdownTimer = null;
    this.elements = {};
    this.gestureHandler = new GestureHandler();
    this.init();
  }

  init() {
    // Check authentication
    if (!Session.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    // Initialize UI elements
    this.initElements();
    this.initEventListeners();
    this.initCamera();
    this.loadAssets();
    
    // Initialize gesture handling
    this.gestureHandler.init(this.elements.canvas, this);
  }

  initElements() {
    this.elements = {
      video: Utils.$('#video'),
      canvas: Utils.$('#canvas'),
      captureBtn: Utils.$('#captureBtn'),
      switchBtn: Utils.$('#switchBtn'),
      mirrorBtn: Utils.$('#mirrorBtn'),
      aspectBtns: Utils.$$('.aspect-btn'),
      overlayGrid: Utils.$('#overlayGrid'),
      propGrid: Utils.$('#propGrid'),
      uploadOverlay: Utils.$('#uploadOverlay'),
      uploadProp: Utils.$('#uploadProp'),
      preview: Utils.$('#preview'),
      previewImg: Utils.$('#previewImg'),
      saveBtn: Utils.$('#saveBtn'),
      shareBtn: Utils.$('#shareBtn'),
      retakeBtn: Utils.$('#retakeBtn'),
      countdown: Utils.$('#countdown'),
      backBtn: Utils.$('#backBtn')
    };
  }

  initEventListeners() {
    // Camera controls
    if (this.elements.captureBtn) {
      this.elements.captureBtn.addEventListener('click', () => this.capturePhoto());
    }
    if (this.elements.switchBtn) {
      this.elements.switchBtn.addEventListener('click', () => this.switchCamera());
    }
    if (this.elements.mirrorBtn) {
      this.elements.mirrorBtn.addEventListener('click', () => this.toggleMirror());
    }

    // Aspect ratio buttons
    this.elements.aspectBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setAspectRatio(btn.dataset.aspect));
    });

    // File uploads
    if (this.elements.uploadOverlay) {
      this.elements.uploadOverlay.addEventListener('change', (e) => this.handleOverlayUpload(e));
    }
    if (this.elements.uploadProp) {
      this.elements.uploadProp.addEventListener('change', (e) => this.handlePropUpload(e));
    }

    // Preview controls
    if (this.elements.saveBtn) {
      this.elements.saveBtn.addEventListener('click', () => this.savePhoto());
    }
    if (this.elements.shareBtn) {
      this.elements.shareBtn.addEventListener('click', () => this.sharePhoto());
    }
    if (this.elements.retakeBtn) {
      this.elements.retakeBtn.addEventListener('click', () => this.retakePhoto());
    }

    // Navigation
    if (this.elements.backBtn) {
      this.elements.backBtn.addEventListener('click', () => this.goBack());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  async initCamera() {
    try {
      this.camera.init(this.elements.video);
      await this.camera.startCamera();
      this.updateCameraUI();
    } catch (error) {
      Utils.showToast(error.message, 'warn');
      Utils.logError('PhotoboothController.initCamera', error);
    }
  }

  loadAssets() {
    // Load default overlays
    CONFIG.ASSETS.DEFAULT_OVERLAYS.forEach(overlay => {
      this.addOverlayToGrid(overlay);
    });

    // Load default props
    CONFIG.ASSETS.DEFAULT_PROPS.forEach(prop => {
      this.addPropToGrid(prop);
    });
  }

  addOverlayToGrid(overlay) {
    const item = Utils.createElement('div', '', 'overlay-item');
    item.dataset.src = overlay.src;
    
    const img = Utils.createElement('img');
    img.src = overlay.src;
    img.alt = overlay.name;
    img.onerror = () => {
      item.style.display = 'none';
      Utils.logError('PhotoboothController.addOverlayToGrid', new Error(`Failed to load overlay: ${overlay.src}`));
    };
    
    const label = Utils.createElement('span', overlay.name, 'overlay-label');
    
    item.appendChild(img);
    item.appendChild(label);
    
    item.addEventListener('click', () => this.selectOverlay(overlay));
    
    if (this.elements.overlayGrid) {
      this.elements.overlayGrid.appendChild(item);
    }
  }

  addPropToGrid(prop) {
    const item = Utils.createElement('div', '', 'prop-item');
    item.dataset.src = prop.src;
    
    const img = Utils.createElement('img');
    img.src = prop.src;
    img.alt = prop.name;
    img.onerror = () => {
      item.style.display = 'none';
      Utils.logError('PhotoboothController.addPropToGrid', new Error(`Failed to load prop: ${prop.src}`));
    };
    
    const label = Utils.createElement('span', prop.name, 'prop-label');
    
    item.appendChild(img);
    item.appendChild(label);
    
    item.addEventListener('click', () => this.addProp(prop));
    
    if (this.elements.propGrid) {
      this.elements.propGrid.appendChild(item);
    }
  }

  selectOverlay(overlay) {
    this.currentOverlay = overlay;
    
    // Update UI to show selected overlay
    Utils.$$('.overlay-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.src === overlay.src);
    });
    
    Utils.showToast(`Overlay selected: ${overlay.name}`, 'ok');
  }

  async addProp(prop) {
    try {
      const img = await Utils.loadImage(prop.src);
      
      const propObj = {
        id: Utils.generateUUID(),
        name: prop.name,
        src: prop.src,
        img: img,
        x: 0.5, // Center position (0-1)
        y: 0.5,
        scale: 1,
        rotation: 0,
        width: CONFIG.UI.STICKER_BASE_SIZE,
        height: CONFIG.UI.STICKER_BASE_SIZE * (img.height / img.width)
      };
      
      this.props.push(propObj);
      this.selectedProp = propObj;
      
      Utils.showToast(`Prop added: ${prop.name}`, 'ok');
    } catch (error) {
      Utils.showToast(`Failed to load prop: ${prop.name}`, 'warn');
      Utils.logError('PhotoboothController.addProp', error);
    }
  }

  async handleOverlayUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = Utils.validateFile(file);
    if (!validation.valid) {
      Utils.showToast(validation.errors[0], 'warn');
      return;
    }

    try {
      const dataURL = await this.fileToDataURL(file);
      const overlay = {
        name: file.name,
        src: dataURL
      };
      
      this.addOverlayToGrid(overlay);
      Utils.showToast('Overlay uploaded successfully', 'ok');
    } catch (error) {
      Utils.showToast('Failed to upload overlay', 'warn');
      Utils.logError('PhotoboothController.handleOverlayUpload', error);
    }
  }

  async handlePropUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = Utils.validateFile(file);
    if (!validation.valid) {
      Utils.showToast(validation.errors[0], 'warn');
      return;
    }

    try {
      const dataURL = await this.fileToDataURL(file);
      const prop = {
        name: file.name,
        src: dataURL
      };
      
      this.addPropToGrid(prop);
      Utils.showToast('Prop uploaded successfully', 'ok');
    } catch (error) {
      Utils.showToast('Failed to upload prop', 'warn');
      Utils.logError('PhotoboothController.handlePropUpload', error);
    }
  }

  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async switchCamera() {
    try {
      await this.camera.switchCamera();
      this.updateCameraUI();
      Utils.showToast('Camera switched', 'ok');
    } catch (error) {
      Utils.showToast('Failed to switch camera', 'warn');
      Utils.logError('PhotoboothController.switchCamera', error);
    }
  }

  toggleMirror() {
    this.camera.toggleMirror();
    this.updateCameraUI();
    Utils.showToast(`Mirror ${this.camera.mirror ? 'on' : 'off'}`, 'ok');
  }

  setAspectRatio(aspect) {
    this.camera.setAspectRatio(aspect);
    
    // Update UI
    this.elements.aspectBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.aspect === aspect);
    });
    
    Utils.showToast(`Aspect ratio: ${aspect}`, 'ok');
  }

  updateCameraUI() {
    const status = this.camera.getStatus();
    
    // Update mirror button
    if (this.elements.mirrorBtn) {
      this.elements.mirrorBtn.classList.toggle('active', status.mirror);
    }
    
    // Update video mirror effect
    if (this.elements.video) {
      this.elements.video.style.transform = status.mirror ? 'scaleX(-1)' : 'scaleX(1)';
    }
  }

  async capturePhoto() {
    if (this.isCapturing) return;
    
    try {
      this.isCapturing = true;
      await this.startCountdown();
      
      const dataURL = await this.camera.capturePhoto(this.elements.canvas);
      await this.compositeImage(dataURL);
      
      this.showPreview();
    } catch (error) {
      Utils.showToast('Failed to capture photo', 'warn');
      Utils.logError('PhotoboothController.capturePhoto', error);
    } finally {
      this.isCapturing = false;
    }
  }

  startCountdown() {
    return new Promise((resolve) => {
      let count = CONFIG.UI.COUNTDOWN_DURATION;
      
      const updateCountdown = () => {
        if (this.elements.countdown) {
          Utils.setTextContent(this.elements.countdown, count > 0 ? count.toString() : '📸');
          this.elements.countdown.style.display = 'block';
        }
        
        if (count > 0) {
          count--;
          this.countdownTimer = setTimeout(updateCountdown, CONFIG.UI.COUNTDOWN_INTERVAL);
        } else {
          setTimeout(() => {
            if (this.elements.countdown) {
              this.elements.countdown.style.display = 'none';
            }
            resolve();
          }, 200);
        }
      };
      
      updateCountdown();
    });
  }

  async compositeImage(photoDataURL) {
    const canvas = this.elements.canvas;
    const ctx = canvas.getContext('2d');
    
    // Load the photo
    const photoImg = await Utils.loadImage(photoDataURL);
    
    // Set canvas size to match photo
    canvas.width = photoImg.width;
    canvas.height = photoImg.height;
    
    // Draw the photo
    ctx.drawImage(photoImg, 0, 0);
    
    // Draw overlay if selected
    if (this.currentOverlay) {
      try {
        const overlayImg = await Utils.loadImage(this.currentOverlay.src);
        ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
      } catch (error) {
        Utils.logError('PhotoboothController.compositeImage.overlay', error);
      }
    }
    
    // Draw props
    for (const prop of this.props) {
      try {
        const x = prop.x * canvas.width - (prop.width * prop.scale) / 2;
        const y = prop.y * canvas.height - (prop.height * prop.scale) / 2;
        
        ctx.save();
        ctx.translate(x + (prop.width * prop.scale) / 2, y + (prop.height * prop.scale) / 2);
        ctx.rotate(prop.rotation);
        ctx.scale(prop.scale, prop.scale);
        ctx.drawImage(prop.img, -prop.width / 2, -prop.height / 2, prop.width, prop.height);
        ctx.restore();
      } catch (error) {
        Utils.logError('PhotoboothController.compositeImage.prop', error);
      }
    }
  }

  showPreview() {
    const dataURL = this.elements.canvas.toDataURL('image/png', CONFIG.PHOTOS.QUALITY);
    
    if (this.elements.previewImg) {
      this.elements.previewImg.src = dataURL;
    }
    
    if (this.elements.preview) {
      this.elements.preview.hidden = false;
    }
  }

  async savePhoto() {
    try {
      const dataURL = this.elements.canvas.toDataURL('image/png', CONFIG.PHOTOS.QUALITY);
      const photo = {
        id: Utils.generateUUID(),
        dataURL: dataURL,
        timestamp: Date.now(),
        session: Session.getCurrentSession()?.id
      };
      
      const success = Storage.addPhoto(photo);
      if (success) {
        Utils.showToast('Photo saved successfully', 'ok');
      } else {
        Utils.showToast('Failed to save photo', 'warn');
      }
    } catch (error) {
      Utils.showToast('Failed to save photo', 'warn');
      Utils.logError('PhotoboothController.savePhoto', error);
    }
  }

  async sharePhoto() {
    try {
      const dataURL = this.elements.canvas.toDataURL('image/png', CONFIG.PHOTOS.QUALITY);
      
      if (Utils.isFeatureSupported('shareFiles')) {
        const file = Utils.dataURLtoFile(dataURL, `photobooth-${Date.now()}.png`);
        await navigator.share({
          files: [file],
          title: 'GLO GANG Photobooth',
          text: 'Check out my photobooth photo!'
        });
      } else if (Utils.isFeatureSupported('share')) {
        await navigator.share({
          title: 'GLO GANG Photobooth',
          text: 'Check out my photobooth photo!',
          url: dataURL
        });
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.download = `photobooth-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        Utils.showToast('Photo downloaded', 'ok');
      }
    } catch (error) {
      Utils.showToast('Failed to share photo', 'warn');
      Utils.logError('PhotoboothController.sharePhoto', error);
    }
  }

  retakePhoto() {
    if (this.elements.preview) {
      this.elements.preview.hidden = true;
    }
  }

  goBack() {
    window.location.href = 'index.html';
  }

  handleKeyboard(event) {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (!this.elements.preview?.hidden) {
          this.retakePhoto();
        } else {
          this.capturePhoto();
        }
        break;
      case 'Escape':
        if (!this.elements.preview?.hidden) {
          this.retakePhoto();
        } else {
          this.goBack();
        }
        break;
      case 's':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.savePhoto();
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (this.selectedProp) {
          this.removeProp(this.selectedProp);
        }
        break;
    }
  }

  removeProp(prop) {
    const index = this.props.indexOf(prop);
    if (index > -1) {
      this.props.splice(index, 1);
      if (this.selectedProp === prop) {
        this.selectedProp = null;
      }
      Utils.showToast('Prop removed', 'ok');
    }
  }

  destroy() {
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
    }
    
    this.camera.destroy();
    this.gestureHandler.destroy();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhotoboothController;
}
