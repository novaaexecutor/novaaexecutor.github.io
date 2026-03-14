// ── CURSOR ────────────────────────────────────────────────────
const cd=document.getElementById('cd'),cr=document.getElementById('cr');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cd.style.left=mx+'px';cd.style.top=my+'px'});
(function loop(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;cr.style.left=rx+'px';cr.style.top=ry+'px';requestAnimationFrame(loop)})();
document.querySelectorAll('a,button,.card,.fc,.hs').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('ch'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('ch'));
});

// ── CANVAS BG ─────────────────────────────────────────────────
const cv=document.getElementById('bgc');
if(cv){
  const ctx=cv.getContext('2d');
  let mouseX=-999,mouseY=-999;
  function rsz(){cv.width=innerWidth;cv.height=innerHeight}rsz();
  window.addEventListener('resize',rsz);
  document.addEventListener('mousemove',e=>{mouseX=e.clientX;mouseY=e.clientY});

  const ps=Array.from({length:70},()=>({
    x:Math.random()*innerWidth,y:Math.random()*innerHeight,
    vy:.18+Math.random()*.45,vx:(Math.random()-.5)*.12,
    r:.4+Math.random()*1.6,l:Math.random(),m:0
  }));
  ps.forEach(p=>p.m=p.l);

  function drw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    const cw=80,ch=80;
    for(let r=0;r<Math.ceil(cv.height/ch)+1;r++){
      for(let c=0;c<Math.ceil(cv.width/cw)+1;c++){
        const cx2=c*cw,cy2=r*ch;
        const d=Math.hypot(cx2+cw/2-mouseX,cy2+ch/2-mouseY);
        const p=Math.max(0,1-d/300);
        ctx.strokeStyle=`rgba(110,80,255,${.05+p*.28})`;
        ctx.lineWidth=1;ctx.strokeRect(cx2+.5,cy2+.5,cw,ch);
        if(p>.04){ctx.fillStyle=`rgba(110,80,255,${p*.08})`;ctx.fillRect(cx2+1,cy2+1,cw-2,ch-2)}
      }
    }
    const g=ctx.createRadialGradient(cv.width/2,cv.height/3,0,cv.width/2,cv.height/3,cv.width*.5);
    g.addColorStop(0,'rgba(110,80,255,0.07)');g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height);
    for(const p of ps){
      p.y-=p.vy;p.x+=p.vx;p.l-=.0018;
      if(p.l<=0||p.y<-4){p.x=Math.random()*cv.width;p.y=cv.height+4;p.l=Math.random();p.m=p.l}
      const a=Math.pow(p.l/p.m,1.4)*.5;
      ctx.globalAlpha=a;ctx.fillStyle='#a05aff';
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*a,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;requestAnimationFrame(drw);
  }
  drw();
}

// ── NAV SCROLL ────────────────────────────────────────────────
const nav=document.getElementById('nav');
if(nav){
  window.addEventListener('scroll',()=>nav.classList.toggle('sc',scrollY>50));
  // Mark active nav link by current page
  const page=location.pathname.split('/').pop()||'welcome.html';
  document.querySelectorAll('.nlinks a').forEach(a=>{
    const href=a.getAttribute('href');
    if(href===page||(!page&&href==='welcome.html'))a.classList.add('act');
  });
}

// ── REVEAL ON SCROLL ──────────────────────────────────────────
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target)}});
},{threshold:.1});
document.querySelectorAll('.rv,.rvl,.rvr').forEach((el,i)=>{
  el.style.transitionDelay=(i%4)*.08+'s';
  obs.observe(el);
});

// ── FEAT CARD MOUSE GLOW ─────────────────────────────────────
document.querySelectorAll('.fc').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
    card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
  });
});

// ── CHANGELOG ACCORDION ──────────────────────────────────────
document.querySelectorAll('.ceh').forEach(h=>{
  h.addEventListener('click',()=>{
    const e=h.closest('.ce'),isOpen=e.classList.contains('open');
    document.querySelectorAll('.ce.open').forEach(x=>x.classList.remove('open'));
    if(!isOpen)e.classList.add('open');
  });
});
