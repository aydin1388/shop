// ================================================
// موبایل: چون هاور نداره، سوالات متداول با لمس باز می‌شن
// ================================================
const isTouch = window.matchMedia('(hover: none)').matches;

if (isTouch) {
    document.querySelectorAll('.faq-item').forEach(function (item) {
        item.addEventListener('click', function () {
            item.classList.toggle('open');
        });
    });
}


// ================================================
// دکمه‌های چپ و راست اسلایدر دسته‌بندی
// ================================================
const track = document.getElementById('cat-track');

document.querySelectorAll('.slide-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const dir = Number(btn.dataset.dir);      // ۱ یا -۱
        track.scrollBy({ left: dir * 260, behavior: 'smooth' });
    });
});

// ------------------------------------------------
// کشیدن با موس روی خودِ دسته‌ها (drag-to-scroll)
// ------------------------------------------------
if (track) {
    let down = false, startX = 0, startLeft = 0, moved = false;

    track.addEventListener('pointerdown', function (e) {
        down = true; moved = false;
        startX = e.clientX;
        startLeft = track.scrollLeft;
        track.classList.add('dragging');
    });

    window.addEventListener('pointermove', function (e) {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        track.scrollLeft = startLeft - dx;   // محتوا دنبال موس میاد
    });

    function endDrag() {
        if (!down) return;
        down = false;
        track.classList.remove('dragging');
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // اگه کاربر کشید (نه فقط کلیک)، لینک باز نشه
    track.querySelectorAll('.cat-card').forEach(function (a) {
        a.addEventListener('click', function (e) {
            if (moved) { e.preventDefault(); }
        });
    });
}


// ================================================
// شمارش معکوس پیشنهاد ویژه تا پایان امروز
// ================================================
const cdH = document.getElementById('cd-h');
const cdM = document.getElementById('cd-m');
const cdS = document.getElementById('cd-s');

// تبدیل عدد به دو رقم فارسی، مثلاً 7 → ۰۷
function two(n) {
    return n.toLocaleString('fa-IR', { minimumIntegerDigits: 2, useGrouping: false });
}

function tick() {
    const now = new Date();

    // نیمه‌شب امشب
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    let left = Math.floor((end - now) / 1000);

    const h = Math.floor(left / 3600);
    const m = Math.floor((left % 3600) / 60);
    const s = left % 60;

    cdH.textContent = two(h);
    cdM.textContent = two(m);
    cdS.textContent = two(s);
}

if (cdH) {
    tick();
    setInterval(tick, 1000);
}


// ================================================
// سبد خرید: افزودن کالا و رفتن به صفحه‌ی سبد
// سبد توی حافظه‌ی مرورگر (localStorage) ذخیره می‌شه
// تا بین صفحه‌ها گم نشه.
// ================================================
const CART_KEY = 'shapur_cart';

// خواندن سبد از حافظه‌ی مرورگر
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];                 // اگه حافظه در دسترس نبود
    }
}

// ذخیره‌ی سبد
function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) { /* بی‌خیال */ }
}

// تبدیل متن قیمت فارسی به عدد: «۵۲۰,۰۰۰ تومان» → 520000
function parsePrice(text) {
    const fa = '۰۱۲۳۴۵۶۷۸۹';
    let out = '';
    for (const ch of text) {
        const i = fa.indexOf(ch);
        if (i > -1) out += i;
        else if (ch >= '0' && ch <= '9') out += ch;
    }
    return Number(out || 0);
}

// نمایش تعداد کالاها روی آیکون سبد
function updateCartCount() {
    const badge = document.querySelector('.cart-count');
    if (!badge) return;
    let n = 0;
    loadCart().forEach(function (item) { n += item.qty; });
    badge.textContent = n.toLocaleString('fa-IR');
}

// از روی هر کارت، لینک صفحه‌ی جزئیات رو می‌سازیم
function productUrl(card) {
    const name   = card.querySelector('h3').textContent.trim();
    const price  = parsePrice(card.querySelector('.price').textContent);
    const img    = (card.style.getPropertyValue('--img').match(/url\(['"]?([^'")]+)/) || [])[1] || '';
    const amtEl  = card.querySelector('.img-amount');
    const amount = amtEl ? amtEl.textContent.trim() : '';
    const q = new URLSearchParams({ name: name, price: price, img: img, amount: amount });
    return 'product.html?' + q.toString();
}

document.querySelectorAll('.card').forEach(function (card) {
    // کارت ناموجود: نه جزئیات، نه افزودن به سبد
    if (card.classList.contains('sold')) { return; }

    // کلیک روی عکس یا «مشاهده جزئیات» → صفحه‌ی جزئیات
    const media = card.querySelector('.card-img');
    if (media) {
        media.style.cursor = 'pointer';
        media.addEventListener('click', function () {
            var u = productUrl(card);
            if (window.shapurGo) { window.shapurGo(u); } else { window.location.href = u; }
        });
    }

    // دکمه‌ی خرید: بعد از افزودن، تبدیل می‌شه به شمارنده‌ی [− تعداد +]
    // تا مشتری همون‌جا تعداد رو کم/زیاد کنه (بدون رفتن به صفحه‌ی سبد)
    const row = card.querySelector('.buy-row');
    if (row) {
        const name  = card.querySelector('h3').textContent.trim();
        const price = parsePrice(row.querySelector('.price').textContent);
        const img   = card.style.getPropertyValue('--img');
        const linkEl = row.querySelector('.buy-link');

        function getQty() {
            const it = loadCart().find(function (i) { return i.name === name; });
            return it ? it.qty : 0;
        }
        function setQty(q) {
            const cart = loadCart();
            const idx = cart.findIndex(function (i) { return i.name === name; });
            if (q <= 0) { if (idx > -1) cart.splice(idx, 1); }
            else if (idx > -1) { cart[idx].qty = q; }
            else { cart.push({ name: name, price: price, qty: q, img: img }); }
            saveCart(cart);
            updateCartCount();
            renderBuy();
        }
        function renderBuy() {
            const q = getQty();
            if (q > 0) {
                row.classList.add('in-cart');
                linkEl.innerHTML =
                    '<span class="qbtn minus" aria-label="کم کردن">−</span>' +
                    '<span class="qnum">' + q.toLocaleString('fa-IR') + '</span>' +
                    '<span class="qbtn plus" aria-label="زیاد کردن">+</span>';
            } else {
                row.classList.remove('in-cart');
                linkEl.textContent = 'خرید';
            }
        }

        row.addEventListener('click', function (e) {
            const t = e.target;
            if (t.classList.contains('plus'))  { setQty(getQty() + 1); bumpCart(); return; }
            if (t.classList.contains('minus')) { setQty(getQty() - 1); return; }
            if (t.classList.contains('qnum'))  { return; }
            // اولین بار: افزودن به سبد
            if (getQty() === 0) {
                setQty(1);
                bumpCart();
                toast('به سبد اضافه شد ✓');
            }
        });

        renderBuy();
    }
});

// پیام کوتاهِ گوشه‌ی صفحه
function toast(text) {
    let t = document.querySelector('.toast');
    if (!t) {
        t = document.createElement('div');
        t.className = 'toast';
        document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2000);
}

// تکونِ کوچیک آیکون سبد برای جلب توجه
function bumpCart() {
    const c = document.querySelector('.cart-btn');
    if (!c) return;
    c.classList.remove('bump');
    void c.offsetWidth;          // ری‌ست انیمیشن
    c.classList.add('bump');
}

updateCartCount();



// ================================================
// شمارش آمار: وقتی بخش آمار دیده شد، عددها از صفر بالا میان
// (فقط یک بار و فقط چند ثانیه؛ بعدش هیچ کاری نمی‌کنه)
// ================================================
(function () {
    const nums = document.querySelectorAll('.stat .num[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;

    function run(el) {
        const target = Number(el.dataset.count);
        const pre = el.dataset.prefix || '';
        const suf = el.dataset.suffix || '';
        const start = performance.now();
        const dur = 1200;
        function frame(now) {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = pre + Math.round(target * eased).toLocaleString('fa-IR') + suf;
            if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
        });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
})();
