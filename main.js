/* ===================================
   AI-THON 2026 — Main JavaScript
   Neural Particle Network + Animations
   =================================== */

(function () {
  'use strict';

  // =============================================
  // 1. NEURAL PARTICLE NETWORK CANVAS
  // =============================================
  const canvas  = document.getElementById('particle-canvas');
  const ctx     = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const CONFIG = {
    count:        110,
    maxDist:      180,
    speed:        0.35,
    radius:       2,
    color:        '0, 212, 255',   // cyan
    lineAlpha:    0.12,
    nodeAlpha:    0.55,
    mouseRadius:  160,
    mousePush:    40,
  };

  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * CONFIG.speed;
      this.vy = (Math.random() - 0.5) * CONFIG.speed;
      this.r  = CONFIG.radius * (0.5 + Math.random() * 0.8);
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        this.x += (dx / dist) * force * CONFIG.mousePush * 0.05;
        this.y += (dy / dist) * force * CONFIG.mousePush * 0.05;
      }
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.03;

      // Wrap edges
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      const alpha = CONFIG.nodeAlpha * (0.6 + 0.4 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color}, ${alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) particles.push(new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * CONFIG.lineAlpha;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  function initCanvas() {
    resize();
    initParticles();
    animate();
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // =============================================
  // 2. NAVBAR SCROLL EFFECT
  // =============================================
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // =============================================
  // 3. COUNTDOWN TIMER
  // =============================================
  const eventDate = new Date('2026-03-25T11:30:00+05:30');

  function updateCountdown() {
    const now  = new Date();
    const diff = eventDate - now;
    if (diff <= 0) {
      document.getElementById('countdown').innerHTML = '<span class="event-live">🔴 Event is LIVE!</span>';
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    setCountNum('days',    d);
    setCountNum('hours',   h);
    setCountNum('minutes', m);
    setCountNum('seconds', s);
  }

  function setCountNum(id, val) {
    const el  = document.getElementById(id);
    const str = String(val).padStart(2, '0');
    if (el && el.textContent !== str) {
      el.textContent = str;
      el.style.transform = 'scale(1.1)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =============================================
  // 4. SCROLL REVEAL (IntersectionObserver)
  // =============================================
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children inside the grid
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 60 * (parseInt(entry.target.dataset.delay || 0)));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  // Round cards individual stagger
  const roundCards = document.querySelectorAll('.round-card');
  const roundObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const idx = Array.from(roundCards).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 150);
        roundObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  roundCards.forEach(c => roundObserver.observe(c));

  // =============================================
  // 5. ANIMATED COUNTER (About stats)
  // =============================================
  function animateCounter(el, target, duration = 1600) {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  }

  const counterEls = document.querySelectorAll('.stat-num[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  counterEls.forEach(el => counterObserver.observe(el));

  // =============================================
  // 6. SMOOTH SCROLL FOR ANCHOR LINKS
  // =============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // =============================================
  // 7. BUTTON CLICK RIPPLE EFFECT
  // =============================================
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        width:10px; height:10px;
        background: rgba(255,255,255,0.35);
        top:${y - 5}px; left:${x - 5}px;
        transform: scale(0); pointer-events:none;
        animation: ripple 0.6s ease-out forwards;
      `;
      if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = '@keyframes ripple { to { transform: scale(30); opacity: 0; } }';
        document.head.appendChild(style);
      }
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // =============================================
  // 8. TILT EFFECT ON CARDS (subtle)
  // =============================================
  document.querySelectorAll('.prize-card, .round-card, .criteria-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  // =============================================
  // 9. TIMELINE ITEM ANIMATE IN
  // =============================================
  const timelineItems = document.querySelectorAll('.timeline-item');
  const tlObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const idx = Array.from(timelineItems).indexOf(entry.target);
        entry.target.style.transition = `opacity 0.5s ease ${idx * 0.12}s, transform 0.5s ease ${idx * 0.12}s`;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        tlObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    tlObserver.observe(item);
  });

  // =============================================
  // INIT
  // =============================================
  window.addEventListener('load', () => {
    initCanvas();
  });

})();
