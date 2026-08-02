// انیمیشن نمایش کارت‌ها هنگام اسکرول
const cards = document.querySelectorAll(".card, .product");

const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.style.opacity="1";
            entry.target.style.transform="translateY(0)";
        }
    });
});

cards.forEach(card=>{
    card.style.opacity="0";
    card.style.transform="translateY(40px)";
    card.style.transition="0.7s";
    observer.observe(card);
});

// جستجوی محصولات
const search = document.querySelector(".search input");

search.addEventListener("keyup",function(){

    let value=this.value.toLowerCase();

    document.querySelectorAll(".card").forEach(item=>{

        let text=item.innerText.toLowerCase();

        if(text.indexOf(value)>-1){
            item.style.display="block";
        }else{
            item.style.display="none";
        }

    });

});

// دکمه‌های مشاهده محصول
document.querySelectorAll(".product button").forEach(btn=>{

    btn.addEventListener("click",()=>{

        alert("به زودی صفحه محصول اضافه می‌شود.");

    });

});

// افکت تغییر رنگ منو هنگام اسکرول
window.addEventListener("scroll",()=>{

    const nav=document.querySelector(".navbar");

    if(window.scrollY>50){

        nav.style.background="#000";

    }else{

        nav.style.background="#111";

    }

});
