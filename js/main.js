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
      // Use whichever axis the wheel/trackpad moved more
      var delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      var maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 0) return; // nothing to scroll

      var atStart = scroller.scrollLeft <= 0;
      var atEnd = scroller.scrollLeft >= maxScroll - 1;

      // At an edge and scrolling further out — let the page scroll normally
      if ((atStart && delta < 0) || (atEnd && delta > 0)) return;

      e.preventDefault();
      // Amplify line-mode deltas (deltaMode 1) so a wheel notch moves a meaningful distance
      var step = e.deltaMode === 1 ? delta * 30 : delta;
      scroller.scrollLeft += step;
    }, { passive: false });

    // Prev/next arrow buttons — scroll by roughly one card width
    var prevBtn = document.querySelector('.scroller-prev');
    var nextBtn = document.querySelector('.scroller-next');

    function cardStep() {
      var first = scroller.querySelector('.scroll-photo');
      var gap = 16; // matches the 1rem flex gap
      return first ? first.getBoundingClientRect().width + gap : scroller.clientWidth * 0.8;
    }

    function updateArrows() {
      if (!prevBtn || !nextBtn) return;
      var maxScroll = scroller.scrollWidth - scroller.clientWidth;
      // Hide arrows entirely when there's nothing to scroll
      var noScroll = maxScroll <= 1;
      prevBtn.hidden = noScroll || scroller.scrollLeft <= 0;
      nextBtn.hidden = noScroll || scroller.scrollLeft >= maxScroll - 1;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      scroller.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      scroller.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });

    scroller.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  // Lightbox — click a scroller photo to view it full-size
  var lightbox = document.getElementById('lightbox');
  var scrollerPhotos = document.querySelectorAll('.scroll-photo img');
  if (lightbox && scrollerPhotos.length) {
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxClose = document.getElementById('lightboxClose');
    var lastFocused = null;

    function openLightbox(img) {
      lastFocused = document.activeElement;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.src = '';
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    scrollerPhotos.forEach(function (img) {
      img.addEventListener('click', function () { openLightbox(img); });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    // Click anywhere on the backdrop (but not the image itself) closes it
    lightbox.addEventListener('click', function (e) {
      if (e.target !== lightboxImg) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  // Links that scroll to the contact form and prefill the subject line
  var subjectField = document.getElementById('cf-subject');
  var messageField = document.getElementById('cf-message');
  document.querySelectorAll('[data-prefill-subject]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (subjectField) subjectField.value = link.getAttribute('data-prefill-subject');
      // Move focus to the message box after the smooth scroll settles
      if (messageField) setTimeout(function () { messageField.focus(); }, 600);
    });
  });

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
