import{noChange as e,_Σ as t}from"./lit-html.js";import{PartType as r}from"./directive.js";import{isPrimitive as n,isTemplateResult as o,isSingleExpression as l}from"./directive-helpers.js";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{tt:i,it:a,st:s,et:c,ht:d}=t,p=(e,t,r={})=>{if(void 0!==t._$litPart$)throw Error("container already contains a live render");let n,o;const l=[],i=document.createTreeWalker(t,NodeFilter.SHOW_COMMENT,null,!1);let a;for(;null!==(a=i.nextNode());){const t=a.data;if(t.startsWith("lit-part")){if(0===l.length&&void 0!==n)throw Error("there must be only one root part per container");o=f(e,a,l,r),null!=n||(n=o)}else if(t.startsWith("lit-node")){u(a,l,r);const e=a.parentElement;e.hasAttribute("defer-hydration")&&e.removeAttribute("defer-hydration")}else if(t.startsWith("/lit-part")){if(1===l.length&&o!==n)throw Error("internal error");o=h(a,o,l)}}console.assert(void 0!==n,"there should be exactly one root part in a render container"),t._$litPart$=n},f=(t,r,l,d)=>{let p,f;if(0===l.length)f=new c(r,null,void 0,d),p=t;else{const e=l[l.length-1];if("template-instance"===e.type)f=new c(r,null,e.instance,d),e.instance.l.push(f),p=e.result.values[e.instancePartIndex++],e.templatePartIndex++;else if("iterable"===e.type){f=new c(r,null,e.part,d);const t=e.iterator.next();if(t.done)throw p=void 0,e.done=!0,Error("Unhandled shorter than expected iterable");p=t.value,e.part.H.push(f)}else f=new c(r,null,e.part,d)}if(p=s(f,p),p===e)l.push({part:f,type:"leaf"});else if(n(p))l.push({part:f,type:"leaf"}),f.H=p;else if(o(p)){const e="lit-part "+m(p);if(r.data!==e)throw Error("Hydration value mismatch: Unexpected TemplateResult rendered to part");{const e=c.prototype.C(p),t=new i(e,f);l.push({type:"template-instance",instance:t,part:f,templatePartIndex:0,instancePartIndex:0,result:p}),f.H=t}}else a(p)?(l.push({part:f,type:"iterable",value:p,iterator:p[Symbol.iterator](),done:!1}),f.H=[]):(l.push({part:f,type:"leaf"}),f.H=null==p?"":p);return f},h=(e,t,r)=>{if(void 0===t)throw Error("unbalanced part marker");t.B=e;const n=r.pop();if("iterable"===n.type&&!n.iterator.next().done)throw Error("unexpected longer than expected iterable");if(r.length>0)return r[r.length-1].part},u=(e,t,n)=>{var o;const i=/lit-node (\d+)/.exec(e.data),a=parseInt(i[1]),c=null!==(o=e.previousSibling)&&void 0!==o?o:e.parentElement,p=t[t.length-1];if("template-instance"!==p.type)throw Error("internal error");{const e=p.instance;for(;;){const t=e.D.parts[p.templatePartIndex];if(void 0===t||t.type!==r.ATTRIBUTE&&t.type!==r.ELEMENT||t.index!==a)break;if(t.type===r.ATTRIBUTE){const o=new t.ctor(c,t.name,t.strings,p.instance,n),i=l(o)?p.result.values[p.instancePartIndex]:p.result.values,a=!(o.type===r.EVENT||o.type===r.PROPERTY);o.I(i,o,p.instancePartIndex,a),p.instancePartIndex+=t.strings.length-1,e.l.push(o)}else{const t=new d(c,p.instance,n);s(t,p.result.values[p.instancePartIndex++]),e.l.push(t)}p.templatePartIndex++}}},m=e=>{const t=new Uint32Array(2).fill(5381);for(const r of e.strings)for(let e=0;e<r.length;e++)t[e%2]=33*t[e%2]^r.charCodeAt(e);return btoa(String.fromCharCode(...new Uint8Array(t.buffer)))};export{m as digestForTemplateResult,p as hydrate};
//# sourceMappingURL=experimental-hydrate.js.map
