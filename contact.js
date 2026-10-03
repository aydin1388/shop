document.getElementById('c-send').addEventListener('click',function(){
    document.getElementById('c-msg').textContent='ممنون! این فرم نمونه‌ست و ارسال واقعی بعد از راه‌اندازی سرور فعال می‌شه.';
});
try{const c=JSON.parse(localStorage.getItem('shapur_cart'))||[];let n=0;c.forEach(i=>n+=i.qty);const b=document.querySelector('.cart-count');if(b)b.textContent=n.toLocaleString('fa-IR');}catch(e){}
