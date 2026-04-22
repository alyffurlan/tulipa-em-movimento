// =====================================================
// TulipaMouse – contato.js
// Validação e envio simulado do formulário de contato.
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  const nome     = document.getElementById('nome');
  const email    = document.getElementById('email');
  const assunto  = document.getElementById('assunto');
  const mensagem = document.getElementById('mensagem');
  const lgpd     = document.getElementById('lgpd');
  const charCount = document.getElementById('charCount');

  const btnSend    = document.getElementById('btnSend');
  const btnReset   = document.getElementById('btnReset');
  const formBody   = document.getElementById('formBody');
  const formSuccess = document.getElementById('formSuccess');

  // ── CONTADOR DE CARACTERES ──────────────────────────
  if (mensagem && charCount) {
    mensagem.addEventListener('input', () => {
      charCount.textContent = mensagem.value.length;
    });
  }

  // ── HELPERS ────────────────────────────────────────
  function showError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field)  field.classList.add('error');
    if (error)  error.classList.add('visible');
  }

  function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field)  field.classList.remove('error');
    if (error)  error.classList.remove('visible');
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  // Apenas letras (inclui acentuadas), espaços e hífen — sem números ou especiais
  function isValidName(v) {
    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]{2,}$/.test(v.trim());
  }

  // Bloqueia digitação de caracteres especiais/números no campo nome em tempo real
  if (nome) {
    nome.addEventListener('keypress', (e) => {
      const allowed = /[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]/;
      if (!allowed.test(e.key)) e.preventDefault();
    });
    // Também impede colar conteúdo inválido
    nome.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const cleaned = pasted.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-]/g, '');
      document.execCommand('insertText', false, cleaned);
    });
  }

  // Trava o textarea (sem redimensionamento)
  if (mensagem) {
    mensagem.style.resize = 'none';
  }

  // ── LIVE CLEAR ─────────────────────────────────────
  nome     && nome    .addEventListener('input',  () => clearError('nome',     'nomeError'));
  email    && email   .addEventListener('input',  () => clearError('email',    'emailError'));
  assunto  && assunto .addEventListener('change', () => clearError('assunto',  'assuntoError'));
  mensagem && mensagem.addEventListener('input',  () => clearError('mensagem', 'mensagemError'));
  lgpd     && lgpd    .addEventListener('change', () => clearError('lgpd',     'lgpdError'));

  // ── VALIDAR ────────────────────────────────────────
  function validate() {
    let valid = true;

    if (!isValidName(nome.value)) {
      showError('nome', 'nomeError'); valid = false;
    } else { clearError('nome', 'nomeError'); }

    if (!isValidEmail(email.value.trim())) {
      showError('email', 'emailError'); valid = false;
    } else { clearError('email', 'emailError'); }

    if (!assunto.value) {
      showError('assunto', 'assuntoError'); valid = false;
    } else { clearError('assunto', 'assuntoError'); }

    if (mensagem.value.trim().length < 20) {
      showError('mensagem', 'mensagemError'); valid = false;
    } else { clearError('mensagem', 'mensagemError'); }

    if (!lgpd.checked) {
      showError('lgpd', 'lgpdError'); valid = false;
    } else { clearError('lgpd', 'lgpdError'); }

    return valid;
  }

  // ── ENVIO ──────────────────────────────────────────
  btnSend && btnSend.addEventListener('click', () => {
    if (!validate()) return;

    // Simula envio com loading
    btnSend.disabled = true;
    btnSend.innerHTML = `
      <svg style="animation:spin 0.8s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
      Enviando…`;

    setTimeout(() => {
      formBody.classList.add('hidden');
      formBody.style.display = 'none';
      formSuccess.classList.remove('hidden');
    }, 1400);
  });

  // ── RESET ──────────────────────────────────────────
  btnReset && btnReset.addEventListener('click', () => {
    nome.value = '';
    email.value = '';
    assunto.value = '';
    mensagem.value = '';
    lgpd.checked = false;
    if (charCount) charCount.textContent = '0';

    ['nome','email','assunto','mensagem','lgpd'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
    ['nomeError','emailError','assuntoError','mensagemError','lgpdError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });

    formSuccess.classList.add('hidden');
    formBody.style.display = '';
    formBody.classList.remove('hidden');

    btnSend.disabled = false;
    btnSend.innerHTML = `
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><line x1="17" y1="3" x2="8" y2="12"/><polygon points="17,3 10,19 8,12 2,9"/></svg>
      Enviar Mensagem`;
  });
});

// Keyframe spin para o loader (injeta apenas uma vez)
if (!document.getElementById('contato-spin-style')) {
  const s = document.createElement('style');
  s.id = 'contato-spin-style';
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}