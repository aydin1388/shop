document.querySelectorAll('.dash-tab').forEach(function(t){
    t.addEventListener('click',function(){
        document.querySelectorAll('.dash-tab').forEach(x=>x.classList.remove('active'));
        document.querySelectorAll('.dash-panel').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById('tab-'+t.dataset.tab).classList.add('active');
    });
});
try{const c=JSON.parse(localStorage.getItem('shapur_cart'))||[];let n=0;c.forEach(i=>n+=i.qty);const b=document.querySelector('.cart-count');if(b)b.textContent=n.toLocaleString('fa-IR');}catch(e){}
