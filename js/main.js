/* Ai Handy Helper — interactions. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     1. Power-on intro: CSS runs the show; JS just tidies up after it
        and remembers the visit so repeat visits open instantly.
  ------------------------------------------------------------------ */
  if (root.classList.contains('is-booting')) {
    try { sessionStorage.setItem('ahh-powered', '1'); } catch (e) {}
    setTimeout(function () {
      root.classList.remove('is-booting');
      root.classList.add('is-powered');
    }, 2200);
  }

  // Clicking the toolbox in the hero replays the surge
  var repower = $('[data-repower]');
  if (repower) {
    repower.addEventListener('click', function () {
      if (reduceMotion) return;
      root.classList.remove('is-repowering');
      void root.offsetWidth; // restart CSS animations
      root.classList.add('is-repowering');
      setTimeout(function () { root.classList.remove('is-repowering'); }, 1800);
    });
  }

  /* ------------------------------------------------------------------
     2. Header: glass background after scrolling + active nav link
  ------------------------------------------------------------------ */
  var header = $('[data-header]');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var navLinks = $$('.nav-link[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) navIO.observe(t); });
  }

  /* Mobile menu */
  var menuBtn = $('[data-menu]');
  var nav = $('#main-nav');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
  menuBtn.addEventListener('click', function () {
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ------------------------------------------------------------------
     3. Scroll reveals + "in view" triggers for the previews
  ------------------------------------------------------------------ */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('in-view');
        io.unobserve(el);
        if (el.classList.contains('tile')) {
          setTimeout(function () { el.classList.add('revealed'); }, 1200);
          runSteps(el);
        }
        if (el.classList.contains('bundle')) countUp(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  // JobDesk checklist ticks one by one
  function runSteps(tile) {
    var items = $$('.steps li', tile);
    items.forEach(function (li, i) {
      setTimeout(function () { li.classList.add('done'); }, reduceMotion ? 0 : 500 + i * 420);
    });
  }

  // Bundle price counts up to its value
  function countUp(scope) {
    var el = $('[data-count-to]', scope);
    if (!el || reduceMotion) return;
    var to = +el.getAttribute('data-count-to'), start = null, dur = 900;
    (function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* ------------------------------------------------------------------
     4. Tiles: subtle 3D tilt + cursor glow (pointer devices only)
  ------------------------------------------------------------------ */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.tile').forEach(function (tile) {
      tile.addEventListener('pointermove', function (e) {
        var r = tile.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        tile.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        tile.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        tile.style.setProperty('--ry', ((x - 0.5) * 6).toFixed(2) + 'deg');
        tile.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
      });
      tile.addEventListener('pointerleave', function () {
        tile.style.setProperty('--rx', '0deg');
        tile.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ------------------------------------------------------------------
     5. Click sparks on buttons (the "electric" brand touch)
  ------------------------------------------------------------------ */
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('.btn, .answer, .network-core');
      if (!target || e.detail === 0) return; // skip keyboard-triggered clicks
      for (var i = 0; i < 8; i++) {
        var s = document.createElement('span');
        s.className = 'spark';
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        s.style.setProperty('--r', (i * 45 + Math.random() * 20) + 'deg');
        document.body.appendChild(s);
        s.addEventListener('animationend', function () { this.remove(); });
      }
    });
  }

  /* ------------------------------------------------------------------
     6. Tool finder (same questions + logic as the live site)
  ------------------------------------------------------------------ */
  var QUESTIONS = [
    { title: 'What trade are you in?', answers: ['Building and renovations', 'Plumbing and heating', 'Electrical', 'Landscaping', 'Other'] },
    { title: 'Do you have a website?', answers: ['Yes', 'In progress', 'Not yet'] },
    { title: 'Where do you need the most help?', answers: ['Capturing website enquiries', 'Keeping track of jobs, quotes and invoices', 'Answering calls while I’m working'] },
    { title: 'Where do most of your enquiries come from?', answers: ['Website', 'Phone', 'WhatsApp or social media', 'Referrals', 'A mix'] }
  ];
  var TOOLS = {
    SiteMate: { img: 'img/sitemate-robot.webp', meta: 'Website chatbot · £9/month', href: 'https://amplifymybusiness.co.uk/products', cta: 'Explore SiteMate' },
    JobDesk: { img: 'img/jobdesk-clipboard.webp', meta: 'Job management · £17/month', href: 'https://amplifymybusiness.co.uk/products', cta: 'Explore JobDesk' },
    Echo: { img: 'img/echo-waveform.webp', meta: 'AI call handler · Coming early 2027', href: 'https://amplifymybusiness.co.uk/contact?product=Echo', cta: 'Register interest' },
    Relay: { img: 'img/relay-bubble.webp', meta: 'WhatsApp assistant · Coming soon', href: 'https://amplifymybusiness.co.uk/contact?product=Relay', cta: 'Register interest' }
  };

  function recommend(a) {
    var hasSite = a[1] === 'Yes';
    var siteLeads = a[2] === QUESTIONS[2].answers[0] || a[3] === 'Website' || a[3] === 'A mix';
    var tools = [], reasons = {};
    if (hasSite && siteLeads) { tools.push('SiteMate'); reasons.SiteMate = 'You have a website, so SiteMate can capture job details from visitors while you’re working.'; }
    if (a[2] === QUESTIONS[2].answers[1]) { tools.push('JobDesk'); reasons.JobDesk = 'JobDesk keeps jobs, quotes and invoices together, with enquiries added manually from any source.'; }
    if (a[2] === QUESTIONS[2].answers[2]) { tools.push('Echo'); reasons.Echo = 'You need help with calls while you work. Echo is planned to capture those job details in your voice, with your permission.'; }
    if (a[3] === 'WhatsApp or social media') { tools.push('Relay'); reasons.Relay = 'Most of your enquiries arrive by message. Relay is being built to reply on WhatsApp and collect the job details.'; }
    return { tools: tools, reasons: reasons, needsWebsite: siteLeads && !hasSite, bundle: tools.indexOf('SiteMate') > -1 && tools.indexOf('JobDesk') > -1 };
  }

  var finder = $('#tool-finder');
  var body = $('[data-finder-body]');
  var count = $('[data-count]');
  var meter = $('[data-meter]');
  var backBtn = $('[data-back]');
  var step = 0, answers = [], busy = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function setCharge(n) {
    finder.style.setProperty('--charge', (n / 4).toFixed(2));
    meter.setAttribute('aria-valuenow', String(n));
  }

  function questionHTML(i) {
    var q = QUESTIONS[i];
    return '<h2 class="finder-q" id="finder-q" tabindex="-1">' + esc(q.title) + '</h2><div class="answers">' +
      q.answers.map(function (a) {
        return '<button class="answer" type="button" aria-pressed="' + (answers[i] === a) + '">' + esc(a) + '</button>';
      }).join('') + '</div>';
  }

  function resultsHTML() {
    var r = recommend(answers);
    var html = '<h2 class="results-title" id="finder-q" tabindex="-1">Your toolkit is ready.</h2>';
    if (r.tools.length) {
      html += '<p class="results-sub">Based on your answers, start here:</p><div class="result-list">';
      r.tools.forEach(function (name, i) {
        var t = TOOLS[name];
        html += '<article class="result" style="--i:' + i + '"><img src="' + t.img + '" alt="" width="64" height="64">' +
          '<div><h3>' + name + '</h3><p class="r-meta">' + t.meta + '</p><p class="r-why">' + esc(r.reasons[name]) + '</p>' +
          '<a href="' + t.href + '">' + t.cta + ' <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></a></div></article>';
      });
      html += '</div>';
    } else {
      html += '<p class="result-empty">No single tool stands out from your answers yet. Have a look at <a href="#tools">all four tools</a> to see which fits your working day.</p>';
    }
    if (r.bundle) html += '<p class="result-note"><strong>Better together:</strong> SiteMate + JobDesk for £21/month. Save £5/month.</p>';
    if (r.needsWebsite) html += '<p class="result-note"><strong>No website yet?</strong> SiteMate needs one. Amplify can help you explore your options.</p>';
    html += '<button class="btn btn-ghost restart" type="button" data-restart>Start again</button>';
    return html;
  }

  function render(dir) {
    if (busy) return;
    busy = true;
    finder.classList.toggle('back', dir === 'back');
    var swap = function () {
      body.classList.remove('leaving');
      var done = step >= QUESTIONS.length;
      body.innerHTML = done ? resultsHTML() : questionHTML(step);
      count.textContent = done ? 'Done. 4 of 4' : 'Question ' + (step + 1) + ' of 4';
      finder.classList.toggle('complete', done);
      backBtn.disabled = step === 0;
      setCharge(Math.min(step, 4));
      body.classList.add('entering');
      var h = $('#finder-q', body);
      if (h && dir) h.focus({ preventScroll: true });
      setTimeout(function () { body.classList.remove('entering'); busy = false; }, reduceMotion ? 0 : 520);
    };
    if (reduceMotion || !dir) { swap(); return; }
    body.classList.add('leaving');
    setTimeout(swap, 200);
  }

  body.addEventListener('click', function (e) {
    var btn = e.target.closest('.answer');
    if (btn && !busy) {
      answers[step] = btn.textContent;
      answers.length = step + 1;
      btn.classList.add('picked');
      $$('.answer', body).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      step++;
      setCharge(step);
      setTimeout(function () { render('next'); }, reduceMotion ? 0 : 160);
      return;
    }
    if (e.target.closest('[data-restart]')) {
      step = 0; answers = [];
      render('back');
    }
  });

  backBtn.addEventListener('click', function () {
    if (step === 0 || busy) return;
    step--;
    render('back');
  });

  // Every "Find my AI tools" button scrolls to the finder and focuses it
  $$('[data-find]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      finder.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      finder.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, '', '#tool-finder');
    });
  });

  /* ------------------------------------------------------------------
     7. "A day on the tools": tabs, before/after, gentle autoplay
  ------------------------------------------------------------------ */
  var DAY = [
    { label: 'The enquiry', tool: 'SiteMate', img: 'img/sitemate-robot.webp',
      before: 'A new enquiry. Another interruption.', after: 'A new enquiry. You keep working.',
      beforeText: 'You’re halfway through a job when someone asks about a kitchen renovation. The message waits until you’re free.',
      afterText: 'SiteMate answers common questions on your website and collects the customer’s job details for you.',
      status: 'Enquiry captured by SiteMate', beforeStatus: 'Unread message',
      rows: [['Customer', 'Alex Morgan'], ['Job', 'Kitchen renovation'], ['Area', 'Local enquiry']],
      beforeRows: [['From', 'Unknown number'], ['Job', '“Something about a kitchen?”'], ['Reply', 'Not yet']] },
    { label: 'The quote', tool: 'JobDesk', img: 'img/jobdesk-clipboard.webp',
      before: 'Notes here. Customer details there.', after: 'The details together. The quote sent.',
      beforeText: 'You search through messages and notes before putting a quote together at the end of a long day.',
      afterText: 'You add the enquiry to JobDesk, check the details and send a quote. You stay in control of the next step.',
      status: 'Quote sent from JobDesk', beforeStatus: 'Quote still to write',
      rows: [['Customer', 'Alex Morgan'], ['Quote', 'Kitchen renovation'], ['Status', 'Sent to customer']],
      beforeRows: [['Notes', 'Back of a receipt'], ['Details', 'Somewhere in WhatsApp'], ['Status', 'Tonight, maybe']] },
    { label: 'The payment', tool: 'JobDesk', img: 'img/jobdesk-clipboard.webp',
      before: 'Was that invoice paid?', after: 'Know where every job stands.',
      beforeText: 'You check messages, paperwork and your bank account to work out which invoices still need chasing.',
      afterText: 'Use JobDesk to keep the invoice alongside the job and track its payment status in one place.',
      status: 'Payment tracked in JobDesk', beforeStatus: 'Payment unclear',
      rows: [['Job', 'Kitchen renovation'], ['Invoice', 'Recorded'], ['Payment', 'Marked as paid']],
      beforeRows: [['Job', 'Kitchen renovation'], ['Invoice', 'Sent… probably'], ['Payment', 'Check the bank app']] }
  ];

  var day = $('[data-day]');
  var tabs = $$('[data-step]', day);
  var modeBtns = $$('[data-mode]');
  var modeSwitch = $('.mode-switch');
  var copyEl = $('[data-day-copy]', day);
  var cardEl = $('[data-day-card]', day);
  var dayStep = 0, mode = 'after', autoTimer = null, AUTO_MS = 6000;

  modeSwitch.setAttribute('data-state', mode);

  function paintDay(animate) {
    var d = DAY[dayStep], after = mode === 'after';
    var rows = after ? d.rows : d.beforeRows;
    var fill = function () {
      day.classList.toggle('is-before', !after);
      copyEl.innerHTML = '<p class="day-kicker">0' + (dayStep + 1) + ' / ' + (after ? 'With your tools' : 'Before') + '</p>' +
        '<h3>' + esc(after ? d.after : d.before) + '</h3><p>' + esc(after ? d.afterText : d.beforeText) + '</p>';
      cardEl.innerHTML = '<div class="card-head"><img src="' + (after ? d.img : 'img/relay-bubble.webp') + '" alt="" width="34" height="34">' +
        '<strong>' + (after ? d.tool : 'Your phone') + '</strong><span class="preview-tag">Example data</span></div>' +
        '<p class="card-status">' + esc(after ? d.status : d.beforeStatus) + '</p><dl>' +
        rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>';
      tabs.forEach(function (t, i) { t.setAttribute('aria-selected', String(i === dayStep)); t.tabIndex = i === dayStep ? 0 : -1; });
      if (animate && !reduceMotion) {
        [copyEl, cardEl].forEach(function (el) { el.classList.remove('swap-out'); el.classList.add('swap-in'); });
        setTimeout(function () { copyEl.classList.remove('swap-in'); cardEl.classList.remove('swap-in'); }, 700);
      }
    };
    if (animate && !reduceMotion) {
      copyEl.classList.add('swap-out'); cardEl.classList.add('swap-out');
      setTimeout(fill, 190);
    } else fill();
  }

  function stopAuto() { clearInterval(autoTimer); autoTimer = null; day.classList.remove('autoplay'); }
  function startAuto() {
    if (reduceMotion || autoTimer) return;
    day.style.setProperty('--dur', AUTO_MS + 'ms');
    day.classList.add('autoplay');
    autoTimer = setInterval(function () { dayStep = (dayStep + 1) % DAY.length; paintDay(true); restartBar(); }, AUTO_MS);
  }
  function restartBar() { // restart the progress bar animation on the active tab
    var bar = $('[aria-selected="true"] .tab-bar', day);
    if (!bar) return;
    bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { stopAuto(); if (i !== dayStep) { dayStep = i; paintDay(true); } });
    t.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault(); stopAuto();
      dayStep = (dayStep + dir + DAY.length) % DAY.length;
      paintDay(true); tabs[dayStep].focus();
    });
  });
  modeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var m = b.getAttribute('data-mode');
      if (m === mode) return;
      stopAuto();
      mode = m;
      modeSwitch.setAttribute('data-state', mode);
      modeBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      paintDay(true);
    });
  });
  day.addEventListener('pointerenter', stopAuto);

  // Autoplay only while the section is on screen
  if ('IntersectionObserver' in window) {
    var userTouched = false;
    day.addEventListener('pointerdown', function () { userTouched = true; });
    day.addEventListener('keydown', function () { userTouched = true; });
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !userTouched) startAuto(); else stopAuto();
      });
    }, { threshold: 0.5 }).observe(day);
  }
})();
