/* StudyFly V2: accessible navigation and native WhatsApp lead flows.
 * Keep existing GA4/Ads event names, labels and conversion action identifiers.
 */
(() => {
  'use strict';
  if (window.StudyFly?.initialized) return;

  const language = document.documentElement.lang;
  const labels = {
    en: { open: 'Open menu', close: 'Close menu', invalid: 'Please enter your name.', ready: 'Continue on WhatsApp to send your message.', link: 'Open WhatsApp', draft: "Hello, I would like guidance on private universities in Turkey and the application process.", fields: { name: "Name", email: "Email", field: "Field of study", message: "Message" } },
    ar: { open: 'افتح القائمة', close: 'أغلق القائمة', invalid: 'يرجى إدخال اسمك.', ready: 'أكمل عبر واتساب لإرسال رسالتك.', link: 'افتح واتساب', draft: "مرحبًا، أود الحصول على إرشاد بشأن الجامعات الخاصة في تركيا وإجراءات التقديم.", fields: { name: "الاسم", email: "البريد الإلكتروني", field: "التخصص الدراسي", message: "الرسالة" } },
    ru: { open: 'Открыть меню', close: 'Закрыть меню', invalid: 'Пожалуйста, укажите ваше имя.', ready: 'Продолжите в WhatsApp, чтобы отправить сообщение.', link: 'Открыть WhatsApp', draft: "Здравствуйте! Мне нужна консультация по выбору частного университета в Турции и подаче заявки.", fields: { name: "Имя", email: "Электронная почта", field: "Специальность", message: "Сообщение" } }
  }[language] || null;
  const text = labels || { open: 'Open menu', close: 'Close menu' };
  const body = document.body;
  const menuButton = document.querySelector('#menu-btn');
  const menu = document.querySelector('#nav-menu');
  const wide = window.matchMedia('(min-width: 1280px)');
  const background = [...document.querySelectorAll('main, footer, .whatsapp-sticky')];
  let menuOpen = false;

  // Keep navigation safe when these optional controls are absent.
  const setMenu = (open, returnFocus = false) => {
    if (!menu || !menuButton) return;
    menuOpen = Boolean(open) && !wide.matches;
    menu.classList.toggle('active', menuOpen);
    menu.inert = !menuOpen && !wide.matches;
    body.classList.toggle('menu-open', menuOpen);
    menuButton.setAttribute('aria-expanded', String(menuOpen));
    menuButton.setAttribute('aria-label', menuOpen ? text.close : text.open);
    for (const element of background) element.inert = menuOpen;
    if (menuOpen) menu.querySelector('a')?.focus({ preventScroll: true });
    else if (returnFocus) menuButton.focus();
  };
  if (menu && menuButton) {
    setMenu(false);
    menuButton.addEventListener('click', () => setMenu(!menuOpen));
    wide.addEventListener('change', () => setMenu(false));
    document.addEventListener('click', event => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      const outside = event.target instanceof Element && (event.target.closest('.menu-backdrop') || !event.target.closest('.main-header'));
      if (menuOpen && outside) setMenu(false, true);
      else if (menuOpen && link?.closest('.main-header')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (!menuOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
      if (event.key !== 'Tab') return;
      const header = document.querySelector('.main-header');
      const items = [...header.querySelectorAll('a, button:not([disabled])')].filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden' && !element.closest('[inert]'));
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }



  // Clean section routes reuse the current localized homepage; no content fetches.
  const sectionIDs = new Set(['why-us', 'how-it-works', 'services', 'results', 'faq', 'contact']);
  const homePath = language === 'en' ? '/' : `/${language}/`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollRequest = 0;
  const routeForPath = pathname => {
    const section = pathname.match(/^\/(?:(ar|ru)\/)?(why-us|how-it-works|services|results|faq|contact)\/?$/);
    if (section) return { language: section[1] || 'en', id: section[2], path: `${section[1] ? `/${section[1]}` : ''}/${section[2]}/` };
    if (pathname === homePath || pathname === homePath.slice(0, -1) || pathname === `${homePath}index.html`) return { language, id: 'home', path: homePath };
    return null;
  };
  const focusSection = target => {
    const temporary = !target.hasAttribute('tabindex');
    if (temporary) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  };
  const scrollToSection = (id, behavior, focus = false) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (focus) focusSection(target);
    const headerHeight = document.querySelector('.main-header')?.getBoundingClientRect().height || 0;
    const top = id === 'home' || id === 'main' ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 20);
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : behavior });
  };
  const queueSectionScroll = (id, behavior = 'instant', focus = false) => {
    const request = ++scrollRequest;
    (document.fonts?.ready || Promise.resolve()).then(() => {
      window.requestAnimationFrame(() => { if (request === scrollRequest) scrollToSection(id, behavior, focus); });
    });
  };
  if (body.classList.contains('admissions-page')) {
    // History owns section position on Back/Forward instead of a fragment URL.
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    let initial = routeForPath(window.location.pathname);
    const legacy = window.location.hash.slice(1);
    if (initial && (sectionIDs.has(legacy) || legacy === 'home')) {
      const path = legacy === 'home' ? homePath : `${homePath}${legacy}/`;
      window.history.replaceState(window.history.state, '', path + window.location.search);
      initial = routeForPath(path);
    } else if (initial?.language === language && initial.path !== window.location.pathname) {
      window.history.replaceState(window.history.state, '', initial.path + window.location.search + window.location.hash);
    }
    if (initial?.language === language && initial.id !== 'home') queueSectionScroll(initial.id);
    window.addEventListener('popstate', () => {
      setMenu(false);
      const route = routeForPath(window.location.pathname);
      if (route?.language === language) queueSectionScroll(route.id);
    });
    document.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      if (link.classList.contains('skip-link')) {
        event.preventDefault();
        setMenu(false);
        queueSectionScroll('main', 'instant', true);
        return;
      }
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      const route = routeForPath(destination.pathname);
      if (!route || route.language !== language || destination.hash) return;
      event.preventDefault();
      setMenu(false);
      const path = route.path + (destination.search || window.location.search);
      if (path !== window.location.pathname + window.location.search) window.history.pushState(window.history.state, '', path);
      queueSectionScroll(route.id, 'smooth', true);
    });
  }
  // End clean section routes.

  // FAQ decision support (home pages only).
  // Without JavaScript, every original answer remains visible in the HTML.
  const faqButtons = [...document.querySelectorAll('#faq.content-faq .content-faq-trigger')];
  for (const [index, question] of faqButtons.entries()) {
    const panel = document.getElementById(question.getAttribute('aria-controls'));
    if (!panel) continue;
    const expanded = index === 0;
    question.disabled = false;
    question.setAttribute('aria-expanded', String(expanded));
    panel.hidden = !expanded;
    question.addEventListener('click', () => {
      const open = question.getAttribute('aria-expanded') !== 'true';
      question.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
    question.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % faqButtons.length;
      else if (event.key === 'ArrowUp') next = (index - 1 + faqButtons.length) % faqButtons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = faqButtons.length - 1;
      else return;
      event.preventDefault();
      faqButtons[next].focus();
    });
  }
  // End FAQ decision support.

  // This records WhatsApp intent, not proof that a message was sent by the visitor.
  function trackLead(label, callback) {
    let finished = false;
    let timer;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      callback?.();
    };
    if (typeof window.gtag !== 'function') { finish(); return; }
    try {
      window.gtag('event', 'generate_lead', {
        event_category: 'WhatsApp',
        event_label: label
      });
      if (callback) timer = window.setTimeout(finish, 800);
      window.gtag('event', 'conversion', {
        send_to: 'AW-18123408871/ua-uCLSFzKMcEOeL9cFD',
        event_callback: finish
      });
    } catch { finish(); }
  }

  // Native new-tab/modifier/keyboard behavior retains browser user activation.
  // Do not preventDefault or open a window from a delayed analytics callback.
  const trackLink = event => {
    if (event.defaultPrevented || (event.type === 'auxclick' && event.button !== 1)) return;
    const link = event.target instanceof Element ? event.target.closest('a[data-cta]') : null;
    if (!link) return;
    const destination = new URL(link.href, location.href);
    if (destination.hostname !== 'wa.me') return;
    trackLead(link.dataset.cta || 'CTA Click');
  };
  document.addEventListener('click', trackLink);
  document.addEventListener('auxclick', trackLink);

  const form = document.querySelector('[data-whatsapp-form]');
  if (form && labels) {
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    const nameInput = form.elements.namedItem('name');
    button.disabled = false;
    nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = nameInput.value.trim();
      nameInput.setCustomValidity(name ? '' : labels.invalid);
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(['email', 'field', 'message'].map(key => [key, form.elements.namedItem(key).value.trim()]));
      const message = `${labels.draft}\n\n${labels.fields.name}: ${name}\n${labels.fields.email}: ${values.email}\n${labels.fields.field}: ${values.field}\n${labels.fields.message}: ${values.message}`;
      const url = 'https://wa.me/905331635689?text=' + encodeURIComponent(message);
      // Synchronous open is deliberate: SDK availability must not gate the lead flow.
      window.open(url, '_blank', 'noopener,noreferrer');
      trackLead('Form Submit');
      status.replaceChildren(document.createTextNode(labels.ready + ' '));
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.textContent = labels.link;
      status.append(fallback);
      // Keep the draft: opening WhatsApp is not successful server-side delivery.
    });
  }

  window.trackLead = trackLead;
  window.StudyFly = Object.freeze({ initialized: true, trackLead, setMenu });
})();