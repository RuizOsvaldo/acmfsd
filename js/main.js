(function () {
  // Hamburger toggle
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Current year in footer
  document.getElementById('footer-copy').textContent =
    '© ' + new Date().getFullYear() + ' Austin C. Machitar Foundation. All rights reserved.';

  // Scroll reveal — fires once per element, then stops observing
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  }

  // Horizontal photo scroller — let the vertical mouse wheel scroll it sideways
  var scroller = document.querySelector('.photo-scroller');
  if (scroller) {
    scroller.addEventListener('wheel', function (e) {
      // Trackpads already send horizontal deltas; only remap vertical-only wheels
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      var atStart = scroller.scrollLeft <= 0;
      var atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1;

      // At an edge and scrolling further out — let the page scroll normally
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;

      e.preventDefault();
      scroller.scrollLeft += e.deltaY;
    }, { passive: false });
  }

  // Contact form — submit to Formspree via fetch, no page reload
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('cf-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Guard against an unconfigured endpoint
      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        status.textContent = 'Form not configured yet — please email acmf7989@gmail.com directly.';
        status.className = 'form-status is-error';
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      status.textContent = '';
      status.className = 'form-status';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          form.reset();
          status.textContent = 'Thank you — your message has been sent. We\'ll be in touch soon.';
          status.className = 'form-status is-success';
        } else {
          return response.json().then(function (data) {
            var msg = (data && data.errors)
              ? data.errors.map(function (er) { return er.message; }).join(', ')
              : 'Something went wrong. Please email acmf7989@gmail.com instead.';
            status.textContent = msg;
            status.className = 'form-status is-error';
          });
        }
      }).catch(function () {
        status.textContent = 'Network error. Please email acmf7989@gmail.com instead.';
        status.className = 'form-status is-error';
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = original;
      });
    });
  }
})();
