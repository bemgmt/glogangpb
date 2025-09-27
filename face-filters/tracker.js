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

    // Minimal head pose estimation from landmarks (heuristic, image space)
    _estimateHead(lm, vw, vh){
      // Use FaceMesh-like indices: 33 (left eye outer), 263 (right eye outer), 1 (nose tip)
      const L = lm[33], R = lm[263], N = lm[1] || {x:0.5,y:0.5};
      if(!L || !R){ return { position:{x:0,y:0,z:0}, pitch:0, yaw:0, roll:0 }; }
      const dx = (R.x - L.x); const dy = (R.y - L.y);
      const roll = Math.atan2(dy, dx); // in radians
      // Yaw approximation: nose offset from mid-eye x
      const midX = (L.x + R.x)/2;
      const yaw = (midX - N.x) * 2.0; // scale factor heuristic
      // Pitch approximation: vertical nose vs mid-eye
      const midY = (L.y + R.y)/2;
      const pitch = (N.y - midY) * 2.0; // scale heuristic
      // Center position normalized
      const cx = (midX - 0.5);
      const cy = (midY - 0.5);
      return { position:{ x: cx, y: cy, z: 0 }, pitch, yaw, roll };
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
            const head = this._estimateHead(lm, videoEl.videoWidth, videoEl.videoHeight);
            const pose = { head, landmarks: lm, timestamp: Date.now() };
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
