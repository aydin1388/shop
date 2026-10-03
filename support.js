// ================================================
// پشتیبانی شناور: باز و بسته شدن پنجره‌ی چت
// + پیام خوشامد خودکار با صدای نوتیف
// ================================================
(function () {
    const box   = document.getElementById('support-box');
    const btn   = document.getElementById('support-btn');
    const close = document.getElementById('support-close');
    const send  = document.getElementById('support-send');
    const input = document.getElementById('support-input');
    const body  = document.querySelector('.support-body');
    const wrap  = document.getElementById('support');
    if (!btn) return;

    btn.addEventListener('click', function () {
        box.classList.toggle('open');
        hideTeaser();
    });
    close.addEventListener('click', function () {
        box.classList.remove('open');
    });

    function sendMsg() {
        const t = input.value.trim();
        if (!t) return;
        const m = document.createElement('div');
        m.className = 'support-msg me';
        m.textContent = t;
        body.appendChild(m);

        const r = document.createElement('div');
        r.className = 'support-msg';
        r.textContent = 'ممنون از پیامت! این نسخه نمونه‌ست؛ پاسخ واقعی از تلگرام پشتیبانی داده می‌شه.';
        body.appendChild(r);

        input.value = '';
        body.scrollTop = body.scrollHeight;
    }
    send.addEventListener('click', sendMsg);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendMsg(); });

    // ------------------------------------------------
    // صدای نوتیف (بدون فایل، با Web Audio)
    // مرورگرها تا اولین کلیک/اسکرول صدا رو بلاک می‌کنن،
    // برای همین با اولین حرکت کاربر صدا رو «آزاد» می‌کنیم.
    // ------------------------------------------------
    let actx;
    // صدا رو باید دقیقاً داخل یه حرکتِ واقعیِ کاربر «آزاد» کرد
    function unlockAudio() {
        try {
            if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
            if (actx.state === 'suspended') actx.resume();
            // پرایمر بی‌صدا داخل خود حرکت کاربر تا مرورگر صدا رو باز کنه
            const buf = actx.createBuffer(1, 1, 22050);
            const src = actx.createBufferSource();
            src.buffer = buf;
            src.connect(actx.destination);
            src.start(0);
        } catch (e) {}
    }

    function ding() {
        try {
            if (!actx) return;
            if (actx.state === 'suspended') actx.resume();
            const t = actx.currentTime;
            // دو نُت کوتاه (دینگ-دینگ)
            [[880, 0], [1174, 0.13]].forEach(function (pair) {
                const o = actx.createOscillator();
                const g = actx.createGain();
                o.type = 'sine';
                o.frequency.value = pair[0];
                o.connect(g); g.connect(actx.destination);
                const s = t + pair[1];
                g.gain.setValueAtTime(0.0001, s);
                g.gain.exponentialRampToValueAtTime(0.32, s + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, s + 0.3);
                o.start(s);
                o.stop(s + 0.32);
            });
        } catch (e) {}
    }

    // ------------------------------------------------
    // بابل پیام خوشامد که خودکار بالای دکمه ظاهر می‌شه
    // ------------------------------------------------
    const AVATAR = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2.5" y="13" width="3.5" height="5.5" rx="1.4"/><rect x="18" y="13" width="3.5" height="5.5" rx="1.4"/><path d="M20 18.5v.5a3 3 0 0 1-3 3h-3"/><circle cx="12" cy="9.2" r="2.6"/><path d="M7.5 16.5a4.7 4.7 0 0 1 9 0"/></svg>';

    const teaser = document.createElement('div');
    teaser.className = 'support-teaser';
    teaser.innerHTML =
        '<button class="teaser-close" aria-label="بستن">✕</button>' +
        '<div class="teaser-av">' + AVATAR + '</div>' +
        '<div class="teaser-txt"><b>پشتیبانی شاپور</b>' +
        '<span>سلام رفیق! 👋 وقتت بخیر، چطور می‌تونم کمکت کنم؟</span></div>';
    // بالای دکمه (قبل از دکمه) قرار می‌گیره
    wrap.insertBefore(teaser, btn);

    const tclose = teaser.querySelector('.teaser-close');
    let hideTimer;

    const DURATION = 20000;   // کل مدت نمایش پیام (میلی‌ثانیه)
    const DELAY = 3000;       // مکث اولیه بعد از حرکت کاربر

    // ابزارهای حافظه‌ی نشست (session) برای اینکه پیام بین صفحه‌ها ادامه پیدا کنه
    function ss(k)      { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function ssSet(k, v){ try { sessionStorage.setItem(k, v); } catch (e) {} }
    function markDone() { ssSet('shapur_teaser_done', '1'); }

    function showTeaser(playSound, duration) {
        if (box.classList.contains('open')) return;
        teaser.classList.add('show');
        if (playSound) ding();
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function () {
            hideTeaser();
            markDone();               // وقتش تموم شد؛ دیگه توی صفحه‌های بعدی نیاد
        }, duration);
    }
    function hideTeaser() {
        teaser.classList.remove('show');
        clearTimeout(hideTimer);
    }

    // کلیک روی بابل → باز شدن چت (و تمومش کن)
    teaser.addEventListener('click', function (e) {
        if (e.target === tclose) return;
        box.classList.add('open');
        hideTeaser();
        markDone();
    });
    tclose.addEventListener('click', function (e) {
        e.stopPropagation();
        hideTeaser();
        markDone();
    });

    // ------------------------------------------------
    // منطق نمایش:
    //  - اگه قبلاً تموم شده → هیچی
    //  - اگه قبلاً شروع شده (توی صفحه‌ی دیگه) → همون لحظه، بی‌صدا،
    //    برای باقی‌مونده‌ی زمان ادامه بده (تا بین صفحه‌ها نپره)
    //  - اگه اولین باره → منتظر اولین حرکت واقعی کاربر بمون، بعد با صدا نشون بده
    // ------------------------------------------------
    if (ss('shapur_teaser_done') === '1') {
        // تموم شده، کاری نکن
    } else if (ss('shapur_teaser_shownAt')) {
        const remaining = Number(ss('shapur_teaser_shownAt')) + DURATION - Date.now();
        if (remaining > 0) {
            showTeaser(false, remaining);   // ادامه‌ی نمایش بدون صدا
        } else {
            markDone();
        }
    } else {
        // به «scroll» گوش نمی‌دیم چون مرورگر گاهی خودش موقع لود اسکرول می‌کنه
        const GESTURES = ['pointerdown', 'keydown', 'touchstart', 'wheel'];
        let armed = false;
        function onFirstGesture() {
            if (armed) return;
            armed = true;
            unlockAudio();              // آزاد کردن صدا داخل همین حرکت واقعی
            setTimeout(function () {
                ssSet('shapur_teaser_shownAt', String(Date.now()));  // شروع پنجره‌ی ۲۰ ثانیه‌ای
                showTeaser(true, DURATION);
            }, DELAY);
            GESTURES.forEach(function (ev) {
                document.removeEventListener(ev, onFirstGesture);
            });
        }
        GESTURES.forEach(function (ev) {
            document.addEventListener(ev, onFirstGesture, { passive: true });
        });
    }
})();
