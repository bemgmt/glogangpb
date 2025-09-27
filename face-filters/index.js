(function(){
  'use strict';

  // Safe refs to Utils (optional)
  const U = (typeof window !== 'undefined' && window.Utils) ? window.Utils : {
    log: (...a)=>console.log('[FaceFilters]',...a),
    logError: (...a)=>console.error('[FaceFilters]',...a),
    showToast: (msg)=>console.log('[Toast]', msg)
  };

  // Optional classes on global
  const TrackerClass = (typeof window !== 'undefined' && (window.FaceTracker || window.IOSFaceTracker))
    ? (window.FaceTracker || window.IOSFaceTracker) : null;
  const RendererClass = (typeof window !== 'undefined' && window.FaceRenderer) ? window.FaceRenderer : null;

  class FaceFilters {
    constructor(){
      this.videoEl = null;
      this.canvasEl = null;
      this.enabled = false;
      this.currentFilter = null;
      this.tracker = null;
      this.renderer = null;
      this._raf = 0;
      this._lastPose = null;
    }

    async init({videoEl, canvasEl}={}){
      try{
        this.videoEl = videoEl || (typeof document!=='undefined'? document.querySelector('video') : null);
        this.canvasEl = canvasEl || (typeof document!=='undefined'? document.querySelector('#face-filters-canvas') : null);

        if(!this.videoEl){ U.showToast('FaceFilters: video element not provided'); return false; }
        if(!this.canvasEl){ U.showToast('FaceFilters: canvas element not provided'); return false; }

        if(RendererClass){
          this.renderer = new RendererClass();
          await this.renderer.init(this.canvasEl);
        } else {
          U.log('Renderer not available yet (placeholder mode)');
        }

        if(TrackerClass){
          this.tracker = new TrackerClass();
          await this.tracker.init();
        } else {
          U.log('Tracker not available yet (placeholder mode)');
        }

        U.log('FaceFilters initialized');
        return true;
      }catch(err){
        U.logError('init failed', err);
        U.showToast('Unable to initialize Face Filters');
        return false;
      }
    }

    async enable(){
      try{
        if(this.enabled) return true;
        if(this.tracker && this.videoEl){
          await this.tracker.start(this.videoEl, (pose)=>{
            this._lastPose = pose;
          });
        }
        this.enabled = true;
        this._loop();
        U.showToast('Face Filters enabled');
        return true;
      }catch(err){ U.logError('enable failed', err); return false; }
    }

    async disable(){
      try{
        this.enabled = false;
        cancelAnimationFrame(this._raf);
        if(this.tracker){ await this.tracker.stop(); }
        U.showToast('Face Filters disabled');
        return true;
      }catch(err){ U.logError('disable failed', err); return false; }
    }

    async setFilter(glbPath){
      try{
        if(!glbPath){
          this.currentFilter = null;
          if(this.renderer && this.renderer.clearFilter) await this.renderer.clearFilter();
          U.showToast('Filter cleared');
          return true;
        }
        this.currentFilter = glbPath;
        if(this.renderer){ await this.renderer.loadFilter(glbPath); }
        U.showToast('Filter set');
        return true;
      }catch(err){ U.logError('setFilter failed', err); return false; }
    }

    _loop(){
      if(!this.enabled) return;
      this._raf = requestAnimationFrame(()=>this._loop());
      try{
        if(this.renderer){ this.renderer.renderFrame(this._lastPose); }
      }catch(err){ U.logError('render loop error', err); }
    }

    async destroy(){
      try{
        await this.disable();
        if(this.tracker && this.tracker.destroy) await this.tracker.destroy();
        if(this.renderer && this.renderer.destroy) await this.renderer.destroy();
        this.tracker = null; this.renderer = null;
      }catch(err){ U.logError('destroy failed', err); }
    }
  }

  if(typeof module !== 'undefined' && module.exports){ module.exports = FaceFilters; }
  else if(typeof window !== 'undefined'){ window.FaceFilters = FaceFilters; }
})();
