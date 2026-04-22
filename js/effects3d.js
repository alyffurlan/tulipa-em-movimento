// TulipaMouse – effects3d.js v2 — SEM alteracao de cursor
(function () {
  'use strict';

  // BARRA DE PROGRESSO DE SCROLL
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function() {
          var max = document.body.scrollHeight - window.innerHeight;
          bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
          ticking = false;
        });
      }
    }, { passive: true });
  }

  // CANVAS DE PARTICULAS
  function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);
    var ctx = canvas.getContext('2d');
    var W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    var isDark = function() { return document.documentElement.getAttribute('data-theme') === 'dark'; };
    var COUNT = window.innerWidth < 768 ? 25 : 55;

    function Particle() { this.reset(true); }
    Particle.prototype.reset = function(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.45 + 0.15);
      this.life = 0;
      this.maxLife = Math.random() * 280 + 180;
      this.hue = Math.random() * 25 + 342;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.35 + 0.1;
    };
    Particle.prototype.update = function() {
      this.x += this.vx; this.y += this.vy; this.life++;
      var p = this.life / this.maxLife;
      if (p < 0.15) this.alpha = (p / 0.15) * this.maxAlpha;
      else if (p > 0.75) this.alpha = ((1 - p) / 0.25) * this.maxAlpha;
      else this.alpha = this.maxAlpha;
      if (this.life >= this.maxLife || this.y < -10) this.reset(false);
    };
    Particle.prototype.draw = function() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      var sat = isDark() ? '80%' : '72%', lum = isDark() ? '62%' : '48%';
      ctx.fillStyle = 'hsl(' + this.hue + ',' + sat + ',' + lum + ')';
      ctx.fill();
      ctx.restore();
    };

    var particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(new Particle());

    function drawLines() {
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var d = Math.sqrt(dx*dx + dy*dy);
          if (d < 110) {
            ctx.save();
            ctx.globalAlpha = (1 - d/110) * (isDark() ? 0.1 : 0.07);
            ctx.strokeStyle = isDark() ? '#E8384F' : '#C8102E';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    (function loop() {
      ctx.clearRect(0, 0, W, H);
      drawLines();
      particles.forEach(function(p) { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    })();
  }

  // DECORACOES DO HERO (orb, dot grid, aneis)
  function initHeroDecorations() {
    var heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual) return;
    if (!heroVisual.querySelector('.hero-glow-orb')) {
      var orb = document.createElement('div');
      orb.className = 'hero-glow-orb';
      heroVisual.prepend(orb);
    }
    var hero = document.querySelector('.hero');
    if (hero && !hero.querySelector('.hero-dot-grid')) {
      var grid = document.createElement('div');
      grid.className = 'hero-dot-grid';
      hero.prepend(grid);
    }
    var tulipWrap = heroVisual.querySelector('.hero-3d-scene') || heroVisual.querySelector('.tulip-wrap');
    if (tulipWrap) {
      for (var i = 0; i < 3; i++) {
        var ring = document.createElement('div');
        ring.className = 'tulip-ring';
        tulipWrap.prepend(ring);
      }
    }
  }

  


  // PARALLAX DA TULIPA
  function initParallax() {
    var heroVis = document.querySelector('.hero-visual');
    if (!heroVis) return;
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function() {
          heroVis.style.transform = 'translateY(' + (window.scrollY * 0.1) + 'px)';
          ticking = false;
        });
      }
    }, { passive: true });
  }

  // HERO MOUSE TILT (tulipa + stats)
  function initHeroMouseTilt() {
    if (window.matchMedia('(hover:none)').matches) return;
    var hero = document.querySelector('.hero');
    var tulip = document.querySelector('.tulip-wrap');
    var stats = document.querySelector('.hero-stats');
    if (!hero || !tulip) return;
    hero.addEventListener('mousemove', function(e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width/2)  / (r.width/2);
      var dy = (e.clientY - r.top  - r.height/2) / (r.height/2);
      tulip.style.transform = 'perspective(900px) rotateX(' + (dy * -7) + 'deg) rotateY(' + (dx * 7) + 'deg)';
      if (stats) stats.style.transform = 'perspective(900px) rotateX(' + (dy * -3) + 'deg) rotateY(' + (dx * 3) + 'deg) translateX(' + (dx * -6) + 'px) translateY(' + (dy * -6) + 'px)';
    });
    hero.addEventListener('mouseleave', function() {
      tulip.style.transform = '';
      if (stats) stats.style.transform = '';
    });
  }

  // RIPPLE NOS BOTOES
  function initRipple() {
    document.querySelectorAll('.btn-primary, .btn-white, .btn-secondary').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var r = btn.getBoundingClientRect();
        var size = Math.max(r.width, r.height) * 2;
        var rpl = document.createElement('span');
        rpl.className = 'btn-ripple';
        rpl.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size/2) + 'px;top:' + (e.clientY - r.top - size/2) + 'px;';
        btn.appendChild(rpl);
        setTimeout(function() { rpl.remove(); }, 700);
      });
    });
  }

  // CONTADOR ANIMADO
  function initCounters() {
    document.querySelectorAll('.hero-stats .num').forEach(function(el) {
      var raw = el.textContent.trim();
      var match = raw.match(/^(\d+)(.*)/);
      if (!match) return;
      var target = +match[1], suffix = match[2], done = false;
      var obs = new IntersectionObserver(function(entries) {
        if (!entries[0].isIntersecting || done) return;
        done = true; obs.disconnect();
        var t0 = performance.now(), dur = 1600;
        (function tick(now) {
          var p = Math.min((now - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(e * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }

  // MICRO-ANIMACAO DAS PETALAS (apenas para SVG fallback)
  function initTulipPetals() {
    var paths = document.querySelectorAll('.tulip-wrap svg path');
    if (!paths.length) return; // imagem real ativa, sem svg visível
    paths.forEach(function(path, i) {
      if (i >= 2 && i <= 6) {
        path.style.transformOrigin = 'center bottom';
        path.style.animation = 'petal-sway ' + (2.8 + i * 0.25) + 's ease-in-out infinite ' + (i * 0.18) + 's';
      }
    });
    if (!document.getElementById('petal-style')) {
      var s = document.createElement('style');
      s.id = 'petal-style';
      s.textContent = '@keyframes petal-sway{0%,100%{transform:rotate(0deg) scale(1);}50%{transform:rotate(1.8deg) scale(1.02);}}';
      document.head.appendChild(s);
    }
  }

  function init() {
    initScrollProgress();
    initParticles();
    initHeroDecorations();
    initShineElements();
    initTilt();
    initParallax();
    initHeroMouseTilt();
    initRipple();
    initCounters();
    initTulipPetals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
