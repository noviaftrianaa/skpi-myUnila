<<<<<<< Updated upstream
/*! For license information please see shepherd.js.LICENSE.txt */
!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n=e();for(var o in n)("object"==typeof exports?exports:t)[o]=n[o]}}(self,(function(){return function(){var t={13613:function(t,e,n){var o,r,i;function s(t,e,n){return e=l(e),a(t,c()?Reflect.construct(e,n||[],l(t).constructor):e.apply(t,n))}function a(t,e){if(e&&("object"==x(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t)}function c(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(t){}return(c=function(){return!!t})()}function l(t){return l=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},l(t)}function u(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&f(t,e)}function f(t,e){return f=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},f(t,e)}function p(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var o,r,i,s,a=[],c=!0,l=!1;try{if(i=(n=n.call(t)).next,0===e){if(Object(n)!==n)return;c=!1}else for(;!(c=(o=i.call(n)).done)&&(a.push(o.value),a.length!==e);c=!0);}catch(t){l=!0,r=t}finally{try{if(!c&&null!=n.return&&(s=n.return(),Object(s)!==s))return}finally{if(l)throw r}}return a}}(t,e)||h(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function d(t){return function(t){if(Array.isArray(t))return v(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||h(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function h(t,e){if(t){if("string"==typeof t)return v(t,e);var n={}.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?v(t,e):void 0}}function v(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=Array(e);n<e;n++)o[n]=t[n];return o}function m(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function y(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,b(o.key),o)}}function g(t,e,n){return e&&y(t.prototype,e),n&&y(t,n),Object.defineProperty(t,"prototype",{writable:!1}),t}function b(t){var e=function(t,e){if("object"!=x(t)||!t)return t;var n=t[Symbol.toPrimitive];if(void 0!==n){var o=n.call(t,e||"default");if("object"!=x(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==x(e)?e:e+""}function x(t){return x="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},x(t)}i=function(){"use strict";var t=function(t){return function(t){return!!t&&"object"===x(t)}(t)&&!function(t){var n=Object.prototype.toString.call(t);return"[object RegExp]"===n||"[object Date]"===n||function(t){return t.$$typeof===e}(t)}(t)},e="function"==typeof Symbol&&Symbol.for?Symbol.for("react.element"):60103;function n(t,e){return!1!==e.clone&&e.isMergeableObject(t)?l((n=t,Array.isArray(n)?[]:{}),t,e):t;var n}function o(t,e,o){return t.concat(e).map((function(t){return n(t,o)}))}function r(t){return Object.keys(t).concat(function(t){return Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t).filter((function(e){return t.propertyIsEnumerable(e)})):[]}(t))}function i(t,e){try{return e in t}catch(t){return!1}}function c(t,e,o){var s={};return o.isMergeableObject(t)&&r(t).forEach((function(e){s[e]=n(t[e],o)})),r(e).forEach((function(r){(function(t,e){return i(t,e)&&!(Object.hasOwnProperty.call(t,e)&&Object.propertyIsEnumerable.call(t,e))})(t,r)||(i(t,r)&&o.isMergeableObject(e[r])?s[r]=function(t,e){if(!e.customMerge)return l;var n=e.customMerge(t);return"function"==typeof n?n:l}(r,o)(t[r],e[r],o):s[r]=n(e[r],o))})),s}function l(e,r,i){(i=i||{}).arrayMerge=i.arrayMerge||o,i.isMergeableObject=i.isMergeableObject||t,i.cloneUnlessOtherwiseSpecified=n;var s=Array.isArray(r);return s===Array.isArray(e)?s?i.arrayMerge(e,r,i):c(e,r,i):n(r,i)}l.all=function(t,e){if(!Array.isArray(t))throw new Error("first argument should be an array");return t.reduce((function(t,n){return l(t,n,e)}),{})};var f=l;function h(t){return t instanceof HTMLElement}function v(t){return"function"==typeof t}function y(t){return"string"==typeof t}function w(t){return void 0===t}var O=function(){return g((function t(){m(this,t)}),[{key:"on",value:function(t,e,n,o){return void 0===o&&(o=!1),w(this.bindings)&&(this.bindings={}),w(this.bindings[t])&&(this.bindings[t]=[]),this.bindings[t].push({handler:e,ctx:n,once:o}),this}},{key:"once",value:function(t,e,n){return this.on(t,e,n,!0)}},{key:"off",value:function(t,e){var n=this;return w(this.bindings)||w(this.bindings[t])||(w(e)?delete this.bindings[t]:this.bindings[t].forEach((function(o,r){o.handler===e&&n.bindings[t].splice(r,1)}))),this}},{key:"trigger",value:function(t){for(var e=this,n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];return!w(this.bindings)&&this.bindings[t]&&this.bindings[t].forEach((function(n,r){var i=n.ctx,s=n.handler,a=n.once,c=i||e;s.apply(c,o),a&&e.bindings[t].splice(r,1)})),this}}])}();function $(t){for(var e=Object.getOwnPropertyNames(t.constructor.prototype),n=0;n<e.length;n++){var o=e[n],r=t[o];"constructor"!==o&&"function"==typeof r&&(t[o]=r.bind(t))}return t}function E(t){var e=t.options.advanceOn||{},n=e.event,o=e.selector;if(!n)return console.error("advanceOn was defined, but no event name was passed.");var r,i=function(t,e){return function(n){if(e.isOpen()){var o=e.el&&n.currentTarget===e.el;(!w(t)&&n.currentTarget.matches(t)||o)&&e.tour.next()}}}(o,t);try{r=document.querySelector(o)}catch(t){}if(!w(o)&&!r)return console.error("No element was found for the selector supplied to advanceOn: ".concat(o));r?(r.addEventListener(n,i),t.on("destroy",(function(){return r.removeEventListener(n,i)}))):(document.body.addEventListener(n,i,!0),t.on("destroy",(function(){return document.body.removeEventListener(n,i,!0)})))}var S="top",k="bottom",j="right",T="left",_="auto",A=[S,k,j,T],I="start",P="end",M="viewport",L="popper",C=A.reduce((function(t,e){return t.concat([e+"-"+I,e+"-"+P])}),[]),B=[].concat(A,[_]).reduce((function(t,e){return t.concat([e,e+"-"+I,e+"-"+P])}),[]),D=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"];function H(t){return t?(t.nodeName||"").toLowerCase():null}function R(t){if(null==t)return window;if("[object Window]"!==t.toString()){var e=t.ownerDocument;return e&&e.defaultView||window}return t}function W(t){return t instanceof R(t).Element||t instanceof Element}function N(t){return t instanceof R(t).HTMLElement||t instanceof HTMLElement}function F(t){return"undefined"!=typeof ShadowRoot&&(t instanceof R(t).ShadowRoot||t instanceof ShadowRoot)}var V={name:"applyStyles",enabled:!0,phase:"write",fn:function(t){var e=t.state;Object.keys(e.elements).forEach((function(t){var n=e.styles[t]||{},o=e.attributes[t]||{},r=e.elements[t];N(r)&&H(r)&&(Object.assign(r.style,n),Object.keys(o).forEach((function(t){var e=o[t];!1===e?r.removeAttribute(t):r.setAttribute(t,!0===e?"":e)})))}))},effect:function(t){var e=t.state,n={popper:{position:e.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(e.elements.popper.style,n.popper),e.styles=n,e.elements.arrow&&Object.assign(e.elements.arrow.style,n.arrow),function(){Object.keys(e.elements).forEach((function(t){var o=e.elements[t],r=e.attributes[t]||{},i=Object.keys(e.styles.hasOwnProperty(t)?e.styles[t]:n[t]).reduce((function(t,e){return t[e]="",t}),{});N(o)&&H(o)&&(Object.assign(o.style,i),Object.keys(r).forEach((function(t){o.removeAttribute(t)})))}))}},requires:["computeStyles"]};function q(t){return t.split("-")[0]}var Y=Math.max,X=Math.min,U=Math.round;function z(t,e){void 0===e&&(e=!1);var n=t.getBoundingClientRect(),o=1,r=1;if(N(t)&&e){var i=t.offsetHeight,s=t.offsetWidth;s>0&&(o=U(n.width)/s||1),i>0&&(r=U(n.height)/i||1)}return{width:n.width/o,height:n.height/r,top:n.top/r,right:n.right/o,bottom:n.bottom/r,left:n.left/o,x:n.left/o,y:n.top/r}}function Z(t){var e=z(t),n=t.offsetWidth,o=t.offsetHeight;return Math.abs(e.width-n)<=1&&(n=e.width),Math.abs(e.height-o)<=1&&(o=e.height),{x:t.offsetLeft,y:t.offsetTop,width:n,height:o}}function K(t,e){var n=e.getRootNode&&e.getRootNode();if(t.contains(e))return!0;if(n&&F(n)){var o=e;do{if(o&&t.isSameNode(o))return!0;o=o.parentNode||o.host}while(o)}return!1}function G(t){return R(t).getComputedStyle(t)}function J(t){return["table","td","th"].indexOf(H(t))>=0}function Q(t){return((W(t)?t.ownerDocument:t.document)||window.document).documentElement}function tt(t){return"html"===H(t)?t:t.assignedSlot||t.parentNode||(F(t)?t.host:null)||Q(t)}function et(t){return N(t)&&"fixed"!==G(t).position?t.offsetParent:null}function nt(t){for(var e=R(t),n=et(t);n&&J(n)&&"static"===G(n).position;)n=et(n);return n&&("html"===H(n)||"body"===H(n)&&"static"===G(n).position)?e:n||function(t){var e=-1!==navigator.userAgent.toLowerCase().indexOf("firefox");if(-1!==navigator.userAgent.indexOf("Trident")&&N(t)&&"fixed"===G(t).position)return null;var n=tt(t);for(F(n)&&(n=n.host);N(n)&&["html","body"].indexOf(H(n))<0;){var o=G(n);if("none"!==o.transform||"none"!==o.perspective||"paint"===o.contain||-1!==["transform","perspective"].indexOf(o.willChange)||e&&"filter"===o.willChange||e&&o.filter&&"none"!==o.filter)return n;n=n.parentNode}return null}(t)||e}function ot(t){return["top","bottom"].indexOf(t)>=0?"x":"y"}function rt(t,e,n){return Y(t,X(e,n))}function it(t){return Object.assign({},{top:0,right:0,bottom:0,left:0},t)}function st(t,e){return e.reduce((function(e,n){return e[n]=t,e}),{})}var at={name:"arrow",enabled:!0,phase:"main",fn:function(t){var e,n=t.state,o=t.name,r=t.options,i=n.elements.arrow,s=n.modifiersData.popperOffsets,a=q(n.placement),c=ot(a),l=[T,j].indexOf(a)>=0?"height":"width";if(i&&s){var u=function(t,e){return it("number"!=typeof(t="function"==typeof t?t(Object.assign({},e.rects,{placement:e.placement})):t)?t:st(t,A))}(r.padding,n),f=Z(i),p="y"===c?S:T,d="y"===c?k:j,h=n.rects.reference[l]+n.rects.reference[c]-s[c]-n.rects.popper[l],v=s[c]-n.rects.reference[c],m=nt(i),y=m?"y"===c?m.clientHeight||0:m.clientWidth||0:0,g=h/2-v/2,b=u[p],x=y-f[l]-u[d],w=y/2-f[l]/2+g,O=rt(b,w,x),$=c;n.modifiersData[o]=((e={})[$]=O,e.centerOffset=O-w,e)}},effect:function(t){var e=t.state,n=t.options.element,o=void 0===n?"[data-popper-arrow]":n;null!=o&&("string"!=typeof o||(o=e.elements.popper.querySelector(o)))&&K(e.elements.popper,o)&&(e.elements.arrow=o)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function ct(t){return t.split("-")[1]}var lt={top:"auto",right:"auto",bottom:"auto",left:"auto"};function ut(t){var e,n=t.popper,o=t.popperRect,r=t.placement,i=t.variation,s=t.offsets,a=t.position,c=t.gpuAcceleration,l=t.adaptive,u=t.roundOffsets,f=t.isFixed,p=s.x,d=void 0===p?0:p,h=s.y,v=void 0===h?0:h,m="function"==typeof u?u({x:d,y:v}):{x:d,y:v};d=m.x,v=m.y;var y=s.hasOwnProperty("x"),g=s.hasOwnProperty("y"),b=T,x=S,w=window;if(l){var O=nt(n),$="clientHeight",E="clientWidth";O===R(n)&&"static"!==G(O=Q(n)).position&&"absolute"===a&&($="scrollHeight",E="scrollWidth"),(r===S||(r===T||r===j)&&i===P)&&(x=k,v-=(f&&O===w&&w.visualViewport?w.visualViewport.height:O[$])-o.height,v*=c?1:-1),r!==T&&(r!==S&&r!==k||i!==P)||(b=j,d-=(f&&O===w&&w.visualViewport?w.visualViewport.width:O[E])-o.width,d*=c?1:-1)}var _,A=Object.assign({position:a},l&&lt),I=!0===u?function(t){var e=t.x,n=t.y,o=window.devicePixelRatio||1;return{x:U(e*o)/o||0,y:U(n*o)/o||0}}({x:d,y:v}):{x:d,y:v};return d=I.x,v=I.y,c?Object.assign({},A,((_={})[x]=g?"0":"",_[b]=y?"0":"",_.transform=(w.devicePixelRatio||1)<=1?"translate("+d+"px, "+v+"px)":"translate3d("+d+"px, "+v+"px, 0)",_)):Object.assign({},A,((e={})[x]=g?v+"px":"",e[b]=y?d+"px":"",e.transform="",e))}var ft={passive:!0},pt={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(t){var e=t.state,n=t.instance,o=t.options,r=o.scroll,i=void 0===r||r,s=o.resize,a=void 0===s||s,c=R(e.elements.popper),l=[].concat(e.scrollParents.reference,e.scrollParents.popper);return i&&l.forEach((function(t){t.addEventListener("scroll",n.update,ft)})),a&&c.addEventListener("resize",n.update,ft),function(){i&&l.forEach((function(t){t.removeEventListener("scroll",n.update,ft)})),a&&c.removeEventListener("resize",n.update,ft)}},data:{}},dt={left:"right",right:"left",bottom:"top",top:"bottom"};function ht(t){return t.replace(/left|right|bottom|top/g,(function(t){return dt[t]}))}var vt={start:"end",end:"start"};function mt(t){return t.replace(/start|end/g,(function(t){return vt[t]}))}function yt(t){var e=R(t);return{scrollLeft:e.pageXOffset,scrollTop:e.pageYOffset}}function gt(t){return z(Q(t)).left+yt(t).scrollLeft}function bt(t){var e=G(t),n=e.overflow,o=e.overflowX,r=e.overflowY;return/auto|scroll|overlay|hidden/.test(n+r+o)}function xt(t){return["html","body","#document"].indexOf(H(t))>=0?t.ownerDocument.body:N(t)&&bt(t)?t:xt(tt(t))}function wt(t,e){var n;void 0===e&&(e=[]);var o=xt(t),r=o===(null==(n=t.ownerDocument)?void 0:n.body),i=R(o),s=r?[i].concat(i.visualViewport||[],bt(o)?o:[]):o,a=e.concat(s);return r?a:a.concat(wt(tt(s)))}function Ot(t){return Object.assign({},t,{left:t.x,top:t.y,right:t.x+t.width,bottom:t.y+t.height})}function $t(t,e){return e===M?Ot(function(t){var e=R(t),n=Q(t),o=e.visualViewport,r=n.clientWidth,i=n.clientHeight,s=0,a=0;return o&&(r=o.width,i=o.height,/^((?!chrome|android).)*safari/i.test(navigator.userAgent)||(s=o.offsetLeft,a=o.offsetTop)),{width:r,height:i,x:s+gt(t),y:a}}(t)):W(e)?function(t){var e=z(t);return e.top=e.top+t.clientTop,e.left=e.left+t.clientLeft,e.bottom=e.top+t.clientHeight,e.right=e.left+t.clientWidth,e.width=t.clientWidth,e.height=t.clientHeight,e.x=e.left,e.y=e.top,e}(e):Ot(function(t){var e,n=Q(t),o=yt(t),r=null==(e=t.ownerDocument)?void 0:e.body,i=Y(n.scrollWidth,n.clientWidth,r?r.scrollWidth:0,r?r.clientWidth:0),s=Y(n.scrollHeight,n.clientHeight,r?r.scrollHeight:0,r?r.clientHeight:0),a=-o.scrollLeft+gt(t),c=-o.scrollTop;return"rtl"===G(r||n).direction&&(a+=Y(n.clientWidth,r?r.clientWidth:0)-i),{width:i,height:s,x:a,y:c}}(Q(t)))}function Et(t,e,n){var o="clippingParents"===e?function(t){var e=wt(tt(t)),n=["absolute","fixed"].indexOf(G(t).position)>=0&&N(t)?nt(t):t;return W(n)?e.filter((function(t){return W(t)&&K(t,n)&&"body"!==H(t)})):[]}(t):[].concat(e),r=[].concat(o,[n]),i=r[0],s=r.reduce((function(e,n){var o=$t(t,n);return e.top=Y(o.top,e.top),e.right=X(o.right,e.right),e.bottom=X(o.bottom,e.bottom),e.left=Y(o.left,e.left),e}),$t(t,i));return s.width=s.right-s.left,s.height=s.bottom-s.top,s.x=s.left,s.y=s.top,s}function St(t){var e,n=t.reference,o=t.element,r=t.placement,i=r?q(r):null,s=r?ct(r):null,a=n.x+n.width/2-o.width/2,c=n.y+n.height/2-o.height/2;switch(i){case S:e={x:a,y:n.y-o.height};break;case k:e={x:a,y:n.y+n.height};break;case j:e={x:n.x+n.width,y:c};break;case T:e={x:n.x-o.width,y:c};break;default:e={x:n.x,y:n.y}}var l=i?ot(i):null;if(null!=l){var u="y"===l?"height":"width";switch(s){case I:e[l]=e[l]-(n[u]/2-o[u]/2);break;case P:e[l]=e[l]+(n[u]/2-o[u]/2)}}return e}function kt(t,e){void 0===e&&(e={});var n=e,o=n.placement,r=void 0===o?t.placement:o,i=n.boundary,s=void 0===i?"clippingParents":i,a=n.rootBoundary,c=void 0===a?M:a,l=n.elementContext,u=void 0===l?L:l,f=n.altBoundary,p=void 0!==f&&f,d=n.padding,h=void 0===d?0:d,v=it("number"!=typeof h?h:st(h,A)),m=u===L?"reference":L,y=t.rects.popper,g=t.elements[p?m:u],b=Et(W(g)?g:g.contextElement||Q(t.elements.popper),s,c),x=z(t.elements.reference),w=St({reference:x,element:y,strategy:"absolute",placement:r}),O=Ot(Object.assign({},y,w)),$=u===L?O:x,E={top:b.top-$.top+v.top,bottom:$.bottom-b.bottom+v.bottom,left:b.left-$.left+v.left,right:$.right-b.right+v.right},T=t.modifiersData.offset;if(u===L&&T){var _=T[r];Object.keys(E).forEach((function(t){var e=[j,k].indexOf(t)>=0?1:-1,n=[S,k].indexOf(t)>=0?"y":"x";E[t]+=_[n]*e}))}return E}function jt(t,e){void 0===e&&(e={});var n=e,o=n.placement,r=n.boundary,i=n.rootBoundary,s=n.padding,a=n.flipVariations,c=n.allowedAutoPlacements,l=void 0===c?B:c,u=ct(o),f=u?a?C:C.filter((function(t){return ct(t)===u})):A,p=f.filter((function(t){return l.indexOf(t)>=0}));0===p.length&&(p=f);var d=p.reduce((function(e,n){return e[n]=kt(t,{placement:n,boundary:r,rootBoundary:i,padding:s})[q(n)],e}),{});return Object.keys(d).sort((function(t,e){return d[t]-d[e]}))}var Tt={name:"flip",enabled:!0,phase:"main",fn:function(t){var e=t.state,n=t.options,o=t.name;if(!e.modifiersData[o]._skip){for(var r=n.mainAxis,i=void 0===r||r,s=n.altAxis,a=void 0===s||s,c=n.fallbackPlacements,l=n.padding,u=n.boundary,f=n.rootBoundary,p=n.altBoundary,d=n.flipVariations,h=void 0===d||d,v=n.allowedAutoPlacements,m=e.options.placement,y=q(m),g=c||(y!==m&&h?function(t){if(q(t)===_)return[];var e=ht(t);return[mt(t),e,mt(e)]}(m):[ht(m)]),b=[m].concat(g).reduce((function(t,n){return t.concat(q(n)===_?jt(e,{placement:n,boundary:u,rootBoundary:f,padding:l,flipVariations:h,allowedAutoPlacements:v}):n)}),[]),x=e.rects.reference,w=e.rects.popper,O=new Map,$=!0,E=b[0],A=0;A<b.length;A++){var P=b[A],M=q(P),L=ct(P)===I,C=[S,k].indexOf(M)>=0,B=C?"width":"height",D=kt(e,{placement:P,boundary:u,rootBoundary:f,altBoundary:p,padding:l}),H=C?L?j:T:L?k:S;x[B]>w[B]&&(H=ht(H));var R=ht(H),W=[];if(i&&W.push(D[M]<=0),a&&W.push(D[H]<=0,D[R]<=0),W.every((function(t){return t}))){E=P,$=!1;break}O.set(P,W)}if($)for(var N=function(t){var e=b.find((function(e){var n=O.get(e);if(n)return n.slice(0,t).every((function(t){return t}))}));if(e)return E=e,"break"},F=h?3:1;F>0&&"break"!==N(F);F--);e.placement!==E&&(e.modifiersData[o]._skip=!0,e.placement=E,e.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}};function _t(t,e,n){return void 0===n&&(n={x:0,y:0}),{top:t.top-e.height-n.y,right:t.right-e.width+n.x,bottom:t.bottom-e.height+n.y,left:t.left-e.width-n.x}}function At(t){return[S,j,k,T].some((function(e){return t[e]>=0}))}var It={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(t){var e=t.state,n=t.options,o=t.name,r=n.offset,i=void 0===r?[0,0]:r,s=B.reduce((function(t,n){return t[n]=function(t,e,n){var o=q(t),r=[T,S].indexOf(o)>=0?-1:1,i="function"==typeof n?n(Object.assign({},e,{placement:t})):n,s=i[0],a=i[1];return s=s||0,a=(a||0)*r,[T,j].indexOf(o)>=0?{x:a,y:s}:{x:s,y:a}}(n,e.rects,i),t}),{}),a=s[e.placement],c=a.x,l=a.y;null!=e.modifiersData.popperOffsets&&(e.modifiersData.popperOffsets.x+=c,e.modifiersData.popperOffsets.y+=l),e.modifiersData[o]=s}},Pt={name:"preventOverflow",enabled:!0,phase:"main",fn:function(t){var e=t.state,n=t.options,o=t.name,r=n.mainAxis,i=void 0===r||r,s=n.altAxis,a=void 0!==s&&s,c=n.boundary,l=n.rootBoundary,u=n.altBoundary,f=n.padding,p=n.tether,d=void 0===p||p,h=n.tetherOffset,v=void 0===h?0:h,m=kt(e,{boundary:c,rootBoundary:l,padding:f,altBoundary:u}),y=q(e.placement),g=ct(e.placement),b=!g,x=ot(y),w="x"===x?"y":"x",O=e.modifiersData.popperOffsets,$=e.rects.reference,E=e.rects.popper,_="function"==typeof v?v(Object.assign({},e.rects,{placement:e.placement})):v,A="number"==typeof _?{mainAxis:_,altAxis:_}:Object.assign({mainAxis:0,altAxis:0},_),P=e.modifiersData.offset?e.modifiersData.offset[e.placement]:null,M={x:0,y:0};if(O){if(i){var L,C="y"===x?S:T,B="y"===x?k:j,D="y"===x?"height":"width",H=O[x],R=H+m[C],W=H-m[B],N=d?-E[D]/2:0,F=g===I?$[D]:E[D],V=g===I?-E[D]:-$[D],U=e.elements.arrow,z=d&&U?Z(U):{width:0,height:0},K=e.modifiersData["arrow#persistent"]?e.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},G=K[C],J=K[B],Q=rt(0,$[D],z[D]),tt=b?$[D]/2-N-Q-G-A.mainAxis:F-Q-G-A.mainAxis,et=b?-$[D]/2+N+Q+J+A.mainAxis:V+Q+J+A.mainAxis,it=e.elements.arrow&&nt(e.elements.arrow),st=it?"y"===x?it.clientTop||0:it.clientLeft||0:0,at=null!=(L=null==P?void 0:P[x])?L:0,lt=H+et-at,ut=rt(d?X(R,H+tt-at-st):R,H,d?Y(W,lt):W);O[x]=ut,M[x]=ut-H}if(a){var ft,pt="x"===x?S:T,dt="x"===x?k:j,ht=O[w],vt="y"===w?"height":"width",mt=ht+m[pt],yt=ht-m[dt],gt=-1!==[S,T].indexOf(y),bt=null!=(ft=null==P?void 0:P[w])?ft:0,xt=gt?mt:ht-$[vt]-E[vt]-bt+A.altAxis,wt=gt?ht+$[vt]+E[vt]-bt-A.altAxis:yt,Ot=d&&gt?function(t,e,n){var o=rt(t,e,n);return o>n?n:o}(xt,ht,wt):rt(d?xt:mt,ht,d?wt:yt);O[w]=Ot,M[w]=Ot-ht}e.modifiersData[o]=M}},requiresIfExists:["offset"]};function Mt(t,e,n){void 0===n&&(n=!1);var o,r=N(e),i=N(e)&&function(t){var e=t.getBoundingClientRect(),n=U(e.width)/t.offsetWidth||1,o=U(e.height)/t.offsetHeight||1;return 1!==n||1!==o}(e),s=Q(e),a=z(t,i),c={scrollLeft:0,scrollTop:0},l={x:0,y:0};return(r||!r&&!n)&&(("body"!==H(e)||bt(s))&&(c=(o=e)!==R(o)&&N(o)?function(t){return{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}}(o):yt(o)),N(e)?((l=z(e,!0)).x+=e.clientLeft,l.y+=e.clientTop):s&&(l.x=gt(s))),{x:a.left+c.scrollLeft-l.x,y:a.top+c.scrollTop-l.y,width:a.width,height:a.height}}function Lt(t){var e=new Map,n=new Set,o=[];function r(t){n.add(t.name),[].concat(t.requires||[],t.requiresIfExists||[]).forEach((function(t){if(!n.has(t)){var o=e.get(t);o&&r(o)}})),o.push(t)}return t.forEach((function(t){e.set(t.name,t)})),t.forEach((function(t){n.has(t.name)||r(t)})),o}var Ct={placement:"bottom",modifiers:[],strategy:"absolute"};function Bt(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return!e.some((function(t){return!(t&&"function"==typeof t.getBoundingClientRect)}))}function Dt(t){void 0===t&&(t={});var e=t,n=e.defaultModifiers,o=void 0===n?[]:n,r=e.defaultOptions,i=void 0===r?Ct:r;return function(t,e,n){void 0===n&&(n=i);var r,s,a={placement:"bottom",orderedModifiers:[],options:Object.assign({},Ct,i),modifiersData:{},elements:{reference:t,popper:e},attributes:{},styles:{}},c=[],l=!1,u={state:a,setOptions:function(n){var r="function"==typeof n?n(a.options):n;f(),a.options=Object.assign({},i,a.options,r),a.scrollParents={reference:W(t)?wt(t):t.contextElement?wt(t.contextElement):[],popper:wt(e)};var s,l,p=function(t){var e=Lt(t);return D.reduce((function(t,n){return t.concat(e.filter((function(t){return t.phase===n})))}),[])}((s=[].concat(o,a.options.modifiers),l=s.reduce((function(t,e){var n=t[e.name];return t[e.name]=n?Object.assign({},n,e,{options:Object.assign({},n.options,e.options),data:Object.assign({},n.data,e.data)}):e,t}),{}),Object.keys(l).map((function(t){return l[t]}))));return a.orderedModifiers=p.filter((function(t){return t.enabled})),a.orderedModifiers.forEach((function(t){var e=t.name,n=t.options,o=void 0===n?{}:n,r=t.effect;if("function"==typeof r){var i=r({state:a,name:e,instance:u,options:o}),s=function(){};c.push(i||s)}})),u.update()},forceUpdate:function(){if(!l){var t=a.elements,e=t.reference,n=t.popper;if(Bt(e,n)){a.rects={reference:Mt(e,nt(n),"fixed"===a.options.strategy),popper:Z(n)},a.reset=!1,a.placement=a.options.placement,a.orderedModifiers.forEach((function(t){return a.modifiersData[t.name]=Object.assign({},t.data)}));for(var o=0;o<a.orderedModifiers.length;o++)if(!0!==a.reset){var r=a.orderedModifiers[o],i=r.fn,s=r.options,c=void 0===s?{}:s,f=r.name;"function"==typeof i&&(a=i({state:a,options:c,name:f,instance:u})||a)}else a.reset=!1,o=-1}}},update:(r=function(){return new Promise((function(t){u.forceUpdate(),t(a)}))},function(){return s||(s=new Promise((function(t){Promise.resolve().then((function(){s=void 0,t(r())}))}))),s}),destroy:function(){f(),l=!0}};if(!Bt(t,e))return u;function f(){c.forEach((function(t){return t()})),c=[]}return u.setOptions(n).then((function(t){!l&&n.onFirstUpdate&&n.onFirstUpdate(t)})),u}}var Ht,Rt=Dt({defaultModifiers:[pt,{name:"popperOffsets",enabled:!0,phase:"read",fn:function(t){var e=t.state,n=t.name;e.modifiersData[n]=St({reference:e.rects.reference,element:e.rects.popper,strategy:"absolute",placement:e.placement})},data:{}},{name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(t){var e=t.state,n=t.options,o=n.gpuAcceleration,r=void 0===o||o,i=n.adaptive,s=void 0===i||i,a=n.roundOffsets,c=void 0===a||a,l={placement:q(e.placement),variation:ct(e.placement),popper:e.elements.popper,popperRect:e.rects.popper,gpuAcceleration:r,isFixed:"fixed"===e.options.strategy};null!=e.modifiersData.popperOffsets&&(e.styles.popper=Object.assign({},e.styles.popper,ut(Object.assign({},l,{offsets:e.modifiersData.popperOffsets,position:e.options.strategy,adaptive:s,roundOffsets:c})))),null!=e.modifiersData.arrow&&(e.styles.arrow=Object.assign({},e.styles.arrow,ut(Object.assign({},l,{offsets:e.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:c})))),e.attributes.popper=Object.assign({},e.attributes.popper,{"data-popper-placement":e.placement})},data:{}},V,It,Tt,Pt,at,{name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(t){var e=t.state,n=t.name,o=e.rects.reference,r=e.rects.popper,i=e.modifiersData.preventOverflow,s=kt(e,{elementContext:"reference"}),a=kt(e,{altBoundary:!0}),c=_t(s,o),l=_t(a,r,i),u=At(c),f=At(l);e.modifiersData[n]={referenceClippingOffsets:c,popperEscapeOffsets:l,isReferenceHidden:u,hasPopperEscaped:f},e.attributes.popper=Object.assign({},e.attributes.popper,{"data-popper-reference-hidden":u,"data-popper-escaped":f})}}]});function Wt(){return Wt=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}return t},Wt.apply(this,arguments)}function Nt(t){return{name:"focusAfterRender",enabled:!0,phase:"afterWrite",fn:function(){setTimeout((function(){t.el&&t.el.focus({preventScroll:!0})}),300)}}}function Ft(t){var e=[{name:"applyStyles",fn:function(t){var e=t.state;Object.keys(e.elements).forEach((function(t){if("popper"===t){var n=e.attributes[t]||{},o=e.elements[t];Object.assign(o.style,{position:"fixed",left:"50%",top:"50%",transform:"translate(-50%, -50%)"}),Object.keys(n).forEach((function(t){var e=n[t];!1===e?o.removeAttribute(t):o.setAttribute(t,!0===e?"":e)}))}}))}},{name:"computeStyles",options:{adaptive:!1}}],n={placement:"top",strategy:"fixed",modifiers:[Nt(t)]};return n=Wt({},n,{modifiers:Array.from(new Set([].concat(d(n.modifiers),d(e))))})}function Vt(t){return y(t)&&""!==t?"-"!==t.charAt(t.length-1)?"".concat(t,"-"):t:""}function qt(t){return null==t||!t.element||!t.on}function Yt(t){t.tooltip&&t.tooltip.destroy();var e=t._getResolvedAttachToOptions(),n=e.element,o=function(t,e){var n={modifiers:[{name:"preventOverflow",options:{altAxis:!0,tether:!1}},Nt(e)],strategy:"absolute"};qt(t)?n=Ft(e):n.placement=t.on;var o=e.tour&&e.tour.options&&e.tour.options.defaultStepOptions;return o&&(n=Ut(o,n)),n=Ut(e.options,n)}(e,t);return qt(e)&&(n=document.body,t.shepherdElementComponent.getElement().classList.add("shepherd-centered")),t.tooltip=Rt(n,t.el,o),t.target=e.element,o}function Xt(){var t=Date.now();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var n=(t+16*Math.random())%16|0;return t=Math.floor(t/16),("x"==e?n:3&n|8).toString(16)}))}function Ut(t,e){if(t.popperOptions){var n=Object.assign({},e,t.popperOptions);if(t.popperOptions.modifiers&&t.popperOptions.modifiers.length>0){var o=t.popperOptions.modifiers.map((function(t){return t.name})),r=e.modifiers.filter((function(t){return!o.includes(t.name)}));n.modifiers=Array.from(new Set([].concat(d(r),d(t.popperOptions.modifiers))))}return n}return e}function zt(){}function Zt(t,e){for(var n in e)t[n]=e[n];return t}function Kt(t){return t()}function Gt(){return Object.create(null)}function Jt(t){t.forEach(Kt)}function Qt(t){return"function"==typeof t}function te(t,e){return t!=t?e==e:t!==e||t&&"object"===x(t)||"function"==typeof t}function ee(t,e){t.appendChild(e)}function ne(t,e,n){t.insertBefore(e,n||null)}function oe(t){t.parentNode.removeChild(t)}function re(t){return document.createElement(t)}function ie(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function se(t){return document.createTextNode(t)}function ae(){return se(" ")}function ce(t,e,n,o){return t.addEventListener(e,n,o),function(){return t.removeEventListener(e,n,o)}}function le(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function ue(t,e){var n=Object.getOwnPropertyDescriptors(t.__proto__);for(var o in e)null==e[o]?t.removeAttribute(o):"style"===o?t.style.cssText=e[o]:"__value"===o?t.value=t[o]=e[o]:n[o]&&n[o].set?t[o]=e[o]:le(t,o,e[o])}function fe(t,e,n){t.classList[n?"add":"remove"](e)}function pe(t){Ht=t}function de(){if(!Ht)throw new Error("Function called outside component initialization");return Ht}function he(t){de().$$.after_update.push(t)}var ve=[],me=[],ye=[],ge=[],be=Promise.resolve(),xe=!1;function we(t){ye.push(t)}var Oe=new Set,$e=0;function Ee(){var t=Ht;do{for(;$e<ve.length;){var e=ve[$e];$e++,pe(e),Se(e.$$)}for(pe(null),ve.length=0,$e=0;me.length;)me.pop()();for(var n=0;n<ye.length;n+=1){var o=ye[n];Oe.has(o)||(Oe.add(o),o())}ye.length=0}while(ve.length);for(;ge.length;)ge.pop()();xe=!1,Oe.clear(),pe(t)}function Se(t){if(null!==t.fragment){t.update(),Jt(t.before_update);var e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(we)}}var ke,je=new Set;function Te(){ke={r:0,c:[],p:ke}}function _e(){ke.r||Jt(ke.c),ke=ke.p}function Ae(t,e){t&&t.i&&(je.delete(t),t.i(e))}function Ie(t,e,n,o){if(t&&t.o){if(je.has(t))return;je.add(t),ke.c.push((function(){je.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}else o&&o()}function Pe(t){t&&t.c()}function Me(t,e,n,o){var r=t.$$,i=r.fragment,s=r.on_mount,a=r.on_destroy,c=r.after_update;i&&i.m(e,n),o||we((function(){var e=s.map(Kt).filter(Qt);a?a.push.apply(a,d(e)):Jt(e),t.$$.on_mount=[]})),c.forEach(we)}function Le(t,e){var n=t.$$;null!==n.fragment&&(Jt(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Ce(t,e){-1===t.$$.dirty[0]&&(ve.push(t),xe||(xe=!0,be.then(Ee)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Be(t,e,n,o,r,i,s,a){void 0===a&&(a=[-1]);var c=Ht;pe(t);var l=t.$$={fragment:null,ctx:null,props:i,update:zt,not_equal:r,bound:Gt(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(c?c.$$.context:[])),callbacks:Gt(),dirty:a,skip_bound:!1,root:e.target||c.$$.root};s&&s(l.root);var u=!1;if(l.ctx=n?n(t,e.props||{},(function(e,n){var o=!(arguments.length<=2)&&arguments.length-2?arguments.length<=2?void 0:arguments[2]:n;return l.ctx&&r(l.ctx[e],l.ctx[e]=o)&&(!l.skip_bound&&l.bound[e]&&l.bound[e](o),u&&Ce(t,e)),n})):[],l.update(),u=!0,Jt(l.before_update),l.fragment=!!o&&o(l.ctx),e.target){if(e.hydrate){var f=function(t){return Array.from(t.childNodes)}(e.target);l.fragment&&l.fragment.l(f),f.forEach(oe)}else l.fragment&&l.fragment.c();e.intro&&Ae(t.$$.fragment),Me(t,e.target,e.anchor,e.customElement),Ee()}pe(c)}var De=function(){return g((function t(){m(this,t)}),[{key:"$destroy",value:function(){Le(this,1),this.$destroy=zt}},{key:"$on",value:function(t,e){var n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),function(){var t=n.indexOf(e);-1!==t&&n.splice(t,1)}}},{key:"$set",value:function(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}])}();function He(t){var e,n,o,r,i;return{c:function(){le(e=re("button"),"aria-label",n=t[3]?t[3]:null),le(e,"class",o="".concat(t[1]||""," shepherd-button ").concat(t[4]?"shepherd-button-secondary":"")),e.disabled=t[2],le(e,"tabindex","0")},m:function(n,o){ne(n,e,o),e.innerHTML=t[5],r||(i=ce(e,"click",(function(){Qt(t[0])&&t[0].apply(this,arguments)})),r=!0)},p:function(r,i){var s=p(i,1)[0];t=r,32&s&&(e.innerHTML=t[5]),8&s&&n!==(n=t[3]?t[3]:null)&&le(e,"aria-label",n),18&s&&o!==(o="".concat(t[1]||""," shepherd-button ").concat(t[4]?"shepherd-button-secondary":""))&&le(e,"class",o),4&s&&(e.disabled=t[2])},i:zt,o:zt,d:function(t){t&&oe(e),r=!1,i()}}}function Re(t,e,n){var o,r,i,s,a,c,l=e.config,u=e.step;function f(t){return v(t)?t.call(u):t}return t.$$set=function(t){"config"in t&&n(6,l=t.config),"step"in t&&n(7,u=t.step)},t.$$.update=function(){192&t.$$.dirty&&(n(0,o=l.action?l.action.bind(u.tour):null),n(1,r=l.classes),n(2,i=!!l.disabled&&f(l.disabled)),n(3,s=l.label?f(l.label):null),n(4,a=l.secondary),n(5,c=l.text?f(l.text):null))},[o,r,i,s,a,c,l,u]}var We=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,Re,He,te,{config:6,step:7}),n}return u(e,t),g(e)}(De);function Ne(t,e,n){var o=t.slice();return o[2]=e[n],o}function Fe(t){for(var e,n,o=t[1],r=[],i=0;i<o.length;i+=1)r[i]=Ve(Ne(t,o,i));var s=function(t){return Ie(r[t],1,1,(function(){r[t]=null}))};return{c:function(){for(var t=0;t<r.length;t+=1)r[t].c();e=se("")},m:function(t,o){for(var i=0;i<r.length;i+=1)r[i].m(t,o);ne(t,e,o),n=!0},p:function(t,n){if(3&n){var i;for(o=t[1],i=0;i<o.length;i+=1){var a=Ne(t,o,i);r[i]?(r[i].p(a,n),Ae(r[i],1)):(r[i]=Ve(a),r[i].c(),Ae(r[i],1),r[i].m(e.parentNode,e))}for(Te(),i=o.length;i<r.length;i+=1)s(i);_e()}},i:function(t){if(!n){for(var e=0;e<o.length;e+=1)Ae(r[e]);n=!0}},o:function(t){r=r.filter(Boolean);for(var e=0;e<r.length;e+=1)Ie(r[e]);n=!1},d:function(t){!function(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(r,t),t&&oe(e)}}}function Ve(t){var e,n;return e=new We({props:{config:t[2],step:t[0]}}),{c:function(){Pe(e.$$.fragment)},m:function(t,o){Me(e,t,o),n=!0},p:function(t,n){var o={};2&n&&(o.config=t[2]),1&n&&(o.step=t[0]),e.$set(o)},i:function(t){n||(Ae(e.$$.fragment,t),n=!0)},o:function(t){Ie(e.$$.fragment,t),n=!1},d:function(t){Le(e,t)}}}function qe(t){var e,n,o=t[1]&&Fe(t);return{c:function(){e=re("footer"),o&&o.c(),le(e,"class","shepherd-footer")},m:function(t,r){ne(t,e,r),o&&o.m(e,null),n=!0},p:function(t,n){var r=p(n,1)[0];t[1]?o?(o.p(t,r),2&r&&Ae(o,1)):((o=Fe(t)).c(),Ae(o,1),o.m(e,null)):o&&(Te(),Ie(o,1,1,(function(){o=null})),_e())},i:function(t){n||(Ae(o),n=!0)},o:function(t){Ie(o),n=!1},d:function(t){t&&oe(e),o&&o.d()}}}function Ye(t,e,n){var o,r=e.step;return t.$$set=function(t){"step"in t&&n(0,r=t.step)},t.$$.update=function(){1&t.$$.dirty&&n(1,o=r.options.buttons)},[r,o]}var Xe=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,Ye,qe,te,{step:0}),n}return u(e,t),g(e)}(De);function Ue(t){var e,n,o,r,i;return{c:function(){e=re("button"),(n=re("span")).textContent="×",le(n,"aria-hidden","true"),le(e,"aria-label",o=t[0].label?t[0].label:"Close Tour"),le(e,"class","shepherd-cancel-icon"),le(e,"type","button")},m:function(o,s){ne(o,e,s),ee(e,n),r||(i=ce(e,"click",t[1]),r=!0)},p:function(t,n){1&p(n,1)[0]&&o!==(o=t[0].label?t[0].label:"Close Tour")&&le(e,"aria-label",o)},i:zt,o:zt,d:function(t){t&&oe(e),r=!1,i()}}}function ze(t,e,n){var o=e.cancelIcon,r=e.step;return t.$$set=function(t){"cancelIcon"in t&&n(0,o=t.cancelIcon),"step"in t&&n(2,r=t.step)},[o,function(t){t.preventDefault(),r.cancel()},r]}var Ze=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,ze,Ue,te,{cancelIcon:0,step:2}),n}return u(e,t),g(e)}(De);function Ke(t){var e;return{c:function(){le(e=re("h3"),"id",t[1]),le(e,"class","shepherd-title")},m:function(n,o){ne(n,e,o),t[3](e)},p:function(t,n){2&p(n,1)[0]&&le(e,"id",t[1])},i:zt,o:zt,d:function(n){n&&oe(e),t[3](null)}}}function Ge(t,e,n){var o=e.labelId,r=e.element,i=e.title;return he((function(){v(i)&&n(2,i=i()),n(0,r.innerHTML=i,r)})),t.$$set=function(t){"labelId"in t&&n(1,o=t.labelId),"element"in t&&n(0,r=t.element),"title"in t&&n(2,i=t.title)},[r,o,i,function(t){me[t?"unshift":"push"]((function(){n(0,r=t)}))}]}var Je=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,Ge,Ke,te,{labelId:1,element:0,title:2}),n}return u(e,t),g(e)}(De);function Qe(t){var e,n;return e=new Je({props:{labelId:t[0],title:t[2]}}),{c:function(){Pe(e.$$.fragment)},m:function(t,o){Me(e,t,o),n=!0},p:function(t,n){var o={};1&n&&(o.labelId=t[0]),4&n&&(o.title=t[2]),e.$set(o)},i:function(t){n||(Ae(e.$$.fragment,t),n=!0)},o:function(t){Ie(e.$$.fragment,t),n=!1},d:function(t){Le(e,t)}}}function tn(t){var e,n;return e=new Ze({props:{cancelIcon:t[3],step:t[1]}}),{c:function(){Pe(e.$$.fragment)},m:function(t,o){Me(e,t,o),n=!0},p:function(t,n){var o={};8&n&&(o.cancelIcon=t[3]),2&n&&(o.step=t[1]),e.$set(o)},i:function(t){n||(Ae(e.$$.fragment,t),n=!0)},o:function(t){Ie(e.$$.fragment,t),n=!1},d:function(t){Le(e,t)}}}function en(t){var e,n,o,r=t[2]&&Qe(t),i=t[3]&&t[3].enabled&&tn(t);return{c:function(){e=re("header"),r&&r.c(),n=ae(),i&&i.c(),le(e,"class","shepherd-header")},m:function(t,s){ne(t,e,s),r&&r.m(e,null),ee(e,n),i&&i.m(e,null),o=!0},p:function(t,o){var s=p(o,1)[0];t[2]?r?(r.p(t,s),4&s&&Ae(r,1)):((r=Qe(t)).c(),Ae(r,1),r.m(e,n)):r&&(Te(),Ie(r,1,1,(function(){r=null})),_e()),t[3]&&t[3].enabled?i?(i.p(t,s),8&s&&Ae(i,1)):((i=tn(t)).c(),Ae(i,1),i.m(e,null)):i&&(Te(),Ie(i,1,1,(function(){i=null})),_e())},i:function(t){o||(Ae(r),Ae(i),o=!0)},o:function(t){Ie(r),Ie(i),o=!1},d:function(t){t&&oe(e),r&&r.d(),i&&i.d()}}}function nn(t,e,n){var o,r,i=e.labelId,s=e.step;return t.$$set=function(t){"labelId"in t&&n(0,i=t.labelId),"step"in t&&n(1,s=t.step)},t.$$.update=function(){2&t.$$.dirty&&(n(2,o=s.options.title),n(3,r=s.options.cancelIcon))},[i,s,o,r]}var on=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,nn,en,te,{labelId:0,step:1}),n}return u(e,t),g(e)}(De);function rn(t){var e;return{c:function(){le(e=re("div"),"class","shepherd-text"),le(e,"id",t[1])},m:function(n,o){ne(n,e,o),t[3](e)},p:function(t,n){2&p(n,1)[0]&&le(e,"id",t[1])},i:zt,o:zt,d:function(n){n&&oe(e),t[3](null)}}}function sn(t,e,n){var o=e.descriptionId,r=e.element,i=e.step;return he((function(){var t=i.options.text;v(t)&&(t=t.call(i)),h(t)?r.appendChild(t):n(0,r.innerHTML=t,r)})),t.$$set=function(t){"descriptionId"in t&&n(1,o=t.descriptionId),"element"in t&&n(0,r=t.element),"step"in t&&n(2,i=t.step)},[r,o,i,function(t){me[t?"unshift":"push"]((function(){n(0,r=t)}))}]}var an=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,sn,rn,te,{descriptionId:1,element:0,step:2}),n}return u(e,t),g(e)}(De);function cn(t){var e,n;return e=new on({props:{labelId:t[1],step:t[2]}}),{c:function(){Pe(e.$$.fragment)},m:function(t,o){Me(e,t,o),n=!0},p:function(t,n){var o={};2&n&&(o.labelId=t[1]),4&n&&(o.step=t[2]),e.$set(o)},i:function(t){n||(Ae(e.$$.fragment,t),n=!0)},o:function(t){Ie(e.$$.fragment,t),n=!1},d:function(t){Le(e,t)}}}function ln(t){var e,n;return e=new an({props:{descriptionId:t[0],step:t[2]}}),{c:function(){Pe(e.$$.fragment)},m:function(t,o){Me(e,t,o),n=!0},p:function(t,n){var o={};1&n&&(o.descriptionId=t[0]),4&n&&(o.step=t[2]),e.$set(o)},i:function(t){n||(Ae(e.$$.fragment,t),n=!0)},o:function(t){Ie(e.$$.fragment,t),n=!1},d:function(t){Le(e,t)}}}function un(t){var e,n;return e=new Xe({props:{step:t[2]}}),{c:function(){Pe(e.$$.fragment)},m:function(t,o){Me(e,t,o),n=!0},p:function(t,n){var o={};4&n&&(o.step=t[2]),e.$set(o)},i:function(t){n||(Ae(e.$$.fragment,t),n=!0)},o:function(t){Ie(e.$$.fragment,t),n=!1},d:function(t){Le(e,t)}}}function fn(t){var e,n,o,r,i=!w(t[2].options.title)||t[2].options.cancelIcon&&t[2].options.cancelIcon.enabled,s=!w(t[2].options.text),a=Array.isArray(t[2].options.buttons)&&t[2].options.buttons.length,c=i&&cn(t),l=s&&ln(t),u=a&&un(t);return{c:function(){e=re("div"),c&&c.c(),n=ae(),l&&l.c(),o=ae(),u&&u.c(),le(e,"class","shepherd-content")},m:function(t,i){ne(t,e,i),c&&c.m(e,null),ee(e,n),l&&l.m(e,null),ee(e,o),u&&u.m(e,null),r=!0},p:function(t,r){var f=p(r,1)[0];4&f&&(i=!w(t[2].options.title)||t[2].options.cancelIcon&&t[2].options.cancelIcon.enabled),i?c?(c.p(t,f),4&f&&Ae(c,1)):((c=cn(t)).c(),Ae(c,1),c.m(e,n)):c&&(Te(),Ie(c,1,1,(function(){c=null})),_e()),4&f&&(s=!w(t[2].options.text)),s?l?(l.p(t,f),4&f&&Ae(l,1)):((l=ln(t)).c(),Ae(l,1),l.m(e,o)):l&&(Te(),Ie(l,1,1,(function(){l=null})),_e()),4&f&&(a=Array.isArray(t[2].options.buttons)&&t[2].options.buttons.length),a?u?(u.p(t,f),4&f&&Ae(u,1)):((u=un(t)).c(),Ae(u,1),u.m(e,null)):u&&(Te(),Ie(u,1,1,(function(){u=null})),_e())},i:function(t){r||(Ae(c),Ae(l),Ae(u),r=!0)},o:function(t){Ie(c),Ie(l),Ie(u),r=!1},d:function(t){t&&oe(e),c&&c.d(),l&&l.d(),u&&u.d()}}}function pn(t,e,n){var o=e.descriptionId,r=e.labelId,i=e.step;return t.$$set=function(t){"descriptionId"in t&&n(0,o=t.descriptionId),"labelId"in t&&n(1,r=t.labelId),"step"in t&&n(2,i=t.step)},[o,r,i]}var dn=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,pn,fn,te,{descriptionId:0,labelId:1,step:2}),n}return u(e,t),g(e)}(De);function hn(t){var e;return{c:function(){le(e=re("div"),"class","shepherd-arrow"),le(e,"data-popper-arrow","")},m:function(t,n){ne(t,e,n)},d:function(t){t&&oe(e)}}}function vn(t){var e,n,o,r,i,s,a,c,l=t[4].options.arrow&&t[4].options.attachTo&&t[4].options.attachTo.element&&t[4].options.attachTo.on&&hn();o=new dn({props:{descriptionId:t[2],labelId:t[3],step:t[4]}});for(var u=[{"aria-describedby":r=w(t[4].options.text)?null:t[2]},{"aria-labelledby":i=t[4].options.title?t[3]:null},t[1],{role:"dialog"},{tabindex:"0"}],f={},d=0;d<u.length;d+=1)f=Zt(f,u[d]);return{c:function(){e=re("div"),l&&l.c(),n=ae(),Pe(o.$$.fragment),ue(e,f),fe(e,"shepherd-has-cancel-icon",t[5]),fe(e,"shepherd-has-title",t[6]),fe(e,"shepherd-element",!0)},m:function(r,i){ne(r,e,i),l&&l.m(e,null),ee(e,n),Me(o,e,null),t[13](e),s=!0,a||(c=ce(e,"keydown",t[7]),a=!0)},p:function(t,a){var c=p(a,1)[0];t[4].options.arrow&&t[4].options.attachTo&&t[4].options.attachTo.element&&t[4].options.attachTo.on?l||((l=hn()).c(),l.m(e,n)):l&&(l.d(1),l=null);var d={};4&c&&(d.descriptionId=t[2]),8&c&&(d.labelId=t[3]),16&c&&(d.step=t[4]),o.$set(d),ue(e,f=function(t,e){for(var n={},o={},r={$$scope:1},i=t.length;i--;){var s=t[i],a=e[i];if(a){for(var c in s)c in a||(o[c]=1);for(var l in a)r[l]||(n[l]=a[l],r[l]=1);t[i]=a}else for(var u in s)r[u]=1}for(var f in o)f in n||(n[f]=void 0);return n}(u,[(!s||20&c&&r!==(r=w(t[4].options.text)?null:t[2]))&&{"aria-describedby":r},(!s||24&c&&i!==(i=t[4].options.title?t[3]:null))&&{"aria-labelledby":i},2&c&&t[1],{role:"dialog"},{tabindex:"0"}])),fe(e,"shepherd-has-cancel-icon",t[5]),fe(e,"shepherd-has-title",t[6]),fe(e,"shepherd-element",!0)},i:function(t){s||(Ae(o.$$.fragment,t),s=!0)},o:function(t){Ie(o.$$.fragment,t),s=!1},d:function(n){n&&oe(e),l&&l.d(),Le(o),t[13](null),a=!1,c()}}}function mn(t){return t.split(" ").filter((function(t){return!!t.length}))}function yn(t,e,n){var o,r,i,s,a=e.classPrefix,c=e.element,l=e.descriptionId,u=e.firstFocusableElement,f=e.focusableElements,p=e.labelId,h=e.lastFocusableElement,v=e.step,m=e.dataStepId;return s=function(){var t,e,o;n(1,(t={},e="data-".concat(a,"shepherd-step-id"),o=v.id,(e=b(e))in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,m=t)),n(9,f=c.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]')),n(8,u=f[0]),n(10,h=f[f.length-1])},de().$$.on_mount.push(s),he((function(){i!==v.options.classes&&(function(t){if(y(t)){var e,n=mn(t);n.length&&(e=c.classList).remove.apply(e,d(n))}}(i),function(t){if(y(t)){var e,n=mn(t);n.length&&(e=c.classList).add.apply(e,d(n))}}(i=v.options.classes))})),t.$$set=function(t){"classPrefix"in t&&n(11,a=t.classPrefix),"element"in t&&n(0,c=t.element),"descriptionId"in t&&n(2,l=t.descriptionId),"firstFocusableElement"in t&&n(8,u=t.firstFocusableElement),"focusableElements"in t&&n(9,f=t.focusableElements),"labelId"in t&&n(3,p=t.labelId),"lastFocusableElement"in t&&n(10,h=t.lastFocusableElement),"step"in t&&n(4,v=t.step),"dataStepId"in t&&n(1,m=t.dataStepId)},t.$$.update=function(){16&t.$$.dirty&&(n(5,o=v.options&&v.options.cancelIcon&&v.options.cancelIcon.enabled),n(6,r=v.options&&v.options.title))},[c,m,l,p,v,o,r,function(t){var e=v.tour;switch(t.keyCode){case 9:if(0===f.length){t.preventDefault();break}t.shiftKey?(document.activeElement===u||document.activeElement.classList.contains("shepherd-element"))&&(t.preventDefault(),h.focus()):document.activeElement===h&&(t.preventDefault(),u.focus());break;case 27:e.options.exitOnEsc&&v.cancel();break;case 37:e.options.keyboardNavigation&&e.back();break;case 39:e.options.keyboardNavigation&&e.next()}},u,f,h,a,function(){return c},function(t){me[t?"unshift":"push"]((function(){n(0,c=t)}))}]}var gn=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,yn,vn,te,{classPrefix:11,element:0,descriptionId:2,firstFocusableElement:8,focusableElements:9,labelId:3,lastFocusableElement:10,step:4,dataStepId:1,getElement:12}),n}return u(e,t),g(e,[{key:"getElement",get:function(){return this.$$.ctx[12]}}])}(De),bn=function(t,e){return t(e={exports:{}},e.exports),e.exports}((function(t,e){t.exports={polyfill:function(){var t=window,e=document;if(!("scrollBehavior"in e.documentElement.style)||!0===t.__forceSmoothScrollPolyfill__){var n,o=t.HTMLElement||t.Element,r={scroll:t.scroll||t.scrollTo,scrollBy:t.scrollBy,elementScroll:o.prototype.scroll||a,scrollIntoView:o.prototype.scrollIntoView},i=t.performance&&t.performance.now?t.performance.now.bind(t.performance):Date.now,s=(n=t.navigator.userAgent,new RegExp(["MSIE ","Trident/","Edge/"].join("|")).test(n)?1:0);t.scroll=t.scrollTo=function(){void 0!==arguments[0]&&(!0!==c(arguments[0])?d.call(t,e.body,void 0!==arguments[0].left?~~arguments[0].left:t.scrollX||t.pageXOffset,void 0!==arguments[0].top?~~arguments[0].top:t.scrollY||t.pageYOffset):r.scroll.call(t,void 0!==arguments[0].left?arguments[0].left:"object"!==x(arguments[0])?arguments[0]:t.scrollX||t.pageXOffset,void 0!==arguments[0].top?arguments[0].top:void 0!==arguments[1]?arguments[1]:t.scrollY||t.pageYOffset))},t.scrollBy=function(){void 0!==arguments[0]&&(c(arguments[0])?r.scrollBy.call(t,void 0!==arguments[0].left?arguments[0].left:"object"!==x(arguments[0])?arguments[0]:0,void 0!==arguments[0].top?arguments[0].top:void 0!==arguments[1]?arguments[1]:0):d.call(t,e.body,~~arguments[0].left+(t.scrollX||t.pageXOffset),~~arguments[0].top+(t.scrollY||t.pageYOffset)))},o.prototype.scroll=o.prototype.scrollTo=function(){if(void 0!==arguments[0])if(!0!==c(arguments[0])){var t=arguments[0].left,e=arguments[0].top;d.call(this,this,void 0===t?this.scrollLeft:~~t,void 0===e?this.scrollTop:~~e)}else{if("number"==typeof arguments[0]&&void 0===arguments[1])throw new SyntaxError("Value could not be converted");r.elementScroll.call(this,void 0!==arguments[0].left?~~arguments[0].left:"object"!==x(arguments[0])?~~arguments[0]:this.scrollLeft,void 0!==arguments[0].top?~~arguments[0].top:void 0!==arguments[1]?~~arguments[1]:this.scrollTop)}},o.prototype.scrollBy=function(){void 0!==arguments[0]&&(!0!==c(arguments[0])?this.scroll({left:~~arguments[0].left+this.scrollLeft,top:~~arguments[0].top+this.scrollTop,behavior:arguments[0].behavior}):r.elementScroll.call(this,void 0!==arguments[0].left?~~arguments[0].left+this.scrollLeft:~~arguments[0]+this.scrollLeft,void 0!==arguments[0].top?~~arguments[0].top+this.scrollTop:~~arguments[1]+this.scrollTop))},o.prototype.scrollIntoView=function(){if(!0!==c(arguments[0])){var n=function(t){for(;t!==e.body&&!1===f(t);)t=t.parentNode||t.host;return t}(this),o=n.getBoundingClientRect(),i=this.getBoundingClientRect();n!==e.body?(d.call(this,n,n.scrollLeft+i.left-o.left,n.scrollTop+i.top-o.top),"fixed"!==t.getComputedStyle(n).position&&t.scrollBy({left:o.left,top:o.top,behavior:"smooth"})):t.scrollBy({left:i.left,top:i.top,behavior:"smooth"})}else r.scrollIntoView.call(this,void 0===arguments[0]||arguments[0])}}function a(t,e){this.scrollLeft=t,this.scrollTop=e}function c(t){if(null===t||"object"!==x(t)||void 0===t.behavior||"auto"===t.behavior||"instant"===t.behavior)return!0;if("object"===x(t)&&"smooth"===t.behavior)return!1;throw new TypeError("behavior member of ScrollOptions "+t.behavior+" is not a valid value for enumeration ScrollBehavior.")}function l(t,e){return"Y"===e?t.clientHeight+s<t.scrollHeight:"X"===e?t.clientWidth+s<t.scrollWidth:void 0}function u(e,n){var o=t.getComputedStyle(e,null)["overflow"+n];return"auto"===o||"scroll"===o}function f(t){var e=l(t,"Y")&&u(t,"Y"),n=l(t,"X")&&u(t,"X");return e||n}function p(e){var n,o,r,s,a=(i()-e.startTime)/468;s=a=a>1?1:a,n=.5*(1-Math.cos(Math.PI*s)),o=e.startX+(e.x-e.startX)*n,r=e.startY+(e.y-e.startY)*n,e.method.call(e.scrollable,o,r),o===e.x&&r===e.y||t.requestAnimationFrame(p.bind(t,e))}function d(n,o,s){var c,l,u,f,d=i();n===e.body?(c=t,l=t.scrollX||t.pageXOffset,u=t.scrollY||t.pageYOffset,f=r.scroll):(c=n,l=n.scrollLeft,u=n.scrollTop,f=a),p({scrollable:c,method:f,startTime:d,startX:l,startY:u,x:o,y:s})}}}}));bn.polyfill,bn.polyfill();var xn=function(t){function e(t,n){var o;return m(this,e),void 0===n&&(n={}),(o=s(this,e,[t,n])).tour=t,o.classPrefix=o.tour.options?Vt(o.tour.options.classPrefix):"",o.styles=t.styles,o._resolvedAttachTo=null,$(o),o._setOptions(n),a(o,o)}return u(e,t),g(e,[{key:"cancel",value:function(){this.tour.cancel(),this.trigger("cancel")}},{key:"complete",value:function(){this.tour.complete(),this.trigger("complete")}},{key:"destroy",value:function(){this.tooltip&&(this.tooltip.destroy(),this.tooltip=null),h(this.el)&&this.el.parentNode&&(this.el.parentNode.removeChild(this.el),this.el=null),this._updateStepTargetOnHide(),this.trigger("destroy")}},{key:"getTour",value:function(){return this.tour}},{key:"hide",value:function(){this.tour.modal.hide(),this.trigger("before-hide"),this.el&&(this.el.hidden=!0),this._updateStepTargetOnHide(),this.trigger("hide")}},{key:"_resolveAttachToOptions",value:function(){return this._resolvedAttachTo=function(t){var e=t.options.attachTo||{},n=Object.assign({},e);if(v(n.element)&&(n.element=n.element.call(t)),y(n.element)){try{n.element=document.querySelector(n.element)}catch(t){}n.element||console.error("The element for this Shepherd step was not found ".concat(e.element))}return n}(this),this._resolvedAttachTo}},{key:"_getResolvedAttachToOptions",value:function(){return null===this._resolvedAttachTo?this._resolveAttachToOptions():this._resolvedAttachTo}},{key:"isOpen",value:function(){return Boolean(this.el&&!this.el.hidden)}},{key:"show",value:function(){var t=this;if(v(this.options.beforeShowPromise)){var e=this.options.beforeShowPromise();if(!w(e))return e.then((function(){return t._show()}))}this._show()}},{key:"updateStepOptions",value:function(t){Object.assign(this.options,t),this.shepherdElementComponent&&this.shepherdElementComponent.$set({step:this})}},{key:"getElement",value:function(){return this.el}},{key:"getTarget",value:function(){return this.target}},{key:"_createTooltipContent",value:function(){var t="".concat(this.id,"-description"),e="".concat(this.id,"-label");return this.shepherdElementComponent=new gn({target:this.tour.options.stepsContainer||document.body,props:{classPrefix:this.classPrefix,descriptionId:t,labelId:e,step:this,styles:this.styles}}),this.shepherdElementComponent.getElement()}},{key:"_scrollTo",value:function(t){var e=this._getResolvedAttachToOptions().element;v(this.options.scrollToHandler)?this.options.scrollToHandler(e):e instanceof Element&&"function"==typeof e.scrollIntoView&&e.scrollIntoView(t)}},{key:"_getClassOptions",value:function(t){var e=this.tour&&this.tour.options&&this.tour.options.defaultStepOptions,n=t.classes?t.classes:"",o=e&&e.classes?e.classes:"",r=[].concat(d(n.split(" ")),d(o.split(" "))),i=new Set(r);return Array.from(i).join(" ").trim()}},{key:"_setOptions",value:function(t){var e=this;void 0===t&&(t={});var n=this.tour&&this.tour.options&&this.tour.options.defaultStepOptions;n=f({},n||{}),this.options=Object.assign({arrow:!0},n,t);var o=this.options.when;this.options.classes=this._getClassOptions(t),this.destroy(),this.id=this.options.id||"step-".concat(Xt()),o&&Object.keys(o).forEach((function(t){e.on(t,o[t],e)}))}},{key:"_setupElements",value:function(){w(this.el)||this.destroy(),this.el=this._createTooltipContent(),this.options.advanceOn&&E(this),Yt(this)}},{key:"_show",value:function(){var t=this;this.trigger("before-show"),this._resolveAttachToOptions(),this._setupElements(),this.tour.modal||this.tour._setupModal(),this.tour.modal.setupForStep(this),this._styleTargetElementForStep(this),this.el.hidden=!1,this.options.scrollTo&&setTimeout((function(){t._scrollTo(t.options.scrollTo)})),this.el.hidden=!1;var e=this.shepherdElementComponent.getElement(),n=this.target||document.body;n.classList.add("".concat(this.classPrefix,"shepherd-enabled")),n.classList.add("".concat(this.classPrefix,"shepherd-target")),e.classList.add("shepherd-enabled"),this.trigger("show")}},{key:"_styleTargetElementForStep",value:function(t){var e=t.target;e&&(t.options.highlightClass&&e.classList.add(t.options.highlightClass),e.classList.remove("shepherd-target-click-disabled"),!1===t.options.canClickTarget&&e.classList.add("shepherd-target-click-disabled"))}},{key:"_updateStepTargetOnHide",value:function(){var t=this.target||document.body;this.options.highlightClass&&t.classList.remove(this.options.highlightClass),t.classList.remove("shepherd-target-click-disabled","".concat(this.classPrefix,"shepherd-enabled"),"".concat(this.classPrefix,"shepherd-target"))}}])}(O);function wn(t){var e,n,o,r,i;return{c:function(){e=ie("svg"),le(n=ie("path"),"d",t[2]),le(e,"class",o="".concat(t[1]?"shepherd-modal-is-visible":""," shepherd-modal-overlay-container"))},m:function(o,s){ne(o,e,s),ee(e,n),t[11](e),r||(i=ce(e,"touchmove",t[3]),r=!0)},p:function(t,r){var i=p(r,1)[0];4&i&&le(n,"d",t[2]),2&i&&o!==(o="".concat(t[1]?"shepherd-modal-is-visible":""," shepherd-modal-overlay-container"))&&le(e,"class",o)},i:zt,o:zt,d:function(n){n&&oe(e),t[11](null),r=!1,i()}}}function On(t){if(!t)return null;var e=t instanceof HTMLElement&&window.getComputedStyle(t).overflowY;return"hidden"!==e&&"visible"!==e&&t.scrollHeight>=t.clientHeight?t:On(t.parentElement)}function $n(t,e,n){var o=e.element,r=e.openingProperties;Xt();var i,s=!1,a=void 0;function c(){n(4,r={width:0,height:0,x:0,y:0,r:0})}function l(){n(1,s=!1),d()}function u(t,e,o,i){if(void 0===t&&(t=0),void 0===e&&(e=0),i){var s=function(t,e){var n=t.getBoundingClientRect(),o=n.y||n.top,r=n.bottom||o+n.height;if(e){var i=e.getBoundingClientRect(),s=i.y||i.top,a=i.bottom||s+i.height;o=Math.max(o,s),r=Math.min(r,a)}return{y:o,height:Math.max(r-o,0)}}(i,o),a=s.y,l=s.height,u=i.getBoundingClientRect(),f=u.x,p=u.width,d=u.left;n(4,r={width:p+2*t,height:l+2*t,x:(f||d)-t,y:a-t,r:e})}else c()}function f(){n(1,s=!0)}c();var p=function(t){t.preventDefault()};function d(){a&&(cancelAnimationFrame(a),a=void 0),window.removeEventListener("touchmove",p,{passive:!1})}return t.$$set=function(t){"element"in t&&n(0,o=t.element),"openingProperties"in t&&n(4,r=t.openingProperties)},t.$$.update=function(){var e,o,s,a,c,l,u,f,p,d,h,v;16&t.$$.dirty&&n(2,(o=(e=r).width,s=e.height,a=e.x,c=void 0===a?0:a,l=e.y,u=void 0===l?0:l,f=e.r,p=void 0===f?0:f,d=window,h=d.innerWidth,v=d.innerHeight,i="M".concat(h,",").concat(v,"H0V0H").concat(h,"V").concat(v,"ZM").concat(c+p,",").concat(u,"a").concat(p,",").concat(p,",0,0,0-").concat(p,",").concat(p,"V").concat(s+u-p,"a").concat(p,",").concat(p,",0,0,0,").concat(p,",").concat(p,"H").concat(o+c-p,"a").concat(p,",").concat(p,",0,0,0,").concat(p,"-").concat(p,"V").concat(u+p,"a").concat(p,",").concat(p,",0,0,0-").concat(p,"-").concat(p,"Z")))},[o,s,i,function(t){t.stopPropagation()},r,function(){return o},c,l,u,function(t){d(),t.tour.options.useModalOverlay?(function(t){var e=t.options,n=e.modalOverlayOpeningPadding,o=e.modalOverlayOpeningRadius,r=On(t.target),i=function(){a=void 0,u(n,o,r,t.target),a=requestAnimationFrame(i)};i(),window.addEventListener("touchmove",p,{passive:!1})}(t),f()):l()},f,function(t){me[t?"unshift":"push"]((function(){n(0,o=t)}))}]}var En=function(t){function e(t){var n;return m(this,e),Be(n=s(this,e),t,$n,wn,te,{element:0,openingProperties:4,getElement:5,closeModalOpening:6,hide:7,positionModal:8,setupForStep:9,show:10}),n}return u(e,t),g(e,[{key:"getElement",get:function(){return this.$$.ctx[5]}},{key:"closeModalOpening",get:function(){return this.$$.ctx[6]}},{key:"hide",get:function(){return this.$$.ctx[7]}},{key:"positionModal",get:function(){return this.$$.ctx[8]}},{key:"setupForStep",get:function(){return this.$$.ctx[9]}},{key:"show",get:function(){return this.$$.ctx[10]}}])}(De),Sn=new O,kn=function(t){function e(t){var n;return m(this,e),void 0===t&&(t={}),$(n=s(this,e,[t])),n.options=Object.assign({},{exitOnEsc:!0,keyboardNavigation:!0},t),n.classPrefix=Vt(n.options.classPrefix),n.steps=[],n.addSteps(n.options.steps),["active","cancel","complete","inactive","show","start"].map((function(t){var e;e=t,n.on(e,(function(t){(t=t||{}).tour=n,Sn.trigger(e,t)}))})),n._setTourID(),a(n,n)}return u(e,t),g(e,[{key:"addStep",value:function(t,e){var n=t;return n instanceof xn?n.tour=this:n=new xn(this,n),w(e)?this.steps.push(n):this.steps.splice(e,0,n),n}},{key:"addSteps",value:function(t){var e=this;return Array.isArray(t)&&t.forEach((function(t){e.addStep(t)})),this}},{key:"back",value:function(){var t=this.steps.indexOf(this.currentStep);this.show(t-1,!1)}},{key:"cancel",value:function(){if(this.options.confirmCancel){var t=this.options.confirmCancelMessage||"Are you sure you want to stop the tour?";window.confirm(t)&&this._done("cancel")}else this._done("cancel")}},{key:"complete",value:function(){this._done("complete")}},{key:"getById",value:function(t){return this.steps.find((function(e){return e.id===t}))}},{key:"getCurrentStep",value:function(){return this.currentStep}},{key:"hide",value:function(){var t=this.getCurrentStep();if(t)return t.hide()}},{key:"isActive",value:function(){return Sn.activeTour===this}},{key:"next",value:function(){var t=this.steps.indexOf(this.currentStep);t===this.steps.length-1?this.complete():this.show(t+1,!0)}},{key:"removeStep",value:function(t){var e=this,n=this.getCurrentStep();this.steps.some((function(n,o){if(n.id===t)return n.isOpen()&&n.hide(),n.destroy(),e.steps.splice(o,1),!0})),n&&n.id===t&&(this.currentStep=void 0,this.steps.length?this.show(0):this.cancel())}},{key:"show",value:function(t,e){void 0===t&&(t=0),void 0===e&&(e=!0);var n=y(t)?this.getById(t):this.steps[t];n&&(this._updateStateBeforeShow(),v(n.options.showOn)&&!n.options.showOn()?this._skipStep(n,e):(this.trigger("show",{step:n,previous:this.currentStep}),this.currentStep=n,n.show()))}},{key:"start",value:function(){this.trigger("start"),this.focusedElBeforeOpen=document.activeElement,this.currentStep=null,this._setupModal(),this._setupActiveTour(),this.next()}},{key:"_done",value:function(t){var e,n=this.steps.indexOf(this.currentStep);if(Array.isArray(this.steps)&&this.steps.forEach((function(t){return t.destroy()})),(e=this)&&e.steps.forEach((function(t){t.options&&!1===t.options.canClickTarget&&t.options.attachTo&&t.target instanceof HTMLElement&&t.target.classList.remove("shepherd-target-click-disabled")})),this.trigger(t,{index:n}),Sn.activeTour=null,this.trigger("inactive",{tour:this}),this.modal&&this.modal.hide(),("cancel"===t||"complete"===t)&&this.modal){var o=document.querySelector(".shepherd-modal-overlay-container");o&&o.remove()}h(this.focusedElBeforeOpen)&&this.focusedElBeforeOpen.focus()}},{key:"_setupActiveTour",value:function(){this.trigger("active",{tour:this}),Sn.activeTour=this}},{key:"_setupModal",value:function(){this.modal=new En({target:this.options.modalContainer||document.body,props:{classPrefix:this.classPrefix,styles:this.styles}})}},{key:"_skipStep",value:function(t,e){var n=this.steps.indexOf(t);if(n===this.steps.length-1)this.complete();else{var o=e?n+1:n-1;this.show(o,e)}}},{key:"_updateStateBeforeShow",value:function(){this.currentStep&&this.currentStep.hide(),this.isActive()||this._setupActiveTour()}},{key:"_setTourID",value:function(){var t=this.options.tourName||"tour";this.id="".concat(t,"--").concat(Xt())}}])}(O);return Object.assign(Sn,{Tour:kn,Step:xn}),Sn},"object"===x(e)?t.exports=i():void 0===(r="function"==typeof(o=i)?o.call(e,n,e,t):o)||(t.exports=r)}},e={};function n(o){var r=e[o];if(void 0!==r)return r.exports;var i=e[o]={exports:{}};return t[o].call(i.exports,i,i.exports,n),i.exports}n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,{a:e}),e},n.d=function(t,e){for(var o in e)n.o(e,o)&&!n.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var o={};return function(){"use strict";n.r(o),n.d(o,{Shepherd:function(){return e.a}});var t=n(13613),e=n.n(t)}(),o}()}));
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
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/shepherd.js/dist/js/shepherd.js":
/*!******************************************************!*\
  !*** ./node_modules/shepherd.js/dist/js/shepherd.js ***!
  \******************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
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
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/*! shepherd.js 10.0.1 */

(function (global, factory) {
  ( false ? 0 : _typeof(exports)) === 'object' && "object" !== 'undefined' ? module.exports = factory() :  true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : (0);
})(this, function () {
  'use strict';

  var isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
  };
  function isNonNullObject(value) {
    return !!value && _typeof(value) === 'object';
  }
  function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
  } // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25

  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;
  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
  }
  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }
  function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
  }
  function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function (element) {
      return cloneUnlessOtherwiseSpecified(element, options);
    });
  }
  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge;
    }
    var customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge;
  }
  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
      return target.propertyIsEnumerable(symbol);
    }) : [];
  }
  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
  }
  function propertyIsOnObject(object, property) {
    try {
      return property in object;
    } catch (_) {
      return false;
    }
  } // Protects from prototype poisoning and unexpected merging up the prototype chain.

  function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
    && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
    && Object.propertyIsEnumerable.call(target, key)); // and also unsafe if they're nonenumerable.
  }
  function mergeObject(target, source, options) {
    var destination = {};
    if (options.isMergeableObject(target)) {
      getKeys(target).forEach(function (key) {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }
    getKeys(source).forEach(function (key) {
      if (propertyIsUnsafe(target, key)) {
        return;
      }
      if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
        destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination;
  }
  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject; // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.

    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
      return options.arrayMerge(target, source, options);
    } else {
      return mergeObject(target, source, options);
    }
  }
  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error('first argument should be an array');
    }
    return array.reduce(function (prev, next) {
      return deepmerge(prev, next, options);
    }, {});
  };
  var deepmerge_1 = deepmerge;
  var cjs = deepmerge_1;

  /**
   * Checks if `value` is classified as an `Element`.
   * @param {*} value The param to check if it is an Element
   */
  function isElement$1(value) {
    return value instanceof Element;
  }
  /**
   * Checks if `value` is classified as an `HTMLElement`.
   * @param {*} value The param to check if it is an HTMLElement
   */

  function isHTMLElement$1(value) {
    return value instanceof HTMLElement;
  }
  /**
   * Checks if `value` is classified as a `Function` object.
   * @param {*} value The param to check if it is a function
   */

  function isFunction(value) {
    return typeof value === 'function';
  }
  /**
   * Checks if `value` is classified as a `String` object.
   * @param {*} value The param to check if it is a string
   */

  function isString(value) {
    return typeof value === 'string';
  }
  /**
   * Checks if `value` is undefined.
   * @param {*} value The param to check if it is undefined
   */

  function isUndefined(value) {
    return value === undefined;
  }
  var Evented = /*#__PURE__*/function () {
    function Evented() {
      _classCallCheck(this, Evented);
    }
    _createClass(Evented, [{
      key: "on",
      value: function on(event, handler, ctx, once) {
        if (once === void 0) {
          once = false;
        }
        if (isUndefined(this.bindings)) {
          this.bindings = {};
        }
        if (isUndefined(this.bindings[event])) {
          this.bindings[event] = [];
        }
        this.bindings[event].push({
          handler: handler,
          ctx: ctx,
          once: once
        });
        return this;
      }
    }, {
      key: "once",
      value: function once(event, handler, ctx) {
        return this.on(event, handler, ctx, true);
      }
    }, {
      key: "off",
      value: function off(event, handler) {
        var _this = this;
        if (isUndefined(this.bindings) || isUndefined(this.bindings[event])) {
          return this;
        }
        if (isUndefined(handler)) {
          delete this.bindings[event];
        } else {
          this.bindings[event].forEach(function (binding, index) {
            if (binding.handler === handler) {
              _this.bindings[event].splice(index, 1);
            }
          });
        }
        return this;
      }
    }, {
      key: "trigger",
      value: function trigger(event) {
        var _this2 = this;
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        if (!isUndefined(this.bindings) && this.bindings[event]) {
          this.bindings[event].forEach(function (binding, index) {
            var ctx = binding.ctx,
              handler = binding.handler,
              once = binding.once;
            var context = ctx || _this2;
            handler.apply(context, args);
            if (once) {
              _this2.bindings[event].splice(index, 1);
            }
          });
        }
        return this;
      }
    }]);
    return Evented;
  }();
  /**
   * Binds all the methods on a JS Class to the `this` context of the class.
   * Adapted from https://github.com/sindresorhus/auto-bind
   * @param {object} self The `this` context of the class
   * @return {object} The `this` context of the class
   */
  function autoBind(self) {
    var keys = Object.getOwnPropertyNames(self.constructor.prototype);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var val = self[key];
      if (key !== 'constructor' && typeof val === 'function') {
        self[key] = val.bind(self);
      }
    }
    return self;
  }

  /**
   * Sets up the handler to determine if we should advance the tour
   * @param {string} selector
   * @param {Step} step The step instance
   * @return {Function}
   * @private
   */

  function _setupAdvanceOnHandler(selector, step) {
    return function (event) {
      if (step.isOpen()) {
        var targetIsEl = step.el && event.currentTarget === step.el;
        var targetIsSelector = !isUndefined(selector) && event.currentTarget.matches(selector);
        if (targetIsSelector || targetIsEl) {
          step.tour.next();
        }
      }
    };
  }
  /**
   * Bind the event handler for advanceOn
   * @param {Step} step The step instance
   */

  function bindAdvance(step) {
    // An empty selector matches the step element
    var _ref6 = step.options.advanceOn || {},
      event = _ref6.event,
      selector = _ref6.selector;
    if (event) {
      var handler = _setupAdvanceOnHandler(selector, step); // TODO: this should also bind/unbind on show/hide

      var el;
      try {
        el = document.querySelector(selector);
      } catch (e) {// TODO
      }
      if (!isUndefined(selector) && !el) {
        return console.error("No element was found for the selector supplied to advanceOn: ".concat(selector));
      } else if (el) {
        el.addEventListener(event, handler);
        step.on('destroy', function () {
          return el.removeEventListener(event, handler);
        });
      } else {
        document.body.addEventListener(event, handler, true);
        step.on('destroy', function () {
          return document.body.removeEventListener(event, handler, true);
        });
      }
    } else {
      return console.error('advanceOn was defined, but no event name was passed.');
    }
  }
  var top = 'top';
  var bottom = 'bottom';
  var right = 'right';
  var left = 'left';
  var auto = 'auto';
  var basePlacements = [top, bottom, right, left];
  var start = 'start';
  var end = 'end';
  var clippingParents = 'clippingParents';
  var viewport = 'viewport';
  var popper = 'popper';
  var reference = 'reference';
  var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []); // modifiers that need to read the DOM

  var beforeRead = 'beforeRead';
  var read = 'read';
  var afterRead = 'afterRead'; // pure-logic modifiers

  var beforeMain = 'beforeMain';
  var main = 'main';
  var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

  var beforeWrite = 'beforeWrite';
  var write = 'write';
  var afterWrite = 'afterWrite';
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
  function getNodeName(element) {
    return element ? (element.nodeName || '').toLowerCase() : null;
  }
  function getWindow(node) {
    if (node == null) {
      return window;
    }
    if (node.toString() !== '[object Window]') {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }
    return node;
  }
  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }
  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }
  function isShadowRoot(node) {
    // IE 11 has no ShadowRoot
    if (typeof ShadowRoot === 'undefined') {
      return false;
    }
    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  // and applies them to the HTMLElements such as popper and arrow

  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function (name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name]; // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      } // Flow doesn't support to extend this property, but it's the most
      // effective way to apply styles to an HTMLElement
      // $FlowFixMe[cannot-write]

      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (name) {
        var value = attributes[name];
        if (value === false) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, value === true ? '' : value);
        }
      });
    });
  }
  function effect$2(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0'
      },
      arrow: {
        position: 'absolute'
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
    return function () {
      Object.keys(state.elements).forEach(function (name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

        var style = styleProperties.reduce(function (style, property) {
          style[property] = '';
          return style;
        }, {}); // arrow is optional + virtual elements

        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  } // eslint-disable-next-line import/no-unused-modules

  var applyStyles$1 = {
    name: 'applyStyles',
    enabled: true,
    phase: 'write',
    fn: applyStyles,
    effect: effect$2,
    requires: ['computeStyles']
  };
  function getBasePlacement(placement) {
    return placement.split('-')[0];
  }
  var max = Math.max;
  var min = Math.min;
  var round = Math.round;
  function getBoundingClientRect(element, includeScale) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    var rect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;
    if (isHTMLElement(element) && includeScale) {
      var offsetHeight = element.offsetHeight;
      var offsetWidth = element.offsetWidth; // Do not attempt to divide by 0, otherwise we get `Infinity` as scale
      // Fallback to 1 in case both values are `0`

      if (offsetWidth > 0) {
        scaleX = round(rect.width) / offsetWidth || 1;
      }
      if (offsetHeight > 0) {
        scaleY = round(rect.height) / offsetHeight || 1;
      }
    }
    return {
      width: rect.width / scaleX,
      height: rect.height / scaleY,
      top: rect.top / scaleY,
      right: rect.right / scaleX,
      bottom: rect.bottom / scaleY,
      left: rect.left / scaleX,
      x: rect.left / scaleX,
      y: rect.top / scaleY
    };
  }

  // means it doesn't take into account transforms.

  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
    // Fixes https://github.com/popperjs/popper-core/issues/1223

    var width = element.offsetWidth;
    var height = element.offsetHeight;
    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }
    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }
    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width: width,
      height: height
    };
  }
  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

    if (parent.contains(child)) {
      return true;
    } // then fallback to custom implementation with Shadow DOM support
    else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;
      do {
        if (next && parent.isSameNode(next)) {
          return true;
        } // $FlowFixMe[prop-missing]: need a better way to handle this...

        next = next.parentNode || next.host;
      } while (next);
    } // Give up, the result is false

    return false;
  }
  function getComputedStyle(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function isTableElement(element) {
    return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
  }
  function getDocumentElement(element) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return ((isElement(element) ? element.ownerDocument :
    // $FlowFixMe[prop-missing]
    element.document) || window.document).documentElement;
  }
  function getParentNode(element) {
    if (getNodeName(element) === 'html') {
      return element;
    }
    return (
      // this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot ||
      // step into the shadow DOM of the parent of a slotted node
      element.parentNode || (
      // DOM Element detected
      isShadowRoot(element) ? element.host : null) ||
      // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element) // fallback
    );
  }
  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) ||
    // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle(element).position === 'fixed') {
      return null;
    }
    return element.offsetParent;
  } // `.offsetParent` reports `null` for fixed elements, while absolute elements
  // return the containing block

  function getContainingBlock(element) {
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
    var isIE = navigator.userAgent.indexOf('Trident') !== -1;
    if (isIE && isHTMLElement(element)) {
      // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
      var elementCss = getComputedStyle(element);
      if (elementCss.position === 'fixed') {
        return null;
      }
    }
    var currentNode = getParentNode(element);
    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle(currentNode); // This is non-exhaustive but covers the most common CSS properties that
      // create a containing block.
      // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

      if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  } // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.

  function getOffsetParent(element) {
    var window = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static') {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle(offsetParent).position === 'static')) {
      return window;
    }
    return offsetParent || getContainingBlock(element) || window;
  }
  function getMainAxisFromPlacement(placement) {
    return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
  }
  function within(min$1, value, max$1) {
    return max(min$1, min(value, max$1));
  }
  function withinMaxClamp(min, value, max) {
    var v = within(min, value, max);
    return v > max ? max : v;
  }
  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }
  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }
  function expandToHashMap(value, keys) {
    return keys.reduce(function (hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }
  var toPaddingObject = function toPaddingObject(padding, state) {
    padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  };
  function arrow(_ref) {
    var _state$modifiersData$;
    var state = _ref.state,
      name = _ref.name,
      options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? 'height' : 'width';
    if (!arrowElement || !popperOffsets) {
      return;
    }
    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === 'y' ? top : left;
    var maxProp = axis === 'y' ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
    var startDiff = popperOffsets[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
    // outside of the popper bounds

    var min = paddingObject[minProp];
    var max = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset = within(min, center, max); // Prevents breaking syntax highlighting...

    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
  }
  function effect$1(_ref2) {
    var state = _ref2.state,
      options = _ref2.options;
    var _options$element = options.element,
      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;
    if (arrowElement == null) {
      return;
    } // CSS selector

    if (typeof arrowElement === 'string') {
      arrowElement = state.elements.popper.querySelector(arrowElement);
      if (!arrowElement) {
        return;
      }
    }
    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }
    state.elements.arrow = arrowElement;
  } // eslint-disable-next-line import/no-unused-modules

  var arrow$1 = {
    name: 'arrow',
    enabled: true,
    phase: 'main',
    fn: arrow,
    effect: effect$1,
    requires: ['popperOffsets'],
    requiresIfExists: ['preventOverflow']
  };
  function getVariation(placement) {
    return placement.split('-')[1];
  }
  var unsetSides = {
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto'
  }; // Round the offsets to the nearest suitable subpixel based on the DPR.
  // Zooming can change the DPR, but it seems to report a value that will
  // cleanly divide the values into the appropriate subpixels.

  function roundOffsetsByDPR(_ref) {
    var x = _ref.x,
      y = _ref.y;
    var win = window;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }
  function mapToStyles(_ref2) {
    var _Object$assign2;
    var popper = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      variation = _ref2.variation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x,
      x = _offsets$x === void 0 ? 0 : _offsets$x,
      _offsets$y = offsets.y,
      y = _offsets$y === void 0 ? 0 : _offsets$y;
    var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
      x: x,
      y: y
    }) : {
      x: x,
      y: y
    };
    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty('x');
    var hasY = offsets.hasOwnProperty('y');
    var sideX = left;
    var sideY = top;
    var win = window;
    if (adaptive) {
      var offsetParent = getOffsetParent(popper);
      var heightProp = 'clientHeight';
      var widthProp = 'clientWidth';
      if (offsetParent === getWindow(popper)) {
        offsetParent = getDocumentElement(popper);
        if (getComputedStyle(offsetParent).position !== 'static' && position === 'absolute') {
          heightProp = 'scrollHeight';
          widthProp = 'scrollWidth';
        }
      } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it

      offsetParent = offsetParent;
      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height :
        // $FlowFixMe[prop-missing]
        offsetParent[heightProp];
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }
      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width :
        // $FlowFixMe[prop-missing]
        offsetParent[widthProp];
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }
    var commonStyles = Object.assign({
      position: position
    }, adaptive && unsetSides);
    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x: x,
      y: y
    }) : {
      x: x,
      y: y
    };
    x = _ref4.x;
    y = _ref4.y;
    if (gpuAcceleration) {
      var _Object$assign;
      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }
    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
  }
  function computeStyles(_ref5) {
    var state = _ref5.state,
      options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration,
      gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
      _options$adaptive = options.adaptive,
      adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
      _options$roundOffsets = options.roundOffsets,
      roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration: gpuAcceleration,
      isFixed: state.options.strategy === 'fixed'
    };
    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive: adaptive,
        roundOffsets: roundOffsets
      })));
    }
    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: 'absolute',
        adaptive: false,
        roundOffsets: roundOffsets
      })));
    }
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-placement': state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules

  var computeStyles$1 = {
    name: 'computeStyles',
    enabled: true,
    phase: 'beforeWrite',
    fn: computeStyles,
    data: {}
  };
  var passive = {
    passive: true
  };
  function effect(_ref) {
    var state = _ref.state,
      instance = _ref.instance,
      options = _ref.options;
    var _options$scroll = options.scroll,
      scroll = _options$scroll === void 0 ? true : _options$scroll,
      _options$resize = options.resize,
      resize = _options$resize === void 0 ? true : _options$resize;
    var window = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.addEventListener('scroll', instance.update, passive);
      });
    }
    if (resize) {
      window.addEventListener('resize', instance.update, passive);
    }
    return function () {
      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.removeEventListener('scroll', instance.update, passive);
        });
      }
      if (resize) {
        window.removeEventListener('resize', instance.update, passive);
      }
    };
  } // eslint-disable-next-line import/no-unused-modules

  var eventListeners = {
    name: 'eventListeners',
    enabled: true,
    phase: 'write',
    fn: function fn() {},
    effect: effect,
    data: {}
  };
  var hash$1 = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash$1[matched];
    });
  }
  var hash = {
    start: 'end',
    end: 'start'
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function (matched) {
      return hash[matched];
    });
  }
  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft: scrollLeft,
      scrollTop: scrollTop
    };
  }
  function getWindowScrollBarX(element) {
    // If <html> has a CSS width greater than the viewport, then this will be
    // incorrect for RTL.
    // Popper 1 is broken in this case and never had a bug report so let's assume
    // it's not an issue. I don't think anyone ever specifies width on <html>
    // anyway.
    // Browsers where the left scrollbar doesn't cause an issue report `0` for
    // this (e.g. Edge 2019, IE11, Safari)
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }
  function getViewportRect(element) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0; // NB: This isn't supported on iOS <= 12. If the keyboard is open, the popper
    // can be obscured underneath it.
    // Also, `html.clientHeight` adds the bottom bar height in Safari iOS, even
    // if it isn't open, so if this isn't available, the popper will be detected
    // to overflow the bottom of the screen too early.

    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height; // Uses Layout Viewport (like Chrome; Safari does not currently)
      // In Chrome, it returns a value very close to 0 (+/-) but contains rounding
      // errors due to floating point numbers, so we need to check precision.
      // Safari returns a number <= 0, usually < -1 when pinch-zoomed
      // Feature detection fails in mobile emulation mode in Chrome.
      // Math.abs(win.innerWidth / visualViewport.scale - visualViewport.width) <
      // 0.001
      // Fallback here: "Not Safari" userAgent

      if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width: width,
      height: height,
      x: x + getWindowScrollBarX(element),
      y: y
    };
  }

  // of the `<html>` and `<body>` rect bounds if horizontally scrollable

  function getDocumentRect(element) {
    var _element$ownerDocumen;
    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;
    if (getComputedStyle(body || html).direction === 'rtl') {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width: width,
      height: height,
      x: x,
      y: y
    };
  }
  function isScrollParent(element) {
    // Firefox wants us to check `-x` and `-y` variations as well
    var _getComputedStyle = getComputedStyle(element),
      overflow = _getComputedStyle.overflow,
      overflowX = _getComputedStyle.overflowX,
      overflowY = _getComputedStyle.overflowY;
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }
  function getScrollParent(node) {
    if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
      // $FlowFixMe[incompatible-return]: assume body is always available
      return node.ownerDocument.body;
    }
    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }
    return getScrollParent(getParentNode(node));
  }

  /*
  given a DOM element, return the list of all scroll parents, up the list of ancesors
  until we get to the top window object. This list is what we attach scroll listeners
  to, because if any of these parent elements scroll, we'll need to re-calculate the
  reference element's position.
  */

  function listScrollParents(element, list) {
    var _element$ownerDocumen;
    if (list === void 0) {
      list = [];
    }
    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList :
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)));
  }
  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }
  function getInnerBoundingClientRect(element) {
    var rect = getBoundingClientRect(element);
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function getClientRectFromMixedType(element, clippingParent) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  } // A "clipping parent" is an overflowable container with the characteristic of
  // clipping (or hiding) overflowing elements with a position different from
  // `initial`

  function getClippingParents(element) {
    var clippingParents = listScrollParents(getParentNode(element));
    var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
    if (!isElement(clipperElement)) {
      return [];
    } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414

    return clippingParents.filter(function (clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
    });
  } // Gets the maximum area that the element is visible in due to any number of
  // clipping parents

  function getClippingRect(element, boundary, rootBoundary) {
    var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
    var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents[0];
    var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }
  function computeOffsets(_ref) {
    var reference = _ref.reference,
      element = _ref.element,
      placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference.x + reference.width / 2 - element.width / 2;
    var commonY = reference.y + reference.height / 2 - element.height / 2;
    var offsets;
    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference.y - element.height
        };
        break;
      case bottom:
        offsets = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case right:
        offsets = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case left:
        offsets = {
          x: reference.x - element.width,
          y: commonY
        };
        break;
      default:
        offsets = {
          x: reference.x,
          y: reference.y
        };
    }
    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
    if (mainAxis != null) {
      var len = mainAxis === 'y' ? 'height' : 'width';
      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
          break;
        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
          break;
      }
    }
    return offsets;
  }
  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options,
      _options$placement = _options.placement,
      placement = _options$placement === void 0 ? state.placement : _options$placement,
      _options$boundary = _options.boundary,
      boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
      _options$rootBoundary = _options.rootBoundary,
      rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
      _options$elementConte = _options.elementContext,
      elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
      _options$altBoundary = _options.altBoundary,
      altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
      _options$padding = _options.padding,
      padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: 'absolute',
      placement: placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
    // 0 or negative = within the clipping rect

    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

    if (elementContext === popper && offsetData) {
      var offset = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function (key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
        overflowOffsets[key] += offset[axis] * multiply;
      });
    }
    return overflowOffsets;
  }
  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options,
      placement = _options.placement,
      boundary = _options.boundary,
      rootBoundary = _options.rootBoundary,
      padding = _options.padding,
      flipVariations = _options.flipVariations,
      _options$allowedAutoP = _options.allowedAutoPlacements,
      allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
      return getVariation(placement) === variation;
    }) : basePlacements;
    var allowedPlacements = placements$1.filter(function (placement) {
      return allowedAutoPlacements.indexOf(placement) >= 0;
    });
    if (allowedPlacements.length === 0) {
      allowedPlacements = placements$1;
    } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...

    var overflows = allowedPlacements.reduce(function (acc, placement) {
      acc[placement] = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding
      })[getBasePlacement(placement)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function (a, b) {
      return overflows[a] - overflows[b];
    });
  }
  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }
    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }
  function flip(_ref) {
    var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
    if (state.modifiersData[name]._skip) {
      return;
    }
    var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      _options$flipVariatio = options.flipVariations,
      flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
      allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
      return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding,
        flipVariations: flipVariations,
        allowedAutoPlacements: allowedAutoPlacements
      }) : placement);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements[0];
    for (var i = 0; i < placements.length; i++) {
      var placement = placements[i];
      var _basePlacement = getBasePlacement(placement);
      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? 'width' : 'height';
      var overflow = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        altBoundary: altBoundary,
        padding: padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }
      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];
      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }
      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }
      if (checks.every(function (check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }
      checksMap.set(placement, checks);
    }
    if (makeFallbackChecks) {
      // `2` may be desired in some cases – research later
      var numberOfChecks = flipVariations ? 3 : 1;
      var _loop = function _loop(_i) {
        var fittingPlacement = placements.find(function (placement) {
          var checks = checksMap.get(placement);
          if (checks) {
            return checks.slice(0, _i).every(function (check) {
              return check;
            });
          }
        });
        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };
      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);
        if (_ret === "break") break;
      }
    }
    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  } // eslint-disable-next-line import/no-unused-modules

  var flip$1 = {
    name: 'flip',
    enabled: true,
    phase: 'main',
    fn: flip,
    requiresIfExists: ['offset'],
    data: {
      _skip: false
    }
  };
  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }
    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }
  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function (side) {
      return overflow[side] >= 0;
    });
  }
  function hide(_ref) {
    var state = _ref.state,
      name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: 'reference'
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets: referenceClippingOffsets,
      popperEscapeOffsets: popperEscapeOffsets,
      isReferenceHidden: isReferenceHidden,
      hasPopperEscaped: hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-reference-hidden': isReferenceHidden,
      'data-popper-escaped': hasPopperEscaped
    });
  } // eslint-disable-next-line import/no-unused-modules

  var hide$1 = {
    name: 'hide',
    enabled: true,
    phase: 'main',
    requiresIfExists: ['preventOverflow'],
    fn: hide
  };
  function distanceAndSkiddingToXY(placement, rects, offset) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
    var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
        placement: placement
      })) : offset,
      skidding = _ref[0],
      distance = _ref[1];
    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }
  function offset(_ref2) {
    var state = _ref2.state,
      options = _ref2.options,
      name = _ref2.name;
    var _options$offset = options.offset,
      offset = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function (acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement],
      x = _data$state$placement.x,
      y = _data$state$placement.y;
    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }
    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules

  var offset$1 = {
    name: 'offset',
    enabled: true,
    phase: 'main',
    requires: ['popperOffsets'],
    fn: offset
  };
  function popperOffsets(_ref) {
    var state = _ref.state,
      name = _ref.name; // Offsets are the actual position the popper needs to have to be
    // properly positioned near its reference element
    // This is the most basic placement, and will be adjusted by
    // the modifiers in the next step

    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: 'absolute',
      placement: state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules

  var popperOffsets$1 = {
    name: 'popperOffsets',
    enabled: true,
    phase: 'read',
    fn: popperOffsets,
    data: {}
  };
  function getAltAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }
  function preventOverflow(_ref) {
    var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
    var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === void 0 ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      altBoundary: altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };
    if (!popperOffsets) {
      return;
    }
    if (checkMainAxis) {
      var _offsetModifierState$;
      var mainSide = mainAxis === 'y' ? top : left;
      var altSide = mainAxis === 'y' ? bottom : right;
      var len = mainAxis === 'y' ? 'height' : 'width';
      var offset = popperOffsets[mainAxis];
      var min$1 = offset + overflow[mainSide];
      var max$1 = offset - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
      // outside the reference bounds

      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
      // to include its full size in the calculation. If the reference is small
      // and near the edge of a boundary, the popper can overflow even if the
      // reference is not overflowing as well (e.g. virtual elements with no
      // width or height)

      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
      popperOffsets[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset;
    }
    if (checkAltAxis) {
      var _offsetModifierState$2;
      var _mainSide = mainAxis === 'x' ? top : left;
      var _altSide = mainAxis === 'x' ? bottom : right;
      var _offset = popperOffsets[altAxis];
      var _len = altAxis === 'y' ? 'height' : 'width';
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
      popperOffsets[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }
    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules

  var preventOverflow$1 = {
    name: 'preventOverflow',
    enabled: true,
    phase: 'main',
    fn: preventOverflow,
    requiresIfExists: ['offset']
  };
  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }
  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  } // Returns the composite rect of an element relative to its offsetParent.
  // Composite means it takes into account transforms as well as layout.

  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' ||
      // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }
  function order(modifiers) {
    var map = new Map();
    var visited = new Set();
    var result = [];
    modifiers.forEach(function (modifier) {
      map.set(modifier.name, modifier);
    }); // On visiting object, check for its dependencies and visit them recursively

    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function (dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);
          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }
    modifiers.forEach(function (modifier) {
      if (!visited.has(modifier.name)) {
        // check for visited object
        sort(modifier);
      }
    });
    return result;
  }
  function orderModifiers(modifiers) {
    // order based on dependencies
    var orderedModifiers = order(modifiers); // order based on phase

    return modifierPhases.reduce(function (acc, phase) {
      return acc.concat(orderedModifiers.filter(function (modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }
  function debounce(fn) {
    var pending;
    return function () {
      if (!pending) {
        pending = new Promise(function (resolve) {
          Promise.resolve().then(function () {
            pending = undefined;
            resolve(fn());
          });
        });
      }
      return pending;
    };
  }
  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function (merged, current) {
      var existing = merged[current.name];
      merged[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged;
    }, {}); // IE11 does not support Object.values

    return Object.keys(merged).map(function (key) {
      return merged[key];
    });
  }
  var DEFAULT_OPTIONS = {
    placement: 'bottom',
    modifiers: [],
    strategy: 'absolute'
  };
  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return !args.some(function (element) {
      return !(element && typeof element.getBoundingClientRect === 'function');
    });
  }
  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }
    var _generatorOptions = generatorOptions,
      _generatorOptions$def = _generatorOptions.defaultModifiers,
      defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
      _generatorOptions$def2 = _generatorOptions.defaultOptions,
      defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper(reference, popper, options) {
      if (options === void 0) {
        options = defaultOptions;
      }
      var state = {
        placement: 'bottom',
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference,
          popper: popper
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state: state,
        setOptions: function setOptions(setOptionsAction) {
          var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options);
          state.scrollParents = {
            reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
            popper: listScrollParents(popper)
          }; // Orders the modifiers based on their dependencies and `phase`
          // properties

          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

          state.orderedModifiers = orderedModifiers.filter(function (m) {
            return m.enabled;
          }); // Validate the provided modifiers so that the consumer will get warned

          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }
          var _state$elements = state.elements,
            reference = _state$elements.reference,
            popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
          // anymore

          if (!areValidElements(reference, popper)) {
            return;
          } // Store the reference and popper rects to be read by modifiers

          state.rects = {
            reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
            popper: getLayoutRect(popper)
          }; // Modifiers have the ability to reset the current update cycle. The
          // most common use case for this is the `flip` modifier changing the
          // placement, which then needs to re-run all the modifiers, because the
          // logic was previously ran for the previous placement and is therefore
          // stale/incorrect

          state.reset = false;
          state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
          // is filled with the initial data specified by the modifier. This means
          // it doesn't persist and is fresh on each update.
          // To ensure persistent data, use `${name}#persistent`

          state.orderedModifiers.forEach(function (modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });
          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }
            var _state$orderedModifie = state.orderedModifiers[index],
              fn = _state$orderedModifie.fn,
              _state$orderedModifie2 = _state$orderedModifie.options,
              _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
              name = _state$orderedModifie.name;
            if (typeof fn === 'function') {
              state = fn({
                state: state,
                options: _options,
                name: name,
                instance: instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce(function () {
          return new Promise(function (resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };
      if (!areValidElements(reference, popper)) {
        return instance;
      }
      instance.setOptions(options).then(function (state) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state);
        }
      }); // Modifiers have the ability to execute arbitrary code before the first
      // update cycle runs. They will be executed in the same order as the update
      // cycle. This is useful when a modifier adds some persistent data that
      // other modifiers need to use, but the modifier is run after the dependent
      // one.

      function runModifierEffects() {
        state.orderedModifiers.forEach(function (_ref3) {
          var name = _ref3.name,
            _ref3$options = _ref3.options,
            options = _ref3$options === void 0 ? {} : _ref3$options,
            effect = _ref3.effect;
          if (typeof effect === 'function') {
            var cleanupFn = effect({
              state: state,
              name: name,
              instance: instance,
              options: options
            });
            var noopFn = function noopFn() {};
            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }
      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function (fn) {
          return fn();
        });
        effectCleanupFns = [];
      }
      return instance;
    };
  }
  var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
  var createPopper = /*#__PURE__*/popperGenerator({
    defaultModifiers: defaultModifiers
  }); // eslint-disable-next-line import/no-unused-modules

  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function _getCenteredStylePopperModifier() {
    return [{
      name: 'applyStyles',
      fn: function fn(_ref) {
        var state = _ref.state;
        Object.keys(state.elements).forEach(function (name) {
          if (name !== 'popper') {
            return;
          }
          var style = {
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          };
          var attributes = state.attributes[name] || {};
          var element = state.elements[name];
          Object.assign(element.style, style);
          Object.keys(attributes).forEach(function (name) {
            var value = attributes[name];
            if (value === false) {
              element.removeAttribute(name);
            } else {
              element.setAttribute(name, value === true ? '' : value);
            }
          });
        });
      }
    }, {
      name: 'computeStyles',
      options: {
        adaptive: false
      }
    }];
  }
  /**
   * Generates a modifier for popper that will help focus the element after it has
   * been rendered
   *
   * @param {Step} step The step instance
   * @return {Object} The focus after render modifier configuration object
   */

  function generateFocusAfterRenderModifier(step) {
    return {
      name: 'focusAfterRender',
      enabled: true,
      phase: 'afterWrite',
      fn: function fn() {
        setTimeout(function () {
          if (step.el) {
            var focusOptions = {
              preventScroll: true
            };
            step.el.focus(focusOptions);
          }
        }, 300);
      }
    };
  }
  /**
   * Generates the array of options for a tooltip that doesn't have a
   * target element in the DOM -- and thus is positioned in the center
   * of the view
   *
   * @param {Step} step The step instance
   * @return {Object} The final Popper options object
   */

  function makeCenteredPopper(step) {
    var centeredStylePopperModifier = _getCenteredStylePopperModifier();
    var popperOptions = {
      placement: 'top',
      strategy: 'fixed',
      modifiers: [generateFocusAfterRenderModifier(step)]
    };
    popperOptions = _extends({}, popperOptions, {
      modifiers: Array.from(new Set([].concat(_toConsumableArray(popperOptions.modifiers), _toConsumableArray(centeredStylePopperModifier))))
    });
    return popperOptions;
  }

  /**
   * Ensure class prefix ends in `-`
   * @param {string} prefix The prefix to prepend to the class names generated by nano-css
   * @return {string} The prefix ending in `-`
   */

  function normalizePrefix(prefix) {
    if (!isString(prefix) || prefix === '') {
      return '';
    }
    return prefix.charAt(prefix.length - 1) !== '-' ? "".concat(prefix, "-") : prefix;
  }
  /**
   * Resolves attachTo options, converting element option value to a qualified HTMLElement.
   * @param {Step} step The step instance
   * @returns {{}|{element, on}}
   * `element` is a qualified HTML Element
   * `on` is a string position value
   */

  function parseAttachTo(step) {
    var options = step.options.attachTo || {};
    var returnOpts = Object.assign({}, options);
    if (isFunction(returnOpts.element)) {
      // Bind the callback to step so that it has access to the object, to enable running additional logic
      returnOpts.element = returnOpts.element.call(step);
    }
    if (isString(returnOpts.element)) {
      // Can't override the element in user opts reference because we can't
      // guarantee that the element will exist in the future.
      try {
        returnOpts.element = document.querySelector(returnOpts.element);
      } catch (e) {// TODO
      }
      if (!returnOpts.element) {
        console.error("The element for this Shepherd step was not found ".concat(options.element));
      }
    }
    return returnOpts;
  }
  /**
   * Checks if the step should be centered or not. Does not trigger attachTo.element evaluation, making it a pure
   * alternative for the deprecated step.isCentered() method.
   * @param resolvedAttachToOptions
   * @returns {boolean}
   */

  function shouldCenterStep(resolvedAttachToOptions) {
    if (resolvedAttachToOptions === undefined || resolvedAttachToOptions === null) {
      return true;
    }
    return !resolvedAttachToOptions.element || !resolvedAttachToOptions.on;
  }
  /**
   * Determines options for the tooltip and initializes
   * `step.tooltip` as a Popper instance.
   * @param {Step} step The step instance
   */

  function setupTooltip(step) {
    if (step.tooltip) {
      step.tooltip.destroy();
    }
    var attachToOptions = step._getResolvedAttachToOptions();
    var target = attachToOptions.element;
    var popperOptions = getPopperOptions(attachToOptions, step);
    if (shouldCenterStep(attachToOptions)) {
      target = document.body;
      var content = step.shepherdElementComponent.getElement();
      content.classList.add('shepherd-centered');
    }
    step.tooltip = createPopper(target, step.el, popperOptions);
    step.target = attachToOptions.element;
    return popperOptions;
  }
  /**
   * Create a unique id for steps, tours, modals, etc
   * @return {string}
   */

  function uuid() {
    var d = Date.now();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
  }
  /**
   * Gets the `Popper` options from a set of base `attachTo` options
   * @param attachToOptions
   * @param {Step} step The step instance
   * @return {Object}
   * @private
   */

  function getPopperOptions(attachToOptions, step) {
    var popperOptions = {
      modifiers: [{
        name: 'preventOverflow',
        options: {
          altAxis: true,
          tether: false
        }
      }, generateFocusAfterRenderModifier(step)],
      strategy: 'absolute'
    };
    if (shouldCenterStep(attachToOptions)) {
      popperOptions = makeCenteredPopper(step);
    } else {
      popperOptions.placement = attachToOptions.on;
    }
    var defaultStepOptions = step.tour && step.tour.options && step.tour.options.defaultStepOptions;
    if (defaultStepOptions) {
      popperOptions = _mergeModifiers(defaultStepOptions, popperOptions);
    }
    popperOptions = _mergeModifiers(step.options, popperOptions);
    return popperOptions;
  }
  function _mergeModifiers(stepOptions, popperOptions) {
    if (stepOptions.popperOptions) {
      var mergedPopperOptions = Object.assign({}, popperOptions, stepOptions.popperOptions);
      if (stepOptions.popperOptions.modifiers && stepOptions.popperOptions.modifiers.length > 0) {
        var names = stepOptions.popperOptions.modifiers.map(function (mod) {
          return mod.name;
        });
        var filteredModifiers = popperOptions.modifiers.filter(function (mod) {
          return !names.includes(mod.name);
        });
        mergedPopperOptions.modifiers = Array.from(new Set([].concat(_toConsumableArray(filteredModifiers), _toConsumableArray(stepOptions.popperOptions.modifiers))));
      }
      return mergedPopperOptions;
    }
    return popperOptions;
  }
  function noop() {}
  function assign(tar, src) {
    // @ts-ignore
    for (var k in src) tar[k] = src[k];
    return tar;
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === 'function';
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a && _typeof(a) === 'object' || typeof a === 'function';
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function append(target, node) {
    target.appendChild(node);
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    node.parentNode.removeChild(node);
  }
  function destroy_each(iterations, detaching) {
    for (var i = 0; i < iterations.length; i += 1) {
      if (iterations[i]) iterations[i].d(detaching);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(' ');
  }
  function empty() {
    return text('');
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return function () {
      return node.removeEventListener(event, handler, options);
    };
  }
  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }
  function set_attributes(node, attributes) {
    // @ts-ignore
    var descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (var key in attributes) {
      if (attributes[key] == null) {
        node.removeAttribute(key);
      } else if (key === 'style') {
        node.style.cssText = attributes[key];
      } else if (key === '__value') {
        node.value = node[key] = attributes[key];
      } else if (descriptors[key] && descriptors[key].set) {
        node[key] = attributes[key];
      } else {
        attr(node, key, attributes[key]);
      }
    }
  }
  function children(element) {
    return Array.from(element.childNodes);
  }
  function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
  }
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component) throw new Error('Function called outside component initialization');
    return current_component;
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  // 1. All beforeUpdate callbacks, in order: parents before children
  // 2. All bind:this callbacks, in reverse order: children before parents.
  // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
  //    for afterUpdates called during the initial onMount, which are called in
  //    reverse order: children before parents.
  // Since callbacks might update component values, which could trigger another
  // call to flush(), the following steps guard against this:
  // 1. During beforeUpdate, any updated components will be added to the
  //    dirty_components array and will cause a reentrant call to flush(). Because
  //    the flush index is kept outside the function, the reentrant call will pick
  //    up where the earlier call left off and go through all dirty components. The
  //    current_component value is saved and restored so that the reentrant call will
  //    not interfere with the "parent" flush() call.
  // 2. bind:this callbacks cannot trigger new flush() calls.
  // 3. During afterUpdate, any updated components will NOT have their afterUpdate
  //    callback called a second time; the seen_callbacks set, outside the flush()
  //    function, guarantees this behavior.

  var seen_callbacks = new Set();
  var flushidx = 0; // Do *not* move this inside the flush() function

  function flush() {
    var saved_component = current_component;
    do {
      // first, call beforeUpdate functions
      // and update components
      while (flushidx < dirty_components.length) {
        var component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length) binding_callbacks.pop()(); // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...

      for (var i = 0; i < render_callbacks.length; i += 1) {
        var callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          // ...so guard against infinite loops
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      var dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  var outroing = new Set();
  var outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros // parent group
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(function () {
        outroing.delete(block);
        if (callback) {
          if (detach) block.d(1);
          callback();
        }
      });
      block.o(local);
    } else if (callback) {
      callback();
    }
  }
  function get_spread_update(levels, updates) {
    var update = {};
    var to_null_out = {};
    var accounted_for = {
      $$scope: 1
    };
    var i = levels.length;
    while (i--) {
      var o = levels[i];
      var n = updates[i];
      if (n) {
        for (var key in o) {
          if (!(key in n)) to_null_out[key] = 1;
        }
        for (var _key2 in n) {
          if (!accounted_for[_key2]) {
            update[_key2] = n[_key2];
            accounted_for[_key2] = 1;
          }
        }
        levels[i] = n;
      } else {
        for (var _key3 in o) {
          accounted_for[_key3] = 1;
        }
      }
    }
    for (var _key4 in to_null_out) {
      if (!(_key4 in update)) update[_key4] = undefined;
    }
    return update;
  }
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
    var _component$$$ = component.$$,
      fragment = _component$$$.fragment,
      on_mount = _component$$$.on_mount,
      on_destroy = _component$$$.on_destroy,
      after_update = _component$$$.after_update;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      // onMount happens before the initial afterUpdate
      add_render_callback(function () {
        var new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
          on_destroy.push.apply(on_destroy, _toConsumableArray(new_on_destroy));
        } else {
          // Edge case - component was destroyed immediately,
          // most likely as a result of a binding initialising
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    var $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
      // preserve final state?)

      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty) {
    if (dirty === void 0) {
      dirty = [-1];
    }
    var parent_component = current_component;
    set_current_component(component);
    var $$ = component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props: props,
      update: noop,
      not_equal: not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      // everything else
      callbacks: blank_object(),
      dirty: dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    var ready = false;
    $$.ctx = instance ? instance(component, options.props || {}, function (i, ret) {
      var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update); // `false` as a special case of no DOM component

    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        var nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }
      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      flush();
    }
    set_current_component(parent_component);
  }
  /**
   * Base class for Svelte components. Used when dev=false.
   */
  var SvelteComponent = /*#__PURE__*/function () {
    function SvelteComponent() {
      _classCallCheck(this, SvelteComponent);
    }
    _createClass(SvelteComponent, [{
      key: "$destroy",
      value: function $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
    }, {
      key: "$on",
      value: function $on(type, callback) {
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }
    }, {
      key: "$set",
      value: function $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    }]);
    return SvelteComponent;
  }();
  /* src/js/components/shepherd-button.svelte generated by Svelte v3.49.0 */
  function create_fragment$8(ctx) {
    var button;
    var button_aria_label_value;
    var button_class_value;
    var mounted;
    var dispose;
    return {
      c: function c() {
        button = element("button");
        attr(button, "aria-label", button_aria_label_value = /*label*/
        ctx[3] ? /*label*/
        ctx[3] : null);
        attr(button, "class", button_class_value = "".concat( /*classes*/
        ctx[1] || '', " shepherd-button ").concat( /*secondary*/
        ctx[4] ? 'shepherd-button-secondary' : ''));
        button.disabled = /*disabled*/
        ctx[2];
        attr(button, "tabindex", "0");
      },
      m: function m(target, anchor) {
        insert(target, button, anchor);
        button.innerHTML = /*text*/
        ctx[5];
        if (!mounted) {
          dispose = listen(button, "click", function () {
            if (is_function( /*action*/
            ctx[0])) /*action*/
              ctx[0].apply(this, arguments);
          });
          mounted = true;
        }
      },
      p: function p(new_ctx, _ref) {
        var _ref7 = _slicedToArray(_ref, 1),
          dirty = _ref7[0];
        ctx = new_ctx;
        if (dirty & /*text*/
        32) button.innerHTML = /*text*/
        ctx[5];
        if (dirty & /*label*/
        8 && button_aria_label_value !== (button_aria_label_value = /*label*/
        ctx[3] ? /*label*/
        ctx[3] : null)) {
          attr(button, "aria-label", button_aria_label_value);
        }
        if (dirty & /*classes, secondary*/
        18 && button_class_value !== (button_class_value = "".concat( /*classes*/
        ctx[1] || '', " shepherd-button ").concat( /*secondary*/
        ctx[4] ? 'shepherd-button-secondary' : ''))) {
          attr(button, "class", button_class_value);
        }
        if (dirty & /*disabled*/
        4) {
          button.disabled = /*disabled*/
          ctx[2];
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(button);
        mounted = false;
        dispose();
      }
    };
  }
  function instance$8($$self, $$props, $$invalidate) {
    var config = $$props.config,
      step = $$props.step;
    var action, classes, disabled, label, secondary, text;
    function getConfigOption(option) {
      if (isFunction(option)) {
        return option = option.call(step);
      }
      return option;
    }
    $$self.$$set = function ($$props) {
      if ('config' in $$props) $$invalidate(6, config = $$props.config);
      if ('step' in $$props) $$invalidate(7, step = $$props.step);
    };
    $$self.$$.update = function () {
      if ($$self.$$.dirty & /*config, step*/
      192) {
        {
          $$invalidate(0, action = config.action ? config.action.bind(step.tour) : null);
          $$invalidate(1, classes = config.classes);
          $$invalidate(2, disabled = config.disabled ? getConfigOption(config.disabled) : false);
          $$invalidate(3, label = config.label ? getConfigOption(config.label) : null);
          $$invalidate(4, secondary = config.secondary);
          $$invalidate(5, text = config.text ? getConfigOption(config.text) : null);
        }
      }
    };
    return [action, classes, disabled, label, secondary, text, config, step];
  }
  var Shepherd_button = /*#__PURE__*/function (_SvelteComponent) {
    _inherits(Shepherd_button, _SvelteComponent);
    function Shepherd_button(options) {
      var _this3;
      _classCallCheck(this, Shepherd_button);
      _this3 = _callSuper(this, Shepherd_button);
      init(_assertThisInitialized(_this3), options, instance$8, create_fragment$8, safe_not_equal, {
        config: 6,
        step: 7
      });
      return _this3;
    }
    return _createClass(Shepherd_button);
  }(SvelteComponent);
  /* src/js/components/shepherd-footer.svelte generated by Svelte v3.49.0 */
  function get_each_context(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[2] = list[i];
    return child_ctx;
  } // (24:4) {#if buttons}

  function create_if_block$3(ctx) {
    var each_1_anchor;
    var current;
    var each_value = /*buttons*/
    ctx[1];
    var each_blocks = [];
    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }
    var out = function out(i) {
      return transition_out(each_blocks[i], 1, 1, function () {
        each_blocks[i] = null;
      });
    };
    return {
      c: function c() {
        for (var _i2 = 0; _i2 < each_blocks.length; _i2 += 1) {
          each_blocks[_i2].c();
        }
        each_1_anchor = empty();
      },
      m: function m(target, anchor) {
        for (var _i3 = 0; _i3 < each_blocks.length; _i3 += 1) {
          each_blocks[_i3].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        if (dirty & /*buttons, step*/
        3) {
          each_value = /*buttons*/
          ctx[1];
          var _i4;
          for (_i4 = 0; _i4 < each_value.length; _i4 += 1) {
            var child_ctx = get_each_context(ctx, each_value, _i4);
            if (each_blocks[_i4]) {
              each_blocks[_i4].p(child_ctx, dirty);
              transition_in(each_blocks[_i4], 1);
            } else {
              each_blocks[_i4] = create_each_block(child_ctx);
              each_blocks[_i4].c();
              transition_in(each_blocks[_i4], 1);
              each_blocks[_i4].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (_i4 = each_value.length; _i4 < each_blocks.length; _i4 += 1) {
            out(_i4);
          }
          check_outros();
        }
      },
      i: function i(local) {
        if (current) return;
        for (var _i5 = 0; _i5 < each_value.length; _i5 += 1) {
          transition_in(each_blocks[_i5]);
        }
        current = true;
      },
      o: function o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (var _i6 = 0; _i6 < each_blocks.length; _i6 += 1) {
          transition_out(each_blocks[_i6]);
        }
        current = false;
      },
      d: function d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching) detach(each_1_anchor);
      }
    };
  } // (25:8) {#each buttons as config}

  function create_each_block(ctx) {
    var shepherdbutton;
    var current;
    shepherdbutton = new Shepherd_button({
      props: {
        config: /*config*/
        ctx[2],
        step: /*step*/
        ctx[0]
      }
    });
    return {
      c: function c() {
        create_component(shepherdbutton.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(shepherdbutton, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var shepherdbutton_changes = {};
        if (dirty & /*buttons*/
        2) shepherdbutton_changes.config = /*config*/
        ctx[2];
        if (dirty & /*step*/
        1) shepherdbutton_changes.step = /*step*/
        ctx[0];
        shepherdbutton.$set(shepherdbutton_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(shepherdbutton.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(shepherdbutton.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(shepherdbutton, detaching);
      }
    };
  }
  function create_fragment$7(ctx) {
    var footer;
    var current;
    var if_block = /*buttons*/
    ctx[1] && create_if_block$3(ctx);
    return {
      c: function c() {
        footer = element("footer");
        if (if_block) if_block.c();
        attr(footer, "class", "shepherd-footer");
      },
      m: function m(target, anchor) {
        insert(target, footer, anchor);
        if (if_block) if_block.m(footer, null);
        current = true;
      },
      p: function p(ctx, _ref) {
        var _ref8 = _slicedToArray(_ref, 1),
          dirty = _ref8[0];
        if ( /*buttons*/
        ctx[1]) {
          if (if_block) {
            if_block.p(ctx, dirty);
            if (dirty & /*buttons*/
            2) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$3(ctx);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(footer, null);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, function () {
            if_block = null;
          });
          check_outros();
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(if_block);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(footer);
        if (if_block) if_block.d();
      }
    };
  }
  function instance$7($$self, $$props, $$invalidate) {
    var buttons;
    var step = $$props.step;
    $$self.$$set = function ($$props) {
      if ('step' in $$props) $$invalidate(0, step = $$props.step);
    };
    $$self.$$.update = function () {
      if ($$self.$$.dirty & /*step*/
      1) {
        $$invalidate(1, buttons = step.options.buttons);
      }
    };
    return [step, buttons];
  }
  var Shepherd_footer = /*#__PURE__*/function (_SvelteComponent2) {
    _inherits(Shepherd_footer, _SvelteComponent2);
    function Shepherd_footer(options) {
      var _this4;
      _classCallCheck(this, Shepherd_footer);
      _this4 = _callSuper(this, Shepherd_footer);
      init(_assertThisInitialized(_this4), options, instance$7, create_fragment$7, safe_not_equal, {
        step: 0
      });
      return _this4;
    }
    return _createClass(Shepherd_footer);
  }(SvelteComponent);
  /* src/js/components/shepherd-cancel-icon.svelte generated by Svelte v3.49.0 */
  function create_fragment$6(ctx) {
    var button;
    var span;
    var button_aria_label_value;
    var mounted;
    var dispose;
    return {
      c: function c() {
        button = element("button");
        span = element("span");
        span.textContent = "×";
        attr(span, "aria-hidden", "true");
        attr(button, "aria-label", button_aria_label_value = /*cancelIcon*/
        ctx[0].label ? /*cancelIcon*/
        ctx[0].label : 'Close Tour');
        attr(button, "class", "shepherd-cancel-icon");
        attr(button, "type", "button");
      },
      m: function m(target, anchor) {
        insert(target, button, anchor);
        append(button, span);
        if (!mounted) {
          dispose = listen(button, "click", /*handleCancelClick*/
          ctx[1]);
          mounted = true;
        }
      },
      p: function p(ctx, _ref) {
        var _ref9 = _slicedToArray(_ref, 1),
          dirty = _ref9[0];
        if (dirty & /*cancelIcon*/
        1 && button_aria_label_value !== (button_aria_label_value = /*cancelIcon*/
        ctx[0].label ? /*cancelIcon*/
        ctx[0].label : 'Close Tour')) {
          attr(button, "aria-label", button_aria_label_value);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(button);
        mounted = false;
        dispose();
      }
    };
  }
  function instance$6($$self, $$props, $$invalidate) {
    var cancelIcon = $$props.cancelIcon,
      step = $$props.step;
    /**
    * Add a click listener to the cancel link that cancels the tour
    */

    var handleCancelClick = function handleCancelClick(e) {
      e.preventDefault();
      step.cancel();
    };
    $$self.$$set = function ($$props) {
      if ('cancelIcon' in $$props) $$invalidate(0, cancelIcon = $$props.cancelIcon);
      if ('step' in $$props) $$invalidate(2, step = $$props.step);
    };
    return [cancelIcon, handleCancelClick, step];
  }
  var Shepherd_cancel_icon = /*#__PURE__*/function (_SvelteComponent3) {
    _inherits(Shepherd_cancel_icon, _SvelteComponent3);
    function Shepherd_cancel_icon(options) {
      var _this5;
      _classCallCheck(this, Shepherd_cancel_icon);
      _this5 = _callSuper(this, Shepherd_cancel_icon);
      init(_assertThisInitialized(_this5), options, instance$6, create_fragment$6, safe_not_equal, {
        cancelIcon: 0,
        step: 2
      });
      return _this5;
    }
    return _createClass(Shepherd_cancel_icon);
  }(SvelteComponent);
  /* src/js/components/shepherd-title.svelte generated by Svelte v3.49.0 */
  function create_fragment$5(ctx) {
    var h3;
    return {
      c: function c() {
        h3 = element("h3");
        attr(h3, "id", /*labelId*/
        ctx[1]);
        attr(h3, "class", "shepherd-title");
      },
      m: function m(target, anchor) {
        insert(target, h3, anchor);
        /*h3_binding*/

        ctx[3](h3);
      },
      p: function p(ctx, _ref) {
        var _ref10 = _slicedToArray(_ref, 1),
          dirty = _ref10[0];
        if (dirty & /*labelId*/
        2) {
          attr(h3, "id", /*labelId*/
          ctx[1]);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(h3);
        /*h3_binding*/

        ctx[3](null);
      }
    };
  }
  function instance$5($$self, $$props, $$invalidate) {
    var labelId = $$props.labelId,
      element = $$props.element,
      title = $$props.title;
    afterUpdate(function () {
      if (isFunction(title)) {
        $$invalidate(2, title = title());
      }
      $$invalidate(0, element.innerHTML = title, element);
    });
    function h3_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        element = $$value;
        $$invalidate(0, element);
      });
    }
    $$self.$$set = function ($$props) {
      if ('labelId' in $$props) $$invalidate(1, labelId = $$props.labelId);
      if ('element' in $$props) $$invalidate(0, element = $$props.element);
      if ('title' in $$props) $$invalidate(2, title = $$props.title);
    };
    return [element, labelId, title, h3_binding];
  }
  var Shepherd_title = /*#__PURE__*/function (_SvelteComponent4) {
    _inherits(Shepherd_title, _SvelteComponent4);
    function Shepherd_title(options) {
      var _this6;
      _classCallCheck(this, Shepherd_title);
      _this6 = _callSuper(this, Shepherd_title);
      init(_assertThisInitialized(_this6), options, instance$5, create_fragment$5, safe_not_equal, {
        labelId: 1,
        element: 0,
        title: 2
      });
      return _this6;
    }
    return _createClass(Shepherd_title);
  }(SvelteComponent);
  /* src/js/components/shepherd-header.svelte generated by Svelte v3.49.0 */
  function create_if_block_1$1(ctx) {
    var shepherdtitle;
    var current;
    shepherdtitle = new Shepherd_title({
      props: {
        labelId: /*labelId*/
        ctx[0],
        title: /*title*/
        ctx[2]
      }
    });
    return {
      c: function c() {
        create_component(shepherdtitle.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(shepherdtitle, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var shepherdtitle_changes = {};
        if (dirty & /*labelId*/
        1) shepherdtitle_changes.labelId = /*labelId*/
        ctx[0];
        if (dirty & /*title*/
        4) shepherdtitle_changes.title = /*title*/
        ctx[2];
        shepherdtitle.$set(shepherdtitle_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(shepherdtitle.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(shepherdtitle.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(shepherdtitle, detaching);
      }
    };
  } // (39:4) {#if cancelIcon && cancelIcon.enabled}

  function create_if_block$2(ctx) {
    var shepherdcancelicon;
    var current;
    shepherdcancelicon = new Shepherd_cancel_icon({
      props: {
        cancelIcon: /*cancelIcon*/
        ctx[3],
        step: /*step*/
        ctx[1]
      }
    });
    return {
      c: function c() {
        create_component(shepherdcancelicon.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(shepherdcancelicon, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var shepherdcancelicon_changes = {};
        if (dirty & /*cancelIcon*/
        8) shepherdcancelicon_changes.cancelIcon = /*cancelIcon*/
        ctx[3];
        if (dirty & /*step*/
        2) shepherdcancelicon_changes.step = /*step*/
        ctx[1];
        shepherdcancelicon.$set(shepherdcancelicon_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(shepherdcancelicon.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(shepherdcancelicon.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(shepherdcancelicon, detaching);
      }
    };
  }
  function create_fragment$4(ctx) {
    var header;
    var t;
    var current;
    var if_block0 = /*title*/
    ctx[2] && create_if_block_1$1(ctx);
    var if_block1 = /*cancelIcon*/
    ctx[3] && /*cancelIcon*/
    ctx[3].enabled && create_if_block$2(ctx);
    return {
      c: function c() {
        header = element("header");
        if (if_block0) if_block0.c();
        t = space();
        if (if_block1) if_block1.c();
        attr(header, "class", "shepherd-header");
      },
      m: function m(target, anchor) {
        insert(target, header, anchor);
        if (if_block0) if_block0.m(header, null);
        append(header, t);
        if (if_block1) if_block1.m(header, null);
        current = true;
      },
      p: function p(ctx, _ref) {
        var _ref11 = _slicedToArray(_ref, 1),
          dirty = _ref11[0];
        if ( /*title*/
        ctx[2]) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
            if (dirty & /*title*/
            4) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_1$1(ctx);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(header, t);
          }
        } else if (if_block0) {
          group_outros();
          transition_out(if_block0, 1, 1, function () {
            if_block0 = null;
          });
          check_outros();
        }
        if ( /*cancelIcon*/
        ctx[3] && /*cancelIcon*/
        ctx[3].enabled) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
            if (dirty & /*cancelIcon*/
            8) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block$2(ctx);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(header, null);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, function () {
            if_block1 = null;
          });
          check_outros();
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(if_block0);
        transition_in(if_block1);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block0);
        transition_out(if_block1);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(header);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
      }
    };
  }
  function instance$4($$self, $$props, $$invalidate) {
    var labelId = $$props.labelId,
      step = $$props.step;
    var title, cancelIcon;
    $$self.$$set = function ($$props) {
      if ('labelId' in $$props) $$invalidate(0, labelId = $$props.labelId);
      if ('step' in $$props) $$invalidate(1, step = $$props.step);
    };
    $$self.$$.update = function () {
      if ($$self.$$.dirty & /*step*/
      2) {
        {
          $$invalidate(2, title = step.options.title);
          $$invalidate(3, cancelIcon = step.options.cancelIcon);
        }
      }
    };
    return [labelId, step, title, cancelIcon];
  }
  var Shepherd_header = /*#__PURE__*/function (_SvelteComponent5) {
    _inherits(Shepherd_header, _SvelteComponent5);
    function Shepherd_header(options) {
      var _this7;
      _classCallCheck(this, Shepherd_header);
      _this7 = _callSuper(this, Shepherd_header);
      init(_assertThisInitialized(_this7), options, instance$4, create_fragment$4, safe_not_equal, {
        labelId: 0,
        step: 1
      });
      return _this7;
    }
    return _createClass(Shepherd_header);
  }(SvelteComponent);
  /* src/js/components/shepherd-text.svelte generated by Svelte v3.49.0 */
  function create_fragment$3(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        attr(div, "class", "shepherd-text");
        attr(div, "id", /*descriptionId*/
        ctx[1]);
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        /*div_binding*/

        ctx[3](div);
      },
      p: function p(ctx, _ref) {
        var _ref12 = _slicedToArray(_ref, 1),
          dirty = _ref12[0];
        if (dirty & /*descriptionId*/
        2) {
          attr(div, "id", /*descriptionId*/
          ctx[1]);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        /*div_binding*/

        ctx[3](null);
      }
    };
  }
  function instance$3($$self, $$props, $$invalidate) {
    var descriptionId = $$props.descriptionId,
      element = $$props.element,
      step = $$props.step;
    afterUpdate(function () {
      var text = step.options.text;
      if (isFunction(text)) {
        text = text.call(step);
      }
      if (isHTMLElement$1(text)) {
        element.appendChild(text);
      } else {
        $$invalidate(0, element.innerHTML = text, element);
      }
    });
    function div_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        element = $$value;
        $$invalidate(0, element);
      });
    }
    $$self.$$set = function ($$props) {
      if ('descriptionId' in $$props) $$invalidate(1, descriptionId = $$props.descriptionId);
      if ('element' in $$props) $$invalidate(0, element = $$props.element);
      if ('step' in $$props) $$invalidate(2, step = $$props.step);
    };
    return [element, descriptionId, step, div_binding];
  }
  var Shepherd_text = /*#__PURE__*/function (_SvelteComponent6) {
    _inherits(Shepherd_text, _SvelteComponent6);
    function Shepherd_text(options) {
      var _this8;
      _classCallCheck(this, Shepherd_text);
      _this8 = _callSuper(this, Shepherd_text);
      init(_assertThisInitialized(_this8), options, instance$3, create_fragment$3, safe_not_equal, {
        descriptionId: 1,
        element: 0,
        step: 2
      });
      return _this8;
    }
    return _createClass(Shepherd_text);
  }(SvelteComponent);
  /* src/js/components/shepherd-content.svelte generated by Svelte v3.49.0 */
  function create_if_block_2(ctx) {
    var shepherdheader;
    var current;
    shepherdheader = new Shepherd_header({
      props: {
        labelId: /*labelId*/
        ctx[1],
        step: /*step*/
        ctx[2]
      }
    });
    return {
      c: function c() {
        create_component(shepherdheader.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(shepherdheader, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var shepherdheader_changes = {};
        if (dirty & /*labelId*/
        2) shepherdheader_changes.labelId = /*labelId*/
        ctx[1];
        if (dirty & /*step*/
        4) shepherdheader_changes.step = /*step*/
        ctx[2];
        shepherdheader.$set(shepherdheader_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(shepherdheader.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(shepherdheader.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(shepherdheader, detaching);
      }
    };
  } // (28:2) {#if !isUndefined(step.options.text)}

  function create_if_block_1(ctx) {
    var shepherdtext;
    var current;
    shepherdtext = new Shepherd_text({
      props: {
        descriptionId: /*descriptionId*/
        ctx[0],
        step: /*step*/
        ctx[2]
      }
    });
    return {
      c: function c() {
        create_component(shepherdtext.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(shepherdtext, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var shepherdtext_changes = {};
        if (dirty & /*descriptionId*/
        1) shepherdtext_changes.descriptionId = /*descriptionId*/
        ctx[0];
        if (dirty & /*step*/
        4) shepherdtext_changes.step = /*step*/
        ctx[2];
        shepherdtext.$set(shepherdtext_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(shepherdtext.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(shepherdtext.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(shepherdtext, detaching);
      }
    };
  } // (35:2) {#if Array.isArray(step.options.buttons) && step.options.buttons.length}

  function create_if_block$1(ctx) {
    var shepherdfooter;
    var current;
    shepherdfooter = new Shepherd_footer({
      props: {
        step: /*step*/
        ctx[2]
      }
    });
    return {
      c: function c() {
        create_component(shepherdfooter.$$.fragment);
      },
      m: function m(target, anchor) {
        mount_component(shepherdfooter, target, anchor);
        current = true;
      },
      p: function p(ctx, dirty) {
        var shepherdfooter_changes = {};
        if (dirty & /*step*/
        4) shepherdfooter_changes.step = /*step*/
        ctx[2];
        shepherdfooter.$set(shepherdfooter_changes);
      },
      i: function i(local) {
        if (current) return;
        transition_in(shepherdfooter.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(shepherdfooter.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        destroy_component(shepherdfooter, detaching);
      }
    };
  }
  function create_fragment$2(ctx) {
    var div;
    var show_if_2 = !isUndefined( /*step*/
    ctx[2].options.title) || /*step*/
    ctx[2].options.cancelIcon && /*step*/
    ctx[2].options.cancelIcon.enabled;
    var t0;
    var show_if_1 = !isUndefined( /*step*/
    ctx[2].options.text);
    var t1;
    var show_if = Array.isArray( /*step*/
    ctx[2].options.buttons) && /*step*/
    ctx[2].options.buttons.length;
    var current;
    var if_block0 = show_if_2 && create_if_block_2(ctx);
    var if_block1 = show_if_1 && create_if_block_1(ctx);
    var if_block2 = show_if && create_if_block$1(ctx);
    return {
      c: function c() {
        div = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        if (if_block1) if_block1.c();
        t1 = space();
        if (if_block2) if_block2.c();
        attr(div, "class", "shepherd-content");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if (if_block0) if_block0.m(div, null);
        append(div, t0);
        if (if_block1) if_block1.m(div, null);
        append(div, t1);
        if (if_block2) if_block2.m(div, null);
        current = true;
      },
      p: function p(ctx, _ref) {
        var _ref13 = _slicedToArray(_ref, 1),
          dirty = _ref13[0];
        if (dirty & /*step*/
        4) show_if_2 = !isUndefined( /*step*/
        ctx[2].options.title) || /*step*/
        ctx[2].options.cancelIcon && /*step*/
        ctx[2].options.cancelIcon.enabled;
        if (show_if_2) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
            if (dirty & /*step*/
            4) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_2(ctx);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(div, t0);
          }
        } else if (if_block0) {
          group_outros();
          transition_out(if_block0, 1, 1, function () {
            if_block0 = null;
          });
          check_outros();
        }
        if (dirty & /*step*/
        4) show_if_1 = !isUndefined( /*step*/
        ctx[2].options.text);
        if (show_if_1) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
            if (dirty & /*step*/
            4) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_1(ctx);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(div, t1);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, function () {
            if_block1 = null;
          });
          check_outros();
        }
        if (dirty & /*step*/
        4) show_if = Array.isArray( /*step*/
        ctx[2].options.buttons) && /*step*/
        ctx[2].options.buttons.length;
        if (show_if) {
          if (if_block2) {
            if_block2.p(ctx, dirty);
            if (dirty & /*step*/
            4) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block$1(ctx);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(div, null);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, function () {
            if_block2 = null;
          });
          check_outros();
        }
      },
      i: function i(local) {
        if (current) return;
        transition_in(if_block0);
        transition_in(if_block1);
        transition_in(if_block2);
        current = true;
      },
      o: function o(local) {
        transition_out(if_block0);
        transition_out(if_block1);
        transition_out(if_block2);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
      }
    };
  }
  function instance$2($$self, $$props, $$invalidate) {
    var descriptionId = $$props.descriptionId,
      labelId = $$props.labelId,
      step = $$props.step;
    $$self.$$set = function ($$props) {
      if ('descriptionId' in $$props) $$invalidate(0, descriptionId = $$props.descriptionId);
      if ('labelId' in $$props) $$invalidate(1, labelId = $$props.labelId);
      if ('step' in $$props) $$invalidate(2, step = $$props.step);
    };
    return [descriptionId, labelId, step];
  }
  var Shepherd_content = /*#__PURE__*/function (_SvelteComponent7) {
    _inherits(Shepherd_content, _SvelteComponent7);
    function Shepherd_content(options) {
      var _this9;
      _classCallCheck(this, Shepherd_content);
      _this9 = _callSuper(this, Shepherd_content);
      init(_assertThisInitialized(_this9), options, instance$2, create_fragment$2, safe_not_equal, {
        descriptionId: 0,
        labelId: 1,
        step: 2
      });
      return _this9;
    }
    return _createClass(Shepherd_content);
  }(SvelteComponent);
  /* src/js/components/shepherd-element.svelte generated by Svelte v3.49.0 */
  function create_if_block(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        attr(div, "class", "shepherd-arrow");
        attr(div, "data-popper-arrow", "");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  }
  function create_fragment$1(ctx) {
    var div;
    var t;
    var shepherdcontent;
    var div_aria_describedby_value;
    var div_aria_labelledby_value;
    var current;
    var mounted;
    var dispose;
    var if_block = /*step*/
    ctx[4].options.arrow && /*step*/
    ctx[4].options.attachTo && /*step*/
    ctx[4].options.attachTo.element && /*step*/
    ctx[4].options.attachTo.on && create_if_block();
    shepherdcontent = new Shepherd_content({
      props: {
        descriptionId: /*descriptionId*/
        ctx[2],
        labelId: /*labelId*/
        ctx[3],
        step: /*step*/
        ctx[4]
      }
    });
    var div_levels = [{
      "aria-describedby": div_aria_describedby_value = !isUndefined( /*step*/
      ctx[4].options.text) ? /*descriptionId*/
      ctx[2] : null
    }, {
      "aria-labelledby": div_aria_labelledby_value = /*step*/
      ctx[4].options.title ? /*labelId*/
      ctx[3] : null
    }, /*dataStepId*/
    ctx[1], {
      role: "dialog"
    }, {
      tabindex: "0"
    }];
    var div_data = {};
    for (var i = 0; i < div_levels.length; i += 1) {
      div_data = assign(div_data, div_levels[i]);
    }
    return {
      c: function c() {
        div = element("div");
        if (if_block) if_block.c();
        t = space();
        create_component(shepherdcontent.$$.fragment);
        set_attributes(div, div_data);
        toggle_class(div, "shepherd-has-cancel-icon", /*hasCancelIcon*/
        ctx[5]);
        toggle_class(div, "shepherd-has-title", /*hasTitle*/
        ctx[6]);
        toggle_class(div, "shepherd-element", true);
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if (if_block) if_block.m(div, null);
        append(div, t);
        mount_component(shepherdcontent, div, null);
        /*div_binding*/

        ctx[13](div);
        current = true;
        if (!mounted) {
          dispose = listen(div, "keydown", /*handleKeyDown*/
          ctx[7]);
          mounted = true;
        }
      },
      p: function p(ctx, _ref) {
        var _ref14 = _slicedToArray(_ref, 1),
          dirty = _ref14[0];
        if ( /*step*/
        ctx[4].options.arrow && /*step*/
        ctx[4].options.attachTo && /*step*/
        ctx[4].options.attachTo.element && /*step*/
        ctx[4].options.attachTo.on) {
          if (if_block) ;else {
            if_block = create_if_block();
            if_block.c();
            if_block.m(div, t);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        var shepherdcontent_changes = {};
        if (dirty & /*descriptionId*/
        4) shepherdcontent_changes.descriptionId = /*descriptionId*/
        ctx[2];
        if (dirty & /*labelId*/
        8) shepherdcontent_changes.labelId = /*labelId*/
        ctx[3];
        if (dirty & /*step*/
        16) shepherdcontent_changes.step = /*step*/
        ctx[4];
        shepherdcontent.$set(shepherdcontent_changes);
        set_attributes(div, div_data = get_spread_update(div_levels, [(!current || dirty & /*step, descriptionId*/
        20 && div_aria_describedby_value !== (div_aria_describedby_value = !isUndefined( /*step*/
        ctx[4].options.text) ? /*descriptionId*/
        ctx[2] : null)) && {
          "aria-describedby": div_aria_describedby_value
        }, (!current || dirty & /*step, labelId*/
        24 && div_aria_labelledby_value !== (div_aria_labelledby_value = /*step*/
        ctx[4].options.title ? /*labelId*/
        ctx[3] : null)) && {
          "aria-labelledby": div_aria_labelledby_value
        }, dirty & /*dataStepId*/
        2 && /*dataStepId*/
        ctx[1], {
          role: "dialog"
        }, {
          tabindex: "0"
        }]));
        toggle_class(div, "shepherd-has-cancel-icon", /*hasCancelIcon*/
        ctx[5]);
        toggle_class(div, "shepherd-has-title", /*hasTitle*/
        ctx[6]);
        toggle_class(div, "shepherd-element", true);
      },
      i: function i(local) {
        if (current) return;
        transition_in(shepherdcontent.$$.fragment, local);
        current = true;
      },
      o: function o(local) {
        transition_out(shepherdcontent.$$.fragment, local);
        current = false;
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        if (if_block) if_block.d();
        destroy_component(shepherdcontent);
        /*div_binding*/

        ctx[13](null);
        mounted = false;
        dispose();
      }
    };
  }
  var KEY_TAB = 9;
  var KEY_ESC = 27;
  var LEFT_ARROW = 37;
  var RIGHT_ARROW = 39;
  function getClassesArray(classes) {
    return classes.split(' ').filter(function (className) {
      return !!className.length;
    });
  }
  function instance$1($$self, $$props, $$invalidate) {
    var classPrefix = $$props.classPrefix,
      element = $$props.element,
      descriptionId = $$props.descriptionId,
      firstFocusableElement = $$props.firstFocusableElement,
      focusableElements = $$props.focusableElements,
      labelId = $$props.labelId,
      lastFocusableElement = $$props.lastFocusableElement,
      step = $$props.step,
      dataStepId = $$props.dataStepId;
    var hasCancelIcon, hasTitle, classes;
    var getElement = function getElement() {
      return element;
    };
    onMount(function () {
      // Get all elements that are focusable
      $$invalidate(1, dataStepId = _defineProperty({}, "data-".concat(classPrefix, "shepherd-step-id"), step.id));
      $$invalidate(9, focusableElements = element.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'));
      $$invalidate(8, firstFocusableElement = focusableElements[0]);
      $$invalidate(10, lastFocusableElement = focusableElements[focusableElements.length - 1]);
    });
    afterUpdate(function () {
      if (classes !== step.options.classes) {
        updateDynamicClasses();
      }
    });
    function updateDynamicClasses() {
      removeClasses(classes);
      classes = step.options.classes;
      addClasses(classes);
    }
    function removeClasses(classes) {
      if (isString(classes)) {
        var oldClasses = getClassesArray(classes);
        if (oldClasses.length) {
          var _element$classList;
          (_element$classList = element.classList).remove.apply(_element$classList, _toConsumableArray(oldClasses));
        }
      }
    }
    function addClasses(classes) {
      if (isString(classes)) {
        var newClasses = getClassesArray(classes);
        if (newClasses.length) {
          var _element$classList2;
          (_element$classList2 = element.classList).add.apply(_element$classList2, _toConsumableArray(newClasses));
        }
      }
    }
    /**
    * Setup keydown events to allow closing the modal with ESC
    *
    * Borrowed from this great post! https://bitsofco.de/accessible-modal-dialog/
    *
    * @private
    */

    var handleKeyDown = function handleKeyDown(e) {
      var _step = step,
        tour = _step.tour;
      switch (e.keyCode) {
        case KEY_TAB:
          if (focusableElements.length === 0) {
            e.preventDefault();
            break;
          } // Backward tab

          if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement || document.activeElement.classList.contains('shepherd-element')) {
              e.preventDefault();
              lastFocusableElement.focus();
            }
          } else {
            if (document.activeElement === lastFocusableElement) {
              e.preventDefault();
              firstFocusableElement.focus();
            }
          }
          break;
        case KEY_ESC:
          if (tour.options.exitOnEsc) {
            step.cancel();
          }
          break;
        case LEFT_ARROW:
          if (tour.options.keyboardNavigation) {
            tour.back();
          }
          break;
        case RIGHT_ARROW:
          if (tour.options.keyboardNavigation) {
            tour.next();
          }
          break;
      }
    };
    function div_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        element = $$value;
        $$invalidate(0, element);
      });
    }
    $$self.$$set = function ($$props) {
      if ('classPrefix' in $$props) $$invalidate(11, classPrefix = $$props.classPrefix);
      if ('element' in $$props) $$invalidate(0, element = $$props.element);
      if ('descriptionId' in $$props) $$invalidate(2, descriptionId = $$props.descriptionId);
      if ('firstFocusableElement' in $$props) $$invalidate(8, firstFocusableElement = $$props.firstFocusableElement);
      if ('focusableElements' in $$props) $$invalidate(9, focusableElements = $$props.focusableElements);
      if ('labelId' in $$props) $$invalidate(3, labelId = $$props.labelId);
      if ('lastFocusableElement' in $$props) $$invalidate(10, lastFocusableElement = $$props.lastFocusableElement);
      if ('step' in $$props) $$invalidate(4, step = $$props.step);
      if ('dataStepId' in $$props) $$invalidate(1, dataStepId = $$props.dataStepId);
    };
    $$self.$$.update = function () {
      if ($$self.$$.dirty & /*step*/
      16) {
        {
          $$invalidate(5, hasCancelIcon = step.options && step.options.cancelIcon && step.options.cancelIcon.enabled);
          $$invalidate(6, hasTitle = step.options && step.options.title);
        }
      }
    };
    return [element, dataStepId, descriptionId, labelId, step, hasCancelIcon, hasTitle, handleKeyDown, firstFocusableElement, focusableElements, lastFocusableElement, classPrefix, getElement, div_binding];
  }
  var Shepherd_element = /*#__PURE__*/function (_SvelteComponent8) {
    _inherits(Shepherd_element, _SvelteComponent8);
    function Shepherd_element(options) {
      var _this10;
      _classCallCheck(this, Shepherd_element);
      _this10 = _callSuper(this, Shepherd_element);
      init(_assertThisInitialized(_this10), options, instance$1, create_fragment$1, safe_not_equal, {
        classPrefix: 11,
        element: 0,
        descriptionId: 2,
        firstFocusableElement: 8,
        focusableElements: 9,
        labelId: 3,
        lastFocusableElement: 10,
        step: 4,
        dataStepId: 1,
        getElement: 12
      });
      return _this10;
    }
    _createClass(Shepherd_element, [{
      key: "getElement",
      get: function get() {
        return this.$$.ctx[12];
      }
    }]);
    return Shepherd_element;
  }(SvelteComponent);
  function createCommonjsModule(fn, module) {
    return module = {
      exports: {}
    }, fn(module, module.exports), module.exports;
  }
  var smoothscroll = createCommonjsModule(function (module, exports) {
    /* smoothscroll v0.4.4 - 2019 - Dustan Kasten, Jeremias Menichelli - MIT License */
    (function () {
      function polyfill() {
        // aliases
        var w = window;
        var d = document; // return if scroll behavior is supported and polyfill is not forced

        if ('scrollBehavior' in d.documentElement.style && w.__forceSmoothScrollPolyfill__ !== true) {
          return;
        } // globals

        var Element = w.HTMLElement || w.Element;
        var SCROLL_TIME = 468; // object gathering original scroll methods

        var original = {
          scroll: w.scroll || w.scrollTo,
          scrollBy: w.scrollBy,
          elementScroll: Element.prototype.scroll || scrollElement,
          scrollIntoView: Element.prototype.scrollIntoView
        }; // define timing method

        var now = w.performance && w.performance.now ? w.performance.now.bind(w.performance) : Date.now;
        /**
         * indicates if a the current browser is made by Microsoft
         * @method isMicrosoftBrowser
         * @param {String} userAgent
         * @returns {Boolean}
         */

        function isMicrosoftBrowser(userAgent) {
          var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];
          return new RegExp(userAgentPatterns.join('|')).test(userAgent);
        }
        /*
         * IE has rounding bug rounding down clientHeight and clientWidth and
         * rounding up scrollHeight and scrollWidth causing false positives
         * on hasScrollableSpace
         */

        var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;
        /**
         * changes scroll position inside an element
         * @method scrollElement
         * @param {Number} x
         * @param {Number} y
         * @returns {undefined}
         */

        function scrollElement(x, y) {
          this.scrollLeft = x;
          this.scrollTop = y;
        }
        /**
         * returns result of applying ease math function to a number
         * @method ease
         * @param {Number} k
         * @returns {Number}
         */

        function ease(k) {
          return 0.5 * (1 - Math.cos(Math.PI * k));
        }
        /**
         * indicates if a smooth behavior should be applied
         * @method shouldBailOut
         * @param {Number|Object} firstArg
         * @returns {Boolean}
         */

        function shouldBailOut(firstArg) {
          if (firstArg === null || _typeof(firstArg) !== 'object' || firstArg.behavior === undefined || firstArg.behavior === 'auto' || firstArg.behavior === 'instant') {
            // first argument is not an object/null
            // or behavior is auto, instant or undefined
            return true;
          }
          if (_typeof(firstArg) === 'object' && firstArg.behavior === 'smooth') {
            // first argument is an object and behavior is smooth
            return false;
          } // throw error when behavior is not supported

          throw new TypeError('behavior member of ScrollOptions ' + firstArg.behavior + ' is not a valid value for enumeration ScrollBehavior.');
        }
        /**
         * indicates if an element has scrollable space in the provided axis
         * @method hasScrollableSpace
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */

        function hasScrollableSpace(el, axis) {
          if (axis === 'Y') {
            return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
          }
          if (axis === 'X') {
            return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
          }
        }
        /**
         * indicates if an element has a scrollable overflow property in the axis
         * @method canOverflow
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */

        function canOverflow(el, axis) {
          var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];
          return overflowValue === 'auto' || overflowValue === 'scroll';
        }
        /**
         * indicates if an element can be scrolled in either axis
         * @method isScrollable
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */

        function isScrollable(el) {
          var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
          var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');
          return isScrollableY || isScrollableX;
        }
        /**
         * finds scrollable parent of an element
         * @method findScrollableParent
         * @param {Node} el
         * @returns {Node} el
         */

        function findScrollableParent(el) {
          while (el !== d.body && isScrollable(el) === false) {
            el = el.parentNode || el.host;
          }
          return el;
        }
        /**
         * self invoked function that, given a context, steps through scrolling
         * @method step
         * @param {Object} context
         * @returns {undefined}
         */

        function step(context) {
          var time = now();
          var value;
          var currentX;
          var currentY;
          var elapsed = (time - context.startTime) / SCROLL_TIME; // avoid elapsed times higher than one

          elapsed = elapsed > 1 ? 1 : elapsed; // apply easing to elapsed time

          value = ease(elapsed);
          currentX = context.startX + (context.x - context.startX) * value;
          currentY = context.startY + (context.y - context.startY) * value;
          context.method.call(context.scrollable, currentX, currentY); // scroll more if we have not reached our destination

          if (currentX !== context.x || currentY !== context.y) {
            w.requestAnimationFrame(step.bind(w, context));
          }
        }
        /**
         * scrolls window or element with a smooth behavior
         * @method smoothScroll
         * @param {Object|Node} el
         * @param {Number} x
         * @param {Number} y
         * @returns {undefined}
         */

        function smoothScroll(el, x, y) {
          var scrollable;
          var startX;
          var startY;
          var method;
          var startTime = now(); // define scroll context

          if (el === d.body) {
            scrollable = w;
            startX = w.scrollX || w.pageXOffset;
            startY = w.scrollY || w.pageYOffset;
            method = original.scroll;
          } else {
            scrollable = el;
            startX = el.scrollLeft;
            startY = el.scrollTop;
            method = scrollElement;
          } // scroll looping over a frame

          step({
            scrollable: scrollable,
            method: method,
            startTime: startTime,
            startX: startX,
            startY: startY,
            x: x,
            y: y
          });
        } // ORIGINAL METHODS OVERRIDES
        // w.scroll and w.scrollTo

        w.scroll = w.scrollTo = function () {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          } // avoid smooth behavior if not required

          if (shouldBailOut(arguments[0]) === true) {
            original.scroll.call(w, arguments[0].left !== undefined ? arguments[0].left : _typeof(arguments[0]) !== 'object' ? arguments[0] : w.scrollX || w.pageXOffset,
            // use top prop, second argument if present or fallback to scrollY
            arguments[0].top !== undefined ? arguments[0].top : arguments[1] !== undefined ? arguments[1] : w.scrollY || w.pageYOffset);
            return;
          } // LET THE SMOOTHNESS BEGIN!

          smoothScroll.call(w, d.body, arguments[0].left !== undefined ? ~~arguments[0].left : w.scrollX || w.pageXOffset, arguments[0].top !== undefined ? ~~arguments[0].top : w.scrollY || w.pageYOffset);
        }; // w.scrollBy

        w.scrollBy = function () {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          } // avoid smooth behavior if not required

          if (shouldBailOut(arguments[0])) {
            original.scrollBy.call(w, arguments[0].left !== undefined ? arguments[0].left : _typeof(arguments[0]) !== 'object' ? arguments[0] : 0, arguments[0].top !== undefined ? arguments[0].top : arguments[1] !== undefined ? arguments[1] : 0);
            return;
          } // LET THE SMOOTHNESS BEGIN!

          smoothScroll.call(w, d.body, ~~arguments[0].left + (w.scrollX || w.pageXOffset), ~~arguments[0].top + (w.scrollY || w.pageYOffset));
        }; // Element.prototype.scroll and Element.prototype.scrollTo

        Element.prototype.scroll = Element.prototype.scrollTo = function () {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          } // avoid smooth behavior if not required

          if (shouldBailOut(arguments[0]) === true) {
            // if one number is passed, throw error to match Firefox implementation
            if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
              throw new SyntaxError('Value could not be converted');
            }
            original.elementScroll.call(this,
            // use left prop, first number argument or fallback to scrollLeft
            arguments[0].left !== undefined ? ~~arguments[0].left : _typeof(arguments[0]) !== 'object' ? ~~arguments[0] : this.scrollLeft,
            // use top prop, second argument or fallback to scrollTop
            arguments[0].top !== undefined ? ~~arguments[0].top : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop);
            return;
          }
          var left = arguments[0].left;
          var top = arguments[0].top; // LET THE SMOOTHNESS BEGIN!

          smoothScroll.call(this, this, typeof left === 'undefined' ? this.scrollLeft : ~~left, typeof top === 'undefined' ? this.scrollTop : ~~top);
        }; // Element.prototype.scrollBy

        Element.prototype.scrollBy = function () {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          } // avoid smooth behavior if not required

          if (shouldBailOut(arguments[0]) === true) {
            original.elementScroll.call(this, arguments[0].left !== undefined ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, arguments[0].top !== undefined ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop);
            return;
          }
          this.scroll({
            left: ~~arguments[0].left + this.scrollLeft,
            top: ~~arguments[0].top + this.scrollTop,
            behavior: arguments[0].behavior
          });
        }; // Element.prototype.scrollIntoView

        Element.prototype.scrollIntoView = function () {
          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            original.scrollIntoView.call(this, arguments[0] === undefined ? true : arguments[0]);
            return;
          } // LET THE SMOOTHNESS BEGIN!

          var scrollableParent = findScrollableParent(this);
          var parentRects = scrollableParent.getBoundingClientRect();
          var clientRects = this.getBoundingClientRect();
          if (scrollableParent !== d.body) {
            // reveal element inside parent
            smoothScroll.call(this, scrollableParent, scrollableParent.scrollLeft + clientRects.left - parentRects.left, scrollableParent.scrollTop + clientRects.top - parentRects.top); // reveal parent in viewport unless is fixed

            if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
              w.scrollBy({
                left: parentRects.left,
                top: parentRects.top,
                behavior: 'smooth'
              });
            }
          } else {
            // reveal element in viewport
            w.scrollBy({
              left: clientRects.left,
              top: clientRects.top,
              behavior: 'smooth'
            });
          }
        };
      }
      {
        // commonjs
        module.exports = {
          polyfill: polyfill
        };
      }
    })();
  });
  smoothscroll.polyfill;
  smoothscroll.polyfill();
  /**
   * A class representing steps to be added to a tour.
   * @extends {Evented}
   */
  var Step = /*#__PURE__*/function (_Evented) {
    _inherits(Step, _Evented);
    /**
     * Create a step
     * @param {Tour} tour The tour for the step
     * @param {object} options The options for the step
     * @param {boolean} options.arrow Whether to display the arrow for the tooltip or not. Defaults to `true`.
     * @param {object} options.attachTo The element the step should be attached to on the page.
     * An object with properties `element` and `on`.
     *
     * ```js
     * const step = new Step(tour, {
     *   attachTo: { element: '.some .selector-path', on: 'left' },
     *   ...moreOptions
     * });
     * ```
     *
     * If you don’t specify an `attachTo` the element will appear in the middle of the screen. The same will happen if your `attachTo.element` callback returns `null`, `undefined`, or a selector that does not exist in the DOM.
     * If you omit the `on` portion of `attachTo`, the element will still be highlighted, but the tooltip will appear
     * in the middle of the screen, without an arrow pointing to the target.
     * If the element to highlight does not yet exist while instantiating tour steps, you may use lazy evaluation by supplying a function to `attachTo.element`. The function will be called in the `before-show` phase.
     * @param {string|HTMLElement|function} options.attachTo.element An element selector string, DOM element, or a function (returning a selector, a DOM element, `null` or `undefined`).
     * @param {string} options.attachTo.on The optional direction to place the Popper tooltip relative to the element.
     *   - Possible string values: 'auto', 'auto-start', 'auto-end', 'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'right', 'right-start', 'right-end', 'left', 'left-start', 'left-end'
     * @param {Object} options.advanceOn An action on the page which should advance shepherd to the next step.
     * It should be an object with a string `selector` and an `event` name
     * ```js
     * const step = new Step(tour, {
     *   advanceOn: { selector: '.some .selector-path', event: 'click' },
     *   ...moreOptions
     * });
     * ```
     * `event` doesn’t have to be an event inside the tour, it can be any event fired on any element on the page.
     * You can also always manually advance the Tour by calling `myTour.next()`.
     * @param {function} options.beforeShowPromise A function that returns a promise.
     * When the promise resolves, the rest of the `show` code for the step will execute.
     * @param {Object[]} options.buttons An array of buttons to add to the step. These will be rendered in a
     * footer below the main body text.
     * @param {function} options.buttons.button.action A function executed when the button is clicked on.
     * It is automatically bound to the `tour` the step is associated with, so things like `this.next` will
     * work inside the action.
     * You can use action to skip steps or navigate to specific steps, with something like:
     * ```js
     * action() {
     *   return this.show('some_step_name');
     * }
     * ```
     * @param {string} options.buttons.button.classes Extra classes to apply to the `<a>`
     * @param {boolean} options.buttons.button.disabled Should the button be disabled?
     * @param {string} options.buttons.button.label The aria-label text of the button
     * @param {boolean} options.buttons.button.secondary If true, a shepherd-button-secondary class is applied to the button
     * @param {string} options.buttons.button.text The HTML text of the button
     * @param {boolean} options.canClickTarget A boolean, that when set to false, will set `pointer-events: none` on the target
     * @param {object} options.cancelIcon Options for the cancel icon
     * @param {boolean} options.cancelIcon.enabled Should a cancel “✕” be shown in the header of the step?
     * @param {string} options.cancelIcon.label The label to add for `aria-label`
     * @param {string} options.classes A string of extra classes to add to the step's content element.
     * @param {string} options.highlightClass An extra class to apply to the `attachTo` element when it is
     * highlighted (that is, when its step is active). You can then target that selector in your CSS.
     * @param {string} options.id The string to use as the `id` for the step.
     * @param {number} options.modalOverlayOpeningPadding An amount of padding to add around the modal overlay opening
     * @param {number} options.modalOverlayOpeningRadius An amount of border radius to add around the modal overlay opening
     * @param {object} options.popperOptions Extra options to pass to Popper
     * @param {boolean|Object} options.scrollTo Should the element be scrolled to when this step is shown? If true, uses the default `scrollIntoView`,
     * if an object, passes that object as the params to `scrollIntoView` i.e. `{behavior: 'smooth', block: 'center'}`
     * @param {function} options.scrollToHandler A function that lets you override the default scrollTo behavior and
     * define a custom action to do the scrolling, and possibly other logic.
     * @param {function} options.showOn A function that, when it returns `true`, will show the step.
     * If it returns false, the step will be skipped.
     * @param {string} options.text The text in the body of the step. It can be one of three types:
     * ```
     * - HTML string
     * - `HTMLElement` object
     * - `Function` to be executed when the step is built. It must return one the two options above.
     * ```
     * @param {string} options.title The step's title. It becomes an `h3` at the top of the step. It can be one of two types:
     * ```
     * - HTML string
     * - `Function` to be executed when the step is built. It must return HTML string.
     * ```
     * @param {object} options.when You can define `show`, `hide`, etc events inside `when`. For example:
     * ```js
     * when: {
     *   show: function() {
     *     window.scrollTo(0, 0);
     *   }
     * }
     * ```
     * @return {Step} The newly created Step instance
     */
    function Step(tour, options) {
      var _this11;
      _classCallCheck(this, Step);
      if (options === void 0) {
        options = {};
      }
      _this11 = _callSuper(this, Step, [tour, options]);
      _this11.tour = tour;
      _this11.classPrefix = _this11.tour.options ? normalizePrefix(_this11.tour.options.classPrefix) : '';
      _this11.styles = tour.styles;
      /**
       * Resolved attachTo options. Due to lazy evaluation, we only resolve the options during `before-show` phase.
       * Do not use this directly, use the _getResolvedAttachToOptions method instead.
       * @type {null|{}|{element, to}}
       * @private
       */

      _this11._resolvedAttachTo = null;
      autoBind(_assertThisInitialized(_this11));
      _this11._setOptions(options);
      return _possibleConstructorReturn(_this11, _assertThisInitialized(_this11));
    }
    /**
     * Cancel the tour
     * Triggers the `cancel` event
     */
    _createClass(Step, [{
      key: "cancel",
      value: function cancel() {
        this.tour.cancel();
        this.trigger('cancel');
      }
      /**
       * Complete the tour
       * Triggers the `complete` event
       */
    }, {
      key: "complete",
      value: function complete() {
        this.tour.complete();
        this.trigger('complete');
      }
      /**
       * Remove the step, delete the step's element, and destroy the Popper instance for the step.
       * Triggers `destroy` event
       */
    }, {
      key: "destroy",
      value: function destroy() {
        if (this.tooltip) {
          this.tooltip.destroy();
          this.tooltip = null;
        }
        if (isHTMLElement$1(this.el) && this.el.parentNode) {
          this.el.parentNode.removeChild(this.el);
          this.el = null;
        }
        this._updateStepTargetOnHide();
        this.trigger('destroy');
      }
      /**
       * Returns the tour for the step
       * @return {Tour} The tour instance
       */
    }, {
      key: "getTour",
      value: function getTour() {
        return this.tour;
      }
      /**
       * Hide the step
       */
    }, {
      key: "hide",
      value: function hide() {
        this.tour.modal.hide();
        this.trigger('before-hide');
        if (this.el) {
          this.el.hidden = true;
        }
        this._updateStepTargetOnHide();
        this.trigger('hide');
      }
      /**
       * Resolves attachTo options.
       * @returns {{}|{element, on}}
       * @private
       */
    }, {
      key: "_resolveAttachToOptions",
      value: function _resolveAttachToOptions() {
        this._resolvedAttachTo = parseAttachTo(this);
        return this._resolvedAttachTo;
      }
      /**
       * A selector for resolved attachTo options.
       * @returns {{}|{element, on}}
       * @private
       */
    }, {
      key: "_getResolvedAttachToOptions",
      value: function _getResolvedAttachToOptions() {
        if (this._resolvedAttachTo === null) {
          return this._resolveAttachToOptions();
        }
        return this._resolvedAttachTo;
      }
      /**
       * Check if the step is open and visible
       * @return {boolean} True if the step is open and visible
       */
    }, {
      key: "isOpen",
      value: function isOpen() {
        return Boolean(this.el && !this.el.hidden);
      }
      /**
       * Wraps `_show` and ensures `beforeShowPromise` resolves before calling show
       * @return {*|Promise}
       */
    }, {
      key: "show",
      value: function show() {
        var _this12 = this;
        if (isFunction(this.options.beforeShowPromise)) {
          var beforeShowPromise = this.options.beforeShowPromise();
          if (!isUndefined(beforeShowPromise)) {
            return beforeShowPromise.then(function () {
              return _this12._show();
            });
          }
        }
        this._show();
      }
      /**
       * Updates the options of the step.
       *
       * @param {Object} options The options for the step
       */
    }, {
      key: "updateStepOptions",
      value: function updateStepOptions(options) {
        Object.assign(this.options, options);
        if (this.shepherdElementComponent) {
          this.shepherdElementComponent.$set({
            step: this
          });
        }
      }
      /**
       * Returns the element for the step
       * @return {HTMLElement|null|undefined} The element instance. undefined if it has never been shown, null if it has been destroyed
       */
    }, {
      key: "getElement",
      value: function getElement() {
        return this.el;
      }
      /**
       * Returns the target for the step
       * @return {HTMLElement|null|undefined} The element instance. undefined if it has never been shown, null if query string has not been found
       */
    }, {
      key: "getTarget",
      value: function getTarget() {
        return this.target;
      }
      /**
       * Creates Shepherd element for step based on options
       *
       * @return {Element} The DOM element for the step tooltip
       * @private
       */
    }, {
      key: "_createTooltipContent",
      value: function _createTooltipContent() {
        var descriptionId = "".concat(this.id, "-description");
        var labelId = "".concat(this.id, "-label");
        this.shepherdElementComponent = new Shepherd_element({
          target: this.tour.options.stepsContainer || document.body,
          props: {
            classPrefix: this.classPrefix,
            descriptionId: descriptionId,
            labelId: labelId,
            step: this,
            styles: this.styles
          }
        });
        return this.shepherdElementComponent.getElement();
      }
      /**
       * If a custom scrollToHandler is defined, call that, otherwise do the generic
       * scrollIntoView call.
       *
       * @param {boolean|Object} scrollToOptions If true, uses the default `scrollIntoView`,
       * if an object, passes that object as the params to `scrollIntoView` i.e. `{ behavior: 'smooth', block: 'center' }`
       * @private
       */
    }, {
      key: "_scrollTo",
      value: function _scrollTo(scrollToOptions) {
        var _this$_getResolvedAtt = this._getResolvedAttachToOptions(),
          element = _this$_getResolvedAtt.element;
        if (isFunction(this.options.scrollToHandler)) {
          this.options.scrollToHandler(element);
        } else if (isElement$1(element) && typeof element.scrollIntoView === 'function') {
          element.scrollIntoView(scrollToOptions);
        }
      }
      /**
       * _getClassOptions gets all possible classes for the step
       * @param {Object} stepOptions The step specific options
       * @returns {String} unique string from array of classes
       * @private
       */
    }, {
      key: "_getClassOptions",
      value: function _getClassOptions(stepOptions) {
        var defaultStepOptions = this.tour && this.tour.options && this.tour.options.defaultStepOptions;
        var stepClasses = stepOptions.classes ? stepOptions.classes : '';
        var defaultStepOptionsClasses = defaultStepOptions && defaultStepOptions.classes ? defaultStepOptions.classes : '';
        var allClasses = [].concat(_toConsumableArray(stepClasses.split(' ')), _toConsumableArray(defaultStepOptionsClasses.split(' ')));
        var uniqClasses = new Set(allClasses);
        return Array.from(uniqClasses).join(' ').trim();
      }
      /**
       * Sets the options for the step, maps `when` to events, sets up buttons
       * @param {Object} options The options for the step
       * @private
       */
    }, {
      key: "_setOptions",
      value: function _setOptions(options) {
        var _this13 = this;
        if (options === void 0) {
          options = {};
        }
        var tourOptions = this.tour && this.tour.options && this.tour.options.defaultStepOptions;
        tourOptions = cjs({}, tourOptions || {});
        this.options = Object.assign({
          arrow: true
        }, tourOptions, options);
        var when = this.options.when;
        this.options.classes = this._getClassOptions(options);
        this.destroy();
        this.id = this.options.id || "step-".concat(uuid());
        if (when) {
          Object.keys(when).forEach(function (event) {
            _this13.on(event, when[event], _this13);
          });
        }
      }
      /**
       * Create the element and set up the Popper instance
       * @private
       */
    }, {
      key: "_setupElements",
      value: function _setupElements() {
        if (!isUndefined(this.el)) {
          this.destroy();
        }
        this.el = this._createTooltipContent();
        if (this.options.advanceOn) {
          bindAdvance(this);
        }
        setupTooltip(this);
      }
      /**
       * Triggers `before-show`, generates the tooltip DOM content,
       * sets up a Popper instance for the tooltip, then triggers `show`.
       * @private
       */
    }, {
      key: "_show",
      value: function _show() {
        var _this14 = this;
        this.trigger('before-show'); // Force resolve to make sure the options are updated on subsequent shows.

        this._resolveAttachToOptions();
        this._setupElements();
        if (!this.tour.modal) {
          this.tour._setupModal();
        }
        this.tour.modal.setupForStep(this);
        this._styleTargetElementForStep(this);
        this.el.hidden = false; // start scrolling to target before showing the step

        if (this.options.scrollTo) {
          setTimeout(function () {
            _this14._scrollTo(_this14.options.scrollTo);
          });
        }
        this.el.hidden = false;
        var content = this.shepherdElementComponent.getElement();
        var target = this.target || document.body;
        target.classList.add("".concat(this.classPrefix, "shepherd-enabled"));
        target.classList.add("".concat(this.classPrefix, "shepherd-target"));
        content.classList.add('shepherd-enabled');
        this.trigger('show');
      }
      /**
       * Modulates the styles of the passed step's target element, based on the step's options and
       * the tour's `modal` option, to visually emphasize the element
       *
       * @param step The step object that attaches to the element
       * @private
       */
    }, {
      key: "_styleTargetElementForStep",
      value: function _styleTargetElementForStep(step) {
        var targetElement = step.target;
        if (!targetElement) {
          return;
        }
        if (step.options.highlightClass) {
          targetElement.classList.add(step.options.highlightClass);
        }
        targetElement.classList.remove('shepherd-target-click-disabled');
        if (step.options.canClickTarget === false) {
          targetElement.classList.add('shepherd-target-click-disabled');
        }
      }
      /**
       * When a step is hidden, remove the highlightClass and 'shepherd-enabled'
       * and 'shepherd-target' classes
       * @private
       */
    }, {
      key: "_updateStepTargetOnHide",
      value: function _updateStepTargetOnHide() {
        var target = this.target || document.body;
        if (this.options.highlightClass) {
          target.classList.remove(this.options.highlightClass);
        }
        target.classList.remove('shepherd-target-click-disabled', "".concat(this.classPrefix, "shepherd-enabled"), "".concat(this.classPrefix, "shepherd-target"));
      }
    }]);
    return Step;
  }(Evented);
  /**
   * Cleanup the steps and set pointerEvents back to 'auto'
   * @param tour The tour object
   */
  function cleanupSteps(tour) {
    if (tour) {
      var steps = tour.steps;
      steps.forEach(function (step) {
        if (step.options && step.options.canClickTarget === false && step.options.attachTo) {
          if (step.target instanceof HTMLElement) {
            step.target.classList.remove('shepherd-target-click-disabled');
          }
        }
      });
    }
  }

  /**
   * Generates the svg path data for a rounded rectangle overlay
   * @param {Object} dimension - Dimensions of rectangle.
   * @param {number} width - Width.
   * @param {number} height - Height.
   * @param {number} [x=0] - Offset from top left corner in x axis. default 0.
   * @param {number} [y=0] - Offset from top left corner in y axis. default 0.
   * @param {number} [r=0] - Corner Radius. Keep this smaller than  half of width or height.
   * @returns {string} - Rounded rectangle overlay path data.
   */
  function makeOverlayPath(_ref) {
    var width = _ref.width,
      height = _ref.height,
      _ref$x = _ref.x,
      x = _ref$x === void 0 ? 0 : _ref$x,
      _ref$y = _ref.y,
      y = _ref$y === void 0 ? 0 : _ref$y,
      _ref$r = _ref.r,
      r = _ref$r === void 0 ? 0 : _ref$r;
    var _window = window,
      w = _window.innerWidth,
      h = _window.innerHeight;
    return "M".concat(w, ",").concat(h, "H0V0H").concat(w, "V").concat(h, "ZM").concat(x + r, ",").concat(y, "a").concat(r, ",").concat(r, ",0,0,0-").concat(r, ",").concat(r, "V").concat(height + y - r, "a").concat(r, ",").concat(r, ",0,0,0,").concat(r, ",").concat(r, "H").concat(width + x - r, "a").concat(r, ",").concat(r, ",0,0,0,").concat(r, "-").concat(r, "V").concat(y + r, "a").concat(r, ",").concat(r, ",0,0,0-").concat(r, "-").concat(r, "Z");
  }

  /* src/js/components/shepherd-modal.svelte generated by Svelte v3.49.0 */

  function create_fragment(ctx) {
    var svg;
    var path;
    var svg_class_value;
    var mounted;
    var dispose;
    return {
      c: function c() {
        svg = svg_element("svg");
        path = svg_element("path");
        attr(path, "d", /*pathDefinition*/
        ctx[2]);
        attr(svg, "class", svg_class_value = "".concat( /*modalIsVisible*/
        ctx[1] ? 'shepherd-modal-is-visible' : '', " shepherd-modal-overlay-container"));
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, path);
        /*svg_binding*/

        ctx[11](svg);
        if (!mounted) {
          dispose = listen(svg, "touchmove", /*_preventModalOverlayTouch*/
          ctx[3]);
          mounted = true;
        }
      },
      p: function p(ctx, _ref) {
        var _ref15 = _slicedToArray(_ref, 1),
          dirty = _ref15[0];
        if (dirty & /*pathDefinition*/
        4) {
          attr(path, "d", /*pathDefinition*/
          ctx[2]);
        }
        if (dirty & /*modalIsVisible*/
        2 && svg_class_value !== (svg_class_value = "".concat( /*modalIsVisible*/
        ctx[1] ? 'shepherd-modal-is-visible' : '', " shepherd-modal-overlay-container"))) {
          attr(svg, "class", svg_class_value);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(svg);
        /*svg_binding*/

        ctx[11](null);
        mounted = false;
        dispose();
      }
    };
  }
  function _getScrollParent(element) {
    if (!element) {
      return null;
    }
    var isHtmlElement = element instanceof HTMLElement;
    var overflowY = isHtmlElement && window.getComputedStyle(element).overflowY;
    var isScrollable = overflowY !== 'hidden' && overflowY !== 'visible';
    if (isScrollable && element.scrollHeight >= element.clientHeight) {
      return element;
    }
    return _getScrollParent(element.parentElement);
  }
  /**
   * Get the visible height of the target element relative to its scrollParent.
   * If there is no scroll parent, the height of the element is returned.
   *
   * @param {HTMLElement} element The target element
   * @param {HTMLElement} [scrollParent] The scrollable parent element
   * @returns {{y: number, height: number}}
   * @private
   */

  function _getVisibleHeight(element, scrollParent) {
    var elementRect = element.getBoundingClientRect();
    var top = elementRect.y || elementRect.top;
    var bottom = elementRect.bottom || top + elementRect.height;
    if (scrollParent) {
      var scrollRect = scrollParent.getBoundingClientRect();
      var scrollTop = scrollRect.y || scrollRect.top;
      var scrollBottom = scrollRect.bottom || scrollTop + scrollRect.height;
      top = Math.max(top, scrollTop);
      bottom = Math.min(bottom, scrollBottom);
    }
    var height = Math.max(bottom - top, 0); // Default to 0 if height is negative

    return {
      y: top,
      height: height
    };
  }
  function instance($$self, $$props, $$invalidate) {
    var element = $$props.element,
      openingProperties = $$props.openingProperties;
    uuid();
    var modalIsVisible = false;
    var rafId = undefined;
    var pathDefinition;
    closeModalOpening();
    var getElement = function getElement() {
      return element;
    };
    function closeModalOpening() {
      $$invalidate(4, openingProperties = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        r: 0
      });
    }
    function hide() {
      $$invalidate(1, modalIsVisible = false); // Ensure we cleanup all event listeners when we hide the modal

      _cleanupStepEventListeners();
    }
    function positionModal(modalOverlayOpeningPadding, modalOverlayOpeningRadius, scrollParent, targetElement) {
      if (modalOverlayOpeningPadding === void 0) {
        modalOverlayOpeningPadding = 0;
      }
      if (modalOverlayOpeningRadius === void 0) {
        modalOverlayOpeningRadius = 0;
      }
      if (targetElement) {
        var _getVisibleHeight2 = _getVisibleHeight(targetElement, scrollParent),
          y = _getVisibleHeight2.y,
          height = _getVisibleHeight2.height;
        var _targetElement$getBou = targetElement.getBoundingClientRect(),
          x = _targetElement$getBou.x,
          width = _targetElement$getBou.width,
          _left = _targetElement$getBou.left; // getBoundingClientRect is not consistent. Some browsers use x and y, while others use left and top

        $$invalidate(4, openingProperties = {
          width: width + modalOverlayOpeningPadding * 2,
          height: height + modalOverlayOpeningPadding * 2,
          x: (x || _left) - modalOverlayOpeningPadding,
          y: y - modalOverlayOpeningPadding,
          r: modalOverlayOpeningRadius
        });
      } else {
        closeModalOpening();
      }
    }
    function setupForStep(step) {
      // Ensure we move listeners from the previous step, before we setup new ones
      _cleanupStepEventListeners();
      if (step.tour.options.useModalOverlay) {
        _styleForStep(step);
        show();
      } else {
        hide();
      }
    }
    function show() {
      $$invalidate(1, modalIsVisible = true);
    }
    var _preventModalBodyTouch = function _preventModalBodyTouch(e) {
      e.preventDefault();
    };
    var _preventModalOverlayTouch = function _preventModalOverlayTouch(e) {
      e.stopPropagation();
    };
    /**
    * Add touchmove event listener
    * @private
    */

    function _addStepEventListeners() {
      // Prevents window from moving on touch.
      window.addEventListener('touchmove', _preventModalBodyTouch, {
        passive: false
      });
    }
    /**
    * Cancel the requestAnimationFrame loop and remove touchmove event listeners
    * @private
    */

    function _cleanupStepEventListeners() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = undefined;
      }
      window.removeEventListener('touchmove', _preventModalBodyTouch, {
        passive: false
      });
    }
    /**
    * Style the modal for the step
    * @param {Step} step The step to style the opening for
    * @private
    */

    function _styleForStep(step) {
      var _step$options = step.options,
        modalOverlayOpeningPadding = _step$options.modalOverlayOpeningPadding,
        modalOverlayOpeningRadius = _step$options.modalOverlayOpeningRadius;
      var scrollParent = _getScrollParent(step.target); // Setup recursive function to call requestAnimationFrame to update the modal opening position

      var rafLoop = function rafLoop() {
        rafId = undefined;
        positionModal(modalOverlayOpeningPadding, modalOverlayOpeningRadius, scrollParent, step.target);
        rafId = requestAnimationFrame(rafLoop);
      };
      rafLoop();
      _addStepEventListeners();
    }
    function svg_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        element = $$value;
        $$invalidate(0, element);
      });
    }
    $$self.$$set = function ($$props) {
      if ('element' in $$props) $$invalidate(0, element = $$props.element);
      if ('openingProperties' in $$props) $$invalidate(4, openingProperties = $$props.openingProperties);
    };
    $$self.$$.update = function () {
      if ($$self.$$.dirty & /*openingProperties*/
      16) {
        $$invalidate(2, pathDefinition = makeOverlayPath(openingProperties));
      }
    };
    return [element, modalIsVisible, pathDefinition, _preventModalOverlayTouch, openingProperties, getElement, closeModalOpening, hide, positionModal, setupForStep, show, svg_binding];
  }
  var Shepherd_modal = /*#__PURE__*/function (_SvelteComponent9) {
    _inherits(Shepherd_modal, _SvelteComponent9);
    function Shepherd_modal(options) {
      var _this15;
      _classCallCheck(this, Shepherd_modal);
      _this15 = _callSuper(this, Shepherd_modal);
      init(_assertThisInitialized(_this15), options, instance, create_fragment, safe_not_equal, {
        element: 0,
        openingProperties: 4,
        getElement: 5,
        closeModalOpening: 6,
        hide: 7,
        positionModal: 8,
        setupForStep: 9,
        show: 10
      });
      return _this15;
    }
    _createClass(Shepherd_modal, [{
      key: "getElement",
      get: function get() {
        return this.$$.ctx[5];
      }
    }, {
      key: "closeModalOpening",
      get: function get() {
        return this.$$.ctx[6];
      }
    }, {
      key: "hide",
      get: function get() {
        return this.$$.ctx[7];
      }
    }, {
      key: "positionModal",
      get: function get() {
        return this.$$.ctx[8];
      }
    }, {
      key: "setupForStep",
      get: function get() {
        return this.$$.ctx[9];
      }
    }, {
      key: "show",
      get: function get() {
        return this.$$.ctx[10];
      }
    }]);
    return Shepherd_modal;
  }(SvelteComponent);
  var Shepherd = new Evented();
  /**
   * Class representing the site tour
   * @extends {Evented}
   */
  var Tour = /*#__PURE__*/function (_Evented2) {
    _inherits(Tour, _Evented2);
    /**
     * @param {Object} options The options for the tour
     * @param {boolean} options.confirmCancel If true, will issue a `window.confirm` before cancelling
     * @param {string} options.confirmCancelMessage The message to display in the confirm dialog
     * @param {string} options.classPrefix The prefix to add to the `shepherd-enabled` and `shepherd-target` class names as well as the `data-shepherd-step-id`.
     * @param {Object} options.defaultStepOptions Default options for Steps ({@link Step#constructor}), created through `addStep`
     * @param {boolean} options.exitOnEsc Exiting the tour with the escape key will be enabled unless this is explicitly
     * set to false.
     * @param {boolean} options.keyboardNavigation Navigating the tour via left and right arrow keys will be enabled
     * unless this is explicitly set to false.
     * @param {HTMLElement} options.stepsContainer An optional container element for the steps.
     * If not set, the steps will be appended to `document.body`.
     * @param {HTMLElement} options.modalContainer An optional container element for the modal.
     * If not set, the modal will be appended to `document.body`.
     * @param {object[] | Step[]} options.steps An array of step options objects or Step instances to initialize the tour with
     * @param {string} options.tourName An optional "name" for the tour. This will be appended to the the tour's
     * dynamically generated `id` property -- which is also set on the `body` element as the `data-shepherd-active-tour` attribute
     * whenever the tour becomes active.
     * @param {boolean} options.useModalOverlay Whether or not steps should be placed above a darkened
     * modal overlay. If true, the overlay will create an opening around the target element so that it
     * can remain interactive
     * @returns {Tour}
     */
    function Tour(options) {
      var _this16;
      _classCallCheck(this, Tour);
      if (options === void 0) {
        options = {};
      }
      _this16 = _callSuper(this, Tour, [options]);
      autoBind(_assertThisInitialized(_this16));
      var defaultTourOptions = {
        exitOnEsc: true,
        keyboardNavigation: true
      };
      _this16.options = Object.assign({}, defaultTourOptions, options);
      _this16.classPrefix = normalizePrefix(_this16.options.classPrefix);
      _this16.steps = [];
      _this16.addSteps(_this16.options.steps); // Pass these events onto the global Shepherd object

      var events = ['active', 'cancel', 'complete', 'inactive', 'show', 'start'];
      events.map(function (event) {
        (function (e) {
          _this16.on(e, function (opts) {
            opts = opts || {};
            opts.tour = _assertThisInitialized(_this16);
            Shepherd.trigger(e, opts);
          });
        })(event);
      });
      _this16._setTourID();
      return _possibleConstructorReturn(_this16, _assertThisInitialized(_this16));
    }
    /**
     * Adds a new step to the tour
     * @param {Object|Step} options An object containing step options or a Step instance
     * @param {number} index The optional index to insert the step at. If undefined, the step
     * is added to the end of the array.
     * @return {Step} The newly added step
     */
    _createClass(Tour, [{
      key: "addStep",
      value: function addStep(options, index) {
        var step = options;
        if (!(step instanceof Step)) {
          step = new Step(this, step);
        } else {
          step.tour = this;
        }
        if (!isUndefined(index)) {
          this.steps.splice(index, 0, step);
        } else {
          this.steps.push(step);
        }
        return step;
      }
      /**
       * Add multiple steps to the tour
       * @param {Array<object> | Array<Step>} steps The steps to add to the tour
       */
    }, {
      key: "addSteps",
      value: function addSteps(steps) {
        var _this17 = this;
        if (Array.isArray(steps)) {
          steps.forEach(function (step) {
            _this17.addStep(step);
          });
        }
        return this;
      }
      /**
       * Go to the previous step in the tour
       */
    }, {
      key: "back",
      value: function back() {
        var index = this.steps.indexOf(this.currentStep);
        this.show(index - 1, false);
      }
      /**
       * Calls _done() triggering the 'cancel' event
       * If `confirmCancel` is true, will show a window.confirm before cancelling
       */
    }, {
      key: "cancel",
      value: function cancel() {
        if (this.options.confirmCancel) {
          var cancelMessage = this.options.confirmCancelMessage || 'Are you sure you want to stop the tour?';
          var stopTour = window.confirm(cancelMessage);
          if (stopTour) {
            this._done('cancel');
          }
        } else {
          this._done('cancel');
        }
      }
      /**
       * Calls _done() triggering the `complete` event
       */
    }, {
      key: "complete",
      value: function complete() {
        this._done('complete');
      }
      /**
       * Gets the step from a given id
       * @param {Number|String} id The id of the step to retrieve
       * @return {Step} The step corresponding to the `id`
       */
    }, {
      key: "getById",
      value: function getById(id) {
        return this.steps.find(function (step) {
          return step.id === id;
        });
      }
      /**
       * Gets the current step
       * @returns {Step|null}
       */
    }, {
      key: "getCurrentStep",
      value: function getCurrentStep() {
        return this.currentStep;
      }
      /**
       * Hide the current step
       */
    }, {
      key: "hide",
      value: function hide() {
        var currentStep = this.getCurrentStep();
        if (currentStep) {
          return currentStep.hide();
        }
      }
      /**
       * Check if the tour is active
       * @return {boolean}
       */
    }, {
      key: "isActive",
      value: function isActive() {
        return Shepherd.activeTour === this;
      }
      /**
       * Go to the next step in the tour
       * If we are at the end, call `complete`
       */
    }, {
      key: "next",
      value: function next() {
        var index = this.steps.indexOf(this.currentStep);
        if (index === this.steps.length - 1) {
          this.complete();
        } else {
          this.show(index + 1, true);
        }
      }
      /**
       * Removes the step from the tour
       * @param {String} name The id for the step to remove
       */
    }, {
      key: "removeStep",
      value: function removeStep(name) {
        var _this18 = this;
        var current = this.getCurrentStep(); // Find the step, destroy it and remove it from this.steps

        this.steps.some(function (step, i) {
          if (step.id === name) {
            if (step.isOpen()) {
              step.hide();
            }
            step.destroy();
            _this18.steps.splice(i, 1);
            return true;
          }
        });
        if (current && current.id === name) {
          this.currentStep = undefined; // If we have steps left, show the first one, otherwise just cancel the tour

          this.steps.length ? this.show(0) : this.cancel();
        }
      }
      /**
       * Show a specific step in the tour
       * @param {Number|String} key The key to look up the step by
       * @param {Boolean} forward True if we are going forward, false if backward
       */
    }, {
      key: "show",
      value: function show(key, forward) {
        if (key === void 0) {
          key = 0;
        }
        if (forward === void 0) {
          forward = true;
        }
        var step = isString(key) ? this.getById(key) : this.steps[key];
        if (step) {
          this._updateStateBeforeShow();
          var shouldSkipStep = isFunction(step.options.showOn) && !step.options.showOn(); // If `showOn` returns false, we want to skip the step, otherwise, show the step like normal

          if (shouldSkipStep) {
            this._skipStep(step, forward);
          } else {
            this.trigger('show', {
              step: step,
              previous: this.currentStep
            });
            this.currentStep = step;
            step.show();
          }
        }
      }
      /**
       * Start the tour
       */
    }, {
      key: "start",
      value: function start() {
        this.trigger('start'); // Save the focused element before the tour opens

        this.focusedElBeforeOpen = document.activeElement;
        this.currentStep = null;
        this._setupModal();
        this._setupActiveTour();
        this.next();
      }
      /**
       * Called whenever the tour is cancelled or completed, basically anytime we exit the tour
       * @param {String} event The event name to trigger
       * @private
       */
    }, {
      key: "_done",
      value: function _done(event) {
        var index = this.steps.indexOf(this.currentStep);
        if (Array.isArray(this.steps)) {
          this.steps.forEach(function (step) {
            return step.destroy();
          });
        }
        cleanupSteps(this);
        this.trigger(event, {
          index: index
        });
        Shepherd.activeTour = null;
        this.trigger('inactive', {
          tour: this
        });
        if (this.modal) {
          this.modal.hide();
        }
        if (event === 'cancel' || event === 'complete') {
          if (this.modal) {
            var modalContainer = document.querySelector('.shepherd-modal-overlay-container');
            if (modalContainer) {
              modalContainer.remove();
            }
          }
        } // Focus the element that was focused before the tour started

        if (isHTMLElement$1(this.focusedElBeforeOpen)) {
          this.focusedElBeforeOpen.focus();
        }
      }
      /**
       * Make this tour "active"
       * @private
       */
    }, {
      key: "_setupActiveTour",
      value: function _setupActiveTour() {
        this.trigger('active', {
          tour: this
        });
        Shepherd.activeTour = this;
      }
      /**
       * _setupModal create the modal container and instance
       * @private
       */
    }, {
      key: "_setupModal",
      value: function _setupModal() {
        this.modal = new Shepherd_modal({
          target: this.options.modalContainer || document.body,
          props: {
            classPrefix: this.classPrefix,
            styles: this.styles
          }
        });
      }
      /**
       * Called when `showOn` evaluates to false, to skip the step or complete the tour if it's the last step
       * @param {Step} step The step to skip
       * @param {Boolean} forward True if we are going forward, false if backward
       * @private
       */
    }, {
      key: "_skipStep",
      value: function _skipStep(step, forward) {
        var index = this.steps.indexOf(step);
        if (index === this.steps.length - 1) {
          this.complete();
        } else {
          var nextIndex = forward ? index + 1 : index - 1;
          this.show(nextIndex, forward);
        }
      }
      /**
       * Before showing, hide the current step and if the tour is not
       * already active, call `this._setupActiveTour`.
       * @private
       */
    }, {
      key: "_updateStateBeforeShow",
      value: function _updateStateBeforeShow() {
        if (this.currentStep) {
          this.currentStep.hide();
        }
        if (!this.isActive()) {
          this._setupActiveTour();
        }
      }
      /**
       * Sets this.id to `${tourName}--${uuid}`
       * @private
       */
    }, {
      key: "_setTourID",
      value: function _setTourID() {
        var tourName = this.options.tourName || 'tour';
        this.id = "".concat(tourName, "--").concat(uuid());
      }
    }]);
    return Tour;
  }(Evented);
  Object.assign(Shepherd, {
    Tour: Tour,
    Step: Step
  });
  return Shepherd;
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!***********************************************************!*\
  !*** ./resources/assets/vendor/libs/shepherd/shepherd.js ***!
  \***********************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Shepherd: function() { return /* reexport default from dynamic */ shepherd_js_dist_js_shepherd__WEBPACK_IMPORTED_MODULE_0___default.a; }
/* harmony export */ });
/* harmony import */ var shepherd_js_dist_js_shepherd__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! shepherd.js/dist/js/shepherd */ "./node_modules/shepherd.js/dist/js/shepherd.js");
/* harmony import */ var shepherd_js_dist_js_shepherd__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(shepherd_js_dist_js_shepherd__WEBPACK_IMPORTED_MODULE_0__);


}();
/******/ 	return __webpack_exports__;
/******/ })()
;
});
>>>>>>> Stashed changes
