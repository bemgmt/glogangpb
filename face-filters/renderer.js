(function(){
  'use strict';

  const U = (typeof window !== 'undefined' && window.Utils) ? window.Utils : {
    log: (...a)=>console.log('[FaceRenderer]',...a),
    logError: (...a)=>console.error('[FaceRenderer]',...a),
    showToast: (msg)=>console.log('[Toast]', msg)
  };

  class FaceRenderer {
    constructor(){
      this.canvas = null;
      this.ctx = null; // 2D placeholder
      this._filterPath = null;

      // Optional Three.js fields (used only if global THREE is present)
      this._usingThree = false;
      this._three = null;
      this._renderer = null;
      this._scene = null;
      this._camera = null;
      this._root = null; // anchor root for face
      this._currentModel = null;
    }

    async init(canvasEl){
      try{
        this.canvas = canvasEl || (typeof document!=='undefined'? document.querySelector('#face-filters-canvas') : null);
        if(!this.canvas){ U.showToast('FaceRenderer: canvas not provided'); return false; }

        // Try to use Three.js if available globally
        if(typeof window !== 'undefined' && window.THREE){
          this._three = window.THREE;
          const { WebGLRenderer, Scene, PerspectiveCamera, Color, Group, BoxGeometry, MeshBasicMaterial, Mesh } = this._three;
          this._renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
          this._renderer.setPixelRatio(window.devicePixelRatio || 1);
          this._renderer.setSize(this.canvas.clientWidth || this.canvas.width || 640,
                                 this.canvas.clientHeight || this.canvas.height || 480, false);
          this._renderer.setClearColor(new Color(0x000000), 0); // transparent

          this._scene = new Scene();
          this._camera = new PerspectiveCamera(45, (this.canvas.clientWidth||640)/(this.canvas.clientHeight||480), 0.01, 100);
          this._camera.position.set(0, 0, 1);

          this._root = new Group();
          this._scene.add(this._root);

          // tiny debug cube so we see something rendered
          const cube = new Mesh(new BoxGeometry(0.05,0.05,0.05), new MeshBasicMaterial({ color: 0xffd100 }));
          cube.name = 'debug-cube';
          this._root.add(cube);

          this._usingThree = true;
          U.log('FaceRenderer init: using Three.js (global)');

          const onResize = ()=>{
            const w = this.canvas.clientWidth || this.canvas.width;
            const h = this.canvas.clientHeight || this.canvas.height;
            if(!w || !h) return;
            this._renderer.setSize(w, h, false);
            this._camera.aspect = w / h; this._camera.updateProjectionMatrix();
          };
          window.addEventListener('resize', ()=>setTimeout(onResize, 50));
          onResize();
        } else {
          // Fallback 2D context so renderFrame can no-op safely
          this.ctx = this.canvas.getContext('2d');
          U.log('FaceRenderer init: placeholder 2D (THREE not found)');
        }
        return true;
      }catch(err){ U.logError('init failed', err); return false; }
    }

    _ensureGLTFLoader(){
      return new Promise((resolve)=>{
        if(!this._usingThree || !this._three) return resolve(false);
        if(this._three.GLTFLoader) return resolve(true);
        // attempt to load from CDN matching current THREE revision
        const rev = this._three.REVISION; // e.g., 160
        const ver = `0.${rev}.0`;
        const src = `https://unpkg.com/three@${ver}/examples/js/loaders/GLTFLoader.js`;
        const s = document.createElement('script'); s.src = src; s.async = true;
        s.onload = ()=> resolve(!!this._three.GLTFLoader);
        s.onerror = ()=> { U.logError('Failed to load GLTFLoader from CDN'); resolve(false); };
        document.head.appendChild(s);
      });
    }

    _disposeObject(obj){
      if(!obj) return;
      obj.traverse((n)=>{
        if(n.geometry){ n.geometry.dispose?.(); }
        if(n.material){
          if(Array.isArray(n.material)) n.material.forEach(m=>m.dispose?.());
          else n.material.dispose?.();
        }
      });
      obj.parent?.remove(obj);
    }

    async loadFilter(glbPath){
      try{
        this._filterPath = glbPath;
        if(this._usingThree && this._three){
          const ok = await this._ensureGLTFLoader();
          if(ok){
            try{
              const loader = new this._three.GLTFLoader();
              loader.load(glbPath, (gltf)=>{
                // remove previous
                if(this._currentModel){ this._disposeObject(this._currentModel); this._currentModel = null; }
                // remove debug cube if present
                const dbg = this._root.getObjectByName('debug-cube'); if(dbg) this._root.remove(dbg);
                this._currentModel = gltf.scene;
                this._currentModel.scale.set(0.8,0.8,0.8);
                this._root.add(this._currentModel);
                U.showToast('Face filter model loaded');
              }, undefined, (e)=>{
                U.logError('GLB load error', e);
                U.showToast('Failed to load filter model');
              });
            }catch(e){ U.logError('GLTFLoader usage failed', e); }
          } else {
            U.log('GLTFLoader not available; keeping placeholder');
          }
        } else {
          U.log('Filter queued (placeholder):', glbPath);
        }
        return true;
      }catch(err){ U.logError('loadFilter failed', err); return false; }
    }

    renderFrame(pose){
      try{
        if(this._usingThree && this._renderer && this._scene && this._camera){
          // TODO: Map pose to this._root transform (position/quaternion)
          this._renderer.render(this._scene, this._camera);
          return;
        }
        if(!this.ctx) return;
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle = 'rgba(255,209,0,0.15)';
        this.ctx.fillRect(0,0,20,20);
      }catch(err){ U.logError('renderFrame error', err); }
    }

    async destroy(){
      try{
        if(this._currentModel){ this._disposeObject(this._currentModel); this._currentModel = null; }
        if(this._renderer) { this._renderer.dispose?.(); }
        this.canvas = null; this.ctx = null; this._filterPath = null;
        this._renderer = null; this._scene = null; this._camera = null; this._root = null; this._three = null;
        this._usingThree = false;
        U.log('FaceRenderer destroyed');
      }catch(err){ U.logError('destroy failed', err); }
    }
  }

  if(typeof module !== 'undefined' && module.exports){ module.exports = FaceRenderer; }
  else if(typeof window !== 'undefined'){ window.FaceRenderer = FaceRenderer; }
})();
