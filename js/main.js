(function () {
  var body = document.body;

  /* ---- Menu ---- */
  var menuBtn = document.querySelector('.menu-btn');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  document.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---- Section counter + active link ---- */
  var sections = [].slice.call(document.querySelectorAll('main > section'));
  var cur = document.querySelector('.counter .cur');
  var fill = document.querySelector('.counter .bar i');
  var links = document.querySelectorAll('.nav a');
  function onScroll() {
    var y = window.scrollY + window.innerHeight * 0.4, idx = 0;
    sections.forEach(function (s, i) { if (s.offsetTop <= y) idx = i; });
    cur.textContent = ('0' + (idx + 1)).slice(-2);
    fill.style.transform = 'scaleX(' + (idx + 1) / sections.length + ')';
    links.forEach(function (l, i) { l.classList.toggle('active', i === idx); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add('in'); }); }

  /* ---- Portfolio filter + load more ---- */
  var PAGE = 18, shown = PAGE, filter = 'all';
  var items = [].slice.call(document.querySelectorAll('.item'));
  var moreBtn = document.querySelector('.load-more');
  function visibleSet() { return items.filter(function (it) { return filter === 'all' || it.dataset.cat === filter; }); }
  function render() {
    var set = visibleSet();
    items.forEach(function (it) { it.hidden = true; });
    set.forEach(function (it, i) { it.hidden = i >= shown; });
    moreBtn.hidden = shown >= set.length;
    moreBtn.querySelector('span').textContent = set.length - Math.min(shown, set.length);
  }
  document.querySelectorAll('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.filters button').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
      filter = b.dataset.filter; shown = PAGE; render();
    });
  });
  moreBtn.addEventListener('click', function () { shown += PAGE; render(); });
  render();

  /* ---- Lightbox ---- */
  var lb = document.querySelector('.lb'), lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
  var list = [], pos = 0, lastFocus = null;
  function show(i) {
    pos = (i + list.length) % list.length;
    var it = list[pos];
    lbImg.src = it.dataset.full;
    lbImg.alt = it.querySelector('img').alt;
    lbCap.innerHTML = '';
    lbCap.appendChild(document.createTextNode(it.querySelector('.cap b').textContent));
    var s = document.createElement('span'); s.textContent = (pos + 1) + ' / ' + list.length; lbCap.appendChild(s);
  }
  function open(it) {
    list = visibleSet(); lastFocus = it;
    show(list.indexOf(it));
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    lb.querySelector('.x').focus();
  }
  function close() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    body.style.overflow = ''; if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (it) {
    it.addEventListener('click', function () { open(it); });
    it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(it); } });
  });
  lb.querySelector('.x').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', function () { show(pos - 1); });
  lb.querySelector('.next').addEventListener('click', function () { show(pos + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (lb.classList.contains('open')) close(); else setMenu(false); }
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') show(pos - 1);
    if (e.key === 'ArrowRight') show(pos + 1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return; var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1)); tx = null;
  });

  /* ---- Year ---- */
  var y = document.querySelector('.year'); if (y) y.textContent = new Date().getFullYear();
})();
