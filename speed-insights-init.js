// Initialize Vercel Speed Insights
// This script loads and initializes Speed Insights for the page
(function() {
  // Queue for tracking events before the script loads
  window.si = window.si || function() {
    (window.siq = window.siq || []).push(arguments);
  };

  // Load the Speed Insights script from Vercel
  var script = document.createElement('script');
  script.src = '/_vercel/speed-insights/script.js';
  script.defer = true;
  document.head.appendChild(script);
})();
