document.getElementById('c-send').addEventListener('click',function(){
    document.getElementById('c-msg').textContent='ممنون! این فرم نمونه‌ست و ارسال واقعی بعد از راه‌اندازی سرور فعال می‌شه.';
});
try{const c=JSON.parse(localStorage.getItem('shapur_cart'))||[];let n=0;c.forEach(i=>n+=i.qty);const b=document.querySelector('.cart-count');if(b)b.textContent=n.toLocaleString('fa-IR');}catch(e){}

// کلیک روی «پاسخ‌گویی ۲۴ ساعته» → چت پشتیبانی باز می‌شه
(function(){
    var a=document.getElementById('open-chat');
    if(!a) return;
    a.addEventListener('click',function(e){
        e.preventDefault();
        var box=document.getElementById('support-box'), btn=document.getElementById('support-btn');
        if(btn && box && !box.classList.contains('open')) btn.click();
        var inp=document.getElementById('support-input');
        if(inp) setTimeout(function(){ try{ inp.focus(); }catch(err){} }, 350);
    });
})();
