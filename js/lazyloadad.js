// Run LazyLoad Ad when document loaded.
(function($) { 
  $(document).ready(function() {
    $(Drupal.settings.lazyloadad).lazyLoadAd({
			forceLoad    : true,       // Ad is loaded even if not visible. Default is false.
			timeout        : 100,          // Timeout ad load
			syncAds: true,
			debug          : false,    // For debug use : draw colors border depends on load status
		});  
  });
})(jQuery); 