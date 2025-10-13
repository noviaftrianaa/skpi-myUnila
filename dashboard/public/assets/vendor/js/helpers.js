<<<<<<< Updated upstream
!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var i in n)("object"==typeof exports?exports:e)[i]=n[i]}}(self,(function(){return function(){"use strict";var e={d:function(t,n){for(var i in n)e.o(n,i)&&!e.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:n[i]})},o:function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};function n(e){return a(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||r(e)||o()}function i(e,t){return a(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var i,o,r,s,a=[],l=!0,u=!1;try{if(r=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;l=!1}else for(;!(l=(i=r.call(n)).done)&&(a.push(i.value),a.length!==t);l=!0);}catch(e){u=!0,o=e}finally{try{if(!l&&null!=n.return&&(s=n.return(),Object(s)!==s))return}finally{if(u)throw o}}return a}}(e,t)||r(e,t)||o()}function o(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function r(e,t){if(e){if("string"==typeof e)return s(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?s(e,t):void 0}}function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=Array(t);n<t;n++)i[n]=e[n];return i}function a(e){if(Array.isArray(e))return e}e.r(t),e.d(t,{Helpers:function(){return d}});var l=["transitionend","webkitTransitionEnd","oTransitionEnd"],u=["transition","MozTransition","webkitTransition","WebkitTransition","OTransition"];function c(e){throw new Error("Parameter required".concat(e?": `".concat(e,"`"):""))}var d={ROOT_EL:"undefined"!=typeof window?document.documentElement:null,LAYOUT_BREAKPOINT:1200,RESIZE_DELAY:200,menuPsScroll:null,mainMenu:null,_curStyle:null,_styleEl:null,_resizeTimeout:null,_resizeCallback:null,_transitionCallback:null,_transitionCallbackTimeout:null,_listeners:[],_initialized:!1,_autoUpdate:!1,_lastWindowHeight:0,_scrollToActive:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:500,n=this.getLayoutMenu();if(n){var i=n.querySelector("li.menu-item.active:not(.open)");if(i){var o=this.getLayoutMenu().querySelector(".menu-inner");if("string"==typeof i&&(i=document.querySelector(i)),"number"!=typeof i&&(i=i.getBoundingClientRect().top+o.scrollTop),i<parseInt(2*o.clientHeight/3,10))return;var r=o.scrollTop,s=i-r-parseInt(o.clientHeight/2,10),a=+new Date;if(!0===e){var l=function(){var e,n,i,u=+new Date-a,c=(e=u,n=r,i=s,(e/=t/2)<1?i/2*e*e+n:-i/2*((e-=1)*(e-2)-1)+n);o.scrollTop=c,u<t?requestAnimationFrame(l):o.scrollTop=s};l()}else o.scrollTop=s}}},_swipeIn:function(e,t){var n=window.Hammer;if(void 0!==n&&"string"==typeof e){var i=document.querySelector(e);if(i)new n(i).on("panright",t)}},_swipeOut:function(e,t){var n=window.Hammer;void 0!==n&&"string"==typeof e&&setTimeout((function(){var i=document.querySelector(e);if(i){var o=new n(i);o.get("pan").set({direction:n.DIRECTION_ALL,threshold:250}),o.on("panleft",t)}}),500)},_overlayTap:function(e,t){var n=window.Hammer;if(void 0!==n&&"string"==typeof e){var i=document.querySelector(e);if(i)new n(i).on("tap",t)}},_addClass:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.ROOT_EL;void 0!==t.length?t.forEach((function(t){e.split(" ").forEach((function(e){return t.classList.add(e)}))})):e.split(" ").forEach((function(e){return t.classList.add(e)}))},_removeClass:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.ROOT_EL;void 0!==t.length?t.forEach((function(t){e.split(" ").forEach((function(e){return t.classList.remove(e)}))})):e.split(" ").forEach((function(e){return t.classList.remove(e)}))},_toggleClass:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.ROOT_EL,t=arguments.length>1?arguments[1]:void 0,n=arguments.length>2?arguments[2]:void 0;e.classList.contains(t)?e.classList.replace(t,n):e.classList.replace(n,t)},_hasClass:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.ROOT_EL,n=!1;return e.split(" ").forEach((function(e){t.classList.contains(e)&&(n=!0)})),n},_findParent:function(e,t){if(e&&"BODY"===e.tagName.toUpperCase()||"HTML"===e.tagName.toUpperCase())return null;for(e=e.parentNode;e&&"BODY"!==e.tagName.toUpperCase()&&!e.classList.contains(t);)e=e.parentNode;return e=e&&"BODY"!==e.tagName.toUpperCase()?e:null},_triggerWindowEvent:function(e){var t;"undefined"!=typeof window&&(document.createEvent?("function"==typeof Event?t=new Event(e):(t=document.createEvent("Event")).initEvent(e,!1,!0),window.dispatchEvent(t)):window.fireEvent("on".concat(e),document.createEventObject()))},_triggerEvent:function(e){this._triggerWindowEvent("layout".concat(e)),this._listeners.filter((function(t){return t.event===e})).forEach((function(e){return e.callback.call(null)}))},_updateInlineStyle:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;this._styleEl||(this._styleEl=document.createElement("style"),this._styleEl.type="text/css",document.head.appendChild(this._styleEl));var n="\n.layout-menu-fixed .layout-navbar-full .layout-menu,\n.layout-menu-fixed-offcanvas .layout-navbar-full .layout-menu {\n  top: {navbarHeight}px !important;\n}\n.layout-page {\n  padding-top: {navbarHeight}px !important;\n}\n.content-wrapper {\n  padding-bottom: {footerHeight}px !important;\n}".replace(/\{navbarHeight\}/gi,e).replace(/\{footerHeight\}/gi,t);this._curStyle!==n&&(this._curStyle=n,this._styleEl.textContent=n)},_removeInlineStyle:function(){this._styleEl&&document.head.removeChild(this._styleEl),this._styleEl=null,this._curStyle=null},_redrawLayoutMenu:function(){var e=this.getLayoutMenu();if(e&&e.querySelector(".menu")){var t=e.querySelector(".menu-inner"),n=t.scrollTop,i=document.documentElement.scrollTop;return e.style.display="none",e.style.display="",t.scrollTop=n,document.documentElement.scrollTop=i,!0}return!1},_supportsTransitionEnd:function(){if(window.QUnit)return!1;var e=document.body||document.documentElement;if(!e)return!1;var t=!1;return u.forEach((function(n){void 0!==e.style[n]&&(t=!0)})),t},_getNavbarHeight:function(){var e=this,t=this.getLayoutNavbar();if(!t)return 0;if(!this.isSmallScreen())return t.getBoundingClientRect().height;var n=t.cloneNode(!0);n.id=null,n.style.visibility="hidden",n.style.position="absolute",Array.prototype.slice.call(n.querySelectorAll(".collapse.show")).forEach((function(t){return e._removeClass("show",t)})),t.parentNode.insertBefore(n,t);var i=n.getBoundingClientRect().height;return n.parentNode.removeChild(n),i},_getFooterHeight:function(){var e=this.getLayoutFooter();return e?e.getBoundingClientRect().height:0},_getAnimationDuration:function(e){var t=window.getComputedStyle(e).transitionDuration;return parseFloat(t)*(-1!==t.indexOf("ms")?1:1e3)},_setMenuHoverState:function(e){this[e?"_addClass":"_removeClass"]("layout-menu-hover")},_setCollapsed:function(e){var t=this;this.isSmallScreen()?e?this._removeClass("layout-menu-expanded"):setTimeout((function(){t._addClass("layout-menu-expanded")}),this._redrawLayoutMenu()?5:0):this[e?"_addClass":"_removeClass"]("layout-menu-collapsed")},_bindLayoutAnimationEndEvent:function(e,t){var n=this,i=this.getMenu(),o=i?this._getAnimationDuration(i)+50:0;if(!o)return e.call(this),void t.call(this);this._transitionCallback=function(e){e.target===i&&(n._unbindLayoutAnimationEndEvent(),t.call(n))},l.forEach((function(e){i.addEventListener(e,n._transitionCallback,!1)})),e.call(this),this._transitionCallbackTimeout=setTimeout((function(){n._transitionCallback.call(n,{target:i})}),o)},_unbindLayoutAnimationEndEvent:function(){var e=this,t=this.getMenu();this._transitionCallbackTimeout&&(clearTimeout(this._transitionCallbackTimeout),this._transitionCallbackTimeout=null),t&&this._transitionCallback&&l.forEach((function(n){t.removeEventListener(n,e._transitionCallback,!1)})),this._transitionCallback&&(this._transitionCallback=null)},_bindWindowResizeEvent:function(){var e=this;this._unbindWindowResizeEvent();var t=function(){e._resizeTimeout&&(clearTimeout(e._resizeTimeout),e._resizeTimeout=null),e._triggerEvent("resize")};this._resizeCallback=function(){e._resizeTimeout&&clearTimeout(e._resizeTimeout),e._resizeTimeout=setTimeout(t,e.RESIZE_DELAY)},window.addEventListener("resize",this._resizeCallback,!1)},_unbindWindowResizeEvent:function(){this._resizeTimeout&&(clearTimeout(this._resizeTimeout),this._resizeTimeout=null),this._resizeCallback&&(window.removeEventListener("resize",this._resizeCallback,!1),this._resizeCallback=null)},_bindMenuMouseEvents:function(){var e=this;if(!(this._menuMouseEnter&&this._menuMouseLeave&&this._windowTouchStart)){var t=this.getLayoutMenu();if(!t)return this._unbindMenuMouseEvents();this._menuMouseEnter||(this._menuMouseEnter=function(){return e.isSmallScreen()||!e._hasClass("layout-menu-collapsed")||e.isOffcanvas()||e._hasClass("layout-transitioning")?e._setMenuHoverState(!1):e._setMenuHoverState(!0)},t.addEventListener("mouseenter",this._menuMouseEnter,!1),t.addEventListener("touchstart",this._menuMouseEnter,!1)),this._menuMouseLeave||(this._menuMouseLeave=function(){e._setMenuHoverState(!1)},t.addEventListener("mouseleave",this._menuMouseLeave,!1)),this._windowTouchStart||(this._windowTouchStart=function(t){t&&t.target&&e._findParent(t.target,".layout-menu")||e._setMenuHoverState(!1)},window.addEventListener("touchstart",this._windowTouchStart,!0))}},_unbindMenuMouseEvents:function(){if(this._menuMouseEnter||this._menuMouseLeave||this._windowTouchStart){var e=this.getLayoutMenu();this._menuMouseEnter&&(e&&(e.removeEventListener("mouseenter",this._menuMouseEnter,!1),e.removeEventListener("touchstart",this._menuMouseEnter,!1)),this._menuMouseEnter=null),this._menuMouseLeave&&(e&&e.removeEventListener("mouseleave",this._menuMouseLeave,!1),this._menuMouseLeave=null),this._windowTouchStart&&(e&&window.addEventListener("touchstart",this._windowTouchStart,!0),this._windowTouchStart=null),this._setMenuHoverState(!1)}},scrollToActive:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this._scrollToActive(e)},swipeIn:function(e,t){this._swipeIn(e,t)},swipeOut:function(e,t){this._swipeOut(e,t)},overlayTap:function(e,t){this._overlayTap(e,t)},scrollPageTo:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:500,n=document.scrollingElement;"string"==typeof e&&(e=document.querySelector(e)),"number"!=typeof e&&(e=e.getBoundingClientRect().top+n.scrollTop);var i=n.scrollTop,o=e-i,r=+new Date,s=function(){var a,l,u,c=+new Date-r,d=(a=c,l=i,u=o,(a/=t/2)<1?u/2*a*a+l:-u/2*((a-=1)*(a-2)-1)+l);n.scrollTop=d,c<t?requestAnimationFrame(s):n.scrollTop=e};s()},setCollapsed:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:c("collapsed"),n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this.getLayoutMenu()&&(this._unbindLayoutAnimationEndEvent(),n&&this._supportsTransitionEnd()?(this._addClass("layout-transitioning"),t&&this._setMenuHoverState(!1),this._bindLayoutAnimationEndEvent((function(){e._setCollapsed(t)}),(function(){e._removeClass("layout-transitioning"),e._triggerWindowEvent("resize"),e._triggerEvent("toggle"),e._setMenuHoverState(!1)}))):(this._addClass("layout-no-transition"),t&&this._setMenuHoverState(!1),this._setCollapsed(t),setTimeout((function(){e._removeClass("layout-no-transition"),e._triggerWindowEvent("resize"),e._triggerEvent("toggle"),e._setMenuHoverState(!1)}),1)))},toggleCollapsed:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.setCollapsed(!this.isCollapsed(),e)},setPosition:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:c("fixed"),t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:c("offcanvas");this._removeClass("layout-menu-offcanvas layout-menu-fixed layout-menu-fixed-offcanvas"),!e&&t?this._addClass("layout-menu-offcanvas"):e&&!t?(this._addClass("layout-menu-fixed"),this._redrawLayoutMenu()):e&&t&&(this._addClass("layout-menu-fixed-offcanvas"),this._redrawLayoutMenu()),this.update()},getLayoutMenu:function(){return document.querySelector(".layout-menu")},getMenu:function(){var e=this.getLayoutMenu();return e?this._hasClass("menu",e)?e:e.querySelector(".menu"):null},getLayoutNavbar:function(){return document.querySelector(".layout-navbar")},getLayoutFooter:function(){return document.querySelector(".content-footer")},getLayoutContainer:function(){return document.querySelector(".layout-page")},setNavbarFixed:function(){this[(arguments.length>0&&void 0!==arguments[0]?arguments[0]:c("fixed"))?"_addClass":"_removeClass"]("layout-navbar-fixed"),this.update()},setNavbar:function(e){"sticky"===e?(this._addClass("layout-navbar-fixed"),this._removeClass("layout-navbar-hidden")):"hidden"===e?(this._addClass("layout-navbar-hidden"),this._removeClass("layout-navbar-fixed")):(this._removeClass("layout-navbar-hidden"),this._removeClass("layout-navbar-fixed")),this.update()},setFooterFixed:function(){this[(arguments.length>0&&void 0!==arguments[0]?arguments[0]:c("fixed"))?"_addClass":"_removeClass"]("layout-footer-fixed"),this.update()},setContentLayout:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:c("contentLayout");setTimeout((function(){var n,i=document.querySelector(".content-wrapper > div"),o=document.querySelector(".layout-navbar"),r=document.querySelector(".layout-navbar > div"),s=document.querySelector(".layout-navbar .search-input-wrapper"),a=document.querySelector(".layout-navbar .search-input-wrapper .search-input"),l=document.querySelector(".content-footer > div"),u=[].slice.call(document.querySelectorAll(".container-fluid")),c=[].slice.call(document.querySelectorAll(".container-xxl")),d=document.querySelector(".menu-vertical"),f=!1;document.querySelector(".content-wrapper > .menu-horizontal > div")&&(f=!0,n=document.querySelector(".content-wrapper > .menu-horizontal > div")),"compact"===t?(u.some((function(e){return[i,l].includes(e)}))&&(e._removeClass("container-fluid",[i,l]),e._addClass("container-xxl",[i,l])),a&&(e._removeClass("container-fluid",[a]),e._addClass("container-xxl",[a])),d&&u.some((function(e){return[o].includes(e)}))&&(e._removeClass("container-fluid",[o]),e._addClass("container-xxl",[o])),f&&(e._removeClass("container-fluid",n),e._addClass("container-xxl",n),r&&(e._removeClass("container-fluid",r),e._addClass("container-xxl",r)),s&&(e._removeClass("container-fluid",s),e._addClass("container-xxl",s)))):(c.some((function(e){return[i,l].includes(e)}))&&(e._removeClass("container-xxl",[i,l]),e._addClass("container-fluid",[i,l])),a&&(e._removeClass("container-xxl",[a]),e._addClass("container-fluid",[a])),d&&c.some((function(e){return[o].includes(e)}))&&(e._removeClass("container-xxl",[o]),e._addClass("container-fluid",[o])),f&&(e._removeClass("container-xxl",n),e._addClass("container-fluid",n),r&&(e._removeClass("container-xxl",r),e._addClass("container-fluid",r)),s&&(e._removeClass("container-xxl",s),e._addClass("container-fluid",s))))}),100)},update:function(){(this.getLayoutNavbar()&&(!this.isSmallScreen()&&this.isLayoutNavbarFull()&&this.isFixed()||this.isNavbarFixed())||this.getLayoutFooter()&&this.isFooterFixed())&&this._updateInlineStyle(this._getNavbarHeight(),this._getFooterHeight()),this._bindMenuMouseEvents()},setAutoUpdate:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:c("enable");t&&!this._autoUpdate?(this.on("resize.Helpers:autoUpdate",(function(){return e.update()})),this._autoUpdate=!0):!t&&this._autoUpdate&&(this.off("resize.Helpers:autoUpdate"),this._autoUpdate=!1)},updateCustomOptionCheck:function(e){if(e.checked){if("radio"===e.type)[].slice.call(e.closest(".row").querySelectorAll(".custom-option")).map((function(e){e.closest(".custom-option").classList.remove("checked")}));e.closest(".custom-option").classList.add("checked")}else e.closest(".custom-option").classList.remove("checked")},isRtl:function(){return"rtl"===document.querySelector("body").getAttribute("dir")||"rtl"===document.querySelector("html").getAttribute("dir")},isMobileDevice:function(){return void 0!==window.orientation||-1!==navigator.userAgent.indexOf("IEMobile")},isSmallScreen:function(){return(window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth)<this.LAYOUT_BREAKPOINT},isLayoutNavbarFull:function(){return!!document.querySelector(".layout-wrapper.layout-navbar-full")},isCollapsed:function(){return this.isSmallScreen()?!this._hasClass("layout-menu-expanded"):this._hasClass("layout-menu-collapsed")},isFixed:function(){return this._hasClass("layout-menu-fixed layout-menu-fixed-offcanvas")},isOffcanvas:function(){return this._hasClass("layout-menu-offcanvas layout-menu-fixed-offcanvas")},isNavbarFixed:function(){return this._hasClass("layout-navbar-fixed")||!this.isSmallScreen()&&this.isFixed()&&this.isLayoutNavbarFull()},isFooterFixed:function(){return this._hasClass("layout-footer-fixed")},isLightStyle:function(){return document.documentElement.classList.contains("light-style")},isDarkStyle:function(){return document.documentElement.classList.contains("dark-style")},on:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:c("event"),t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:c("callback"),o=i(e.split("."),1)[0],r=n(e.split(".")).slice(1);r=r.join(".")||null,this._listeners.push({event:o,namespace:r,callback:t})},off:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:c("event"),o=i(t.split("."),1)[0],r=n(t.split(".")).slice(1);r=r.join(".")||null,this._listeners.filter((function(e){return e.event===o&&e.namespace===r})).forEach((function(t){return e._listeners.splice(e._listeners.indexOf(t),1)}))},init:function(){var e=this;this._initialized||(this._initialized=!0,this._updateInlineStyle(0),this._bindWindowResizeEvent(),this.off("init._Helpers"),this.on("init._Helpers",(function(){e.off("resize._Helpers:redrawMenu"),e.on("resize._Helpers:redrawMenu",(function(){e.isSmallScreen()&&!e.isCollapsed()&&e._redrawLayoutMenu()})),"number"==typeof document.documentMode&&document.documentMode<11&&(e.off("resize._Helpers:ie10RepaintBody"),e.on("resize._Helpers:ie10RepaintBody",(function(){if(!e.isFixed()){var t=document.documentElement.scrollTop;document.body.style.display="none",document.body.style.display="block",document.documentElement.scrollTop=t}})))})),this._triggerEvent("init"))},destroy:function(){var e=this;this._initialized&&(this._initialized=!1,this._removeClass("layout-transitioning"),this._removeInlineStyle(),this._unbindLayoutAnimationEndEvent(),this._unbindWindowResizeEvent(),this._unbindMenuMouseEvents(),this.setAutoUpdate(!1),this.off("init._Helpers"),this._listeners.filter((function(e){return"init"!==e.event})).forEach((function(t){return e._listeners.splice(e._listeners.indexOf(t),1)})))},initPasswordToggle:function(){var e=document.querySelectorAll(".form-password-toggle i");null!=e&&e.forEach((function(e){e.addEventListener("click",(function(t){t.preventDefault();var n=e.closest(".form-password-toggle"),i=n.querySelector("i"),o=n.querySelector("input");"text"===o.getAttribute("type")?(o.setAttribute("type","password"),i.classList.replace("ti-eye","ti-eye-off")):"password"===o.getAttribute("type")&&(o.setAttribute("type","text"),i.classList.replace("ti-eye-off","ti-eye"))}))}))},initCustomOptionCheck:function(){var e=this;[].slice.call(document.querySelectorAll(".custom-option .form-check-input")).map((function(t){e.updateCustomOptionCheck(t),t.addEventListener("click",(function(n){e.updateCustomOptionCheck(t)}))}))},initSpeechToText:function(){var e=window.SpeechRecognition||window.webkitSpeechRecognition,t=document.querySelectorAll(".speech-to-text");if(null!=e&&null!=t){var n=new e;document.querySelectorAll(".speech-to-text i").forEach((function(e){var t=!1;e.addEventListener("click",(function(){e.closest(".input-group").querySelector(".form-control").focus(),n.onspeechstart=function(){t=!0},!1===t&&n.start(),n.onerror=function(){t=!1},n.onresult=function(t){e.closest(".input-group").querySelector(".form-control").value=t.results[0][0].transcript},n.onspeechend=function(){t=!1,n.stop()}}))}))}},initNavbarDropdownScrollbar:function(){var e=document.querySelectorAll(".navbar-dropdown .scrollable-container"),t=window.PerfectScrollbar;void 0!==t&&null!=e&&e.forEach((function(e){new t(e,{wheelPropagation:!1,suppressScrollX:!0})}))},ajaxCall:function(e){return new Promise((function(t,n){var i=new XMLHttpRequest;i.open("GET",e),i.onload=function(){return 200===i.status?t(i.response):n(Error(i.statusText))},i.onerror=function(e){return n(Error("Network Error: ".concat(e)))},i.send()}))},initSidebarToggle:function(){document.querySelectorAll('[data-bs-toggle="sidebar"]').forEach((function(e){e.addEventListener("click",(function(){var t=e.getAttribute("data-target"),n=e.getAttribute("data-overlay"),i=document.querySelectorAll(".app-overlay");document.querySelectorAll(t).forEach((function(e){e.classList.toggle("show"),null!=n&&!1!==n&&void 0!==i&&(e.classList.contains("show")?i[0].classList.add("show"):i[0].classList.remove("show"),i[0].addEventListener("click",(function(t){t.currentTarget.classList.remove("show"),e.classList.remove("show")})))}))}))}))}};return"undefined"!=typeof window&&(d.init(),d.isMobileDevice()&&window.chrome&&document.documentElement.classList.add("layout-menu-100vh"),"complete"===document.readyState?d.update():document.addEventListener("DOMContentLoaded",(function e(){d.update(),document.removeEventListener("DOMContentLoaded",e)}))),t}()}));
=======
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!***********************************************!*\
  !*** ./resources/assets/vendor/js/helpers.js ***!
  \***********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Helpers: function() { return /* binding */ Helpers; }
/* harmony export */ });
function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
// Constants
var TRANS_EVENTS = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd'];
var TRANS_PROPERTIES = ['transition', 'MozTransition', 'webkitTransition', 'WebkitTransition', 'OTransition'];
var INLINE_STYLES = "\n.layout-menu-fixed .layout-navbar-full .layout-menu,\n.layout-menu-fixed-offcanvas .layout-navbar-full .layout-menu {\n  top: {navbarHeight}px !important;\n}\n.layout-page {\n  padding-top: {navbarHeight}px !important;\n}\n.content-wrapper {\n  padding-bottom: {footerHeight}px !important;\n}";

// Guard
function requiredParam(name) {
  throw new Error("Parameter required".concat(name ? ": `".concat(name, "`") : ''));
}
var Helpers = {
  // Root Element
  ROOT_EL: typeof window !== 'undefined' ? document.documentElement : null,
  // Large screens breakpoint
  LAYOUT_BREAKPOINT: 1200,
  // Resize delay in milliseconds
  RESIZE_DELAY: 200,
  menuPsScroll: null,
  mainMenu: null,
  // Internal variables
  _curStyle: null,
  _styleEl: null,
  _resizeTimeout: null,
  _resizeCallback: null,
  _transitionCallback: null,
  _transitionCallbackTimeout: null,
  _listeners: [],
  _initialized: false,
  _autoUpdate: false,
  _lastWindowHeight: 0,
  // *******************************************************************************
  // * Utilities
  // ---
  // Scroll To Active Menu Item
  _scrollToActive: function _scrollToActive() {
    var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
    var layoutMenu = this.getLayoutMenu();
    if (!layoutMenu) return;
    var activeEl = layoutMenu.querySelector('li.menu-item.active:not(.open)');
    if (activeEl) {
      // t = current time
      // b = start value
      // c = change in value
      // d = duration
      var easeInOutQuad = function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t -= 1;
        return -c / 2 * (t * (t - 2) - 1) + b;
      };
      var element = this.getLayoutMenu().querySelector('.menu-inner');
      if (typeof activeEl === 'string') {
        activeEl = document.querySelector(activeEl);
      }
      if (typeof activeEl !== 'number') {
        activeEl = activeEl.getBoundingClientRect().top + element.scrollTop;
      }

      // If active element's top position is less than 2/3 (66%) of menu height than do not scroll
      if (activeEl < parseInt(element.clientHeight * 2 / 3, 10)) return;
      var start = element.scrollTop;
      var change = activeEl - start - parseInt(element.clientHeight / 2, 10);
      var startDate = +new Date();
      if (animate === true) {
        var animateScroll = function animateScroll() {
          var currentDate = +new Date();
          var currentTime = currentDate - startDate;
          var val = easeInOutQuad(currentTime, start, change, duration);
          element.scrollTop = val;
          if (currentTime < duration) {
            requestAnimationFrame(animateScroll);
          } else {
            element.scrollTop = change;
          }
        };
        animateScroll();
      } else {
        element.scrollTop = change;
      }
    }
  },
  // ---
  // Swipe In Gesture
  _swipeIn: function _swipeIn(targetEl, callback) {
    var _window = window,
      Hammer = _window.Hammer;
    if (typeof Hammer !== 'undefined' && typeof targetEl === 'string') {
      // Swipe menu gesture
      var swipeInElement = document.querySelector(targetEl);
      if (swipeInElement) {
        var hammerInstance = new Hammer(swipeInElement);
        hammerInstance.on('panright', callback);
      }
    }
  },
  // ---
  // Swipe Out Gesture
  _swipeOut: function _swipeOut(targetEl, callback) {
    var _window2 = window,
      Hammer = _window2.Hammer;
    if (typeof Hammer !== 'undefined' && typeof targetEl === 'string') {
      setTimeout(function () {
        // Swipe menu gesture
        var swipeOutElement = document.querySelector(targetEl);
        if (swipeOutElement) {
          var hammerInstance = new Hammer(swipeOutElement);
          hammerInstance.get('pan').set({
            direction: Hammer.DIRECTION_ALL,
            threshold: 250
          });
          hammerInstance.on('panleft', callback);
        }
      }, 500);
    }
  },
  // ---
  // Swipe Out On Overlay Tap
  _overlayTap: function _overlayTap(targetEl, callback) {
    var _window3 = window,
      Hammer = _window3.Hammer;
    if (typeof Hammer !== 'undefined' && typeof targetEl === 'string') {
      // Swipe out overlay element
      var swipeOutOverlayElement = document.querySelector(targetEl);
      if (swipeOutOverlayElement) {
        var hammerInstance = new Hammer(swipeOutOverlayElement);
        hammerInstance.on('tap', callback);
      }
    }
  },
  // ---
  // Add classes
  _addClass: function _addClass(cls) {
    var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.ROOT_EL;
    if (el.length !== undefined) {
      // Add classes to multiple elements
      el.forEach(function (e) {
        cls.split(' ').forEach(function (c) {
          return e.classList.add(c);
        });
      });
    } else {
      // Add classes to single element
      cls.split(' ').forEach(function (c) {
        return el.classList.add(c);
      });
    }
  },
  // ---
  // Remove classes
  _removeClass: function _removeClass(cls) {
    var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.ROOT_EL;
    if (el.length !== undefined) {
      // Remove classes to multiple elements
      el.forEach(function (e) {
        cls.split(' ').forEach(function (c) {
          return e.classList.remove(c);
        });
      });
    } else {
      // Remove classes to single element
      cls.split(' ').forEach(function (c) {
        return el.classList.remove(c);
      });
    }
  },
  // Toggle classes
  _toggleClass: function _toggleClass() {
    var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.ROOT_EL;
    var cls1 = arguments.length > 1 ? arguments[1] : undefined;
    var cls2 = arguments.length > 2 ? arguments[2] : undefined;
    if (el.classList.contains(cls1)) {
      el.classList.replace(cls1, cls2);
    } else {
      el.classList.replace(cls2, cls1);
    }
  },
  // ---
  // Has class
  _hasClass: function _hasClass(cls) {
    var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.ROOT_EL;
    var result = false;
    cls.split(' ').forEach(function (c) {
      if (el.classList.contains(c)) result = true;
    });
    return result;
  },
  _findParent: function _findParent(el, cls) {
    if (el && el.tagName.toUpperCase() === 'BODY' || el.tagName.toUpperCase() === 'HTML') return null;
    el = el.parentNode;
    while (el && el.tagName.toUpperCase() !== 'BODY' && !el.classList.contains(cls)) {
      el = el.parentNode;
    }
    el = el && el.tagName.toUpperCase() !== 'BODY' ? el : null;
    return el;
  },
  // ---
  // Trigger window event
  _triggerWindowEvent: function _triggerWindowEvent(name) {
    if (typeof window === 'undefined') return;
    if (document.createEvent) {
      var event;
      if (typeof Event === 'function') {
        event = new Event(name);
      } else {
        event = document.createEvent('Event');
        event.initEvent(name, false, true);
      }
      window.dispatchEvent(event);
    } else {
      window.fireEvent("on".concat(name), document.createEventObject());
    }
  },
  // ---
  // Trigger event
  _triggerEvent: function _triggerEvent(name) {
    this._triggerWindowEvent("layout".concat(name));
    this._listeners.filter(function (listener) {
      return listener.event === name;
    }).forEach(function (listener) {
      return listener.callback.call(null);
    });
  },
  // ---
  // Update style
  _updateInlineStyle: function _updateInlineStyle() {
    var navbarHeight = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var footerHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    if (!this._styleEl) {
      this._styleEl = document.createElement('style');
      this._styleEl.type = 'text/css';
      document.head.appendChild(this._styleEl);
    }
    var newStyle = INLINE_STYLES.replace(/\{navbarHeight\}/gi, navbarHeight).replace(/\{footerHeight\}/gi, footerHeight);
    if (this._curStyle !== newStyle) {
      this._curStyle = newStyle;
      this._styleEl.textContent = newStyle;
    }
  },
  // ---
  // Remove style
  _removeInlineStyle: function _removeInlineStyle() {
    if (this._styleEl) document.head.removeChild(this._styleEl);
    this._styleEl = null;
    this._curStyle = null;
  },
  // ---
  // Redraw layout menu (Safari bugfix)
  _redrawLayoutMenu: function _redrawLayoutMenu() {
    var layoutMenu = this.getLayoutMenu();
    if (layoutMenu && layoutMenu.querySelector('.menu')) {
      var inner = layoutMenu.querySelector('.menu-inner');
      var scrollTop = inner.scrollTop;
      var pageScrollTop = document.documentElement.scrollTop;
      layoutMenu.style.display = 'none';
      // layoutMenu.offsetHeight
      layoutMenu.style.display = '';
      inner.scrollTop = scrollTop;
      document.documentElement.scrollTop = pageScrollTop;
      return true;
    }
    return false;
  },
  // ---
  // Check for transition support
  _supportsTransitionEnd: function _supportsTransitionEnd() {
    if (window.QUnit) return false;
    var el = document.body || document.documentElement;
    if (!el) return false;
    var result = false;
    TRANS_PROPERTIES.forEach(function (evnt) {
      if (typeof el.style[evnt] !== 'undefined') result = true;
    });
    return result;
  },
  // ---
  // Calculate current navbar height
  _getNavbarHeight: function _getNavbarHeight() {
    var _this2 = this;
    var layoutNavbar = this.getLayoutNavbar();
    if (!layoutNavbar) return 0;
    if (!this.isSmallScreen()) return layoutNavbar.getBoundingClientRect().height;

    // Needs some logic to get navbar height on small screens

    var clonedEl = layoutNavbar.cloneNode(true);
    clonedEl.id = null;
    clonedEl.style.visibility = 'hidden';
    clonedEl.style.position = 'absolute';
    Array.prototype.slice.call(clonedEl.querySelectorAll('.collapse.show')).forEach(function (el) {
      return _this2._removeClass('show', el);
    });
    layoutNavbar.parentNode.insertBefore(clonedEl, layoutNavbar);
    var navbarHeight = clonedEl.getBoundingClientRect().height;
    clonedEl.parentNode.removeChild(clonedEl);
    return navbarHeight;
  },
  // ---
  // Get current footer height
  _getFooterHeight: function _getFooterHeight() {
    var layoutFooter = this.getLayoutFooter();
    if (!layoutFooter) return 0;
    return layoutFooter.getBoundingClientRect().height;
  },
  // ---
  // Get animation duration of element
  _getAnimationDuration: function _getAnimationDuration(el) {
    var duration = window.getComputedStyle(el).transitionDuration;
    return parseFloat(duration) * (duration.indexOf('ms') !== -1 ? 1 : 1000);
  },
  // ---
  // Set menu hover state
  _setMenuHoverState: function _setMenuHoverState(hovered) {
    this[hovered ? '_addClass' : '_removeClass']('layout-menu-hover');
  },
  // ---
  // Toggle collapsed
  _setCollapsed: function _setCollapsed(collapsed) {
    var _this3 = this;
    if (this.isSmallScreen()) {
      if (collapsed) {
        this._removeClass('layout-menu-expanded');
      } else {
        setTimeout(function () {
          _this3._addClass('layout-menu-expanded');
        }, this._redrawLayoutMenu() ? 5 : 0);
      }
    } else {
      this[collapsed ? '_addClass' : '_removeClass']('layout-menu-collapsed');
    }
  },
  // ---
  // Add layout sivenav toggle animationEnd event
  _bindLayoutAnimationEndEvent: function _bindLayoutAnimationEndEvent(modifier, cb) {
    var _this4 = this;
    var menu = this.getMenu();
    var duration = menu ? this._getAnimationDuration(menu) + 50 : 0;
    if (!duration) {
      modifier.call(this);
      cb.call(this);
      return;
    }
    this._transitionCallback = function (e) {
      if (e.target !== menu) return;
      _this4._unbindLayoutAnimationEndEvent();
      cb.call(_this4);
    };
    TRANS_EVENTS.forEach(function (e) {
      menu.addEventListener(e, _this4._transitionCallback, false);
    });
    modifier.call(this);
    this._transitionCallbackTimeout = setTimeout(function () {
      _this4._transitionCallback.call(_this4, {
        target: menu
      });
    }, duration);
  },
  // ---
  // Remove layout sivenav toggle animationEnd event
  _unbindLayoutAnimationEndEvent: function _unbindLayoutAnimationEndEvent() {
    var _this5 = this;
    var menu = this.getMenu();
    if (this._transitionCallbackTimeout) {
      clearTimeout(this._transitionCallbackTimeout);
      this._transitionCallbackTimeout = null;
    }
    if (menu && this._transitionCallback) {
      TRANS_EVENTS.forEach(function (e) {
        menu.removeEventListener(e, _this5._transitionCallback, false);
      });
    }
    if (this._transitionCallback) {
      this._transitionCallback = null;
    }
  },
  // ---
  // Bind delayed window resize event
  _bindWindowResizeEvent: function _bindWindowResizeEvent() {
    var _this6 = this;
    this._unbindWindowResizeEvent();
    var cb = function cb() {
      if (_this6._resizeTimeout) {
        clearTimeout(_this6._resizeTimeout);
        _this6._resizeTimeout = null;
      }
      _this6._triggerEvent('resize');
    };
    this._resizeCallback = function () {
      if (_this6._resizeTimeout) clearTimeout(_this6._resizeTimeout);
      _this6._resizeTimeout = setTimeout(cb, _this6.RESIZE_DELAY);
    };
    window.addEventListener('resize', this._resizeCallback, false);
  },
  // ---
  // Unbind delayed window resize event
  _unbindWindowResizeEvent: function _unbindWindowResizeEvent() {
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = null;
    }
    if (this._resizeCallback) {
      window.removeEventListener('resize', this._resizeCallback, false);
      this._resizeCallback = null;
    }
  },
  _bindMenuMouseEvents: function _bindMenuMouseEvents() {
    var _this7 = this;
    if (this._menuMouseEnter && this._menuMouseLeave && this._windowTouchStart) return;
    var layoutMenu = this.getLayoutMenu();
    if (!layoutMenu) return this._unbindMenuMouseEvents();
    if (!this._menuMouseEnter) {
      this._menuMouseEnter = function () {
        if (_this7.isSmallScreen() || !_this7._hasClass('layout-menu-collapsed') || _this7.isOffcanvas() || _this7._hasClass('layout-transitioning')) {
          return _this7._setMenuHoverState(false);
        }
        return _this7._setMenuHoverState(true);
      };
      layoutMenu.addEventListener('mouseenter', this._menuMouseEnter, false);
      layoutMenu.addEventListener('touchstart', this._menuMouseEnter, false);
    }
    if (!this._menuMouseLeave) {
      this._menuMouseLeave = function () {
        _this7._setMenuHoverState(false);
      };
      layoutMenu.addEventListener('mouseleave', this._menuMouseLeave, false);
    }
    if (!this._windowTouchStart) {
      this._windowTouchStart = function (e) {
        if (!e || !e.target || !_this7._findParent(e.target, '.layout-menu')) {
          _this7._setMenuHoverState(false);
        }
      };
      window.addEventListener('touchstart', this._windowTouchStart, true);
    }
  },
  _unbindMenuMouseEvents: function _unbindMenuMouseEvents() {
    if (!this._menuMouseEnter && !this._menuMouseLeave && !this._windowTouchStart) return;
    var layoutMenu = this.getLayoutMenu();
    if (this._menuMouseEnter) {
      if (layoutMenu) {
        layoutMenu.removeEventListener('mouseenter', this._menuMouseEnter, false);
        layoutMenu.removeEventListener('touchstart', this._menuMouseEnter, false);
      }
      this._menuMouseEnter = null;
    }
    if (this._menuMouseLeave) {
      if (layoutMenu) {
        layoutMenu.removeEventListener('mouseleave', this._menuMouseLeave, false);
      }
      this._menuMouseLeave = null;
    }
    if (this._windowTouchStart) {
      if (layoutMenu) {
        window.addEventListener('touchstart', this._windowTouchStart, true);
      }
      this._windowTouchStart = null;
    }
    this._setMenuHoverState(false);
  },
  // *******************************************************************************
  // * Methods
  scrollToActive: function scrollToActive() {
    var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    this._scrollToActive(animate);
  },
  swipeIn: function swipeIn(el, callback) {
    this._swipeIn(el, callback);
  },
  swipeOut: function swipeOut(el, callback) {
    this._swipeOut(el, callback);
  },
  overlayTap: function overlayTap(el, callback) {
    this._overlayTap(el, callback);
  },
  scrollPageTo: function scrollPageTo(to) {
    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    var easeInOutQuad = function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t -= 1;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };
    var element = document.scrollingElement;
    if (typeof to === 'string') {
      to = document.querySelector(to);
    }
    if (typeof to !== 'number') {
      to = to.getBoundingClientRect().top + element.scrollTop;
    }
    var start = element.scrollTop;
    var change = to - start;
    var startDate = +new Date();
    // const increment = 20

    var animateScroll = function animateScroll() {
      var currentDate = +new Date();
      var currentTime = currentDate - startDate;
      var val = easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        element.scrollTop = to;
      }
    };
    animateScroll();
  },
  // ---
  // Collapse / expand layout
  setCollapsed: function setCollapsed() {
    var _this8 = this;
    var collapsed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requiredParam('collapsed');
    var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var layoutMenu = this.getLayoutMenu();
    if (!layoutMenu) return;
    this._unbindLayoutAnimationEndEvent();
    if (animate && this._supportsTransitionEnd()) {
      this._addClass('layout-transitioning');
      if (collapsed) this._setMenuHoverState(false);
      this._bindLayoutAnimationEndEvent(function () {
        // Collapse / Expand
        _this8._setCollapsed(collapsed);
      }, function () {
        _this8._removeClass('layout-transitioning');
        _this8._triggerWindowEvent('resize');
        _this8._triggerEvent('toggle');
        _this8._setMenuHoverState(false);
      });
    } else {
      this._addClass('layout-no-transition');
      if (collapsed) this._setMenuHoverState(false);

      // Collapse / Expand
      this._setCollapsed(collapsed);
      setTimeout(function () {
        _this8._removeClass('layout-no-transition');
        _this8._triggerWindowEvent('resize');
        _this8._triggerEvent('toggle');
        _this8._setMenuHoverState(false);
      }, 1);
    }
  },
  // ---
  // Toggle layout
  toggleCollapsed: function toggleCollapsed() {
    var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    this.setCollapsed(!this.isCollapsed(), animate);
  },
  // ---
  // Set layout positioning
  setPosition: function setPosition() {
    var fixed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requiredParam('fixed');
    var offcanvas = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : requiredParam('offcanvas');
    this._removeClass('layout-menu-offcanvas layout-menu-fixed layout-menu-fixed-offcanvas');
    if (!fixed && offcanvas) {
      this._addClass('layout-menu-offcanvas');
    } else if (fixed && !offcanvas) {
      this._addClass('layout-menu-fixed');
      this._redrawLayoutMenu();
    } else if (fixed && offcanvas) {
      this._addClass('layout-menu-fixed-offcanvas');
      this._redrawLayoutMenu();
    }
    this.update();
  },
  // *******************************************************************************
  // * Getters
  getLayoutMenu: function getLayoutMenu() {
    return document.querySelector('.layout-menu');
  },
  getMenu: function getMenu() {
    var layoutMenu = this.getLayoutMenu();
    if (!layoutMenu) return null;
    return !this._hasClass('menu', layoutMenu) ? layoutMenu.querySelector('.menu') : layoutMenu;
  },
  getLayoutNavbar: function getLayoutNavbar() {
    return document.querySelector('.layout-navbar');
  },
  getLayoutFooter: function getLayoutFooter() {
    return document.querySelector('.content-footer');
  },
  getLayoutContainer: function getLayoutContainer() {
    return document.querySelector('.layout-page');
  },
  // *******************************************************************************
  // * Setters
  setNavbarFixed: function setNavbarFixed() {
    var fixed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requiredParam('fixed');
    this[fixed ? '_addClass' : '_removeClass']('layout-navbar-fixed');
    this.update();
  },
  setNavbar: function setNavbar(type) {
    if (type === 'sticky') {
      this._addClass('layout-navbar-fixed');
      this._removeClass('layout-navbar-hidden');
    } else if (type === 'hidden') {
      this._addClass('layout-navbar-hidden');
      this._removeClass('layout-navbar-fixed');
    } else {
      this._removeClass('layout-navbar-hidden');
      this._removeClass('layout-navbar-fixed');
    }
    this.update();
  },
  setFooterFixed: function setFooterFixed() {
    var fixed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requiredParam('fixed');
    this[fixed ? '_addClass' : '_removeClass']('layout-footer-fixed');
    this.update();
  },
  setContentLayout: function setContentLayout() {
    var _this9 = this;
    var contentLayout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requiredParam('contentLayout');
    setTimeout(function () {
      var contentArea = document.querySelector('.content-wrapper > div'); // For content area
      var navbarArea = document.querySelector('.layout-navbar'); // For navbar area for vertical menu
      var navbarAreaHorizontal = document.querySelector('.layout-navbar > div'); // For navbar area for horizontal menu
      var navbarSearchInputWrapper = document.querySelector('.layout-navbar .search-input-wrapper'); // For navbar search input wrapper
      var navbarSearchInput = document.querySelector('.layout-navbar .search-input-wrapper .search-input'); // For navbar search input
      var footerArea = document.querySelector('.content-footer > div'); // For footer area
      var containerFluid = [].slice.call(document.querySelectorAll('.container-fluid')); // To get container-fluid
      var containerXxl = [].slice.call(document.querySelectorAll('.container-xxl')); // To get container-xxl
      var verticalMenu = document.querySelector('.menu-vertical');
      var horizontalMenu = false; // For horizontal menu
      var horizontalMenuArea; // For horizontal menu area
      // Condition to check if layout is horizontal menu
      if (document.querySelector('.content-wrapper > .menu-horizontal > div')) {
        horizontalMenu = true;
        horizontalMenuArea = document.querySelector('.content-wrapper > .menu-horizontal > div');
      }
      //  If compact mode layout
      if (contentLayout === 'compact') {
        // Remove container fluid class from content area and footer area
        if (containerFluid.some(function (el) {
          return [contentArea, footerArea].includes(el);
        })) {
          _this9._removeClass('container-fluid', [contentArea, footerArea]);
          _this9._addClass('container-xxl', [contentArea, footerArea]);
        }
        // Navbar search input container condition is separated because it is not in starter kit
        if (navbarSearchInput) {
          _this9._removeClass('container-fluid', [navbarSearchInput]);
          _this9._addClass('container-xxl', [navbarSearchInput]);
        }
        // Remove container fluid class from navbar area in vertical menu
        if (verticalMenu) {
          if (containerFluid.some(function (el) {
            return [navbarArea].includes(el);
          })) {
            _this9._removeClass('container-fluid', [navbarArea]);
            _this9._addClass('container-xxl', [navbarArea]);
          }
        }
        // For horizontal menu only
        if (horizontalMenu) {
          _this9._removeClass('container-fluid', horizontalMenuArea);
          _this9._addClass('container-xxl', horizontalMenuArea);
          // For horizontal navbar only
          if (navbarAreaHorizontal) {
            _this9._removeClass('container-fluid', navbarAreaHorizontal);
            _this9._addClass('container-xxl', navbarAreaHorizontal);
          }
          // Navbar search input container condition is separated because it is not in starter kit
          if (navbarSearchInputWrapper) {
            _this9._removeClass('container-fluid', navbarSearchInputWrapper);
            _this9._addClass('container-xxl', navbarSearchInputWrapper);
          }
        }
      } else {
        //  If wide mode layout

        // Remove container xxl class from content area and footer area
        if (containerXxl.some(function (el) {
          return [contentArea, footerArea].includes(el);
        })) {
          _this9._removeClass('container-xxl', [contentArea, footerArea]);
          _this9._addClass('container-fluid', [contentArea, footerArea]);
        }
        // Navbar search input container condition is separated because it is not in starter kit
        if (navbarSearchInput) {
          _this9._removeClass('container-xxl', [navbarSearchInput]);
          _this9._addClass('container-fluid', [navbarSearchInput]);
        }
        // Remove container xxl class from navbar area in vertical menu
        if (verticalMenu) {
          if (containerXxl.some(function (el) {
            return [navbarArea].includes(el);
          })) {
            _this9._removeClass('container-xxl', [navbarArea]);
            _this9._addClass('container-fluid', [navbarArea]);
          }
        }
        // For horizontal menu only
        if (horizontalMenu) {
          _this9._removeClass('container-xxl', horizontalMenuArea);
          _this9._addClass('container-fluid', horizontalMenuArea);
          // For horizontal navbar only
          if (navbarAreaHorizontal) {
            _this9._removeClass('container-xxl', navbarAreaHorizontal);
            _this9._addClass('container-fluid', navbarAreaHorizontal);
          }
          // Navbar search input container condition is separated because it is not in starter kit
          if (navbarSearchInputWrapper) {
            _this9._removeClass('container-xxl', navbarSearchInputWrapper);
            _this9._addClass('container-fluid', navbarSearchInputWrapper);
          }
        }
      }
    }, 100);
  },
  // *******************************************************************************
  // * Update
  update: function update() {
    if (this.getLayoutNavbar() && (!this.isSmallScreen() && this.isLayoutNavbarFull() && this.isFixed() || this.isNavbarFixed()) || this.getLayoutFooter() && this.isFooterFixed()) {
      this._updateInlineStyle(this._getNavbarHeight(), this._getFooterHeight());
    }
    this._bindMenuMouseEvents();
  },
  setAutoUpdate: function setAutoUpdate() {
    var _this10 = this;
    var enable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requiredParam('enable');
    if (enable && !this._autoUpdate) {
      this.on('resize.Helpers:autoUpdate', function () {
        return _this10.update();
      });
      this._autoUpdate = true;
    } else if (!enable && this._autoUpdate) {
      this.off('resize.Helpers:autoUpdate');
      this._autoUpdate = false;
    }
  },
  // Update custom option based on element
  updateCustomOptionCheck: function updateCustomOptionCheck(el) {
    if (el.checked) {
      // If custom option element is radio, remove checked from the siblings (closest `.row`)
      if (el.type === 'radio') {
        var customRadioOptionList = [].slice.call(el.closest('.row').querySelectorAll('.custom-option'));
        customRadioOptionList.map(function (customRadioOptionEL) {
          customRadioOptionEL.closest('.custom-option').classList.remove('checked');
        });
      }
      el.closest('.custom-option').classList.add('checked');
    } else {
      el.closest('.custom-option').classList.remove('checked');
    }
  },
  // *******************************************************************************
  // * Tests
  isRtl: function isRtl() {
    return document.querySelector('body').getAttribute('dir') === 'rtl' || document.querySelector('html').getAttribute('dir') === 'rtl';
  },
  isMobileDevice: function isMobileDevice() {
    return typeof window.orientation !== 'undefined' || navigator.userAgent.indexOf('IEMobile') !== -1;
  },
  isSmallScreen: function isSmallScreen() {
    return (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) < this.LAYOUT_BREAKPOINT;
  },
  isLayoutNavbarFull: function isLayoutNavbarFull() {
    return !!document.querySelector('.layout-wrapper.layout-navbar-full');
  },
  isCollapsed: function isCollapsed() {
    if (this.isSmallScreen()) {
      return !this._hasClass('layout-menu-expanded');
    }
    return this._hasClass('layout-menu-collapsed');
  },
  isFixed: function isFixed() {
    return this._hasClass('layout-menu-fixed layout-menu-fixed-offcanvas');
  },
  isOffcanvas: function isOffcanvas() {
    return this._hasClass('layout-menu-offcanvas layout-menu-fixed-offcanvas');
  },
  isNavbarFixed: function isNavbarFixed() {
    return this._hasClass('layout-navbar-fixed') || !this.isSmallScreen() && this.isFixed() && this.isLayoutNavbarFull();
  },
  isFooterFixed: function isFooterFixed() {
    return this._hasClass('layout-footer-fixed');
  },
  isLightStyle: function isLightStyle() {
    return document.documentElement.classList.contains('light-style');
  },
  isDarkStyle: function isDarkStyle() {
    return document.documentElement.classList.contains('dark-style');
  },
  // *******************************************************************************
  // * Events
  on: function on() {
    var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requiredParam('event');
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : requiredParam('callback');
    var _event$split = event.split('.'),
      _event$split2 = _slicedToArray(_event$split, 1),
      _event = _event$split2[0];
    var _event$split3 = event.split('.'),
      _event$split4 = _toArray(_event$split3),
      namespace = _event$split4.slice(1);
    // let [_event, ...namespace] = event.split('.')
    namespace = namespace.join('.') || null;
    this._listeners.push({
      event: _event,
      namespace: namespace,
      callback: callback
    });
  },
  off: function off() {
    var _this11 = this;
    var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requiredParam('event');
    var _event$split5 = event.split('.'),
      _event$split6 = _slicedToArray(_event$split5, 1),
      _event = _event$split6[0];
    var _event$split7 = event.split('.'),
      _event$split8 = _toArray(_event$split7),
      namespace = _event$split8.slice(1);
    namespace = namespace.join('.') || null;
    this._listeners.filter(function (listener) {
      return listener.event === _event && listener.namespace === namespace;
    }).forEach(function (listener) {
      return _this11._listeners.splice(_this11._listeners.indexOf(listener), 1);
    });
  },
  // *******************************************************************************
  // * Life cycle
  init: function init() {
    var _this12 = this;
    if (this._initialized) return;
    this._initialized = true;

    // Initialize `style` element
    this._updateInlineStyle(0);

    // Bind window resize event
    this._bindWindowResizeEvent();

    // Bind init event
    this.off('init._Helpers');
    this.on('init._Helpers', function () {
      _this12.off('resize._Helpers:redrawMenu');
      _this12.on('resize._Helpers:redrawMenu', function () {
        // eslint-disable-next-line no-unused-expressions
        _this12.isSmallScreen() && !_this12.isCollapsed() && _this12._redrawLayoutMenu();
      });

      // Force repaint in IE 10
      if (typeof document.documentMode === 'number' && document.documentMode < 11) {
        _this12.off('resize._Helpers:ie10RepaintBody');
        _this12.on('resize._Helpers:ie10RepaintBody', function () {
          if (_this12.isFixed()) return;
          var scrollTop = document.documentElement.scrollTop;
          document.body.style.display = 'none';
          // document.body.offsetHeight
          document.body.style.display = 'block';
          document.documentElement.scrollTop = scrollTop;
        });
      }
    });
    this._triggerEvent('init');
  },
  destroy: function destroy() {
    var _this13 = this;
    if (!this._initialized) return;
    this._initialized = false;
    this._removeClass('layout-transitioning');
    this._removeInlineStyle();
    this._unbindLayoutAnimationEndEvent();
    this._unbindWindowResizeEvent();
    this._unbindMenuMouseEvents();
    this.setAutoUpdate(false);
    this.off('init._Helpers');

    // Remove all listeners except `init`
    this._listeners.filter(function (listener) {
      return listener.event !== 'init';
    }).forEach(function (listener) {
      return _this13._listeners.splice(_this13._listeners.indexOf(listener), 1);
    });
  },
  // ---
  // Init Password Toggle
  initPasswordToggle: function initPasswordToggle() {
    var toggler = document.querySelectorAll('.form-password-toggle i');
    if (typeof toggler !== 'undefined' && toggler !== null) {
      toggler.forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          var formPasswordToggle = el.closest('.form-password-toggle');
          var formPasswordToggleIcon = formPasswordToggle.querySelector('i');
          var formPasswordToggleInput = formPasswordToggle.querySelector('input');
          if (formPasswordToggleInput.getAttribute('type') === 'text') {
            formPasswordToggleInput.setAttribute('type', 'password');
            formPasswordToggleIcon.classList.replace('ti-eye', 'ti-eye-off');
          } else if (formPasswordToggleInput.getAttribute('type') === 'password') {
            formPasswordToggleInput.setAttribute('type', 'text');
            formPasswordToggleIcon.classList.replace('ti-eye-off', 'ti-eye');
          }
        });
      });
    }
  },
  //--
  // Init custom option check
  initCustomOptionCheck: function initCustomOptionCheck() {
    var _this = this;
    var custopOptionList = [].slice.call(document.querySelectorAll('.custom-option .form-check-input'));
    custopOptionList.map(function (customOptionEL) {
      // Update custom options check on page load
      _this.updateCustomOptionCheck(customOptionEL);

      // Update custom options check on click
      customOptionEL.addEventListener('click', function (e) {
        _this.updateCustomOptionCheck(customOptionEL);
      });
    });
  },
  // ---
  // Init Speech To Text
  initSpeechToText: function initSpeechToText() {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var speechToText = document.querySelectorAll('.speech-to-text');
    if (SpeechRecognition !== undefined && SpeechRecognition !== null) {
      if (typeof speechToText !== 'undefined' && speechToText !== null) {
        var recognition = new SpeechRecognition();
        var toggler = document.querySelectorAll('.speech-to-text i');
        toggler.forEach(function (el) {
          var listening = false;
          el.addEventListener('click', function () {
            el.closest('.input-group').querySelector('.form-control').focus();
            recognition.onspeechstart = function () {
              listening = true;
            };
            if (listening === false) {
              recognition.start();
            }
            recognition.onerror = function () {
              listening = false;
            };
            recognition.onresult = function (event) {
              el.closest('.input-group').querySelector('.form-control').value = event.results[0][0].transcript;
            };
            recognition.onspeechend = function () {
              listening = false;
              recognition.stop();
            };
          });
        });
      }
    }
  },
  // ---
  // Init Navbar Dropdown (i.e notification) PerfectScrollbar
  initNavbarDropdownScrollbar: function initNavbarDropdownScrollbar() {
    var scrollbarContainer = document.querySelectorAll('.navbar-dropdown .scrollable-container');
    var _window4 = window,
      PerfectScrollbar = _window4.PerfectScrollbar;
    if (PerfectScrollbar !== undefined) {
      if (typeof scrollbarContainer !== 'undefined' && scrollbarContainer !== null) {
        scrollbarContainer.forEach(function (el) {
          // eslint-disable-next-line no-new
          new PerfectScrollbar(el, {
            wheelPropagation: false,
            suppressScrollX: true
          });
        });
      }
    }
  },
  // Ajax Call Promise
  ajaxCall: function ajaxCall(url) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = function () {
        return req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
      };
      req.onerror = function (e) {
        return reject(Error("Network Error: ".concat(e)));
      };
      req.send();
    });
  },
  // ---
  // SidebarToggle (Used in Apps)
  initSidebarToggle: function initSidebarToggle() {
    var sidebarToggler = document.querySelectorAll('[data-bs-toggle="sidebar"]');
    sidebarToggler.forEach(function (el) {
      el.addEventListener('click', function () {
        var target = el.getAttribute('data-target');
        var overlay = el.getAttribute('data-overlay');
        var appOverlay = document.querySelectorAll('.app-overlay');
        var targetEl = document.querySelectorAll(target);
        targetEl.forEach(function (tel) {
          tel.classList.toggle('show');
          if (typeof overlay !== 'undefined' && overlay !== null && overlay !== false && typeof appOverlay !== 'undefined') {
            if (tel.classList.contains('show')) {
              appOverlay[0].classList.add('show');
            } else {
              appOverlay[0].classList.remove('show');
            }
            appOverlay[0].addEventListener('click', function (e) {
              e.currentTarget.classList.remove('show');
              tel.classList.remove('show');
            });
          }
        });
      });
    });
  }
};

// *******************************************************************************
// * Initialization

if (typeof window !== 'undefined') {
  Helpers.init();
  if (Helpers.isMobileDevice() && window.chrome) {
    document.documentElement.classList.add('layout-menu-100vh');
  }

  // Update layout after page load
  if (document.readyState === 'complete') Helpers.update();else document.addEventListener('DOMContentLoaded', function onContentLoaded() {
    Helpers.update();
    document.removeEventListener('DOMContentLoaded', onContentLoaded);
  });
}

// ---

/******/ 	return __webpack_exports__;
/******/ })()
;
});
>>>>>>> Stashed changes
