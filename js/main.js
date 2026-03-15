/**
 * Anniversary Wrapped — Kaleidoscope Edition (Diverse Effects)
 * 6 distinct visual modes: bloom, geo, rings, wave, crystal, spiral
 * Each slide gets its own effect, segment count, speed, and color palette.
 */
(function () {
  'use strict';

  var TOTAL_SLIDES = 18;
  var DAYS_TOTAL = 1105;
  var KM_TOTAL = 6000;
  var isMobile = function () { return window.innerWidth < 768; };
  var TAU = Math.PI * 2;

  var fullpageApi = null;
  var currentLang = 'en';
  var sound = null;
  var audioContext = null;
  var analyser = null;
  var visualizerRAF = null;
  var animatedSlides = {};

  // ==================== KALEIDOSCOPE CONFIG ====================

  var PALETTES = [
    [[103, 126, 234], [118, 75, 162], [240, 147, 251]],
    [[17, 153, 142], [56, 239, 125], [15, 32, 39]],
    [[240, 147, 251], [244, 87, 108], [255, 138, 128]],
    [[79, 172, 254], [0, 242, 254], [67, 233, 123]],
    [[67, 233, 123], [56, 249, 215], [17, 153, 142]],
    [[250, 112, 154], [254, 225, 64], [240, 147, 251]],
    [[168, 237, 234], [254, 214, 227], [103, 126, 234]],
    [[26, 26, 46], [44, 62, 80], [26, 26, 46]],
    [[251, 146, 60], [244, 63, 94], [236, 72, 153]],
    [[244, 63, 94], [251, 146, 60], [245, 87, 108]],
    [[14, 165, 233], [6, 182, 212], [34, 211, 238]],
    [[20, 20, 20], [30, 30, 30], [15, 15, 15]],
    [[20, 20, 20], [30, 30, 30], [15, 15, 15]],
    [[26, 26, 46], [44, 62, 80], [26, 26, 46]],
    [[139, 92, 246], [236, 72, 153], [168, 85, 247]],
    [[139, 92, 246], [236, 72, 153], [168, 85, 247]],
    [[15, 15, 15], [26, 26, 46], [22, 33, 62]],
    [[29, 185, 84], [56, 239, 125], [22, 163, 74]]
  ];

  //                 fx        seg  spd   fade  rot  (spd scaled down for smoother transitions)
  var SLIDE_CFG = [
    { fx: 'bloom',   seg: 6,  spd: 0.4,  fade: 0.06, rot: 0.01   },  // 1  title
    { fx: 'rings',   seg: 8,  spd: 0.5,  fade: 0.08, rot: 0.005  },  // 2  days
    { fx: 'geo',     seg: 6,  spd: 0.45, fade: 0.07, rot: 0.015  },  // 3  food
    { fx: 'spiral',  seg: 8,  spd: 0.35, fade: 0.06, rot: -0.01  },  // 4  walking
    { fx: 'wave',    seg: 6,  spd: 0.4,  fade: 0.07, rot: 0.008  },  // 5  travel
    { fx: 'bloom',   seg: 8,  spd: 0.25, fade: 0.05, rot: 0.005  },  // 6  jeju
    { fx: 'crystal', seg: 6,  spd: 0.4,  fade: 0.07, rot: -0.012 },  // 7  places
    { fx: 'bloom',   seg: 6,  spd: 0.15, fade: 0.04, rot: 0.003  },  // 8  travel bg
    { fx: 'geo',     seg: 6,  spd: 0.35, fade: 0.06, rot: 0.01   },  // 9  rate intro
    { fx: 'crystal', seg: 6,  spd: 0.5,  fade: 0.08, rot: -0.015 },  // 10 flair
    { fx: 'wave',    seg: 8,  spd: 0.35, fade: 0.06, rot: 0.01   },  // 11 shanghai
    { fx: 'rings',   seg: 4,  spd: 0.15, fade: 0.03, rot: 0.003  },  // 12 pivot 1
    { fx: 'rings',   seg: 4,  spd: 0.15, fade: 0.03, rot: 0.003  },  // 13 pivot 2
    { fx: 'bloom',   seg: 6,  spd: 0.12, fade: 0.03, rot: 0.002  },  // 14 building D
    { fx: 'spiral',  seg: 8,  spd: 0.25, fade: 0.05, rot: -0.008 },  // 15 moments
    { fx: 'spiral',  seg: 8,  spd: 0.22, fade: 0.05, rot: -0.005 },  // 16 song intro
    { fx: 'wave',    seg: 6,  spd: 0.3,  fade: 0.05, rot: 0.005  },  // 17 vinyl
    { fx: 'geo',     seg: 10, spd: 0.55, fade: 0.09, rot: 0.02   }   // 18 renewal
  ];

  // ==================== SHAPE DATA (pre-generated) ====================

  var rng = function (lo, hi) { return lo + Math.random() * (hi - lo); };

  var bloomBlobs = [];
  for (var i = 0; i < 7; i++) {
    bloomBlobs.push({
      rx: rng(0.15, 0.5), ry: rng(0.1, 0.35),
      sx: rng(0.2, 0.5), sy: rng(0.3, 0.6),
      px: rng(0, TAU), py: rng(0, TAU),
      size: rng(0.08, 0.22), ci: i % 3, a: rng(0.2, 0.5)
    });
  }

  var geoShapes = [];
  for (var i = 0; i < 6; i++) {
    geoShapes.push({
      rx: rng(0.1, 0.4), ry: rng(0.05, 0.3),
      sx: rng(0.15, 0.4), sy: rng(0.2, 0.45),
      px: rng(0, TAU), py: rng(0, TAU),
      size: rng(0.03, 0.1), ci: i % 3, a: rng(0.3, 0.7),
      sides: [3, 4, 5, 6][Math.floor(Math.random() * 4)],
      rs: rng(-0.3, 0.3), rp: rng(0, TAU)
    });
  }

  var ringData = [];
  for (var i = 0; i < 6; i++) {
    ringData.push({
      speed: rng(0.15, 0.4), phase: rng(0, 1),
      ci: i % 3, a: rng(0.25, 0.6), w: rng(1.5, 4)
    });
  }

  var waveData = [];
  for (var i = 0; i < 5; i++) {
    waveData.push({
      freq: rng(3, 8), amp: rng(0.05, 0.2),
      speed: rng(0.5, 1.5), phase: rng(0, TAU),
      ci: i % 3, a: rng(0.3, 0.6), w: rng(2, 5),
      yOff: rng(-0.2, 0.2)
    });
  }

  var crystalData = [];
  for (var i = 0; i < 6; i++) {
    crystalData.push({
      rx: rng(0.1, 0.4), ry: rng(0.05, 0.25),
      sx: rng(0.1, 0.3), sy: rng(0.15, 0.35),
      px: rng(0, TAU), py: rng(0, TAU),
      size: rng(0.04, 0.14), aspect: rng(0.2, 0.5),
      ci: i % 3, a: rng(0.2, 0.55),
      rs: rng(-0.2, 0.2), rp: rng(0, TAU)
    });
  }

  var spiralData = [];
  for (var i = 0; i < 4; i++) {
    spiralData.push({
      turns: rng(1.5, 3), reach: rng(0.4, 0.8),
      speed: rng(0.2, 0.6), phase: rng(0, TAU),
      dotSize: rng(0.008, 0.02), ci: i % 3, a: rng(0.3, 0.6),
      dots: Math.floor(rng(15, 30))
    });
  }

  // ==================== KALEIDOSCOPE STATE ====================

  var kalCanvas, kalCtx, kalW, kalH;
  var kalRAF = null;

  var kalPalFrom = PALETTES[0].map(function (c) { return c.slice(); });
  var kalPalTo = PALETTES[0];
  var kalPal = PALETTES[0].map(function (c) { return c.slice(); });
  var kalT = 1;

  var kalFx = SLIDE_CFG[0].fx;
  var kalSeg = SLIDE_CFG[0].seg;
  var kalSpd = SLIDE_CFG[0].spd;
  var kalFade = SLIDE_CFG[0].fade;
  var kalRot = SLIDE_CFG[0].rot;
  var kalSpdTarget = kalSpd;
  var kalFadeTarget = kalFade;
  var kalRotTarget = kalRot;

  function rgbaStr(c, a) {
    return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')';
  }

  function initKaleidoscope() {
    kalCanvas = document.getElementById('kaleidoscope');
    if (!kalCanvas) return;
    kalCtx = kalCanvas.getContext('2d');
    resizeKal();
    window.addEventListener('resize', resizeKal);
    tickKal(0);
  }

  function resizeKal() {
    var dpr = isMobile() ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    kalW = window.innerWidth;
    kalH = window.innerHeight;
    kalCanvas.width = kalW * dpr;
    kalCanvas.height = kalH * dpr;
    kalCanvas.style.width = kalW + 'px';
    kalCanvas.style.height = kalH + 'px';
    kalCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setKalSlide(slideIndex) {
    var idx = Math.max(0, Math.min(slideIndex - 1, PALETTES.length - 1));
    var cfg = SLIDE_CFG[idx] || SLIDE_CFG[0];

    kalPalFrom = kalPal.map(function (c) { return c.slice(); });
    kalPalTo = PALETTES[idx];
    kalT = 0;

    kalFx = cfg.fx;
    kalSeg = cfg.seg;
    kalSpdTarget = cfg.spd;
    kalFadeTarget = cfg.fade;
    kalRotTarget = cfg.rot;
  }

  function lerpVal(a, b, t) { return a + (b - a) * t; }

  function tickKal(time) {
    var t = time * 0.001;

    if (kalT < 1) {
      kalT = Math.min(1, kalT + 0.012);
      var e = kalT * (2 - kalT);
      for (var i = 0; i < kalPal.length; i++) {
        kalPal[i][0] = lerpVal(kalPalFrom[i][0], kalPalTo[i][0], e);
        kalPal[i][1] = lerpVal(kalPalFrom[i][1], kalPalTo[i][1], e);
        kalPal[i][2] = lerpVal(kalPalFrom[i][2], kalPalTo[i][2], e);
      }
    }

    kalSpd = lerpVal(kalSpd, kalSpdTarget, 0.02);
    kalFade = lerpVal(kalFade, kalFadeTarget, 0.04);
    kalRot = lerpVal(kalRot, kalRotTarget, 0.04);

    drawKal(t * kalSpd);
    kalRAF = requestAnimationFrame(tickKal);
  }

  function drawKal(t) {
    var ctx = kalCtx;
    var cx = kalW / 2;
    var cy = kalH / 2;
    var R = Math.max(kalW, kalH) * 0.75;
    var seg = kalSeg;
    var halfSeg = Math.PI / seg;

    ctx.fillStyle = 'rgba(0,0,0,' + kalFade + ')';
    ctx.fillRect(0, 0, kalW, kalH);

    var breathe = 1 + Math.sin(t * 0.25) * 0.025;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * kalRot);
    ctx.scale(breathe, breathe);

    var drawFn;
    switch (kalFx) {
      case 'bloom':   drawFn = fxBloom; break;
      case 'geo':     drawFn = fxGeo; break;
      case 'rings':   drawFn = fxRings; break;
      case 'wave':    drawFn = fxWave; break;
      case 'crystal': drawFn = fxCrystal; break;
      case 'spiral':  drawFn = fxSpiral; break;
      default:        drawFn = fxBloom;
    }

    for (var s = 0; s < seg; s++) {
      ctx.save();
      ctx.rotate(s * 2 * halfSeg);

      for (var m = 0; m < 2; m++) {
        ctx.save();
        if (m === 1) ctx.scale(1, -1);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, 0, halfSeg);
        ctx.closePath();
        ctx.clip();

        drawFn(ctx, t, R, kalPal);

        ctx.restore();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // ==================== EFFECT: BLOOM ====================
  // Soft radial-gradient circles drifting — dreamy, organic

  function fxBloom(ctx, t, R, pal) {
    for (var i = 0; i < bloomBlobs.length; i++) {
      var b = bloomBlobs[i];
      var bx = Math.sin(t * b.sx + b.px) * b.rx * R;
      var by = Math.cos(t * b.sy + b.py) * b.ry * R;
      var sz = b.size * R * (0.7 + 0.3 * Math.sin(t * 0.5 + i));
      var c = pal[b.ci];
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, sz);
      g.addColorStop(0, rgbaStr(c, b.a));
      g.addColorStop(0.6, rgbaStr(c, b.a * 0.4));
      g.addColorStop(1, rgbaStr(c, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, sz, 0, TAU);
      ctx.fill();
    }
  }

  // ==================== EFFECT: GEO ====================
  // Rotating polygons (triangles, squares, pentagons, hexagons)

  function fxGeo(ctx, t, R, pal) {
    for (var i = 0; i < geoShapes.length; i++) {
      var g = geoShapes[i];
      var px = Math.sin(t * g.sx + g.px) * g.rx * R;
      var py = Math.cos(t * g.sy + g.py) * g.ry * R;
      var sz = g.size * R * (0.8 + 0.2 * Math.sin(t * 0.7 + i * 2));
      var c = pal[g.ci];

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(t * g.rs + g.rp);

      ctx.beginPath();
      for (var s = 0; s <= g.sides; s++) {
        var a = (s / g.sides) * TAU;
        var x = Math.cos(a) * sz;
        var y = Math.sin(a) * sz;
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();

      ctx.fillStyle = rgbaStr(c, g.a * 0.25);
      ctx.fill();
      ctx.strokeStyle = rgbaStr(c, g.a);
      ctx.lineWidth = 1.5 + Math.sin(t + i) * 0.5;
      ctx.stroke();

      ctx.restore();
    }
  }

  // ==================== EFFECT: RINGS ====================
  // Concentric expanding circles — pulsing, hypnotic

  function fxRings(ctx, t, R, pal) {
    for (var i = 0; i < ringData.length; i++) {
      var r = ringData[i];
      var progress = ((t * r.speed + r.phase) % 1.0);
      var radius = progress * R * 0.95;
      var alpha = (1 - progress) * r.a;
      var c = pal[r.ci];

      ctx.strokeStyle = rgbaStr(c, alpha);
      ctx.lineWidth = r.w * (1 - progress * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, radius), 0, TAU);
      ctx.stroke();
    }

    for (var i = 0; i < 3; i++) {
      var pulseFrac = ((t * 0.2 + i * 0.33) % 1.0);
      var pr = pulseFrac * R * 0.6;
      var pa = (1 - pulseFrac) * 0.15;
      var c = pal[i % pal.length];
      var gr = ctx.createRadialGradient(0, 0, pr * 0.8, 0, 0, pr);
      gr.addColorStop(0, rgbaStr(c, 0));
      gr.addColorStop(0.5, rgbaStr(c, pa));
      gr.addColorStop(1, rgbaStr(c, 0));
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(0, 0, pr, 0, TAU);
      ctx.fill();
    }
  }

  // ==================== EFFECT: WAVE ====================
  // Sinusoidal ribbon paths — flowing, liquid

  function fxWave(ctx, t, R, pal) {
    for (var i = 0; i < waveData.length; i++) {
      var w = waveData[i];
      var c = pal[w.ci];

      var baseY = w.yOff * R;
      ctx.strokeStyle = rgbaStr(c, w.a);
      ctx.lineWidth = w.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      var step = isMobile() ? 8 : 4;
      for (var x = 0; x < R; x += step) {
        var frac = x / R;
        var y = baseY + Math.sin(frac * w.freq * TAU + t * w.speed + w.phase) * w.amp * R;
        y += Math.sin(frac * w.freq * 0.5 * TAU + t * w.speed * 0.7) * w.amp * R * 0.3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.globalAlpha = 0.15;
      ctx.lineWidth = w.w * 3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // ==================== EFFECT: CRYSTAL ====================
  // Sharp elongated diamond shards with gradient fills

  function fxCrystal(ctx, t, R, pal) {
    for (var i = 0; i < crystalData.length; i++) {
      var cr = crystalData[i];
      var px = Math.sin(t * cr.sx + cr.px) * cr.rx * R;
      var py = Math.cos(t * cr.sy + cr.py) * cr.ry * R;
      var sz = cr.size * R * (0.8 + 0.2 * Math.sin(t * 0.6 + i * 1.5));
      var c = pal[cr.ci];

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(t * cr.rs + cr.rp);

      var hw = sz * cr.aspect;
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.lineTo(hw, 0);
      ctx.lineTo(0, sz * 0.7);
      ctx.lineTo(-hw, 0);
      ctx.closePath();

      var gr = ctx.createLinearGradient(0, -sz, 0, sz * 0.7);
      gr.addColorStop(0, rgbaStr(c, cr.a * 0.8));
      gr.addColorStop(0.5, rgbaStr(c, cr.a * 0.4));
      gr.addColorStop(1, rgbaStr(c, cr.a * 0.1));
      ctx.fillStyle = gr;
      ctx.fill();

      ctx.strokeStyle = rgbaStr(c, cr.a * 0.6);
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  // ==================== EFFECT: SPIRAL ====================
  // Logarithmic spiral arms with trailing dots — rhythmic, musical

  function fxSpiral(ctx, t, R, pal) {
    for (var arm = 0; arm < spiralData.length; arm++) {
      var sp = spiralData[arm];
      var c = pal[sp.ci];

      for (var j = 0; j < sp.dots; j++) {
        var frac = j / sp.dots;
        var angle = frac * sp.turns * TAU + t * sp.speed + sp.phase;
        var dist = frac * R * sp.reach;
        var x = Math.cos(angle) * dist;
        var y = Math.sin(angle) * dist;
        var ds = (1 - frac * 0.6) * sp.dotSize * R;
        var da = sp.a * (1 - frac * 0.4);

        ctx.fillStyle = rgbaStr(c, da);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, ds), 0, TAU);
        ctx.fill();
      }

      ctx.strokeStyle = rgbaStr(c, sp.a * 0.15);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      var step = isMobile() ? 6 : 3;
      for (var j = 0; j < sp.dots * 4; j += step) {
        var frac = j / (sp.dots * 4);
        var angle = frac * sp.turns * TAU + t * sp.speed + sp.phase;
        var dist = frac * R * sp.reach;
        var x = Math.cos(angle) * dist;
        var y = Math.sin(angle) * dist;
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  // ==================== LOADING ====================

  function runLoadingThenMain() {
    var screen = document.getElementById('loading-screen');
    var lines = screen.querySelectorAll('.terminal-line');
    var ready = screen.querySelector('.terminal-ready');
    var cursor = screen.querySelector('.terminal-cursor');
    var explode = screen.querySelector('.loading-explode');

    var tl = gsap.timeline({ onComplete: revealMain });

    lines.forEach(function (line) {
      var text = line.getAttribute('data-text') || '';
      tl.add(function () { typeTerminalLine(line, text); });
      tl.to({}, { duration: text.length * 0.03 + 0.3 });
    });

    tl.to(ready, { opacity: 1, duration: 0.6 }, '+=0.4');
    tl.to(cursor, { opacity: 0, duration: 0.2 }, '+=0.6');
    tl.to(explode, { opacity: 1, duration: 0.15 });
    tl.to(screen, { filter: 'blur(20px)', scale: 1.1, duration: 0.4 });
    tl.to(screen, { opacity: 0, duration: 0.2 });
    tl.add(function () { screen.classList.add('hidden'); });
  }

  function typeTerminalLine(el, text) {
    el.style.opacity = '1';
    el.textContent = '';
    var i = 0;
    function tick() {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        setTimeout(tick, 25);
      }
    }
    tick();
  }

  function revealMain() {
    document.getElementById('fullpage').style.visibility = 'visible';
    initKaleidoscope();
    initFullPage();
    updateProgress(1);
    setKalSlide(1);
    runSlideAnimations(1, document.querySelector('#fullpage .section'));
    initAudio();
    initVinyl();
    initLangToggle();
    var vinylLabel = document.getElementById('vinyl-label');
    if (vinylLabel) vinylLabel.style.backgroundImage = 'url(assets/photos/album_eng.png)';
    initVisualizer();
    initParallax();
    initPhotoModal();
    initShake();
    initRenewal();
  }

  // ==================== PROGRESS BAR ====================

  function updateProgress(index) {
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = ((index / TOTAL_SLIDES) * 100) + '%';
  }

  // ==================== FULLPAGE ====================

  function initFullPage() {
    fullpageApi = new fullpage('#fullpage', {
      licenseKey: 'gpl-v3-license',
      navigation: false,
      scrollBar: false,
      verticalCentered: true,
      animateAnchor: false,
      keyboardScrolling: true,
      touchSensitivity: 15,
      normalScrollElementTouchThreshold: 5,
      onLeave: function (origin, destination) {
        updateProgress(destination.index + 1);
        setKalSlide(destination.index + 1);
      },
      afterLoad: function (origin, destination) {
        runSlideAnimations(destination.index + 1, destination.item);
      }
    });
  }

  // ==================== SLIDE ANIMATIONS ====================

  function runSlideAnimations(idx, el) {
    if (!el || animatedSlides[idx]) return;
    animatedSlides[idx] = true;

    switch (idx) {
      case 1:  animateTitle(el); break;
      case 2:  animateDays(el); break;
      case 3:  animateFood(el); break;
      case 4:  animateWalking(el); break;
      case 5:  animateTravel(el); break;
      case 6:  animateJeju(el); break;
      case 7:  animateCities(el); break;
      case 8:  animateTravelBg(el); break;
      case 9:  animateRateIntro(el); break;
      case 10: animateYelpCard(el); break;
      case 11: animateYelpCard(el); break;
      case 12: animatePivot(el); break;
      case 13: animatePivot(el); break;
      case 14: animateBuildingD(el); break;
      case 15: animateMoments(el); break;
      case 16: animateSongIntro(el); break;
      case 17: animateVinylSlide(el); break;
      case 18: animateRenewal(el); break;
    }
  }

  function animateTitle(el) {
    gsap.fromTo(el.querySelector('.title-main'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
    gsap.fromTo(el.querySelector('.subtitle'), { opacity: 0 }, { opacity: 0.9, duration: 0.6, delay: 0.5 });
    gsap.fromTo(el.querySelector('.tap-prompt'), { opacity: 0 }, { opacity: 0.85, duration: 0.6, delay: 0.8 });
  }

  function animateDays(el) {
    animateCounter(document.getElementById('days-counter'), 0, DAYS_TOTAL, 2200, function () {
      createBurst(document.getElementById('days-burst'), 20);
      if (typeof confetti === 'function') confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    });
    gsap.from(el.querySelector('.stat-label'), { opacity: 0, y: 10, duration: 0.4 });
    gsap.from(el.querySelector('.days-label'), { opacity: 0, y: 10, duration: 0.4, delay: 0.3 });
    var joke = el.querySelector('.joke-stat');
    if (joke) gsap.to(joke, { opacity: 1, duration: 0.5, delay: 2.5 });
  }

  function animateFood(el) {
    gsap.from(el.querySelector('.title'), { opacity: 0, y: 20, duration: 0.4 });
    var stats = el.querySelectorAll('.dash-stat');
    gsap.from(stats, { opacity: 0, y: 15, stagger: 0.12, duration: 0.4, delay: 0.2 });
    var cells = el.querySelectorAll('.food-card');
    cells.forEach(function (cell) {
      gsap.set(cell, { opacity: 0, y: -60 - Math.random() * 80, x: (Math.random() - 0.5) * 80, scale: 0.4, rotation: (Math.random() - 0.5) * 20 });
    });
    gsap.to(cells, {
      opacity: 1, y: 0, x: 0, scale: 1,
      rotation: function () { return gsap.utils.random(-4, 4); },
      duration: 0.6, stagger: 0.05, delay: 0.6, ease: 'back.out(1.2)'
    });
  }

  function animateWalking(el) {
    gsap.from(el.querySelectorAll('.body-text, .walking-icon'), { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 });
    var icon = el.querySelector('.walking-icon');
    if (icon) {
      gsap.to(icon, { y: -10, duration: 0.3, yoyo: true, repeat: 2, ease: 'power2.inOut', delay: 0.7 });
      gsap.to(icon, { rotation: 90, y: 5, duration: 0.3, delay: 1.6, ease: 'power2.in' });
    }
  }

  function animateTravel(el) {
    gsap.from(el.querySelectorAll('.body-text'), { opacity: 0, y: 15, stagger: 0.1, duration: 0.4 });
    animateCounter(document.getElementById('km-counter'), 0, KM_TOTAL, 2500);
    var path = el.querySelector('#travel-path');
    var dots = el.querySelectorAll('.travel-dot');
    if (path && path.getTotalLength) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      gsap.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.5, ease: 'power2.inOut', delay: 0.3 });
    }
    dots.forEach(function (dot, i) { gsap.to(dot, { opacity: 1, duration: 0.3, delay: 0.5 + i * 0.25 }); });
    var jokes = el.querySelectorAll('.joke-stat');
    jokes.forEach(function (j, i) { gsap.to(j, { opacity: 1, duration: 0.5, delay: 2 + i * 0.5 }); });
  }

  function animateJeju(el) {
    gsap.from(el.querySelectorAll('.body-text'), { opacity: 0, stagger: 0.15, duration: 0.5 });
    var img = el.querySelector('.photo-zoom img');
    if (img) gsap.from(img, { scale: 0.9, opacity: 0, duration: 1.2, delay: 0.4, ease: 'power2.out' });
  }

  function animateCities(el) {
    gsap.from(el.querySelector('.title'), { opacity: 0, y: 20, duration: 0.5 });
    gsap.from(el.querySelector('.trip-scroll-wrap'), { opacity: 0, y: 20, duration: 0.6, delay: 0.15, ease: 'power2.out' });
  }

  function animateTravelBg(el) {
    gsap.from(el.querySelector('.body-text'), { opacity: 0, y: 20, duration: 0.8 });
    var bg = el.querySelector('.slide-bg');
    if (bg) gsap.to(bg, { scale: 1.12, duration: 0.6, ease: 'power2.out' });
  }

  function animateRateIntro(el) {
    var text = el.querySelector('.rate-intro-text');
    if (text) gsap.fromTo(text, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
  }

  function animateYelpCard(el) {
    var card = el.querySelector('.yelp-card');
    if (!card) return;
    gsap.from(card, { opacity: 0, y: 30, duration: 0.5 });
    gsap.from(card.querySelectorAll('.yelp-badge, .ranking-badge, .title, .star-rating, .yelp-review-title, .yelp-review-body, .ranking-score, .small-text'), {
      opacity: 0, y: 10, stagger: 0.08, duration: 0.35, delay: 0.2
    });
    var photo = card.querySelector('.photo-slide-up');
    if (photo) gsap.from(photo, { y: 50, opacity: 0, duration: 0.6, delay: 0.5, ease: 'power2.out' });
    var trio = card.querySelectorAll('.photo-trio .photo-cell');
    if (trio.length) gsap.from(trio, { opacity: 0, scale: 0.85, rotation: -4, stagger: 0.12, duration: 0.5, delay: 0.4, ease: 'back.out(1.2)' });
  }

  function animatePivot(el) {
    var text = el.querySelector('.pivot-text');
    if (text) gsap.fromTo(text, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
  }

  function animateBuildingD(el) {
    playAmbient();
    el.querySelectorAll('.line').forEach(function (line, i) {
      gsap.fromTo(line, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9, delay: i * 0.6, ease: 'power2.out' });
    });
    var overlay = el.querySelector('.emotional-overlay');
    if (overlay) gsap.to(overlay, { backdropFilter: 'blur(14px)', duration: 3, ease: 'power2.inOut' });
  }

  function animateMoments(el) {
    gsap.from(el.querySelectorAll('.body-text'), { opacity: 0, y: 15, stagger: 0.25, duration: 0.8 });
  }

  function animateSongIntro(el) {
    var text = el.querySelector('.song-intro-text');
    if (text) gsap.fromTo(text, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' });
  }

  function animateVinylSlide(el) {
    gsap.from(el.querySelector('.body-text'), { opacity: 0, y: 20, duration: 0.5 });
    gsap.from(el.querySelector('.lang-toggle'), { opacity: 0, duration: 0.4, delay: 0.2 });
    gsap.from(el.querySelector('.player-scene'), { opacity: 0, scale: 0.9, duration: 0.8, delay: 0.3, ease: 'back.out(1.2)' });
  }

  function animateRenewal(el) {
    gsap.from(el.querySelector('.renewal-heading'), { opacity: 0, y: 20, duration: 0.6 });
    gsap.from(el.querySelector('.renewal-sub'), { opacity: 0, duration: 0.4, delay: 0.3 });
    gsap.from(el.querySelector('.renewal-buttons'), { opacity: 0, y: 15, duration: 0.4, delay: 0.6 });
  }

  // ==================== HELPERS ====================

  function animateCounter(el, from, to, ms, onComplete) {
    if (!el) return;
    var obj = { value: from };
    gsap.to(obj, {
      value: to, duration: ms / 1000, ease: 'power2.out',
      onUpdate: function () { el.textContent = Math.round(obj.value); },
      onComplete: onComplete || undefined
    });
  }

  function createBurst(container, count) {
    if (!container) return;
    var n = isMobile() ? Math.min(count, 12) : count;
    for (var i = 0; i < n; i++) {
      var dot = document.createElement('div');
      dot.className = 'burst-dot';
      var angle = (i / n) * TAU + Math.random();
      var dist = 80 + Math.random() * 120;
      dot.style.left = '50%'; dot.style.top = '50%';
      container.appendChild(dot);
      gsap.to(dot, { opacity: 0.9, duration: 0.2, delay: i * 0.02 });
      gsap.to(dot, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, duration: 0.8, delay: 0.2 + i * 0.02, ease: 'power2.out' });
    }
    setTimeout(function () { container.innerHTML = ''; }, 1500);
  }

  // ==================== AUDIO ====================

  function initAudio() { loadSound('en'); }

  function loadSound(lang) {
    if (sound) { sound.stop(); sound.unload(); analyser = null; audioContext = null; }
    var file = lang === 'kr' ? 'assets/music/kor_version.mp3' : 'assets/music/eng_version.mp3';
    sound = new Howl({
      src: [file], html5: true,
      onplay: function () { startVisualizer(); },
      onend: function () { stopVinyl(); stopVisualizer(); }
    });
  }

  function playAmbient() {
    try {
      var amb = new Howl({ src: ['assets/sounds/ambient.mp3'], volume: 0.2, loop: false });
      amb.play();
    } catch (e) {}
  }

  // ==================== LANGUAGE TOGGLE ====================

  function initLangToggle() {
    var btns = document.querySelectorAll('.lang-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        if (lang === currentLang) return;
        currentLang = lang;
        btns.forEach(function (b) { b.classList.toggle('active', b === btn); });
        var wasPlaying = sound && sound.playing();
        loadSound(lang);
        var label = document.getElementById('album-label');
        if (label) label.textContent = lang === 'kr' ? 'Our Song (KR)' : 'Our Song (EN)';
        var albumImg = document.getElementById('album-cover-img');
        var albumSrc = lang === 'kr' ? 'assets/photos/album_kor.png' : 'assets/photos/album_eng.png';
        if (albumImg) {
          albumImg.src = albumSrc;
          albumImg.style.display = '';
        }
        var vinylLabel = document.getElementById('vinyl-label');
        if (vinylLabel) vinylLabel.style.backgroundImage = 'url(' + albumSrc + ')';
        if (wasPlaying) {
          sound.play();
          var v = document.getElementById('vinyl');
          var p = document.getElementById('play-btn');
          var n = document.getElementById('needle-arm');
          if (v) v.classList.add('playing');
          if (p) p.classList.add('playing');
          if (n) n.classList.add('playing');
        }
      });
    });
  }

  // ==================== VINYL + CONFETTI ====================

  function initVinyl() {
    var vinyl = document.getElementById('vinyl');
    var needle = document.getElementById('needle-arm');
    var playBtn = document.getElementById('play-btn');
    if (!playBtn || !vinyl) return;

    playBtn.addEventListener('click', function () {
      if (sound && sound.playing()) {
        sound.pause();
        vinyl.classList.remove('playing');
        playBtn.classList.remove('playing');
        if (needle) needle.classList.remove('playing');
        stopVisualizer();
      } else if (sound) {
        sound.play();
        vinyl.classList.add('playing');
        playBtn.classList.add('playing');
        if (needle) needle.classList.add('playing');
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
          setTimeout(function () { confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }); }, 150);
          setTimeout(function () { confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }); }, 200);
        }
      }
    });
  }

  function stopVinyl() {
    var v = document.getElementById('vinyl');
    var p = document.getElementById('play-btn');
    var n = document.getElementById('needle-arm');
    if (v) v.classList.remove('playing');
    if (p) p.classList.remove('playing');
    if (n) n.classList.remove('playing');
  }

  // ==================== VISUALIZER ====================

  function initVisualizer() {
    var canvas = document.getElementById('visualizer');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    function draw() {
      if (!analyser) { visualizerRAF = requestAnimationFrame(draw); return; }
      var data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var bars = 32, bw = w / bars - 2;
      for (var i = 0; i < bars; i++) {
        var v = data[Math.floor((i / bars) * data.length)] || 0;
        var bh = (v / 255) * h * 0.85;
        var gradient = ctx.createLinearGradient(0, h, 0, h - bh);
        gradient.addColorStop(0, 'rgba(29,185,84,0.9)');
        gradient.addColorStop(1, 'rgba(56,239,125,0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(i * (bw + 2) + 1, h - bh, bw, bh);
      }
      visualizerRAF = requestAnimationFrame(draw);
    }
    draw();
  }

  function startVisualizer() {
    if (!sound || !sound._sounds || !sound._sounds[0]) return;
    try {
      var node = sound._sounds[0]._node;
      if (!node) return;
      if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      if (!analyser) {
        var src = audioContext.createMediaElementSource(node);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyser.connect(audioContext.destination);
      }
    } catch (e) { console.warn('Visualizer:', e); }
  }

  function stopVisualizer() {
    if (visualizerRAF) { cancelAnimationFrame(visualizerRAF); visualizerRAF = null; }
  }

  // ==================== PARALLAX ====================

  function initParallax() {
    document.querySelectorAll('.slide-with-bg').forEach(function (section) {
      var bg = section.querySelector('.slide-bg');
      if (!bg) return;
      section.addEventListener('mousemove', function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 25;
        var y = (e.clientY / window.innerHeight - 0.5) * 25;
        gsap.to(bg, { x: x, y: y, duration: 0.4, ease: 'power2.out' });
      });
      section.addEventListener('mouseleave', function () { gsap.to(bg, { x: 0, y: 0, duration: 0.4 }); });
    });
  }

  // ==================== PHOTO MODAL ====================

  function initPhotoModal() {
    var modal = document.getElementById('photo-modal');
    var backdrop = modal.querySelector('.photo-modal-backdrop');
    var closeBtn = modal.querySelector('.photo-modal-close');
    var img = modal.querySelector('.photo-modal-img');
    var caption = modal.querySelector('.photo-modal-caption');

    function open(src, alt, cap) {
      img.src = src || ''; img.alt = alt || '';
      caption.textContent = cap || '';
      modal.classList.add('active');
    }
    function close() { modal.classList.remove('active'); }

    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    document.querySelectorAll('.photo-tappable, .food-card, .city-card.travel-card, .polaroid-cell').forEach(function (el) {
      el.addEventListener('click', function () {
        var imgEl = this.querySelector('img');
        var cap = this.getAttribute('data-caption') || (this.querySelector('.city-name') ? this.querySelector('.city-name').textContent : '');
        if (imgEl && imgEl.src) open(imgEl.src, imgEl.alt, cap);
      });
    });
  }

  // ==================== SHAKE ====================

  function initShake() {
    var overlay = document.getElementById('hidden-memory');
    var closeBtn = overlay ? overlay.querySelector('.hidden-memory-close') : null;
    if (!overlay) return;
    var lastAcc = { x: 0, y: 0, z: 0 }, lastShake = 0;

    function onMotion(e) {
      var acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;
      var d = Math.abs(acc.x - lastAcc.x) + Math.abs(acc.y - lastAcc.y) + Math.abs(acc.z - lastAcc.z);
      lastAcc = { x: acc.x, y: acc.y, z: acc.z };
      if (d > 18 && Date.now() - lastShake > 4000) {
        lastShake = Date.now();
        overlay.classList.add('active');
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', function () { overlay.classList.remove('active'); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('active'); });

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      document.body.addEventListener('click', function req() {
        DeviceMotionEvent.requestPermission().then(function (r) { if (r === 'granted') window.addEventListener('devicemotion', onMotion); }).catch(function () {});
        document.body.removeEventListener('click', req);
      }, { once: true });
    } else {
      window.addEventListener('devicemotion', onMotion);
    }
  }

  // ==================== RENEWAL ====================

  function initRenewal() {
    var renewBtn = document.getElementById('btn-renew');
    var cancelBtn = document.getElementById('btn-cancel');
    var heading = document.getElementById('renewal-heading');
    var sub = document.getElementById('renewal-sub');
    var buttons = document.getElementById('renewal-buttons');
    if (!renewBtn || !cancelBtn) return;

    function doRenew() {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setTimeout(function () { confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }); }, 200);
        setTimeout(function () { confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }); }, 300);
      }
      heading.textContent = 'Subscription renewed.';
      sub.textContent = 'See you in 2029.';
      buttons.innerHTML = '<div class="renewal-heart">\u2764\uFE0F</div>';
    }

    renewBtn.addEventListener('click', doRenew);
    cancelBtn.addEventListener('click', function () {
      this.classList.add('jiggle');
      this.textContent = 'Nice try';
      var self = this;
      setTimeout(function () { self.classList.remove('jiggle'); doRenew(); }, 1000);
    });
  }

  // ==================== BOOT ====================

  document.getElementById('fullpage').style.visibility = 'hidden';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLoadingThenMain);
  } else {
    runLoadingThenMain();
  }
})();
