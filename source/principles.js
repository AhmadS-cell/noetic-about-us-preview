(() => {
  const list=document.querySelector('.tab-list');
  if(!list)return;
  const tabs=[...list.querySelectorAll('[data-tab]')];
  const panels=[...document.querySelectorAll('[data-panel]')];
  const photo=document.getElementById('principle-photo');
  const images={refined:['assets/stripe-look.jpg','A considered Noetic striped knit silhouette'],feminine:['assets/ivory-look.jpg','A feminine ivory Noetic outfit with considered details'],distinctive:['assets/colour-look.jpg','An expressive, colourful Noetic knit cardigan']};
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('js-tabs');
  list.setAttribute('role','tablist');
  tabs.forEach(tab=>{tab.setAttribute('role','tab');tab.id=`${tab.dataset.tab}-tab`;});
  panels.forEach(panel=>{panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`${panel.dataset.panel}-tab`);panel.tabIndex=0;});
  const indicator=document.createElement('span');
  indicator.className='tab-indicator';indicator.setAttribute('aria-hidden','true');list.append(indicator);list.classList.add('has-indicator');
  let active=tabs[0];
  function moveIndicator(){const box=active.getBoundingClientRect(),parent=list.getBoundingClientRect();list.style.setProperty('--tab-x',`${box.left-parent.left}px`);list.style.setProperty('--tab-width',`${box.width}px`);}
  function select(tab,focus=false,animate=false){
    active=tab;
    tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;});
    panels.forEach(panel=>{panel.hidden=panel.dataset.panel!==tab.dataset.tab;panel.getAnimations().forEach(a=>a.cancel());});
    [photo.src,photo.alt]=images[tab.dataset.tab];
    photo.getAnimations().forEach(a=>a.cancel());
    moveIndicator();
    if(animate&&!preference.matches&&!document.documentElement.classList.contains('motion-paused')){
      panels.find(p=>!p.hidden).animate([{opacity:.35,transform:'translateX(8px)'},{opacity:1,transform:'none'}],{duration:230,easing:'cubic-bezier(.16,1,.3,1)'});
      photo.animate([{clipPath:'inset(0 7% 0 0)',opacity:.65},{clipPath:'inset(0)',opacity:1}],{duration:420,easing:'cubic-bezier(.16,1,.3,1)'});
    }
    if(focus)tab.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(tab,false,true));
    tab.addEventListener('keydown',event=>{
      if(event.ctrlKey||event.metaKey||event.altKey)return;
      let next;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();select(tabs[next],true,true);}
    });
  });
  addEventListener('resize',moveIndicator,{passive:true});
  document.fonts?.ready.then(moveIndicator);
  select(tabs[0]);
})();
