/* =====================================================================
   سانورا — أكاديمية اللغات | script.js
   ---------------------------------------------------------------------
   إصلاحات الأداء والاستقرار:
   1) حذف "شاشة التحميل" التي كانت تُنشأ بعد اكتمال التحميل وتغطي الموقع
      وتمنع الضغط (كانت تبدو كأن الموقع فارغ أو معلّق).
   2) الشاشة السوداء: خلفية <html> كانت #2A1E0C فتظهر عند التمرير الزائد
      على الجوال؛ صارت فاتحة مع overscroll-behavior:none.
   3) الشريط العلوي: كان يعدّل style داخل حدث scroll غير مُقيّد مع
      transition:all + backdrop-filter فيهتز ويومض. صار صنف CSS واحد
      يُبدَّل داخل requestAnimationFrame، وبلا blur على الجوال.
   4) إيقاف الأنيميشن اللانهائي الثقيل: خلفية الهيرو الدوّارة، و١٥ إطاراً
      دوّاراً حول الأعلام (سبب رئيسي للبطء والتجميد على الجوال).
   5) عدّاد الأرقام: كان setInterval قد لا يتوقف أبداً (NaN) فيستهلك
      المعالج؛ صار requestAnimationFrame مع حماية كاملة.
   6) النوافذ المنبثقة: فتح/إغلاق بأصناف CSS مع استرجاع مضمون للتمرير.
   7) تحديد البلد عبر IP بمهلة زمنية بدل طلب صلاحية الموقع الجغرافي.
   8) حذف تأثير الكتابة الذي كان يمسح عنوان الصفحة الرئيسي (h1).
   9) مستمع واحد للأسئلة الشائعة + دعم prefers-reduced-motion.

   إضافات:
   أ) أسعار الصرف تُجلب حيّة مع تخزين مؤقت ١٢ ساعة وقيم احتياطية.
   ب) قائمة جوال حقيقية (زر هامبرغر) تُبنى بالجافاسكربت بلا تعديل HTML.
   ===================================================================== */

(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* =====================================================================
     ١) إصلاحات التنسيق — تُحقن مبكراً لتتفوّق على التنسيق داخل index.html
     ===================================================================== */
  (function injectFixCss() {
    var css = [
      /* لا شاشة سوداء عند التمرير الزائد */
      'html{background:#FFF8DC !important;overscroll-behavior-y:none;-webkit-text-size-adjust:100%}',

      /* الشريط العلوي: انتقال محدَّد بدل transition:all */
      '.navbar{transition:background-color .25s ease,box-shadow .25s ease !important}',
      '.navbar.is-scrolled{background:rgba(255,248,220,.98) !important;box-shadow:0 2px 18px rgba(184,134,11,.18) !important}',

      /* إيقاف الأنيميشن اللانهائي الثقيل */
      '.hero-section::before{animation:none !important}',
      '.card-flag::before{animation:none !important}',
      '@media (hover:hover) and (min-width:901px){.language-card:hover .card-flag::before{animation:rotateBorder 3s linear infinite}}',

      /* ارتفاع الهيرو لا يقفز مع شريط متصفح الجوال */
      '@supports (min-height:100dvh){.hero-section{min-height:100dvh}}',

      /* الجوال: بلا blur (سبب الوميض والسواد) */
      '@media (max-width:900px){.navbar{background:#FFF8DC !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important}.modal{backdrop-filter:none !important;-webkit-backdrop-filter:none !important}}',

      /* زر قائمة الجوال */
      '.sn-nav-toggle{display:none;flex-direction:column;align-items:center;justify-content:center;gap:5px;width:46px;height:40px;flex:0 0 auto;background:transparent;border:1px solid rgba(184,134,11,.35);border-radius:10px;cursor:pointer;padding:0}',
      '.sn-nav-toggle span{display:block;width:22px;height:2px;background:#8A6508;border-radius:2px;transition:transform .25s ease,opacity .2s ease}',
      '@media (max-width:768px){',
      '  .sn-nav-toggle{display:inline-flex}',
      '  .nav-content{flex-wrap:wrap;align-items:center}',
      '  .nav-links{display:none !important}',
      '  .navbar.sn-open{background:#FFF8DC !important;box-shadow:0 8px 24px rgba(184,134,11,.22) !important}',
      '  .navbar.sn-open .nav-links{display:flex !important;flex-direction:column;align-items:stretch;width:100%;list-style:none;gap:.1rem;margin:.6rem 0 0;padding:.6rem 0 0;border-top:1px solid rgba(184,134,11,.2)}',
      '  .navbar.sn-open .nav-links li{width:100%}',
      '  .navbar.sn-open .nav-links a{display:block;width:100%;padding:.7rem .5rem;font-size:1rem;border-radius:8px}',
      '  .navbar.sn-open .sn-nav-toggle span:nth-child(1){transform:translateY(7px) rotate(45deg)}',
      '  .navbar.sn-open .sn-nav-toggle span:nth-child(2){opacity:0}',
      '  .navbar.sn-open .sn-nav-toggle span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}',
      '  .modal-content{max-height:85vh;overflow-y:auto;padding:1.75rem}',
      '}',

      /* النوافذ المنبثقة */
      '.modal.is-open{display:flex !important}',
      'html.sn-lock,body.sn-lock{overflow:hidden !important}',

      /* ظهور تدريجي آمن */
      '.sn-reveal{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s ease}',
      '.sn-reveal.is-in{opacity:1;transform:none}',

      /* احترام تقليل الحركة */
      '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}.sn-reveal{opacity:1 !important;transform:none !important}}'
    ].join('\n');

    var tag = document.createElement('style');
    tag.id = 'sn-fixes';
    tag.textContent = css;
    (document.head || document.documentElement).appendChild(tag);
  })();

  /* =====================================================================
     ٢) الأسعار وتحويل العملة
     ===================================================================== */
  var COURSE_PRICE = 139;   /* السعر الحالي بالريال السعودي */
  var OLD_PRICE    = 299;   /* السعر قبل الخصم بالريال السعودي */

  /* قيم احتياطية (١٢ سبتمبر ٢٠٢٦) تُستخدم فقط إذا تعذّر جلب الأسعار الحيّة */
  var FALLBACK_RATES = {
    SAR: 1,       EGP: 13.69,   AED: 0.9793,  JOD: 0.1891, KWD: 0.0822,
    USD: 0.2667,  EUR: 0.2299,  QAR: 0.9707,  OMR: 0.1025, BHD: 0.1003,
    MAD: 2.4993,  DZD: 35.4979, TND: 0.7753,  IQD: 349.6,  TRY: 12.9621
  };

  var CURRENCY_NAMES = {
    SAR: 'ريال سعودي',   EGP: 'جنيه مصري',    AED: 'درهم إماراتي',
    JOD: 'دينار أردني',  KWD: 'دينار كويتي',  USD: 'دولار أمريكي',
    EUR: 'يورو',         QAR: 'ريال قطري',    OMR: 'ريال عماني',
    BHD: 'دينار بحريني', MAD: 'درهم مغربي',   DZD: 'دينار جزائري',
    TND: 'دينار تونسي',  IQD: 'دينار عراقي',  TRY: 'ليرة تركية'
  };

  var countryToCurrency = {
    SA: 'SAR', EG: 'EGP', AE: 'AED', JO: 'JOD', KW: 'KWD',
    QA: 'QAR', OM: 'OMR', BH: 'BHD', US: 'USD',
    MA: 'MAD', DZ: 'DZD', TN: 'TND', IQ: 'IQD', TR: 'TRY',
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
    AT: 'EUR', BE: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR'
  };

  var RATE_SOURCES = [
    'https://open.er-api.com/v6/latest/SAR',
    'https://api.exchangerate-api.com/v4/latest/SAR'
  ];
  var RATES_KEY = 'sn_rates_v1';
  var RATES_TTL = 12 * 60 * 60 * 1000;   /* ١٢ ساعة */

  var rates = FALLBACK_RATES;
  var userCurrency = 'SAR';
  var userCountry  = 'SA';

  var numberFormat = (window.Intl && window.Intl.NumberFormat) ? new window.Intl.NumberFormat('en-US') : null;

  function formatNumber(n) {
    return numberFormat ? numberFormat.format(n) : String(n);
  }

  /* يتحقق أن الاستجابة أسعار منطقية بأساس الريال، ويكمل الناقص من الاحتياطي */
  function normalizeRates(src) {
    if (!src || typeof src !== 'object') { return null; }

    var core = ['SAR', 'USD', 'EUR', 'EGP', 'AED'];
    var i, value;

    for (i = 0; i < core.length; i++) {
      value = src[core[i]];
      if (typeof value !== 'number' || !isFinite(value) || value <= 0) { return null; }
    }
    if (Math.abs(src.SAR - 1) > 0.02) { return null; }   /* الأساس ليس الريال */

    var keys = Object.keys(FALLBACK_RATES);
    var out = {};
    for (i = 0; i < keys.length; i++) {
      value = src[keys[i]];
      out[keys[i]] = (typeof value === 'number' && isFinite(value) && value > 0) ? value : FALLBACK_RATES[keys[i]];
    }
    return out;
  }

  function fetchRatesFrom(url) {
    if (!window.fetch || !window.AbortController) { return Promise.reject(new Error('unsupported')); }

    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 5000);

    return window.fetch(url, { signal: controller.signal })
      .then(function (res) {
        if (!res.ok) { throw new Error('http ' + res.status); }
        return res.json();
      })
      .then(function (data) {
        window.clearTimeout(timer);
        var ok = normalizeRates(data && (data.rates || data.conversion_rates));
        if (!ok) { throw new Error('bad payload'); }
        return ok;
      }, function (err) {
        window.clearTimeout(timer);
        throw err;
      });
  }

  function loadRates() {
    /* ١) المخزَّن مؤقتاً */
    try {
      var raw = window.localStorage.getItem(RATES_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && saved.at && (Date.now() - saved.at) < RATES_TTL) {
          var cached = normalizeRates(saved.rates);
          if (cached) { rates = cached; return Promise.resolve(); }
        }
      }
    } catch (e) {}

    /* ٢) المصدر الأول ثم الثاني ثم القيم الاحتياطية */
    return fetchRatesFrom(RATE_SOURCES[0])
      .catch(function () { return fetchRatesFrom(RATE_SOURCES[1]); })
      .then(function (fresh) {
        rates = fresh;
        try {
          window.localStorage.setItem(RATES_KEY, JSON.stringify({ at: Date.now(), rates: fresh }));
        } catch (e) {}
      })
      .catch(function () { /* تبقى القيم الاحتياطية */ });
  }

  /* تقريب مريح للعين: الريال يبقى كما هو، والمبالغ الكبيرة لأقرب ١٠ */
  function convertPrice(base, rate) {
    var value = base * rate;
    if (rate === 1) { return Math.round(value); }
    if (value >= 1000) { return Math.round(value / 10) * 10; }
    return Math.round(value);
  }

  function setText(list, value) {
    for (var i = 0; i < list.length; i++) { list[i].textContent = value; }
  }

  function updatePriceDisplay() {
    var rate = rates[userCurrency];
    if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) { rate = 1; userCurrency = 'SAR'; }

    var name = CURRENCY_NAMES[userCurrency] || CURRENCY_NAMES.SAR;
    var newText = formatNumber(convertPrice(COURSE_PRICE, rate)) + ' ' + name;
    var oldText = formatNumber(convertPrice(OLD_PRICE, rate)) + ' ' + name;

    var current = document.getElementById('currentCurrency');
    if (current) { current.textContent = newText; }

    setText(document.querySelectorAll('.currency-new'), newText);
    setText(document.querySelectorAll('.currency-old'), oldText);
  }

  function applyCountry(code) {
    code = String(code || '').toUpperCase();
    var currency = countryToCurrency[code];
    if (currency && CURRENCY_NAMES[currency]) {
      userCountry  = code;
      userCurrency = currency;
    } else {
      userCurrency = 'SAR';
    }
    updatePriceDisplay();
  }

  /* تحديد البلد عبر IP فقط — بلا نافذة صلاحية الموقع، وبمهلة زمنية */
  function detectCountry() {
    var cached = null;
    try { cached = window.sessionStorage.getItem('sn_country'); } catch (e) {}
    if (cached) { applyCountry(cached); return Promise.resolve(); }

    if (!window.fetch || !window.AbortController) { return Promise.resolve(); }

    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 4000);

    return window.fetch('https://ipapi.co/json/', { signal: controller.signal, cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        window.clearTimeout(timer);
        var code = data && (data.country_code || data.country);
        if (code) {
          try { window.sessionStorage.setItem('sn_country', code); } catch (e) {}
          applyCountry(code);
        }
      })
      .catch(function () { window.clearTimeout(timer); });
  }

  function initPricing() {
    updatePriceDisplay();                       /* سعر فوري بالريال بلا انتظار */
    loadRates()
      .then(function () { updatePriceDisplay(); })
      .then(function () { return detectCountry(); })
      .then(function () { updatePriceDisplay(); })
      .catch(function () {});
  }

  /* =====================================================================
     ٣) النوافذ المنبثقة (Modals) — مع قفل تمرير آمن
     ===================================================================== */
  var lockCount = 0;
  var savedScroll = 0;

  function lockScroll() {
    if (lockCount === 0) {
      savedScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
      document.documentElement.classList.add('sn-lock');
      document.body.classList.add('sn-lock');
    }
    lockCount++;
  }

  function unlockScroll() {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.documentElement.classList.remove('sn-lock');
      document.body.classList.remove('sn-lock');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, savedScroll);
    }
  }

  function resolveModal(target) {
    if (!target) { return null; }
    return (typeof target === 'string') ? document.getElementById(target) : target;
  }

  function openModal(target) {
    var modal = resolveModal(target);
    if (!modal || modal.classList.contains('is-open')) { return; }

    modal.classList.add('is-open');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    modal.snLastFocus = document.activeElement;
    lockScroll();

    var focusable = modal.querySelector('.close-btn, [data-close-modal], button, a[href], input, textarea, select');
    if (focusable && focusable.focus) {
      try { focusable.focus({ preventScroll: true }); } catch (e) { focusable.focus(); }
    }
  }

  function closeModal(target) {
    var modal = resolveModal(target);
    if (!modal) { return; }

    var wasOpen = modal.classList.contains('is-open') ||
                  (modal.style.display && modal.style.display !== 'none');

    modal.classList.remove('is-open');
    modal.style.display = '';
    modal.setAttribute('aria-hidden', 'true');

    if (wasOpen) { unlockScroll(); }

    var back = modal.snLastFocus;
    if (back && back.focus) {
      try { back.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  function openFooterModal(type) {
    openModal(String(type) + '-modal');
  }

  /* دوال عامة لأن index.html يستدعيها من onclick */
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openFooterModal = openFooterModal;

  function initModals() {
    var modals = document.querySelectorAll('.modal');
    for (var i = 0; i < modals.length; i++) {
      (function (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = '';
        modal.addEventListener('click', function (e) {
          if (e.target === modal) { closeModal(modal); }   /* الضغط على الخلفية */
        });
      })(modals[i]);
    }

    document.addEventListener('click', function (e) {
      var el = (e.target && e.target.closest) ? e.target.closest('[data-close-modal],[data-footer-modal]') : null;
      if (!el) { return; }
      e.preventDefault();
      if (el.hasAttribute('data-close-modal')) {
        closeModal(el.getAttribute('data-close-modal'));
      } else {
        openFooterModal(el.getAttribute('data-footer-modal'));
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') { return; }
      var open = document.querySelector('.modal.is-open');
      if (open) { closeModal(open); }
    });
  }

  /* =====================================================================
     ٤) الشريط العلوي — بلا اهتزاز (rAF + صنف CSS)
     ===================================================================== */
  function navHeight() {
    var nav = document.querySelector('.navbar');
    return nav ? Math.round(nav.getBoundingClientRect().height) : 0;
  }

  function initNavbar() {
    var nav = document.querySelector('.navbar');
    if (!nav) { return; }

    nav.style.background = '';
    nav.style.boxShadow = '';

    var ticking = false;
    function apply() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y > 60) { nav.classList.add('is-scrolled'); }
      else { nav.classList.remove('is-scrolled'); }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(apply); }
    }, { passive: true });

    apply();
  }

  /* =====================================================================
     ٥) قائمة الجوال (زر هامبرغر) — تُبنى هنا بلا تعديل على HTML
     ===================================================================== */
  var closeMobileMenu = function () {};

  function initMobileMenu() {
    var navbar  = document.querySelector('.navbar');
    var content = navbar ? navbar.querySelector('.nav-content') : null;
    var links   = navbar ? navbar.querySelector('.nav-links') : null;
    if (!navbar || !content || !links) { return; }

    if (!links.id) { links.id = 'sn-nav-links'; }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sn-nav-toggle';
    btn.setAttribute('aria-label', 'فتح القائمة');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', links.id);
    btn.appendChild(document.createElement('span'));
    btn.appendChild(document.createElement('span'));
    btn.appendChild(document.createElement('span'));
    content.insertBefore(btn, links);   /* الزر بجانب الشعار، والقائمة تنسدل تحتهما */

    function setOpen(open) {
      if (open) { navbar.classList.add('sn-open'); }
      else { navbar.classList.remove('sn-open'); }
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    }

    closeMobileMenu = function () { setOpen(false); };

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!navbar.classList.contains('sn-open'));
    });

    links.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('a')) { setOpen(false); }
    });

    document.addEventListener('click', function (e) {
      if (navbar.classList.contains('sn-open') && !navbar.contains(e.target)) { setOpen(false); }
    });

    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && navbar.classList.contains('sn-open')) { setOpen(false); }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) { setOpen(false); }
    }, { passive: true });
  }

  /* =====================================================================
     ٦) روابط التنقل الداخلية — إزاحة صحيحة تحت الشريط الثابت
     ===================================================================== */
  function initAnchors() {
    function syncPadding() {
      document.documentElement.style.scrollPaddingTop = (navHeight() + 12) + 'px';
    }
    syncPadding();
    window.addEventListener('resize', syncPadding, { passive: true });

    document.addEventListener('click', function (e) {
      var link = (e.target && e.target.closest) ? e.target.closest('a[href^="#"]') : null;
      if (!link) { return; }

      var href = link.getAttribute('href');
      if (!href || href === '#' || link.hasAttribute('data-footer-modal')) { return; }

      var section = document.getElementById(href.slice(1));
      if (!section) { return; }

      e.preventDefault();
      closeMobileMenu();

      var top = section.getBoundingClientRect().top +
                (window.pageYOffset || document.documentElement.scrollTop || 0) -
                navHeight() - 12;

      window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* =====================================================================
     ٧) الأسئلة الشائعة — مستمع واحد فقط لكل سؤال
     ===================================================================== */
  function initFaq() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));

    items.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!question) { return; }

      question.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');

      question.addEventListener('click', function () {
        var willOpen = !item.classList.contains('active');

        items.forEach(function (other) {
          other.classList.remove('active');
          var oa = other.querySelector('.faq-answer');
          var oq = other.querySelector('.faq-question');
          if (oa) { oa.classList.remove('active'); }
          if (oq) { oq.setAttribute('aria-expanded', 'false'); }
        });

        if (willOpen) {
          item.classList.add('active');
          if (answer) { answer.classList.add('active'); }
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* =====================================================================
     ٨) ظهور تدريجي للبطاقات — بلا خطر بقاء العناصر مخفية
     ===================================================================== */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) { return; }

    var targets = Array.prototype.slice.call(document.querySelectorAll('.language-card, .stat-item'));
    if (!targets.length) { return; }

    targets.forEach(function (el, i) {
      el.classList.add('sn-reveal');
      el.style.transitionDelay = (Math.min(i, 6) * 60) + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { io.observe(el); });

    /* شبكة أمان: لا يبقى أي عنصر مخفياً إن تعطّل المراقب */
    window.setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-in'); });
    }, 5000);
  }

  /* =====================================================================
     ٩) عدّاد الأرقام — requestAnimationFrame ومحمي من NaN
     ===================================================================== */
  function animateNumber(el) {
    var raw = (el.textContent || '').trim();

    if (/\d\s*\/\s*\d/.test(raw)) { return; }          /* صيغ مثل 24/7 */

    var target = parseInt(raw.replace(/[^\d]/g, ''), 10);
    if (!isFinite(target) || target <= 0) { return; }   /* حماية من الحلقة اللانهائية */

    var suffix = raw.replace(/[\d\s]/g, '');
    if (reduceMotion) { el.textContent = target + suffix; return; }

    var duration = 1400;
    var start = null;

    function step(now) {
      if (start === null) { start = now; }
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if (p < 1) { window.requestAnimationFrame(step); }
      else { el.textContent = target + suffix; }
    }

    window.requestAnimationFrame(step);

    /* ضمان الوصول للرقم النهائي حتى لو أُوقف الرسم (تبويب مخفي) */
    window.setTimeout(function () { el.textContent = target + suffix; }, duration + 1500);
  }

  function initCounters() {
    if (!('IntersectionObserver' in window)) { return; }

    var numbers = Array.prototype.slice.call(document.querySelectorAll('.stat-number'));
    if (!numbers.length) { return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        io.unobserve(entry.target);
        animateNumber(entry.target);
      });
    }, { threshold: 0.4 });

    numbers.forEach(function (el) { io.observe(el); });
  }

  /* =====================================================================
     ١٠) الإقلاع
     ===================================================================== */
  function init() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    initNavbar();
    initMobileMenu();
    initAnchors();
    initFaq();
    initModals();
    initCounters();
    initReveal();
    initPricing();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
