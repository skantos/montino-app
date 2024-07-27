/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */const f={};/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */function o(e){return Object.isFrozen(e)&&Object.isFrozen(e.raw)}function c(e){return e.toString().indexOf("`")===-1}c(e=>e``)||c(e=>e`\0`)||c(e=>e`\n`)||c(e=>e`\u0000`);o``&&o`\0`&&o`\n`&&o`\u0000`;/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */let l="google#safe";function p(){if(typeof window<"u")return window.trustedTypes}function d(){var e;return l!==""&&(e=p())!==null&&e!==void 0?e:null}let i;function v(){var e,n;if(i===void 0)try{i=(n=(e=d())===null||e===void 0?void 0:e.createPolicy(l,{createHTML:r=>r,createScript:r=>r,createScriptURL:r=>r}))!==null&&n!==void 0?n:null}catch{i=null}return i}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */class a{constructor(n,r){this.privateDoNotAccessOrElseWrappedResourceUrl=n}toString(){return this.privateDoNotAccessOrElseWrappedResourceUrl.toString()}}function s(e){var n;const r=e,t=(n=v())===null||n===void 0?void 0:n.createScriptURL(r);return t??new a(r,f)}function w(e){var n;if(!((n=d())===null||n===void 0)&&n.isScriptURL(e))return e;if(e instanceof a)return e.privateDoNotAccessOrElseWrappedResourceUrl;{let r="";throw new Error(r)}}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */function R(e,...n){if(n.length===0)return s(e[0]);e[0].toLowerCase();let r=e[0];for(let t=0;t<n.length;t++)r+=encodeURIComponent(n[t])+e[t+1];return s(r)}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */function g(e){return y("script",e)}function y(e,n){var r;const t=n.document,u=(r=t.querySelector)===null||r===void 0?void 0:r.call(t,`${e}[nonce]`);return u&&(u.nonce||u.getAttribute("nonce"))||""}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */function U(e){const n=e.ownerDocument&&e.ownerDocument.defaultView,r=g(n||window);r&&e.setAttribute("nonce",r)}function S(e,n,r){e.src=w(n),U(e)}export{S as s,R as t};
