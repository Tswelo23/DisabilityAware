// DisabilityAware — site.js (static)

document.addEventListener('DOMContentLoaded', function () {

  // ===== NAVBAR SCROLL =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ===== SCROLL ANIMATIONS =====
  const animatePending = document.querySelectorAll('.animate-pending');
  if ('IntersectionObserver' in window && animatePending.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = [...(entry.target.closest('.row, .container-fluid')
            ?.querySelectorAll('.animate-pending') ?? [])];
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 75}ms`;
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    animatePending.forEach(el => observer.observe(el));
  } else {
    animatePending.forEach(el => el.classList.add('animate-in'));
  }

  // ===== FONT SIZE =====
  const htmlEl = document.documentElement;
  let fontSize = parseFloat(localStorage.getItem('da_fontSize') || '16');
  htmlEl.style.fontSize = fontSize + 'px';

  document.getElementById('font-increase')?.addEventListener('click', () => {
    fontSize = Math.min(24, fontSize + 2);
    htmlEl.style.fontSize = fontSize + 'px';
    localStorage.setItem('da_fontSize', fontSize);
  });

  document.getElementById('font-decrease')?.addEventListener('click', () => {
    fontSize = Math.max(12, fontSize - 2);
    htmlEl.style.fontSize = fontSize + 'px';
    localStorage.setItem('da_fontSize', fontSize);
  });

  // ===== HIGH CONTRAST =====
  if (localStorage.getItem('da_highContrast') === 'true') {
    document.body.classList.add('high-contrast');
  }
  document.getElementById('high-contrast')?.addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('da_highContrast', document.body.classList.contains('high-contrast'));
  });

  // ===== READ ALOUD =====
  const readBtn  = document.getElementById('read-aloud');
  const stopBtn  = document.getElementById('stop-speech');

  if (readBtn && 'speechSynthesis' in window) {
    readBtn.addEventListener('click', () => {
      if (window.speechSynthesis.speaking) return;
      const main = document.getElementById('main-content');
      const text = main ? main.innerText : document.body.innerText;
      const chunks = text.match(/.{1,200}(\s|$)/g) || [];
      let idx = 0;
      const speakNext = () => {
        if (idx >= chunks.length) { cleanup(); return; }
        const u = new SpeechSynthesisUtterance(chunks[idx++]);
        u.rate = 0.95;
        u.onend = speakNext;
        window.speechSynthesis.speak(u);
      };
      const cleanup = () => {
        document.body.classList.remove('speaking-mode');
        readBtn.style.display = '';
        if (stopBtn) stopBtn.style.display = 'none';
      };
      document.body.classList.add('speaking-mode');
      readBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = '';
      speakNext();
    });
    stopBtn?.addEventListener('click', () => {
      window.speechSynthesis.cancel();
      document.body.classList.remove('speaking-mode');
      readBtn.style.display = '';
      if (stopBtn) stopBtn.style.display = 'none';
    });
  } else if (readBtn) {
    readBtn.style.display = 'none';
  }

  // ===== NEWSLETTER =====
  const subBtn     = document.getElementById('subscribeBtn');
  const emailInput = document.getElementById('newsletterEmail');
  if (subBtn && emailInput) {
    const doSubscribe = () => {
      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => emailInput.style.borderColor = '', 2000);
        return;
      }
      subBtn.textContent = 'Subscribed!';
      subBtn.disabled = true;
      emailInput.value = '';
      setTimeout(() => { subBtn.textContent = 'Subscribe'; subBtn.disabled = false; }, 3000);
    };
    subBtn.addEventListener('click', doSubscribe);
    emailInput.addEventListener('keypress', e => { if (e.key === 'Enter') doSubscribe(); });
  }

  // ===== TECH ASSESSMENT TOOL (services page) =====
  const assessBtn = document.getElementById('assessBtn');
  if (assessBtn) {
    assessBtn.addEventListener('click', () => {
      const area    = document.getElementById('need-area')?.value;
      const level   = document.getElementById('exp-level')?.value;
      const budget  = document.getElementById('budget')?.value;
      const result  = document.getElementById('assessResult');
      if (!area || area.startsWith('Select')) { return; }

      const recs = {
        'Vision/Reading':           ['NVDA Screen Reader (free)', 'ZoomText Magnifier', 'VoiceOver (Apple built-in)', 'Bookshare accessible library'],
        'Hearing/Communication':    ['Otter.ai live captions', 'Google Live Transcribe', 'Sorenson Video Relay', 'Roger Pen microphone'],
        'Mobility/Physical Access': ['Dragon NaturallySpeaking', 'Eye Gaze technology', 'Switch Access devices', 'Voice Control (iOS/macOS)'],
        'Learning/Cognitive':       ['Kurzweil 3000', 'Read&Write by Texthelp', 'MindMeister mind mapping', 'Claro PDF reader'],
        'Daily Living Activities':  ['Google Assistant / Siri', 'Smart home controls', 'Tap Tap See (object ID)', 'Aira visual interpreter'],
      };

      const list = (recs[area] || []).map(r => `<li>${r}</li>`).join('');
      result.style.display = '';
      result.innerHTML = `
        <div style="background:var(--teal-pale);border:1px solid rgba(29,122,110,0.2);border-radius:var(--r-md);padding:16px;">
          <h6 style="color:var(--teal);margin-bottom:10px;"><i class="fas fa-lightbulb me-2"></i>Recommended for ${area}</h6>
          <ul style="margin:0;padding-left:20px;font-size:0.875rem;color:var(--ink-light);">${list}</ul>
        </div>`;
    });
  }

});
