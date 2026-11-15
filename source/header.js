/* Original Noetic navigation with native menu/search behavior for the static preview. */
(() => {
  const header=document.querySelector('.store-header');
  if(!header)return;
  const desktop=matchMedia('(min-width:1280px)');
  const menu=header.querySelector('.main-menu__disclosure');
  const menuToggle=menu.querySelector('.main-menu__toggle');
  const panel=menu.querySelector('.main-menu__content');
  const category=menu.querySelector('.js-mega-nav');
  const categoryToggle=category.querySelector('summary');
  const nested=category.querySelector('.nested-level');
  const desktopMore=category.querySelector('.sidebar-submenu');
  const search=header.querySelector('[data-search-panel]');
  const input=search.querySelector('input[type="search"]');
  const reset=search.querySelector('.js-search-reset');
  const openSearch=[...header.querySelectorAll('.js-show-search')];
  const closeSearch=search.querySelector('.js-show-search-left');
  const assetSources=new Map([...header.querySelectorAll('img[data-inline-asset]')].map(img=>[img.dataset.inlineAsset,img.getAttribute('src')]));
  let outsideInert=new Map();
  let searchOpener=null;
  let menuWasOpen=false;
  document.documentElement.classList.add('has-store-header');
  [nested,desktopMore].forEach(element=>{element.classList.remove('hidden');element.hidden=true;});

  function updatePosition(){
    header.style.setProperty('--store-panel-top',Math.max(0,header.getBoundingClientRect().bottom)+'px');
  }
  function lockBackground(lock){
    if(lock&&!outsideInert.size){
      for(const element of document.body.children){
        if(element===header||element.contains(header)||['SCRIPT','STYLE'].includes(element.tagName))continue;
        outsideInert.set(element,element.inert);element.inert=true;
      }
    }else if(!lock&&outsideInert.size){
      for(const [element,inert] of outsideInert)element.inert=inert;
      outsideInert.clear();
    }
    document.documentElement.classList.toggle('store-panel-open',lock);
  }
  function syncLayers(){
    const menuOpen=!desktop.matches&&menu.open;
    header.classList.toggle('menu-is-open',menuOpen);
    menuToggle.setAttribute('aria-expanded',String(menuOpen));
    menuToggle.setAttribute('aria-label',menuOpen?'Close menu':'Menu');
    // The modal includes its visible close control and header shortcuts, not just the link list.
    if(menuOpen){header.setAttribute('role','dialog');header.setAttribute('aria-label','Menu');header.setAttribute('aria-modal','true');}
    else ['role','aria-label','aria-modal'].forEach(attribute=>header.removeAttribute(attribute));
    lockBackground(menuOpen);
    if(menuOpen&&!menuWasOpen)requestAnimationFrame(()=>{if(menu.open&&!desktop.matches)panel.querySelector('a[href]')?.focus({preventScroll:true});});
    menuWasOpen=menuOpen;
    const categoryOpen=!desktop.matches&&category.open;
    header.classList.toggle('category-is-open',categoryOpen);
    for(const child of menu.querySelector('.main-nav').children)child.inert=categoryOpen&&!child.contains(category);
    const nestedOpen=categoryOpen&&!nested.hidden;
    header.classList.toggle('nested-is-open',nestedOpen);
    for(const child of nested.parentElement.children)if(child!==nested)child.inert=nestedOpen;
    updatePosition();
  }
  function resetCategories(){category.open=false;nested.hidden=true;desktopMore.hidden=true;syncLayers();}
  function hideSearch(restore=false){
    search.hidden=true;header.classList.remove('search-is-open');
    for(const element of header.querySelector('.header__grid').children)element.inert=false;
    openSearch.forEach(trigger=>trigger.setAttribute('aria-expanded','false'));
    if(restore)searchOpener?.focus({preventScroll:true});
  }
  function hideMenu(restore=false){
    if(!desktop.matches)menu.open=false;
    resetCategories();
    if(restore)menuToggle.focus({preventScroll:true});
  }
  function setLayout(){
    const restoreSearch=search.contains(document.activeElement);
    const restoreMenu=menu.contains(document.activeElement);
    hideSearch();resetCategories();menu.open=desktop.matches;
    menuToggle.tabIndex=desktop.matches?-1:0;
    syncLayers();
    if(restoreSearch)searchOpener?.focus({preventScroll:true});
    else if(restoreMenu)(desktop.matches?categoryToggle:menuToggle).focus({preventScroll:true});
  }
  menu.addEventListener('toggle',()=>{if(!desktop.matches&&menu.open)hideSearch();syncLayers();});
  category.addEventListener('toggle',()=>{
    if(!category.open){nested.hidden=true;desktopMore.hidden=true;}
    syncLayers();
    if(category.open&&!desktop.matches)category.querySelector('.mega-nav-mobile .js-back')?.focus({preventScroll:true});
  });
  category.querySelector('.js-back')?.addEventListener('click',()=>{category.open=false;nested.hidden=true;syncLayers();categoryToggle.focus({preventScroll:true});});
  for(const trigger of category.querySelectorAll('a[data-title="More Categories"]'))trigger.addEventListener('click',event=>{
    event.preventDefault();
    if(desktop.matches){desktopMore.hidden=!desktopMore.hidden;}
    else {nested.hidden=false;syncLayers();nested.querySelector('button')?.focus({preventScroll:true});}
  });
  nested.querySelector('.js-nested-back')?.addEventListener('click',()=>{nested.hidden=true;syncLayers();category.querySelector('.js-open-nested')?.focus({preventScroll:true});});
  const preview=category.querySelector('.sidebar-collection-image');
  for(const link of category.querySelectorAll('.sidebar-link[data-collection-image]')){
    const show=()=>{const asset=link.dataset.collectionImage;if(asset){desktopMore.hidden=true;preview.src=assetSources.get(asset)||asset;}};
    link.addEventListener('pointerenter',show);link.addEventListener('focus',show);
  }
  for(const trigger of openSearch){
    trigger.setAttribute('aria-expanded','false');
    trigger.addEventListener('click',event=>{
      event.preventDefault();searchOpener=trigger;hideMenu();search.hidden=false;header.classList.add('search-is-open');
      for(const element of header.querySelector('.header__grid').children)if(element!==search)element.inert=true;
      openSearch.forEach(item=>item.setAttribute('aria-expanded','true'));
      input.focus({preventScroll:true});
    });
  }
  closeSearch.addEventListener('click',event=>{event.preventDefault();hideSearch(true);});
  input.addEventListener('input',()=>{reset.hidden=!input.value;});
  reset.addEventListener('click',()=>{input.value='';reset.hidden=true;input.focus({preventScroll:true});});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(!search.hidden){event.preventDefault();hideSearch(true);}
      else if(!desktop.matches&&menu.open){event.preventDefault();hideMenu(true);}
      else if(category.open){event.preventDefault();resetCategories();categoryToggle.focus({preventScroll:true});}
    }
    if(event.key==='Tab'&&!desktop.matches&&menu.open){
      const focusable=[...header.querySelectorAll('a[href],button,summary,input:not([type="hidden"])')].filter(element=>element.tabIndex>=0&&!element.closest('[inert]')&&element.getClientRects().length&&getComputedStyle(element).visibility!=='hidden');
      const first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  });
  document.addEventListener('click',event=>{if(desktop.matches&&category.open&&!category.contains(event.target)){resetCategories();}});
  desktop.addEventListener('change',setLayout);
  addEventListener('resize',updatePosition,{passive:true});
  addEventListener('scroll',updatePosition,{passive:true});
  setLayout();
})();
