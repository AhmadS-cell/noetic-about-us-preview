/* The original store footer uses native disclosures on mobile and open columns on desktop. */
(() => {
  const footer=document.querySelector('.store-footer');
  if(!footer)return;
  const desktop=matchMedia('(min-width:769px)');
  function sync(){
    footer.querySelectorAll('details').forEach(details=>{
      const summary=details.querySelector('summary');
      if(desktop.matches){details.open=true;summary.tabIndex=-1;}
      else summary.removeAttribute('tabindex');
    });
  }
  desktop.addEventListener('change',sync);
  sync();
  // Newsletter submits directly to the original Shopify form, with native validation.
  // No local storage, subscription request, success message or third-party script is added here.
})();
