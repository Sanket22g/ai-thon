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
  // 2. NAVBAR SCROLL EFFECT & PARALLAX
  // =============================================
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);

    // Parallax update
    requestAnimationFrame(() => {
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax'));
        el.style.transform = `translateY(${scrollY * speed}px)`;
        
        // Prevent overlap by fading out the hero wrapper as it scrolls down
        if (el.classList.contains('hero-parallax-wrapper')) {
          const opacity = Math.max(1 - (scrollY / 350), 0);
          el.style.opacity = opacity;
          el.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
        }
      });
    });
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
  // 8. HERO 3D TILT EFFECT
  // =============================================
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    document.addEventListener('mousemove', (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 40;
      const y = (window.innerHeight / 2 - e.clientY) / 40;
      // Slightly rotate the hero content based on mouse position
      heroContent.style.transform = `perspective(1000px) rotateY(${-x}deg) rotateX(${y}deg)`;
    });
  }

  // Magnetic Button Logic
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.classList.add('magnetic-btn');
    btn.addEventListener('mousemove', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left) - rect.width / 2;
      const y = (e.clientY - rect.top) - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });

  // =============================================
  // 8. ADVANCED TILT EFFECT ON CARDS (With Glare)
  // =============================================
  document.querySelectorAll('.prize-card, .round-card, .criteria-card').forEach(card => {
    // Inject glare element dynamically
    const glare = document.createElement('div');
    glare.className = 'glare';
    card.appendChild(glare);

    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      // Card tilt
      card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-8px) scale(1.02)`;

      // Glare position
      glare.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(255,255,255,0.15), transparent 60%)`;
      glare.style.opacity = '1';

      // Inner elements pop-out
      const icons = card.querySelectorAll('.round-icon, .prize-medal, .prize-crown, .criteria-icon');
      icons.forEach(icon => {
        icon.style.transform = 'translateZ(40px)';
      });
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      glare.style.opacity = '0';
      
      const icons = card.querySelectorAll('.round-icon, .prize-medal, .prize-crown, .criteria-icon');
      icons.forEach(icon => {
        icon.style.transform = '';
      });
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
  // 9. CUTE AI INTERACTION (Eye Tracking)
  // =============================================
  const aiOrb = document.querySelector('.ai-orb');
  const aiEyes = document.querySelectorAll('.ai-eye');
  
  if (aiOrb && aiEyes.length) {
    document.addEventListener('mousemove', (e) => {
      const rect = aiOrb.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      
      const angle = Math.atan2(dy, dx);
      // Max movement of 4px
      const dist = Math.min(Math.sqrt(dx*dx + dy*dy) / 40, 4); 
      
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      
      aiEyes.forEach(eye => {
        eye.style.setProperty('--tx', `${tx}px`);
        eye.style.setProperty('--ty', `${ty}px`);
      });
    });
    
    aiOrb.addEventListener('click', () => {
      // Little jump on click
      aiOrb.style.transform = 'scale(1.1) translateY(-15px)';
      setTimeout(() => {
        aiOrb.style.transform = '';
      }, 200);
      
      // Scroll to register
      const regSection = document.getElementById('register');
      if (regSection) {
        regSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSetDWnpq4J89qaga7Q79-ENruqy23wexcN2jtTQ0kFAUP8_FQ/viewform', '_blank');
      }
    });

    // Rotate AI messages every 4 seconds (starts after bubble appears)
    const aiMessages = document.querySelectorAll('.ai-msg');
    let currentMsg = 0;
    if (aiMessages.length > 1) {
      setTimeout(() => {
        setInterval(() => {
          // Hide current
          aiMessages[currentMsg].classList.remove('ai-msg-active');
          // Advance
          currentMsg = (currentMsg + 1) % aiMessages.length;
          const next = aiMessages[currentMsg];
          // Force animation replay by resetting
          next.style.animation = 'none';
          next.classList.add('ai-msg-active');
          // Trigger reflow then re-enable animation
          void next.offsetWidth;
          next.style.animation = '';

          // 🎉 Fire celebration confetti on congratulations message (index 2)
          if (currentMsg === 2) {
            fireConfetti();
          }
        }, 4000);
      }, 2200); // wait for bubble to finish appearing
    }
  }

  // =============================================
  // 10. CELEBRATION CONFETTI
  // =============================================
  function fireConfetti() {
    const cv = document.getElementById('celebration-canvas');
    if (!cv) return;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    cv.classList.add('active');
    const ctx2 = cv.getContext('2d');
    const colors = ['#00d4ff', '#8b5cf6', '#fbbf24', '#ec4899', '#22c55e', '#ff6b35', '#ffffff'];
    const pieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height - cv.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      alpha: 1,
    }));

    const startTime = performance.now();
    const DURATION = 4000;

    function drawConfetti(ts) {
      const elapsed = ts - startTime;
      const progress = elapsed / DURATION;
      ctx2.clearRect(0, 0, cv.width, cv.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.05; // gravity
        p.alpha = Math.max(0, 1 - Math.max(0, progress - 0.6) / 0.4);

        ctx2.save();
        ctx2.globalAlpha = p.alpha;
        ctx2.translate(p.x, p.y);
        ctx2.rotate(p.angle);
        ctx2.fillStyle = p.color;
        ctx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx2.restore();
      });

      if (elapsed < DURATION) {
        requestAnimationFrame(drawConfetti);
      } else {
        cv.classList.remove('active');
        ctx2.clearRect(0, 0, cv.width, cv.height);
      }
    }
    requestAnimationFrame(drawConfetti);
  }

  // =============================================
  // INIT & PRELOADER
  // =============================================
  window.addEventListener('load', () => {
    // Hide preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
      // Small artificial delay for visual effect
      setTimeout(() => {
        preloader.classList.add('hidden');
      }, 600);
    }
    
    initCanvas();
  });

})();
