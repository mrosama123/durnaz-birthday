/* ============================================================
   DURNAZ — LUXURY PRINCESS BIRTHDAY EXPERIENCE — SCRIPT
   ============================================================ */
(() => {
  "use strict";

  /* ---------------------------------------------------------
     0. UTIL
  --------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (min, max) => Math.random() * (max - min) + min;

  /* ---------------------------------------------------------
     1. LOADER
  --------------------------------------------------------- */
  const loader = $("#loader");
  const loaderBar = $("#loaderBar");
  const loaderCaption = $("#loaderCaption");
  const loaderSparkles = $("#loaderSparkles");
  const giftGate = $("#giftGate");

  const captions = [
    "preparing something beautiful",
    "gathering rose petals",
    "polishing the gold",
    "almost there, Dodoo"
  ];

  function spawnLoaderSparkles() {
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("div");
      s.className = "spark";
      s.style.left = rand(0, 100) + "%";
      s.style.top = rand(0, 100) + "%";
      s.style.animationDelay = rand(0, 1.8) + "s";
      loaderSparkles.appendChild(s);
    }
  }
  spawnLoaderSparkles();

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += rand(6, 14);
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      loaderCaption.textContent = "welcome, princess";
      setTimeout(finishLoading, 550);
    }
    loaderBar.style.width = progress + "%";
    const idx = Math.min(captions.length - 1, Math.floor((progress / 100) * captions.length));
    loaderCaption.textContent = captions[idx];
  }, 220);

  function finishLoading() {
    loader.classList.add("hide");
    giftGate.classList.add("ready");
    setTimeout(() => { loader.style.display = "none"; }, 1100);
  }

  /* ---------------------------------------------------------
     2. AMBIENT FLOATING FIELD (roses / butterflies / hearts / gold specks)
  --------------------------------------------------------- */
  const ambientField = $("#ambientField");
  const ambientEmojis = ["🌹", "🦋", "💛", "✨", "🦋", "🌹"];

  function spawnAmbient() {
    if (reducedMotion) return;
    const el = document.createElement("span");
    el.textContent = ambientEmojis[Math.floor(Math.random() * ambientEmojis.length)];
    el.style.left = rand(0, 100) + "%";
    el.style.setProperty("--drift", rand(-60, 60) + "px");
    el.style.fontSize = rand(0.8, 1.5) + "rem";
    const dur = rand(10, 18);
    el.style.animationDuration = dur + "s";
    ambientField.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 500);
  }
  const ambientTimer = setInterval(spawnAmbient, 1400);

  /* ---------------------------------------------------------
     3. MUSIC BUTTON
  --------------------------------------------------------- */
  const musicBtn = $("#musicToggle");
  const bgMusic = $("#bgMusic");
  let musicPlaying = false;

  musicBtn.addEventListener("click", () => {
    if (!musicPlaying) {
      bgMusic.play().catch(() => { /* file not uploaded yet — silently ignore */ });
      musicPlaying = true;
      musicBtn.classList.add("playing");
      musicBtn.setAttribute("aria-label", "Pause music");
    } else {
      bgMusic.pause();
      musicPlaying = false;
      musicBtn.classList.remove("playing");
      musicBtn.setAttribute("aria-label", "Play music");
    }
  });

  /* ---------------------------------------------------------
     4. GIFT BOX OPENING — 3D burst
  --------------------------------------------------------- */
  const giftBox = $("#giftBox");
  const giftWrap = $("#giftWrap");
  const mainSite = $("#mainSite");
  const fxCanvas = $("#fxCanvas");
  const fxCtx = fxCanvas.getContext("2d");

  function resizeCanvas(canvas) {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resizeCanvas(fxCanvas);
  window.addEventListener("resize", () => resizeCanvas(fxCanvas));

  // particle system for the gift burst
  class Particle {
    constructor(x, y, kind) {
      this.x = x; this.y = y;
      this.kind = kind; // 'rose' | 'butterfly' | 'spark' | 'heart' | 'confetti'
      const angle = rand(0, Math.PI * 2);
      const speed = rand(3, 10);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - rand(2, 6);
      this.rot = rand(0, 360);
      this.vrot = rand(-6, 6);
      this.size = rand(14, 26);
      this.life = 1;
      this.decay = rand(0.004, 0.009);
      this.gravity = 0.14;
      this.symbol = this.getSymbol();
      this.color = this.getColor();
    }
    getSymbol() {
      switch (this.kind) {
        case "rose": return "🌹";
        case "butterfly": return "🦋";
        case "heart": return "💛";
        case "confetti": return null;
        default: return null;
      }
    }
    getColor() {
      const golds = ["#C9A44C", "#E9D6A3", "#9C7A2E", "#F4E9D8", "#FFFFFF"];
      return golds[Math.floor(Math.random() * golds.length)];
    }
    update() {
      this.vy += this.gravity * 0.4;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.985;
      this.rot += this.vrot;
      this.life -= this.decay;
    }
    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(this.life, 0);
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rot * Math.PI) / 180);
      if (this.symbol) {
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.symbol, 0, 0);
      } else if (this.kind === "spark") {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.18, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.kind === "confetti") {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size * 0.25, -this.size * 0.12, this.size * 0.5, this.size * 0.24);
      }
      ctx.restore();
    }
  }

  let particles = [];
  let fxRunning = false;

  function launchGiftBurst(originX, originY) {
    const kinds = ["rose", "butterfly", "spark", "heart", "confetti", "spark", "confetti"];
    const count = reducedMotion ? 30 : 110;
    for (let i = 0; i < count; i++) {
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      particles.push(new Particle(originX, originY, kind));
    }
    if (!fxRunning) {
      fxRunning = true;
      requestAnimationFrame(fxLoop);
    }
  }

  function fxLoop() {
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    particles.forEach((p) => { p.update(); p.draw(fxCtx); });
    particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 100);
    if (particles.length > 0) {
      requestAnimationFrame(fxLoop);
    } else {
      fxRunning = false;
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    }
  }

  // fireworks burst (used again at finale, more concentrated)
  function launchFireworkBurst(ctx, canvas, x, y, colorSet) {
    const arr = [];
    const count = reducedMotion ? 18 : 60;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = rand(2.5, 6.5);
      arr.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: rand(0.008, 0.016),
        color: colorSet[Math.floor(Math.random() * colorSet.length)],
        size: rand(1.5, 3)
      });
    }
    return arr;
  }

  let giftOpened = false;
  function openGift() {
    if (giftOpened) return;
    giftOpened = true;
    giftBox.classList.add("opened");

    const rect = giftWrap.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    launchGiftBurst(originX, originY);

    musicBtn.classList.add("armed");
    if (!musicPlaying) {
      bgMusic.play().then(() => {
        musicPlaying = true;
        musicBtn.classList.add("playing");
      }).catch(() => { /* autoplay blocked or file missing — user can tap button */ });
    }

    setTimeout(() => {
      giftGate.classList.add("hide");
      mainSite.classList.add("show");
      document.body.style.overflow = "auto";
      startTypewriter();
      initScrollReveal();
      // force-remove the gate from the render tree once its fade is done,
      // so it can never get stuck mid-transition on any device
      setTimeout(() => {
        giftGate.style.display = "none";
      }, 1300);
    }, 900);
  }

  // require a clean, deliberate tap (not a scroll/drag) before opening
  let touchStartX = 0, touchStartY = 0, touchMoved = false;
  giftBox.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX; touchStartY = t.clientY; touchMoved = false;
  }, { passive: true });
  giftBox.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (Math.abs(t.clientX - touchStartX) > 10 || Math.abs(t.clientY - touchStartY) > 10) {
      touchMoved = true;
    }
  }, { passive: true });
  giftBox.addEventListener("touchend", () => {
    if (!touchMoved) openGift();
  });
  giftBox.addEventListener("click", openGift);
  giftBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGift(); }
  });
  giftBox.setAttribute("tabindex", "0");
  giftBox.setAttribute("role", "button");
  giftBox.setAttribute("aria-label", "Open your gift");

  // lock scroll until gift opens — block all scroll/touchmove on the gate itself
  document.body.style.overflow = "hidden";
  giftGate.addEventListener("touchmove", (e) => {
    if (!giftOpened) e.preventDefault();
  }, { passive: false });

  /* ---------------------------------------------------------
     5. TYPEWRITER HERO MESSAGE
  --------------------------------------------------------- */
  const heroMessageEl = $("#heroMessage");
  const messageLines = [
    "To Durnaz, the one who turns ordinary moments into unforgettable memories...",
    "Happy Birthday.",
    "If I could give you one gift today, it would be the ability to see yourself through my eyes, just so you could realize how truly special you are.",
    "Wishing you a year filled with love, laughter, and all the happiness in the world."
  ];

  let typewriterStarted = false;
  function startTypewriter() {
    if (typewriterStarted) return;
    typewriterStarted = true;

    if (reducedMotion) {
      heroMessageEl.innerHTML = messageLines.map(l => `<p>${l}</p>`).join("");
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;
    const cursor = document.createElement("span");
    cursor.className = "typed-cursor";
    cursor.innerHTML = "&nbsp;";

    function typeNextChar() {
      if (lineIndex >= messageLines.length) {
        cursor.remove();
        return;
      }
      let p = heroMessageEl.querySelector(`p[data-line="${lineIndex}"]`);
      if (!p) {
        p = document.createElement("p");
        p.dataset.line = lineIndex;
        p.style.marginBottom = "0.6em";
        heroMessageEl.appendChild(p);
      }
      const line = messageLines[lineIndex];
      if (charIndex <= line.length) {
        p.textContent = line.slice(0, charIndex);
        p.appendChild(cursor);
        charIndex++;
        setTimeout(typeNextChar, rand(16, 34));
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeNextChar, 420);
      }
    }
    setTimeout(typeNextChar, 350);
  }

  /* ---------------------------------------------------------
     6. SCROLL REVEAL
  --------------------------------------------------------- */
  let revealObserver = null;
  function initScrollReveal() {
    if (revealObserver) return;
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    $$(".reveal").forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------
     7. PARALLAX ON HERO PORTRAIT (subtle, mouse-based)
  --------------------------------------------------------- */
  const heroPortrait = $(".hero-portrait-frame");
  if (heroPortrait && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      heroPortrait.style.transform = `rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg)`;
    });
  }

  /* ---------------------------------------------------------
     8. GALLERY LIGHTBOX
  --------------------------------------------------------- */
  const galleryImages = $$(".gallery-card-inner img");
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");
  let currentLightboxIndex = 0;

  function openLightbox(index) {
    currentLightboxIndex = index;
    lightboxImg.src = galleryImages[index].src;
    lightboxImg.alt = galleryImages[index].alt;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "auto";
  }
  function showLightbox(delta) {
    currentLightboxIndex = (currentLightboxIndex + delta + galleryImages.length) % galleryImages.length;
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
      lightboxImg.src = galleryImages[currentLightboxIndex].src;
      lightboxImg.alt = galleryImages[currentLightboxIndex].alt;
      lightboxImg.style.opacity = 1;
    }, 180);
  }

  galleryImages.forEach((img, i) => {
    img.closest(".gallery-card-inner").addEventListener("click", () => openLightbox(i));
    img.closest(".gallery-card-inner").setAttribute("tabindex", "0");
    img.closest(".gallery-card-inner").setAttribute("role", "button");
    img.closest(".gallery-card-inner").addEventListener("keydown", (e) => {
      if (e.key === "Enter") openLightbox(i);
    });
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => showLightbox(-1));
  lightboxNext.addEventListener("click", () => showLightbox(1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightbox(-1);
    if (e.key === "ArrowRight") showLightbox(1);
  });

  /* ---------------------------------------------------------
     9. FINALE — FIREWORKS + GLOWING HEART REVEAL
  --------------------------------------------------------- */
  const fireworksCanvas = $("#fireworksCanvas");
  const fwCtx = fireworksCanvas.getContext("2d");
  const finaleTrigger = $("#finaleTrigger");
  const finaleHeart = $("#finaleHeart");
  const finaleReveal = $("#finaleReveal");
  const finaleSection = $("#finale");

  function resizeFireworks() {
    fireworksCanvas.width = finaleSection.clientWidth * devicePixelRatio;
    fireworksCanvas.height = finaleSection.clientHeight * devicePixelRatio;
    fireworksCanvas.style.width = finaleSection.clientWidth + "px";
    fireworksCanvas.style.height = finaleSection.clientHeight + "px";
    fwCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resizeFireworks();
  window.addEventListener("resize", resizeFireworks);

  let fireworkParticles = [];
  let fireworksRunning = false;
  const fireworkColors = ["#C9A44C", "#E9D6A3", "#FFFFFF", "#9C7A2E", "#F1D9DD"];

  function fireworksLoop() {
    fwCtx.clearRect(0, 0, finaleSection.clientWidth, finaleSection.clientHeight);
    fireworkParticles.forEach((p) => {
      p.vy += 0.045;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      fwCtx.save();
      fwCtx.globalAlpha = Math.max(p.life, 0);
      fwCtx.fillStyle = p.color;
      fwCtx.shadowColor = p.color;
      fwCtx.shadowBlur = 10;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fwCtx.fill();
      fwCtx.restore();
    });
    fireworkParticles = fireworkParticles.filter((p) => p.life > 0);
    if (fireworkParticles.length > 0) {
      requestAnimationFrame(fireworksLoop);
    } else {
      fireworksRunning = false;
    }
  }

  function popFirework() {
    const w = finaleSection.clientWidth;
    const h = finaleSection.clientHeight;
    const x = rand(w * 0.15, w * 0.85);
    const y = rand(h * 0.15, h * 0.55);
    const burst = launchFireworkBurst(fwCtx, fireworksCanvas, x, y, fireworkColors);
    fireworkParticles.push(...burst);
    if (!fireworksRunning) {
      fireworksRunning = true;
      requestAnimationFrame(fireworksLoop);
    }
  }

  let finaleTriggered = false;
  function triggerFinale() {
    if (finaleTriggered) return;
    finaleTriggered = true;
    finaleTrigger.classList.add("spent");

    const bursts = reducedMotion ? 2 : 6;
    for (let i = 0; i < bursts; i++) {
      setTimeout(popFirework, i * 380);
    }

    setTimeout(() => {
      finaleHeart.classList.add("glow");
    }, bursts * 380 + 200);

    setTimeout(() => {
      finaleReveal.classList.add("in");
    }, bursts * 380 + 900);
  }

  finaleTrigger.addEventListener("click", triggerFinale);

  // auto-trigger finale gently when scrolled into view + idle, as a nice surprise if not clicked
  const finaleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // no auto trigger — keep it an intentional "make a wish" moment
      }
    });
  }, { threshold: 0.6 });
  finaleObserver.observe(finaleSection);

})();
