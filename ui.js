// ================================================
// ریزه‌کاری‌های سبک سایت (روی همه‌ی صفحه‌ها)
//  ۱) خط بالای صفحه: فقط موقع رفتن به صفحه‌ی دیگه مثل «در حال لود شدن» پر می‌شه
//  ۲) دکمه‌ی برگشت به بالا
//  ۳) عکس کارت‌ها روی صفحه‌های پر از کارت فقط وقتی نزدیک می‌شی لود می‌شن
//  ۴) نوار متحرک وقتی دیده نمی‌شه می‌ایسته
// (نور دنبال‌کننده‌ی موس، دکمه‌ی مغناطیسی، ripple، پارالکس و ظاهر شدن موقع
//  اسکرول برای سبک شدن سایت حذف شدن)
// ================================================
(function () {
    var root = document.documentElement;

    // دستگاه ضعیف (۴ هسته یا کمتر / ۴ گیگ رم یا کمتر) → کلاس lite (سایه‌های سبک‌تر؛ توی style.css)
    var weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
               (navigator.deviceMemory && navigator.deviceMemory <= 4);
    if (weak) root.classList.add('lite');

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

    // ارتفاع صفحه رو هر ۴۰۰ میلی‌ثانیه یه بار می‌خونیم (خوندنش هر فریم بی‌خودی سنگینه)
    var cachedH = 0, cachedAt = -1000;
    function pageH() {
        var now = performance.now();
        if (now - cachedAt > 400) {
            cachedH = document.documentElement.scrollHeight - window.innerHeight;
            cachedAt = now;
        }
        return cachedH;
    }
    function update() {
        ticking = false;
        var y = window.scrollY;
        // (پر و خالی شدن خط موقع اسکرول برداشته شد؛ خط فقط موقع رفتن به صفحه‌ی دیگه دیده می‌شه)
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
        bar.style.transform = 'scaleX(0.5)';   // تا نصف می‌ره، بقیه‌اش توی صفحه‌ی جدید
        try { sessionStorage.setItem('shapur_nav', '1'); } catch (e) {}
        setTimeout(function () { window.location.href = url; }, 450);
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

    // صفحه‌ی جدید باز شد: خط از نصف شروع می‌شه، پر می‌شه و بعد محو می‌شه (ادامه‌ی همون لود)
    var came = false;
    try { came = sessionStorage.getItem('shapur_nav') === '1'; sessionStorage.removeItem('shapur_nav'); } catch (e) {}
    if (came) {
        bar.style.transition = 'none';
        bar.style.transform = 'scaleX(0.5)';
        void bar.offsetWidth;
        bar.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        bar.style.transform = 'scaleX(1)';
        setTimeout(function () {
            bar.style.transition = 'opacity 0.4s ease';
            bar.style.opacity = '0';
        }, 650);
        setTimeout(function () {
            bar.style.transition = '';
            bar.style.opacity = '';
            update();
        }, 1100);
    } else {
        update();
    }

    // ----- عکس کارت‌ها فقط وقتی نزدیک صفحه می‌رسن لود می‌شن (روی صفحه‌های پر از کارت) -----
    var cards = document.querySelectorAll('.card');
    if (cards.length > 12 && 'IntersectionObserver' in window) {
        root.classList.add('lz');
        var imgIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                en.target.classList.add('img-on');
                imgIO.unobserve(en.target);
            });
        }, { rootMargin: '500px 0px' });
        Array.prototype.forEach.call(cards, function (c) { imgIO.observe(c); });
    }

    // ----- نوار متحرک وقتی دیده نمی‌شه می‌ایسته (کار الکی نکنه) -----
    var tick = document.querySelector('.ticker');
    if (tick && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            tick.classList.toggle('off', !entries[0].isIntersecting);
        }).observe(tick);
    }
})();
