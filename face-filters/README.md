# Face Filters Module (Scaffold)

This directory contains the initial scaffolding for real‑time 3D face filters that integrates with the existing Photobooth app.

## Quick Start

1. Include the scripts in your HTML (non‑module):

```html
<script src="face-filters/tracker.js"></script>
<script src="face-filters/renderer.js"></script>
<script src="face-filters/index.js"></script>
```

2. Initialize from your controller:

```js
const ff = new FaceFilters();
await ff.init({ videoEl: document.querySelector('video'),
                canvasEl: document.querySelector('#face-filters-canvas') });
await ff.setFilter('/public/filters/glo_face.glb');
await ff.enable();
```

## API

- `init({ videoEl, canvasEl })` → Promise<boolean>
- `enable()` / `disable()` → Promise<boolean>
- `setFilter(glbPath)` → Promise<boolean>
- `destroy()` → Promise<void>

## Filters Directory

Place your GLB models under `public/filters/`. Example: `public/filters/glo_face.glb`.

Run a quick validation:

```bash
npm run check:glb
```

## Requirements (to be wired next phase)

- Tracking: `@mediapipe/tasks-vision` (Face Landmarker)
- Rendering: `three` (GLTFLoader + scene graph)

## Troubleshooting

- If you see only a small yellow square in top‑left, renderer is in placeholder mode.
- Ensure your `<canvas id="face-filters-canvas">` has explicit width/height or CSS size.
- Very large GLBs (>10MB) can cause jank on mobile – optimize meshes and textures.

## Next Steps

- Integrate MediaPipe FaceLandmarker and emit PoseData from `tracker.js`.
- Implement Three.js scene + anchors in `renderer.js` and map pose → transforms.
- Expose configuration via existing `CONFIG` patterns.

