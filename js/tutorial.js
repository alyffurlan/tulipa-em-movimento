// =====================================================
// TulipaMouse – tutorial.js
// FAQ accordion
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = answer.classList.contains('open');

      // Fecha todos
      document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
      document.querySelectorAll('.faq-q').forEach(b => b.classList.remove('open'));

      // Abre o clicado (toggle)
      if (!isOpen) {
        answer.classList.add('open');
        btn.classList.add('open');
      }
    });
  });
});
