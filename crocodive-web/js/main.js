(function(){
var t=document.querySelector('.tg'),l=document.querySelector('.links');
if(t)t.addEventListener('click',function(){var o=l.classList.toggle('open');t.setAttribute('aria-expanded',o)});
var y=document.getElementById('y');if(y)y.textContent=new Date().getFullYear();
var q=new URLSearchParams(location.search).get('i'),s=document.querySelector('select[name="Interés"]');
if(q&&s)for(var i=0;i<s.options.length;i++)if(s.options[i].text===q)s.selectedIndex=i;
document.querySelectorAll('form[data-wa]').forEach(function(f){f.addEventListener('submit',function(e){
e.preventDefault();var m='Hola, soy de la web de Crocodive.';
new FormData(f).forEach(function(v,k){if(v)m+='\n'+k+': '+v});
window.open('https://wa.me/34643194499?text='+encodeURIComponent(m),'_blank','noopener');
var o=f.querySelector('.ok');if(o)o.textContent='Abriendo WhatsApp con tu solicitud…'})});
})();
