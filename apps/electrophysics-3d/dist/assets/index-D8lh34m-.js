(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const u of a)if(u.type==="childList")for(const f of u.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&r(f)}).observe(document,{childList:!0,subtree:!0});function n(a){const u={};return a.integrity&&(u.integrity=a.integrity),a.referrerPolicy&&(u.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?u.credentials="include":a.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function r(a){if(a.ep)return;a.ep=!0;const u=n(a);fetch(a.href,u)}})();function Im(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var dc={exports:{}},wo={},hc={exports:{}},st={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Mp;function $_(){if(Mp)return st;Mp=1;var s=Symbol.for("react.element"),e=Symbol.for("react.portal"),n=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),a=Symbol.for("react.profiler"),u=Symbol.for("react.provider"),f=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),p=Symbol.for("react.suspense"),m=Symbol.for("react.memo"),_=Symbol.for("react.lazy"),S=Symbol.iterator;function x(N){return N===null||typeof N!="object"?null:(N=S&&N[S]||N["@@iterator"],typeof N=="function"?N:null)}var y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},w=Object.assign,A={};function g(N,ie,Ue){this.props=N,this.context=ie,this.refs=A,this.updater=Ue||y}g.prototype.isReactComponent={},g.prototype.setState=function(N,ie){if(typeof N!="object"&&typeof N!="function"&&N!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,N,ie,"setState")},g.prototype.forceUpdate=function(N){this.updater.enqueueForceUpdate(this,N,"forceUpdate")};function v(){}v.prototype=g.prototype;function b(N,ie,Ue){this.props=N,this.context=ie,this.refs=A,this.updater=Ue||y}var P=b.prototype=new v;P.constructor=b,w(P,g.prototype),P.isPureReactComponent=!0;var L=Array.isArray,X=Object.prototype.hasOwnProperty,F={current:null},I={key:!0,ref:!0,__self:!0,__source:!0};function H(N,ie,Ue){var Q,ue={},xe=null,Se=null;if(ie!=null)for(Q in ie.ref!==void 0&&(Se=ie.ref),ie.key!==void 0&&(xe=""+ie.key),ie)X.call(ie,Q)&&!I.hasOwnProperty(Q)&&(ue[Q]=ie[Q]);var Ce=arguments.length-2;if(Ce===1)ue.children=Ue;else if(1<Ce){for(var Pe=Array(Ce),Je=0;Je<Ce;Je++)Pe[Je]=arguments[Je+2];ue.children=Pe}if(N&&N.defaultProps)for(Q in Ce=N.defaultProps,Ce)ue[Q]===void 0&&(ue[Q]=Ce[Q]);return{$$typeof:s,type:N,key:xe,ref:Se,props:ue,_owner:F.current}}function re(N,ie){return{$$typeof:s,type:N.type,key:ie,ref:N.ref,props:N.props,_owner:N._owner}}function M(N){return typeof N=="object"&&N!==null&&N.$$typeof===s}function C(N){var ie={"=":"=0",":":"=2"};return"$"+N.replace(/[=:]/g,function(Ue){return ie[Ue]})}var q=/\/+/g;function Z(N,ie){return typeof N=="object"&&N!==null&&N.key!=null?C(""+N.key):ie.toString(36)}function ae(N,ie,Ue,Q,ue){var xe=typeof N;(xe==="undefined"||xe==="boolean")&&(N=null);var Se=!1;if(N===null)Se=!0;else switch(xe){case"string":case"number":Se=!0;break;case"object":switch(N.$$typeof){case s:case e:Se=!0}}if(Se)return Se=N,ue=ue(Se),N=Q===""?"."+Z(Se,0):Q,L(ue)?(Ue="",N!=null&&(Ue=N.replace(q,"$&/")+"/"),ae(ue,ie,Ue,"",function(Je){return Je})):ue!=null&&(M(ue)&&(ue=re(ue,Ue+(!ue.key||Se&&Se.key===ue.key?"":(""+ue.key).replace(q,"$&/")+"/")+N)),ie.push(ue)),1;if(Se=0,Q=Q===""?".":Q+":",L(N))for(var Ce=0;Ce<N.length;Ce++){xe=N[Ce];var Pe=Q+Z(xe,Ce);Se+=ae(xe,ie,Ue,Pe,ue)}else if(Pe=x(N),typeof Pe=="function")for(N=Pe.call(N),Ce=0;!(xe=N.next()).done;)xe=xe.value,Pe=Q+Z(xe,Ce++),Se+=ae(xe,ie,Ue,Pe,ue);else if(xe==="object")throw ie=String(N),Error("Objects are not valid as a React child (found: "+(ie==="[object Object]"?"object with keys {"+Object.keys(N).join(", ")+"}":ie)+"). If you meant to render a collection of children, use an array instead.");return Se}function de(N,ie,Ue){if(N==null)return N;var Q=[],ue=0;return ae(N,Q,"","",function(xe){return ie.call(Ue,xe,ue++)}),Q}function ne(N){if(N._status===-1){var ie=N._result;ie=ie(),ie.then(function(Ue){(N._status===0||N._status===-1)&&(N._status=1,N._result=Ue)},function(Ue){(N._status===0||N._status===-1)&&(N._status=2,N._result=Ue)}),N._status===-1&&(N._status=0,N._result=ie)}if(N._status===1)return N._result.default;throw N._result}var le={current:null},k={transition:null},ce={ReactCurrentDispatcher:le,ReactCurrentBatchConfig:k,ReactCurrentOwner:F};function oe(){throw Error("act(...) is not supported in production builds of React.")}return st.Children={map:de,forEach:function(N,ie,Ue){de(N,function(){ie.apply(this,arguments)},Ue)},count:function(N){var ie=0;return de(N,function(){ie++}),ie},toArray:function(N){return de(N,function(ie){return ie})||[]},only:function(N){if(!M(N))throw Error("React.Children.only expected to receive a single React element child.");return N}},st.Component=g,st.Fragment=n,st.Profiler=a,st.PureComponent=b,st.StrictMode=r,st.Suspense=p,st.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ce,st.act=oe,st.cloneElement=function(N,ie,Ue){if(N==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+N+".");var Q=w({},N.props),ue=N.key,xe=N.ref,Se=N._owner;if(ie!=null){if(ie.ref!==void 0&&(xe=ie.ref,Se=F.current),ie.key!==void 0&&(ue=""+ie.key),N.type&&N.type.defaultProps)var Ce=N.type.defaultProps;for(Pe in ie)X.call(ie,Pe)&&!I.hasOwnProperty(Pe)&&(Q[Pe]=ie[Pe]===void 0&&Ce!==void 0?Ce[Pe]:ie[Pe])}var Pe=arguments.length-2;if(Pe===1)Q.children=Ue;else if(1<Pe){Ce=Array(Pe);for(var Je=0;Je<Pe;Je++)Ce[Je]=arguments[Je+2];Q.children=Ce}return{$$typeof:s,type:N.type,key:ue,ref:xe,props:Q,_owner:Se}},st.createContext=function(N){return N={$$typeof:f,_currentValue:N,_currentValue2:N,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},N.Provider={$$typeof:u,_context:N},N.Consumer=N},st.createElement=H,st.createFactory=function(N){var ie=H.bind(null,N);return ie.type=N,ie},st.createRef=function(){return{current:null}},st.forwardRef=function(N){return{$$typeof:d,render:N}},st.isValidElement=M,st.lazy=function(N){return{$$typeof:_,_payload:{_status:-1,_result:N},_init:ne}},st.memo=function(N,ie){return{$$typeof:m,type:N,compare:ie===void 0?null:ie}},st.startTransition=function(N){var ie=k.transition;k.transition={};try{N()}finally{k.transition=ie}},st.unstable_act=oe,st.useCallback=function(N,ie){return le.current.useCallback(N,ie)},st.useContext=function(N){return le.current.useContext(N)},st.useDebugValue=function(){},st.useDeferredValue=function(N){return le.current.useDeferredValue(N)},st.useEffect=function(N,ie){return le.current.useEffect(N,ie)},st.useId=function(){return le.current.useId()},st.useImperativeHandle=function(N,ie,Ue){return le.current.useImperativeHandle(N,ie,Ue)},st.useInsertionEffect=function(N,ie){return le.current.useInsertionEffect(N,ie)},st.useLayoutEffect=function(N,ie){return le.current.useLayoutEffect(N,ie)},st.useMemo=function(N,ie){return le.current.useMemo(N,ie)},st.useReducer=function(N,ie,Ue){return le.current.useReducer(N,ie,Ue)},st.useRef=function(N){return le.current.useRef(N)},st.useState=function(N){return le.current.useState(N)},st.useSyncExternalStore=function(N,ie,Ue){return le.current.useSyncExternalStore(N,ie,Ue)},st.useTransition=function(){return le.current.useTransition()},st.version="18.3.1",st}var Ep;function kf(){return Ep||(Ep=1,hc.exports=$_()),hc.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Tp;function K_(){if(Tp)return wo;Tp=1;var s=kf(),e=Symbol.for("react.element"),n=Symbol.for("react.fragment"),r=Object.prototype.hasOwnProperty,a=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,u={key:!0,ref:!0,__self:!0,__source:!0};function f(d,p,m){var _,S={},x=null,y=null;m!==void 0&&(x=""+m),p.key!==void 0&&(x=""+p.key),p.ref!==void 0&&(y=p.ref);for(_ in p)r.call(p,_)&&!u.hasOwnProperty(_)&&(S[_]=p[_]);if(d&&d.defaultProps)for(_ in p=d.defaultProps,p)S[_]===void 0&&(S[_]=p[_]);return{$$typeof:e,type:d,key:x,ref:y,props:S,_owner:a.current}}return wo.Fragment=n,wo.jsx=f,wo.jsxs=f,wo}var wp;function Z_(){return wp||(wp=1,dc.exports=K_()),dc.exports}var Nn=Z_(),Di=kf();const Q_=Im(Di);var Ya={},pc={exports:{}},Mn={},mc={exports:{}},gc={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ap;function J_(){return Ap||(Ap=1,(function(s){function e(k,ce){var oe=k.length;k.push(ce);e:for(;0<oe;){var N=oe-1>>>1,ie=k[N];if(0<a(ie,ce))k[N]=ce,k[oe]=ie,oe=N;else break e}}function n(k){return k.length===0?null:k[0]}function r(k){if(k.length===0)return null;var ce=k[0],oe=k.pop();if(oe!==ce){k[0]=oe;e:for(var N=0,ie=k.length,Ue=ie>>>1;N<Ue;){var Q=2*(N+1)-1,ue=k[Q],xe=Q+1,Se=k[xe];if(0>a(ue,oe))xe<ie&&0>a(Se,ue)?(k[N]=Se,k[xe]=oe,N=xe):(k[N]=ue,k[Q]=oe,N=Q);else if(xe<ie&&0>a(Se,oe))k[N]=Se,k[xe]=oe,N=xe;else break e}}return ce}function a(k,ce){var oe=k.sortIndex-ce.sortIndex;return oe!==0?oe:k.id-ce.id}if(typeof performance=="object"&&typeof performance.now=="function"){var u=performance;s.unstable_now=function(){return u.now()}}else{var f=Date,d=f.now();s.unstable_now=function(){return f.now()-d}}var p=[],m=[],_=1,S=null,x=3,y=!1,w=!1,A=!1,g=typeof setTimeout=="function"?setTimeout:null,v=typeof clearTimeout=="function"?clearTimeout:null,b=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function P(k){for(var ce=n(m);ce!==null;){if(ce.callback===null)r(m);else if(ce.startTime<=k)r(m),ce.sortIndex=ce.expirationTime,e(p,ce);else break;ce=n(m)}}function L(k){if(A=!1,P(k),!w)if(n(p)!==null)w=!0,ne(X);else{var ce=n(m);ce!==null&&le(L,ce.startTime-k)}}function X(k,ce){w=!1,A&&(A=!1,v(H),H=-1),y=!0;var oe=x;try{for(P(ce),S=n(p);S!==null&&(!(S.expirationTime>ce)||k&&!C());){var N=S.callback;if(typeof N=="function"){S.callback=null,x=S.priorityLevel;var ie=N(S.expirationTime<=ce);ce=s.unstable_now(),typeof ie=="function"?S.callback=ie:S===n(p)&&r(p),P(ce)}else r(p);S=n(p)}if(S!==null)var Ue=!0;else{var Q=n(m);Q!==null&&le(L,Q.startTime-ce),Ue=!1}return Ue}finally{S=null,x=oe,y=!1}}var F=!1,I=null,H=-1,re=5,M=-1;function C(){return!(s.unstable_now()-M<re)}function q(){if(I!==null){var k=s.unstable_now();M=k;var ce=!0;try{ce=I(!0,k)}finally{ce?Z():(F=!1,I=null)}}else F=!1}var Z;if(typeof b=="function")Z=function(){b(q)};else if(typeof MessageChannel<"u"){var ae=new MessageChannel,de=ae.port2;ae.port1.onmessage=q,Z=function(){de.postMessage(null)}}else Z=function(){g(q,0)};function ne(k){I=k,F||(F=!0,Z())}function le(k,ce){H=g(function(){k(s.unstable_now())},ce)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(k){k.callback=null},s.unstable_continueExecution=function(){w||y||(w=!0,ne(X))},s.unstable_forceFrameRate=function(k){0>k||125<k?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):re=0<k?Math.floor(1e3/k):5},s.unstable_getCurrentPriorityLevel=function(){return x},s.unstable_getFirstCallbackNode=function(){return n(p)},s.unstable_next=function(k){switch(x){case 1:case 2:case 3:var ce=3;break;default:ce=x}var oe=x;x=ce;try{return k()}finally{x=oe}},s.unstable_pauseExecution=function(){},s.unstable_requestPaint=function(){},s.unstable_runWithPriority=function(k,ce){switch(k){case 1:case 2:case 3:case 4:case 5:break;default:k=3}var oe=x;x=k;try{return ce()}finally{x=oe}},s.unstable_scheduleCallback=function(k,ce,oe){var N=s.unstable_now();switch(typeof oe=="object"&&oe!==null?(oe=oe.delay,oe=typeof oe=="number"&&0<oe?N+oe:N):oe=N,k){case 1:var ie=-1;break;case 2:ie=250;break;case 5:ie=1073741823;break;case 4:ie=1e4;break;default:ie=5e3}return ie=oe+ie,k={id:_++,callback:ce,priorityLevel:k,startTime:oe,expirationTime:ie,sortIndex:-1},oe>N?(k.sortIndex=oe,e(m,k),n(p)===null&&k===n(m)&&(A?(v(H),H=-1):A=!0,le(L,oe-N))):(k.sortIndex=ie,e(p,k),w||y||(w=!0,ne(X))),k},s.unstable_shouldYield=C,s.unstable_wrapCallback=function(k){var ce=x;return function(){var oe=x;x=ce;try{return k.apply(this,arguments)}finally{x=oe}}}})(gc)),gc}var Rp;function ev(){return Rp||(Rp=1,mc.exports=J_()),mc.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Cp;function tv(){if(Cp)return Mn;Cp=1;var s=kf(),e=ev();function n(t){for(var i="https://reactjs.org/docs/error-decoder.html?invariant="+t,o=1;o<arguments.length;o++)i+="&args[]="+encodeURIComponent(arguments[o]);return"Minified React error #"+t+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var r=new Set,a={};function u(t,i){f(t,i),f(t+"Capture",i)}function f(t,i){for(a[t]=i,t=0;t<i.length;t++)r.add(i[t])}var d=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),p=Object.prototype.hasOwnProperty,m=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,_={},S={};function x(t){return p.call(S,t)?!0:p.call(_,t)?!1:m.test(t)?S[t]=!0:(_[t]=!0,!1)}function y(t,i,o,l){if(o!==null&&o.type===0)return!1;switch(typeof i){case"function":case"symbol":return!0;case"boolean":return l?!1:o!==null?!o.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function w(t,i,o,l){if(i===null||typeof i>"u"||y(t,i,o,l))return!0;if(l)return!1;if(o!==null)switch(o.type){case 3:return!i;case 4:return i===!1;case 5:return isNaN(i);case 6:return isNaN(i)||1>i}return!1}function A(t,i,o,l,c,h,E){this.acceptsBooleans=i===2||i===3||i===4,this.attributeName=l,this.attributeNamespace=c,this.mustUseProperty=o,this.propertyName=t,this.type=i,this.sanitizeURL=h,this.removeEmptyString=E}var g={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){g[t]=new A(t,0,!1,t,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var i=t[0];g[i]=new A(i,1,!1,t[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(t){g[t]=new A(t,2,!1,t.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){g[t]=new A(t,2,!1,t,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){g[t]=new A(t,3,!1,t.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(t){g[t]=new A(t,3,!0,t,null,!1,!1)}),["capture","download"].forEach(function(t){g[t]=new A(t,4,!1,t,null,!1,!1)}),["cols","rows","size","span"].forEach(function(t){g[t]=new A(t,6,!1,t,null,!1,!1)}),["rowSpan","start"].forEach(function(t){g[t]=new A(t,5,!1,t.toLowerCase(),null,!1,!1)});var v=/[\-:]([a-z])/g;function b(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var i=t.replace(v,b);g[i]=new A(i,1,!1,t,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var i=t.replace(v,b);g[i]=new A(i,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(t){var i=t.replace(v,b);g[i]=new A(i,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(t){g[t]=new A(t,1,!1,t.toLowerCase(),null,!1,!1)}),g.xlinkHref=new A("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(t){g[t]=new A(t,1,!1,t.toLowerCase(),null,!0,!0)});function P(t,i,o,l){var c=g.hasOwnProperty(i)?g[i]:null;(c!==null?c.type!==0:l||!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")&&(w(i,o,c,l)&&(o=null),l||c===null?x(i)&&(o===null?t.removeAttribute(i):t.setAttribute(i,""+o)):c.mustUseProperty?t[c.propertyName]=o===null?c.type===3?!1:"":o:(i=c.attributeName,l=c.attributeNamespace,o===null?t.removeAttribute(i):(c=c.type,o=c===3||c===4&&o===!0?"":""+o,l?t.setAttributeNS(l,i,o):t.setAttribute(i,o))))}var L=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,X=Symbol.for("react.element"),F=Symbol.for("react.portal"),I=Symbol.for("react.fragment"),H=Symbol.for("react.strict_mode"),re=Symbol.for("react.profiler"),M=Symbol.for("react.provider"),C=Symbol.for("react.context"),q=Symbol.for("react.forward_ref"),Z=Symbol.for("react.suspense"),ae=Symbol.for("react.suspense_list"),de=Symbol.for("react.memo"),ne=Symbol.for("react.lazy"),le=Symbol.for("react.offscreen"),k=Symbol.iterator;function ce(t){return t===null||typeof t!="object"?null:(t=k&&t[k]||t["@@iterator"],typeof t=="function"?t:null)}var oe=Object.assign,N;function ie(t){if(N===void 0)try{throw Error()}catch(o){var i=o.stack.trim().match(/\n( *(at )?)/);N=i&&i[1]||""}return`
`+N+t}var Ue=!1;function Q(t,i){if(!t||Ue)return"";Ue=!0;var o=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(i)if(i=function(){throw Error()},Object.defineProperty(i.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(i,[])}catch(te){var l=te}Reflect.construct(t,[],i)}else{try{i.call()}catch(te){l=te}t.call(i.prototype)}else{try{throw Error()}catch(te){l=te}t()}}catch(te){if(te&&l&&typeof te.stack=="string"){for(var c=te.stack.split(`
`),h=l.stack.split(`
`),E=c.length-1,U=h.length-1;1<=E&&0<=U&&c[E]!==h[U];)U--;for(;1<=E&&0<=U;E--,U--)if(c[E]!==h[U]){if(E!==1||U!==1)do if(E--,U--,0>U||c[E]!==h[U]){var O=`
`+c[E].replace(" at new "," at ");return t.displayName&&O.includes("<anonymous>")&&(O=O.replace("<anonymous>",t.displayName)),O}while(1<=E&&0<=U);break}}}finally{Ue=!1,Error.prepareStackTrace=o}return(t=t?t.displayName||t.name:"")?ie(t):""}function ue(t){switch(t.tag){case 5:return ie(t.type);case 16:return ie("Lazy");case 13:return ie("Suspense");case 19:return ie("SuspenseList");case 0:case 2:case 15:return t=Q(t.type,!1),t;case 11:return t=Q(t.type.render,!1),t;case 1:return t=Q(t.type,!0),t;default:return""}}function xe(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case I:return"Fragment";case F:return"Portal";case re:return"Profiler";case H:return"StrictMode";case Z:return"Suspense";case ae:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case C:return(t.displayName||"Context")+".Consumer";case M:return(t._context.displayName||"Context")+".Provider";case q:var i=t.render;return t=t.displayName,t||(t=i.displayName||i.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case de:return i=t.displayName||null,i!==null?i:xe(t.type)||"Memo";case ne:i=t._payload,t=t._init;try{return xe(t(i))}catch{}}return null}function Se(t){var i=t.type;switch(t.tag){case 24:return"Cache";case 9:return(i.displayName||"Context")+".Consumer";case 10:return(i._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=i.render,t=t.displayName||t.name||"",i.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return i;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return xe(i);case 8:return i===H?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i}return null}function Ce(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Pe(t){var i=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function Je(t){var i=Pe(t)?"checked":"value",o=Object.getOwnPropertyDescriptor(t.constructor.prototype,i),l=""+t[i];if(!t.hasOwnProperty(i)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var c=o.get,h=o.set;return Object.defineProperty(t,i,{configurable:!0,get:function(){return c.call(this)},set:function(E){l=""+E,h.call(this,E)}}),Object.defineProperty(t,i,{enumerable:o.enumerable}),{getValue:function(){return l},setValue:function(E){l=""+E},stopTracking:function(){t._valueTracker=null,delete t[i]}}}}function mt(t){t._valueTracker||(t._valueTracker=Je(t))}function at(t){if(!t)return!1;var i=t._valueTracker;if(!i)return!0;var o=i.getValue(),l="";return t&&(l=Pe(t)?t.checked?"true":"false":t.value),t=l,t!==o?(i.setValue(t),!0):!1}function B(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function en(t,i){var o=i.checked;return oe({},i,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:o??t._wrapperState.initialChecked})}function ot(t,i){var o=i.defaultValue==null?"":i.defaultValue,l=i.checked!=null?i.checked:i.defaultChecked;o=Ce(i.value!=null?i.value:o),t._wrapperState={initialChecked:l,initialValue:o,controlled:i.type==="checkbox"||i.type==="radio"?i.checked!=null:i.value!=null}}function ft(t,i){i=i.checked,i!=null&&P(t,"checked",i,!1)}function $e(t,i){ft(t,i);var o=Ce(i.value),l=i.type;if(o!=null)l==="number"?(o===0&&t.value===""||t.value!=o)&&(t.value=""+o):t.value!==""+o&&(t.value=""+o);else if(l==="submit"||l==="reset"){t.removeAttribute("value");return}i.hasOwnProperty("value")?Ze(t,i.type,o):i.hasOwnProperty("defaultValue")&&Ze(t,i.type,Ce(i.defaultValue)),i.checked==null&&i.defaultChecked!=null&&(t.defaultChecked=!!i.defaultChecked)}function Tt(t,i,o){if(i.hasOwnProperty("value")||i.hasOwnProperty("defaultValue")){var l=i.type;if(!(l!=="submit"&&l!=="reset"||i.value!==void 0&&i.value!==null))return;i=""+t._wrapperState.initialValue,o||i===t.value||(t.value=i),t.defaultValue=i}o=t.name,o!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,o!==""&&(t.name=o)}function Ze(t,i,o){(i!=="number"||B(t.ownerDocument)!==t)&&(o==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+o&&(t.defaultValue=""+o))}var D=Array.isArray;function T(t,i,o,l){if(t=t.options,i){i={};for(var c=0;c<o.length;c++)i["$"+o[c]]=!0;for(o=0;o<t.length;o++)c=i.hasOwnProperty("$"+t[o].value),t[o].selected!==c&&(t[o].selected=c),c&&l&&(t[o].defaultSelected=!0)}else{for(o=""+Ce(o),i=null,c=0;c<t.length;c++){if(t[c].value===o){t[c].selected=!0,l&&(t[c].defaultSelected=!0);return}i!==null||t[c].disabled||(i=t[c])}i!==null&&(i.selected=!0)}}function K(t,i){if(i.dangerouslySetInnerHTML!=null)throw Error(n(91));return oe({},i,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function he(t,i){var o=i.value;if(o==null){if(o=i.children,i=i.defaultValue,o!=null){if(i!=null)throw Error(n(92));if(D(o)){if(1<o.length)throw Error(n(93));o=o[0]}i=o}i==null&&(i=""),o=i}t._wrapperState={initialValue:Ce(o)}}function _e(t,i){var o=Ce(i.value),l=Ce(i.defaultValue);o!=null&&(o=""+o,o!==t.value&&(t.value=o),i.defaultValue==null&&t.defaultValue!==o&&(t.defaultValue=o)),l!=null&&(t.defaultValue=""+l)}function fe(t){var i=t.textContent;i===t._wrapperState.initialValue&&i!==""&&i!==null&&(t.value=i)}function Xe(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function we(t,i){return t==null||t==="http://www.w3.org/1999/xhtml"?Xe(i):t==="http://www.w3.org/2000/svg"&&i==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Ne,dt=(function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(i,o,l,c){MSApp.execUnsafeLocalFunction(function(){return t(i,o,l,c)})}:t})(function(t,i){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=i;else{for(Ne=Ne||document.createElement("div"),Ne.innerHTML="<svg>"+i.valueOf().toString()+"</svg>",i=Ne.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;i.firstChild;)t.appendChild(i.firstChild)}});function ye(t,i){if(i){var o=t.firstChild;if(o&&o===t.lastChild&&o.nodeType===3){o.nodeValue=i;return}}t.textContent=i}var Fe={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},et=["Webkit","ms","Moz","O"];Object.keys(Fe).forEach(function(t){et.forEach(function(i){i=i+t.charAt(0).toUpperCase()+t.substring(1),Fe[i]=Fe[t]})});function Qe(t,i,o){return i==null||typeof i=="boolean"||i===""?"":o||typeof i!="number"||i===0||Fe.hasOwnProperty(t)&&Fe[t]?(""+i).trim():i+"px"}function Be(t,i){t=t.style;for(var o in i)if(i.hasOwnProperty(o)){var l=o.indexOf("--")===0,c=Qe(o,i[o],l);o==="float"&&(o="cssFloat"),l?t.setProperty(o,c):t[o]=c}}var lt=oe({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function nt(t,i){if(i){if(lt[t]&&(i.children!=null||i.dangerouslySetInnerHTML!=null))throw Error(n(137,t));if(i.dangerouslySetInnerHTML!=null){if(i.children!=null)throw Error(n(60));if(typeof i.dangerouslySetInnerHTML!="object"||!("__html"in i.dangerouslySetInnerHTML))throw Error(n(61))}if(i.style!=null&&typeof i.style!="object")throw Error(n(62))}}function yt(t,i){if(t.indexOf("-")===-1)return typeof i.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var V=null;function Le(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var se=null,pe=null,Ae=null;function De(t){if(t=uo(t)){if(typeof se!="function")throw Error(n(280));var i=t.stateNode;i&&(i=aa(i),se(t.stateNode,t.type,i))}}function ut(t){pe?Ae?Ae.push(t):Ae=[t]:pe=t}function Ut(){if(pe){var t=pe,i=Ae;if(Ae=pe=null,De(t),i)for(t=0;t<i.length;t++)De(i[t])}}function tn(t,i){return t(i)}function ht(){}var jt=!1;function Fn(t,i,o){if(jt)return t(i,o);jt=!0;try{return tn(t,i,o)}finally{jt=!1,(pe!==null||Ae!==null)&&(ht(),Ut())}}function Bi(t,i){var o=t.stateNode;if(o===null)return null;var l=aa(o);if(l===null)return null;o=l[i];e:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(l=!l.disabled)||(t=t.type,l=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!l;break e;default:t=!1}if(t)return null;if(o&&typeof o!="function")throw Error(n(231,i,typeof o));return o}var Xr=!1;if(d)try{var Rn={};Object.defineProperty(Rn,"passive",{get:function(){Xr=!0}}),window.addEventListener("test",Rn,Rn),window.removeEventListener("test",Rn,Rn)}catch{Xr=!1}function Ws(t,i,o,l,c,h,E,U,O){var te=Array.prototype.slice.call(arguments,3);try{i.apply(o,te)}catch(ge){this.onError(ge)}}var ki=!1,vr=null,gi=!1,Yr=null,qr={onError:function(t){ki=!0,vr=t}};function Vo(t,i,o,l,c,h,E,U,O){ki=!1,vr=null,Ws.apply(qr,arguments)}function Go(t,i,o,l,c,h,E,U,O){if(Vo.apply(this,arguments),ki){if(ki){var te=vr;ki=!1,vr=null}else throw Error(n(198));gi||(gi=!0,Yr=te)}}function _i(t){var i=t,o=t;if(t.alternate)for(;i.return;)i=i.return;else{t=i;do i=t,(i.flags&4098)!==0&&(o=i.return),t=i.return;while(t)}return i.tag===3?o:null}function Wo(t){if(t.tag===13){var i=t.memoizedState;if(i===null&&(t=t.alternate,t!==null&&(i=t.memoizedState)),i!==null)return i.dehydrated}return null}function Xo(t){if(_i(t)!==t)throw Error(n(188))}function R(t){var i=t.alternate;if(!i){if(i=_i(t),i===null)throw Error(n(188));return i!==t?null:t}for(var o=t,l=i;;){var c=o.return;if(c===null)break;var h=c.alternate;if(h===null){if(l=c.return,l!==null){o=l;continue}break}if(c.child===h.child){for(h=c.child;h;){if(h===o)return Xo(c),t;if(h===l)return Xo(c),i;h=h.sibling}throw Error(n(188))}if(o.return!==l.return)o=c,l=h;else{for(var E=!1,U=c.child;U;){if(U===o){E=!0,o=c,l=h;break}if(U===l){E=!0,l=c,o=h;break}U=U.sibling}if(!E){for(U=h.child;U;){if(U===o){E=!0,o=h,l=c;break}if(U===l){E=!0,l=h,o=c;break}U=U.sibling}if(!E)throw Error(n(189))}}if(o.alternate!==l)throw Error(n(190))}if(o.tag!==3)throw Error(n(188));return o.stateNode.current===o?t:i}function G(t){return t=R(t),t!==null?J(t):null}function J(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var i=J(t);if(i!==null)return i;t=t.sibling}return null}var ee=e.unstable_scheduleCallback,W=e.unstable_cancelCallback,Ee=e.unstable_shouldYield,be=e.unstable_requestPaint,Te=e.unstable_now,Ve=e.unstable_getCurrentPriorityLevel,je=e.unstable_ImmediatePriority,Ke=e.unstable_UserBlockingPriority,Ge=e.unstable_NormalPriority,St=e.unstable_LowPriority,wt=e.unstable_IdlePriority,At=null,Dt=null;function _t(t){if(Dt&&typeof Dt.onCommitFiberRoot=="function")try{Dt.onCommitFiberRoot(At,t,void 0,(t.current.flags&128)===128)}catch{}}var Oe=Math.clz32?Math.clz32:Cn,Gt=Math.log,vt=Math.LN2;function Cn(t){return t>>>=0,t===0?32:31-(Gt(t)/vt|0)|0}var qn=64,$t=4194304;function vi(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function Rt(t,i){var o=t.pendingLanes;if(o===0)return 0;var l=0,c=t.suspendedLanes,h=t.pingedLanes,E=o&268435455;if(E!==0){var U=E&~c;U!==0?l=vi(U):(h&=E,h!==0&&(l=vi(h)))}else E=o&~c,E!==0?l=vi(E):h!==0&&(l=vi(h));if(l===0)return 0;if(i!==0&&i!==l&&(i&c)===0&&(c=l&-l,h=i&-i,c>=h||c===16&&(h&4194240)!==0))return i;if((l&4)!==0&&(l|=o&16),i=t.entangledLanes,i!==0)for(t=t.entanglements,i&=l;0<i;)o=31-Oe(i),c=1<<o,l|=t[o],i&=~c;return l}function ai(t,i){switch(t){case 1:case 2:case 4:return i+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Xs(t,i){for(var o=t.suspendedLanes,l=t.pingedLanes,c=t.expirationTimes,h=t.pendingLanes;0<h;){var E=31-Oe(h),U=1<<E,O=c[E];O===-1?((U&o)===0||(U&l)!==0)&&(c[E]=ai(U,i)):O<=i&&(t.expiredLanes|=U),h&=~U}}function an(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function jr(){var t=qn;return qn<<=1,(qn&4194240)===0&&(qn=64),t}function Ys(t){for(var i=[],o=0;31>o;o++)i.push(t);return i}function zi(t,i,o){t.pendingLanes|=i,i!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,i=31-Oe(i),t[i]=o}function gg(t,i){var o=t.pendingLanes&~i;t.pendingLanes=i,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=i,t.mutableReadLanes&=i,t.entangledLanes&=i,i=t.entanglements;var l=t.eventTimes;for(t=t.expirationTimes;0<o;){var c=31-Oe(o),h=1<<c;i[c]=0,l[c]=-1,t[c]=-1,o&=~h}}function Nl(t,i){var o=t.entangledLanes|=i;for(t=t.entanglements;o;){var l=31-Oe(o),c=1<<l;c&i|t[l]&i&&(t[l]|=i),o&=~c}}var Et=0;function ed(t){return t&=-t,1<t?4<t?(t&268435455)!==0?16:536870912:4:1}var td,Fl,nd,id,rd,Ol=!1,Yo=[],Hi=null,Vi=null,Gi=null,qs=new Map,js=new Map,Wi=[],_g="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function sd(t,i){switch(t){case"focusin":case"focusout":Hi=null;break;case"dragenter":case"dragleave":Vi=null;break;case"mouseover":case"mouseout":Gi=null;break;case"pointerover":case"pointerout":qs.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":js.delete(i.pointerId)}}function $s(t,i,o,l,c,h){return t===null||t.nativeEvent!==h?(t={blockedOn:i,domEventName:o,eventSystemFlags:l,nativeEvent:h,targetContainers:[c]},i!==null&&(i=uo(i),i!==null&&Fl(i)),t):(t.eventSystemFlags|=l,i=t.targetContainers,c!==null&&i.indexOf(c)===-1&&i.push(c),t)}function vg(t,i,o,l,c){switch(i){case"focusin":return Hi=$s(Hi,t,i,o,l,c),!0;case"dragenter":return Vi=$s(Vi,t,i,o,l,c),!0;case"mouseover":return Gi=$s(Gi,t,i,o,l,c),!0;case"pointerover":var h=c.pointerId;return qs.set(h,$s(qs.get(h)||null,t,i,o,l,c)),!0;case"gotpointercapture":return h=c.pointerId,js.set(h,$s(js.get(h)||null,t,i,o,l,c)),!0}return!1}function od(t){var i=xr(t.target);if(i!==null){var o=_i(i);if(o!==null){if(i=o.tag,i===13){if(i=Wo(o),i!==null){t.blockedOn=i,rd(t.priority,function(){nd(o)});return}}else if(i===3&&o.stateNode.current.memoizedState.isDehydrated){t.blockedOn=o.tag===3?o.stateNode.containerInfo:null;return}}}t.blockedOn=null}function qo(t){if(t.blockedOn!==null)return!1;for(var i=t.targetContainers;0<i.length;){var o=kl(t.domEventName,t.eventSystemFlags,i[0],t.nativeEvent);if(o===null){o=t.nativeEvent;var l=new o.constructor(o.type,o);V=l,o.target.dispatchEvent(l),V=null}else return i=uo(o),i!==null&&Fl(i),t.blockedOn=o,!1;i.shift()}return!0}function ad(t,i,o){qo(t)&&o.delete(i)}function xg(){Ol=!1,Hi!==null&&qo(Hi)&&(Hi=null),Vi!==null&&qo(Vi)&&(Vi=null),Gi!==null&&qo(Gi)&&(Gi=null),qs.forEach(ad),js.forEach(ad)}function Ks(t,i){t.blockedOn===i&&(t.blockedOn=null,Ol||(Ol=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,xg)))}function Zs(t){function i(c){return Ks(c,t)}if(0<Yo.length){Ks(Yo[0],t);for(var o=1;o<Yo.length;o++){var l=Yo[o];l.blockedOn===t&&(l.blockedOn=null)}}for(Hi!==null&&Ks(Hi,t),Vi!==null&&Ks(Vi,t),Gi!==null&&Ks(Gi,t),qs.forEach(i),js.forEach(i),o=0;o<Wi.length;o++)l=Wi[o],l.blockedOn===t&&(l.blockedOn=null);for(;0<Wi.length&&(o=Wi[0],o.blockedOn===null);)od(o),o.blockedOn===null&&Wi.shift()}var $r=L.ReactCurrentBatchConfig,jo=!0;function Sg(t,i,o,l){var c=Et,h=$r.transition;$r.transition=null;try{Et=1,Bl(t,i,o,l)}finally{Et=c,$r.transition=h}}function yg(t,i,o,l){var c=Et,h=$r.transition;$r.transition=null;try{Et=4,Bl(t,i,o,l)}finally{Et=c,$r.transition=h}}function Bl(t,i,o,l){if(jo){var c=kl(t,i,o,l);if(c===null)nu(t,i,l,$o,o),sd(t,l);else if(vg(c,t,i,o,l))l.stopPropagation();else if(sd(t,l),i&4&&-1<_g.indexOf(t)){for(;c!==null;){var h=uo(c);if(h!==null&&td(h),h=kl(t,i,o,l),h===null&&nu(t,i,l,$o,o),h===c)break;c=h}c!==null&&l.stopPropagation()}else nu(t,i,l,null,o)}}var $o=null;function kl(t,i,o,l){if($o=null,t=Le(l),t=xr(t),t!==null)if(i=_i(t),i===null)t=null;else if(o=i.tag,o===13){if(t=Wo(i),t!==null)return t;t=null}else if(o===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;t=null}else i!==t&&(t=null);return $o=t,null}function ld(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Ve()){case je:return 1;case Ke:return 4;case Ge:case St:return 16;case wt:return 536870912;default:return 16}default:return 16}}var Xi=null,zl=null,Ko=null;function ud(){if(Ko)return Ko;var t,i=zl,o=i.length,l,c="value"in Xi?Xi.value:Xi.textContent,h=c.length;for(t=0;t<o&&i[t]===c[t];t++);var E=o-t;for(l=1;l<=E&&i[o-l]===c[h-l];l++);return Ko=c.slice(t,1<l?1-l:void 0)}function Zo(t){var i=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&i===13&&(t=13)):t=i,t===10&&(t=13),32<=t||t===13?t:0}function Qo(){return!0}function cd(){return!1}function Pn(t){function i(o,l,c,h,E){this._reactName=o,this._targetInst=c,this.type=l,this.nativeEvent=h,this.target=E,this.currentTarget=null;for(var U in t)t.hasOwnProperty(U)&&(o=t[U],this[U]=o?o(h):h[U]);return this.isDefaultPrevented=(h.defaultPrevented!=null?h.defaultPrevented:h.returnValue===!1)?Qo:cd,this.isPropagationStopped=cd,this}return oe(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var o=this.nativeEvent;o&&(o.preventDefault?o.preventDefault():typeof o.returnValue!="unknown"&&(o.returnValue=!1),this.isDefaultPrevented=Qo)},stopPropagation:function(){var o=this.nativeEvent;o&&(o.stopPropagation?o.stopPropagation():typeof o.cancelBubble!="unknown"&&(o.cancelBubble=!0),this.isPropagationStopped=Qo)},persist:function(){},isPersistent:Qo}),i}var Kr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Hl=Pn(Kr),Qs=oe({},Kr,{view:0,detail:0}),Mg=Pn(Qs),Vl,Gl,Js,Jo=oe({},Qs,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Xl,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Js&&(Js&&t.type==="mousemove"?(Vl=t.screenX-Js.screenX,Gl=t.screenY-Js.screenY):Gl=Vl=0,Js=t),Vl)},movementY:function(t){return"movementY"in t?t.movementY:Gl}}),fd=Pn(Jo),Eg=oe({},Jo,{dataTransfer:0}),Tg=Pn(Eg),wg=oe({},Qs,{relatedTarget:0}),Wl=Pn(wg),Ag=oe({},Kr,{animationName:0,elapsedTime:0,pseudoElement:0}),Rg=Pn(Ag),Cg=oe({},Kr,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),Pg=Pn(Cg),Lg=oe({},Kr,{data:0}),dd=Pn(Lg),bg={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Dg={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Ig={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Ug(t){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(t):(t=Ig[t])?!!i[t]:!1}function Xl(){return Ug}var Ng=oe({},Qs,{key:function(t){if(t.key){var i=bg[t.key]||t.key;if(i!=="Unidentified")return i}return t.type==="keypress"?(t=Zo(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?Dg[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Xl,charCode:function(t){return t.type==="keypress"?Zo(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Zo(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Fg=Pn(Ng),Og=oe({},Jo,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),hd=Pn(Og),Bg=oe({},Qs,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Xl}),kg=Pn(Bg),zg=oe({},Kr,{propertyName:0,elapsedTime:0,pseudoElement:0}),Hg=Pn(zg),Vg=oe({},Jo,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),Gg=Pn(Vg),Wg=[9,13,27,32],Yl=d&&"CompositionEvent"in window,eo=null;d&&"documentMode"in document&&(eo=document.documentMode);var Xg=d&&"TextEvent"in window&&!eo,pd=d&&(!Yl||eo&&8<eo&&11>=eo),md=" ",gd=!1;function _d(t,i){switch(t){case"keyup":return Wg.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function vd(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Zr=!1;function Yg(t,i){switch(t){case"compositionend":return vd(i);case"keypress":return i.which!==32?null:(gd=!0,md);case"textInput":return t=i.data,t===md&&gd?null:t;default:return null}}function qg(t,i){if(Zr)return t==="compositionend"||!Yl&&_d(t,i)?(t=ud(),Ko=zl=Xi=null,Zr=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return pd&&i.locale!=="ko"?null:i.data;default:return null}}var jg={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function xd(t){var i=t&&t.nodeName&&t.nodeName.toLowerCase();return i==="input"?!!jg[t.type]:i==="textarea"}function Sd(t,i,o,l){ut(l),i=ra(i,"onChange"),0<i.length&&(o=new Hl("onChange","change",null,o,l),t.push({event:o,listeners:i}))}var to=null,no=null;function $g(t){Bd(t,0)}function ea(t){var i=ns(t);if(at(i))return t}function Kg(t,i){if(t==="change")return i}var yd=!1;if(d){var ql;if(d){var jl="oninput"in document;if(!jl){var Md=document.createElement("div");Md.setAttribute("oninput","return;"),jl=typeof Md.oninput=="function"}ql=jl}else ql=!1;yd=ql&&(!document.documentMode||9<document.documentMode)}function Ed(){to&&(to.detachEvent("onpropertychange",Td),no=to=null)}function Td(t){if(t.propertyName==="value"&&ea(no)){var i=[];Sd(i,no,t,Le(t)),Fn($g,i)}}function Zg(t,i,o){t==="focusin"?(Ed(),to=i,no=o,to.attachEvent("onpropertychange",Td)):t==="focusout"&&Ed()}function Qg(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return ea(no)}function Jg(t,i){if(t==="click")return ea(i)}function e_(t,i){if(t==="input"||t==="change")return ea(i)}function t_(t,i){return t===i&&(t!==0||1/t===1/i)||t!==t&&i!==i}var jn=typeof Object.is=="function"?Object.is:t_;function io(t,i){if(jn(t,i))return!0;if(typeof t!="object"||t===null||typeof i!="object"||i===null)return!1;var o=Object.keys(t),l=Object.keys(i);if(o.length!==l.length)return!1;for(l=0;l<o.length;l++){var c=o[l];if(!p.call(i,c)||!jn(t[c],i[c]))return!1}return!0}function wd(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Ad(t,i){var o=wd(t);t=0;for(var l;o;){if(o.nodeType===3){if(l=t+o.textContent.length,t<=i&&l>=i)return{node:o,offset:i-t};t=l}e:{for(;o;){if(o.nextSibling){o=o.nextSibling;break e}o=o.parentNode}o=void 0}o=wd(o)}}function Rd(t,i){return t&&i?t===i?!0:t&&t.nodeType===3?!1:i&&i.nodeType===3?Rd(t,i.parentNode):"contains"in t?t.contains(i):t.compareDocumentPosition?!!(t.compareDocumentPosition(i)&16):!1:!1}function Cd(){for(var t=window,i=B();i instanceof t.HTMLIFrameElement;){try{var o=typeof i.contentWindow.location.href=="string"}catch{o=!1}if(o)t=i.contentWindow;else break;i=B(t.document)}return i}function $l(t){var i=t&&t.nodeName&&t.nodeName.toLowerCase();return i&&(i==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||i==="textarea"||t.contentEditable==="true")}function n_(t){var i=Cd(),o=t.focusedElem,l=t.selectionRange;if(i!==o&&o&&o.ownerDocument&&Rd(o.ownerDocument.documentElement,o)){if(l!==null&&$l(o)){if(i=l.start,t=l.end,t===void 0&&(t=i),"selectionStart"in o)o.selectionStart=i,o.selectionEnd=Math.min(t,o.value.length);else if(t=(i=o.ownerDocument||document)&&i.defaultView||window,t.getSelection){t=t.getSelection();var c=o.textContent.length,h=Math.min(l.start,c);l=l.end===void 0?h:Math.min(l.end,c),!t.extend&&h>l&&(c=l,l=h,h=c),c=Ad(o,h);var E=Ad(o,l);c&&E&&(t.rangeCount!==1||t.anchorNode!==c.node||t.anchorOffset!==c.offset||t.focusNode!==E.node||t.focusOffset!==E.offset)&&(i=i.createRange(),i.setStart(c.node,c.offset),t.removeAllRanges(),h>l?(t.addRange(i),t.extend(E.node,E.offset)):(i.setEnd(E.node,E.offset),t.addRange(i)))}}for(i=[],t=o;t=t.parentNode;)t.nodeType===1&&i.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<i.length;o++)t=i[o],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var i_=d&&"documentMode"in document&&11>=document.documentMode,Qr=null,Kl=null,ro=null,Zl=!1;function Pd(t,i,o){var l=o.window===o?o.document:o.nodeType===9?o:o.ownerDocument;Zl||Qr==null||Qr!==B(l)||(l=Qr,"selectionStart"in l&&$l(l)?l={start:l.selectionStart,end:l.selectionEnd}:(l=(l.ownerDocument&&l.ownerDocument.defaultView||window).getSelection(),l={anchorNode:l.anchorNode,anchorOffset:l.anchorOffset,focusNode:l.focusNode,focusOffset:l.focusOffset}),ro&&io(ro,l)||(ro=l,l=ra(Kl,"onSelect"),0<l.length&&(i=new Hl("onSelect","select",null,i,o),t.push({event:i,listeners:l}),i.target=Qr)))}function ta(t,i){var o={};return o[t.toLowerCase()]=i.toLowerCase(),o["Webkit"+t]="webkit"+i,o["Moz"+t]="moz"+i,o}var Jr={animationend:ta("Animation","AnimationEnd"),animationiteration:ta("Animation","AnimationIteration"),animationstart:ta("Animation","AnimationStart"),transitionend:ta("Transition","TransitionEnd")},Ql={},Ld={};d&&(Ld=document.createElement("div").style,"AnimationEvent"in window||(delete Jr.animationend.animation,delete Jr.animationiteration.animation,delete Jr.animationstart.animation),"TransitionEvent"in window||delete Jr.transitionend.transition);function na(t){if(Ql[t])return Ql[t];if(!Jr[t])return t;var i=Jr[t],o;for(o in i)if(i.hasOwnProperty(o)&&o in Ld)return Ql[t]=i[o];return t}var bd=na("animationend"),Dd=na("animationiteration"),Id=na("animationstart"),Ud=na("transitionend"),Nd=new Map,Fd="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Yi(t,i){Nd.set(t,i),u(i,[t])}for(var Jl=0;Jl<Fd.length;Jl++){var eu=Fd[Jl],r_=eu.toLowerCase(),s_=eu[0].toUpperCase()+eu.slice(1);Yi(r_,"on"+s_)}Yi(bd,"onAnimationEnd"),Yi(Dd,"onAnimationIteration"),Yi(Id,"onAnimationStart"),Yi("dblclick","onDoubleClick"),Yi("focusin","onFocus"),Yi("focusout","onBlur"),Yi(Ud,"onTransitionEnd"),f("onMouseEnter",["mouseout","mouseover"]),f("onMouseLeave",["mouseout","mouseover"]),f("onPointerEnter",["pointerout","pointerover"]),f("onPointerLeave",["pointerout","pointerover"]),u("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),u("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),u("onBeforeInput",["compositionend","keypress","textInput","paste"]),u("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),u("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),u("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var so="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),o_=new Set("cancel close invalid load scroll toggle".split(" ").concat(so));function Od(t,i,o){var l=t.type||"unknown-event";t.currentTarget=o,Go(l,i,void 0,t),t.currentTarget=null}function Bd(t,i){i=(i&4)!==0;for(var o=0;o<t.length;o++){var l=t[o],c=l.event;l=l.listeners;e:{var h=void 0;if(i)for(var E=l.length-1;0<=E;E--){var U=l[E],O=U.instance,te=U.currentTarget;if(U=U.listener,O!==h&&c.isPropagationStopped())break e;Od(c,U,te),h=O}else for(E=0;E<l.length;E++){if(U=l[E],O=U.instance,te=U.currentTarget,U=U.listener,O!==h&&c.isPropagationStopped())break e;Od(c,U,te),h=O}}}if(gi)throw t=Yr,gi=!1,Yr=null,t}function Pt(t,i){var o=i[lu];o===void 0&&(o=i[lu]=new Set);var l=t+"__bubble";o.has(l)||(kd(i,t,2,!1),o.add(l))}function tu(t,i,o){var l=0;i&&(l|=4),kd(o,t,l,i)}var ia="_reactListening"+Math.random().toString(36).slice(2);function oo(t){if(!t[ia]){t[ia]=!0,r.forEach(function(o){o!=="selectionchange"&&(o_.has(o)||tu(o,!1,t),tu(o,!0,t))});var i=t.nodeType===9?t:t.ownerDocument;i===null||i[ia]||(i[ia]=!0,tu("selectionchange",!1,i))}}function kd(t,i,o,l){switch(ld(i)){case 1:var c=Sg;break;case 4:c=yg;break;default:c=Bl}o=c.bind(null,i,o,t),c=void 0,!Xr||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(c=!0),l?c!==void 0?t.addEventListener(i,o,{capture:!0,passive:c}):t.addEventListener(i,o,!0):c!==void 0?t.addEventListener(i,o,{passive:c}):t.addEventListener(i,o,!1)}function nu(t,i,o,l,c){var h=l;if((i&1)===0&&(i&2)===0&&l!==null)e:for(;;){if(l===null)return;var E=l.tag;if(E===3||E===4){var U=l.stateNode.containerInfo;if(U===c||U.nodeType===8&&U.parentNode===c)break;if(E===4)for(E=l.return;E!==null;){var O=E.tag;if((O===3||O===4)&&(O=E.stateNode.containerInfo,O===c||O.nodeType===8&&O.parentNode===c))return;E=E.return}for(;U!==null;){if(E=xr(U),E===null)return;if(O=E.tag,O===5||O===6){l=h=E;continue e}U=U.parentNode}}l=l.return}Fn(function(){var te=h,ge=Le(o),ve=[];e:{var me=Nd.get(t);if(me!==void 0){var Ie=Hl,ze=t;switch(t){case"keypress":if(Zo(o)===0)break e;case"keydown":case"keyup":Ie=Fg;break;case"focusin":ze="focus",Ie=Wl;break;case"focusout":ze="blur",Ie=Wl;break;case"beforeblur":case"afterblur":Ie=Wl;break;case"click":if(o.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":Ie=fd;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":Ie=Tg;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":Ie=kg;break;case bd:case Dd:case Id:Ie=Rg;break;case Ud:Ie=Hg;break;case"scroll":Ie=Mg;break;case"wheel":Ie=Gg;break;case"copy":case"cut":case"paste":Ie=Pg;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":Ie=hd}var He=(i&4)!==0,zt=!He&&t==="scroll",Y=He?me!==null?me+"Capture":null:me;He=[];for(var z=te,$;z!==null;){$=z;var Me=$.stateNode;if($.tag===5&&Me!==null&&($=Me,Y!==null&&(Me=Bi(z,Y),Me!=null&&He.push(ao(z,Me,$)))),zt)break;z=z.return}0<He.length&&(me=new Ie(me,ze,null,o,ge),ve.push({event:me,listeners:He}))}}if((i&7)===0){e:{if(me=t==="mouseover"||t==="pointerover",Ie=t==="mouseout"||t==="pointerout",me&&o!==V&&(ze=o.relatedTarget||o.fromElement)&&(xr(ze)||ze[xi]))break e;if((Ie||me)&&(me=ge.window===ge?ge:(me=ge.ownerDocument)?me.defaultView||me.parentWindow:window,Ie?(ze=o.relatedTarget||o.toElement,Ie=te,ze=ze?xr(ze):null,ze!==null&&(zt=_i(ze),ze!==zt||ze.tag!==5&&ze.tag!==6)&&(ze=null)):(Ie=null,ze=te),Ie!==ze)){if(He=fd,Me="onMouseLeave",Y="onMouseEnter",z="mouse",(t==="pointerout"||t==="pointerover")&&(He=hd,Me="onPointerLeave",Y="onPointerEnter",z="pointer"),zt=Ie==null?me:ns(Ie),$=ze==null?me:ns(ze),me=new He(Me,z+"leave",Ie,o,ge),me.target=zt,me.relatedTarget=$,Me=null,xr(ge)===te&&(He=new He(Y,z+"enter",ze,o,ge),He.target=$,He.relatedTarget=zt,Me=He),zt=Me,Ie&&ze)t:{for(He=Ie,Y=ze,z=0,$=He;$;$=es($))z++;for($=0,Me=Y;Me;Me=es(Me))$++;for(;0<z-$;)He=es(He),z--;for(;0<$-z;)Y=es(Y),$--;for(;z--;){if(He===Y||Y!==null&&He===Y.alternate)break t;He=es(He),Y=es(Y)}He=null}else He=null;Ie!==null&&zd(ve,me,Ie,He,!1),ze!==null&&zt!==null&&zd(ve,zt,ze,He,!0)}}e:{if(me=te?ns(te):window,Ie=me.nodeName&&me.nodeName.toLowerCase(),Ie==="select"||Ie==="input"&&me.type==="file")var We=Kg;else if(xd(me))if(yd)We=e_;else{We=Qg;var Ye=Zg}else(Ie=me.nodeName)&&Ie.toLowerCase()==="input"&&(me.type==="checkbox"||me.type==="radio")&&(We=Jg);if(We&&(We=We(t,te))){Sd(ve,We,o,ge);break e}Ye&&Ye(t,me,te),t==="focusout"&&(Ye=me._wrapperState)&&Ye.controlled&&me.type==="number"&&Ze(me,"number",me.value)}switch(Ye=te?ns(te):window,t){case"focusin":(xd(Ye)||Ye.contentEditable==="true")&&(Qr=Ye,Kl=te,ro=null);break;case"focusout":ro=Kl=Qr=null;break;case"mousedown":Zl=!0;break;case"contextmenu":case"mouseup":case"dragend":Zl=!1,Pd(ve,o,ge);break;case"selectionchange":if(i_)break;case"keydown":case"keyup":Pd(ve,o,ge)}var qe;if(Yl)e:{switch(t){case"compositionstart":var tt="onCompositionStart";break e;case"compositionend":tt="onCompositionEnd";break e;case"compositionupdate":tt="onCompositionUpdate";break e}tt=void 0}else Zr?_d(t,o)&&(tt="onCompositionEnd"):t==="keydown"&&o.keyCode===229&&(tt="onCompositionStart");tt&&(pd&&o.locale!=="ko"&&(Zr||tt!=="onCompositionStart"?tt==="onCompositionEnd"&&Zr&&(qe=ud()):(Xi=ge,zl="value"in Xi?Xi.value:Xi.textContent,Zr=!0)),Ye=ra(te,tt),0<Ye.length&&(tt=new dd(tt,t,null,o,ge),ve.push({event:tt,listeners:Ye}),qe?tt.data=qe:(qe=vd(o),qe!==null&&(tt.data=qe)))),(qe=Xg?Yg(t,o):qg(t,o))&&(te=ra(te,"onBeforeInput"),0<te.length&&(ge=new dd("onBeforeInput","beforeinput",null,o,ge),ve.push({event:ge,listeners:te}),ge.data=qe))}Bd(ve,i)})}function ao(t,i,o){return{instance:t,listener:i,currentTarget:o}}function ra(t,i){for(var o=i+"Capture",l=[];t!==null;){var c=t,h=c.stateNode;c.tag===5&&h!==null&&(c=h,h=Bi(t,o),h!=null&&l.unshift(ao(t,h,c)),h=Bi(t,i),h!=null&&l.push(ao(t,h,c))),t=t.return}return l}function es(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function zd(t,i,o,l,c){for(var h=i._reactName,E=[];o!==null&&o!==l;){var U=o,O=U.alternate,te=U.stateNode;if(O!==null&&O===l)break;U.tag===5&&te!==null&&(U=te,c?(O=Bi(o,h),O!=null&&E.unshift(ao(o,O,U))):c||(O=Bi(o,h),O!=null&&E.push(ao(o,O,U)))),o=o.return}E.length!==0&&t.push({event:i,listeners:E})}var a_=/\r\n?/g,l_=/\u0000|\uFFFD/g;function Hd(t){return(typeof t=="string"?t:""+t).replace(a_,`
`).replace(l_,"")}function sa(t,i,o){if(i=Hd(i),Hd(t)!==i&&o)throw Error(n(425))}function oa(){}var iu=null,ru=null;function su(t,i){return t==="textarea"||t==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var ou=typeof setTimeout=="function"?setTimeout:void 0,u_=typeof clearTimeout=="function"?clearTimeout:void 0,Vd=typeof Promise=="function"?Promise:void 0,c_=typeof queueMicrotask=="function"?queueMicrotask:typeof Vd<"u"?function(t){return Vd.resolve(null).then(t).catch(f_)}:ou;function f_(t){setTimeout(function(){throw t})}function au(t,i){var o=i,l=0;do{var c=o.nextSibling;if(t.removeChild(o),c&&c.nodeType===8)if(o=c.data,o==="/$"){if(l===0){t.removeChild(c),Zs(i);return}l--}else o!=="$"&&o!=="$?"&&o!=="$!"||l++;o=c}while(o);Zs(i)}function qi(t){for(;t!=null;t=t.nextSibling){var i=t.nodeType;if(i===1||i===3)break;if(i===8){if(i=t.data,i==="$"||i==="$!"||i==="$?")break;if(i==="/$")return null}}return t}function Gd(t){t=t.previousSibling;for(var i=0;t;){if(t.nodeType===8){var o=t.data;if(o==="$"||o==="$!"||o==="$?"){if(i===0)return t;i--}else o==="/$"&&i++}t=t.previousSibling}return null}var ts=Math.random().toString(36).slice(2),li="__reactFiber$"+ts,lo="__reactProps$"+ts,xi="__reactContainer$"+ts,lu="__reactEvents$"+ts,d_="__reactListeners$"+ts,h_="__reactHandles$"+ts;function xr(t){var i=t[li];if(i)return i;for(var o=t.parentNode;o;){if(i=o[xi]||o[li]){if(o=i.alternate,i.child!==null||o!==null&&o.child!==null)for(t=Gd(t);t!==null;){if(o=t[li])return o;t=Gd(t)}return i}t=o,o=t.parentNode}return null}function uo(t){return t=t[li]||t[xi],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function ns(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(n(33))}function aa(t){return t[lo]||null}var uu=[],is=-1;function ji(t){return{current:t}}function Lt(t){0>is||(t.current=uu[is],uu[is]=null,is--)}function Ct(t,i){is++,uu[is]=t.current,t.current=i}var $i={},ln=ji($i),_n=ji(!1),Sr=$i;function rs(t,i){var o=t.type.contextTypes;if(!o)return $i;var l=t.stateNode;if(l&&l.__reactInternalMemoizedUnmaskedChildContext===i)return l.__reactInternalMemoizedMaskedChildContext;var c={},h;for(h in o)c[h]=i[h];return l&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=i,t.__reactInternalMemoizedMaskedChildContext=c),c}function vn(t){return t=t.childContextTypes,t!=null}function la(){Lt(_n),Lt(ln)}function Wd(t,i,o){if(ln.current!==$i)throw Error(n(168));Ct(ln,i),Ct(_n,o)}function Xd(t,i,o){var l=t.stateNode;if(i=i.childContextTypes,typeof l.getChildContext!="function")return o;l=l.getChildContext();for(var c in l)if(!(c in i))throw Error(n(108,Se(t)||"Unknown",c));return oe({},o,l)}function ua(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||$i,Sr=ln.current,Ct(ln,t),Ct(_n,_n.current),!0}function Yd(t,i,o){var l=t.stateNode;if(!l)throw Error(n(169));o?(t=Xd(t,i,Sr),l.__reactInternalMemoizedMergedChildContext=t,Lt(_n),Lt(ln),Ct(ln,t)):Lt(_n),Ct(_n,o)}var Si=null,ca=!1,cu=!1;function qd(t){Si===null?Si=[t]:Si.push(t)}function p_(t){ca=!0,qd(t)}function Ki(){if(!cu&&Si!==null){cu=!0;var t=0,i=Et;try{var o=Si;for(Et=1;t<o.length;t++){var l=o[t];do l=l(!0);while(l!==null)}Si=null,ca=!1}catch(c){throw Si!==null&&(Si=Si.slice(t+1)),ee(je,Ki),c}finally{Et=i,cu=!1}}return null}var ss=[],os=0,fa=null,da=0,On=[],Bn=0,yr=null,yi=1,Mi="";function Mr(t,i){ss[os++]=da,ss[os++]=fa,fa=t,da=i}function jd(t,i,o){On[Bn++]=yi,On[Bn++]=Mi,On[Bn++]=yr,yr=t;var l=yi;t=Mi;var c=32-Oe(l)-1;l&=~(1<<c),o+=1;var h=32-Oe(i)+c;if(30<h){var E=c-c%5;h=(l&(1<<E)-1).toString(32),l>>=E,c-=E,yi=1<<32-Oe(i)+c|o<<c|l,Mi=h+t}else yi=1<<h|o<<c|l,Mi=t}function fu(t){t.return!==null&&(Mr(t,1),jd(t,1,0))}function du(t){for(;t===fa;)fa=ss[--os],ss[os]=null,da=ss[--os],ss[os]=null;for(;t===yr;)yr=On[--Bn],On[Bn]=null,Mi=On[--Bn],On[Bn]=null,yi=On[--Bn],On[Bn]=null}var Ln=null,bn=null,It=!1,$n=null;function $d(t,i){var o=Vn(5,null,null,0);o.elementType="DELETED",o.stateNode=i,o.return=t,i=t.deletions,i===null?(t.deletions=[o],t.flags|=16):i.push(o)}function Kd(t,i){switch(t.tag){case 5:var o=t.type;return i=i.nodeType!==1||o.toLowerCase()!==i.nodeName.toLowerCase()?null:i,i!==null?(t.stateNode=i,Ln=t,bn=qi(i.firstChild),!0):!1;case 6:return i=t.pendingProps===""||i.nodeType!==3?null:i,i!==null?(t.stateNode=i,Ln=t,bn=null,!0):!1;case 13:return i=i.nodeType!==8?null:i,i!==null?(o=yr!==null?{id:yi,overflow:Mi}:null,t.memoizedState={dehydrated:i,treeContext:o,retryLane:1073741824},o=Vn(18,null,null,0),o.stateNode=i,o.return=t,t.child=o,Ln=t,bn=null,!0):!1;default:return!1}}function hu(t){return(t.mode&1)!==0&&(t.flags&128)===0}function pu(t){if(It){var i=bn;if(i){var o=i;if(!Kd(t,i)){if(hu(t))throw Error(n(418));i=qi(o.nextSibling);var l=Ln;i&&Kd(t,i)?$d(l,o):(t.flags=t.flags&-4097|2,It=!1,Ln=t)}}else{if(hu(t))throw Error(n(418));t.flags=t.flags&-4097|2,It=!1,Ln=t}}}function Zd(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;Ln=t}function ha(t){if(t!==Ln)return!1;if(!It)return Zd(t),It=!0,!1;var i;if((i=t.tag!==3)&&!(i=t.tag!==5)&&(i=t.type,i=i!=="head"&&i!=="body"&&!su(t.type,t.memoizedProps)),i&&(i=bn)){if(hu(t))throw Qd(),Error(n(418));for(;i;)$d(t,i),i=qi(i.nextSibling)}if(Zd(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(n(317));e:{for(t=t.nextSibling,i=0;t;){if(t.nodeType===8){var o=t.data;if(o==="/$"){if(i===0){bn=qi(t.nextSibling);break e}i--}else o!=="$"&&o!=="$!"&&o!=="$?"||i++}t=t.nextSibling}bn=null}}else bn=Ln?qi(t.stateNode.nextSibling):null;return!0}function Qd(){for(var t=bn;t;)t=qi(t.nextSibling)}function as(){bn=Ln=null,It=!1}function mu(t){$n===null?$n=[t]:$n.push(t)}var m_=L.ReactCurrentBatchConfig;function co(t,i,o){if(t=o.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(o._owner){if(o=o._owner,o){if(o.tag!==1)throw Error(n(309));var l=o.stateNode}if(!l)throw Error(n(147,t));var c=l,h=""+t;return i!==null&&i.ref!==null&&typeof i.ref=="function"&&i.ref._stringRef===h?i.ref:(i=function(E){var U=c.refs;E===null?delete U[h]:U[h]=E},i._stringRef=h,i)}if(typeof t!="string")throw Error(n(284));if(!o._owner)throw Error(n(290,t))}return t}function pa(t,i){throw t=Object.prototype.toString.call(i),Error(n(31,t==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":t))}function Jd(t){var i=t._init;return i(t._payload)}function eh(t){function i(Y,z){if(t){var $=Y.deletions;$===null?(Y.deletions=[z],Y.flags|=16):$.push(z)}}function o(Y,z){if(!t)return null;for(;z!==null;)i(Y,z),z=z.sibling;return null}function l(Y,z){for(Y=new Map;z!==null;)z.key!==null?Y.set(z.key,z):Y.set(z.index,z),z=z.sibling;return Y}function c(Y,z){return Y=rr(Y,z),Y.index=0,Y.sibling=null,Y}function h(Y,z,$){return Y.index=$,t?($=Y.alternate,$!==null?($=$.index,$<z?(Y.flags|=2,z):$):(Y.flags|=2,z)):(Y.flags|=1048576,z)}function E(Y){return t&&Y.alternate===null&&(Y.flags|=2),Y}function U(Y,z,$,Me){return z===null||z.tag!==6?(z=oc($,Y.mode,Me),z.return=Y,z):(z=c(z,$),z.return=Y,z)}function O(Y,z,$,Me){var We=$.type;return We===I?ge(Y,z,$.props.children,Me,$.key):z!==null&&(z.elementType===We||typeof We=="object"&&We!==null&&We.$$typeof===ne&&Jd(We)===z.type)?(Me=c(z,$.props),Me.ref=co(Y,z,$),Me.return=Y,Me):(Me=Ba($.type,$.key,$.props,null,Y.mode,Me),Me.ref=co(Y,z,$),Me.return=Y,Me)}function te(Y,z,$,Me){return z===null||z.tag!==4||z.stateNode.containerInfo!==$.containerInfo||z.stateNode.implementation!==$.implementation?(z=ac($,Y.mode,Me),z.return=Y,z):(z=c(z,$.children||[]),z.return=Y,z)}function ge(Y,z,$,Me,We){return z===null||z.tag!==7?(z=Lr($,Y.mode,Me,We),z.return=Y,z):(z=c(z,$),z.return=Y,z)}function ve(Y,z,$){if(typeof z=="string"&&z!==""||typeof z=="number")return z=oc(""+z,Y.mode,$),z.return=Y,z;if(typeof z=="object"&&z!==null){switch(z.$$typeof){case X:return $=Ba(z.type,z.key,z.props,null,Y.mode,$),$.ref=co(Y,null,z),$.return=Y,$;case F:return z=ac(z,Y.mode,$),z.return=Y,z;case ne:var Me=z._init;return ve(Y,Me(z._payload),$)}if(D(z)||ce(z))return z=Lr(z,Y.mode,$,null),z.return=Y,z;pa(Y,z)}return null}function me(Y,z,$,Me){var We=z!==null?z.key:null;if(typeof $=="string"&&$!==""||typeof $=="number")return We!==null?null:U(Y,z,""+$,Me);if(typeof $=="object"&&$!==null){switch($.$$typeof){case X:return $.key===We?O(Y,z,$,Me):null;case F:return $.key===We?te(Y,z,$,Me):null;case ne:return We=$._init,me(Y,z,We($._payload),Me)}if(D($)||ce($))return We!==null?null:ge(Y,z,$,Me,null);pa(Y,$)}return null}function Ie(Y,z,$,Me,We){if(typeof Me=="string"&&Me!==""||typeof Me=="number")return Y=Y.get($)||null,U(z,Y,""+Me,We);if(typeof Me=="object"&&Me!==null){switch(Me.$$typeof){case X:return Y=Y.get(Me.key===null?$:Me.key)||null,O(z,Y,Me,We);case F:return Y=Y.get(Me.key===null?$:Me.key)||null,te(z,Y,Me,We);case ne:var Ye=Me._init;return Ie(Y,z,$,Ye(Me._payload),We)}if(D(Me)||ce(Me))return Y=Y.get($)||null,ge(z,Y,Me,We,null);pa(z,Me)}return null}function ze(Y,z,$,Me){for(var We=null,Ye=null,qe=z,tt=z=0,Qt=null;qe!==null&&tt<$.length;tt++){qe.index>tt?(Qt=qe,qe=null):Qt=qe.sibling;var xt=me(Y,qe,$[tt],Me);if(xt===null){qe===null&&(qe=Qt);break}t&&qe&&xt.alternate===null&&i(Y,qe),z=h(xt,z,tt),Ye===null?We=xt:Ye.sibling=xt,Ye=xt,qe=Qt}if(tt===$.length)return o(Y,qe),It&&Mr(Y,tt),We;if(qe===null){for(;tt<$.length;tt++)qe=ve(Y,$[tt],Me),qe!==null&&(z=h(qe,z,tt),Ye===null?We=qe:Ye.sibling=qe,Ye=qe);return It&&Mr(Y,tt),We}for(qe=l(Y,qe);tt<$.length;tt++)Qt=Ie(qe,Y,tt,$[tt],Me),Qt!==null&&(t&&Qt.alternate!==null&&qe.delete(Qt.key===null?tt:Qt.key),z=h(Qt,z,tt),Ye===null?We=Qt:Ye.sibling=Qt,Ye=Qt);return t&&qe.forEach(function(sr){return i(Y,sr)}),It&&Mr(Y,tt),We}function He(Y,z,$,Me){var We=ce($);if(typeof We!="function")throw Error(n(150));if($=We.call($),$==null)throw Error(n(151));for(var Ye=We=null,qe=z,tt=z=0,Qt=null,xt=$.next();qe!==null&&!xt.done;tt++,xt=$.next()){qe.index>tt?(Qt=qe,qe=null):Qt=qe.sibling;var sr=me(Y,qe,xt.value,Me);if(sr===null){qe===null&&(qe=Qt);break}t&&qe&&sr.alternate===null&&i(Y,qe),z=h(sr,z,tt),Ye===null?We=sr:Ye.sibling=sr,Ye=sr,qe=Qt}if(xt.done)return o(Y,qe),It&&Mr(Y,tt),We;if(qe===null){for(;!xt.done;tt++,xt=$.next())xt=ve(Y,xt.value,Me),xt!==null&&(z=h(xt,z,tt),Ye===null?We=xt:Ye.sibling=xt,Ye=xt);return It&&Mr(Y,tt),We}for(qe=l(Y,qe);!xt.done;tt++,xt=$.next())xt=Ie(qe,Y,tt,xt.value,Me),xt!==null&&(t&&xt.alternate!==null&&qe.delete(xt.key===null?tt:xt.key),z=h(xt,z,tt),Ye===null?We=xt:Ye.sibling=xt,Ye=xt);return t&&qe.forEach(function(j_){return i(Y,j_)}),It&&Mr(Y,tt),We}function zt(Y,z,$,Me){if(typeof $=="object"&&$!==null&&$.type===I&&$.key===null&&($=$.props.children),typeof $=="object"&&$!==null){switch($.$$typeof){case X:e:{for(var We=$.key,Ye=z;Ye!==null;){if(Ye.key===We){if(We=$.type,We===I){if(Ye.tag===7){o(Y,Ye.sibling),z=c(Ye,$.props.children),z.return=Y,Y=z;break e}}else if(Ye.elementType===We||typeof We=="object"&&We!==null&&We.$$typeof===ne&&Jd(We)===Ye.type){o(Y,Ye.sibling),z=c(Ye,$.props),z.ref=co(Y,Ye,$),z.return=Y,Y=z;break e}o(Y,Ye);break}else i(Y,Ye);Ye=Ye.sibling}$.type===I?(z=Lr($.props.children,Y.mode,Me,$.key),z.return=Y,Y=z):(Me=Ba($.type,$.key,$.props,null,Y.mode,Me),Me.ref=co(Y,z,$),Me.return=Y,Y=Me)}return E(Y);case F:e:{for(Ye=$.key;z!==null;){if(z.key===Ye)if(z.tag===4&&z.stateNode.containerInfo===$.containerInfo&&z.stateNode.implementation===$.implementation){o(Y,z.sibling),z=c(z,$.children||[]),z.return=Y,Y=z;break e}else{o(Y,z);break}else i(Y,z);z=z.sibling}z=ac($,Y.mode,Me),z.return=Y,Y=z}return E(Y);case ne:return Ye=$._init,zt(Y,z,Ye($._payload),Me)}if(D($))return ze(Y,z,$,Me);if(ce($))return He(Y,z,$,Me);pa(Y,$)}return typeof $=="string"&&$!==""||typeof $=="number"?($=""+$,z!==null&&z.tag===6?(o(Y,z.sibling),z=c(z,$),z.return=Y,Y=z):(o(Y,z),z=oc($,Y.mode,Me),z.return=Y,Y=z),E(Y)):o(Y,z)}return zt}var ls=eh(!0),th=eh(!1),ma=ji(null),ga=null,us=null,gu=null;function _u(){gu=us=ga=null}function vu(t){var i=ma.current;Lt(ma),t._currentValue=i}function xu(t,i,o){for(;t!==null;){var l=t.alternate;if((t.childLanes&i)!==i?(t.childLanes|=i,l!==null&&(l.childLanes|=i)):l!==null&&(l.childLanes&i)!==i&&(l.childLanes|=i),t===o)break;t=t.return}}function cs(t,i){ga=t,gu=us=null,t=t.dependencies,t!==null&&t.firstContext!==null&&((t.lanes&i)!==0&&(xn=!0),t.firstContext=null)}function kn(t){var i=t._currentValue;if(gu!==t)if(t={context:t,memoizedValue:i,next:null},us===null){if(ga===null)throw Error(n(308));us=t,ga.dependencies={lanes:0,firstContext:t}}else us=us.next=t;return i}var Er=null;function Su(t){Er===null?Er=[t]:Er.push(t)}function nh(t,i,o,l){var c=i.interleaved;return c===null?(o.next=o,Su(i)):(o.next=c.next,c.next=o),i.interleaved=o,Ei(t,l)}function Ei(t,i){t.lanes|=i;var o=t.alternate;for(o!==null&&(o.lanes|=i),o=t,t=t.return;t!==null;)t.childLanes|=i,o=t.alternate,o!==null&&(o.childLanes|=i),o=t,t=t.return;return o.tag===3?o.stateNode:null}var Zi=!1;function yu(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function ih(t,i){t=t.updateQueue,i.updateQueue===t&&(i.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function Ti(t,i){return{eventTime:t,lane:i,tag:0,payload:null,callback:null,next:null}}function Qi(t,i,o){var l=t.updateQueue;if(l===null)return null;if(l=l.shared,(gt&2)!==0){var c=l.pending;return c===null?i.next=i:(i.next=c.next,c.next=i),l.pending=i,Ei(t,o)}return c=l.interleaved,c===null?(i.next=i,Su(l)):(i.next=c.next,c.next=i),l.interleaved=i,Ei(t,o)}function _a(t,i,o){if(i=i.updateQueue,i!==null&&(i=i.shared,(o&4194240)!==0)){var l=i.lanes;l&=t.pendingLanes,o|=l,i.lanes=o,Nl(t,o)}}function rh(t,i){var o=t.updateQueue,l=t.alternate;if(l!==null&&(l=l.updateQueue,o===l)){var c=null,h=null;if(o=o.firstBaseUpdate,o!==null){do{var E={eventTime:o.eventTime,lane:o.lane,tag:o.tag,payload:o.payload,callback:o.callback,next:null};h===null?c=h=E:h=h.next=E,o=o.next}while(o!==null);h===null?c=h=i:h=h.next=i}else c=h=i;o={baseState:l.baseState,firstBaseUpdate:c,lastBaseUpdate:h,shared:l.shared,effects:l.effects},t.updateQueue=o;return}t=o.lastBaseUpdate,t===null?o.firstBaseUpdate=i:t.next=i,o.lastBaseUpdate=i}function va(t,i,o,l){var c=t.updateQueue;Zi=!1;var h=c.firstBaseUpdate,E=c.lastBaseUpdate,U=c.shared.pending;if(U!==null){c.shared.pending=null;var O=U,te=O.next;O.next=null,E===null?h=te:E.next=te,E=O;var ge=t.alternate;ge!==null&&(ge=ge.updateQueue,U=ge.lastBaseUpdate,U!==E&&(U===null?ge.firstBaseUpdate=te:U.next=te,ge.lastBaseUpdate=O))}if(h!==null){var ve=c.baseState;E=0,ge=te=O=null,U=h;do{var me=U.lane,Ie=U.eventTime;if((l&me)===me){ge!==null&&(ge=ge.next={eventTime:Ie,lane:0,tag:U.tag,payload:U.payload,callback:U.callback,next:null});e:{var ze=t,He=U;switch(me=i,Ie=o,He.tag){case 1:if(ze=He.payload,typeof ze=="function"){ve=ze.call(Ie,ve,me);break e}ve=ze;break e;case 3:ze.flags=ze.flags&-65537|128;case 0:if(ze=He.payload,me=typeof ze=="function"?ze.call(Ie,ve,me):ze,me==null)break e;ve=oe({},ve,me);break e;case 2:Zi=!0}}U.callback!==null&&U.lane!==0&&(t.flags|=64,me=c.effects,me===null?c.effects=[U]:me.push(U))}else Ie={eventTime:Ie,lane:me,tag:U.tag,payload:U.payload,callback:U.callback,next:null},ge===null?(te=ge=Ie,O=ve):ge=ge.next=Ie,E|=me;if(U=U.next,U===null){if(U=c.shared.pending,U===null)break;me=U,U=me.next,me.next=null,c.lastBaseUpdate=me,c.shared.pending=null}}while(!0);if(ge===null&&(O=ve),c.baseState=O,c.firstBaseUpdate=te,c.lastBaseUpdate=ge,i=c.shared.interleaved,i!==null){c=i;do E|=c.lane,c=c.next;while(c!==i)}else h===null&&(c.shared.lanes=0);Ar|=E,t.lanes=E,t.memoizedState=ve}}function sh(t,i,o){if(t=i.effects,i.effects=null,t!==null)for(i=0;i<t.length;i++){var l=t[i],c=l.callback;if(c!==null){if(l.callback=null,l=o,typeof c!="function")throw Error(n(191,c));c.call(l)}}}var fo={},ui=ji(fo),ho=ji(fo),po=ji(fo);function Tr(t){if(t===fo)throw Error(n(174));return t}function Mu(t,i){switch(Ct(po,i),Ct(ho,t),Ct(ui,fo),t=i.nodeType,t){case 9:case 11:i=(i=i.documentElement)?i.namespaceURI:we(null,"");break;default:t=t===8?i.parentNode:i,i=t.namespaceURI||null,t=t.tagName,i=we(i,t)}Lt(ui),Ct(ui,i)}function fs(){Lt(ui),Lt(ho),Lt(po)}function oh(t){Tr(po.current);var i=Tr(ui.current),o=we(i,t.type);i!==o&&(Ct(ho,t),Ct(ui,o))}function Eu(t){ho.current===t&&(Lt(ui),Lt(ho))}var Nt=ji(0);function xa(t){for(var i=t;i!==null;){if(i.tag===13){var o=i.memoizedState;if(o!==null&&(o=o.dehydrated,o===null||o.data==="$?"||o.data==="$!"))return i}else if(i.tag===19&&i.memoizedProps.revealOrder!==void 0){if((i.flags&128)!==0)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===t)break;for(;i.sibling===null;){if(i.return===null||i.return===t)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var Tu=[];function wu(){for(var t=0;t<Tu.length;t++)Tu[t]._workInProgressVersionPrimary=null;Tu.length=0}var Sa=L.ReactCurrentDispatcher,Au=L.ReactCurrentBatchConfig,wr=0,Ft=null,Wt=null,Kt=null,ya=!1,mo=!1,go=0,g_=0;function un(){throw Error(n(321))}function Ru(t,i){if(i===null)return!1;for(var o=0;o<i.length&&o<t.length;o++)if(!jn(t[o],i[o]))return!1;return!0}function Cu(t,i,o,l,c,h){if(wr=h,Ft=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,Sa.current=t===null||t.memoizedState===null?S_:y_,t=o(l,c),mo){h=0;do{if(mo=!1,go=0,25<=h)throw Error(n(301));h+=1,Kt=Wt=null,i.updateQueue=null,Sa.current=M_,t=o(l,c)}while(mo)}if(Sa.current=Ta,i=Wt!==null&&Wt.next!==null,wr=0,Kt=Wt=Ft=null,ya=!1,i)throw Error(n(300));return t}function Pu(){var t=go!==0;return go=0,t}function ci(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Kt===null?Ft.memoizedState=Kt=t:Kt=Kt.next=t,Kt}function zn(){if(Wt===null){var t=Ft.alternate;t=t!==null?t.memoizedState:null}else t=Wt.next;var i=Kt===null?Ft.memoizedState:Kt.next;if(i!==null)Kt=i,Wt=t;else{if(t===null)throw Error(n(310));Wt=t,t={memoizedState:Wt.memoizedState,baseState:Wt.baseState,baseQueue:Wt.baseQueue,queue:Wt.queue,next:null},Kt===null?Ft.memoizedState=Kt=t:Kt=Kt.next=t}return Kt}function _o(t,i){return typeof i=="function"?i(t):i}function Lu(t){var i=zn(),o=i.queue;if(o===null)throw Error(n(311));o.lastRenderedReducer=t;var l=Wt,c=l.baseQueue,h=o.pending;if(h!==null){if(c!==null){var E=c.next;c.next=h.next,h.next=E}l.baseQueue=c=h,o.pending=null}if(c!==null){h=c.next,l=l.baseState;var U=E=null,O=null,te=h;do{var ge=te.lane;if((wr&ge)===ge)O!==null&&(O=O.next={lane:0,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null}),l=te.hasEagerState?te.eagerState:t(l,te.action);else{var ve={lane:ge,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null};O===null?(U=O=ve,E=l):O=O.next=ve,Ft.lanes|=ge,Ar|=ge}te=te.next}while(te!==null&&te!==h);O===null?E=l:O.next=U,jn(l,i.memoizedState)||(xn=!0),i.memoizedState=l,i.baseState=E,i.baseQueue=O,o.lastRenderedState=l}if(t=o.interleaved,t!==null){c=t;do h=c.lane,Ft.lanes|=h,Ar|=h,c=c.next;while(c!==t)}else c===null&&(o.lanes=0);return[i.memoizedState,o.dispatch]}function bu(t){var i=zn(),o=i.queue;if(o===null)throw Error(n(311));o.lastRenderedReducer=t;var l=o.dispatch,c=o.pending,h=i.memoizedState;if(c!==null){o.pending=null;var E=c=c.next;do h=t(h,E.action),E=E.next;while(E!==c);jn(h,i.memoizedState)||(xn=!0),i.memoizedState=h,i.baseQueue===null&&(i.baseState=h),o.lastRenderedState=h}return[h,l]}function ah(){}function lh(t,i){var o=Ft,l=zn(),c=i(),h=!jn(l.memoizedState,c);if(h&&(l.memoizedState=c,xn=!0),l=l.queue,Du(fh.bind(null,o,l,t),[t]),l.getSnapshot!==i||h||Kt!==null&&Kt.memoizedState.tag&1){if(o.flags|=2048,vo(9,ch.bind(null,o,l,c,i),void 0,null),Zt===null)throw Error(n(349));(wr&30)!==0||uh(o,i,c)}return c}function uh(t,i,o){t.flags|=16384,t={getSnapshot:i,value:o},i=Ft.updateQueue,i===null?(i={lastEffect:null,stores:null},Ft.updateQueue=i,i.stores=[t]):(o=i.stores,o===null?i.stores=[t]:o.push(t))}function ch(t,i,o,l){i.value=o,i.getSnapshot=l,dh(i)&&hh(t)}function fh(t,i,o){return o(function(){dh(i)&&hh(t)})}function dh(t){var i=t.getSnapshot;t=t.value;try{var o=i();return!jn(t,o)}catch{return!0}}function hh(t){var i=Ei(t,1);i!==null&&Jn(i,t,1,-1)}function ph(t){var i=ci();return typeof t=="function"&&(t=t()),i.memoizedState=i.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:_o,lastRenderedState:t},i.queue=t,t=t.dispatch=x_.bind(null,Ft,t),[i.memoizedState,t]}function vo(t,i,o,l){return t={tag:t,create:i,destroy:o,deps:l,next:null},i=Ft.updateQueue,i===null?(i={lastEffect:null,stores:null},Ft.updateQueue=i,i.lastEffect=t.next=t):(o=i.lastEffect,o===null?i.lastEffect=t.next=t:(l=o.next,o.next=t,t.next=l,i.lastEffect=t)),t}function mh(){return zn().memoizedState}function Ma(t,i,o,l){var c=ci();Ft.flags|=t,c.memoizedState=vo(1|i,o,void 0,l===void 0?null:l)}function Ea(t,i,o,l){var c=zn();l=l===void 0?null:l;var h=void 0;if(Wt!==null){var E=Wt.memoizedState;if(h=E.destroy,l!==null&&Ru(l,E.deps)){c.memoizedState=vo(i,o,h,l);return}}Ft.flags|=t,c.memoizedState=vo(1|i,o,h,l)}function gh(t,i){return Ma(8390656,8,t,i)}function Du(t,i){return Ea(2048,8,t,i)}function _h(t,i){return Ea(4,2,t,i)}function vh(t,i){return Ea(4,4,t,i)}function xh(t,i){if(typeof i=="function")return t=t(),i(t),function(){i(null)};if(i!=null)return t=t(),i.current=t,function(){i.current=null}}function Sh(t,i,o){return o=o!=null?o.concat([t]):null,Ea(4,4,xh.bind(null,i,t),o)}function Iu(){}function yh(t,i){var o=zn();i=i===void 0?null:i;var l=o.memoizedState;return l!==null&&i!==null&&Ru(i,l[1])?l[0]:(o.memoizedState=[t,i],t)}function Mh(t,i){var o=zn();i=i===void 0?null:i;var l=o.memoizedState;return l!==null&&i!==null&&Ru(i,l[1])?l[0]:(t=t(),o.memoizedState=[t,i],t)}function Eh(t,i,o){return(wr&21)===0?(t.baseState&&(t.baseState=!1,xn=!0),t.memoizedState=o):(jn(o,i)||(o=jr(),Ft.lanes|=o,Ar|=o,t.baseState=!0),i)}function __(t,i){var o=Et;Et=o!==0&&4>o?o:4,t(!0);var l=Au.transition;Au.transition={};try{t(!1),i()}finally{Et=o,Au.transition=l}}function Th(){return zn().memoizedState}function v_(t,i,o){var l=nr(t);if(o={lane:l,action:o,hasEagerState:!1,eagerState:null,next:null},wh(t))Ah(i,o);else if(o=nh(t,i,o,l),o!==null){var c=mn();Jn(o,t,l,c),Rh(o,i,l)}}function x_(t,i,o){var l=nr(t),c={lane:l,action:o,hasEagerState:!1,eagerState:null,next:null};if(wh(t))Ah(i,c);else{var h=t.alternate;if(t.lanes===0&&(h===null||h.lanes===0)&&(h=i.lastRenderedReducer,h!==null))try{var E=i.lastRenderedState,U=h(E,o);if(c.hasEagerState=!0,c.eagerState=U,jn(U,E)){var O=i.interleaved;O===null?(c.next=c,Su(i)):(c.next=O.next,O.next=c),i.interleaved=c;return}}catch{}finally{}o=nh(t,i,c,l),o!==null&&(c=mn(),Jn(o,t,l,c),Rh(o,i,l))}}function wh(t){var i=t.alternate;return t===Ft||i!==null&&i===Ft}function Ah(t,i){mo=ya=!0;var o=t.pending;o===null?i.next=i:(i.next=o.next,o.next=i),t.pending=i}function Rh(t,i,o){if((o&4194240)!==0){var l=i.lanes;l&=t.pendingLanes,o|=l,i.lanes=o,Nl(t,o)}}var Ta={readContext:kn,useCallback:un,useContext:un,useEffect:un,useImperativeHandle:un,useInsertionEffect:un,useLayoutEffect:un,useMemo:un,useReducer:un,useRef:un,useState:un,useDebugValue:un,useDeferredValue:un,useTransition:un,useMutableSource:un,useSyncExternalStore:un,useId:un,unstable_isNewReconciler:!1},S_={readContext:kn,useCallback:function(t,i){return ci().memoizedState=[t,i===void 0?null:i],t},useContext:kn,useEffect:gh,useImperativeHandle:function(t,i,o){return o=o!=null?o.concat([t]):null,Ma(4194308,4,xh.bind(null,i,t),o)},useLayoutEffect:function(t,i){return Ma(4194308,4,t,i)},useInsertionEffect:function(t,i){return Ma(4,2,t,i)},useMemo:function(t,i){var o=ci();return i=i===void 0?null:i,t=t(),o.memoizedState=[t,i],t},useReducer:function(t,i,o){var l=ci();return i=o!==void 0?o(i):i,l.memoizedState=l.baseState=i,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:i},l.queue=t,t=t.dispatch=v_.bind(null,Ft,t),[l.memoizedState,t]},useRef:function(t){var i=ci();return t={current:t},i.memoizedState=t},useState:ph,useDebugValue:Iu,useDeferredValue:function(t){return ci().memoizedState=t},useTransition:function(){var t=ph(!1),i=t[0];return t=__.bind(null,t[1]),ci().memoizedState=t,[i,t]},useMutableSource:function(){},useSyncExternalStore:function(t,i,o){var l=Ft,c=ci();if(It){if(o===void 0)throw Error(n(407));o=o()}else{if(o=i(),Zt===null)throw Error(n(349));(wr&30)!==0||uh(l,i,o)}c.memoizedState=o;var h={value:o,getSnapshot:i};return c.queue=h,gh(fh.bind(null,l,h,t),[t]),l.flags|=2048,vo(9,ch.bind(null,l,h,o,i),void 0,null),o},useId:function(){var t=ci(),i=Zt.identifierPrefix;if(It){var o=Mi,l=yi;o=(l&~(1<<32-Oe(l)-1)).toString(32)+o,i=":"+i+"R"+o,o=go++,0<o&&(i+="H"+o.toString(32)),i+=":"}else o=g_++,i=":"+i+"r"+o.toString(32)+":";return t.memoizedState=i},unstable_isNewReconciler:!1},y_={readContext:kn,useCallback:yh,useContext:kn,useEffect:Du,useImperativeHandle:Sh,useInsertionEffect:_h,useLayoutEffect:vh,useMemo:Mh,useReducer:Lu,useRef:mh,useState:function(){return Lu(_o)},useDebugValue:Iu,useDeferredValue:function(t){var i=zn();return Eh(i,Wt.memoizedState,t)},useTransition:function(){var t=Lu(_o)[0],i=zn().memoizedState;return[t,i]},useMutableSource:ah,useSyncExternalStore:lh,useId:Th,unstable_isNewReconciler:!1},M_={readContext:kn,useCallback:yh,useContext:kn,useEffect:Du,useImperativeHandle:Sh,useInsertionEffect:_h,useLayoutEffect:vh,useMemo:Mh,useReducer:bu,useRef:mh,useState:function(){return bu(_o)},useDebugValue:Iu,useDeferredValue:function(t){var i=zn();return Wt===null?i.memoizedState=t:Eh(i,Wt.memoizedState,t)},useTransition:function(){var t=bu(_o)[0],i=zn().memoizedState;return[t,i]},useMutableSource:ah,useSyncExternalStore:lh,useId:Th,unstable_isNewReconciler:!1};function Kn(t,i){if(t&&t.defaultProps){i=oe({},i),t=t.defaultProps;for(var o in t)i[o]===void 0&&(i[o]=t[o]);return i}return i}function Uu(t,i,o,l){i=t.memoizedState,o=o(l,i),o=o==null?i:oe({},i,o),t.memoizedState=o,t.lanes===0&&(t.updateQueue.baseState=o)}var wa={isMounted:function(t){return(t=t._reactInternals)?_i(t)===t:!1},enqueueSetState:function(t,i,o){t=t._reactInternals;var l=mn(),c=nr(t),h=Ti(l,c);h.payload=i,o!=null&&(h.callback=o),i=Qi(t,h,c),i!==null&&(Jn(i,t,c,l),_a(i,t,c))},enqueueReplaceState:function(t,i,o){t=t._reactInternals;var l=mn(),c=nr(t),h=Ti(l,c);h.tag=1,h.payload=i,o!=null&&(h.callback=o),i=Qi(t,h,c),i!==null&&(Jn(i,t,c,l),_a(i,t,c))},enqueueForceUpdate:function(t,i){t=t._reactInternals;var o=mn(),l=nr(t),c=Ti(o,l);c.tag=2,i!=null&&(c.callback=i),i=Qi(t,c,l),i!==null&&(Jn(i,t,l,o),_a(i,t,l))}};function Ch(t,i,o,l,c,h,E){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(l,h,E):i.prototype&&i.prototype.isPureReactComponent?!io(o,l)||!io(c,h):!0}function Ph(t,i,o){var l=!1,c=$i,h=i.contextType;return typeof h=="object"&&h!==null?h=kn(h):(c=vn(i)?Sr:ln.current,l=i.contextTypes,h=(l=l!=null)?rs(t,c):$i),i=new i(o,h),t.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=wa,t.stateNode=i,i._reactInternals=t,l&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=c,t.__reactInternalMemoizedMaskedChildContext=h),i}function Lh(t,i,o,l){t=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(o,l),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(o,l),i.state!==t&&wa.enqueueReplaceState(i,i.state,null)}function Nu(t,i,o,l){var c=t.stateNode;c.props=o,c.state=t.memoizedState,c.refs={},yu(t);var h=i.contextType;typeof h=="object"&&h!==null?c.context=kn(h):(h=vn(i)?Sr:ln.current,c.context=rs(t,h)),c.state=t.memoizedState,h=i.getDerivedStateFromProps,typeof h=="function"&&(Uu(t,i,h,o),c.state=t.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof c.getSnapshotBeforeUpdate=="function"||typeof c.UNSAFE_componentWillMount!="function"&&typeof c.componentWillMount!="function"||(i=c.state,typeof c.componentWillMount=="function"&&c.componentWillMount(),typeof c.UNSAFE_componentWillMount=="function"&&c.UNSAFE_componentWillMount(),i!==c.state&&wa.enqueueReplaceState(c,c.state,null),va(t,o,c,l),c.state=t.memoizedState),typeof c.componentDidMount=="function"&&(t.flags|=4194308)}function ds(t,i){try{var o="",l=i;do o+=ue(l),l=l.return;while(l);var c=o}catch(h){c=`
Error generating stack: `+h.message+`
`+h.stack}return{value:t,source:i,stack:c,digest:null}}function Fu(t,i,o){return{value:t,source:null,stack:o??null,digest:i??null}}function Ou(t,i){try{console.error(i.value)}catch(o){setTimeout(function(){throw o})}}var E_=typeof WeakMap=="function"?WeakMap:Map;function bh(t,i,o){o=Ti(-1,o),o.tag=3,o.payload={element:null};var l=i.value;return o.callback=function(){Da||(Da=!0,Qu=l),Ou(t,i)},o}function Dh(t,i,o){o=Ti(-1,o),o.tag=3;var l=t.type.getDerivedStateFromError;if(typeof l=="function"){var c=i.value;o.payload=function(){return l(c)},o.callback=function(){Ou(t,i)}}var h=t.stateNode;return h!==null&&typeof h.componentDidCatch=="function"&&(o.callback=function(){Ou(t,i),typeof l!="function"&&(er===null?er=new Set([this]):er.add(this));var E=i.stack;this.componentDidCatch(i.value,{componentStack:E!==null?E:""})}),o}function Ih(t,i,o){var l=t.pingCache;if(l===null){l=t.pingCache=new E_;var c=new Set;l.set(i,c)}else c=l.get(i),c===void 0&&(c=new Set,l.set(i,c));c.has(o)||(c.add(o),t=O_.bind(null,t,i,o),i.then(t,t))}function Uh(t){do{var i;if((i=t.tag===13)&&(i=t.memoizedState,i=i!==null?i.dehydrated!==null:!0),i)return t;t=t.return}while(t!==null);return null}function Nh(t,i,o,l,c){return(t.mode&1)===0?(t===i?t.flags|=65536:(t.flags|=128,o.flags|=131072,o.flags&=-52805,o.tag===1&&(o.alternate===null?o.tag=17:(i=Ti(-1,1),i.tag=2,Qi(o,i,1))),o.lanes|=1),t):(t.flags|=65536,t.lanes=c,t)}var T_=L.ReactCurrentOwner,xn=!1;function pn(t,i,o,l){i.child=t===null?th(i,null,o,l):ls(i,t.child,o,l)}function Fh(t,i,o,l,c){o=o.render;var h=i.ref;return cs(i,c),l=Cu(t,i,o,l,h,c),o=Pu(),t!==null&&!xn?(i.updateQueue=t.updateQueue,i.flags&=-2053,t.lanes&=~c,wi(t,i,c)):(It&&o&&fu(i),i.flags|=1,pn(t,i,l,c),i.child)}function Oh(t,i,o,l,c){if(t===null){var h=o.type;return typeof h=="function"&&!sc(h)&&h.defaultProps===void 0&&o.compare===null&&o.defaultProps===void 0?(i.tag=15,i.type=h,Bh(t,i,h,l,c)):(t=Ba(o.type,null,l,i,i.mode,c),t.ref=i.ref,t.return=i,i.child=t)}if(h=t.child,(t.lanes&c)===0){var E=h.memoizedProps;if(o=o.compare,o=o!==null?o:io,o(E,l)&&t.ref===i.ref)return wi(t,i,c)}return i.flags|=1,t=rr(h,l),t.ref=i.ref,t.return=i,i.child=t}function Bh(t,i,o,l,c){if(t!==null){var h=t.memoizedProps;if(io(h,l)&&t.ref===i.ref)if(xn=!1,i.pendingProps=l=h,(t.lanes&c)!==0)(t.flags&131072)!==0&&(xn=!0);else return i.lanes=t.lanes,wi(t,i,c)}return Bu(t,i,o,l,c)}function kh(t,i,o){var l=i.pendingProps,c=l.children,h=t!==null?t.memoizedState:null;if(l.mode==="hidden")if((i.mode&1)===0)i.memoizedState={baseLanes:0,cachePool:null,transitions:null},Ct(ps,Dn),Dn|=o;else{if((o&1073741824)===0)return t=h!==null?h.baseLanes|o:o,i.lanes=i.childLanes=1073741824,i.memoizedState={baseLanes:t,cachePool:null,transitions:null},i.updateQueue=null,Ct(ps,Dn),Dn|=t,null;i.memoizedState={baseLanes:0,cachePool:null,transitions:null},l=h!==null?h.baseLanes:o,Ct(ps,Dn),Dn|=l}else h!==null?(l=h.baseLanes|o,i.memoizedState=null):l=o,Ct(ps,Dn),Dn|=l;return pn(t,i,c,o),i.child}function zh(t,i){var o=i.ref;(t===null&&o!==null||t!==null&&t.ref!==o)&&(i.flags|=512,i.flags|=2097152)}function Bu(t,i,o,l,c){var h=vn(o)?Sr:ln.current;return h=rs(i,h),cs(i,c),o=Cu(t,i,o,l,h,c),l=Pu(),t!==null&&!xn?(i.updateQueue=t.updateQueue,i.flags&=-2053,t.lanes&=~c,wi(t,i,c)):(It&&l&&fu(i),i.flags|=1,pn(t,i,o,c),i.child)}function Hh(t,i,o,l,c){if(vn(o)){var h=!0;ua(i)}else h=!1;if(cs(i,c),i.stateNode===null)Ra(t,i),Ph(i,o,l),Nu(i,o,l,c),l=!0;else if(t===null){var E=i.stateNode,U=i.memoizedProps;E.props=U;var O=E.context,te=o.contextType;typeof te=="object"&&te!==null?te=kn(te):(te=vn(o)?Sr:ln.current,te=rs(i,te));var ge=o.getDerivedStateFromProps,ve=typeof ge=="function"||typeof E.getSnapshotBeforeUpdate=="function";ve||typeof E.UNSAFE_componentWillReceiveProps!="function"&&typeof E.componentWillReceiveProps!="function"||(U!==l||O!==te)&&Lh(i,E,l,te),Zi=!1;var me=i.memoizedState;E.state=me,va(i,l,E,c),O=i.memoizedState,U!==l||me!==O||_n.current||Zi?(typeof ge=="function"&&(Uu(i,o,ge,l),O=i.memoizedState),(U=Zi||Ch(i,o,U,l,me,O,te))?(ve||typeof E.UNSAFE_componentWillMount!="function"&&typeof E.componentWillMount!="function"||(typeof E.componentWillMount=="function"&&E.componentWillMount(),typeof E.UNSAFE_componentWillMount=="function"&&E.UNSAFE_componentWillMount()),typeof E.componentDidMount=="function"&&(i.flags|=4194308)):(typeof E.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=l,i.memoizedState=O),E.props=l,E.state=O,E.context=te,l=U):(typeof E.componentDidMount=="function"&&(i.flags|=4194308),l=!1)}else{E=i.stateNode,ih(t,i),U=i.memoizedProps,te=i.type===i.elementType?U:Kn(i.type,U),E.props=te,ve=i.pendingProps,me=E.context,O=o.contextType,typeof O=="object"&&O!==null?O=kn(O):(O=vn(o)?Sr:ln.current,O=rs(i,O));var Ie=o.getDerivedStateFromProps;(ge=typeof Ie=="function"||typeof E.getSnapshotBeforeUpdate=="function")||typeof E.UNSAFE_componentWillReceiveProps!="function"&&typeof E.componentWillReceiveProps!="function"||(U!==ve||me!==O)&&Lh(i,E,l,O),Zi=!1,me=i.memoizedState,E.state=me,va(i,l,E,c);var ze=i.memoizedState;U!==ve||me!==ze||_n.current||Zi?(typeof Ie=="function"&&(Uu(i,o,Ie,l),ze=i.memoizedState),(te=Zi||Ch(i,o,te,l,me,ze,O)||!1)?(ge||typeof E.UNSAFE_componentWillUpdate!="function"&&typeof E.componentWillUpdate!="function"||(typeof E.componentWillUpdate=="function"&&E.componentWillUpdate(l,ze,O),typeof E.UNSAFE_componentWillUpdate=="function"&&E.UNSAFE_componentWillUpdate(l,ze,O)),typeof E.componentDidUpdate=="function"&&(i.flags|=4),typeof E.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof E.componentDidUpdate!="function"||U===t.memoizedProps&&me===t.memoizedState||(i.flags|=4),typeof E.getSnapshotBeforeUpdate!="function"||U===t.memoizedProps&&me===t.memoizedState||(i.flags|=1024),i.memoizedProps=l,i.memoizedState=ze),E.props=l,E.state=ze,E.context=O,l=te):(typeof E.componentDidUpdate!="function"||U===t.memoizedProps&&me===t.memoizedState||(i.flags|=4),typeof E.getSnapshotBeforeUpdate!="function"||U===t.memoizedProps&&me===t.memoizedState||(i.flags|=1024),l=!1)}return ku(t,i,o,l,h,c)}function ku(t,i,o,l,c,h){zh(t,i);var E=(i.flags&128)!==0;if(!l&&!E)return c&&Yd(i,o,!1),wi(t,i,h);l=i.stateNode,T_.current=i;var U=E&&typeof o.getDerivedStateFromError!="function"?null:l.render();return i.flags|=1,t!==null&&E?(i.child=ls(i,t.child,null,h),i.child=ls(i,null,U,h)):pn(t,i,U,h),i.memoizedState=l.state,c&&Yd(i,o,!0),i.child}function Vh(t){var i=t.stateNode;i.pendingContext?Wd(t,i.pendingContext,i.pendingContext!==i.context):i.context&&Wd(t,i.context,!1),Mu(t,i.containerInfo)}function Gh(t,i,o,l,c){return as(),mu(c),i.flags|=256,pn(t,i,o,l),i.child}var zu={dehydrated:null,treeContext:null,retryLane:0};function Hu(t){return{baseLanes:t,cachePool:null,transitions:null}}function Wh(t,i,o){var l=i.pendingProps,c=Nt.current,h=!1,E=(i.flags&128)!==0,U;if((U=E)||(U=t!==null&&t.memoizedState===null?!1:(c&2)!==0),U?(h=!0,i.flags&=-129):(t===null||t.memoizedState!==null)&&(c|=1),Ct(Nt,c&1),t===null)return pu(i),t=i.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?((i.mode&1)===0?i.lanes=1:t.data==="$!"?i.lanes=8:i.lanes=1073741824,null):(E=l.children,t=l.fallback,h?(l=i.mode,h=i.child,E={mode:"hidden",children:E},(l&1)===0&&h!==null?(h.childLanes=0,h.pendingProps=E):h=ka(E,l,0,null),t=Lr(t,l,o,null),h.return=i,t.return=i,h.sibling=t,i.child=h,i.child.memoizedState=Hu(o),i.memoizedState=zu,t):Vu(i,E));if(c=t.memoizedState,c!==null&&(U=c.dehydrated,U!==null))return w_(t,i,E,l,U,c,o);if(h){h=l.fallback,E=i.mode,c=t.child,U=c.sibling;var O={mode:"hidden",children:l.children};return(E&1)===0&&i.child!==c?(l=i.child,l.childLanes=0,l.pendingProps=O,i.deletions=null):(l=rr(c,O),l.subtreeFlags=c.subtreeFlags&14680064),U!==null?h=rr(U,h):(h=Lr(h,E,o,null),h.flags|=2),h.return=i,l.return=i,l.sibling=h,i.child=l,l=h,h=i.child,E=t.child.memoizedState,E=E===null?Hu(o):{baseLanes:E.baseLanes|o,cachePool:null,transitions:E.transitions},h.memoizedState=E,h.childLanes=t.childLanes&~o,i.memoizedState=zu,l}return h=t.child,t=h.sibling,l=rr(h,{mode:"visible",children:l.children}),(i.mode&1)===0&&(l.lanes=o),l.return=i,l.sibling=null,t!==null&&(o=i.deletions,o===null?(i.deletions=[t],i.flags|=16):o.push(t)),i.child=l,i.memoizedState=null,l}function Vu(t,i){return i=ka({mode:"visible",children:i},t.mode,0,null),i.return=t,t.child=i}function Aa(t,i,o,l){return l!==null&&mu(l),ls(i,t.child,null,o),t=Vu(i,i.pendingProps.children),t.flags|=2,i.memoizedState=null,t}function w_(t,i,o,l,c,h,E){if(o)return i.flags&256?(i.flags&=-257,l=Fu(Error(n(422))),Aa(t,i,E,l)):i.memoizedState!==null?(i.child=t.child,i.flags|=128,null):(h=l.fallback,c=i.mode,l=ka({mode:"visible",children:l.children},c,0,null),h=Lr(h,c,E,null),h.flags|=2,l.return=i,h.return=i,l.sibling=h,i.child=l,(i.mode&1)!==0&&ls(i,t.child,null,E),i.child.memoizedState=Hu(E),i.memoizedState=zu,h);if((i.mode&1)===0)return Aa(t,i,E,null);if(c.data==="$!"){if(l=c.nextSibling&&c.nextSibling.dataset,l)var U=l.dgst;return l=U,h=Error(n(419)),l=Fu(h,l,void 0),Aa(t,i,E,l)}if(U=(E&t.childLanes)!==0,xn||U){if(l=Zt,l!==null){switch(E&-E){case 4:c=2;break;case 16:c=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:c=32;break;case 536870912:c=268435456;break;default:c=0}c=(c&(l.suspendedLanes|E))!==0?0:c,c!==0&&c!==h.retryLane&&(h.retryLane=c,Ei(t,c),Jn(l,t,c,-1))}return rc(),l=Fu(Error(n(421))),Aa(t,i,E,l)}return c.data==="$?"?(i.flags|=128,i.child=t.child,i=B_.bind(null,t),c._reactRetry=i,null):(t=h.treeContext,bn=qi(c.nextSibling),Ln=i,It=!0,$n=null,t!==null&&(On[Bn++]=yi,On[Bn++]=Mi,On[Bn++]=yr,yi=t.id,Mi=t.overflow,yr=i),i=Vu(i,l.children),i.flags|=4096,i)}function Xh(t,i,o){t.lanes|=i;var l=t.alternate;l!==null&&(l.lanes|=i),xu(t.return,i,o)}function Gu(t,i,o,l,c){var h=t.memoizedState;h===null?t.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:l,tail:o,tailMode:c}:(h.isBackwards=i,h.rendering=null,h.renderingStartTime=0,h.last=l,h.tail=o,h.tailMode=c)}function Yh(t,i,o){var l=i.pendingProps,c=l.revealOrder,h=l.tail;if(pn(t,i,l.children,o),l=Nt.current,(l&2)!==0)l=l&1|2,i.flags|=128;else{if(t!==null&&(t.flags&128)!==0)e:for(t=i.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Xh(t,o,i);else if(t.tag===19)Xh(t,o,i);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===i)break e;for(;t.sibling===null;){if(t.return===null||t.return===i)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}l&=1}if(Ct(Nt,l),(i.mode&1)===0)i.memoizedState=null;else switch(c){case"forwards":for(o=i.child,c=null;o!==null;)t=o.alternate,t!==null&&xa(t)===null&&(c=o),o=o.sibling;o=c,o===null?(c=i.child,i.child=null):(c=o.sibling,o.sibling=null),Gu(i,!1,c,o,h);break;case"backwards":for(o=null,c=i.child,i.child=null;c!==null;){if(t=c.alternate,t!==null&&xa(t)===null){i.child=c;break}t=c.sibling,c.sibling=o,o=c,c=t}Gu(i,!0,o,null,h);break;case"together":Gu(i,!1,null,null,void 0);break;default:i.memoizedState=null}return i.child}function Ra(t,i){(i.mode&1)===0&&t!==null&&(t.alternate=null,i.alternate=null,i.flags|=2)}function wi(t,i,o){if(t!==null&&(i.dependencies=t.dependencies),Ar|=i.lanes,(o&i.childLanes)===0)return null;if(t!==null&&i.child!==t.child)throw Error(n(153));if(i.child!==null){for(t=i.child,o=rr(t,t.pendingProps),i.child=o,o.return=i;t.sibling!==null;)t=t.sibling,o=o.sibling=rr(t,t.pendingProps),o.return=i;o.sibling=null}return i.child}function A_(t,i,o){switch(i.tag){case 3:Vh(i),as();break;case 5:oh(i);break;case 1:vn(i.type)&&ua(i);break;case 4:Mu(i,i.stateNode.containerInfo);break;case 10:var l=i.type._context,c=i.memoizedProps.value;Ct(ma,l._currentValue),l._currentValue=c;break;case 13:if(l=i.memoizedState,l!==null)return l.dehydrated!==null?(Ct(Nt,Nt.current&1),i.flags|=128,null):(o&i.child.childLanes)!==0?Wh(t,i,o):(Ct(Nt,Nt.current&1),t=wi(t,i,o),t!==null?t.sibling:null);Ct(Nt,Nt.current&1);break;case 19:if(l=(o&i.childLanes)!==0,(t.flags&128)!==0){if(l)return Yh(t,i,o);i.flags|=128}if(c=i.memoizedState,c!==null&&(c.rendering=null,c.tail=null,c.lastEffect=null),Ct(Nt,Nt.current),l)break;return null;case 22:case 23:return i.lanes=0,kh(t,i,o)}return wi(t,i,o)}var qh,Wu,jh,$h;qh=function(t,i){for(var o=i.child;o!==null;){if(o.tag===5||o.tag===6)t.appendChild(o.stateNode);else if(o.tag!==4&&o.child!==null){o.child.return=o,o=o.child;continue}if(o===i)break;for(;o.sibling===null;){if(o.return===null||o.return===i)return;o=o.return}o.sibling.return=o.return,o=o.sibling}},Wu=function(){},jh=function(t,i,o,l){var c=t.memoizedProps;if(c!==l){t=i.stateNode,Tr(ui.current);var h=null;switch(o){case"input":c=en(t,c),l=en(t,l),h=[];break;case"select":c=oe({},c,{value:void 0}),l=oe({},l,{value:void 0}),h=[];break;case"textarea":c=K(t,c),l=K(t,l),h=[];break;default:typeof c.onClick!="function"&&typeof l.onClick=="function"&&(t.onclick=oa)}nt(o,l);var E;o=null;for(te in c)if(!l.hasOwnProperty(te)&&c.hasOwnProperty(te)&&c[te]!=null)if(te==="style"){var U=c[te];for(E in U)U.hasOwnProperty(E)&&(o||(o={}),o[E]="")}else te!=="dangerouslySetInnerHTML"&&te!=="children"&&te!=="suppressContentEditableWarning"&&te!=="suppressHydrationWarning"&&te!=="autoFocus"&&(a.hasOwnProperty(te)?h||(h=[]):(h=h||[]).push(te,null));for(te in l){var O=l[te];if(U=c?.[te],l.hasOwnProperty(te)&&O!==U&&(O!=null||U!=null))if(te==="style")if(U){for(E in U)!U.hasOwnProperty(E)||O&&O.hasOwnProperty(E)||(o||(o={}),o[E]="");for(E in O)O.hasOwnProperty(E)&&U[E]!==O[E]&&(o||(o={}),o[E]=O[E])}else o||(h||(h=[]),h.push(te,o)),o=O;else te==="dangerouslySetInnerHTML"?(O=O?O.__html:void 0,U=U?U.__html:void 0,O!=null&&U!==O&&(h=h||[]).push(te,O)):te==="children"?typeof O!="string"&&typeof O!="number"||(h=h||[]).push(te,""+O):te!=="suppressContentEditableWarning"&&te!=="suppressHydrationWarning"&&(a.hasOwnProperty(te)?(O!=null&&te==="onScroll"&&Pt("scroll",t),h||U===O||(h=[])):(h=h||[]).push(te,O))}o&&(h=h||[]).push("style",o);var te=h;(i.updateQueue=te)&&(i.flags|=4)}},$h=function(t,i,o,l){o!==l&&(i.flags|=4)};function xo(t,i){if(!It)switch(t.tailMode){case"hidden":i=t.tail;for(var o=null;i!==null;)i.alternate!==null&&(o=i),i=i.sibling;o===null?t.tail=null:o.sibling=null;break;case"collapsed":o=t.tail;for(var l=null;o!==null;)o.alternate!==null&&(l=o),o=o.sibling;l===null?i||t.tail===null?t.tail=null:t.tail.sibling=null:l.sibling=null}}function cn(t){var i=t.alternate!==null&&t.alternate.child===t.child,o=0,l=0;if(i)for(var c=t.child;c!==null;)o|=c.lanes|c.childLanes,l|=c.subtreeFlags&14680064,l|=c.flags&14680064,c.return=t,c=c.sibling;else for(c=t.child;c!==null;)o|=c.lanes|c.childLanes,l|=c.subtreeFlags,l|=c.flags,c.return=t,c=c.sibling;return t.subtreeFlags|=l,t.childLanes=o,i}function R_(t,i,o){var l=i.pendingProps;switch(du(i),i.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return cn(i),null;case 1:return vn(i.type)&&la(),cn(i),null;case 3:return l=i.stateNode,fs(),Lt(_n),Lt(ln),wu(),l.pendingContext&&(l.context=l.pendingContext,l.pendingContext=null),(t===null||t.child===null)&&(ha(i)?i.flags|=4:t===null||t.memoizedState.isDehydrated&&(i.flags&256)===0||(i.flags|=1024,$n!==null&&(tc($n),$n=null))),Wu(t,i),cn(i),null;case 5:Eu(i);var c=Tr(po.current);if(o=i.type,t!==null&&i.stateNode!=null)jh(t,i,o,l,c),t.ref!==i.ref&&(i.flags|=512,i.flags|=2097152);else{if(!l){if(i.stateNode===null)throw Error(n(166));return cn(i),null}if(t=Tr(ui.current),ha(i)){l=i.stateNode,o=i.type;var h=i.memoizedProps;switch(l[li]=i,l[lo]=h,t=(i.mode&1)!==0,o){case"dialog":Pt("cancel",l),Pt("close",l);break;case"iframe":case"object":case"embed":Pt("load",l);break;case"video":case"audio":for(c=0;c<so.length;c++)Pt(so[c],l);break;case"source":Pt("error",l);break;case"img":case"image":case"link":Pt("error",l),Pt("load",l);break;case"details":Pt("toggle",l);break;case"input":ot(l,h),Pt("invalid",l);break;case"select":l._wrapperState={wasMultiple:!!h.multiple},Pt("invalid",l);break;case"textarea":he(l,h),Pt("invalid",l)}nt(o,h),c=null;for(var E in h)if(h.hasOwnProperty(E)){var U=h[E];E==="children"?typeof U=="string"?l.textContent!==U&&(h.suppressHydrationWarning!==!0&&sa(l.textContent,U,t),c=["children",U]):typeof U=="number"&&l.textContent!==""+U&&(h.suppressHydrationWarning!==!0&&sa(l.textContent,U,t),c=["children",""+U]):a.hasOwnProperty(E)&&U!=null&&E==="onScroll"&&Pt("scroll",l)}switch(o){case"input":mt(l),Tt(l,h,!0);break;case"textarea":mt(l),fe(l);break;case"select":case"option":break;default:typeof h.onClick=="function"&&(l.onclick=oa)}l=c,i.updateQueue=l,l!==null&&(i.flags|=4)}else{E=c.nodeType===9?c:c.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=Xe(o)),t==="http://www.w3.org/1999/xhtml"?o==="script"?(t=E.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof l.is=="string"?t=E.createElement(o,{is:l.is}):(t=E.createElement(o),o==="select"&&(E=t,l.multiple?E.multiple=!0:l.size&&(E.size=l.size))):t=E.createElementNS(t,o),t[li]=i,t[lo]=l,qh(t,i,!1,!1),i.stateNode=t;e:{switch(E=yt(o,l),o){case"dialog":Pt("cancel",t),Pt("close",t),c=l;break;case"iframe":case"object":case"embed":Pt("load",t),c=l;break;case"video":case"audio":for(c=0;c<so.length;c++)Pt(so[c],t);c=l;break;case"source":Pt("error",t),c=l;break;case"img":case"image":case"link":Pt("error",t),Pt("load",t),c=l;break;case"details":Pt("toggle",t),c=l;break;case"input":ot(t,l),c=en(t,l),Pt("invalid",t);break;case"option":c=l;break;case"select":t._wrapperState={wasMultiple:!!l.multiple},c=oe({},l,{value:void 0}),Pt("invalid",t);break;case"textarea":he(t,l),c=K(t,l),Pt("invalid",t);break;default:c=l}nt(o,c),U=c;for(h in U)if(U.hasOwnProperty(h)){var O=U[h];h==="style"?Be(t,O):h==="dangerouslySetInnerHTML"?(O=O?O.__html:void 0,O!=null&&dt(t,O)):h==="children"?typeof O=="string"?(o!=="textarea"||O!=="")&&ye(t,O):typeof O=="number"&&ye(t,""+O):h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&h!=="autoFocus"&&(a.hasOwnProperty(h)?O!=null&&h==="onScroll"&&Pt("scroll",t):O!=null&&P(t,h,O,E))}switch(o){case"input":mt(t),Tt(t,l,!1);break;case"textarea":mt(t),fe(t);break;case"option":l.value!=null&&t.setAttribute("value",""+Ce(l.value));break;case"select":t.multiple=!!l.multiple,h=l.value,h!=null?T(t,!!l.multiple,h,!1):l.defaultValue!=null&&T(t,!!l.multiple,l.defaultValue,!0);break;default:typeof c.onClick=="function"&&(t.onclick=oa)}switch(o){case"button":case"input":case"select":case"textarea":l=!!l.autoFocus;break e;case"img":l=!0;break e;default:l=!1}}l&&(i.flags|=4)}i.ref!==null&&(i.flags|=512,i.flags|=2097152)}return cn(i),null;case 6:if(t&&i.stateNode!=null)$h(t,i,t.memoizedProps,l);else{if(typeof l!="string"&&i.stateNode===null)throw Error(n(166));if(o=Tr(po.current),Tr(ui.current),ha(i)){if(l=i.stateNode,o=i.memoizedProps,l[li]=i,(h=l.nodeValue!==o)&&(t=Ln,t!==null))switch(t.tag){case 3:sa(l.nodeValue,o,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&sa(l.nodeValue,o,(t.mode&1)!==0)}h&&(i.flags|=4)}else l=(o.nodeType===9?o:o.ownerDocument).createTextNode(l),l[li]=i,i.stateNode=l}return cn(i),null;case 13:if(Lt(Nt),l=i.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(It&&bn!==null&&(i.mode&1)!==0&&(i.flags&128)===0)Qd(),as(),i.flags|=98560,h=!1;else if(h=ha(i),l!==null&&l.dehydrated!==null){if(t===null){if(!h)throw Error(n(318));if(h=i.memoizedState,h=h!==null?h.dehydrated:null,!h)throw Error(n(317));h[li]=i}else as(),(i.flags&128)===0&&(i.memoizedState=null),i.flags|=4;cn(i),h=!1}else $n!==null&&(tc($n),$n=null),h=!0;if(!h)return i.flags&65536?i:null}return(i.flags&128)!==0?(i.lanes=o,i):(l=l!==null,l!==(t!==null&&t.memoizedState!==null)&&l&&(i.child.flags|=8192,(i.mode&1)!==0&&(t===null||(Nt.current&1)!==0?Xt===0&&(Xt=3):rc())),i.updateQueue!==null&&(i.flags|=4),cn(i),null);case 4:return fs(),Wu(t,i),t===null&&oo(i.stateNode.containerInfo),cn(i),null;case 10:return vu(i.type._context),cn(i),null;case 17:return vn(i.type)&&la(),cn(i),null;case 19:if(Lt(Nt),h=i.memoizedState,h===null)return cn(i),null;if(l=(i.flags&128)!==0,E=h.rendering,E===null)if(l)xo(h,!1);else{if(Xt!==0||t!==null&&(t.flags&128)!==0)for(t=i.child;t!==null;){if(E=xa(t),E!==null){for(i.flags|=128,xo(h,!1),l=E.updateQueue,l!==null&&(i.updateQueue=l,i.flags|=4),i.subtreeFlags=0,l=o,o=i.child;o!==null;)h=o,t=l,h.flags&=14680066,E=h.alternate,E===null?(h.childLanes=0,h.lanes=t,h.child=null,h.subtreeFlags=0,h.memoizedProps=null,h.memoizedState=null,h.updateQueue=null,h.dependencies=null,h.stateNode=null):(h.childLanes=E.childLanes,h.lanes=E.lanes,h.child=E.child,h.subtreeFlags=0,h.deletions=null,h.memoizedProps=E.memoizedProps,h.memoizedState=E.memoizedState,h.updateQueue=E.updateQueue,h.type=E.type,t=E.dependencies,h.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),o=o.sibling;return Ct(Nt,Nt.current&1|2),i.child}t=t.sibling}h.tail!==null&&Te()>ms&&(i.flags|=128,l=!0,xo(h,!1),i.lanes=4194304)}else{if(!l)if(t=xa(E),t!==null){if(i.flags|=128,l=!0,o=t.updateQueue,o!==null&&(i.updateQueue=o,i.flags|=4),xo(h,!0),h.tail===null&&h.tailMode==="hidden"&&!E.alternate&&!It)return cn(i),null}else 2*Te()-h.renderingStartTime>ms&&o!==1073741824&&(i.flags|=128,l=!0,xo(h,!1),i.lanes=4194304);h.isBackwards?(E.sibling=i.child,i.child=E):(o=h.last,o!==null?o.sibling=E:i.child=E,h.last=E)}return h.tail!==null?(i=h.tail,h.rendering=i,h.tail=i.sibling,h.renderingStartTime=Te(),i.sibling=null,o=Nt.current,Ct(Nt,l?o&1|2:o&1),i):(cn(i),null);case 22:case 23:return ic(),l=i.memoizedState!==null,t!==null&&t.memoizedState!==null!==l&&(i.flags|=8192),l&&(i.mode&1)!==0?(Dn&1073741824)!==0&&(cn(i),i.subtreeFlags&6&&(i.flags|=8192)):cn(i),null;case 24:return null;case 25:return null}throw Error(n(156,i.tag))}function C_(t,i){switch(du(i),i.tag){case 1:return vn(i.type)&&la(),t=i.flags,t&65536?(i.flags=t&-65537|128,i):null;case 3:return fs(),Lt(_n),Lt(ln),wu(),t=i.flags,(t&65536)!==0&&(t&128)===0?(i.flags=t&-65537|128,i):null;case 5:return Eu(i),null;case 13:if(Lt(Nt),t=i.memoizedState,t!==null&&t.dehydrated!==null){if(i.alternate===null)throw Error(n(340));as()}return t=i.flags,t&65536?(i.flags=t&-65537|128,i):null;case 19:return Lt(Nt),null;case 4:return fs(),null;case 10:return vu(i.type._context),null;case 22:case 23:return ic(),null;case 24:return null;default:return null}}var Ca=!1,fn=!1,P_=typeof WeakSet=="function"?WeakSet:Set,ke=null;function hs(t,i){var o=t.ref;if(o!==null)if(typeof o=="function")try{o(null)}catch(l){Bt(t,i,l)}else o.current=null}function Xu(t,i,o){try{o()}catch(l){Bt(t,i,l)}}var Kh=!1;function L_(t,i){if(iu=jo,t=Cd(),$l(t)){if("selectionStart"in t)var o={start:t.selectionStart,end:t.selectionEnd};else e:{o=(o=t.ownerDocument)&&o.defaultView||window;var l=o.getSelection&&o.getSelection();if(l&&l.rangeCount!==0){o=l.anchorNode;var c=l.anchorOffset,h=l.focusNode;l=l.focusOffset;try{o.nodeType,h.nodeType}catch{o=null;break e}var E=0,U=-1,O=-1,te=0,ge=0,ve=t,me=null;t:for(;;){for(var Ie;ve!==o||c!==0&&ve.nodeType!==3||(U=E+c),ve!==h||l!==0&&ve.nodeType!==3||(O=E+l),ve.nodeType===3&&(E+=ve.nodeValue.length),(Ie=ve.firstChild)!==null;)me=ve,ve=Ie;for(;;){if(ve===t)break t;if(me===o&&++te===c&&(U=E),me===h&&++ge===l&&(O=E),(Ie=ve.nextSibling)!==null)break;ve=me,me=ve.parentNode}ve=Ie}o=U===-1||O===-1?null:{start:U,end:O}}else o=null}o=o||{start:0,end:0}}else o=null;for(ru={focusedElem:t,selectionRange:o},jo=!1,ke=i;ke!==null;)if(i=ke,t=i.child,(i.subtreeFlags&1028)!==0&&t!==null)t.return=i,ke=t;else for(;ke!==null;){i=ke;try{var ze=i.alternate;if((i.flags&1024)!==0)switch(i.tag){case 0:case 11:case 15:break;case 1:if(ze!==null){var He=ze.memoizedProps,zt=ze.memoizedState,Y=i.stateNode,z=Y.getSnapshotBeforeUpdate(i.elementType===i.type?He:Kn(i.type,He),zt);Y.__reactInternalSnapshotBeforeUpdate=z}break;case 3:var $=i.stateNode.containerInfo;$.nodeType===1?$.textContent="":$.nodeType===9&&$.documentElement&&$.removeChild($.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(n(163))}}catch(Me){Bt(i,i.return,Me)}if(t=i.sibling,t!==null){t.return=i.return,ke=t;break}ke=i.return}return ze=Kh,Kh=!1,ze}function So(t,i,o){var l=i.updateQueue;if(l=l!==null?l.lastEffect:null,l!==null){var c=l=l.next;do{if((c.tag&t)===t){var h=c.destroy;c.destroy=void 0,h!==void 0&&Xu(i,o,h)}c=c.next}while(c!==l)}}function Pa(t,i){if(i=i.updateQueue,i=i!==null?i.lastEffect:null,i!==null){var o=i=i.next;do{if((o.tag&t)===t){var l=o.create;o.destroy=l()}o=o.next}while(o!==i)}}function Yu(t){var i=t.ref;if(i!==null){var o=t.stateNode;switch(t.tag){case 5:t=o;break;default:t=o}typeof i=="function"?i(t):i.current=t}}function Zh(t){var i=t.alternate;i!==null&&(t.alternate=null,Zh(i)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(i=t.stateNode,i!==null&&(delete i[li],delete i[lo],delete i[lu],delete i[d_],delete i[h_])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function Qh(t){return t.tag===5||t.tag===3||t.tag===4}function Jh(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Qh(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function qu(t,i,o){var l=t.tag;if(l===5||l===6)t=t.stateNode,i?o.nodeType===8?o.parentNode.insertBefore(t,i):o.insertBefore(t,i):(o.nodeType===8?(i=o.parentNode,i.insertBefore(t,o)):(i=o,i.appendChild(t)),o=o._reactRootContainer,o!=null||i.onclick!==null||(i.onclick=oa));else if(l!==4&&(t=t.child,t!==null))for(qu(t,i,o),t=t.sibling;t!==null;)qu(t,i,o),t=t.sibling}function ju(t,i,o){var l=t.tag;if(l===5||l===6)t=t.stateNode,i?o.insertBefore(t,i):o.appendChild(t);else if(l!==4&&(t=t.child,t!==null))for(ju(t,i,o),t=t.sibling;t!==null;)ju(t,i,o),t=t.sibling}var nn=null,Zn=!1;function Ji(t,i,o){for(o=o.child;o!==null;)ep(t,i,o),o=o.sibling}function ep(t,i,o){if(Dt&&typeof Dt.onCommitFiberUnmount=="function")try{Dt.onCommitFiberUnmount(At,o)}catch{}switch(o.tag){case 5:fn||hs(o,i);case 6:var l=nn,c=Zn;nn=null,Ji(t,i,o),nn=l,Zn=c,nn!==null&&(Zn?(t=nn,o=o.stateNode,t.nodeType===8?t.parentNode.removeChild(o):t.removeChild(o)):nn.removeChild(o.stateNode));break;case 18:nn!==null&&(Zn?(t=nn,o=o.stateNode,t.nodeType===8?au(t.parentNode,o):t.nodeType===1&&au(t,o),Zs(t)):au(nn,o.stateNode));break;case 4:l=nn,c=Zn,nn=o.stateNode.containerInfo,Zn=!0,Ji(t,i,o),nn=l,Zn=c;break;case 0:case 11:case 14:case 15:if(!fn&&(l=o.updateQueue,l!==null&&(l=l.lastEffect,l!==null))){c=l=l.next;do{var h=c,E=h.destroy;h=h.tag,E!==void 0&&((h&2)!==0||(h&4)!==0)&&Xu(o,i,E),c=c.next}while(c!==l)}Ji(t,i,o);break;case 1:if(!fn&&(hs(o,i),l=o.stateNode,typeof l.componentWillUnmount=="function"))try{l.props=o.memoizedProps,l.state=o.memoizedState,l.componentWillUnmount()}catch(U){Bt(o,i,U)}Ji(t,i,o);break;case 21:Ji(t,i,o);break;case 22:o.mode&1?(fn=(l=fn)||o.memoizedState!==null,Ji(t,i,o),fn=l):Ji(t,i,o);break;default:Ji(t,i,o)}}function tp(t){var i=t.updateQueue;if(i!==null){t.updateQueue=null;var o=t.stateNode;o===null&&(o=t.stateNode=new P_),i.forEach(function(l){var c=k_.bind(null,t,l);o.has(l)||(o.add(l),l.then(c,c))})}}function Qn(t,i){var o=i.deletions;if(o!==null)for(var l=0;l<o.length;l++){var c=o[l];try{var h=t,E=i,U=E;e:for(;U!==null;){switch(U.tag){case 5:nn=U.stateNode,Zn=!1;break e;case 3:nn=U.stateNode.containerInfo,Zn=!0;break e;case 4:nn=U.stateNode.containerInfo,Zn=!0;break e}U=U.return}if(nn===null)throw Error(n(160));ep(h,E,c),nn=null,Zn=!1;var O=c.alternate;O!==null&&(O.return=null),c.return=null}catch(te){Bt(c,i,te)}}if(i.subtreeFlags&12854)for(i=i.child;i!==null;)np(i,t),i=i.sibling}function np(t,i){var o=t.alternate,l=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Qn(i,t),fi(t),l&4){try{So(3,t,t.return),Pa(3,t)}catch(He){Bt(t,t.return,He)}try{So(5,t,t.return)}catch(He){Bt(t,t.return,He)}}break;case 1:Qn(i,t),fi(t),l&512&&o!==null&&hs(o,o.return);break;case 5:if(Qn(i,t),fi(t),l&512&&o!==null&&hs(o,o.return),t.flags&32){var c=t.stateNode;try{ye(c,"")}catch(He){Bt(t,t.return,He)}}if(l&4&&(c=t.stateNode,c!=null)){var h=t.memoizedProps,E=o!==null?o.memoizedProps:h,U=t.type,O=t.updateQueue;if(t.updateQueue=null,O!==null)try{U==="input"&&h.type==="radio"&&h.name!=null&&ft(c,h),yt(U,E);var te=yt(U,h);for(E=0;E<O.length;E+=2){var ge=O[E],ve=O[E+1];ge==="style"?Be(c,ve):ge==="dangerouslySetInnerHTML"?dt(c,ve):ge==="children"?ye(c,ve):P(c,ge,ve,te)}switch(U){case"input":$e(c,h);break;case"textarea":_e(c,h);break;case"select":var me=c._wrapperState.wasMultiple;c._wrapperState.wasMultiple=!!h.multiple;var Ie=h.value;Ie!=null?T(c,!!h.multiple,Ie,!1):me!==!!h.multiple&&(h.defaultValue!=null?T(c,!!h.multiple,h.defaultValue,!0):T(c,!!h.multiple,h.multiple?[]:"",!1))}c[lo]=h}catch(He){Bt(t,t.return,He)}}break;case 6:if(Qn(i,t),fi(t),l&4){if(t.stateNode===null)throw Error(n(162));c=t.stateNode,h=t.memoizedProps;try{c.nodeValue=h}catch(He){Bt(t,t.return,He)}}break;case 3:if(Qn(i,t),fi(t),l&4&&o!==null&&o.memoizedState.isDehydrated)try{Zs(i.containerInfo)}catch(He){Bt(t,t.return,He)}break;case 4:Qn(i,t),fi(t);break;case 13:Qn(i,t),fi(t),c=t.child,c.flags&8192&&(h=c.memoizedState!==null,c.stateNode.isHidden=h,!h||c.alternate!==null&&c.alternate.memoizedState!==null||(Zu=Te())),l&4&&tp(t);break;case 22:if(ge=o!==null&&o.memoizedState!==null,t.mode&1?(fn=(te=fn)||ge,Qn(i,t),fn=te):Qn(i,t),fi(t),l&8192){if(te=t.memoizedState!==null,(t.stateNode.isHidden=te)&&!ge&&(t.mode&1)!==0)for(ke=t,ge=t.child;ge!==null;){for(ve=ke=ge;ke!==null;){switch(me=ke,Ie=me.child,me.tag){case 0:case 11:case 14:case 15:So(4,me,me.return);break;case 1:hs(me,me.return);var ze=me.stateNode;if(typeof ze.componentWillUnmount=="function"){l=me,o=me.return;try{i=l,ze.props=i.memoizedProps,ze.state=i.memoizedState,ze.componentWillUnmount()}catch(He){Bt(l,o,He)}}break;case 5:hs(me,me.return);break;case 22:if(me.memoizedState!==null){sp(ve);continue}}Ie!==null?(Ie.return=me,ke=Ie):sp(ve)}ge=ge.sibling}e:for(ge=null,ve=t;;){if(ve.tag===5){if(ge===null){ge=ve;try{c=ve.stateNode,te?(h=c.style,typeof h.setProperty=="function"?h.setProperty("display","none","important"):h.display="none"):(U=ve.stateNode,O=ve.memoizedProps.style,E=O!=null&&O.hasOwnProperty("display")?O.display:null,U.style.display=Qe("display",E))}catch(He){Bt(t,t.return,He)}}}else if(ve.tag===6){if(ge===null)try{ve.stateNode.nodeValue=te?"":ve.memoizedProps}catch(He){Bt(t,t.return,He)}}else if((ve.tag!==22&&ve.tag!==23||ve.memoizedState===null||ve===t)&&ve.child!==null){ve.child.return=ve,ve=ve.child;continue}if(ve===t)break e;for(;ve.sibling===null;){if(ve.return===null||ve.return===t)break e;ge===ve&&(ge=null),ve=ve.return}ge===ve&&(ge=null),ve.sibling.return=ve.return,ve=ve.sibling}}break;case 19:Qn(i,t),fi(t),l&4&&tp(t);break;case 21:break;default:Qn(i,t),fi(t)}}function fi(t){var i=t.flags;if(i&2){try{e:{for(var o=t.return;o!==null;){if(Qh(o)){var l=o;break e}o=o.return}throw Error(n(160))}switch(l.tag){case 5:var c=l.stateNode;l.flags&32&&(ye(c,""),l.flags&=-33);var h=Jh(t);ju(t,h,c);break;case 3:case 4:var E=l.stateNode.containerInfo,U=Jh(t);qu(t,U,E);break;default:throw Error(n(161))}}catch(O){Bt(t,t.return,O)}t.flags&=-3}i&4096&&(t.flags&=-4097)}function b_(t,i,o){ke=t,ip(t)}function ip(t,i,o){for(var l=(t.mode&1)!==0;ke!==null;){var c=ke,h=c.child;if(c.tag===22&&l){var E=c.memoizedState!==null||Ca;if(!E){var U=c.alternate,O=U!==null&&U.memoizedState!==null||fn;U=Ca;var te=fn;if(Ca=E,(fn=O)&&!te)for(ke=c;ke!==null;)E=ke,O=E.child,E.tag===22&&E.memoizedState!==null?op(c):O!==null?(O.return=E,ke=O):op(c);for(;h!==null;)ke=h,ip(h),h=h.sibling;ke=c,Ca=U,fn=te}rp(t)}else(c.subtreeFlags&8772)!==0&&h!==null?(h.return=c,ke=h):rp(t)}}function rp(t){for(;ke!==null;){var i=ke;if((i.flags&8772)!==0){var o=i.alternate;try{if((i.flags&8772)!==0)switch(i.tag){case 0:case 11:case 15:fn||Pa(5,i);break;case 1:var l=i.stateNode;if(i.flags&4&&!fn)if(o===null)l.componentDidMount();else{var c=i.elementType===i.type?o.memoizedProps:Kn(i.type,o.memoizedProps);l.componentDidUpdate(c,o.memoizedState,l.__reactInternalSnapshotBeforeUpdate)}var h=i.updateQueue;h!==null&&sh(i,h,l);break;case 3:var E=i.updateQueue;if(E!==null){if(o=null,i.child!==null)switch(i.child.tag){case 5:o=i.child.stateNode;break;case 1:o=i.child.stateNode}sh(i,E,o)}break;case 5:var U=i.stateNode;if(o===null&&i.flags&4){o=U;var O=i.memoizedProps;switch(i.type){case"button":case"input":case"select":case"textarea":O.autoFocus&&o.focus();break;case"img":O.src&&(o.src=O.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(i.memoizedState===null){var te=i.alternate;if(te!==null){var ge=te.memoizedState;if(ge!==null){var ve=ge.dehydrated;ve!==null&&Zs(ve)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(n(163))}fn||i.flags&512&&Yu(i)}catch(me){Bt(i,i.return,me)}}if(i===t){ke=null;break}if(o=i.sibling,o!==null){o.return=i.return,ke=o;break}ke=i.return}}function sp(t){for(;ke!==null;){var i=ke;if(i===t){ke=null;break}var o=i.sibling;if(o!==null){o.return=i.return,ke=o;break}ke=i.return}}function op(t){for(;ke!==null;){var i=ke;try{switch(i.tag){case 0:case 11:case 15:var o=i.return;try{Pa(4,i)}catch(O){Bt(i,o,O)}break;case 1:var l=i.stateNode;if(typeof l.componentDidMount=="function"){var c=i.return;try{l.componentDidMount()}catch(O){Bt(i,c,O)}}var h=i.return;try{Yu(i)}catch(O){Bt(i,h,O)}break;case 5:var E=i.return;try{Yu(i)}catch(O){Bt(i,E,O)}}}catch(O){Bt(i,i.return,O)}if(i===t){ke=null;break}var U=i.sibling;if(U!==null){U.return=i.return,ke=U;break}ke=i.return}}var D_=Math.ceil,La=L.ReactCurrentDispatcher,$u=L.ReactCurrentOwner,Hn=L.ReactCurrentBatchConfig,gt=0,Zt=null,Ht=null,rn=0,Dn=0,ps=ji(0),Xt=0,yo=null,Ar=0,ba=0,Ku=0,Mo=null,Sn=null,Zu=0,ms=1/0,Ai=null,Da=!1,Qu=null,er=null,Ia=!1,tr=null,Ua=0,Eo=0,Ju=null,Na=-1,Fa=0;function mn(){return(gt&6)!==0?Te():Na!==-1?Na:Na=Te()}function nr(t){return(t.mode&1)===0?1:(gt&2)!==0&&rn!==0?rn&-rn:m_.transition!==null?(Fa===0&&(Fa=jr()),Fa):(t=Et,t!==0||(t=window.event,t=t===void 0?16:ld(t.type)),t)}function Jn(t,i,o,l){if(50<Eo)throw Eo=0,Ju=null,Error(n(185));zi(t,o,l),((gt&2)===0||t!==Zt)&&(t===Zt&&((gt&2)===0&&(ba|=o),Xt===4&&ir(t,rn)),yn(t,l),o===1&&gt===0&&(i.mode&1)===0&&(ms=Te()+500,ca&&Ki()))}function yn(t,i){var o=t.callbackNode;Xs(t,i);var l=Rt(t,t===Zt?rn:0);if(l===0)o!==null&&W(o),t.callbackNode=null,t.callbackPriority=0;else if(i=l&-l,t.callbackPriority!==i){if(o!=null&&W(o),i===1)t.tag===0?p_(lp.bind(null,t)):qd(lp.bind(null,t)),c_(function(){(gt&6)===0&&Ki()}),o=null;else{switch(ed(l)){case 1:o=je;break;case 4:o=Ke;break;case 16:o=Ge;break;case 536870912:o=wt;break;default:o=Ge}o=gp(o,ap.bind(null,t))}t.callbackPriority=i,t.callbackNode=o}}function ap(t,i){if(Na=-1,Fa=0,(gt&6)!==0)throw Error(n(327));var o=t.callbackNode;if(gs()&&t.callbackNode!==o)return null;var l=Rt(t,t===Zt?rn:0);if(l===0)return null;if((l&30)!==0||(l&t.expiredLanes)!==0||i)i=Oa(t,l);else{i=l;var c=gt;gt|=2;var h=cp();(Zt!==t||rn!==i)&&(Ai=null,ms=Te()+500,Cr(t,i));do try{N_();break}catch(U){up(t,U)}while(!0);_u(),La.current=h,gt=c,Ht!==null?i=0:(Zt=null,rn=0,i=Xt)}if(i!==0){if(i===2&&(c=an(t),c!==0&&(l=c,i=ec(t,c))),i===1)throw o=yo,Cr(t,0),ir(t,l),yn(t,Te()),o;if(i===6)ir(t,l);else{if(c=t.current.alternate,(l&30)===0&&!I_(c)&&(i=Oa(t,l),i===2&&(h=an(t),h!==0&&(l=h,i=ec(t,h))),i===1))throw o=yo,Cr(t,0),ir(t,l),yn(t,Te()),o;switch(t.finishedWork=c,t.finishedLanes=l,i){case 0:case 1:throw Error(n(345));case 2:Pr(t,Sn,Ai);break;case 3:if(ir(t,l),(l&130023424)===l&&(i=Zu+500-Te(),10<i)){if(Rt(t,0)!==0)break;if(c=t.suspendedLanes,(c&l)!==l){mn(),t.pingedLanes|=t.suspendedLanes&c;break}t.timeoutHandle=ou(Pr.bind(null,t,Sn,Ai),i);break}Pr(t,Sn,Ai);break;case 4:if(ir(t,l),(l&4194240)===l)break;for(i=t.eventTimes,c=-1;0<l;){var E=31-Oe(l);h=1<<E,E=i[E],E>c&&(c=E),l&=~h}if(l=c,l=Te()-l,l=(120>l?120:480>l?480:1080>l?1080:1920>l?1920:3e3>l?3e3:4320>l?4320:1960*D_(l/1960))-l,10<l){t.timeoutHandle=ou(Pr.bind(null,t,Sn,Ai),l);break}Pr(t,Sn,Ai);break;case 5:Pr(t,Sn,Ai);break;default:throw Error(n(329))}}}return yn(t,Te()),t.callbackNode===o?ap.bind(null,t):null}function ec(t,i){var o=Mo;return t.current.memoizedState.isDehydrated&&(Cr(t,i).flags|=256),t=Oa(t,i),t!==2&&(i=Sn,Sn=o,i!==null&&tc(i)),t}function tc(t){Sn===null?Sn=t:Sn.push.apply(Sn,t)}function I_(t){for(var i=t;;){if(i.flags&16384){var o=i.updateQueue;if(o!==null&&(o=o.stores,o!==null))for(var l=0;l<o.length;l++){var c=o[l],h=c.getSnapshot;c=c.value;try{if(!jn(h(),c))return!1}catch{return!1}}}if(o=i.child,i.subtreeFlags&16384&&o!==null)o.return=i,i=o;else{if(i===t)break;for(;i.sibling===null;){if(i.return===null||i.return===t)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function ir(t,i){for(i&=~Ku,i&=~ba,t.suspendedLanes|=i,t.pingedLanes&=~i,t=t.expirationTimes;0<i;){var o=31-Oe(i),l=1<<o;t[o]=-1,i&=~l}}function lp(t){if((gt&6)!==0)throw Error(n(327));gs();var i=Rt(t,0);if((i&1)===0)return yn(t,Te()),null;var o=Oa(t,i);if(t.tag!==0&&o===2){var l=an(t);l!==0&&(i=l,o=ec(t,l))}if(o===1)throw o=yo,Cr(t,0),ir(t,i),yn(t,Te()),o;if(o===6)throw Error(n(345));return t.finishedWork=t.current.alternate,t.finishedLanes=i,Pr(t,Sn,Ai),yn(t,Te()),null}function nc(t,i){var o=gt;gt|=1;try{return t(i)}finally{gt=o,gt===0&&(ms=Te()+500,ca&&Ki())}}function Rr(t){tr!==null&&tr.tag===0&&(gt&6)===0&&gs();var i=gt;gt|=1;var o=Hn.transition,l=Et;try{if(Hn.transition=null,Et=1,t)return t()}finally{Et=l,Hn.transition=o,gt=i,(gt&6)===0&&Ki()}}function ic(){Dn=ps.current,Lt(ps)}function Cr(t,i){t.finishedWork=null,t.finishedLanes=0;var o=t.timeoutHandle;if(o!==-1&&(t.timeoutHandle=-1,u_(o)),Ht!==null)for(o=Ht.return;o!==null;){var l=o;switch(du(l),l.tag){case 1:l=l.type.childContextTypes,l!=null&&la();break;case 3:fs(),Lt(_n),Lt(ln),wu();break;case 5:Eu(l);break;case 4:fs();break;case 13:Lt(Nt);break;case 19:Lt(Nt);break;case 10:vu(l.type._context);break;case 22:case 23:ic()}o=o.return}if(Zt=t,Ht=t=rr(t.current,null),rn=Dn=i,Xt=0,yo=null,Ku=ba=Ar=0,Sn=Mo=null,Er!==null){for(i=0;i<Er.length;i++)if(o=Er[i],l=o.interleaved,l!==null){o.interleaved=null;var c=l.next,h=o.pending;if(h!==null){var E=h.next;h.next=c,l.next=E}o.pending=l}Er=null}return t}function up(t,i){do{var o=Ht;try{if(_u(),Sa.current=Ta,ya){for(var l=Ft.memoizedState;l!==null;){var c=l.queue;c!==null&&(c.pending=null),l=l.next}ya=!1}if(wr=0,Kt=Wt=Ft=null,mo=!1,go=0,$u.current=null,o===null||o.return===null){Xt=1,yo=i,Ht=null;break}e:{var h=t,E=o.return,U=o,O=i;if(i=rn,U.flags|=32768,O!==null&&typeof O=="object"&&typeof O.then=="function"){var te=O,ge=U,ve=ge.tag;if((ge.mode&1)===0&&(ve===0||ve===11||ve===15)){var me=ge.alternate;me?(ge.updateQueue=me.updateQueue,ge.memoizedState=me.memoizedState,ge.lanes=me.lanes):(ge.updateQueue=null,ge.memoizedState=null)}var Ie=Uh(E);if(Ie!==null){Ie.flags&=-257,Nh(Ie,E,U,h,i),Ie.mode&1&&Ih(h,te,i),i=Ie,O=te;var ze=i.updateQueue;if(ze===null){var He=new Set;He.add(O),i.updateQueue=He}else ze.add(O);break e}else{if((i&1)===0){Ih(h,te,i),rc();break e}O=Error(n(426))}}else if(It&&U.mode&1){var zt=Uh(E);if(zt!==null){(zt.flags&65536)===0&&(zt.flags|=256),Nh(zt,E,U,h,i),mu(ds(O,U));break e}}h=O=ds(O,U),Xt!==4&&(Xt=2),Mo===null?Mo=[h]:Mo.push(h),h=E;do{switch(h.tag){case 3:h.flags|=65536,i&=-i,h.lanes|=i;var Y=bh(h,O,i);rh(h,Y);break e;case 1:U=O;var z=h.type,$=h.stateNode;if((h.flags&128)===0&&(typeof z.getDerivedStateFromError=="function"||$!==null&&typeof $.componentDidCatch=="function"&&(er===null||!er.has($)))){h.flags|=65536,i&=-i,h.lanes|=i;var Me=Dh(h,U,i);rh(h,Me);break e}}h=h.return}while(h!==null)}dp(o)}catch(We){i=We,Ht===o&&o!==null&&(Ht=o=o.return);continue}break}while(!0)}function cp(){var t=La.current;return La.current=Ta,t===null?Ta:t}function rc(){(Xt===0||Xt===3||Xt===2)&&(Xt=4),Zt===null||(Ar&268435455)===0&&(ba&268435455)===0||ir(Zt,rn)}function Oa(t,i){var o=gt;gt|=2;var l=cp();(Zt!==t||rn!==i)&&(Ai=null,Cr(t,i));do try{U_();break}catch(c){up(t,c)}while(!0);if(_u(),gt=o,La.current=l,Ht!==null)throw Error(n(261));return Zt=null,rn=0,Xt}function U_(){for(;Ht!==null;)fp(Ht)}function N_(){for(;Ht!==null&&!Ee();)fp(Ht)}function fp(t){var i=mp(t.alternate,t,Dn);t.memoizedProps=t.pendingProps,i===null?dp(t):Ht=i,$u.current=null}function dp(t){var i=t;do{var o=i.alternate;if(t=i.return,(i.flags&32768)===0){if(o=R_(o,i,Dn),o!==null){Ht=o;return}}else{if(o=C_(o,i),o!==null){o.flags&=32767,Ht=o;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Xt=6,Ht=null;return}}if(i=i.sibling,i!==null){Ht=i;return}Ht=i=t}while(i!==null);Xt===0&&(Xt=5)}function Pr(t,i,o){var l=Et,c=Hn.transition;try{Hn.transition=null,Et=1,F_(t,i,o,l)}finally{Hn.transition=c,Et=l}return null}function F_(t,i,o,l){do gs();while(tr!==null);if((gt&6)!==0)throw Error(n(327));o=t.finishedWork;var c=t.finishedLanes;if(o===null)return null;if(t.finishedWork=null,t.finishedLanes=0,o===t.current)throw Error(n(177));t.callbackNode=null,t.callbackPriority=0;var h=o.lanes|o.childLanes;if(gg(t,h),t===Zt&&(Ht=Zt=null,rn=0),(o.subtreeFlags&2064)===0&&(o.flags&2064)===0||Ia||(Ia=!0,gp(Ge,function(){return gs(),null})),h=(o.flags&15990)!==0,(o.subtreeFlags&15990)!==0||h){h=Hn.transition,Hn.transition=null;var E=Et;Et=1;var U=gt;gt|=4,$u.current=null,L_(t,o),np(o,t),n_(ru),jo=!!iu,ru=iu=null,t.current=o,b_(o),be(),gt=U,Et=E,Hn.transition=h}else t.current=o;if(Ia&&(Ia=!1,tr=t,Ua=c),h=t.pendingLanes,h===0&&(er=null),_t(o.stateNode),yn(t,Te()),i!==null)for(l=t.onRecoverableError,o=0;o<i.length;o++)c=i[o],l(c.value,{componentStack:c.stack,digest:c.digest});if(Da)throw Da=!1,t=Qu,Qu=null,t;return(Ua&1)!==0&&t.tag!==0&&gs(),h=t.pendingLanes,(h&1)!==0?t===Ju?Eo++:(Eo=0,Ju=t):Eo=0,Ki(),null}function gs(){if(tr!==null){var t=ed(Ua),i=Hn.transition,o=Et;try{if(Hn.transition=null,Et=16>t?16:t,tr===null)var l=!1;else{if(t=tr,tr=null,Ua=0,(gt&6)!==0)throw Error(n(331));var c=gt;for(gt|=4,ke=t.current;ke!==null;){var h=ke,E=h.child;if((ke.flags&16)!==0){var U=h.deletions;if(U!==null){for(var O=0;O<U.length;O++){var te=U[O];for(ke=te;ke!==null;){var ge=ke;switch(ge.tag){case 0:case 11:case 15:So(8,ge,h)}var ve=ge.child;if(ve!==null)ve.return=ge,ke=ve;else for(;ke!==null;){ge=ke;var me=ge.sibling,Ie=ge.return;if(Zh(ge),ge===te){ke=null;break}if(me!==null){me.return=Ie,ke=me;break}ke=Ie}}}var ze=h.alternate;if(ze!==null){var He=ze.child;if(He!==null){ze.child=null;do{var zt=He.sibling;He.sibling=null,He=zt}while(He!==null)}}ke=h}}if((h.subtreeFlags&2064)!==0&&E!==null)E.return=h,ke=E;else e:for(;ke!==null;){if(h=ke,(h.flags&2048)!==0)switch(h.tag){case 0:case 11:case 15:So(9,h,h.return)}var Y=h.sibling;if(Y!==null){Y.return=h.return,ke=Y;break e}ke=h.return}}var z=t.current;for(ke=z;ke!==null;){E=ke;var $=E.child;if((E.subtreeFlags&2064)!==0&&$!==null)$.return=E,ke=$;else e:for(E=z;ke!==null;){if(U=ke,(U.flags&2048)!==0)try{switch(U.tag){case 0:case 11:case 15:Pa(9,U)}}catch(We){Bt(U,U.return,We)}if(U===E){ke=null;break e}var Me=U.sibling;if(Me!==null){Me.return=U.return,ke=Me;break e}ke=U.return}}if(gt=c,Ki(),Dt&&typeof Dt.onPostCommitFiberRoot=="function")try{Dt.onPostCommitFiberRoot(At,t)}catch{}l=!0}return l}finally{Et=o,Hn.transition=i}}return!1}function hp(t,i,o){i=ds(o,i),i=bh(t,i,1),t=Qi(t,i,1),i=mn(),t!==null&&(zi(t,1,i),yn(t,i))}function Bt(t,i,o){if(t.tag===3)hp(t,t,o);else for(;i!==null;){if(i.tag===3){hp(i,t,o);break}else if(i.tag===1){var l=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof l.componentDidCatch=="function"&&(er===null||!er.has(l))){t=ds(o,t),t=Dh(i,t,1),i=Qi(i,t,1),t=mn(),i!==null&&(zi(i,1,t),yn(i,t));break}}i=i.return}}function O_(t,i,o){var l=t.pingCache;l!==null&&l.delete(i),i=mn(),t.pingedLanes|=t.suspendedLanes&o,Zt===t&&(rn&o)===o&&(Xt===4||Xt===3&&(rn&130023424)===rn&&500>Te()-Zu?Cr(t,0):Ku|=o),yn(t,i)}function pp(t,i){i===0&&((t.mode&1)===0?i=1:(i=$t,$t<<=1,($t&130023424)===0&&($t=4194304)));var o=mn();t=Ei(t,i),t!==null&&(zi(t,i,o),yn(t,o))}function B_(t){var i=t.memoizedState,o=0;i!==null&&(o=i.retryLane),pp(t,o)}function k_(t,i){var o=0;switch(t.tag){case 13:var l=t.stateNode,c=t.memoizedState;c!==null&&(o=c.retryLane);break;case 19:l=t.stateNode;break;default:throw Error(n(314))}l!==null&&l.delete(i),pp(t,o)}var mp;mp=function(t,i,o){if(t!==null)if(t.memoizedProps!==i.pendingProps||_n.current)xn=!0;else{if((t.lanes&o)===0&&(i.flags&128)===0)return xn=!1,A_(t,i,o);xn=(t.flags&131072)!==0}else xn=!1,It&&(i.flags&1048576)!==0&&jd(i,da,i.index);switch(i.lanes=0,i.tag){case 2:var l=i.type;Ra(t,i),t=i.pendingProps;var c=rs(i,ln.current);cs(i,o),c=Cu(null,i,l,t,c,o);var h=Pu();return i.flags|=1,typeof c=="object"&&c!==null&&typeof c.render=="function"&&c.$$typeof===void 0?(i.tag=1,i.memoizedState=null,i.updateQueue=null,vn(l)?(h=!0,ua(i)):h=!1,i.memoizedState=c.state!==null&&c.state!==void 0?c.state:null,yu(i),c.updater=wa,i.stateNode=c,c._reactInternals=i,Nu(i,l,t,o),i=ku(null,i,l,!0,h,o)):(i.tag=0,It&&h&&fu(i),pn(null,i,c,o),i=i.child),i;case 16:l=i.elementType;e:{switch(Ra(t,i),t=i.pendingProps,c=l._init,l=c(l._payload),i.type=l,c=i.tag=H_(l),t=Kn(l,t),c){case 0:i=Bu(null,i,l,t,o);break e;case 1:i=Hh(null,i,l,t,o);break e;case 11:i=Fh(null,i,l,t,o);break e;case 14:i=Oh(null,i,l,Kn(l.type,t),o);break e}throw Error(n(306,l,""))}return i;case 0:return l=i.type,c=i.pendingProps,c=i.elementType===l?c:Kn(l,c),Bu(t,i,l,c,o);case 1:return l=i.type,c=i.pendingProps,c=i.elementType===l?c:Kn(l,c),Hh(t,i,l,c,o);case 3:e:{if(Vh(i),t===null)throw Error(n(387));l=i.pendingProps,h=i.memoizedState,c=h.element,ih(t,i),va(i,l,null,o);var E=i.memoizedState;if(l=E.element,h.isDehydrated)if(h={element:l,isDehydrated:!1,cache:E.cache,pendingSuspenseBoundaries:E.pendingSuspenseBoundaries,transitions:E.transitions},i.updateQueue.baseState=h,i.memoizedState=h,i.flags&256){c=ds(Error(n(423)),i),i=Gh(t,i,l,o,c);break e}else if(l!==c){c=ds(Error(n(424)),i),i=Gh(t,i,l,o,c);break e}else for(bn=qi(i.stateNode.containerInfo.firstChild),Ln=i,It=!0,$n=null,o=th(i,null,l,o),i.child=o;o;)o.flags=o.flags&-3|4096,o=o.sibling;else{if(as(),l===c){i=wi(t,i,o);break e}pn(t,i,l,o)}i=i.child}return i;case 5:return oh(i),t===null&&pu(i),l=i.type,c=i.pendingProps,h=t!==null?t.memoizedProps:null,E=c.children,su(l,c)?E=null:h!==null&&su(l,h)&&(i.flags|=32),zh(t,i),pn(t,i,E,o),i.child;case 6:return t===null&&pu(i),null;case 13:return Wh(t,i,o);case 4:return Mu(i,i.stateNode.containerInfo),l=i.pendingProps,t===null?i.child=ls(i,null,l,o):pn(t,i,l,o),i.child;case 11:return l=i.type,c=i.pendingProps,c=i.elementType===l?c:Kn(l,c),Fh(t,i,l,c,o);case 7:return pn(t,i,i.pendingProps,o),i.child;case 8:return pn(t,i,i.pendingProps.children,o),i.child;case 12:return pn(t,i,i.pendingProps.children,o),i.child;case 10:e:{if(l=i.type._context,c=i.pendingProps,h=i.memoizedProps,E=c.value,Ct(ma,l._currentValue),l._currentValue=E,h!==null)if(jn(h.value,E)){if(h.children===c.children&&!_n.current){i=wi(t,i,o);break e}}else for(h=i.child,h!==null&&(h.return=i);h!==null;){var U=h.dependencies;if(U!==null){E=h.child;for(var O=U.firstContext;O!==null;){if(O.context===l){if(h.tag===1){O=Ti(-1,o&-o),O.tag=2;var te=h.updateQueue;if(te!==null){te=te.shared;var ge=te.pending;ge===null?O.next=O:(O.next=ge.next,ge.next=O),te.pending=O}}h.lanes|=o,O=h.alternate,O!==null&&(O.lanes|=o),xu(h.return,o,i),U.lanes|=o;break}O=O.next}}else if(h.tag===10)E=h.type===i.type?null:h.child;else if(h.tag===18){if(E=h.return,E===null)throw Error(n(341));E.lanes|=o,U=E.alternate,U!==null&&(U.lanes|=o),xu(E,o,i),E=h.sibling}else E=h.child;if(E!==null)E.return=h;else for(E=h;E!==null;){if(E===i){E=null;break}if(h=E.sibling,h!==null){h.return=E.return,E=h;break}E=E.return}h=E}pn(t,i,c.children,o),i=i.child}return i;case 9:return c=i.type,l=i.pendingProps.children,cs(i,o),c=kn(c),l=l(c),i.flags|=1,pn(t,i,l,o),i.child;case 14:return l=i.type,c=Kn(l,i.pendingProps),c=Kn(l.type,c),Oh(t,i,l,c,o);case 15:return Bh(t,i,i.type,i.pendingProps,o);case 17:return l=i.type,c=i.pendingProps,c=i.elementType===l?c:Kn(l,c),Ra(t,i),i.tag=1,vn(l)?(t=!0,ua(i)):t=!1,cs(i,o),Ph(i,l,c),Nu(i,l,c,o),ku(null,i,l,!0,t,o);case 19:return Yh(t,i,o);case 22:return kh(t,i,o)}throw Error(n(156,i.tag))};function gp(t,i){return ee(t,i)}function z_(t,i,o,l){this.tag=t,this.key=o,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=l,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Vn(t,i,o,l){return new z_(t,i,o,l)}function sc(t){return t=t.prototype,!(!t||!t.isReactComponent)}function H_(t){if(typeof t=="function")return sc(t)?1:0;if(t!=null){if(t=t.$$typeof,t===q)return 11;if(t===de)return 14}return 2}function rr(t,i){var o=t.alternate;return o===null?(o=Vn(t.tag,i,t.key,t.mode),o.elementType=t.elementType,o.type=t.type,o.stateNode=t.stateNode,o.alternate=t,t.alternate=o):(o.pendingProps=i,o.type=t.type,o.flags=0,o.subtreeFlags=0,o.deletions=null),o.flags=t.flags&14680064,o.childLanes=t.childLanes,o.lanes=t.lanes,o.child=t.child,o.memoizedProps=t.memoizedProps,o.memoizedState=t.memoizedState,o.updateQueue=t.updateQueue,i=t.dependencies,o.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},o.sibling=t.sibling,o.index=t.index,o.ref=t.ref,o}function Ba(t,i,o,l,c,h){var E=2;if(l=t,typeof t=="function")sc(t)&&(E=1);else if(typeof t=="string")E=5;else e:switch(t){case I:return Lr(o.children,c,h,i);case H:E=8,c|=8;break;case re:return t=Vn(12,o,i,c|2),t.elementType=re,t.lanes=h,t;case Z:return t=Vn(13,o,i,c),t.elementType=Z,t.lanes=h,t;case ae:return t=Vn(19,o,i,c),t.elementType=ae,t.lanes=h,t;case le:return ka(o,c,h,i);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case M:E=10;break e;case C:E=9;break e;case q:E=11;break e;case de:E=14;break e;case ne:E=16,l=null;break e}throw Error(n(130,t==null?t:typeof t,""))}return i=Vn(E,o,i,c),i.elementType=t,i.type=l,i.lanes=h,i}function Lr(t,i,o,l){return t=Vn(7,t,l,i),t.lanes=o,t}function ka(t,i,o,l){return t=Vn(22,t,l,i),t.elementType=le,t.lanes=o,t.stateNode={isHidden:!1},t}function oc(t,i,o){return t=Vn(6,t,null,i),t.lanes=o,t}function ac(t,i,o){return i=Vn(4,t.children!==null?t.children:[],t.key,i),i.lanes=o,i.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},i}function V_(t,i,o,l,c){this.tag=i,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Ys(0),this.expirationTimes=Ys(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ys(0),this.identifierPrefix=l,this.onRecoverableError=c,this.mutableSourceEagerHydrationData=null}function lc(t,i,o,l,c,h,E,U,O){return t=new V_(t,i,o,U,O),i===1?(i=1,h===!0&&(i|=8)):i=0,h=Vn(3,null,null,i),t.current=h,h.stateNode=t,h.memoizedState={element:l,isDehydrated:o,cache:null,transitions:null,pendingSuspenseBoundaries:null},yu(h),t}function G_(t,i,o){var l=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:F,key:l==null?null:""+l,children:t,containerInfo:i,implementation:o}}function _p(t){if(!t)return $i;t=t._reactInternals;e:{if(_i(t)!==t||t.tag!==1)throw Error(n(170));var i=t;do{switch(i.tag){case 3:i=i.stateNode.context;break e;case 1:if(vn(i.type)){i=i.stateNode.__reactInternalMemoizedMergedChildContext;break e}}i=i.return}while(i!==null);throw Error(n(171))}if(t.tag===1){var o=t.type;if(vn(o))return Xd(t,o,i)}return i}function vp(t,i,o,l,c,h,E,U,O){return t=lc(o,l,!0,t,c,h,E,U,O),t.context=_p(null),o=t.current,l=mn(),c=nr(o),h=Ti(l,c),h.callback=i??null,Qi(o,h,c),t.current.lanes=c,zi(t,c,l),yn(t,l),t}function za(t,i,o,l){var c=i.current,h=mn(),E=nr(c);return o=_p(o),i.context===null?i.context=o:i.pendingContext=o,i=Ti(h,E),i.payload={element:t},l=l===void 0?null:l,l!==null&&(i.callback=l),t=Qi(c,i,E),t!==null&&(Jn(t,c,E,h),_a(t,c,E)),E}function Ha(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function xp(t,i){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var o=t.retryLane;t.retryLane=o!==0&&o<i?o:i}}function uc(t,i){xp(t,i),(t=t.alternate)&&xp(t,i)}function W_(){return null}var Sp=typeof reportError=="function"?reportError:function(t){console.error(t)};function cc(t){this._internalRoot=t}Va.prototype.render=cc.prototype.render=function(t){var i=this._internalRoot;if(i===null)throw Error(n(409));za(t,i,null,null)},Va.prototype.unmount=cc.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var i=t.containerInfo;Rr(function(){za(null,t,null,null)}),i[xi]=null}};function Va(t){this._internalRoot=t}Va.prototype.unstable_scheduleHydration=function(t){if(t){var i=id();t={blockedOn:null,target:t,priority:i};for(var o=0;o<Wi.length&&i!==0&&i<Wi[o].priority;o++);Wi.splice(o,0,t),o===0&&od(t)}};function fc(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Ga(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function yp(){}function X_(t,i,o,l,c){if(c){if(typeof l=="function"){var h=l;l=function(){var te=Ha(E);h.call(te)}}var E=vp(i,l,t,0,null,!1,!1,"",yp);return t._reactRootContainer=E,t[xi]=E.current,oo(t.nodeType===8?t.parentNode:t),Rr(),E}for(;c=t.lastChild;)t.removeChild(c);if(typeof l=="function"){var U=l;l=function(){var te=Ha(O);U.call(te)}}var O=lc(t,0,!1,null,null,!1,!1,"",yp);return t._reactRootContainer=O,t[xi]=O.current,oo(t.nodeType===8?t.parentNode:t),Rr(function(){za(i,O,o,l)}),O}function Wa(t,i,o,l,c){var h=o._reactRootContainer;if(h){var E=h;if(typeof c=="function"){var U=c;c=function(){var O=Ha(E);U.call(O)}}za(i,E,t,c)}else E=X_(o,i,t,c,l);return Ha(E)}td=function(t){switch(t.tag){case 3:var i=t.stateNode;if(i.current.memoizedState.isDehydrated){var o=vi(i.pendingLanes);o!==0&&(Nl(i,o|1),yn(i,Te()),(gt&6)===0&&(ms=Te()+500,Ki()))}break;case 13:Rr(function(){var l=Ei(t,1);if(l!==null){var c=mn();Jn(l,t,1,c)}}),uc(t,1)}},Fl=function(t){if(t.tag===13){var i=Ei(t,134217728);if(i!==null){var o=mn();Jn(i,t,134217728,o)}uc(t,134217728)}},nd=function(t){if(t.tag===13){var i=nr(t),o=Ei(t,i);if(o!==null){var l=mn();Jn(o,t,i,l)}uc(t,i)}},id=function(){return Et},rd=function(t,i){var o=Et;try{return Et=t,i()}finally{Et=o}},se=function(t,i,o){switch(i){case"input":if($e(t,o),i=o.name,o.type==="radio"&&i!=null){for(o=t;o.parentNode;)o=o.parentNode;for(o=o.querySelectorAll("input[name="+JSON.stringify(""+i)+'][type="radio"]'),i=0;i<o.length;i++){var l=o[i];if(l!==t&&l.form===t.form){var c=aa(l);if(!c)throw Error(n(90));at(l),$e(l,c)}}}break;case"textarea":_e(t,o);break;case"select":i=o.value,i!=null&&T(t,!!o.multiple,i,!1)}},tn=nc,ht=Rr;var Y_={usingClientEntryPoint:!1,Events:[uo,ns,aa,ut,Ut,nc]},To={findFiberByHostInstance:xr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},q_={bundleType:To.bundleType,version:To.version,rendererPackageName:To.rendererPackageName,rendererConfig:To.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:L.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=G(t),t===null?null:t.stateNode},findFiberByHostInstance:To.findFiberByHostInstance||W_,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Xa=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Xa.isDisabled&&Xa.supportsFiber)try{At=Xa.inject(q_),Dt=Xa}catch{}}return Mn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Y_,Mn.createPortal=function(t,i){var o=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!fc(i))throw Error(n(200));return G_(t,i,null,o)},Mn.createRoot=function(t,i){if(!fc(t))throw Error(n(299));var o=!1,l="",c=Sp;return i!=null&&(i.unstable_strictMode===!0&&(o=!0),i.identifierPrefix!==void 0&&(l=i.identifierPrefix),i.onRecoverableError!==void 0&&(c=i.onRecoverableError)),i=lc(t,1,!1,null,null,o,!1,l,c),t[xi]=i.current,oo(t.nodeType===8?t.parentNode:t),new cc(i)},Mn.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var i=t._reactInternals;if(i===void 0)throw typeof t.render=="function"?Error(n(188)):(t=Object.keys(t).join(","),Error(n(268,t)));return t=G(i),t=t===null?null:t.stateNode,t},Mn.flushSync=function(t){return Rr(t)},Mn.hydrate=function(t,i,o){if(!Ga(i))throw Error(n(200));return Wa(null,t,i,!0,o)},Mn.hydrateRoot=function(t,i,o){if(!fc(t))throw Error(n(405));var l=o!=null&&o.hydratedSources||null,c=!1,h="",E=Sp;if(o!=null&&(o.unstable_strictMode===!0&&(c=!0),o.identifierPrefix!==void 0&&(h=o.identifierPrefix),o.onRecoverableError!==void 0&&(E=o.onRecoverableError)),i=vp(i,null,t,1,o??null,c,!1,h,E),t[xi]=i.current,oo(t),l)for(t=0;t<l.length;t++)o=l[t],c=o._getVersion,c=c(o._source),i.mutableSourceEagerHydrationData==null?i.mutableSourceEagerHydrationData=[o,c]:i.mutableSourceEagerHydrationData.push(o,c);return new Va(i)},Mn.render=function(t,i,o){if(!Ga(i))throw Error(n(200));return Wa(null,t,i,!1,o)},Mn.unmountComponentAtNode=function(t){if(!Ga(t))throw Error(n(40));return t._reactRootContainer?(Rr(function(){Wa(null,null,t,!1,function(){t._reactRootContainer=null,t[xi]=null})}),!0):!1},Mn.unstable_batchedUpdates=nc,Mn.unstable_renderSubtreeIntoContainer=function(t,i,o,l){if(!Ga(o))throw Error(n(200));if(t==null||t._reactInternals===void 0)throw Error(n(38));return Wa(t,i,o,!1,l)},Mn.version="18.3.1-next-f1338f8080-20240426",Mn}var Pp;function nv(){if(Pp)return pc.exports;Pp=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(e){console.error(e)}}return s(),pc.exports=tv(),pc.exports}var Lp;function iv(){if(Lp)return Ya;Lp=1;var s=nv();return Ya.createRoot=s.createRoot,Ya.hydrateRoot=s.hydrateRoot,Ya}var rv=iv();const sv=Im(rv);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const zf="169",ov=0,bp=1,av=2,Um=1,lv=2,Ii=3,mr=0,wn=1,Ui=2,hr=0,Ds=1,Dp=2,Ip=3,Up=4,uv=5,kr=100,cv=101,fv=102,dv=103,hv=104,pv=200,mv=201,gv=202,_v=203,Zc=204,Qc=205,vv=206,xv=207,Sv=208,yv=209,Mv=210,Ev=211,Tv=212,wv=213,Av=214,Jc=0,ef=1,tf=2,Ns=3,nf=4,rf=5,sf=6,of=7,Nm=0,Rv=1,Cv=2,pr=0,Pv=1,Lv=2,bv=3,Dv=4,Iv=5,Uv=6,Nv=7,Fm=300,Fs=301,Os=302,af=303,lf=304,bl=306,uf=1e3,Hr=1001,cf=1002,Xn=1003,Fv=1004,qa=1005,ii=1006,_c=1007,Vr=1008,Oi=1009,Om=1010,Bm=1011,No=1012,Hf=1013,Gr=1014,Ni=1015,Fo=1016,Vf=1017,Gf=1018,Bs=1020,km=35902,zm=1021,Hm=1022,si=1023,Vm=1024,Gm=1025,Is=1026,ks=1027,Wm=1028,Wf=1029,Xm=1030,Xf=1031,Yf=1033,_l=33776,vl=33777,xl=33778,Sl=33779,ff=35840,df=35841,hf=35842,pf=35843,mf=36196,gf=37492,_f=37496,vf=37808,xf=37809,Sf=37810,yf=37811,Mf=37812,Ef=37813,Tf=37814,wf=37815,Af=37816,Rf=37817,Cf=37818,Pf=37819,Lf=37820,bf=37821,yl=36492,Df=36494,If=36495,Ym=36283,Uf=36284,Nf=36285,Ff=36286,Ov=3200,Bv=3201,qm=0,kv=1,dr="",di="srgb",_r="srgb-linear",qf="display-p3",Dl="display-p3-linear",Tl="linear",bt="srgb",wl="rec709",Al="p3",_s=7680,Np=519,zv=512,Hv=513,Vv=514,jm=515,Gv=516,Wv=517,Xv=518,Yv=519,Fp=35044,Op="300 es",Fi=2e3,Rl=2001;class Hs{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(n)===-1&&r[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const r=this._listeners;return r[e]!==void 0&&r[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const a=this._listeners[e];if(a!==void 0){const u=a.indexOf(n);u!==-1&&a.splice(u,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const r=this._listeners[e.type];if(r!==void 0){e.target=this;const a=r.slice(0);for(let u=0,f=a.length;u<f;u++)a[u].call(this,e);e.target=null}}}const dn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],vc=Math.PI/180,Of=180/Math.PI;function Oo(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(dn[s&255]+dn[s>>8&255]+dn[s>>16&255]+dn[s>>24&255]+"-"+dn[e&255]+dn[e>>8&255]+"-"+dn[e>>16&15|64]+dn[e>>24&255]+"-"+dn[n&63|128]+dn[n>>8&255]+"-"+dn[n>>16&255]+dn[n>>24&255]+dn[r&255]+dn[r>>8&255]+dn[r>>16&255]+dn[r>>24&255]).toLowerCase()}function Tn(s,e,n){return Math.max(e,Math.min(n,s))}function qv(s,e){return(s%e+e)%e}function xc(s,e,n){return(1-n)*s+n*e}function Ao(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function En(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}class pt{constructor(e=0,n=0){pt.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,r=this.y,a=e.elements;return this.x=a[0]*n+a[3]*r+a[6],this.y=a[1]*n+a[4]*r+a[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(n,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const r=this.dot(e)/n;return Math.acos(Tn(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,r=this.y-e.y;return n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,r){return this.x=e.x+(n.x-e.x)*r,this.y=e.y+(n.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const r=Math.cos(n),a=Math.sin(n),u=this.x-e.x,f=this.y-e.y;return this.x=u*r-f*a+e.x,this.y=u*a+f*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class rt{constructor(e,n,r,a,u,f,d,p,m){rt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,r,a,u,f,d,p,m)}set(e,n,r,a,u,f,d,p,m){const _=this.elements;return _[0]=e,_[1]=a,_[2]=d,_[3]=n,_[4]=u,_[5]=p,_[6]=r,_[7]=f,_[8]=m,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,r=e.elements;return n[0]=r[0],n[1]=r[1],n[2]=r[2],n[3]=r[3],n[4]=r[4],n[5]=r[5],n[6]=r[6],n[7]=r[7],n[8]=r[8],this}extractBasis(e,n,r){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const r=e.elements,a=n.elements,u=this.elements,f=r[0],d=r[3],p=r[6],m=r[1],_=r[4],S=r[7],x=r[2],y=r[5],w=r[8],A=a[0],g=a[3],v=a[6],b=a[1],P=a[4],L=a[7],X=a[2],F=a[5],I=a[8];return u[0]=f*A+d*b+p*X,u[3]=f*g+d*P+p*F,u[6]=f*v+d*L+p*I,u[1]=m*A+_*b+S*X,u[4]=m*g+_*P+S*F,u[7]=m*v+_*L+S*I,u[2]=x*A+y*b+w*X,u[5]=x*g+y*P+w*F,u[8]=x*v+y*L+w*I,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],r=e[1],a=e[2],u=e[3],f=e[4],d=e[5],p=e[6],m=e[7],_=e[8];return n*f*_-n*d*m-r*u*_+r*d*p+a*u*m-a*f*p}invert(){const e=this.elements,n=e[0],r=e[1],a=e[2],u=e[3],f=e[4],d=e[5],p=e[6],m=e[7],_=e[8],S=_*f-d*m,x=d*p-_*u,y=m*u-f*p,w=n*S+r*x+a*y;if(w===0)return this.set(0,0,0,0,0,0,0,0,0);const A=1/w;return e[0]=S*A,e[1]=(a*m-_*r)*A,e[2]=(d*r-a*f)*A,e[3]=x*A,e[4]=(_*n-a*p)*A,e[5]=(a*u-d*n)*A,e[6]=y*A,e[7]=(r*p-m*n)*A,e[8]=(f*n-r*u)*A,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,r,a,u,f,d){const p=Math.cos(u),m=Math.sin(u);return this.set(r*p,r*m,-r*(p*f+m*d)+f+e,-a*m,a*p,-a*(-m*f+p*d)+d+n,0,0,1),this}scale(e,n){return this.premultiply(Sc.makeScale(e,n)),this}rotate(e){return this.premultiply(Sc.makeRotation(-e)),this}translate(e,n){return this.premultiply(Sc.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),r=Math.sin(e);return this.set(n,-r,0,r,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,r=e.elements;for(let a=0;a<9;a++)if(n[a]!==r[a])return!1;return!0}fromArray(e,n=0){for(let r=0;r<9;r++)this.elements[r]=e[r+n];return this}toArray(e=[],n=0){const r=this.elements;return e[n]=r[0],e[n+1]=r[1],e[n+2]=r[2],e[n+3]=r[3],e[n+4]=r[4],e[n+5]=r[5],e[n+6]=r[6],e[n+7]=r[7],e[n+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Sc=new rt;function $m(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Cl(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function jv(){const s=Cl("canvas");return s.style.display="block",s}const Bp={};function Ml(s){s in Bp||(Bp[s]=!0,console.warn(s))}function $v(s,e,n){return new Promise(function(r,a){function u(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:a();break;case s.TIMEOUT_EXPIRED:setTimeout(u,n);break;default:r()}}setTimeout(u,n)})}function Kv(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Zv(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const kp=new rt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),zp=new rt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ro={[_r]:{transfer:Tl,primaries:wl,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s,fromReference:s=>s},[di]:{transfer:bt,primaries:wl,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s.convertSRGBToLinear(),fromReference:s=>s.convertLinearToSRGB()},[Dl]:{transfer:Tl,primaries:Al,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.applyMatrix3(zp),fromReference:s=>s.applyMatrix3(kp)},[qf]:{transfer:bt,primaries:Al,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.convertSRGBToLinear().applyMatrix3(zp),fromReference:s=>s.applyMatrix3(kp).convertLinearToSRGB()}},Qv=new Set([_r,Dl]),Mt={enabled:!0,_workingColorSpace:_r,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(s){if(!Qv.has(s))throw new Error(`Unsupported working color space, "${s}".`);this._workingColorSpace=s},convert:function(s,e,n){if(this.enabled===!1||e===n||!e||!n)return s;const r=Ro[e].toReference,a=Ro[n].fromReference;return a(r(s))},fromWorkingColorSpace:function(s,e){return this.convert(s,this._workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this._workingColorSpace)},getPrimaries:function(s){return Ro[s].primaries},getTransfer:function(s){return s===dr?Tl:Ro[s].transfer},getLuminanceCoefficients:function(s,e=this._workingColorSpace){return s.fromArray(Ro[e].luminanceCoefficients)}};function Us(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function yc(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let vs;class Jv{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{vs===void 0&&(vs=Cl("canvas")),vs.width=e.width,vs.height=e.height;const r=vs.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=vs}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=Cl("canvas");n.width=e.width,n.height=e.height;const r=n.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const a=r.getImageData(0,0,e.width,e.height),u=a.data;for(let f=0;f<u.length;f++)u[f]=Us(u[f]/255)*255;return r.putImageData(a,0,0),n}else if(e.data){const n=e.data.slice(0);for(let r=0;r<n.length;r++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[r]=Math.floor(Us(n[r]/255)*255):n[r]=Us(n[r]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let e0=0;class Km{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:e0++}),this.uuid=Oo(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},a=this.data;if(a!==null){let u;if(Array.isArray(a)){u=[];for(let f=0,d=a.length;f<d;f++)a[f].isDataTexture?u.push(Mc(a[f].image)):u.push(Mc(a[f]))}else u=Mc(a);r.url=u}return n||(e.images[this.uuid]=r),r}}function Mc(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Jv.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let t0=0;class An extends Hs{constructor(e=An.DEFAULT_IMAGE,n=An.DEFAULT_MAPPING,r=Hr,a=Hr,u=ii,f=Vr,d=si,p=Oi,m=An.DEFAULT_ANISOTROPY,_=dr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:t0++}),this.uuid=Oo(),this.name="",this.source=new Km(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=u,this.minFilter=f,this.anisotropy=m,this.format=d,this.internalFormat=null,this.type=p,this.offset=new pt(0,0),this.repeat=new pt(1,1),this.center=new pt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new rt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=_,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),n||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Fm)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case uf:e.x=e.x-Math.floor(e.x);break;case Hr:e.x=e.x<0?0:1;break;case cf:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case uf:e.y=e.y-Math.floor(e.y);break;case Hr:e.y=e.y<0?0:1;break;case cf:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}An.DEFAULT_IMAGE=null;An.DEFAULT_MAPPING=Fm;An.DEFAULT_ANISOTROPY=1;class kt{constructor(e=0,n=0,r=0,a=1){kt.prototype.isVector4=!0,this.x=e,this.y=n,this.z=r,this.w=a}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,r,a){return this.x=e,this.y=n,this.z=r,this.w=a,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,r=this.y,a=this.z,u=this.w,f=e.elements;return this.x=f[0]*n+f[4]*r+f[8]*a+f[12]*u,this.y=f[1]*n+f[5]*r+f[9]*a+f[13]*u,this.z=f[2]*n+f[6]*r+f[10]*a+f[14]*u,this.w=f[3]*n+f[7]*r+f[11]*a+f[15]*u,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,r,a,u;const p=e.elements,m=p[0],_=p[4],S=p[8],x=p[1],y=p[5],w=p[9],A=p[2],g=p[6],v=p[10];if(Math.abs(_-x)<.01&&Math.abs(S-A)<.01&&Math.abs(w-g)<.01){if(Math.abs(_+x)<.1&&Math.abs(S+A)<.1&&Math.abs(w+g)<.1&&Math.abs(m+y+v-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const P=(m+1)/2,L=(y+1)/2,X=(v+1)/2,F=(_+x)/4,I=(S+A)/4,H=(w+g)/4;return P>L&&P>X?P<.01?(r=0,a=.707106781,u=.707106781):(r=Math.sqrt(P),a=F/r,u=I/r):L>X?L<.01?(r=.707106781,a=0,u=.707106781):(a=Math.sqrt(L),r=F/a,u=H/a):X<.01?(r=.707106781,a=.707106781,u=0):(u=Math.sqrt(X),r=I/u,a=H/u),this.set(r,a,u,n),this}let b=Math.sqrt((g-w)*(g-w)+(S-A)*(S-A)+(x-_)*(x-_));return Math.abs(b)<.001&&(b=1),this.x=(g-w)/b,this.y=(S-A)/b,this.z=(x-_)/b,this.w=Math.acos((m+y+v-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(n,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,r){return this.x=e.x+(n.x-e.x)*r,this.y=e.y+(n.y-e.y)*r,this.z=e.z+(n.z-e.z)*r,this.w=e.w+(n.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class n0 extends Hs{constructor(e=1,n=1,r={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new kt(0,0,e,n),this.scissorTest=!1,this.viewport=new kt(0,0,e,n);const a={width:e,height:n,depth:1};r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ii,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},r);const u=new An(a,r.mapping,r.wrapS,r.wrapT,r.magFilter,r.minFilter,r.format,r.type,r.anisotropy,r.colorSpace);u.flipY=!1,u.generateMipmaps=r.generateMipmaps,u.internalFormat=r.internalFormat,this.textures=[];const f=r.count;for(let d=0;d<f;d++)this.textures[d]=u.clone(),this.textures[d].isRenderTargetTexture=!0;this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this.depthTexture=r.depthTexture,this.samples=r.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,n,r=1){if(this.width!==e||this.height!==n||this.depth!==r){this.width=e,this.height=n,this.depth=r;for(let a=0,u=this.textures.length;a<u;a++)this.textures[a].image.width=e,this.textures[a].image.height=n,this.textures[a].image.depth=r;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let r=0,a=e.textures.length;r<a;r++)this.textures[r]=e.textures[r].clone(),this.textures[r].isRenderTargetTexture=!0;const n=Object.assign({},e.texture.image);return this.texture.source=new Km(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Wr extends n0{constructor(e=1,n=1,r={}){super(e,n,r),this.isWebGLRenderTarget=!0}}class Zm extends An{constructor(e=null,n=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:r,depth:a},this.magFilter=Xn,this.minFilter=Xn,this.wrapR=Hr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class i0 extends An{constructor(e=null,n=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:r,depth:a},this.magFilter=Xn,this.minFilter=Xn,this.wrapR=Hr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Bo{constructor(e=0,n=0,r=0,a=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=r,this._w=a}static slerpFlat(e,n,r,a,u,f,d){let p=r[a+0],m=r[a+1],_=r[a+2],S=r[a+3];const x=u[f+0],y=u[f+1],w=u[f+2],A=u[f+3];if(d===0){e[n+0]=p,e[n+1]=m,e[n+2]=_,e[n+3]=S;return}if(d===1){e[n+0]=x,e[n+1]=y,e[n+2]=w,e[n+3]=A;return}if(S!==A||p!==x||m!==y||_!==w){let g=1-d;const v=p*x+m*y+_*w+S*A,b=v>=0?1:-1,P=1-v*v;if(P>Number.EPSILON){const X=Math.sqrt(P),F=Math.atan2(X,v*b);g=Math.sin(g*F)/X,d=Math.sin(d*F)/X}const L=d*b;if(p=p*g+x*L,m=m*g+y*L,_=_*g+w*L,S=S*g+A*L,g===1-d){const X=1/Math.sqrt(p*p+m*m+_*_+S*S);p*=X,m*=X,_*=X,S*=X}}e[n]=p,e[n+1]=m,e[n+2]=_,e[n+3]=S}static multiplyQuaternionsFlat(e,n,r,a,u,f){const d=r[a],p=r[a+1],m=r[a+2],_=r[a+3],S=u[f],x=u[f+1],y=u[f+2],w=u[f+3];return e[n]=d*w+_*S+p*y-m*x,e[n+1]=p*w+_*x+m*S-d*y,e[n+2]=m*w+_*y+d*x-p*S,e[n+3]=_*w-d*S-p*x-m*y,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,r,a){return this._x=e,this._y=n,this._z=r,this._w=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const r=e._x,a=e._y,u=e._z,f=e._order,d=Math.cos,p=Math.sin,m=d(r/2),_=d(a/2),S=d(u/2),x=p(r/2),y=p(a/2),w=p(u/2);switch(f){case"XYZ":this._x=x*_*S+m*y*w,this._y=m*y*S-x*_*w,this._z=m*_*w+x*y*S,this._w=m*_*S-x*y*w;break;case"YXZ":this._x=x*_*S+m*y*w,this._y=m*y*S-x*_*w,this._z=m*_*w-x*y*S,this._w=m*_*S+x*y*w;break;case"ZXY":this._x=x*_*S-m*y*w,this._y=m*y*S+x*_*w,this._z=m*_*w+x*y*S,this._w=m*_*S-x*y*w;break;case"ZYX":this._x=x*_*S-m*y*w,this._y=m*y*S+x*_*w,this._z=m*_*w-x*y*S,this._w=m*_*S+x*y*w;break;case"YZX":this._x=x*_*S+m*y*w,this._y=m*y*S+x*_*w,this._z=m*_*w-x*y*S,this._w=m*_*S-x*y*w;break;case"XZY":this._x=x*_*S-m*y*w,this._y=m*y*S-x*_*w,this._z=m*_*w+x*y*S,this._w=m*_*S+x*y*w;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+f)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const r=n/2,a=Math.sin(r);return this._x=e.x*a,this._y=e.y*a,this._z=e.z*a,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,r=n[0],a=n[4],u=n[8],f=n[1],d=n[5],p=n[9],m=n[2],_=n[6],S=n[10],x=r+d+S;if(x>0){const y=.5/Math.sqrt(x+1);this._w=.25/y,this._x=(_-p)*y,this._y=(u-m)*y,this._z=(f-a)*y}else if(r>d&&r>S){const y=2*Math.sqrt(1+r-d-S);this._w=(_-p)/y,this._x=.25*y,this._y=(a+f)/y,this._z=(u+m)/y}else if(d>S){const y=2*Math.sqrt(1+d-r-S);this._w=(u-m)/y,this._x=(a+f)/y,this._y=.25*y,this._z=(p+_)/y}else{const y=2*Math.sqrt(1+S-r-d);this._w=(f-a)/y,this._x=(u+m)/y,this._y=(p+_)/y,this._z=.25*y}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let r=e.dot(n)+1;return r<Number.EPSILON?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Tn(this.dot(e),-1,1)))}rotateTowards(e,n){const r=this.angleTo(e);if(r===0)return this;const a=Math.min(1,n/r);return this.slerp(e,a),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const r=e._x,a=e._y,u=e._z,f=e._w,d=n._x,p=n._y,m=n._z,_=n._w;return this._x=r*_+f*d+a*m-u*p,this._y=a*_+f*p+u*d-r*m,this._z=u*_+f*m+r*p-a*d,this._w=f*_-r*d-a*p-u*m,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const r=this._x,a=this._y,u=this._z,f=this._w;let d=f*e._w+r*e._x+a*e._y+u*e._z;if(d<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,d=-d):this.copy(e),d>=1)return this._w=f,this._x=r,this._y=a,this._z=u,this;const p=1-d*d;if(p<=Number.EPSILON){const y=1-n;return this._w=y*f+n*this._w,this._x=y*r+n*this._x,this._y=y*a+n*this._y,this._z=y*u+n*this._z,this.normalize(),this}const m=Math.sqrt(p),_=Math.atan2(m,d),S=Math.sin((1-n)*_)/m,x=Math.sin(n*_)/m;return this._w=f*S+this._w*x,this._x=r*S+this._x*x,this._y=a*S+this._y*x,this._z=u*S+this._z*x,this._onChangeCallback(),this}slerpQuaternions(e,n,r){return this.copy(e).slerp(n,r)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),r=Math.random(),a=Math.sqrt(1-r),u=Math.sqrt(r);return this.set(a*Math.sin(e),a*Math.cos(e),u*Math.sin(n),u*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class j{constructor(e=0,n=0,r=0){j.prototype.isVector3=!0,this.x=e,this.y=n,this.z=r}set(e,n,r){return r===void 0&&(r=this.z),this.x=e,this.y=n,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(Hp.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(Hp.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,r=this.y,a=this.z,u=e.elements;return this.x=u[0]*n+u[3]*r+u[6]*a,this.y=u[1]*n+u[4]*r+u[7]*a,this.z=u[2]*n+u[5]*r+u[8]*a,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,r=this.y,a=this.z,u=e.elements,f=1/(u[3]*n+u[7]*r+u[11]*a+u[15]);return this.x=(u[0]*n+u[4]*r+u[8]*a+u[12])*f,this.y=(u[1]*n+u[5]*r+u[9]*a+u[13])*f,this.z=(u[2]*n+u[6]*r+u[10]*a+u[14])*f,this}applyQuaternion(e){const n=this.x,r=this.y,a=this.z,u=e.x,f=e.y,d=e.z,p=e.w,m=2*(f*a-d*r),_=2*(d*n-u*a),S=2*(u*r-f*n);return this.x=n+p*m+f*S-d*_,this.y=r+p*_+d*m-u*S,this.z=a+p*S+u*_-f*m,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,r=this.y,a=this.z,u=e.elements;return this.x=u[0]*n+u[4]*r+u[8]*a,this.y=u[1]*n+u[5]*r+u[9]*a,this.z=u[2]*n+u[6]*r+u[10]*a,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(n,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,r){return this.x=e.x+(n.x-e.x)*r,this.y=e.y+(n.y-e.y)*r,this.z=e.z+(n.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const r=e.x,a=e.y,u=e.z,f=n.x,d=n.y,p=n.z;return this.x=a*p-u*d,this.y=u*f-r*p,this.z=r*d-a*f,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const r=e.dot(this)/n;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return Ec.copy(this).projectOnVector(e),this.sub(Ec)}reflect(e){return this.sub(Ec.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const r=this.dot(e)/n;return Math.acos(Tn(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,r=this.y-e.y,a=this.z-e.z;return n*n+r*r+a*a}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,r){const a=Math.sin(n)*e;return this.x=a*Math.sin(r),this.y=Math.cos(n)*e,this.z=a*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,r){return this.x=e*Math.sin(n),this.y=r,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),a=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=r,this.z=a,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,r=Math.sqrt(1-n*n);return this.x=r*Math.cos(e),this.y=n,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Ec=new j,Hp=new Bo;class ko{constructor(e=new j(1/0,1/0,1/0),n=new j(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,r=e.length;n<r;n+=3)this.expandByPoint(ei.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,r=e.count;n<r;n++)this.expandByPoint(ei.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,r=e.length;n<r;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const r=ei.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const u=r.getAttribute("position");if(n===!0&&u!==void 0&&e.isInstancedMesh!==!0)for(let f=0,d=u.count;f<d;f++)e.isMesh===!0?e.getVertexPosition(f,ei):ei.fromBufferAttribute(u,f),ei.applyMatrix4(e.matrixWorld),this.expandByPoint(ei);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ja.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),ja.copy(r.boundingBox)),ja.applyMatrix4(e.matrixWorld),this.union(ja)}const a=e.children;for(let u=0,f=a.length;u<f;u++)this.expandByObject(a[u],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ei),ei.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,r;return e.normal.x>0?(n=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),n<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Co),$a.subVectors(this.max,Co),xs.subVectors(e.a,Co),Ss.subVectors(e.b,Co),ys.subVectors(e.c,Co),or.subVectors(Ss,xs),ar.subVectors(ys,Ss),br.subVectors(xs,ys);let n=[0,-or.z,or.y,0,-ar.z,ar.y,0,-br.z,br.y,or.z,0,-or.x,ar.z,0,-ar.x,br.z,0,-br.x,-or.y,or.x,0,-ar.y,ar.x,0,-br.y,br.x,0];return!Tc(n,xs,Ss,ys,$a)||(n=[1,0,0,0,1,0,0,0,1],!Tc(n,xs,Ss,ys,$a))?!1:(Ka.crossVectors(or,ar),n=[Ka.x,Ka.y,Ka.z],Tc(n,xs,Ss,ys,$a))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ei).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ei).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ri[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ri[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ri[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ri[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ri[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ri[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ri[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ri[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ri),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Ri=[new j,new j,new j,new j,new j,new j,new j,new j],ei=new j,ja=new ko,xs=new j,Ss=new j,ys=new j,or=new j,ar=new j,br=new j,Co=new j,$a=new j,Ka=new j,Dr=new j;function Tc(s,e,n,r,a){for(let u=0,f=s.length-3;u<=f;u+=3){Dr.fromArray(s,u);const d=a.x*Math.abs(Dr.x)+a.y*Math.abs(Dr.y)+a.z*Math.abs(Dr.z),p=e.dot(Dr),m=n.dot(Dr),_=r.dot(Dr);if(Math.max(-Math.max(p,m,_),Math.min(p,m,_))>d)return!1}return!0}const r0=new ko,Po=new j,wc=new j;class Il{constructor(e=new j,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const r=this.center;n!==void 0?r.copy(n):r0.setFromPoints(e).getCenter(r);let a=0;for(let u=0,f=e.length;u<f;u++)a=Math.max(a,r.distanceToSquared(e[u]));return this.radius=Math.sqrt(a),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const r=this.center.distanceToSquared(e);return n.copy(e),r>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Po.subVectors(e,this.center);const n=Po.lengthSq();if(n>this.radius*this.radius){const r=Math.sqrt(n),a=(r-this.radius)*.5;this.center.addScaledVector(Po,a/r),this.radius+=a}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(wc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Po.copy(e.center).add(wc)),this.expandByPoint(Po.copy(e.center).sub(wc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ci=new j,Ac=new j,Za=new j,lr=new j,Rc=new j,Qa=new j,Cc=new j;class Qm{constructor(e=new j,n=new j(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ci)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const r=n.dot(this.direction);return r<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=Ci.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(Ci.copy(this.origin).addScaledVector(this.direction,n),Ci.distanceToSquared(e))}distanceSqToSegment(e,n,r,a){Ac.copy(e).add(n).multiplyScalar(.5),Za.copy(n).sub(e).normalize(),lr.copy(this.origin).sub(Ac);const u=e.distanceTo(n)*.5,f=-this.direction.dot(Za),d=lr.dot(this.direction),p=-lr.dot(Za),m=lr.lengthSq(),_=Math.abs(1-f*f);let S,x,y,w;if(_>0)if(S=f*p-d,x=f*d-p,w=u*_,S>=0)if(x>=-w)if(x<=w){const A=1/_;S*=A,x*=A,y=S*(S+f*x+2*d)+x*(f*S+x+2*p)+m}else x=u,S=Math.max(0,-(f*x+d)),y=-S*S+x*(x+2*p)+m;else x=-u,S=Math.max(0,-(f*x+d)),y=-S*S+x*(x+2*p)+m;else x<=-w?(S=Math.max(0,-(-f*u+d)),x=S>0?-u:Math.min(Math.max(-u,-p),u),y=-S*S+x*(x+2*p)+m):x<=w?(S=0,x=Math.min(Math.max(-u,-p),u),y=x*(x+2*p)+m):(S=Math.max(0,-(f*u+d)),x=S>0?u:Math.min(Math.max(-u,-p),u),y=-S*S+x*(x+2*p)+m);else x=f>0?-u:u,S=Math.max(0,-(f*x+d)),y=-S*S+x*(x+2*p)+m;return r&&r.copy(this.origin).addScaledVector(this.direction,S),a&&a.copy(Ac).addScaledVector(Za,x),y}intersectSphere(e,n){Ci.subVectors(e.center,this.origin);const r=Ci.dot(this.direction),a=Ci.dot(Ci)-r*r,u=e.radius*e.radius;if(a>u)return null;const f=Math.sqrt(u-a),d=r-f,p=r+f;return p<0?null:d<0?this.at(p,n):this.at(d,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/n;return r>=0?r:null}intersectPlane(e,n){const r=this.distanceToPlane(e);return r===null?null:this.at(r,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let r,a,u,f,d,p;const m=1/this.direction.x,_=1/this.direction.y,S=1/this.direction.z,x=this.origin;return m>=0?(r=(e.min.x-x.x)*m,a=(e.max.x-x.x)*m):(r=(e.max.x-x.x)*m,a=(e.min.x-x.x)*m),_>=0?(u=(e.min.y-x.y)*_,f=(e.max.y-x.y)*_):(u=(e.max.y-x.y)*_,f=(e.min.y-x.y)*_),r>f||u>a||((u>r||isNaN(r))&&(r=u),(f<a||isNaN(a))&&(a=f),S>=0?(d=(e.min.z-x.z)*S,p=(e.max.z-x.z)*S):(d=(e.max.z-x.z)*S,p=(e.min.z-x.z)*S),r>p||d>a)||((d>r||r!==r)&&(r=d),(p<a||a!==a)&&(a=p),a<0)?null:this.at(r>=0?r:a,n)}intersectsBox(e){return this.intersectBox(e,Ci)!==null}intersectTriangle(e,n,r,a,u){Rc.subVectors(n,e),Qa.subVectors(r,e),Cc.crossVectors(Rc,Qa);let f=this.direction.dot(Cc),d;if(f>0){if(a)return null;d=1}else if(f<0)d=-1,f=-f;else return null;lr.subVectors(this.origin,e);const p=d*this.direction.dot(Qa.crossVectors(lr,Qa));if(p<0)return null;const m=d*this.direction.dot(Rc.cross(lr));if(m<0||p+m>f)return null;const _=-d*lr.dot(Cc);return _<0?null:this.at(_/f,u)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ot{constructor(e,n,r,a,u,f,d,p,m,_,S,x,y,w,A,g){Ot.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,r,a,u,f,d,p,m,_,S,x,y,w,A,g)}set(e,n,r,a,u,f,d,p,m,_,S,x,y,w,A,g){const v=this.elements;return v[0]=e,v[4]=n,v[8]=r,v[12]=a,v[1]=u,v[5]=f,v[9]=d,v[13]=p,v[2]=m,v[6]=_,v[10]=S,v[14]=x,v[3]=y,v[7]=w,v[11]=A,v[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ot().fromArray(this.elements)}copy(e){const n=this.elements,r=e.elements;return n[0]=r[0],n[1]=r[1],n[2]=r[2],n[3]=r[3],n[4]=r[4],n[5]=r[5],n[6]=r[6],n[7]=r[7],n[8]=r[8],n[9]=r[9],n[10]=r[10],n[11]=r[11],n[12]=r[12],n[13]=r[13],n[14]=r[14],n[15]=r[15],this}copyPosition(e){const n=this.elements,r=e.elements;return n[12]=r[12],n[13]=r[13],n[14]=r[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,r){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,n,r){return this.set(e.x,n.x,r.x,0,e.y,n.y,r.y,0,e.z,n.z,r.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,r=e.elements,a=1/Ms.setFromMatrixColumn(e,0).length(),u=1/Ms.setFromMatrixColumn(e,1).length(),f=1/Ms.setFromMatrixColumn(e,2).length();return n[0]=r[0]*a,n[1]=r[1]*a,n[2]=r[2]*a,n[3]=0,n[4]=r[4]*u,n[5]=r[5]*u,n[6]=r[6]*u,n[7]=0,n[8]=r[8]*f,n[9]=r[9]*f,n[10]=r[10]*f,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,r=e.x,a=e.y,u=e.z,f=Math.cos(r),d=Math.sin(r),p=Math.cos(a),m=Math.sin(a),_=Math.cos(u),S=Math.sin(u);if(e.order==="XYZ"){const x=f*_,y=f*S,w=d*_,A=d*S;n[0]=p*_,n[4]=-p*S,n[8]=m,n[1]=y+w*m,n[5]=x-A*m,n[9]=-d*p,n[2]=A-x*m,n[6]=w+y*m,n[10]=f*p}else if(e.order==="YXZ"){const x=p*_,y=p*S,w=m*_,A=m*S;n[0]=x+A*d,n[4]=w*d-y,n[8]=f*m,n[1]=f*S,n[5]=f*_,n[9]=-d,n[2]=y*d-w,n[6]=A+x*d,n[10]=f*p}else if(e.order==="ZXY"){const x=p*_,y=p*S,w=m*_,A=m*S;n[0]=x-A*d,n[4]=-f*S,n[8]=w+y*d,n[1]=y+w*d,n[5]=f*_,n[9]=A-x*d,n[2]=-f*m,n[6]=d,n[10]=f*p}else if(e.order==="ZYX"){const x=f*_,y=f*S,w=d*_,A=d*S;n[0]=p*_,n[4]=w*m-y,n[8]=x*m+A,n[1]=p*S,n[5]=A*m+x,n[9]=y*m-w,n[2]=-m,n[6]=d*p,n[10]=f*p}else if(e.order==="YZX"){const x=f*p,y=f*m,w=d*p,A=d*m;n[0]=p*_,n[4]=A-x*S,n[8]=w*S+y,n[1]=S,n[5]=f*_,n[9]=-d*_,n[2]=-m*_,n[6]=y*S+w,n[10]=x-A*S}else if(e.order==="XZY"){const x=f*p,y=f*m,w=d*p,A=d*m;n[0]=p*_,n[4]=-S,n[8]=m*_,n[1]=x*S+A,n[5]=f*_,n[9]=y*S-w,n[2]=w*S-y,n[6]=d*_,n[10]=A*S+x}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(s0,e,o0)}lookAt(e,n,r){const a=this.elements;return In.subVectors(e,n),In.lengthSq()===0&&(In.z=1),In.normalize(),ur.crossVectors(r,In),ur.lengthSq()===0&&(Math.abs(r.z)===1?In.x+=1e-4:In.z+=1e-4,In.normalize(),ur.crossVectors(r,In)),ur.normalize(),Ja.crossVectors(In,ur),a[0]=ur.x,a[4]=Ja.x,a[8]=In.x,a[1]=ur.y,a[5]=Ja.y,a[9]=In.y,a[2]=ur.z,a[6]=Ja.z,a[10]=In.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const r=e.elements,a=n.elements,u=this.elements,f=r[0],d=r[4],p=r[8],m=r[12],_=r[1],S=r[5],x=r[9],y=r[13],w=r[2],A=r[6],g=r[10],v=r[14],b=r[3],P=r[7],L=r[11],X=r[15],F=a[0],I=a[4],H=a[8],re=a[12],M=a[1],C=a[5],q=a[9],Z=a[13],ae=a[2],de=a[6],ne=a[10],le=a[14],k=a[3],ce=a[7],oe=a[11],N=a[15];return u[0]=f*F+d*M+p*ae+m*k,u[4]=f*I+d*C+p*de+m*ce,u[8]=f*H+d*q+p*ne+m*oe,u[12]=f*re+d*Z+p*le+m*N,u[1]=_*F+S*M+x*ae+y*k,u[5]=_*I+S*C+x*de+y*ce,u[9]=_*H+S*q+x*ne+y*oe,u[13]=_*re+S*Z+x*le+y*N,u[2]=w*F+A*M+g*ae+v*k,u[6]=w*I+A*C+g*de+v*ce,u[10]=w*H+A*q+g*ne+v*oe,u[14]=w*re+A*Z+g*le+v*N,u[3]=b*F+P*M+L*ae+X*k,u[7]=b*I+P*C+L*de+X*ce,u[11]=b*H+P*q+L*ne+X*oe,u[15]=b*re+P*Z+L*le+X*N,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],r=e[4],a=e[8],u=e[12],f=e[1],d=e[5],p=e[9],m=e[13],_=e[2],S=e[6],x=e[10],y=e[14],w=e[3],A=e[7],g=e[11],v=e[15];return w*(+u*p*S-a*m*S-u*d*x+r*m*x+a*d*y-r*p*y)+A*(+n*p*y-n*m*x+u*f*x-a*f*y+a*m*_-u*p*_)+g*(+n*m*S-n*d*y-u*f*S+r*f*y+u*d*_-r*m*_)+v*(-a*d*_-n*p*S+n*d*x+a*f*S-r*f*x+r*p*_)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,r){const a=this.elements;return e.isVector3?(a[12]=e.x,a[13]=e.y,a[14]=e.z):(a[12]=e,a[13]=n,a[14]=r),this}invert(){const e=this.elements,n=e[0],r=e[1],a=e[2],u=e[3],f=e[4],d=e[5],p=e[6],m=e[7],_=e[8],S=e[9],x=e[10],y=e[11],w=e[12],A=e[13],g=e[14],v=e[15],b=S*g*m-A*x*m+A*p*y-d*g*y-S*p*v+d*x*v,P=w*x*m-_*g*m-w*p*y+f*g*y+_*p*v-f*x*v,L=_*A*m-w*S*m+w*d*y-f*A*y-_*d*v+f*S*v,X=w*S*p-_*A*p-w*d*x+f*A*x+_*d*g-f*S*g,F=n*b+r*P+a*L+u*X;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/F;return e[0]=b*I,e[1]=(A*x*u-S*g*u-A*a*y+r*g*y+S*a*v-r*x*v)*I,e[2]=(d*g*u-A*p*u+A*a*m-r*g*m-d*a*v+r*p*v)*I,e[3]=(S*p*u-d*x*u-S*a*m+r*x*m+d*a*y-r*p*y)*I,e[4]=P*I,e[5]=(_*g*u-w*x*u+w*a*y-n*g*y-_*a*v+n*x*v)*I,e[6]=(w*p*u-f*g*u-w*a*m+n*g*m+f*a*v-n*p*v)*I,e[7]=(f*x*u-_*p*u+_*a*m-n*x*m-f*a*y+n*p*y)*I,e[8]=L*I,e[9]=(w*S*u-_*A*u-w*r*y+n*A*y+_*r*v-n*S*v)*I,e[10]=(f*A*u-w*d*u+w*r*m-n*A*m-f*r*v+n*d*v)*I,e[11]=(_*d*u-f*S*u-_*r*m+n*S*m+f*r*y-n*d*y)*I,e[12]=X*I,e[13]=(_*A*a-w*S*a+w*r*x-n*A*x-_*r*g+n*S*g)*I,e[14]=(w*d*a-f*A*a-w*r*p+n*A*p+f*r*g-n*d*g)*I,e[15]=(f*S*a-_*d*a+_*r*p-n*S*p-f*r*x+n*d*x)*I,this}scale(e){const n=this.elements,r=e.x,a=e.y,u=e.z;return n[0]*=r,n[4]*=a,n[8]*=u,n[1]*=r,n[5]*=a,n[9]*=u,n[2]*=r,n[6]*=a,n[10]*=u,n[3]*=r,n[7]*=a,n[11]*=u,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],a=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,r,a))}makeTranslation(e,n,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,r,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,n,-r,0,0,r,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),r=Math.sin(e);return this.set(n,0,r,0,0,1,0,0,-r,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),r=Math.sin(e);return this.set(n,-r,0,0,r,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const r=Math.cos(n),a=Math.sin(n),u=1-r,f=e.x,d=e.y,p=e.z,m=u*f,_=u*d;return this.set(m*f+r,m*d-a*p,m*p+a*d,0,m*d+a*p,_*d+r,_*p-a*f,0,m*p-a*d,_*p+a*f,u*p*p+r,0,0,0,0,1),this}makeScale(e,n,r){return this.set(e,0,0,0,0,n,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,n,r,a,u,f){return this.set(1,r,u,0,e,1,f,0,n,a,1,0,0,0,0,1),this}compose(e,n,r){const a=this.elements,u=n._x,f=n._y,d=n._z,p=n._w,m=u+u,_=f+f,S=d+d,x=u*m,y=u*_,w=u*S,A=f*_,g=f*S,v=d*S,b=p*m,P=p*_,L=p*S,X=r.x,F=r.y,I=r.z;return a[0]=(1-(A+v))*X,a[1]=(y+L)*X,a[2]=(w-P)*X,a[3]=0,a[4]=(y-L)*F,a[5]=(1-(x+v))*F,a[6]=(g+b)*F,a[7]=0,a[8]=(w+P)*I,a[9]=(g-b)*I,a[10]=(1-(x+A))*I,a[11]=0,a[12]=e.x,a[13]=e.y,a[14]=e.z,a[15]=1,this}decompose(e,n,r){const a=this.elements;let u=Ms.set(a[0],a[1],a[2]).length();const f=Ms.set(a[4],a[5],a[6]).length(),d=Ms.set(a[8],a[9],a[10]).length();this.determinant()<0&&(u=-u),e.x=a[12],e.y=a[13],e.z=a[14],ti.copy(this);const m=1/u,_=1/f,S=1/d;return ti.elements[0]*=m,ti.elements[1]*=m,ti.elements[2]*=m,ti.elements[4]*=_,ti.elements[5]*=_,ti.elements[6]*=_,ti.elements[8]*=S,ti.elements[9]*=S,ti.elements[10]*=S,n.setFromRotationMatrix(ti),r.x=u,r.y=f,r.z=d,this}makePerspective(e,n,r,a,u,f,d=Fi){const p=this.elements,m=2*u/(n-e),_=2*u/(r-a),S=(n+e)/(n-e),x=(r+a)/(r-a);let y,w;if(d===Fi)y=-(f+u)/(f-u),w=-2*f*u/(f-u);else if(d===Rl)y=-f/(f-u),w=-f*u/(f-u);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return p[0]=m,p[4]=0,p[8]=S,p[12]=0,p[1]=0,p[5]=_,p[9]=x,p[13]=0,p[2]=0,p[6]=0,p[10]=y,p[14]=w,p[3]=0,p[7]=0,p[11]=-1,p[15]=0,this}makeOrthographic(e,n,r,a,u,f,d=Fi){const p=this.elements,m=1/(n-e),_=1/(r-a),S=1/(f-u),x=(n+e)*m,y=(r+a)*_;let w,A;if(d===Fi)w=(f+u)*S,A=-2*S;else if(d===Rl)w=u*S,A=-1*S;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return p[0]=2*m,p[4]=0,p[8]=0,p[12]=-x,p[1]=0,p[5]=2*_,p[9]=0,p[13]=-y,p[2]=0,p[6]=0,p[10]=A,p[14]=-w,p[3]=0,p[7]=0,p[11]=0,p[15]=1,this}equals(e){const n=this.elements,r=e.elements;for(let a=0;a<16;a++)if(n[a]!==r[a])return!1;return!0}fromArray(e,n=0){for(let r=0;r<16;r++)this.elements[r]=e[r+n];return this}toArray(e=[],n=0){const r=this.elements;return e[n]=r[0],e[n+1]=r[1],e[n+2]=r[2],e[n+3]=r[3],e[n+4]=r[4],e[n+5]=r[5],e[n+6]=r[6],e[n+7]=r[7],e[n+8]=r[8],e[n+9]=r[9],e[n+10]=r[10],e[n+11]=r[11],e[n+12]=r[12],e[n+13]=r[13],e[n+14]=r[14],e[n+15]=r[15],e}}const Ms=new j,ti=new Ot,s0=new j(0,0,0),o0=new j(1,1,1),ur=new j,Ja=new j,In=new j,Vp=new Ot,Gp=new Bo;class mi{constructor(e=0,n=0,r=0,a=mi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=r,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,r,a=this._order){return this._x=e,this._y=n,this._z=r,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,r=!0){const a=e.elements,u=a[0],f=a[4],d=a[8],p=a[1],m=a[5],_=a[9],S=a[2],x=a[6],y=a[10];switch(n){case"XYZ":this._y=Math.asin(Tn(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-_,y),this._z=Math.atan2(-f,u)):(this._x=Math.atan2(x,m),this._z=0);break;case"YXZ":this._x=Math.asin(-Tn(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(d,y),this._z=Math.atan2(p,m)):(this._y=Math.atan2(-S,u),this._z=0);break;case"ZXY":this._x=Math.asin(Tn(x,-1,1)),Math.abs(x)<.9999999?(this._y=Math.atan2(-S,y),this._z=Math.atan2(-f,m)):(this._y=0,this._z=Math.atan2(p,u));break;case"ZYX":this._y=Math.asin(-Tn(S,-1,1)),Math.abs(S)<.9999999?(this._x=Math.atan2(x,y),this._z=Math.atan2(p,u)):(this._x=0,this._z=Math.atan2(-f,m));break;case"YZX":this._z=Math.asin(Tn(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(-_,m),this._y=Math.atan2(-S,u)):(this._x=0,this._y=Math.atan2(d,y));break;case"XZY":this._z=Math.asin(-Tn(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(x,m),this._y=Math.atan2(d,u)):(this._x=Math.atan2(-_,y),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,r){return Vp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Vp,n,r)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return Gp.setFromEuler(this),this.setFromQuaternion(Gp,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}mi.DEFAULT_ORDER="XYZ";class Jm{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let a0=0;const Wp=new j,Es=new Bo,Pi=new Ot,el=new j,Lo=new j,l0=new j,u0=new Bo,Xp=new j(1,0,0),Yp=new j(0,1,0),qp=new j(0,0,1),jp={type:"added"},c0={type:"removed"},Ts={type:"childadded",child:null},Pc={type:"childremoved",child:null};class sn extends Hs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:a0++}),this.uuid=Oo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=sn.DEFAULT_UP.clone();const e=new j,n=new mi,r=new Bo,a=new j(1,1,1);function u(){r.setFromEuler(n,!1)}function f(){n.setFromQuaternion(r,void 0,!1)}n._onChange(u),r._onChange(f),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new Ot},normalMatrix:{value:new rt}}),this.matrix=new Ot,this.matrixWorld=new Ot,this.matrixAutoUpdate=sn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=sn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Jm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return Es.setFromAxisAngle(e,n),this.quaternion.multiply(Es),this}rotateOnWorldAxis(e,n){return Es.setFromAxisAngle(e,n),this.quaternion.premultiply(Es),this}rotateX(e){return this.rotateOnAxis(Xp,e)}rotateY(e){return this.rotateOnAxis(Yp,e)}rotateZ(e){return this.rotateOnAxis(qp,e)}translateOnAxis(e,n){return Wp.copy(e).applyQuaternion(this.quaternion),this.position.add(Wp.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(Xp,e)}translateY(e){return this.translateOnAxis(Yp,e)}translateZ(e){return this.translateOnAxis(qp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Pi.copy(this.matrixWorld).invert())}lookAt(e,n,r){e.isVector3?el.copy(e):el.set(e,n,r);const a=this.parent;this.updateWorldMatrix(!0,!1),Lo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Pi.lookAt(Lo,el,this.up):Pi.lookAt(el,Lo,this.up),this.quaternion.setFromRotationMatrix(Pi),a&&(Pi.extractRotation(a.matrixWorld),Es.setFromRotationMatrix(Pi),this.quaternion.premultiply(Es.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(jp),Ts.child=e,this.dispatchEvent(Ts),Ts.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(c0),Pc.child=e,this.dispatchEvent(Pc),Pc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Pi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Pi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Pi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(jp),Ts.child=e,this.dispatchEvent(Ts),Ts.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let r=0,a=this.children.length;r<a;r++){const f=this.children[r].getObjectByProperty(e,n);if(f!==void 0)return f}}getObjectsByProperty(e,n,r=[]){this[e]===n&&r.push(this);const a=this.children;for(let u=0,f=a.length;u<f;u++)a[u].getObjectsByProperty(e,n,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Lo,e,l0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Lo,u0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].updateMatrixWorld(e)}updateWorldMatrix(e,n){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const a=this.children;for(let u=0,f=a.length;u<f;u++)a[u].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",r={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.visibility=this._visibility,a.active=this._active,a.bounds=this._bounds.map(d=>({boxInitialized:d.boxInitialized,boxMin:d.box.min.toArray(),boxMax:d.box.max.toArray(),sphereInitialized:d.sphereInitialized,sphereRadius:d.sphere.radius,sphereCenter:d.sphere.center.toArray()})),a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.geometryCount=this._geometryCount,a.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(a.boundingSphere={center:a.boundingSphere.center.toArray(),radius:a.boundingSphere.radius}),this.boundingBox!==null&&(a.boundingBox={min:a.boundingBox.min.toArray(),max:a.boundingBox.max.toArray()}));function u(d,p){return d[p.uuid]===void 0&&(d[p.uuid]=p.toJSON(e)),p.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=u(e.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const p=d.shapes;if(Array.isArray(p))for(let m=0,_=p.length;m<_;m++){const S=p[m];u(e.shapes,S)}else u(e.shapes,p)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(u(e.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let p=0,m=this.material.length;p<m;p++)d.push(u(e.materials,this.material[p]));a.material=d}else a.material=u(e.materials,this.material);if(this.children.length>0){a.children=[];for(let d=0;d<this.children.length;d++)a.children.push(this.children[d].toJSON(e).object)}if(this.animations.length>0){a.animations=[];for(let d=0;d<this.animations.length;d++){const p=this.animations[d];a.animations.push(u(e.animations,p))}}if(n){const d=f(e.geometries),p=f(e.materials),m=f(e.textures),_=f(e.images),S=f(e.shapes),x=f(e.skeletons),y=f(e.animations),w=f(e.nodes);d.length>0&&(r.geometries=d),p.length>0&&(r.materials=p),m.length>0&&(r.textures=m),_.length>0&&(r.images=_),S.length>0&&(r.shapes=S),x.length>0&&(r.skeletons=x),y.length>0&&(r.animations=y),w.length>0&&(r.nodes=w)}return r.object=a,r;function f(d){const p=[];for(const m in d){const _=d[m];delete _.metadata,p.push(_)}return p}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let r=0;r<e.children.length;r++){const a=e.children[r];this.add(a.clone())}return this}}sn.DEFAULT_UP=new j(0,1,0);sn.DEFAULT_MATRIX_AUTO_UPDATE=!0;sn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const ni=new j,Li=new j,Lc=new j,bi=new j,ws=new j,As=new j,$p=new j,bc=new j,Dc=new j,Ic=new j,Uc=new kt,Nc=new kt,Fc=new kt;class ri{constructor(e=new j,n=new j,r=new j){this.a=e,this.b=n,this.c=r}static getNormal(e,n,r,a){a.subVectors(r,n),ni.subVectors(e,n),a.cross(ni);const u=a.lengthSq();return u>0?a.multiplyScalar(1/Math.sqrt(u)):a.set(0,0,0)}static getBarycoord(e,n,r,a,u){ni.subVectors(a,n),Li.subVectors(r,n),Lc.subVectors(e,n);const f=ni.dot(ni),d=ni.dot(Li),p=ni.dot(Lc),m=Li.dot(Li),_=Li.dot(Lc),S=f*m-d*d;if(S===0)return u.set(0,0,0),null;const x=1/S,y=(m*p-d*_)*x,w=(f*_-d*p)*x;return u.set(1-y-w,w,y)}static containsPoint(e,n,r,a){return this.getBarycoord(e,n,r,a,bi)===null?!1:bi.x>=0&&bi.y>=0&&bi.x+bi.y<=1}static getInterpolation(e,n,r,a,u,f,d,p){return this.getBarycoord(e,n,r,a,bi)===null?(p.x=0,p.y=0,"z"in p&&(p.z=0),"w"in p&&(p.w=0),null):(p.setScalar(0),p.addScaledVector(u,bi.x),p.addScaledVector(f,bi.y),p.addScaledVector(d,bi.z),p)}static getInterpolatedAttribute(e,n,r,a,u,f){return Uc.setScalar(0),Nc.setScalar(0),Fc.setScalar(0),Uc.fromBufferAttribute(e,n),Nc.fromBufferAttribute(e,r),Fc.fromBufferAttribute(e,a),f.setScalar(0),f.addScaledVector(Uc,u.x),f.addScaledVector(Nc,u.y),f.addScaledVector(Fc,u.z),f}static isFrontFacing(e,n,r,a){return ni.subVectors(r,n),Li.subVectors(e,n),ni.cross(Li).dot(a)<0}set(e,n,r){return this.a.copy(e),this.b.copy(n),this.c.copy(r),this}setFromPointsAndIndices(e,n,r,a){return this.a.copy(e[n]),this.b.copy(e[r]),this.c.copy(e[a]),this}setFromAttributeAndIndices(e,n,r,a){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,a),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ni.subVectors(this.c,this.b),Li.subVectors(this.a,this.b),ni.cross(Li).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ri.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return ri.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,r,a,u){return ri.getInterpolation(e,this.a,this.b,this.c,n,r,a,u)}containsPoint(e){return ri.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ri.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const r=this.a,a=this.b,u=this.c;let f,d;ws.subVectors(a,r),As.subVectors(u,r),bc.subVectors(e,r);const p=ws.dot(bc),m=As.dot(bc);if(p<=0&&m<=0)return n.copy(r);Dc.subVectors(e,a);const _=ws.dot(Dc),S=As.dot(Dc);if(_>=0&&S<=_)return n.copy(a);const x=p*S-_*m;if(x<=0&&p>=0&&_<=0)return f=p/(p-_),n.copy(r).addScaledVector(ws,f);Ic.subVectors(e,u);const y=ws.dot(Ic),w=As.dot(Ic);if(w>=0&&y<=w)return n.copy(u);const A=y*m-p*w;if(A<=0&&m>=0&&w<=0)return d=m/(m-w),n.copy(r).addScaledVector(As,d);const g=_*w-y*S;if(g<=0&&S-_>=0&&y-w>=0)return $p.subVectors(u,a),d=(S-_)/(S-_+(y-w)),n.copy(a).addScaledVector($p,d);const v=1/(g+A+x);return f=A*v,d=x*v,n.copy(r).addScaledVector(ws,f).addScaledVector(As,d)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const eg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},cr={h:0,s:0,l:0},tl={h:0,s:0,l:0};function Oc(s,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?s+(e-s)*6*n:n<1/2?e:n<2/3?s+(e-s)*6*(2/3-n):s}class ct{constructor(e,n,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,r)}set(e,n,r){if(n===void 0&&r===void 0){const a=e;a&&a.isColor?this.copy(a):typeof a=="number"?this.setHex(a):typeof a=="string"&&this.setStyle(a)}else this.setRGB(e,n,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=di){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Mt.toWorkingColorSpace(this,n),this}setRGB(e,n,r,a=Mt.workingColorSpace){return this.r=e,this.g=n,this.b=r,Mt.toWorkingColorSpace(this,a),this}setHSL(e,n,r,a=Mt.workingColorSpace){if(e=qv(e,1),n=Tn(n,0,1),r=Tn(r,0,1),n===0)this.r=this.g=this.b=r;else{const u=r<=.5?r*(1+n):r+n-r*n,f=2*r-u;this.r=Oc(f,u,e+1/3),this.g=Oc(f,u,e),this.b=Oc(f,u,e-1/3)}return Mt.toWorkingColorSpace(this,a),this}setStyle(e,n=di){function r(u){u!==void 0&&parseFloat(u)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let a;if(a=/^(\w+)\(([^\)]*)\)/.exec(e)){let u;const f=a[1],d=a[2];switch(f){case"rgb":case"rgba":if(u=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(u[4]),this.setRGB(Math.min(255,parseInt(u[1],10))/255,Math.min(255,parseInt(u[2],10))/255,Math.min(255,parseInt(u[3],10))/255,n);if(u=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(u[4]),this.setRGB(Math.min(100,parseInt(u[1],10))/100,Math.min(100,parseInt(u[2],10))/100,Math.min(100,parseInt(u[3],10))/100,n);break;case"hsl":case"hsla":if(u=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(u[4]),this.setHSL(parseFloat(u[1])/360,parseFloat(u[2])/100,parseFloat(u[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(a=/^\#([A-Fa-f\d]+)$/.exec(e)){const u=a[1],f=u.length;if(f===3)return this.setRGB(parseInt(u.charAt(0),16)/15,parseInt(u.charAt(1),16)/15,parseInt(u.charAt(2),16)/15,n);if(f===6)return this.setHex(parseInt(u,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=di){const r=eg[e.toLowerCase()];return r!==void 0?this.setHex(r,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Us(e.r),this.g=Us(e.g),this.b=Us(e.b),this}copyLinearToSRGB(e){return this.r=yc(e.r),this.g=yc(e.g),this.b=yc(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=di){return Mt.fromWorkingColorSpace(hn.copy(this),e),Math.round(Tn(hn.r*255,0,255))*65536+Math.round(Tn(hn.g*255,0,255))*256+Math.round(Tn(hn.b*255,0,255))}getHexString(e=di){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=Mt.workingColorSpace){Mt.fromWorkingColorSpace(hn.copy(this),n);const r=hn.r,a=hn.g,u=hn.b,f=Math.max(r,a,u),d=Math.min(r,a,u);let p,m;const _=(d+f)/2;if(d===f)p=0,m=0;else{const S=f-d;switch(m=_<=.5?S/(f+d):S/(2-f-d),f){case r:p=(a-u)/S+(a<u?6:0);break;case a:p=(u-r)/S+2;break;case u:p=(r-a)/S+4;break}p/=6}return e.h=p,e.s=m,e.l=_,e}getRGB(e,n=Mt.workingColorSpace){return Mt.fromWorkingColorSpace(hn.copy(this),n),e.r=hn.r,e.g=hn.g,e.b=hn.b,e}getStyle(e=di){Mt.fromWorkingColorSpace(hn.copy(this),e);const n=hn.r,r=hn.g,a=hn.b;return e!==di?`color(${e} ${n.toFixed(3)} ${r.toFixed(3)} ${a.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(r*255)},${Math.round(a*255)})`}offsetHSL(e,n,r){return this.getHSL(cr),this.setHSL(cr.h+e,cr.s+n,cr.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,r){return this.r=e.r+(n.r-e.r)*r,this.g=e.g+(n.g-e.g)*r,this.b=e.b+(n.b-e.b)*r,this}lerpHSL(e,n){this.getHSL(cr),e.getHSL(tl);const r=xc(cr.h,tl.h,n),a=xc(cr.s,tl.s,n),u=xc(cr.l,tl.l,n);return this.setHSL(r,a,u),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,r=this.g,a=this.b,u=e.elements;return this.r=u[0]*n+u[3]*r+u[6]*a,this.g=u[1]*n+u[4]*r+u[7]*a,this.b=u[2]*n+u[5]*r+u[8]*a,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const hn=new ct;ct.NAMES=eg;let f0=0;class Vs extends Hs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:f0++}),this.uuid=Oo(),this.name="",this.type="Material",this.blending=Ds,this.side=mr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Zc,this.blendDst=Qc,this.blendEquation=kr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ct(0,0,0),this.blendAlpha=0,this.depthFunc=Ns,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Np,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=_s,this.stencilZFail=_s,this.stencilZPass=_s,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const r=e[n];if(r===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const a=this[n];if(a===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}a&&a.isColor?a.set(r):a&&a.isVector3&&r&&r.isVector3?a.copy(r):this[n]=r}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const r={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==Ds&&(r.blending=this.blending),this.side!==mr&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==Zc&&(r.blendSrc=this.blendSrc),this.blendDst!==Qc&&(r.blendDst=this.blendDst),this.blendEquation!==kr&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==Ns&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Np&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==_s&&(r.stencilFail=this.stencilFail),this.stencilZFail!==_s&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==_s&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function a(u){const f=[];for(const d in u){const p=u[d];delete p.metadata,f.push(p)}return f}if(n){const u=a(e.textures),f=a(e.images);u.length>0&&(r.textures=u),f.length>0&&(r.images=f)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let r=null;if(n!==null){const a=n.length;r=new Array(a);for(let u=0;u!==a;++u)r[u]=n[u].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class tg extends Vs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ct(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new mi,this.combine=Nm,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Vt=new j,nl=new pt;class pi{constructor(e,n,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=r,this.usage=Fp,this.updateRanges=[],this.gpuType=Ni,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,r){e*=this.itemSize,r*=n.itemSize;for(let a=0,u=this.itemSize;a<u;a++)this.array[e+a]=n.array[r+a];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,r=this.count;n<r;n++)nl.fromBufferAttribute(this,n),nl.applyMatrix3(e),this.setXY(n,nl.x,nl.y);else if(this.itemSize===3)for(let n=0,r=this.count;n<r;n++)Vt.fromBufferAttribute(this,n),Vt.applyMatrix3(e),this.setXYZ(n,Vt.x,Vt.y,Vt.z);return this}applyMatrix4(e){for(let n=0,r=this.count;n<r;n++)Vt.fromBufferAttribute(this,n),Vt.applyMatrix4(e),this.setXYZ(n,Vt.x,Vt.y,Vt.z);return this}applyNormalMatrix(e){for(let n=0,r=this.count;n<r;n++)Vt.fromBufferAttribute(this,n),Vt.applyNormalMatrix(e),this.setXYZ(n,Vt.x,Vt.y,Vt.z);return this}transformDirection(e){for(let n=0,r=this.count;n<r;n++)Vt.fromBufferAttribute(this,n),Vt.transformDirection(e),this.setXYZ(n,Vt.x,Vt.y,Vt.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let r=this.array[e*this.itemSize+n];return this.normalized&&(r=Ao(r,this.array)),r}setComponent(e,n,r){return this.normalized&&(r=En(r,this.array)),this.array[e*this.itemSize+n]=r,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=Ao(n,this.array)),n}setX(e,n){return this.normalized&&(n=En(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=Ao(n,this.array)),n}setY(e,n){return this.normalized&&(n=En(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=Ao(n,this.array)),n}setZ(e,n){return this.normalized&&(n=En(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=Ao(n,this.array)),n}setW(e,n){return this.normalized&&(n=En(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,r){return e*=this.itemSize,this.normalized&&(n=En(n,this.array),r=En(r,this.array)),this.array[e+0]=n,this.array[e+1]=r,this}setXYZ(e,n,r,a){return e*=this.itemSize,this.normalized&&(n=En(n,this.array),r=En(r,this.array),a=En(a,this.array)),this.array[e+0]=n,this.array[e+1]=r,this.array[e+2]=a,this}setXYZW(e,n,r,a,u){return e*=this.itemSize,this.normalized&&(n=En(n,this.array),r=En(r,this.array),a=En(a,this.array),u=En(u,this.array)),this.array[e+0]=n,this.array[e+1]=r,this.array[e+2]=a,this.array[e+3]=u,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Fp&&(e.usage=this.usage),e}}class ng extends pi{constructor(e,n,r){super(new Uint16Array(e),n,r)}}class ig extends pi{constructor(e,n,r){super(new Uint32Array(e),n,r)}}class on extends pi{constructor(e,n,r){super(new Float32Array(e),n,r)}}let d0=0;const Gn=new Ot,Bc=new sn,Rs=new j,Un=new ko,bo=new ko,Jt=new j;class oi extends Hs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:d0++}),this.uuid=Oo(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new($m(e)?ig:ng)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,r=0){this.groups.push({start:e,count:n,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const u=new rt().getNormalMatrix(e);r.applyNormalMatrix(u),r.needsUpdate=!0}const a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(e),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Gn.makeRotationFromQuaternion(e),this.applyMatrix4(Gn),this}rotateX(e){return Gn.makeRotationX(e),this.applyMatrix4(Gn),this}rotateY(e){return Gn.makeRotationY(e),this.applyMatrix4(Gn),this}rotateZ(e){return Gn.makeRotationZ(e),this.applyMatrix4(Gn),this}translate(e,n,r){return Gn.makeTranslation(e,n,r),this.applyMatrix4(Gn),this}scale(e,n,r){return Gn.makeScale(e,n,r),this.applyMatrix4(Gn),this}lookAt(e){return Bc.lookAt(e),Bc.updateMatrix(),this.applyMatrix4(Bc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Rs).negate(),this.translate(Rs.x,Rs.y,Rs.z),this}setFromPoints(e){const n=[];for(let r=0,a=e.length;r<a;r++){const u=e[r];n.push(u.x,u.y,u.z||0)}return this.setAttribute("position",new on(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ko);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new j(-1/0,-1/0,-1/0),new j(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let r=0,a=n.length;r<a;r++){const u=n[r];Un.setFromBufferAttribute(u),this.morphTargetsRelative?(Jt.addVectors(this.boundingBox.min,Un.min),this.boundingBox.expandByPoint(Jt),Jt.addVectors(this.boundingBox.max,Un.max),this.boundingBox.expandByPoint(Jt)):(this.boundingBox.expandByPoint(Un.min),this.boundingBox.expandByPoint(Un.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Il);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new j,1/0);return}if(e){const r=this.boundingSphere.center;if(Un.setFromBufferAttribute(e),n)for(let u=0,f=n.length;u<f;u++){const d=n[u];bo.setFromBufferAttribute(d),this.morphTargetsRelative?(Jt.addVectors(Un.min,bo.min),Un.expandByPoint(Jt),Jt.addVectors(Un.max,bo.max),Un.expandByPoint(Jt)):(Un.expandByPoint(bo.min),Un.expandByPoint(bo.max))}Un.getCenter(r);let a=0;for(let u=0,f=e.count;u<f;u++)Jt.fromBufferAttribute(e,u),a=Math.max(a,r.distanceToSquared(Jt));if(n)for(let u=0,f=n.length;u<f;u++){const d=n[u],p=this.morphTargetsRelative;for(let m=0,_=d.count;m<_;m++)Jt.fromBufferAttribute(d,m),p&&(Rs.fromBufferAttribute(e,m),Jt.add(Rs)),a=Math.max(a,r.distanceToSquared(Jt))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=n.position,a=n.normal,u=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new pi(new Float32Array(4*r.count),4));const f=this.getAttribute("tangent"),d=[],p=[];for(let H=0;H<r.count;H++)d[H]=new j,p[H]=new j;const m=new j,_=new j,S=new j,x=new pt,y=new pt,w=new pt,A=new j,g=new j;function v(H,re,M){m.fromBufferAttribute(r,H),_.fromBufferAttribute(r,re),S.fromBufferAttribute(r,M),x.fromBufferAttribute(u,H),y.fromBufferAttribute(u,re),w.fromBufferAttribute(u,M),_.sub(m),S.sub(m),y.sub(x),w.sub(x);const C=1/(y.x*w.y-w.x*y.y);isFinite(C)&&(A.copy(_).multiplyScalar(w.y).addScaledVector(S,-y.y).multiplyScalar(C),g.copy(S).multiplyScalar(y.x).addScaledVector(_,-w.x).multiplyScalar(C),d[H].add(A),d[re].add(A),d[M].add(A),p[H].add(g),p[re].add(g),p[M].add(g))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let H=0,re=b.length;H<re;++H){const M=b[H],C=M.start,q=M.count;for(let Z=C,ae=C+q;Z<ae;Z+=3)v(e.getX(Z+0),e.getX(Z+1),e.getX(Z+2))}const P=new j,L=new j,X=new j,F=new j;function I(H){X.fromBufferAttribute(a,H),F.copy(X);const re=d[H];P.copy(re),P.sub(X.multiplyScalar(X.dot(re))).normalize(),L.crossVectors(F,re);const C=L.dot(p[H])<0?-1:1;f.setXYZW(H,P.x,P.y,P.z,C)}for(let H=0,re=b.length;H<re;++H){const M=b[H],C=M.start,q=M.count;for(let Z=C,ae=C+q;Z<ae;Z+=3)I(e.getX(Z+0)),I(e.getX(Z+1)),I(e.getX(Z+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new pi(new Float32Array(n.count*3),3),this.setAttribute("normal",r);else for(let x=0,y=r.count;x<y;x++)r.setXYZ(x,0,0,0);const a=new j,u=new j,f=new j,d=new j,p=new j,m=new j,_=new j,S=new j;if(e)for(let x=0,y=e.count;x<y;x+=3){const w=e.getX(x+0),A=e.getX(x+1),g=e.getX(x+2);a.fromBufferAttribute(n,w),u.fromBufferAttribute(n,A),f.fromBufferAttribute(n,g),_.subVectors(f,u),S.subVectors(a,u),_.cross(S),d.fromBufferAttribute(r,w),p.fromBufferAttribute(r,A),m.fromBufferAttribute(r,g),d.add(_),p.add(_),m.add(_),r.setXYZ(w,d.x,d.y,d.z),r.setXYZ(A,p.x,p.y,p.z),r.setXYZ(g,m.x,m.y,m.z)}else for(let x=0,y=n.count;x<y;x+=3)a.fromBufferAttribute(n,x+0),u.fromBufferAttribute(n,x+1),f.fromBufferAttribute(n,x+2),_.subVectors(f,u),S.subVectors(a,u),_.cross(S),r.setXYZ(x+0,_.x,_.y,_.z),r.setXYZ(x+1,_.x,_.y,_.z),r.setXYZ(x+2,_.x,_.y,_.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,r=e.count;n<r;n++)Jt.fromBufferAttribute(e,n),Jt.normalize(),e.setXYZ(n,Jt.x,Jt.y,Jt.z)}toNonIndexed(){function e(d,p){const m=d.array,_=d.itemSize,S=d.normalized,x=new m.constructor(p.length*_);let y=0,w=0;for(let A=0,g=p.length;A<g;A++){d.isInterleavedBufferAttribute?y=p[A]*d.data.stride+d.offset:y=p[A]*_;for(let v=0;v<_;v++)x[w++]=m[y++]}return new pi(x,_,S)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new oi,r=this.index.array,a=this.attributes;for(const d in a){const p=a[d],m=e(p,r);n.setAttribute(d,m)}const u=this.morphAttributes;for(const d in u){const p=[],m=u[d];for(let _=0,S=m.length;_<S;_++){const x=m[_],y=e(x,r);p.push(y)}n.morphAttributes[d]=p}n.morphTargetsRelative=this.morphTargetsRelative;const f=this.groups;for(let d=0,p=f.length;d<p;d++){const m=f[d];n.addGroup(m.start,m.count,m.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const p=this.parameters;for(const m in p)p[m]!==void 0&&(e[m]=p[m]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const r=this.attributes;for(const p in r){const m=r[p];e.data.attributes[p]=m.toJSON(e.data)}const a={};let u=!1;for(const p in this.morphAttributes){const m=this.morphAttributes[p],_=[];for(let S=0,x=m.length;S<x;S++){const y=m[S];_.push(y.toJSON(e.data))}_.length>0&&(a[p]=_,u=!0)}u&&(e.data.morphAttributes=a,e.data.morphTargetsRelative=this.morphTargetsRelative);const f=this.groups;f.length>0&&(e.data.groups=JSON.parse(JSON.stringify(f)));const d=this.boundingSphere;return d!==null&&(e.data.boundingSphere={center:d.center.toArray(),radius:d.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone(n));const a=e.attributes;for(const m in a){const _=a[m];this.setAttribute(m,_.clone(n))}const u=e.morphAttributes;for(const m in u){const _=[],S=u[m];for(let x=0,y=S.length;x<y;x++)_.push(S[x].clone(n));this.morphAttributes[m]=_}this.morphTargetsRelative=e.morphTargetsRelative;const f=e.groups;for(let m=0,_=f.length;m<_;m++){const S=f[m];this.addGroup(S.start,S.count,S.materialIndex)}const d=e.boundingBox;d!==null&&(this.boundingBox=d.clone());const p=e.boundingSphere;return p!==null&&(this.boundingSphere=p.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Kp=new Ot,Ir=new Qm,il=new Il,Zp=new j,rl=new j,sl=new j,ol=new j,kc=new j,al=new j,Qp=new j,ll=new j;class Yn extends sn{constructor(e=new oi,n=new tg){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,r=Object.keys(n);if(r.length>0){const a=n[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let u=0,f=a.length;u<f;u++){const d=a[u].name||String(u);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=u}}}}getVertexPosition(e,n){const r=this.geometry,a=r.attributes.position,u=r.morphAttributes.position,f=r.morphTargetsRelative;n.fromBufferAttribute(a,e);const d=this.morphTargetInfluences;if(u&&d){al.set(0,0,0);for(let p=0,m=u.length;p<m;p++){const _=d[p],S=u[p];_!==0&&(kc.fromBufferAttribute(S,e),f?al.addScaledVector(kc,_):al.addScaledVector(kc.sub(n),_))}n.add(al)}return n}raycast(e,n){const r=this.geometry,a=this.material,u=this.matrixWorld;a!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),il.copy(r.boundingSphere),il.applyMatrix4(u),Ir.copy(e.ray).recast(e.near),!(il.containsPoint(Ir.origin)===!1&&(Ir.intersectSphere(il,Zp)===null||Ir.origin.distanceToSquared(Zp)>(e.far-e.near)**2))&&(Kp.copy(u).invert(),Ir.copy(e.ray).applyMatrix4(Kp),!(r.boundingBox!==null&&Ir.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,n,Ir)))}_computeIntersections(e,n,r){let a;const u=this.geometry,f=this.material,d=u.index,p=u.attributes.position,m=u.attributes.uv,_=u.attributes.uv1,S=u.attributes.normal,x=u.groups,y=u.drawRange;if(d!==null)if(Array.isArray(f))for(let w=0,A=x.length;w<A;w++){const g=x[w],v=f[g.materialIndex],b=Math.max(g.start,y.start),P=Math.min(d.count,Math.min(g.start+g.count,y.start+y.count));for(let L=b,X=P;L<X;L+=3){const F=d.getX(L),I=d.getX(L+1),H=d.getX(L+2);a=ul(this,v,e,r,m,_,S,F,I,H),a&&(a.faceIndex=Math.floor(L/3),a.face.materialIndex=g.materialIndex,n.push(a))}}else{const w=Math.max(0,y.start),A=Math.min(d.count,y.start+y.count);for(let g=w,v=A;g<v;g+=3){const b=d.getX(g),P=d.getX(g+1),L=d.getX(g+2);a=ul(this,f,e,r,m,_,S,b,P,L),a&&(a.faceIndex=Math.floor(g/3),n.push(a))}}else if(p!==void 0)if(Array.isArray(f))for(let w=0,A=x.length;w<A;w++){const g=x[w],v=f[g.materialIndex],b=Math.max(g.start,y.start),P=Math.min(p.count,Math.min(g.start+g.count,y.start+y.count));for(let L=b,X=P;L<X;L+=3){const F=L,I=L+1,H=L+2;a=ul(this,v,e,r,m,_,S,F,I,H),a&&(a.faceIndex=Math.floor(L/3),a.face.materialIndex=g.materialIndex,n.push(a))}}else{const w=Math.max(0,y.start),A=Math.min(p.count,y.start+y.count);for(let g=w,v=A;g<v;g+=3){const b=g,P=g+1,L=g+2;a=ul(this,f,e,r,m,_,S,b,P,L),a&&(a.faceIndex=Math.floor(g/3),n.push(a))}}}}function h0(s,e,n,r,a,u,f,d){let p;if(e.side===wn?p=r.intersectTriangle(f,u,a,!0,d):p=r.intersectTriangle(a,u,f,e.side===mr,d),p===null)return null;ll.copy(d),ll.applyMatrix4(s.matrixWorld);const m=n.ray.origin.distanceTo(ll);return m<n.near||m>n.far?null:{distance:m,point:ll.clone(),object:s}}function ul(s,e,n,r,a,u,f,d,p,m){s.getVertexPosition(d,rl),s.getVertexPosition(p,sl),s.getVertexPosition(m,ol);const _=h0(s,e,n,r,rl,sl,ol,Qp);if(_){const S=new j;ri.getBarycoord(Qp,rl,sl,ol,S),a&&(_.uv=ri.getInterpolatedAttribute(a,d,p,m,S,new pt)),u&&(_.uv1=ri.getInterpolatedAttribute(u,d,p,m,S,new pt)),f&&(_.normal=ri.getInterpolatedAttribute(f,d,p,m,S,new j),_.normal.dot(r.direction)>0&&_.normal.multiplyScalar(-1));const x={a:d,b:p,c:m,normal:new j,materialIndex:0};ri.getNormal(rl,sl,ol,x.normal),_.face=x,_.barycoord=S}return _}class zo extends oi{constructor(e=1,n=1,r=1,a=1,u=1,f=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:r,widthSegments:a,heightSegments:u,depthSegments:f};const d=this;a=Math.floor(a),u=Math.floor(u),f=Math.floor(f);const p=[],m=[],_=[],S=[];let x=0,y=0;w("z","y","x",-1,-1,r,n,e,f,u,0),w("z","y","x",1,-1,r,n,-e,f,u,1),w("x","z","y",1,1,e,r,n,a,f,2),w("x","z","y",1,-1,e,r,-n,a,f,3),w("x","y","z",1,-1,e,n,r,a,u,4),w("x","y","z",-1,-1,e,n,-r,a,u,5),this.setIndex(p),this.setAttribute("position",new on(m,3)),this.setAttribute("normal",new on(_,3)),this.setAttribute("uv",new on(S,2));function w(A,g,v,b,P,L,X,F,I,H,re){const M=L/I,C=X/H,q=L/2,Z=X/2,ae=F/2,de=I+1,ne=H+1;let le=0,k=0;const ce=new j;for(let oe=0;oe<ne;oe++){const N=oe*C-Z;for(let ie=0;ie<de;ie++){const Ue=ie*M-q;ce[A]=Ue*b,ce[g]=N*P,ce[v]=ae,m.push(ce.x,ce.y,ce.z),ce[A]=0,ce[g]=0,ce[v]=F>0?1:-1,_.push(ce.x,ce.y,ce.z),S.push(ie/I),S.push(1-oe/H),le+=1}}for(let oe=0;oe<H;oe++)for(let N=0;N<I;N++){const ie=x+N+de*oe,Ue=x+N+de*(oe+1),Q=x+(N+1)+de*(oe+1),ue=x+(N+1)+de*oe;p.push(ie,Ue,ue),p.push(Ue,Q,ue),k+=6}d.addGroup(y,k,re),y+=k,x+=le}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zo(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function zs(s){const e={};for(const n in s){e[n]={};for(const r in s[n]){const a=s[n][r];a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)?a.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][r]=null):e[n][r]=a.clone():Array.isArray(a)?e[n][r]=a.slice():e[n][r]=a}}return e}function gn(s){const e={};for(let n=0;n<s.length;n++){const r=zs(s[n]);for(const a in r)e[a]=r[a]}return e}function p0(s){const e=[];for(let n=0;n<s.length;n++)e.push(s[n].clone());return e}function rg(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Mt.workingColorSpace}const m0={clone:zs,merge:gn};var g0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,_0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class gr extends Vs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=g0,this.fragmentShader=_0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=zs(e.uniforms),this.uniformsGroups=p0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const a in this.uniforms){const f=this.uniforms[a].value;f&&f.isTexture?n.uniforms[a]={type:"t",value:f.toJSON(e).uuid}:f&&f.isColor?n.uniforms[a]={type:"c",value:f.getHex()}:f&&f.isVector2?n.uniforms[a]={type:"v2",value:f.toArray()}:f&&f.isVector3?n.uniforms[a]={type:"v3",value:f.toArray()}:f&&f.isVector4?n.uniforms[a]={type:"v4",value:f.toArray()}:f&&f.isMatrix3?n.uniforms[a]={type:"m3",value:f.toArray()}:f&&f.isMatrix4?n.uniforms[a]={type:"m4",value:f.toArray()}:n.uniforms[a]={value:f}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const r={};for(const a in this.extensions)this.extensions[a]===!0&&(r[a]=!0);return Object.keys(r).length>0&&(n.extensions=r),n}}class sg extends sn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ot,this.projectionMatrix=new Ot,this.projectionMatrixInverse=new Ot,this.coordinateSystem=Fi}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const fr=new j,Jp=new pt,em=new pt;class Wn extends sg{constructor(e=50,n=1,r=.1,a=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=a,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=Of*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(vc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Of*2*Math.atan(Math.tan(vc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,r){fr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(fr.x,fr.y).multiplyScalar(-e/fr.z),fr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(fr.x,fr.y).multiplyScalar(-e/fr.z)}getViewSize(e,n){return this.getViewBounds(e,Jp,em),n.subVectors(em,Jp)}setViewOffset(e,n,r,a,u,f){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=r,this.view.offsetY=a,this.view.width=u,this.view.height=f,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(vc*.5*this.fov)/this.zoom,r=2*n,a=this.aspect*r,u=-.5*a;const f=this.view;if(this.view!==null&&this.view.enabled){const p=f.fullWidth,m=f.fullHeight;u+=f.offsetX*a/p,n-=f.offsetY*r/m,a*=f.width/p,r*=f.height/m}const d=this.filmOffset;d!==0&&(u+=e*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(u,u+a,n,n-r,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const Cs=-90,Ps=1;class v0 extends sn{constructor(e,n,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const a=new Wn(Cs,Ps,e,n);a.layers=this.layers,this.add(a);const u=new Wn(Cs,Ps,e,n);u.layers=this.layers,this.add(u);const f=new Wn(Cs,Ps,e,n);f.layers=this.layers,this.add(f);const d=new Wn(Cs,Ps,e,n);d.layers=this.layers,this.add(d);const p=new Wn(Cs,Ps,e,n);p.layers=this.layers,this.add(p);const m=new Wn(Cs,Ps,e,n);m.layers=this.layers,this.add(m)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[r,a,u,f,d,p]=n;for(const m of n)this.remove(m);if(e===Fi)r.up.set(0,1,0),r.lookAt(1,0,0),a.up.set(0,1,0),a.lookAt(-1,0,0),u.up.set(0,0,-1),u.lookAt(0,1,0),f.up.set(0,0,1),f.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),p.up.set(0,1,0),p.lookAt(0,0,-1);else if(e===Rl)r.up.set(0,-1,0),r.lookAt(-1,0,0),a.up.set(0,-1,0),a.lookAt(1,0,0),u.up.set(0,0,1),u.lookAt(0,1,0),f.up.set(0,0,-1),f.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),p.up.set(0,-1,0),p.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const m of n)this.add(m),m.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:a}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[u,f,d,p,m,_]=this.children,S=e.getRenderTarget(),x=e.getActiveCubeFace(),y=e.getActiveMipmapLevel(),w=e.xr.enabled;e.xr.enabled=!1;const A=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,a),e.render(n,u),e.setRenderTarget(r,1,a),e.render(n,f),e.setRenderTarget(r,2,a),e.render(n,d),e.setRenderTarget(r,3,a),e.render(n,p),e.setRenderTarget(r,4,a),e.render(n,m),r.texture.generateMipmaps=A,e.setRenderTarget(r,5,a),e.render(n,_),e.setRenderTarget(S,x,y),e.xr.enabled=w,r.texture.needsPMREMUpdate=!0}}class og extends An{constructor(e,n,r,a,u,f,d,p,m,_){e=e!==void 0?e:[],n=n!==void 0?n:Fs,super(e,n,r,a,u,f,d,p,m,_),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class x0 extends Wr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},a=[r,r,r,r,r,r];this.texture=new og(a,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:ii}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},a=new zo(5,5,5),u=new gr({name:"CubemapFromEquirect",uniforms:zs(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:wn,blending:hr});u.uniforms.tEquirect.value=n;const f=new Yn(a,u),d=n.minFilter;return n.minFilter===Vr&&(n.minFilter=ii),new v0(1,10,this).update(e,f),n.minFilter=d,f.geometry.dispose(),f.material.dispose(),this}clear(e,n,r,a){const u=e.getRenderTarget();for(let f=0;f<6;f++)e.setRenderTarget(this,f),e.clear(n,r,a);e.setRenderTarget(u)}}const zc=new j,S0=new j,y0=new rt;class Or{constructor(e=new j(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,r,a){return this.normal.set(e,n,r),this.constant=a,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,r){const a=zc.subVectors(r,n).cross(S0.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(a,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const r=e.delta(zc),a=this.normal.dot(r);if(a===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const u=-(e.start.dot(this.normal)+this.constant)/a;return u<0||u>1?null:n.copy(e.start).addScaledVector(r,u)}intersectsLine(e){const n=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return n<0&&r>0||r<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const r=n||y0.getNormalMatrix(e),a=this.coplanarPoint(zc).applyMatrix4(e),u=this.normal.applyMatrix3(r).normalize();return this.constant=-a.dot(u),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ur=new Il,cl=new j;class jf{constructor(e=new Or,n=new Or,r=new Or,a=new Or,u=new Or,f=new Or){this.planes=[e,n,r,a,u,f]}set(e,n,r,a,u,f){const d=this.planes;return d[0].copy(e),d[1].copy(n),d[2].copy(r),d[3].copy(a),d[4].copy(u),d[5].copy(f),this}copy(e){const n=this.planes;for(let r=0;r<6;r++)n[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,n=Fi){const r=this.planes,a=e.elements,u=a[0],f=a[1],d=a[2],p=a[3],m=a[4],_=a[5],S=a[6],x=a[7],y=a[8],w=a[9],A=a[10],g=a[11],v=a[12],b=a[13],P=a[14],L=a[15];if(r[0].setComponents(p-u,x-m,g-y,L-v).normalize(),r[1].setComponents(p+u,x+m,g+y,L+v).normalize(),r[2].setComponents(p+f,x+_,g+w,L+b).normalize(),r[3].setComponents(p-f,x-_,g-w,L-b).normalize(),r[4].setComponents(p-d,x-S,g-A,L-P).normalize(),n===Fi)r[5].setComponents(p+d,x+S,g+A,L+P).normalize();else if(n===Rl)r[5].setComponents(d,S,A,P).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ur.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),Ur.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ur)}intersectsSprite(e){return Ur.center.set(0,0,0),Ur.radius=.7071067811865476,Ur.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ur)}intersectsSphere(e){const n=this.planes,r=e.center,a=-e.radius;for(let u=0;u<6;u++)if(n[u].distanceToPoint(r)<a)return!1;return!0}intersectsBox(e){const n=this.planes;for(let r=0;r<6;r++){const a=n[r];if(cl.x=a.normal.x>0?e.max.x:e.min.x,cl.y=a.normal.y>0?e.max.y:e.min.y,cl.z=a.normal.z>0?e.max.z:e.min.z,a.distanceToPoint(cl)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let r=0;r<6;r++)if(n[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function ag(){let s=null,e=!1,n=null,r=null;function a(u,f){n(u,f),r=s.requestAnimationFrame(a)}return{start:function(){e!==!0&&n!==null&&(r=s.requestAnimationFrame(a),e=!0)},stop:function(){s.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(u){n=u},setContext:function(u){s=u}}}function M0(s){const e=new WeakMap;function n(d,p){const m=d.array,_=d.usage,S=m.byteLength,x=s.createBuffer();s.bindBuffer(p,x),s.bufferData(p,m,_),d.onUploadCallback();let y;if(m instanceof Float32Array)y=s.FLOAT;else if(m instanceof Uint16Array)d.isFloat16BufferAttribute?y=s.HALF_FLOAT:y=s.UNSIGNED_SHORT;else if(m instanceof Int16Array)y=s.SHORT;else if(m instanceof Uint32Array)y=s.UNSIGNED_INT;else if(m instanceof Int32Array)y=s.INT;else if(m instanceof Int8Array)y=s.BYTE;else if(m instanceof Uint8Array)y=s.UNSIGNED_BYTE;else if(m instanceof Uint8ClampedArray)y=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+m);return{buffer:x,type:y,bytesPerElement:m.BYTES_PER_ELEMENT,version:d.version,size:S}}function r(d,p,m){const _=p.array,S=p.updateRanges;if(s.bindBuffer(m,d),S.length===0)s.bufferSubData(m,0,_);else{S.sort((y,w)=>y.start-w.start);let x=0;for(let y=1;y<S.length;y++){const w=S[x],A=S[y];A.start<=w.start+w.count+1?w.count=Math.max(w.count,A.start+A.count-w.start):(++x,S[x]=A)}S.length=x+1;for(let y=0,w=S.length;y<w;y++){const A=S[y];s.bufferSubData(m,A.start*_.BYTES_PER_ELEMENT,_,A.start,A.count)}p.clearUpdateRanges()}p.onUploadCallback()}function a(d){return d.isInterleavedBufferAttribute&&(d=d.data),e.get(d)}function u(d){d.isInterleavedBufferAttribute&&(d=d.data);const p=e.get(d);p&&(s.deleteBuffer(p.buffer),e.delete(d))}function f(d,p){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const _=e.get(d);(!_||_.version<d.version)&&e.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const m=e.get(d);if(m===void 0)e.set(d,n(d,p));else if(m.version<d.version){if(m.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(m.buffer,d,p),m.version=d.version}}return{get:a,remove:u,update:f}}class Ho extends oi{constructor(e=1,n=1,r=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:r,heightSegments:a};const u=e/2,f=n/2,d=Math.floor(r),p=Math.floor(a),m=d+1,_=p+1,S=e/d,x=n/p,y=[],w=[],A=[],g=[];for(let v=0;v<_;v++){const b=v*x-f;for(let P=0;P<m;P++){const L=P*S-u;w.push(L,-b,0),A.push(0,0,1),g.push(P/d),g.push(1-v/p)}}for(let v=0;v<p;v++)for(let b=0;b<d;b++){const P=b+m*v,L=b+m*(v+1),X=b+1+m*(v+1),F=b+1+m*v;y.push(P,L,F),y.push(L,X,F)}this.setIndex(y),this.setAttribute("position",new on(w,3)),this.setAttribute("normal",new on(A,3)),this.setAttribute("uv",new on(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ho(e.width,e.height,e.widthSegments,e.heightSegments)}}var E0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,T0=`#ifdef USE_ALPHAHASH
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
#endif`,w0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,A0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,R0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,C0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,P0=`#ifdef USE_AOMAP
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
#endif`,L0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,b0=`#ifdef USE_BATCHING
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
#endif`,D0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,I0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,U0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,N0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,F0=`#ifdef USE_IRIDESCENCE
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
#endif`,O0=`#ifdef USE_BUMPMAP
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
#endif`,B0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,k0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,z0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,H0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,V0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,G0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,W0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,X0=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Y0=`#define PI 3.141592653589793
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
} // validated`,q0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,j0=`vec3 transformedNormal = objectNormal;
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
#endif`,$0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,K0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Z0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Q0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,J0="gl_FragColor = linearToOutputTexel( gl_FragColor );",ex=`
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
}`,tx=`#ifdef USE_ENVMAP
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
#endif`,nx=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ix=`#ifdef USE_ENVMAP
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
#endif`,rx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,sx=`#ifdef USE_ENVMAP
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
#endif`,ox=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ax=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,lx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ux=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cx=`#ifdef USE_GRADIENTMAP
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
}`,fx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,dx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,hx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,px=`uniform bool receiveShadow;
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
#endif`,mx=`#ifdef USE_ENVMAP
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
#endif`,gx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,_x=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,vx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,xx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Sx=`PhysicalMaterial material;
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
#endif`,yx=`struct PhysicalMaterial {
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
}`,Mx=`
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
#endif`,Ex=`#if defined( RE_IndirectDiffuse )
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
#endif`,Tx=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,wx=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ax=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Rx=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cx=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Px=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Lx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,bx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Dx=`#if defined( USE_POINTS_UV )
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
#endif`,Ix=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ux=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Nx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Fx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ox=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bx=`#ifdef USE_MORPHTARGETS
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
#endif`,kx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,zx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Hx=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Vx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Wx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Xx=`#ifdef USE_NORMALMAP
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
#endif`,Yx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,qx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,jx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,$x=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Kx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Zx=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Qx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,eS=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tS=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,nS=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,iS=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,rS=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,sS=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,oS=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,aS=`float getShadowMask() {
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
}`,lS=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,uS=`#ifdef USE_SKINNING
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
#endif`,cS=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,fS=`#ifdef USE_SKINNING
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
#endif`,dS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,pS=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,mS=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,gS=`#ifdef USE_TRANSMISSION
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
#endif`,_S=`#ifdef USE_TRANSMISSION
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
#endif`,vS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,xS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,SS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,yS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const MS=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ES=`uniform sampler2D t2D;
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
}`,TS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,wS=`#ifdef ENVMAP_TYPE_CUBE
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
}`,AS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,RS=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,CS=`#include <common>
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
}`,PS=`#if DEPTH_PACKING == 3200
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
}`,LS=`#define DISTANCE
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
}`,bS=`#define DISTANCE
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
}`,DS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,IS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,US=`uniform float scale;
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
}`,NS=`uniform vec3 diffuse;
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
}`,FS=`#include <common>
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
}`,OS=`uniform vec3 diffuse;
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
}`,BS=`#define LAMBERT
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
}`,kS=`#define LAMBERT
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
}`,zS=`#define MATCAP
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
}`,HS=`#define MATCAP
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
}`,VS=`#define NORMAL
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
}`,GS=`#define NORMAL
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
}`,WS=`#define PHONG
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
}`,XS=`#define PHONG
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
}`,YS=`#define STANDARD
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
}`,qS=`#define STANDARD
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
}`,jS=`#define TOON
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
}`,$S=`#define TOON
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
}`,KS=`uniform float size;
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
}`,ZS=`uniform vec3 diffuse;
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
}`,QS=`#include <common>
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
}`,JS=`uniform vec3 color;
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
}`,ey=`uniform float rotation;
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
}`,ty=`uniform vec3 diffuse;
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
}`,it={alphahash_fragment:E0,alphahash_pars_fragment:T0,alphamap_fragment:w0,alphamap_pars_fragment:A0,alphatest_fragment:R0,alphatest_pars_fragment:C0,aomap_fragment:P0,aomap_pars_fragment:L0,batching_pars_vertex:b0,batching_vertex:D0,begin_vertex:I0,beginnormal_vertex:U0,bsdfs:N0,iridescence_fragment:F0,bumpmap_pars_fragment:O0,clipping_planes_fragment:B0,clipping_planes_pars_fragment:k0,clipping_planes_pars_vertex:z0,clipping_planes_vertex:H0,color_fragment:V0,color_pars_fragment:G0,color_pars_vertex:W0,color_vertex:X0,common:Y0,cube_uv_reflection_fragment:q0,defaultnormal_vertex:j0,displacementmap_pars_vertex:$0,displacementmap_vertex:K0,emissivemap_fragment:Z0,emissivemap_pars_fragment:Q0,colorspace_fragment:J0,colorspace_pars_fragment:ex,envmap_fragment:tx,envmap_common_pars_fragment:nx,envmap_pars_fragment:ix,envmap_pars_vertex:rx,envmap_physical_pars_fragment:mx,envmap_vertex:sx,fog_vertex:ox,fog_pars_vertex:ax,fog_fragment:lx,fog_pars_fragment:ux,gradientmap_pars_fragment:cx,lightmap_pars_fragment:fx,lights_lambert_fragment:dx,lights_lambert_pars_fragment:hx,lights_pars_begin:px,lights_toon_fragment:gx,lights_toon_pars_fragment:_x,lights_phong_fragment:vx,lights_phong_pars_fragment:xx,lights_physical_fragment:Sx,lights_physical_pars_fragment:yx,lights_fragment_begin:Mx,lights_fragment_maps:Ex,lights_fragment_end:Tx,logdepthbuf_fragment:wx,logdepthbuf_pars_fragment:Ax,logdepthbuf_pars_vertex:Rx,logdepthbuf_vertex:Cx,map_fragment:Px,map_pars_fragment:Lx,map_particle_fragment:bx,map_particle_pars_fragment:Dx,metalnessmap_fragment:Ix,metalnessmap_pars_fragment:Ux,morphinstance_vertex:Nx,morphcolor_vertex:Fx,morphnormal_vertex:Ox,morphtarget_pars_vertex:Bx,morphtarget_vertex:kx,normal_fragment_begin:zx,normal_fragment_maps:Hx,normal_pars_fragment:Vx,normal_pars_vertex:Gx,normal_vertex:Wx,normalmap_pars_fragment:Xx,clearcoat_normal_fragment_begin:Yx,clearcoat_normal_fragment_maps:qx,clearcoat_pars_fragment:jx,iridescence_pars_fragment:$x,opaque_fragment:Kx,packing:Zx,premultiplied_alpha_fragment:Qx,project_vertex:Jx,dithering_fragment:eS,dithering_pars_fragment:tS,roughnessmap_fragment:nS,roughnessmap_pars_fragment:iS,shadowmap_pars_fragment:rS,shadowmap_pars_vertex:sS,shadowmap_vertex:oS,shadowmask_pars_fragment:aS,skinbase_vertex:lS,skinning_pars_vertex:uS,skinning_vertex:cS,skinnormal_vertex:fS,specularmap_fragment:dS,specularmap_pars_fragment:hS,tonemapping_fragment:pS,tonemapping_pars_fragment:mS,transmission_fragment:gS,transmission_pars_fragment:_S,uv_pars_fragment:vS,uv_pars_vertex:xS,uv_vertex:SS,worldpos_vertex:yS,background_vert:MS,background_frag:ES,backgroundCube_vert:TS,backgroundCube_frag:wS,cube_vert:AS,cube_frag:RS,depth_vert:CS,depth_frag:PS,distanceRGBA_vert:LS,distanceRGBA_frag:bS,equirect_vert:DS,equirect_frag:IS,linedashed_vert:US,linedashed_frag:NS,meshbasic_vert:FS,meshbasic_frag:OS,meshlambert_vert:BS,meshlambert_frag:kS,meshmatcap_vert:zS,meshmatcap_frag:HS,meshnormal_vert:VS,meshnormal_frag:GS,meshphong_vert:WS,meshphong_frag:XS,meshphysical_vert:YS,meshphysical_frag:qS,meshtoon_vert:jS,meshtoon_frag:$S,points_vert:KS,points_frag:ZS,shadow_vert:QS,shadow_frag:JS,sprite_vert:ey,sprite_frag:ty},Re={common:{diffuse:{value:new ct(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new rt},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new rt}},envmap:{envMap:{value:null},envMapRotation:{value:new rt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new rt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new rt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new rt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new rt},normalScale:{value:new pt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new rt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new rt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new rt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new rt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ct(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ct(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0},uvTransform:{value:new rt}},sprite:{diffuse:{value:new ct(16777215)},opacity:{value:1},center:{value:new pt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new rt},alphaMap:{value:null},alphaMapTransform:{value:new rt},alphaTest:{value:0}}},hi={basic:{uniforms:gn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.fog]),vertexShader:it.meshbasic_vert,fragmentShader:it.meshbasic_frag},lambert:{uniforms:gn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new ct(0)}}]),vertexShader:it.meshlambert_vert,fragmentShader:it.meshlambert_frag},phong:{uniforms:gn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new ct(0)},specular:{value:new ct(1118481)},shininess:{value:30}}]),vertexShader:it.meshphong_vert,fragmentShader:it.meshphong_frag},standard:{uniforms:gn([Re.common,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.roughnessmap,Re.metalnessmap,Re.fog,Re.lights,{emissive:{value:new ct(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:it.meshphysical_vert,fragmentShader:it.meshphysical_frag},toon:{uniforms:gn([Re.common,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.gradientmap,Re.fog,Re.lights,{emissive:{value:new ct(0)}}]),vertexShader:it.meshtoon_vert,fragmentShader:it.meshtoon_frag},matcap:{uniforms:gn([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,{matcap:{value:null}}]),vertexShader:it.meshmatcap_vert,fragmentShader:it.meshmatcap_frag},points:{uniforms:gn([Re.points,Re.fog]),vertexShader:it.points_vert,fragmentShader:it.points_frag},dashed:{uniforms:gn([Re.common,Re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:it.linedashed_vert,fragmentShader:it.linedashed_frag},depth:{uniforms:gn([Re.common,Re.displacementmap]),vertexShader:it.depth_vert,fragmentShader:it.depth_frag},normal:{uniforms:gn([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,{opacity:{value:1}}]),vertexShader:it.meshnormal_vert,fragmentShader:it.meshnormal_frag},sprite:{uniforms:gn([Re.sprite,Re.fog]),vertexShader:it.sprite_vert,fragmentShader:it.sprite_frag},background:{uniforms:{uvTransform:{value:new rt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:it.background_vert,fragmentShader:it.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new rt}},vertexShader:it.backgroundCube_vert,fragmentShader:it.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:it.cube_vert,fragmentShader:it.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:it.equirect_vert,fragmentShader:it.equirect_frag},distanceRGBA:{uniforms:gn([Re.common,Re.displacementmap,{referencePosition:{value:new j},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:it.distanceRGBA_vert,fragmentShader:it.distanceRGBA_frag},shadow:{uniforms:gn([Re.lights,Re.fog,{color:{value:new ct(0)},opacity:{value:1}}]),vertexShader:it.shadow_vert,fragmentShader:it.shadow_frag}};hi.physical={uniforms:gn([hi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new rt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new rt},clearcoatNormalScale:{value:new pt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new rt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new rt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new rt},sheen:{value:0},sheenColor:{value:new ct(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new rt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new rt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new rt},transmissionSamplerSize:{value:new pt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new rt},attenuationDistance:{value:0},attenuationColor:{value:new ct(0)},specularColor:{value:new ct(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new rt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new rt},anisotropyVector:{value:new pt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new rt}}]),vertexShader:it.meshphysical_vert,fragmentShader:it.meshphysical_frag};const fl={r:0,b:0,g:0},Nr=new mi,ny=new Ot;function iy(s,e,n,r,a,u,f){const d=new ct(0);let p=u===!0?0:1,m,_,S=null,x=0,y=null;function w(b){let P=b.isScene===!0?b.background:null;return P&&P.isTexture&&(P=(b.backgroundBlurriness>0?n:e).get(P)),P}function A(b){let P=!1;const L=w(b);L===null?v(d,p):L&&L.isColor&&(v(L,1),P=!0);const X=s.xr.getEnvironmentBlendMode();X==="additive"?r.buffers.color.setClear(0,0,0,1,f):X==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,f),(s.autoClear||P)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function g(b,P){const L=w(P);L&&(L.isCubeTexture||L.mapping===bl)?(_===void 0&&(_=new Yn(new zo(1,1,1),new gr({name:"BackgroundCubeMaterial",uniforms:zs(hi.backgroundCube.uniforms),vertexShader:hi.backgroundCube.vertexShader,fragmentShader:hi.backgroundCube.fragmentShader,side:wn,depthTest:!1,depthWrite:!1,fog:!1})),_.geometry.deleteAttribute("normal"),_.geometry.deleteAttribute("uv"),_.onBeforeRender=function(X,F,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(_.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(_)),Nr.copy(P.backgroundRotation),Nr.x*=-1,Nr.y*=-1,Nr.z*=-1,L.isCubeTexture&&L.isRenderTargetTexture===!1&&(Nr.y*=-1,Nr.z*=-1),_.material.uniforms.envMap.value=L,_.material.uniforms.flipEnvMap.value=L.isCubeTexture&&L.isRenderTargetTexture===!1?-1:1,_.material.uniforms.backgroundBlurriness.value=P.backgroundBlurriness,_.material.uniforms.backgroundIntensity.value=P.backgroundIntensity,_.material.uniforms.backgroundRotation.value.setFromMatrix4(ny.makeRotationFromEuler(Nr)),_.material.toneMapped=Mt.getTransfer(L.colorSpace)!==bt,(S!==L||x!==L.version||y!==s.toneMapping)&&(_.material.needsUpdate=!0,S=L,x=L.version,y=s.toneMapping),_.layers.enableAll(),b.unshift(_,_.geometry,_.material,0,0,null)):L&&L.isTexture&&(m===void 0&&(m=new Yn(new Ho(2,2),new gr({name:"BackgroundMaterial",uniforms:zs(hi.background.uniforms),vertexShader:hi.background.vertexShader,fragmentShader:hi.background.fragmentShader,side:mr,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(m)),m.material.uniforms.t2D.value=L,m.material.uniforms.backgroundIntensity.value=P.backgroundIntensity,m.material.toneMapped=Mt.getTransfer(L.colorSpace)!==bt,L.matrixAutoUpdate===!0&&L.updateMatrix(),m.material.uniforms.uvTransform.value.copy(L.matrix),(S!==L||x!==L.version||y!==s.toneMapping)&&(m.material.needsUpdate=!0,S=L,x=L.version,y=s.toneMapping),m.layers.enableAll(),b.unshift(m,m.geometry,m.material,0,0,null))}function v(b,P){b.getRGB(fl,rg(s)),r.buffers.color.setClear(fl.r,fl.g,fl.b,P,f)}return{getClearColor:function(){return d},setClearColor:function(b,P=1){d.set(b),p=P,v(d,p)},getClearAlpha:function(){return p},setClearAlpha:function(b){p=b,v(d,p)},render:A,addToRenderList:g}}function ry(s,e){const n=s.getParameter(s.MAX_VERTEX_ATTRIBS),r={},a=x(null);let u=a,f=!1;function d(M,C,q,Z,ae){let de=!1;const ne=S(Z,q,C);u!==ne&&(u=ne,m(u.object)),de=y(M,Z,q,ae),de&&w(M,Z,q,ae),ae!==null&&e.update(ae,s.ELEMENT_ARRAY_BUFFER),(de||f)&&(f=!1,L(M,C,q,Z),ae!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(ae).buffer))}function p(){return s.createVertexArray()}function m(M){return s.bindVertexArray(M)}function _(M){return s.deleteVertexArray(M)}function S(M,C,q){const Z=q.wireframe===!0;let ae=r[M.id];ae===void 0&&(ae={},r[M.id]=ae);let de=ae[C.id];de===void 0&&(de={},ae[C.id]=de);let ne=de[Z];return ne===void 0&&(ne=x(p()),de[Z]=ne),ne}function x(M){const C=[],q=[],Z=[];for(let ae=0;ae<n;ae++)C[ae]=0,q[ae]=0,Z[ae]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:q,attributeDivisors:Z,object:M,attributes:{},index:null}}function y(M,C,q,Z){const ae=u.attributes,de=C.attributes;let ne=0;const le=q.getAttributes();for(const k in le)if(le[k].location>=0){const oe=ae[k];let N=de[k];if(N===void 0&&(k==="instanceMatrix"&&M.instanceMatrix&&(N=M.instanceMatrix),k==="instanceColor"&&M.instanceColor&&(N=M.instanceColor)),oe===void 0||oe.attribute!==N||N&&oe.data!==N.data)return!0;ne++}return u.attributesNum!==ne||u.index!==Z}function w(M,C,q,Z){const ae={},de=C.attributes;let ne=0;const le=q.getAttributes();for(const k in le)if(le[k].location>=0){let oe=de[k];oe===void 0&&(k==="instanceMatrix"&&M.instanceMatrix&&(oe=M.instanceMatrix),k==="instanceColor"&&M.instanceColor&&(oe=M.instanceColor));const N={};N.attribute=oe,oe&&oe.data&&(N.data=oe.data),ae[k]=N,ne++}u.attributes=ae,u.attributesNum=ne,u.index=Z}function A(){const M=u.newAttributes;for(let C=0,q=M.length;C<q;C++)M[C]=0}function g(M){v(M,0)}function v(M,C){const q=u.newAttributes,Z=u.enabledAttributes,ae=u.attributeDivisors;q[M]=1,Z[M]===0&&(s.enableVertexAttribArray(M),Z[M]=1),ae[M]!==C&&(s.vertexAttribDivisor(M,C),ae[M]=C)}function b(){const M=u.newAttributes,C=u.enabledAttributes;for(let q=0,Z=C.length;q<Z;q++)C[q]!==M[q]&&(s.disableVertexAttribArray(q),C[q]=0)}function P(M,C,q,Z,ae,de,ne){ne===!0?s.vertexAttribIPointer(M,C,q,ae,de):s.vertexAttribPointer(M,C,q,Z,ae,de)}function L(M,C,q,Z){A();const ae=Z.attributes,de=q.getAttributes(),ne=C.defaultAttributeValues;for(const le in de){const k=de[le];if(k.location>=0){let ce=ae[le];if(ce===void 0&&(le==="instanceMatrix"&&M.instanceMatrix&&(ce=M.instanceMatrix),le==="instanceColor"&&M.instanceColor&&(ce=M.instanceColor)),ce!==void 0){const oe=ce.normalized,N=ce.itemSize,ie=e.get(ce);if(ie===void 0)continue;const Ue=ie.buffer,Q=ie.type,ue=ie.bytesPerElement,xe=Q===s.INT||Q===s.UNSIGNED_INT||ce.gpuType===Hf;if(ce.isInterleavedBufferAttribute){const Se=ce.data,Ce=Se.stride,Pe=ce.offset;if(Se.isInstancedInterleavedBuffer){for(let Je=0;Je<k.locationSize;Je++)v(k.location+Je,Se.meshPerAttribute);M.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=Se.meshPerAttribute*Se.count)}else for(let Je=0;Je<k.locationSize;Je++)g(k.location+Je);s.bindBuffer(s.ARRAY_BUFFER,Ue);for(let Je=0;Je<k.locationSize;Je++)P(k.location+Je,N/k.locationSize,Q,oe,Ce*ue,(Pe+N/k.locationSize*Je)*ue,xe)}else{if(ce.isInstancedBufferAttribute){for(let Se=0;Se<k.locationSize;Se++)v(k.location+Se,ce.meshPerAttribute);M.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let Se=0;Se<k.locationSize;Se++)g(k.location+Se);s.bindBuffer(s.ARRAY_BUFFER,Ue);for(let Se=0;Se<k.locationSize;Se++)P(k.location+Se,N/k.locationSize,Q,oe,N*ue,N/k.locationSize*Se*ue,xe)}}else if(ne!==void 0){const oe=ne[le];if(oe!==void 0)switch(oe.length){case 2:s.vertexAttrib2fv(k.location,oe);break;case 3:s.vertexAttrib3fv(k.location,oe);break;case 4:s.vertexAttrib4fv(k.location,oe);break;default:s.vertexAttrib1fv(k.location,oe)}}}}b()}function X(){H();for(const M in r){const C=r[M];for(const q in C){const Z=C[q];for(const ae in Z)_(Z[ae].object),delete Z[ae];delete C[q]}delete r[M]}}function F(M){if(r[M.id]===void 0)return;const C=r[M.id];for(const q in C){const Z=C[q];for(const ae in Z)_(Z[ae].object),delete Z[ae];delete C[q]}delete r[M.id]}function I(M){for(const C in r){const q=r[C];if(q[M.id]===void 0)continue;const Z=q[M.id];for(const ae in Z)_(Z[ae].object),delete Z[ae];delete q[M.id]}}function H(){re(),f=!0,u!==a&&(u=a,m(u.object))}function re(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:d,reset:H,resetDefaultState:re,dispose:X,releaseStatesOfGeometry:F,releaseStatesOfProgram:I,initAttributes:A,enableAttribute:g,disableUnusedAttributes:b}}function sy(s,e,n){let r;function a(m){r=m}function u(m,_){s.drawArrays(r,m,_),n.update(_,r,1)}function f(m,_,S){S!==0&&(s.drawArraysInstanced(r,m,_,S),n.update(_,r,S))}function d(m,_,S){if(S===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,m,0,_,0,S);let y=0;for(let w=0;w<S;w++)y+=_[w];n.update(y,r,1)}function p(m,_,S,x){if(S===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let w=0;w<m.length;w++)f(m[w],_[w],x[w]);else{y.multiDrawArraysInstancedWEBGL(r,m,0,_,0,x,0,S);let w=0;for(let A=0;A<S;A++)w+=_[A];for(let A=0;A<x.length;A++)n.update(w,r,x[A])}}this.setMode=a,this.render=u,this.renderInstances=f,this.renderMultiDraw=d,this.renderMultiDrawInstances=p}function oy(s,e,n,r){let a;function u(){if(a!==void 0)return a;if(e.has("EXT_texture_filter_anisotropic")===!0){const I=e.get("EXT_texture_filter_anisotropic");a=s.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function f(I){return!(I!==si&&r.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(I){const H=I===Fo&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==Oi&&r.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Ni&&!H)}function p(I){if(I==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let m=n.precision!==void 0?n.precision:"highp";const _=p(m);_!==m&&(console.warn("THREE.WebGLRenderer:",m,"not supported, using",_,"instead."),m=_);const S=n.logarithmicDepthBuffer===!0,x=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(x===!0){const I=e.get("EXT_clip_control");I.clipControlEXT(I.LOWER_LEFT_EXT,I.ZERO_TO_ONE_EXT)}const y=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),w=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),A=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),v=s.getParameter(s.MAX_VERTEX_ATTRIBS),b=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),P=s.getParameter(s.MAX_VARYING_VECTORS),L=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),X=w>0,F=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:u,getMaxPrecision:p,textureFormatReadable:f,textureTypeReadable:d,precision:m,logarithmicDepthBuffer:S,reverseDepthBuffer:x,maxTextures:y,maxVertexTextures:w,maxTextureSize:A,maxCubemapSize:g,maxAttributes:v,maxVertexUniforms:b,maxVaryings:P,maxFragmentUniforms:L,vertexTextures:X,maxSamples:F}}function ay(s){const e=this;let n=null,r=0,a=!1,u=!1;const f=new Or,d=new rt,p={value:null,needsUpdate:!1};this.uniform=p,this.numPlanes=0,this.numIntersection=0,this.init=function(S,x){const y=S.length!==0||x||r!==0||a;return a=x,r=S.length,y},this.beginShadows=function(){u=!0,_(null)},this.endShadows=function(){u=!1},this.setGlobalState=function(S,x){n=_(S,x,0)},this.setState=function(S,x,y){const w=S.clippingPlanes,A=S.clipIntersection,g=S.clipShadows,v=s.get(S);if(!a||w===null||w.length===0||u&&!g)u?_(null):m();else{const b=u?0:r,P=b*4;let L=v.clippingState||null;p.value=L,L=_(w,x,P,y);for(let X=0;X!==P;++X)L[X]=n[X];v.clippingState=L,this.numIntersection=A?this.numPlanes:0,this.numPlanes+=b}};function m(){p.value!==n&&(p.value=n,p.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function _(S,x,y,w){const A=S!==null?S.length:0;let g=null;if(A!==0){if(g=p.value,w!==!0||g===null){const v=y+A*4,b=x.matrixWorldInverse;d.getNormalMatrix(b),(g===null||g.length<v)&&(g=new Float32Array(v));for(let P=0,L=y;P!==A;++P,L+=4)f.copy(S[P]).applyMatrix4(b,d),f.normal.toArray(g,L),g[L+3]=f.constant}p.value=g,p.needsUpdate=!0}return e.numPlanes=A,e.numIntersection=0,g}}function ly(s){let e=new WeakMap;function n(f,d){return d===af?f.mapping=Fs:d===lf&&(f.mapping=Os),f}function r(f){if(f&&f.isTexture){const d=f.mapping;if(d===af||d===lf)if(e.has(f)){const p=e.get(f).texture;return n(p,f.mapping)}else{const p=f.image;if(p&&p.height>0){const m=new x0(p.height);return m.fromEquirectangularTexture(s,f),e.set(f,m),f.addEventListener("dispose",a),n(m.texture,f.mapping)}else return null}}return f}function a(f){const d=f.target;d.removeEventListener("dispose",a);const p=e.get(d);p!==void 0&&(e.delete(d),p.dispose())}function u(){e=new WeakMap}return{get:r,dispose:u}}class lg extends sg{constructor(e=-1,n=1,r=1,a=-1,u=.1,f=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=r,this.bottom=a,this.near=u,this.far=f,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,r,a,u,f){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=r,this.view.offsetY=a,this.view.width=u,this.view.height=f,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,a=(this.top+this.bottom)/2;let u=r-e,f=r+e,d=a+n,p=a-n;if(this.view!==null&&this.view.enabled){const m=(this.right-this.left)/this.view.fullWidth/this.zoom,_=(this.top-this.bottom)/this.view.fullHeight/this.zoom;u+=m*this.view.offsetX,f=u+m*this.view.width,d-=_*this.view.offsetY,p=d-_*this.view.height}this.projectionMatrix.makeOrthographic(u,f,d,p,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const bs=4,tm=[.125,.215,.35,.446,.526,.582],zr=20,Hc=new lg,nm=new ct;let Vc=null,Gc=0,Wc=0,Xc=!1;const Br=(1+Math.sqrt(5))/2,Ls=1/Br,im=[new j(-Br,Ls,0),new j(Br,Ls,0),new j(-Ls,0,Br),new j(Ls,0,Br),new j(0,Br,-Ls),new j(0,Br,Ls),new j(-1,1,-1),new j(1,1,-1),new j(-1,1,1),new j(1,1,1)];class rm{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,r=.1,a=100){Vc=this._renderer.getRenderTarget(),Gc=this._renderer.getActiveCubeFace(),Wc=this._renderer.getActiveMipmapLevel(),Xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const u=this._allocateTargets();return u.depthBuffer=!0,this._sceneToCubeUV(e,r,a,u),n>0&&this._blur(u,0,0,n),this._applyPMREM(u),this._cleanup(u),u}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=am(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=om(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Vc,Gc,Wc),this._renderer.xr.enabled=Xc,e.scissorTest=!1,dl(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===Fs||e.mapping===Os?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Vc=this._renderer.getRenderTarget(),Gc=this._renderer.getActiveCubeFace(),Wc=this._renderer.getActiveMipmapLevel(),Xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=n||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,r={magFilter:ii,minFilter:ii,generateMipmaps:!1,type:Fo,format:si,colorSpace:_r,depthBuffer:!1},a=sm(e,n,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=sm(e,n,r);const{_lodMax:u}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=uy(u)),this._blurMaterial=cy(u,e,n)}return a}_compileMaterial(e){const n=new Yn(this._lodPlanes[0],e);this._renderer.compile(n,Hc)}_sceneToCubeUV(e,n,r,a){const d=new Wn(90,1,n,r),p=[1,-1,1,1,1,1],m=[1,1,1,-1,-1,-1],_=this._renderer,S=_.autoClear,x=_.toneMapping;_.getClearColor(nm),_.toneMapping=pr,_.autoClear=!1;const y=new tg({name:"PMREM.Background",side:wn,depthWrite:!1,depthTest:!1}),w=new Yn(new zo,y);let A=!1;const g=e.background;g?g.isColor&&(y.color.copy(g),e.background=null,A=!0):(y.color.copy(nm),A=!0);for(let v=0;v<6;v++){const b=v%3;b===0?(d.up.set(0,p[v],0),d.lookAt(m[v],0,0)):b===1?(d.up.set(0,0,p[v]),d.lookAt(0,m[v],0)):(d.up.set(0,p[v],0),d.lookAt(0,0,m[v]));const P=this._cubeSize;dl(a,b*P,v>2?P:0,P,P),_.setRenderTarget(a),A&&_.render(w,d),_.render(e,d)}w.geometry.dispose(),w.material.dispose(),_.toneMapping=x,_.autoClear=S,e.background=g}_textureToCubeUV(e,n){const r=this._renderer,a=e.mapping===Fs||e.mapping===Os;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=am()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=om());const u=a?this._cubemapMaterial:this._equirectMaterial,f=new Yn(this._lodPlanes[0],u),d=u.uniforms;d.envMap.value=e;const p=this._cubeSize;dl(n,0,0,3*p,2*p),r.setRenderTarget(n),r.render(f,Hc)}_applyPMREM(e){const n=this._renderer,r=n.autoClear;n.autoClear=!1;const a=this._lodPlanes.length;for(let u=1;u<a;u++){const f=Math.sqrt(this._sigmas[u]*this._sigmas[u]-this._sigmas[u-1]*this._sigmas[u-1]),d=im[(a-u-1)%im.length];this._blur(e,u-1,u,f,d)}n.autoClear=r}_blur(e,n,r,a,u){const f=this._pingPongRenderTarget;this._halfBlur(e,f,n,r,a,"latitudinal",u),this._halfBlur(f,e,r,r,a,"longitudinal",u)}_halfBlur(e,n,r,a,u,f,d){const p=this._renderer,m=this._blurMaterial;f!=="latitudinal"&&f!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const _=3,S=new Yn(this._lodPlanes[a],m),x=m.uniforms,y=this._sizeLods[r]-1,w=isFinite(u)?Math.PI/(2*y):2*Math.PI/(2*zr-1),A=u/w,g=isFinite(u)?1+Math.floor(_*A):zr;g>zr&&console.warn(`sigmaRadians, ${u}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${zr}`);const v=[];let b=0;for(let I=0;I<zr;++I){const H=I/A,re=Math.exp(-H*H/2);v.push(re),I===0?b+=re:I<g&&(b+=2*re)}for(let I=0;I<v.length;I++)v[I]=v[I]/b;x.envMap.value=e.texture,x.samples.value=g,x.weights.value=v,x.latitudinal.value=f==="latitudinal",d&&(x.poleAxis.value=d);const{_lodMax:P}=this;x.dTheta.value=w,x.mipInt.value=P-r;const L=this._sizeLods[a],X=3*L*(a>P-bs?a-P+bs:0),F=4*(this._cubeSize-L);dl(n,X,F,3*L,2*L),p.setRenderTarget(n),p.render(S,Hc)}}function uy(s){const e=[],n=[],r=[];let a=s;const u=s-bs+1+tm.length;for(let f=0;f<u;f++){const d=Math.pow(2,a);n.push(d);let p=1/d;f>s-bs?p=tm[f-s+bs-1]:f===0&&(p=0),r.push(p);const m=1/(d-2),_=-m,S=1+m,x=[_,_,S,_,S,S,_,_,S,S,_,S],y=6,w=6,A=3,g=2,v=1,b=new Float32Array(A*w*y),P=new Float32Array(g*w*y),L=new Float32Array(v*w*y);for(let F=0;F<y;F++){const I=F%3*2/3-1,H=F>2?0:-1,re=[I,H,0,I+2/3,H,0,I+2/3,H+1,0,I,H,0,I+2/3,H+1,0,I,H+1,0];b.set(re,A*w*F),P.set(x,g*w*F);const M=[F,F,F,F,F,F];L.set(M,v*w*F)}const X=new oi;X.setAttribute("position",new pi(b,A)),X.setAttribute("uv",new pi(P,g)),X.setAttribute("faceIndex",new pi(L,v)),e.push(X),a>bs&&a--}return{lodPlanes:e,sizeLods:n,sigmas:r}}function sm(s,e,n){const r=new Wr(s,e,n);return r.texture.mapping=bl,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function dl(s,e,n,r,a){s.viewport.set(e,n,r,a),s.scissor.set(e,n,r,a)}function cy(s,e,n){const r=new Float32Array(zr),a=new j(0,1,0);return new gr({name:"SphericalGaussianBlur",defines:{n:zr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:$f(),fragmentShader:`

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
		`,blending:hr,depthTest:!1,depthWrite:!1})}function om(){return new gr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:$f(),fragmentShader:`

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
		`,blending:hr,depthTest:!1,depthWrite:!1})}function am(){return new gr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:$f(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hr,depthTest:!1,depthWrite:!1})}function $f(){return`

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
	`}function fy(s){let e=new WeakMap,n=null;function r(d){if(d&&d.isTexture){const p=d.mapping,m=p===af||p===lf,_=p===Fs||p===Os;if(m||_){let S=e.get(d);const x=S!==void 0?S.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==x)return n===null&&(n=new rm(s)),S=m?n.fromEquirectangular(d,S):n.fromCubemap(d,S),S.texture.pmremVersion=d.pmremVersion,e.set(d,S),S.texture;if(S!==void 0)return S.texture;{const y=d.image;return m&&y&&y.height>0||_&&y&&a(y)?(n===null&&(n=new rm(s)),S=m?n.fromEquirectangular(d):n.fromCubemap(d),S.texture.pmremVersion=d.pmremVersion,e.set(d,S),d.addEventListener("dispose",u),S.texture):null}}}return d}function a(d){let p=0;const m=6;for(let _=0;_<m;_++)d[_]!==void 0&&p++;return p===m}function u(d){const p=d.target;p.removeEventListener("dispose",u);const m=e.get(p);m!==void 0&&(e.delete(p),m.dispose())}function f(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:f}}function dy(s){const e={};function n(r){if(e[r]!==void 0)return e[r];let a;switch(r){case"WEBGL_depth_texture":a=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":a=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":a=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":a=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:a=s.getExtension(r)}return e[r]=a,a}return{has:function(r){return n(r)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(r){const a=n(r);return a===null&&Ml("THREE.WebGLRenderer: "+r+" extension not supported."),a}}}function hy(s,e,n,r){const a={},u=new WeakMap;function f(S){const x=S.target;x.index!==null&&e.remove(x.index);for(const w in x.attributes)e.remove(x.attributes[w]);for(const w in x.morphAttributes){const A=x.morphAttributes[w];for(let g=0,v=A.length;g<v;g++)e.remove(A[g])}x.removeEventListener("dispose",f),delete a[x.id];const y=u.get(x);y&&(e.remove(y),u.delete(x)),r.releaseStatesOfGeometry(x),x.isInstancedBufferGeometry===!0&&delete x._maxInstanceCount,n.memory.geometries--}function d(S,x){return a[x.id]===!0||(x.addEventListener("dispose",f),a[x.id]=!0,n.memory.geometries++),x}function p(S){const x=S.attributes;for(const w in x)e.update(x[w],s.ARRAY_BUFFER);const y=S.morphAttributes;for(const w in y){const A=y[w];for(let g=0,v=A.length;g<v;g++)e.update(A[g],s.ARRAY_BUFFER)}}function m(S){const x=[],y=S.index,w=S.attributes.position;let A=0;if(y!==null){const b=y.array;A=y.version;for(let P=0,L=b.length;P<L;P+=3){const X=b[P+0],F=b[P+1],I=b[P+2];x.push(X,F,F,I,I,X)}}else if(w!==void 0){const b=w.array;A=w.version;for(let P=0,L=b.length/3-1;P<L;P+=3){const X=P+0,F=P+1,I=P+2;x.push(X,F,F,I,I,X)}}else return;const g=new($m(x)?ig:ng)(x,1);g.version=A;const v=u.get(S);v&&e.remove(v),u.set(S,g)}function _(S){const x=u.get(S);if(x){const y=S.index;y!==null&&x.version<y.version&&m(S)}else m(S);return u.get(S)}return{get:d,update:p,getWireframeAttribute:_}}function py(s,e,n){let r;function a(x){r=x}let u,f;function d(x){u=x.type,f=x.bytesPerElement}function p(x,y){s.drawElements(r,y,u,x*f),n.update(y,r,1)}function m(x,y,w){w!==0&&(s.drawElementsInstanced(r,y,u,x*f,w),n.update(y,r,w))}function _(x,y,w){if(w===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,y,0,u,x,0,w);let g=0;for(let v=0;v<w;v++)g+=y[v];n.update(g,r,1)}function S(x,y,w,A){if(w===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let v=0;v<x.length;v++)m(x[v]/f,y[v],A[v]);else{g.multiDrawElementsInstancedWEBGL(r,y,0,u,x,0,A,0,w);let v=0;for(let b=0;b<w;b++)v+=y[b];for(let b=0;b<A.length;b++)n.update(v,r,A[b])}}this.setMode=a,this.setIndex=d,this.render=p,this.renderInstances=m,this.renderMultiDraw=_,this.renderMultiDrawInstances=S}function my(s){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(u,f,d){switch(n.calls++,f){case s.TRIANGLES:n.triangles+=d*(u/3);break;case s.LINES:n.lines+=d*(u/2);break;case s.LINE_STRIP:n.lines+=d*(u-1);break;case s.LINE_LOOP:n.lines+=d*u;break;case s.POINTS:n.points+=d*u;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",f);break}}function a(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:a,update:r}}function gy(s,e,n){const r=new WeakMap,a=new kt;function u(f,d,p){const m=f.morphTargetInfluences,_=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,S=_!==void 0?_.length:0;let x=r.get(d);if(x===void 0||x.count!==S){let M=function(){H.dispose(),r.delete(d),d.removeEventListener("dispose",M)};var y=M;x!==void 0&&x.texture.dispose();const w=d.morphAttributes.position!==void 0,A=d.morphAttributes.normal!==void 0,g=d.morphAttributes.color!==void 0,v=d.morphAttributes.position||[],b=d.morphAttributes.normal||[],P=d.morphAttributes.color||[];let L=0;w===!0&&(L=1),A===!0&&(L=2),g===!0&&(L=3);let X=d.attributes.position.count*L,F=1;X>e.maxTextureSize&&(F=Math.ceil(X/e.maxTextureSize),X=e.maxTextureSize);const I=new Float32Array(X*F*4*S),H=new Zm(I,X,F,S);H.type=Ni,H.needsUpdate=!0;const re=L*4;for(let C=0;C<S;C++){const q=v[C],Z=b[C],ae=P[C],de=X*F*4*C;for(let ne=0;ne<q.count;ne++){const le=ne*re;w===!0&&(a.fromBufferAttribute(q,ne),I[de+le+0]=a.x,I[de+le+1]=a.y,I[de+le+2]=a.z,I[de+le+3]=0),A===!0&&(a.fromBufferAttribute(Z,ne),I[de+le+4]=a.x,I[de+le+5]=a.y,I[de+le+6]=a.z,I[de+le+7]=0),g===!0&&(a.fromBufferAttribute(ae,ne),I[de+le+8]=a.x,I[de+le+9]=a.y,I[de+le+10]=a.z,I[de+le+11]=ae.itemSize===4?a.w:1)}}x={count:S,texture:H,size:new pt(X,F)},r.set(d,x),d.addEventListener("dispose",M)}if(f.isInstancedMesh===!0&&f.morphTexture!==null)p.getUniforms().setValue(s,"morphTexture",f.morphTexture,n);else{let w=0;for(let g=0;g<m.length;g++)w+=m[g];const A=d.morphTargetsRelative?1:1-w;p.getUniforms().setValue(s,"morphTargetBaseInfluence",A),p.getUniforms().setValue(s,"morphTargetInfluences",m)}p.getUniforms().setValue(s,"morphTargetsTexture",x.texture,n),p.getUniforms().setValue(s,"morphTargetsTextureSize",x.size)}return{update:u}}function _y(s,e,n,r){let a=new WeakMap;function u(p){const m=r.render.frame,_=p.geometry,S=e.get(p,_);if(a.get(S)!==m&&(e.update(S),a.set(S,m)),p.isInstancedMesh&&(p.hasEventListener("dispose",d)===!1&&p.addEventListener("dispose",d),a.get(p)!==m&&(n.update(p.instanceMatrix,s.ARRAY_BUFFER),p.instanceColor!==null&&n.update(p.instanceColor,s.ARRAY_BUFFER),a.set(p,m))),p.isSkinnedMesh){const x=p.skeleton;a.get(x)!==m&&(x.update(),a.set(x,m))}return S}function f(){a=new WeakMap}function d(p){const m=p.target;m.removeEventListener("dispose",d),n.remove(m.instanceMatrix),m.instanceColor!==null&&n.remove(m.instanceColor)}return{update:u,dispose:f}}class ug extends An{constructor(e,n,r,a,u,f,d,p,m,_=Is){if(_!==Is&&_!==ks)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");r===void 0&&_===Is&&(r=Gr),r===void 0&&_===ks&&(r=Bs),super(null,a,u,f,d,p,_,r,m),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=d!==void 0?d:Xn,this.minFilter=p!==void 0?p:Xn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const cg=new An,lm=new ug(1,1),fg=new Zm,dg=new i0,hg=new og,um=[],cm=[],fm=new Float32Array(16),dm=new Float32Array(9),hm=new Float32Array(4);function Gs(s,e,n){const r=s[0];if(r<=0||r>0)return s;const a=e*n;let u=um[a];if(u===void 0&&(u=new Float32Array(a),um[a]=u),e!==0){r.toArray(u,0);for(let f=1,d=0;f!==e;++f)d+=n,s[f].toArray(u,d)}return u}function Yt(s,e){if(s.length!==e.length)return!1;for(let n=0,r=s.length;n<r;n++)if(s[n]!==e[n])return!1;return!0}function qt(s,e){for(let n=0,r=e.length;n<r;n++)s[n]=e[n]}function Ul(s,e){let n=cm[e];n===void 0&&(n=new Int32Array(e),cm[e]=n);for(let r=0;r!==e;++r)n[r]=s.allocateTextureUnit();return n}function vy(s,e){const n=this.cache;n[0]!==e&&(s.uniform1f(this.addr,e),n[0]=e)}function xy(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Yt(n,e))return;s.uniform2fv(this.addr,e),qt(n,e)}}function Sy(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(Yt(n,e))return;s.uniform3fv(this.addr,e),qt(n,e)}}function yy(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Yt(n,e))return;s.uniform4fv(this.addr,e),qt(n,e)}}function My(s,e){const n=this.cache,r=e.elements;if(r===void 0){if(Yt(n,e))return;s.uniformMatrix2fv(this.addr,!1,e),qt(n,e)}else{if(Yt(n,r))return;hm.set(r),s.uniformMatrix2fv(this.addr,!1,hm),qt(n,r)}}function Ey(s,e){const n=this.cache,r=e.elements;if(r===void 0){if(Yt(n,e))return;s.uniformMatrix3fv(this.addr,!1,e),qt(n,e)}else{if(Yt(n,r))return;dm.set(r),s.uniformMatrix3fv(this.addr,!1,dm),qt(n,r)}}function Ty(s,e){const n=this.cache,r=e.elements;if(r===void 0){if(Yt(n,e))return;s.uniformMatrix4fv(this.addr,!1,e),qt(n,e)}else{if(Yt(n,r))return;fm.set(r),s.uniformMatrix4fv(this.addr,!1,fm),qt(n,r)}}function wy(s,e){const n=this.cache;n[0]!==e&&(s.uniform1i(this.addr,e),n[0]=e)}function Ay(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Yt(n,e))return;s.uniform2iv(this.addr,e),qt(n,e)}}function Ry(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Yt(n,e))return;s.uniform3iv(this.addr,e),qt(n,e)}}function Cy(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Yt(n,e))return;s.uniform4iv(this.addr,e),qt(n,e)}}function Py(s,e){const n=this.cache;n[0]!==e&&(s.uniform1ui(this.addr,e),n[0]=e)}function Ly(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Yt(n,e))return;s.uniform2uiv(this.addr,e),qt(n,e)}}function by(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Yt(n,e))return;s.uniform3uiv(this.addr,e),qt(n,e)}}function Dy(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Yt(n,e))return;s.uniform4uiv(this.addr,e),qt(n,e)}}function Iy(s,e,n){const r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a);let u;this.type===s.SAMPLER_2D_SHADOW?(lm.compareFunction=jm,u=lm):u=cg,n.setTexture2D(e||u,a)}function Uy(s,e,n){const r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),n.setTexture3D(e||dg,a)}function Ny(s,e,n){const r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),n.setTextureCube(e||hg,a)}function Fy(s,e,n){const r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),n.setTexture2DArray(e||fg,a)}function Oy(s){switch(s){case 5126:return vy;case 35664:return xy;case 35665:return Sy;case 35666:return yy;case 35674:return My;case 35675:return Ey;case 35676:return Ty;case 5124:case 35670:return wy;case 35667:case 35671:return Ay;case 35668:case 35672:return Ry;case 35669:case 35673:return Cy;case 5125:return Py;case 36294:return Ly;case 36295:return by;case 36296:return Dy;case 35678:case 36198:case 36298:case 36306:case 35682:return Iy;case 35679:case 36299:case 36307:return Uy;case 35680:case 36300:case 36308:case 36293:return Ny;case 36289:case 36303:case 36311:case 36292:return Fy}}function By(s,e){s.uniform1fv(this.addr,e)}function ky(s,e){const n=Gs(e,this.size,2);s.uniform2fv(this.addr,n)}function zy(s,e){const n=Gs(e,this.size,3);s.uniform3fv(this.addr,n)}function Hy(s,e){const n=Gs(e,this.size,4);s.uniform4fv(this.addr,n)}function Vy(s,e){const n=Gs(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,n)}function Gy(s,e){const n=Gs(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,n)}function Wy(s,e){const n=Gs(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,n)}function Xy(s,e){s.uniform1iv(this.addr,e)}function Yy(s,e){s.uniform2iv(this.addr,e)}function qy(s,e){s.uniform3iv(this.addr,e)}function jy(s,e){s.uniform4iv(this.addr,e)}function $y(s,e){s.uniform1uiv(this.addr,e)}function Ky(s,e){s.uniform2uiv(this.addr,e)}function Zy(s,e){s.uniform3uiv(this.addr,e)}function Qy(s,e){s.uniform4uiv(this.addr,e)}function Jy(s,e,n){const r=this.cache,a=e.length,u=Ul(n,a);Yt(r,u)||(s.uniform1iv(this.addr,u),qt(r,u));for(let f=0;f!==a;++f)n.setTexture2D(e[f]||cg,u[f])}function eM(s,e,n){const r=this.cache,a=e.length,u=Ul(n,a);Yt(r,u)||(s.uniform1iv(this.addr,u),qt(r,u));for(let f=0;f!==a;++f)n.setTexture3D(e[f]||dg,u[f])}function tM(s,e,n){const r=this.cache,a=e.length,u=Ul(n,a);Yt(r,u)||(s.uniform1iv(this.addr,u),qt(r,u));for(let f=0;f!==a;++f)n.setTextureCube(e[f]||hg,u[f])}function nM(s,e,n){const r=this.cache,a=e.length,u=Ul(n,a);Yt(r,u)||(s.uniform1iv(this.addr,u),qt(r,u));for(let f=0;f!==a;++f)n.setTexture2DArray(e[f]||fg,u[f])}function iM(s){switch(s){case 5126:return By;case 35664:return ky;case 35665:return zy;case 35666:return Hy;case 35674:return Vy;case 35675:return Gy;case 35676:return Wy;case 5124:case 35670:return Xy;case 35667:case 35671:return Yy;case 35668:case 35672:return qy;case 35669:case 35673:return jy;case 5125:return $y;case 36294:return Ky;case 36295:return Zy;case 36296:return Qy;case 35678:case 36198:case 36298:case 36306:case 35682:return Jy;case 35679:case 36299:case 36307:return eM;case 35680:case 36300:case 36308:case 36293:return tM;case 36289:case 36303:case 36311:case 36292:return nM}}class rM{constructor(e,n,r){this.id=e,this.addr=r,this.cache=[],this.type=n.type,this.setValue=Oy(n.type)}}class sM{constructor(e,n,r){this.id=e,this.addr=r,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=iM(n.type)}}class oM{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,r){const a=this.seq;for(let u=0,f=a.length;u!==f;++u){const d=a[u];d.setValue(e,n[d.id],r)}}}const Yc=/(\w+)(\])?(\[|\.)?/g;function pm(s,e){s.seq.push(e),s.map[e.id]=e}function aM(s,e,n){const r=s.name,a=r.length;for(Yc.lastIndex=0;;){const u=Yc.exec(r),f=Yc.lastIndex;let d=u[1];const p=u[2]==="]",m=u[3];if(p&&(d=d|0),m===void 0||m==="["&&f+2===a){pm(n,m===void 0?new rM(d,s,e):new sM(d,s,e));break}else{let S=n.map[d];S===void 0&&(S=new oM(d),pm(n,S)),n=S}}}class El{constructor(e,n){this.seq=[],this.map={};const r=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let a=0;a<r;++a){const u=e.getActiveUniform(n,a),f=e.getUniformLocation(n,u.name);aM(u,f,this)}}setValue(e,n,r,a){const u=this.map[n];u!==void 0&&u.setValue(e,r,a)}setOptional(e,n,r){const a=n[r];a!==void 0&&this.setValue(e,r,a)}static upload(e,n,r,a){for(let u=0,f=n.length;u!==f;++u){const d=n[u],p=r[d.id];p.needsUpdate!==!1&&d.setValue(e,p.value,a)}}static seqWithValue(e,n){const r=[];for(let a=0,u=e.length;a!==u;++a){const f=e[a];f.id in n&&r.push(f)}return r}}function mm(s,e,n){const r=s.createShader(e);return s.shaderSource(r,n),s.compileShader(r),r}const lM=37297;let uM=0;function cM(s,e){const n=s.split(`
`),r=[],a=Math.max(e-6,0),u=Math.min(e+6,n.length);for(let f=a;f<u;f++){const d=f+1;r.push(`${d===e?">":" "} ${d}: ${n[f]}`)}return r.join(`
`)}function fM(s){const e=Mt.getPrimaries(Mt.workingColorSpace),n=Mt.getPrimaries(s);let r;switch(e===n?r="":e===Al&&n===wl?r="LinearDisplayP3ToLinearSRGB":e===wl&&n===Al&&(r="LinearSRGBToLinearDisplayP3"),s){case _r:case Dl:return[r,"LinearTransferOETF"];case di:case qf:return[r,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",s),[r,"LinearTransferOETF"]}}function gm(s,e,n){const r=s.getShaderParameter(e,s.COMPILE_STATUS),a=s.getShaderInfoLog(e).trim();if(r&&a==="")return"";const u=/ERROR: 0:(\d+)/.exec(a);if(u){const f=parseInt(u[1]);return n.toUpperCase()+`

`+a+`

`+cM(s.getShaderSource(e),f)}else return a}function dM(s,e){const n=fM(e);return`vec4 ${s}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function hM(s,e){let n;switch(e){case Pv:n="Linear";break;case Lv:n="Reinhard";break;case bv:n="Cineon";break;case Dv:n="ACESFilmic";break;case Uv:n="AgX";break;case Nv:n="Neutral";break;case Iv:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+s+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const hl=new j;function pM(){Mt.getLuminanceCoefficients(hl);const s=hl.x.toFixed(4),e=hl.y.toFixed(4),n=hl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function mM(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Io).join(`
`)}function gM(s){const e=[];for(const n in s){const r=s[n];r!==!1&&e.push("#define "+n+" "+r)}return e.join(`
`)}function _M(s,e){const n={},r=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let a=0;a<r;a++){const u=s.getActiveAttrib(e,a),f=u.name;let d=1;u.type===s.FLOAT_MAT2&&(d=2),u.type===s.FLOAT_MAT3&&(d=3),u.type===s.FLOAT_MAT4&&(d=4),n[f]={type:u.type,location:s.getAttribLocation(e,f),locationSize:d}}return n}function Io(s){return s!==""}function _m(s,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function vm(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const vM=/^[ \t]*#include +<([\w\d./]+)>/gm;function Bf(s){return s.replace(vM,SM)}const xM=new Map;function SM(s,e){let n=it[e];if(n===void 0){const r=xM.get(e);if(r!==void 0)n=it[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return Bf(n)}const yM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function xm(s){return s.replace(yM,MM)}function MM(s,e,n,r){let a="";for(let u=parseInt(e);u<parseInt(n);u++)a+=r.replace(/\[\s*i\s*\]/g,"[ "+u+" ]").replace(/UNROLLED_LOOP_INDEX/g,u);return a}function Sm(s){let e=`precision ${s.precision} float;
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
#define LOW_PRECISION`),e}function EM(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Um?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===lv?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Ii&&(e="SHADOWMAP_TYPE_VSM"),e}function TM(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Fs:case Os:e="ENVMAP_TYPE_CUBE";break;case bl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function wM(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Os:e="ENVMAP_MODE_REFRACTION";break}return e}function AM(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Nm:e="ENVMAP_BLENDING_MULTIPLY";break;case Rv:e="ENVMAP_BLENDING_MIX";break;case Cv:e="ENVMAP_BLENDING_ADD";break}return e}function RM(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:r,maxMip:n}}function CM(s,e,n,r){const a=s.getContext(),u=n.defines;let f=n.vertexShader,d=n.fragmentShader;const p=EM(n),m=TM(n),_=wM(n),S=AM(n),x=RM(n),y=mM(n),w=gM(u),A=a.createProgram();let g,v,b=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(g=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,w].filter(Io).join(`
`),g.length>0&&(g+=`
`),v=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,w].filter(Io).join(`
`),v.length>0&&(v+=`
`)):(g=[Sm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,w,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+_:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+p:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Io).join(`
`),v=[Sm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,w,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+m:"",n.envMap?"#define "+_:"",n.envMap?"#define "+S:"",x?"#define CUBEUV_TEXEL_WIDTH "+x.texelWidth:"",x?"#define CUBEUV_TEXEL_HEIGHT "+x.texelHeight:"",x?"#define CUBEUV_MAX_MIP "+x.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+p:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==pr?"#define TONE_MAPPING":"",n.toneMapping!==pr?it.tonemapping_pars_fragment:"",n.toneMapping!==pr?hM("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",it.colorspace_pars_fragment,dM("linearToOutputTexel",n.outputColorSpace),pM(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Io).join(`
`)),f=Bf(f),f=_m(f,n),f=vm(f,n),d=Bf(d),d=_m(d,n),d=vm(d,n),f=xm(f),d=xm(d),n.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,g=[y,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,v=["#define varying in",n.glslVersion===Op?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Op?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);const P=b+g+f,L=b+v+d,X=mm(a,a.VERTEX_SHADER,P),F=mm(a,a.FRAGMENT_SHADER,L);a.attachShader(A,X),a.attachShader(A,F),n.index0AttributeName!==void 0?a.bindAttribLocation(A,0,n.index0AttributeName):n.morphTargets===!0&&a.bindAttribLocation(A,0,"position"),a.linkProgram(A);function I(C){if(s.debug.checkShaderErrors){const q=a.getProgramInfoLog(A).trim(),Z=a.getShaderInfoLog(X).trim(),ae=a.getShaderInfoLog(F).trim();let de=!0,ne=!0;if(a.getProgramParameter(A,a.LINK_STATUS)===!1)if(de=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(a,A,X,F);else{const le=gm(a,X,"vertex"),k=gm(a,F,"fragment");console.error("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(A,a.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+q+`
`+le+`
`+k)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(Z===""||ae==="")&&(ne=!1);ne&&(C.diagnostics={runnable:de,programLog:q,vertexShader:{log:Z,prefix:g},fragmentShader:{log:ae,prefix:v}})}a.deleteShader(X),a.deleteShader(F),H=new El(a,A),re=_M(a,A)}let H;this.getUniforms=function(){return H===void 0&&I(this),H};let re;this.getAttributes=function(){return re===void 0&&I(this),re};let M=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=a.getProgramParameter(A,lM)),M},this.destroy=function(){r.releaseStatesOfProgram(this),a.deleteProgram(A),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=uM++,this.cacheKey=e,this.usedTimes=1,this.program=A,this.vertexShader=X,this.fragmentShader=F,this}let PM=0;class LM{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,r=e.fragmentShader,a=this._getShaderStage(n),u=this._getShaderStage(r),f=this._getShaderCacheForMaterial(e);return f.has(a)===!1&&(f.add(a),a.usedTimes++),f.has(u)===!1&&(f.add(u),u.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const r of n)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let r=n.get(e);return r===void 0&&(r=new Set,n.set(e,r)),r}_getShaderStage(e){const n=this.shaderCache;let r=n.get(e);return r===void 0&&(r=new bM(e),n.set(e,r)),r}}class bM{constructor(e){this.id=PM++,this.code=e,this.usedTimes=0}}function DM(s,e,n,r,a,u,f){const d=new Jm,p=new LM,m=new Set,_=[],S=a.logarithmicDepthBuffer,x=a.reverseDepthBuffer,y=a.vertexTextures;let w=a.precision;const A={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(M){return m.add(M),M===0?"uv":`uv${M}`}function v(M,C,q,Z,ae){const de=Z.fog,ne=ae.geometry,le=M.isMeshStandardMaterial?Z.environment:null,k=(M.isMeshStandardMaterial?n:e).get(M.envMap||le),ce=k&&k.mapping===bl?k.image.height:null,oe=A[M.type];M.precision!==null&&(w=a.getMaxPrecision(M.precision),w!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",w,"instead."));const N=ne.morphAttributes.position||ne.morphAttributes.normal||ne.morphAttributes.color,ie=N!==void 0?N.length:0;let Ue=0;ne.morphAttributes.position!==void 0&&(Ue=1),ne.morphAttributes.normal!==void 0&&(Ue=2),ne.morphAttributes.color!==void 0&&(Ue=3);let Q,ue,xe,Se;if(oe){const jt=hi[oe];Q=jt.vertexShader,ue=jt.fragmentShader}else Q=M.vertexShader,ue=M.fragmentShader,p.update(M),xe=p.getVertexShaderID(M),Se=p.getFragmentShaderID(M);const Ce=s.getRenderTarget(),Pe=ae.isInstancedMesh===!0,Je=ae.isBatchedMesh===!0,mt=!!M.map,at=!!M.matcap,B=!!k,en=!!M.aoMap,ot=!!M.lightMap,ft=!!M.bumpMap,$e=!!M.normalMap,Tt=!!M.displacementMap,Ze=!!M.emissiveMap,D=!!M.metalnessMap,T=!!M.roughnessMap,K=M.anisotropy>0,he=M.clearcoat>0,_e=M.dispersion>0,fe=M.iridescence>0,Xe=M.sheen>0,we=M.transmission>0,Ne=K&&!!M.anisotropyMap,dt=he&&!!M.clearcoatMap,ye=he&&!!M.clearcoatNormalMap,Fe=he&&!!M.clearcoatRoughnessMap,et=fe&&!!M.iridescenceMap,Qe=fe&&!!M.iridescenceThicknessMap,Be=Xe&&!!M.sheenColorMap,lt=Xe&&!!M.sheenRoughnessMap,nt=!!M.specularMap,yt=!!M.specularColorMap,V=!!M.specularIntensityMap,Le=we&&!!M.transmissionMap,se=we&&!!M.thicknessMap,pe=!!M.gradientMap,Ae=!!M.alphaMap,De=M.alphaTest>0,ut=!!M.alphaHash,Ut=!!M.extensions;let tn=pr;M.toneMapped&&(Ce===null||Ce.isXRRenderTarget===!0)&&(tn=s.toneMapping);const ht={shaderID:oe,shaderType:M.type,shaderName:M.name,vertexShader:Q,fragmentShader:ue,defines:M.defines,customVertexShaderID:xe,customFragmentShaderID:Se,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:w,batching:Je,batchingColor:Je&&ae._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&ae.instanceColor!==null,instancingMorph:Pe&&ae.morphTexture!==null,supportsVertexTextures:y,outputColorSpace:Ce===null?s.outputColorSpace:Ce.isXRRenderTarget===!0?Ce.texture.colorSpace:_r,alphaToCoverage:!!M.alphaToCoverage,map:mt,matcap:at,envMap:B,envMapMode:B&&k.mapping,envMapCubeUVHeight:ce,aoMap:en,lightMap:ot,bumpMap:ft,normalMap:$e,displacementMap:y&&Tt,emissiveMap:Ze,normalMapObjectSpace:$e&&M.normalMapType===kv,normalMapTangentSpace:$e&&M.normalMapType===qm,metalnessMap:D,roughnessMap:T,anisotropy:K,anisotropyMap:Ne,clearcoat:he,clearcoatMap:dt,clearcoatNormalMap:ye,clearcoatRoughnessMap:Fe,dispersion:_e,iridescence:fe,iridescenceMap:et,iridescenceThicknessMap:Qe,sheen:Xe,sheenColorMap:Be,sheenRoughnessMap:lt,specularMap:nt,specularColorMap:yt,specularIntensityMap:V,transmission:we,transmissionMap:Le,thicknessMap:se,gradientMap:pe,opaque:M.transparent===!1&&M.blending===Ds&&M.alphaToCoverage===!1,alphaMap:Ae,alphaTest:De,alphaHash:ut,combine:M.combine,mapUv:mt&&g(M.map.channel),aoMapUv:en&&g(M.aoMap.channel),lightMapUv:ot&&g(M.lightMap.channel),bumpMapUv:ft&&g(M.bumpMap.channel),normalMapUv:$e&&g(M.normalMap.channel),displacementMapUv:Tt&&g(M.displacementMap.channel),emissiveMapUv:Ze&&g(M.emissiveMap.channel),metalnessMapUv:D&&g(M.metalnessMap.channel),roughnessMapUv:T&&g(M.roughnessMap.channel),anisotropyMapUv:Ne&&g(M.anisotropyMap.channel),clearcoatMapUv:dt&&g(M.clearcoatMap.channel),clearcoatNormalMapUv:ye&&g(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Fe&&g(M.clearcoatRoughnessMap.channel),iridescenceMapUv:et&&g(M.iridescenceMap.channel),iridescenceThicknessMapUv:Qe&&g(M.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&g(M.sheenColorMap.channel),sheenRoughnessMapUv:lt&&g(M.sheenRoughnessMap.channel),specularMapUv:nt&&g(M.specularMap.channel),specularColorMapUv:yt&&g(M.specularColorMap.channel),specularIntensityMapUv:V&&g(M.specularIntensityMap.channel),transmissionMapUv:Le&&g(M.transmissionMap.channel),thicknessMapUv:se&&g(M.thicknessMap.channel),alphaMapUv:Ae&&g(M.alphaMap.channel),vertexTangents:!!ne.attributes.tangent&&($e||K),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!ne.attributes.color&&ne.attributes.color.itemSize===4,pointsUvs:ae.isPoints===!0&&!!ne.attributes.uv&&(mt||Ae),fog:!!de,useFog:M.fog===!0,fogExp2:!!de&&de.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:S,reverseDepthBuffer:x,skinning:ae.isSkinnedMesh===!0,morphTargets:ne.morphAttributes.position!==void 0,morphNormals:ne.morphAttributes.normal!==void 0,morphColors:ne.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:Ue,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:f.numPlanes,numClipIntersection:f.numIntersection,dithering:M.dithering,shadowMapEnabled:s.shadowMap.enabled&&q.length>0,shadowMapType:s.shadowMap.type,toneMapping:tn,decodeVideoTexture:mt&&M.map.isVideoTexture===!0&&Mt.getTransfer(M.map.colorSpace)===bt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ui,flipSided:M.side===wn,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ut&&M.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ut&&M.extensions.multiDraw===!0||Je)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return ht.vertexUv1s=m.has(1),ht.vertexUv2s=m.has(2),ht.vertexUv3s=m.has(3),m.clear(),ht}function b(M){const C=[];if(M.shaderID?C.push(M.shaderID):(C.push(M.customVertexShaderID),C.push(M.customFragmentShaderID)),M.defines!==void 0)for(const q in M.defines)C.push(q),C.push(M.defines[q]);return M.isRawShaderMaterial===!1&&(P(C,M),L(C,M),C.push(s.outputColorSpace)),C.push(M.customProgramCacheKey),C.join()}function P(M,C){M.push(C.precision),M.push(C.outputColorSpace),M.push(C.envMapMode),M.push(C.envMapCubeUVHeight),M.push(C.mapUv),M.push(C.alphaMapUv),M.push(C.lightMapUv),M.push(C.aoMapUv),M.push(C.bumpMapUv),M.push(C.normalMapUv),M.push(C.displacementMapUv),M.push(C.emissiveMapUv),M.push(C.metalnessMapUv),M.push(C.roughnessMapUv),M.push(C.anisotropyMapUv),M.push(C.clearcoatMapUv),M.push(C.clearcoatNormalMapUv),M.push(C.clearcoatRoughnessMapUv),M.push(C.iridescenceMapUv),M.push(C.iridescenceThicknessMapUv),M.push(C.sheenColorMapUv),M.push(C.sheenRoughnessMapUv),M.push(C.specularMapUv),M.push(C.specularColorMapUv),M.push(C.specularIntensityMapUv),M.push(C.transmissionMapUv),M.push(C.thicknessMapUv),M.push(C.combine),M.push(C.fogExp2),M.push(C.sizeAttenuation),M.push(C.morphTargetsCount),M.push(C.morphAttributeCount),M.push(C.numDirLights),M.push(C.numPointLights),M.push(C.numSpotLights),M.push(C.numSpotLightMaps),M.push(C.numHemiLights),M.push(C.numRectAreaLights),M.push(C.numDirLightShadows),M.push(C.numPointLightShadows),M.push(C.numSpotLightShadows),M.push(C.numSpotLightShadowsWithMaps),M.push(C.numLightProbes),M.push(C.shadowMapType),M.push(C.toneMapping),M.push(C.numClippingPlanes),M.push(C.numClipIntersection),M.push(C.depthPacking)}function L(M,C){d.disableAll(),C.supportsVertexTextures&&d.enable(0),C.instancing&&d.enable(1),C.instancingColor&&d.enable(2),C.instancingMorph&&d.enable(3),C.matcap&&d.enable(4),C.envMap&&d.enable(5),C.normalMapObjectSpace&&d.enable(6),C.normalMapTangentSpace&&d.enable(7),C.clearcoat&&d.enable(8),C.iridescence&&d.enable(9),C.alphaTest&&d.enable(10),C.vertexColors&&d.enable(11),C.vertexAlphas&&d.enable(12),C.vertexUv1s&&d.enable(13),C.vertexUv2s&&d.enable(14),C.vertexUv3s&&d.enable(15),C.vertexTangents&&d.enable(16),C.anisotropy&&d.enable(17),C.alphaHash&&d.enable(18),C.batching&&d.enable(19),C.dispersion&&d.enable(20),C.batchingColor&&d.enable(21),M.push(d.mask),d.disableAll(),C.fog&&d.enable(0),C.useFog&&d.enable(1),C.flatShading&&d.enable(2),C.logarithmicDepthBuffer&&d.enable(3),C.reverseDepthBuffer&&d.enable(4),C.skinning&&d.enable(5),C.morphTargets&&d.enable(6),C.morphNormals&&d.enable(7),C.morphColors&&d.enable(8),C.premultipliedAlpha&&d.enable(9),C.shadowMapEnabled&&d.enable(10),C.doubleSided&&d.enable(11),C.flipSided&&d.enable(12),C.useDepthPacking&&d.enable(13),C.dithering&&d.enable(14),C.transmission&&d.enable(15),C.sheen&&d.enable(16),C.opaque&&d.enable(17),C.pointsUvs&&d.enable(18),C.decodeVideoTexture&&d.enable(19),C.alphaToCoverage&&d.enable(20),M.push(d.mask)}function X(M){const C=A[M.type];let q;if(C){const Z=hi[C];q=m0.clone(Z.uniforms)}else q=M.uniforms;return q}function F(M,C){let q;for(let Z=0,ae=_.length;Z<ae;Z++){const de=_[Z];if(de.cacheKey===C){q=de,++q.usedTimes;break}}return q===void 0&&(q=new CM(s,C,M,u),_.push(q)),q}function I(M){if(--M.usedTimes===0){const C=_.indexOf(M);_[C]=_[_.length-1],_.pop(),M.destroy()}}function H(M){p.remove(M)}function re(){p.dispose()}return{getParameters:v,getProgramCacheKey:b,getUniforms:X,acquireProgram:F,releaseProgram:I,releaseShaderCache:H,programs:_,dispose:re}}function IM(){let s=new WeakMap;function e(f){return s.has(f)}function n(f){let d=s.get(f);return d===void 0&&(d={},s.set(f,d)),d}function r(f){s.delete(f)}function a(f,d,p){s.get(f)[d]=p}function u(){s=new WeakMap}return{has:e,get:n,remove:r,update:a,dispose:u}}function UM(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function ym(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Mm(){const s=[];let e=0;const n=[],r=[],a=[];function u(){e=0,n.length=0,r.length=0,a.length=0}function f(S,x,y,w,A,g){let v=s[e];return v===void 0?(v={id:S.id,object:S,geometry:x,material:y,groupOrder:w,renderOrder:S.renderOrder,z:A,group:g},s[e]=v):(v.id=S.id,v.object=S,v.geometry=x,v.material=y,v.groupOrder=w,v.renderOrder=S.renderOrder,v.z=A,v.group=g),e++,v}function d(S,x,y,w,A,g){const v=f(S,x,y,w,A,g);y.transmission>0?r.push(v):y.transparent===!0?a.push(v):n.push(v)}function p(S,x,y,w,A,g){const v=f(S,x,y,w,A,g);y.transmission>0?r.unshift(v):y.transparent===!0?a.unshift(v):n.unshift(v)}function m(S,x){n.length>1&&n.sort(S||UM),r.length>1&&r.sort(x||ym),a.length>1&&a.sort(x||ym)}function _(){for(let S=e,x=s.length;S<x;S++){const y=s[S];if(y.id===null)break;y.id=null,y.object=null,y.geometry=null,y.material=null,y.group=null}}return{opaque:n,transmissive:r,transparent:a,init:u,push:d,unshift:p,finish:_,sort:m}}function NM(){let s=new WeakMap;function e(r,a){const u=s.get(r);let f;return u===void 0?(f=new Mm,s.set(r,[f])):a>=u.length?(f=new Mm,u.push(f)):f=u[a],f}function n(){s=new WeakMap}return{get:e,dispose:n}}function FM(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new j,color:new ct};break;case"SpotLight":n={position:new j,direction:new j,color:new ct,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new j,color:new ct,distance:0,decay:0};break;case"HemisphereLight":n={direction:new j,skyColor:new ct,groundColor:new ct};break;case"RectAreaLight":n={color:new ct,position:new j,halfWidth:new j,halfHeight:new j};break}return s[e.id]=n,n}}}function OM(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=n,n}}}let BM=0;function kM(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function zM(s){const e=new FM,n=OM(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let m=0;m<9;m++)r.probe.push(new j);const a=new j,u=new Ot,f=new Ot;function d(m){let _=0,S=0,x=0;for(let re=0;re<9;re++)r.probe[re].set(0,0,0);let y=0,w=0,A=0,g=0,v=0,b=0,P=0,L=0,X=0,F=0,I=0;m.sort(kM);for(let re=0,M=m.length;re<M;re++){const C=m[re],q=C.color,Z=C.intensity,ae=C.distance,de=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)_+=q.r*Z,S+=q.g*Z,x+=q.b*Z;else if(C.isLightProbe){for(let ne=0;ne<9;ne++)r.probe[ne].addScaledVector(C.sh.coefficients[ne],Z);I++}else if(C.isDirectionalLight){const ne=e.get(C);if(ne.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const le=C.shadow,k=n.get(C);k.shadowIntensity=le.intensity,k.shadowBias=le.bias,k.shadowNormalBias=le.normalBias,k.shadowRadius=le.radius,k.shadowMapSize=le.mapSize,r.directionalShadow[y]=k,r.directionalShadowMap[y]=de,r.directionalShadowMatrix[y]=C.shadow.matrix,b++}r.directional[y]=ne,y++}else if(C.isSpotLight){const ne=e.get(C);ne.position.setFromMatrixPosition(C.matrixWorld),ne.color.copy(q).multiplyScalar(Z),ne.distance=ae,ne.coneCos=Math.cos(C.angle),ne.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),ne.decay=C.decay,r.spot[A]=ne;const le=C.shadow;if(C.map&&(r.spotLightMap[X]=C.map,X++,le.updateMatrices(C),C.castShadow&&F++),r.spotLightMatrix[A]=le.matrix,C.castShadow){const k=n.get(C);k.shadowIntensity=le.intensity,k.shadowBias=le.bias,k.shadowNormalBias=le.normalBias,k.shadowRadius=le.radius,k.shadowMapSize=le.mapSize,r.spotShadow[A]=k,r.spotShadowMap[A]=de,L++}A++}else if(C.isRectAreaLight){const ne=e.get(C);ne.color.copy(q).multiplyScalar(Z),ne.halfWidth.set(C.width*.5,0,0),ne.halfHeight.set(0,C.height*.5,0),r.rectArea[g]=ne,g++}else if(C.isPointLight){const ne=e.get(C);if(ne.color.copy(C.color).multiplyScalar(C.intensity),ne.distance=C.distance,ne.decay=C.decay,C.castShadow){const le=C.shadow,k=n.get(C);k.shadowIntensity=le.intensity,k.shadowBias=le.bias,k.shadowNormalBias=le.normalBias,k.shadowRadius=le.radius,k.shadowMapSize=le.mapSize,k.shadowCameraNear=le.camera.near,k.shadowCameraFar=le.camera.far,r.pointShadow[w]=k,r.pointShadowMap[w]=de,r.pointShadowMatrix[w]=C.shadow.matrix,P++}r.point[w]=ne,w++}else if(C.isHemisphereLight){const ne=e.get(C);ne.skyColor.copy(C.color).multiplyScalar(Z),ne.groundColor.copy(C.groundColor).multiplyScalar(Z),r.hemi[v]=ne,v++}}g>0&&(s.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Re.LTC_FLOAT_1,r.rectAreaLTC2=Re.LTC_FLOAT_2):(r.rectAreaLTC1=Re.LTC_HALF_1,r.rectAreaLTC2=Re.LTC_HALF_2)),r.ambient[0]=_,r.ambient[1]=S,r.ambient[2]=x;const H=r.hash;(H.directionalLength!==y||H.pointLength!==w||H.spotLength!==A||H.rectAreaLength!==g||H.hemiLength!==v||H.numDirectionalShadows!==b||H.numPointShadows!==P||H.numSpotShadows!==L||H.numSpotMaps!==X||H.numLightProbes!==I)&&(r.directional.length=y,r.spot.length=A,r.rectArea.length=g,r.point.length=w,r.hemi.length=v,r.directionalShadow.length=b,r.directionalShadowMap.length=b,r.pointShadow.length=P,r.pointShadowMap.length=P,r.spotShadow.length=L,r.spotShadowMap.length=L,r.directionalShadowMatrix.length=b,r.pointShadowMatrix.length=P,r.spotLightMatrix.length=L+X-F,r.spotLightMap.length=X,r.numSpotLightShadowsWithMaps=F,r.numLightProbes=I,H.directionalLength=y,H.pointLength=w,H.spotLength=A,H.rectAreaLength=g,H.hemiLength=v,H.numDirectionalShadows=b,H.numPointShadows=P,H.numSpotShadows=L,H.numSpotMaps=X,H.numLightProbes=I,r.version=BM++)}function p(m,_){let S=0,x=0,y=0,w=0,A=0;const g=_.matrixWorldInverse;for(let v=0,b=m.length;v<b;v++){const P=m[v];if(P.isDirectionalLight){const L=r.directional[S];L.direction.setFromMatrixPosition(P.matrixWorld),a.setFromMatrixPosition(P.target.matrixWorld),L.direction.sub(a),L.direction.transformDirection(g),S++}else if(P.isSpotLight){const L=r.spot[y];L.position.setFromMatrixPosition(P.matrixWorld),L.position.applyMatrix4(g),L.direction.setFromMatrixPosition(P.matrixWorld),a.setFromMatrixPosition(P.target.matrixWorld),L.direction.sub(a),L.direction.transformDirection(g),y++}else if(P.isRectAreaLight){const L=r.rectArea[w];L.position.setFromMatrixPosition(P.matrixWorld),L.position.applyMatrix4(g),f.identity(),u.copy(P.matrixWorld),u.premultiply(g),f.extractRotation(u),L.halfWidth.set(P.width*.5,0,0),L.halfHeight.set(0,P.height*.5,0),L.halfWidth.applyMatrix4(f),L.halfHeight.applyMatrix4(f),w++}else if(P.isPointLight){const L=r.point[x];L.position.setFromMatrixPosition(P.matrixWorld),L.position.applyMatrix4(g),x++}else if(P.isHemisphereLight){const L=r.hemi[A];L.direction.setFromMatrixPosition(P.matrixWorld),L.direction.transformDirection(g),A++}}}return{setup:d,setupView:p,state:r}}function Em(s){const e=new zM(s),n=[],r=[];function a(_){m.camera=_,n.length=0,r.length=0}function u(_){n.push(_)}function f(_){r.push(_)}function d(){e.setup(n)}function p(_){e.setupView(n,_)}const m={lightsArray:n,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:a,state:m,setupLights:d,setupLightsView:p,pushLight:u,pushShadow:f}}function HM(s){let e=new WeakMap;function n(a,u=0){const f=e.get(a);let d;return f===void 0?(d=new Em(s),e.set(a,[d])):u>=f.length?(d=new Em(s),f.push(d)):d=f[u],d}function r(){e=new WeakMap}return{get:n,dispose:r}}class VM extends Vs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ov,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class GM extends Vs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const WM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,XM=`uniform sampler2D shadow_pass;
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
}`;function YM(s,e,n){let r=new jf;const a=new pt,u=new pt,f=new kt,d=new VM({depthPacking:Bv}),p=new GM,m={},_=n.maxTextureSize,S={[mr]:wn,[wn]:mr,[Ui]:Ui},x=new gr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pt},radius:{value:4}},vertexShader:WM,fragmentShader:XM}),y=x.clone();y.defines.HORIZONTAL_PASS=1;const w=new oi;w.setAttribute("position",new pi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const A=new Yn(w,x),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Um;let v=this.type;this.render=function(F,I,H){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||F.length===0)return;const re=s.getRenderTarget(),M=s.getActiveCubeFace(),C=s.getActiveMipmapLevel(),q=s.state;q.setBlending(hr),q.buffers.color.setClear(1,1,1,1),q.buffers.depth.setTest(!0),q.setScissorTest(!1);const Z=v!==Ii&&this.type===Ii,ae=v===Ii&&this.type!==Ii;for(let de=0,ne=F.length;de<ne;de++){const le=F[de],k=le.shadow;if(k===void 0){console.warn("THREE.WebGLShadowMap:",le,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;a.copy(k.mapSize);const ce=k.getFrameExtents();if(a.multiply(ce),u.copy(k.mapSize),(a.x>_||a.y>_)&&(a.x>_&&(u.x=Math.floor(_/ce.x),a.x=u.x*ce.x,k.mapSize.x=u.x),a.y>_&&(u.y=Math.floor(_/ce.y),a.y=u.y*ce.y,k.mapSize.y=u.y)),k.map===null||Z===!0||ae===!0){const N=this.type!==Ii?{minFilter:Xn,magFilter:Xn}:{};k.map!==null&&k.map.dispose(),k.map=new Wr(a.x,a.y,N),k.map.texture.name=le.name+".shadowMap",k.camera.updateProjectionMatrix()}s.setRenderTarget(k.map),s.clear();const oe=k.getViewportCount();for(let N=0;N<oe;N++){const ie=k.getViewport(N);f.set(u.x*ie.x,u.y*ie.y,u.x*ie.z,u.y*ie.w),q.viewport(f),k.updateMatrices(le,N),r=k.getFrustum(),L(I,H,k.camera,le,this.type)}k.isPointLightShadow!==!0&&this.type===Ii&&b(k,H),k.needsUpdate=!1}v=this.type,g.needsUpdate=!1,s.setRenderTarget(re,M,C)};function b(F,I){const H=e.update(A);x.defines.VSM_SAMPLES!==F.blurSamples&&(x.defines.VSM_SAMPLES=F.blurSamples,y.defines.VSM_SAMPLES=F.blurSamples,x.needsUpdate=!0,y.needsUpdate=!0),F.mapPass===null&&(F.mapPass=new Wr(a.x,a.y)),x.uniforms.shadow_pass.value=F.map.texture,x.uniforms.resolution.value=F.mapSize,x.uniforms.radius.value=F.radius,s.setRenderTarget(F.mapPass),s.clear(),s.renderBufferDirect(I,null,H,x,A,null),y.uniforms.shadow_pass.value=F.mapPass.texture,y.uniforms.resolution.value=F.mapSize,y.uniforms.radius.value=F.radius,s.setRenderTarget(F.map),s.clear(),s.renderBufferDirect(I,null,H,y,A,null)}function P(F,I,H,re){let M=null;const C=H.isPointLight===!0?F.customDistanceMaterial:F.customDepthMaterial;if(C!==void 0)M=C;else if(M=H.isPointLight===!0?p:d,s.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0){const q=M.uuid,Z=I.uuid;let ae=m[q];ae===void 0&&(ae={},m[q]=ae);let de=ae[Z];de===void 0&&(de=M.clone(),ae[Z]=de,I.addEventListener("dispose",X)),M=de}if(M.visible=I.visible,M.wireframe=I.wireframe,re===Ii?M.side=I.shadowSide!==null?I.shadowSide:I.side:M.side=I.shadowSide!==null?I.shadowSide:S[I.side],M.alphaMap=I.alphaMap,M.alphaTest=I.alphaTest,M.map=I.map,M.clipShadows=I.clipShadows,M.clippingPlanes=I.clippingPlanes,M.clipIntersection=I.clipIntersection,M.displacementMap=I.displacementMap,M.displacementScale=I.displacementScale,M.displacementBias=I.displacementBias,M.wireframeLinewidth=I.wireframeLinewidth,M.linewidth=I.linewidth,H.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const q=s.properties.get(M);q.light=H}return M}function L(F,I,H,re,M){if(F.visible===!1)return;if(F.layers.test(I.layers)&&(F.isMesh||F.isLine||F.isPoints)&&(F.castShadow||F.receiveShadow&&M===Ii)&&(!F.frustumCulled||r.intersectsObject(F))){F.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,F.matrixWorld);const Z=e.update(F),ae=F.material;if(Array.isArray(ae)){const de=Z.groups;for(let ne=0,le=de.length;ne<le;ne++){const k=de[ne],ce=ae[k.materialIndex];if(ce&&ce.visible){const oe=P(F,ce,re,M);F.onBeforeShadow(s,F,I,H,Z,oe,k),s.renderBufferDirect(H,null,Z,oe,F,k),F.onAfterShadow(s,F,I,H,Z,oe,k)}}}else if(ae.visible){const de=P(F,ae,re,M);F.onBeforeShadow(s,F,I,H,Z,de,null),s.renderBufferDirect(H,null,Z,de,F,null),F.onAfterShadow(s,F,I,H,Z,de,null)}}const q=F.children;for(let Z=0,ae=q.length;Z<ae;Z++)L(q[Z],I,H,re,M)}function X(F){F.target.removeEventListener("dispose",X);for(const H in m){const re=m[H],M=F.target.uuid;M in re&&(re[M].dispose(),delete re[M])}}}const qM={[Jc]:ef,[tf]:sf,[nf]:of,[Ns]:rf,[ef]:Jc,[sf]:tf,[of]:nf,[rf]:Ns};function jM(s){function e(){let V=!1;const Le=new kt;let se=null;const pe=new kt(0,0,0,0);return{setMask:function(Ae){se!==Ae&&!V&&(s.colorMask(Ae,Ae,Ae,Ae),se=Ae)},setLocked:function(Ae){V=Ae},setClear:function(Ae,De,ut,Ut,tn){tn===!0&&(Ae*=Ut,De*=Ut,ut*=Ut),Le.set(Ae,De,ut,Ut),pe.equals(Le)===!1&&(s.clearColor(Ae,De,ut,Ut),pe.copy(Le))},reset:function(){V=!1,se=null,pe.set(-1,0,0,0)}}}function n(){let V=!1,Le=!1,se=null,pe=null,Ae=null;return{setReversed:function(De){Le=De},setTest:function(De){De?xe(s.DEPTH_TEST):Se(s.DEPTH_TEST)},setMask:function(De){se!==De&&!V&&(s.depthMask(De),se=De)},setFunc:function(De){if(Le&&(De=qM[De]),pe!==De){switch(De){case Jc:s.depthFunc(s.NEVER);break;case ef:s.depthFunc(s.ALWAYS);break;case tf:s.depthFunc(s.LESS);break;case Ns:s.depthFunc(s.LEQUAL);break;case nf:s.depthFunc(s.EQUAL);break;case rf:s.depthFunc(s.GEQUAL);break;case sf:s.depthFunc(s.GREATER);break;case of:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}pe=De}},setLocked:function(De){V=De},setClear:function(De){Ae!==De&&(s.clearDepth(De),Ae=De)},reset:function(){V=!1,se=null,pe=null,Ae=null}}}function r(){let V=!1,Le=null,se=null,pe=null,Ae=null,De=null,ut=null,Ut=null,tn=null;return{setTest:function(ht){V||(ht?xe(s.STENCIL_TEST):Se(s.STENCIL_TEST))},setMask:function(ht){Le!==ht&&!V&&(s.stencilMask(ht),Le=ht)},setFunc:function(ht,jt,Fn){(se!==ht||pe!==jt||Ae!==Fn)&&(s.stencilFunc(ht,jt,Fn),se=ht,pe=jt,Ae=Fn)},setOp:function(ht,jt,Fn){(De!==ht||ut!==jt||Ut!==Fn)&&(s.stencilOp(ht,jt,Fn),De=ht,ut=jt,Ut=Fn)},setLocked:function(ht){V=ht},setClear:function(ht){tn!==ht&&(s.clearStencil(ht),tn=ht)},reset:function(){V=!1,Le=null,se=null,pe=null,Ae=null,De=null,ut=null,Ut=null,tn=null}}}const a=new e,u=new n,f=new r,d=new WeakMap,p=new WeakMap;let m={},_={},S=new WeakMap,x=[],y=null,w=!1,A=null,g=null,v=null,b=null,P=null,L=null,X=null,F=new ct(0,0,0),I=0,H=!1,re=null,M=null,C=null,q=null,Z=null;const ae=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let de=!1,ne=0;const le=s.getParameter(s.VERSION);le.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(le)[1]),de=ne>=1):le.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(le)[1]),de=ne>=2);let k=null,ce={};const oe=s.getParameter(s.SCISSOR_BOX),N=s.getParameter(s.VIEWPORT),ie=new kt().fromArray(oe),Ue=new kt().fromArray(N);function Q(V,Le,se,pe){const Ae=new Uint8Array(4),De=s.createTexture();s.bindTexture(V,De),s.texParameteri(V,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(V,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let ut=0;ut<se;ut++)V===s.TEXTURE_3D||V===s.TEXTURE_2D_ARRAY?s.texImage3D(Le,0,s.RGBA,1,1,pe,0,s.RGBA,s.UNSIGNED_BYTE,Ae):s.texImage2D(Le+ut,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Ae);return De}const ue={};ue[s.TEXTURE_2D]=Q(s.TEXTURE_2D,s.TEXTURE_2D,1),ue[s.TEXTURE_CUBE_MAP]=Q(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[s.TEXTURE_2D_ARRAY]=Q(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),ue[s.TEXTURE_3D]=Q(s.TEXTURE_3D,s.TEXTURE_3D,1,1),a.setClear(0,0,0,1),u.setClear(1),f.setClear(0),xe(s.DEPTH_TEST),u.setFunc(Ns),ot(!1),ft(bp),xe(s.CULL_FACE),B(hr);function xe(V){m[V]!==!0&&(s.enable(V),m[V]=!0)}function Se(V){m[V]!==!1&&(s.disable(V),m[V]=!1)}function Ce(V,Le){return _[V]!==Le?(s.bindFramebuffer(V,Le),_[V]=Le,V===s.DRAW_FRAMEBUFFER&&(_[s.FRAMEBUFFER]=Le),V===s.FRAMEBUFFER&&(_[s.DRAW_FRAMEBUFFER]=Le),!0):!1}function Pe(V,Le){let se=x,pe=!1;if(V){se=S.get(Le),se===void 0&&(se=[],S.set(Le,se));const Ae=V.textures;if(se.length!==Ae.length||se[0]!==s.COLOR_ATTACHMENT0){for(let De=0,ut=Ae.length;De<ut;De++)se[De]=s.COLOR_ATTACHMENT0+De;se.length=Ae.length,pe=!0}}else se[0]!==s.BACK&&(se[0]=s.BACK,pe=!0);pe&&s.drawBuffers(se)}function Je(V){return y!==V?(s.useProgram(V),y=V,!0):!1}const mt={[kr]:s.FUNC_ADD,[cv]:s.FUNC_SUBTRACT,[fv]:s.FUNC_REVERSE_SUBTRACT};mt[dv]=s.MIN,mt[hv]=s.MAX;const at={[pv]:s.ZERO,[mv]:s.ONE,[gv]:s.SRC_COLOR,[Zc]:s.SRC_ALPHA,[Mv]:s.SRC_ALPHA_SATURATE,[Sv]:s.DST_COLOR,[vv]:s.DST_ALPHA,[_v]:s.ONE_MINUS_SRC_COLOR,[Qc]:s.ONE_MINUS_SRC_ALPHA,[yv]:s.ONE_MINUS_DST_COLOR,[xv]:s.ONE_MINUS_DST_ALPHA,[Ev]:s.CONSTANT_COLOR,[Tv]:s.ONE_MINUS_CONSTANT_COLOR,[wv]:s.CONSTANT_ALPHA,[Av]:s.ONE_MINUS_CONSTANT_ALPHA};function B(V,Le,se,pe,Ae,De,ut,Ut,tn,ht){if(V===hr){w===!0&&(Se(s.BLEND),w=!1);return}if(w===!1&&(xe(s.BLEND),w=!0),V!==uv){if(V!==A||ht!==H){if((g!==kr||P!==kr)&&(s.blendEquation(s.FUNC_ADD),g=kr,P=kr),ht)switch(V){case Ds:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Dp:s.blendFunc(s.ONE,s.ONE);break;case Ip:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Up:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}else switch(V){case Ds:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Dp:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Ip:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Up:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}v=null,b=null,L=null,X=null,F.set(0,0,0),I=0,A=V,H=ht}return}Ae=Ae||Le,De=De||se,ut=ut||pe,(Le!==g||Ae!==P)&&(s.blendEquationSeparate(mt[Le],mt[Ae]),g=Le,P=Ae),(se!==v||pe!==b||De!==L||ut!==X)&&(s.blendFuncSeparate(at[se],at[pe],at[De],at[ut]),v=se,b=pe,L=De,X=ut),(Ut.equals(F)===!1||tn!==I)&&(s.blendColor(Ut.r,Ut.g,Ut.b,tn),F.copy(Ut),I=tn),A=V,H=!1}function en(V,Le){V.side===Ui?Se(s.CULL_FACE):xe(s.CULL_FACE);let se=V.side===wn;Le&&(se=!se),ot(se),V.blending===Ds&&V.transparent===!1?B(hr):B(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),u.setFunc(V.depthFunc),u.setTest(V.depthTest),u.setMask(V.depthWrite),a.setMask(V.colorWrite);const pe=V.stencilWrite;f.setTest(pe),pe&&(f.setMask(V.stencilWriteMask),f.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),f.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),Tt(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?xe(s.SAMPLE_ALPHA_TO_COVERAGE):Se(s.SAMPLE_ALPHA_TO_COVERAGE)}function ot(V){re!==V&&(V?s.frontFace(s.CW):s.frontFace(s.CCW),re=V)}function ft(V){V!==ov?(xe(s.CULL_FACE),V!==M&&(V===bp?s.cullFace(s.BACK):V===av?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Se(s.CULL_FACE),M=V}function $e(V){V!==C&&(de&&s.lineWidth(V),C=V)}function Tt(V,Le,se){V?(xe(s.POLYGON_OFFSET_FILL),(q!==Le||Z!==se)&&(s.polygonOffset(Le,se),q=Le,Z=se)):Se(s.POLYGON_OFFSET_FILL)}function Ze(V){V?xe(s.SCISSOR_TEST):Se(s.SCISSOR_TEST)}function D(V){V===void 0&&(V=s.TEXTURE0+ae-1),k!==V&&(s.activeTexture(V),k=V)}function T(V,Le,se){se===void 0&&(k===null?se=s.TEXTURE0+ae-1:se=k);let pe=ce[se];pe===void 0&&(pe={type:void 0,texture:void 0},ce[se]=pe),(pe.type!==V||pe.texture!==Le)&&(k!==se&&(s.activeTexture(se),k=se),s.bindTexture(V,Le||ue[V]),pe.type=V,pe.texture=Le)}function K(){const V=ce[k];V!==void 0&&V.type!==void 0&&(s.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function he(){try{s.compressedTexImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function _e(){try{s.compressedTexImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function fe(){try{s.texSubImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Xe(){try{s.texSubImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function we(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ne(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function dt(){try{s.texStorage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ye(){try{s.texStorage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Fe(){try{s.texImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function et(){try{s.texImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Qe(V){ie.equals(V)===!1&&(s.scissor(V.x,V.y,V.z,V.w),ie.copy(V))}function Be(V){Ue.equals(V)===!1&&(s.viewport(V.x,V.y,V.z,V.w),Ue.copy(V))}function lt(V,Le){let se=p.get(Le);se===void 0&&(se=new WeakMap,p.set(Le,se));let pe=se.get(V);pe===void 0&&(pe=s.getUniformBlockIndex(Le,V.name),se.set(V,pe))}function nt(V,Le){const pe=p.get(Le).get(V);d.get(Le)!==pe&&(s.uniformBlockBinding(Le,pe,V.__bindingPointIndex),d.set(Le,pe))}function yt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),m={},k=null,ce={},_={},S=new WeakMap,x=[],y=null,w=!1,A=null,g=null,v=null,b=null,P=null,L=null,X=null,F=new ct(0,0,0),I=0,H=!1,re=null,M=null,C=null,q=null,Z=null,ie.set(0,0,s.canvas.width,s.canvas.height),Ue.set(0,0,s.canvas.width,s.canvas.height),a.reset(),u.reset(),f.reset()}return{buffers:{color:a,depth:u,stencil:f},enable:xe,disable:Se,bindFramebuffer:Ce,drawBuffers:Pe,useProgram:Je,setBlending:B,setMaterial:en,setFlipSided:ot,setCullFace:ft,setLineWidth:$e,setPolygonOffset:Tt,setScissorTest:Ze,activeTexture:D,bindTexture:T,unbindTexture:K,compressedTexImage2D:he,compressedTexImage3D:_e,texImage2D:Fe,texImage3D:et,updateUBOMapping:lt,uniformBlockBinding:nt,texStorage2D:dt,texStorage3D:ye,texSubImage2D:fe,texSubImage3D:Xe,compressedTexSubImage2D:we,compressedTexSubImage3D:Ne,scissor:Qe,viewport:Be,reset:yt}}function Tm(s,e,n,r){const a=$M(r);switch(n){case zm:return s*e;case Vm:return s*e;case Gm:return s*e*2;case Wm:return s*e/a.components*a.byteLength;case Wf:return s*e/a.components*a.byteLength;case Xm:return s*e*2/a.components*a.byteLength;case Xf:return s*e*2/a.components*a.byteLength;case Hm:return s*e*3/a.components*a.byteLength;case si:return s*e*4/a.components*a.byteLength;case Yf:return s*e*4/a.components*a.byteLength;case _l:case vl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case xl:case Sl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case df:case pf:return Math.max(s,16)*Math.max(e,8)/4;case ff:case hf:return Math.max(s,8)*Math.max(e,8)/2;case mf:case gf:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case _f:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case vf:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case xf:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Sf:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case yf:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Mf:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Ef:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Tf:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case wf:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Af:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Rf:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Cf:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Pf:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Lf:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case bf:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case yl:case Df:case If:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Ym:case Uf:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Nf:case Ff:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function $M(s){switch(s){case Oi:case Om:return{byteLength:1,components:1};case No:case Bm:case Fo:return{byteLength:2,components:1};case Vf:case Gf:return{byteLength:2,components:4};case Gr:case Hf:case Ni:return{byteLength:4,components:1};case km:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function KM(s,e,n,r,a,u,f){const d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,p=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),m=new pt,_=new WeakMap;let S;const x=new WeakMap;let y=!1;try{y=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function w(D,T){return y?new OffscreenCanvas(D,T):Cl("canvas")}function A(D,T,K){let he=1;const _e=Ze(D);if((_e.width>K||_e.height>K)&&(he=K/Math.max(_e.width,_e.height)),he<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const fe=Math.floor(he*_e.width),Xe=Math.floor(he*_e.height);S===void 0&&(S=w(fe,Xe));const we=T?w(fe,Xe):S;return we.width=fe,we.height=Xe,we.getContext("2d").drawImage(D,0,0,fe,Xe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+_e.width+"x"+_e.height+") to ("+fe+"x"+Xe+")."),we}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+_e.width+"x"+_e.height+")."),D;return D}function g(D){return D.generateMipmaps&&D.minFilter!==Xn&&D.minFilter!==ii}function v(D){s.generateMipmap(D)}function b(D,T,K,he,_e=!1){if(D!==null){if(s[D]!==void 0)return s[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let fe=T;if(T===s.RED&&(K===s.FLOAT&&(fe=s.R32F),K===s.HALF_FLOAT&&(fe=s.R16F),K===s.UNSIGNED_BYTE&&(fe=s.R8)),T===s.RED_INTEGER&&(K===s.UNSIGNED_BYTE&&(fe=s.R8UI),K===s.UNSIGNED_SHORT&&(fe=s.R16UI),K===s.UNSIGNED_INT&&(fe=s.R32UI),K===s.BYTE&&(fe=s.R8I),K===s.SHORT&&(fe=s.R16I),K===s.INT&&(fe=s.R32I)),T===s.RG&&(K===s.FLOAT&&(fe=s.RG32F),K===s.HALF_FLOAT&&(fe=s.RG16F),K===s.UNSIGNED_BYTE&&(fe=s.RG8)),T===s.RG_INTEGER&&(K===s.UNSIGNED_BYTE&&(fe=s.RG8UI),K===s.UNSIGNED_SHORT&&(fe=s.RG16UI),K===s.UNSIGNED_INT&&(fe=s.RG32UI),K===s.BYTE&&(fe=s.RG8I),K===s.SHORT&&(fe=s.RG16I),K===s.INT&&(fe=s.RG32I)),T===s.RGB_INTEGER&&(K===s.UNSIGNED_BYTE&&(fe=s.RGB8UI),K===s.UNSIGNED_SHORT&&(fe=s.RGB16UI),K===s.UNSIGNED_INT&&(fe=s.RGB32UI),K===s.BYTE&&(fe=s.RGB8I),K===s.SHORT&&(fe=s.RGB16I),K===s.INT&&(fe=s.RGB32I)),T===s.RGBA_INTEGER&&(K===s.UNSIGNED_BYTE&&(fe=s.RGBA8UI),K===s.UNSIGNED_SHORT&&(fe=s.RGBA16UI),K===s.UNSIGNED_INT&&(fe=s.RGBA32UI),K===s.BYTE&&(fe=s.RGBA8I),K===s.SHORT&&(fe=s.RGBA16I),K===s.INT&&(fe=s.RGBA32I)),T===s.RGB&&K===s.UNSIGNED_INT_5_9_9_9_REV&&(fe=s.RGB9_E5),T===s.RGBA){const Xe=_e?Tl:Mt.getTransfer(he);K===s.FLOAT&&(fe=s.RGBA32F),K===s.HALF_FLOAT&&(fe=s.RGBA16F),K===s.UNSIGNED_BYTE&&(fe=Xe===bt?s.SRGB8_ALPHA8:s.RGBA8),K===s.UNSIGNED_SHORT_4_4_4_4&&(fe=s.RGBA4),K===s.UNSIGNED_SHORT_5_5_5_1&&(fe=s.RGB5_A1)}return(fe===s.R16F||fe===s.R32F||fe===s.RG16F||fe===s.RG32F||fe===s.RGBA16F||fe===s.RGBA32F)&&e.get("EXT_color_buffer_float"),fe}function P(D,T){let K;return D?T===null||T===Gr||T===Bs?K=s.DEPTH24_STENCIL8:T===Ni?K=s.DEPTH32F_STENCIL8:T===No&&(K=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===Gr||T===Bs?K=s.DEPTH_COMPONENT24:T===Ni?K=s.DEPTH_COMPONENT32F:T===No&&(K=s.DEPTH_COMPONENT16),K}function L(D,T){return g(D)===!0||D.isFramebufferTexture&&D.minFilter!==Xn&&D.minFilter!==ii?Math.log2(Math.max(T.width,T.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?T.mipmaps.length:1}function X(D){const T=D.target;T.removeEventListener("dispose",X),I(T),T.isVideoTexture&&_.delete(T)}function F(D){const T=D.target;T.removeEventListener("dispose",F),re(T)}function I(D){const T=r.get(D);if(T.__webglInit===void 0)return;const K=D.source,he=x.get(K);if(he){const _e=he[T.__cacheKey];_e.usedTimes--,_e.usedTimes===0&&H(D),Object.keys(he).length===0&&x.delete(K)}r.remove(D)}function H(D){const T=r.get(D);s.deleteTexture(T.__webglTexture);const K=D.source,he=x.get(K);delete he[T.__cacheKey],f.memory.textures--}function re(D){const T=r.get(D);if(D.depthTexture&&D.depthTexture.dispose(),D.isWebGLCubeRenderTarget)for(let he=0;he<6;he++){if(Array.isArray(T.__webglFramebuffer[he]))for(let _e=0;_e<T.__webglFramebuffer[he].length;_e++)s.deleteFramebuffer(T.__webglFramebuffer[he][_e]);else s.deleteFramebuffer(T.__webglFramebuffer[he]);T.__webglDepthbuffer&&s.deleteRenderbuffer(T.__webglDepthbuffer[he])}else{if(Array.isArray(T.__webglFramebuffer))for(let he=0;he<T.__webglFramebuffer.length;he++)s.deleteFramebuffer(T.__webglFramebuffer[he]);else s.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&s.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&s.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let he=0;he<T.__webglColorRenderbuffer.length;he++)T.__webglColorRenderbuffer[he]&&s.deleteRenderbuffer(T.__webglColorRenderbuffer[he]);T.__webglDepthRenderbuffer&&s.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const K=D.textures;for(let he=0,_e=K.length;he<_e;he++){const fe=r.get(K[he]);fe.__webglTexture&&(s.deleteTexture(fe.__webglTexture),f.memory.textures--),r.remove(K[he])}r.remove(D)}let M=0;function C(){M=0}function q(){const D=M;return D>=a.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+a.maxTextures),M+=1,D}function Z(D){const T=[];return T.push(D.wrapS),T.push(D.wrapT),T.push(D.wrapR||0),T.push(D.magFilter),T.push(D.minFilter),T.push(D.anisotropy),T.push(D.internalFormat),T.push(D.format),T.push(D.type),T.push(D.generateMipmaps),T.push(D.premultiplyAlpha),T.push(D.flipY),T.push(D.unpackAlignment),T.push(D.colorSpace),T.join()}function ae(D,T){const K=r.get(D);if(D.isVideoTexture&&$e(D),D.isRenderTargetTexture===!1&&D.version>0&&K.__version!==D.version){const he=D.image;if(he===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(he.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Ue(K,D,T);return}}n.bindTexture(s.TEXTURE_2D,K.__webglTexture,s.TEXTURE0+T)}function de(D,T){const K=r.get(D);if(D.version>0&&K.__version!==D.version){Ue(K,D,T);return}n.bindTexture(s.TEXTURE_2D_ARRAY,K.__webglTexture,s.TEXTURE0+T)}function ne(D,T){const K=r.get(D);if(D.version>0&&K.__version!==D.version){Ue(K,D,T);return}n.bindTexture(s.TEXTURE_3D,K.__webglTexture,s.TEXTURE0+T)}function le(D,T){const K=r.get(D);if(D.version>0&&K.__version!==D.version){Q(K,D,T);return}n.bindTexture(s.TEXTURE_CUBE_MAP,K.__webglTexture,s.TEXTURE0+T)}const k={[uf]:s.REPEAT,[Hr]:s.CLAMP_TO_EDGE,[cf]:s.MIRRORED_REPEAT},ce={[Xn]:s.NEAREST,[Fv]:s.NEAREST_MIPMAP_NEAREST,[qa]:s.NEAREST_MIPMAP_LINEAR,[ii]:s.LINEAR,[_c]:s.LINEAR_MIPMAP_NEAREST,[Vr]:s.LINEAR_MIPMAP_LINEAR},oe={[zv]:s.NEVER,[Yv]:s.ALWAYS,[Hv]:s.LESS,[jm]:s.LEQUAL,[Vv]:s.EQUAL,[Xv]:s.GEQUAL,[Gv]:s.GREATER,[Wv]:s.NOTEQUAL};function N(D,T){if(T.type===Ni&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===ii||T.magFilter===_c||T.magFilter===qa||T.magFilter===Vr||T.minFilter===ii||T.minFilter===_c||T.minFilter===qa||T.minFilter===Vr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(D,s.TEXTURE_WRAP_S,k[T.wrapS]),s.texParameteri(D,s.TEXTURE_WRAP_T,k[T.wrapT]),(D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY)&&s.texParameteri(D,s.TEXTURE_WRAP_R,k[T.wrapR]),s.texParameteri(D,s.TEXTURE_MAG_FILTER,ce[T.magFilter]),s.texParameteri(D,s.TEXTURE_MIN_FILTER,ce[T.minFilter]),T.compareFunction&&(s.texParameteri(D,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(D,s.TEXTURE_COMPARE_FUNC,oe[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===Xn||T.minFilter!==qa&&T.minFilter!==Vr||T.type===Ni&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||r.get(T).__currentAnisotropy){const K=e.get("EXT_texture_filter_anisotropic");s.texParameterf(D,K.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,a.getMaxAnisotropy())),r.get(T).__currentAnisotropy=T.anisotropy}}}function ie(D,T){let K=!1;D.__webglInit===void 0&&(D.__webglInit=!0,T.addEventListener("dispose",X));const he=T.source;let _e=x.get(he);_e===void 0&&(_e={},x.set(he,_e));const fe=Z(T);if(fe!==D.__cacheKey){_e[fe]===void 0&&(_e[fe]={texture:s.createTexture(),usedTimes:0},f.memory.textures++,K=!0),_e[fe].usedTimes++;const Xe=_e[D.__cacheKey];Xe!==void 0&&(_e[D.__cacheKey].usedTimes--,Xe.usedTimes===0&&H(T)),D.__cacheKey=fe,D.__webglTexture=_e[fe].texture}return K}function Ue(D,T,K){let he=s.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(he=s.TEXTURE_2D_ARRAY),T.isData3DTexture&&(he=s.TEXTURE_3D);const _e=ie(D,T),fe=T.source;n.bindTexture(he,D.__webglTexture,s.TEXTURE0+K);const Xe=r.get(fe);if(fe.version!==Xe.__version||_e===!0){n.activeTexture(s.TEXTURE0+K);const we=Mt.getPrimaries(Mt.workingColorSpace),Ne=T.colorSpace===dr?null:Mt.getPrimaries(T.colorSpace),dt=T.colorSpace===dr||we===Ne?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,T.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,T.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,dt);let ye=A(T.image,!1,a.maxTextureSize);ye=Tt(T,ye);const Fe=u.convert(T.format,T.colorSpace),et=u.convert(T.type);let Qe=b(T.internalFormat,Fe,et,T.colorSpace,T.isVideoTexture);N(he,T);let Be;const lt=T.mipmaps,nt=T.isVideoTexture!==!0,yt=Xe.__version===void 0||_e===!0,V=fe.dataReady,Le=L(T,ye);if(T.isDepthTexture)Qe=P(T.format===ks,T.type),yt&&(nt?n.texStorage2D(s.TEXTURE_2D,1,Qe,ye.width,ye.height):n.texImage2D(s.TEXTURE_2D,0,Qe,ye.width,ye.height,0,Fe,et,null));else if(T.isDataTexture)if(lt.length>0){nt&&yt&&n.texStorage2D(s.TEXTURE_2D,Le,Qe,lt[0].width,lt[0].height);for(let se=0,pe=lt.length;se<pe;se++)Be=lt[se],nt?V&&n.texSubImage2D(s.TEXTURE_2D,se,0,0,Be.width,Be.height,Fe,et,Be.data):n.texImage2D(s.TEXTURE_2D,se,Qe,Be.width,Be.height,0,Fe,et,Be.data);T.generateMipmaps=!1}else nt?(yt&&n.texStorage2D(s.TEXTURE_2D,Le,Qe,ye.width,ye.height),V&&n.texSubImage2D(s.TEXTURE_2D,0,0,0,ye.width,ye.height,Fe,et,ye.data)):n.texImage2D(s.TEXTURE_2D,0,Qe,ye.width,ye.height,0,Fe,et,ye.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){nt&&yt&&n.texStorage3D(s.TEXTURE_2D_ARRAY,Le,Qe,lt[0].width,lt[0].height,ye.depth);for(let se=0,pe=lt.length;se<pe;se++)if(Be=lt[se],T.format!==si)if(Fe!==null)if(nt){if(V)if(T.layerUpdates.size>0){const Ae=Tm(Be.width,Be.height,T.format,T.type);for(const De of T.layerUpdates){const ut=Be.data.subarray(De*Ae/Be.data.BYTES_PER_ELEMENT,(De+1)*Ae/Be.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,se,0,0,De,Be.width,Be.height,1,Fe,ut,0,0)}T.clearLayerUpdates()}else n.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,se,0,0,0,Be.width,Be.height,ye.depth,Fe,Be.data,0,0)}else n.compressedTexImage3D(s.TEXTURE_2D_ARRAY,se,Qe,Be.width,Be.height,ye.depth,0,Be.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else nt?V&&n.texSubImage3D(s.TEXTURE_2D_ARRAY,se,0,0,0,Be.width,Be.height,ye.depth,Fe,et,Be.data):n.texImage3D(s.TEXTURE_2D_ARRAY,se,Qe,Be.width,Be.height,ye.depth,0,Fe,et,Be.data)}else{nt&&yt&&n.texStorage2D(s.TEXTURE_2D,Le,Qe,lt[0].width,lt[0].height);for(let se=0,pe=lt.length;se<pe;se++)Be=lt[se],T.format!==si?Fe!==null?nt?V&&n.compressedTexSubImage2D(s.TEXTURE_2D,se,0,0,Be.width,Be.height,Fe,Be.data):n.compressedTexImage2D(s.TEXTURE_2D,se,Qe,Be.width,Be.height,0,Be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):nt?V&&n.texSubImage2D(s.TEXTURE_2D,se,0,0,Be.width,Be.height,Fe,et,Be.data):n.texImage2D(s.TEXTURE_2D,se,Qe,Be.width,Be.height,0,Fe,et,Be.data)}else if(T.isDataArrayTexture)if(nt){if(yt&&n.texStorage3D(s.TEXTURE_2D_ARRAY,Le,Qe,ye.width,ye.height,ye.depth),V)if(T.layerUpdates.size>0){const se=Tm(ye.width,ye.height,T.format,T.type);for(const pe of T.layerUpdates){const Ae=ye.data.subarray(pe*se/ye.data.BYTES_PER_ELEMENT,(pe+1)*se/ye.data.BYTES_PER_ELEMENT);n.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,pe,ye.width,ye.height,1,Fe,et,Ae)}T.clearLayerUpdates()}else n.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ye.width,ye.height,ye.depth,Fe,et,ye.data)}else n.texImage3D(s.TEXTURE_2D_ARRAY,0,Qe,ye.width,ye.height,ye.depth,0,Fe,et,ye.data);else if(T.isData3DTexture)nt?(yt&&n.texStorage3D(s.TEXTURE_3D,Le,Qe,ye.width,ye.height,ye.depth),V&&n.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ye.width,ye.height,ye.depth,Fe,et,ye.data)):n.texImage3D(s.TEXTURE_3D,0,Qe,ye.width,ye.height,ye.depth,0,Fe,et,ye.data);else if(T.isFramebufferTexture){if(yt)if(nt)n.texStorage2D(s.TEXTURE_2D,Le,Qe,ye.width,ye.height);else{let se=ye.width,pe=ye.height;for(let Ae=0;Ae<Le;Ae++)n.texImage2D(s.TEXTURE_2D,Ae,Qe,se,pe,0,Fe,et,null),se>>=1,pe>>=1}}else if(lt.length>0){if(nt&&yt){const se=Ze(lt[0]);n.texStorage2D(s.TEXTURE_2D,Le,Qe,se.width,se.height)}for(let se=0,pe=lt.length;se<pe;se++)Be=lt[se],nt?V&&n.texSubImage2D(s.TEXTURE_2D,se,0,0,Fe,et,Be):n.texImage2D(s.TEXTURE_2D,se,Qe,Fe,et,Be);T.generateMipmaps=!1}else if(nt){if(yt){const se=Ze(ye);n.texStorage2D(s.TEXTURE_2D,Le,Qe,se.width,se.height)}V&&n.texSubImage2D(s.TEXTURE_2D,0,0,0,Fe,et,ye)}else n.texImage2D(s.TEXTURE_2D,0,Qe,Fe,et,ye);g(T)&&v(he),Xe.__version=fe.version,T.onUpdate&&T.onUpdate(T)}D.__version=T.version}function Q(D,T,K){if(T.image.length!==6)return;const he=ie(D,T),_e=T.source;n.bindTexture(s.TEXTURE_CUBE_MAP,D.__webglTexture,s.TEXTURE0+K);const fe=r.get(_e);if(_e.version!==fe.__version||he===!0){n.activeTexture(s.TEXTURE0+K);const Xe=Mt.getPrimaries(Mt.workingColorSpace),we=T.colorSpace===dr?null:Mt.getPrimaries(T.colorSpace),Ne=T.colorSpace===dr||Xe===we?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,T.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,T.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ne);const dt=T.isCompressedTexture||T.image[0].isCompressedTexture,ye=T.image[0]&&T.image[0].isDataTexture,Fe=[];for(let pe=0;pe<6;pe++)!dt&&!ye?Fe[pe]=A(T.image[pe],!0,a.maxCubemapSize):Fe[pe]=ye?T.image[pe].image:T.image[pe],Fe[pe]=Tt(T,Fe[pe]);const et=Fe[0],Qe=u.convert(T.format,T.colorSpace),Be=u.convert(T.type),lt=b(T.internalFormat,Qe,Be,T.colorSpace),nt=T.isVideoTexture!==!0,yt=fe.__version===void 0||he===!0,V=_e.dataReady;let Le=L(T,et);N(s.TEXTURE_CUBE_MAP,T);let se;if(dt){nt&&yt&&n.texStorage2D(s.TEXTURE_CUBE_MAP,Le,lt,et.width,et.height);for(let pe=0;pe<6;pe++){se=Fe[pe].mipmaps;for(let Ae=0;Ae<se.length;Ae++){const De=se[Ae];T.format!==si?Qe!==null?nt?V&&n.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ae,0,0,De.width,De.height,Qe,De.data):n.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ae,lt,De.width,De.height,0,De.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):nt?V&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ae,0,0,De.width,De.height,Qe,Be,De.data):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ae,lt,De.width,De.height,0,Qe,Be,De.data)}}}else{if(se=T.mipmaps,nt&&yt){se.length>0&&Le++;const pe=Ze(Fe[0]);n.texStorage2D(s.TEXTURE_CUBE_MAP,Le,lt,pe.width,pe.height)}for(let pe=0;pe<6;pe++)if(ye){nt?V&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,Fe[pe].width,Fe[pe].height,Qe,Be,Fe[pe].data):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,lt,Fe[pe].width,Fe[pe].height,0,Qe,Be,Fe[pe].data);for(let Ae=0;Ae<se.length;Ae++){const ut=se[Ae].image[pe].image;nt?V&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ae+1,0,0,ut.width,ut.height,Qe,Be,ut.data):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ae+1,lt,ut.width,ut.height,0,Qe,Be,ut.data)}}else{nt?V&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,Qe,Be,Fe[pe]):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,lt,Qe,Be,Fe[pe]);for(let Ae=0;Ae<se.length;Ae++){const De=se[Ae];nt?V&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ae+1,0,0,Qe,Be,De.image[pe]):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Ae+1,lt,Qe,Be,De.image[pe])}}}g(T)&&v(s.TEXTURE_CUBE_MAP),fe.__version=_e.version,T.onUpdate&&T.onUpdate(T)}D.__version=T.version}function ue(D,T,K,he,_e,fe){const Xe=u.convert(K.format,K.colorSpace),we=u.convert(K.type),Ne=b(K.internalFormat,Xe,we,K.colorSpace);if(!r.get(T).__hasExternalTextures){const ye=Math.max(1,T.width>>fe),Fe=Math.max(1,T.height>>fe);_e===s.TEXTURE_3D||_e===s.TEXTURE_2D_ARRAY?n.texImage3D(_e,fe,Ne,ye,Fe,T.depth,0,Xe,we,null):n.texImage2D(_e,fe,Ne,ye,Fe,0,Xe,we,null)}n.bindFramebuffer(s.FRAMEBUFFER,D),ft(T)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,he,_e,r.get(K).__webglTexture,0,ot(T)):(_e===s.TEXTURE_2D||_e>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&_e<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,he,_e,r.get(K).__webglTexture,fe),n.bindFramebuffer(s.FRAMEBUFFER,null)}function xe(D,T,K){if(s.bindRenderbuffer(s.RENDERBUFFER,D),T.depthBuffer){const he=T.depthTexture,_e=he&&he.isDepthTexture?he.type:null,fe=P(T.stencilBuffer,_e),Xe=T.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,we=ot(T);ft(T)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,we,fe,T.width,T.height):K?s.renderbufferStorageMultisample(s.RENDERBUFFER,we,fe,T.width,T.height):s.renderbufferStorage(s.RENDERBUFFER,fe,T.width,T.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Xe,s.RENDERBUFFER,D)}else{const he=T.textures;for(let _e=0;_e<he.length;_e++){const fe=he[_e],Xe=u.convert(fe.format,fe.colorSpace),we=u.convert(fe.type),Ne=b(fe.internalFormat,Xe,we,fe.colorSpace),dt=ot(T);K&&ft(T)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,dt,Ne,T.width,T.height):ft(T)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,dt,Ne,T.width,T.height):s.renderbufferStorage(s.RENDERBUFFER,Ne,T.width,T.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Se(D,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(s.FRAMEBUFFER,D),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!r.get(T.depthTexture).__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),ae(T.depthTexture,0);const he=r.get(T.depthTexture).__webglTexture,_e=ot(T);if(T.depthTexture.format===Is)ft(T)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,he,0,_e):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,he,0);else if(T.depthTexture.format===ks)ft(T)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,he,0,_e):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,he,0);else throw new Error("Unknown depthTexture format")}function Ce(D){const T=r.get(D),K=D.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==D.depthTexture){const he=D.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),he){const _e=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,he.removeEventListener("dispose",_e)};he.addEventListener("dispose",_e),T.__depthDisposeCallback=_e}T.__boundDepthTexture=he}if(D.depthTexture&&!T.__autoAllocateDepthBuffer){if(K)throw new Error("target.depthTexture not supported in Cube render targets");Se(T.__webglFramebuffer,D)}else if(K){T.__webglDepthbuffer=[];for(let he=0;he<6;he++)if(n.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer[he]),T.__webglDepthbuffer[he]===void 0)T.__webglDepthbuffer[he]=s.createRenderbuffer(),xe(T.__webglDepthbuffer[he],D,!1);else{const _e=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,fe=T.__webglDepthbuffer[he];s.bindRenderbuffer(s.RENDERBUFFER,fe),s.framebufferRenderbuffer(s.FRAMEBUFFER,_e,s.RENDERBUFFER,fe)}}else if(n.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=s.createRenderbuffer(),xe(T.__webglDepthbuffer,D,!1);else{const he=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,_e=T.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,_e),s.framebufferRenderbuffer(s.FRAMEBUFFER,he,s.RENDERBUFFER,_e)}n.bindFramebuffer(s.FRAMEBUFFER,null)}function Pe(D,T,K){const he=r.get(D);T!==void 0&&ue(he.__webglFramebuffer,D,D.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),K!==void 0&&Ce(D)}function Je(D){const T=D.texture,K=r.get(D),he=r.get(T);D.addEventListener("dispose",F);const _e=D.textures,fe=D.isWebGLCubeRenderTarget===!0,Xe=_e.length>1;if(Xe||(he.__webglTexture===void 0&&(he.__webglTexture=s.createTexture()),he.__version=T.version,f.memory.textures++),fe){K.__webglFramebuffer=[];for(let we=0;we<6;we++)if(T.mipmaps&&T.mipmaps.length>0){K.__webglFramebuffer[we]=[];for(let Ne=0;Ne<T.mipmaps.length;Ne++)K.__webglFramebuffer[we][Ne]=s.createFramebuffer()}else K.__webglFramebuffer[we]=s.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){K.__webglFramebuffer=[];for(let we=0;we<T.mipmaps.length;we++)K.__webglFramebuffer[we]=s.createFramebuffer()}else K.__webglFramebuffer=s.createFramebuffer();if(Xe)for(let we=0,Ne=_e.length;we<Ne;we++){const dt=r.get(_e[we]);dt.__webglTexture===void 0&&(dt.__webglTexture=s.createTexture(),f.memory.textures++)}if(D.samples>0&&ft(D)===!1){K.__webglMultisampledFramebuffer=s.createFramebuffer(),K.__webglColorRenderbuffer=[],n.bindFramebuffer(s.FRAMEBUFFER,K.__webglMultisampledFramebuffer);for(let we=0;we<_e.length;we++){const Ne=_e[we];K.__webglColorRenderbuffer[we]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,K.__webglColorRenderbuffer[we]);const dt=u.convert(Ne.format,Ne.colorSpace),ye=u.convert(Ne.type),Fe=b(Ne.internalFormat,dt,ye,Ne.colorSpace,D.isXRRenderTarget===!0),et=ot(D);s.renderbufferStorageMultisample(s.RENDERBUFFER,et,Fe,D.width,D.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.RENDERBUFFER,K.__webglColorRenderbuffer[we])}s.bindRenderbuffer(s.RENDERBUFFER,null),D.depthBuffer&&(K.__webglDepthRenderbuffer=s.createRenderbuffer(),xe(K.__webglDepthRenderbuffer,D,!0)),n.bindFramebuffer(s.FRAMEBUFFER,null)}}if(fe){n.bindTexture(s.TEXTURE_CUBE_MAP,he.__webglTexture),N(s.TEXTURE_CUBE_MAP,T);for(let we=0;we<6;we++)if(T.mipmaps&&T.mipmaps.length>0)for(let Ne=0;Ne<T.mipmaps.length;Ne++)ue(K.__webglFramebuffer[we][Ne],D,T,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+we,Ne);else ue(K.__webglFramebuffer[we],D,T,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+we,0);g(T)&&v(s.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Xe){for(let we=0,Ne=_e.length;we<Ne;we++){const dt=_e[we],ye=r.get(dt);n.bindTexture(s.TEXTURE_2D,ye.__webglTexture),N(s.TEXTURE_2D,dt),ue(K.__webglFramebuffer,D,dt,s.COLOR_ATTACHMENT0+we,s.TEXTURE_2D,0),g(dt)&&v(s.TEXTURE_2D)}n.unbindTexture()}else{let we=s.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(we=D.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),n.bindTexture(we,he.__webglTexture),N(we,T),T.mipmaps&&T.mipmaps.length>0)for(let Ne=0;Ne<T.mipmaps.length;Ne++)ue(K.__webglFramebuffer[Ne],D,T,s.COLOR_ATTACHMENT0,we,Ne);else ue(K.__webglFramebuffer,D,T,s.COLOR_ATTACHMENT0,we,0);g(T)&&v(we),n.unbindTexture()}D.depthBuffer&&Ce(D)}function mt(D){const T=D.textures;for(let K=0,he=T.length;K<he;K++){const _e=T[K];if(g(_e)){const fe=D.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:s.TEXTURE_2D,Xe=r.get(_e).__webglTexture;n.bindTexture(fe,Xe),v(fe),n.unbindTexture()}}}const at=[],B=[];function en(D){if(D.samples>0){if(ft(D)===!1){const T=D.textures,K=D.width,he=D.height;let _e=s.COLOR_BUFFER_BIT;const fe=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Xe=r.get(D),we=T.length>1;if(we)for(let Ne=0;Ne<T.length;Ne++)n.bindFramebuffer(s.FRAMEBUFFER,Xe.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ne,s.RENDERBUFFER,null),n.bindFramebuffer(s.FRAMEBUFFER,Xe.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ne,s.TEXTURE_2D,null,0);n.bindFramebuffer(s.READ_FRAMEBUFFER,Xe.__webglMultisampledFramebuffer),n.bindFramebuffer(s.DRAW_FRAMEBUFFER,Xe.__webglFramebuffer);for(let Ne=0;Ne<T.length;Ne++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(_e|=s.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(_e|=s.STENCIL_BUFFER_BIT)),we){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Xe.__webglColorRenderbuffer[Ne]);const dt=r.get(T[Ne]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,dt,0)}s.blitFramebuffer(0,0,K,he,0,0,K,he,_e,s.NEAREST),p===!0&&(at.length=0,B.length=0,at.push(s.COLOR_ATTACHMENT0+Ne),D.depthBuffer&&D.resolveDepthBuffer===!1&&(at.push(fe),B.push(fe),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,B)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,at))}if(n.bindFramebuffer(s.READ_FRAMEBUFFER,null),n.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),we)for(let Ne=0;Ne<T.length;Ne++){n.bindFramebuffer(s.FRAMEBUFFER,Xe.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ne,s.RENDERBUFFER,Xe.__webglColorRenderbuffer[Ne]);const dt=r.get(T[Ne]).__webglTexture;n.bindFramebuffer(s.FRAMEBUFFER,Xe.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ne,s.TEXTURE_2D,dt,0)}n.bindFramebuffer(s.DRAW_FRAMEBUFFER,Xe.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&p){const T=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[T])}}}function ot(D){return Math.min(a.maxSamples,D.samples)}function ft(D){const T=r.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function $e(D){const T=f.render.frame;_.get(D)!==T&&(_.set(D,T),D.update())}function Tt(D,T){const K=D.colorSpace,he=D.format,_e=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||K!==_r&&K!==dr&&(Mt.getTransfer(K)===bt?(he!==si||_e!==Oi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",K)),T}function Ze(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(m.width=D.naturalWidth||D.width,m.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(m.width=D.displayWidth,m.height=D.displayHeight):(m.width=D.width,m.height=D.height),m}this.allocateTextureUnit=q,this.resetTextureUnits=C,this.setTexture2D=ae,this.setTexture2DArray=de,this.setTexture3D=ne,this.setTextureCube=le,this.rebindTextures=Pe,this.setupRenderTarget=Je,this.updateRenderTargetMipmap=mt,this.updateMultisampleRenderTarget=en,this.setupDepthRenderbuffer=Ce,this.setupFrameBufferTexture=ue,this.useMultisampledRTT=ft}function ZM(s,e){function n(r,a=dr){let u;const f=Mt.getTransfer(a);if(r===Oi)return s.UNSIGNED_BYTE;if(r===Vf)return s.UNSIGNED_SHORT_4_4_4_4;if(r===Gf)return s.UNSIGNED_SHORT_5_5_5_1;if(r===km)return s.UNSIGNED_INT_5_9_9_9_REV;if(r===Om)return s.BYTE;if(r===Bm)return s.SHORT;if(r===No)return s.UNSIGNED_SHORT;if(r===Hf)return s.INT;if(r===Gr)return s.UNSIGNED_INT;if(r===Ni)return s.FLOAT;if(r===Fo)return s.HALF_FLOAT;if(r===zm)return s.ALPHA;if(r===Hm)return s.RGB;if(r===si)return s.RGBA;if(r===Vm)return s.LUMINANCE;if(r===Gm)return s.LUMINANCE_ALPHA;if(r===Is)return s.DEPTH_COMPONENT;if(r===ks)return s.DEPTH_STENCIL;if(r===Wm)return s.RED;if(r===Wf)return s.RED_INTEGER;if(r===Xm)return s.RG;if(r===Xf)return s.RG_INTEGER;if(r===Yf)return s.RGBA_INTEGER;if(r===_l||r===vl||r===xl||r===Sl)if(f===bt)if(u=e.get("WEBGL_compressed_texture_s3tc_srgb"),u!==null){if(r===_l)return u.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===vl)return u.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===xl)return u.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Sl)return u.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(u=e.get("WEBGL_compressed_texture_s3tc"),u!==null){if(r===_l)return u.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===vl)return u.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===xl)return u.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Sl)return u.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===ff||r===df||r===hf||r===pf)if(u=e.get("WEBGL_compressed_texture_pvrtc"),u!==null){if(r===ff)return u.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===df)return u.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===hf)return u.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===pf)return u.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===mf||r===gf||r===_f)if(u=e.get("WEBGL_compressed_texture_etc"),u!==null){if(r===mf||r===gf)return f===bt?u.COMPRESSED_SRGB8_ETC2:u.COMPRESSED_RGB8_ETC2;if(r===_f)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:u.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===vf||r===xf||r===Sf||r===yf||r===Mf||r===Ef||r===Tf||r===wf||r===Af||r===Rf||r===Cf||r===Pf||r===Lf||r===bf)if(u=e.get("WEBGL_compressed_texture_astc"),u!==null){if(r===vf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:u.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===xf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:u.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Sf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:u.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===yf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:u.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Mf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:u.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Ef)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:u.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Tf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:u.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===wf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:u.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Af)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:u.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Rf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:u.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Cf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:u.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Pf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:u.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Lf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:u.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===bf)return f===bt?u.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:u.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===yl||r===Df||r===If)if(u=e.get("EXT_texture_compression_bptc"),u!==null){if(r===yl)return f===bt?u.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:u.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Df)return u.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===If)return u.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Ym||r===Uf||r===Nf||r===Ff)if(u=e.get("EXT_texture_compression_rgtc"),u!==null){if(r===yl)return u.COMPRESSED_RED_RGTC1_EXT;if(r===Uf)return u.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Nf)return u.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Ff)return u.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===Bs?s.UNSIGNED_INT_24_8:s[r]!==void 0?s[r]:null}return{convert:n}}class QM extends Wn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Uo extends sn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const JM={type:"move"};class qc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Uo,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Uo,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new j,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new j),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Uo,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new j,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new j),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const r of e.hand.values())this._getHandJoint(n,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,r){let a=null,u=null,f=null;const d=this._targetRay,p=this._grip,m=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(m&&e.hand){f=!0;for(const A of e.hand.values()){const g=n.getJointPose(A,r),v=this._getHandJoint(m,A);g!==null&&(v.matrix.fromArray(g.transform.matrix),v.matrix.decompose(v.position,v.rotation,v.scale),v.matrixWorldNeedsUpdate=!0,v.jointRadius=g.radius),v.visible=g!==null}const _=m.joints["index-finger-tip"],S=m.joints["thumb-tip"],x=_.position.distanceTo(S.position),y=.02,w=.005;m.inputState.pinching&&x>y+w?(m.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!m.inputState.pinching&&x<=y-w&&(m.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else p!==null&&e.gripSpace&&(u=n.getPose(e.gripSpace,r),u!==null&&(p.matrix.fromArray(u.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,u.linearVelocity?(p.hasLinearVelocity=!0,p.linearVelocity.copy(u.linearVelocity)):p.hasLinearVelocity=!1,u.angularVelocity?(p.hasAngularVelocity=!0,p.angularVelocity.copy(u.angularVelocity)):p.hasAngularVelocity=!1));d!==null&&(a=n.getPose(e.targetRaySpace,r),a===null&&u!==null&&(a=u),a!==null&&(d.matrix.fromArray(a.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,a.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(a.linearVelocity)):d.hasLinearVelocity=!1,a.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(a.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(JM)))}return d!==null&&(d.visible=a!==null),p!==null&&(p.visible=u!==null),m!==null&&(m.visible=f!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const r=new Uo;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[n.jointName]=r,e.add(r)}return e.joints[n.jointName]}}const eE=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,tE=`
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

}`;class nE{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,r){if(this.texture===null){const a=new An,u=e.properties.get(a);u.__webglTexture=n.texture,(n.depthNear!=r.depthNear||n.depthFar!=r.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=a}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,r=new gr({vertexShader:eE,fragmentShader:tE,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Yn(new Ho(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class iE extends Hs{constructor(e,n){super();const r=this;let a=null,u=1,f=null,d="local-floor",p=1,m=null,_=null,S=null,x=null,y=null,w=null;const A=new nE,g=n.getContextAttributes();let v=null,b=null;const P=[],L=[],X=new pt;let F=null;const I=new Wn;I.layers.enable(1),I.viewport=new kt;const H=new Wn;H.layers.enable(2),H.viewport=new kt;const re=[I,H],M=new QM;M.layers.enable(1),M.layers.enable(2);let C=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Q){let ue=P[Q];return ue===void 0&&(ue=new qc,P[Q]=ue),ue.getTargetRaySpace()},this.getControllerGrip=function(Q){let ue=P[Q];return ue===void 0&&(ue=new qc,P[Q]=ue),ue.getGripSpace()},this.getHand=function(Q){let ue=P[Q];return ue===void 0&&(ue=new qc,P[Q]=ue),ue.getHandSpace()};function Z(Q){const ue=L.indexOf(Q.inputSource);if(ue===-1)return;const xe=P[ue];xe!==void 0&&(xe.update(Q.inputSource,Q.frame,m||f),xe.dispatchEvent({type:Q.type,data:Q.inputSource}))}function ae(){a.removeEventListener("select",Z),a.removeEventListener("selectstart",Z),a.removeEventListener("selectend",Z),a.removeEventListener("squeeze",Z),a.removeEventListener("squeezestart",Z),a.removeEventListener("squeezeend",Z),a.removeEventListener("end",ae),a.removeEventListener("inputsourceschange",de);for(let Q=0;Q<P.length;Q++){const ue=L[Q];ue!==null&&(L[Q]=null,P[Q].disconnect(ue))}C=null,q=null,A.reset(),e.setRenderTarget(v),y=null,x=null,S=null,a=null,b=null,Ue.stop(),r.isPresenting=!1,e.setPixelRatio(F),e.setSize(X.width,X.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Q){u=Q,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Q){d=Q,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return m||f},this.setReferenceSpace=function(Q){m=Q},this.getBaseLayer=function(){return x!==null?x:y},this.getBinding=function(){return S},this.getFrame=function(){return w},this.getSession=function(){return a},this.setSession=async function(Q){if(a=Q,a!==null){if(v=e.getRenderTarget(),a.addEventListener("select",Z),a.addEventListener("selectstart",Z),a.addEventListener("selectend",Z),a.addEventListener("squeeze",Z),a.addEventListener("squeezestart",Z),a.addEventListener("squeezeend",Z),a.addEventListener("end",ae),a.addEventListener("inputsourceschange",de),g.xrCompatible!==!0&&await n.makeXRCompatible(),F=e.getPixelRatio(),e.getSize(X),a.renderState.layers===void 0){const ue={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:u};y=new XRWebGLLayer(a,n,ue),a.updateRenderState({baseLayer:y}),e.setPixelRatio(1),e.setSize(y.framebufferWidth,y.framebufferHeight,!1),b=new Wr(y.framebufferWidth,y.framebufferHeight,{format:si,type:Oi,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let ue=null,xe=null,Se=null;g.depth&&(Se=g.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,ue=g.stencil?ks:Is,xe=g.stencil?Bs:Gr);const Ce={colorFormat:n.RGBA8,depthFormat:Se,scaleFactor:u};S=new XRWebGLBinding(a,n),x=S.createProjectionLayer(Ce),a.updateRenderState({layers:[x]}),e.setPixelRatio(1),e.setSize(x.textureWidth,x.textureHeight,!1),b=new Wr(x.textureWidth,x.textureHeight,{format:si,type:Oi,depthTexture:new ug(x.textureWidth,x.textureHeight,xe,void 0,void 0,void 0,void 0,void 0,void 0,ue),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:x.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(p),m=null,f=await a.requestReferenceSpace(d),Ue.setContext(a),Ue.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return A.getDepthTexture()};function de(Q){for(let ue=0;ue<Q.removed.length;ue++){const xe=Q.removed[ue],Se=L.indexOf(xe);Se>=0&&(L[Se]=null,P[Se].disconnect(xe))}for(let ue=0;ue<Q.added.length;ue++){const xe=Q.added[ue];let Se=L.indexOf(xe);if(Se===-1){for(let Pe=0;Pe<P.length;Pe++)if(Pe>=L.length){L.push(xe),Se=Pe;break}else if(L[Pe]===null){L[Pe]=xe,Se=Pe;break}if(Se===-1)break}const Ce=P[Se];Ce&&Ce.connect(xe)}}const ne=new j,le=new j;function k(Q,ue,xe){ne.setFromMatrixPosition(ue.matrixWorld),le.setFromMatrixPosition(xe.matrixWorld);const Se=ne.distanceTo(le),Ce=ue.projectionMatrix.elements,Pe=xe.projectionMatrix.elements,Je=Ce[14]/(Ce[10]-1),mt=Ce[14]/(Ce[10]+1),at=(Ce[9]+1)/Ce[5],B=(Ce[9]-1)/Ce[5],en=(Ce[8]-1)/Ce[0],ot=(Pe[8]+1)/Pe[0],ft=Je*en,$e=Je*ot,Tt=Se/(-en+ot),Ze=Tt*-en;if(ue.matrixWorld.decompose(Q.position,Q.quaternion,Q.scale),Q.translateX(Ze),Q.translateZ(Tt),Q.matrixWorld.compose(Q.position,Q.quaternion,Q.scale),Q.matrixWorldInverse.copy(Q.matrixWorld).invert(),Ce[10]===-1)Q.projectionMatrix.copy(ue.projectionMatrix),Q.projectionMatrixInverse.copy(ue.projectionMatrixInverse);else{const D=Je+Tt,T=mt+Tt,K=ft-Ze,he=$e+(Se-Ze),_e=at*mt/T*D,fe=B*mt/T*D;Q.projectionMatrix.makePerspective(K,he,_e,fe,D,T),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert()}}function ce(Q,ue){ue===null?Q.matrixWorld.copy(Q.matrix):Q.matrixWorld.multiplyMatrices(ue.matrixWorld,Q.matrix),Q.matrixWorldInverse.copy(Q.matrixWorld).invert()}this.updateCamera=function(Q){if(a===null)return;let ue=Q.near,xe=Q.far;A.texture!==null&&(A.depthNear>0&&(ue=A.depthNear),A.depthFar>0&&(xe=A.depthFar)),M.near=H.near=I.near=ue,M.far=H.far=I.far=xe,(C!==M.near||q!==M.far)&&(a.updateRenderState({depthNear:M.near,depthFar:M.far}),C=M.near,q=M.far);const Se=Q.parent,Ce=M.cameras;ce(M,Se);for(let Pe=0;Pe<Ce.length;Pe++)ce(Ce[Pe],Se);Ce.length===2?k(M,I,H):M.projectionMatrix.copy(I.projectionMatrix),oe(Q,M,Se)};function oe(Q,ue,xe){xe===null?Q.matrix.copy(ue.matrixWorld):(Q.matrix.copy(xe.matrixWorld),Q.matrix.invert(),Q.matrix.multiply(ue.matrixWorld)),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.updateMatrixWorld(!0),Q.projectionMatrix.copy(ue.projectionMatrix),Q.projectionMatrixInverse.copy(ue.projectionMatrixInverse),Q.isPerspectiveCamera&&(Q.fov=Of*2*Math.atan(1/Q.projectionMatrix.elements[5]),Q.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(x===null&&y===null))return p},this.setFoveation=function(Q){p=Q,x!==null&&(x.fixedFoveation=Q),y!==null&&y.fixedFoveation!==void 0&&(y.fixedFoveation=Q)},this.hasDepthSensing=function(){return A.texture!==null},this.getDepthSensingMesh=function(){return A.getMesh(M)};let N=null;function ie(Q,ue){if(_=ue.getViewerPose(m||f),w=ue,_!==null){const xe=_.views;y!==null&&(e.setRenderTargetFramebuffer(b,y.framebuffer),e.setRenderTarget(b));let Se=!1;xe.length!==M.cameras.length&&(M.cameras.length=0,Se=!0);for(let Pe=0;Pe<xe.length;Pe++){const Je=xe[Pe];let mt=null;if(y!==null)mt=y.getViewport(Je);else{const B=S.getViewSubImage(x,Je);mt=B.viewport,Pe===0&&(e.setRenderTargetTextures(b,B.colorTexture,x.ignoreDepthValues?void 0:B.depthStencilTexture),e.setRenderTarget(b))}let at=re[Pe];at===void 0&&(at=new Wn,at.layers.enable(Pe),at.viewport=new kt,re[Pe]=at),at.matrix.fromArray(Je.transform.matrix),at.matrix.decompose(at.position,at.quaternion,at.scale),at.projectionMatrix.fromArray(Je.projectionMatrix),at.projectionMatrixInverse.copy(at.projectionMatrix).invert(),at.viewport.set(mt.x,mt.y,mt.width,mt.height),Pe===0&&(M.matrix.copy(at.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),Se===!0&&M.cameras.push(at)}const Ce=a.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")){const Pe=S.getDepthInformation(xe[0]);Pe&&Pe.isValid&&Pe.texture&&A.init(e,Pe,a.renderState)}}for(let xe=0;xe<P.length;xe++){const Se=L[xe],Ce=P[xe];Se!==null&&Ce!==void 0&&Ce.update(Se,ue,m||f)}N&&N(Q,ue),ue.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ue}),w=null}const Ue=new ag;Ue.setAnimationLoop(ie),this.setAnimationLoop=function(Q){N=Q},this.dispose=function(){}}}const Fr=new mi,rE=new Ot;function sE(s,e){function n(g,v){g.matrixAutoUpdate===!0&&g.updateMatrix(),v.value.copy(g.matrix)}function r(g,v){v.color.getRGB(g.fogColor.value,rg(s)),v.isFog?(g.fogNear.value=v.near,g.fogFar.value=v.far):v.isFogExp2&&(g.fogDensity.value=v.density)}function a(g,v,b,P,L){v.isMeshBasicMaterial||v.isMeshLambertMaterial?u(g,v):v.isMeshToonMaterial?(u(g,v),S(g,v)):v.isMeshPhongMaterial?(u(g,v),_(g,v)):v.isMeshStandardMaterial?(u(g,v),x(g,v),v.isMeshPhysicalMaterial&&y(g,v,L)):v.isMeshMatcapMaterial?(u(g,v),w(g,v)):v.isMeshDepthMaterial?u(g,v):v.isMeshDistanceMaterial?(u(g,v),A(g,v)):v.isMeshNormalMaterial?u(g,v):v.isLineBasicMaterial?(f(g,v),v.isLineDashedMaterial&&d(g,v)):v.isPointsMaterial?p(g,v,b,P):v.isSpriteMaterial?m(g,v):v.isShadowMaterial?(g.color.value.copy(v.color),g.opacity.value=v.opacity):v.isShaderMaterial&&(v.uniformsNeedUpdate=!1)}function u(g,v){g.opacity.value=v.opacity,v.color&&g.diffuse.value.copy(v.color),v.emissive&&g.emissive.value.copy(v.emissive).multiplyScalar(v.emissiveIntensity),v.map&&(g.map.value=v.map,n(v.map,g.mapTransform)),v.alphaMap&&(g.alphaMap.value=v.alphaMap,n(v.alphaMap,g.alphaMapTransform)),v.bumpMap&&(g.bumpMap.value=v.bumpMap,n(v.bumpMap,g.bumpMapTransform),g.bumpScale.value=v.bumpScale,v.side===wn&&(g.bumpScale.value*=-1)),v.normalMap&&(g.normalMap.value=v.normalMap,n(v.normalMap,g.normalMapTransform),g.normalScale.value.copy(v.normalScale),v.side===wn&&g.normalScale.value.negate()),v.displacementMap&&(g.displacementMap.value=v.displacementMap,n(v.displacementMap,g.displacementMapTransform),g.displacementScale.value=v.displacementScale,g.displacementBias.value=v.displacementBias),v.emissiveMap&&(g.emissiveMap.value=v.emissiveMap,n(v.emissiveMap,g.emissiveMapTransform)),v.specularMap&&(g.specularMap.value=v.specularMap,n(v.specularMap,g.specularMapTransform)),v.alphaTest>0&&(g.alphaTest.value=v.alphaTest);const b=e.get(v),P=b.envMap,L=b.envMapRotation;P&&(g.envMap.value=P,Fr.copy(L),Fr.x*=-1,Fr.y*=-1,Fr.z*=-1,P.isCubeTexture&&P.isRenderTargetTexture===!1&&(Fr.y*=-1,Fr.z*=-1),g.envMapRotation.value.setFromMatrix4(rE.makeRotationFromEuler(Fr)),g.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=v.reflectivity,g.ior.value=v.ior,g.refractionRatio.value=v.refractionRatio),v.lightMap&&(g.lightMap.value=v.lightMap,g.lightMapIntensity.value=v.lightMapIntensity,n(v.lightMap,g.lightMapTransform)),v.aoMap&&(g.aoMap.value=v.aoMap,g.aoMapIntensity.value=v.aoMapIntensity,n(v.aoMap,g.aoMapTransform))}function f(g,v){g.diffuse.value.copy(v.color),g.opacity.value=v.opacity,v.map&&(g.map.value=v.map,n(v.map,g.mapTransform))}function d(g,v){g.dashSize.value=v.dashSize,g.totalSize.value=v.dashSize+v.gapSize,g.scale.value=v.scale}function p(g,v,b,P){g.diffuse.value.copy(v.color),g.opacity.value=v.opacity,g.size.value=v.size*b,g.scale.value=P*.5,v.map&&(g.map.value=v.map,n(v.map,g.uvTransform)),v.alphaMap&&(g.alphaMap.value=v.alphaMap,n(v.alphaMap,g.alphaMapTransform)),v.alphaTest>0&&(g.alphaTest.value=v.alphaTest)}function m(g,v){g.diffuse.value.copy(v.color),g.opacity.value=v.opacity,g.rotation.value=v.rotation,v.map&&(g.map.value=v.map,n(v.map,g.mapTransform)),v.alphaMap&&(g.alphaMap.value=v.alphaMap,n(v.alphaMap,g.alphaMapTransform)),v.alphaTest>0&&(g.alphaTest.value=v.alphaTest)}function _(g,v){g.specular.value.copy(v.specular),g.shininess.value=Math.max(v.shininess,1e-4)}function S(g,v){v.gradientMap&&(g.gradientMap.value=v.gradientMap)}function x(g,v){g.metalness.value=v.metalness,v.metalnessMap&&(g.metalnessMap.value=v.metalnessMap,n(v.metalnessMap,g.metalnessMapTransform)),g.roughness.value=v.roughness,v.roughnessMap&&(g.roughnessMap.value=v.roughnessMap,n(v.roughnessMap,g.roughnessMapTransform)),v.envMap&&(g.envMapIntensity.value=v.envMapIntensity)}function y(g,v,b){g.ior.value=v.ior,v.sheen>0&&(g.sheenColor.value.copy(v.sheenColor).multiplyScalar(v.sheen),g.sheenRoughness.value=v.sheenRoughness,v.sheenColorMap&&(g.sheenColorMap.value=v.sheenColorMap,n(v.sheenColorMap,g.sheenColorMapTransform)),v.sheenRoughnessMap&&(g.sheenRoughnessMap.value=v.sheenRoughnessMap,n(v.sheenRoughnessMap,g.sheenRoughnessMapTransform))),v.clearcoat>0&&(g.clearcoat.value=v.clearcoat,g.clearcoatRoughness.value=v.clearcoatRoughness,v.clearcoatMap&&(g.clearcoatMap.value=v.clearcoatMap,n(v.clearcoatMap,g.clearcoatMapTransform)),v.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=v.clearcoatRoughnessMap,n(v.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),v.clearcoatNormalMap&&(g.clearcoatNormalMap.value=v.clearcoatNormalMap,n(v.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(v.clearcoatNormalScale),v.side===wn&&g.clearcoatNormalScale.value.negate())),v.dispersion>0&&(g.dispersion.value=v.dispersion),v.iridescence>0&&(g.iridescence.value=v.iridescence,g.iridescenceIOR.value=v.iridescenceIOR,g.iridescenceThicknessMinimum.value=v.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=v.iridescenceThicknessRange[1],v.iridescenceMap&&(g.iridescenceMap.value=v.iridescenceMap,n(v.iridescenceMap,g.iridescenceMapTransform)),v.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=v.iridescenceThicknessMap,n(v.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),v.transmission>0&&(g.transmission.value=v.transmission,g.transmissionSamplerMap.value=b.texture,g.transmissionSamplerSize.value.set(b.width,b.height),v.transmissionMap&&(g.transmissionMap.value=v.transmissionMap,n(v.transmissionMap,g.transmissionMapTransform)),g.thickness.value=v.thickness,v.thicknessMap&&(g.thicknessMap.value=v.thicknessMap,n(v.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=v.attenuationDistance,g.attenuationColor.value.copy(v.attenuationColor)),v.anisotropy>0&&(g.anisotropyVector.value.set(v.anisotropy*Math.cos(v.anisotropyRotation),v.anisotropy*Math.sin(v.anisotropyRotation)),v.anisotropyMap&&(g.anisotropyMap.value=v.anisotropyMap,n(v.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=v.specularIntensity,g.specularColor.value.copy(v.specularColor),v.specularColorMap&&(g.specularColorMap.value=v.specularColorMap,n(v.specularColorMap,g.specularColorMapTransform)),v.specularIntensityMap&&(g.specularIntensityMap.value=v.specularIntensityMap,n(v.specularIntensityMap,g.specularIntensityMapTransform))}function w(g,v){v.matcap&&(g.matcap.value=v.matcap)}function A(g,v){const b=e.get(v).light;g.referencePosition.value.setFromMatrixPosition(b.matrixWorld),g.nearDistance.value=b.shadow.camera.near,g.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:a}}function oE(s,e,n,r){let a={},u={},f=[];const d=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function p(b,P){const L=P.program;r.uniformBlockBinding(b,L)}function m(b,P){let L=a[b.id];L===void 0&&(w(b),L=_(b),a[b.id]=L,b.addEventListener("dispose",g));const X=P.program;r.updateUBOMapping(b,X);const F=e.render.frame;u[b.id]!==F&&(x(b),u[b.id]=F)}function _(b){const P=S();b.__bindingPointIndex=P;const L=s.createBuffer(),X=b.__size,F=b.usage;return s.bindBuffer(s.UNIFORM_BUFFER,L),s.bufferData(s.UNIFORM_BUFFER,X,F),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,P,L),L}function S(){for(let b=0;b<d;b++)if(f.indexOf(b)===-1)return f.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function x(b){const P=a[b.id],L=b.uniforms,X=b.__cache;s.bindBuffer(s.UNIFORM_BUFFER,P);for(let F=0,I=L.length;F<I;F++){const H=Array.isArray(L[F])?L[F]:[L[F]];for(let re=0,M=H.length;re<M;re++){const C=H[re];if(y(C,F,re,X)===!0){const q=C.__offset,Z=Array.isArray(C.value)?C.value:[C.value];let ae=0;for(let de=0;de<Z.length;de++){const ne=Z[de],le=A(ne);typeof ne=="number"||typeof ne=="boolean"?(C.__data[0]=ne,s.bufferSubData(s.UNIFORM_BUFFER,q+ae,C.__data)):ne.isMatrix3?(C.__data[0]=ne.elements[0],C.__data[1]=ne.elements[1],C.__data[2]=ne.elements[2],C.__data[3]=0,C.__data[4]=ne.elements[3],C.__data[5]=ne.elements[4],C.__data[6]=ne.elements[5],C.__data[7]=0,C.__data[8]=ne.elements[6],C.__data[9]=ne.elements[7],C.__data[10]=ne.elements[8],C.__data[11]=0):(ne.toArray(C.__data,ae),ae+=le.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,q,C.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function y(b,P,L,X){const F=b.value,I=P+"_"+L;if(X[I]===void 0)return typeof F=="number"||typeof F=="boolean"?X[I]=F:X[I]=F.clone(),!0;{const H=X[I];if(typeof F=="number"||typeof F=="boolean"){if(H!==F)return X[I]=F,!0}else if(H.equals(F)===!1)return H.copy(F),!0}return!1}function w(b){const P=b.uniforms;let L=0;const X=16;for(let I=0,H=P.length;I<H;I++){const re=Array.isArray(P[I])?P[I]:[P[I]];for(let M=0,C=re.length;M<C;M++){const q=re[M],Z=Array.isArray(q.value)?q.value:[q.value];for(let ae=0,de=Z.length;ae<de;ae++){const ne=Z[ae],le=A(ne),k=L%X,ce=k%le.boundary,oe=k+ce;L+=ce,oe!==0&&X-oe<le.storage&&(L+=X-oe),q.__data=new Float32Array(le.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=L,L+=le.storage}}}const F=L%X;return F>0&&(L+=X-F),b.__size=L,b.__cache={},this}function A(b){const P={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(P.boundary=4,P.storage=4):b.isVector2?(P.boundary=8,P.storage=8):b.isVector3||b.isColor?(P.boundary=16,P.storage=12):b.isVector4?(P.boundary=16,P.storage=16):b.isMatrix3?(P.boundary=48,P.storage=48):b.isMatrix4?(P.boundary=64,P.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),P}function g(b){const P=b.target;P.removeEventListener("dispose",g);const L=f.indexOf(P.__bindingPointIndex);f.splice(L,1),s.deleteBuffer(a[P.id]),delete a[P.id],delete u[P.id]}function v(){for(const b in a)s.deleteBuffer(a[b]);f=[],a={},u={}}return{bind:p,update:m,dispose:v}}class aE{constructor(e={}){const{canvas:n=jv(),context:r=null,depth:a=!0,stencil:u=!1,alpha:f=!1,antialias:d=!1,premultipliedAlpha:p=!0,preserveDrawingBuffer:m=!1,powerPreference:_="default",failIfMajorPerformanceCaveat:S=!1}=e;this.isWebGLRenderer=!0;let x;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=r.getContextAttributes().alpha}else x=f;const y=new Uint32Array(4),w=new Int32Array(4);let A=null,g=null;const v=[],b=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=di,this.toneMapping=pr,this.toneMappingExposure=1;const P=this;let L=!1,X=0,F=0,I=null,H=-1,re=null;const M=new kt,C=new kt;let q=null;const Z=new ct(0);let ae=0,de=n.width,ne=n.height,le=1,k=null,ce=null;const oe=new kt(0,0,de,ne),N=new kt(0,0,de,ne);let ie=!1;const Ue=new jf;let Q=!1,ue=!1;const xe=new Ot,Se=new Ot,Ce=new j,Pe=new kt,Je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let mt=!1;function at(){return I===null?le:1}let B=r;function en(R,G){return n.getContext(R,G)}try{const R={alpha:!0,depth:a,stencil:u,antialias:d,premultipliedAlpha:p,preserveDrawingBuffer:m,powerPreference:_,failIfMajorPerformanceCaveat:S};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${zf}`),n.addEventListener("webglcontextlost",pe,!1),n.addEventListener("webglcontextrestored",Ae,!1),n.addEventListener("webglcontextcreationerror",De,!1),B===null){const G="webgl2";if(B=en(G,R),B===null)throw en(G)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let ot,ft,$e,Tt,Ze,D,T,K,he,_e,fe,Xe,we,Ne,dt,ye,Fe,et,Qe,Be,lt,nt,yt,V;function Le(){ot=new dy(B),ot.init(),nt=new ZM(B,ot),ft=new oy(B,ot,e,nt),$e=new jM(B),ft.reverseDepthBuffer&&$e.buffers.depth.setReversed(!0),Tt=new my(B),Ze=new IM,D=new KM(B,ot,$e,Ze,ft,nt,Tt),T=new ly(P),K=new fy(P),he=new M0(B),yt=new ry(B,he),_e=new hy(B,he,Tt,yt),fe=new _y(B,_e,he,Tt),Qe=new gy(B,ft,D),ye=new ay(Ze),Xe=new DM(P,T,K,ot,ft,yt,ye),we=new sE(P,Ze),Ne=new NM,dt=new HM(ot),et=new iy(P,T,K,$e,fe,x,p),Fe=new YM(P,fe,ft),V=new oE(B,Tt,ft,$e),Be=new sy(B,ot,Tt),lt=new py(B,ot,Tt),Tt.programs=Xe.programs,P.capabilities=ft,P.extensions=ot,P.properties=Ze,P.renderLists=Ne,P.shadowMap=Fe,P.state=$e,P.info=Tt}Le();const se=new iE(P,B);this.xr=se,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){const R=ot.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=ot.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(R){R!==void 0&&(le=R,this.setSize(de,ne,!1))},this.getSize=function(R){return R.set(de,ne)},this.setSize=function(R,G,J=!0){if(se.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}de=R,ne=G,n.width=Math.floor(R*le),n.height=Math.floor(G*le),J===!0&&(n.style.width=R+"px",n.style.height=G+"px"),this.setViewport(0,0,R,G)},this.getDrawingBufferSize=function(R){return R.set(de*le,ne*le).floor()},this.setDrawingBufferSize=function(R,G,J){de=R,ne=G,le=J,n.width=Math.floor(R*J),n.height=Math.floor(G*J),this.setViewport(0,0,R,G)},this.getCurrentViewport=function(R){return R.copy(M)},this.getViewport=function(R){return R.copy(oe)},this.setViewport=function(R,G,J,ee){R.isVector4?oe.set(R.x,R.y,R.z,R.w):oe.set(R,G,J,ee),$e.viewport(M.copy(oe).multiplyScalar(le).round())},this.getScissor=function(R){return R.copy(N)},this.setScissor=function(R,G,J,ee){R.isVector4?N.set(R.x,R.y,R.z,R.w):N.set(R,G,J,ee),$e.scissor(C.copy(N).multiplyScalar(le).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(R){$e.setScissorTest(ie=R)},this.setOpaqueSort=function(R){k=R},this.setTransparentSort=function(R){ce=R},this.getClearColor=function(R){return R.copy(et.getClearColor())},this.setClearColor=function(){et.setClearColor.apply(et,arguments)},this.getClearAlpha=function(){return et.getClearAlpha()},this.setClearAlpha=function(){et.setClearAlpha.apply(et,arguments)},this.clear=function(R=!0,G=!0,J=!0){let ee=0;if(R){let W=!1;if(I!==null){const Ee=I.texture.format;W=Ee===Yf||Ee===Xf||Ee===Wf}if(W){const Ee=I.texture.type,be=Ee===Oi||Ee===Gr||Ee===No||Ee===Bs||Ee===Vf||Ee===Gf,Te=et.getClearColor(),Ve=et.getClearAlpha(),je=Te.r,Ke=Te.g,Ge=Te.b;be?(y[0]=je,y[1]=Ke,y[2]=Ge,y[3]=Ve,B.clearBufferuiv(B.COLOR,0,y)):(w[0]=je,w[1]=Ke,w[2]=Ge,w[3]=Ve,B.clearBufferiv(B.COLOR,0,w))}else ee|=B.COLOR_BUFFER_BIT}G&&(ee|=B.DEPTH_BUFFER_BIT,B.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),J&&(ee|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B.clear(ee)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",pe,!1),n.removeEventListener("webglcontextrestored",Ae,!1),n.removeEventListener("webglcontextcreationerror",De,!1),Ne.dispose(),dt.dispose(),Ze.dispose(),T.dispose(),K.dispose(),fe.dispose(),yt.dispose(),V.dispose(),Xe.dispose(),se.dispose(),se.removeEventListener("sessionstart",Bi),se.removeEventListener("sessionend",Xr),Rn.stop()};function pe(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),L=!0}function Ae(){console.log("THREE.WebGLRenderer: Context Restored."),L=!1;const R=Tt.autoReset,G=Fe.enabled,J=Fe.autoUpdate,ee=Fe.needsUpdate,W=Fe.type;Le(),Tt.autoReset=R,Fe.enabled=G,Fe.autoUpdate=J,Fe.needsUpdate=ee,Fe.type=W}function De(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function ut(R){const G=R.target;G.removeEventListener("dispose",ut),Ut(G)}function Ut(R){tn(R),Ze.remove(R)}function tn(R){const G=Ze.get(R).programs;G!==void 0&&(G.forEach(function(J){Xe.releaseProgram(J)}),R.isShaderMaterial&&Xe.releaseShaderCache(R))}this.renderBufferDirect=function(R,G,J,ee,W,Ee){G===null&&(G=Je);const be=W.isMesh&&W.matrixWorld.determinant()<0,Te=_i(R,G,J,ee,W);$e.setMaterial(ee,be);let Ve=J.index,je=1;if(ee.wireframe===!0){if(Ve=_e.getWireframeAttribute(J),Ve===void 0)return;je=2}const Ke=J.drawRange,Ge=J.attributes.position;let St=Ke.start*je,wt=(Ke.start+Ke.count)*je;Ee!==null&&(St=Math.max(St,Ee.start*je),wt=Math.min(wt,(Ee.start+Ee.count)*je)),Ve!==null?(St=Math.max(St,0),wt=Math.min(wt,Ve.count)):Ge!=null&&(St=Math.max(St,0),wt=Math.min(wt,Ge.count));const At=wt-St;if(At<0||At===1/0)return;yt.setup(W,ee,Te,J,Ve);let Dt,_t=Be;if(Ve!==null&&(Dt=he.get(Ve),_t=lt,_t.setIndex(Dt)),W.isMesh)ee.wireframe===!0?($e.setLineWidth(ee.wireframeLinewidth*at()),_t.setMode(B.LINES)):_t.setMode(B.TRIANGLES);else if(W.isLine){let Oe=ee.linewidth;Oe===void 0&&(Oe=1),$e.setLineWidth(Oe*at()),W.isLineSegments?_t.setMode(B.LINES):W.isLineLoop?_t.setMode(B.LINE_LOOP):_t.setMode(B.LINE_STRIP)}else W.isPoints?_t.setMode(B.POINTS):W.isSprite&&_t.setMode(B.TRIANGLES);if(W.isBatchedMesh)if(W._multiDrawInstances!==null)_t.renderMultiDrawInstances(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount,W._multiDrawInstances);else if(ot.get("WEBGL_multi_draw"))_t.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{const Oe=W._multiDrawStarts,Gt=W._multiDrawCounts,vt=W._multiDrawCount,Cn=Ve?he.get(Ve).bytesPerElement:1,qn=Ze.get(ee).currentProgram.getUniforms();for(let $t=0;$t<vt;$t++)qn.setValue(B,"_gl_DrawID",$t),_t.render(Oe[$t]/Cn,Gt[$t])}else if(W.isInstancedMesh)_t.renderInstances(St,At,W.count);else if(J.isInstancedBufferGeometry){const Oe=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Gt=Math.min(J.instanceCount,Oe);_t.renderInstances(St,At,Gt)}else _t.render(St,At)};function ht(R,G,J){R.transparent===!0&&R.side===Ui&&R.forceSinglePass===!1?(R.side=wn,R.needsUpdate=!0,qr(R,G,J),R.side=mr,R.needsUpdate=!0,qr(R,G,J),R.side=Ui):qr(R,G,J)}this.compile=function(R,G,J=null){J===null&&(J=R),g=dt.get(J),g.init(G),b.push(g),J.traverseVisible(function(W){W.isLight&&W.layers.test(G.layers)&&(g.pushLight(W),W.castShadow&&g.pushShadow(W))}),R!==J&&R.traverseVisible(function(W){W.isLight&&W.layers.test(G.layers)&&(g.pushLight(W),W.castShadow&&g.pushShadow(W))}),g.setupLights();const ee=new Set;return R.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;const Ee=W.material;if(Ee)if(Array.isArray(Ee))for(let be=0;be<Ee.length;be++){const Te=Ee[be];ht(Te,J,W),ee.add(Te)}else ht(Ee,J,W),ee.add(Ee)}),b.pop(),g=null,ee},this.compileAsync=function(R,G,J=null){const ee=this.compile(R,G,J);return new Promise(W=>{function Ee(){if(ee.forEach(function(be){Ze.get(be).currentProgram.isReady()&&ee.delete(be)}),ee.size===0){W(R);return}setTimeout(Ee,10)}ot.get("KHR_parallel_shader_compile")!==null?Ee():setTimeout(Ee,10)})};let jt=null;function Fn(R){jt&&jt(R)}function Bi(){Rn.stop()}function Xr(){Rn.start()}const Rn=new ag;Rn.setAnimationLoop(Fn),typeof self<"u"&&Rn.setContext(self),this.setAnimationLoop=function(R){jt=R,se.setAnimationLoop(R),R===null?Rn.stop():Rn.start()},se.addEventListener("sessionstart",Bi),se.addEventListener("sessionend",Xr),this.render=function(R,G){if(G!==void 0&&G.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),se.enabled===!0&&se.isPresenting===!0&&(se.cameraAutoUpdate===!0&&se.updateCamera(G),G=se.getCamera()),R.isScene===!0&&R.onBeforeRender(P,R,G,I),g=dt.get(R,b.length),g.init(G),b.push(g),Se.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),Ue.setFromProjectionMatrix(Se),ue=this.localClippingEnabled,Q=ye.init(this.clippingPlanes,ue),A=Ne.get(R,v.length),A.init(),v.push(A),se.enabled===!0&&se.isPresenting===!0){const Ee=P.xr.getDepthSensingMesh();Ee!==null&&Ws(Ee,G,-1/0,P.sortObjects)}Ws(R,G,0,P.sortObjects),A.finish(),P.sortObjects===!0&&A.sort(k,ce),mt=se.enabled===!1||se.isPresenting===!1||se.hasDepthSensing()===!1,mt&&et.addToRenderList(A,R),this.info.render.frame++,Q===!0&&ye.beginShadows();const J=g.state.shadowsArray;Fe.render(J,R,G),Q===!0&&ye.endShadows(),this.info.autoReset===!0&&this.info.reset();const ee=A.opaque,W=A.transmissive;if(g.setupLights(),G.isArrayCamera){const Ee=G.cameras;if(W.length>0)for(let be=0,Te=Ee.length;be<Te;be++){const Ve=Ee[be];vr(ee,W,R,Ve)}mt&&et.render(R);for(let be=0,Te=Ee.length;be<Te;be++){const Ve=Ee[be];ki(A,R,Ve,Ve.viewport)}}else W.length>0&&vr(ee,W,R,G),mt&&et.render(R),ki(A,R,G);I!==null&&(D.updateMultisampleRenderTarget(I),D.updateRenderTargetMipmap(I)),R.isScene===!0&&R.onAfterRender(P,R,G),yt.resetDefaultState(),H=-1,re=null,b.pop(),b.length>0?(g=b[b.length-1],Q===!0&&ye.setGlobalState(P.clippingPlanes,g.state.camera)):g=null,v.pop(),v.length>0?A=v[v.length-1]:A=null};function Ws(R,G,J,ee){if(R.visible===!1)return;if(R.layers.test(G.layers)){if(R.isGroup)J=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(G);else if(R.isLight)g.pushLight(R),R.castShadow&&g.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||Ue.intersectsSprite(R)){ee&&Pe.setFromMatrixPosition(R.matrixWorld).applyMatrix4(Se);const be=fe.update(R),Te=R.material;Te.visible&&A.push(R,be,Te,J,Pe.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||Ue.intersectsObject(R))){const be=fe.update(R),Te=R.material;if(ee&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),Pe.copy(R.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),Pe.copy(be.boundingSphere.center)),Pe.applyMatrix4(R.matrixWorld).applyMatrix4(Se)),Array.isArray(Te)){const Ve=be.groups;for(let je=0,Ke=Ve.length;je<Ke;je++){const Ge=Ve[je],St=Te[Ge.materialIndex];St&&St.visible&&A.push(R,be,St,J,Pe.z,Ge)}}else Te.visible&&A.push(R,be,Te,J,Pe.z,null)}}const Ee=R.children;for(let be=0,Te=Ee.length;be<Te;be++)Ws(Ee[be],G,J,ee)}function ki(R,G,J,ee){const W=R.opaque,Ee=R.transmissive,be=R.transparent;g.setupLightsView(J),Q===!0&&ye.setGlobalState(P.clippingPlanes,J),ee&&$e.viewport(M.copy(ee)),W.length>0&&gi(W,G,J),Ee.length>0&&gi(Ee,G,J),be.length>0&&gi(be,G,J),$e.buffers.depth.setTest(!0),$e.buffers.depth.setMask(!0),$e.buffers.color.setMask(!0),$e.setPolygonOffset(!1)}function vr(R,G,J,ee){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[ee.id]===void 0&&(g.state.transmissionRenderTarget[ee.id]=new Wr(1,1,{generateMipmaps:!0,type:ot.has("EXT_color_buffer_half_float")||ot.has("EXT_color_buffer_float")?Fo:Oi,minFilter:Vr,samples:4,stencilBuffer:u,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Mt.workingColorSpace}));const Ee=g.state.transmissionRenderTarget[ee.id],be=ee.viewport||M;Ee.setSize(be.z,be.w);const Te=P.getRenderTarget();P.setRenderTarget(Ee),P.getClearColor(Z),ae=P.getClearAlpha(),ae<1&&P.setClearColor(16777215,.5),P.clear(),mt&&et.render(J);const Ve=P.toneMapping;P.toneMapping=pr;const je=ee.viewport;if(ee.viewport!==void 0&&(ee.viewport=void 0),g.setupLightsView(ee),Q===!0&&ye.setGlobalState(P.clippingPlanes,ee),gi(R,J,ee),D.updateMultisampleRenderTarget(Ee),D.updateRenderTargetMipmap(Ee),ot.has("WEBGL_multisampled_render_to_texture")===!1){let Ke=!1;for(let Ge=0,St=G.length;Ge<St;Ge++){const wt=G[Ge],At=wt.object,Dt=wt.geometry,_t=wt.material,Oe=wt.group;if(_t.side===Ui&&At.layers.test(ee.layers)){const Gt=_t.side;_t.side=wn,_t.needsUpdate=!0,Yr(At,J,ee,Dt,_t,Oe),_t.side=Gt,_t.needsUpdate=!0,Ke=!0}}Ke===!0&&(D.updateMultisampleRenderTarget(Ee),D.updateRenderTargetMipmap(Ee))}P.setRenderTarget(Te),P.setClearColor(Z,ae),je!==void 0&&(ee.viewport=je),P.toneMapping=Ve}function gi(R,G,J){const ee=G.isScene===!0?G.overrideMaterial:null;for(let W=0,Ee=R.length;W<Ee;W++){const be=R[W],Te=be.object,Ve=be.geometry,je=ee===null?be.material:ee,Ke=be.group;Te.layers.test(J.layers)&&Yr(Te,G,J,Ve,je,Ke)}}function Yr(R,G,J,ee,W,Ee){R.onBeforeRender(P,G,J,ee,W,Ee),R.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),W.onBeforeRender(P,G,J,ee,R,Ee),W.transparent===!0&&W.side===Ui&&W.forceSinglePass===!1?(W.side=wn,W.needsUpdate=!0,P.renderBufferDirect(J,G,ee,W,R,Ee),W.side=mr,W.needsUpdate=!0,P.renderBufferDirect(J,G,ee,W,R,Ee),W.side=Ui):P.renderBufferDirect(J,G,ee,W,R,Ee),R.onAfterRender(P,G,J,ee,W,Ee)}function qr(R,G,J){G.isScene!==!0&&(G=Je);const ee=Ze.get(R),W=g.state.lights,Ee=g.state.shadowsArray,be=W.state.version,Te=Xe.getParameters(R,W.state,Ee,G,J),Ve=Xe.getProgramCacheKey(Te);let je=ee.programs;ee.environment=R.isMeshStandardMaterial?G.environment:null,ee.fog=G.fog,ee.envMap=(R.isMeshStandardMaterial?K:T).get(R.envMap||ee.environment),ee.envMapRotation=ee.environment!==null&&R.envMap===null?G.environmentRotation:R.envMapRotation,je===void 0&&(R.addEventListener("dispose",ut),je=new Map,ee.programs=je);let Ke=je.get(Ve);if(Ke!==void 0){if(ee.currentProgram===Ke&&ee.lightsStateVersion===be)return Go(R,Te),Ke}else Te.uniforms=Xe.getUniforms(R),R.onBeforeCompile(Te,P),Ke=Xe.acquireProgram(Te,Ve),je.set(Ve,Ke),ee.uniforms=Te.uniforms;const Ge=ee.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(Ge.clippingPlanes=ye.uniform),Go(R,Te),ee.needsLights=Xo(R),ee.lightsStateVersion=be,ee.needsLights&&(Ge.ambientLightColor.value=W.state.ambient,Ge.lightProbe.value=W.state.probe,Ge.directionalLights.value=W.state.directional,Ge.directionalLightShadows.value=W.state.directionalShadow,Ge.spotLights.value=W.state.spot,Ge.spotLightShadows.value=W.state.spotShadow,Ge.rectAreaLights.value=W.state.rectArea,Ge.ltc_1.value=W.state.rectAreaLTC1,Ge.ltc_2.value=W.state.rectAreaLTC2,Ge.pointLights.value=W.state.point,Ge.pointLightShadows.value=W.state.pointShadow,Ge.hemisphereLights.value=W.state.hemi,Ge.directionalShadowMap.value=W.state.directionalShadowMap,Ge.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Ge.spotShadowMap.value=W.state.spotShadowMap,Ge.spotLightMatrix.value=W.state.spotLightMatrix,Ge.spotLightMap.value=W.state.spotLightMap,Ge.pointShadowMap.value=W.state.pointShadowMap,Ge.pointShadowMatrix.value=W.state.pointShadowMatrix),ee.currentProgram=Ke,ee.uniformsList=null,Ke}function Vo(R){if(R.uniformsList===null){const G=R.currentProgram.getUniforms();R.uniformsList=El.seqWithValue(G.seq,R.uniforms)}return R.uniformsList}function Go(R,G){const J=Ze.get(R);J.outputColorSpace=G.outputColorSpace,J.batching=G.batching,J.batchingColor=G.batchingColor,J.instancing=G.instancing,J.instancingColor=G.instancingColor,J.instancingMorph=G.instancingMorph,J.skinning=G.skinning,J.morphTargets=G.morphTargets,J.morphNormals=G.morphNormals,J.morphColors=G.morphColors,J.morphTargetsCount=G.morphTargetsCount,J.numClippingPlanes=G.numClippingPlanes,J.numIntersection=G.numClipIntersection,J.vertexAlphas=G.vertexAlphas,J.vertexTangents=G.vertexTangents,J.toneMapping=G.toneMapping}function _i(R,G,J,ee,W){G.isScene!==!0&&(G=Je),D.resetTextureUnits();const Ee=G.fog,be=ee.isMeshStandardMaterial?G.environment:null,Te=I===null?P.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:_r,Ve=(ee.isMeshStandardMaterial?K:T).get(ee.envMap||be),je=ee.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,Ke=!!J.attributes.tangent&&(!!ee.normalMap||ee.anisotropy>0),Ge=!!J.morphAttributes.position,St=!!J.morphAttributes.normal,wt=!!J.morphAttributes.color;let At=pr;ee.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(At=P.toneMapping);const Dt=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,_t=Dt!==void 0?Dt.length:0,Oe=Ze.get(ee),Gt=g.state.lights;if(Q===!0&&(ue===!0||R!==re)){const an=R===re&&ee.id===H;ye.setState(ee,R,an)}let vt=!1;ee.version===Oe.__version?(Oe.needsLights&&Oe.lightsStateVersion!==Gt.state.version||Oe.outputColorSpace!==Te||W.isBatchedMesh&&Oe.batching===!1||!W.isBatchedMesh&&Oe.batching===!0||W.isBatchedMesh&&Oe.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&Oe.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&Oe.instancing===!1||!W.isInstancedMesh&&Oe.instancing===!0||W.isSkinnedMesh&&Oe.skinning===!1||!W.isSkinnedMesh&&Oe.skinning===!0||W.isInstancedMesh&&Oe.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Oe.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Oe.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Oe.instancingMorph===!1&&W.morphTexture!==null||Oe.envMap!==Ve||ee.fog===!0&&Oe.fog!==Ee||Oe.numClippingPlanes!==void 0&&(Oe.numClippingPlanes!==ye.numPlanes||Oe.numIntersection!==ye.numIntersection)||Oe.vertexAlphas!==je||Oe.vertexTangents!==Ke||Oe.morphTargets!==Ge||Oe.morphNormals!==St||Oe.morphColors!==wt||Oe.toneMapping!==At||Oe.morphTargetsCount!==_t)&&(vt=!0):(vt=!0,Oe.__version=ee.version);let Cn=Oe.currentProgram;vt===!0&&(Cn=qr(ee,G,W));let qn=!1,$t=!1,vi=!1;const Rt=Cn.getUniforms(),ai=Oe.uniforms;if($e.useProgram(Cn.program)&&(qn=!0,$t=!0,vi=!0),ee.id!==H&&(H=ee.id,$t=!0),qn||re!==R){ft.reverseDepthBuffer?(xe.copy(R.projectionMatrix),Kv(xe),Zv(xe),Rt.setValue(B,"projectionMatrix",xe)):Rt.setValue(B,"projectionMatrix",R.projectionMatrix),Rt.setValue(B,"viewMatrix",R.matrixWorldInverse);const an=Rt.map.cameraPosition;an!==void 0&&an.setValue(B,Ce.setFromMatrixPosition(R.matrixWorld)),ft.logarithmicDepthBuffer&&Rt.setValue(B,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(ee.isMeshPhongMaterial||ee.isMeshToonMaterial||ee.isMeshLambertMaterial||ee.isMeshBasicMaterial||ee.isMeshStandardMaterial||ee.isShaderMaterial)&&Rt.setValue(B,"isOrthographic",R.isOrthographicCamera===!0),re!==R&&(re=R,$t=!0,vi=!0)}if(W.isSkinnedMesh){Rt.setOptional(B,W,"bindMatrix"),Rt.setOptional(B,W,"bindMatrixInverse");const an=W.skeleton;an&&(an.boneTexture===null&&an.computeBoneTexture(),Rt.setValue(B,"boneTexture",an.boneTexture,D))}W.isBatchedMesh&&(Rt.setOptional(B,W,"batchingTexture"),Rt.setValue(B,"batchingTexture",W._matricesTexture,D),Rt.setOptional(B,W,"batchingIdTexture"),Rt.setValue(B,"batchingIdTexture",W._indirectTexture,D),Rt.setOptional(B,W,"batchingColorTexture"),W._colorsTexture!==null&&Rt.setValue(B,"batchingColorTexture",W._colorsTexture,D));const Xs=J.morphAttributes;if((Xs.position!==void 0||Xs.normal!==void 0||Xs.color!==void 0)&&Qe.update(W,J,Cn),($t||Oe.receiveShadow!==W.receiveShadow)&&(Oe.receiveShadow=W.receiveShadow,Rt.setValue(B,"receiveShadow",W.receiveShadow)),ee.isMeshGouraudMaterial&&ee.envMap!==null&&(ai.envMap.value=Ve,ai.flipEnvMap.value=Ve.isCubeTexture&&Ve.isRenderTargetTexture===!1?-1:1),ee.isMeshStandardMaterial&&ee.envMap===null&&G.environment!==null&&(ai.envMapIntensity.value=G.environmentIntensity),$t&&(Rt.setValue(B,"toneMappingExposure",P.toneMappingExposure),Oe.needsLights&&Wo(ai,vi),Ee&&ee.fog===!0&&we.refreshFogUniforms(ai,Ee),we.refreshMaterialUniforms(ai,ee,le,ne,g.state.transmissionRenderTarget[R.id]),El.upload(B,Vo(Oe),ai,D)),ee.isShaderMaterial&&ee.uniformsNeedUpdate===!0&&(El.upload(B,Vo(Oe),ai,D),ee.uniformsNeedUpdate=!1),ee.isSpriteMaterial&&Rt.setValue(B,"center",W.center),Rt.setValue(B,"modelViewMatrix",W.modelViewMatrix),Rt.setValue(B,"normalMatrix",W.normalMatrix),Rt.setValue(B,"modelMatrix",W.matrixWorld),ee.isShaderMaterial||ee.isRawShaderMaterial){const an=ee.uniformsGroups;for(let jr=0,Ys=an.length;jr<Ys;jr++){const zi=an[jr];V.update(zi,Cn),V.bind(zi,Cn)}}return Cn}function Wo(R,G){R.ambientLightColor.needsUpdate=G,R.lightProbe.needsUpdate=G,R.directionalLights.needsUpdate=G,R.directionalLightShadows.needsUpdate=G,R.pointLights.needsUpdate=G,R.pointLightShadows.needsUpdate=G,R.spotLights.needsUpdate=G,R.spotLightShadows.needsUpdate=G,R.rectAreaLights.needsUpdate=G,R.hemisphereLights.needsUpdate=G}function Xo(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(R,G,J){Ze.get(R.texture).__webglTexture=G,Ze.get(R.depthTexture).__webglTexture=J;const ee=Ze.get(R);ee.__hasExternalTextures=!0,ee.__autoAllocateDepthBuffer=J===void 0,ee.__autoAllocateDepthBuffer||ot.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ee.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(R,G){const J=Ze.get(R);J.__webglFramebuffer=G,J.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(R,G=0,J=0){I=R,X=G,F=J;let ee=!0,W=null,Ee=!1,be=!1;if(R){const Ve=Ze.get(R);if(Ve.__useDefaultFramebuffer!==void 0)$e.bindFramebuffer(B.FRAMEBUFFER,null),ee=!1;else if(Ve.__webglFramebuffer===void 0)D.setupRenderTarget(R);else if(Ve.__hasExternalTextures)D.rebindTextures(R,Ze.get(R.texture).__webglTexture,Ze.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const Ge=R.depthTexture;if(Ve.__boundDepthTexture!==Ge){if(Ge!==null&&Ze.has(Ge)&&(R.width!==Ge.image.width||R.height!==Ge.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");D.setupDepthRenderbuffer(R)}}const je=R.texture;(je.isData3DTexture||je.isDataArrayTexture||je.isCompressedArrayTexture)&&(be=!0);const Ke=Ze.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(Ke[G])?W=Ke[G][J]:W=Ke[G],Ee=!0):R.samples>0&&D.useMultisampledRTT(R)===!1?W=Ze.get(R).__webglMultisampledFramebuffer:Array.isArray(Ke)?W=Ke[J]:W=Ke,M.copy(R.viewport),C.copy(R.scissor),q=R.scissorTest}else M.copy(oe).multiplyScalar(le).floor(),C.copy(N).multiplyScalar(le).floor(),q=ie;if($e.bindFramebuffer(B.FRAMEBUFFER,W)&&ee&&$e.drawBuffers(R,W),$e.viewport(M),$e.scissor(C),$e.setScissorTest(q),Ee){const Ve=Ze.get(R.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+G,Ve.__webglTexture,J)}else if(be){const Ve=Ze.get(R.texture),je=G||0;B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ve.__webglTexture,J||0,je)}H=-1},this.readRenderTargetPixels=function(R,G,J,ee,W,Ee,be){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=Ze.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&be!==void 0&&(Te=Te[be]),Te){$e.bindFramebuffer(B.FRAMEBUFFER,Te);try{const Ve=R.texture,je=Ve.format,Ke=Ve.type;if(!ft.textureFormatReadable(je)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ft.textureTypeReadable(Ke)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=R.width-ee&&J>=0&&J<=R.height-W&&B.readPixels(G,J,ee,W,nt.convert(je),nt.convert(Ke),Ee)}finally{const Ve=I!==null?Ze.get(I).__webglFramebuffer:null;$e.bindFramebuffer(B.FRAMEBUFFER,Ve)}}},this.readRenderTargetPixelsAsync=async function(R,G,J,ee,W,Ee,be){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=Ze.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&be!==void 0&&(Te=Te[be]),Te){const Ve=R.texture,je=Ve.format,Ke=Ve.type;if(!ft.textureFormatReadable(je))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ft.textureTypeReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(G>=0&&G<=R.width-ee&&J>=0&&J<=R.height-W){$e.bindFramebuffer(B.FRAMEBUFFER,Te);const Ge=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,Ge),B.bufferData(B.PIXEL_PACK_BUFFER,Ee.byteLength,B.STREAM_READ),B.readPixels(G,J,ee,W,nt.convert(je),nt.convert(Ke),0);const St=I!==null?Ze.get(I).__webglFramebuffer:null;$e.bindFramebuffer(B.FRAMEBUFFER,St);const wt=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await $v(B,wt,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,Ge),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,Ee),B.deleteBuffer(Ge),B.deleteSync(wt),Ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(R,G=null,J=0){R.isTexture!==!0&&(Ml("WebGLRenderer: copyFramebufferToTexture function signature has changed."),G=arguments[0]||null,R=arguments[1]);const ee=Math.pow(2,-J),W=Math.floor(R.image.width*ee),Ee=Math.floor(R.image.height*ee),be=G!==null?G.x:0,Te=G!==null?G.y:0;D.setTexture2D(R,0),B.copyTexSubImage2D(B.TEXTURE_2D,J,0,0,be,Te,W,Ee),$e.unbindTexture()},this.copyTextureToTexture=function(R,G,J=null,ee=null,W=0){R.isTexture!==!0&&(Ml("WebGLRenderer: copyTextureToTexture function signature has changed."),ee=arguments[0]||null,R=arguments[1],G=arguments[2],W=arguments[3]||0,J=null);let Ee,be,Te,Ve,je,Ke;J!==null?(Ee=J.max.x-J.min.x,be=J.max.y-J.min.y,Te=J.min.x,Ve=J.min.y):(Ee=R.image.width,be=R.image.height,Te=0,Ve=0),ee!==null?(je=ee.x,Ke=ee.y):(je=0,Ke=0);const Ge=nt.convert(G.format),St=nt.convert(G.type);D.setTexture2D(G,0),B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,G.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,G.unpackAlignment);const wt=B.getParameter(B.UNPACK_ROW_LENGTH),At=B.getParameter(B.UNPACK_IMAGE_HEIGHT),Dt=B.getParameter(B.UNPACK_SKIP_PIXELS),_t=B.getParameter(B.UNPACK_SKIP_ROWS),Oe=B.getParameter(B.UNPACK_SKIP_IMAGES),Gt=R.isCompressedTexture?R.mipmaps[W]:R.image;B.pixelStorei(B.UNPACK_ROW_LENGTH,Gt.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Gt.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Te),B.pixelStorei(B.UNPACK_SKIP_ROWS,Ve),R.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,W,je,Ke,Ee,be,Ge,St,Gt.data):R.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,W,je,Ke,Gt.width,Gt.height,Ge,Gt.data):B.texSubImage2D(B.TEXTURE_2D,W,je,Ke,Ee,be,Ge,St,Gt),B.pixelStorei(B.UNPACK_ROW_LENGTH,wt),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,At),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Dt),B.pixelStorei(B.UNPACK_SKIP_ROWS,_t),B.pixelStorei(B.UNPACK_SKIP_IMAGES,Oe),W===0&&G.generateMipmaps&&B.generateMipmap(B.TEXTURE_2D),$e.unbindTexture()},this.copyTextureToTexture3D=function(R,G,J=null,ee=null,W=0){R.isTexture!==!0&&(Ml("WebGLRenderer: copyTextureToTexture3D function signature has changed."),J=arguments[0]||null,ee=arguments[1]||null,R=arguments[2],G=arguments[3],W=arguments[4]||0);let Ee,be,Te,Ve,je,Ke,Ge,St,wt;const At=R.isCompressedTexture?R.mipmaps[W]:R.image;J!==null?(Ee=J.max.x-J.min.x,be=J.max.y-J.min.y,Te=J.max.z-J.min.z,Ve=J.min.x,je=J.min.y,Ke=J.min.z):(Ee=At.width,be=At.height,Te=At.depth,Ve=0,je=0,Ke=0),ee!==null?(Ge=ee.x,St=ee.y,wt=ee.z):(Ge=0,St=0,wt=0);const Dt=nt.convert(G.format),_t=nt.convert(G.type);let Oe;if(G.isData3DTexture)D.setTexture3D(G,0),Oe=B.TEXTURE_3D;else if(G.isDataArrayTexture||G.isCompressedArrayTexture)D.setTexture2DArray(G,0),Oe=B.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,G.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,G.unpackAlignment);const Gt=B.getParameter(B.UNPACK_ROW_LENGTH),vt=B.getParameter(B.UNPACK_IMAGE_HEIGHT),Cn=B.getParameter(B.UNPACK_SKIP_PIXELS),qn=B.getParameter(B.UNPACK_SKIP_ROWS),$t=B.getParameter(B.UNPACK_SKIP_IMAGES);B.pixelStorei(B.UNPACK_ROW_LENGTH,At.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,At.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Ve),B.pixelStorei(B.UNPACK_SKIP_ROWS,je),B.pixelStorei(B.UNPACK_SKIP_IMAGES,Ke),R.isDataTexture||R.isData3DTexture?B.texSubImage3D(Oe,W,Ge,St,wt,Ee,be,Te,Dt,_t,At.data):G.isCompressedArrayTexture?B.compressedTexSubImage3D(Oe,W,Ge,St,wt,Ee,be,Te,Dt,At.data):B.texSubImage3D(Oe,W,Ge,St,wt,Ee,be,Te,Dt,_t,At),B.pixelStorei(B.UNPACK_ROW_LENGTH,Gt),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,vt),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Cn),B.pixelStorei(B.UNPACK_SKIP_ROWS,qn),B.pixelStorei(B.UNPACK_SKIP_IMAGES,$t),W===0&&G.generateMipmaps&&B.generateMipmap(Oe),$e.unbindTexture()},this.initRenderTarget=function(R){Ze.get(R).__webglFramebuffer===void 0&&D.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?D.setTextureCube(R,0):R.isData3DTexture?D.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?D.setTexture2DArray(R,0):D.setTexture2D(R,0),$e.unbindTexture()},this.resetState=function(){X=0,F=0,I=null,$e.reset(),yt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Fi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=e===qf?"display-p3":"srgb",n.unpackColorSpace=Mt.workingColorSpace===Dl?"display-p3":"srgb"}}class Kf{constructor(e,n=1,r=1e3){this.isFog=!0,this.name="",this.color=new ct(e),this.near=n,this.far=r}clone(){return new Kf(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class lE extends sn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new mi,this.environmentIntensity=1,this.environmentRotation=new mi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}class pg extends Vs{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ct(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Pl=new j,Ll=new j,wm=new Ot,Do=new Qm,pl=new Il,jc=new j,Am=new j;class uE extends sn{constructor(e=new oi,n=new pg){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const n=e.attributes.position,r=[0];for(let a=1,u=n.count;a<u;a++)Pl.fromBufferAttribute(n,a-1),Ll.fromBufferAttribute(n,a),r[a]=r[a-1],r[a]+=Pl.distanceTo(Ll);e.setAttribute("lineDistance",new on(r,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,n){const r=this.geometry,a=this.matrixWorld,u=e.params.Line.threshold,f=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),pl.copy(r.boundingSphere),pl.applyMatrix4(a),pl.radius+=u,e.ray.intersectsSphere(pl)===!1)return;wm.copy(a).invert(),Do.copy(e.ray).applyMatrix4(wm);const d=u/((this.scale.x+this.scale.y+this.scale.z)/3),p=d*d,m=this.isLineSegments?2:1,_=r.index,x=r.attributes.position;if(_!==null){const y=Math.max(0,f.start),w=Math.min(_.count,f.start+f.count);for(let A=y,g=w-1;A<g;A+=m){const v=_.getX(A),b=_.getX(A+1),P=ml(this,e,Do,p,v,b);P&&n.push(P)}if(this.isLineLoop){const A=_.getX(w-1),g=_.getX(y),v=ml(this,e,Do,p,A,g);v&&n.push(v)}}else{const y=Math.max(0,f.start),w=Math.min(x.count,f.start+f.count);for(let A=y,g=w-1;A<g;A+=m){const v=ml(this,e,Do,p,A,A+1);v&&n.push(v)}if(this.isLineLoop){const A=ml(this,e,Do,p,w-1,y);A&&n.push(A)}}}updateMorphTargets(){const n=this.geometry.morphAttributes,r=Object.keys(n);if(r.length>0){const a=n[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let u=0,f=a.length;u<f;u++){const d=a[u].name||String(u);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=u}}}}}function ml(s,e,n,r,a,u){const f=s.geometry.attributes.position;if(Pl.fromBufferAttribute(f,a),Ll.fromBufferAttribute(f,u),n.distanceSqToSegment(Pl,Ll,jc,Am)>r)return;jc.applyMatrix4(s.matrixWorld);const p=e.ray.origin.distanceTo(jc);if(!(p<e.near||p>e.far))return{distance:p,point:Am.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}const Rm=new j,Cm=new j;class cE extends uE{constructor(e,n){super(e,n),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const n=e.attributes.position,r=[];for(let a=0,u=n.count;a<u;a+=2)Rm.fromBufferAttribute(n,a),Cm.fromBufferAttribute(n,a+1),r[a]=a===0?0:r[a-1],r[a+1]=r[a]+Rm.distanceTo(Cm);e.setAttribute("lineDistance",new on(r,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Zf extends oi{constructor(e=1,n=1,r=1,a=32,u=1,f=!1,d=0,p=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:n,height:r,radialSegments:a,heightSegments:u,openEnded:f,thetaStart:d,thetaLength:p};const m=this;a=Math.floor(a),u=Math.floor(u);const _=[],S=[],x=[],y=[];let w=0;const A=[],g=r/2;let v=0;b(),f===!1&&(e>0&&P(!0),n>0&&P(!1)),this.setIndex(_),this.setAttribute("position",new on(S,3)),this.setAttribute("normal",new on(x,3)),this.setAttribute("uv",new on(y,2));function b(){const L=new j,X=new j;let F=0;const I=(n-e)/r;for(let H=0;H<=u;H++){const re=[],M=H/u,C=M*(n-e)+e;for(let q=0;q<=a;q++){const Z=q/a,ae=Z*p+d,de=Math.sin(ae),ne=Math.cos(ae);X.x=C*de,X.y=-M*r+g,X.z=C*ne,S.push(X.x,X.y,X.z),L.set(de,I,ne).normalize(),x.push(L.x,L.y,L.z),y.push(Z,1-M),re.push(w++)}A.push(re)}for(let H=0;H<a;H++)for(let re=0;re<u;re++){const M=A[re][H],C=A[re+1][H],q=A[re+1][H+1],Z=A[re][H+1];e>0&&(_.push(M,C,Z),F+=3),n>0&&(_.push(C,q,Z),F+=3)}m.addGroup(v,F,0),v+=F}function P(L){const X=w,F=new pt,I=new j;let H=0;const re=L===!0?e:n,M=L===!0?1:-1;for(let q=1;q<=a;q++)S.push(0,g*M,0),x.push(0,M,0),y.push(.5,.5),w++;const C=w;for(let q=0;q<=a;q++){const ae=q/a*p+d,de=Math.cos(ae),ne=Math.sin(ae);I.x=re*ne,I.y=g*M,I.z=re*de,S.push(I.x,I.y,I.z),x.push(0,M,0),F.x=de*.5+.5,F.y=ne*.5*M+.5,y.push(F.x,F.y),w++}for(let q=0;q<a;q++){const Z=X+q,ae=C+q;L===!0?_.push(ae,ae+1,Z):_.push(ae+1,ae,Z),H+=3}m.addGroup(v,H,L===!0?1:2),v+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zf(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Qf extends oi{constructor(e=[],n=[],r=1,a=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:n,radius:r,detail:a};const u=[],f=[];d(a),m(r),_(),this.setAttribute("position",new on(u,3)),this.setAttribute("normal",new on(u.slice(),3)),this.setAttribute("uv",new on(f,2)),a===0?this.computeVertexNormals():this.normalizeNormals();function d(b){const P=new j,L=new j,X=new j;for(let F=0;F<n.length;F+=3)y(n[F+0],P),y(n[F+1],L),y(n[F+2],X),p(P,L,X,b)}function p(b,P,L,X){const F=X+1,I=[];for(let H=0;H<=F;H++){I[H]=[];const re=b.clone().lerp(L,H/F),M=P.clone().lerp(L,H/F),C=F-H;for(let q=0;q<=C;q++)q===0&&H===F?I[H][q]=re:I[H][q]=re.clone().lerp(M,q/C)}for(let H=0;H<F;H++)for(let re=0;re<2*(F-H)-1;re++){const M=Math.floor(re/2);re%2===0?(x(I[H][M+1]),x(I[H+1][M]),x(I[H][M])):(x(I[H][M+1]),x(I[H+1][M+1]),x(I[H+1][M]))}}function m(b){const P=new j;for(let L=0;L<u.length;L+=3)P.x=u[L+0],P.y=u[L+1],P.z=u[L+2],P.normalize().multiplyScalar(b),u[L+0]=P.x,u[L+1]=P.y,u[L+2]=P.z}function _(){const b=new j;for(let P=0;P<u.length;P+=3){b.x=u[P+0],b.y=u[P+1],b.z=u[P+2];const L=g(b)/2/Math.PI+.5,X=v(b)/Math.PI+.5;f.push(L,1-X)}w(),S()}function S(){for(let b=0;b<f.length;b+=6){const P=f[b+0],L=f[b+2],X=f[b+4],F=Math.max(P,L,X),I=Math.min(P,L,X);F>.9&&I<.1&&(P<.2&&(f[b+0]+=1),L<.2&&(f[b+2]+=1),X<.2&&(f[b+4]+=1))}}function x(b){u.push(b.x,b.y,b.z)}function y(b,P){const L=b*3;P.x=e[L+0],P.y=e[L+1],P.z=e[L+2]}function w(){const b=new j,P=new j,L=new j,X=new j,F=new pt,I=new pt,H=new pt;for(let re=0,M=0;re<u.length;re+=9,M+=6){b.set(u[re+0],u[re+1],u[re+2]),P.set(u[re+3],u[re+4],u[re+5]),L.set(u[re+6],u[re+7],u[re+8]),F.set(f[M+0],f[M+1]),I.set(f[M+2],f[M+3]),H.set(f[M+4],f[M+5]),X.copy(b).add(P).add(L).divideScalar(3);const C=g(X);A(F,M+0,b,C),A(I,M+2,P,C),A(H,M+4,L,C)}}function A(b,P,L,X){X<0&&b.x===1&&(f[P]=b.x-1),L.x===0&&L.z===0&&(f[P]=X/2/Math.PI+.5)}function g(b){return Math.atan2(b.z,-b.x)}function v(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qf(e.vertices,e.indices,e.radius,e.details)}}class Jf extends Qf{constructor(e=1,n=0){const r=(1+Math.sqrt(5))/2,a=[-1,r,0,1,r,0,-1,-r,0,1,-r,0,0,-1,r,0,1,r,0,-1,-r,0,1,-r,r,0,-1,r,0,1,-r,0,-1,-r,0,1],u=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(a,u,e,n),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:n}}static fromJSON(e){return new Jf(e.radius,e.detail)}}class $c extends Vs{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new ct(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ct(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qm,this.normalScale=new pt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new mi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class mg extends sn{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new ct(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}}const Kc=new Ot,Pm=new j,Lm=new j;class fE{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pt(512,512),this.map=null,this.mapPass=null,this.matrix=new Ot,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new jf,this._frameExtents=new pt(1,1),this._viewportCount=1,this._viewports=[new kt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera,r=this.matrix;Pm.setFromMatrixPosition(e.matrixWorld),n.position.copy(Pm),Lm.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(Lm),n.updateMatrixWorld(),Kc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kc),r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(Kc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class dE extends fE{constructor(){super(new lg(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class bm extends mg{constructor(e,n){super(e,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(sn.DEFAULT_UP),this.updateMatrix(),this.target=new sn,this.shadow=new dE}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class hE extends mg{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}}class pE{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Dm(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const n=Dm();e=(n-this.oldTime)/1e3,this.oldTime=n,this.elapsedTime+=e}return e}}function Dm(){return performance.now()}class mE extends cE{constructor(e=10,n=10,r=4473924,a=8947848){r=new ct(r),a=new ct(a);const u=n/2,f=e/n,d=e/2,p=[],m=[];for(let x=0,y=0,w=-d;x<=n;x++,w+=f){p.push(-d,0,w,d,0,w),p.push(w,0,-d,w,0,d);const A=x===u?r:a;A.toArray(m,y),y+=3,A.toArray(m,y),y+=3,A.toArray(m,y),y+=3,A.toArray(m,y),y+=3}const _=new oi;_.setAttribute("position",new on(p,3)),_.setAttribute("color",new on(m,3));const S=new pg({vertexColors:!0,toneMapped:!1});super(_,S),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:zf}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=zf);const gl=[{id:1,name:"Quantum Cryo & Optics",color:5227511,x:-8},{id:2,name:"Silicon Foundry & Multi-Radix",color:16761095,x:0},{id:3,name:"Full-Chip Architecture",color:2541274,x:8}];function gE(){const s=Di.useRef(null),[e,n]=Di.useState(0),[r,a]=Di.useState(!1),[u,f]=Di.useState(60),[d,p]=Di.useState(!1);return Di.useEffect(()=>{const m=s.current;if(!m)return;const _=new aE({antialias:!0});_.setSize(m.clientWidth,m.clientHeight),_.setPixelRatio(Math.min(window.devicePixelRatio,2)),m.appendChild(_.domElement);const S=new lE;S.background=new ct(658964),S.fog=new Kf(658964,20,60);const x=new Wn(60,m.clientWidth/m.clientHeight,.1,100);x.position.set(0,4,14),x.lookAt(0,0,0);const y=new hE(4210784,.8);S.add(y);const w=new bm(16777215,1.5);w.position.set(5,10,7),S.add(w);const A=new bm(5227511,.5);A.position.set(-5,3,5),S.add(A);const g=new Yn(new Ho(60,60),new $c({color:1120295,roughness:.9}));g.rotation.x=-Math.PI/2,g.position.y=-.01,S.add(g);const v=new mE(60,60,1981023,1450302);v.position.y=.005,S.add(v);const b=[];for(const re of gl){const M=new Uo;M.position.set(re.x,0,0);const C=new Yn(new Zf(1.5,2,.3,32),new $c({color:re.color,roughness:.3,metalness:.7}));C.position.y=.15,M.add(C);const q=new Yn(new Jf(.8,2),new $c({color:re.color,emissive:re.color,emissiveIntensity:.4,wireframe:!0}));q.position.y=1.8,q.name="hologram",M.add(q),M.userData={bayId:re.id,name:re.name},S.add(M),b.push(M)}let P=0;performance.now();let L=0,X=0;const F=new pE;function I(){P=requestAnimationFrame(I);const re=F.getDelta();for(const C of b){const q=C.getObjectByName("hologram");q&&(q.rotation.y+=re*.5,q.position.y=1.8+Math.sin(performance.now()*.001)*.1)}_.render(S,x),L++;const M=performance.now();M-X>1e3&&(f(Math.round(L*1e3/(M-X))),L=0,X=M)}I();const H=()=>{m&&(_.setSize(m.clientWidth,m.clientHeight),x.aspect=m.clientWidth/m.clientHeight,x.updateProjectionMatrix())};return window.addEventListener("resize",H),()=>{cancelAnimationFrame(P),window.removeEventListener("resize",H),_.dispose(),m.removeChild(_.domElement)}},[]),Di.useEffect(()=>{const m=_=>{const S=parseInt(_.key);S>=1&&S<=3&&(n(S),a(!0)),_.key==="Escape"&&(n(0),a(!1)),_.key==="Tab"&&(_.preventDefault(),a(x=>!x))};return window.addEventListener("keydown",m),()=>window.removeEventListener("keydown",m)},[]),Di.useEffect(()=>{if(e>0){const m=gl.find(_=>_.id===e);m&&console.log(`Flying to Bay ${m.id}: ${m.name}`)}},[e]),Nn.jsxs("div",{style:{width:"100vw",height:"100vh",position:"relative"},children:[Nn.jsx("div",{ref:s,style:{position:"absolute",inset:0}}),Nn.jsxs("div",{style:{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,background:"rgba(10,14,20,0.85)",borderRadius:24,padding:"6px 16px",border:"1px solid #263042",zIndex:100},children:[gl.map(m=>Nn.jsx("button",{onClick:()=>{n(m.id),a(!0)},style:{background:e===m.id?m.color:"transparent",color:e===m.id?"#000":"#8ea1b8",border:"none",borderRadius:16,padding:"4px 12px",cursor:"pointer",fontWeight:e===m.id?600:400},children:m.id},m.id)),Nn.jsx("span",{style:{color:"#4e5d70",margin:"0 6px"},children:"|"}),Nn.jsxs("span",{style:{color:u>=55?"#5fd48a":"#f0a94f",fontWeight:600,fontSize:12,alignSelf:"center"},children:[u," FPS"]})]}),Nn.jsxs("div",{style:{position:"absolute",top:0,right:0,width:300,height:"100%",background:"rgba(20,26,35,0.95)",borderLeft:"1px solid #263042",transform:r?"translateX(0)":"translateX(100%)",transition:"transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",padding:16,zIndex:90},children:[Nn.jsx("h3",{style:{color:"#e8eef7",marginBottom:8},children:e?gl.find(m=>m.id===e)?.name:"Inspector"}),e===1&&Nn.jsx("p",{style:{color:"#8ea1b8",fontSize:12},children:"Quantum Cryo & Optics Station. Dilution refrigerator at 15 mK. Qubits: transmon, photonic, neutral-atom."}),e===2&&Nn.jsx("p",{style:{color:"#8ea1b8",fontSize:12},children:"Silicon Foundry & Multi-Radix Station. SKY130A Q4 primitives loaded from Phase 0."}),e===3&&Nn.jsx("p",{style:{color:"#8ea1b8",fontSize:12},children:"Full-Chip Architecture Station. RV32IM CPU, systolic TPU, SIMT GPU holographic die."})]})]})}sv.createRoot(document.getElementById("root")).render(Nn.jsx(Q_.StrictMode,{children:Nn.jsx(gE,{})}));
