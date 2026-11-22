/* CIC v2 — interactions. Content is fully visible without JS; motion is progressive. */
(function () {
  var d = document, root = d.documentElement, w = window;
  var rtl = root.dir === 'rtl';
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  // ---- header: solid on scroll, hide on scroll down
  var hdr = $('#hdr'), lastY = 0;
  function onScroll() {
    var y = w.scrollY || 0;
    if (hdr) {
      hdr.classList.toggle('scrolled', y > 30);
      if (Math.abs(y - lastY) < 8) return;
      hdr.classList.toggle('hide', y > 600 && y > lastY && !root.classList.contains('menu-open'));
    }
    lastY = y;
  }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---- mobile menu
  var burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = root.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { root.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); if (lenis) lenis.start(); }); });
  }
  // close language menu on outside click
  d.addEventListener('click', function (e) { $$('details.lang[open]').forEach(function (x) { if (!x.contains(e.target)) x.removeAttribute('open'); }); });

  // ---- form timestamp (anti-spam, read by contact.php)
  var ts = $('#contactTs'); if (ts) ts.value = Math.floor(Date.now() / 1000);

  // ---- 3D hero: load lazily, only where WebGL makes sense
  var host = $('[data-hero3d]');
  function loadHero() {
    if (!host || !('IntersectionObserver' in w)) return;
    var src = new URL(host.getAttribute('data-hero3d'), d.baseURI).href;
    import(src).catch(function () {});
  }
  if (host) {
    var idle = w.requestIdleCallback || function (f) { return setTimeout(f, 200); };
    if (d.readyState === 'complete') idle(loadHero); else w.addEventListener('load', function () { idle(loadHero); });
  }

  // footer giant word fill
  var giant = $('.f-giant');
  if (giant && 'IntersectionObserver' in w) new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { giant.classList.add('on'); o.disconnect(); } }, { threshold: .3 }).observe(giant);
  else if (giant) giant.classList.add('on');

  var lenis = null;
  if (reduce || !w.gsap || !w.ScrollTrigger) { root.classList.add('no-motion'); return; }

  var gsap = w.gsap, ST = w.ScrollTrigger;
  gsap.registerPlugin(ST); if (w.DrawSVGPlugin) gsap.registerPlugin(w.DrawSVGPlugin);
  root.classList.add('motion');

  // ---- smooth scroll
  if (w.Lenis) {
    lenis = new w.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on('scroll', ST.update); w.__lenis = lenis;
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -70 }); history.replaceState(null, '', id);
      });
    });
  }

  // ---- hero intro
  var h1Lines = $$('.h1 .ln > span');
  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hdr', { y: -30, opacity: 0, duration: 1 }, 0.1)
    .from(h1Lines, { yPercent: 110, duration: 1.4, stagger: 0.12 }, 0.2)
    .from('.hero .kicker, .hero .crumbs', { opacity: 0, y: 16, duration: 1 }, 0.35)
    .from('.hero .tagline, .hero .lead', { opacity: 0, y: 24, duration: 1.1, stagger: .08 }, 0.6)
    .from('.hero-ctas > *', { opacity: 0, y: 24, duration: 1, stagger: 0.08 }, 0.75)
    .from('.hero-meta, .crop', { opacity: 0, duration: 1.2 }, 1.0);
  var heroArt = $('.sub-art .art');
  if (heroArt && w.DrawSVGPlugin) tl.from($$('.d', heroArt), { drawSVG: 0, duration: 1.6, stagger: 0.06, ease: 'power2.inOut' }, 0.4);

  // hero content drift on scroll
  if ($('.hero-in')) gsap.to('.hero-in', { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // ---- section headings reveal
  $$('.rv').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  // eyebrows line grow
  $$('.sec .eyebrow i, .projects .eyebrow i, .cta .eyebrow i').forEach(function (el) {
    gsap.from(el, { scaleX: 0, transformOrigin: rtl ? 'right' : 'left', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // ---- manifesto: word-by-word illumination
  var mf = $('[data-words]');
  if (mf) {
    var words = mf.textContent.trim().split(/\s+/);
    mf.innerHTML = words.map(function (x) { return '<span class="w">' + x.replace(/</g, '&lt;') + '</span>'; }).join(' ');
    gsap.to($$('.w', mf), { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: mf, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
  }

  // ---- counters
  var bnDigits = '০১২৩৪৫৬৭৮৯';
  $$('.cnt').forEach(function (el) {
    var to = +el.getAttribute('data-count'), bn = root.lang === 'bn', o = { v: 0 };
    gsap.to(o, { v: to, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: function () { var s = String(Math.round(o.v)); el.textContent = bn ? s.replace(/\d/g, function (c) { return bnDigits[c]; }) : s; } });
  });
  gsap.from('.stat', { opacity: 0, y: 40, duration: 1.2, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });

  // ---- services rows + line-art drawing
  $$('.svc, .fm, .oth, .scope li').forEach(function (el) {
    gsap.from(el, { opacity: 0, y: 50, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  if (w.DrawSVGPlugin) {
    $$('.svc-art .art, .pj-grid .pc-art').forEach(function (svg) {
      gsap.from($$('.d', svg), { drawSVG: 0, duration: 1.6, stagger: 0.05, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 85%' } });
    });
  }

  // ---- projects: pinned horizontal scroll on large screens
  var mm = gsap.matchMedia();
  mm.add('(min-width: 981px)', function () {
    var sec = $('.projects'), pin = $('.pj-pin'), track = $('.pj-track');
    if (!sec || !pin || !track) return;
    sec.classList.add('pinned');
    var dist = function () { return Math.max(0, track.scrollWidth - w.innerWidth); };
    var tween = gsap.to(track, { x: function () { return (rtl ? 1 : -1) * dist(); }, ease: 'none',
      scrollTrigger: { trigger: pin, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
    gsap.to('.pj-bar span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: function () { return '+=' + dist(); }, scrub: true } });
    if (w.DrawSVGPlugin) $$('.pj-track .pc-art').forEach(function (svg) {
      var r = svg.getBoundingClientRect(), inView = rtl ? r.right > w.innerWidth * 0.35 : r.left < w.innerWidth * 0.65;
      gsap.from($$('.d', svg), { drawSVG: 0, duration: 1.4, stagger: 0.04, ease: 'power2.inOut',
        scrollTrigger: inView ? { trigger: pin, start: 'top 70%' } : { trigger: svg, containerAnimation: tween, start: rtl ? 'right 35%' : 'left 65%' } });
    });
    return function () { sec.classList.remove('pinned'); gsap.set(track, { clearProps: 'x' }); };
  });
  mm.add('(max-width: 980px)', function () {
    if (w.DrawSVGPlugin) $$('.pj-track .pc-art').forEach(function (svg) { gsap.from($$('.d', svg), { drawSVG: 0, duration: 1.4, stagger: 0.04, scrollTrigger: { trigger: svg, start: 'top 85%' } }); });
  });
  gsap.from('.pj-list li', { opacity: 0, y: 24, duration: .9, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '.pj-list', start: 'top 88%' } });

  // ---- process line draws + steps light up
  $$('.steps').forEach(function (steps) {
    var line = $('.steps-line span', steps);
    gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 70%', end: 'bottom 60%', scrub: true } });
    $$('.st', steps).forEach(function (st) {
      ST.create({ trigger: st, start: 'top 68%', onEnter: function () { st.classList.add('on'); }, onLeaveBack: function () { st.classList.remove('on'); } });
      gsap.from(st.children[1], { opacity: 0, x: rtl ? -24 : 24, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: st, start: 'top 80%' } });
    });
  });

  // ---- values / faq / contact
  gsap.from('.val', { opacity: 0, y: 60, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.val-grid', start: 'top 85%' } });
  $$('.faq details').forEach(function (el, i) { gsap.from(el, { opacity: 0, y: 30, duration: 1, delay: i * 0.05, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 94%' } }); });
  gsap.from('.c-info > *, .form > *', { opacity: 0, y: 30, duration: 1, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: '.c-grid', start: 'top 85%' } });

  // ---- CTA: scale-in title + magnetic button
  var ctaT = $('.cta-t');
  if (ctaT) gsap.fromTo(ctaT, { scale: 0.86 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'center center', scrub: true } });
  if (w.matchMedia('(hover: hover)').matches) {
    $$('.mag').forEach(function (m) {
      var inner = $('.mag-in', m);
      var xTo = gsap.quickTo(m, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(m, 'y', { duration: 0.6, ease: 'power3' });
      var ixTo = gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3' }), iyTo = gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3' });
      m.addEventListener('pointermove', function (e) { var r = m.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); xTo(dx * 0.35); yTo(dy * 0.35); ixTo(dx * 0.15); iyTo(dy * 0.15); });
      m.addEventListener('pointerleave', function () { xTo(0); yTo(0); ixTo(0); iyTo(0); });
    });
  }

  // refresh after fonts settle (Arabic fonts change line heights)
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ST.refresh(); });
})();

// v4: current-projects gallery strip
document.querySelectorAll('.nw').forEach(a => {
  const img = a.querySelector('.nw-main img'), cap = a.querySelector('.nw-main figcaption');
  a.querySelectorAll('.nw-strip button').forEach(b => b.addEventListener('click', () => {
    a.querySelectorAll('.nw-strip button').forEach(x => x.removeAttribute('aria-current'));
    b.setAttribute('aria-current', 'true');
    img.classList.add('swap');
    const n = new Image(); n.src = b.dataset.src;
    n.decode().catch(() => {}).then(() => { img.src = b.dataset.src; cap.textContent = b.dataset.cap; img.classList.remove('swap'); });
  }));
});

// v4: project sheet dialog (details + gallery) for every project card / list row
(function () {
  var dlg = document.getElementById('psheet'), src = document.getElementById('pdata');
  if (!dlg || !src) return;
  var D = JSON.parse(src.textContent), base = dlg.dataset.base || '';
  var fix = function (u) { return base && u.charAt(0) === '/' ? base + u.slice(1) : u; };
  var $ = function (s) { return dlg.querySelector(s); };
  var img = $('.nw-main img'), strip = $('.ps-strip');
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  function show(i, list) {
    img.style.opacity = 0; var n = new Image(); n.src = fix(list[i]);
    n.decode().catch(function () {}).then(function () { img.src = n.src; img.style.opacity = 1; });
    strip.querySelectorAll('button').forEach(function (b, j) { j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'); });
  }
  function open(slug) {
    var p = D.p[slug], L = D.l; if (!p) return;
    $('[data-f=t]').textContent = p.t; $('[data-f=c]').textContent = p.c; img.alt = p.t;
    $('[data-f=s]').textContent = p.s; $('[data-f=s]').hidden = !p.s;
    $('[data-f=sch]').hidden = !p.sc.length;
    $('.ps-scope').innerHTML = p.sc.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    var m = [[L.year, p.y], [L.svc, p.c], [L.loc, p.loc], [L.client, p.cl], [L.status, p.st]].filter(function (r) { return r[1]; });
    $('.nw-meta').innerHTML = m.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(String(r[1])) + '</dd></div>'; }).join('');
    strip.innerHTML = p.im.length > 1 ? p.im.map(function (u, i) { return '<button type="button" aria-label="' + (i + 1) + '"><img src="' + fix(u.replace(/\/([^\/]+)$/, '/t-$1')) + '" alt="" loading="lazy" onerror="this.src=\'' + fix(u) + '\'"></button>'; }).join('') : '';
    strip.querySelectorAll('button').forEach(function (b, i) { b.addEventListener('click', function () { show(i, p.im); }); });
    show(0, p.im);
    $('[data-f=wa]').href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent(L.wa + p.t);
    var pg = $('[data-f=pg]'); pg.href = fix(p.pg); pg.hidden = !!dlg.dataset.nopage;
    if (window.__lenis) window.__lenis.stop();
    dlg.showModal(); dlg.querySelector('.ps-in').scrollTop = 0;
  }
  dlg.addEventListener('close', function () { if (window.__lenis) window.__lenis.start(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (b) { e.preventDefault(); open(b.dataset.p); } });
})();

// v4: lead events for Google Analytics 4 (no-op until GA4_ID is set in content.py)
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href]'); if (!a || typeof window.gtag !== 'function') return;
  var h = a.getAttribute('href'), m = /^tel:/.test(h) ? 'phone' : /wa\.me|whatsapp/.test(h) ? 'whatsapp' : /^mailto:/.test(h) ? 'email' : '';
  if (m) window.gtag('event', 'generate_lead', { method: m, page_location: location.href });
});
(function () { var f = document.getElementById('contactForm'); if (f) f.addEventListener('submit', function () { if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'form' }); }); })();

// v4: show the contact form result after contact.php redirects back (?sent=1 / ?sent=0)
(function () {
  var m = /[?&]sent=([01])/.exec(location.search), box = document.querySelector('.form-msg');
  if (!m || !box) return;
  box.textContent = m[1] === '1' ? box.dataset.ok : box.dataset.err;
  box.className += m[1] === '1' ? ' ok' : ' err'; box.hidden = false;
  history.replaceState(null, '', location.pathname + '#contact');
  setTimeout(function () { var c = document.getElementById('contact'); if (c) c.scrollIntoView(); }, 400);
})();

// v4: orientation — scroll progress, back-to-top, current section highlighted in the nav
(function () {
  var bar = document.querySelector('.sprog'), top = document.querySelector('.totop');
  var links = [].slice.call(document.querySelectorAll('#nav a[href*="#"]'));
  var secs = links.map(function (a) { var id = a.getAttribute('href').split('#')[1]; return document.getElementById(id); });
  var tick = false;
  function upd() {
    tick = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
    if (top) top.classList.toggle('on', y > innerHeight * 1.2);
    var cur = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('cur', i === cur); i === cur ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
})();
