/* Native, bounded motion. The entire page is readable before this script runs. */
(() => {
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=document.querySelector('.motion-toggle');
  const running=new Set();
  let paused=false;
  try{paused=sessionStorage.getItem('noetic-motion-paused')==='true';}catch{}
  const allowsMotion=()=>!preference.matches&&!paused&&!document.hidden;
  function scrollToContent(element){
    const header=document.querySelector('.site-header');
    const inset=(header?.getBoundingClientRect().height||0)+16;
    const top=element.id==='main'?0:Math.max(0,element.getBoundingClientRect().top+scrollY-inset);
    window.scrollTo({top,behavior:allowsMotion()?'smooth':'auto'});
  }
  function animate(element,frames,duration=480,delay=0){
    if(!element||!allowsMotion()||!element.animate)return;
    const animation=element.animate(frames,{duration,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});
    running.add(animation);
    animation.finished.then(()=>running.delete(animation)).catch(()=>running.delete(animation));
    return animation;
  }
  function syncMotion(){
    document.documentElement.classList.toggle('motion-paused',paused||preference.matches);
    if(toggle){toggle.hidden=preference.matches;toggle.textContent=paused?'Resume motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));}
    if(!allowsMotion()){
      for(const animation of running)animation.cancel();
      document.getAnimations?.().forEach(animation=>animation.cancel());
    }
  }
  if(toggle){toggle.hidden=false;toggle.addEventListener('click',()=>{paused=!paused;try{sessionStorage.setItem('noetic-motion-paused',String(paused));}catch{}syncMotion();});}
  preference.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',syncMotion);
  syncMotion();
  // Keep same-page navigation in the current document, with a consistent sticky-header offset.
  if(document.body.classList.contains('people-page'))document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
    const link=event.target.closest?.('a[href^="#"]');
    if(!link||(link.target&&link.target!=='_self')||!link.hash)return;
    let id;try{id=decodeURIComponent(link.hash.slice(1));}catch{return;}
    const destination=document.getElementById(id);
    if(!destination)return;
    event.preventDefault();
    if(location.hash!==link.hash)history.pushState(null,'',link.hash);
    const focusTarget=destination.querySelector('h1,h2')||destination;
    if(!focusTarget.hasAttribute('tabindex'))focusTarget.tabIndex=-1;
    focusTarget.focus({preventScroll:true});
    scrollToContent(destination);
  });
  const hero=document.querySelector('.story-hero');
  if(hero){
    animate(hero.querySelector('h1'),[{opacity:.45,transform:'translateY(16px)'},{opacity:1,transform:'none'}],680);
    animate(hero.querySelector('.main-photo'),[{clipPath:'inset(0 0 15% 0)',filter:'saturate(.72)'},{clipPath:'inset(0)',filter:'saturate(1)'}],780,70);
    animate(hero.querySelector('.detail-inset'),[{transform:'translateY(18px)',opacity:.4},{transform:'none',opacity:1}],560,180);
  }
  const portraitFigures=[...document.querySelectorAll('[data-person-figure]')];
  portraitFigures.forEach((figure,i)=>animate(figure.querySelector('img'),[{clipPath:'inset(0 0 16% 0)',opacity:.6},{clipPath:'inset(0)',opacity:1}],600,i*55));
  let queued=false;
  const identity=document.querySelector('.identity-line');
  const thought=document.querySelector('.brand-thought');
  const nav=[...document.querySelectorAll('.main-nav a[href^="#"]')];
  const sections=nav.map(link=>({link,section:document.querySelector(link.getAttribute('href'))})).filter(x=>x.section);
  sections.sort((a,b)=>a.section.compareDocumentPosition(b.section)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
  function drawReading(){
    queued=false;
    const distance=document.documentElement.scrollHeight-innerHeight;
    document.documentElement.style.setProperty('--read-progress',distance>0?Math.min(1,Math.max(0,scrollY/distance)):0);
    for(const [element,name] of [[identity,'--identity-progress'],[thought,'--thought-progress']]){
      if(!element)continue;
      const r=element.getBoundingClientRect();
      const progress=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight*.5)));
      element.style.setProperty(name,preference.matches||paused?1:progress);
    }
    let current=sections[0];
    for(const item of sections)if(item.link.getClientRects().length&&item.section.getBoundingClientRect().top<innerHeight*.4)current=item;
    for(const item of sections){if(item===current)item.link.setAttribute('aria-current','location');else item.link.removeAttribute('aria-current');}
  }
  function requestReading(){if(!queued){queued=true;requestAnimationFrame(drawReading);}}
  addEventListener('scroll',requestReading,{passive:true});
  addEventListener('resize',requestReading,{passive:true});
  drawReading();
  // One editorial reveal lower in the story; ordinary sections remain still.
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      animate(entry.target,[{clipPath:'inset(0 0 9% 0)'},{clipPath:'inset(0)'}],640);
      observer.unobserve(entry.target);
    }
  },{threshold:.23}):null;
  document.querySelectorAll('.detail-window,.people-work>.work-image').forEach(image=>observer?.observe(image));

  const detail=document.querySelector('.detail-window');
  if(detail){
    const controls=document.querySelector('.detail-controls');
    controls.hidden=false;
    controls.querySelectorAll('[data-detail]').forEach(button=>button.addEventListener('click',()=>{
      const close=button.dataset.detail==='close';
      detail.classList.toggle('is-close',close);
      controls.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      document.getElementById('detail-photo').alt=close?'Closer view of the neckline and striped pattern of the Noetic outfit':'Striped Noetic cardigan and long dress, shown as a complete outfit';
      document.getElementById('detail-caption').textContent=close?'A closer view of the neckline and the direction of the stripes.':'The full silhouette, with its flowing striped lines.';
    }));
  }
  const people=[
    ['Renad Nagro','Founder','Our founder, and part of the shared point of view behind Noetic’s refined, feminine and distinctive world.'],
    ['Ibrahim Mousli','Co-founder','Our co-founder, alongside Renad and the team in the story behind Noetic and its vision of confident elegance.'],
    ['Sara Nagro','Creative','The creative perspective behind the way the Noetic world is expressed, from its imagery to its visual character.'],
    ['Sara Alhamdan','Head of Fashion','A fashion perspective on the pieces, silhouettes and combinations that shape the collection.'],
    ['Rana Mohamed','Customer Support','A human connection when you want to ask about a piece, understand your order or find a little clarity.']
  ];
  const spotlight=document.getElementById('team-spotlight');
  if(spotlight){
    spotlight.hidden=false;
    document.querySelector('.portrait-hint').hidden=false;
    const buttons=[...document.querySelectorAll('[data-person]')];
    const ribbon=document.querySelector('.portrait-ribbon');
    // A fixed profile position keeps the portrait grid stable while people are selected.
    ribbon.after(spotlight);
    let scrollFrame=0;
    function choose(button,interactive=true){
      const index=Number(button.dataset.person);
      buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      const [name,role,copy]=people[index];
      document.getElementById('spotlight-name').textContent=name;
      document.getElementById('spotlight-role').textContent=role;
      document.getElementById('spotlight-copy').textContent=copy;
      const panel=spotlight.querySelector('.spotlight-content');
      panel.getAnimations().forEach(a=>a.cancel());
      if(interactive){
        animate(panel,[{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'none'}],260);
        spotlight.focus({preventScroll:true});
        cancelAnimationFrame(scrollFrame);
        scrollFrame=requestAnimationFrame(()=>scrollToContent(spotlight));
      }
    }
    buttons.forEach(button=>{button.disabled=false;button.addEventListener('click',()=>choose(button));});
    choose(buttons[0],false);
  }
  // Native keyboard FAQ behavior is preserved; only the newly opened answer moves.
  document.querySelectorAll('details').forEach(details=>details.addEventListener('toggle',()=>{
    if(details.open)animate(details.querySelector('p'),[{opacity:.45,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],220);
  }));
})();
