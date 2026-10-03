// ================================================
// صفحه‌ی جزئیات محصول
// اطلاعات محصول از پارامترهای آدرس (URL) خونده می‌شه
// ================================================
const CART_KEY = 'shapur_cart';

function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
}
function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
    catch (e) {}
}
function toFa(n) { return n.toLocaleString('fa-IR'); }

// خواندن پارامترها از آدرس صفحه
// مثلاً product.html?name=...&price=520000&img=...&amount=880 CP
const params = new URLSearchParams(location.search);
const pName   = params.get('name')   || 'محصول';
const pPrice  = Number(params.get('price') || 0);
const pImg    = params.get('img')    || '';
const pAmount = params.get('amount') || '';

let qty = 1;

// پر کردن صفحه
document.getElementById('pd-title').textContent = pName;
document.getElementById('pd-price').textContent = toFa(pPrice) + ' تومان';
document.getElementById('pd-amount').textContent = pAmount;
if (pImg) {
    document.getElementById('pd-media').style.setProperty('--img', "url('" + pImg + "')");
    document.getElementById('pd-media').classList.add('has-img');
}

// تعداد
const qtyEl = document.getElementById('pd-qty');
document.getElementById('pd-plus').addEventListener('click', function () {
    qty++; qtyEl.textContent = toFa(qty);
});
document.getElementById('pd-minus').addEventListener('click', function () {
    if (qty > 1) { qty--; qtyEl.textContent = toFa(qty); }
});

// شمارنده‌ی سبد در هدر
function refreshBadge() {
    const badge = document.querySelector('.cart-count');
    if (!badge) return;
    let n = 0;
    loadCart().forEach(function (i) { n += i.qty; });
    badge.textContent = toFa(n);
}

// افزودن به سبد (بدون رفتن به صفحه‌ی سبد؛ مشتری خودش می‌ره)
document.getElementById('pd-add').addEventListener('click', function () {
    const id = document.getElementById('pd-gameid').value.trim();
    const msg = document.getElementById('pd-msg');

    if (!id) { msg.textContent = 'اول آیدی عددی اکانتت رو وارد کن.'; return; }

    const cart = loadCart();
    const found = cart.find(function (item) { return item.name === pName; });
    if (found) found.qty += qty;
    else cart.push({ name: pName, price: pPrice, qty: qty, img: pImg ? "url('" + pImg + "')" : '' });

    saveCart(cart);
    refreshBadge();

    // پیام تأیید؛ به سبد نمی‌ره تا بتونه محصول دیگه‌ای هم اضافه کنه
    msg.textContent = 'به سبد اضافه شد ✓ — هر وقت خواستی از آیکون سبد بالای صفحه برو به سبد خرید.';

    // تکون کوچیک آیکون سبد
    const c = document.querySelector('.cart-btn');
    if (c) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
});

refreshBadge();
