(function () {
  // Hamburger toggle
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
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
  }

  // Current year in footer
  var footerCopy = document.getElementById('footer-copy');
  if (footerCopy) {
    footerCopy.textContent =
      '© ' + new Date().getFullYear() + ' Austin C. Machitar Foundation. All rights reserved.';
  }

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
      // Dim/disable arrows at the edges (and both if nothing to scroll)
      var noScroll = maxScroll <= 1;
      prevBtn.disabled = noScroll || scroller.scrollLeft <= 0;
      nextBtn.disabled = noScroll || scroller.scrollLeft >= maxScroll - 1;
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

  // Flyer slideshow — arrows/dots page through the flyer sheets. Each slide is
  // a link to its PDF, so clicking (rather than dragging) opens it in a new tab.
  var flyerSlider = document.querySelector('.flyer-slider');
  if (flyerSlider) {
    var slides = Array.prototype.slice.call(flyerSlider.querySelectorAll('.flyer-slide'));
    var flyerPrev = flyerSlider.querySelector('.flyer-prev');
    var flyerNext = flyerSlider.querySelector('.flyer-next');
    var dotsWrap = flyerSlider.querySelector('.flyer-dots');
    var current = 0;

    // Build one dot per slide
    var dots = slides.map(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'flyer-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Flyer page ' + (i + 1));
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', function () { showSlide(i); });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function showSlide(i) {
      // Wrap around at either end
      current = (i + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        var active = idx === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    if (flyerPrev) flyerPrev.addEventListener('click', function () { showSlide(current - 1); });
    if (flyerNext) flyerNext.addEventListener('click', function () { showSlide(current + 1); });

    // Left/right arrow keys page through when the slider has focus within
    flyerSlider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { showSlide(current - 1); }
      else if (e.key === 'ArrowRight') { showSlide(current + 1); }
    });
  }

  // Fundraiser tabs (fundraisers.html) — one .tab button per .tabpanel, paired
  // by a matching data-tab slug. Adding a fundraiser is purely a markup change:
  // add a button + panel with a new slug and this wires itself up.
  var tablist = document.getElementById('fundraiserTabs');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.tabpanel'));

    // Zeffy forms are mounted the first time their tab is opened, so hidden
    // forms cost nothing on load. The embed script scans for [data-zeffy-embed]
    // on its own load and exposes window.Zeffy.embed.init() for anything added
    // afterwards — calling it again only touches uninitialized embeds.
    function mountZeffyIn(panel) {
      var holders = panel.querySelectorAll('[data-zeffy-form-url]:not([data-zeffy-embed])');
      if (!holders.length) return;
      holders.forEach(function (holder) {
        holder.setAttribute('data-form-url', holder.getAttribute('data-zeffy-form-url'));
        holder.setAttribute('data-zeffy-embed', '');
      });
      if (window.Zeffy && window.Zeffy.embed) window.Zeffy.embed.init();
    }

    function panelFor(slug) {
      for (var i = 0; i < panels.length; i++) {
        if (panels[i].getAttribute('data-tab') === slug) return panels[i];
      }
      return null;
    }

    function selectTab(slug, opts) {
      opts = opts || {};
      var matched = false;
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-tab') === slug;
        if (active) matched = true;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
        if (active && opts.focus) tab.focus();
      });
      if (!matched) return false;

      panels.forEach(function (panel) {
        var active = panel.getAttribute('data-tab') === slug;
        panel.hidden = !active;
        if (active) mountZeffyIn(panel);
      });

      if (opts.updateHash && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + slug);
      }
      return true;
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        selectTab(tab.getAttribute('data-tab'), { updateHash: true });
      });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        selectTab(next.getAttribute('data-tab'), { updateHash: true, focus: true });
      });
    });

    // Deep links (fundraisers.html#tennis) open straight to that fundraiser.
    var initial = window.location.hash.replace('#', '');
    if (!initial || !panelFor(initial)) {
      initial = tabs.length ? tabs[0].getAttribute('data-tab') : '';
    }
    if (initial) selectTab(initial);

    // Back/forward between deep links, and in-page links to a fundraiser.
    window.addEventListener('hashchange', function () {
      var slug = window.location.hash.replace('#', '');
      if (panelFor(slug)) selectTab(slug);
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

  // Contact form — submit to FormSubmit (AJAX endpoint) via fetch, no page reload
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('cf-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate the email format: require name@domain.tld with a 2+ char TLD.
      // Note: this catches malformed addresses (e.g. "foo@bar") but cannot
      // confirm a mailbox actually exists (e.g. "fake@fake.com" looks valid).
      var emailField = form.querySelector('input[name="email"]');
      var emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
      if (emailField && !emailRe.test(emailField.value.trim())) {
        status.textContent = 'Please enter a valid email address, e.g. name@example.com.';
        status.className = 'form-status is-error';
        emailField.focus();
        return;
      }

      // Default the subject if the user left it blank
      var subjectField = form.querySelector('input[name="subject"]');
      if (subjectField && !subjectField.value.trim()) {
        subjectField.value = 'New message from the ACMF website';
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
        return response.json().then(function (data) {
          // FormSubmit's AJAX endpoint returns success as the string "true"
          var ok = response.ok && data && String(data.success) === 'true';
          if (ok) {
            form.reset();
            status.textContent = 'Thank you — your message has been sent. We\'ll be in touch soon.';
            status.className = 'form-status is-success';
          } else {
            var msg = (data && data.message)
              ? data.message
              : 'Something went wrong. Please email acmf7989@gmail.com instead.';
            status.textContent = msg;
            status.className = 'form-status is-error';
          }
        });
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
