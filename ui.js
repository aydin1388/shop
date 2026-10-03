// ================================================
// ریزه‌کاری‌های ظاهری سایت (روی همه‌ی صفحه‌ها)
//  ۱) خط بالای صفحه: موقع اسکرول پر می‌شه، موقع رفتن به صفحه‌ی دیگه
//     مثل «در حال لود شدن» پر می‌شه (مثل سایت عقاب آرتا هلیل)
//  ۲) دکمه‌ی برگشت به بالا
//  ۳) نور ملایمی که زیر موس روی کارت‌ها دنبال موس می‌ره
// همه‌ی کارها سبکن (فقط روی یه المان کار می‌کنن).
// ================================================
(function () {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    var top = document.createElement('button');
    top.className = 'to-top';
    top.setAttribute('aria-label', 'برگشت به بالا');
    top.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(top);

    var navigating = false;
    var ticking = false;

    function update() {
        ticking = false;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var y = window.scrollY;
        if (!navigating) {
            var p = h > 0 ? Math.min(1, y / h) : 0;
            bar.style.transform = 'scaleX(' + p + ')';
        }
        top.classList.toggle('show', y > 700);
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    // ----- رفتن به صفحه‌ی دیگه: خط پر می‌شه، بعد صفحه عوض می‌شه -----
    window.shapurGo = function (url) {
        if (navigating) return;
        navigating = true;
        bar.classList.add('loading');
        bar.style.transform = 'scaleX(1)';
        try { sessionStorage.setItem('shapur_nav', '1'); } catch (e) {}
        setTimeout(function () { window.location.href = url; }, 650);
    };

    document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        if (a.target && a.target !== '_self') return;
        if (a.hasAttribute('download')) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
        var url;
        try { url = new URL(a.href, location.href); } catch (err) { return; }
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.search === location.search) return;
        e.preventDefault();
        window.shapurGo(url.href);
    });

    // برگشتن با دکمه‌ی back مرورگر: حالت عادی
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            navigating = false;
            bar.classList.remove('loading');
            update();
        }
    });

    // صفحه‌ی جدید باز شد: خط پر شروع می‌شه و آروم محو می‌شه (ادامه‌ی همون لود)
    var came = false;
    try { came = sessionStorage.getItem('shapur_nav') === '1'; sessionStorage.removeItem('shapur_nav'); } catch (e) {}
    if (came) {
        bar.style.transition = 'none';
        bar.style.transform = 'scaleX(1)';
        void bar.offsetWidth;
        bar.style.transition = 'opacity 0.5s ease 0.1s';
        bar.style.opacity = '0';
        setTimeout(function () {
            bar.style.transition = '';
            bar.style.opacity = '';
            update();
        }, 700);
    } else {
        update();
    }

    // ----- نور دنبال‌کننده‌ی موس روی کارت‌ها (فقط وقتی موس واقعی هست) -----
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var raf = 0, px = 0, py = 0, cur = null;
        document.addEventListener('pointermove', function (e) {
            var c = e.target.closest ? e.target.closest('.card, .feature, .stat') : null;
            cur = c;
            if (!c) return;
            px = e.clientX; py = e.clientY;
            if (!raf) {
                raf = requestAnimationFrame(function () {
                    raf = 0;
                    if (!cur) return;
                    var r = cur.getBoundingClientRect();
                    cur.style.setProperty('--mx', (px - r.left) + 'px');
                    cur.style.setProperty('--my', (py - r.top) + 'px');
                });
            }
        }, { passive: true });
    }
})();


// ================================================
// ✦ لایه‌ی مدرن: انیمیشن‌های سبک (فقط transform و opacity، همه GPU) ✦
//  ۱) ظاهر شدن آروم بخش‌ها و کارت‌ها موقع اسکرول (یک‌بار، پله‌ای)
//  ۲) هدر که موقع اسکرول جمع‌وجورتر می‌شه
//  ۳) دکمه‌های مغناطیسی + نور روی دکمه‌ها موقع کلیک (ripple)
//  ۴) پارالکس خیلی ملایم سکه‌ی بالای صفحه با موس
//  ۵) محو شدن آروم صفحه موقع رفتن به صفحه‌ی بعد
// اگه کاربر «کاهش حرکت» رو توی سیستمش روشن کرده باشه، هیچ‌کدوم اجرا نمی‌شن.
// ================================================
(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    var root = document.documentElement;

    // ----- هدر جمع‌وجور موقع اسکرول -----
    var small = false;
    function hdr() {
        var s = window.scrollY > 60;
        if (s !== small) { small = s; document.body.classList.toggle('scrolled', s); }
    }
    window.addEventListener('scroll', hdr, { passive: true });
    hdr();

    if (reduce) return;
    root.classList.add('modern');

    // ----- ظاهر شدن موقع اسکرول -----
    var SEL = '.sec-tag, .section-title, .section-sub, .deal, .card, .feature, .stat, .review, .partner, .top, .post, .faq-item, .page-banner, .contact-card, .doc, .dash-card, .dash-panel, .cart-layout, .about-text, .ticker';
    var els = Array.prototype.slice.call(document.querySelectorAll(SEL));
    if ('IntersectionObserver' in window && els.length) {
        var io = new IntersectionObserver(function (entries) {
            var d = 0;
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                var el = en.target;
                io.unobserve(el);
                var delay = Math.min(d, 6) * 70;
                d++;
                el.style.transitionDelay = delay + 'ms';
                el.classList.add('in');
                setTimeout(function () {
                    el.classList.remove('rv', 'in');
                    el.style.transitionDelay = '';
                }, 900 + delay);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
        els.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
    }

    if (!fine) return;

    // ----- دکمه‌های مغناطیسی (property جدای transform، با hover قاطی نمی‌شه) -----
    document.addEventListener('pointermove', function (e) {
        var b = e.target.closest ? e.target.closest('.btn, .btn-sm, .cart-btn') : null;
        if (!b) return;
        var r = b.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / r.width * 10;
        var y = (e.clientY - (r.top + r.height / 2)) / r.height * 8;
        b.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
        var b = e.target.closest ? e.target.closest('.btn, .btn-sm, .cart-btn') : null;
        if (b && !b.contains(e.relatedTarget)) b.style.translate = '';
    }, { passive: true });

    // ----- نور ripple موقع کلیک روی دکمه‌ها -----
    document.addEventListener('pointerdown', function (e) {
        var b = e.target.closest ? e.target.closest('.btn, .btn-sm') : null;
        if (!b) return;
        var r = b.getBoundingClientRect();
        var s = document.createElement('span');
        s.className = 'ripple';
        var size = Math.max(r.width, r.height) * 1.6;
        s.style.width = s.style.height = size + 'px';
        s.style.left = (e.clientX - r.left - size / 2) + 'px';
        s.style.top = (e.clientY - r.top - size / 2) + 'px';
        b.appendChild(s);
        setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 650);
    }, { passive: true });

    // ----- پارالکس ملایم سکه‌ی هیرو با موس -----
    var hero = document.querySelector('.hero-frame');
    var coin = document.querySelector('.hero-subject');
    if (hero && coin) {
        var hr = 0, hx = 0, hy = 0;
        hero.addEventListener('pointermove', function (e) {
            var r = hero.getBoundingClientRect();
            hx = ((e.clientX - r.left) / r.width - 0.5) * 22;
            hy = ((e.clientY - r.top) / r.height - 0.5) * 16;
            if (!hr) hr = requestAnimationFrame(function () { hr = 0; coin.style.translate = (-hx).toFixed(1) + 'px ' + (-hy).toFixed(1) + 'px'; });
        }, { passive: true });
        hero.addEventListener('pointerleave', function () { coin.style.translate = ''; }, { passive: true });
    }

    // ----- موقع رفتن به صفحه‌ی دیگه، محتوا آروم کم‌رنگ می‌شه -----
    var oldGo = window.shapurGo;
    if (oldGo) {
        window.shapurGo = function (u) { document.body.classList.add('leaving'); oldGo(u); };
    }
    window.addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('leaving'); });
})();
