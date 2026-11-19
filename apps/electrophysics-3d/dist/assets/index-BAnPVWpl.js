(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const u of l.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function t(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(o){if(o.ep)return;o.ep=!0;const l=t(o);fetch(o.href,l)}})();function s0(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var ld={exports:{}},sa={},cd={exports:{}},ut={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Vm;function Lv(){if(Vm)return ut;Vm=1;var s=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),l=Symbol.for("react.provider"),u=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),h=Symbol.for("react.suspense"),p=Symbol.for("react.memo"),m=Symbol.for("react.lazy"),g=Symbol.iterator;function v(F){return F===null||typeof F!="object"?null:(F=g&&F[g]||F["@@iterator"],typeof F=="function"?F:null)}var S={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,E={};function y(F,ie,Fe){this.props=F,this.context=ie,this.refs=E,this.updater=Fe||S}y.prototype.isReactComponent={},y.prototype.setState=function(F,ie){if(typeof F!="object"&&typeof F!="function"&&F!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,F,ie,"setState")},y.prototype.forceUpdate=function(F){this.updater.enqueueForceUpdate(this,F,"forceUpdate")};function x(){}x.prototype=y.prototype;function C(F,ie,Fe){this.props=F,this.context=ie,this.refs=E,this.updater=Fe||S}var A=C.prototype=new x;A.constructor=C,M(A,y.prototype),A.isPureReactComponent=!0;var D=Array.isArray,G=Object.prototype.hasOwnProperty,k={current:null},I={key:!0,ref:!0,__self:!0,__source:!0};function z(F,ie,Fe){var J,ce={},ye=null,Se=null;if(ie!=null)for(J in ie.ref!==void 0&&(Se=ie.ref),ie.key!==void 0&&(ye=""+ie.key),ie)G.call(ie,J)&&!I.hasOwnProperty(J)&&(ce[J]=ie[J]);var Pe=arguments.length-2;if(Pe===1)ce.children=Fe;else if(1<Pe){for(var De=Array(Pe),rt=0;rt<Pe;rt++)De[rt]=arguments[rt+2];ce.children=De}if(F&&F.defaultProps)for(J in Pe=F.defaultProps,Pe)ce[J]===void 0&&(ce[J]=Pe[J]);return{$$typeof:s,type:F,key:ye,ref:Se,props:ce,_owner:k.current}}function ae(F,ie){return{$$typeof:s,type:F.type,key:ie,ref:F.ref,props:F.props,_owner:F._owner}}function w(F){return typeof F=="object"&&F!==null&&F.$$typeof===s}function P(F){var ie={"=":"=0",":":"=2"};return"$"+F.replace(/[=:]/g,function(Fe){return ie[Fe]})}var K=/\/+/g;function Q(F,ie){return typeof F=="object"&&F!==null&&F.key!=null?P(""+F.key):ie.toString(36)}function oe(F,ie,Fe,J,ce){var ye=typeof F;(ye==="undefined"||ye==="boolean")&&(F=null);var Se=!1;if(F===null)Se=!0;else switch(ye){case"string":case"number":Se=!0;break;case"object":switch(F.$$typeof){case s:case e:Se=!0}}if(Se)return Se=F,ce=ce(Se),F=J===""?"."+Q(Se,0):J,D(ce)?(Fe="",F!=null&&(Fe=F.replace(K,"$&/")+"/"),oe(ce,ie,Fe,"",function(rt){return rt})):ce!=null&&(w(ce)&&(ce=ae(ce,Fe+(!ce.key||Se&&Se.key===ce.key?"":(""+ce.key).replace(K,"$&/")+"/")+F)),ie.push(ce)),1;if(Se=0,J=J===""?".":J+":",D(F))for(var Pe=0;Pe<F.length;Pe++){ye=F[Pe];var De=J+Q(ye,Pe);Se+=oe(ye,ie,Fe,De,ce)}else if(De=v(F),typeof De=="function")for(F=De.call(F),Pe=0;!(ye=F.next()).done;)ye=ye.value,De=J+Q(ye,Pe++),Se+=oe(ye,ie,Fe,De,ce);else if(ye==="object")throw ie=String(F),Error("Objects are not valid as a React child (found: "+(ie==="[object Object]"?"object with keys {"+Object.keys(F).join(", ")+"}":ie)+"). If you meant to render a collection of children, use an array instead.");return Se}function he(F,ie,Fe){if(F==null)return F;var J=[],ce=0;return oe(F,J,"","",function(ye){return ie.call(Fe,ye,ce++)}),J}function ne(F){if(F._status===-1){var ie=F._result;ie=ie(),ie.then(function(Fe){(F._status===0||F._status===-1)&&(F._status=1,F._result=Fe)},function(Fe){(F._status===0||F._status===-1)&&(F._status=2,F._result=Fe)}),F._status===-1&&(F._status=0,F._result=ie)}if(F._status===1)return F._result.default;throw F._result}var le={current:null},V={transition:null},ue={ReactCurrentDispatcher:le,ReactCurrentBatchConfig:V,ReactCurrentOwner:k};function se(){throw Error("act(...) is not supported in production builds of React.")}return ut.Children={map:he,forEach:function(F,ie,Fe){he(F,function(){ie.apply(this,arguments)},Fe)},count:function(F){var ie=0;return he(F,function(){ie++}),ie},toArray:function(F){return he(F,function(ie){return ie})||[]},only:function(F){if(!w(F))throw Error("React.Children.only expected to receive a single React element child.");return F}},ut.Component=y,ut.Fragment=t,ut.Profiler=o,ut.PureComponent=C,ut.StrictMode=r,ut.Suspense=h,ut.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ue,ut.act=se,ut.cloneElement=function(F,ie,Fe){if(F==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+F+".");var J=M({},F.props),ce=F.key,ye=F.ref,Se=F._owner;if(ie!=null){if(ie.ref!==void 0&&(ye=ie.ref,Se=k.current),ie.key!==void 0&&(ce=""+ie.key),F.type&&F.type.defaultProps)var Pe=F.type.defaultProps;for(De in ie)G.call(ie,De)&&!I.hasOwnProperty(De)&&(J[De]=ie[De]===void 0&&Pe!==void 0?Pe[De]:ie[De])}var De=arguments.length-2;if(De===1)J.children=Fe;else if(1<De){Pe=Array(De);for(var rt=0;rt<De;rt++)Pe[rt]=arguments[rt+2];J.children=Pe}return{$$typeof:s,type:F.type,key:ce,ref:ye,props:J,_owner:Se}},ut.createContext=function(F){return F={$$typeof:u,_currentValue:F,_currentValue2:F,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},F.Provider={$$typeof:l,_context:F},F.Consumer=F},ut.createElement=z,ut.createFactory=function(F){var ie=z.bind(null,F);return ie.type=F,ie},ut.createRef=function(){return{current:null}},ut.forwardRef=function(F){return{$$typeof:d,render:F}},ut.isValidElement=w,ut.lazy=function(F){return{$$typeof:m,_payload:{_status:-1,_result:F},_init:ne}},ut.memo=function(F,ie){return{$$typeof:p,type:F,compare:ie===void 0?null:ie}},ut.startTransition=function(F){var ie=V.transition;V.transition={};try{F()}finally{V.transition=ie}},ut.unstable_act=se,ut.useCallback=function(F,ie){return le.current.useCallback(F,ie)},ut.useContext=function(F){return le.current.useContext(F)},ut.useDebugValue=function(){},ut.useDeferredValue=function(F){return le.current.useDeferredValue(F)},ut.useEffect=function(F,ie){return le.current.useEffect(F,ie)},ut.useId=function(){return le.current.useId()},ut.useImperativeHandle=function(F,ie,Fe){return le.current.useImperativeHandle(F,ie,Fe)},ut.useInsertionEffect=function(F,ie){return le.current.useInsertionEffect(F,ie)},ut.useLayoutEffect=function(F,ie){return le.current.useLayoutEffect(F,ie)},ut.useMemo=function(F,ie){return le.current.useMemo(F,ie)},ut.useReducer=function(F,ie,Fe){return le.current.useReducer(F,ie,Fe)},ut.useRef=function(F){return le.current.useRef(F)},ut.useState=function(F){return le.current.useState(F)},ut.useSyncExternalStore=function(F,ie,Fe){return le.current.useSyncExternalStore(F,ie,Fe)},ut.useTransition=function(){return le.current.useTransition()},ut.version="18.3.1",ut}var Hm;function Xh(){return Hm||(Hm=1,cd.exports=Lv()),cd.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Gm;function Iv(){if(Gm)return sa;Gm=1;var s=Xh(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),r=Object.prototype.hasOwnProperty,o=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function u(d,h,p){var m,g={},v=null,S=null;p!==void 0&&(v=""+p),h.key!==void 0&&(v=""+h.key),h.ref!==void 0&&(S=h.ref);for(m in h)r.call(h,m)&&!l.hasOwnProperty(m)&&(g[m]=h[m]);if(d&&d.defaultProps)for(m in h=d.defaultProps,h)g[m]===void 0&&(g[m]=h[m]);return{$$typeof:e,type:d,key:v,ref:S,props:g,_owner:o.current}}return sa.Fragment=t,sa.jsx=u,sa.jsxs=u,sa}var Wm;function Nv(){return Wm||(Wm=1,ld.exports=Iv()),ld.exports}var xe=Nv(),xi=Xh();const Uv=s0(xi);var Nl={},ud={exports:{}},zn={},dd={exports:{}},hd={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var qm;function kv(){return qm||(qm=1,(function(s){function e(V,ue){var se=V.length;V.push(ue);e:for(;0<se;){var F=se-1>>>1,ie=V[F];if(0<o(ie,ue))V[F]=ue,V[se]=ie,se=F;else break e}}function t(V){return V.length===0?null:V[0]}function r(V){if(V.length===0)return null;var ue=V[0],se=V.pop();if(se!==ue){V[0]=se;e:for(var F=0,ie=V.length,Fe=ie>>>1;F<Fe;){var J=2*(F+1)-1,ce=V[J],ye=J+1,Se=V[ye];if(0>o(ce,se))ye<ie&&0>o(Se,ce)?(V[F]=Se,V[ye]=se,F=ye):(V[F]=ce,V[J]=se,F=J);else if(ye<ie&&0>o(Se,se))V[F]=Se,V[ye]=se,F=ye;else break e}}return ue}function o(V,ue){var se=V.sortIndex-ue.sortIndex;return se!==0?se:V.id-ue.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;s.unstable_now=function(){return l.now()}}else{var u=Date,d=u.now();s.unstable_now=function(){return u.now()-d}}var h=[],p=[],m=1,g=null,v=3,S=!1,M=!1,E=!1,y=typeof setTimeout=="function"?setTimeout:null,x=typeof clearTimeout=="function"?clearTimeout:null,C=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function A(V){for(var ue=t(p);ue!==null;){if(ue.callback===null)r(p);else if(ue.startTime<=V)r(p),ue.sortIndex=ue.expirationTime,e(h,ue);else break;ue=t(p)}}function D(V){if(E=!1,A(V),!M)if(t(h)!==null)M=!0,ne(G);else{var ue=t(p);ue!==null&&le(D,ue.startTime-V)}}function G(V,ue){M=!1,E&&(E=!1,x(z),z=-1),S=!0;var se=v;try{for(A(ue),g=t(h);g!==null&&(!(g.expirationTime>ue)||V&&!P());){var F=g.callback;if(typeof F=="function"){g.callback=null,v=g.priorityLevel;var ie=F(g.expirationTime<=ue);ue=s.unstable_now(),typeof ie=="function"?g.callback=ie:g===t(h)&&r(h),A(ue)}else r(h);g=t(h)}if(g!==null)var Fe=!0;else{var J=t(p);J!==null&&le(D,J.startTime-ue),Fe=!1}return Fe}finally{g=null,v=se,S=!1}}var k=!1,I=null,z=-1,ae=5,w=-1;function P(){return!(s.unstable_now()-w<ae)}function K(){if(I!==null){var V=s.unstable_now();w=V;var ue=!0;try{ue=I(!0,V)}finally{ue?Q():(k=!1,I=null)}}else k=!1}var Q;if(typeof C=="function")Q=function(){C(K)};else if(typeof MessageChannel<"u"){var oe=new MessageChannel,he=oe.port2;oe.port1.onmessage=K,Q=function(){he.postMessage(null)}}else Q=function(){y(K,0)};function ne(V){I=V,k||(k=!0,Q())}function le(V,ue){z=y(function(){V(s.unstable_now())},ue)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(V){V.callback=null},s.unstable_continueExecution=function(){M||S||(M=!0,ne(G))},s.unstable_forceFrameRate=function(V){0>V||125<V?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):ae=0<V?Math.floor(1e3/V):5},s.unstable_getCurrentPriorityLevel=function(){return v},s.unstable_getFirstCallbackNode=function(){return t(h)},s.unstable_next=function(V){switch(v){case 1:case 2:case 3:var ue=3;break;default:ue=v}var se=v;v=ue;try{return V()}finally{v=se}},s.unstable_pauseExecution=function(){},s.unstable_requestPaint=function(){},s.unstable_runWithPriority=function(V,ue){switch(V){case 1:case 2:case 3:case 4:case 5:break;default:V=3}var se=v;v=V;try{return ue()}finally{v=se}},s.unstable_scheduleCallback=function(V,ue,se){var F=s.unstable_now();switch(typeof se=="object"&&se!==null?(se=se.delay,se=typeof se=="number"&&0<se?F+se:F):se=F,V){case 1:var ie=-1;break;case 2:ie=250;break;case 5:ie=1073741823;break;case 4:ie=1e4;break;default:ie=5e3}return ie=se+ie,V={id:m++,callback:ue,priorityLevel:V,startTime:se,expirationTime:ie,sortIndex:-1},se>F?(V.sortIndex=se,e(p,V),t(h)===null&&V===t(p)&&(E?(x(z),z=-1):E=!0,le(D,se-F))):(V.sortIndex=ie,e(h,V),M||S||(M=!0,ne(G))),V},s.unstable_shouldYield=P,s.unstable_wrapCallback=function(V){var ue=v;return function(){var se=v;v=ue;try{return V.apply(this,arguments)}finally{v=se}}}})(hd)),hd}var Xm;function Fv(){return Xm||(Xm=1,dd.exports=kv()),dd.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var jm;function Ov(){if(jm)return zn;jm=1;var s=Xh(),e=Fv();function t(n){for(var i="https://reactjs.org/docs/error-decoder.html?invariant="+n,a=1;a<arguments.length;a++)i+="&args[]="+encodeURIComponent(arguments[a]);return"Minified React error #"+n+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var r=new Set,o={};function l(n,i){u(n,i),u(n+"Capture",i)}function u(n,i){for(o[n]=i,n=0;n<i.length;n++)r.add(i[n])}var d=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),h=Object.prototype.hasOwnProperty,p=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,m={},g={};function v(n){return h.call(g,n)?!0:h.call(m,n)?!1:p.test(n)?g[n]=!0:(m[n]=!0,!1)}function S(n,i,a,c){if(a!==null&&a.type===0)return!1;switch(typeof i){case"function":case"symbol":return!0;case"boolean":return c?!1:a!==null?!a.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function M(n,i,a,c){if(i===null||typeof i>"u"||S(n,i,a,c))return!0;if(c)return!1;if(a!==null)switch(a.type){case 3:return!i;case 4:return i===!1;case 5:return isNaN(i);case 6:return isNaN(i)||1>i}return!1}function E(n,i,a,c,f,_,T){this.acceptsBooleans=i===2||i===3||i===4,this.attributeName=c,this.attributeNamespace=f,this.mustUseProperty=a,this.propertyName=n,this.type=i,this.sanitizeURL=_,this.removeEmptyString=T}var y={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){y[n]=new E(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var i=n[0];y[i]=new E(i,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){y[n]=new E(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){y[n]=new E(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){y[n]=new E(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){y[n]=new E(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){y[n]=new E(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){y[n]=new E(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){y[n]=new E(n,5,!1,n.toLowerCase(),null,!1,!1)});var x=/[\-:]([a-z])/g;function C(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var i=n.replace(x,C);y[i]=new E(i,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var i=n.replace(x,C);y[i]=new E(i,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var i=n.replace(x,C);y[i]=new E(i,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){y[n]=new E(n,1,!1,n.toLowerCase(),null,!1,!1)}),y.xlinkHref=new E("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){y[n]=new E(n,1,!1,n.toLowerCase(),null,!0,!0)});function A(n,i,a,c){var f=y.hasOwnProperty(i)?y[i]:null;(f!==null?f.type!==0:c||!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")&&(M(i,a,f,c)&&(a=null),c||f===null?v(i)&&(a===null?n.removeAttribute(i):n.setAttribute(i,""+a)):f.mustUseProperty?n[f.propertyName]=a===null?f.type===3?!1:"":a:(i=f.attributeName,c=f.attributeNamespace,a===null?n.removeAttribute(i):(f=f.type,a=f===3||f===4&&a===!0?"":""+a,c?n.setAttributeNS(c,i,a):n.setAttribute(i,a))))}var D=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,G=Symbol.for("react.element"),k=Symbol.for("react.portal"),I=Symbol.for("react.fragment"),z=Symbol.for("react.strict_mode"),ae=Symbol.for("react.profiler"),w=Symbol.for("react.provider"),P=Symbol.for("react.context"),K=Symbol.for("react.forward_ref"),Q=Symbol.for("react.suspense"),oe=Symbol.for("react.suspense_list"),he=Symbol.for("react.memo"),ne=Symbol.for("react.lazy"),le=Symbol.for("react.offscreen"),V=Symbol.iterator;function ue(n){return n===null||typeof n!="object"?null:(n=V&&n[V]||n["@@iterator"],typeof n=="function"?n:null)}var se=Object.assign,F;function ie(n){if(F===void 0)try{throw Error()}catch(a){var i=a.stack.trim().match(/\n( *(at )?)/);F=i&&i[1]||""}return`
`+F+n}var Fe=!1;function J(n,i){if(!n||Fe)return"";Fe=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(i)if(i=function(){throw Error()},Object.defineProperty(i.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(i,[])}catch(te){var c=te}Reflect.construct(n,[],i)}else{try{i.call()}catch(te){c=te}n.call(i.prototype)}else{try{throw Error()}catch(te){c=te}n()}}catch(te){if(te&&c&&typeof te.stack=="string"){for(var f=te.stack.split(`
`),_=c.stack.split(`
`),T=f.length-1,U=_.length-1;1<=T&&0<=U&&f[T]!==_[U];)U--;for(;1<=T&&0<=U;T--,U--)if(f[T]!==_[U]){if(T!==1||U!==1)do if(T--,U--,0>U||f[T]!==_[U]){var O=`
`+f[T].replace(" at new "," at ");return n.displayName&&O.includes("<anonymous>")&&(O=O.replace("<anonymous>",n.displayName)),O}while(1<=T&&0<=U);break}}}finally{Fe=!1,Error.prepareStackTrace=a}return(n=n?n.displayName||n.name:"")?ie(n):""}function ce(n){switch(n.tag){case 5:return ie(n.type);case 16:return ie("Lazy");case 13:return ie("Suspense");case 19:return ie("SuspenseList");case 0:case 2:case 15:return n=J(n.type,!1),n;case 11:return n=J(n.type.render,!1),n;case 1:return n=J(n.type,!0),n;default:return""}}function ye(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case I:return"Fragment";case k:return"Portal";case ae:return"Profiler";case z:return"StrictMode";case Q:return"Suspense";case oe:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case P:return(n.displayName||"Context")+".Consumer";case w:return(n._context.displayName||"Context")+".Provider";case K:var i=n.render;return n=n.displayName,n||(n=i.displayName||i.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case he:return i=n.displayName||null,i!==null?i:ye(n.type)||"Memo";case ne:i=n._payload,n=n._init;try{return ye(n(i))}catch{}}return null}function Se(n){var i=n.type;switch(n.tag){case 24:return"Cache";case 9:return(i.displayName||"Context")+".Consumer";case 10:return(i._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=i.render,n=n.displayName||n.name||"",i.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return i;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return ye(i);case 8:return i===z?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i}return null}function Pe(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function De(n){var i=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function rt(n){var i=De(n)?"checked":"value",a=Object.getOwnPropertyDescriptor(n.constructor.prototype,i),c=""+n[i];if(!n.hasOwnProperty(i)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var f=a.get,_=a.set;return Object.defineProperty(n,i,{configurable:!0,get:function(){return f.call(this)},set:function(T){c=""+T,_.call(this,T)}}),Object.defineProperty(n,i,{enumerable:a.enumerable}),{getValue:function(){return c},setValue:function(T){c=""+T},stopTracking:function(){n._valueTracker=null,delete n[i]}}}}function vt(n){n._valueTracker||(n._valueTracker=rt(n))}function ht(n){if(!n)return!1;var i=n._valueTracker;if(!i)return!0;var a=i.getValue(),c="";return n&&(c=De(n)?n.checked?"true":"false":n.value),n=c,n!==a?(i.setValue(n),!0):!1}function B(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function hn(n,i){var a=i.checked;return se({},i,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:a??n._wrapperState.initialChecked})}function dt(n,i){var a=i.defaultValue==null?"":i.defaultValue,c=i.checked!=null?i.checked:i.defaultChecked;a=Pe(i.value!=null?i.value:a),n._wrapperState={initialChecked:c,initialValue:a,controlled:i.type==="checkbox"||i.type==="radio"?i.checked!=null:i.value!=null}}function mt(n,i){i=i.checked,i!=null&&A(n,"checked",i,!1)}function et(n,i){mt(n,i);var a=Pe(i.value),c=i.type;if(a!=null)c==="number"?(a===0&&n.value===""||n.value!=a)&&(n.value=""+a):n.value!==""+a&&(n.value=""+a);else if(c==="submit"||c==="reset"){n.removeAttribute("value");return}i.hasOwnProperty("value")?nt(n,i.type,a):i.hasOwnProperty("defaultValue")&&nt(n,i.type,Pe(i.defaultValue)),i.checked==null&&i.defaultChecked!=null&&(n.defaultChecked=!!i.defaultChecked)}function Dt(n,i,a){if(i.hasOwnProperty("value")||i.hasOwnProperty("defaultValue")){var c=i.type;if(!(c!=="submit"&&c!=="reset"||i.value!==void 0&&i.value!==null))return;i=""+n._wrapperState.initialValue,a||i===n.value||(n.value=i),n.defaultValue=i}a=n.name,a!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,a!==""&&(n.name=a)}function nt(n,i,a){(i!=="number"||B(n.ownerDocument)!==n)&&(a==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+a&&(n.defaultValue=""+a))}var L=Array.isArray;function b(n,i,a,c){if(n=n.options,i){i={};for(var f=0;f<a.length;f++)i["$"+a[f]]=!0;for(a=0;a<n.length;a++)f=i.hasOwnProperty("$"+n[a].value),n[a].selected!==f&&(n[a].selected=f),f&&c&&(n[a].defaultSelected=!0)}else{for(a=""+Pe(a),i=null,f=0;f<n.length;f++){if(n[f].value===a){n[f].selected=!0,c&&(n[f].defaultSelected=!0);return}i!==null||n[f].disabled||(i=n[f])}i!==null&&(i.selected=!0)}}function $(n,i){if(i.dangerouslySetInnerHTML!=null)throw Error(t(91));return se({},i,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function fe(n,i){var a=i.value;if(a==null){if(a=i.children,i=i.defaultValue,a!=null){if(i!=null)throw Error(t(92));if(L(a)){if(1<a.length)throw Error(t(93));a=a[0]}i=a}i==null&&(i=""),a=i}n._wrapperState={initialValue:Pe(a)}}function ge(n,i){var a=Pe(i.value),c=Pe(i.defaultValue);a!=null&&(a=""+a,a!==n.value&&(n.value=a),i.defaultValue==null&&n.defaultValue!==a&&(n.defaultValue=a)),c!=null&&(n.defaultValue=""+c)}function de(n){var i=n.textContent;i===n._wrapperState.initialValue&&i!==""&&i!==null&&(n.value=i)}function Ke(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Ae(n,i){return n==null||n==="http://www.w3.org/1999/xhtml"?Ke(i):n==="http://www.w3.org/2000/svg"&&i==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var Oe,_t=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(i,a,c,f){MSApp.execUnsafeLocalFunction(function(){return n(i,a,c,f)})}:n})(function(n,i){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=i;else{for(Oe=Oe||document.createElement("div"),Oe.innerHTML="<svg>"+i.valueOf().toString()+"</svg>",i=Oe.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;i.firstChild;)n.appendChild(i.firstChild)}});function Me(n,i){if(i){var a=n.firstChild;if(a&&a===n.lastChild&&a.nodeType===3){a.nodeValue=i;return}}n.textContent=i}var Be={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},st=["Webkit","ms","Moz","O"];Object.keys(Be).forEach(function(n){st.forEach(function(i){i=i+n.charAt(0).toUpperCase()+n.substring(1),Be[i]=Be[n]})});function it(n,i,a){return i==null||typeof i=="boolean"||i===""?"":a||typeof i!="number"||i===0||Be.hasOwnProperty(n)&&Be[n]?(""+i).trim():i+"px"}function Ve(n,i){n=n.style;for(var a in i)if(i.hasOwnProperty(a)){var c=a.indexOf("--")===0,f=it(a,i[a],c);a==="float"&&(a="cssFloat"),c?n.setProperty(a,f):n[a]=f}}var ft=se({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function at(n,i){if(i){if(ft[n]&&(i.children!=null||i.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(i.dangerouslySetInnerHTML!=null){if(i.children!=null)throw Error(t(60));if(typeof i.dangerouslySetInnerHTML!="object"||!("__html"in i.dangerouslySetInnerHTML))throw Error(t(61))}if(i.style!=null&&typeof i.style!="object")throw Error(t(62))}}function bt(n,i){if(n.indexOf("-")===-1)return typeof i.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var W=null;function Le(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var re=null,pe=null,be=null;function Ue(n){if(n=Wo(n)){if(typeof re!="function")throw Error(t(280));var i=n.stateNode;i&&(i=Ka(i),re(n.stateNode,n.type,i))}}function pt(n){pe?be?be.push(n):be=[n]:pe=n}function Gt(){if(pe){var n=pe,i=be;if(be=pe=null,Ue(n),i)for(n=0;n<i.length;n++)Ue(i[n])}}function fn(n,i){return n(i)}function gt(){}var nn=!1;function Qn(n,i,a){if(nn)return n(i,a);nn=!0;try{return fn(n,i,a)}finally{nn=!1,(pe!==null||be!==null)&&(gt(),Gt())}}function sr(n,i){var a=n.stateNode;if(a===null)return null;var c=Ka(a);if(c===null)return null;a=c[i];e:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(c=!c.disabled)||(n=n.type,c=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!c;break e;default:n=!1}if(n)return null;if(a&&typeof a!="function")throw Error(t(231,i,typeof a));return a}var ms=!1;if(d)try{var Hn={};Object.defineProperty(Hn,"passive",{get:function(){ms=!0}}),window.addEventListener("test",Hn,Hn),window.removeEventListener("test",Hn,Hn)}catch{ms=!1}function To(n,i,a,c,f,_,T,U,O){var te=Array.prototype.slice.call(arguments,3);try{i.apply(a,te)}catch(_e){this.onError(_e)}}var or=!1,Br=null,Ui=!1,_s=null,gs={onError:function(n){or=!0,Br=n}};function Pa(n,i,a,c,f,_,T,U,O){or=!1,Br=null,To.apply(gs,arguments)}function Da(n,i,a,c,f,_,T,U,O){if(Pa.apply(this,arguments),or){if(or){var te=Br;or=!1,Br=null}else throw Error(t(198));Ui||(Ui=!0,_s=te)}}function ki(n){var i=n,a=n;if(n.alternate)for(;i.return;)i=i.return;else{n=i;do i=n,(i.flags&4098)!==0&&(a=i.return),n=i.return;while(n)}return i.tag===3?a:null}function La(n){if(n.tag===13){var i=n.memoizedState;if(i===null&&(n=n.alternate,n!==null&&(i=n.memoizedState)),i!==null)return i.dehydrated}return null}function Ia(n){if(ki(n)!==n)throw Error(t(188))}function R(n){var i=n.alternate;if(!i){if(i=ki(n),i===null)throw Error(t(188));return i!==n?null:n}for(var a=n,c=i;;){var f=a.return;if(f===null)break;var _=f.alternate;if(_===null){if(c=f.return,c!==null){a=c;continue}break}if(f.child===_.child){for(_=f.child;_;){if(_===a)return Ia(f),n;if(_===c)return Ia(f),i;_=_.sibling}throw Error(t(188))}if(a.return!==c.return)a=f,c=_;else{for(var T=!1,U=f.child;U;){if(U===a){T=!0,a=f,c=_;break}if(U===c){T=!0,c=f,a=_;break}U=U.sibling}if(!T){for(U=_.child;U;){if(U===a){T=!0,a=_,c=f;break}if(U===c){T=!0,c=_,a=f;break}U=U.sibling}if(!T)throw Error(t(189))}}if(a.alternate!==c)throw Error(t(190))}if(a.tag!==3)throw Error(t(188));return a.stateNode.current===a?n:i}function q(n){return n=R(n),n!==null?Z(n):null}function Z(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var i=Z(n);if(i!==null)return i;n=n.sibling}return null}var ee=e.unstable_scheduleCallback,X=e.unstable_cancelCallback,Ee=e.unstable_shouldYield,Ie=e.unstable_requestPaint,Te=e.unstable_now,Xe=e.unstable_getCurrentPriorityLevel,Je=e.unstable_ImmediatePriority,tt=e.unstable_UserBlockingPriority,je=e.unstable_NormalPriority,wt=e.unstable_LowPriority,Lt=e.unstable_IdlePriority,Nt=null,Vt=null;function xt(n){if(Vt&&typeof Vt.onCommitFiberRoot=="function")try{Vt.onCommitFiberRoot(Nt,n,void 0,(n.current.flags&128)===128)}catch{}}var ze=Math.clz32?Math.clz32:Gn,$t=Math.log,St=Math.LN2;function Gn(n){return n>>>=0,n===0?32:31-($t(n)/St|0)|0}var ci=64,rn=4194304;function Fi(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Ut(n,i){var a=n.pendingLanes;if(a===0)return 0;var c=0,f=n.suspendedLanes,_=n.pingedLanes,T=a&268435455;if(T!==0){var U=T&~f;U!==0?c=Fi(U):(_&=T,_!==0&&(c=Fi(_)))}else T=a&~f,T!==0?c=Fi(T):_!==0&&(c=Fi(_));if(c===0)return 0;if(i!==0&&i!==c&&(i&f)===0&&(f=c&-c,_=i&-i,f>=_||f===16&&(_&4194240)!==0))return i;if((c&4)!==0&&(c|=a&16),i=n.entangledLanes,i!==0)for(n=n.entanglements,i&=c;0<i;)a=31-ze(i),f=1<<a,c|=n[a],i&=~f;return c}function Ti(n,i){switch(n){case 1:case 2:case 4:return i+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ao(n,i){for(var a=n.suspendedLanes,c=n.pingedLanes,f=n.expirationTimes,_=n.pendingLanes;0<_;){var T=31-ze(_),U=1<<T,O=f[T];O===-1?((U&a)===0||(U&c)!==0)&&(f[T]=Ti(U,i)):O<=i&&(n.expiredLanes|=U),_&=~U}}function yn(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function vs(){var n=ci;return ci<<=1,(ci&4194240)===0&&(ci=64),n}function bo(n){for(var i=[],a=0;31>a;a++)i.push(n);return i}function ar(n,i,a){n.pendingLanes|=i,i!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,i=31-ze(i),n[i]=a}function Z0(n,i){var a=n.pendingLanes&~i;n.pendingLanes=i,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=i,n.mutableReadLanes&=i,n.entangledLanes&=i,i=n.entanglements;var c=n.eventTimes;for(n=n.expirationTimes;0<a;){var f=31-ze(a),_=1<<f;i[f]=0,c[f]=-1,n[f]=-1,a&=~_}}function Dc(n,i){var a=n.entangledLanes|=i;for(n=n.entanglements;a;){var c=31-ze(a),f=1<<c;f&i|n[c]&i&&(n[c]|=i),a&=~f}}var Rt=0;function yf(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var xf,Lc,Sf,Mf,wf,Ic=!1,Na=[],lr=null,cr=null,ur=null,Co=new Map,Ro=new Map,dr=[],eg="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Ef(n,i){switch(n){case"focusin":case"focusout":lr=null;break;case"dragenter":case"dragleave":cr=null;break;case"mouseover":case"mouseout":ur=null;break;case"pointerover":case"pointerout":Co.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":Ro.delete(i.pointerId)}}function Po(n,i,a,c,f,_){return n===null||n.nativeEvent!==_?(n={blockedOn:i,domEventName:a,eventSystemFlags:c,nativeEvent:_,targetContainers:[f]},i!==null&&(i=Wo(i),i!==null&&Lc(i)),n):(n.eventSystemFlags|=c,i=n.targetContainers,f!==null&&i.indexOf(f)===-1&&i.push(f),n)}function tg(n,i,a,c,f){switch(i){case"focusin":return lr=Po(lr,n,i,a,c,f),!0;case"dragenter":return cr=Po(cr,n,i,a,c,f),!0;case"mouseover":return ur=Po(ur,n,i,a,c,f),!0;case"pointerover":var _=f.pointerId;return Co.set(_,Po(Co.get(_)||null,n,i,a,c,f)),!0;case"gotpointercapture":return _=f.pointerId,Ro.set(_,Po(Ro.get(_)||null,n,i,a,c,f)),!0}return!1}function Tf(n){var i=zr(n.target);if(i!==null){var a=ki(i);if(a!==null){if(i=a.tag,i===13){if(i=La(a),i!==null){n.blockedOn=i,wf(n.priority,function(){Sf(a)});return}}else if(i===3&&a.stateNode.current.memoizedState.isDehydrated){n.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Ua(n){if(n.blockedOn!==null)return!1;for(var i=n.targetContainers;0<i.length;){var a=Uc(n.domEventName,n.eventSystemFlags,i[0],n.nativeEvent);if(a===null){a=n.nativeEvent;var c=new a.constructor(a.type,a);W=c,a.target.dispatchEvent(c),W=null}else return i=Wo(a),i!==null&&Lc(i),n.blockedOn=a,!1;i.shift()}return!0}function Af(n,i,a){Ua(n)&&a.delete(i)}function ng(){Ic=!1,lr!==null&&Ua(lr)&&(lr=null),cr!==null&&Ua(cr)&&(cr=null),ur!==null&&Ua(ur)&&(ur=null),Co.forEach(Af),Ro.forEach(Af)}function Do(n,i){n.blockedOn===i&&(n.blockedOn=null,Ic||(Ic=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,ng)))}function Lo(n){function i(f){return Do(f,n)}if(0<Na.length){Do(Na[0],n);for(var a=1;a<Na.length;a++){var c=Na[a];c.blockedOn===n&&(c.blockedOn=null)}}for(lr!==null&&Do(lr,n),cr!==null&&Do(cr,n),ur!==null&&Do(ur,n),Co.forEach(i),Ro.forEach(i),a=0;a<dr.length;a++)c=dr[a],c.blockedOn===n&&(c.blockedOn=null);for(;0<dr.length&&(a=dr[0],a.blockedOn===null);)Tf(a),a.blockedOn===null&&dr.shift()}var ys=D.ReactCurrentBatchConfig,ka=!0;function ig(n,i,a,c){var f=Rt,_=ys.transition;ys.transition=null;try{Rt=1,Nc(n,i,a,c)}finally{Rt=f,ys.transition=_}}function rg(n,i,a,c){var f=Rt,_=ys.transition;ys.transition=null;try{Rt=4,Nc(n,i,a,c)}finally{Rt=f,ys.transition=_}}function Nc(n,i,a,c){if(ka){var f=Uc(n,i,a,c);if(f===null)Jc(n,i,c,Fa,a),Ef(n,c);else if(tg(f,n,i,a,c))c.stopPropagation();else if(Ef(n,c),i&4&&-1<eg.indexOf(n)){for(;f!==null;){var _=Wo(f);if(_!==null&&xf(_),_=Uc(n,i,a,c),_===null&&Jc(n,i,c,Fa,a),_===f)break;f=_}f!==null&&c.stopPropagation()}else Jc(n,i,c,null,a)}}var Fa=null;function Uc(n,i,a,c){if(Fa=null,n=Le(c),n=zr(n),n!==null)if(i=ki(n),i===null)n=null;else if(a=i.tag,a===13){if(n=La(i),n!==null)return n;n=null}else if(a===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;n=null}else i!==n&&(n=null);return Fa=n,null}function bf(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Xe()){case Je:return 1;case tt:return 4;case je:case wt:return 16;case Lt:return 536870912;default:return 16}default:return 16}}var hr=null,kc=null,Oa=null;function Cf(){if(Oa)return Oa;var n,i=kc,a=i.length,c,f="value"in hr?hr.value:hr.textContent,_=f.length;for(n=0;n<a&&i[n]===f[n];n++);var T=a-n;for(c=1;c<=T&&i[a-c]===f[_-c];c++);return Oa=f.slice(n,1<c?1-c:void 0)}function Ba(n){var i=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&i===13&&(n=13)):n=i,n===10&&(n=13),32<=n||n===13?n:0}function za(){return!0}function Rf(){return!1}function Wn(n){function i(a,c,f,_,T){this._reactName=a,this._targetInst=f,this.type=c,this.nativeEvent=_,this.target=T,this.currentTarget=null;for(var U in n)n.hasOwnProperty(U)&&(a=n[U],this[U]=a?a(_):_[U]);return this.isDefaultPrevented=(_.defaultPrevented!=null?_.defaultPrevented:_.returnValue===!1)?za:Rf,this.isPropagationStopped=Rf,this}return se(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=za)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=za)},persist:function(){},isPersistent:za}),i}var xs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Fc=Wn(xs),Io=se({},xs,{view:0,detail:0}),sg=Wn(Io),Oc,Bc,No,Va=se({},Io,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Vc,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==No&&(No&&n.type==="mousemove"?(Oc=n.screenX-No.screenX,Bc=n.screenY-No.screenY):Bc=Oc=0,No=n),Oc)},movementY:function(n){return"movementY"in n?n.movementY:Bc}}),Pf=Wn(Va),og=se({},Va,{dataTransfer:0}),ag=Wn(og),lg=se({},Io,{relatedTarget:0}),zc=Wn(lg),cg=se({},xs,{animationName:0,elapsedTime:0,pseudoElement:0}),ug=Wn(cg),dg=se({},xs,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),hg=Wn(dg),fg=se({},xs,{data:0}),Df=Wn(fg),pg={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},mg={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},_g={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function gg(n){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(n):(n=_g[n])?!!i[n]:!1}function Vc(){return gg}var vg=se({},Io,{key:function(n){if(n.key){var i=pg[n.key]||n.key;if(i!=="Unidentified")return i}return n.type==="keypress"?(n=Ba(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?mg[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Vc,charCode:function(n){return n.type==="keypress"?Ba(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Ba(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),yg=Wn(vg),xg=se({},Va,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Lf=Wn(xg),Sg=se({},Io,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Vc}),Mg=Wn(Sg),wg=se({},xs,{propertyName:0,elapsedTime:0,pseudoElement:0}),Eg=Wn(wg),Tg=se({},Va,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),Ag=Wn(Tg),bg=[9,13,27,32],Hc=d&&"CompositionEvent"in window,Uo=null;d&&"documentMode"in document&&(Uo=document.documentMode);var Cg=d&&"TextEvent"in window&&!Uo,If=d&&(!Hc||Uo&&8<Uo&&11>=Uo),Nf=" ",Uf=!1;function kf(n,i){switch(n){case"keyup":return bg.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ff(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var Ss=!1;function Rg(n,i){switch(n){case"compositionend":return Ff(i);case"keypress":return i.which!==32?null:(Uf=!0,Nf);case"textInput":return n=i.data,n===Nf&&Uf?null:n;default:return null}}function Pg(n,i){if(Ss)return n==="compositionend"||!Hc&&kf(n,i)?(n=Cf(),Oa=kc=hr=null,Ss=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return If&&i.locale!=="ko"?null:i.data;default:return null}}var Dg={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Of(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i==="input"?!!Dg[n.type]:i==="textarea"}function Bf(n,i,a,c){pt(c),i=Xa(i,"onChange"),0<i.length&&(a=new Fc("onChange","change",null,a,c),n.push({event:a,listeners:i}))}var ko=null,Fo=null;function Lg(n){ip(n,0)}function Ha(n){var i=As(n);if(ht(i))return n}function Ig(n,i){if(n==="change")return i}var zf=!1;if(d){var Gc;if(d){var Wc="oninput"in document;if(!Wc){var Vf=document.createElement("div");Vf.setAttribute("oninput","return;"),Wc=typeof Vf.oninput=="function"}Gc=Wc}else Gc=!1;zf=Gc&&(!document.documentMode||9<document.documentMode)}function Hf(){ko&&(ko.detachEvent("onpropertychange",Gf),Fo=ko=null)}function Gf(n){if(n.propertyName==="value"&&Ha(Fo)){var i=[];Bf(i,Fo,n,Le(n)),Qn(Lg,i)}}function Ng(n,i,a){n==="focusin"?(Hf(),ko=i,Fo=a,ko.attachEvent("onpropertychange",Gf)):n==="focusout"&&Hf()}function Ug(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return Ha(Fo)}function kg(n,i){if(n==="click")return Ha(i)}function Fg(n,i){if(n==="input"||n==="change")return Ha(i)}function Og(n,i){return n===i&&(n!==0||1/n===1/i)||n!==n&&i!==i}var ui=typeof Object.is=="function"?Object.is:Og;function Oo(n,i){if(ui(n,i))return!0;if(typeof n!="object"||n===null||typeof i!="object"||i===null)return!1;var a=Object.keys(n),c=Object.keys(i);if(a.length!==c.length)return!1;for(c=0;c<a.length;c++){var f=a[c];if(!h.call(i,f)||!ui(n[f],i[f]))return!1}return!0}function Wf(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function qf(n,i){var a=Wf(n);n=0;for(var c;a;){if(a.nodeType===3){if(c=n+a.textContent.length,n<=i&&c>=i)return{node:a,offset:i-n};n=c}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Wf(a)}}function Xf(n,i){return n&&i?n===i?!0:n&&n.nodeType===3?!1:i&&i.nodeType===3?Xf(n,i.parentNode):"contains"in n?n.contains(i):n.compareDocumentPosition?!!(n.compareDocumentPosition(i)&16):!1:!1}function jf(){for(var n=window,i=B();i instanceof n.HTMLIFrameElement;){try{var a=typeof i.contentWindow.location.href=="string"}catch{a=!1}if(a)n=i.contentWindow;else break;i=B(n.document)}return i}function qc(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i&&(i==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||i==="textarea"||n.contentEditable==="true")}function Bg(n){var i=jf(),a=n.focusedElem,c=n.selectionRange;if(i!==a&&a&&a.ownerDocument&&Xf(a.ownerDocument.documentElement,a)){if(c!==null&&qc(a)){if(i=c.start,n=c.end,n===void 0&&(n=i),"selectionStart"in a)a.selectionStart=i,a.selectionEnd=Math.min(n,a.value.length);else if(n=(i=a.ownerDocument||document)&&i.defaultView||window,n.getSelection){n=n.getSelection();var f=a.textContent.length,_=Math.min(c.start,f);c=c.end===void 0?_:Math.min(c.end,f),!n.extend&&_>c&&(f=c,c=_,_=f),f=qf(a,_);var T=qf(a,c);f&&T&&(n.rangeCount!==1||n.anchorNode!==f.node||n.anchorOffset!==f.offset||n.focusNode!==T.node||n.focusOffset!==T.offset)&&(i=i.createRange(),i.setStart(f.node,f.offset),n.removeAllRanges(),_>c?(n.addRange(i),n.extend(T.node,T.offset)):(i.setEnd(T.node,T.offset),n.addRange(i)))}}for(i=[],n=a;n=n.parentNode;)n.nodeType===1&&i.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof a.focus=="function"&&a.focus(),a=0;a<i.length;a++)n=i[a],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var zg=d&&"documentMode"in document&&11>=document.documentMode,Ms=null,Xc=null,Bo=null,jc=!1;function Yf(n,i,a){var c=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;jc||Ms==null||Ms!==B(c)||(c=Ms,"selectionStart"in c&&qc(c)?c={start:c.selectionStart,end:c.selectionEnd}:(c=(c.ownerDocument&&c.ownerDocument.defaultView||window).getSelection(),c={anchorNode:c.anchorNode,anchorOffset:c.anchorOffset,focusNode:c.focusNode,focusOffset:c.focusOffset}),Bo&&Oo(Bo,c)||(Bo=c,c=Xa(Xc,"onSelect"),0<c.length&&(i=new Fc("onSelect","select",null,i,a),n.push({event:i,listeners:c}),i.target=Ms)))}function Ga(n,i){var a={};return a[n.toLowerCase()]=i.toLowerCase(),a["Webkit"+n]="webkit"+i,a["Moz"+n]="moz"+i,a}var ws={animationend:Ga("Animation","AnimationEnd"),animationiteration:Ga("Animation","AnimationIteration"),animationstart:Ga("Animation","AnimationStart"),transitionend:Ga("Transition","TransitionEnd")},Yc={},Kf={};d&&(Kf=document.createElement("div").style,"AnimationEvent"in window||(delete ws.animationend.animation,delete ws.animationiteration.animation,delete ws.animationstart.animation),"TransitionEvent"in window||delete ws.transitionend.transition);function Wa(n){if(Yc[n])return Yc[n];if(!ws[n])return n;var i=ws[n],a;for(a in i)if(i.hasOwnProperty(a)&&a in Kf)return Yc[n]=i[a];return n}var $f=Wa("animationend"),Qf=Wa("animationiteration"),Jf=Wa("animationstart"),Zf=Wa("transitionend"),ep=new Map,tp="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function fr(n,i){ep.set(n,i),l(i,[n])}for(var Kc=0;Kc<tp.length;Kc++){var $c=tp[Kc],Vg=$c.toLowerCase(),Hg=$c[0].toUpperCase()+$c.slice(1);fr(Vg,"on"+Hg)}fr($f,"onAnimationEnd"),fr(Qf,"onAnimationIteration"),fr(Jf,"onAnimationStart"),fr("dblclick","onDoubleClick"),fr("focusin","onFocus"),fr("focusout","onBlur"),fr(Zf,"onTransitionEnd"),u("onMouseEnter",["mouseout","mouseover"]),u("onMouseLeave",["mouseout","mouseover"]),u("onPointerEnter",["pointerout","pointerover"]),u("onPointerLeave",["pointerout","pointerover"]),l("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),l("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),l("onBeforeInput",["compositionend","keypress","textInput","paste"]),l("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var zo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Gg=new Set("cancel close invalid load scroll toggle".split(" ").concat(zo));function np(n,i,a){var c=n.type||"unknown-event";n.currentTarget=a,Da(c,i,void 0,n),n.currentTarget=null}function ip(n,i){i=(i&4)!==0;for(var a=0;a<n.length;a++){var c=n[a],f=c.event;c=c.listeners;e:{var _=void 0;if(i)for(var T=c.length-1;0<=T;T--){var U=c[T],O=U.instance,te=U.currentTarget;if(U=U.listener,O!==_&&f.isPropagationStopped())break e;np(f,U,te),_=O}else for(T=0;T<c.length;T++){if(U=c[T],O=U.instance,te=U.currentTarget,U=U.listener,O!==_&&f.isPropagationStopped())break e;np(f,U,te),_=O}}}if(Ui)throw n=_s,Ui=!1,_s=null,n}function Bt(n,i){var a=i[ru];a===void 0&&(a=i[ru]=new Set);var c=n+"__bubble";a.has(c)||(rp(i,n,2,!1),a.add(c))}function Qc(n,i,a){var c=0;i&&(c|=4),rp(a,n,c,i)}var qa="_reactListening"+Math.random().toString(36).slice(2);function Vo(n){if(!n[qa]){n[qa]=!0,r.forEach(function(a){a!=="selectionchange"&&(Gg.has(a)||Qc(a,!1,n),Qc(a,!0,n))});var i=n.nodeType===9?n:n.ownerDocument;i===null||i[qa]||(i[qa]=!0,Qc("selectionchange",!1,i))}}function rp(n,i,a,c){switch(bf(i)){case 1:var f=ig;break;case 4:f=rg;break;default:f=Nc}a=f.bind(null,i,a,n),f=void 0,!ms||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(f=!0),c?f!==void 0?n.addEventListener(i,a,{capture:!0,passive:f}):n.addEventListener(i,a,!0):f!==void 0?n.addEventListener(i,a,{passive:f}):n.addEventListener(i,a,!1)}function Jc(n,i,a,c,f){var _=c;if((i&1)===0&&(i&2)===0&&c!==null)e:for(;;){if(c===null)return;var T=c.tag;if(T===3||T===4){var U=c.stateNode.containerInfo;if(U===f||U.nodeType===8&&U.parentNode===f)break;if(T===4)for(T=c.return;T!==null;){var O=T.tag;if((O===3||O===4)&&(O=T.stateNode.containerInfo,O===f||O.nodeType===8&&O.parentNode===f))return;T=T.return}for(;U!==null;){if(T=zr(U),T===null)return;if(O=T.tag,O===5||O===6){c=_=T;continue e}U=U.parentNode}}c=c.return}Qn(function(){var te=_,_e=Le(a),ve=[];e:{var me=ep.get(n);if(me!==void 0){var ke=Fc,Ge=n;switch(n){case"keypress":if(Ba(a)===0)break e;case"keydown":case"keyup":ke=yg;break;case"focusin":Ge="focus",ke=zc;break;case"focusout":Ge="blur",ke=zc;break;case"beforeblur":case"afterblur":ke=zc;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":ke=Pf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":ke=ag;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":ke=Mg;break;case $f:case Qf:case Jf:ke=ug;break;case Zf:ke=Eg;break;case"scroll":ke=sg;break;case"wheel":ke=Ag;break;case"copy":case"cut":case"paste":ke=hg;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":ke=Lf}var qe=(i&4)!==0,jt=!qe&&n==="scroll",j=qe?me!==null?me+"Capture":null:me;qe=[];for(var H=te,Y;H!==null;){Y=H;var we=Y.stateNode;if(Y.tag===5&&we!==null&&(Y=we,j!==null&&(we=sr(H,j),we!=null&&qe.push(Ho(H,we,Y)))),jt)break;H=H.return}0<qe.length&&(me=new ke(me,Ge,null,a,_e),ve.push({event:me,listeners:qe}))}}if((i&7)===0){e:{if(me=n==="mouseover"||n==="pointerover",ke=n==="mouseout"||n==="pointerout",me&&a!==W&&(Ge=a.relatedTarget||a.fromElement)&&(zr(Ge)||Ge[Oi]))break e;if((ke||me)&&(me=_e.window===_e?_e:(me=_e.ownerDocument)?me.defaultView||me.parentWindow:window,ke?(Ge=a.relatedTarget||a.toElement,ke=te,Ge=Ge?zr(Ge):null,Ge!==null&&(jt=ki(Ge),Ge!==jt||Ge.tag!==5&&Ge.tag!==6)&&(Ge=null)):(ke=null,Ge=te),ke!==Ge)){if(qe=Pf,we="onMouseLeave",j="onMouseEnter",H="mouse",(n==="pointerout"||n==="pointerover")&&(qe=Lf,we="onPointerLeave",j="onPointerEnter",H="pointer"),jt=ke==null?me:As(ke),Y=Ge==null?me:As(Ge),me=new qe(we,H+"leave",ke,a,_e),me.target=jt,me.relatedTarget=Y,we=null,zr(_e)===te&&(qe=new qe(j,H+"enter",Ge,a,_e),qe.target=Y,qe.relatedTarget=jt,we=qe),jt=we,ke&&Ge)t:{for(qe=ke,j=Ge,H=0,Y=qe;Y;Y=Es(Y))H++;for(Y=0,we=j;we;we=Es(we))Y++;for(;0<H-Y;)qe=Es(qe),H--;for(;0<Y-H;)j=Es(j),Y--;for(;H--;){if(qe===j||j!==null&&qe===j.alternate)break t;qe=Es(qe),j=Es(j)}qe=null}else qe=null;ke!==null&&sp(ve,me,ke,qe,!1),Ge!==null&&jt!==null&&sp(ve,jt,Ge,qe,!0)}}e:{if(me=te?As(te):window,ke=me.nodeName&&me.nodeName.toLowerCase(),ke==="select"||ke==="input"&&me.type==="file")var Ye=Ig;else if(Of(me))if(zf)Ye=Fg;else{Ye=Ug;var $e=Ng}else(ke=me.nodeName)&&ke.toLowerCase()==="input"&&(me.type==="checkbox"||me.type==="radio")&&(Ye=kg);if(Ye&&(Ye=Ye(n,te))){Bf(ve,Ye,a,_e);break e}$e&&$e(n,me,te),n==="focusout"&&($e=me._wrapperState)&&$e.controlled&&me.type==="number"&&nt(me,"number",me.value)}switch($e=te?As(te):window,n){case"focusin":(Of($e)||$e.contentEditable==="true")&&(Ms=$e,Xc=te,Bo=null);break;case"focusout":Bo=Xc=Ms=null;break;case"mousedown":jc=!0;break;case"contextmenu":case"mouseup":case"dragend":jc=!1,Yf(ve,a,_e);break;case"selectionchange":if(zg)break;case"keydown":case"keyup":Yf(ve,a,_e)}var Qe;if(Hc)e:{switch(n){case"compositionstart":var ot="onCompositionStart";break e;case"compositionend":ot="onCompositionEnd";break e;case"compositionupdate":ot="onCompositionUpdate";break e}ot=void 0}else Ss?kf(n,a)&&(ot="onCompositionEnd"):n==="keydown"&&a.keyCode===229&&(ot="onCompositionStart");ot&&(If&&a.locale!=="ko"&&(Ss||ot!=="onCompositionStart"?ot==="onCompositionEnd"&&Ss&&(Qe=Cf()):(hr=_e,kc="value"in hr?hr.value:hr.textContent,Ss=!0)),$e=Xa(te,ot),0<$e.length&&(ot=new Df(ot,n,null,a,_e),ve.push({event:ot,listeners:$e}),Qe?ot.data=Qe:(Qe=Ff(a),Qe!==null&&(ot.data=Qe)))),(Qe=Cg?Rg(n,a):Pg(n,a))&&(te=Xa(te,"onBeforeInput"),0<te.length&&(_e=new Df("onBeforeInput","beforeinput",null,a,_e),ve.push({event:_e,listeners:te}),_e.data=Qe))}ip(ve,i)})}function Ho(n,i,a){return{instance:n,listener:i,currentTarget:a}}function Xa(n,i){for(var a=i+"Capture",c=[];n!==null;){var f=n,_=f.stateNode;f.tag===5&&_!==null&&(f=_,_=sr(n,a),_!=null&&c.unshift(Ho(n,_,f)),_=sr(n,i),_!=null&&c.push(Ho(n,_,f))),n=n.return}return c}function Es(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function sp(n,i,a,c,f){for(var _=i._reactName,T=[];a!==null&&a!==c;){var U=a,O=U.alternate,te=U.stateNode;if(O!==null&&O===c)break;U.tag===5&&te!==null&&(U=te,f?(O=sr(a,_),O!=null&&T.unshift(Ho(a,O,U))):f||(O=sr(a,_),O!=null&&T.push(Ho(a,O,U)))),a=a.return}T.length!==0&&n.push({event:i,listeners:T})}var Wg=/\r\n?/g,qg=/\u0000|\uFFFD/g;function op(n){return(typeof n=="string"?n:""+n).replace(Wg,`
`).replace(qg,"")}function ja(n,i,a){if(i=op(i),op(n)!==i&&a)throw Error(t(425))}function Ya(){}var Zc=null,eu=null;function tu(n,i){return n==="textarea"||n==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var nu=typeof setTimeout=="function"?setTimeout:void 0,Xg=typeof clearTimeout=="function"?clearTimeout:void 0,ap=typeof Promise=="function"?Promise:void 0,jg=typeof queueMicrotask=="function"?queueMicrotask:typeof ap<"u"?function(n){return ap.resolve(null).then(n).catch(Yg)}:nu;function Yg(n){setTimeout(function(){throw n})}function iu(n,i){var a=i,c=0;do{var f=a.nextSibling;if(n.removeChild(a),f&&f.nodeType===8)if(a=f.data,a==="/$"){if(c===0){n.removeChild(f),Lo(i);return}c--}else a!=="$"&&a!=="$?"&&a!=="$!"||c++;a=f}while(a);Lo(i)}function pr(n){for(;n!=null;n=n.nextSibling){var i=n.nodeType;if(i===1||i===3)break;if(i===8){if(i=n.data,i==="$"||i==="$!"||i==="$?")break;if(i==="/$")return null}}return n}function lp(n){n=n.previousSibling;for(var i=0;n;){if(n.nodeType===8){var a=n.data;if(a==="$"||a==="$!"||a==="$?"){if(i===0)return n;i--}else a==="/$"&&i++}n=n.previousSibling}return null}var Ts=Math.random().toString(36).slice(2),Ai="__reactFiber$"+Ts,Go="__reactProps$"+Ts,Oi="__reactContainer$"+Ts,ru="__reactEvents$"+Ts,Kg="__reactListeners$"+Ts,$g="__reactHandles$"+Ts;function zr(n){var i=n[Ai];if(i)return i;for(var a=n.parentNode;a;){if(i=a[Oi]||a[Ai]){if(a=i.alternate,i.child!==null||a!==null&&a.child!==null)for(n=lp(n);n!==null;){if(a=n[Ai])return a;n=lp(n)}return i}n=a,a=n.parentNode}return null}function Wo(n){return n=n[Ai]||n[Oi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function As(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function Ka(n){return n[Go]||null}var su=[],bs=-1;function mr(n){return{current:n}}function zt(n){0>bs||(n.current=su[bs],su[bs]=null,bs--)}function kt(n,i){bs++,su[bs]=n.current,n.current=i}var _r={},xn=mr(_r),Un=mr(!1),Vr=_r;function Cs(n,i){var a=n.type.contextTypes;if(!a)return _r;var c=n.stateNode;if(c&&c.__reactInternalMemoizedUnmaskedChildContext===i)return c.__reactInternalMemoizedMaskedChildContext;var f={},_;for(_ in a)f[_]=i[_];return c&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=i,n.__reactInternalMemoizedMaskedChildContext=f),f}function kn(n){return n=n.childContextTypes,n!=null}function $a(){zt(Un),zt(xn)}function cp(n,i,a){if(xn.current!==_r)throw Error(t(168));kt(xn,i),kt(Un,a)}function up(n,i,a){var c=n.stateNode;if(i=i.childContextTypes,typeof c.getChildContext!="function")return a;c=c.getChildContext();for(var f in c)if(!(f in i))throw Error(t(108,Se(n)||"Unknown",f));return se({},a,c)}function Qa(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||_r,Vr=xn.current,kt(xn,n),kt(Un,Un.current),!0}function dp(n,i,a){var c=n.stateNode;if(!c)throw Error(t(169));a?(n=up(n,i,Vr),c.__reactInternalMemoizedMergedChildContext=n,zt(Un),zt(xn),kt(xn,n)):zt(Un),kt(Un,a)}var Bi=null,Ja=!1,ou=!1;function hp(n){Bi===null?Bi=[n]:Bi.push(n)}function Qg(n){Ja=!0,hp(n)}function gr(){if(!ou&&Bi!==null){ou=!0;var n=0,i=Rt;try{var a=Bi;for(Rt=1;n<a.length;n++){var c=a[n];do c=c(!0);while(c!==null)}Bi=null,Ja=!1}catch(f){throw Bi!==null&&(Bi=Bi.slice(n+1)),ee(Je,gr),f}finally{Rt=i,ou=!1}}return null}var Rs=[],Ps=0,Za=null,el=0,Jn=[],Zn=0,Hr=null,zi=1,Vi="";function Gr(n,i){Rs[Ps++]=el,Rs[Ps++]=Za,Za=n,el=i}function fp(n,i,a){Jn[Zn++]=zi,Jn[Zn++]=Vi,Jn[Zn++]=Hr,Hr=n;var c=zi;n=Vi;var f=32-ze(c)-1;c&=~(1<<f),a+=1;var _=32-ze(i)+f;if(30<_){var T=f-f%5;_=(c&(1<<T)-1).toString(32),c>>=T,f-=T,zi=1<<32-ze(i)+f|a<<f|c,Vi=_+n}else zi=1<<_|a<<f|c,Vi=n}function au(n){n.return!==null&&(Gr(n,1),fp(n,1,0))}function lu(n){for(;n===Za;)Za=Rs[--Ps],Rs[Ps]=null,el=Rs[--Ps],Rs[Ps]=null;for(;n===Hr;)Hr=Jn[--Zn],Jn[Zn]=null,Vi=Jn[--Zn],Jn[Zn]=null,zi=Jn[--Zn],Jn[Zn]=null}var qn=null,Xn=null,Ht=!1,di=null;function pp(n,i){var a=ii(5,null,null,0);a.elementType="DELETED",a.stateNode=i,a.return=n,i=n.deletions,i===null?(n.deletions=[a],n.flags|=16):i.push(a)}function mp(n,i){switch(n.tag){case 5:var a=n.type;return i=i.nodeType!==1||a.toLowerCase()!==i.nodeName.toLowerCase()?null:i,i!==null?(n.stateNode=i,qn=n,Xn=pr(i.firstChild),!0):!1;case 6:return i=n.pendingProps===""||i.nodeType!==3?null:i,i!==null?(n.stateNode=i,qn=n,Xn=null,!0):!1;case 13:return i=i.nodeType!==8?null:i,i!==null?(a=Hr!==null?{id:zi,overflow:Vi}:null,n.memoizedState={dehydrated:i,treeContext:a,retryLane:1073741824},a=ii(18,null,null,0),a.stateNode=i,a.return=n,n.child=a,qn=n,Xn=null,!0):!1;default:return!1}}function cu(n){return(n.mode&1)!==0&&(n.flags&128)===0}function uu(n){if(Ht){var i=Xn;if(i){var a=i;if(!mp(n,i)){if(cu(n))throw Error(t(418));i=pr(a.nextSibling);var c=qn;i&&mp(n,i)?pp(c,a):(n.flags=n.flags&-4097|2,Ht=!1,qn=n)}}else{if(cu(n))throw Error(t(418));n.flags=n.flags&-4097|2,Ht=!1,qn=n}}}function _p(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;qn=n}function tl(n){if(n!==qn)return!1;if(!Ht)return _p(n),Ht=!0,!1;var i;if((i=n.tag!==3)&&!(i=n.tag!==5)&&(i=n.type,i=i!=="head"&&i!=="body"&&!tu(n.type,n.memoizedProps)),i&&(i=Xn)){if(cu(n))throw gp(),Error(t(418));for(;i;)pp(n,i),i=pr(i.nextSibling)}if(_p(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,i=0;n;){if(n.nodeType===8){var a=n.data;if(a==="/$"){if(i===0){Xn=pr(n.nextSibling);break e}i--}else a!=="$"&&a!=="$!"&&a!=="$?"||i++}n=n.nextSibling}Xn=null}}else Xn=qn?pr(n.stateNode.nextSibling):null;return!0}function gp(){for(var n=Xn;n;)n=pr(n.nextSibling)}function Ds(){Xn=qn=null,Ht=!1}function du(n){di===null?di=[n]:di.push(n)}var Jg=D.ReactCurrentBatchConfig;function qo(n,i,a){if(n=a.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(a._owner){if(a=a._owner,a){if(a.tag!==1)throw Error(t(309));var c=a.stateNode}if(!c)throw Error(t(147,n));var f=c,_=""+n;return i!==null&&i.ref!==null&&typeof i.ref=="function"&&i.ref._stringRef===_?i.ref:(i=function(T){var U=f.refs;T===null?delete U[_]:U[_]=T},i._stringRef=_,i)}if(typeof n!="string")throw Error(t(284));if(!a._owner)throw Error(t(290,n))}return n}function nl(n,i){throw n=Object.prototype.toString.call(i),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":n))}function vp(n){var i=n._init;return i(n._payload)}function yp(n){function i(j,H){if(n){var Y=j.deletions;Y===null?(j.deletions=[H],j.flags|=16):Y.push(H)}}function a(j,H){if(!n)return null;for(;H!==null;)i(j,H),H=H.sibling;return null}function c(j,H){for(j=new Map;H!==null;)H.key!==null?j.set(H.key,H):j.set(H.index,H),H=H.sibling;return j}function f(j,H){return j=Tr(j,H),j.index=0,j.sibling=null,j}function _(j,H,Y){return j.index=Y,n?(Y=j.alternate,Y!==null?(Y=Y.index,Y<H?(j.flags|=2,H):Y):(j.flags|=2,H)):(j.flags|=1048576,H)}function T(j){return n&&j.alternate===null&&(j.flags|=2),j}function U(j,H,Y,we){return H===null||H.tag!==6?(H=nd(Y,j.mode,we),H.return=j,H):(H=f(H,Y),H.return=j,H)}function O(j,H,Y,we){var Ye=Y.type;return Ye===I?_e(j,H,Y.props.children,we,Y.key):H!==null&&(H.elementType===Ye||typeof Ye=="object"&&Ye!==null&&Ye.$$typeof===ne&&vp(Ye)===H.type)?(we=f(H,Y.props),we.ref=qo(j,H,Y),we.return=j,we):(we=Al(Y.type,Y.key,Y.props,null,j.mode,we),we.ref=qo(j,H,Y),we.return=j,we)}function te(j,H,Y,we){return H===null||H.tag!==4||H.stateNode.containerInfo!==Y.containerInfo||H.stateNode.implementation!==Y.implementation?(H=id(Y,j.mode,we),H.return=j,H):(H=f(H,Y.children||[]),H.return=j,H)}function _e(j,H,Y,we,Ye){return H===null||H.tag!==7?(H=Qr(Y,j.mode,we,Ye),H.return=j,H):(H=f(H,Y),H.return=j,H)}function ve(j,H,Y){if(typeof H=="string"&&H!==""||typeof H=="number")return H=nd(""+H,j.mode,Y),H.return=j,H;if(typeof H=="object"&&H!==null){switch(H.$$typeof){case G:return Y=Al(H.type,H.key,H.props,null,j.mode,Y),Y.ref=qo(j,null,H),Y.return=j,Y;case k:return H=id(H,j.mode,Y),H.return=j,H;case ne:var we=H._init;return ve(j,we(H._payload),Y)}if(L(H)||ue(H))return H=Qr(H,j.mode,Y,null),H.return=j,H;nl(j,H)}return null}function me(j,H,Y,we){var Ye=H!==null?H.key:null;if(typeof Y=="string"&&Y!==""||typeof Y=="number")return Ye!==null?null:U(j,H,""+Y,we);if(typeof Y=="object"&&Y!==null){switch(Y.$$typeof){case G:return Y.key===Ye?O(j,H,Y,we):null;case k:return Y.key===Ye?te(j,H,Y,we):null;case ne:return Ye=Y._init,me(j,H,Ye(Y._payload),we)}if(L(Y)||ue(Y))return Ye!==null?null:_e(j,H,Y,we,null);nl(j,Y)}return null}function ke(j,H,Y,we,Ye){if(typeof we=="string"&&we!==""||typeof we=="number")return j=j.get(Y)||null,U(H,j,""+we,Ye);if(typeof we=="object"&&we!==null){switch(we.$$typeof){case G:return j=j.get(we.key===null?Y:we.key)||null,O(H,j,we,Ye);case k:return j=j.get(we.key===null?Y:we.key)||null,te(H,j,we,Ye);case ne:var $e=we._init;return ke(j,H,Y,$e(we._payload),Ye)}if(L(we)||ue(we))return j=j.get(Y)||null,_e(H,j,we,Ye,null);nl(H,we)}return null}function Ge(j,H,Y,we){for(var Ye=null,$e=null,Qe=H,ot=H=0,an=null;Qe!==null&&ot<Y.length;ot++){Qe.index>ot?(an=Qe,Qe=null):an=Qe.sibling;var Mt=me(j,Qe,Y[ot],we);if(Mt===null){Qe===null&&(Qe=an);break}n&&Qe&&Mt.alternate===null&&i(j,Qe),H=_(Mt,H,ot),$e===null?Ye=Mt:$e.sibling=Mt,$e=Mt,Qe=an}if(ot===Y.length)return a(j,Qe),Ht&&Gr(j,ot),Ye;if(Qe===null){for(;ot<Y.length;ot++)Qe=ve(j,Y[ot],we),Qe!==null&&(H=_(Qe,H,ot),$e===null?Ye=Qe:$e.sibling=Qe,$e=Qe);return Ht&&Gr(j,ot),Ye}for(Qe=c(j,Qe);ot<Y.length;ot++)an=ke(Qe,j,ot,Y[ot],we),an!==null&&(n&&an.alternate!==null&&Qe.delete(an.key===null?ot:an.key),H=_(an,H,ot),$e===null?Ye=an:$e.sibling=an,$e=an);return n&&Qe.forEach(function(Ar){return i(j,Ar)}),Ht&&Gr(j,ot),Ye}function qe(j,H,Y,we){var Ye=ue(Y);if(typeof Ye!="function")throw Error(t(150));if(Y=Ye.call(Y),Y==null)throw Error(t(151));for(var $e=Ye=null,Qe=H,ot=H=0,an=null,Mt=Y.next();Qe!==null&&!Mt.done;ot++,Mt=Y.next()){Qe.index>ot?(an=Qe,Qe=null):an=Qe.sibling;var Ar=me(j,Qe,Mt.value,we);if(Ar===null){Qe===null&&(Qe=an);break}n&&Qe&&Ar.alternate===null&&i(j,Qe),H=_(Ar,H,ot),$e===null?Ye=Ar:$e.sibling=Ar,$e=Ar,Qe=an}if(Mt.done)return a(j,Qe),Ht&&Gr(j,ot),Ye;if(Qe===null){for(;!Mt.done;ot++,Mt=Y.next())Mt=ve(j,Mt.value,we),Mt!==null&&(H=_(Mt,H,ot),$e===null?Ye=Mt:$e.sibling=Mt,$e=Mt);return Ht&&Gr(j,ot),Ye}for(Qe=c(j,Qe);!Mt.done;ot++,Mt=Y.next())Mt=ke(Qe,j,ot,Mt.value,we),Mt!==null&&(n&&Mt.alternate!==null&&Qe.delete(Mt.key===null?ot:Mt.key),H=_(Mt,H,ot),$e===null?Ye=Mt:$e.sibling=Mt,$e=Mt);return n&&Qe.forEach(function(Dv){return i(j,Dv)}),Ht&&Gr(j,ot),Ye}function jt(j,H,Y,we){if(typeof Y=="object"&&Y!==null&&Y.type===I&&Y.key===null&&(Y=Y.props.children),typeof Y=="object"&&Y!==null){switch(Y.$$typeof){case G:e:{for(var Ye=Y.key,$e=H;$e!==null;){if($e.key===Ye){if(Ye=Y.type,Ye===I){if($e.tag===7){a(j,$e.sibling),H=f($e,Y.props.children),H.return=j,j=H;break e}}else if($e.elementType===Ye||typeof Ye=="object"&&Ye!==null&&Ye.$$typeof===ne&&vp(Ye)===$e.type){a(j,$e.sibling),H=f($e,Y.props),H.ref=qo(j,$e,Y),H.return=j,j=H;break e}a(j,$e);break}else i(j,$e);$e=$e.sibling}Y.type===I?(H=Qr(Y.props.children,j.mode,we,Y.key),H.return=j,j=H):(we=Al(Y.type,Y.key,Y.props,null,j.mode,we),we.ref=qo(j,H,Y),we.return=j,j=we)}return T(j);case k:e:{for($e=Y.key;H!==null;){if(H.key===$e)if(H.tag===4&&H.stateNode.containerInfo===Y.containerInfo&&H.stateNode.implementation===Y.implementation){a(j,H.sibling),H=f(H,Y.children||[]),H.return=j,j=H;break e}else{a(j,H);break}else i(j,H);H=H.sibling}H=id(Y,j.mode,we),H.return=j,j=H}return T(j);case ne:return $e=Y._init,jt(j,H,$e(Y._payload),we)}if(L(Y))return Ge(j,H,Y,we);if(ue(Y))return qe(j,H,Y,we);nl(j,Y)}return typeof Y=="string"&&Y!==""||typeof Y=="number"?(Y=""+Y,H!==null&&H.tag===6?(a(j,H.sibling),H=f(H,Y),H.return=j,j=H):(a(j,H),H=nd(Y,j.mode,we),H.return=j,j=H),T(j)):a(j,H)}return jt}var Ls=yp(!0),xp=yp(!1),il=mr(null),rl=null,Is=null,hu=null;function fu(){hu=Is=rl=null}function pu(n){var i=il.current;zt(il),n._currentValue=i}function mu(n,i,a){for(;n!==null;){var c=n.alternate;if((n.childLanes&i)!==i?(n.childLanes|=i,c!==null&&(c.childLanes|=i)):c!==null&&(c.childLanes&i)!==i&&(c.childLanes|=i),n===a)break;n=n.return}}function Ns(n,i){rl=n,hu=Is=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&i)!==0&&(Fn=!0),n.firstContext=null)}function ei(n){var i=n._currentValue;if(hu!==n)if(n={context:n,memoizedValue:i,next:null},Is===null){if(rl===null)throw Error(t(308));Is=n,rl.dependencies={lanes:0,firstContext:n}}else Is=Is.next=n;return i}var Wr=null;function _u(n){Wr===null?Wr=[n]:Wr.push(n)}function Sp(n,i,a,c){var f=i.interleaved;return f===null?(a.next=a,_u(i)):(a.next=f.next,f.next=a),i.interleaved=a,Hi(n,c)}function Hi(n,i){n.lanes|=i;var a=n.alternate;for(a!==null&&(a.lanes|=i),a=n,n=n.return;n!==null;)n.childLanes|=i,a=n.alternate,a!==null&&(a.childLanes|=i),a=n,n=n.return;return a.tag===3?a.stateNode:null}var vr=!1;function gu(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Mp(n,i){n=n.updateQueue,i.updateQueue===n&&(i.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Gi(n,i){return{eventTime:n,lane:i,tag:0,payload:null,callback:null,next:null}}function yr(n,i,a){var c=n.updateQueue;if(c===null)return null;if(c=c.shared,(yt&2)!==0){var f=c.pending;return f===null?i.next=i:(i.next=f.next,f.next=i),c.pending=i,Hi(n,a)}return f=c.interleaved,f===null?(i.next=i,_u(c)):(i.next=f.next,f.next=i),c.interleaved=i,Hi(n,a)}function sl(n,i,a){if(i=i.updateQueue,i!==null&&(i=i.shared,(a&4194240)!==0)){var c=i.lanes;c&=n.pendingLanes,a|=c,i.lanes=a,Dc(n,a)}}function wp(n,i){var a=n.updateQueue,c=n.alternate;if(c!==null&&(c=c.updateQueue,a===c)){var f=null,_=null;if(a=a.firstBaseUpdate,a!==null){do{var T={eventTime:a.eventTime,lane:a.lane,tag:a.tag,payload:a.payload,callback:a.callback,next:null};_===null?f=_=T:_=_.next=T,a=a.next}while(a!==null);_===null?f=_=i:_=_.next=i}else f=_=i;a={baseState:c.baseState,firstBaseUpdate:f,lastBaseUpdate:_,shared:c.shared,effects:c.effects},n.updateQueue=a;return}n=a.lastBaseUpdate,n===null?a.firstBaseUpdate=i:n.next=i,a.lastBaseUpdate=i}function ol(n,i,a,c){var f=n.updateQueue;vr=!1;var _=f.firstBaseUpdate,T=f.lastBaseUpdate,U=f.shared.pending;if(U!==null){f.shared.pending=null;var O=U,te=O.next;O.next=null,T===null?_=te:T.next=te,T=O;var _e=n.alternate;_e!==null&&(_e=_e.updateQueue,U=_e.lastBaseUpdate,U!==T&&(U===null?_e.firstBaseUpdate=te:U.next=te,_e.lastBaseUpdate=O))}if(_!==null){var ve=f.baseState;T=0,_e=te=O=null,U=_;do{var me=U.lane,ke=U.eventTime;if((c&me)===me){_e!==null&&(_e=_e.next={eventTime:ke,lane:0,tag:U.tag,payload:U.payload,callback:U.callback,next:null});e:{var Ge=n,qe=U;switch(me=i,ke=a,qe.tag){case 1:if(Ge=qe.payload,typeof Ge=="function"){ve=Ge.call(ke,ve,me);break e}ve=Ge;break e;case 3:Ge.flags=Ge.flags&-65537|128;case 0:if(Ge=qe.payload,me=typeof Ge=="function"?Ge.call(ke,ve,me):Ge,me==null)break e;ve=se({},ve,me);break e;case 2:vr=!0}}U.callback!==null&&U.lane!==0&&(n.flags|=64,me=f.effects,me===null?f.effects=[U]:me.push(U))}else ke={eventTime:ke,lane:me,tag:U.tag,payload:U.payload,callback:U.callback,next:null},_e===null?(te=_e=ke,O=ve):_e=_e.next=ke,T|=me;if(U=U.next,U===null){if(U=f.shared.pending,U===null)break;me=U,U=me.next,me.next=null,f.lastBaseUpdate=me,f.shared.pending=null}}while(!0);if(_e===null&&(O=ve),f.baseState=O,f.firstBaseUpdate=te,f.lastBaseUpdate=_e,i=f.shared.interleaved,i!==null){f=i;do T|=f.lane,f=f.next;while(f!==i)}else _===null&&(f.shared.lanes=0);jr|=T,n.lanes=T,n.memoizedState=ve}}function Ep(n,i,a){if(n=i.effects,i.effects=null,n!==null)for(i=0;i<n.length;i++){var c=n[i],f=c.callback;if(f!==null){if(c.callback=null,c=a,typeof f!="function")throw Error(t(191,f));f.call(c)}}}var Xo={},bi=mr(Xo),jo=mr(Xo),Yo=mr(Xo);function qr(n){if(n===Xo)throw Error(t(174));return n}function vu(n,i){switch(kt(Yo,i),kt(jo,n),kt(bi,Xo),n=i.nodeType,n){case 9:case 11:i=(i=i.documentElement)?i.namespaceURI:Ae(null,"");break;default:n=n===8?i.parentNode:i,i=n.namespaceURI||null,n=n.tagName,i=Ae(i,n)}zt(bi),kt(bi,i)}function Us(){zt(bi),zt(jo),zt(Yo)}function Tp(n){qr(Yo.current);var i=qr(bi.current),a=Ae(i,n.type);i!==a&&(kt(jo,n),kt(bi,a))}function yu(n){jo.current===n&&(zt(bi),zt(jo))}var Wt=mr(0);function al(n){for(var i=n;i!==null;){if(i.tag===13){var a=i.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||a.data==="$?"||a.data==="$!"))return i}else if(i.tag===19&&i.memoizedProps.revealOrder!==void 0){if((i.flags&128)!==0)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var xu=[];function Su(){for(var n=0;n<xu.length;n++)xu[n]._workInProgressVersionPrimary=null;xu.length=0}var ll=D.ReactCurrentDispatcher,Mu=D.ReactCurrentBatchConfig,Xr=0,qt=null,Qt=null,sn=null,cl=!1,Ko=!1,$o=0,Zg=0;function Sn(){throw Error(t(321))}function wu(n,i){if(i===null)return!1;for(var a=0;a<i.length&&a<n.length;a++)if(!ui(n[a],i[a]))return!1;return!0}function Eu(n,i,a,c,f,_){if(Xr=_,qt=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,ll.current=n===null||n.memoizedState===null?iv:rv,n=a(c,f),Ko){_=0;do{if(Ko=!1,$o=0,25<=_)throw Error(t(301));_+=1,sn=Qt=null,i.updateQueue=null,ll.current=sv,n=a(c,f)}while(Ko)}if(ll.current=hl,i=Qt!==null&&Qt.next!==null,Xr=0,sn=Qt=qt=null,cl=!1,i)throw Error(t(300));return n}function Tu(){var n=$o!==0;return $o=0,n}function Ci(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return sn===null?qt.memoizedState=sn=n:sn=sn.next=n,sn}function ti(){if(Qt===null){var n=qt.alternate;n=n!==null?n.memoizedState:null}else n=Qt.next;var i=sn===null?qt.memoizedState:sn.next;if(i!==null)sn=i,Qt=n;else{if(n===null)throw Error(t(310));Qt=n,n={memoizedState:Qt.memoizedState,baseState:Qt.baseState,baseQueue:Qt.baseQueue,queue:Qt.queue,next:null},sn===null?qt.memoizedState=sn=n:sn=sn.next=n}return sn}function Qo(n,i){return typeof i=="function"?i(n):i}function Au(n){var i=ti(),a=i.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var c=Qt,f=c.baseQueue,_=a.pending;if(_!==null){if(f!==null){var T=f.next;f.next=_.next,_.next=T}c.baseQueue=f=_,a.pending=null}if(f!==null){_=f.next,c=c.baseState;var U=T=null,O=null,te=_;do{var _e=te.lane;if((Xr&_e)===_e)O!==null&&(O=O.next={lane:0,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null}),c=te.hasEagerState?te.eagerState:n(c,te.action);else{var ve={lane:_e,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null};O===null?(U=O=ve,T=c):O=O.next=ve,qt.lanes|=_e,jr|=_e}te=te.next}while(te!==null&&te!==_);O===null?T=c:O.next=U,ui(c,i.memoizedState)||(Fn=!0),i.memoizedState=c,i.baseState=T,i.baseQueue=O,a.lastRenderedState=c}if(n=a.interleaved,n!==null){f=n;do _=f.lane,qt.lanes|=_,jr|=_,f=f.next;while(f!==n)}else f===null&&(a.lanes=0);return[i.memoizedState,a.dispatch]}function bu(n){var i=ti(),a=i.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var c=a.dispatch,f=a.pending,_=i.memoizedState;if(f!==null){a.pending=null;var T=f=f.next;do _=n(_,T.action),T=T.next;while(T!==f);ui(_,i.memoizedState)||(Fn=!0),i.memoizedState=_,i.baseQueue===null&&(i.baseState=_),a.lastRenderedState=_}return[_,c]}function Ap(){}function bp(n,i){var a=qt,c=ti(),f=i(),_=!ui(c.memoizedState,f);if(_&&(c.memoizedState=f,Fn=!0),c=c.queue,Cu(Pp.bind(null,a,c,n),[n]),c.getSnapshot!==i||_||sn!==null&&sn.memoizedState.tag&1){if(a.flags|=2048,Jo(9,Rp.bind(null,a,c,f,i),void 0,null),on===null)throw Error(t(349));(Xr&30)!==0||Cp(a,i,f)}return f}function Cp(n,i,a){n.flags|=16384,n={getSnapshot:i,value:a},i=qt.updateQueue,i===null?(i={lastEffect:null,stores:null},qt.updateQueue=i,i.stores=[n]):(a=i.stores,a===null?i.stores=[n]:a.push(n))}function Rp(n,i,a,c){i.value=a,i.getSnapshot=c,Dp(i)&&Lp(n)}function Pp(n,i,a){return a(function(){Dp(i)&&Lp(n)})}function Dp(n){var i=n.getSnapshot;n=n.value;try{var a=i();return!ui(n,a)}catch{return!0}}function Lp(n){var i=Hi(n,1);i!==null&&mi(i,n,1,-1)}function Ip(n){var i=Ci();return typeof n=="function"&&(n=n()),i.memoizedState=i.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Qo,lastRenderedState:n},i.queue=n,n=n.dispatch=nv.bind(null,qt,n),[i.memoizedState,n]}function Jo(n,i,a,c){return n={tag:n,create:i,destroy:a,deps:c,next:null},i=qt.updateQueue,i===null?(i={lastEffect:null,stores:null},qt.updateQueue=i,i.lastEffect=n.next=n):(a=i.lastEffect,a===null?i.lastEffect=n.next=n:(c=a.next,a.next=n,n.next=c,i.lastEffect=n)),n}function Np(){return ti().memoizedState}function ul(n,i,a,c){var f=Ci();qt.flags|=n,f.memoizedState=Jo(1|i,a,void 0,c===void 0?null:c)}function dl(n,i,a,c){var f=ti();c=c===void 0?null:c;var _=void 0;if(Qt!==null){var T=Qt.memoizedState;if(_=T.destroy,c!==null&&wu(c,T.deps)){f.memoizedState=Jo(i,a,_,c);return}}qt.flags|=n,f.memoizedState=Jo(1|i,a,_,c)}function Up(n,i){return ul(8390656,8,n,i)}function Cu(n,i){return dl(2048,8,n,i)}function kp(n,i){return dl(4,2,n,i)}function Fp(n,i){return dl(4,4,n,i)}function Op(n,i){if(typeof i=="function")return n=n(),i(n),function(){i(null)};if(i!=null)return n=n(),i.current=n,function(){i.current=null}}function Bp(n,i,a){return a=a!=null?a.concat([n]):null,dl(4,4,Op.bind(null,i,n),a)}function Ru(){}function zp(n,i){var a=ti();i=i===void 0?null:i;var c=a.memoizedState;return c!==null&&i!==null&&wu(i,c[1])?c[0]:(a.memoizedState=[n,i],n)}function Vp(n,i){var a=ti();i=i===void 0?null:i;var c=a.memoizedState;return c!==null&&i!==null&&wu(i,c[1])?c[0]:(n=n(),a.memoizedState=[n,i],n)}function Hp(n,i,a){return(Xr&21)===0?(n.baseState&&(n.baseState=!1,Fn=!0),n.memoizedState=a):(ui(a,i)||(a=vs(),qt.lanes|=a,jr|=a,n.baseState=!0),i)}function ev(n,i){var a=Rt;Rt=a!==0&&4>a?a:4,n(!0);var c=Mu.transition;Mu.transition={};try{n(!1),i()}finally{Rt=a,Mu.transition=c}}function Gp(){return ti().memoizedState}function tv(n,i,a){var c=wr(n);if(a={lane:c,action:a,hasEagerState:!1,eagerState:null,next:null},Wp(n))qp(i,a);else if(a=Sp(n,i,a,c),a!==null){var f=Rn();mi(a,n,c,f),Xp(a,i,c)}}function nv(n,i,a){var c=wr(n),f={lane:c,action:a,hasEagerState:!1,eagerState:null,next:null};if(Wp(n))qp(i,f);else{var _=n.alternate;if(n.lanes===0&&(_===null||_.lanes===0)&&(_=i.lastRenderedReducer,_!==null))try{var T=i.lastRenderedState,U=_(T,a);if(f.hasEagerState=!0,f.eagerState=U,ui(U,T)){var O=i.interleaved;O===null?(f.next=f,_u(i)):(f.next=O.next,O.next=f),i.interleaved=f;return}}catch{}finally{}a=Sp(n,i,f,c),a!==null&&(f=Rn(),mi(a,n,c,f),Xp(a,i,c))}}function Wp(n){var i=n.alternate;return n===qt||i!==null&&i===qt}function qp(n,i){Ko=cl=!0;var a=n.pending;a===null?i.next=i:(i.next=a.next,a.next=i),n.pending=i}function Xp(n,i,a){if((a&4194240)!==0){var c=i.lanes;c&=n.pendingLanes,a|=c,i.lanes=a,Dc(n,a)}}var hl={readContext:ei,useCallback:Sn,useContext:Sn,useEffect:Sn,useImperativeHandle:Sn,useInsertionEffect:Sn,useLayoutEffect:Sn,useMemo:Sn,useReducer:Sn,useRef:Sn,useState:Sn,useDebugValue:Sn,useDeferredValue:Sn,useTransition:Sn,useMutableSource:Sn,useSyncExternalStore:Sn,useId:Sn,unstable_isNewReconciler:!1},iv={readContext:ei,useCallback:function(n,i){return Ci().memoizedState=[n,i===void 0?null:i],n},useContext:ei,useEffect:Up,useImperativeHandle:function(n,i,a){return a=a!=null?a.concat([n]):null,ul(4194308,4,Op.bind(null,i,n),a)},useLayoutEffect:function(n,i){return ul(4194308,4,n,i)},useInsertionEffect:function(n,i){return ul(4,2,n,i)},useMemo:function(n,i){var a=Ci();return i=i===void 0?null:i,n=n(),a.memoizedState=[n,i],n},useReducer:function(n,i,a){var c=Ci();return i=a!==void 0?a(i):i,c.memoizedState=c.baseState=i,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:i},c.queue=n,n=n.dispatch=tv.bind(null,qt,n),[c.memoizedState,n]},useRef:function(n){var i=Ci();return n={current:n},i.memoizedState=n},useState:Ip,useDebugValue:Ru,useDeferredValue:function(n){return Ci().memoizedState=n},useTransition:function(){var n=Ip(!1),i=n[0];return n=ev.bind(null,n[1]),Ci().memoizedState=n,[i,n]},useMutableSource:function(){},useSyncExternalStore:function(n,i,a){var c=qt,f=Ci();if(Ht){if(a===void 0)throw Error(t(407));a=a()}else{if(a=i(),on===null)throw Error(t(349));(Xr&30)!==0||Cp(c,i,a)}f.memoizedState=a;var _={value:a,getSnapshot:i};return f.queue=_,Up(Pp.bind(null,c,_,n),[n]),c.flags|=2048,Jo(9,Rp.bind(null,c,_,a,i),void 0,null),a},useId:function(){var n=Ci(),i=on.identifierPrefix;if(Ht){var a=Vi,c=zi;a=(c&~(1<<32-ze(c)-1)).toString(32)+a,i=":"+i+"R"+a,a=$o++,0<a&&(i+="H"+a.toString(32)),i+=":"}else a=Zg++,i=":"+i+"r"+a.toString(32)+":";return n.memoizedState=i},unstable_isNewReconciler:!1},rv={readContext:ei,useCallback:zp,useContext:ei,useEffect:Cu,useImperativeHandle:Bp,useInsertionEffect:kp,useLayoutEffect:Fp,useMemo:Vp,useReducer:Au,useRef:Np,useState:function(){return Au(Qo)},useDebugValue:Ru,useDeferredValue:function(n){var i=ti();return Hp(i,Qt.memoizedState,n)},useTransition:function(){var n=Au(Qo)[0],i=ti().memoizedState;return[n,i]},useMutableSource:Ap,useSyncExternalStore:bp,useId:Gp,unstable_isNewReconciler:!1},sv={readContext:ei,useCallback:zp,useContext:ei,useEffect:Cu,useImperativeHandle:Bp,useInsertionEffect:kp,useLayoutEffect:Fp,useMemo:Vp,useReducer:bu,useRef:Np,useState:function(){return bu(Qo)},useDebugValue:Ru,useDeferredValue:function(n){var i=ti();return Qt===null?i.memoizedState=n:Hp(i,Qt.memoizedState,n)},useTransition:function(){var n=bu(Qo)[0],i=ti().memoizedState;return[n,i]},useMutableSource:Ap,useSyncExternalStore:bp,useId:Gp,unstable_isNewReconciler:!1};function hi(n,i){if(n&&n.defaultProps){i=se({},i),n=n.defaultProps;for(var a in n)i[a]===void 0&&(i[a]=n[a]);return i}return i}function Pu(n,i,a,c){i=n.memoizedState,a=a(c,i),a=a==null?i:se({},i,a),n.memoizedState=a,n.lanes===0&&(n.updateQueue.baseState=a)}var fl={isMounted:function(n){return(n=n._reactInternals)?ki(n)===n:!1},enqueueSetState:function(n,i,a){n=n._reactInternals;var c=Rn(),f=wr(n),_=Gi(c,f);_.payload=i,a!=null&&(_.callback=a),i=yr(n,_,f),i!==null&&(mi(i,n,f,c),sl(i,n,f))},enqueueReplaceState:function(n,i,a){n=n._reactInternals;var c=Rn(),f=wr(n),_=Gi(c,f);_.tag=1,_.payload=i,a!=null&&(_.callback=a),i=yr(n,_,f),i!==null&&(mi(i,n,f,c),sl(i,n,f))},enqueueForceUpdate:function(n,i){n=n._reactInternals;var a=Rn(),c=wr(n),f=Gi(a,c);f.tag=2,i!=null&&(f.callback=i),i=yr(n,f,c),i!==null&&(mi(i,n,c,a),sl(i,n,c))}};function jp(n,i,a,c,f,_,T){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(c,_,T):i.prototype&&i.prototype.isPureReactComponent?!Oo(a,c)||!Oo(f,_):!0}function Yp(n,i,a){var c=!1,f=_r,_=i.contextType;return typeof _=="object"&&_!==null?_=ei(_):(f=kn(i)?Vr:xn.current,c=i.contextTypes,_=(c=c!=null)?Cs(n,f):_r),i=new i(a,_),n.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=fl,n.stateNode=i,i._reactInternals=n,c&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=f,n.__reactInternalMemoizedMaskedChildContext=_),i}function Kp(n,i,a,c){n=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(a,c),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(a,c),i.state!==n&&fl.enqueueReplaceState(i,i.state,null)}function Du(n,i,a,c){var f=n.stateNode;f.props=a,f.state=n.memoizedState,f.refs={},gu(n);var _=i.contextType;typeof _=="object"&&_!==null?f.context=ei(_):(_=kn(i)?Vr:xn.current,f.context=Cs(n,_)),f.state=n.memoizedState,_=i.getDerivedStateFromProps,typeof _=="function"&&(Pu(n,i,_,a),f.state=n.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof f.getSnapshotBeforeUpdate=="function"||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(i=f.state,typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount(),i!==f.state&&fl.enqueueReplaceState(f,f.state,null),ol(n,a,f,c),f.state=n.memoizedState),typeof f.componentDidMount=="function"&&(n.flags|=4194308)}function ks(n,i){try{var a="",c=i;do a+=ce(c),c=c.return;while(c);var f=a}catch(_){f=`
Error generating stack: `+_.message+`
`+_.stack}return{value:n,source:i,stack:f,digest:null}}function Lu(n,i,a){return{value:n,source:null,stack:a??null,digest:i??null}}function Iu(n,i){try{console.error(i.value)}catch(a){setTimeout(function(){throw a})}}var ov=typeof WeakMap=="function"?WeakMap:Map;function $p(n,i,a){a=Gi(-1,a),a.tag=3,a.payload={element:null};var c=i.value;return a.callback=function(){xl||(xl=!0,Yu=c),Iu(n,i)},a}function Qp(n,i,a){a=Gi(-1,a),a.tag=3;var c=n.type.getDerivedStateFromError;if(typeof c=="function"){var f=i.value;a.payload=function(){return c(f)},a.callback=function(){Iu(n,i)}}var _=n.stateNode;return _!==null&&typeof _.componentDidCatch=="function"&&(a.callback=function(){Iu(n,i),typeof c!="function"&&(Sr===null?Sr=new Set([this]):Sr.add(this));var T=i.stack;this.componentDidCatch(i.value,{componentStack:T!==null?T:""})}),a}function Jp(n,i,a){var c=n.pingCache;if(c===null){c=n.pingCache=new ov;var f=new Set;c.set(i,f)}else f=c.get(i),f===void 0&&(f=new Set,c.set(i,f));f.has(a)||(f.add(a),n=xv.bind(null,n,i,a),i.then(n,n))}function Zp(n){do{var i;if((i=n.tag===13)&&(i=n.memoizedState,i=i!==null?i.dehydrated!==null:!0),i)return n;n=n.return}while(n!==null);return null}function em(n,i,a,c,f){return(n.mode&1)===0?(n===i?n.flags|=65536:(n.flags|=128,a.flags|=131072,a.flags&=-52805,a.tag===1&&(a.alternate===null?a.tag=17:(i=Gi(-1,1),i.tag=2,yr(a,i,1))),a.lanes|=1),n):(n.flags|=65536,n.lanes=f,n)}var av=D.ReactCurrentOwner,Fn=!1;function Cn(n,i,a,c){i.child=n===null?xp(i,null,a,c):Ls(i,n.child,a,c)}function tm(n,i,a,c,f){a=a.render;var _=i.ref;return Ns(i,f),c=Eu(n,i,a,c,_,f),a=Tu(),n!==null&&!Fn?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~f,Wi(n,i,f)):(Ht&&a&&au(i),i.flags|=1,Cn(n,i,c,f),i.child)}function nm(n,i,a,c,f){if(n===null){var _=a.type;return typeof _=="function"&&!td(_)&&_.defaultProps===void 0&&a.compare===null&&a.defaultProps===void 0?(i.tag=15,i.type=_,im(n,i,_,c,f)):(n=Al(a.type,null,c,i,i.mode,f),n.ref=i.ref,n.return=i,i.child=n)}if(_=n.child,(n.lanes&f)===0){var T=_.memoizedProps;if(a=a.compare,a=a!==null?a:Oo,a(T,c)&&n.ref===i.ref)return Wi(n,i,f)}return i.flags|=1,n=Tr(_,c),n.ref=i.ref,n.return=i,i.child=n}function im(n,i,a,c,f){if(n!==null){var _=n.memoizedProps;if(Oo(_,c)&&n.ref===i.ref)if(Fn=!1,i.pendingProps=c=_,(n.lanes&f)!==0)(n.flags&131072)!==0&&(Fn=!0);else return i.lanes=n.lanes,Wi(n,i,f)}return Nu(n,i,a,c,f)}function rm(n,i,a){var c=i.pendingProps,f=c.children,_=n!==null?n.memoizedState:null;if(c.mode==="hidden")if((i.mode&1)===0)i.memoizedState={baseLanes:0,cachePool:null,transitions:null},kt(Os,jn),jn|=a;else{if((a&1073741824)===0)return n=_!==null?_.baseLanes|a:a,i.lanes=i.childLanes=1073741824,i.memoizedState={baseLanes:n,cachePool:null,transitions:null},i.updateQueue=null,kt(Os,jn),jn|=n,null;i.memoizedState={baseLanes:0,cachePool:null,transitions:null},c=_!==null?_.baseLanes:a,kt(Os,jn),jn|=c}else _!==null?(c=_.baseLanes|a,i.memoizedState=null):c=a,kt(Os,jn),jn|=c;return Cn(n,i,f,a),i.child}function sm(n,i){var a=i.ref;(n===null&&a!==null||n!==null&&n.ref!==a)&&(i.flags|=512,i.flags|=2097152)}function Nu(n,i,a,c,f){var _=kn(a)?Vr:xn.current;return _=Cs(i,_),Ns(i,f),a=Eu(n,i,a,c,_,f),c=Tu(),n!==null&&!Fn?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~f,Wi(n,i,f)):(Ht&&c&&au(i),i.flags|=1,Cn(n,i,a,f),i.child)}function om(n,i,a,c,f){if(kn(a)){var _=!0;Qa(i)}else _=!1;if(Ns(i,f),i.stateNode===null)ml(n,i),Yp(i,a,c),Du(i,a,c,f),c=!0;else if(n===null){var T=i.stateNode,U=i.memoizedProps;T.props=U;var O=T.context,te=a.contextType;typeof te=="object"&&te!==null?te=ei(te):(te=kn(a)?Vr:xn.current,te=Cs(i,te));var _e=a.getDerivedStateFromProps,ve=typeof _e=="function"||typeof T.getSnapshotBeforeUpdate=="function";ve||typeof T.UNSAFE_componentWillReceiveProps!="function"&&typeof T.componentWillReceiveProps!="function"||(U!==c||O!==te)&&Kp(i,T,c,te),vr=!1;var me=i.memoizedState;T.state=me,ol(i,c,T,f),O=i.memoizedState,U!==c||me!==O||Un.current||vr?(typeof _e=="function"&&(Pu(i,a,_e,c),O=i.memoizedState),(U=vr||jp(i,a,U,c,me,O,te))?(ve||typeof T.UNSAFE_componentWillMount!="function"&&typeof T.componentWillMount!="function"||(typeof T.componentWillMount=="function"&&T.componentWillMount(),typeof T.UNSAFE_componentWillMount=="function"&&T.UNSAFE_componentWillMount()),typeof T.componentDidMount=="function"&&(i.flags|=4194308)):(typeof T.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=c,i.memoizedState=O),T.props=c,T.state=O,T.context=te,c=U):(typeof T.componentDidMount=="function"&&(i.flags|=4194308),c=!1)}else{T=i.stateNode,Mp(n,i),U=i.memoizedProps,te=i.type===i.elementType?U:hi(i.type,U),T.props=te,ve=i.pendingProps,me=T.context,O=a.contextType,typeof O=="object"&&O!==null?O=ei(O):(O=kn(a)?Vr:xn.current,O=Cs(i,O));var ke=a.getDerivedStateFromProps;(_e=typeof ke=="function"||typeof T.getSnapshotBeforeUpdate=="function")||typeof T.UNSAFE_componentWillReceiveProps!="function"&&typeof T.componentWillReceiveProps!="function"||(U!==ve||me!==O)&&Kp(i,T,c,O),vr=!1,me=i.memoizedState,T.state=me,ol(i,c,T,f);var Ge=i.memoizedState;U!==ve||me!==Ge||Un.current||vr?(typeof ke=="function"&&(Pu(i,a,ke,c),Ge=i.memoizedState),(te=vr||jp(i,a,te,c,me,Ge,O)||!1)?(_e||typeof T.UNSAFE_componentWillUpdate!="function"&&typeof T.componentWillUpdate!="function"||(typeof T.componentWillUpdate=="function"&&T.componentWillUpdate(c,Ge,O),typeof T.UNSAFE_componentWillUpdate=="function"&&T.UNSAFE_componentWillUpdate(c,Ge,O)),typeof T.componentDidUpdate=="function"&&(i.flags|=4),typeof T.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof T.componentDidUpdate!="function"||U===n.memoizedProps&&me===n.memoizedState||(i.flags|=4),typeof T.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&me===n.memoizedState||(i.flags|=1024),i.memoizedProps=c,i.memoizedState=Ge),T.props=c,T.state=Ge,T.context=O,c=te):(typeof T.componentDidUpdate!="function"||U===n.memoizedProps&&me===n.memoizedState||(i.flags|=4),typeof T.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&me===n.memoizedState||(i.flags|=1024),c=!1)}return Uu(n,i,a,c,_,f)}function Uu(n,i,a,c,f,_){sm(n,i);var T=(i.flags&128)!==0;if(!c&&!T)return f&&dp(i,a,!1),Wi(n,i,_);c=i.stateNode,av.current=i;var U=T&&typeof a.getDerivedStateFromError!="function"?null:c.render();return i.flags|=1,n!==null&&T?(i.child=Ls(i,n.child,null,_),i.child=Ls(i,null,U,_)):Cn(n,i,U,_),i.memoizedState=c.state,f&&dp(i,a,!0),i.child}function am(n){var i=n.stateNode;i.pendingContext?cp(n,i.pendingContext,i.pendingContext!==i.context):i.context&&cp(n,i.context,!1),vu(n,i.containerInfo)}function lm(n,i,a,c,f){return Ds(),du(f),i.flags|=256,Cn(n,i,a,c),i.child}var ku={dehydrated:null,treeContext:null,retryLane:0};function Fu(n){return{baseLanes:n,cachePool:null,transitions:null}}function cm(n,i,a){var c=i.pendingProps,f=Wt.current,_=!1,T=(i.flags&128)!==0,U;if((U=T)||(U=n!==null&&n.memoizedState===null?!1:(f&2)!==0),U?(_=!0,i.flags&=-129):(n===null||n.memoizedState!==null)&&(f|=1),kt(Wt,f&1),n===null)return uu(i),n=i.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((i.mode&1)===0?i.lanes=1:n.data==="$!"?i.lanes=8:i.lanes=1073741824,null):(T=c.children,n=c.fallback,_?(c=i.mode,_=i.child,T={mode:"hidden",children:T},(c&1)===0&&_!==null?(_.childLanes=0,_.pendingProps=T):_=bl(T,c,0,null),n=Qr(n,c,a,null),_.return=i,n.return=i,_.sibling=n,i.child=_,i.child.memoizedState=Fu(a),i.memoizedState=ku,n):Ou(i,T));if(f=n.memoizedState,f!==null&&(U=f.dehydrated,U!==null))return lv(n,i,T,c,U,f,a);if(_){_=c.fallback,T=i.mode,f=n.child,U=f.sibling;var O={mode:"hidden",children:c.children};return(T&1)===0&&i.child!==f?(c=i.child,c.childLanes=0,c.pendingProps=O,i.deletions=null):(c=Tr(f,O),c.subtreeFlags=f.subtreeFlags&14680064),U!==null?_=Tr(U,_):(_=Qr(_,T,a,null),_.flags|=2),_.return=i,c.return=i,c.sibling=_,i.child=c,c=_,_=i.child,T=n.child.memoizedState,T=T===null?Fu(a):{baseLanes:T.baseLanes|a,cachePool:null,transitions:T.transitions},_.memoizedState=T,_.childLanes=n.childLanes&~a,i.memoizedState=ku,c}return _=n.child,n=_.sibling,c=Tr(_,{mode:"visible",children:c.children}),(i.mode&1)===0&&(c.lanes=a),c.return=i,c.sibling=null,n!==null&&(a=i.deletions,a===null?(i.deletions=[n],i.flags|=16):a.push(n)),i.child=c,i.memoizedState=null,c}function Ou(n,i){return i=bl({mode:"visible",children:i},n.mode,0,null),i.return=n,n.child=i}function pl(n,i,a,c){return c!==null&&du(c),Ls(i,n.child,null,a),n=Ou(i,i.pendingProps.children),n.flags|=2,i.memoizedState=null,n}function lv(n,i,a,c,f,_,T){if(a)return i.flags&256?(i.flags&=-257,c=Lu(Error(t(422))),pl(n,i,T,c)):i.memoizedState!==null?(i.child=n.child,i.flags|=128,null):(_=c.fallback,f=i.mode,c=bl({mode:"visible",children:c.children},f,0,null),_=Qr(_,f,T,null),_.flags|=2,c.return=i,_.return=i,c.sibling=_,i.child=c,(i.mode&1)!==0&&Ls(i,n.child,null,T),i.child.memoizedState=Fu(T),i.memoizedState=ku,_);if((i.mode&1)===0)return pl(n,i,T,null);if(f.data==="$!"){if(c=f.nextSibling&&f.nextSibling.dataset,c)var U=c.dgst;return c=U,_=Error(t(419)),c=Lu(_,c,void 0),pl(n,i,T,c)}if(U=(T&n.childLanes)!==0,Fn||U){if(c=on,c!==null){switch(T&-T){case 4:f=2;break;case 16:f=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:f=32;break;case 536870912:f=268435456;break;default:f=0}f=(f&(c.suspendedLanes|T))!==0?0:f,f!==0&&f!==_.retryLane&&(_.retryLane=f,Hi(n,f),mi(c,n,f,-1))}return ed(),c=Lu(Error(t(421))),pl(n,i,T,c)}return f.data==="$?"?(i.flags|=128,i.child=n.child,i=Sv.bind(null,n),f._reactRetry=i,null):(n=_.treeContext,Xn=pr(f.nextSibling),qn=i,Ht=!0,di=null,n!==null&&(Jn[Zn++]=zi,Jn[Zn++]=Vi,Jn[Zn++]=Hr,zi=n.id,Vi=n.overflow,Hr=i),i=Ou(i,c.children),i.flags|=4096,i)}function um(n,i,a){n.lanes|=i;var c=n.alternate;c!==null&&(c.lanes|=i),mu(n.return,i,a)}function Bu(n,i,a,c,f){var _=n.memoizedState;_===null?n.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:c,tail:a,tailMode:f}:(_.isBackwards=i,_.rendering=null,_.renderingStartTime=0,_.last=c,_.tail=a,_.tailMode=f)}function dm(n,i,a){var c=i.pendingProps,f=c.revealOrder,_=c.tail;if(Cn(n,i,c.children,a),c=Wt.current,(c&2)!==0)c=c&1|2,i.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=i.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&um(n,a,i);else if(n.tag===19)um(n,a,i);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===i)break e;for(;n.sibling===null;){if(n.return===null||n.return===i)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}c&=1}if(kt(Wt,c),(i.mode&1)===0)i.memoizedState=null;else switch(f){case"forwards":for(a=i.child,f=null;a!==null;)n=a.alternate,n!==null&&al(n)===null&&(f=a),a=a.sibling;a=f,a===null?(f=i.child,i.child=null):(f=a.sibling,a.sibling=null),Bu(i,!1,f,a,_);break;case"backwards":for(a=null,f=i.child,i.child=null;f!==null;){if(n=f.alternate,n!==null&&al(n)===null){i.child=f;break}n=f.sibling,f.sibling=a,a=f,f=n}Bu(i,!0,a,null,_);break;case"together":Bu(i,!1,null,null,void 0);break;default:i.memoizedState=null}return i.child}function ml(n,i){(i.mode&1)===0&&n!==null&&(n.alternate=null,i.alternate=null,i.flags|=2)}function Wi(n,i,a){if(n!==null&&(i.dependencies=n.dependencies),jr|=i.lanes,(a&i.childLanes)===0)return null;if(n!==null&&i.child!==n.child)throw Error(t(153));if(i.child!==null){for(n=i.child,a=Tr(n,n.pendingProps),i.child=a,a.return=i;n.sibling!==null;)n=n.sibling,a=a.sibling=Tr(n,n.pendingProps),a.return=i;a.sibling=null}return i.child}function cv(n,i,a){switch(i.tag){case 3:am(i),Ds();break;case 5:Tp(i);break;case 1:kn(i.type)&&Qa(i);break;case 4:vu(i,i.stateNode.containerInfo);break;case 10:var c=i.type._context,f=i.memoizedProps.value;kt(il,c._currentValue),c._currentValue=f;break;case 13:if(c=i.memoizedState,c!==null)return c.dehydrated!==null?(kt(Wt,Wt.current&1),i.flags|=128,null):(a&i.child.childLanes)!==0?cm(n,i,a):(kt(Wt,Wt.current&1),n=Wi(n,i,a),n!==null?n.sibling:null);kt(Wt,Wt.current&1);break;case 19:if(c=(a&i.childLanes)!==0,(n.flags&128)!==0){if(c)return dm(n,i,a);i.flags|=128}if(f=i.memoizedState,f!==null&&(f.rendering=null,f.tail=null,f.lastEffect=null),kt(Wt,Wt.current),c)break;return null;case 22:case 23:return i.lanes=0,rm(n,i,a)}return Wi(n,i,a)}var hm,zu,fm,pm;hm=function(n,i){for(var a=i.child;a!==null;){if(a.tag===5||a.tag===6)n.appendChild(a.stateNode);else if(a.tag!==4&&a.child!==null){a.child.return=a,a=a.child;continue}if(a===i)break;for(;a.sibling===null;){if(a.return===null||a.return===i)return;a=a.return}a.sibling.return=a.return,a=a.sibling}},zu=function(){},fm=function(n,i,a,c){var f=n.memoizedProps;if(f!==c){n=i.stateNode,qr(bi.current);var _=null;switch(a){case"input":f=hn(n,f),c=hn(n,c),_=[];break;case"select":f=se({},f,{value:void 0}),c=se({},c,{value:void 0}),_=[];break;case"textarea":f=$(n,f),c=$(n,c),_=[];break;default:typeof f.onClick!="function"&&typeof c.onClick=="function"&&(n.onclick=Ya)}at(a,c);var T;a=null;for(te in f)if(!c.hasOwnProperty(te)&&f.hasOwnProperty(te)&&f[te]!=null)if(te==="style"){var U=f[te];for(T in U)U.hasOwnProperty(T)&&(a||(a={}),a[T]="")}else te!=="dangerouslySetInnerHTML"&&te!=="children"&&te!=="suppressContentEditableWarning"&&te!=="suppressHydrationWarning"&&te!=="autoFocus"&&(o.hasOwnProperty(te)?_||(_=[]):(_=_||[]).push(te,null));for(te in c){var O=c[te];if(U=f?.[te],c.hasOwnProperty(te)&&O!==U&&(O!=null||U!=null))if(te==="style")if(U){for(T in U)!U.hasOwnProperty(T)||O&&O.hasOwnProperty(T)||(a||(a={}),a[T]="");for(T in O)O.hasOwnProperty(T)&&U[T]!==O[T]&&(a||(a={}),a[T]=O[T])}else a||(_||(_=[]),_.push(te,a)),a=O;else te==="dangerouslySetInnerHTML"?(O=O?O.__html:void 0,U=U?U.__html:void 0,O!=null&&U!==O&&(_=_||[]).push(te,O)):te==="children"?typeof O!="string"&&typeof O!="number"||(_=_||[]).push(te,""+O):te!=="suppressContentEditableWarning"&&te!=="suppressHydrationWarning"&&(o.hasOwnProperty(te)?(O!=null&&te==="onScroll"&&Bt("scroll",n),_||U===O||(_=[])):(_=_||[]).push(te,O))}a&&(_=_||[]).push("style",a);var te=_;(i.updateQueue=te)&&(i.flags|=4)}},pm=function(n,i,a,c){a!==c&&(i.flags|=4)};function Zo(n,i){if(!Ht)switch(n.tailMode){case"hidden":i=n.tail;for(var a=null;i!==null;)i.alternate!==null&&(a=i),i=i.sibling;a===null?n.tail=null:a.sibling=null;break;case"collapsed":a=n.tail;for(var c=null;a!==null;)a.alternate!==null&&(c=a),a=a.sibling;c===null?i||n.tail===null?n.tail=null:n.tail.sibling=null:c.sibling=null}}function Mn(n){var i=n.alternate!==null&&n.alternate.child===n.child,a=0,c=0;if(i)for(var f=n.child;f!==null;)a|=f.lanes|f.childLanes,c|=f.subtreeFlags&14680064,c|=f.flags&14680064,f.return=n,f=f.sibling;else for(f=n.child;f!==null;)a|=f.lanes|f.childLanes,c|=f.subtreeFlags,c|=f.flags,f.return=n,f=f.sibling;return n.subtreeFlags|=c,n.childLanes=a,i}function uv(n,i,a){var c=i.pendingProps;switch(lu(i),i.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Mn(i),null;case 1:return kn(i.type)&&$a(),Mn(i),null;case 3:return c=i.stateNode,Us(),zt(Un),zt(xn),Su(),c.pendingContext&&(c.context=c.pendingContext,c.pendingContext=null),(n===null||n.child===null)&&(tl(i)?i.flags|=4:n===null||n.memoizedState.isDehydrated&&(i.flags&256)===0||(i.flags|=1024,di!==null&&(Qu(di),di=null))),zu(n,i),Mn(i),null;case 5:yu(i);var f=qr(Yo.current);if(a=i.type,n!==null&&i.stateNode!=null)fm(n,i,a,c,f),n.ref!==i.ref&&(i.flags|=512,i.flags|=2097152);else{if(!c){if(i.stateNode===null)throw Error(t(166));return Mn(i),null}if(n=qr(bi.current),tl(i)){c=i.stateNode,a=i.type;var _=i.memoizedProps;switch(c[Ai]=i,c[Go]=_,n=(i.mode&1)!==0,a){case"dialog":Bt("cancel",c),Bt("close",c);break;case"iframe":case"object":case"embed":Bt("load",c);break;case"video":case"audio":for(f=0;f<zo.length;f++)Bt(zo[f],c);break;case"source":Bt("error",c);break;case"img":case"image":case"link":Bt("error",c),Bt("load",c);break;case"details":Bt("toggle",c);break;case"input":dt(c,_),Bt("invalid",c);break;case"select":c._wrapperState={wasMultiple:!!_.multiple},Bt("invalid",c);break;case"textarea":fe(c,_),Bt("invalid",c)}at(a,_),f=null;for(var T in _)if(_.hasOwnProperty(T)){var U=_[T];T==="children"?typeof U=="string"?c.textContent!==U&&(_.suppressHydrationWarning!==!0&&ja(c.textContent,U,n),f=["children",U]):typeof U=="number"&&c.textContent!==""+U&&(_.suppressHydrationWarning!==!0&&ja(c.textContent,U,n),f=["children",""+U]):o.hasOwnProperty(T)&&U!=null&&T==="onScroll"&&Bt("scroll",c)}switch(a){case"input":vt(c),Dt(c,_,!0);break;case"textarea":vt(c),de(c);break;case"select":case"option":break;default:typeof _.onClick=="function"&&(c.onclick=Ya)}c=f,i.updateQueue=c,c!==null&&(i.flags|=4)}else{T=f.nodeType===9?f:f.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=Ke(a)),n==="http://www.w3.org/1999/xhtml"?a==="script"?(n=T.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof c.is=="string"?n=T.createElement(a,{is:c.is}):(n=T.createElement(a),a==="select"&&(T=n,c.multiple?T.multiple=!0:c.size&&(T.size=c.size))):n=T.createElementNS(n,a),n[Ai]=i,n[Go]=c,hm(n,i,!1,!1),i.stateNode=n;e:{switch(T=bt(a,c),a){case"dialog":Bt("cancel",n),Bt("close",n),f=c;break;case"iframe":case"object":case"embed":Bt("load",n),f=c;break;case"video":case"audio":for(f=0;f<zo.length;f++)Bt(zo[f],n);f=c;break;case"source":Bt("error",n),f=c;break;case"img":case"image":case"link":Bt("error",n),Bt("load",n),f=c;break;case"details":Bt("toggle",n),f=c;break;case"input":dt(n,c),f=hn(n,c),Bt("invalid",n);break;case"option":f=c;break;case"select":n._wrapperState={wasMultiple:!!c.multiple},f=se({},c,{value:void 0}),Bt("invalid",n);break;case"textarea":fe(n,c),f=$(n,c),Bt("invalid",n);break;default:f=c}at(a,f),U=f;for(_ in U)if(U.hasOwnProperty(_)){var O=U[_];_==="style"?Ve(n,O):_==="dangerouslySetInnerHTML"?(O=O?O.__html:void 0,O!=null&&_t(n,O)):_==="children"?typeof O=="string"?(a!=="textarea"||O!=="")&&Me(n,O):typeof O=="number"&&Me(n,""+O):_!=="suppressContentEditableWarning"&&_!=="suppressHydrationWarning"&&_!=="autoFocus"&&(o.hasOwnProperty(_)?O!=null&&_==="onScroll"&&Bt("scroll",n):O!=null&&A(n,_,O,T))}switch(a){case"input":vt(n),Dt(n,c,!1);break;case"textarea":vt(n),de(n);break;case"option":c.value!=null&&n.setAttribute("value",""+Pe(c.value));break;case"select":n.multiple=!!c.multiple,_=c.value,_!=null?b(n,!!c.multiple,_,!1):c.defaultValue!=null&&b(n,!!c.multiple,c.defaultValue,!0);break;default:typeof f.onClick=="function"&&(n.onclick=Ya)}switch(a){case"button":case"input":case"select":case"textarea":c=!!c.autoFocus;break e;case"img":c=!0;break e;default:c=!1}}c&&(i.flags|=4)}i.ref!==null&&(i.flags|=512,i.flags|=2097152)}return Mn(i),null;case 6:if(n&&i.stateNode!=null)pm(n,i,n.memoizedProps,c);else{if(typeof c!="string"&&i.stateNode===null)throw Error(t(166));if(a=qr(Yo.current),qr(bi.current),tl(i)){if(c=i.stateNode,a=i.memoizedProps,c[Ai]=i,(_=c.nodeValue!==a)&&(n=qn,n!==null))switch(n.tag){case 3:ja(c.nodeValue,a,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&ja(c.nodeValue,a,(n.mode&1)!==0)}_&&(i.flags|=4)}else c=(a.nodeType===9?a:a.ownerDocument).createTextNode(c),c[Ai]=i,i.stateNode=c}return Mn(i),null;case 13:if(zt(Wt),c=i.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(Ht&&Xn!==null&&(i.mode&1)!==0&&(i.flags&128)===0)gp(),Ds(),i.flags|=98560,_=!1;else if(_=tl(i),c!==null&&c.dehydrated!==null){if(n===null){if(!_)throw Error(t(318));if(_=i.memoizedState,_=_!==null?_.dehydrated:null,!_)throw Error(t(317));_[Ai]=i}else Ds(),(i.flags&128)===0&&(i.memoizedState=null),i.flags|=4;Mn(i),_=!1}else di!==null&&(Qu(di),di=null),_=!0;if(!_)return i.flags&65536?i:null}return(i.flags&128)!==0?(i.lanes=a,i):(c=c!==null,c!==(n!==null&&n.memoizedState!==null)&&c&&(i.child.flags|=8192,(i.mode&1)!==0&&(n===null||(Wt.current&1)!==0?Jt===0&&(Jt=3):ed())),i.updateQueue!==null&&(i.flags|=4),Mn(i),null);case 4:return Us(),zu(n,i),n===null&&Vo(i.stateNode.containerInfo),Mn(i),null;case 10:return pu(i.type._context),Mn(i),null;case 17:return kn(i.type)&&$a(),Mn(i),null;case 19:if(zt(Wt),_=i.memoizedState,_===null)return Mn(i),null;if(c=(i.flags&128)!==0,T=_.rendering,T===null)if(c)Zo(_,!1);else{if(Jt!==0||n!==null&&(n.flags&128)!==0)for(n=i.child;n!==null;){if(T=al(n),T!==null){for(i.flags|=128,Zo(_,!1),c=T.updateQueue,c!==null&&(i.updateQueue=c,i.flags|=4),i.subtreeFlags=0,c=a,a=i.child;a!==null;)_=a,n=c,_.flags&=14680066,T=_.alternate,T===null?(_.childLanes=0,_.lanes=n,_.child=null,_.subtreeFlags=0,_.memoizedProps=null,_.memoizedState=null,_.updateQueue=null,_.dependencies=null,_.stateNode=null):(_.childLanes=T.childLanes,_.lanes=T.lanes,_.child=T.child,_.subtreeFlags=0,_.deletions=null,_.memoizedProps=T.memoizedProps,_.memoizedState=T.memoizedState,_.updateQueue=T.updateQueue,_.type=T.type,n=T.dependencies,_.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),a=a.sibling;return kt(Wt,Wt.current&1|2),i.child}n=n.sibling}_.tail!==null&&Te()>Bs&&(i.flags|=128,c=!0,Zo(_,!1),i.lanes=4194304)}else{if(!c)if(n=al(T),n!==null){if(i.flags|=128,c=!0,a=n.updateQueue,a!==null&&(i.updateQueue=a,i.flags|=4),Zo(_,!0),_.tail===null&&_.tailMode==="hidden"&&!T.alternate&&!Ht)return Mn(i),null}else 2*Te()-_.renderingStartTime>Bs&&a!==1073741824&&(i.flags|=128,c=!0,Zo(_,!1),i.lanes=4194304);_.isBackwards?(T.sibling=i.child,i.child=T):(a=_.last,a!==null?a.sibling=T:i.child=T,_.last=T)}return _.tail!==null?(i=_.tail,_.rendering=i,_.tail=i.sibling,_.renderingStartTime=Te(),i.sibling=null,a=Wt.current,kt(Wt,c?a&1|2:a&1),i):(Mn(i),null);case 22:case 23:return Zu(),c=i.memoizedState!==null,n!==null&&n.memoizedState!==null!==c&&(i.flags|=8192),c&&(i.mode&1)!==0?(jn&1073741824)!==0&&(Mn(i),i.subtreeFlags&6&&(i.flags|=8192)):Mn(i),null;case 24:return null;case 25:return null}throw Error(t(156,i.tag))}function dv(n,i){switch(lu(i),i.tag){case 1:return kn(i.type)&&$a(),n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 3:return Us(),zt(Un),zt(xn),Su(),n=i.flags,(n&65536)!==0&&(n&128)===0?(i.flags=n&-65537|128,i):null;case 5:return yu(i),null;case 13:if(zt(Wt),n=i.memoizedState,n!==null&&n.dehydrated!==null){if(i.alternate===null)throw Error(t(340));Ds()}return n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 19:return zt(Wt),null;case 4:return Us(),null;case 10:return pu(i.type._context),null;case 22:case 23:return Zu(),null;case 24:return null;default:return null}}var _l=!1,wn=!1,hv=typeof WeakSet=="function"?WeakSet:Set,He=null;function Fs(n,i){var a=n.ref;if(a!==null)if(typeof a=="function")try{a(null)}catch(c){Xt(n,i,c)}else a.current=null}function Vu(n,i,a){try{a()}catch(c){Xt(n,i,c)}}var mm=!1;function fv(n,i){if(Zc=ka,n=jf(),qc(n)){if("selectionStart"in n)var a={start:n.selectionStart,end:n.selectionEnd};else e:{a=(a=n.ownerDocument)&&a.defaultView||window;var c=a.getSelection&&a.getSelection();if(c&&c.rangeCount!==0){a=c.anchorNode;var f=c.anchorOffset,_=c.focusNode;c=c.focusOffset;try{a.nodeType,_.nodeType}catch{a=null;break e}var T=0,U=-1,O=-1,te=0,_e=0,ve=n,me=null;t:for(;;){for(var ke;ve!==a||f!==0&&ve.nodeType!==3||(U=T+f),ve!==_||c!==0&&ve.nodeType!==3||(O=T+c),ve.nodeType===3&&(T+=ve.nodeValue.length),(ke=ve.firstChild)!==null;)me=ve,ve=ke;for(;;){if(ve===n)break t;if(me===a&&++te===f&&(U=T),me===_&&++_e===c&&(O=T),(ke=ve.nextSibling)!==null)break;ve=me,me=ve.parentNode}ve=ke}a=U===-1||O===-1?null:{start:U,end:O}}else a=null}a=a||{start:0,end:0}}else a=null;for(eu={focusedElem:n,selectionRange:a},ka=!1,He=i;He!==null;)if(i=He,n=i.child,(i.subtreeFlags&1028)!==0&&n!==null)n.return=i,He=n;else for(;He!==null;){i=He;try{var Ge=i.alternate;if((i.flags&1024)!==0)switch(i.tag){case 0:case 11:case 15:break;case 1:if(Ge!==null){var qe=Ge.memoizedProps,jt=Ge.memoizedState,j=i.stateNode,H=j.getSnapshotBeforeUpdate(i.elementType===i.type?qe:hi(i.type,qe),jt);j.__reactInternalSnapshotBeforeUpdate=H}break;case 3:var Y=i.stateNode.containerInfo;Y.nodeType===1?Y.textContent="":Y.nodeType===9&&Y.documentElement&&Y.removeChild(Y.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(we){Xt(i,i.return,we)}if(n=i.sibling,n!==null){n.return=i.return,He=n;break}He=i.return}return Ge=mm,mm=!1,Ge}function ea(n,i,a){var c=i.updateQueue;if(c=c!==null?c.lastEffect:null,c!==null){var f=c=c.next;do{if((f.tag&n)===n){var _=f.destroy;f.destroy=void 0,_!==void 0&&Vu(i,a,_)}f=f.next}while(f!==c)}}function gl(n,i){if(i=i.updateQueue,i=i!==null?i.lastEffect:null,i!==null){var a=i=i.next;do{if((a.tag&n)===n){var c=a.create;a.destroy=c()}a=a.next}while(a!==i)}}function Hu(n){var i=n.ref;if(i!==null){var a=n.stateNode;switch(n.tag){case 5:n=a;break;default:n=a}typeof i=="function"?i(n):i.current=n}}function _m(n){var i=n.alternate;i!==null&&(n.alternate=null,_m(i)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(i=n.stateNode,i!==null&&(delete i[Ai],delete i[Go],delete i[ru],delete i[Kg],delete i[$g])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function gm(n){return n.tag===5||n.tag===3||n.tag===4}function vm(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||gm(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function Gu(n,i,a){var c=n.tag;if(c===5||c===6)n=n.stateNode,i?a.nodeType===8?a.parentNode.insertBefore(n,i):a.insertBefore(n,i):(a.nodeType===8?(i=a.parentNode,i.insertBefore(n,a)):(i=a,i.appendChild(n)),a=a._reactRootContainer,a!=null||i.onclick!==null||(i.onclick=Ya));else if(c!==4&&(n=n.child,n!==null))for(Gu(n,i,a),n=n.sibling;n!==null;)Gu(n,i,a),n=n.sibling}function Wu(n,i,a){var c=n.tag;if(c===5||c===6)n=n.stateNode,i?a.insertBefore(n,i):a.appendChild(n);else if(c!==4&&(n=n.child,n!==null))for(Wu(n,i,a),n=n.sibling;n!==null;)Wu(n,i,a),n=n.sibling}var pn=null,fi=!1;function xr(n,i,a){for(a=a.child;a!==null;)ym(n,i,a),a=a.sibling}function ym(n,i,a){if(Vt&&typeof Vt.onCommitFiberUnmount=="function")try{Vt.onCommitFiberUnmount(Nt,a)}catch{}switch(a.tag){case 5:wn||Fs(a,i);case 6:var c=pn,f=fi;pn=null,xr(n,i,a),pn=c,fi=f,pn!==null&&(fi?(n=pn,a=a.stateNode,n.nodeType===8?n.parentNode.removeChild(a):n.removeChild(a)):pn.removeChild(a.stateNode));break;case 18:pn!==null&&(fi?(n=pn,a=a.stateNode,n.nodeType===8?iu(n.parentNode,a):n.nodeType===1&&iu(n,a),Lo(n)):iu(pn,a.stateNode));break;case 4:c=pn,f=fi,pn=a.stateNode.containerInfo,fi=!0,xr(n,i,a),pn=c,fi=f;break;case 0:case 11:case 14:case 15:if(!wn&&(c=a.updateQueue,c!==null&&(c=c.lastEffect,c!==null))){f=c=c.next;do{var _=f,T=_.destroy;_=_.tag,T!==void 0&&((_&2)!==0||(_&4)!==0)&&Vu(a,i,T),f=f.next}while(f!==c)}xr(n,i,a);break;case 1:if(!wn&&(Fs(a,i),c=a.stateNode,typeof c.componentWillUnmount=="function"))try{c.props=a.memoizedProps,c.state=a.memoizedState,c.componentWillUnmount()}catch(U){Xt(a,i,U)}xr(n,i,a);break;case 21:xr(n,i,a);break;case 22:a.mode&1?(wn=(c=wn)||a.memoizedState!==null,xr(n,i,a),wn=c):xr(n,i,a);break;default:xr(n,i,a)}}function xm(n){var i=n.updateQueue;if(i!==null){n.updateQueue=null;var a=n.stateNode;a===null&&(a=n.stateNode=new hv),i.forEach(function(c){var f=Mv.bind(null,n,c);a.has(c)||(a.add(c),c.then(f,f))})}}function pi(n,i){var a=i.deletions;if(a!==null)for(var c=0;c<a.length;c++){var f=a[c];try{var _=n,T=i,U=T;e:for(;U!==null;){switch(U.tag){case 5:pn=U.stateNode,fi=!1;break e;case 3:pn=U.stateNode.containerInfo,fi=!0;break e;case 4:pn=U.stateNode.containerInfo,fi=!0;break e}U=U.return}if(pn===null)throw Error(t(160));ym(_,T,f),pn=null,fi=!1;var O=f.alternate;O!==null&&(O.return=null),f.return=null}catch(te){Xt(f,i,te)}}if(i.subtreeFlags&12854)for(i=i.child;i!==null;)Sm(i,n),i=i.sibling}function Sm(n,i){var a=n.alternate,c=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(pi(i,n),Ri(n),c&4){try{ea(3,n,n.return),gl(3,n)}catch(qe){Xt(n,n.return,qe)}try{ea(5,n,n.return)}catch(qe){Xt(n,n.return,qe)}}break;case 1:pi(i,n),Ri(n),c&512&&a!==null&&Fs(a,a.return);break;case 5:if(pi(i,n),Ri(n),c&512&&a!==null&&Fs(a,a.return),n.flags&32){var f=n.stateNode;try{Me(f,"")}catch(qe){Xt(n,n.return,qe)}}if(c&4&&(f=n.stateNode,f!=null)){var _=n.memoizedProps,T=a!==null?a.memoizedProps:_,U=n.type,O=n.updateQueue;if(n.updateQueue=null,O!==null)try{U==="input"&&_.type==="radio"&&_.name!=null&&mt(f,_),bt(U,T);var te=bt(U,_);for(T=0;T<O.length;T+=2){var _e=O[T],ve=O[T+1];_e==="style"?Ve(f,ve):_e==="dangerouslySetInnerHTML"?_t(f,ve):_e==="children"?Me(f,ve):A(f,_e,ve,te)}switch(U){case"input":et(f,_);break;case"textarea":ge(f,_);break;case"select":var me=f._wrapperState.wasMultiple;f._wrapperState.wasMultiple=!!_.multiple;var ke=_.value;ke!=null?b(f,!!_.multiple,ke,!1):me!==!!_.multiple&&(_.defaultValue!=null?b(f,!!_.multiple,_.defaultValue,!0):b(f,!!_.multiple,_.multiple?[]:"",!1))}f[Go]=_}catch(qe){Xt(n,n.return,qe)}}break;case 6:if(pi(i,n),Ri(n),c&4){if(n.stateNode===null)throw Error(t(162));f=n.stateNode,_=n.memoizedProps;try{f.nodeValue=_}catch(qe){Xt(n,n.return,qe)}}break;case 3:if(pi(i,n),Ri(n),c&4&&a!==null&&a.memoizedState.isDehydrated)try{Lo(i.containerInfo)}catch(qe){Xt(n,n.return,qe)}break;case 4:pi(i,n),Ri(n);break;case 13:pi(i,n),Ri(n),f=n.child,f.flags&8192&&(_=f.memoizedState!==null,f.stateNode.isHidden=_,!_||f.alternate!==null&&f.alternate.memoizedState!==null||(ju=Te())),c&4&&xm(n);break;case 22:if(_e=a!==null&&a.memoizedState!==null,n.mode&1?(wn=(te=wn)||_e,pi(i,n),wn=te):pi(i,n),Ri(n),c&8192){if(te=n.memoizedState!==null,(n.stateNode.isHidden=te)&&!_e&&(n.mode&1)!==0)for(He=n,_e=n.child;_e!==null;){for(ve=He=_e;He!==null;){switch(me=He,ke=me.child,me.tag){case 0:case 11:case 14:case 15:ea(4,me,me.return);break;case 1:Fs(me,me.return);var Ge=me.stateNode;if(typeof Ge.componentWillUnmount=="function"){c=me,a=me.return;try{i=c,Ge.props=i.memoizedProps,Ge.state=i.memoizedState,Ge.componentWillUnmount()}catch(qe){Xt(c,a,qe)}}break;case 5:Fs(me,me.return);break;case 22:if(me.memoizedState!==null){Em(ve);continue}}ke!==null?(ke.return=me,He=ke):Em(ve)}_e=_e.sibling}e:for(_e=null,ve=n;;){if(ve.tag===5){if(_e===null){_e=ve;try{f=ve.stateNode,te?(_=f.style,typeof _.setProperty=="function"?_.setProperty("display","none","important"):_.display="none"):(U=ve.stateNode,O=ve.memoizedProps.style,T=O!=null&&O.hasOwnProperty("display")?O.display:null,U.style.display=it("display",T))}catch(qe){Xt(n,n.return,qe)}}}else if(ve.tag===6){if(_e===null)try{ve.stateNode.nodeValue=te?"":ve.memoizedProps}catch(qe){Xt(n,n.return,qe)}}else if((ve.tag!==22&&ve.tag!==23||ve.memoizedState===null||ve===n)&&ve.child!==null){ve.child.return=ve,ve=ve.child;continue}if(ve===n)break e;for(;ve.sibling===null;){if(ve.return===null||ve.return===n)break e;_e===ve&&(_e=null),ve=ve.return}_e===ve&&(_e=null),ve.sibling.return=ve.return,ve=ve.sibling}}break;case 19:pi(i,n),Ri(n),c&4&&xm(n);break;case 21:break;default:pi(i,n),Ri(n)}}function Ri(n){var i=n.flags;if(i&2){try{e:{for(var a=n.return;a!==null;){if(gm(a)){var c=a;break e}a=a.return}throw Error(t(160))}switch(c.tag){case 5:var f=c.stateNode;c.flags&32&&(Me(f,""),c.flags&=-33);var _=vm(n);Wu(n,_,f);break;case 3:case 4:var T=c.stateNode.containerInfo,U=vm(n);Gu(n,U,T);break;default:throw Error(t(161))}}catch(O){Xt(n,n.return,O)}n.flags&=-3}i&4096&&(n.flags&=-4097)}function pv(n,i,a){He=n,Mm(n)}function Mm(n,i,a){for(var c=(n.mode&1)!==0;He!==null;){var f=He,_=f.child;if(f.tag===22&&c){var T=f.memoizedState!==null||_l;if(!T){var U=f.alternate,O=U!==null&&U.memoizedState!==null||wn;U=_l;var te=wn;if(_l=T,(wn=O)&&!te)for(He=f;He!==null;)T=He,O=T.child,T.tag===22&&T.memoizedState!==null?Tm(f):O!==null?(O.return=T,He=O):Tm(f);for(;_!==null;)He=_,Mm(_),_=_.sibling;He=f,_l=U,wn=te}wm(n)}else(f.subtreeFlags&8772)!==0&&_!==null?(_.return=f,He=_):wm(n)}}function wm(n){for(;He!==null;){var i=He;if((i.flags&8772)!==0){var a=i.alternate;try{if((i.flags&8772)!==0)switch(i.tag){case 0:case 11:case 15:wn||gl(5,i);break;case 1:var c=i.stateNode;if(i.flags&4&&!wn)if(a===null)c.componentDidMount();else{var f=i.elementType===i.type?a.memoizedProps:hi(i.type,a.memoizedProps);c.componentDidUpdate(f,a.memoizedState,c.__reactInternalSnapshotBeforeUpdate)}var _=i.updateQueue;_!==null&&Ep(i,_,c);break;case 3:var T=i.updateQueue;if(T!==null){if(a=null,i.child!==null)switch(i.child.tag){case 5:a=i.child.stateNode;break;case 1:a=i.child.stateNode}Ep(i,T,a)}break;case 5:var U=i.stateNode;if(a===null&&i.flags&4){a=U;var O=i.memoizedProps;switch(i.type){case"button":case"input":case"select":case"textarea":O.autoFocus&&a.focus();break;case"img":O.src&&(a.src=O.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(i.memoizedState===null){var te=i.alternate;if(te!==null){var _e=te.memoizedState;if(_e!==null){var ve=_e.dehydrated;ve!==null&&Lo(ve)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}wn||i.flags&512&&Hu(i)}catch(me){Xt(i,i.return,me)}}if(i===n){He=null;break}if(a=i.sibling,a!==null){a.return=i.return,He=a;break}He=i.return}}function Em(n){for(;He!==null;){var i=He;if(i===n){He=null;break}var a=i.sibling;if(a!==null){a.return=i.return,He=a;break}He=i.return}}function Tm(n){for(;He!==null;){var i=He;try{switch(i.tag){case 0:case 11:case 15:var a=i.return;try{gl(4,i)}catch(O){Xt(i,a,O)}break;case 1:var c=i.stateNode;if(typeof c.componentDidMount=="function"){var f=i.return;try{c.componentDidMount()}catch(O){Xt(i,f,O)}}var _=i.return;try{Hu(i)}catch(O){Xt(i,_,O)}break;case 5:var T=i.return;try{Hu(i)}catch(O){Xt(i,T,O)}}}catch(O){Xt(i,i.return,O)}if(i===n){He=null;break}var U=i.sibling;if(U!==null){U.return=i.return,He=U;break}He=i.return}}var mv=Math.ceil,vl=D.ReactCurrentDispatcher,qu=D.ReactCurrentOwner,ni=D.ReactCurrentBatchConfig,yt=0,on=null,Yt=null,mn=0,jn=0,Os=mr(0),Jt=0,ta=null,jr=0,yl=0,Xu=0,na=null,On=null,ju=0,Bs=1/0,qi=null,xl=!1,Yu=null,Sr=null,Sl=!1,Mr=null,Ml=0,ia=0,Ku=null,wl=-1,El=0;function Rn(){return(yt&6)!==0?Te():wl!==-1?wl:wl=Te()}function wr(n){return(n.mode&1)===0?1:(yt&2)!==0&&mn!==0?mn&-mn:Jg.transition!==null?(El===0&&(El=vs()),El):(n=Rt,n!==0||(n=window.event,n=n===void 0?16:bf(n.type)),n)}function mi(n,i,a,c){if(50<ia)throw ia=0,Ku=null,Error(t(185));ar(n,a,c),((yt&2)===0||n!==on)&&(n===on&&((yt&2)===0&&(yl|=a),Jt===4&&Er(n,mn)),Bn(n,c),a===1&&yt===0&&(i.mode&1)===0&&(Bs=Te()+500,Ja&&gr()))}function Bn(n,i){var a=n.callbackNode;Ao(n,i);var c=Ut(n,n===on?mn:0);if(c===0)a!==null&&X(a),n.callbackNode=null,n.callbackPriority=0;else if(i=c&-c,n.callbackPriority!==i){if(a!=null&&X(a),i===1)n.tag===0?Qg(bm.bind(null,n)):hp(bm.bind(null,n)),jg(function(){(yt&6)===0&&gr()}),a=null;else{switch(yf(c)){case 1:a=Je;break;case 4:a=tt;break;case 16:a=je;break;case 536870912:a=Lt;break;default:a=je}a=Um(a,Am.bind(null,n))}n.callbackPriority=i,n.callbackNode=a}}function Am(n,i){if(wl=-1,El=0,(yt&6)!==0)throw Error(t(327));var a=n.callbackNode;if(zs()&&n.callbackNode!==a)return null;var c=Ut(n,n===on?mn:0);if(c===0)return null;if((c&30)!==0||(c&n.expiredLanes)!==0||i)i=Tl(n,c);else{i=c;var f=yt;yt|=2;var _=Rm();(on!==n||mn!==i)&&(qi=null,Bs=Te()+500,Kr(n,i));do try{vv();break}catch(U){Cm(n,U)}while(!0);fu(),vl.current=_,yt=f,Yt!==null?i=0:(on=null,mn=0,i=Jt)}if(i!==0){if(i===2&&(f=yn(n),f!==0&&(c=f,i=$u(n,f))),i===1)throw a=ta,Kr(n,0),Er(n,c),Bn(n,Te()),a;if(i===6)Er(n,c);else{if(f=n.current.alternate,(c&30)===0&&!_v(f)&&(i=Tl(n,c),i===2&&(_=yn(n),_!==0&&(c=_,i=$u(n,_))),i===1))throw a=ta,Kr(n,0),Er(n,c),Bn(n,Te()),a;switch(n.finishedWork=f,n.finishedLanes=c,i){case 0:case 1:throw Error(t(345));case 2:$r(n,On,qi);break;case 3:if(Er(n,c),(c&130023424)===c&&(i=ju+500-Te(),10<i)){if(Ut(n,0)!==0)break;if(f=n.suspendedLanes,(f&c)!==c){Rn(),n.pingedLanes|=n.suspendedLanes&f;break}n.timeoutHandle=nu($r.bind(null,n,On,qi),i);break}$r(n,On,qi);break;case 4:if(Er(n,c),(c&4194240)===c)break;for(i=n.eventTimes,f=-1;0<c;){var T=31-ze(c);_=1<<T,T=i[T],T>f&&(f=T),c&=~_}if(c=f,c=Te()-c,c=(120>c?120:480>c?480:1080>c?1080:1920>c?1920:3e3>c?3e3:4320>c?4320:1960*mv(c/1960))-c,10<c){n.timeoutHandle=nu($r.bind(null,n,On,qi),c);break}$r(n,On,qi);break;case 5:$r(n,On,qi);break;default:throw Error(t(329))}}}return Bn(n,Te()),n.callbackNode===a?Am.bind(null,n):null}function $u(n,i){var a=na;return n.current.memoizedState.isDehydrated&&(Kr(n,i).flags|=256),n=Tl(n,i),n!==2&&(i=On,On=a,i!==null&&Qu(i)),n}function Qu(n){On===null?On=n:On.push.apply(On,n)}function _v(n){for(var i=n;;){if(i.flags&16384){var a=i.updateQueue;if(a!==null&&(a=a.stores,a!==null))for(var c=0;c<a.length;c++){var f=a[c],_=f.getSnapshot;f=f.value;try{if(!ui(_(),f))return!1}catch{return!1}}}if(a=i.child,i.subtreeFlags&16384&&a!==null)a.return=i,i=a;else{if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function Er(n,i){for(i&=~Xu,i&=~yl,n.suspendedLanes|=i,n.pingedLanes&=~i,n=n.expirationTimes;0<i;){var a=31-ze(i),c=1<<a;n[a]=-1,i&=~c}}function bm(n){if((yt&6)!==0)throw Error(t(327));zs();var i=Ut(n,0);if((i&1)===0)return Bn(n,Te()),null;var a=Tl(n,i);if(n.tag!==0&&a===2){var c=yn(n);c!==0&&(i=c,a=$u(n,c))}if(a===1)throw a=ta,Kr(n,0),Er(n,i),Bn(n,Te()),a;if(a===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=i,$r(n,On,qi),Bn(n,Te()),null}function Ju(n,i){var a=yt;yt|=1;try{return n(i)}finally{yt=a,yt===0&&(Bs=Te()+500,Ja&&gr())}}function Yr(n){Mr!==null&&Mr.tag===0&&(yt&6)===0&&zs();var i=yt;yt|=1;var a=ni.transition,c=Rt;try{if(ni.transition=null,Rt=1,n)return n()}finally{Rt=c,ni.transition=a,yt=i,(yt&6)===0&&gr()}}function Zu(){jn=Os.current,zt(Os)}function Kr(n,i){n.finishedWork=null,n.finishedLanes=0;var a=n.timeoutHandle;if(a!==-1&&(n.timeoutHandle=-1,Xg(a)),Yt!==null)for(a=Yt.return;a!==null;){var c=a;switch(lu(c),c.tag){case 1:c=c.type.childContextTypes,c!=null&&$a();break;case 3:Us(),zt(Un),zt(xn),Su();break;case 5:yu(c);break;case 4:Us();break;case 13:zt(Wt);break;case 19:zt(Wt);break;case 10:pu(c.type._context);break;case 22:case 23:Zu()}a=a.return}if(on=n,Yt=n=Tr(n.current,null),mn=jn=i,Jt=0,ta=null,Xu=yl=jr=0,On=na=null,Wr!==null){for(i=0;i<Wr.length;i++)if(a=Wr[i],c=a.interleaved,c!==null){a.interleaved=null;var f=c.next,_=a.pending;if(_!==null){var T=_.next;_.next=f,c.next=T}a.pending=c}Wr=null}return n}function Cm(n,i){do{var a=Yt;try{if(fu(),ll.current=hl,cl){for(var c=qt.memoizedState;c!==null;){var f=c.queue;f!==null&&(f.pending=null),c=c.next}cl=!1}if(Xr=0,sn=Qt=qt=null,Ko=!1,$o=0,qu.current=null,a===null||a.return===null){Jt=1,ta=i,Yt=null;break}e:{var _=n,T=a.return,U=a,O=i;if(i=mn,U.flags|=32768,O!==null&&typeof O=="object"&&typeof O.then=="function"){var te=O,_e=U,ve=_e.tag;if((_e.mode&1)===0&&(ve===0||ve===11||ve===15)){var me=_e.alternate;me?(_e.updateQueue=me.updateQueue,_e.memoizedState=me.memoizedState,_e.lanes=me.lanes):(_e.updateQueue=null,_e.memoizedState=null)}var ke=Zp(T);if(ke!==null){ke.flags&=-257,em(ke,T,U,_,i),ke.mode&1&&Jp(_,te,i),i=ke,O=te;var Ge=i.updateQueue;if(Ge===null){var qe=new Set;qe.add(O),i.updateQueue=qe}else Ge.add(O);break e}else{if((i&1)===0){Jp(_,te,i),ed();break e}O=Error(t(426))}}else if(Ht&&U.mode&1){var jt=Zp(T);if(jt!==null){(jt.flags&65536)===0&&(jt.flags|=256),em(jt,T,U,_,i),du(ks(O,U));break e}}_=O=ks(O,U),Jt!==4&&(Jt=2),na===null?na=[_]:na.push(_),_=T;do{switch(_.tag){case 3:_.flags|=65536,i&=-i,_.lanes|=i;var j=$p(_,O,i);wp(_,j);break e;case 1:U=O;var H=_.type,Y=_.stateNode;if((_.flags&128)===0&&(typeof H.getDerivedStateFromError=="function"||Y!==null&&typeof Y.componentDidCatch=="function"&&(Sr===null||!Sr.has(Y)))){_.flags|=65536,i&=-i,_.lanes|=i;var we=Qp(_,U,i);wp(_,we);break e}}_=_.return}while(_!==null)}Dm(a)}catch(Ye){i=Ye,Yt===a&&a!==null&&(Yt=a=a.return);continue}break}while(!0)}function Rm(){var n=vl.current;return vl.current=hl,n===null?hl:n}function ed(){(Jt===0||Jt===3||Jt===2)&&(Jt=4),on===null||(jr&268435455)===0&&(yl&268435455)===0||Er(on,mn)}function Tl(n,i){var a=yt;yt|=2;var c=Rm();(on!==n||mn!==i)&&(qi=null,Kr(n,i));do try{gv();break}catch(f){Cm(n,f)}while(!0);if(fu(),yt=a,vl.current=c,Yt!==null)throw Error(t(261));return on=null,mn=0,Jt}function gv(){for(;Yt!==null;)Pm(Yt)}function vv(){for(;Yt!==null&&!Ee();)Pm(Yt)}function Pm(n){var i=Nm(n.alternate,n,jn);n.memoizedProps=n.pendingProps,i===null?Dm(n):Yt=i,qu.current=null}function Dm(n){var i=n;do{var a=i.alternate;if(n=i.return,(i.flags&32768)===0){if(a=uv(a,i,jn),a!==null){Yt=a;return}}else{if(a=dv(a,i),a!==null){a.flags&=32767,Yt=a;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{Jt=6,Yt=null;return}}if(i=i.sibling,i!==null){Yt=i;return}Yt=i=n}while(i!==null);Jt===0&&(Jt=5)}function $r(n,i,a){var c=Rt,f=ni.transition;try{ni.transition=null,Rt=1,yv(n,i,a,c)}finally{ni.transition=f,Rt=c}return null}function yv(n,i,a,c){do zs();while(Mr!==null);if((yt&6)!==0)throw Error(t(327));a=n.finishedWork;var f=n.finishedLanes;if(a===null)return null;if(n.finishedWork=null,n.finishedLanes=0,a===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var _=a.lanes|a.childLanes;if(Z0(n,_),n===on&&(Yt=on=null,mn=0),(a.subtreeFlags&2064)===0&&(a.flags&2064)===0||Sl||(Sl=!0,Um(je,function(){return zs(),null})),_=(a.flags&15990)!==0,(a.subtreeFlags&15990)!==0||_){_=ni.transition,ni.transition=null;var T=Rt;Rt=1;var U=yt;yt|=4,qu.current=null,fv(n,a),Sm(a,n),Bg(eu),ka=!!Zc,eu=Zc=null,n.current=a,pv(a),Ie(),yt=U,Rt=T,ni.transition=_}else n.current=a;if(Sl&&(Sl=!1,Mr=n,Ml=f),_=n.pendingLanes,_===0&&(Sr=null),xt(a.stateNode),Bn(n,Te()),i!==null)for(c=n.onRecoverableError,a=0;a<i.length;a++)f=i[a],c(f.value,{componentStack:f.stack,digest:f.digest});if(xl)throw xl=!1,n=Yu,Yu=null,n;return(Ml&1)!==0&&n.tag!==0&&zs(),_=n.pendingLanes,(_&1)!==0?n===Ku?ia++:(ia=0,Ku=n):ia=0,gr(),null}function zs(){if(Mr!==null){var n=yf(Ml),i=ni.transition,a=Rt;try{if(ni.transition=null,Rt=16>n?16:n,Mr===null)var c=!1;else{if(n=Mr,Mr=null,Ml=0,(yt&6)!==0)throw Error(t(331));var f=yt;for(yt|=4,He=n.current;He!==null;){var _=He,T=_.child;if((He.flags&16)!==0){var U=_.deletions;if(U!==null){for(var O=0;O<U.length;O++){var te=U[O];for(He=te;He!==null;){var _e=He;switch(_e.tag){case 0:case 11:case 15:ea(8,_e,_)}var ve=_e.child;if(ve!==null)ve.return=_e,He=ve;else for(;He!==null;){_e=He;var me=_e.sibling,ke=_e.return;if(_m(_e),_e===te){He=null;break}if(me!==null){me.return=ke,He=me;break}He=ke}}}var Ge=_.alternate;if(Ge!==null){var qe=Ge.child;if(qe!==null){Ge.child=null;do{var jt=qe.sibling;qe.sibling=null,qe=jt}while(qe!==null)}}He=_}}if((_.subtreeFlags&2064)!==0&&T!==null)T.return=_,He=T;else e:for(;He!==null;){if(_=He,(_.flags&2048)!==0)switch(_.tag){case 0:case 11:case 15:ea(9,_,_.return)}var j=_.sibling;if(j!==null){j.return=_.return,He=j;break e}He=_.return}}var H=n.current;for(He=H;He!==null;){T=He;var Y=T.child;if((T.subtreeFlags&2064)!==0&&Y!==null)Y.return=T,He=Y;else e:for(T=H;He!==null;){if(U=He,(U.flags&2048)!==0)try{switch(U.tag){case 0:case 11:case 15:gl(9,U)}}catch(Ye){Xt(U,U.return,Ye)}if(U===T){He=null;break e}var we=U.sibling;if(we!==null){we.return=U.return,He=we;break e}He=U.return}}if(yt=f,gr(),Vt&&typeof Vt.onPostCommitFiberRoot=="function")try{Vt.onPostCommitFiberRoot(Nt,n)}catch{}c=!0}return c}finally{Rt=a,ni.transition=i}}return!1}function Lm(n,i,a){i=ks(a,i),i=$p(n,i,1),n=yr(n,i,1),i=Rn(),n!==null&&(ar(n,1,i),Bn(n,i))}function Xt(n,i,a){if(n.tag===3)Lm(n,n,a);else for(;i!==null;){if(i.tag===3){Lm(i,n,a);break}else if(i.tag===1){var c=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof c.componentDidCatch=="function"&&(Sr===null||!Sr.has(c))){n=ks(a,n),n=Qp(i,n,1),i=yr(i,n,1),n=Rn(),i!==null&&(ar(i,1,n),Bn(i,n));break}}i=i.return}}function xv(n,i,a){var c=n.pingCache;c!==null&&c.delete(i),i=Rn(),n.pingedLanes|=n.suspendedLanes&a,on===n&&(mn&a)===a&&(Jt===4||Jt===3&&(mn&130023424)===mn&&500>Te()-ju?Kr(n,0):Xu|=a),Bn(n,i)}function Im(n,i){i===0&&((n.mode&1)===0?i=1:(i=rn,rn<<=1,(rn&130023424)===0&&(rn=4194304)));var a=Rn();n=Hi(n,i),n!==null&&(ar(n,i,a),Bn(n,a))}function Sv(n){var i=n.memoizedState,a=0;i!==null&&(a=i.retryLane),Im(n,a)}function Mv(n,i){var a=0;switch(n.tag){case 13:var c=n.stateNode,f=n.memoizedState;f!==null&&(a=f.retryLane);break;case 19:c=n.stateNode;break;default:throw Error(t(314))}c!==null&&c.delete(i),Im(n,a)}var Nm;Nm=function(n,i,a){if(n!==null)if(n.memoizedProps!==i.pendingProps||Un.current)Fn=!0;else{if((n.lanes&a)===0&&(i.flags&128)===0)return Fn=!1,cv(n,i,a);Fn=(n.flags&131072)!==0}else Fn=!1,Ht&&(i.flags&1048576)!==0&&fp(i,el,i.index);switch(i.lanes=0,i.tag){case 2:var c=i.type;ml(n,i),n=i.pendingProps;var f=Cs(i,xn.current);Ns(i,a),f=Eu(null,i,c,n,f,a);var _=Tu();return i.flags|=1,typeof f=="object"&&f!==null&&typeof f.render=="function"&&f.$$typeof===void 0?(i.tag=1,i.memoizedState=null,i.updateQueue=null,kn(c)?(_=!0,Qa(i)):_=!1,i.memoizedState=f.state!==null&&f.state!==void 0?f.state:null,gu(i),f.updater=fl,i.stateNode=f,f._reactInternals=i,Du(i,c,n,a),i=Uu(null,i,c,!0,_,a)):(i.tag=0,Ht&&_&&au(i),Cn(null,i,f,a),i=i.child),i;case 16:c=i.elementType;e:{switch(ml(n,i),n=i.pendingProps,f=c._init,c=f(c._payload),i.type=c,f=i.tag=Ev(c),n=hi(c,n),f){case 0:i=Nu(null,i,c,n,a);break e;case 1:i=om(null,i,c,n,a);break e;case 11:i=tm(null,i,c,n,a);break e;case 14:i=nm(null,i,c,hi(c.type,n),a);break e}throw Error(t(306,c,""))}return i;case 0:return c=i.type,f=i.pendingProps,f=i.elementType===c?f:hi(c,f),Nu(n,i,c,f,a);case 1:return c=i.type,f=i.pendingProps,f=i.elementType===c?f:hi(c,f),om(n,i,c,f,a);case 3:e:{if(am(i),n===null)throw Error(t(387));c=i.pendingProps,_=i.memoizedState,f=_.element,Mp(n,i),ol(i,c,null,a);var T=i.memoizedState;if(c=T.element,_.isDehydrated)if(_={element:c,isDehydrated:!1,cache:T.cache,pendingSuspenseBoundaries:T.pendingSuspenseBoundaries,transitions:T.transitions},i.updateQueue.baseState=_,i.memoizedState=_,i.flags&256){f=ks(Error(t(423)),i),i=lm(n,i,c,a,f);break e}else if(c!==f){f=ks(Error(t(424)),i),i=lm(n,i,c,a,f);break e}else for(Xn=pr(i.stateNode.containerInfo.firstChild),qn=i,Ht=!0,di=null,a=xp(i,null,c,a),i.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(Ds(),c===f){i=Wi(n,i,a);break e}Cn(n,i,c,a)}i=i.child}return i;case 5:return Tp(i),n===null&&uu(i),c=i.type,f=i.pendingProps,_=n!==null?n.memoizedProps:null,T=f.children,tu(c,f)?T=null:_!==null&&tu(c,_)&&(i.flags|=32),sm(n,i),Cn(n,i,T,a),i.child;case 6:return n===null&&uu(i),null;case 13:return cm(n,i,a);case 4:return vu(i,i.stateNode.containerInfo),c=i.pendingProps,n===null?i.child=Ls(i,null,c,a):Cn(n,i,c,a),i.child;case 11:return c=i.type,f=i.pendingProps,f=i.elementType===c?f:hi(c,f),tm(n,i,c,f,a);case 7:return Cn(n,i,i.pendingProps,a),i.child;case 8:return Cn(n,i,i.pendingProps.children,a),i.child;case 12:return Cn(n,i,i.pendingProps.children,a),i.child;case 10:e:{if(c=i.type._context,f=i.pendingProps,_=i.memoizedProps,T=f.value,kt(il,c._currentValue),c._currentValue=T,_!==null)if(ui(_.value,T)){if(_.children===f.children&&!Un.current){i=Wi(n,i,a);break e}}else for(_=i.child,_!==null&&(_.return=i);_!==null;){var U=_.dependencies;if(U!==null){T=_.child;for(var O=U.firstContext;O!==null;){if(O.context===c){if(_.tag===1){O=Gi(-1,a&-a),O.tag=2;var te=_.updateQueue;if(te!==null){te=te.shared;var _e=te.pending;_e===null?O.next=O:(O.next=_e.next,_e.next=O),te.pending=O}}_.lanes|=a,O=_.alternate,O!==null&&(O.lanes|=a),mu(_.return,a,i),U.lanes|=a;break}O=O.next}}else if(_.tag===10)T=_.type===i.type?null:_.child;else if(_.tag===18){if(T=_.return,T===null)throw Error(t(341));T.lanes|=a,U=T.alternate,U!==null&&(U.lanes|=a),mu(T,a,i),T=_.sibling}else T=_.child;if(T!==null)T.return=_;else for(T=_;T!==null;){if(T===i){T=null;break}if(_=T.sibling,_!==null){_.return=T.return,T=_;break}T=T.return}_=T}Cn(n,i,f.children,a),i=i.child}return i;case 9:return f=i.type,c=i.pendingProps.children,Ns(i,a),f=ei(f),c=c(f),i.flags|=1,Cn(n,i,c,a),i.child;case 14:return c=i.type,f=hi(c,i.pendingProps),f=hi(c.type,f),nm(n,i,c,f,a);case 15:return im(n,i,i.type,i.pendingProps,a);case 17:return c=i.type,f=i.pendingProps,f=i.elementType===c?f:hi(c,f),ml(n,i),i.tag=1,kn(c)?(n=!0,Qa(i)):n=!1,Ns(i,a),Yp(i,c,f),Du(i,c,f,a),Uu(null,i,c,!0,n,a);case 19:return dm(n,i,a);case 22:return rm(n,i,a)}throw Error(t(156,i.tag))};function Um(n,i){return ee(n,i)}function wv(n,i,a,c){this.tag=n,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=c,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ii(n,i,a,c){return new wv(n,i,a,c)}function td(n){return n=n.prototype,!(!n||!n.isReactComponent)}function Ev(n){if(typeof n=="function")return td(n)?1:0;if(n!=null){if(n=n.$$typeof,n===K)return 11;if(n===he)return 14}return 2}function Tr(n,i){var a=n.alternate;return a===null?(a=ii(n.tag,i,n.key,n.mode),a.elementType=n.elementType,a.type=n.type,a.stateNode=n.stateNode,a.alternate=n,n.alternate=a):(a.pendingProps=i,a.type=n.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=n.flags&14680064,a.childLanes=n.childLanes,a.lanes=n.lanes,a.child=n.child,a.memoizedProps=n.memoizedProps,a.memoizedState=n.memoizedState,a.updateQueue=n.updateQueue,i=n.dependencies,a.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},a.sibling=n.sibling,a.index=n.index,a.ref=n.ref,a}function Al(n,i,a,c,f,_){var T=2;if(c=n,typeof n=="function")td(n)&&(T=1);else if(typeof n=="string")T=5;else e:switch(n){case I:return Qr(a.children,f,_,i);case z:T=8,f|=8;break;case ae:return n=ii(12,a,i,f|2),n.elementType=ae,n.lanes=_,n;case Q:return n=ii(13,a,i,f),n.elementType=Q,n.lanes=_,n;case oe:return n=ii(19,a,i,f),n.elementType=oe,n.lanes=_,n;case le:return bl(a,f,_,i);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case w:T=10;break e;case P:T=9;break e;case K:T=11;break e;case he:T=14;break e;case ne:T=16,c=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return i=ii(T,a,i,f),i.elementType=n,i.type=c,i.lanes=_,i}function Qr(n,i,a,c){return n=ii(7,n,c,i),n.lanes=a,n}function bl(n,i,a,c){return n=ii(22,n,c,i),n.elementType=le,n.lanes=a,n.stateNode={isHidden:!1},n}function nd(n,i,a){return n=ii(6,n,null,i),n.lanes=a,n}function id(n,i,a){return i=ii(4,n.children!==null?n.children:[],n.key,i),i.lanes=a,i.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},i}function Tv(n,i,a,c,f){this.tag=i,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=bo(0),this.expirationTimes=bo(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=bo(0),this.identifierPrefix=c,this.onRecoverableError=f,this.mutableSourceEagerHydrationData=null}function rd(n,i,a,c,f,_,T,U,O){return n=new Tv(n,i,a,U,O),i===1?(i=1,_===!0&&(i|=8)):i=0,_=ii(3,null,null,i),n.current=_,_.stateNode=n,_.memoizedState={element:c,isDehydrated:a,cache:null,transitions:null,pendingSuspenseBoundaries:null},gu(_),n}function Av(n,i,a){var c=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:k,key:c==null?null:""+c,children:n,containerInfo:i,implementation:a}}function km(n){if(!n)return _r;n=n._reactInternals;e:{if(ki(n)!==n||n.tag!==1)throw Error(t(170));var i=n;do{switch(i.tag){case 3:i=i.stateNode.context;break e;case 1:if(kn(i.type)){i=i.stateNode.__reactInternalMemoizedMergedChildContext;break e}}i=i.return}while(i!==null);throw Error(t(171))}if(n.tag===1){var a=n.type;if(kn(a))return up(n,a,i)}return i}function Fm(n,i,a,c,f,_,T,U,O){return n=rd(a,c,!0,n,f,_,T,U,O),n.context=km(null),a=n.current,c=Rn(),f=wr(a),_=Gi(c,f),_.callback=i??null,yr(a,_,f),n.current.lanes=f,ar(n,f,c),Bn(n,c),n}function Cl(n,i,a,c){var f=i.current,_=Rn(),T=wr(f);return a=km(a),i.context===null?i.context=a:i.pendingContext=a,i=Gi(_,T),i.payload={element:n},c=c===void 0?null:c,c!==null&&(i.callback=c),n=yr(f,i,T),n!==null&&(mi(n,f,T,_),sl(n,f,T)),T}function Rl(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Om(n,i){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var a=n.retryLane;n.retryLane=a!==0&&a<i?a:i}}function sd(n,i){Om(n,i),(n=n.alternate)&&Om(n,i)}function bv(){return null}var Bm=typeof reportError=="function"?reportError:function(n){console.error(n)};function od(n){this._internalRoot=n}Pl.prototype.render=od.prototype.render=function(n){var i=this._internalRoot;if(i===null)throw Error(t(409));Cl(n,i,null,null)},Pl.prototype.unmount=od.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var i=n.containerInfo;Yr(function(){Cl(null,n,null,null)}),i[Oi]=null}};function Pl(n){this._internalRoot=n}Pl.prototype.unstable_scheduleHydration=function(n){if(n){var i=Mf();n={blockedOn:null,target:n,priority:i};for(var a=0;a<dr.length&&i!==0&&i<dr[a].priority;a++);dr.splice(a,0,n),a===0&&Tf(n)}};function ad(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function Dl(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function zm(){}function Cv(n,i,a,c,f){if(f){if(typeof c=="function"){var _=c;c=function(){var te=Rl(T);_.call(te)}}var T=Fm(i,c,n,0,null,!1,!1,"",zm);return n._reactRootContainer=T,n[Oi]=T.current,Vo(n.nodeType===8?n.parentNode:n),Yr(),T}for(;f=n.lastChild;)n.removeChild(f);if(typeof c=="function"){var U=c;c=function(){var te=Rl(O);U.call(te)}}var O=rd(n,0,!1,null,null,!1,!1,"",zm);return n._reactRootContainer=O,n[Oi]=O.current,Vo(n.nodeType===8?n.parentNode:n),Yr(function(){Cl(i,O,a,c)}),O}function Ll(n,i,a,c,f){var _=a._reactRootContainer;if(_){var T=_;if(typeof f=="function"){var U=f;f=function(){var O=Rl(T);U.call(O)}}Cl(i,T,n,f)}else T=Cv(a,i,n,f,c);return Rl(T)}xf=function(n){switch(n.tag){case 3:var i=n.stateNode;if(i.current.memoizedState.isDehydrated){var a=Fi(i.pendingLanes);a!==0&&(Dc(i,a|1),Bn(i,Te()),(yt&6)===0&&(Bs=Te()+500,gr()))}break;case 13:Yr(function(){var c=Hi(n,1);if(c!==null){var f=Rn();mi(c,n,1,f)}}),sd(n,1)}},Lc=function(n){if(n.tag===13){var i=Hi(n,134217728);if(i!==null){var a=Rn();mi(i,n,134217728,a)}sd(n,134217728)}},Sf=function(n){if(n.tag===13){var i=wr(n),a=Hi(n,i);if(a!==null){var c=Rn();mi(a,n,i,c)}sd(n,i)}},Mf=function(){return Rt},wf=function(n,i){var a=Rt;try{return Rt=n,i()}finally{Rt=a}},re=function(n,i,a){switch(i){case"input":if(et(n,a),i=a.name,a.type==="radio"&&i!=null){for(a=n;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll("input[name="+JSON.stringify(""+i)+'][type="radio"]'),i=0;i<a.length;i++){var c=a[i];if(c!==n&&c.form===n.form){var f=Ka(c);if(!f)throw Error(t(90));ht(c),et(c,f)}}}break;case"textarea":ge(n,a);break;case"select":i=a.value,i!=null&&b(n,!!a.multiple,i,!1)}},fn=Ju,gt=Yr;var Rv={usingClientEntryPoint:!1,Events:[Wo,As,Ka,pt,Gt,Ju]},ra={findFiberByHostInstance:zr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Pv={bundleType:ra.bundleType,version:ra.version,rendererPackageName:ra.rendererPackageName,rendererConfig:ra.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:D.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=q(n),n===null?null:n.stateNode},findFiberByHostInstance:ra.findFiberByHostInstance||bv,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Il=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Il.isDisabled&&Il.supportsFiber)try{Nt=Il.inject(Pv),Vt=Il}catch{}}return zn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Rv,zn.createPortal=function(n,i){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!ad(i))throw Error(t(200));return Av(n,i,null,a)},zn.createRoot=function(n,i){if(!ad(n))throw Error(t(299));var a=!1,c="",f=Bm;return i!=null&&(i.unstable_strictMode===!0&&(a=!0),i.identifierPrefix!==void 0&&(c=i.identifierPrefix),i.onRecoverableError!==void 0&&(f=i.onRecoverableError)),i=rd(n,1,!1,null,null,a,!1,c,f),n[Oi]=i.current,Vo(n.nodeType===8?n.parentNode:n),new od(i)},zn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var i=n._reactInternals;if(i===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=q(i),n=n===null?null:n.stateNode,n},zn.flushSync=function(n){return Yr(n)},zn.hydrate=function(n,i,a){if(!Dl(i))throw Error(t(200));return Ll(null,n,i,!0,a)},zn.hydrateRoot=function(n,i,a){if(!ad(n))throw Error(t(405));var c=a!=null&&a.hydratedSources||null,f=!1,_="",T=Bm;if(a!=null&&(a.unstable_strictMode===!0&&(f=!0),a.identifierPrefix!==void 0&&(_=a.identifierPrefix),a.onRecoverableError!==void 0&&(T=a.onRecoverableError)),i=Fm(i,null,n,1,a??null,f,!1,_,T),n[Oi]=i.current,Vo(n),c)for(n=0;n<c.length;n++)a=c[n],f=a._getVersion,f=f(a._source),i.mutableSourceEagerHydrationData==null?i.mutableSourceEagerHydrationData=[a,f]:i.mutableSourceEagerHydrationData.push(a,f);return new Pl(i)},zn.render=function(n,i,a){if(!Dl(i))throw Error(t(200));return Ll(null,n,i,!1,a)},zn.unmountComponentAtNode=function(n){if(!Dl(n))throw Error(t(40));return n._reactRootContainer?(Yr(function(){Ll(null,null,n,!1,function(){n._reactRootContainer=null,n[Oi]=null})}),!0):!1},zn.unstable_batchedUpdates=Ju,zn.unstable_renderSubtreeIntoContainer=function(n,i,a,c){if(!Dl(a))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return Ll(n,i,a,!1,c)},zn.version="18.3.1-next-f1338f8080-20240426",zn}var Ym;function Bv(){if(Ym)return ud.exports;Ym=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(e){console.error(e)}}return s(),ud.exports=Ov(),ud.exports}var Km;function zv(){if(Km)return Nl;Km=1;var s=Bv();return Nl.createRoot=s.createRoot,Nl.hydrateRoot=s.hydrateRoot,Nl}var Vv=zv();const Hv=s0(Vv);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const jh="169",Gv=0,$m=1,Wv=2,o0=1,a0=2,Qi=3,Fr=0,Nn=1,Di=2,tr=0,lo=1,Jd=2,Qm=3,Jm=4,qv=5,as=100,Xv=101,jv=102,Yv=103,Kv=104,$v=200,Qv=201,Jv=202,Zv=203,Zd=204,eh=205,ey=206,ty=207,ny=208,iy=209,ry=210,sy=211,oy=212,ay=213,ly=214,th=0,nh=1,ih=2,ho=3,rh=4,sh=5,oh=6,ah=7,l0=0,cy=1,uy=2,kr=0,c0=1,u0=2,d0=3,Yh=4,dy=5,h0=6,f0=7,p0=300,fo=301,po=302,lh=303,ch=304,bc=306,uh=1e3,cs=1001,dh=1002,Vn=1003,hy=1004,Ul=1005,Si=1006,fd=1007,us=1008,rr=1009,m0=1010,_0=1011,wa=1012,Kh=1013,ds=1014,Li=1015,nr=1016,$h=1017,Qh=1018,mo=1020,g0=35902,v0=1021,y0=1022,wi=1023,x0=1024,S0=1025,co=1026,_o=1027,Jh=1028,Zh=1029,M0=1030,ef=1031,tf=1033,dc=33776,hc=33777,fc=33778,pc=33779,hh=35840,fh=35841,ph=35842,mh=35843,_h=36196,gh=37492,vh=37496,yh=37808,xh=37809,Sh=37810,Mh=37811,wh=37812,Eh=37813,Th=37814,Ah=37815,bh=37816,Ch=37817,Rh=37818,Ph=37819,Dh=37820,Lh=37821,mc=36492,Ih=36494,Nh=36495,w0=36283,Uh=36284,kh=36285,Fh=36286,fy=3200,py=3201,E0=0,my=1,Nr="",yi="srgb",Or="srgb-linear",nf="display-p3",Cc="display-p3-linear",yc="linear",Ft="srgb",xc="rec709",Sc="p3",Vs=7680,Zm=519,_y=512,gy=513,vy=514,T0=515,yy=516,xy=517,Sy=518,My=519,Oh=35044,e_="300 es",Zi=2e3,Mc=2001;class xo{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const r=this._listeners;return r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const o=this._listeners[e];if(o!==void 0){const l=o.indexOf(t);l!==-1&&o.splice(l,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const r=this._listeners[e.type];if(r!==void 0){e.target=this;const o=r.slice(0);for(let l=0,u=o.length;l<u;l++)o[l].call(this,e);e.target=null}}}const En=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let t_=1234567;const ya=Math.PI/180,Ea=180/Math.PI;function ir(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(En[s&255]+En[s>>8&255]+En[s>>16&255]+En[s>>24&255]+"-"+En[e&255]+En[e>>8&255]+"-"+En[e>>16&15|64]+En[e>>24&255]+"-"+En[t&63|128]+En[t>>8&255]+"-"+En[t>>16&255]+En[t>>24&255]+En[r&255]+En[r>>8&255]+En[r>>16&255]+En[r>>24&255]).toLowerCase()}function un(s,e,t){return Math.max(e,Math.min(t,s))}function rf(s,e){return(s%e+e)%e}function wy(s,e,t,r,o){return r+(s-e)*(o-r)/(t-e)}function Ey(s,e,t){return s!==e?(t-s)/(e-s):0}function xa(s,e,t){return(1-t)*s+t*e}function Ty(s,e,t,r){return xa(s,e,1-Math.exp(-t*r))}function Ay(s,e=1){return e-Math.abs(rf(s,e*2)-e)}function by(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Cy(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Ry(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Py(s,e){return s+Math.random()*(e-s)}function Dy(s){return s*(.5-Math.random())}function Ly(s){s!==void 0&&(t_=s);let e=t_+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Iy(s){return s*ya}function Ny(s){return s*Ea}function Uy(s){return(s&s-1)===0&&s!==0}function ky(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Fy(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Oy(s,e,t,r,o){const l=Math.cos,u=Math.sin,d=l(t/2),h=u(t/2),p=l((e+r)/2),m=u((e+r)/2),g=l((e-r)/2),v=u((e-r)/2),S=l((r-e)/2),M=u((r-e)/2);switch(o){case"XYX":s.set(d*m,h*g,h*v,d*p);break;case"YZY":s.set(h*v,d*m,h*g,d*p);break;case"ZXZ":s.set(h*g,h*v,d*m,d*p);break;case"XZX":s.set(d*m,h*M,h*S,d*p);break;case"YXY":s.set(h*S,d*m,h*M,d*p);break;case"ZYZ":s.set(h*M,h*S,d*m,d*p);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+o)}}function Mi(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Pt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const pd={DEG2RAD:ya,RAD2DEG:Ea,generateUUID:ir,clamp:un,euclideanModulo:rf,mapLinear:wy,inverseLerp:Ey,lerp:xa,damp:Ty,pingpong:Ay,smoothstep:by,smootherstep:Cy,randInt:Ry,randFloat:Py,randFloatSpread:Dy,seededRandom:Ly,degToRad:Iy,radToDeg:Ny,isPowerOfTwo:Uy,ceilPowerOfTwo:ky,floorPowerOfTwo:Fy,setQuaternionFromProperEuler:Oy,normalize:Pt,denormalize:Mi};class Re{constructor(e=0,t=0){Re.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,r=this.y,o=e.elements;return this.x=o[0]*t+o[3]*r+o[6],this.y=o[1]*t+o[4]*r+o[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(un(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y;return t*t+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const r=Math.cos(t),o=Math.sin(t),l=this.x-e.x,u=this.y-e.y;return this.x=l*r-u*o+e.x,this.y=l*o+u*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ct{constructor(e,t,r,o,l,u,d,h,p){ct.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,r,o,l,u,d,h,p)}set(e,t,r,o,l,u,d,h,p){const m=this.elements;return m[0]=e,m[1]=o,m[2]=d,m[3]=t,m[4]=l,m[5]=h,m[6]=r,m[7]=u,m[8]=p,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],this}extractBasis(e,t,r){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,o=t.elements,l=this.elements,u=r[0],d=r[3],h=r[6],p=r[1],m=r[4],g=r[7],v=r[2],S=r[5],M=r[8],E=o[0],y=o[3],x=o[6],C=o[1],A=o[4],D=o[7],G=o[2],k=o[5],I=o[8];return l[0]=u*E+d*C+h*G,l[3]=u*y+d*A+h*k,l[6]=u*x+d*D+h*I,l[1]=p*E+m*C+g*G,l[4]=p*y+m*A+g*k,l[7]=p*x+m*D+g*I,l[2]=v*E+S*C+M*G,l[5]=v*y+S*A+M*k,l[8]=v*x+S*D+M*I,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[1],o=e[2],l=e[3],u=e[4],d=e[5],h=e[6],p=e[7],m=e[8];return t*u*m-t*d*p-r*l*m+r*d*h+o*l*p-o*u*h}invert(){const e=this.elements,t=e[0],r=e[1],o=e[2],l=e[3],u=e[4],d=e[5],h=e[6],p=e[7],m=e[8],g=m*u-d*p,v=d*h-m*l,S=p*l-u*h,M=t*g+r*v+o*S;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);const E=1/M;return e[0]=g*E,e[1]=(o*p-m*r)*E,e[2]=(d*r-o*u)*E,e[3]=v*E,e[4]=(m*t-o*h)*E,e[5]=(o*l-d*t)*E,e[6]=S*E,e[7]=(r*h-p*t)*E,e[8]=(u*t-r*l)*E,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,r,o,l,u,d){const h=Math.cos(l),p=Math.sin(l);return this.set(r*h,r*p,-r*(h*u+p*d)+u+e,-o*p,o*h,-o*(-p*u+h*d)+d+t,0,0,1),this}scale(e,t){return this.premultiply(md.makeScale(e,t)),this}rotate(e){return this.premultiply(md.makeRotation(-e)),this}translate(e,t){return this.premultiply(md.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,r,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,r=e.elements;for(let o=0;o<9;o++)if(t[o]!==r[o])return!1;return!0}fromArray(e,t=0){for(let r=0;r<9;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const md=new ct;function A0(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function wc(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function By(){const s=wc("canvas");return s.style.display="block",s}const n_={};function _c(s){s in n_||(n_[s]=!0,console.warn(s))}function zy(s,e,t){return new Promise(function(r,o){function l(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:o();break;case s.TIMEOUT_EXPIRED:setTimeout(l,t);break;default:r()}}setTimeout(l,t)})}function Vy(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Hy(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const i_=new ct().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),r_=new ct().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),oa={[Or]:{transfer:yc,primaries:xc,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s,fromReference:s=>s},[yi]:{transfer:Ft,primaries:xc,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s.convertSRGBToLinear(),fromReference:s=>s.convertLinearToSRGB()},[Cc]:{transfer:yc,primaries:Sc,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.applyMatrix3(r_),fromReference:s=>s.applyMatrix3(i_)},[nf]:{transfer:Ft,primaries:Sc,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.convertSRGBToLinear().applyMatrix3(r_),fromReference:s=>s.applyMatrix3(i_).convertLinearToSRGB()}},Gy=new Set([Or,Cc]),Et={enabled:!0,_workingColorSpace:Or,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(s){if(!Gy.has(s))throw new Error(`Unsupported working color space, "${s}".`);this._workingColorSpace=s},convert:function(s,e,t){if(this.enabled===!1||e===t||!e||!t)return s;const r=oa[e].toReference,o=oa[t].fromReference;return o(r(s))},fromWorkingColorSpace:function(s,e){return this.convert(s,this._workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this._workingColorSpace)},getPrimaries:function(s){return oa[s].primaries},getTransfer:function(s){return s===Nr?yc:oa[s].transfer},getLuminanceCoefficients:function(s,e=this._workingColorSpace){return s.fromArray(oa[e].luminanceCoefficients)}};function uo(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function _d(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Hs;class Wy{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Hs===void 0&&(Hs=wc("canvas")),Hs.width=e.width,Hs.height=e.height;const r=Hs.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),t=Hs}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=wc("canvas");t.width=e.width,t.height=e.height;const r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const o=r.getImageData(0,0,e.width,e.height),l=o.data;for(let u=0;u<l.length;u++)l[u]=uo(l[u]/255)*255;return r.putImageData(o,0,0),t}else if(e.data){const t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor(uo(t[r]/255)*255):t[r]=uo(t[r]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let qy=0;class b0{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:qy++}),this.uuid=ir(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},o=this.data;if(o!==null){let l;if(Array.isArray(o)){l=[];for(let u=0,d=o.length;u<d;u++)o[u].isDataTexture?l.push(gd(o[u].image)):l.push(gd(o[u]))}else l=gd(o);r.url=l}return t||(e.images[this.uuid]=r),r}}function gd(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Wy.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Xy=0;class bn extends xo{constructor(e=bn.DEFAULT_IMAGE,t=bn.DEFAULT_MAPPING,r=cs,o=cs,l=Si,u=us,d=wi,h=rr,p=bn.DEFAULT_ANISOTROPY,m=Nr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Xy++}),this.uuid=ir(),this.name="",this.source=new b0(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=r,this.wrapT=o,this.magFilter=l,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=h,this.offset=new Re(0,0),this.repeat=new Re(1,1),this.center=new Re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ct,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),t||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==p0)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case uh:e.x=e.x-Math.floor(e.x);break;case cs:e.x=e.x<0?0:1;break;case dh:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case uh:e.y=e.y-Math.floor(e.y);break;case cs:e.y=e.y<0?0:1;break;case dh:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}bn.DEFAULT_IMAGE=null;bn.DEFAULT_MAPPING=p0;bn.DEFAULT_ANISOTROPY=1;class It{constructor(e=0,t=0,r=0,o=1){It.prototype.isVector4=!0,this.x=e,this.y=t,this.z=r,this.w=o}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,r,o){return this.x=e,this.y=t,this.z=r,this.w=o,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,r=this.y,o=this.z,l=this.w,u=e.elements;return this.x=u[0]*t+u[4]*r+u[8]*o+u[12]*l,this.y=u[1]*t+u[5]*r+u[9]*o+u[13]*l,this.z=u[2]*t+u[6]*r+u[10]*o+u[14]*l,this.w=u[3]*t+u[7]*r+u[11]*o+u[15]*l,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,r,o,l;const h=e.elements,p=h[0],m=h[4],g=h[8],v=h[1],S=h[5],M=h[9],E=h[2],y=h[6],x=h[10];if(Math.abs(m-v)<.01&&Math.abs(g-E)<.01&&Math.abs(M-y)<.01){if(Math.abs(m+v)<.1&&Math.abs(g+E)<.1&&Math.abs(M+y)<.1&&Math.abs(p+S+x-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(p+1)/2,D=(S+1)/2,G=(x+1)/2,k=(m+v)/4,I=(g+E)/4,z=(M+y)/4;return A>D&&A>G?A<.01?(r=0,o=.707106781,l=.707106781):(r=Math.sqrt(A),o=k/r,l=I/r):D>G?D<.01?(r=.707106781,o=0,l=.707106781):(o=Math.sqrt(D),r=k/o,l=z/o):G<.01?(r=.707106781,o=.707106781,l=0):(l=Math.sqrt(G),r=I/l,o=z/l),this.set(r,o,l,t),this}let C=Math.sqrt((y-M)*(y-M)+(g-E)*(g-E)+(v-m)*(v-m));return Math.abs(C)<.001&&(C=1),this.x=(y-M)/C,this.y=(g-E)/C,this.z=(v-m)/C,this.w=Math.acos((p+S+x-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this.w=e.w+(t.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class jy extends xo{constructor(e=1,t=1,r={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new It(0,0,e,t),this.scissorTest=!1,this.viewport=new It(0,0,e,t);const o={width:e,height:t,depth:1};r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Si,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},r);const l=new bn(o,r.mapping,r.wrapS,r.wrapT,r.magFilter,r.minFilter,r.format,r.type,r.anisotropy,r.colorSpace);l.flipY=!1,l.generateMipmaps=r.generateMipmaps,l.internalFormat=r.internalFormat,this.textures=[];const u=r.count;for(let d=0;d<u;d++)this.textures[d]=l.clone(),this.textures[d].isRenderTargetTexture=!0;this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this.depthTexture=r.depthTexture,this.samples=r.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let o=0,l=this.textures.length;o<l;o++)this.textures[o].image.width=e,this.textures[o].image.height=t,this.textures[o].image.depth=r;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let r=0,o=e.textures.length;r<o;r++)this.textures[r]=e.textures[r].clone(),this.textures[r].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new b0(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ei extends jy{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}}class C0 extends bn{constructor(e=null,t=1,r=1,o=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:o},this.magFilter=Vn,this.minFilter=Vn,this.wrapR=cs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Yy extends bn{constructor(e=null,t=1,r=1,o=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:o},this.magFilter=Vn,this.minFilter=Vn,this.wrapR=cs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ba{constructor(e=0,t=0,r=0,o=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=o}static slerpFlat(e,t,r,o,l,u,d){let h=r[o+0],p=r[o+1],m=r[o+2],g=r[o+3];const v=l[u+0],S=l[u+1],M=l[u+2],E=l[u+3];if(d===0){e[t+0]=h,e[t+1]=p,e[t+2]=m,e[t+3]=g;return}if(d===1){e[t+0]=v,e[t+1]=S,e[t+2]=M,e[t+3]=E;return}if(g!==E||h!==v||p!==S||m!==M){let y=1-d;const x=h*v+p*S+m*M+g*E,C=x>=0?1:-1,A=1-x*x;if(A>Number.EPSILON){const G=Math.sqrt(A),k=Math.atan2(G,x*C);y=Math.sin(y*k)/G,d=Math.sin(d*k)/G}const D=d*C;if(h=h*y+v*D,p=p*y+S*D,m=m*y+M*D,g=g*y+E*D,y===1-d){const G=1/Math.sqrt(h*h+p*p+m*m+g*g);h*=G,p*=G,m*=G,g*=G}}e[t]=h,e[t+1]=p,e[t+2]=m,e[t+3]=g}static multiplyQuaternionsFlat(e,t,r,o,l,u){const d=r[o],h=r[o+1],p=r[o+2],m=r[o+3],g=l[u],v=l[u+1],S=l[u+2],M=l[u+3];return e[t]=d*M+m*g+h*S-p*v,e[t+1]=h*M+m*v+p*g-d*S,e[t+2]=p*M+m*S+d*v-h*g,e[t+3]=m*M-d*g-h*v-p*S,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,o){return this._x=e,this._y=t,this._z=r,this._w=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const r=e._x,o=e._y,l=e._z,u=e._order,d=Math.cos,h=Math.sin,p=d(r/2),m=d(o/2),g=d(l/2),v=h(r/2),S=h(o/2),M=h(l/2);switch(u){case"XYZ":this._x=v*m*g+p*S*M,this._y=p*S*g-v*m*M,this._z=p*m*M+v*S*g,this._w=p*m*g-v*S*M;break;case"YXZ":this._x=v*m*g+p*S*M,this._y=p*S*g-v*m*M,this._z=p*m*M-v*S*g,this._w=p*m*g+v*S*M;break;case"ZXY":this._x=v*m*g-p*S*M,this._y=p*S*g+v*m*M,this._z=p*m*M+v*S*g,this._w=p*m*g-v*S*M;break;case"ZYX":this._x=v*m*g-p*S*M,this._y=p*S*g+v*m*M,this._z=p*m*M-v*S*g,this._w=p*m*g+v*S*M;break;case"YZX":this._x=v*m*g+p*S*M,this._y=p*S*g+v*m*M,this._z=p*m*M-v*S*g,this._w=p*m*g-v*S*M;break;case"XZY":this._x=v*m*g-p*S*M,this._y=p*S*g-v*m*M,this._z=p*m*M+v*S*g,this._w=p*m*g+v*S*M;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+u)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const r=t/2,o=Math.sin(r);return this._x=e.x*o,this._y=e.y*o,this._z=e.z*o,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,r=t[0],o=t[4],l=t[8],u=t[1],d=t[5],h=t[9],p=t[2],m=t[6],g=t[10],v=r+d+g;if(v>0){const S=.5/Math.sqrt(v+1);this._w=.25/S,this._x=(m-h)*S,this._y=(l-p)*S,this._z=(u-o)*S}else if(r>d&&r>g){const S=2*Math.sqrt(1+r-d-g);this._w=(m-h)/S,this._x=.25*S,this._y=(o+u)/S,this._z=(l+p)/S}else if(d>g){const S=2*Math.sqrt(1+d-r-g);this._w=(l-p)/S,this._x=(o+u)/S,this._y=.25*S,this._z=(h+m)/S}else{const S=2*Math.sqrt(1+g-r-d);this._w=(u-o)/S,this._x=(l+p)/S,this._y=(h+m)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<Number.EPSILON?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(un(this.dot(e),-1,1)))}rotateTowards(e,t){const r=this.angleTo(e);if(r===0)return this;const o=Math.min(1,t/r);return this.slerp(e,o),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const r=e._x,o=e._y,l=e._z,u=e._w,d=t._x,h=t._y,p=t._z,m=t._w;return this._x=r*m+u*d+o*p-l*h,this._y=o*m+u*h+l*d-r*p,this._z=l*m+u*p+r*h-o*d,this._w=u*m-r*d-o*h-l*p,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const r=this._x,o=this._y,l=this._z,u=this._w;let d=u*e._w+r*e._x+o*e._y+l*e._z;if(d<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,d=-d):this.copy(e),d>=1)return this._w=u,this._x=r,this._y=o,this._z=l,this;const h=1-d*d;if(h<=Number.EPSILON){const S=1-t;return this._w=S*u+t*this._w,this._x=S*r+t*this._x,this._y=S*o+t*this._y,this._z=S*l+t*this._z,this.normalize(),this}const p=Math.sqrt(h),m=Math.atan2(p,d),g=Math.sin((1-t)*m)/p,v=Math.sin(t*m)/p;return this._w=u*g+this._w*v,this._x=r*g+this._x*v,this._y=o*g+this._y*v,this._z=l*g+this._z*v,this._onChangeCallback(),this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),o=Math.sqrt(1-r),l=Math.sqrt(r);return this.set(o*Math.sin(e),o*Math.cos(e),l*Math.sin(t),l*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class N{constructor(e=0,t=0,r=0){N.prototype.isVector3=!0,this.x=e,this.y=t,this.z=r}set(e,t,r){return r===void 0&&(r=this.z),this.x=e,this.y=t,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(s_.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(s_.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,r=this.y,o=this.z,l=e.elements;return this.x=l[0]*t+l[3]*r+l[6]*o,this.y=l[1]*t+l[4]*r+l[7]*o,this.z=l[2]*t+l[5]*r+l[8]*o,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,r=this.y,o=this.z,l=e.elements,u=1/(l[3]*t+l[7]*r+l[11]*o+l[15]);return this.x=(l[0]*t+l[4]*r+l[8]*o+l[12])*u,this.y=(l[1]*t+l[5]*r+l[9]*o+l[13])*u,this.z=(l[2]*t+l[6]*r+l[10]*o+l[14])*u,this}applyQuaternion(e){const t=this.x,r=this.y,o=this.z,l=e.x,u=e.y,d=e.z,h=e.w,p=2*(u*o-d*r),m=2*(d*t-l*o),g=2*(l*r-u*t);return this.x=t+h*p+u*g-d*m,this.y=r+h*m+d*p-l*g,this.z=o+h*g+l*m-u*p,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,r=this.y,o=this.z,l=e.elements;return this.x=l[0]*t+l[4]*r+l[8]*o,this.y=l[1]*t+l[5]*r+l[9]*o,this.z=l[2]*t+l[6]*r+l[10]*o,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const r=e.x,o=e.y,l=e.z,u=t.x,d=t.y,h=t.z;return this.x=o*h-l*d,this.y=l*u-r*h,this.z=r*d-o*u,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const r=e.dot(this)/t;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return vd.copy(this).projectOnVector(e),this.sub(vd)}reflect(e){return this.sub(vd.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(un(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y,o=this.z-e.z;return t*t+r*r+o*o}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,r){const o=Math.sin(t)*e;return this.x=o*Math.sin(r),this.y=Math.cos(t)*e,this.z=o*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,r){return this.x=e*Math.sin(t),this.y=r,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),o=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=r,this.z=o,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,r=Math.sqrt(1-t*t);return this.x=r*Math.cos(e),this.y=t,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const vd=new N,s_=new ba;class hs{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(_i.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(_i.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const r=_i.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const l=r.getAttribute("position");if(t===!0&&l!==void 0&&e.isInstancedMesh!==!0)for(let u=0,d=l.count;u<d;u++)e.isMesh===!0?e.getVertexPosition(u,_i):_i.fromBufferAttribute(l,u),_i.applyMatrix4(e.matrixWorld),this.expandByPoint(_i);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),kl.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),kl.copy(r.boundingBox)),kl.applyMatrix4(e.matrixWorld),this.union(kl)}const o=e.children;for(let l=0,u=o.length;l<u;l++)this.expandByObject(o[l],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,_i),_i.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(aa),Fl.subVectors(this.max,aa),Gs.subVectors(e.a,aa),Ws.subVectors(e.b,aa),qs.subVectors(e.c,aa),br.subVectors(Ws,Gs),Cr.subVectors(qs,Ws),Jr.subVectors(Gs,qs);let t=[0,-br.z,br.y,0,-Cr.z,Cr.y,0,-Jr.z,Jr.y,br.z,0,-br.x,Cr.z,0,-Cr.x,Jr.z,0,-Jr.x,-br.y,br.x,0,-Cr.y,Cr.x,0,-Jr.y,Jr.x,0];return!yd(t,Gs,Ws,qs,Fl)||(t=[1,0,0,0,1,0,0,0,1],!yd(t,Gs,Ws,qs,Fl))?!1:(Ol.crossVectors(br,Cr),t=[Ol.x,Ol.y,Ol.z],yd(t,Gs,Ws,qs,Fl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,_i).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(_i).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Xi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Xi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Xi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Xi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Xi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Xi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Xi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Xi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Xi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Xi=[new N,new N,new N,new N,new N,new N,new N,new N],_i=new N,kl=new hs,Gs=new N,Ws=new N,qs=new N,br=new N,Cr=new N,Jr=new N,aa=new N,Fl=new N,Ol=new N,Zr=new N;function yd(s,e,t,r,o){for(let l=0,u=s.length-3;l<=u;l+=3){Zr.fromArray(s,l);const d=o.x*Math.abs(Zr.x)+o.y*Math.abs(Zr.y)+o.z*Math.abs(Zr.z),h=e.dot(Zr),p=t.dot(Zr),m=r.dot(Zr);if(Math.max(-Math.max(h,p,m),Math.min(h,p,m))>d)return!1}return!0}const Ky=new hs,la=new N,xd=new N;class So{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const r=this.center;t!==void 0?r.copy(t):Ky.setFromPoints(e).getCenter(r);let o=0;for(let l=0,u=e.length;l<u;l++)o=Math.max(o,r.distanceToSquared(e[l]));return this.radius=Math.sqrt(o),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;la.subVectors(e,this.center);const t=la.lengthSq();if(t>this.radius*this.radius){const r=Math.sqrt(t),o=(r-this.radius)*.5;this.center.addScaledVector(la,o/r),this.radius+=o}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xd.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(la.copy(e.center).add(xd)),this.expandByPoint(la.copy(e.center).sub(xd))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ji=new N,Sd=new N,Bl=new N,Rr=new N,Md=new N,zl=new N,wd=new N;class sf{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ji)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ji.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ji.copy(this.origin).addScaledVector(this.direction,t),ji.distanceToSquared(e))}distanceSqToSegment(e,t,r,o){Sd.copy(e).add(t).multiplyScalar(.5),Bl.copy(t).sub(e).normalize(),Rr.copy(this.origin).sub(Sd);const l=e.distanceTo(t)*.5,u=-this.direction.dot(Bl),d=Rr.dot(this.direction),h=-Rr.dot(Bl),p=Rr.lengthSq(),m=Math.abs(1-u*u);let g,v,S,M;if(m>0)if(g=u*h-d,v=u*d-h,M=l*m,g>=0)if(v>=-M)if(v<=M){const E=1/m;g*=E,v*=E,S=g*(g+u*v+2*d)+v*(u*g+v+2*h)+p}else v=l,g=Math.max(0,-(u*v+d)),S=-g*g+v*(v+2*h)+p;else v=-l,g=Math.max(0,-(u*v+d)),S=-g*g+v*(v+2*h)+p;else v<=-M?(g=Math.max(0,-(-u*l+d)),v=g>0?-l:Math.min(Math.max(-l,-h),l),S=-g*g+v*(v+2*h)+p):v<=M?(g=0,v=Math.min(Math.max(-l,-h),l),S=v*(v+2*h)+p):(g=Math.max(0,-(u*l+d)),v=g>0?l:Math.min(Math.max(-l,-h),l),S=-g*g+v*(v+2*h)+p);else v=u>0?-l:l,g=Math.max(0,-(u*v+d)),S=-g*g+v*(v+2*h)+p;return r&&r.copy(this.origin).addScaledVector(this.direction,g),o&&o.copy(Sd).addScaledVector(Bl,v),S}intersectSphere(e,t){ji.subVectors(e.center,this.origin);const r=ji.dot(this.direction),o=ji.dot(ji)-r*r,l=e.radius*e.radius;if(o>l)return null;const u=Math.sqrt(l-o),d=r-u,h=r+u;return h<0?null:d<0?this.at(h,t):this.at(d,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){const r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,o,l,u,d,h;const p=1/this.direction.x,m=1/this.direction.y,g=1/this.direction.z,v=this.origin;return p>=0?(r=(e.min.x-v.x)*p,o=(e.max.x-v.x)*p):(r=(e.max.x-v.x)*p,o=(e.min.x-v.x)*p),m>=0?(l=(e.min.y-v.y)*m,u=(e.max.y-v.y)*m):(l=(e.max.y-v.y)*m,u=(e.min.y-v.y)*m),r>u||l>o||((l>r||isNaN(r))&&(r=l),(u<o||isNaN(o))&&(o=u),g>=0?(d=(e.min.z-v.z)*g,h=(e.max.z-v.z)*g):(d=(e.max.z-v.z)*g,h=(e.min.z-v.z)*g),r>h||d>o)||((d>r||r!==r)&&(r=d),(h<o||o!==o)&&(o=h),o<0)?null:this.at(r>=0?r:o,t)}intersectsBox(e){return this.intersectBox(e,ji)!==null}intersectTriangle(e,t,r,o,l){Md.subVectors(t,e),zl.subVectors(r,e),wd.crossVectors(Md,zl);let u=this.direction.dot(wd),d;if(u>0){if(o)return null;d=1}else if(u<0)d=-1,u=-u;else return null;Rr.subVectors(this.origin,e);const h=d*this.direction.dot(zl.crossVectors(Rr,zl));if(h<0)return null;const p=d*this.direction.dot(Md.cross(Rr));if(p<0||h+p>u)return null;const m=-d*Rr.dot(wd);return m<0?null:this.at(m/u,l)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ct{constructor(e,t,r,o,l,u,d,h,p,m,g,v,S,M,E,y){Ct.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,r,o,l,u,d,h,p,m,g,v,S,M,E,y)}set(e,t,r,o,l,u,d,h,p,m,g,v,S,M,E,y){const x=this.elements;return x[0]=e,x[4]=t,x[8]=r,x[12]=o,x[1]=l,x[5]=u,x[9]=d,x[13]=h,x[2]=p,x[6]=m,x[10]=g,x[14]=v,x[3]=S,x[7]=M,x[11]=E,x[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ct().fromArray(this.elements)}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],this}copyPosition(e){const t=this.elements,r=e.elements;return t[12]=r[12],t[13]=r[13],t[14]=r[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,r){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,t,r){return this.set(e.x,t.x,r.x,0,e.y,t.y,r.y,0,e.z,t.z,r.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,r=e.elements,o=1/Xs.setFromMatrixColumn(e,0).length(),l=1/Xs.setFromMatrixColumn(e,1).length(),u=1/Xs.setFromMatrixColumn(e,2).length();return t[0]=r[0]*o,t[1]=r[1]*o,t[2]=r[2]*o,t[3]=0,t[4]=r[4]*l,t[5]=r[5]*l,t[6]=r[6]*l,t[7]=0,t[8]=r[8]*u,t[9]=r[9]*u,t[10]=r[10]*u,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,r=e.x,o=e.y,l=e.z,u=Math.cos(r),d=Math.sin(r),h=Math.cos(o),p=Math.sin(o),m=Math.cos(l),g=Math.sin(l);if(e.order==="XYZ"){const v=u*m,S=u*g,M=d*m,E=d*g;t[0]=h*m,t[4]=-h*g,t[8]=p,t[1]=S+M*p,t[5]=v-E*p,t[9]=-d*h,t[2]=E-v*p,t[6]=M+S*p,t[10]=u*h}else if(e.order==="YXZ"){const v=h*m,S=h*g,M=p*m,E=p*g;t[0]=v+E*d,t[4]=M*d-S,t[8]=u*p,t[1]=u*g,t[5]=u*m,t[9]=-d,t[2]=S*d-M,t[6]=E+v*d,t[10]=u*h}else if(e.order==="ZXY"){const v=h*m,S=h*g,M=p*m,E=p*g;t[0]=v-E*d,t[4]=-u*g,t[8]=M+S*d,t[1]=S+M*d,t[5]=u*m,t[9]=E-v*d,t[2]=-u*p,t[6]=d,t[10]=u*h}else if(e.order==="ZYX"){const v=u*m,S=u*g,M=d*m,E=d*g;t[0]=h*m,t[4]=M*p-S,t[8]=v*p+E,t[1]=h*g,t[5]=E*p+v,t[9]=S*p-M,t[2]=-p,t[6]=d*h,t[10]=u*h}else if(e.order==="YZX"){const v=u*h,S=u*p,M=d*h,E=d*p;t[0]=h*m,t[4]=E-v*g,t[8]=M*g+S,t[1]=g,t[5]=u*m,t[9]=-d*m,t[2]=-p*m,t[6]=S*g+M,t[10]=v-E*g}else if(e.order==="XZY"){const v=u*h,S=u*p,M=d*h,E=d*p;t[0]=h*m,t[4]=-g,t[8]=p*m,t[1]=v*g+E,t[5]=u*m,t[9]=S*g-M,t[2]=M*g-S,t[6]=d*m,t[10]=E*g+v}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose($y,e,Qy)}lookAt(e,t,r){const o=this.elements;return Yn.subVectors(e,t),Yn.lengthSq()===0&&(Yn.z=1),Yn.normalize(),Pr.crossVectors(r,Yn),Pr.lengthSq()===0&&(Math.abs(r.z)===1?Yn.x+=1e-4:Yn.z+=1e-4,Yn.normalize(),Pr.crossVectors(r,Yn)),Pr.normalize(),Vl.crossVectors(Yn,Pr),o[0]=Pr.x,o[4]=Vl.x,o[8]=Yn.x,o[1]=Pr.y,o[5]=Vl.y,o[9]=Yn.y,o[2]=Pr.z,o[6]=Vl.z,o[10]=Yn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,o=t.elements,l=this.elements,u=r[0],d=r[4],h=r[8],p=r[12],m=r[1],g=r[5],v=r[9],S=r[13],M=r[2],E=r[6],y=r[10],x=r[14],C=r[3],A=r[7],D=r[11],G=r[15],k=o[0],I=o[4],z=o[8],ae=o[12],w=o[1],P=o[5],K=o[9],Q=o[13],oe=o[2],he=o[6],ne=o[10],le=o[14],V=o[3],ue=o[7],se=o[11],F=o[15];return l[0]=u*k+d*w+h*oe+p*V,l[4]=u*I+d*P+h*he+p*ue,l[8]=u*z+d*K+h*ne+p*se,l[12]=u*ae+d*Q+h*le+p*F,l[1]=m*k+g*w+v*oe+S*V,l[5]=m*I+g*P+v*he+S*ue,l[9]=m*z+g*K+v*ne+S*se,l[13]=m*ae+g*Q+v*le+S*F,l[2]=M*k+E*w+y*oe+x*V,l[6]=M*I+E*P+y*he+x*ue,l[10]=M*z+E*K+y*ne+x*se,l[14]=M*ae+E*Q+y*le+x*F,l[3]=C*k+A*w+D*oe+G*V,l[7]=C*I+A*P+D*he+G*ue,l[11]=C*z+A*K+D*ne+G*se,l[15]=C*ae+A*Q+D*le+G*F,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[4],o=e[8],l=e[12],u=e[1],d=e[5],h=e[9],p=e[13],m=e[2],g=e[6],v=e[10],S=e[14],M=e[3],E=e[7],y=e[11],x=e[15];return M*(+l*h*g-o*p*g-l*d*v+r*p*v+o*d*S-r*h*S)+E*(+t*h*S-t*p*v+l*u*v-o*u*S+o*p*m-l*h*m)+y*(+t*p*g-t*d*S-l*u*g+r*u*S+l*d*m-r*p*m)+x*(-o*d*m-t*h*g+t*d*v+o*u*g-r*u*v+r*h*m)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,r){const o=this.elements;return e.isVector3?(o[12]=e.x,o[13]=e.y,o[14]=e.z):(o[12]=e,o[13]=t,o[14]=r),this}invert(){const e=this.elements,t=e[0],r=e[1],o=e[2],l=e[3],u=e[4],d=e[5],h=e[6],p=e[7],m=e[8],g=e[9],v=e[10],S=e[11],M=e[12],E=e[13],y=e[14],x=e[15],C=g*y*p-E*v*p+E*h*S-d*y*S-g*h*x+d*v*x,A=M*v*p-m*y*p-M*h*S+u*y*S+m*h*x-u*v*x,D=m*E*p-M*g*p+M*d*S-u*E*S-m*d*x+u*g*x,G=M*g*h-m*E*h-M*d*v+u*E*v+m*d*y-u*g*y,k=t*C+r*A+o*D+l*G;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/k;return e[0]=C*I,e[1]=(E*v*l-g*y*l-E*o*S+r*y*S+g*o*x-r*v*x)*I,e[2]=(d*y*l-E*h*l+E*o*p-r*y*p-d*o*x+r*h*x)*I,e[3]=(g*h*l-d*v*l-g*o*p+r*v*p+d*o*S-r*h*S)*I,e[4]=A*I,e[5]=(m*y*l-M*v*l+M*o*S-t*y*S-m*o*x+t*v*x)*I,e[6]=(M*h*l-u*y*l-M*o*p+t*y*p+u*o*x-t*h*x)*I,e[7]=(u*v*l-m*h*l+m*o*p-t*v*p-u*o*S+t*h*S)*I,e[8]=D*I,e[9]=(M*g*l-m*E*l-M*r*S+t*E*S+m*r*x-t*g*x)*I,e[10]=(u*E*l-M*d*l+M*r*p-t*E*p-u*r*x+t*d*x)*I,e[11]=(m*d*l-u*g*l-m*r*p+t*g*p+u*r*S-t*d*S)*I,e[12]=G*I,e[13]=(m*E*o-M*g*o+M*r*v-t*E*v-m*r*y+t*g*y)*I,e[14]=(M*d*o-u*E*o-M*r*h+t*E*h+u*r*y-t*d*y)*I,e[15]=(u*g*o-m*d*o+m*r*h-t*g*h-u*r*v+t*d*v)*I,this}scale(e){const t=this.elements,r=e.x,o=e.y,l=e.z;return t[0]*=r,t[4]*=o,t[8]*=l,t[1]*=r,t[5]*=o,t[9]*=l,t[2]*=r,t[6]*=o,t[10]*=l,t[3]*=r,t[7]*=o,t[11]*=l,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],o=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,r,o))}makeTranslation(e,t,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const r=Math.cos(t),o=Math.sin(t),l=1-r,u=e.x,d=e.y,h=e.z,p=l*u,m=l*d;return this.set(p*u+r,p*d-o*h,p*h+o*d,0,p*d+o*h,m*d+r,m*h-o*u,0,p*h-o*d,m*h+o*u,l*h*h+r,0,0,0,0,1),this}makeScale(e,t,r){return this.set(e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,t,r,o,l,u){return this.set(1,r,l,0,e,1,u,0,t,o,1,0,0,0,0,1),this}compose(e,t,r){const o=this.elements,l=t._x,u=t._y,d=t._z,h=t._w,p=l+l,m=u+u,g=d+d,v=l*p,S=l*m,M=l*g,E=u*m,y=u*g,x=d*g,C=h*p,A=h*m,D=h*g,G=r.x,k=r.y,I=r.z;return o[0]=(1-(E+x))*G,o[1]=(S+D)*G,o[2]=(M-A)*G,o[3]=0,o[4]=(S-D)*k,o[5]=(1-(v+x))*k,o[6]=(y+C)*k,o[7]=0,o[8]=(M+A)*I,o[9]=(y-C)*I,o[10]=(1-(v+E))*I,o[11]=0,o[12]=e.x,o[13]=e.y,o[14]=e.z,o[15]=1,this}decompose(e,t,r){const o=this.elements;let l=Xs.set(o[0],o[1],o[2]).length();const u=Xs.set(o[4],o[5],o[6]).length(),d=Xs.set(o[8],o[9],o[10]).length();this.determinant()<0&&(l=-l),e.x=o[12],e.y=o[13],e.z=o[14],gi.copy(this);const p=1/l,m=1/u,g=1/d;return gi.elements[0]*=p,gi.elements[1]*=p,gi.elements[2]*=p,gi.elements[4]*=m,gi.elements[5]*=m,gi.elements[6]*=m,gi.elements[8]*=g,gi.elements[9]*=g,gi.elements[10]*=g,t.setFromRotationMatrix(gi),r.x=l,r.y=u,r.z=d,this}makePerspective(e,t,r,o,l,u,d=Zi){const h=this.elements,p=2*l/(t-e),m=2*l/(r-o),g=(t+e)/(t-e),v=(r+o)/(r-o);let S,M;if(d===Zi)S=-(u+l)/(u-l),M=-2*u*l/(u-l);else if(d===Mc)S=-u/(u-l),M=-u*l/(u-l);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return h[0]=p,h[4]=0,h[8]=g,h[12]=0,h[1]=0,h[5]=m,h[9]=v,h[13]=0,h[2]=0,h[6]=0,h[10]=S,h[14]=M,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,r,o,l,u,d=Zi){const h=this.elements,p=1/(t-e),m=1/(r-o),g=1/(u-l),v=(t+e)*p,S=(r+o)*m;let M,E;if(d===Zi)M=(u+l)*g,E=-2*g;else if(d===Mc)M=l*g,E=-1*g;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return h[0]=2*p,h[4]=0,h[8]=0,h[12]=-v,h[1]=0,h[5]=2*m,h[9]=0,h[13]=-S,h[2]=0,h[6]=0,h[10]=E,h[14]=-M,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){const t=this.elements,r=e.elements;for(let o=0;o<16;o++)if(t[o]!==r[o])return!1;return!0}fromArray(e,t=0){for(let r=0;r<16;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e[t+9]=r[9],e[t+10]=r[10],e[t+11]=r[11],e[t+12]=r[12],e[t+13]=r[13],e[t+14]=r[14],e[t+15]=r[15],e}}const Xs=new N,gi=new Ct,$y=new N(0,0,0),Qy=new N(1,1,1),Pr=new N,Vl=new N,Yn=new N,o_=new Ct,a_=new ba;class Ii{constructor(e=0,t=0,r=0,o=Ii.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=r,this._order=o}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,r,o=this._order){return this._x=e,this._y=t,this._z=r,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,r=!0){const o=e.elements,l=o[0],u=o[4],d=o[8],h=o[1],p=o[5],m=o[9],g=o[2],v=o[6],S=o[10];switch(t){case"XYZ":this._y=Math.asin(un(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-m,S),this._z=Math.atan2(-u,l)):(this._x=Math.atan2(v,p),this._z=0);break;case"YXZ":this._x=Math.asin(-un(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(d,S),this._z=Math.atan2(h,p)):(this._y=Math.atan2(-g,l),this._z=0);break;case"ZXY":this._x=Math.asin(un(v,-1,1)),Math.abs(v)<.9999999?(this._y=Math.atan2(-g,S),this._z=Math.atan2(-u,p)):(this._y=0,this._z=Math.atan2(h,l));break;case"ZYX":this._y=Math.asin(-un(g,-1,1)),Math.abs(g)<.9999999?(this._x=Math.atan2(v,S),this._z=Math.atan2(h,l)):(this._x=0,this._z=Math.atan2(-u,p));break;case"YZX":this._z=Math.asin(un(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-m,p),this._y=Math.atan2(-g,l)):(this._x=0,this._y=Math.atan2(d,S));break;case"XZY":this._z=Math.asin(-un(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(v,p),this._y=Math.atan2(d,l)):(this._x=Math.atan2(-m,S),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,r){return o_.makeRotationFromQuaternion(e),this.setFromRotationMatrix(o_,t,r)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return a_.setFromEuler(this),this.setFromQuaternion(a_,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ii.DEFAULT_ORDER="XYZ";class of{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Jy=0;const l_=new N,js=new ba,Yi=new Ct,Hl=new N,ca=new N,Zy=new N,ex=new ba,c_=new N(1,0,0),u_=new N(0,1,0),d_=new N(0,0,1),h_={type:"added"},tx={type:"removed"},Ys={type:"childadded",child:null},Ed={type:"childremoved",child:null};class Ot extends xo{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Jy++}),this.uuid=ir(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ot.DEFAULT_UP.clone();const e=new N,t=new Ii,r=new ba,o=new N(1,1,1);function l(){r.setFromEuler(t,!1)}function u(){t.setFromQuaternion(r,void 0,!1)}t._onChange(l),r._onChange(u),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new Ct},normalMatrix:{value:new ct}}),this.matrix=new Ct,this.matrixWorld=new Ct,this.matrixAutoUpdate=Ot.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ot.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new of,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return js.setFromAxisAngle(e,t),this.quaternion.multiply(js),this}rotateOnWorldAxis(e,t){return js.setFromAxisAngle(e,t),this.quaternion.premultiply(js),this}rotateX(e){return this.rotateOnAxis(c_,e)}rotateY(e){return this.rotateOnAxis(u_,e)}rotateZ(e){return this.rotateOnAxis(d_,e)}translateOnAxis(e,t){return l_.copy(e).applyQuaternion(this.quaternion),this.position.add(l_.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(c_,e)}translateY(e){return this.translateOnAxis(u_,e)}translateZ(e){return this.translateOnAxis(d_,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Yi.copy(this.matrixWorld).invert())}lookAt(e,t,r){e.isVector3?Hl.copy(e):Hl.set(e,t,r);const o=this.parent;this.updateWorldMatrix(!0,!1),ca.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Yi.lookAt(ca,Hl,this.up):Yi.lookAt(Hl,ca,this.up),this.quaternion.setFromRotationMatrix(Yi),o&&(Yi.extractRotation(o.matrixWorld),js.setFromRotationMatrix(Yi),this.quaternion.premultiply(js.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(h_),Ys.child=e,this.dispatchEvent(Ys),Ys.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(tx),Ed.child=e,this.dispatchEvent(Ed),Ed.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Yi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Yi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Yi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(h_),Ys.child=e,this.dispatchEvent(Ys),Ys.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let r=0,o=this.children.length;r<o;r++){const u=this.children[r].getObjectByProperty(e,t);if(u!==void 0)return u}}getObjectsByProperty(e,t,r=[]){this[e]===t&&r.push(this);const o=this.children;for(let l=0,u=o.length;l<u;l++)o[l].getObjectsByProperty(e,t,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ca,e,Zy),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ca,ex,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].updateMatrixWorld(e)}updateWorldMatrix(e,t){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const o=this.children;for(let l=0,u=o.length;l<u;l++)o[l].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",r={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const o={};o.uuid=this.uuid,o.type=this.type,this.name!==""&&(o.name=this.name),this.castShadow===!0&&(o.castShadow=!0),this.receiveShadow===!0&&(o.receiveShadow=!0),this.visible===!1&&(o.visible=!1),this.frustumCulled===!1&&(o.frustumCulled=!1),this.renderOrder!==0&&(o.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(o.matrixAutoUpdate=!1),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.visibility=this._visibility,o.active=this._active,o.bounds=this._bounds.map(d=>({boxInitialized:d.boxInitialized,boxMin:d.box.min.toArray(),boxMax:d.box.max.toArray(),sphereInitialized:d.sphereInitialized,sphereRadius:d.sphere.radius,sphereCenter:d.sphere.center.toArray()})),o.maxInstanceCount=this._maxInstanceCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.geometryCount=this._geometryCount,o.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(o.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(o.boundingSphere={center:o.boundingSphere.center.toArray(),radius:o.boundingSphere.radius}),this.boundingBox!==null&&(o.boundingBox={min:o.boundingBox.min.toArray(),max:o.boundingBox.max.toArray()}));function l(d,h){return d[h.uuid]===void 0&&(d[h.uuid]=h.toJSON(e)),h.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=l(e.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const h=d.shapes;if(Array.isArray(h))for(let p=0,m=h.length;p<m;p++){const g=h[p];l(e.shapes,g)}else l(e.shapes,h)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(l(e.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let h=0,p=this.material.length;h<p;h++)d.push(l(e.materials,this.material[h]));o.material=d}else o.material=l(e.materials,this.material);if(this.children.length>0){o.children=[];for(let d=0;d<this.children.length;d++)o.children.push(this.children[d].toJSON(e).object)}if(this.animations.length>0){o.animations=[];for(let d=0;d<this.animations.length;d++){const h=this.animations[d];o.animations.push(l(e.animations,h))}}if(t){const d=u(e.geometries),h=u(e.materials),p=u(e.textures),m=u(e.images),g=u(e.shapes),v=u(e.skeletons),S=u(e.animations),M=u(e.nodes);d.length>0&&(r.geometries=d),h.length>0&&(r.materials=h),p.length>0&&(r.textures=p),m.length>0&&(r.images=m),g.length>0&&(r.shapes=g),v.length>0&&(r.skeletons=v),S.length>0&&(r.animations=S),M.length>0&&(r.nodes=M)}return r.object=o,r;function u(d){const h=[];for(const p in d){const m=d[p];delete m.metadata,h.push(m)}return h}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let r=0;r<e.children.length;r++){const o=e.children[r];this.add(o.clone())}return this}}Ot.DEFAULT_UP=new N(0,1,0);Ot.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ot.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const vi=new N,Ki=new N,Td=new N,$i=new N,Ks=new N,$s=new N,f_=new N,Ad=new N,bd=new N,Cd=new N,Rd=new It,Pd=new It,Dd=new It;class ai{constructor(e=new N,t=new N,r=new N){this.a=e,this.b=t,this.c=r}static getNormal(e,t,r,o){o.subVectors(r,t),vi.subVectors(e,t),o.cross(vi);const l=o.lengthSq();return l>0?o.multiplyScalar(1/Math.sqrt(l)):o.set(0,0,0)}static getBarycoord(e,t,r,o,l){vi.subVectors(o,t),Ki.subVectors(r,t),Td.subVectors(e,t);const u=vi.dot(vi),d=vi.dot(Ki),h=vi.dot(Td),p=Ki.dot(Ki),m=Ki.dot(Td),g=u*p-d*d;if(g===0)return l.set(0,0,0),null;const v=1/g,S=(p*h-d*m)*v,M=(u*m-d*h)*v;return l.set(1-S-M,M,S)}static containsPoint(e,t,r,o){return this.getBarycoord(e,t,r,o,$i)===null?!1:$i.x>=0&&$i.y>=0&&$i.x+$i.y<=1}static getInterpolation(e,t,r,o,l,u,d,h){return this.getBarycoord(e,t,r,o,$i)===null?(h.x=0,h.y=0,"z"in h&&(h.z=0),"w"in h&&(h.w=0),null):(h.setScalar(0),h.addScaledVector(l,$i.x),h.addScaledVector(u,$i.y),h.addScaledVector(d,$i.z),h)}static getInterpolatedAttribute(e,t,r,o,l,u){return Rd.setScalar(0),Pd.setScalar(0),Dd.setScalar(0),Rd.fromBufferAttribute(e,t),Pd.fromBufferAttribute(e,r),Dd.fromBufferAttribute(e,o),u.setScalar(0),u.addScaledVector(Rd,l.x),u.addScaledVector(Pd,l.y),u.addScaledVector(Dd,l.z),u}static isFrontFacing(e,t,r,o){return vi.subVectors(r,t),Ki.subVectors(e,t),vi.cross(Ki).dot(o)<0}set(e,t,r){return this.a.copy(e),this.b.copy(t),this.c.copy(r),this}setFromPointsAndIndices(e,t,r,o){return this.a.copy(e[t]),this.b.copy(e[r]),this.c.copy(e[o]),this}setFromAttributeAndIndices(e,t,r,o){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,o),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return vi.subVectors(this.c,this.b),Ki.subVectors(this.a,this.b),vi.cross(Ki).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ai.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ai.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,r,o,l){return ai.getInterpolation(e,this.a,this.b,this.c,t,r,o,l)}containsPoint(e){return ai.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ai.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const r=this.a,o=this.b,l=this.c;let u,d;Ks.subVectors(o,r),$s.subVectors(l,r),Ad.subVectors(e,r);const h=Ks.dot(Ad),p=$s.dot(Ad);if(h<=0&&p<=0)return t.copy(r);bd.subVectors(e,o);const m=Ks.dot(bd),g=$s.dot(bd);if(m>=0&&g<=m)return t.copy(o);const v=h*g-m*p;if(v<=0&&h>=0&&m<=0)return u=h/(h-m),t.copy(r).addScaledVector(Ks,u);Cd.subVectors(e,l);const S=Ks.dot(Cd),M=$s.dot(Cd);if(M>=0&&S<=M)return t.copy(l);const E=S*p-h*M;if(E<=0&&p>=0&&M<=0)return d=p/(p-M),t.copy(r).addScaledVector($s,d);const y=m*M-S*g;if(y<=0&&g-m>=0&&S-M>=0)return f_.subVectors(l,o),d=(g-m)/(g-m+(S-M)),t.copy(o).addScaledVector(f_,d);const x=1/(y+E+v);return u=E*x,d=v*x,t.copy(r).addScaledVector(Ks,u).addScaledVector($s,d)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const R0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Dr={h:0,s:0,l:0},Gl={h:0,s:0,l:0};function Ld(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Ze{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){const o=e;o&&o.isColor?this.copy(o):typeof o=="number"?this.setHex(o):typeof o=="string"&&this.setStyle(o)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yi){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Et.toWorkingColorSpace(this,t),this}setRGB(e,t,r,o=Et.workingColorSpace){return this.r=e,this.g=t,this.b=r,Et.toWorkingColorSpace(this,o),this}setHSL(e,t,r,o=Et.workingColorSpace){if(e=rf(e,1),t=un(t,0,1),r=un(r,0,1),t===0)this.r=this.g=this.b=r;else{const l=r<=.5?r*(1+t):r+t-r*t,u=2*r-l;this.r=Ld(u,l,e+1/3),this.g=Ld(u,l,e),this.b=Ld(u,l,e-1/3)}return Et.toWorkingColorSpace(this,o),this}setStyle(e,t=yi){function r(l){l!==void 0&&parseFloat(l)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let o;if(o=/^(\w+)\(([^\)]*)\)/.exec(e)){let l;const u=o[1],d=o[2];switch(u){case"rgb":case"rgba":if(l=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setRGB(Math.min(255,parseInt(l[1],10))/255,Math.min(255,parseInt(l[2],10))/255,Math.min(255,parseInt(l[3],10))/255,t);if(l=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setRGB(Math.min(100,parseInt(l[1],10))/100,Math.min(100,parseInt(l[2],10))/100,Math.min(100,parseInt(l[3],10))/100,t);break;case"hsl":case"hsla":if(l=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setHSL(parseFloat(l[1])/360,parseFloat(l[2])/100,parseFloat(l[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(o=/^\#([A-Fa-f\d]+)$/.exec(e)){const l=o[1],u=l.length;if(u===3)return this.setRGB(parseInt(l.charAt(0),16)/15,parseInt(l.charAt(1),16)/15,parseInt(l.charAt(2),16)/15,t);if(u===6)return this.setHex(parseInt(l,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yi){const r=R0[e.toLowerCase()];return r!==void 0?this.setHex(r,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=uo(e.r),this.g=uo(e.g),this.b=uo(e.b),this}copyLinearToSRGB(e){return this.r=_d(e.r),this.g=_d(e.g),this.b=_d(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yi){return Et.fromWorkingColorSpace(Tn.copy(this),e),Math.round(un(Tn.r*255,0,255))*65536+Math.round(un(Tn.g*255,0,255))*256+Math.round(un(Tn.b*255,0,255))}getHexString(e=yi){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Et.workingColorSpace){Et.fromWorkingColorSpace(Tn.copy(this),t);const r=Tn.r,o=Tn.g,l=Tn.b,u=Math.max(r,o,l),d=Math.min(r,o,l);let h,p;const m=(d+u)/2;if(d===u)h=0,p=0;else{const g=u-d;switch(p=m<=.5?g/(u+d):g/(2-u-d),u){case r:h=(o-l)/g+(o<l?6:0);break;case o:h=(l-r)/g+2;break;case l:h=(r-o)/g+4;break}h/=6}return e.h=h,e.s=p,e.l=m,e}getRGB(e,t=Et.workingColorSpace){return Et.fromWorkingColorSpace(Tn.copy(this),t),e.r=Tn.r,e.g=Tn.g,e.b=Tn.b,e}getStyle(e=yi){Et.fromWorkingColorSpace(Tn.copy(this),e);const t=Tn.r,r=Tn.g,o=Tn.b;return e!==yi?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${o.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(o*255)})`}offsetHSL(e,t,r){return this.getHSL(Dr),this.setHSL(Dr.h+e,Dr.s+t,Dr.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(Dr),e.getHSL(Gl);const r=xa(Dr.h,Gl.h,t),o=xa(Dr.s,Gl.s,t),l=xa(Dr.l,Gl.l,t);return this.setHSL(r,o,l),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,r=this.g,o=this.b,l=e.elements;return this.r=l[0]*t+l[3]*r+l[6]*o,this.g=l[1]*t+l[4]*r+l[7]*o,this.b=l[2]*t+l[5]*r+l[8]*o,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Tn=new Ze;Ze.NAMES=R0;let nx=0;class fs extends xo{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:nx++}),this.uuid=ir(),this.name="",this.type="Material",this.blending=lo,this.side=Fr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Zd,this.blendDst=eh,this.blendEquation=as,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ze(0,0,0),this.blendAlpha=0,this.depthFunc=ho,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Zm,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Vs,this.stencilZFail=Vs,this.stencilZPass=Vs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const r=e[t];if(r===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const o=this[t];if(o===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}o&&o.isColor?o.set(r):o&&o.isVector3&&r&&r.isVector3?o.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const r={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==lo&&(r.blending=this.blending),this.side!==Fr&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==Zd&&(r.blendSrc=this.blendSrc),this.blendDst!==eh&&(r.blendDst=this.blendDst),this.blendEquation!==as&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==ho&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Zm&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Vs&&(r.stencilFail=this.stencilFail),this.stencilZFail!==Vs&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==Vs&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function o(l){const u=[];for(const d in l){const h=l[d];delete h.metadata,u.push(h)}return u}if(t){const l=o(e.textures),u=o(e.images);l.length>0&&(r.textures=l),u.length>0&&(r.images=u)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let r=null;if(t!==null){const o=t.length;r=new Array(o);for(let l=0;l!==o;++l)r[l]=t[l].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Mo extends fs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.combine=l0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Kt=new N,Wl=new Re;class li{constructor(e,t,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=Oh,this.updateRanges=[],this.gpuType=Li,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let o=0,l=this.itemSize;o<l;o++)this.array[e+o]=t.array[r+o];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)Wl.fromBufferAttribute(this,t),Wl.applyMatrix3(e),this.setXY(t,Wl.x,Wl.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix3(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix4(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)Kt.fromBufferAttribute(this,t),Kt.applyNormalMatrix(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)Kt.fromBufferAttribute(this,t),Kt.transformDirection(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=Mi(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Pt(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Mi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Pt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Mi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Pt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Mi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Pt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Mi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Pt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,o){return e*=this.itemSize,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array),o=Pt(o,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=o,this}setXYZW(e,t,r,o,l){return e*=this.itemSize,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array),o=Pt(o,this.array),l=Pt(l,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=o,this.array[e+3]=l,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Oh&&(e.usage=this.usage),e}}class P0 extends li{constructor(e,t,r){super(new Uint16Array(e),t,r)}}class D0 extends li{constructor(e,t,r){super(new Uint32Array(e),t,r)}}class At extends li{constructor(e,t,r){super(new Float32Array(e),t,r)}}let ix=0;const ri=new Ct,Id=new Ot,Qs=new N,Kn=new hs,ua=new hs,ln=new N;class vn extends xo{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ix++}),this.uuid=ir(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(A0(e)?D0:P0)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,r=0){this.groups.push({start:e,count:t,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const l=new ct().getNormalMatrix(e);r.applyNormalMatrix(l),r.needsUpdate=!0}const o=this.attributes.tangent;return o!==void 0&&(o.transformDirection(e),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ri.makeRotationFromQuaternion(e),this.applyMatrix4(ri),this}rotateX(e){return ri.makeRotationX(e),this.applyMatrix4(ri),this}rotateY(e){return ri.makeRotationY(e),this.applyMatrix4(ri),this}rotateZ(e){return ri.makeRotationZ(e),this.applyMatrix4(ri),this}translate(e,t,r){return ri.makeTranslation(e,t,r),this.applyMatrix4(ri),this}scale(e,t,r){return ri.makeScale(e,t,r),this.applyMatrix4(ri),this}lookAt(e){return Id.lookAt(e),Id.updateMatrix(),this.applyMatrix4(Id.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Qs).negate(),this.translate(Qs.x,Qs.y,Qs.z),this}setFromPoints(e){const t=[];for(let r=0,o=e.length;r<o;r++){const l=e[r];t.push(l.x,l.y,l.z||0)}return this.setAttribute("position",new At(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new hs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const l=t[r];Kn.setFromBufferAttribute(l),this.morphTargetsRelative?(ln.addVectors(this.boundingBox.min,Kn.min),this.boundingBox.expandByPoint(ln),ln.addVectors(this.boundingBox.max,Kn.max),this.boundingBox.expandByPoint(ln)):(this.boundingBox.expandByPoint(Kn.min),this.boundingBox.expandByPoint(Kn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new So);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){const r=this.boundingSphere.center;if(Kn.setFromBufferAttribute(e),t)for(let l=0,u=t.length;l<u;l++){const d=t[l];ua.setFromBufferAttribute(d),this.morphTargetsRelative?(ln.addVectors(Kn.min,ua.min),Kn.expandByPoint(ln),ln.addVectors(Kn.max,ua.max),Kn.expandByPoint(ln)):(Kn.expandByPoint(ua.min),Kn.expandByPoint(ua.max))}Kn.getCenter(r);let o=0;for(let l=0,u=e.count;l<u;l++)ln.fromBufferAttribute(e,l),o=Math.max(o,r.distanceToSquared(ln));if(t)for(let l=0,u=t.length;l<u;l++){const d=t[l],h=this.morphTargetsRelative;for(let p=0,m=d.count;p<m;p++)ln.fromBufferAttribute(d,p),h&&(Qs.fromBufferAttribute(e,p),ln.add(Qs)),o=Math.max(o,r.distanceToSquared(ln))}this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=t.position,o=t.normal,l=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new li(new Float32Array(4*r.count),4));const u=this.getAttribute("tangent"),d=[],h=[];for(let z=0;z<r.count;z++)d[z]=new N,h[z]=new N;const p=new N,m=new N,g=new N,v=new Re,S=new Re,M=new Re,E=new N,y=new N;function x(z,ae,w){p.fromBufferAttribute(r,z),m.fromBufferAttribute(r,ae),g.fromBufferAttribute(r,w),v.fromBufferAttribute(l,z),S.fromBufferAttribute(l,ae),M.fromBufferAttribute(l,w),m.sub(p),g.sub(p),S.sub(v),M.sub(v);const P=1/(S.x*M.y-M.x*S.y);isFinite(P)&&(E.copy(m).multiplyScalar(M.y).addScaledVector(g,-S.y).multiplyScalar(P),y.copy(g).multiplyScalar(S.x).addScaledVector(m,-M.x).multiplyScalar(P),d[z].add(E),d[ae].add(E),d[w].add(E),h[z].add(y),h[ae].add(y),h[w].add(y))}let C=this.groups;C.length===0&&(C=[{start:0,count:e.count}]);for(let z=0,ae=C.length;z<ae;++z){const w=C[z],P=w.start,K=w.count;for(let Q=P,oe=P+K;Q<oe;Q+=3)x(e.getX(Q+0),e.getX(Q+1),e.getX(Q+2))}const A=new N,D=new N,G=new N,k=new N;function I(z){G.fromBufferAttribute(o,z),k.copy(G);const ae=d[z];A.copy(ae),A.sub(G.multiplyScalar(G.dot(ae))).normalize(),D.crossVectors(k,ae);const P=D.dot(h[z])<0?-1:1;u.setXYZW(z,A.x,A.y,A.z,P)}for(let z=0,ae=C.length;z<ae;++z){const w=C[z],P=w.start,K=w.count;for(let Q=P,oe=P+K;Q<oe;Q+=3)I(e.getX(Q+0)),I(e.getX(Q+1)),I(e.getX(Q+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new li(new Float32Array(t.count*3),3),this.setAttribute("normal",r);else for(let v=0,S=r.count;v<S;v++)r.setXYZ(v,0,0,0);const o=new N,l=new N,u=new N,d=new N,h=new N,p=new N,m=new N,g=new N;if(e)for(let v=0,S=e.count;v<S;v+=3){const M=e.getX(v+0),E=e.getX(v+1),y=e.getX(v+2);o.fromBufferAttribute(t,M),l.fromBufferAttribute(t,E),u.fromBufferAttribute(t,y),m.subVectors(u,l),g.subVectors(o,l),m.cross(g),d.fromBufferAttribute(r,M),h.fromBufferAttribute(r,E),p.fromBufferAttribute(r,y),d.add(m),h.add(m),p.add(m),r.setXYZ(M,d.x,d.y,d.z),r.setXYZ(E,h.x,h.y,h.z),r.setXYZ(y,p.x,p.y,p.z)}else for(let v=0,S=t.count;v<S;v+=3)o.fromBufferAttribute(t,v+0),l.fromBufferAttribute(t,v+1),u.fromBufferAttribute(t,v+2),m.subVectors(u,l),g.subVectors(o,l),m.cross(g),r.setXYZ(v+0,m.x,m.y,m.z),r.setXYZ(v+1,m.x,m.y,m.z),r.setXYZ(v+2,m.x,m.y,m.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,r=e.count;t<r;t++)ln.fromBufferAttribute(e,t),ln.normalize(),e.setXYZ(t,ln.x,ln.y,ln.z)}toNonIndexed(){function e(d,h){const p=d.array,m=d.itemSize,g=d.normalized,v=new p.constructor(h.length*m);let S=0,M=0;for(let E=0,y=h.length;E<y;E++){d.isInterleavedBufferAttribute?S=h[E]*d.data.stride+d.offset:S=h[E]*m;for(let x=0;x<m;x++)v[M++]=p[S++]}return new li(v,m,g)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new vn,r=this.index.array,o=this.attributes;for(const d in o){const h=o[d],p=e(h,r);t.setAttribute(d,p)}const l=this.morphAttributes;for(const d in l){const h=[],p=l[d];for(let m=0,g=p.length;m<g;m++){const v=p[m],S=e(v,r);h.push(S)}t.morphAttributes[d]=h}t.morphTargetsRelative=this.morphTargetsRelative;const u=this.groups;for(let d=0,h=u.length;d<h;d++){const p=u[d];t.addGroup(p.start,p.count,p.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const h=this.parameters;for(const p in h)h[p]!==void 0&&(e[p]=h[p]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const r=this.attributes;for(const h in r){const p=r[h];e.data.attributes[h]=p.toJSON(e.data)}const o={};let l=!1;for(const h in this.morphAttributes){const p=this.morphAttributes[h],m=[];for(let g=0,v=p.length;g<v;g++){const S=p[g];m.push(S.toJSON(e.data))}m.length>0&&(o[h]=m,l=!0)}l&&(e.data.morphAttributes=o,e.data.morphTargetsRelative=this.morphTargetsRelative);const u=this.groups;u.length>0&&(e.data.groups=JSON.parse(JSON.stringify(u)));const d=this.boundingSphere;return d!==null&&(e.data.boundingSphere={center:d.center.toArray(),radius:d.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone(t));const o=e.attributes;for(const p in o){const m=o[p];this.setAttribute(p,m.clone(t))}const l=e.morphAttributes;for(const p in l){const m=[],g=l[p];for(let v=0,S=g.length;v<S;v++)m.push(g[v].clone(t));this.morphAttributes[p]=m}this.morphTargetsRelative=e.morphTargetsRelative;const u=e.groups;for(let p=0,m=u.length;p<m;p++){const g=u[p];this.addGroup(g.start,g.count,g.materialIndex)}const d=e.boundingBox;d!==null&&(this.boundingBox=d.clone());const h=e.boundingSphere;return h!==null&&(this.boundingSphere=h.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const p_=new Ct,es=new sf,ql=new So,m_=new N,Xl=new N,jl=new N,Yl=new N,Nd=new N,Kl=new N,__=new N,$l=new N;class Ne extends Ot{constructor(e=new vn,t=new Mo){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const o=t[r[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,u=o.length;l<u;l++){const d=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}getVertexPosition(e,t){const r=this.geometry,o=r.attributes.position,l=r.morphAttributes.position,u=r.morphTargetsRelative;t.fromBufferAttribute(o,e);const d=this.morphTargetInfluences;if(l&&d){Kl.set(0,0,0);for(let h=0,p=l.length;h<p;h++){const m=d[h],g=l[h];m!==0&&(Nd.fromBufferAttribute(g,e),u?Kl.addScaledVector(Nd,m):Kl.addScaledVector(Nd.sub(t),m))}t.add(Kl)}return t}raycast(e,t){const r=this.geometry,o=this.material,l=this.matrixWorld;o!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),ql.copy(r.boundingSphere),ql.applyMatrix4(l),es.copy(e.ray).recast(e.near),!(ql.containsPoint(es.origin)===!1&&(es.intersectSphere(ql,m_)===null||es.origin.distanceToSquared(m_)>(e.far-e.near)**2))&&(p_.copy(l).invert(),es.copy(e.ray).applyMatrix4(p_),!(r.boundingBox!==null&&es.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,es)))}_computeIntersections(e,t,r){let o;const l=this.geometry,u=this.material,d=l.index,h=l.attributes.position,p=l.attributes.uv,m=l.attributes.uv1,g=l.attributes.normal,v=l.groups,S=l.drawRange;if(d!==null)if(Array.isArray(u))for(let M=0,E=v.length;M<E;M++){const y=v[M],x=u[y.materialIndex],C=Math.max(y.start,S.start),A=Math.min(d.count,Math.min(y.start+y.count,S.start+S.count));for(let D=C,G=A;D<G;D+=3){const k=d.getX(D),I=d.getX(D+1),z=d.getX(D+2);o=Ql(this,x,e,r,p,m,g,k,I,z),o&&(o.faceIndex=Math.floor(D/3),o.face.materialIndex=y.materialIndex,t.push(o))}}else{const M=Math.max(0,S.start),E=Math.min(d.count,S.start+S.count);for(let y=M,x=E;y<x;y+=3){const C=d.getX(y),A=d.getX(y+1),D=d.getX(y+2);o=Ql(this,u,e,r,p,m,g,C,A,D),o&&(o.faceIndex=Math.floor(y/3),t.push(o))}}else if(h!==void 0)if(Array.isArray(u))for(let M=0,E=v.length;M<E;M++){const y=v[M],x=u[y.materialIndex],C=Math.max(y.start,S.start),A=Math.min(h.count,Math.min(y.start+y.count,S.start+S.count));for(let D=C,G=A;D<G;D+=3){const k=D,I=D+1,z=D+2;o=Ql(this,x,e,r,p,m,g,k,I,z),o&&(o.faceIndex=Math.floor(D/3),o.face.materialIndex=y.materialIndex,t.push(o))}}else{const M=Math.max(0,S.start),E=Math.min(h.count,S.start+S.count);for(let y=M,x=E;y<x;y+=3){const C=y,A=y+1,D=y+2;o=Ql(this,u,e,r,p,m,g,C,A,D),o&&(o.faceIndex=Math.floor(y/3),t.push(o))}}}}function rx(s,e,t,r,o,l,u,d){let h;if(e.side===Nn?h=r.intersectTriangle(u,l,o,!0,d):h=r.intersectTriangle(o,l,u,e.side===Fr,d),h===null)return null;$l.copy(d),$l.applyMatrix4(s.matrixWorld);const p=t.ray.origin.distanceTo($l);return p<t.near||p>t.far?null:{distance:p,point:$l.clone(),object:s}}function Ql(s,e,t,r,o,l,u,d,h,p){s.getVertexPosition(d,Xl),s.getVertexPosition(h,jl),s.getVertexPosition(p,Yl);const m=rx(s,e,t,r,Xl,jl,Yl,__);if(m){const g=new N;ai.getBarycoord(__,Xl,jl,Yl,g),o&&(m.uv=ai.getInterpolatedAttribute(o,d,h,p,g,new Re)),l&&(m.uv1=ai.getInterpolatedAttribute(l,d,h,p,g,new Re)),u&&(m.normal=ai.getInterpolatedAttribute(u,d,h,p,g,new N),m.normal.dot(r.direction)>0&&m.normal.multiplyScalar(-1));const v={a:d,b:h,c:p,normal:new N,materialIndex:0};ai.getNormal(Xl,jl,Yl,v.normal),m.face=v,m.barycoord=g}return m}class Tt extends vn{constructor(e=1,t=1,r=1,o=1,l=1,u=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:r,widthSegments:o,heightSegments:l,depthSegments:u};const d=this;o=Math.floor(o),l=Math.floor(l),u=Math.floor(u);const h=[],p=[],m=[],g=[];let v=0,S=0;M("z","y","x",-1,-1,r,t,e,u,l,0),M("z","y","x",1,-1,r,t,-e,u,l,1),M("x","z","y",1,1,e,r,t,o,u,2),M("x","z","y",1,-1,e,r,-t,o,u,3),M("x","y","z",1,-1,e,t,r,o,l,4),M("x","y","z",-1,-1,e,t,-r,o,l,5),this.setIndex(h),this.setAttribute("position",new At(p,3)),this.setAttribute("normal",new At(m,3)),this.setAttribute("uv",new At(g,2));function M(E,y,x,C,A,D,G,k,I,z,ae){const w=D/I,P=G/z,K=D/2,Q=G/2,oe=k/2,he=I+1,ne=z+1;let le=0,V=0;const ue=new N;for(let se=0;se<ne;se++){const F=se*P-Q;for(let ie=0;ie<he;ie++){const Fe=ie*w-K;ue[E]=Fe*C,ue[y]=F*A,ue[x]=oe,p.push(ue.x,ue.y,ue.z),ue[E]=0,ue[y]=0,ue[x]=k>0?1:-1,m.push(ue.x,ue.y,ue.z),g.push(ie/I),g.push(1-se/z),le+=1}}for(let se=0;se<z;se++)for(let F=0;F<I;F++){const ie=v+F+he*se,Fe=v+F+he*(se+1),J=v+(F+1)+he*(se+1),ce=v+(F+1)+he*se;h.push(ie,Fe,ce),h.push(Fe,J,ce),V+=6}d.addGroup(S,V,ae),S+=V,v+=le}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Tt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function go(s){const e={};for(const t in s){e[t]={};for(const r in s[t]){const o=s[t][r];o&&(o.isColor||o.isMatrix3||o.isMatrix4||o.isVector2||o.isVector3||o.isVector4||o.isTexture||o.isQuaternion)?o.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][r]=null):e[t][r]=o.clone():Array.isArray(o)?e[t][r]=o.slice():e[t][r]=o}}return e}function Dn(s){const e={};for(let t=0;t<s.length;t++){const r=go(s[t]);for(const o in r)e[o]=r[o]}return e}function sx(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function L0(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Et.workingColorSpace}const Ta={clone:go,merge:Dn};var ox=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ax=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class In extends fs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ox,this.fragmentShader=ax,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=go(e.uniforms),this.uniformsGroups=sx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const o in this.uniforms){const u=this.uniforms[o].value;u&&u.isTexture?t.uniforms[o]={type:"t",value:u.toJSON(e).uuid}:u&&u.isColor?t.uniforms[o]={type:"c",value:u.getHex()}:u&&u.isVector2?t.uniforms[o]={type:"v2",value:u.toArray()}:u&&u.isVector3?t.uniforms[o]={type:"v3",value:u.toArray()}:u&&u.isVector4?t.uniforms[o]={type:"v4",value:u.toArray()}:u&&u.isMatrix3?t.uniforms[o]={type:"m3",value:u.toArray()}:u&&u.isMatrix4?t.uniforms[o]={type:"m4",value:u.toArray()}:t.uniforms[o]={value:u}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const r={};for(const o in this.extensions)this.extensions[o]===!0&&(r[o]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}}class I0 extends Ot{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ct,this.projectionMatrix=new Ct,this.projectionMatrixInverse=new Ct,this.coordinateSystem=Zi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Lr=new N,g_=new Re,v_=new Re;class $n extends I0{constructor(e=50,t=1,r=.1,o=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=o,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ea*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ya*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ea*2*Math.atan(Math.tan(ya*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){Lr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Lr.x,Lr.y).multiplyScalar(-e/Lr.z),Lr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(Lr.x,Lr.y).multiplyScalar(-e/Lr.z)}getViewSize(e,t){return this.getViewBounds(e,g_,v_),t.subVectors(v_,g_)}setViewOffset(e,t,r,o,l,u){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=o,this.view.width=l,this.view.height=u,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ya*.5*this.fov)/this.zoom,r=2*t,o=this.aspect*r,l=-.5*o;const u=this.view;if(this.view!==null&&this.view.enabled){const h=u.fullWidth,p=u.fullHeight;l+=u.offsetX*o/h,t-=u.offsetY*r/p,o*=u.width/h,r*=u.height/p}const d=this.filmOffset;d!==0&&(l+=e*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(l,l+o,t,t-r,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Js=-90,Zs=1;class lx extends Ot{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const o=new $n(Js,Zs,e,t);o.layers=this.layers,this.add(o);const l=new $n(Js,Zs,e,t);l.layers=this.layers,this.add(l);const u=new $n(Js,Zs,e,t);u.layers=this.layers,this.add(u);const d=new $n(Js,Zs,e,t);d.layers=this.layers,this.add(d);const h=new $n(Js,Zs,e,t);h.layers=this.layers,this.add(h);const p=new $n(Js,Zs,e,t);p.layers=this.layers,this.add(p)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[r,o,l,u,d,h]=t;for(const p of t)this.remove(p);if(e===Zi)r.up.set(0,1,0),r.lookAt(1,0,0),o.up.set(0,1,0),o.lookAt(-1,0,0),l.up.set(0,0,-1),l.lookAt(0,1,0),u.up.set(0,0,1),u.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),h.up.set(0,1,0),h.lookAt(0,0,-1);else if(e===Mc)r.up.set(0,-1,0),r.lookAt(-1,0,0),o.up.set(0,-1,0),o.lookAt(1,0,0),l.up.set(0,0,1),l.lookAt(0,1,0),u.up.set(0,0,-1),u.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),h.up.set(0,-1,0),h.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const p of t)this.add(p),p.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:o}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[l,u,d,h,p,m]=this.children,g=e.getRenderTarget(),v=e.getActiveCubeFace(),S=e.getActiveMipmapLevel(),M=e.xr.enabled;e.xr.enabled=!1;const E=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,o),e.render(t,l),e.setRenderTarget(r,1,o),e.render(t,u),e.setRenderTarget(r,2,o),e.render(t,d),e.setRenderTarget(r,3,o),e.render(t,h),e.setRenderTarget(r,4,o),e.render(t,p),r.texture.generateMipmaps=E,e.setRenderTarget(r,5,o),e.render(t,m),e.setRenderTarget(g,v,S),e.xr.enabled=M,r.texture.needsPMREMUpdate=!0}}class N0 extends bn{constructor(e,t,r,o,l,u,d,h,p,m){e=e!==void 0?e:[],t=t!==void 0?t:fo,super(e,t,r,o,l,u,d,h,p,m),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class cx extends Ei{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},o=[r,r,r,r,r,r];this.texture=new N0(o,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Si}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},o=new Tt(5,5,5),l=new In({name:"CubemapFromEquirect",uniforms:go(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:Nn,blending:tr});l.uniforms.tEquirect.value=t;const u=new Ne(o,l),d=t.minFilter;return t.minFilter===us&&(t.minFilter=Si),new lx(1,10,this).update(e,u),t.minFilter=d,u.geometry.dispose(),u.material.dispose(),this}clear(e,t,r,o){const l=e.getRenderTarget();for(let u=0;u<6;u++)e.setRenderTarget(this,u),e.clear(t,r,o);e.setRenderTarget(l)}}const Ud=new N,ux=new N,dx=new ct;class ss{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,o){return this.normal.set(e,t,r),this.constant=o,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){const o=Ud.subVectors(r,t).cross(ux.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(o,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const r=e.delta(Ud),o=this.normal.dot(r);if(o===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const l=-(e.start.dot(this.normal)+this.constant)/o;return l<0||l>1?null:t.copy(e.start).addScaledVector(r,l)}intersectsLine(e){const t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const r=t||dx.getNormalMatrix(e),o=this.coplanarPoint(Ud).applyMatrix4(e),l=this.normal.applyMatrix3(r).normalize();return this.constant=-o.dot(l),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ts=new So,Jl=new N;class af{constructor(e=new ss,t=new ss,r=new ss,o=new ss,l=new ss,u=new ss){this.planes=[e,t,r,o,l,u]}set(e,t,r,o,l,u){const d=this.planes;return d[0].copy(e),d[1].copy(t),d[2].copy(r),d[3].copy(o),d[4].copy(l),d[5].copy(u),this}copy(e){const t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=Zi){const r=this.planes,o=e.elements,l=o[0],u=o[1],d=o[2],h=o[3],p=o[4],m=o[5],g=o[6],v=o[7],S=o[8],M=o[9],E=o[10],y=o[11],x=o[12],C=o[13],A=o[14],D=o[15];if(r[0].setComponents(h-l,v-p,y-S,D-x).normalize(),r[1].setComponents(h+l,v+p,y+S,D+x).normalize(),r[2].setComponents(h+u,v+m,y+M,D+C).normalize(),r[3].setComponents(h-u,v-m,y-M,D-C).normalize(),r[4].setComponents(h-d,v-g,y-E,D-A).normalize(),t===Zi)r[5].setComponents(h+d,v+g,y+E,D+A).normalize();else if(t===Mc)r[5].setComponents(d,g,E,A).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ts.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ts.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ts)}intersectsSprite(e){return ts.center.set(0,0,0),ts.radius=.7071067811865476,ts.applyMatrix4(e.matrixWorld),this.intersectsSphere(ts)}intersectsSphere(e){const t=this.planes,r=e.center,o=-e.radius;for(let l=0;l<6;l++)if(t[l].distanceToPoint(r)<o)return!1;return!0}intersectsBox(e){const t=this.planes;for(let r=0;r<6;r++){const o=t[r];if(Jl.x=o.normal.x>0?e.max.x:e.min.x,Jl.y=o.normal.y>0?e.max.y:e.min.y,Jl.z=o.normal.z>0?e.max.z:e.min.z,o.distanceToPoint(Jl)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function U0(){let s=null,e=!1,t=null,r=null;function o(l,u){t(l,u),r=s.requestAnimationFrame(o)}return{start:function(){e!==!0&&t!==null&&(r=s.requestAnimationFrame(o),e=!0)},stop:function(){s.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(l){t=l},setContext:function(l){s=l}}}function hx(s){const e=new WeakMap;function t(d,h){const p=d.array,m=d.usage,g=p.byteLength,v=s.createBuffer();s.bindBuffer(h,v),s.bufferData(h,p,m),d.onUploadCallback();let S;if(p instanceof Float32Array)S=s.FLOAT;else if(p instanceof Uint16Array)d.isFloat16BufferAttribute?S=s.HALF_FLOAT:S=s.UNSIGNED_SHORT;else if(p instanceof Int16Array)S=s.SHORT;else if(p instanceof Uint32Array)S=s.UNSIGNED_INT;else if(p instanceof Int32Array)S=s.INT;else if(p instanceof Int8Array)S=s.BYTE;else if(p instanceof Uint8Array)S=s.UNSIGNED_BYTE;else if(p instanceof Uint8ClampedArray)S=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+p);return{buffer:v,type:S,bytesPerElement:p.BYTES_PER_ELEMENT,version:d.version,size:g}}function r(d,h,p){const m=h.array,g=h.updateRanges;if(s.bindBuffer(p,d),g.length===0)s.bufferSubData(p,0,m);else{g.sort((S,M)=>S.start-M.start);let v=0;for(let S=1;S<g.length;S++){const M=g[v],E=g[S];E.start<=M.start+M.count+1?M.count=Math.max(M.count,E.start+E.count-M.start):(++v,g[v]=E)}g.length=v+1;for(let S=0,M=g.length;S<M;S++){const E=g[S];s.bufferSubData(p,E.start*m.BYTES_PER_ELEMENT,m,E.start,E.count)}h.clearUpdateRanges()}h.onUploadCallback()}function o(d){return d.isInterleavedBufferAttribute&&(d=d.data),e.get(d)}function l(d){d.isInterleavedBufferAttribute&&(d=d.data);const h=e.get(d);h&&(s.deleteBuffer(h.buffer),e.delete(d))}function u(d,h){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const m=e.get(d);(!m||m.version<d.version)&&e.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const p=e.get(d);if(p===void 0)e.set(d,t(d,h));else if(p.version<d.version){if(p.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(p.buffer,d,h),p.version=d.version}}return{get:o,remove:l,update:u}}class ps extends vn{constructor(e=1,t=1,r=1,o=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:r,heightSegments:o};const l=e/2,u=t/2,d=Math.floor(r),h=Math.floor(o),p=d+1,m=h+1,g=e/d,v=t/h,S=[],M=[],E=[],y=[];for(let x=0;x<m;x++){const C=x*v-u;for(let A=0;A<p;A++){const D=A*g-l;M.push(D,-C,0),E.push(0,0,1),y.push(A/d),y.push(1-x/h)}}for(let x=0;x<h;x++)for(let C=0;C<d;C++){const A=C+p*x,D=C+p*(x+1),G=C+1+p*(x+1),k=C+1+p*x;S.push(A,D,k),S.push(D,G,k)}this.setIndex(S),this.setAttribute("position",new At(M,3)),this.setAttribute("normal",new At(E,3)),this.setAttribute("uv",new At(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ps(e.width,e.height,e.widthSegments,e.heightSegments)}}var fx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,px=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,mx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,_x=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,vx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yx=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,xx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Sx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Mx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,wx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ex=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Tx=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ax=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bx=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Cx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Rx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Px=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Dx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Lx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Ix=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Nx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ux=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,kx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Fx=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ox=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Bx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,zx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Vx=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Hx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Gx="gl_FragColor = linearToOutputTexel( gl_FragColor );",Wx=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,qx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Xx=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,jx=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Yx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Kx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,$x=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Qx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Jx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Zx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,e1=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,t1=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,n1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,i1=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,r1=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,s1=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,o1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,a1=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,l1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,c1=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,u1=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,d1=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,h1=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,f1=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,p1=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,m1=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,_1=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,g1=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,v1=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,y1=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,x1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,S1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,M1=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,w1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,E1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,T1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,A1=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,b1=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,C1=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,R1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,P1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,D1=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,L1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,I1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,N1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,U1=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,k1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,F1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,O1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,B1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,z1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,V1=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,H1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,G1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,W1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,q1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,X1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,j1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Y1=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,K1=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,$1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Q1=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,J1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Z1=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,eS=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,tS=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,nS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,iS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,rS=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,sS=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,oS=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,aS=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,lS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,cS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,dS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const hS=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,fS=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mS=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_S=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gS=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,yS=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,xS=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,SS=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,MS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,wS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ES=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,TS=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,AS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,bS=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,CS=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,RS=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,PS=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,DS=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,LS=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,IS=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,NS=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,US=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kS=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,FS=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,OS=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,BS=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zS=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,VS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,HS=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,GS=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,WS=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,qS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,lt={alphahash_fragment:fx,alphahash_pars_fragment:px,alphamap_fragment:mx,alphamap_pars_fragment:_x,alphatest_fragment:gx,alphatest_pars_fragment:vx,aomap_fragment:yx,aomap_pars_fragment:xx,batching_pars_vertex:Sx,batching_vertex:Mx,begin_vertex:wx,beginnormal_vertex:Ex,bsdfs:Tx,iridescence_fragment:Ax,bumpmap_pars_fragment:bx,clipping_planes_fragment:Cx,clipping_planes_pars_fragment:Rx,clipping_planes_pars_vertex:Px,clipping_planes_vertex:Dx,color_fragment:Lx,color_pars_fragment:Ix,color_pars_vertex:Nx,color_vertex:Ux,common:kx,cube_uv_reflection_fragment:Fx,defaultnormal_vertex:Ox,displacementmap_pars_vertex:Bx,displacementmap_vertex:zx,emissivemap_fragment:Vx,emissivemap_pars_fragment:Hx,colorspace_fragment:Gx,colorspace_pars_fragment:Wx,envmap_fragment:qx,envmap_common_pars_fragment:Xx,envmap_pars_fragment:jx,envmap_pars_vertex:Yx,envmap_physical_pars_fragment:s1,envmap_vertex:Kx,fog_vertex:$x,fog_pars_vertex:Qx,fog_fragment:Jx,fog_pars_fragment:Zx,gradientmap_pars_fragment:e1,lightmap_pars_fragment:t1,lights_lambert_fragment:n1,lights_lambert_pars_fragment:i1,lights_pars_begin:r1,lights_toon_fragment:o1,lights_toon_pars_fragment:a1,lights_phong_fragment:l1,lights_phong_pars_fragment:c1,lights_physical_fragment:u1,lights_physical_pars_fragment:d1,lights_fragment_begin:h1,lights_fragment_maps:f1,lights_fragment_end:p1,logdepthbuf_fragment:m1,logdepthbuf_pars_fragment:_1,logdepthbuf_pars_vertex:g1,logdepthbuf_vertex:v1,map_fragment:y1,map_pars_fragment:x1,map_particle_fragment:S1,map_particle_pars_fragment:M1,metalnessmap_fragment:w1,metalnessmap_pars_fragment:E1,morphinstance_vertex:T1,morphcolor_vertex:A1,morphnormal_vertex:b1,morphtarget_pars_vertex:C1,morphtarget_vertex:R1,normal_fragment_begin:P1,normal_fragment_maps:D1,normal_pars_fragment:L1,normal_pars_vertex:I1,normal_vertex:N1,normalmap_pars_fragment:U1,clearcoat_normal_fragment_begin:k1,clearcoat_normal_fragment_maps:F1,clearcoat_pars_fragment:O1,iridescence_pars_fragment:B1,opaque_fragment:z1,packing:V1,premultiplied_alpha_fragment:H1,project_vertex:G1,dithering_fragment:W1,dithering_pars_fragment:q1,roughnessmap_fragment:X1,roughnessmap_pars_fragment:j1,shadowmap_pars_fragment:Y1,shadowmap_pars_vertex:K1,shadowmap_vertex:$1,shadowmask_pars_fragment:Q1,skinbase_vertex:J1,skinning_pars_vertex:Z1,skinning_vertex:eS,skinnormal_vertex:tS,specularmap_fragment:nS,specularmap_pars_fragment:iS,tonemapping_fragment:rS,tonemapping_pars_fragment:sS,transmission_fragment:oS,transmission_pars_fragment:aS,uv_pars_fragment:lS,uv_pars_vertex:cS,uv_vertex:uS,worldpos_vertex:dS,background_vert:hS,background_frag:fS,backgroundCube_vert:pS,backgroundCube_frag:mS,cube_vert:_S,cube_frag:gS,depth_vert:vS,depth_frag:yS,distanceRGBA_vert:xS,distanceRGBA_frag:SS,equirect_vert:MS,equirect_frag:wS,linedashed_vert:ES,linedashed_frag:TS,meshbasic_vert:AS,meshbasic_frag:bS,meshlambert_vert:CS,meshlambert_frag:RS,meshmatcap_vert:PS,meshmatcap_frag:DS,meshnormal_vert:LS,meshnormal_frag:IS,meshphong_vert:NS,meshphong_frag:US,meshphysical_vert:kS,meshphysical_frag:FS,meshtoon_vert:OS,meshtoon_frag:BS,points_vert:zS,points_frag:VS,shadow_vert:HS,shadow_frag:GS,sprite_vert:WS,sprite_frag:qS},Ce={common:{diffuse:{value:new Ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ct}},envmap:{envMap:{value:null},envMapRotation:{value:new ct},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ct}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ct}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ct},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ct},normalScale:{value:new Re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ct},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ct}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ct}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ct}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0},uvTransform:{value:new ct}},sprite:{diffuse:{value:new Ze(16777215)},opacity:{value:1},center:{value:new Re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}}},Pi={basic:{uniforms:Dn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:Dn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new Ze(0)}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:Dn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new Ze(0)},specular:{value:new Ze(1118481)},shininess:{value:30}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:Dn([Ce.common,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.roughnessmap,Ce.metalnessmap,Ce.fog,Ce.lights,{emissive:{value:new Ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:Dn([Ce.common,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.gradientmap,Ce.fog,Ce.lights,{emissive:{value:new Ze(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:Dn([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:Dn([Ce.points,Ce.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:Dn([Ce.common,Ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:Dn([Ce.common,Ce.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:Dn([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:Dn([Ce.sprite,Ce.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new ct},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ct}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distanceRGBA:{uniforms:Dn([Ce.common,Ce.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:lt.distanceRGBA_vert,fragmentShader:lt.distanceRGBA_frag},shadow:{uniforms:Dn([Ce.lights,Ce.fog,{color:{value:new Ze(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};Pi.physical={uniforms:Dn([Pi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ct},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ct},clearcoatNormalScale:{value:new Re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ct},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ct},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ct},sheen:{value:0},sheenColor:{value:new Ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ct},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ct},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ct},transmissionSamplerSize:{value:new Re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ct},attenuationDistance:{value:0},attenuationColor:{value:new Ze(0)},specularColor:{value:new Ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ct},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ct},anisotropyVector:{value:new Re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ct}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};const Zl={r:0,b:0,g:0},ns=new Ii,XS=new Ct;function jS(s,e,t,r,o,l,u){const d=new Ze(0);let h=l===!0?0:1,p,m,g=null,v=0,S=null;function M(C){let A=C.isScene===!0?C.background:null;return A&&A.isTexture&&(A=(C.backgroundBlurriness>0?t:e).get(A)),A}function E(C){let A=!1;const D=M(C);D===null?x(d,h):D&&D.isColor&&(x(D,1),A=!0);const G=s.xr.getEnvironmentBlendMode();G==="additive"?r.buffers.color.setClear(0,0,0,1,u):G==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,u),(s.autoClear||A)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function y(C,A){const D=M(A);D&&(D.isCubeTexture||D.mapping===bc)?(m===void 0&&(m=new Ne(new Tt(1,1,1),new In({name:"BackgroundCubeMaterial",uniforms:go(Pi.backgroundCube.uniforms),vertexShader:Pi.backgroundCube.vertexShader,fragmentShader:Pi.backgroundCube.fragmentShader,side:Nn,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),m.geometry.deleteAttribute("uv"),m.onBeforeRender=function(G,k,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(m.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),o.update(m)),ns.copy(A.backgroundRotation),ns.x*=-1,ns.y*=-1,ns.z*=-1,D.isCubeTexture&&D.isRenderTargetTexture===!1&&(ns.y*=-1,ns.z*=-1),m.material.uniforms.envMap.value=D,m.material.uniforms.flipEnvMap.value=D.isCubeTexture&&D.isRenderTargetTexture===!1?-1:1,m.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,m.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,m.material.uniforms.backgroundRotation.value.setFromMatrix4(XS.makeRotationFromEuler(ns)),m.material.toneMapped=Et.getTransfer(D.colorSpace)!==Ft,(g!==D||v!==D.version||S!==s.toneMapping)&&(m.material.needsUpdate=!0,g=D,v=D.version,S=s.toneMapping),m.layers.enableAll(),C.unshift(m,m.geometry,m.material,0,0,null)):D&&D.isTexture&&(p===void 0&&(p=new Ne(new ps(2,2),new In({name:"BackgroundMaterial",uniforms:go(Pi.background.uniforms),vertexShader:Pi.background.vertexShader,fragmentShader:Pi.background.fragmentShader,side:Fr,depthTest:!1,depthWrite:!1,fog:!1})),p.geometry.deleteAttribute("normal"),Object.defineProperty(p.material,"map",{get:function(){return this.uniforms.t2D.value}}),o.update(p)),p.material.uniforms.t2D.value=D,p.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,p.material.toneMapped=Et.getTransfer(D.colorSpace)!==Ft,D.matrixAutoUpdate===!0&&D.updateMatrix(),p.material.uniforms.uvTransform.value.copy(D.matrix),(g!==D||v!==D.version||S!==s.toneMapping)&&(p.material.needsUpdate=!0,g=D,v=D.version,S=s.toneMapping),p.layers.enableAll(),C.unshift(p,p.geometry,p.material,0,0,null))}function x(C,A){C.getRGB(Zl,L0(s)),r.buffers.color.setClear(Zl.r,Zl.g,Zl.b,A,u)}return{getClearColor:function(){return d},setClearColor:function(C,A=1){d.set(C),h=A,x(d,h)},getClearAlpha:function(){return h},setClearAlpha:function(C){h=C,x(d,h)},render:E,addToRenderList:y}}function YS(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),r={},o=v(null);let l=o,u=!1;function d(w,P,K,Q,oe){let he=!1;const ne=g(Q,K,P);l!==ne&&(l=ne,p(l.object)),he=S(w,Q,K,oe),he&&M(w,Q,K,oe),oe!==null&&e.update(oe,s.ELEMENT_ARRAY_BUFFER),(he||u)&&(u=!1,D(w,P,K,Q),oe!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(oe).buffer))}function h(){return s.createVertexArray()}function p(w){return s.bindVertexArray(w)}function m(w){return s.deleteVertexArray(w)}function g(w,P,K){const Q=K.wireframe===!0;let oe=r[w.id];oe===void 0&&(oe={},r[w.id]=oe);let he=oe[P.id];he===void 0&&(he={},oe[P.id]=he);let ne=he[Q];return ne===void 0&&(ne=v(h()),he[Q]=ne),ne}function v(w){const P=[],K=[],Q=[];for(let oe=0;oe<t;oe++)P[oe]=0,K[oe]=0,Q[oe]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:K,attributeDivisors:Q,object:w,attributes:{},index:null}}function S(w,P,K,Q){const oe=l.attributes,he=P.attributes;let ne=0;const le=K.getAttributes();for(const V in le)if(le[V].location>=0){const se=oe[V];let F=he[V];if(F===void 0&&(V==="instanceMatrix"&&w.instanceMatrix&&(F=w.instanceMatrix),V==="instanceColor"&&w.instanceColor&&(F=w.instanceColor)),se===void 0||se.attribute!==F||F&&se.data!==F.data)return!0;ne++}return l.attributesNum!==ne||l.index!==Q}function M(w,P,K,Q){const oe={},he=P.attributes;let ne=0;const le=K.getAttributes();for(const V in le)if(le[V].location>=0){let se=he[V];se===void 0&&(V==="instanceMatrix"&&w.instanceMatrix&&(se=w.instanceMatrix),V==="instanceColor"&&w.instanceColor&&(se=w.instanceColor));const F={};F.attribute=se,se&&se.data&&(F.data=se.data),oe[V]=F,ne++}l.attributes=oe,l.attributesNum=ne,l.index=Q}function E(){const w=l.newAttributes;for(let P=0,K=w.length;P<K;P++)w[P]=0}function y(w){x(w,0)}function x(w,P){const K=l.newAttributes,Q=l.enabledAttributes,oe=l.attributeDivisors;K[w]=1,Q[w]===0&&(s.enableVertexAttribArray(w),Q[w]=1),oe[w]!==P&&(s.vertexAttribDivisor(w,P),oe[w]=P)}function C(){const w=l.newAttributes,P=l.enabledAttributes;for(let K=0,Q=P.length;K<Q;K++)P[K]!==w[K]&&(s.disableVertexAttribArray(K),P[K]=0)}function A(w,P,K,Q,oe,he,ne){ne===!0?s.vertexAttribIPointer(w,P,K,oe,he):s.vertexAttribPointer(w,P,K,Q,oe,he)}function D(w,P,K,Q){E();const oe=Q.attributes,he=K.getAttributes(),ne=P.defaultAttributeValues;for(const le in he){const V=he[le];if(V.location>=0){let ue=oe[le];if(ue===void 0&&(le==="instanceMatrix"&&w.instanceMatrix&&(ue=w.instanceMatrix),le==="instanceColor"&&w.instanceColor&&(ue=w.instanceColor)),ue!==void 0){const se=ue.normalized,F=ue.itemSize,ie=e.get(ue);if(ie===void 0)continue;const Fe=ie.buffer,J=ie.type,ce=ie.bytesPerElement,ye=J===s.INT||J===s.UNSIGNED_INT||ue.gpuType===Kh;if(ue.isInterleavedBufferAttribute){const Se=ue.data,Pe=Se.stride,De=ue.offset;if(Se.isInstancedInterleavedBuffer){for(let rt=0;rt<V.locationSize;rt++)x(V.location+rt,Se.meshPerAttribute);w.isInstancedMesh!==!0&&Q._maxInstanceCount===void 0&&(Q._maxInstanceCount=Se.meshPerAttribute*Se.count)}else for(let rt=0;rt<V.locationSize;rt++)y(V.location+rt);s.bindBuffer(s.ARRAY_BUFFER,Fe);for(let rt=0;rt<V.locationSize;rt++)A(V.location+rt,F/V.locationSize,J,se,Pe*ce,(De+F/V.locationSize*rt)*ce,ye)}else{if(ue.isInstancedBufferAttribute){for(let Se=0;Se<V.locationSize;Se++)x(V.location+Se,ue.meshPerAttribute);w.isInstancedMesh!==!0&&Q._maxInstanceCount===void 0&&(Q._maxInstanceCount=ue.meshPerAttribute*ue.count)}else for(let Se=0;Se<V.locationSize;Se++)y(V.location+Se);s.bindBuffer(s.ARRAY_BUFFER,Fe);for(let Se=0;Se<V.locationSize;Se++)A(V.location+Se,F/V.locationSize,J,se,F*ce,F/V.locationSize*Se*ce,ye)}}else if(ne!==void 0){const se=ne[le];if(se!==void 0)switch(se.length){case 2:s.vertexAttrib2fv(V.location,se);break;case 3:s.vertexAttrib3fv(V.location,se);break;case 4:s.vertexAttrib4fv(V.location,se);break;default:s.vertexAttrib1fv(V.location,se)}}}}C()}function G(){z();for(const w in r){const P=r[w];for(const K in P){const Q=P[K];for(const oe in Q)m(Q[oe].object),delete Q[oe];delete P[K]}delete r[w]}}function k(w){if(r[w.id]===void 0)return;const P=r[w.id];for(const K in P){const Q=P[K];for(const oe in Q)m(Q[oe].object),delete Q[oe];delete P[K]}delete r[w.id]}function I(w){for(const P in r){const K=r[P];if(K[w.id]===void 0)continue;const Q=K[w.id];for(const oe in Q)m(Q[oe].object),delete Q[oe];delete K[w.id]}}function z(){ae(),u=!0,l!==o&&(l=o,p(l.object))}function ae(){o.geometry=null,o.program=null,o.wireframe=!1}return{setup:d,reset:z,resetDefaultState:ae,dispose:G,releaseStatesOfGeometry:k,releaseStatesOfProgram:I,initAttributes:E,enableAttribute:y,disableUnusedAttributes:C}}function KS(s,e,t){let r;function o(p){r=p}function l(p,m){s.drawArrays(r,p,m),t.update(m,r,1)}function u(p,m,g){g!==0&&(s.drawArraysInstanced(r,p,m,g),t.update(m,r,g))}function d(p,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,p,0,m,0,g);let S=0;for(let M=0;M<g;M++)S+=m[M];t.update(S,r,1)}function h(p,m,g,v){if(g===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let M=0;M<p.length;M++)u(p[M],m[M],v[M]);else{S.multiDrawArraysInstancedWEBGL(r,p,0,m,0,v,0,g);let M=0;for(let E=0;E<g;E++)M+=m[E];for(let E=0;E<v.length;E++)t.update(M,r,v[E])}}this.setMode=o,this.render=l,this.renderInstances=u,this.renderMultiDraw=d,this.renderMultiDrawInstances=h}function $S(s,e,t,r){let o;function l(){if(o!==void 0)return o;if(e.has("EXT_texture_filter_anisotropic")===!0){const I=e.get("EXT_texture_filter_anisotropic");o=s.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else o=0;return o}function u(I){return!(I!==wi&&r.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(I){const z=I===nr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==rr&&r.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Li&&!z)}function h(I){if(I==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let p=t.precision!==void 0?t.precision:"highp";const m=h(p);m!==p&&(console.warn("THREE.WebGLRenderer:",p,"not supported, using",m,"instead."),p=m);const g=t.logarithmicDepthBuffer===!0,v=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(v===!0){const I=e.get("EXT_clip_control");I.clipControlEXT(I.LOWER_LEFT_EXT,I.ZERO_TO_ONE_EXT)}const S=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),M=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=s.getParameter(s.MAX_TEXTURE_SIZE),y=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),x=s.getParameter(s.MAX_VERTEX_ATTRIBS),C=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),A=s.getParameter(s.MAX_VARYING_VECTORS),D=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),G=M>0,k=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:h,textureFormatReadable:u,textureTypeReadable:d,precision:p,logarithmicDepthBuffer:g,reverseDepthBuffer:v,maxTextures:S,maxVertexTextures:M,maxTextureSize:E,maxCubemapSize:y,maxAttributes:x,maxVertexUniforms:C,maxVaryings:A,maxFragmentUniforms:D,vertexTextures:G,maxSamples:k}}function QS(s){const e=this;let t=null,r=0,o=!1,l=!1;const u=new ss,d=new ct,h={value:null,needsUpdate:!1};this.uniform=h,this.numPlanes=0,this.numIntersection=0,this.init=function(g,v){const S=g.length!==0||v||r!==0||o;return o=v,r=g.length,S},this.beginShadows=function(){l=!0,m(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(g,v){t=m(g,v,0)},this.setState=function(g,v,S){const M=g.clippingPlanes,E=g.clipIntersection,y=g.clipShadows,x=s.get(g);if(!o||M===null||M.length===0||l&&!y)l?m(null):p();else{const C=l?0:r,A=C*4;let D=x.clippingState||null;h.value=D,D=m(M,v,A,S);for(let G=0;G!==A;++G)D[G]=t[G];x.clippingState=D,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=C}};function p(){h.value!==t&&(h.value=t,h.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function m(g,v,S,M){const E=g!==null?g.length:0;let y=null;if(E!==0){if(y=h.value,M!==!0||y===null){const x=S+E*4,C=v.matrixWorldInverse;d.getNormalMatrix(C),(y===null||y.length<x)&&(y=new Float32Array(x));for(let A=0,D=S;A!==E;++A,D+=4)u.copy(g[A]).applyMatrix4(C,d),u.normal.toArray(y,D),y[D+3]=u.constant}h.value=y,h.needsUpdate=!0}return e.numPlanes=E,e.numIntersection=0,y}}function JS(s){let e=new WeakMap;function t(u,d){return d===lh?u.mapping=fo:d===ch&&(u.mapping=po),u}function r(u){if(u&&u.isTexture){const d=u.mapping;if(d===lh||d===ch)if(e.has(u)){const h=e.get(u).texture;return t(h,u.mapping)}else{const h=u.image;if(h&&h.height>0){const p=new cx(h.height);return p.fromEquirectangularTexture(s,u),e.set(u,p),u.addEventListener("dispose",o),t(p.texture,u.mapping)}else return null}}return u}function o(u){const d=u.target;d.removeEventListener("dispose",o);const h=e.get(d);h!==void 0&&(e.delete(d),h.dispose())}function l(){e=new WeakMap}return{get:r,dispose:l}}class lf extends I0{constructor(e=-1,t=1,r=1,o=-1,l=.1,u=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=o,this.near=l,this.far=u,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,o,l,u){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=o,this.view.width=l,this.view.height=u,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,o=(this.top+this.bottom)/2;let l=r-e,u=r+e,d=o+t,h=o-t;if(this.view!==null&&this.view.enabled){const p=(this.right-this.left)/this.view.fullWidth/this.zoom,m=(this.top-this.bottom)/this.view.fullHeight/this.zoom;l+=p*this.view.offsetX,u=l+p*this.view.width,d-=m*this.view.offsetY,h=d-m*this.view.height}this.projectionMatrix.makeOrthographic(l,u,d,h,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const ao=4,y_=[.125,.215,.35,.446,.526,.582],ls=20,kd=new lf,x_=new Ze;let Fd=null,Od=0,Bd=0,zd=!1;const os=(1+Math.sqrt(5))/2,eo=1/os,S_=[new N(-os,eo,0),new N(os,eo,0),new N(-eo,0,os),new N(eo,0,os),new N(0,os,-eo),new N(0,os,eo),new N(-1,1,-1),new N(1,1,-1),new N(-1,1,1),new N(1,1,1)];class Bh{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,r=.1,o=100){Fd=this._renderer.getRenderTarget(),Od=this._renderer.getActiveCubeFace(),Bd=this._renderer.getActiveMipmapLevel(),zd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,r,o,l),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=E_(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=w_(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Fd,Od,Bd),this._renderer.xr.enabled=zd,e.scissorTest=!1,ec(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===fo||e.mapping===po?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Fd=this._renderer.getRenderTarget(),Od=this._renderer.getActiveCubeFace(),Bd=this._renderer.getActiveMipmapLevel(),zd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:Si,minFilter:Si,generateMipmaps:!1,type:nr,format:wi,colorSpace:Or,depthBuffer:!1},o=M_(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=M_(e,t,r);const{_lodMax:l}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ZS(l)),this._blurMaterial=eM(l,e,t)}return o}_compileMaterial(e){const t=new Ne(this._lodPlanes[0],e);this._renderer.compile(t,kd)}_sceneToCubeUV(e,t,r,o){const d=new $n(90,1,t,r),h=[1,-1,1,1,1,1],p=[1,1,1,-1,-1,-1],m=this._renderer,g=m.autoClear,v=m.toneMapping;m.getClearColor(x_),m.toneMapping=kr,m.autoClear=!1;const S=new Mo({name:"PMREM.Background",side:Nn,depthWrite:!1,depthTest:!1}),M=new Ne(new Tt,S);let E=!1;const y=e.background;y?y.isColor&&(S.color.copy(y),e.background=null,E=!0):(S.color.copy(x_),E=!0);for(let x=0;x<6;x++){const C=x%3;C===0?(d.up.set(0,h[x],0),d.lookAt(p[x],0,0)):C===1?(d.up.set(0,0,h[x]),d.lookAt(0,p[x],0)):(d.up.set(0,h[x],0),d.lookAt(0,0,p[x]));const A=this._cubeSize;ec(o,C*A,x>2?A:0,A,A),m.setRenderTarget(o),E&&m.render(M,d),m.render(e,d)}M.geometry.dispose(),M.material.dispose(),m.toneMapping=v,m.autoClear=g,e.background=y}_textureToCubeUV(e,t){const r=this._renderer,o=e.mapping===fo||e.mapping===po;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=E_()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=w_());const l=o?this._cubemapMaterial:this._equirectMaterial,u=new Ne(this._lodPlanes[0],l),d=l.uniforms;d.envMap.value=e;const h=this._cubeSize;ec(t,0,0,3*h,2*h),r.setRenderTarget(t),r.render(u,kd)}_applyPMREM(e){const t=this._renderer,r=t.autoClear;t.autoClear=!1;const o=this._lodPlanes.length;for(let l=1;l<o;l++){const u=Math.sqrt(this._sigmas[l]*this._sigmas[l]-this._sigmas[l-1]*this._sigmas[l-1]),d=S_[(o-l-1)%S_.length];this._blur(e,l-1,l,u,d)}t.autoClear=r}_blur(e,t,r,o,l){const u=this._pingPongRenderTarget;this._halfBlur(e,u,t,r,o,"latitudinal",l),this._halfBlur(u,e,r,r,o,"longitudinal",l)}_halfBlur(e,t,r,o,l,u,d){const h=this._renderer,p=this._blurMaterial;u!=="latitudinal"&&u!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const m=3,g=new Ne(this._lodPlanes[o],p),v=p.uniforms,S=this._sizeLods[r]-1,M=isFinite(l)?Math.PI/(2*S):2*Math.PI/(2*ls-1),E=l/M,y=isFinite(l)?1+Math.floor(m*E):ls;y>ls&&console.warn(`sigmaRadians, ${l}, is too large and will clip, as it requested ${y} samples when the maximum is set to ${ls}`);const x=[];let C=0;for(let I=0;I<ls;++I){const z=I/E,ae=Math.exp(-z*z/2);x.push(ae),I===0?C+=ae:I<y&&(C+=2*ae)}for(let I=0;I<x.length;I++)x[I]=x[I]/C;v.envMap.value=e.texture,v.samples.value=y,v.weights.value=x,v.latitudinal.value=u==="latitudinal",d&&(v.poleAxis.value=d);const{_lodMax:A}=this;v.dTheta.value=M,v.mipInt.value=A-r;const D=this._sizeLods[o],G=3*D*(o>A-ao?o-A+ao:0),k=4*(this._cubeSize-D);ec(t,G,k,3*D,2*D),h.setRenderTarget(t),h.render(g,kd)}}function ZS(s){const e=[],t=[],r=[];let o=s;const l=s-ao+1+y_.length;for(let u=0;u<l;u++){const d=Math.pow(2,o);t.push(d);let h=1/d;u>s-ao?h=y_[u-s+ao-1]:u===0&&(h=0),r.push(h);const p=1/(d-2),m=-p,g=1+p,v=[m,m,g,m,g,g,m,m,g,g,m,g],S=6,M=6,E=3,y=2,x=1,C=new Float32Array(E*M*S),A=new Float32Array(y*M*S),D=new Float32Array(x*M*S);for(let k=0;k<S;k++){const I=k%3*2/3-1,z=k>2?0:-1,ae=[I,z,0,I+2/3,z,0,I+2/3,z+1,0,I,z,0,I+2/3,z+1,0,I,z+1,0];C.set(ae,E*M*k),A.set(v,y*M*k);const w=[k,k,k,k,k,k];D.set(w,x*M*k)}const G=new vn;G.setAttribute("position",new li(C,E)),G.setAttribute("uv",new li(A,y)),G.setAttribute("faceIndex",new li(D,x)),e.push(G),o>ao&&o--}return{lodPlanes:e,sizeLods:t,sigmas:r}}function M_(s,e,t){const r=new Ei(s,e,t);return r.texture.mapping=bc,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function ec(s,e,t,r,o){s.viewport.set(e,t,r,o),s.scissor.set(e,t,r,o)}function eM(s,e,t){const r=new Float32Array(ls),o=new N(0,1,0);return new In({name:"SphericalGaussianBlur",defines:{n:ls,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:cf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:tr,depthTest:!1,depthWrite:!1})}function w_(){return new In({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:cf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:tr,depthTest:!1,depthWrite:!1})}function E_(){return new In({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:cf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:tr,depthTest:!1,depthWrite:!1})}function cf(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function tM(s){let e=new WeakMap,t=null;function r(d){if(d&&d.isTexture){const h=d.mapping,p=h===lh||h===ch,m=h===fo||h===po;if(p||m){let g=e.get(d);const v=g!==void 0?g.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==v)return t===null&&(t=new Bh(s)),g=p?t.fromEquirectangular(d,g):t.fromCubemap(d,g),g.texture.pmremVersion=d.pmremVersion,e.set(d,g),g.texture;if(g!==void 0)return g.texture;{const S=d.image;return p&&S&&S.height>0||m&&S&&o(S)?(t===null&&(t=new Bh(s)),g=p?t.fromEquirectangular(d):t.fromCubemap(d),g.texture.pmremVersion=d.pmremVersion,e.set(d,g),d.addEventListener("dispose",l),g.texture):null}}}return d}function o(d){let h=0;const p=6;for(let m=0;m<p;m++)d[m]!==void 0&&h++;return h===p}function l(d){const h=d.target;h.removeEventListener("dispose",l);const p=e.get(h);p!==void 0&&(e.delete(h),p.dispose())}function u(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:r,dispose:u}}function nM(s){const e={};function t(r){if(e[r]!==void 0)return e[r];let o;switch(r){case"WEBGL_depth_texture":o=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":o=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":o=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":o=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:o=s.getExtension(r)}return e[r]=o,o}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const o=t(r);return o===null&&_c("THREE.WebGLRenderer: "+r+" extension not supported."),o}}}function iM(s,e,t,r){const o={},l=new WeakMap;function u(g){const v=g.target;v.index!==null&&e.remove(v.index);for(const M in v.attributes)e.remove(v.attributes[M]);for(const M in v.morphAttributes){const E=v.morphAttributes[M];for(let y=0,x=E.length;y<x;y++)e.remove(E[y])}v.removeEventListener("dispose",u),delete o[v.id];const S=l.get(v);S&&(e.remove(S),l.delete(v)),r.releaseStatesOfGeometry(v),v.isInstancedBufferGeometry===!0&&delete v._maxInstanceCount,t.memory.geometries--}function d(g,v){return o[v.id]===!0||(v.addEventListener("dispose",u),o[v.id]=!0,t.memory.geometries++),v}function h(g){const v=g.attributes;for(const M in v)e.update(v[M],s.ARRAY_BUFFER);const S=g.morphAttributes;for(const M in S){const E=S[M];for(let y=0,x=E.length;y<x;y++)e.update(E[y],s.ARRAY_BUFFER)}}function p(g){const v=[],S=g.index,M=g.attributes.position;let E=0;if(S!==null){const C=S.array;E=S.version;for(let A=0,D=C.length;A<D;A+=3){const G=C[A+0],k=C[A+1],I=C[A+2];v.push(G,k,k,I,I,G)}}else if(M!==void 0){const C=M.array;E=M.version;for(let A=0,D=C.length/3-1;A<D;A+=3){const G=A+0,k=A+1,I=A+2;v.push(G,k,k,I,I,G)}}else return;const y=new(A0(v)?D0:P0)(v,1);y.version=E;const x=l.get(g);x&&e.remove(x),l.set(g,y)}function m(g){const v=l.get(g);if(v){const S=g.index;S!==null&&v.version<S.version&&p(g)}else p(g);return l.get(g)}return{get:d,update:h,getWireframeAttribute:m}}function rM(s,e,t){let r;function o(v){r=v}let l,u;function d(v){l=v.type,u=v.bytesPerElement}function h(v,S){s.drawElements(r,S,l,v*u),t.update(S,r,1)}function p(v,S,M){M!==0&&(s.drawElementsInstanced(r,S,l,v*u,M),t.update(S,r,M))}function m(v,S,M){if(M===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,S,0,l,v,0,M);let y=0;for(let x=0;x<M;x++)y+=S[x];t.update(y,r,1)}function g(v,S,M,E){if(M===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let x=0;x<v.length;x++)p(v[x]/u,S[x],E[x]);else{y.multiDrawElementsInstancedWEBGL(r,S,0,l,v,0,E,0,M);let x=0;for(let C=0;C<M;C++)x+=S[C];for(let C=0;C<E.length;C++)t.update(x,r,E[C])}}this.setMode=o,this.setIndex=d,this.render=h,this.renderInstances=p,this.renderMultiDraw=m,this.renderMultiDrawInstances=g}function sM(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(l,u,d){switch(t.calls++,u){case s.TRIANGLES:t.triangles+=d*(l/3);break;case s.LINES:t.lines+=d*(l/2);break;case s.LINE_STRIP:t.lines+=d*(l-1);break;case s.LINE_LOOP:t.lines+=d*l;break;case s.POINTS:t.points+=d*l;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",u);break}}function o(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:o,update:r}}function oM(s,e,t){const r=new WeakMap,o=new It;function l(u,d,h){const p=u.morphTargetInfluences,m=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,g=m!==void 0?m.length:0;let v=r.get(d);if(v===void 0||v.count!==g){let w=function(){z.dispose(),r.delete(d),d.removeEventListener("dispose",w)};var S=w;v!==void 0&&v.texture.dispose();const M=d.morphAttributes.position!==void 0,E=d.morphAttributes.normal!==void 0,y=d.morphAttributes.color!==void 0,x=d.morphAttributes.position||[],C=d.morphAttributes.normal||[],A=d.morphAttributes.color||[];let D=0;M===!0&&(D=1),E===!0&&(D=2),y===!0&&(D=3);let G=d.attributes.position.count*D,k=1;G>e.maxTextureSize&&(k=Math.ceil(G/e.maxTextureSize),G=e.maxTextureSize);const I=new Float32Array(G*k*4*g),z=new C0(I,G,k,g);z.type=Li,z.needsUpdate=!0;const ae=D*4;for(let P=0;P<g;P++){const K=x[P],Q=C[P],oe=A[P],he=G*k*4*P;for(let ne=0;ne<K.count;ne++){const le=ne*ae;M===!0&&(o.fromBufferAttribute(K,ne),I[he+le+0]=o.x,I[he+le+1]=o.y,I[he+le+2]=o.z,I[he+le+3]=0),E===!0&&(o.fromBufferAttribute(Q,ne),I[he+le+4]=o.x,I[he+le+5]=o.y,I[he+le+6]=o.z,I[he+le+7]=0),y===!0&&(o.fromBufferAttribute(oe,ne),I[he+le+8]=o.x,I[he+le+9]=o.y,I[he+le+10]=o.z,I[he+le+11]=oe.itemSize===4?o.w:1)}}v={count:g,texture:z,size:new Re(G,k)},r.set(d,v),d.addEventListener("dispose",w)}if(u.isInstancedMesh===!0&&u.morphTexture!==null)h.getUniforms().setValue(s,"morphTexture",u.morphTexture,t);else{let M=0;for(let y=0;y<p.length;y++)M+=p[y];const E=d.morphTargetsRelative?1:1-M;h.getUniforms().setValue(s,"morphTargetBaseInfluence",E),h.getUniforms().setValue(s,"morphTargetInfluences",p)}h.getUniforms().setValue(s,"morphTargetsTexture",v.texture,t),h.getUniforms().setValue(s,"morphTargetsTextureSize",v.size)}return{update:l}}function aM(s,e,t,r){let o=new WeakMap;function l(h){const p=r.render.frame,m=h.geometry,g=e.get(h,m);if(o.get(g)!==p&&(e.update(g),o.set(g,p)),h.isInstancedMesh&&(h.hasEventListener("dispose",d)===!1&&h.addEventListener("dispose",d),o.get(h)!==p&&(t.update(h.instanceMatrix,s.ARRAY_BUFFER),h.instanceColor!==null&&t.update(h.instanceColor,s.ARRAY_BUFFER),o.set(h,p))),h.isSkinnedMesh){const v=h.skeleton;o.get(v)!==p&&(v.update(),o.set(v,p))}return g}function u(){o=new WeakMap}function d(h){const p=h.target;p.removeEventListener("dispose",d),t.remove(p.instanceMatrix),p.instanceColor!==null&&t.remove(p.instanceColor)}return{update:l,dispose:u}}class k0 extends bn{constructor(e,t,r,o,l,u,d,h,p,m=co){if(m!==co&&m!==_o)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");r===void 0&&m===co&&(r=ds),r===void 0&&m===_o&&(r=mo),super(null,o,l,u,d,h,m,r,p),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=d!==void 0?d:Vn,this.minFilter=h!==void 0?h:Vn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const F0=new bn,T_=new k0(1,1),O0=new C0,B0=new Yy,z0=new N0,A_=[],b_=[],C_=new Float32Array(16),R_=new Float32Array(9),P_=new Float32Array(4);function wo(s,e,t){const r=s[0];if(r<=0||r>0)return s;const o=e*t;let l=A_[o];if(l===void 0&&(l=new Float32Array(o),A_[o]=l),e!==0){r.toArray(l,0);for(let u=1,d=0;u!==e;++u)d+=t,s[u].toArray(l,d)}return l}function en(s,e){if(s.length!==e.length)return!1;for(let t=0,r=s.length;t<r;t++)if(s[t]!==e[t])return!1;return!0}function tn(s,e){for(let t=0,r=e.length;t<r;t++)s[t]=e[t]}function Rc(s,e){let t=b_[e];t===void 0&&(t=new Int32Array(e),b_[e]=t);for(let r=0;r!==e;++r)t[r]=s.allocateTextureUnit();return t}function lM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function cM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;s.uniform2fv(this.addr,e),tn(t,e)}}function uM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(en(t,e))return;s.uniform3fv(this.addr,e),tn(t,e)}}function dM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;s.uniform4fv(this.addr,e),tn(t,e)}}function hM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(en(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),tn(t,e)}else{if(en(t,r))return;P_.set(r),s.uniformMatrix2fv(this.addr,!1,P_),tn(t,r)}}function fM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(en(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),tn(t,e)}else{if(en(t,r))return;R_.set(r),s.uniformMatrix3fv(this.addr,!1,R_),tn(t,r)}}function pM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(en(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),tn(t,e)}else{if(en(t,r))return;C_.set(r),s.uniformMatrix4fv(this.addr,!1,C_),tn(t,r)}}function mM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function _M(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;s.uniform2iv(this.addr,e),tn(t,e)}}function gM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;s.uniform3iv(this.addr,e),tn(t,e)}}function vM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;s.uniform4iv(this.addr,e),tn(t,e)}}function yM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function xM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;s.uniform2uiv(this.addr,e),tn(t,e)}}function SM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;s.uniform3uiv(this.addr,e),tn(t,e)}}function MM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;s.uniform4uiv(this.addr,e),tn(t,e)}}function wM(s,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(s.uniform1i(this.addr,o),r[0]=o);let l;this.type===s.SAMPLER_2D_SHADOW?(T_.compareFunction=T0,l=T_):l=F0,t.setTexture2D(e||l,o)}function EM(s,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(s.uniform1i(this.addr,o),r[0]=o),t.setTexture3D(e||B0,o)}function TM(s,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(s.uniform1i(this.addr,o),r[0]=o),t.setTextureCube(e||z0,o)}function AM(s,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(s.uniform1i(this.addr,o),r[0]=o),t.setTexture2DArray(e||O0,o)}function bM(s){switch(s){case 5126:return lM;case 35664:return cM;case 35665:return uM;case 35666:return dM;case 35674:return hM;case 35675:return fM;case 35676:return pM;case 5124:case 35670:return mM;case 35667:case 35671:return _M;case 35668:case 35672:return gM;case 35669:case 35673:return vM;case 5125:return yM;case 36294:return xM;case 36295:return SM;case 36296:return MM;case 35678:case 36198:case 36298:case 36306:case 35682:return wM;case 35679:case 36299:case 36307:return EM;case 35680:case 36300:case 36308:case 36293:return TM;case 36289:case 36303:case 36311:case 36292:return AM}}function CM(s,e){s.uniform1fv(this.addr,e)}function RM(s,e){const t=wo(e,this.size,2);s.uniform2fv(this.addr,t)}function PM(s,e){const t=wo(e,this.size,3);s.uniform3fv(this.addr,t)}function DM(s,e){const t=wo(e,this.size,4);s.uniform4fv(this.addr,t)}function LM(s,e){const t=wo(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function IM(s,e){const t=wo(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function NM(s,e){const t=wo(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function UM(s,e){s.uniform1iv(this.addr,e)}function kM(s,e){s.uniform2iv(this.addr,e)}function FM(s,e){s.uniform3iv(this.addr,e)}function OM(s,e){s.uniform4iv(this.addr,e)}function BM(s,e){s.uniform1uiv(this.addr,e)}function zM(s,e){s.uniform2uiv(this.addr,e)}function VM(s,e){s.uniform3uiv(this.addr,e)}function HM(s,e){s.uniform4uiv(this.addr,e)}function GM(s,e,t){const r=this.cache,o=e.length,l=Rc(t,o);en(r,l)||(s.uniform1iv(this.addr,l),tn(r,l));for(let u=0;u!==o;++u)t.setTexture2D(e[u]||F0,l[u])}function WM(s,e,t){const r=this.cache,o=e.length,l=Rc(t,o);en(r,l)||(s.uniform1iv(this.addr,l),tn(r,l));for(let u=0;u!==o;++u)t.setTexture3D(e[u]||B0,l[u])}function qM(s,e,t){const r=this.cache,o=e.length,l=Rc(t,o);en(r,l)||(s.uniform1iv(this.addr,l),tn(r,l));for(let u=0;u!==o;++u)t.setTextureCube(e[u]||z0,l[u])}function XM(s,e,t){const r=this.cache,o=e.length,l=Rc(t,o);en(r,l)||(s.uniform1iv(this.addr,l),tn(r,l));for(let u=0;u!==o;++u)t.setTexture2DArray(e[u]||O0,l[u])}function jM(s){switch(s){case 5126:return CM;case 35664:return RM;case 35665:return PM;case 35666:return DM;case 35674:return LM;case 35675:return IM;case 35676:return NM;case 5124:case 35670:return UM;case 35667:case 35671:return kM;case 35668:case 35672:return FM;case 35669:case 35673:return OM;case 5125:return BM;case 36294:return zM;case 36295:return VM;case 36296:return HM;case 35678:case 36198:case 36298:case 36306:case 35682:return GM;case 35679:case 36299:case 36307:return WM;case 35680:case 36300:case 36308:case 36293:return qM;case 36289:case 36303:case 36311:case 36292:return XM}}class YM{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=bM(t.type)}}class KM{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=jM(t.type)}}class $M{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){const o=this.seq;for(let l=0,u=o.length;l!==u;++l){const d=o[l];d.setValue(e,t[d.id],r)}}}const Vd=/(\w+)(\])?(\[|\.)?/g;function D_(s,e){s.seq.push(e),s.map[e.id]=e}function QM(s,e,t){const r=s.name,o=r.length;for(Vd.lastIndex=0;;){const l=Vd.exec(r),u=Vd.lastIndex;let d=l[1];const h=l[2]==="]",p=l[3];if(h&&(d=d|0),p===void 0||p==="["&&u+2===o){D_(t,p===void 0?new YM(d,s,e):new KM(d,s,e));break}else{let g=t.map[d];g===void 0&&(g=new $M(d),D_(t,g)),t=g}}}class gc{constructor(e,t){this.seq=[],this.map={};const r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<r;++o){const l=e.getActiveUniform(t,o),u=e.getUniformLocation(t,l.name);QM(l,u,this)}}setValue(e,t,r,o){const l=this.map[t];l!==void 0&&l.setValue(e,r,o)}setOptional(e,t,r){const o=t[r];o!==void 0&&this.setValue(e,r,o)}static upload(e,t,r,o){for(let l=0,u=t.length;l!==u;++l){const d=t[l],h=r[d.id];h.needsUpdate!==!1&&d.setValue(e,h.value,o)}}static seqWithValue(e,t){const r=[];for(let o=0,l=e.length;o!==l;++o){const u=e[o];u.id in t&&r.push(u)}return r}}function L_(s,e,t){const r=s.createShader(e);return s.shaderSource(r,t),s.compileShader(r),r}const JM=37297;let ZM=0;function ew(s,e){const t=s.split(`
`),r=[],o=Math.max(e-6,0),l=Math.min(e+6,t.length);for(let u=o;u<l;u++){const d=u+1;r.push(`${d===e?">":" "} ${d}: ${t[u]}`)}return r.join(`
`)}function tw(s){const e=Et.getPrimaries(Et.workingColorSpace),t=Et.getPrimaries(s);let r;switch(e===t?r="":e===Sc&&t===xc?r="LinearDisplayP3ToLinearSRGB":e===xc&&t===Sc&&(r="LinearSRGBToLinearDisplayP3"),s){case Or:case Cc:return[r,"LinearTransferOETF"];case yi:case nf:return[r,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",s),[r,"LinearTransferOETF"]}}function I_(s,e,t){const r=s.getShaderParameter(e,s.COMPILE_STATUS),o=s.getShaderInfoLog(e).trim();if(r&&o==="")return"";const l=/ERROR: 0:(\d+)/.exec(o);if(l){const u=parseInt(l[1]);return t.toUpperCase()+`

`+o+`

`+ew(s.getShaderSource(e),u)}else return o}function nw(s,e){const t=tw(e);return`vec4 ${s}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function iw(s,e){let t;switch(e){case c0:t="Linear";break;case u0:t="Reinhard";break;case d0:t="Cineon";break;case Yh:t="ACESFilmic";break;case h0:t="AgX";break;case f0:t="Neutral";break;case dy:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const tc=new N;function rw(){Et.getLuminanceCoefficients(tc);const s=tc.x.toFixed(4),e=tc.y.toFixed(4),t=tc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function sw(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(va).join(`
`)}function ow(s){const e=[];for(const t in s){const r=s[t];r!==!1&&e.push("#define "+t+" "+r)}return e.join(`
`)}function aw(s,e){const t={},r=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let o=0;o<r;o++){const l=s.getActiveAttrib(e,o),u=l.name;let d=1;l.type===s.FLOAT_MAT2&&(d=2),l.type===s.FLOAT_MAT3&&(d=3),l.type===s.FLOAT_MAT4&&(d=4),t[u]={type:l.type,location:s.getAttribLocation(e,u),locationSize:d}}return t}function va(s){return s!==""}function N_(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function U_(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const lw=/^[ \t]*#include +<([\w\d./]+)>/gm;function zh(s){return s.replace(lw,uw)}const cw=new Map;function uw(s,e){let t=lt[e];if(t===void 0){const r=cw.get(e);if(r!==void 0)t=lt[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return zh(t)}const dw=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function k_(s){return s.replace(dw,hw)}function hw(s,e,t,r){let o="";for(let l=parseInt(e);l<parseInt(t);l++)o+=r.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return o}function F_(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function fw(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===o0?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===a0?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Qi&&(e="SHADOWMAP_TYPE_VSM"),e}function pw(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case fo:case po:e="ENVMAP_TYPE_CUBE";break;case bc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function mw(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case po:e="ENVMAP_MODE_REFRACTION";break}return e}function _w(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case l0:e="ENVMAP_BLENDING_MULTIPLY";break;case cy:e="ENVMAP_BLENDING_MIX";break;case uy:e="ENVMAP_BLENDING_ADD";break}return e}function gw(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:r,maxMip:t}}function vw(s,e,t,r){const o=s.getContext(),l=t.defines;let u=t.vertexShader,d=t.fragmentShader;const h=fw(t),p=pw(t),m=mw(t),g=_w(t),v=gw(t),S=sw(t),M=ow(l),E=o.createProgram();let y,x,C=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(y=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(va).join(`
`),y.length>0&&(y+=`
`),x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(va).join(`
`),x.length>0&&(x+=`
`)):(y=[F_(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(va).join(`
`),x=[F_(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+p:"",t.envMap?"#define "+m:"",t.envMap?"#define "+g:"",v?"#define CUBEUV_TEXEL_WIDTH "+v.texelWidth:"",v?"#define CUBEUV_TEXEL_HEIGHT "+v.texelHeight:"",v?"#define CUBEUV_MAX_MIP "+v.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==kr?"#define TONE_MAPPING":"",t.toneMapping!==kr?lt.tonemapping_pars_fragment:"",t.toneMapping!==kr?iw("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,nw("linearToOutputTexel",t.outputColorSpace),rw(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(va).join(`
`)),u=zh(u),u=N_(u,t),u=U_(u,t),d=zh(d),d=N_(d,t),d=U_(d,t),u=k_(u),d=k_(d),t.isRawShaderMaterial!==!0&&(C=`#version 300 es
`,y=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+y,x=["#define varying in",t.glslVersion===e_?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===e_?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+x);const A=C+y+u,D=C+x+d,G=L_(o,o.VERTEX_SHADER,A),k=L_(o,o.FRAGMENT_SHADER,D);o.attachShader(E,G),o.attachShader(E,k),t.index0AttributeName!==void 0?o.bindAttribLocation(E,0,t.index0AttributeName):t.morphTargets===!0&&o.bindAttribLocation(E,0,"position"),o.linkProgram(E);function I(P){if(s.debug.checkShaderErrors){const K=o.getProgramInfoLog(E).trim(),Q=o.getShaderInfoLog(G).trim(),oe=o.getShaderInfoLog(k).trim();let he=!0,ne=!0;if(o.getProgramParameter(E,o.LINK_STATUS)===!1)if(he=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(o,E,G,k);else{const le=I_(o,G,"vertex"),V=I_(o,k,"fragment");console.error("THREE.WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(E,o.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+K+`
`+le+`
`+V)}else K!==""?console.warn("THREE.WebGLProgram: Program Info Log:",K):(Q===""||oe==="")&&(ne=!1);ne&&(P.diagnostics={runnable:he,programLog:K,vertexShader:{log:Q,prefix:y},fragmentShader:{log:oe,prefix:x}})}o.deleteShader(G),o.deleteShader(k),z=new gc(o,E),ae=aw(o,E)}let z;this.getUniforms=function(){return z===void 0&&I(this),z};let ae;this.getAttributes=function(){return ae===void 0&&I(this),ae};let w=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=o.getProgramParameter(E,JM)),w},this.destroy=function(){r.releaseStatesOfProgram(this),o.deleteProgram(E),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=ZM++,this.cacheKey=e,this.usedTimes=1,this.program=E,this.vertexShader=G,this.fragmentShader=k,this}let yw=0;class xw{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,r=e.fragmentShader,o=this._getShaderStage(t),l=this._getShaderStage(r),u=this._getShaderCacheForMaterial(e);return u.has(o)===!1&&(u.add(o),o.usedTimes++),u.has(l)===!1&&(u.add(l),l.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){const t=this.shaderCache;let r=t.get(e);return r===void 0&&(r=new Sw(e),t.set(e,r)),r}}class Sw{constructor(e){this.id=yw++,this.code=e,this.usedTimes=0}}function Mw(s,e,t,r,o,l,u){const d=new of,h=new xw,p=new Set,m=[],g=o.logarithmicDepthBuffer,v=o.reverseDepthBuffer,S=o.vertexTextures;let M=o.precision;const E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(w){return p.add(w),w===0?"uv":`uv${w}`}function x(w,P,K,Q,oe){const he=Q.fog,ne=oe.geometry,le=w.isMeshStandardMaterial?Q.environment:null,V=(w.isMeshStandardMaterial?t:e).get(w.envMap||le),ue=V&&V.mapping===bc?V.image.height:null,se=E[w.type];w.precision!==null&&(M=o.getMaxPrecision(w.precision),M!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",M,"instead."));const F=ne.morphAttributes.position||ne.morphAttributes.normal||ne.morphAttributes.color,ie=F!==void 0?F.length:0;let Fe=0;ne.morphAttributes.position!==void 0&&(Fe=1),ne.morphAttributes.normal!==void 0&&(Fe=2),ne.morphAttributes.color!==void 0&&(Fe=3);let J,ce,ye,Se;if(se){const nn=Pi[se];J=nn.vertexShader,ce=nn.fragmentShader}else J=w.vertexShader,ce=w.fragmentShader,h.update(w),ye=h.getVertexShaderID(w),Se=h.getFragmentShaderID(w);const Pe=s.getRenderTarget(),De=oe.isInstancedMesh===!0,rt=oe.isBatchedMesh===!0,vt=!!w.map,ht=!!w.matcap,B=!!V,hn=!!w.aoMap,dt=!!w.lightMap,mt=!!w.bumpMap,et=!!w.normalMap,Dt=!!w.displacementMap,nt=!!w.emissiveMap,L=!!w.metalnessMap,b=!!w.roughnessMap,$=w.anisotropy>0,fe=w.clearcoat>0,ge=w.dispersion>0,de=w.iridescence>0,Ke=w.sheen>0,Ae=w.transmission>0,Oe=$&&!!w.anisotropyMap,_t=fe&&!!w.clearcoatMap,Me=fe&&!!w.clearcoatNormalMap,Be=fe&&!!w.clearcoatRoughnessMap,st=de&&!!w.iridescenceMap,it=de&&!!w.iridescenceThicknessMap,Ve=Ke&&!!w.sheenColorMap,ft=Ke&&!!w.sheenRoughnessMap,at=!!w.specularMap,bt=!!w.specularColorMap,W=!!w.specularIntensityMap,Le=Ae&&!!w.transmissionMap,re=Ae&&!!w.thicknessMap,pe=!!w.gradientMap,be=!!w.alphaMap,Ue=w.alphaTest>0,pt=!!w.alphaHash,Gt=!!w.extensions;let fn=kr;w.toneMapped&&(Pe===null||Pe.isXRRenderTarget===!0)&&(fn=s.toneMapping);const gt={shaderID:se,shaderType:w.type,shaderName:w.name,vertexShader:J,fragmentShader:ce,defines:w.defines,customVertexShaderID:ye,customFragmentShaderID:Se,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:M,batching:rt,batchingColor:rt&&oe._colorsTexture!==null,instancing:De,instancingColor:De&&oe.instanceColor!==null,instancingMorph:De&&oe.morphTexture!==null,supportsVertexTextures:S,outputColorSpace:Pe===null?s.outputColorSpace:Pe.isXRRenderTarget===!0?Pe.texture.colorSpace:Or,alphaToCoverage:!!w.alphaToCoverage,map:vt,matcap:ht,envMap:B,envMapMode:B&&V.mapping,envMapCubeUVHeight:ue,aoMap:hn,lightMap:dt,bumpMap:mt,normalMap:et,displacementMap:S&&Dt,emissiveMap:nt,normalMapObjectSpace:et&&w.normalMapType===my,normalMapTangentSpace:et&&w.normalMapType===E0,metalnessMap:L,roughnessMap:b,anisotropy:$,anisotropyMap:Oe,clearcoat:fe,clearcoatMap:_t,clearcoatNormalMap:Me,clearcoatRoughnessMap:Be,dispersion:ge,iridescence:de,iridescenceMap:st,iridescenceThicknessMap:it,sheen:Ke,sheenColorMap:Ve,sheenRoughnessMap:ft,specularMap:at,specularColorMap:bt,specularIntensityMap:W,transmission:Ae,transmissionMap:Le,thicknessMap:re,gradientMap:pe,opaque:w.transparent===!1&&w.blending===lo&&w.alphaToCoverage===!1,alphaMap:be,alphaTest:Ue,alphaHash:pt,combine:w.combine,mapUv:vt&&y(w.map.channel),aoMapUv:hn&&y(w.aoMap.channel),lightMapUv:dt&&y(w.lightMap.channel),bumpMapUv:mt&&y(w.bumpMap.channel),normalMapUv:et&&y(w.normalMap.channel),displacementMapUv:Dt&&y(w.displacementMap.channel),emissiveMapUv:nt&&y(w.emissiveMap.channel),metalnessMapUv:L&&y(w.metalnessMap.channel),roughnessMapUv:b&&y(w.roughnessMap.channel),anisotropyMapUv:Oe&&y(w.anisotropyMap.channel),clearcoatMapUv:_t&&y(w.clearcoatMap.channel),clearcoatNormalMapUv:Me&&y(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Be&&y(w.clearcoatRoughnessMap.channel),iridescenceMapUv:st&&y(w.iridescenceMap.channel),iridescenceThicknessMapUv:it&&y(w.iridescenceThicknessMap.channel),sheenColorMapUv:Ve&&y(w.sheenColorMap.channel),sheenRoughnessMapUv:ft&&y(w.sheenRoughnessMap.channel),specularMapUv:at&&y(w.specularMap.channel),specularColorMapUv:bt&&y(w.specularColorMap.channel),specularIntensityMapUv:W&&y(w.specularIntensityMap.channel),transmissionMapUv:Le&&y(w.transmissionMap.channel),thicknessMapUv:re&&y(w.thicknessMap.channel),alphaMapUv:be&&y(w.alphaMap.channel),vertexTangents:!!ne.attributes.tangent&&(et||$),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!ne.attributes.color&&ne.attributes.color.itemSize===4,pointsUvs:oe.isPoints===!0&&!!ne.attributes.uv&&(vt||be),fog:!!he,useFog:w.fog===!0,fogExp2:!!he&&he.isFogExp2,flatShading:w.flatShading===!0,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:g,reverseDepthBuffer:v,skinning:oe.isSkinnedMesh===!0,morphTargets:ne.morphAttributes.position!==void 0,morphNormals:ne.morphAttributes.normal!==void 0,morphColors:ne.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:Fe,numDirLights:P.directional.length,numPointLights:P.point.length,numSpotLights:P.spot.length,numSpotLightMaps:P.spotLightMap.length,numRectAreaLights:P.rectArea.length,numHemiLights:P.hemi.length,numDirLightShadows:P.directionalShadowMap.length,numPointLightShadows:P.pointShadowMap.length,numSpotLightShadows:P.spotShadowMap.length,numSpotLightShadowsWithMaps:P.numSpotLightShadowsWithMaps,numLightProbes:P.numLightProbes,numClippingPlanes:u.numPlanes,numClipIntersection:u.numIntersection,dithering:w.dithering,shadowMapEnabled:s.shadowMap.enabled&&K.length>0,shadowMapType:s.shadowMap.type,toneMapping:fn,decodeVideoTexture:vt&&w.map.isVideoTexture===!0&&Et.getTransfer(w.map.colorSpace)===Ft,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===Di,flipSided:w.side===Nn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:Gt&&w.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Gt&&w.extensions.multiDraw===!0||rt)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return gt.vertexUv1s=p.has(1),gt.vertexUv2s=p.has(2),gt.vertexUv3s=p.has(3),p.clear(),gt}function C(w){const P=[];if(w.shaderID?P.push(w.shaderID):(P.push(w.customVertexShaderID),P.push(w.customFragmentShaderID)),w.defines!==void 0)for(const K in w.defines)P.push(K),P.push(w.defines[K]);return w.isRawShaderMaterial===!1&&(A(P,w),D(P,w),P.push(s.outputColorSpace)),P.push(w.customProgramCacheKey),P.join()}function A(w,P){w.push(P.precision),w.push(P.outputColorSpace),w.push(P.envMapMode),w.push(P.envMapCubeUVHeight),w.push(P.mapUv),w.push(P.alphaMapUv),w.push(P.lightMapUv),w.push(P.aoMapUv),w.push(P.bumpMapUv),w.push(P.normalMapUv),w.push(P.displacementMapUv),w.push(P.emissiveMapUv),w.push(P.metalnessMapUv),w.push(P.roughnessMapUv),w.push(P.anisotropyMapUv),w.push(P.clearcoatMapUv),w.push(P.clearcoatNormalMapUv),w.push(P.clearcoatRoughnessMapUv),w.push(P.iridescenceMapUv),w.push(P.iridescenceThicknessMapUv),w.push(P.sheenColorMapUv),w.push(P.sheenRoughnessMapUv),w.push(P.specularMapUv),w.push(P.specularColorMapUv),w.push(P.specularIntensityMapUv),w.push(P.transmissionMapUv),w.push(P.thicknessMapUv),w.push(P.combine),w.push(P.fogExp2),w.push(P.sizeAttenuation),w.push(P.morphTargetsCount),w.push(P.morphAttributeCount),w.push(P.numDirLights),w.push(P.numPointLights),w.push(P.numSpotLights),w.push(P.numSpotLightMaps),w.push(P.numHemiLights),w.push(P.numRectAreaLights),w.push(P.numDirLightShadows),w.push(P.numPointLightShadows),w.push(P.numSpotLightShadows),w.push(P.numSpotLightShadowsWithMaps),w.push(P.numLightProbes),w.push(P.shadowMapType),w.push(P.toneMapping),w.push(P.numClippingPlanes),w.push(P.numClipIntersection),w.push(P.depthPacking)}function D(w,P){d.disableAll(),P.supportsVertexTextures&&d.enable(0),P.instancing&&d.enable(1),P.instancingColor&&d.enable(2),P.instancingMorph&&d.enable(3),P.matcap&&d.enable(4),P.envMap&&d.enable(5),P.normalMapObjectSpace&&d.enable(6),P.normalMapTangentSpace&&d.enable(7),P.clearcoat&&d.enable(8),P.iridescence&&d.enable(9),P.alphaTest&&d.enable(10),P.vertexColors&&d.enable(11),P.vertexAlphas&&d.enable(12),P.vertexUv1s&&d.enable(13),P.vertexUv2s&&d.enable(14),P.vertexUv3s&&d.enable(15),P.vertexTangents&&d.enable(16),P.anisotropy&&d.enable(17),P.alphaHash&&d.enable(18),P.batching&&d.enable(19),P.dispersion&&d.enable(20),P.batchingColor&&d.enable(21),w.push(d.mask),d.disableAll(),P.fog&&d.enable(0),P.useFog&&d.enable(1),P.flatShading&&d.enable(2),P.logarithmicDepthBuffer&&d.enable(3),P.reverseDepthBuffer&&d.enable(4),P.skinning&&d.enable(5),P.morphTargets&&d.enable(6),P.morphNormals&&d.enable(7),P.morphColors&&d.enable(8),P.premultipliedAlpha&&d.enable(9),P.shadowMapEnabled&&d.enable(10),P.doubleSided&&d.enable(11),P.flipSided&&d.enable(12),P.useDepthPacking&&d.enable(13),P.dithering&&d.enable(14),P.transmission&&d.enable(15),P.sheen&&d.enable(16),P.opaque&&d.enable(17),P.pointsUvs&&d.enable(18),P.decodeVideoTexture&&d.enable(19),P.alphaToCoverage&&d.enable(20),w.push(d.mask)}function G(w){const P=E[w.type];let K;if(P){const Q=Pi[P];K=Ta.clone(Q.uniforms)}else K=w.uniforms;return K}function k(w,P){let K;for(let Q=0,oe=m.length;Q<oe;Q++){const he=m[Q];if(he.cacheKey===P){K=he,++K.usedTimes;break}}return K===void 0&&(K=new vw(s,P,w,l),m.push(K)),K}function I(w){if(--w.usedTimes===0){const P=m.indexOf(w);m[P]=m[m.length-1],m.pop(),w.destroy()}}function z(w){h.remove(w)}function ae(){h.dispose()}return{getParameters:x,getProgramCacheKey:C,getUniforms:G,acquireProgram:k,releaseProgram:I,releaseShaderCache:z,programs:m,dispose:ae}}function ww(){let s=new WeakMap;function e(u){return s.has(u)}function t(u){let d=s.get(u);return d===void 0&&(d={},s.set(u,d)),d}function r(u){s.delete(u)}function o(u,d,h){s.get(u)[d]=h}function l(){s=new WeakMap}return{has:e,get:t,remove:r,update:o,dispose:l}}function Ew(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function O_(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function B_(){const s=[];let e=0;const t=[],r=[],o=[];function l(){e=0,t.length=0,r.length=0,o.length=0}function u(g,v,S,M,E,y){let x=s[e];return x===void 0?(x={id:g.id,object:g,geometry:v,material:S,groupOrder:M,renderOrder:g.renderOrder,z:E,group:y},s[e]=x):(x.id=g.id,x.object=g,x.geometry=v,x.material=S,x.groupOrder=M,x.renderOrder=g.renderOrder,x.z=E,x.group=y),e++,x}function d(g,v,S,M,E,y){const x=u(g,v,S,M,E,y);S.transmission>0?r.push(x):S.transparent===!0?o.push(x):t.push(x)}function h(g,v,S,M,E,y){const x=u(g,v,S,M,E,y);S.transmission>0?r.unshift(x):S.transparent===!0?o.unshift(x):t.unshift(x)}function p(g,v){t.length>1&&t.sort(g||Ew),r.length>1&&r.sort(v||O_),o.length>1&&o.sort(v||O_)}function m(){for(let g=e,v=s.length;g<v;g++){const S=s[g];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:t,transmissive:r,transparent:o,init:l,push:d,unshift:h,finish:m,sort:p}}function Tw(){let s=new WeakMap;function e(r,o){const l=s.get(r);let u;return l===void 0?(u=new B_,s.set(r,[u])):o>=l.length?(u=new B_,l.push(u)):u=l[o],u}function t(){s=new WeakMap}return{get:e,dispose:t}}function Aw(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new N,color:new Ze};break;case"SpotLight":t={position:new N,direction:new N,color:new Ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new Ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new Ze,groundColor:new Ze};break;case"RectAreaLight":t={color:new Ze,position:new N,halfWidth:new N,halfHeight:new N};break}return s[e.id]=t,t}}}function bw(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let Cw=0;function Rw(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function Pw(s){const e=new Aw,t=bw(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let p=0;p<9;p++)r.probe.push(new N);const o=new N,l=new Ct,u=new Ct;function d(p){let m=0,g=0,v=0;for(let ae=0;ae<9;ae++)r.probe[ae].set(0,0,0);let S=0,M=0,E=0,y=0,x=0,C=0,A=0,D=0,G=0,k=0,I=0;p.sort(Rw);for(let ae=0,w=p.length;ae<w;ae++){const P=p[ae],K=P.color,Q=P.intensity,oe=P.distance,he=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)m+=K.r*Q,g+=K.g*Q,v+=K.b*Q;else if(P.isLightProbe){for(let ne=0;ne<9;ne++)r.probe[ne].addScaledVector(P.sh.coefficients[ne],Q);I++}else if(P.isDirectionalLight){const ne=e.get(P);if(ne.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const le=P.shadow,V=t.get(P);V.shadowIntensity=le.intensity,V.shadowBias=le.bias,V.shadowNormalBias=le.normalBias,V.shadowRadius=le.radius,V.shadowMapSize=le.mapSize,r.directionalShadow[S]=V,r.directionalShadowMap[S]=he,r.directionalShadowMatrix[S]=P.shadow.matrix,C++}r.directional[S]=ne,S++}else if(P.isSpotLight){const ne=e.get(P);ne.position.setFromMatrixPosition(P.matrixWorld),ne.color.copy(K).multiplyScalar(Q),ne.distance=oe,ne.coneCos=Math.cos(P.angle),ne.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),ne.decay=P.decay,r.spot[E]=ne;const le=P.shadow;if(P.map&&(r.spotLightMap[G]=P.map,G++,le.updateMatrices(P),P.castShadow&&k++),r.spotLightMatrix[E]=le.matrix,P.castShadow){const V=t.get(P);V.shadowIntensity=le.intensity,V.shadowBias=le.bias,V.shadowNormalBias=le.normalBias,V.shadowRadius=le.radius,V.shadowMapSize=le.mapSize,r.spotShadow[E]=V,r.spotShadowMap[E]=he,D++}E++}else if(P.isRectAreaLight){const ne=e.get(P);ne.color.copy(K).multiplyScalar(Q),ne.halfWidth.set(P.width*.5,0,0),ne.halfHeight.set(0,P.height*.5,0),r.rectArea[y]=ne,y++}else if(P.isPointLight){const ne=e.get(P);if(ne.color.copy(P.color).multiplyScalar(P.intensity),ne.distance=P.distance,ne.decay=P.decay,P.castShadow){const le=P.shadow,V=t.get(P);V.shadowIntensity=le.intensity,V.shadowBias=le.bias,V.shadowNormalBias=le.normalBias,V.shadowRadius=le.radius,V.shadowMapSize=le.mapSize,V.shadowCameraNear=le.camera.near,V.shadowCameraFar=le.camera.far,r.pointShadow[M]=V,r.pointShadowMap[M]=he,r.pointShadowMatrix[M]=P.shadow.matrix,A++}r.point[M]=ne,M++}else if(P.isHemisphereLight){const ne=e.get(P);ne.skyColor.copy(P.color).multiplyScalar(Q),ne.groundColor.copy(P.groundColor).multiplyScalar(Q),r.hemi[x]=ne,x++}}y>0&&(s.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Ce.LTC_FLOAT_1,r.rectAreaLTC2=Ce.LTC_FLOAT_2):(r.rectAreaLTC1=Ce.LTC_HALF_1,r.rectAreaLTC2=Ce.LTC_HALF_2)),r.ambient[0]=m,r.ambient[1]=g,r.ambient[2]=v;const z=r.hash;(z.directionalLength!==S||z.pointLength!==M||z.spotLength!==E||z.rectAreaLength!==y||z.hemiLength!==x||z.numDirectionalShadows!==C||z.numPointShadows!==A||z.numSpotShadows!==D||z.numSpotMaps!==G||z.numLightProbes!==I)&&(r.directional.length=S,r.spot.length=E,r.rectArea.length=y,r.point.length=M,r.hemi.length=x,r.directionalShadow.length=C,r.directionalShadowMap.length=C,r.pointShadow.length=A,r.pointShadowMap.length=A,r.spotShadow.length=D,r.spotShadowMap.length=D,r.directionalShadowMatrix.length=C,r.pointShadowMatrix.length=A,r.spotLightMatrix.length=D+G-k,r.spotLightMap.length=G,r.numSpotLightShadowsWithMaps=k,r.numLightProbes=I,z.directionalLength=S,z.pointLength=M,z.spotLength=E,z.rectAreaLength=y,z.hemiLength=x,z.numDirectionalShadows=C,z.numPointShadows=A,z.numSpotShadows=D,z.numSpotMaps=G,z.numLightProbes=I,r.version=Cw++)}function h(p,m){let g=0,v=0,S=0,M=0,E=0;const y=m.matrixWorldInverse;for(let x=0,C=p.length;x<C;x++){const A=p[x];if(A.isDirectionalLight){const D=r.directional[g];D.direction.setFromMatrixPosition(A.matrixWorld),o.setFromMatrixPosition(A.target.matrixWorld),D.direction.sub(o),D.direction.transformDirection(y),g++}else if(A.isSpotLight){const D=r.spot[S];D.position.setFromMatrixPosition(A.matrixWorld),D.position.applyMatrix4(y),D.direction.setFromMatrixPosition(A.matrixWorld),o.setFromMatrixPosition(A.target.matrixWorld),D.direction.sub(o),D.direction.transformDirection(y),S++}else if(A.isRectAreaLight){const D=r.rectArea[M];D.position.setFromMatrixPosition(A.matrixWorld),D.position.applyMatrix4(y),u.identity(),l.copy(A.matrixWorld),l.premultiply(y),u.extractRotation(l),D.halfWidth.set(A.width*.5,0,0),D.halfHeight.set(0,A.height*.5,0),D.halfWidth.applyMatrix4(u),D.halfHeight.applyMatrix4(u),M++}else if(A.isPointLight){const D=r.point[v];D.position.setFromMatrixPosition(A.matrixWorld),D.position.applyMatrix4(y),v++}else if(A.isHemisphereLight){const D=r.hemi[E];D.direction.setFromMatrixPosition(A.matrixWorld),D.direction.transformDirection(y),E++}}}return{setup:d,setupView:h,state:r}}function z_(s){const e=new Pw(s),t=[],r=[];function o(m){p.camera=m,t.length=0,r.length=0}function l(m){t.push(m)}function u(m){r.push(m)}function d(){e.setup(t)}function h(m){e.setupView(t,m)}const p={lightsArray:t,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:o,state:p,setupLights:d,setupLightsView:h,pushLight:l,pushShadow:u}}function Dw(s){let e=new WeakMap;function t(o,l=0){const u=e.get(o);let d;return u===void 0?(d=new z_(s),e.set(o,[d])):l>=u.length?(d=new z_(s),u.push(d)):d=u[l],d}function r(){e=new WeakMap}return{get:t,dispose:r}}class Lw extends fs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=fy,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Iw extends fs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Nw=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Uw=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function kw(s,e,t){let r=new af;const o=new Re,l=new Re,u=new It,d=new Lw({depthPacking:py}),h=new Iw,p={},m=t.maxTextureSize,g={[Fr]:Nn,[Nn]:Fr,[Di]:Di},v=new In({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Re},radius:{value:4}},vertexShader:Nw,fragmentShader:Uw}),S=v.clone();S.defines.HORIZONTAL_PASS=1;const M=new vn;M.setAttribute("position",new li(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const E=new Ne(M,v),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=o0;let x=this.type;this.render=function(k,I,z){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||k.length===0)return;const ae=s.getRenderTarget(),w=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),K=s.state;K.setBlending(tr),K.buffers.color.setClear(1,1,1,1),K.buffers.depth.setTest(!0),K.setScissorTest(!1);const Q=x!==Qi&&this.type===Qi,oe=x===Qi&&this.type!==Qi;for(let he=0,ne=k.length;he<ne;he++){const le=k[he],V=le.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",le,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;o.copy(V.mapSize);const ue=V.getFrameExtents();if(o.multiply(ue),l.copy(V.mapSize),(o.x>m||o.y>m)&&(o.x>m&&(l.x=Math.floor(m/ue.x),o.x=l.x*ue.x,V.mapSize.x=l.x),o.y>m&&(l.y=Math.floor(m/ue.y),o.y=l.y*ue.y,V.mapSize.y=l.y)),V.map===null||Q===!0||oe===!0){const F=this.type!==Qi?{minFilter:Vn,magFilter:Vn}:{};V.map!==null&&V.map.dispose(),V.map=new Ei(o.x,o.y,F),V.map.texture.name=le.name+".shadowMap",V.camera.updateProjectionMatrix()}s.setRenderTarget(V.map),s.clear();const se=V.getViewportCount();for(let F=0;F<se;F++){const ie=V.getViewport(F);u.set(l.x*ie.x,l.y*ie.y,l.x*ie.z,l.y*ie.w),K.viewport(u),V.updateMatrices(le,F),r=V.getFrustum(),D(I,z,V.camera,le,this.type)}V.isPointLightShadow!==!0&&this.type===Qi&&C(V,z),V.needsUpdate=!1}x=this.type,y.needsUpdate=!1,s.setRenderTarget(ae,w,P)};function C(k,I){const z=e.update(E);v.defines.VSM_SAMPLES!==k.blurSamples&&(v.defines.VSM_SAMPLES=k.blurSamples,S.defines.VSM_SAMPLES=k.blurSamples,v.needsUpdate=!0,S.needsUpdate=!0),k.mapPass===null&&(k.mapPass=new Ei(o.x,o.y)),v.uniforms.shadow_pass.value=k.map.texture,v.uniforms.resolution.value=k.mapSize,v.uniforms.radius.value=k.radius,s.setRenderTarget(k.mapPass),s.clear(),s.renderBufferDirect(I,null,z,v,E,null),S.uniforms.shadow_pass.value=k.mapPass.texture,S.uniforms.resolution.value=k.mapSize,S.uniforms.radius.value=k.radius,s.setRenderTarget(k.map),s.clear(),s.renderBufferDirect(I,null,z,S,E,null)}function A(k,I,z,ae){let w=null;const P=z.isPointLight===!0?k.customDistanceMaterial:k.customDepthMaterial;if(P!==void 0)w=P;else if(w=z.isPointLight===!0?h:d,s.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0){const K=w.uuid,Q=I.uuid;let oe=p[K];oe===void 0&&(oe={},p[K]=oe);let he=oe[Q];he===void 0&&(he=w.clone(),oe[Q]=he,I.addEventListener("dispose",G)),w=he}if(w.visible=I.visible,w.wireframe=I.wireframe,ae===Qi?w.side=I.shadowSide!==null?I.shadowSide:I.side:w.side=I.shadowSide!==null?I.shadowSide:g[I.side],w.alphaMap=I.alphaMap,w.alphaTest=I.alphaTest,w.map=I.map,w.clipShadows=I.clipShadows,w.clippingPlanes=I.clippingPlanes,w.clipIntersection=I.clipIntersection,w.displacementMap=I.displacementMap,w.displacementScale=I.displacementScale,w.displacementBias=I.displacementBias,w.wireframeLinewidth=I.wireframeLinewidth,w.linewidth=I.linewidth,z.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const K=s.properties.get(w);K.light=z}return w}function D(k,I,z,ae,w){if(k.visible===!1)return;if(k.layers.test(I.layers)&&(k.isMesh||k.isLine||k.isPoints)&&(k.castShadow||k.receiveShadow&&w===Qi)&&(!k.frustumCulled||r.intersectsObject(k))){k.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,k.matrixWorld);const Q=e.update(k),oe=k.material;if(Array.isArray(oe)){const he=Q.groups;for(let ne=0,le=he.length;ne<le;ne++){const V=he[ne],ue=oe[V.materialIndex];if(ue&&ue.visible){const se=A(k,ue,ae,w);k.onBeforeShadow(s,k,I,z,Q,se,V),s.renderBufferDirect(z,null,Q,se,k,V),k.onAfterShadow(s,k,I,z,Q,se,V)}}}else if(oe.visible){const he=A(k,oe,ae,w);k.onBeforeShadow(s,k,I,z,Q,he,null),s.renderBufferDirect(z,null,Q,he,k,null),k.onAfterShadow(s,k,I,z,Q,he,null)}}const K=k.children;for(let Q=0,oe=K.length;Q<oe;Q++)D(K[Q],I,z,ae,w)}function G(k){k.target.removeEventListener("dispose",G);for(const z in p){const ae=p[z],w=k.target.uuid;w in ae&&(ae[w].dispose(),delete ae[w])}}}const Fw={[th]:nh,[ih]:oh,[rh]:ah,[ho]:sh,[nh]:th,[oh]:ih,[ah]:rh,[sh]:ho};function Ow(s){function e(){let W=!1;const Le=new It;let re=null;const pe=new It(0,0,0,0);return{setMask:function(be){re!==be&&!W&&(s.colorMask(be,be,be,be),re=be)},setLocked:function(be){W=be},setClear:function(be,Ue,pt,Gt,fn){fn===!0&&(be*=Gt,Ue*=Gt,pt*=Gt),Le.set(be,Ue,pt,Gt),pe.equals(Le)===!1&&(s.clearColor(be,Ue,pt,Gt),pe.copy(Le))},reset:function(){W=!1,re=null,pe.set(-1,0,0,0)}}}function t(){let W=!1,Le=!1,re=null,pe=null,be=null;return{setReversed:function(Ue){Le=Ue},setTest:function(Ue){Ue?ye(s.DEPTH_TEST):Se(s.DEPTH_TEST)},setMask:function(Ue){re!==Ue&&!W&&(s.depthMask(Ue),re=Ue)},setFunc:function(Ue){if(Le&&(Ue=Fw[Ue]),pe!==Ue){switch(Ue){case th:s.depthFunc(s.NEVER);break;case nh:s.depthFunc(s.ALWAYS);break;case ih:s.depthFunc(s.LESS);break;case ho:s.depthFunc(s.LEQUAL);break;case rh:s.depthFunc(s.EQUAL);break;case sh:s.depthFunc(s.GEQUAL);break;case oh:s.depthFunc(s.GREATER);break;case ah:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}pe=Ue}},setLocked:function(Ue){W=Ue},setClear:function(Ue){be!==Ue&&(s.clearDepth(Ue),be=Ue)},reset:function(){W=!1,re=null,pe=null,be=null}}}function r(){let W=!1,Le=null,re=null,pe=null,be=null,Ue=null,pt=null,Gt=null,fn=null;return{setTest:function(gt){W||(gt?ye(s.STENCIL_TEST):Se(s.STENCIL_TEST))},setMask:function(gt){Le!==gt&&!W&&(s.stencilMask(gt),Le=gt)},setFunc:function(gt,nn,Qn){(re!==gt||pe!==nn||be!==Qn)&&(s.stencilFunc(gt,nn,Qn),re=gt,pe=nn,be=Qn)},setOp:function(gt,nn,Qn){(Ue!==gt||pt!==nn||Gt!==Qn)&&(s.stencilOp(gt,nn,Qn),Ue=gt,pt=nn,Gt=Qn)},setLocked:function(gt){W=gt},setClear:function(gt){fn!==gt&&(s.clearStencil(gt),fn=gt)},reset:function(){W=!1,Le=null,re=null,pe=null,be=null,Ue=null,pt=null,Gt=null,fn=null}}}const o=new e,l=new t,u=new r,d=new WeakMap,h=new WeakMap;let p={},m={},g=new WeakMap,v=[],S=null,M=!1,E=null,y=null,x=null,C=null,A=null,D=null,G=null,k=new Ze(0,0,0),I=0,z=!1,ae=null,w=null,P=null,K=null,Q=null;const oe=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let he=!1,ne=0;const le=s.getParameter(s.VERSION);le.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(le)[1]),he=ne>=1):le.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(le)[1]),he=ne>=2);let V=null,ue={};const se=s.getParameter(s.SCISSOR_BOX),F=s.getParameter(s.VIEWPORT),ie=new It().fromArray(se),Fe=new It().fromArray(F);function J(W,Le,re,pe){const be=new Uint8Array(4),Ue=s.createTexture();s.bindTexture(W,Ue),s.texParameteri(W,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(W,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let pt=0;pt<re;pt++)W===s.TEXTURE_3D||W===s.TEXTURE_2D_ARRAY?s.texImage3D(Le,0,s.RGBA,1,1,pe,0,s.RGBA,s.UNSIGNED_BYTE,be):s.texImage2D(Le+pt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,be);return Ue}const ce={};ce[s.TEXTURE_2D]=J(s.TEXTURE_2D,s.TEXTURE_2D,1),ce[s.TEXTURE_CUBE_MAP]=J(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[s.TEXTURE_2D_ARRAY]=J(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),ce[s.TEXTURE_3D]=J(s.TEXTURE_3D,s.TEXTURE_3D,1,1),o.setClear(0,0,0,1),l.setClear(1),u.setClear(0),ye(s.DEPTH_TEST),l.setFunc(ho),dt(!1),mt($m),ye(s.CULL_FACE),B(tr);function ye(W){p[W]!==!0&&(s.enable(W),p[W]=!0)}function Se(W){p[W]!==!1&&(s.disable(W),p[W]=!1)}function Pe(W,Le){return m[W]!==Le?(s.bindFramebuffer(W,Le),m[W]=Le,W===s.DRAW_FRAMEBUFFER&&(m[s.FRAMEBUFFER]=Le),W===s.FRAMEBUFFER&&(m[s.DRAW_FRAMEBUFFER]=Le),!0):!1}function De(W,Le){let re=v,pe=!1;if(W){re=g.get(Le),re===void 0&&(re=[],g.set(Le,re));const be=W.textures;if(re.length!==be.length||re[0]!==s.COLOR_ATTACHMENT0){for(let Ue=0,pt=be.length;Ue<pt;Ue++)re[Ue]=s.COLOR_ATTACHMENT0+Ue;re.length=be.length,pe=!0}}else re[0]!==s.BACK&&(re[0]=s.BACK,pe=!0);pe&&s.drawBuffers(re)}function rt(W){return S!==W?(s.useProgram(W),S=W,!0):!1}const vt={[as]:s.FUNC_ADD,[Xv]:s.FUNC_SUBTRACT,[jv]:s.FUNC_REVERSE_SUBTRACT};vt[Yv]=s.MIN,vt[Kv]=s.MAX;const ht={[$v]:s.ZERO,[Qv]:s.ONE,[Jv]:s.SRC_COLOR,[Zd]:s.SRC_ALPHA,[ry]:s.SRC_ALPHA_SATURATE,[ny]:s.DST_COLOR,[ey]:s.DST_ALPHA,[Zv]:s.ONE_MINUS_SRC_COLOR,[eh]:s.ONE_MINUS_SRC_ALPHA,[iy]:s.ONE_MINUS_DST_COLOR,[ty]:s.ONE_MINUS_DST_ALPHA,[sy]:s.CONSTANT_COLOR,[oy]:s.ONE_MINUS_CONSTANT_COLOR,[ay]:s.CONSTANT_ALPHA,[ly]:s.ONE_MINUS_CONSTANT_ALPHA};function B(W,Le,re,pe,be,Ue,pt,Gt,fn,gt){if(W===tr){M===!0&&(Se(s.BLEND),M=!1);return}if(M===!1&&(ye(s.BLEND),M=!0),W!==qv){if(W!==E||gt!==z){if((y!==as||A!==as)&&(s.blendEquation(s.FUNC_ADD),y=as,A=as),gt)switch(W){case lo:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Jd:s.blendFunc(s.ONE,s.ONE);break;case Qm:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Jm:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",W);break}else switch(W){case lo:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Jd:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Qm:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Jm:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",W);break}x=null,C=null,D=null,G=null,k.set(0,0,0),I=0,E=W,z=gt}return}be=be||Le,Ue=Ue||re,pt=pt||pe,(Le!==y||be!==A)&&(s.blendEquationSeparate(vt[Le],vt[be]),y=Le,A=be),(re!==x||pe!==C||Ue!==D||pt!==G)&&(s.blendFuncSeparate(ht[re],ht[pe],ht[Ue],ht[pt]),x=re,C=pe,D=Ue,G=pt),(Gt.equals(k)===!1||fn!==I)&&(s.blendColor(Gt.r,Gt.g,Gt.b,fn),k.copy(Gt),I=fn),E=W,z=!1}function hn(W,Le){W.side===Di?Se(s.CULL_FACE):ye(s.CULL_FACE);let re=W.side===Nn;Le&&(re=!re),dt(re),W.blending===lo&&W.transparent===!1?B(tr):B(W.blending,W.blendEquation,W.blendSrc,W.blendDst,W.blendEquationAlpha,W.blendSrcAlpha,W.blendDstAlpha,W.blendColor,W.blendAlpha,W.premultipliedAlpha),l.setFunc(W.depthFunc),l.setTest(W.depthTest),l.setMask(W.depthWrite),o.setMask(W.colorWrite);const pe=W.stencilWrite;u.setTest(pe),pe&&(u.setMask(W.stencilWriteMask),u.setFunc(W.stencilFunc,W.stencilRef,W.stencilFuncMask),u.setOp(W.stencilFail,W.stencilZFail,W.stencilZPass)),Dt(W.polygonOffset,W.polygonOffsetFactor,W.polygonOffsetUnits),W.alphaToCoverage===!0?ye(s.SAMPLE_ALPHA_TO_COVERAGE):Se(s.SAMPLE_ALPHA_TO_COVERAGE)}function dt(W){ae!==W&&(W?s.frontFace(s.CW):s.frontFace(s.CCW),ae=W)}function mt(W){W!==Gv?(ye(s.CULL_FACE),W!==w&&(W===$m?s.cullFace(s.BACK):W===Wv?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Se(s.CULL_FACE),w=W}function et(W){W!==P&&(he&&s.lineWidth(W),P=W)}function Dt(W,Le,re){W?(ye(s.POLYGON_OFFSET_FILL),(K!==Le||Q!==re)&&(s.polygonOffset(Le,re),K=Le,Q=re)):Se(s.POLYGON_OFFSET_FILL)}function nt(W){W?ye(s.SCISSOR_TEST):Se(s.SCISSOR_TEST)}function L(W){W===void 0&&(W=s.TEXTURE0+oe-1),V!==W&&(s.activeTexture(W),V=W)}function b(W,Le,re){re===void 0&&(V===null?re=s.TEXTURE0+oe-1:re=V);let pe=ue[re];pe===void 0&&(pe={type:void 0,texture:void 0},ue[re]=pe),(pe.type!==W||pe.texture!==Le)&&(V!==re&&(s.activeTexture(re),V=re),s.bindTexture(W,Le||ce[W]),pe.type=W,pe.texture=Le)}function $(){const W=ue[V];W!==void 0&&W.type!==void 0&&(s.bindTexture(W.type,null),W.type=void 0,W.texture=void 0)}function fe(){try{s.compressedTexImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function ge(){try{s.compressedTexImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function de(){try{s.texSubImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ke(){try{s.texSubImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ae(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Oe(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function _t(){try{s.texStorage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Me(){try{s.texStorage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Be(){try{s.texImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function st(){try{s.texImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function it(W){ie.equals(W)===!1&&(s.scissor(W.x,W.y,W.z,W.w),ie.copy(W))}function Ve(W){Fe.equals(W)===!1&&(s.viewport(W.x,W.y,W.z,W.w),Fe.copy(W))}function ft(W,Le){let re=h.get(Le);re===void 0&&(re=new WeakMap,h.set(Le,re));let pe=re.get(W);pe===void 0&&(pe=s.getUniformBlockIndex(Le,W.name),re.set(W,pe))}function at(W,Le){const pe=h.get(Le).get(W);d.get(Le)!==pe&&(s.uniformBlockBinding(Le,pe,W.__bindingPointIndex),d.set(Le,pe))}function bt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),p={},V=null,ue={},m={},g=new WeakMap,v=[],S=null,M=!1,E=null,y=null,x=null,C=null,A=null,D=null,G=null,k=new Ze(0,0,0),I=0,z=!1,ae=null,w=null,P=null,K=null,Q=null,ie.set(0,0,s.canvas.width,s.canvas.height),Fe.set(0,0,s.canvas.width,s.canvas.height),o.reset(),l.reset(),u.reset()}return{buffers:{color:o,depth:l,stencil:u},enable:ye,disable:Se,bindFramebuffer:Pe,drawBuffers:De,useProgram:rt,setBlending:B,setMaterial:hn,setFlipSided:dt,setCullFace:mt,setLineWidth:et,setPolygonOffset:Dt,setScissorTest:nt,activeTexture:L,bindTexture:b,unbindTexture:$,compressedTexImage2D:fe,compressedTexImage3D:ge,texImage2D:Be,texImage3D:st,updateUBOMapping:ft,uniformBlockBinding:at,texStorage2D:_t,texStorage3D:Me,texSubImage2D:de,texSubImage3D:Ke,compressedTexSubImage2D:Ae,compressedTexSubImage3D:Oe,scissor:it,viewport:Ve,reset:bt}}function V_(s,e,t,r){const o=Bw(r);switch(t){case v0:return s*e;case x0:return s*e;case S0:return s*e*2;case Jh:return s*e/o.components*o.byteLength;case Zh:return s*e/o.components*o.byteLength;case M0:return s*e*2/o.components*o.byteLength;case ef:return s*e*2/o.components*o.byteLength;case y0:return s*e*3/o.components*o.byteLength;case wi:return s*e*4/o.components*o.byteLength;case tf:return s*e*4/o.components*o.byteLength;case dc:case hc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case fc:case pc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case fh:case mh:return Math.max(s,16)*Math.max(e,8)/4;case hh:case ph:return Math.max(s,8)*Math.max(e,8)/2;case _h:case gh:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case vh:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case yh:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case xh:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Sh:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Mh:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case wh:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Eh:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Th:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Ah:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case bh:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Ch:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Rh:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Ph:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Dh:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Lh:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case mc:case Ih:case Nh:return Math.ceil(s/4)*Math.ceil(e/4)*16;case w0:case Uh:return Math.ceil(s/4)*Math.ceil(e/4)*8;case kh:case Fh:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Bw(s){switch(s){case rr:case m0:return{byteLength:1,components:1};case wa:case _0:case nr:return{byteLength:2,components:1};case $h:case Qh:return{byteLength:2,components:4};case ds:case Kh:case Li:return{byteLength:4,components:1};case g0:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function zw(s,e,t,r,o,l,u){const d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),p=new Re,m=new WeakMap;let g;const v=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(L,b){return S?new OffscreenCanvas(L,b):wc("canvas")}function E(L,b,$){let fe=1;const ge=nt(L);if((ge.width>$||ge.height>$)&&(fe=$/Math.max(ge.width,ge.height)),fe<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){const de=Math.floor(fe*ge.width),Ke=Math.floor(fe*ge.height);g===void 0&&(g=M(de,Ke));const Ae=b?M(de,Ke):g;return Ae.width=de,Ae.height=Ke,Ae.getContext("2d").drawImage(L,0,0,de,Ke),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ge.width+"x"+ge.height+") to ("+de+"x"+Ke+")."),Ae}else return"data"in L&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ge.width+"x"+ge.height+")."),L;return L}function y(L){return L.generateMipmaps&&L.minFilter!==Vn&&L.minFilter!==Si}function x(L){s.generateMipmap(L)}function C(L,b,$,fe,ge=!1){if(L!==null){if(s[L]!==void 0)return s[L];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let de=b;if(b===s.RED&&($===s.FLOAT&&(de=s.R32F),$===s.HALF_FLOAT&&(de=s.R16F),$===s.UNSIGNED_BYTE&&(de=s.R8)),b===s.RED_INTEGER&&($===s.UNSIGNED_BYTE&&(de=s.R8UI),$===s.UNSIGNED_SHORT&&(de=s.R16UI),$===s.UNSIGNED_INT&&(de=s.R32UI),$===s.BYTE&&(de=s.R8I),$===s.SHORT&&(de=s.R16I),$===s.INT&&(de=s.R32I)),b===s.RG&&($===s.FLOAT&&(de=s.RG32F),$===s.HALF_FLOAT&&(de=s.RG16F),$===s.UNSIGNED_BYTE&&(de=s.RG8)),b===s.RG_INTEGER&&($===s.UNSIGNED_BYTE&&(de=s.RG8UI),$===s.UNSIGNED_SHORT&&(de=s.RG16UI),$===s.UNSIGNED_INT&&(de=s.RG32UI),$===s.BYTE&&(de=s.RG8I),$===s.SHORT&&(de=s.RG16I),$===s.INT&&(de=s.RG32I)),b===s.RGB_INTEGER&&($===s.UNSIGNED_BYTE&&(de=s.RGB8UI),$===s.UNSIGNED_SHORT&&(de=s.RGB16UI),$===s.UNSIGNED_INT&&(de=s.RGB32UI),$===s.BYTE&&(de=s.RGB8I),$===s.SHORT&&(de=s.RGB16I),$===s.INT&&(de=s.RGB32I)),b===s.RGBA_INTEGER&&($===s.UNSIGNED_BYTE&&(de=s.RGBA8UI),$===s.UNSIGNED_SHORT&&(de=s.RGBA16UI),$===s.UNSIGNED_INT&&(de=s.RGBA32UI),$===s.BYTE&&(de=s.RGBA8I),$===s.SHORT&&(de=s.RGBA16I),$===s.INT&&(de=s.RGBA32I)),b===s.RGB&&$===s.UNSIGNED_INT_5_9_9_9_REV&&(de=s.RGB9_E5),b===s.RGBA){const Ke=ge?yc:Et.getTransfer(fe);$===s.FLOAT&&(de=s.RGBA32F),$===s.HALF_FLOAT&&(de=s.RGBA16F),$===s.UNSIGNED_BYTE&&(de=Ke===Ft?s.SRGB8_ALPHA8:s.RGBA8),$===s.UNSIGNED_SHORT_4_4_4_4&&(de=s.RGBA4),$===s.UNSIGNED_SHORT_5_5_5_1&&(de=s.RGB5_A1)}return(de===s.R16F||de===s.R32F||de===s.RG16F||de===s.RG32F||de===s.RGBA16F||de===s.RGBA32F)&&e.get("EXT_color_buffer_float"),de}function A(L,b){let $;return L?b===null||b===ds||b===mo?$=s.DEPTH24_STENCIL8:b===Li?$=s.DEPTH32F_STENCIL8:b===wa&&($=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===ds||b===mo?$=s.DEPTH_COMPONENT24:b===Li?$=s.DEPTH_COMPONENT32F:b===wa&&($=s.DEPTH_COMPONENT16),$}function D(L,b){return y(L)===!0||L.isFramebufferTexture&&L.minFilter!==Vn&&L.minFilter!==Si?Math.log2(Math.max(b.width,b.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?b.mipmaps.length:1}function G(L){const b=L.target;b.removeEventListener("dispose",G),I(b),b.isVideoTexture&&m.delete(b)}function k(L){const b=L.target;b.removeEventListener("dispose",k),ae(b)}function I(L){const b=r.get(L);if(b.__webglInit===void 0)return;const $=L.source,fe=v.get($);if(fe){const ge=fe[b.__cacheKey];ge.usedTimes--,ge.usedTimes===0&&z(L),Object.keys(fe).length===0&&v.delete($)}r.remove(L)}function z(L){const b=r.get(L);s.deleteTexture(b.__webglTexture);const $=L.source,fe=v.get($);delete fe[b.__cacheKey],u.memory.textures--}function ae(L){const b=r.get(L);if(L.depthTexture&&L.depthTexture.dispose(),L.isWebGLCubeRenderTarget)for(let fe=0;fe<6;fe++){if(Array.isArray(b.__webglFramebuffer[fe]))for(let ge=0;ge<b.__webglFramebuffer[fe].length;ge++)s.deleteFramebuffer(b.__webglFramebuffer[fe][ge]);else s.deleteFramebuffer(b.__webglFramebuffer[fe]);b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer[fe])}else{if(Array.isArray(b.__webglFramebuffer))for(let fe=0;fe<b.__webglFramebuffer.length;fe++)s.deleteFramebuffer(b.__webglFramebuffer[fe]);else s.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&s.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let fe=0;fe<b.__webglColorRenderbuffer.length;fe++)b.__webglColorRenderbuffer[fe]&&s.deleteRenderbuffer(b.__webglColorRenderbuffer[fe]);b.__webglDepthRenderbuffer&&s.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const $=L.textures;for(let fe=0,ge=$.length;fe<ge;fe++){const de=r.get($[fe]);de.__webglTexture&&(s.deleteTexture(de.__webglTexture),u.memory.textures--),r.remove($[fe])}r.remove(L)}let w=0;function P(){w=0}function K(){const L=w;return L>=o.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+L+" texture units while this GPU supports only "+o.maxTextures),w+=1,L}function Q(L){const b=[];return b.push(L.wrapS),b.push(L.wrapT),b.push(L.wrapR||0),b.push(L.magFilter),b.push(L.minFilter),b.push(L.anisotropy),b.push(L.internalFormat),b.push(L.format),b.push(L.type),b.push(L.generateMipmaps),b.push(L.premultiplyAlpha),b.push(L.flipY),b.push(L.unpackAlignment),b.push(L.colorSpace),b.join()}function oe(L,b){const $=r.get(L);if(L.isVideoTexture&&et(L),L.isRenderTargetTexture===!1&&L.version>0&&$.__version!==L.version){const fe=L.image;if(fe===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(fe.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Fe($,L,b);return}}t.bindTexture(s.TEXTURE_2D,$.__webglTexture,s.TEXTURE0+b)}function he(L,b){const $=r.get(L);if(L.version>0&&$.__version!==L.version){Fe($,L,b);return}t.bindTexture(s.TEXTURE_2D_ARRAY,$.__webglTexture,s.TEXTURE0+b)}function ne(L,b){const $=r.get(L);if(L.version>0&&$.__version!==L.version){Fe($,L,b);return}t.bindTexture(s.TEXTURE_3D,$.__webglTexture,s.TEXTURE0+b)}function le(L,b){const $=r.get(L);if(L.version>0&&$.__version!==L.version){J($,L,b);return}t.bindTexture(s.TEXTURE_CUBE_MAP,$.__webglTexture,s.TEXTURE0+b)}const V={[uh]:s.REPEAT,[cs]:s.CLAMP_TO_EDGE,[dh]:s.MIRRORED_REPEAT},ue={[Vn]:s.NEAREST,[hy]:s.NEAREST_MIPMAP_NEAREST,[Ul]:s.NEAREST_MIPMAP_LINEAR,[Si]:s.LINEAR,[fd]:s.LINEAR_MIPMAP_NEAREST,[us]:s.LINEAR_MIPMAP_LINEAR},se={[_y]:s.NEVER,[My]:s.ALWAYS,[gy]:s.LESS,[T0]:s.LEQUAL,[vy]:s.EQUAL,[Sy]:s.GEQUAL,[yy]:s.GREATER,[xy]:s.NOTEQUAL};function F(L,b){if(b.type===Li&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Si||b.magFilter===fd||b.magFilter===Ul||b.magFilter===us||b.minFilter===Si||b.minFilter===fd||b.minFilter===Ul||b.minFilter===us)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(L,s.TEXTURE_WRAP_S,V[b.wrapS]),s.texParameteri(L,s.TEXTURE_WRAP_T,V[b.wrapT]),(L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY)&&s.texParameteri(L,s.TEXTURE_WRAP_R,V[b.wrapR]),s.texParameteri(L,s.TEXTURE_MAG_FILTER,ue[b.magFilter]),s.texParameteri(L,s.TEXTURE_MIN_FILTER,ue[b.minFilter]),b.compareFunction&&(s.texParameteri(L,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(L,s.TEXTURE_COMPARE_FUNC,se[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Vn||b.minFilter!==Ul&&b.minFilter!==us||b.type===Li&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||r.get(b).__currentAnisotropy){const $=e.get("EXT_texture_filter_anisotropic");s.texParameterf(L,$.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,o.getMaxAnisotropy())),r.get(b).__currentAnisotropy=b.anisotropy}}}function ie(L,b){let $=!1;L.__webglInit===void 0&&(L.__webglInit=!0,b.addEventListener("dispose",G));const fe=b.source;let ge=v.get(fe);ge===void 0&&(ge={},v.set(fe,ge));const de=Q(b);if(de!==L.__cacheKey){ge[de]===void 0&&(ge[de]={texture:s.createTexture(),usedTimes:0},u.memory.textures++,$=!0),ge[de].usedTimes++;const Ke=ge[L.__cacheKey];Ke!==void 0&&(ge[L.__cacheKey].usedTimes--,Ke.usedTimes===0&&z(b)),L.__cacheKey=de,L.__webglTexture=ge[de].texture}return $}function Fe(L,b,$){let fe=s.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(fe=s.TEXTURE_2D_ARRAY),b.isData3DTexture&&(fe=s.TEXTURE_3D);const ge=ie(L,b),de=b.source;t.bindTexture(fe,L.__webglTexture,s.TEXTURE0+$);const Ke=r.get(de);if(de.version!==Ke.__version||ge===!0){t.activeTexture(s.TEXTURE0+$);const Ae=Et.getPrimaries(Et.workingColorSpace),Oe=b.colorSpace===Nr?null:Et.getPrimaries(b.colorSpace),_t=b.colorSpace===Nr||Ae===Oe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);let Me=E(b.image,!1,o.maxTextureSize);Me=Dt(b,Me);const Be=l.convert(b.format,b.colorSpace),st=l.convert(b.type);let it=C(b.internalFormat,Be,st,b.colorSpace,b.isVideoTexture);F(fe,b);let Ve;const ft=b.mipmaps,at=b.isVideoTexture!==!0,bt=Ke.__version===void 0||ge===!0,W=de.dataReady,Le=D(b,Me);if(b.isDepthTexture)it=A(b.format===_o,b.type),bt&&(at?t.texStorage2D(s.TEXTURE_2D,1,it,Me.width,Me.height):t.texImage2D(s.TEXTURE_2D,0,it,Me.width,Me.height,0,Be,st,null));else if(b.isDataTexture)if(ft.length>0){at&&bt&&t.texStorage2D(s.TEXTURE_2D,Le,it,ft[0].width,ft[0].height);for(let re=0,pe=ft.length;re<pe;re++)Ve=ft[re],at?W&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,Ve.width,Ve.height,Be,st,Ve.data):t.texImage2D(s.TEXTURE_2D,re,it,Ve.width,Ve.height,0,Be,st,Ve.data);b.generateMipmaps=!1}else at?(bt&&t.texStorage2D(s.TEXTURE_2D,Le,it,Me.width,Me.height),W&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Me.width,Me.height,Be,st,Me.data)):t.texImage2D(s.TEXTURE_2D,0,it,Me.width,Me.height,0,Be,st,Me.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){at&&bt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Le,it,ft[0].width,ft[0].height,Me.depth);for(let re=0,pe=ft.length;re<pe;re++)if(Ve=ft[re],b.format!==wi)if(Be!==null)if(at){if(W)if(b.layerUpdates.size>0){const be=V_(Ve.width,Ve.height,b.format,b.type);for(const Ue of b.layerUpdates){const pt=Ve.data.subarray(Ue*be/Ve.data.BYTES_PER_ELEMENT,(Ue+1)*be/Ve.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,Ue,Ve.width,Ve.height,1,Be,pt,0,0)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,0,Ve.width,Ve.height,Me.depth,Be,Ve.data,0,0)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,re,it,Ve.width,Ve.height,Me.depth,0,Ve.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else at?W&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,0,Ve.width,Ve.height,Me.depth,Be,st,Ve.data):t.texImage3D(s.TEXTURE_2D_ARRAY,re,it,Ve.width,Ve.height,Me.depth,0,Be,st,Ve.data)}else{at&&bt&&t.texStorage2D(s.TEXTURE_2D,Le,it,ft[0].width,ft[0].height);for(let re=0,pe=ft.length;re<pe;re++)Ve=ft[re],b.format!==wi?Be!==null?at?W&&t.compressedTexSubImage2D(s.TEXTURE_2D,re,0,0,Ve.width,Ve.height,Be,Ve.data):t.compressedTexImage2D(s.TEXTURE_2D,re,it,Ve.width,Ve.height,0,Ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):at?W&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,Ve.width,Ve.height,Be,st,Ve.data):t.texImage2D(s.TEXTURE_2D,re,it,Ve.width,Ve.height,0,Be,st,Ve.data)}else if(b.isDataArrayTexture)if(at){if(bt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Le,it,Me.width,Me.height,Me.depth),W)if(b.layerUpdates.size>0){const re=V_(Me.width,Me.height,b.format,b.type);for(const pe of b.layerUpdates){const be=Me.data.subarray(pe*re/Me.data.BYTES_PER_ELEMENT,(pe+1)*re/Me.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,pe,Me.width,Me.height,1,Be,st,be)}b.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Me.width,Me.height,Me.depth,Be,st,Me.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,it,Me.width,Me.height,Me.depth,0,Be,st,Me.data);else if(b.isData3DTexture)at?(bt&&t.texStorage3D(s.TEXTURE_3D,Le,it,Me.width,Me.height,Me.depth),W&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Me.width,Me.height,Me.depth,Be,st,Me.data)):t.texImage3D(s.TEXTURE_3D,0,it,Me.width,Me.height,Me.depth,0,Be,st,Me.data);else if(b.isFramebufferTexture){if(bt)if(at)t.texStorage2D(s.TEXTURE_2D,Le,it,Me.width,Me.height);else{let re=Me.width,pe=Me.height;for(let be=0;be<Le;be++)t.texImage2D(s.TEXTURE_2D,be,it,re,pe,0,Be,st,null),re>>=1,pe>>=1}}else if(ft.length>0){if(at&&bt){const re=nt(ft[0]);t.texStorage2D(s.TEXTURE_2D,Le,it,re.width,re.height)}for(let re=0,pe=ft.length;re<pe;re++)Ve=ft[re],at?W&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,Be,st,Ve):t.texImage2D(s.TEXTURE_2D,re,it,Be,st,Ve);b.generateMipmaps=!1}else if(at){if(bt){const re=nt(Me);t.texStorage2D(s.TEXTURE_2D,Le,it,re.width,re.height)}W&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Be,st,Me)}else t.texImage2D(s.TEXTURE_2D,0,it,Be,st,Me);y(b)&&x(fe),Ke.__version=de.version,b.onUpdate&&b.onUpdate(b)}L.__version=b.version}function J(L,b,$){if(b.image.length!==6)return;const fe=ie(L,b),ge=b.source;t.bindTexture(s.TEXTURE_CUBE_MAP,L.__webglTexture,s.TEXTURE0+$);const de=r.get(ge);if(ge.version!==de.__version||fe===!0){t.activeTexture(s.TEXTURE0+$);const Ke=Et.getPrimaries(Et.workingColorSpace),Ae=b.colorSpace===Nr?null:Et.getPrimaries(b.colorSpace),Oe=b.colorSpace===Nr||Ke===Ae?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Oe);const _t=b.isCompressedTexture||b.image[0].isCompressedTexture,Me=b.image[0]&&b.image[0].isDataTexture,Be=[];for(let pe=0;pe<6;pe++)!_t&&!Me?Be[pe]=E(b.image[pe],!0,o.maxCubemapSize):Be[pe]=Me?b.image[pe].image:b.image[pe],Be[pe]=Dt(b,Be[pe]);const st=Be[0],it=l.convert(b.format,b.colorSpace),Ve=l.convert(b.type),ft=C(b.internalFormat,it,Ve,b.colorSpace),at=b.isVideoTexture!==!0,bt=de.__version===void 0||fe===!0,W=ge.dataReady;let Le=D(b,st);F(s.TEXTURE_CUBE_MAP,b);let re;if(_t){at&&bt&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Le,ft,st.width,st.height);for(let pe=0;pe<6;pe++){re=Be[pe].mipmaps;for(let be=0;be<re.length;be++){const Ue=re[be];b.format!==wi?it!==null?at?W&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,be,0,0,Ue.width,Ue.height,it,Ue.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,be,ft,Ue.width,Ue.height,0,Ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,be,0,0,Ue.width,Ue.height,it,Ve,Ue.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,be,ft,Ue.width,Ue.height,0,it,Ve,Ue.data)}}}else{if(re=b.mipmaps,at&&bt){re.length>0&&Le++;const pe=nt(Be[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Le,ft,pe.width,pe.height)}for(let pe=0;pe<6;pe++)if(Me){at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,Be[pe].width,Be[pe].height,it,Ve,Be[pe].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,ft,Be[pe].width,Be[pe].height,0,it,Ve,Be[pe].data);for(let be=0;be<re.length;be++){const pt=re[be].image[pe].image;at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,be+1,0,0,pt.width,pt.height,it,Ve,pt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,be+1,ft,pt.width,pt.height,0,it,Ve,pt.data)}}else{at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,it,Ve,Be[pe]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,ft,it,Ve,Be[pe]);for(let be=0;be<re.length;be++){const Ue=re[be];at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,be+1,0,0,it,Ve,Ue.image[pe]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,be+1,ft,it,Ve,Ue.image[pe])}}}y(b)&&x(s.TEXTURE_CUBE_MAP),de.__version=ge.version,b.onUpdate&&b.onUpdate(b)}L.__version=b.version}function ce(L,b,$,fe,ge,de){const Ke=l.convert($.format,$.colorSpace),Ae=l.convert($.type),Oe=C($.internalFormat,Ke,Ae,$.colorSpace);if(!r.get(b).__hasExternalTextures){const Me=Math.max(1,b.width>>de),Be=Math.max(1,b.height>>de);ge===s.TEXTURE_3D||ge===s.TEXTURE_2D_ARRAY?t.texImage3D(ge,de,Oe,Me,Be,b.depth,0,Ke,Ae,null):t.texImage2D(ge,de,Oe,Me,Be,0,Ke,Ae,null)}t.bindFramebuffer(s.FRAMEBUFFER,L),mt(b)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,fe,ge,r.get($).__webglTexture,0,dt(b)):(ge===s.TEXTURE_2D||ge>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ge<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,fe,ge,r.get($).__webglTexture,de),t.bindFramebuffer(s.FRAMEBUFFER,null)}function ye(L,b,$){if(s.bindRenderbuffer(s.RENDERBUFFER,L),b.depthBuffer){const fe=b.depthTexture,ge=fe&&fe.isDepthTexture?fe.type:null,de=A(b.stencilBuffer,ge),Ke=b.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ae=dt(b);mt(b)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ae,de,b.width,b.height):$?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ae,de,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,de,b.width,b.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Ke,s.RENDERBUFFER,L)}else{const fe=b.textures;for(let ge=0;ge<fe.length;ge++){const de=fe[ge],Ke=l.convert(de.format,de.colorSpace),Ae=l.convert(de.type),Oe=C(de.internalFormat,Ke,Ae,de.colorSpace),_t=dt(b);$&&mt(b)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,_t,Oe,b.width,b.height):mt(b)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,_t,Oe,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,Oe,b.width,b.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Se(L,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,L),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!r.get(b.depthTexture).__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),oe(b.depthTexture,0);const fe=r.get(b.depthTexture).__webglTexture,ge=dt(b);if(b.depthTexture.format===co)mt(b)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,fe,0,ge):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,fe,0);else if(b.depthTexture.format===_o)mt(b)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,fe,0,ge):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,fe,0);else throw new Error("Unknown depthTexture format")}function Pe(L){const b=r.get(L),$=L.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==L.depthTexture){const fe=L.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),fe){const ge=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,fe.removeEventListener("dispose",ge)};fe.addEventListener("dispose",ge),b.__depthDisposeCallback=ge}b.__boundDepthTexture=fe}if(L.depthTexture&&!b.__autoAllocateDepthBuffer){if($)throw new Error("target.depthTexture not supported in Cube render targets");Se(b.__webglFramebuffer,L)}else if($){b.__webglDepthbuffer=[];for(let fe=0;fe<6;fe++)if(t.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[fe]),b.__webglDepthbuffer[fe]===void 0)b.__webglDepthbuffer[fe]=s.createRenderbuffer(),ye(b.__webglDepthbuffer[fe],L,!1);else{const ge=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,de=b.__webglDepthbuffer[fe];s.bindRenderbuffer(s.RENDERBUFFER,de),s.framebufferRenderbuffer(s.FRAMEBUFFER,ge,s.RENDERBUFFER,de)}}else if(t.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=s.createRenderbuffer(),ye(b.__webglDepthbuffer,L,!1);else{const fe=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ge=b.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ge),s.framebufferRenderbuffer(s.FRAMEBUFFER,fe,s.RENDERBUFFER,ge)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function De(L,b,$){const fe=r.get(L);b!==void 0&&ce(fe.__webglFramebuffer,L,L.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),$!==void 0&&Pe(L)}function rt(L){const b=L.texture,$=r.get(L),fe=r.get(b);L.addEventListener("dispose",k);const ge=L.textures,de=L.isWebGLCubeRenderTarget===!0,Ke=ge.length>1;if(Ke||(fe.__webglTexture===void 0&&(fe.__webglTexture=s.createTexture()),fe.__version=b.version,u.memory.textures++),de){$.__webglFramebuffer=[];for(let Ae=0;Ae<6;Ae++)if(b.mipmaps&&b.mipmaps.length>0){$.__webglFramebuffer[Ae]=[];for(let Oe=0;Oe<b.mipmaps.length;Oe++)$.__webglFramebuffer[Ae][Oe]=s.createFramebuffer()}else $.__webglFramebuffer[Ae]=s.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){$.__webglFramebuffer=[];for(let Ae=0;Ae<b.mipmaps.length;Ae++)$.__webglFramebuffer[Ae]=s.createFramebuffer()}else $.__webglFramebuffer=s.createFramebuffer();if(Ke)for(let Ae=0,Oe=ge.length;Ae<Oe;Ae++){const _t=r.get(ge[Ae]);_t.__webglTexture===void 0&&(_t.__webglTexture=s.createTexture(),u.memory.textures++)}if(L.samples>0&&mt(L)===!1){$.__webglMultisampledFramebuffer=s.createFramebuffer(),$.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,$.__webglMultisampledFramebuffer);for(let Ae=0;Ae<ge.length;Ae++){const Oe=ge[Ae];$.__webglColorRenderbuffer[Ae]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,$.__webglColorRenderbuffer[Ae]);const _t=l.convert(Oe.format,Oe.colorSpace),Me=l.convert(Oe.type),Be=C(Oe.internalFormat,_t,Me,Oe.colorSpace,L.isXRRenderTarget===!0),st=dt(L);s.renderbufferStorageMultisample(s.RENDERBUFFER,st,Be,L.width,L.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ae,s.RENDERBUFFER,$.__webglColorRenderbuffer[Ae])}s.bindRenderbuffer(s.RENDERBUFFER,null),L.depthBuffer&&($.__webglDepthRenderbuffer=s.createRenderbuffer(),ye($.__webglDepthRenderbuffer,L,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(de){t.bindTexture(s.TEXTURE_CUBE_MAP,fe.__webglTexture),F(s.TEXTURE_CUBE_MAP,b);for(let Ae=0;Ae<6;Ae++)if(b.mipmaps&&b.mipmaps.length>0)for(let Oe=0;Oe<b.mipmaps.length;Oe++)ce($.__webglFramebuffer[Ae][Oe],L,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,Oe);else ce($.__webglFramebuffer[Ae],L,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,0);y(b)&&x(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ke){for(let Ae=0,Oe=ge.length;Ae<Oe;Ae++){const _t=ge[Ae],Me=r.get(_t);t.bindTexture(s.TEXTURE_2D,Me.__webglTexture),F(s.TEXTURE_2D,_t),ce($.__webglFramebuffer,L,_t,s.COLOR_ATTACHMENT0+Ae,s.TEXTURE_2D,0),y(_t)&&x(s.TEXTURE_2D)}t.unbindTexture()}else{let Ae=s.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(Ae=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(Ae,fe.__webglTexture),F(Ae,b),b.mipmaps&&b.mipmaps.length>0)for(let Oe=0;Oe<b.mipmaps.length;Oe++)ce($.__webglFramebuffer[Oe],L,b,s.COLOR_ATTACHMENT0,Ae,Oe);else ce($.__webglFramebuffer,L,b,s.COLOR_ATTACHMENT0,Ae,0);y(b)&&x(Ae),t.unbindTexture()}L.depthBuffer&&Pe(L)}function vt(L){const b=L.textures;for(let $=0,fe=b.length;$<fe;$++){const ge=b[$];if(y(ge)){const de=L.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:s.TEXTURE_2D,Ke=r.get(ge).__webglTexture;t.bindTexture(de,Ke),x(de),t.unbindTexture()}}}const ht=[],B=[];function hn(L){if(L.samples>0){if(mt(L)===!1){const b=L.textures,$=L.width,fe=L.height;let ge=s.COLOR_BUFFER_BIT;const de=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ke=r.get(L),Ae=b.length>1;if(Ae)for(let Oe=0;Oe<b.length;Oe++)t.bindFramebuffer(s.FRAMEBUFFER,Ke.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Oe,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Ke.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Oe,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Ke.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ke.__webglFramebuffer);for(let Oe=0;Oe<b.length;Oe++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(ge|=s.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(ge|=s.STENCIL_BUFFER_BIT)),Ae){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Ke.__webglColorRenderbuffer[Oe]);const _t=r.get(b[Oe]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,_t,0)}s.blitFramebuffer(0,0,$,fe,0,0,$,fe,ge,s.NEAREST),h===!0&&(ht.length=0,B.length=0,ht.push(s.COLOR_ATTACHMENT0+Oe),L.depthBuffer&&L.resolveDepthBuffer===!1&&(ht.push(de),B.push(de),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,B)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,ht))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Ae)for(let Oe=0;Oe<b.length;Oe++){t.bindFramebuffer(s.FRAMEBUFFER,Ke.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Oe,s.RENDERBUFFER,Ke.__webglColorRenderbuffer[Oe]);const _t=r.get(b[Oe]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Ke.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Oe,s.TEXTURE_2D,_t,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ke.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.resolveDepthBuffer===!1&&h){const b=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[b])}}}function dt(L){return Math.min(o.maxSamples,L.samples)}function mt(L){const b=r.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function et(L){const b=u.render.frame;m.get(L)!==b&&(m.set(L,b),L.update())}function Dt(L,b){const $=L.colorSpace,fe=L.format,ge=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||$!==Or&&$!==Nr&&(Et.getTransfer($)===Ft?(fe!==wi||ge!==rr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",$)),b}function nt(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(p.width=L.naturalWidth||L.width,p.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(p.width=L.displayWidth,p.height=L.displayHeight):(p.width=L.width,p.height=L.height),p}this.allocateTextureUnit=K,this.resetTextureUnits=P,this.setTexture2D=oe,this.setTexture2DArray=he,this.setTexture3D=ne,this.setTextureCube=le,this.rebindTextures=De,this.setupRenderTarget=rt,this.updateRenderTargetMipmap=vt,this.updateMultisampleRenderTarget=hn,this.setupDepthRenderbuffer=Pe,this.setupFrameBufferTexture=ce,this.useMultisampledRTT=mt}function Vw(s,e){function t(r,o=Nr){let l;const u=Et.getTransfer(o);if(r===rr)return s.UNSIGNED_BYTE;if(r===$h)return s.UNSIGNED_SHORT_4_4_4_4;if(r===Qh)return s.UNSIGNED_SHORT_5_5_5_1;if(r===g0)return s.UNSIGNED_INT_5_9_9_9_REV;if(r===m0)return s.BYTE;if(r===_0)return s.SHORT;if(r===wa)return s.UNSIGNED_SHORT;if(r===Kh)return s.INT;if(r===ds)return s.UNSIGNED_INT;if(r===Li)return s.FLOAT;if(r===nr)return s.HALF_FLOAT;if(r===v0)return s.ALPHA;if(r===y0)return s.RGB;if(r===wi)return s.RGBA;if(r===x0)return s.LUMINANCE;if(r===S0)return s.LUMINANCE_ALPHA;if(r===co)return s.DEPTH_COMPONENT;if(r===_o)return s.DEPTH_STENCIL;if(r===Jh)return s.RED;if(r===Zh)return s.RED_INTEGER;if(r===M0)return s.RG;if(r===ef)return s.RG_INTEGER;if(r===tf)return s.RGBA_INTEGER;if(r===dc||r===hc||r===fc||r===pc)if(u===Ft)if(l=e.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(r===dc)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===hc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===fc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===pc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=e.get("WEBGL_compressed_texture_s3tc"),l!==null){if(r===dc)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===hc)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===fc)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===pc)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===hh||r===fh||r===ph||r===mh)if(l=e.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(r===hh)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===fh)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===ph)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===mh)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===_h||r===gh||r===vh)if(l=e.get("WEBGL_compressed_texture_etc"),l!==null){if(r===_h||r===gh)return u===Ft?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(r===vh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===yh||r===xh||r===Sh||r===Mh||r===wh||r===Eh||r===Th||r===Ah||r===bh||r===Ch||r===Rh||r===Ph||r===Dh||r===Lh)if(l=e.get("WEBGL_compressed_texture_astc"),l!==null){if(r===yh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===xh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Sh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Mh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===wh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Eh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Th)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Ah)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===bh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Ch)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Rh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Ph)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Dh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Lh)return u===Ft?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===mc||r===Ih||r===Nh)if(l=e.get("EXT_texture_compression_bptc"),l!==null){if(r===mc)return u===Ft?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Ih)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Nh)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===w0||r===Uh||r===kh||r===Fh)if(l=e.get("EXT_texture_compression_rgtc"),l!==null){if(r===mc)return l.COMPRESSED_RED_RGTC1_EXT;if(r===Uh)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===kh)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Fh)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===mo?s.UNSIGNED_INT_24_8:s[r]!==void 0?s[r]:null}return{convert:t}}class Hw extends $n{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class An extends Ot{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Gw={type:"move"};class Hd{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new An,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new An,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new An,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let o=null,l=null,u=null;const d=this._targetRay,h=this._grip,p=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(p&&e.hand){u=!0;for(const E of e.hand.values()){const y=t.getJointPose(E,r),x=this._getHandJoint(p,E);y!==null&&(x.matrix.fromArray(y.transform.matrix),x.matrix.decompose(x.position,x.rotation,x.scale),x.matrixWorldNeedsUpdate=!0,x.jointRadius=y.radius),x.visible=y!==null}const m=p.joints["index-finger-tip"],g=p.joints["thumb-tip"],v=m.position.distanceTo(g.position),S=.02,M=.005;p.inputState.pinching&&v>S+M?(p.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!p.inputState.pinching&&v<=S-M&&(p.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else h!==null&&e.gripSpace&&(l=t.getPose(e.gripSpace,r),l!==null&&(h.matrix.fromArray(l.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,l.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(l.linearVelocity)):h.hasLinearVelocity=!1,l.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(l.angularVelocity)):h.hasAngularVelocity=!1));d!==null&&(o=t.getPose(e.targetRaySpace,r),o===null&&l!==null&&(o=l),o!==null&&(d.matrix.fromArray(o.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,o.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(o.linearVelocity)):d.hasLinearVelocity=!1,o.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(o.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(Gw)))}return d!==null&&(d.visible=o!==null),h!==null&&(h.visible=l!==null),p!==null&&(p.visible=u!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const r=new An;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}}const Ww=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,qw=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Xw{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,r){if(this.texture===null){const o=new bn,l=e.properties.get(o);l.__webglTexture=t.texture,(t.depthNear!=r.depthNear||t.depthFar!=r.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=o}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,r=new In({vertexShader:Ww,fragmentShader:qw,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ne(new ps(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class jw extends xo{constructor(e,t){super();const r=this;let o=null,l=1,u=null,d="local-floor",h=1,p=null,m=null,g=null,v=null,S=null,M=null;const E=new Xw,y=t.getContextAttributes();let x=null,C=null;const A=[],D=[],G=new Re;let k=null;const I=new $n;I.layers.enable(1),I.viewport=new It;const z=new $n;z.layers.enable(2),z.viewport=new It;const ae=[I,z],w=new Hw;w.layers.enable(1),w.layers.enable(2);let P=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let ce=A[J];return ce===void 0&&(ce=new Hd,A[J]=ce),ce.getTargetRaySpace()},this.getControllerGrip=function(J){let ce=A[J];return ce===void 0&&(ce=new Hd,A[J]=ce),ce.getGripSpace()},this.getHand=function(J){let ce=A[J];return ce===void 0&&(ce=new Hd,A[J]=ce),ce.getHandSpace()};function Q(J){const ce=D.indexOf(J.inputSource);if(ce===-1)return;const ye=A[ce];ye!==void 0&&(ye.update(J.inputSource,J.frame,p||u),ye.dispatchEvent({type:J.type,data:J.inputSource}))}function oe(){o.removeEventListener("select",Q),o.removeEventListener("selectstart",Q),o.removeEventListener("selectend",Q),o.removeEventListener("squeeze",Q),o.removeEventListener("squeezestart",Q),o.removeEventListener("squeezeend",Q),o.removeEventListener("end",oe),o.removeEventListener("inputsourceschange",he);for(let J=0;J<A.length;J++){const ce=D[J];ce!==null&&(D[J]=null,A[J].disconnect(ce))}P=null,K=null,E.reset(),e.setRenderTarget(x),S=null,v=null,g=null,o=null,C=null,Fe.stop(),r.isPresenting=!1,e.setPixelRatio(k),e.setSize(G.width,G.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){l=J,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){d=J,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return p||u},this.setReferenceSpace=function(J){p=J},this.getBaseLayer=function(){return v!==null?v:S},this.getBinding=function(){return g},this.getFrame=function(){return M},this.getSession=function(){return o},this.setSession=async function(J){if(o=J,o!==null){if(x=e.getRenderTarget(),o.addEventListener("select",Q),o.addEventListener("selectstart",Q),o.addEventListener("selectend",Q),o.addEventListener("squeeze",Q),o.addEventListener("squeezestart",Q),o.addEventListener("squeezeend",Q),o.addEventListener("end",oe),o.addEventListener("inputsourceschange",he),y.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(G),o.renderState.layers===void 0){const ce={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:l};S=new XRWebGLLayer(o,t,ce),o.updateRenderState({baseLayer:S}),e.setPixelRatio(1),e.setSize(S.framebufferWidth,S.framebufferHeight,!1),C=new Ei(S.framebufferWidth,S.framebufferHeight,{format:wi,type:rr,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil})}else{let ce=null,ye=null,Se=null;y.depth&&(Se=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ce=y.stencil?_o:co,ye=y.stencil?mo:ds);const Pe={colorFormat:t.RGBA8,depthFormat:Se,scaleFactor:l};g=new XRWebGLBinding(o,t),v=g.createProjectionLayer(Pe),o.updateRenderState({layers:[v]}),e.setPixelRatio(1),e.setSize(v.textureWidth,v.textureHeight,!1),C=new Ei(v.textureWidth,v.textureHeight,{format:wi,type:rr,depthTexture:new k0(v.textureWidth,v.textureHeight,ye,void 0,void 0,void 0,void 0,void 0,void 0,ce),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:v.ignoreDepthValues===!1})}C.isXRRenderTarget=!0,this.setFoveation(h),p=null,u=await o.requestReferenceSpace(d),Fe.setContext(o),Fe.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode},this.getDepthTexture=function(){return E.getDepthTexture()};function he(J){for(let ce=0;ce<J.removed.length;ce++){const ye=J.removed[ce],Se=D.indexOf(ye);Se>=0&&(D[Se]=null,A[Se].disconnect(ye))}for(let ce=0;ce<J.added.length;ce++){const ye=J.added[ce];let Se=D.indexOf(ye);if(Se===-1){for(let De=0;De<A.length;De++)if(De>=D.length){D.push(ye),Se=De;break}else if(D[De]===null){D[De]=ye,Se=De;break}if(Se===-1)break}const Pe=A[Se];Pe&&Pe.connect(ye)}}const ne=new N,le=new N;function V(J,ce,ye){ne.setFromMatrixPosition(ce.matrixWorld),le.setFromMatrixPosition(ye.matrixWorld);const Se=ne.distanceTo(le),Pe=ce.projectionMatrix.elements,De=ye.projectionMatrix.elements,rt=Pe[14]/(Pe[10]-1),vt=Pe[14]/(Pe[10]+1),ht=(Pe[9]+1)/Pe[5],B=(Pe[9]-1)/Pe[5],hn=(Pe[8]-1)/Pe[0],dt=(De[8]+1)/De[0],mt=rt*hn,et=rt*dt,Dt=Se/(-hn+dt),nt=Dt*-hn;if(ce.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(nt),J.translateZ(Dt),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Pe[10]===-1)J.projectionMatrix.copy(ce.projectionMatrix),J.projectionMatrixInverse.copy(ce.projectionMatrixInverse);else{const L=rt+Dt,b=vt+Dt,$=mt-nt,fe=et+(Se-nt),ge=ht*vt/b*L,de=B*vt/b*L;J.projectionMatrix.makePerspective($,fe,ge,de,L,b),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function ue(J,ce){ce===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(ce.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(o===null)return;let ce=J.near,ye=J.far;E.texture!==null&&(E.depthNear>0&&(ce=E.depthNear),E.depthFar>0&&(ye=E.depthFar)),w.near=z.near=I.near=ce,w.far=z.far=I.far=ye,(P!==w.near||K!==w.far)&&(o.updateRenderState({depthNear:w.near,depthFar:w.far}),P=w.near,K=w.far);const Se=J.parent,Pe=w.cameras;ue(w,Se);for(let De=0;De<Pe.length;De++)ue(Pe[De],Se);Pe.length===2?V(w,I,z):w.projectionMatrix.copy(I.projectionMatrix),se(J,w,Se)};function se(J,ce,ye){ye===null?J.matrix.copy(ce.matrixWorld):(J.matrix.copy(ye.matrixWorld),J.matrix.invert(),J.matrix.multiply(ce.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(ce.projectionMatrix),J.projectionMatrixInverse.copy(ce.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Ea*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return w},this.getFoveation=function(){if(!(v===null&&S===null))return h},this.setFoveation=function(J){h=J,v!==null&&(v.fixedFoveation=J),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=J)},this.hasDepthSensing=function(){return E.texture!==null},this.getDepthSensingMesh=function(){return E.getMesh(w)};let F=null;function ie(J,ce){if(m=ce.getViewerPose(p||u),M=ce,m!==null){const ye=m.views;S!==null&&(e.setRenderTargetFramebuffer(C,S.framebuffer),e.setRenderTarget(C));let Se=!1;ye.length!==w.cameras.length&&(w.cameras.length=0,Se=!0);for(let De=0;De<ye.length;De++){const rt=ye[De];let vt=null;if(S!==null)vt=S.getViewport(rt);else{const B=g.getViewSubImage(v,rt);vt=B.viewport,De===0&&(e.setRenderTargetTextures(C,B.colorTexture,v.ignoreDepthValues?void 0:B.depthStencilTexture),e.setRenderTarget(C))}let ht=ae[De];ht===void 0&&(ht=new $n,ht.layers.enable(De),ht.viewport=new It,ae[De]=ht),ht.matrix.fromArray(rt.transform.matrix),ht.matrix.decompose(ht.position,ht.quaternion,ht.scale),ht.projectionMatrix.fromArray(rt.projectionMatrix),ht.projectionMatrixInverse.copy(ht.projectionMatrix).invert(),ht.viewport.set(vt.x,vt.y,vt.width,vt.height),De===0&&(w.matrix.copy(ht.matrix),w.matrix.decompose(w.position,w.quaternion,w.scale)),Se===!0&&w.cameras.push(ht)}const Pe=o.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")){const De=g.getDepthInformation(ye[0]);De&&De.isValid&&De.texture&&E.init(e,De,o.renderState)}}for(let ye=0;ye<A.length;ye++){const Se=D[ye],Pe=A[ye];Se!==null&&Pe!==void 0&&Pe.update(Se,ce,p||u)}F&&F(J,ce),ce.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ce}),M=null}const Fe=new U0;Fe.setAnimationLoop(ie),this.setAnimationLoop=function(J){F=J},this.dispose=function(){}}}const is=new Ii,Yw=new Ct;function Kw(s,e){function t(y,x){y.matrixAutoUpdate===!0&&y.updateMatrix(),x.value.copy(y.matrix)}function r(y,x){x.color.getRGB(y.fogColor.value,L0(s)),x.isFog?(y.fogNear.value=x.near,y.fogFar.value=x.far):x.isFogExp2&&(y.fogDensity.value=x.density)}function o(y,x,C,A,D){x.isMeshBasicMaterial||x.isMeshLambertMaterial?l(y,x):x.isMeshToonMaterial?(l(y,x),g(y,x)):x.isMeshPhongMaterial?(l(y,x),m(y,x)):x.isMeshStandardMaterial?(l(y,x),v(y,x),x.isMeshPhysicalMaterial&&S(y,x,D)):x.isMeshMatcapMaterial?(l(y,x),M(y,x)):x.isMeshDepthMaterial?l(y,x):x.isMeshDistanceMaterial?(l(y,x),E(y,x)):x.isMeshNormalMaterial?l(y,x):x.isLineBasicMaterial?(u(y,x),x.isLineDashedMaterial&&d(y,x)):x.isPointsMaterial?h(y,x,C,A):x.isSpriteMaterial?p(y,x):x.isShadowMaterial?(y.color.value.copy(x.color),y.opacity.value=x.opacity):x.isShaderMaterial&&(x.uniformsNeedUpdate=!1)}function l(y,x){y.opacity.value=x.opacity,x.color&&y.diffuse.value.copy(x.color),x.emissive&&y.emissive.value.copy(x.emissive).multiplyScalar(x.emissiveIntensity),x.map&&(y.map.value=x.map,t(x.map,y.mapTransform)),x.alphaMap&&(y.alphaMap.value=x.alphaMap,t(x.alphaMap,y.alphaMapTransform)),x.bumpMap&&(y.bumpMap.value=x.bumpMap,t(x.bumpMap,y.bumpMapTransform),y.bumpScale.value=x.bumpScale,x.side===Nn&&(y.bumpScale.value*=-1)),x.normalMap&&(y.normalMap.value=x.normalMap,t(x.normalMap,y.normalMapTransform),y.normalScale.value.copy(x.normalScale),x.side===Nn&&y.normalScale.value.negate()),x.displacementMap&&(y.displacementMap.value=x.displacementMap,t(x.displacementMap,y.displacementMapTransform),y.displacementScale.value=x.displacementScale,y.displacementBias.value=x.displacementBias),x.emissiveMap&&(y.emissiveMap.value=x.emissiveMap,t(x.emissiveMap,y.emissiveMapTransform)),x.specularMap&&(y.specularMap.value=x.specularMap,t(x.specularMap,y.specularMapTransform)),x.alphaTest>0&&(y.alphaTest.value=x.alphaTest);const C=e.get(x),A=C.envMap,D=C.envMapRotation;A&&(y.envMap.value=A,is.copy(D),is.x*=-1,is.y*=-1,is.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(is.y*=-1,is.z*=-1),y.envMapRotation.value.setFromMatrix4(Yw.makeRotationFromEuler(is)),y.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,y.reflectivity.value=x.reflectivity,y.ior.value=x.ior,y.refractionRatio.value=x.refractionRatio),x.lightMap&&(y.lightMap.value=x.lightMap,y.lightMapIntensity.value=x.lightMapIntensity,t(x.lightMap,y.lightMapTransform)),x.aoMap&&(y.aoMap.value=x.aoMap,y.aoMapIntensity.value=x.aoMapIntensity,t(x.aoMap,y.aoMapTransform))}function u(y,x){y.diffuse.value.copy(x.color),y.opacity.value=x.opacity,x.map&&(y.map.value=x.map,t(x.map,y.mapTransform))}function d(y,x){y.dashSize.value=x.dashSize,y.totalSize.value=x.dashSize+x.gapSize,y.scale.value=x.scale}function h(y,x,C,A){y.diffuse.value.copy(x.color),y.opacity.value=x.opacity,y.size.value=x.size*C,y.scale.value=A*.5,x.map&&(y.map.value=x.map,t(x.map,y.uvTransform)),x.alphaMap&&(y.alphaMap.value=x.alphaMap,t(x.alphaMap,y.alphaMapTransform)),x.alphaTest>0&&(y.alphaTest.value=x.alphaTest)}function p(y,x){y.diffuse.value.copy(x.color),y.opacity.value=x.opacity,y.rotation.value=x.rotation,x.map&&(y.map.value=x.map,t(x.map,y.mapTransform)),x.alphaMap&&(y.alphaMap.value=x.alphaMap,t(x.alphaMap,y.alphaMapTransform)),x.alphaTest>0&&(y.alphaTest.value=x.alphaTest)}function m(y,x){y.specular.value.copy(x.specular),y.shininess.value=Math.max(x.shininess,1e-4)}function g(y,x){x.gradientMap&&(y.gradientMap.value=x.gradientMap)}function v(y,x){y.metalness.value=x.metalness,x.metalnessMap&&(y.metalnessMap.value=x.metalnessMap,t(x.metalnessMap,y.metalnessMapTransform)),y.roughness.value=x.roughness,x.roughnessMap&&(y.roughnessMap.value=x.roughnessMap,t(x.roughnessMap,y.roughnessMapTransform)),x.envMap&&(y.envMapIntensity.value=x.envMapIntensity)}function S(y,x,C){y.ior.value=x.ior,x.sheen>0&&(y.sheenColor.value.copy(x.sheenColor).multiplyScalar(x.sheen),y.sheenRoughness.value=x.sheenRoughness,x.sheenColorMap&&(y.sheenColorMap.value=x.sheenColorMap,t(x.sheenColorMap,y.sheenColorMapTransform)),x.sheenRoughnessMap&&(y.sheenRoughnessMap.value=x.sheenRoughnessMap,t(x.sheenRoughnessMap,y.sheenRoughnessMapTransform))),x.clearcoat>0&&(y.clearcoat.value=x.clearcoat,y.clearcoatRoughness.value=x.clearcoatRoughness,x.clearcoatMap&&(y.clearcoatMap.value=x.clearcoatMap,t(x.clearcoatMap,y.clearcoatMapTransform)),x.clearcoatRoughnessMap&&(y.clearcoatRoughnessMap.value=x.clearcoatRoughnessMap,t(x.clearcoatRoughnessMap,y.clearcoatRoughnessMapTransform)),x.clearcoatNormalMap&&(y.clearcoatNormalMap.value=x.clearcoatNormalMap,t(x.clearcoatNormalMap,y.clearcoatNormalMapTransform),y.clearcoatNormalScale.value.copy(x.clearcoatNormalScale),x.side===Nn&&y.clearcoatNormalScale.value.negate())),x.dispersion>0&&(y.dispersion.value=x.dispersion),x.iridescence>0&&(y.iridescence.value=x.iridescence,y.iridescenceIOR.value=x.iridescenceIOR,y.iridescenceThicknessMinimum.value=x.iridescenceThicknessRange[0],y.iridescenceThicknessMaximum.value=x.iridescenceThicknessRange[1],x.iridescenceMap&&(y.iridescenceMap.value=x.iridescenceMap,t(x.iridescenceMap,y.iridescenceMapTransform)),x.iridescenceThicknessMap&&(y.iridescenceThicknessMap.value=x.iridescenceThicknessMap,t(x.iridescenceThicknessMap,y.iridescenceThicknessMapTransform))),x.transmission>0&&(y.transmission.value=x.transmission,y.transmissionSamplerMap.value=C.texture,y.transmissionSamplerSize.value.set(C.width,C.height),x.transmissionMap&&(y.transmissionMap.value=x.transmissionMap,t(x.transmissionMap,y.transmissionMapTransform)),y.thickness.value=x.thickness,x.thicknessMap&&(y.thicknessMap.value=x.thicknessMap,t(x.thicknessMap,y.thicknessMapTransform)),y.attenuationDistance.value=x.attenuationDistance,y.attenuationColor.value.copy(x.attenuationColor)),x.anisotropy>0&&(y.anisotropyVector.value.set(x.anisotropy*Math.cos(x.anisotropyRotation),x.anisotropy*Math.sin(x.anisotropyRotation)),x.anisotropyMap&&(y.anisotropyMap.value=x.anisotropyMap,t(x.anisotropyMap,y.anisotropyMapTransform))),y.specularIntensity.value=x.specularIntensity,y.specularColor.value.copy(x.specularColor),x.specularColorMap&&(y.specularColorMap.value=x.specularColorMap,t(x.specularColorMap,y.specularColorMapTransform)),x.specularIntensityMap&&(y.specularIntensityMap.value=x.specularIntensityMap,t(x.specularIntensityMap,y.specularIntensityMapTransform))}function M(y,x){x.matcap&&(y.matcap.value=x.matcap)}function E(y,x){const C=e.get(x).light;y.referencePosition.value.setFromMatrixPosition(C.matrixWorld),y.nearDistance.value=C.shadow.camera.near,y.farDistance.value=C.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:o}}function $w(s,e,t,r){let o={},l={},u=[];const d=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function h(C,A){const D=A.program;r.uniformBlockBinding(C,D)}function p(C,A){let D=o[C.id];D===void 0&&(M(C),D=m(C),o[C.id]=D,C.addEventListener("dispose",y));const G=A.program;r.updateUBOMapping(C,G);const k=e.render.frame;l[C.id]!==k&&(v(C),l[C.id]=k)}function m(C){const A=g();C.__bindingPointIndex=A;const D=s.createBuffer(),G=C.__size,k=C.usage;return s.bindBuffer(s.UNIFORM_BUFFER,D),s.bufferData(s.UNIFORM_BUFFER,G,k),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,A,D),D}function g(){for(let C=0;C<d;C++)if(u.indexOf(C)===-1)return u.push(C),C;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function v(C){const A=o[C.id],D=C.uniforms,G=C.__cache;s.bindBuffer(s.UNIFORM_BUFFER,A);for(let k=0,I=D.length;k<I;k++){const z=Array.isArray(D[k])?D[k]:[D[k]];for(let ae=0,w=z.length;ae<w;ae++){const P=z[ae];if(S(P,k,ae,G)===!0){const K=P.__offset,Q=Array.isArray(P.value)?P.value:[P.value];let oe=0;for(let he=0;he<Q.length;he++){const ne=Q[he],le=E(ne);typeof ne=="number"||typeof ne=="boolean"?(P.__data[0]=ne,s.bufferSubData(s.UNIFORM_BUFFER,K+oe,P.__data)):ne.isMatrix3?(P.__data[0]=ne.elements[0],P.__data[1]=ne.elements[1],P.__data[2]=ne.elements[2],P.__data[3]=0,P.__data[4]=ne.elements[3],P.__data[5]=ne.elements[4],P.__data[6]=ne.elements[5],P.__data[7]=0,P.__data[8]=ne.elements[6],P.__data[9]=ne.elements[7],P.__data[10]=ne.elements[8],P.__data[11]=0):(ne.toArray(P.__data,oe),oe+=le.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,K,P.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function S(C,A,D,G){const k=C.value,I=A+"_"+D;if(G[I]===void 0)return typeof k=="number"||typeof k=="boolean"?G[I]=k:G[I]=k.clone(),!0;{const z=G[I];if(typeof k=="number"||typeof k=="boolean"){if(z!==k)return G[I]=k,!0}else if(z.equals(k)===!1)return z.copy(k),!0}return!1}function M(C){const A=C.uniforms;let D=0;const G=16;for(let I=0,z=A.length;I<z;I++){const ae=Array.isArray(A[I])?A[I]:[A[I]];for(let w=0,P=ae.length;w<P;w++){const K=ae[w],Q=Array.isArray(K.value)?K.value:[K.value];for(let oe=0,he=Q.length;oe<he;oe++){const ne=Q[oe],le=E(ne),V=D%G,ue=V%le.boundary,se=V+ue;D+=ue,se!==0&&G-se<le.storage&&(D+=G-se),K.__data=new Float32Array(le.storage/Float32Array.BYTES_PER_ELEMENT),K.__offset=D,D+=le.storage}}}const k=D%G;return k>0&&(D+=G-k),C.__size=D,C.__cache={},this}function E(C){const A={boundary:0,storage:0};return typeof C=="number"||typeof C=="boolean"?(A.boundary=4,A.storage=4):C.isVector2?(A.boundary=8,A.storage=8):C.isVector3||C.isColor?(A.boundary=16,A.storage=12):C.isVector4?(A.boundary=16,A.storage=16):C.isMatrix3?(A.boundary=48,A.storage=48):C.isMatrix4?(A.boundary=64,A.storage=64):C.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",C),A}function y(C){const A=C.target;A.removeEventListener("dispose",y);const D=u.indexOf(A.__bindingPointIndex);u.splice(D,1),s.deleteBuffer(o[A.id]),delete o[A.id],delete l[A.id]}function x(){for(const C in o)s.deleteBuffer(o[C]);u=[],o={},l={}}return{bind:h,update:p,dispose:x}}class Qw{constructor(e={}){const{canvas:t=By(),context:r=null,depth:o=!0,stencil:l=!1,alpha:u=!1,antialias:d=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:p=!1,powerPreference:m="default",failIfMajorPerformanceCaveat:g=!1}=e;this.isWebGLRenderer=!0;let v;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");v=r.getContextAttributes().alpha}else v=u;const S=new Uint32Array(4),M=new Int32Array(4);let E=null,y=null;const x=[],C=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=yi,this.toneMapping=kr,this.toneMappingExposure=1;const A=this;let D=!1,G=0,k=0,I=null,z=-1,ae=null;const w=new It,P=new It;let K=null;const Q=new Ze(0);let oe=0,he=t.width,ne=t.height,le=1,V=null,ue=null;const se=new It(0,0,he,ne),F=new It(0,0,he,ne);let ie=!1;const Fe=new af;let J=!1,ce=!1;const ye=new Ct,Se=new Ct,Pe=new N,De=new It,rt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let vt=!1;function ht(){return I===null?le:1}let B=r;function hn(R,q){return t.getContext(R,q)}try{const R={alpha:!0,depth:o,stencil:l,antialias:d,premultipliedAlpha:h,preserveDrawingBuffer:p,powerPreference:m,failIfMajorPerformanceCaveat:g};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${jh}`),t.addEventListener("webglcontextlost",pe,!1),t.addEventListener("webglcontextrestored",be,!1),t.addEventListener("webglcontextcreationerror",Ue,!1),B===null){const q="webgl2";if(B=hn(q,R),B===null)throw hn(q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let dt,mt,et,Dt,nt,L,b,$,fe,ge,de,Ke,Ae,Oe,_t,Me,Be,st,it,Ve,ft,at,bt,W;function Le(){dt=new nM(B),dt.init(),at=new Vw(B,dt),mt=new $S(B,dt,e,at),et=new Ow(B),mt.reverseDepthBuffer&&et.buffers.depth.setReversed(!0),Dt=new sM(B),nt=new ww,L=new zw(B,dt,et,nt,mt,at,Dt),b=new JS(A),$=new tM(A),fe=new hx(B),bt=new YS(B,fe),ge=new iM(B,fe,Dt,bt),de=new aM(B,ge,fe,Dt),it=new oM(B,mt,L),Me=new QS(nt),Ke=new Mw(A,b,$,dt,mt,bt,Me),Ae=new Kw(A,nt),Oe=new Tw,_t=new Dw(dt),st=new jS(A,b,$,et,de,v,h),Be=new kw(A,de,mt),W=new $w(B,Dt,mt,et),Ve=new KS(B,dt,Dt),ft=new rM(B,dt,Dt),Dt.programs=Ke.programs,A.capabilities=mt,A.extensions=dt,A.properties=nt,A.renderLists=Oe,A.shadowMap=Be,A.state=et,A.info=Dt}Le();const re=new jw(A,B);this.xr=re,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){const R=dt.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=dt.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(R){R!==void 0&&(le=R,this.setSize(he,ne,!1))},this.getSize=function(R){return R.set(he,ne)},this.setSize=function(R,q,Z=!0){if(re.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}he=R,ne=q,t.width=Math.floor(R*le),t.height=Math.floor(q*le),Z===!0&&(t.style.width=R+"px",t.style.height=q+"px"),this.setViewport(0,0,R,q)},this.getDrawingBufferSize=function(R){return R.set(he*le,ne*le).floor()},this.setDrawingBufferSize=function(R,q,Z){he=R,ne=q,le=Z,t.width=Math.floor(R*Z),t.height=Math.floor(q*Z),this.setViewport(0,0,R,q)},this.getCurrentViewport=function(R){return R.copy(w)},this.getViewport=function(R){return R.copy(se)},this.setViewport=function(R,q,Z,ee){R.isVector4?se.set(R.x,R.y,R.z,R.w):se.set(R,q,Z,ee),et.viewport(w.copy(se).multiplyScalar(le).round())},this.getScissor=function(R){return R.copy(F)},this.setScissor=function(R,q,Z,ee){R.isVector4?F.set(R.x,R.y,R.z,R.w):F.set(R,q,Z,ee),et.scissor(P.copy(F).multiplyScalar(le).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(R){et.setScissorTest(ie=R)},this.setOpaqueSort=function(R){V=R},this.setTransparentSort=function(R){ue=R},this.getClearColor=function(R){return R.copy(st.getClearColor())},this.setClearColor=function(){st.setClearColor.apply(st,arguments)},this.getClearAlpha=function(){return st.getClearAlpha()},this.setClearAlpha=function(){st.setClearAlpha.apply(st,arguments)},this.clear=function(R=!0,q=!0,Z=!0){let ee=0;if(R){let X=!1;if(I!==null){const Ee=I.texture.format;X=Ee===tf||Ee===ef||Ee===Zh}if(X){const Ee=I.texture.type,Ie=Ee===rr||Ee===ds||Ee===wa||Ee===mo||Ee===$h||Ee===Qh,Te=st.getClearColor(),Xe=st.getClearAlpha(),Je=Te.r,tt=Te.g,je=Te.b;Ie?(S[0]=Je,S[1]=tt,S[2]=je,S[3]=Xe,B.clearBufferuiv(B.COLOR,0,S)):(M[0]=Je,M[1]=tt,M[2]=je,M[3]=Xe,B.clearBufferiv(B.COLOR,0,M))}else ee|=B.COLOR_BUFFER_BIT}q&&(ee|=B.DEPTH_BUFFER_BIT,B.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),Z&&(ee|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B.clear(ee)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",pe,!1),t.removeEventListener("webglcontextrestored",be,!1),t.removeEventListener("webglcontextcreationerror",Ue,!1),Oe.dispose(),_t.dispose(),nt.dispose(),b.dispose(),$.dispose(),de.dispose(),bt.dispose(),W.dispose(),Ke.dispose(),re.dispose(),re.removeEventListener("sessionstart",sr),re.removeEventListener("sessionend",ms),Hn.stop()};function pe(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function be(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const R=Dt.autoReset,q=Be.enabled,Z=Be.autoUpdate,ee=Be.needsUpdate,X=Be.type;Le(),Dt.autoReset=R,Be.enabled=q,Be.autoUpdate=Z,Be.needsUpdate=ee,Be.type=X}function Ue(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function pt(R){const q=R.target;q.removeEventListener("dispose",pt),Gt(q)}function Gt(R){fn(R),nt.remove(R)}function fn(R){const q=nt.get(R).programs;q!==void 0&&(q.forEach(function(Z){Ke.releaseProgram(Z)}),R.isShaderMaterial&&Ke.releaseShaderCache(R))}this.renderBufferDirect=function(R,q,Z,ee,X,Ee){q===null&&(q=rt);const Ie=X.isMesh&&X.matrixWorld.determinant()<0,Te=ki(R,q,Z,ee,X);et.setMaterial(ee,Ie);let Xe=Z.index,Je=1;if(ee.wireframe===!0){if(Xe=ge.getWireframeAttribute(Z),Xe===void 0)return;Je=2}const tt=Z.drawRange,je=Z.attributes.position;let wt=tt.start*Je,Lt=(tt.start+tt.count)*Je;Ee!==null&&(wt=Math.max(wt,Ee.start*Je),Lt=Math.min(Lt,(Ee.start+Ee.count)*Je)),Xe!==null?(wt=Math.max(wt,0),Lt=Math.min(Lt,Xe.count)):je!=null&&(wt=Math.max(wt,0),Lt=Math.min(Lt,je.count));const Nt=Lt-wt;if(Nt<0||Nt===1/0)return;bt.setup(X,ee,Te,Z,Xe);let Vt,xt=Ve;if(Xe!==null&&(Vt=fe.get(Xe),xt=ft,xt.setIndex(Vt)),X.isMesh)ee.wireframe===!0?(et.setLineWidth(ee.wireframeLinewidth*ht()),xt.setMode(B.LINES)):xt.setMode(B.TRIANGLES);else if(X.isLine){let ze=ee.linewidth;ze===void 0&&(ze=1),et.setLineWidth(ze*ht()),X.isLineSegments?xt.setMode(B.LINES):X.isLineLoop?xt.setMode(B.LINE_LOOP):xt.setMode(B.LINE_STRIP)}else X.isPoints?xt.setMode(B.POINTS):X.isSprite&&xt.setMode(B.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)xt.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(dt.get("WEBGL_multi_draw"))xt.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const ze=X._multiDrawStarts,$t=X._multiDrawCounts,St=X._multiDrawCount,Gn=Xe?fe.get(Xe).bytesPerElement:1,ci=nt.get(ee).currentProgram.getUniforms();for(let rn=0;rn<St;rn++)ci.setValue(B,"_gl_DrawID",rn),xt.render(ze[rn]/Gn,$t[rn])}else if(X.isInstancedMesh)xt.renderInstances(wt,Nt,X.count);else if(Z.isInstancedBufferGeometry){const ze=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,$t=Math.min(Z.instanceCount,ze);xt.renderInstances(wt,Nt,$t)}else xt.render(wt,Nt)};function gt(R,q,Z){R.transparent===!0&&R.side===Di&&R.forceSinglePass===!1?(R.side=Nn,R.needsUpdate=!0,gs(R,q,Z),R.side=Fr,R.needsUpdate=!0,gs(R,q,Z),R.side=Di):gs(R,q,Z)}this.compile=function(R,q,Z=null){Z===null&&(Z=R),y=_t.get(Z),y.init(q),C.push(y),Z.traverseVisible(function(X){X.isLight&&X.layers.test(q.layers)&&(y.pushLight(X),X.castShadow&&y.pushShadow(X))}),R!==Z&&R.traverseVisible(function(X){X.isLight&&X.layers.test(q.layers)&&(y.pushLight(X),X.castShadow&&y.pushShadow(X))}),y.setupLights();const ee=new Set;return R.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const Ee=X.material;if(Ee)if(Array.isArray(Ee))for(let Ie=0;Ie<Ee.length;Ie++){const Te=Ee[Ie];gt(Te,Z,X),ee.add(Te)}else gt(Ee,Z,X),ee.add(Ee)}),C.pop(),y=null,ee},this.compileAsync=function(R,q,Z=null){const ee=this.compile(R,q,Z);return new Promise(X=>{function Ee(){if(ee.forEach(function(Ie){nt.get(Ie).currentProgram.isReady()&&ee.delete(Ie)}),ee.size===0){X(R);return}setTimeout(Ee,10)}dt.get("KHR_parallel_shader_compile")!==null?Ee():setTimeout(Ee,10)})};let nn=null;function Qn(R){nn&&nn(R)}function sr(){Hn.stop()}function ms(){Hn.start()}const Hn=new U0;Hn.setAnimationLoop(Qn),typeof self<"u"&&Hn.setContext(self),this.setAnimationLoop=function(R){nn=R,re.setAnimationLoop(R),R===null?Hn.stop():Hn.start()},re.addEventListener("sessionstart",sr),re.addEventListener("sessionend",ms),this.render=function(R,q){if(q!==void 0&&q.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),q.parent===null&&q.matrixWorldAutoUpdate===!0&&q.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(q),q=re.getCamera()),R.isScene===!0&&R.onBeforeRender(A,R,q,I),y=_t.get(R,C.length),y.init(q),C.push(y),Se.multiplyMatrices(q.projectionMatrix,q.matrixWorldInverse),Fe.setFromProjectionMatrix(Se),ce=this.localClippingEnabled,J=Me.init(this.clippingPlanes,ce),E=Oe.get(R,x.length),E.init(),x.push(E),re.enabled===!0&&re.isPresenting===!0){const Ee=A.xr.getDepthSensingMesh();Ee!==null&&To(Ee,q,-1/0,A.sortObjects)}To(R,q,0,A.sortObjects),E.finish(),A.sortObjects===!0&&E.sort(V,ue),vt=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,vt&&st.addToRenderList(E,R),this.info.render.frame++,J===!0&&Me.beginShadows();const Z=y.state.shadowsArray;Be.render(Z,R,q),J===!0&&Me.endShadows(),this.info.autoReset===!0&&this.info.reset();const ee=E.opaque,X=E.transmissive;if(y.setupLights(),q.isArrayCamera){const Ee=q.cameras;if(X.length>0)for(let Ie=0,Te=Ee.length;Ie<Te;Ie++){const Xe=Ee[Ie];Br(ee,X,R,Xe)}vt&&st.render(R);for(let Ie=0,Te=Ee.length;Ie<Te;Ie++){const Xe=Ee[Ie];or(E,R,Xe,Xe.viewport)}}else X.length>0&&Br(ee,X,R,q),vt&&st.render(R),or(E,R,q);I!==null&&(L.updateMultisampleRenderTarget(I),L.updateRenderTargetMipmap(I)),R.isScene===!0&&R.onAfterRender(A,R,q),bt.resetDefaultState(),z=-1,ae=null,C.pop(),C.length>0?(y=C[C.length-1],J===!0&&Me.setGlobalState(A.clippingPlanes,y.state.camera)):y=null,x.pop(),x.length>0?E=x[x.length-1]:E=null};function To(R,q,Z,ee){if(R.visible===!1)return;if(R.layers.test(q.layers)){if(R.isGroup)Z=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(q);else if(R.isLight)y.pushLight(R),R.castShadow&&y.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||Fe.intersectsSprite(R)){ee&&De.setFromMatrixPosition(R.matrixWorld).applyMatrix4(Se);const Ie=de.update(R),Te=R.material;Te.visible&&E.push(R,Ie,Te,Z,De.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||Fe.intersectsObject(R))){const Ie=de.update(R),Te=R.material;if(ee&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),De.copy(R.boundingSphere.center)):(Ie.boundingSphere===null&&Ie.computeBoundingSphere(),De.copy(Ie.boundingSphere.center)),De.applyMatrix4(R.matrixWorld).applyMatrix4(Se)),Array.isArray(Te)){const Xe=Ie.groups;for(let Je=0,tt=Xe.length;Je<tt;Je++){const je=Xe[Je],wt=Te[je.materialIndex];wt&&wt.visible&&E.push(R,Ie,wt,Z,De.z,je)}}else Te.visible&&E.push(R,Ie,Te,Z,De.z,null)}}const Ee=R.children;for(let Ie=0,Te=Ee.length;Ie<Te;Ie++)To(Ee[Ie],q,Z,ee)}function or(R,q,Z,ee){const X=R.opaque,Ee=R.transmissive,Ie=R.transparent;y.setupLightsView(Z),J===!0&&Me.setGlobalState(A.clippingPlanes,Z),ee&&et.viewport(w.copy(ee)),X.length>0&&Ui(X,q,Z),Ee.length>0&&Ui(Ee,q,Z),Ie.length>0&&Ui(Ie,q,Z),et.buffers.depth.setTest(!0),et.buffers.depth.setMask(!0),et.buffers.color.setMask(!0),et.setPolygonOffset(!1)}function Br(R,q,Z,ee){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;y.state.transmissionRenderTarget[ee.id]===void 0&&(y.state.transmissionRenderTarget[ee.id]=new Ei(1,1,{generateMipmaps:!0,type:dt.has("EXT_color_buffer_half_float")||dt.has("EXT_color_buffer_float")?nr:rr,minFilter:us,samples:4,stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Et.workingColorSpace}));const Ee=y.state.transmissionRenderTarget[ee.id],Ie=ee.viewport||w;Ee.setSize(Ie.z,Ie.w);const Te=A.getRenderTarget();A.setRenderTarget(Ee),A.getClearColor(Q),oe=A.getClearAlpha(),oe<1&&A.setClearColor(16777215,.5),A.clear(),vt&&st.render(Z);const Xe=A.toneMapping;A.toneMapping=kr;const Je=ee.viewport;if(ee.viewport!==void 0&&(ee.viewport=void 0),y.setupLightsView(ee),J===!0&&Me.setGlobalState(A.clippingPlanes,ee),Ui(R,Z,ee),L.updateMultisampleRenderTarget(Ee),L.updateRenderTargetMipmap(Ee),dt.has("WEBGL_multisampled_render_to_texture")===!1){let tt=!1;for(let je=0,wt=q.length;je<wt;je++){const Lt=q[je],Nt=Lt.object,Vt=Lt.geometry,xt=Lt.material,ze=Lt.group;if(xt.side===Di&&Nt.layers.test(ee.layers)){const $t=xt.side;xt.side=Nn,xt.needsUpdate=!0,_s(Nt,Z,ee,Vt,xt,ze),xt.side=$t,xt.needsUpdate=!0,tt=!0}}tt===!0&&(L.updateMultisampleRenderTarget(Ee),L.updateRenderTargetMipmap(Ee))}A.setRenderTarget(Te),A.setClearColor(Q,oe),Je!==void 0&&(ee.viewport=Je),A.toneMapping=Xe}function Ui(R,q,Z){const ee=q.isScene===!0?q.overrideMaterial:null;for(let X=0,Ee=R.length;X<Ee;X++){const Ie=R[X],Te=Ie.object,Xe=Ie.geometry,Je=ee===null?Ie.material:ee,tt=Ie.group;Te.layers.test(Z.layers)&&_s(Te,q,Z,Xe,Je,tt)}}function _s(R,q,Z,ee,X,Ee){R.onBeforeRender(A,q,Z,ee,X,Ee),R.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),X.onBeforeRender(A,q,Z,ee,R,Ee),X.transparent===!0&&X.side===Di&&X.forceSinglePass===!1?(X.side=Nn,X.needsUpdate=!0,A.renderBufferDirect(Z,q,ee,X,R,Ee),X.side=Fr,X.needsUpdate=!0,A.renderBufferDirect(Z,q,ee,X,R,Ee),X.side=Di):A.renderBufferDirect(Z,q,ee,X,R,Ee),R.onAfterRender(A,q,Z,ee,X,Ee)}function gs(R,q,Z){q.isScene!==!0&&(q=rt);const ee=nt.get(R),X=y.state.lights,Ee=y.state.shadowsArray,Ie=X.state.version,Te=Ke.getParameters(R,X.state,Ee,q,Z),Xe=Ke.getProgramCacheKey(Te);let Je=ee.programs;ee.environment=R.isMeshStandardMaterial?q.environment:null,ee.fog=q.fog,ee.envMap=(R.isMeshStandardMaterial?$:b).get(R.envMap||ee.environment),ee.envMapRotation=ee.environment!==null&&R.envMap===null?q.environmentRotation:R.envMapRotation,Je===void 0&&(R.addEventListener("dispose",pt),Je=new Map,ee.programs=Je);let tt=Je.get(Xe);if(tt!==void 0){if(ee.currentProgram===tt&&ee.lightsStateVersion===Ie)return Da(R,Te),tt}else Te.uniforms=Ke.getUniforms(R),R.onBeforeCompile(Te,A),tt=Ke.acquireProgram(Te,Xe),Je.set(Xe,tt),ee.uniforms=Te.uniforms;const je=ee.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(je.clippingPlanes=Me.uniform),Da(R,Te),ee.needsLights=Ia(R),ee.lightsStateVersion=Ie,ee.needsLights&&(je.ambientLightColor.value=X.state.ambient,je.lightProbe.value=X.state.probe,je.directionalLights.value=X.state.directional,je.directionalLightShadows.value=X.state.directionalShadow,je.spotLights.value=X.state.spot,je.spotLightShadows.value=X.state.spotShadow,je.rectAreaLights.value=X.state.rectArea,je.ltc_1.value=X.state.rectAreaLTC1,je.ltc_2.value=X.state.rectAreaLTC2,je.pointLights.value=X.state.point,je.pointLightShadows.value=X.state.pointShadow,je.hemisphereLights.value=X.state.hemi,je.directionalShadowMap.value=X.state.directionalShadowMap,je.directionalShadowMatrix.value=X.state.directionalShadowMatrix,je.spotShadowMap.value=X.state.spotShadowMap,je.spotLightMatrix.value=X.state.spotLightMatrix,je.spotLightMap.value=X.state.spotLightMap,je.pointShadowMap.value=X.state.pointShadowMap,je.pointShadowMatrix.value=X.state.pointShadowMatrix),ee.currentProgram=tt,ee.uniformsList=null,tt}function Pa(R){if(R.uniformsList===null){const q=R.currentProgram.getUniforms();R.uniformsList=gc.seqWithValue(q.seq,R.uniforms)}return R.uniformsList}function Da(R,q){const Z=nt.get(R);Z.outputColorSpace=q.outputColorSpace,Z.batching=q.batching,Z.batchingColor=q.batchingColor,Z.instancing=q.instancing,Z.instancingColor=q.instancingColor,Z.instancingMorph=q.instancingMorph,Z.skinning=q.skinning,Z.morphTargets=q.morphTargets,Z.morphNormals=q.morphNormals,Z.morphColors=q.morphColors,Z.morphTargetsCount=q.morphTargetsCount,Z.numClippingPlanes=q.numClippingPlanes,Z.numIntersection=q.numClipIntersection,Z.vertexAlphas=q.vertexAlphas,Z.vertexTangents=q.vertexTangents,Z.toneMapping=q.toneMapping}function ki(R,q,Z,ee,X){q.isScene!==!0&&(q=rt),L.resetTextureUnits();const Ee=q.fog,Ie=ee.isMeshStandardMaterial?q.environment:null,Te=I===null?A.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:Or,Xe=(ee.isMeshStandardMaterial?$:b).get(ee.envMap||Ie),Je=ee.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,tt=!!Z.attributes.tangent&&(!!ee.normalMap||ee.anisotropy>0),je=!!Z.morphAttributes.position,wt=!!Z.morphAttributes.normal,Lt=!!Z.morphAttributes.color;let Nt=kr;ee.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(Nt=A.toneMapping);const Vt=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,xt=Vt!==void 0?Vt.length:0,ze=nt.get(ee),$t=y.state.lights;if(J===!0&&(ce===!0||R!==ae)){const yn=R===ae&&ee.id===z;Me.setState(ee,R,yn)}let St=!1;ee.version===ze.__version?(ze.needsLights&&ze.lightsStateVersion!==$t.state.version||ze.outputColorSpace!==Te||X.isBatchedMesh&&ze.batching===!1||!X.isBatchedMesh&&ze.batching===!0||X.isBatchedMesh&&ze.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&ze.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&ze.instancing===!1||!X.isInstancedMesh&&ze.instancing===!0||X.isSkinnedMesh&&ze.skinning===!1||!X.isSkinnedMesh&&ze.skinning===!0||X.isInstancedMesh&&ze.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&ze.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&ze.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&ze.instancingMorph===!1&&X.morphTexture!==null||ze.envMap!==Xe||ee.fog===!0&&ze.fog!==Ee||ze.numClippingPlanes!==void 0&&(ze.numClippingPlanes!==Me.numPlanes||ze.numIntersection!==Me.numIntersection)||ze.vertexAlphas!==Je||ze.vertexTangents!==tt||ze.morphTargets!==je||ze.morphNormals!==wt||ze.morphColors!==Lt||ze.toneMapping!==Nt||ze.morphTargetsCount!==xt)&&(St=!0):(St=!0,ze.__version=ee.version);let Gn=ze.currentProgram;St===!0&&(Gn=gs(ee,q,X));let ci=!1,rn=!1,Fi=!1;const Ut=Gn.getUniforms(),Ti=ze.uniforms;if(et.useProgram(Gn.program)&&(ci=!0,rn=!0,Fi=!0),ee.id!==z&&(z=ee.id,rn=!0),ci||ae!==R){mt.reverseDepthBuffer?(ye.copy(R.projectionMatrix),Vy(ye),Hy(ye),Ut.setValue(B,"projectionMatrix",ye)):Ut.setValue(B,"projectionMatrix",R.projectionMatrix),Ut.setValue(B,"viewMatrix",R.matrixWorldInverse);const yn=Ut.map.cameraPosition;yn!==void 0&&yn.setValue(B,Pe.setFromMatrixPosition(R.matrixWorld)),mt.logarithmicDepthBuffer&&Ut.setValue(B,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(ee.isMeshPhongMaterial||ee.isMeshToonMaterial||ee.isMeshLambertMaterial||ee.isMeshBasicMaterial||ee.isMeshStandardMaterial||ee.isShaderMaterial)&&Ut.setValue(B,"isOrthographic",R.isOrthographicCamera===!0),ae!==R&&(ae=R,rn=!0,Fi=!0)}if(X.isSkinnedMesh){Ut.setOptional(B,X,"bindMatrix"),Ut.setOptional(B,X,"bindMatrixInverse");const yn=X.skeleton;yn&&(yn.boneTexture===null&&yn.computeBoneTexture(),Ut.setValue(B,"boneTexture",yn.boneTexture,L))}X.isBatchedMesh&&(Ut.setOptional(B,X,"batchingTexture"),Ut.setValue(B,"batchingTexture",X._matricesTexture,L),Ut.setOptional(B,X,"batchingIdTexture"),Ut.setValue(B,"batchingIdTexture",X._indirectTexture,L),Ut.setOptional(B,X,"batchingColorTexture"),X._colorsTexture!==null&&Ut.setValue(B,"batchingColorTexture",X._colorsTexture,L));const Ao=Z.morphAttributes;if((Ao.position!==void 0||Ao.normal!==void 0||Ao.color!==void 0)&&it.update(X,Z,Gn),(rn||ze.receiveShadow!==X.receiveShadow)&&(ze.receiveShadow=X.receiveShadow,Ut.setValue(B,"receiveShadow",X.receiveShadow)),ee.isMeshGouraudMaterial&&ee.envMap!==null&&(Ti.envMap.value=Xe,Ti.flipEnvMap.value=Xe.isCubeTexture&&Xe.isRenderTargetTexture===!1?-1:1),ee.isMeshStandardMaterial&&ee.envMap===null&&q.environment!==null&&(Ti.envMapIntensity.value=q.environmentIntensity),rn&&(Ut.setValue(B,"toneMappingExposure",A.toneMappingExposure),ze.needsLights&&La(Ti,Fi),Ee&&ee.fog===!0&&Ae.refreshFogUniforms(Ti,Ee),Ae.refreshMaterialUniforms(Ti,ee,le,ne,y.state.transmissionRenderTarget[R.id]),gc.upload(B,Pa(ze),Ti,L)),ee.isShaderMaterial&&ee.uniformsNeedUpdate===!0&&(gc.upload(B,Pa(ze),Ti,L),ee.uniformsNeedUpdate=!1),ee.isSpriteMaterial&&Ut.setValue(B,"center",X.center),Ut.setValue(B,"modelViewMatrix",X.modelViewMatrix),Ut.setValue(B,"normalMatrix",X.normalMatrix),Ut.setValue(B,"modelMatrix",X.matrixWorld),ee.isShaderMaterial||ee.isRawShaderMaterial){const yn=ee.uniformsGroups;for(let vs=0,bo=yn.length;vs<bo;vs++){const ar=yn[vs];W.update(ar,Gn),W.bind(ar,Gn)}}return Gn}function La(R,q){R.ambientLightColor.needsUpdate=q,R.lightProbe.needsUpdate=q,R.directionalLights.needsUpdate=q,R.directionalLightShadows.needsUpdate=q,R.pointLights.needsUpdate=q,R.pointLightShadows.needsUpdate=q,R.spotLights.needsUpdate=q,R.spotLightShadows.needsUpdate=q,R.rectAreaLights.needsUpdate=q,R.hemisphereLights.needsUpdate=q}function Ia(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(R,q,Z){nt.get(R.texture).__webglTexture=q,nt.get(R.depthTexture).__webglTexture=Z;const ee=nt.get(R);ee.__hasExternalTextures=!0,ee.__autoAllocateDepthBuffer=Z===void 0,ee.__autoAllocateDepthBuffer||dt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ee.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(R,q){const Z=nt.get(R);Z.__webglFramebuffer=q,Z.__useDefaultFramebuffer=q===void 0},this.setRenderTarget=function(R,q=0,Z=0){I=R,G=q,k=Z;let ee=!0,X=null,Ee=!1,Ie=!1;if(R){const Xe=nt.get(R);if(Xe.__useDefaultFramebuffer!==void 0)et.bindFramebuffer(B.FRAMEBUFFER,null),ee=!1;else if(Xe.__webglFramebuffer===void 0)L.setupRenderTarget(R);else if(Xe.__hasExternalTextures)L.rebindTextures(R,nt.get(R.texture).__webglTexture,nt.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const je=R.depthTexture;if(Xe.__boundDepthTexture!==je){if(je!==null&&nt.has(je)&&(R.width!==je.image.width||R.height!==je.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");L.setupDepthRenderbuffer(R)}}const Je=R.texture;(Je.isData3DTexture||Je.isDataArrayTexture||Je.isCompressedArrayTexture)&&(Ie=!0);const tt=nt.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(tt[q])?X=tt[q][Z]:X=tt[q],Ee=!0):R.samples>0&&L.useMultisampledRTT(R)===!1?X=nt.get(R).__webglMultisampledFramebuffer:Array.isArray(tt)?X=tt[Z]:X=tt,w.copy(R.viewport),P.copy(R.scissor),K=R.scissorTest}else w.copy(se).multiplyScalar(le).floor(),P.copy(F).multiplyScalar(le).floor(),K=ie;if(et.bindFramebuffer(B.FRAMEBUFFER,X)&&ee&&et.drawBuffers(R,X),et.viewport(w),et.scissor(P),et.setScissorTest(K),Ee){const Xe=nt.get(R.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+q,Xe.__webglTexture,Z)}else if(Ie){const Xe=nt.get(R.texture),Je=q||0;B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,Xe.__webglTexture,Z||0,Je)}z=-1},this.readRenderTargetPixels=function(R,q,Z,ee,X,Ee,Ie){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=nt.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ie!==void 0&&(Te=Te[Ie]),Te){et.bindFramebuffer(B.FRAMEBUFFER,Te);try{const Xe=R.texture,Je=Xe.format,tt=Xe.type;if(!mt.textureFormatReadable(Je)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!mt.textureTypeReadable(tt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}q>=0&&q<=R.width-ee&&Z>=0&&Z<=R.height-X&&B.readPixels(q,Z,ee,X,at.convert(Je),at.convert(tt),Ee)}finally{const Xe=I!==null?nt.get(I).__webglFramebuffer:null;et.bindFramebuffer(B.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(R,q,Z,ee,X,Ee,Ie){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=nt.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ie!==void 0&&(Te=Te[Ie]),Te){const Xe=R.texture,Je=Xe.format,tt=Xe.type;if(!mt.textureFormatReadable(Je))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!mt.textureTypeReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(q>=0&&q<=R.width-ee&&Z>=0&&Z<=R.height-X){et.bindFramebuffer(B.FRAMEBUFFER,Te);const je=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,je),B.bufferData(B.PIXEL_PACK_BUFFER,Ee.byteLength,B.STREAM_READ),B.readPixels(q,Z,ee,X,at.convert(Je),at.convert(tt),0);const wt=I!==null?nt.get(I).__webglFramebuffer:null;et.bindFramebuffer(B.FRAMEBUFFER,wt);const Lt=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await zy(B,Lt,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,je),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,Ee),B.deleteBuffer(je),B.deleteSync(Lt),Ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(R,q=null,Z=0){R.isTexture!==!0&&(_c("WebGLRenderer: copyFramebufferToTexture function signature has changed."),q=arguments[0]||null,R=arguments[1]);const ee=Math.pow(2,-Z),X=Math.floor(R.image.width*ee),Ee=Math.floor(R.image.height*ee),Ie=q!==null?q.x:0,Te=q!==null?q.y:0;L.setTexture2D(R,0),B.copyTexSubImage2D(B.TEXTURE_2D,Z,0,0,Ie,Te,X,Ee),et.unbindTexture()},this.copyTextureToTexture=function(R,q,Z=null,ee=null,X=0){R.isTexture!==!0&&(_c("WebGLRenderer: copyTextureToTexture function signature has changed."),ee=arguments[0]||null,R=arguments[1],q=arguments[2],X=arguments[3]||0,Z=null);let Ee,Ie,Te,Xe,Je,tt;Z!==null?(Ee=Z.max.x-Z.min.x,Ie=Z.max.y-Z.min.y,Te=Z.min.x,Xe=Z.min.y):(Ee=R.image.width,Ie=R.image.height,Te=0,Xe=0),ee!==null?(Je=ee.x,tt=ee.y):(Je=0,tt=0);const je=at.convert(q.format),wt=at.convert(q.type);L.setTexture2D(q,0),B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,q.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,q.unpackAlignment);const Lt=B.getParameter(B.UNPACK_ROW_LENGTH),Nt=B.getParameter(B.UNPACK_IMAGE_HEIGHT),Vt=B.getParameter(B.UNPACK_SKIP_PIXELS),xt=B.getParameter(B.UNPACK_SKIP_ROWS),ze=B.getParameter(B.UNPACK_SKIP_IMAGES),$t=R.isCompressedTexture?R.mipmaps[X]:R.image;B.pixelStorei(B.UNPACK_ROW_LENGTH,$t.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,$t.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Te),B.pixelStorei(B.UNPACK_SKIP_ROWS,Xe),R.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,X,Je,tt,Ee,Ie,je,wt,$t.data):R.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,X,Je,tt,$t.width,$t.height,je,$t.data):B.texSubImage2D(B.TEXTURE_2D,X,Je,tt,Ee,Ie,je,wt,$t),B.pixelStorei(B.UNPACK_ROW_LENGTH,Lt),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Nt),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Vt),B.pixelStorei(B.UNPACK_SKIP_ROWS,xt),B.pixelStorei(B.UNPACK_SKIP_IMAGES,ze),X===0&&q.generateMipmaps&&B.generateMipmap(B.TEXTURE_2D),et.unbindTexture()},this.copyTextureToTexture3D=function(R,q,Z=null,ee=null,X=0){R.isTexture!==!0&&(_c("WebGLRenderer: copyTextureToTexture3D function signature has changed."),Z=arguments[0]||null,ee=arguments[1]||null,R=arguments[2],q=arguments[3],X=arguments[4]||0);let Ee,Ie,Te,Xe,Je,tt,je,wt,Lt;const Nt=R.isCompressedTexture?R.mipmaps[X]:R.image;Z!==null?(Ee=Z.max.x-Z.min.x,Ie=Z.max.y-Z.min.y,Te=Z.max.z-Z.min.z,Xe=Z.min.x,Je=Z.min.y,tt=Z.min.z):(Ee=Nt.width,Ie=Nt.height,Te=Nt.depth,Xe=0,Je=0,tt=0),ee!==null?(je=ee.x,wt=ee.y,Lt=ee.z):(je=0,wt=0,Lt=0);const Vt=at.convert(q.format),xt=at.convert(q.type);let ze;if(q.isData3DTexture)L.setTexture3D(q,0),ze=B.TEXTURE_3D;else if(q.isDataArrayTexture||q.isCompressedArrayTexture)L.setTexture2DArray(q,0),ze=B.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,q.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,q.unpackAlignment);const $t=B.getParameter(B.UNPACK_ROW_LENGTH),St=B.getParameter(B.UNPACK_IMAGE_HEIGHT),Gn=B.getParameter(B.UNPACK_SKIP_PIXELS),ci=B.getParameter(B.UNPACK_SKIP_ROWS),rn=B.getParameter(B.UNPACK_SKIP_IMAGES);B.pixelStorei(B.UNPACK_ROW_LENGTH,Nt.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Nt.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Xe),B.pixelStorei(B.UNPACK_SKIP_ROWS,Je),B.pixelStorei(B.UNPACK_SKIP_IMAGES,tt),R.isDataTexture||R.isData3DTexture?B.texSubImage3D(ze,X,je,wt,Lt,Ee,Ie,Te,Vt,xt,Nt.data):q.isCompressedArrayTexture?B.compressedTexSubImage3D(ze,X,je,wt,Lt,Ee,Ie,Te,Vt,Nt.data):B.texSubImage3D(ze,X,je,wt,Lt,Ee,Ie,Te,Vt,xt,Nt),B.pixelStorei(B.UNPACK_ROW_LENGTH,$t),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,St),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Gn),B.pixelStorei(B.UNPACK_SKIP_ROWS,ci),B.pixelStorei(B.UNPACK_SKIP_IMAGES,rn),X===0&&q.generateMipmaps&&B.generateMipmap(ze),et.unbindTexture()},this.initRenderTarget=function(R){nt.get(R).__webglFramebuffer===void 0&&L.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?L.setTextureCube(R,0):R.isData3DTexture?L.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?L.setTexture2DArray(R,0):L.setTexture2D(R,0),et.unbindTexture()},this.resetState=function(){G=0,k=0,I=null,et.reset(),bt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Zi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===nf?"display-p3":"srgb",t.unpackColorSpace=Et.workingColorSpace===Cc?"display-p3":"srgb"}}class uf{constructor(e,t=1,r=1e3){this.isFog=!0,this.name="",this.color=new Ze(e),this.near=t,this.far=r}clone(){return new uf(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class V0 extends Ot{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ii,this.environmentIntensity=1,this.environmentRotation=new Ii,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Jw{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Oh,this.updateRanges=[],this.version=0,this.uuid=ir()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,r){e*=this.stride,r*=t.stride;for(let o=0,l=this.stride;o<l;o++)this.array[e+o]=t.array[r+o];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ir()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),r=new this.constructor(t,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ir()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Pn=new N;class Ec{constructor(e,t,r,o=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=r,this.normalized=o}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,r=this.data.count;t<r;t++)Pn.fromBufferAttribute(this,t),Pn.applyMatrix4(e),this.setXYZ(t,Pn.x,Pn.y,Pn.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)Pn.fromBufferAttribute(this,t),Pn.applyNormalMatrix(e),this.setXYZ(t,Pn.x,Pn.y,Pn.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)Pn.fromBufferAttribute(this,t),Pn.transformDirection(e),this.setXYZ(t,Pn.x,Pn.y,Pn.z);return this}getComponent(e,t){let r=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(r=Mi(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Pt(r,this.array)),this.data.array[e*this.data.stride+this.offset+t]=r,this}setX(e,t){return this.normalized&&(t=Pt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Mi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Mi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Mi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Mi(t,this.array)),t}setXY(e,t,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this}setXYZ(e,t,r,o){return e=e*this.data.stride+this.offset,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array),o=Pt(o,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this.data.array[e+2]=o,this}setXYZW(e,t,r,o,l){return e=e*this.data.stride+this.offset,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array),o=Pt(o,this.array),l=Pt(l,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this.data.array[e+2]=o,this.data.array[e+3]=l,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let r=0;r<this.count;r++){const o=r*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[o+l])}return new li(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Ec(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let r=0;r<this.count;r++){const o=r*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[o+l])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class H0 extends fs{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ze(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let to;const da=new N,no=new N,io=new N,ro=new Re,ha=new Re,G0=new Ct,nc=new N,fa=new N,ic=new N,H_=new Re,Gd=new Re,G_=new Re;class Zw extends Ot{constructor(e=new H0){if(super(),this.isSprite=!0,this.type="Sprite",to===void 0){to=new vn;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),r=new Jw(t,5);to.setIndex([0,1,2,0,2,3]),to.setAttribute("position",new Ec(r,3,0,!1)),to.setAttribute("uv",new Ec(r,2,3,!1))}this.geometry=to,this.material=e,this.center=new Re(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),no.setFromMatrixScale(this.matrixWorld),G0.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),io.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&no.multiplyScalar(-io.z);const r=this.material.rotation;let o,l;r!==0&&(l=Math.cos(r),o=Math.sin(r));const u=this.center;rc(nc.set(-.5,-.5,0),io,u,no,o,l),rc(fa.set(.5,-.5,0),io,u,no,o,l),rc(ic.set(.5,.5,0),io,u,no,o,l),H_.set(0,0),Gd.set(1,0),G_.set(1,1);let d=e.ray.intersectTriangle(nc,fa,ic,!1,da);if(d===null&&(rc(fa.set(-.5,.5,0),io,u,no,o,l),Gd.set(0,1),d=e.ray.intersectTriangle(nc,ic,fa,!1,da),d===null))return;const h=e.ray.origin.distanceTo(da);h<e.near||h>e.far||t.push({distance:h,point:da.clone(),uv:ai.getInterpolation(da,nc,fa,ic,H_,Gd,G_,new Re),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function rc(s,e,t,r,o,l){ro.subVectors(s,t).addScalar(.5).multiply(r),o!==void 0?(ha.x=l*ro.x-o*ro.y,ha.y=o*ro.x+l*ro.y):ha.copy(ro),s.copy(e),s.x+=ha.x,s.y+=ha.y,s.applyMatrix4(G0)}class eE extends bn{constructor(e=null,t=1,r=1,o,l,u,d,h,p=Vn,m=Vn,g,v){super(null,u,d,h,p,m,o,l,g,v),this.isDataTexture=!0,this.image={data:e,width:t,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Vh extends li{constructor(e,t,r,o=1){super(e,t,r),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=o}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const so=new Ct,W_=new Ct,sc=[],q_=new hs,tE=new Ct,pa=new Ne,ma=new So;class Ur extends Ne{constructor(e,t,r){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Vh(new Float32Array(r*16),16),this.instanceColor=null,this.morphTexture=null,this.count=r,this.boundingBox=null,this.boundingSphere=null;for(let o=0;o<r;o++)this.setMatrixAt(o,tE)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new hs),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let r=0;r<t;r++)this.getMatrixAt(r,so),q_.copy(e.boundingBox).applyMatrix4(so),this.boundingBox.union(q_)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new So),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let r=0;r<t;r++)this.getMatrixAt(r,so),ma.copy(e.boundingSphere).applyMatrix4(so),this.boundingSphere.union(ma)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const r=t.morphTargetInfluences,o=this.morphTexture.source.data.data,l=r.length+1,u=e*l+1;for(let d=0;d<r.length;d++)r[d]=o[u+d]}raycast(e,t){const r=this.matrixWorld,o=this.count;if(pa.geometry=this.geometry,pa.material=this.material,pa.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ma.copy(this.boundingSphere),ma.applyMatrix4(r),e.ray.intersectsSphere(ma)!==!1))for(let l=0;l<o;l++){this.getMatrixAt(l,so),W_.multiplyMatrices(r,so),pa.matrixWorld=W_,pa.raycast(e,sc);for(let u=0,d=sc.length;u<d;u++){const h=sc[u];h.instanceId=l,h.object=this,t.push(h)}sc.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Vh(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const r=t.morphTargetInfluences,o=r.length+1;this.morphTexture===null&&(this.morphTexture=new eE(new Float32Array(o*this.count),o,this.count,Jh,Li));const l=this.morphTexture.source.data.data;let u=0;for(let p=0;p<r.length;p++)u+=r[p];const d=this.geometry.morphTargetsRelative?1:1-u,h=o*e;l[h]=d,l.set(r,h+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class W0 extends fs{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ze(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Tc=new N,Ac=new N,X_=new Ct,_a=new sf,oc=new So,Wd=new N,j_=new N;class nE extends Ot{constructor(e=new vn,t=new W0){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,r=[0];for(let o=1,l=t.count;o<l;o++)Tc.fromBufferAttribute(t,o-1),Ac.fromBufferAttribute(t,o),r[o]=r[o-1],r[o]+=Tc.distanceTo(Ac);e.setAttribute("lineDistance",new At(r,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const r=this.geometry,o=this.matrixWorld,l=e.params.Line.threshold,u=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),oc.copy(r.boundingSphere),oc.applyMatrix4(o),oc.radius+=l,e.ray.intersectsSphere(oc)===!1)return;X_.copy(o).invert(),_a.copy(e.ray).applyMatrix4(X_);const d=l/((this.scale.x+this.scale.y+this.scale.z)/3),h=d*d,p=this.isLineSegments?2:1,m=r.index,v=r.attributes.position;if(m!==null){const S=Math.max(0,u.start),M=Math.min(m.count,u.start+u.count);for(let E=S,y=M-1;E<y;E+=p){const x=m.getX(E),C=m.getX(E+1),A=ac(this,e,_a,h,x,C);A&&t.push(A)}if(this.isLineLoop){const E=m.getX(M-1),y=m.getX(S),x=ac(this,e,_a,h,E,y);x&&t.push(x)}}else{const S=Math.max(0,u.start),M=Math.min(v.count,u.start+u.count);for(let E=S,y=M-1;E<y;E+=p){const x=ac(this,e,_a,h,E,E+1);x&&t.push(x)}if(this.isLineLoop){const E=ac(this,e,_a,h,M-1,S);E&&t.push(E)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const o=t[r[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,u=o.length;l<u;l++){const d=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}}function ac(s,e,t,r,o,l){const u=s.geometry.attributes.position;if(Tc.fromBufferAttribute(u,o),Ac.fromBufferAttribute(u,l),t.distanceSqToSegment(Tc,Ac,Wd,j_)>r)return;Wd.applyMatrix4(s.matrixWorld);const h=e.ray.origin.distanceTo(Wd);if(!(h<e.near||h>e.far))return{distance:h,point:j_.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}const Y_=new N,K_=new N;class iE extends nE{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,r=[];for(let o=0,l=t.count;o<l;o+=2)Y_.fromBufferAttribute(t,o),K_.fromBufferAttribute(t,o+1),r[o]=o===0?0:r[o-1],r[o+1]=r[o]+Y_.distanceTo(K_);e.setAttribute("lineDistance",new At(r,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class rE extends bn{constructor(e,t,r,o,l,u,d,h,p){super(e,t,r,o,l,u,d,h,p),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ni{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const r=this.getUtoTmapping(e);return this.getPoint(r,t)}getPoints(e=5){const t=[];for(let r=0;r<=e;r++)t.push(this.getPoint(r/e));return t}getSpacedPoints(e=5){const t=[];for(let r=0;r<=e;r++)t.push(this.getPointAt(r/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let r,o=this.getPoint(0),l=0;t.push(0);for(let u=1;u<=e;u++)r=this.getPoint(u/e),l+=r.distanceTo(o),t.push(l),o=r;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const r=this.getLengths();let o=0;const l=r.length;let u;t?u=t:u=e*r[l-1];let d=0,h=l-1,p;for(;d<=h;)if(o=Math.floor(d+(h-d)/2),p=r[o]-u,p<0)d=o+1;else if(p>0)h=o-1;else{h=o;break}if(o=h,r[o]===u)return o/(l-1);const m=r[o],v=r[o+1]-m,S=(u-m)/v;return(o+S)/(l-1)}getTangent(e,t){let o=e-1e-4,l=e+1e-4;o<0&&(o=0),l>1&&(l=1);const u=this.getPoint(o),d=this.getPoint(l),h=t||(u.isVector2?new Re:new N);return h.copy(d).sub(u).normalize(),h}getTangentAt(e,t){const r=this.getUtoTmapping(e);return this.getTangent(r,t)}computeFrenetFrames(e,t){const r=new N,o=[],l=[],u=[],d=new N,h=new Ct;for(let S=0;S<=e;S++){const M=S/e;o[S]=this.getTangentAt(M,new N)}l[0]=new N,u[0]=new N;let p=Number.MAX_VALUE;const m=Math.abs(o[0].x),g=Math.abs(o[0].y),v=Math.abs(o[0].z);m<=p&&(p=m,r.set(1,0,0)),g<=p&&(p=g,r.set(0,1,0)),v<=p&&r.set(0,0,1),d.crossVectors(o[0],r).normalize(),l[0].crossVectors(o[0],d),u[0].crossVectors(o[0],l[0]);for(let S=1;S<=e;S++){if(l[S]=l[S-1].clone(),u[S]=u[S-1].clone(),d.crossVectors(o[S-1],o[S]),d.length()>Number.EPSILON){d.normalize();const M=Math.acos(un(o[S-1].dot(o[S]),-1,1));l[S].applyMatrix4(h.makeRotationAxis(d,M))}u[S].crossVectors(o[S],l[S])}if(t===!0){let S=Math.acos(un(l[0].dot(l[e]),-1,1));S/=e,o[0].dot(d.crossVectors(l[0],l[e]))>0&&(S=-S);for(let M=1;M<=e;M++)l[M].applyMatrix4(h.makeRotationAxis(o[M],S*M)),u[M].crossVectors(o[M],l[M])}return{tangents:o,normals:l,binormals:u}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class q0 extends Ni{constructor(e=0,t=0,r=1,o=1,l=0,u=Math.PI*2,d=!1,h=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=r,this.yRadius=o,this.aStartAngle=l,this.aEndAngle=u,this.aClockwise=d,this.aRotation=h}getPoint(e,t=new Re){const r=t,o=Math.PI*2;let l=this.aEndAngle-this.aStartAngle;const u=Math.abs(l)<Number.EPSILON;for(;l<0;)l+=o;for(;l>o;)l-=o;l<Number.EPSILON&&(u?l=0:l=o),this.aClockwise===!0&&!u&&(l===o?l=-o:l=l-o);const d=this.aStartAngle+e*l;let h=this.aX+this.xRadius*Math.cos(d),p=this.aY+this.yRadius*Math.sin(d);if(this.aRotation!==0){const m=Math.cos(this.aRotation),g=Math.sin(this.aRotation),v=h-this.aX,S=p-this.aY;h=v*m-S*g+this.aX,p=v*g+S*m+this.aY}return r.set(h,p)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class sE extends q0{constructor(e,t,r,o,l,u){super(e,t,r,r,o,l,u),this.isArcCurve=!0,this.type="ArcCurve"}}function df(){let s=0,e=0,t=0,r=0;function o(l,u,d,h){s=l,e=d,t=-3*l+3*u-2*d-h,r=2*l-2*u+d+h}return{initCatmullRom:function(l,u,d,h,p){o(u,d,p*(d-l),p*(h-u))},initNonuniformCatmullRom:function(l,u,d,h,p,m,g){let v=(u-l)/p-(d-l)/(p+m)+(d-u)/m,S=(d-u)/m-(h-u)/(m+g)+(h-d)/g;v*=m,S*=m,o(u,d,v,S)},calc:function(l){const u=l*l,d=u*l;return s+e*l+t*u+r*d}}}const lc=new N,qd=new df,Xd=new df,jd=new df;class Aa extends Ni{constructor(e=[],t=!1,r="centripetal",o=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=r,this.tension=o}getPoint(e,t=new N){const r=t,o=this.points,l=o.length,u=(l-(this.closed?0:1))*e;let d=Math.floor(u),h=u-d;this.closed?d+=d>0?0:(Math.floor(Math.abs(d)/l)+1)*l:h===0&&d===l-1&&(d=l-2,h=1);let p,m;this.closed||d>0?p=o[(d-1)%l]:(lc.subVectors(o[0],o[1]).add(o[0]),p=lc);const g=o[d%l],v=o[(d+1)%l];if(this.closed||d+2<l?m=o[(d+2)%l]:(lc.subVectors(o[l-1],o[l-2]).add(o[l-1]),m=lc),this.curveType==="centripetal"||this.curveType==="chordal"){const S=this.curveType==="chordal"?.5:.25;let M=Math.pow(p.distanceToSquared(g),S),E=Math.pow(g.distanceToSquared(v),S),y=Math.pow(v.distanceToSquared(m),S);E<1e-4&&(E=1),M<1e-4&&(M=E),y<1e-4&&(y=E),qd.initNonuniformCatmullRom(p.x,g.x,v.x,m.x,M,E,y),Xd.initNonuniformCatmullRom(p.y,g.y,v.y,m.y,M,E,y),jd.initNonuniformCatmullRom(p.z,g.z,v.z,m.z,M,E,y)}else this.curveType==="catmullrom"&&(qd.initCatmullRom(p.x,g.x,v.x,m.x,this.tension),Xd.initCatmullRom(p.y,g.y,v.y,m.y,this.tension),jd.initCatmullRom(p.z,g.z,v.z,m.z,this.tension));return r.set(qd.calc(h),Xd.calc(h),jd.calc(h)),r}copy(e){super.copy(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const o=e.points[t];this.points.push(o.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,r=this.points.length;t<r;t++){const o=this.points[t];e.points.push(o.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const o=e.points[t];this.points.push(new N().fromArray(o))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function $_(s,e,t,r,o){const l=(r-e)*.5,u=(o-t)*.5,d=s*s,h=s*d;return(2*t-2*r+l+u)*h+(-3*t+3*r-2*l-u)*d+l*s+t}function oE(s,e){const t=1-s;return t*t*e}function aE(s,e){return 2*(1-s)*s*e}function lE(s,e){return s*s*e}function Sa(s,e,t,r){return oE(s,e)+aE(s,t)+lE(s,r)}function cE(s,e){const t=1-s;return t*t*t*e}function uE(s,e){const t=1-s;return 3*t*t*s*e}function dE(s,e){return 3*(1-s)*s*s*e}function hE(s,e){return s*s*s*e}function Ma(s,e,t,r,o){return cE(s,e)+uE(s,t)+dE(s,r)+hE(s,o)}class fE extends Ni{constructor(e=new Re,t=new Re,r=new Re,o=new Re){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=r,this.v3=o}getPoint(e,t=new Re){const r=t,o=this.v0,l=this.v1,u=this.v2,d=this.v3;return r.set(Ma(e,o.x,l.x,u.x,d.x),Ma(e,o.y,l.y,u.y,d.y)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class pE extends Ni{constructor(e=new N,t=new N,r=new N,o=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=r,this.v3=o}getPoint(e,t=new N){const r=t,o=this.v0,l=this.v1,u=this.v2,d=this.v3;return r.set(Ma(e,o.x,l.x,u.x,d.x),Ma(e,o.y,l.y,u.y,d.y),Ma(e,o.z,l.z,u.z,d.z)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class mE extends Ni{constructor(e=new Re,t=new Re){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Re){const r=t;return e===1?r.copy(this.v2):(r.copy(this.v2).sub(this.v1),r.multiplyScalar(e).add(this.v1)),r}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Re){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class _E extends Ni{constructor(e=new N,t=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new N){const r=t;return e===1?r.copy(this.v2):(r.copy(this.v2).sub(this.v1),r.multiplyScalar(e).add(this.v1)),r}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new N){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class gE extends Ni{constructor(e=new Re,t=new Re,r=new Re){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=r}getPoint(e,t=new Re){const r=t,o=this.v0,l=this.v1,u=this.v2;return r.set(Sa(e,o.x,l.x,u.x),Sa(e,o.y,l.y,u.y)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class X0 extends Ni{constructor(e=new N,t=new N,r=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=r}getPoint(e,t=new N){const r=t,o=this.v0,l=this.v1,u=this.v2;return r.set(Sa(e,o.x,l.x,u.x),Sa(e,o.y,l.y,u.y),Sa(e,o.z,l.z,u.z)),r}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class vE extends Ni{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Re){const r=t,o=this.points,l=(o.length-1)*e,u=Math.floor(l),d=l-u,h=o[u===0?u:u-1],p=o[u],m=o[u>o.length-2?o.length-1:u+1],g=o[u>o.length-3?o.length-1:u+2];return r.set($_(d,h.x,p.x,m.x,g.x),$_(d,h.y,p.y,m.y,g.y)),r}copy(e){super.copy(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const o=e.points[t];this.points.push(o.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,r=this.points.length;t<r;t++){const o=this.points[t];e.points.push(o.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const o=e.points[t];this.points.push(new Re().fromArray(o))}return this}}var yE=Object.freeze({__proto__:null,ArcCurve:sE,CatmullRomCurve3:Aa,CubicBezierCurve:fE,CubicBezierCurve3:pE,EllipseCurve:q0,LineCurve:mE,LineCurve3:_E,QuadraticBezierCurve:gE,QuadraticBezierCurve3:X0,SplineCurve:vE});class hf extends vn{constructor(e=1,t=32,r=0,o=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:r,thetaLength:o},t=Math.max(3,t);const l=[],u=[],d=[],h=[],p=new N,m=new Re;u.push(0,0,0),d.push(0,0,1),h.push(.5,.5);for(let g=0,v=3;g<=t;g++,v+=3){const S=r+g/t*o;p.x=e*Math.cos(S),p.y=e*Math.sin(S),u.push(p.x,p.y,p.z),d.push(0,0,1),m.x=(u[v]/e+1)/2,m.y=(u[v+1]/e+1)/2,h.push(m.x,m.y)}for(let g=1;g<=t;g++)l.push(g,g+1,0);this.setIndex(l),this.setAttribute("position",new At(u,3)),this.setAttribute("normal",new At(d,3)),this.setAttribute("uv",new At(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new hf(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class gn extends vn{constructor(e=1,t=1,r=1,o=32,l=1,u=!1,d=0,h=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:r,radialSegments:o,heightSegments:l,openEnded:u,thetaStart:d,thetaLength:h};const p=this;o=Math.floor(o),l=Math.floor(l);const m=[],g=[],v=[],S=[];let M=0;const E=[],y=r/2;let x=0;C(),u===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(m),this.setAttribute("position",new At(g,3)),this.setAttribute("normal",new At(v,3)),this.setAttribute("uv",new At(S,2));function C(){const D=new N,G=new N;let k=0;const I=(t-e)/r;for(let z=0;z<=l;z++){const ae=[],w=z/l,P=w*(t-e)+e;for(let K=0;K<=o;K++){const Q=K/o,oe=Q*h+d,he=Math.sin(oe),ne=Math.cos(oe);G.x=P*he,G.y=-w*r+y,G.z=P*ne,g.push(G.x,G.y,G.z),D.set(he,I,ne).normalize(),v.push(D.x,D.y,D.z),S.push(Q,1-w),ae.push(M++)}E.push(ae)}for(let z=0;z<o;z++)for(let ae=0;ae<l;ae++){const w=E[ae][z],P=E[ae+1][z],K=E[ae+1][z+1],Q=E[ae][z+1];e>0&&(m.push(w,P,Q),k+=3),t>0&&(m.push(P,K,Q),k+=3)}p.addGroup(x,k,0),x+=k}function A(D){const G=M,k=new Re,I=new N;let z=0;const ae=D===!0?e:t,w=D===!0?1:-1;for(let K=1;K<=o;K++)g.push(0,y*w,0),v.push(0,w,0),S.push(.5,.5),M++;const P=M;for(let K=0;K<=o;K++){const oe=K/o*h+d,he=Math.cos(oe),ne=Math.sin(oe);I.x=ae*ne,I.y=y*w,I.z=ae*he,g.push(I.x,I.y,I.z),v.push(0,w,0),k.x=he*.5+.5,k.y=ne*.5*w+.5,S.push(k.x,k.y),M++}for(let K=0;K<o;K++){const Q=G+K,oe=P+K;D===!0?m.push(oe,oe+1,Q):m.push(oe+1,oe,Q),z+=3}p.addGroup(x,z,D===!0?1:2),x+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ff extends gn{constructor(e=1,t=1,r=32,o=1,l=!1,u=0,d=Math.PI*2){super(0,e,t,r,o,l,u,d),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:r,heightSegments:o,openEnded:l,thetaStart:u,thetaLength:d}}static fromJSON(e){return new ff(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class pf extends vn{constructor(e=[],t=[],r=1,o=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:r,detail:o};const l=[],u=[];d(o),p(r),m(),this.setAttribute("position",new At(l,3)),this.setAttribute("normal",new At(l.slice(),3)),this.setAttribute("uv",new At(u,2)),o===0?this.computeVertexNormals():this.normalizeNormals();function d(C){const A=new N,D=new N,G=new N;for(let k=0;k<t.length;k+=3)S(t[k+0],A),S(t[k+1],D),S(t[k+2],G),h(A,D,G,C)}function h(C,A,D,G){const k=G+1,I=[];for(let z=0;z<=k;z++){I[z]=[];const ae=C.clone().lerp(D,z/k),w=A.clone().lerp(D,z/k),P=k-z;for(let K=0;K<=P;K++)K===0&&z===k?I[z][K]=ae:I[z][K]=ae.clone().lerp(w,K/P)}for(let z=0;z<k;z++)for(let ae=0;ae<2*(k-z)-1;ae++){const w=Math.floor(ae/2);ae%2===0?(v(I[z][w+1]),v(I[z+1][w]),v(I[z][w])):(v(I[z][w+1]),v(I[z+1][w+1]),v(I[z+1][w]))}}function p(C){const A=new N;for(let D=0;D<l.length;D+=3)A.x=l[D+0],A.y=l[D+1],A.z=l[D+2],A.normalize().multiplyScalar(C),l[D+0]=A.x,l[D+1]=A.y,l[D+2]=A.z}function m(){const C=new N;for(let A=0;A<l.length;A+=3){C.x=l[A+0],C.y=l[A+1],C.z=l[A+2];const D=y(C)/2/Math.PI+.5,G=x(C)/Math.PI+.5;u.push(D,1-G)}M(),g()}function g(){for(let C=0;C<u.length;C+=6){const A=u[C+0],D=u[C+2],G=u[C+4],k=Math.max(A,D,G),I=Math.min(A,D,G);k>.9&&I<.1&&(A<.2&&(u[C+0]+=1),D<.2&&(u[C+2]+=1),G<.2&&(u[C+4]+=1))}}function v(C){l.push(C.x,C.y,C.z)}function S(C,A){const D=C*3;A.x=e[D+0],A.y=e[D+1],A.z=e[D+2]}function M(){const C=new N,A=new N,D=new N,G=new N,k=new Re,I=new Re,z=new Re;for(let ae=0,w=0;ae<l.length;ae+=9,w+=6){C.set(l[ae+0],l[ae+1],l[ae+2]),A.set(l[ae+3],l[ae+4],l[ae+5]),D.set(l[ae+6],l[ae+7],l[ae+8]),k.set(u[w+0],u[w+1]),I.set(u[w+2],u[w+3]),z.set(u[w+4],u[w+5]),G.copy(C).add(A).add(D).divideScalar(3);const P=y(G);E(k,w+0,C,P),E(I,w+2,A,P),E(z,w+4,D,P)}}function E(C,A,D,G){G<0&&C.x===1&&(u[A]=C.x-1),D.x===0&&D.z===0&&(u[A]=G/2/Math.PI+.5)}function y(C){return Math.atan2(C.z,-C.x)}function x(C){return Math.atan2(-C.y,Math.sqrt(C.x*C.x+C.z*C.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new pf(e.vertices,e.indices,e.radius,e.details)}}class mf extends pf{constructor(e=1,t=0){const r=(1+Math.sqrt(5))/2,o=[-1,r,0,1,r,0,-1,-r,0,1,-r,0,0,-1,r,0,1,r,0,-1,-r,0,1,-r,r,0,-1,r,0,1,-r,0,-1,-r,0,1],l=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(o,l,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new mf(e.radius,e.detail)}}class Ca extends vn{constructor(e=1,t=32,r=16,o=0,l=Math.PI*2,u=0,d=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:r,phiStart:o,phiLength:l,thetaStart:u,thetaLength:d},t=Math.max(3,Math.floor(t)),r=Math.max(2,Math.floor(r));const h=Math.min(u+d,Math.PI);let p=0;const m=[],g=new N,v=new N,S=[],M=[],E=[],y=[];for(let x=0;x<=r;x++){const C=[],A=x/r;let D=0;x===0&&u===0?D=.5/t:x===r&&h===Math.PI&&(D=-.5/t);for(let G=0;G<=t;G++){const k=G/t;g.x=-e*Math.cos(o+k*l)*Math.sin(u+A*d),g.y=e*Math.cos(u+A*d),g.z=e*Math.sin(o+k*l)*Math.sin(u+A*d),M.push(g.x,g.y,g.z),v.copy(g).normalize(),E.push(v.x,v.y,v.z),y.push(k+D,1-A),C.push(p++)}m.push(C)}for(let x=0;x<r;x++)for(let C=0;C<t;C++){const A=m[x][C+1],D=m[x][C],G=m[x+1][C],k=m[x+1][C+1];(x!==0||u>0)&&S.push(A,D,k),(x!==r-1||h<Math.PI)&&S.push(D,G,k)}this.setIndex(S),this.setAttribute("position",new At(M,3)),this.setAttribute("normal",new At(E,3)),this.setAttribute("uv",new At(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ca(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Pc extends vn{constructor(e=1,t=.4,r=12,o=48,l=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:r,tubularSegments:o,arc:l},r=Math.floor(r),o=Math.floor(o);const u=[],d=[],h=[],p=[],m=new N,g=new N,v=new N;for(let S=0;S<=r;S++)for(let M=0;M<=o;M++){const E=M/o*l,y=S/r*Math.PI*2;g.x=(e+t*Math.cos(y))*Math.cos(E),g.y=(e+t*Math.cos(y))*Math.sin(E),g.z=t*Math.sin(y),d.push(g.x,g.y,g.z),m.x=e*Math.cos(E),m.y=e*Math.sin(E),v.subVectors(g,m).normalize(),h.push(v.x,v.y,v.z),p.push(M/o),p.push(S/r)}for(let S=1;S<=r;S++)for(let M=1;M<=o;M++){const E=(o+1)*S+M-1,y=(o+1)*(S-1)+M-1,x=(o+1)*(S-1)+M,C=(o+1)*S+M;u.push(E,y,C),u.push(y,x,C)}this.setIndex(u),this.setAttribute("position",new At(d,3)),this.setAttribute("normal",new At(h,3)),this.setAttribute("uv",new At(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pc(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class vo extends vn{constructor(e=new X0(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),t=64,r=1,o=8,l=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:r,radialSegments:o,closed:l};const u=e.computeFrenetFrames(t,l);this.tangents=u.tangents,this.normals=u.normals,this.binormals=u.binormals;const d=new N,h=new N,p=new Re;let m=new N;const g=[],v=[],S=[],M=[];E(),this.setIndex(M),this.setAttribute("position",new At(g,3)),this.setAttribute("normal",new At(v,3)),this.setAttribute("uv",new At(S,2));function E(){for(let A=0;A<t;A++)y(A);y(l===!1?t:0),C(),x()}function y(A){m=e.getPointAt(A/t,m);const D=u.normals[A],G=u.binormals[A];for(let k=0;k<=o;k++){const I=k/o*Math.PI*2,z=Math.sin(I),ae=-Math.cos(I);h.x=ae*D.x+z*G.x,h.y=ae*D.y+z*G.y,h.z=ae*D.z+z*G.z,h.normalize(),v.push(h.x,h.y,h.z),d.x=m.x+r*h.x,d.y=m.y+r*h.y,d.z=m.z+r*h.z,g.push(d.x,d.y,d.z)}}function x(){for(let A=1;A<=t;A++)for(let D=1;D<=o;D++){const G=(o+1)*(A-1)+(D-1),k=(o+1)*A+(D-1),I=(o+1)*A+D,z=(o+1)*(A-1)+D;M.push(G,k,z),M.push(k,I,z)}}function C(){for(let A=0;A<=t;A++)for(let D=0;D<=o;D++)p.x=A/t,p.y=D/o,S.push(p.x,p.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new vo(new yE[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class xE extends In{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class We extends fs{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=E0,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class vc extends We{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Re(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return un(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ze(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ze(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ze(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class _f extends Ot{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ze(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Yd=new Ct,Q_=new N,J_=new N;class j0{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Re(512,512),this.map=null,this.mapPass=null,this.matrix=new Ct,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new af,this._frameExtents=new Re(1,1),this._viewportCount=1,this._viewports=[new It(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,r=this.matrix;Q_.setFromMatrixPosition(e.matrixWorld),t.position.copy(Q_),J_.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(J_),t.updateMatrixWorld(),Yd.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yd),r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(Yd)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Z_=new Ct,ga=new N,Kd=new N;class SE extends j0{constructor(){super(new $n(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Re(4,2),this._viewportCount=6,this._viewports=[new It(2,1,1,1),new It(0,1,1,1),new It(3,1,1,1),new It(1,1,1,1),new It(3,0,1,1),new It(1,0,1,1)],this._cubeDirections=[new N(1,0,0),new N(-1,0,0),new N(0,0,1),new N(0,0,-1),new N(0,1,0),new N(0,-1,0)],this._cubeUps=[new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,1,0),new N(0,0,1),new N(0,0,-1)]}updateMatrices(e,t=0){const r=this.camera,o=this.matrix,l=e.distance||r.far;l!==r.far&&(r.far=l,r.updateProjectionMatrix()),ga.setFromMatrixPosition(e.matrixWorld),r.position.copy(ga),Kd.copy(r.position),Kd.add(this._cubeDirections[t]),r.up.copy(this._cubeUps[t]),r.lookAt(Kd),r.updateMatrixWorld(),o.makeTranslation(-ga.x,-ga.y,-ga.z),Z_.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Z_)}}class Ra extends _f{constructor(e,t,r=0,o=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=r,this.decay=o,this.shadow=new SE}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class ME extends j0{constructor(){super(new lf(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class $d extends _f{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ot.DEFAULT_UP),this.updateMatrix(),this.target=new Ot,this.shadow=new ME}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class wE extends _f{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Y0{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=e0(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=e0();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function e0(){return performance.now()}const t0=new Ct;class EE{constructor(e,t,r=0,o=1/0){this.ray=new sf(e,t),this.near=r,this.far=o,this.camera=null,this.layers=new of,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return t0.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(t0),this}intersectObject(e,t=!0,r=[]){return Hh(e,this,r,t),r.sort(n0),r}intersectObjects(e,t=!0,r=[]){for(let o=0,l=e.length;o<l;o++)Hh(e[o],this,r,t);return r.sort(n0),r}}function n0(s,e){return s.distance-e.distance}function Hh(s,e,t,r){let o=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(o=!1),o===!0&&r===!0){const l=s.children;for(let u=0,d=l.length;u<d;u++)Hh(l[u],e,t,!0)}}class TE extends iE{constructor(e=10,t=10,r=4473924,o=8947848){r=new Ze(r),o=new Ze(o);const l=t/2,u=e/t,d=e/2,h=[],p=[];for(let v=0,S=0,M=-d;v<=t;v++,M+=u){h.push(-d,0,M,d,0,M),h.push(M,0,-d,M,0,d);const E=v===l?r:o;E.toArray(p,S),S+=3,E.toArray(p,S),S+=3,E.toArray(p,S),S+=3,E.toArray(p,S),S+=3}const m=new vn;m.setAttribute("position",new At(h,3)),m.setAttribute("color",new At(p,3));const g=new W0({vertexColors:!0,toneMapped:!1});super(m,g),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:jh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=jh);const K0={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Eo{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const AE=new lf(-1,1,1,-1,0,1);class bE extends vn{constructor(){super(),this.setAttribute("position",new At([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new At([0,2,0,0,2,0],2))}}const CE=new bE;class gf{constructor(e){this._mesh=new Ne(CE,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,AE)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class RE extends Eo{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof In?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Ta.clone(e.uniforms),this.material=new In({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new gf(this.material)}render(e,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class i0 extends Eo{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,r){const o=e.getContext(),l=e.state;l.buffers.color.setMask(!1),l.buffers.depth.setMask(!1),l.buffers.color.setLocked(!0),l.buffers.depth.setLocked(!0);let u,d;this.inverse?(u=0,d=1):(u=1,d=0),l.buffers.stencil.setTest(!0),l.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),l.buffers.stencil.setFunc(o.ALWAYS,u,4294967295),l.buffers.stencil.setClear(d),l.buffers.stencil.setLocked(!0),e.setRenderTarget(r),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),l.buffers.color.setLocked(!1),l.buffers.depth.setLocked(!1),l.buffers.color.setMask(!0),l.buffers.depth.setMask(!0),l.buffers.stencil.setLocked(!1),l.buffers.stencil.setFunc(o.EQUAL,1,4294967295),l.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),l.buffers.stencil.setLocked(!0)}}class PE extends Eo{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class DE{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const r=e.getSize(new Re);this._width=r.width,this._height=r.height,t=new Ei(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:nr}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new RE(K0),this.copyPass.material.blending=tr,this.clock=new Y0}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let r=!1;for(let o=0,l=this.passes.length;o<l;o++){const u=this.passes[o];if(u.enabled!==!1){if(u.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),u.render(this.renderer,this.writeBuffer,this.readBuffer,e,r),u.needsSwap){if(r){const d=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(d.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),h.setFunc(d.EQUAL,1,4294967295)}this.swapBuffers()}i0!==void 0&&(u instanceof i0?r=!0:u instanceof PE&&(r=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Re);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const r=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(r,o),this.renderTarget2.setSize(r,o);for(let l=0;l<this.passes.length;l++)this.passes[l].setSize(r,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class LE extends Eo{constructor(e,t,r=null,o=null,l=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=r,this.clearColor=o,this.clearAlpha=l,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ze}render(e,t,r){const o=e.autoClear;e.autoClear=!1;let l,u;this.overrideMaterial!==null&&(u=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(l=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:r),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(l),this.overrideMaterial!==null&&(this.scene.overrideMaterial=u),e.autoClear=o}}const IE={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ze(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class yo extends Eo{constructor(e,t,r,o){super(),this.strength=t!==void 0?t:1,this.radius=r,this.threshold=o,this.resolution=e!==void 0?new Re(e.x,e.y):new Re(256,256),this.clearColor=new Ze(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let l=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);this.renderTargetBright=new Ei(l,u,{type:nr}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let g=0;g<this.nMips;g++){const v=new Ei(l,u,{type:nr});v.texture.name="UnrealBloomPass.h"+g,v.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(v);const S=new Ei(l,u,{type:nr});S.texture.name="UnrealBloomPass.v"+g,S.texture.generateMipmaps=!1,this.renderTargetsVertical.push(S),l=Math.round(l/2),u=Math.round(u/2)}const d=IE;this.highPassUniforms=Ta.clone(d.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new In({uniforms:this.highPassUniforms,vertexShader:d.vertexShader,fragmentShader:d.fragmentShader}),this.separableBlurMaterials=[];const h=[3,5,7,9,11];l=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);for(let g=0;g<this.nMips;g++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(h[g])),this.separableBlurMaterials[g].uniforms.invSize.value=new Re(1/l,1/u),l=Math.round(l/2),u=Math.round(u/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const p=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=p,this.bloomTintColors=[new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const m=K0;this.copyUniforms=Ta.clone(m.uniforms),this.blendMaterial=new In({uniforms:this.copyUniforms,vertexShader:m.vertexShader,fragmentShader:m.fragmentShader,blending:Jd,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Ze,this.oldClearAlpha=1,this.basic=new Mo,this.fsQuad=new gf(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let r=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(r,o);for(let l=0;l<this.nMips;l++)this.renderTargetsHorizontal[l].setSize(r,o),this.renderTargetsVertical[l].setSize(r,o),this.separableBlurMaterials[l].uniforms.invSize.value=new Re(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2)}render(e,t,r,o,l){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const u=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),l&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=r.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let d=this.renderTargetBright;for(let h=0;h<this.nMips;h++)this.fsQuad.material=this.separableBlurMaterials[h],this.separableBlurMaterials[h].uniforms.colorTexture.value=d.texture,this.separableBlurMaterials[h].uniforms.direction.value=yo.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[h]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[h].uniforms.colorTexture.value=this.renderTargetsHorizontal[h].texture,this.separableBlurMaterials[h].uniforms.direction.value=yo.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[h]),e.clear(),this.fsQuad.render(e),d=this.renderTargetsVertical[h];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,l&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(r),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=u}getSeperableBlurMaterial(e){const t=[];for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(e*e))/e);return new In({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Re(.5,.5)},direction:{value:new Re(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new In({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}yo.BlurDirectionX=new Re(1,0);yo.BlurDirectionY=new Re(0,1);const NE={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class UE extends Eo{constructor(){super();const e=NE;this.uniforms=Ta.clone(e.uniforms),this.material=new xE({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new gf(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,r){this.uniforms.tDiffuse.value=r.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Et.getTransfer(this._outputColorSpace)===Ft&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===c0?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===u0?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===d0?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Yh?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===h0?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===f0&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class kE extends V0{constructor(){super();const e=new Tt;e.deleteAttribute("uv");const t=new We({side:Nn}),r=new We,o=new Ra(16777215,900,28,2);o.position.set(.418,16.199,.3),this.add(o);const l=new Ne(e,t);l.position.set(-.757,13.219,.717),l.scale.set(31.713,28.305,28.591),this.add(l);const u=new Ne(e,r);u.position.set(-10.906,2.009,1.846),u.rotation.set(0,-.195,0),u.scale.set(2.328,7.905,4.651),this.add(u);const d=new Ne(e,r);d.position.set(-5.607,-.754,-.758),d.rotation.set(0,.994,0),d.scale.set(1.97,1.534,3.955),this.add(d);const h=new Ne(e,r);h.position.set(6.167,.857,7.803),h.rotation.set(0,.561,0),h.scale.set(3.927,6.285,3.687),this.add(h);const p=new Ne(e,r);p.position.set(-2.017,.018,6.124),p.rotation.set(0,.333,0),p.scale.set(2.002,4.566,2.064),this.add(p);const m=new Ne(e,r);m.position.set(2.291,-.756,-2.621),m.rotation.set(0,-.286,0),m.scale.set(1.546,1.552,1.496),this.add(m);const g=new Ne(e,r);g.position.set(-2.193,-.369,-5.547),g.rotation.set(0,.516,0),g.scale.set(3.875,3.487,2.986),this.add(g);const v=new Ne(e,oo(50));v.position.set(-16.116,14.37,8.208),v.scale.set(.1,2.428,2.739),this.add(v);const S=new Ne(e,oo(50));S.position.set(-16.109,18.021,-8.207),S.scale.set(.1,2.425,2.751),this.add(S);const M=new Ne(e,oo(17));M.position.set(14.904,12.198,-1.832),M.scale.set(.15,4.265,6.331),this.add(M);const E=new Ne(e,oo(43));E.position.set(-.462,8.89,14.52),E.scale.set(4.38,5.441,.088),this.add(E);const y=new Ne(e,oo(20));y.position.set(3.235,11.486,-12.541),y.scale.set(2.5,2,.1),this.add(y);const x=new Ne(e,oo(100));x.position.set(0,20,0),x.scale.set(1,.1,1),this.add(x)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function oo(s){const e=new Mo;return e.color.setScalar(s),e}function FE(s){const e=new Qw({antialias:!0,powerPreference:"high-performance"}),t=Math.min(window.devicePixelRatio,1.75);e.setPixelRatio(t),e.setSize(s.clientWidth,s.clientHeight),e.toneMapping=Yh,e.toneMappingExposure=1.05,e.shadowMap.enabled=!0,e.shadowMap.type=a0,s.appendChild(e.domElement);const r=new V0;r.background=new Ze(461328),r.fog=new uf(461328,26,70);const o=new $n(55,s.clientWidth/s.clientHeight,.1,140);o.position.set(0,5.2,16),o.lookAt(0,1.2,0);const l=new Bh(e),u=l.fromScene(new kE,.035).texture;r.environment=u,r.environmentIntensity=.55,l.dispose();const d=new wE(3818328,.55);r.add(d);const h=new $d(16054015,2.2);h.position.set(7,12,8),h.castShadow=!0,h.shadow.mapSize.set(1024,1024),h.shadow.camera.left=-14,h.shadow.camera.right=14,h.shadow.camera.top=14,h.shadow.camera.bottom=-14,h.shadow.camera.far=40,h.shadow.bias=-4e-4,r.add(h);const p=new $d(7321855,.5);p.position.set(-8,4,6),r.add(p);const m=new $d(16757626,.35);m.position.set(-4,6,-9),r.add(m);const g=new DE(e);g.setSize(s.clientWidth,s.clientHeight),g.addPass(new LE(r,o));const v=new yo(new Re(s.clientWidth*.5,s.clientHeight*.5),.28,.45,.85);g.addPass(v),g.addPass(new UE);let S="high";function M(C){S=C,C==="high"?(e.setPixelRatio(t),v.enabled=!0,e.shadowMap.enabled=!0):C==="medium"?(e.setPixelRatio(1),v.enabled=!0,e.shadowMap.enabled=!1):(e.setPixelRatio(1),v.enabled=!1,e.shadowMap.enabled=!1),e.shadowMap.needsUpdate=!0}function E(C){g.render(C)}function y(){const C=s.clientWidth,A=s.clientHeight;e.setSize(C,A),g.setSize(C,A),v.resolution.set(Math.max(1,C*.5),Math.max(1,A*.5)),o.aspect=C/A,o.updateProjectionMatrix()}function x(){window.removeEventListener("resize",y),e.dispose(),u.dispose(),e.domElement.parentElement===s&&s.removeChild(e.domElement)}return window.addEventListener("resize",y),{renderer:e,scene:r,camera:o,composer:g,bloomPass:v,get quality(){return S},setQuality:M,render:E,resize:y,dispose:x}}function OE(s){let e=performance.now(),t=0,r=!1;return o=>{t++;const l=performance.now();if(l-e>=2e3){const u=t*1e3/(l-e);t=0,e=l,u<42&&(s.quality==="high"?s.setQuality("medium"):s.quality==="medium"&&!r?(r=!0,s.setQuality("low")):s.quality==="low"&&!r&&(r=!0))}}}class BE{constructor(e,t){this.camera=e,this.dom=t,t.addEventListener("pointerdown",o=>{if(o.button===0){if(this.pickHandler){const l=t.getBoundingClientRect(),u=(o.clientX-l.left)/l.width*2-1,d=-((o.clientY-l.top)/l.height*2-1);if(this.pickHandler(u,d)!==null)return}this.dragging=!0,this.lastX=o.clientX,this.lastY=o.clientY,t.setPointerCapture(o.pointerId)}}),t.addEventListener("pointermove",o=>{if(!this.dragging)return;const l=o.clientX-this.lastX,u=o.clientY-this.lastY;this.lastX=o.clientX,this.lastY=o.clientY,this.goalAzimuth-=l*.005,this.goalElevation=pd.clamp(this.goalElevation+u*.004,.08,1.35)});const r=()=>{this.dragging=!1};t.addEventListener("pointerup",r),t.addEventListener("pointercancel",r),t.addEventListener("wheel",o=>{o.preventDefault(),this.goalRadius=pd.clamp(this.goalRadius+o.deltaY*.02,4,40)},{passive:!1}),window.addEventListener("keydown",this.keyDown),window.addEventListener("keyup",this.keyUp)}target=new N(0,1,0);goalTarget=new N(0,1,0);radius=16;goalRadius=16;azimuth=Math.PI*.06;goalAzimuth=Math.PI*.06;elevation=.42;goalElevation=.42;pickHandler=null;dragging=!1;lastX=0;lastY=0;keys=new Set;keyDown=e=>{const t=e.key.toLowerCase();["w","a","s","d","q","e"].includes(t)&&this.keys.add(t)};keyUp=e=>this.keys.delete(e.key.toLowerCase());dispose(){window.removeEventListener("keydown",this.keyDown),window.removeEventListener("keyup",this.keyUp)}glideTo(e,t=10){this.goalTarget.copy(e),this.goalRadius=t}update(e){const t=6*e,r=new N(Math.sin(this.azimuth+Math.PI),0,Math.cos(this.azimuth+Math.PI)),o=new N(r.z,0,-r.x);this.keys.has("w")&&this.goalTarget.addScaledVector(r,t),this.keys.has("s")&&this.goalTarget.addScaledVector(r,-t),this.keys.has("a")&&this.goalTarget.addScaledVector(o,-t),this.keys.has("d")&&this.goalTarget.addScaledVector(o,t),this.keys.has("q")&&(this.goalTarget.y+=t*.7),this.keys.has("e")&&(this.goalTarget.y-=t*.7),this.goalTarget.y=pd.clamp(this.goalTarget.y,.3,10);const l=1-Math.exp(-4.2*e);this.target.lerp(this.goalTarget,l),this.radius+=(this.goalRadius-this.radius)*l,this.azimuth+=(this.goalAzimuth-this.azimuth)*l,this.elevation+=(this.goalElevation-this.elevation)*l;const u=new N(this.target.x+this.radius*Math.sin(this.azimuth)*Math.cos(this.elevation),this.target.y+this.radius*Math.sin(this.elevation),this.target.z+this.radius*Math.cos(this.azimuth)*Math.cos(this.elevation));this.camera.position.copy(u),this.camera.lookAt(this.target)}}class zE{constructor(e,t=14){this.scene=e,this.instancesPerPath=t}entries=[];dummy=new Ot;pulseColor=new Ze;baseColor=new Ze;addPath(e){const t=new Ca(.045,8,6),r=new Mo({color:16777215}),o=new Ur(t,r,this.instancesPerPath);o.instanceColor=new Vh(new Float32Array(this.instancesPerPath*3),3),o.frustumCulled=!1;const l=new Float32Array(this.instancesPerPath);for(let d=0;d<this.instancesPerPath;d++)l[d]=d/this.instancesPerPath;this.scene.add(o);const u=`flow-${this.entries.length}`;return this.entries.push({path:e,mesh:o,params:l,activity:{speed:1,brightness:1}}),u}setActivity(e,t){this.entries[e]&&(this.entries[e].activity=t)}activityCount(){return this.entries.length}update(e,t=1){for(const r of this.entries){const{path:o,mesh:l,params:u,activity:d}=r,h=o.curve,p=d.speed*t*.22*e,m=Math.max(0,d.brightness);d.color?this.baseColor.copy(d.color):this.baseColor.copy(o.color);for(let g=0;g<u.length;g++){u[g]=(u[g]+p)%1;const v=h.getPointAt(Math.min(.999,u[g]));this.dummy.position.copy(v);const S=u[g],M=Math.min(1,Math.min(S,1-S)*6);this.pulseColor.copy(this.baseColor).multiplyScalar(m*M+.05),l.setColorAt(g,this.pulseColor),this.dummy.updateMatrix(),l.setMatrixAt(g,this.dummy.matrix)}l.instanceMatrix.needsUpdate=!0,l.instanceColor&&(l.instanceColor.needsUpdate=!0)}}dispose(){for(const e of this.entries)this.scene.remove(e.mesh),e.mesh.geometry.dispose(),e.mesh.material.dispose();this.entries=[]}}const cn={brushedGold:new We({color:14267210,metalness:1,roughness:.34}),goldPolished:new We({color:15780966,metalness:1,roughness:.12}),niobiumDark:new We({color:2304566,metalness:.85,roughness:.42}),stainless:new We({color:10134189,metalness:.9,roughness:.3}),copper:new We({color:12876349,metalness:1,roughness:.28}),aluminium:new We({color:12041671,metalness:.95,roughness:.22}),siliconDie:new We({color:1514795,metalness:.55,roughness:.28}),waferDark:new We({color:1053724,metalness:.92,roughness:.12}),polySilicon:new We({color:6187904,metalness:.35,roughness:.5}),diffusion:new We({color:7232078,metalness:.3,roughness:.55}),oxideGlass:new vc({color:9417944,transparent:!0,opacity:.18,roughness:.05,metalness:0,transmission:.6}),nwell:new We({color:3042904,transparent:!0,opacity:.55,metalness:.2,roughness:.45}),psub:new We({color:3493998,transparent:!0,opacity:.5,metalness:.2,roughness:.5}),pcbGreen:new vc({color:935460,metalness:.05,roughness:.55,transparent:!0,opacity:.94}),pcbBlack:new We({color:1053464,metalness:.1,roughness:.6}),substrate:new We({color:1251104,metalness:.4,roughness:.35}),plasticDark:new We({color:1843499,metalness:.35,roughness:.6}),floor:new We({color:724758,roughness:.85,metalness:.15}),glassShroud:new vc({color:11195647,transparent:!0,opacity:.12,roughness:.03,metalness:0,transmission:.9,side:Di}),dangerStripe:new We({color:14200865,metalness:.2,roughness:.6})};function _n(s,e={}){const t=e.fontSize??42,r=e.color??"#dbe6f5",o=e.background??"rgba(8, 12, 18, 0.72)",l=e.padding??14,u=e.scale??1,d=e.bold??!0,h=document.createElement("canvas"),p=h.getContext("2d"),m=`${d?"600 ":""}${t}px "Segoe UI", system-ui, sans-serif`;p.font=m;const g=p.measureText(s),v=Math.ceil(g.width+l*2),S=Math.ceil(t*1.35+l*2);if(h.width=v,h.height=S,p.font=m,o!=="none"){p.fillStyle=o;const C=12;p.beginPath(),p.moveTo(C,0),p.arcTo(v,0,v,S,C),p.arcTo(v,S,0,S,C),p.arcTo(0,S,0,0,C),p.arcTo(0,0,v,0,C),p.fill()}p.fillStyle=r,p.textAlign="center",p.textBaseline="middle",p.fillText(s,v/2,S/2);const M=new rE(h);M.colorSpace=yi,M.anisotropy=4;const E=new H0({map:M,transparent:!0,depthWrite:!1}),y=new Zw(E),x=v/S;return y.scale.set(u*x/2,u/2,1),y.renderOrder=10,y}function er(s=1.1,e=6476031){const t=new An,r=new Ne(new gn(.02,.032,s,10),new We({color:10134706,metalness:.9,roughness:.25}));r.position.y=s/2,r.castShadow=!0,t.add(r);const o=new Ne(new ff(.032,.14,10),new We({color:15265527,metalness:.8,roughness:.2}));o.rotation.x=Math.PI,o.position.y=s+.07,t.add(o);const l=new Ne(new Pc(.055,.016,8,16),new We({color:e,emissive:e,emissiveIntensity:1.6,metalness:.4,roughness:.4}));l.rotation.x=Math.PI/2,l.position.y=s*.82,t.add(l);const u=new Ne(new gn(.11,.13,.07,14),new We({color:2106927,metalness:.6,roughness:.5}));return u.position.y=.035,t.add(u),t}const VE=`{
  "id": "01_fundamental_constants",
  "domain": "fundamental-physics",
  "provenance_status": "verified_offline_standard",
  "source_citation": "CODATA 2022 recommended values of the fundamental physical constants (2022 adjustment). NIST SP 96b. Published 2024. DOI: 10.5281/zenodo.10767569",
  "source_url": "https://physics.nist.gov/cuu/Constants/index.html",
  "license_or_access": "public domain (NIST)",
  "parameters": {
    "elementary_charge": {
      "symbol": "q_e",
      "value": 1.602176634e-19,
      "unit": "C",
      "si_prefix": null,
      "uncertainty": 0,
      "exact": true,
      "note": "Defined exactly since SI 2019 redefinition"
    },
    "boltzmann_constant": {
      "symbol": "k_B",
      "value": 1.380649e-23,
      "unit": "J/K",
      "si_prefix": null,
      "uncertainty": 0,
      "exact": true,
      "note": "Defined exactly since SI 2019 redefinition"
    },
    "reduced_planck_constant": {
      "symbol": "ħ",
      "value": 1.0545718176461565e-34,
      "unit": "J·s",
      "si_prefix": null,
      "uncertainty": 0,
      "exact": true,
      "note": "Derived from exact h = 6.62607015e-34 J·s and exact π"
    },
    "speed_of_light": {
      "symbol": "c",
      "value": 299792458,
      "unit": "m/s",
      "si_prefix": null,
      "uncertainty": 0,
      "exact": true,
      "note": "Defined exactly since SI 1983"
    },
    "vacuum_permittivity": {
      "symbol": "ε_0",
      "value": 8.8541878128e-12,
      "unit": "F/m",
      "si_prefix": null,
      "uncertainty": 1.3e-21,
      "exact": false,
      "note": "Measured; related to μ_0 and c by ε_0 = 1/(μ_0·c²). Relative uncertainty 1.5e-10 since CODATA 2018"
    },
    "vacuum_permeability": {
      "symbol": "μ_0",
      "value": 1.25663706127e-6,
      "unit": "N/A²",
      "si_prefix": null,
      "uncertainty": 1.9e-19,
      "exact": false,
      "note": "Relative uncertainty 1.5e-10 since CODATA 2018 (no longer exact since SI 2019)"
    },
    "stefan_boltzmann_constant": {
      "symbol": "σ_SB",
      "value": 5.670374419e-8,
      "unit": "W/(m²·K⁴)",
      "si_prefix": null,
      "uncertainty": 0,
      "exact": true,
      "note": "Derived exactly from σ_SB = π²·k_B⁴/(60·ħ³·c²)"
    },
    "avogadro_constant": {
      "symbol": "N_A",
      "value": 6.02214076e23,
      "unit": "1/mol",
      "si_prefix": null,
      "uncertainty": 0,
      "exact": true,
      "note": "Defined exactly since SI 2019"
    }
  },
  "derived": {
    "thermal_voltage_V_T_300K": {
      "symbol": "V_T",
      "value": 0.025852,
      "unit": "V",
      "equation": "V_T = k_B·T/q_e",
      "conditions": { "T": 300, "T_unit": "K" },
      "note": "Thermal voltage at 300 K (≈26.85 mV)"
    },
    "thermal_voltage_V_T_formula": {
      "equation": "V_T(T) = k_B·T/q_e",
      "unit": "V",
      "note": "Use for any temperature; at 27 °C (300.15 K) V_T ≈ 25.89 mV"
    }
  },
  "valid_operating_envelope": {
    "note": "Fundamental constants are universal; no operating envelope restriction applies"
  },
  "failure_thresholds": {},
  "equations": [
    "V_T(T) = k_B·T/q_e",
    "σ_SB = π²·k_B⁴/(60·ħ³·c²)",
    "ε_0 = 1/(μ_0·c²)"
  ]
}
`,HE=`{
  "id": "02_semiconductor_pdk_silicon",
  "domain": "semiconductor-pdk-and-materials",
  "provenance_status": "verified_offline_standard",
  "source_citation": "SKY130A PDK (SkyWater Technology, pinned open_pdks commit 0c1f82326278a0871f0a1fc4bdacf94c88e78e4d); FreePDK45 (NCSU/OSU, North Carolina State University); ASAP7 PDK (Arizona State University); material properties from CRC Handbook of Chemistry and Physics, 103rd ed. and Ioffe Institute semiconductor database",
  "source_url": "https://github.com/google/skywater-pdk, https://www.skywatertechnology.com/sky130/, https://www.asap.asu.edu/asap7, https://ptm.asu.edu/",
  "license_or_access": "Apache-2.0 (SKY130); free academic (FreePDK45); free academic (ASAP7); public CRC/Ioffe data",
  "parameters": {
    "sky130a": {
      "pdk_name": "SKY130A",
      "foundry": "SkyWater Technology Foundry",
      "technology_node": "130 nm",
      "pinned_open_pdks_commit": "0c1f82326278a0871f0a1fc4bdacf94c88e78e4d",
      "pinned_skywater_commit": "f62031a1be9aefe902d6d54cddd6f59b57627436",
      "nominal_vdd_v": 1.8,
      "core_soa_max_vgs_v": 1.95,
      "core_soa_note": "Strict 1.95 V core safe-operating-area ceiling for SKY130 core devices (li1 to met5)",
      "metal_stack": {
        "li1": { "thickness_nm": 250, "sheet_resistance_ohm_per_sq": 0.955, "material": "silicided local interconnect" },
        "met1": { "thickness_nm": 570, "sheet_resistance_ohm_per_sq": 0.125, "material": "aluminium (Al) with TiN barrier" },
        "met2": { "thickness_nm": 845, "sheet_resistance_ohm_per_sq": 0.075, "material": "aluminium" },
        "met3": { "thickness_nm": 1035, "sheet_resistance_ohm_per_sq": 0.055, "material": "aluminium" },
        "met4": { "thickness_nm": 2260, "sheet_resistance_ohm_per_sq": 0.027, "material": "aluminium" },
        "met5": { "thickness_nm": 3390, "sheet_resistance_ohm_per_sq": 0.018, "material": "aluminium" }
      },
      "oxide_thickness_nm": { "gate_oxide": 4.1, "field_oxide": 420 },
      "gate_pitch_nm": 480,
      "vth_nmos_typ_v": 0.55,
      "vth_pmos_typ_v": -0.55,
      "ox_breakdown_field_mv_per_cm": 1000,
      "ox_breakdown_note": "SiO2 intrinsic breakdown ~10 MV/cm; SKY130 practical TDDB-limited operating ceiling set by foundry spec to 1.95 V for core devices"
    },
    "freepdk45": {
      "pdk_name": "FreePDK45",
      "foundry": "North Carolina State University (virtual/academic)",
      "technology_node": "45 nm planar",
      "nominal_vdd_v": 1.0,
      "gate_pitch_nm": 90,
      "ox_breakdown_field_mv_per_cm": 1000,
      "note": "Virtual PDK for academic research; no fabricated silicon. Published nominal VDD = 1.0 V"
    },
    "asap7": {
      "pdk_name": "ASAP7",
      "foundry": "Arizona State University (virtual/academic)",
      "technology_node": "7 nm FinFET",
      "nominal_vdd_v": 0.7,
      "gate_pitch_nm": 54,
      "fin_height_nm": 42,
      "fin_pitch_nm": 27,
      "ox_breakdown_field_mv_per_cm": 1000,
      "note": "Virtual predictive PDK from ASU; no fabricated silicon. Published nominal VDD = 0.7 V"
    }
  },
  "material_properties": {
    "silicon": {
      "resistivity_ohm_cm_at_300K_doped_1e15": 2.3,
      "tcr_per_k": 0.002,
      "thermal_conductivity_w_per_m_k": 148,
      "thermal_conductivity_note": "at 300 K; decreases with T approximately as T^(-1.5) above 100 K",
      "specific_heat_j_per_kg_k": 700,
      "density_kg_per_m3": 2329,
      "melting_point_c": 1414,
      "bandgap_ev_at_300K": 1.12
    },
    "silicon_dioxide": {
      "thermal_conductivity_w_per_m_k": 1.4,
      "specific_heat_j_per_kg_k": 740,
      "density_kg_per_m3": 2220,
      "melting_point_c": 1710,
      "dielectric_constant": 3.9,
      "breakdown_field_mv_per_cm": 10000
    },
    "copper": {
      "resistivity_ohm_m_at_300K": 1.68e-8,
      "tcr_per_k": 0.0039,
      "thermal_conductivity_w_per_m_k": 401,
      "specific_heat_j_per_kg_k": 385,
      "density_kg_per_m3": 8960,
      "melting_point_c": 1085,
      "fusing_note": "Joule fusing depends on geometry and pulse duration — use Onderdonk or Preece equations for specific traces"
    },
    "aluminium": {
      "resistivity_ohm_m_at_300K": 2.65e-8,
      "tcr_per_k": 0.0043,
      "thermal_conductivity_w_per_m_k": 237,
      "specific_heat_j_per_kg_k": 900,
      "density_kg_per_m3": 2700,
      "melting_point_c": 660,
      "electromigration_note": "SKY130 metal is Al with TiN barrier; Black's equation applies for EM lifetime"
    },
    "gold": {
      "resistivity_ohm_m_at_300K": 2.44e-8,
      "tcr_per_k": 0.0034,
      "thermal_conductivity_w_per_m_k": 318,
      "specific_heat_j_per_kg_k": 129,
      "density_kg_per_m3": 19300,
      "melting_point_c": 1064
    },
    "niobium": {
      "resistivity_ohm_m_at_300K": 1.5e-7,
      "tcr_per_k": 0.0026,
      "thermal_conductivity_w_per_m_k": 53,
      "specific_heat_j_per_kg_k": 265,
      "density_kg_per_m3": 8570,
      "melting_point_c": 2477,
      "superconducting_transition_k": 9.3,
      "note": "Type-II superconductor; used in superconducting quantum circuits"
    },
    "fr4_pcb": {
      "thermal_conductivity_w_per_m_k": 0.3,
      "specific_heat_j_per_kg_k": 600,
      "density_kg_per_m3": 1900,
      "glass_transition_c": 130,
      "delamination_c": 260,
      "note": "FR-4 standard PCB substrate; Tg ~130 °C, delamination threshold ~260 °C (reflow peak)"
    }
  },
  "equations": [
    "Black's equation (electromigration MTTF): MTTF = A · J^(-n) · exp(E_a / (k_B·T)), n ≈ 2 for Al interconnects, E_a ≈ 0.7 eV",
    "Onderdonk fusing equation: I_fuse = S · sqrt(T_melt − T_ambient / (t · ρ_0 · α)) — approximate for short pulses",
    "Joule heating: P = I²·R(T), R(T) = R_0·(1 + α·(T − T_0))",
    "Thermal diffusion (1D): ∂T/∂t = α_D·∂²T/∂x² + q/(ρ·c_p), α_D = k/(ρ·c_p)"
  ],
  "valid_operating_envelope": {
    "sky130_core": { "vgs_max_v": 1.95, "temp_max_c": 125, "note": "foundry-specified commercial operating range" },
    "freepdk45": { "vdd_max_v": 1.0, "note": "virtual academic PDK" },
    "asap7": { "vdd_max_v": 0.7, "note": "virtual academic PDK" }
  },
  "failure_thresholds": {
    "sky130_gate_oxide_tddb": {
      "vgs_threshold_v": 1.95,
      "note": "SKY130 core SOA ceiling; exceeding accelerates TDDB exponentially (E-model: ln(MTTF) ∝ −γ·Vgs, γ ≈ 300 dec/V for 4.1 nm SiO2)"
    },
    "copper_fusing_c": 1085,
    "fr4_delamination_c": 260,
    "silicon_melting_c": 1414,
    "aluminium_fusing_note": "SKY130 metal (Al) fusing depends on current density; for 1 µm wide met1, typical DC fusing current ≈ 5–10 mA"
  }
}
`,GE=`{
  "id": "03_multiradix_logic_baselines",
  "domain": "multi-radix-logic",
  "provenance_status": "verified_offline_standard",
  "source_citation": "SKY130A PDK voltage-level definitions (Phase 0 verified primitives); multi-valued logic noise-margin theory from Hirasuna (1999) and Pécot et al.; radix-economy from Thomas K. Moon (2005), 'Fundamentals of Digital Logic'",
  "source_url": "https://github.com/google/skywater-pdk, https://en.wikipedia.org/wiki/Multi-valued_logic",
  "license_or_access": "Apache-2.0 (SKY130); public domain (theory)",
  "parameters": {
    "binary_radix2_1p8v": {
      "name": "Binary (radix-2) — 1.8 V SKY130",
      "logic_levels_v": { "L": 0.0, "H": 1.8 },
      "noise_margin_low_v": 0.6,
      "noise_margin_high_v": 0.6,
      "voltage_levels_v": [0.0, 1.8],
      "nominal_midpoint_v": 0.9,
      "note": "Standard binary CMOS logic levels at 1.8 V nominal VDD"
    },
    "quaternary_q4_1p8v_ldo": {
      "name": "Q4 Quaternary — 1.8 V LDO (SKY130 4-level)",
      "logic_levels_v": { "0": 0.0, "1": 0.6, "2": 1.2, "3": 1.8 },
      "voltage_levels_v": [0.0, 0.6, 1.2, 1.8],
      "nominal_midpoints_v": [0.3, 0.9, 1.5],
      "noise_margin_per_level_v": 0.3,
      "note": "Phase 0 verified Q4 voltage map on SKY130 1.8 V LDO rail; 4 distinct levels with 0.6 V spacing"
    },
    "quaternary_q4_1p65v": {
      "name": "Q4 Quaternary — 1.65 V profile (alternative)",
      "logic_levels_v": { "0": 0.0, "1": 0.55, "2": 1.1, "3": 1.65 },
      "voltage_levels_v": [0.0, 0.55, 1.1, 1.65],
      "nominal_midpoints_v": [0.275, 0.825, 1.375],
      "noise_margin_per_level_v": 0.275,
      "note": "Lower-margin alternative profile for tighter power budgets"
    },
    "ternary_balanced_1p8v": {
      "name": "Balanced Ternary (radix-3) — 1.8 V",
      "logic_levels_v": { "neg1": 0.0, "zero": 0.9, "pos1": 1.8 },
      "voltage_levels_v": [0.0, 0.9, 1.8],
      "nominal_midpoints_v": [0.45, 1.35],
      "noise_margin_per_level_v": 0.45,
      "note": "Balanced ternary: −1, 0, +1 mapped to 0, 0.9, 1.8 V"
    },
    "ternary_unbalanced_1p8v": {
      "name": "Unbalanced Ternary (radix-3) — 1.8 V",
      "logic_levels_v": { "0": 0.0, "1": 0.9, "2": 1.8 },
      "voltage_levels_v": [0.0, 0.9, 1.8],
      "nominal_midpoints_v": [0.45, 1.35],
      "noise_margin_per_level_v": 0.45,
      "note": "Unbalanced ternary: 0, 1, 2 mapped to 0, 0.9, 1.8 V"
    }
  },
  "verified_sky130a_q4_primitives": [
    {
      "cell_name": "q4_thresh_det",
      "function": "quaternary threshold detector — maps analogue input to nearest Q4 digit",
      "gate_count": 6,
      "drc_status": "DRC=0 (Magic)",
      "lvs_status": "Netgen unique LVS ✓",
      "pex_status": "RC PEX extracted ✓",
      "sk130_commit": "f62031a1be9aefe902d6d54cddd6f59b57627436"
    },
    {
      "cell_name": "q4_inv",
      "function": "quaternary inverter — Q3→Q0, Q2→Q1, Q1→Q2, Q0→Q3",
      "gate_count": 6,
      "drc_status": "DRC=0 (Magic)",
      "lvs_status": "Netgen unique LVS ✓",
      "pex_status": "RC PEX extracted ✓",
      "sk130_commit": "f62031a1be9aefe902d6d54cddd6f59b57627436"
    },
    {
      "cell_name": "q4_mux4",
      "function": "4:1 quaternary multiplexer — selects one of 4 Q4 inputs by 2-digit selector",
      "gate_count": 8,
      "drc_status": "DRC=0 (Magic)",
      "lvs_status": "Netgen unique LVS ✓",
      "pex_status": "RC PEX extracted ✓",
      "sk130_commit": "f62031a1be9aefe902d6d54cddd6f59b57627436"
    },
    {
      "cell_name": "q4_half_adder",
      "function": "quaternary half adder — Q4 sum (mod 4) + Q4 carry",
      "gate_count": 8,
      "drc_status": "DRC=0 (Magic)",
      "lvs_status": "Netgen unique LVS ✓",
      "pex_status": "RC PEX extracted ✓",
      "sk130_commit": "f62031a1be9aefe902d6d54cddd6f59b57627436"
    }
  ],
  "equations": [
    "radix_economy: E(r) = r / log₂(r) — the cost-per-digit ratio; minimized at r = e ≈ 2.718, making radix-3 theoretically most economical",
    "noise_margin_NMH = V_OH(min) − V_IH(max); noise_margin_NML = V_IL(max) − V_OL(max)",
    "Q4 levels: L_k = k · VDD / 3 for k = 0..3 with VDD = 1.8 V",
    "binary_levels: L_k = k · VDD for k = 0..1",
    "ternary_levels: L_k = k · VDD / 2 for k = 0..2",
    "theoretical_noise_margin_bounds: NM ≥ VDD / (2·(r − 1)) for r uniformly spaced levels on a railed logic family",
    "Q4 inversion: Q3 → Q0, Q2 → Q1, Q1 → Q2, Q0 → Q3 (equivalent to 3 − Q in mod-4)",
    "Q4 half adder: S = (A + B) mod 4, C = ⌊(A + B) / 4⌋"
  ],
  "valid_operating_envelope": {
    "vdd_range_v": [1.65, 1.95],
    "temperature_range_c": [-40, 125],
    "note": "SKY130 commercial operating range; logic-level voltages scale proportionally with VDD"
  },
  "failure_thresholds": {
    "vgs_overstress_v": 1.95,
    "note": "SKY130 core SOA ceiling; the Q4 voltage map (max 1.8 V) is safely below this ceiling"
  }
}
`,WE=`{
  "id": "04_quantum_hardware_modalities",
  "domain": "quantum-hardware",
  "provenance_status": "verified_offline_standard",
  "source_citation": "Published parameters: Google Sycamore (Arute et al., Nature 574, 505–510, 2019); IBM Quantum (IBM Quantum Development roadmap 2023–2026); QuEra/Harvard neutral-atom (Ebadi et al., Nature 612, 2023); Quantinuum trapped-ion (Mt. Const. from Quantinuum H2); UChicago SNSPD (Reddy et al., APL Photonics); dilution refrigerator specs from Bluefors product datasheets (XLD400)",
  "source_url": "https://quantumai.google/hardware, https://www.ibm.com/quantum/technology, https://www.quantinuum.com/, https://www.bluefors.com/",
  "license_or_access": "public domain (published parameters); institutional (IBM/Google/Quantinuum data cited from peer-reviewed publications)",
  "parameters": {
    "superconducting_transmon": {
      "name": "Superconducting Transmon QPU",
      "qubit_type": "superconducting transmon (Coplanar Waveguide resonator readout)",
      "typical_frequency_ghz": { "min": 4.0, "max": 6.0, "typical": 5.0 },
      "anharmonicity_alpha_mhz": { "min": -340, "max": -200, "typical": -280 },
      "t1_us": { "min": 50, "typical": 100, "max": 300 },
      "t2_us": { "min": 50, "typical": 150, "max": 300 },
      "t2_note": "T2 ≤ 2·T1 by fundamental bound; T2 echo typically 150–300 µs",
      "gate_1q_duration_ns": { "typical": 25, "range": [15, 50] },
      "gate_1q_error": { "typical": 0.0005, "best_reported": 0.0001 },
      "gate_2q_duration_ns": { "typical": 300, "range": [150, 600] },
      "gate_2q_error": { "typical": 0.005, "best_reported": 0.001 },
      "zz_crosstalk_khz": { "typical": 50, "range": [10, 200] },
      "readout_fidelity": { "typical": 0.98, "best_reported": 0.999 },
      "mixing_chamber_temp_mk": { "typical": 15, "range": [10, 20] },
      "cryo_cooling_power": {
        "stage_4k_w": 1.5,
        "stage_100mk_w": 0.1,
        "stage_15mk_w": 0.012,
        "note": "Bluefors XLD400 dilution refrigerator; cooling power at each stage — loading above these limits causes thermal quench"
      },
      "qubit_count_demonstrated": { "google_sycamore": 53, "ibm_condor": 1121, "ibm_heron": 133 },
      "citations": [
        "Arute et al., 'Quantum supremacy using a programmable superconducting processor', Nature 574, 505–510 (2019)",
        "IBM Quantum Development Roadmap (2023–2026) — Heron/Condor specifications"
      ]
    },
    "silicon_photonic_soi": {
      "name": "Silicon Photonic QPU (SOI)",
      "qubit_type": "dual-rail or path-encoded photonic qubit at 1550 nm C-band",
      "wavelength_nm": 1550,
      "waveguide_propagation_loss_db_per_cm": { "typical": 0.5, "best_reported": 0.1 },
      "directional_coupler_insertion_loss_db": { "typical": 0.1, "best_reported": 0.01 },
      "mzi_insertion_loss_db": { "typical": 1.0, "best_reported": 0.1 },
      "thermo_optic_phase_shifter": {
        "p_pi_mw": { "typical": 5, "range": [1, 20] },
        "thermal_crosstalk_db": { "typical": -15, "range": [-25, -10] },
        "response_time_us": { "typical": 10, "range": [1, 100] }
      },
      "snspd_detector": {
        "efficiency_percent": { "typical": 90, "best_reported": 98 },
        "dark_count_per_second": { "typical": 100, "best_reported": 1 },
        "jitter_ps": { "typical": 30, "best_reported": 10 },
        "reset_time_ns": { "typical": 20, "range": [10, 100] }
      },
      "cryo_requirement": "SNSPD requires cryogenic operation (typically 0.8–2 K on a separate cryostat stage)",
      "citations": [
        "Reddy et al., 'Superconducting nanowire single-photon detectors', APL Photonics 8, 051101 (2023)"
      ]
    },
    "neutral_atom_rubidium87": {
      "name": "Neutral-Atom Array (87Rb)",
      "qubit_type": "87Rb neutral atom in optical tweezer (ground-state hyperfine qubit)",
      "atom_species": "87Rb",
      "transition_wavelength_nm": { "d2_line": 780.24, "rydberg": 480 },
      "trap_depth_mhz": { "typical": 100, "range": [20, 500] },
      "rydberg_blockade_radius_um": { "typical": 5, "range": [3, 10] },
      "rydberg_c6_ghz_um6": { "typical": 500, "note": "C6 coefficient for |60S⟩ Rydberg state" },
      "shuttle_velocity_um_per_s": { "typical": 100, "max": 1000 },
      "gate_1q_error": { "typical": 0.0005 },
      "gate_2q_error": { "typical": 0.005, "best_reported": 0.001 },
      "atom_count_demonstrated": { "harvard_2023": 866, "quera_2024": 256 },
      "vacuum_pressure_torr": { "typical": 1e-10 },
      "heating_rate_mk_per_s": { "typical": 0.01 },
      "citations": [
        "Ebadi et al., 'Quantum optimization of maximum independent set using Rydberg atom arrays', Nature 612, 71–77 (2023)"
      ]
    },
    "trapped_ion_ytterbium171": {
      "name": "Trapped-Ion QPU (171Yb+)",
      "qubit_type": "171Yb+ hyperfine qubit (|F=0,m=0⟩ ↔ |F=1,m=1⟩ ground state)",
      "transition_wavelength_nm": { "clock_411": 411, "detection_369": 369.53 },
      "trap_depth_mhz": { "typical": 1000 },
      "gate_1q_error": { "typical": 0.0002, "best_reported": 0.0001 },
      "gate_2q_error": { "typical": 0.001, "best_reported": 0.0005 },
      "gate_2q_type": "Mølmer–Sørensen",
      "shuttle_time_ms": { "typical": 50, "range": [20, 200] },
      "ion_count_demonstrated": { "quantinuum_h2": 56 },
      "vacuum_pressure_torr": { "typical": 1e-11 },
      "heating_rate_quanta_per_s": { "typical": 1 },
      "citations": [
        "Quantinuum H2 specifications — 56 qubits, 99.9% 2Q gate fidelity (2024)"
      ]
    }
  },
  "equations": [
    "Lindblad master equation: dρ/dt = −i[H,ρ]/ħ + Σ_k γ_k (L_k ρ L_k† − ½{L_k†L_k, ρ}) — open-system dynamics with decoherence rates γ_k",
    "Gate error (average): E = 1 − F_avg where F_avg = (|tr(U†U_ideal)|² + d) / (d + 1)",
    "Rydberg blockade: V(r) = C₆/r⁶; blockade radius r_b = (C₆/Ω)^(1/6) where Ω is the Rabi frequency",
    "Blackbody decoherence rate: Γ_bb = (k_B·T/ħ)² · (2·π·c/(ω₀))² · (1/4π) — thermal photon-induced transitions",
    "Dilution fridge cooling power: Q_cool(T) = Q_ideal(T) · η, Q_ideal(T) ∝ (T/T_c)² for dilution stage"
  ],
  "valid_operating_envelope": {
    "superconducting": { "temperature_mk": [10, 20], "magnetic_field_ut": [0, 1], "note": "Dilution fridge, mu-metal shielding" },
    "photonic": { "temperature_k": [0.8, 300], "note": "SNSPD cryogenic; waveguide can be room temperature" },
    "neutral_atom": { "vacuum_torr": [1e-11, 1e-9], "temperature_mk": [0.01, 1], "note": "UHV chamber" },
    "trapped_ion": { "vacuum_torr": [1e-11, 1e-10], "note": "UHV trap chamber" }
  },
  "failure_thresholds": {
    "cryo_quench": {
      "condition": "Q_load > Q_cooling_capacity at any dilution fridge stage",
      "effect": "temperature rises above superconducting transition → decoherence collapse, qubit loss, hours of recovery time",
      "threshold_15mk_w": 0.012,
      "note": "Exceeding the 15 mK cooling power budget (typically 12 mW for Bluefors XLD400) causes thermal quench"
    },
    "magnetic_field_intrusion": {
      "condition": "B > B_c for superconducting materials (Nb: B_c ≈ 200 mT)",
      "effect": "superconducting transition, SQUID readout failure"
    },
    "vacuum_loss": {
      "condition": "pressure > 1e-9 torr for neutral atoms / trapped ions",
      "effect": "collision-induced atom/ion loss, heating rate spikes"
    }
  }
}
`,qE=`{
  "id": "05_chip_architecture_benchmarks",
  "domain": "chip-architecture",
  "provenance_status": "verified_offline_standard",
  "source_citation": "RISC-V RV32IM ISA specification (riscv.org, version 2.2); Google TPU v1 paper (Jouppi et al., ISCA 2017); NVIDIA Ampere architecture whitepaper (NVIDIA Corp., 2020); Forth standard (Forth-2012); Systolic array theory from Kung & Su (1984)",
  "source_url": "https://riscv.org/technical/specifications/, https://ai.googleblog.com/2017/04/quantuping-neural-networks.html, https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf",
  "license_or_access": "public (RISC-V ISA spec); published academic (TPU); public (NVIDIA whitepaper)",
  "parameters": {
    "riscv_rv32im": {
      "name": "RISC-V RV32IM (educational CPU)",
      "isa": "RV32IM (integer + multiply/divide)",
      "register_count": 32,
      "register_width_bits": 32,
      "instruction_formats": ["R", "I", "S", "B", "U", "J"],
      "base_instructions": 47,
      "m_extension_instructions": 8,
      "pipeline_stages": 5,
      "typical_frequency_mhz": { "educational_fpga": 50, "asic_130nm": 100, "asic_7nm": 1000 },
      "cpi_typical": 1.2,
      "power_mw_at_100mhz_130nm": 15,
      "note": "Educational reference; the Invention Lab IL-8 ISA is a simplified 8-bit subset for teaching"
    },
    "systolic_array_tpu": {
      "name": "Systolic-Array Tensor Processing Unit",
      "dataflow": "weight-stationary",
      "grid_size": { "tpu_v1": 256, "educational": 8 },
      "mac_per_cycle": { "tpu_v1": 65536, "educational_8x8": 64 },
      "arithmetic": "INT8 multiply + INT32 accumulate",
      "quantization": "per-axis symmetric INT8 with FP32 accumulator (QDQ: Quantize → Dequantize → Quantize)",
      "clock_mhz": { "tpu_v1": 700, "educational": 100 },
      "peak_tops_int8": { "tpu_v1": 92, "educational_8x8_at_100mhz": 0.0064 },
      "memory_hierarchy": {
        "on_chip_sram_mb": { "tpu_v1": 28, "educational_kb": 8 },
        "hbm_gbps": { "tpu_v1": 600 }
      },
      "power_w": { "tpu_v1": 75 },
      "utilization_note": "Weight-stationary dataflow achieves >85% utilization for dense GEMM when grid divides evenly into matrix dimensions",
      "note": "Systolic array cycles = K + 2P − 2 for a P×P tile computing C[M×N] = A[M×K]·B[K×N] with K the inner dimension"
    },
    "simt_gpu": {
      "name": "SIMT GPU (Graphics / Compute)",
      "warp_width": { "nvidia": 32, "amd": 64, "intel": 16 },
      "register_file_per_sm_kb": { "nvidia_ampere": 256, "educational": 16 },
      "shared_memory_per_sm_kb": { "nvidia_ampere": 164, "educational": 8 },
      "sm_count": { "nvidia_a100": 108, "rtx_3060": 28, "intel_iris_xe_155u": 96 },
      "cuda_cores_per_sm": { "nvidia_ampere": 64 },
      "clock_mhz": { "nvidia_a100": 1410, "intel_iris_xe_155u": 1450 },
      "memory_bandwidth_gbps": { "nvidia_a100_hbm2e": 1555, "intel_iris_xe_lpddr5": 68 },
      "power_w": { "nvidia_a100": 400, "intel_iris_xe_155u_tdp": 28 },
      "note": "Intel Core Ultra 7 155U integrated Intel Graphics: 96 EU, 1450 MHz, LPDDR5x-7467 shared memory"
    },
    "forth_engine": {
      "name": "Forth Engine (stack-based educational)",
      "stack_depth": 32,
      "cell_width_bits": 16,
      "word_count": 64,
      "core_words": ["DUP", "DROP", "SWAP", "OVER", "+", "-", "*", "/", "AND", "OR", "XOR", "@", "!", ":", ";"],
      "note": "Stack-based Forth interpreter — matches the IL-8 CPU's OUT/IN port model"
    }
  },
  "equations": [
    "systolic cycles for P×P array, K inner dim, M×N output tiles: cycles = ceil(M/P) · ceil(N/P) · (K + 2P − 2)",
    "systolic utilization: U = (M·N·K) / (tiles · (K + 2P − 2) · P²) for dense GEMM",
    "SIMT throughput: ops_per_cycle = SM_count · cores_per_SM · ops_per_core_per_clock",
    "Amdahl's law: speedup = 1 / ((1 − p) + p/s) where p is the parallel fraction, s is the speedup of the parallel part",
    "Roofline model: achievable_FLOPs = min(peak_FLOPs, arithmetic_intensity · peak_bandwidth)",
    "Amdahl-based pipeline speedup: S_pipe = N_stages when perfectly balanced; actual = N_stages · (1 / (1 + pipeline_overhead))"
  ],
  "valid_operating_envelope": {
    "riscv_rv32im": { "vdd_range_v": [0.8, 1.2], "temp_range_c": [-40, 125] },
    "systolic_tpu": { "vdd_range_v": [0.7, 0.9], "temp_range_c": [-40, 100], "note": "INT8 accumulator overflow threshold: K_max for INT32 accumulator = 2^31 / (255 × 255) ≈ 33038" },
    "simt_gpu": { "temp_range_c": [0, 100], "power_tdp_w": 28 }
  },
  "failure_thresholds": {
    "int32_accumulator_overflow": {
      "condition": "accumulated product sum exceeds 2^31 − 1 (INT32 max) in QDQ INT8 GEMM",
      "detection": "requires per-tile saturation check in the systolic array design",
      "mitigation": "INT32 accumulator safely handles K up to 33038 for INT8 inputs (±127 × ±127 = 16129 max product per MAC)"
    },
    "thermal_throttle": {
      "condition": "junction temperature exceeds TDP-specified limit",
      "effect": "clock throttling, potential permanent damage above absolute maximum rating"
    }
  }
}
`,XE=`{
  "id": "06_failure_physics_thresholds",
  "domain": "failure-physics",
  "provenance_status": "verified_offline_standard",
  "source_citation": "Black's equation (J.R. Black, IEEE Proc. 1967); Planck's law of blackbody radiation (Planck, 1901); Wikipedia: Black-body radiation (for CIE 1931 RGB color mapping); Bluefors XLD400 dilution refrigerator datasheet; SKY130 PDK reliability specifications",
  "source_url": "https://en.wikipedia.org/wiki/Black-body_radiation, https://en.wikipedia.org/wiki/Electromigration, https://www.bluefors.com/products/xld400-dilution-refrigerator",
  "license_or_access": "public domain (physics equations); SKY130 PDK reliability specs (Apache-2.0)",
  "parameters": {
    "blackbody_rgb_temperature_curve": {
      "description": "Blackbody radiation visible colour mapped from Planck's law to RGB via CIE 1931 colour space — used for thermal-glow shader effects from 300 K to 2500 K",
      "equation": "B(λ,T) = (2·h·c²/λ⁵) · 1/(exp(h·c/(λ·k_B·T)) − 1)",
      "temperature_range_k": [
        300,
        2500
      ],
      "visible_color_mapping": {
        "300_k": {
          "rgb": [
            0,
            0,
            0
          ],
          "note": "room temperature — invisible (pure IR)"
        },
        "500_k": {
          "rgb": [
            64,
            0,
            0
          ],
          "note": "barely visible dark red glow"
        },
        "750_k": {
          "rgb": [
            153,
            0,
            0
          ],
          "note": "dark cherry red — hot resistor"
        },
        "1000_k": {
          "rgb": [
            255,
            40,
            0
          ],
          "note": "bright cherry red — stressed metal trace"
        },
        "1500_k": {
          "rgb": [
            255,
            128,
            24
          ],
          "note": "orange — metal near fusing"
        },
        "2000_k": {
          "rgb": [
            255,
            190,
            76
          ],
          "note": "yellow-white — metal at melting threshold"
        },
        "2500_k": {
          "rgb": [
            255,
            225,
            155
          ],
          "note": "near-white — arc/plasma temperature"
        }
      },
      "shader_formula": "vec3 blackbodyRGB(float T_k) { return T_to_RGB_lut(T_k); } — precomputed lookup or analytic approximation (Tanner Helland approximation, documented at http://www.tannerhelland.com/4435/convert-temperature-rgb)",
      "references": [
        "Tanner Helland, 'How to convert temperature (K) to RGB: algorithm and sample code' (2012)",
        "CIE 1931 colour space standard"
      ]
    },
    "gate_oxide_tddb": {
      "description": "Time-Dependent Dielectric Breakdown: Vgs > 1.95 V on SKY130 core oxide triggers exponential acceleration of breakdown probability",
      "model": "E-model: ln(TTF) = ln(A) − γ·Vgs, where γ ≈ 300 dec/V for 4.1 nm SiO2",
      "vgs_threshold_v": 1.95,
      "vdd_nominal_v": 1.8,
      "gamma_dec_per_v": 300,
      "note": "Above 1.95 V the TDDB lifetime drops below 10 years at 125 °C; below 1.8 V the lifetime exceeds 100 years",
      "hard_breakdown": {
        "vgs_irreversible_v": 3,
        "note": "above ~3 V the gate oxide hard-breaks down permanently (device destroyed) — well above the 1.95 V SOA ceiling"
      },
      "shader_effect": "glow intensity proportional to exp((Vgs − 1.95) · γ) when Vgs > 1.95; arc spark effect when Vgs > 3.0",
      "references": [
        "J.R. Black, 'Electromigration — A brief survey and some recent results', IEEE Trans. Electron Devices, ED-16, 338 (1969)",
        "SKY130 PDK reliability model documentation"
      ]
    },
    "metal_trace_joule_heating_fusing": {
      "description": "Joule heating I²R raises the metal trace temperature; above the fusing temperature the trace melts and breaks",
      "equations": [
        "Joule heating power: P = I²·R(T)",
        "Temperature rise (quasi-static): ΔT = P · R_th (thermal resistance)",
        "Onderdonk fusing equation (short pulse): I_f = S · sqrt((T_melt − T_amb) / (t · ρ_0 · α))",
        "Black's equation (EM lifetime): MTTF = A · J^(−n) · exp(E_a/(k_B·T)), n ≈ 2, E_a ≈ 0.7 eV (Al)"
      ],
      "thresholds": {
        "cu_melting_c": 1085,
        "cu_thermal_expansion_coeff_per_k": 0.0000165,
        "al_melting_c": 660,
        "fr4_delamination_c": 260,
        "si_thermal_runaway_c": 200,
        "note": "Metal trace glow visible above ~750 K; Si thermal runaway above 200 °C (junction); FR-4 delamination above 260 °C"
      },
      "shader_effect": "trace colour transitions from normal → warm → glowing red → orange → white-hot as temperature rises; smoke particles above delamination threshold; trace vanishes at fusing point",
      "visual_thresholds_c": {
        "normal": 25,
        "warm_glow_start": 500,
        "red_glow": 750,
        "orange_glow": 1500,
        "white_hot": 2000,
        "cu_fusing": 1085,
        "fr4_smoke": 260
      }
    },
    "cryogenic_mixing_chamber_quench": {
      "description": "Dilution refrigerator mixing chamber at 15 mK: when the heat load exceeds the cooling capacity, temperature rises, causing decoherence collapse of superconducting qubits",
      "cooling_capacity": {
        "stage_15mk_w": 0.012,
        "stage_100mk_w": 0.1,
        "stage_4k_w": 1.5,
        "device": "Bluefors XLD400"
      },
      "equations": [
        "dilution cooling power: Q_cool(T) ∝ (T/T_c)² — approximately quadratic below T_c ≈ 100 mK",
        "thermal time constant: τ_th = C_th · R_th where C_th is the thermal mass and R_th the thermal resistance",
        "temperature rise: dT/dt = (Q_load − Q_cool(T)) / C_th — positive dT/dt means warming"
      ],
      "thresholds": {
        "quench_condition": "Q_load > Q_cooling_capacity (12 mW at 15 mK)",
        "decoherence_collapse": "temperature rises above the superconducting transition (~1.2 K for Al) → all qubits lose coherence",
        "recovery_time_hours": 4,
        "note": "thermal quench causes hours of recovery time — a significant practical failure mode for quantum computing"
      },
      "shader_effect": "chamber temperature indicator transitions from cold blue → warming → red warning → thermal quench alarm; qubit hologram dissolves when T > T_c",
      "visual_thresholds": {
        "normal_15mk": {
          "color": "cold blue",
          "opqacity": 1
        },
        "warming_100mk": {
          "color": "light blue",
          "opacity": 0.7
        },
        "warning_1k": {
          "color": "orange",
          "opacity": 0.4
        },
        "quench_4k": {
          "color": "red alarm",
          "opacity": 0
        }
      }
    },
    "si_thermal_runaway": {
      "description": "Silicon junction thermal runaway: above ~200 °C the leakage current doubles every ~10 °C, creating positive thermal feedback",
      "equation": "I_leakage(T) = I_0 · exp(−E_g/(2·k_B·T)) — doubles every ~10 °C at 300 K",
      "threshold_c": 200,
      "note": "thermal runaway destroys the device if the heatsink cannot dissipate the increasing leakage power"
    }
  },
  "valid_operating_envelope": {
    "note": "Failure thresholds define the BOUNDARIES of the valid operating envelope. Operating outside these thresholds triggers the visual failure effects shown in the Electrophysics Lab 3D interface."
  },
  "equations": [
    "Planck's law: B(λ,T) = (2·h·c²/λ⁵) · 1/(exp(h·c/(λ·k_B·T)) − 1) — blackbody spectral radiance",
    "Black's EM equation: MTTF = A · J^(−n) · exp(E_a/(k_B·T)) — electromigration mean time to failure",
    "Joule heating: P = I²·R(T) — resistive heating",
    "Onderdonk fusing: I_f = S · sqrt((T_melt − T_amb)/(t · ρ_0 · α)) — short-pulse fusing current",
    "Thermal quench: dT/dt = (Q_load − Q_cool)/C_th — temperature rise rate",
    "Thermal runaway: I_leak(T) = I_0 · exp(−E_g/(2·k_B·T)) — silicon junction leakage",
    "TDDB (E-model): ln(TTF) = ln(A) − γ·Vgs — time-dependent dielectric breakdown"
  ],
  "failure_thresholds": {
    "gate_oxide_tddb": {
      "vgs_threshold_v": 1.95,
      "gamma_dec_per_v": 300,
      "note": "SKY130 core SOA ceiling"
    },
    "cu_melting_c": 1085,
    "fr4_delamination_c": 260,
    "si_thermal_runaway_c": 200,
    "cryo_quench_15mk_w": 0.012,
    "note": "Detailed thresholds in the parameters section and failure_thresholds sub-objects above"
  }
}
`,jE="01_fundamental_constants",YE="fundamental-physics",KE="verified_offline_standard",$E="CODATA 2022 recommended values of the fundamental physical constants (2022 adjustment). NIST SP 96b. Published 2024. DOI: 10.5281/zenodo.10767569",QE="https://physics.nist.gov/cuu/Constants/index.html",JE="public domain (NIST)",ZE={elementary_charge:{symbol:"q_e",value:1602176634e-28,unit:"C",si_prefix:null,uncertainty:0,exact:!0,note:"Defined exactly since SI 2019 redefinition"},boltzmann_constant:{symbol:"k_B",value:1380649e-29,unit:"J/K",si_prefix:null,uncertainty:0,exact:!0,note:"Defined exactly since SI 2019 redefinition"},reduced_planck_constant:{symbol:"ħ",value:10545718176461565e-50,unit:"J·s",si_prefix:null,uncertainty:0,exact:!0,note:"Derived from exact h = 6.62607015e-34 J·s and exact π"},speed_of_light:{symbol:"c",value:299792458,unit:"m/s",si_prefix:null,uncertainty:0,exact:!0,note:"Defined exactly since SI 1983"},vacuum_permittivity:{symbol:"ε_0",value:88541878128e-22,unit:"F/m",si_prefix:null,uncertainty:13e-22,exact:!1,note:"Measured; related to μ_0 and c by ε_0 = 1/(μ_0·c²). Relative uncertainty 1.5e-10 since CODATA 2018"},vacuum_permeability:{symbol:"μ_0",value:125663706127e-17,unit:"N/A²",si_prefix:null,uncertainty:19e-20,exact:!1,note:"Relative uncertainty 1.5e-10 since CODATA 2018 (no longer exact since SI 2019)"},stefan_boltzmann_constant:{symbol:"σ_SB",value:5670374419e-17,unit:"W/(m²·K⁴)",si_prefix:null,uncertainty:0,exact:!0,note:"Derived exactly from σ_SB = π²·k_B⁴/(60·ħ³·c²)"},avogadro_constant:{symbol:"N_A",value:602214076e15,unit:"1/mol",si_prefix:null,uncertainty:0,exact:!0,note:"Defined exactly since SI 2019"}},eT={thermal_voltage_V_T_300K:{symbol:"V_T",value:.025852,unit:"V",equation:"V_T = k_B·T/q_e",conditions:{T:300,T_unit:"K"},note:"Thermal voltage at 300 K (≈26.85 mV)"},thermal_voltage_V_T_formula:{equation:"V_T(T) = k_B·T/q_e",unit:"V",note:"Use for any temperature; at 27 °C (300.15 K) V_T ≈ 25.89 mV"}},tT={note:"Fundamental constants are universal; no operating envelope restriction applies"},nT={},iT=["V_T(T) = k_B·T/q_e","σ_SB = π²·k_B⁴/(60·ħ³·c²)","ε_0 = 1/(μ_0·c²)"],rT={id:jE,domain:YE,provenance_status:KE,source_citation:$E,source_url:QE,license_or_access:JE,parameters:ZE,derived:eT,valid_operating_envelope:tT,failure_thresholds:nT,equations:iT},sT="02_semiconductor_pdk_silicon",oT="semiconductor-pdk-and-materials",aT="verified_offline_standard",lT="SKY130A PDK (SkyWater Technology, pinned open_pdks commit 0c1f82326278a0871f0a1fc4bdacf94c88e78e4d); FreePDK45 (NCSU/OSU, North Carolina State University); ASAP7 PDK (Arizona State University); material properties from CRC Handbook of Chemistry and Physics, 103rd ed. and Ioffe Institute semiconductor database",cT="https://github.com/google/skywater-pdk, https://www.skywatertechnology.com/sky130/, https://www.asap.asu.edu/asap7, https://ptm.asu.edu/",uT="Apache-2.0 (SKY130); free academic (FreePDK45); free academic (ASAP7); public CRC/Ioffe data",dT={sky130a:{pdk_name:"SKY130A",foundry:"SkyWater Technology Foundry",technology_node:"130 nm",pinned_open_pdks_commit:"0c1f82326278a0871f0a1fc4bdacf94c88e78e4d",pinned_skywater_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436",nominal_vdd_v:1.8,core_soa_max_vgs_v:1.95,core_soa_note:"Strict 1.95 V core safe-operating-area ceiling for SKY130 core devices (li1 to met5)",metal_stack:{li1:{thickness_nm:250,sheet_resistance_ohm_per_sq:.955,material:"silicided local interconnect"},met1:{thickness_nm:570,sheet_resistance_ohm_per_sq:.125,material:"aluminium (Al) with TiN barrier"},met2:{thickness_nm:845,sheet_resistance_ohm_per_sq:.075,material:"aluminium"},met3:{thickness_nm:1035,sheet_resistance_ohm_per_sq:.055,material:"aluminium"},met4:{thickness_nm:2260,sheet_resistance_ohm_per_sq:.027,material:"aluminium"},met5:{thickness_nm:3390,sheet_resistance_ohm_per_sq:.018,material:"aluminium"}},oxide_thickness_nm:{gate_oxide:4.1,field_oxide:420},gate_pitch_nm:480,vth_nmos_typ_v:.55,vth_pmos_typ_v:-.55,ox_breakdown_field_mv_per_cm:1e3,ox_breakdown_note:"SiO2 intrinsic breakdown ~10 MV/cm; SKY130 practical TDDB-limited operating ceiling set by foundry spec to 1.95 V for core devices"},freepdk45:{pdk_name:"FreePDK45",foundry:"North Carolina State University (virtual/academic)",technology_node:"45 nm planar",nominal_vdd_v:1,gate_pitch_nm:90,ox_breakdown_field_mv_per_cm:1e3,note:"Virtual PDK for academic research; no fabricated silicon. Published nominal VDD = 1.0 V"},asap7:{pdk_name:"ASAP7",foundry:"Arizona State University (virtual/academic)",technology_node:"7 nm FinFET",nominal_vdd_v:.7,gate_pitch_nm:54,fin_height_nm:42,fin_pitch_nm:27,ox_breakdown_field_mv_per_cm:1e3,note:"Virtual predictive PDK from ASU; no fabricated silicon. Published nominal VDD = 0.7 V"}},hT={silicon:{resistivity_ohm_cm_at_300K_doped_1e15:2.3,tcr_per_k:.002,thermal_conductivity_w_per_m_k:148,thermal_conductivity_note:"at 300 K; decreases with T approximately as T^(-1.5) above 100 K",specific_heat_j_per_kg_k:700,density_kg_per_m3:2329,melting_point_c:1414,bandgap_ev_at_300K:1.12},silicon_dioxide:{thermal_conductivity_w_per_m_k:1.4,specific_heat_j_per_kg_k:740,density_kg_per_m3:2220,melting_point_c:1710,dielectric_constant:3.9,breakdown_field_mv_per_cm:1e4},copper:{resistivity_ohm_m_at_300K:168e-10,tcr_per_k:.0039,thermal_conductivity_w_per_m_k:401,specific_heat_j_per_kg_k:385,density_kg_per_m3:8960,melting_point_c:1085,fusing_note:"Joule fusing depends on geometry and pulse duration — use Onderdonk or Preece equations for specific traces"},aluminium:{resistivity_ohm_m_at_300K:265e-10,tcr_per_k:.0043,thermal_conductivity_w_per_m_k:237,specific_heat_j_per_kg_k:900,density_kg_per_m3:2700,melting_point_c:660,electromigration_note:"SKY130 metal is Al with TiN barrier; Black's equation applies for EM lifetime"},gold:{resistivity_ohm_m_at_300K:244e-10,tcr_per_k:.0034,thermal_conductivity_w_per_m_k:318,specific_heat_j_per_kg_k:129,density_kg_per_m3:19300,melting_point_c:1064},niobium:{resistivity_ohm_m_at_300K:15e-8,tcr_per_k:.0026,thermal_conductivity_w_per_m_k:53,specific_heat_j_per_kg_k:265,density_kg_per_m3:8570,melting_point_c:2477,superconducting_transition_k:9.3,note:"Type-II superconductor; used in superconducting quantum circuits"},fr4_pcb:{thermal_conductivity_w_per_m_k:.3,specific_heat_j_per_kg_k:600,density_kg_per_m3:1900,glass_transition_c:130,delamination_c:260,note:"FR-4 standard PCB substrate; Tg ~130 °C, delamination threshold ~260 °C (reflow peak)"}},fT=["Black's equation (electromigration MTTF): MTTF = A · J^(-n) · exp(E_a / (k_B·T)), n ≈ 2 for Al interconnects, E_a ≈ 0.7 eV","Onderdonk fusing equation: I_fuse = S · sqrt(T_melt − T_ambient / (t · ρ_0 · α)) — approximate for short pulses","Joule heating: P = I²·R(T), R(T) = R_0·(1 + α·(T − T_0))","Thermal diffusion (1D): ∂T/∂t = α_D·∂²T/∂x² + q/(ρ·c_p), α_D = k/(ρ·c_p)"],pT={sky130_core:{vgs_max_v:1.95,temp_max_c:125,note:"foundry-specified commercial operating range"},freepdk45:{vdd_max_v:1,note:"virtual academic PDK"},asap7:{vdd_max_v:.7,note:"virtual academic PDK"}},mT={sky130_gate_oxide_tddb:{vgs_threshold_v:1.95,note:"SKY130 core SOA ceiling; exceeding accelerates TDDB exponentially (E-model: ln(MTTF) ∝ −γ·Vgs, γ ≈ 300 dec/V for 4.1 nm SiO2)"},copper_fusing_c:1085,fr4_delamination_c:260,silicon_melting_c:1414,aluminium_fusing_note:"SKY130 metal (Al) fusing depends on current density; for 1 µm wide met1, typical DC fusing current ≈ 5–10 mA"},dn={id:sT,domain:oT,provenance_status:aT,source_citation:lT,source_url:cT,license_or_access:uT,parameters:dT,material_properties:hT,equations:fT,valid_operating_envelope:pT,failure_thresholds:mT},_T="03_multiradix_logic_baselines",gT="multi-radix-logic",vT="verified_offline_standard",yT="SKY130A PDK voltage-level definitions (Phase 0 verified primitives); multi-valued logic noise-margin theory from Hirasuna (1999) and Pécot et al.; radix-economy from Thomas K. Moon (2005), 'Fundamentals of Digital Logic'",xT="https://github.com/google/skywater-pdk, https://en.wikipedia.org/wiki/Multi-valued_logic",ST="Apache-2.0 (SKY130); public domain (theory)",MT={binary_radix2_1p8v:{name:"Binary (radix-2) — 1.8 V SKY130",logic_levels_v:{L:0,H:1.8},noise_margin_low_v:.6,noise_margin_high_v:.6,voltage_levels_v:[0,1.8],nominal_midpoint_v:.9,note:"Standard binary CMOS logic levels at 1.8 V nominal VDD"},quaternary_q4_1p8v_ldo:{name:"Q4 Quaternary — 1.8 V LDO (SKY130 4-level)",logic_levels_v:{0:0,1:.6,2:1.2,3:1.8},voltage_levels_v:[0,.6,1.2,1.8],nominal_midpoints_v:[.3,.9,1.5],noise_margin_per_level_v:.3,note:"Phase 0 verified Q4 voltage map on SKY130 1.8 V LDO rail; 4 distinct levels with 0.6 V spacing"},quaternary_q4_1p65v:{name:"Q4 Quaternary — 1.65 V profile (alternative)",logic_levels_v:{0:0,1:.55,2:1.1,3:1.65},voltage_levels_v:[0,.55,1.1,1.65],nominal_midpoints_v:[.275,.825,1.375],noise_margin_per_level_v:.275,note:"Lower-margin alternative profile for tighter power budgets"},ternary_balanced_1p8v:{name:"Balanced Ternary (radix-3) — 1.8 V",logic_levels_v:{neg1:0,zero:.9,pos1:1.8},voltage_levels_v:[0,.9,1.8],nominal_midpoints_v:[.45,1.35],noise_margin_per_level_v:.45,note:"Balanced ternary: −1, 0, +1 mapped to 0, 0.9, 1.8 V"},ternary_unbalanced_1p8v:{name:"Unbalanced Ternary (radix-3) — 1.8 V",logic_levels_v:{0:0,1:.9,2:1.8},voltage_levels_v:[0,.9,1.8],nominal_midpoints_v:[.45,1.35],noise_margin_per_level_v:.45,note:"Unbalanced ternary: 0, 1, 2 mapped to 0, 0.9, 1.8 V"}},wT=[{cell_name:"q4_thresh_det",function:"quaternary threshold detector — maps analogue input to nearest Q4 digit",gate_count:6,drc_status:"DRC=0 (Magic)",lvs_status:"Netgen unique LVS ✓",pex_status:"RC PEX extracted ✓",sk130_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436"},{cell_name:"q4_inv",function:"quaternary inverter — Q3→Q0, Q2→Q1, Q1→Q2, Q0→Q3",gate_count:6,drc_status:"DRC=0 (Magic)",lvs_status:"Netgen unique LVS ✓",pex_status:"RC PEX extracted ✓",sk130_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436"},{cell_name:"q4_mux4",function:"4:1 quaternary multiplexer — selects one of 4 Q4 inputs by 2-digit selector",gate_count:8,drc_status:"DRC=0 (Magic)",lvs_status:"Netgen unique LVS ✓",pex_status:"RC PEX extracted ✓",sk130_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436"},{cell_name:"q4_half_adder",function:"quaternary half adder — Q4 sum (mod 4) + Q4 carry",gate_count:8,drc_status:"DRC=0 (Magic)",lvs_status:"Netgen unique LVS ✓",pex_status:"RC PEX extracted ✓",sk130_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436"}],ET=["radix_economy: E(r) = r / log₂(r) — the cost-per-digit ratio; minimized at r = e ≈ 2.718, making radix-3 theoretically most economical","noise_margin_NMH = V_OH(min) − V_IH(max); noise_margin_NML = V_IL(max) − V_OL(max)","Q4 levels: L_k = k · VDD / 3 for k = 0..3 with VDD = 1.8 V","binary_levels: L_k = k · VDD for k = 0..1","ternary_levels: L_k = k · VDD / 2 for k = 0..2","theoretical_noise_margin_bounds: NM ≥ VDD / (2·(r − 1)) for r uniformly spaced levels on a railed logic family","Q4 inversion: Q3 → Q0, Q2 → Q1, Q1 → Q2, Q0 → Q3 (equivalent to 3 − Q in mod-4)","Q4 half adder: S = (A + B) mod 4, C = ⌊(A + B) / 4⌋"],TT={vdd_range_v:[1.65,1.95],temperature_range_c:[-40,125],note:"SKY130 commercial operating range; logic-level voltages scale proportionally with VDD"},AT={vgs_overstress_v:1.95,note:"SKY130 core SOA ceiling; the Q4 voltage map (max 1.8 V) is safely below this ceiling"},vf={id:_T,domain:gT,provenance_status:vT,source_citation:yT,source_url:xT,license_or_access:ST,parameters:MT,verified_sky130a_q4_primitives:wT,equations:ET,valid_operating_envelope:TT,failure_thresholds:AT},bT="04_quantum_hardware_modalities",CT="quantum-hardware",RT="verified_offline_standard",PT="Published parameters: Google Sycamore (Arute et al., Nature 574, 505–510, 2019); IBM Quantum (IBM Quantum Development roadmap 2023–2026); QuEra/Harvard neutral-atom (Ebadi et al., Nature 612, 2023); Quantinuum trapped-ion (Mt. Const. from Quantinuum H2); UChicago SNSPD (Reddy et al., APL Photonics); dilution refrigerator specs from Bluefors product datasheets (XLD400)",DT="https://quantumai.google/hardware, https://www.ibm.com/quantum/technology, https://www.quantinuum.com/, https://www.bluefors.com/",LT="public domain (published parameters); institutional (IBM/Google/Quantinuum data cited from peer-reviewed publications)",IT={superconducting_transmon:{name:"Superconducting Transmon QPU",qubit_type:"superconducting transmon (Coplanar Waveguide resonator readout)",typical_frequency_ghz:{min:4,max:6,typical:5},anharmonicity_alpha_mhz:{min:-340,max:-200,typical:-280},t1_us:{min:50,typical:100,max:300},t2_us:{min:50,typical:150,max:300},t2_note:"T2 ≤ 2·T1 by fundamental bound; T2 echo typically 150–300 µs",gate_1q_duration_ns:{typical:25,range:[15,50]},gate_1q_error:{typical:5e-4,best_reported:1e-4},gate_2q_duration_ns:{typical:300,range:[150,600]},gate_2q_error:{typical:.005,best_reported:.001},zz_crosstalk_khz:{typical:50,range:[10,200]},readout_fidelity:{typical:.98,best_reported:.999},mixing_chamber_temp_mk:{typical:15,range:[10,20]},cryo_cooling_power:{stage_4k_w:1.5,stage_100mk_w:.1,stage_15mk_w:.012,note:"Bluefors XLD400 dilution refrigerator; cooling power at each stage — loading above these limits causes thermal quench"},qubit_count_demonstrated:{google_sycamore:53,ibm_condor:1121,ibm_heron:133},citations:["Arute et al., 'Quantum supremacy using a programmable superconducting processor', Nature 574, 505–510 (2019)","IBM Quantum Development Roadmap (2023–2026) — Heron/Condor specifications"]},silicon_photonic_soi:{name:"Silicon Photonic QPU (SOI)",qubit_type:"dual-rail or path-encoded photonic qubit at 1550 nm C-band",wavelength_nm:1550,waveguide_propagation_loss_db_per_cm:{typical:.5,best_reported:.1},directional_coupler_insertion_loss_db:{typical:.1,best_reported:.01},mzi_insertion_loss_db:{typical:1,best_reported:.1},thermo_optic_phase_shifter:{p_pi_mw:{typical:5,range:[1,20]},thermal_crosstalk_db:{typical:-15,range:[-25,-10]},response_time_us:{typical:10,range:[1,100]}},snspd_detector:{efficiency_percent:{typical:90,best_reported:98},dark_count_per_second:{typical:100,best_reported:1},jitter_ps:{typical:30,best_reported:10},reset_time_ns:{typical:20,range:[10,100]}},cryo_requirement:"SNSPD requires cryogenic operation (typically 0.8–2 K on a separate cryostat stage)",citations:["Reddy et al., 'Superconducting nanowire single-photon detectors', APL Photonics 8, 051101 (2023)"]},neutral_atom_rubidium87:{name:"Neutral-Atom Array (87Rb)",qubit_type:"87Rb neutral atom in optical tweezer (ground-state hyperfine qubit)",atom_species:"87Rb",transition_wavelength_nm:{d2_line:780.24,rydberg:480},trap_depth_mhz:{typical:100,range:[20,500]},rydberg_blockade_radius_um:{typical:5,range:[3,10]},rydberg_c6_ghz_um6:{typical:500,note:"C6 coefficient for |60S⟩ Rydberg state"},shuttle_velocity_um_per_s:{typical:100,max:1e3},gate_1q_error:{typical:5e-4},gate_2q_error:{typical:.005,best_reported:.001},atom_count_demonstrated:{harvard_2023:866,quera_2024:256},vacuum_pressure_torr:{typical:1e-10},heating_rate_mk_per_s:{typical:.01},citations:["Ebadi et al., 'Quantum optimization of maximum independent set using Rydberg atom arrays', Nature 612, 71–77 (2023)"]},trapped_ion_ytterbium171:{name:"Trapped-Ion QPU (171Yb+)",qubit_type:"171Yb+ hyperfine qubit (|F=0,m=0⟩ ↔ |F=1,m=1⟩ ground state)",transition_wavelength_nm:{clock_411:411,detection_369:369.53},trap_depth_mhz:{typical:1e3},gate_1q_error:{typical:2e-4,best_reported:1e-4},gate_2q_error:{typical:.001,best_reported:5e-4},gate_2q_type:"Mølmer–Sørensen",shuttle_time_ms:{typical:50,range:[20,200]},ion_count_demonstrated:{quantinuum_h2:56},vacuum_pressure_torr:{typical:1e-11},heating_rate_quanta_per_s:{typical:1},citations:["Quantinuum H2 specifications — 56 qubits, 99.9% 2Q gate fidelity (2024)"]}},NT=["Lindblad master equation: dρ/dt = −i[H,ρ]/ħ + Σ_k γ_k (L_k ρ L_k† − ½{L_k†L_k, ρ}) — open-system dynamics with decoherence rates γ_k","Gate error (average): E = 1 − F_avg where F_avg = (|tr(U†U_ideal)|² + d) / (d + 1)","Rydberg blockade: V(r) = C₆/r⁶; blockade radius r_b = (C₆/Ω)^(1/6) where Ω is the Rabi frequency","Blackbody decoherence rate: Γ_bb = (k_B·T/ħ)² · (2·π·c/(ω₀))² · (1/4π) — thermal photon-induced transitions","Dilution fridge cooling power: Q_cool(T) = Q_ideal(T) · η, Q_ideal(T) ∝ (T/T_c)² for dilution stage"],UT={superconducting:{temperature_mk:[10,20],magnetic_field_ut:[0,1],note:"Dilution fridge, mu-metal shielding"},photonic:{temperature_k:[.8,300],note:"SNSPD cryogenic; waveguide can be room temperature"},neutral_atom:{vacuum_torr:[1e-11,1e-9],temperature_mk:[.01,1],note:"UHV chamber"},trapped_ion:{vacuum_torr:[1e-11,1e-10],note:"UHV trap chamber"}},kT={cryo_quench:{condition:"Q_load > Q_cooling_capacity at any dilution fridge stage",effect:"temperature rises above superconducting transition → decoherence collapse, qubit loss, hours of recovery time",threshold_15mk_w:.012,note:"Exceeding the 15 mK cooling power budget (typically 12 mW for Bluefors XLD400) causes thermal quench"},magnetic_field_intrusion:{condition:"B > B_c for superconducting materials (Nb: B_c ≈ 200 mT)",effect:"superconducting transition, SQUID readout failure"},vacuum_loss:{condition:"pressure > 1e-9 torr for neutral atoms / trapped ions",effect:"collision-induced atom/ion loss, heating rate spikes"}},$0={id:bT,domain:CT,provenance_status:RT,source_citation:PT,source_url:DT,license_or_access:LT,parameters:IT,equations:NT,valid_operating_envelope:UT,failure_thresholds:kT},FT="05_chip_architecture_benchmarks",OT="chip-architecture",BT="verified_offline_standard",zT="RISC-V RV32IM ISA specification (riscv.org, version 2.2); Google TPU v1 paper (Jouppi et al., ISCA 2017); NVIDIA Ampere architecture whitepaper (NVIDIA Corp., 2020); Forth standard (Forth-2012); Systolic array theory from Kung & Su (1984)",VT="https://riscv.org/technical/specifications/, https://ai.googleblog.com/2017/04/quantuping-neural-networks.html, https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf",HT="public (RISC-V ISA spec); published academic (TPU); public (NVIDIA whitepaper)",GT={riscv_rv32im:{name:"RISC-V RV32IM (educational CPU)",isa:"RV32IM (integer + multiply/divide)",register_count:32,register_width_bits:32,instruction_formats:["R","I","S","B","U","J"],base_instructions:47,m_extension_instructions:8,pipeline_stages:5,typical_frequency_mhz:{educational_fpga:50,asic_130nm:100,asic_7nm:1e3},cpi_typical:1.2,power_mw_at_100mhz_130nm:15,note:"Educational reference; the Invention Lab IL-8 ISA is a simplified 8-bit subset for teaching"},systolic_array_tpu:{name:"Systolic-Array Tensor Processing Unit",dataflow:"weight-stationary",grid_size:{tpu_v1:256,educational:8},mac_per_cycle:{tpu_v1:65536,educational_8x8:64},arithmetic:"INT8 multiply + INT32 accumulate",quantization:"per-axis symmetric INT8 with FP32 accumulator (QDQ: Quantize → Dequantize → Quantize)",clock_mhz:{tpu_v1:700,educational:100},peak_tops_int8:{tpu_v1:92,educational_8x8_at_100mhz:.0064},memory_hierarchy:{on_chip_sram_mb:{tpu_v1:28,educational_kb:8},hbm_gbps:{tpu_v1:600}},power_w:{tpu_v1:75},utilization_note:"Weight-stationary dataflow achieves >85% utilization for dense GEMM when grid divides evenly into matrix dimensions",note:"Systolic array cycles = K + 2P − 2 for a P×P tile computing C[M×N] = A[M×K]·B[K×N] with K the inner dimension"},simt_gpu:{name:"SIMT GPU (Graphics / Compute)",warp_width:{nvidia:32,amd:64,intel:16},register_file_per_sm_kb:{nvidia_ampere:256,educational:16},shared_memory_per_sm_kb:{nvidia_ampere:164,educational:8},sm_count:{nvidia_a100:108,rtx_3060:28,intel_iris_xe_155u:96},cuda_cores_per_sm:{nvidia_ampere:64},clock_mhz:{nvidia_a100:1410,intel_iris_xe_155u:1450},memory_bandwidth_gbps:{nvidia_a100_hbm2e:1555,intel_iris_xe_lpddr5:68},power_w:{nvidia_a100:400,intel_iris_xe_155u_tdp:28},note:"Intel Core Ultra 7 155U integrated Intel Graphics: 96 EU, 1450 MHz, LPDDR5x-7467 shared memory"},forth_engine:{name:"Forth Engine (stack-based educational)",stack_depth:32,cell_width_bits:16,word_count:64,core_words:["DUP","DROP","SWAP","OVER","+","-","*","/","AND","OR","XOR","@","!",":",";"],note:"Stack-based Forth interpreter — matches the IL-8 CPU's OUT/IN port model"}},WT=["systolic cycles for P×P array, K inner dim, M×N output tiles: cycles = ceil(M/P) · ceil(N/P) · (K + 2P − 2)","systolic utilization: U = (M·N·K) / (tiles · (K + 2P − 2) · P²) for dense GEMM","SIMT throughput: ops_per_cycle = SM_count · cores_per_SM · ops_per_core_per_clock","Amdahl's law: speedup = 1 / ((1 − p) + p/s) where p is the parallel fraction, s is the speedup of the parallel part","Roofline model: achievable_FLOPs = min(peak_FLOPs, arithmetic_intensity · peak_bandwidth)","Amdahl-based pipeline speedup: S_pipe = N_stages when perfectly balanced; actual = N_stages · (1 / (1 + pipeline_overhead))"],qT={riscv_rv32im:{vdd_range_v:[.8,1.2],temp_range_c:[-40,125]},systolic_tpu:{vdd_range_v:[.7,.9],temp_range_c:[-40,100],note:"INT8 accumulator overflow threshold: K_max for INT32 accumulator = 2^31 / (255 × 255) ≈ 33038"},simt_gpu:{temp_range_c:[0,100],power_tdp_w:28}},XT={int32_accumulator_overflow:{condition:"accumulated product sum exceeds 2^31 − 1 (INT32 max) in QDQ INT8 GEMM",detection:"requires per-tile saturation check in the systolic array design",mitigation:"INT32 accumulator safely handles K up to 33038 for INT8 inputs (±127 × ±127 = 16129 max product per MAC)"},thermal_throttle:{condition:"junction temperature exceeds TDP-specified limit",effect:"clock throttling, potential permanent damage above absolute maximum rating"}},jT={id:FT,domain:OT,provenance_status:BT,source_citation:zT,source_url:VT,license_or_access:HT,parameters:GT,equations:WT,valid_operating_envelope:qT,failure_thresholds:XT},YT="06_failure_physics_thresholds",KT="failure-physics",$T="verified_offline_standard",QT="Black's equation (J.R. Black, IEEE Proc. 1967); Planck's law of blackbody radiation (Planck, 1901); Wikipedia: Black-body radiation (for CIE 1931 RGB color mapping); Bluefors XLD400 dilution refrigerator datasheet; SKY130 PDK reliability specifications",JT="https://en.wikipedia.org/wiki/Black-body_radiation, https://en.wikipedia.org/wiki/Electromigration, https://www.bluefors.com/products/xld400-dilution-refrigerator",ZT="public domain (physics equations); SKY130 PDK reliability specs (Apache-2.0)",e2={blackbody_rgb_temperature_curve:{description:"Blackbody radiation visible colour mapped from Planck's law to RGB via CIE 1931 colour space — used for thermal-glow shader effects from 300 K to 2500 K",equation:"B(λ,T) = (2·h·c²/λ⁵) · 1/(exp(h·c/(λ·k_B·T)) − 1)",temperature_range_k:[300,2500],visible_color_mapping:{"300_k":{rgb:[0,0,0],note:"room temperature — invisible (pure IR)"},"500_k":{rgb:[64,0,0],note:"barely visible dark red glow"},"750_k":{rgb:[153,0,0],note:"dark cherry red — hot resistor"},"1000_k":{rgb:[255,40,0],note:"bright cherry red — stressed metal trace"},"1500_k":{rgb:[255,128,24],note:"orange — metal near fusing"},"2000_k":{rgb:[255,190,76],note:"yellow-white — metal at melting threshold"},"2500_k":{rgb:[255,225,155],note:"near-white — arc/plasma temperature"}},shader_formula:"vec3 blackbodyRGB(float T_k) { return T_to_RGB_lut(T_k); } — precomputed lookup or analytic approximation (Tanner Helland approximation, documented at http://www.tannerhelland.com/4435/convert-temperature-rgb)",references:["Tanner Helland, 'How to convert temperature (K) to RGB: algorithm and sample code' (2012)","CIE 1931 colour space standard"]},gate_oxide_tddb:{description:"Time-Dependent Dielectric Breakdown: Vgs > 1.95 V on SKY130 core oxide triggers exponential acceleration of breakdown probability",model:"E-model: ln(TTF) = ln(A) − γ·Vgs, where γ ≈ 300 dec/V for 4.1 nm SiO2",vgs_threshold_v:1.95,vdd_nominal_v:1.8,gamma_dec_per_v:300,note:"Above 1.95 V the TDDB lifetime drops below 10 years at 125 °C; below 1.8 V the lifetime exceeds 100 years",hard_breakdown:{vgs_irreversible_v:3,note:"above ~3 V the gate oxide hard-breaks down permanently (device destroyed) — well above the 1.95 V SOA ceiling"},shader_effect:"glow intensity proportional to exp((Vgs − 1.95) · γ) when Vgs > 1.95; arc spark effect when Vgs > 3.0",references:["J.R. Black, 'Electromigration — A brief survey and some recent results', IEEE Trans. Electron Devices, ED-16, 338 (1969)","SKY130 PDK reliability model documentation"]},metal_trace_joule_heating_fusing:{description:"Joule heating I²R raises the metal trace temperature; above the fusing temperature the trace melts and breaks",equations:["Joule heating power: P = I²·R(T)","Temperature rise (quasi-static): ΔT = P · R_th (thermal resistance)","Onderdonk fusing equation (short pulse): I_f = S · sqrt((T_melt − T_amb) / (t · ρ_0 · α))","Black's equation (EM lifetime): MTTF = A · J^(−n) · exp(E_a/(k_B·T)), n ≈ 2, E_a ≈ 0.7 eV (Al)"],thresholds:{cu_melting_c:1085,cu_thermal_expansion_coeff_per_k:165e-7,al_melting_c:660,fr4_delamination_c:260,si_thermal_runaway_c:200,note:"Metal trace glow visible above ~750 K; Si thermal runaway above 200 °C (junction); FR-4 delamination above 260 °C"},shader_effect:"trace colour transitions from normal → warm → glowing red → orange → white-hot as temperature rises; smoke particles above delamination threshold; trace vanishes at fusing point",visual_thresholds_c:{normal:25,warm_glow_start:500,red_glow:750,orange_glow:1500,white_hot:2e3,cu_fusing:1085,fr4_smoke:260}},cryogenic_mixing_chamber_quench:{description:"Dilution refrigerator mixing chamber at 15 mK: when the heat load exceeds the cooling capacity, temperature rises, causing decoherence collapse of superconducting qubits",cooling_capacity:{stage_15mk_w:.012,stage_100mk_w:.1,stage_4k_w:1.5,device:"Bluefors XLD400"},equations:["dilution cooling power: Q_cool(T) ∝ (T/T_c)² — approximately quadratic below T_c ≈ 100 mK","thermal time constant: τ_th = C_th · R_th where C_th is the thermal mass and R_th the thermal resistance","temperature rise: dT/dt = (Q_load − Q_cool(T)) / C_th — positive dT/dt means warming"],thresholds:{quench_condition:"Q_load > Q_cooling_capacity (12 mW at 15 mK)",decoherence_collapse:"temperature rises above the superconducting transition (~1.2 K for Al) → all qubits lose coherence",recovery_time_hours:4,note:"thermal quench causes hours of recovery time — a significant practical failure mode for quantum computing"},shader_effect:"chamber temperature indicator transitions from cold blue → warming → red warning → thermal quench alarm; qubit hologram dissolves when T > T_c",visual_thresholds:{normal_15mk:{color:"cold blue",opqacity:1},warming_100mk:{color:"light blue",opacity:.7},warning_1k:{color:"orange",opacity:.4},quench_4k:{color:"red alarm",opacity:0}}},si_thermal_runaway:{description:"Silicon junction thermal runaway: above ~200 °C the leakage current doubles every ~10 °C, creating positive thermal feedback",equation:"I_leakage(T) = I_0 · exp(−E_g/(2·k_B·T)) — doubles every ~10 °C at 300 K",threshold_c:200,note:"thermal runaway destroys the device if the heatsink cannot dissipate the increasing leakage power"}},t2={note:"Failure thresholds define the BOUNDARIES of the valid operating envelope. Operating outside these thresholds triggers the visual failure effects shown in the Electrophysics Lab 3D interface."},n2=["Planck's law: B(λ,T) = (2·h·c²/λ⁵) · 1/(exp(h·c/(λ·k_B·T)) − 1) — blackbody spectral radiance","Black's EM equation: MTTF = A · J^(−n) · exp(E_a/(k_B·T)) — electromigration mean time to failure","Joule heating: P = I²·R(T) — resistive heating","Onderdonk fusing: I_f = S · sqrt((T_melt − T_amb)/(t · ρ_0 · α)) — short-pulse fusing current","Thermal quench: dT/dt = (Q_load − Q_cool)/C_th — temperature rise rate","Thermal runaway: I_leak(T) = I_0 · exp(−E_g/(2·k_B·T)) — silicon junction leakage","TDDB (E-model): ln(TTF) = ln(A) − γ·Vgs — time-dependent dielectric breakdown"],i2={gate_oxide_tddb:{vgs_threshold_v:1.95,gamma_dec_per_v:300,note:"SKY130 core SOA ceiling"},cu_melting_c:1085,fr4_delamination_c:260,si_thermal_runaway_c:200,cryo_quench_15mk_w:.012,note:"Detailed thresholds in the parameters section and failure_thresholds sub-objects above"},Ir={id:YT,domain:KT,provenance_status:$T,source_citation:QT,source_url:JT,license_or_access:ZT,parameters:e2,valid_operating_envelope:t2,equations:n2,failure_thresholds:i2},r2="invention-lab/reference-library-manifest/1",s2="2026-11-19T20:13:44.042Z",o2=[{file:"01_fundamental_constants.json",sha256:"11b055141ee1fea01ec6e0de7201972f5ebad765274c4a06f9fa9341dd2dcb66",size_bytes:3216},{file:"02_semiconductor_pdk_silicon.json",sha256:"c123fc5ba2b2a57ca4ccee4fdb16d713d9a79f0266d6711bae464d92e3ebfa37",size_bytes:6624},{file:"03_multiradix_logic_baselines.json",sha256:"d09b3c7f5f518756ed42507ebc11996b3c730209871f030a3f300f7ecf8aa692",size_bytes:4937},{file:"04_quantum_hardware_modalities.json",sha256:"ad82899562507eed38774e9dbd9fa07b82c8a47e7129b6c887edd9638131a1be",size_bytes:7434},{file:"05_chip_architecture_benchmarks.json",sha256:"8d2b9a8e530df0c4190b467cc07b9da3fb0b82e76c0d466a42d6bb0d0e59925d",size_bytes:5168},{file:"06_failure_physics_thresholds.json",sha256:"8b74e7eab2dd4323176811c7f7ba252c7563819c20d688ad443da6f4475ba239",size_bytes:8582}],Q0={format:r2,generatedAt:s2,files:o2},a2={"01_fundamental_constants.json":VE,"02_semiconductor_pdk_silicon.json":HE,"03_multiradix_logic_baselines.json":GE,"04_quantum_hardware_modalities.json":WE,"05_chip_architecture_benchmarks.json":qE,"06_failure_physics_thresholds.json":XE};async function l2(s){const e=new TextEncoder().encode(s),t=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(t)).map(r=>r.toString(16).padStart(2,"0")).join("")}async function c2(){const s=Q0,e=[];for(const r of s.files){const o=a2[r.file];if(o===void 0){e.push({file:r.file,expected:r.sha256,actual:"(missing)",ok:!1});continue}const l=await l2(o);e.push({file:r.file,expected:r.sha256,actual:l,ok:l===r.sha256})}const t=e.filter(r=>r.ok).length;return{verified:t,total:e.length,allVerified:t===e.length,details:e}}const Ln={constants:rT,semiconductor:dn,multiradix:vf,quantum:$0,architecture:jT,failures:Ir,manifest:Q0},r0={VDD_NOMINAL_V:dn.parameters.sky130a.nominal_vdd_v,VGS_SOA_MAX_V:dn.parameters.sky130a.core_soa_max_vgs_v,VTH_NMOS_V:dn.parameters.sky130a.vth_nmos_typ_v,VTH_PMOS_V:dn.parameters.sky130a.vth_pmos_typ_v,GATE_OXIDE_NM:dn.parameters.sky130a.oxide_thickness_nm.gate_oxide,METAL_STACK:dn.parameters.sky130a.metal_stack};vf.parameters.quaternary_q4_1p8v_ldo.voltage_levels_v;const Gh=vf.verified_sky130a_q4_primitives;dn.material_properties.copper.resistivity_ohm_m_at_300K,dn.material_properties.copper.tcr_per_k,dn.material_properties.copper.thermal_conductivity_w_per_m_k,dn.material_properties.copper.specific_heat_j_per_kg_k,dn.material_properties.copper.density_kg_per_m3,dn.material_properties.copper.melting_point_c;dn.material_properties.fr4_pcb.thermal_conductivity_w_per_m_k,dn.material_properties.fr4_pcb.specific_heat_j_per_kg_k,dn.material_properties.fr4_pcb.density_kg_per_m3,dn.material_properties.fr4_pcb.delamination_c,dn.material_properties.fr4_pcb.glass_transition_c;Ir.failure_thresholds.gate_oxide_tddb.vgs_threshold_v,Ir.failure_thresholds.gate_oxide_tddb.gamma_dec_per_v,Ir.failure_thresholds.cu_melting_c,Ir.failure_thresholds.fr4_delamination_c,Ir.failure_thresholds.si_thermal_runaway_c,Ir.failure_thresholds.cryo_quench_15mk_w,Ir.parameters.blackbody_rgb_temperature_curve.visible_color_mapping;const cc=$0.parameters.superconducting_transmon;class u2{group=new An;modes;fridgePlates=[];plateLabelSprites=[];atomGrid;qubitHolo;coldLight;stageTempsK=[300,4,.1,.015];modeGroups=[];constructor(){const e=this.buildFridge(),t=this.buildMziChip(),r=this.buildTweezerGrid();t.visible=!1,r.visible=!1,this.modes={fridge:e,mzi:t,tweezer:r},this.modeGroups=[e,t,r],this.group.add(e,t,r),this.coldLight=new Ra(7325951,6,6,2),this.coldLight.position.set(0,.75,0),this.group.add(this.coldLight)}buildFridge(){const e=new An,t=[{y:3.1,radius:1.35,label:"300 K",tempK:300},{y:2.25,radius:1.15,label:"4 K",tempK:4},{y:1.45,radius:.95,label:"100 mK",tempK:.1},{y:.72,radius:.78,label:"15 mK",tempK:.015}];for(const M of[-1.05,1.05])for(const E of[-1.05,1.05]){const y=new Ne(new gn(.045,.045,3.4,10),cn.stainless);y.position.set(M,1.75,E),y.castShadow=!0,e.add(y)}const r=new Ne(new gn(.52,.52,.5,28),cn.stainless);r.position.y=3.55,r.castShadow=!0,e.add(r);for(const M of t){const E=new Ne(new gn(M.radius,M.radius,.1,40),cn.brushedGold);E.position.y=M.y,E.castShadow=!0,E.receiveShadow=!0,E.name=`stage-${M.label}`,e.add(E),this.fridgePlates.push(E);const y=t.indexOf(M);if(y>0){const C=t[y-1],A=new Ne(new gn(.05,.05,C.y-M.y,10),cn.goldPolished);A.position.set(0,(C.y+M.y)/2,0),e.add(A)}const x=_n(M.label,{scale:.52,color:"#cfe6ff"});x.position.set(M.radius+.55,M.y,0),e.add(x),this.plateLabelSprites.push(x)}for(let M=0;M<7;M++){const E=M/7*Math.PI*2+.3,y=[new N(Math.cos(E)*.4,3.4,Math.sin(E)*.4),new N(Math.cos(E)*.85,2.3,Math.sin(E)*.85),new N(Math.cos(E+.25)*.72,1.5,Math.sin(E+.25)*.72),new N(Math.cos(E)*.55,.85,Math.sin(E)*.55)],x=new Aa(y),C=new Ne(new vo(x,24,.028,8,!1),cn.stainless);C.castShadow=!0,e.add(C)}const o=new Ne(new Tt(.5,.06,.5),cn.niobiumDark);o.position.set(0,.82,0),e.add(o);const l=new Ne(new Tt(.44,.008,.44),new We({color:857120,metalness:.6,roughness:.25}));l.position.set(0,.855,0),e.add(l);const u=new We({color:15122780,metalness:1,roughness:.2,emissive:9071389,emissiveIntensity:.25}),d=new Ur(new Tt(.05,.006,.05),u,16),h=new Ot;let p=0;for(let M=0;M<4;M++)for(let E=0;E<4;E++)h.position.set(-.15+M*.1,.862,-.15+E*.1),h.updateMatrix(),d.setMatrixAt(p++,h.matrix);e.add(d);const m=_n("16-qubit transmon die · 15 mK",{scale:.8,color:"#9fd8ff"});m.position.set(0,1.12,0),e.add(m);const g=er(1,6476031);g.position.set(-.75,.77,.45),e.add(g);const v=er(1,16751964);v.position.set(.72,.77,-.42),e.add(v);const S=new Ne(new mf(.34,2),new We({color:6476031,emissive:2785208,emissiveIntensity:.7,wireframe:!0,transparent:!0,opacity:.8}));return S.position.set(0,1.45,0),S.name="qubitHolo",e.add(S),this.qubitHolo=S,e}buildMziChip(){const e=new An,t=new Ne(new Tt(1.7,.09,1.2),cn.siliconDie);t.position.y=1.35,t.castShadow=!0,e.add(t);const r=new Ne(new Tt(1.55,.02,1.05),new We({color:2305602,metalness:.5,roughness:.2}));r.position.y=1.41,e.add(r);const o=new We({color:16761963,emissive:13666858,emissiveIntensity:1.4,metalness:.3,roughness:.3}),l=Ln.quantum.parameters.silicon_photonic_soi;for(const g of[-.09,.09]){const v=[new N(-.7,1.425,g),new N(-.25,1.425,g*1.8),new N(.3,1.425,g*1.8),new N(.72,1.425,0)],S=new Aa(v),M=new Ne(new vo(S,32,.016,8,!1),o);e.add(M)}const u=new Ne(new Tt(.16,.03,.3),cn.brushedGold);u.position.set(-.05,1.435,0),e.add(u);const d=_n("MZI photonic chip · 1550 nm · loss 0.5 dB/cm",{scale:1,color:"#ffd9a0"});d.position.set(0,1.72,0),e.add(d);const h=_n(`MZI IL ${l.mzi_insertion_loss_db.typical} dB · π-shift ${l.thermo_optic_phase_shifter.p_pi_mw.typical} mW`,{scale:.72,color:"#c9b08a"});h.position.set(0,1.6,0),e.add(h);const p=er(.9,16761963);p.position.set(-.95,1.4,.35),e.add(p);const m=er(.9,6476031);return m.position.set(.95,1.4,-.3),e.add(m),e}buildTweezerGrid(){const e=new An,t=new Ne(new Tt(2.4,.12,1.8),cn.plasticDark);t.position.y=1.2,t.castShadow=!0,e.add(t);const r=Ln.quantum.parameters.neutral_atom_rubidium87,o=new We({color:16739722,emissive:13777502,emissiveIntensity:1.6,metalness:.1,roughness:.4}),l=new Ur(new Ca(.035,10,8),o,64),u=new Ot;let d=0;for(let v=0;v<8;v++)for(let S=0;S<8;S++)u.position.set(-.42+v*.12,1.38,-.42+S*.12),u.updateMatrix(),l.setMatrixAt(d++,u.matrix);l.name="atomGrid",e.add(l),this.atomGrid=l;const h=new Mo({color:8042751,transparent:!0,opacity:.35}),p=new Ne(new gn(.05,.05,2.6,10),h);p.rotation.z=Math.PI/2,p.position.set(0,1.42,0),e.add(p);const m=_n("87Rb tweezer grid · 8×8 · Rydberg 480 nm",{scale:1.05,color:"#ffb3c2"});m.position.set(0,1.78,0),e.add(m);const g=_n(`blockade r_b ${r.rydberg_blockade_radius_um.typical} µm · C₆ ${r.rydberg_c6_ghz_um6.typical} GHz·µm⁶`,{scale:.72,color:"#c9a2ad"});return g.position.set(0,1.66,0),e.add(g),e}setMode(e){for(const t of Object.keys(this.modes))this.modes[t].visible=t===e}setStageTemps(e){this.stageTempsK=e;for(let t=0;t<this.fridgePlates.length&&t<e.length;t++){const r=this.fridgePlates[t].material,o=e[t];o<=4?(r.emissive.setHex(1454143),r.emissiveIntensity=.9):o<100?(r.emissive.setHex(6969887),r.emissiveIntensity=.7):o<1200?(r.emissive.setHex(10115602),r.emissiveIntensity=.9):(r.emissive.setHex(11739168),r.emissiveIntensity=1.4)}if(this.qubitHolo){const r=(e[3]??.015)<1.2,o=this.qubitHolo.material;o.opacity=r?.8:.06,o.emissiveIntensity=r?.7:.05,this.coldLight.intensity=r?6:.4,this.coldLight.color.setHex(r?7325951:16732208)}}update(e,t){this.qubitHolo?.visible&&(this.qubitHolo.rotation.y+=e*.6,this.qubitHolo.rotation.x=Math.sin(t*.6)*.12),this.atomGrid?.visible}}const rs=[{key:"substrate",name:"Substrate",thickness:.22},{key:"nwell",name:"nwell",thickness:.05},{key:"psub",name:"psub",thickness:.05},{key:"diffusion",name:"Diffusion",thickness:.05},{key:"poly",name:"Poly",thickness:.05},{key:"li1",name:"li1",thickness:.05},{key:"mcon",name:"mcon",thickness:.07},{key:"met1",name:"met1",thickness:.09},{key:"via",name:"via",thickness:.07},{key:"met2",name:"met2",thickness:.1},{key:"via2",name:"via2",thickness:.07},{key:"met3",name:"met3",thickness:.12}];class d2{group=new An;layers=[];primitiveCells=[];peelT=0;peelGoal=0;crossDepthGoal=rs.length;crossDepthT=rs.length;flowCurves=[];constructor(){this.buildWafer(),this.buildStack(),this.buildPrimitives(),this.buildTransistorFins(),this.buildProbePins(),this.applyPeel(0,this.crossDepthGoal,!0)}buildWafer(){const e=new Ne(new gn(2.6,2.6,.14,64),cn.waferDark);e.position.y=.62,e.castShadow=!0,e.receiveShadow=!0,e.name="wafer",this.group.add(e);const t=new Ne(new Tt(.1,.14,.3),cn.plasticDark);t.position.set(-2.56,.62,0),this.group.add(t);const r=_n(`SKY130A wafer · VDD ${r0.VDD_NOMINAL_V} V · SOA ${r0.VGS_SOA_MAX_V} V`,{scale:1.1,color:"#a8bfff"});r.position.set(0,1.05,-2.1),this.group.add(r)}materialForLayer(e){switch(e){case"substrate":return{mat:new We({color:1449e3,metalness:.5,roughness:.32}),kind:"slab"};case"nwell":return{mat:new We({color:3042904,transparent:!0,opacity:.7,metalness:.25,roughness:.45}),kind:"slab"};case"psub":return{mat:new We({color:3493998,transparent:!0,opacity:.66,metalness:.25,roughness:.5}),kind:"slab"};case"diffusion":return{mat:new We({color:7232078,metalness:.35,roughness:.5}),kind:"slab"};case"poly":return{mat:new We({color:6187904,metalness:.4,roughness:.48}),kind:"slab"};case"li1":return{mat:new We({color:9081506,metalness:.85,roughness:.3}),kind:"slab"};case"mcon":return{mat:new We({color:8160406,metalness:.9,roughness:.3}),kind:"vias"};case"met1":return{mat:new We({color:12568015,metalness:.95,roughness:.22}),kind:"slab"};case"via":return{mat:new We({color:12568015,metalness:.95,roughness:.25}),kind:"vias"};case"met2":return{mat:new We({color:13489117,metalness:.95,roughness:.2}),kind:"slab"};case"via2":return{mat:new We({color:13489117,metalness:.95,roughness:.25}),kind:"vias"};case"met3":return{mat:new We({color:14410218,metalness:.95,roughness:.18}),kind:"slab"}}}buildStack(){let r=.7+rs[0].thickness/2;for(let m=0;m<rs.length;m++){const g=rs[m],{mat:v,kind:S}=this.materialForLayer(g.key),M=new An;if(M.name=`layer-${g.key}`,S==="slab"){const E=new Ne(new Tt(4.2,g.thickness,2.9),v);if(E.castShadow=!0,E.receiveShadow=!0,M.add(E),g.key.startsWith("met")){const y=new We({color:10134194,metalness:.95,roughness:.3}),x=new Ur(new Tt(4.2*.94,g.thickness*.35,.14),y,7),C=new Ot;for(let A=0;A<7;A++)C.position.set(0,0,-2.9/2+.35+A*((2.9-.7)/6)),C.updateMatrix(),x.setMatrixAt(A,C.matrix);M.add(x)}}else{const x=new Ur(new gn(.045,.045,g.thickness,8),v,160),C=new Ot;let A=0;for(let D=0;D<16;D++)for(let G=0;G<10;G++)C.position.set(-4.2/2+.3+D*((4.2-.6)/15),0,-2.9/2+.28+G*((2.9-.56)/9)),C.updateMatrix(),x.setMatrixAt(A++,C.matrix);M.add(x)}M.position.y=r,this.group.add(M),this.layers.push({key:g.key,name:g.name,group:M,baseY:r,materials:[v]}),r+=g.thickness/2+(m+1<rs.length?rs[m+1].thickness/2:0)}const o=r;for(const m of this.layers){const g=_n(m.name,{scale:.42,color:"#d5e2f4",fontSize:34});g.position.set(4.2/2+.42,0,2.9/2-.2),m.group.add(g)}this.stackTopY=o;const l=this.layers.find(m=>m.key==="met2"),u=this.layers.find(m=>m.key==="met3"),d=(m,g)=>new Aa([new N(-1.9,g,m),new N(-.8,g,m),new N(.3,g,m),new N(1.9,g,m)]),h=d(-1.15,.08),p=d(1.15,.1);this.flowCurves.push({id:"vdd-met2",curve:h,radix:"q4"}),this.flowCurves.push({id:"gnd-met3",curve:p,radix:"q4"});for(const[m,g]of[[this.flowCurves[0],l],[this.flowCurves[1],u]]){const v=new Ne(new vo(m.curve,32,.03,8,!1),new We({color:15122780,metalness:1,roughness:.2,emissive:6967312,emissiveIntensity:.4}));v.castShadow=!0,g.group.add(v)}}getLayerOffsetY(e){const t=this.layers.find(r=>r.key===e);return t?t.group.position.y-t.baseY:0}stackTopY=0;buildPrimitives(){const e=this.layers.find(d=>d.key==="met3"),t=e.baseY,r=this.stackTopY+.08-t,o=[...Gh.map(d=>({name:d.cell_name,note:d.function,radix:"q4"})),{name:"binary_inv",note:"binary inverter (radix-2 comparison)",radix:"binary"},{name:"binary_half_adder",note:"binary half adder (radix-2 comparison)",radix:"binary"}],l=3;for(let d=0;d<o.length;d++){const h=-1.35+d%l*1.35,p=d<l?-.72:.72,m=new An,g=o[d].radix==="q4",v=new We({color:g?15122780:10473727,emissive:g?8018964:1854074,emissiveIntensity:.5,metalness:.9,roughness:.3,transparent:!0}),S=new Ne(new Tt(1.05,.07,.62),v);S.castShadow=!0,m.add(S);const M=d<4?Gh[d].gate_count:6,E=new Ur(new Tt(.1,.05,.1),new We({color:2765634,metalness:.6,roughness:.4}),M),y=new Ot;for(let C=0;C<M;C++)y.position.set(-.42+C%5*.21,.06,C<5?-.14:.14),y.updateMatrix(),E.setMatrixAt(C,y.matrix);m.add(E),m.position.set(h,r+.04,p),e.group.add(m);const x=_n(o[d].name,{scale:.52,color:g?"#ffd98a":"#9fd0ff"});x.position.set(h,r+.4,p),e.group.add(x),this.primitiveCells.push({cell:m,label:x})}const u=_n("DRC=0 · LVS ✓ · PEX ✓ · Phase 0 verified",{scale:.85,color:"#8ef0b2"});u.position.set(0,r+.78,1.25),e.group.add(u)}buildTransistorFins(){const e=this.layers.find(l=>l.key==="diffusion").baseY+.045,t=new Ur(new Tt(.16,.06,.34),new We({color:8811871,metalness:.4,roughness:.5}),24),r=new Ot;let o=0;for(let l=0;l<4;l++)for(let u=0;u<6;u++)r.position.set(-1.5+u*.6,e,-.9+l*.6),r.updateMatrix(),t.setMatrixAt(o++,r.matrix);t.name="transistorFins",this.group.add(t)}buildProbePins(){const e=this.layers.find(u=>u.key==="met3"),t=this.stackTopY+.16-e.baseY,r=er(1,16761963);r.position.set(-2.15,t,0),e.group.add(r);const o=er(1,6476031);o.position.set(2.15,t,.2),e.group.add(o);const l=er(1,16739722);l.position.set(2.05,t,-.7),e.group.add(l)}setPeelTargets(e,t){this.peelGoal=e,this.crossDepthGoal=t}applyPeel(e,t,r=!1){this.peelT=e,this.crossDepthT=t;const o=this.layers.length,l=Math.min(o,Math.max(0,t));this.layers.forEach((u,d)=>{const p=e*.55*d,m=d>=o-l,g=m?(d-(o-l)+1)*.42:0,v=m?.12:1;u.group.position.y=u.baseY+p+g;for(const S of u.materials)S.transparent=!0,S.opacity=r?v:S.opacity+(v-S.opacity)*.3})}update(e){if(Math.abs(this.peelT-this.peelGoal)>.001||Math.abs(this.crossDepthT-this.crossDepthGoal)>.001){const o=1-Math.exp(-6*e);this.peelT+=(this.peelGoal-this.peelT)*o,this.crossDepthT+=(this.crossDepthGoal-this.crossDepthT)*o,this.applyPeel(this.peelT,Math.round(this.crossDepthT))}const r=performance.now()*.001;this.primitiveCells.forEach(({cell:o},l)=>{const d=o.children[0].material;d.emissiveIntensity=.42+.12*Math.sin(r*1.4+l)})}layerY(e){return this.layers.find(t=>t.key===e)?.baseY??this.stackTopY}}class h2{group=new An;tiles=[];npuTile;flowCurves=[];disassembled=!1;explodeGoal=0;explodeT=0;chipletGroups=[];busMeshes=[];constructor(){this.buildBoard(),this.buildChiplets(),this.buildBusFabric(),this.buildLabels()}buildBoard(){const e=new Ne(new Tt(10.5,.22,7),cn.pcbGreen);e.position.y=.5,e.receiveShadow=!0,e.castShadow=!0,e.name="pcb",this.group.add(e);const t=new Ne(new Tt(8.6,.1,5.4),new We({color:2765120,metalness:.6,roughness:.35}));t.position.y=.66,this.group.add(t);const r=_n(`FR-4 Tg ${Ln.semiconductor.material_properties.fr4_pcb.glass_transition_c} °C · delam ${Ln.semiconductor.material_properties.fr4_pcb.delamination_c} °C`,{scale:.9,color:"#7fd4a0",fontSize:30});r.position.set(0,.72,3.72),this.group.add(r)}makeChiplet(e,t,r,o,l,u,d,h){const p=new An,m=new Ne(new Tt(r[0],.14,r[1]),new We({color:1777707,metalness:.5,roughness:.5}));m.position.y=.07,m.castShadow=!0,p.add(m);const g=new Ne(new Tt(r[0]-.3,.1,r[1]-.3),new We({color:l,metalness:.45,roughness:.35}));g.position.y=.19,g.castShadow=!0,p.add(g);const v=(r[0]-.5)/d,S=(r[1]-.5)/u,M=new We({color:3686479,emissive:1054752,emissiveIntensity:.5,metalness:.4,roughness:.4}),E=new Ur(new Tt(v*.82,.045,S*.82),M,u*d),y=new Ot;let x=0;for(let G=0;G<u;G++)for(let k=0;k<d;k++)y.position.set(-r[0]/2+.25+v*(k+.5),.26,-r[1]/2+.25+S*(G+.5)),y.updateMatrix(),E.setMatrixAt(x++,y.matrix);p.add(E);const C=new We({color:1712688,emissive:2242120,emissiveIntensity:.35,transparent:!0,opacity:.9}),A=new Ne(new ps(r[0]-.2,r[1]-.2),C);A.rotation.x=-Math.PI/2,A.position.y=.295,p.add(A),p.position.set(o[0],o[1],o[2]),this.group.add(p);const D={id:e,name:t,group:p,thermalPlane:A,thermalMat:C,idlePowerW:h,powerW:h,tempC:45};return this.tiles.push(D),this.chipletGroups.push(p),D}buildChiplets(){const e=Ln.architecture.parameters,t=e.riscv_rv32im,r=e.systolic_array_tpu,o=e.simt_gpu;this.makeChiplet("cpu","CPU Cluster (RV32IM ×8)",[2.6,2.2],[-2.6,.79,-1.3],2898e3,2,4,t.power_mw_at_100mhz_130nm/1e3*8),this.makeChiplet("tpu",`Systolic TPU (${r.grid_size.educational}×${r.grid_size.educational} INT8)`,[2.2,2.2],[.3,.79,-1.4],5257260,8,8,r.power_w.tpu_v1*.08),this.makeChiplet("gpu",`SIMT GPU (${o.sm_count.intel_iris_xe_155u} EU)`,[3.4,1.6],[2.9,.79,-1.2],2904120,4,8,o.power_w.intel_iris_xe_155u_tdp*.35),this.makeChiplet("mem","Unified Memory Fabric (LPDDR5)",[4.6,1.5],[-1,.79,1.6],3812432,2,10,2.1),this.npuTile=this.makeChiplet("npu","Multi-Radix NPU (Q4/ternary/binary)",[1.7,1.4],[3.4,.79,1.55],5260332,3,3,1.2),this.npuTile.group.visible=!1;const l=new Ne(new Tt(8.9,.12,5.6),new vc({color:1712432,metalness:.4,roughness:.18,transparent:!0,opacity:.3}));l.position.y=1.35,l.name="packageLid",l.castShadow=!0,this.group.add(l)}buildBusFabric(){const e=[[new N(-1.4,.86,1.2),new N(-2,.86,-.3)],[new N(.3,.86,1),new N(.35,.86,-.5)],[new N(1.6,.86,1.2),new N(2.4,.86,-.5)],[new N(-1.3,.86,-1.2),new N(0,.86,-1.3)],[new N(1.3,.86,-1.25),new N(2.2,.86,-1.2)]];for(let t=0;t<e.length;t++){const r=new Aa(e[t]);this.flowCurves.push({id:`bus-${t}`,curve:r});const o=new Ne(new vo(r,20,.035,8,!1),new We({color:4019568,emissive:1849948,emissiveIntensity:.8,metalness:.6,roughness:.35}));o.name=`bus-${t}`,this.busMeshes.push(o),this.group.add(o)}}buildLabels(){const e=_n("Unified-Memory SoC · chiplet package",{scale:1.25,color:"#bfe3ff"});e.position.set(0,2.35,0),this.group.add(e)}setNpuAttached(e){this.npuTile&&(this.npuTile.group.visible=e)}setDisassembled(e){this.explodeGoal=e}setTileTemps(e){for(const t of this.tiles){const r=e[t.id]??t.tempC;t.tempC=r;const o=t.thermalMat;r<70?(o.emissive.setHex(2242120),o.emissiveIntensity=.3):r<100?(o.emissive.setHex(9067040),o.emissiveIntensity=.55):r<200?(o.emissive.setHex(12084250),o.emissiveIntensity=.9):(o.emissive.setHex(12592152),o.emissiveIntensity=1.5)}}setBusActivity(e){for(let t=0;t<this.busMeshes.length;t++){const r=this.busMeshes[t].material,o=e[t]??.2;r.emissiveIntensity=.5+o*2.2}}update(e){const t=1-Math.exp(-5*e);this.explodeT+=(this.explodeGoal-this.explodeT)*t;const r=this.group.getObjectByName("packageLid");r&&(r.position.y=1.35+this.explodeT*1.8);const o=[[-1.2,-.8],[.2,-1],[1.4,-.6],[-.9,.9]];this.chipletGroups.forEach((l,u)=>{const[d,h]=o[u%o.length],p=u===0?[-2.6,-1.3]:u===1?[.3,-1.4]:u===2?[2.9,-1.2]:[-1,1.6],m=this.npuTile&&l===this.npuTile.group?3.4:p[0],g=this.npuTile&&l===this.npuTile.group?1.55:p[1];l.position.set(m+d*this.explodeT,.79+this.explodeT*.5*(u%2+1),g+h*this.explodeT)})}}class f2{group=new An;dutAnchor=new N(0,1.62,0);dutMat;charDecal;statusSprite;arcLight;faultLamp;constructor(){const e=new Ne(new gn(2.3,2.5,.35,48),cn.plasticDark);e.position.y=.18,e.receiveShadow=!0,e.castShadow=!0,this.group.add(e);const t=new Ne(new Pc(2.05,.05,8,64),cn.dangerStripe);t.rotation.x=Math.PI/2,t.position.y=.37,this.group.add(t);const r=new Ne(new Tt(1.3,.12,1),new We({color:921880,metalness:.3,roughness:.6}));r.position.set(0,.42,0),this.group.add(r);const o=new Ne(new Tt(1,.07,.72),this.dutMat=new We({color:1844789,metalness:.55,roughness:.3,emissive:861238,emissiveIntensity:.4}));o.position.set(0,.52,0),o.castShadow=!0,o.name="dutChip",this.group.add(o);const l=new Ne(new Tt(.2,.02,.16),new We({color:15122780,metalness:1,roughness:.25}));l.position.set(0,.562,0),this.group.add(l),this.dutAnchor.set(0,.58,0),this.charDecal=new Ne(new hf(.16,20),new We({color:328965,roughness:.95,transparent:!0,opacity:0})),this.charDecal.rotation.x=-Math.PI/2,this.charDecal.position.set(0,.565,0),this.charDecal.visible=!1,this.group.add(this.charDecal);const u=new Ne(new gn(.06,.09,1.6,12),cn.stainless);u.position.set(-1.1,1.15,-.5),u.castShadow=!0,this.group.add(u);const d=er(.9,16732208);d.position.set(-.62,1.35,-.28),d.rotation.z=.5,this.group.add(d);const h=er(.8,6476031);h.position.set(.75,.6,.45),h.rotation.z=-.35,this.group.add(h);const p=new Ne(new gn(1.15,1.15,1.5,32,1,!0),cn.glassShroud);p.position.y=1.1,p.name="containmentGlass",this.group.add(p),this.faultLamp=new Ne(new Ca(.09,14,12),new We({color:1920358,emissive:866120,emissiveIntensity:.8})),this.faultLamp.position.set(1.6,1.25,-.8),this.group.add(this.faultLamp),this.statusSprite=_n("SOA bench · nominal (VDD ≤ 1.80 V)",{scale:.95,color:"#9fd8ff"}),this.statusSprite.position.set(0,1.9,0),this.group.add(this.statusSprite),this.arcLight=new Ra(12573951,0,7,2),this.arcLight.position.copy(this.dutAnchor).add(new N(0,.35,0)),this.group.add(this.arcLight)}setStatus(e,t){this.statusSprite.material;const r=_n(e,{scale:.95,color:t?"#ff9d7a":"#9fd8ff"});this.statusSprite.material.map?.dispose(),this.statusSprite.material=r.material;const o=this.faultLamp.material;t?(o.emissive.setHex(16719888),o.emissiveIntensity=2.2):(o.emissive.setHex(866120),o.emissiveIntensity=.8)}setArcFlash(e){this.arcLight.intensity=e}applyCharDecal(){this.charDecal.visible=!0,this.charDecal.material.opacity=.92}clearFailureState(){this.charDecal.visible=!1,this.charDecal.material.opacity=0,this.dutMat.emissive.setHex(861238),this.dutMat.emissiveIntensity=.4,this.setArcFlash(0)}setShortedGate(e){e?(this.dutMat.emissive.setHex(1575430),this.dutMat.emissiveIntensity=.5):(this.dutMat.emissive.setHex(861238),this.dutMat.emissiveIntensity=.4)}update(e,t){}}class p2{group=new An;screenMat;books=[];constructor(){const e=new Ne(new Tt(2.6,.14,1.7),new We({color:3812640,roughness:.7,metalness:.05}));e.position.y=1,e.castShadow=!0,this.group.add(e);for(const[d,h]of[[-1.1,-.65],[1.1,-.65],[-1.1,.65],[1.1,.65]]){const p=new Ne(new gn(.05,.06,1,10),cn.plasticDark);p.position.set(d,.5,h),p.castShadow=!0,this.group.add(p)}const t=[["01_fundamental_constants.json","CODATA 2022 constants",5227511],["02_semiconductor_pdk_silicon.json","SKY130A / FreePDK45 / ASAP7",16761095],["03_multiradix_logic_baselines.json","Multi-radix logic baselines",9367730],["04_quantum_hardware_modalities.json","Quantum hardware modalities",16739722],["05_chip_architecture_benchmarks.json","Chip architecture benchmarks",11570431],["06_failure_physics_thresholds.json","Failure physics thresholds",16751964]];for(let d=0;d<t.length;d++){const[h,p,m]=t[d],g=new Ne(new Tt(.36,.5,.28),new We({color:m,metalness:.1,roughness:.6}));g.position.set(-1+d*.4,1.32,-.55),g.rotation.y=(Math.random()-.5)*.12,g.castShadow=!0,this.group.add(g),this.books.push({mesh:g,file:h,title:p,color:m})}this.screenMat=new We({color:664886,emissive:2788032,emissiveIntensity:.9,transparent:!0,opacity:.85});const r=new Ne(new ps(1.8,1.05),this.screenMat);r.position.set(.2,1.72,-.25),r.rotation.x=-.35,this.group.add(r);const o=_n("Offline Physics Library — 6 verified datasets · SHA-256 ✓",{scale:1,color:"#9fdcff"});o.position.set(.2,2.42,-.1),this.group.add(o);const l=_n(Ln.manifest.generatedAt.slice(0,10)+" · provenance: verified_offline_standard",{scale:.72,color:"#6f8aa8"});l.position.set(.2,2.3,.25),this.group.add(l);const u=new Ra(16761963,3.2,4.5,2);u.position.set(0,1.9,.3),this.group.add(u)}setFocusedBook(e){this.books.forEach((t,r)=>{const o=t.mesh.material;o.emissive.setHex(r===e?t.color:0),o.emissiveIntensity=r===e?.6:0})}setIntegrity(e,t){const r=this.screenMat;t?e?(r.emissive.setHex(2071893),r.emissiveIntensity=1):(r.emissive.setHex(11739168),r.emissiveIntensity=1.2):(r.emissive.setHex(2788032),r.emissiveIntensity=.6+.3*Math.sin(performance.now()*.004))}update(e,t){}}const Ji=[{id:1,name:"Quantum Cryo & Optics",color:5227511,x:-16},{id:2,name:"Silicon Foundry & Multi-Radix",color:16761095,x:-8},{id:3,name:"Full-Chip & Unified-Memory SoC",color:2541274,x:0},{id:4,name:"Failure Forensics Vault",color:16739674,x:8},{id:5,name:"Offline Physics Library",color:10473727,x:16}];class m2 extends Ni{constructor(e,t){super(),this.base=e,this.getOffsetY=t}getPoint(e,t=new N){const r=this.base.getPoint(e,t);return r.y+=this.getOffsetY(),r}}class _2{constructor(e,t={}){this.callbacks=t,this.scene=e,this.buildFloor(),this.bay1=new u2,this.bay2=new d2,this.bay3=new h2,this.bay4=new f2,this.bay5=new p2;for(const r of Ji)this.bayCenters.push(new N(r.x,1.3,0));this.bay1.group.position.set(Ji[0].x,0,0),this.bay2.group.position.set(Ji[1].x,0,0),this.bay3.group.position.set(Ji[2].x,0,0),this.bay4.group.position.set(Ji[3].x,0,0),this.bay5.group.position.set(Ji[4].x,0,0),e.add(this.bay1.group,this.bay2.group,this.bay3.group,this.bay4.group,this.bay5.group),this.buildPedestals(),this.buildFlowSystem()}scene;bayCenters=[];bay1;bay2;bay3;bay4;bay5;flow;pedestals=[];raycaster=new EE;pointerNdc=new Re;holoMeshes=[];flowIndexById=new Map;baselineActivity=[];buildFloor(){const e=new Ne(new ps(80,46),cn.floor);e.rotation.x=-Math.PI/2,e.position.y=-.01,e.receiveShadow=!0,this.scene.add(e);const t=new TE(80,80,1981023,1120808);t.position.y=.005,this.scene.add(t);for(const r of[-12,-4,4,12]){const o=new Ne(new Tt(.06,.015,40),new We({color:2240583,roughness:.8}));o.position.set(r,.01,0),this.scene.add(o)}}buildPedestals(){for(const e of Ji){const t=new Ne(new gn(1.15,1.4,.22,36),new We({color:e.color,metalness:.65,roughness:.35,transparent:!0,opacity:.22}));t.position.set(e.x,.11,6.5),t.userData={bayId:e.id},t.name=`pedestal-${e.id}`,this.scene.add(t),this.pedestals.push(t);const r=_n(`${e.id} · ${e.name}`,{scale:.95,color:"#cfe2f7"});r.position.set(e.x,1.1,6.5),this.scene.add(r);const o=new Ra(e.color,2.2,12,2);o.position.set(e.x,4.4,2.5),this.scene.add(o)}}buildFlowSystem(){this.flow=new zE(this.scene);const e=Ln.semiconductor.parameters.sky130a.nominal_vdd_v,r=Ln.semiconductor.parameters.sky130a.metal_stack.met2.sheet_resistance_ohm_per_sq*40,o=e/r;for(const l of this.bay2.flowCurves){const u=l.radix==="q4"?new Ze(16761963):new Ze(10473727),d=l.id==="vdd-met2"?"met2":"met3",h=new m2(l.curve,()=>this.bay2.getLayerOffsetY(d));this.flow.addPath({curve:h,color:u,nominalCurrent:o}),this.flowIndexById.set(l.id,this.flow.activityCount()-1),this.baselineActivity.push({speed:.75,brightness:.55})}for(const l of this.bay3.flowCurves)this.flow.addPath({curve:l.curve,color:new Ze(7327999),nominalCurrent:.4}),this.flowIndexById.set(l.id,this.flow.activityCount()-1),this.baselineActivity.push({speed:.5,brightness:.4})}setFlowActivity(e,t,r,o){const l=this.flowIndexById.get(e);l!==void 0&&this.flow.setActivity(l,{speed:t,brightness:r,color:o})}resetFlowToBaseline(){let e=0;for(const[t]of this.flowIndexById){const r=this.baselineActivity[e]??{speed:.5,brightness:.4};this.flow.setActivity(e,{...r,color:t.includes("vdd")||t.startsWith("bus")?new Ze(7327999):void 0}),e++}}pickBay(e,t,r){this.pointerNdc.set(e,t),this.raycaster.setFromCamera(this.pointerNdc,r);const o=this.raycaster.intersectObjects(this.pedestals,!1);return o.length>0?o[0].object.userData.bayId:null}setBay1Mode(e){this.bay1.setMode(e)}setLayerPeel(e,t){this.bay2.setPeelTargets(e?1:0,t)}setNpuAttached(e){this.bay3.setNpuAttached(e)}setSoCDisassembled(e){this.bay3.setDisassembled(e?1:0)}update(e,t,r){this.bay1.update(e,performance.now()*.001),this.bay2.update(e),this.bay3.update(e),this.bay4.update(e,performance.now()*.001),this.bay5.update(e,performance.now()*.001),this.flow.update(e,1),this.pedestals.forEach((o,l)=>{o.position.y=.11+Math.sin(performance.now()*.001+l)*.012})}dispose(){this.flow.dispose()}}const g2={activeBay:0,inspectorOpen:!1,bay1Mode:"fridge",peelMode:"assembled",peelDepth:0,npuAttached:!1,libraryOpen:!1,integrity:{verified:0,total:6,allVerified:!1,done:!1},fps:60,thermalView:!1,replayOpen:!1,toast:null};class v2{state=g2;listeners=new Set;get(){return this.state}set(e){this.state={...this.state,...e};for(const t of this.listeners)t()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}}const Zt=new v2;let Qd;function y2(s){Zt.set({toast:s}),Qd&&clearTimeout(Qd),Qd=setTimeout(()=>Zt.set({toast:null}),2600)}const Wh={"01_fundamental_constants.json":"Fundamental constants (CODATA 2022)","02_semiconductor_pdk_silicon.json":"Semiconductor PDK & materials","03_multiradix_logic_baselines.json":"Multi-radix logic baselines","04_quantum_hardware_modalities.json":"Quantum hardware modalities","05_chip_architecture_benchmarks.json":"Chip architecture benchmarks","06_failure_physics_thresholds.json":"Failure physics thresholds"};function qh(s){return typeof s=="number"?Number.isInteger(s)?String(s):Math.abs(s)>=1e5||Math.abs(s)<.001&&s!==0?s.toExponential(3):String(Number(s.toPrecision(6))):Array.isArray(s)?s.map(e=>typeof e=="number"?qh(e):JSON.stringify(e)).join(", "):typeof s=="object"&&s!==null?JSON.stringify(s):String(s)}function J0(s,e,t,r){if(e==null)return;if(typeof e!="object"){r.push({file:s,title:Wh[s]??s,path:t,valueText:qh(e),unit:"",note:""});return}const o=e;if("value"in o&&(typeof o.value=="number"||typeof o.value=="string")){r.push({file:s,title:Wh[s]??s,path:t,valueText:qh(o.value),unit:typeof o.unit=="string"?o.unit:"",note:typeof o.note=="string"?o.note:""});return}for(const[u,d]of Object.entries(o))J0(s,d,t?`${t}.${u}`:u,r)}function x2(s){const e=[],t=[["01_fundamental_constants.json",s.constants],["02_semiconductor_pdk_silicon.json",s.semiconductor],["03_multiradix_logic_baselines.json",s.multiradix],["04_quantum_hardware_modalities.json",s.quantum],["05_chip_architecture_benchmarks.json",s.architecture],["06_failure_physics_thresholds.json",s.failures]];for(const[r,o]of t){const l=o;for(const u of["parameters","derived","failure_thresholds","valid_operating_envelope","material_properties","equations"])u in l&&J0(r,l[u],u,e);if(Array.isArray(l.equations))for(const u of l.equations)e.push({file:r,title:Wh[r]??r,path:"equations",valueText:u,unit:"",note:""})}return e}const S2=()=>Zt.get(),M2=s=>Zt.subscribe(s);function w2({onClose:s}){const e=xi.useSyncExternalStore(M2,S2).integrity,[t,r]=xi.useState(""),o=xi.useMemo(()=>x2(Ln),[]),l=xi.useMemo(()=>{if(!t.trim())return o;const u=t.toLowerCase();return o.filter(d=>d.path.toLowerCase().includes(u)||d.note.toLowerCase().includes(u)||d.valueText.toLowerCase().includes(u)||d.file.toLowerCase().includes(u)||d.title.toLowerCase().includes(u))},[o,t]);return xe.jsxs("div",{style:{position:"absolute",top:0,left:0,width:480,height:"100%",background:"rgba(10,15,22,0.96)",borderRight:"1px solid #223042",zIndex:140,padding:18,boxSizing:"border-box",display:"flex",flexDirection:"column"},children:[xe.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"baseline"},children:[xe.jsx("h2",{style:{color:"#e8eef7",fontSize:16,margin:0},children:"Offline Physics Library"}),xe.jsx("button",{onClick:s,style:{background:"none",border:"none",color:"#4e5d70",cursor:"pointer",fontSize:16},children:"✕"})]}),xe.jsxs("div",{style:{marginTop:6,marginBottom:10,fontSize:12,color:e.allVerified?"#5fd48a":"#8ea1b8",fontFamily:"monospace"},children:[e.done?`SHA-256 ${e.verified}/${e.total} verified ${e.allVerified?"✓":"✗ INTEGRITY FAILURE"}`:"verifying…"," ","· provenance verified_offline_standard"]}),xe.jsx("input",{autoFocus:!0,value:t,onChange:u=>r(u.target.value),placeholder:"Search constants, PDK params, thresholds… (e.g. 1.95, quench, sheet)",style:{background:"#101823",border:"1px solid #2a3a52",borderRadius:8,color:"#e8eef7",padding:"8px 10px",fontSize:13,marginBottom:12,outline:"none"}}),xe.jsxs("div",{style:{flex:1,overflowY:"auto"},children:[l.length===0&&xe.jsxs("div",{style:{color:"#4e5d70",fontSize:13},children:["No entries match “",t,"”."]}),l.map((u,d)=>xe.jsxs("div",{style:{padding:"8px 10px",marginBottom:6,background:"rgba(22,30,42,0.55)",borderRadius:8,border:"1px solid #1c2838"},children:[xe.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[xe.jsx("span",{style:{color:"#9fb4cc",fontSize:11,fontFamily:"monospace"},children:u.path}),xe.jsx("span",{style:{color:"#3f5068",fontSize:10},children:u.title})]}),xe.jsxs("div",{style:{color:"#e8eef7",fontSize:13.5,marginTop:3,fontFamily:"monospace",wordBreak:"break-word"},children:[u.valueText,u.unit&&xe.jsxs("span",{style:{color:"#6fd0ff"},children:[" ",u.unit]})]}),u.note&&xe.jsx("div",{style:{color:"#6f8aa8",fontSize:11.5,marginTop:3,lineHeight:1.45},children:u.note})]},`${u.file}-${u.path}-${d}`))]}),xe.jsxs("div",{style:{color:"#3f5068",fontSize:11,marginTop:8},children:[l.length," of ",o.length," entries · all data offline · no network fetch"]})]})}const si={marginBottom:14,padding:"10px 12px",background:"rgba(22,30,42,0.6)",borderRadius:10,border:"1px solid #223042"},oi={color:"#8ea1b8",fontSize:11,marginBottom:6,letterSpacing:"0.06em"},uc=(s,e)=>({background:s?e:"transparent",color:s?"#0a0e14":"#8ea1b8",border:"1px solid #2a3a52",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:s?600:400,marginRight:6,marginBottom:6});function E2({bay:s,state:e,dispatch:t}){if(s===1){const r=["300 K","4 K","100 mK","15 mK"];return xe.jsxs("div",{children:[xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"BAY 1 MODE"}),["fridge","mzi","tweezer"].map(o=>xe.jsx("button",{style:uc(e.bay1Mode===o,"#4fc3f7"),onClick:()=>t({bay1Mode:o}),children:o==="fridge"?"Dilution refrigerator":o==="mzi"?"Photonic MZI chip":"Tweezer grid"},o))]}),xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"CRYO STAGES (04 / 06 REFERENCE)"}),r.map(o=>xe.jsxs("div",{style:{color:"#cfe2f7",fontSize:12.5,display:"flex",justifyContent:"space-between"},children:[xe.jsx("span",{children:o}),xe.jsx("span",{style:{color:"#4e5d70",fontFamily:"monospace"},children:o==="15 mK"?"Q_max 12 mW":o==="100 mK"?"Q_max 100 mW":o==="4 K"?"Q_max 1.5 W":"ambient"})]},o)),xe.jsxs("div",{style:{color:"#6f8aa8",fontSize:11,marginTop:8,lineHeight:1.5},children:["T₁ ≈ ",cc.t1_us.typical," µs · T₂ ≈ ",cc.t2_us.typical," µs · ZZ crosstalk ≈"," ",cc.zz_crosstalk_khz.typical," kHz · readout ",cc.readout_fidelity.typical]})]})]})}return s===2?xe.jsxs("div",{children:[xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"LAYER-PEEL SLICER (L)"}),xe.jsx("button",{style:uc(e.peelMode==="exploded","#ffc107"),onClick:()=>t({peelMode:e.peelMode==="exploded"?"assembled":"exploded"}),children:e.peelMode==="exploded"?"Exploded stack":"Assembled stack"}),xe.jsxs("div",{style:{color:"#8ea1b8",fontSize:11,marginTop:8},children:["Focal plane: layer ",e.peelDepth," / 12 (0 = met3 top · 11 = substrate)"]}),xe.jsx("input",{type:"range",min:0,max:12,step:1,value:e.peelDepth,onChange:r=>t({peelDepth:parseInt(r.target.value)}),style:{width:"100%",accentColor:"#ffc107"}})]}),xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"VERIFIED SKY130A Q4 PRIMITIVES (PHASE 0)"}),Gh.map(r=>xe.jsxs("div",{style:{marginBottom:8},children:[xe.jsx("div",{style:{color:"#ffd98a",fontSize:12.5,fontFamily:"monospace"},children:r.cell_name}),xe.jsx("div",{style:{color:"#8ea1b8",fontSize:11},children:r.function}),xe.jsxs("div",{style:{color:"#5fd48a",fontSize:10.5,fontFamily:"monospace"},children:[r.gate_count," gates · DRC=0 · LVS ✓ · PEX ✓"]})]},r.cell_name))]}),xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"SKY130A STACK DATA"}),["li1","met1","met2","met3"].map(r=>{const o=Ln.semiconductor.parameters.sky130a.metal_stack[r];return xe.jsxs("div",{style:{color:"#cfe2f7",fontSize:12,display:"flex",justifyContent:"space-between",fontFamily:"monospace"},children:[xe.jsx("span",{children:r}),xe.jsxs("span",{style:{color:"#4e5d70"},children:[o.thickness_nm," nm · ",o.sheet_resistance_ohm_per_sq," Ω/sq"]})]},r)})]})]}):s===3?xe.jsxs("div",{children:[xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"PACKAGE"}),xe.jsx("button",{style:uc(e.npuAttached,"#b08cff"),onClick:()=>t({npuAttached:!e.npuAttached}),children:e.npuAttached?"NPU attached ✓":"Swap in multi-radix NPU"})]}),xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"TILE POWER MODEL (05 REFERENCE · P = C·V²·f)"}),xe.jsxs("div",{style:{color:"#cfe2f7",fontSize:12,lineHeight:1.7},children:[xe.jsxs("div",{children:["CPU Cluster — ",(Ln.architecture.parameters.riscv_rv32im.power_mw_at_100mhz_130nm/1e3*8).toFixed(2)," W idle model"]}),xe.jsxs("div",{children:["Systolic TPU 8×8 — ",(Ln.architecture.parameters.systolic_array_tpu.power_w.tpu_v1*.08).toFixed(1)," W idle model"]}),xe.jsxs("div",{children:["SIMT GPU — ",(Ln.architecture.parameters.simt_gpu.power_w.intel_iris_xe_155u_tdp*.35).toFixed(1)," W idle model"]}),xe.jsx("div",{children:"Unified Memory — 2.1 W idle model"})]})]}),xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"OPERATING ENVELOPE"}),xe.jsx("div",{style:{color:"#8ea1b8",fontSize:11.5,lineHeight:1.6},children:"RV32IM VDD 0.8–1.2 V · TPU VDD 0.7–0.9 V · junction max 125 °C · Si thermal-runaway alarm 200 °C"})]})]}):s===4?xe.jsxs("div",{children:[xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"SOA BREAKDOWN BENCH"}),xe.jsxs("div",{style:{color:"#cfe2f7",fontSize:12.5,lineHeight:1.7},children:["SKY130 gate-oxide TDDB ceiling: ",xe.jsx("b",{style:{color:"#ff9d7a"},children:"V_gs = 1.95 V"})," (E-model γ ≈ 300 dec/V). Drive VDD above the ceiling to trigger a real breakdown capture — the vault records the last 100 ms and opens the Forensic Autopsy automatically."]})]}),xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"ELECTRO-THERMAL PHYSICS"}),xe.jsx("div",{style:{color:"#6f8aa8",fontSize:11.5,lineHeight:1.6},children:"Live MNA solver + Fourier heat diffusion + failure thresholds from 06_failure_physics_thresholds.json. (Wired into the scene in Milestone 5 — this bay currently shows the instrumented stage.)"})]})]}):s===5?xe.jsxs("div",{children:[xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"OFFLINE PHYSICS LIBRARY"}),xe.jsx("div",{style:{color:"#cfe2f7",fontSize:12.5,marginBottom:8},children:e.integrity.done?e.integrity.allVerified?`All ${e.integrity.verified}/${e.integrity.total} datasets SHA-256 verified ✓`:`Integrity failure — ${e.integrity.verified}/${e.integrity.total} verified`:"Verifying SHA-256 integrity…"}),xe.jsx("button",{style:uc(!0,"#9fd0ff"),onClick:()=>t({libraryOpen:!0}),children:"Browse library (key 5)"})]}),xe.jsxs("div",{style:si,children:[xe.jsx("div",{style:oi,children:"PROVENANCE"}),xe.jsxs("div",{style:{color:"#6f8aa8",fontSize:11,lineHeight:1.6,fontFamily:"monospace"},children:["manifest ",Ln.manifest.format,xe.jsx("br",{}),"generated ",Ln.manifest.generatedAt.slice(0,10)]})]})]}):xe.jsx("div",{style:{color:"#8ea1b8",fontSize:12.5,lineHeight:1.7},children:"Select a bay (1–5) or click a glowing pedestal. The Inspector Drawer opens per bay; Esc returns to the overview."})}function T2(){return xi.useSyncExternalStore(s=>Zt.subscribe(s),()=>Zt.get())}function A2(){const s=xi.useRef(null),e=xi.useRef(null),t=T2();xi.useEffect(()=>{const l=s.current;if(!l)return;const u=FE(l),d=new _2(u.scene,{onFps:y=>Zt.set({fps:y})}),h=new BE(u.camera,u.renderer.domElement);h.pickHandler=(y,x)=>d.pickBay(y,x,u.camera),e.current={renderer:u,rig:h,world:d},c2().then(y=>{Zt.set({integrity:{verified:y.verified,total:y.total,allVerified:y.allVerified,done:!0}})});const p=OE(u);let m=0,g=performance.now(),v=0,S=g;const M=new Y0;function E(){m=requestAnimationFrame(E);const y=Math.min(M.getDelta(),.05);h.update(y),d.update(y,u.camera,0),p(),u.render(y),v++;const x=performance.now();if(x-S>1e3){const C=Math.round(v*1e3/(x-S));Zt.set({fps:C}),v=0,S=x}}return E(),()=>{cancelAnimationFrame(m),d.dispose(),u.dispose(),h.dispose(),e.current=null}},[]),xi.useEffect(()=>{const l=e.current;l&&(l.world.setBay1Mode(t.bay1Mode),l.world.setLayerPeel(t.peelMode==="exploded",t.peelDepth),l.world.setNpuAttached(t.npuAttached))},[t.bay1Mode,t.peelMode,t.peelDepth,t.npuAttached]),xi.useEffect(()=>{const l=u=>{if(u.target instanceof HTMLInputElement||u.target instanceof HTMLTextAreaElement)return;const d=parseInt(u.key);if(d>=1&&d<=5){r(d);return}if(u.key==="Escape"){Zt.set({activeBay:0,inspectorOpen:!1,libraryOpen:!1});const h=e.current;h&&h.rig.glideTo(new N(0,1.3,2),19)}if(u.key==="Tab"&&(u.preventDefault(),Zt.set({inspectorOpen:!Zt.get().inspectorOpen})),u.key.toLowerCase()==="l"){const h=Zt.get().peelMode==="assembled"?"exploded":"assembled";Zt.set({peelMode:h}),y2(h==="exploded"?"Layer peel: exploded stack":"Layer peel: assembled")}};return window.addEventListener("keydown",l),()=>window.removeEventListener("keydown",l)},[]);function r(l){const u=e.current;if(Zt.set({activeBay:l,inspectorOpen:!0,libraryOpen:l===5?Zt.get().libraryOpen:!1}),u){const d=u.world.bayCenters[l-1],h=l===2?9.5:l===3?12:9;u.rig.glideTo(d,h)}}const o=Ji.find(l=>l.id===t.activeBay);return xe.jsxs("div",{style:{width:"100vw",height:"100vh",position:"relative",overflow:"hidden"},children:[xe.jsx("div",{ref:s,style:{position:"absolute",inset:0}}),xe.jsxs("div",{style:{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,background:"rgba(8,12,18,0.82)",borderRadius:22,padding:"5px 12px",border:"1px solid #223042",zIndex:100,backdropFilter:"blur(6px)"},children:[Ji.map(l=>xe.jsx("button",{onClick:()=>r(l.id),style:{background:t.activeBay===l.id?l.color:"transparent",color:t.activeBay===l.id?"#0a0e14":"#8ea1b8",border:"none",borderRadius:15,padding:"3px 11px",cursor:"pointer",fontWeight:t.activeBay===l.id?700:400,fontSize:13},title:l.name,children:l.id},l.id)),xe.jsx("span",{style:{color:"#3a4a5f",margin:"0 4px"},children:"|"}),xe.jsxs("span",{style:{color:t.fps>=55?"#5fd48a":t.fps>=42?"#f0c94f":"#f07a4f",fontWeight:700,fontSize:12,alignSelf:"center",fontVariantNumeric:"tabular-nums"},children:[t.fps," FPS"]}),xe.jsx("span",{style:{color:t.integrity.allVerified?"#5fd48a":"#4e5d70",fontSize:11,alignSelf:"center",marginLeft:6,fontFamily:"monospace"},title:"SHA-256 verified reference datasets",children:t.integrity.done?`SHA-256 ${t.integrity.verified}/${t.integrity.total}${t.integrity.allVerified?" ✓":" ✗"}`:"SHA-256 …"})]}),xe.jsx("div",{style:{position:"absolute",bottom:10,left:12,color:"#4e5d70",fontSize:11.5,fontFamily:"monospace",zIndex:100,userSelect:"none"},children:"1–5 bays · L layer peel · Tab inspector · Esc overview · drag orbit · WASD pan"}),t.toast&&xe.jsx("div",{style:{position:"absolute",bottom:38,left:"50%",transform:"translateX(-50%)",background:"rgba(8,12,18,0.9)",border:"1px solid #223042",color:"#cfe2f7",padding:"6px 14px",borderRadius:12,fontSize:13,zIndex:120},children:t.toast}),xe.jsxs("div",{style:{position:"absolute",top:0,right:0,width:320,height:"100%",background:"rgba(13,18,26,0.94)",borderLeft:"1px solid #223042",transform:t.inspectorOpen?"translateX(0)":"translateX(100%)",transition:"transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",padding:16,zIndex:90,overflowY:"auto",boxSizing:"border-box"},children:[xe.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10},children:[xe.jsx("h3",{style:{color:"#e8eef7",margin:0,fontSize:15},children:o?o.name:"Inspector"}),xe.jsx("button",{onClick:()=>Zt.set({inspectorOpen:!1}),style:{background:"none",border:"none",color:"#4e5d70",cursor:"pointer",fontSize:16},title:"Close (Tab)",children:"✕"})]}),xe.jsx(E2,{bay:t.activeBay,state:t,dispatch:l=>Zt.set(l)})]}),t.libraryOpen&&xe.jsx(w2,{onClose:()=>Zt.set({libraryOpen:!1})})]})}Hv.createRoot(document.getElementById("root")).render(xe.jsx(Uv.StrictMode,{children:xe.jsx(A2,{})}));
