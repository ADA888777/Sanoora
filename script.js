/* =====================================================================
   سانورا — أكاديمية اللغات | script.js  (نسخة مُصلَحة)
   ---------------------------------------------------------------------
   ملخص الإصلاحات في هذا الملف:
   1) حذف "شاشة التحميل" التي كانت تُنشأ بعد اكتمال التحميل وتغطي الموقع
      لمدة ٢ ثانية وتمنع الضغط (كانت تبدو كأن الموقع فارغ/معلّق).
   2) الشاشة السوداء: خلفية <html> كانت #2A1E0C فتظهر عند التمرير الزائد
      على الجوال؛ صارت فاتحة مع overscroll-behavior:none.
   3) الشريط العلوي: كان يعدّل style داخل حدث scroll غير مُقيّد مع
      transition:all + backdrop-filter فيهتز ويومض. صار صنف CSS واحد
      يُبدَّل داخل requestAnimationFrame، وبلا blur على الجوال.
   4) إيقاف الأنيميشن اللانهائي الثقيل: خلفية الهيرو الدوّارة، و١٥ إطاراً
      دوّاراً حول الأعلام (سبب رئيسي للبطء والتجميد على الجوال).
   5) عدّاد الأرقام: كان setInterval قد لا يتوقف أبداً (NaN) فيستهلك
      المعالج؛ صار requestAnimationFrame مع حماية كاملة.
   6) النوافذ المنبثقة: فتح/إغلاق بأصناف CSS مع استرجاع مضمون للتمرير
      (كانت body تبقى overflow:hidden فيصبح الموقع غير قابل للتمرير).
   7) إلغاء طلب صلاحية الموقع الجغرافي؛ تحديد البلد عبر IP مع مهلة ٤ ثوانٍ
      وتخزين مؤقت، والسعر يظهر فوراً بالريال بلا انتظار الشبكة.
   8) حذف تأثير الكتابة الذي كان يمسح عنوان الصفحة الرئيسي (h1).
   9) إزالة تكرار مستمعي الأسئلة الشائعة + دعم prefers-reduced-motion.
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

      /* الجوال: بلا blur (سبب الوميض/السواد) + قائمة تعمل */
      '@media (max-width:900px){.navbar{background:#FFF8DC !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important}.modal{backdrop-filter:none !important;-webkit-backdrop-filter:none !important}}',
      '@media (max-width:768px){.nav-content{flex-direction:column;gap:.6rem}.nav-links{display:flex !important;flex-wrap:wrap;justify-content:center;gap:.4rem 1rem;width:100%}.nav-links a{font-size:.95rem}.modal-content{max-height:85vh;overflow-y:auto;padding:1.75rem}}',

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
     ٢) تحويل العملة
     ===================================================================== */
  var COURSE_PRICE = 139;   /* السعر الحالي بالريال السعودي */
  var OLD_PRICE    = 299;   /* السعر قبل الخصم */

  var exchangeRates = {
    SAR: { rate: 1,     symbol: 'ريال سعودي',   country: 'السعودية' },
    EGP: { rate: 8.08,  symbol: 'جنيه مصري',    country: 'مصر' },
    AED: { rate: 0.98,  symbol: 'درهم إماراتي', country: 'الإمارات' },
    JOD: { rate: 0.19,  symbol: 'دينار أردني',  country: 'الأردن' },
    KWD: { rate: 0.081, symbol: 'دينار كويتي',  country: 'الكويت' },
    USD: { rate: 0.27,  symbol: 'دولار أمريكي', country: 'الولايات المتحدة' },
    EUR: { rate: 0.25,  symbol: 'يورو',         country: 'أوروبا' },
    QAR: { rate: 0.97,  symbol: 'ريال قطري',    country: 'قطر' },
    OMR: { rate: 0.1,   symbol: 'ريال عماني',   country: 'عُمان' },
    BHD: { rate: 0.1,   symbol: 'دينار بحريني', country: 'البحرين' }
  };

  var countryToCurrency = {
    SA: 'SAR', EG: 'EGP', AE: 'AED', JO: 'JOD', KW: 'KWD',
    US: 'USD', QA: 'QAR', OM: 'OMR', BH: 'BHD',
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
    AT: 'EUR', BE: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR'
  };

  var userCurrency = 'SAR';
  var userCountry  = 'SA';

  function setText(list, value) {
    for (var i = 0; i < list.length; i++) { list[i].textContent = value; }
  }

  function updatePriceDisplay() {
    var info = exchangeRates[userCurrency] || exchangeRates.SAR;
    var newPrice = Math.round(COURSE_PRICE * info.rate);
    var oldPrice = Math.round(OLD_PRICE * info.rate);

    var current = document.getElementById('currentCurrency');
    if (current) { current.textContent = newPrice + ' ' + info.symbol; }

    setText(document.querySelectorAll('.currency-new'), newPrice + ' ' + info.symbol);
    setText(document.querySelectorAll('.currency-old'), oldPrice + ' ' + info.symbol);
  }

  function applyCountry(code) {
    code = String(code || '').toUpperCase();
    if (countryToCurrency[code]) {
      userCountry  = code;
      userCurrency = countryToCurrency[code];
    } else {
      userCurrency = 'SAR';
    }
    updatePriceDisplay();
  }

  /* تحديد البلد عبر IP فقط — بلا نافذة صلاحية الموقع، وبمهلة زمنية */
  function detectCountry() {
    var cached = null;
    try { cached = window.sessionStorage.getItem('sn_country'); } catch (e) {}
    if (cached) { applyCountry(cached); return; }

    if (!window.fetch || !window.AbortController) { return; }

    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 4000);

    window.fetch('https://ipapi.co/json/', { signal: controller.signal, cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        var code = data && (data.country_code || data.country);
        if (code) {
          try { window.sessionStorage.setItem('sn_country', code); } catch (e) {}
          applyCountry(code);
        }
      })
      .catch(function () { /* يبقى السعر بالريال السعودي */ })
      .then(function () { window.clearTimeout(timer); });
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
      document.body.style.overflow = '';          /* تنظيف أي قيمة قديمة */
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

    /* إزالة أي تنسيق سطري قديم كان يضعه الإصدار السابق */
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
     ٥) روابط التنقل الداخلية — إزاحة صحيحة تحت الشريط الثابت
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
      var top = section.getBoundingClientRect().top +
                (window.pageYOffset || document.documentElement.scrollTop || 0) -
                navHeight() - 12;

      window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* =====================================================================
     ٦) الأسئلة الشائعة — مستمع واحد فقط لكل سؤال
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
     ٧) ظهور تدريجي للبطاقات — بأصناف CSS وبلا خطر بقاء العناصر مخفية
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
     ٨) عدّاد الأرقام — requestAnimationFrame ومحمي من NaN
     ===================================================================== */
  function animateNumber(el) {
    var raw = (el.textContent || '').trim();

    /* صيغ مثل 24/7 تُترك كما هي */
    if (/\d\s*\/\s*\d/.test(raw)) { return; }

    var digits = raw.replace(/[^\d]/g, '');
    var target = parseInt(digits, 10);
    if (!isFinite(target) || target <= 0) { return; }      /* حماية من الحلقة اللانهائية */

    var suffix = raw.replace(/[\d\s\u0660-\u0669]/g, '');
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
     ٩) الإقلاع
     ===================================================================== */
  function init() {
    /* تنظيف أي قفل تمرير متبقٍ من الإصدار السابق */
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    updatePriceDisplay();   /* سعر فوري بالريال بلا انتظار الشبكة */
    initNavbar();
    initAnchors();
    initFaq();
    initModals();
    initCounters();
    initReveal();
    detectCountry();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
