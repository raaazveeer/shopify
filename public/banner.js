(function() {
  'use strict';
  
  // Check if banner already exists
  if (document.getElementById('shopify-banner-app')) {
    return;
  }
  
  // Create banner element
  const banner = document.createElement('div');
  banner.id = 'shopify-banner-app';
  banner.innerHTML = '🎉 Free Shipping on All Orders! 🎉';
  
  // Banner styles
  const styles = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
    color: 'white',
    textAlign: 'center',
    padding: '15px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    zIndex: '999999',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    letterSpacing: '0.5px'
  };
  
  // Apply styles
  Object.assign(banner.style, styles);
  
  // Add close button
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 24px;
    font-weight: bold;
    opacity: 0.8;
  `;
  
  closeBtn.onclick = function() {
    banner.style.display = 'none';
    // Adjust body padding
    document.body.style.paddingTop = '0px';
    // Store closed state
    localStorage.setItem('bannerClosed', 'true');
  };
  
  banner.appendChild(closeBtn);
  
  // Check if user previously closed banner
  if (localStorage.getItem('bannerClosed') === 'true') {
    return;
  }
  
  // Wait for DOM to be ready
  function addBanner() {
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Adjust body padding to prevent content overlap
    const bannerHeight = banner.offsetHeight;
    document.body.style.paddingTop = bannerHeight + 'px';
    
    // Add smooth transition
    banner.style.transform = 'translateY(-100%)';
    banner.style.transition = 'transform 0.5s ease-out';
    
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 100);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBanner);
  } else {
    addBanner();
  }
  
  // Reset banner state on new page loads (for SPA themes)
  window.addEventListener('popstate', function() {
    localStorage.removeItem('bannerClosed');
  });
  
})();