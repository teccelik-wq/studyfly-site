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

  // Residence has no drawer: keep every handler safe when these elements are absent.
  const setMenu = (open, returnFocus = false) => {
    if (!menu || !menuButton) return;
    menuOpen = Boolean(open) && !wide.matches;
    menu.classList.toggle('active', menuOpen);
    menu.inert = !menuOpen && !wide.matches;
    body.classList.toggle('menu-open', menuOpen);
    menuButton.setAttribute('aria-expanded', String(menuOpen));
    menuButton.setAttribute('aria-label', menuOpen ? text.close : text.open);
    for (const element of background) element.inert = menuOpen;
    if (menuOpen) menu.querySelector('a')?.focus();
    else if (returnFocus) menuButton.focus();
  };
  if (menu && menuButton) {
    setMenu(false);
    menuButton.addEventListener('click', () => setMenu(!menuOpen));
    wide.addEventListener('change', () => setMenu(false));
    document.addEventListener('click', event => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (menuOpen && (link?.closest('.main-header') || !(event.target instanceof Element && event.target.closest('.main-header')))) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (!menuOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
      if (event.key !== 'Tab') return;
      const header = document.querySelector('.main-header');
      const items = [...header.querySelectorAll('a, button:not([disabled])')].filter(element => element.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }


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