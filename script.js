// =========================================
// SELECTORS
// =========================================
const themeToggle = document.querySelector('#theme-toggle');
const menuBtn = document.querySelector('#menu-btn');
const navMenu = document.querySelector('#nav-menu');
const navLinks = document.querySelectorAll('.nav-link, .mobile-cta'); 
const body = document.body;


// =========================================
// 1. THEME
// =========================================
const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
    } else {
        body.removeAttribute('data-theme');
    }
};

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
    const isDark = body.hasAttribute('data-theme');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});


// =========================================
// 2. MOBILE MENU
// =========================================
const toggleMenu = () => {
    const isOpened = navMenu.classList.toggle('active');

    body.classList.toggle('menu-open', isOpened);
    body.style.overflow = isOpened ? 'hidden' : '';
};

menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = '';
    });
});

document.addEventListener('click', (e) => {
    if (
        navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = '';
    }
});


// =========================================
// 🔥 TRACK FUNCTION (FINAL - SAFE)
// =========================================
function trackLead(label, callback) {
    if (typeof gtag === 'function') {

        let called = false;

        const safeCallback = () => {
            if (called) return;
            called = true;
            if (callback) callback();
        };

        // GA4
        gtag('event', 'generate_lead', {
            event_category: 'WhatsApp',
            event_label: label
        });

        // Google Ads
        gtag('event', 'conversion', {
            'send_to': 'AW-18123408871/ua-uCLSFzKMcEOeL9cFD',
            'event_callback': safeCallback
        });

        // fallback
        setTimeout(safeCallback, 800);

    } else {
        if (callback) callback();
    }
}


// =========================================
// 3. CTA TRACKING (FINAL)
// =========================================
const ctaButtons = document.querySelectorAll('[data-cta]:not(button[type="submit"])');

ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const label = btn.getAttribute('data-cta') || 'CTA Click';
        const href = btn.getAttribute('href');

        trackLead(label, () => {
            if (href) {
                window.open(href, "_blank");
            }
        });
    });
});


// =========================================
// 4. FORM → WHATSAPP (FINAL)
// =========================================
const form = document.querySelector(".contact-form form");

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = this.querySelector("[name='name']")?.value.trim() || "";
        const email = this.querySelector("[name='email']")?.value.trim() || "";
        const field = this.querySelector("[name='field']")?.value.trim() || "";
        const message = this.querySelector("[name='message']")?.value.trim() || "";

        if (!name || !email) {
            alert("Please fill in your name and email.");
            return;
        }

        const btn = this.querySelector("button");
        const originalText = btn?.innerText;

        if (btn) {
            btn.innerText = "Opening WhatsApp...";
            btn.disabled = true;
        }

        const text = `Hi, I want to get my free university plan.

Name: ${name}
Email: ${email}
Field: ${field}
Message: ${message}`;

        const url = "https://wa.me/905331635689?text=" + encodeURIComponent(text);

        // 🔥 TRACK + OPEN
        trackLead("Form Submit", () => {
            window.open(url, "_blank");
        });

        setTimeout(() => {
            if (btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }, 2000);
    });
}