/* ============================================
   ПРО-БЛАНК — Shared JavaScript
   ============================================ */

// ---- HEADER SCROLL ----
(function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---- MOBILE MENU ----
(function initMobileMenu() {
  const burger = document.querySelector('.header__burger');
  const menu   = document.querySelector('.mobile-menu');
  const close  = document.querySelector('.mobile-menu__close');
  if (!burger || !menu) return;

  const open = () => {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    menu.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Toggle: открыть если закрыто, закрыть если открыто
  burger.addEventListener('click', () => {
    if (menu.classList.contains('open')) closeMenu();
    else open();
  });
  if (close) close.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();

// ---- CUSTOM CURSOR ----
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(cursor);
  document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;
  let scaleTarget = 1, scaleR = 1;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    // compositor-only: translate from 0,0 offset by half element size (4px for 8px dot)
    cursor.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  }, { passive: true });

  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    scaleR += (scaleTarget - scaleR) * 0.12;
    // compositor-only: translate from 0,0 offset by half of 36px = 18px, plus lerped scale
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px) scale(${scaleR.toFixed(3)})`;
    requestAnimationFrame(animateRing);
  })();

  // Event delegation: one listener on document instead of N per-element listeners
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .card, .service-card, .portfolio-card, .guarantee-item')) {
      ring.classList.add('expand'); scaleTarget = 1.667;
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .card, .service-card, .portfolio-card, .guarantee-item')) {
      ring.classList.remove('expand'); scaleTarget = 1;
    }
  });
})();

// ---- BACK TO TOP ----
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Наверх');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ---- SCROLL REVEAL ----
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ---- COUNTER ANIMATION ----
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const duration = 1800;
  const startTime = performance.now();

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = target * ease;
    el.textContent = prefix + (decimals ? current.toFixed(decimals) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + (decimals ? target.toFixed(decimals) : target) + suffix;
  };
  requestAnimationFrame(step);
}

(function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        animateCounter(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
})();

// ---- ACTIVE NAV LINK ----
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header__nav a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ---- TELEGRAM CONFIG ----
// 👇 Вставьте сюда свои данные после создания бота
const TG_TOKEN   = 'ВСТАВИТЬ_ТОКЕН_БОТА';   // от @BotFather
const TG_CHAT_ID = 'ВСТАВИТЬ_CHAT_ID';       // ваш chat_id или id группы

async function sendToTelegram(fields) {
  // Собираем строки только из заполненных полей
  const lines = Object.entries(fields)
    .filter(([, v]) => v && v.trim() !== '')
    .map(([k, v]) => {
      const labels = {
        source:      '📍 Источник',
        brand:       '👤 Бренд',
        name:        '👤 Имя',
        quantity:    '📦 Тираж',
        product:     '👕 Продукт',
        deadline:    '⏰ Срок',
        service:     '🧵 Услуга',
        description: '📝 Описание',
        email:       '📧 Email',
        phone:       '📞 Контакт',
      };
      return `${labels[k] || k}: <b>${v}</b>`;
    })
    .join('\n');

  const text = `🆕 <b>Новая заявка — ПРО-БЛАНК</b>\n\n${lines}\n\n🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---- FORM SUBMIT ----
(function initForms() {
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // ---- Validation ----
      const phoneEl  = form.querySelector('[name="phone"]');
      const consentEl = form.querySelector('#consentCheck');

      // Consent required
      if (consentEl && !consentEl.checked) return;

      // Phone / Telegram login validation
      if (phoneEl) {
        const v = phoneEl.value.trim();
        const errEl = form.querySelector('.form-error[data-for="phone"]');
        const isPhone = /^\+7[\d\s\-\(\)]{9,}$/.test(v) && v.replace(/\D/g, '').length >= 11;
        const isTg    = /^@[a-zA-Z0-9_]{4,}$/.test(v);
        if (!isPhone && !isTg) {
          if (errEl) {
            errEl.textContent = 'Введите номер +7… или @телеграм-логин';
            errEl.classList.add('visible');
          }
          phoneEl.focus();
          return;
        }
        if (errEl) errEl.classList.remove('visible');
      }
      // ---- /Validation ----

      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;

      const originalText = btn.textContent;
      btn.textContent = 'Отправляем...';
      btn.disabled = true;

      // Собираем поля: обычные input/textarea + выбранный radio
      const fields = {};
      form.querySelectorAll('[name]').forEach(el => {
        if (!el.name) return;
        if (el.type === 'radio') {
          if (el.checked) fields[el.name] = el.value; // только выбранный
        } else {
          fields[el.name] = el.value;
        }
      });

      const ok = await sendToTelegram(fields);

      if (ok) {
        btn.textContent = '✓ Заявка отправлена!';
        btn.style.background = 'var(--accent)';
        btn.style.color = 'var(--dark)';
        form.reset();
        // Показать success-блок если есть
        form.querySelector('.form-success')?.classList.add('visible');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
          btn.style.color = '';
        }, 4000);
      } else {
        // Если не настроен токен — симуляция (для тестов)
        const isNotConfigured = TG_TOKEN === 'ВСТАВИТЬ_ТОКЕН_БОТА';
        btn.textContent = isNotConfigured ? '✓ (тест) Заявка принята' : '⚠ Ошибка — попробуйте ещё раз';
        btn.style.background = isNotConfigured ? 'var(--accent)' : '#ef4444';
        btn.style.color = isNotConfigured ? 'var(--dark)' : '#fff';
        if (isNotConfigured) form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
          btn.style.color = '';
        }, 3500);
      }
    });
  });
})();

// ---- PAGE TRANSITION ----
(function initPageTransition() {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);

  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    a.addEventListener('click', function(e) {
      e.preventDefault();
      overlay.style.transition = 'transform 0.45s cubic-bezier(0.77,0,0.175,1)';
      overlay.style.transform = 'translateY(0)';
      setTimeout(() => { window.location.href = href; }, 450);
    });
  });

  window.addEventListener('pageshow', () => {
    overlay.style.transition = 'none';
    overlay.style.transform = 'translateY(-100%)';
    requestAnimationFrame(() => {
      overlay.style.transition = 'transform 0.5s cubic-bezier(0.77,0,0.175,1)';
    });
  });
})();

// ---- TICKER DUPLICATE ----
(function initTicker() {
  document.querySelectorAll('.ticker-track').forEach(track => {
    const clone = track.innerHTML;
    track.innerHTML += clone;
  });
})();
