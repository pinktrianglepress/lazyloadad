// Run LazyLoad Ad when document loaded.
(function($) { 
  $(document).ready(function() {
    $(Drupal.settings.lazyloadad).lazyLoadAd({
			threshold     : 0,         // You can set threshold on how close to the edge ad should come before it is loaded. Default is 0 (when it is visible).
			forceLoad    : true,       // Ad is loaded even if not visible. Default is false.
			onLoad        : false,      // Callback function on call ad loading
			onComplete : false,      // Callback function when load is loaded
			timeout        : 5,          // Timeout ad load
			debug          : false,    // For debug use : draw colors border depends on load status
			xray             : false
		});  
  });
})(jQuery); 