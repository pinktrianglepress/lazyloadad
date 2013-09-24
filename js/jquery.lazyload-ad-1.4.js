/**  
 *  Script lazy loader 0.5 - Modified By Web2ajaX
 *  Copyright (c) 2008 Bob Matsuoka
 *
 *  This program is free software; you can redistribute it and/or 
 *  modify it under the terms of the GNU General Public License
 *  as published by the Free Software Foundation; either version 2
 *  of the License, or (at your option) any later version.
 *
 *  Lazyloader updated for a jQuery implementation and appendChild in context
 *  not only in document.body
 *  Add script remove on callback to clean space.
 *
 */


var LazyLoader = {}; //namespace
LazyLoader.timer = {};  // contains timers for scripts
LazyLoader.scripts = [];  // contains called script references
(function ($) {
LazyLoader.load = function(url, context, callback) {
        /* Write logs if possible in console */
        function _debug() {
            if ( typeof console != 'undefined' ) { 
               var args = [] ;
               for ( var i = 0 ; i < arguments.length ; i++ ) args.push(arguments[i]) ;
               try { console.log('LazyLoadAD |', args) ; } catch(e) {} ;
            }
        }
      
        _debug("[LazyLoader]", "Starting to load URL ::", url);
        jQuery.globalWrap++;
        
        // handle object or path
        var classname = null;
        var properties = null;
        try {
        
            // make sure we only load once
            // note that we loaded already
            LazyLoader.scripts.push(url);
            var script = document.createElement("script");
            script.src = url;
            script.type = "text/javascript";
            context.get(0).appendChild(script);  // add script tag to head element
            _debug("[LazyLoader]", "Loading script: ", script);
            
            // was a callback requested
            if (callback) {    
                // test for onreadystatechange to trigger callback
                script.onreadystatechange = function () {
                    if (script.readyState == 'loaded' || script.readyState == 'complete') {
                        callback();
                        jQuery(script).remove() ;
                    }
                }                            
                // test for onload to trigger callback
                script.onload = function () {
                    _debug("[LazyLoader]", "Stopped loading URL ::", url);
                    jQuery.globalWrap--;
                    callback();
                    jQuery(script).remove() ;
                    return;
                }
                // safari doesn't support either onload or readystate, create a timer
                // only way to do this in safari
   	 			 try {
   				 	if (($.browser.webkit && !navigator.userAgent.match(/Version\/3/)) || $.browser.opera) { // sniff
   						LazyLoader.timer[url] = setInterval(function() {
   							if (/loaded|complete/.test(document.readyState)) {
   								clearInterval(LazyLoader.timer[url]);
     								callback(); // call the callback handler
    							}
    						}, 10);
    					}
    				 } catch(e) { }
            }
        } catch (e) {
            alert(e);
        }
} ;
}(jQuery));

/**
 *  Display an xray overlay to show Ad loading progression
 */
 (function ($) { 
var xrayAd = {

	div: null,
	viewport: null,
	thresold: 200,
	elements: [],
	adBlockCount:0,
	w: 160,
	h: 200,
	
	// -- Init XrayAd Div
	init: function() {
		this.div = jQuery('#xrayAd') ;
		if ( ! this.div ) {
			this.div = jQuery('<div>', {
				id: 'xrayAd',
				css: {
					position: 'fixed',
					top: 10,
					left: 10,
					width: this.w,
					height: this.h,
					zIndex: 10000,
					background: 'rgba(0,0,0, 0.5)'
				}
			}) ;
			this.div.appendTo(jQuery('body')) ;
		}
	},
	
	// -- Update viewport div
	viewportUpdate: function() {
		
		// Create div if not exists
		if ( ! this.viewport ) {
			this.viewport = jQuery('<div>', {
				id: 'xrayAdViewport',
				css: {
					position: 'absolute',
					width: this.w,
					height: 10,
					zIndex: 10001,
					background: 'rgba(255,255,255, 0.3)'
				}
			}) ;
			this.viewport.appendTo(this.div);
		}
		
		// Create div if not exists
		if ( ! this.viewThresoldTop ) {
			this.viewThresoldTop = jQuery('<div>', {
				id: 'xrayAdThresold',
				css: {
					position: 'absolute',
					width: this.w,
					height: 1,
					zIndex: 10002,
					background: 'rgba(255,0,0, 0.5)'
				}
			}) ;
			this.viewThresoldTop.appendTo(this.div);
			this.viewThresoldBottom = this.viewThresoldTop.clone().appendTo(this.div);
		}
		
		// Update div size and position
		this.bodyHeight = jQuery(document).height() ;
		this.bodyWidth = jQuery(window).width() ;
		var vH = (jQuery(window).height()/this.bodyHeight)*xrayAd.h,
			vT = (jQuery(window).scrollTop()/this.bodyHeight)*xrayAd.h ;
		this.viewport.css({ height: vH , top: vT }) ;
		
		// Update thresold size and position
		this.viewThresoldTop.css({
			top: ((jQuery(window).scrollTop()-xrayAd.thresold)/this.bodyHeight)*xrayAd.h
		}) ;
		this.viewThresoldBottom.css({
			top: ((jQuery(window).scrollTop()+xrayAd.thresold)/this.bodyHeight)*xrayAd.h + vH - 1
		}) ;
		
		// Refresh Ad blocks
		if ( this.div && this.div.length ) {
			var blocks = this.div.find('.xrayAdBlock') ;
			
			jQuery.each(blocks, function(key, val) {
				
				// Get block id 
				var xrayBlock = jQuery(this) ;
				var adBlock = jQuery(xrayAd.elements[key]) ;
				
				if ( xrayBlock.length && adBlock.length ) {
					// Get offset and size of the page ad
					var size = {} ;
					size.off = adBlock.offset() ;
					if ( size.off ) {
						size.top = (size.off.top/xrayAd.bodyHeight)*xrayAd.h ;
						size.left = (size.off.left/xrayAd.bodyWidth)*xrayAd.w ;
						size.w = (Math.max(adBlock.width(), 10)/xrayAd.bodyWidth)*xrayAd.w ;
						size.h = (Math.max(adBlock.height(), 10)/xrayAd.bodyHeight)*xrayAd.h ;
						
						// Get ad load status
						var bgColor = '#FF0071' ;
						bgColor = ( adBlock.data('loading') == 'true' ? 'orange' : bgColor ) ;
						bgColor = ( adBlock.data('loaded') == 'true' ? '#00FF00' : bgColor ) ;
						
						// Update xray Block
						xrayBlock.css({
							top:size.top,
							left:size.left,
							width:size.w,
							height: size.h,
							borderColor: bgColor
						}) ;
					}
				}
				
			}) ;
		}
	},
	
	// -- Load elemnts to xray
	load: function(el, thresold) {
		
		// Init thresold
		this.thresold = thresold || 0 ;
		
		// Init Overlay Div
		this.init() ;
		
		// Draw each elements on div
		var adBlock = jQuery('<div>', {
			'class': 'xrayAdBlock', 
			'css': {
				position: 'absolute',
				background: '#ffffff',
				border: '1px solid #FF0071',
				top: 0, left: 0, width: 0, height: 0,
				zIndex: 10003
			}
		});
		
		// Init elements
		jQuery.each(el, function() {
		
			// Create adBlock
			adBlock.clone().attr('xrayblock', 'xrayAdBlock_'+ (xrayAd.adBlockCount++)).appendTo(xrayAd.div) ;
			
			// Bind load and complete
			jQuery(this).bind('onCompleteXray',function() {
				xrayAd.viewportUpdate();
			}) ;
			jQuery(this).bind('onLoadXray',function() {
				xrayAd.viewportUpdate();
			}) ;
	
			// Push src
			xrayAd.elements.push(this);
		}) ;
		
		
		// Init viewport Div
		xrayAd.viewportUpdate() ;
		
		// Bind scroll
		jQuery(window).bind("scroll", function(event) {
			xrayAd.viewportUpdate() ;        
		});
	}


} ;
}(jQuery));

/* 
 * Parse HTML. 
 */

function parseHTML(html) {

   try {
      HTMLParser(html, {}, {
           validate: true
      });
   }
   catch (er)
   {
      if (er == "HTMLValidationError")
         return false;
   }

   return true;

}


/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
   ••  Project: jQuery LazyLoad For Advertisement                   ••
   ••  Author:  delarueguillaume@gmail.com                          ••
   ••  WebSite : http://www.web2ajax.fr/                            ••
   ••  Date:    2010                                                ••
   ••  Version: 1.4 (24 sept 2010)  : Add synchronous method to js  •• 
   ••  Version: 1.3 (20 sept 2010)  : OpenX Compatibility		    ••   
   ••  Version: 1.2 (30 march 2010) : Hight Imporvements of code    ••   
   ••  Version: 1.1 (25 march 2010) : Improve IE compatibility      ••
   ••  Version: 1.0 (24 march 2010)                                 ••
   •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••   
   
    Defer Advertisement loading and load only if the ad is in the visible part of
    the page like lazyLoad for pictures.
    -> Highly improve general page load
    -> Improve cpu load of visitor in case of displaying flash banners (only displayed if necessary)
    –> Compatibility with AdSense and many other advertisers
    -> Cross Browser suupprt (IE5.5+, Firefox, Opera, Chrome, Safari)
    
    A big thanks to Mika Tuupola for the Lazy load part
    -> http://www.appelsiini.net/projects/lazyload 
    
    Another big thanks to Thomas Aylott and his MooTools based document.write replacement
    -> http://SubtleGradient.com/
    
*/

(function($) { 

    $.lazyLoadAdRunning = false ;
    $.lazyLoadAdTimers = [] ;
    $.globalWrap = 0;
	
    $.fn.lazyLoadAd = function(options) {
        var settings = {
            threshold    : 0,
            failurelimit : 1,
            forceLoad	 : false,
            event        : "scroll",
            viewport	    : window,
            placeholder	 : false,		// Can specify a picture to replace media while loading
            onLoad		 : false,
            onComplete	 : false,
            timeout		 : 1500,
            debug		    : false,
            xray		    : false,
            syncAds      : false,
            directWrite  : true,
            immediate    : false      // All but scripts will be immediately processed
        };
                
        if(options) {
            $.extend(settings, options);
        }
        
        /* Write logs if possible in console */
        function _debug() {
            if ( typeof console != 'undefined' && settings.debug ) {	
            	var args = [] ;
            	for ( var i = 0 ; i < arguments.length ; i++ ) args.push(arguments[i]) ;
            	try { console.log('LazyLoadAD |', args) ; } catch(e) {} ;
           	}
        }
        
        /* If xray display requested */
        if ( settings.xray && ( typeof xrayAd == 'object' ) ) {
        	xrayAd.load(this, settings.threshold) ;
        }

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        var elements = this;
        $(settings.viewport).bind("checkLazyLoadAd", function() {
            var counter = 0;
            elements.each(function() {                	
            	if ( $.lazyLoadAdRunning ) {
            		if ( $.lazyLoadAdTimers['runTimeOut'] ) clearTimeout( $.lazyLoadAdTimers['runTimeOut'] ) ;
            		 $.lazyLoadAdTimers['runTimeOut'] = setTimeout(function() {
            			$(settings.viewport).trigger("checkLazyLoadAd") ; 
            		}, 300) ;
            		return false ;
            	} else if ( settings.forceLoad == true ) {
                  if (settings.syncAds && $.globalWrap > 0)
                  {
                     if ( $.lazyLoadAdTimers['runTimeOut'] ) clearTimeout( $.lazyLoadAdTimers['runTimeOut'] ) ;
                      $.lazyLoadAdTimers['runTimeOut'] = setTimeout(function() {
                        $(settings.viewport).trigger("checkLazyLoadAd") ;
                     }, 300) ;
                     return false ;
                  }
                  else
                  {
                     _debug('[checkLazyLoadAd before load]', 'GlobalWrap:', $.globalWrap);
                     $(this).trigger("load");                     
                  }
            	} else if (!$.belowthefold(this, settings) && !$.abovethetop(this, settings)) {
                  if (settings.syncAds && $.globalWrap > 0)
                  {
                     if ( $.lazyLoadAdTimers['runTimeOut'] ) clearTimeout( $.lazyLoadAdTimers['runTimeOut'] ) ;
                      $.lazyLoadAdTimers['runTimeOut'] = setTimeout(function() {
                        $(settings.viewport).trigger("checkLazyLoadAd") ;
                     }, 300) ;
                     return false ;
                  }
                  else
                  {
                     _debug('[checkLazyLoadAd before load]', 'GlobalWrap:', $.globalWrap);
                     $(this).trigger("load");                     
                  }
               } else {
                  if (counter++ > settings.failurelimit) {
                     return false;
                  }
               }
        	});
        	
        	/* Remove element from array so it is not looped next time. */
        	var temp = $.grep(elements, function(element) {
        	    return ! (($(element).data('loaded') == 'true') ? true : false) ;
        	});
        	elements = $(temp);
        }) ; 
        
        if ("scroll" == settings.event) {
            $(settings.viewport).bind("scroll", function(event) {
            	if ( elements.length == 0 ) return false;
               	$(settings.viewport).trigger("checkLazyLoadAd") ;                
            });
        }
        
        
        // -- Bind each element
        this.each(function(_index, _value) {
        
            var self = $(this);
            
            /* Save original only if it is not defined in HTML. */
            if (undefined == self.attr("original")) {
                self.attr("original", self.attr("src"));     
            }
            
            /* Test if element is loaded */
            self.isLoaded = function() { return ((self.data('loaded') == 'true') ? true : false)  ; } ;
            
            /* Trigger Debug Display */
            self.bind("debug", function(e, status) {
            
            	status = status || 'start' ;
            	
            	// -- Trigger xRay if possible
            	if ( settings.xray ) { 
            		if ( status == 'start') self.trigger('onLoadXray') ; 
            		else if ( status == 'error' ) self.trigger('onErrorXray') ; 
            		else if ( status == 'complete' ) self.trigger('onCompleteXray') ;   
            	}
            	
            	// -- Change border color of ad frame
	            if ( settings.debug ) {
	            	if ( status == 'start') self.css({border: '3px solid orange'}) ;
	            	else if ( status == 'error' ) self.css({border: '3px solid red'}) ;
	            	else if ( status == 'complete' ) self.css({border: '3px solid green'}) ;     
            	}
            	
            });
            
            /* On ad Load successful */
            self.one('onComplete', function() {
            	
            	_debug("[onComplete]", "---> lazyLoadComplete") ;
            	
            	// -- Remove original attr
            	$(self).removeAttr("original") ;
            	
            	// -- Set as loaded
            	$.lazyLoadAdRunning = false ;
            	self.data('loaded', 'true') ;
            	
            	// -- Mark debug
            	self.trigger('debug', 'complete') ;
            	
            	if ( typeof settings.onComplete == 'function') {
            		try { settings.onComplete() } catch(e) {} ;
            	}
            }) ;
            
            
            /* Launch the makina !! */
            self.stack = [] ;
            self.makinaBlock = false ;
            self.bind('makina_go', function() {
            
            	if ( self.makinaBlock ) return false ;
            	
            	if ( self.stack.length > 0 ) {

            		var el = self.stack.shift() ;
					
   					var wrapAd = self.find('.wrapAd') ;
   					if ( ! wrapAd.length ) {
   						wrapAd = $('<div class="wrapAd"></div>').clone() ;
   						wrapAd.appendTo(self) ;
   					}
					
   					var wrap = $('<div>').clone().appendTo(wrapAd) ;
					
            		if ( typeof el == 'string' ) {
            			wrap.replaceWith(el);
                     $.globalWrap--;
            		} else if ( typeof el == 'object' ) {
            			if ( el.is('script') ) {
            			
            				// -- Load JS and block makina until script is loaded
            				if ( el.attr('src') ) {
            				   //_debug('[Makina]', 'GlobalWrap:', $.globalWrap);
	            				_debug('[Makina]', 'Loading JS --> ', el.attr('src') ) ;
	            				//self.makinaBlock = true ;
	            				LazyLoader.load(el.attr('src'), self, function(){
	            				    self.makinaBlock = false ;
	            				    _debug('[Makina]', 'Loading JS ++> ', el.attr('src') ) ;
	            				    self.trigger('makina_go') ;
	            				});
            				}
            				
            				// -- Write JS code in wrapper
            				else {
            					wrap.replaceWith(el);
            				}
            			} else {
            				wrap.replaceWith(el);
            			}	
            			
                     $.globalWrap--;
            		}
            		
            		self.trigger('makina_go') ;
            	} else {
            		if ( $.lazyLoadAdTimers.loadJS ) clearTimeout($.lazyLoadAdTimers.loadJS) ;
            		$.lazyLoadAdTimers.loadJS = setTimeout(function() {
            			self.trigger('onComplete') ;	
            		}, settings.timeout) ;
            	}
            
            }) ;
            
            /* Write directly in DOM : tag is html valid */
            self.bind('docWrite_direct', function(e, html) {
               self.numWrappers-- ;
               _debug("[docWrite_direct]", "Fragment Write : ", self.numWrappers, html);
               
            	var el = $(html) ;
            	$.globalWrap += el.length;
               $.globalWrap--;
            	_debug("[docWrite_direct]", "Fragment Write : ", el, el.length) ;
            	
            	$.each(el, function() { self.stack.push($(this)) ; }) ;
            	self.trigger('makina_go') ;
            }) ;
            
            /* Direct write of ads. */
            function docWrite_direct_immediate(html) {
               self.numWrappers-- ;
               _debug("[docWrite_direct immediate]", "Fragment Write : ", self.numWrappers, html);
               
               var el = $(html) ;
               $.globalWrap += el.length;
               $.globalWrap--;
               _debug("[docWrite_direct immediate]", "Fragment Write : ", el, el.length) ;

               var wrapAd = self.find('.wrapAd') ;
               if ( ! wrapAd.length ) {
                  wrapAd = $('<div class="wrapAd"></div>').clone() ;
                  wrapAd.appendTo(self) ;
               }
                            
               $.each(el, function() {
                     var wrap = $('<div>').clone().appendTo(wrapAd) ;
                     wrap.replaceWith($(this));
                     $.globalWrap--;
               }) ;               
            } ;
            
            /* Write directly in DOM : tag is html valid */
            self.bind('docWrite_delayed', function(e, html) {
            	self.numWrappers-- ;
            	
            	if ( self.numWrappers == 0 ) {
                  $.globalWrap++;
            	}
            	
               $.globalWrap--;
            	_debug("[docWrite_delayed]", "Fragment Write append : ", self.numWrappers, html);						
            	self.docHtmlCurrent += html;
               
            	if ( self.numWrappers == 0 ) {
            		html = self.docHtmlCurrent ;
            		self.docHtmlCurrent = '' ;
            		setTimeout(function() {
                     var el = $(html) ;
                     $.globalWrap += el.length;
                     $.globalWrap--;
                     _debug("[docWrite_delayed]", "Fragment append :", el, el.length);
                     $.each(el, function() { self.stack.push($(this)) ; }) ;
            			//self.stack.push(html) ;
            			self.docHtmlCurrent = ''; 
            			self.trigger('makina_go') ;
            		}, 0);
            	}
            }) ;

            /* Write directly in DOM : tag is html valid */
            function docWrite_delayed_immediate(html) {
               self.numWrappers-- ;
               $.globalWrap--;
               
               self.docHtmlCurrent += html;
               _debug("[docWrite_delayed immediate]", "Fragment Write append : ", self.numWrappers, html, self.docHtmlCurrent);                  
               
               if ( self.numWrappers == 0 && parseHTML(self.docHtmlCurrent) ) {
                  html = self.docHtmlCurrent ;
                  self.docHtmlCurrent = '' ;
                  
                  var el = $(html) ;
                  $.globalWrap += el.length;
                  
                  _debug("[docWrite_delayed immediate]", "Fragment append :", el, el.length);

                  var wrapAd = self.find('.wrapAd') ;
                  if ( ! wrapAd.length ) {
                     wrapAd = $('<div class="wrapAd"></div>').clone() ;
                     wrapAd.appendTo(self) ;
                  }
                               
                  $.each(el, function() {
                     if ( typeof $(this) == 'object' && $(this).is('script') && this.src ) {
                         _debug('[docWrite_delayed immediate]', "Loading URL", this.src);
                         
                         var script = document.createElement("script");
                         script.src = this.src;
                         script.type = "text/javascript";
                         self.get(0).appendChild(script);  // add script tag to head element
                         script.onload = function () {
                             _debug("[docWrite_delayed immediate]", "Stopped loading URL ::", this.src);
                             $.globalWrap--;
                             if (settings.callback) {    
                                settings.callback();
                             }
                             return;
                         }
                     }
                     else {
                        var wrap = $('<div>').clone().appendTo(wrapAd) ;
                        wrap.replaceWith($(this));
                        $.globalWrap--;
                     }
                  }) ;
                  
               }
               
            } ;          
            
            /* Overload the default document.write */
            self.numWrappers = 0 ;
            self.docHtmlCurrent = '' ;
            self.bind('docWrite_overload', function() {
               _debug('[docWrite_overload]', 'Overloading document.write ... : ') ;

            	// -- Overload default document.write function
            	document._writeOriginal = document.write;
            	document.write = document.writeln = function(){
            		var args = arguments, id = null ;
            		var html=''; for(var i=0;i<args.length;i++) html+=args[i] ;

                  _debug("[docWrite_overload]", "Triggered on ::", html);
                  $.globalWrap++;
 
            		// -- Check if html to write is valid
            		var testHTML = '',
            			directWrite = false ;
            			
            		try { 
            			testHTML = $(html) ; 
            			directWrite = ( ( testHTML.is('div') || testHTML.is('script') ) ? true : false ) ;
            		} catch(e) { } ;
            		
            		self.history[self.fragmentId] = self.history[self.fragmentId] || {} ;
            		if ( self.history[self.fragmentId][html] == undefined ) {
            			self.history[self.fragmentId][html] = true ;
            			if ( settings.directWrite && directWrite ) {
                        self.numWrappers++ ;
                        if (settings.immediate == true)
                        {
                           docWrite_direct_immediate(html);
                        }
                        else {
               				self.trigger('docWrite_direct', html) ;
               		   }
            			} else {
            				self.numWrappers++ ;
                        if (settings.immediate == true)
                        {
                           docWrite_delayed_immediate(html);
                        }
                        else {
               				setTimeout(function() {
   	            				self.trigger('docWrite_delayed', html) ;
   	            			}, 0) ;
   	            	   }
            				
            			}
            		} 
            	};
            }) ;

            
            /* Eval Script into <code> tags */
            self.bind('evalCode', function() {
	            var scripts = [],
	            	script,
	            	regexp = /<code[^>]*>([\s\S]*?)<\/code>/gi;
	            	
	            while ((script = regexp.exec(self.html()))) {
	            	var _s = script[1] ;
	            	_s = _s.replace('<!--//<![CDATA[', '').replace('//]]>-->','').replace('<!--', '').replace('//-->', '') ;
	            	_s = _s.replace(/\&gt\;/g,'>').replace(/\&lt\;/g,'<') ;
	            	scripts.push($.trim(_s));
	            }
	            
	            // -- Eval param code before calling ad script					
	            try {
	            	scripts = ( scripts.length ? scripts.join('\n') : '' ) ;
	            	_debug('[evalCode]', 'Script to eval : ', scripts) ;
	            	if ( scripts != '' ) eval(scripts); 
	            } catch(e) { } ;    
            });
            
            
            /* Load a JS and wait for callback */
            self.bind('loadJS', function(e, js2load) {
            	
            	var callback = null, script = null ;
            	if ( js2load.src ) {
            		callback = js2load.callback || null ;
            		js2load = js2load.src ;
            	}
            	
            	// Add an anticache 
            	if ( js2load.indexOf('?') == -1 ) {
            		js2load += '?_='+ (new Date().getTime()) ;
            	} else {
            		js2load += '&_='+ (new Date().getTime()) ;
            	}
            	
            	_debug('[loadJS]', 'start URL :: ', js2load) ;

               // Request JS
            	LazyLoader.load(js2load, self, function(){
            	    _debug('[loadJS]', 'close URL :: ', js2load) ;
            	    if ( callback ) {
            	    	callback() ;
            	    } else {
            	    	$.lazyLoadAdTimers.loadJS = setTimeout(function() {
            	    		self.trigger('onComplete') ;	
            	    	}, settings.timeout) ;
            	    }
            	});
            	
            }) ;
            
            
            /* When appear is triggered load ad. */
            self.one("load", function() {
            	
            	// Detect if element is already loaded
                if (! self.isLoaded() ) {
                
                	// Lock other adverts load
                	$.lazyLoadAdRunning = true ;
                	
                	// Have to load the current ad...
                	self.data('loading', 'true') ;
                	self.trigger('debug', 'start') ;
                	
                	// Get original source to load
                	var srcOriginal = $(self).attr("original") ;
                	
                	// Set fragmentId
                	self.history = {} ;
                	
                	// -- Call script and let's dance
                	_debug('[load]', '===================  Lazy Load Ad CALL ===================') ;
                	_debug('[load]', 'Context : ', self ) ;	
                	
                	// Bind document.write overload
                	self.trigger('docWrite_overload') ;
                	
                	// Eval code
                	self.trigger('evalCode') ;
                	
                	// Eval attached script
                	if ( srcOriginal ) {
                     _debug('[load]', 'GlobalWrap:', $.globalWrap);
                		self.trigger('loadJS', srcOriginal) ;
                	}
                	
                };
            });
            
            

            /* When wanted event is triggered load ad */
            /* by triggering appear.                              */
            if ("scroll" != settings.event) {
                self.bind(settings.event, function(event) {
                    if (!self.isLoaded()) {
                        self.trigger("load");
                    }
                });
            }
        });
        
        /* Force initial check if images should appear. */
        $(settings.viewport).trigger('checkLazyLoadAd');
        
        return this;

    };
    
    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */
    
    $.belowthefold = function(element, settings) {
        if (settings.viewport === undefined || settings.viewport === window) {
            var fold = $(window).height() + $(window).scrollTop();
        } else {
            var fold = $(settings.viewport).offset().top + $(settings.viewport).height();
        }
        return fold <= $(element).offset().top - settings.threshold;
    };
        
    $.abovethetop = function(element, settings) {
        if (settings.viewport === undefined || settings.viewport === window) {
            var fold = $(window).scrollTop();
        } else {
            var fold = $(settings.viewport).offset().top;
        }
        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };
    
})(jQuery);