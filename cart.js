// ================================================
// صفحه‌ی سبد خرید
// ================================================
const CART_KEY = 'shapur_cart';

function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
}

function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
    catch (e) { /* بی‌خیال */ }
}

function toFa(n) { return n.toLocaleString('fa-IR'); }

const listEl  = document.getElementById('cart-list');
const countEl = document.getElementById('sum-count');
const totalEl = document.getElementById('sum-total');
const badgeEl = document.querySelector('.cart-count');
const msgEl   = document.getElementById('cart-msg');

// ساختن دوباره‌ی صفحه از روی داده‌های سبد
function render() {
    const cart = loadCart();

    if (cart.length === 0) {
        listEl.innerHTML = '<p class="cart-empty">سبد خریدت خالیه. <a href="index.html">رفتن به فروشگاه</a></p>';
    } else {
        listEl.innerHTML = cart.map(function (item, i) {
            return '<div class="cart-row">' +
                       '<div class="ci-img" style="--img: ' + (item.img || 'none') + '"></div>' +
                       '<div class="ci-main">' +
                           '<h4>' + item.name + '</h4>' +
                           '<span class="ci-unit">قیمت واحد: ' + toFa(item.price) + ' تومان</span>' +
                       '</div>' +
                       '<div class="qty">' +
                           '<button data-act="minus" data-i="' + i + '">−</button>' +
                           '<b>' + toFa(item.qty) + '</b>' +
                           '<button data-act="plus" data-i="' + i + '">+</button>' +
                       '</div>' +
                       '<div class="ci-sum">' + toFa(item.price * item.qty) + ' تومان</div>' +
                       '<button class="ci-remove" data-act="remove" data-i="' + i + '">حذف</button>' +
                   '</div>';
        }).join('');
    }

    let total = 0, count = 0;
    cart.forEach(function (item) {
        total += item.price * item.qty;
        count += item.qty;
    });

    countEl.textContent = toFa(count);
    totalEl.textContent = toFa(total) + ' تومان';
    if (badgeEl) badgeEl.textContent = toFa(count);
}

// دکمه‌های کم و زیاد و حذف
listEl.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const cart = loadCart();
    const i = Number(btn.dataset.i);

    if (btn.dataset.act === 'plus')   cart[i].qty += 1;
    if (btn.dataset.act === 'minus')  cart[i].qty -= 1;
    if (btn.dataset.act === 'remove') cart[i].qty = 0;

    if (cart[i].qty <= 0) cart.splice(i, 1);

    saveCart(cart);
    render();
});

// ثبت سفارش
document.getElementById('checkout').addEventListener('click', function () {
    const cart = loadCart();
    const id   = document.getElementById('game-id').value.trim();
    const tel  = document.getElementById('phone').value.trim();

    if (cart.length === 0) { msgEl.textContent = 'سبد خالیه.'; return; }
    if (!id)  { msgEl.textContent = 'آیدی عددی اکانتت رو وارد کن.'; return; }
    if (!tel) { msgEl.textContent = 'شماره تماست رو وارد کن.'; return; }

    msgEl.textContent = 'اطلاعات کامله. درگاه پرداخت هنوز وصل نشده؛ این بخش بعد از راه‌اندازی سرور فعال می‌شه.';
});

render();
