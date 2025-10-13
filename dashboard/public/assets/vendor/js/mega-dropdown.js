<<<<<<< Updated upstream
!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n=e();for(var i in n)("object"==typeof exports?exports:t)[i]=n[i]}}(self,(function(){return function(){"use strict";var t={d:function(e,n){for(var i in n)t.o(n,i)&&!t.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:n[i]})},o:function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r:function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};function n(t){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(t)}function i(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,o(i.key),i)}}function o(t){var e=function(t,e){if("object"!=n(t)||!t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,e||"default");if("object"!=n(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==n(e)?e:e+""}t.r(e),t.d(e,{MegaDropdown:function(){return s}});var s=function(){function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._onHover="hover"===n.trigger||"hover"===e.getAttribute("data-trigger"),this._container=t._findParent(e,"mega-dropdown"),this._container&&(this._menu=this._container.querySelector(".dropdown-toggle ~ .dropdown-menu"),this._menu&&(e.setAttribute("aria-expanded","false"),this._el=e,this._bindEvents()))}return e=t,n=[{key:"open",value:function(){this._timeout&&(clearTimeout(this._timeout),this._timeout=null),this._focusTimeout&&(clearTimeout(this._focusTimeout),this._focusTimeout=null),"true"!==this._el.getAttribute("aria-expanded")&&(this._triggerEvent("show"),this._container.classList.add("show"),this._menu.classList.add("show"),this._el.setAttribute("aria-expanded","true"),this._el.focus(),this._triggerEvent("shown"))}},{key:"close",value:function(t){var e=this;this._timeout&&(clearTimeout(this._timeout),this._timeout=null),this._focusTimeout&&(clearTimeout(this._focusTimeout),this._focusTimeout=null),this._onHover&&!t?this._timeout=setTimeout((function(){e._timeout&&(clearTimeout(e._timeout),e._timeout=null),e._close()}),150):this._close()}},{key:"toggle",value:function(){"true"===this._el.getAttribute("aria-expanded")?this.close(!0):this.open()}},{key:"destroy",value:function(){this._unbindEvents(),this._el=null,this._timeout&&(clearTimeout(this._timeout),this._timeout=null),this._focusTimeout&&(clearTimeout(this._focusTimeout),this._focusTimeout=null)}},{key:"_close",value:function(){"true"===this._el.getAttribute("aria-expanded")&&(this._triggerEvent("hide"),this._container.classList.remove("show"),this._menu.classList.remove("show"),this._el.setAttribute("aria-expanded","false"),this._triggerEvent("hidden"))}},{key:"_bindEvents",value:function(){var e=this;this._elClickEvnt=function(t){t.preventDefault(),e.toggle()},this._el.addEventListener("click",this._elClickEvnt),this._bodyClickEvnt=function(t){!e._container.contains(t.target)&&e._container.classList.contains("show")&&e.close(!0)},document.body.addEventListener("click",this._bodyClickEvnt,!0),this._menuClickEvnt=function(t){t.target.classList.contains("mega-dropdown-link")&&e.close(!0)},this._menu.addEventListener("click",this._menuClickEvnt,!0),this._focusoutEvnt=function(){e._focusTimeout&&(clearTimeout(e._focusTimeout),e._focusTimeout=null),"true"===e._el.getAttribute("aria-expanded")&&(e._focusTimeout=setTimeout((function(){"BODY"!==document.activeElement.tagName.toUpperCase()&&t._findParent(document.activeElement,"mega-dropdown")!==e._container&&e.close(!0)}),100))},this._container.addEventListener("focusout",this._focusoutEvnt,!0),this._onHover&&(this._enterEvnt=function(){"static"!==window.getComputedStyle(e._menu,null).getPropertyValue("position")&&e.open()},this._leaveEvnt=function(){"static"!==window.getComputedStyle(e._menu,null).getPropertyValue("position")&&e.close()},this._el.addEventListener("mouseenter",this._enterEvnt),this._menu.addEventListener("mouseenter",this._enterEvnt),this._el.addEventListener("mouseleave",this._leaveEvnt),this._menu.addEventListener("mouseleave",this._leaveEvnt))}},{key:"_unbindEvents",value:function(){this._elClickEvnt&&(this._el.removeEventListener("click",this._elClickEvnt),this._elClickEvnt=null),this._bodyClickEvnt&&(document.body.removeEventListener("click",this._bodyClickEvnt,!0),this._bodyClickEvnt=null),this._menuClickEvnt&&(this._menu.removeEventListener("click",this._menuClickEvnt,!0),this._menuClickEvnt=null),this._focusoutEvnt&&(this._container.removeEventListener("focusout",this._focusoutEvnt,!0),this._focusoutEvnt=null),this._enterEvnt&&(this._el.removeEventListener("mouseenter",this._enterEvnt),this._menu.removeEventListener("mouseenter",this._enterEvnt),this._enterEvnt=null),this._leaveEvnt&&(this._el.removeEventListener("mouseleave",this._leaveEvnt),this._menu.removeEventListener("mouseleave",this._leaveEvnt),this._leaveEvnt=null)}},{key:"_triggerEvent",value:function(t){var e;document.createEvent?("function"==typeof Event?e=new Event(t):(e=document.createEvent("Event")).initEvent(t,!1,!0),this._container.dispatchEvent(e)):this._container.fireEvent("on".concat(t),document.createEventObject())}}],o=[{key:"_findParent",value:function(t,e){if("BODY"===t.tagName.toUpperCase())return null;for(t=t.parentNode;"BODY"!==t.tagName.toUpperCase()&&!t.classList.contains(e);)t=t.parentNode;return"BODY"!==t.tagName.toUpperCase()?t:null}}],n&&i(e.prototype,n),o&&i(e,o),Object.defineProperty(e,"prototype",{writable:!1}),e;var e,n,o}();return e}()}));
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
/*!*****************************************************!*\
  !*** ./resources/assets/vendor/js/mega-dropdown.js ***!
  \*****************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MegaDropdown: function() { return /* binding */ MegaDropdown; }
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var TIMEOUT = 150;
var MegaDropdown = /*#__PURE__*/function () {
  function MegaDropdown(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, MegaDropdown);
    this._onHover = options.trigger === 'hover' || element.getAttribute('data-trigger') === 'hover';
    this._container = MegaDropdown._findParent(element, 'mega-dropdown');
    if (!this._container) return;
    this._menu = this._container.querySelector('.dropdown-toggle ~ .dropdown-menu');
    if (!this._menu) return;
    element.setAttribute('aria-expanded', 'false');
    this._el = element;
    this._bindEvents();
  }
  _createClass(MegaDropdown, [{
    key: "open",
    value: function open() {
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }
      if (this._focusTimeout) {
        clearTimeout(this._focusTimeout);
        this._focusTimeout = null;
      }
      if (this._el.getAttribute('aria-expanded') !== 'true') {
        this._triggerEvent('show');
        this._container.classList.add('show');
        this._menu.classList.add('show');
        this._el.setAttribute('aria-expanded', 'true');
        this._el.focus();
        this._triggerEvent('shown');
      }
    }
  }, {
    key: "close",
    value: function close(force) {
      var _this = this;
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }
      if (this._focusTimeout) {
        clearTimeout(this._focusTimeout);
        this._focusTimeout = null;
      }
      if (this._onHover && !force) {
        this._timeout = setTimeout(function () {
          if (_this._timeout) {
            clearTimeout(_this._timeout);
            _this._timeout = null;
          }
          _this._close();
        }, TIMEOUT);
      } else {
        this._close();
      }
    }
  }, {
    key: "toggle",
    value: function toggle() {
      // eslint-disable-next-line no-unused-expressions
      this._el.getAttribute('aria-expanded') === 'true' ? this.close(true) : this.open();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this._unbindEvents();
      this._el = null;
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }
      if (this._focusTimeout) {
        clearTimeout(this._focusTimeout);
        this._focusTimeout = null;
      }
    }
  }, {
    key: "_close",
    value: function _close() {
      if (this._el.getAttribute('aria-expanded') === 'true') {
        this._triggerEvent('hide');
        this._container.classList.remove('show');
        this._menu.classList.remove('show');
        this._el.setAttribute('aria-expanded', 'false');
        this._triggerEvent('hidden');
      }
    }
  }, {
    key: "_bindEvents",
    value: function _bindEvents() {
      var _this2 = this;
      this._elClickEvnt = function (e) {
        e.preventDefault();
        _this2.toggle();
      };
      this._el.addEventListener('click', this._elClickEvnt);
      this._bodyClickEvnt = function (e) {
        if (!_this2._container.contains(e.target) && _this2._container.classList.contains('show')) {
          _this2.close(true);
        }
      };
      document.body.addEventListener('click', this._bodyClickEvnt, true);
      this._menuClickEvnt = function (e) {
        if (e.target.classList.contains('mega-dropdown-link')) {
          _this2.close(true);
        }
      };
      this._menu.addEventListener('click', this._menuClickEvnt, true);
      this._focusoutEvnt = function () {
        if (_this2._focusTimeout) {
          clearTimeout(_this2._focusTimeout);
          _this2._focusTimeout = null;
        }
        if (_this2._el.getAttribute('aria-expanded') !== 'true') return;
        _this2._focusTimeout = setTimeout(function () {
          if (document.activeElement.tagName.toUpperCase() !== 'BODY' && MegaDropdown._findParent(document.activeElement, 'mega-dropdown') !== _this2._container) {
            _this2.close(true);
          }
        }, 100);
      };
      this._container.addEventListener('focusout', this._focusoutEvnt, true);
      if (this._onHover) {
        this._enterEvnt = function () {
          if (window.getComputedStyle(_this2._menu, null).getPropertyValue('position') === 'static') return;
          _this2.open();
        };
        this._leaveEvnt = function () {
          if (window.getComputedStyle(_this2._menu, null).getPropertyValue('position') === 'static') return;
          _this2.close();
        };
        this._el.addEventListener('mouseenter', this._enterEvnt);
        this._menu.addEventListener('mouseenter', this._enterEvnt);
        this._el.addEventListener('mouseleave', this._leaveEvnt);
        this._menu.addEventListener('mouseleave', this._leaveEvnt);
      }
    }
  }, {
    key: "_unbindEvents",
    value: function _unbindEvents() {
      if (this._elClickEvnt) {
        this._el.removeEventListener('click', this._elClickEvnt);
        this._elClickEvnt = null;
      }
      if (this._bodyClickEvnt) {
        document.body.removeEventListener('click', this._bodyClickEvnt, true);
        this._bodyClickEvnt = null;
      }
      if (this._menuClickEvnt) {
        this._menu.removeEventListener('click', this._menuClickEvnt, true);
        this._menuClickEvnt = null;
      }
      if (this._focusoutEvnt) {
        this._container.removeEventListener('focusout', this._focusoutEvnt, true);
        this._focusoutEvnt = null;
      }
      if (this._enterEvnt) {
        this._el.removeEventListener('mouseenter', this._enterEvnt);
        this._menu.removeEventListener('mouseenter', this._enterEvnt);
        this._enterEvnt = null;
      }
      if (this._leaveEvnt) {
        this._el.removeEventListener('mouseleave', this._leaveEvnt);
        this._menu.removeEventListener('mouseleave', this._leaveEvnt);
        this._leaveEvnt = null;
      }
    }
  }, {
    key: "_triggerEvent",
    value: function _triggerEvent(event) {
      if (document.createEvent) {
        var customEvent;
        if (typeof Event === 'function') {
          customEvent = new Event(event);
        } else {
          customEvent = document.createEvent('Event');
          customEvent.initEvent(event, false, true);
        }
        this._container.dispatchEvent(customEvent);
      } else {
        this._container.fireEvent("on".concat(event), document.createEventObject());
      }
    }
  }], [{
    key: "_findParent",
    value: function _findParent(el, cls) {
      if (el.tagName.toUpperCase() === 'BODY') return null;
      el = el.parentNode;
      while (el.tagName.toUpperCase() !== 'BODY' && !el.classList.contains(cls)) {
        el = el.parentNode;
      }
      return el.tagName.toUpperCase() !== 'BODY' ? el : null;
    }
  }]);
  return MegaDropdown;
}();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
>>>>>>> Stashed changes
