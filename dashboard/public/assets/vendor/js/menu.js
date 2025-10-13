<<<<<<< Updated upstream
!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var i in n)("object"==typeof exports?exports:e)[i]=n[i]}}(self,(function(){return function(){"use strict";var e={d:function(t,n){for(var i in n)e.o(n,i)&&!e.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:n[i]})},o:function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};function n(e){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n(e)}function i(e){return function(e){if(Array.isArray(e))return o(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(e){if("string"==typeof e)return o(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?o(e,t):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=Array(t);n<t;n++)i[n]=e[n];return i}function r(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,s(i.key),i)}}function s(e){var t=function(e,t){if("object"!=n(e)||!e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var o=i.call(e,t||"default");if("object"!=n(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==n(t)?t:t+""}e.r(t),e.d(t,{Menu:function(){return a}});var l=["transitionend","webkitTransitionEnd","oTransitionEnd"],a=function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._el=t,this._horizontal="horizontal"===n.orientation,this._animate=!1!==n.animate,this._accordion=!1!==n.accordion,this._showDropdownOnHover=Boolean(n.showDropdownOnHover),this._closeChildren=Boolean(n.closeChildren),this._rtl="rtl"===document.documentElement.getAttribute("dir")||"rtl"===document.body.getAttribute("dir"),this._onOpen=n.onOpen||function(){},this._onOpened=n.onOpened||function(){},this._onClose=n.onClose||function(){},this._onClosed=n.onClosed||function(){},this._psScroll=null,this._topParent=null,this._menuBgClass=null,t.classList.add("menu"),t.classList[this._animate?"remove":"add"]("menu-no-animation"),this._horizontal){t.classList.add("menu-horizontal"),t.classList.remove("menu-vertical"),this._inner=t.querySelector(".menu-inner");var o=this._inner.parentNode;this._prevBtn=t.querySelector(".menu-horizontal-prev"),this._prevBtn||(this._prevBtn=document.createElement("a"),this._prevBtn.href="#",this._prevBtn.className="menu-horizontal-prev",o.appendChild(this._prevBtn)),this._wrapper=t.querySelector(".menu-horizontal-wrapper"),this._wrapper||(this._wrapper=document.createElement("div"),this._wrapper.className="menu-horizontal-wrapper",this._wrapper.appendChild(this._inner),o.appendChild(this._wrapper)),this._nextBtn=t.querySelector(".menu-horizontal-next"),this._nextBtn||(this._nextBtn=document.createElement("a"),this._nextBtn.href="#",this._nextBtn.className="menu-horizontal-next",o.appendChild(this._nextBtn)),this._innerPosition=0,this.update()}else{t.classList.add("menu-vertical"),t.classList.remove("menu-horizontal");var r=i||window.PerfectScrollbar;r?(this._scrollbar=new r(t.querySelector(".menu-inner"),{suppressScrollX:!0,wheelPropagation:!e._hasClass("layout-menu-fixed layout-menu-fixed-offcanvas")}),window.Helpers.menuPsScroll=this._scrollbar):t.querySelector(".menu-inner").classList.add("overflow-auto")}for(var s=t.classList,l=0;l<s.length;l++)s[l].startsWith("bg-")&&(this._menuBgClass=s[l]);t.setAttribute("data-bg-class",this._menuBgClass),this._horizontal&&window.innerWidth<window.Helpers.LAYOUT_BREAKPOINT&&this.switchMenu("vertical"),this._bindEvents(),t.menuInstance=this}return t=e,n=[{key:"_bindEvents",value:function(){var t=this;this._evntElClick=function(n){if(n.target.closest("ul")&&n.target.closest("ul").classList.contains("menu-inner")){var i=e._findParent(n.target,"menu-item",!1);i&&(t._topParent=i.childNodes[0])}var o=n.target.classList.contains("menu-toggle")?n.target:e._findParent(n.target,"menu-toggle",!1);o&&(n.preventDefault(),"true"!==o.getAttribute("data-hover")&&t.toggle(o))},(!this._showDropdownOnHover&&this._horizontal||!this._horizontal||window.Helpers.isMobileDevice)&&this._el.addEventListener("click",this._evntElClick),this._evntWindowResize=function(){t.update(),t._lastWidth!==window.innerWidth&&(t._lastWidth=window.innerWidth,t.update());var e=document.querySelector("[data-template^='horizontal-menu']");t._horizontal||e||t.manageScroll()},window.addEventListener("resize",this._evntWindowResize),this._horizontal&&(this._evntPrevBtnClick=function(e){e.preventDefault(),t._prevBtn.classList.contains("disabled")||t._slide("prev")},this._prevBtn.addEventListener("click",this._evntPrevBtnClick),this._evntNextBtnClick=function(e){e.preventDefault(),t._nextBtn.classList.contains("disabled")||t._slide("next")},this._nextBtn.addEventListener("click",this._evntNextBtnClick),this._evntBodyClick=function(e){!t._inner.contains(e.target)&&t._el.querySelectorAll(".menu-inner > .menu-item.open").length&&t.closeAll()},document.body.addEventListener("click",this._evntBodyClick),this._showDropdownOnHover&&(this._evntElMouseOver=function(e){if(e.target!==e.currentTarget&&!e.target.parentNode.classList.contains("open")){var n=e.target.classList.contains("menu-toggle")?e.target:null;n&&(e.preventDefault(),"true"!==n.getAttribute("data-hover")&&t.toggle(n))}e.stopPropagation()},this._horizontal&&window.screen.width>window.Helpers.LAYOUT_BREAKPOINT&&this._el.addEventListener("mouseover",this._evntElMouseOver),this._evntElMouseOut=function(n){var i=n.currentTarget,o=n.target,r=n.toElement||n.relatedTarget;if(o.closest("ul")&&o.closest("ul").classList.contains("menu-inner")&&(t._topParent=o),o!==i&&(o.parentNode.classList.contains("open")||!o.classList.contains("menu-toggle"))&&r&&r.parentNode&&!r.parentNode.classList.contains("menu-link")){if(t._topParent&&!e.childOf(r,t._topParent.parentNode)){var s=t._topParent.classList.contains("menu-toggle")?t._topParent:null;s&&(n.preventDefault(),"true"!==s.getAttribute("data-hover")&&(t.toggle(s),t._topParent=null))}if(e.childOf(r,o.parentNode))return;var l=o.classList.contains("menu-toggle")?o:null;l&&(n.preventDefault(),"true"!==l.getAttribute("data-hover")&&t.toggle(l))}n.stopPropagation()},this._horizontal&&window.screen.width>window.Helpers.LAYOUT_BREAKPOINT&&this._el.addEventListener("mouseout",this._evntElMouseOut)))}},{key:"_unbindEvents",value:function(){this._evntElClick&&(this._el.removeEventListener("click",this._evntElClick),this._evntElClick=null),this._evntElMouseOver&&(this._el.removeEventListener("mouseover",this._evntElMouseOver),this._evntElMouseOver=null),this._evntElMouseOut&&(this._el.removeEventListener("mouseout",this._evntElMouseOut),this._evntElMouseOut=null),this._evntWindowResize&&(window.removeEventListener("resize",this._evntWindowResize),this._evntWindowResize=null),this._evntBodyClick&&(document.body.removeEventListener("click",this._evntBodyClick),this._evntBodyClick=null),this._evntInnerMousemove&&(this._inner.removeEventListener("mousemove",this._evntInnerMousemove),this._evntInnerMousemove=null),this._evntInnerMouseleave&&(this._inner.removeEventListener("mouseleave",this._evntInnerMouseleave),this._evntInnerMouseleave=null)}},{key:"open",value:function(t){var n=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._closeChildren,o=this._findUnopenedParent(e._getItem(t,!0),i);if(o){var r=e._getLink(o,!0);e._promisify(this._onOpen,this,o,r,e._findMenu(o)).then((function(){n._horizontal&&e._isRoot(o)?(n._toggleDropdown(!0,o,i),n._onOpened&&n._onOpened(n,o,r,e._findMenu(o))):n._animate&&!n._horizontal?(window.requestAnimationFrame((function(){return n._toggleAnimation(!0,o,!1)})),n._accordion&&n._closeOther(o,i)):n._animate?(n._toggleDropdown(!0,o,i),n._onOpened&&n._onOpened(n,o,r,e._findMenu(o))):(o.classList.add("open"),n._onOpened&&n._onOpened(n,o,r,e._findMenu(o)),n._accordion&&n._closeOther(o,i))})).catch((function(){}))}}},{key:"close",value:function(t){var n=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._closeChildren,o=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=e._getItem(t,!0),s=e._getLink(t,!0);r.classList.contains("open")&&!r.classList.contains("disabled")&&e._promisify(this._onClose,this,r,s,e._findMenu(r),o).then((function(){if(n._horizontal&&e._isRoot(r))n._toggleDropdown(!1,r,i),n._onClosed&&n._onClosed(n,r,s,e._findMenu(r));else if(n._animate&&!n._horizontal)window.requestAnimationFrame((function(){return n._toggleAnimation(!1,r,i)}));else{if(r.classList.remove("open"),i)for(var t=r.querySelectorAll(".menu-item.open"),o=0,l=t.length;o<l;o++)t[o].classList.remove("open");n._onClosed&&n._onClosed(n,r,s,e._findMenu(r))}})).catch((function(){}))}},{key:"_closeOther",value:function(t,n){for(var i=e._findChild(t.parentNode,["menu-item","open"]),o=0,r=i.length;o<r;o++)i[o]!==t&&this.close(i[o],n)}},{key:"toggle",value:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._closeChildren,i=e._getItem(t,!0);i.classList.contains("open")?this.close(i,n):this.open(i,n)}},{key:"_toggleDropdown",value:function(t,n,i){var o=e._findMenu(n),r=n,s=!1;if(t){e._findParent(n,"menu-sub",!1)&&(s=!0,n=this._topParent?this._topParent.parentNode:n);var l=Math.round(this._wrapper.getBoundingClientRect().width),a=this._innerPosition,u=this._getItemOffset(n),c=Math.round(n.getBoundingClientRect().width);u-5<=-1*a?this._innerPosition=-1*u:u+a+c+5>=l&&(this._innerPosition=c>l?-1*u:-1*(u+c-l)),r.classList.add("open");var d=Math.round(o.getBoundingClientRect().width);s?u+this._innerPosition+2*d>l&&d<l&&d>=c&&(o.style.left=[this._rtl?"100%":"-100%"]):u+this._innerPosition+d>l&&d<l&&d>c&&(o.style[this._rtl?"marginRight":"marginLeft"]="-".concat(d-c,"px")),this._closeOther(r,i),this._updateSlider()}else{var h=e._findChild(n,["menu-toggle"]);if(h.length&&h[0].removeAttribute("data-hover","true"),n.classList.remove("open"),o.style[this._rtl?"marginRight":"marginLeft"]=null,i)for(var _=o.querySelectorAll(".menu-item.open"),v=0,m=_.length;v<m;v++)_[v].classList.remove("open")}}},{key:"_slide",value:function(e){var t,n=Math.round(this._wrapper.getBoundingClientRect().width),i=this._innerWidth;"next"===e?i+(t=this._getSlideNextPos())<n&&(t=n-i):(t=this._getSlidePrevPos())>0&&(t=0),this._innerPosition=t,this.update()}},{key:"_getSlideNextPos",value:function(){for(var e=Math.round(this._wrapper.getBoundingClientRect().width),t=this._innerPosition,n=this._inner.childNodes[0],i=0;n;){if(n.tagName){var o=Math.round(n.getBoundingClientRect().width);if(i+t-5<=e&&i+t+o+5>=e){o>e&&i===-1*t&&(i+=o);break}i+=o}n=n.nextSibling}return-1*i}},{key:"_getSlidePrevPos",value:function(){for(var e=Math.round(this._wrapper.getBoundingClientRect().width),t=this._innerPosition,n=this._inner.childNodes[0],i=0;n;){if(n.tagName){var o=Math.round(n.getBoundingClientRect().width);if(i-5<=-1*t&&i+o+5>=-1*t){o<=e&&(i=i+o-e);break}i+=o}n=n.nextSibling}return-1*i}},{key:"_findUnopenedParent",value:function(t,n){for(var i=[],o=null;t;)t.classList.contains("disabled")?(o=null,i=[]):(t.classList.contains("open")||(o=t),i.push(t)),t=e._findParent(t,"menu-item",!1);if(!o)return null;if(1===i.length)return o;for(var r=0,s=(i=i.slice(0,i.indexOf(o))).length;r<s;r++)if(i[r].classList.add("open"),this._accordion)for(var l=e._findChild(i[r].parentNode,["menu-item","open"]),a=0,u=l.length;a<u;a++)if(l[a]!==i[r]&&(l[a].classList.remove("open"),n))for(var c=l[a].querySelectorAll(".menu-item.open"),d=0,h=c.length;d<h;d++)c[d].classList.remove("open");return o}},{key:"_toggleAnimation",value:function(t,n,i){var o=this,r=e._getLink(n,!0),s=e._findMenu(n);e._unbindAnimationEndEvent(n);var l=Math.round(r.getBoundingClientRect().height);n.style.overflow="hidden";var a=function(){n.classList.remove("menu-item-animating"),n.classList.remove("menu-item-closing"),n.style.overflow=null,n.style.height=null,o._horizontal||o.update()};t?(n.style.height="".concat(l,"px"),n.classList.add("menu-item-animating"),n.classList.add("open"),e._bindAnimationEndEvent(n,(function(){a(),o._onOpened(o,n,r,s)})),setTimeout((function(){n.style.height="".concat(l+Math.round(s.getBoundingClientRect().height),"px")}),50)):(n.style.height="".concat(l+Math.round(s.getBoundingClientRect().height),"px"),n.classList.add("menu-item-animating"),n.classList.add("menu-item-closing"),e._bindAnimationEndEvent(n,(function(){if(n.classList.remove("open"),a(),i)for(var e=n.querySelectorAll(".menu-item.open"),t=0,l=e.length;t<l;t++)e[t].classList.remove("open");o._onClosed(o,n,r,s)})),setTimeout((function(){n.style.height="".concat(l,"px")}),50))}},{key:"_getItemOffset",value:function(e){for(var t=this._inner.childNodes[0],n=0;t!==e;)t.tagName&&(n+=Math.round(t.getBoundingClientRect().width)),t=t.nextSibling;return n}},{key:"_updateSlider",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,i=null!==e?e:Math.round(this._wrapper.getBoundingClientRect().width),o=null!==t?t:this._innerWidth,r=null!==n?n:this._innerPosition;o<i||window.innerWidth<window.Helpers.LAYOUT_BREAKPOINT?(this._prevBtn.classList.add("d-none"),this._nextBtn.classList.add("d-none")):(this._prevBtn.classList.remove("d-none"),this._nextBtn.classList.remove("d-none")),o>i&&window.innerWidth>window.Helpers.LAYOUT_BREAKPOINT&&(0===r?this._prevBtn.classList.add("disabled"):this._prevBtn.classList.remove("disabled"),o+r<=i?this._nextBtn.classList.add("disabled"):this._nextBtn.classList.remove("disabled"))}},{key:"_innerWidth",get:function(){for(var e=this._inner.childNodes,t=0,n=0,i=e.length;n<i;n++)e[n].tagName&&(t+=Math.round(e[n].getBoundingClientRect().width));return t}},{key:"_innerPosition",get:function(){return parseInt(this._inner.style[this._rtl?"marginRight":"marginLeft"]||"0px",10)},set:function(e){return this._inner.style[this._rtl?"marginRight":"marginLeft"]="".concat(e,"px"),e}},{key:"closeAll",value:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this._closeChildren,t=this._el.querySelectorAll(".menu-inner > .menu-item.open"),n=0,i=t.length;n<i;n++)this.close(t[n],e)}},{key:"update",value:function(){if(this._horizontal){this.closeAll();var e=Math.round(this._wrapper.getBoundingClientRect().width),t=this._innerWidth,n=this._innerPosition;e-n>t&&((n=e-t)>0&&(n=0),this._innerPosition=n),this._updateSlider(e,t,n)}else this._scrollbar&&this._scrollbar.update()}},{key:"manageScroll",value:function(){var e=window.PerfectScrollbar,t=document.querySelector(".menu-inner");if(window.innerWidth<window.Helpers.LAYOUT_BREAKPOINT)null!==this._scrollbar&&(this._scrollbar.destroy(),this._scrollbar=null),t.classList.add("overflow-auto");else{if(null===this._scrollbar){var n=new e(document.querySelector(".menu-inner"),{suppressScrollX:!0,wheelPropagation:!1});this._scrollbar=n}t.classList.remove("overflow-auto")}}},{key:"switchMenu",value:function(e){this._unbindEvents();var t=document.querySelector("nav.layout-navbar"),n=document.querySelector("#navbar-collapse"),o=document.querySelector("#layout-menu div"),r=document.querySelector("#layout-menu"),s=document.querySelector(".menu-horizontal-wrapper"),l=document.querySelector(".menu-inner"),a=document.querySelector(".app-brand"),u=document.querySelector(".layout-menu-toggle"),c=document.querySelectorAll(".menu-inner .active");if("vertical"===e){var d,h;this._horizontal=!1,o.insertBefore(a,s),o.insertBefore(l,s),o.classList.add("flex-column","p-0"),(d=r.classList).remove.apply(d,i(r.classList)),(h=r.classList).add.apply(h,["layout-menu","menu","menu-vertical"].concat([this._menuBgClass])),a.classList.remove("d-none","d-lg-flex"),u.classList.remove("d-none"),l.classList.add("overflow-auto");for(var _=0;_<c.length-1;++_)c[_].classList.add("open")}else{var v,m;this._horizontal=!0,t.children[0].insertBefore(a,n),a.classList.add("d-none","d-lg-flex"),s.appendChild(l),o.classList.remove("flex-column","p-0"),(v=r.classList).remove.apply(v,i(r.classList)),(m=r.classList).add.apply(m,["layout-menu-horizontal","menu","menu-horizontal","container-fluid","flex-grow-0"].concat([this._menuBgClass])),u.classList.add("d-none"),l.classList.remove("overflow-auto");for(var f=0;f<c.length;++f)c[f].classList.remove("open")}this._bindEvents()}},{key:"destroy",value:function(){if(this._el){this._unbindEvents();for(var t=this._el.querySelectorAll(".menu-item"),n=0,i=t.length;n<i;n++)e._unbindAnimationEndEvent(t[n]),t[n].classList.remove("menu-item-animating"),t[n].classList.remove("open"),t[n].style.overflow=null,t[n].style.height=null;for(var o=this._el.querySelectorAll(".menu-menu"),r=0,s=o.length;r<s;r++)o[r].style.marginRight=null,o[r].style.marginLeft=null;this._el.classList.remove("menu-no-animation"),this._wrapper&&(this._prevBtn.parentNode.removeChild(this._prevBtn),this._nextBtn.parentNode.removeChild(this._nextBtn),this._wrapper.parentNode.insertBefore(this._inner,this._wrapper),this._wrapper.parentNode.removeChild(this._wrapper),this._inner.style.marginLeft=null,this._inner.style.marginRight=null),this._el.menuInstance=null,delete this._el.menuInstance,this._el=null,this._horizontal=null,this._animate=null,this._accordion=null,this._showDropdownOnHover=null,this._closeChildren=null,this._rtl=null,this._onOpen=null,this._onOpened=null,this._onClose=null,this._onClosed=null,this._scrollbar&&(this._scrollbar.destroy(),this._scrollbar=null),this._inner=null,this._prevBtn=null,this._wrapper=null,this._nextBtn=null}}}],o=[{key:"childOf",value:function(e,t){if(e.parentNode){for(;(e=e.parentNode)&&e!==t;);return!!e}return!1}},{key:"_isRoot",value:function(t){return!e._findParent(t,"menu-item",!1)}},{key:"_findParent",value:function(e,t){var n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];if("BODY"===e.tagName.toUpperCase())return null;for(e=e.parentNode;"BODY"!==e.tagName.toUpperCase()&&!e.classList.contains(t);)e=e.parentNode;if(!(e="BODY"!==e.tagName.toUpperCase()?e:null)&&n)throw new Error("Cannot find `.".concat(t,"` parent element"));return e}},{key:"_findChild",value:function(e,t){for(var n=e.childNodes,i=[],o=0,r=n.length;o<r;o++)if(n[o].classList){for(var s=0,l=0;l<t.length;l++)n[o].classList.contains(t[l])&&(s+=1);t.length===s&&i.push(n[o])}return i}},{key:"_findMenu",value:function(e){for(var t=e.childNodes[0],n=null;t&&!n;)t.classList&&t.classList.contains("menu-sub")&&(n=t),t=t.nextSibling;if(!n)throw new Error("Cannot find `.menu-sub` element for the current `.menu-toggle`");return n}},{key:"_hasClass",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:window.Helpers.ROOT_EL,n=!1;return e.split(" ").forEach((function(e){t.classList.contains(e)&&(n=!0)})),n}},{key:"_getItem",value:function(t,n){var i=null,o=n?"menu-toggle":"menu-link";if(t.classList.contains("menu-item")?e._findChild(t,[o]).length&&(i=t):t.classList.contains(o)&&(i=t.parentNode.classList.contains("menu-item")?t.parentNode:null),!i)throw new Error("".concat(n?"Toggable ":"","`.menu-item` element not found."));return i}},{key:"_getLink",value:function(t,n){var i=[],o=n?"menu-toggle":"menu-link";if(t.classList.contains(o)?i=[t]:t.classList.contains("menu-item")&&(i=e._findChild(t,[o])),!i.length)throw new Error("`".concat(o,"` element not found."));return i[0]}},{key:"_bindAnimationEndEvent",value:function(t,n){var i=function(i){i.target===t&&(e._unbindAnimationEndEvent(t),n(i))},o=window.getComputedStyle(t).transitionDuration;o=parseFloat(o)*(-1!==o.indexOf("ms")?1:1e3),t._menuAnimationEndEventCb=i,l.forEach((function(e){return t.addEventListener(e,t._menuAnimationEndEventCb,!1)})),t._menuAnimationEndEventTimeout=setTimeout((function(){i({target:t})}),o+50)}},{key:"_promisify",value:function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];var o=e.apply(void 0,n);return o instanceof Promise?o:!1===o?Promise.reject():Promise.resolve()}},{key:"_unbindAnimationEndEvent",value:function(e){var t=e._menuAnimationEndEventCb;e._menuAnimationEndEventTimeout&&(clearTimeout(e._menuAnimationEndEventTimeout),e._menuAnimationEndEventTimeout=null),t&&(l.forEach((function(n){return e.removeEventListener(n,t,!1)})),e._menuAnimationEndEventCb=null)}},{key:"setDisabled",value:function(t,n){e._getItem(t,!1).classList[n?"add":"remove"]("disabled")}},{key:"isActive",value:function(t){return e._getItem(t,!1).classList.contains("active")}},{key:"isOpened",value:function(t){return e._getItem(t,!1).classList.contains("open")}},{key:"isDisabled",value:function(t){return e._getItem(t,!1).classList.contains("disabled")}}],n&&r(t.prototype,n),o&&r(t,o),Object.defineProperty(t,"prototype",{writable:!1}),t;var t,n,o}();return t}()}));
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
/*!********************************************!*\
  !*** ./resources/assets/vendor/js/menu.js ***!
  \********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Menu: function() { return /* binding */ Menu; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var TRANSITION_EVENTS = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd'];
// const TRANSITION_PROPERTIES = ['transition', 'MozTransition', 'webkitTransition', 'WebkitTransition', 'OTransition']
var DELTA = 5;
var Menu = /*#__PURE__*/function () {
  function Menu(el) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _PS = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    _classCallCheck(this, Menu);
    this._el = el;
    this._horizontal = config.orientation === 'horizontal';
    this._animate = config.animate !== false;
    this._accordion = config.accordion !== false;
    this._showDropdownOnHover = Boolean(config.showDropdownOnHover);
    this._closeChildren = Boolean(config.closeChildren);
    this._rtl = document.documentElement.getAttribute('dir') === 'rtl' || document.body.getAttribute('dir') === 'rtl';
    this._onOpen = config.onOpen || function () {};
    this._onOpened = config.onOpened || function () {};
    this._onClose = config.onClose || function () {};
    this._onClosed = config.onClosed || function () {};
    this._psScroll = null;
    this._topParent = null;
    this._menuBgClass = null;
    el.classList.add('menu');
    el.classList[this._animate ? 'remove' : 'add']('menu-no-animation');
    if (!this._horizontal) {
      el.classList.add('menu-vertical');
      el.classList.remove('menu-horizontal');
      var PerfectScrollbarLib = _PS || window.PerfectScrollbar;
      if (PerfectScrollbarLib) {
        this._scrollbar = new PerfectScrollbarLib(el.querySelector('.menu-inner'), {
          suppressScrollX: true,
          wheelPropagation: !Menu._hasClass('layout-menu-fixed layout-menu-fixed-offcanvas')
        });
        window.Helpers.menuPsScroll = this._scrollbar;
      } else {
        el.querySelector('.menu-inner').classList.add('overflow-auto');
      }
    } else {
      el.classList.add('menu-horizontal');
      el.classList.remove('menu-vertical');
      this._inner = el.querySelector('.menu-inner');
      var container = this._inner.parentNode;
      this._prevBtn = el.querySelector('.menu-horizontal-prev');
      if (!this._prevBtn) {
        this._prevBtn = document.createElement('a');
        this._prevBtn.href = '#';
        this._prevBtn.className = 'menu-horizontal-prev';
        container.appendChild(this._prevBtn);
      }
      this._wrapper = el.querySelector('.menu-horizontal-wrapper');
      if (!this._wrapper) {
        this._wrapper = document.createElement('div');
        this._wrapper.className = 'menu-horizontal-wrapper';
        this._wrapper.appendChild(this._inner);
        container.appendChild(this._wrapper);
      }
      this._nextBtn = el.querySelector('.menu-horizontal-next');
      if (!this._nextBtn) {
        this._nextBtn = document.createElement('a');
        this._nextBtn.href = '#';
        this._nextBtn.className = 'menu-horizontal-next';
        container.appendChild(this._nextBtn);
      }
      this._innerPosition = 0;
      this.update();
    }

    // Add data attribute for bg color class of menu
    var menuClassList = el.classList;
    for (var i = 0; i < menuClassList.length; i++) {
      if (menuClassList[i].startsWith('bg-')) {
        this._menuBgClass = menuClassList[i];
      }
    }
    el.setAttribute('data-bg-class', this._menuBgClass);

    // Switch to vertical menu on small screen for horizontal menu layout on page load
    if (this._horizontal && window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT) this.switchMenu('vertical');
    this._bindEvents();

    // Link menu instance to element
    el.menuInstance = this;
  }
  _createClass(Menu, [{
    key: "_bindEvents",
    value: function _bindEvents() {
      var _this = this;
      // Click Event
      this._evntElClick = function (e) {
        // Find top parent element
        if (e.target.closest('ul') && e.target.closest('ul').classList.contains('menu-inner')) {
          var menuItem = Menu._findParent(e.target, 'menu-item', false);

          // eslint-disable-next-line prefer-destructuring
          if (menuItem) _this._topParent = menuItem.childNodes[0];
        }
        var toggleLink = e.target.classList.contains('menu-toggle') ? e.target : Menu._findParent(e.target, 'menu-toggle', false);
        if (toggleLink) {
          e.preventDefault();
          if (toggleLink.getAttribute('data-hover') !== 'true') {
            _this.toggle(toggleLink);
          }
        }
      };
      if (!this._showDropdownOnHover && this._horizontal || !this._horizontal || window.Helpers.isMobileDevice) this._el.addEventListener('click', this._evntElClick);
      this._evntWindowResize = function () {
        _this.update();
        if (_this._lastWidth !== window.innerWidth) {
          _this._lastWidth = window.innerWidth;
          _this.update();
        }
        var horizontalMenuTemplate = document.querySelector("[data-template^='horizontal-menu']");
        if (!_this._horizontal && !horizontalMenuTemplate) _this.manageScroll();
      };
      window.addEventListener('resize', this._evntWindowResize);
      if (this._horizontal) {
        this._evntPrevBtnClick = function (e) {
          e.preventDefault();
          if (_this._prevBtn.classList.contains('disabled')) return;
          _this._slide('prev');
        };
        this._prevBtn.addEventListener('click', this._evntPrevBtnClick);
        this._evntNextBtnClick = function (e) {
          e.preventDefault();
          if (_this._nextBtn.classList.contains('disabled')) return;
          _this._slide('next');
        };
        this._nextBtn.addEventListener('click', this._evntNextBtnClick);
        this._evntBodyClick = function (e) {
          if (!_this._inner.contains(e.target) && _this._el.querySelectorAll('.menu-inner > .menu-item.open').length) _this.closeAll();
        };
        document.body.addEventListener('click', this._evntBodyClick);
        if (this._showDropdownOnHover) {
          /** ***********************************************
           * Horizontal Menu Mouse Over Event
           * ? e.target !== e.currentTarget condition to disable mouseover event on whole menu navbar
           * ? !e.target.parentNode.classList.contains('open') to disable mouseover events on icon, text and dropdown arrow
           */
          this._evntElMouseOver = function (e) {
            if (e.target !== e.currentTarget && !e.target.parentNode.classList.contains('open')) {
              var toggleLink = e.target.classList.contains('menu-toggle') ? e.target : null;
              if (toggleLink) {
                e.preventDefault();
                if (toggleLink.getAttribute('data-hover') !== 'true') {
                  _this.toggle(toggleLink);
                }
              }
            }
            e.stopPropagation();
          };
          if (this._horizontal && window.screen.width > window.Helpers.LAYOUT_BREAKPOINT) {
            this._el.addEventListener('mouseover', this._evntElMouseOver);
          }

          /** ***********************************************
           * Horizontal Menu Mouse Out Event
           * ? e.target !== e.currentTarget condition to disable mouseout event on whole menu navbar
           * ? mouseOutEl.parentNode.classList.contains('open') to check if the mouseout element has open class or not
           * ? !mouseOutEl.classList.contains('menu-toggle') to check if mouseout was from single menu item and not from the one which has submenu
           * ? !mouseOverEl.parentNode.classList.contains('menu-link') to disable mouseout event for icon, text and dropdown arrow
           */
          this._evntElMouseOut = function (e) {
            var mainEl = e.currentTarget;
            var mouseOutEl = e.target;
            var mouseOverEl = e.toElement || e.relatedTarget;

            // Find absolute parent of any menu item from which mouseout event triggered
            if (mouseOutEl.closest('ul') && mouseOutEl.closest('ul').classList.contains('menu-inner')) {
              _this._topParent = mouseOutEl;
            }
            if (mouseOutEl !== mainEl && (mouseOutEl.parentNode.classList.contains('open') || !mouseOutEl.classList.contains('menu-toggle')) && mouseOverEl && mouseOverEl.parentNode && !mouseOverEl.parentNode.classList.contains('menu-link')) {
              // When mouse goes totally out of menu items, check mouse over element to confirm it's not the child of menu, once confirmed close the menu
              if (_this._topParent && !Menu.childOf(mouseOverEl, _this._topParent.parentNode)) {
                var _toggleLink = _this._topParent.classList.contains('menu-toggle') ? _this._topParent : null;
                if (_toggleLink) {
                  e.preventDefault();
                  if (_toggleLink.getAttribute('data-hover') !== 'true') {
                    _this.toggle(_toggleLink);
                    _this._topParent = null;
                  }
                }
              }

              // When mouse enter the sub menu, check if it's child of the initially mouse overed menu item(Actual Parent),
              // if it's the parent do not close the sub menu else close the sub menu
              if (Menu.childOf(mouseOverEl, mouseOutEl.parentNode)) {
                return;
              }
              var toggleLink = mouseOutEl.classList.contains('menu-toggle') ? mouseOutEl : null;
              if (toggleLink) {
                e.preventDefault();
                if (toggleLink.getAttribute('data-hover') !== 'true') {
                  _this.toggle(toggleLink);
                }
              }
            }
            e.stopPropagation();
          };
          if (this._horizontal && window.screen.width > window.Helpers.LAYOUT_BREAKPOINT) {
            this._el.addEventListener('mouseout', this._evntElMouseOut);
          }
        }
      }
    }
  }, {
    key: "_unbindEvents",
    value: function _unbindEvents() {
      if (this._evntElClick) {
        this._el.removeEventListener('click', this._evntElClick);
        this._evntElClick = null;
      }
      if (this._evntElMouseOver) {
        this._el.removeEventListener('mouseover', this._evntElMouseOver);
        this._evntElMouseOver = null;
      }
      if (this._evntElMouseOut) {
        this._el.removeEventListener('mouseout', this._evntElMouseOut);
        this._evntElMouseOut = null;
      }
      if (this._evntWindowResize) {
        window.removeEventListener('resize', this._evntWindowResize);
        this._evntWindowResize = null;
      }
      if (this._evntBodyClick) {
        document.body.removeEventListener('click', this._evntBodyClick);
        this._evntBodyClick = null;
      }
      if (this._evntInnerMousemove) {
        this._inner.removeEventListener('mousemove', this._evntInnerMousemove);
        this._evntInnerMousemove = null;
      }
      if (this._evntInnerMouseleave) {
        this._inner.removeEventListener('mouseleave', this._evntInnerMouseleave);
        this._evntInnerMouseleave = null;
      }
    }
  }, {
    key: "open",
    value: function open(el) {
      var _this2 = this;
      var closeChildren = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._closeChildren;
      var item = this._findUnopenedParent(Menu._getItem(el, true), closeChildren);
      if (!item) return;
      var toggleLink = Menu._getLink(item, true);
      Menu._promisify(this._onOpen, this, item, toggleLink, Menu._findMenu(item)).then(function () {
        if (!_this2._horizontal || !Menu._isRoot(item)) {
          if (_this2._animate && !_this2._horizontal) {
            window.requestAnimationFrame(function () {
              return _this2._toggleAnimation(true, item, false);
            });
            if (_this2._accordion) _this2._closeOther(item, closeChildren);
          } else if (_this2._animate) {
            _this2._toggleDropdown(true, item, closeChildren);
            // eslint-disable-next-line no-unused-expressions
            _this2._onOpened && _this2._onOpened(_this2, item, toggleLink, Menu._findMenu(item));
          } else {
            item.classList.add('open');
            // eslint-disable-next-line no-unused-expressions
            _this2._onOpened && _this2._onOpened(_this2, item, toggleLink, Menu._findMenu(item));
            if (_this2._accordion) _this2._closeOther(item, closeChildren);
          }
        } else {
          _this2._toggleDropdown(true, item, closeChildren);
          // eslint-disable-next-line no-unused-expressions
          _this2._onOpened && _this2._onOpened(_this2, item, toggleLink, Menu._findMenu(item));
        }
      })["catch"](function () {});
    }
  }, {
    key: "close",
    value: function close(el) {
      var _this3 = this;
      var closeChildren = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._closeChildren;
      var _autoClose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var item = Menu._getItem(el, true);
      var toggleLink = Menu._getLink(el, true);
      if (!item.classList.contains('open') || item.classList.contains('disabled')) return;
      Menu._promisify(this._onClose, this, item, toggleLink, Menu._findMenu(item), _autoClose).then(function () {
        if (!_this3._horizontal || !Menu._isRoot(item)) {
          if (_this3._animate && !_this3._horizontal) {
            window.requestAnimationFrame(function () {
              return _this3._toggleAnimation(false, item, closeChildren);
            });
          } else {
            item.classList.remove('open');
            if (closeChildren) {
              var opened = item.querySelectorAll('.menu-item.open');
              for (var i = 0, l = opened.length; i < l; i++) opened[i].classList.remove('open');
            }

            // eslint-disable-next-line no-unused-expressions
            _this3._onClosed && _this3._onClosed(_this3, item, toggleLink, Menu._findMenu(item));
          }
        } else {
          _this3._toggleDropdown(false, item, closeChildren);
          // eslint-disable-next-line no-unused-expressions
          _this3._onClosed && _this3._onClosed(_this3, item, toggleLink, Menu._findMenu(item));
        }
      })["catch"](function () {});
    }
  }, {
    key: "_closeOther",
    value: function _closeOther(item, closeChildren) {
      var opened = Menu._findChild(item.parentNode, ['menu-item', 'open']);
      for (var i = 0, l = opened.length; i < l; i++) {
        if (opened[i] !== item) this.close(opened[i], closeChildren);
      }
    }
  }, {
    key: "toggle",
    value: function toggle(el) {
      var closeChildren = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._closeChildren;
      var item = Menu._getItem(el, true);
      // const toggleLink = Menu._getLink(el, true)

      if (item.classList.contains('open')) this.close(item, closeChildren);else this.open(item, closeChildren);
    }
  }, {
    key: "_toggleDropdown",
    value: function _toggleDropdown(show, item, closeChildren) {
      var menu = Menu._findMenu(item);
      var actualItem = item;
      var subMenuItem = false;
      if (show) {
        if (Menu._findParent(item, 'menu-sub', false)) {
          subMenuItem = true;
          item = this._topParent ? this._topParent.parentNode : item;
        }
        var wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width);
        var position = this._innerPosition;
        var itemOffset = this._getItemOffset(item);
        var itemWidth = Math.round(item.getBoundingClientRect().width);
        if (itemOffset - DELTA <= -1 * position) {
          this._innerPosition = -1 * itemOffset;
        } else if (itemOffset + position + itemWidth + DELTA >= wrapperWidth) {
          if (itemWidth > wrapperWidth) {
            this._innerPosition = -1 * itemOffset;
          } else {
            this._innerPosition = -1 * (itemOffset + itemWidth - wrapperWidth);
          }
        }
        actualItem.classList.add('open');
        var menuWidth = Math.round(menu.getBoundingClientRect().width);
        if (subMenuItem) {
          if (itemOffset + this._innerPosition + menuWidth * 2 > wrapperWidth && menuWidth < wrapperWidth && menuWidth >= itemWidth) {
            menu.style.left = [this._rtl ? '100%' : '-100%'];
          }
        } else if (itemOffset + this._innerPosition + menuWidth > wrapperWidth && menuWidth < wrapperWidth && menuWidth > itemWidth) {
          menu.style[this._rtl ? 'marginRight' : 'marginLeft'] = "-".concat(menuWidth - itemWidth, "px");
        }
        this._closeOther(actualItem, closeChildren);
        this._updateSlider();
      } else {
        var toggle = Menu._findChild(item, ['menu-toggle']);

        // eslint-disable-next-line no-unused-expressions
        toggle.length && toggle[0].removeAttribute('data-hover', 'true');
        item.classList.remove('open');
        menu.style[this._rtl ? 'marginRight' : 'marginLeft'] = null;
        if (closeChildren) {
          var opened = menu.querySelectorAll('.menu-item.open');
          for (var i = 0, l = opened.length; i < l; i++) opened[i].classList.remove('open');
        }
      }
    }
  }, {
    key: "_slide",
    value: function _slide(direction) {
      var wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width);
      var innerWidth = this._innerWidth;
      var newPosition;
      if (direction === 'next') {
        newPosition = this._getSlideNextPos();
        if (innerWidth + newPosition < wrapperWidth) {
          newPosition = wrapperWidth - innerWidth;
        }
      } else {
        newPosition = this._getSlidePrevPos();
        if (newPosition > 0) newPosition = 0;
      }
      this._innerPosition = newPosition;
      this.update();
    }
  }, {
    key: "_getSlideNextPos",
    value: function _getSlideNextPos() {
      var wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width);
      var position = this._innerPosition;
      var curItem = this._inner.childNodes[0];
      var left = 0;
      while (curItem) {
        if (curItem.tagName) {
          var curItemWidth = Math.round(curItem.getBoundingClientRect().width);
          if (left + position - DELTA <= wrapperWidth && left + position + curItemWidth + DELTA >= wrapperWidth) {
            if (curItemWidth > wrapperWidth && left === -1 * position) left += curItemWidth;
            break;
          }
          left += curItemWidth;
        }
        curItem = curItem.nextSibling;
      }
      return -1 * left;
    }
  }, {
    key: "_getSlidePrevPos",
    value: function _getSlidePrevPos() {
      var wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width);
      var position = this._innerPosition;
      var curItem = this._inner.childNodes[0];
      var left = 0;
      while (curItem) {
        if (curItem.tagName) {
          var curItemWidth = Math.round(curItem.getBoundingClientRect().width);
          if (left - DELTA <= -1 * position && left + curItemWidth + DELTA >= -1 * position) {
            if (curItemWidth <= wrapperWidth) left = left + curItemWidth - wrapperWidth;
            break;
          }
          left += curItemWidth;
        }
        curItem = curItem.nextSibling;
      }
      return -1 * left;
    }
  }, {
    key: "_findUnopenedParent",
    value: function _findUnopenedParent(item, closeChildren) {
      var tree = [];
      var parentItem = null;
      while (item) {
        if (item.classList.contains('disabled')) {
          parentItem = null;
          tree = [];
        } else {
          if (!item.classList.contains('open')) parentItem = item;
          tree.push(item);
        }
        item = Menu._findParent(item, 'menu-item', false);
      }
      if (!parentItem) return null;
      if (tree.length === 1) return parentItem;
      tree = tree.slice(0, tree.indexOf(parentItem));
      for (var i = 0, l = tree.length; i < l; i++) {
        tree[i].classList.add('open');
        if (this._accordion) {
          var openedItems = Menu._findChild(tree[i].parentNode, ['menu-item', 'open']);
          for (var j = 0, k = openedItems.length; j < k; j++) {
            if (openedItems[j] !== tree[i]) {
              openedItems[j].classList.remove('open');
              if (closeChildren) {
                var openedChildren = openedItems[j].querySelectorAll('.menu-item.open');
                for (var x = 0, z = openedChildren.length; x < z; x++) {
                  openedChildren[x].classList.remove('open');
                }
              }
            }
          }
        }
      }
      return parentItem;
    }
  }, {
    key: "_toggleAnimation",
    value: function _toggleAnimation(open, item, closeChildren) {
      var _this4 = this;
      var toggleLink = Menu._getLink(item, true);
      var menu = Menu._findMenu(item);
      Menu._unbindAnimationEndEvent(item);
      var linkHeight = Math.round(toggleLink.getBoundingClientRect().height);
      item.style.overflow = 'hidden';
      var clearItemStyle = function clearItemStyle() {
        item.classList.remove('menu-item-animating');
        item.classList.remove('menu-item-closing');
        item.style.overflow = null;
        item.style.height = null;
        if (!_this4._horizontal) _this4.update();
      };
      if (open) {
        item.style.height = "".concat(linkHeight, "px");
        item.classList.add('menu-item-animating');
        item.classList.add('open');
        Menu._bindAnimationEndEvent(item, function () {
          clearItemStyle();
          _this4._onOpened(_this4, item, toggleLink, menu);
        });
        setTimeout(function () {
          item.style.height = "".concat(linkHeight + Math.round(menu.getBoundingClientRect().height), "px");
        }, 50);
      } else {
        item.style.height = "".concat(linkHeight + Math.round(menu.getBoundingClientRect().height), "px");
        item.classList.add('menu-item-animating');
        item.classList.add('menu-item-closing');
        Menu._bindAnimationEndEvent(item, function () {
          item.classList.remove('open');
          clearItemStyle();
          if (closeChildren) {
            var opened = item.querySelectorAll('.menu-item.open');
            for (var i = 0, l = opened.length; i < l; i++) opened[i].classList.remove('open');
          }
          _this4._onClosed(_this4, item, toggleLink, menu);
        });
        setTimeout(function () {
          item.style.height = "".concat(linkHeight, "px");
        }, 50);
      }
    }
  }, {
    key: "_getItemOffset",
    value: function _getItemOffset(item) {
      var curItem = this._inner.childNodes[0];
      var left = 0;
      while (curItem !== item) {
        if (curItem.tagName) {
          left += Math.round(curItem.getBoundingClientRect().width);
        }
        curItem = curItem.nextSibling;
      }
      return left;
    }
  }, {
    key: "_updateSlider",
    value: function _updateSlider() {
      var wrapperWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var innerWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var _wrapperWidth = wrapperWidth !== null ? wrapperWidth : Math.round(this._wrapper.getBoundingClientRect().width);
      var _innerWidth = innerWidth !== null ? innerWidth : this._innerWidth;
      var _position = position !== null ? position : this._innerPosition;
      if (_innerWidth < _wrapperWidth || window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT) {
        this._prevBtn.classList.add('d-none');
        this._nextBtn.classList.add('d-none');
      } else {
        this._prevBtn.classList.remove('d-none');
        this._nextBtn.classList.remove('d-none');
      }
      if (_innerWidth > _wrapperWidth && window.innerWidth > window.Helpers.LAYOUT_BREAKPOINT) {
        if (_position === 0) this._prevBtn.classList.add('disabled');else this._prevBtn.classList.remove('disabled');
        if (_innerWidth + _position <= _wrapperWidth) this._nextBtn.classList.add('disabled');else this._nextBtn.classList.remove('disabled');
      }
    }
  }, {
    key: "_innerWidth",
    get: function get() {
      var items = this._inner.childNodes;
      var width = 0;
      for (var i = 0, l = items.length; i < l; i++) {
        if (items[i].tagName) {
          width += Math.round(items[i].getBoundingClientRect().width);
        }
      }
      return width;
    }
  }, {
    key: "_innerPosition",
    get: function get() {
      return parseInt(this._inner.style[this._rtl ? 'marginRight' : 'marginLeft'] || '0px', 10);
    },
    set: function set(value) {
      this._inner.style[this._rtl ? 'marginRight' : 'marginLeft'] = "".concat(value, "px");
      return value;
    }
  }, {
    key: "closeAll",
    value: function closeAll() {
      var closeChildren = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._closeChildren;
      var opened = this._el.querySelectorAll('.menu-inner > .menu-item.open');
      for (var i = 0, l = opened.length; i < l; i++) this.close(opened[i], closeChildren);
    }
  }, {
    key: "update",
    value: function update() {
      if (!this._horizontal) {
        if (this._scrollbar) {
          this._scrollbar.update();
        }
      } else {
        this.closeAll();
        var wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width);
        var innerWidth = this._innerWidth;
        var position = this._innerPosition;
        if (wrapperWidth - position > innerWidth) {
          position = wrapperWidth - innerWidth;
          if (position > 0) position = 0;
          this._innerPosition = position;
        }
        this._updateSlider(wrapperWidth, innerWidth, position);
      }
    }
  }, {
    key: "manageScroll",
    value: function manageScroll() {
      var _window = window,
        PerfectScrollbar = _window.PerfectScrollbar;
      var menuInner = document.querySelector('.menu-inner');
      if (window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT) {
        if (this._scrollbar !== null) {
          // window.Helpers.menuPsScroll.destroy()
          this._scrollbar.destroy();
          this._scrollbar = null;
        }
        menuInner.classList.add('overflow-auto');
      } else {
        if (this._scrollbar === null) {
          var menuScroll = new PerfectScrollbar(document.querySelector('.menu-inner'), {
            suppressScrollX: true,
            wheelPropagation: false
          });
          // window.Helpers.menuPsScroll = menuScroll
          this._scrollbar = menuScroll;
        }
        menuInner.classList.remove('overflow-auto');
      }
    }
  }, {
    key: "switchMenu",
    value: function switchMenu(menu) {
      // Unbind Events
      this._unbindEvents();

      // const html = document.documentElement
      var navbar = document.querySelector('nav.layout-navbar');
      var navbarCollapse = document.querySelector('#navbar-collapse');
      /* const fullNavbar = document.querySelector('.layout-navbar-full')
      const contentNavbar = document.querySelector('.layout-content-navbar')
      const contentWrapper = document.querySelector('.content-wrapper') */
      var asideMenuWrapper = document.querySelector('#layout-menu div');
      var asideMenu = document.querySelector('#layout-menu');
      var horzMenuClasses = ['layout-menu-horizontal', 'menu', 'menu-horizontal', 'container-fluid', 'flex-grow-0'];
      var vertMenuClasses = ['layout-menu', 'menu', 'menu-vertical'];
      var horzMenuWrapper = document.querySelector('.menu-horizontal-wrapper');
      var menuInner = document.querySelector('.menu-inner');
      var brand = document.querySelector('.app-brand');
      var menuToggler = document.querySelector('.layout-menu-toggle');
      var activeMenuItems = document.querySelectorAll('.menu-inner .active');
      /* const layoutPage = document.querySelector('.layout-page')
      const layoutContainer = document.querySelector('.layout-container')
      const content = document.querySelector('.container-fluid') */

      // const { PerfectScrollbar } = window

      if (menu === 'vertical') {
        var _asideMenu$classList, _asideMenu$classList2;
        this._horizontal = false;
        asideMenuWrapper.insertBefore(brand, horzMenuWrapper);
        asideMenuWrapper.insertBefore(menuInner, horzMenuWrapper);
        asideMenuWrapper.classList.add('flex-column', 'p-0');
        (_asideMenu$classList = asideMenu.classList).remove.apply(_asideMenu$classList, _toConsumableArray(asideMenu.classList));
        (_asideMenu$classList2 = asideMenu.classList).add.apply(_asideMenu$classList2, vertMenuClasses.concat([this._menuBgClass]));
        brand.classList.remove('d-none', 'd-lg-flex');
        menuToggler.classList.remove('d-none');
        // if (PerfectScrollbar !== undefined) {
        //   this._psScroll = new PerfectScrollbar(document.querySelector('.menu-inner'), {
        //     suppressScrollX: true,
        //     wheelPropagation: !Menu._hasClass('layout-menu-fixed layout-menu-fixed-offcanvas')
        //   })
        // }

        menuInner.classList.add('overflow-auto');

        // Add open class to active items
        for (var i = 0; i < activeMenuItems.length - 1; ++i) {
          activeMenuItems[i].classList.add('open');
        }
      } else {
        var _asideMenu$classList3, _asideMenu$classList4;
        this._horizontal = true;
        navbar.children[0].insertBefore(brand, navbarCollapse);
        brand.classList.add('d-none', 'd-lg-flex');
        horzMenuWrapper.appendChild(menuInner);
        asideMenuWrapper.classList.remove('flex-column', 'p-0');
        (_asideMenu$classList3 = asideMenu.classList).remove.apply(_asideMenu$classList3, _toConsumableArray(asideMenu.classList));
        (_asideMenu$classList4 = asideMenu.classList).add.apply(_asideMenu$classList4, horzMenuClasses.concat([this._menuBgClass]));
        menuToggler.classList.add('d-none');
        menuInner.classList.remove('overflow-auto');

        // if (PerfectScrollbar !== undefined && this._psScroll !== null) {
        //   this._psScroll.destroy()
        //   this._psScroll = null
        // }

        // Remove open class from active items
        for (var _i = 0; _i < activeMenuItems.length; ++_i) {
          activeMenuItems[_i].classList.remove('open');
        }
      }
      this._bindEvents();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (!this._el) return;
      this._unbindEvents();
      var items = this._el.querySelectorAll('.menu-item');
      for (var i = 0, l = items.length; i < l; i++) {
        Menu._unbindAnimationEndEvent(items[i]);
        items[i].classList.remove('menu-item-animating');
        items[i].classList.remove('open');
        items[i].style.overflow = null;
        items[i].style.height = null;
      }
      var menus = this._el.querySelectorAll('.menu-menu');
      for (var i2 = 0, l2 = menus.length; i2 < l2; i2++) {
        menus[i2].style.marginRight = null;
        menus[i2].style.marginLeft = null;
      }
      this._el.classList.remove('menu-no-animation');
      if (this._wrapper) {
        this._prevBtn.parentNode.removeChild(this._prevBtn);
        this._nextBtn.parentNode.removeChild(this._nextBtn);
        this._wrapper.parentNode.insertBefore(this._inner, this._wrapper);
        this._wrapper.parentNode.removeChild(this._wrapper);
        this._inner.style.marginLeft = null;
        this._inner.style.marginRight = null;
      }
      this._el.menuInstance = null;
      delete this._el.menuInstance;
      this._el = null;
      this._horizontal = null;
      this._animate = null;
      this._accordion = null;
      this._showDropdownOnHover = null;
      this._closeChildren = null;
      this._rtl = null;
      this._onOpen = null;
      this._onOpened = null;
      this._onClose = null;
      this._onClosed = null;
      if (this._scrollbar) {
        this._scrollbar.destroy();
        this._scrollbar = null;
      }
      this._inner = null;
      this._prevBtn = null;
      this._wrapper = null;
      this._nextBtn = null;
    }
  }], [{
    key: "childOf",
    value: function childOf( /* child node */c, /* parent node */p) {
      // returns boolean
      if (c.parentNode) {
        while ((c = c.parentNode) && c !== p);
        return !!c;
      }
      return false;
    }
  }, {
    key: "_isRoot",
    value: function _isRoot(item) {
      return !Menu._findParent(item, 'menu-item', false);
    }
  }, {
    key: "_findParent",
    value: function _findParent(el, cls) {
      var throwError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      if (el.tagName.toUpperCase() === 'BODY') return null;
      el = el.parentNode;
      while (el.tagName.toUpperCase() !== 'BODY' && !el.classList.contains(cls)) {
        el = el.parentNode;
      }
      el = el.tagName.toUpperCase() !== 'BODY' ? el : null;
      if (!el && throwError) throw new Error("Cannot find `.".concat(cls, "` parent element"));
      return el;
    }
  }, {
    key: "_findChild",
    value: function _findChild(el, cls) {
      var items = el.childNodes;
      var found = [];
      for (var i = 0, l = items.length; i < l; i++) {
        if (items[i].classList) {
          var passed = 0;
          for (var j = 0; j < cls.length; j++) {
            if (items[i].classList.contains(cls[j])) passed += 1;
          }
          if (cls.length === passed) found.push(items[i]);
        }
      }
      return found;
    }
  }, {
    key: "_findMenu",
    value: function _findMenu(item) {
      var curEl = item.childNodes[0];
      var menu = null;
      while (curEl && !menu) {
        if (curEl.classList && curEl.classList.contains('menu-sub')) menu = curEl;
        curEl = curEl.nextSibling;
      }
      if (!menu) throw new Error('Cannot find `.menu-sub` element for the current `.menu-toggle`');
      return menu;
    }

    // Has class
  }, {
    key: "_hasClass",
    value: function _hasClass(cls) {
      var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.Helpers.ROOT_EL;
      var result = false;
      cls.split(' ').forEach(function (c) {
        if (el.classList.contains(c)) result = true;
      });
      return result;
    }
  }, {
    key: "_getItem",
    value: function _getItem(el, toggle) {
      var item = null;
      var selector = toggle ? 'menu-toggle' : 'menu-link';
      if (el.classList.contains('menu-item')) {
        if (Menu._findChild(el, [selector]).length) item = el;
      } else if (el.classList.contains(selector)) {
        item = el.parentNode.classList.contains('menu-item') ? el.parentNode : null;
      }
      if (!item) {
        throw new Error("".concat(toggle ? 'Toggable ' : '', "`.menu-item` element not found."));
      }
      return item;
    }
  }, {
    key: "_getLink",
    value: function _getLink(el, toggle) {
      var found = [];
      var selector = toggle ? 'menu-toggle' : 'menu-link';
      if (el.classList.contains(selector)) found = [el];else if (el.classList.contains('menu-item')) found = Menu._findChild(el, [selector]);
      if (!found.length) throw new Error("`".concat(selector, "` element not found."));
      return found[0];
    }
  }, {
    key: "_bindAnimationEndEvent",
    value: function _bindAnimationEndEvent(el, handler) {
      var cb = function cb(e) {
        if (e.target !== el) return;
        Menu._unbindAnimationEndEvent(el);
        handler(e);
      };
      var duration = window.getComputedStyle(el).transitionDuration;
      duration = parseFloat(duration) * (duration.indexOf('ms') !== -1 ? 1 : 1000);
      el._menuAnimationEndEventCb = cb;
      TRANSITION_EVENTS.forEach(function (ev) {
        return el.addEventListener(ev, el._menuAnimationEndEventCb, false);
      });
      el._menuAnimationEndEventTimeout = setTimeout(function () {
        cb({
          target: el
        });
      }, duration + 50);
    }
  }, {
    key: "_promisify",
    value: function _promisify(fn) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      var result = fn.apply(void 0, args);
      if (result instanceof Promise) {
        return result;
      }
      if (result === false) {
        return Promise.reject();
      }
      return Promise.resolve();
    }
  }, {
    key: "_unbindAnimationEndEvent",
    value: function _unbindAnimationEndEvent(el) {
      var cb = el._menuAnimationEndEventCb;
      if (el._menuAnimationEndEventTimeout) {
        clearTimeout(el._menuAnimationEndEventTimeout);
        el._menuAnimationEndEventTimeout = null;
      }
      if (!cb) return;
      TRANSITION_EVENTS.forEach(function (ev) {
        return el.removeEventListener(ev, cb, false);
      });
      el._menuAnimationEndEventCb = null;
    }
  }, {
    key: "setDisabled",
    value: function setDisabled(el, disabled) {
      Menu._getItem(el, false).classList[disabled ? 'add' : 'remove']('disabled');
    }
  }, {
    key: "isActive",
    value: function isActive(el) {
      return Menu._getItem(el, false).classList.contains('active');
    }
  }, {
    key: "isOpened",
    value: function isOpened(el) {
      return Menu._getItem(el, false).classList.contains('open');
    }
  }, {
    key: "isDisabled",
    value: function isDisabled(el) {
      return Menu._getItem(el, false).classList.contains('disabled');
    }
  }]);
  return Menu;
}();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
>>>>>>> Stashed changes
