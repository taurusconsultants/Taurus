/**
 * WebGL hero backdrop.
 *
 * Raw WebGL1 + a single fullscreen fragment shader — roughly 4KB of code and
 * no library, versus ~150KB for Three.js. That is the whole reason this is
 * hand-written: the page is paid-ad traffic, and first paint is the budget.
 *
 * It degrades safely and silently. If ANY of these are true the shader never
 * starts and the CSS gradient fallback (.hero-fallback) is what the visitor
 * sees — which is a perfectly good hero on its own:
 *   - WebGL unavailable or context creation fails
 *   - viewport narrower than config.motion.webglMinWidth
 *   - prefers-reduced-motion
 *   - config.motion.webglHero === false
 *
 * It also stops rendering entirely when scrolled out of view or the tab is
 * hidden, so it costs nothing once the visitor is reading the page.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),                hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p  = vec2(uv.x * (uRes.x / uRes.y), uv.y);

  float t  = uTime * 0.03;
  vec2  mo = (uMouse - 0.5) * 0.18;

  // Domain warp — this is what stops it reading as generic noise and makes
  // the bands drift like a contour map of a moving surface.
  vec2 q = vec2(fbm(p * 1.5 + t + mo),
                fbm(p * 1.5 + vec2(3.7, 1.2) - t));
  float field = fbm(p * 2.1 + q * 1.5 + vec2(t * 2.0, t * 0.4));

  // Stacked contour bands at three frequencies.
  float lines = 0.0;
  for (int i = 0; i < 3; i++) {
    float fr   = 16.0 + float(i) * 11.0;
    float band = abs(fract(field * fr + uv.y * 1.5) - 0.5);
    float w    = 0.055 + float(i) * 0.02;
    lines += smoothstep(w, 0.0, band) * (0.55 - float(i) * 0.15);
  }

  float glow   = smoothstep(0.15, 0.85, field);
  vec3  base   = mix(vec3(0.031, 0.035, 0.043), vec3(0.055, 0.070, 0.090), glow);
  vec3  accent = vec3(0.776, 0.949, 0.306);  /* brand lime */
  vec3  blue   = vec3(0.224, 0.529, 0.898);

  vec3 col = base;
  col += accent * lines * 0.30 * smoothstep(0.10, 0.90, field);
  col += blue   * lines * 0.10 * (1.0 - field);

  // Vignette + lower falloff keeps the headline area calm and readable.
  float vig = smoothstep(1.15, 0.25, length(uv - 0.5));
  col *= 0.55 + 0.45 * vig;
  col *= 0.75 + 0.25 * smoothstep(0.0, 0.40, uv.y);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('[hero] shader compile failed:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function initHero(canvas, cfg) {
  if (!canvas) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!cfg.webglHero || reduced || window.innerWidth < cfg.webglMinWidth) return null;

  let gl;
  try {
    gl =
      canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) ||
      canvas.getContext('experimental-webgl');
  } catch (e) {
    return null;
  }
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[hero] program link failed:', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  // Fullscreen triangle pair
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  // DPR capped at 1.5 — the shader is smooth gradients, so the extra pixels
  // of a 3x display buy nothing visible and cost real frame time.
  const dpr = () => Math.min(window.devicePixelRatio || 1, 1.5);

  function resize() {
    const w = Math.floor(canvas.clientWidth * dpr());
    const h = Math.floor(canvas.clientHeight * dpr());
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  window.addEventListener(
    'pointermove',
    (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    },
    { passive: true }
  );

  let raf = null;
  let visible = true;
  let running = false;
  const start = performance.now();

  function frame(now) {
    if (!running) return;
    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (running || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));

  // Stop rendering once the hero scrolls away — the single biggest perf win.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        visible ? play() : pause();
      },
      { threshold: 0 }
    ).observe(canvas);
  }

  resize();
  play();
  canvas.classList.add('is-live');

  return { pause, play, resize };
}
