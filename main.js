/* ============================================
   Shanshan Qiu — Personal Website
   Shared interactions: mobile nav, footer year,
   copy-to-clipboard, scroll reveal
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Auto-close after clicking a nav link (mobile)
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Copy email to clipboard ---------- */
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email') || copyBtn.dataset.email || '';
      var toast = document.getElementById('toast');
      var show = function () { if (toast) { toast.classList.add('show'); setTimeout(function () { toast.classList.remove('show'); }, 1800); } };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(show).catch(function () { fallbackCopy(email); show(); });
      } else {
        fallbackCopy(email);
        show();
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- Toast helper (reused by contact form) ---------- */
  function showToast(message, duration) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, duration || 2200);
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Contact form → Supabase ---------- */
  var SUPABASE_URL = 'https://eejwbfodninzaqmdqern.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_qU5qSnr3iBCpkBbtVsVsJA_52WvvzhC';

  var form = document.getElementById('contactForm');
  if (form && window.supabase && typeof window.supabase.createClient === 'function') {
    var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var name = document.getElementById('contactName').value.trim();
      var email = document.getElementById('contactEmail').value.trim();
      var message = document.getElementById('contactMessage').value.trim();

      // Basic client-side validation
      if (!name || !email || !message) {
        showToast('Please fill in all fields.', 2800);
        return;
      }
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        showToast('Please enter a valid email.', 2800);
        return;
      }

      // Disable button during submit
      var btn = form.querySelector('button[type="submit"]');
      var originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        var { data, error } = await supabaseClient
          .from('contacts')
          .insert([{ name: name, email: email, message: message }]);

        if (error) throw error;

        showToast('Message sent — thank you!', 2800);
        form.reset();
      } catch (err) {
        console.error('Supabase insert error:', err);
        showToast('Oops — failed to send. Please email me directly.', 3600);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }
    });
  } else if (form) {
    console.warn('Supabase SDK not loaded — contact form submit will be blocked.');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('Contact form temporarily unavailable.', 2800);
    });
  }

});
