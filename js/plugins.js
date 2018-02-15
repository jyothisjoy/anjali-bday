/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
// 
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
// 
// About: Release History
// 
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
// 
// Topic: Note for non-jQuery users
// 
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
// 
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function(window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),
    
    // Internal method reference.
    jq_throttle;
  
  // Method: jQuery.throttle
  // 
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  // 
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  // 
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // > 
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  // 
  // Usage:
  // 
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, throttled, function.
  
  $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,
      
      // Keep track of the last time `callback` was executed.
      last_exec = 0;
    
    // `no_trailing` defaults to falsy.
    if ( typeof no_trailing !== 'boolean' ) {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }
    
    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;
      
      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply( that, args );
      };
      
      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };
      
      if ( debounce_mode && !timeout_id ) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }
      
      // Clear any existing timeout.
      timeout_id && clearTimeout( timeout_id );
      
      if ( debounce_mode === undefined && elapsed > delay ) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();
        
      } else if ( no_trailing !== true ) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        // 
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        // 
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
      }
    };
    
    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ( $.guid ) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }
    
    // Return the wrapper function.
    return wrapper;
  };
  
  // Method: jQuery.debounce
  // 
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  // 
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  // 
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // > 
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  // 
  // Usage:
  // 
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, debounced, function.
  
  $.debounce = function( delay, at_begin, callback ) {
    return callback === undefined
      ? jq_throttle( delay, at_begin, false )
      : jq_throttle( delay, callback, at_begin !== false );
  };
  
})(this);


/*!
 * Impress Core Support Utilities
 * 
 * Copyright 2012 digital-telepathy
 */

var Impress = {
    // Computed prefixes
    computedPrefixes: ['Moz', 'ms', 'O', 'Webkit', 'Khtml'],
    
    // Cached elements
    elements: {},

    namespace: "impress",
    
    // Browser prefixes
    prefixes: ['moz', 'ms', 'o', 'webkit'],
    
    // Browser support
    support: {}
};

( function( $, window, undefined ) {

    // Check to see if the current browser supports CSS transitions
    Impress.supports = function( support ) {
        var $html = this.elements.html = this.elements.html || $('html');
        var supported = false;

        if( !this.support[support] ) {
            switch(support) {
                case "cssanimations":
                    var s = this.elements.body[0].style;
                    var p = 'transition';
                    if(typeof s[p] == 'string') { supported = true; }

                    // Tests for vendor specific prop
                    p = p.charAt(0).toUpperCase() + p.substr(1);
                    for(var i=0; i<this.computedPrefixes.length; i++) {
                        if(typeof s[this.computedPrefixes[i] + p] == 'string') { supported = true; }
                    }
                break;

                case "csstransforms3d":
                    var el = document.createElement('p'),
                    has3d,
                    transforms = {
                        'webkitTransform':'-webkit-transform',
                        'OTransform':'-o-transform',
                        'msTransform':'-ms-transform',
                        'MozTransform':'-moz-transform',
                        'transform':'transform'
                    };
                 
                    // Add it to the body to get the computed style
                    document.body.appendChild(el);
                 
                    for(var t in transforms){
                        if( el.style[t] !== undefined ){
                            el.style[t] = 'translate3d(1px,1px,1px)';
                            has3d = has3d || window.getComputedStyle(el).getPropertyValue(transforms[t]);
                        }
                    }
                 
                    document.body.removeChild(el);
                 
                    supported = (has3d !== undefined && has3d.length > 0 && has3d !== "none");
                break;
            }

            this.support[support] = supported;
        }

        return this.support[support];
    };
    
    /**
     * Get jQuery extended elements
     * 
     * Iterates through an Object of selectors and retrieves the jQuery
     * extended objects of those selectors. Returns an Object of those
     * jQuery extended objects for caching.
     * 
     * @param {Object} selectors Object of selectors to retrieve and cache
     * @param {mixed} context jQuery extended Object, selector or DOM element to use as a context
     * @param {Boolean} cached Use Impress global cache or always query new 
     * 
     * @return {Object} Object of jQuery extended elements
     */
    Impress.getElements = function( selectors, context, cached ) {
        var cached = ( cached || false );
        var elements = {};
        var self = this;
        var $context = $( context || 'html' );
        
        $.each( selectors, function( key, value ) {
            if( $.inArray( key, [window, 'body', 'html'] ) != -1 ) elements[key] = self.elements[key];

            if( $.isPlainObject( value ) ) {
                elements[key] = elements[key] || {};
                $.each( value, function( key2, value2 ) {
                    elements[key][key2] = ( cached && self.elements[value2] ) ? self.elements[value2] : self.elements[value2] = $( value2, $context );
                } );
            } else {
                elements[key] = ( cached && self.elements[value] ) ? self.elements[value] : self.elements[value] = $( value, $context );
            }
        } );
        
        return elements;
    };
    
    /**
     * Get an element's CSS transition properties
     * 
     * Uses getComputedStyle() commands to read an element's transition properties
     * and returns an object with applied values.
     * 
     * @param {Object} el DOM element, selector or jQuery Object
     * 
     * @return {Object}  
     */
    Impress.getTransition = function( el, includePrefixes ) {
        if( !window.getComputedStyle ) return {};

        var $el = $( el );
        var includePrefixes = includePrefixes || false;
        var computed = window.getComputedStyle( $el[0] );
        var properties = {
            transitionProperty: 'transition-property', 
            transitionDuration: 'transition-duration', 
            transitionDelay: 'transition-delay', 
            transitionTimingFunction: 'transition-timing-function'
        };
        
        var css = {};
        for( property in properties ) {
            css[properties[property]] = computed[property] || "";
            
            if( includePrefixes ) {
                for( var p in this.computedPrefixes ) {
                    if( this.prefixes[p] ) {
                        var prefixKey = this.computedPrefixes[p] + property.charAt(0).toUpperCase() + property.substr(1);
                        css["-" + this.prefixes[p] + "-" + properties[property]] = computed[prefixKey];
                    }
                }
            }
        }
        
        return css;
    };

    /**
     * Build an object of browser prefixed CSS3 properties
     * 
     * Pass in the un-prefixed CSS3 property to apply (e.x. transition) and the
     * value to set to build an object of CSS properties that can be applied with
     * the jQuery .css() command.
     * 
     * @param {Object} properties Un-prefixed CSS3 property to set
     * @param {Boolean} prefixValue Set to boolean(true) to prefix the value as well
     * 
     * @return {Object} Object of prefixed CSS properties to be applied with $.css()
     */
    Impress.prefixCSS = function( properties, prefixValue ) {
        var prefixValue = prefixValue || false;

        if( ie && ie < 9 ) return properties;
        
        for( var property in properties ) {
            var value = properties[property];
            
            for( var p in this.prefixes ) {
                valuePrefix = prefixValue ? '-' + this.prefixes[p] + '-' : "";
                properties['-' + this.prefixes[p] + '-' + property] = valuePrefix + value;
            }
        }
        
        return properties;
    };
    
    /**
     * Smooth Scroll utility function
     * 
     * @param mixed $el Element to scroll to. Can be either a selector or DOM element.
     * @param speed integer Optional speed in milliseconds to scroll at (defaults to 500)
     * @param offset integer Optional offset for scroll
     * @param delay integer Optional delay in milliseconds for the scrollTo effect (useful when coupling with other actions, defaults to 0)
     */
    Impress.scrollTo = function( $el, speed, offset, delay ){
        // Set a speed if it isn't specified
        speed = speed || 500;
        // Set a delay if it isn't specified (default is 0)
        delay = delay || 0;

        // Numeric positioning
        var top = $el;

        // Handle DOM element calculated offsets
        if( isNaN($el) ) {
            top = $($el).offset().top;
        }

        top = top + ( parseInt( offset, 10 ) || 0 );
            
        $( 'html, body' ).delay( delay ).animate( {
            scrollTop: top
        }, {
            duration: speed,
            easing: "swing",
            complete: function() {
                // Enforce window scroll
                window.scrollTo( 0, top );
            }
        } );
    };

    /**
     * Monitor resize of the window and trigger browser mode change events
     */
    Impress.resize = function() {
        this.previousMode = this.currentMode;

        if( Modernizr.mq('only screen and (max-width: 767px)') ) {
            this.currentMode = 'mobile';
        } else {
            this.currentMode = 'desktop';
        }

        if( this.previousMode != this.currentMode ) {
            this.elements.window.triggerHandler( this.namespace + ":changed-responsive-mode", [this.currentMode] );
        }
    };


    $(function(){
        // Set some basic elements
        Impress.elements.window = $(window);
        Impress.elements.body = $('body');
        Impress.elements.html = $('html');
        
        Impress.elements.window.on('resize', $.throttle( 50, function(){
            Impress.resize();
        }));
    })

} )( jQuery, window, null );


// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());






/**
 * fullPage 2.0.7
 * https://github.com/alvarotrigo/fullPage.js
 * MIT licensed
 *
 * Copyright (C) 2013 alvarotrigo.com - A project by Alvaro Trigo
 */
(function(a){a.fn.fullpage=function(c){function $(b){var e=b.originalEvent;c.autoScrolling&&b.preventDefault();if(!L(b.target)&&(b=a(".section.active"),!t&&!s))if(e=M(e),w=e.y,A=e.x,b.find(".slides").length&&Math.abs(B-A)>Math.abs(x-w))Math.abs(B-A)>a(window).width()/100*c.touchSensitivity&&(B>A?a.fn.fullpage.moveSlideRight():a.fn.fullpage.moveSlideLeft());else if(c.autoScrolling&&(e=b.find(".slides").length?b.find(".slide.active").find(".scrollable"):b.find(".scrollable"),Math.abs(x-w)>a(window).height()/
100*c.touchSensitivity))if(x>w)if(0<e.length)if(C("bottom",e))a.fn.fullpage.moveSectionDown();else return!0;else a.fn.fullpage.moveSectionDown();else if(w>x)if(0<e.length)if(C("top",e))a.fn.fullpage.moveSectionUp();else return!0;else a.fn.fullpage.moveSectionUp()}function L(b,e){e=e||0;var d=a(b).parent();return e<c.normalScrollElementTouchThreshold&&d.is(c.normalScrollElements)?!0:e==c.normalScrollElementTouchThreshold?!1:L(d,++e)}function aa(b){b=M(b.originalEvent);x=b.y;B=b.x}function n(b){if(c.autoScrolling){b=
window.event||b;b=Math.max(-1,Math.min(1,b.wheelDelta||-b.deltaY||-b.detail));var e;e=a(".section.active");if(!t)if(e=e.find(".slides").length?e.find(".slide.active").find(".scrollable"):e.find(".scrollable"),0>b)if(0<e.length)if(C("bottom",e))a.fn.fullpage.moveSectionDown();else return!0;else a.fn.fullpage.moveSectionDown();else if(0<e.length)if(C("top",e))a.fn.fullpage.moveSectionUp();else return!0;else a.fn.fullpage.moveSectionUp();return!1}}function N(b){var e=a(".section.active").find(".slides");
if(e.length&&!s){var d=e.find(".slide.active"),f=null,f="prev"===b?d.prev(".slide"):d.next(".slide");if(!f.length){if(!c.loopHorizontal)return;f="prev"===b?d.siblings(":last"):d.siblings(":first")}s=!0;p(e,f)}}function h(b,e,d){var f={},g=b.position();if("undefined"!==typeof g){var g=g.top,l=H(b),q=b.data("anchor"),y=b.index(".section"),k=b.find(".slide.active"),r=a(".section.active"),s=r.index(".section")+1,E=D;if(k.length)var n=k.data("anchor"),p=k.index();if(c.autoScrolling&&c.continuousVertical&&
"undefined"!==typeof d&&(!d&&"up"==l||d&&"down"==l)){d?a(".section.active").before(r.nextAll(".section")):a(".section.active").after(r.prevAll(".section").get().reverse());z(a(".section.active").position().top);var h=r,g=b.position(),g=g.top,l=H(b)}b.addClass("active").siblings().removeClass("active");t=!0;"undefined"!==typeof q&&O(p,n,q);c.autoScrolling?(f.top=-g,b=u.selector):(f.scrollTop=g,b="html, body");var m=function(){h&&h.length&&(d?a(".section:first").before(h):a(".section:last").after(h),
z(a(".section.active").position().top))};c.css3&&c.autoScrolling?(a.isFunction(c.onLeave)&&!E&&c.onLeave.call(this,s,y+1,l),P("translate3d(0px, -"+g+"px, 0px)",!0),setTimeout(function(){m();a.isFunction(c.afterLoad)&&!E&&c.afterLoad.call(this,q,y+1);setTimeout(function(){t=!1;a.isFunction(e)&&e.call(this)},Q)},c.scrollingSpeed)):(a.isFunction(c.onLeave)&&!E&&c.onLeave.call(this,s,y+1,l),a(b).animate(f,c.scrollingSpeed,c.easing,function(){m();a.isFunction(c.afterLoad)&&!E&&c.afterLoad.call(this,q,
y+1);setTimeout(function(){t=!1;a.isFunction(e)&&e.call(this)},Q)}));v=q;c.autoScrolling&&(R(q),S(q,y))}}function p(b,e){var d=e.position(),f=b.find(".slidesContainer").parent(),g=e.index(),l=b.closest(".section"),q=l.index(".section"),h=l.data("anchor"),k=l.find(".fullPage-slidesNav"),r=e.data("anchor"),m=D;if(c.onSlideLeave){var n=l.find(".slide.active").index(),p;p=n==g?"none":n>g?"left":"right";m||a.isFunction(c.onSlideLeave)&&c.onSlideLeave.call(this,h,q+1,n,p)}e.addClass("active").siblings().removeClass("active");
"undefined"===typeof r&&(r=g);l.hasClass("active")&&(c.loopHorizontal||(l.find(".controlArrow.prev").toggle(0!=g),l.find(".controlArrow.next").toggle(!e.is(":last-child"))),O(g,r,h));c.css3?(d="translate3d(-"+d.left+"px, 0px, 0px)",b.find(".slidesContainer").toggleClass("easing",0<c.scrollingSpeed).css(T(d)),setTimeout(function(){m||a.isFunction(c.afterSlideLoad)&&c.afterSlideLoad.call(this,h,q+1,r,g);s=!1},c.scrollingSpeed,c.easing)):f.animate({scrollLeft:d.left},c.scrollingSpeed,c.easing,function(){m||
a.isFunction(c.afterSlideLoad)&&c.afterSlideLoad.call(this,h,q+1,r,g);s=!1});k.find(".active").removeClass("active");k.find("li").eq(g).find("a").addClass("active")}function U(){D=!0;var b=a(window).width();k=a(window).height();c.resize&&ba(k,b);a(".section").each(function(){parseInt(a(this).css("padding-bottom"));parseInt(a(this).css("padding-top"));c.verticalCentered&&a(this).find(".tableCell").css("height",V(a(this))+"px");a(this).css("height",k+"px");if(c.scrollOverflow){var b=a(this).find(".slide");
b.length?b.each(function(){F(a(this))}):F(a(this))}b=a(this).find(".slides");b.length&&p(b,b.find(".slide.active"))});a(".section.active").position();b=a(".section.active");b.index(".section")&&h(b);D=!1;a.isFunction(c.afterResize)&&c.afterResize.call(this)}function ba(b,c){var d=825,f=b;825>b||900>c?(900>c&&(f=c,d=900),d=(100*f/d).toFixed(2),a("body").css("font-size",d+"%")):a("body").css("font-size","100%")}function S(b,e){c.navigation&&(a("#fullPage-nav").find(".active").removeClass("active"),
b?a("#fullPage-nav").find('a[href="#'+b+'"]').addClass("active"):a("#fullPage-nav").find("li").eq(e).find("a").addClass("active"))}function R(b){c.menu&&(a(c.menu).find(".active").removeClass("active"),a(c.menu).find('[data-menuanchor="'+b+'"]').addClass("active"))}function C(b,a){if("top"===b)return!a.scrollTop();if("bottom"===b)return a.scrollTop()+a.innerHeight()>=a[0].scrollHeight}function H(b){var c=a(".section.active").index(".section");b=b.index(".section");return c>b?"up":"down"}function F(b){b.css("overflow",
"hidden");var a=b.closest(".section"),d=b.find(".scrollable");if(d.length)var f=b.find(".scrollable").get(0).scrollHeight;else f=b.get(0).scrollHeight,c.verticalCentered&&(f=b.find(".tableCell").get(0).scrollHeight);a=k-parseInt(a.css("padding-bottom"))-parseInt(a.css("padding-top"));f>a?d.length?d.css("height",a+"px").parent().css("height",a+"px"):(c.verticalCentered?b.find(".tableCell").wrapInner('<div class="scrollable" />'):b.wrapInner('<div class="scrollable" />'),b.find(".scrollable").slimScroll({height:a+
"px",size:"10px",alwaysVisible:!0})):(b.find(".scrollable").children().first().unwrap().unwrap(),b.find(".slimScrollBar").remove(),b.find(".slimScrollRail").remove());b.css("overflow","")}function W(b){b.addClass("table").wrapInner('<div class="tableCell" style="height:'+V(b)+'px;" />')}function V(b){var a=k;if(c.paddingTop||c.paddingBottom)a=b,a.hasClass("section")||(a=b.closest(".section")),b=parseInt(a.css("padding-top"))+parseInt(a.css("padding-bottom")),a=k-b;return a}function P(b,a){u.toggleClass("easing",
a);u.css(T(b))}function I(b,c){"undefined"===typeof c&&(c=0);var d=isNaN(b)?a('[data-anchor="'+b+'"]'):a(".section").eq(b-1);b===v||d.hasClass("active")?X(d,c):h(d,function(){X(d,c)})}function X(b,a){if("undefined"!=typeof a){var c=b.find(".slides"),f=c.find('[data-anchor="'+a+'"]');f.length||(f=c.find(".slide").eq(a));f.length&&p(c,f)}}function ca(b,a){b.append('<div class="fullPage-slidesNav"><ul></ul></div>');var d=b.find(".fullPage-slidesNav");d.addClass(c.slidesNavPosition);for(var f=0;f<a;f++)d.find("ul").append('<li><a href="#"><span></span></a></li>');
d.css("margin-left","-"+d.width()/2+"px");d.find("li").first().find("a").addClass("active")}function O(b,a,d){var f="";c.anchors.length&&(b?("undefined"!==typeof d&&(f=d),"undefined"===typeof a&&(a=b),J=a,location.hash=f+"/"+a):("undefined"!==typeof b&&(J=a),location.hash=d))}function da(){var b=document.createElement("p"),a,c={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.insertBefore(b,
null);for(var f in c)void 0!==b.style[f]&&(b.style[f]="translate3d(1px,1px,1px)",a=window.getComputedStyle(b).getPropertyValue(c[f]));document.body.removeChild(b);return void 0!==a&&0<a.length&&"none"!==a}function M(b){var a=[];window.navigator.msPointerEnabled?(a.y=b.pageY,a.x=b.pageX):(a.y=b.touches[0].pageY,a.x=b.touches[0].pageX);return a}function z(a){c.css3?P("translate3d(0px, -"+a+"px, 0px)",!1):u.css("top",-a)}function T(a){return{"-webkit-transform":a,"-moz-transform":a,"-ms-transform":a,
transform:a}}c=a.extend({verticalCentered:!0,resize:!0,slidesColor:[],anchors:[],scrollingSpeed:700,easing:"easeInQuart",menu:!1,navigation:!1,navigationPosition:"right",navigationColor:"#000",navigationTooltips:[],slidesNavigation:!1,slidesNavPosition:"bottom",controlArrowColor:"#fff",loopBottom:!1,loopTop:!1,loopHorizontal:!0,autoScrolling:!0,scrollOverflow:!1,css3:!1,paddingTop:0,paddingBottom:0,fixedElements:null,normalScrollElements:null,keyboardScrolling:!0,touchSensitivity:5,continuousVertical:!1,
animateAnchor:!0,normalScrollElementTouchThreshold:5,afterLoad:null,onLeave:null,afterRender:null,afterResize:null,afterSlideLoad:null,onSlideLeave:null},c);c.continuousVertical&&(c.loopTop||c.loopBottom)&&(c.continuousVertical=!1,console&&console.log&&console.log("Option loopTop/loopBottom is mutually exclusive with continuousVertical; continuousVertical disabled"));var Q=600;a.fn.fullpage.setAutoScrolling=function(b){c.autoScrolling=b;b=a(".section.active");c.autoScrolling?(a("html, body").css({overflow:"hidden",
height:"100%"}),b.length&&z(b.position().top)):(a("html, body").css({overflow:"auto",height:"auto"}),z(0),a("html, body").scrollTop(b.position().top))};a.fn.fullpage.setScrollingSpeed=function(a){c.scrollingSpeed=a};a.fn.fullpage.setMouseWheelScrolling=function(a){a?document.addEventListener?(document.addEventListener("mousewheel",n,!1),document.addEventListener("wheel",n,!1)):document.attachEvent("onmousewheel",n):document.addEventListener?(document.removeEventListener("mousewheel",n,!1),document.removeEventListener("wheel",
n,!1)):document.detachEvent("onmousewheel",n)};a.fn.fullpage.setAllowScrolling=function(b){b?(a.fn.fullpage.setMouseWheelScrolling(!0),G&&(a(document).off("touchstart MSPointerDown").on("touchstart MSPointerDown",aa),a(document).off("touchmove MSPointerMove").on("touchmove MSPointerMove",$))):(a.fn.fullpage.setMouseWheelScrolling(!1),G&&(a(document).off("touchstart MSPointerDown"),a(document).off("touchmove MSPointerMove")))};a.fn.fullpage.setKeyboardScrolling=function(a){c.keyboardScrolling=a};var s=
!1,G=navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/),u=a(this),k=a(window).height(),t=!1,D=!1,v,J;a.fn.fullpage.setAllowScrolling(!0);c.css3&&(c.css3=da());a(this).length?u.css({height:"100%",position:"relative","-ms-touch-action":"none"}):(a("body").wrapInner('<div id="superContainer" />'),u=a("#superContainer"));if(c.navigation){a("body").append('<div id="fullPage-nav"><ul></ul></div>');var m=a("#fullPage-nav");m.css("color",c.navigationColor);m.addClass(c.navigationPosition)}a(".section").each(function(b){var e=
a(this),d=a(this).find(".slide"),f=d.length;b||0!==a(".section.active").length||a(this).addClass("active");a(this).css("height",k+"px");(c.paddingTop||c.paddingBottom)&&a(this).css("padding",c.paddingTop+" 0 "+c.paddingBottom+" 0");"undefined"!==typeof c.slidesColor[b]&&a(this).css("background-color",c.slidesColor[b]);"undefined"!==typeof c.anchors[b]&&a(this).attr("data-anchor",c.anchors[b]);if(c.navigation){var g="";c.anchors.length&&(g=c.anchors[b]);b=c.navigationTooltips[b];"undefined"===typeof b&&
(b="");m.find("ul").append('<li data-tooltip="'+b+'"><a href="#'+g+'"><span></span></a></li>')}if(0<f){var g=100*f,h=100/f;d.wrapAll('<div class="slidesContainer" />');d.parent().wrap('<div class="slides" />');a(this).find(".slidesContainer").css("width",g+"%");a(this).find(".slides").after('<div class="controlArrow prev"></div><div class="controlArrow next"></div>');"#fff"!=c.controlArrowColor&&(a(this).find(".controlArrow.next").css("border-color","transparent transparent transparent "+c.controlArrowColor),
a(this).find(".controlArrow.prev").css("border-color","transparent "+c.controlArrowColor+" transparent transparent"));c.loopHorizontal||a(this).find(".controlArrow.prev").hide();c.slidesNavigation&&ca(a(this),f);d.each(function(b){b||0!=e.find(".slide.active").length||a(this).addClass("active");a(this).css("width",h+"%");c.verticalCentered&&W(a(this))})}else c.verticalCentered&&W(a(this))}).promise().done(function(){a.fn.fullpage.setAutoScrolling(c.autoScrolling);var b=a(".section.active").find(".slide.active");
if(b.length&&(0!=a(".section.active").index(".section")||0==a(".section.active").index(".section")&&0!=b.index())){var e=c.scrollingSpeed;a.fn.fullpage.setScrollingSpeed(0);p(a(".section.active").find(".slides"),b);a.fn.fullpage.setScrollingSpeed(e)}c.fixedElements&&c.css3&&a(c.fixedElements).appendTo("body");c.navigation&&(m.css("margin-top","-"+m.height()/2+"px"),m.find("li").eq(a(".section.active").index(".section")).find("a").addClass("active"));c.menu&&c.css3&&a(c.menu).appendTo("body");if(c.scrollOverflow)a(window).on("load",
function(){a(".section").each(function(){var b=a(this).find(".slide");b.length?b.each(function(){F(a(this))}):F(a(this))});a.isFunction(c.afterRender)&&c.afterRender.call(this)});else a.isFunction(c.afterRender)&&c.afterRender.call(this);b=window.location.hash.replace("#","").split("http://www.dtelepathy.com/")[0];b.length&&(e=a('[data-anchor="'+b+'"]'),!c.animateAnchor&&e.length&&(z(e.position().top),a.isFunction(c.afterLoad)&&c.afterLoad.call(this,b,e.index(".section")+1),e.addClass("active").siblings().removeClass("active")));
a(window).on("load",function(){var a=window.location.hash.replace("#","").split("http://www.dtelepathy.com/"),b=a[0],a=a[1];b&&I(b,a)})});var Y,K=!1;a(window).scroll(function(b){if(!c.autoScrolling){var e=a(window).scrollTop();b=a(".section").map(function(){if(a(this).offset().top<e+100)return a(this)});b=b[b.length-1];if(!b.hasClass("active")){var d=a(".section.active").index(".section")+1;K=!0;var f=H(b);b.addClass("active").siblings().removeClass("active");var g=b.data("anchor");a.isFunction(c.onLeave)&&c.onLeave.call(this,
d,b.index(".section")+1,f);a.isFunction(c.afterLoad)&&c.afterLoad.call(this,g,b.index(".section")+1);R(g);S(g,0);c.anchors.length&&!t&&(v=g,location.hash=g);clearTimeout(Y);Y=setTimeout(function(){K=!1},100)}}});var x=0,B=0,w=0,A=0;a.fn.fullpage.moveSectionUp=function(){var b=a(".section.active").prev(".section");b.length||!c.loopTop&&!c.continuousVertical||(b=a(".section").last());b.length&&h(b,null,!0)};a.fn.fullpage.moveSectionDown=function(){var b=a(".section.active").next(".section");b.length||
!c.loopBottom&&!c.continuousVertical||(b=a(".section").first());(0<b.length||!b.length&&(c.loopBottom||c.continuousVertical))&&h(b,null,!1)};a.fn.fullpage.moveTo=function(b,c){var d="",d=isNaN(b)?a('[data-anchor="'+b+'"]'):a(".section").eq(b-1);"undefined"!==typeof c?I(b,c):0<d.length&&h(d)};a.fn.fullpage.moveSlideRight=function(){N("next")};a.fn.fullpage.moveSlideLeft=function(){N("prev")};a(window).on("hashchange",function(){if(!K){var a=window.location.hash.replace("#","").split("http://www.dtelepathy.com/"),c=a[0],a=
a[1],d="undefined"===typeof v,f="undefined"===typeof v&&"undefined"===typeof a;(c&&c!==v&&!d||f||!s&&J!=a)&&I(c,a)}});a(document).keydown(function(b){if(c.keyboardScrolling&&!t)switch(b.which){case 38:case 33:a.fn.fullpage.moveSectionUp();break;case 40:case 34:a.fn.fullpage.moveSectionDown();break;case 37:a.fn.fullpage.moveSlideLeft();break;case 39:a.fn.fullpage.moveSlideRight()}});a(document).on("click","#fullPage-nav a",function(b){b.preventDefault();b=a(this).parent().index();h(a(".section").eq(b))});
a(document).on({mouseenter:function(){var b=a(this).data("tooltip");a('<div class="fullPage-tooltip '+c.navigationPosition+'">'+b+"</div>").hide().appendTo(a(this)).fadeIn(200)},mouseleave:function(){a(this).find(".fullPage-tooltip").fadeOut().remove()}},"#fullPage-nav li");c.normalScrollElements&&(a(document).on("mouseover",c.normalScrollElements,function(){a.fn.fullpage.setMouseWheelScrolling(!1)}),a(document).on("mouseout",c.normalScrollElements,function(){a.fn.fullpage.setMouseWheelScrolling(!0)}));
a(".section").on("click",".controlArrow",function(){a(this).hasClass("prev")?a.fn.fullpage.moveSlideLeft():a.fn.fullpage.moveSlideRight()});a(".section").on("click",".toSlide",function(b){b.preventDefault();b=a(this).closest(".section").find(".slides");b.find(".slide.active");var c=null,c=b.find(".slide").eq(a(this).data("index")-1);0<c.length&&p(b,c)});if(!G){var Z;a(window).resize(function(){clearTimeout(Z);Z=setTimeout(U,500)})}var ea="onorientationchange"in window?"orientationchange":"resize";
a(window).bind(ea,function(){G&&U()});a(document).on("click",".fullPage-slidesNav a",function(b){b.preventDefault();b=a(this).closest(".section").find(".slides");var c=b.find(".slide").eq(a(this).closest("li").index());p(b,c)})}})(jQuery);