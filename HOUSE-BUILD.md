# Plan-to-house hero

The plan SVG and Three.js geometry both use villa-layout.js. Wall segments, opening intervals, building slabs, furniture positions and pool coordinates agree. The 18 x 12 m L-shaped courtyard villa is an illustrative design study, not permit-ready drawings or a completed client project.

Native scroll controls drawing strokes, plan translation, wall extrusion, sliding window assemblies, descending roofs, pergola and planting. Reversing scroll reverses construction. Rendering stops when settled, offscreen or hidden. Reduced-motion mode shows a static model with selectable stages. WebGL failure falls back to the complete floor plan.

All code and materials are local. Procedural texture canvases, seeded instanced foliage, physical glass, sky environment and sun shadows; no external runtime assets. Three.js 0.160.1 is vendored under its MIT license at assets/vendor/THREE-LICENSE.txt. Source: https://github.com/mrdoob/three.js/tree/r160

QA: desktop and mobile emulation screenshots, stage selection, reverse scrolling, reduced motion and browser fallback. Performance varies with device GPU; no claim of photorealistic photography or measured mobile hardware frame rate.
