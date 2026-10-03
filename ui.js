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
