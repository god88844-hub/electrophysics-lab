(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function t(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(o){if(o.ep)return;o.ep=!0;const l=t(o);fetch(o.href,l)}})();function M_(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var xd={exports:{}},fa={},Sd={exports:{}},ut={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Jm;function Qv(){if(Jm)return ut;Jm=1;var s=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),i=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),l=Symbol.for("react.provider"),c=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),h=Symbol.for("react.suspense"),p=Symbol.for("react.memo"),m=Symbol.for("react.lazy"),_=Symbol.iterator;function v(F){return F===null||typeof F!="object"?null:(F=_&&F[_]||F["@@iterator"],typeof F=="function"?F:null)}var S={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,E={};function x(F,se,Fe){this.props=F,this.context=se,this.refs=E,this.updater=Fe||S}x.prototype.isReactComponent={},x.prototype.setState=function(F,se){if(typeof F!="object"&&typeof F!="function"&&F!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,F,se,"setState")},x.prototype.forceUpdate=function(F){this.updater.enqueueForceUpdate(this,F,"forceUpdate")};function y(){}y.prototype=x.prototype;function C(F,se,Fe){this.props=F,this.context=se,this.refs=E,this.updater=Fe||S}var b=C.prototype=new y;b.constructor=C,M(b,x.prototype),b.isPureReactComponent=!0;var P=Array.isArray,G=Object.prototype.hasOwnProperty,k={current:null},U={key:!0,ref:!0,__self:!0,__source:!0};function V(F,se,Fe){var Z,ce={},xe=null,Se=null;if(se!=null)for(Z in se.ref!==void 0&&(Se=se.ref),se.key!==void 0&&(xe=""+se.key),se)G.call(se,Z)&&!U.hasOwnProperty(Z)&&(ce[Z]=se[Z]);var Le=arguments.length-2;if(Le===1)ce.children=Fe;else if(1<Le){for(var De=Array(Le),rt=0;rt<Le;rt++)De[rt]=arguments[rt+2];ce.children=De}if(F&&F.defaultProps)for(Z in Le=F.defaultProps,Le)ce[Z]===void 0&&(ce[Z]=Le[Z]);return{$$typeof:s,type:F,key:xe,ref:Se,props:ce,_owner:k.current}}function le(F,se){return{$$typeof:s,type:F.type,key:se,ref:F.ref,props:F.props,_owner:F._owner}}function w(F){return typeof F=="object"&&F!==null&&F.$$typeof===s}function L(F){var se={"=":"=0",":":"=2"};return"$"+F.replace(/[=:]/g,function(Fe){return se[Fe]})}var Q=/\/+/g;function J(F,se){return typeof F=="object"&&F!==null&&F.key!=null?L(""+F.key):se.toString(36)}function re(F,se,Fe,Z,ce){var xe=typeof F;(xe==="undefined"||xe==="boolean")&&(F=null);var Se=!1;if(F===null)Se=!0;else switch(xe){case"string":case"number":Se=!0;break;case"object":switch(F.$$typeof){case s:case e:Se=!0}}if(Se)return Se=F,ce=ce(Se),F=Z===""?"."+J(Se,0):Z,P(ce)?(Fe="",F!=null&&(Fe=F.replace(Q,"$&/")+"/"),re(ce,se,Fe,"",function(rt){return rt})):ce!=null&&(w(ce)&&(ce=le(ce,Fe+(!ce.key||Se&&Se.key===ce.key?"":(""+ce.key).replace(Q,"$&/")+"/")+F)),se.push(ce)),1;if(Se=0,Z=Z===""?".":Z+":",P(F))for(var Le=0;Le<F.length;Le++){xe=F[Le];var De=Z+J(xe,Le);Se+=re(xe,se,Fe,De,ce)}else if(De=v(F),typeof De=="function")for(F=De.call(F),Le=0;!(xe=F.next()).done;)xe=xe.value,De=Z+J(xe,Le++),Se+=re(xe,se,Fe,De,ce);else if(xe==="object")throw se=String(F),Error("Objects are not valid as a React child (found: "+(se==="[object Object]"?"object with keys {"+Object.keys(F).join(", ")+"}":se)+"). If you meant to render a collection of children, use an array instead.");return Se}function pe(F,se,Fe){if(F==null)return F;var Z=[],ce=0;return re(F,Z,"","",function(xe){return se.call(Fe,xe,ce++)}),Z}function ee(F){if(F._status===-1){var se=F._result;se=se(),se.then(function(Fe){(F._status===0||F._status===-1)&&(F._status=1,F._result=Fe)},function(Fe){(F._status===0||F._status===-1)&&(F._status=2,F._result=Fe)}),F._status===-1&&(F._status=0,F._result=se)}if(F._status===1)return F._result.default;throw F._result}var me={current:null},z={transition:null},ue={ReactCurrentDispatcher:me,ReactCurrentBatchConfig:z,ReactCurrentOwner:k};function ae(){throw Error("act(...) is not supported in production builds of React.")}return ut.Children={map:pe,forEach:function(F,se,Fe){pe(F,function(){se.apply(this,arguments)},Fe)},count:function(F){var se=0;return pe(F,function(){se++}),se},toArray:function(F){return pe(F,function(se){return se})||[]},only:function(F){if(!w(F))throw Error("React.Children.only expected to receive a single React element child.");return F}},ut.Component=x,ut.Fragment=t,ut.Profiler=o,ut.PureComponent=C,ut.StrictMode=i,ut.Suspense=h,ut.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ue,ut.act=ae,ut.cloneElement=function(F,se,Fe){if(F==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+F+".");var Z=M({},F.props),ce=F.key,xe=F.ref,Se=F._owner;if(se!=null){if(se.ref!==void 0&&(xe=se.ref,Se=k.current),se.key!==void 0&&(ce=""+se.key),F.type&&F.type.defaultProps)var Le=F.type.defaultProps;for(De in se)G.call(se,De)&&!U.hasOwnProperty(De)&&(Z[De]=se[De]===void 0&&Le!==void 0?Le[De]:se[De])}var De=arguments.length-2;if(De===1)Z.children=Fe;else if(1<De){Le=Array(De);for(var rt=0;rt<De;rt++)Le[rt]=arguments[rt+2];Z.children=Le}return{$$typeof:s,type:F.type,key:ce,ref:xe,props:Z,_owner:Se}},ut.createContext=function(F){return F={$$typeof:c,_currentValue:F,_currentValue2:F,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},F.Provider={$$typeof:l,_context:F},F.Consumer=F},ut.createElement=V,ut.createFactory=function(F){var se=V.bind(null,F);return se.type=F,se},ut.createRef=function(){return{current:null}},ut.forwardRef=function(F){return{$$typeof:d,render:F}},ut.isValidElement=w,ut.lazy=function(F){return{$$typeof:m,_payload:{_status:-1,_result:F},_init:ee}},ut.memo=function(F,se){return{$$typeof:p,type:F,compare:se===void 0?null:se}},ut.startTransition=function(F){var se=z.transition;z.transition={};try{F()}finally{z.transition=se}},ut.unstable_act=ae,ut.useCallback=function(F,se){return me.current.useCallback(F,se)},ut.useContext=function(F){return me.current.useContext(F)},ut.useDebugValue=function(){},ut.useDeferredValue=function(F){return me.current.useDeferredValue(F)},ut.useEffect=function(F,se){return me.current.useEffect(F,se)},ut.useId=function(){return me.current.useId()},ut.useImperativeHandle=function(F,se,Fe){return me.current.useImperativeHandle(F,se,Fe)},ut.useInsertionEffect=function(F,se){return me.current.useInsertionEffect(F,se)},ut.useLayoutEffect=function(F,se){return me.current.useLayoutEffect(F,se)},ut.useMemo=function(F,se){return me.current.useMemo(F,se)},ut.useReducer=function(F,se,Fe){return me.current.useReducer(F,se,Fe)},ut.useRef=function(F){return me.current.useRef(F)},ut.useState=function(F){return me.current.useState(F)},ut.useSyncExternalStore=function(F,se,Fe){return me.current.useSyncExternalStore(F,se,Fe)},ut.useTransition=function(){return me.current.useTransition()},ut.version="18.3.1",ut}var Zm;function sf(){return Zm||(Zm=1,Sd.exports=Qv()),Sd.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var e0;function Jv(){if(e0)return fa;e0=1;var s=sf(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,o=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function c(d,h,p){var m,_={},v=null,S=null;p!==void 0&&(v=""+p),h.key!==void 0&&(v=""+h.key),h.ref!==void 0&&(S=h.ref);for(m in h)i.call(h,m)&&!l.hasOwnProperty(m)&&(_[m]=h[m]);if(d&&d.defaultProps)for(m in h=d.defaultProps,h)_[m]===void 0&&(_[m]=h[m]);return{$$typeof:e,type:d,key:v,ref:S,props:_,_owner:o.current}}return fa.Fragment=t,fa.jsx=c,fa.jsxs=c,fa}var t0;function Zv(){return t0||(t0=1,xd.exports=Jv()),xd.exports}var j=Zv(),Pn=sf();const ey=M_(Pn);var Vl={},Md={exports:{}},Gn={},wd={exports:{}},Ed={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var n0;function ty(){return n0||(n0=1,(function(s){function e(z,ue){var ae=z.length;z.push(ue);e:for(;0<ae;){var F=ae-1>>>1,se=z[F];if(0<o(se,ue))z[F]=ue,z[ae]=se,ae=F;else break e}}function t(z){return z.length===0?null:z[0]}function i(z){if(z.length===0)return null;var ue=z[0],ae=z.pop();if(ae!==ue){z[0]=ae;e:for(var F=0,se=z.length,Fe=se>>>1;F<Fe;){var Z=2*(F+1)-1,ce=z[Z],xe=Z+1,Se=z[xe];if(0>o(ce,ae))xe<se&&0>o(Se,ce)?(z[F]=Se,z[xe]=ae,F=xe):(z[F]=ce,z[Z]=ae,F=Z);else if(xe<se&&0>o(Se,ae))z[F]=Se,z[xe]=ae,F=xe;else break e}}return ue}function o(z,ue){var ae=z.sortIndex-ue.sortIndex;return ae!==0?ae:z.id-ue.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;s.unstable_now=function(){return l.now()}}else{var c=Date,d=c.now();s.unstable_now=function(){return c.now()-d}}var h=[],p=[],m=1,_=null,v=3,S=!1,M=!1,E=!1,x=typeof setTimeout=="function"?setTimeout:null,y=typeof clearTimeout=="function"?clearTimeout:null,C=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function b(z){for(var ue=t(p);ue!==null;){if(ue.callback===null)i(p);else if(ue.startTime<=z)i(p),ue.sortIndex=ue.expirationTime,e(h,ue);else break;ue=t(p)}}function P(z){if(E=!1,b(z),!M)if(t(h)!==null)M=!0,ee(G);else{var ue=t(p);ue!==null&&me(P,ue.startTime-z)}}function G(z,ue){M=!1,E&&(E=!1,y(V),V=-1),S=!0;var ae=v;try{for(b(ue),_=t(h);_!==null&&(!(_.expirationTime>ue)||z&&!L());){var F=_.callback;if(typeof F=="function"){_.callback=null,v=_.priorityLevel;var se=F(_.expirationTime<=ue);ue=s.unstable_now(),typeof se=="function"?_.callback=se:_===t(h)&&i(h),b(ue)}else i(h);_=t(h)}if(_!==null)var Fe=!0;else{var Z=t(p);Z!==null&&me(P,Z.startTime-ue),Fe=!1}return Fe}finally{_=null,v=ae,S=!1}}var k=!1,U=null,V=-1,le=5,w=-1;function L(){return!(s.unstable_now()-w<le)}function Q(){if(U!==null){var z=s.unstable_now();w=z;var ue=!0;try{ue=U(!0,z)}finally{ue?J():(k=!1,U=null)}}else k=!1}var J;if(typeof C=="function")J=function(){C(Q)};else if(typeof MessageChannel<"u"){var re=new MessageChannel,pe=re.port2;re.port1.onmessage=Q,J=function(){pe.postMessage(null)}}else J=function(){x(Q,0)};function ee(z){U=z,k||(k=!0,J())}function me(z,ue){V=x(function(){z(s.unstable_now())},ue)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(z){z.callback=null},s.unstable_continueExecution=function(){M||S||(M=!0,ee(G))},s.unstable_forceFrameRate=function(z){0>z||125<z?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):le=0<z?Math.floor(1e3/z):5},s.unstable_getCurrentPriorityLevel=function(){return v},s.unstable_getFirstCallbackNode=function(){return t(h)},s.unstable_next=function(z){switch(v){case 1:case 2:case 3:var ue=3;break;default:ue=v}var ae=v;v=ue;try{return z()}finally{v=ae}},s.unstable_pauseExecution=function(){},s.unstable_requestPaint=function(){},s.unstable_runWithPriority=function(z,ue){switch(z){case 1:case 2:case 3:case 4:case 5:break;default:z=3}var ae=v;v=z;try{return ue()}finally{v=ae}},s.unstable_scheduleCallback=function(z,ue,ae){var F=s.unstable_now();switch(typeof ae=="object"&&ae!==null?(ae=ae.delay,ae=typeof ae=="number"&&0<ae?F+ae:F):ae=F,z){case 1:var se=-1;break;case 2:se=250;break;case 5:se=1073741823;break;case 4:se=1e4;break;default:se=5e3}return se=ae+se,z={id:m++,callback:ue,priorityLevel:z,startTime:ae,expirationTime:se,sortIndex:-1},ae>F?(z.sortIndex=ae,e(p,z),t(h)===null&&z===t(p)&&(E?(y(V),V=-1):E=!0,me(P,ae-F))):(z.sortIndex=se,e(h,z),M||S||(M=!0,ee(G))),z},s.unstable_shouldYield=L,s.unstable_wrapCallback=function(z){var ue=v;return function(){var ae=v;v=ue;try{return z.apply(this,arguments)}finally{v=ae}}}})(Ed)),Ed}var i0;function ny(){return i0||(i0=1,wd.exports=ty()),wd.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var r0;function iy(){if(r0)return Gn;r0=1;var s=sf(),e=ny();function t(n){for(var r="https://reactjs.org/docs/error-decoder.html?invariant="+n,a=1;a<arguments.length;a++)r+="&args[]="+encodeURIComponent(arguments[a]);return"Minified React error #"+n+"; visit "+r+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var i=new Set,o={};function l(n,r){c(n,r),c(n+"Capture",r)}function c(n,r){for(o[n]=r,n=0;n<r.length;n++)i.add(r[n])}var d=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),h=Object.prototype.hasOwnProperty,p=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,m={},_={};function v(n){return h.call(_,n)?!0:h.call(m,n)?!1:p.test(n)?_[n]=!0:(m[n]=!0,!1)}function S(n,r,a,u){if(a!==null&&a.type===0)return!1;switch(typeof r){case"function":case"symbol":return!0;case"boolean":return u?!1:a!==null?!a.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function M(n,r,a,u){if(r===null||typeof r>"u"||S(n,r,a,u))return!0;if(u)return!1;if(a!==null)switch(a.type){case 3:return!r;case 4:return r===!1;case 5:return isNaN(r);case 6:return isNaN(r)||1>r}return!1}function E(n,r,a,u,f,g,T){this.acceptsBooleans=r===2||r===3||r===4,this.attributeName=u,this.attributeNamespace=f,this.mustUseProperty=a,this.propertyName=n,this.type=r,this.sanitizeURL=g,this.removeEmptyString=T}var x={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){x[n]=new E(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var r=n[0];x[r]=new E(r,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){x[n]=new E(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){x[n]=new E(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){x[n]=new E(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){x[n]=new E(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){x[n]=new E(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){x[n]=new E(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){x[n]=new E(n,5,!1,n.toLowerCase(),null,!1,!1)});var y=/[\-:]([a-z])/g;function C(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var r=n.replace(y,C);x[r]=new E(r,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var r=n.replace(y,C);x[r]=new E(r,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var r=n.replace(y,C);x[r]=new E(r,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){x[n]=new E(n,1,!1,n.toLowerCase(),null,!1,!1)}),x.xlinkHref=new E("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){x[n]=new E(n,1,!1,n.toLowerCase(),null,!0,!0)});function b(n,r,a,u){var f=x.hasOwnProperty(r)?x[r]:null;(f!==null?f.type!==0:u||!(2<r.length)||r[0]!=="o"&&r[0]!=="O"||r[1]!=="n"&&r[1]!=="N")&&(M(r,a,f,u)&&(a=null),u||f===null?v(r)&&(a===null?n.removeAttribute(r):n.setAttribute(r,""+a)):f.mustUseProperty?n[f.propertyName]=a===null?f.type===3?!1:"":a:(r=f.attributeName,u=f.attributeNamespace,a===null?n.removeAttribute(r):(f=f.type,a=f===3||f===4&&a===!0?"":""+a,u?n.setAttributeNS(u,r,a):n.setAttribute(r,a))))}var P=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,G=Symbol.for("react.element"),k=Symbol.for("react.portal"),U=Symbol.for("react.fragment"),V=Symbol.for("react.strict_mode"),le=Symbol.for("react.profiler"),w=Symbol.for("react.provider"),L=Symbol.for("react.context"),Q=Symbol.for("react.forward_ref"),J=Symbol.for("react.suspense"),re=Symbol.for("react.suspense_list"),pe=Symbol.for("react.memo"),ee=Symbol.for("react.lazy"),me=Symbol.for("react.offscreen"),z=Symbol.iterator;function ue(n){return n===null||typeof n!="object"?null:(n=z&&n[z]||n["@@iterator"],typeof n=="function"?n:null)}var ae=Object.assign,F;function se(n){if(F===void 0)try{throw Error()}catch(a){var r=a.stack.trim().match(/\n( *(at )?)/);F=r&&r[1]||""}return`
`+F+n}var Fe=!1;function Z(n,r){if(!n||Fe)return"";Fe=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(r)if(r=function(){throw Error()},Object.defineProperty(r.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(r,[])}catch(ie){var u=ie}Reflect.construct(n,[],r)}else{try{r.call()}catch(ie){u=ie}n.call(r.prototype)}else{try{throw Error()}catch(ie){u=ie}n()}}catch(ie){if(ie&&u&&typeof ie.stack=="string"){for(var f=ie.stack.split(`
`),g=u.stack.split(`
`),T=f.length-1,N=g.length-1;1<=T&&0<=N&&f[T]!==g[N];)N--;for(;1<=T&&0<=N;T--,N--)if(f[T]!==g[N]){if(T!==1||N!==1)do if(T--,N--,0>N||f[T]!==g[N]){var O=`
`+f[T].replace(" at new "," at ");return n.displayName&&O.includes("<anonymous>")&&(O=O.replace("<anonymous>",n.displayName)),O}while(1<=T&&0<=N);break}}}finally{Fe=!1,Error.prepareStackTrace=a}return(n=n?n.displayName||n.name:"")?se(n):""}function ce(n){switch(n.tag){case 5:return se(n.type);case 16:return se("Lazy");case 13:return se("Suspense");case 19:return se("SuspenseList");case 0:case 2:case 15:return n=Z(n.type,!1),n;case 11:return n=Z(n.type.render,!1),n;case 1:return n=Z(n.type,!0),n;default:return""}}function xe(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case U:return"Fragment";case k:return"Portal";case le:return"Profiler";case V:return"StrictMode";case J:return"Suspense";case re:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case L:return(n.displayName||"Context")+".Consumer";case w:return(n._context.displayName||"Context")+".Provider";case Q:var r=n.render;return n=n.displayName,n||(n=r.displayName||r.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case pe:return r=n.displayName||null,r!==null?r:xe(n.type)||"Memo";case ee:r=n._payload,n=n._init;try{return xe(n(r))}catch{}}return null}function Se(n){var r=n.type;switch(n.tag){case 24:return"Cache";case 9:return(r.displayName||"Context")+".Consumer";case 10:return(r._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=r.render,n=n.displayName||n.name||"",r.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return r;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return xe(r);case 8:return r===V?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof r=="function")return r.displayName||r.name||null;if(typeof r=="string")return r}return null}function Le(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function De(n){var r=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(r==="checkbox"||r==="radio")}function rt(n){var r=De(n)?"checked":"value",a=Object.getOwnPropertyDescriptor(n.constructor.prototype,r),u=""+n[r];if(!n.hasOwnProperty(r)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var f=a.get,g=a.set;return Object.defineProperty(n,r,{configurable:!0,get:function(){return f.call(this)},set:function(T){u=""+T,g.call(this,T)}}),Object.defineProperty(n,r,{enumerable:a.enumerable}),{getValue:function(){return u},setValue:function(T){u=""+T},stopTracking:function(){n._valueTracker=null,delete n[r]}}}}function yt(n){n._valueTracker||(n._valueTracker=rt(n))}function ft(n){if(!n)return!1;var r=n._valueTracker;if(!r)return!0;var a=r.getValue(),u="";return n&&(u=De(n)?n.checked?"true":"false":n.value),n=u,n!==a?(r.setValue(n),!0):!1}function B(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function vn(n,r){var a=r.checked;return ae({},r,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:a??n._wrapperState.initialChecked})}function ht(n,r){var a=r.defaultValue==null?"":r.defaultValue,u=r.checked!=null?r.checked:r.defaultChecked;a=Le(r.value!=null?r.value:a),n._wrapperState={initialChecked:u,initialValue:a,controlled:r.type==="checkbox"||r.type==="radio"?r.checked!=null:r.value!=null}}function _t(n,r){r=r.checked,r!=null&&b(n,"checked",r,!1)}function et(n,r){_t(n,r);var a=Le(r.value),u=r.type;if(a!=null)u==="number"?(a===0&&n.value===""||n.value!=a)&&(n.value=""+a):n.value!==""+a&&(n.value=""+a);else if(u==="submit"||u==="reset"){n.removeAttribute("value");return}r.hasOwnProperty("value")?nt(n,r.type,a):r.hasOwnProperty("defaultValue")&&nt(n,r.type,Le(r.defaultValue)),r.checked==null&&r.defaultChecked!=null&&(n.defaultChecked=!!r.defaultChecked)}function Dt(n,r,a){if(r.hasOwnProperty("value")||r.hasOwnProperty("defaultValue")){var u=r.type;if(!(u!=="submit"&&u!=="reset"||r.value!==void 0&&r.value!==null))return;r=""+n._wrapperState.initialValue,a||r===n.value||(n.value=r),n.defaultValue=r}a=n.name,a!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,a!==""&&(n.name=a)}function nt(n,r,a){(r!=="number"||B(n.ownerDocument)!==n)&&(a==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+a&&(n.defaultValue=""+a))}var D=Array.isArray;function A(n,r,a,u){if(n=n.options,r){r={};for(var f=0;f<a.length;f++)r["$"+a[f]]=!0;for(a=0;a<n.length;a++)f=r.hasOwnProperty("$"+n[a].value),n[a].selected!==f&&(n[a].selected=f),f&&u&&(n[a].defaultSelected=!0)}else{for(a=""+Le(a),r=null,f=0;f<n.length;f++){if(n[f].value===a){n[f].selected=!0,u&&(n[f].defaultSelected=!0);return}r!==null||n[f].disabled||(r=n[f])}r!==null&&(r.selected=!0)}}function $(n,r){if(r.dangerouslySetInnerHTML!=null)throw Error(t(91));return ae({},r,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function he(n,r){var a=r.value;if(a==null){if(a=r.children,r=r.defaultValue,a!=null){if(r!=null)throw Error(t(92));if(D(a)){if(1<a.length)throw Error(t(93));a=a[0]}r=a}r==null&&(r=""),a=r}n._wrapperState={initialValue:Le(a)}}function ve(n,r){var a=Le(r.value),u=Le(r.defaultValue);a!=null&&(a=""+a,a!==n.value&&(n.value=a),r.defaultValue==null&&n.defaultValue!==a&&(n.defaultValue=a)),u!=null&&(n.defaultValue=""+u)}function de(n){var r=n.textContent;r===n._wrapperState.initialValue&&r!==""&&r!==null&&(n.value=r)}function Ye(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Ae(n,r){return n==null||n==="http://www.w3.org/1999/xhtml"?Ye(r):n==="http://www.w3.org/2000/svg"&&r==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var Oe,gt=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(r,a,u,f){MSApp.execUnsafeLocalFunction(function(){return n(r,a,u,f)})}:n})(function(n,r){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=r;else{for(Oe=Oe||document.createElement("div"),Oe.innerHTML="<svg>"+r.valueOf().toString()+"</svg>",r=Oe.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;r.firstChild;)n.appendChild(r.firstChild)}});function Me(n,r){if(r){var a=n.firstChild;if(a&&a===n.lastChild&&a.nodeType===3){a.nodeValue=r;return}}n.textContent=r}var Be={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},st=["Webkit","ms","Moz","O"];Object.keys(Be).forEach(function(n){st.forEach(function(r){r=r+n.charAt(0).toUpperCase()+n.substring(1),Be[r]=Be[n]})});function it(n,r,a){return r==null||typeof r=="boolean"||r===""?"":a||typeof r!="number"||r===0||Be.hasOwnProperty(n)&&Be[n]?(""+r).trim():r+"px"}function He(n,r){n=n.style;for(var a in r)if(r.hasOwnProperty(a)){var u=a.indexOf("--")===0,f=it(a,r[a],u);a==="float"&&(a="cssFloat"),u?n.setProperty(a,f):n[a]=f}}var pt=ae({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function at(n,r){if(r){if(pt[n]&&(r.children!=null||r.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(r.dangerouslySetInnerHTML!=null){if(r.children!=null)throw Error(t(60));if(typeof r.dangerouslySetInnerHTML!="object"||!("__html"in r.dangerouslySetInnerHTML))throw Error(t(61))}if(r.style!=null&&typeof r.style!="object")throw Error(t(62))}}function Rt(n,r){if(n.indexOf("-")===-1)return typeof r.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var W=null;function Ie(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var oe=null,fe=null,Ce=null;function Ue(n){if(n=Jo(n)){if(typeof oe!="function")throw Error(t(280));var r=n.stateNode;r&&(r=nl(r),oe(n.stateNode,n.type,r))}}function mt(n){fe?Ce?Ce.push(n):Ce=[n]:fe=n}function Wt(){if(fe){var n=fe,r=Ce;if(Ce=fe=null,Ue(n),r)for(n=0;n<r.length;n++)Ue(r[n])}}function yn(n,r){return n(r)}function vt(){}var sn=!1;function ri(n,r,a){if(sn)return n(r,a);sn=!0;try{return yn(n,r,a)}finally{sn=!1,(fe!==null||Ce!==null)&&(vt(),Wt())}}function ur(n,r){var a=n.stateNode;if(a===null)return null;var u=nl(a);if(u===null)return null;a=u[r];e:switch(r){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(u=!u.disabled)||(n=n.type,u=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!u;break e;default:n=!1}if(n)return null;if(a&&typeof a!="function")throw Error(t(231,r,typeof a));return a}var Es=!1;if(d)try{var Kn={};Object.defineProperty(Kn,"passive",{get:function(){Es=!0}}),window.addEventListener("test",Kn,Kn),window.removeEventListener("test",Kn,Kn)}catch{Es=!1}function Io(n,r,a,u,f,g,T,N,O){var ie=Array.prototype.slice.call(arguments,3);try{r.apply(a,ie)}catch(ge){this.onError(ge)}}var dr=!1,Xr=null,zi=!1,Ts=null,bs={onError:function(n){dr=!0,Xr=n}};function Fa(n,r,a,u,f,g,T,N,O){dr=!1,Xr=null,Io.apply(bs,arguments)}function Oa(n,r,a,u,f,g,T,N,O){if(Fa.apply(this,arguments),dr){if(dr){var ie=Xr;dr=!1,Xr=null}else throw Error(t(198));zi||(zi=!0,Ts=ie)}}function Vi(n){var r=n,a=n;if(n.alternate)for(;r.return;)r=r.return;else{n=r;do r=n,(r.flags&4098)!==0&&(a=r.return),n=r.return;while(n)}return r.tag===3?a:null}function Ba(n){if(n.tag===13){var r=n.memoizedState;if(r===null&&(n=n.alternate,n!==null&&(r=n.memoizedState)),r!==null)return r.dehydrated}return null}function za(n){if(Vi(n)!==n)throw Error(t(188))}function R(n){var r=n.alternate;if(!r){if(r=Vi(n),r===null)throw Error(t(188));return r!==n?null:n}for(var a=n,u=r;;){var f=a.return;if(f===null)break;var g=f.alternate;if(g===null){if(u=f.return,u!==null){a=u;continue}break}if(f.child===g.child){for(g=f.child;g;){if(g===a)return za(f),n;if(g===u)return za(f),r;g=g.sibling}throw Error(t(188))}if(a.return!==u.return)a=f,u=g;else{for(var T=!1,N=f.child;N;){if(N===a){T=!0,a=f,u=g;break}if(N===u){T=!0,u=f,a=g;break}N=N.sibling}if(!T){for(N=g.child;N;){if(N===a){T=!0,a=g,u=f;break}if(N===u){T=!0,u=g,a=f;break}N=N.sibling}if(!T)throw Error(t(189))}}if(a.alternate!==u)throw Error(t(190))}if(a.tag!==3)throw Error(t(188));return a.stateNode.current===a?n:r}function q(n){return n=R(n),n!==null?te(n):null}function te(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var r=te(n);if(r!==null)return r;n=n.sibling}return null}var ne=e.unstable_scheduleCallback,X=e.unstable_cancelCallback,Ee=e.unstable_shouldYield,Ne=e.unstable_requestPaint,Te=e.unstable_now,Xe=e.unstable_getCurrentPriorityLevel,Ze=e.unstable_ImmediatePriority,tt=e.unstable_UserBlockingPriority,je=e.unstable_NormalPriority,Et=e.unstable_LowPriority,It=e.unstable_IdlePriority,Ut=null,Ht=null;function St(n){if(Ht&&typeof Ht.onCommitFiberRoot=="function")try{Ht.onCommitFiberRoot(Ut,n,void 0,(n.current.flags&128)===128)}catch{}}var ze=Math.clz32?Math.clz32:Yn,Zt=Math.log,Mt=Math.LN2;function Yn(n){return n>>>=0,n===0?32:31-(Zt(n)/Mt|0)|0}var fi=64,on=4194304;function Hi(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Ft(n,r){var a=n.pendingLanes;if(a===0)return 0;var u=0,f=n.suspendedLanes,g=n.pingedLanes,T=a&268435455;if(T!==0){var N=T&~f;N!==0?u=Hi(N):(g&=T,g!==0&&(u=Hi(g)))}else T=a&~f,T!==0?u=Hi(T):g!==0&&(u=Hi(g));if(u===0)return 0;if(r!==0&&r!==u&&(r&f)===0&&(f=u&-u,g=r&-r,f>=g||f===16&&(g&4194240)!==0))return r;if((u&4)!==0&&(u|=a&16),r=n.entangledLanes,r!==0)for(n=n.entanglements,r&=u;0<r;)a=31-ze(r),f=1<<a,u|=n[a],r&=~f;return u}function Pi(n,r){switch(n){case 1:case 2:case 4:return r+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return r+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function No(n,r){for(var a=n.suspendedLanes,u=n.pingedLanes,f=n.expirationTimes,g=n.pendingLanes;0<g;){var T=31-ze(g),N=1<<T,O=f[T];O===-1?((N&a)===0||(N&u)!==0)&&(f[T]=Pi(N,r)):O<=r&&(n.expiredLanes|=N),g&=~N}}function Mn(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function As(){var n=fi;return fi<<=1,(fi&4194240)===0&&(fi=64),n}function Uo(n){for(var r=[],a=0;31>a;a++)r.push(n);return r}function hr(n,r,a){n.pendingLanes|=r,r!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,r=31-ze(r),n[r]=a}function vg(n,r){var a=n.pendingLanes&~r;n.pendingLanes=r,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=r,n.mutableReadLanes&=r,n.entangledLanes&=r,r=n.entanglements;var u=n.eventTimes;for(n=n.expirationTimes;0<a;){var f=31-ze(a),g=1<<f;r[f]=0,u[f]=-1,n[f]=-1,a&=~g}}function Gc(n,r){var a=n.entangledLanes|=r;for(n=n.entanglements;a;){var u=31-ze(a),f=1<<u;f&r|n[u]&r&&(n[u]|=r),a&=~f}}var Pt=0;function Pf(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var Lf,Wc,Df,If,Nf,qc=!1,Va=[],fr=null,pr=null,mr=null,ko=new Map,Fo=new Map,_r=[],yg="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Uf(n,r){switch(n){case"focusin":case"focusout":fr=null;break;case"dragenter":case"dragleave":pr=null;break;case"mouseover":case"mouseout":mr=null;break;case"pointerover":case"pointerout":ko.delete(r.pointerId);break;case"gotpointercapture":case"lostpointercapture":Fo.delete(r.pointerId)}}function Oo(n,r,a,u,f,g){return n===null||n.nativeEvent!==g?(n={blockedOn:r,domEventName:a,eventSystemFlags:u,nativeEvent:g,targetContainers:[f]},r!==null&&(r=Jo(r),r!==null&&Wc(r)),n):(n.eventSystemFlags|=u,r=n.targetContainers,f!==null&&r.indexOf(f)===-1&&r.push(f),n)}function xg(n,r,a,u,f){switch(r){case"focusin":return fr=Oo(fr,n,r,a,u,f),!0;case"dragenter":return pr=Oo(pr,n,r,a,u,f),!0;case"mouseover":return mr=Oo(mr,n,r,a,u,f),!0;case"pointerover":var g=f.pointerId;return ko.set(g,Oo(ko.get(g)||null,n,r,a,u,f)),!0;case"gotpointercapture":return g=f.pointerId,Fo.set(g,Oo(Fo.get(g)||null,n,r,a,u,f)),!0}return!1}function kf(n){var r=jr(n.target);if(r!==null){var a=Vi(r);if(a!==null){if(r=a.tag,r===13){if(r=Ba(a),r!==null){n.blockedOn=r,Nf(n.priority,function(){Df(a)});return}}else if(r===3&&a.stateNode.current.memoizedState.isDehydrated){n.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Ha(n){if(n.blockedOn!==null)return!1;for(var r=n.targetContainers;0<r.length;){var a=jc(n.domEventName,n.eventSystemFlags,r[0],n.nativeEvent);if(a===null){a=n.nativeEvent;var u=new a.constructor(a.type,a);W=u,a.target.dispatchEvent(u),W=null}else return r=Jo(a),r!==null&&Wc(r),n.blockedOn=a,!1;r.shift()}return!0}function Ff(n,r,a){Ha(n)&&a.delete(r)}function Sg(){qc=!1,fr!==null&&Ha(fr)&&(fr=null),pr!==null&&Ha(pr)&&(pr=null),mr!==null&&Ha(mr)&&(mr=null),ko.forEach(Ff),Fo.forEach(Ff)}function Bo(n,r){n.blockedOn===r&&(n.blockedOn=null,qc||(qc=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,Sg)))}function zo(n){function r(f){return Bo(f,n)}if(0<Va.length){Bo(Va[0],n);for(var a=1;a<Va.length;a++){var u=Va[a];u.blockedOn===n&&(u.blockedOn=null)}}for(fr!==null&&Bo(fr,n),pr!==null&&Bo(pr,n),mr!==null&&Bo(mr,n),ko.forEach(r),Fo.forEach(r),a=0;a<_r.length;a++)u=_r[a],u.blockedOn===n&&(u.blockedOn=null);for(;0<_r.length&&(a=_r[0],a.blockedOn===null);)kf(a),a.blockedOn===null&&_r.shift()}var Cs=P.ReactCurrentBatchConfig,Ga=!0;function Mg(n,r,a,u){var f=Pt,g=Cs.transition;Cs.transition=null;try{Pt=1,Xc(n,r,a,u)}finally{Pt=f,Cs.transition=g}}function wg(n,r,a,u){var f=Pt,g=Cs.transition;Cs.transition=null;try{Pt=4,Xc(n,r,a,u)}finally{Pt=f,Cs.transition=g}}function Xc(n,r,a,u){if(Ga){var f=jc(n,r,a,u);if(f===null)uu(n,r,u,Wa,a),Uf(n,u);else if(xg(f,n,r,a,u))u.stopPropagation();else if(Uf(n,u),r&4&&-1<yg.indexOf(n)){for(;f!==null;){var g=Jo(f);if(g!==null&&Lf(g),g=jc(n,r,a,u),g===null&&uu(n,r,u,Wa,a),g===f)break;f=g}f!==null&&u.stopPropagation()}else uu(n,r,u,null,a)}}var Wa=null;function jc(n,r,a,u){if(Wa=null,n=Ie(u),n=jr(n),n!==null)if(r=Vi(n),r===null)n=null;else if(a=r.tag,a===13){if(n=Ba(r),n!==null)return n;n=null}else if(a===3){if(r.stateNode.current.memoizedState.isDehydrated)return r.tag===3?r.stateNode.containerInfo:null;n=null}else r!==n&&(n=null);return Wa=n,null}function Of(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Xe()){case Ze:return 1;case tt:return 4;case je:case Et:return 16;case It:return 536870912;default:return 16}default:return 16}}var gr=null,Kc=null,qa=null;function Bf(){if(qa)return qa;var n,r=Kc,a=r.length,u,f="value"in gr?gr.value:gr.textContent,g=f.length;for(n=0;n<a&&r[n]===f[n];n++);var T=a-n;for(u=1;u<=T&&r[a-u]===f[g-u];u++);return qa=f.slice(n,1<u?1-u:void 0)}function Xa(n){var r=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&r===13&&(n=13)):n=r,n===10&&(n=13),32<=n||n===13?n:0}function ja(){return!0}function zf(){return!1}function $n(n){function r(a,u,f,g,T){this._reactName=a,this._targetInst=f,this.type=u,this.nativeEvent=g,this.target=T,this.currentTarget=null;for(var N in n)n.hasOwnProperty(N)&&(a=n[N],this[N]=a?a(g):g[N]);return this.isDefaultPrevented=(g.defaultPrevented!=null?g.defaultPrevented:g.returnValue===!1)?ja:zf,this.isPropagationStopped=zf,this}return ae(r.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=ja)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=ja)},persist:function(){},isPersistent:ja}),r}var Rs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Yc=$n(Rs),Vo=ae({},Rs,{view:0,detail:0}),Eg=$n(Vo),$c,Qc,Ho,Ka=ae({},Vo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Zc,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==Ho&&(Ho&&n.type==="mousemove"?($c=n.screenX-Ho.screenX,Qc=n.screenY-Ho.screenY):Qc=$c=0,Ho=n),$c)},movementY:function(n){return"movementY"in n?n.movementY:Qc}}),Vf=$n(Ka),Tg=ae({},Ka,{dataTransfer:0}),bg=$n(Tg),Ag=ae({},Vo,{relatedTarget:0}),Jc=$n(Ag),Cg=ae({},Rs,{animationName:0,elapsedTime:0,pseudoElement:0}),Rg=$n(Cg),Pg=ae({},Rs,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),Lg=$n(Pg),Dg=ae({},Rs,{data:0}),Hf=$n(Dg),Ig={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Ng={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Ug={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function kg(n){var r=this.nativeEvent;return r.getModifierState?r.getModifierState(n):(n=Ug[n])?!!r[n]:!1}function Zc(){return kg}var Fg=ae({},Vo,{key:function(n){if(n.key){var r=Ig[n.key]||n.key;if(r!=="Unidentified")return r}return n.type==="keypress"?(n=Xa(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?Ng[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Zc,charCode:function(n){return n.type==="keypress"?Xa(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Xa(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),Og=$n(Fg),Bg=ae({},Ka,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Gf=$n(Bg),zg=ae({},Vo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Zc}),Vg=$n(zg),Hg=ae({},Rs,{propertyName:0,elapsedTime:0,pseudoElement:0}),Gg=$n(Hg),Wg=ae({},Ka,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),qg=$n(Wg),Xg=[9,13,27,32],eu=d&&"CompositionEvent"in window,Go=null;d&&"documentMode"in document&&(Go=document.documentMode);var jg=d&&"TextEvent"in window&&!Go,Wf=d&&(!eu||Go&&8<Go&&11>=Go),qf=" ",Xf=!1;function jf(n,r){switch(n){case"keyup":return Xg.indexOf(r.keyCode)!==-1;case"keydown":return r.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Kf(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var Ps=!1;function Kg(n,r){switch(n){case"compositionend":return Kf(r);case"keypress":return r.which!==32?null:(Xf=!0,qf);case"textInput":return n=r.data,n===qf&&Xf?null:n;default:return null}}function Yg(n,r){if(Ps)return n==="compositionend"||!eu&&jf(n,r)?(n=Bf(),qa=Kc=gr=null,Ps=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(r.ctrlKey||r.altKey||r.metaKey)||r.ctrlKey&&r.altKey){if(r.char&&1<r.char.length)return r.char;if(r.which)return String.fromCharCode(r.which)}return null;case"compositionend":return Wf&&r.locale!=="ko"?null:r.data;default:return null}}var $g={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Yf(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r==="input"?!!$g[n.type]:r==="textarea"}function $f(n,r,a,u){mt(u),r=Za(r,"onChange"),0<r.length&&(a=new Yc("onChange","change",null,a,u),n.push({event:a,listeners:r}))}var Wo=null,qo=null;function Qg(n){pp(n,0)}function Ya(n){var r=Us(n);if(ft(r))return n}function Jg(n,r){if(n==="change")return r}var Qf=!1;if(d){var tu;if(d){var nu="oninput"in document;if(!nu){var Jf=document.createElement("div");Jf.setAttribute("oninput","return;"),nu=typeof Jf.oninput=="function"}tu=nu}else tu=!1;Qf=tu&&(!document.documentMode||9<document.documentMode)}function Zf(){Wo&&(Wo.detachEvent("onpropertychange",ep),qo=Wo=null)}function ep(n){if(n.propertyName==="value"&&Ya(qo)){var r=[];$f(r,qo,n,Ie(n)),ri(Qg,r)}}function Zg(n,r,a){n==="focusin"?(Zf(),Wo=r,qo=a,Wo.attachEvent("onpropertychange",ep)):n==="focusout"&&Zf()}function ev(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return Ya(qo)}function tv(n,r){if(n==="click")return Ya(r)}function nv(n,r){if(n==="input"||n==="change")return Ya(r)}function iv(n,r){return n===r&&(n!==0||1/n===1/r)||n!==n&&r!==r}var pi=typeof Object.is=="function"?Object.is:iv;function Xo(n,r){if(pi(n,r))return!0;if(typeof n!="object"||n===null||typeof r!="object"||r===null)return!1;var a=Object.keys(n),u=Object.keys(r);if(a.length!==u.length)return!1;for(u=0;u<a.length;u++){var f=a[u];if(!h.call(r,f)||!pi(n[f],r[f]))return!1}return!0}function tp(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function np(n,r){var a=tp(n);n=0;for(var u;a;){if(a.nodeType===3){if(u=n+a.textContent.length,n<=r&&u>=r)return{node:a,offset:r-n};n=u}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=tp(a)}}function ip(n,r){return n&&r?n===r?!0:n&&n.nodeType===3?!1:r&&r.nodeType===3?ip(n,r.parentNode):"contains"in n?n.contains(r):n.compareDocumentPosition?!!(n.compareDocumentPosition(r)&16):!1:!1}function rp(){for(var n=window,r=B();r instanceof n.HTMLIFrameElement;){try{var a=typeof r.contentWindow.location.href=="string"}catch{a=!1}if(a)n=r.contentWindow;else break;r=B(n.document)}return r}function iu(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r&&(r==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||r==="textarea"||n.contentEditable==="true")}function rv(n){var r=rp(),a=n.focusedElem,u=n.selectionRange;if(r!==a&&a&&a.ownerDocument&&ip(a.ownerDocument.documentElement,a)){if(u!==null&&iu(a)){if(r=u.start,n=u.end,n===void 0&&(n=r),"selectionStart"in a)a.selectionStart=r,a.selectionEnd=Math.min(n,a.value.length);else if(n=(r=a.ownerDocument||document)&&r.defaultView||window,n.getSelection){n=n.getSelection();var f=a.textContent.length,g=Math.min(u.start,f);u=u.end===void 0?g:Math.min(u.end,f),!n.extend&&g>u&&(f=u,u=g,g=f),f=np(a,g);var T=np(a,u);f&&T&&(n.rangeCount!==1||n.anchorNode!==f.node||n.anchorOffset!==f.offset||n.focusNode!==T.node||n.focusOffset!==T.offset)&&(r=r.createRange(),r.setStart(f.node,f.offset),n.removeAllRanges(),g>u?(n.addRange(r),n.extend(T.node,T.offset)):(r.setEnd(T.node,T.offset),n.addRange(r)))}}for(r=[],n=a;n=n.parentNode;)n.nodeType===1&&r.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof a.focus=="function"&&a.focus(),a=0;a<r.length;a++)n=r[a],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var sv=d&&"documentMode"in document&&11>=document.documentMode,Ls=null,ru=null,jo=null,su=!1;function sp(n,r,a){var u=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;su||Ls==null||Ls!==B(u)||(u=Ls,"selectionStart"in u&&iu(u)?u={start:u.selectionStart,end:u.selectionEnd}:(u=(u.ownerDocument&&u.ownerDocument.defaultView||window).getSelection(),u={anchorNode:u.anchorNode,anchorOffset:u.anchorOffset,focusNode:u.focusNode,focusOffset:u.focusOffset}),jo&&Xo(jo,u)||(jo=u,u=Za(ru,"onSelect"),0<u.length&&(r=new Yc("onSelect","select",null,r,a),n.push({event:r,listeners:u}),r.target=Ls)))}function $a(n,r){var a={};return a[n.toLowerCase()]=r.toLowerCase(),a["Webkit"+n]="webkit"+r,a["Moz"+n]="moz"+r,a}var Ds={animationend:$a("Animation","AnimationEnd"),animationiteration:$a("Animation","AnimationIteration"),animationstart:$a("Animation","AnimationStart"),transitionend:$a("Transition","TransitionEnd")},ou={},op={};d&&(op=document.createElement("div").style,"AnimationEvent"in window||(delete Ds.animationend.animation,delete Ds.animationiteration.animation,delete Ds.animationstart.animation),"TransitionEvent"in window||delete Ds.transitionend.transition);function Qa(n){if(ou[n])return ou[n];if(!Ds[n])return n;var r=Ds[n],a;for(a in r)if(r.hasOwnProperty(a)&&a in op)return ou[n]=r[a];return n}var ap=Qa("animationend"),lp=Qa("animationiteration"),cp=Qa("animationstart"),up=Qa("transitionend"),dp=new Map,hp="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function vr(n,r){dp.set(n,r),l(r,[n])}for(var au=0;au<hp.length;au++){var lu=hp[au],ov=lu.toLowerCase(),av=lu[0].toUpperCase()+lu.slice(1);vr(ov,"on"+av)}vr(ap,"onAnimationEnd"),vr(lp,"onAnimationIteration"),vr(cp,"onAnimationStart"),vr("dblclick","onDoubleClick"),vr("focusin","onFocus"),vr("focusout","onBlur"),vr(up,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),l("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),l("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),l("onBeforeInput",["compositionend","keypress","textInput","paste"]),l("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ko="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),lv=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ko));function fp(n,r,a){var u=n.type||"unknown-event";n.currentTarget=a,Oa(u,r,void 0,n),n.currentTarget=null}function pp(n,r){r=(r&4)!==0;for(var a=0;a<n.length;a++){var u=n[a],f=u.event;u=u.listeners;e:{var g=void 0;if(r)for(var T=u.length-1;0<=T;T--){var N=u[T],O=N.instance,ie=N.currentTarget;if(N=N.listener,O!==g&&f.isPropagationStopped())break e;fp(f,N,ie),g=O}else for(T=0;T<u.length;T++){if(N=u[T],O=N.instance,ie=N.currentTarget,N=N.listener,O!==g&&f.isPropagationStopped())break e;fp(f,N,ie),g=O}}}if(zi)throw n=Ts,zi=!1,Ts=null,n}function zt(n,r){var a=r[_u];a===void 0&&(a=r[_u]=new Set);var u=n+"__bubble";a.has(u)||(mp(r,n,2,!1),a.add(u))}function cu(n,r,a){var u=0;r&&(u|=4),mp(a,n,u,r)}var Ja="_reactListening"+Math.random().toString(36).slice(2);function Yo(n){if(!n[Ja]){n[Ja]=!0,i.forEach(function(a){a!=="selectionchange"&&(lv.has(a)||cu(a,!1,n),cu(a,!0,n))});var r=n.nodeType===9?n:n.ownerDocument;r===null||r[Ja]||(r[Ja]=!0,cu("selectionchange",!1,r))}}function mp(n,r,a,u){switch(Of(r)){case 1:var f=Mg;break;case 4:f=wg;break;default:f=Xc}a=f.bind(null,r,a,n),f=void 0,!Es||r!=="touchstart"&&r!=="touchmove"&&r!=="wheel"||(f=!0),u?f!==void 0?n.addEventListener(r,a,{capture:!0,passive:f}):n.addEventListener(r,a,!0):f!==void 0?n.addEventListener(r,a,{passive:f}):n.addEventListener(r,a,!1)}function uu(n,r,a,u,f){var g=u;if((r&1)===0&&(r&2)===0&&u!==null)e:for(;;){if(u===null)return;var T=u.tag;if(T===3||T===4){var N=u.stateNode.containerInfo;if(N===f||N.nodeType===8&&N.parentNode===f)break;if(T===4)for(T=u.return;T!==null;){var O=T.tag;if((O===3||O===4)&&(O=T.stateNode.containerInfo,O===f||O.nodeType===8&&O.parentNode===f))return;T=T.return}for(;N!==null;){if(T=jr(N),T===null)return;if(O=T.tag,O===5||O===6){u=g=T;continue e}N=N.parentNode}}u=u.return}ri(function(){var ie=g,ge=Ie(a),ye=[];e:{var _e=dp.get(n);if(_e!==void 0){var ke=Yc,We=n;switch(n){case"keypress":if(Xa(a)===0)break e;case"keydown":case"keyup":ke=Og;break;case"focusin":We="focus",ke=Jc;break;case"focusout":We="blur",ke=Jc;break;case"beforeblur":case"afterblur":ke=Jc;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":ke=Vf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":ke=bg;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":ke=Vg;break;case ap:case lp:case cp:ke=Rg;break;case up:ke=Gg;break;case"scroll":ke=Eg;break;case"wheel":ke=qg;break;case"copy":case"cut":case"paste":ke=Lg;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":ke=Gf}var qe=(r&4)!==0,Kt=!qe&&n==="scroll",K=qe?_e!==null?_e+"Capture":null:_e;qe=[];for(var H=ie,Y;H!==null;){Y=H;var we=Y.stateNode;if(Y.tag===5&&we!==null&&(Y=we,K!==null&&(we=ur(H,K),we!=null&&qe.push($o(H,we,Y)))),Kt)break;H=H.return}0<qe.length&&(_e=new ke(_e,We,null,a,ge),ye.push({event:_e,listeners:qe}))}}if((r&7)===0){e:{if(_e=n==="mouseover"||n==="pointerover",ke=n==="mouseout"||n==="pointerout",_e&&a!==W&&(We=a.relatedTarget||a.fromElement)&&(jr(We)||We[Gi]))break e;if((ke||_e)&&(_e=ge.window===ge?ge:(_e=ge.ownerDocument)?_e.defaultView||_e.parentWindow:window,ke?(We=a.relatedTarget||a.toElement,ke=ie,We=We?jr(We):null,We!==null&&(Kt=Vi(We),We!==Kt||We.tag!==5&&We.tag!==6)&&(We=null)):(ke=null,We=ie),ke!==We)){if(qe=Vf,we="onMouseLeave",K="onMouseEnter",H="mouse",(n==="pointerout"||n==="pointerover")&&(qe=Gf,we="onPointerLeave",K="onPointerEnter",H="pointer"),Kt=ke==null?_e:Us(ke),Y=We==null?_e:Us(We),_e=new qe(we,H+"leave",ke,a,ge),_e.target=Kt,_e.relatedTarget=Y,we=null,jr(ge)===ie&&(qe=new qe(K,H+"enter",We,a,ge),qe.target=Y,qe.relatedTarget=Kt,we=qe),Kt=we,ke&&We)t:{for(qe=ke,K=We,H=0,Y=qe;Y;Y=Is(Y))H++;for(Y=0,we=K;we;we=Is(we))Y++;for(;0<H-Y;)qe=Is(qe),H--;for(;0<Y-H;)K=Is(K),Y--;for(;H--;){if(qe===K||K!==null&&qe===K.alternate)break t;qe=Is(qe),K=Is(K)}qe=null}else qe=null;ke!==null&&_p(ye,_e,ke,qe,!1),We!==null&&Kt!==null&&_p(ye,Kt,We,qe,!0)}}e:{if(_e=ie?Us(ie):window,ke=_e.nodeName&&_e.nodeName.toLowerCase(),ke==="select"||ke==="input"&&_e.type==="file")var Ke=Jg;else if(Yf(_e))if(Qf)Ke=nv;else{Ke=ev;var Qe=Zg}else(ke=_e.nodeName)&&ke.toLowerCase()==="input"&&(_e.type==="checkbox"||_e.type==="radio")&&(Ke=tv);if(Ke&&(Ke=Ke(n,ie))){$f(ye,Ke,a,ge);break e}Qe&&Qe(n,_e,ie),n==="focusout"&&(Qe=_e._wrapperState)&&Qe.controlled&&_e.type==="number"&&nt(_e,"number",_e.value)}switch(Qe=ie?Us(ie):window,n){case"focusin":(Yf(Qe)||Qe.contentEditable==="true")&&(Ls=Qe,ru=ie,jo=null);break;case"focusout":jo=ru=Ls=null;break;case"mousedown":su=!0;break;case"contextmenu":case"mouseup":case"dragend":su=!1,sp(ye,a,ge);break;case"selectionchange":if(sv)break;case"keydown":case"keyup":sp(ye,a,ge)}var Je;if(eu)e:{switch(n){case"compositionstart":var ot="onCompositionStart";break e;case"compositionend":ot="onCompositionEnd";break e;case"compositionupdate":ot="onCompositionUpdate";break e}ot=void 0}else Ps?jf(n,a)&&(ot="onCompositionEnd"):n==="keydown"&&a.keyCode===229&&(ot="onCompositionStart");ot&&(Wf&&a.locale!=="ko"&&(Ps||ot!=="onCompositionStart"?ot==="onCompositionEnd"&&Ps&&(Je=Bf()):(gr=ge,Kc="value"in gr?gr.value:gr.textContent,Ps=!0)),Qe=Za(ie,ot),0<Qe.length&&(ot=new Hf(ot,n,null,a,ge),ye.push({event:ot,listeners:Qe}),Je?ot.data=Je:(Je=Kf(a),Je!==null&&(ot.data=Je)))),(Je=jg?Kg(n,a):Yg(n,a))&&(ie=Za(ie,"onBeforeInput"),0<ie.length&&(ge=new Hf("onBeforeInput","beforeinput",null,a,ge),ye.push({event:ge,listeners:ie}),ge.data=Je))}pp(ye,r)})}function $o(n,r,a){return{instance:n,listener:r,currentTarget:a}}function Za(n,r){for(var a=r+"Capture",u=[];n!==null;){var f=n,g=f.stateNode;f.tag===5&&g!==null&&(f=g,g=ur(n,a),g!=null&&u.unshift($o(n,g,f)),g=ur(n,r),g!=null&&u.push($o(n,g,f))),n=n.return}return u}function Is(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function _p(n,r,a,u,f){for(var g=r._reactName,T=[];a!==null&&a!==u;){var N=a,O=N.alternate,ie=N.stateNode;if(O!==null&&O===u)break;N.tag===5&&ie!==null&&(N=ie,f?(O=ur(a,g),O!=null&&T.unshift($o(a,O,N))):f||(O=ur(a,g),O!=null&&T.push($o(a,O,N)))),a=a.return}T.length!==0&&n.push({event:r,listeners:T})}var cv=/\r\n?/g,uv=/\u0000|\uFFFD/g;function gp(n){return(typeof n=="string"?n:""+n).replace(cv,`
`).replace(uv,"")}function el(n,r,a){if(r=gp(r),gp(n)!==r&&a)throw Error(t(425))}function tl(){}var du=null,hu=null;function fu(n,r){return n==="textarea"||n==="noscript"||typeof r.children=="string"||typeof r.children=="number"||typeof r.dangerouslySetInnerHTML=="object"&&r.dangerouslySetInnerHTML!==null&&r.dangerouslySetInnerHTML.__html!=null}var pu=typeof setTimeout=="function"?setTimeout:void 0,dv=typeof clearTimeout=="function"?clearTimeout:void 0,vp=typeof Promise=="function"?Promise:void 0,hv=typeof queueMicrotask=="function"?queueMicrotask:typeof vp<"u"?function(n){return vp.resolve(null).then(n).catch(fv)}:pu;function fv(n){setTimeout(function(){throw n})}function mu(n,r){var a=r,u=0;do{var f=a.nextSibling;if(n.removeChild(a),f&&f.nodeType===8)if(a=f.data,a==="/$"){if(u===0){n.removeChild(f),zo(r);return}u--}else a!=="$"&&a!=="$?"&&a!=="$!"||u++;a=f}while(a);zo(r)}function yr(n){for(;n!=null;n=n.nextSibling){var r=n.nodeType;if(r===1||r===3)break;if(r===8){if(r=n.data,r==="$"||r==="$!"||r==="$?")break;if(r==="/$")return null}}return n}function yp(n){n=n.previousSibling;for(var r=0;n;){if(n.nodeType===8){var a=n.data;if(a==="$"||a==="$!"||a==="$?"){if(r===0)return n;r--}else a==="/$"&&r++}n=n.previousSibling}return null}var Ns=Math.random().toString(36).slice(2),Li="__reactFiber$"+Ns,Qo="__reactProps$"+Ns,Gi="__reactContainer$"+Ns,_u="__reactEvents$"+Ns,pv="__reactListeners$"+Ns,mv="__reactHandles$"+Ns;function jr(n){var r=n[Li];if(r)return r;for(var a=n.parentNode;a;){if(r=a[Gi]||a[Li]){if(a=r.alternate,r.child!==null||a!==null&&a.child!==null)for(n=yp(n);n!==null;){if(a=n[Li])return a;n=yp(n)}return r}n=a,a=n.parentNode}return null}function Jo(n){return n=n[Li]||n[Gi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function Us(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function nl(n){return n[Qo]||null}var gu=[],ks=-1;function xr(n){return{current:n}}function Vt(n){0>ks||(n.current=gu[ks],gu[ks]=null,ks--)}function Ot(n,r){ks++,gu[ks]=n.current,n.current=r}var Sr={},wn=xr(Sr),On=xr(!1),Kr=Sr;function Fs(n,r){var a=n.type.contextTypes;if(!a)return Sr;var u=n.stateNode;if(u&&u.__reactInternalMemoizedUnmaskedChildContext===r)return u.__reactInternalMemoizedMaskedChildContext;var f={},g;for(g in a)f[g]=r[g];return u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=r,n.__reactInternalMemoizedMaskedChildContext=f),f}function Bn(n){return n=n.childContextTypes,n!=null}function il(){Vt(On),Vt(wn)}function xp(n,r,a){if(wn.current!==Sr)throw Error(t(168));Ot(wn,r),Ot(On,a)}function Sp(n,r,a){var u=n.stateNode;if(r=r.childContextTypes,typeof u.getChildContext!="function")return a;u=u.getChildContext();for(var f in u)if(!(f in r))throw Error(t(108,Se(n)||"Unknown",f));return ae({},a,u)}function rl(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||Sr,Kr=wn.current,Ot(wn,n),Ot(On,On.current),!0}function Mp(n,r,a){var u=n.stateNode;if(!u)throw Error(t(169));a?(n=Sp(n,r,Kr),u.__reactInternalMemoizedMergedChildContext=n,Vt(On),Vt(wn),Ot(wn,n)):Vt(On),Ot(On,a)}var Wi=null,sl=!1,vu=!1;function wp(n){Wi===null?Wi=[n]:Wi.push(n)}function _v(n){sl=!0,wp(n)}function Mr(){if(!vu&&Wi!==null){vu=!0;var n=0,r=Pt;try{var a=Wi;for(Pt=1;n<a.length;n++){var u=a[n];do u=u(!0);while(u!==null)}Wi=null,sl=!1}catch(f){throw Wi!==null&&(Wi=Wi.slice(n+1)),ne(Ze,Mr),f}finally{Pt=r,vu=!1}}return null}var Os=[],Bs=0,ol=null,al=0,si=[],oi=0,Yr=null,qi=1,Xi="";function $r(n,r){Os[Bs++]=al,Os[Bs++]=ol,ol=n,al=r}function Ep(n,r,a){si[oi++]=qi,si[oi++]=Xi,si[oi++]=Yr,Yr=n;var u=qi;n=Xi;var f=32-ze(u)-1;u&=~(1<<f),a+=1;var g=32-ze(r)+f;if(30<g){var T=f-f%5;g=(u&(1<<T)-1).toString(32),u>>=T,f-=T,qi=1<<32-ze(r)+f|a<<f|u,Xi=g+n}else qi=1<<g|a<<f|u,Xi=n}function yu(n){n.return!==null&&($r(n,1),Ep(n,1,0))}function xu(n){for(;n===ol;)ol=Os[--Bs],Os[Bs]=null,al=Os[--Bs],Os[Bs]=null;for(;n===Yr;)Yr=si[--oi],si[oi]=null,Xi=si[--oi],si[oi]=null,qi=si[--oi],si[oi]=null}var Qn=null,Jn=null,Gt=!1,mi=null;function Tp(n,r){var a=ui(5,null,null,0);a.elementType="DELETED",a.stateNode=r,a.return=n,r=n.deletions,r===null?(n.deletions=[a],n.flags|=16):r.push(a)}function bp(n,r){switch(n.tag){case 5:var a=n.type;return r=r.nodeType!==1||a.toLowerCase()!==r.nodeName.toLowerCase()?null:r,r!==null?(n.stateNode=r,Qn=n,Jn=yr(r.firstChild),!0):!1;case 6:return r=n.pendingProps===""||r.nodeType!==3?null:r,r!==null?(n.stateNode=r,Qn=n,Jn=null,!0):!1;case 13:return r=r.nodeType!==8?null:r,r!==null?(a=Yr!==null?{id:qi,overflow:Xi}:null,n.memoizedState={dehydrated:r,treeContext:a,retryLane:1073741824},a=ui(18,null,null,0),a.stateNode=r,a.return=n,n.child=a,Qn=n,Jn=null,!0):!1;default:return!1}}function Su(n){return(n.mode&1)!==0&&(n.flags&128)===0}function Mu(n){if(Gt){var r=Jn;if(r){var a=r;if(!bp(n,r)){if(Su(n))throw Error(t(418));r=yr(a.nextSibling);var u=Qn;r&&bp(n,r)?Tp(u,a):(n.flags=n.flags&-4097|2,Gt=!1,Qn=n)}}else{if(Su(n))throw Error(t(418));n.flags=n.flags&-4097|2,Gt=!1,Qn=n}}}function Ap(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;Qn=n}function ll(n){if(n!==Qn)return!1;if(!Gt)return Ap(n),Gt=!0,!1;var r;if((r=n.tag!==3)&&!(r=n.tag!==5)&&(r=n.type,r=r!=="head"&&r!=="body"&&!fu(n.type,n.memoizedProps)),r&&(r=Jn)){if(Su(n))throw Cp(),Error(t(418));for(;r;)Tp(n,r),r=yr(r.nextSibling)}if(Ap(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,r=0;n;){if(n.nodeType===8){var a=n.data;if(a==="/$"){if(r===0){Jn=yr(n.nextSibling);break e}r--}else a!=="$"&&a!=="$!"&&a!=="$?"||r++}n=n.nextSibling}Jn=null}}else Jn=Qn?yr(n.stateNode.nextSibling):null;return!0}function Cp(){for(var n=Jn;n;)n=yr(n.nextSibling)}function zs(){Jn=Qn=null,Gt=!1}function wu(n){mi===null?mi=[n]:mi.push(n)}var gv=P.ReactCurrentBatchConfig;function Zo(n,r,a){if(n=a.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(a._owner){if(a=a._owner,a){if(a.tag!==1)throw Error(t(309));var u=a.stateNode}if(!u)throw Error(t(147,n));var f=u,g=""+n;return r!==null&&r.ref!==null&&typeof r.ref=="function"&&r.ref._stringRef===g?r.ref:(r=function(T){var N=f.refs;T===null?delete N[g]:N[g]=T},r._stringRef=g,r)}if(typeof n!="string")throw Error(t(284));if(!a._owner)throw Error(t(290,n))}return n}function cl(n,r){throw n=Object.prototype.toString.call(r),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(r).join(", ")+"}":n))}function Rp(n){var r=n._init;return r(n._payload)}function Pp(n){function r(K,H){if(n){var Y=K.deletions;Y===null?(K.deletions=[H],K.flags|=16):Y.push(H)}}function a(K,H){if(!n)return null;for(;H!==null;)r(K,H),H=H.sibling;return null}function u(K,H){for(K=new Map;H!==null;)H.key!==null?K.set(H.key,H):K.set(H.index,H),H=H.sibling;return K}function f(K,H){return K=Pr(K,H),K.index=0,K.sibling=null,K}function g(K,H,Y){return K.index=Y,n?(Y=K.alternate,Y!==null?(Y=Y.index,Y<H?(K.flags|=2,H):Y):(K.flags|=2,H)):(K.flags|=1048576,H)}function T(K){return n&&K.alternate===null&&(K.flags|=2),K}function N(K,H,Y,we){return H===null||H.tag!==6?(H=pd(Y,K.mode,we),H.return=K,H):(H=f(H,Y),H.return=K,H)}function O(K,H,Y,we){var Ke=Y.type;return Ke===U?ge(K,H,Y.props.children,we,Y.key):H!==null&&(H.elementType===Ke||typeof Ke=="object"&&Ke!==null&&Ke.$$typeof===ee&&Rp(Ke)===H.type)?(we=f(H,Y.props),we.ref=Zo(K,H,Y),we.return=K,we):(we=Il(Y.type,Y.key,Y.props,null,K.mode,we),we.ref=Zo(K,H,Y),we.return=K,we)}function ie(K,H,Y,we){return H===null||H.tag!==4||H.stateNode.containerInfo!==Y.containerInfo||H.stateNode.implementation!==Y.implementation?(H=md(Y,K.mode,we),H.return=K,H):(H=f(H,Y.children||[]),H.return=K,H)}function ge(K,H,Y,we,Ke){return H===null||H.tag!==7?(H=rs(Y,K.mode,we,Ke),H.return=K,H):(H=f(H,Y),H.return=K,H)}function ye(K,H,Y){if(typeof H=="string"&&H!==""||typeof H=="number")return H=pd(""+H,K.mode,Y),H.return=K,H;if(typeof H=="object"&&H!==null){switch(H.$$typeof){case G:return Y=Il(H.type,H.key,H.props,null,K.mode,Y),Y.ref=Zo(K,null,H),Y.return=K,Y;case k:return H=md(H,K.mode,Y),H.return=K,H;case ee:var we=H._init;return ye(K,we(H._payload),Y)}if(D(H)||ue(H))return H=rs(H,K.mode,Y,null),H.return=K,H;cl(K,H)}return null}function _e(K,H,Y,we){var Ke=H!==null?H.key:null;if(typeof Y=="string"&&Y!==""||typeof Y=="number")return Ke!==null?null:N(K,H,""+Y,we);if(typeof Y=="object"&&Y!==null){switch(Y.$$typeof){case G:return Y.key===Ke?O(K,H,Y,we):null;case k:return Y.key===Ke?ie(K,H,Y,we):null;case ee:return Ke=Y._init,_e(K,H,Ke(Y._payload),we)}if(D(Y)||ue(Y))return Ke!==null?null:ge(K,H,Y,we,null);cl(K,Y)}return null}function ke(K,H,Y,we,Ke){if(typeof we=="string"&&we!==""||typeof we=="number")return K=K.get(Y)||null,N(H,K,""+we,Ke);if(typeof we=="object"&&we!==null){switch(we.$$typeof){case G:return K=K.get(we.key===null?Y:we.key)||null,O(H,K,we,Ke);case k:return K=K.get(we.key===null?Y:we.key)||null,ie(H,K,we,Ke);case ee:var Qe=we._init;return ke(K,H,Y,Qe(we._payload),Ke)}if(D(we)||ue(we))return K=K.get(Y)||null,ge(H,K,we,Ke,null);cl(H,we)}return null}function We(K,H,Y,we){for(var Ke=null,Qe=null,Je=H,ot=H=0,cn=null;Je!==null&&ot<Y.length;ot++){Je.index>ot?(cn=Je,Je=null):cn=Je.sibling;var wt=_e(K,Je,Y[ot],we);if(wt===null){Je===null&&(Je=cn);break}n&&Je&&wt.alternate===null&&r(K,Je),H=g(wt,H,ot),Qe===null?Ke=wt:Qe.sibling=wt,Qe=wt,Je=cn}if(ot===Y.length)return a(K,Je),Gt&&$r(K,ot),Ke;if(Je===null){for(;ot<Y.length;ot++)Je=ye(K,Y[ot],we),Je!==null&&(H=g(Je,H,ot),Qe===null?Ke=Je:Qe.sibling=Je,Qe=Je);return Gt&&$r(K,ot),Ke}for(Je=u(K,Je);ot<Y.length;ot++)cn=ke(Je,K,ot,Y[ot],we),cn!==null&&(n&&cn.alternate!==null&&Je.delete(cn.key===null?ot:cn.key),H=g(cn,H,ot),Qe===null?Ke=cn:Qe.sibling=cn,Qe=cn);return n&&Je.forEach(function(Lr){return r(K,Lr)}),Gt&&$r(K,ot),Ke}function qe(K,H,Y,we){var Ke=ue(Y);if(typeof Ke!="function")throw Error(t(150));if(Y=Ke.call(Y),Y==null)throw Error(t(151));for(var Qe=Ke=null,Je=H,ot=H=0,cn=null,wt=Y.next();Je!==null&&!wt.done;ot++,wt=Y.next()){Je.index>ot?(cn=Je,Je=null):cn=Je.sibling;var Lr=_e(K,Je,wt.value,we);if(Lr===null){Je===null&&(Je=cn);break}n&&Je&&Lr.alternate===null&&r(K,Je),H=g(Lr,H,ot),Qe===null?Ke=Lr:Qe.sibling=Lr,Qe=Lr,Je=cn}if(wt.done)return a(K,Je),Gt&&$r(K,ot),Ke;if(Je===null){for(;!wt.done;ot++,wt=Y.next())wt=ye(K,wt.value,we),wt!==null&&(H=g(wt,H,ot),Qe===null?Ke=wt:Qe.sibling=wt,Qe=wt);return Gt&&$r(K,ot),Ke}for(Je=u(K,Je);!wt.done;ot++,wt=Y.next())wt=ke(Je,K,ot,wt.value,we),wt!==null&&(n&&wt.alternate!==null&&Je.delete(wt.key===null?ot:wt.key),H=g(wt,H,ot),Qe===null?Ke=wt:Qe.sibling=wt,Qe=wt);return n&&Je.forEach(function($v){return r(K,$v)}),Gt&&$r(K,ot),Ke}function Kt(K,H,Y,we){if(typeof Y=="object"&&Y!==null&&Y.type===U&&Y.key===null&&(Y=Y.props.children),typeof Y=="object"&&Y!==null){switch(Y.$$typeof){case G:e:{for(var Ke=Y.key,Qe=H;Qe!==null;){if(Qe.key===Ke){if(Ke=Y.type,Ke===U){if(Qe.tag===7){a(K,Qe.sibling),H=f(Qe,Y.props.children),H.return=K,K=H;break e}}else if(Qe.elementType===Ke||typeof Ke=="object"&&Ke!==null&&Ke.$$typeof===ee&&Rp(Ke)===Qe.type){a(K,Qe.sibling),H=f(Qe,Y.props),H.ref=Zo(K,Qe,Y),H.return=K,K=H;break e}a(K,Qe);break}else r(K,Qe);Qe=Qe.sibling}Y.type===U?(H=rs(Y.props.children,K.mode,we,Y.key),H.return=K,K=H):(we=Il(Y.type,Y.key,Y.props,null,K.mode,we),we.ref=Zo(K,H,Y),we.return=K,K=we)}return T(K);case k:e:{for(Qe=Y.key;H!==null;){if(H.key===Qe)if(H.tag===4&&H.stateNode.containerInfo===Y.containerInfo&&H.stateNode.implementation===Y.implementation){a(K,H.sibling),H=f(H,Y.children||[]),H.return=K,K=H;break e}else{a(K,H);break}else r(K,H);H=H.sibling}H=md(Y,K.mode,we),H.return=K,K=H}return T(K);case ee:return Qe=Y._init,Kt(K,H,Qe(Y._payload),we)}if(D(Y))return We(K,H,Y,we);if(ue(Y))return qe(K,H,Y,we);cl(K,Y)}return typeof Y=="string"&&Y!==""||typeof Y=="number"?(Y=""+Y,H!==null&&H.tag===6?(a(K,H.sibling),H=f(H,Y),H.return=K,K=H):(a(K,H),H=pd(Y,K.mode,we),H.return=K,K=H),T(K)):a(K,H)}return Kt}var Vs=Pp(!0),Lp=Pp(!1),ul=xr(null),dl=null,Hs=null,Eu=null;function Tu(){Eu=Hs=dl=null}function bu(n){var r=ul.current;Vt(ul),n._currentValue=r}function Au(n,r,a){for(;n!==null;){var u=n.alternate;if((n.childLanes&r)!==r?(n.childLanes|=r,u!==null&&(u.childLanes|=r)):u!==null&&(u.childLanes&r)!==r&&(u.childLanes|=r),n===a)break;n=n.return}}function Gs(n,r){dl=n,Eu=Hs=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&r)!==0&&(zn=!0),n.firstContext=null)}function ai(n){var r=n._currentValue;if(Eu!==n)if(n={context:n,memoizedValue:r,next:null},Hs===null){if(dl===null)throw Error(t(308));Hs=n,dl.dependencies={lanes:0,firstContext:n}}else Hs=Hs.next=n;return r}var Qr=null;function Cu(n){Qr===null?Qr=[n]:Qr.push(n)}function Dp(n,r,a,u){var f=r.interleaved;return f===null?(a.next=a,Cu(r)):(a.next=f.next,f.next=a),r.interleaved=a,ji(n,u)}function ji(n,r){n.lanes|=r;var a=n.alternate;for(a!==null&&(a.lanes|=r),a=n,n=n.return;n!==null;)n.childLanes|=r,a=n.alternate,a!==null&&(a.childLanes|=r),a=n,n=n.return;return a.tag===3?a.stateNode:null}var wr=!1;function Ru(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Ip(n,r){n=n.updateQueue,r.updateQueue===n&&(r.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Ki(n,r){return{eventTime:n,lane:r,tag:0,payload:null,callback:null,next:null}}function Er(n,r,a){var u=n.updateQueue;if(u===null)return null;if(u=u.shared,(xt&2)!==0){var f=u.pending;return f===null?r.next=r:(r.next=f.next,f.next=r),u.pending=r,ji(n,a)}return f=u.interleaved,f===null?(r.next=r,Cu(u)):(r.next=f.next,f.next=r),u.interleaved=r,ji(n,a)}function hl(n,r,a){if(r=r.updateQueue,r!==null&&(r=r.shared,(a&4194240)!==0)){var u=r.lanes;u&=n.pendingLanes,a|=u,r.lanes=a,Gc(n,a)}}function Np(n,r){var a=n.updateQueue,u=n.alternate;if(u!==null&&(u=u.updateQueue,a===u)){var f=null,g=null;if(a=a.firstBaseUpdate,a!==null){do{var T={eventTime:a.eventTime,lane:a.lane,tag:a.tag,payload:a.payload,callback:a.callback,next:null};g===null?f=g=T:g=g.next=T,a=a.next}while(a!==null);g===null?f=g=r:g=g.next=r}else f=g=r;a={baseState:u.baseState,firstBaseUpdate:f,lastBaseUpdate:g,shared:u.shared,effects:u.effects},n.updateQueue=a;return}n=a.lastBaseUpdate,n===null?a.firstBaseUpdate=r:n.next=r,a.lastBaseUpdate=r}function fl(n,r,a,u){var f=n.updateQueue;wr=!1;var g=f.firstBaseUpdate,T=f.lastBaseUpdate,N=f.shared.pending;if(N!==null){f.shared.pending=null;var O=N,ie=O.next;O.next=null,T===null?g=ie:T.next=ie,T=O;var ge=n.alternate;ge!==null&&(ge=ge.updateQueue,N=ge.lastBaseUpdate,N!==T&&(N===null?ge.firstBaseUpdate=ie:N.next=ie,ge.lastBaseUpdate=O))}if(g!==null){var ye=f.baseState;T=0,ge=ie=O=null,N=g;do{var _e=N.lane,ke=N.eventTime;if((u&_e)===_e){ge!==null&&(ge=ge.next={eventTime:ke,lane:0,tag:N.tag,payload:N.payload,callback:N.callback,next:null});e:{var We=n,qe=N;switch(_e=r,ke=a,qe.tag){case 1:if(We=qe.payload,typeof We=="function"){ye=We.call(ke,ye,_e);break e}ye=We;break e;case 3:We.flags=We.flags&-65537|128;case 0:if(We=qe.payload,_e=typeof We=="function"?We.call(ke,ye,_e):We,_e==null)break e;ye=ae({},ye,_e);break e;case 2:wr=!0}}N.callback!==null&&N.lane!==0&&(n.flags|=64,_e=f.effects,_e===null?f.effects=[N]:_e.push(N))}else ke={eventTime:ke,lane:_e,tag:N.tag,payload:N.payload,callback:N.callback,next:null},ge===null?(ie=ge=ke,O=ye):ge=ge.next=ke,T|=_e;if(N=N.next,N===null){if(N=f.shared.pending,N===null)break;_e=N,N=_e.next,_e.next=null,f.lastBaseUpdate=_e,f.shared.pending=null}}while(!0);if(ge===null&&(O=ye),f.baseState=O,f.firstBaseUpdate=ie,f.lastBaseUpdate=ge,r=f.shared.interleaved,r!==null){f=r;do T|=f.lane,f=f.next;while(f!==r)}else g===null&&(f.shared.lanes=0);es|=T,n.lanes=T,n.memoizedState=ye}}function Up(n,r,a){if(n=r.effects,r.effects=null,n!==null)for(r=0;r<n.length;r++){var u=n[r],f=u.callback;if(f!==null){if(u.callback=null,u=a,typeof f!="function")throw Error(t(191,f));f.call(u)}}}var ea={},Di=xr(ea),ta=xr(ea),na=xr(ea);function Jr(n){if(n===ea)throw Error(t(174));return n}function Pu(n,r){switch(Ot(na,r),Ot(ta,n),Ot(Di,ea),n=r.nodeType,n){case 9:case 11:r=(r=r.documentElement)?r.namespaceURI:Ae(null,"");break;default:n=n===8?r.parentNode:r,r=n.namespaceURI||null,n=n.tagName,r=Ae(r,n)}Vt(Di),Ot(Di,r)}function Ws(){Vt(Di),Vt(ta),Vt(na)}function kp(n){Jr(na.current);var r=Jr(Di.current),a=Ae(r,n.type);r!==a&&(Ot(ta,n),Ot(Di,a))}function Lu(n){ta.current===n&&(Vt(Di),Vt(ta))}var qt=xr(0);function pl(n){for(var r=n;r!==null;){if(r.tag===13){var a=r.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||a.data==="$?"||a.data==="$!"))return r}else if(r.tag===19&&r.memoizedProps.revealOrder!==void 0){if((r.flags&128)!==0)return r}else if(r.child!==null){r.child.return=r,r=r.child;continue}if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return null;r=r.return}r.sibling.return=r.return,r=r.sibling}return null}var Du=[];function Iu(){for(var n=0;n<Du.length;n++)Du[n]._workInProgressVersionPrimary=null;Du.length=0}var ml=P.ReactCurrentDispatcher,Nu=P.ReactCurrentBatchConfig,Zr=0,Xt=null,en=null,an=null,_l=!1,ia=!1,ra=0,vv=0;function En(){throw Error(t(321))}function Uu(n,r){if(r===null)return!1;for(var a=0;a<r.length&&a<n.length;a++)if(!pi(n[a],r[a]))return!1;return!0}function ku(n,r,a,u,f,g){if(Zr=g,Xt=r,r.memoizedState=null,r.updateQueue=null,r.lanes=0,ml.current=n===null||n.memoizedState===null?Mv:wv,n=a(u,f),ia){g=0;do{if(ia=!1,ra=0,25<=g)throw Error(t(301));g+=1,an=en=null,r.updateQueue=null,ml.current=Ev,n=a(u,f)}while(ia)}if(ml.current=yl,r=en!==null&&en.next!==null,Zr=0,an=en=Xt=null,_l=!1,r)throw Error(t(300));return n}function Fu(){var n=ra!==0;return ra=0,n}function Ii(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return an===null?Xt.memoizedState=an=n:an=an.next=n,an}function li(){if(en===null){var n=Xt.alternate;n=n!==null?n.memoizedState:null}else n=en.next;var r=an===null?Xt.memoizedState:an.next;if(r!==null)an=r,en=n;else{if(n===null)throw Error(t(310));en=n,n={memoizedState:en.memoizedState,baseState:en.baseState,baseQueue:en.baseQueue,queue:en.queue,next:null},an===null?Xt.memoizedState=an=n:an=an.next=n}return an}function sa(n,r){return typeof r=="function"?r(n):r}function Ou(n){var r=li(),a=r.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var u=en,f=u.baseQueue,g=a.pending;if(g!==null){if(f!==null){var T=f.next;f.next=g.next,g.next=T}u.baseQueue=f=g,a.pending=null}if(f!==null){g=f.next,u=u.baseState;var N=T=null,O=null,ie=g;do{var ge=ie.lane;if((Zr&ge)===ge)O!==null&&(O=O.next={lane:0,action:ie.action,hasEagerState:ie.hasEagerState,eagerState:ie.eagerState,next:null}),u=ie.hasEagerState?ie.eagerState:n(u,ie.action);else{var ye={lane:ge,action:ie.action,hasEagerState:ie.hasEagerState,eagerState:ie.eagerState,next:null};O===null?(N=O=ye,T=u):O=O.next=ye,Xt.lanes|=ge,es|=ge}ie=ie.next}while(ie!==null&&ie!==g);O===null?T=u:O.next=N,pi(u,r.memoizedState)||(zn=!0),r.memoizedState=u,r.baseState=T,r.baseQueue=O,a.lastRenderedState=u}if(n=a.interleaved,n!==null){f=n;do g=f.lane,Xt.lanes|=g,es|=g,f=f.next;while(f!==n)}else f===null&&(a.lanes=0);return[r.memoizedState,a.dispatch]}function Bu(n){var r=li(),a=r.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var u=a.dispatch,f=a.pending,g=r.memoizedState;if(f!==null){a.pending=null;var T=f=f.next;do g=n(g,T.action),T=T.next;while(T!==f);pi(g,r.memoizedState)||(zn=!0),r.memoizedState=g,r.baseQueue===null&&(r.baseState=g),a.lastRenderedState=g}return[g,u]}function Fp(){}function Op(n,r){var a=Xt,u=li(),f=r(),g=!pi(u.memoizedState,f);if(g&&(u.memoizedState=f,zn=!0),u=u.queue,zu(Vp.bind(null,a,u,n),[n]),u.getSnapshot!==r||g||an!==null&&an.memoizedState.tag&1){if(a.flags|=2048,oa(9,zp.bind(null,a,u,f,r),void 0,null),ln===null)throw Error(t(349));(Zr&30)!==0||Bp(a,r,f)}return f}function Bp(n,r,a){n.flags|=16384,n={getSnapshot:r,value:a},r=Xt.updateQueue,r===null?(r={lastEffect:null,stores:null},Xt.updateQueue=r,r.stores=[n]):(a=r.stores,a===null?r.stores=[n]:a.push(n))}function zp(n,r,a,u){r.value=a,r.getSnapshot=u,Hp(r)&&Gp(n)}function Vp(n,r,a){return a(function(){Hp(r)&&Gp(n)})}function Hp(n){var r=n.getSnapshot;n=n.value;try{var a=r();return!pi(n,a)}catch{return!0}}function Gp(n){var r=ji(n,1);r!==null&&yi(r,n,1,-1)}function Wp(n){var r=Ii();return typeof n=="function"&&(n=n()),r.memoizedState=r.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:sa,lastRenderedState:n},r.queue=n,n=n.dispatch=Sv.bind(null,Xt,n),[r.memoizedState,n]}function oa(n,r,a,u){return n={tag:n,create:r,destroy:a,deps:u,next:null},r=Xt.updateQueue,r===null?(r={lastEffect:null,stores:null},Xt.updateQueue=r,r.lastEffect=n.next=n):(a=r.lastEffect,a===null?r.lastEffect=n.next=n:(u=a.next,a.next=n,n.next=u,r.lastEffect=n)),n}function qp(){return li().memoizedState}function gl(n,r,a,u){var f=Ii();Xt.flags|=n,f.memoizedState=oa(1|r,a,void 0,u===void 0?null:u)}function vl(n,r,a,u){var f=li();u=u===void 0?null:u;var g=void 0;if(en!==null){var T=en.memoizedState;if(g=T.destroy,u!==null&&Uu(u,T.deps)){f.memoizedState=oa(r,a,g,u);return}}Xt.flags|=n,f.memoizedState=oa(1|r,a,g,u)}function Xp(n,r){return gl(8390656,8,n,r)}function zu(n,r){return vl(2048,8,n,r)}function jp(n,r){return vl(4,2,n,r)}function Kp(n,r){return vl(4,4,n,r)}function Yp(n,r){if(typeof r=="function")return n=n(),r(n),function(){r(null)};if(r!=null)return n=n(),r.current=n,function(){r.current=null}}function $p(n,r,a){return a=a!=null?a.concat([n]):null,vl(4,4,Yp.bind(null,r,n),a)}function Vu(){}function Qp(n,r){var a=li();r=r===void 0?null:r;var u=a.memoizedState;return u!==null&&r!==null&&Uu(r,u[1])?u[0]:(a.memoizedState=[n,r],n)}function Jp(n,r){var a=li();r=r===void 0?null:r;var u=a.memoizedState;return u!==null&&r!==null&&Uu(r,u[1])?u[0]:(n=n(),a.memoizedState=[n,r],n)}function Zp(n,r,a){return(Zr&21)===0?(n.baseState&&(n.baseState=!1,zn=!0),n.memoizedState=a):(pi(a,r)||(a=As(),Xt.lanes|=a,es|=a,n.baseState=!0),r)}function yv(n,r){var a=Pt;Pt=a!==0&&4>a?a:4,n(!0);var u=Nu.transition;Nu.transition={};try{n(!1),r()}finally{Pt=a,Nu.transition=u}}function em(){return li().memoizedState}function xv(n,r,a){var u=Cr(n);if(a={lane:u,action:a,hasEagerState:!1,eagerState:null,next:null},tm(n))nm(r,a);else if(a=Dp(n,r,a,u),a!==null){var f=Nn();yi(a,n,u,f),im(a,r,u)}}function Sv(n,r,a){var u=Cr(n),f={lane:u,action:a,hasEagerState:!1,eagerState:null,next:null};if(tm(n))nm(r,f);else{var g=n.alternate;if(n.lanes===0&&(g===null||g.lanes===0)&&(g=r.lastRenderedReducer,g!==null))try{var T=r.lastRenderedState,N=g(T,a);if(f.hasEagerState=!0,f.eagerState=N,pi(N,T)){var O=r.interleaved;O===null?(f.next=f,Cu(r)):(f.next=O.next,O.next=f),r.interleaved=f;return}}catch{}finally{}a=Dp(n,r,f,u),a!==null&&(f=Nn(),yi(a,n,u,f),im(a,r,u))}}function tm(n){var r=n.alternate;return n===Xt||r!==null&&r===Xt}function nm(n,r){ia=_l=!0;var a=n.pending;a===null?r.next=r:(r.next=a.next,a.next=r),n.pending=r}function im(n,r,a){if((a&4194240)!==0){var u=r.lanes;u&=n.pendingLanes,a|=u,r.lanes=a,Gc(n,a)}}var yl={readContext:ai,useCallback:En,useContext:En,useEffect:En,useImperativeHandle:En,useInsertionEffect:En,useLayoutEffect:En,useMemo:En,useReducer:En,useRef:En,useState:En,useDebugValue:En,useDeferredValue:En,useTransition:En,useMutableSource:En,useSyncExternalStore:En,useId:En,unstable_isNewReconciler:!1},Mv={readContext:ai,useCallback:function(n,r){return Ii().memoizedState=[n,r===void 0?null:r],n},useContext:ai,useEffect:Xp,useImperativeHandle:function(n,r,a){return a=a!=null?a.concat([n]):null,gl(4194308,4,Yp.bind(null,r,n),a)},useLayoutEffect:function(n,r){return gl(4194308,4,n,r)},useInsertionEffect:function(n,r){return gl(4,2,n,r)},useMemo:function(n,r){var a=Ii();return r=r===void 0?null:r,n=n(),a.memoizedState=[n,r],n},useReducer:function(n,r,a){var u=Ii();return r=a!==void 0?a(r):r,u.memoizedState=u.baseState=r,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:r},u.queue=n,n=n.dispatch=xv.bind(null,Xt,n),[u.memoizedState,n]},useRef:function(n){var r=Ii();return n={current:n},r.memoizedState=n},useState:Wp,useDebugValue:Vu,useDeferredValue:function(n){return Ii().memoizedState=n},useTransition:function(){var n=Wp(!1),r=n[0];return n=yv.bind(null,n[1]),Ii().memoizedState=n,[r,n]},useMutableSource:function(){},useSyncExternalStore:function(n,r,a){var u=Xt,f=Ii();if(Gt){if(a===void 0)throw Error(t(407));a=a()}else{if(a=r(),ln===null)throw Error(t(349));(Zr&30)!==0||Bp(u,r,a)}f.memoizedState=a;var g={value:a,getSnapshot:r};return f.queue=g,Xp(Vp.bind(null,u,g,n),[n]),u.flags|=2048,oa(9,zp.bind(null,u,g,a,r),void 0,null),a},useId:function(){var n=Ii(),r=ln.identifierPrefix;if(Gt){var a=Xi,u=qi;a=(u&~(1<<32-ze(u)-1)).toString(32)+a,r=":"+r+"R"+a,a=ra++,0<a&&(r+="H"+a.toString(32)),r+=":"}else a=vv++,r=":"+r+"r"+a.toString(32)+":";return n.memoizedState=r},unstable_isNewReconciler:!1},wv={readContext:ai,useCallback:Qp,useContext:ai,useEffect:zu,useImperativeHandle:$p,useInsertionEffect:jp,useLayoutEffect:Kp,useMemo:Jp,useReducer:Ou,useRef:qp,useState:function(){return Ou(sa)},useDebugValue:Vu,useDeferredValue:function(n){var r=li();return Zp(r,en.memoizedState,n)},useTransition:function(){var n=Ou(sa)[0],r=li().memoizedState;return[n,r]},useMutableSource:Fp,useSyncExternalStore:Op,useId:em,unstable_isNewReconciler:!1},Ev={readContext:ai,useCallback:Qp,useContext:ai,useEffect:zu,useImperativeHandle:$p,useInsertionEffect:jp,useLayoutEffect:Kp,useMemo:Jp,useReducer:Bu,useRef:qp,useState:function(){return Bu(sa)},useDebugValue:Vu,useDeferredValue:function(n){var r=li();return en===null?r.memoizedState=n:Zp(r,en.memoizedState,n)},useTransition:function(){var n=Bu(sa)[0],r=li().memoizedState;return[n,r]},useMutableSource:Fp,useSyncExternalStore:Op,useId:em,unstable_isNewReconciler:!1};function _i(n,r){if(n&&n.defaultProps){r=ae({},r),n=n.defaultProps;for(var a in n)r[a]===void 0&&(r[a]=n[a]);return r}return r}function Hu(n,r,a,u){r=n.memoizedState,a=a(u,r),a=a==null?r:ae({},r,a),n.memoizedState=a,n.lanes===0&&(n.updateQueue.baseState=a)}var xl={isMounted:function(n){return(n=n._reactInternals)?Vi(n)===n:!1},enqueueSetState:function(n,r,a){n=n._reactInternals;var u=Nn(),f=Cr(n),g=Ki(u,f);g.payload=r,a!=null&&(g.callback=a),r=Er(n,g,f),r!==null&&(yi(r,n,f,u),hl(r,n,f))},enqueueReplaceState:function(n,r,a){n=n._reactInternals;var u=Nn(),f=Cr(n),g=Ki(u,f);g.tag=1,g.payload=r,a!=null&&(g.callback=a),r=Er(n,g,f),r!==null&&(yi(r,n,f,u),hl(r,n,f))},enqueueForceUpdate:function(n,r){n=n._reactInternals;var a=Nn(),u=Cr(n),f=Ki(a,u);f.tag=2,r!=null&&(f.callback=r),r=Er(n,f,u),r!==null&&(yi(r,n,u,a),hl(r,n,u))}};function rm(n,r,a,u,f,g,T){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(u,g,T):r.prototype&&r.prototype.isPureReactComponent?!Xo(a,u)||!Xo(f,g):!0}function sm(n,r,a){var u=!1,f=Sr,g=r.contextType;return typeof g=="object"&&g!==null?g=ai(g):(f=Bn(r)?Kr:wn.current,u=r.contextTypes,g=(u=u!=null)?Fs(n,f):Sr),r=new r(a,g),n.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,r.updater=xl,n.stateNode=r,r._reactInternals=n,u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=f,n.__reactInternalMemoizedMaskedChildContext=g),r}function om(n,r,a,u){n=r.state,typeof r.componentWillReceiveProps=="function"&&r.componentWillReceiveProps(a,u),typeof r.UNSAFE_componentWillReceiveProps=="function"&&r.UNSAFE_componentWillReceiveProps(a,u),r.state!==n&&xl.enqueueReplaceState(r,r.state,null)}function Gu(n,r,a,u){var f=n.stateNode;f.props=a,f.state=n.memoizedState,f.refs={},Ru(n);var g=r.contextType;typeof g=="object"&&g!==null?f.context=ai(g):(g=Bn(r)?Kr:wn.current,f.context=Fs(n,g)),f.state=n.memoizedState,g=r.getDerivedStateFromProps,typeof g=="function"&&(Hu(n,r,g,a),f.state=n.memoizedState),typeof r.getDerivedStateFromProps=="function"||typeof f.getSnapshotBeforeUpdate=="function"||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(r=f.state,typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount(),r!==f.state&&xl.enqueueReplaceState(f,f.state,null),fl(n,a,f,u),f.state=n.memoizedState),typeof f.componentDidMount=="function"&&(n.flags|=4194308)}function qs(n,r){try{var a="",u=r;do a+=ce(u),u=u.return;while(u);var f=a}catch(g){f=`
Error generating stack: `+g.message+`
`+g.stack}return{value:n,source:r,stack:f,digest:null}}function Wu(n,r,a){return{value:n,source:null,stack:a??null,digest:r??null}}function qu(n,r){try{console.error(r.value)}catch(a){setTimeout(function(){throw a})}}var Tv=typeof WeakMap=="function"?WeakMap:Map;function am(n,r,a){a=Ki(-1,a),a.tag=3,a.payload={element:null};var u=r.value;return a.callback=function(){Al||(Al=!0,od=u),qu(n,r)},a}function lm(n,r,a){a=Ki(-1,a),a.tag=3;var u=n.type.getDerivedStateFromError;if(typeof u=="function"){var f=r.value;a.payload=function(){return u(f)},a.callback=function(){qu(n,r)}}var g=n.stateNode;return g!==null&&typeof g.componentDidCatch=="function"&&(a.callback=function(){qu(n,r),typeof u!="function"&&(br===null?br=new Set([this]):br.add(this));var T=r.stack;this.componentDidCatch(r.value,{componentStack:T!==null?T:""})}),a}function cm(n,r,a){var u=n.pingCache;if(u===null){u=n.pingCache=new Tv;var f=new Set;u.set(r,f)}else f=u.get(r),f===void 0&&(f=new Set,u.set(r,f));f.has(a)||(f.add(a),n=Bv.bind(null,n,r,a),r.then(n,n))}function um(n){do{var r;if((r=n.tag===13)&&(r=n.memoizedState,r=r!==null?r.dehydrated!==null:!0),r)return n;n=n.return}while(n!==null);return null}function dm(n,r,a,u,f){return(n.mode&1)===0?(n===r?n.flags|=65536:(n.flags|=128,a.flags|=131072,a.flags&=-52805,a.tag===1&&(a.alternate===null?a.tag=17:(r=Ki(-1,1),r.tag=2,Er(a,r,1))),a.lanes|=1),n):(n.flags|=65536,n.lanes=f,n)}var bv=P.ReactCurrentOwner,zn=!1;function In(n,r,a,u){r.child=n===null?Lp(r,null,a,u):Vs(r,n.child,a,u)}function hm(n,r,a,u,f){a=a.render;var g=r.ref;return Gs(r,f),u=ku(n,r,a,u,g,f),a=Fu(),n!==null&&!zn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~f,Yi(n,r,f)):(Gt&&a&&yu(r),r.flags|=1,In(n,r,u,f),r.child)}function fm(n,r,a,u,f){if(n===null){var g=a.type;return typeof g=="function"&&!fd(g)&&g.defaultProps===void 0&&a.compare===null&&a.defaultProps===void 0?(r.tag=15,r.type=g,pm(n,r,g,u,f)):(n=Il(a.type,null,u,r,r.mode,f),n.ref=r.ref,n.return=r,r.child=n)}if(g=n.child,(n.lanes&f)===0){var T=g.memoizedProps;if(a=a.compare,a=a!==null?a:Xo,a(T,u)&&n.ref===r.ref)return Yi(n,r,f)}return r.flags|=1,n=Pr(g,u),n.ref=r.ref,n.return=r,r.child=n}function pm(n,r,a,u,f){if(n!==null){var g=n.memoizedProps;if(Xo(g,u)&&n.ref===r.ref)if(zn=!1,r.pendingProps=u=g,(n.lanes&f)!==0)(n.flags&131072)!==0&&(zn=!0);else return r.lanes=n.lanes,Yi(n,r,f)}return Xu(n,r,a,u,f)}function mm(n,r,a){var u=r.pendingProps,f=u.children,g=n!==null?n.memoizedState:null;if(u.mode==="hidden")if((r.mode&1)===0)r.memoizedState={baseLanes:0,cachePool:null,transitions:null},Ot(js,Zn),Zn|=a;else{if((a&1073741824)===0)return n=g!==null?g.baseLanes|a:a,r.lanes=r.childLanes=1073741824,r.memoizedState={baseLanes:n,cachePool:null,transitions:null},r.updateQueue=null,Ot(js,Zn),Zn|=n,null;r.memoizedState={baseLanes:0,cachePool:null,transitions:null},u=g!==null?g.baseLanes:a,Ot(js,Zn),Zn|=u}else g!==null?(u=g.baseLanes|a,r.memoizedState=null):u=a,Ot(js,Zn),Zn|=u;return In(n,r,f,a),r.child}function _m(n,r){var a=r.ref;(n===null&&a!==null||n!==null&&n.ref!==a)&&(r.flags|=512,r.flags|=2097152)}function Xu(n,r,a,u,f){var g=Bn(a)?Kr:wn.current;return g=Fs(r,g),Gs(r,f),a=ku(n,r,a,u,g,f),u=Fu(),n!==null&&!zn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~f,Yi(n,r,f)):(Gt&&u&&yu(r),r.flags|=1,In(n,r,a,f),r.child)}function gm(n,r,a,u,f){if(Bn(a)){var g=!0;rl(r)}else g=!1;if(Gs(r,f),r.stateNode===null)Ml(n,r),sm(r,a,u),Gu(r,a,u,f),u=!0;else if(n===null){var T=r.stateNode,N=r.memoizedProps;T.props=N;var O=T.context,ie=a.contextType;typeof ie=="object"&&ie!==null?ie=ai(ie):(ie=Bn(a)?Kr:wn.current,ie=Fs(r,ie));var ge=a.getDerivedStateFromProps,ye=typeof ge=="function"||typeof T.getSnapshotBeforeUpdate=="function";ye||typeof T.UNSAFE_componentWillReceiveProps!="function"&&typeof T.componentWillReceiveProps!="function"||(N!==u||O!==ie)&&om(r,T,u,ie),wr=!1;var _e=r.memoizedState;T.state=_e,fl(r,u,T,f),O=r.memoizedState,N!==u||_e!==O||On.current||wr?(typeof ge=="function"&&(Hu(r,a,ge,u),O=r.memoizedState),(N=wr||rm(r,a,N,u,_e,O,ie))?(ye||typeof T.UNSAFE_componentWillMount!="function"&&typeof T.componentWillMount!="function"||(typeof T.componentWillMount=="function"&&T.componentWillMount(),typeof T.UNSAFE_componentWillMount=="function"&&T.UNSAFE_componentWillMount()),typeof T.componentDidMount=="function"&&(r.flags|=4194308)):(typeof T.componentDidMount=="function"&&(r.flags|=4194308),r.memoizedProps=u,r.memoizedState=O),T.props=u,T.state=O,T.context=ie,u=N):(typeof T.componentDidMount=="function"&&(r.flags|=4194308),u=!1)}else{T=r.stateNode,Ip(n,r),N=r.memoizedProps,ie=r.type===r.elementType?N:_i(r.type,N),T.props=ie,ye=r.pendingProps,_e=T.context,O=a.contextType,typeof O=="object"&&O!==null?O=ai(O):(O=Bn(a)?Kr:wn.current,O=Fs(r,O));var ke=a.getDerivedStateFromProps;(ge=typeof ke=="function"||typeof T.getSnapshotBeforeUpdate=="function")||typeof T.UNSAFE_componentWillReceiveProps!="function"&&typeof T.componentWillReceiveProps!="function"||(N!==ye||_e!==O)&&om(r,T,u,O),wr=!1,_e=r.memoizedState,T.state=_e,fl(r,u,T,f);var We=r.memoizedState;N!==ye||_e!==We||On.current||wr?(typeof ke=="function"&&(Hu(r,a,ke,u),We=r.memoizedState),(ie=wr||rm(r,a,ie,u,_e,We,O)||!1)?(ge||typeof T.UNSAFE_componentWillUpdate!="function"&&typeof T.componentWillUpdate!="function"||(typeof T.componentWillUpdate=="function"&&T.componentWillUpdate(u,We,O),typeof T.UNSAFE_componentWillUpdate=="function"&&T.UNSAFE_componentWillUpdate(u,We,O)),typeof T.componentDidUpdate=="function"&&(r.flags|=4),typeof T.getSnapshotBeforeUpdate=="function"&&(r.flags|=1024)):(typeof T.componentDidUpdate!="function"||N===n.memoizedProps&&_e===n.memoizedState||(r.flags|=4),typeof T.getSnapshotBeforeUpdate!="function"||N===n.memoizedProps&&_e===n.memoizedState||(r.flags|=1024),r.memoizedProps=u,r.memoizedState=We),T.props=u,T.state=We,T.context=O,u=ie):(typeof T.componentDidUpdate!="function"||N===n.memoizedProps&&_e===n.memoizedState||(r.flags|=4),typeof T.getSnapshotBeforeUpdate!="function"||N===n.memoizedProps&&_e===n.memoizedState||(r.flags|=1024),u=!1)}return ju(n,r,a,u,g,f)}function ju(n,r,a,u,f,g){_m(n,r);var T=(r.flags&128)!==0;if(!u&&!T)return f&&Mp(r,a,!1),Yi(n,r,g);u=r.stateNode,bv.current=r;var N=T&&typeof a.getDerivedStateFromError!="function"?null:u.render();return r.flags|=1,n!==null&&T?(r.child=Vs(r,n.child,null,g),r.child=Vs(r,null,N,g)):In(n,r,N,g),r.memoizedState=u.state,f&&Mp(r,a,!0),r.child}function vm(n){var r=n.stateNode;r.pendingContext?xp(n,r.pendingContext,r.pendingContext!==r.context):r.context&&xp(n,r.context,!1),Pu(n,r.containerInfo)}function ym(n,r,a,u,f){return zs(),wu(f),r.flags|=256,In(n,r,a,u),r.child}var Ku={dehydrated:null,treeContext:null,retryLane:0};function Yu(n){return{baseLanes:n,cachePool:null,transitions:null}}function xm(n,r,a){var u=r.pendingProps,f=qt.current,g=!1,T=(r.flags&128)!==0,N;if((N=T)||(N=n!==null&&n.memoizedState===null?!1:(f&2)!==0),N?(g=!0,r.flags&=-129):(n===null||n.memoizedState!==null)&&(f|=1),Ot(qt,f&1),n===null)return Mu(r),n=r.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((r.mode&1)===0?r.lanes=1:n.data==="$!"?r.lanes=8:r.lanes=1073741824,null):(T=u.children,n=u.fallback,g?(u=r.mode,g=r.child,T={mode:"hidden",children:T},(u&1)===0&&g!==null?(g.childLanes=0,g.pendingProps=T):g=Nl(T,u,0,null),n=rs(n,u,a,null),g.return=r,n.return=r,g.sibling=n,r.child=g,r.child.memoizedState=Yu(a),r.memoizedState=Ku,n):$u(r,T));if(f=n.memoizedState,f!==null&&(N=f.dehydrated,N!==null))return Av(n,r,T,u,N,f,a);if(g){g=u.fallback,T=r.mode,f=n.child,N=f.sibling;var O={mode:"hidden",children:u.children};return(T&1)===0&&r.child!==f?(u=r.child,u.childLanes=0,u.pendingProps=O,r.deletions=null):(u=Pr(f,O),u.subtreeFlags=f.subtreeFlags&14680064),N!==null?g=Pr(N,g):(g=rs(g,T,a,null),g.flags|=2),g.return=r,u.return=r,u.sibling=g,r.child=u,u=g,g=r.child,T=n.child.memoizedState,T=T===null?Yu(a):{baseLanes:T.baseLanes|a,cachePool:null,transitions:T.transitions},g.memoizedState=T,g.childLanes=n.childLanes&~a,r.memoizedState=Ku,u}return g=n.child,n=g.sibling,u=Pr(g,{mode:"visible",children:u.children}),(r.mode&1)===0&&(u.lanes=a),u.return=r,u.sibling=null,n!==null&&(a=r.deletions,a===null?(r.deletions=[n],r.flags|=16):a.push(n)),r.child=u,r.memoizedState=null,u}function $u(n,r){return r=Nl({mode:"visible",children:r},n.mode,0,null),r.return=n,n.child=r}function Sl(n,r,a,u){return u!==null&&wu(u),Vs(r,n.child,null,a),n=$u(r,r.pendingProps.children),n.flags|=2,r.memoizedState=null,n}function Av(n,r,a,u,f,g,T){if(a)return r.flags&256?(r.flags&=-257,u=Wu(Error(t(422))),Sl(n,r,T,u)):r.memoizedState!==null?(r.child=n.child,r.flags|=128,null):(g=u.fallback,f=r.mode,u=Nl({mode:"visible",children:u.children},f,0,null),g=rs(g,f,T,null),g.flags|=2,u.return=r,g.return=r,u.sibling=g,r.child=u,(r.mode&1)!==0&&Vs(r,n.child,null,T),r.child.memoizedState=Yu(T),r.memoizedState=Ku,g);if((r.mode&1)===0)return Sl(n,r,T,null);if(f.data==="$!"){if(u=f.nextSibling&&f.nextSibling.dataset,u)var N=u.dgst;return u=N,g=Error(t(419)),u=Wu(g,u,void 0),Sl(n,r,T,u)}if(N=(T&n.childLanes)!==0,zn||N){if(u=ln,u!==null){switch(T&-T){case 4:f=2;break;case 16:f=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:f=32;break;case 536870912:f=268435456;break;default:f=0}f=(f&(u.suspendedLanes|T))!==0?0:f,f!==0&&f!==g.retryLane&&(g.retryLane=f,ji(n,f),yi(u,n,f,-1))}return hd(),u=Wu(Error(t(421))),Sl(n,r,T,u)}return f.data==="$?"?(r.flags|=128,r.child=n.child,r=zv.bind(null,n),f._reactRetry=r,null):(n=g.treeContext,Jn=yr(f.nextSibling),Qn=r,Gt=!0,mi=null,n!==null&&(si[oi++]=qi,si[oi++]=Xi,si[oi++]=Yr,qi=n.id,Xi=n.overflow,Yr=r),r=$u(r,u.children),r.flags|=4096,r)}function Sm(n,r,a){n.lanes|=r;var u=n.alternate;u!==null&&(u.lanes|=r),Au(n.return,r,a)}function Qu(n,r,a,u,f){var g=n.memoizedState;g===null?n.memoizedState={isBackwards:r,rendering:null,renderingStartTime:0,last:u,tail:a,tailMode:f}:(g.isBackwards=r,g.rendering=null,g.renderingStartTime=0,g.last=u,g.tail=a,g.tailMode=f)}function Mm(n,r,a){var u=r.pendingProps,f=u.revealOrder,g=u.tail;if(In(n,r,u.children,a),u=qt.current,(u&2)!==0)u=u&1|2,r.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=r.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&Sm(n,a,r);else if(n.tag===19)Sm(n,a,r);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===r)break e;for(;n.sibling===null;){if(n.return===null||n.return===r)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}u&=1}if(Ot(qt,u),(r.mode&1)===0)r.memoizedState=null;else switch(f){case"forwards":for(a=r.child,f=null;a!==null;)n=a.alternate,n!==null&&pl(n)===null&&(f=a),a=a.sibling;a=f,a===null?(f=r.child,r.child=null):(f=a.sibling,a.sibling=null),Qu(r,!1,f,a,g);break;case"backwards":for(a=null,f=r.child,r.child=null;f!==null;){if(n=f.alternate,n!==null&&pl(n)===null){r.child=f;break}n=f.sibling,f.sibling=a,a=f,f=n}Qu(r,!0,a,null,g);break;case"together":Qu(r,!1,null,null,void 0);break;default:r.memoizedState=null}return r.child}function Ml(n,r){(r.mode&1)===0&&n!==null&&(n.alternate=null,r.alternate=null,r.flags|=2)}function Yi(n,r,a){if(n!==null&&(r.dependencies=n.dependencies),es|=r.lanes,(a&r.childLanes)===0)return null;if(n!==null&&r.child!==n.child)throw Error(t(153));if(r.child!==null){for(n=r.child,a=Pr(n,n.pendingProps),r.child=a,a.return=r;n.sibling!==null;)n=n.sibling,a=a.sibling=Pr(n,n.pendingProps),a.return=r;a.sibling=null}return r.child}function Cv(n,r,a){switch(r.tag){case 3:vm(r),zs();break;case 5:kp(r);break;case 1:Bn(r.type)&&rl(r);break;case 4:Pu(r,r.stateNode.containerInfo);break;case 10:var u=r.type._context,f=r.memoizedProps.value;Ot(ul,u._currentValue),u._currentValue=f;break;case 13:if(u=r.memoizedState,u!==null)return u.dehydrated!==null?(Ot(qt,qt.current&1),r.flags|=128,null):(a&r.child.childLanes)!==0?xm(n,r,a):(Ot(qt,qt.current&1),n=Yi(n,r,a),n!==null?n.sibling:null);Ot(qt,qt.current&1);break;case 19:if(u=(a&r.childLanes)!==0,(n.flags&128)!==0){if(u)return Mm(n,r,a);r.flags|=128}if(f=r.memoizedState,f!==null&&(f.rendering=null,f.tail=null,f.lastEffect=null),Ot(qt,qt.current),u)break;return null;case 22:case 23:return r.lanes=0,mm(n,r,a)}return Yi(n,r,a)}var wm,Ju,Em,Tm;wm=function(n,r){for(var a=r.child;a!==null;){if(a.tag===5||a.tag===6)n.appendChild(a.stateNode);else if(a.tag!==4&&a.child!==null){a.child.return=a,a=a.child;continue}if(a===r)break;for(;a.sibling===null;){if(a.return===null||a.return===r)return;a=a.return}a.sibling.return=a.return,a=a.sibling}},Ju=function(){},Em=function(n,r,a,u){var f=n.memoizedProps;if(f!==u){n=r.stateNode,Jr(Di.current);var g=null;switch(a){case"input":f=vn(n,f),u=vn(n,u),g=[];break;case"select":f=ae({},f,{value:void 0}),u=ae({},u,{value:void 0}),g=[];break;case"textarea":f=$(n,f),u=$(n,u),g=[];break;default:typeof f.onClick!="function"&&typeof u.onClick=="function"&&(n.onclick=tl)}at(a,u);var T;a=null;for(ie in f)if(!u.hasOwnProperty(ie)&&f.hasOwnProperty(ie)&&f[ie]!=null)if(ie==="style"){var N=f[ie];for(T in N)N.hasOwnProperty(T)&&(a||(a={}),a[T]="")}else ie!=="dangerouslySetInnerHTML"&&ie!=="children"&&ie!=="suppressContentEditableWarning"&&ie!=="suppressHydrationWarning"&&ie!=="autoFocus"&&(o.hasOwnProperty(ie)?g||(g=[]):(g=g||[]).push(ie,null));for(ie in u){var O=u[ie];if(N=f?.[ie],u.hasOwnProperty(ie)&&O!==N&&(O!=null||N!=null))if(ie==="style")if(N){for(T in N)!N.hasOwnProperty(T)||O&&O.hasOwnProperty(T)||(a||(a={}),a[T]="");for(T in O)O.hasOwnProperty(T)&&N[T]!==O[T]&&(a||(a={}),a[T]=O[T])}else a||(g||(g=[]),g.push(ie,a)),a=O;else ie==="dangerouslySetInnerHTML"?(O=O?O.__html:void 0,N=N?N.__html:void 0,O!=null&&N!==O&&(g=g||[]).push(ie,O)):ie==="children"?typeof O!="string"&&typeof O!="number"||(g=g||[]).push(ie,""+O):ie!=="suppressContentEditableWarning"&&ie!=="suppressHydrationWarning"&&(o.hasOwnProperty(ie)?(O!=null&&ie==="onScroll"&&zt("scroll",n),g||N===O||(g=[])):(g=g||[]).push(ie,O))}a&&(g=g||[]).push("style",a);var ie=g;(r.updateQueue=ie)&&(r.flags|=4)}},Tm=function(n,r,a,u){a!==u&&(r.flags|=4)};function aa(n,r){if(!Gt)switch(n.tailMode){case"hidden":r=n.tail;for(var a=null;r!==null;)r.alternate!==null&&(a=r),r=r.sibling;a===null?n.tail=null:a.sibling=null;break;case"collapsed":a=n.tail;for(var u=null;a!==null;)a.alternate!==null&&(u=a),a=a.sibling;u===null?r||n.tail===null?n.tail=null:n.tail.sibling=null:u.sibling=null}}function Tn(n){var r=n.alternate!==null&&n.alternate.child===n.child,a=0,u=0;if(r)for(var f=n.child;f!==null;)a|=f.lanes|f.childLanes,u|=f.subtreeFlags&14680064,u|=f.flags&14680064,f.return=n,f=f.sibling;else for(f=n.child;f!==null;)a|=f.lanes|f.childLanes,u|=f.subtreeFlags,u|=f.flags,f.return=n,f=f.sibling;return n.subtreeFlags|=u,n.childLanes=a,r}function Rv(n,r,a){var u=r.pendingProps;switch(xu(r),r.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Tn(r),null;case 1:return Bn(r.type)&&il(),Tn(r),null;case 3:return u=r.stateNode,Ws(),Vt(On),Vt(wn),Iu(),u.pendingContext&&(u.context=u.pendingContext,u.pendingContext=null),(n===null||n.child===null)&&(ll(r)?r.flags|=4:n===null||n.memoizedState.isDehydrated&&(r.flags&256)===0||(r.flags|=1024,mi!==null&&(cd(mi),mi=null))),Ju(n,r),Tn(r),null;case 5:Lu(r);var f=Jr(na.current);if(a=r.type,n!==null&&r.stateNode!=null)Em(n,r,a,u,f),n.ref!==r.ref&&(r.flags|=512,r.flags|=2097152);else{if(!u){if(r.stateNode===null)throw Error(t(166));return Tn(r),null}if(n=Jr(Di.current),ll(r)){u=r.stateNode,a=r.type;var g=r.memoizedProps;switch(u[Li]=r,u[Qo]=g,n=(r.mode&1)!==0,a){case"dialog":zt("cancel",u),zt("close",u);break;case"iframe":case"object":case"embed":zt("load",u);break;case"video":case"audio":for(f=0;f<Ko.length;f++)zt(Ko[f],u);break;case"source":zt("error",u);break;case"img":case"image":case"link":zt("error",u),zt("load",u);break;case"details":zt("toggle",u);break;case"input":ht(u,g),zt("invalid",u);break;case"select":u._wrapperState={wasMultiple:!!g.multiple},zt("invalid",u);break;case"textarea":he(u,g),zt("invalid",u)}at(a,g),f=null;for(var T in g)if(g.hasOwnProperty(T)){var N=g[T];T==="children"?typeof N=="string"?u.textContent!==N&&(g.suppressHydrationWarning!==!0&&el(u.textContent,N,n),f=["children",N]):typeof N=="number"&&u.textContent!==""+N&&(g.suppressHydrationWarning!==!0&&el(u.textContent,N,n),f=["children",""+N]):o.hasOwnProperty(T)&&N!=null&&T==="onScroll"&&zt("scroll",u)}switch(a){case"input":yt(u),Dt(u,g,!0);break;case"textarea":yt(u),de(u);break;case"select":case"option":break;default:typeof g.onClick=="function"&&(u.onclick=tl)}u=f,r.updateQueue=u,u!==null&&(r.flags|=4)}else{T=f.nodeType===9?f:f.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=Ye(a)),n==="http://www.w3.org/1999/xhtml"?a==="script"?(n=T.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof u.is=="string"?n=T.createElement(a,{is:u.is}):(n=T.createElement(a),a==="select"&&(T=n,u.multiple?T.multiple=!0:u.size&&(T.size=u.size))):n=T.createElementNS(n,a),n[Li]=r,n[Qo]=u,wm(n,r,!1,!1),r.stateNode=n;e:{switch(T=Rt(a,u),a){case"dialog":zt("cancel",n),zt("close",n),f=u;break;case"iframe":case"object":case"embed":zt("load",n),f=u;break;case"video":case"audio":for(f=0;f<Ko.length;f++)zt(Ko[f],n);f=u;break;case"source":zt("error",n),f=u;break;case"img":case"image":case"link":zt("error",n),zt("load",n),f=u;break;case"details":zt("toggle",n),f=u;break;case"input":ht(n,u),f=vn(n,u),zt("invalid",n);break;case"option":f=u;break;case"select":n._wrapperState={wasMultiple:!!u.multiple},f=ae({},u,{value:void 0}),zt("invalid",n);break;case"textarea":he(n,u),f=$(n,u),zt("invalid",n);break;default:f=u}at(a,f),N=f;for(g in N)if(N.hasOwnProperty(g)){var O=N[g];g==="style"?He(n,O):g==="dangerouslySetInnerHTML"?(O=O?O.__html:void 0,O!=null&&gt(n,O)):g==="children"?typeof O=="string"?(a!=="textarea"||O!=="")&&Me(n,O):typeof O=="number"&&Me(n,""+O):g!=="suppressContentEditableWarning"&&g!=="suppressHydrationWarning"&&g!=="autoFocus"&&(o.hasOwnProperty(g)?O!=null&&g==="onScroll"&&zt("scroll",n):O!=null&&b(n,g,O,T))}switch(a){case"input":yt(n),Dt(n,u,!1);break;case"textarea":yt(n),de(n);break;case"option":u.value!=null&&n.setAttribute("value",""+Le(u.value));break;case"select":n.multiple=!!u.multiple,g=u.value,g!=null?A(n,!!u.multiple,g,!1):u.defaultValue!=null&&A(n,!!u.multiple,u.defaultValue,!0);break;default:typeof f.onClick=="function"&&(n.onclick=tl)}switch(a){case"button":case"input":case"select":case"textarea":u=!!u.autoFocus;break e;case"img":u=!0;break e;default:u=!1}}u&&(r.flags|=4)}r.ref!==null&&(r.flags|=512,r.flags|=2097152)}return Tn(r),null;case 6:if(n&&r.stateNode!=null)Tm(n,r,n.memoizedProps,u);else{if(typeof u!="string"&&r.stateNode===null)throw Error(t(166));if(a=Jr(na.current),Jr(Di.current),ll(r)){if(u=r.stateNode,a=r.memoizedProps,u[Li]=r,(g=u.nodeValue!==a)&&(n=Qn,n!==null))switch(n.tag){case 3:el(u.nodeValue,a,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&el(u.nodeValue,a,(n.mode&1)!==0)}g&&(r.flags|=4)}else u=(a.nodeType===9?a:a.ownerDocument).createTextNode(u),u[Li]=r,r.stateNode=u}return Tn(r),null;case 13:if(Vt(qt),u=r.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(Gt&&Jn!==null&&(r.mode&1)!==0&&(r.flags&128)===0)Cp(),zs(),r.flags|=98560,g=!1;else if(g=ll(r),u!==null&&u.dehydrated!==null){if(n===null){if(!g)throw Error(t(318));if(g=r.memoizedState,g=g!==null?g.dehydrated:null,!g)throw Error(t(317));g[Li]=r}else zs(),(r.flags&128)===0&&(r.memoizedState=null),r.flags|=4;Tn(r),g=!1}else mi!==null&&(cd(mi),mi=null),g=!0;if(!g)return r.flags&65536?r:null}return(r.flags&128)!==0?(r.lanes=a,r):(u=u!==null,u!==(n!==null&&n.memoizedState!==null)&&u&&(r.child.flags|=8192,(r.mode&1)!==0&&(n===null||(qt.current&1)!==0?tn===0&&(tn=3):hd())),r.updateQueue!==null&&(r.flags|=4),Tn(r),null);case 4:return Ws(),Ju(n,r),n===null&&Yo(r.stateNode.containerInfo),Tn(r),null;case 10:return bu(r.type._context),Tn(r),null;case 17:return Bn(r.type)&&il(),Tn(r),null;case 19:if(Vt(qt),g=r.memoizedState,g===null)return Tn(r),null;if(u=(r.flags&128)!==0,T=g.rendering,T===null)if(u)aa(g,!1);else{if(tn!==0||n!==null&&(n.flags&128)!==0)for(n=r.child;n!==null;){if(T=pl(n),T!==null){for(r.flags|=128,aa(g,!1),u=T.updateQueue,u!==null&&(r.updateQueue=u,r.flags|=4),r.subtreeFlags=0,u=a,a=r.child;a!==null;)g=a,n=u,g.flags&=14680066,T=g.alternate,T===null?(g.childLanes=0,g.lanes=n,g.child=null,g.subtreeFlags=0,g.memoizedProps=null,g.memoizedState=null,g.updateQueue=null,g.dependencies=null,g.stateNode=null):(g.childLanes=T.childLanes,g.lanes=T.lanes,g.child=T.child,g.subtreeFlags=0,g.deletions=null,g.memoizedProps=T.memoizedProps,g.memoizedState=T.memoizedState,g.updateQueue=T.updateQueue,g.type=T.type,n=T.dependencies,g.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),a=a.sibling;return Ot(qt,qt.current&1|2),r.child}n=n.sibling}g.tail!==null&&Te()>Ks&&(r.flags|=128,u=!0,aa(g,!1),r.lanes=4194304)}else{if(!u)if(n=pl(T),n!==null){if(r.flags|=128,u=!0,a=n.updateQueue,a!==null&&(r.updateQueue=a,r.flags|=4),aa(g,!0),g.tail===null&&g.tailMode==="hidden"&&!T.alternate&&!Gt)return Tn(r),null}else 2*Te()-g.renderingStartTime>Ks&&a!==1073741824&&(r.flags|=128,u=!0,aa(g,!1),r.lanes=4194304);g.isBackwards?(T.sibling=r.child,r.child=T):(a=g.last,a!==null?a.sibling=T:r.child=T,g.last=T)}return g.tail!==null?(r=g.tail,g.rendering=r,g.tail=r.sibling,g.renderingStartTime=Te(),r.sibling=null,a=qt.current,Ot(qt,u?a&1|2:a&1),r):(Tn(r),null);case 22:case 23:return dd(),u=r.memoizedState!==null,n!==null&&n.memoizedState!==null!==u&&(r.flags|=8192),u&&(r.mode&1)!==0?(Zn&1073741824)!==0&&(Tn(r),r.subtreeFlags&6&&(r.flags|=8192)):Tn(r),null;case 24:return null;case 25:return null}throw Error(t(156,r.tag))}function Pv(n,r){switch(xu(r),r.tag){case 1:return Bn(r.type)&&il(),n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 3:return Ws(),Vt(On),Vt(wn),Iu(),n=r.flags,(n&65536)!==0&&(n&128)===0?(r.flags=n&-65537|128,r):null;case 5:return Lu(r),null;case 13:if(Vt(qt),n=r.memoizedState,n!==null&&n.dehydrated!==null){if(r.alternate===null)throw Error(t(340));zs()}return n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 19:return Vt(qt),null;case 4:return Ws(),null;case 10:return bu(r.type._context),null;case 22:case 23:return dd(),null;case 24:return null;default:return null}}var wl=!1,bn=!1,Lv=typeof WeakSet=="function"?WeakSet:Set,Ge=null;function Xs(n,r){var a=n.ref;if(a!==null)if(typeof a=="function")try{a(null)}catch(u){jt(n,r,u)}else a.current=null}function Zu(n,r,a){try{a()}catch(u){jt(n,r,u)}}var bm=!1;function Dv(n,r){if(du=Ga,n=rp(),iu(n)){if("selectionStart"in n)var a={start:n.selectionStart,end:n.selectionEnd};else e:{a=(a=n.ownerDocument)&&a.defaultView||window;var u=a.getSelection&&a.getSelection();if(u&&u.rangeCount!==0){a=u.anchorNode;var f=u.anchorOffset,g=u.focusNode;u=u.focusOffset;try{a.nodeType,g.nodeType}catch{a=null;break e}var T=0,N=-1,O=-1,ie=0,ge=0,ye=n,_e=null;t:for(;;){for(var ke;ye!==a||f!==0&&ye.nodeType!==3||(N=T+f),ye!==g||u!==0&&ye.nodeType!==3||(O=T+u),ye.nodeType===3&&(T+=ye.nodeValue.length),(ke=ye.firstChild)!==null;)_e=ye,ye=ke;for(;;){if(ye===n)break t;if(_e===a&&++ie===f&&(N=T),_e===g&&++ge===u&&(O=T),(ke=ye.nextSibling)!==null)break;ye=_e,_e=ye.parentNode}ye=ke}a=N===-1||O===-1?null:{start:N,end:O}}else a=null}a=a||{start:0,end:0}}else a=null;for(hu={focusedElem:n,selectionRange:a},Ga=!1,Ge=r;Ge!==null;)if(r=Ge,n=r.child,(r.subtreeFlags&1028)!==0&&n!==null)n.return=r,Ge=n;else for(;Ge!==null;){r=Ge;try{var We=r.alternate;if((r.flags&1024)!==0)switch(r.tag){case 0:case 11:case 15:break;case 1:if(We!==null){var qe=We.memoizedProps,Kt=We.memoizedState,K=r.stateNode,H=K.getSnapshotBeforeUpdate(r.elementType===r.type?qe:_i(r.type,qe),Kt);K.__reactInternalSnapshotBeforeUpdate=H}break;case 3:var Y=r.stateNode.containerInfo;Y.nodeType===1?Y.textContent="":Y.nodeType===9&&Y.documentElement&&Y.removeChild(Y.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(we){jt(r,r.return,we)}if(n=r.sibling,n!==null){n.return=r.return,Ge=n;break}Ge=r.return}return We=bm,bm=!1,We}function la(n,r,a){var u=r.updateQueue;if(u=u!==null?u.lastEffect:null,u!==null){var f=u=u.next;do{if((f.tag&n)===n){var g=f.destroy;f.destroy=void 0,g!==void 0&&Zu(r,a,g)}f=f.next}while(f!==u)}}function El(n,r){if(r=r.updateQueue,r=r!==null?r.lastEffect:null,r!==null){var a=r=r.next;do{if((a.tag&n)===n){var u=a.create;a.destroy=u()}a=a.next}while(a!==r)}}function ed(n){var r=n.ref;if(r!==null){var a=n.stateNode;switch(n.tag){case 5:n=a;break;default:n=a}typeof r=="function"?r(n):r.current=n}}function Am(n){var r=n.alternate;r!==null&&(n.alternate=null,Am(r)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(r=n.stateNode,r!==null&&(delete r[Li],delete r[Qo],delete r[_u],delete r[pv],delete r[mv])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Cm(n){return n.tag===5||n.tag===3||n.tag===4}function Rm(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Cm(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function td(n,r,a){var u=n.tag;if(u===5||u===6)n=n.stateNode,r?a.nodeType===8?a.parentNode.insertBefore(n,r):a.insertBefore(n,r):(a.nodeType===8?(r=a.parentNode,r.insertBefore(n,a)):(r=a,r.appendChild(n)),a=a._reactRootContainer,a!=null||r.onclick!==null||(r.onclick=tl));else if(u!==4&&(n=n.child,n!==null))for(td(n,r,a),n=n.sibling;n!==null;)td(n,r,a),n=n.sibling}function nd(n,r,a){var u=n.tag;if(u===5||u===6)n=n.stateNode,r?a.insertBefore(n,r):a.appendChild(n);else if(u!==4&&(n=n.child,n!==null))for(nd(n,r,a),n=n.sibling;n!==null;)nd(n,r,a),n=n.sibling}var xn=null,gi=!1;function Tr(n,r,a){for(a=a.child;a!==null;)Pm(n,r,a),a=a.sibling}function Pm(n,r,a){if(Ht&&typeof Ht.onCommitFiberUnmount=="function")try{Ht.onCommitFiberUnmount(Ut,a)}catch{}switch(a.tag){case 5:bn||Xs(a,r);case 6:var u=xn,f=gi;xn=null,Tr(n,r,a),xn=u,gi=f,xn!==null&&(gi?(n=xn,a=a.stateNode,n.nodeType===8?n.parentNode.removeChild(a):n.removeChild(a)):xn.removeChild(a.stateNode));break;case 18:xn!==null&&(gi?(n=xn,a=a.stateNode,n.nodeType===8?mu(n.parentNode,a):n.nodeType===1&&mu(n,a),zo(n)):mu(xn,a.stateNode));break;case 4:u=xn,f=gi,xn=a.stateNode.containerInfo,gi=!0,Tr(n,r,a),xn=u,gi=f;break;case 0:case 11:case 14:case 15:if(!bn&&(u=a.updateQueue,u!==null&&(u=u.lastEffect,u!==null))){f=u=u.next;do{var g=f,T=g.destroy;g=g.tag,T!==void 0&&((g&2)!==0||(g&4)!==0)&&Zu(a,r,T),f=f.next}while(f!==u)}Tr(n,r,a);break;case 1:if(!bn&&(Xs(a,r),u=a.stateNode,typeof u.componentWillUnmount=="function"))try{u.props=a.memoizedProps,u.state=a.memoizedState,u.componentWillUnmount()}catch(N){jt(a,r,N)}Tr(n,r,a);break;case 21:Tr(n,r,a);break;case 22:a.mode&1?(bn=(u=bn)||a.memoizedState!==null,Tr(n,r,a),bn=u):Tr(n,r,a);break;default:Tr(n,r,a)}}function Lm(n){var r=n.updateQueue;if(r!==null){n.updateQueue=null;var a=n.stateNode;a===null&&(a=n.stateNode=new Lv),r.forEach(function(u){var f=Vv.bind(null,n,u);a.has(u)||(a.add(u),u.then(f,f))})}}function vi(n,r){var a=r.deletions;if(a!==null)for(var u=0;u<a.length;u++){var f=a[u];try{var g=n,T=r,N=T;e:for(;N!==null;){switch(N.tag){case 5:xn=N.stateNode,gi=!1;break e;case 3:xn=N.stateNode.containerInfo,gi=!0;break e;case 4:xn=N.stateNode.containerInfo,gi=!0;break e}N=N.return}if(xn===null)throw Error(t(160));Pm(g,T,f),xn=null,gi=!1;var O=f.alternate;O!==null&&(O.return=null),f.return=null}catch(ie){jt(f,r,ie)}}if(r.subtreeFlags&12854)for(r=r.child;r!==null;)Dm(r,n),r=r.sibling}function Dm(n,r){var a=n.alternate,u=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(vi(r,n),Ni(n),u&4){try{la(3,n,n.return),El(3,n)}catch(qe){jt(n,n.return,qe)}try{la(5,n,n.return)}catch(qe){jt(n,n.return,qe)}}break;case 1:vi(r,n),Ni(n),u&512&&a!==null&&Xs(a,a.return);break;case 5:if(vi(r,n),Ni(n),u&512&&a!==null&&Xs(a,a.return),n.flags&32){var f=n.stateNode;try{Me(f,"")}catch(qe){jt(n,n.return,qe)}}if(u&4&&(f=n.stateNode,f!=null)){var g=n.memoizedProps,T=a!==null?a.memoizedProps:g,N=n.type,O=n.updateQueue;if(n.updateQueue=null,O!==null)try{N==="input"&&g.type==="radio"&&g.name!=null&&_t(f,g),Rt(N,T);var ie=Rt(N,g);for(T=0;T<O.length;T+=2){var ge=O[T],ye=O[T+1];ge==="style"?He(f,ye):ge==="dangerouslySetInnerHTML"?gt(f,ye):ge==="children"?Me(f,ye):b(f,ge,ye,ie)}switch(N){case"input":et(f,g);break;case"textarea":ve(f,g);break;case"select":var _e=f._wrapperState.wasMultiple;f._wrapperState.wasMultiple=!!g.multiple;var ke=g.value;ke!=null?A(f,!!g.multiple,ke,!1):_e!==!!g.multiple&&(g.defaultValue!=null?A(f,!!g.multiple,g.defaultValue,!0):A(f,!!g.multiple,g.multiple?[]:"",!1))}f[Qo]=g}catch(qe){jt(n,n.return,qe)}}break;case 6:if(vi(r,n),Ni(n),u&4){if(n.stateNode===null)throw Error(t(162));f=n.stateNode,g=n.memoizedProps;try{f.nodeValue=g}catch(qe){jt(n,n.return,qe)}}break;case 3:if(vi(r,n),Ni(n),u&4&&a!==null&&a.memoizedState.isDehydrated)try{zo(r.containerInfo)}catch(qe){jt(n,n.return,qe)}break;case 4:vi(r,n),Ni(n);break;case 13:vi(r,n),Ni(n),f=n.child,f.flags&8192&&(g=f.memoizedState!==null,f.stateNode.isHidden=g,!g||f.alternate!==null&&f.alternate.memoizedState!==null||(sd=Te())),u&4&&Lm(n);break;case 22:if(ge=a!==null&&a.memoizedState!==null,n.mode&1?(bn=(ie=bn)||ge,vi(r,n),bn=ie):vi(r,n),Ni(n),u&8192){if(ie=n.memoizedState!==null,(n.stateNode.isHidden=ie)&&!ge&&(n.mode&1)!==0)for(Ge=n,ge=n.child;ge!==null;){for(ye=Ge=ge;Ge!==null;){switch(_e=Ge,ke=_e.child,_e.tag){case 0:case 11:case 14:case 15:la(4,_e,_e.return);break;case 1:Xs(_e,_e.return);var We=_e.stateNode;if(typeof We.componentWillUnmount=="function"){u=_e,a=_e.return;try{r=u,We.props=r.memoizedProps,We.state=r.memoizedState,We.componentWillUnmount()}catch(qe){jt(u,a,qe)}}break;case 5:Xs(_e,_e.return);break;case 22:if(_e.memoizedState!==null){Um(ye);continue}}ke!==null?(ke.return=_e,Ge=ke):Um(ye)}ge=ge.sibling}e:for(ge=null,ye=n;;){if(ye.tag===5){if(ge===null){ge=ye;try{f=ye.stateNode,ie?(g=f.style,typeof g.setProperty=="function"?g.setProperty("display","none","important"):g.display="none"):(N=ye.stateNode,O=ye.memoizedProps.style,T=O!=null&&O.hasOwnProperty("display")?O.display:null,N.style.display=it("display",T))}catch(qe){jt(n,n.return,qe)}}}else if(ye.tag===6){if(ge===null)try{ye.stateNode.nodeValue=ie?"":ye.memoizedProps}catch(qe){jt(n,n.return,qe)}}else if((ye.tag!==22&&ye.tag!==23||ye.memoizedState===null||ye===n)&&ye.child!==null){ye.child.return=ye,ye=ye.child;continue}if(ye===n)break e;for(;ye.sibling===null;){if(ye.return===null||ye.return===n)break e;ge===ye&&(ge=null),ye=ye.return}ge===ye&&(ge=null),ye.sibling.return=ye.return,ye=ye.sibling}}break;case 19:vi(r,n),Ni(n),u&4&&Lm(n);break;case 21:break;default:vi(r,n),Ni(n)}}function Ni(n){var r=n.flags;if(r&2){try{e:{for(var a=n.return;a!==null;){if(Cm(a)){var u=a;break e}a=a.return}throw Error(t(160))}switch(u.tag){case 5:var f=u.stateNode;u.flags&32&&(Me(f,""),u.flags&=-33);var g=Rm(n);nd(n,g,f);break;case 3:case 4:var T=u.stateNode.containerInfo,N=Rm(n);td(n,N,T);break;default:throw Error(t(161))}}catch(O){jt(n,n.return,O)}n.flags&=-3}r&4096&&(n.flags&=-4097)}function Iv(n,r,a){Ge=n,Im(n)}function Im(n,r,a){for(var u=(n.mode&1)!==0;Ge!==null;){var f=Ge,g=f.child;if(f.tag===22&&u){var T=f.memoizedState!==null||wl;if(!T){var N=f.alternate,O=N!==null&&N.memoizedState!==null||bn;N=wl;var ie=bn;if(wl=T,(bn=O)&&!ie)for(Ge=f;Ge!==null;)T=Ge,O=T.child,T.tag===22&&T.memoizedState!==null?km(f):O!==null?(O.return=T,Ge=O):km(f);for(;g!==null;)Ge=g,Im(g),g=g.sibling;Ge=f,wl=N,bn=ie}Nm(n)}else(f.subtreeFlags&8772)!==0&&g!==null?(g.return=f,Ge=g):Nm(n)}}function Nm(n){for(;Ge!==null;){var r=Ge;if((r.flags&8772)!==0){var a=r.alternate;try{if((r.flags&8772)!==0)switch(r.tag){case 0:case 11:case 15:bn||El(5,r);break;case 1:var u=r.stateNode;if(r.flags&4&&!bn)if(a===null)u.componentDidMount();else{var f=r.elementType===r.type?a.memoizedProps:_i(r.type,a.memoizedProps);u.componentDidUpdate(f,a.memoizedState,u.__reactInternalSnapshotBeforeUpdate)}var g=r.updateQueue;g!==null&&Up(r,g,u);break;case 3:var T=r.updateQueue;if(T!==null){if(a=null,r.child!==null)switch(r.child.tag){case 5:a=r.child.stateNode;break;case 1:a=r.child.stateNode}Up(r,T,a)}break;case 5:var N=r.stateNode;if(a===null&&r.flags&4){a=N;var O=r.memoizedProps;switch(r.type){case"button":case"input":case"select":case"textarea":O.autoFocus&&a.focus();break;case"img":O.src&&(a.src=O.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(r.memoizedState===null){var ie=r.alternate;if(ie!==null){var ge=ie.memoizedState;if(ge!==null){var ye=ge.dehydrated;ye!==null&&zo(ye)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}bn||r.flags&512&&ed(r)}catch(_e){jt(r,r.return,_e)}}if(r===n){Ge=null;break}if(a=r.sibling,a!==null){a.return=r.return,Ge=a;break}Ge=r.return}}function Um(n){for(;Ge!==null;){var r=Ge;if(r===n){Ge=null;break}var a=r.sibling;if(a!==null){a.return=r.return,Ge=a;break}Ge=r.return}}function km(n){for(;Ge!==null;){var r=Ge;try{switch(r.tag){case 0:case 11:case 15:var a=r.return;try{El(4,r)}catch(O){jt(r,a,O)}break;case 1:var u=r.stateNode;if(typeof u.componentDidMount=="function"){var f=r.return;try{u.componentDidMount()}catch(O){jt(r,f,O)}}var g=r.return;try{ed(r)}catch(O){jt(r,g,O)}break;case 5:var T=r.return;try{ed(r)}catch(O){jt(r,T,O)}}}catch(O){jt(r,r.return,O)}if(r===n){Ge=null;break}var N=r.sibling;if(N!==null){N.return=r.return,Ge=N;break}Ge=r.return}}var Nv=Math.ceil,Tl=P.ReactCurrentDispatcher,id=P.ReactCurrentOwner,ci=P.ReactCurrentBatchConfig,xt=0,ln=null,Yt=null,Sn=0,Zn=0,js=xr(0),tn=0,ca=null,es=0,bl=0,rd=0,ua=null,Vn=null,sd=0,Ks=1/0,$i=null,Al=!1,od=null,br=null,Cl=!1,Ar=null,Rl=0,da=0,ad=null,Pl=-1,Ll=0;function Nn(){return(xt&6)!==0?Te():Pl!==-1?Pl:Pl=Te()}function Cr(n){return(n.mode&1)===0?1:(xt&2)!==0&&Sn!==0?Sn&-Sn:gv.transition!==null?(Ll===0&&(Ll=As()),Ll):(n=Pt,n!==0||(n=window.event,n=n===void 0?16:Of(n.type)),n)}function yi(n,r,a,u){if(50<da)throw da=0,ad=null,Error(t(185));hr(n,a,u),((xt&2)===0||n!==ln)&&(n===ln&&((xt&2)===0&&(bl|=a),tn===4&&Rr(n,Sn)),Hn(n,u),a===1&&xt===0&&(r.mode&1)===0&&(Ks=Te()+500,sl&&Mr()))}function Hn(n,r){var a=n.callbackNode;No(n,r);var u=Ft(n,n===ln?Sn:0);if(u===0)a!==null&&X(a),n.callbackNode=null,n.callbackPriority=0;else if(r=u&-u,n.callbackPriority!==r){if(a!=null&&X(a),r===1)n.tag===0?_v(Om.bind(null,n)):wp(Om.bind(null,n)),hv(function(){(xt&6)===0&&Mr()}),a=null;else{switch(Pf(u)){case 1:a=Ze;break;case 4:a=tt;break;case 16:a=je;break;case 536870912:a=It;break;default:a=je}a=Xm(a,Fm.bind(null,n))}n.callbackPriority=r,n.callbackNode=a}}function Fm(n,r){if(Pl=-1,Ll=0,(xt&6)!==0)throw Error(t(327));var a=n.callbackNode;if(Ys()&&n.callbackNode!==a)return null;var u=Ft(n,n===ln?Sn:0);if(u===0)return null;if((u&30)!==0||(u&n.expiredLanes)!==0||r)r=Dl(n,u);else{r=u;var f=xt;xt|=2;var g=zm();(ln!==n||Sn!==r)&&($i=null,Ks=Te()+500,ns(n,r));do try{Fv();break}catch(N){Bm(n,N)}while(!0);Tu(),Tl.current=g,xt=f,Yt!==null?r=0:(ln=null,Sn=0,r=tn)}if(r!==0){if(r===2&&(f=Mn(n),f!==0&&(u=f,r=ld(n,f))),r===1)throw a=ca,ns(n,0),Rr(n,u),Hn(n,Te()),a;if(r===6)Rr(n,u);else{if(f=n.current.alternate,(u&30)===0&&!Uv(f)&&(r=Dl(n,u),r===2&&(g=Mn(n),g!==0&&(u=g,r=ld(n,g))),r===1))throw a=ca,ns(n,0),Rr(n,u),Hn(n,Te()),a;switch(n.finishedWork=f,n.finishedLanes=u,r){case 0:case 1:throw Error(t(345));case 2:is(n,Vn,$i);break;case 3:if(Rr(n,u),(u&130023424)===u&&(r=sd+500-Te(),10<r)){if(Ft(n,0)!==0)break;if(f=n.suspendedLanes,(f&u)!==u){Nn(),n.pingedLanes|=n.suspendedLanes&f;break}n.timeoutHandle=pu(is.bind(null,n,Vn,$i),r);break}is(n,Vn,$i);break;case 4:if(Rr(n,u),(u&4194240)===u)break;for(r=n.eventTimes,f=-1;0<u;){var T=31-ze(u);g=1<<T,T=r[T],T>f&&(f=T),u&=~g}if(u=f,u=Te()-u,u=(120>u?120:480>u?480:1080>u?1080:1920>u?1920:3e3>u?3e3:4320>u?4320:1960*Nv(u/1960))-u,10<u){n.timeoutHandle=pu(is.bind(null,n,Vn,$i),u);break}is(n,Vn,$i);break;case 5:is(n,Vn,$i);break;default:throw Error(t(329))}}}return Hn(n,Te()),n.callbackNode===a?Fm.bind(null,n):null}function ld(n,r){var a=ua;return n.current.memoizedState.isDehydrated&&(ns(n,r).flags|=256),n=Dl(n,r),n!==2&&(r=Vn,Vn=a,r!==null&&cd(r)),n}function cd(n){Vn===null?Vn=n:Vn.push.apply(Vn,n)}function Uv(n){for(var r=n;;){if(r.flags&16384){var a=r.updateQueue;if(a!==null&&(a=a.stores,a!==null))for(var u=0;u<a.length;u++){var f=a[u],g=f.getSnapshot;f=f.value;try{if(!pi(g(),f))return!1}catch{return!1}}}if(a=r.child,r.subtreeFlags&16384&&a!==null)a.return=r,r=a;else{if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return!0;r=r.return}r.sibling.return=r.return,r=r.sibling}}return!0}function Rr(n,r){for(r&=~rd,r&=~bl,n.suspendedLanes|=r,n.pingedLanes&=~r,n=n.expirationTimes;0<r;){var a=31-ze(r),u=1<<a;n[a]=-1,r&=~u}}function Om(n){if((xt&6)!==0)throw Error(t(327));Ys();var r=Ft(n,0);if((r&1)===0)return Hn(n,Te()),null;var a=Dl(n,r);if(n.tag!==0&&a===2){var u=Mn(n);u!==0&&(r=u,a=ld(n,u))}if(a===1)throw a=ca,ns(n,0),Rr(n,r),Hn(n,Te()),a;if(a===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=r,is(n,Vn,$i),Hn(n,Te()),null}function ud(n,r){var a=xt;xt|=1;try{return n(r)}finally{xt=a,xt===0&&(Ks=Te()+500,sl&&Mr())}}function ts(n){Ar!==null&&Ar.tag===0&&(xt&6)===0&&Ys();var r=xt;xt|=1;var a=ci.transition,u=Pt;try{if(ci.transition=null,Pt=1,n)return n()}finally{Pt=u,ci.transition=a,xt=r,(xt&6)===0&&Mr()}}function dd(){Zn=js.current,Vt(js)}function ns(n,r){n.finishedWork=null,n.finishedLanes=0;var a=n.timeoutHandle;if(a!==-1&&(n.timeoutHandle=-1,dv(a)),Yt!==null)for(a=Yt.return;a!==null;){var u=a;switch(xu(u),u.tag){case 1:u=u.type.childContextTypes,u!=null&&il();break;case 3:Ws(),Vt(On),Vt(wn),Iu();break;case 5:Lu(u);break;case 4:Ws();break;case 13:Vt(qt);break;case 19:Vt(qt);break;case 10:bu(u.type._context);break;case 22:case 23:dd()}a=a.return}if(ln=n,Yt=n=Pr(n.current,null),Sn=Zn=r,tn=0,ca=null,rd=bl=es=0,Vn=ua=null,Qr!==null){for(r=0;r<Qr.length;r++)if(a=Qr[r],u=a.interleaved,u!==null){a.interleaved=null;var f=u.next,g=a.pending;if(g!==null){var T=g.next;g.next=f,u.next=T}a.pending=u}Qr=null}return n}function Bm(n,r){do{var a=Yt;try{if(Tu(),ml.current=yl,_l){for(var u=Xt.memoizedState;u!==null;){var f=u.queue;f!==null&&(f.pending=null),u=u.next}_l=!1}if(Zr=0,an=en=Xt=null,ia=!1,ra=0,id.current=null,a===null||a.return===null){tn=1,ca=r,Yt=null;break}e:{var g=n,T=a.return,N=a,O=r;if(r=Sn,N.flags|=32768,O!==null&&typeof O=="object"&&typeof O.then=="function"){var ie=O,ge=N,ye=ge.tag;if((ge.mode&1)===0&&(ye===0||ye===11||ye===15)){var _e=ge.alternate;_e?(ge.updateQueue=_e.updateQueue,ge.memoizedState=_e.memoizedState,ge.lanes=_e.lanes):(ge.updateQueue=null,ge.memoizedState=null)}var ke=um(T);if(ke!==null){ke.flags&=-257,dm(ke,T,N,g,r),ke.mode&1&&cm(g,ie,r),r=ke,O=ie;var We=r.updateQueue;if(We===null){var qe=new Set;qe.add(O),r.updateQueue=qe}else We.add(O);break e}else{if((r&1)===0){cm(g,ie,r),hd();break e}O=Error(t(426))}}else if(Gt&&N.mode&1){var Kt=um(T);if(Kt!==null){(Kt.flags&65536)===0&&(Kt.flags|=256),dm(Kt,T,N,g,r),wu(qs(O,N));break e}}g=O=qs(O,N),tn!==4&&(tn=2),ua===null?ua=[g]:ua.push(g),g=T;do{switch(g.tag){case 3:g.flags|=65536,r&=-r,g.lanes|=r;var K=am(g,O,r);Np(g,K);break e;case 1:N=O;var H=g.type,Y=g.stateNode;if((g.flags&128)===0&&(typeof H.getDerivedStateFromError=="function"||Y!==null&&typeof Y.componentDidCatch=="function"&&(br===null||!br.has(Y)))){g.flags|=65536,r&=-r,g.lanes|=r;var we=lm(g,N,r);Np(g,we);break e}}g=g.return}while(g!==null)}Hm(a)}catch(Ke){r=Ke,Yt===a&&a!==null&&(Yt=a=a.return);continue}break}while(!0)}function zm(){var n=Tl.current;return Tl.current=yl,n===null?yl:n}function hd(){(tn===0||tn===3||tn===2)&&(tn=4),ln===null||(es&268435455)===0&&(bl&268435455)===0||Rr(ln,Sn)}function Dl(n,r){var a=xt;xt|=2;var u=zm();(ln!==n||Sn!==r)&&($i=null,ns(n,r));do try{kv();break}catch(f){Bm(n,f)}while(!0);if(Tu(),xt=a,Tl.current=u,Yt!==null)throw Error(t(261));return ln=null,Sn=0,tn}function kv(){for(;Yt!==null;)Vm(Yt)}function Fv(){for(;Yt!==null&&!Ee();)Vm(Yt)}function Vm(n){var r=qm(n.alternate,n,Zn);n.memoizedProps=n.pendingProps,r===null?Hm(n):Yt=r,id.current=null}function Hm(n){var r=n;do{var a=r.alternate;if(n=r.return,(r.flags&32768)===0){if(a=Rv(a,r,Zn),a!==null){Yt=a;return}}else{if(a=Pv(a,r),a!==null){a.flags&=32767,Yt=a;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{tn=6,Yt=null;return}}if(r=r.sibling,r!==null){Yt=r;return}Yt=r=n}while(r!==null);tn===0&&(tn=5)}function is(n,r,a){var u=Pt,f=ci.transition;try{ci.transition=null,Pt=1,Ov(n,r,a,u)}finally{ci.transition=f,Pt=u}return null}function Ov(n,r,a,u){do Ys();while(Ar!==null);if((xt&6)!==0)throw Error(t(327));a=n.finishedWork;var f=n.finishedLanes;if(a===null)return null;if(n.finishedWork=null,n.finishedLanes=0,a===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var g=a.lanes|a.childLanes;if(vg(n,g),n===ln&&(Yt=ln=null,Sn=0),(a.subtreeFlags&2064)===0&&(a.flags&2064)===0||Cl||(Cl=!0,Xm(je,function(){return Ys(),null})),g=(a.flags&15990)!==0,(a.subtreeFlags&15990)!==0||g){g=ci.transition,ci.transition=null;var T=Pt;Pt=1;var N=xt;xt|=4,id.current=null,Dv(n,a),Dm(a,n),rv(hu),Ga=!!du,hu=du=null,n.current=a,Iv(a),Ne(),xt=N,Pt=T,ci.transition=g}else n.current=a;if(Cl&&(Cl=!1,Ar=n,Rl=f),g=n.pendingLanes,g===0&&(br=null),St(a.stateNode),Hn(n,Te()),r!==null)for(u=n.onRecoverableError,a=0;a<r.length;a++)f=r[a],u(f.value,{componentStack:f.stack,digest:f.digest});if(Al)throw Al=!1,n=od,od=null,n;return(Rl&1)!==0&&n.tag!==0&&Ys(),g=n.pendingLanes,(g&1)!==0?n===ad?da++:(da=0,ad=n):da=0,Mr(),null}function Ys(){if(Ar!==null){var n=Pf(Rl),r=ci.transition,a=Pt;try{if(ci.transition=null,Pt=16>n?16:n,Ar===null)var u=!1;else{if(n=Ar,Ar=null,Rl=0,(xt&6)!==0)throw Error(t(331));var f=xt;for(xt|=4,Ge=n.current;Ge!==null;){var g=Ge,T=g.child;if((Ge.flags&16)!==0){var N=g.deletions;if(N!==null){for(var O=0;O<N.length;O++){var ie=N[O];for(Ge=ie;Ge!==null;){var ge=Ge;switch(ge.tag){case 0:case 11:case 15:la(8,ge,g)}var ye=ge.child;if(ye!==null)ye.return=ge,Ge=ye;else for(;Ge!==null;){ge=Ge;var _e=ge.sibling,ke=ge.return;if(Am(ge),ge===ie){Ge=null;break}if(_e!==null){_e.return=ke,Ge=_e;break}Ge=ke}}}var We=g.alternate;if(We!==null){var qe=We.child;if(qe!==null){We.child=null;do{var Kt=qe.sibling;qe.sibling=null,qe=Kt}while(qe!==null)}}Ge=g}}if((g.subtreeFlags&2064)!==0&&T!==null)T.return=g,Ge=T;else e:for(;Ge!==null;){if(g=Ge,(g.flags&2048)!==0)switch(g.tag){case 0:case 11:case 15:la(9,g,g.return)}var K=g.sibling;if(K!==null){K.return=g.return,Ge=K;break e}Ge=g.return}}var H=n.current;for(Ge=H;Ge!==null;){T=Ge;var Y=T.child;if((T.subtreeFlags&2064)!==0&&Y!==null)Y.return=T,Ge=Y;else e:for(T=H;Ge!==null;){if(N=Ge,(N.flags&2048)!==0)try{switch(N.tag){case 0:case 11:case 15:El(9,N)}}catch(Ke){jt(N,N.return,Ke)}if(N===T){Ge=null;break e}var we=N.sibling;if(we!==null){we.return=N.return,Ge=we;break e}Ge=N.return}}if(xt=f,Mr(),Ht&&typeof Ht.onPostCommitFiberRoot=="function")try{Ht.onPostCommitFiberRoot(Ut,n)}catch{}u=!0}return u}finally{Pt=a,ci.transition=r}}return!1}function Gm(n,r,a){r=qs(a,r),r=am(n,r,1),n=Er(n,r,1),r=Nn(),n!==null&&(hr(n,1,r),Hn(n,r))}function jt(n,r,a){if(n.tag===3)Gm(n,n,a);else for(;r!==null;){if(r.tag===3){Gm(r,n,a);break}else if(r.tag===1){var u=r.stateNode;if(typeof r.type.getDerivedStateFromError=="function"||typeof u.componentDidCatch=="function"&&(br===null||!br.has(u))){n=qs(a,n),n=lm(r,n,1),r=Er(r,n,1),n=Nn(),r!==null&&(hr(r,1,n),Hn(r,n));break}}r=r.return}}function Bv(n,r,a){var u=n.pingCache;u!==null&&u.delete(r),r=Nn(),n.pingedLanes|=n.suspendedLanes&a,ln===n&&(Sn&a)===a&&(tn===4||tn===3&&(Sn&130023424)===Sn&&500>Te()-sd?ns(n,0):rd|=a),Hn(n,r)}function Wm(n,r){r===0&&((n.mode&1)===0?r=1:(r=on,on<<=1,(on&130023424)===0&&(on=4194304)));var a=Nn();n=ji(n,r),n!==null&&(hr(n,r,a),Hn(n,a))}function zv(n){var r=n.memoizedState,a=0;r!==null&&(a=r.retryLane),Wm(n,a)}function Vv(n,r){var a=0;switch(n.tag){case 13:var u=n.stateNode,f=n.memoizedState;f!==null&&(a=f.retryLane);break;case 19:u=n.stateNode;break;default:throw Error(t(314))}u!==null&&u.delete(r),Wm(n,a)}var qm;qm=function(n,r,a){if(n!==null)if(n.memoizedProps!==r.pendingProps||On.current)zn=!0;else{if((n.lanes&a)===0&&(r.flags&128)===0)return zn=!1,Cv(n,r,a);zn=(n.flags&131072)!==0}else zn=!1,Gt&&(r.flags&1048576)!==0&&Ep(r,al,r.index);switch(r.lanes=0,r.tag){case 2:var u=r.type;Ml(n,r),n=r.pendingProps;var f=Fs(r,wn.current);Gs(r,a),f=ku(null,r,u,n,f,a);var g=Fu();return r.flags|=1,typeof f=="object"&&f!==null&&typeof f.render=="function"&&f.$$typeof===void 0?(r.tag=1,r.memoizedState=null,r.updateQueue=null,Bn(u)?(g=!0,rl(r)):g=!1,r.memoizedState=f.state!==null&&f.state!==void 0?f.state:null,Ru(r),f.updater=xl,r.stateNode=f,f._reactInternals=r,Gu(r,u,n,a),r=ju(null,r,u,!0,g,a)):(r.tag=0,Gt&&g&&yu(r),In(null,r,f,a),r=r.child),r;case 16:u=r.elementType;e:{switch(Ml(n,r),n=r.pendingProps,f=u._init,u=f(u._payload),r.type=u,f=r.tag=Gv(u),n=_i(u,n),f){case 0:r=Xu(null,r,u,n,a);break e;case 1:r=gm(null,r,u,n,a);break e;case 11:r=hm(null,r,u,n,a);break e;case 14:r=fm(null,r,u,_i(u.type,n),a);break e}throw Error(t(306,u,""))}return r;case 0:return u=r.type,f=r.pendingProps,f=r.elementType===u?f:_i(u,f),Xu(n,r,u,f,a);case 1:return u=r.type,f=r.pendingProps,f=r.elementType===u?f:_i(u,f),gm(n,r,u,f,a);case 3:e:{if(vm(r),n===null)throw Error(t(387));u=r.pendingProps,g=r.memoizedState,f=g.element,Ip(n,r),fl(r,u,null,a);var T=r.memoizedState;if(u=T.element,g.isDehydrated)if(g={element:u,isDehydrated:!1,cache:T.cache,pendingSuspenseBoundaries:T.pendingSuspenseBoundaries,transitions:T.transitions},r.updateQueue.baseState=g,r.memoizedState=g,r.flags&256){f=qs(Error(t(423)),r),r=ym(n,r,u,a,f);break e}else if(u!==f){f=qs(Error(t(424)),r),r=ym(n,r,u,a,f);break e}else for(Jn=yr(r.stateNode.containerInfo.firstChild),Qn=r,Gt=!0,mi=null,a=Lp(r,null,u,a),r.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(zs(),u===f){r=Yi(n,r,a);break e}In(n,r,u,a)}r=r.child}return r;case 5:return kp(r),n===null&&Mu(r),u=r.type,f=r.pendingProps,g=n!==null?n.memoizedProps:null,T=f.children,fu(u,f)?T=null:g!==null&&fu(u,g)&&(r.flags|=32),_m(n,r),In(n,r,T,a),r.child;case 6:return n===null&&Mu(r),null;case 13:return xm(n,r,a);case 4:return Pu(r,r.stateNode.containerInfo),u=r.pendingProps,n===null?r.child=Vs(r,null,u,a):In(n,r,u,a),r.child;case 11:return u=r.type,f=r.pendingProps,f=r.elementType===u?f:_i(u,f),hm(n,r,u,f,a);case 7:return In(n,r,r.pendingProps,a),r.child;case 8:return In(n,r,r.pendingProps.children,a),r.child;case 12:return In(n,r,r.pendingProps.children,a),r.child;case 10:e:{if(u=r.type._context,f=r.pendingProps,g=r.memoizedProps,T=f.value,Ot(ul,u._currentValue),u._currentValue=T,g!==null)if(pi(g.value,T)){if(g.children===f.children&&!On.current){r=Yi(n,r,a);break e}}else for(g=r.child,g!==null&&(g.return=r);g!==null;){var N=g.dependencies;if(N!==null){T=g.child;for(var O=N.firstContext;O!==null;){if(O.context===u){if(g.tag===1){O=Ki(-1,a&-a),O.tag=2;var ie=g.updateQueue;if(ie!==null){ie=ie.shared;var ge=ie.pending;ge===null?O.next=O:(O.next=ge.next,ge.next=O),ie.pending=O}}g.lanes|=a,O=g.alternate,O!==null&&(O.lanes|=a),Au(g.return,a,r),N.lanes|=a;break}O=O.next}}else if(g.tag===10)T=g.type===r.type?null:g.child;else if(g.tag===18){if(T=g.return,T===null)throw Error(t(341));T.lanes|=a,N=T.alternate,N!==null&&(N.lanes|=a),Au(T,a,r),T=g.sibling}else T=g.child;if(T!==null)T.return=g;else for(T=g;T!==null;){if(T===r){T=null;break}if(g=T.sibling,g!==null){g.return=T.return,T=g;break}T=T.return}g=T}In(n,r,f.children,a),r=r.child}return r;case 9:return f=r.type,u=r.pendingProps.children,Gs(r,a),f=ai(f),u=u(f),r.flags|=1,In(n,r,u,a),r.child;case 14:return u=r.type,f=_i(u,r.pendingProps),f=_i(u.type,f),fm(n,r,u,f,a);case 15:return pm(n,r,r.type,r.pendingProps,a);case 17:return u=r.type,f=r.pendingProps,f=r.elementType===u?f:_i(u,f),Ml(n,r),r.tag=1,Bn(u)?(n=!0,rl(r)):n=!1,Gs(r,a),sm(r,u,f),Gu(r,u,f,a),ju(null,r,u,!0,n,a);case 19:return Mm(n,r,a);case 22:return mm(n,r,a)}throw Error(t(156,r.tag))};function Xm(n,r){return ne(n,r)}function Hv(n,r,a,u){this.tag=n,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=r,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=u,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ui(n,r,a,u){return new Hv(n,r,a,u)}function fd(n){return n=n.prototype,!(!n||!n.isReactComponent)}function Gv(n){if(typeof n=="function")return fd(n)?1:0;if(n!=null){if(n=n.$$typeof,n===Q)return 11;if(n===pe)return 14}return 2}function Pr(n,r){var a=n.alternate;return a===null?(a=ui(n.tag,r,n.key,n.mode),a.elementType=n.elementType,a.type=n.type,a.stateNode=n.stateNode,a.alternate=n,n.alternate=a):(a.pendingProps=r,a.type=n.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=n.flags&14680064,a.childLanes=n.childLanes,a.lanes=n.lanes,a.child=n.child,a.memoizedProps=n.memoizedProps,a.memoizedState=n.memoizedState,a.updateQueue=n.updateQueue,r=n.dependencies,a.dependencies=r===null?null:{lanes:r.lanes,firstContext:r.firstContext},a.sibling=n.sibling,a.index=n.index,a.ref=n.ref,a}function Il(n,r,a,u,f,g){var T=2;if(u=n,typeof n=="function")fd(n)&&(T=1);else if(typeof n=="string")T=5;else e:switch(n){case U:return rs(a.children,f,g,r);case V:T=8,f|=8;break;case le:return n=ui(12,a,r,f|2),n.elementType=le,n.lanes=g,n;case J:return n=ui(13,a,r,f),n.elementType=J,n.lanes=g,n;case re:return n=ui(19,a,r,f),n.elementType=re,n.lanes=g,n;case me:return Nl(a,f,g,r);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case w:T=10;break e;case L:T=9;break e;case Q:T=11;break e;case pe:T=14;break e;case ee:T=16,u=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return r=ui(T,a,r,f),r.elementType=n,r.type=u,r.lanes=g,r}function rs(n,r,a,u){return n=ui(7,n,u,r),n.lanes=a,n}function Nl(n,r,a,u){return n=ui(22,n,u,r),n.elementType=me,n.lanes=a,n.stateNode={isHidden:!1},n}function pd(n,r,a){return n=ui(6,n,null,r),n.lanes=a,n}function md(n,r,a){return r=ui(4,n.children!==null?n.children:[],n.key,r),r.lanes=a,r.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},r}function Wv(n,r,a,u,f){this.tag=r,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Uo(0),this.expirationTimes=Uo(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Uo(0),this.identifierPrefix=u,this.onRecoverableError=f,this.mutableSourceEagerHydrationData=null}function _d(n,r,a,u,f,g,T,N,O){return n=new Wv(n,r,a,N,O),r===1?(r=1,g===!0&&(r|=8)):r=0,g=ui(3,null,null,r),n.current=g,g.stateNode=n,g.memoizedState={element:u,isDehydrated:a,cache:null,transitions:null,pendingSuspenseBoundaries:null},Ru(g),n}function qv(n,r,a){var u=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:k,key:u==null?null:""+u,children:n,containerInfo:r,implementation:a}}function jm(n){if(!n)return Sr;n=n._reactInternals;e:{if(Vi(n)!==n||n.tag!==1)throw Error(t(170));var r=n;do{switch(r.tag){case 3:r=r.stateNode.context;break e;case 1:if(Bn(r.type)){r=r.stateNode.__reactInternalMemoizedMergedChildContext;break e}}r=r.return}while(r!==null);throw Error(t(171))}if(n.tag===1){var a=n.type;if(Bn(a))return Sp(n,a,r)}return r}function Km(n,r,a,u,f,g,T,N,O){return n=_d(a,u,!0,n,f,g,T,N,O),n.context=jm(null),a=n.current,u=Nn(),f=Cr(a),g=Ki(u,f),g.callback=r??null,Er(a,g,f),n.current.lanes=f,hr(n,f,u),Hn(n,u),n}function Ul(n,r,a,u){var f=r.current,g=Nn(),T=Cr(f);return a=jm(a),r.context===null?r.context=a:r.pendingContext=a,r=Ki(g,T),r.payload={element:n},u=u===void 0?null:u,u!==null&&(r.callback=u),n=Er(f,r,T),n!==null&&(yi(n,f,T,g),hl(n,f,T)),T}function kl(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Ym(n,r){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var a=n.retryLane;n.retryLane=a!==0&&a<r?a:r}}function gd(n,r){Ym(n,r),(n=n.alternate)&&Ym(n,r)}function Xv(){return null}var $m=typeof reportError=="function"?reportError:function(n){console.error(n)};function vd(n){this._internalRoot=n}Fl.prototype.render=vd.prototype.render=function(n){var r=this._internalRoot;if(r===null)throw Error(t(409));Ul(n,r,null,null)},Fl.prototype.unmount=vd.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var r=n.containerInfo;ts(function(){Ul(null,n,null,null)}),r[Gi]=null}};function Fl(n){this._internalRoot=n}Fl.prototype.unstable_scheduleHydration=function(n){if(n){var r=If();n={blockedOn:null,target:n,priority:r};for(var a=0;a<_r.length&&r!==0&&r<_r[a].priority;a++);_r.splice(a,0,n),a===0&&kf(n)}};function yd(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function Ol(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Qm(){}function jv(n,r,a,u,f){if(f){if(typeof u=="function"){var g=u;u=function(){var ie=kl(T);g.call(ie)}}var T=Km(r,u,n,0,null,!1,!1,"",Qm);return n._reactRootContainer=T,n[Gi]=T.current,Yo(n.nodeType===8?n.parentNode:n),ts(),T}for(;f=n.lastChild;)n.removeChild(f);if(typeof u=="function"){var N=u;u=function(){var ie=kl(O);N.call(ie)}}var O=_d(n,0,!1,null,null,!1,!1,"",Qm);return n._reactRootContainer=O,n[Gi]=O.current,Yo(n.nodeType===8?n.parentNode:n),ts(function(){Ul(r,O,a,u)}),O}function Bl(n,r,a,u,f){var g=a._reactRootContainer;if(g){var T=g;if(typeof f=="function"){var N=f;f=function(){var O=kl(T);N.call(O)}}Ul(r,T,n,f)}else T=jv(a,r,n,f,u);return kl(T)}Lf=function(n){switch(n.tag){case 3:var r=n.stateNode;if(r.current.memoizedState.isDehydrated){var a=Hi(r.pendingLanes);a!==0&&(Gc(r,a|1),Hn(r,Te()),(xt&6)===0&&(Ks=Te()+500,Mr()))}break;case 13:ts(function(){var u=ji(n,1);if(u!==null){var f=Nn();yi(u,n,1,f)}}),gd(n,1)}},Wc=function(n){if(n.tag===13){var r=ji(n,134217728);if(r!==null){var a=Nn();yi(r,n,134217728,a)}gd(n,134217728)}},Df=function(n){if(n.tag===13){var r=Cr(n),a=ji(n,r);if(a!==null){var u=Nn();yi(a,n,r,u)}gd(n,r)}},If=function(){return Pt},Nf=function(n,r){var a=Pt;try{return Pt=n,r()}finally{Pt=a}},oe=function(n,r,a){switch(r){case"input":if(et(n,a),r=a.name,a.type==="radio"&&r!=null){for(a=n;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll("input[name="+JSON.stringify(""+r)+'][type="radio"]'),r=0;r<a.length;r++){var u=a[r];if(u!==n&&u.form===n.form){var f=nl(u);if(!f)throw Error(t(90));ft(u),et(u,f)}}}break;case"textarea":ve(n,a);break;case"select":r=a.value,r!=null&&A(n,!!a.multiple,r,!1)}},yn=ud,vt=ts;var Kv={usingClientEntryPoint:!1,Events:[Jo,Us,nl,mt,Wt,ud]},ha={findFiberByHostInstance:jr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Yv={bundleType:ha.bundleType,version:ha.version,rendererPackageName:ha.rendererPackageName,rendererConfig:ha.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:P.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=q(n),n===null?null:n.stateNode},findFiberByHostInstance:ha.findFiberByHostInstance||Xv,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var zl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!zl.isDisabled&&zl.supportsFiber)try{Ut=zl.inject(Yv),Ht=zl}catch{}}return Gn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Kv,Gn.createPortal=function(n,r){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!yd(r))throw Error(t(200));return qv(n,r,null,a)},Gn.createRoot=function(n,r){if(!yd(n))throw Error(t(299));var a=!1,u="",f=$m;return r!=null&&(r.unstable_strictMode===!0&&(a=!0),r.identifierPrefix!==void 0&&(u=r.identifierPrefix),r.onRecoverableError!==void 0&&(f=r.onRecoverableError)),r=_d(n,1,!1,null,null,a,!1,u,f),n[Gi]=r.current,Yo(n.nodeType===8?n.parentNode:n),new vd(r)},Gn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var r=n._reactInternals;if(r===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=q(r),n=n===null?null:n.stateNode,n},Gn.flushSync=function(n){return ts(n)},Gn.hydrate=function(n,r,a){if(!Ol(r))throw Error(t(200));return Bl(null,n,r,!0,a)},Gn.hydrateRoot=function(n,r,a){if(!yd(n))throw Error(t(405));var u=a!=null&&a.hydratedSources||null,f=!1,g="",T=$m;if(a!=null&&(a.unstable_strictMode===!0&&(f=!0),a.identifierPrefix!==void 0&&(g=a.identifierPrefix),a.onRecoverableError!==void 0&&(T=a.onRecoverableError)),r=Km(r,null,n,1,a??null,f,!1,g,T),n[Gi]=r.current,Yo(n),u)for(n=0;n<u.length;n++)a=u[n],f=a._getVersion,f=f(a._source),r.mutableSourceEagerHydrationData==null?r.mutableSourceEagerHydrationData=[a,f]:r.mutableSourceEagerHydrationData.push(a,f);return new Fl(r)},Gn.render=function(n,r,a){if(!Ol(r))throw Error(t(200));return Bl(null,n,r,!1,a)},Gn.unmountComponentAtNode=function(n){if(!Ol(n))throw Error(t(40));return n._reactRootContainer?(ts(function(){Bl(null,null,n,!1,function(){n._reactRootContainer=null,n[Gi]=null})}),!0):!1},Gn.unstable_batchedUpdates=ud,Gn.unstable_renderSubtreeIntoContainer=function(n,r,a,u){if(!Ol(a))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return Bl(n,r,a,!1,u)},Gn.version="18.3.1-next-f1338f8080-20240426",Gn}var s0;function ry(){if(s0)return Md.exports;s0=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(e){console.error(e)}}return s(),Md.exports=iy(),Md.exports}var o0;function sy(){if(o0)return Vl;o0=1;var s=ry();return Vl.createRoot=s.createRoot,Vl.hydrateRoot=s.hydrateRoot,Vl}var oy=sy();const ay=M_(oy);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const of="169",ly=0,a0=1,cy=2,w_=1,E_=2,nr=3,Gr=0,Fn=1,Ti=2,or=0,vo=1,Cc=2,l0=3,c0=4,uy=5,ps=100,dy=101,hy=102,fy=103,py=104,my=200,_y=201,gy=202,vy=203,uh=204,dh=205,yy=206,xy=207,Sy=208,My=209,wy=210,Ey=211,Ty=212,by=213,Ay=214,hh=0,fh=1,ph=2,So=3,mh=4,_h=5,gh=6,vh=7,T_=0,Cy=1,Ry=2,Hr=0,b_=1,A_=2,C_=3,af=4,Py=5,R_=6,P_=7,L_=300,Mo=301,wo=302,yh=303,xh=304,Oc=306,Sh=1e3,_s=1001,Mh=1002,Xn=1003,Ly=1004,Hl=1005,bi=1006,Td=1007,gs=1008,cr=1009,D_=1010,I_=1011,La=1012,lf=1013,xs=1014,ki=1015,ar=1016,cf=1017,uf=1018,Eo=1020,N_=35902,U_=1021,k_=1022,Ci=1023,F_=1024,O_=1025,yo=1026,To=1027,df=1028,hf=1029,B_=1030,ff=1031,pf=1033,xc=33776,Sc=33777,Mc=33778,wc=33779,wh=35840,Eh=35841,Th=35842,bh=35843,Ah=36196,Ch=37492,Rh=37496,Ph=37808,Lh=37809,Dh=37810,Ih=37811,Nh=37812,Uh=37813,kh=37814,Fh=37815,Oh=37816,Bh=37817,zh=37818,Vh=37819,Hh=37820,Gh=37821,Ec=36492,Wh=36494,qh=36495,z_=36283,Xh=36284,jh=36285,Kh=36286,Dy=3200,Iy=3201,V_=0,Ny=1,zr="",wi="srgb",Wr="srgb-linear",mf="display-p3",Bc="display-p3-linear",Rc="linear",Bt="srgb",Pc="rec709",Lc="p3",$s=7680,u0=519,Uy=512,ky=513,Fy=514,H_=515,Oy=516,By=517,zy=518,Vy=519,Yh=35044,d0="300 es",ir=2e3,Dc=2001;class Po{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const o=this._listeners[e];if(o!==void 0){const l=o.indexOf(t);l!==-1&&o.splice(l,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const o=i.slice(0);for(let l=0,c=o.length;l<c;l++)o[l].call(this,e);e.target=null}}}const An=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let h0=1234567;const Aa=Math.PI/180,Da=180/Math.PI;function lr(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(An[s&255]+An[s>>8&255]+An[s>>16&255]+An[s>>24&255]+"-"+An[e&255]+An[e>>8&255]+"-"+An[e>>16&15|64]+An[e>>24&255]+"-"+An[t&63|128]+An[t>>8&255]+"-"+An[t>>16&255]+An[t>>24&255]+An[i&255]+An[i>>8&255]+An[i>>16&255]+An[i>>24&255]).toLowerCase()}function mn(s,e,t){return Math.max(e,Math.min(t,s))}function _f(s,e){return(s%e+e)%e}function Hy(s,e,t,i,o){return i+(s-e)*(o-i)/(t-e)}function Gy(s,e,t){return s!==e?(t-s)/(e-s):0}function Ca(s,e,t){return(1-t)*s+t*e}function Wy(s,e,t,i){return Ca(s,e,1-Math.exp(-t*i))}function qy(s,e=1){return e-Math.abs(_f(s,e*2)-e)}function Xy(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function jy(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Ky(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Yy(s,e){return s+Math.random()*(e-s)}function $y(s){return s*(.5-Math.random())}function Qy(s){s!==void 0&&(h0=s);let e=h0+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Jy(s){return s*Aa}function Zy(s){return s*Da}function ex(s){return(s&s-1)===0&&s!==0}function tx(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function nx(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function ix(s,e,t,i,o){const l=Math.cos,c=Math.sin,d=l(t/2),h=c(t/2),p=l((e+i)/2),m=c((e+i)/2),_=l((e-i)/2),v=c((e-i)/2),S=l((i-e)/2),M=c((i-e)/2);switch(o){case"XYX":s.set(d*m,h*_,h*v,d*p);break;case"YZY":s.set(h*v,d*m,h*_,d*p);break;case"ZXZ":s.set(h*_,h*v,d*m,d*p);break;case"XZX":s.set(d*m,h*M,h*S,d*p);break;case"YXY":s.set(h*S,d*m,h*M,d*p);break;case"ZYZ":s.set(h*M,h*S,d*m,d*p);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+o)}}function Ai(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Lt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const bd={DEG2RAD:Aa,RAD2DEG:Da,generateUUID:lr,clamp:mn,euclideanModulo:_f,mapLinear:Hy,inverseLerp:Gy,lerp:Ca,damp:Wy,pingpong:qy,smoothstep:Xy,smootherstep:jy,randInt:Ky,randFloat:Yy,randFloatSpread:$y,seededRandom:Qy,degToRad:Jy,radToDeg:Zy,isPowerOfTwo:ex,ceilPowerOfTwo:tx,floorPowerOfTwo:nx,setQuaternionFromProperEuler:ix,normalize:Lt,denormalize:Ai};class Pe{constructor(e=0,t=0){Pe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,o=e.elements;return this.x=o[0]*t+o[3]*i+o[6],this.y=o[1]*t+o[4]*i+o[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(mn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),o=Math.sin(t),l=this.x-e.x,c=this.y-e.y;return this.x=l*i-c*o+e.x,this.y=l*o+c*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ct{constructor(e,t,i,o,l,c,d,h,p){ct.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,o,l,c,d,h,p)}set(e,t,i,o,l,c,d,h,p){const m=this.elements;return m[0]=e,m[1]=o,m[2]=d,m[3]=t,m[4]=l,m[5]=h,m[6]=i,m[7]=c,m[8]=p,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,o=t.elements,l=this.elements,c=i[0],d=i[3],h=i[6],p=i[1],m=i[4],_=i[7],v=i[2],S=i[5],M=i[8],E=o[0],x=o[3],y=o[6],C=o[1],b=o[4],P=o[7],G=o[2],k=o[5],U=o[8];return l[0]=c*E+d*C+h*G,l[3]=c*x+d*b+h*k,l[6]=c*y+d*P+h*U,l[1]=p*E+m*C+_*G,l[4]=p*x+m*b+_*k,l[7]=p*y+m*P+_*U,l[2]=v*E+S*C+M*G,l[5]=v*x+S*b+M*k,l[8]=v*y+S*P+M*U,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],o=e[2],l=e[3],c=e[4],d=e[5],h=e[6],p=e[7],m=e[8];return t*c*m-t*d*p-i*l*m+i*d*h+o*l*p-o*c*h}invert(){const e=this.elements,t=e[0],i=e[1],o=e[2],l=e[3],c=e[4],d=e[5],h=e[6],p=e[7],m=e[8],_=m*c-d*p,v=d*h-m*l,S=p*l-c*h,M=t*_+i*v+o*S;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);const E=1/M;return e[0]=_*E,e[1]=(o*p-m*i)*E,e[2]=(d*i-o*c)*E,e[3]=v*E,e[4]=(m*t-o*h)*E,e[5]=(o*l-d*t)*E,e[6]=S*E,e[7]=(i*h-p*t)*E,e[8]=(c*t-i*l)*E,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,o,l,c,d){const h=Math.cos(l),p=Math.sin(l);return this.set(i*h,i*p,-i*(h*c+p*d)+c+e,-o*p,o*h,-o*(-p*c+h*d)+d+t,0,0,1),this}scale(e,t){return this.premultiply(Ad.makeScale(e,t)),this}rotate(e){return this.premultiply(Ad.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ad.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let o=0;o<9;o++)if(t[o]!==i[o])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ad=new ct;function G_(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Ic(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function rx(){const s=Ic("canvas");return s.style.display="block",s}const f0={};function Tc(s){s in f0||(f0[s]=!0,console.warn(s))}function sx(s,e,t){return new Promise(function(i,o){function l(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:o();break;case s.TIMEOUT_EXPIRED:setTimeout(l,t);break;default:i()}}setTimeout(l,t)})}function ox(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function ax(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const p0=new ct().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),m0=new ct().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),pa={[Wr]:{transfer:Rc,primaries:Pc,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s,fromReference:s=>s},[wi]:{transfer:Bt,primaries:Pc,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s.convertSRGBToLinear(),fromReference:s=>s.convertLinearToSRGB()},[Bc]:{transfer:Rc,primaries:Lc,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.applyMatrix3(m0),fromReference:s=>s.applyMatrix3(p0)},[mf]:{transfer:Bt,primaries:Lc,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.convertSRGBToLinear().applyMatrix3(m0),fromReference:s=>s.applyMatrix3(p0).convertLinearToSRGB()}},lx=new Set([Wr,Bc]),Tt={enabled:!0,_workingColorSpace:Wr,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(s){if(!lx.has(s))throw new Error(`Unsupported working color space, "${s}".`);this._workingColorSpace=s},convert:function(s,e,t){if(this.enabled===!1||e===t||!e||!t)return s;const i=pa[e].toReference,o=pa[t].fromReference;return o(i(s))},fromWorkingColorSpace:function(s,e){return this.convert(s,this._workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this._workingColorSpace)},getPrimaries:function(s){return pa[s].primaries},getTransfer:function(s){return s===zr?Rc:pa[s].transfer},getLuminanceCoefficients:function(s,e=this._workingColorSpace){return s.fromArray(pa[e].luminanceCoefficients)}};function xo(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Cd(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Qs;class cx{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Qs===void 0&&(Qs=Ic("canvas")),Qs.width=e.width,Qs.height=e.height;const i=Qs.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Qs}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ic("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const o=i.getImageData(0,0,e.width,e.height),l=o.data;for(let c=0;c<l.length;c++)l[c]=xo(l[c]/255)*255;return i.putImageData(o,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(xo(t[i]/255)*255):t[i]=xo(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let ux=0;class W_{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ux++}),this.uuid=lr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},o=this.data;if(o!==null){let l;if(Array.isArray(o)){l=[];for(let c=0,d=o.length;c<d;c++)o[c].isDataTexture?l.push(Rd(o[c].image)):l.push(Rd(o[c]))}else l=Rd(o);i.url=l}return t||(e.images[this.uuid]=i),i}}function Rd(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?cx.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let dx=0;class Dn extends Po{constructor(e=Dn.DEFAULT_IMAGE,t=Dn.DEFAULT_MAPPING,i=_s,o=_s,l=bi,c=gs,d=Ci,h=cr,p=Dn.DEFAULT_ANISOTROPY,m=zr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dx++}),this.uuid=lr(),this.name="",this.source=new W_(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=o,this.magFilter=l,this.minFilter=c,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=h,this.offset=new Pe(0,0),this.repeat=new Pe(1,1),this.center=new Pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ct,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==L_)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Sh:e.x=e.x-Math.floor(e.x);break;case _s:e.x=e.x<0?0:1;break;case Mh:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Sh:e.y=e.y-Math.floor(e.y);break;case _s:e.y=e.y<0?0:1;break;case Mh:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Dn.DEFAULT_IMAGE=null;Dn.DEFAULT_MAPPING=L_;Dn.DEFAULT_ANISOTROPY=1;class Nt{constructor(e=0,t=0,i=0,o=1){Nt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=o}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,o){return this.x=e,this.y=t,this.z=i,this.w=o,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,o=this.z,l=this.w,c=e.elements;return this.x=c[0]*t+c[4]*i+c[8]*o+c[12]*l,this.y=c[1]*t+c[5]*i+c[9]*o+c[13]*l,this.z=c[2]*t+c[6]*i+c[10]*o+c[14]*l,this.w=c[3]*t+c[7]*i+c[11]*o+c[15]*l,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,o,l;const h=e.elements,p=h[0],m=h[4],_=h[8],v=h[1],S=h[5],M=h[9],E=h[2],x=h[6],y=h[10];if(Math.abs(m-v)<.01&&Math.abs(_-E)<.01&&Math.abs(M-x)<.01){if(Math.abs(m+v)<.1&&Math.abs(_+E)<.1&&Math.abs(M+x)<.1&&Math.abs(p+S+y-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(p+1)/2,P=(S+1)/2,G=(y+1)/2,k=(m+v)/4,U=(_+E)/4,V=(M+x)/4;return b>P&&b>G?b<.01?(i=0,o=.707106781,l=.707106781):(i=Math.sqrt(b),o=k/i,l=U/i):P>G?P<.01?(i=.707106781,o=0,l=.707106781):(o=Math.sqrt(P),i=k/o,l=V/o):G<.01?(i=.707106781,o=.707106781,l=0):(l=Math.sqrt(G),i=U/l,o=V/l),this.set(i,o,l,t),this}let C=Math.sqrt((x-M)*(x-M)+(_-E)*(_-E)+(v-m)*(v-m));return Math.abs(C)<.001&&(C=1),this.x=(x-M)/C,this.y=(_-E)/C,this.z=(v-m)/C,this.w=Math.acos((p+S+y-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class hx extends Po{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Nt(0,0,e,t),this.scissorTest=!1,this.viewport=new Nt(0,0,e,t);const o={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:bi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const l=new Dn(o,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);l.flipY=!1,l.generateMipmaps=i.generateMipmaps,l.internalFormat=i.internalFormat,this.textures=[];const c=i.count;for(let d=0;d<c;d++)this.textures[d]=l.clone(),this.textures[d].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let o=0,l=this.textures.length;o<l;o++)this.textures[o].image.width=e,this.textures[o].image.height=t,this.textures[o].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,o=e.textures.length;i<o;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new W_(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ri extends hx{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class q_ extends Dn{constructor(e=null,t=1,i=1,o=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:o},this.magFilter=Xn,this.minFilter=Xn,this.wrapR=_s,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class fx extends Dn{constructor(e=null,t=1,i=1,o=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:o},this.magFilter=Xn,this.minFilter=Xn,this.wrapR=_s,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ua{constructor(e=0,t=0,i=0,o=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=o}static slerpFlat(e,t,i,o,l,c,d){let h=i[o+0],p=i[o+1],m=i[o+2],_=i[o+3];const v=l[c+0],S=l[c+1],M=l[c+2],E=l[c+3];if(d===0){e[t+0]=h,e[t+1]=p,e[t+2]=m,e[t+3]=_;return}if(d===1){e[t+0]=v,e[t+1]=S,e[t+2]=M,e[t+3]=E;return}if(_!==E||h!==v||p!==S||m!==M){let x=1-d;const y=h*v+p*S+m*M+_*E,C=y>=0?1:-1,b=1-y*y;if(b>Number.EPSILON){const G=Math.sqrt(b),k=Math.atan2(G,y*C);x=Math.sin(x*k)/G,d=Math.sin(d*k)/G}const P=d*C;if(h=h*x+v*P,p=p*x+S*P,m=m*x+M*P,_=_*x+E*P,x===1-d){const G=1/Math.sqrt(h*h+p*p+m*m+_*_);h*=G,p*=G,m*=G,_*=G}}e[t]=h,e[t+1]=p,e[t+2]=m,e[t+3]=_}static multiplyQuaternionsFlat(e,t,i,o,l,c){const d=i[o],h=i[o+1],p=i[o+2],m=i[o+3],_=l[c],v=l[c+1],S=l[c+2],M=l[c+3];return e[t]=d*M+m*_+h*S-p*v,e[t+1]=h*M+m*v+p*_-d*S,e[t+2]=p*M+m*S+d*v-h*_,e[t+3]=m*M-d*_-h*v-p*S,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,o){return this._x=e,this._y=t,this._z=i,this._w=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,o=e._y,l=e._z,c=e._order,d=Math.cos,h=Math.sin,p=d(i/2),m=d(o/2),_=d(l/2),v=h(i/2),S=h(o/2),M=h(l/2);switch(c){case"XYZ":this._x=v*m*_+p*S*M,this._y=p*S*_-v*m*M,this._z=p*m*M+v*S*_,this._w=p*m*_-v*S*M;break;case"YXZ":this._x=v*m*_+p*S*M,this._y=p*S*_-v*m*M,this._z=p*m*M-v*S*_,this._w=p*m*_+v*S*M;break;case"ZXY":this._x=v*m*_-p*S*M,this._y=p*S*_+v*m*M,this._z=p*m*M+v*S*_,this._w=p*m*_-v*S*M;break;case"ZYX":this._x=v*m*_-p*S*M,this._y=p*S*_+v*m*M,this._z=p*m*M-v*S*_,this._w=p*m*_+v*S*M;break;case"YZX":this._x=v*m*_+p*S*M,this._y=p*S*_+v*m*M,this._z=p*m*M-v*S*_,this._w=p*m*_-v*S*M;break;case"XZY":this._x=v*m*_-p*S*M,this._y=p*S*_-v*m*M,this._z=p*m*M+v*S*_,this._w=p*m*_+v*S*M;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,o=Math.sin(i);return this._x=e.x*o,this._y=e.y*o,this._z=e.z*o,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],o=t[4],l=t[8],c=t[1],d=t[5],h=t[9],p=t[2],m=t[6],_=t[10],v=i+d+_;if(v>0){const S=.5/Math.sqrt(v+1);this._w=.25/S,this._x=(m-h)*S,this._y=(l-p)*S,this._z=(c-o)*S}else if(i>d&&i>_){const S=2*Math.sqrt(1+i-d-_);this._w=(m-h)/S,this._x=.25*S,this._y=(o+c)/S,this._z=(l+p)/S}else if(d>_){const S=2*Math.sqrt(1+d-i-_);this._w=(l-p)/S,this._x=(o+c)/S,this._y=.25*S,this._z=(h+m)/S}else{const S=2*Math.sqrt(1+_-i-d);this._w=(c-o)/S,this._x=(l+p)/S,this._y=(h+m)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(mn(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const o=Math.min(1,t/i);return this.slerp(e,o),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,o=e._y,l=e._z,c=e._w,d=t._x,h=t._y,p=t._z,m=t._w;return this._x=i*m+c*d+o*p-l*h,this._y=o*m+c*h+l*d-i*p,this._z=l*m+c*p+i*h-o*d,this._w=c*m-i*d-o*h-l*p,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,o=this._y,l=this._z,c=this._w;let d=c*e._w+i*e._x+o*e._y+l*e._z;if(d<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,d=-d):this.copy(e),d>=1)return this._w=c,this._x=i,this._y=o,this._z=l,this;const h=1-d*d;if(h<=Number.EPSILON){const S=1-t;return this._w=S*c+t*this._w,this._x=S*i+t*this._x,this._y=S*o+t*this._y,this._z=S*l+t*this._z,this.normalize(),this}const p=Math.sqrt(h),m=Math.atan2(p,d),_=Math.sin((1-t)*m)/p,v=Math.sin(t*m)/p;return this._w=c*_+this._w*v,this._x=i*_+this._x*v,this._y=o*_+this._y*v,this._z=l*_+this._z*v,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),o=Math.sqrt(1-i),l=Math.sqrt(i);return this.set(o*Math.sin(e),o*Math.cos(e),l*Math.sin(t),l*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(e=0,t=0,i=0){I.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(_0.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(_0.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,o=this.z,l=e.elements;return this.x=l[0]*t+l[3]*i+l[6]*o,this.y=l[1]*t+l[4]*i+l[7]*o,this.z=l[2]*t+l[5]*i+l[8]*o,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,o=this.z,l=e.elements,c=1/(l[3]*t+l[7]*i+l[11]*o+l[15]);return this.x=(l[0]*t+l[4]*i+l[8]*o+l[12])*c,this.y=(l[1]*t+l[5]*i+l[9]*o+l[13])*c,this.z=(l[2]*t+l[6]*i+l[10]*o+l[14])*c,this}applyQuaternion(e){const t=this.x,i=this.y,o=this.z,l=e.x,c=e.y,d=e.z,h=e.w,p=2*(c*o-d*i),m=2*(d*t-l*o),_=2*(l*i-c*t);return this.x=t+h*p+c*_-d*m,this.y=i+h*m+d*p-l*_,this.z=o+h*_+l*m-c*p,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,o=this.z,l=e.elements;return this.x=l[0]*t+l[4]*i+l[8]*o,this.y=l[1]*t+l[5]*i+l[9]*o,this.z=l[2]*t+l[6]*i+l[10]*o,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,o=e.y,l=e.z,c=t.x,d=t.y,h=t.z;return this.x=o*h-l*d,this.y=l*c-i*h,this.z=i*d-o*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Pd.copy(this).projectOnVector(e),this.sub(Pd)}reflect(e){return this.sub(Pd.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(mn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,o=this.z-e.z;return t*t+i*i+o*o}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const o=Math.sin(t)*e;return this.x=o*Math.sin(i),this.y=Math.cos(t)*e,this.z=o*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),o=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=o,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Pd=new I,_0=new Ua;class Ss{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(xi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(xi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=xi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const l=i.getAttribute("position");if(t===!0&&l!==void 0&&e.isInstancedMesh!==!0)for(let c=0,d=l.count;c<d;c++)e.isMesh===!0?e.getVertexPosition(c,xi):xi.fromBufferAttribute(l,c),xi.applyMatrix4(e.matrixWorld),this.expandByPoint(xi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Gl.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Gl.copy(i.boundingBox)),Gl.applyMatrix4(e.matrixWorld),this.union(Gl)}const o=e.children;for(let l=0,c=o.length;l<c;l++)this.expandByObject(o[l],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,xi),xi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ma),Wl.subVectors(this.max,ma),Js.subVectors(e.a,ma),Zs.subVectors(e.b,ma),eo.subVectors(e.c,ma),Dr.subVectors(Zs,Js),Ir.subVectors(eo,Zs),ss.subVectors(Js,eo);let t=[0,-Dr.z,Dr.y,0,-Ir.z,Ir.y,0,-ss.z,ss.y,Dr.z,0,-Dr.x,Ir.z,0,-Ir.x,ss.z,0,-ss.x,-Dr.y,Dr.x,0,-Ir.y,Ir.x,0,-ss.y,ss.x,0];return!Ld(t,Js,Zs,eo,Wl)||(t=[1,0,0,0,1,0,0,0,1],!Ld(t,Js,Zs,eo,Wl))?!1:(ql.crossVectors(Dr,Ir),t=[ql.x,ql.y,ql.z],Ld(t,Js,Zs,eo,Wl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,xi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(xi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Qi=[new I,new I,new I,new I,new I,new I,new I,new I],xi=new I,Gl=new Ss,Js=new I,Zs=new I,eo=new I,Dr=new I,Ir=new I,ss=new I,ma=new I,Wl=new I,ql=new I,os=new I;function Ld(s,e,t,i,o){for(let l=0,c=s.length-3;l<=c;l+=3){os.fromArray(s,l);const d=o.x*Math.abs(os.x)+o.y*Math.abs(os.y)+o.z*Math.abs(os.z),h=e.dot(os),p=t.dot(os),m=i.dot(os);if(Math.max(-Math.max(h,p,m),Math.min(h,p,m))>d)return!1}return!0}const px=new Ss,_a=new I,Dd=new I;class Ms{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):px.setFromPoints(e).getCenter(i);let o=0;for(let l=0,c=e.length;l<c;l++)o=Math.max(o,i.distanceToSquared(e[l]));return this.radius=Math.sqrt(o),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;_a.subVectors(e,this.center);const t=_a.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),o=(i-this.radius)*.5;this.center.addScaledVector(_a,o/i),this.radius+=o}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Dd.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(_a.copy(e.center).add(Dd)),this.expandByPoint(_a.copy(e.center).sub(Dd))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ji=new I,Id=new I,Xl=new I,Nr=new I,Nd=new I,jl=new I,Ud=new I;class zc{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ji)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ji.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ji.copy(this.origin).addScaledVector(this.direction,t),Ji.distanceToSquared(e))}distanceSqToSegment(e,t,i,o){Id.copy(e).add(t).multiplyScalar(.5),Xl.copy(t).sub(e).normalize(),Nr.copy(this.origin).sub(Id);const l=e.distanceTo(t)*.5,c=-this.direction.dot(Xl),d=Nr.dot(this.direction),h=-Nr.dot(Xl),p=Nr.lengthSq(),m=Math.abs(1-c*c);let _,v,S,M;if(m>0)if(_=c*h-d,v=c*d-h,M=l*m,_>=0)if(v>=-M)if(v<=M){const E=1/m;_*=E,v*=E,S=_*(_+c*v+2*d)+v*(c*_+v+2*h)+p}else v=l,_=Math.max(0,-(c*v+d)),S=-_*_+v*(v+2*h)+p;else v=-l,_=Math.max(0,-(c*v+d)),S=-_*_+v*(v+2*h)+p;else v<=-M?(_=Math.max(0,-(-c*l+d)),v=_>0?-l:Math.min(Math.max(-l,-h),l),S=-_*_+v*(v+2*h)+p):v<=M?(_=0,v=Math.min(Math.max(-l,-h),l),S=v*(v+2*h)+p):(_=Math.max(0,-(c*l+d)),v=_>0?l:Math.min(Math.max(-l,-h),l),S=-_*_+v*(v+2*h)+p);else v=c>0?-l:l,_=Math.max(0,-(c*v+d)),S=-_*_+v*(v+2*h)+p;return i&&i.copy(this.origin).addScaledVector(this.direction,_),o&&o.copy(Id).addScaledVector(Xl,v),S}intersectSphere(e,t){Ji.subVectors(e.center,this.origin);const i=Ji.dot(this.direction),o=Ji.dot(Ji)-i*i,l=e.radius*e.radius;if(o>l)return null;const c=Math.sqrt(l-o),d=i-c,h=i+c;return h<0?null:d<0?this.at(h,t):this.at(d,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,o,l,c,d,h;const p=1/this.direction.x,m=1/this.direction.y,_=1/this.direction.z,v=this.origin;return p>=0?(i=(e.min.x-v.x)*p,o=(e.max.x-v.x)*p):(i=(e.max.x-v.x)*p,o=(e.min.x-v.x)*p),m>=0?(l=(e.min.y-v.y)*m,c=(e.max.y-v.y)*m):(l=(e.max.y-v.y)*m,c=(e.min.y-v.y)*m),i>c||l>o||((l>i||isNaN(i))&&(i=l),(c<o||isNaN(o))&&(o=c),_>=0?(d=(e.min.z-v.z)*_,h=(e.max.z-v.z)*_):(d=(e.max.z-v.z)*_,h=(e.min.z-v.z)*_),i>h||d>o)||((d>i||i!==i)&&(i=d),(h<o||o!==o)&&(o=h),o<0)?null:this.at(i>=0?i:o,t)}intersectsBox(e){return this.intersectBox(e,Ji)!==null}intersectTriangle(e,t,i,o,l){Nd.subVectors(t,e),jl.subVectors(i,e),Ud.crossVectors(Nd,jl);let c=this.direction.dot(Ud),d;if(c>0){if(o)return null;d=1}else if(c<0)d=-1,c=-c;else return null;Nr.subVectors(this.origin,e);const h=d*this.direction.dot(jl.crossVectors(Nr,jl));if(h<0)return null;const p=d*this.direction.dot(Nd.cross(Nr));if(p<0||h+p>c)return null;const m=-d*Nr.dot(Ud);return m<0?null:this.at(m/c,l)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class At{constructor(e,t,i,o,l,c,d,h,p,m,_,v,S,M,E,x){At.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,o,l,c,d,h,p,m,_,v,S,M,E,x)}set(e,t,i,o,l,c,d,h,p,m,_,v,S,M,E,x){const y=this.elements;return y[0]=e,y[4]=t,y[8]=i,y[12]=o,y[1]=l,y[5]=c,y[9]=d,y[13]=h,y[2]=p,y[6]=m,y[10]=_,y[14]=v,y[3]=S,y[7]=M,y[11]=E,y[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new At().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,o=1/to.setFromMatrixColumn(e,0).length(),l=1/to.setFromMatrixColumn(e,1).length(),c=1/to.setFromMatrixColumn(e,2).length();return t[0]=i[0]*o,t[1]=i[1]*o,t[2]=i[2]*o,t[3]=0,t[4]=i[4]*l,t[5]=i[5]*l,t[6]=i[6]*l,t[7]=0,t[8]=i[8]*c,t[9]=i[9]*c,t[10]=i[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,o=e.y,l=e.z,c=Math.cos(i),d=Math.sin(i),h=Math.cos(o),p=Math.sin(o),m=Math.cos(l),_=Math.sin(l);if(e.order==="XYZ"){const v=c*m,S=c*_,M=d*m,E=d*_;t[0]=h*m,t[4]=-h*_,t[8]=p,t[1]=S+M*p,t[5]=v-E*p,t[9]=-d*h,t[2]=E-v*p,t[6]=M+S*p,t[10]=c*h}else if(e.order==="YXZ"){const v=h*m,S=h*_,M=p*m,E=p*_;t[0]=v+E*d,t[4]=M*d-S,t[8]=c*p,t[1]=c*_,t[5]=c*m,t[9]=-d,t[2]=S*d-M,t[6]=E+v*d,t[10]=c*h}else if(e.order==="ZXY"){const v=h*m,S=h*_,M=p*m,E=p*_;t[0]=v-E*d,t[4]=-c*_,t[8]=M+S*d,t[1]=S+M*d,t[5]=c*m,t[9]=E-v*d,t[2]=-c*p,t[6]=d,t[10]=c*h}else if(e.order==="ZYX"){const v=c*m,S=c*_,M=d*m,E=d*_;t[0]=h*m,t[4]=M*p-S,t[8]=v*p+E,t[1]=h*_,t[5]=E*p+v,t[9]=S*p-M,t[2]=-p,t[6]=d*h,t[10]=c*h}else if(e.order==="YZX"){const v=c*h,S=c*p,M=d*h,E=d*p;t[0]=h*m,t[4]=E-v*_,t[8]=M*_+S,t[1]=_,t[5]=c*m,t[9]=-d*m,t[2]=-p*m,t[6]=S*_+M,t[10]=v-E*_}else if(e.order==="XZY"){const v=c*h,S=c*p,M=d*h,E=d*p;t[0]=h*m,t[4]=-_,t[8]=p*m,t[1]=v*_+E,t[5]=c*m,t[9]=S*_-M,t[2]=M*_-S,t[6]=d*m,t[10]=E*_+v}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(mx,e,_x)}lookAt(e,t,i){const o=this.elements;return ei.subVectors(e,t),ei.lengthSq()===0&&(ei.z=1),ei.normalize(),Ur.crossVectors(i,ei),Ur.lengthSq()===0&&(Math.abs(i.z)===1?ei.x+=1e-4:ei.z+=1e-4,ei.normalize(),Ur.crossVectors(i,ei)),Ur.normalize(),Kl.crossVectors(ei,Ur),o[0]=Ur.x,o[4]=Kl.x,o[8]=ei.x,o[1]=Ur.y,o[5]=Kl.y,o[9]=ei.y,o[2]=Ur.z,o[6]=Kl.z,o[10]=ei.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,o=t.elements,l=this.elements,c=i[0],d=i[4],h=i[8],p=i[12],m=i[1],_=i[5],v=i[9],S=i[13],M=i[2],E=i[6],x=i[10],y=i[14],C=i[3],b=i[7],P=i[11],G=i[15],k=o[0],U=o[4],V=o[8],le=o[12],w=o[1],L=o[5],Q=o[9],J=o[13],re=o[2],pe=o[6],ee=o[10],me=o[14],z=o[3],ue=o[7],ae=o[11],F=o[15];return l[0]=c*k+d*w+h*re+p*z,l[4]=c*U+d*L+h*pe+p*ue,l[8]=c*V+d*Q+h*ee+p*ae,l[12]=c*le+d*J+h*me+p*F,l[1]=m*k+_*w+v*re+S*z,l[5]=m*U+_*L+v*pe+S*ue,l[9]=m*V+_*Q+v*ee+S*ae,l[13]=m*le+_*J+v*me+S*F,l[2]=M*k+E*w+x*re+y*z,l[6]=M*U+E*L+x*pe+y*ue,l[10]=M*V+E*Q+x*ee+y*ae,l[14]=M*le+E*J+x*me+y*F,l[3]=C*k+b*w+P*re+G*z,l[7]=C*U+b*L+P*pe+G*ue,l[11]=C*V+b*Q+P*ee+G*ae,l[15]=C*le+b*J+P*me+G*F,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],o=e[8],l=e[12],c=e[1],d=e[5],h=e[9],p=e[13],m=e[2],_=e[6],v=e[10],S=e[14],M=e[3],E=e[7],x=e[11],y=e[15];return M*(+l*h*_-o*p*_-l*d*v+i*p*v+o*d*S-i*h*S)+E*(+t*h*S-t*p*v+l*c*v-o*c*S+o*p*m-l*h*m)+x*(+t*p*_-t*d*S-l*c*_+i*c*S+l*d*m-i*p*m)+y*(-o*d*m-t*h*_+t*d*v+o*c*_-i*c*v+i*h*m)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const o=this.elements;return e.isVector3?(o[12]=e.x,o[13]=e.y,o[14]=e.z):(o[12]=e,o[13]=t,o[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],o=e[2],l=e[3],c=e[4],d=e[5],h=e[6],p=e[7],m=e[8],_=e[9],v=e[10],S=e[11],M=e[12],E=e[13],x=e[14],y=e[15],C=_*x*p-E*v*p+E*h*S-d*x*S-_*h*y+d*v*y,b=M*v*p-m*x*p-M*h*S+c*x*S+m*h*y-c*v*y,P=m*E*p-M*_*p+M*d*S-c*E*S-m*d*y+c*_*y,G=M*_*h-m*E*h-M*d*v+c*E*v+m*d*x-c*_*x,k=t*C+i*b+o*P+l*G;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const U=1/k;return e[0]=C*U,e[1]=(E*v*l-_*x*l-E*o*S+i*x*S+_*o*y-i*v*y)*U,e[2]=(d*x*l-E*h*l+E*o*p-i*x*p-d*o*y+i*h*y)*U,e[3]=(_*h*l-d*v*l-_*o*p+i*v*p+d*o*S-i*h*S)*U,e[4]=b*U,e[5]=(m*x*l-M*v*l+M*o*S-t*x*S-m*o*y+t*v*y)*U,e[6]=(M*h*l-c*x*l-M*o*p+t*x*p+c*o*y-t*h*y)*U,e[7]=(c*v*l-m*h*l+m*o*p-t*v*p-c*o*S+t*h*S)*U,e[8]=P*U,e[9]=(M*_*l-m*E*l-M*i*S+t*E*S+m*i*y-t*_*y)*U,e[10]=(c*E*l-M*d*l+M*i*p-t*E*p-c*i*y+t*d*y)*U,e[11]=(m*d*l-c*_*l-m*i*p+t*_*p+c*i*S-t*d*S)*U,e[12]=G*U,e[13]=(m*E*o-M*_*o+M*i*v-t*E*v-m*i*x+t*_*x)*U,e[14]=(M*d*o-c*E*o-M*i*h+t*E*h+c*i*x-t*d*x)*U,e[15]=(c*_*o-m*d*o+m*i*h-t*_*h-c*i*v+t*d*v)*U,this}scale(e){const t=this.elements,i=e.x,o=e.y,l=e.z;return t[0]*=i,t[4]*=o,t[8]*=l,t[1]*=i,t[5]*=o,t[9]*=l,t[2]*=i,t[6]*=o,t[10]*=l,t[3]*=i,t[7]*=o,t[11]*=l,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],o=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,o))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),o=Math.sin(t),l=1-i,c=e.x,d=e.y,h=e.z,p=l*c,m=l*d;return this.set(p*c+i,p*d-o*h,p*h+o*d,0,p*d+o*h,m*d+i,m*h-o*c,0,p*h-o*d,m*h+o*c,l*h*h+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,o,l,c){return this.set(1,i,l,0,e,1,c,0,t,o,1,0,0,0,0,1),this}compose(e,t,i){const o=this.elements,l=t._x,c=t._y,d=t._z,h=t._w,p=l+l,m=c+c,_=d+d,v=l*p,S=l*m,M=l*_,E=c*m,x=c*_,y=d*_,C=h*p,b=h*m,P=h*_,G=i.x,k=i.y,U=i.z;return o[0]=(1-(E+y))*G,o[1]=(S+P)*G,o[2]=(M-b)*G,o[3]=0,o[4]=(S-P)*k,o[5]=(1-(v+y))*k,o[6]=(x+C)*k,o[7]=0,o[8]=(M+b)*U,o[9]=(x-C)*U,o[10]=(1-(v+E))*U,o[11]=0,o[12]=e.x,o[13]=e.y,o[14]=e.z,o[15]=1,this}decompose(e,t,i){const o=this.elements;let l=to.set(o[0],o[1],o[2]).length();const c=to.set(o[4],o[5],o[6]).length(),d=to.set(o[8],o[9],o[10]).length();this.determinant()<0&&(l=-l),e.x=o[12],e.y=o[13],e.z=o[14],Si.copy(this);const p=1/l,m=1/c,_=1/d;return Si.elements[0]*=p,Si.elements[1]*=p,Si.elements[2]*=p,Si.elements[4]*=m,Si.elements[5]*=m,Si.elements[6]*=m,Si.elements[8]*=_,Si.elements[9]*=_,Si.elements[10]*=_,t.setFromRotationMatrix(Si),i.x=l,i.y=c,i.z=d,this}makePerspective(e,t,i,o,l,c,d=ir){const h=this.elements,p=2*l/(t-e),m=2*l/(i-o),_=(t+e)/(t-e),v=(i+o)/(i-o);let S,M;if(d===ir)S=-(c+l)/(c-l),M=-2*c*l/(c-l);else if(d===Dc)S=-c/(c-l),M=-c*l/(c-l);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return h[0]=p,h[4]=0,h[8]=_,h[12]=0,h[1]=0,h[5]=m,h[9]=v,h[13]=0,h[2]=0,h[6]=0,h[10]=S,h[14]=M,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,i,o,l,c,d=ir){const h=this.elements,p=1/(t-e),m=1/(i-o),_=1/(c-l),v=(t+e)*p,S=(i+o)*m;let M,E;if(d===ir)M=(c+l)*_,E=-2*_;else if(d===Dc)M=l*_,E=-1*_;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return h[0]=2*p,h[4]=0,h[8]=0,h[12]=-v,h[1]=0,h[5]=2*m,h[9]=0,h[13]=-S,h[2]=0,h[6]=0,h[10]=E,h[14]=-M,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let o=0;o<16;o++)if(t[o]!==i[o])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const to=new I,Si=new At,mx=new I(0,0,0),_x=new I(1,1,1),Ur=new I,Kl=new I,ei=new I,g0=new At,v0=new Ua;class Oi{constructor(e=0,t=0,i=0,o=Oi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=o}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,o=this._order){return this._x=e,this._y=t,this._z=i,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const o=e.elements,l=o[0],c=o[4],d=o[8],h=o[1],p=o[5],m=o[9],_=o[2],v=o[6],S=o[10];switch(t){case"XYZ":this._y=Math.asin(mn(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-m,S),this._z=Math.atan2(-c,l)):(this._x=Math.atan2(v,p),this._z=0);break;case"YXZ":this._x=Math.asin(-mn(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(d,S),this._z=Math.atan2(h,p)):(this._y=Math.atan2(-_,l),this._z=0);break;case"ZXY":this._x=Math.asin(mn(v,-1,1)),Math.abs(v)<.9999999?(this._y=Math.atan2(-_,S),this._z=Math.atan2(-c,p)):(this._y=0,this._z=Math.atan2(h,l));break;case"ZYX":this._y=Math.asin(-mn(_,-1,1)),Math.abs(_)<.9999999?(this._x=Math.atan2(v,S),this._z=Math.atan2(h,l)):(this._x=0,this._z=Math.atan2(-c,p));break;case"YZX":this._z=Math.asin(mn(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-m,p),this._y=Math.atan2(-_,l)):(this._x=0,this._y=Math.atan2(d,S));break;case"XZY":this._z=Math.asin(-mn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(v,p),this._y=Math.atan2(d,l)):(this._x=Math.atan2(-m,S),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return g0.makeRotationFromQuaternion(e),this.setFromRotationMatrix(g0,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return v0.setFromEuler(this),this.setFromQuaternion(v0,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Oi.DEFAULT_ORDER="XYZ";class gf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let gx=0;const y0=new I,no=new Ua,Zi=new At,Yl=new I,ga=new I,vx=new I,yx=new Ua,x0=new I(1,0,0),S0=new I(0,1,0),M0=new I(0,0,1),w0={type:"added"},xx={type:"removed"},io={type:"childadded",child:null},kd={type:"childremoved",child:null};class kt extends Po{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gx++}),this.uuid=lr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=kt.DEFAULT_UP.clone();const e=new I,t=new Oi,i=new Ua,o=new I(1,1,1);function l(){i.setFromEuler(t,!1)}function c(){t.setFromQuaternion(i,void 0,!1)}t._onChange(l),i._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new At},normalMatrix:{value:new ct}}),this.matrix=new At,this.matrixWorld=new At,this.matrixAutoUpdate=kt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=kt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return no.setFromAxisAngle(e,t),this.quaternion.multiply(no),this}rotateOnWorldAxis(e,t){return no.setFromAxisAngle(e,t),this.quaternion.premultiply(no),this}rotateX(e){return this.rotateOnAxis(x0,e)}rotateY(e){return this.rotateOnAxis(S0,e)}rotateZ(e){return this.rotateOnAxis(M0,e)}translateOnAxis(e,t){return y0.copy(e).applyQuaternion(this.quaternion),this.position.add(y0.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(x0,e)}translateY(e){return this.translateOnAxis(S0,e)}translateZ(e){return this.translateOnAxis(M0,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Zi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Yl.copy(e):Yl.set(e,t,i);const o=this.parent;this.updateWorldMatrix(!0,!1),ga.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zi.lookAt(ga,Yl,this.up):Zi.lookAt(Yl,ga,this.up),this.quaternion.setFromRotationMatrix(Zi),o&&(Zi.extractRotation(o.matrixWorld),no.setFromRotationMatrix(Zi),this.quaternion.premultiply(no.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(w0),io.child=e,this.dispatchEvent(io),io.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(xx),kd.child=e,this.dispatchEvent(kd),kd.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Zi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Zi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Zi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(w0),io.child=e,this.dispatchEvent(io),io.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,o=this.children.length;i<o;i++){const c=this.children[i].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const o=this.children;for(let l=0,c=o.length;l<c;l++)o[l].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ga,e,vx),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ga,yx,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,o=t.length;i<o;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,o=t.length;i<o;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,o=t.length;i<o;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const o=this.children;for(let l=0,c=o.length;l<c;l++)o[l].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const o={};o.uuid=this.uuid,o.type=this.type,this.name!==""&&(o.name=this.name),this.castShadow===!0&&(o.castShadow=!0),this.receiveShadow===!0&&(o.receiveShadow=!0),this.visible===!1&&(o.visible=!1),this.frustumCulled===!1&&(o.frustumCulled=!1),this.renderOrder!==0&&(o.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(o.matrixAutoUpdate=!1),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.visibility=this._visibility,o.active=this._active,o.bounds=this._bounds.map(d=>({boxInitialized:d.boxInitialized,boxMin:d.box.min.toArray(),boxMax:d.box.max.toArray(),sphereInitialized:d.sphereInitialized,sphereRadius:d.sphere.radius,sphereCenter:d.sphere.center.toArray()})),o.maxInstanceCount=this._maxInstanceCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.geometryCount=this._geometryCount,o.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(o.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(o.boundingSphere={center:o.boundingSphere.center.toArray(),radius:o.boundingSphere.radius}),this.boundingBox!==null&&(o.boundingBox={min:o.boundingBox.min.toArray(),max:o.boundingBox.max.toArray()}));function l(d,h){return d[h.uuid]===void 0&&(d[h.uuid]=h.toJSON(e)),h.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=l(e.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const h=d.shapes;if(Array.isArray(h))for(let p=0,m=h.length;p<m;p++){const _=h[p];l(e.shapes,_)}else l(e.shapes,h)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(l(e.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let h=0,p=this.material.length;h<p;h++)d.push(l(e.materials,this.material[h]));o.material=d}else o.material=l(e.materials,this.material);if(this.children.length>0){o.children=[];for(let d=0;d<this.children.length;d++)o.children.push(this.children[d].toJSON(e).object)}if(this.animations.length>0){o.animations=[];for(let d=0;d<this.animations.length;d++){const h=this.animations[d];o.animations.push(l(e.animations,h))}}if(t){const d=c(e.geometries),h=c(e.materials),p=c(e.textures),m=c(e.images),_=c(e.shapes),v=c(e.skeletons),S=c(e.animations),M=c(e.nodes);d.length>0&&(i.geometries=d),h.length>0&&(i.materials=h),p.length>0&&(i.textures=p),m.length>0&&(i.images=m),_.length>0&&(i.shapes=_),v.length>0&&(i.skeletons=v),S.length>0&&(i.animations=S),M.length>0&&(i.nodes=M)}return i.object=o,i;function c(d){const h=[];for(const p in d){const m=d[p];delete m.metadata,h.push(m)}return h}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const o=e.children[i];this.add(o.clone())}return this}}kt.DEFAULT_UP=new I(0,1,0);kt.DEFAULT_MATRIX_AUTO_UPDATE=!0;kt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Mi=new I,er=new I,Fd=new I,tr=new I,ro=new I,so=new I,E0=new I,Od=new I,Bd=new I,zd=new I,Vd=new Nt,Hd=new Nt,Gd=new Nt;class hi{constructor(e=new I,t=new I,i=new I){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,o){o.subVectors(i,t),Mi.subVectors(e,t),o.cross(Mi);const l=o.lengthSq();return l>0?o.multiplyScalar(1/Math.sqrt(l)):o.set(0,0,0)}static getBarycoord(e,t,i,o,l){Mi.subVectors(o,t),er.subVectors(i,t),Fd.subVectors(e,t);const c=Mi.dot(Mi),d=Mi.dot(er),h=Mi.dot(Fd),p=er.dot(er),m=er.dot(Fd),_=c*p-d*d;if(_===0)return l.set(0,0,0),null;const v=1/_,S=(p*h-d*m)*v,M=(c*m-d*h)*v;return l.set(1-S-M,M,S)}static containsPoint(e,t,i,o){return this.getBarycoord(e,t,i,o,tr)===null?!1:tr.x>=0&&tr.y>=0&&tr.x+tr.y<=1}static getInterpolation(e,t,i,o,l,c,d,h){return this.getBarycoord(e,t,i,o,tr)===null?(h.x=0,h.y=0,"z"in h&&(h.z=0),"w"in h&&(h.w=0),null):(h.setScalar(0),h.addScaledVector(l,tr.x),h.addScaledVector(c,tr.y),h.addScaledVector(d,tr.z),h)}static getInterpolatedAttribute(e,t,i,o,l,c){return Vd.setScalar(0),Hd.setScalar(0),Gd.setScalar(0),Vd.fromBufferAttribute(e,t),Hd.fromBufferAttribute(e,i),Gd.fromBufferAttribute(e,o),c.setScalar(0),c.addScaledVector(Vd,l.x),c.addScaledVector(Hd,l.y),c.addScaledVector(Gd,l.z),c}static isFrontFacing(e,t,i,o){return Mi.subVectors(i,t),er.subVectors(e,t),Mi.cross(er).dot(o)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,o){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[o]),this}setFromAttributeAndIndices(e,t,i,o){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,o),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Mi.subVectors(this.c,this.b),er.subVectors(this.a,this.b),Mi.cross(er).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return hi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return hi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,o,l){return hi.getInterpolation(e,this.a,this.b,this.c,t,i,o,l)}containsPoint(e){return hi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return hi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,o=this.b,l=this.c;let c,d;ro.subVectors(o,i),so.subVectors(l,i),Od.subVectors(e,i);const h=ro.dot(Od),p=so.dot(Od);if(h<=0&&p<=0)return t.copy(i);Bd.subVectors(e,o);const m=ro.dot(Bd),_=so.dot(Bd);if(m>=0&&_<=m)return t.copy(o);const v=h*_-m*p;if(v<=0&&h>=0&&m<=0)return c=h/(h-m),t.copy(i).addScaledVector(ro,c);zd.subVectors(e,l);const S=ro.dot(zd),M=so.dot(zd);if(M>=0&&S<=M)return t.copy(l);const E=S*p-h*M;if(E<=0&&p>=0&&M<=0)return d=p/(p-M),t.copy(i).addScaledVector(so,d);const x=m*M-S*_;if(x<=0&&_-m>=0&&S-M>=0)return E0.subVectors(l,o),d=(_-m)/(_-m+(S-M)),t.copy(o).addScaledVector(E0,d);const y=1/(x+E+v);return c=E*y,d=v*y,t.copy(i).addScaledVector(ro,c).addScaledVector(so,d)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const X_={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},kr={h:0,s:0,l:0},$l={h:0,s:0,l:0};function Wd(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class $e{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const o=e;o&&o.isColor?this.copy(o):typeof o=="number"?this.setHex(o):typeof o=="string"&&this.setStyle(o)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=wi){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Tt.toWorkingColorSpace(this,t),this}setRGB(e,t,i,o=Tt.workingColorSpace){return this.r=e,this.g=t,this.b=i,Tt.toWorkingColorSpace(this,o),this}setHSL(e,t,i,o=Tt.workingColorSpace){if(e=_f(e,1),t=mn(t,0,1),i=mn(i,0,1),t===0)this.r=this.g=this.b=i;else{const l=i<=.5?i*(1+t):i+t-i*t,c=2*i-l;this.r=Wd(c,l,e+1/3),this.g=Wd(c,l,e),this.b=Wd(c,l,e-1/3)}return Tt.toWorkingColorSpace(this,o),this}setStyle(e,t=wi){function i(l){l!==void 0&&parseFloat(l)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let o;if(o=/^(\w+)\(([^\)]*)\)/.exec(e)){let l;const c=o[1],d=o[2];switch(c){case"rgb":case"rgba":if(l=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return i(l[4]),this.setRGB(Math.min(255,parseInt(l[1],10))/255,Math.min(255,parseInt(l[2],10))/255,Math.min(255,parseInt(l[3],10))/255,t);if(l=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return i(l[4]),this.setRGB(Math.min(100,parseInt(l[1],10))/100,Math.min(100,parseInt(l[2],10))/100,Math.min(100,parseInt(l[3],10))/100,t);break;case"hsl":case"hsla":if(l=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return i(l[4]),this.setHSL(parseFloat(l[1])/360,parseFloat(l[2])/100,parseFloat(l[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(o=/^\#([A-Fa-f\d]+)$/.exec(e)){const l=o[1],c=l.length;if(c===3)return this.setRGB(parseInt(l.charAt(0),16)/15,parseInt(l.charAt(1),16)/15,parseInt(l.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(l,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=wi){const i=X_[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xo(e.r),this.g=xo(e.g),this.b=xo(e.b),this}copyLinearToSRGB(e){return this.r=Cd(e.r),this.g=Cd(e.g),this.b=Cd(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=wi){return Tt.fromWorkingColorSpace(Cn.copy(this),e),Math.round(mn(Cn.r*255,0,255))*65536+Math.round(mn(Cn.g*255,0,255))*256+Math.round(mn(Cn.b*255,0,255))}getHexString(e=wi){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Tt.workingColorSpace){Tt.fromWorkingColorSpace(Cn.copy(this),t);const i=Cn.r,o=Cn.g,l=Cn.b,c=Math.max(i,o,l),d=Math.min(i,o,l);let h,p;const m=(d+c)/2;if(d===c)h=0,p=0;else{const _=c-d;switch(p=m<=.5?_/(c+d):_/(2-c-d),c){case i:h=(o-l)/_+(o<l?6:0);break;case o:h=(l-i)/_+2;break;case l:h=(i-o)/_+4;break}h/=6}return e.h=h,e.s=p,e.l=m,e}getRGB(e,t=Tt.workingColorSpace){return Tt.fromWorkingColorSpace(Cn.copy(this),t),e.r=Cn.r,e.g=Cn.g,e.b=Cn.b,e}getStyle(e=wi){Tt.fromWorkingColorSpace(Cn.copy(this),e);const t=Cn.r,i=Cn.g,o=Cn.b;return e!==wi?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${o.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(o*255)})`}offsetHSL(e,t,i){return this.getHSL(kr),this.setHSL(kr.h+e,kr.s+t,kr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(kr),e.getHSL($l);const i=Ca(kr.h,$l.h,t),o=Ca(kr.s,$l.s,t),l=Ca(kr.l,$l.l,t);return this.setHSL(i,o,l),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,o=this.b,l=e.elements;return this.r=l[0]*t+l[3]*i+l[6]*o,this.g=l[1]*t+l[4]*i+l[7]*o,this.b=l[2]*t+l[5]*i+l[8]*o,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Cn=new $e;$e.NAMES=X_;let Sx=0;class qr extends Po{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Sx++}),this.uuid=lr(),this.name="",this.type="Material",this.blending=vo,this.side=Gr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=uh,this.blendDst=dh,this.blendEquation=ps,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new $e(0,0,0),this.blendAlpha=0,this.depthFunc=So,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=u0,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=$s,this.stencilZFail=$s,this.stencilZPass=$s,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const o=this[t];if(o===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}o&&o.isColor?o.set(i):o&&o.isVector3&&i&&i.isVector3?o.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==vo&&(i.blending=this.blending),this.side!==Gr&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==uh&&(i.blendSrc=this.blendSrc),this.blendDst!==dh&&(i.blendDst=this.blendDst),this.blendEquation!==ps&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==So&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==u0&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==$s&&(i.stencilFail=this.stencilFail),this.stencilZFail!==$s&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==$s&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function o(l){const c=[];for(const d in l){const h=l[d];delete h.metadata,c.push(h)}return c}if(t){const l=o(e.textures),c=o(e.images);l.length>0&&(i.textures=l),c.length>0&&(i.images=c)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const o=t.length;i=new Array(o);for(let l=0;l!==o;++l)i[l]=t[l].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class rr extends qr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new $e(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=T_,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const $t=new I,Ql=new Pe;class jn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Yh,this.updateRanges=[],this.gpuType=ki,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let o=0,l=this.itemSize;o<l;o++)this.array[e+o]=t.array[i+o];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Ql.fromBufferAttribute(this,t),Ql.applyMatrix3(e),this.setXY(t,Ql.x,Ql.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix3(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ai(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Lt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ai(t,this.array)),t}setX(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ai(t,this.array)),t}setY(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ai(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ai(t,this.array)),t}setW(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,o){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),o=Lt(o,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=o,this}setXYZW(e,t,i,o,l){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),o=Lt(o,this.array),l=Lt(l,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=o,this.array[e+3]=l,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Yh&&(e.usage=this.usage),e}}class j_ extends jn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class K_ extends jn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Ct extends jn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Mx=0;const di=new At,qd=new kt,oo=new I,ti=new Ss,va=new Ss,un=new I;class Jt extends Po{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Mx++}),this.uuid=lr(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(G_(e)?K_:j_)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const l=new ct().getNormalMatrix(e);i.applyNormalMatrix(l),i.needsUpdate=!0}const o=this.attributes.tangent;return o!==void 0&&(o.transformDirection(e),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return di.makeRotationFromQuaternion(e),this.applyMatrix4(di),this}rotateX(e){return di.makeRotationX(e),this.applyMatrix4(di),this}rotateY(e){return di.makeRotationY(e),this.applyMatrix4(di),this}rotateZ(e){return di.makeRotationZ(e),this.applyMatrix4(di),this}translate(e,t,i){return di.makeTranslation(e,t,i),this.applyMatrix4(di),this}scale(e,t,i){return di.makeScale(e,t,i),this.applyMatrix4(di),this}lookAt(e){return qd.lookAt(e),qd.updateMatrix(),this.applyMatrix4(qd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(oo).negate(),this.translate(oo.x,oo.y,oo.z),this}setFromPoints(e){const t=[];for(let i=0,o=e.length;i<o;i++){const l=e[i];t.push(l.x,l.y,l.z||0)}return this.setAttribute("position",new Ct(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ss);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,o=t.length;i<o;i++){const l=t[i];ti.setFromBufferAttribute(l),this.morphTargetsRelative?(un.addVectors(this.boundingBox.min,ti.min),this.boundingBox.expandByPoint(un),un.addVectors(this.boundingBox.max,ti.max),this.boundingBox.expandByPoint(un)):(this.boundingBox.expandByPoint(ti.min),this.boundingBox.expandByPoint(ti.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ms);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const i=this.boundingSphere.center;if(ti.setFromBufferAttribute(e),t)for(let l=0,c=t.length;l<c;l++){const d=t[l];va.setFromBufferAttribute(d),this.morphTargetsRelative?(un.addVectors(ti.min,va.min),ti.expandByPoint(un),un.addVectors(ti.max,va.max),ti.expandByPoint(un)):(ti.expandByPoint(va.min),ti.expandByPoint(va.max))}ti.getCenter(i);let o=0;for(let l=0,c=e.count;l<c;l++)un.fromBufferAttribute(e,l),o=Math.max(o,i.distanceToSquared(un));if(t)for(let l=0,c=t.length;l<c;l++){const d=t[l],h=this.morphTargetsRelative;for(let p=0,m=d.count;p<m;p++)un.fromBufferAttribute(d,p),h&&(oo.fromBufferAttribute(e,p),un.add(oo)),o=Math.max(o,i.distanceToSquared(un))}this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,o=t.normal,l=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new jn(new Float32Array(4*i.count),4));const c=this.getAttribute("tangent"),d=[],h=[];for(let V=0;V<i.count;V++)d[V]=new I,h[V]=new I;const p=new I,m=new I,_=new I,v=new Pe,S=new Pe,M=new Pe,E=new I,x=new I;function y(V,le,w){p.fromBufferAttribute(i,V),m.fromBufferAttribute(i,le),_.fromBufferAttribute(i,w),v.fromBufferAttribute(l,V),S.fromBufferAttribute(l,le),M.fromBufferAttribute(l,w),m.sub(p),_.sub(p),S.sub(v),M.sub(v);const L=1/(S.x*M.y-M.x*S.y);isFinite(L)&&(E.copy(m).multiplyScalar(M.y).addScaledVector(_,-S.y).multiplyScalar(L),x.copy(_).multiplyScalar(S.x).addScaledVector(m,-M.x).multiplyScalar(L),d[V].add(E),d[le].add(E),d[w].add(E),h[V].add(x),h[le].add(x),h[w].add(x))}let C=this.groups;C.length===0&&(C=[{start:0,count:e.count}]);for(let V=0,le=C.length;V<le;++V){const w=C[V],L=w.start,Q=w.count;for(let J=L,re=L+Q;J<re;J+=3)y(e.getX(J+0),e.getX(J+1),e.getX(J+2))}const b=new I,P=new I,G=new I,k=new I;function U(V){G.fromBufferAttribute(o,V),k.copy(G);const le=d[V];b.copy(le),b.sub(G.multiplyScalar(G.dot(le))).normalize(),P.crossVectors(k,le);const L=P.dot(h[V])<0?-1:1;c.setXYZW(V,b.x,b.y,b.z,L)}for(let V=0,le=C.length;V<le;++V){const w=C[V],L=w.start,Q=w.count;for(let J=L,re=L+Q;J<re;J+=3)U(e.getX(J+0)),U(e.getX(J+1)),U(e.getX(J+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new jn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let v=0,S=i.count;v<S;v++)i.setXYZ(v,0,0,0);const o=new I,l=new I,c=new I,d=new I,h=new I,p=new I,m=new I,_=new I;if(e)for(let v=0,S=e.count;v<S;v+=3){const M=e.getX(v+0),E=e.getX(v+1),x=e.getX(v+2);o.fromBufferAttribute(t,M),l.fromBufferAttribute(t,E),c.fromBufferAttribute(t,x),m.subVectors(c,l),_.subVectors(o,l),m.cross(_),d.fromBufferAttribute(i,M),h.fromBufferAttribute(i,E),p.fromBufferAttribute(i,x),d.add(m),h.add(m),p.add(m),i.setXYZ(M,d.x,d.y,d.z),i.setXYZ(E,h.x,h.y,h.z),i.setXYZ(x,p.x,p.y,p.z)}else for(let v=0,S=t.count;v<S;v+=3)o.fromBufferAttribute(t,v+0),l.fromBufferAttribute(t,v+1),c.fromBufferAttribute(t,v+2),m.subVectors(c,l),_.subVectors(o,l),m.cross(_),i.setXYZ(v+0,m.x,m.y,m.z),i.setXYZ(v+1,m.x,m.y,m.z),i.setXYZ(v+2,m.x,m.y,m.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)un.fromBufferAttribute(e,t),un.normalize(),e.setXYZ(t,un.x,un.y,un.z)}toNonIndexed(){function e(d,h){const p=d.array,m=d.itemSize,_=d.normalized,v=new p.constructor(h.length*m);let S=0,M=0;for(let E=0,x=h.length;E<x;E++){d.isInterleavedBufferAttribute?S=h[E]*d.data.stride+d.offset:S=h[E]*m;for(let y=0;y<m;y++)v[M++]=p[S++]}return new jn(v,m,_)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Jt,i=this.index.array,o=this.attributes;for(const d in o){const h=o[d],p=e(h,i);t.setAttribute(d,p)}const l=this.morphAttributes;for(const d in l){const h=[],p=l[d];for(let m=0,_=p.length;m<_;m++){const v=p[m],S=e(v,i);h.push(S)}t.morphAttributes[d]=h}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let d=0,h=c.length;d<h;d++){const p=c[d];t.addGroup(p.start,p.count,p.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const h=this.parameters;for(const p in h)h[p]!==void 0&&(e[p]=h[p]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const h in i){const p=i[h];e.data.attributes[h]=p.toJSON(e.data)}const o={};let l=!1;for(const h in this.morphAttributes){const p=this.morphAttributes[h],m=[];for(let _=0,v=p.length;_<v;_++){const S=p[_];m.push(S.toJSON(e.data))}m.length>0&&(o[h]=m,l=!0)}l&&(e.data.morphAttributes=o,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const d=this.boundingSphere;return d!==null&&(e.data.boundingSphere={center:d.center.toArray(),radius:d.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const o=e.attributes;for(const p in o){const m=o[p];this.setAttribute(p,m.clone(t))}const l=e.morphAttributes;for(const p in l){const m=[],_=l[p];for(let v=0,S=_.length;v<S;v++)m.push(_[v].clone(t));this.morphAttributes[p]=m}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let p=0,m=c.length;p<m;p++){const _=c[p];this.addGroup(_.start,_.count,_.materialIndex)}const d=e.boundingBox;d!==null&&(this.boundingBox=d.clone());const h=e.boundingSphere;return h!==null&&(this.boundingSphere=h.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const T0=new At,as=new zc,Jl=new Ms,b0=new I,Zl=new I,ec=new I,tc=new I,Xd=new I,nc=new I,A0=new I,ic=new I;class be extends kt{constructor(e=new Jt,t=new rr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const o=t[i[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=o.length;l<c;l++){const d=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}getVertexPosition(e,t){const i=this.geometry,o=i.attributes.position,l=i.morphAttributes.position,c=i.morphTargetsRelative;t.fromBufferAttribute(o,e);const d=this.morphTargetInfluences;if(l&&d){nc.set(0,0,0);for(let h=0,p=l.length;h<p;h++){const m=d[h],_=l[h];m!==0&&(Xd.fromBufferAttribute(_,e),c?nc.addScaledVector(Xd,m):nc.addScaledVector(Xd.sub(t),m))}t.add(nc)}return t}raycast(e,t){const i=this.geometry,o=this.material,l=this.matrixWorld;o!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Jl.copy(i.boundingSphere),Jl.applyMatrix4(l),as.copy(e.ray).recast(e.near),!(Jl.containsPoint(as.origin)===!1&&(as.intersectSphere(Jl,b0)===null||as.origin.distanceToSquared(b0)>(e.far-e.near)**2))&&(T0.copy(l).invert(),as.copy(e.ray).applyMatrix4(T0),!(i.boundingBox!==null&&as.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,as)))}_computeIntersections(e,t,i){let o;const l=this.geometry,c=this.material,d=l.index,h=l.attributes.position,p=l.attributes.uv,m=l.attributes.uv1,_=l.attributes.normal,v=l.groups,S=l.drawRange;if(d!==null)if(Array.isArray(c))for(let M=0,E=v.length;M<E;M++){const x=v[M],y=c[x.materialIndex],C=Math.max(x.start,S.start),b=Math.min(d.count,Math.min(x.start+x.count,S.start+S.count));for(let P=C,G=b;P<G;P+=3){const k=d.getX(P),U=d.getX(P+1),V=d.getX(P+2);o=rc(this,y,e,i,p,m,_,k,U,V),o&&(o.faceIndex=Math.floor(P/3),o.face.materialIndex=x.materialIndex,t.push(o))}}else{const M=Math.max(0,S.start),E=Math.min(d.count,S.start+S.count);for(let x=M,y=E;x<y;x+=3){const C=d.getX(x),b=d.getX(x+1),P=d.getX(x+2);o=rc(this,c,e,i,p,m,_,C,b,P),o&&(o.faceIndex=Math.floor(x/3),t.push(o))}}else if(h!==void 0)if(Array.isArray(c))for(let M=0,E=v.length;M<E;M++){const x=v[M],y=c[x.materialIndex],C=Math.max(x.start,S.start),b=Math.min(h.count,Math.min(x.start+x.count,S.start+S.count));for(let P=C,G=b;P<G;P+=3){const k=P,U=P+1,V=P+2;o=rc(this,y,e,i,p,m,_,k,U,V),o&&(o.faceIndex=Math.floor(P/3),o.face.materialIndex=x.materialIndex,t.push(o))}}else{const M=Math.max(0,S.start),E=Math.min(h.count,S.start+S.count);for(let x=M,y=E;x<y;x+=3){const C=x,b=x+1,P=x+2;o=rc(this,c,e,i,p,m,_,C,b,P),o&&(o.faceIndex=Math.floor(x/3),t.push(o))}}}}function wx(s,e,t,i,o,l,c,d){let h;if(e.side===Fn?h=i.intersectTriangle(c,l,o,!0,d):h=i.intersectTriangle(o,l,c,e.side===Gr,d),h===null)return null;ic.copy(d),ic.applyMatrix4(s.matrixWorld);const p=t.ray.origin.distanceTo(ic);return p<t.near||p>t.far?null:{distance:p,point:ic.clone(),object:s}}function rc(s,e,t,i,o,l,c,d,h,p){s.getVertexPosition(d,Zl),s.getVertexPosition(h,ec),s.getVertexPosition(p,tc);const m=wx(s,e,t,i,Zl,ec,tc,A0);if(m){const _=new I;hi.getBarycoord(A0,Zl,ec,tc,_),o&&(m.uv=hi.getInterpolatedAttribute(o,d,h,p,_,new Pe)),l&&(m.uv1=hi.getInterpolatedAttribute(l,d,h,p,_,new Pe)),c&&(m.normal=hi.getInterpolatedAttribute(c,d,h,p,_,new I),m.normal.dot(i.direction)>0&&m.normal.multiplyScalar(-1));const v={a:d,b:h,c:p,normal:new I,materialIndex:0};hi.getNormal(Zl,ec,tc,v.normal),m.face=v,m.barycoord=_}return m}class bt extends Jt{constructor(e=1,t=1,i=1,o=1,l=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:o,heightSegments:l,depthSegments:c};const d=this;o=Math.floor(o),l=Math.floor(l),c=Math.floor(c);const h=[],p=[],m=[],_=[];let v=0,S=0;M("z","y","x",-1,-1,i,t,e,c,l,0),M("z","y","x",1,-1,i,t,-e,c,l,1),M("x","z","y",1,1,e,i,t,o,c,2),M("x","z","y",1,-1,e,i,-t,o,c,3),M("x","y","z",1,-1,e,t,i,o,l,4),M("x","y","z",-1,-1,e,t,-i,o,l,5),this.setIndex(h),this.setAttribute("position",new Ct(p,3)),this.setAttribute("normal",new Ct(m,3)),this.setAttribute("uv",new Ct(_,2));function M(E,x,y,C,b,P,G,k,U,V,le){const w=P/U,L=G/V,Q=P/2,J=G/2,re=k/2,pe=U+1,ee=V+1;let me=0,z=0;const ue=new I;for(let ae=0;ae<ee;ae++){const F=ae*L-J;for(let se=0;se<pe;se++){const Fe=se*w-Q;ue[E]=Fe*C,ue[x]=F*b,ue[y]=re,p.push(ue.x,ue.y,ue.z),ue[E]=0,ue[x]=0,ue[y]=k>0?1:-1,m.push(ue.x,ue.y,ue.z),_.push(se/U),_.push(1-ae/V),me+=1}}for(let ae=0;ae<V;ae++)for(let F=0;F<U;F++){const se=v+F+pe*ae,Fe=v+F+pe*(ae+1),Z=v+(F+1)+pe*(ae+1),ce=v+(F+1)+pe*ae;h.push(se,Fe,ce),h.push(Fe,Z,ce),z+=6}d.addGroup(S,z,le),S+=z,v+=me}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function bo(s){const e={};for(const t in s){e[t]={};for(const i in s[t]){const o=s[t][i];o&&(o.isColor||o.isMatrix3||o.isMatrix4||o.isVector2||o.isVector3||o.isVector4||o.isTexture||o.isQuaternion)?o.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=o.clone():Array.isArray(o)?e[t][i]=o.slice():e[t][i]=o}}return e}function kn(s){const e={};for(let t=0;t<s.length;t++){const i=bo(s[t]);for(const o in i)e[o]=i[o]}return e}function Ex(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Y_(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Tt.workingColorSpace}const Ia={clone:bo,merge:kn};var Tx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ln extends qr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Tx,this.fragmentShader=bx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=bo(e.uniforms),this.uniformsGroups=Ex(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const o in this.uniforms){const c=this.uniforms[o].value;c&&c.isTexture?t.uniforms[o]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[o]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[o]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[o]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[o]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[o]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[o]={type:"m4",value:c.toArray()}:t.uniforms[o]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const o in this.extensions)this.extensions[o]===!0&&(i[o]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class $_ extends kt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new At,this.projectionMatrix=new At,this.projectionMatrixInverse=new At,this.coordinateSystem=ir}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Fr=new I,C0=new Pe,R0=new Pe;class ii extends $_{constructor(e=50,t=1,i=.1,o=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=o,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Da*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Aa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Da*2*Math.atan(Math.tan(Aa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Fr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Fr.x,Fr.y).multiplyScalar(-e/Fr.z),Fr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Fr.x,Fr.y).multiplyScalar(-e/Fr.z)}getViewSize(e,t){return this.getViewBounds(e,C0,R0),t.subVectors(R0,C0)}setViewOffset(e,t,i,o,l,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=o,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Aa*.5*this.fov)/this.zoom,i=2*t,o=this.aspect*i,l=-.5*o;const c=this.view;if(this.view!==null&&this.view.enabled){const h=c.fullWidth,p=c.fullHeight;l+=c.offsetX*o/h,t-=c.offsetY*i/p,o*=c.width/h,i*=c.height/p}const d=this.filmOffset;d!==0&&(l+=e*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(l,l+o,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ao=-90,lo=1;class Ax extends kt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const o=new ii(ao,lo,e,t);o.layers=this.layers,this.add(o);const l=new ii(ao,lo,e,t);l.layers=this.layers,this.add(l);const c=new ii(ao,lo,e,t);c.layers=this.layers,this.add(c);const d=new ii(ao,lo,e,t);d.layers=this.layers,this.add(d);const h=new ii(ao,lo,e,t);h.layers=this.layers,this.add(h);const p=new ii(ao,lo,e,t);p.layers=this.layers,this.add(p)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,o,l,c,d,h]=t;for(const p of t)this.remove(p);if(e===ir)i.up.set(0,1,0),i.lookAt(1,0,0),o.up.set(0,1,0),o.lookAt(-1,0,0),l.up.set(0,0,-1),l.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),h.up.set(0,1,0),h.lookAt(0,0,-1);else if(e===Dc)i.up.set(0,-1,0),i.lookAt(-1,0,0),o.up.set(0,-1,0),o.lookAt(1,0,0),l.up.set(0,0,1),l.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),h.up.set(0,-1,0),h.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const p of t)this.add(p),p.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:o}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[l,c,d,h,p,m]=this.children,_=e.getRenderTarget(),v=e.getActiveCubeFace(),S=e.getActiveMipmapLevel(),M=e.xr.enabled;e.xr.enabled=!1;const E=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,o),e.render(t,l),e.setRenderTarget(i,1,o),e.render(t,c),e.setRenderTarget(i,2,o),e.render(t,d),e.setRenderTarget(i,3,o),e.render(t,h),e.setRenderTarget(i,4,o),e.render(t,p),i.texture.generateMipmaps=E,e.setRenderTarget(i,5,o),e.render(t,m),e.setRenderTarget(_,v,S),e.xr.enabled=M,i.texture.needsPMREMUpdate=!0}}class Q_ extends Dn{constructor(e,t,i,o,l,c,d,h,p,m){e=e!==void 0?e:[],t=t!==void 0?t:Mo,super(e,t,i,o,l,c,d,h,p,m),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Cx extends Ri{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},o=[i,i,i,i,i,i];this.texture=new Q_(o,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:bi}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},o=new bt(5,5,5),l=new Ln({name:"CubemapFromEquirect",uniforms:bo(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Fn,blending:or});l.uniforms.tEquirect.value=t;const c=new be(o,l),d=t.minFilter;return t.minFilter===gs&&(t.minFilter=bi),new Ax(1,10,this).update(e,c),t.minFilter=d,c.geometry.dispose(),c.material.dispose(),this}clear(e,t,i,o){const l=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,i,o);e.setRenderTarget(l)}}const jd=new I,Rx=new I,Px=new ct;class hs{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,o){return this.normal.set(e,t,i),this.constant=o,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const o=jd.subVectors(i,t).cross(Rx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(o,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(jd),o=this.normal.dot(i);if(o===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const l=-(e.start.dot(this.normal)+this.constant)/o;return l<0||l>1?null:t.copy(e.start).addScaledVector(i,l)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Px.getNormalMatrix(e),o=this.coplanarPoint(jd).applyMatrix4(e),l=this.normal.applyMatrix3(i).normalize();return this.constant=-o.dot(l),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ls=new Ms,sc=new I;class vf{constructor(e=new hs,t=new hs,i=new hs,o=new hs,l=new hs,c=new hs){this.planes=[e,t,i,o,l,c]}set(e,t,i,o,l,c){const d=this.planes;return d[0].copy(e),d[1].copy(t),d[2].copy(i),d[3].copy(o),d[4].copy(l),d[5].copy(c),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=ir){const i=this.planes,o=e.elements,l=o[0],c=o[1],d=o[2],h=o[3],p=o[4],m=o[5],_=o[6],v=o[7],S=o[8],M=o[9],E=o[10],x=o[11],y=o[12],C=o[13],b=o[14],P=o[15];if(i[0].setComponents(h-l,v-p,x-S,P-y).normalize(),i[1].setComponents(h+l,v+p,x+S,P+y).normalize(),i[2].setComponents(h+c,v+m,x+M,P+C).normalize(),i[3].setComponents(h-c,v-m,x-M,P-C).normalize(),i[4].setComponents(h-d,v-_,x-E,P-b).normalize(),t===ir)i[5].setComponents(h+d,v+_,x+E,P+b).normalize();else if(t===Dc)i[5].setComponents(d,_,E,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ls.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ls.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ls)}intersectsSprite(e){return ls.center.set(0,0,0),ls.radius=.7071067811865476,ls.applyMatrix4(e.matrixWorld),this.intersectsSphere(ls)}intersectsSphere(e){const t=this.planes,i=e.center,o=-e.radius;for(let l=0;l<6;l++)if(t[l].distanceToPoint(i)<o)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const o=t[i];if(sc.x=o.normal.x>0?e.max.x:e.min.x,sc.y=o.normal.y>0?e.max.y:e.min.y,sc.z=o.normal.z>0?e.max.z:e.min.z,o.distanceToPoint(sc)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function J_(){let s=null,e=!1,t=null,i=null;function o(l,c){t(l,c),i=s.requestAnimationFrame(o)}return{start:function(){e!==!0&&t!==null&&(i=s.requestAnimationFrame(o),e=!0)},stop:function(){s.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(l){t=l},setContext:function(l){s=l}}}function Lx(s){const e=new WeakMap;function t(d,h){const p=d.array,m=d.usage,_=p.byteLength,v=s.createBuffer();s.bindBuffer(h,v),s.bufferData(h,p,m),d.onUploadCallback();let S;if(p instanceof Float32Array)S=s.FLOAT;else if(p instanceof Uint16Array)d.isFloat16BufferAttribute?S=s.HALF_FLOAT:S=s.UNSIGNED_SHORT;else if(p instanceof Int16Array)S=s.SHORT;else if(p instanceof Uint32Array)S=s.UNSIGNED_INT;else if(p instanceof Int32Array)S=s.INT;else if(p instanceof Int8Array)S=s.BYTE;else if(p instanceof Uint8Array)S=s.UNSIGNED_BYTE;else if(p instanceof Uint8ClampedArray)S=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+p);return{buffer:v,type:S,bytesPerElement:p.BYTES_PER_ELEMENT,version:d.version,size:_}}function i(d,h,p){const m=h.array,_=h.updateRanges;if(s.bindBuffer(p,d),_.length===0)s.bufferSubData(p,0,m);else{_.sort((S,M)=>S.start-M.start);let v=0;for(let S=1;S<_.length;S++){const M=_[v],E=_[S];E.start<=M.start+M.count+1?M.count=Math.max(M.count,E.start+E.count-M.start):(++v,_[v]=E)}_.length=v+1;for(let S=0,M=_.length;S<M;S++){const E=_[S];s.bufferSubData(p,E.start*m.BYTES_PER_ELEMENT,m,E.start,E.count)}h.clearUpdateRanges()}h.onUploadCallback()}function o(d){return d.isInterleavedBufferAttribute&&(d=d.data),e.get(d)}function l(d){d.isInterleavedBufferAttribute&&(d=d.data);const h=e.get(d);h&&(s.deleteBuffer(h.buffer),e.delete(d))}function c(d,h){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const m=e.get(d);(!m||m.version<d.version)&&e.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const p=e.get(d);if(p===void 0)e.set(d,t(d,h));else if(p.version<d.version){if(p.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(p.buffer,d,h),p.version=d.version}}return{get:o,remove:l,update:c}}class ws extends Jt{constructor(e=1,t=1,i=1,o=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:o};const l=e/2,c=t/2,d=Math.floor(i),h=Math.floor(o),p=d+1,m=h+1,_=e/d,v=t/h,S=[],M=[],E=[],x=[];for(let y=0;y<m;y++){const C=y*v-c;for(let b=0;b<p;b++){const P=b*_-l;M.push(P,-C,0),E.push(0,0,1),x.push(b/d),x.push(1-y/h)}}for(let y=0;y<h;y++)for(let C=0;C<d;C++){const b=C+p*y,P=C+p*(y+1),G=C+1+p*(y+1),k=C+1+p*y;S.push(b,P,k),S.push(P,G,k)}this.setIndex(S),this.setAttribute("position",new Ct(M,3)),this.setAttribute("normal",new Ct(E,3)),this.setAttribute("uv",new Ct(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ws(e.width,e.height,e.widthSegments,e.heightSegments)}}var Dx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ix=`#ifdef USE_ALPHAHASH
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
#endif`,Nx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Ux=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,kx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Fx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ox=`#ifdef USE_AOMAP
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
#endif`,Bx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,zx=`#ifdef USE_BATCHING
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
#endif`,Vx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Hx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Wx=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,qx=`#ifdef USE_IRIDESCENCE
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
#endif`,Xx=`#ifdef USE_BUMPMAP
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
#endif`,jx=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Kx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Yx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$x=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Qx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Jx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Zx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,e1=`#if defined( USE_COLOR_ALPHA )
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
#endif`,t1=`#define PI 3.141592653589793
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
} // validated`,n1=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,i1=`vec3 transformedNormal = objectNormal;
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
#endif`,r1=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,s1=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,o1=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,a1=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,l1="gl_FragColor = linearToOutputTexel( gl_FragColor );",c1=`
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
}`,u1=`#ifdef USE_ENVMAP
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
#endif`,d1=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,h1=`#ifdef USE_ENVMAP
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
#endif`,f1=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,p1=`#ifdef USE_ENVMAP
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
#endif`,m1=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,_1=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,g1=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,v1=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,y1=`#ifdef USE_GRADIENTMAP
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
}`,x1=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,S1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,M1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,w1=`uniform bool receiveShadow;
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
#endif`,E1=`#ifdef USE_ENVMAP
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
#endif`,T1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,b1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,A1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,C1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,R1=`PhysicalMaterial material;
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
#endif`,P1=`struct PhysicalMaterial {
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
}`,L1=`
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
#endif`,D1=`#if defined( RE_IndirectDiffuse )
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
#endif`,I1=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,N1=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,U1=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,k1=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,F1=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,O1=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,B1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,z1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,V1=`#if defined( USE_POINTS_UV )
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
#endif`,H1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,G1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,W1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,q1=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,X1=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,j1=`#ifdef USE_MORPHTARGETS
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
#endif`,K1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Y1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,$1=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Q1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,J1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Z1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,eS=`#ifdef USE_NORMALMAP
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
#endif`,tS=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,nS=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,iS=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,rS=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,sS=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,oS=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,aS=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,lS=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,cS=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,uS=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,dS=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,hS=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,fS=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,pS=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,mS=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,_S=`float getShadowMask() {
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
}`,gS=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,vS=`#ifdef USE_SKINNING
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
#endif`,yS=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,xS=`#ifdef USE_SKINNING
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
#endif`,SS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,MS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,wS=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ES=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,TS=`#ifdef USE_TRANSMISSION
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
#endif`,bS=`#ifdef USE_TRANSMISSION
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
#endif`,AS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,CS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,RS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,PS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const LS=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,DS=`uniform sampler2D t2D;
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
}`,IS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,NS=`#ifdef ENVMAP_TYPE_CUBE
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
}`,US=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,kS=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,FS=`#include <common>
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
}`,OS=`#if DEPTH_PACKING == 3200
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
}`,BS=`#define DISTANCE
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
}`,zS=`#define DISTANCE
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
}`,VS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,HS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,GS=`uniform float scale;
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
}`,WS=`uniform vec3 diffuse;
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
}`,qS=`#include <common>
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
}`,XS=`uniform vec3 diffuse;
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
}`,jS=`#define LAMBERT
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
}`,KS=`#define LAMBERT
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
}`,YS=`#define MATCAP
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
}`,$S=`#define MATCAP
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
}`,QS=`#define NORMAL
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
}`,JS=`#define NORMAL
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
}`,ZS=`#define PHONG
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
}`,eM=`#define PHONG
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
}`,tM=`#define STANDARD
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
}`,nM=`#define STANDARD
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
}`,iM=`#define TOON
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
}`,rM=`#define TOON
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
}`,sM=`uniform float size;
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
}`,oM=`uniform vec3 diffuse;
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
}`,aM=`#include <common>
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
}`,lM=`uniform vec3 color;
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
}`,cM=`uniform float rotation;
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
}`,uM=`uniform vec3 diffuse;
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
}`,lt={alphahash_fragment:Dx,alphahash_pars_fragment:Ix,alphamap_fragment:Nx,alphamap_pars_fragment:Ux,alphatest_fragment:kx,alphatest_pars_fragment:Fx,aomap_fragment:Ox,aomap_pars_fragment:Bx,batching_pars_vertex:zx,batching_vertex:Vx,begin_vertex:Hx,beginnormal_vertex:Gx,bsdfs:Wx,iridescence_fragment:qx,bumpmap_pars_fragment:Xx,clipping_planes_fragment:jx,clipping_planes_pars_fragment:Kx,clipping_planes_pars_vertex:Yx,clipping_planes_vertex:$x,color_fragment:Qx,color_pars_fragment:Jx,color_pars_vertex:Zx,color_vertex:e1,common:t1,cube_uv_reflection_fragment:n1,defaultnormal_vertex:i1,displacementmap_pars_vertex:r1,displacementmap_vertex:s1,emissivemap_fragment:o1,emissivemap_pars_fragment:a1,colorspace_fragment:l1,colorspace_pars_fragment:c1,envmap_fragment:u1,envmap_common_pars_fragment:d1,envmap_pars_fragment:h1,envmap_pars_vertex:f1,envmap_physical_pars_fragment:E1,envmap_vertex:p1,fog_vertex:m1,fog_pars_vertex:_1,fog_fragment:g1,fog_pars_fragment:v1,gradientmap_pars_fragment:y1,lightmap_pars_fragment:x1,lights_lambert_fragment:S1,lights_lambert_pars_fragment:M1,lights_pars_begin:w1,lights_toon_fragment:T1,lights_toon_pars_fragment:b1,lights_phong_fragment:A1,lights_phong_pars_fragment:C1,lights_physical_fragment:R1,lights_physical_pars_fragment:P1,lights_fragment_begin:L1,lights_fragment_maps:D1,lights_fragment_end:I1,logdepthbuf_fragment:N1,logdepthbuf_pars_fragment:U1,logdepthbuf_pars_vertex:k1,logdepthbuf_vertex:F1,map_fragment:O1,map_pars_fragment:B1,map_particle_fragment:z1,map_particle_pars_fragment:V1,metalnessmap_fragment:H1,metalnessmap_pars_fragment:G1,morphinstance_vertex:W1,morphcolor_vertex:q1,morphnormal_vertex:X1,morphtarget_pars_vertex:j1,morphtarget_vertex:K1,normal_fragment_begin:Y1,normal_fragment_maps:$1,normal_pars_fragment:Q1,normal_pars_vertex:J1,normal_vertex:Z1,normalmap_pars_fragment:eS,clearcoat_normal_fragment_begin:tS,clearcoat_normal_fragment_maps:nS,clearcoat_pars_fragment:iS,iridescence_pars_fragment:rS,opaque_fragment:sS,packing:oS,premultiplied_alpha_fragment:aS,project_vertex:lS,dithering_fragment:cS,dithering_pars_fragment:uS,roughnessmap_fragment:dS,roughnessmap_pars_fragment:hS,shadowmap_pars_fragment:fS,shadowmap_pars_vertex:pS,shadowmap_vertex:mS,shadowmask_pars_fragment:_S,skinbase_vertex:gS,skinning_pars_vertex:vS,skinning_vertex:yS,skinnormal_vertex:xS,specularmap_fragment:SS,specularmap_pars_fragment:MS,tonemapping_fragment:wS,tonemapping_pars_fragment:ES,transmission_fragment:TS,transmission_pars_fragment:bS,uv_pars_fragment:AS,uv_pars_vertex:CS,uv_vertex:RS,worldpos_vertex:PS,background_vert:LS,background_frag:DS,backgroundCube_vert:IS,backgroundCube_frag:NS,cube_vert:US,cube_frag:kS,depth_vert:FS,depth_frag:OS,distanceRGBA_vert:BS,distanceRGBA_frag:zS,equirect_vert:VS,equirect_frag:HS,linedashed_vert:GS,linedashed_frag:WS,meshbasic_vert:qS,meshbasic_frag:XS,meshlambert_vert:jS,meshlambert_frag:KS,meshmatcap_vert:YS,meshmatcap_frag:$S,meshnormal_vert:QS,meshnormal_frag:JS,meshphong_vert:ZS,meshphong_frag:eM,meshphysical_vert:tM,meshphysical_frag:nM,meshtoon_vert:iM,meshtoon_frag:rM,points_vert:sM,points_frag:oM,shadow_vert:aM,shadow_frag:lM,sprite_vert:cM,sprite_frag:uM},Re={common:{diffuse:{value:new $e(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ct}},envmap:{envMap:{value:null},envMapRotation:{value:new ct},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ct}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ct}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ct},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ct},normalScale:{value:new Pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ct},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ct}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ct}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ct}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $e(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new $e(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0},uvTransform:{value:new ct}},sprite:{diffuse:{value:new $e(16777215)},opacity:{value:1},center:{value:new Pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}}},Ui={basic:{uniforms:kn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:kn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new $e(0)}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:kn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new $e(0)},specular:{value:new $e(1118481)},shininess:{value:30}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:kn([Re.common,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.roughnessmap,Re.metalnessmap,Re.fog,Re.lights,{emissive:{value:new $e(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:kn([Re.common,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.gradientmap,Re.fog,Re.lights,{emissive:{value:new $e(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:kn([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:kn([Re.points,Re.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:kn([Re.common,Re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:kn([Re.common,Re.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:kn([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:kn([Re.sprite,Re.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new ct},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ct}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distanceRGBA:{uniforms:kn([Re.common,Re.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:lt.distanceRGBA_vert,fragmentShader:lt.distanceRGBA_frag},shadow:{uniforms:kn([Re.lights,Re.fog,{color:{value:new $e(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};Ui.physical={uniforms:kn([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ct},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ct},clearcoatNormalScale:{value:new Pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ct},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ct},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ct},sheen:{value:0},sheenColor:{value:new $e(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ct},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ct},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ct},transmissionSamplerSize:{value:new Pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ct},attenuationDistance:{value:0},attenuationColor:{value:new $e(0)},specularColor:{value:new $e(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ct},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ct},anisotropyVector:{value:new Pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ct}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};const oc={r:0,b:0,g:0},cs=new Oi,dM=new At;function hM(s,e,t,i,o,l,c){const d=new $e(0);let h=l===!0?0:1,p,m,_=null,v=0,S=null;function M(C){let b=C.isScene===!0?C.background:null;return b&&b.isTexture&&(b=(C.backgroundBlurriness>0?t:e).get(b)),b}function E(C){let b=!1;const P=M(C);P===null?y(d,h):P&&P.isColor&&(y(P,1),b=!0);const G=s.xr.getEnvironmentBlendMode();G==="additive"?i.buffers.color.setClear(0,0,0,1,c):G==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,c),(s.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function x(C,b){const P=M(b);P&&(P.isCubeTexture||P.mapping===Oc)?(m===void 0&&(m=new be(new bt(1,1,1),new Ln({name:"BackgroundCubeMaterial",uniforms:bo(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:Fn,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),m.geometry.deleteAttribute("uv"),m.onBeforeRender=function(G,k,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(m.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),o.update(m)),cs.copy(b.backgroundRotation),cs.x*=-1,cs.y*=-1,cs.z*=-1,P.isCubeTexture&&P.isRenderTargetTexture===!1&&(cs.y*=-1,cs.z*=-1),m.material.uniforms.envMap.value=P,m.material.uniforms.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,m.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,m.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,m.material.uniforms.backgroundRotation.value.setFromMatrix4(dM.makeRotationFromEuler(cs)),m.material.toneMapped=Tt.getTransfer(P.colorSpace)!==Bt,(_!==P||v!==P.version||S!==s.toneMapping)&&(m.material.needsUpdate=!0,_=P,v=P.version,S=s.toneMapping),m.layers.enableAll(),C.unshift(m,m.geometry,m.material,0,0,null)):P&&P.isTexture&&(p===void 0&&(p=new be(new ws(2,2),new Ln({name:"BackgroundMaterial",uniforms:bo(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:Gr,depthTest:!1,depthWrite:!1,fog:!1})),p.geometry.deleteAttribute("normal"),Object.defineProperty(p.material,"map",{get:function(){return this.uniforms.t2D.value}}),o.update(p)),p.material.uniforms.t2D.value=P,p.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,p.material.toneMapped=Tt.getTransfer(P.colorSpace)!==Bt,P.matrixAutoUpdate===!0&&P.updateMatrix(),p.material.uniforms.uvTransform.value.copy(P.matrix),(_!==P||v!==P.version||S!==s.toneMapping)&&(p.material.needsUpdate=!0,_=P,v=P.version,S=s.toneMapping),p.layers.enableAll(),C.unshift(p,p.geometry,p.material,0,0,null))}function y(C,b){C.getRGB(oc,Y_(s)),i.buffers.color.setClear(oc.r,oc.g,oc.b,b,c)}return{getClearColor:function(){return d},setClearColor:function(C,b=1){d.set(C),h=b,y(d,h)},getClearAlpha:function(){return h},setClearAlpha:function(C){h=C,y(d,h)},render:E,addToRenderList:x}}function fM(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},o=v(null);let l=o,c=!1;function d(w,L,Q,J,re){let pe=!1;const ee=_(J,Q,L);l!==ee&&(l=ee,p(l.object)),pe=S(w,J,Q,re),pe&&M(w,J,Q,re),re!==null&&e.update(re,s.ELEMENT_ARRAY_BUFFER),(pe||c)&&(c=!1,P(w,L,Q,J),re!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(re).buffer))}function h(){return s.createVertexArray()}function p(w){return s.bindVertexArray(w)}function m(w){return s.deleteVertexArray(w)}function _(w,L,Q){const J=Q.wireframe===!0;let re=i[w.id];re===void 0&&(re={},i[w.id]=re);let pe=re[L.id];pe===void 0&&(pe={},re[L.id]=pe);let ee=pe[J];return ee===void 0&&(ee=v(h()),pe[J]=ee),ee}function v(w){const L=[],Q=[],J=[];for(let re=0;re<t;re++)L[re]=0,Q[re]=0,J[re]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:Q,attributeDivisors:J,object:w,attributes:{},index:null}}function S(w,L,Q,J){const re=l.attributes,pe=L.attributes;let ee=0;const me=Q.getAttributes();for(const z in me)if(me[z].location>=0){const ae=re[z];let F=pe[z];if(F===void 0&&(z==="instanceMatrix"&&w.instanceMatrix&&(F=w.instanceMatrix),z==="instanceColor"&&w.instanceColor&&(F=w.instanceColor)),ae===void 0||ae.attribute!==F||F&&ae.data!==F.data)return!0;ee++}return l.attributesNum!==ee||l.index!==J}function M(w,L,Q,J){const re={},pe=L.attributes;let ee=0;const me=Q.getAttributes();for(const z in me)if(me[z].location>=0){let ae=pe[z];ae===void 0&&(z==="instanceMatrix"&&w.instanceMatrix&&(ae=w.instanceMatrix),z==="instanceColor"&&w.instanceColor&&(ae=w.instanceColor));const F={};F.attribute=ae,ae&&ae.data&&(F.data=ae.data),re[z]=F,ee++}l.attributes=re,l.attributesNum=ee,l.index=J}function E(){const w=l.newAttributes;for(let L=0,Q=w.length;L<Q;L++)w[L]=0}function x(w){y(w,0)}function y(w,L){const Q=l.newAttributes,J=l.enabledAttributes,re=l.attributeDivisors;Q[w]=1,J[w]===0&&(s.enableVertexAttribArray(w),J[w]=1),re[w]!==L&&(s.vertexAttribDivisor(w,L),re[w]=L)}function C(){const w=l.newAttributes,L=l.enabledAttributes;for(let Q=0,J=L.length;Q<J;Q++)L[Q]!==w[Q]&&(s.disableVertexAttribArray(Q),L[Q]=0)}function b(w,L,Q,J,re,pe,ee){ee===!0?s.vertexAttribIPointer(w,L,Q,re,pe):s.vertexAttribPointer(w,L,Q,J,re,pe)}function P(w,L,Q,J){E();const re=J.attributes,pe=Q.getAttributes(),ee=L.defaultAttributeValues;for(const me in pe){const z=pe[me];if(z.location>=0){let ue=re[me];if(ue===void 0&&(me==="instanceMatrix"&&w.instanceMatrix&&(ue=w.instanceMatrix),me==="instanceColor"&&w.instanceColor&&(ue=w.instanceColor)),ue!==void 0){const ae=ue.normalized,F=ue.itemSize,se=e.get(ue);if(se===void 0)continue;const Fe=se.buffer,Z=se.type,ce=se.bytesPerElement,xe=Z===s.INT||Z===s.UNSIGNED_INT||ue.gpuType===lf;if(ue.isInterleavedBufferAttribute){const Se=ue.data,Le=Se.stride,De=ue.offset;if(Se.isInstancedInterleavedBuffer){for(let rt=0;rt<z.locationSize;rt++)y(z.location+rt,Se.meshPerAttribute);w.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=Se.meshPerAttribute*Se.count)}else for(let rt=0;rt<z.locationSize;rt++)x(z.location+rt);s.bindBuffer(s.ARRAY_BUFFER,Fe);for(let rt=0;rt<z.locationSize;rt++)b(z.location+rt,F/z.locationSize,Z,ae,Le*ce,(De+F/z.locationSize*rt)*ce,xe)}else{if(ue.isInstancedBufferAttribute){for(let Se=0;Se<z.locationSize;Se++)y(z.location+Se,ue.meshPerAttribute);w.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=ue.meshPerAttribute*ue.count)}else for(let Se=0;Se<z.locationSize;Se++)x(z.location+Se);s.bindBuffer(s.ARRAY_BUFFER,Fe);for(let Se=0;Se<z.locationSize;Se++)b(z.location+Se,F/z.locationSize,Z,ae,F*ce,F/z.locationSize*Se*ce,xe)}}else if(ee!==void 0){const ae=ee[me];if(ae!==void 0)switch(ae.length){case 2:s.vertexAttrib2fv(z.location,ae);break;case 3:s.vertexAttrib3fv(z.location,ae);break;case 4:s.vertexAttrib4fv(z.location,ae);break;default:s.vertexAttrib1fv(z.location,ae)}}}}C()}function G(){V();for(const w in i){const L=i[w];for(const Q in L){const J=L[Q];for(const re in J)m(J[re].object),delete J[re];delete L[Q]}delete i[w]}}function k(w){if(i[w.id]===void 0)return;const L=i[w.id];for(const Q in L){const J=L[Q];for(const re in J)m(J[re].object),delete J[re];delete L[Q]}delete i[w.id]}function U(w){for(const L in i){const Q=i[L];if(Q[w.id]===void 0)continue;const J=Q[w.id];for(const re in J)m(J[re].object),delete J[re];delete Q[w.id]}}function V(){le(),c=!0,l!==o&&(l=o,p(l.object))}function le(){o.geometry=null,o.program=null,o.wireframe=!1}return{setup:d,reset:V,resetDefaultState:le,dispose:G,releaseStatesOfGeometry:k,releaseStatesOfProgram:U,initAttributes:E,enableAttribute:x,disableUnusedAttributes:C}}function pM(s,e,t){let i;function o(p){i=p}function l(p,m){s.drawArrays(i,p,m),t.update(m,i,1)}function c(p,m,_){_!==0&&(s.drawArraysInstanced(i,p,m,_),t.update(m,i,_))}function d(p,m,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,p,0,m,0,_);let S=0;for(let M=0;M<_;M++)S+=m[M];t.update(S,i,1)}function h(p,m,_,v){if(_===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let M=0;M<p.length;M++)c(p[M],m[M],v[M]);else{S.multiDrawArraysInstancedWEBGL(i,p,0,m,0,v,0,_);let M=0;for(let E=0;E<_;E++)M+=m[E];for(let E=0;E<v.length;E++)t.update(M,i,v[E])}}this.setMode=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=d,this.renderMultiDrawInstances=h}function mM(s,e,t,i){let o;function l(){if(o!==void 0)return o;if(e.has("EXT_texture_filter_anisotropic")===!0){const U=e.get("EXT_texture_filter_anisotropic");o=s.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else o=0;return o}function c(U){return!(U!==Ci&&i.convert(U)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(U){const V=U===ar&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(U!==cr&&i.convert(U)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&U!==ki&&!V)}function h(U){if(U==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let p=t.precision!==void 0?t.precision:"highp";const m=h(p);m!==p&&(console.warn("THREE.WebGLRenderer:",p,"not supported, using",m,"instead."),p=m);const _=t.logarithmicDepthBuffer===!0,v=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(v===!0){const U=e.get("EXT_clip_control");U.clipControlEXT(U.LOWER_LEFT_EXT,U.ZERO_TO_ONE_EXT)}const S=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),M=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=s.getParameter(s.MAX_TEXTURE_SIZE),x=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),y=s.getParameter(s.MAX_VERTEX_ATTRIBS),C=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),b=s.getParameter(s.MAX_VARYING_VECTORS),P=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),G=M>0,k=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:h,textureFormatReadable:c,textureTypeReadable:d,precision:p,logarithmicDepthBuffer:_,reverseDepthBuffer:v,maxTextures:S,maxVertexTextures:M,maxTextureSize:E,maxCubemapSize:x,maxAttributes:y,maxVertexUniforms:C,maxVaryings:b,maxFragmentUniforms:P,vertexTextures:G,maxSamples:k}}function _M(s){const e=this;let t=null,i=0,o=!1,l=!1;const c=new hs,d=new ct,h={value:null,needsUpdate:!1};this.uniform=h,this.numPlanes=0,this.numIntersection=0,this.init=function(_,v){const S=_.length!==0||v||i!==0||o;return o=v,i=_.length,S},this.beginShadows=function(){l=!0,m(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(_,v){t=m(_,v,0)},this.setState=function(_,v,S){const M=_.clippingPlanes,E=_.clipIntersection,x=_.clipShadows,y=s.get(_);if(!o||M===null||M.length===0||l&&!x)l?m(null):p();else{const C=l?0:i,b=C*4;let P=y.clippingState||null;h.value=P,P=m(M,v,b,S);for(let G=0;G!==b;++G)P[G]=t[G];y.clippingState=P,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=C}};function p(){h.value!==t&&(h.value=t,h.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function m(_,v,S,M){const E=_!==null?_.length:0;let x=null;if(E!==0){if(x=h.value,M!==!0||x===null){const y=S+E*4,C=v.matrixWorldInverse;d.getNormalMatrix(C),(x===null||x.length<y)&&(x=new Float32Array(y));for(let b=0,P=S;b!==E;++b,P+=4)c.copy(_[b]).applyMatrix4(C,d),c.normal.toArray(x,P),x[P+3]=c.constant}h.value=x,h.needsUpdate=!0}return e.numPlanes=E,e.numIntersection=0,x}}function gM(s){let e=new WeakMap;function t(c,d){return d===yh?c.mapping=Mo:d===xh&&(c.mapping=wo),c}function i(c){if(c&&c.isTexture){const d=c.mapping;if(d===yh||d===xh)if(e.has(c)){const h=e.get(c).texture;return t(h,c.mapping)}else{const h=c.image;if(h&&h.height>0){const p=new Cx(h.height);return p.fromEquirectangularTexture(s,c),e.set(c,p),c.addEventListener("dispose",o),t(p.texture,c.mapping)}else return null}}return c}function o(c){const d=c.target;d.removeEventListener("dispose",o);const h=e.get(d);h!==void 0&&(e.delete(d),h.dispose())}function l(){e=new WeakMap}return{get:i,dispose:l}}class yf extends $_{constructor(e=-1,t=1,i=1,o=-1,l=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=o,this.near=l,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,o,l,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=o,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,o=(this.top+this.bottom)/2;let l=i-e,c=i+e,d=o+t,h=o-t;if(this.view!==null&&this.view.enabled){const p=(this.right-this.left)/this.view.fullWidth/this.zoom,m=(this.top-this.bottom)/this.view.fullHeight/this.zoom;l+=p*this.view.offsetX,c=l+p*this.view.width,d-=m*this.view.offsetY,h=d-m*this.view.height}this.projectionMatrix.makeOrthographic(l,c,d,h,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const go=4,P0=[.125,.215,.35,.446,.526,.582],ms=20,Kd=new yf,L0=new $e;let Yd=null,$d=0,Qd=0,Jd=!1;const fs=(1+Math.sqrt(5))/2,co=1/fs,D0=[new I(-fs,co,0),new I(fs,co,0),new I(-co,0,fs),new I(co,0,fs),new I(0,fs,-co),new I(0,fs,co),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)];class $h{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,o=100){Yd=this._renderer.getRenderTarget(),$d=this._renderer.getActiveCubeFace(),Qd=this._renderer.getActiveMipmapLevel(),Jd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,o,l),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=U0(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=N0(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Yd,$d,Qd),this._renderer.xr.enabled=Jd,e.scissorTest=!1,ac(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Mo||e.mapping===wo?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Yd=this._renderer.getRenderTarget(),$d=this._renderer.getActiveCubeFace(),Qd=this._renderer.getActiveMipmapLevel(),Jd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:bi,minFilter:bi,generateMipmaps:!1,type:ar,format:Ci,colorSpace:Wr,depthBuffer:!1},o=I0(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=I0(e,t,i);const{_lodMax:l}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=vM(l)),this._blurMaterial=yM(l,e,t)}return o}_compileMaterial(e){const t=new be(this._lodPlanes[0],e);this._renderer.compile(t,Kd)}_sceneToCubeUV(e,t,i,o){const d=new ii(90,1,t,i),h=[1,-1,1,1,1,1],p=[1,1,1,-1,-1,-1],m=this._renderer,_=m.autoClear,v=m.toneMapping;m.getClearColor(L0),m.toneMapping=Hr,m.autoClear=!1;const S=new rr({name:"PMREM.Background",side:Fn,depthWrite:!1,depthTest:!1}),M=new be(new bt,S);let E=!1;const x=e.background;x?x.isColor&&(S.color.copy(x),e.background=null,E=!0):(S.color.copy(L0),E=!0);for(let y=0;y<6;y++){const C=y%3;C===0?(d.up.set(0,h[y],0),d.lookAt(p[y],0,0)):C===1?(d.up.set(0,0,h[y]),d.lookAt(0,p[y],0)):(d.up.set(0,h[y],0),d.lookAt(0,0,p[y]));const b=this._cubeSize;ac(o,C*b,y>2?b:0,b,b),m.setRenderTarget(o),E&&m.render(M,d),m.render(e,d)}M.geometry.dispose(),M.material.dispose(),m.toneMapping=v,m.autoClear=_,e.background=x}_textureToCubeUV(e,t){const i=this._renderer,o=e.mapping===Mo||e.mapping===wo;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=U0()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=N0());const l=o?this._cubemapMaterial:this._equirectMaterial,c=new be(this._lodPlanes[0],l),d=l.uniforms;d.envMap.value=e;const h=this._cubeSize;ac(t,0,0,3*h,2*h),i.setRenderTarget(t),i.render(c,Kd)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const o=this._lodPlanes.length;for(let l=1;l<o;l++){const c=Math.sqrt(this._sigmas[l]*this._sigmas[l]-this._sigmas[l-1]*this._sigmas[l-1]),d=D0[(o-l-1)%D0.length];this._blur(e,l-1,l,c,d)}t.autoClear=i}_blur(e,t,i,o,l){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,i,o,"latitudinal",l),this._halfBlur(c,e,i,i,o,"longitudinal",l)}_halfBlur(e,t,i,o,l,c,d){const h=this._renderer,p=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const m=3,_=new be(this._lodPlanes[o],p),v=p.uniforms,S=this._sizeLods[i]-1,M=isFinite(l)?Math.PI/(2*S):2*Math.PI/(2*ms-1),E=l/M,x=isFinite(l)?1+Math.floor(m*E):ms;x>ms&&console.warn(`sigmaRadians, ${l}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${ms}`);const y=[];let C=0;for(let U=0;U<ms;++U){const V=U/E,le=Math.exp(-V*V/2);y.push(le),U===0?C+=le:U<x&&(C+=2*le)}for(let U=0;U<y.length;U++)y[U]=y[U]/C;v.envMap.value=e.texture,v.samples.value=x,v.weights.value=y,v.latitudinal.value=c==="latitudinal",d&&(v.poleAxis.value=d);const{_lodMax:b}=this;v.dTheta.value=M,v.mipInt.value=b-i;const P=this._sizeLods[o],G=3*P*(o>b-go?o-b+go:0),k=4*(this._cubeSize-P);ac(t,G,k,3*P,2*P),h.setRenderTarget(t),h.render(_,Kd)}}function vM(s){const e=[],t=[],i=[];let o=s;const l=s-go+1+P0.length;for(let c=0;c<l;c++){const d=Math.pow(2,o);t.push(d);let h=1/d;c>s-go?h=P0[c-s+go-1]:c===0&&(h=0),i.push(h);const p=1/(d-2),m=-p,_=1+p,v=[m,m,_,m,_,_,m,m,_,_,m,_],S=6,M=6,E=3,x=2,y=1,C=new Float32Array(E*M*S),b=new Float32Array(x*M*S),P=new Float32Array(y*M*S);for(let k=0;k<S;k++){const U=k%3*2/3-1,V=k>2?0:-1,le=[U,V,0,U+2/3,V,0,U+2/3,V+1,0,U,V,0,U+2/3,V+1,0,U,V+1,0];C.set(le,E*M*k),b.set(v,x*M*k);const w=[k,k,k,k,k,k];P.set(w,y*M*k)}const G=new Jt;G.setAttribute("position",new jn(C,E)),G.setAttribute("uv",new jn(b,x)),G.setAttribute("faceIndex",new jn(P,y)),e.push(G),o>go&&o--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function I0(s,e,t){const i=new Ri(s,e,t);return i.texture.mapping=Oc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ac(s,e,t,i,o){s.viewport.set(e,t,i,o),s.scissor.set(e,t,i,o)}function yM(s,e,t){const i=new Float32Array(ms),o=new I(0,1,0);return new Ln({name:"SphericalGaussianBlur",defines:{n:ms,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:xf(),fragmentShader:`

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
		`,blending:or,depthTest:!1,depthWrite:!1})}function N0(){return new Ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:xf(),fragmentShader:`

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
		`,blending:or,depthTest:!1,depthWrite:!1})}function U0(){return new Ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:xf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:or,depthTest:!1,depthWrite:!1})}function xf(){return`

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
	`}function xM(s){let e=new WeakMap,t=null;function i(d){if(d&&d.isTexture){const h=d.mapping,p=h===yh||h===xh,m=h===Mo||h===wo;if(p||m){let _=e.get(d);const v=_!==void 0?_.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==v)return t===null&&(t=new $h(s)),_=p?t.fromEquirectangular(d,_):t.fromCubemap(d,_),_.texture.pmremVersion=d.pmremVersion,e.set(d,_),_.texture;if(_!==void 0)return _.texture;{const S=d.image;return p&&S&&S.height>0||m&&S&&o(S)?(t===null&&(t=new $h(s)),_=p?t.fromEquirectangular(d):t.fromCubemap(d),_.texture.pmremVersion=d.pmremVersion,e.set(d,_),d.addEventListener("dispose",l),_.texture):null}}}return d}function o(d){let h=0;const p=6;for(let m=0;m<p;m++)d[m]!==void 0&&h++;return h===p}function l(d){const h=d.target;h.removeEventListener("dispose",l);const p=e.get(h);p!==void 0&&(e.delete(h),p.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:c}}function SM(s){const e={};function t(i){if(e[i]!==void 0)return e[i];let o;switch(i){case"WEBGL_depth_texture":o=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":o=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":o=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":o=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:o=s.getExtension(i)}return e[i]=o,o}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const o=t(i);return o===null&&Tc("THREE.WebGLRenderer: "+i+" extension not supported."),o}}}function MM(s,e,t,i){const o={},l=new WeakMap;function c(_){const v=_.target;v.index!==null&&e.remove(v.index);for(const M in v.attributes)e.remove(v.attributes[M]);for(const M in v.morphAttributes){const E=v.morphAttributes[M];for(let x=0,y=E.length;x<y;x++)e.remove(E[x])}v.removeEventListener("dispose",c),delete o[v.id];const S=l.get(v);S&&(e.remove(S),l.delete(v)),i.releaseStatesOfGeometry(v),v.isInstancedBufferGeometry===!0&&delete v._maxInstanceCount,t.memory.geometries--}function d(_,v){return o[v.id]===!0||(v.addEventListener("dispose",c),o[v.id]=!0,t.memory.geometries++),v}function h(_){const v=_.attributes;for(const M in v)e.update(v[M],s.ARRAY_BUFFER);const S=_.morphAttributes;for(const M in S){const E=S[M];for(let x=0,y=E.length;x<y;x++)e.update(E[x],s.ARRAY_BUFFER)}}function p(_){const v=[],S=_.index,M=_.attributes.position;let E=0;if(S!==null){const C=S.array;E=S.version;for(let b=0,P=C.length;b<P;b+=3){const G=C[b+0],k=C[b+1],U=C[b+2];v.push(G,k,k,U,U,G)}}else if(M!==void 0){const C=M.array;E=M.version;for(let b=0,P=C.length/3-1;b<P;b+=3){const G=b+0,k=b+1,U=b+2;v.push(G,k,k,U,U,G)}}else return;const x=new(G_(v)?K_:j_)(v,1);x.version=E;const y=l.get(_);y&&e.remove(y),l.set(_,x)}function m(_){const v=l.get(_);if(v){const S=_.index;S!==null&&v.version<S.version&&p(_)}else p(_);return l.get(_)}return{get:d,update:h,getWireframeAttribute:m}}function wM(s,e,t){let i;function o(v){i=v}let l,c;function d(v){l=v.type,c=v.bytesPerElement}function h(v,S){s.drawElements(i,S,l,v*c),t.update(S,i,1)}function p(v,S,M){M!==0&&(s.drawElementsInstanced(i,S,l,v*c,M),t.update(S,i,M))}function m(v,S,M){if(M===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,S,0,l,v,0,M);let x=0;for(let y=0;y<M;y++)x+=S[y];t.update(x,i,1)}function _(v,S,M,E){if(M===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let y=0;y<v.length;y++)p(v[y]/c,S[y],E[y]);else{x.multiDrawElementsInstancedWEBGL(i,S,0,l,v,0,E,0,M);let y=0;for(let C=0;C<M;C++)y+=S[C];for(let C=0;C<E.length;C++)t.update(y,i,E[C])}}this.setMode=o,this.setIndex=d,this.render=h,this.renderInstances=p,this.renderMultiDraw=m,this.renderMultiDrawInstances=_}function EM(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(l,c,d){switch(t.calls++,c){case s.TRIANGLES:t.triangles+=d*(l/3);break;case s.LINES:t.lines+=d*(l/2);break;case s.LINE_STRIP:t.lines+=d*(l-1);break;case s.LINE_LOOP:t.lines+=d*l;break;case s.POINTS:t.points+=d*l;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function o(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:o,update:i}}function TM(s,e,t){const i=new WeakMap,o=new Nt;function l(c,d,h){const p=c.morphTargetInfluences,m=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,_=m!==void 0?m.length:0;let v=i.get(d);if(v===void 0||v.count!==_){let le=function(){U.dispose(),i.delete(d),d.removeEventListener("dispose",le)};v!==void 0&&v.texture.dispose();const S=d.morphAttributes.position!==void 0,M=d.morphAttributes.normal!==void 0,E=d.morphAttributes.color!==void 0,x=d.morphAttributes.position||[],y=d.morphAttributes.normal||[],C=d.morphAttributes.color||[];let b=0;S===!0&&(b=1),M===!0&&(b=2),E===!0&&(b=3);let P=d.attributes.position.count*b,G=1;P>e.maxTextureSize&&(G=Math.ceil(P/e.maxTextureSize),P=e.maxTextureSize);const k=new Float32Array(P*G*4*_),U=new q_(k,P,G,_);U.type=ki,U.needsUpdate=!0;const V=b*4;for(let w=0;w<_;w++){const L=x[w],Q=y[w],J=C[w],re=P*G*4*w;for(let pe=0;pe<L.count;pe++){const ee=pe*V;S===!0&&(o.fromBufferAttribute(L,pe),k[re+ee+0]=o.x,k[re+ee+1]=o.y,k[re+ee+2]=o.z,k[re+ee+3]=0),M===!0&&(o.fromBufferAttribute(Q,pe),k[re+ee+4]=o.x,k[re+ee+5]=o.y,k[re+ee+6]=o.z,k[re+ee+7]=0),E===!0&&(o.fromBufferAttribute(J,pe),k[re+ee+8]=o.x,k[re+ee+9]=o.y,k[re+ee+10]=o.z,k[re+ee+11]=J.itemSize===4?o.w:1)}}v={count:_,texture:U,size:new Pe(P,G)},i.set(d,v),d.addEventListener("dispose",le)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)h.getUniforms().setValue(s,"morphTexture",c.morphTexture,t);else{let S=0;for(let E=0;E<p.length;E++)S+=p[E];const M=d.morphTargetsRelative?1:1-S;h.getUniforms().setValue(s,"morphTargetBaseInfluence",M),h.getUniforms().setValue(s,"morphTargetInfluences",p)}h.getUniforms().setValue(s,"morphTargetsTexture",v.texture,t),h.getUniforms().setValue(s,"morphTargetsTextureSize",v.size)}return{update:l}}function bM(s,e,t,i){let o=new WeakMap;function l(h){const p=i.render.frame,m=h.geometry,_=e.get(h,m);if(o.get(_)!==p&&(e.update(_),o.set(_,p)),h.isInstancedMesh&&(h.hasEventListener("dispose",d)===!1&&h.addEventListener("dispose",d),o.get(h)!==p&&(t.update(h.instanceMatrix,s.ARRAY_BUFFER),h.instanceColor!==null&&t.update(h.instanceColor,s.ARRAY_BUFFER),o.set(h,p))),h.isSkinnedMesh){const v=h.skeleton;o.get(v)!==p&&(v.update(),o.set(v,p))}return _}function c(){o=new WeakMap}function d(h){const p=h.target;p.removeEventListener("dispose",d),t.remove(p.instanceMatrix),p.instanceColor!==null&&t.remove(p.instanceColor)}return{update:l,dispose:c}}class Z_ extends Dn{constructor(e,t,i,o,l,c,d,h,p,m=yo){if(m!==yo&&m!==To)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&m===yo&&(i=xs),i===void 0&&m===To&&(i=Eo),super(null,o,l,c,d,h,m,i,p),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=d!==void 0?d:Xn,this.minFilter=h!==void 0?h:Xn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const eg=new Dn,k0=new Z_(1,1),tg=new q_,ng=new fx,ig=new Q_,F0=[],O0=[],B0=new Float32Array(16),z0=new Float32Array(9),V0=new Float32Array(4);function Lo(s,e,t){const i=s[0];if(i<=0||i>0)return s;const o=e*t;let l=F0[o];if(l===void 0&&(l=new Float32Array(o),F0[o]=l),e!==0){i.toArray(l,0);for(let c=1,d=0;c!==e;++c)d+=t,s[c].toArray(l,d)}return l}function nn(s,e){if(s.length!==e.length)return!1;for(let t=0,i=s.length;t<i;t++)if(s[t]!==e[t])return!1;return!0}function rn(s,e){for(let t=0,i=e.length;t<i;t++)s[t]=e[t]}function Vc(s,e){let t=O0[e];t===void 0&&(t=new Int32Array(e),O0[e]=t);for(let i=0;i!==e;++i)t[i]=s.allocateTextureUnit();return t}function AM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function CM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(nn(t,e))return;s.uniform2fv(this.addr,e),rn(t,e)}}function RM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(nn(t,e))return;s.uniform3fv(this.addr,e),rn(t,e)}}function PM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(nn(t,e))return;s.uniform4fv(this.addr,e),rn(t,e)}}function LM(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(nn(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),rn(t,e)}else{if(nn(t,i))return;V0.set(i),s.uniformMatrix2fv(this.addr,!1,V0),rn(t,i)}}function DM(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(nn(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),rn(t,e)}else{if(nn(t,i))return;z0.set(i),s.uniformMatrix3fv(this.addr,!1,z0),rn(t,i)}}function IM(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(nn(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),rn(t,e)}else{if(nn(t,i))return;B0.set(i),s.uniformMatrix4fv(this.addr,!1,B0),rn(t,i)}}function NM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function UM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(nn(t,e))return;s.uniform2iv(this.addr,e),rn(t,e)}}function kM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(nn(t,e))return;s.uniform3iv(this.addr,e),rn(t,e)}}function FM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(nn(t,e))return;s.uniform4iv(this.addr,e),rn(t,e)}}function OM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function BM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(nn(t,e))return;s.uniform2uiv(this.addr,e),rn(t,e)}}function zM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(nn(t,e))return;s.uniform3uiv(this.addr,e),rn(t,e)}}function VM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(nn(t,e))return;s.uniform4uiv(this.addr,e),rn(t,e)}}function HM(s,e,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(s.uniform1i(this.addr,o),i[0]=o);let l;this.type===s.SAMPLER_2D_SHADOW?(k0.compareFunction=H_,l=k0):l=eg,t.setTexture2D(e||l,o)}function GM(s,e,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(s.uniform1i(this.addr,o),i[0]=o),t.setTexture3D(e||ng,o)}function WM(s,e,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(s.uniform1i(this.addr,o),i[0]=o),t.setTextureCube(e||ig,o)}function qM(s,e,t){const i=this.cache,o=t.allocateTextureUnit();i[0]!==o&&(s.uniform1i(this.addr,o),i[0]=o),t.setTexture2DArray(e||tg,o)}function XM(s){switch(s){case 5126:return AM;case 35664:return CM;case 35665:return RM;case 35666:return PM;case 35674:return LM;case 35675:return DM;case 35676:return IM;case 5124:case 35670:return NM;case 35667:case 35671:return UM;case 35668:case 35672:return kM;case 35669:case 35673:return FM;case 5125:return OM;case 36294:return BM;case 36295:return zM;case 36296:return VM;case 35678:case 36198:case 36298:case 36306:case 35682:return HM;case 35679:case 36299:case 36307:return GM;case 35680:case 36300:case 36308:case 36293:return WM;case 36289:case 36303:case 36311:case 36292:return qM}}function jM(s,e){s.uniform1fv(this.addr,e)}function KM(s,e){const t=Lo(e,this.size,2);s.uniform2fv(this.addr,t)}function YM(s,e){const t=Lo(e,this.size,3);s.uniform3fv(this.addr,t)}function $M(s,e){const t=Lo(e,this.size,4);s.uniform4fv(this.addr,t)}function QM(s,e){const t=Lo(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function JM(s,e){const t=Lo(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function ZM(s,e){const t=Lo(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function ew(s,e){s.uniform1iv(this.addr,e)}function tw(s,e){s.uniform2iv(this.addr,e)}function nw(s,e){s.uniform3iv(this.addr,e)}function iw(s,e){s.uniform4iv(this.addr,e)}function rw(s,e){s.uniform1uiv(this.addr,e)}function sw(s,e){s.uniform2uiv(this.addr,e)}function ow(s,e){s.uniform3uiv(this.addr,e)}function aw(s,e){s.uniform4uiv(this.addr,e)}function lw(s,e,t){const i=this.cache,o=e.length,l=Vc(t,o);nn(i,l)||(s.uniform1iv(this.addr,l),rn(i,l));for(let c=0;c!==o;++c)t.setTexture2D(e[c]||eg,l[c])}function cw(s,e,t){const i=this.cache,o=e.length,l=Vc(t,o);nn(i,l)||(s.uniform1iv(this.addr,l),rn(i,l));for(let c=0;c!==o;++c)t.setTexture3D(e[c]||ng,l[c])}function uw(s,e,t){const i=this.cache,o=e.length,l=Vc(t,o);nn(i,l)||(s.uniform1iv(this.addr,l),rn(i,l));for(let c=0;c!==o;++c)t.setTextureCube(e[c]||ig,l[c])}function dw(s,e,t){const i=this.cache,o=e.length,l=Vc(t,o);nn(i,l)||(s.uniform1iv(this.addr,l),rn(i,l));for(let c=0;c!==o;++c)t.setTexture2DArray(e[c]||tg,l[c])}function hw(s){switch(s){case 5126:return jM;case 35664:return KM;case 35665:return YM;case 35666:return $M;case 35674:return QM;case 35675:return JM;case 35676:return ZM;case 5124:case 35670:return ew;case 35667:case 35671:return tw;case 35668:case 35672:return nw;case 35669:case 35673:return iw;case 5125:return rw;case 36294:return sw;case 36295:return ow;case 36296:return aw;case 35678:case 36198:case 36298:case 36306:case 35682:return lw;case 35679:case 36299:case 36307:return cw;case 35680:case 36300:case 36308:case 36293:return uw;case 36289:case 36303:case 36311:case 36292:return dw}}class fw{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=XM(t.type)}}class pw{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=hw(t.type)}}class mw{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const o=this.seq;for(let l=0,c=o.length;l!==c;++l){const d=o[l];d.setValue(e,t[d.id],i)}}}const Zd=/(\w+)(\])?(\[|\.)?/g;function H0(s,e){s.seq.push(e),s.map[e.id]=e}function _w(s,e,t){const i=s.name,o=i.length;for(Zd.lastIndex=0;;){const l=Zd.exec(i),c=Zd.lastIndex;let d=l[1];const h=l[2]==="]",p=l[3];if(h&&(d=d|0),p===void 0||p==="["&&c+2===o){H0(t,p===void 0?new fw(d,s,e):new pw(d,s,e));break}else{let _=t.map[d];_===void 0&&(_=new mw(d),H0(t,_)),t=_}}}class bc{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const l=e.getActiveUniform(t,o),c=e.getUniformLocation(t,l.name);_w(l,c,this)}}setValue(e,t,i,o){const l=this.map[t];l!==void 0&&l.setValue(e,i,o)}setOptional(e,t,i){const o=t[i];o!==void 0&&this.setValue(e,i,o)}static upload(e,t,i,o){for(let l=0,c=t.length;l!==c;++l){const d=t[l],h=i[d.id];h.needsUpdate!==!1&&d.setValue(e,h.value,o)}}static seqWithValue(e,t){const i=[];for(let o=0,l=e.length;o!==l;++o){const c=e[o];c.id in t&&i.push(c)}return i}}function G0(s,e,t){const i=s.createShader(e);return s.shaderSource(i,t),s.compileShader(i),i}const gw=37297;let vw=0;function yw(s,e){const t=s.split(`
`),i=[],o=Math.max(e-6,0),l=Math.min(e+6,t.length);for(let c=o;c<l;c++){const d=c+1;i.push(`${d===e?">":" "} ${d}: ${t[c]}`)}return i.join(`
`)}function xw(s){const e=Tt.getPrimaries(Tt.workingColorSpace),t=Tt.getPrimaries(s);let i;switch(e===t?i="":e===Lc&&t===Pc?i="LinearDisplayP3ToLinearSRGB":e===Pc&&t===Lc&&(i="LinearSRGBToLinearDisplayP3"),s){case Wr:case Bc:return[i,"LinearTransferOETF"];case wi:case mf:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",s),[i,"LinearTransferOETF"]}}function W0(s,e,t){const i=s.getShaderParameter(e,s.COMPILE_STATUS),o=s.getShaderInfoLog(e).trim();if(i&&o==="")return"";const l=/ERROR: 0:(\d+)/.exec(o);if(l){const c=parseInt(l[1]);return t.toUpperCase()+`

`+o+`

`+yw(s.getShaderSource(e),c)}else return o}function Sw(s,e){const t=xw(e);return`vec4 ${s}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function Mw(s,e){let t;switch(e){case b_:t="Linear";break;case A_:t="Reinhard";break;case C_:t="Cineon";break;case af:t="ACESFilmic";break;case R_:t="AgX";break;case P_:t="Neutral";break;case Py:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const lc=new I;function ww(){Tt.getLuminanceCoefficients(lc);const s=lc.x.toFixed(4),e=lc.y.toFixed(4),t=lc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ew(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ba).join(`
`)}function Tw(s){const e=[];for(const t in s){const i=s[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function bw(s,e){const t={},i=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let o=0;o<i;o++){const l=s.getActiveAttrib(e,o),c=l.name;let d=1;l.type===s.FLOAT_MAT2&&(d=2),l.type===s.FLOAT_MAT3&&(d=3),l.type===s.FLOAT_MAT4&&(d=4),t[c]={type:l.type,location:s.getAttribLocation(e,c),locationSize:d}}return t}function ba(s){return s!==""}function q0(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function X0(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Aw=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qh(s){return s.replace(Aw,Rw)}const Cw=new Map;function Rw(s,e){let t=lt[e];if(t===void 0){const i=Cw.get(e);if(i!==void 0)t=lt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Qh(t)}const Pw=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function j0(s){return s.replace(Pw,Lw)}function Lw(s,e,t,i){let o="";for(let l=parseInt(e);l<parseInt(t);l++)o+=i.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return o}function K0(s){let e=`precision ${s.precision} float;
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
#define LOW_PRECISION`),e}function Dw(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===w_?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===E_?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===nr&&(e="SHADOWMAP_TYPE_VSM"),e}function Iw(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Mo:case wo:e="ENVMAP_TYPE_CUBE";break;case Oc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Nw(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case wo:e="ENVMAP_MODE_REFRACTION";break}return e}function Uw(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case T_:e="ENVMAP_BLENDING_MULTIPLY";break;case Cy:e="ENVMAP_BLENDING_MIX";break;case Ry:e="ENVMAP_BLENDING_ADD";break}return e}function kw(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Fw(s,e,t,i){const o=s.getContext(),l=t.defines;let c=t.vertexShader,d=t.fragmentShader;const h=Dw(t),p=Iw(t),m=Nw(t),_=Uw(t),v=kw(t),S=Ew(t),M=Tw(l),E=o.createProgram();let x,y,C=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(ba).join(`
`),x.length>0&&(x+=`
`),y=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(ba).join(`
`),y.length>0&&(y+=`
`)):(x=[K0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ba).join(`
`),y=[K0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+p:"",t.envMap?"#define "+m:"",t.envMap?"#define "+_:"",v?"#define CUBEUV_TEXEL_WIDTH "+v.texelWidth:"",v?"#define CUBEUV_TEXEL_HEIGHT "+v.texelHeight:"",v?"#define CUBEUV_MAX_MIP "+v.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Hr?"#define TONE_MAPPING":"",t.toneMapping!==Hr?lt.tonemapping_pars_fragment:"",t.toneMapping!==Hr?Mw("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,Sw("linearToOutputTexel",t.outputColorSpace),ww(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ba).join(`
`)),c=Qh(c),c=q0(c,t),c=X0(c,t),d=Qh(d),d=q0(d,t),d=X0(d,t),c=j0(c),d=j0(d),t.isRawShaderMaterial!==!0&&(C=`#version 300 es
`,x=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,y=["#define varying in",t.glslVersion===d0?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===d0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);const b=C+x+c,P=C+y+d,G=G0(o,o.VERTEX_SHADER,b),k=G0(o,o.FRAGMENT_SHADER,P);o.attachShader(E,G),o.attachShader(E,k),t.index0AttributeName!==void 0?o.bindAttribLocation(E,0,t.index0AttributeName):t.morphTargets===!0&&o.bindAttribLocation(E,0,"position"),o.linkProgram(E);function U(L){if(s.debug.checkShaderErrors){const Q=o.getProgramInfoLog(E).trim(),J=o.getShaderInfoLog(G).trim(),re=o.getShaderInfoLog(k).trim();let pe=!0,ee=!0;if(o.getProgramParameter(E,o.LINK_STATUS)===!1)if(pe=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(o,E,G,k);else{const me=W0(o,G,"vertex"),z=W0(o,k,"fragment");console.error("THREE.WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(E,o.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+Q+`
`+me+`
`+z)}else Q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Q):(J===""||re==="")&&(ee=!1);ee&&(L.diagnostics={runnable:pe,programLog:Q,vertexShader:{log:J,prefix:x},fragmentShader:{log:re,prefix:y}})}o.deleteShader(G),o.deleteShader(k),V=new bc(o,E),le=bw(o,E)}let V;this.getUniforms=function(){return V===void 0&&U(this),V};let le;this.getAttributes=function(){return le===void 0&&U(this),le};let w=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=o.getProgramParameter(E,gw)),w},this.destroy=function(){i.releaseStatesOfProgram(this),o.deleteProgram(E),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=vw++,this.cacheKey=e,this.usedTimes=1,this.program=E,this.vertexShader=G,this.fragmentShader=k,this}let Ow=0;class Bw{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,o=this._getShaderStage(t),l=this._getShaderStage(i),c=this._getShaderCacheForMaterial(e);return c.has(o)===!1&&(c.add(o),o.usedTimes++),c.has(l)===!1&&(c.add(l),l.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new zw(e),t.set(e,i)),i}}class zw{constructor(e){this.id=Ow++,this.code=e,this.usedTimes=0}}function Vw(s,e,t,i,o,l,c){const d=new gf,h=new Bw,p=new Set,m=[],_=o.logarithmicDepthBuffer,v=o.reverseDepthBuffer,S=o.vertexTextures;let M=o.precision;const E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(w){return p.add(w),w===0?"uv":`uv${w}`}function y(w,L,Q,J,re){const pe=J.fog,ee=re.geometry,me=w.isMeshStandardMaterial?J.environment:null,z=(w.isMeshStandardMaterial?t:e).get(w.envMap||me),ue=z&&z.mapping===Oc?z.image.height:null,ae=E[w.type];w.precision!==null&&(M=o.getMaxPrecision(w.precision),M!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",M,"instead."));const F=ee.morphAttributes.position||ee.morphAttributes.normal||ee.morphAttributes.color,se=F!==void 0?F.length:0;let Fe=0;ee.morphAttributes.position!==void 0&&(Fe=1),ee.morphAttributes.normal!==void 0&&(Fe=2),ee.morphAttributes.color!==void 0&&(Fe=3);let Z,ce,xe,Se;if(ae){const sn=Ui[ae];Z=sn.vertexShader,ce=sn.fragmentShader}else Z=w.vertexShader,ce=w.fragmentShader,h.update(w),xe=h.getVertexShaderID(w),Se=h.getFragmentShaderID(w);const Le=s.getRenderTarget(),De=re.isInstancedMesh===!0,rt=re.isBatchedMesh===!0,yt=!!w.map,ft=!!w.matcap,B=!!z,vn=!!w.aoMap,ht=!!w.lightMap,_t=!!w.bumpMap,et=!!w.normalMap,Dt=!!w.displacementMap,nt=!!w.emissiveMap,D=!!w.metalnessMap,A=!!w.roughnessMap,$=w.anisotropy>0,he=w.clearcoat>0,ve=w.dispersion>0,de=w.iridescence>0,Ye=w.sheen>0,Ae=w.transmission>0,Oe=$&&!!w.anisotropyMap,gt=he&&!!w.clearcoatMap,Me=he&&!!w.clearcoatNormalMap,Be=he&&!!w.clearcoatRoughnessMap,st=de&&!!w.iridescenceMap,it=de&&!!w.iridescenceThicknessMap,He=Ye&&!!w.sheenColorMap,pt=Ye&&!!w.sheenRoughnessMap,at=!!w.specularMap,Rt=!!w.specularColorMap,W=!!w.specularIntensityMap,Ie=Ae&&!!w.transmissionMap,oe=Ae&&!!w.thicknessMap,fe=!!w.gradientMap,Ce=!!w.alphaMap,Ue=w.alphaTest>0,mt=!!w.alphaHash,Wt=!!w.extensions;let yn=Hr;w.toneMapped&&(Le===null||Le.isXRRenderTarget===!0)&&(yn=s.toneMapping);const vt={shaderID:ae,shaderType:w.type,shaderName:w.name,vertexShader:Z,fragmentShader:ce,defines:w.defines,customVertexShaderID:xe,customFragmentShaderID:Se,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:M,batching:rt,batchingColor:rt&&re._colorsTexture!==null,instancing:De,instancingColor:De&&re.instanceColor!==null,instancingMorph:De&&re.morphTexture!==null,supportsVertexTextures:S,outputColorSpace:Le===null?s.outputColorSpace:Le.isXRRenderTarget===!0?Le.texture.colorSpace:Wr,alphaToCoverage:!!w.alphaToCoverage,map:yt,matcap:ft,envMap:B,envMapMode:B&&z.mapping,envMapCubeUVHeight:ue,aoMap:vn,lightMap:ht,bumpMap:_t,normalMap:et,displacementMap:S&&Dt,emissiveMap:nt,normalMapObjectSpace:et&&w.normalMapType===Ny,normalMapTangentSpace:et&&w.normalMapType===V_,metalnessMap:D,roughnessMap:A,anisotropy:$,anisotropyMap:Oe,clearcoat:he,clearcoatMap:gt,clearcoatNormalMap:Me,clearcoatRoughnessMap:Be,dispersion:ve,iridescence:de,iridescenceMap:st,iridescenceThicknessMap:it,sheen:Ye,sheenColorMap:He,sheenRoughnessMap:pt,specularMap:at,specularColorMap:Rt,specularIntensityMap:W,transmission:Ae,transmissionMap:Ie,thicknessMap:oe,gradientMap:fe,opaque:w.transparent===!1&&w.blending===vo&&w.alphaToCoverage===!1,alphaMap:Ce,alphaTest:Ue,alphaHash:mt,combine:w.combine,mapUv:yt&&x(w.map.channel),aoMapUv:vn&&x(w.aoMap.channel),lightMapUv:ht&&x(w.lightMap.channel),bumpMapUv:_t&&x(w.bumpMap.channel),normalMapUv:et&&x(w.normalMap.channel),displacementMapUv:Dt&&x(w.displacementMap.channel),emissiveMapUv:nt&&x(w.emissiveMap.channel),metalnessMapUv:D&&x(w.metalnessMap.channel),roughnessMapUv:A&&x(w.roughnessMap.channel),anisotropyMapUv:Oe&&x(w.anisotropyMap.channel),clearcoatMapUv:gt&&x(w.clearcoatMap.channel),clearcoatNormalMapUv:Me&&x(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Be&&x(w.clearcoatRoughnessMap.channel),iridescenceMapUv:st&&x(w.iridescenceMap.channel),iridescenceThicknessMapUv:it&&x(w.iridescenceThicknessMap.channel),sheenColorMapUv:He&&x(w.sheenColorMap.channel),sheenRoughnessMapUv:pt&&x(w.sheenRoughnessMap.channel),specularMapUv:at&&x(w.specularMap.channel),specularColorMapUv:Rt&&x(w.specularColorMap.channel),specularIntensityMapUv:W&&x(w.specularIntensityMap.channel),transmissionMapUv:Ie&&x(w.transmissionMap.channel),thicknessMapUv:oe&&x(w.thicknessMap.channel),alphaMapUv:Ce&&x(w.alphaMap.channel),vertexTangents:!!ee.attributes.tangent&&(et||$),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!ee.attributes.color&&ee.attributes.color.itemSize===4,pointsUvs:re.isPoints===!0&&!!ee.attributes.uv&&(yt||Ce),fog:!!pe,useFog:w.fog===!0,fogExp2:!!pe&&pe.isFogExp2,flatShading:w.flatShading===!0,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:_,reverseDepthBuffer:v,skinning:re.isSkinnedMesh===!0,morphTargets:ee.morphAttributes.position!==void 0,morphNormals:ee.morphAttributes.normal!==void 0,morphColors:ee.morphAttributes.color!==void 0,morphTargetsCount:se,morphTextureStride:Fe,numDirLights:L.directional.length,numPointLights:L.point.length,numSpotLights:L.spot.length,numSpotLightMaps:L.spotLightMap.length,numRectAreaLights:L.rectArea.length,numHemiLights:L.hemi.length,numDirLightShadows:L.directionalShadowMap.length,numPointLightShadows:L.pointShadowMap.length,numSpotLightShadows:L.spotShadowMap.length,numSpotLightShadowsWithMaps:L.numSpotLightShadowsWithMaps,numLightProbes:L.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:w.dithering,shadowMapEnabled:s.shadowMap.enabled&&Q.length>0,shadowMapType:s.shadowMap.type,toneMapping:yn,decodeVideoTexture:yt&&w.map.isVideoTexture===!0&&Tt.getTransfer(w.map.colorSpace)===Bt,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===Ti,flipSided:w.side===Fn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:Wt&&w.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Wt&&w.extensions.multiDraw===!0||rt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return vt.vertexUv1s=p.has(1),vt.vertexUv2s=p.has(2),vt.vertexUv3s=p.has(3),p.clear(),vt}function C(w){const L=[];if(w.shaderID?L.push(w.shaderID):(L.push(w.customVertexShaderID),L.push(w.customFragmentShaderID)),w.defines!==void 0)for(const Q in w.defines)L.push(Q),L.push(w.defines[Q]);return w.isRawShaderMaterial===!1&&(b(L,w),P(L,w),L.push(s.outputColorSpace)),L.push(w.customProgramCacheKey),L.join()}function b(w,L){w.push(L.precision),w.push(L.outputColorSpace),w.push(L.envMapMode),w.push(L.envMapCubeUVHeight),w.push(L.mapUv),w.push(L.alphaMapUv),w.push(L.lightMapUv),w.push(L.aoMapUv),w.push(L.bumpMapUv),w.push(L.normalMapUv),w.push(L.displacementMapUv),w.push(L.emissiveMapUv),w.push(L.metalnessMapUv),w.push(L.roughnessMapUv),w.push(L.anisotropyMapUv),w.push(L.clearcoatMapUv),w.push(L.clearcoatNormalMapUv),w.push(L.clearcoatRoughnessMapUv),w.push(L.iridescenceMapUv),w.push(L.iridescenceThicknessMapUv),w.push(L.sheenColorMapUv),w.push(L.sheenRoughnessMapUv),w.push(L.specularMapUv),w.push(L.specularColorMapUv),w.push(L.specularIntensityMapUv),w.push(L.transmissionMapUv),w.push(L.thicknessMapUv),w.push(L.combine),w.push(L.fogExp2),w.push(L.sizeAttenuation),w.push(L.morphTargetsCount),w.push(L.morphAttributeCount),w.push(L.numDirLights),w.push(L.numPointLights),w.push(L.numSpotLights),w.push(L.numSpotLightMaps),w.push(L.numHemiLights),w.push(L.numRectAreaLights),w.push(L.numDirLightShadows),w.push(L.numPointLightShadows),w.push(L.numSpotLightShadows),w.push(L.numSpotLightShadowsWithMaps),w.push(L.numLightProbes),w.push(L.shadowMapType),w.push(L.toneMapping),w.push(L.numClippingPlanes),w.push(L.numClipIntersection),w.push(L.depthPacking)}function P(w,L){d.disableAll(),L.supportsVertexTextures&&d.enable(0),L.instancing&&d.enable(1),L.instancingColor&&d.enable(2),L.instancingMorph&&d.enable(3),L.matcap&&d.enable(4),L.envMap&&d.enable(5),L.normalMapObjectSpace&&d.enable(6),L.normalMapTangentSpace&&d.enable(7),L.clearcoat&&d.enable(8),L.iridescence&&d.enable(9),L.alphaTest&&d.enable(10),L.vertexColors&&d.enable(11),L.vertexAlphas&&d.enable(12),L.vertexUv1s&&d.enable(13),L.vertexUv2s&&d.enable(14),L.vertexUv3s&&d.enable(15),L.vertexTangents&&d.enable(16),L.anisotropy&&d.enable(17),L.alphaHash&&d.enable(18),L.batching&&d.enable(19),L.dispersion&&d.enable(20),L.batchingColor&&d.enable(21),w.push(d.mask),d.disableAll(),L.fog&&d.enable(0),L.useFog&&d.enable(1),L.flatShading&&d.enable(2),L.logarithmicDepthBuffer&&d.enable(3),L.reverseDepthBuffer&&d.enable(4),L.skinning&&d.enable(5),L.morphTargets&&d.enable(6),L.morphNormals&&d.enable(7),L.morphColors&&d.enable(8),L.premultipliedAlpha&&d.enable(9),L.shadowMapEnabled&&d.enable(10),L.doubleSided&&d.enable(11),L.flipSided&&d.enable(12),L.useDepthPacking&&d.enable(13),L.dithering&&d.enable(14),L.transmission&&d.enable(15),L.sheen&&d.enable(16),L.opaque&&d.enable(17),L.pointsUvs&&d.enable(18),L.decodeVideoTexture&&d.enable(19),L.alphaToCoverage&&d.enable(20),w.push(d.mask)}function G(w){const L=E[w.type];let Q;if(L){const J=Ui[L];Q=Ia.clone(J.uniforms)}else Q=w.uniforms;return Q}function k(w,L){let Q;for(let J=0,re=m.length;J<re;J++){const pe=m[J];if(pe.cacheKey===L){Q=pe,++Q.usedTimes;break}}return Q===void 0&&(Q=new Fw(s,L,w,l),m.push(Q)),Q}function U(w){if(--w.usedTimes===0){const L=m.indexOf(w);m[L]=m[m.length-1],m.pop(),w.destroy()}}function V(w){h.remove(w)}function le(){h.dispose()}return{getParameters:y,getProgramCacheKey:C,getUniforms:G,acquireProgram:k,releaseProgram:U,releaseShaderCache:V,programs:m,dispose:le}}function Hw(){let s=new WeakMap;function e(c){return s.has(c)}function t(c){let d=s.get(c);return d===void 0&&(d={},s.set(c,d)),d}function i(c){s.delete(c)}function o(c,d,h){s.get(c)[d]=h}function l(){s=new WeakMap}return{has:e,get:t,remove:i,update:o,dispose:l}}function Gw(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Y0(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function $0(){const s=[];let e=0;const t=[],i=[],o=[];function l(){e=0,t.length=0,i.length=0,o.length=0}function c(_,v,S,M,E,x){let y=s[e];return y===void 0?(y={id:_.id,object:_,geometry:v,material:S,groupOrder:M,renderOrder:_.renderOrder,z:E,group:x},s[e]=y):(y.id=_.id,y.object=_,y.geometry=v,y.material=S,y.groupOrder=M,y.renderOrder=_.renderOrder,y.z=E,y.group=x),e++,y}function d(_,v,S,M,E,x){const y=c(_,v,S,M,E,x);S.transmission>0?i.push(y):S.transparent===!0?o.push(y):t.push(y)}function h(_,v,S,M,E,x){const y=c(_,v,S,M,E,x);S.transmission>0?i.unshift(y):S.transparent===!0?o.unshift(y):t.unshift(y)}function p(_,v){t.length>1&&t.sort(_||Gw),i.length>1&&i.sort(v||Y0),o.length>1&&o.sort(v||Y0)}function m(){for(let _=e,v=s.length;_<v;_++){const S=s[_];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:t,transmissive:i,transparent:o,init:l,push:d,unshift:h,finish:m,sort:p}}function Ww(){let s=new WeakMap;function e(i,o){const l=s.get(i);let c;return l===void 0?(c=new $0,s.set(i,[c])):o>=l.length?(c=new $0,l.push(c)):c=l[o],c}function t(){s=new WeakMap}return{get:e,dispose:t}}function qw(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new $e};break;case"SpotLight":t={position:new I,direction:new I,color:new $e,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new $e,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new $e,groundColor:new $e};break;case"RectAreaLight":t={color:new $e,position:new I,halfWidth:new I,halfHeight:new I};break}return s[e.id]=t,t}}}function Xw(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Pe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Pe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Pe,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let jw=0;function Kw(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function Yw(s){const e=new qw,t=Xw(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let p=0;p<9;p++)i.probe.push(new I);const o=new I,l=new At,c=new At;function d(p){let m=0,_=0,v=0;for(let le=0;le<9;le++)i.probe[le].set(0,0,0);let S=0,M=0,E=0,x=0,y=0,C=0,b=0,P=0,G=0,k=0,U=0;p.sort(Kw);for(let le=0,w=p.length;le<w;le++){const L=p[le],Q=L.color,J=L.intensity,re=L.distance,pe=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)m+=Q.r*J,_+=Q.g*J,v+=Q.b*J;else if(L.isLightProbe){for(let ee=0;ee<9;ee++)i.probe[ee].addScaledVector(L.sh.coefficients[ee],J);U++}else if(L.isDirectionalLight){const ee=e.get(L);if(ee.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const me=L.shadow,z=t.get(L);z.shadowIntensity=me.intensity,z.shadowBias=me.bias,z.shadowNormalBias=me.normalBias,z.shadowRadius=me.radius,z.shadowMapSize=me.mapSize,i.directionalShadow[S]=z,i.directionalShadowMap[S]=pe,i.directionalShadowMatrix[S]=L.shadow.matrix,C++}i.directional[S]=ee,S++}else if(L.isSpotLight){const ee=e.get(L);ee.position.setFromMatrixPosition(L.matrixWorld),ee.color.copy(Q).multiplyScalar(J),ee.distance=re,ee.coneCos=Math.cos(L.angle),ee.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),ee.decay=L.decay,i.spot[E]=ee;const me=L.shadow;if(L.map&&(i.spotLightMap[G]=L.map,G++,me.updateMatrices(L),L.castShadow&&k++),i.spotLightMatrix[E]=me.matrix,L.castShadow){const z=t.get(L);z.shadowIntensity=me.intensity,z.shadowBias=me.bias,z.shadowNormalBias=me.normalBias,z.shadowRadius=me.radius,z.shadowMapSize=me.mapSize,i.spotShadow[E]=z,i.spotShadowMap[E]=pe,P++}E++}else if(L.isRectAreaLight){const ee=e.get(L);ee.color.copy(Q).multiplyScalar(J),ee.halfWidth.set(L.width*.5,0,0),ee.halfHeight.set(0,L.height*.5,0),i.rectArea[x]=ee,x++}else if(L.isPointLight){const ee=e.get(L);if(ee.color.copy(L.color).multiplyScalar(L.intensity),ee.distance=L.distance,ee.decay=L.decay,L.castShadow){const me=L.shadow,z=t.get(L);z.shadowIntensity=me.intensity,z.shadowBias=me.bias,z.shadowNormalBias=me.normalBias,z.shadowRadius=me.radius,z.shadowMapSize=me.mapSize,z.shadowCameraNear=me.camera.near,z.shadowCameraFar=me.camera.far,i.pointShadow[M]=z,i.pointShadowMap[M]=pe,i.pointShadowMatrix[M]=L.shadow.matrix,b++}i.point[M]=ee,M++}else if(L.isHemisphereLight){const ee=e.get(L);ee.skyColor.copy(L.color).multiplyScalar(J),ee.groundColor.copy(L.groundColor).multiplyScalar(J),i.hemi[y]=ee,y++}}x>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Re.LTC_FLOAT_1,i.rectAreaLTC2=Re.LTC_FLOAT_2):(i.rectAreaLTC1=Re.LTC_HALF_1,i.rectAreaLTC2=Re.LTC_HALF_2)),i.ambient[0]=m,i.ambient[1]=_,i.ambient[2]=v;const V=i.hash;(V.directionalLength!==S||V.pointLength!==M||V.spotLength!==E||V.rectAreaLength!==x||V.hemiLength!==y||V.numDirectionalShadows!==C||V.numPointShadows!==b||V.numSpotShadows!==P||V.numSpotMaps!==G||V.numLightProbes!==U)&&(i.directional.length=S,i.spot.length=E,i.rectArea.length=x,i.point.length=M,i.hemi.length=y,i.directionalShadow.length=C,i.directionalShadowMap.length=C,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=P,i.spotShadowMap.length=P,i.directionalShadowMatrix.length=C,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=P+G-k,i.spotLightMap.length=G,i.numSpotLightShadowsWithMaps=k,i.numLightProbes=U,V.directionalLength=S,V.pointLength=M,V.spotLength=E,V.rectAreaLength=x,V.hemiLength=y,V.numDirectionalShadows=C,V.numPointShadows=b,V.numSpotShadows=P,V.numSpotMaps=G,V.numLightProbes=U,i.version=jw++)}function h(p,m){let _=0,v=0,S=0,M=0,E=0;const x=m.matrixWorldInverse;for(let y=0,C=p.length;y<C;y++){const b=p[y];if(b.isDirectionalLight){const P=i.directional[_];P.direction.setFromMatrixPosition(b.matrixWorld),o.setFromMatrixPosition(b.target.matrixWorld),P.direction.sub(o),P.direction.transformDirection(x),_++}else if(b.isSpotLight){const P=i.spot[S];P.position.setFromMatrixPosition(b.matrixWorld),P.position.applyMatrix4(x),P.direction.setFromMatrixPosition(b.matrixWorld),o.setFromMatrixPosition(b.target.matrixWorld),P.direction.sub(o),P.direction.transformDirection(x),S++}else if(b.isRectAreaLight){const P=i.rectArea[M];P.position.setFromMatrixPosition(b.matrixWorld),P.position.applyMatrix4(x),c.identity(),l.copy(b.matrixWorld),l.premultiply(x),c.extractRotation(l),P.halfWidth.set(b.width*.5,0,0),P.halfHeight.set(0,b.height*.5,0),P.halfWidth.applyMatrix4(c),P.halfHeight.applyMatrix4(c),M++}else if(b.isPointLight){const P=i.point[v];P.position.setFromMatrixPosition(b.matrixWorld),P.position.applyMatrix4(x),v++}else if(b.isHemisphereLight){const P=i.hemi[E];P.direction.setFromMatrixPosition(b.matrixWorld),P.direction.transformDirection(x),E++}}}return{setup:d,setupView:h,state:i}}function Q0(s){const e=new Yw(s),t=[],i=[];function o(m){p.camera=m,t.length=0,i.length=0}function l(m){t.push(m)}function c(m){i.push(m)}function d(){e.setup(t)}function h(m){e.setupView(t,m)}const p={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:o,state:p,setupLights:d,setupLightsView:h,pushLight:l,pushShadow:c}}function $w(s){let e=new WeakMap;function t(o,l=0){const c=e.get(o);let d;return c===void 0?(d=new Q0(s),e.set(o,[d])):l>=c.length?(d=new Q0(s),c.push(d)):d=c[l],d}function i(){e=new WeakMap}return{get:t,dispose:i}}class Qw extends qr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Dy,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Jw extends qr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Zw=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,eE=`uniform sampler2D shadow_pass;
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
}`;function tE(s,e,t){let i=new vf;const o=new Pe,l=new Pe,c=new Nt,d=new Qw({depthPacking:Iy}),h=new Jw,p={},m=t.maxTextureSize,_={[Gr]:Fn,[Fn]:Gr,[Ti]:Ti},v=new Ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Pe},radius:{value:4}},vertexShader:Zw,fragmentShader:eE}),S=v.clone();S.defines.HORIZONTAL_PASS=1;const M=new Jt;M.setAttribute("position",new jn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const E=new be(M,v),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=w_;let y=this.type;this.render=function(k,U,V){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||k.length===0)return;const le=s.getRenderTarget(),w=s.getActiveCubeFace(),L=s.getActiveMipmapLevel(),Q=s.state;Q.setBlending(or),Q.buffers.color.setClear(1,1,1,1),Q.buffers.depth.setTest(!0),Q.setScissorTest(!1);const J=y!==nr&&this.type===nr,re=y===nr&&this.type!==nr;for(let pe=0,ee=k.length;pe<ee;pe++){const me=k[pe],z=me.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",me,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;o.copy(z.mapSize);const ue=z.getFrameExtents();if(o.multiply(ue),l.copy(z.mapSize),(o.x>m||o.y>m)&&(o.x>m&&(l.x=Math.floor(m/ue.x),o.x=l.x*ue.x,z.mapSize.x=l.x),o.y>m&&(l.y=Math.floor(m/ue.y),o.y=l.y*ue.y,z.mapSize.y=l.y)),z.map===null||J===!0||re===!0){const F=this.type!==nr?{minFilter:Xn,magFilter:Xn}:{};z.map!==null&&z.map.dispose(),z.map=new Ri(o.x,o.y,F),z.map.texture.name=me.name+".shadowMap",z.camera.updateProjectionMatrix()}s.setRenderTarget(z.map),s.clear();const ae=z.getViewportCount();for(let F=0;F<ae;F++){const se=z.getViewport(F);c.set(l.x*se.x,l.y*se.y,l.x*se.z,l.y*se.w),Q.viewport(c),z.updateMatrices(me,F),i=z.getFrustum(),P(U,V,z.camera,me,this.type)}z.isPointLightShadow!==!0&&this.type===nr&&C(z,V),z.needsUpdate=!1}y=this.type,x.needsUpdate=!1,s.setRenderTarget(le,w,L)};function C(k,U){const V=e.update(E);v.defines.VSM_SAMPLES!==k.blurSamples&&(v.defines.VSM_SAMPLES=k.blurSamples,S.defines.VSM_SAMPLES=k.blurSamples,v.needsUpdate=!0,S.needsUpdate=!0),k.mapPass===null&&(k.mapPass=new Ri(o.x,o.y)),v.uniforms.shadow_pass.value=k.map.texture,v.uniforms.resolution.value=k.mapSize,v.uniforms.radius.value=k.radius,s.setRenderTarget(k.mapPass),s.clear(),s.renderBufferDirect(U,null,V,v,E,null),S.uniforms.shadow_pass.value=k.mapPass.texture,S.uniforms.resolution.value=k.mapSize,S.uniforms.radius.value=k.radius,s.setRenderTarget(k.map),s.clear(),s.renderBufferDirect(U,null,V,S,E,null)}function b(k,U,V,le){let w=null;const L=V.isPointLight===!0?k.customDistanceMaterial:k.customDepthMaterial;if(L!==void 0)w=L;else if(w=V.isPointLight===!0?h:d,s.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0){const Q=w.uuid,J=U.uuid;let re=p[Q];re===void 0&&(re={},p[Q]=re);let pe=re[J];pe===void 0&&(pe=w.clone(),re[J]=pe,U.addEventListener("dispose",G)),w=pe}if(w.visible=U.visible,w.wireframe=U.wireframe,le===nr?w.side=U.shadowSide!==null?U.shadowSide:U.side:w.side=U.shadowSide!==null?U.shadowSide:_[U.side],w.alphaMap=U.alphaMap,w.alphaTest=U.alphaTest,w.map=U.map,w.clipShadows=U.clipShadows,w.clippingPlanes=U.clippingPlanes,w.clipIntersection=U.clipIntersection,w.displacementMap=U.displacementMap,w.displacementScale=U.displacementScale,w.displacementBias=U.displacementBias,w.wireframeLinewidth=U.wireframeLinewidth,w.linewidth=U.linewidth,V.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const Q=s.properties.get(w);Q.light=V}return w}function P(k,U,V,le,w){if(k.visible===!1)return;if(k.layers.test(U.layers)&&(k.isMesh||k.isLine||k.isPoints)&&(k.castShadow||k.receiveShadow&&w===nr)&&(!k.frustumCulled||i.intersectsObject(k))){k.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,k.matrixWorld);const J=e.update(k),re=k.material;if(Array.isArray(re)){const pe=J.groups;for(let ee=0,me=pe.length;ee<me;ee++){const z=pe[ee],ue=re[z.materialIndex];if(ue&&ue.visible){const ae=b(k,ue,le,w);k.onBeforeShadow(s,k,U,V,J,ae,z),s.renderBufferDirect(V,null,J,ae,k,z),k.onAfterShadow(s,k,U,V,J,ae,z)}}}else if(re.visible){const pe=b(k,re,le,w);k.onBeforeShadow(s,k,U,V,J,pe,null),s.renderBufferDirect(V,null,J,pe,k,null),k.onAfterShadow(s,k,U,V,J,pe,null)}}const Q=k.children;for(let J=0,re=Q.length;J<re;J++)P(Q[J],U,V,le,w)}function G(k){k.target.removeEventListener("dispose",G);for(const V in p){const le=p[V],w=k.target.uuid;w in le&&(le[w].dispose(),delete le[w])}}}const nE={[hh]:fh,[ph]:gh,[mh]:vh,[So]:_h,[fh]:hh,[gh]:ph,[vh]:mh,[_h]:So};function iE(s){function e(){let W=!1;const Ie=new Nt;let oe=null;const fe=new Nt(0,0,0,0);return{setMask:function(Ce){oe!==Ce&&!W&&(s.colorMask(Ce,Ce,Ce,Ce),oe=Ce)},setLocked:function(Ce){W=Ce},setClear:function(Ce,Ue,mt,Wt,yn){yn===!0&&(Ce*=Wt,Ue*=Wt,mt*=Wt),Ie.set(Ce,Ue,mt,Wt),fe.equals(Ie)===!1&&(s.clearColor(Ce,Ue,mt,Wt),fe.copy(Ie))},reset:function(){W=!1,oe=null,fe.set(-1,0,0,0)}}}function t(){let W=!1,Ie=!1,oe=null,fe=null,Ce=null;return{setReversed:function(Ue){Ie=Ue},setTest:function(Ue){Ue?xe(s.DEPTH_TEST):Se(s.DEPTH_TEST)},setMask:function(Ue){oe!==Ue&&!W&&(s.depthMask(Ue),oe=Ue)},setFunc:function(Ue){if(Ie&&(Ue=nE[Ue]),fe!==Ue){switch(Ue){case hh:s.depthFunc(s.NEVER);break;case fh:s.depthFunc(s.ALWAYS);break;case ph:s.depthFunc(s.LESS);break;case So:s.depthFunc(s.LEQUAL);break;case mh:s.depthFunc(s.EQUAL);break;case _h:s.depthFunc(s.GEQUAL);break;case gh:s.depthFunc(s.GREATER);break;case vh:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}fe=Ue}},setLocked:function(Ue){W=Ue},setClear:function(Ue){Ce!==Ue&&(s.clearDepth(Ue),Ce=Ue)},reset:function(){W=!1,oe=null,fe=null,Ce=null}}}function i(){let W=!1,Ie=null,oe=null,fe=null,Ce=null,Ue=null,mt=null,Wt=null,yn=null;return{setTest:function(vt){W||(vt?xe(s.STENCIL_TEST):Se(s.STENCIL_TEST))},setMask:function(vt){Ie!==vt&&!W&&(s.stencilMask(vt),Ie=vt)},setFunc:function(vt,sn,ri){(oe!==vt||fe!==sn||Ce!==ri)&&(s.stencilFunc(vt,sn,ri),oe=vt,fe=sn,Ce=ri)},setOp:function(vt,sn,ri){(Ue!==vt||mt!==sn||Wt!==ri)&&(s.stencilOp(vt,sn,ri),Ue=vt,mt=sn,Wt=ri)},setLocked:function(vt){W=vt},setClear:function(vt){yn!==vt&&(s.clearStencil(vt),yn=vt)},reset:function(){W=!1,Ie=null,oe=null,fe=null,Ce=null,Ue=null,mt=null,Wt=null,yn=null}}}const o=new e,l=new t,c=new i,d=new WeakMap,h=new WeakMap;let p={},m={},_=new WeakMap,v=[],S=null,M=!1,E=null,x=null,y=null,C=null,b=null,P=null,G=null,k=new $e(0,0,0),U=0,V=!1,le=null,w=null,L=null,Q=null,J=null;const re=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let pe=!1,ee=0;const me=s.getParameter(s.VERSION);me.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(me)[1]),pe=ee>=1):me.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(me)[1]),pe=ee>=2);let z=null,ue={};const ae=s.getParameter(s.SCISSOR_BOX),F=s.getParameter(s.VIEWPORT),se=new Nt().fromArray(ae),Fe=new Nt().fromArray(F);function Z(W,Ie,oe,fe){const Ce=new Uint8Array(4),Ue=s.createTexture();s.bindTexture(W,Ue),s.texParameteri(W,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(W,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let mt=0;mt<oe;mt++)W===s.TEXTURE_3D||W===s.TEXTURE_2D_ARRAY?s.texImage3D(Ie,0,s.RGBA,1,1,fe,0,s.RGBA,s.UNSIGNED_BYTE,Ce):s.texImage2D(Ie+mt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Ce);return Ue}const ce={};ce[s.TEXTURE_2D]=Z(s.TEXTURE_2D,s.TEXTURE_2D,1),ce[s.TEXTURE_CUBE_MAP]=Z(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[s.TEXTURE_2D_ARRAY]=Z(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),ce[s.TEXTURE_3D]=Z(s.TEXTURE_3D,s.TEXTURE_3D,1,1),o.setClear(0,0,0,1),l.setClear(1),c.setClear(0),xe(s.DEPTH_TEST),l.setFunc(So),ht(!1),_t(a0),xe(s.CULL_FACE),B(or);function xe(W){p[W]!==!0&&(s.enable(W),p[W]=!0)}function Se(W){p[W]!==!1&&(s.disable(W),p[W]=!1)}function Le(W,Ie){return m[W]!==Ie?(s.bindFramebuffer(W,Ie),m[W]=Ie,W===s.DRAW_FRAMEBUFFER&&(m[s.FRAMEBUFFER]=Ie),W===s.FRAMEBUFFER&&(m[s.DRAW_FRAMEBUFFER]=Ie),!0):!1}function De(W,Ie){let oe=v,fe=!1;if(W){oe=_.get(Ie),oe===void 0&&(oe=[],_.set(Ie,oe));const Ce=W.textures;if(oe.length!==Ce.length||oe[0]!==s.COLOR_ATTACHMENT0){for(let Ue=0,mt=Ce.length;Ue<mt;Ue++)oe[Ue]=s.COLOR_ATTACHMENT0+Ue;oe.length=Ce.length,fe=!0}}else oe[0]!==s.BACK&&(oe[0]=s.BACK,fe=!0);fe&&s.drawBuffers(oe)}function rt(W){return S!==W?(s.useProgram(W),S=W,!0):!1}const yt={[ps]:s.FUNC_ADD,[dy]:s.FUNC_SUBTRACT,[hy]:s.FUNC_REVERSE_SUBTRACT};yt[fy]=s.MIN,yt[py]=s.MAX;const ft={[my]:s.ZERO,[_y]:s.ONE,[gy]:s.SRC_COLOR,[uh]:s.SRC_ALPHA,[wy]:s.SRC_ALPHA_SATURATE,[Sy]:s.DST_COLOR,[yy]:s.DST_ALPHA,[vy]:s.ONE_MINUS_SRC_COLOR,[dh]:s.ONE_MINUS_SRC_ALPHA,[My]:s.ONE_MINUS_DST_COLOR,[xy]:s.ONE_MINUS_DST_ALPHA,[Ey]:s.CONSTANT_COLOR,[Ty]:s.ONE_MINUS_CONSTANT_COLOR,[by]:s.CONSTANT_ALPHA,[Ay]:s.ONE_MINUS_CONSTANT_ALPHA};function B(W,Ie,oe,fe,Ce,Ue,mt,Wt,yn,vt){if(W===or){M===!0&&(Se(s.BLEND),M=!1);return}if(M===!1&&(xe(s.BLEND),M=!0),W!==uy){if(W!==E||vt!==V){if((x!==ps||b!==ps)&&(s.blendEquation(s.FUNC_ADD),x=ps,b=ps),vt)switch(W){case vo:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Cc:s.blendFunc(s.ONE,s.ONE);break;case l0:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case c0:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",W);break}else switch(W){case vo:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Cc:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case l0:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case c0:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",W);break}y=null,C=null,P=null,G=null,k.set(0,0,0),U=0,E=W,V=vt}return}Ce=Ce||Ie,Ue=Ue||oe,mt=mt||fe,(Ie!==x||Ce!==b)&&(s.blendEquationSeparate(yt[Ie],yt[Ce]),x=Ie,b=Ce),(oe!==y||fe!==C||Ue!==P||mt!==G)&&(s.blendFuncSeparate(ft[oe],ft[fe],ft[Ue],ft[mt]),y=oe,C=fe,P=Ue,G=mt),(Wt.equals(k)===!1||yn!==U)&&(s.blendColor(Wt.r,Wt.g,Wt.b,yn),k.copy(Wt),U=yn),E=W,V=!1}function vn(W,Ie){W.side===Ti?Se(s.CULL_FACE):xe(s.CULL_FACE);let oe=W.side===Fn;Ie&&(oe=!oe),ht(oe),W.blending===vo&&W.transparent===!1?B(or):B(W.blending,W.blendEquation,W.blendSrc,W.blendDst,W.blendEquationAlpha,W.blendSrcAlpha,W.blendDstAlpha,W.blendColor,W.blendAlpha,W.premultipliedAlpha),l.setFunc(W.depthFunc),l.setTest(W.depthTest),l.setMask(W.depthWrite),o.setMask(W.colorWrite);const fe=W.stencilWrite;c.setTest(fe),fe&&(c.setMask(W.stencilWriteMask),c.setFunc(W.stencilFunc,W.stencilRef,W.stencilFuncMask),c.setOp(W.stencilFail,W.stencilZFail,W.stencilZPass)),Dt(W.polygonOffset,W.polygonOffsetFactor,W.polygonOffsetUnits),W.alphaToCoverage===!0?xe(s.SAMPLE_ALPHA_TO_COVERAGE):Se(s.SAMPLE_ALPHA_TO_COVERAGE)}function ht(W){le!==W&&(W?s.frontFace(s.CW):s.frontFace(s.CCW),le=W)}function _t(W){W!==ly?(xe(s.CULL_FACE),W!==w&&(W===a0?s.cullFace(s.BACK):W===cy?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Se(s.CULL_FACE),w=W}function et(W){W!==L&&(pe&&s.lineWidth(W),L=W)}function Dt(W,Ie,oe){W?(xe(s.POLYGON_OFFSET_FILL),(Q!==Ie||J!==oe)&&(s.polygonOffset(Ie,oe),Q=Ie,J=oe)):Se(s.POLYGON_OFFSET_FILL)}function nt(W){W?xe(s.SCISSOR_TEST):Se(s.SCISSOR_TEST)}function D(W){W===void 0&&(W=s.TEXTURE0+re-1),z!==W&&(s.activeTexture(W),z=W)}function A(W,Ie,oe){oe===void 0&&(z===null?oe=s.TEXTURE0+re-1:oe=z);let fe=ue[oe];fe===void 0&&(fe={type:void 0,texture:void 0},ue[oe]=fe),(fe.type!==W||fe.texture!==Ie)&&(z!==oe&&(s.activeTexture(oe),z=oe),s.bindTexture(W,Ie||ce[W]),fe.type=W,fe.texture=Ie)}function $(){const W=ue[z];W!==void 0&&W.type!==void 0&&(s.bindTexture(W.type,null),W.type=void 0,W.texture=void 0)}function he(){try{s.compressedTexImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function ve(){try{s.compressedTexImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function de(){try{s.texSubImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ye(){try{s.texSubImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ae(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Oe(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function gt(){try{s.texStorage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Me(){try{s.texStorage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Be(){try{s.texImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function st(){try{s.texImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function it(W){se.equals(W)===!1&&(s.scissor(W.x,W.y,W.z,W.w),se.copy(W))}function He(W){Fe.equals(W)===!1&&(s.viewport(W.x,W.y,W.z,W.w),Fe.copy(W))}function pt(W,Ie){let oe=h.get(Ie);oe===void 0&&(oe=new WeakMap,h.set(Ie,oe));let fe=oe.get(W);fe===void 0&&(fe=s.getUniformBlockIndex(Ie,W.name),oe.set(W,fe))}function at(W,Ie){const fe=h.get(Ie).get(W);d.get(Ie)!==fe&&(s.uniformBlockBinding(Ie,fe,W.__bindingPointIndex),d.set(Ie,fe))}function Rt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),p={},z=null,ue={},m={},_=new WeakMap,v=[],S=null,M=!1,E=null,x=null,y=null,C=null,b=null,P=null,G=null,k=new $e(0,0,0),U=0,V=!1,le=null,w=null,L=null,Q=null,J=null,se.set(0,0,s.canvas.width,s.canvas.height),Fe.set(0,0,s.canvas.width,s.canvas.height),o.reset(),l.reset(),c.reset()}return{buffers:{color:o,depth:l,stencil:c},enable:xe,disable:Se,bindFramebuffer:Le,drawBuffers:De,useProgram:rt,setBlending:B,setMaterial:vn,setFlipSided:ht,setCullFace:_t,setLineWidth:et,setPolygonOffset:Dt,setScissorTest:nt,activeTexture:D,bindTexture:A,unbindTexture:$,compressedTexImage2D:he,compressedTexImage3D:ve,texImage2D:Be,texImage3D:st,updateUBOMapping:pt,uniformBlockBinding:at,texStorage2D:gt,texStorage3D:Me,texSubImage2D:de,texSubImage3D:Ye,compressedTexSubImage2D:Ae,compressedTexSubImage3D:Oe,scissor:it,viewport:He,reset:Rt}}function J0(s,e,t,i){const o=rE(i);switch(t){case U_:return s*e;case F_:return s*e;case O_:return s*e*2;case df:return s*e/o.components*o.byteLength;case hf:return s*e/o.components*o.byteLength;case B_:return s*e*2/o.components*o.byteLength;case ff:return s*e*2/o.components*o.byteLength;case k_:return s*e*3/o.components*o.byteLength;case Ci:return s*e*4/o.components*o.byteLength;case pf:return s*e*4/o.components*o.byteLength;case xc:case Sc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Mc:case wc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Eh:case bh:return Math.max(s,16)*Math.max(e,8)/4;case wh:case Th:return Math.max(s,8)*Math.max(e,8)/2;case Ah:case Ch:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Rh:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ph:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Lh:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Dh:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Ih:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Nh:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Uh:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case kh:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Fh:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Oh:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Bh:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case zh:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Vh:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Hh:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Gh:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Ec:case Wh:case qh:return Math.ceil(s/4)*Math.ceil(e/4)*16;case z_:case Xh:return Math.ceil(s/4)*Math.ceil(e/4)*8;case jh:case Kh:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function rE(s){switch(s){case cr:case D_:return{byteLength:1,components:1};case La:case I_:case ar:return{byteLength:2,components:1};case cf:case uf:return{byteLength:2,components:4};case xs:case lf:case ki:return{byteLength:4,components:1};case N_:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function sE(s,e,t,i,o,l,c){const d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),p=new Pe,m=new WeakMap;let _;const v=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(D,A){return S?new OffscreenCanvas(D,A):Ic("canvas")}function E(D,A,$){let he=1;const ve=nt(D);if((ve.width>$||ve.height>$)&&(he=$/Math.max(ve.width,ve.height)),he<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const de=Math.floor(he*ve.width),Ye=Math.floor(he*ve.height);_===void 0&&(_=M(de,Ye));const Ae=A?M(de,Ye):_;return Ae.width=de,Ae.height=Ye,Ae.getContext("2d").drawImage(D,0,0,de,Ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ve.width+"x"+ve.height+") to ("+de+"x"+Ye+")."),Ae}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ve.width+"x"+ve.height+")."),D;return D}function x(D){return D.generateMipmaps&&D.minFilter!==Xn&&D.minFilter!==bi}function y(D){s.generateMipmap(D)}function C(D,A,$,he,ve=!1){if(D!==null){if(s[D]!==void 0)return s[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let de=A;if(A===s.RED&&($===s.FLOAT&&(de=s.R32F),$===s.HALF_FLOAT&&(de=s.R16F),$===s.UNSIGNED_BYTE&&(de=s.R8)),A===s.RED_INTEGER&&($===s.UNSIGNED_BYTE&&(de=s.R8UI),$===s.UNSIGNED_SHORT&&(de=s.R16UI),$===s.UNSIGNED_INT&&(de=s.R32UI),$===s.BYTE&&(de=s.R8I),$===s.SHORT&&(de=s.R16I),$===s.INT&&(de=s.R32I)),A===s.RG&&($===s.FLOAT&&(de=s.RG32F),$===s.HALF_FLOAT&&(de=s.RG16F),$===s.UNSIGNED_BYTE&&(de=s.RG8)),A===s.RG_INTEGER&&($===s.UNSIGNED_BYTE&&(de=s.RG8UI),$===s.UNSIGNED_SHORT&&(de=s.RG16UI),$===s.UNSIGNED_INT&&(de=s.RG32UI),$===s.BYTE&&(de=s.RG8I),$===s.SHORT&&(de=s.RG16I),$===s.INT&&(de=s.RG32I)),A===s.RGB_INTEGER&&($===s.UNSIGNED_BYTE&&(de=s.RGB8UI),$===s.UNSIGNED_SHORT&&(de=s.RGB16UI),$===s.UNSIGNED_INT&&(de=s.RGB32UI),$===s.BYTE&&(de=s.RGB8I),$===s.SHORT&&(de=s.RGB16I),$===s.INT&&(de=s.RGB32I)),A===s.RGBA_INTEGER&&($===s.UNSIGNED_BYTE&&(de=s.RGBA8UI),$===s.UNSIGNED_SHORT&&(de=s.RGBA16UI),$===s.UNSIGNED_INT&&(de=s.RGBA32UI),$===s.BYTE&&(de=s.RGBA8I),$===s.SHORT&&(de=s.RGBA16I),$===s.INT&&(de=s.RGBA32I)),A===s.RGB&&$===s.UNSIGNED_INT_5_9_9_9_REV&&(de=s.RGB9_E5),A===s.RGBA){const Ye=ve?Rc:Tt.getTransfer(he);$===s.FLOAT&&(de=s.RGBA32F),$===s.HALF_FLOAT&&(de=s.RGBA16F),$===s.UNSIGNED_BYTE&&(de=Ye===Bt?s.SRGB8_ALPHA8:s.RGBA8),$===s.UNSIGNED_SHORT_4_4_4_4&&(de=s.RGBA4),$===s.UNSIGNED_SHORT_5_5_5_1&&(de=s.RGB5_A1)}return(de===s.R16F||de===s.R32F||de===s.RG16F||de===s.RG32F||de===s.RGBA16F||de===s.RGBA32F)&&e.get("EXT_color_buffer_float"),de}function b(D,A){let $;return D?A===null||A===xs||A===Eo?$=s.DEPTH24_STENCIL8:A===ki?$=s.DEPTH32F_STENCIL8:A===La&&($=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):A===null||A===xs||A===Eo?$=s.DEPTH_COMPONENT24:A===ki?$=s.DEPTH_COMPONENT32F:A===La&&($=s.DEPTH_COMPONENT16),$}function P(D,A){return x(D)===!0||D.isFramebufferTexture&&D.minFilter!==Xn&&D.minFilter!==bi?Math.log2(Math.max(A.width,A.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?A.mipmaps.length:1}function G(D){const A=D.target;A.removeEventListener("dispose",G),U(A),A.isVideoTexture&&m.delete(A)}function k(D){const A=D.target;A.removeEventListener("dispose",k),le(A)}function U(D){const A=i.get(D);if(A.__webglInit===void 0)return;const $=D.source,he=v.get($);if(he){const ve=he[A.__cacheKey];ve.usedTimes--,ve.usedTimes===0&&V(D),Object.keys(he).length===0&&v.delete($)}i.remove(D)}function V(D){const A=i.get(D);s.deleteTexture(A.__webglTexture);const $=D.source,he=v.get($);delete he[A.__cacheKey],c.memory.textures--}function le(D){const A=i.get(D);if(D.depthTexture&&D.depthTexture.dispose(),D.isWebGLCubeRenderTarget)for(let he=0;he<6;he++){if(Array.isArray(A.__webglFramebuffer[he]))for(let ve=0;ve<A.__webglFramebuffer[he].length;ve++)s.deleteFramebuffer(A.__webglFramebuffer[he][ve]);else s.deleteFramebuffer(A.__webglFramebuffer[he]);A.__webglDepthbuffer&&s.deleteRenderbuffer(A.__webglDepthbuffer[he])}else{if(Array.isArray(A.__webglFramebuffer))for(let he=0;he<A.__webglFramebuffer.length;he++)s.deleteFramebuffer(A.__webglFramebuffer[he]);else s.deleteFramebuffer(A.__webglFramebuffer);if(A.__webglDepthbuffer&&s.deleteRenderbuffer(A.__webglDepthbuffer),A.__webglMultisampledFramebuffer&&s.deleteFramebuffer(A.__webglMultisampledFramebuffer),A.__webglColorRenderbuffer)for(let he=0;he<A.__webglColorRenderbuffer.length;he++)A.__webglColorRenderbuffer[he]&&s.deleteRenderbuffer(A.__webglColorRenderbuffer[he]);A.__webglDepthRenderbuffer&&s.deleteRenderbuffer(A.__webglDepthRenderbuffer)}const $=D.textures;for(let he=0,ve=$.length;he<ve;he++){const de=i.get($[he]);de.__webglTexture&&(s.deleteTexture(de.__webglTexture),c.memory.textures--),i.remove($[he])}i.remove(D)}let w=0;function L(){w=0}function Q(){const D=w;return D>=o.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+o.maxTextures),w+=1,D}function J(D){const A=[];return A.push(D.wrapS),A.push(D.wrapT),A.push(D.wrapR||0),A.push(D.magFilter),A.push(D.minFilter),A.push(D.anisotropy),A.push(D.internalFormat),A.push(D.format),A.push(D.type),A.push(D.generateMipmaps),A.push(D.premultiplyAlpha),A.push(D.flipY),A.push(D.unpackAlignment),A.push(D.colorSpace),A.join()}function re(D,A){const $=i.get(D);if(D.isVideoTexture&&et(D),D.isRenderTargetTexture===!1&&D.version>0&&$.__version!==D.version){const he=D.image;if(he===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(he.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Fe($,D,A);return}}t.bindTexture(s.TEXTURE_2D,$.__webglTexture,s.TEXTURE0+A)}function pe(D,A){const $=i.get(D);if(D.version>0&&$.__version!==D.version){Fe($,D,A);return}t.bindTexture(s.TEXTURE_2D_ARRAY,$.__webglTexture,s.TEXTURE0+A)}function ee(D,A){const $=i.get(D);if(D.version>0&&$.__version!==D.version){Fe($,D,A);return}t.bindTexture(s.TEXTURE_3D,$.__webglTexture,s.TEXTURE0+A)}function me(D,A){const $=i.get(D);if(D.version>0&&$.__version!==D.version){Z($,D,A);return}t.bindTexture(s.TEXTURE_CUBE_MAP,$.__webglTexture,s.TEXTURE0+A)}const z={[Sh]:s.REPEAT,[_s]:s.CLAMP_TO_EDGE,[Mh]:s.MIRRORED_REPEAT},ue={[Xn]:s.NEAREST,[Ly]:s.NEAREST_MIPMAP_NEAREST,[Hl]:s.NEAREST_MIPMAP_LINEAR,[bi]:s.LINEAR,[Td]:s.LINEAR_MIPMAP_NEAREST,[gs]:s.LINEAR_MIPMAP_LINEAR},ae={[Uy]:s.NEVER,[Vy]:s.ALWAYS,[ky]:s.LESS,[H_]:s.LEQUAL,[Fy]:s.EQUAL,[zy]:s.GEQUAL,[Oy]:s.GREATER,[By]:s.NOTEQUAL};function F(D,A){if(A.type===ki&&e.has("OES_texture_float_linear")===!1&&(A.magFilter===bi||A.magFilter===Td||A.magFilter===Hl||A.magFilter===gs||A.minFilter===bi||A.minFilter===Td||A.minFilter===Hl||A.minFilter===gs)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(D,s.TEXTURE_WRAP_S,z[A.wrapS]),s.texParameteri(D,s.TEXTURE_WRAP_T,z[A.wrapT]),(D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY)&&s.texParameteri(D,s.TEXTURE_WRAP_R,z[A.wrapR]),s.texParameteri(D,s.TEXTURE_MAG_FILTER,ue[A.magFilter]),s.texParameteri(D,s.TEXTURE_MIN_FILTER,ue[A.minFilter]),A.compareFunction&&(s.texParameteri(D,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(D,s.TEXTURE_COMPARE_FUNC,ae[A.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(A.magFilter===Xn||A.minFilter!==Hl&&A.minFilter!==gs||A.type===ki&&e.has("OES_texture_float_linear")===!1)return;if(A.anisotropy>1||i.get(A).__currentAnisotropy){const $=e.get("EXT_texture_filter_anisotropic");s.texParameterf(D,$.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(A.anisotropy,o.getMaxAnisotropy())),i.get(A).__currentAnisotropy=A.anisotropy}}}function se(D,A){let $=!1;D.__webglInit===void 0&&(D.__webglInit=!0,A.addEventListener("dispose",G));const he=A.source;let ve=v.get(he);ve===void 0&&(ve={},v.set(he,ve));const de=J(A);if(de!==D.__cacheKey){ve[de]===void 0&&(ve[de]={texture:s.createTexture(),usedTimes:0},c.memory.textures++,$=!0),ve[de].usedTimes++;const Ye=ve[D.__cacheKey];Ye!==void 0&&(ve[D.__cacheKey].usedTimes--,Ye.usedTimes===0&&V(A)),D.__cacheKey=de,D.__webglTexture=ve[de].texture}return $}function Fe(D,A,$){let he=s.TEXTURE_2D;(A.isDataArrayTexture||A.isCompressedArrayTexture)&&(he=s.TEXTURE_2D_ARRAY),A.isData3DTexture&&(he=s.TEXTURE_3D);const ve=se(D,A),de=A.source;t.bindTexture(he,D.__webglTexture,s.TEXTURE0+$);const Ye=i.get(de);if(de.version!==Ye.__version||ve===!0){t.activeTexture(s.TEXTURE0+$);const Ae=Tt.getPrimaries(Tt.workingColorSpace),Oe=A.colorSpace===zr?null:Tt.getPrimaries(A.colorSpace),gt=A.colorSpace===zr||Ae===Oe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,A.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,A.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,gt);let Me=E(A.image,!1,o.maxTextureSize);Me=Dt(A,Me);const Be=l.convert(A.format,A.colorSpace),st=l.convert(A.type);let it=C(A.internalFormat,Be,st,A.colorSpace,A.isVideoTexture);F(he,A);let He;const pt=A.mipmaps,at=A.isVideoTexture!==!0,Rt=Ye.__version===void 0||ve===!0,W=de.dataReady,Ie=P(A,Me);if(A.isDepthTexture)it=b(A.format===To,A.type),Rt&&(at?t.texStorage2D(s.TEXTURE_2D,1,it,Me.width,Me.height):t.texImage2D(s.TEXTURE_2D,0,it,Me.width,Me.height,0,Be,st,null));else if(A.isDataTexture)if(pt.length>0){at&&Rt&&t.texStorage2D(s.TEXTURE_2D,Ie,it,pt[0].width,pt[0].height);for(let oe=0,fe=pt.length;oe<fe;oe++)He=pt[oe],at?W&&t.texSubImage2D(s.TEXTURE_2D,oe,0,0,He.width,He.height,Be,st,He.data):t.texImage2D(s.TEXTURE_2D,oe,it,He.width,He.height,0,Be,st,He.data);A.generateMipmaps=!1}else at?(Rt&&t.texStorage2D(s.TEXTURE_2D,Ie,it,Me.width,Me.height),W&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Me.width,Me.height,Be,st,Me.data)):t.texImage2D(s.TEXTURE_2D,0,it,Me.width,Me.height,0,Be,st,Me.data);else if(A.isCompressedTexture)if(A.isCompressedArrayTexture){at&&Rt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Ie,it,pt[0].width,pt[0].height,Me.depth);for(let oe=0,fe=pt.length;oe<fe;oe++)if(He=pt[oe],A.format!==Ci)if(Be!==null)if(at){if(W)if(A.layerUpdates.size>0){const Ce=J0(He.width,He.height,A.format,A.type);for(const Ue of A.layerUpdates){const mt=He.data.subarray(Ue*Ce/He.data.BYTES_PER_ELEMENT,(Ue+1)*Ce/He.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,oe,0,0,Ue,He.width,He.height,1,Be,mt,0,0)}A.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,oe,0,0,0,He.width,He.height,Me.depth,Be,He.data,0,0)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,oe,it,He.width,He.height,Me.depth,0,He.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else at?W&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,oe,0,0,0,He.width,He.height,Me.depth,Be,st,He.data):t.texImage3D(s.TEXTURE_2D_ARRAY,oe,it,He.width,He.height,Me.depth,0,Be,st,He.data)}else{at&&Rt&&t.texStorage2D(s.TEXTURE_2D,Ie,it,pt[0].width,pt[0].height);for(let oe=0,fe=pt.length;oe<fe;oe++)He=pt[oe],A.format!==Ci?Be!==null?at?W&&t.compressedTexSubImage2D(s.TEXTURE_2D,oe,0,0,He.width,He.height,Be,He.data):t.compressedTexImage2D(s.TEXTURE_2D,oe,it,He.width,He.height,0,He.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):at?W&&t.texSubImage2D(s.TEXTURE_2D,oe,0,0,He.width,He.height,Be,st,He.data):t.texImage2D(s.TEXTURE_2D,oe,it,He.width,He.height,0,Be,st,He.data)}else if(A.isDataArrayTexture)if(at){if(Rt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Ie,it,Me.width,Me.height,Me.depth),W)if(A.layerUpdates.size>0){const oe=J0(Me.width,Me.height,A.format,A.type);for(const fe of A.layerUpdates){const Ce=Me.data.subarray(fe*oe/Me.data.BYTES_PER_ELEMENT,(fe+1)*oe/Me.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,fe,Me.width,Me.height,1,Be,st,Ce)}A.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Me.width,Me.height,Me.depth,Be,st,Me.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,it,Me.width,Me.height,Me.depth,0,Be,st,Me.data);else if(A.isData3DTexture)at?(Rt&&t.texStorage3D(s.TEXTURE_3D,Ie,it,Me.width,Me.height,Me.depth),W&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Me.width,Me.height,Me.depth,Be,st,Me.data)):t.texImage3D(s.TEXTURE_3D,0,it,Me.width,Me.height,Me.depth,0,Be,st,Me.data);else if(A.isFramebufferTexture){if(Rt)if(at)t.texStorage2D(s.TEXTURE_2D,Ie,it,Me.width,Me.height);else{let oe=Me.width,fe=Me.height;for(let Ce=0;Ce<Ie;Ce++)t.texImage2D(s.TEXTURE_2D,Ce,it,oe,fe,0,Be,st,null),oe>>=1,fe>>=1}}else if(pt.length>0){if(at&&Rt){const oe=nt(pt[0]);t.texStorage2D(s.TEXTURE_2D,Ie,it,oe.width,oe.height)}for(let oe=0,fe=pt.length;oe<fe;oe++)He=pt[oe],at?W&&t.texSubImage2D(s.TEXTURE_2D,oe,0,0,Be,st,He):t.texImage2D(s.TEXTURE_2D,oe,it,Be,st,He);A.generateMipmaps=!1}else if(at){if(Rt){const oe=nt(Me);t.texStorage2D(s.TEXTURE_2D,Ie,it,oe.width,oe.height)}W&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Be,st,Me)}else t.texImage2D(s.TEXTURE_2D,0,it,Be,st,Me);x(A)&&y(he),Ye.__version=de.version,A.onUpdate&&A.onUpdate(A)}D.__version=A.version}function Z(D,A,$){if(A.image.length!==6)return;const he=se(D,A),ve=A.source;t.bindTexture(s.TEXTURE_CUBE_MAP,D.__webglTexture,s.TEXTURE0+$);const de=i.get(ve);if(ve.version!==de.__version||he===!0){t.activeTexture(s.TEXTURE0+$);const Ye=Tt.getPrimaries(Tt.workingColorSpace),Ae=A.colorSpace===zr?null:Tt.getPrimaries(A.colorSpace),Oe=A.colorSpace===zr||Ye===Ae?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,A.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,A.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Oe);const gt=A.isCompressedTexture||A.image[0].isCompressedTexture,Me=A.image[0]&&A.image[0].isDataTexture,Be=[];for(let fe=0;fe<6;fe++)!gt&&!Me?Be[fe]=E(A.image[fe],!0,o.maxCubemapSize):Be[fe]=Me?A.image[fe].image:A.image[fe],Be[fe]=Dt(A,Be[fe]);const st=Be[0],it=l.convert(A.format,A.colorSpace),He=l.convert(A.type),pt=C(A.internalFormat,it,He,A.colorSpace),at=A.isVideoTexture!==!0,Rt=de.__version===void 0||he===!0,W=ve.dataReady;let Ie=P(A,st);F(s.TEXTURE_CUBE_MAP,A);let oe;if(gt){at&&Rt&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Ie,pt,st.width,st.height);for(let fe=0;fe<6;fe++){oe=Be[fe].mipmaps;for(let Ce=0;Ce<oe.length;Ce++){const Ue=oe[Ce];A.format!==Ci?it!==null?at?W&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Ce,0,0,Ue.width,Ue.height,it,Ue.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Ce,pt,Ue.width,Ue.height,0,Ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Ce,0,0,Ue.width,Ue.height,it,He,Ue.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Ce,pt,Ue.width,Ue.height,0,it,He,Ue.data)}}}else{if(oe=A.mipmaps,at&&Rt){oe.length>0&&Ie++;const fe=nt(Be[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Ie,pt,fe.width,fe.height)}for(let fe=0;fe<6;fe++)if(Me){at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,0,0,Be[fe].width,Be[fe].height,it,He,Be[fe].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,pt,Be[fe].width,Be[fe].height,0,it,He,Be[fe].data);for(let Ce=0;Ce<oe.length;Ce++){const mt=oe[Ce].image[fe].image;at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Ce+1,0,0,mt.width,mt.height,it,He,mt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Ce+1,pt,mt.width,mt.height,0,it,He,mt.data)}}else{at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,0,0,it,He,Be[fe]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,pt,it,He,Be[fe]);for(let Ce=0;Ce<oe.length;Ce++){const Ue=oe[Ce];at?W&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Ce+1,0,0,it,He,Ue.image[fe]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Ce+1,pt,it,He,Ue.image[fe])}}}x(A)&&y(s.TEXTURE_CUBE_MAP),de.__version=ve.version,A.onUpdate&&A.onUpdate(A)}D.__version=A.version}function ce(D,A,$,he,ve,de){const Ye=l.convert($.format,$.colorSpace),Ae=l.convert($.type),Oe=C($.internalFormat,Ye,Ae,$.colorSpace);if(!i.get(A).__hasExternalTextures){const Me=Math.max(1,A.width>>de),Be=Math.max(1,A.height>>de);ve===s.TEXTURE_3D||ve===s.TEXTURE_2D_ARRAY?t.texImage3D(ve,de,Oe,Me,Be,A.depth,0,Ye,Ae,null):t.texImage2D(ve,de,Oe,Me,Be,0,Ye,Ae,null)}t.bindFramebuffer(s.FRAMEBUFFER,D),_t(A)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,he,ve,i.get($).__webglTexture,0,ht(A)):(ve===s.TEXTURE_2D||ve>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ve<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,he,ve,i.get($).__webglTexture,de),t.bindFramebuffer(s.FRAMEBUFFER,null)}function xe(D,A,$){if(s.bindRenderbuffer(s.RENDERBUFFER,D),A.depthBuffer){const he=A.depthTexture,ve=he&&he.isDepthTexture?he.type:null,de=b(A.stencilBuffer,ve),Ye=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ae=ht(A);_t(A)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ae,de,A.width,A.height):$?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ae,de,A.width,A.height):s.renderbufferStorage(s.RENDERBUFFER,de,A.width,A.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Ye,s.RENDERBUFFER,D)}else{const he=A.textures;for(let ve=0;ve<he.length;ve++){const de=he[ve],Ye=l.convert(de.format,de.colorSpace),Ae=l.convert(de.type),Oe=C(de.internalFormat,Ye,Ae,de.colorSpace),gt=ht(A);$&&_t(A)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,gt,Oe,A.width,A.height):_t(A)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,gt,Oe,A.width,A.height):s.renderbufferStorage(s.RENDERBUFFER,Oe,A.width,A.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Se(D,A){if(A&&A.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,D),!(A.depthTexture&&A.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(A.depthTexture).__webglTexture||A.depthTexture.image.width!==A.width||A.depthTexture.image.height!==A.height)&&(A.depthTexture.image.width=A.width,A.depthTexture.image.height=A.height,A.depthTexture.needsUpdate=!0),re(A.depthTexture,0);const he=i.get(A.depthTexture).__webglTexture,ve=ht(A);if(A.depthTexture.format===yo)_t(A)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,he,0,ve):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,he,0);else if(A.depthTexture.format===To)_t(A)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,he,0,ve):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,he,0);else throw new Error("Unknown depthTexture format")}function Le(D){const A=i.get(D),$=D.isWebGLCubeRenderTarget===!0;if(A.__boundDepthTexture!==D.depthTexture){const he=D.depthTexture;if(A.__depthDisposeCallback&&A.__depthDisposeCallback(),he){const ve=()=>{delete A.__boundDepthTexture,delete A.__depthDisposeCallback,he.removeEventListener("dispose",ve)};he.addEventListener("dispose",ve),A.__depthDisposeCallback=ve}A.__boundDepthTexture=he}if(D.depthTexture&&!A.__autoAllocateDepthBuffer){if($)throw new Error("target.depthTexture not supported in Cube render targets");Se(A.__webglFramebuffer,D)}else if($){A.__webglDepthbuffer=[];for(let he=0;he<6;he++)if(t.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer[he]),A.__webglDepthbuffer[he]===void 0)A.__webglDepthbuffer[he]=s.createRenderbuffer(),xe(A.__webglDepthbuffer[he],D,!1);else{const ve=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,de=A.__webglDepthbuffer[he];s.bindRenderbuffer(s.RENDERBUFFER,de),s.framebufferRenderbuffer(s.FRAMEBUFFER,ve,s.RENDERBUFFER,de)}}else if(t.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer),A.__webglDepthbuffer===void 0)A.__webglDepthbuffer=s.createRenderbuffer(),xe(A.__webglDepthbuffer,D,!1);else{const he=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ve=A.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ve),s.framebufferRenderbuffer(s.FRAMEBUFFER,he,s.RENDERBUFFER,ve)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function De(D,A,$){const he=i.get(D);A!==void 0&&ce(he.__webglFramebuffer,D,D.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),$!==void 0&&Le(D)}function rt(D){const A=D.texture,$=i.get(D),he=i.get(A);D.addEventListener("dispose",k);const ve=D.textures,de=D.isWebGLCubeRenderTarget===!0,Ye=ve.length>1;if(Ye||(he.__webglTexture===void 0&&(he.__webglTexture=s.createTexture()),he.__version=A.version,c.memory.textures++),de){$.__webglFramebuffer=[];for(let Ae=0;Ae<6;Ae++)if(A.mipmaps&&A.mipmaps.length>0){$.__webglFramebuffer[Ae]=[];for(let Oe=0;Oe<A.mipmaps.length;Oe++)$.__webglFramebuffer[Ae][Oe]=s.createFramebuffer()}else $.__webglFramebuffer[Ae]=s.createFramebuffer()}else{if(A.mipmaps&&A.mipmaps.length>0){$.__webglFramebuffer=[];for(let Ae=0;Ae<A.mipmaps.length;Ae++)$.__webglFramebuffer[Ae]=s.createFramebuffer()}else $.__webglFramebuffer=s.createFramebuffer();if(Ye)for(let Ae=0,Oe=ve.length;Ae<Oe;Ae++){const gt=i.get(ve[Ae]);gt.__webglTexture===void 0&&(gt.__webglTexture=s.createTexture(),c.memory.textures++)}if(D.samples>0&&_t(D)===!1){$.__webglMultisampledFramebuffer=s.createFramebuffer(),$.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,$.__webglMultisampledFramebuffer);for(let Ae=0;Ae<ve.length;Ae++){const Oe=ve[Ae];$.__webglColorRenderbuffer[Ae]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,$.__webglColorRenderbuffer[Ae]);const gt=l.convert(Oe.format,Oe.colorSpace),Me=l.convert(Oe.type),Be=C(Oe.internalFormat,gt,Me,Oe.colorSpace,D.isXRRenderTarget===!0),st=ht(D);s.renderbufferStorageMultisample(s.RENDERBUFFER,st,Be,D.width,D.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ae,s.RENDERBUFFER,$.__webglColorRenderbuffer[Ae])}s.bindRenderbuffer(s.RENDERBUFFER,null),D.depthBuffer&&($.__webglDepthRenderbuffer=s.createRenderbuffer(),xe($.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(de){t.bindTexture(s.TEXTURE_CUBE_MAP,he.__webglTexture),F(s.TEXTURE_CUBE_MAP,A);for(let Ae=0;Ae<6;Ae++)if(A.mipmaps&&A.mipmaps.length>0)for(let Oe=0;Oe<A.mipmaps.length;Oe++)ce($.__webglFramebuffer[Ae][Oe],D,A,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,Oe);else ce($.__webglFramebuffer[Ae],D,A,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,0);x(A)&&y(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ye){for(let Ae=0,Oe=ve.length;Ae<Oe;Ae++){const gt=ve[Ae],Me=i.get(gt);t.bindTexture(s.TEXTURE_2D,Me.__webglTexture),F(s.TEXTURE_2D,gt),ce($.__webglFramebuffer,D,gt,s.COLOR_ATTACHMENT0+Ae,s.TEXTURE_2D,0),x(gt)&&y(s.TEXTURE_2D)}t.unbindTexture()}else{let Ae=s.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(Ae=D.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(Ae,he.__webglTexture),F(Ae,A),A.mipmaps&&A.mipmaps.length>0)for(let Oe=0;Oe<A.mipmaps.length;Oe++)ce($.__webglFramebuffer[Oe],D,A,s.COLOR_ATTACHMENT0,Ae,Oe);else ce($.__webglFramebuffer,D,A,s.COLOR_ATTACHMENT0,Ae,0);x(A)&&y(Ae),t.unbindTexture()}D.depthBuffer&&Le(D)}function yt(D){const A=D.textures;for(let $=0,he=A.length;$<he;$++){const ve=A[$];if(x(ve)){const de=D.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:s.TEXTURE_2D,Ye=i.get(ve).__webglTexture;t.bindTexture(de,Ye),y(de),t.unbindTexture()}}}const ft=[],B=[];function vn(D){if(D.samples>0){if(_t(D)===!1){const A=D.textures,$=D.width,he=D.height;let ve=s.COLOR_BUFFER_BIT;const de=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ye=i.get(D),Ae=A.length>1;if(Ae)for(let Oe=0;Oe<A.length;Oe++)t.bindFramebuffer(s.FRAMEBUFFER,Ye.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Oe,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Ye.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Oe,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Ye.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ye.__webglFramebuffer);for(let Oe=0;Oe<A.length;Oe++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(ve|=s.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(ve|=s.STENCIL_BUFFER_BIT)),Ae){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Ye.__webglColorRenderbuffer[Oe]);const gt=i.get(A[Oe]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,gt,0)}s.blitFramebuffer(0,0,$,he,0,0,$,he,ve,s.NEAREST),h===!0&&(ft.length=0,B.length=0,ft.push(s.COLOR_ATTACHMENT0+Oe),D.depthBuffer&&D.resolveDepthBuffer===!1&&(ft.push(de),B.push(de),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,B)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,ft))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Ae)for(let Oe=0;Oe<A.length;Oe++){t.bindFramebuffer(s.FRAMEBUFFER,Ye.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Oe,s.RENDERBUFFER,Ye.__webglColorRenderbuffer[Oe]);const gt=i.get(A[Oe]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Ye.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Oe,s.TEXTURE_2D,gt,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ye.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&h){const A=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[A])}}}function ht(D){return Math.min(o.maxSamples,D.samples)}function _t(D){const A=i.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&A.__useRenderToTexture!==!1}function et(D){const A=c.render.frame;m.get(D)!==A&&(m.set(D,A),D.update())}function Dt(D,A){const $=D.colorSpace,he=D.format,ve=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||$!==Wr&&$!==zr&&(Tt.getTransfer($)===Bt?(he!==Ci||ve!==cr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",$)),A}function nt(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(p.width=D.naturalWidth||D.width,p.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(p.width=D.displayWidth,p.height=D.displayHeight):(p.width=D.width,p.height=D.height),p}this.allocateTextureUnit=Q,this.resetTextureUnits=L,this.setTexture2D=re,this.setTexture2DArray=pe,this.setTexture3D=ee,this.setTextureCube=me,this.rebindTextures=De,this.setupRenderTarget=rt,this.updateRenderTargetMipmap=yt,this.updateMultisampleRenderTarget=vn,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=ce,this.useMultisampledRTT=_t}function oE(s,e){function t(i,o=zr){let l;const c=Tt.getTransfer(o);if(i===cr)return s.UNSIGNED_BYTE;if(i===cf)return s.UNSIGNED_SHORT_4_4_4_4;if(i===uf)return s.UNSIGNED_SHORT_5_5_5_1;if(i===N_)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===D_)return s.BYTE;if(i===I_)return s.SHORT;if(i===La)return s.UNSIGNED_SHORT;if(i===lf)return s.INT;if(i===xs)return s.UNSIGNED_INT;if(i===ki)return s.FLOAT;if(i===ar)return s.HALF_FLOAT;if(i===U_)return s.ALPHA;if(i===k_)return s.RGB;if(i===Ci)return s.RGBA;if(i===F_)return s.LUMINANCE;if(i===O_)return s.LUMINANCE_ALPHA;if(i===yo)return s.DEPTH_COMPONENT;if(i===To)return s.DEPTH_STENCIL;if(i===df)return s.RED;if(i===hf)return s.RED_INTEGER;if(i===B_)return s.RG;if(i===ff)return s.RG_INTEGER;if(i===pf)return s.RGBA_INTEGER;if(i===xc||i===Sc||i===Mc||i===wc)if(c===Bt)if(l=e.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(i===xc)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Sc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Mc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===wc)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=e.get("WEBGL_compressed_texture_s3tc"),l!==null){if(i===xc)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Sc)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Mc)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===wc)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===wh||i===Eh||i===Th||i===bh)if(l=e.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(i===wh)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Eh)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Th)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===bh)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ah||i===Ch||i===Rh)if(l=e.get("WEBGL_compressed_texture_etc"),l!==null){if(i===Ah||i===Ch)return c===Bt?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(i===Rh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Ph||i===Lh||i===Dh||i===Ih||i===Nh||i===Uh||i===kh||i===Fh||i===Oh||i===Bh||i===zh||i===Vh||i===Hh||i===Gh)if(l=e.get("WEBGL_compressed_texture_astc"),l!==null){if(i===Ph)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Lh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Dh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Ih)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Nh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Uh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===kh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Fh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Oh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Bh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===zh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Vh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Hh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Gh)return c===Bt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ec||i===Wh||i===qh)if(l=e.get("EXT_texture_compression_bptc"),l!==null){if(i===Ec)return c===Bt?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Wh)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===qh)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===z_||i===Xh||i===jh||i===Kh)if(l=e.get("EXT_texture_compression_rgtc"),l!==null){if(i===Ec)return l.COMPRESSED_RED_RGTC1_EXT;if(i===Xh)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===jh)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Kh)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Eo?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:t}}class aE extends ii{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class _n extends kt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const lE={type:"move"};class eh{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new _n,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new _n,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new _n,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let o=null,l=null,c=null;const d=this._targetRay,h=this._grip,p=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(p&&e.hand){c=!0;for(const E of e.hand.values()){const x=t.getJointPose(E,i),y=this._getHandJoint(p,E);x!==null&&(y.matrix.fromArray(x.transform.matrix),y.matrix.decompose(y.position,y.rotation,y.scale),y.matrixWorldNeedsUpdate=!0,y.jointRadius=x.radius),y.visible=x!==null}const m=p.joints["index-finger-tip"],_=p.joints["thumb-tip"],v=m.position.distanceTo(_.position),S=.02,M=.005;p.inputState.pinching&&v>S+M?(p.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!p.inputState.pinching&&v<=S-M&&(p.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else h!==null&&e.gripSpace&&(l=t.getPose(e.gripSpace,i),l!==null&&(h.matrix.fromArray(l.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,l.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(l.linearVelocity)):h.hasLinearVelocity=!1,l.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(l.angularVelocity)):h.hasAngularVelocity=!1));d!==null&&(o=t.getPose(e.targetRaySpace,i),o===null&&l!==null&&(o=l),o!==null&&(d.matrix.fromArray(o.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,o.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(o.linearVelocity)):d.hasLinearVelocity=!1,o.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(o.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(lE)))}return d!==null&&(d.visible=o!==null),h!==null&&(h.visible=l!==null),p!==null&&(p.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new _n;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const cE=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,uE=`
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

}`;class dE{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const o=new Dn,l=e.properties.get(o);l.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=o}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ln({vertexShader:cE,fragmentShader:uE,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new be(new ws(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class hE extends Po{constructor(e,t){super();const i=this;let o=null,l=1,c=null,d="local-floor",h=1,p=null,m=null,_=null,v=null,S=null,M=null;const E=new dE,x=t.getContextAttributes();let y=null,C=null;const b=[],P=[],G=new Pe;let k=null;const U=new ii;U.layers.enable(1),U.viewport=new Nt;const V=new ii;V.layers.enable(2),V.viewport=new Nt;const le=[U,V],w=new aE;w.layers.enable(1),w.layers.enable(2);let L=null,Q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ce=b[Z];return ce===void 0&&(ce=new eh,b[Z]=ce),ce.getTargetRaySpace()},this.getControllerGrip=function(Z){let ce=b[Z];return ce===void 0&&(ce=new eh,b[Z]=ce),ce.getGripSpace()},this.getHand=function(Z){let ce=b[Z];return ce===void 0&&(ce=new eh,b[Z]=ce),ce.getHandSpace()};function J(Z){const ce=P.indexOf(Z.inputSource);if(ce===-1)return;const xe=b[ce];xe!==void 0&&(xe.update(Z.inputSource,Z.frame,p||c),xe.dispatchEvent({type:Z.type,data:Z.inputSource}))}function re(){o.removeEventListener("select",J),o.removeEventListener("selectstart",J),o.removeEventListener("selectend",J),o.removeEventListener("squeeze",J),o.removeEventListener("squeezestart",J),o.removeEventListener("squeezeend",J),o.removeEventListener("end",re),o.removeEventListener("inputsourceschange",pe);for(let Z=0;Z<b.length;Z++){const ce=P[Z];ce!==null&&(P[Z]=null,b[Z].disconnect(ce))}L=null,Q=null,E.reset(),e.setRenderTarget(y),S=null,v=null,_=null,o=null,C=null,Fe.stop(),i.isPresenting=!1,e.setPixelRatio(k),e.setSize(G.width,G.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){l=Z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){d=Z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return p||c},this.setReferenceSpace=function(Z){p=Z},this.getBaseLayer=function(){return v!==null?v:S},this.getBinding=function(){return _},this.getFrame=function(){return M},this.getSession=function(){return o},this.setSession=async function(Z){if(o=Z,o!==null){if(y=e.getRenderTarget(),o.addEventListener("select",J),o.addEventListener("selectstart",J),o.addEventListener("selectend",J),o.addEventListener("squeeze",J),o.addEventListener("squeezestart",J),o.addEventListener("squeezeend",J),o.addEventListener("end",re),o.addEventListener("inputsourceschange",pe),x.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(G),o.renderState.layers===void 0){const ce={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:l};S=new XRWebGLLayer(o,t,ce),o.updateRenderState({baseLayer:S}),e.setPixelRatio(1),e.setSize(S.framebufferWidth,S.framebufferHeight,!1),C=new Ri(S.framebufferWidth,S.framebufferHeight,{format:Ci,type:cr,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let ce=null,xe=null,Se=null;x.depth&&(Se=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ce=x.stencil?To:yo,xe=x.stencil?Eo:xs);const Le={colorFormat:t.RGBA8,depthFormat:Se,scaleFactor:l};_=new XRWebGLBinding(o,t),v=_.createProjectionLayer(Le),o.updateRenderState({layers:[v]}),e.setPixelRatio(1),e.setSize(v.textureWidth,v.textureHeight,!1),C=new Ri(v.textureWidth,v.textureHeight,{format:Ci,type:cr,depthTexture:new Z_(v.textureWidth,v.textureHeight,xe,void 0,void 0,void 0,void 0,void 0,void 0,ce),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:v.ignoreDepthValues===!1})}C.isXRRenderTarget=!0,this.setFoveation(h),p=null,c=await o.requestReferenceSpace(d),Fe.setContext(o),Fe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode},this.getDepthTexture=function(){return E.getDepthTexture()};function pe(Z){for(let ce=0;ce<Z.removed.length;ce++){const xe=Z.removed[ce],Se=P.indexOf(xe);Se>=0&&(P[Se]=null,b[Se].disconnect(xe))}for(let ce=0;ce<Z.added.length;ce++){const xe=Z.added[ce];let Se=P.indexOf(xe);if(Se===-1){for(let De=0;De<b.length;De++)if(De>=P.length){P.push(xe),Se=De;break}else if(P[De]===null){P[De]=xe,Se=De;break}if(Se===-1)break}const Le=b[Se];Le&&Le.connect(xe)}}const ee=new I,me=new I;function z(Z,ce,xe){ee.setFromMatrixPosition(ce.matrixWorld),me.setFromMatrixPosition(xe.matrixWorld);const Se=ee.distanceTo(me),Le=ce.projectionMatrix.elements,De=xe.projectionMatrix.elements,rt=Le[14]/(Le[10]-1),yt=Le[14]/(Le[10]+1),ft=(Le[9]+1)/Le[5],B=(Le[9]-1)/Le[5],vn=(Le[8]-1)/Le[0],ht=(De[8]+1)/De[0],_t=rt*vn,et=rt*ht,Dt=Se/(-vn+ht),nt=Dt*-vn;if(ce.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(nt),Z.translateZ(Dt),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Le[10]===-1)Z.projectionMatrix.copy(ce.projectionMatrix),Z.projectionMatrixInverse.copy(ce.projectionMatrixInverse);else{const D=rt+Dt,A=yt+Dt,$=_t-nt,he=et+(Se-nt),ve=ft*yt/A*D,de=B*yt/A*D;Z.projectionMatrix.makePerspective($,he,ve,de,D,A),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function ue(Z,ce){ce===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ce.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(o===null)return;let ce=Z.near,xe=Z.far;E.texture!==null&&(E.depthNear>0&&(ce=E.depthNear),E.depthFar>0&&(xe=E.depthFar)),w.near=V.near=U.near=ce,w.far=V.far=U.far=xe,(L!==w.near||Q!==w.far)&&(o.updateRenderState({depthNear:w.near,depthFar:w.far}),L=w.near,Q=w.far);const Se=Z.parent,Le=w.cameras;ue(w,Se);for(let De=0;De<Le.length;De++)ue(Le[De],Se);Le.length===2?z(w,U,V):w.projectionMatrix.copy(U.projectionMatrix),ae(Z,w,Se)};function ae(Z,ce,xe){xe===null?Z.matrix.copy(ce.matrixWorld):(Z.matrix.copy(xe.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ce.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ce.projectionMatrix),Z.projectionMatrixInverse.copy(ce.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Da*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return w},this.getFoveation=function(){if(!(v===null&&S===null))return h},this.setFoveation=function(Z){h=Z,v!==null&&(v.fixedFoveation=Z),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=Z)},this.hasDepthSensing=function(){return E.texture!==null},this.getDepthSensingMesh=function(){return E.getMesh(w)};let F=null;function se(Z,ce){if(m=ce.getViewerPose(p||c),M=ce,m!==null){const xe=m.views;S!==null&&(e.setRenderTargetFramebuffer(C,S.framebuffer),e.setRenderTarget(C));let Se=!1;xe.length!==w.cameras.length&&(w.cameras.length=0,Se=!0);for(let De=0;De<xe.length;De++){const rt=xe[De];let yt=null;if(S!==null)yt=S.getViewport(rt);else{const B=_.getViewSubImage(v,rt);yt=B.viewport,De===0&&(e.setRenderTargetTextures(C,B.colorTexture,v.ignoreDepthValues?void 0:B.depthStencilTexture),e.setRenderTarget(C))}let ft=le[De];ft===void 0&&(ft=new ii,ft.layers.enable(De),ft.viewport=new Nt,le[De]=ft),ft.matrix.fromArray(rt.transform.matrix),ft.matrix.decompose(ft.position,ft.quaternion,ft.scale),ft.projectionMatrix.fromArray(rt.projectionMatrix),ft.projectionMatrixInverse.copy(ft.projectionMatrix).invert(),ft.viewport.set(yt.x,yt.y,yt.width,yt.height),De===0&&(w.matrix.copy(ft.matrix),w.matrix.decompose(w.position,w.quaternion,w.scale)),Se===!0&&w.cameras.push(ft)}const Le=o.enabledFeatures;if(Le&&Le.includes("depth-sensing")){const De=_.getDepthInformation(xe[0]);De&&De.isValid&&De.texture&&E.init(e,De,o.renderState)}}for(let xe=0;xe<b.length;xe++){const Se=P[xe],Le=b[xe];Se!==null&&Le!==void 0&&Le.update(Se,ce,p||c)}F&&F(Z,ce),ce.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ce}),M=null}const Fe=new J_;Fe.setAnimationLoop(se),this.setAnimationLoop=function(Z){F=Z},this.dispose=function(){}}}const us=new Oi,fE=new At;function pE(s,e){function t(x,y){x.matrixAutoUpdate===!0&&x.updateMatrix(),y.value.copy(x.matrix)}function i(x,y){y.color.getRGB(x.fogColor.value,Y_(s)),y.isFog?(x.fogNear.value=y.near,x.fogFar.value=y.far):y.isFogExp2&&(x.fogDensity.value=y.density)}function o(x,y,C,b,P){y.isMeshBasicMaterial||y.isMeshLambertMaterial?l(x,y):y.isMeshToonMaterial?(l(x,y),_(x,y)):y.isMeshPhongMaterial?(l(x,y),m(x,y)):y.isMeshStandardMaterial?(l(x,y),v(x,y),y.isMeshPhysicalMaterial&&S(x,y,P)):y.isMeshMatcapMaterial?(l(x,y),M(x,y)):y.isMeshDepthMaterial?l(x,y):y.isMeshDistanceMaterial?(l(x,y),E(x,y)):y.isMeshNormalMaterial?l(x,y):y.isLineBasicMaterial?(c(x,y),y.isLineDashedMaterial&&d(x,y)):y.isPointsMaterial?h(x,y,C,b):y.isSpriteMaterial?p(x,y):y.isShadowMaterial?(x.color.value.copy(y.color),x.opacity.value=y.opacity):y.isShaderMaterial&&(y.uniformsNeedUpdate=!1)}function l(x,y){x.opacity.value=y.opacity,y.color&&x.diffuse.value.copy(y.color),y.emissive&&x.emissive.value.copy(y.emissive).multiplyScalar(y.emissiveIntensity),y.map&&(x.map.value=y.map,t(y.map,x.mapTransform)),y.alphaMap&&(x.alphaMap.value=y.alphaMap,t(y.alphaMap,x.alphaMapTransform)),y.bumpMap&&(x.bumpMap.value=y.bumpMap,t(y.bumpMap,x.bumpMapTransform),x.bumpScale.value=y.bumpScale,y.side===Fn&&(x.bumpScale.value*=-1)),y.normalMap&&(x.normalMap.value=y.normalMap,t(y.normalMap,x.normalMapTransform),x.normalScale.value.copy(y.normalScale),y.side===Fn&&x.normalScale.value.negate()),y.displacementMap&&(x.displacementMap.value=y.displacementMap,t(y.displacementMap,x.displacementMapTransform),x.displacementScale.value=y.displacementScale,x.displacementBias.value=y.displacementBias),y.emissiveMap&&(x.emissiveMap.value=y.emissiveMap,t(y.emissiveMap,x.emissiveMapTransform)),y.specularMap&&(x.specularMap.value=y.specularMap,t(y.specularMap,x.specularMapTransform)),y.alphaTest>0&&(x.alphaTest.value=y.alphaTest);const C=e.get(y),b=C.envMap,P=C.envMapRotation;b&&(x.envMap.value=b,us.copy(P),us.x*=-1,us.y*=-1,us.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(us.y*=-1,us.z*=-1),x.envMapRotation.value.setFromMatrix4(fE.makeRotationFromEuler(us)),x.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,x.reflectivity.value=y.reflectivity,x.ior.value=y.ior,x.refractionRatio.value=y.refractionRatio),y.lightMap&&(x.lightMap.value=y.lightMap,x.lightMapIntensity.value=y.lightMapIntensity,t(y.lightMap,x.lightMapTransform)),y.aoMap&&(x.aoMap.value=y.aoMap,x.aoMapIntensity.value=y.aoMapIntensity,t(y.aoMap,x.aoMapTransform))}function c(x,y){x.diffuse.value.copy(y.color),x.opacity.value=y.opacity,y.map&&(x.map.value=y.map,t(y.map,x.mapTransform))}function d(x,y){x.dashSize.value=y.dashSize,x.totalSize.value=y.dashSize+y.gapSize,x.scale.value=y.scale}function h(x,y,C,b){x.diffuse.value.copy(y.color),x.opacity.value=y.opacity,x.size.value=y.size*C,x.scale.value=b*.5,y.map&&(x.map.value=y.map,t(y.map,x.uvTransform)),y.alphaMap&&(x.alphaMap.value=y.alphaMap,t(y.alphaMap,x.alphaMapTransform)),y.alphaTest>0&&(x.alphaTest.value=y.alphaTest)}function p(x,y){x.diffuse.value.copy(y.color),x.opacity.value=y.opacity,x.rotation.value=y.rotation,y.map&&(x.map.value=y.map,t(y.map,x.mapTransform)),y.alphaMap&&(x.alphaMap.value=y.alphaMap,t(y.alphaMap,x.alphaMapTransform)),y.alphaTest>0&&(x.alphaTest.value=y.alphaTest)}function m(x,y){x.specular.value.copy(y.specular),x.shininess.value=Math.max(y.shininess,1e-4)}function _(x,y){y.gradientMap&&(x.gradientMap.value=y.gradientMap)}function v(x,y){x.metalness.value=y.metalness,y.metalnessMap&&(x.metalnessMap.value=y.metalnessMap,t(y.metalnessMap,x.metalnessMapTransform)),x.roughness.value=y.roughness,y.roughnessMap&&(x.roughnessMap.value=y.roughnessMap,t(y.roughnessMap,x.roughnessMapTransform)),y.envMap&&(x.envMapIntensity.value=y.envMapIntensity)}function S(x,y,C){x.ior.value=y.ior,y.sheen>0&&(x.sheenColor.value.copy(y.sheenColor).multiplyScalar(y.sheen),x.sheenRoughness.value=y.sheenRoughness,y.sheenColorMap&&(x.sheenColorMap.value=y.sheenColorMap,t(y.sheenColorMap,x.sheenColorMapTransform)),y.sheenRoughnessMap&&(x.sheenRoughnessMap.value=y.sheenRoughnessMap,t(y.sheenRoughnessMap,x.sheenRoughnessMapTransform))),y.clearcoat>0&&(x.clearcoat.value=y.clearcoat,x.clearcoatRoughness.value=y.clearcoatRoughness,y.clearcoatMap&&(x.clearcoatMap.value=y.clearcoatMap,t(y.clearcoatMap,x.clearcoatMapTransform)),y.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=y.clearcoatRoughnessMap,t(y.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),y.clearcoatNormalMap&&(x.clearcoatNormalMap.value=y.clearcoatNormalMap,t(y.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(y.clearcoatNormalScale),y.side===Fn&&x.clearcoatNormalScale.value.negate())),y.dispersion>0&&(x.dispersion.value=y.dispersion),y.iridescence>0&&(x.iridescence.value=y.iridescence,x.iridescenceIOR.value=y.iridescenceIOR,x.iridescenceThicknessMinimum.value=y.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=y.iridescenceThicknessRange[1],y.iridescenceMap&&(x.iridescenceMap.value=y.iridescenceMap,t(y.iridescenceMap,x.iridescenceMapTransform)),y.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=y.iridescenceThicknessMap,t(y.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),y.transmission>0&&(x.transmission.value=y.transmission,x.transmissionSamplerMap.value=C.texture,x.transmissionSamplerSize.value.set(C.width,C.height),y.transmissionMap&&(x.transmissionMap.value=y.transmissionMap,t(y.transmissionMap,x.transmissionMapTransform)),x.thickness.value=y.thickness,y.thicknessMap&&(x.thicknessMap.value=y.thicknessMap,t(y.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=y.attenuationDistance,x.attenuationColor.value.copy(y.attenuationColor)),y.anisotropy>0&&(x.anisotropyVector.value.set(y.anisotropy*Math.cos(y.anisotropyRotation),y.anisotropy*Math.sin(y.anisotropyRotation)),y.anisotropyMap&&(x.anisotropyMap.value=y.anisotropyMap,t(y.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=y.specularIntensity,x.specularColor.value.copy(y.specularColor),y.specularColorMap&&(x.specularColorMap.value=y.specularColorMap,t(y.specularColorMap,x.specularColorMapTransform)),y.specularIntensityMap&&(x.specularIntensityMap.value=y.specularIntensityMap,t(y.specularIntensityMap,x.specularIntensityMapTransform))}function M(x,y){y.matcap&&(x.matcap.value=y.matcap)}function E(x,y){const C=e.get(y).light;x.referencePosition.value.setFromMatrixPosition(C.matrixWorld),x.nearDistance.value=C.shadow.camera.near,x.farDistance.value=C.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:o}}function mE(s,e,t,i){let o={},l={},c=[];const d=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function h(C,b){const P=b.program;i.uniformBlockBinding(C,P)}function p(C,b){let P=o[C.id];P===void 0&&(M(C),P=m(C),o[C.id]=P,C.addEventListener("dispose",x));const G=b.program;i.updateUBOMapping(C,G);const k=e.render.frame;l[C.id]!==k&&(v(C),l[C.id]=k)}function m(C){const b=_();C.__bindingPointIndex=b;const P=s.createBuffer(),G=C.__size,k=C.usage;return s.bindBuffer(s.UNIFORM_BUFFER,P),s.bufferData(s.UNIFORM_BUFFER,G,k),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,P),P}function _(){for(let C=0;C<d;C++)if(c.indexOf(C)===-1)return c.push(C),C;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function v(C){const b=o[C.id],P=C.uniforms,G=C.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let k=0,U=P.length;k<U;k++){const V=Array.isArray(P[k])?P[k]:[P[k]];for(let le=0,w=V.length;le<w;le++){const L=V[le];if(S(L,k,le,G)===!0){const Q=L.__offset,J=Array.isArray(L.value)?L.value:[L.value];let re=0;for(let pe=0;pe<J.length;pe++){const ee=J[pe],me=E(ee);typeof ee=="number"||typeof ee=="boolean"?(L.__data[0]=ee,s.bufferSubData(s.UNIFORM_BUFFER,Q+re,L.__data)):ee.isMatrix3?(L.__data[0]=ee.elements[0],L.__data[1]=ee.elements[1],L.__data[2]=ee.elements[2],L.__data[3]=0,L.__data[4]=ee.elements[3],L.__data[5]=ee.elements[4],L.__data[6]=ee.elements[5],L.__data[7]=0,L.__data[8]=ee.elements[6],L.__data[9]=ee.elements[7],L.__data[10]=ee.elements[8],L.__data[11]=0):(ee.toArray(L.__data,re),re+=me.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,Q,L.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function S(C,b,P,G){const k=C.value,U=b+"_"+P;if(G[U]===void 0)return typeof k=="number"||typeof k=="boolean"?G[U]=k:G[U]=k.clone(),!0;{const V=G[U];if(typeof k=="number"||typeof k=="boolean"){if(V!==k)return G[U]=k,!0}else if(V.equals(k)===!1)return V.copy(k),!0}return!1}function M(C){const b=C.uniforms;let P=0;const G=16;for(let U=0,V=b.length;U<V;U++){const le=Array.isArray(b[U])?b[U]:[b[U]];for(let w=0,L=le.length;w<L;w++){const Q=le[w],J=Array.isArray(Q.value)?Q.value:[Q.value];for(let re=0,pe=J.length;re<pe;re++){const ee=J[re],me=E(ee),z=P%G,ue=z%me.boundary,ae=z+ue;P+=ue,ae!==0&&G-ae<me.storage&&(P+=G-ae),Q.__data=new Float32Array(me.storage/Float32Array.BYTES_PER_ELEMENT),Q.__offset=P,P+=me.storage}}}const k=P%G;return k>0&&(P+=G-k),C.__size=P,C.__cache={},this}function E(C){const b={boundary:0,storage:0};return typeof C=="number"||typeof C=="boolean"?(b.boundary=4,b.storage=4):C.isVector2?(b.boundary=8,b.storage=8):C.isVector3||C.isColor?(b.boundary=16,b.storage=12):C.isVector4?(b.boundary=16,b.storage=16):C.isMatrix3?(b.boundary=48,b.storage=48):C.isMatrix4?(b.boundary=64,b.storage=64):C.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",C),b}function x(C){const b=C.target;b.removeEventListener("dispose",x);const P=c.indexOf(b.__bindingPointIndex);c.splice(P,1),s.deleteBuffer(o[b.id]),delete o[b.id],delete l[b.id]}function y(){for(const C in o)s.deleteBuffer(o[C]);c=[],o={},l={}}return{bind:h,update:p,dispose:y}}class _E{constructor(e={}){const{canvas:t=rx(),context:i=null,depth:o=!0,stencil:l=!1,alpha:c=!1,antialias:d=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:p=!1,powerPreference:m="default",failIfMajorPerformanceCaveat:_=!1}=e;this.isWebGLRenderer=!0;let v;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");v=i.getContextAttributes().alpha}else v=c;const S=new Uint32Array(4),M=new Int32Array(4);let E=null,x=null;const y=[],C=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=wi,this.toneMapping=Hr,this.toneMappingExposure=1;const b=this;let P=!1,G=0,k=0,U=null,V=-1,le=null;const w=new Nt,L=new Nt;let Q=null;const J=new $e(0);let re=0,pe=t.width,ee=t.height,me=1,z=null,ue=null;const ae=new Nt(0,0,pe,ee),F=new Nt(0,0,pe,ee);let se=!1;const Fe=new vf;let Z=!1,ce=!1;const xe=new At,Se=new At,Le=new I,De=new Nt,rt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let yt=!1;function ft(){return U===null?me:1}let B=i;function vn(R,q){return t.getContext(R,q)}try{const R={alpha:!0,depth:o,stencil:l,antialias:d,premultipliedAlpha:h,preserveDrawingBuffer:p,powerPreference:m,failIfMajorPerformanceCaveat:_};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${of}`),t.addEventListener("webglcontextlost",fe,!1),t.addEventListener("webglcontextrestored",Ce,!1),t.addEventListener("webglcontextcreationerror",Ue,!1),B===null){const q="webgl2";if(B=vn(q,R),B===null)throw vn(q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let ht,_t,et,Dt,nt,D,A,$,he,ve,de,Ye,Ae,Oe,gt,Me,Be,st,it,He,pt,at,Rt,W;function Ie(){ht=new SM(B),ht.init(),at=new oE(B,ht),_t=new mM(B,ht,e,at),et=new iE(B),_t.reverseDepthBuffer&&et.buffers.depth.setReversed(!0),Dt=new EM(B),nt=new Hw,D=new sE(B,ht,et,nt,_t,at,Dt),A=new gM(b),$=new xM(b),he=new Lx(B),Rt=new fM(B,he),ve=new MM(B,he,Dt,Rt),de=new bM(B,ve,he,Dt),it=new TM(B,_t,D),Me=new _M(nt),Ye=new Vw(b,A,$,ht,_t,Rt,Me),Ae=new pE(b,nt),Oe=new Ww,gt=new $w(ht),st=new hM(b,A,$,et,de,v,h),Be=new tE(b,de,_t),W=new mE(B,Dt,_t,et),He=new pM(B,ht,Dt),pt=new wM(B,ht,Dt),Dt.programs=Ye.programs,b.capabilities=_t,b.extensions=ht,b.properties=nt,b.renderLists=Oe,b.shadowMap=Be,b.state=et,b.info=Dt}Ie();const oe=new hE(b,B);this.xr=oe,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){const R=ht.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=ht.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return me},this.setPixelRatio=function(R){R!==void 0&&(me=R,this.setSize(pe,ee,!1))},this.getSize=function(R){return R.set(pe,ee)},this.setSize=function(R,q,te=!0){if(oe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}pe=R,ee=q,t.width=Math.floor(R*me),t.height=Math.floor(q*me),te===!0&&(t.style.width=R+"px",t.style.height=q+"px"),this.setViewport(0,0,R,q)},this.getDrawingBufferSize=function(R){return R.set(pe*me,ee*me).floor()},this.setDrawingBufferSize=function(R,q,te){pe=R,ee=q,me=te,t.width=Math.floor(R*te),t.height=Math.floor(q*te),this.setViewport(0,0,R,q)},this.getCurrentViewport=function(R){return R.copy(w)},this.getViewport=function(R){return R.copy(ae)},this.setViewport=function(R,q,te,ne){R.isVector4?ae.set(R.x,R.y,R.z,R.w):ae.set(R,q,te,ne),et.viewport(w.copy(ae).multiplyScalar(me).round())},this.getScissor=function(R){return R.copy(F)},this.setScissor=function(R,q,te,ne){R.isVector4?F.set(R.x,R.y,R.z,R.w):F.set(R,q,te,ne),et.scissor(L.copy(F).multiplyScalar(me).round())},this.getScissorTest=function(){return se},this.setScissorTest=function(R){et.setScissorTest(se=R)},this.setOpaqueSort=function(R){z=R},this.setTransparentSort=function(R){ue=R},this.getClearColor=function(R){return R.copy(st.getClearColor())},this.setClearColor=function(){st.setClearColor.apply(st,arguments)},this.getClearAlpha=function(){return st.getClearAlpha()},this.setClearAlpha=function(){st.setClearAlpha.apply(st,arguments)},this.clear=function(R=!0,q=!0,te=!0){let ne=0;if(R){let X=!1;if(U!==null){const Ee=U.texture.format;X=Ee===pf||Ee===ff||Ee===hf}if(X){const Ee=U.texture.type,Ne=Ee===cr||Ee===xs||Ee===La||Ee===Eo||Ee===cf||Ee===uf,Te=st.getClearColor(),Xe=st.getClearAlpha(),Ze=Te.r,tt=Te.g,je=Te.b;Ne?(S[0]=Ze,S[1]=tt,S[2]=je,S[3]=Xe,B.clearBufferuiv(B.COLOR,0,S)):(M[0]=Ze,M[1]=tt,M[2]=je,M[3]=Xe,B.clearBufferiv(B.COLOR,0,M))}else ne|=B.COLOR_BUFFER_BIT}q&&(ne|=B.DEPTH_BUFFER_BIT,B.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),te&&(ne|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B.clear(ne)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",fe,!1),t.removeEventListener("webglcontextrestored",Ce,!1),t.removeEventListener("webglcontextcreationerror",Ue,!1),Oe.dispose(),gt.dispose(),nt.dispose(),A.dispose(),$.dispose(),de.dispose(),Rt.dispose(),W.dispose(),Ye.dispose(),oe.dispose(),oe.removeEventListener("sessionstart",ur),oe.removeEventListener("sessionend",Es),Kn.stop()};function fe(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),P=!0}function Ce(){console.log("THREE.WebGLRenderer: Context Restored."),P=!1;const R=Dt.autoReset,q=Be.enabled,te=Be.autoUpdate,ne=Be.needsUpdate,X=Be.type;Ie(),Dt.autoReset=R,Be.enabled=q,Be.autoUpdate=te,Be.needsUpdate=ne,Be.type=X}function Ue(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function mt(R){const q=R.target;q.removeEventListener("dispose",mt),Wt(q)}function Wt(R){yn(R),nt.remove(R)}function yn(R){const q=nt.get(R).programs;q!==void 0&&(q.forEach(function(te){Ye.releaseProgram(te)}),R.isShaderMaterial&&Ye.releaseShaderCache(R))}this.renderBufferDirect=function(R,q,te,ne,X,Ee){q===null&&(q=rt);const Ne=X.isMesh&&X.matrixWorld.determinant()<0,Te=Vi(R,q,te,ne,X);et.setMaterial(ne,Ne);let Xe=te.index,Ze=1;if(ne.wireframe===!0){if(Xe=ve.getWireframeAttribute(te),Xe===void 0)return;Ze=2}const tt=te.drawRange,je=te.attributes.position;let Et=tt.start*Ze,It=(tt.start+tt.count)*Ze;Ee!==null&&(Et=Math.max(Et,Ee.start*Ze),It=Math.min(It,(Ee.start+Ee.count)*Ze)),Xe!==null?(Et=Math.max(Et,0),It=Math.min(It,Xe.count)):je!=null&&(Et=Math.max(Et,0),It=Math.min(It,je.count));const Ut=It-Et;if(Ut<0||Ut===1/0)return;Rt.setup(X,ne,Te,te,Xe);let Ht,St=He;if(Xe!==null&&(Ht=he.get(Xe),St=pt,St.setIndex(Ht)),X.isMesh)ne.wireframe===!0?(et.setLineWidth(ne.wireframeLinewidth*ft()),St.setMode(B.LINES)):St.setMode(B.TRIANGLES);else if(X.isLine){let ze=ne.linewidth;ze===void 0&&(ze=1),et.setLineWidth(ze*ft()),X.isLineSegments?St.setMode(B.LINES):X.isLineLoop?St.setMode(B.LINE_LOOP):St.setMode(B.LINE_STRIP)}else X.isPoints?St.setMode(B.POINTS):X.isSprite&&St.setMode(B.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)St.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(ht.get("WEBGL_multi_draw"))St.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const ze=X._multiDrawStarts,Zt=X._multiDrawCounts,Mt=X._multiDrawCount,Yn=Xe?he.get(Xe).bytesPerElement:1,fi=nt.get(ne).currentProgram.getUniforms();for(let on=0;on<Mt;on++)fi.setValue(B,"_gl_DrawID",on),St.render(ze[on]/Yn,Zt[on])}else if(X.isInstancedMesh)St.renderInstances(Et,Ut,X.count);else if(te.isInstancedBufferGeometry){const ze=te._maxInstanceCount!==void 0?te._maxInstanceCount:1/0,Zt=Math.min(te.instanceCount,ze);St.renderInstances(Et,Ut,Zt)}else St.render(Et,Ut)};function vt(R,q,te){R.transparent===!0&&R.side===Ti&&R.forceSinglePass===!1?(R.side=Fn,R.needsUpdate=!0,bs(R,q,te),R.side=Gr,R.needsUpdate=!0,bs(R,q,te),R.side=Ti):bs(R,q,te)}this.compile=function(R,q,te=null){te===null&&(te=R),x=gt.get(te),x.init(q),C.push(x),te.traverseVisible(function(X){X.isLight&&X.layers.test(q.layers)&&(x.pushLight(X),X.castShadow&&x.pushShadow(X))}),R!==te&&R.traverseVisible(function(X){X.isLight&&X.layers.test(q.layers)&&(x.pushLight(X),X.castShadow&&x.pushShadow(X))}),x.setupLights();const ne=new Set;return R.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const Ee=X.material;if(Ee)if(Array.isArray(Ee))for(let Ne=0;Ne<Ee.length;Ne++){const Te=Ee[Ne];vt(Te,te,X),ne.add(Te)}else vt(Ee,te,X),ne.add(Ee)}),C.pop(),x=null,ne},this.compileAsync=function(R,q,te=null){const ne=this.compile(R,q,te);return new Promise(X=>{function Ee(){if(ne.forEach(function(Ne){nt.get(Ne).currentProgram.isReady()&&ne.delete(Ne)}),ne.size===0){X(R);return}setTimeout(Ee,10)}ht.get("KHR_parallel_shader_compile")!==null?Ee():setTimeout(Ee,10)})};let sn=null;function ri(R){sn&&sn(R)}function ur(){Kn.stop()}function Es(){Kn.start()}const Kn=new J_;Kn.setAnimationLoop(ri),typeof self<"u"&&Kn.setContext(self),this.setAnimationLoop=function(R){sn=R,oe.setAnimationLoop(R),R===null?Kn.stop():Kn.start()},oe.addEventListener("sessionstart",ur),oe.addEventListener("sessionend",Es),this.render=function(R,q){if(q!==void 0&&q.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),q.parent===null&&q.matrixWorldAutoUpdate===!0&&q.updateMatrixWorld(),oe.enabled===!0&&oe.isPresenting===!0&&(oe.cameraAutoUpdate===!0&&oe.updateCamera(q),q=oe.getCamera()),R.isScene===!0&&R.onBeforeRender(b,R,q,U),x=gt.get(R,C.length),x.init(q),C.push(x),Se.multiplyMatrices(q.projectionMatrix,q.matrixWorldInverse),Fe.setFromProjectionMatrix(Se),ce=this.localClippingEnabled,Z=Me.init(this.clippingPlanes,ce),E=Oe.get(R,y.length),E.init(),y.push(E),oe.enabled===!0&&oe.isPresenting===!0){const Ee=b.xr.getDepthSensingMesh();Ee!==null&&Io(Ee,q,-1/0,b.sortObjects)}Io(R,q,0,b.sortObjects),E.finish(),b.sortObjects===!0&&E.sort(z,ue),yt=oe.enabled===!1||oe.isPresenting===!1||oe.hasDepthSensing()===!1,yt&&st.addToRenderList(E,R),this.info.render.frame++,Z===!0&&Me.beginShadows();const te=x.state.shadowsArray;Be.render(te,R,q),Z===!0&&Me.endShadows(),this.info.autoReset===!0&&this.info.reset();const ne=E.opaque,X=E.transmissive;if(x.setupLights(),q.isArrayCamera){const Ee=q.cameras;if(X.length>0)for(let Ne=0,Te=Ee.length;Ne<Te;Ne++){const Xe=Ee[Ne];Xr(ne,X,R,Xe)}yt&&st.render(R);for(let Ne=0,Te=Ee.length;Ne<Te;Ne++){const Xe=Ee[Ne];dr(E,R,Xe,Xe.viewport)}}else X.length>0&&Xr(ne,X,R,q),yt&&st.render(R),dr(E,R,q);U!==null&&(D.updateMultisampleRenderTarget(U),D.updateRenderTargetMipmap(U)),R.isScene===!0&&R.onAfterRender(b,R,q),Rt.resetDefaultState(),V=-1,le=null,C.pop(),C.length>0?(x=C[C.length-1],Z===!0&&Me.setGlobalState(b.clippingPlanes,x.state.camera)):x=null,y.pop(),y.length>0?E=y[y.length-1]:E=null};function Io(R,q,te,ne){if(R.visible===!1)return;if(R.layers.test(q.layers)){if(R.isGroup)te=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(q);else if(R.isLight)x.pushLight(R),R.castShadow&&x.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||Fe.intersectsSprite(R)){ne&&De.setFromMatrixPosition(R.matrixWorld).applyMatrix4(Se);const Ne=de.update(R),Te=R.material;Te.visible&&E.push(R,Ne,Te,te,De.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||Fe.intersectsObject(R))){const Ne=de.update(R),Te=R.material;if(ne&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),De.copy(R.boundingSphere.center)):(Ne.boundingSphere===null&&Ne.computeBoundingSphere(),De.copy(Ne.boundingSphere.center)),De.applyMatrix4(R.matrixWorld).applyMatrix4(Se)),Array.isArray(Te)){const Xe=Ne.groups;for(let Ze=0,tt=Xe.length;Ze<tt;Ze++){const je=Xe[Ze],Et=Te[je.materialIndex];Et&&Et.visible&&E.push(R,Ne,Et,te,De.z,je)}}else Te.visible&&E.push(R,Ne,Te,te,De.z,null)}}const Ee=R.children;for(let Ne=0,Te=Ee.length;Ne<Te;Ne++)Io(Ee[Ne],q,te,ne)}function dr(R,q,te,ne){const X=R.opaque,Ee=R.transmissive,Ne=R.transparent;x.setupLightsView(te),Z===!0&&Me.setGlobalState(b.clippingPlanes,te),ne&&et.viewport(w.copy(ne)),X.length>0&&zi(X,q,te),Ee.length>0&&zi(Ee,q,te),Ne.length>0&&zi(Ne,q,te),et.buffers.depth.setTest(!0),et.buffers.depth.setMask(!0),et.buffers.color.setMask(!0),et.setPolygonOffset(!1)}function Xr(R,q,te,ne){if((te.isScene===!0?te.overrideMaterial:null)!==null)return;x.state.transmissionRenderTarget[ne.id]===void 0&&(x.state.transmissionRenderTarget[ne.id]=new Ri(1,1,{generateMipmaps:!0,type:ht.has("EXT_color_buffer_half_float")||ht.has("EXT_color_buffer_float")?ar:cr,minFilter:gs,samples:4,stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Tt.workingColorSpace}));const Ee=x.state.transmissionRenderTarget[ne.id],Ne=ne.viewport||w;Ee.setSize(Ne.z,Ne.w);const Te=b.getRenderTarget();b.setRenderTarget(Ee),b.getClearColor(J),re=b.getClearAlpha(),re<1&&b.setClearColor(16777215,.5),b.clear(),yt&&st.render(te);const Xe=b.toneMapping;b.toneMapping=Hr;const Ze=ne.viewport;if(ne.viewport!==void 0&&(ne.viewport=void 0),x.setupLightsView(ne),Z===!0&&Me.setGlobalState(b.clippingPlanes,ne),zi(R,te,ne),D.updateMultisampleRenderTarget(Ee),D.updateRenderTargetMipmap(Ee),ht.has("WEBGL_multisampled_render_to_texture")===!1){let tt=!1;for(let je=0,Et=q.length;je<Et;je++){const It=q[je],Ut=It.object,Ht=It.geometry,St=It.material,ze=It.group;if(St.side===Ti&&Ut.layers.test(ne.layers)){const Zt=St.side;St.side=Fn,St.needsUpdate=!0,Ts(Ut,te,ne,Ht,St,ze),St.side=Zt,St.needsUpdate=!0,tt=!0}}tt===!0&&(D.updateMultisampleRenderTarget(Ee),D.updateRenderTargetMipmap(Ee))}b.setRenderTarget(Te),b.setClearColor(J,re),Ze!==void 0&&(ne.viewport=Ze),b.toneMapping=Xe}function zi(R,q,te){const ne=q.isScene===!0?q.overrideMaterial:null;for(let X=0,Ee=R.length;X<Ee;X++){const Ne=R[X],Te=Ne.object,Xe=Ne.geometry,Ze=ne===null?Ne.material:ne,tt=Ne.group;Te.layers.test(te.layers)&&Ts(Te,q,te,Xe,Ze,tt)}}function Ts(R,q,te,ne,X,Ee){R.onBeforeRender(b,q,te,ne,X,Ee),R.modelViewMatrix.multiplyMatrices(te.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),X.onBeforeRender(b,q,te,ne,R,Ee),X.transparent===!0&&X.side===Ti&&X.forceSinglePass===!1?(X.side=Fn,X.needsUpdate=!0,b.renderBufferDirect(te,q,ne,X,R,Ee),X.side=Gr,X.needsUpdate=!0,b.renderBufferDirect(te,q,ne,X,R,Ee),X.side=Ti):b.renderBufferDirect(te,q,ne,X,R,Ee),R.onAfterRender(b,q,te,ne,X,Ee)}function bs(R,q,te){q.isScene!==!0&&(q=rt);const ne=nt.get(R),X=x.state.lights,Ee=x.state.shadowsArray,Ne=X.state.version,Te=Ye.getParameters(R,X.state,Ee,q,te),Xe=Ye.getProgramCacheKey(Te);let Ze=ne.programs;ne.environment=R.isMeshStandardMaterial?q.environment:null,ne.fog=q.fog,ne.envMap=(R.isMeshStandardMaterial?$:A).get(R.envMap||ne.environment),ne.envMapRotation=ne.environment!==null&&R.envMap===null?q.environmentRotation:R.envMapRotation,Ze===void 0&&(R.addEventListener("dispose",mt),Ze=new Map,ne.programs=Ze);let tt=Ze.get(Xe);if(tt!==void 0){if(ne.currentProgram===tt&&ne.lightsStateVersion===Ne)return Oa(R,Te),tt}else Te.uniforms=Ye.getUniforms(R),R.onBeforeCompile(Te,b),tt=Ye.acquireProgram(Te,Xe),Ze.set(Xe,tt),ne.uniforms=Te.uniforms;const je=ne.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(je.clippingPlanes=Me.uniform),Oa(R,Te),ne.needsLights=za(R),ne.lightsStateVersion=Ne,ne.needsLights&&(je.ambientLightColor.value=X.state.ambient,je.lightProbe.value=X.state.probe,je.directionalLights.value=X.state.directional,je.directionalLightShadows.value=X.state.directionalShadow,je.spotLights.value=X.state.spot,je.spotLightShadows.value=X.state.spotShadow,je.rectAreaLights.value=X.state.rectArea,je.ltc_1.value=X.state.rectAreaLTC1,je.ltc_2.value=X.state.rectAreaLTC2,je.pointLights.value=X.state.point,je.pointLightShadows.value=X.state.pointShadow,je.hemisphereLights.value=X.state.hemi,je.directionalShadowMap.value=X.state.directionalShadowMap,je.directionalShadowMatrix.value=X.state.directionalShadowMatrix,je.spotShadowMap.value=X.state.spotShadowMap,je.spotLightMatrix.value=X.state.spotLightMatrix,je.spotLightMap.value=X.state.spotLightMap,je.pointShadowMap.value=X.state.pointShadowMap,je.pointShadowMatrix.value=X.state.pointShadowMatrix),ne.currentProgram=tt,ne.uniformsList=null,tt}function Fa(R){if(R.uniformsList===null){const q=R.currentProgram.getUniforms();R.uniformsList=bc.seqWithValue(q.seq,R.uniforms)}return R.uniformsList}function Oa(R,q){const te=nt.get(R);te.outputColorSpace=q.outputColorSpace,te.batching=q.batching,te.batchingColor=q.batchingColor,te.instancing=q.instancing,te.instancingColor=q.instancingColor,te.instancingMorph=q.instancingMorph,te.skinning=q.skinning,te.morphTargets=q.morphTargets,te.morphNormals=q.morphNormals,te.morphColors=q.morphColors,te.morphTargetsCount=q.morphTargetsCount,te.numClippingPlanes=q.numClippingPlanes,te.numIntersection=q.numClipIntersection,te.vertexAlphas=q.vertexAlphas,te.vertexTangents=q.vertexTangents,te.toneMapping=q.toneMapping}function Vi(R,q,te,ne,X){q.isScene!==!0&&(q=rt),D.resetTextureUnits();const Ee=q.fog,Ne=ne.isMeshStandardMaterial?q.environment:null,Te=U===null?b.outputColorSpace:U.isXRRenderTarget===!0?U.texture.colorSpace:Wr,Xe=(ne.isMeshStandardMaterial?$:A).get(ne.envMap||Ne),Ze=ne.vertexColors===!0&&!!te.attributes.color&&te.attributes.color.itemSize===4,tt=!!te.attributes.tangent&&(!!ne.normalMap||ne.anisotropy>0),je=!!te.morphAttributes.position,Et=!!te.morphAttributes.normal,It=!!te.morphAttributes.color;let Ut=Hr;ne.toneMapped&&(U===null||U.isXRRenderTarget===!0)&&(Ut=b.toneMapping);const Ht=te.morphAttributes.position||te.morphAttributes.normal||te.morphAttributes.color,St=Ht!==void 0?Ht.length:0,ze=nt.get(ne),Zt=x.state.lights;if(Z===!0&&(ce===!0||R!==le)){const Mn=R===le&&ne.id===V;Me.setState(ne,R,Mn)}let Mt=!1;ne.version===ze.__version?(ze.needsLights&&ze.lightsStateVersion!==Zt.state.version||ze.outputColorSpace!==Te||X.isBatchedMesh&&ze.batching===!1||!X.isBatchedMesh&&ze.batching===!0||X.isBatchedMesh&&ze.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&ze.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&ze.instancing===!1||!X.isInstancedMesh&&ze.instancing===!0||X.isSkinnedMesh&&ze.skinning===!1||!X.isSkinnedMesh&&ze.skinning===!0||X.isInstancedMesh&&ze.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&ze.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&ze.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&ze.instancingMorph===!1&&X.morphTexture!==null||ze.envMap!==Xe||ne.fog===!0&&ze.fog!==Ee||ze.numClippingPlanes!==void 0&&(ze.numClippingPlanes!==Me.numPlanes||ze.numIntersection!==Me.numIntersection)||ze.vertexAlphas!==Ze||ze.vertexTangents!==tt||ze.morphTargets!==je||ze.morphNormals!==Et||ze.morphColors!==It||ze.toneMapping!==Ut||ze.morphTargetsCount!==St)&&(Mt=!0):(Mt=!0,ze.__version=ne.version);let Yn=ze.currentProgram;Mt===!0&&(Yn=bs(ne,q,X));let fi=!1,on=!1,Hi=!1;const Ft=Yn.getUniforms(),Pi=ze.uniforms;if(et.useProgram(Yn.program)&&(fi=!0,on=!0,Hi=!0),ne.id!==V&&(V=ne.id,on=!0),fi||le!==R){_t.reverseDepthBuffer?(xe.copy(R.projectionMatrix),ox(xe),ax(xe),Ft.setValue(B,"projectionMatrix",xe)):Ft.setValue(B,"projectionMatrix",R.projectionMatrix),Ft.setValue(B,"viewMatrix",R.matrixWorldInverse);const Mn=Ft.map.cameraPosition;Mn!==void 0&&Mn.setValue(B,Le.setFromMatrixPosition(R.matrixWorld)),_t.logarithmicDepthBuffer&&Ft.setValue(B,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(ne.isMeshPhongMaterial||ne.isMeshToonMaterial||ne.isMeshLambertMaterial||ne.isMeshBasicMaterial||ne.isMeshStandardMaterial||ne.isShaderMaterial)&&Ft.setValue(B,"isOrthographic",R.isOrthographicCamera===!0),le!==R&&(le=R,on=!0,Hi=!0)}if(X.isSkinnedMesh){Ft.setOptional(B,X,"bindMatrix"),Ft.setOptional(B,X,"bindMatrixInverse");const Mn=X.skeleton;Mn&&(Mn.boneTexture===null&&Mn.computeBoneTexture(),Ft.setValue(B,"boneTexture",Mn.boneTexture,D))}X.isBatchedMesh&&(Ft.setOptional(B,X,"batchingTexture"),Ft.setValue(B,"batchingTexture",X._matricesTexture,D),Ft.setOptional(B,X,"batchingIdTexture"),Ft.setValue(B,"batchingIdTexture",X._indirectTexture,D),Ft.setOptional(B,X,"batchingColorTexture"),X._colorsTexture!==null&&Ft.setValue(B,"batchingColorTexture",X._colorsTexture,D));const No=te.morphAttributes;if((No.position!==void 0||No.normal!==void 0||No.color!==void 0)&&it.update(X,te,Yn),(on||ze.receiveShadow!==X.receiveShadow)&&(ze.receiveShadow=X.receiveShadow,Ft.setValue(B,"receiveShadow",X.receiveShadow)),ne.isMeshGouraudMaterial&&ne.envMap!==null&&(Pi.envMap.value=Xe,Pi.flipEnvMap.value=Xe.isCubeTexture&&Xe.isRenderTargetTexture===!1?-1:1),ne.isMeshStandardMaterial&&ne.envMap===null&&q.environment!==null&&(Pi.envMapIntensity.value=q.environmentIntensity),on&&(Ft.setValue(B,"toneMappingExposure",b.toneMappingExposure),ze.needsLights&&Ba(Pi,Hi),Ee&&ne.fog===!0&&Ae.refreshFogUniforms(Pi,Ee),Ae.refreshMaterialUniforms(Pi,ne,me,ee,x.state.transmissionRenderTarget[R.id]),bc.upload(B,Fa(ze),Pi,D)),ne.isShaderMaterial&&ne.uniformsNeedUpdate===!0&&(bc.upload(B,Fa(ze),Pi,D),ne.uniformsNeedUpdate=!1),ne.isSpriteMaterial&&Ft.setValue(B,"center",X.center),Ft.setValue(B,"modelViewMatrix",X.modelViewMatrix),Ft.setValue(B,"normalMatrix",X.normalMatrix),Ft.setValue(B,"modelMatrix",X.matrixWorld),ne.isShaderMaterial||ne.isRawShaderMaterial){const Mn=ne.uniformsGroups;for(let As=0,Uo=Mn.length;As<Uo;As++){const hr=Mn[As];W.update(hr,Yn),W.bind(hr,Yn)}}return Yn}function Ba(R,q){R.ambientLightColor.needsUpdate=q,R.lightProbe.needsUpdate=q,R.directionalLights.needsUpdate=q,R.directionalLightShadows.needsUpdate=q,R.pointLights.needsUpdate=q,R.pointLightShadows.needsUpdate=q,R.spotLights.needsUpdate=q,R.spotLightShadows.needsUpdate=q,R.rectAreaLights.needsUpdate=q,R.hemisphereLights.needsUpdate=q}function za(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return U},this.setRenderTargetTextures=function(R,q,te){nt.get(R.texture).__webglTexture=q,nt.get(R.depthTexture).__webglTexture=te;const ne=nt.get(R);ne.__hasExternalTextures=!0,ne.__autoAllocateDepthBuffer=te===void 0,ne.__autoAllocateDepthBuffer||ht.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ne.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(R,q){const te=nt.get(R);te.__webglFramebuffer=q,te.__useDefaultFramebuffer=q===void 0},this.setRenderTarget=function(R,q=0,te=0){U=R,G=q,k=te;let ne=!0,X=null,Ee=!1,Ne=!1;if(R){const Xe=nt.get(R);if(Xe.__useDefaultFramebuffer!==void 0)et.bindFramebuffer(B.FRAMEBUFFER,null),ne=!1;else if(Xe.__webglFramebuffer===void 0)D.setupRenderTarget(R);else if(Xe.__hasExternalTextures)D.rebindTextures(R,nt.get(R.texture).__webglTexture,nt.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const je=R.depthTexture;if(Xe.__boundDepthTexture!==je){if(je!==null&&nt.has(je)&&(R.width!==je.image.width||R.height!==je.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");D.setupDepthRenderbuffer(R)}}const Ze=R.texture;(Ze.isData3DTexture||Ze.isDataArrayTexture||Ze.isCompressedArrayTexture)&&(Ne=!0);const tt=nt.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(tt[q])?X=tt[q][te]:X=tt[q],Ee=!0):R.samples>0&&D.useMultisampledRTT(R)===!1?X=nt.get(R).__webglMultisampledFramebuffer:Array.isArray(tt)?X=tt[te]:X=tt,w.copy(R.viewport),L.copy(R.scissor),Q=R.scissorTest}else w.copy(ae).multiplyScalar(me).floor(),L.copy(F).multiplyScalar(me).floor(),Q=se;if(et.bindFramebuffer(B.FRAMEBUFFER,X)&&ne&&et.drawBuffers(R,X),et.viewport(w),et.scissor(L),et.setScissorTest(Q),Ee){const Xe=nt.get(R.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+q,Xe.__webglTexture,te)}else if(Ne){const Xe=nt.get(R.texture),Ze=q||0;B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,Xe.__webglTexture,te||0,Ze)}V=-1},this.readRenderTargetPixels=function(R,q,te,ne,X,Ee,Ne){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=nt.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ne!==void 0&&(Te=Te[Ne]),Te){et.bindFramebuffer(B.FRAMEBUFFER,Te);try{const Xe=R.texture,Ze=Xe.format,tt=Xe.type;if(!_t.textureFormatReadable(Ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!_t.textureTypeReadable(tt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}q>=0&&q<=R.width-ne&&te>=0&&te<=R.height-X&&B.readPixels(q,te,ne,X,at.convert(Ze),at.convert(tt),Ee)}finally{const Xe=U!==null?nt.get(U).__webglFramebuffer:null;et.bindFramebuffer(B.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(R,q,te,ne,X,Ee,Ne){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=nt.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ne!==void 0&&(Te=Te[Ne]),Te){const Xe=R.texture,Ze=Xe.format,tt=Xe.type;if(!_t.textureFormatReadable(Ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!_t.textureTypeReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(q>=0&&q<=R.width-ne&&te>=0&&te<=R.height-X){et.bindFramebuffer(B.FRAMEBUFFER,Te);const je=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,je),B.bufferData(B.PIXEL_PACK_BUFFER,Ee.byteLength,B.STREAM_READ),B.readPixels(q,te,ne,X,at.convert(Ze),at.convert(tt),0);const Et=U!==null?nt.get(U).__webglFramebuffer:null;et.bindFramebuffer(B.FRAMEBUFFER,Et);const It=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await sx(B,It,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,je),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,Ee),B.deleteBuffer(je),B.deleteSync(It),Ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(R,q=null,te=0){R.isTexture!==!0&&(Tc("WebGLRenderer: copyFramebufferToTexture function signature has changed."),q=arguments[0]||null,R=arguments[1]);const ne=Math.pow(2,-te),X=Math.floor(R.image.width*ne),Ee=Math.floor(R.image.height*ne),Ne=q!==null?q.x:0,Te=q!==null?q.y:0;D.setTexture2D(R,0),B.copyTexSubImage2D(B.TEXTURE_2D,te,0,0,Ne,Te,X,Ee),et.unbindTexture()},this.copyTextureToTexture=function(R,q,te=null,ne=null,X=0){R.isTexture!==!0&&(Tc("WebGLRenderer: copyTextureToTexture function signature has changed."),ne=arguments[0]||null,R=arguments[1],q=arguments[2],X=arguments[3]||0,te=null);let Ee,Ne,Te,Xe,Ze,tt;te!==null?(Ee=te.max.x-te.min.x,Ne=te.max.y-te.min.y,Te=te.min.x,Xe=te.min.y):(Ee=R.image.width,Ne=R.image.height,Te=0,Xe=0),ne!==null?(Ze=ne.x,tt=ne.y):(Ze=0,tt=0);const je=at.convert(q.format),Et=at.convert(q.type);D.setTexture2D(q,0),B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,q.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,q.unpackAlignment);const It=B.getParameter(B.UNPACK_ROW_LENGTH),Ut=B.getParameter(B.UNPACK_IMAGE_HEIGHT),Ht=B.getParameter(B.UNPACK_SKIP_PIXELS),St=B.getParameter(B.UNPACK_SKIP_ROWS),ze=B.getParameter(B.UNPACK_SKIP_IMAGES),Zt=R.isCompressedTexture?R.mipmaps[X]:R.image;B.pixelStorei(B.UNPACK_ROW_LENGTH,Zt.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Zt.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Te),B.pixelStorei(B.UNPACK_SKIP_ROWS,Xe),R.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,X,Ze,tt,Ee,Ne,je,Et,Zt.data):R.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,X,Ze,tt,Zt.width,Zt.height,je,Zt.data):B.texSubImage2D(B.TEXTURE_2D,X,Ze,tt,Ee,Ne,je,Et,Zt),B.pixelStorei(B.UNPACK_ROW_LENGTH,It),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Ut),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Ht),B.pixelStorei(B.UNPACK_SKIP_ROWS,St),B.pixelStorei(B.UNPACK_SKIP_IMAGES,ze),X===0&&q.generateMipmaps&&B.generateMipmap(B.TEXTURE_2D),et.unbindTexture()},this.copyTextureToTexture3D=function(R,q,te=null,ne=null,X=0){R.isTexture!==!0&&(Tc("WebGLRenderer: copyTextureToTexture3D function signature has changed."),te=arguments[0]||null,ne=arguments[1]||null,R=arguments[2],q=arguments[3],X=arguments[4]||0);let Ee,Ne,Te,Xe,Ze,tt,je,Et,It;const Ut=R.isCompressedTexture?R.mipmaps[X]:R.image;te!==null?(Ee=te.max.x-te.min.x,Ne=te.max.y-te.min.y,Te=te.max.z-te.min.z,Xe=te.min.x,Ze=te.min.y,tt=te.min.z):(Ee=Ut.width,Ne=Ut.height,Te=Ut.depth,Xe=0,Ze=0,tt=0),ne!==null?(je=ne.x,Et=ne.y,It=ne.z):(je=0,Et=0,It=0);const Ht=at.convert(q.format),St=at.convert(q.type);let ze;if(q.isData3DTexture)D.setTexture3D(q,0),ze=B.TEXTURE_3D;else if(q.isDataArrayTexture||q.isCompressedArrayTexture)D.setTexture2DArray(q,0),ze=B.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,q.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,q.unpackAlignment);const Zt=B.getParameter(B.UNPACK_ROW_LENGTH),Mt=B.getParameter(B.UNPACK_IMAGE_HEIGHT),Yn=B.getParameter(B.UNPACK_SKIP_PIXELS),fi=B.getParameter(B.UNPACK_SKIP_ROWS),on=B.getParameter(B.UNPACK_SKIP_IMAGES);B.pixelStorei(B.UNPACK_ROW_LENGTH,Ut.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Ut.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Xe),B.pixelStorei(B.UNPACK_SKIP_ROWS,Ze),B.pixelStorei(B.UNPACK_SKIP_IMAGES,tt),R.isDataTexture||R.isData3DTexture?B.texSubImage3D(ze,X,je,Et,It,Ee,Ne,Te,Ht,St,Ut.data):q.isCompressedArrayTexture?B.compressedTexSubImage3D(ze,X,je,Et,It,Ee,Ne,Te,Ht,Ut.data):B.texSubImage3D(ze,X,je,Et,It,Ee,Ne,Te,Ht,St,Ut),B.pixelStorei(B.UNPACK_ROW_LENGTH,Zt),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Mt),B.pixelStorei(B.UNPACK_SKIP_PIXELS,Yn),B.pixelStorei(B.UNPACK_SKIP_ROWS,fi),B.pixelStorei(B.UNPACK_SKIP_IMAGES,on),X===0&&q.generateMipmaps&&B.generateMipmap(ze),et.unbindTexture()},this.initRenderTarget=function(R){nt.get(R).__webglFramebuffer===void 0&&D.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?D.setTextureCube(R,0):R.isData3DTexture?D.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?D.setTexture2DArray(R,0):D.setTexture2D(R,0),et.unbindTexture()},this.resetState=function(){G=0,k=0,U=null,et.reset(),Rt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ir}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===mf?"display-p3":"srgb",t.unpackColorSpace=Tt.workingColorSpace===Bc?"display-p3":"srgb"}}class Sf{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new $e(e),this.near=t,this.far=i}clone(){return new Sf(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class rg extends kt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Oi,this.environmentIntensity=1,this.environmentRotation=new Oi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class gE{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Yh,this.updateRanges=[],this.version=0,this.uuid=lr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let o=0,l=this.stride;o<l;o++)this.array[e+o]=t.array[i+o];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=lr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=lr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Un=new I;class Nc{constructor(e,t,i,o=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=o}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Un.fromBufferAttribute(this,t),Un.applyMatrix4(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Un.fromBufferAttribute(this,t),Un.applyNormalMatrix(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Un.fromBufferAttribute(this,t),Un.transformDirection(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Ai(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Lt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=Lt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ai(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ai(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ai(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ai(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,o){return e=e*this.data.stride+this.offset,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),o=Lt(o,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=o,this}setXYZW(e,t,i,o,l){return e=e*this.data.stride+this.offset,this.normalized&&(t=Lt(t,this.array),i=Lt(i,this.array),o=Lt(o,this.array),l=Lt(l,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=o,this.data.array[e+3]=l,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const o=i*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[o+l])}return new jn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Nc(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const o=i*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[o+l])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class sg extends qr{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new $e(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let uo;const ya=new I,ho=new I,fo=new I,po=new Pe,xa=new Pe,og=new At,cc=new I,Sa=new I,uc=new I,Z0=new Pe,th=new Pe,e_=new Pe;class vE extends kt{constructor(e=new sg){if(super(),this.isSprite=!0,this.type="Sprite",uo===void 0){uo=new Jt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new gE(t,5);uo.setIndex([0,1,2,0,2,3]),uo.setAttribute("position",new Nc(i,3,0,!1)),uo.setAttribute("uv",new Nc(i,2,3,!1))}this.geometry=uo,this.material=e,this.center=new Pe(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ho.setFromMatrixScale(this.matrixWorld),og.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),fo.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ho.multiplyScalar(-fo.z);const i=this.material.rotation;let o,l;i!==0&&(l=Math.cos(i),o=Math.sin(i));const c=this.center;dc(cc.set(-.5,-.5,0),fo,c,ho,o,l),dc(Sa.set(.5,-.5,0),fo,c,ho,o,l),dc(uc.set(.5,.5,0),fo,c,ho,o,l),Z0.set(0,0),th.set(1,0),e_.set(1,1);let d=e.ray.intersectTriangle(cc,Sa,uc,!1,ya);if(d===null&&(dc(Sa.set(-.5,.5,0),fo,c,ho,o,l),th.set(0,1),d=e.ray.intersectTriangle(cc,uc,Sa,!1,ya),d===null))return;const h=e.ray.origin.distanceTo(ya);h<e.near||h>e.far||t.push({distance:h,point:ya.clone(),uv:hi.getInterpolation(ya,cc,Sa,uc,Z0,th,e_,new Pe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function dc(s,e,t,i,o,l){po.subVectors(s,t).addScalar(.5).multiply(i),o!==void 0?(xa.x=l*po.x-o*po.y,xa.y=o*po.x+l*po.y):xa.copy(po),s.copy(e),s.x+=xa.x,s.y+=xa.y,s.applyMatrix4(og)}class yE extends Dn{constructor(e=null,t=1,i=1,o,l,c,d,h,p=Xn,m=Xn,_,v){super(null,c,d,h,p,m,o,l,_,v),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Jh extends jn{constructor(e,t,i,o=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=o}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const mo=new At,t_=new At,hc=[],n_=new Ss,xE=new At,Ma=new be,wa=new Ms;class Vr extends be{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Jh(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let o=0;o<i;o++)this.setMatrixAt(o,xE)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ss),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,mo),n_.copy(e.boundingBox).applyMatrix4(mo),this.boundingBox.union(n_)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ms),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,mo),wa.copy(e.boundingSphere).applyMatrix4(mo),this.boundingSphere.union(wa)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,o=this.morphTexture.source.data.data,l=i.length+1,c=e*l+1;for(let d=0;d<i.length;d++)i[d]=o[c+d]}raycast(e,t){const i=this.matrixWorld,o=this.count;if(Ma.geometry=this.geometry,Ma.material=this.material,Ma.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),wa.copy(this.boundingSphere),wa.applyMatrix4(i),e.ray.intersectsSphere(wa)!==!1))for(let l=0;l<o;l++){this.getMatrixAt(l,mo),t_.multiplyMatrices(i,mo),Ma.matrixWorld=t_,Ma.raycast(e,hc);for(let c=0,d=hc.length;c<d;c++){const h=hc[c];h.instanceId=l,h.object=this,t.push(h)}hc.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Jh(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,o=i.length+1;this.morphTexture===null&&(this.morphTexture=new yE(new Float32Array(o*this.count),o,this.count,df,ki));const l=this.morphTexture.source.data.data;let c=0;for(let p=0;p<i.length;p++)c+=i[p];const d=this.geometry.morphTargetsRelative?1:1-c,h=o*e;l[h]=d,l.set(i,h+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Mf extends qr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new $e(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Uc=new I,kc=new I,i_=new At,Ea=new zc,fc=new Ms,nh=new I,r_=new I;class ag extends kt{constructor(e=new Jt,t=new Mf){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let o=1,l=t.count;o<l;o++)Uc.fromBufferAttribute(t,o-1),kc.fromBufferAttribute(t,o),i[o]=i[o-1],i[o]+=Uc.distanceTo(kc);e.setAttribute("lineDistance",new Ct(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,o=this.matrixWorld,l=e.params.Line.threshold,c=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),fc.copy(i.boundingSphere),fc.applyMatrix4(o),fc.radius+=l,e.ray.intersectsSphere(fc)===!1)return;i_.copy(o).invert(),Ea.copy(e.ray).applyMatrix4(i_);const d=l/((this.scale.x+this.scale.y+this.scale.z)/3),h=d*d,p=this.isLineSegments?2:1,m=i.index,v=i.attributes.position;if(m!==null){const S=Math.max(0,c.start),M=Math.min(m.count,c.start+c.count);for(let E=S,x=M-1;E<x;E+=p){const y=m.getX(E),C=m.getX(E+1),b=pc(this,e,Ea,h,y,C);b&&t.push(b)}if(this.isLineLoop){const E=m.getX(M-1),x=m.getX(S),y=pc(this,e,Ea,h,E,x);y&&t.push(y)}}else{const S=Math.max(0,c.start),M=Math.min(v.count,c.start+c.count);for(let E=S,x=M-1;E<x;E+=p){const y=pc(this,e,Ea,h,E,E+1);y&&t.push(y)}if(this.isLineLoop){const E=pc(this,e,Ea,h,M-1,S);E&&t.push(E)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const o=t[i[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=o.length;l<c;l++){const d=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}}function pc(s,e,t,i,o,l){const c=s.geometry.attributes.position;if(Uc.fromBufferAttribute(c,o),kc.fromBufferAttribute(c,l),t.distanceSqToSegment(Uc,kc,nh,r_)>i)return;nh.applyMatrix4(s.matrixWorld);const h=e.ray.origin.distanceTo(nh);if(!(h<e.near||h>e.far))return{distance:h,point:r_.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}const s_=new I,o_=new I;class SE extends ag{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let o=0,l=t.count;o<l;o+=2)s_.fromBufferAttribute(t,o),o_.fromBufferAttribute(t,o+1),i[o]=o===0?0:i[o-1],i[o+1]=i[o]+s_.distanceTo(o_);e.setAttribute("lineDistance",new Ct(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class lg extends qr{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new $e(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const a_=new At,Zh=new zc,mc=new Ms,_c=new I;class ME extends kt{constructor(e=new Jt,t=new lg){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,o=this.matrixWorld,l=e.params.Points.threshold,c=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),mc.copy(i.boundingSphere),mc.applyMatrix4(o),mc.radius+=l,e.ray.intersectsSphere(mc)===!1)return;a_.copy(o).invert(),Zh.copy(e.ray).applyMatrix4(a_);const d=l/((this.scale.x+this.scale.y+this.scale.z)/3),h=d*d,p=i.index,_=i.attributes.position;if(p!==null){const v=Math.max(0,c.start),S=Math.min(p.count,c.start+c.count);for(let M=v,E=S;M<E;M++){const x=p.getX(M);_c.fromBufferAttribute(_,x),l_(_c,x,h,o,e,t,this)}}else{const v=Math.max(0,c.start),S=Math.min(_.count,c.start+c.count);for(let M=v,E=S;M<E;M++)_c.fromBufferAttribute(_,M),l_(_c,M,h,o,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const o=t[i[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=o.length;l<c;l++){const d=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}}function l_(s,e,t,i,o,l,c){const d=Zh.distanceSqToPoint(s);if(d<t){const h=new I;Zh.closestPointToPoint(s,h),h.applyMatrix4(i);const p=o.ray.origin.distanceTo(h);if(p<o.near||p>o.far)return;l.push({distance:p,distanceToRay:Math.sqrt(d),point:h,index:e,face:null,faceIndex:null,barycoord:null,object:c})}}class cg extends Dn{constructor(e,t,i,o,l,c,d,h,p){super(e,t,i,o,l,c,d,h,p),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Bi{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,o=this.getPoint(0),l=0;t.push(0);for(let c=1;c<=e;c++)i=this.getPoint(c/e),l+=i.distanceTo(o),t.push(l),o=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let o=0;const l=i.length;let c;t?c=t:c=e*i[l-1];let d=0,h=l-1,p;for(;d<=h;)if(o=Math.floor(d+(h-d)/2),p=i[o]-c,p<0)d=o+1;else if(p>0)h=o-1;else{h=o;break}if(o=h,i[o]===c)return o/(l-1);const m=i[o],v=i[o+1]-m,S=(c-m)/v;return(o+S)/(l-1)}getTangent(e,t){let o=e-1e-4,l=e+1e-4;o<0&&(o=0),l>1&&(l=1);const c=this.getPoint(o),d=this.getPoint(l),h=t||(c.isVector2?new Pe:new I);return h.copy(d).sub(c).normalize(),h}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new I,o=[],l=[],c=[],d=new I,h=new At;for(let S=0;S<=e;S++){const M=S/e;o[S]=this.getTangentAt(M,new I)}l[0]=new I,c[0]=new I;let p=Number.MAX_VALUE;const m=Math.abs(o[0].x),_=Math.abs(o[0].y),v=Math.abs(o[0].z);m<=p&&(p=m,i.set(1,0,0)),_<=p&&(p=_,i.set(0,1,0)),v<=p&&i.set(0,0,1),d.crossVectors(o[0],i).normalize(),l[0].crossVectors(o[0],d),c[0].crossVectors(o[0],l[0]);for(let S=1;S<=e;S++){if(l[S]=l[S-1].clone(),c[S]=c[S-1].clone(),d.crossVectors(o[S-1],o[S]),d.length()>Number.EPSILON){d.normalize();const M=Math.acos(mn(o[S-1].dot(o[S]),-1,1));l[S].applyMatrix4(h.makeRotationAxis(d,M))}c[S].crossVectors(o[S],l[S])}if(t===!0){let S=Math.acos(mn(l[0].dot(l[e]),-1,1));S/=e,o[0].dot(d.crossVectors(l[0],l[e]))>0&&(S=-S);for(let M=1;M<=e;M++)l[M].applyMatrix4(h.makeRotationAxis(o[M],S*M)),c[M].crossVectors(o[M],l[M])}return{tangents:o,normals:l,binormals:c}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class ug extends Bi{constructor(e=0,t=0,i=1,o=1,l=0,c=Math.PI*2,d=!1,h=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=o,this.aStartAngle=l,this.aEndAngle=c,this.aClockwise=d,this.aRotation=h}getPoint(e,t=new Pe){const i=t,o=Math.PI*2;let l=this.aEndAngle-this.aStartAngle;const c=Math.abs(l)<Number.EPSILON;for(;l<0;)l+=o;for(;l>o;)l-=o;l<Number.EPSILON&&(c?l=0:l=o),this.aClockwise===!0&&!c&&(l===o?l=-o:l=l-o);const d=this.aStartAngle+e*l;let h=this.aX+this.xRadius*Math.cos(d),p=this.aY+this.yRadius*Math.sin(d);if(this.aRotation!==0){const m=Math.cos(this.aRotation),_=Math.sin(this.aRotation),v=h-this.aX,S=p-this.aY;h=v*m-S*_+this.aX,p=v*_+S*m+this.aY}return i.set(h,p)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class wE extends ug{constructor(e,t,i,o,l,c){super(e,t,i,i,o,l,c),this.isArcCurve=!0,this.type="ArcCurve"}}function wf(){let s=0,e=0,t=0,i=0;function o(l,c,d,h){s=l,e=d,t=-3*l+3*c-2*d-h,i=2*l-2*c+d+h}return{initCatmullRom:function(l,c,d,h,p){o(c,d,p*(d-l),p*(h-c))},initNonuniformCatmullRom:function(l,c,d,h,p,m,_){let v=(c-l)/p-(d-l)/(p+m)+(d-c)/m,S=(d-c)/m-(h-c)/(m+_)+(h-d)/_;v*=m,S*=m,o(c,d,v,S)},calc:function(l){const c=l*l,d=c*l;return s+e*l+t*c+i*d}}}const gc=new I,ih=new wf,rh=new wf,sh=new wf;class Na extends Bi{constructor(e=[],t=!1,i="centripetal",o=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=o}getPoint(e,t=new I){const i=t,o=this.points,l=o.length,c=(l-(this.closed?0:1))*e;let d=Math.floor(c),h=c-d;this.closed?d+=d>0?0:(Math.floor(Math.abs(d)/l)+1)*l:h===0&&d===l-1&&(d=l-2,h=1);let p,m;this.closed||d>0?p=o[(d-1)%l]:(gc.subVectors(o[0],o[1]).add(o[0]),p=gc);const _=o[d%l],v=o[(d+1)%l];if(this.closed||d+2<l?m=o[(d+2)%l]:(gc.subVectors(o[l-1],o[l-2]).add(o[l-1]),m=gc),this.curveType==="centripetal"||this.curveType==="chordal"){const S=this.curveType==="chordal"?.5:.25;let M=Math.pow(p.distanceToSquared(_),S),E=Math.pow(_.distanceToSquared(v),S),x=Math.pow(v.distanceToSquared(m),S);E<1e-4&&(E=1),M<1e-4&&(M=E),x<1e-4&&(x=E),ih.initNonuniformCatmullRom(p.x,_.x,v.x,m.x,M,E,x),rh.initNonuniformCatmullRom(p.y,_.y,v.y,m.y,M,E,x),sh.initNonuniformCatmullRom(p.z,_.z,v.z,m.z,M,E,x)}else this.curveType==="catmullrom"&&(ih.initCatmullRom(p.x,_.x,v.x,m.x,this.tension),rh.initCatmullRom(p.y,_.y,v.y,m.y,this.tension),sh.initCatmullRom(p.z,_.z,v.z,m.z,this.tension));return i.set(ih.calc(h),rh.calc(h),sh.calc(h)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const o=e.points[t];this.points.push(o.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const o=this.points[t];e.points.push(o.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const o=e.points[t];this.points.push(new I().fromArray(o))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function c_(s,e,t,i,o){const l=(i-e)*.5,c=(o-t)*.5,d=s*s,h=s*d;return(2*t-2*i+l+c)*h+(-3*t+3*i-2*l-c)*d+l*s+t}function EE(s,e){const t=1-s;return t*t*e}function TE(s,e){return 2*(1-s)*s*e}function bE(s,e){return s*s*e}function Ra(s,e,t,i){return EE(s,e)+TE(s,t)+bE(s,i)}function AE(s,e){const t=1-s;return t*t*t*e}function CE(s,e){const t=1-s;return 3*t*t*s*e}function RE(s,e){return 3*(1-s)*s*s*e}function PE(s,e){return s*s*s*e}function Pa(s,e,t,i,o){return AE(s,e)+CE(s,t)+RE(s,i)+PE(s,o)}class LE extends Bi{constructor(e=new Pe,t=new Pe,i=new Pe,o=new Pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=o}getPoint(e,t=new Pe){const i=t,o=this.v0,l=this.v1,c=this.v2,d=this.v3;return i.set(Pa(e,o.x,l.x,c.x,d.x),Pa(e,o.y,l.y,c.y,d.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class DE extends Bi{constructor(e=new I,t=new I,i=new I,o=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=o}getPoint(e,t=new I){const i=t,o=this.v0,l=this.v1,c=this.v2,d=this.v3;return i.set(Pa(e,o.x,l.x,c.x,d.x),Pa(e,o.y,l.y,c.y,d.y),Pa(e,o.z,l.z,c.z,d.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class IE extends Bi{constructor(e=new Pe,t=new Pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Pe){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class NE extends Bi{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class UE extends Bi{constructor(e=new Pe,t=new Pe,i=new Pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Pe){const i=t,o=this.v0,l=this.v1,c=this.v2;return i.set(Ra(e,o.x,l.x,c.x),Ra(e,o.y,l.y,c.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class dg extends Bi{constructor(e=new I,t=new I,i=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new I){const i=t,o=this.v0,l=this.v1,c=this.v2;return i.set(Ra(e,o.x,l.x,c.x),Ra(e,o.y,l.y,c.y),Ra(e,o.z,l.z,c.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class kE extends Bi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Pe){const i=t,o=this.points,l=(o.length-1)*e,c=Math.floor(l),d=l-c,h=o[c===0?c:c-1],p=o[c],m=o[c>o.length-2?o.length-1:c+1],_=o[c>o.length-3?o.length-1:c+2];return i.set(c_(d,h.x,p.x,m.x,_.x),c_(d,h.y,p.y,m.y,_.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const o=e.points[t];this.points.push(o.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const o=this.points[t];e.points.push(o.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const o=e.points[t];this.points.push(new Pe().fromArray(o))}return this}}var FE=Object.freeze({__proto__:null,ArcCurve:wE,CatmullRomCurve3:Na,CubicBezierCurve:LE,CubicBezierCurve3:DE,EllipseCurve:ug,LineCurve:IE,LineCurve3:NE,QuadraticBezierCurve:UE,QuadraticBezierCurve3:dg,SplineCurve:kE});class Ef extends Jt{constructor(e=1,t=32,i=0,o=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:o},t=Math.max(3,t);const l=[],c=[],d=[],h=[],p=new I,m=new Pe;c.push(0,0,0),d.push(0,0,1),h.push(.5,.5);for(let _=0,v=3;_<=t;_++,v+=3){const S=i+_/t*o;p.x=e*Math.cos(S),p.y=e*Math.sin(S),c.push(p.x,p.y,p.z),d.push(0,0,1),m.x=(c[v]/e+1)/2,m.y=(c[v+1]/e+1)/2,h.push(m.x,m.y)}for(let _=1;_<=t;_++)l.push(_,_+1,0);this.setIndex(l),this.setAttribute("position",new Ct(c,3)),this.setAttribute("normal",new Ct(d,3)),this.setAttribute("uv",new Ct(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ef(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Qt extends Jt{constructor(e=1,t=1,i=1,o=32,l=1,c=!1,d=0,h=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:o,heightSegments:l,openEnded:c,thetaStart:d,thetaLength:h};const p=this;o=Math.floor(o),l=Math.floor(l);const m=[],_=[],v=[],S=[];let M=0;const E=[],x=i/2;let y=0;C(),c===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(m),this.setAttribute("position",new Ct(_,3)),this.setAttribute("normal",new Ct(v,3)),this.setAttribute("uv",new Ct(S,2));function C(){const P=new I,G=new I;let k=0;const U=(t-e)/i;for(let V=0;V<=l;V++){const le=[],w=V/l,L=w*(t-e)+e;for(let Q=0;Q<=o;Q++){const J=Q/o,re=J*h+d,pe=Math.sin(re),ee=Math.cos(re);G.x=L*pe,G.y=-w*i+x,G.z=L*ee,_.push(G.x,G.y,G.z),P.set(pe,U,ee).normalize(),v.push(P.x,P.y,P.z),S.push(J,1-w),le.push(M++)}E.push(le)}for(let V=0;V<o;V++)for(let le=0;le<l;le++){const w=E[le][V],L=E[le+1][V],Q=E[le+1][V+1],J=E[le][V+1];e>0&&(m.push(w,L,J),k+=3),t>0&&(m.push(L,Q,J),k+=3)}p.addGroup(y,k,0),y+=k}function b(P){const G=M,k=new Pe,U=new I;let V=0;const le=P===!0?e:t,w=P===!0?1:-1;for(let Q=1;Q<=o;Q++)_.push(0,x*w,0),v.push(0,w,0),S.push(.5,.5),M++;const L=M;for(let Q=0;Q<=o;Q++){const re=Q/o*h+d,pe=Math.cos(re),ee=Math.sin(re);U.x=le*ee,U.y=x*w,U.z=le*pe,_.push(U.x,U.y,U.z),v.push(0,w,0),k.x=pe*.5+.5,k.y=ee*.5*w+.5,S.push(k.x,k.y),M++}for(let Q=0;Q<o;Q++){const J=G+Q,re=L+Q;P===!0?m.push(re,re+1,J):m.push(re+1,re,J),V+=3}p.addGroup(y,V,P===!0?1:2),y+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Hc extends Qt{constructor(e=1,t=1,i=32,o=1,l=!1,c=0,d=Math.PI*2){super(0,e,t,i,o,l,c,d),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:o,openEnded:l,thetaStart:c,thetaLength:d}}static fromJSON(e){return new Hc(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Tf extends Jt{constructor(e=[],t=[],i=1,o=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:o};const l=[],c=[];d(o),p(i),m(),this.setAttribute("position",new Ct(l,3)),this.setAttribute("normal",new Ct(l.slice(),3)),this.setAttribute("uv",new Ct(c,2)),o===0?this.computeVertexNormals():this.normalizeNormals();function d(C){const b=new I,P=new I,G=new I;for(let k=0;k<t.length;k+=3)S(t[k+0],b),S(t[k+1],P),S(t[k+2],G),h(b,P,G,C)}function h(C,b,P,G){const k=G+1,U=[];for(let V=0;V<=k;V++){U[V]=[];const le=C.clone().lerp(P,V/k),w=b.clone().lerp(P,V/k),L=k-V;for(let Q=0;Q<=L;Q++)Q===0&&V===k?U[V][Q]=le:U[V][Q]=le.clone().lerp(w,Q/L)}for(let V=0;V<k;V++)for(let le=0;le<2*(k-V)-1;le++){const w=Math.floor(le/2);le%2===0?(v(U[V][w+1]),v(U[V+1][w]),v(U[V][w])):(v(U[V][w+1]),v(U[V+1][w+1]),v(U[V+1][w]))}}function p(C){const b=new I;for(let P=0;P<l.length;P+=3)b.x=l[P+0],b.y=l[P+1],b.z=l[P+2],b.normalize().multiplyScalar(C),l[P+0]=b.x,l[P+1]=b.y,l[P+2]=b.z}function m(){const C=new I;for(let b=0;b<l.length;b+=3){C.x=l[b+0],C.y=l[b+1],C.z=l[b+2];const P=x(C)/2/Math.PI+.5,G=y(C)/Math.PI+.5;c.push(P,1-G)}M(),_()}function _(){for(let C=0;C<c.length;C+=6){const b=c[C+0],P=c[C+2],G=c[C+4],k=Math.max(b,P,G),U=Math.min(b,P,G);k>.9&&U<.1&&(b<.2&&(c[C+0]+=1),P<.2&&(c[C+2]+=1),G<.2&&(c[C+4]+=1))}}function v(C){l.push(C.x,C.y,C.z)}function S(C,b){const P=C*3;b.x=e[P+0],b.y=e[P+1],b.z=e[P+2]}function M(){const C=new I,b=new I,P=new I,G=new I,k=new Pe,U=new Pe,V=new Pe;for(let le=0,w=0;le<l.length;le+=9,w+=6){C.set(l[le+0],l[le+1],l[le+2]),b.set(l[le+3],l[le+4],l[le+5]),P.set(l[le+6],l[le+7],l[le+8]),k.set(c[w+0],c[w+1]),U.set(c[w+2],c[w+3]),V.set(c[w+4],c[w+5]),G.copy(C).add(b).add(P).divideScalar(3);const L=x(G);E(k,w+0,C,L),E(U,w+2,b,L),E(V,w+4,P,L)}}function E(C,b,P,G){G<0&&C.x===1&&(c[b]=C.x-1),P.x===0&&P.z===0&&(c[b]=G/2/Math.PI+.5)}function x(C){return Math.atan2(C.z,-C.x)}function y(C){return Math.atan2(-C.y,Math.sqrt(C.x*C.x+C.z*C.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Tf(e.vertices,e.indices,e.radius,e.details)}}class bf extends Tf{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,o=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],l=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(o,l,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new bf(e.radius,e.detail)}}class vs extends Jt{constructor(e=1,t=32,i=16,o=0,l=Math.PI*2,c=0,d=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:o,phiLength:l,thetaStart:c,thetaLength:d},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const h=Math.min(c+d,Math.PI);let p=0;const m=[],_=new I,v=new I,S=[],M=[],E=[],x=[];for(let y=0;y<=i;y++){const C=[],b=y/i;let P=0;y===0&&c===0?P=.5/t:y===i&&h===Math.PI&&(P=-.5/t);for(let G=0;G<=t;G++){const k=G/t;_.x=-e*Math.cos(o+k*l)*Math.sin(c+b*d),_.y=e*Math.cos(c+b*d),_.z=e*Math.sin(o+k*l)*Math.sin(c+b*d),M.push(_.x,_.y,_.z),v.copy(_).normalize(),E.push(v.x,v.y,v.z),x.push(k+P,1-b),C.push(p++)}m.push(C)}for(let y=0;y<i;y++)for(let C=0;C<t;C++){const b=m[y][C+1],P=m[y][C],G=m[y+1][C],k=m[y+1][C+1];(y!==0||c>0)&&S.push(b,P,k),(y!==i-1||h<Math.PI)&&S.push(P,G,k)}this.setIndex(S),this.setAttribute("position",new Ct(M,3)),this.setAttribute("normal",new Ct(E,3)),this.setAttribute("uv",new Ct(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vs(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class ka extends Jt{constructor(e=1,t=.4,i=12,o=48,l=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:o,arc:l},i=Math.floor(i),o=Math.floor(o);const c=[],d=[],h=[],p=[],m=new I,_=new I,v=new I;for(let S=0;S<=i;S++)for(let M=0;M<=o;M++){const E=M/o*l,x=S/i*Math.PI*2;_.x=(e+t*Math.cos(x))*Math.cos(E),_.y=(e+t*Math.cos(x))*Math.sin(E),_.z=t*Math.sin(x),d.push(_.x,_.y,_.z),m.x=e*Math.cos(E),m.y=e*Math.sin(E),v.subVectors(_,m).normalize(),h.push(v.x,v.y,v.z),p.push(M/o),p.push(S/i)}for(let S=1;S<=i;S++)for(let M=1;M<=o;M++){const E=(o+1)*S+M-1,x=(o+1)*(S-1)+M-1,y=(o+1)*(S-1)+M,C=(o+1)*S+M;c.push(E,x,C),c.push(x,y,C)}this.setIndex(c),this.setAttribute("position",new Ct(d,3)),this.setAttribute("normal",new Ct(h,3)),this.setAttribute("uv",new Ct(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ka(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Ao extends Jt{constructor(e=new dg(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),t=64,i=1,o=8,l=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:o,closed:l};const c=e.computeFrenetFrames(t,l);this.tangents=c.tangents,this.normals=c.normals,this.binormals=c.binormals;const d=new I,h=new I,p=new Pe;let m=new I;const _=[],v=[],S=[],M=[];E(),this.setIndex(M),this.setAttribute("position",new Ct(_,3)),this.setAttribute("normal",new Ct(v,3)),this.setAttribute("uv",new Ct(S,2));function E(){for(let b=0;b<t;b++)x(b);x(l===!1?t:0),C(),y()}function x(b){m=e.getPointAt(b/t,m);const P=c.normals[b],G=c.binormals[b];for(let k=0;k<=o;k++){const U=k/o*Math.PI*2,V=Math.sin(U),le=-Math.cos(U);h.x=le*P.x+V*G.x,h.y=le*P.y+V*G.y,h.z=le*P.z+V*G.z,h.normalize(),v.push(h.x,h.y,h.z),d.x=m.x+i*h.x,d.y=m.y+i*h.y,d.z=m.z+i*h.z,_.push(d.x,d.y,d.z)}}function y(){for(let b=1;b<=t;b++)for(let P=1;P<=o;P++){const G=(o+1)*(b-1)+(P-1),k=(o+1)*b+(P-1),U=(o+1)*b+P,V=(o+1)*(b-1)+P;M.push(G,k,V),M.push(k,U,V)}}function C(){for(let b=0;b<=t;b++)for(let P=0;P<=o;P++)p.x=b/t,p.y=P/o,S.push(p.x,p.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Ao(new FE[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class OE extends Ln{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Ve extends qr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new $e(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $e(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=V_,this.normalScale=new Pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ac extends Ve{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Pe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return mn(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new $e(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new $e(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new $e(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Af extends kt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new $e(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const oh=new At,u_=new I,d_=new I;class hg{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Pe(512,512),this.map=null,this.mapPass=null,this.matrix=new At,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new vf,this._frameExtents=new Pe(1,1),this._viewportCount=1,this._viewports=[new Nt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;u_.setFromMatrixPosition(e.matrixWorld),t.position.copy(u_),d_.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(d_),t.updateMatrixWorld(),oh.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(oh),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(oh)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const h_=new At,Ta=new I,ah=new I;class BE extends hg{constructor(){super(new ii(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Pe(4,2),this._viewportCount=6,this._viewports=[new Nt(2,1,1,1),new Nt(0,1,1,1),new Nt(3,1,1,1),new Nt(1,1,1,1),new Nt(3,0,1,1),new Nt(1,0,1,1)],this._cubeDirections=[new I(1,0,0),new I(-1,0,0),new I(0,0,1),new I(0,0,-1),new I(0,1,0),new I(0,-1,0)],this._cubeUps=[new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,0,1),new I(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,o=this.matrix,l=e.distance||i.far;l!==i.far&&(i.far=l,i.updateProjectionMatrix()),Ta.setFromMatrixPosition(e.matrixWorld),i.position.copy(Ta),ah.copy(i.position),ah.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(ah),i.updateMatrixWorld(),o.makeTranslation(-Ta.x,-Ta.y,-Ta.z),h_.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(h_)}}class Co extends Af{constructor(e,t,i=0,o=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=o,this.shadow=new BE}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class zE extends hg{constructor(){super(new yf(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class lh extends Af{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(kt.DEFAULT_UP),this.updateMatrix(),this.target=new kt,this.shadow=new zE}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class VE extends Af{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class fg{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=f_(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=f_();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function f_(){return performance.now()}const p_=new At;class HE{constructor(e,t,i=0,o=1/0){this.ray=new zc(e,t),this.near=i,this.far=o,this.camera=null,this.layers=new gf,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return p_.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(p_),this}intersectObject(e,t=!0,i=[]){return ef(e,this,i,t),i.sort(m_),i}intersectObjects(e,t=!0,i=[]){for(let o=0,l=e.length;o<l;o++)ef(e[o],this,i,t);return i.sort(m_),i}}function m_(s,e){return s.distance-e.distance}function ef(s,e,t,i){let o=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(o=!1),o===!0&&i===!0){const l=s.children;for(let c=0,d=l.length;c<d;c++)ef(l[c],e,t,!0)}}class GE extends SE{constructor(e=10,t=10,i=4473924,o=8947848){i=new $e(i),o=new $e(o);const l=t/2,c=e/t,d=e/2,h=[],p=[];for(let v=0,S=0,M=-d;v<=t;v++,M+=c){h.push(-d,0,M,d,0,M),h.push(M,0,-d,M,0,d);const E=v===l?i:o;E.toArray(p,S),S+=3,E.toArray(p,S),S+=3,E.toArray(p,S),S+=3,E.toArray(p,S),S+=3}const m=new Jt;m.setAttribute("position",new Ct(h,3)),m.setAttribute("color",new Ct(p,3));const _=new Mf({vertexColors:!0,toneMapped:!1});super(m,_),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:of}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=of);const pg={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class Do{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const WE=new yf(-1,1,1,-1,0,1);class qE extends Jt{constructor(){super(),this.setAttribute("position",new Ct([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ct([0,2,0,0,2,0],2))}}const XE=new qE;class Cf{constructor(e){this._mesh=new be(XE,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,WE)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class jE extends Do{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof Ln?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Ia.clone(e.uniforms),this.material=new Ln({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new Cf(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class __ extends Do{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){const o=e.getContext(),l=e.state;l.buffers.color.setMask(!1),l.buffers.depth.setMask(!1),l.buffers.color.setLocked(!0),l.buffers.depth.setLocked(!0);let c,d;this.inverse?(c=0,d=1):(c=1,d=0),l.buffers.stencil.setTest(!0),l.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),l.buffers.stencil.setFunc(o.ALWAYS,c,4294967295),l.buffers.stencil.setClear(d),l.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),l.buffers.color.setLocked(!1),l.buffers.depth.setLocked(!1),l.buffers.color.setMask(!0),l.buffers.depth.setMask(!0),l.buffers.stencil.setLocked(!1),l.buffers.stencil.setFunc(o.EQUAL,1,4294967295),l.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),l.buffers.stencil.setLocked(!0)}}class KE extends Do{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class YE{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const i=e.getSize(new Pe);this._width=i.width,this._height=i.height,t=new Ri(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ar}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new jE(pg),this.copyPass.material.blending=or,this.clock=new fg}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let i=!1;for(let o=0,l=this.passes.length;o<l;o++){const c=this.passes[o];if(c.enabled!==!1){if(c.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),c.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),c.needsSwap){if(i){const d=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(d.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),h.setFunc(d.EQUAL,1,4294967295)}this.swapBuffers()}__!==void 0&&(c instanceof __?i=!0:c instanceof KE&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Pe);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const i=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(i,o),this.renderTarget2.setSize(i,o);for(let l=0;l<this.passes.length;l++)this.passes[l].setSize(i,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class $E extends Do{constructor(e,t,i=null,o=null,l=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=o,this.clearAlpha=l,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new $e}render(e,t,i){const o=e.autoClear;e.autoClear=!1;let l,c;this.overrideMaterial!==null&&(c=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(l=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(l),this.overrideMaterial!==null&&(this.scene.overrideMaterial=c),e.autoClear=o}}const QE={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new $e(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Ro extends Do{constructor(e,t,i,o){super(),this.strength=t!==void 0?t:1,this.radius=i,this.threshold=o,this.resolution=e!==void 0?new Pe(e.x,e.y):new Pe(256,256),this.clearColor=new $e(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let l=Math.round(this.resolution.x/2),c=Math.round(this.resolution.y/2);this.renderTargetBright=new Ri(l,c,{type:ar}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let _=0;_<this.nMips;_++){const v=new Ri(l,c,{type:ar});v.texture.name="UnrealBloomPass.h"+_,v.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(v);const S=new Ri(l,c,{type:ar});S.texture.name="UnrealBloomPass.v"+_,S.texture.generateMipmaps=!1,this.renderTargetsVertical.push(S),l=Math.round(l/2),c=Math.round(c/2)}const d=QE;this.highPassUniforms=Ia.clone(d.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ln({uniforms:this.highPassUniforms,vertexShader:d.vertexShader,fragmentShader:d.fragmentShader}),this.separableBlurMaterials=[];const h=[3,5,7,9,11];l=Math.round(this.resolution.x/2),c=Math.round(this.resolution.y/2);for(let _=0;_<this.nMips;_++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(h[_])),this.separableBlurMaterials[_].uniforms.invSize.value=new Pe(1/l,1/c),l=Math.round(l/2),c=Math.round(c/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const p=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=p,this.bloomTintColors=[new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const m=pg;this.copyUniforms=Ia.clone(m.uniforms),this.blendMaterial=new Ln({uniforms:this.copyUniforms,vertexShader:m.vertexShader,fragmentShader:m.fragmentShader,blending:Cc,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new $e,this.oldClearAlpha=1,this.basic=new rr,this.fsQuad=new Cf(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(i,o);for(let l=0;l<this.nMips;l++)this.renderTargetsHorizontal[l].setSize(i,o),this.renderTargetsVertical[l].setSize(i,o),this.separableBlurMaterials[l].uniforms.invSize.value=new Pe(1/i,1/o),i=Math.round(i/2),o=Math.round(o/2)}render(e,t,i,o,l){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const c=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),l&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=i.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let d=this.renderTargetBright;for(let h=0;h<this.nMips;h++)this.fsQuad.material=this.separableBlurMaterials[h],this.separableBlurMaterials[h].uniforms.colorTexture.value=d.texture,this.separableBlurMaterials[h].uniforms.direction.value=Ro.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[h]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[h].uniforms.colorTexture.value=this.renderTargetsHorizontal[h].texture,this.separableBlurMaterials[h].uniforms.direction.value=Ro.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[h]),e.clear(),this.fsQuad.render(e),d=this.renderTargetsVertical[h];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,l&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(i),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=c}getSeperableBlurMaterial(e){const t=[];for(let i=0;i<e;i++)t.push(.39894*Math.exp(-.5*i*i/(e*e))/e);return new Ln({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Pe(.5,.5)},direction:{value:new Pe(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(e){return new Ln({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}Ro.BlurDirectionX=new Pe(1,0);Ro.BlurDirectionY=new Pe(0,1);const JE={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class ZE extends Do{constructor(){super();const e=JE;this.uniforms=Ia.clone(e.uniforms),this.material=new OE({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new Cf(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Tt.getTransfer(this._outputColorSpace)===Bt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===b_?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===A_?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===C_?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===af?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===R_?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===P_&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class eT extends rg{constructor(){super();const e=new bt;e.deleteAttribute("uv");const t=new Ve({side:Fn}),i=new Ve,o=new Co(16777215,900,28,2);o.position.set(.418,16.199,.3),this.add(o);const l=new be(e,t);l.position.set(-.757,13.219,.717),l.scale.set(31.713,28.305,28.591),this.add(l);const c=new be(e,i);c.position.set(-10.906,2.009,1.846),c.rotation.set(0,-.195,0),c.scale.set(2.328,7.905,4.651),this.add(c);const d=new be(e,i);d.position.set(-5.607,-.754,-.758),d.rotation.set(0,.994,0),d.scale.set(1.97,1.534,3.955),this.add(d);const h=new be(e,i);h.position.set(6.167,.857,7.803),h.rotation.set(0,.561,0),h.scale.set(3.927,6.285,3.687),this.add(h);const p=new be(e,i);p.position.set(-2.017,.018,6.124),p.rotation.set(0,.333,0),p.scale.set(2.002,4.566,2.064),this.add(p);const m=new be(e,i);m.position.set(2.291,-.756,-2.621),m.rotation.set(0,-.286,0),m.scale.set(1.546,1.552,1.496),this.add(m);const _=new be(e,i);_.position.set(-2.193,-.369,-5.547),_.rotation.set(0,.516,0),_.scale.set(3.875,3.487,2.986),this.add(_);const v=new be(e,_o(50));v.position.set(-16.116,14.37,8.208),v.scale.set(.1,2.428,2.739),this.add(v);const S=new be(e,_o(50));S.position.set(-16.109,18.021,-8.207),S.scale.set(.1,2.425,2.751),this.add(S);const M=new be(e,_o(17));M.position.set(14.904,12.198,-1.832),M.scale.set(.15,4.265,6.331),this.add(M);const E=new be(e,_o(43));E.position.set(-.462,8.89,14.52),E.scale.set(4.38,5.441,.088),this.add(E);const x=new be(e,_o(20));x.position.set(3.235,11.486,-12.541),x.scale.set(2.5,2,.1),this.add(x);const y=new be(e,_o(100));y.position.set(0,20,0),y.scale.set(1,.1,1),this.add(y)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function _o(s){const e=new rr;return e.color.setScalar(s),e}function tT(s){const e=new _E({antialias:!0,powerPreference:"high-performance"}),t=Math.min(window.devicePixelRatio,1.75);e.setPixelRatio(t),e.setSize(s.clientWidth,s.clientHeight),e.toneMapping=af,e.toneMappingExposure=1.05,e.shadowMap.enabled=!0,e.shadowMap.type=E_,s.appendChild(e.domElement);const i=new rg;i.background=new $e(461328),i.fog=new Sf(461328,26,70);const o=new ii(55,s.clientWidth/s.clientHeight,.1,140);o.position.set(0,5.2,16),o.lookAt(0,1.2,0);const l=new $h(e),c=l.fromScene(new eT,.035).texture;i.environment=c,i.environmentIntensity=.55,l.dispose();const d=new VE(3818328,.55);i.add(d);const h=new lh(16054015,2.2);h.position.set(7,12,8),h.castShadow=!0,h.shadow.mapSize.set(1024,1024),h.shadow.camera.left=-14,h.shadow.camera.right=14,h.shadow.camera.top=14,h.shadow.camera.bottom=-14,h.shadow.camera.far=40,h.shadow.bias=-4e-4,i.add(h);const p=new lh(7321855,.5);p.position.set(-8,4,6),i.add(p);const m=new lh(16757626,.35);m.position.set(-4,6,-9),i.add(m);const _=new YE(e);_.setSize(s.clientWidth,s.clientHeight),_.addPass(new $E(i,o));const v=new Ro(new Pe(s.clientWidth*.5,s.clientHeight*.5),.28,.45,.85);_.addPass(v),_.addPass(new ZE);let S="high";function M(C){S=C,C==="high"?(e.setPixelRatio(t),v.enabled=!0,e.shadowMap.enabled=!0):C==="medium"?(e.setPixelRatio(1),v.enabled=!0,e.shadowMap.enabled=!1):(e.setPixelRatio(1),v.enabled=!1,e.shadowMap.enabled=!1),e.shadowMap.needsUpdate=!0}function E(C){_.render(C)}function x(){const C=s.clientWidth,b=s.clientHeight;e.setSize(C,b),_.setSize(C,b),v.resolution.set(Math.max(1,C*.5),Math.max(1,b*.5)),o.aspect=C/b,o.updateProjectionMatrix()}function y(){window.removeEventListener("resize",x),e.dispose(),c.dispose(),e.domElement.parentElement===s&&s.removeChild(e.domElement)}return window.addEventListener("resize",x),{renderer:e,scene:i,camera:o,composer:_,bloomPass:v,get quality(){return S},setQuality:M,render:E,resize:x,dispose:y}}function nT(s){let e=performance.now(),t=0,i=!1;return o=>{t++;const l=performance.now();if(l-e>=2e3){const c=t*1e3/(l-e);t=0,e=l,c<42&&(s.quality==="high"?s.setQuality("medium"):s.quality==="medium"&&!i?(i=!0,s.setQuality("low")):s.quality==="low"&&!i&&(i=!0))}}}class iT{constructor(e,t){this.camera=e,this.dom=t,t.addEventListener("pointerdown",o=>{if(o.button===0){if(this.pickHandler){const l=t.getBoundingClientRect(),c=(o.clientX-l.left)/l.width*2-1,d=-((o.clientY-l.top)/l.height*2-1);if(this.pickHandler(c,d)!==null)return}this.dragging=!0,this.lastX=o.clientX,this.lastY=o.clientY,t.setPointerCapture(o.pointerId)}}),t.addEventListener("pointermove",o=>{if(!this.dragging)return;const l=o.clientX-this.lastX,c=o.clientY-this.lastY;this.lastX=o.clientX,this.lastY=o.clientY,this.goalAzimuth-=l*.005,this.goalElevation=bd.clamp(this.goalElevation+c*.004,.08,1.35)});const i=()=>{this.dragging=!1};t.addEventListener("pointerup",i),t.addEventListener("pointercancel",i),t.addEventListener("wheel",o=>{o.preventDefault(),this.goalRadius=bd.clamp(this.goalRadius+o.deltaY*.02,4,40)},{passive:!1}),window.addEventListener("keydown",this.keyDown),window.addEventListener("keyup",this.keyUp)}target=new I(0,1,0);goalTarget=new I(0,1,0);radius=16;goalRadius=16;azimuth=Math.PI*.06;goalAzimuth=Math.PI*.06;elevation=.42;goalElevation=.42;pickHandler=null;dragging=!1;lastX=0;lastY=0;keys=new Set;keyDown=e=>{const t=e.key.toLowerCase();["w","a","s","d","q","e"].includes(t)&&this.keys.add(t)};keyUp=e=>this.keys.delete(e.key.toLowerCase());dispose(){window.removeEventListener("keydown",this.keyDown),window.removeEventListener("keyup",this.keyUp)}glideTo(e,t=10){this.goalTarget.copy(e),this.goalRadius=t}update(e){const t=6*e,i=new I(Math.sin(this.azimuth+Math.PI),0,Math.cos(this.azimuth+Math.PI)),o=new I(i.z,0,-i.x);this.keys.has("w")&&this.goalTarget.addScaledVector(i,t),this.keys.has("s")&&this.goalTarget.addScaledVector(i,-t),this.keys.has("a")&&this.goalTarget.addScaledVector(o,-t),this.keys.has("d")&&this.goalTarget.addScaledVector(o,t),this.keys.has("q")&&(this.goalTarget.y+=t*.7),this.keys.has("e")&&(this.goalTarget.y-=t*.7),this.goalTarget.y=bd.clamp(this.goalTarget.y,.3,10);const l=1-Math.exp(-4.2*e);this.target.lerp(this.goalTarget,l),this.radius+=(this.goalRadius-this.radius)*l,this.azimuth+=(this.goalAzimuth-this.azimuth)*l,this.elevation+=(this.goalElevation-this.elevation)*l;const c=new I(this.target.x+this.radius*Math.sin(this.azimuth)*Math.cos(this.elevation),this.target.y+this.radius*Math.sin(this.elevation),this.target.z+this.radius*Math.cos(this.azimuth)*Math.cos(this.elevation));this.camera.position.copy(c),this.camera.lookAt(this.target)}}class rT{constructor(e,t=14){this.scene=e,this.instancesPerPath=t}entries=[];dummy=new kt;pulseColor=new $e;baseColor=new $e;addPath(e){const t=new vs(.045,8,6),i=new rr({color:16777215}),o=new Vr(t,i,this.instancesPerPath);o.instanceColor=new Jh(new Float32Array(this.instancesPerPath*3),3),o.frustumCulled=!1;const l=new Float32Array(this.instancesPerPath);for(let d=0;d<this.instancesPerPath;d++)l[d]=d/this.instancesPerPath;this.scene.add(o);const c=`flow-${this.entries.length}`;return this.entries.push({path:e,mesh:o,params:l,activity:{speed:1,brightness:1}}),c}setActivity(e,t){this.entries[e]&&(this.entries[e].activity=t)}activityCount(){return this.entries.length}update(e,t=1){for(const i of this.entries){const{path:o,mesh:l,params:c,activity:d}=i,h=o.curve,p=d.speed*t*.22*e,m=Math.max(0,d.brightness);d.color?this.baseColor.copy(d.color):this.baseColor.copy(o.color);for(let _=0;_<c.length;_++){c[_]=(c[_]+p)%1;const v=h.getPointAt(Math.min(.999,c[_]));this.dummy.position.copy(v);const S=c[_],M=Math.min(1,Math.min(S,1-S)*6);this.pulseColor.copy(this.baseColor).multiplyScalar(m*M+.05),l.setColorAt(_,this.pulseColor),this.dummy.updateMatrix(),l.setMatrixAt(_,this.dummy.matrix)}l.instanceMatrix.needsUpdate=!0,l.instanceColor&&(l.instanceColor.needsUpdate=!0)}}dispose(){for(const e of this.entries)this.scene.remove(e.mesh),e.mesh.geometry.dispose(),e.mesh.material.dispose();this.entries=[]}}const fn={brushedGold:new Ve({color:14267210,metalness:1,roughness:.34}),goldPolished:new Ve({color:15780966,metalness:1,roughness:.12}),niobiumDark:new Ve({color:2304566,metalness:.85,roughness:.42}),stainless:new Ve({color:10134189,metalness:.9,roughness:.3}),copper:new Ve({color:12876349,metalness:1,roughness:.28}),aluminium:new Ve({color:12041671,metalness:.95,roughness:.22}),siliconDie:new Ve({color:1514795,metalness:.55,roughness:.28}),waferDark:new Ve({color:1053724,metalness:.92,roughness:.12}),polySilicon:new Ve({color:6187904,metalness:.35,roughness:.5}),diffusion:new Ve({color:7232078,metalness:.3,roughness:.55}),oxideGlass:new Ac({color:9417944,transparent:!0,opacity:.18,roughness:.05,metalness:0,transmission:.6}),nwell:new Ve({color:3042904,transparent:!0,opacity:.55,metalness:.2,roughness:.45}),psub:new Ve({color:3493998,transparent:!0,opacity:.5,metalness:.2,roughness:.5}),pcbGreen:new Ac({color:935460,metalness:.05,roughness:.55,transparent:!0,opacity:.94}),pcbBlack:new Ve({color:1053464,metalness:.1,roughness:.6}),substrate:new Ve({color:1251104,metalness:.4,roughness:.35}),plasticDark:new Ve({color:1843499,metalness:.35,roughness:.6}),floor:new Ve({color:724758,roughness:.85,metalness:.15}),glassShroud:new Ac({color:11195647,transparent:!0,opacity:.12,roughness:.03,metalness:0,transmission:.9,side:Ti}),dangerStripe:new Ve({color:14200865,metalness:.2,roughness:.6})};function pn(s,e={}){const t=e.fontSize??42,i=e.color??"#dbe6f5",o=e.background??"rgba(8, 12, 18, 0.72)",l=e.padding??14,c=e.scale??1,d=e.bold??!0,h=document.createElement("canvas"),p=h.getContext("2d"),m=`${d?"600 ":""}${t}px "Segoe UI", system-ui, sans-serif`;p.font=m;const _=p.measureText(s),v=Math.ceil(_.width+l*2),S=Math.ceil(t*1.35+l*2);if(h.width=v,h.height=S,p.font=m,o!=="none"){p.fillStyle=o;const C=12;p.beginPath(),p.moveTo(C,0),p.arcTo(v,0,v,S,C),p.arcTo(v,S,0,S,C),p.arcTo(0,S,0,0,C),p.arcTo(0,0,v,0,C),p.fill()}p.fillStyle=i,p.textAlign="center",p.textBaseline="middle",p.fillText(s,v/2,S/2);const M=new cg(h);M.colorSpace=wi,M.anisotropy=4;const E=new sg({map:M,transparent:!0,depthWrite:!1}),x=new vE(E),y=v/S;return x.scale.set(c*y/2,c/2,1),x.renderOrder=10,x}function sr(s=1.1,e=6476031){const t=new _n,i=new be(new Qt(.02,.032,s,10),new Ve({color:10134706,metalness:.9,roughness:.25}));i.position.y=s/2,i.castShadow=!0,t.add(i);const o=new be(new Hc(.032,.14,10),new Ve({color:15265527,metalness:.8,roughness:.2}));o.rotation.x=Math.PI,o.position.y=s+.07,t.add(o);const l=new be(new ka(.055,.016,8,16),new Ve({color:e,emissive:e,emissiveIntensity:1.6,metalness:.4,roughness:.4}));l.rotation.x=Math.PI/2,l.position.y=s*.82,t.add(l);const c=new be(new Qt(.11,.13,.07,14),new Ve({color:2106927,metalness:.6,roughness:.5}));return c.position.y=.035,t.add(c),t}const sT=`{
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
`,oT=`{
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
`,aT=`{
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
`,lT=`{
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
`,cT=`{
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
`,uT=`{
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
`,dT="01_fundamental_constants",hT="fundamental-physics",fT="verified_offline_standard",pT="CODATA 2022 recommended values of the fundamental physical constants (2022 adjustment). NIST SP 96b. Published 2024. DOI: 10.5281/zenodo.10767569",mT="https://physics.nist.gov/cuu/Constants/index.html",_T="public domain (NIST)",gT={elementary_charge:{symbol:"q_e",value:1602176634e-28,unit:"C",si_prefix:null,uncertainty:0,exact:!0,note:"Defined exactly since SI 2019 redefinition"},boltzmann_constant:{symbol:"k_B",value:1380649e-29,unit:"J/K",si_prefix:null,uncertainty:0,exact:!0,note:"Defined exactly since SI 2019 redefinition"},reduced_planck_constant:{symbol:"ħ",value:10545718176461565e-50,unit:"J·s",si_prefix:null,uncertainty:0,exact:!0,note:"Derived from exact h = 6.62607015e-34 J·s and exact π"},speed_of_light:{symbol:"c",value:299792458,unit:"m/s",si_prefix:null,uncertainty:0,exact:!0,note:"Defined exactly since SI 1983"},vacuum_permittivity:{symbol:"ε_0",value:88541878128e-22,unit:"F/m",si_prefix:null,uncertainty:13e-22,exact:!1,note:"Measured; related to μ_0 and c by ε_0 = 1/(μ_0·c²). Relative uncertainty 1.5e-10 since CODATA 2018"},vacuum_permeability:{symbol:"μ_0",value:125663706127e-17,unit:"N/A²",si_prefix:null,uncertainty:19e-20,exact:!1,note:"Relative uncertainty 1.5e-10 since CODATA 2018 (no longer exact since SI 2019)"},stefan_boltzmann_constant:{symbol:"σ_SB",value:5670374419e-17,unit:"W/(m²·K⁴)",si_prefix:null,uncertainty:0,exact:!0,note:"Derived exactly from σ_SB = π²·k_B⁴/(60·ħ³·c²)"},avogadro_constant:{symbol:"N_A",value:602214076e15,unit:"1/mol",si_prefix:null,uncertainty:0,exact:!0,note:"Defined exactly since SI 2019"}},vT={thermal_voltage_V_T_300K:{symbol:"V_T",value:.025852,unit:"V",equation:"V_T = k_B·T/q_e",conditions:{T:300,T_unit:"K"},note:"Thermal voltage at 300 K (≈26.85 mV)"},thermal_voltage_V_T_formula:{equation:"V_T(T) = k_B·T/q_e",unit:"V",note:"Use for any temperature; at 27 °C (300.15 K) V_T ≈ 25.89 mV"}},yT={note:"Fundamental constants are universal; no operating envelope restriction applies"},xT={},ST=["V_T(T) = k_B·T/q_e","σ_SB = π²·k_B⁴/(60·ħ³·c²)","ε_0 = 1/(μ_0·c²)"],MT={id:dT,domain:hT,provenance_status:fT,source_citation:pT,source_url:mT,license_or_access:_T,parameters:gT,derived:vT,valid_operating_envelope:yT,failure_thresholds:xT,equations:ST},wT="02_semiconductor_pdk_silicon",ET="semiconductor-pdk-and-materials",TT="verified_offline_standard",bT="SKY130A PDK (SkyWater Technology, pinned open_pdks commit 0c1f82326278a0871f0a1fc4bdacf94c88e78e4d); FreePDK45 (NCSU/OSU, North Carolina State University); ASAP7 PDK (Arizona State University); material properties from CRC Handbook of Chemistry and Physics, 103rd ed. and Ioffe Institute semiconductor database",AT="https://github.com/google/skywater-pdk, https://www.skywatertechnology.com/sky130/, https://www.asap.asu.edu/asap7, https://ptm.asu.edu/",CT="Apache-2.0 (SKY130); free academic (FreePDK45); free academic (ASAP7); public CRC/Ioffe data",RT={sky130a:{pdk_name:"SKY130A",foundry:"SkyWater Technology Foundry",technology_node:"130 nm",pinned_open_pdks_commit:"0c1f82326278a0871f0a1fc4bdacf94c88e78e4d",pinned_skywater_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436",nominal_vdd_v:1.8,core_soa_max_vgs_v:1.95,core_soa_note:"Strict 1.95 V core safe-operating-area ceiling for SKY130 core devices (li1 to met5)",metal_stack:{li1:{thickness_nm:250,sheet_resistance_ohm_per_sq:.955,material:"silicided local interconnect"},met1:{thickness_nm:570,sheet_resistance_ohm_per_sq:.125,material:"aluminium (Al) with TiN barrier"},met2:{thickness_nm:845,sheet_resistance_ohm_per_sq:.075,material:"aluminium"},met3:{thickness_nm:1035,sheet_resistance_ohm_per_sq:.055,material:"aluminium"},met4:{thickness_nm:2260,sheet_resistance_ohm_per_sq:.027,material:"aluminium"},met5:{thickness_nm:3390,sheet_resistance_ohm_per_sq:.018,material:"aluminium"}},oxide_thickness_nm:{gate_oxide:4.1,field_oxide:420},gate_pitch_nm:480,vth_nmos_typ_v:.55,vth_pmos_typ_v:-.55,ox_breakdown_field_mv_per_cm:1e3,ox_breakdown_note:"SiO2 intrinsic breakdown ~10 MV/cm; SKY130 practical TDDB-limited operating ceiling set by foundry spec to 1.95 V for core devices"},freepdk45:{pdk_name:"FreePDK45",foundry:"North Carolina State University (virtual/academic)",technology_node:"45 nm planar",nominal_vdd_v:1,gate_pitch_nm:90,ox_breakdown_field_mv_per_cm:1e3,note:"Virtual PDK for academic research; no fabricated silicon. Published nominal VDD = 1.0 V"},asap7:{pdk_name:"ASAP7",foundry:"Arizona State University (virtual/academic)",technology_node:"7 nm FinFET",nominal_vdd_v:.7,gate_pitch_nm:54,fin_height_nm:42,fin_pitch_nm:27,ox_breakdown_field_mv_per_cm:1e3,note:"Virtual predictive PDK from ASU; no fabricated silicon. Published nominal VDD = 0.7 V"}},PT={silicon:{resistivity_ohm_cm_at_300K_doped_1e15:2.3,tcr_per_k:.002,thermal_conductivity_w_per_m_k:148,thermal_conductivity_note:"at 300 K; decreases with T approximately as T^(-1.5) above 100 K",specific_heat_j_per_kg_k:700,density_kg_per_m3:2329,melting_point_c:1414,bandgap_ev_at_300K:1.12},silicon_dioxide:{thermal_conductivity_w_per_m_k:1.4,specific_heat_j_per_kg_k:740,density_kg_per_m3:2220,melting_point_c:1710,dielectric_constant:3.9,breakdown_field_mv_per_cm:1e4},copper:{resistivity_ohm_m_at_300K:168e-10,tcr_per_k:.0039,thermal_conductivity_w_per_m_k:401,specific_heat_j_per_kg_k:385,density_kg_per_m3:8960,melting_point_c:1085,fusing_note:"Joule fusing depends on geometry and pulse duration — use Onderdonk or Preece equations for specific traces"},aluminium:{resistivity_ohm_m_at_300K:265e-10,tcr_per_k:.0043,thermal_conductivity_w_per_m_k:237,specific_heat_j_per_kg_k:900,density_kg_per_m3:2700,melting_point_c:660,electromigration_note:"SKY130 metal is Al with TiN barrier; Black's equation applies for EM lifetime"},gold:{resistivity_ohm_m_at_300K:244e-10,tcr_per_k:.0034,thermal_conductivity_w_per_m_k:318,specific_heat_j_per_kg_k:129,density_kg_per_m3:19300,melting_point_c:1064},niobium:{resistivity_ohm_m_at_300K:15e-8,tcr_per_k:.0026,thermal_conductivity_w_per_m_k:53,specific_heat_j_per_kg_k:265,density_kg_per_m3:8570,melting_point_c:2477,superconducting_transition_k:9.3,note:"Type-II superconductor; used in superconducting quantum circuits"},fr4_pcb:{thermal_conductivity_w_per_m_k:.3,specific_heat_j_per_kg_k:600,density_kg_per_m3:1900,glass_transition_c:130,delamination_c:260,note:"FR-4 standard PCB substrate; Tg ~130 °C, delamination threshold ~260 °C (reflow peak)"}},LT=["Black's equation (electromigration MTTF): MTTF = A · J^(-n) · exp(E_a / (k_B·T)), n ≈ 2 for Al interconnects, E_a ≈ 0.7 eV","Onderdonk fusing equation: I_fuse = S · sqrt(T_melt − T_ambient / (t · ρ_0 · α)) — approximate for short pulses","Joule heating: P = I²·R(T), R(T) = R_0·(1 + α·(T − T_0))","Thermal diffusion (1D): ∂T/∂t = α_D·∂²T/∂x² + q/(ρ·c_p), α_D = k/(ρ·c_p)"],DT={sky130_core:{vgs_max_v:1.95,temp_max_c:125,note:"foundry-specified commercial operating range"},freepdk45:{vdd_max_v:1,note:"virtual academic PDK"},asap7:{vdd_max_v:.7,note:"virtual academic PDK"}},IT={sky130_gate_oxide_tddb:{vgs_threshold_v:1.95,note:"SKY130 core SOA ceiling; exceeding accelerates TDDB exponentially (E-model: ln(MTTF) ∝ −γ·Vgs, γ ≈ 300 dec/V for 4.1 nm SiO2)"},copper_fusing_c:1085,fr4_delamination_c:260,silicon_melting_c:1414,aluminium_fusing_note:"SKY130 metal (Al) fusing depends on current density; for 1 µm wide met1, typical DC fusing current ≈ 5–10 mA"},gn={id:wT,domain:ET,provenance_status:TT,source_citation:bT,source_url:AT,license_or_access:CT,parameters:RT,material_properties:PT,equations:LT,valid_operating_envelope:DT,failure_thresholds:IT},NT="03_multiradix_logic_baselines",UT="multi-radix-logic",kT="verified_offline_standard",FT="SKY130A PDK voltage-level definitions (Phase 0 verified primitives); multi-valued logic noise-margin theory from Hirasuna (1999) and Pécot et al.; radix-economy from Thomas K. Moon (2005), 'Fundamentals of Digital Logic'",OT="https://github.com/google/skywater-pdk, https://en.wikipedia.org/wiki/Multi-valued_logic",BT="Apache-2.0 (SKY130); public domain (theory)",zT={binary_radix2_1p8v:{name:"Binary (radix-2) — 1.8 V SKY130",logic_levels_v:{L:0,H:1.8},noise_margin_low_v:.6,noise_margin_high_v:.6,voltage_levels_v:[0,1.8],nominal_midpoint_v:.9,note:"Standard binary CMOS logic levels at 1.8 V nominal VDD"},quaternary_q4_1p8v_ldo:{name:"Q4 Quaternary — 1.8 V LDO (SKY130 4-level)",logic_levels_v:{0:0,1:.6,2:1.2,3:1.8},voltage_levels_v:[0,.6,1.2,1.8],nominal_midpoints_v:[.3,.9,1.5],noise_margin_per_level_v:.3,note:"Phase 0 verified Q4 voltage map on SKY130 1.8 V LDO rail; 4 distinct levels with 0.6 V spacing"},quaternary_q4_1p65v:{name:"Q4 Quaternary — 1.65 V profile (alternative)",logic_levels_v:{0:0,1:.55,2:1.1,3:1.65},voltage_levels_v:[0,.55,1.1,1.65],nominal_midpoints_v:[.275,.825,1.375],noise_margin_per_level_v:.275,note:"Lower-margin alternative profile for tighter power budgets"},ternary_balanced_1p8v:{name:"Balanced Ternary (radix-3) — 1.8 V",logic_levels_v:{neg1:0,zero:.9,pos1:1.8},voltage_levels_v:[0,.9,1.8],nominal_midpoints_v:[.45,1.35],noise_margin_per_level_v:.45,note:"Balanced ternary: −1, 0, +1 mapped to 0, 0.9, 1.8 V"},ternary_unbalanced_1p8v:{name:"Unbalanced Ternary (radix-3) — 1.8 V",logic_levels_v:{0:0,1:.9,2:1.8},voltage_levels_v:[0,.9,1.8],nominal_midpoints_v:[.45,1.35],noise_margin_per_level_v:.45,note:"Unbalanced ternary: 0, 1, 2 mapped to 0, 0.9, 1.8 V"}},VT=[{cell_name:"q4_thresh_det",function:"quaternary threshold detector — maps analogue input to nearest Q4 digit",gate_count:6,drc_status:"DRC=0 (Magic)",lvs_status:"Netgen unique LVS ✓",pex_status:"RC PEX extracted ✓",sk130_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436"},{cell_name:"q4_inv",function:"quaternary inverter — Q3→Q0, Q2→Q1, Q1→Q2, Q0→Q3",gate_count:6,drc_status:"DRC=0 (Magic)",lvs_status:"Netgen unique LVS ✓",pex_status:"RC PEX extracted ✓",sk130_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436"},{cell_name:"q4_mux4",function:"4:1 quaternary multiplexer — selects one of 4 Q4 inputs by 2-digit selector",gate_count:8,drc_status:"DRC=0 (Magic)",lvs_status:"Netgen unique LVS ✓",pex_status:"RC PEX extracted ✓",sk130_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436"},{cell_name:"q4_half_adder",function:"quaternary half adder — Q4 sum (mod 4) + Q4 carry",gate_count:8,drc_status:"DRC=0 (Magic)",lvs_status:"Netgen unique LVS ✓",pex_status:"RC PEX extracted ✓",sk130_commit:"f62031a1be9aefe902d6d54cddd6f59b57627436"}],HT=["radix_economy: E(r) = r / log₂(r) — the cost-per-digit ratio; minimized at r = e ≈ 2.718, making radix-3 theoretically most economical","noise_margin_NMH = V_OH(min) − V_IH(max); noise_margin_NML = V_IL(max) − V_OL(max)","Q4 levels: L_k = k · VDD / 3 for k = 0..3 with VDD = 1.8 V","binary_levels: L_k = k · VDD for k = 0..1","ternary_levels: L_k = k · VDD / 2 for k = 0..2","theoretical_noise_margin_bounds: NM ≥ VDD / (2·(r − 1)) for r uniformly spaced levels on a railed logic family","Q4 inversion: Q3 → Q0, Q2 → Q1, Q1 → Q2, Q0 → Q3 (equivalent to 3 − Q in mod-4)","Q4 half adder: S = (A + B) mod 4, C = ⌊(A + B) / 4⌋"],GT={vdd_range_v:[1.65,1.95],temperature_range_c:[-40,125],note:"SKY130 commercial operating range; logic-level voltages scale proportionally with VDD"},WT={vgs_overstress_v:1.95,note:"SKY130 core SOA ceiling; the Q4 voltage map (max 1.8 V) is safely below this ceiling"},Rf={id:NT,domain:UT,provenance_status:kT,source_citation:FT,source_url:OT,license_or_access:BT,parameters:zT,verified_sky130a_q4_primitives:VT,equations:HT,valid_operating_envelope:GT,failure_thresholds:WT},qT="04_quantum_hardware_modalities",XT="quantum-hardware",jT="verified_offline_standard",KT="Published parameters: Google Sycamore (Arute et al., Nature 574, 505–510, 2019); IBM Quantum (IBM Quantum Development roadmap 2023–2026); QuEra/Harvard neutral-atom (Ebadi et al., Nature 612, 2023); Quantinuum trapped-ion (Mt. Const. from Quantinuum H2); UChicago SNSPD (Reddy et al., APL Photonics); dilution refrigerator specs from Bluefors product datasheets (XLD400)",YT="https://quantumai.google/hardware, https://www.ibm.com/quantum/technology, https://www.quantinuum.com/, https://www.bluefors.com/",$T="public domain (published parameters); institutional (IBM/Google/Quantinuum data cited from peer-reviewed publications)",QT={superconducting_transmon:{name:"Superconducting Transmon QPU",qubit_type:"superconducting transmon (Coplanar Waveguide resonator readout)",typical_frequency_ghz:{min:4,max:6,typical:5},anharmonicity_alpha_mhz:{min:-340,max:-200,typical:-280},t1_us:{min:50,typical:100,max:300},t2_us:{min:50,typical:150,max:300},t2_note:"T2 ≤ 2·T1 by fundamental bound; T2 echo typically 150–300 µs",gate_1q_duration_ns:{typical:25,range:[15,50]},gate_1q_error:{typical:5e-4,best_reported:1e-4},gate_2q_duration_ns:{typical:300,range:[150,600]},gate_2q_error:{typical:.005,best_reported:.001},zz_crosstalk_khz:{typical:50,range:[10,200]},readout_fidelity:{typical:.98,best_reported:.999},mixing_chamber_temp_mk:{typical:15,range:[10,20]},cryo_cooling_power:{stage_4k_w:1.5,stage_100mk_w:.1,stage_15mk_w:.012,note:"Bluefors XLD400 dilution refrigerator; cooling power at each stage — loading above these limits causes thermal quench"},qubit_count_demonstrated:{google_sycamore:53,ibm_condor:1121,ibm_heron:133},citations:["Arute et al., 'Quantum supremacy using a programmable superconducting processor', Nature 574, 505–510 (2019)","IBM Quantum Development Roadmap (2023–2026) — Heron/Condor specifications"]},silicon_photonic_soi:{name:"Silicon Photonic QPU (SOI)",qubit_type:"dual-rail or path-encoded photonic qubit at 1550 nm C-band",wavelength_nm:1550,waveguide_propagation_loss_db_per_cm:{typical:.5,best_reported:.1},directional_coupler_insertion_loss_db:{typical:.1,best_reported:.01},mzi_insertion_loss_db:{typical:1,best_reported:.1},thermo_optic_phase_shifter:{p_pi_mw:{typical:5,range:[1,20]},thermal_crosstalk_db:{typical:-15,range:[-25,-10]},response_time_us:{typical:10,range:[1,100]}},snspd_detector:{efficiency_percent:{typical:90,best_reported:98},dark_count_per_second:{typical:100,best_reported:1},jitter_ps:{typical:30,best_reported:10},reset_time_ns:{typical:20,range:[10,100]}},cryo_requirement:"SNSPD requires cryogenic operation (typically 0.8–2 K on a separate cryostat stage)",citations:["Reddy et al., 'Superconducting nanowire single-photon detectors', APL Photonics 8, 051101 (2023)"]},neutral_atom_rubidium87:{name:"Neutral-Atom Array (87Rb)",qubit_type:"87Rb neutral atom in optical tweezer (ground-state hyperfine qubit)",atom_species:"87Rb",transition_wavelength_nm:{d2_line:780.24,rydberg:480},trap_depth_mhz:{typical:100,range:[20,500]},rydberg_blockade_radius_um:{typical:5,range:[3,10]},rydberg_c6_ghz_um6:{typical:500,note:"C6 coefficient for |60S⟩ Rydberg state"},shuttle_velocity_um_per_s:{typical:100,max:1e3},gate_1q_error:{typical:5e-4},gate_2q_error:{typical:.005,best_reported:.001},atom_count_demonstrated:{harvard_2023:866,quera_2024:256},vacuum_pressure_torr:{typical:1e-10},heating_rate_mk_per_s:{typical:.01},citations:["Ebadi et al., 'Quantum optimization of maximum independent set using Rydberg atom arrays', Nature 612, 71–77 (2023)"]},trapped_ion_ytterbium171:{name:"Trapped-Ion QPU (171Yb+)",qubit_type:"171Yb+ hyperfine qubit (|F=0,m=0⟩ ↔ |F=1,m=1⟩ ground state)",transition_wavelength_nm:{clock_411:411,detection_369:369.53},trap_depth_mhz:{typical:1e3},gate_1q_error:{typical:2e-4,best_reported:1e-4},gate_2q_error:{typical:.001,best_reported:5e-4},gate_2q_type:"Mølmer–Sørensen",shuttle_time_ms:{typical:50,range:[20,200]},ion_count_demonstrated:{quantinuum_h2:56},vacuum_pressure_torr:{typical:1e-11},heating_rate_quanta_per_s:{typical:1},citations:["Quantinuum H2 specifications — 56 qubits, 99.9% 2Q gate fidelity (2024)"]}},JT=["Lindblad master equation: dρ/dt = −i[H,ρ]/ħ + Σ_k γ_k (L_k ρ L_k† − ½{L_k†L_k, ρ}) — open-system dynamics with decoherence rates γ_k","Gate error (average): E = 1 − F_avg where F_avg = (|tr(U†U_ideal)|² + d) / (d + 1)","Rydberg blockade: V(r) = C₆/r⁶; blockade radius r_b = (C₆/Ω)^(1/6) where Ω is the Rabi frequency","Blackbody decoherence rate: Γ_bb = (k_B·T/ħ)² · (2·π·c/(ω₀))² · (1/4π) — thermal photon-induced transitions","Dilution fridge cooling power: Q_cool(T) = Q_ideal(T) · η, Q_ideal(T) ∝ (T/T_c)² for dilution stage"],ZT={superconducting:{temperature_mk:[10,20],magnetic_field_ut:[0,1],note:"Dilution fridge, mu-metal shielding"},photonic:{temperature_k:[.8,300],note:"SNSPD cryogenic; waveguide can be room temperature"},neutral_atom:{vacuum_torr:[1e-11,1e-9],temperature_mk:[.01,1],note:"UHV chamber"},trapped_ion:{vacuum_torr:[1e-11,1e-10],note:"UHV trap chamber"}},e2={cryo_quench:{condition:"Q_load > Q_cooling_capacity at any dilution fridge stage",effect:"temperature rises above superconducting transition → decoherence collapse, qubit loss, hours of recovery time",threshold_15mk_w:.012,note:"Exceeding the 15 mK cooling power budget (typically 12 mW for Bluefors XLD400) causes thermal quench"},magnetic_field_intrusion:{condition:"B > B_c for superconducting materials (Nb: B_c ≈ 200 mT)",effect:"superconducting transition, SQUID readout failure"},vacuum_loss:{condition:"pressure > 1e-9 torr for neutral atoms / trapped ions",effect:"collision-induced atom/ion loss, heating rate spikes"}},mg={id:qT,domain:XT,provenance_status:jT,source_citation:KT,source_url:YT,license_or_access:$T,parameters:QT,equations:JT,valid_operating_envelope:ZT,failure_thresholds:e2},t2="05_chip_architecture_benchmarks",n2="chip-architecture",i2="verified_offline_standard",r2="RISC-V RV32IM ISA specification (riscv.org, version 2.2); Google TPU v1 paper (Jouppi et al., ISCA 2017); NVIDIA Ampere architecture whitepaper (NVIDIA Corp., 2020); Forth standard (Forth-2012); Systolic array theory from Kung & Su (1984)",s2="https://riscv.org/technical/specifications/, https://ai.googleblog.com/2017/04/quantuping-neural-networks.html, https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf",o2="public (RISC-V ISA spec); published academic (TPU); public (NVIDIA whitepaper)",a2={riscv_rv32im:{name:"RISC-V RV32IM (educational CPU)",isa:"RV32IM (integer + multiply/divide)",register_count:32,register_width_bits:32,instruction_formats:["R","I","S","B","U","J"],base_instructions:47,m_extension_instructions:8,pipeline_stages:5,typical_frequency_mhz:{educational_fpga:50,asic_130nm:100,asic_7nm:1e3},cpi_typical:1.2,power_mw_at_100mhz_130nm:15,note:"Educational reference; the Invention Lab IL-8 ISA is a simplified 8-bit subset for teaching"},systolic_array_tpu:{name:"Systolic-Array Tensor Processing Unit",dataflow:"weight-stationary",grid_size:{tpu_v1:256,educational:8},mac_per_cycle:{tpu_v1:65536,educational_8x8:64},arithmetic:"INT8 multiply + INT32 accumulate",quantization:"per-axis symmetric INT8 with FP32 accumulator (QDQ: Quantize → Dequantize → Quantize)",clock_mhz:{tpu_v1:700,educational:100},peak_tops_int8:{tpu_v1:92,educational_8x8_at_100mhz:.0064},memory_hierarchy:{on_chip_sram_mb:{tpu_v1:28,educational_kb:8},hbm_gbps:{tpu_v1:600}},power_w:{tpu_v1:75},utilization_note:"Weight-stationary dataflow achieves >85% utilization for dense GEMM when grid divides evenly into matrix dimensions",note:"Systolic array cycles = K + 2P − 2 for a P×P tile computing C[M×N] = A[M×K]·B[K×N] with K the inner dimension"},simt_gpu:{name:"SIMT GPU (Graphics / Compute)",warp_width:{nvidia:32,amd:64,intel:16},register_file_per_sm_kb:{nvidia_ampere:256,educational:16},shared_memory_per_sm_kb:{nvidia_ampere:164,educational:8},sm_count:{nvidia_a100:108,rtx_3060:28,intel_iris_xe_155u:96},cuda_cores_per_sm:{nvidia_ampere:64},clock_mhz:{nvidia_a100:1410,intel_iris_xe_155u:1450},memory_bandwidth_gbps:{nvidia_a100_hbm2e:1555,intel_iris_xe_lpddr5:68},power_w:{nvidia_a100:400,intel_iris_xe_155u_tdp:28},note:"Intel Core Ultra 7 155U integrated Intel Graphics: 96 EU, 1450 MHz, LPDDR5x-7467 shared memory"},forth_engine:{name:"Forth Engine (stack-based educational)",stack_depth:32,cell_width_bits:16,word_count:64,core_words:["DUP","DROP","SWAP","OVER","+","-","*","/","AND","OR","XOR","@","!",":",";"],note:"Stack-based Forth interpreter — matches the IL-8 CPU's OUT/IN port model"}},l2=["systolic cycles for P×P array, K inner dim, M×N output tiles: cycles = ceil(M/P) · ceil(N/P) · (K + 2P − 2)","systolic utilization: U = (M·N·K) / (tiles · (K + 2P − 2) · P²) for dense GEMM","SIMT throughput: ops_per_cycle = SM_count · cores_per_SM · ops_per_core_per_clock","Amdahl's law: speedup = 1 / ((1 − p) + p/s) where p is the parallel fraction, s is the speedup of the parallel part","Roofline model: achievable_FLOPs = min(peak_FLOPs, arithmetic_intensity · peak_bandwidth)","Amdahl-based pipeline speedup: S_pipe = N_stages when perfectly balanced; actual = N_stages · (1 / (1 + pipeline_overhead))"],c2={riscv_rv32im:{vdd_range_v:[.8,1.2],temp_range_c:[-40,125]},systolic_tpu:{vdd_range_v:[.7,.9],temp_range_c:[-40,100],note:"INT8 accumulator overflow threshold: K_max for INT32 accumulator = 2^31 / (255 × 255) ≈ 33038"},simt_gpu:{temp_range_c:[0,100],power_tdp_w:28}},u2={int32_accumulator_overflow:{condition:"accumulated product sum exceeds 2^31 − 1 (INT32 max) in QDQ INT8 GEMM",detection:"requires per-tile saturation check in the systolic array design",mitigation:"INT32 accumulator safely handles K up to 33038 for INT8 inputs (±127 × ±127 = 16129 max product per MAC)"},thermal_throttle:{condition:"junction temperature exceeds TDP-specified limit",effect:"clock throttling, potential permanent damage above absolute maximum rating"}},d2={id:t2,domain:n2,provenance_status:i2,source_citation:r2,source_url:s2,license_or_access:o2,parameters:a2,equations:l2,valid_operating_envelope:c2,failure_thresholds:u2},h2="06_failure_physics_thresholds",f2="failure-physics",p2="verified_offline_standard",m2="Black's equation (J.R. Black, IEEE Proc. 1967); Planck's law of blackbody radiation (Planck, 1901); Wikipedia: Black-body radiation (for CIE 1931 RGB color mapping); Bluefors XLD400 dilution refrigerator datasheet; SKY130 PDK reliability specifications",_2="https://en.wikipedia.org/wiki/Black-body_radiation, https://en.wikipedia.org/wiki/Electromigration, https://www.bluefors.com/products/xld400-dilution-refrigerator",g2="public domain (physics equations); SKY130 PDK reliability specs (Apache-2.0)",v2={blackbody_rgb_temperature_curve:{description:"Blackbody radiation visible colour mapped from Planck's law to RGB via CIE 1931 colour space — used for thermal-glow shader effects from 300 K to 2500 K",equation:"B(λ,T) = (2·h·c²/λ⁵) · 1/(exp(h·c/(λ·k_B·T)) − 1)",temperature_range_k:[300,2500],visible_color_mapping:{"300_k":{rgb:[0,0,0],note:"room temperature — invisible (pure IR)"},"500_k":{rgb:[64,0,0],note:"barely visible dark red glow"},"750_k":{rgb:[153,0,0],note:"dark cherry red — hot resistor"},"1000_k":{rgb:[255,40,0],note:"bright cherry red — stressed metal trace"},"1500_k":{rgb:[255,128,24],note:"orange — metal near fusing"},"2000_k":{rgb:[255,190,76],note:"yellow-white — metal at melting threshold"},"2500_k":{rgb:[255,225,155],note:"near-white — arc/plasma temperature"}},shader_formula:"vec3 blackbodyRGB(float T_k) { return T_to_RGB_lut(T_k); } — precomputed lookup or analytic approximation (Tanner Helland approximation, documented at http://www.tannerhelland.com/4435/convert-temperature-rgb)",references:["Tanner Helland, 'How to convert temperature (K) to RGB: algorithm and sample code' (2012)","CIE 1931 colour space standard"]},gate_oxide_tddb:{description:"Time-Dependent Dielectric Breakdown: Vgs > 1.95 V on SKY130 core oxide triggers exponential acceleration of breakdown probability",model:"E-model: ln(TTF) = ln(A) − γ·Vgs, where γ ≈ 300 dec/V for 4.1 nm SiO2",vgs_threshold_v:1.95,vdd_nominal_v:1.8,gamma_dec_per_v:300,note:"Above 1.95 V the TDDB lifetime drops below 10 years at 125 °C; below 1.8 V the lifetime exceeds 100 years",hard_breakdown:{vgs_irreversible_v:3,note:"above ~3 V the gate oxide hard-breaks down permanently (device destroyed) — well above the 1.95 V SOA ceiling"},shader_effect:"glow intensity proportional to exp((Vgs − 1.95) · γ) when Vgs > 1.95; arc spark effect when Vgs > 3.0",references:["J.R. Black, 'Electromigration — A brief survey and some recent results', IEEE Trans. Electron Devices, ED-16, 338 (1969)","SKY130 PDK reliability model documentation"]},metal_trace_joule_heating_fusing:{description:"Joule heating I²R raises the metal trace temperature; above the fusing temperature the trace melts and breaks",equations:["Joule heating power: P = I²·R(T)","Temperature rise (quasi-static): ΔT = P · R_th (thermal resistance)","Onderdonk fusing equation (short pulse): I_f = S · sqrt((T_melt − T_amb) / (t · ρ_0 · α))","Black's equation (EM lifetime): MTTF = A · J^(−n) · exp(E_a/(k_B·T)), n ≈ 2, E_a ≈ 0.7 eV (Al)"],thresholds:{cu_melting_c:1085,cu_thermal_expansion_coeff_per_k:165e-7,al_melting_c:660,fr4_delamination_c:260,si_thermal_runaway_c:200,note:"Metal trace glow visible above ~750 K; Si thermal runaway above 200 °C (junction); FR-4 delamination above 260 °C"},shader_effect:"trace colour transitions from normal → warm → glowing red → orange → white-hot as temperature rises; smoke particles above delamination threshold; trace vanishes at fusing point",visual_thresholds_c:{normal:25,warm_glow_start:500,red_glow:750,orange_glow:1500,white_hot:2e3,cu_fusing:1085,fr4_smoke:260}},cryogenic_mixing_chamber_quench:{description:"Dilution refrigerator mixing chamber at 15 mK: when the heat load exceeds the cooling capacity, temperature rises, causing decoherence collapse of superconducting qubits",cooling_capacity:{stage_15mk_w:.012,stage_100mk_w:.1,stage_4k_w:1.5,device:"Bluefors XLD400"},equations:["dilution cooling power: Q_cool(T) ∝ (T/T_c)² — approximately quadratic below T_c ≈ 100 mK","thermal time constant: τ_th = C_th · R_th where C_th is the thermal mass and R_th the thermal resistance","temperature rise: dT/dt = (Q_load − Q_cool(T)) / C_th — positive dT/dt means warming"],thresholds:{quench_condition:"Q_load > Q_cooling_capacity (12 mW at 15 mK)",decoherence_collapse:"temperature rises above the superconducting transition (~1.2 K for Al) → all qubits lose coherence",recovery_time_hours:4,note:"thermal quench causes hours of recovery time — a significant practical failure mode for quantum computing"},shader_effect:"chamber temperature indicator transitions from cold blue → warming → red warning → thermal quench alarm; qubit hologram dissolves when T > T_c",visual_thresholds:{normal_15mk:{color:"cold blue",opqacity:1},warming_100mk:{color:"light blue",opacity:.7},warning_1k:{color:"orange",opacity:.4},quench_4k:{color:"red alarm",opacity:0}}},si_thermal_runaway:{description:"Silicon junction thermal runaway: above ~200 °C the leakage current doubles every ~10 °C, creating positive thermal feedback",equation:"I_leakage(T) = I_0 · exp(−E_g/(2·k_B·T)) — doubles every ~10 °C at 300 K",threshold_c:200,note:"thermal runaway destroys the device if the heatsink cannot dissipate the increasing leakage power"}},y2={note:"Failure thresholds define the BOUNDARIES of the valid operating envelope. Operating outside these thresholds triggers the visual failure effects shown in the Electrophysics Lab 3D interface."},x2=["Planck's law: B(λ,T) = (2·h·c²/λ⁵) · 1/(exp(h·c/(λ·k_B·T)) − 1) — blackbody spectral radiance","Black's EM equation: MTTF = A · J^(−n) · exp(E_a/(k_B·T)) — electromigration mean time to failure","Joule heating: P = I²·R(T) — resistive heating","Onderdonk fusing: I_f = S · sqrt((T_melt − T_amb)/(t · ρ_0 · α)) — short-pulse fusing current","Thermal quench: dT/dt = (Q_load − Q_cool)/C_th — temperature rise rate","Thermal runaway: I_leak(T) = I_0 · exp(−E_g/(2·k_B·T)) — silicon junction leakage","TDDB (E-model): ln(TTF) = ln(A) − γ·Vgs — time-dependent dielectric breakdown"],S2={gate_oxide_tddb:{vgs_threshold_v:1.95,gamma_dec_per_v:300,note:"SKY130 core SOA ceiling"},cu_melting_c:1085,fr4_delamination_c:260,si_thermal_runaway_c:200,cryo_quench_15mk_w:.012,note:"Detailed thresholds in the parameters section and failure_thresholds sub-objects above"},Br={id:h2,domain:f2,provenance_status:p2,source_citation:m2,source_url:_2,license_or_access:g2,parameters:v2,valid_operating_envelope:y2,equations:x2,failure_thresholds:S2},M2="invention-lab/reference-library-manifest/1",w2="2026-11-19T20:13:44.042Z",E2=[{file:"01_fundamental_constants.json",sha256:"11b055141ee1fea01ec6e0de7201972f5ebad765274c4a06f9fa9341dd2dcb66",size_bytes:3216},{file:"02_semiconductor_pdk_silicon.json",sha256:"c123fc5ba2b2a57ca4ccee4fdb16d713d9a79f0266d6711bae464d92e3ebfa37",size_bytes:6624},{file:"03_multiradix_logic_baselines.json",sha256:"d09b3c7f5f518756ed42507ebc11996b3c730209871f030a3f300f7ecf8aa692",size_bytes:4937},{file:"04_quantum_hardware_modalities.json",sha256:"ad82899562507eed38774e9dbd9fa07b82c8a47e7129b6c887edd9638131a1be",size_bytes:7434},{file:"05_chip_architecture_benchmarks.json",sha256:"8d2b9a8e530df0c4190b467cc07b9da3fb0b82e76c0d466a42d6bb0d0e59925d",size_bytes:5168},{file:"06_failure_physics_thresholds.json",sha256:"8b74e7eab2dd4323176811c7f7ba252c7563819c20d688ad443da6f4475ba239",size_bytes:8582}],_g={format:M2,generatedAt:w2,files:E2},T2={"01_fundamental_constants.json":sT,"02_semiconductor_pdk_silicon.json":oT,"03_multiradix_logic_baselines.json":aT,"04_quantum_hardware_modalities.json":lT,"05_chip_architecture_benchmarks.json":cT,"06_failure_physics_thresholds.json":uT};async function b2(s){const e=new TextEncoder().encode(s),t=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(t)).map(i=>i.toString(16).padStart(2,"0")).join("")}async function A2(){const s=_g,e=[];for(const i of s.files){const o=T2[i.file];if(o===void 0){e.push({file:i.file,expected:i.sha256,actual:"(missing)",ok:!1});continue}const l=await b2(o);e.push({file:i.file,expected:i.sha256,actual:l,ok:l===i.sha256})}const t=e.filter(i=>i.ok).length;return{verified:t,total:e.length,allVerified:t===e.length,details:e}}const qn={constants:MT,semiconductor:gn,multiradix:Rf,quantum:mg,architecture:d2,failures:Br,manifest:_g},g_={VDD_NOMINAL_V:gn.parameters.sky130a.nominal_vdd_v,VGS_SOA_MAX_V:gn.parameters.sky130a.core_soa_max_vgs_v,VTH_NMOS_V:gn.parameters.sky130a.vth_nmos_typ_v,VTH_PMOS_V:gn.parameters.sky130a.vth_pmos_typ_v,GATE_OXIDE_NM:gn.parameters.sky130a.oxide_thickness_nm.gate_oxide,METAL_STACK:gn.parameters.sky130a.metal_stack};Rf.parameters.quaternary_q4_1p8v_ldo.voltage_levels_v;const tf=Rf.verified_sky130a_q4_primitives;gn.material_properties.copper.resistivity_ohm_m_at_300K,gn.material_properties.copper.tcr_per_k,gn.material_properties.copper.thermal_conductivity_w_per_m_k,gn.material_properties.copper.specific_heat_j_per_kg_k,gn.material_properties.copper.density_kg_per_m3,gn.material_properties.copper.melting_point_c;gn.material_properties.fr4_pcb.thermal_conductivity_w_per_m_k,gn.material_properties.fr4_pcb.specific_heat_j_per_kg_k,gn.material_properties.fr4_pcb.density_kg_per_m3,gn.material_properties.fr4_pcb.delamination_c,gn.material_properties.fr4_pcb.glass_transition_c;Br.failure_thresholds.gate_oxide_tddb.vgs_threshold_v,Br.failure_thresholds.gate_oxide_tddb.gamma_dec_per_v,Br.failure_thresholds.cu_melting_c,Br.failure_thresholds.fr4_delamination_c,Br.failure_thresholds.si_thermal_runaway_c,Br.failure_thresholds.cryo_quench_15mk_w,Br.parameters.blackbody_rgb_temperature_curve.visible_color_mapping;const vc=mg.parameters.superconducting_transmon,C2=[{tK:300,rgb:[0,0,0]},{tK:500,rgb:[64,0,0]},{tK:750,rgb:[153,0,0]},{tK:1e3,rgb:[255,40,0]},{tK:1500,rgb:[255,128,24]},{tK:2e3,rgb:[255,190,76]},{tK:2500,rgb:[255,225,155]}];class R2{group=new _n;modes;fridgePlates=[];plateLabelSprites=[];atomGrid;qubitHolo;coldLight;stageTempsK=[300,4,.1,.015];modeGroups=[];blochGroups=[];blochArrows=[];blochPurityShells=[];pulseBeam;pulseBeamLevel=0;constructor(){const e=this.buildFridge(),t=this.buildMziChip(),i=this.buildTweezerGrid();t.visible=!1,i.visible=!1,this.modes={fridge:e,mzi:t,tweezer:i},this.modeGroups=[e,t,i],this.group.add(e,t,i),this.coldLight=new Co(7325951,6,6,2),this.coldLight.position.set(0,.75,0),this.group.add(this.coldLight),this.buildBlochSpheres(),this.buildPulseBeam()}buildBlochSpheres(){const e=[[-2.35,3.3,.4],[0,3.9,.4],[2.35,3.3,.4]];for(let t=0;t<3;t++){const i=new _n;i.position.set(...e[t]);const o=new be(new vs(.42,20,14),new Ve({color:2775680,wireframe:!0,transparent:!0,opacity:.4}));i.add(o);const l=new be(new ka(.42,.006,6,40),new rr({color:3832496,transparent:!0,opacity:.5}));l.rotation.x=Math.PI/2,i.add(l);const c=new be(new Qt(.006,.006,.9,6),new rr({color:5933752,transparent:!0,opacity:.5}));i.add(c);const d=new be(new vs(.42,16,12),new Ve({color:6476031,transparent:!0,opacity:.22,roughness:.3}));i.add(d),this.blochPurityShells.push(d);const h=new _n,p=new be(new Qt(.022,.022,.34,8),new Ve({color:16761963,emissive:9071389,emissiveIntensity:.8}));p.position.y=.17,h.add(p);const m=new be(new Hc(.05,.12,10),new Ve({color:16761963,emissive:9071389,emissiveIntensity:1}));m.position.y=.4,h.add(m),i.add(h),this.blochArrows.push(h);const _=pn(`q${t}`,{scale:.32,color:"#9fd8ff",fontSize:30});_.position.set(0,.62,0),i.add(_),this.blochGroups.push(i),this.group.add(i)}}buildPulseBeam(){const e=new be(new Qt(.05,.02,1.6,10,1,!0),new rr({color:16761963,transparent:!0,opacity:0,side:Ti}));e.position.set(-.9,1.3,.35),e.rotation.z=.7,e.name="pulseBeam",this.group.add(e),this.pulseBeam=e}setBlochState(e,t,i,o,l){if(e<0||e>=this.blochArrows.length)return;const c=this.blochArrows[e],d=new I(t,o,-i),h=d.length();h>1e-4&&(c.quaternion.setFromUnitVectors(new I(0,1,0),d.clone().normalize()),c.scale.setScalar(Math.min(1.15,Math.max(.15,h))));const p=this.blochPurityShells[e],m=Math.max(.33,Math.min(1,l));p.scale.setScalar(.33+.67*m),p.material.opacity=.1+.25*m}setPulseLevel(e){this.pulseBeamLevel=e,this.pulseBeam&&(this.pulseBeam.material.opacity=.65*Math.min(1,e))}buildFridge(){const e=new _n,t=[{y:3.1,radius:1.35,label:"300 K",tempK:300},{y:2.25,radius:1.15,label:"4 K",tempK:4},{y:1.45,radius:.95,label:"100 mK",tempK:.1},{y:.72,radius:.78,label:"15 mK",tempK:.015}];for(const M of[-1.05,1.05])for(const E of[-1.05,1.05]){const x=new be(new Qt(.045,.045,3.4,10),fn.stainless);x.position.set(M,1.75,E),x.castShadow=!0,e.add(x)}const i=new be(new Qt(.52,.52,.5,28),fn.stainless);i.position.y=3.55,i.castShadow=!0,e.add(i);for(const M of t){const E=new be(new Qt(M.radius,M.radius,.1,40),fn.brushedGold);E.position.y=M.y,E.castShadow=!0,E.receiveShadow=!0,E.name=`stage-${M.label}`,e.add(E),this.fridgePlates.push(E);const x=t.indexOf(M);if(x>0){const C=t[x-1],b=new be(new Qt(.05,.05,C.y-M.y,10),fn.goldPolished);b.position.set(0,(C.y+M.y)/2,0),e.add(b)}const y=pn(M.label,{scale:.52,color:"#cfe6ff"});y.position.set(M.radius+.55,M.y,0),e.add(y),this.plateLabelSprites.push(y)}for(let M=0;M<7;M++){const E=M/7*Math.PI*2+.3,x=[new I(Math.cos(E)*.4,3.4,Math.sin(E)*.4),new I(Math.cos(E)*.85,2.3,Math.sin(E)*.85),new I(Math.cos(E+.25)*.72,1.5,Math.sin(E+.25)*.72),new I(Math.cos(E)*.55,.85,Math.sin(E)*.55)],y=new Na(x),C=new be(new Ao(y,24,.028,8,!1),fn.stainless);C.castShadow=!0,e.add(C)}const o=new be(new bt(.5,.06,.5),fn.niobiumDark);o.position.set(0,.82,0),e.add(o);const l=new be(new bt(.44,.008,.44),new Ve({color:857120,metalness:.6,roughness:.25}));l.position.set(0,.855,0),e.add(l);const c=new Ve({color:15122780,metalness:1,roughness:.2,emissive:9071389,emissiveIntensity:.25}),d=new Vr(new bt(.05,.006,.05),c,16),h=new kt;let p=0;for(let M=0;M<4;M++)for(let E=0;E<4;E++)h.position.set(-.15+M*.1,.862,-.15+E*.1),h.updateMatrix(),d.setMatrixAt(p++,h.matrix);e.add(d);const m=pn("16-qubit transmon die · 15 mK",{scale:.8,color:"#9fd8ff"});m.position.set(0,1.12,0),e.add(m);const _=sr(1,6476031);_.position.set(-.75,.77,.45),e.add(_);const v=sr(1,16751964);v.position.set(.72,.77,-.42),e.add(v);const S=new be(new bf(.34,2),new Ve({color:6476031,emissive:2785208,emissiveIntensity:.7,wireframe:!0,transparent:!0,opacity:.8}));return S.position.set(0,1.45,0),S.name="qubitHolo",e.add(S),this.qubitHolo=S,e}buildMziChip(){const e=new _n,t=new be(new bt(1.7,.09,1.2),fn.siliconDie);t.position.y=1.35,t.castShadow=!0,e.add(t);const i=new be(new bt(1.55,.02,1.05),new Ve({color:2305602,metalness:.5,roughness:.2}));i.position.y=1.41,e.add(i);const o=new Ve({color:16761963,emissive:13666858,emissiveIntensity:1.4,metalness:.3,roughness:.3}),l=qn.quantum.parameters.silicon_photonic_soi;for(const _ of[-.09,.09]){const v=[new I(-.7,1.425,_),new I(-.25,1.425,_*1.8),new I(.3,1.425,_*1.8),new I(.72,1.425,0)],S=new Na(v),M=new be(new Ao(S,32,.016,8,!1),o);e.add(M)}const c=new be(new bt(.16,.03,.3),fn.brushedGold);c.position.set(-.05,1.435,0),e.add(c);const d=pn("MZI photonic chip · 1550 nm · loss 0.5 dB/cm",{scale:1,color:"#ffd9a0"});d.position.set(0,1.72,0),e.add(d);const h=pn(`MZI IL ${l.mzi_insertion_loss_db.typical} dB · π-shift ${l.thermo_optic_phase_shifter.p_pi_mw.typical} mW`,{scale:.72,color:"#c9b08a"});h.position.set(0,1.6,0),e.add(h);const p=sr(.9,16761963);p.position.set(-.95,1.4,.35),e.add(p);const m=sr(.9,6476031);return m.position.set(.95,1.4,-.3),e.add(m),e}buildTweezerGrid(){const e=new _n,t=new be(new bt(2.4,.12,1.8),fn.plasticDark);t.position.y=1.2,t.castShadow=!0,e.add(t);const i=qn.quantum.parameters.neutral_atom_rubidium87,o=new Ve({color:16739722,emissive:13777502,emissiveIntensity:1.6,metalness:.1,roughness:.4}),l=new Vr(new vs(.035,10,8),o,64),c=new kt;let d=0;for(let v=0;v<8;v++)for(let S=0;S<8;S++)c.position.set(-.42+v*.12,1.38,-.42+S*.12),c.updateMatrix(),l.setMatrixAt(d++,c.matrix);l.name="atomGrid",e.add(l),this.atomGrid=l;const h=new rr({color:8042751,transparent:!0,opacity:.35}),p=new be(new Qt(.05,.05,2.6,10),h);p.rotation.z=Math.PI/2,p.position.set(0,1.42,0),e.add(p);const m=pn("87Rb tweezer grid · 8×8 · Rydberg 480 nm",{scale:1.05,color:"#ffb3c2"});m.position.set(0,1.78,0),e.add(m);const _=pn(`blockade r_b ${i.rydberg_blockade_radius_um.typical} µm · C₆ ${i.rydberg_c6_ghz_um6.typical} GHz·µm⁶`,{scale:.72,color:"#c9a2ad"});return _.position.set(0,1.66,0),e.add(_),e}setMode(e){for(const t of Object.keys(this.modes))this.modes[t].visible=t===e}setStageTemps(e){this.stageTempsK=e;for(let t=0;t<this.fridgePlates.length&&t<e.length;t++){const i=this.fridgePlates[t].material,o=e[t];o<=4?(i.emissive.setHex(1454143),i.emissiveIntensity=.9):o<100?(i.emissive.setHex(6969887),i.emissiveIntensity=.7):o<1200?(i.emissive.setHex(10115602),i.emissiveIntensity=.9):(i.emissive.setHex(11739168),i.emissiveIntensity=1.4)}if(this.qubitHolo){const i=(e[3]??.015)<1.2,o=this.qubitHolo.material;o.opacity=i?.8:.06,o.emissiveIntensity=i?.7:.05,this.coldLight.intensity=i?6:.4,this.coldLight.color.setHex(i?7325951:16732208)}}update(e,t){this.qubitHolo?.visible&&(this.qubitHolo.rotation.y+=e*.6,this.qubitHolo.rotation.x=Math.sin(t*.6)*.12),this.atomGrid?.visible}}const ds=[{key:"substrate",name:"Substrate",thickness:.22},{key:"nwell",name:"nwell",thickness:.05},{key:"psub",name:"psub",thickness:.05},{key:"diffusion",name:"Diffusion",thickness:.05},{key:"poly",name:"Poly",thickness:.05},{key:"li1",name:"li1",thickness:.05},{key:"mcon",name:"mcon",thickness:.07},{key:"met1",name:"met1",thickness:.09},{key:"via",name:"via",thickness:.07},{key:"met2",name:"met2",thickness:.1},{key:"via2",name:"via2",thickness:.07},{key:"met3",name:"met3",thickness:.12}];class P2{group=new _n;layers=[];primitiveCells=[];peelT=0;peelGoal=0;crossDepthGoal=ds.length;crossDepthT=ds.length;flowCurves=[];constructor(){this.buildWafer(),this.buildStack(),this.buildPrimitives(),this.buildTransistorFins(),this.buildProbePins(),this.applyPeel(0,this.crossDepthGoal,!0)}buildWafer(){const e=new be(new Qt(2.6,2.6,.14,64),fn.waferDark);e.position.y=.62,e.castShadow=!0,e.receiveShadow=!0,e.name="wafer",this.group.add(e);const t=new be(new bt(.1,.14,.3),fn.plasticDark);t.position.set(-2.56,.62,0),this.group.add(t);const i=pn(`SKY130A wafer · VDD ${g_.VDD_NOMINAL_V} V · SOA ${g_.VGS_SOA_MAX_V} V`,{scale:1.1,color:"#a8bfff"});i.position.set(0,1.05,-2.1),this.group.add(i)}materialForLayer(e){switch(e){case"substrate":return{mat:new Ve({color:1449e3,metalness:.5,roughness:.32}),kind:"slab"};case"nwell":return{mat:new Ve({color:3042904,transparent:!0,opacity:.7,metalness:.25,roughness:.45}),kind:"slab"};case"psub":return{mat:new Ve({color:3493998,transparent:!0,opacity:.66,metalness:.25,roughness:.5}),kind:"slab"};case"diffusion":return{mat:new Ve({color:7232078,metalness:.35,roughness:.5}),kind:"slab"};case"poly":return{mat:new Ve({color:6187904,metalness:.4,roughness:.48}),kind:"slab"};case"li1":return{mat:new Ve({color:9081506,metalness:.85,roughness:.3}),kind:"slab"};case"mcon":return{mat:new Ve({color:8160406,metalness:.9,roughness:.3}),kind:"vias"};case"met1":return{mat:new Ve({color:12568015,metalness:.95,roughness:.22}),kind:"slab"};case"via":return{mat:new Ve({color:12568015,metalness:.95,roughness:.25}),kind:"vias"};case"met2":return{mat:new Ve({color:13489117,metalness:.95,roughness:.2}),kind:"slab"};case"via2":return{mat:new Ve({color:13489117,metalness:.95,roughness:.25}),kind:"vias"};case"met3":return{mat:new Ve({color:14410218,metalness:.95,roughness:.18}),kind:"slab"}}}buildStack(){let i=.7+ds[0].thickness/2;for(let m=0;m<ds.length;m++){const _=ds[m],{mat:v,kind:S}=this.materialForLayer(_.key),M=new _n;if(M.name=`layer-${_.key}`,S==="slab"){const E=new be(new bt(4.2,_.thickness,2.9),v);if(E.castShadow=!0,E.receiveShadow=!0,M.add(E),_.key.startsWith("met")){const x=new Ve({color:10134194,metalness:.95,roughness:.3}),y=new Vr(new bt(4.2*.94,_.thickness*.35,.14),x,7),C=new kt;for(let b=0;b<7;b++)C.position.set(0,0,-2.9/2+.35+b*((2.9-.7)/6)),C.updateMatrix(),y.setMatrixAt(b,C.matrix);M.add(y)}}else{const y=new Vr(new Qt(.045,.045,_.thickness,8),v,160),C=new kt;let b=0;for(let P=0;P<16;P++)for(let G=0;G<10;G++)C.position.set(-4.2/2+.3+P*((4.2-.6)/15),0,-2.9/2+.28+G*((2.9-.56)/9)),C.updateMatrix(),y.setMatrixAt(b++,C.matrix);M.add(y)}M.position.y=i,this.group.add(M),this.layers.push({key:_.key,name:_.name,group:M,baseY:i,materials:[v]}),i+=_.thickness/2+(m+1<ds.length?ds[m+1].thickness/2:0)}const o=i;for(const m of this.layers){const _=pn(m.name,{scale:.42,color:"#d5e2f4",fontSize:34});_.position.set(4.2/2+.42,0,2.9/2-.2),m.group.add(_)}this.stackTopY=o;const l=this.layers.find(m=>m.key==="met2"),c=this.layers.find(m=>m.key==="met3"),d=(m,_)=>new Na([new I(-1.9,_,m),new I(-.8,_,m),new I(.3,_,m),new I(1.9,_,m)]),h=d(-1.15,.08),p=d(1.15,.1);this.flowCurves.push({id:"vdd-met2",curve:h,radix:"q4"}),this.flowCurves.push({id:"gnd-met3",curve:p,radix:"q4"});for(const[m,_]of[[this.flowCurves[0],l],[this.flowCurves[1],c]]){const v=new be(new Ao(m.curve,32,.03,8,!1),new Ve({color:15122780,metalness:1,roughness:.2,emissive:6967312,emissiveIntensity:.4}));v.castShadow=!0,_.group.add(v)}}getLayerOffsetY(e){const t=this.layers.find(i=>i.key===e);return t?t.group.position.y-t.baseY:0}stackTopY=0;buildPrimitives(){const e=this.layers.find(d=>d.key==="met3"),t=e.baseY,i=this.stackTopY+.08-t,o=[...tf.map(d=>({name:d.cell_name,note:d.function,radix:"q4"})),{name:"binary_inv",note:"binary inverter (radix-2 comparison)",radix:"binary"},{name:"binary_half_adder",note:"binary half adder (radix-2 comparison)",radix:"binary"}],l=3;for(let d=0;d<o.length;d++){const h=-1.35+d%l*1.35,p=d<l?-.72:.72,m=new _n,_=o[d].radix==="q4",v=new Ve({color:_?15122780:10473727,emissive:_?8018964:1854074,emissiveIntensity:.5,metalness:.9,roughness:.3,transparent:!0}),S=new be(new bt(1.05,.07,.62),v);S.castShadow=!0,m.add(S);const M=d<4?tf[d].gate_count:6,E=new Vr(new bt(.1,.05,.1),new Ve({color:2765634,metalness:.6,roughness:.4}),M),x=new kt;for(let C=0;C<M;C++)x.position.set(-.42+C%5*.21,.06,C<5?-.14:.14),x.updateMatrix(),E.setMatrixAt(C,x.matrix);m.add(E),m.position.set(h,i+.04,p),e.group.add(m);const y=pn(o[d].name,{scale:.52,color:_?"#ffd98a":"#9fd0ff"});y.position.set(h,i+.4,p),e.group.add(y),this.primitiveCells.push({cell:m,label:y})}const c=pn("DRC=0 · LVS ✓ · PEX ✓ · Phase 0 verified",{scale:.85,color:"#8ef0b2"});c.position.set(0,i+1.15,1.45),e.group.add(c)}buildTransistorFins(){const e=this.layers.find(l=>l.key==="diffusion").baseY+.045,t=new Vr(new bt(.16,.06,.34),new Ve({color:8811871,metalness:.4,roughness:.5}),24),i=new kt;let o=0;for(let l=0;l<4;l++)for(let c=0;c<6;c++)i.position.set(-1.5+c*.6,e,-.9+l*.6),i.updateMatrix(),t.setMatrixAt(o++,i.matrix);t.name="transistorFins",this.group.add(t)}buildProbePins(){const e=this.layers.find(c=>c.key==="met3"),t=this.stackTopY+.16-e.baseY,i=sr(1,16761963);i.position.set(-2.15,t,0),e.group.add(i);const o=sr(1,6476031);o.position.set(2.15,t,.2),e.group.add(o);const l=sr(1,16739722);l.position.set(2.05,t,-.7),e.group.add(l)}setPeelTargets(e,t){this.peelGoal=e,this.crossDepthGoal=t}applyPeel(e,t,i=!1){this.peelT=e,this.crossDepthT=t;const o=this.layers.length,l=Math.min(o,Math.max(0,t));this.layers.forEach((c,d)=>{const p=e*.55*d,m=d>=o-l,_=m?(d-(o-l)+1)*.42:0,v=m?.12:1;c.group.position.y=c.baseY+p+_;for(const S of c.materials)S.transparent=!0,S.opacity=i?v:S.opacity+(v-S.opacity)*.3})}update(e){if(Math.abs(this.peelT-this.peelGoal)>.001||Math.abs(this.crossDepthT-this.crossDepthGoal)>.001){const o=1-Math.exp(-6*e);this.peelT+=(this.peelGoal-this.peelT)*o,this.crossDepthT+=(this.crossDepthGoal-this.crossDepthT)*o,this.applyPeel(this.peelT,Math.round(this.crossDepthT))}const i=performance.now()*.001;this.primitiveCells.forEach(({cell:o},l)=>{const d=o.children[0].material;d.emissiveIntensity=.42+.12*Math.sin(i*1.4+l)})}layerY(e){return this.layers.find(t=>t.key===e)?.baseY??this.stackTopY}}class L2{group=new _n;tiles=[];npuTile;flowCurves=[];disassembled=!1;explodeGoal=0;explodeT=0;chipletGroups=[];busMeshes=[];constructor(){this.buildBoard(),this.buildChiplets(),this.buildBusFabric(),this.buildLabels()}buildBoard(){const e=new be(new bt(10.5,.22,7),fn.pcbGreen);e.position.y=.5,e.receiveShadow=!0,e.castShadow=!0,e.name="pcb",this.group.add(e);const t=new be(new bt(8.6,.1,5.4),new Ve({color:2765120,metalness:.6,roughness:.35}));t.position.y=.66,this.group.add(t);const i=pn(`FR-4 Tg ${qn.semiconductor.material_properties.fr4_pcb.glass_transition_c} °C · delam ${qn.semiconductor.material_properties.fr4_pcb.delamination_c} °C`,{scale:.9,color:"#7fd4a0",fontSize:30});i.position.set(0,.72,3.72),this.group.add(i)}makeChiplet(e,t,i,o,l,c,d,h){const p=new _n,m=new be(new bt(i[0],.14,i[1]),new Ve({color:1777707,metalness:.5,roughness:.5}));m.position.y=.07,m.castShadow=!0,p.add(m);const _=new be(new bt(i[0]-.3,.1,i[1]-.3),new Ve({color:l,metalness:.45,roughness:.35}));_.position.y=.19,_.castShadow=!0,p.add(_);const v=(i[0]-.5)/d,S=(i[1]-.5)/c,M=new Ve({color:3686479,emissive:1054752,emissiveIntensity:.5,metalness:.4,roughness:.4}),E=new Vr(new bt(v*.82,.045,S*.82),M,c*d),x=new kt;let y=0;for(let G=0;G<c;G++)for(let k=0;k<d;k++)x.position.set(-i[0]/2+.25+v*(k+.5),.26,-i[1]/2+.25+S*(G+.5)),x.updateMatrix(),E.setMatrixAt(y++,x.matrix);p.add(E);const C=new Ve({color:1712688,emissive:2242120,emissiveIntensity:.35,transparent:!0,opacity:.9}),b=new be(new ws(i[0]-.2,i[1]-.2),C);b.rotation.x=-Math.PI/2,b.position.y=.295,p.add(b),p.position.set(o[0],o[1],o[2]),this.group.add(p);const P={id:e,name:t,group:p,thermalPlane:b,thermalMat:C,idlePowerW:h,powerW:h,tempC:45};return this.tiles.push(P),this.chipletGroups.push(p),P}buildChiplets(){const e=qn.architecture.parameters,t=e.riscv_rv32im,i=e.systolic_array_tpu,o=e.simt_gpu;this.makeChiplet("cpu","CPU Cluster (RV32IM ×8)",[2.6,2.2],[-2.6,.79,-1.3],2898e3,2,4,t.power_mw_at_100mhz_130nm/1e3*8),this.makeChiplet("tpu",`Systolic TPU (${i.grid_size.educational}×${i.grid_size.educational} INT8)`,[2.2,2.2],[.3,.79,-1.4],5257260,8,8,i.power_w.tpu_v1*.08),this.makeChiplet("gpu",`SIMT GPU (${o.sm_count.intel_iris_xe_155u} EU)`,[3.4,1.6],[2.9,.79,-1.2],2904120,4,8,o.power_w.intel_iris_xe_155u_tdp*.35),this.makeChiplet("mem","Unified Memory Fabric (LPDDR5)",[4.6,1.5],[-1,.79,1.6],3812432,2,10,2.1),this.npuTile=this.makeChiplet("npu","Multi-Radix NPU (Q4/ternary/binary)",[1.7,1.4],[3.4,.79,1.55],5260332,3,3,1.2),this.npuTile.group.visible=!1;const l=new be(new bt(8.9,.12,5.6),new Ac({color:1712432,metalness:.4,roughness:.18,transparent:!0,opacity:.3}));l.position.y=1.35,l.name="packageLid",l.castShadow=!0,this.group.add(l)}buildBusFabric(){const e=[[new I(-1.4,.86,1.2),new I(-2,.86,-.3)],[new I(.3,.86,1),new I(.35,.86,-.5)],[new I(1.6,.86,1.2),new I(2.4,.86,-.5)],[new I(-1.3,.86,-1.2),new I(0,.86,-1.3)],[new I(1.3,.86,-1.25),new I(2.2,.86,-1.2)]];for(let t=0;t<e.length;t++){const i=new Na(e[t]);this.flowCurves.push({id:`bus-${t}`,curve:i});const o=new be(new Ao(i,20,.035,8,!1),new Ve({color:4019568,emissive:1849948,emissiveIntensity:.8,metalness:.6,roughness:.35}));o.name=`bus-${t}`,this.busMeshes.push(o),this.group.add(o)}}buildLabels(){const e=pn("Unified-Memory SoC · chiplet package",{scale:1.25,color:"#bfe3ff"});e.position.set(0,2.35,0),this.group.add(e)}setNpuAttached(e){this.npuTile&&(this.npuTile.group.visible=e)}setDisassembled(e){this.explodeGoal=e}setTileTemps(e){for(const t of this.tiles){const i=e[t.id]??t.tempC;t.tempC=i;const o=t.thermalMat;i<70?(o.emissive.setHex(2242120),o.emissiveIntensity=.3):i<100?(o.emissive.setHex(9067040),o.emissiveIntensity=.55):i<200?(o.emissive.setHex(12084250),o.emissiveIntensity=.9):(o.emissive.setHex(12592152),o.emissiveIntensity=1.5)}}setBusActivity(e){for(let t=0;t<this.busMeshes.length;t++){const i=this.busMeshes[t].material,o=e[t]??.2;i.emissiveIntensity=.5+o*2.2}}update(e){const t=1-Math.exp(-5*e);this.explodeT+=(this.explodeGoal-this.explodeT)*t;const i=this.group.getObjectByName("packageLid");i&&(i.position.y=1.35+this.explodeT*1.8);const o=[[-1.2,-.8],[.2,-1],[1.4,-.6],[-.9,.9]];this.chipletGroups.forEach((l,c)=>{const[d,h]=o[c%o.length],p=c===0?[-2.6,-1.3]:c===1?[.3,-1.4]:c===2?[2.9,-1.2]:[-1,1.6],m=this.npuTile&&l===this.npuTile.group?3.4:p[0],_=this.npuTile&&l===this.npuTile.group?1.55:p[1];l.position.set(m+d*this.explodeT,.79+this.explodeT*.5*(c%2+1),_+h*this.explodeT)})}}class D2{group=new _n;dutAnchor=new I(0,1.62,0);dutMat;charDecal;statusSprite;arcLight;faultLamp;arcLine;arcT=0;constructor(){const e=new be(new Qt(2.3,2.5,.35,48),fn.plasticDark);e.position.y=.18,e.receiveShadow=!0,e.castShadow=!0,this.group.add(e);const t=new be(new ka(2.05,.05,8,64),fn.dangerStripe);t.rotation.x=Math.PI/2,t.position.y=.37,this.group.add(t);const i=new be(new bt(1.3,.12,1),new Ve({color:921880,metalness:.3,roughness:.6}));i.position.set(0,.42,0),this.group.add(i);const o=new be(new bt(1,.07,.72),this.dutMat=new Ve({color:1844789,metalness:.55,roughness:.3,emissive:861238,emissiveIntensity:.4}));o.position.set(0,.52,0),o.castShadow=!0,o.name="dutChip",this.group.add(o);const l=new be(new bt(.2,.02,.16),new Ve({color:15122780,metalness:1,roughness:.25}));l.position.set(0,.562,0),this.group.add(l),this.dutAnchor.set(0,.58,0),this.charDecal=new be(new Ef(.16,20),new Ve({color:328965,roughness:.95,transparent:!0,opacity:0})),this.charDecal.rotation.x=-Math.PI/2,this.charDecal.position.set(0,.565,0),this.charDecal.visible=!1,this.group.add(this.charDecal);const c=new be(new Qt(.06,.09,1.6,12),fn.stainless);c.position.set(-1.1,1.15,-.5),c.castShadow=!0,this.group.add(c);const d=sr(.9,16732208);d.position.set(-.62,1.35,-.28),d.rotation.z=.5,this.group.add(d);const h=sr(.8,6476031);h.position.set(.75,.6,.45),h.rotation.z=-.35,this.group.add(h);const p=new be(new Qt(1.15,1.15,1.5,32,1,!0),fn.glassShroud);p.position.y=1.1,p.name="containmentGlass",this.group.add(p),this.faultLamp=new be(new vs(.09,14,12),new Ve({color:1920358,emissive:866120,emissiveIntensity:.8})),this.faultLamp.position.set(1.6,1.25,-.8),this.group.add(this.faultLamp),this.statusSprite=pn("SOA bench · nominal (VDD ≤ 1.80 V)",{scale:.95,color:"#9fd8ff"}),this.statusSprite.position.set(0,1.9,0),this.group.add(this.statusSprite),this.arcLight=new Co(12573951,0,7,2),this.arcLight.position.copy(this.dutAnchor).add(new I(0,.35,0)),this.group.add(this.arcLight);const m=new Jt;m.setAttribute("position",new jn(new Float32Array(48),3)),this.arcLine=new ag(m,new Mf({color:14216447,transparent:!0,opacity:0})),this.arcLine.visible=!1,this.arcLine.frustumCulled=!1,this.group.add(this.arcLine)}triggerArc(e=.55){this.arcT=e,this.arcLine.visible=!0}updateArc(e){if(this.arcT<=0){this.arcLine.visible&&(this.arcLine.visible=!1,this.arcLine.material.opacity=0,this.setArcFlash(0));return}this.arcT-=e;const t=this.arcLine.geometry.getAttribute("position"),i=t.array,o=this.dutAnchor,l=new I(0,.5,0);for(let d=0;d<16;d++){const h=d/15;i[d*3]=o.x+(Math.random()-.5)*.14*Math.sin(h*Math.PI),i[d*3+1]=o.y+l.y*h+(Math.random()-.5)*.03,i[d*3+2]=o.z+(Math.random()-.5)*.14*Math.sin(h*Math.PI)}t.needsUpdate=!0;const c=Math.max(0,this.arcT/.55);this.arcLine.material.opacity=Math.min(1,c*1.6),this.setArcFlash(c*14)}setStatus(e,t){this.statusSprite.material;const i=pn(e,{scale:.95,color:t?"#ff9d7a":"#9fd8ff"});this.statusSprite.material.map?.dispose(),this.statusSprite.material=i.material;const o=this.faultLamp.material;t?(o.emissive.setHex(16719888),o.emissiveIntensity=2.2):(o.emissive.setHex(866120),o.emissiveIntensity=.8)}setArcFlash(e){this.arcLight.intensity=e}applyCharDecal(){this.charDecal.visible=!0,this.charDecal.material.opacity=.92}clearFailureState(){this.charDecal.visible=!1,this.charDecal.material.opacity=0,this.dutMat.emissive.setHex(861238),this.dutMat.emissiveIntensity=.4,this.setArcFlash(0)}setShortedGate(e){e?(this.dutMat.emissive.setHex(1575430),this.dutMat.emissiveIntensity=.5):(this.dutMat.emissive.setHex(861238),this.dutMat.emissiveIntensity=.4)}update(e,t){this.updateArc(e)}}class I2{group=new _n;screenMat;books=[];constructor(){const e=new be(new bt(2.6,.14,1.7),new Ve({color:3812640,roughness:.7,metalness:.05}));e.position.y=1,e.castShadow=!0,this.group.add(e);for(const[d,h]of[[-1.1,-.65],[1.1,-.65],[-1.1,.65],[1.1,.65]]){const p=new be(new Qt(.05,.06,1,10),fn.plasticDark);p.position.set(d,.5,h),p.castShadow=!0,this.group.add(p)}const t=[["01_fundamental_constants.json","CODATA 2022 constants",5227511],["02_semiconductor_pdk_silicon.json","SKY130A / FreePDK45 / ASAP7",16761095],["03_multiradix_logic_baselines.json","Multi-radix logic baselines",9367730],["04_quantum_hardware_modalities.json","Quantum hardware modalities",16739722],["05_chip_architecture_benchmarks.json","Chip architecture benchmarks",11570431],["06_failure_physics_thresholds.json","Failure physics thresholds",16751964]];for(let d=0;d<t.length;d++){const[h,p,m]=t[d],_=new be(new bt(.36,.5,.28),new Ve({color:m,metalness:.1,roughness:.6}));_.position.set(-1+d*.4,1.32,-.55),_.rotation.y=(Math.random()-.5)*.12,_.castShadow=!0,this.group.add(_),this.books.push({mesh:_,file:h,title:p,color:m})}this.screenMat=new Ve({color:664886,emissive:2788032,emissiveIntensity:.9,transparent:!0,opacity:.85});const i=new be(new ws(1.8,1.05),this.screenMat);i.position.set(.2,1.72,-.25),i.rotation.x=-.35,this.group.add(i);const o=pn("Offline Physics Library — 6 verified datasets · SHA-256 ✓",{scale:1,color:"#9fdcff"});o.position.set(.2,2.42,-.1),this.group.add(o);const l=pn(qn.manifest.generatedAt.slice(0,10)+" · provenance: verified_offline_standard",{scale:.72,color:"#6f8aa8"});l.position.set(.2,2.3,.25),this.group.add(l);const c=new Co(16761963,3.2,4.5,2);c.position.set(0,1.9,.3),this.group.add(c)}setFocusedBook(e){this.books.forEach((t,i)=>{const o=t.mesh.material;o.emissive.setHex(i===e?t.color:0),o.emissiveIntensity=i===e?.6:0})}setIntegrity(e,t){const i=this.screenMat;t?e?(i.emissive.setHex(2071893),i.emissiveIntensity=1):(i.emissive.setHex(11739168),i.emissiveIntensity=1.2):(i.emissive.setHex(2788032),i.emissiveIntensity=.6+.3*Math.sin(performance.now()*.004))}update(e,t){}}const v_=C2;function N2(){const s=v_.map(e=>new I(e.rgb[0]/255,e.rgb[1]/255,e.rgb[2]/255));return new Ln({uniforms:{uTempK:{value:300},uStops:{value:s},uStopsT:{value:v_.map(e=>e.tK)}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTempK;
      uniform vec3 uStops[7];
      uniform float uStopsT[7];
      varying vec2 vUv;
      vec3 blackbody(float tK) {
        if (tK <= uStopsT[0]) return uStops[0];
        for (int i = 0; i < 6; i++) {
          float a = uStopsT[i];
          float b = uStopsT[i + 1];
          if (tK >= a && tK <= b) {
            float f = (tK - a) / (b - a);
            return mix(uStops[i], uStops[i + 1], f);
          }
        }
        return uStops[6];
      }
      void main() {
        vec3 c = blackbody(uTempK);
        // faint scanline grid for the thermal-camera look
        float grid = step(0.97, fract(vUv.x * 24.0)) + step(0.97, fract(vUv.y * 24.0));
        c += grid * 0.05;
        gl_FragColor = vec4(c, 1.0);
      }
    `})}class U2{entries=[];viewOn=!1;register(e,t){this.entries.some(i=>i.mesh===e)||this.entries.push({mesh:e,normalMaterial:e.material,thermalMaterial:N2(),getTempK:t})}setView(e){this.viewOn=e;for(const t of this.entries)t.mesh.material=e?t.thermalMaterial:t.normalMaterial}update(){if(this.viewOn)for(const e of this.entries)e.thermalMaterial.uniforms.uTempK.value=e.getTempK()}dispose(){for(const e of this.entries)e.thermalMaterial.dispose();this.entries=[]}}class y_{points;positions;velocities;life;maxLife;count;cursor=0;color;constructor(e,t=220,i=10134704,o=.22){this.count=t,this.color=new $e(i),this.positions=new Float32Array(t*3),this.velocities=new Float32Array(t*3),this.life=new Float32Array(t),this.maxLife=new Float32Array(t);for(let _=0;_<t;_++)this.positions[_*3+1]=-100;const l=document.createElement("canvas");l.width=64,l.height=64;const c=l.getContext("2d"),d=c.createRadialGradient(32,32,2,32,32,30);d.addColorStop(0,"rgba(255,255,255,0.85)"),d.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=d,c.fillRect(0,0,64,64);const h=new cg(l),p=new lg({size:o,map:h,transparent:!0,opacity:.5,depthWrite:!1,blending:Cc,color:this.color}),m=new Jt;m.setAttribute("position",new jn(this.positions,3)),this.points=new ME(m,p),this.points.frustumCulled=!1,e.add(this.points)}setColor(e){this.points.material.color.setHex(e)}spawn(e,t=12,i=.15,o=.7){for(let l=0;l<t;l++){const c=this.cursor;this.cursor=(this.cursor+1)%this.count,this.positions[c*3]=e.x+(Math.random()-.5)*i,this.positions[c*3+1]=e.y+Math.random()*.05,this.positions[c*3+2]=e.z+(Math.random()-.5)*i,this.velocities[c*3]=(Math.random()-.5)*.25,this.velocities[c*3+1]=o*(.6+Math.random()*.8),this.velocities[c*3+2]=(Math.random()-.5)*.25,this.life[c]=1,this.maxLife[c]=2.2+Math.random()*1.6}}update(e){const t=this.positions;for(let i=0;i<this.count;i++)this.life[i]<=0||(this.life[i]-=e/this.maxLife[i],t[i*3]+=this.velocities[i*3]*e,t[i*3+1]+=this.velocities[i*3+1]*e,t[i*3+2]+=this.velocities[i*3+2]*e,this.velocities[i*3+1]*=1-e*.15,this.life[i]<=0&&(t[i*3+1]=-100));this.points.geometry.getAttribute("position").needsUpdate=!0,this.points.material.opacity=.5}dispose(){this.points.geometry.dispose(),this.points.material.map?.dispose(),this.points.material.dispose(),this.points.parent?.remove(this.points)}}const Or=[{tK:300,rgb:[0,0,0]},{tK:500,rgb:[64,0,0]},{tK:750,rgb:[153,0,0]},{tK:1e3,rgb:[255,40,0]},{tK:1500,rgb:[255,128,24]},{tK:2e3,rgb:[255,190,76]},{tK:2500,rgb:[255,225,155]}];function k2(s){const e=Math.max(Or[0].tK,Math.min(Or[Or.length-1].tK,s));for(let t=0;t<Or.length-1;t++){const i=Or[t],o=Or[t+1];if(e>=i.tK&&e<=o.tK){const l=(e-i.tK)/(o.tK-i.tK);return[Math.round(i.rgb[0]+l*(o.rgb[0]-i.rgb[0])),Math.round(i.rgb[1]+l*(o.rgb[1]-i.rgb[1])),Math.round(i.rgb[2]+l*(o.rgb[2]-i.rgb[2]))]}}return Or[Or.length-1].rgb}function F2(s){const[e,t,i]=k2(s);return[e/255,t/255,i/255]}const Wn=[{id:1,name:"Quantum Cryo & Optics",color:5227511,x:-16},{id:2,name:"Silicon Foundry & Multi-Radix",color:16761095,x:-8},{id:3,name:"Full-Chip & Unified-Memory SoC",color:2541274,x:0},{id:4,name:"Failure Forensics Vault",color:16739674,x:8},{id:5,name:"Offline Physics Library",color:10473727,x:16}];class O2 extends Bi{constructor(e,t){super(),this.base=e,this.getOffsetY=t}getPoint(e,t=new I){const i=this.base.getPoint(e,t);return i.y+=this.getOffsetY(),i}}class Fc{constructor(e,t={}){this.callbacks=t,this.scene=e,this.buildFloor(),this.bay1=new R2,this.bay2=new P2,this.bay3=new L2,this.bay4=new D2,this.bay5=new I2;for(const i of Wn)this.bayCenters.push(new I(i.x,1.3,0));this.bay1.group.position.set(Wn[0].x,0,0),this.bay2.group.position.set(Wn[1].x,0,0),this.bay3.group.position.set(Wn[2].x,0,0),this.bay4.group.position.set(Wn[3].x,0,0),this.bay5.group.position.set(Wn[4].x,0,0),e.add(this.bay1.group,this.bay2.group,this.bay3.group,this.bay4.group,this.bay5.group),this.buildPedestals(),this.buildFlowSystem(),this.smokeDie=new y_(e,200,9082015,.26),this.smokeCryo=new y_(e,160,11195647,.3),this.registerThermalMeshes()}scene;bayCenters=[];bay1;bay2;bay3;bay4;bay5;flow;pedestals=[];raycaster=new HE;pointerNdc=new Pe;holoMeshes=[];flowIndexById=new Map;baselineActivity=[];thermal=new U2;smokeDie;smokeCryo;railTubeMat;static Q4_COLORS={0:4871528,"0.6":16751964,"1.2":16761963,"1.8":16769162};registerThermalMeshes(){const e=this.bay2.group.children.find(i=>i.name==="layer-met2");if(e){const i=e.children.find(o=>o.isMesh&&o.geometry?.type==="TubeGeometry");i&&(this.railTubeMat=i.material,Wn[1].x,this.thermal.register(i,()=>this.lastSnapshot?.temps?.traceC!=null?this.lastSnapshot.temps.traceC+273.15:300))}for(const i of this.bay3.tiles)this.thermal.register(i.thermalPlane,()=>(this.lastSnapshot?.temps?.tiles?.[i.id]??45)+273.15);const t=this.bay4.group.getObjectByName("dutChip");t&&this.thermal.register(t,()=>(this.lastSnapshot?.temps?.junctionC??27)+273.15)}lastSnapshot=null;applyPhysicsSnapshot(e){this.lastSnapshot=e;const t=e.nodes.vout_q4??0,i=[0,.6,1.2,1.8].reduce((d,h)=>Math.abs(h-t)<Math.abs(d-t)?h:d,0),l=Math.min(3,e.currents.RAIL/.36);if(this.setFlowActivity("vdd-met2",l,.35+l*.45,new $e(Fc.Q4_COLORS[String(i)]??16761963)),this.setFlowActivity("gnd-met3",l,.3+l*.4,new $e(Fc.Q4_COLORS[String(i)]??16761963)),this.railTubeMat){const d=(e.temps.traceC??27)+273.15;if(d>500){const[h,p,m]=F2(d);this.railTubeMat.emissive.setRGB(h,p,m),this.railTubeMat.emissiveIntensity=Math.min(2.4,(d-500)/700)}else this.railTubeMat.emissive.setHex(6967312),this.railTubeMat.emissiveIntensity=.4}e.temps.tiles&&this.bay3.setTileTemps(e.temps.tiles),this.bay1.setStageTemps([300,4,.1,e.temps.cryoK??.015]);const c=e.temps.cryoK>1.2||(e.vgsMax??0)>=1.95;this.bay4.setStatus(`SOA bench · VDD ${e.vdd.toFixed(2)} V · I ${Math.abs(e.currents.RAIL*1e3).toFixed(1)} mA`,c),this.thermal.update()}handleFaultFx(e){if(e.kind==="arc"){this.bay4.triggerArc();const t=new I(Wn[1].x+.6,this.bay2.layerY("met1")+.25,-.4),i=new Co(12573951,18,6,2);i.position.copy(t),this.scene.add(i),setTimeout(()=>this.scene.remove(i),450),this.bay4.applyCharDecal(),this.bay4.setShortedGate(!0)}else if(e.kind==="melt"){const t=new I(Wn[1].x,this.bay2.layerY("met2")+.2,-1.15);this.smokeDie.spawn(t,26,.25,.55)}else if(e.kind==="smoke"){const t=new I(Wn[2].x+1.2,.85,1.4);this.smokeDie.spawn(t,30,.4,.7)}else if(e.kind==="quench"){const t=new I(Wn[0].x,1,0);this.smokeCryo.spawn(t,40,.5,.9)}}setThermalView(e){this.thermal.setView(e)}applyReplaySample(e){this.applyPhysicsSnapshot(e)}clearFailureVisuals(){this.bay4.clearFailureState(),this.resetFlowToBaseline()}buildFloor(){const e=new be(new ws(80,46),fn.floor);e.rotation.x=-Math.PI/2,e.position.y=-.01,e.receiveShadow=!0,this.scene.add(e);const t=new GE(80,80,1981023,1120808);t.position.y=.005,this.scene.add(t);for(const i of[-12,-4,4,12]){const o=new be(new bt(.06,.015,40),new Ve({color:2240583,roughness:.8}));o.position.set(i,.01,0),this.scene.add(o)}}buildPedestals(){for(const e of Wn){const t=new be(new Qt(1.15,1.4,.22,36),new Ve({color:e.color,metalness:.65,roughness:.35,transparent:!0,opacity:.22}));t.position.set(e.x,.11,6.5),t.userData={bayId:e.id},t.name=`pedestal-${e.id}`,this.scene.add(t),this.pedestals.push(t);const i=pn(`${e.id} · ${e.name}`,{scale:.95,color:"#cfe2f7"});i.position.set(e.x,1.1,6.5),this.scene.add(i);const o=new Co(e.color,2.2,12,2);o.position.set(e.x,4.4,2.5),this.scene.add(o)}}buildFlowSystem(){this.flow=new rT(this.scene);const e=qn.semiconductor.parameters.sky130a.nominal_vdd_v,i=qn.semiconductor.parameters.sky130a.metal_stack.met2.sheet_resistance_ohm_per_sq*40,o=e/i;for(const l of this.bay2.flowCurves){const c=l.radix==="q4"?new $e(16761963):new $e(10473727),d=l.id==="vdd-met2"?"met2":"met3",h=new O2(l.curve,()=>this.bay2.getLayerOffsetY(d));this.flow.addPath({curve:h,color:c,nominalCurrent:o}),this.flowIndexById.set(l.id,this.flow.activityCount()-1),this.baselineActivity.push({speed:.75,brightness:.55})}for(const l of this.bay3.flowCurves)this.flow.addPath({curve:l.curve,color:new $e(7327999),nominalCurrent:.4}),this.flowIndexById.set(l.id,this.flow.activityCount()-1),this.baselineActivity.push({speed:.5,brightness:.4})}setFlowActivity(e,t,i,o){const l=this.flowIndexById.get(e);l!==void 0&&this.flow.setActivity(l,{speed:t,brightness:i,color:o})}resetFlowToBaseline(){let e=0;for(const[t]of this.flowIndexById){const i=this.baselineActivity[e]??{speed:.5,brightness:.4};this.flow.setActivity(e,{...i,color:t.includes("vdd")||t.startsWith("bus")?new $e(7327999):void 0}),e++}}pickBay(e,t,i){this.pointerNdc.set(e,t),this.raycaster.setFromCamera(this.pointerNdc,i);const o=this.raycaster.intersectObjects(this.pedestals,!1);return o.length>0?o[0].object.userData.bayId:null}setBay1Mode(e){this.bay1.setMode(e)}setLayerPeel(e,t){this.bay2.setPeelTargets(e?1:0,t)}setNpuAttached(e){this.bay3.setNpuAttached(e)}setSoCDisassembled(e){this.bay3.setDisassembled(e?1:0)}update(e,t,i){this.bay1.update(e,performance.now()*.001),this.bay2.update(e),this.bay3.update(e),this.bay4.update(e,performance.now()*.001),this.bay5.update(e,performance.now()*.001),this.smokeDie.update(e),this.smokeCryo.update(e),this.flow.update(e,1),this.pedestals.forEach((o,l)=>{o.position.y=.11+Math.sin(performance.now()*.001+l)*.012})}dispose(){this.flow.dispose()}}const ys={current:null},B2={activeBay:0,inspectorOpen:!1,bay1Mode:"fridge",peelMode:"assembled",peelDepth:0,npuAttached:!1,libraryOpen:!1,integrity:{verified:0,total:6,allVerified:!1,done:!1},fps:60,thermalView:!1,replayOpen:!1,toast:null,physics:null,forensic:null,autopsyOpen:!1,replayIndex:null,vddSlider:1.8,drivePowerMW:5,quantum:null,quantumExp:{running:!1,k:0,total:110,history:[],bundle:null,finalError:null},qecCurve:null,pulseParams:{amplitude:25,sigmaNs:7.5,beta:0}};class z2{state=B2;listeners=new Set;get(){return this.state}set(e){this.state={...this.state,...e};for(const t of this.listeners)t()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}}const dt=new z2;let ch;function Fi(s){dt.set({toast:s}),ch&&clearTimeout(ch),ch=setTimeout(()=>dt.set({toast:null}),2600)}class V2{worker=null;snapshotFns=new Set;failureFns=new Set;fxFns=new Set;latest=null;live=!0;ensure(){return this.worker||(this.worker=new Worker(new URL("/assets/physics.worker-CGYjBotI.js",import.meta.url),{type:"module"}),this.worker.onmessage=e=>{const t=e.data;if(t.type==="snapshot"){this.latest=t.snapshot,this.live=t.live;for(const i of this.snapshotFns)i(t.snapshot)}else if(t.type==="failure")for(const i of this.failureFns)i(t.report,t.replay,t.fix);else if(t.type==="faultFx")for(const i of this.fxFns)i(t.fx)}),this.worker}onSnapshot(e){return this.snapshotFns.add(e),()=>this.snapshotFns.delete(e)}onFailure(e){return this.failureFns.add(e),()=>this.failureFns.delete(e)}onFx(e){return this.fxFns.add(e),()=>this.fxFns.delete(e)}setParams(e){this.ensure().postMessage({type:"params",patch:e})}resume(){this.ensure().postMessage({type:"resume"})}reset(){this.ensure().postMessage({type:"reset"})}applyFix(e){this.ensure().postMessage({type:"applyFix",patch:e})}replaySample=null}const Rn=new V2;class H2{worker=null;stateFns=new Set;progressFns=new Set;doneFns=new Set;qecFns=new Set;ensure(){return this.worker||(this.worker=new Worker(new URL("/assets/quantum.worker-BlIgAruE.js",import.meta.url),{type:"module"}),this.worker.onmessage=e=>{const t=e.data;if(t.type==="state")for(const i of this.stateFns)i({bloch:t.bloch,gateFidelity:t.gateFidelity});else if(t.type==="experimentProgress")for(const i of this.progressFns)i(t.k,t.total,t.error);else if(t.type==="experimentDone")for(const i of this.doneFns)i(t.bundle);else if(t.type==="qecResult")for(const i of this.qecFns)i(t.curve,t.bitflip)}),this.worker}onState(e){return this.stateFns.add(e),()=>this.stateFns.delete(e)}onProgress(e){return this.progressFns.add(e),()=>this.progressFns.delete(e)}onDone(e){return this.doneFns.add(e),()=>this.doneFns.delete(e)}onQec(e){return this.qecFns.add(e),()=>this.qecFns.delete(e)}setParams(e){this.ensure().postMessage({type:"params",patch:e})}applyPulse(){this.ensure().postMessage({type:"applyPulse"})}reset(){this.ensure().postMessage({type:"reset"})}runExperiment(){this.ensure().postMessage({type:"experiment"})}runQecSweep(){this.ensure().postMessage({type:"qecSweep"})}runPhotonicCheck(){this.ensure().postMessage({type:"photonicCheck"})}}const Ei=new H2,nf={"01_fundamental_constants.json":"Fundamental constants (CODATA 2022)","02_semiconductor_pdk_silicon.json":"Semiconductor PDK & materials","03_multiradix_logic_baselines.json":"Multi-radix logic baselines","04_quantum_hardware_modalities.json":"Quantum hardware modalities","05_chip_architecture_benchmarks.json":"Chip architecture benchmarks","06_failure_physics_thresholds.json":"Failure physics thresholds"};function rf(s){return typeof s=="number"?Number.isInteger(s)?String(s):Math.abs(s)>=1e5||Math.abs(s)<.001&&s!==0?s.toExponential(3):String(Number(s.toPrecision(6))):Array.isArray(s)?s.map(e=>typeof e=="number"?rf(e):JSON.stringify(e)).join(", "):typeof s=="object"&&s!==null?JSON.stringify(s):String(s)}function gg(s,e,t,i){if(e==null)return;if(typeof e!="object"){i.push({file:s,title:nf[s]??s,path:t,valueText:rf(e),unit:"",note:""});return}const o=e;if("value"in o&&(typeof o.value=="number"||typeof o.value=="string")){i.push({file:s,title:nf[s]??s,path:t,valueText:rf(o.value),unit:typeof o.unit=="string"?o.unit:"",note:typeof o.note=="string"?o.note:""});return}for(const[c,d]of Object.entries(o))gg(s,d,t?`${t}.${c}`:c,i)}function G2(s){const e=[],t=[["01_fundamental_constants.json",s.constants],["02_semiconductor_pdk_silicon.json",s.semiconductor],["03_multiradix_logic_baselines.json",s.multiradix],["04_quantum_hardware_modalities.json",s.quantum],["05_chip_architecture_benchmarks.json",s.architecture],["06_failure_physics_thresholds.json",s.failures]];for(const[i,o]of t){const l=o;for(const c of["parameters","derived","failure_thresholds","valid_operating_envelope","material_properties","equations"])c in l&&gg(i,l[c],c,e);if(Array.isArray(l.equations))for(const c of l.equations)e.push({file:i,title:nf[i]??i,path:"equations",valueText:c,unit:"",note:""})}return e}const W2=()=>dt.get(),q2=s=>dt.subscribe(s);function X2({onClose:s}){const e=Pn.useSyncExternalStore(q2,W2).integrity,[t,i]=Pn.useState(""),o=Pn.useMemo(()=>G2(qn),[]),l=Pn.useMemo(()=>{if(!t.trim())return o;const c=t.toLowerCase();return o.filter(d=>d.path.toLowerCase().includes(c)||d.note.toLowerCase().includes(c)||d.valueText.toLowerCase().includes(c)||d.file.toLowerCase().includes(c)||d.title.toLowerCase().includes(c))},[o,t]);return j.jsxs("div",{style:{position:"absolute",top:0,left:0,width:480,height:"100%",background:"rgba(10,15,22,0.96)",borderRight:"1px solid #223042",zIndex:140,padding:18,boxSizing:"border-box",display:"flex",flexDirection:"column"},children:[j.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"baseline"},children:[j.jsx("h2",{style:{color:"#e8eef7",fontSize:16,margin:0},children:"Offline Physics Library"}),j.jsx("button",{onClick:s,style:{background:"none",border:"none",color:"#4e5d70",cursor:"pointer",fontSize:16},children:"✕"})]}),j.jsxs("div",{style:{marginTop:6,marginBottom:10,fontSize:12,color:e.allVerified?"#5fd48a":"#8ea1b8",fontFamily:"monospace"},children:[e.done?`SHA-256 ${e.verified}/${e.total} verified ${e.allVerified?"✓":"✗ INTEGRITY FAILURE"}`:"verifying…"," ","· provenance verified_offline_standard"]}),j.jsx("input",{autoFocus:!0,value:t,onChange:c=>i(c.target.value),placeholder:"Search constants, PDK params, thresholds… (e.g. 1.95, quench, sheet)",style:{background:"#101823",border:"1px solid #2a3a52",borderRadius:8,color:"#e8eef7",padding:"8px 10px",fontSize:13,marginBottom:12,outline:"none"}}),j.jsxs("div",{style:{flex:1,overflowY:"auto"},children:[l.length===0&&j.jsxs("div",{style:{color:"#4e5d70",fontSize:13},children:["No entries match “",t,"”."]}),l.map((c,d)=>j.jsxs("div",{style:{padding:"8px 10px",marginBottom:6,background:"rgba(22,30,42,0.55)",borderRadius:8,border:"1px solid #1c2838"},children:[j.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[j.jsx("span",{style:{color:"#9fb4cc",fontSize:11,fontFamily:"monospace"},children:c.path}),j.jsx("span",{style:{color:"#3f5068",fontSize:10},children:c.title})]}),j.jsxs("div",{style:{color:"#e8eef7",fontSize:13.5,marginTop:3,fontFamily:"monospace",wordBreak:"break-word"},children:[c.valueText,c.unit&&j.jsxs("span",{style:{color:"#6fd0ff"},children:[" ",c.unit]})]}),c.note&&j.jsx("div",{style:{color:"#6f8aa8",fontSize:11.5,marginTop:3,lineHeight:1.45},children:c.note})]},`${c.file}-${c.path}-${d}`))]}),j.jsxs("div",{style:{color:"#3f5068",fontSize:11,marginTop:8},children:[l.length," of ",o.length," entries · all data offline · no network fetch"]})]})}function j2({history:s}){const e=Pn.useRef(null);return Pn.useEffect(()=>{const t=e.current;if(!t)return;const i=t.getContext("2d");if(i.clearRect(0,0,t.width,t.height),i.fillStyle="#0a1218",i.fillRect(0,0,t.width,t.height),s.length<2)return;const o=Math.max(.01,...s.map(l=>l.error));i.strokeStyle="#62d0ff",i.lineWidth=2,i.beginPath(),s.forEach((l,c)=>{const d=c/(s.length-1)*(t.width-12)+6,h=t.height-8-l.error/o*(t.height-18);c===0?i.moveTo(d,h):i.lineTo(d,h)}),i.stroke(),i.fillStyle="#4e6a80",i.font="10px monospace",i.fillText(`error ${s[s.length-1].error.toFixed(4)}`,8,12)},[s]),j.jsx("canvas",{ref:e,width:280,height:90,style:{width:"100%",borderRadius:6,border:"1px solid #223042"}})}const dn={marginBottom:14,padding:"10px 12px",background:"rgba(22,30,42,0.6)",borderRadius:10,border:"1px solid #223042"},hn={color:"#8ea1b8",fontSize:11,marginBottom:6,letterSpacing:"0.06em"},ni=(s,e)=>({background:s?e:"transparent",color:s?"#0a0e14":"#8ea1b8",border:"1px solid #2a3a52",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:s?600:400,marginRight:6,marginBottom:6});function K2({bay:s,state:e,dispatch:t}){const i=e.physics;if(s===1){const o=["300 K","4 K","100 mK","15 mK"];return j.jsxs("div",{children:[j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"BAY 1 MODE"}),["fridge","mzi","tweezer"].map(l=>j.jsx("button",{style:ni(e.bay1Mode===l,"#4fc3f7"),onClick:()=>t({bay1Mode:l}),children:l==="fridge"?"Dilution refrigerator":l==="mzi"?"Photonic MZI chip":"Tweezer grid"},l))]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"CRYO STAGES (04 / 06 REFERENCE)"}),o.map(l=>j.jsxs("div",{style:{color:"#cfe2f7",fontSize:12.5,display:"flex",justifyContent:"space-between"},children:[j.jsx("span",{children:l}),j.jsx("span",{style:{color:"#4e5d70",fontFamily:"monospace"},children:l==="15 mK"?"Q_max 12 mW":l==="100 mK"?"Q_max 100 mW":l==="4 K"?"Q_max 1.5 W":"ambient"})]},l)),j.jsxs("div",{style:{color:e.physics&&e.physics.cryoK>1.2?"#ff9d7a":"#9fd8ff",fontSize:12.5,marginTop:6,fontFamily:"monospace"},children:["mixing chamber: ",i?(i.cryoK*1e3).toFixed(1):"15.0"," mK"]})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"MICROWAVE DRIVE LOAD (dT/dt = (Q_load − Q_cool)/C_th)"}),j.jsxs("div",{style:{color:"#8ea1b8",fontSize:11,marginBottom:6},children:["Q_load = ",e.drivePowerMW," mW · quench threshold 12 mW"]}),j.jsx("input",{type:"range",min:1,max:2e3,step:1,value:e.drivePowerMW,onChange:l=>{const c=parseInt(l.target.value);t({drivePowerMW:c}),Rn.setParams({drivePowerW:c/1e3})},style:{width:"100%",accentColor:"#4fc3f7"}}),j.jsx("div",{style:{color:"#6f8aa8",fontSize:11,marginTop:6,lineHeight:1.5},children:"Overdrive the 15 mK stage to trigger a real thermal quench — T₁/T₂ collapse across the die. Physical recovery in a real fridge ≈ 4 h."})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"TRANSMON (04 REFERENCE)"}),j.jsxs("div",{style:{color:"#6f8aa8",fontSize:11,lineHeight:1.5},children:["T₁ ≈ ",vc.t1_us.typical," µs · T₂ ≈ ",vc.t2_us.typical," µs · ZZ crosstalk ≈"," ",vc.zz_crosstalk_khz.typical," kHz · readout ",vc.readout_fidelity.typical]}),e.quantum&&j.jsxs("div",{style:{color:"#9fd8ff",fontSize:11.5,marginTop:6,fontFamily:"monospace"},children:[e.quantum.bloch.slice(0,2).map((l,c)=>j.jsxs("div",{children:["q",c,": ⟨Z⟩ ",l.z.toFixed(3)," · purity ",l.purity.toFixed(3)]},c)),e.quantum.gateFidelity!==null&&j.jsxs("div",{children:["last X-gate state fidelity: ",(e.quantum.gateFidelity*100).toFixed(1),"%"]})]})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"PULSE EDITOR (DRAG, 25 ns GATE)"}),j.jsxs("div",{style:{color:"#8ea1b8",fontSize:11},children:["amplitude ",e.pulseParams.amplitude," MHz"]}),j.jsx("input",{type:"range",min:5,max:40,step:.5,value:e.pulseParams.amplitude,onChange:l=>{const c=parseFloat(l.target.value);t({pulseParams:{...e.pulseParams,amplitude:c}}),Ei.setParams({pulse:{amplitude:c}})},style:{width:"100%",accentColor:"#4fc3f7"}}),j.jsxs("div",{style:{color:"#8ea1b8",fontSize:11},children:["σ ",e.pulseParams.sigmaNs," ns · DRAG β ",e.pulseParams.beta.toFixed(2)]}),j.jsx("input",{type:"range",min:3,max:12,step:.5,value:e.pulseParams.sigmaNs,onChange:l=>{const c=parseFloat(l.target.value);t({pulseParams:{...e.pulseParams,sigmaNs:c}}),Ei.setParams({pulse:{sigmaNs:c}})},style:{width:"100%",accentColor:"#4fc3f7"}}),j.jsx("input",{type:"range",min:0,max:1.5,step:.05,value:e.pulseParams.beta,onChange:l=>{const c=parseFloat(l.target.value);t({pulseParams:{...e.pulseParams,beta:c}}),Ei.setParams({pulse:{beta:c}})},style:{width:"100%",accentColor:"#4fc3f7"}}),j.jsxs("div",{style:{display:"flex",gap:6,marginTop:6},children:[j.jsx("button",{style:ni(!1,"#4fc3f7"),onClick:()=>{Ei.applyPulse(),ys.current?.bay1.setPulseLevel(1)},children:"Fire X pulse"}),j.jsx("button",{style:ni(!1,"#4fc3f7"),onClick:()=>Ei.reset(),children:"Reset qubits"})]})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"AI CO-INVENTOR — DISCOVERY EXPERIMENT"}),j.jsx("div",{style:{color:"#6f8aa8",fontSize:11,lineHeight:1.5,marginBottom:8},children:"Minimize X-gate error under real T₁/T₂ + ZZ crosstalk (fixed-seed SPSA → Nelder–Mead against the Lindblad solver). Reproducible: identical seed ⇒ identical trace."}),j.jsx(j2,{history:e.quantumExp.history}),j.jsxs("div",{style:{marginTop:8},children:[j.jsx("button",{style:ni(e.quantumExp.running,"#8ef0b2"),onClick:()=>{t({quantumExp:{running:!0,k:0,total:110,history:[],bundle:null,finalError:null}}),Ei.runExperiment(),Fi("AI Discovery Experiment running (seed 20241119)")},children:e.quantumExp.running?`Optimizing… ${e.quantumExp.k}/${e.quantumExp.total}`:"Run AI Discovery Experiment"}),e.quantumExp.finalError!==null&&j.jsxs("div",{style:{color:"#8ef0b2",fontSize:11.5,marginTop:6,fontFamily:"monospace"},children:["final error ",(e.quantumExp.finalError*100).toFixed(2),"% ·"," ",e.quantumExp.bundle?`fidelity ${((e.quantumExp.bundle.optimizedFidelity??0)*100).toFixed(1)}%`:""]}),e.quantumExp.bundle&&j.jsx("button",{style:{...ni(!1,"#8ef0b2"),marginTop:6},onClick:async()=>{const c={...e.quantumExp.bundle},d=new TextEncoder().encode(JSON.stringify(c)),h=await crypto.subtle.digest("SHA-256",d);c.sha256=Array.from(new Uint8Array(h)).map(v=>v.toString(16).padStart(2,"0")).join("");const p=new Blob([JSON.stringify(c,null,2)],{type:"application/json"}),m=URL.createObjectURL(p),_=document.createElement("a");_.href=m,_.download=`breakthrough-bundle-${c.seed}.json`,_.click(),setTimeout(()=>URL.revokeObjectURL(m),2e3),Fi("Reproducible Breakthrough Experiment Bundle exported (SIMULATED_NOISY_MODEL)")},children:"Export Breakthrough Bundle (JSON)"})]})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"QUANTUM ERROR CORRECTION"}),j.jsx("button",{style:ni(e.qecCurve!==null,"#ff6d8a"),onClick:()=>{Ei.runQecSweep(),Fi("QEC sweep: logical vs physical error (d3 segment + bit-flip code)")},children:"Run QEC sweep"}),e.qecCurve&&j.jsx("div",{style:{color:"#a9b8cc",fontSize:10.5,marginTop:6,fontFamily:"monospace",lineHeight:1.6},children:e.qecCurve.map(l=>j.jsxs("div",{children:["p ",(l.p*100).toFixed(0),"% → logical ",(l.logical*100).toFixed(2),"% (code) · ",(l.bitflip*100).toFixed(2),"% (d2)"]},l.p))})]})]})}return s===2?j.jsxs("div",{children:[j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"LIVE ELECTRO-THERMAL BENCH (MNA + HEAT PDE)"}),j.jsxs("div",{style:{color:"#cfe2f7",fontSize:12,fontFamily:"monospace",lineHeight:1.7},children:["VDD ",i?i.vdd.toFixed(2):"1.80"," V · V_out(Q4) ",i?i.voutQ4.toFixed(2):"—"," V",j.jsx("br",{}),"I_rail ",i?Math.abs(i.iRail*1e3).toFixed(1):"—"," mA · T_trace ",i?i.traceC.toFixed(0):"27"," °C",j.jsx("br",{}),"T_junction ",i?i.junctionC.toFixed(0):"27"," °C ",i?.melted?"· RAIL FUSED":""]}),j.jsx("div",{style:{color:"#8ea1b8",fontSize:11,marginTop:8,marginBottom:4},children:"Supply voltage VDD (SOA ceiling 1.95 V · nominal 1.80 V)"}),j.jsx("input",{type:"range",min:0,max:3.3,step:.01,value:e.vddSlider,onChange:o=>{const l=parseFloat(o.target.value);t({vddSlider:l}),Rn.setParams({vdd:l})},style:{width:"100%",accentColor:"#ffc107"}}),j.jsx("div",{style:{color:"#8ea1b8",fontSize:11,marginTop:8,marginBottom:4},children:"Q4 gate drive level"}),[0,.6,1.2,1.8].map(o=>j.jsxs("button",{style:ni(!1,"#ffc107"),onClick:()=>Rn.setParams({gateLevel:o}),children:[o," V"]},o)),j.jsx("div",{style:{color:"#8ea1b8",fontSize:11,marginTop:8,marginBottom:4},children:"Load resistance"}),[1e4,1e5,1e6].map(o=>j.jsx("button",{style:ni(!1,"#ffc107"),onClick:()=>Rn.setParams({loadR:o}),children:o>=1e6?"1 MΩ":`${o/1e3} kΩ`},o))]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"LAYER-PEEL SLICER (L)"}),j.jsx("button",{style:ni(e.peelMode==="exploded","#ffc107"),onClick:()=>t({peelMode:e.peelMode==="exploded"?"assembled":"exploded"}),children:e.peelMode==="exploded"?"Exploded stack":"Assembled stack"}),j.jsxs("div",{style:{color:"#8ea1b8",fontSize:11,marginTop:8},children:["Focal plane: layer ",e.peelDepth," / 12 (0 = met3 top · 11 = substrate)"]}),j.jsx("input",{type:"range",min:0,max:12,step:1,value:e.peelDepth,onChange:o=>t({peelDepth:parseInt(o.target.value)}),style:{width:"100%",accentColor:"#ffc107"}})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"VERIFIED SKY130A Q4 PRIMITIVES (PHASE 0)"}),tf.map(o=>j.jsxs("div",{style:{marginBottom:8},children:[j.jsx("div",{style:{color:"#ffd98a",fontSize:12.5,fontFamily:"monospace"},children:o.cell_name}),j.jsx("div",{style:{color:"#8ea1b8",fontSize:11},children:o.function}),j.jsxs("div",{style:{color:"#5fd48a",fontSize:10.5,fontFamily:"monospace"},children:[o.gate_count," gates · DRC=0 · LVS ✓ · PEX ✓"]})]},o.cell_name))]})]}):s===3?j.jsxs("div",{children:[j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"PACKAGE"}),j.jsx("button",{style:ni(e.npuAttached,"#b08cff"),onClick:()=>t({npuAttached:!e.npuAttached}),children:e.npuAttached?"NPU attached ✓":"Swap in multi-radix NPU"})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"TILE THERMAL ZONES (LIVE HEAT PDE)"}),j.jsx("div",{style:{color:"#cfe2f7",fontSize:12,fontFamily:"monospace",lineHeight:1.7},children:i&&i.pcbC!==void 0?`board max ${i.pcbC.toFixed(0)} °C (FR-4 delam 260 °C)`:"waiting for solver…"}),j.jsx("div",{style:{color:"#8ea1b8",fontSize:11,marginTop:8,marginBottom:4},children:"Tile power scale (push past 260 °C to trip delamination)"}),j.jsx("input",{type:"range",min:1,max:30,step:1,defaultValue:5,onChange:o=>{const l=parseInt(o.target.value)/10;Rn.setParams({tilePowerScale:l})},style:{width:"100%",accentColor:"#26c6da"}})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"TILE POWER MODEL (05 REFERENCE · P = C·V²·f)"}),j.jsxs("div",{style:{color:"#cfe2f7",fontSize:12,lineHeight:1.7},children:[j.jsxs("div",{children:["CPU Cluster — ",(qn.architecture.parameters.riscv_rv32im.power_mw_at_100mhz_130nm/1e3*8).toFixed(2)," W idle model"]}),j.jsxs("div",{children:["Systolic TPU 8×8 — ",(qn.architecture.parameters.systolic_array_tpu.power_w.tpu_v1*.08).toFixed(1)," W idle model"]}),j.jsxs("div",{children:["SIMT GPU — ",(qn.architecture.parameters.simt_gpu.power_w.intel_iris_xe_155u_tdp*.35).toFixed(1)," W idle model"]}),j.jsx("div",{children:"Unified Memory — 2.1 W idle model"})]})]})]}):s===4?j.jsxs("div",{children:[j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"SOA BREAKDOWN BENCH"}),j.jsxs("div",{style:{color:"#cfe2f7",fontSize:12.5,lineHeight:1.7},children:["SKY130 gate-oxide TDDB ceiling: ",j.jsx("b",{style:{color:"#ff9d7a"},children:"V_gs = 1.95 V"})," (E-model γ ≈ 300 dec/V). Push Bay 2's VDD slider past the ceiling — the vault records the failure, opens the Forensic Autopsy, and shows the slow-motion replay."]})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"RECOVERY"}),j.jsx("button",{style:ni(!1,"#ff9d5a"),onClick:()=>{Rn.reset(),ys.current?.clearFailureVisuals(),t({forensic:null,autopsyOpen:!1,replayIndex:null})},children:"Reset bench & clear faults"}),j.jsx("button",{style:ni(e.thermalView,"#ff5030"),onClick:()=>{const o=!e.thermalView;t({thermalView:o}),ys.current?.setThermalView(o)},children:"Thermal camera (T)"})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"ELECTRO-THERMAL ENGINE"}),j.jsx("div",{style:{color:"#6f8aa8",fontSize:11.5,lineHeight:1.6},children:"MNA (Shichman–Hodges + CLM, numeric Jacobian, source stepping) + 2D FTCS Fourier heat diffusion + threshold set from 06_failure_physics_thresholds.json. 240 Hz in a Web Worker."})]})]}):s===5?j.jsxs("div",{children:[j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"OFFLINE PHYSICS LIBRARY"}),j.jsx("div",{style:{color:"#cfe2f7",fontSize:12.5,marginBottom:8},children:e.integrity.done?e.integrity.allVerified?`All ${e.integrity.verified}/${e.integrity.total} datasets SHA-256 verified ✓`:`Integrity failure — ${e.integrity.verified}/${e.integrity.total} verified`:"Verifying SHA-256 integrity…"}),j.jsx("button",{style:ni(!0,"#9fd0ff"),onClick:()=>t({libraryOpen:!0}),children:"Browse library (key 5)"})]}),j.jsxs("div",{style:dn,children:[j.jsx("div",{style:hn,children:"PROVENANCE"}),j.jsxs("div",{style:{color:"#6f8aa8",fontSize:11,lineHeight:1.6,fontFamily:"monospace"},children:["manifest ",qn.manifest.format,j.jsx("br",{}),"generated ",qn.manifest.generatedAt.slice(0,10)]})]})]}):j.jsx("div",{style:{color:"#8ea1b8",fontSize:12.5,lineHeight:1.7},children:"Select a bay (1–5) or click a glowing pedestal. The Inspector Drawer opens per bay; Esc returns to the overview."})}const Y2="modulepreload",$2=function(s){return"/"+s},x_={},Q2=function(e,t,i){let o=Promise.resolve();if(t&&t.length>0){let c=function(p){return Promise.all(p.map(m=>Promise.resolve(m).then(_=>({status:"fulfilled",value:_}),_=>({status:"rejected",reason:_}))))};document.getElementsByTagName("link");const d=document.querySelector("meta[property=csp-nonce]"),h=d?.nonce||d?.getAttribute("nonce");o=c(t.map(p=>{if(p=$2(p),p in x_)return;x_[p]=!0;const m=p.endsWith(".css"),_=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${_}`))return;const v=document.createElement("link");if(v.rel=m?"stylesheet":Y2,m||(v.as="script"),v.crossOrigin="",v.href=p,h&&v.setAttribute("nonce",h),document.head.appendChild(v),m)return new Promise((S,M)=>{v.addEventListener("load",S),v.addEventListener("error",()=>M(new Error(`Unable to preload CSS for ${p}`)))})}))}function l(c){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=c,window.dispatchEvent(d),!d.defaultPrevented)throw c}return o.then(c=>{for(const d of c||[])d.status==="rejected"&&l(d.reason);return e().catch(l)})},J2=()=>dt.get(),Z2=s=>dt.subscribe(s);function eb({replay:s,scrub:e}){const t=Pn.useRef(null);return Pn.useEffect(()=>{const i=t.current;if(!i||s.length<2)return;const o=i.getContext("2d"),l=i.width,c=i.height;o.clearRect(0,0,l,c),o.fillStyle="#0a0f16",o.fillRect(0,0,l,c);const d=s[0].t,h=s[s.length-1].t||1e-6,p=[{key:"vgsMax",color:"#ff9d5c",label:"Vgs (V)",scale:1},{key:"vdd",color:"#6fd0ff",label:"VDD (V)",scale:1},{key:"iMax",color:"#ffd98a",label:"I ×100 mA",scale:100},{key:"tempMaxC",color:"#ff5030",label:"T (°C)",scale:1/40}],m=p.flatMap(v=>s.map(S=>(S[v.key]??0)*v.scale)),_=Math.max(1e-6,...m);o.strokeStyle="#16202e",o.lineWidth=1;for(let v=1;v<4;v++)o.beginPath(),o.moveTo(0,c*v/4),o.lineTo(l,c*v/4),o.stroke();for(const v of p)o.strokeStyle=v.color,o.lineWidth=2,o.beginPath(),s.forEach((S,M)=>{const E=(S.t-d)/(h-d)*l,x=c-8-(S[v.key]??0)*v.scale/_*(c-20);M===0?o.moveTo(E,x):o.lineTo(E,x)}),o.stroke();if(e!==null&&s[e]){const v=(s[e].t-d)/(h-d)*l;o.strokeStyle="#ffffff",o.setLineDash([4,4]),o.beginPath(),o.moveTo(v,0),o.lineTo(v,c),o.stroke(),o.setLineDash([])}o.font="11px monospace",p.forEach((v,S)=>{o.fillStyle=v.color,o.fillText(v.label,8+S*110,14)})},[s,e]),j.jsx("canvas",{ref:t,width:560,height:180,style:{width:"100%",borderRadius:8,border:"1px solid #223042"}})}function S_(s,e,t){const i=new Blob([e],{type:t}),o=URL.createObjectURL(i),l=document.createElement("a");l.href=o,l.download=s,l.click(),setTimeout(()=>URL.revokeObjectURL(o),2e3)}function tb(){const s=Pn.useSyncExternalStore(Z2,J2),e=s.forensic;if(!e||!s.autopsyOpen)return null;const t=e.report,i=e.replay,o=e.fix,l=s.replayIndex,c=()=>{o&&(Rn.applyFix(o.patch),o.patch.vddMaxV!==void 0&&dt.set({vddSlider:Math.min(s.vddSlider,o.patch.vddMaxV)}),dt.set({forensic:null,autopsyOpen:!1,replayIndex:null}),Rn.setParams({vdd:Math.min(s.vddSlider,o.patch.vddMaxV??s.vddSlider)}),Fi(`Fix applied: ${o.title} — re-running clean`))};return j.jsxs("div",{style:{position:"absolute",top:0,left:0,width:600,height:"100%",background:"rgba(16,10,10,0.96)",borderRight:"2px solid #7a2620",zIndex:150,padding:18,boxSizing:"border-box",overflowY:"auto"},children:[j.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"baseline"},children:[j.jsxs("h2",{style:{color:"#ff9d7a",fontSize:16,margin:0},children:["Forensic Autopsy — ",t.failure.type]}),j.jsx("button",{onClick:()=>dt.set({autopsyOpen:!1}),style:{background:"none",border:"none",color:"#8a5a50",cursor:"pointer",fontSize:16},children:"✕"})]}),j.jsxs("div",{style:{color:"#c9a29a",fontSize:12.5,marginTop:8,lineHeight:1.6},children:[j.jsx("b",{children:"Triggered:"})," ",t.failure.value," vs threshold ",t.failure.threshold,t.failure.node?j.jsxs(j.Fragment,{children:[" at ",j.jsx("code",{style:{color:"#ffd98a"},children:t.failure.node})]}):null,j.jsx("br",{}),j.jsx("b",{children:"Governing physics:"})," ",t.failure.governingEquation,j.jsx("br",{}),j.jsx("b",{children:"Finding:"})," ",t.failure.note]}),j.jsxs("div",{style:{marginTop:14},children:[j.jsxs("div",{style:{color:"#8ea1b8",fontSize:11,marginBottom:6},children:["SLOW-MOTION REPLAY — LAST 100 MS (",i.length," samples)"]}),j.jsx(eb,{replay:i,scrub:l}),j.jsx("input",{type:"range",min:0,max:i.length-1,step:1,value:l??i.length-1,onChange:d=>{const h=parseInt(d.target.value);dt.set({replayIndex:h}),Rn.replaySample=i[h],ys.current?.applyReplaySample(i[h])},style:{width:"100%",accentColor:"#ff9d5a",marginTop:8}}),j.jsxs("div",{style:{display:"flex",gap:8,marginTop:6},children:[j.jsx("button",{onClick:()=>{dt.set({replayIndex:null}),Rn.latest&&ys.current?.applyPhysicsSnapshot(Rn.latest)},style:yc,children:"Back to live"}),j.jsx("span",{style:{color:"#6f5a52",fontSize:11.5,alignSelf:"center"},children:l!==null&&i[l]?`t = ${i[l].t.toFixed(4)} s · VDD ${i[l].vdd?.toFixed(2)} V · Vgs ${i[l].vgsMax?.toFixed(2)} V · T ${i[l].tempMaxC?.toFixed(0)} °C`:"live (sim paused at failure)"})]})]}),j.jsxs("div",{style:{marginTop:14,display:"flex",gap:8},children:[j.jsx("button",{style:yc,onClick:()=>{S_(`forensic-${t.failure.type}-${Date.now()}.json`,JSON.stringify(t,null,2),"application/json"),Fi("JSON forensic report exported")},children:"Export JSON"}),j.jsx("button",{style:yc,onClick:async()=>{const{reportToMarkdown:d}=await Q2(async()=>{const{reportToMarkdown:h}=await import("./forensics-CqWqJAbW.js");return{reportToMarkdown:h}},[]);S_(`forensic-${t.failure.type}-${Date.now()}.md`,d(t),"text/markdown"),Fi("Markdown forensic report exported")},children:"Export Markdown"})]}),o&&j.jsxs("div",{style:{marginTop:14,padding:12,background:"rgba(40,52,40,0.5)",borderRadius:10,border:"1px solid #2e4430"},children:[j.jsxs("div",{style:{color:"#8ef0b2",fontSize:12.5,fontWeight:700},children:["AI Fix & Re-Test — ",o.title]}),j.jsx("div",{style:{color:"#a9c9b2",fontSize:12,marginTop:6,lineHeight:1.6},children:o.description}),j.jsxs("div",{style:{color:"#5f7a64",fontSize:10.5,marginTop:6,fontFamily:"monospace"},children:["source: ",o.source]}),j.jsx("button",{onClick:c,style:{...yc,marginTop:10,background:"#2e7d4f",color:"#fff",borderColor:"#3a9d64"},children:"Apply fix & re-run clean"})]}),j.jsx("div",{style:{color:"#6f5a52",fontSize:11,marginTop:16},children:"Simulation evidence only — not physical validation. Thresholds from 06_failure_physics_thresholds.json (SHA-256 verified)."})]})}const yc={background:"transparent",color:"#c9a29a",border:"1px solid #4a3028",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12};function nb(){return Pn.useSyncExternalStore(s=>dt.subscribe(s),()=>dt.get())}function ib(){const s=Pn.useRef(null),e=Pn.useRef(null),t=nb();Pn.useEffect(()=>{const l=s.current;if(!l)return;const c=tT(l),d=new Fc(c.scene,{onFps:y=>dt.set({fps:y})}),h=new iT(c.camera,c.renderer.domElement);h.pickHandler=(y,C)=>d.pickBay(y,C,c.camera),e.current={renderer:c,rig:h,world:d},ys.current=d,Rn.ensure(),Rn.onSnapshot(y=>{d.applyPhysicsSnapshot(y);const C=performance.now();C-v>100&&(v=C,dt.set({physics:{vdd:y.vdd,voutQ4:y.nodes.vout_q4??0,voutBin:y.nodes.vout_bin??0,iRail:y.currents.RAIL??0,traceC:y.temps.traceC??27,pcbC:y.temps.pcbC??27,junctionC:y.temps.junctionC??27,cryoK:y.temps.cryoK??.015,driveW:dt.get().drivePowerMW/1e3,melted:(y.temps.traceC??0)>=1085,shorted:(y.vgsMax??0)>=1.95,paused:!1}}))}),Rn.onFx(y=>d.handleFaultFx(y)),Rn.onFailure((y,C,b)=>{dt.set({forensic:{report:y,replay:C,fix:b},autopsyOpen:!0,replayIndex:null}),Fi(`FAILURE: ${y.failure.type} — forensic capture opened`)}),Rn.setParams({vdd:dt.get().vddSlider,drivePowerW:dt.get().drivePowerMW/1e3}),Ei.ensure(),Ei.onState(({bloch:y,gateFidelity:C})=>{y.forEach((b,P)=>d.bay1.setBlochState(P,b.x,b.y,b.z,b.purity)),dt.set({quantum:{bloch:y,gateFidelity:C}})}),Ei.onProgress((y,C,b)=>{const P=dt.get().quantumExp;dt.set({quantumExp:{...P,running:y<C,k:y,total:C,history:[...P.history,{k:y,error:b}]}})}),Ei.onDone(y=>{dt.set({quantumExp:{...dt.get().quantumExp,running:!1,bundle:y,finalError:1-y.optimizedFidelity}}),Fi(`Discovery complete: fidelity ${(y.optimizedFidelity*100).toFixed(1)}% (SIMULATED_NOISY_MODEL)`)}),A2().then(y=>{dt.set({integrity:{verified:y.verified,total:y.total,allVerified:y.allVerified,done:!0}})});const p=nT(c);let m=0,_=performance.now(),v=0,S=0,M=_;const E=new fg;function x(){m=requestAnimationFrame(x);const y=Math.min(E.getDelta(),.05);h.update(y),d.update(y,c.camera,0);const C=d.bay1;C.setPulseLevel(C.pulseBeamLevel*Math.exp(-y*6)),p(),c.render(y),S++;const b=performance.now();if(b-M>1e3){const P=Math.round(S*1e3/(b-M));dt.set({fps:P}),S=0,M=b}}return x(),()=>{cancelAnimationFrame(m),d.dispose(),c.dispose(),h.dispose(),e.current=null,ys.current=null}},[]),Pn.useEffect(()=>{const l=e.current;l&&(l.world.setBay1Mode(t.bay1Mode),l.world.setLayerPeel(t.peelMode==="exploded",t.peelDepth),l.world.setNpuAttached(t.npuAttached))},[t.bay1Mode,t.peelMode,t.peelDepth,t.npuAttached]),Pn.useEffect(()=>{const l=c=>{if(c.target instanceof HTMLInputElement||c.target instanceof HTMLTextAreaElement)return;const d=parseInt(c.key);if(d>=1&&d<=5){i(d);return}if(c.key==="Escape"){dt.set({activeBay:0,inspectorOpen:!1,libraryOpen:!1});const h=e.current;h&&h.rig.glideTo(new I(0,1.3,2),19)}if(c.key==="Tab"&&(c.preventDefault(),dt.set({inspectorOpen:!dt.get().inspectorOpen})),c.key.toLowerCase()==="l"){const h=dt.get().peelMode==="assembled"?"exploded":"assembled";dt.set({peelMode:h}),Fi(h==="exploded"?"Layer peel: exploded stack":"Layer peel: assembled")}if(c.key.toLowerCase()==="t"){const h=!dt.get().thermalView;dt.set({thermalView:h}),e.current?.world.setThermalView(h),Fi(h?"Thermal camera ON — Planck/CIE blackbody ramp":"Thermal camera OFF")}};return window.addEventListener("keydown",l),()=>window.removeEventListener("keydown",l)},[]);function i(l){const c=e.current;if(dt.set({activeBay:l,inspectorOpen:!0,libraryOpen:l===5?dt.get().libraryOpen:!1}),c){const d=c.world.bayCenters[l-1],h=l===2?9.5:l===3?12:9;c.rig.glideTo(d,h)}}const o=Wn.find(l=>l.id===t.activeBay);return j.jsxs("div",{style:{width:"100vw",height:"100vh",position:"relative",overflow:"hidden"},children:[j.jsx("div",{ref:s,style:{position:"absolute",inset:0}}),j.jsxs("div",{style:{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,background:"rgba(8,12,18,0.82)",borderRadius:22,padding:"5px 12px",border:"1px solid #223042",zIndex:100,backdropFilter:"blur(6px)"},children:[Wn.map(l=>j.jsx("button",{onClick:()=>i(l.id),style:{background:t.activeBay===l.id?l.color:"transparent",color:t.activeBay===l.id?"#0a0e14":"#8ea1b8",border:"none",borderRadius:15,padding:"3px 11px",cursor:"pointer",fontWeight:t.activeBay===l.id?700:400,fontSize:13},title:l.name,children:l.id},l.id)),j.jsx("span",{style:{color:"#3a4a5f",margin:"0 4px"},children:"|"}),j.jsxs("span",{style:{color:t.fps>=55?"#5fd48a":t.fps>=42?"#f0c94f":"#f07a4f",fontWeight:700,fontSize:12,alignSelf:"center",fontVariantNumeric:"tabular-nums"},children:[t.fps," FPS"]}),j.jsx("span",{style:{color:t.integrity.allVerified?"#5fd48a":"#4e5d70",fontSize:11,alignSelf:"center",marginLeft:6,fontFamily:"monospace"},title:"SHA-256 verified reference datasets",children:t.integrity.done?`SHA-256 ${t.integrity.verified}/${t.integrity.total}${t.integrity.allVerified?" ✓":" ✗"}`:"SHA-256 …"})]}),j.jsx("div",{style:{position:"absolute",bottom:10,left:12,color:"#4e5d70",fontSize:11.5,fontFamily:"monospace",zIndex:100,userSelect:"none"},children:"1–5 bays · L layer peel · T thermal · Tab inspector · Esc overview · drag orbit · WASD pan"}),t.toast&&j.jsx("div",{style:{position:"absolute",bottom:38,left:"50%",transform:"translateX(-50%)",background:"rgba(8,12,18,0.9)",border:"1px solid #223042",color:"#cfe2f7",padding:"6px 14px",borderRadius:12,fontSize:13,zIndex:120},children:t.toast}),j.jsxs("div",{style:{position:"absolute",top:0,right:0,width:320,height:"100%",background:"rgba(13,18,26,0.94)",borderLeft:"1px solid #223042",transform:t.inspectorOpen?"translateX(0)":"translateX(100%)",transition:"transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",padding:16,zIndex:90,overflowY:"auto",boxSizing:"border-box"},children:[j.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10},children:[j.jsx("h3",{style:{color:"#e8eef7",margin:0,fontSize:15},children:o?o.name:"Inspector"}),j.jsx("button",{onClick:()=>dt.set({inspectorOpen:!1}),style:{background:"none",border:"none",color:"#4e5d70",cursor:"pointer",fontSize:16},title:"Close (Tab)",children:"✕"})]}),j.jsx(K2,{bay:t.activeBay,state:t,dispatch:l=>dt.set(l)})]}),t.libraryOpen&&j.jsx(X2,{onClose:()=>dt.set({libraryOpen:!1})}),j.jsx(tb,{}),t.physics&&j.jsxs("div",{style:{position:"absolute",bottom:10,right:12,color:"#4e5d70",fontSize:11,fontFamily:"monospace",zIndex:100,textAlign:"right",userSelect:"none"},children:["VDD ",t.physics.vdd.toFixed(2)," V · V",j.jsx("sub",{children:"out"}),"(Q4) ",t.physics.voutQ4.toFixed(2)," V · I"," ",Math.abs(t.physics.iRail*1e3).toFixed(1)," mA · T",j.jsx("sub",{children:"trace"})," ",t.physics.traceC.toFixed(0)," °C",(t.physics.shorted||t.physics.melted)&&j.jsx("span",{style:{color:"#ff9d7a"},children:" · FAULT"})]})]})}ay.createRoot(document.getElementById("root")).render(j.jsx(ey.StrictMode,{children:j.jsx(ib,{})}));
