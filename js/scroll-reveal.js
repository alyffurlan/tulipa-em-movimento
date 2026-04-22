// =====================================================
// TulipaMouse – scroll-reveal.js
// IntersectionObserver que adiciona .visible aos
// elementos marcados com .sr, .sr-up, etc.
// =====================================================

(function () {
    const CLASSES = ['sr', 'sr-up', 'sr-down', 'sr-left', 'sr-right', 'sr-scale', 'sr-fade', 'section-tag'];
    const selector = CLASSES.map(c => '.' + c).join(', ');
  
    function initReveal() {
      const elements = document.querySelectorAll(selector);
      if (!elements.length) return;
  
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Não desobserva — permite re-animar se necessário
            // Para animar somente uma vez, descomentar a linha abaixo:
            // observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px'
      });
  
      elements.forEach(el => observer.observe(el));
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReveal);
    } else {
      initReveal();
    }
  })();
