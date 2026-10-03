// ================================================
// صفحه‌ی ورود / ثبت‌نام (فقط ظاهری)
// جابه‌جایی بین دو تب
// ================================================
const tabs  = document.querySelectorAll('.auth-tab');
const forms = {
    login:    document.getElementById('form-login'),
    register: document.getElementById('form-register')
};

tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        // برداشتن حالت فعال از همه
        tabs.forEach(function (t) { t.classList.remove('active'); });
        Object.values(forms).forEach(function (f) { f.classList.remove('active'); });

        // فعال کردن تب و فرم انتخاب‌شده
        tab.classList.add('active');
        forms[tab.dataset.tab].classList.add('active');
    });
});

// لینک‌های «ثبت‌نام کن» / «وارد شو» زیر فرم‌ها هم تب رو عوض می‌کنن
document.querySelectorAll('.auth-switch').forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = link.dataset.go;            // login یا register
        document.querySelector('.auth-tab[data-tab="' + target + '"]').click();
    });
});

// دکمه‌ها فعلاً فقط پیام می‌دن
document.querySelectorAll('.auth-submit').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const msg = document.getElementById('auth-msg') ||
                    btn.parentElement.querySelector('.cart-note');
        msg.textContent = 'ورود و ثبت‌نام واقعی بعد از راه‌اندازی سرور فعال می‌شه.';
    });
});

// شمارنده‌ی سبد در هدر
(function () {
    const badge = document.querySelector('.cart-count');
    if (!badge) return;
    try {
        const cart = JSON.parse(localStorage.getItem('shapur_cart')) || [];
        let n = 0; cart.forEach(function (i) { n += i.qty; });
        badge.textContent = n.toLocaleString('fa-IR');
    } catch (e) {}
})();
