(function(){
  'use strict';

  const U = (typeof window !== 'undefined' && window.Utils) ? window.Utils : {
    log: (...a)=>console.log('[FaceTracker]',...a),
    logError: (...a)=>console.error('[FaceTracker]',...a),
    showToast: (msg)=>console.log('[Toast]', msg)
  };

  const DEFAULTS = {
    wasmBase: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    modelURL: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
  };

  class FaceTracker {
    constructor(){
      this._running = false;
      this._onPose = null;
      this._tick = this._tick.bind(this);
      this._raf = 0;
      this._provider = 'placeholder';
      this._mp = null; // MediaPipe namespace
      this._landmarker = null;
      this._lastTs = 0;
    }

    _injectScript(src){
      return new Promise((resolve,reject)=>{
        const s = document.createElement('script'); s.src = src; s.async = true;
        s.onload = ()=>resolve(true); s.onerror = ()=>reject(new Error('load failed: '+src));
        document.head.appendChild(s);
      });
    }

    async _ensureMediaPipe(){
      if(typeof window !== 'undefined' && window.FaceLandmarker && window.FilesetResolver) return true;
      try{
        await this._injectScript('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js');
        return !!(window.FaceLandmarker && window.FilesetResolver);
      }catch(e){ U.logError('Failed to load MediaPipe bundle', e); return false; }
    }

    async init(){
      try{
        const ok = await this._ensureMediaPipe();
        if(!ok){ U.log('MediaPipe not available; tracker in placeholder mode'); return true; }
        this._provider = 'mediapipe-cdn';
        this._mp = { FaceLandmarker: window.FaceLandmarker, FilesetResolver: window.FilesetResolver };

        const fileset = await this._mp.FilesetResolver.forVisionTasks(DEFAULTS.wasmBase);
        // Create landmarker
        this._landmarker = await this._mp.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: DEFAULTS.modelURL },
          runningMode: 'VIDEO',
          numFaces: 1
        });
        U.log('MediaPipe FaceLandmarker initialized');
        return true;
      }catch(err){ U.logError('init failed', err); return false; }
    }

    async start(videoEl, onPose){
      try{
        this._onPose = typeof onPose === 'function' ? onPose : null;
        this._running = true;
        this._tick(videoEl);
        U.log('FaceTracker started using', this._provider);
        return true;
      }catch(err){ U.logError('start failed', err); return false; }
    }

    async stop(){
      try{
        this._running = false;
        cancelAnimationFrame(this._raf);
        U.log('FaceTracker stopped');
        return true;
      }catch(err){ U.logError('stop failed', err); return false; }
    }

    async destroy(){
      try{
        await this.stop();
        this._landmarker?.close?.();
        this._landmarker = null; this._mp = null;
        U.log('FaceTracker destroyed');
      }catch(err){ U.logError('destroy failed', err); }
    }

    _tick(videoEl){
      if(!this._running) return;
      this._raf = requestAnimationFrame(()=>this._tick(videoEl));
      try{
        if(this._landmarker && videoEl && videoEl.readyState >= 2){
          const ts = performance.now();
          const res = this._landmarker.detectForVideo(videoEl, ts);
          if(res && Array.isArray(res.faceLandmarks) && res.faceLandmarks.length){
            const lm = res.faceLandmarks[0];
            const pose = { landmarks: lm, timestamp: Date.now() };
            this._onPose?.(pose);
          } else {
            this._onPose?.(null);
          }
        } else {
          this._onPose?.(null);
        }
      }catch(err){ U.logError('tick error', err); }
    }
  }

  if(typeof module !== 'undefined' && module.exports){ module.exports = FaceTracker; }
  else if(typeof window !== 'undefined'){ window.FaceTracker = FaceTracker; }
})();
