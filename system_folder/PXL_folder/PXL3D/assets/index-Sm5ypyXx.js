(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const oa="174",Et={ROTATE:0,DOLLY:1,PAN:2},bi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},xh=0,Oa=1,yh=2,_c=1,Mh=2,Tn=3,Pn=0,Bt=1,Ft=2,Hn=0,wi=1,Fa=2,Ba=3,za=4,vh=5,ni=100,Eh=101,Sh=102,bh=103,Th=104,Ah=200,wh=201,Rh=202,Ch=203,lo=204,co=205,Ph=206,Ih=207,Lh=208,Dh=209,Nh=210,Uh=211,Oh=212,Fh=213,Bh=214,ho=0,uo=1,fo=2,Di=3,po=4,mo=5,go=6,_o=7,xc=0,zh=1,kh=2,Vn=0,Gh=1,Hh=2,Vh=3,yc=4,Wh=5,Xh=6,Yh=7,ka="attached",$h="detached",Mc=300,Ni=301,Ui=302,xo=303,yo=304,gr=306,un=1e3,kn=1001,hr=1002,Tt=1003,vc=1004,rs=1005,Vt=1006,er=1007,rn=1008,In=1009,Ec=1010,Sc=1011,hs=1012,aa=1013,si=1014,on=1015,ps=1016,la=1017,ca=1018,Oi=1020,bc=35902,Tc=1021,Ac=1022,Zt=1023,wc=1024,Rc=1025,Ri=1026,Fi=1027,ha=1028,da=1029,Cc=1030,ua=1031,fa=1033,tr=33776,nr=33777,ir=33778,sr=33779,Mo=35840,vo=35841,Eo=35842,So=35843,bo=36196,To=37492,Ao=37496,wo=37808,Ro=37809,Co=37810,Po=37811,Io=37812,Lo=37813,Do=37814,No=37815,Uo=37816,Oo=37817,Fo=37818,Bo=37819,zo=37820,ko=37821,rr=36492,Go=36494,Ho=36495,Pc=36283,Vo=36284,Wo=36285,Xo=36286,ds=2300,us=2301,br=2302,Ga=2400,Ha=2401,Va=2402,jh=2500,qh=0,Ic=1,Yo=2,Kh=3200,Zh=3201,Lc=0,Jh=1,zn="",mt="srgb",Dt="srgb-linear",dr="linear",Qe="srgb",ci=7680,Wa=519,Qh=512,ed=513,td=514,Dc=515,nd=516,id=517,sd=518,rd=519,$o=35044,Xa="300 es",Rn=2e3,ur=2001;class oi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}}const wt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Ya=1234567;const Ci=Math.PI/180,Bi=180/Math.PI;function ln(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(wt[s&255]+wt[s>>8&255]+wt[s>>16&255]+wt[s>>24&255]+"-"+wt[e&255]+wt[e>>8&255]+"-"+wt[e>>16&15|64]+wt[e>>24&255]+"-"+wt[t&63|128]+wt[t>>8&255]+"-"+wt[t>>16&255]+wt[t>>24&255]+wt[n&255]+wt[n>>8&255]+wt[n>>16&255]+wt[n>>24&255]).toLowerCase()}function Ue(s,e,t){return Math.max(e,Math.min(t,s))}function pa(s,e){return(s%e+e)%e}function od(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function ad(s,e,t){return s!==e?(t-s)/(e-s):0}function as(s,e,t){return(1-t)*s+t*e}function ld(s,e,t,n){return as(s,e,1-Math.exp(-t*n))}function cd(s,e=1){return e-Math.abs(pa(s,e*2)-e)}function hd(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function dd(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function ud(s,e){return s+Math.floor(Math.random()*(e-s+1))}function fd(s,e){return s+Math.random()*(e-s)}function pd(s){return s*(.5-Math.random())}function md(s){s!==void 0&&(Ya=s);let e=Ya+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function gd(s){return s*Ci}function _d(s){return s*Bi}function xd(s){return(s&s-1)===0&&s!==0}function yd(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Md(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function vd(s,e,t,n,i){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*h,l*u,l*d,a*c);break;case"YZY":s.set(l*d,a*h,l*u,a*c);break;case"ZXZ":s.set(l*u,l*d,a*h,a*c);break;case"XZX":s.set(a*h,l*g,l*f,a*c);break;case"YXY":s.set(l*f,a*h,l*g,a*c);break;case"ZYZ":s.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function sn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Ze(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const dn={DEG2RAD:Ci,RAD2DEG:Bi,generateUUID:ln,clamp:Ue,euclideanModulo:pa,mapLinear:od,inverseLerp:ad,lerp:as,damp:ld,pingpong:cd,smoothstep:hd,smootherstep:dd,randInt:ud,randFloat:fd,randFloatSpread:pd,seededRandom:md,degToRad:gd,radToDeg:_d,isPowerOfTwo:xd,ceilPowerOfTwo:yd,floorPowerOfTwo:Md,setQuaternionFromProperEuler:vd,normalize:Ze,denormalize:sn};class Ee{constructor(e=0,t=0){Ee.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ue(this.x,e.x,t.x),this.y=Ue(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ue(this.x,e,t),this.y=Ue(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ue(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ue(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Le{constructor(e,t,n,i,r,o,a,l,c){Le.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c)}set(e,t,n,i,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],_=i[0],m=i[3],p=i[6],M=i[1],y=i[4],x=i[7],C=i[2],T=i[5],R=i[8];return r[0]=o*_+a*M+l*C,r[3]=o*m+a*y+l*T,r[6]=o*p+a*x+l*R,r[1]=c*_+h*M+u*C,r[4]=c*m+h*y+u*T,r[7]=c*p+h*x+u*R,r[2]=d*_+f*M+g*C,r[5]=d*m+f*y+g*T,r[8]=d*p+f*x+g*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+i*r*c-i*o*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,g=t*u+n*d+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(i*c-h*n)*_,e[2]=(a*n-i*o)*_,e[3]=d*_,e[4]=(h*t-i*l)*_,e[5]=(i*r-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Tr.makeScale(e,t)),this}rotate(e){return this.premultiply(Tr.makeRotation(-e)),this}translate(e,t){return this.premultiply(Tr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Tr=new Le;function Nc(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function fs(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Ed(){const s=fs("canvas");return s.style.display="block",s}const $a={};function ei(s){s in $a||($a[s]=!0,console.warn(s))}function Sd(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function bd(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Td(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const ja=new Le().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),qa=new Le().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ad(){const s={enabled:!0,workingColorSpace:Dt,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Qe&&(i.r=Cn(i.r),i.g=Cn(i.g),i.b=Cn(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Qe&&(i.r=Pi(i.r),i.g=Pi(i.g),i.b=Pi(i.b))),i},fromWorkingColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},toWorkingColorSpace:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===zn?dr:this.spaces[i].transfer},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Dt]:{primaries:e,whitePoint:n,transfer:dr,toXYZ:ja,fromXYZ:qa,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:mt},outputColorSpaceConfig:{drawingBufferColorSpace:mt}},[mt]:{primaries:e,whitePoint:n,transfer:Qe,toXYZ:ja,fromXYZ:qa,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:mt}}}),s}const He=Ad();function Cn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Pi(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let hi;class wd{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{hi===void 0&&(hi=fs("canvas")),hi.width=e.width,hi.height=e.height;const n=hi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=hi}return t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=fs("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Cn(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Cn(t[n]/255)*255):t[n]=Cn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Rd=0;class ma{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Rd++}),this.uuid=ln(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Ar(i[o].image)):r.push(Ar(i[o]))}else r=Ar(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function Ar(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?wd.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Cd=0;class xt extends oi{constructor(e=xt.DEFAULT_IMAGE,t=xt.DEFAULT_MAPPING,n=kn,i=kn,r=Vt,o=rn,a=Zt,l=In,c=xt.DEFAULT_ANISOTROPY,h=zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Cd++}),this.uuid=ln(),this.name="",this.source=new ma(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ee(0,0),this.repeat=new Ee(1,1),this.center=new Ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Le,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Mc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case un:e.x=e.x-Math.floor(e.x);break;case kn:e.x=e.x<0?0:1;break;case hr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case un:e.y=e.y-Math.floor(e.y);break;case kn:e.y=e.y<0?0:1;break;case hr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}xt.DEFAULT_IMAGE=null;xt.DEFAULT_MAPPING=Mc;xt.DEFAULT_ANISOTROPY=1;class $e{constructor(e=0,t=0,n=0,i=1){$e.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,x=(f+1)/2,C=(p+1)/2,T=(h+d)/4,R=(u+_)/4,P=(g+m)/4;return y>x&&y>C?y<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(y),i=T/n,r=R/n):x>C?x<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(x),n=T/i,r=P/i):C<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(C),n=R/r,i=P/r),this.set(n,i,r,t),this}let M=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(u-_)/M,this.z=(d-h)/M,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ue(this.x,e.x,t.x),this.y=Ue(this.y,e.y,t.y),this.z=Ue(this.z,e.z,t.z),this.w=Ue(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ue(this.x,e,t),this.y=Ue(this.y,e,t),this.z=Ue(this.z,e,t),this.w=Ue(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ue(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Pd extends oi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new $e(0,0,e,t),this.scissorTest=!1,this.viewport=new $e(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Vt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new xt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new ma(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ri extends Pd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Uc extends xt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Tt,this.minFilter=Tt,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Id extends xt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Tt,this.minFilter=Tt,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class pn{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==d||c!==f||h!==g){let m=1-a;const p=l*d+c*f+h*g+u*_,M=p>=0?1:-1,y=1-p*p;if(y>Number.EPSILON){const C=Math.sqrt(y),T=Math.atan2(C,p*M);m=Math.sin(m*T)/C,a=Math.sin(a*T)/C}const x=a*M;if(l=l*m+d*x,c=c*m+f*x,h=h*m+g*x,u=u*m+_*x,m===1-a){const C=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=C,c*=C,h*=C,u*=C}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,o){const a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*f-c*d,e[t+1]=l*g+h*d+c*u-a*f,e[t+2]=c*g+h*f+a*d-l*u,e[t+3]=h*g-a*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),u=a(r/2),d=l(n/2),f=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-i)*f}else if(n>a&&n>u){const f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-a);this._w=(o-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ue(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+i*c-r*l,this._y=i*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+i*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class A{constructor(e=0,t=0,n=0){A.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ka.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ka.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*i-a*n),h=2*(a*t-r*i),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=i+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ue(this.x,e.x,t.x),this.y=Ue(this.y,e.y,t.y),this.z=Ue(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ue(this.x,e,t),this.y=Ue(this.y,e,t),this.z=Ue(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ue(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return wr.copy(this).projectOnVector(e),this.sub(wr)}reflect(e){return this.sub(wr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ue(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const wr=new A,Ka=new pn;class pt{constructor(e=new A(1/0,1/0,1/0),t=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(en.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(en.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=en.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,en):en.fromBufferAttribute(r,o),en.applyMatrix4(e.matrixWorld),this.expandByPoint(en);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ss.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ss.copy(n.boundingBox)),Ss.applyMatrix4(e.matrixWorld),this.union(Ss)}const i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,en),en.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ki),bs.subVectors(this.max,Ki),di.subVectors(e.a,Ki),ui.subVectors(e.b,Ki),fi.subVectors(e.c,Ki),Ln.subVectors(ui,di),Dn.subVectors(fi,ui),$n.subVectors(di,fi);let t=[0,-Ln.z,Ln.y,0,-Dn.z,Dn.y,0,-$n.z,$n.y,Ln.z,0,-Ln.x,Dn.z,0,-Dn.x,$n.z,0,-$n.x,-Ln.y,Ln.x,0,-Dn.y,Dn.x,0,-$n.y,$n.x,0];return!Rr(t,di,ui,fi,bs)||(t=[1,0,0,0,1,0,0,0,1],!Rr(t,di,ui,fi,bs))?!1:(Ts.crossVectors(Ln,Dn),t=[Ts.x,Ts.y,Ts.z],Rr(t,di,ui,fi,bs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,en).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(en).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(yn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),yn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),yn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),yn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),yn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),yn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),yn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),yn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(yn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const yn=[new A,new A,new A,new A,new A,new A,new A,new A],en=new A,Ss=new pt,di=new A,ui=new A,fi=new A,Ln=new A,Dn=new A,$n=new A,Ki=new A,bs=new A,Ts=new A,jn=new A;function Rr(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){jn.fromArray(s,r);const a=i.x*Math.abs(jn.x)+i.y*Math.abs(jn.y)+i.z*Math.abs(jn.z),l=e.dot(jn),c=t.dot(jn),h=n.dot(jn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Ld=new pt,Zi=new A,Cr=new A;class mn{constructor(e=new A,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Ld.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Zi.subVectors(e,this.center);const t=Zi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Zi,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Cr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Zi.copy(e.center).add(Cr)),this.expandByPoint(Zi.copy(e.center).sub(Cr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Mn=new A,Pr=new A,As=new A,Nn=new A,Ir=new A,ws=new A,Lr=new A;class Xi{constructor(e=new A,t=new A(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Mn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Mn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Mn.copy(this.origin).addScaledVector(this.direction,t),Mn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Pr.copy(e).add(t).multiplyScalar(.5),As.copy(t).sub(e).normalize(),Nn.copy(this.origin).sub(Pr);const r=e.distanceTo(t)*.5,o=-this.direction.dot(As),a=Nn.dot(this.direction),l=-Nn.dot(As),c=Nn.lengthSq(),h=Math.abs(1-o*o);let u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const _=1/h;u*=_,d*=_,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Pr).addScaledVector(As,d),f}intersectSphere(e,t){Mn.subVectors(e.center,this.origin);const n=Mn.dot(this.direction),i=Mn.dot(Mn)-n*n,r=e.radius*e.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Mn)!==null}intersectTriangle(e,t,n,i,r){Ir.subVectors(t,e),ws.subVectors(n,e),Lr.crossVectors(Ir,ws);let o=this.direction.dot(Lr),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Nn.subVectors(this.origin,e);const l=a*this.direction.dot(ws.crossVectors(Nn,ws));if(l<0)return null;const c=a*this.direction.dot(Ir.cross(Nn));if(c<0||l+c>o)return null;const h=-a*Nn.dot(Lr);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Pe{constructor(e,t,n,i,r,o,a,l,c,h,u,d,f,g,_,m){Pe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c,h,u,d,f,g,_,m)}set(e,t,n,i,r,o,a,l,c,h,u,d,f,g,_,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Pe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/pi.setFromMatrixColumn(e,0).length(),r=1/pi.setFromMatrixColumn(e,1).length(),o=1/pi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*h,f=l*u,g=c*h,_=c*u;t[0]=d+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*h,f=l*u,g=c*h,_=c*u;t[0]=d-_*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=_-d*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=d-_*u}else if(e.order==="XZY"){const d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Dd,e,Nd)}lookAt(e,t,n){const i=this.elements;return kt.subVectors(e,t),kt.lengthSq()===0&&(kt.z=1),kt.normalize(),Un.crossVectors(n,kt),Un.lengthSq()===0&&(Math.abs(n.z)===1?kt.x+=1e-4:kt.z+=1e-4,kt.normalize(),Un.crossVectors(n,kt)),Un.normalize(),Rs.crossVectors(kt,Un),i[0]=Un.x,i[4]=Rs.x,i[8]=kt.x,i[1]=Un.y,i[5]=Rs.y,i[9]=kt.y,i[2]=Un.z,i[6]=Rs.z,i[10]=kt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],M=n[3],y=n[7],x=n[11],C=n[15],T=i[0],R=i[4],P=i[8],S=i[12],v=i[1],I=i[5],B=i[9],O=i[13],V=i[2],W=i[6],F=i[10],K=i[14],z=i[3],se=i[7],he=i[11],xe=i[15];return r[0]=o*T+a*v+l*V+c*z,r[4]=o*R+a*I+l*W+c*se,r[8]=o*P+a*B+l*F+c*he,r[12]=o*S+a*O+l*K+c*xe,r[1]=h*T+u*v+d*V+f*z,r[5]=h*R+u*I+d*W+f*se,r[9]=h*P+u*B+d*F+f*he,r[13]=h*S+u*O+d*K+f*xe,r[2]=g*T+_*v+m*V+p*z,r[6]=g*R+_*I+m*W+p*se,r[10]=g*P+_*B+m*F+p*he,r[14]=g*S+_*O+m*K+p*xe,r[3]=M*T+y*v+x*V+C*z,r[7]=M*R+y*I+x*W+C*se,r[11]=M*P+y*B+x*F+C*he,r[15]=M*S+y*O+x*K+C*xe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+r*l*u-i*c*u-r*a*d+n*c*d+i*a*f-n*l*f)+_*(+t*l*f-t*c*d+r*o*d-i*o*f+i*c*h-r*l*h)+m*(+t*c*u-t*a*f-r*o*u+n*o*f+r*a*h-n*c*h)+p*(-i*a*h-t*l*u+t*a*d+i*o*u-n*o*d+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],M=u*m*c-_*d*c+_*l*f-a*m*f-u*l*p+a*d*p,y=g*d*c-h*m*c-g*l*f+o*m*f+h*l*p-o*d*p,x=h*_*c-g*u*c+g*a*f-o*_*f-h*a*p+o*u*p,C=g*u*l-h*_*l-g*a*d+o*_*d+h*a*m-o*u*m,T=t*M+n*y+i*x+r*C;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/T;return e[0]=M*R,e[1]=(_*d*r-u*m*r-_*i*f+n*m*f+u*i*p-n*d*p)*R,e[2]=(a*m*r-_*l*r+_*i*c-n*m*c-a*i*p+n*l*p)*R,e[3]=(u*l*r-a*d*r-u*i*c+n*d*c+a*i*f-n*l*f)*R,e[4]=y*R,e[5]=(h*m*r-g*d*r+g*i*f-t*m*f-h*i*p+t*d*p)*R,e[6]=(g*l*r-o*m*r-g*i*c+t*m*c+o*i*p-t*l*p)*R,e[7]=(o*d*r-h*l*r+h*i*c-t*d*c-o*i*f+t*l*f)*R,e[8]=x*R,e[9]=(g*u*r-h*_*r-g*n*f+t*_*f+h*n*p-t*u*p)*R,e[10]=(o*_*r-g*a*r+g*n*c-t*_*c-o*n*p+t*a*p)*R,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*f-t*a*f)*R,e[12]=C*R,e[13]=(h*_*i-g*u*i+g*n*d-t*_*d-h*n*m+t*u*m)*R,e[14]=(g*a*i-o*_*i-g*n*l+t*_*l+o*n*m-t*a*m)*R,e[15]=(o*u*i-h*a*i+h*n*l-t*u*l-o*n*d+t*a*d)*R,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,g=r*u,_=o*h,m=o*u,p=a*u,M=l*c,y=l*h,x=l*u,C=n.x,T=n.y,R=n.z;return i[0]=(1-(_+p))*C,i[1]=(f+x)*C,i[2]=(g-y)*C,i[3]=0,i[4]=(f-x)*T,i[5]=(1-(d+p))*T,i[6]=(m+M)*T,i[7]=0,i[8]=(g+y)*R,i[9]=(m-M)*R,i[10]=(1-(d+_))*R,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=pi.set(i[0],i[1],i[2]).length();const o=pi.set(i[4],i[5],i[6]).length(),a=pi.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],tn.copy(this);const c=1/r,h=1/o,u=1/a;return tn.elements[0]*=c,tn.elements[1]*=c,tn.elements[2]*=c,tn.elements[4]*=h,tn.elements[5]*=h,tn.elements[6]*=h,tn.elements[8]*=u,tn.elements[9]*=u,tn.elements[10]*=u,t.setFromRotationMatrix(tn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o,a=Rn){const l=this.elements,c=2*r/(t-e),h=2*r/(n-i),u=(t+e)/(t-e),d=(n+i)/(n-i);let f,g;if(a===Rn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===ur)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=Rn){const l=this.elements,c=1/(t-e),h=1/(n-i),u=1/(o-r),d=(t+e)*c,f=(n+i)*h;let g,_;if(a===Rn)g=(o+r)*u,_=-2*u;else if(a===ur)g=r*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const pi=new A,tn=new Pe,Dd=new A(0,0,0),Nd=new A(1,1,1),Un=new A,Rs=new A,kt=new A,Za=new Pe,Ja=new pn;class cn{constructor(e=0,t=0,n=0,i=cn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(Ue(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ue(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ue(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ue(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ue(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ue(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Za.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Za,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ja.setFromEuler(this),this.setFromQuaternion(Ja,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}cn.DEFAULT_ORDER="XYZ";class ga{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Ud=0;const Qa=new A,mi=new pn,vn=new Pe,Cs=new A,Ji=new A,Od=new A,Fd=new pn,el=new A(1,0,0),tl=new A(0,1,0),nl=new A(0,0,1),il={type:"added"},Bd={type:"removed"},gi={type:"childadded",child:null},Dr={type:"childremoved",child:null};class ot extends oi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ud++}),this.uuid=ln(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ot.DEFAULT_UP.clone();const e=new A,t=new cn,n=new pn,i=new A(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Pe},normalMatrix:{value:new Le}}),this.matrix=new Pe,this.matrixWorld=new Pe,this.matrixAutoUpdate=ot.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ot.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ga,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return mi.setFromAxisAngle(e,t),this.quaternion.multiply(mi),this}rotateOnWorldAxis(e,t){return mi.setFromAxisAngle(e,t),this.quaternion.premultiply(mi),this}rotateX(e){return this.rotateOnAxis(el,e)}rotateY(e){return this.rotateOnAxis(tl,e)}rotateZ(e){return this.rotateOnAxis(nl,e)}translateOnAxis(e,t){return Qa.copy(e).applyQuaternion(this.quaternion),this.position.add(Qa.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(el,e)}translateY(e){return this.translateOnAxis(tl,e)}translateZ(e){return this.translateOnAxis(nl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(vn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Cs.copy(e):Cs.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Ji.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?vn.lookAt(Ji,Cs,this.up):vn.lookAt(Cs,Ji,this.up),this.quaternion.setFromRotationMatrix(vn),i&&(vn.extractRotation(i.matrixWorld),mi.setFromRotationMatrix(vn),this.quaternion.premultiply(mi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(il),gi.child=e,this.dispatchEvent(gi),gi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Bd),Dr.child=e,this.dispatchEvent(Dr),Dr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),vn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),vn.multiply(e.parent.matrixWorld)),e.applyMatrix4(vn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(il),gi.child=e,this.dispatchEvent(gi),gi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ji,e,Od),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ji,Fd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}ot.DEFAULT_UP=new A(0,1,0);ot.DEFAULT_MATRIX_AUTO_UPDATE=!0;ot.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const nn=new A,En=new A,Nr=new A,Sn=new A,_i=new A,xi=new A,sl=new A,Ur=new A,Or=new A,Fr=new A,Br=new $e,zr=new $e,kr=new $e;class Kt{constructor(e=new A,t=new A,n=new A){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),nn.subVectors(e,t),i.cross(nn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){nn.subVectors(i,t),En.subVectors(n,t),Nr.subVectors(e,t);const o=nn.dot(nn),a=nn.dot(En),l=nn.dot(Nr),c=En.dot(En),h=En.dot(Nr),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Sn)===null?!1:Sn.x>=0&&Sn.y>=0&&Sn.x+Sn.y<=1}static getInterpolation(e,t,n,i,r,o,a,l){return this.getBarycoord(e,t,n,i,Sn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Sn.x),l.addScaledVector(o,Sn.y),l.addScaledVector(a,Sn.z),l)}static getInterpolatedAttribute(e,t,n,i,r,o){return Br.setScalar(0),zr.setScalar(0),kr.setScalar(0),Br.fromBufferAttribute(e,t),zr.fromBufferAttribute(e,n),kr.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(Br,r.x),o.addScaledVector(zr,r.y),o.addScaledVector(kr,r.z),o}static isFrontFacing(e,t,n,i){return nn.subVectors(n,t),En.subVectors(e,t),nn.cross(En).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return nn.subVectors(this.c,this.b),En.subVectors(this.a,this.b),nn.cross(En).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Kt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Kt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return Kt.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return Kt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Kt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let o,a;_i.subVectors(i,n),xi.subVectors(r,n),Ur.subVectors(e,n);const l=_i.dot(Ur),c=xi.dot(Ur);if(l<=0&&c<=0)return t.copy(n);Or.subVectors(e,i);const h=_i.dot(Or),u=xi.dot(Or);if(h>=0&&u<=h)return t.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(_i,o);Fr.subVectors(e,r);const f=_i.dot(Fr),g=xi.dot(Fr);if(g>=0&&f<=g)return t.copy(r);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(xi,a);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return sl.subVectors(r,i),a=(u-h)/(u-h+(f-g)),t.copy(i).addScaledVector(sl,a);const p=1/(m+_+d);return o=_*p,a=d*p,t.copy(n).addScaledVector(_i,o).addScaledVector(xi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Oc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},On={h:0,s:0,l:0},Ps={h:0,s:0,l:0};function Gr(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Te{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=mt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,He.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=He.workingColorSpace){return this.r=e,this.g=t,this.b=n,He.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=He.workingColorSpace){if(e=pa(e,1),t=Ue(t,0,1),n=Ue(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Gr(o,r,e+1/3),this.g=Gr(o,r,e),this.b=Gr(o,r,e-1/3)}return He.toWorkingColorSpace(this,i),this}setStyle(e,t=mt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=mt){const n=Oc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Cn(e.r),this.g=Cn(e.g),this.b=Cn(e.b),this}copyLinearToSRGB(e){return this.r=Pi(e.r),this.g=Pi(e.g),this.b=Pi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=mt){return He.fromWorkingColorSpace(Rt.copy(this),e),Math.round(Ue(Rt.r*255,0,255))*65536+Math.round(Ue(Rt.g*255,0,255))*256+Math.round(Ue(Rt.b*255,0,255))}getHexString(e=mt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=He.workingColorSpace){He.fromWorkingColorSpace(Rt.copy(this),t);const n=Rt.r,i=Rt.g,r=Rt.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=He.workingColorSpace){return He.fromWorkingColorSpace(Rt.copy(this),t),e.r=Rt.r,e.g=Rt.g,e.b=Rt.b,e}getStyle(e=mt){He.fromWorkingColorSpace(Rt.copy(this),e);const t=Rt.r,n=Rt.g,i=Rt.b;return e!==mt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(On),this.setHSL(On.h+e,On.s+t,On.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(On),e.getHSL(Ps);const n=as(On.h,Ps.h,t),i=as(On.s,Ps.s,t),r=as(On.l,Ps.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Rt=new Te;Te.NAMES=Oc;let zd=0;class fn extends oi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:zd++}),this.uuid=ln(),this.name="",this.type="Material",this.blending=wi,this.side=Pn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=lo,this.blendDst=co,this.blendEquation=ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Te(0,0,0),this.blendAlpha=0,this.depthFunc=Di,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Wa,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ci,this.stencilZFail=ci,this.stencilZPass=ci,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==wi&&(n.blending=this.blending),this.side!==Pn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==lo&&(n.blendSrc=this.blendSrc),this.blendDst!==co&&(n.blendDst=this.blendDst),this.blendEquation!==ni&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Di&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Wa&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ci&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ci&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ci&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Ot extends fn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Te(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.combine=xc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ft=new A,Is=new Ee;let kd=0;class dt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:kd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=$o,this.updateRanges=[],this.gpuType=on,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Is.fromBufferAttribute(this,t),Is.applyMatrix3(e),this.setXY(t,Is.x,Is.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyMatrix3(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyMatrix4(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyNormalMatrix(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.transformDirection(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ze(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=sn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ze(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=sn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ze(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=sn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ze(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=sn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ze(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array),i=Ze(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array),i=Ze(i,this.array),r=Ze(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==$o&&(e.usage=this.usage),e}}class Fc extends dt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Bc extends dt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class gt extends dt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Gd=0;const $t=new Pe,Hr=new ot,yi=new A,Gt=new pt,Qi=new pt,vt=new A;class St extends oi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gd++}),this.uuid=ln(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Nc(e)?Bc:Fc)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Le().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return $t.makeRotationFromQuaternion(e),this.applyMatrix4($t),this}rotateX(e){return $t.makeRotationX(e),this.applyMatrix4($t),this}rotateY(e){return $t.makeRotationY(e),this.applyMatrix4($t),this}rotateZ(e){return $t.makeRotationZ(e),this.applyMatrix4($t),this}translate(e,t,n){return $t.makeTranslation(e,t,n),this.applyMatrix4($t),this}scale(e,t,n){return $t.makeScale(e,t,n),this.applyMatrix4($t),this}lookAt(e){return Hr.lookAt(e),Hr.updateMatrix(),this.applyMatrix4(Hr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(yi).negate(),this.translate(yi.x,yi.y,yi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new gt(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pt);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];Gt.setFromBufferAttribute(r),this.morphTargetsRelative?(vt.addVectors(this.boundingBox.min,Gt.min),this.boundingBox.expandByPoint(vt),vt.addVectors(this.boundingBox.max,Gt.max),this.boundingBox.expandByPoint(vt)):(this.boundingBox.expandByPoint(Gt.min),this.boundingBox.expandByPoint(Gt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new mn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(e){const n=this.boundingSphere.center;if(Gt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Qi.setFromBufferAttribute(a),this.morphTargetsRelative?(vt.addVectors(Gt.min,Qi.min),Gt.expandByPoint(vt),vt.addVectors(Gt.max,Qi.max),Gt.expandByPoint(vt)):(Gt.expandByPoint(Qi.min),Gt.expandByPoint(Qi.max))}Gt.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)vt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(vt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)vt.fromBufferAttribute(a,c),l&&(yi.fromBufferAttribute(e,c),vt.add(yi)),i=Math.max(i,n.distanceToSquared(vt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new dt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new A,l[P]=new A;const c=new A,h=new A,u=new A,d=new Ee,f=new Ee,g=new Ee,_=new A,m=new A;function p(P,S,v){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,v),d.fromBufferAttribute(r,P),f.fromBufferAttribute(r,S),g.fromBufferAttribute(r,v),h.sub(c),u.sub(c),f.sub(d),g.sub(d);const I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(I),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(I),a[P].add(_),a[S].add(_),a[v].add(_),l[P].add(m),l[S].add(m),l[v].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let P=0,S=M.length;P<S;++P){const v=M[P],I=v.start,B=v.count;for(let O=I,V=I+B;O<V;O+=3)p(e.getX(O+0),e.getX(O+1),e.getX(O+2))}const y=new A,x=new A,C=new A,T=new A;function R(P){C.fromBufferAttribute(i,P),T.copy(C);const S=a[P];y.copy(S),y.sub(C.multiplyScalar(C.dot(S))).normalize(),x.crossVectors(T,S);const I=x.dot(l[P])<0?-1:1;o.setXYZW(P,y.x,y.y,y.z,I)}for(let P=0,S=M.length;P<S;++P){const v=M[P],I=v.start,B=v.count;for(let O=I,V=I+B;O<V;O+=3)R(e.getX(O+0)),R(e.getX(O+1)),R(e.getX(O+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new dt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new A,r=new A,o=new A,a=new A,l=new A,c=new A,h=new A,u=new A;if(e)for(let d=0,f=e.count;d<f;d+=3){const g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)vt.fromBufferAttribute(e,t),vt.normalize(),e.setXYZ(t,vt.x,vt.y,vt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let p=0;p<h;p++)d[g++]=c[f++]}return new dt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new St,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(i[l]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const rl=new Pe,qn=new Xi,Ls=new mn,ol=new A,Ds=new A,Ns=new A,Us=new A,Vr=new A,Os=new A,al=new A,Fs=new A;class ct extends ot{constructor(e=new St,t=new Ot){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(r&&a){Os.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(Vr.fromBufferAttribute(u,e),o?Os.addScaledVector(Vr,h):Os.addScaledVector(Vr.sub(t),h))}t.add(Os)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ls.copy(n.boundingSphere),Ls.applyMatrix4(r),qn.copy(e.ray).recast(e.near),!(Ls.containsPoint(qn.origin)===!1&&(qn.intersectSphere(Ls,ol)===null||qn.origin.distanceToSquared(ol)>(e.far-e.near)**2))&&(rl.copy(r).invert(),qn.copy(e.ray).applyMatrix4(rl),!(n.boundingBox!==null&&qn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,qn)))}_computeIntersections(e,t,n){let i;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],p=o[m.materialIndex],M=Math.max(m.start,f.start),y=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let x=M,C=y;x<C;x+=3){const T=a.getX(x),R=a.getX(x+1),P=a.getX(x+2);i=Bs(this,p,e,n,c,h,u,T,R,P),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const M=a.getX(m),y=a.getX(m+1),x=a.getX(m+2);i=Bs(this,o,e,n,c,h,u,M,y,x),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],p=o[m.materialIndex],M=Math.max(m.start,f.start),y=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let x=M,C=y;x<C;x+=3){const T=x,R=x+1,P=x+2;i=Bs(this,p,e,n,c,h,u,T,R,P),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const M=m,y=m+1,x=m+2;i=Bs(this,o,e,n,c,h,u,M,y,x),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function Hd(s,e,t,n,i,r,o,a){let l;if(e.side===Bt?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,e.side===Pn,a),l===null)return null;Fs.copy(a),Fs.applyMatrix4(s.matrixWorld);const c=t.ray.origin.distanceTo(Fs);return c<t.near||c>t.far?null:{distance:c,point:Fs.clone(),object:s}}function Bs(s,e,t,n,i,r,o,a,l,c){s.getVertexPosition(a,Ds),s.getVertexPosition(l,Ns),s.getVertexPosition(c,Us);const h=Hd(s,e,t,n,Ds,Ns,Us,al);if(h){const u=new A;Kt.getBarycoord(al,Ds,Ns,Us,u),i&&(h.uv=Kt.getInterpolatedAttribute(i,a,l,c,u,new Ee)),r&&(h.uv1=Kt.getInterpolatedAttribute(r,a,l,c,u,new Ee)),o&&(h.normal=Kt.getInterpolatedAttribute(o,a,l,c,u,new A),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new A,materialIndex:0};Kt.getNormal(Ds,Ns,Us,d.normal),h.face=d,h.barycoord=u}return h}class ms extends St{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new gt(c,3)),this.setAttribute("normal",new gt(h,3)),this.setAttribute("uv",new gt(u,2));function g(_,m,p,M,y,x,C,T,R,P,S){const v=x/R,I=C/P,B=x/2,O=C/2,V=T/2,W=R+1,F=P+1;let K=0,z=0;const se=new A;for(let he=0;he<F;he++){const xe=he*I-O;for(let Oe=0;Oe<W;Oe++){const tt=Oe*v-B;se[_]=tt*M,se[m]=xe*y,se[p]=V,c.push(se.x,se.y,se.z),se[_]=0,se[m]=0,se[p]=T>0?1:-1,h.push(se.x,se.y,se.z),u.push(Oe/R),u.push(1-he/P),K+=1}}for(let he=0;he<P;he++)for(let xe=0;xe<R;xe++){const Oe=d+xe+W*he,tt=d+xe+W*(he+1),$=d+(xe+1)+W*(he+1),ee=d+(xe+1)+W*he;l.push(Oe,tt,ee),l.push(tt,$,ee),z+=6}a.addGroup(f,z,S),f+=z,d+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ms(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function zi(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function It(s){const e={};for(let t=0;t<s.length;t++){const n=zi(s[t]);for(const i in n)e[i]=n[i]}return e}function Vd(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function zc(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:He.workingColorSpace}const Wd={clone:zi,merge:It};var Xd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Yd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Wn extends fn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Xd,this.fragmentShader=Yd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=zi(e.uniforms),this.uniformsGroups=Vd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class kc extends ot{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Pe,this.projectionMatrix=new Pe,this.projectionMatrixInverse=new Pe,this.coordinateSystem=Rn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Fn=new A,ll=new Ee,cl=new Ee;class Lt extends kc{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Bi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ci*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Bi*2*Math.atan(Math.tan(Ci*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Fn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Fn.x,Fn.y).multiplyScalar(-e/Fn.z),Fn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Fn.x,Fn.y).multiplyScalar(-e/Fn.z)}getViewSize(e,t){return this.getViewBounds(e,ll,cl),t.subVectors(cl,ll)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ci*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Mi=-90,vi=1;class $d extends ot{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Lt(Mi,vi,e,t);i.layers=this.layers,this.add(i);const r=new Lt(Mi,vi,e,t);r.layers=this.layers,this.add(r);const o=new Lt(Mi,vi,e,t);o.layers=this.layers,this.add(o);const a=new Lt(Mi,vi,e,t);a.layers=this.layers,this.add(a);const l=new Lt(Mi,vi,e,t);l.layers=this.layers,this.add(l);const c=new Lt(Mi,vi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===Rn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ur)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Gc extends xt{constructor(e,t,n,i,r,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Ni,super(e,t,n,i,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class jd extends ri{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Gc(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Vt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new ms(5,5,5),r=new Wn({name:"CubemapFromEquirect",uniforms:zi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Bt,blending:Hn});r.uniforms.tEquirect.value=t;const o=new ct(i,r),a=t.minFilter;return t.minFilter===rn&&(t.minFilter=Vt),new $d(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,i){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}}class an extends ot{constructor(){super(),this.isGroup=!0,this.type="Group"}}const qd={type:"move"};class Wr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new an,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new an,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new an,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(qd)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new an;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Kd extends ot{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new cn,this.environmentIntensity=1,this.environmentRotation=new cn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Zd{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=$o,this.updateRanges=[],this.version=0,this.uuid=ln()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ln()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ln()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Pt=new A;class _a{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix4(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyNormalMatrix(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.transformDirection(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ze(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Ze(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Ze(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Ze(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Ze(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=sn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=sn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=sn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=sn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array),i=Ze(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array),i=Ze(i,this.array),r=Ze(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new dt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new _a(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const hl=new A,dl=new $e,ul=new $e,Jd=new A,fl=new Pe,zs=new A,Xr=new mn,pl=new Pe,Yr=new Xi;class Qd extends ct{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ka,this.bindMatrix=new Pe,this.bindMatrixInverse=new Pe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new pt),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,zs),this.boundingBox.expandByPoint(zs)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new mn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,zs),this.boundingSphere.expandByPoint(zs)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Xr.copy(this.boundingSphere),Xr.applyMatrix4(i),e.ray.intersectsSphere(Xr)!==!1&&(pl.copy(i).invert(),Yr.copy(e.ray).applyMatrix4(pl),!(this.boundingBox!==null&&Yr.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Yr)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new $e,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ka?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===$h?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;dl.fromBufferAttribute(i.attributes.skinIndex,e),ul.fromBufferAttribute(i.attributes.skinWeight,e),hl.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=ul.getComponent(r);if(o!==0){const a=dl.getComponent(r);fl.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Jd.copy(hl).applyMatrix4(fl),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Hc extends ot{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Vc extends xt{constructor(e=null,t=1,n=1,i,r,o,a,l,c=Tt,h=Tt,u,d){super(null,o,a,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const ml=new Pe,eu=new Pe;class xa{constructor(e=[],t=[]){this.uuid=ln(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Pe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Pe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:eu;ml.multiplyMatrices(a,t[r]),ml.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new xa(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new Vc(t,e,e,Zt,on);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Hc),this.bones.push(o),this.boneInverses.push(new Pe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const o=t[i];e.bones.push(o.uuid);const a=n[i];e.boneInverses.push(a.toArray())}return e}}class jo extends dt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ei=new Pe,gl=new Pe,ks=[],_l=new pt,tu=new Pe,es=new ct,ts=new mn;class nu extends ct{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new jo(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,tu)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new pt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ei),_l.copy(e.boundingBox).applyMatrix4(Ei),this.boundingBox.union(_l)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new mn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ei),ts.copy(e.boundingSphere).applyMatrix4(Ei),this.boundingSphere.union(ts)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(es.geometry=this.geometry,es.material=this.material,es.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ts.copy(this.boundingSphere),ts.applyMatrix4(n),e.ray.intersectsSphere(ts)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Ei),gl.multiplyMatrices(n,Ei),es.matrixWorld=gl,es.raycast(e,ks);for(let o=0,a=ks.length;o<a;o++){const l=ks[o];l.instanceId=r,l.object=this,t.push(l)}ks.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new jo(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Vc(new Float32Array(i*this.count),i,this.count,ha,on));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=i*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const $r=new A,iu=new A,su=new Le;class qt{constructor(e=new A(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=$r.subVectors(n,t).cross(iu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta($r),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||su.getNormalMatrix(e),i=this.coplanarPoint($r).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Kn=new mn,Gs=new A;class ya{constructor(e=new qt,t=new qt,n=new qt,i=new qt,r=new qt,o=new qt){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Rn){const n=this.planes,i=e.elements,r=i[0],o=i[1],a=i[2],l=i[3],c=i[4],h=i[5],u=i[6],d=i[7],f=i[8],g=i[9],_=i[10],m=i[11],p=i[12],M=i[13],y=i[14],x=i[15];if(n[0].setComponents(l-r,d-c,m-f,x-p).normalize(),n[1].setComponents(l+r,d+c,m+f,x+p).normalize(),n[2].setComponents(l+o,d+h,m+g,x+M).normalize(),n[3].setComponents(l-o,d-h,m-g,x-M).normalize(),n[4].setComponents(l-a,d-u,m-_,x-y).normalize(),t===Rn)n[5].setComponents(l+a,d+u,m+_,x+y).normalize();else if(t===ur)n[5].setComponents(a,u,_,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Kn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Kn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Kn)}intersectsSprite(e){return Kn.center.set(0,0,0),Kn.radius=.7071067811865476,Kn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Kn)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Gs.x=i.normal.x>0?e.max.x:e.min.x,Gs.y=i.normal.y>0?e.max.y:e.min.y,Gs.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Gs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Ii extends fn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Te(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const fr=new A,pr=new A,xl=new Pe,ns=new Xi,Hs=new mn,jr=new A,yl=new A;class _r extends ot{constructor(e=new St,t=new Ii){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)fr.fromBufferAttribute(t,i-1),pr.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=fr.distanceTo(pr);e.setAttribute("lineDistance",new gt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Hs.copy(n.boundingSphere),Hs.applyMatrix4(i),Hs.radius+=r,e.ray.intersectsSphere(Hs)===!1)return;xl.copy(i).invert(),ns.copy(e.ray).applyMatrix4(xl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=h.getX(_),M=h.getX(_+1),y=Vs(this,e,ns,l,p,M,_);y&&t.push(y)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(f),p=Vs(this,e,ns,l,_,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=Vs(this,e,ns,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){const _=Vs(this,e,ns,l,g-1,f,g-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Vs(s,e,t,n,i,r,o){const a=s.geometry.attributes.position;if(fr.fromBufferAttribute(a,i),pr.fromBufferAttribute(a,r),t.distanceSqToSegment(fr,pr,jr,yl)>n)return;jr.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(jr);if(!(c<e.near||c>e.far))return{distance:c,point:yl.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}const Ml=new A,vl=new A;class ls extends _r{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Ml.fromBufferAttribute(t,i),vl.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Ml.distanceTo(vl);e.setAttribute("lineDistance",new gt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ru extends _r{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Wc extends fn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Te(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const El=new Pe,qo=new Xi,Ws=new mn,Xs=new A;class ou extends ot{constructor(e=new St,t=new Wc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ws.copy(n.boundingSphere),Ws.applyMatrix4(i),Ws.radius+=r,e.ray.intersectsSphere(Ws)===!1)return;El.copy(i).invert(),qo.copy(e.ray).applyMatrix4(El);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,_=f;g<_;g++){const m=c.getX(g);Xs.fromBufferAttribute(u,m),Sl(Xs,m,l,i,e,t,this)}}else{const d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=d,_=f;g<_;g++)Xs.fromBufferAttribute(u,g),Sl(Xs,g,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Sl(s,e,t,n,i,r,o){const a=qo.distanceSqToPoint(s);if(a<t){const l=new A;qo.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class bl extends xt{constructor(e,t,n,i,r,o,a,l,c){super(e,t,n,i,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Xc extends xt{constructor(e,t,n,i,r,o,a,l,c,h=Ri){if(h!==Ri&&h!==Fi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Ri&&(n=si),n===void 0&&h===Fi&&(n=Oi),super(null,i,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Tt,this.minFilter=l!==void 0?l:Tt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ma(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Ma extends St{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],d=[],f=[];let g=0;const _=[],m=n/2;let p=0;M(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new gt(u,3)),this.setAttribute("normal",new gt(d,3)),this.setAttribute("uv",new gt(f,2));function M(){const x=new A,C=new A;let T=0;const R=(t-e)/n;for(let P=0;P<=r;P++){const S=[],v=P/r,I=v*(t-e)+e;for(let B=0;B<=i;B++){const O=B/i,V=O*l+a,W=Math.sin(V),F=Math.cos(V);C.x=I*W,C.y=-v*n+m,C.z=I*F,u.push(C.x,C.y,C.z),x.set(W,R,F).normalize(),d.push(x.x,x.y,x.z),f.push(O,1-v),S.push(g++)}_.push(S)}for(let P=0;P<i;P++)for(let S=0;S<r;S++){const v=_[S][P],I=_[S+1][P],B=_[S+1][P+1],O=_[S][P+1];(e>0||S!==0)&&(h.push(v,I,O),T+=3),(t>0||S!==r-1)&&(h.push(I,B,O),T+=3)}c.addGroup(p,T,0),p+=T}function y(x){const C=g,T=new Ee,R=new A;let P=0;const S=x===!0?e:t,v=x===!0?1:-1;for(let B=1;B<=i;B++)u.push(0,m*v,0),d.push(0,v,0),f.push(.5,.5),g++;const I=g;for(let B=0;B<=i;B++){const V=B/i*l+a,W=Math.cos(V),F=Math.sin(V);R.x=S*F,R.y=m*v,R.z=S*W,u.push(R.x,R.y,R.z),d.push(0,v,0),T.x=W*.5+.5,T.y=F*.5*v+.5,f.push(T.x,T.y),g++}for(let B=0;B<i;B++){const O=C+B,V=I+B;x===!0?h.push(V,V+1,O):h.push(V+1,V,O),P+=3}c.addGroup(p,P,x===!0?1:2),p+=P}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ma(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class mr extends Ma{constructor(e=1,t=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new mr(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}const Ys=new A,$s=new A,qr=new A,js=new Kt;class Tl extends St{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const i=Math.pow(10,4),r=Math.cos(Ci*t),o=e.getIndex(),a=e.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],h=["a","b","c"],u=new Array(3),d={},f=[];for(let g=0;g<l;g+=3){o?(c[0]=o.getX(g),c[1]=o.getX(g+1),c[2]=o.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:_,b:m,c:p}=js;if(_.fromBufferAttribute(a,c[0]),m.fromBufferAttribute(a,c[1]),p.fromBufferAttribute(a,c[2]),js.getNormal(qr),u[0]=`${Math.round(_.x*i)},${Math.round(_.y*i)},${Math.round(_.z*i)}`,u[1]=`${Math.round(m.x*i)},${Math.round(m.y*i)},${Math.round(m.z*i)}`,u[2]=`${Math.round(p.x*i)},${Math.round(p.y*i)},${Math.round(p.z*i)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let M=0;M<3;M++){const y=(M+1)%3,x=u[M],C=u[y],T=js[h[M]],R=js[h[y]],P=`${x}_${C}`,S=`${C}_${x}`;S in d&&d[S]?(qr.dot(d[S].normal)<=r&&(f.push(T.x,T.y,T.z),f.push(R.x,R.y,R.z)),d[S]=null):P in d||(d[P]={index0:c[M],index1:c[y],normal:qr.clone()})}}for(const g in d)if(d[g]){const{index0:_,index1:m}=d[g];Ys.fromBufferAttribute(a,_),$s.fromBufferAttribute(a,m),f.push(Ys.x,Ys.y,Ys.z),f.push($s.x,$s.y,$s.z)}this.setAttribute("position",new gt(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class gs extends St{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,u=e/a,d=t/l,f=[],g=[],_=[],m=[];for(let p=0;p<h;p++){const M=p*d-o;for(let y=0;y<c;y++){const x=y*u-r;g.push(x,-M,0),_.push(0,0,1),m.push(y/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<a;M++){const y=M+c*p,x=M+c*(p+1),C=M+1+c*(p+1),T=M+1+c*p;f.push(y,x,T),f.push(x,C,T)}this.setIndex(f),this.setAttribute("position",new gt(g,3)),this.setAttribute("normal",new gt(_,3)),this.setAttribute("uv",new gt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gs(e.width,e.height,e.widthSegments,e.heightSegments)}}class Ti extends St{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const o=[],a=[],l=[],c=[],h=new A,u=new A,d=new A;for(let f=0;f<=n;f++)for(let g=0;g<=i;g++){const _=g/i*r,m=f/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(g/i),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=i;g++){const _=(i+1)*f+g-1,m=(i+1)*(f-1)+g-1,p=(i+1)*(f-1)+g,M=(i+1)*f+g;o.push(_,m,M),o.push(m,p,M)}this.setIndex(o),this.setAttribute("position",new gt(a,3)),this.setAttribute("normal",new gt(l,3)),this.setAttribute("uv",new gt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ti(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class _s extends fn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Te(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Te(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Lc,this.normalScale=new Ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class gn extends _s{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ee(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ue(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Te(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Te(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Te(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class au extends fn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Kh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class lu extends fn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function qs(s,e,t){return!s||!t&&s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function cu(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function hu(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Al(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let l=0;l!==e;++l)i[o++]=s[a+l]}return i}function Yc(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}class xs{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class du extends xs{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ga,endingEnd:Ga}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,o=e+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ha:r=e,a=2*t-n;break;case Va:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ha:o=e,l=2*n-t;break;case Va:o=1,l=n+i[1]-i[0];break;default:o=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(i-t),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,M=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,y=(-1-f)*m+(1.5+f)*_+.5*g,x=f*m-f*_;for(let C=0;C!==a;++C)r[C]=p*o[h+C]+M*o[c+C]+y*o[l+C]+x*o[u+C];return r}}class uu extends xs{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}}class fu extends xs{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class _n{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=qs(t,this.TimeBufferType),this.values=qs(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:qs(e.times,Array),values:qs(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new fu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new uu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new du(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ds:t=this.InterpolantFactoryMethodDiscrete;break;case us:t=this.InterpolantFactoryMethodLinear;break;case br:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ds;case this.InterpolantFactoryMethodLinear:return us;case this.InterpolantFactoryMethodSmooth:return br}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(i!==void 0&&cu(i))for(let a=0,l=i.length;a!==l;++a){const c=i[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===br,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(i)l=!0;else{const u=a*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){const _=t[u+g];if(_!==t[d+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}_n.prototype.TimeBufferType=Float32Array;_n.prototype.ValueBufferType=Float32Array;_n.prototype.DefaultInterpolation=us;class Yi extends _n{constructor(e,t,n){super(e,t,n)}}Yi.prototype.ValueTypeName="bool";Yi.prototype.ValueBufferType=Array;Yi.prototype.DefaultInterpolation=ds;Yi.prototype.InterpolantFactoryMethodLinear=void 0;Yi.prototype.InterpolantFactoryMethodSmooth=void 0;class $c extends _n{}$c.prototype.ValueTypeName="color";class ki extends _n{}ki.prototype.ValueTypeName="number";class pu extends xs{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(i-t);let c=e*a;for(let h=c+a;c!==h;c+=4)pn.slerpFlat(r,0,o,c-a,o,c,l);return r}}class Gi extends _n{InterpolantFactoryMethodLinear(e){return new pu(this.times,this.values,this.getValueSize(),e)}}Gi.prototype.ValueTypeName="quaternion";Gi.prototype.InterpolantFactoryMethodSmooth=void 0;class $i extends _n{constructor(e,t,n){super(e,t,n)}}$i.prototype.ValueTypeName="string";$i.prototype.ValueBufferType=Array;$i.prototype.DefaultInterpolation=ds;$i.prototype.InterpolantFactoryMethodLinear=void 0;$i.prototype.InterpolantFactoryMethodSmooth=void 0;class Hi extends _n{}Hi.prototype.ValueTypeName="vector";class mu{constructor(e="",t=-1,n=[],i=jh){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=ln(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(_u(n[o]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(_n.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const h=hu(l);l=Al(l,1,h),c=Al(c,1,h),!i&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new ki(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(c)}}const o=[];for(const a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,f,g,_){if(f.length!==0){const m=[],p=[];Yc(f,m,p,g),m.length!==0&&_.push(new u(d,m,p))}},i=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let _=0;_<d[g].morphTargets.length;_++)f[d[g].morphTargets[_]]=-1;for(const _ in f){const m=[],p=[];for(let M=0;M!==d[g].morphTargets.length;++M){const y=d[g];m.push(y.time),p.push(y.morphTarget===_?1:0)}i.push(new ki(".morphTargetInfluence["+_+"]",m,p))}l=f.length*o}else{const f=".bones["+t[u].name+"]";n(Hi,f+".position",d,"pos",i),n(Gi,f+".quaternion",d,"rot",i),n(Hi,f+".scale",d,"scl",i)}}return i.length===0?null:new this(r,l,i,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function gu(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return ki;case"vector":case"vector2":case"vector3":case"vector4":return Hi;case"color":return $c;case"quaternion":return Gi;case"bool":case"boolean":return Yi;case"string":return $i}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function _u(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=gu(s.type);if(s.times===void 0){const t=[],n=[];Yc(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const Gn={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class xu{constructor(e,t,n){const i=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){a++,r===!1&&i.onStart!==void 0&&i.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}}const yu=new xu;class ai{constructor(e){this.manager=e!==void 0?e:yu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}ai.DEFAULT_MATERIAL_NAME="__DEFAULT";const bn={};class Mu extends Error{constructor(e,t){super(e),this.response=t}}class va extends ai{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Gn.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(bn[e]!==void 0){bn[e].push({onLoad:t,onProgress:n,onError:i});return}bn[e]=[],bn[e].push({onLoad:t,onProgress:n,onError:i});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=bn[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0;let _=0;const m=new ReadableStream({start(p){M();function M(){u.read().then(({done:y,value:x})=>{if(y)p.close();else{_+=x.byteLength;const C=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let T=0,R=h.length;T<R;T++){const P=h[T];P.onProgress&&P.onProgress(C)}p.enqueue(x),M()}},y=>{p.error(y)})}}});return new Response(m)}else throw new Mu(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Gn.add(e,c);const h=bn[e];delete bn[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=bn[e];if(h===void 0)throw this.manager.itemError(e),c;delete bn[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class vu extends ai{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Gn.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=fs("img");function l(){h(),Gn.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(u){h(),i&&i(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}class Eu extends ai{constructor(e){super(e)}load(e,t,n,i){const r=new xt,o=new vu(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class xr extends ot{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Te(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Kr=new Pe,wl=new A,Rl=new A;class Ea{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ee(512,512),this.map=null,this.mapPass=null,this.matrix=new Pe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ya,this._frameExtents=new Ee(1,1),this._viewportCount=1,this._viewports=[new $e(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;wl.setFromMatrixPosition(e.matrixWorld),t.position.copy(wl),Rl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Rl),t.updateMatrixWorld(),Kr.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kr),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Kr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Su extends Ea{constructor(){super(new Lt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=Bi*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class bu extends xr{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ot.DEFAULT_UP),this.updateMatrix(),this.target=new ot,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Su}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Cl=new Pe,is=new A,Zr=new A;class Tu extends Ea{constructor(){super(new Lt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ee(4,2),this._viewportCount=6,this._viewports=[new $e(2,1,1,1),new $e(0,1,1,1),new $e(3,1,1,1),new $e(1,1,1,1),new $e(3,0,1,1),new $e(1,0,1,1)],this._cubeDirections=[new A(1,0,0),new A(-1,0,0),new A(0,0,1),new A(0,0,-1),new A(0,1,0),new A(0,-1,0)],this._cubeUps=[new A(0,1,0),new A(0,1,0),new A(0,1,0),new A(0,1,0),new A(0,0,1),new A(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),is.setFromMatrixPosition(e.matrixWorld),n.position.copy(is),Zr.copy(n.position),Zr.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Zr),n.updateMatrixWorld(),i.makeTranslation(-is.x,-is.y,-is.z),Cl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Cl)}}class Au extends xr{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Tu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Sa extends kc{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class wu extends Ea{constructor(){super(new Sa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class or extends xr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ot.DEFAULT_UP),this.updateMatrix(),this.target=new ot,this.shadow=new wu}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Ru extends xr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class cs{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class Cu extends ai{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Gn.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),r.manager.itemEnd(e)}).catch(c=>{i&&i(c)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Gn.add(e,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){i&&i(c),Gn.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});Gn.add(e,l),r.manager.itemStart(e)}}class Pu extends Lt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e,this.index=0}}const ba="\\[\\]\\.:\\/",Iu=new RegExp("["+ba+"]","g"),Ta="[^"+ba+"]",Lu="[^"+ba.replace("\\.","")+"]",Du=/((?:WC+[\/:])*)/.source.replace("WC",Ta),Nu=/(WCOD+)?/.source.replace("WCOD",Lu),Uu=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ta),Ou=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ta),Fu=new RegExp("^"+Du+Nu+Uu+Ou+"$"),Bu=["material","materials","bones","map"];class zu{constructor(e,t,n){const i=n||Je.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Je{constructor(e,t,n){this.path=t,this.parsedPath=n||Je.parseTrackName(t),this.node=Je.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new Je.Composite(e,t,n):new Je(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Iu,"")}static parseTrackName(e){const t=Fu.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);Bu.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=Je.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[i];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Je.Composite=zu;Je.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Je.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Je.prototype.GetterByBindingType=[Je.prototype._getValue_direct,Je.prototype._getValue_array,Je.prototype._getValue_arrayElement,Je.prototype._getValue_toArray];Je.prototype.SetterByBindingTypeAndVersioning=[[Je.prototype._setValue_direct,Je.prototype._setValue_direct_setNeedsUpdate,Je.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_array,Je.prototype._setValue_array_setNeedsUpdate,Je.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_arrayElement,Je.prototype._setValue_arrayElement_setNeedsUpdate,Je.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_fromArray,Je.prototype._setValue_fromArray_setNeedsUpdate,Je.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const Pl=new Pe;class ar{constructor(e,t,n=0,i=1/0){this.ray=new Xi(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new ga,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Pl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Pl),this}intersectObject(e,t=!0,n=[]){return Ko(e,this,n,t),n.sort(Il),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)Ko(e[i],this,n,t);return n.sort(Il),n}}function Il(s,e){return s.distance-e.distance}function Ko(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let o=0,a=r.length;o<a;o++)Ko(r[o],e,t,!0)}}class Ll{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Ue(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Ue(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class ku extends ls{constructor(e=10,t=10,n=4473924,i=8947848){n=new Te(n),i=new Te(i);const r=t/2,o=e/t,a=e/2,l=[],c=[];for(let d=0,f=0,g=-a;d<=t;d++,g+=o){l.push(-a,0,g,a,0,g),l.push(g,0,-a,g,0,a);const _=d===r?n:i;_.toArray(c,f),f+=3,_.toArray(c,f),f+=3,_.toArray(c,f),f+=3,_.toArray(c,f),f+=3}const h=new St;h.setAttribute("position",new gt(l,3)),h.setAttribute("color",new gt(c,3));const u=new Ii({vertexColors:!0,toneMapped:!1});super(h,u),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Gu extends oi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}function Dl(s,e,t,n){const i=Hu(n);switch(t){case Tc:return s*e;case wc:return s*e;case Rc:return s*e*2;case ha:return s*e/i.components*i.byteLength;case da:return s*e/i.components*i.byteLength;case Cc:return s*e*2/i.components*i.byteLength;case ua:return s*e*2/i.components*i.byteLength;case Ac:return s*e*3/i.components*i.byteLength;case Zt:return s*e*4/i.components*i.byteLength;case fa:return s*e*4/i.components*i.byteLength;case tr:case nr:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case ir:case sr:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case vo:case So:return Math.max(s,16)*Math.max(e,8)/4;case Mo:case Eo:return Math.max(s,8)*Math.max(e,8)/2;case bo:case To:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Ao:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case wo:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ro:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Co:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Po:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Io:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Lo:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Do:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case No:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Uo:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Fo:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Bo:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case zo:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case ko:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case rr:case Go:case Ho:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Pc:case Vo:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Wo:case Xo:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Hu(s){switch(s){case In:case Ec:return{byteLength:1,components:1};case hs:case Sc:case ps:return{byteLength:2,components:1};case la:case ca:return{byteLength:2,components:4};case si:case aa:case on:return{byteLength:4,components:1};case bc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:oa}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=oa);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function jc(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Vu(s){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,a),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){const g=u[d],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){const _=u[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(s.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}var Wu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Xu=`#ifdef USE_ALPHAHASH
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
#endif`,Yu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,$u=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ju=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ku=`#ifdef USE_AOMAP
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
#endif`,Zu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ju=`#ifdef USE_BATCHING
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
#endif`,Qu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,ef=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,tf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,nf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,sf=`#ifdef USE_IRIDESCENCE
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
#endif`,rf=`#ifdef USE_BUMPMAP
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
#endif`,of=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,af=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,lf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,cf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,df=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,uf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,ff=`#if defined( USE_COLOR_ALPHA )
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
#endif`,pf=`#define PI 3.141592653589793
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
} // validated`,mf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,gf=`vec3 transformedNormal = objectNormal;
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
#endif`,_f=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,xf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,yf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Mf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,vf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ef=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Sf=`#ifdef USE_ENVMAP
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
#endif`,bf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Tf=`#ifdef USE_ENVMAP
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
#endif`,Af=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,wf=`#ifdef USE_ENVMAP
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
#endif`,Rf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Cf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Pf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,If=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Lf=`#ifdef USE_GRADIENTMAP
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
}`,Df=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Nf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Uf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Of=`uniform bool receiveShadow;
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
#endif`,Ff=`#ifdef USE_ENVMAP
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
#endif`,Bf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,zf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,kf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Gf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Hf=`PhysicalMaterial material;
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
#endif`,Vf=`struct PhysicalMaterial {
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
}`,Wf=`
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
#endif`,Xf=`#if defined( RE_IndirectDiffuse )
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
#endif`,Yf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,$f=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,jf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qf=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Kf=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Zf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Jf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Qf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,ep=`#if defined( USE_POINTS_UV )
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
#endif`,tp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,np=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ip=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,sp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,rp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,op=`#ifdef USE_MORPHTARGETS
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
#endif`,ap=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,cp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,hp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,up=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,fp=`#ifdef USE_NORMALMAP
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
#endif`,pp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,mp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,gp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,_p=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,xp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,yp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Mp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,vp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ep=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Sp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,bp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Tp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ap=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,wp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Rp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Cp=`float getShadowMask() {
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
}`,Pp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ip=`#ifdef USE_SKINNING
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
#endif`,Lp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Dp=`#ifdef USE_SKINNING
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
#endif`,Np=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Up=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Op=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Fp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Bp=`#ifdef USE_TRANSMISSION
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
#endif`,zp=`#ifdef USE_TRANSMISSION
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
#endif`,kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Gp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Hp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Vp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Wp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Xp=`uniform sampler2D t2D;
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
}`,Yp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,$p=`#ifdef ENVMAP_TYPE_CUBE
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
}`,jp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kp=`#include <common>
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
}`,Zp=`#if DEPTH_PACKING == 3200
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
}`,Jp=`#define DISTANCE
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
}`,Qp=`#define DISTANCE
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
}`,em=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,tm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nm=`uniform float scale;
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
}`,im=`uniform vec3 diffuse;
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
}`,sm=`#include <common>
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
}`,rm=`uniform vec3 diffuse;
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
}`,om=`#define LAMBERT
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
}`,am=`#define LAMBERT
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
}`,lm=`#define MATCAP
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
}`,cm=`#define MATCAP
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
}`,hm=`#define NORMAL
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
}`,dm=`#define NORMAL
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
}`,um=`#define PHONG
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
}`,fm=`#define PHONG
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
}`,pm=`#define STANDARD
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
}`,mm=`#define STANDARD
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
}`,gm=`#define TOON
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
}`,_m=`#define TOON
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
}`,xm=`uniform float size;
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
}`,ym=`uniform vec3 diffuse;
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
}`,Mm=`#include <common>
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
}`,vm=`uniform vec3 color;
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
}`,Em=`uniform float rotation;
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
}`,Sm=`uniform vec3 diffuse;
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
}`,Ne={alphahash_fragment:Wu,alphahash_pars_fragment:Xu,alphamap_fragment:Yu,alphamap_pars_fragment:$u,alphatest_fragment:ju,alphatest_pars_fragment:qu,aomap_fragment:Ku,aomap_pars_fragment:Zu,batching_pars_vertex:Ju,batching_vertex:Qu,begin_vertex:ef,beginnormal_vertex:tf,bsdfs:nf,iridescence_fragment:sf,bumpmap_pars_fragment:rf,clipping_planes_fragment:of,clipping_planes_pars_fragment:af,clipping_planes_pars_vertex:lf,clipping_planes_vertex:cf,color_fragment:hf,color_pars_fragment:df,color_pars_vertex:uf,color_vertex:ff,common:pf,cube_uv_reflection_fragment:mf,defaultnormal_vertex:gf,displacementmap_pars_vertex:_f,displacementmap_vertex:xf,emissivemap_fragment:yf,emissivemap_pars_fragment:Mf,colorspace_fragment:vf,colorspace_pars_fragment:Ef,envmap_fragment:Sf,envmap_common_pars_fragment:bf,envmap_pars_fragment:Tf,envmap_pars_vertex:Af,envmap_physical_pars_fragment:Ff,envmap_vertex:wf,fog_vertex:Rf,fog_pars_vertex:Cf,fog_fragment:Pf,fog_pars_fragment:If,gradientmap_pars_fragment:Lf,lightmap_pars_fragment:Df,lights_lambert_fragment:Nf,lights_lambert_pars_fragment:Uf,lights_pars_begin:Of,lights_toon_fragment:Bf,lights_toon_pars_fragment:zf,lights_phong_fragment:kf,lights_phong_pars_fragment:Gf,lights_physical_fragment:Hf,lights_physical_pars_fragment:Vf,lights_fragment_begin:Wf,lights_fragment_maps:Xf,lights_fragment_end:Yf,logdepthbuf_fragment:$f,logdepthbuf_pars_fragment:jf,logdepthbuf_pars_vertex:qf,logdepthbuf_vertex:Kf,map_fragment:Zf,map_pars_fragment:Jf,map_particle_fragment:Qf,map_particle_pars_fragment:ep,metalnessmap_fragment:tp,metalnessmap_pars_fragment:np,morphinstance_vertex:ip,morphcolor_vertex:sp,morphnormal_vertex:rp,morphtarget_pars_vertex:op,morphtarget_vertex:ap,normal_fragment_begin:lp,normal_fragment_maps:cp,normal_pars_fragment:hp,normal_pars_vertex:dp,normal_vertex:up,normalmap_pars_fragment:fp,clearcoat_normal_fragment_begin:pp,clearcoat_normal_fragment_maps:mp,clearcoat_pars_fragment:gp,iridescence_pars_fragment:_p,opaque_fragment:xp,packing:yp,premultiplied_alpha_fragment:Mp,project_vertex:vp,dithering_fragment:Ep,dithering_pars_fragment:Sp,roughnessmap_fragment:bp,roughnessmap_pars_fragment:Tp,shadowmap_pars_fragment:Ap,shadowmap_pars_vertex:wp,shadowmap_vertex:Rp,shadowmask_pars_fragment:Cp,skinbase_vertex:Pp,skinning_pars_vertex:Ip,skinning_vertex:Lp,skinnormal_vertex:Dp,specularmap_fragment:Np,specularmap_pars_fragment:Up,tonemapping_fragment:Op,tonemapping_pars_fragment:Fp,transmission_fragment:Bp,transmission_pars_fragment:zp,uv_pars_fragment:kp,uv_pars_vertex:Gp,uv_vertex:Hp,worldpos_vertex:Vp,background_vert:Wp,background_frag:Xp,backgroundCube_vert:Yp,backgroundCube_frag:$p,cube_vert:jp,cube_frag:qp,depth_vert:Kp,depth_frag:Zp,distanceRGBA_vert:Jp,distanceRGBA_frag:Qp,equirect_vert:em,equirect_frag:tm,linedashed_vert:nm,linedashed_frag:im,meshbasic_vert:sm,meshbasic_frag:rm,meshlambert_vert:om,meshlambert_frag:am,meshmatcap_vert:lm,meshmatcap_frag:cm,meshnormal_vert:hm,meshnormal_frag:dm,meshphong_vert:um,meshphong_frag:fm,meshphysical_vert:pm,meshphysical_frag:mm,meshtoon_vert:gm,meshtoon_frag:_m,points_vert:xm,points_frag:ym,shadow_vert:Mm,shadow_frag:vm,sprite_vert:Em,sprite_frag:Sm},te={common:{diffuse:{value:new Te(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Le},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Le}},envmap:{envMap:{value:null},envMapRotation:{value:new Le},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Le}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Le}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Le},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Le},normalScale:{value:new Ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Le},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Le}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Le}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Le}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Te(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Te(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0},uvTransform:{value:new Le}},sprite:{diffuse:{value:new Te(16777215)},opacity:{value:1},center:{value:new Ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Le},alphaMap:{value:null},alphaMapTransform:{value:new Le},alphaTest:{value:0}}},hn={basic:{uniforms:It([te.common,te.specularmap,te.envmap,te.aomap,te.lightmap,te.fog]),vertexShader:Ne.meshbasic_vert,fragmentShader:Ne.meshbasic_frag},lambert:{uniforms:It([te.common,te.specularmap,te.envmap,te.aomap,te.lightmap,te.emissivemap,te.bumpmap,te.normalmap,te.displacementmap,te.fog,te.lights,{emissive:{value:new Te(0)}}]),vertexShader:Ne.meshlambert_vert,fragmentShader:Ne.meshlambert_frag},phong:{uniforms:It([te.common,te.specularmap,te.envmap,te.aomap,te.lightmap,te.emissivemap,te.bumpmap,te.normalmap,te.displacementmap,te.fog,te.lights,{emissive:{value:new Te(0)},specular:{value:new Te(1118481)},shininess:{value:30}}]),vertexShader:Ne.meshphong_vert,fragmentShader:Ne.meshphong_frag},standard:{uniforms:It([te.common,te.envmap,te.aomap,te.lightmap,te.emissivemap,te.bumpmap,te.normalmap,te.displacementmap,te.roughnessmap,te.metalnessmap,te.fog,te.lights,{emissive:{value:new Te(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ne.meshphysical_vert,fragmentShader:Ne.meshphysical_frag},toon:{uniforms:It([te.common,te.aomap,te.lightmap,te.emissivemap,te.bumpmap,te.normalmap,te.displacementmap,te.gradientmap,te.fog,te.lights,{emissive:{value:new Te(0)}}]),vertexShader:Ne.meshtoon_vert,fragmentShader:Ne.meshtoon_frag},matcap:{uniforms:It([te.common,te.bumpmap,te.normalmap,te.displacementmap,te.fog,{matcap:{value:null}}]),vertexShader:Ne.meshmatcap_vert,fragmentShader:Ne.meshmatcap_frag},points:{uniforms:It([te.points,te.fog]),vertexShader:Ne.points_vert,fragmentShader:Ne.points_frag},dashed:{uniforms:It([te.common,te.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ne.linedashed_vert,fragmentShader:Ne.linedashed_frag},depth:{uniforms:It([te.common,te.displacementmap]),vertexShader:Ne.depth_vert,fragmentShader:Ne.depth_frag},normal:{uniforms:It([te.common,te.bumpmap,te.normalmap,te.displacementmap,{opacity:{value:1}}]),vertexShader:Ne.meshnormal_vert,fragmentShader:Ne.meshnormal_frag},sprite:{uniforms:It([te.sprite,te.fog]),vertexShader:Ne.sprite_vert,fragmentShader:Ne.sprite_frag},background:{uniforms:{uvTransform:{value:new Le},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ne.background_vert,fragmentShader:Ne.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Le}},vertexShader:Ne.backgroundCube_vert,fragmentShader:Ne.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ne.cube_vert,fragmentShader:Ne.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ne.equirect_vert,fragmentShader:Ne.equirect_frag},distanceRGBA:{uniforms:It([te.common,te.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ne.distanceRGBA_vert,fragmentShader:Ne.distanceRGBA_frag},shadow:{uniforms:It([te.lights,te.fog,{color:{value:new Te(0)},opacity:{value:1}}]),vertexShader:Ne.shadow_vert,fragmentShader:Ne.shadow_frag}};hn.physical={uniforms:It([hn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Le},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Le},clearcoatNormalScale:{value:new Ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Le},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Le},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Le},sheen:{value:0},sheenColor:{value:new Te(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Le},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Le},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Le},transmissionSamplerSize:{value:new Ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Le},attenuationDistance:{value:0},attenuationColor:{value:new Te(0)},specularColor:{value:new Te(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Le},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Le},anisotropyVector:{value:new Ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Le}}]),vertexShader:Ne.meshphysical_vert,fragmentShader:Ne.meshphysical_frag};const Ks={r:0,b:0,g:0},Zn=new cn,bm=new Pe;function Tm(s,e,t,n,i,r,o){const a=new Te(0);let l=r===!0?0:1,c,h,u=null,d=0,f=null;function g(y){let x=y.isScene===!0?y.background:null;return x&&x.isTexture&&(x=(y.backgroundBlurriness>0?t:e).get(x)),x}function _(y){let x=!1;const C=g(y);C===null?p(a,l):C&&C.isColor&&(p(C,1),x=!0);const T=s.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,o):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(y,x){const C=g(x);C&&(C.isCubeTexture||C.mapping===gr)?(h===void 0&&(h=new ct(new ms(1,1,1),new Wn({name:"BackgroundCubeMaterial",uniforms:zi(hn.backgroundCube.uniforms),vertexShader:hn.backgroundCube.vertexShader,fragmentShader:hn.backgroundCube.fragmentShader,side:Bt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(T,R,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Zn.copy(x.backgroundRotation),Zn.x*=-1,Zn.y*=-1,Zn.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(Zn.y*=-1,Zn.z*=-1),h.material.uniforms.envMap.value=C,h.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(bm.makeRotationFromEuler(Zn)),h.material.toneMapped=He.getTransfer(C.colorSpace)!==Qe,(u!==C||d!==C.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=C,d=C.version,f=s.toneMapping),h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null)):C&&C.isTexture&&(c===void 0&&(c=new ct(new gs(2,2),new Wn({name:"BackgroundMaterial",uniforms:zi(hn.background.uniforms),vertexShader:hn.background.vertexShader,fragmentShader:hn.background.fragmentShader,side:Pn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=C,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=He.getTransfer(C.colorSpace)!==Qe,C.matrixAutoUpdate===!0&&C.updateMatrix(),c.material.uniforms.uvTransform.value.copy(C.matrix),(u!==C||d!==C.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,u=C,d=C.version,f=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function p(y,x){y.getRGB(Ks,zc(s)),n.buffers.color.setClear(Ks.r,Ks.g,Ks.b,x,o)}function M(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,x=1){a.set(y),l=x,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(a,l)},render:_,addToRenderList:m,dispose:M}}function Am(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null);let r=i,o=!1;function a(v,I,B,O,V){let W=!1;const F=u(O,B,I);r!==F&&(r=F,c(r.object)),W=f(v,O,B,V),W&&g(v,O,B,V),V!==null&&e.update(V,s.ELEMENT_ARRAY_BUFFER),(W||o)&&(o=!1,x(v,I,B,O),V!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function l(){return s.createVertexArray()}function c(v){return s.bindVertexArray(v)}function h(v){return s.deleteVertexArray(v)}function u(v,I,B){const O=B.wireframe===!0;let V=n[v.id];V===void 0&&(V={},n[v.id]=V);let W=V[I.id];W===void 0&&(W={},V[I.id]=W);let F=W[O];return F===void 0&&(F=d(l()),W[O]=F),F}function d(v){const I=[],B=[],O=[];for(let V=0;V<t;V++)I[V]=0,B[V]=0,O[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:B,attributeDivisors:O,object:v,attributes:{},index:null}}function f(v,I,B,O){const V=r.attributes,W=I.attributes;let F=0;const K=B.getAttributes();for(const z in K)if(K[z].location>=0){const he=V[z];let xe=W[z];if(xe===void 0&&(z==="instanceMatrix"&&v.instanceMatrix&&(xe=v.instanceMatrix),z==="instanceColor"&&v.instanceColor&&(xe=v.instanceColor)),he===void 0||he.attribute!==xe||xe&&he.data!==xe.data)return!0;F++}return r.attributesNum!==F||r.index!==O}function g(v,I,B,O){const V={},W=I.attributes;let F=0;const K=B.getAttributes();for(const z in K)if(K[z].location>=0){let he=W[z];he===void 0&&(z==="instanceMatrix"&&v.instanceMatrix&&(he=v.instanceMatrix),z==="instanceColor"&&v.instanceColor&&(he=v.instanceColor));const xe={};xe.attribute=he,he&&he.data&&(xe.data=he.data),V[z]=xe,F++}r.attributes=V,r.attributesNum=F,r.index=O}function _(){const v=r.newAttributes;for(let I=0,B=v.length;I<B;I++)v[I]=0}function m(v){p(v,0)}function p(v,I){const B=r.newAttributes,O=r.enabledAttributes,V=r.attributeDivisors;B[v]=1,O[v]===0&&(s.enableVertexAttribArray(v),O[v]=1),V[v]!==I&&(s.vertexAttribDivisor(v,I),V[v]=I)}function M(){const v=r.newAttributes,I=r.enabledAttributes;for(let B=0,O=I.length;B<O;B++)I[B]!==v[B]&&(s.disableVertexAttribArray(B),I[B]=0)}function y(v,I,B,O,V,W,F){F===!0?s.vertexAttribIPointer(v,I,B,V,W):s.vertexAttribPointer(v,I,B,O,V,W)}function x(v,I,B,O){_();const V=O.attributes,W=B.getAttributes(),F=I.defaultAttributeValues;for(const K in W){const z=W[K];if(z.location>=0){let se=V[K];if(se===void 0&&(K==="instanceMatrix"&&v.instanceMatrix&&(se=v.instanceMatrix),K==="instanceColor"&&v.instanceColor&&(se=v.instanceColor)),se!==void 0){const he=se.normalized,xe=se.itemSize,Oe=e.get(se);if(Oe===void 0)continue;const tt=Oe.buffer,$=Oe.type,ee=Oe.bytesPerElement,me=$===s.INT||$===s.UNSIGNED_INT||se.gpuType===aa;if(se.isInterleavedBufferAttribute){const re=se.data,Se=re.stride,Ye=se.offset;if(re.isInstancedInterleavedBuffer){for(let Ae=0;Ae<z.locationSize;Ae++)p(z.location+Ae,re.meshPerAttribute);v.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Ae=0;Ae<z.locationSize;Ae++)m(z.location+Ae);s.bindBuffer(s.ARRAY_BUFFER,tt);for(let Ae=0;Ae<z.locationSize;Ae++)y(z.location+Ae,xe/z.locationSize,$,he,Se*ee,(Ye+xe/z.locationSize*Ae)*ee,me)}else{if(se.isInstancedBufferAttribute){for(let re=0;re<z.locationSize;re++)p(z.location+re,se.meshPerAttribute);v.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let re=0;re<z.locationSize;re++)m(z.location+re);s.bindBuffer(s.ARRAY_BUFFER,tt);for(let re=0;re<z.locationSize;re++)y(z.location+re,xe/z.locationSize,$,he,xe*ee,xe/z.locationSize*re*ee,me)}}else if(F!==void 0){const he=F[K];if(he!==void 0)switch(he.length){case 2:s.vertexAttrib2fv(z.location,he);break;case 3:s.vertexAttrib3fv(z.location,he);break;case 4:s.vertexAttrib4fv(z.location,he);break;default:s.vertexAttrib1fv(z.location,he)}}}}M()}function C(){P();for(const v in n){const I=n[v];for(const B in I){const O=I[B];for(const V in O)h(O[V].object),delete O[V];delete I[B]}delete n[v]}}function T(v){if(n[v.id]===void 0)return;const I=n[v.id];for(const B in I){const O=I[B];for(const V in O)h(O[V].object),delete O[V];delete I[B]}delete n[v.id]}function R(v){for(const I in n){const B=n[I];if(B[v.id]===void 0)continue;const O=B[v.id];for(const V in O)h(O[V].object),delete O[V];delete B[v.id]}}function P(){S(),o=!0,r!==i&&(r=i,c(r.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:P,resetDefaultState:S,dispose:C,releaseStatesOfGeometry:T,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:m,disableUnusedAttributes:M}}function wm(s,e,t){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*d[_];t.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Rm(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(R){return!(R!==Zt&&n.convert(R)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const P=R===ps&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==In&&n.convert(R)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==on&&!P)}function l(R){if(R==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),M=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),y=s.getParameter(s.MAX_VARYING_VECTORS),x=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,T=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:y,maxFragmentUniforms:x,vertexTextures:C,maxSamples:T}}function Cm(s){const e=this;let t=null,n=0,i=!1,r=!1;const o=new qt,a=new Le,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,p=s.get(u);if(!i||g===null||g.length===0||r&&!m)r?h(null):c();else{const M=r?0:n,y=M*4;let x=p.clippingState||null;l.value=x,x=h(g,d,y,f);for(let C=0;C!==y;++C)x[C]=t[C];p.clippingState=x,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=f+_*4,M=d.matrixWorldInverse;a.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,x=f;y!==_;++y,x+=4)o.copy(u[y]).applyMatrix4(M,a),o.normal.toArray(m,x),m[x+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Pm(s){let e=new WeakMap;function t(o,a){return a===xo?o.mapping=Ni:a===yo&&(o.mapping=Ui),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===xo||a===yo)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new jd(l.height);return c.fromEquirectangularTexture(s,o),e.set(o,c),o.addEventListener("dispose",i),t(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const Ai=4,Nl=[.125,.215,.35,.446,.526,.582],ii=20,Jr=new Sa,Ul=new Te;let Qr=null,eo=0,to=0,no=!1;const ti=(1+Math.sqrt(5))/2,Si=1/ti,Ol=[new A(-ti,Si,0),new A(ti,Si,0),new A(-Si,0,ti),new A(Si,0,ti),new A(0,ti,-Si),new A(0,ti,Si),new A(-1,1,-1),new A(1,1,-1),new A(-1,1,1),new A(1,1,1)],Im=new A;class Fl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100,r={}){const{size:o=256,position:a=Im}=r;Qr=this._renderer.getRenderTarget(),eo=this._renderer.getActiveCubeFace(),to=this._renderer.getActiveMipmapLevel(),no=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,i,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Qr,eo,to),this._renderer.xr.enabled=no,e.scissorTest=!1,Zs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ni||e.mapping===Ui?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Qr=this._renderer.getRenderTarget(),eo=this._renderer.getActiveCubeFace(),to=this._renderer.getActiveMipmapLevel(),no=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Vt,minFilter:Vt,generateMipmaps:!1,type:ps,format:Zt,colorSpace:Dt,depthBuffer:!1},i=Bl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Bl(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Lm(r)),this._blurMaterial=Dm(r,e,t)}return i}_compileMaterial(e){const t=new ct(this._lodPlanes[0],e);this._renderer.compile(t,Jr)}_sceneToCubeUV(e,t,n,i,r){const l=new Lt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Ul),u.toneMapping=Vn,u.autoClear=!1;const g=new Ot({name:"PMREM.Background",side:Bt,depthWrite:!1,depthTest:!1}),_=new ct(new ms,g);let m=!1;const p=e.background;p?p.isColor&&(g.color.copy(p),e.background=null,m=!0):(g.color.copy(Ul),m=!0);for(let M=0;M<6;M++){const y=M%3;y===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[M],r.y,r.z)):y===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[M]));const x=this._cubeSize;Zs(i,y*x,M>2?x:0,x,x),u.setRenderTarget(i),m&&u.render(_,l),u.render(e,l)}_.geometry.dispose(),_.material.dispose(),u.toneMapping=f,u.autoClear=d,e.background=p}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Ni||e.mapping===Ui;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=kl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zl());const r=i?this._cubemapMaterial:this._equirectMaterial,o=new ct(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Zs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Jr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Ol[(i-r-1)%Ol.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",r),this._halfBlur(o,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ct(this._lodPlanes[i],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ii-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):ii;m>ii&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ii}`);const p=[];let M=0;for(let R=0;R<ii;++R){const P=R/_,S=Math.exp(-P*P/2);p.push(S),R===0?M+=S:R<m&&(M+=2*S)}for(let R=0;R<p.length;R++)p[R]=p[R]/M;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:y}=this;d.dTheta.value=g,d.mipInt.value=y-n;const x=this._sizeLods[i],C=3*x*(i>y-Ai?i-y+Ai:0),T=4*(this._cubeSize-x);Zs(t,C,T,3*x,2*x),l.setRenderTarget(t),l.render(u,Jr)}}function Lm(s){const e=[],t=[],n=[];let i=s;const r=s-Ai+1+Nl.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);t.push(a);let l=1/a;o>s-Ai?l=Nl[o-s+Ai-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,_=3,m=2,p=1,M=new Float32Array(_*g*f),y=new Float32Array(m*g*f),x=new Float32Array(p*g*f);for(let T=0;T<f;T++){const R=T%3*2/3-1,P=T>2?0:-1,S=[R,P,0,R+2/3,P,0,R+2/3,P+1,0,R,P,0,R+2/3,P+1,0,R,P+1,0];M.set(S,_*g*T),y.set(d,m*g*T);const v=[T,T,T,T,T,T];x.set(v,p*g*T)}const C=new St;C.setAttribute("position",new dt(M,_)),C.setAttribute("uv",new dt(y,m)),C.setAttribute("faceIndex",new dt(x,p)),e.push(C),i>Ai&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Bl(s,e,t){const n=new ri(s,e,t);return n.texture.mapping=gr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Zs(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Dm(s,e,t){const n=new Float32Array(ii),i=new A(0,1,0);return new Wn({name:"SphericalGaussianBlur",defines:{n:ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Aa(),fragmentShader:`

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
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function zl(){return new Wn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Aa(),fragmentShader:`

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
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function kl(){return new Wn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Aa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function Aa(){return`

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
	`}function Nm(s){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===xo||l===yo,h=l===Ni||l===Ui;if(c||h){let u=e.get(a);const d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new Fl(s)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&i(f)?(t===null&&(t=new Fl(s)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function i(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Um(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&ei("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Om(s,e,t,n){const i={},r=new WeakMap;function o(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete i[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const f in d)e.update(d[f],s.ARRAY_BUFFER)}function c(u){const d=[],f=u.index,g=u.attributes.position;let _=0;if(f!==null){const M=f.array;_=f.version;for(let y=0,x=M.length;y<x;y+=3){const C=M[y+0],T=M[y+1],R=M[y+2];d.push(C,T,T,R,R,C)}}else if(g!==void 0){const M=g.array;_=g.version;for(let y=0,x=M.length/3-1;y<x;y+=3){const C=y+0,T=y+1,R=y+2;d.push(C,T,T,R,R,C)}}else return;const m=new(Nc(d)?Bc:Fc)(d,1);m.version=_;const p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Fm(s,e,t){let n;function i(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){s.drawElements(n,f,r,d*o),t.update(f,n,1)}function c(d,f,g){g!==0&&(s.drawElementsInstanced(n,f,r,d*o,g),t.update(f,n,g))}function h(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function u(d,f,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/o,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,g);let p=0;for(let M=0;M<g;M++)p+=f[M]*_[M];t.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Bm(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function zm(s,e,t){const n=new WeakMap,i=new $e;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(a);if(d===void 0||d.count!==u){let S=function(){R.dispose(),n.delete(a),a.removeEventListener("dispose",S)};d!==void 0&&d.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],M=a.morphAttributes.color||[];let y=0;f===!0&&(y=1),g===!0&&(y=2),_===!0&&(y=3);let x=a.attributes.position.count*y,C=1;x>e.maxTextureSize&&(C=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);const T=new Float32Array(x*C*4*u),R=new Uc(T,x,C,u);R.type=on,R.needsUpdate=!0;const P=y*4;for(let v=0;v<u;v++){const I=m[v],B=p[v],O=M[v],V=x*C*4*v;for(let W=0;W<I.count;W++){const F=W*P;f===!0&&(i.fromBufferAttribute(I,W),T[V+F+0]=i.x,T[V+F+1]=i.y,T[V+F+2]=i.z,T[V+F+3]=0),g===!0&&(i.fromBufferAttribute(B,W),T[V+F+4]=i.x,T[V+F+5]=i.y,T[V+F+6]=i.z,T[V+F+7]=0),_===!0&&(i.fromBufferAttribute(O,W),T[V+F+8]=i.x,T[V+F+9]=i.y,T[V+F+10]=i.z,T[V+F+11]=O.itemSize===4?i.w:1)}}d={count:u,texture:R,size:new Ee(x,C)},n.set(a,d),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function km(s,e,t,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(t.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}const qc=new xt,Gl=new Xc(1,1),Kc=new Uc,Zc=new Id,Jc=new Gc,Hl=[],Vl=[],Wl=new Float32Array(16),Xl=new Float32Array(9),Yl=new Float32Array(4);function ji(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=Hl[i];if(r===void 0&&(r=new Float32Array(i),Hl[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function yt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Mt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function yr(s,e){let t=Vl[e];t===void 0&&(t=new Int32Array(e),Vl[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function Gm(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function Hm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;s.uniform2fv(this.addr,e),Mt(t,e)}}function Vm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yt(t,e))return;s.uniform3fv(this.addr,e),Mt(t,e)}}function Wm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;s.uniform4fv(this.addr,e),Mt(t,e)}}function Xm(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;Yl.set(n),s.uniformMatrix2fv(this.addr,!1,Yl),Mt(t,n)}}function Ym(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;Xl.set(n),s.uniformMatrix3fv(this.addr,!1,Xl),Mt(t,n)}}function $m(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;Wl.set(n),s.uniformMatrix4fv(this.addr,!1,Wl),Mt(t,n)}}function jm(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function qm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;s.uniform2iv(this.addr,e),Mt(t,e)}}function Km(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;s.uniform3iv(this.addr,e),Mt(t,e)}}function Zm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;s.uniform4iv(this.addr,e),Mt(t,e)}}function Jm(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Qm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;s.uniform2uiv(this.addr,e),Mt(t,e)}}function eg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;s.uniform3uiv(this.addr,e),Mt(t,e)}}function tg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;s.uniform4uiv(this.addr,e),Mt(t,e)}}function ng(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Gl.compareFunction=Dc,r=Gl):r=qc,t.setTexture2D(e||r,i)}function ig(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Zc,i)}function sg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Jc,i)}function rg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Kc,i)}function og(s){switch(s){case 5126:return Gm;case 35664:return Hm;case 35665:return Vm;case 35666:return Wm;case 35674:return Xm;case 35675:return Ym;case 35676:return $m;case 5124:case 35670:return jm;case 35667:case 35671:return qm;case 35668:case 35672:return Km;case 35669:case 35673:return Zm;case 5125:return Jm;case 36294:return Qm;case 36295:return eg;case 36296:return tg;case 35678:case 36198:case 36298:case 36306:case 35682:return ng;case 35679:case 36299:case 36307:return ig;case 35680:case 36300:case 36308:case 36293:return sg;case 36289:case 36303:case 36311:case 36292:return rg}}function ag(s,e){s.uniform1fv(this.addr,e)}function lg(s,e){const t=ji(e,this.size,2);s.uniform2fv(this.addr,t)}function cg(s,e){const t=ji(e,this.size,3);s.uniform3fv(this.addr,t)}function hg(s,e){const t=ji(e,this.size,4);s.uniform4fv(this.addr,t)}function dg(s,e){const t=ji(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function ug(s,e){const t=ji(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function fg(s,e){const t=ji(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function pg(s,e){s.uniform1iv(this.addr,e)}function mg(s,e){s.uniform2iv(this.addr,e)}function gg(s,e){s.uniform3iv(this.addr,e)}function _g(s,e){s.uniform4iv(this.addr,e)}function xg(s,e){s.uniform1uiv(this.addr,e)}function yg(s,e){s.uniform2uiv(this.addr,e)}function Mg(s,e){s.uniform3uiv(this.addr,e)}function vg(s,e){s.uniform4uiv(this.addr,e)}function Eg(s,e,t){const n=this.cache,i=e.length,r=yr(t,i);yt(n,r)||(s.uniform1iv(this.addr,r),Mt(n,r));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||qc,r[o])}function Sg(s,e,t){const n=this.cache,i=e.length,r=yr(t,i);yt(n,r)||(s.uniform1iv(this.addr,r),Mt(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||Zc,r[o])}function bg(s,e,t){const n=this.cache,i=e.length,r=yr(t,i);yt(n,r)||(s.uniform1iv(this.addr,r),Mt(n,r));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||Jc,r[o])}function Tg(s,e,t){const n=this.cache,i=e.length,r=yr(t,i);yt(n,r)||(s.uniform1iv(this.addr,r),Mt(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||Kc,r[o])}function Ag(s){switch(s){case 5126:return ag;case 35664:return lg;case 35665:return cg;case 35666:return hg;case 35674:return dg;case 35675:return ug;case 35676:return fg;case 5124:case 35670:return pg;case 35667:case 35671:return mg;case 35668:case 35672:return gg;case 35669:case 35673:return _g;case 5125:return xg;case 36294:return yg;case 36295:return Mg;case 36296:return vg;case 35678:case 36198:case 36298:case 36306:case 35682:return Eg;case 35679:case 36299:case 36307:return Sg;case 35680:case 36300:case 36308:case 36293:return bg;case 36289:case 36303:case 36311:case 36292:return Tg}}class wg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=og(t.type)}}class Rg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ag(t.type)}}class Cg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(e,t[a.id],n)}}}const io=/(\w+)(\])?(\[|\.)?/g;function $l(s,e){s.seq.push(e),s.map[e.id]=e}function Pg(s,e,t){const n=s.name,i=n.length;for(io.lastIndex=0;;){const r=io.exec(n),o=io.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){$l(t,c===void 0?new wg(a,s,e):new Rg(a,s,e));break}else{let u=t.map[a];u===void 0&&(u=new Cg(a),$l(t,u)),t=u}}}class lr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=e.getActiveUniform(t,i),o=e.getUniformLocation(t,r.name);Pg(r,o,this)}}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const o=e[i];o.id in t&&n.push(o)}return n}}function jl(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const Ig=37297;let Lg=0;function Dg(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const ql=new Le;function Ng(s){He._getMatrix(ql,He.workingColorSpace,s);const e=`mat3( ${ql.elements.map(t=>t.toFixed(4))} )`;switch(He.getTransfer(s)){case dr:return[e,"LinearTransferOETF"];case Qe:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Kl(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),i=s.getShaderInfoLog(e).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+i+`

`+Dg(s.getShaderSource(e),o)}else return i}function Ug(s,e){const t=Ng(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Og(s,e){let t;switch(e){case Gh:t="Linear";break;case Hh:t="Reinhard";break;case Vh:t="Cineon";break;case yc:t="ACESFilmic";break;case Xh:t="AgX";break;case Yh:t="Neutral";break;case Wh:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Js=new A;function Fg(){He.getLuminanceCoefficients(Js);const s=Js.x.toFixed(4),e=Js.y.toFixed(4),t=Js.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Bg(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(os).join(`
`)}function zg(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function kg(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function os(s){return s!==""}function Zl(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Jl(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Gg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Zo(s){return s.replace(Gg,Vg)}const Hg=new Map;function Vg(s,e){let t=Ne[e];if(t===void 0){const n=Hg.get(e);if(n!==void 0)t=Ne[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Zo(t)}const Wg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ql(s){return s.replace(Wg,Xg)}function Xg(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function ec(s){let e=`precision ${s.precision} float;
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
#define LOW_PRECISION`),e}function Yg(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===_c?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Mh?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Tn&&(e="SHADOWMAP_TYPE_VSM"),e}function $g(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Ni:case Ui:e="ENVMAP_TYPE_CUBE";break;case gr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function jg(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Ui:e="ENVMAP_MODE_REFRACTION";break}return e}function qg(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case xc:e="ENVMAP_BLENDING_MULTIPLY";break;case zh:e="ENVMAP_BLENDING_MIX";break;case kh:e="ENVMAP_BLENDING_ADD";break}return e}function Kg(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Zg(s,e,t,n){const i=s.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Yg(t),c=$g(t),h=jg(t),u=qg(t),d=Kg(t),f=Bg(t),g=zg(r),_=i.createProgram();let m,p,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(os).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(os).join(`
`),p.length>0&&(p+=`
`)):(m=[ec(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(os).join(`
`),p=[ec(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Vn?"#define TONE_MAPPING":"",t.toneMapping!==Vn?Ne.tonemapping_pars_fragment:"",t.toneMapping!==Vn?Og("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ne.colorspace_pars_fragment,Ug("linearToOutputTexel",t.outputColorSpace),Fg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(os).join(`
`)),o=Zo(o),o=Zl(o,t),o=Jl(o,t),a=Zo(a),a=Zl(a,t),a=Jl(a,t),o=Ql(o),a=Ql(a),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Xa?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Xa?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=M+m+o,x=M+p+a,C=jl(i,i.VERTEX_SHADER,y),T=jl(i,i.FRAGMENT_SHADER,x);i.attachShader(_,C),i.attachShader(_,T),t.index0AttributeName!==void 0?i.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function R(I){if(s.debug.checkShaderErrors){const B=i.getProgramInfoLog(_).trim(),O=i.getShaderInfoLog(C).trim(),V=i.getShaderInfoLog(T).trim();let W=!0,F=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(W=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,_,C,T);else{const K=Kl(i,C,"vertex"),z=Kl(i,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+B+`
`+K+`
`+z)}else B!==""?console.warn("THREE.WebGLProgram: Program Info Log:",B):(O===""||V==="")&&(F=!1);F&&(I.diagnostics={runnable:W,programLog:B,vertexShader:{log:O,prefix:m},fragmentShader:{log:V,prefix:p}})}i.deleteShader(C),i.deleteShader(T),P=new lr(i,_),S=kg(i,_)}let P;this.getUniforms=function(){return P===void 0&&R(this),P};let S;this.getAttributes=function(){return S===void 0&&R(this),S};let v=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=i.getProgramParameter(_,Ig)),v},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Lg++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=T,this}let Jg=0;class Qg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new e_(e),t.set(e,n)),n}}class e_{constructor(e){this.id=Jg++,this.code=e,this.usedTimes=0}}function t_(s,e,t,n,i,r,o){const a=new ga,l=new Qg,c=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,v,I,B,O){const V=B.fog,W=O.geometry,F=S.isMeshStandardMaterial?B.environment:null,K=(S.isMeshStandardMaterial?t:e).get(S.envMap||F),z=K&&K.mapping===gr?K.image.height:null,se=g[S.type];S.precision!==null&&(f=i.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));const he=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,xe=he!==void 0?he.length:0;let Oe=0;W.morphAttributes.position!==void 0&&(Oe=1),W.morphAttributes.normal!==void 0&&(Oe=2),W.morphAttributes.color!==void 0&&(Oe=3);let tt,$,ee,me;if(se){const Ke=hn[se];tt=Ke.vertexShader,$=Ke.fragmentShader}else tt=S.vertexShader,$=S.fragmentShader,l.update(S),ee=l.getVertexShaderID(S),me=l.getFragmentShaderID(S);const re=s.getRenderTarget(),Se=s.state.buffers.depth.getReversed(),Ye=O.isInstancedMesh===!0,Ae=O.isBatchedMesh===!0,ht=!!S.map,rt=!!S.matcap,Be=!!K,L=!!S.aoMap,Wt=!!S.lightMap,ze=!!S.bumpMap,ke=!!S.normalMap,ye=!!S.displacementMap,it=!!S.emissiveMap,_e=!!S.metalnessMap,w=!!S.roughnessMap,E=S.anisotropy>0,k=S.clearcoat>0,j=S.dispersion>0,Z=S.iridescence>0,Y=S.sheen>0,ge=S.transmission>0,oe=E&&!!S.anisotropyMap,de=k&&!!S.clearcoatMap,Ve=k&&!!S.clearcoatNormalMap,Q=k&&!!S.clearcoatRoughnessMap,ue=Z&&!!S.iridescenceMap,be=Z&&!!S.iridescenceThicknessMap,we=Y&&!!S.sheenColorMap,fe=Y&&!!S.sheenRoughnessMap,Ge=!!S.specularMap,De=!!S.specularColorMap,nt=!!S.specularIntensityMap,D=ge&&!!S.transmissionMap,ne=ge&&!!S.thicknessMap,X=!!S.gradientMap,q=!!S.alphaMap,le=S.alphaTest>0,ae=!!S.alphaHash,Ie=!!S.extensions;let at=Vn;S.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(at=s.toneMapping);const At={shaderID:se,shaderType:S.type,shaderName:S.name,vertexShader:tt,fragmentShader:$,defines:S.defines,customVertexShaderID:ee,customFragmentShaderID:me,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:Ae,batchingColor:Ae&&O._colorsTexture!==null,instancing:Ye,instancingColor:Ye&&O.instanceColor!==null,instancingMorph:Ye&&O.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:re===null?s.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:Dt,alphaToCoverage:!!S.alphaToCoverage,map:ht,matcap:rt,envMap:Be,envMapMode:Be&&K.mapping,envMapCubeUVHeight:z,aoMap:L,lightMap:Wt,bumpMap:ze,normalMap:ke,displacementMap:d&&ye,emissiveMap:it,normalMapObjectSpace:ke&&S.normalMapType===Jh,normalMapTangentSpace:ke&&S.normalMapType===Lc,metalnessMap:_e,roughnessMap:w,anisotropy:E,anisotropyMap:oe,clearcoat:k,clearcoatMap:de,clearcoatNormalMap:Ve,clearcoatRoughnessMap:Q,dispersion:j,iridescence:Z,iridescenceMap:ue,iridescenceThicknessMap:be,sheen:Y,sheenColorMap:we,sheenRoughnessMap:fe,specularMap:Ge,specularColorMap:De,specularIntensityMap:nt,transmission:ge,transmissionMap:D,thicknessMap:ne,gradientMap:X,opaque:S.transparent===!1&&S.blending===wi&&S.alphaToCoverage===!1,alphaMap:q,alphaTest:le,alphaHash:ae,combine:S.combine,mapUv:ht&&_(S.map.channel),aoMapUv:L&&_(S.aoMap.channel),lightMapUv:Wt&&_(S.lightMap.channel),bumpMapUv:ze&&_(S.bumpMap.channel),normalMapUv:ke&&_(S.normalMap.channel),displacementMapUv:ye&&_(S.displacementMap.channel),emissiveMapUv:it&&_(S.emissiveMap.channel),metalnessMapUv:_e&&_(S.metalnessMap.channel),roughnessMapUv:w&&_(S.roughnessMap.channel),anisotropyMapUv:oe&&_(S.anisotropyMap.channel),clearcoatMapUv:de&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:Ve&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:ue&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:be&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:we&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:fe&&_(S.sheenRoughnessMap.channel),specularMapUv:Ge&&_(S.specularMap.channel),specularColorMapUv:De&&_(S.specularColorMap.channel),specularIntensityMapUv:nt&&_(S.specularIntensityMap.channel),transmissionMapUv:D&&_(S.transmissionMap.channel),thicknessMapUv:ne&&_(S.thicknessMap.channel),alphaMapUv:q&&_(S.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(ke||E),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!W.attributes.uv&&(ht||q),fog:!!V,useFog:S.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Se,skinning:O.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:xe,morphTextureStride:Oe,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:s.shadowMap.enabled&&I.length>0,shadowMapType:s.shadowMap.type,toneMapping:at,decodeVideoTexture:ht&&S.map.isVideoTexture===!0&&He.getTransfer(S.map.colorSpace)===Qe,decodeVideoTextureEmissive:it&&S.emissiveMap.isVideoTexture===!0&&He.getTransfer(S.emissiveMap.colorSpace)===Qe,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Ft,flipSided:S.side===Bt,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ie&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ie&&S.extensions.multiDraw===!0||Ae)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return At.vertexUv1s=c.has(1),At.vertexUv2s=c.has(2),At.vertexUv3s=c.has(3),c.clear(),At}function p(S){const v=[];if(S.shaderID?v.push(S.shaderID):(v.push(S.customVertexShaderID),v.push(S.customFragmentShaderID)),S.defines!==void 0)for(const I in S.defines)v.push(I),v.push(S.defines[I]);return S.isRawShaderMaterial===!1&&(M(v,S),y(v,S),v.push(s.outputColorSpace)),v.push(S.customProgramCacheKey),v.join()}function M(S,v){S.push(v.precision),S.push(v.outputColorSpace),S.push(v.envMapMode),S.push(v.envMapCubeUVHeight),S.push(v.mapUv),S.push(v.alphaMapUv),S.push(v.lightMapUv),S.push(v.aoMapUv),S.push(v.bumpMapUv),S.push(v.normalMapUv),S.push(v.displacementMapUv),S.push(v.emissiveMapUv),S.push(v.metalnessMapUv),S.push(v.roughnessMapUv),S.push(v.anisotropyMapUv),S.push(v.clearcoatMapUv),S.push(v.clearcoatNormalMapUv),S.push(v.clearcoatRoughnessMapUv),S.push(v.iridescenceMapUv),S.push(v.iridescenceThicknessMapUv),S.push(v.sheenColorMapUv),S.push(v.sheenRoughnessMapUv),S.push(v.specularMapUv),S.push(v.specularColorMapUv),S.push(v.specularIntensityMapUv),S.push(v.transmissionMapUv),S.push(v.thicknessMapUv),S.push(v.combine),S.push(v.fogExp2),S.push(v.sizeAttenuation),S.push(v.morphTargetsCount),S.push(v.morphAttributeCount),S.push(v.numDirLights),S.push(v.numPointLights),S.push(v.numSpotLights),S.push(v.numSpotLightMaps),S.push(v.numHemiLights),S.push(v.numRectAreaLights),S.push(v.numDirLightShadows),S.push(v.numPointLightShadows),S.push(v.numSpotLightShadows),S.push(v.numSpotLightShadowsWithMaps),S.push(v.numLightProbes),S.push(v.shadowMapType),S.push(v.toneMapping),S.push(v.numClippingPlanes),S.push(v.numClipIntersection),S.push(v.depthPacking)}function y(S,v){a.disableAll(),v.supportsVertexTextures&&a.enable(0),v.instancing&&a.enable(1),v.instancingColor&&a.enable(2),v.instancingMorph&&a.enable(3),v.matcap&&a.enable(4),v.envMap&&a.enable(5),v.normalMapObjectSpace&&a.enable(6),v.normalMapTangentSpace&&a.enable(7),v.clearcoat&&a.enable(8),v.iridescence&&a.enable(9),v.alphaTest&&a.enable(10),v.vertexColors&&a.enable(11),v.vertexAlphas&&a.enable(12),v.vertexUv1s&&a.enable(13),v.vertexUv2s&&a.enable(14),v.vertexUv3s&&a.enable(15),v.vertexTangents&&a.enable(16),v.anisotropy&&a.enable(17),v.alphaHash&&a.enable(18),v.batching&&a.enable(19),v.dispersion&&a.enable(20),v.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),v.fog&&a.enable(0),v.useFog&&a.enable(1),v.flatShading&&a.enable(2),v.logarithmicDepthBuffer&&a.enable(3),v.reverseDepthBuffer&&a.enable(4),v.skinning&&a.enable(5),v.morphTargets&&a.enable(6),v.morphNormals&&a.enable(7),v.morphColors&&a.enable(8),v.premultipliedAlpha&&a.enable(9),v.shadowMapEnabled&&a.enable(10),v.doubleSided&&a.enable(11),v.flipSided&&a.enable(12),v.useDepthPacking&&a.enable(13),v.dithering&&a.enable(14),v.transmission&&a.enable(15),v.sheen&&a.enable(16),v.opaque&&a.enable(17),v.pointsUvs&&a.enable(18),v.decodeVideoTexture&&a.enable(19),v.decodeVideoTextureEmissive&&a.enable(20),v.alphaToCoverage&&a.enable(21),S.push(a.mask)}function x(S){const v=g[S.type];let I;if(v){const B=hn[v];I=Wd.clone(B.uniforms)}else I=S.uniforms;return I}function C(S,v){let I;for(let B=0,O=h.length;B<O;B++){const V=h[B];if(V.cacheKey===v){I=V,++I.usedTimes;break}}return I===void 0&&(I=new Zg(s,v,S,r),h.push(I)),I}function T(S){if(--S.usedTimes===0){const v=h.indexOf(S);h[v]=h[h.length-1],h.pop(),S.destroy()}}function R(S){l.remove(S)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:x,acquireProgram:C,releaseProgram:T,releaseShaderCache:R,programs:h,dispose:P}}function n_(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function i_(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function tc(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function nc(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(u,d,f,g,_,m){let p=s[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:f,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},s[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=_,p.group=m),e++,p}function a(u,d,f,g,_,m){const p=o(u,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function l(u,d,f,g,_,m){const p=o(u,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function c(u,d){t.length>1&&t.sort(u||i_),n.length>1&&n.sort(d||tc),i.length>1&&i.sort(d||tc)}function h(){for(let u=e,d=s.length;u<d;u++){const f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:a,unshift:l,finish:h,sort:c}}function s_(){let s=new WeakMap;function e(n,i){const r=s.get(n);let o;return r===void 0?(o=new nc,s.set(n,[o])):i>=r.length?(o=new nc,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function r_(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new A,color:new Te};break;case"SpotLight":t={position:new A,direction:new A,color:new Te,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new A,color:new Te,distance:0,decay:0};break;case"HemisphereLight":t={direction:new A,skyColor:new Te,groundColor:new Te};break;case"RectAreaLight":t={color:new Te,position:new A,halfWidth:new A,halfHeight:new A};break}return s[e.id]=t,t}}}function o_(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let a_=0;function l_(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function c_(s){const e=new r_,t=o_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new A);const i=new A,r=new Pe,o=new Pe;function a(c){let h=0,u=0,d=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,M=0,y=0,x=0,C=0,T=0,R=0;c.sort(l_);for(let S=0,v=c.length;S<v;S++){const I=c[S],B=I.color,O=I.intensity,V=I.distance,W=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=B.r*O,u+=B.g*O,d+=B.b*O;else if(I.isLightProbe){for(let F=0;F<9;F++)n.probe[F].addScaledVector(I.sh.coefficients[F],O);R++}else if(I.isDirectionalLight){const F=e.get(I);if(F.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const K=I.shadow,z=t.get(I);z.shadowIntensity=K.intensity,z.shadowBias=K.bias,z.shadowNormalBias=K.normalBias,z.shadowRadius=K.radius,z.shadowMapSize=K.mapSize,n.directionalShadow[f]=z,n.directionalShadowMap[f]=W,n.directionalShadowMatrix[f]=I.shadow.matrix,M++}n.directional[f]=F,f++}else if(I.isSpotLight){const F=e.get(I);F.position.setFromMatrixPosition(I.matrixWorld),F.color.copy(B).multiplyScalar(O),F.distance=V,F.coneCos=Math.cos(I.angle),F.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),F.decay=I.decay,n.spot[_]=F;const K=I.shadow;if(I.map&&(n.spotLightMap[C]=I.map,C++,K.updateMatrices(I),I.castShadow&&T++),n.spotLightMatrix[_]=K.matrix,I.castShadow){const z=t.get(I);z.shadowIntensity=K.intensity,z.shadowBias=K.bias,z.shadowNormalBias=K.normalBias,z.shadowRadius=K.radius,z.shadowMapSize=K.mapSize,n.spotShadow[_]=z,n.spotShadowMap[_]=W,x++}_++}else if(I.isRectAreaLight){const F=e.get(I);F.color.copy(B).multiplyScalar(O),F.halfWidth.set(I.width*.5,0,0),F.halfHeight.set(0,I.height*.5,0),n.rectArea[m]=F,m++}else if(I.isPointLight){const F=e.get(I);if(F.color.copy(I.color).multiplyScalar(I.intensity),F.distance=I.distance,F.decay=I.decay,I.castShadow){const K=I.shadow,z=t.get(I);z.shadowIntensity=K.intensity,z.shadowBias=K.bias,z.shadowNormalBias=K.normalBias,z.shadowRadius=K.radius,z.shadowMapSize=K.mapSize,z.shadowCameraNear=K.camera.near,z.shadowCameraFar=K.camera.far,n.pointShadow[g]=z,n.pointShadowMap[g]=W,n.pointShadowMatrix[g]=I.shadow.matrix,y++}n.point[g]=F,g++}else if(I.isHemisphereLight){const F=e.get(I);F.skyColor.copy(I.color).multiplyScalar(O),F.groundColor.copy(I.groundColor).multiplyScalar(O),n.hemi[p]=F,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=te.LTC_FLOAT_1,n.rectAreaLTC2=te.LTC_FLOAT_2):(n.rectAreaLTC1=te.LTC_HALF_1,n.rectAreaLTC2=te.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const P=n.hash;(P.directionalLength!==f||P.pointLength!==g||P.spotLength!==_||P.rectAreaLength!==m||P.hemiLength!==p||P.numDirectionalShadows!==M||P.numPointShadows!==y||P.numSpotShadows!==x||P.numSpotMaps!==C||P.numLightProbes!==R)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=x+C-T,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=R,P.directionalLength=f,P.pointLength=g,P.spotLength=_,P.rectAreaLength=m,P.hemiLength=p,P.numDirectionalShadows=M,P.numPointShadows=y,P.numSpotShadows=x,P.numSpotMaps=C,P.numLightProbes=R,n.version=a_++)}function l(c,h){let u=0,d=0,f=0,g=0,_=0;const m=h.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){const y=c[p];if(y.isDirectionalLight){const x=n.directional[u];x.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(m),u++}else if(y.isSpotLight){const x=n.spot[f];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(m),f++}else if(y.isRectAreaLight){const x=n.rectArea[g];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(m),o.identity(),r.copy(y.matrixWorld),r.premultiply(m),o.extractRotation(r),x.halfWidth.set(y.width*.5,0,0),x.halfHeight.set(0,y.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(y.isPointLight){const x=n.point[d];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(m),d++}else if(y.isHemisphereLight){const x=n.hemi[_];x.direction.setFromMatrixPosition(y.matrixWorld),x.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function ic(s){const e=new c_(s),t=[],n=[];function i(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function h_(s){let e=new WeakMap;function t(i,r=0){const o=e.get(i);let a;return o===void 0?(a=new ic(s),e.set(i,[a])):r>=o.length?(a=new ic(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const d_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,u_=`uniform sampler2D shadow_pass;
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
}`;function f_(s,e,t){let n=new ya;const i=new Ee,r=new Ee,o=new $e,a=new au({depthPacking:Zh}),l=new lu,c={},h=t.maxTextureSize,u={[Pn]:Bt,[Bt]:Pn,[Ft]:Ft},d=new Wn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ee},radius:{value:4}},vertexShader:d_,fragmentShader:u_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new St;g.setAttribute("position",new dt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ct(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=_c;let p=this.type;this.render=function(T,R,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const S=s.getRenderTarget(),v=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),B=s.state;B.setBlending(Hn),B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const O=p!==Tn&&this.type===Tn,V=p===Tn&&this.type!==Tn;for(let W=0,F=T.length;W<F;W++){const K=T[W],z=K.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);const se=z.getFrameExtents();if(i.multiply(se),r.copy(z.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/se.x),i.x=r.x*se.x,z.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/se.y),i.y=r.y*se.y,z.mapSize.y=r.y)),z.map===null||O===!0||V===!0){const xe=this.type!==Tn?{minFilter:Tt,magFilter:Tt}:{};z.map!==null&&z.map.dispose(),z.map=new ri(i.x,i.y,xe),z.map.texture.name=K.name+".shadowMap",z.camera.updateProjectionMatrix()}s.setRenderTarget(z.map),s.clear();const he=z.getViewportCount();for(let xe=0;xe<he;xe++){const Oe=z.getViewport(xe);o.set(r.x*Oe.x,r.y*Oe.y,r.x*Oe.z,r.y*Oe.w),B.viewport(o),z.updateMatrices(K,xe),n=z.getFrustum(),x(R,P,z.camera,K,this.type)}z.isPointLightShadow!==!0&&this.type===Tn&&M(z,P),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(S,v,I)};function M(T,R){const P=e.update(_);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new ri(i.x,i.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,s.setRenderTarget(T.mapPass),s.clear(),s.renderBufferDirect(R,null,P,d,_,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,s.setRenderTarget(T.map),s.clear(),s.renderBufferDirect(R,null,P,f,_,null)}function y(T,R,P,S){let v=null;const I=P.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(I!==void 0)v=I;else if(v=P.isPointLight===!0?l:a,s.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const B=v.uuid,O=R.uuid;let V=c[B];V===void 0&&(V={},c[B]=V);let W=V[O];W===void 0&&(W=v.clone(),V[O]=W,R.addEventListener("dispose",C)),v=W}if(v.visible=R.visible,v.wireframe=R.wireframe,S===Tn?v.side=R.shadowSide!==null?R.shadowSide:R.side:v.side=R.shadowSide!==null?R.shadowSide:u[R.side],v.alphaMap=R.alphaMap,v.alphaTest=R.alphaTest,v.map=R.map,v.clipShadows=R.clipShadows,v.clippingPlanes=R.clippingPlanes,v.clipIntersection=R.clipIntersection,v.displacementMap=R.displacementMap,v.displacementScale=R.displacementScale,v.displacementBias=R.displacementBias,v.wireframeLinewidth=R.wireframeLinewidth,v.linewidth=R.linewidth,P.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const B=s.properties.get(v);B.light=P}return v}function x(T,R,P,S,v){if(T.visible===!1)return;if(T.layers.test(R.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&v===Tn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,T.matrixWorld);const O=e.update(T),V=T.material;if(Array.isArray(V)){const W=O.groups;for(let F=0,K=W.length;F<K;F++){const z=W[F],se=V[z.materialIndex];if(se&&se.visible){const he=y(T,se,S,v);T.onBeforeShadow(s,T,R,P,O,he,z),s.renderBufferDirect(P,null,O,he,T,z),T.onAfterShadow(s,T,R,P,O,he,z)}}}else if(V.visible){const W=y(T,V,S,v);T.onBeforeShadow(s,T,R,P,O,W,null),s.renderBufferDirect(P,null,O,W,T,null),T.onAfterShadow(s,T,R,P,O,W,null)}}const B=T.children;for(let O=0,V=B.length;O<V;O++)x(B[O],R,P,S,v)}function C(T){T.target.removeEventListener("dispose",C);for(const P in c){const S=c[P],v=T.target.uuid;v in S&&(S[v].dispose(),delete S[v])}}}const p_={[ho]:uo,[fo]:go,[po]:_o,[Di]:mo,[uo]:ho,[go]:fo,[_o]:po,[mo]:Di};function m_(s,e){function t(){let D=!1;const ne=new $e;let X=null;const q=new $e(0,0,0,0);return{setMask:function(le){X!==le&&!D&&(s.colorMask(le,le,le,le),X=le)},setLocked:function(le){D=le},setClear:function(le,ae,Ie,at,At){At===!0&&(le*=at,ae*=at,Ie*=at),ne.set(le,ae,Ie,at),q.equals(ne)===!1&&(s.clearColor(le,ae,Ie,at),q.copy(ne))},reset:function(){D=!1,X=null,q.set(-1,0,0,0)}}}function n(){let D=!1,ne=!1,X=null,q=null,le=null;return{setReversed:function(ae){if(ne!==ae){const Ie=e.get("EXT_clip_control");ne?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT);const at=le;le=null,this.setClear(at)}ne=ae},getReversed:function(){return ne},setTest:function(ae){ae?re(s.DEPTH_TEST):Se(s.DEPTH_TEST)},setMask:function(ae){X!==ae&&!D&&(s.depthMask(ae),X=ae)},setFunc:function(ae){if(ne&&(ae=p_[ae]),q!==ae){switch(ae){case ho:s.depthFunc(s.NEVER);break;case uo:s.depthFunc(s.ALWAYS);break;case fo:s.depthFunc(s.LESS);break;case Di:s.depthFunc(s.LEQUAL);break;case po:s.depthFunc(s.EQUAL);break;case mo:s.depthFunc(s.GEQUAL);break;case go:s.depthFunc(s.GREATER);break;case _o:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}q=ae}},setLocked:function(ae){D=ae},setClear:function(ae){le!==ae&&(ne&&(ae=1-ae),s.clearDepth(ae),le=ae)},reset:function(){D=!1,X=null,q=null,le=null,ne=!1}}}function i(){let D=!1,ne=null,X=null,q=null,le=null,ae=null,Ie=null,at=null,At=null;return{setTest:function(Ke){D||(Ke?re(s.STENCIL_TEST):Se(s.STENCIL_TEST))},setMask:function(Ke){ne!==Ke&&!D&&(s.stencilMask(Ke),ne=Ke)},setFunc:function(Ke,Jt,xn){(X!==Ke||q!==Jt||le!==xn)&&(s.stencilFunc(Ke,Jt,xn),X=Ke,q=Jt,le=xn)},setOp:function(Ke,Jt,xn){(ae!==Ke||Ie!==Jt||at!==xn)&&(s.stencilOp(Ke,Jt,xn),ae=Ke,Ie=Jt,at=xn)},setLocked:function(Ke){D=Ke},setClear:function(Ke){At!==Ke&&(s.clearStencil(Ke),At=Ke)},reset:function(){D=!1,ne=null,X=null,q=null,le=null,ae=null,Ie=null,at=null,At=null}}}const r=new t,o=new n,a=new i,l=new WeakMap,c=new WeakMap;let h={},u={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,M=null,y=null,x=null,C=null,T=null,R=new Te(0,0,0),P=0,S=!1,v=null,I=null,B=null,O=null,V=null;const W=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let F=!1,K=0;const z=s.getParameter(s.VERSION);z.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(z)[1]),F=K>=1):z.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),F=K>=2);let se=null,he={};const xe=s.getParameter(s.SCISSOR_BOX),Oe=s.getParameter(s.VIEWPORT),tt=new $e().fromArray(xe),$=new $e().fromArray(Oe);function ee(D,ne,X,q){const le=new Uint8Array(4),ae=s.createTexture();s.bindTexture(D,ae),s.texParameteri(D,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(D,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ie=0;Ie<X;Ie++)D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY?s.texImage3D(ne,0,s.RGBA,1,1,q,0,s.RGBA,s.UNSIGNED_BYTE,le):s.texImage2D(ne+Ie,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,le);return ae}const me={};me[s.TEXTURE_2D]=ee(s.TEXTURE_2D,s.TEXTURE_2D,1),me[s.TEXTURE_CUBE_MAP]=ee(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),me[s.TEXTURE_2D_ARRAY]=ee(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),me[s.TEXTURE_3D]=ee(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),re(s.DEPTH_TEST),o.setFunc(Di),ze(!1),ke(Oa),re(s.CULL_FACE),L(Hn);function re(D){h[D]!==!0&&(s.enable(D),h[D]=!0)}function Se(D){h[D]!==!1&&(s.disable(D),h[D]=!1)}function Ye(D,ne){return u[D]!==ne?(s.bindFramebuffer(D,ne),u[D]=ne,D===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=ne),D===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=ne),!0):!1}function Ae(D,ne){let X=f,q=!1;if(D){X=d.get(ne),X===void 0&&(X=[],d.set(ne,X));const le=D.textures;if(X.length!==le.length||X[0]!==s.COLOR_ATTACHMENT0){for(let ae=0,Ie=le.length;ae<Ie;ae++)X[ae]=s.COLOR_ATTACHMENT0+ae;X.length=le.length,q=!0}}else X[0]!==s.BACK&&(X[0]=s.BACK,q=!0);q&&s.drawBuffers(X)}function ht(D){return g!==D?(s.useProgram(D),g=D,!0):!1}const rt={[ni]:s.FUNC_ADD,[Eh]:s.FUNC_SUBTRACT,[Sh]:s.FUNC_REVERSE_SUBTRACT};rt[bh]=s.MIN,rt[Th]=s.MAX;const Be={[Ah]:s.ZERO,[wh]:s.ONE,[Rh]:s.SRC_COLOR,[lo]:s.SRC_ALPHA,[Nh]:s.SRC_ALPHA_SATURATE,[Lh]:s.DST_COLOR,[Ph]:s.DST_ALPHA,[Ch]:s.ONE_MINUS_SRC_COLOR,[co]:s.ONE_MINUS_SRC_ALPHA,[Dh]:s.ONE_MINUS_DST_COLOR,[Ih]:s.ONE_MINUS_DST_ALPHA,[Uh]:s.CONSTANT_COLOR,[Oh]:s.ONE_MINUS_CONSTANT_COLOR,[Fh]:s.CONSTANT_ALPHA,[Bh]:s.ONE_MINUS_CONSTANT_ALPHA};function L(D,ne,X,q,le,ae,Ie,at,At,Ke){if(D===Hn){_===!0&&(Se(s.BLEND),_=!1);return}if(_===!1&&(re(s.BLEND),_=!0),D!==vh){if(D!==m||Ke!==S){if((p!==ni||x!==ni)&&(s.blendEquation(s.FUNC_ADD),p=ni,x=ni),Ke)switch(D){case wi:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Fa:s.blendFunc(s.ONE,s.ONE);break;case Ba:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case za:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case wi:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Fa:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Ba:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case za:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}M=null,y=null,C=null,T=null,R.set(0,0,0),P=0,m=D,S=Ke}return}le=le||ne,ae=ae||X,Ie=Ie||q,(ne!==p||le!==x)&&(s.blendEquationSeparate(rt[ne],rt[le]),p=ne,x=le),(X!==M||q!==y||ae!==C||Ie!==T)&&(s.blendFuncSeparate(Be[X],Be[q],Be[ae],Be[Ie]),M=X,y=q,C=ae,T=Ie),(at.equals(R)===!1||At!==P)&&(s.blendColor(at.r,at.g,at.b,At),R.copy(at),P=At),m=D,S=!1}function Wt(D,ne){D.side===Ft?Se(s.CULL_FACE):re(s.CULL_FACE);let X=D.side===Bt;ne&&(X=!X),ze(X),D.blending===wi&&D.transparent===!1?L(Hn):L(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);const q=D.stencilWrite;a.setTest(q),q&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),it(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?re(s.SAMPLE_ALPHA_TO_COVERAGE):Se(s.SAMPLE_ALPHA_TO_COVERAGE)}function ze(D){v!==D&&(D?s.frontFace(s.CW):s.frontFace(s.CCW),v=D)}function ke(D){D!==xh?(re(s.CULL_FACE),D!==I&&(D===Oa?s.cullFace(s.BACK):D===yh?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Se(s.CULL_FACE),I=D}function ye(D){D!==B&&(F&&s.lineWidth(D),B=D)}function it(D,ne,X){D?(re(s.POLYGON_OFFSET_FILL),(O!==ne||V!==X)&&(s.polygonOffset(ne,X),O=ne,V=X)):Se(s.POLYGON_OFFSET_FILL)}function _e(D){D?re(s.SCISSOR_TEST):Se(s.SCISSOR_TEST)}function w(D){D===void 0&&(D=s.TEXTURE0+W-1),se!==D&&(s.activeTexture(D),se=D)}function E(D,ne,X){X===void 0&&(se===null?X=s.TEXTURE0+W-1:X=se);let q=he[X];q===void 0&&(q={type:void 0,texture:void 0},he[X]=q),(q.type!==D||q.texture!==ne)&&(se!==X&&(s.activeTexture(X),se=X),s.bindTexture(D,ne||me[D]),q.type=D,q.texture=ne)}function k(){const D=he[se];D!==void 0&&D.type!==void 0&&(s.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function j(){try{s.compressedTexImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Z(){try{s.compressedTexImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Y(){try{s.texSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ge(){try{s.texSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function oe(){try{s.compressedTexSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function de(){try{s.compressedTexSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ve(){try{s.texStorage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Q(){try{s.texStorage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ue(){try{s.texImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function be(){try{s.texImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function we(D){tt.equals(D)===!1&&(s.scissor(D.x,D.y,D.z,D.w),tt.copy(D))}function fe(D){$.equals(D)===!1&&(s.viewport(D.x,D.y,D.z,D.w),$.copy(D))}function Ge(D,ne){let X=c.get(ne);X===void 0&&(X=new WeakMap,c.set(ne,X));let q=X.get(D);q===void 0&&(q=s.getUniformBlockIndex(ne,D.name),X.set(D,q))}function De(D,ne){const q=c.get(ne).get(D);l.get(ne)!==q&&(s.uniformBlockBinding(ne,q,D.__bindingPointIndex),l.set(ne,q))}function nt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},se=null,he={},u={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,M=null,y=null,x=null,C=null,T=null,R=new Te(0,0,0),P=0,S=!1,v=null,I=null,B=null,O=null,V=null,tt.set(0,0,s.canvas.width,s.canvas.height),$.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:re,disable:Se,bindFramebuffer:Ye,drawBuffers:Ae,useProgram:ht,setBlending:L,setMaterial:Wt,setFlipSided:ze,setCullFace:ke,setLineWidth:ye,setPolygonOffset:it,setScissorTest:_e,activeTexture:w,bindTexture:E,unbindTexture:k,compressedTexImage2D:j,compressedTexImage3D:Z,texImage2D:ue,texImage3D:be,updateUBOMapping:Ge,uniformBlockBinding:De,texStorage2D:Ve,texStorage3D:Q,texSubImage2D:Y,texSubImage3D:ge,compressedTexSubImage2D:oe,compressedTexSubImage3D:de,scissor:we,viewport:fe,reset:nt}}function g_(s,e,t,n,i,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ee,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(w,E){return f?new OffscreenCanvas(w,E):fs("canvas")}function _(w,E,k){let j=1;const Z=_e(w);if((Z.width>k||Z.height>k)&&(j=k/Math.max(Z.width,Z.height)),j<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){const Y=Math.floor(j*Z.width),ge=Math.floor(j*Z.height);u===void 0&&(u=g(Y,ge));const oe=E?g(Y,ge):u;return oe.width=Y,oe.height=ge,oe.getContext("2d").drawImage(w,0,0,Y,ge),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+Y+"x"+ge+")."),oe}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),w;return w}function m(w){return w.generateMipmaps}function p(w){s.generateMipmap(w)}function M(w){return w.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?s.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(w,E,k,j,Z=!1){if(w!==null){if(s[w]!==void 0)return s[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let Y=E;if(E===s.RED&&(k===s.FLOAT&&(Y=s.R32F),k===s.HALF_FLOAT&&(Y=s.R16F),k===s.UNSIGNED_BYTE&&(Y=s.R8)),E===s.RED_INTEGER&&(k===s.UNSIGNED_BYTE&&(Y=s.R8UI),k===s.UNSIGNED_SHORT&&(Y=s.R16UI),k===s.UNSIGNED_INT&&(Y=s.R32UI),k===s.BYTE&&(Y=s.R8I),k===s.SHORT&&(Y=s.R16I),k===s.INT&&(Y=s.R32I)),E===s.RG&&(k===s.FLOAT&&(Y=s.RG32F),k===s.HALF_FLOAT&&(Y=s.RG16F),k===s.UNSIGNED_BYTE&&(Y=s.RG8)),E===s.RG_INTEGER&&(k===s.UNSIGNED_BYTE&&(Y=s.RG8UI),k===s.UNSIGNED_SHORT&&(Y=s.RG16UI),k===s.UNSIGNED_INT&&(Y=s.RG32UI),k===s.BYTE&&(Y=s.RG8I),k===s.SHORT&&(Y=s.RG16I),k===s.INT&&(Y=s.RG32I)),E===s.RGB_INTEGER&&(k===s.UNSIGNED_BYTE&&(Y=s.RGB8UI),k===s.UNSIGNED_SHORT&&(Y=s.RGB16UI),k===s.UNSIGNED_INT&&(Y=s.RGB32UI),k===s.BYTE&&(Y=s.RGB8I),k===s.SHORT&&(Y=s.RGB16I),k===s.INT&&(Y=s.RGB32I)),E===s.RGBA_INTEGER&&(k===s.UNSIGNED_BYTE&&(Y=s.RGBA8UI),k===s.UNSIGNED_SHORT&&(Y=s.RGBA16UI),k===s.UNSIGNED_INT&&(Y=s.RGBA32UI),k===s.BYTE&&(Y=s.RGBA8I),k===s.SHORT&&(Y=s.RGBA16I),k===s.INT&&(Y=s.RGBA32I)),E===s.RGB&&k===s.UNSIGNED_INT_5_9_9_9_REV&&(Y=s.RGB9_E5),E===s.RGBA){const ge=Z?dr:He.getTransfer(j);k===s.FLOAT&&(Y=s.RGBA32F),k===s.HALF_FLOAT&&(Y=s.RGBA16F),k===s.UNSIGNED_BYTE&&(Y=ge===Qe?s.SRGB8_ALPHA8:s.RGBA8),k===s.UNSIGNED_SHORT_4_4_4_4&&(Y=s.RGBA4),k===s.UNSIGNED_SHORT_5_5_5_1&&(Y=s.RGB5_A1)}return(Y===s.R16F||Y===s.R32F||Y===s.RG16F||Y===s.RG32F||Y===s.RGBA16F||Y===s.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function x(w,E){let k;return w?E===null||E===si||E===Oi?k=s.DEPTH24_STENCIL8:E===on?k=s.DEPTH32F_STENCIL8:E===hs&&(k=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===si||E===Oi?k=s.DEPTH_COMPONENT24:E===on?k=s.DEPTH_COMPONENT32F:E===hs&&(k=s.DEPTH_COMPONENT16),k}function C(w,E){return m(w)===!0||w.isFramebufferTexture&&w.minFilter!==Tt&&w.minFilter!==Vt?Math.log2(Math.max(E.width,E.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?E.mipmaps.length:1}function T(w){const E=w.target;E.removeEventListener("dispose",T),P(E),E.isVideoTexture&&h.delete(E)}function R(w){const E=w.target;E.removeEventListener("dispose",R),v(E)}function P(w){const E=n.get(w);if(E.__webglInit===void 0)return;const k=w.source,j=d.get(k);if(j){const Z=j[E.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&S(w),Object.keys(j).length===0&&d.delete(k)}n.remove(w)}function S(w){const E=n.get(w);s.deleteTexture(E.__webglTexture);const k=w.source,j=d.get(k);delete j[E.__cacheKey],o.memory.textures--}function v(w){const E=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(E.__webglFramebuffer[j]))for(let Z=0;Z<E.__webglFramebuffer[j].length;Z++)s.deleteFramebuffer(E.__webglFramebuffer[j][Z]);else s.deleteFramebuffer(E.__webglFramebuffer[j]);E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer[j])}else{if(Array.isArray(E.__webglFramebuffer))for(let j=0;j<E.__webglFramebuffer.length;j++)s.deleteFramebuffer(E.__webglFramebuffer[j]);else s.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&s.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let j=0;j<E.__webglColorRenderbuffer.length;j++)E.__webglColorRenderbuffer[j]&&s.deleteRenderbuffer(E.__webglColorRenderbuffer[j]);E.__webglDepthRenderbuffer&&s.deleteRenderbuffer(E.__webglDepthRenderbuffer)}const k=w.textures;for(let j=0,Z=k.length;j<Z;j++){const Y=n.get(k[j]);Y.__webglTexture&&(s.deleteTexture(Y.__webglTexture),o.memory.textures--),n.remove(k[j])}n.remove(w)}let I=0;function B(){I=0}function O(){const w=I;return w>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+i.maxTextures),I+=1,w}function V(w){const E=[];return E.push(w.wrapS),E.push(w.wrapT),E.push(w.wrapR||0),E.push(w.magFilter),E.push(w.minFilter),E.push(w.anisotropy),E.push(w.internalFormat),E.push(w.format),E.push(w.type),E.push(w.generateMipmaps),E.push(w.premultiplyAlpha),E.push(w.flipY),E.push(w.unpackAlignment),E.push(w.colorSpace),E.join()}function W(w,E){const k=n.get(w);if(w.isVideoTexture&&ye(w),w.isRenderTargetTexture===!1&&w.version>0&&k.__version!==w.version){const j=w.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{$(k,w,E);return}}t.bindTexture(s.TEXTURE_2D,k.__webglTexture,s.TEXTURE0+E)}function F(w,E){const k=n.get(w);if(w.version>0&&k.__version!==w.version){$(k,w,E);return}t.bindTexture(s.TEXTURE_2D_ARRAY,k.__webglTexture,s.TEXTURE0+E)}function K(w,E){const k=n.get(w);if(w.version>0&&k.__version!==w.version){$(k,w,E);return}t.bindTexture(s.TEXTURE_3D,k.__webglTexture,s.TEXTURE0+E)}function z(w,E){const k=n.get(w);if(w.version>0&&k.__version!==w.version){ee(k,w,E);return}t.bindTexture(s.TEXTURE_CUBE_MAP,k.__webglTexture,s.TEXTURE0+E)}const se={[un]:s.REPEAT,[kn]:s.CLAMP_TO_EDGE,[hr]:s.MIRRORED_REPEAT},he={[Tt]:s.NEAREST,[vc]:s.NEAREST_MIPMAP_NEAREST,[rs]:s.NEAREST_MIPMAP_LINEAR,[Vt]:s.LINEAR,[er]:s.LINEAR_MIPMAP_NEAREST,[rn]:s.LINEAR_MIPMAP_LINEAR},xe={[Qh]:s.NEVER,[rd]:s.ALWAYS,[ed]:s.LESS,[Dc]:s.LEQUAL,[td]:s.EQUAL,[sd]:s.GEQUAL,[nd]:s.GREATER,[id]:s.NOTEQUAL};function Oe(w,E){if(E.type===on&&e.has("OES_texture_float_linear")===!1&&(E.magFilter===Vt||E.magFilter===er||E.magFilter===rs||E.magFilter===rn||E.minFilter===Vt||E.minFilter===er||E.minFilter===rs||E.minFilter===rn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(w,s.TEXTURE_WRAP_S,se[E.wrapS]),s.texParameteri(w,s.TEXTURE_WRAP_T,se[E.wrapT]),(w===s.TEXTURE_3D||w===s.TEXTURE_2D_ARRAY)&&s.texParameteri(w,s.TEXTURE_WRAP_R,se[E.wrapR]),s.texParameteri(w,s.TEXTURE_MAG_FILTER,he[E.magFilter]),s.texParameteri(w,s.TEXTURE_MIN_FILTER,he[E.minFilter]),E.compareFunction&&(s.texParameteri(w,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(w,s.TEXTURE_COMPARE_FUNC,xe[E.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===Tt||E.minFilter!==rs&&E.minFilter!==rn||E.type===on&&e.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||n.get(E).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");s.texParameterf(w,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,i.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy}}}function tt(w,E){let k=!1;w.__webglInit===void 0&&(w.__webglInit=!0,E.addEventListener("dispose",T));const j=E.source;let Z=d.get(j);Z===void 0&&(Z={},d.set(j,Z));const Y=V(E);if(Y!==w.__cacheKey){Z[Y]===void 0&&(Z[Y]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,k=!0),Z[Y].usedTimes++;const ge=Z[w.__cacheKey];ge!==void 0&&(Z[w.__cacheKey].usedTimes--,ge.usedTimes===0&&S(E)),w.__cacheKey=Y,w.__webglTexture=Z[Y].texture}return k}function $(w,E,k){let j=s.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(j=s.TEXTURE_2D_ARRAY),E.isData3DTexture&&(j=s.TEXTURE_3D);const Z=tt(w,E),Y=E.source;t.bindTexture(j,w.__webglTexture,s.TEXTURE0+k);const ge=n.get(Y);if(Y.version!==ge.__version||Z===!0){t.activeTexture(s.TEXTURE0+k);const oe=He.getPrimaries(He.workingColorSpace),de=E.colorSpace===zn?null:He.getPrimaries(E.colorSpace),Ve=E.colorSpace===zn||oe===de?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ve);let Q=_(E.image,!1,i.maxTextureSize);Q=it(E,Q);const ue=r.convert(E.format,E.colorSpace),be=r.convert(E.type);let we=y(E.internalFormat,ue,be,E.colorSpace,E.isVideoTexture);Oe(j,E);let fe;const Ge=E.mipmaps,De=E.isVideoTexture!==!0,nt=ge.__version===void 0||Z===!0,D=Y.dataReady,ne=C(E,Q);if(E.isDepthTexture)we=x(E.format===Fi,E.type),nt&&(De?t.texStorage2D(s.TEXTURE_2D,1,we,Q.width,Q.height):t.texImage2D(s.TEXTURE_2D,0,we,Q.width,Q.height,0,ue,be,null));else if(E.isDataTexture)if(Ge.length>0){De&&nt&&t.texStorage2D(s.TEXTURE_2D,ne,we,Ge[0].width,Ge[0].height);for(let X=0,q=Ge.length;X<q;X++)fe=Ge[X],De?D&&t.texSubImage2D(s.TEXTURE_2D,X,0,0,fe.width,fe.height,ue,be,fe.data):t.texImage2D(s.TEXTURE_2D,X,we,fe.width,fe.height,0,ue,be,fe.data);E.generateMipmaps=!1}else De?(nt&&t.texStorage2D(s.TEXTURE_2D,ne,we,Q.width,Q.height),D&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Q.width,Q.height,ue,be,Q.data)):t.texImage2D(s.TEXTURE_2D,0,we,Q.width,Q.height,0,ue,be,Q.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){De&&nt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,ne,we,Ge[0].width,Ge[0].height,Q.depth);for(let X=0,q=Ge.length;X<q;X++)if(fe=Ge[X],E.format!==Zt)if(ue!==null)if(De){if(D)if(E.layerUpdates.size>0){const le=Dl(fe.width,fe.height,E.format,E.type);for(const ae of E.layerUpdates){const Ie=fe.data.subarray(ae*le/fe.data.BYTES_PER_ELEMENT,(ae+1)*le/fe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,X,0,0,ae,fe.width,fe.height,1,ue,Ie)}E.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,X,0,0,0,fe.width,fe.height,Q.depth,ue,fe.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,X,we,fe.width,fe.height,Q.depth,0,fe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else De?D&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,X,0,0,0,fe.width,fe.height,Q.depth,ue,be,fe.data):t.texImage3D(s.TEXTURE_2D_ARRAY,X,we,fe.width,fe.height,Q.depth,0,ue,be,fe.data)}else{De&&nt&&t.texStorage2D(s.TEXTURE_2D,ne,we,Ge[0].width,Ge[0].height);for(let X=0,q=Ge.length;X<q;X++)fe=Ge[X],E.format!==Zt?ue!==null?De?D&&t.compressedTexSubImage2D(s.TEXTURE_2D,X,0,0,fe.width,fe.height,ue,fe.data):t.compressedTexImage2D(s.TEXTURE_2D,X,we,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):De?D&&t.texSubImage2D(s.TEXTURE_2D,X,0,0,fe.width,fe.height,ue,be,fe.data):t.texImage2D(s.TEXTURE_2D,X,we,fe.width,fe.height,0,ue,be,fe.data)}else if(E.isDataArrayTexture)if(De){if(nt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,ne,we,Q.width,Q.height,Q.depth),D)if(E.layerUpdates.size>0){const X=Dl(Q.width,Q.height,E.format,E.type);for(const q of E.layerUpdates){const le=Q.data.subarray(q*X/Q.data.BYTES_PER_ELEMENT,(q+1)*X/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,q,Q.width,Q.height,1,ue,be,le)}E.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ue,be,Q.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,we,Q.width,Q.height,Q.depth,0,ue,be,Q.data);else if(E.isData3DTexture)De?(nt&&t.texStorage3D(s.TEXTURE_3D,ne,we,Q.width,Q.height,Q.depth),D&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ue,be,Q.data)):t.texImage3D(s.TEXTURE_3D,0,we,Q.width,Q.height,Q.depth,0,ue,be,Q.data);else if(E.isFramebufferTexture){if(nt)if(De)t.texStorage2D(s.TEXTURE_2D,ne,we,Q.width,Q.height);else{let X=Q.width,q=Q.height;for(let le=0;le<ne;le++)t.texImage2D(s.TEXTURE_2D,le,we,X,q,0,ue,be,null),X>>=1,q>>=1}}else if(Ge.length>0){if(De&&nt){const X=_e(Ge[0]);t.texStorage2D(s.TEXTURE_2D,ne,we,X.width,X.height)}for(let X=0,q=Ge.length;X<q;X++)fe=Ge[X],De?D&&t.texSubImage2D(s.TEXTURE_2D,X,0,0,ue,be,fe):t.texImage2D(s.TEXTURE_2D,X,we,ue,be,fe);E.generateMipmaps=!1}else if(De){if(nt){const X=_e(Q);t.texStorage2D(s.TEXTURE_2D,ne,we,X.width,X.height)}D&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ue,be,Q)}else t.texImage2D(s.TEXTURE_2D,0,we,ue,be,Q);m(E)&&p(j),ge.__version=Y.version,E.onUpdate&&E.onUpdate(E)}w.__version=E.version}function ee(w,E,k){if(E.image.length!==6)return;const j=tt(w,E),Z=E.source;t.bindTexture(s.TEXTURE_CUBE_MAP,w.__webglTexture,s.TEXTURE0+k);const Y=n.get(Z);if(Z.version!==Y.__version||j===!0){t.activeTexture(s.TEXTURE0+k);const ge=He.getPrimaries(He.workingColorSpace),oe=E.colorSpace===zn?null:He.getPrimaries(E.colorSpace),de=E.colorSpace===zn||ge===oe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,de);const Ve=E.isCompressedTexture||E.image[0].isCompressedTexture,Q=E.image[0]&&E.image[0].isDataTexture,ue=[];for(let q=0;q<6;q++)!Ve&&!Q?ue[q]=_(E.image[q],!0,i.maxCubemapSize):ue[q]=Q?E.image[q].image:E.image[q],ue[q]=it(E,ue[q]);const be=ue[0],we=r.convert(E.format,E.colorSpace),fe=r.convert(E.type),Ge=y(E.internalFormat,we,fe,E.colorSpace),De=E.isVideoTexture!==!0,nt=Y.__version===void 0||j===!0,D=Z.dataReady;let ne=C(E,be);Oe(s.TEXTURE_CUBE_MAP,E);let X;if(Ve){De&&nt&&t.texStorage2D(s.TEXTURE_CUBE_MAP,ne,Ge,be.width,be.height);for(let q=0;q<6;q++){X=ue[q].mipmaps;for(let le=0;le<X.length;le++){const ae=X[le];E.format!==Zt?we!==null?De?D&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,le,0,0,ae.width,ae.height,we,ae.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,le,Ge,ae.width,ae.height,0,ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):De?D&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,le,0,0,ae.width,ae.height,we,fe,ae.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,le,Ge,ae.width,ae.height,0,we,fe,ae.data)}}}else{if(X=E.mipmaps,De&&nt){X.length>0&&ne++;const q=_e(ue[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,ne,Ge,q.width,q.height)}for(let q=0;q<6;q++)if(Q){De?D&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,0,0,ue[q].width,ue[q].height,we,fe,ue[q].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,Ge,ue[q].width,ue[q].height,0,we,fe,ue[q].data);for(let le=0;le<X.length;le++){const Ie=X[le].image[q].image;De?D&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,le+1,0,0,Ie.width,Ie.height,we,fe,Ie.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,le+1,Ge,Ie.width,Ie.height,0,we,fe,Ie.data)}}else{De?D&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,0,0,we,fe,ue[q]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,Ge,we,fe,ue[q]);for(let le=0;le<X.length;le++){const ae=X[le];De?D&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,le+1,0,0,we,fe,ae.image[q]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+q,le+1,Ge,we,fe,ae.image[q])}}}m(E)&&p(s.TEXTURE_CUBE_MAP),Y.__version=Z.version,E.onUpdate&&E.onUpdate(E)}w.__version=E.version}function me(w,E,k,j,Z,Y){const ge=r.convert(k.format,k.colorSpace),oe=r.convert(k.type),de=y(k.internalFormat,ge,oe,k.colorSpace),Ve=n.get(E),Q=n.get(k);if(Q.__renderTarget=E,!Ve.__hasExternalTextures){const ue=Math.max(1,E.width>>Y),be=Math.max(1,E.height>>Y);Z===s.TEXTURE_3D||Z===s.TEXTURE_2D_ARRAY?t.texImage3D(Z,Y,de,ue,be,E.depth,0,ge,oe,null):t.texImage2D(Z,Y,de,ue,be,0,ge,oe,null)}t.bindFramebuffer(s.FRAMEBUFFER,w),ke(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,j,Z,Q.__webglTexture,0,ze(E)):(Z===s.TEXTURE_2D||Z>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,j,Z,Q.__webglTexture,Y),t.bindFramebuffer(s.FRAMEBUFFER,null)}function re(w,E,k){if(s.bindRenderbuffer(s.RENDERBUFFER,w),E.depthBuffer){const j=E.depthTexture,Z=j&&j.isDepthTexture?j.type:null,Y=x(E.stencilBuffer,Z),ge=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,oe=ze(E);ke(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,oe,Y,E.width,E.height):k?s.renderbufferStorageMultisample(s.RENDERBUFFER,oe,Y,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,Y,E.width,E.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ge,s.RENDERBUFFER,w)}else{const j=E.textures;for(let Z=0;Z<j.length;Z++){const Y=j[Z],ge=r.convert(Y.format,Y.colorSpace),oe=r.convert(Y.type),de=y(Y.internalFormat,ge,oe,Y.colorSpace),Ve=ze(E);k&&ke(E)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ve,de,E.width,E.height):ke(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ve,de,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,de,E.width,E.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Se(w,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,w),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const j=n.get(E.depthTexture);j.__renderTarget=E,(!j.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),W(E.depthTexture,0);const Z=j.__webglTexture,Y=ze(E);if(E.depthTexture.format===Ri)ke(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Z,0,Y):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Z,0);else if(E.depthTexture.format===Fi)ke(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Z,0,Y):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function Ye(w){const E=n.get(w),k=w.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==w.depthTexture){const j=w.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),j){const Z=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,j.removeEventListener("dispose",Z)};j.addEventListener("dispose",Z),E.__depthDisposeCallback=Z}E.__boundDepthTexture=j}if(w.depthTexture&&!E.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");Se(E.__webglFramebuffer,w)}else if(k){E.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(t.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer[j]),E.__webglDepthbuffer[j]===void 0)E.__webglDepthbuffer[j]=s.createRenderbuffer(),re(E.__webglDepthbuffer[j],w,!1);else{const Z=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Y=E.__webglDepthbuffer[j];s.bindRenderbuffer(s.RENDERBUFFER,Y),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,Y)}}else if(t.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=s.createRenderbuffer(),re(E.__webglDepthbuffer,w,!1);else{const j=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Z=E.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,Z),s.framebufferRenderbuffer(s.FRAMEBUFFER,j,s.RENDERBUFFER,Z)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Ae(w,E,k){const j=n.get(w);E!==void 0&&me(j.__webglFramebuffer,w,w.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),k!==void 0&&Ye(w)}function ht(w){const E=w.texture,k=n.get(w),j=n.get(E);w.addEventListener("dispose",R);const Z=w.textures,Y=w.isWebGLCubeRenderTarget===!0,ge=Z.length>1;if(ge||(j.__webglTexture===void 0&&(j.__webglTexture=s.createTexture()),j.__version=E.version,o.memory.textures++),Y){k.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(E.mipmaps&&E.mipmaps.length>0){k.__webglFramebuffer[oe]=[];for(let de=0;de<E.mipmaps.length;de++)k.__webglFramebuffer[oe][de]=s.createFramebuffer()}else k.__webglFramebuffer[oe]=s.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){k.__webglFramebuffer=[];for(let oe=0;oe<E.mipmaps.length;oe++)k.__webglFramebuffer[oe]=s.createFramebuffer()}else k.__webglFramebuffer=s.createFramebuffer();if(ge)for(let oe=0,de=Z.length;oe<de;oe++){const Ve=n.get(Z[oe]);Ve.__webglTexture===void 0&&(Ve.__webglTexture=s.createTexture(),o.memory.textures++)}if(w.samples>0&&ke(w)===!1){k.__webglMultisampledFramebuffer=s.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let oe=0;oe<Z.length;oe++){const de=Z[oe];k.__webglColorRenderbuffer[oe]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,k.__webglColorRenderbuffer[oe]);const Ve=r.convert(de.format,de.colorSpace),Q=r.convert(de.type),ue=y(de.internalFormat,Ve,Q,de.colorSpace,w.isXRRenderTarget===!0),be=ze(w);s.renderbufferStorageMultisample(s.RENDERBUFFER,be,ue,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+oe,s.RENDERBUFFER,k.__webglColorRenderbuffer[oe])}s.bindRenderbuffer(s.RENDERBUFFER,null),w.depthBuffer&&(k.__webglDepthRenderbuffer=s.createRenderbuffer(),re(k.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(Y){t.bindTexture(s.TEXTURE_CUBE_MAP,j.__webglTexture),Oe(s.TEXTURE_CUBE_MAP,E);for(let oe=0;oe<6;oe++)if(E.mipmaps&&E.mipmaps.length>0)for(let de=0;de<E.mipmaps.length;de++)me(k.__webglFramebuffer[oe][de],w,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,de);else me(k.__webglFramebuffer[oe],w,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);m(E)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ge){for(let oe=0,de=Z.length;oe<de;oe++){const Ve=Z[oe],Q=n.get(Ve);t.bindTexture(s.TEXTURE_2D,Q.__webglTexture),Oe(s.TEXTURE_2D,Ve),me(k.__webglFramebuffer,w,Ve,s.COLOR_ATTACHMENT0+oe,s.TEXTURE_2D,0),m(Ve)&&p(s.TEXTURE_2D)}t.unbindTexture()}else{let oe=s.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(oe=w.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(oe,j.__webglTexture),Oe(oe,E),E.mipmaps&&E.mipmaps.length>0)for(let de=0;de<E.mipmaps.length;de++)me(k.__webglFramebuffer[de],w,E,s.COLOR_ATTACHMENT0,oe,de);else me(k.__webglFramebuffer,w,E,s.COLOR_ATTACHMENT0,oe,0);m(E)&&p(oe),t.unbindTexture()}w.depthBuffer&&Ye(w)}function rt(w){const E=w.textures;for(let k=0,j=E.length;k<j;k++){const Z=E[k];if(m(Z)){const Y=M(w),ge=n.get(Z).__webglTexture;t.bindTexture(Y,ge),p(Y),t.unbindTexture()}}}const Be=[],L=[];function Wt(w){if(w.samples>0){if(ke(w)===!1){const E=w.textures,k=w.width,j=w.height;let Z=s.COLOR_BUFFER_BIT;const Y=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ge=n.get(w),oe=E.length>1;if(oe)for(let de=0;de<E.length;de++)t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+de,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+de,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let de=0;de<E.length;de++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(Z|=s.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(Z|=s.STENCIL_BUFFER_BIT)),oe){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ge.__webglColorRenderbuffer[de]);const Ve=n.get(E[de]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Ve,0)}s.blitFramebuffer(0,0,k,j,0,0,k,j,Z,s.NEAREST),l===!0&&(Be.length=0,L.length=0,Be.push(s.COLOR_ATTACHMENT0+de),w.depthBuffer&&w.resolveDepthBuffer===!1&&(Be.push(Y),L.push(Y),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,L)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Be))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),oe)for(let de=0;de<E.length;de++){t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+de,s.RENDERBUFFER,ge.__webglColorRenderbuffer[de]);const Ve=n.get(E[de]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+de,s.TEXTURE_2D,Ve,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&l){const E=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[E])}}}function ze(w){return Math.min(i.maxSamples,w.samples)}function ke(w){const E=n.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function ye(w){const E=o.render.frame;h.get(w)!==E&&(h.set(w,E),w.update())}function it(w,E){const k=w.colorSpace,j=w.format,Z=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||k!==Dt&&k!==zn&&(He.getTransfer(k)===Qe?(j!==Zt||Z!==In)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),E}function _e(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=B,this.setTexture2D=W,this.setTexture2DArray=F,this.setTexture3D=K,this.setTextureCube=z,this.rebindTextures=Ae,this.setupRenderTarget=ht,this.updateRenderTargetMipmap=rt,this.updateMultisampleRenderTarget=Wt,this.setupDepthRenderbuffer=Ye,this.setupFrameBufferTexture=me,this.useMultisampledRTT=ke}function __(s,e){function t(n,i=zn){let r;const o=He.getTransfer(i);if(n===In)return s.UNSIGNED_BYTE;if(n===la)return s.UNSIGNED_SHORT_4_4_4_4;if(n===ca)return s.UNSIGNED_SHORT_5_5_5_1;if(n===bc)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Ec)return s.BYTE;if(n===Sc)return s.SHORT;if(n===hs)return s.UNSIGNED_SHORT;if(n===aa)return s.INT;if(n===si)return s.UNSIGNED_INT;if(n===on)return s.FLOAT;if(n===ps)return s.HALF_FLOAT;if(n===Tc)return s.ALPHA;if(n===Ac)return s.RGB;if(n===Zt)return s.RGBA;if(n===wc)return s.LUMINANCE;if(n===Rc)return s.LUMINANCE_ALPHA;if(n===Ri)return s.DEPTH_COMPONENT;if(n===Fi)return s.DEPTH_STENCIL;if(n===ha)return s.RED;if(n===da)return s.RED_INTEGER;if(n===Cc)return s.RG;if(n===ua)return s.RG_INTEGER;if(n===fa)return s.RGBA_INTEGER;if(n===tr||n===nr||n===ir||n===sr)if(o===Qe)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===tr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===tr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===nr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===sr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Mo||n===vo||n===Eo||n===So)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Mo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===vo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Eo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===So)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===bo||n===To||n===Ao)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===bo||n===To)return o===Qe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ao)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===wo||n===Ro||n===Co||n===Po||n===Io||n===Lo||n===Do||n===No||n===Uo||n===Oo||n===Fo||n===Bo||n===zo||n===ko)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===wo)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ro)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Co)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Po)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Io)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Lo)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Do)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===No)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Uo)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Oo)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Fo)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Bo)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===zo)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ko)return o===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===rr||n===Go||n===Ho)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===rr)return o===Qe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Go)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ho)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Pc||n===Vo||n===Wo||n===Xo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===rr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Vo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Wo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Xo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Oi?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}const x_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,y_=`
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

}`;class M_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new xt,r=e.properties.get(i);r.__webglTexture=t.texture,(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Wn({vertexShader:x_,fragmentShader:y_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ct(new gs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class v_ extends oi{constructor(e,t){super();const n=this;let i=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null;const _=new M_,m=t.getContextAttributes();let p=null,M=null;const y=[],x=[],C=new Ee;let T=null;const R=new Lt;R.viewport=new $e;const P=new Lt;P.viewport=new $e;const S=[R,P],v=new Pu;let I=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let ee=y[$];return ee===void 0&&(ee=new Wr,y[$]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function($){let ee=y[$];return ee===void 0&&(ee=new Wr,y[$]=ee),ee.getGripSpace()},this.getHand=function($){let ee=y[$];return ee===void 0&&(ee=new Wr,y[$]=ee),ee.getHandSpace()};function O($){const ee=x.indexOf($.inputSource);if(ee===-1)return;const me=y[ee];me!==void 0&&(me.update($.inputSource,$.frame,c||o),me.dispatchEvent({type:$.type,data:$.inputSource}))}function V(){i.removeEventListener("select",O),i.removeEventListener("selectstart",O),i.removeEventListener("selectend",O),i.removeEventListener("squeeze",O),i.removeEventListener("squeezestart",O),i.removeEventListener("squeezeend",O),i.removeEventListener("end",V),i.removeEventListener("inputsourceschange",W);for(let $=0;$<y.length;$++){const ee=x[$];ee!==null&&(x[$]=null,y[$].disconnect(ee))}I=null,B=null,_.reset(),e.setRenderTarget(p),f=null,d=null,u=null,i=null,M=null,tt.stop(),n.isPresenting=!1,e.setPixelRatio(T),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function($){if(i=$,i!==null){if(p=e.getRenderTarget(),i.addEventListener("select",O),i.addEventListener("selectstart",O),i.addEventListener("selectend",O),i.addEventListener("squeeze",O),i.addEventListener("squeezestart",O),i.addEventListener("squeezeend",O),i.addEventListener("end",V),i.addEventListener("inputsourceschange",W),m.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(C),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let me=null,re=null,Se=null;m.depth&&(Se=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,me=m.stencil?Fi:Ri,re=m.stencil?Oi:si);const Ye={colorFormat:t.RGBA8,depthFormat:Se,scaleFactor:r};u=new XRWebGLBinding(i,t),d=u.createProjectionLayer(Ye),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),M=new ri(d.textureWidth,d.textureHeight,{format:Zt,type:In,depthTexture:new Xc(d.textureWidth,d.textureHeight,re,void 0,void 0,void 0,void 0,void 0,void 0,me),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const me={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,me),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),M=new ri(f.framebufferWidth,f.framebufferHeight,{format:Zt,type:In,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),tt.setContext(i),tt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function W($){for(let ee=0;ee<$.removed.length;ee++){const me=$.removed[ee],re=x.indexOf(me);re>=0&&(x[re]=null,y[re].disconnect(me))}for(let ee=0;ee<$.added.length;ee++){const me=$.added[ee];let re=x.indexOf(me);if(re===-1){for(let Ye=0;Ye<y.length;Ye++)if(Ye>=x.length){x.push(me),re=Ye;break}else if(x[Ye]===null){x[Ye]=me,re=Ye;break}if(re===-1)break}const Se=y[re];Se&&Se.connect(me)}}const F=new A,K=new A;function z($,ee,me){F.setFromMatrixPosition(ee.matrixWorld),K.setFromMatrixPosition(me.matrixWorld);const re=F.distanceTo(K),Se=ee.projectionMatrix.elements,Ye=me.projectionMatrix.elements,Ae=Se[14]/(Se[10]-1),ht=Se[14]/(Se[10]+1),rt=(Se[9]+1)/Se[5],Be=(Se[9]-1)/Se[5],L=(Se[8]-1)/Se[0],Wt=(Ye[8]+1)/Ye[0],ze=Ae*L,ke=Ae*Wt,ye=re/(-L+Wt),it=ye*-L;if(ee.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(it),$.translateZ(ye),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),Se[10]===-1)$.projectionMatrix.copy(ee.projectionMatrix),$.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{const _e=Ae+ye,w=ht+ye,E=ze-it,k=ke+(re-it),j=rt*ht/w*_e,Z=Be*ht/w*_e;$.projectionMatrix.makePerspective(E,k,j,Z,_e,w),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function se($,ee){ee===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(ee.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(i===null)return;let ee=$.near,me=$.far;_.texture!==null&&(_.depthNear>0&&(ee=_.depthNear),_.depthFar>0&&(me=_.depthFar)),v.near=P.near=R.near=ee,v.far=P.far=R.far=me,(I!==v.near||B!==v.far)&&(i.updateRenderState({depthNear:v.near,depthFar:v.far}),I=v.near,B=v.far),R.layers.mask=$.layers.mask|2,P.layers.mask=$.layers.mask|4,v.layers.mask=R.layers.mask|P.layers.mask;const re=$.parent,Se=v.cameras;se(v,re);for(let Ye=0;Ye<Se.length;Ye++)se(Se[Ye],re);Se.length===2?z(v,R,P):v.projectionMatrix.copy(R.projectionMatrix),he($,v,re)};function he($,ee,me){me===null?$.matrix.copy(ee.matrixWorld):($.matrix.copy(me.matrixWorld),$.matrix.invert(),$.matrix.multiply(ee.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(ee.projectionMatrix),$.projectionMatrixInverse.copy(ee.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=Bi*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function($){l=$,d!==null&&(d.fixedFoveation=$),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=$)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(v)};let xe=null;function Oe($,ee){if(h=ee.getViewerPose(c||o),g=ee,h!==null){const me=h.views;f!==null&&(e.setRenderTargetFramebuffer(M,f.framebuffer),e.setRenderTarget(M));let re=!1;me.length!==v.cameras.length&&(v.cameras.length=0,re=!0);for(let Ae=0;Ae<me.length;Ae++){const ht=me[Ae];let rt=null;if(f!==null)rt=f.getViewport(ht);else{const L=u.getViewSubImage(d,ht);rt=L.viewport,Ae===0&&(e.setRenderTargetTextures(M,L.colorTexture,d.ignoreDepthValues?void 0:L.depthStencilTexture),e.setRenderTarget(M))}let Be=S[Ae];Be===void 0&&(Be=new Lt,Be.layers.enable(Ae),Be.viewport=new $e,S[Ae]=Be),Be.matrix.fromArray(ht.transform.matrix),Be.matrix.decompose(Be.position,Be.quaternion,Be.scale),Be.projectionMatrix.fromArray(ht.projectionMatrix),Be.projectionMatrixInverse.copy(Be.projectionMatrix).invert(),Be.viewport.set(rt.x,rt.y,rt.width,rt.height),Ae===0&&(v.matrix.copy(Be.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),re===!0&&v.cameras.push(Be)}const Se=i.enabledFeatures;if(Se&&Se.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&u){const Ae=u.getDepthInformation(me[0]);Ae&&Ae.isValid&&Ae.texture&&_.init(e,Ae,i.renderState)}}for(let me=0;me<y.length;me++){const re=x[me],Se=y[me];re!==null&&Se!==void 0&&Se.update(re,ee,c||o)}xe&&xe($,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}const tt=new jc;tt.setAnimationLoop(Oe),this.setAnimationLoop=function($){xe=$},this.dispose=function(){}}}const Jn=new cn,E_=new Pe;function S_(s,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,zc(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,M,y,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,x)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,M,y):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Bt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Bt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const M=e.get(p),y=M.envMap,x=M.envMapRotation;y&&(m.envMap.value=y,Jn.copy(x),Jn.x*=-1,Jn.y*=-1,Jn.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Jn.y*=-1,Jn.z*=-1),m.envMapRotation.value.setFromMatrix4(E_.makeRotationFromEuler(Jn)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=y*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,M){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Bt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const M=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function b_(s,e,t,n){let i={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,y){const x=y.program;n.uniformBlockBinding(M,x)}function c(M,y){let x=i[M.id];x===void 0&&(g(M),x=h(M),i[M.id]=x,M.addEventListener("dispose",m));const C=y.program;n.updateUBOMapping(M,C);const T=e.render.frame;r[M.id]!==T&&(d(M),r[M.id]=T)}function h(M){const y=u();M.__bindingPointIndex=y;const x=s.createBuffer(),C=M.__size,T=M.usage;return s.bindBuffer(s.UNIFORM_BUFFER,x),s.bufferData(s.UNIFORM_BUFFER,C,T),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,y,x),x}function u(){for(let M=0;M<a;M++)if(o.indexOf(M)===-1)return o.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){const y=i[M.id],x=M.uniforms,C=M.__cache;s.bindBuffer(s.UNIFORM_BUFFER,y);for(let T=0,R=x.length;T<R;T++){const P=Array.isArray(x[T])?x[T]:[x[T]];for(let S=0,v=P.length;S<v;S++){const I=P[S];if(f(I,T,S,C)===!0){const B=I.__offset,O=Array.isArray(I.value)?I.value:[I.value];let V=0;for(let W=0;W<O.length;W++){const F=O[W],K=_(F);typeof F=="number"||typeof F=="boolean"?(I.__data[0]=F,s.bufferSubData(s.UNIFORM_BUFFER,B+V,I.__data)):F.isMatrix3?(I.__data[0]=F.elements[0],I.__data[1]=F.elements[1],I.__data[2]=F.elements[2],I.__data[3]=0,I.__data[4]=F.elements[3],I.__data[5]=F.elements[4],I.__data[6]=F.elements[5],I.__data[7]=0,I.__data[8]=F.elements[6],I.__data[9]=F.elements[7],I.__data[10]=F.elements[8],I.__data[11]=0):(F.toArray(I.__data,V),V+=K.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,B,I.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(M,y,x,C){const T=M.value,R=y+"_"+x;if(C[R]===void 0)return typeof T=="number"||typeof T=="boolean"?C[R]=T:C[R]=T.clone(),!0;{const P=C[R];if(typeof T=="number"||typeof T=="boolean"){if(P!==T)return C[R]=T,!0}else if(P.equals(T)===!1)return P.copy(T),!0}return!1}function g(M){const y=M.uniforms;let x=0;const C=16;for(let R=0,P=y.length;R<P;R++){const S=Array.isArray(y[R])?y[R]:[y[R]];for(let v=0,I=S.length;v<I;v++){const B=S[v],O=Array.isArray(B.value)?B.value:[B.value];for(let V=0,W=O.length;V<W;V++){const F=O[V],K=_(F),z=x%C,se=z%K.boundary,he=z+se;x+=se,he!==0&&C-he<K.storage&&(x+=C-he),B.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=x,x+=K.storage}}}const T=x%C;return T>0&&(x+=C-T),M.__size=x,M.__cache={},this}function _(M){const y={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(y.boundary=4,y.storage=4):M.isVector2?(y.boundary=8,y.storage=8):M.isVector3||M.isColor?(y.boundary=16,y.storage=12):M.isVector4?(y.boundary=16,y.storage=16):M.isMatrix3?(y.boundary=48,y.storage=48):M.isMatrix4?(y.boundary=64,y.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),y}function m(M){const y=M.target;y.removeEventListener("dispose",m);const x=o.indexOf(y.__bindingPointIndex);o.splice(x,1),s.deleteBuffer(i[y.id]),delete i[y.id],delete r[y.id]}function p(){for(const M in i)s.deleteBuffer(i[M]);o=[],i={},r={}}return{bind:l,update:c,dispose:p}}class T_{constructor(e={}){const{canvas:t=Ed(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const M=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=mt,this.toneMapping=Vn,this.toneMappingExposure=1;const x=this;let C=!1,T=0,R=0,P=null,S=-1,v=null;const I=new $e,B=new $e;let O=null;const V=new Te(0);let W=0,F=t.width,K=t.height,z=1,se=null,he=null;const xe=new $e(0,0,F,K),Oe=new $e(0,0,F,K);let tt=!1;const $=new ya;let ee=!1,me=!1;this.transmissionResolutionScale=1;const re=new Pe,Se=new Pe,Ye=new A,Ae=new $e,ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let rt=!1;function Be(){return P===null?z:1}let L=n;function Wt(b,N){return t.getContext(b,N)}try{const b={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${oa}`),t.addEventListener("webglcontextlost",q,!1),t.addEventListener("webglcontextrestored",le,!1),t.addEventListener("webglcontextcreationerror",ae,!1),L===null){const N="webgl2";if(L=Wt(N,b),L===null)throw Wt(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let ze,ke,ye,it,_e,w,E,k,j,Z,Y,ge,oe,de,Ve,Q,ue,be,we,fe,Ge,De,nt,D;function ne(){ze=new Um(L),ze.init(),De=new __(L,ze),ke=new Rm(L,ze,e,De),ye=new m_(L,ze),ke.reverseDepthBuffer&&d&&ye.buffers.depth.setReversed(!0),it=new Bm(L),_e=new n_,w=new g_(L,ze,ye,_e,ke,De,it),E=new Pm(x),k=new Nm(x),j=new Vu(L),nt=new Am(L,j),Z=new Om(L,j,it,nt),Y=new km(L,Z,j,it),we=new zm(L,ke,w),Q=new Cm(_e),ge=new t_(x,E,k,ze,ke,nt,Q),oe=new S_(x,_e),de=new s_,Ve=new h_(ze),be=new Tm(x,E,k,ye,Y,f,l),ue=new f_(x,Y,ke),D=new b_(L,it,ke,ye),fe=new wm(L,ze,it),Ge=new Fm(L,ze,it),it.programs=ge.programs,x.capabilities=ke,x.extensions=ze,x.properties=_e,x.renderLists=de,x.shadowMap=ue,x.state=ye,x.info=it}ne();const X=new v_(x,L);this.xr=X,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const b=ze.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=ze.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(b){b!==void 0&&(z=b,this.setSize(F,K,!1))},this.getSize=function(b){return b.set(F,K)},this.setSize=function(b,N,G=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}F=b,K=N,t.width=Math.floor(b*z),t.height=Math.floor(N*z),G===!0&&(t.style.width=b+"px",t.style.height=N+"px"),this.setViewport(0,0,b,N)},this.getDrawingBufferSize=function(b){return b.set(F*z,K*z).floor()},this.setDrawingBufferSize=function(b,N,G){F=b,K=N,z=G,t.width=Math.floor(b*G),t.height=Math.floor(N*G),this.setViewport(0,0,b,N)},this.getCurrentViewport=function(b){return b.copy(I)},this.getViewport=function(b){return b.copy(xe)},this.setViewport=function(b,N,G,H){b.isVector4?xe.set(b.x,b.y,b.z,b.w):xe.set(b,N,G,H),ye.viewport(I.copy(xe).multiplyScalar(z).round())},this.getScissor=function(b){return b.copy(Oe)},this.setScissor=function(b,N,G,H){b.isVector4?Oe.set(b.x,b.y,b.z,b.w):Oe.set(b,N,G,H),ye.scissor(B.copy(Oe).multiplyScalar(z).round())},this.getScissorTest=function(){return tt},this.setScissorTest=function(b){ye.setScissorTest(tt=b)},this.setOpaqueSort=function(b){se=b},this.setTransparentSort=function(b){he=b},this.getClearColor=function(b){return b.copy(be.getClearColor())},this.setClearColor=function(){be.setClearColor(...arguments)},this.getClearAlpha=function(){return be.getClearAlpha()},this.setClearAlpha=function(){be.setClearAlpha(...arguments)},this.clear=function(b=!0,N=!0,G=!0){let H=0;if(b){let U=!1;if(P!==null){const J=P.texture.format;U=J===fa||J===ua||J===da}if(U){const J=P.texture.type,ie=J===In||J===si||J===hs||J===Oi||J===la||J===ca,ce=be.getClearColor(),pe=be.getClearAlpha(),Re=ce.r,Ce=ce.g,Me=ce.b;ie?(g[0]=Re,g[1]=Ce,g[2]=Me,g[3]=pe,L.clearBufferuiv(L.COLOR,0,g)):(_[0]=Re,_[1]=Ce,_[2]=Me,_[3]=pe,L.clearBufferiv(L.COLOR,0,_))}else H|=L.COLOR_BUFFER_BIT}N&&(H|=L.DEPTH_BUFFER_BIT),G&&(H|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",q,!1),t.removeEventListener("webglcontextrestored",le,!1),t.removeEventListener("webglcontextcreationerror",ae,!1),be.dispose(),de.dispose(),Ve.dispose(),_e.dispose(),E.dispose(),k.dispose(),Y.dispose(),nt.dispose(),D.dispose(),ge.dispose(),X.dispose(),X.removeEventListener("sessionstart",Ca),X.removeEventListener("sessionend",Pa),Xn.stop()};function q(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function le(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const b=it.autoReset,N=ue.enabled,G=ue.autoUpdate,H=ue.needsUpdate,U=ue.type;ne(),it.autoReset=b,ue.enabled=N,ue.autoUpdate=G,ue.needsUpdate=H,ue.type=U}function ae(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Ie(b){const N=b.target;N.removeEventListener("dispose",Ie),at(N)}function at(b){At(b),_e.remove(b)}function At(b){const N=_e.get(b).programs;N!==void 0&&(N.forEach(function(G){ge.releaseProgram(G)}),b.isShaderMaterial&&ge.releaseShaderCache(b))}this.renderBufferDirect=function(b,N,G,H,U,J){N===null&&(N=ht);const ie=U.isMesh&&U.matrixWorld.determinant()<0,ce=uh(b,N,G,H,U);ye.setMaterial(H,ie);let pe=G.index,Re=1;if(H.wireframe===!0){if(pe=Z.getWireframeAttribute(G),pe===void 0)return;Re=2}const Ce=G.drawRange,Me=G.attributes.position;let We=Ce.start*Re,je=(Ce.start+Ce.count)*Re;J!==null&&(We=Math.max(We,J.start*Re),je=Math.min(je,(J.start+J.count)*Re)),pe!==null?(We=Math.max(We,0),je=Math.min(je,pe.count)):Me!=null&&(We=Math.max(We,0),je=Math.min(je,Me.count));const ut=je-We;if(ut<0||ut===1/0)return;nt.setup(U,H,ce,G,pe);let lt,Xe=fe;if(pe!==null&&(lt=j.get(pe),Xe=Ge,Xe.setIndex(lt)),U.isMesh)H.wireframe===!0?(ye.setLineWidth(H.wireframeLinewidth*Be()),Xe.setMode(L.LINES)):Xe.setMode(L.TRIANGLES);else if(U.isLine){let ve=H.linewidth;ve===void 0&&(ve=1),ye.setLineWidth(ve*Be()),U.isLineSegments?Xe.setMode(L.LINES):U.isLineLoop?Xe.setMode(L.LINE_LOOP):Xe.setMode(L.LINE_STRIP)}else U.isPoints?Xe.setMode(L.POINTS):U.isSprite&&Xe.setMode(L.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)ei("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Xe.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(ze.get("WEBGL_multi_draw"))Xe.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const ve=U._multiDrawStarts,bt=U._multiDrawCounts,qe=U._multiDrawCount,Qt=pe?j.get(pe).bytesPerElement:1,li=_e.get(H).currentProgram.getUniforms();for(let zt=0;zt<qe;zt++)li.setValue(L,"_gl_DrawID",zt),Xe.render(ve[zt]/Qt,bt[zt])}else if(U.isInstancedMesh)Xe.renderInstances(We,ut,U.count);else if(G.isInstancedBufferGeometry){const ve=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,bt=Math.min(G.instanceCount,ve);Xe.renderInstances(We,ut,bt)}else Xe.render(We,ut)};function Ke(b,N,G){b.transparent===!0&&b.side===Ft&&b.forceSinglePass===!1?(b.side=Bt,b.needsUpdate=!0,Es(b,N,G),b.side=Pn,b.needsUpdate=!0,Es(b,N,G),b.side=Ft):Es(b,N,G)}this.compile=function(b,N,G=null){G===null&&(G=b),p=Ve.get(G),p.init(N),y.push(p),G.traverseVisible(function(U){U.isLight&&U.layers.test(N.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),b!==G&&b.traverseVisible(function(U){U.isLight&&U.layers.test(N.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),p.setupLights();const H=new Set;return b.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const J=U.material;if(J)if(Array.isArray(J))for(let ie=0;ie<J.length;ie++){const ce=J[ie];Ke(ce,G,U),H.add(ce)}else Ke(J,G,U),H.add(J)}),p=y.pop(),H},this.compileAsync=function(b,N,G=null){const H=this.compile(b,N,G);return new Promise(U=>{function J(){if(H.forEach(function(ie){_e.get(ie).currentProgram.isReady()&&H.delete(ie)}),H.size===0){U(b);return}setTimeout(J,10)}ze.get("KHR_parallel_shader_compile")!==null?J():setTimeout(J,10)})};let Jt=null;function xn(b){Jt&&Jt(b)}function Ca(){Xn.stop()}function Pa(){Xn.start()}const Xn=new jc;Xn.setAnimationLoop(xn),typeof self<"u"&&Xn.setContext(self),this.setAnimationLoop=function(b){Jt=b,X.setAnimationLoop(b),b===null?Xn.stop():Xn.start()},X.addEventListener("sessionstart",Ca),X.addEventListener("sessionend",Pa),this.render=function(b,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(N),N=X.getCamera()),b.isScene===!0&&b.onBeforeRender(x,b,N,P),p=Ve.get(b,y.length),p.init(N),y.push(p),Se.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),$.setFromProjectionMatrix(Se),me=this.localClippingEnabled,ee=Q.init(this.clippingPlanes,me),m=de.get(b,M.length),m.init(),M.push(m),X.enabled===!0&&X.isPresenting===!0){const J=x.xr.getDepthSensingMesh();J!==null&&Er(J,N,-1/0,x.sortObjects)}Er(b,N,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(se,he),rt=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,rt&&be.addToRenderList(m,b),this.info.render.frame++,ee===!0&&Q.beginShadows();const G=p.state.shadowsArray;ue.render(G,b,N),ee===!0&&Q.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=m.opaque,U=m.transmissive;if(p.setupLights(),N.isArrayCamera){const J=N.cameras;if(U.length>0)for(let ie=0,ce=J.length;ie<ce;ie++){const pe=J[ie];La(H,U,b,pe)}rt&&be.render(b);for(let ie=0,ce=J.length;ie<ce;ie++){const pe=J[ie];Ia(m,b,pe,pe.viewport)}}else U.length>0&&La(H,U,b,N),rt&&be.render(b),Ia(m,b,N);P!==null&&R===0&&(w.updateMultisampleRenderTarget(P),w.updateRenderTargetMipmap(P)),b.isScene===!0&&b.onAfterRender(x,b,N),nt.resetDefaultState(),S=-1,v=null,y.pop(),y.length>0?(p=y[y.length-1],ee===!0&&Q.setGlobalState(x.clippingPlanes,p.state.camera)):p=null,M.pop(),M.length>0?m=M[M.length-1]:m=null};function Er(b,N,G,H){if(b.visible===!1)return;if(b.layers.test(N.layers)){if(b.isGroup)G=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(N);else if(b.isLight)p.pushLight(b),b.castShadow&&p.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||$.intersectsSprite(b)){H&&Ae.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Se);const ie=Y.update(b),ce=b.material;ce.visible&&m.push(b,ie,ce,G,Ae.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||$.intersectsObject(b))){const ie=Y.update(b),ce=b.material;if(H&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ae.copy(b.boundingSphere.center)):(ie.boundingSphere===null&&ie.computeBoundingSphere(),Ae.copy(ie.boundingSphere.center)),Ae.applyMatrix4(b.matrixWorld).applyMatrix4(Se)),Array.isArray(ce)){const pe=ie.groups;for(let Re=0,Ce=pe.length;Re<Ce;Re++){const Me=pe[Re],We=ce[Me.materialIndex];We&&We.visible&&m.push(b,ie,We,G,Ae.z,Me)}}else ce.visible&&m.push(b,ie,ce,G,Ae.z,null)}}const J=b.children;for(let ie=0,ce=J.length;ie<ce;ie++)Er(J[ie],N,G,H)}function Ia(b,N,G,H){const U=b.opaque,J=b.transmissive,ie=b.transparent;p.setupLightsView(G),ee===!0&&Q.setGlobalState(x.clippingPlanes,G),H&&ye.viewport(I.copy(H)),U.length>0&&vs(U,N,G),J.length>0&&vs(J,N,G),ie.length>0&&vs(ie,N,G),ye.buffers.depth.setTest(!0),ye.buffers.depth.setMask(!0),ye.buffers.color.setMask(!0),ye.setPolygonOffset(!1)}function La(b,N,G,H){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[H.id]===void 0&&(p.state.transmissionRenderTarget[H.id]=new ri(1,1,{generateMipmaps:!0,type:ze.has("EXT_color_buffer_half_float")||ze.has("EXT_color_buffer_float")?ps:In,minFilter:rn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:He.workingColorSpace}));const J=p.state.transmissionRenderTarget[H.id],ie=H.viewport||I;J.setSize(ie.z*x.transmissionResolutionScale,ie.w*x.transmissionResolutionScale);const ce=x.getRenderTarget();x.setRenderTarget(J),x.getClearColor(V),W=x.getClearAlpha(),W<1&&x.setClearColor(16777215,.5),x.clear(),rt&&be.render(G);const pe=x.toneMapping;x.toneMapping=Vn;const Re=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),p.setupLightsView(H),ee===!0&&Q.setGlobalState(x.clippingPlanes,H),vs(b,G,H),w.updateMultisampleRenderTarget(J),w.updateRenderTargetMipmap(J),ze.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let Me=0,We=N.length;Me<We;Me++){const je=N[Me],ut=je.object,lt=je.geometry,Xe=je.material,ve=je.group;if(Xe.side===Ft&&ut.layers.test(H.layers)){const bt=Xe.side;Xe.side=Bt,Xe.needsUpdate=!0,Da(ut,G,H,lt,Xe,ve),Xe.side=bt,Xe.needsUpdate=!0,Ce=!0}}Ce===!0&&(w.updateMultisampleRenderTarget(J),w.updateRenderTargetMipmap(J))}x.setRenderTarget(ce),x.setClearColor(V,W),Re!==void 0&&(H.viewport=Re),x.toneMapping=pe}function vs(b,N,G){const H=N.isScene===!0?N.overrideMaterial:null;for(let U=0,J=b.length;U<J;U++){const ie=b[U],ce=ie.object,pe=ie.geometry,Re=H===null?ie.material:H,Ce=ie.group;ce.layers.test(G.layers)&&Da(ce,N,G,pe,Re,Ce)}}function Da(b,N,G,H,U,J){b.onBeforeRender(x,N,G,H,U,J),b.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),U.onBeforeRender(x,N,G,H,b,J),U.transparent===!0&&U.side===Ft&&U.forceSinglePass===!1?(U.side=Bt,U.needsUpdate=!0,x.renderBufferDirect(G,N,H,U,b,J),U.side=Pn,U.needsUpdate=!0,x.renderBufferDirect(G,N,H,U,b,J),U.side=Ft):x.renderBufferDirect(G,N,H,U,b,J),b.onAfterRender(x,N,G,H,U,J)}function Es(b,N,G){N.isScene!==!0&&(N=ht);const H=_e.get(b),U=p.state.lights,J=p.state.shadowsArray,ie=U.state.version,ce=ge.getParameters(b,U.state,J,N,G),pe=ge.getProgramCacheKey(ce);let Re=H.programs;H.environment=b.isMeshStandardMaterial?N.environment:null,H.fog=N.fog,H.envMap=(b.isMeshStandardMaterial?k:E).get(b.envMap||H.environment),H.envMapRotation=H.environment!==null&&b.envMap===null?N.environmentRotation:b.envMapRotation,Re===void 0&&(b.addEventListener("dispose",Ie),Re=new Map,H.programs=Re);let Ce=Re.get(pe);if(Ce!==void 0){if(H.currentProgram===Ce&&H.lightsStateVersion===ie)return Ua(b,ce),Ce}else ce.uniforms=ge.getUniforms(b),b.onBeforeCompile(ce,x),Ce=ge.acquireProgram(ce,pe),Re.set(pe,Ce),H.uniforms=ce.uniforms;const Me=H.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Me.clippingPlanes=Q.uniform),Ua(b,ce),H.needsLights=ph(b),H.lightsStateVersion=ie,H.needsLights&&(Me.ambientLightColor.value=U.state.ambient,Me.lightProbe.value=U.state.probe,Me.directionalLights.value=U.state.directional,Me.directionalLightShadows.value=U.state.directionalShadow,Me.spotLights.value=U.state.spot,Me.spotLightShadows.value=U.state.spotShadow,Me.rectAreaLights.value=U.state.rectArea,Me.ltc_1.value=U.state.rectAreaLTC1,Me.ltc_2.value=U.state.rectAreaLTC2,Me.pointLights.value=U.state.point,Me.pointLightShadows.value=U.state.pointShadow,Me.hemisphereLights.value=U.state.hemi,Me.directionalShadowMap.value=U.state.directionalShadowMap,Me.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Me.spotShadowMap.value=U.state.spotShadowMap,Me.spotLightMatrix.value=U.state.spotLightMatrix,Me.spotLightMap.value=U.state.spotLightMap,Me.pointShadowMap.value=U.state.pointShadowMap,Me.pointShadowMatrix.value=U.state.pointShadowMatrix),H.currentProgram=Ce,H.uniformsList=null,Ce}function Na(b){if(b.uniformsList===null){const N=b.currentProgram.getUniforms();b.uniformsList=lr.seqWithValue(N.seq,b.uniforms)}return b.uniformsList}function Ua(b,N){const G=_e.get(b);G.outputColorSpace=N.outputColorSpace,G.batching=N.batching,G.batchingColor=N.batchingColor,G.instancing=N.instancing,G.instancingColor=N.instancingColor,G.instancingMorph=N.instancingMorph,G.skinning=N.skinning,G.morphTargets=N.morphTargets,G.morphNormals=N.morphNormals,G.morphColors=N.morphColors,G.morphTargetsCount=N.morphTargetsCount,G.numClippingPlanes=N.numClippingPlanes,G.numIntersection=N.numClipIntersection,G.vertexAlphas=N.vertexAlphas,G.vertexTangents=N.vertexTangents,G.toneMapping=N.toneMapping}function uh(b,N,G,H,U){N.isScene!==!0&&(N=ht),w.resetTextureUnits();const J=N.fog,ie=H.isMeshStandardMaterial?N.environment:null,ce=P===null?x.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:Dt,pe=(H.isMeshStandardMaterial?k:E).get(H.envMap||ie),Re=H.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Ce=!!G.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Me=!!G.morphAttributes.position,We=!!G.morphAttributes.normal,je=!!G.morphAttributes.color;let ut=Vn;H.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(ut=x.toneMapping);const lt=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,Xe=lt!==void 0?lt.length:0,ve=_e.get(H),bt=p.state.lights;if(ee===!0&&(me===!0||b!==v)){const Ct=b===v&&H.id===S;Q.setState(H,b,Ct)}let qe=!1;H.version===ve.__version?(ve.needsLights&&ve.lightsStateVersion!==bt.state.version||ve.outputColorSpace!==ce||U.isBatchedMesh&&ve.batching===!1||!U.isBatchedMesh&&ve.batching===!0||U.isBatchedMesh&&ve.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&ve.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&ve.instancing===!1||!U.isInstancedMesh&&ve.instancing===!0||U.isSkinnedMesh&&ve.skinning===!1||!U.isSkinnedMesh&&ve.skinning===!0||U.isInstancedMesh&&ve.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&ve.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&ve.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&ve.instancingMorph===!1&&U.morphTexture!==null||ve.envMap!==pe||H.fog===!0&&ve.fog!==J||ve.numClippingPlanes!==void 0&&(ve.numClippingPlanes!==Q.numPlanes||ve.numIntersection!==Q.numIntersection)||ve.vertexAlphas!==Re||ve.vertexTangents!==Ce||ve.morphTargets!==Me||ve.morphNormals!==We||ve.morphColors!==je||ve.toneMapping!==ut||ve.morphTargetsCount!==Xe)&&(qe=!0):(qe=!0,ve.__version=H.version);let Qt=ve.currentProgram;qe===!0&&(Qt=Es(H,N,U));let li=!1,zt=!1,qi=!1;const st=Qt.getUniforms(),Xt=ve.uniforms;if(ye.useProgram(Qt.program)&&(li=!0,zt=!0,qi=!0),H.id!==S&&(S=H.id,zt=!0),li||v!==b){ye.buffers.depth.getReversed()?(re.copy(b.projectionMatrix),bd(re),Td(re),st.setValue(L,"projectionMatrix",re)):st.setValue(L,"projectionMatrix",b.projectionMatrix),st.setValue(L,"viewMatrix",b.matrixWorldInverse);const Nt=st.map.cameraPosition;Nt!==void 0&&Nt.setValue(L,Ye.setFromMatrixPosition(b.matrixWorld)),ke.logarithmicDepthBuffer&&st.setValue(L,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&st.setValue(L,"isOrthographic",b.isOrthographicCamera===!0),v!==b&&(v=b,zt=!0,qi=!0)}if(U.isSkinnedMesh){st.setOptional(L,U,"bindMatrix"),st.setOptional(L,U,"bindMatrixInverse");const Ct=U.skeleton;Ct&&(Ct.boneTexture===null&&Ct.computeBoneTexture(),st.setValue(L,"boneTexture",Ct.boneTexture,w))}U.isBatchedMesh&&(st.setOptional(L,U,"batchingTexture"),st.setValue(L,"batchingTexture",U._matricesTexture,w),st.setOptional(L,U,"batchingIdTexture"),st.setValue(L,"batchingIdTexture",U._indirectTexture,w),st.setOptional(L,U,"batchingColorTexture"),U._colorsTexture!==null&&st.setValue(L,"batchingColorTexture",U._colorsTexture,w));const Yt=G.morphAttributes;if((Yt.position!==void 0||Yt.normal!==void 0||Yt.color!==void 0)&&we.update(U,G,Qt),(zt||ve.receiveShadow!==U.receiveShadow)&&(ve.receiveShadow=U.receiveShadow,st.setValue(L,"receiveShadow",U.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Xt.envMap.value=pe,Xt.flipEnvMap.value=pe.isCubeTexture&&pe.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&N.environment!==null&&(Xt.envMapIntensity.value=N.environmentIntensity),zt&&(st.setValue(L,"toneMappingExposure",x.toneMappingExposure),ve.needsLights&&fh(Xt,qi),J&&H.fog===!0&&oe.refreshFogUniforms(Xt,J),oe.refreshMaterialUniforms(Xt,H,z,K,p.state.transmissionRenderTarget[b.id]),lr.upload(L,Na(ve),Xt,w)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(lr.upload(L,Na(ve),Xt,w),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&st.setValue(L,"center",U.center),st.setValue(L,"modelViewMatrix",U.modelViewMatrix),st.setValue(L,"normalMatrix",U.normalMatrix),st.setValue(L,"modelMatrix",U.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Ct=H.uniformsGroups;for(let Nt=0,Sr=Ct.length;Nt<Sr;Nt++){const Yn=Ct[Nt];D.update(Yn,Qt),D.bind(Yn,Qt)}}return Qt}function fh(b,N){b.ambientLightColor.needsUpdate=N,b.lightProbe.needsUpdate=N,b.directionalLights.needsUpdate=N,b.directionalLightShadows.needsUpdate=N,b.pointLights.needsUpdate=N,b.pointLightShadows.needsUpdate=N,b.spotLights.needsUpdate=N,b.spotLightShadows.needsUpdate=N,b.rectAreaLights.needsUpdate=N,b.hemisphereLights.needsUpdate=N}function ph(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(b,N,G){_e.get(b.texture).__webglTexture=N,_e.get(b.depthTexture).__webglTexture=G;const H=_e.get(b);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=G===void 0,H.__autoAllocateDepthBuffer||ze.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,N){const G=_e.get(b);G.__webglFramebuffer=N,G.__useDefaultFramebuffer=N===void 0};const mh=L.createFramebuffer();this.setRenderTarget=function(b,N=0,G=0){P=b,T=N,R=G;let H=!0,U=null,J=!1,ie=!1;if(b){const pe=_e.get(b);if(pe.__useDefaultFramebuffer!==void 0)ye.bindFramebuffer(L.FRAMEBUFFER,null),H=!1;else if(pe.__webglFramebuffer===void 0)w.setupRenderTarget(b);else if(pe.__hasExternalTextures)w.rebindTextures(b,_e.get(b.texture).__webglTexture,_e.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const Me=b.depthTexture;if(pe.__boundDepthTexture!==Me){if(Me!==null&&_e.has(Me)&&(b.width!==Me.image.width||b.height!==Me.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");w.setupDepthRenderbuffer(b)}}const Re=b.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(ie=!0);const Ce=_e.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ce[N])?U=Ce[N][G]:U=Ce[N],J=!0):b.samples>0&&w.useMultisampledRTT(b)===!1?U=_e.get(b).__webglMultisampledFramebuffer:Array.isArray(Ce)?U=Ce[G]:U=Ce,I.copy(b.viewport),B.copy(b.scissor),O=b.scissorTest}else I.copy(xe).multiplyScalar(z).floor(),B.copy(Oe).multiplyScalar(z).floor(),O=tt;if(G!==0&&(U=mh),ye.bindFramebuffer(L.FRAMEBUFFER,U)&&H&&ye.drawBuffers(b,U),ye.viewport(I),ye.scissor(B),ye.setScissorTest(O),J){const pe=_e.get(b.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,pe.__webglTexture,G)}else if(ie){const pe=_e.get(b.texture),Re=N;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,pe.__webglTexture,G,Re)}else if(b!==null&&G!==0){const pe=_e.get(b.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,pe.__webglTexture,G)}S=-1},this.readRenderTargetPixels=function(b,N,G,H,U,J,ie){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ce=_e.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ie!==void 0&&(ce=ce[ie]),ce){ye.bindFramebuffer(L.FRAMEBUFFER,ce);try{const pe=b.texture,Re=pe.format,Ce=pe.type;if(!ke.textureFormatReadable(Re)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ke.textureTypeReadable(Ce)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=b.width-H&&G>=0&&G<=b.height-U&&L.readPixels(N,G,H,U,De.convert(Re),De.convert(Ce),J)}finally{const pe=P!==null?_e.get(P).__webglFramebuffer:null;ye.bindFramebuffer(L.FRAMEBUFFER,pe)}}},this.readRenderTargetPixelsAsync=async function(b,N,G,H,U,J,ie){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ce=_e.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ie!==void 0&&(ce=ce[ie]),ce){const pe=b.texture,Re=pe.format,Ce=pe.type;if(!ke.textureFormatReadable(Re))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ke.textureTypeReadable(Ce))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=b.width-H&&G>=0&&G<=b.height-U){ye.bindFramebuffer(L.FRAMEBUFFER,ce);const Me=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Me),L.bufferData(L.PIXEL_PACK_BUFFER,J.byteLength,L.STREAM_READ),L.readPixels(N,G,H,U,De.convert(Re),De.convert(Ce),0);const We=P!==null?_e.get(P).__webglFramebuffer:null;ye.bindFramebuffer(L.FRAMEBUFFER,We);const je=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Sd(L,je,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,Me),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,J),L.deleteBuffer(Me),L.deleteSync(je),J}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,N=null,G=0){b.isTexture!==!0&&(ei("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,b=arguments[1]);const H=Math.pow(2,-G),U=Math.floor(b.image.width*H),J=Math.floor(b.image.height*H),ie=N!==null?N.x:0,ce=N!==null?N.y:0;w.setTexture2D(b,0),L.copyTexSubImage2D(L.TEXTURE_2D,G,0,0,ie,ce,U,J),ye.unbindTexture()};const gh=L.createFramebuffer(),_h=L.createFramebuffer();this.copyTextureToTexture=function(b,N,G=null,H=null,U=0,J=null){b.isTexture!==!0&&(ei("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,b=arguments[1],N=arguments[2],J=arguments[3]||0,G=null),J===null&&(U!==0?(ei("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),J=U,U=0):J=0);let ie,ce,pe,Re,Ce,Me,We,je,ut;const lt=b.isCompressedTexture?b.mipmaps[J]:b.image;if(G!==null)ie=G.max.x-G.min.x,ce=G.max.y-G.min.y,pe=G.isBox3?G.max.z-G.min.z:1,Re=G.min.x,Ce=G.min.y,Me=G.isBox3?G.min.z:0;else{const Yt=Math.pow(2,-U);ie=Math.floor(lt.width*Yt),ce=Math.floor(lt.height*Yt),b.isDataArrayTexture?pe=lt.depth:b.isData3DTexture?pe=Math.floor(lt.depth*Yt):pe=1,Re=0,Ce=0,Me=0}H!==null?(We=H.x,je=H.y,ut=H.z):(We=0,je=0,ut=0);const Xe=De.convert(N.format),ve=De.convert(N.type);let bt;N.isData3DTexture?(w.setTexture3D(N,0),bt=L.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(w.setTexture2DArray(N,0),bt=L.TEXTURE_2D_ARRAY):(w.setTexture2D(N,0),bt=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,N.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,N.unpackAlignment);const qe=L.getParameter(L.UNPACK_ROW_LENGTH),Qt=L.getParameter(L.UNPACK_IMAGE_HEIGHT),li=L.getParameter(L.UNPACK_SKIP_PIXELS),zt=L.getParameter(L.UNPACK_SKIP_ROWS),qi=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,lt.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,lt.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Re),L.pixelStorei(L.UNPACK_SKIP_ROWS,Ce),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Me);const st=b.isDataArrayTexture||b.isData3DTexture,Xt=N.isDataArrayTexture||N.isData3DTexture;if(b.isDepthTexture){const Yt=_e.get(b),Ct=_e.get(N),Nt=_e.get(Yt.__renderTarget),Sr=_e.get(Ct.__renderTarget);ye.bindFramebuffer(L.READ_FRAMEBUFFER,Nt.__webglFramebuffer),ye.bindFramebuffer(L.DRAW_FRAMEBUFFER,Sr.__webglFramebuffer);for(let Yn=0;Yn<pe;Yn++)st&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,_e.get(b).__webglTexture,U,Me+Yn),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,_e.get(N).__webglTexture,J,ut+Yn)),L.blitFramebuffer(Re,Ce,ie,ce,We,je,ie,ce,L.DEPTH_BUFFER_BIT,L.NEAREST);ye.bindFramebuffer(L.READ_FRAMEBUFFER,null),ye.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(U!==0||b.isRenderTargetTexture||_e.has(b)){const Yt=_e.get(b),Ct=_e.get(N);ye.bindFramebuffer(L.READ_FRAMEBUFFER,gh),ye.bindFramebuffer(L.DRAW_FRAMEBUFFER,_h);for(let Nt=0;Nt<pe;Nt++)st?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Yt.__webglTexture,U,Me+Nt):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Yt.__webglTexture,U),Xt?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ct.__webglTexture,J,ut+Nt):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ct.__webglTexture,J),U!==0?L.blitFramebuffer(Re,Ce,ie,ce,We,je,ie,ce,L.COLOR_BUFFER_BIT,L.NEAREST):Xt?L.copyTexSubImage3D(bt,J,We,je,ut+Nt,Re,Ce,ie,ce):L.copyTexSubImage2D(bt,J,We,je,Re,Ce,ie,ce);ye.bindFramebuffer(L.READ_FRAMEBUFFER,null),ye.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Xt?b.isDataTexture||b.isData3DTexture?L.texSubImage3D(bt,J,We,je,ut,ie,ce,pe,Xe,ve,lt.data):N.isCompressedArrayTexture?L.compressedTexSubImage3D(bt,J,We,je,ut,ie,ce,pe,Xe,lt.data):L.texSubImage3D(bt,J,We,je,ut,ie,ce,pe,Xe,ve,lt):b.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,J,We,je,ie,ce,Xe,ve,lt.data):b.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,J,We,je,lt.width,lt.height,Xe,lt.data):L.texSubImage2D(L.TEXTURE_2D,J,We,je,ie,ce,Xe,ve,lt);L.pixelStorei(L.UNPACK_ROW_LENGTH,qe),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Qt),L.pixelStorei(L.UNPACK_SKIP_PIXELS,li),L.pixelStorei(L.UNPACK_SKIP_ROWS,zt),L.pixelStorei(L.UNPACK_SKIP_IMAGES,qi),J===0&&N.generateMipmaps&&L.generateMipmap(bt),ye.unbindTexture()},this.copyTextureToTexture3D=function(b,N,G=null,H=null,U=0){return b.isTexture!==!0&&(ei("WebGLRenderer: copyTextureToTexture3D function signature has changed."),G=arguments[0]||null,H=arguments[1]||null,b=arguments[2],N=arguments[3],U=arguments[4]||0),ei('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,N,G,H,U)},this.initRenderTarget=function(b){_e.get(b).__webglFramebuffer===void 0&&w.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?w.setTextureCube(b,0):b.isData3DTexture?w.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?w.setTexture2DArray(b,0):w.setTexture2D(b,0),ye.unbindTexture()},this.resetState=function(){T=0,R=0,P=null,ye.reset(),nt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Rn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=He._getDrawingBufferColorSpace(e),t.unpackColorSpace=He._getUnpackColorSpace()}}class A_ extends ai{constructor(e){super(e)}load(e,t,n,i){const r=this,o=new va(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{t(r.parse(a))}catch(l){i?i(l):console.error(l),r.manager.itemError(e)}},n,i)}parse(e){function t(c){const h=new DataView(c),u=32/8*3+32/8*3*3+16/8,d=h.getUint32(80,!0);if(80+32/8+d*u===h.byteLength)return!0;const g=[115,111,108,105,100];for(let _=0;_<5;_++)if(n(g,h,_))return!1;return!0}function n(c,h,u){for(let d=0,f=c.length;d<f;d++)if(c[d]!==h.getUint8(u+d))return!1;return!0}function i(c){const h=new DataView(c),u=h.getUint32(80,!0);let d,f,g,_=!1,m,p,M,y,x;for(let I=0;I<70;I++)h.getUint32(I,!1)==1129270351&&h.getUint8(I+4)==82&&h.getUint8(I+5)==61&&(_=!0,m=new Float32Array(u*3*3),p=h.getUint8(I+6)/255,M=h.getUint8(I+7)/255,y=h.getUint8(I+8)/255,x=h.getUint8(I+9)/255);const C=84,T=50,R=new St,P=new Float32Array(u*3*3),S=new Float32Array(u*3*3),v=new Te;for(let I=0;I<u;I++){const B=C+I*T,O=h.getFloat32(B,!0),V=h.getFloat32(B+4,!0),W=h.getFloat32(B+8,!0);if(_){const F=h.getUint16(B+48,!0);(F&32768)===0?(d=(F&31)/31,f=(F>>5&31)/31,g=(F>>10&31)/31):(d=p,f=M,g=y)}for(let F=1;F<=3;F++){const K=B+F*12,z=I*3*3+(F-1)*3;P[z]=h.getFloat32(K,!0),P[z+1]=h.getFloat32(K+4,!0),P[z+2]=h.getFloat32(K+8,!0),S[z]=O,S[z+1]=V,S[z+2]=W,_&&(v.setRGB(d,f,g,mt),m[z]=v.r,m[z+1]=v.g,m[z+2]=v.b)}}return R.setAttribute("position",new dt(P,3)),R.setAttribute("normal",new dt(S,3)),_&&(R.setAttribute("color",new dt(m,3)),R.hasColors=!0,R.alpha=x),R}function r(c){const h=new St,u=/solid([\s\S]*?)endsolid/g,d=/facet([\s\S]*?)endfacet/g,f=/solid\s(.+)/;let g=0;const _=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,m=new RegExp("vertex"+_+_+_,"g"),p=new RegExp("normal"+_+_+_,"g"),M=[],y=[],x=[],C=new A;let T,R=0,P=0,S=0;for(;(T=u.exec(c))!==null;){P=S;const v=T[0],I=(T=f.exec(v))!==null?T[1]:"";for(x.push(I);(T=d.exec(v))!==null;){let V=0,W=0;const F=T[0];for(;(T=p.exec(F))!==null;)C.x=parseFloat(T[1]),C.y=parseFloat(T[2]),C.z=parseFloat(T[3]),W++;for(;(T=m.exec(F))!==null;)M.push(parseFloat(T[1]),parseFloat(T[2]),parseFloat(T[3])),y.push(C.x,C.y,C.z),V++,S++;W!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),V!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const B=P,O=S-P;h.userData.groupNames=x,h.addGroup(B,O,R),R++}return h.setAttribute("position",new gt(M,3)),h.setAttribute("normal",new gt(y,3)),h}function o(c){return typeof c!="string"?new TextDecoder().decode(c):c}function a(c){if(typeof c=="string"){const h=new Uint8Array(c.length);for(let u=0;u<c.length;u++)h[u]=c.charCodeAt(u)&255;return h.buffer||h}else return c}const l=a(e);return t(l)?i(l):r(o(e))}}function sc(s,e){if(e===qh)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===Yo||e===Ic){let t=s.getIndex();if(t===null){const o=[],a=s.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);s.setIndex(o),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===Yo)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class w_ extends ai{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new L_(t)}),this.register(function(t){return new D_(t)}),this.register(function(t){return new H_(t)}),this.register(function(t){return new V_(t)}),this.register(function(t){return new W_(t)}),this.register(function(t){return new U_(t)}),this.register(function(t){return new O_(t)}),this.register(function(t){return new F_(t)}),this.register(function(t){return new B_(t)}),this.register(function(t){return new I_(t)}),this.register(function(t){return new z_(t)}),this.register(function(t){return new N_(t)}),this.register(function(t){return new G_(t)}),this.register(function(t){return new k_(t)}),this.register(function(t){return new C_(t)}),this.register(function(t){return new X_(t)}),this.register(function(t){return new Y_(t)})}load(e,t,n,i){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=cs.extractUrlBase(e);o=cs.resolveURL(c,this.path)}else o=cs.extractUrlBase(e);this.manager.itemStart(e);const a=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new va(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Qc){try{o[Fe.KHR_BINARY_GLTF]=new $_(e)}catch(u){i&&i(u);return}r=JSON.parse(o[Fe.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new o0(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case Fe.KHR_MATERIALS_UNLIT:o[u]=new P_;break;case Fe.KHR_DRACO_MESH_COMPRESSION:o[u]=new j_(r,this.dracoLoader);break;case Fe.KHR_TEXTURE_TRANSFORM:o[u]=new q_;break;case Fe.KHR_MESH_QUANTIZATION:o[u]=new K_;break;default:d.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function R_(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const Fe={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class C_{constructor(e){this.parser=e,this.name=Fe.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let c;const h=new Te(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Dt);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new or(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Au(h),c.distance=u;break;case"spot":c=new bu(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),An(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}}class P_{constructor(){this.name=Fe.KHR_MATERIALS_UNLIT}getMaterialType(){return Ot}extendParams(e,t,n){const i=[];e.color=new Te(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Dt),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,mt))}return Promise.all(i)}}class I_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class L_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Ee(a,a)}return Promise.all(r)}}class D_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class N_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class U_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new Te(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Dt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,mt)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class O_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class F_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Te().setRGB(a[0],a[1],a[2],Dt),Promise.all(r)}}class B_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class z_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new Te().setRGB(a[0],a[1],a[2],Dt),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,mt)),Promise.all(r)}}class k_{constructor(e){this.parser=e,this.name=Fe.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}}class G_{constructor(e){this.parser=e,this.name=Fe.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}}class H_{constructor(e){this.parser=e,this.name=Fe.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class V_{constructor(e){this.parser=e,this.name=Fe.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class W_{constructor(e){this.parser=e,this.name=Fe.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class X_{constructor(e){this.name=Fe.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}}class Y_{constructor(e){this.name=Fe.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==jt.TRIANGLES&&c.mode!==jt.TRIANGLE_STRIP&&c.mode!==jt.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(h=>(l[c]=h,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{const h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,f=[];for(const g of u){const _=new Pe,m=new A,p=new pn,M=new A(1,1,1),y=new nu(g.geometry,g.material,d);for(let x=0;x<d;x++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,x),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,x),l.SCALE&&M.fromBufferAttribute(l.SCALE,x),y.setMatrixAt(x,_.compose(m,p,M));for(const x in l)if(x==="_COLOR_0"){const C=l[x];y.instanceColor=new jo(C.array,C.itemSize,C.normalized)}else x!=="TRANSLATION"&&x!=="ROTATION"&&x!=="SCALE"&&g.geometry.setAttribute(x,l[x]);ot.prototype.copy.call(y,g),this.parser.assignFinalMaterial(y),f.push(y)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}}const Qc="glTF",ss=12,rc={JSON:1313821514,BIN:5130562};class $_{constructor(e){this.name=Fe.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,ss),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Qc)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-ss,r=new DataView(e,ss);let o=0;for(;o<i;){const a=r.getUint32(o,!0);o+=4;const l=r.getUint32(o,!0);if(o+=4,l===rc.JSON){const c=new Uint8Array(e,ss+o,a);this.content=n.decode(c)}else if(l===rc.BIN){const c=ss+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class j_{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Fe.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(const h in o){const u=Jo[h]||h.toLowerCase();a[u]=o[h]}for(const h in e.attributes){const u=Jo[h]||h.toLowerCase();if(o[h]!==void 0){const d=n.accessors[e.attributes[h]],f=Li[d.componentType];c[u]=f.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(const g in f.attributes){const _=f.attributes[g],m=l[g];m!==void 0&&(_.normalized=m)}u(f)},a,c,Dt,d)})})}}class q_{constructor(){this.name=Fe.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class K_{constructor(){this.name=Fe.KHR_MESH_QUANTIZATION}}class eh extends xs{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,g=e*c,_=g-c,m=-2*f+3*d,p=f-d,M=1-m,y=p-d+u;for(let x=0;x!==a;x++){const C=o[_+x+a],T=o[_+x+l]*h,R=o[g+x+a],P=o[g+x]*h;r[x]=M*C+y*T+m*R+p*P}return r}}const Z_=new pn;class J_ extends eh{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return Z_.fromArray(r).normalize().toArray(r),r}}const jt={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Li={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},oc={9728:Tt,9729:Vt,9984:vc,9985:er,9986:rs,9987:rn},ac={33071:kn,33648:hr,10497:un},so={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Jo={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Bn={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Q_={CUBICSPLINE:void 0,LINEAR:us,STEP:ds},ro={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function e0(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new _s({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Pn})),s.DefaultMaterial}function Qn(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function An(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function t0(s,e,t){let n=!1,i=!1,r=!1;for(let c=0,h=e.length;c<h;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const o=[],a=[],l=[];for(let c=0,h=e.length;c<h;c++){const u=e[c];if(n){const d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;o.push(d)}if(i){const d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;a.push(d)}if(r){const d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const h=c[0],u=c[1],d=c[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=d),s.morphTargetsRelative=!0,s})}function n0(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function i0(s){let e;const t=s.extensions&&s.extensions[Fe.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+oo(t.attributes):e=s.indices+":"+oo(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+oo(s.targets[n]);return e}function oo(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function Qo(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function s0(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const r0=new Pe;class o0{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new R_,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const l=a.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?this.textureLoader=new Eu(this.options.manager):this.textureLoader=new Cu(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new va(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return Qn(r,a,i),An(a,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(const l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const o=t[i].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,h]of o.children.entries())r(h,a.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Fe.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,o){n.load(cs.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const o=so[i.type],a=Li[i.componentType],l=i.normalized===!0,c=new a(i.count*o);return Promise.resolve(new dt(c,o,l))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],l=so[i.type],c=Li[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0;let _,m;if(f&&f!==u){const p=Math.floor(d/f),M="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let y=t.cache.get(M);y||(_=new c(a,p*f,i.count*f/h),y=new Zd(_,f/h),t.cache.add(M,y)),m=new _a(y,l,d%f/h,g)}else a===null?_=new c(i.count*l):_=new c(a,d,i.count*l),m=new dt(_,l,g);if(i.sparse!==void 0){const p=so.SCALAR,M=Li[i.sparse.indices.componentType],y=i.sparse.indices.byteOffset||0,x=i.sparse.values.byteOffset||0,C=new M(o[1],y,i.sparse.count*p),T=new c(o[2],x,i.sparse.count*l);a!==null&&(m=new dt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let R=0,P=C.length;R<P;R++){const S=C[R];if(m.setX(S,T[R*l]),l>=2&&m.setY(S,T[R*l+1]),l>=3&&m.setZ(S,T[R*l+2]),l>=4&&m.setW(S,T[R*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const i=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);const d=(r.samplers||{})[o.sampler]||{};return h.magFilter=oc[d.magFilter]||Vt,h.minFilter=oc[d.minFilter]||rn,h.wrapS=ac[d.wrapS]||un,h.wrapT=ac[d.wrapT]||un,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Tt&&h.minFilter!==Vt,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const o=i.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(u){c=!0;const d=new Blob([u],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(u){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(_){const m=new xt(_);m.needsUpdate=!0,d(m)}),t.load(cs.resolveURL(u,r.path),g,void 0,f)})}).then(function(u){return c===!0&&a.revokeObjectURL(l),An(u,o),u.userData.mimeType=o.mimeType||s0(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Fe.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[Fe.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=r.associations.get(o);o=r.extensions[Fe.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Wc,fn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Ii,fn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return _s}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let o;const a={},l=r.extensions||{},c=[];if(l[Fe.KHR_MATERIALS_UNLIT]){const u=i[Fe.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),c.push(u.extendParams(a,r,t))}else{const u=r.pbrMetallicRoughness||{};if(a.color=new Te(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],Dt),a.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",u.baseColorTexture,mt)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Ft);const h=r.alphaMode||ro.OPAQUE;if(h===ro.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===ro.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==Ot&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Ee(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==Ot&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==Ot){const u=r.emissiveFactor;a.emissive=new Te().setRGB(u[0],u[1],u[2],Dt)}return r.emissiveTexture!==void 0&&o!==Ot&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,mt)),Promise.all(c).then(function(){const u=new o(a);return r.name&&(u.name=r.name),An(u,r),t.associations.set(u,{materials:e}),r.extensions&&Qn(i,u,r),u})}createUniqueName(e){const t=Je.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[Fe.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return lc(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const c=e[a],h=i0(c),u=i[h];if(u)o.push(u.promise);else{let d;c.extensions&&c.extensions[Fe.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=lc(new St,c,t),i[h]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const h=o[l].material===void 0?e0(this.cache):this.getDependency("material",o[l].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let f=0,g=h.length;f<g;f++){const _=h[f],m=o[f];let p;const M=c[f];if(m.mode===jt.TRIANGLES||m.mode===jt.TRIANGLE_STRIP||m.mode===jt.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new Qd(_,M):new ct(_,M),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===jt.TRIANGLE_STRIP?p.geometry=sc(p.geometry,Ic):m.mode===jt.TRIANGLE_FAN&&(p.geometry=sc(p.geometry,Yo));else if(m.mode===jt.LINES)p=new ls(_,M);else if(m.mode===jt.LINE_STRIP)p=new _r(_,M);else if(m.mode===jt.LINE_LOOP)p=new ru(_,M);else if(m.mode===jt.POINTS)p=new ou(_,M);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&n0(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),An(p,r),m.extensions&&Qn(i,p,m),t.assignFinalMaterial(p),u.push(p)}for(let f=0,g=u.length;f<g;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&Qn(i,u[0],r),u[0];const d=new an;r.extensions&&Qn(i,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=u.length;f<g;f++)d.add(u[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Lt(dn.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Sa(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),An(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),o=i,a=[],l=[];for(let c=0,h=o.length;c<h;c++){const u=o[c];if(u){a.push(u);const d=new Pe;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new xa(a,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],l=[],c=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){const f=i.channels[u],g=i.samplers[f.sampler],_=f.target,m=_.node,p=i.parameters!==void 0?i.parameters[g.input]:g.input,M=i.parameters!==void 0?i.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",M)),c.push(g),h.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){const d=u[0],f=u[1],g=u[2],_=u[3],m=u[4],p=[];for(let M=0,y=d.length;M<y;M++){const x=d[M],C=f[M],T=g[M],R=_[M],P=m[M];if(x===void 0)continue;x.updateMatrix&&x.updateMatrix();const S=n._createAnimationTracks(x,C,T,R,P);if(S)for(let v=0;v<S.length;v++)p.push(S[v])}return new mu(r,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=i.weights.length;l<c;l++)a.morphTargetInfluences[l]=i.weights[l]}),o})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let c=0,h=a.length;c<h;c++)o.push(n.getDependency("node",a[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){const h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,r0)});for(let f=0,g=u.length;f<g;f++)h.add(u[f]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let h;if(r.isBone===!0?h=new Hc:c.length>1?h=new an:c.length===1?h=c[0]:h=new ot,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=o),An(h,r),r.extensions&&Qn(n,h,r),r.matrix!==void 0){const u=new Pe;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);return i.associations.has(h)||i.associations.set(h,{}),i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new an;n.name&&(r.name=i.createUniqueName(n.name)),An(r,n),n.extensions&&Qn(t,r,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(i.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let h=0,u=l.length;h<u;h++)r.add(l[h]);const c=h=>{const u=new Map;for(const[d,f]of i.associations)(d instanceof fn||d instanceof xt)&&u.set(d,f);return h.traverse(d=>{const f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=c(r),r})}_createAnimationTracks(e,t,n,i,r){const o=[],a=e.name?e.name:e.uuid,l=[];Bn[r.path]===Bn.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(a);let c;switch(Bn[r.path]){case Bn.weights:c=ki;break;case Bn.rotation:c=Gi;break;case Bn.position:case Bn.scale:c=Hi;break;default:switch(n.itemSize){case 1:c=ki;break;case 2:case 3:default:c=Hi;break}break}const h=i.interpolation!==void 0?Q_[i.interpolation]:us,u=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){const g=new c(l[d]+"."+Bn[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Qo(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Gi?J_:eh;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function a0(s,e,t){const n=e.attributes,i=new pt;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(i.set(new A(l[0],l[1],l[2]),new A(c[0],c[1],c[2])),a.normalized){const h=Qo(Li[a.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new A,l=new A;for(let c=0,h=r.length;c<h;c++){const u=r[c];if(u.POSITION!==void 0){const d=t.json.accessors[u.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){const _=Qo(Li[d.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;const o=new mn;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function lc(s,e,t){const n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){s.setAttribute(a,l)})}for(const o in n){const a=Jo[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){const o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return He.workingColorSpace!==Dt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${He.workingColorSpace}" not supported.`),An(s,e),a0(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?t0(s,e.targets,t):s})}const cc={type:"change"},wa={type:"start"},th={type:"end"},Qs=new Xi,hc=new qt,l0=Math.cos(70*dn.DEG2RAD),_t=new A,Ut=2*Math.PI,et={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ao=1e-6;class c0 extends Gu{constructor(e,t=null){super(e,t),this.state=et.NONE,this.enabled=!0,this.target=new A,this.cursor=new A,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Et.ROTATE,MIDDLE:Et.DOLLY,RIGHT:Et.PAN},this.touches={ONE:bi.ROTATE,TWO:bi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new A,this._lastQuaternion=new pn,this._lastTargetPosition=new A,this._quat=new pn().setFromUnitVectors(e.up,new A(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ll,this._sphericalDelta=new Ll,this._scale=1,this._panOffset=new A,this._rotateStart=new Ee,this._rotateEnd=new Ee,this._rotateDelta=new Ee,this._panStart=new Ee,this._panEnd=new Ee,this._panDelta=new Ee,this._dollyStart=new Ee,this._dollyEnd=new Ee,this._dollyDelta=new Ee,this._dollyDirection=new A,this._mouse=new Ee,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=d0.bind(this),this._onPointerDown=h0.bind(this),this._onPointerUp=u0.bind(this),this._onContextMenu=y0.bind(this),this._onMouseWheel=m0.bind(this),this._onKeyDown=g0.bind(this),this._onTouchStart=_0.bind(this),this._onTouchMove=x0.bind(this),this._onMouseDown=f0.bind(this),this._onMouseMove=p0.bind(this),this._interceptControlDown=M0.bind(this),this._interceptControlUp=v0.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(cc),this.update(),this.state=et.NONE}update(e=null){const t=this.object.position;_t.copy(t).sub(this.target),_t.applyQuaternion(this._quat),this._spherical.setFromVector3(_t),this.autoRotate&&this.state===et.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,i=this.maxAzimuthAngle;isFinite(n)&&isFinite(i)&&(n<-Math.PI?n+=Ut:n>Math.PI&&(n-=Ut),i<-Math.PI?i+=Ut:i>Math.PI&&(i-=Ut),n<=i?this._spherical.theta=Math.max(n,Math.min(i,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+i)/2?Math.max(n,this._spherical.theta):Math.min(i,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(_t.setFromSpherical(this._spherical),_t.applyQuaternion(this._quatInverse),t.copy(this.target).add(_t),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=_t.length();o=this._clampDistance(a*this._scale);const l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const a=new A(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new A(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=_t.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Qs.origin.copy(this.object.position),Qs.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Qs.direction))<l0?this.object.lookAt(this.target):(hc.setFromNormalAndCoplanarPoint(this.object.up,this.target),Qs.intersectPlane(hc,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ao||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ao||this._lastTargetPosition.distanceToSquared(this.target)>ao?(this.dispatchEvent(cc),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Ut/60*this.autoRotateSpeed*e:Ut/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){_t.setFromMatrixColumn(t,0),_t.multiplyScalar(-e),this._panOffset.add(_t)}_panUp(e,t){this.screenSpacePanning===!0?_t.setFromMatrixColumn(t,1):(_t.setFromMatrixColumn(t,0),_t.crossVectors(this.object.up,_t)),_t.multiplyScalar(e),this._panOffset.add(_t)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const i=this.object.position;_t.copy(i).sub(this.target);let r=_t.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),i=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=i/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Ut*this._rotateDelta.x/t.clientHeight),this._rotateUp(Ut*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Ut*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Ut*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Ut*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Ut*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._rotateStart.set(n,i)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panStart.set(n,i)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),i=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(i,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Ut*this._rotateDelta.x/t.clientHeight),this._rotateUp(Ut*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panEnd.set(n,i)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ee,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function h0(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s)))}function d0(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function u0(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(th),this.state=et.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function f0(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Et.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=et.DOLLY;break;case Et.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=et.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=et.ROTATE}break;case Et.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=et.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=et.PAN}break;default:this.state=et.NONE}this.state!==et.NONE&&this.dispatchEvent(wa)}function p0(s){switch(this.state){case et.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case et.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case et.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function m0(s){this.enabled===!1||this.enableZoom===!1||this.state!==et.NONE||(s.preventDefault(),this.dispatchEvent(wa),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(th))}function g0(s){this.enabled!==!1&&this._handleKeyDown(s)}function _0(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case bi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(s),this.state=et.TOUCH_ROTATE;break;case bi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(s),this.state=et.TOUCH_PAN;break;default:this.state=et.NONE}break;case 2:switch(this.touches.TWO){case bi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=et.TOUCH_DOLLY_PAN;break;case bi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=et.TOUCH_DOLLY_ROTATE;break;default:this.state=et.NONE}break;default:this.state=et.NONE}this.state!==et.NONE&&this.dispatchEvent(wa)}function x0(s){switch(this._trackPointer(s),this.state){case et.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case et.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case et.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case et.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=et.NONE}}function y0(s){this.enabled!==!1&&s.preventDefault()}function M0(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function v0(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const E0=[6,7,4,5,2,3,0,1];class S0{constructor(e,t,n,i){this.scene=e,this.camera=t,this.renderer=n,this.controls=i,this.domElement=n.domElement,this.selectedMeshes=[],this.selectedMesh=null,this.gizmoGroup=new an,this.gizmoGroup.name="tinkerGizmoGroup",this.gizmoGroup.visible=!1,this.scene.add(this.gizmoGroup),this.onSelectCallback=null,this.onTransformCallback=null,this.onTransformEndCallback=null,this.handles=[],this.hoveredHandle=null,this.activeDrag=null,this.currentCorners=Array.from({length:8},()=>new A),this.raycaster=new ar,this.mouse=new Ee,this.matBox=new Ii({color:65450,transparent:!0,opacity:.85,depthTest:!1}),this.matDot=new Ot({color:0,side:Ft,depthTest:!1}),this.matDotBorder=new Ii({color:16777215,depthTest:!1}),this.matDotHover=new Ot({color:65450,side:Ft,depthTest:!1}),this.matCone=new Ot({color:0,depthTest:!1}),this.matConeHover=new Ot({color:65450,depthTest:!1}),this.matRot=new Ot({color:65450,depthTest:!1,side:Ft}),this.matRotHover=new Ot({color:16777215,depthTest:!1,side:Ft}),this.matRotLine=new Ii({color:65450,depthTest:!1}),this.matHitProxy=new Ot({transparent:!0,opacity:0,depthWrite:!1}),this.buildGizmoStructure(),this.bindEvents()}buildGizmoStructure(){const e=new St,t=new Float32Array(72);e.setAttribute("position",new dt(t,3)),this.boxLines=new ls(e,this.matBox),this.boxLines.renderOrder=999,this.gizmoGroup.add(this.boxLines),this.cornerMeshes=[];const n=new gs(.85,.85),i=new Tl(n);for(let c=0;c<8;c++){const h=new ct(n,this.matDot),u=new ls(i,this.matDotBorder);u.renderOrder=1001,h.add(u),h.userData={isHandle:!0,type:"corner",index:c,border:u},h.renderOrder=1e3,this.gizmoGroup.add(h),this.cornerMeshes.push(h),this.handles.push(h)}const r=new mr(.85,1.8,12);this.coneMesh=new ct(r,this.matCone);const o=new Tl(r),a=new ls(o,this.matDotBorder);a.renderOrder=1001,this.coneMesh.add(a),this.coneMesh.userData={isHandle:!0,type:"cone",border:a},this.coneMesh.renderOrder=1e3,this.gizmoGroup.add(this.coneMesh),this.handles.push(this.coneMesh);const l=new St;l.setAttribute("position",new dt(new Float32Array(6),3)),this.coneStem=new _r(l,this.matBox),this.coneStem.renderOrder=999,this.gizmoGroup.add(this.coneStem),this.rotHandles=[],this.rotGroup=new an,this.rotGroup.name="rotationHandles",this.gizmoGroup.add(this.rotGroup),this.rotY=this.createRotationArcHandle("y",[0,1,0]),this.rotGroup.add(this.rotY),this.handles.push(this.rotY),this.rotHandles.push(this.rotY),this.rotX=this.createRotationArcHandle("x",[1,0,0]),this.rotGroup.add(this.rotX),this.handles.push(this.rotX),this.rotHandles.push(this.rotX),this.rotZ=this.createRotationArcHandle("z",[0,0,1]),this.rotGroup.add(this.rotZ),this.handles.push(this.rotZ),this.rotHandles.push(this.rotZ)}createRotationArcHandle(e,t){const n=new an;n.userData={isHandle:!0,type:"rotate",axis:e};const i=10,r=.22,o=Math.PI*.45,a=o/2,l=new Ti(i,r,8,36,o),c=new ct(l,this.matRot);c.renderOrder=1e3,c.rotation.z=-a,c.userData={isHandle:!0,type:"rotate",axis:e,parentHandle:n},n.add(c);const h=new Ti(i,.85,6,24,o),u=new ct(h,this.matHitProxy);u.renderOrder=999,u.rotation.z=-a,u.userData={isHandle:!0,type:"rotate",axis:e,parentHandle:n},n.add(u);const d=new mr(.5,1.25,10),f=new ct(d,this.matRot),g=new ct(d,this.matRot);return f.renderOrder=1001,g.renderOrder=1001,f.userData={isHandle:!0,type:"rotate",axis:e,parentHandle:n},g.userData={isHandle:!0,type:"rotate",axis:e,parentHandle:n},n.add(f),n.add(g),e==="y"?n.rotation.set(Math.PI/2,0,-Math.PI/2):e==="x"?n.rotation.set(0,Math.PI/2,Math.PI/2):e==="z"&&n.rotation.set(0,0,Math.PI/2),n.userData.mesh=c,n.userData.hitMesh=u,n.userData.arrow1=f,n.userData.arrow2=g,n}updateRotationArcHandle(e,t){if(!e)return;const n=Math.min(Math.PI*.52,Math.max(Math.PI*.32,14/t)),i=n/2,r=.22;e.userData.mesh&&(e.userData.mesh.geometry&&e.userData.mesh.geometry.dispose(),e.userData.mesh.geometry=new Ti(t,r,8,36,n),e.userData.mesh.rotation.z=-i),e.userData.hitMesh&&(e.userData.hitMesh.geometry&&e.userData.hitMesh.geometry.dispose(),e.userData.hitMesh.geometry=new Ti(t,.85,6,24,n),e.userData.hitMesh.rotation.z=-i);const o=e.userData.arrow1,a=e.userData.arrow2;if(o&&a){const l=t*Math.cos(-i),c=t*Math.sin(-i);o.position.set(l,c,0);const h=Math.sin(-i),u=-Math.cos(-i);o.rotation.z=Math.atan2(-h,u);const d=t*Math.cos(i),f=t*Math.sin(i);a.position.set(d,f,0);const g=-Math.sin(i),_=Math.cos(i);a.rotation.z=Math.atan2(-g,_)}}attach(e){if(!e){this.detach();return}if(Array.isArray(e)?this.selectedMeshes=e.filter(Boolean):e instanceof Set?this.selectedMeshes=Array.from(e).filter(Boolean):this.selectedMeshes=[e],this.selectedMeshes.length===0){this.detach();return}this.selectedMesh=this.selectedMeshes[0],this.gizmoGroup.visible=!0,this.updateGizmoBounds(),this.onSelectCallback&&this.onSelectCallback(this.selectedMeshes,this.getMeshInfo(this.selectedMesh))}detach(){this.selectedMeshes=[],this.selectedMesh=null,this.gizmoGroup.visible=!1,this.onSelectCallback&&this.onSelectCallback([],null)}getMeshInfo(e){if(!e)return null;e.geometry.boundingBox||e.geometry.computeBoundingBox();const t=e.geometry.boundingBox.getSize(new A),n=Math.round(t.x*Math.abs(e.scale.x)),i=Math.round(t.z*Math.abs(e.scale.z)),r=Math.round(t.y*Math.abs(e.scale.y)),o=Math.round(e.position.y-r/2);return{name:e.userData.formName||e.userData.formId||"Form",formId:e.userData.formId,width:n,depth:i,height:r,elevation:o,selectedCount:this.selectedMeshes.length}}updateGizmoBounds(){if(this.selectedMeshes.length===0)return;let e=new A,t=new A,n=0,i=0,r=0;const o=[];if(this.selectedMeshes.length===1){const M=this.selectedMeshes[0];M.geometry.boundingBox||M.geometry.computeBoundingBox();const y=M.geometry.boundingBox,x=y.getCenter(new A),C=y.getSize(new A);n=C.x*Math.abs(M.scale.x)/2,i=C.y*Math.abs(M.scale.y)/2,r=C.z*Math.abs(M.scale.z)/2,t.set(n*2,i*2,r*2);const T=[new A(x.x-n,x.y-i,x.z-r),new A(x.x+n,x.y-i,x.z-r),new A(x.x+n,x.y-i,x.z+r),new A(x.x-n,x.y-i,x.z+r),new A(x.x-n,x.y+i,x.z-r),new A(x.x+n,x.y+i,x.z-r),new A(x.x+n,x.y+i,x.z+r),new A(x.x-n,x.y+i,x.z+r)];M.updateMatrixWorld(!0);for(let R=0;R<8;R++)o.push(M.localToWorld(T[R].clone()));e=M.localToWorld(x.clone()),this.rotGroup.quaternion.copy(M.quaternion)}else{const M=new pt;for(const C of this.selectedMeshes)M.expandByObject(C);const y=M.min,x=M.max;M.getCenter(e),M.getSize(t),n=t.x/2,i=t.y/2,r=t.z/2,o.push(new A(y.x,y.y,y.z),new A(x.x,y.y,y.z),new A(x.x,y.y,x.z),new A(y.x,y.y,x.z),new A(y.x,x.y,y.z),new A(x.x,x.y,y.z),new A(x.x,x.y,x.z),new A(y.x,x.y,x.z)),this.rotGroup.quaternion.identity()}const a=this.boxLines.geometry.attributes.position.array;let l=0;const c=(M,y)=>{a[l++]=o[M].x,a[l++]=o[M].y,a[l++]=o[M].z,a[l++]=o[y].x,a[l++]=o[y].y,a[l++]=o[y].z};c(0,1),c(1,2),c(2,3),c(3,0),c(4,5),c(5,6),c(6,7),c(7,4),c(0,4),c(1,5),c(2,6),c(3,7),this.boxLines.geometry.attributes.position.needsUpdate=!0,this.currentCorners=o.map(M=>M.clone());for(let M=0;M<8;M++)this.cornerMeshes[M].position.copy(o[M]);const h=new A().add(o[4]).add(o[5]).add(o[6]).add(o[7]).multiplyScalar(.25),u=h.y+2;this.coneMesh.position.set(h.x,u,h.z);const d=this.coneStem.geometry.attributes.position.array;d[0]=h.x,d[1]=h.y,d[2]=h.z,d[3]=h.x,d[4]=u-.8,d[5]=h.z,this.coneStem.geometry.attributes.position.needsUpdate=!0;const f=Math.max(t.x,t.z,t.y),g=Math.max(3.5,Math.min(8,f*.15)),_=r+g,m=i+g,p=i+g;this.updateRotationArcHandle(this.rotY,_),this.updateRotationArcHandle(this.rotX,m),this.updateRotationArcHandle(this.rotZ,p),this.rotGroup.position.copy(e),this.rotY.position.set(0,-i,0),this.rotX.position.set(n+g*.5,0,0),this.rotZ.position.set(0,0,-r-g*.5),this.updateOrientation()}updateOrientation(){if(this.gizmoGroup.visible)for(const e of this.cornerMeshes)e.quaternion.copy(this.camera.quaternion)}bindEvents(){this.onPointerDown=this.onPointerDown.bind(this),this.onPointerMove=this.onPointerMove.bind(this),this.onPointerUp=this.onPointerUp.bind(this),this.domElement.addEventListener("pointerdown",this.onPointerDown),window.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp),window.addEventListener("mouseup",this.onPointerUp),window.addEventListener("pointercancel",this.onPointerUp)}destroy(){this.domElement.removeEventListener("pointerdown",this.onPointerDown),window.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("pointerup",this.onPointerUp),window.removeEventListener("mouseup",this.onPointerUp),window.removeEventListener("pointercancel",this.onPointerUp),this.scene.remove(this.gizmoGroup)}getPointer(e){const t=this.domElement.getBoundingClientRect();return{x:(e.clientX-t.left)/t.width*2-1,y:-((e.clientY-t.top)/t.height*2-1)}}onPointerDown(e){if(e.button!==0||this.viewport&&this.viewport.isSpaceHeld)return;const t=this.getPointer(e);if(this.mouse.set(t.x,t.y),this.raycaster.setFromCamera(this.mouse,this.camera),this.selectedMeshes.length>0&&this.gizmoGroup.visible){const n=this.raycaster.intersectObjects(this.handles,!0);if(n.length>0){e.stopPropagation(),e.preventDefault(),this.controls.enabled=!1;let r=n[0].object;for(r&&r.userData.parentHandle&&(r=r.userData.parentHandle);r&&!r.userData.type&&r.parent&&r.parent!==this.gizmoGroup;)r=r.parent;r&&r.userData.parentHandle&&(r=r.userData.parentHandle);const o=r.userData.type,a=this.selectedMeshes.map(h=>({mesh:h,startPos:h.position.clone(),startScale:h.scale.clone(),startRot:h.rotation.clone(),startQuat:h.quaternion.clone()})),l=new pt;for(const h of this.selectedMeshes)l.expandByObject(h);const c=this.rotGroup?this.rotGroup.position.clone():l.getCenter(new A);if(o==="cone"){const h=new A;this.camera.getWorldDirection(h),h.y=0,h.normalize();const u=new qt().setFromNormalAndCoplanarPoint(h,this.coneMesh.position),d=new A;this.raycaster.ray.intersectPlane(u,d),this.activeDrag={type:"cone",plane:u,startPoint:d||n[0].point,meshSnapshots:a};return}if(o==="corner"){const h=r.userData.index,u=E0[h],d=this.currentCorners[u].clone(),f=this.currentCorners[h].clone(),g=new A().subVectors(f,d),_=g.length()||1,m=new A;this.camera.getWorldDirection(m).negate();const p=new qt().setFromNormalAndCoplanarPoint(m,f),M=new A;this.raycaster.ray.intersectPlane(p,M),this.activeDrag={type:"corner",plane:p,anchor:d,startVec:g,startVecNorm:g.clone().normalize(),startDist:_,startPoint:M||n[0].point,meshSnapshots:a};return}if(o==="rotate"){const h=r.userData.axis;let u=new A(0,1,0);h==="x"&&(u=new A(1,0,0)),h==="z"&&(u=new A(0,0,1));const d=new qt().setFromNormalAndCoplanarPoint(u,c),f=new A;this.raycaster.ray.intersectPlane(d,f);const g=f||n[0].point;let _=0;h==="y"?_=Math.atan2(g.z-c.z,g.x-c.x):h==="x"?_=Math.atan2(g.y-c.y,g.z-c.z):h==="z"&&(_=Math.atan2(g.y-c.y,g.x-c.x)),this.activeDrag={type:"rotate",axis:h,plane:d,center:c,startAngle:_,meshSnapshots:a};return}}const i=this.raycaster.intersectObjects(this.selectedMeshes,!0);if(i.length>0){e.stopPropagation(),e.preventDefault(),this.controls.enabled=!1;const r=i[0],o=new qt(new A(0,1,0),-r.point.y),a=new A;this.raycaster.ray.intersectPlane(o,a);const l=this.selectedMeshes.map(c=>({mesh:c,startPos:c.position.clone(),startScale:c.scale.clone(),startRot:c.rotation.clone(),startQuat:c.quaternion.clone()}));this.activeDrag={type:"body",plane:o,startPoint:a||r.point,meshSnapshots:l};return}}}onPointerMove(e){const t=this.getPointer(e);if(this.mouse.set(t.x,t.y),this.activeDrag){this.raycaster.setFromCamera(this.mouse,this.camera);const n=new A;if(this.activeDrag.type==="cone"){if(this.raycaster.ray.intersectPlane(this.activeDrag.plane,n)){const i=n.y-this.activeDrag.startPoint.y;for(const r of this.activeDrag.meshSnapshots)r.mesh.position.y=r.startPos.y+i;this.updateGizmoBounds(),this.notifyTransform()}return}if(this.activeDrag.type==="body"){if(this.raycaster.ray.intersectPlane(this.activeDrag.plane,n)){const i=n.x-this.activeDrag.startPoint.x,r=n.z-this.activeDrag.startPoint.z;for(const o of this.activeDrag.meshSnapshots)o.mesh.position.x=o.startPos.x+i,o.mesh.position.z=o.startPos.z+r;this.updateGizmoBounds(),this.notifyTransform()}return}if(this.activeDrag.type==="corner"){if(this.raycaster.ray.intersectPlane(this.activeDrag.plane,n)){const i=this.activeDrag.anchor,o=new A().subVectors(n,i).dot(this.activeDrag.startVecNorm),a=Math.max(.05,o/this.activeDrag.startDist);for(const l of this.activeDrag.meshSnapshots)l.mesh.scale.copy(l.startScale).multiplyScalar(a),l.mesh.position.set(i.x+(l.startPos.x-i.x)*a,i.y+(l.startPos.y-i.y)*a,i.z+(l.startPos.z-i.z)*a);this.updateGizmoBounds(),this.notifyTransform()}return}if(this.activeDrag.type==="rotate"){if(this.raycaster.ray.intersectPlane(this.activeDrag.plane,n)){const i=this.activeDrag.center,r=this.activeDrag.axis;let o=0;r==="y"?o=Math.atan2(n.z-i.z,n.x-i.x):r==="x"?o=Math.atan2(n.y-i.y,n.z-i.z):r==="z"&&(o=Math.atan2(n.y-i.y,n.x-i.x));let a=o-this.activeDrag.startAngle;const l=e.shiftKey?Math.PI/8:Math.PI/36;if(a=Math.round(a/l)*l,this.activeDrag.meshSnapshots.length===1){const c=this.activeDrag.meshSnapshots[0];r==="y"?c.mesh.rotation.y=c.startRot.y+a:r==="x"?c.mesh.rotation.x=c.startRot.x+a:r==="z"&&(c.mesh.rotation.z=c.startRot.z+a)}else for(const c of this.activeDrag.meshSnapshots){const h=c.startPos.clone().sub(i);r==="y"?(c.mesh.rotation.y=c.startRot.y+a,h.applyAxisAngle(new A(0,1,0),a)):r==="x"?(c.mesh.rotation.x=c.startRot.x+a,h.applyAxisAngle(new A(1,0,0),a)):r==="z"&&(c.mesh.rotation.z=c.startRot.z+a,h.applyAxisAngle(new A(0,0,1),a)),c.mesh.position.copy(i).add(h)}this.updateGizmoBounds(),this.notifyTransform()}return}}if(this.gizmoGroup.visible){this.raycaster.setFromCamera(this.mouse,this.camera);const n=this.raycaster.intersectObjects(this.handles,!0);if(n.length>0){let i=n[0].object;for(i&&i.userData.parentHandle&&(i=i.userData.parentHandle);i&&!i.userData.type&&i.parent&&i.parent!==this.gizmoGroup;)i=i.parent;i&&i.userData.parentHandle&&(i=i.userData.parentHandle),this.hoveredHandle!==i&&(this.resetHandleColors(),this.hoveredHandle=i,i.userData.type==="cone"?i.material=this.matConeHover:i.userData.type==="corner"?i.material=this.matDotHover:i.userData.type==="rotate"&&(i.userData.mesh&&(i.userData.mesh.material=this.matRotHover),i.userData.arrow1&&(i.userData.arrow1.material=this.matRotHover),i.userData.arrow2&&(i.userData.arrow2.material=this.matRotHover)),this.domElement.style.cursor="pointer")}else this.hoveredHandle&&(this.resetHandleColors(),this.hoveredHandle=null,this.domElement.style.cursor="default")}}onPointerUp(){if(this.activeDrag){const e=this.activeDrag;if(this.activeDrag=null,this.controls.enabled=!0,this.onTransformEndCallback&&this.selectedMeshes.length>0)try{this.onTransformEndCallback(this.selectedMeshes,this.getTransformSummary(),e.meshSnapshots)}catch(t){console.error("[TinkerGizmo] Error in onTransformEndCallback:",t)}}}resetHandleColors(){this.coneMesh.material=this.matCone;for(const e of this.cornerMeshes)e.material=this.matDot,e.userData.border&&(e.userData.border.material=this.matDotBorder);for(const e of this.rotHandles)e.userData.mesh&&(e.userData.mesh.material=this.matRot),e.userData.arrow1&&(e.userData.arrow1.material=this.matRot),e.userData.arrow2&&(e.userData.arrow2.material=this.matRot)}notifyTransform(){this.onTransformCallback&&this.selectedMeshes.length>0&&this.onTransformCallback(this.selectedMeshes,this.getTransformSummary())}getTransformSummary(){if(this.selectedMeshes.length===0)return null;const e=this.selectedMesh||this.selectedMeshes[0];return{...this.getMeshInfo(e),selectedCount:this.selectedMeshes.length,dx:Math.round(e.position.x),dy:Math.round(-e.position.z),dz:Math.round(e.position.y),sx:parseFloat(e.scale.x.toFixed(2)),sy:parseFloat(e.scale.z.toFixed(2)),sz:parseFloat(e.scale.y.toFixed(2)),rx:Math.round(dn.radToDeg(e.rotation.x)),ry:Math.round(dn.radToDeg(e.rotation.y)),rz:Math.round(dn.radToDeg(e.rotation.z))}}}class b0{constructor(e=50){this.undoStack=[],this.redoStack=[],this.maxHistory=e,this.onStateChange=null}push(e){!e||!e.undo||!e.execute||(this.undoStack.push(e),this.undoStack.length>this.maxHistory&&this.undoStack.shift(),this.redoStack=[],this.onStateChange&&this.onStateChange(this.canUndo(),this.canRedo()))}undo(){if(!this.canUndo())return!1;const e=this.undoStack.pop();return e.undo(),this.redoStack.push(e),this.onStateChange&&this.onStateChange(this.canUndo(),this.canRedo()),!0}redo(){if(!this.canRedo())return!1;const e=this.redoStack.pop();return e.execute(),this.undoStack.push(e),this.onStateChange&&this.onStateChange(this.canUndo(),this.canRedo()),!0}canUndo(){return this.undoStack.length>0}canRedo(){return this.redoStack.length>0}clear(){this.undoStack=[],this.redoStack=[],this.onStateChange&&this.onStateChange(!1,!1)}}function T0(s,e=.05){if(!s||!s.attributes.position)return;const t=s.attributes.position;s.computeVertexNormals();const n=s.attributes.normal,i=t.count,r=new Float32Array(i*2);for(let o=0;o<i;o++){const a=t.getX(o),l=t.getY(o),c=t.getZ(o),h=Math.abs(n?n.getX(o):0),u=Math.abs(n?n.getY(o):1),d=Math.abs(n?n.getZ(o):0);let f=0,g=0;u>=h&&u>=d?(f=a*e,g=c*e):h>=u&&h>=d?(f=c*e,g=l*e):(f=a*e,g=l*e),r[o*2]=f,r[o*2+1]=g}s.setAttribute("uv",new dt(r,2)),s.uvsNeedUpdate=!0}function A0(s={}){const e=(s.type||"fur").toLowerCase().trim(),t=s.baseColor||"#8a7356",n=s.secondaryColor||"#5a4632",i=Math.max(.04,Math.min(.98,Number(s.roughness)||.65)),r=Math.max(0,Math.min(.95,Number(s.metalness)||.05)),o=Math.max(.01,Math.min(.3,Number(s.bumpScale)||.06)),a=Math.max(1,Math.min(16,Number(s.textureScale)||3)),l=128,c=document.createElement("canvas");c.width=l,c.height=l;const h=c.getContext("2d"),u=document.createElement("canvas");u.width=l,u.height=l;const d=u.getContext("2d"),f=dc(t),g=dc(n);h.fillStyle=`rgb(${f.r}, ${f.g}, ${f.b})`,h.fillRect(0,0,l,l),d.fillStyle="#808080",d.fillRect(0,0,l,l);const _=h.getImageData(0,0,l,l),m=d.getImageData(0,0,l,l),p=_.data,M=m.data;e==="fur"?uc(p,M,l,f,g):e==="leather"?w0(p,M,l,f,g):e==="metal_brushed"?R0(p,M,l,f,g):e==="metal_riveted"?C0(p,M,l,f,g):e==="wood"?P0(p,M,l,f,g):e==="rubber"?I0(p,M,l,f,g):e==="stone"?L0(p,M,l,f,g):e==="cloth"?D0(p,M,l,f,g):e==="scales"?N0(p,M,l,f,g):e==="glass"?U0(p,M,l,f):uc(p,M,l,f,g),h.putImageData(_,0,0),d.putImageData(m,0,0);const y=new bl(c);y.wrapS=un,y.wrapT=un,y.repeat.set(a,a),y.colorSpace=mt,y.minFilter=rn,y.magFilter=Tt;const x=new bl(u);x.wrapS=un,x.wrapT=un,x.repeat.set(a,a),x.minFilter=rn,x.magFilter=Tt;const C=new _s({map:y,bumpMap:x,bumpScale:o,roughness:i,metalness:r,flatShading:!0});return C.userData={isAiTextured:!0,spec:s},C}function dc(s){const e=(s||"").replace("#","").trim();return e.length===6?{r:parseInt(e.slice(0,2),16)||120,g:parseInt(e.slice(2,4),16)||120,b:parseInt(e.slice(4,6),16)||120}:e.length===3?{r:parseInt(e[0]+e[0],16)||120,g:parseInt(e[1]+e[1],16)||120,b:parseInt(e[2]+e[2],16)||120}:{r:140,g:120,b:100}}function uc(s,e,t,n,i){for(let r=0;r<t;r++)for(let o=0;o<t;o++){const a=(r*t+o)*4,l=Math.sin(o*.8+r*2.5)*.5+.5,c=(Math.random()-.5)*.35,h=Math.max(0,Math.min(1,l*.6+c+.2)),u=Math.round(n.r*(1-h)+i.r*h),d=Math.round(n.g*(1-h)+i.g*h),f=Math.round(n.b*(1-h)+i.b*h);s[a]=u,s[a+1]=d,s[a+2]=f,s[a+3]=255;const g=Math.round(110+h*45);e[a]=g,e[a+1]=g,e[a+2]=g,e[a+3]=255}}function w0(s,e,t,n,i){for(let r=0;r<t;r++)for(let o=0;o<t;o++){const a=(r*t+o)*4,l=Math.sin(o*.45)*Math.cos(r*.45)+Math.sin(o*.9+r*.9)*.3,c=Math.random()<.08?-.4:0,h=Math.max(0,Math.min(1,(l*.5+.5)*.5+c+.25));s[a]=Math.round(n.r*(1-h*.5)+i.r*(h*.5)),s[a+1]=Math.round(n.g*(1-h*.5)+i.g*(h*.5)),s[a+2]=Math.round(n.b*(1-h*.5)+i.b*(h*.5)),s[a+3]=255;const u=Math.round(100+h*60+c*50);e[a]=u,e[a+1]=u,e[a+2]=u,e[a+3]=255}}function R0(s,e,t,n,i){const r=new Float32Array(t);for(let o=0;o<t;o++)r[o]=Math.random()*.45-.22;for(let o=0;o<t;o++){const a=r[o];for(let l=0;l<t;l++){const c=(o*t+l)*4,h=(Math.random()-.5)*.15,u=Math.max(0,Math.min(1,a+h+.5));s[c]=Math.round(n.r*(1-u*.35)+i.r*(u*.35)),s[c+1]=Math.round(n.g*(1-u*.35)+i.g*(u*.35)),s[c+2]=Math.round(n.b*(1-u*.35)+i.b*(u*.35)),s[c+3]=255;const d=Math.round(115+(u-.5)*40);e[c]=d,e[c+1]=d,e[c+2]=d,e[c+3]=255}}}function C0(s,e,t,n,i){for(let r=0;r<t;r++)for(let o=0;o<t;o++){const a=(r*t+o)*4;let c=Math.min(o,t-1-o,r,t-1-r)<=2,h=!1;const u=[[8,8],[t-9,8],[8,t-9],[t-9,t-9]];for(const[g,_]of u)if(Math.hypot(o-g,r-_)<=3.5){h=!0;break}let d=(Math.random()-.5)*.12+.5,f=128;c?(d=.85,f=60):h&&(d=.2,f=210),s[a]=Math.round(n.r*(1-d*.4)+i.r*(d*.4)),s[a+1]=Math.round(n.g*(1-d*.4)+i.g*(d*.4)),s[a+2]=Math.round(n.b*(1-d*.4)+i.b*(d*.4)),s[a+3]=255,e[a]=f,e[a+1]=f,e[a+2]=f,e[a+3]=255}}function P0(s,e,t,n,i){for(let r=0;r<t;r++)for(let o=0;o<t;o++){const a=(r*t+o)*4,l=Math.sin(o*.18+Math.sin(r*.08)*4)*.5+.5,c=(Math.random()-.5)*.12,h=Math.max(0,Math.min(1,l*.75+c+.15));s[a]=Math.round(n.r*(1-h)+i.r*h),s[a+1]=Math.round(n.g*(1-h)+i.g*h),s[a+2]=Math.round(n.b*(1-h)+i.b*h),s[a+3]=255;const u=Math.round(110+(h-.5)*40);e[a]=u,e[a+1]=u,e[a+2]=u,e[a+3]=255}}function I0(s,e,t,n,i){for(let r=0;r<t;r++)for(let o=0;o<t;o++){const a=(r*t+o)*4,l=Math.abs(o%16-8)<2,c=Math.abs(r%16-8)<2,h=l||c,u=(Math.random()-.5)*.08;let d=h?.75:.35+u,f=h?65:135;s[a]=Math.round(n.r*(1-d)+i.r*d),s[a+1]=Math.round(n.g*(1-d)+i.g*d),s[a+2]=Math.round(n.b*(1-d)+i.b*d),s[a+3]=255,e[a]=f,e[a+1]=f,e[a+2]=f,e[a+3]=255}}function L0(s,e,t,n,i){for(let r=0;r<t;r++)for(let o=0;o<t;o++){const a=(r*t+o)*4,l=Math.random(),c=l<.2?.7:l>.8?.15:.45;s[a]=Math.round(n.r*(1-c)+i.r*c),s[a+1]=Math.round(n.g*(1-c)+i.g*c),s[a+2]=Math.round(n.b*(1-c)+i.b*c),s[a+3]=255;const h=Math.round(100+(c-.5)*55);e[a]=h,e[a+1]=h,e[a+2]=h,e[a+3]=255}}function D0(s,e,t,n,i){for(let r=0;r<t;r++)for(let o=0;o<t;o++){const a=(r*t+o)*4,c=(o%4<2^r%4<2?.6:.35)+(Math.random()-.5)*.1;s[a]=Math.round(n.r*(1-c)+i.r*c),s[a+1]=Math.round(n.g*(1-c)+i.g*c),s[a+2]=Math.round(n.b*(1-c)+i.b*c),s[a+3]=255;const h=Math.round(115+(c-.5)*35);e[a]=h,e[a+1]=h,e[a+2]=h,e[a+3]=255}}function N0(s,e,t,n,i){for(let a=0;a<t;a++){const c=Math.floor(a/12)%2*(16/2);for(let h=0;h<t;h++){const u=(a*t+h)*4,d=(h+c)%16,f=a%12,g=Math.hypot((d-16/2)/(16/2),(f-12)/12),m=Math.abs(g-1)<.15?.75:Math.max(0,1-g)*.4+.2;s[u]=Math.round(n.r*(1-m)+i.r*m),s[u+1]=Math.round(n.g*(1-m)+i.g*m),s[u+2]=Math.round(n.b*(1-m)+i.b*m),s[u+3]=255;const p=Math.round(100+(1-g)*50);e[u]=p,e[u+1]=p,e[u+2]=p,e[u+3]=255}}}function U0(s,e,t,n,i){for(let r=0;r<t;r++)for(let o=0;o<t;o++){const a=(r*t+o)*4,l=(o+r)/(t*2),c=Math.sin(l*Math.PI)*.25;s[a]=Math.min(255,Math.round(n.r+c*80)),s[a+1]=Math.min(255,Math.round(n.g+c*80)),s[a+2]=Math.min(255,Math.round(n.b+c*80)),s[a+3]=255,e[a]=128,e[a+1]=128,e[a+2]=128,e[a+3]=255}}class O0{constructor(e){this.container=e,this.width=520,this.height=422,this.scene=null,this.camera=null,this.renderer=null,this.controls=null,this.currentMesh=null,this.modelGroup=null,this.formMeshes=new Map,this.selectedMeshes=new Set,this.clipboard=[],this.historyManager=new b0,this.isEditMode=!1,this.tinkerGizmo=null,this.gridHelper=null,this.stlLoader=new A_,this.gltfLoader=new w_,this.onFormSelected=null,this.onFormTransformed=null,this.onFormDoubleClicked=null,this.isSpaceHeld=!1,this.isMarqueeActive=!1,this.isWireframe=!1,this.showGrid=!0,this.materialModes=["clay","slate","cyber_amber","matrix_green"],this.currentMatIndex=0,this.init()}init(){this.scene=new Kd,this.scene.background=new Te(790037),this.camera=new Lt(40,this.width/this.height,.5,1e3),this.camera.position.set(80,80,70),this.renderer=new T_({antialias:!1,powerPreference:"high-performance"}),this.renderer.setSize(this.width,this.height),this.renderer.setPixelRatio(1),this.renderer.outputColorSpace=mt,this.renderer.toneMapping=yc,this.renderer.toneMappingExposure=1.1;const e=this.renderer.domElement;e.style.width=`${this.width}px`,e.style.height=`${this.height}px`,e.style.imageRendering="pixelated",this.container.innerHTML="",this.container.style.position="relative",this.container.appendChild(e),this.selectionBox=document.createElement("div"),this.selectionBox.className="selection-marquee",this.container.appendChild(this.selectionBox),this.controls=new c0(this.camera,e),this.controls.enableDamping=!0,this.controls.dampingFactor=.25,this.controls.rotateSpeed=.85,this.controls.zoomSpeed=.9,this.controls.panSpeed=.9,this.controls.minDistance=15,this.controls.maxDistance=400,this.controls.target.set(0,0,20);const t=new Ru(16777215,.7);this.scene.add(t);const n=new or(16774374,1.4);n.position.set(60,100,80),this.scene.add(n);const i=new or(8234239,.6);i.position.set(-60,-40,-40),this.scene.add(i);const r=new or(65450,.4);r.position.set(0,-80,60),this.scene.add(r),this.gridHelper=new ku(140,28,65450,2435640),this.gridHelper.position.y=0,this.scene.add(this.gridHelper),this.modelGroup=new an,this.scene.add(this.modelGroup),this.tinkerGizmo=new S0(this.scene,this.camera,this.renderer,this.controls),this.tinkerGizmo.viewport=this,this.tinkerGizmo.onSelectCallback=(o,a)=>{this.onFormSelected&&this.onFormSelected(o,a)},this.tinkerGizmo.onTransformCallback=(o,a)=>{this.onFormTransformed&&this.onFormTransformed(o,a)},this.tinkerGizmo.onTransformEndCallback=(o,a,l)=>{if(l&&l.length>0){const c=l.map(d=>({id:d.mesh.userData.formId,pos:d.startPos?d.startPos.clone():d.mesh.position.clone(),rot:d.startRot?d.startRot.clone():d.mesh.rotation.clone(),scale:d.startScale?d.startScale.clone():d.mesh.scale.clone()})),h=o.map(d=>({id:d.userData.formId,pos:d.position.clone(),rot:d.rotation.clone(),scale:d.scale.clone()}));c.some((d,f)=>!d.pos.equals(h[f].pos)||!d.rot.equals(h[f].rot)||!d.scale.equals(h[f].scale))&&this.historyManager.push({execute:()=>{for(const d of h){const f=this.formMeshes.get(d.id);f&&(f.position.copy(d.pos),f.rotation.copy(d.rot),f.scale.copy(d.scale))}this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform()},undo:()=>{for(const d of c){const f=this.formMeshes.get(d.id);f&&(f.position.copy(d.pos),f.rotation.copy(d.rot),f.scale.copy(d.scale))}this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform()}})}this.onFormTransformed&&this.onFormTransformed(o[0],a)},this.setupSpacebarPan(e),this.setupMarqueeSelection(e),this.setupDoubleClickHandler(e),this.animate=this.animate.bind(this),requestAnimationFrame(this.animate)}setupSpacebarPan(e){const t=i=>{const r=document.activeElement?document.activeElement.tagName.toLowerCase():"";r==="input"||r==="textarea"||(i.code==="Space"||i.key===" "||i.key==="Spacebar")&&!this.isSpaceHeld&&(i.preventDefault(),this.isSpaceHeld=!0,this.container.classList.add("cursor-grab"),this.controls&&(this.controls.mouseButtons.LEFT=Et.PAN,this.controls.enablePan=!0))},n=i=>{(i.code==="Space"||i.key===" "||i.key==="Spacebar")&&(this.isSpaceHeld=!1,this.container.classList.remove("cursor-grab","cursor-grabbing"),this.controls&&(this.controls.mouseButtons.LEFT=this.isEditMode?Et.NONE:Et.ROTATE))};window.addEventListener("keydown",t),window.addEventListener("keyup",n),window.addEventListener("blur",()=>{this.isSpaceHeld=!1,this.container.classList.remove("cursor-grab","cursor-grabbing"),this.controls&&(this.controls.mouseButtons.LEFT=this.isEditMode?Et.NONE:Et.ROTATE)}),e.addEventListener("pointerdown",i=>{i.button===0&&this.isSpaceHeld&&(this.container.classList.remove("cursor-grab"),this.container.classList.add("cursor-grabbing"))}),window.addEventListener("pointerup",()=>{this.container.classList.remove("cursor-grabbing"),this.isSpaceHeld&&this.container.classList.add("cursor-grab")})}setupMarqueeSelection(e){let t=0,n=0,i=!1,r=!1;e.addEventListener("pointerdown",o=>{if(!this.isEditMode||o.button!==0||this.isSpaceHeld||this.tinkerGizmo&&this.tinkerGizmo.activeDrag)return;const a=e.getBoundingClientRect(),l=new Ee((o.clientX-a.left)/a.width*2-1,-((o.clientY-a.top)/a.height*2-1)),c=new ar;c.setFromCamera(l,this.camera),!(this.tinkerGizmo&&this.tinkerGizmo.handles.length>0&&c.intersectObjects(this.tinkerGizmo.handles,!0).length>0)&&(t=o.clientX,n=o.clientY,i=!0,r=!1)}),window.addEventListener("pointermove",o=>{if(!i)return;const a=Math.hypot(o.clientX-t,o.clientY-n);if(!r&&a>4&&(r=!0,this.isMarqueeActive=!0,this.controls&&(this.controls.enabled=!1)),r){const l=e.getBoundingClientRect(),c=e.clientWidth>0?l.width/e.clientWidth:1,h=e.clientHeight>0?l.height/e.clientHeight:1,u=(t-l.left)/c,d=(n-l.top)/h,f=(o.clientX-l.left)/c,g=(o.clientY-l.top)/h,_=Math.min(u,f),m=Math.max(u,f),p=Math.min(d,g),M=Math.max(d,g);this.selectionBox.style.display="block",this.selectionBox.style.left=`${Math.max(0,_)}px`,this.selectionBox.style.top=`${Math.max(0,p)}px`,this.selectionBox.style.width=`${Math.max(0,m-_)}px`,this.selectionBox.style.height=`${Math.max(0,M-p)}px`}}),window.addEventListener("pointerup",o=>{if(i)if(i=!1,this.controls&&(this.controls.enabled=!0),r){this.selectionBox.style.display="none",this.isMarqueeActive=!1;const a=e.getBoundingClientRect(),l=e.clientWidth>0?a.width/e.clientWidth:1,c=e.clientHeight>0?a.height/e.clientHeight:1,h=(t-a.left)/l,u=(n-a.top)/c,d=(o.clientX-a.left)/l,f=(o.clientY-a.top)/c,g=Math.min(h,d),_=Math.max(h,d),m=Math.min(u,f),p=Math.max(u,f),M=[];for(const x of this.formMeshes.values())this.isMeshInsideScreenRect(x,g,_,m,p)&&M.push(x);if(o.shiftKey)for(const x of M)this.selectedMeshes.has(x)?this.selectedMeshes.delete(x):this.selectedMeshes.add(x);else{this.selectedMeshes.clear();for(const x of M)this.selectedMeshes.add(x)}const y=Array.from(this.selectedMeshes);y.length>0?this.tinkerGizmo.attach(y):this.tinkerGizmo.detach(),this.onFormSelected&&this.onFormSelected(y,y.length>0?this.tinkerGizmo.getMeshInfo(y[0]):null)}else{const a=e.getBoundingClientRect(),l=new Ee((o.clientX-a.left)/a.width*2-1,-((o.clientY-a.top)/a.height*2-1)),c=new ar;c.setFromCamera(l,this.camera);const h=Array.from(this.formMeshes.values()),u=c.intersectObjects(h,!0);if(u.length>0){let d=u[0].object;for(;d&&!d.userData.formId&&d.parent&&d.parent!==this.modelGroup;)d=d.parent;this.selectFormMesh(d,o.shiftKey)}else o.shiftKey||(this.selectedMeshes.clear(),this.tinkerGizmo.detach(),this.onFormSelected&&this.onFormSelected([],null))}})}isMeshInsideScreenRect(e,t,n,i,r){if(!e||!e.geometry)return!1;e.geometry.boundingBox||e.geometry.computeBoundingBox();const o=e.geometry.boundingBox,a=[new A(o.min.x,o.min.y,o.min.z),new A(o.max.x,o.min.y,o.min.z),new A(o.min.x,o.max.y,o.min.z),new A(o.max.x,o.max.y,o.min.z),new A(o.min.x,o.min.y,o.max.z),new A(o.max.x,o.min.y,o.max.z),new A(o.min.x,o.max.y,o.max.z),new A(o.max.x,o.max.y,o.max.z)];let l=1/0,c=-1/0,h=1/0,u=-1/0,d=!1;const f=this.width,g=this.height;for(const _ of a){_.applyMatrix4(e.matrixWorld),_.project(this.camera),_.z<=1&&(d=!0);const m=(_.x*.5+.5)*f,p=(-_.y*.5+.5)*g;l=Math.min(l,m),c=Math.max(c,m),h=Math.min(h,p),u=Math.max(u,p)}return d?l<=n&&c>=t&&h<=r&&u>=i:!1}setupDoubleClickHandler(e){e.addEventListener("dblclick",t=>{if(!this.isEditMode||this.isSpaceHeld)return;const n=e.getBoundingClientRect(),i=new Ee((t.clientX-n.left)/n.width*2-1,-((t.clientY-n.top)/n.height*2-1)),r=new ar;r.setFromCamera(i,this.camera);const o=Array.from(this.formMeshes.values()),a=r.intersectObjects(o,!0);if(a.length>0){t.preventDefault(),t.stopPropagation();let l=a[0].object;for(;l&&!l.userData.formId&&l.parent&&l.parent!==this.modelGroup;)l=l.parent;if(this.selectedMeshes.size>1&&this.selectedMeshes.has(l)||this.selectFormMesh(l,!1),this.onFormDoubleClicked){const u=Array.from(this.selectedMeshes).map(f=>{const g=this.tinkerGizmo?this.tinkerGizmo.getMeshInfo(f):{name:f.userData.formName,formId:f.userData.formId};return{mesh:f,...g,formId:f.userData.formId||g.formId,name:f.userData.formName||g.name}}),d=this.tinkerGizmo?this.tinkerGizmo.getMeshInfo(l):{name:l.userData.formName,formId:l.userData.formId};this.onFormDoubleClicked(l,d,u)}}})}animate(){requestAnimationFrame(this.animate),this.controls.update(),this.tinkerGizmo&&this.tinkerGizmo.updateOrientation(),this.renderer.render(this.scene,this.camera)}setEditMode(e){this.isEditMode=e,e?this.controls&&(this.controls.mouseButtons={LEFT:this.isSpaceHeld?Et.PAN:Et.NONE,MIDDLE:Et.DOLLY,RIGHT:Et.ROTATE}):(this.selectedMeshes.clear(),this.tinkerGizmo.detach(),this.controls&&(this.controls.mouseButtons={LEFT:Et.ROTATE,MIDDLE:Et.DOLLY,RIGHT:Et.PAN}))}selectFormMesh(e,t=!1){let n=e;if(typeof e=="string"&&(n=this.formMeshes.get(e)),n){t?this.selectedMeshes.has(n)?this.selectedMeshes.delete(n):this.selectedMeshes.add(n):(this.selectedMeshes.clear(),this.selectedMeshes.add(n));const i=Array.from(this.selectedMeshes);i.length>0?this.tinkerGizmo.attach(i):this.tinkerGizmo.detach()}else t||(this.selectedMeshes.clear(),this.tinkerGizmo.detach())}copySelection(){return this.selectedMeshes.size===0?[]:(this.clipboard=Array.from(this.selectedMeshes).map(e=>({name:e.userData.formName||"Form",geometry:e.geometry.clone(),material:e.material.clone(),position:e.position.clone(),rotation:e.rotation.clone(),scale:e.scale.clone()})),this.clipboard)}cutSelection(){return this.copySelection(),this.deleteSelection()}pasteClipboard(){if(!this.clipboard||this.clipboard.length===0)return[];const e=[],t=new A(4,0,4);for(const n of this.clipboard){const i=`form_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,r=new ct(n.geometry.clone(),n.material.clone());r.position.copy(n.position).add(t),r.rotation.copy(n.rotation),r.scale.copy(n.scale),r.userData={formId:i,formName:`${n.name} (Copy)`},this.modelGroup.add(r),this.formMeshes.set(i,r),e.push(r)}return this.selectedMeshes=new Set(e),this.tinkerGizmo.attach(e),this.tinkerGizmo.notifyTransform(),this.historyManager.push({execute:()=>{for(const n of e)this.modelGroup.add(n),this.formMeshes.set(n.userData.formId,n);this.selectedMeshes=new Set(e),this.tinkerGizmo.attach(e),this.tinkerGizmo.notifyTransform()},undo:()=>{for(const n of e)this.modelGroup.remove(n),this.formMeshes.delete(n.userData.formId);this.selectedMeshes.clear(),this.tinkerGizmo.detach(),this.tinkerGizmo.notifyTransform()}}),e}deleteSelection(){if(this.selectedMeshes.size===0)return[];const e=Array.from(this.selectedMeshes);for(const t of e)this.modelGroup.remove(t),t.userData.formId&&this.formMeshes.delete(t.userData.formId);return this.selectedMeshes.clear(),this.tinkerGizmo.detach(),this.tinkerGizmo.notifyTransform(),this.historyManager.push({execute:()=>{for(const t of e)this.modelGroup.remove(t),this.formMeshes.delete(t.userData.formId);this.selectedMeshes.clear(),this.tinkerGizmo.detach(),this.tinkerGizmo.notifyTransform()},undo:()=>{for(const t of e)this.modelGroup.add(t),this.formMeshes.set(t.userData.formId,t);this.selectedMeshes=new Set(e),this.tinkerGizmo.attach(e),this.tinkerGizmo.notifyTransform()}}),e}resetSelectedFormMesh(){if(this.selectedMeshes.size>0){const e=Array.from(this.selectedMeshes).map(t=>({mesh:t,id:t.userData.formId,pos:t.position.clone(),rot:t.rotation.clone(),scale:t.scale.clone()}));for(const t of this.selectedMeshes){const n=t.userData.initialPosition||new A(0,0,0);t.position.copy(n),t.rotation.set(0,0,0),t.scale.set(1,1,1)}this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform(),this.historyManager.push({execute:()=>{for(const t of e){const n=t.mesh.userData.initialPosition||new A(0,0,0);t.mesh.position.copy(n),t.mesh.rotation.set(0,0,0),t.mesh.scale.set(1,1,1)}this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform()},undo:()=>{for(const t of e)t.mesh.position.copy(t.pos),t.mesh.rotation.copy(t.rot),t.mesh.scale.copy(t.scale);this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform()}})}}resetAllFormMeshes(){const e=Array.from(this.formMeshes.values()).map(t=>({mesh:t,id:t.userData.formId,pos:t.position.clone(),rot:t.rotation.clone(),scale:t.scale.clone()}));for(const t of this.formMeshes.values()){const n=t.userData.initialPosition||new A(0,0,0);t.position.copy(n),t.rotation.set(0,0,0),t.scale.set(1,1,1)}this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform()),this.historyManager.push({execute:()=>{for(const t of this.formMeshes.values()){const n=t.userData.initialPosition||new A(0,0,0);t.position.copy(n),t.rotation.set(0,0,0),t.scale.set(1,1,1)}this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform())},undo:()=>{for(const t of e)t.mesh.position.copy(t.pos),t.mesh.rotation.copy(t.rot),t.mesh.scale.copy(t.scale);this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform())}})}getFormTransforms(){var t;const e={};for(const[n,i]of this.formMeshes.entries()){const r=i.userData.initialPosition||new A,o=i.position.x-r.x,a=i.position.y-r.y,l=i.position.z-r.z,c={cx:Math.round(r.x),cy:Math.round(-r.z),cz:Math.round(r.y),dx:Math.round(o),dy:Math.round(-l),dz:Math.round(a),rx:Math.round(dn.radToDeg(i.rotation.x)),ry:Math.round(dn.radToDeg(-i.rotation.z)),rz:Math.round(dn.radToDeg(i.rotation.y)),sx:parseFloat(i.scale.x.toFixed(2)),sy:parseFloat(i.scale.z.toFixed(2)),sz:parseFloat(i.scale.y.toFixed(2))};e[n]=c,(t=i.userData)!=null&&t.formName&&(e[i.userData.formName]=c,e[i.userData.formName.toLowerCase().trim()]=c)}return e}loadFormMeshes(e=[],t=null){var l,c,h,u;for(this.currentMesh&&(this.scene.remove(this.currentMesh),this.currentMesh.geometry&&this.currentMesh.geometry.dispose(),this.currentMesh=null);this.modelGroup.children.length>0;){const d=this.modelGroup.children[0];this.modelGroup.remove(d),d.geometry&&d.geometry.dispose()}if(this.formMeshes.clear(),this.selectedMeshes.clear(),this.tinkerGizmo.detach(),!e||e.length===0)return{facets:0,dimensions:{x:0,y:0,z:0}};let n=0;const i=new pt;for(const d of e){const f=this.stlLoader.parse(d.stlBuffer);f.computeVertexNormals(),f.rotateX(-Math.PI/2),f.computeBoundingBox();const g=f.boundingBox.getCenter(new A);f.translate(-g.x,-g.y,-g.z),f.computeBoundingBox();const _=this.createCurrentMaterial(d.name),m=new ct(f,_),M=(d.name||"").toLowerCase().trim(),y=d.id,x=t!=null&&t.forms?t.forms.get(M)||t.forms.get(y):null,C=!!(t!=null&&t.promptedTarget&&(t.promptedTarget===M||t.promptedTarget===(y||"").toLowerCase())||Array.isArray(t==null?void 0:t.promptedTargets)&&(t.promptedTargets.includes(M)||t.promptedTargets.includes((y||"").toLowerCase())));let T=g.clone(),R=g.clone(),P=new cn(0,0,0),S=new A(1,1,1);x&&(C&&!t.isMovePrompt||!C&&x.position)&&(T.copy(x.position),P.copy(x.rotation),S.copy(x.scale),R.copy(x.initialPosition||g)),m.position.copy(T),m.rotation.copy(P),m.scale.copy(S),m.userData={formId:d.id,formName:d.name,initialPosition:R.clone(),initialRotation:P.clone(),initialScale:S.clone(),scadCenter:{cx:Math.round(T.x),cy:Math.round(-T.z),cz:Math.round(T.y)}},m.updateMatrixWorld(!0),this.modelGroup.add(m),this.formMeshes.set(d.id,m),i.expandByObject(m),n+=f.attributes.position.count/3}let r=null;for(const d of this.formMeshes.values()){const f=(((l=d.userData)==null?void 0:l.formName)||"").toLowerCase().trim();if(f==="head"||f.endsWith(" head")||f==="skull"){r=d;break}}if(r&&r.position.y>12){const d=new pt().setFromObject(r),f=new A;d.getCenter(f);for(const g of this.formMeshes.values()){const _=(((c=g.userData)==null?void 0:c.formName)||"").toLowerCase().trim();if(/^(snout|nose|beak|left eye|right eye|eyes?|left ear|right ear|ears?|horns?|mouth|whiskers?)\b/i.test(_)){const p=new pt().setFromObject(g);if(p.max.y<d.min.y-2&&g.position.y<8){const M=f.y-g.position.y-(d.max.y-d.min.y)*.15;g.position.y+=M,_.includes("snout")||_.includes("nose")||_.includes("beak")?(g.position.x=d.max.x+(p.max.x-p.min.x)*.4,g.position.z=f.z):(_.includes("ear")||_.includes("horn"))&&(g.position.y=d.max.y+1),(h=g.userData)!=null&&h.initialPosition&&g.userData.initialPosition.copy(g.position),(u=g.userData)!=null&&u.scadCenter&&(g.userData.scadCenter.cx=Math.round(g.position.x),g.userData.scadCenter.cy=Math.round(-g.position.z),g.userData.scadCenter.cz=Math.round(g.position.y)),g.updateMatrixWorld(!0)}}}i.makeEmpty();for(const g of this.formMeshes.values())i.expandByObject(g)}const o=i.min.y<-.001?-i.min.y:0;if(Math.abs(o)>.001){for(const d of this.modelGroup.children)d.position.y+=o,d.userData&&(d.userData.initialPosition&&(d.userData.initialPosition.y+=o),d.userData.scadCenter&&(d.userData.scadCenter.cz=Math.round(d.position.y))),d.updateMatrixWorld(!0);i.min.y+=o,i.max.y+=o}const a=new A;return i.getSize(a),this.controls.target.set(0,a.y/2,0),this.fitToView(i),{facets:Math.round(n),dimensions:{x:Math.round(a.x),y:Math.round(a.z),z:Math.round(a.y)}}}loadStlBuffer(e){for(this.currentStlBuffer=e;this.modelGroup.children.length>0;){const l=this.modelGroup.children[0];this.modelGroup.remove(l),l.geometry&&l.geometry.dispose()}this.formMeshes.clear(),this.tinkerGizmo.detach();const t=this.stlLoader.parse(e);t.computeVertexNormals(),t.rotateX(-Math.PI/2),t.computeBoundingBox();const n=t.boundingBox,i=new A;n.getSize(i),this.currentMesh&&(this.scene.remove(this.currentMesh),this.currentMesh.geometry&&this.currentMesh.geometry.dispose(),this.currentMesh=null);const r=this.createCurrentMaterial();this.currentMesh=new ct(t,r);const o=-n.min.y;return this.currentMesh.position.y=o,n.min.y+=o,n.max.y+=o,this.scene.add(this.currentMesh),this.controls.target.set(0,i.y/2,0),this.fitToView(n),{facets:t.attributes.position.count/3,dimensions:{x:Math.round(i.x),y:Math.round(i.z),z:Math.round(i.y)}}}resize(e,t){if(!(!e||!t)&&(this.width=Math.floor(e),this.height=Math.floor(t),this.camera&&(this.camera.aspect=this.width/this.height,this.camera.updateProjectionMatrix()),this.renderer)){this.renderer.setSize(this.width,this.height);const n=this.renderer.domElement;n.style.width=`${this.width}px`,n.style.height=`${this.height}px`}}loadGlbUrl(e){return new Promise((t,n)=>{this.gltfLoader.load(e,i=>{for(this.currentMesh&&(this.scene.remove(this.currentMesh),this.currentMesh=null);this.modelGroup.children.length>0;){const _=this.modelGroup.children[0];this.modelGroup.remove(_),_.geometry&&_.geometry.dispose()}this.formMeshes.clear(),this.tinkerGizmo.detach();const r=i.scene||i.scenes[0];let o=0;r.traverse(_=>{_.isMesh&&(_.geometry&&_.geometry.attributes.position&&(o+=_.geometry.attributes.position.count/3),_.material&&(_.material.flatShading=!0,_.material.needsUpdate=!0))});const a=new pt().setFromObject(r),l=new A;a.getSize(l);const c=Math.max(l.x,l.y,l.z),u=c>0?60/c:1;r.scale.set(u,u,u);const d=new pt().setFromObject(r),f=new A;d.getSize(f);const g=new A;d.getCenter(g),r.position.x=-g.x,r.position.y=-d.min.y,r.position.z=-g.z,this.currentMesh=r,this.scene.add(this.currentMesh),this.controls.target.set(0,f.y/2,0),t({facets:Math.round(o),dimensions:{x:Math.round(f.x),y:Math.round(f.z),z:Math.round(f.y)}})},void 0,i=>n(i))})}createCurrentMaterial(e=""){const t=this.materialModes[this.currentMatIndex];let n=14273462,i=.45,r=.05;if(t==="poly_color"){const o=this.getRetroPartStyle(e);n=o.color,i=o.roughness,r=o.metalness}else t==="clay"?(n=14668739,i=.55,r=.02):t==="slate"?(n=8162209,i=.35,r=.2):t==="cyber_amber"?(n=16755200,i=.3,r=.4):t==="matrix_green"&&(n=65450,i=.25,r=.3);return new _s({color:n,roughness:i,metalness:r,wireframe:this.isWireframe,flatShading:!0})}getRetroPartStyle(e){const t=(e||"").toLowerCase().trim();if(/\b(eye|pupil)\b/.test(t))return{color:1315865,roughness:.2,metalness:.2};if(/\b(snout|nose|beak|nostril)\b/.test(t))return{color:4009001,roughness:.6,metalness:.05};if(/\b(ear|ears|horn|horns|antler|antlers)\b/.test(t))return{color:16032353,roughness:.5,metalness:.05};if(/\b(tire|wheel|wheels|tires|track|tracks)\b/.test(t))return{color:2236968,roughness:.8,metalness:.05};if(/\b(axle|strut|rod|shaft|pipe)\b/.test(t))return{color:10395294,roughness:.3,metalness:.6};if(/\b(head|skull)\b/.test(t))return{color:15320170,roughness:.45,metalness:.05};if(/\b(torso|body|chest|chassis)\b/.test(t))return{color:2792847,roughness:.45,metalness:.05};if(/\b(tail)\b/.test(t))return{color:16032353,roughness:.5,metalness:.05};if(/\b(leg|legs|arm|arms|paw|paws|foot|feet|hoof|hooves)\b/.test(t))return{color:14524766,roughness:.5,metalness:.05};if(/\b(wing|wings)\b/.test(t))return{color:4553629,roughness:.4,metalness:.1};if(/\b(neck)\b/.test(t))return{color:12348453,roughness:.5,metalness:.05};if(!e||e==="Whole Model"||e==="Part")return{color:14273462,roughness:.45,metalness:.05};const n=[2792847,15167313,16032353,15320170,4553629,6319160,2635288,13935475];let i=0;for(let o=0;o<t.length;o++)i=i*31+t.charCodeAt(o)|0;return{color:n[Math.abs(i)%n.length],roughness:.45,metalness:.05}}cycleMaterial(){var t;this.currentMatIndex=(this.currentMatIndex+1)%this.materialModes.length,this.currentMesh&&(this.currentMesh.material=this.createCurrentMaterial("Whole Model"));for(const n of this.formMeshes.values())n.material=this.createCurrentMaterial((t=n.userData)==null?void 0:t.formName);return this.materialModes[this.currentMatIndex].toUpperCase()}applyFormTextures(e,t=null){var r,o,a,l,c;if(!e||Object.keys(e).length===0)return[];const n=t&&t.length>0?new Set(t.map(h=>String(h).toLowerCase().trim())):null,i=[];for(const[h,u]of this.formMeshes.entries()){const d=(((r=u.userData)==null?void 0:r.formId)||h||"").toLowerCase().trim(),f=(((o=u.userData)==null?void 0:o.formName)||"").toLowerCase().trim();if(n&&!(n.has(d)||n.has(f)))continue;let g=e[(a=u.userData)==null?void 0:a.formName]||e[(l=u.userData)==null?void 0:l.formId]||e[f]||e[d];if(!g)for(const[m,p]of Object.entries(e)){const M=m.toLowerCase().trim();if(M===f||M===d||f.includes(M)||M.includes(f)){g=p;break}}if(!g)continue;i.push({mesh:u,material:u.material,aiTextureSpec:((c=u.userData)==null?void 0:c.aiTextureSpec)||null}),T0(u.geometry);const _=A0(g);u.material=_,u.userData.aiTextureSpec=g}return i}clearFormTextures(e=null){var n,i,r;const t=e&&e.length>0?new Set(e.map(o=>String(o).toLowerCase().trim())):null;for(const[o,a]of this.formMeshes.entries()){const l=(((n=a.userData)==null?void 0:n.formId)||o||"").toLowerCase().trim(),c=(((i=a.userData)==null?void 0:i.formName)||"").toLowerCase().trim();t&&!(t.has(l)||t.has(c))||(a.material=this.createCurrentMaterial((r=a.userData)==null?void 0:r.formName),delete a.userData.aiTextureSpec)}}toggleWireframe(){this.isWireframe=!this.isWireframe,this.currentMesh&&(this.currentMesh.material.wireframe=this.isWireframe);for(const e of this.formMeshes.values())e.material.wireframe=this.isWireframe;return this.isWireframe}toggleGrid(){return this.showGrid=!this.showGrid,this.gridHelper&&(this.gridHelper.visible=this.showGrid),this.showGrid}getModelBoundingBox(){const e=new pt;return this.modelGroup&&this.modelGroup.children.length>0?e.setFromObject(this.modelGroup):this.currentMesh&&e.setFromObject(this.currentMesh),e.isEmpty()&&e.set(new A(-25,0,-25),new A(25,50,25)),e}fitToView(e=null){if(!this.camera||!this.controls)return;const t=e||this.getModelBoundingBox(),n=t.getCenter(new A),i=t.getSize(new A),r=Math.max(i.x,i.y,i.z,10),o=dn.degToRad(this.camera.fov),a=Math.max(.1,this.width/this.height),l=2*Math.atan(Math.tan(o/2)*a),c=i.y/2/Math.tan(o/2),h=Math.max(i.x,i.z)/2/Math.tan(l/2);let u=Math.max(c,h,r*1.45)*1.35;u=Math.max(35,Math.min(u,500));const d=new A(1.1,1.05,1).normalize();this.controls.target.copy(n),this.camera.position.copy(n).addScaledVector(d,u),this.camera.updateProjectionMatrix(),this.controls.update()}setView(e){if(!this.camera||!this.controls)return;const t=this.getModelBoundingBox(),n=t.getCenter(new A),i=t.getSize(new A),r=Math.max(i.x,i.y,i.z,10),o=dn.degToRad(this.camera.fov),a=Math.max(.1,this.width/this.height),l=2*Math.atan(Math.tan(o/2)*a),c=i.y/2/Math.tan(o/2),h=Math.max(i.x,i.z)/2/Math.tan(l/2);let u=Math.max(c,h,r*1.45)*1.35;if(u=Math.max(35,Math.min(u,500)),this.controls.target.copy(n),e==="iso"||e==="reset"||e==="fit"){const d=new A(1.1,1.05,1).normalize();this.camera.position.copy(n).addScaledVector(d,u)}else e==="top"?this.camera.position.set(n.x,n.y+u*1.15,n.z+.001):e==="front"&&this.camera.position.set(n.x,n.y,n.z+u*1.15);this.camera.updateProjectionMatrix(),this.controls.update()}selectAllForms(){if(!this.isEditMode||this.formMeshes.size===0)return;this.selectedMeshes.clear();for(const t of this.formMeshes.values())this.selectedMeshes.add(t);const e=Array.from(this.selectedMeshes);this.tinkerGizmo.attach(e),this.onFormSelected&&this.onFormSelected(e[0],{name:"ALL FORMS",formId:"all",selectedCount:e.length})}scaleAllForms(e){if(this.formMeshes.size===0)return;const t=[];for(const n of this.formMeshes.values())t.push({mesh:n,startPos:n.position.clone(),startRot:n.rotation.clone(),startScale:n.scale.clone()}),n.position.multiplyScalar(e),n.scale.multiplyScalar(e);this.historyManager&&this.historyManager.push({execute:()=>{for(const n of t)n.mesh.position.copy(n.startPos).multiplyScalar(e),n.mesh.scale.copy(n.startScale).multiplyScalar(e);this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform())},undo:()=>{for(const n of t)n.mesh.position.copy(n.startPos),n.mesh.scale.copy(n.startScale);this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform())}}),this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform())}dropToWorkplane(e=!1){const t=e&&this.selectedMeshes&&this.selectedMeshes.size>0?Array.from(this.selectedMeshes):Array.from(this.formMeshes.values());if(t.length===0){if(this.currentMesh){const l=-new pt().setFromObject(this.currentMesh).min.y;Math.abs(l)>.001&&(this.currentMesh.position.y+=l)}return}const n=new pt;for(const a of t)n.expandByObject(a);const i=-n.min.y;if(Math.abs(i)<.001)return;const r=t.map(a=>({mesh:a,id:a.userData.formId,pos:a.position.clone(),rot:a.rotation.clone(),scale:a.scale.clone()}));for(const a of t)a.position.y+=i,a.userData&&a.userData.initialPosition&&(a.userData.initialPosition.y+=i),a.userData&&a.userData.scadCenter&&(a.userData.scadCenter.cz=Math.round(a.position.y)),a.updateMatrixWorld(!0);this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform());const o=t.map(a=>({id:a.userData.formId,pos:a.position.clone(),rot:a.rotation.clone(),scale:a.scale.clone()}));this.historyManager&&this.historyManager.push({execute:()=>{for(const a of o){const l=this.formMeshes.get(a.id);l&&(l.position.copy(a.pos),l.rotation.copy(a.rot),l.scale.copy(a.scale),l.userData&&l.userData.initialPosition&&l.userData.initialPosition.copy(a.pos),l.userData&&l.userData.scadCenter&&(l.userData.scadCenter.cz=Math.round(a.pos.y)))}this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform())},undo:()=>{for(const a of r){const l=this.formMeshes.get(a.id);l&&(l.position.copy(a.pos),l.rotation.copy(a.rot),l.scale.copy(a.scale),l.userData&&l.userData.initialPosition&&l.userData.initialPosition.copy(a.pos),l.userData&&l.userData.scadCenter&&(l.userData.scadCenter.cz=Math.round(a.pos.y)))}this.tinkerGizmo&&(this.tinkerGizmo.updateGizmoBounds(),this.tinkerGizmo.notifyTransform())}}),this.onFormTransformed&&this.onFormTransformed(t[0],"Dropped to workplane")}clearHistory(){this.historyManager&&this.historyManager.clear()}}class F0{constructor(e,t){this.container=e,this.onParamChange=t,this.currentParameters=[],this.currentValues={},this.debounceTimer=null}render(e=[],t={}){if(this.currentParameters=e,this.currentValues={...t},this.container.innerHTML="",!e||e.length===0){this.container.innerHTML='<div class="param-placeholder">No adjustable parameters for this model.</div>';return}e.forEach(n=>{const i=document.createElement("div");i.className="param-item";const r=this.currentValues[n.id]!==void 0?this.currentValues[n.id]:n.default;if(this.currentValues[n.id]=r,n.type==="range"){const o=n.min!==void 0?n.min:0,a=n.max!==void 0?n.max:100,l=n.step!==void 0?n.step:1;i.innerHTML=`
          <div class="param-label-row">
            <span class="param-label">${n.label||n.id}</span>
            <span id="badge-${n.id}" class="param-val-badge">${r}</span>
          </div>
          <input 
            type="range" 
            id="input-${n.id}" 
            class="pixel-slider"
            min="${o}" 
            max="${a}" 
            step="${l}" 
            value="${r}" 
          />
        `;const c=i.querySelector(`#input-${n.id}`),h=i.querySelector(`#badge-${n.id}`);c.addEventListener("input",u=>{const d=parseFloat(u.target.value);h.textContent=d,this.currentValues[n.id]=d,this.triggerChangeDebounced()}),c.addEventListener("change",u=>{const d=parseFloat(u.target.value);h.textContent=d,this.currentValues[n.id]=d,this.triggerChangeImmediate()})}else if(n.type==="select"){const a=(n.options||[]).map(c=>`
          <option value="${c}" ${c===r?"selected":""}>${c}</option>
        `).join("");i.innerHTML=`
          <div class="param-label-row">
            <span class="param-label">${n.label||n.id}</span>
          </div>
          <select id="input-${n.id}" class="param-select">
            ${a}
          </select>
        `,i.querySelector(`#input-${n.id}`).addEventListener("change",c=>{this.currentValues[n.id]=c.target.value,this.triggerChangeImmediate()})}this.container.appendChild(i)})}triggerChangeDebounced(){clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>{this.onParamChange&&this.onParamChange({...this.currentValues})},120)}triggerChangeImmediate(){clearTimeout(this.debounceTimer),this.onParamChange&&this.onParamChange({...this.currentValues})}getValues(){return{...this.currentValues}}resetToDefaults(){const e={};for(const t of this.currentParameters)e[t.id]=t.default!==void 0?t.default:t.min||0;this.render(this.currentParameters,e),this.triggerChangeImmediate()}}class B0{constructor(e,t={}){this.container=e,this.callbacks=t,this.selectedPartInfo=null,this.hasModel=!1}setHasModel(e){this.hasModel=e,this.render()}setForms(e=[]){this.forms=e,this.setHasModel(Array.isArray(e)?e.length>0:!!e)}updateSelection(e){this.selectedPartInfo=e,this.render()}render(){this.container.innerHTML="";const e=document.createElement("div");if(e.className="form-editor-container",!this.hasModel){e.innerHTML=`
        <div class="param-placeholder">
          No 3D model loaded.<br>
          Enter a prompt above and click <b>GENERATE</b>, or load the demo robot.
          <div style="margin-top: 12px;">
            <button id="btn-load-demo-robot" class="tab-btn" style="cursor: pointer; padding: 4px 10px;">
              LOAD DEMO ROBOT
            </button>
          </div>
        </div>
      `,this.container.appendChild(e);const u=e.querySelector("#btn-load-demo-robot");u&&u.addEventListener("click",()=>{window.dispatchEvent(new CustomEvent("pxl3d-load-demo",{detail:"robot_toy"}))});return}if(!this.selectedPartInfo)e.innerHTML=`
        <div class="form-selector-card" style="text-align: center; padding: 12px 8px;">
          <div class="form-selector-title" style="color: var(--text-accent); font-size: 10px; margin-bottom: 4px;">
            ✦ DIRECT 3D EDIT MODE ✦
          </div>
          <div style="font-size: 8.5px; color: var(--text-secondary); line-height: 1.4;">
            Click on any part of the 3D model to select it.
          </div>
        </div>

        <div class="form-group-section">
          <div class="form-group-title">
            <span>TINKERCAD CONTROLS</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 8.5px; padding: 2px 0;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px;">🖱️</span>
              <span><b>Drag Body:</b> Move form across ground</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; color: #00e5ff;">▲</span>
              <span><b>Drag Top Cone:</b> Raise / lower elevation</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; color: #00ffaa;">■</span>
              <span><b>Drag Corner Dots:</b> Resize and scale shape</span>
            </div>
          </div>
        </div>

        <div class="form-actions-row" style="margin-top: 6px;">
          <button id="btn-ai-texture-panel" class="form-action-btn" style="background: rgba(0, 255, 170, 0.12); border-color: var(--text-accent); color: var(--text-accent); font-weight: 700;" title="Generate realistic retro textures for the whole model">
            ✦ AI TEXTURE (ALL)
          </button>
        </div>

        <div class="form-actions-row" style="margin-top: 4px; gap: 4px;">
          <button id="btn-select-all" class="form-action-btn" title="Select all forms (Ctrl+A)">
            SELECT ALL
          </button>
          <button id="btn-fit-view" class="form-action-btn" title="Fit model to view">
            FIT VIEW
          </button>
        </div>
        <div class="form-actions-row" style="margin-top: 4px; gap: 4px;">
          <button id="btn-drop-workplane" class="form-action-btn" title="Drop model directly onto workplane (D)">
            DROP TO WORKPLANE
          </button>
        </div>
        <div class="form-actions-row" style="margin-top: 4px; gap: 4px;">
          <button id="btn-scale-down" class="form-action-btn" title="Scale whole model down by 10%">
            SCALE -10%
          </button>
          <button id="btn-scale-up" class="form-action-btn" title="Scale whole model up by 10%">
            SCALE +10%
          </button>
        </div>
        <div class="form-actions-row" style="margin-top: 4px;">
          <button id="btn-reset-all" class="form-action-btn" title="Reset all transforms">
            RESET ALL FORMS
          </button>
        </div>
      `;else{const u=this.selectedPartInfo,d=u.selectedCount||1,f=d>1?`SELECTED FORMS (${d})`:"SELECTED FORM",g=d>1?`${d} OBJECTS SELECTED`:u.name,_=d>1?`✦ AI TEXTURE (${d} SELECTED)`:"✦ AI TEXTURE (SELECTED)";e.innerHTML=`
        <div class="form-selector-card">
          <div class="form-selector-header">
            <span class="form-selector-title" style="color: var(--text-accent);">${f}</span>
            <span class="badge badge-success" style="font-size: 8px;">ACTIVE</span>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: var(--text-primary); margin-top: 2px; text-transform: uppercase;">
            ${g}
          </div>
        </div>

        <div class="form-group-section">
          <div class="form-group-title">
            <span>DIMENSIONS & ORIENTATION</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 8.5px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Width (X):</span>
              <span><b>${u.dx||0} mm</b></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Depth (Y):</span>
              <span><b>${u.dy||0} mm</b></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Height (Z):</span>
              <span><b>${u.dz||0} mm</b></span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed var(--border-dim); padding-top: 3px; margin-top: 2px;">
              <span style="color: var(--text-secondary);">Elevation:</span>
              <span style="color: #00e5ff;"><b>${u.elevation!==void 0?u.elevation:0} mm</b></span>
            </div>
          </div>
        </div>

        <div class="form-actions-row" style="margin-top: 6px;">
          <button id="btn-ai-texture-panel" class="form-action-btn" style="background: rgba(0, 255, 170, 0.12); border-color: var(--text-accent); color: var(--text-accent); font-weight: 700;" title="Generate realistic retro textures for selected objects">
            ${_}
          </button>
        </div>

        <div class="form-group-section">
          <div class="form-group-title">
            <span>TINKERCAD CONTROLS</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 8.5px; padding: 2px 0;">
            <div>🖱️ <b>Drag Body:</b> Move across ground</div>
            <div>▲ <b>Top Cone:</b> Raise / lower elevation</div>
            <div>■ <b>Corner Dots:</b> Scale (anchored to opposite corner)</div>
            <div>🔄 <b>Curved Arcs:</b> Rotate (hold Shift to snap)</div>
            <div>⇧ <b>Shift+Click:</b> Multi-select objects</div>
            <div>⌨️ <b>D:</b> Drop selection to workplane</div>
            <div>⌨️ <b>Ctrl+A:</b> Select all parts to scale together</div>
            <div>⌨️ <b>Ctrl+Z / Ctrl+Y:</b> Undo / Redo</div>
            <div>⌨️ <b>Ctrl+C / Ctrl+V:</b> Copy / Paste</div>
            <div>⌨️ <b>Ctrl+X / Del:</b> Cut / Delete</div>
          </div>
        </div>

        <div class="form-actions-row" style="margin-top: 4px; gap: 4px;">
          <button id="btn-reset-part" class="form-action-btn" title="Reset this part to initial position">
            RESET PART
          </button>
          <button id="btn-deselect-part" class="form-action-btn" title="Deselect this part">
            DESELECT
          </button>
        </div>

        <div class="form-actions-row" style="margin-top: 4px; gap: 4px;">
          <button id="btn-select-all" class="form-action-btn" title="Select all forms (Ctrl+A)">
            SELECT ALL
          </button>
          <button id="btn-fit-view" class="form-action-btn" title="Fit model to view">
            FIT VIEW
          </button>
        </div>

        <div class="form-actions-row" style="margin-top: 4px; gap: 4px;">
          <button id="btn-drop-workplane" class="form-action-btn" title="Drop selection directly onto workplane (D)">
            DROP TO WORKPLANE
          </button>
        </div>

        <div class="form-actions-row" style="margin-top: 4px; gap: 4px;">
          <button id="btn-scale-down" class="form-action-btn" title="Scale whole model down by 10%">
            SCALE -10%
          </button>
          <button id="btn-scale-up" class="form-action-btn" title="Scale whole model up by 10%">
            SCALE +10%
          </button>
        </div>

        <div class="form-actions-row" style="margin-top: 4px;">
          <button id="btn-reset-all" class="form-action-btn" title="Reset all transforms">
            RESET ALL FORMS
          </button>
        </div>
      `}this.container.appendChild(e);const t=e.querySelector("#btn-ai-texture-panel");t&&t.addEventListener("click",()=>{this.callbacks.onAiTexture&&this.callbacks.onAiTexture()});const n=e.querySelector("#btn-reset-part");n&&n.addEventListener("click",()=>{this.callbacks.onResetPart&&this.callbacks.onResetPart()});const i=e.querySelector("#btn-deselect-part");i&&i.addEventListener("click",()=>{this.callbacks.onDeselect&&this.callbacks.onDeselect()});const r=e.querySelector("#btn-reset-all");r&&r.addEventListener("click",()=>{this.callbacks.onResetAll&&this.callbacks.onResetAll()});const o=e.querySelector("#btn-select-all");o&&o.addEventListener("click",()=>{this.callbacks.onSelectAll&&this.callbacks.onSelectAll()});const a=e.querySelector("#btn-fit-view");a&&a.addEventListener("click",()=>{this.callbacks.onFitToView&&this.callbacks.onFitToView()});const l=e.querySelector("#btn-drop-workplane");l&&l.addEventListener("click",()=>{this.callbacks.onDropToWorkplane&&this.callbacks.onDropToWorkplane()});const c=e.querySelector("#btn-scale-down");c&&c.addEventListener("click",()=>{this.callbacks.onScaleAll&&this.callbacks.onScaleAll(.9)});const h=e.querySelector("#btn-scale-up");h&&h.addEventListener("click",()=>{this.callbacks.onScaleAll&&this.callbacks.onScaleAll(1.1)})}}const ea="pxl3d_groq_api_key",nh="pxl3d_groq_model",ta="pxl3d_proxy_url",na="pxl3d_gemini_api_key",cr="pxl3d_gemini_model",ih="pxl3d_parametric_provider",z0="https://pxl3d-proxy.gundur.workers.dev/",k0="openai/gpt-oss-120b",G0="gemini-3.5-flash-lite";function ys(){return localStorage.getItem(ih)||"gemini"}function H0(s){localStorage.setItem(ih,s)}function Ms(){return localStorage.getItem(na)||""}function fc(s){s?localStorage.setItem(na,s.trim()):localStorage.removeItem(na)}function Mr(){let s=localStorage.getItem(cr)||G0;return(!s||s==="gemini-2.0-flash"||s==="gemini-2.5-flash"||s==="gemini-1.5-flash"||s==="gemini-3.6-flash"||s==="gemini-2.0-flash-lite"||s==="gemini-1.5-flash-8b")&&(s="gemini-3.5-flash-lite",localStorage.setItem(cr,s)),s}function V0(s){localStorage.setItem(cr,s)}function Vi(){return localStorage.getItem(ta)||z0}function pc(s){s?localStorage.setItem(ta,s.trim()):localStorage.removeItem(ta)}function Wi(){return localStorage.getItem(ea)||""}function ia(s){s?localStorage.setItem(ea,s.trim()):localStorage.removeItem(ea)}function vr(){return localStorage.getItem(nh)||k0}function W0(s){localStorage.setItem(nh,s)}const wn=`You are PXL3D, an expert 3D parametric modeler specializing in stylized RETRO LOW-POLY 3D models (classic PS1, N64, and modern low-poly game art aesthetic).

MANDATORY UNIVERSAL STYLE RULE:
ALL models generated by you MUST be stylized, charming, RETRO LOW-POLY 3D models with expressive silhouettes.
DO NOT BUILD MODELS OUT OF ONLY RAW CUBES! Models made of only raw axis-aligned boxes look crude and childish. You MUST utilize the FULL diverse palette of OpenSCAD geometric primitives and CSG techniques.

RICH GEOMETRIC PALETTE (USE ALL OF THESE):
1. Tapered Cylinders & Cones:
   - \`cylinder(h, r1, r2, center=...)\` where r1 != r2 to create tapered forms:
     - Muscular animal limbs (thick thigh r1 tapering down to ankle r2).
     - Stepped/tapered weapon barrels, conical muzzles, rifle suppressors.
     - Tapered animal necks, snouts, horns, and tails.
     - Wheels, gears, pulleys, and round handles.
2. Low-Poly Spheres & Domes:
   - \`sphere(r, $fn=...)\` for rounded heads, organic skull caps, shoulder joints, eyes, and pommels.
3. Lofts with hull():
   - \`hull() { ... }\` is the most powerful tool for stylized low-poly forms!
     - Hull two offset spheres of different radii to create an organic, muscular neck or torso.
     - Hull a cube and a cylinder to create a sleek aerodynamic hood, tapered gun grip, or aircraft fuselage.
4. Prisms, Pyramids & Wedges:
   - Use low \`$fn\` on cylinders:
     - \`$fn=3\` creates triangular prisms and wedge slopes (ramps, arrowheads, roof slopes, teeth).
     - \`$fn=4\` creates square pyramids or 45-degree faceted diamond shapes.
     - \`$fn=6\` creates clean hexagonal prisms (bolts, sci-fi panels, faceted grips).
     - \`$fn=8\` creates faceted, chiseled low-poly surfaces.
5. Boolean Subtractions (difference()):
   - Carve out hollow trigger guard loops, gun bore holes, cockpit windshield insets, wheel wells, and panel grooves.

ANATOMY & ARTISTIC QUALITY GUIDELINES:
- MANDATORY HIERARCHICAL SKELETON (NEVER USE FLOATING/ARBITRARY NUMBERS!):
  All coordinates MUST be computed relative to the Primary Parent Anchor (e.g. Torso for animals/humans, Receiver for firearms, Chassis for vehicles).

  1. HUMANOIDS & BIPEDS (e.g. Human, Knight, Soldier, Robot, Wizard, Character, Warrior, Alien):
     - Pelvis & Torso sits on top of legs at Z = leg_h. Chest extends upward:
       pelvis_z = leg_h;
       chest_z = pelvis_z + pelvis_h;
       // Torso chest hull:
       translate([0, 0, chest_z + chest_h*0.5])
         hull() {
           translate([0, 0,  chest_h*0.3]) sphere(r = chest_w*0.5);
           translate([0, 0, -chest_h*0.3]) sphere(r = chest_w*0.4);
         }
     - 2 Legs start at ground Z=0 and penetrate 3mm UP INTO pelvis (NEVER LEAVE A GAP!):
       translate([ (pelvis_w*0.25), 0, 0]) cylinder(h = leg_h + 3, r1 = foot_r, r2 = thigh_r);
       translate([-(pelvis_w*0.25), 0, 0]) cylinder(h = leg_h + 3, r1 = foot_r, r2 = thigh_r);
     - Shoulders & Arms (ABSOLUTELY NO FLOATING ARMS):
       // Shoulder spheres MUST be embedded INSIDE the upper chest volume:
       shoulder_z = chest_z + chest_h * 0.75;
       shoulder_x = chest_w * 0.45;
       // Left Arm: hull from embedded shoulder to hand sphere (100% connected, impossible to float):
       hull() {
         translate([ shoulder_x, 0, shoulder_z]) sphere(r = shoulder_r);
         translate([ shoulder_x + 2, 0, shoulder_z - arm_l]) sphere(r = hand_r);
       }
       // Right Arm: hull from embedded shoulder to hand sphere:
       hull() {
         translate([-shoulder_x, 0, shoulder_z]) sphere(r = shoulder_r);
         translate([-shoulder_x - 2, 0, shoulder_z - arm_l]) sphere(r = hand_r);
       }
     - Neck & Head:
       neck_z = chest_z + chest_h - 1; // 1mm inside chest top
       translate([0, 0, neck_z]) cylinder(h = neck_h + 2, r = neck_r);
       translate([0, 0, neck_z + neck_h + head_r]) sphere(r = head_r);

  2. ANIMALS & QUADRUPEDS (e.g. Horse, Dog, Cat, Dragon, Wolf, Creature):
     - Parent Body/Torso sits on top of legs at Z = leg_h:
       body_z = leg_h;
       translate([0, 0, body_z + body_h*0.5])
         hull() {
           translate([ body_l*0.3, 0, 0]) sphere(r = body_w*0.5);
           translate([-body_l*0.3, 0, 0]) sphere(r = body_w*0.45);
         }
     - 4 Legs touch ground at Z=0 and penetrate deep (body_h*0.35) into torso underside:
       // NEVER LEAVE A GAP! The top of the leg must reach inside the torso volume:
       translate([ body_l*0.3,  body_w*0.25, 0]) cylinder(h = leg_h + body_h*0.35, r1 = hoof_r, r2 = thigh_r);
       translate([-body_l*0.3,  body_w*0.25, 0]) cylinder(h = leg_h + body_h*0.35, r1 = hoof_r, r2 = thigh_r);
       translate([ body_l*0.3, -body_w*0.25, 0]) cylinder(h = leg_h + body_h*0.35, r1 = hoof_r, r2 = thigh_r);
       translate([-body_l*0.3, -body_w*0.25, 0]) cylinder(h = leg_h + body_h*0.35, r1 = hoof_r, r2 = thigh_r);
     - Neck begins at the FRONT of the torso (+X) and reaches upward/forward:
       neck_base_x = body_l * 0.3; neck_base_z = body_z + body_h * 0.6;
       head_x = neck_base_x + neck_l * 0.6; head_z = neck_base_z + neck_l * 0.8;
       hull() {
         translate([neck_base_x, 0, neck_base_z]) sphere(r = neck_r);
         translate([head_x, 0, head_z]) sphere(r = head_r * 0.7);
       }
     - Head is attached directly to head_x, head_z (STRICTLY IN FRONT at +X, NEVER BEHIND):
       // [FORM: Head]
       translate([head_x, 0, head_z]) sphere(r = head_r);

       // [FORM: Snout]
       // Snout extends forward in +X from head:
       translate([head_x + head_r*0.4, 0, head_z - head_r*0.2])
         rotate([0, 90, 0]) cylinder(h = snout_l, r1 = head_r*0.5, r2 = head_r*0.35);

       // ZERO FLOATING EARS: Base of ear MUST penetrate deep into head skull (Z starts at head_z, not above):
       // [FORM: Left Ear]
       translate([head_x - head_r*0.1,  head_r*0.35, head_z])
         rotate([0, -10, 15]) cylinder(h = ear_h + head_r*0.5, r1 = head_r*0.25, r2 = 0);

       // [FORM: Right Ear]
       translate([head_x - head_r*0.1, -head_r*0.35, head_z])
         rotate([0, -10, -15]) cylinder(h = ear_h + head_r*0.5, r1 = head_r*0.25, r2 = 0);
     - Tail starts at the REAR (-X):
       // [FORM: Tail]
       translate([-body_l*0.45, 0, body_z + body_h*0.7])
         rotate([0, -45, 0]) cylinder(h = tail_l, r1 = 3, r2 = 1);

  3. WEAPONS & FIREARMS (e.g. Shotgun, Rifle, Pistol):
     - Central Receiver is at [0, 0, grip_h + 5].
     - Stock extends backward (-X): translate([-stock_l, 0, 0]) ...
     - Grip extends downward to ground (-Z): translate([0, 0, -grip_h]) ...
     - Barrel extends forward (+X): translate([0, 0, 0]) rotate([0, 90, 0]) cylinder(...)
     - Trigger guard is looped directly underneath the receiver.

  4. VEHICLES:
     - Chassis sits at Z = wheel_r.
     - 4 Wheels touch Z=0 at [±chassis_l*0.35, ±chassis_w*0.5, wheel_r].

CRITICAL ANATOMICAL ELEVATION & FACIAL ATTACHMENT MANDATE:
- CRANIAL & FACIAL APPENDAGES (Snout, Nose, Eyes, Ears, Horns, Antlers, Beak, Visor, Mouth, Whiskers) ARE PHYSICALLY ATTACHED TO THE HEAD.
- THEY MUST NEVER BE PLACED AT GROUND LEVEL (Z = 0)!
- IN OPENSCAD, ANY PRIMITIVE WITHOUT EXPLICIT TRANSLATION DEFAULTS TO [0, 0, 0] ON THE FLOOR. NEVER EMIT AN UNTRANSLATED SNOUT OR EAR!
- If the Head is at [head_x, 0, head_z], EVERY FACIAL PART MUST BE POSITIONED RELATIVE TO [head_x, 0, head_z]:
  * Snout MUST be: translate([head_x + head_r*0.4, 0, head_z - head_r*0.2]) rotate([0, 90, 0]) cylinder(...);
  * Left Ear MUST be: translate([head_x - head_r*0.1, head_r*0.35, head_z + head_r*0.4]) ...
  * Right Ear MUST be: translate([head_x - head_r*0.1, -head_r*0.35, head_z + head_r*0.4]) ...
- THE ONLY PARTS PERMITTED TO TOUCH GROUND LEVEL Z = 0 ARE FEET, PAWS, HOOVES, TIRES, AND BASE PEDESTALS!

CRITICAL WORKPLANE & GROUNDING MANDATE (NEVER PENETRATE BASE PLANE):
- THE BASE PLANE / WORKPLANE IS AT Z = 0.
- ALL MODELS MUST BE BUILT STRICTLY ON TOP OF THE WORKPLANE (Z >= 0).
- NO GEOMETRY MAY EVER PENETRATE OR EXTEND BELOW THE WORKPLANE (ABSOLUTELY NO Z < 0)!
- THE LOWEST CONTACT POINT OF THE ENTIRE MODEL (FEET, WHEELS, TRACKS, BASE PEDESTAL) MUST SIT AT Z = 0.
- PREVENT COMMON NEGATIVE-Z OPENSCAD BUGS:
  * sphere(r): In OpenSCAD, sphere(r) is centered at origin [0,0,0], so its bottom is at Z = -r! To place a sphere on the workplane, you MUST lift it by its radius: translate([x, y, r]) sphere(r).
  * cube([w, d, h], center=true): If center=true, Z ranges from -h/2 to +h/2 (half sinks below workplane)! To place it on the workplane, lift it by h/2: translate([x, y, h/2]) cube([w, d, h], center=true), or use center=false with translate([-w/2, -d/2, 0]) cube([w, d, h]).
  * cylinder(h, r, center=true): If center=true, Z ranges from -h/2 to +h/2! To place it on the workplane, lift it by h/2: translate([x, y, h/2]) cylinder(h, r, center=true), or use center=false.
  * Humanoid/Robot Legs: Legs MUST start at ground Z = 0: translate([±leg_x, 0, 0]) cylinder(h = leg_h + 3, r = leg_r, center = false);
  * Quadruped Legs: 4 legs touch ground at Z = 0 and extend upward into torso.
  * Vehicle Wheels: Wheels must touch ground at Z = 0: wheel centers are at Z = wheel_r (never at Z = 0!).
- Sits squarely on the ground plane at Z=0 (no geometry below Z=0).
- Centered at origin (X=0, Y=0).
- Weapons/Tools must point along the horizontal axis (X or Y), NOT vertically into the ceiling.
- STANDARD SIZING & VIEWPORT FIT:
  * Design all models to have a standard build size of 50mm to 70mm in their largest dimension (e.g., characters height ~60-70mm, vehicles length ~60-70mm, handheld items length ~50-60mm).
  * Ensure default parameter values produce a model that fits comfortably within this ~60mm envelope so all generated models share a consistent real-world scale and fit the starting view cleanly.

MANDATORY FORM COMPONENT MARKERS (FOR INTERACTIVE 3D EDITING):
- Inside the main model() module, you MUST separate and precede each distinct anatomical/mechanical part with a comment line formatted as:
  // [FORM: Part Name]
- ALL OBJECTS AND APPENDAGES MUST BE SEPARATE EDITABLE FORMS!
- NEVER group ears, snout, horns, or appendages into the head or torso form!
- Examples:
  // [FORM: Torso]
  hull() { ... }

  // [FORM: Neck]
  hull() { ... }

  // [FORM: Head]
  translate([head_x, 0, head_z]) sphere(r = head_r);

  // [FORM: Snout]
  translate([head_x + head_r*0.4, 0, head_z - head_r*0.2]) rotate([0, 90, 0]) cylinder(...);

  // [FORM: Left Ear]
  translate([head_x - head_r*0.1, head_r*0.35, head_z]) cylinder(...);

  // [FORM: Right Ear]
  translate([head_x - head_r*0.1, -head_r*0.35, head_z]) cylinder(...);

  // [FORM: Left Arm]
  hull() { ... }

  // [FORM: Right Arm]
  hull() { ... }

  // [FORM: Legs]
  union() {
    translate([pelvis_w*0.25, 0, 0]) cylinder(...);
    translate([-pelvis_w*0.25, 0, 0]) cylinder(...);
  }
- Each form must be a coherent, discrete anatomical or functional sub-assembly. This allows the user to select and individually move, rotate, and scale EACH part in the interactive 3D editor!

CRITICAL OPENSCAD VARIABLE RULES:
- Declare all customizable parameters at the top:
  param_a = {{param_a}};
  param_b = {{param_b}};
- NEVER use an undeclared variable.
- NEVER assign geometry to variables (NEVER write 'a = cube();'). Use direct CSG inside union().

JSON OUTPUT SCHEMA ONLY:
Respond ONLY with valid JSON matching:
{
  "parameters": [
    { "id": "length", "label": "Total Length", "type": "range", "min": 30, "max": 120, "step": 5, "default": 75 },
    { "id": "width", "label": "Width", "type": "range", "min": 10, "max": 40, "step": 2, "default": 20 }
  ],
  "scad_template": "$fn = {{fn_res}};\\nlength = {{length}};\\nwidth = {{width}};\\nmodule model() {\\n  union() {\\n    ...\\n  }\\n}\\nmodel();"
}`;function X0(s){const e=s.toLowerCase();return/(human|person|man|woman|knight|soldier|robot|wizard|warrior|character|alien|figure|boy|girl|statue|guard|ninja|samurai|astronaut)/i.test(e)?`PROMPT ARCHETYPE: HUMANOID / BIPED CHARACTER
MANDATORY ANATOMICAL RULES:
- INDIVIDUAL EDITABLE FORMS: Separate each part with // [FORM: Torso], // [FORM: Head], // [FORM: Left Arm], // [FORM: Right Arm], // [FORM: Legs], etc.
- 2 LEGS: Extend from ground Z=0 and penetrate 3mm up into pelvis (Z = leg_h + 3). ZERO GAP UNDER PELVIS!
- TORSO & CHEST: Sits on pelvis.
- 2 ARMS (ABSOLUTELY NO FLOATING ARMS):
  * Define shoulder positions inside chest: shoulder_z = torso_z + chest_h*0.75, shoulder_x = chest_w*0.45.
  * Connect shoulder directly to hand using hull() { translate([shoulder_x, 0, shoulder_z]) sphere(r=shoulder_r); translate([shoulder_x + 2, 0, shoulder_z - arm_l]) sphere(r=hand_r); }.
  * The arms MUST be physically fused to the shoulders and chest!
- NECK & HEAD: Neck embedded into top of chest, head mounted directly on neck.
- VISUAL IDENTITY: Capture distinctive iconic visual details for "${s}" (e.g. helmet/visor, armor shoulders, staff/sword/tool, or belt).`:/(dog|horse|cat|animal|wolf|deer|cow|pig|bear|lion|tiger|dragon|creature|beast|quadruped|elephant|hound|puppy|pony)/i.test(e)?`PROMPT ARCHETYPE: QUADRUPED / ANIMAL
MANDATORY ANATOMICAL RULES:
- INDIVIDUAL EDITABLE FORMS: Every single body part and appendage MUST have its own separate // [FORM: ...] marker:
  * // [FORM: Torso]
  * // [FORM: Neck]
  * // [FORM: Head]
  * // [FORM: Snout]
  * // [FORM: Left Ear]
  * // [FORM: Right Ear]
  * // [FORM: Front Left Leg], // [FORM: Front Right Leg], // [FORM: Back Left Leg], // [FORM: Back Right Leg]
  * // [FORM: Tail]
- ZERO FLOATING EARS: Base of each ear cylinder MUST start at Z = head_z (deep inside the head skull) and penetrate at least 5mm into the head volume. Under NO circumstances should ears float above the head!
- 4 LEGS: Touch ground at Z=0 and penetrate deep into torso underside (h = leg_h + body_h*0.35). ZERO GAP underneath belly!
- HORIZONTAL TORSO: Elongated along X axis, spanning from -body_l*0.5 to +body_l*0.5.
- FORWARD NECK: Extends up and forward (+X) from torso front.
- HEAD & SNOUT: Head mounted on neck tip at +X (in FRONT). Snout cylinder extends forward along +X. 2 separate ears penetrating head.
- TAIL: Extends from rear (-X) of torso.
- VISUAL IDENTITY: Capture the exact recognizable silhouette and proportions of a "${s}".`:/(gun|shotgun|rifle|pistol|weapon|sword|blade|axe|dagger|hammer|blaster|cannon|revolver)/i.test(e)?`PROMPT ARCHETYPE: WEAPON / TOOL
MANDATORY STRUCTURAL RULES:
- WORKPLANE GROUNDING: Entire weapon/tool must sit strictly on top of workplane (Z >= 0). Lowest point (bottom of grip or pommel) touches Z = 0.
- RECEIVER / CORE: Central anchor elevated above grip at Z = grip_h.
- BARREL / BLADE: Extends horizontally forward along +X with hollow bore or beveled edge.
- STOCK / POMMEL: Extends backward along -X.
- GRIP / HANDLE: Sits on workplane at Z=0 and reaches upward to receiver at Z = grip_h.
- TRIGGER & GUARD: Looped underneath receiver using difference().
- Must point horizontally along X axis (never pointing straight up into ceiling).`:/(car|truck|vehicle|plane|airplane|spaceship|ship|boat|craft|speeder|tank|hovercraft)/i.test(e)?`PROMPT ARCHETYPE: VEHICLE / CRAFT
MANDATORY STRUCTURAL RULES:
- WORKPLANE GROUNDING: Wheels / treads / bottom hull must sit strictly on top of workplane (Z >= 0). Wheel centers at Z = wheel_r so tires touch workplane at Z = 0.
- CHASSIS: Low-profile main body spanning X sitting at Z = wheel_r.
- COCKPIT / CABIN: Centered or stepped with beveled windshield (hull of cabin and windshield).
- WHEELS / THRUSTERS: Grounded at Z=0 or side mounted.
- AERODYNAMIC NOSE: Tapered at front (+X), spoiler/exhaust at rear (-X).`:`TARGET OBJECT: "${s}"
MANDATORY STRUCTURAL RULES:
- WORKPLANE GROUNDING: Must sit strictly on top of the workplane (Z >= 0). Lowest contact point touches Z = 0 with zero geometry below Z = 0.
- Identify key functional and recognizable features of "${s}".
- Ensure every part overlaps adjacent parts by at least 2mm inside union() { ... }.
- ZERO FLOATING PARTS: Every child part must be physically anchored into the parent body.`}async function Y0(s,e,t,n){var a,l,c,h,u,d,f,g,_;n(`CONNECTING TO GEMINI (${e})...`);try{const m=await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`},body:JSON.stringify({model:e,messages:[{role:"system",content:wn},{role:"user",content:t}],response_format:{type:"json_object"},temperature:.2})});if(m.ok){const M=(c=(l=(a=(await m.json()).choices)==null?void 0:a[0])==null?void 0:l.message)==null?void 0:c.content;if(M)return M}}catch(m){console.warn("Gemini OpenAI endpoint failed, trying native endpoint:",m)}n(`CALLING GEMINI NATIVE (${e})...`);const i=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${s}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system_instruction:{parts:[{text:wn}]},contents:[{parts:[{text:t}]}],generationConfig:{response_mime_type:"application/json",temperature:.2}})});if(!i.ok){let m=i.statusText;try{const p=await i.json();(h=p.error)!=null&&h.message&&(m=p.error.message)}catch{}throw new Error(`Google Gemini Error (${i.status}): ${m}`)}const o=(_=(g=(f=(d=(u=(await i.json()).candidates)==null?void 0:u[0])==null?void 0:d.content)==null?void 0:f.parts)==null?void 0:g[0])==null?void 0:_.text;if(!o)throw new Error("Received empty response from Gemini API");return o}async function $0(s,e=()=>{}){var d,f,g,_,m,p,M,y,x,C,T,R;const t=ys(),n=Ms(),i=Mr(),r=Wi(),o=Vi(),a=vr(),l=X0(s),c=`Design an impressive, highly recognizable stylized RETRO LOW-POLY 3D model for: "${s}".

${l}

CRITICAL UNIVERSAL INTEGRITY RULES:
- High visual fidelity: The model MUST immediately and unmistakably resemble "${s}" with its iconic features, natural silhouette, and correct proportions.
- DO NOT USE ONLY RAW CUBES! Use tapered cylinders, faceted spheres, and hull() lofts.
- STRICT PARENT-CHILD EMBEDDING: Every single limb, arm, hand, leg, horn, or accessory MUST be physically embedded at least 2mm to 5mm inside its parent body. ZERO FLOATING PARTS EVER!
- Arms and legs must never float in mid-air; use hull() between joint spheres or embedded cylinders.
- All parts overlap inside union() { ... } into a single watertight solid.
- Grounded at Z=0 (no geometry below Z=0), centered at origin (X=0, Y=0).
- Provide 3 to 6 intuitive, high-impact parametric sliders.`;let h;if(t==="gemini"&&n)h=await Y0(n,i,c,e);else if(t==="gemini"&&o){e(`CONNECTING TO PROXY (${i.toUpperCase()})...`);const P=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"gemini",model:i,prompt:c,systemPrompt:wn,messages:[{role:"system",content:wn},{role:"user",content:c}]})});if(!P.ok){let v=P.statusText;try{const I=await P.json();(d=I.error)!=null&&d.message&&(v=I.error.message)}catch{}throw new Error(`AI Gateway Error (${P.status}): ${v}`)}const S=await P.json();if(S.error)throw new Error(S.error.message||JSON.stringify(S.error));h=(_=(g=(f=S.choices)==null?void 0:f[0])==null?void 0:g.message)==null?void 0:_.content}else if(r){e(`CONNECTING TO GROQ (${a})...`);let P;try{P=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify({model:a,messages:[{role:"system",content:wn},{role:"user",content:c}],response_format:{type:"json_object"},temperature:.25,max_tokens:3500})})}catch(v){console.warn("Direct Groq call failed, attempting proxy fallback:",v)}if((!P||P.status===401||P.status===403)&&o&&(console.warn("Personal API key was rejected (401/403). Falling back to Cloudflare proxy..."),e("KEY EXPIRED - USING SECURE PROXY..."),ia(""),P=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"groq",prompt:c,model:a,systemPrompt:wn,messages:[{role:"system",content:wn},{role:"user",content:c}]})})),!P.ok){let v=P.statusText;try{const I=await P.json();(m=I.error)!=null&&m.message&&(v=I.error.message)}catch{}throw new Error(`AI Gateway Error (${P.status}): ${v}`)}const S=await P.json();if(S.error)throw new Error(S.error.message||JSON.stringify(S.error));h=(y=(M=(p=S.choices)==null?void 0:p[0])==null?void 0:M.message)==null?void 0:y.content}else{e("CONNECTING VIA SECURE PROXY...");const P=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"groq",prompt:c,model:a,systemPrompt:wn,messages:[{role:"system",content:wn},{role:"user",content:c}]})});if(!P.ok){let v=P.statusText;try{const I=await P.json();(x=I.error)!=null&&x.message&&(v=I.error.message)}catch{}throw new Error(`AI Gateway Error (${P.status}): ${v}`)}const S=await P.json();if(S.error)throw new Error(S.error.message||JSON.stringify(S.error));h=(R=(T=(C=S.choices)==null?void 0:C[0])==null?void 0:T.message)==null?void 0:R.content}if(!h)throw new Error("Received empty response from AI model");let u;try{u=JSON.parse(h)}catch(P){const S=h.match(/```(?:json)?\s*([\s\S]*?)\s*```/);if(S)u=JSON.parse(S[1]);else throw new Error(`Failed to parse AI JSON response: ${P.message}`)}if(!u.scad_template||typeof u.scad_template!="string")throw new Error('AI response missing "scad_template" string');return u.scad_template.includes("\\n")&&!u.scad_template.includes(`
`)&&(u.scad_template=u.scad_template.replace(/\\n/g,`
`)),Array.isArray(u.parameters)||(u.parameters=[]),u.scad_template.includes("$fn")||(u.scad_template=`$fn = {{fn_res}};
`+u.scad_template),u}async function j0({formName:s,currentPartCode:e,fullScadTemplate:t,userPrompt:n,centerPoint:i={cx:0,cy:0,cz:0},onStatusUpdate:r=()=>{}}){ys(),Ms(),Mr(),Wi(),Vi(),vr();const o=Number(i==null?void 0:i.cx)||0,a=Number(i==null?void 0:i.cy)||0,l=Number(i==null?void 0:i.cz)||0,c=`You are PXL3D, an expert retro low-poly 3D parametric OpenSCAD modeler.
Your task is to modify the 3D model according to the user's prompt targeting part "${s}".
The user may want to modify this part, or ADD NEW SEPARATE COMPONENTS/LIMBS (e.g. hands, ears, wings, weapons) attached to this part.
EVERY new distinct item requested MUST be output as its own separate editable form preceded by "// [FORM: Part Name]".
You must return valid JSON containing the replacement OpenSCAD CSG code.`,h=`We are editing part "${s}" in an existing OpenSCAD model.

CURRENT CODE FOR THIS PART:
\`\`\`openscad
${e||"// (empty)"}
\`\`\`

PART GEOMETRIC CENTER POINT:
[X = ${o}, Y = ${a}, Z = ${l}]

FULL MODEL TEMPLATE FOR CONTEXT (VARIABLES & SKELETON):
\`\`\`openscad
${(t||"").slice(0,1500)}
\`\`\`

USER REQUEST (CLICKED ON "${s}"):
"${n}"

RULES FOR THE REPLACEMENT CSG CODE:
1. NEW ITEMS & APPENDAGES CREATION RULE (CRITICAL FOR INDIVIDUAL EDITABILITY):
   - If the user asks to ADD new components, limbs, accessories, or appendages (e.g. "I need hands", "add two hands", "give it a hat", "add wings", "add a sword"):
     * EVERY NEW ITEM MUST BE A SEPARATE EDITABLE FORM WITH ITS OWN "// [FORM: Name]" HEADER!
     * NEVER merge new items into the "${s}" body!
     * IF THE USER ASKS FOR TWO ITEMS (e.g. "two hands", "hands", "ears", "horns", "wings", "legs"), YOU MUST CREATE TWO SEPARATE FORMS:
       // [FORM: Left Hand]
       ... left hand CSG ...

       // [FORM: Right Hand]
       ... right hand CSG ...
     * Each hand, ear, horn, or wing MUST be its own distinct form so the user can select, move, and edit them individually!
     * You should also include the parent part "${s}":
       // [FORM: ${s}]
       ... ${s} CSG ...

2. SINGLE PART MODIFICATION (when NO new parts are requested):
   - If the user is only modifying, reshaping, rotating, or styling "${s}" (and not adding new items):
     Return the updated CSG geometry for "${s}".

3. IN-PLACE ROTATION RULE:
   - In OpenSCAD, rotate() rotates around global [0, 0, 0] by default!
   - If rotating/tilting "${s}", rotate around its center [${o}, ${a}, ${l}]:
     translate([${o}, ${a}, ${l}])
       rotate([rot_x, rot_y, rot_z])
         translate([-${o}, -${a}, -${l}]) {
           // geometry here
         }

4. GEOMETRY & STYLE:
   - Retro low-poly aesthetic.
   - Use standard OpenSCAD primitives: translate(), rotate(), scale(), cylinder(), cube(), sphere(), hull().
   - DO NOT include module declarations or outer union() wrappers.

5. WORKPLANE GROUNDING RULE:
   - All geometry must remain strictly on or above the base plane (Z >= 0).
   - Never place any geometry below Z = 0.

6. STRICT IN-PLACE POSITION RETENTION MANDATE:
   - Part "${s}" is currently located at: [X = ${o}, Y = ${a}, Z = ${l}].
   - You MUST keep "${s}" at this exact location!
   - DO NOT move "${s}" away from [X = ${o}, Y = ${a}, Z = ${l}] unless the user explicitly requested to move/shift/translate it.
   - Any shape modifications or styling must remain centered around [X = ${o}, Y = ${a}, Z = ${l}].
   - Never reset "${s}" to origin [0, 0, 0].

EXAMPLES OF DESIRED OUTPUT:

Example 1 (User clicked Torso and asked: "There are no hands. I need hands"):
{
  "explanation": "Added individual Left Hand and Right Hand forms attached to the Torso",
  "part_scad": "// [FORM: ${s}]\\n${e?e.slice(0,120).replace(/\\n/g," "):"cube([24, 14, 26], center = true);"}\\n\\n// [FORM: Left Hand]\\ntranslate([18, 0, ${l||15}]) cube([5, 5, 8], center = true);\\n\\n// [FORM: Right Hand]\\ntranslate([-18, 0, ${l||15}]) cube([5, 5, 8], center = true);"
}

Example 2 (User clicked Head and asked: "rotate 45 degrees"):
{
  "explanation": "Rotated head 45 degrees in place",
  "part_scad": "translate([${o}, ${a}, ${l}]) rotate([0, 45, 0]) translate([-${o}, -${a}, -${l}]) { ... }"
}

RESPONSE JSON SCHEMA:
{
  "explanation": "Brief description of the change",
  "part_scad": "// OpenSCAD CSG statements with [FORM: ...] markers..."
}`,{parsed:u,partScad:d}=await Ra({systemInstruction:c,promptText:h,onStatusUpdate:r});let f=d;return/\/\/\s*\[?FORM:/i.test(f)||(f=Q0(f,{cx:o,cy:a,cz:l})),{part_scad:f,explanation:u.explanation||""}}async function q0({selectedParts:s,fullScadTemplate:e,userPrompt:t,onStatusUpdate:n=()=>{}}){var u,d,f,g,_,m;const i=s.map(p=>`"${p.formName}"`).join(" and "),r=s.map((p,M)=>{var S,v,I,B,O,V;const y=Number((S=p.center)==null?void 0:S.cx)||0,x=Number((v=p.center)==null?void 0:v.cy)||0,C=Number((I=p.center)==null?void 0:I.cz)||0,T=Number((B=p.size)==null?void 0:B.dx)||0,R=Number((O=p.size)==null?void 0:O.dy)||0,P=Number((V=p.size)==null?void 0:V.dz)||0;return`PART ${M+1}: "${p.formName}" (ID: ${p.formId})
- Current Center: [X = ${y}, Y = ${x}, Z = ${C}]
- Dimensions: [Width X = ${T}, Depth Y = ${R}, Height Z = ${P}]
- Current CSG Code:
\`\`\`openscad
${p.currentPartCode||"// (empty)"}
\`\`\``}).join(`

`);let o="";if(s.length>=2){const p=Math.round(s.reduce((x,C)=>{var T;return x+(Number((T=C.center)==null?void 0:T.cx)||0)},0)/s.length),M=Math.round(s.reduce((x,C)=>{var T;return x+(Number((T=C.center)==null?void 0:T.cy)||0)},0)/s.length),y=Math.round(s.reduce((x,C)=>{var T;return x+(Number((T=C.center)==null?void 0:T.cz)||0)},0)/s.length);if(o+=`COLLECTIVE MIDPOINT: [X = ${p}, Y = ${M}, Z = ${y}]
`,s.length===2){const x=s[0],C=s[1],T=Number((u=x.center)==null?void 0:u.cx)||0,R=Number((d=x.center)==null?void 0:d.cy)||0,P=Number((f=x.center)==null?void 0:f.cz)||0,S=Number((g=C.center)==null?void 0:g.cx)||0,v=Number((_=C.center)==null?void 0:_.cy)||0,I=Number((m=C.center)==null?void 0:m.cz)||0,B=S-T,O=v-R,V=I-P,W=Math.round(Math.hypot(B,O,V));let F="X";Math.abs(O)>=Math.abs(B)&&Math.abs(O)>=Math.abs(V)?F="Y":Math.abs(V)>=Math.abs(B)&&Math.abs(V)>=Math.abs(O)&&(F="Z"),o+=`SEPARATION VECTOR between "${x.formName}" and "${C.formName}":
`,o+=`- Delta X = ${B}, Delta Y = ${O}, Delta Z = ${V}
`,o+=`- Direct Center-to-Center Distance = ${W}
`,o+=`- Dominant Separation Axis: ${F}-axis
`}}const a=`You are PXL3D, an expert retro low-poly 3D parametric OpenSCAD modeler.
The user has MULTI-SELECTED ${s.length} parts (${i}) in an existing model and requested a change.
You must handle two primary use cases:
1. BRIDGING / CONNECTING PARTS (e.g. "axle between them", "bar between them", "bridge", "connect", "strut"):
   - Inspect the coordinates, midpoint, and separation vector between the parts.
   - Create a new connecting part with its own "// [FORM: Axle]" (or connector name) positioned precisely at the midpoint and spanning between the parts.
   - For an axle along Y: translate([midX, midY, midZ]) rotate([90, 0, 0]) cylinder(r = 1.5, h = distance, center = true);
   - For an axle along X: translate([midX, midY, midZ]) rotate([0, 90, 0]) cylinder(r = 1.5, h = distance, center = true);
   - Also output the original parts: "// [FORM: Part 1]" and "// [FORM: Part 2]" so all parts remain discrete and intact.
2. SYNCHRONIZED MODIFICATION (e.g. "bend both fingers", "scale both", "rotate both", "make both thicker"):
   - Apply the requested modification to ALL selected parts!
   - Output EACH part with its own "// [FORM: Part Name]" header.
   - When rotating or bending parts, rotate each part around its OWN center point [cx, cy, cz]:
     translate([cx, cy, cz]) rotate(...) translate([-cx, -cy, -cz]) { ... }
   - Ensure all modified parts maintain their position in space and remain discrete, individually editable forms.

CRITICAL RULES:
- EVERY output component MUST start with "// [FORM: Name]".
- Never merge multiple distinct components into a single form.
- Workplane grounding: Z >= 0 (no geometry below base plane Z=0).
- Retro low-poly style.
- Return valid JSON matching the schema.`,l=`We are modifying a multi-selection of ${s.length} parts (${i}) in an existing OpenSCAD model.

SELECTED PARTS DETAILS:
${r}

${o?`SPATIAL RELATIONSHIPS:
${o}`:""}

FULL MODEL TEMPLATE FOR CONTEXT:
\`\`\`openscad
${(e||"").slice(0,1500)}
\`\`\`

USER REQUEST (FOR ALL SELECTED PARTS):
"${t}"

RULES FOR MULTI-PART OPERATIONS:
1. BRIDGING / CONNECTING PARTS (e.g. "axle between them", "bar between them", "bridge", "connect", "strut"):
   - Inspect the coordinates, midpoint, and separation vector above.
   - Output a new connecting part with its own "// [FORM: Axle]" (or appropriate connector name).
   - The connecting part must be positioned precisely at the midpoint and scaled/sized to bridge between the selected parts:
     * If separated mainly along Y (e.g. Left Wheel and Right Wheel):
       translate([midX, midY, midZ]) rotate([90, 0, 0]) cylinder(r = 1.5, h = dist, center = true);
     * If separated mainly along X:
       translate([midX, midY, midZ]) rotate([0, 90, 0]) cylinder(r = 1.5, h = dist, center = true);
     * If separated mainly along Z:
       translate([midX, midY, midZ]) cylinder(r = 1.5, h = dist, center = true);
   - Also include the original parts with their "// [FORM: Name]" headers so that both wheels and the axle remain discrete editable forms!

2. SYNCHRONIZED MODIFICATION (e.g. "bend both fingers", "scale both", "rotate both", "make them thicker", "curve both"):
   - Apply the requested modification to ALL selected parts!
   - Output EACH part with its own "// [FORM: Part Name]" header.
   - When rotating or bending parts, rotate each part around its OWN center [cx, cy, cz]:
     translate([cx, cy, cz]) rotate([rx, ry, rz]) translate([-cx, -cy, -cz]) { ... }
   - Never collapse all parts onto a single coordinate or merge them into one form.
   - Both parts must remain separate, individually selectable forms.

3. WORKPLANE GROUNDING & POSITION RETENTION:
   - Ground plane is Z = 0 (no geometry below Z = 0).
   - Maintain the existing world coordinates of the selected parts (do not reset them to origin [0, 0, 0]).

RESPONSE JSON SCHEMA:
{
  "explanation": "Brief description of changes made",
  "part_scad": "// [FORM: Part 1]\\n...\\n\\n// [FORM: Part 2]\\n...\\n\\n// [FORM: Axle]\\n..."
}`,{parsed:c,partScad:h}=await Ra({systemInstruction:a,promptText:l,onStatusUpdate:n});return{part_scad:h,explanation:c.explanation||""}}async function Ra({systemInstruction:s,promptText:e,onStatusUpdate:t,expectScad:n=!0}){var f,g,_,m,p,M,y,x,C,T,R,P,S,v,I,B,O,V;const i=ys(),r=Ms(),o=Mr(),a=Wi(),l=Vi(),c=vr();let h;if(i==="gemini"&&r){t(`PROMPTING GEMINI (${o})...`);const W=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${o}:generateContent?key=${r}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system_instruction:{parts:[{text:s}]},contents:[{parts:[{text:e}]}],generationConfig:{response_mime_type:"application/json",temperature:.2}})});if(!W.ok){let K=W.statusText;try{const z=await W.json();(f=z.error)!=null&&f.message&&(K=z.error.message)}catch{}throw new Error(`Google Gemini Error (${W.status}): ${K}`)}h=(M=(p=(m=(_=(g=(await W.json()).candidates)==null?void 0:g[0])==null?void 0:_.content)==null?void 0:m.parts)==null?void 0:p[0])==null?void 0:M.text}else if(i==="gemini"&&l){t(`CONNECTING TO PROXY (${o.toUpperCase()})...`);const W=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"gemini",model:o,prompt:e,systemPrompt:s,messages:[{role:"system",content:s},{role:"user",content:e}]})});if(!W.ok){let K=W.statusText;try{const z=await W.json();(y=z.error)!=null&&y.message&&(K=z.error.message)}catch{}throw new Error(`AI Gateway Error (${W.status}): ${K}`)}const F=await W.json();if(F.error)throw new Error(F.error.message||JSON.stringify(F.error));h=(T=(C=(x=F.choices)==null?void 0:x[0])==null?void 0:C.message)==null?void 0:T.content}else if(a){t(`CONNECTING TO GROQ (${c})...`);const W=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`},body:JSON.stringify({model:c,messages:[{role:"system",content:s},{role:"user",content:e}],response_format:{type:"json_object"},temperature:.25,max_tokens:2e3})});if(!W.ok){let K=W.statusText;try{const z=await W.json();(R=z.error)!=null&&R.message&&(K=z.error.message)}catch{}throw new Error(`AI Gateway Error (${W.status}): ${K}`)}const F=await W.json();if(F.error)throw new Error(F.error.message||JSON.stringify(F.error));h=(v=(S=(P=F.choices)==null?void 0:P[0])==null?void 0:S.message)==null?void 0:v.content}else{t("CONNECTING VIA SECURE PROXY...");const W=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"groq",prompt:e,model:c,systemPrompt:s,messages:[{role:"system",content:s},{role:"user",content:e}]})});if(!W.ok){let K=W.statusText;try{const z=await W.json();(I=z.error)!=null&&I.message&&(K=z.error.message)}catch{}throw new Error(`AI Gateway Error (${W.status}): ${K}`)}const F=await W.json();if(F.error)throw new Error(F.error.message||JSON.stringify(F.error));h=(V=(O=(B=F.choices)==null?void 0:B[0])==null?void 0:O.message)==null?void 0:V.content}if(!h)throw new Error("Received empty response from AI model");let u;try{u=JSON.parse(h)}catch(W){const F=h.match(/```(?:json)?\s*([\s\S]*?)\s*```/);if(F)u=JSON.parse(F[1]);else throw new Error(`Failed to parse AI response: ${W.message}`)}let d="";if(n){if(d=u.part_scad||u.scad||u.code||"",typeof d!="string"||!d.trim())throw new Error('AI response did not provide valid "part_scad" code');d=d.replace(/^```(?:openscad)?\s*/i,"").replace(/```\s*$/,"").trim(),d=J0(d)}return{parsed:u,partScad:d}}async function K0({modelName:s="",modelPrompt:e="",allParts:t=[],targetParts:n=[],onStatusUpdate:i=()=>{}}){const r=!n||n.length===0||n.length===t.length,o=(r?t:n).map(d=>d.name||d.id),a=t.map(d=>d.name||d.id).join(", "),l=`You are PXL3D's expert 3D material & texture artist specializing in realistic, tactile retro 3D materials.
Your task is to assign authentic retro materials to 3D objects based on the overall model theme and object anatomy.
NO flat, campy, or neon clown colors. Choose grounded, realistic material palettes (e.g. natural animal fur coats, organic skin/leather, weathered steel, cast iron, timber wood, vulcanized rubber, heavy cloth, stone).
Return valid JSON adhering to the specified schema.`,c=`MODEL OVERVIEW:
- Model Theme/Concept: "${e||s||"Retro 3D Asset"}"
- All Components in Model: ${a}

TARGET OBJECTS TO TEXTURIZE:
${o.map((d,f)=>`${f+1}. "${d}"`).join(`
`)}

AVAILABLE REALISTIC RETRO TEXTURE TYPES:
1. "fur": Organic stippled hair/coat (cats, dogs, bears, wolves, monsters). Use warm organic base & secondary colors (e.g. ginger/brown tabby, slate grey, golden retriever, black/dark brown fur).
2. "leather": Fine pore skin, animal snouts, paw pads, leather saddles, boots, organic hide.
3. "metal_brushed": Directional hairline brushed steel, gunmetal, aluminum, chrome for machinery, blades, vehicle bodies, robot chassis.
4. "metal_riveted": Heavy industrial armor plates with rivets and seam lines.
5. "wood": Timber grain with rings and fibers (tables, handles, wooden barrels, stocks).
6. "rubber": Matte dark vulcanized rubber with grip/treads for tires, treads, grips.
7. "stone": Weathered granular stone, granite flecks, marble veining, cobblestone.
8. "cloth": Woven canvas, denim, heavy fabric weave for clothing, cloaks, sails.
9. "glass": High gloss specular surface with glare highlight for visors, windshields, glowing eyes.
10. "scales": Overlapping retro reptilian/dragon scales.

For EACH target object, assign a cohesive realistic texture spec with:
- "type": one of the types above
- "baseColor": realistic primary hex color (e.g. "#9b5c2a", "#2b2d42", "#4a4e59")
- "secondaryColor": realistic secondary/accent hex color
- "roughness": 0.05 to 0.95 (fur: 0.85, leather: 0.6, metal: 0.35, rubber: 0.85, glass: 0.05)
- "metalness": 0.0 to 0.9 (metal: 0.7-0.9, organic/wood/rubber: 0.0-0.05)
- "bumpScale": 0.02 to 0.25 (depth of texture)
- "textureScale": repeat factor, usually 2 to 6
- "description": 1-line explanation of why this texture fits this part

RESPONSE JSON SCHEMA:
{
  "explanation": "Summary of realistic material choices for ${e||s}",
  "textures": {
    "${o[0]||"Part"}": {
      "type": "fur",
      "baseColor": "#b86b32",
      "secondaryColor": "#8d4f20",
      "roughness": 0.85,
      "metalness": 0.05,
      "bumpScale": 0.08,
      "textureScale": 3,
      "description": "Short description"
    }
  }
}`;try{const{parsed:d}=await Ra({systemInstruction:l,promptText:c,onStatusUpdate:i,expectScad:!1}),f=(d==null?void 0:d.textures)||(d==null?void 0:d.materials)||{};if(f&&Object.keys(f).length>0)return{explanation:d.explanation||"",textures:f}}catch(d){console.warn("AI Texturing LLM call failed or timed out, synthesizing authentic retro materials directly:",d)}return{explanation:"Procedural Retro PBR Material Synthesis",textures:Z0({modelName:s,modelPrompt:e,allParts:t,targetParts:r?t:n})}}function Z0({modelName:s="",modelPrompt:e="",allParts:t=[],targetParts:n=[]}){const i=`${e} ${s}`.toLowerCase(),r=/\b(cat|kitten|dog|puppy|bear|wolf|creature|dragon|monster|beast|lion|tiger|fox|rabbit|dinosaur|animal|pet)\b/i.test(i),o=!r&&/\b(robot|mech|cyborg|chassis|droid|machine|engine|car|vehicle|tank|gun|blaster|ship|space)\b/i.test(i),a=!r&&!o&&/\b(knight|soldier|warrior|wizard|human|character|person|man|woman|avatar)\b/i.test(i),l={},c=n&&n.length>0?n:t;for(const h of c){const u=(h.name||h.id||"").toLowerCase().trim(),d=h.name||h.id;/\b(snout|nose|beak|nostril)\b/.test(u)?l[d]={type:"leather",baseColor:"#3a2318",secondaryColor:"#22150e",roughness:.6,metalness:.05,bumpScale:.08,textureScale:3,description:"Pored leather animal snout"}:/\b(eye|eyes|pupil|visor)\b/.test(u)?l[d]={type:"glass",baseColor:o?"#00e5ff":"#141419",secondaryColor:o?"#0088aa":"#050508",roughness:.05,metalness:.2,bumpScale:.02,textureScale:1,description:"Glossy specular reflective surface"}:/\b(ear|ears|horn|horns)\b/.test(u)?l[d]={type:r?"fur":o?"metal_brushed":"leather",baseColor:r?"#b86b32":"#7c8ba1",secondaryColor:r?"#8d4f20":"#4f5b6d",roughness:r?.85:.4,metalness:r?.05:.6,bumpScale:.08,textureScale:3,description:"Authentic textured finish"}:/\b(tire|wheel|wheels|tires|track|tracks|grip)\b/.test(u)?l[d]={type:"rubber",baseColor:"#202024",secondaryColor:"#121215",roughness:.85,metalness:.05,bumpScale:.12,textureScale:4,description:"Vulcanized treaded rubber"}:/\b(axle|strut|rod|shaft|pipe)\b/.test(u)?l[d]={type:"metal_brushed",baseColor:"#8a8e96",secondaryColor:"#585c63",roughness:.35,metalness:.75,bumpScale:.05,textureScale:3,description:"Turned brushed steel mechanical rod"}:/\b(torso|body|chest|chassis)\b/.test(u)?r?l[d]={type:"fur",baseColor:"#c47437",secondaryColor:"#8e4c1c",roughness:.85,metalness:.02,bumpScale:.1,textureScale:4,description:"Dense natural animal coat"}:o?l[d]={type:"metal_riveted",baseColor:"#4f5d75",secondaryColor:"#2d3748",roughness:.45,metalness:.7,bumpScale:.08,textureScale:3,description:"Riveted industrial armor chassis"}:a?l[d]={type:"cloth",baseColor:"#5a3d28",secondaryColor:"#362417",roughness:.8,metalness:.05,bumpScale:.06,textureScale:4,description:"Woven fabric garment"}:l[d]={type:"stone",baseColor:"#7a7672",secondaryColor:"#4c4946",roughness:.7,metalness:.05,bumpScale:.08,textureScale:3,description:"Solid stone / composite structure"}:/\b(head|skull)\b/.test(u)?r?l[d]={type:"fur",baseColor:"#b86b32",secondaryColor:"#7c431b",roughness:.85,metalness:.02,bumpScale:.08,textureScale:3,description:"Short facial animal fur"}:o?l[d]={type:"metal_brushed",baseColor:"#6c7a89",secondaryColor:"#39424e",roughness:.4,metalness:.65,bumpScale:.06,textureScale:3,description:"Brushed metal robot head"}:l[d]={type:"leather",baseColor:"#bfa085",secondaryColor:"#8a6e54",roughness:.65,metalness:.05,bumpScale:.05,textureScale:3,description:"Organic skin grain"}:/\b(leg|legs|arm|arms|paw|paws|foot|feet|hand|hands|tail)\b/.test(u)?r?l[d]={type:"fur",baseColor:"#a85e28",secondaryColor:"#6c3a16",roughness:.85,metalness:.02,bumpScale:.08,textureScale:3,description:"Textured limb fur"}:o?l[d]={type:"metal_brushed",baseColor:"#5c677d",secondaryColor:"#333d4e",roughness:.4,metalness:.7,bumpScale:.06,textureScale:3,description:"Brushed metal articulated limb"}:l[d]={type:"leather",baseColor:"#4a3525",secondaryColor:"#2b1e15",roughness:.6,metalness:.1,bumpScale:.07,textureScale:3,description:"Tough leather boots / gauntlets"}:r?l[d]={type:"fur",baseColor:"#9e5b29",secondaryColor:"#633716",roughness:.8,metalness:.05,bumpScale:.07,textureScale:3,description:"Animal fur"}:o?l[d]={type:"metal_brushed",baseColor:"#606b7a",secondaryColor:"#3b434e",roughness:.4,metalness:.7,bumpScale:.06,textureScale:3,description:"Brushed metal component"}:l[d]={type:"wood",baseColor:"#825534",secondaryColor:"#4d301b",roughness:.7,metalness:.05,bumpScale:.08,textureScale:3,description:"Natural grained timber"}}return l}function J0(s){if(!s)return s;const e=/\/\/\s*\[?FORM:\s*(Hands|Arms|Ears|Horns|Wings|Feet|Legs)\]?\s*\n([\s\S]*?)(?=\n\/\/\s*\[?FORM:|$)/gi;return s.replace(e,(t,n,i)=>{const r=n.toLowerCase()==="feet"?"Foot":n.replace(/s$/i,""),a=i.trim().split(/(?=\btranslate\s*\(\s*\[)/i).map(l=>l.trim()).filter(Boolean);return a.length===2?`// [FORM: Right ${r}]
${a[0]}

// [FORM: Left ${r}]
${a[1]}
`:t})}function Q0(s,e){if(!s||!e)return s;const t=Number(e.cx)||0,n=Number(e.cy)||0,i=Number(e.cz)||0;if(t===0&&n===0&&i===0)return s;const r=s.trim();if(new RegExp(`translate\\s*\\(\\s*\\[\\s*${t}\\s*,\\s*${n}\\s*,\\s*${i}\\s*\\]\\s*\\)\\s*rotate`,"i").test(r))return s;const a=r.match(/^rotate\s*\(\s*(\[[^\]]+\])\s*\)\s*([\s\S]+)$/i);if(a){const l=a[1];let c=a[2].trim();return c.startsWith("{")||(c=`{
  ${c}
}`),`translate([${t}, ${n}, ${i}])
  rotate(${l})
    translate([${-t}, ${-n}, ${-i}]) ${c}`}return s}const sh="pxl3d_ai_engine",rh="pxl3d_neural_provider",sa="pxl3d_meshy_key",ra="pxl3d_tripo_key";function oh(){return localStorage.getItem(sh)||"parametric"}function ex(s){localStorage.setItem(sh,s)}function ah(){return localStorage.getItem(rh)||"meshy"}function tx(s){localStorage.setItem(rh,s)}function lh(){return localStorage.getItem(sa)||""}function nx(s){s?localStorage.setItem(sa,s.trim()):localStorage.removeItem(sa)}function ch(){return localStorage.getItem(ra)||""}function ix(s){s?localStorage.setItem(ra,s.trim()):localStorage.removeItem(ra)}async function hh(s,e,t=2e3,n=90){var i;for(let r=0;r<n;r++){await new Promise(l=>setTimeout(l,t));const o=await s(),a=e(o);if(a.done)return a.url;if(a.error)throw new Error(a.error);a.statusText&&((i=a.onStatus)==null||i.call(a,a.statusText))}throw new Error("Generation timed out (exceeded 3 minutes)")}async function sx(s,e,t=()=>{}){t("MESHY: CREATING TASK...");const n=await fetch("https://api.meshy.ai/openapi/v2/text-to-3d",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({mode:"preview",prompt:`${s}, stylized retro low poly 3D game asset`,art_style:"low-poly",negative_prompt:"high poly, hyperrealistic, noisy"})});if(!n.ok){const r=await n.json().catch(()=>({}));throw new Error(`Meshy API error (${n.status}): ${r.message||n.statusText}`)}const{result:i}=await n.json();if(!i)throw new Error("Meshy did not return a task ID");return t("MESHY: GENERATING MESH (0%)..."),hh(async()=>(await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${i}`,{headers:{Authorization:`Bearer ${e}`}})).json(),r=>{var a,l,c;if(r.status==="SUCCEEDED")return{done:!0,url:((a=r.model_urls)==null?void 0:a.glb)||((l=r.model_urls)==null?void 0:l.obj)};if(r.status==="FAILED")return{error:((c=r.task_error)==null?void 0:c.message)||"Meshy generation failed"};const o=r.progress||0;return t(`MESHY: GENERATING (${o}%)...`),{done:!1}})}async function rx(s,e,t=()=>{}){t("TRIPO: CREATING TASK...");const n=await fetch("https://api.tripo3d.ai/v2/openapi/task",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({type:"text_to_model",prompt:`${s}, low poly 3D model, stylized`})});if(!n.ok){const o=await n.json().catch(()=>({}));throw new Error(`Tripo API error (${n.status}): ${o.message||n.statusText}`)}const{data:i}=await n.json(),r=i==null?void 0:i.task_id;if(!r)throw new Error("Tripo did not return a task ID");return t("TRIPO: GENERATING MESH..."),hh(async()=>(await fetch(`https://api.tripo3d.ai/v2/openapi/task/${r}`,{headers:{Authorization:`Bearer ${e}`}})).json(),o=>{var c,h;const a=o==null?void 0:o.data;if((a==null?void 0:a.status)==="success")return{done:!0,url:((c=a.output)==null?void 0:c.model)||((h=a.output)==null?void 0:h.pbr_model)};if((a==null?void 0:a.status)==="failed")return{error:"Tripo generation failed"};const l=(a==null?void 0:a.progress)||0;return t(`TRIPO: GENERATING (${l}%)...`),{done:!1}})}class ox{constructor(){this.modalEl=document.getElementById("settings-modal"),this.engineSelect=document.getElementById("ai-engine-select"),this.neuralSettingsGroup=document.getElementById("neural-settings-group"),this.parametricSettingsGroup=document.getElementById("parametric-settings-group"),this.neuralProviderSelect=document.getElementById("neural-provider-select"),this.meshyKeyGroup=document.getElementById("meshy-key-group"),this.tripoKeyGroup=document.getElementById("tripo-key-group"),this.meshyKeyInput=document.getElementById("meshy-api-key"),this.tripoKeyInput=document.getElementById("tripo-api-key"),this.parametricProviderSelect=document.getElementById("parametric-provider-select"),this.geminiSettingsSubgroup=document.getElementById("gemini-settings-subgroup"),this.proxySettingsSubgroup=document.getElementById("proxy-settings-subgroup"),this.groqSettingsSubgroup=document.getElementById("groq-settings-subgroup"),this.geminiKeyInput=document.getElementById("gemini-api-key"),this.geminiModelSelect=document.getElementById("gemini-model-select"),this.btnToggleGeminiVis=document.getElementById("btn-toggle-gemini-key-vis"),this.proxyInput=document.getElementById("proxy-url-input"),this.keyInput=document.getElementById("groq-api-key"),this.modelSelect=document.getElementById("groq-model-select"),this.btnToggleVis=document.getElementById("btn-toggle-key-visibility"),this.btnSave=document.getElementById("btn-save-settings"),this.btnClose=document.getElementById("btn-close-settings"),this.init()}init(){this.btnClose.addEventListener("click",()=>this.close()),this.modalEl.addEventListener("click",n=>{n.target===this.modalEl&&this.close()}),this.engineSelect&&this.engineSelect.addEventListener("change",()=>{this.updateEngineView(this.engineSelect.value)}),this.neuralProviderSelect&&this.neuralProviderSelect.addEventListener("change",()=>{this.updateNeuralProviderView(this.neuralProviderSelect.value)}),this.parametricProviderSelect&&this.parametricProviderSelect.addEventListener("change",()=>{this.updateParametricProviderView(this.parametricProviderSelect.value)}),this.btnToggleVis&&this.keyInput&&this.btnToggleVis.addEventListener("click",()=>{this.keyInput.type==="password"?(this.keyInput.type="text",this.btnToggleVis.textContent="🔒"):(this.keyInput.type="password",this.btnToggleVis.textContent="👁")}),this.btnToggleGeminiVis&&this.geminiKeyInput&&this.btnToggleGeminiVis.addEventListener("click",()=>{this.geminiKeyInput.type==="password"?(this.geminiKeyInput.type="text",this.btnToggleGeminiVis.textContent="🔒"):(this.geminiKeyInput.type="password",this.btnToggleGeminiVis.textContent="👁")}),this.btnSave.addEventListener("click",()=>{this.engineSelect&&ex(this.engineSelect.value),this.neuralProviderSelect&&tx(this.neuralProviderSelect.value),this.meshyKeyInput&&nx(this.meshyKeyInput.value),this.tripoKeyInput&&ix(this.tripoKeyInput.value),this.parametricProviderSelect&&H0(this.parametricProviderSelect.value),this.geminiKeyInput&&fc(this.geminiKeyInput.value),this.geminiModelSelect&&V0(this.geminiModelSelect.value),this.proxyInput&&pc(this.proxyInput.value),this.keyInput&&ia(this.keyInput.value),this.modelSelect&&W0(this.modelSelect.value),this.close()});const e=document.getElementById("btn-use-proxy-default");e&&e.addEventListener("click",()=>{this.keyInput&&(this.keyInput.value=""),ia(""),this.proxyInput&&(this.proxyInput.value="https://pxl3d-proxy.gundur.workers.dev/",pc("https://pxl3d-proxy.gundur.workers.dev/")),e.textContent="✓ Using Cloudflare Proxy!",setTimeout(()=>{e.textContent="✓ Clear Key (Use Cloudflare Proxy)"},1500)});const t=document.getElementById("btn-clear-gemini-key");t&&t.addEventListener("click",()=>{this.geminiKeyInput&&(this.geminiKeyInput.value=""),fc(""),t.textContent="✓ Using Cloudflare Proxy!",setTimeout(()=>{t.textContent="✓ Clear Key (Use Cloudflare Proxy)"},1500)})}updateEngineView(e){const t=e==="neural";this.neuralSettingsGroup&&(this.neuralSettingsGroup.style.display=t?"block":"none"),this.parametricSettingsGroup&&(this.parametricSettingsGroup.style.display=t?"none":"block")}updateNeuralProviderView(e){const t=e==="meshy";this.meshyKeyGroup&&(this.meshyKeyGroup.style.display=t?"block":"none"),this.tripoKeyGroup&&(this.tripoKeyGroup.style.display=t?"none":"block")}updateParametricProviderView(e){this.geminiSettingsSubgroup&&(this.geminiSettingsSubgroup.style.display=e==="gemini"?"block":"none"),this.proxySettingsSubgroup&&(this.proxySettingsSubgroup.style.display=e==="proxy"?"block":"none"),this.groqSettingsSubgroup&&(this.groqSettingsSubgroup.style.display=e==="groq"?"block":"none")}open(){const e=oh();this.engineSelect&&(this.engineSelect.value=e,this.updateEngineView(e));const t=ah();this.neuralProviderSelect&&(this.neuralProviderSelect.value=t,this.updateNeuralProviderView(t)),this.meshyKeyInput&&(this.meshyKeyInput.value=lh()),this.tripoKeyInput&&(this.tripoKeyInput.value=ch());const n=ys();this.parametricProviderSelect&&(this.parametricProviderSelect.value=n,this.updateParametricProviderView(n)),this.geminiKeyInput&&(this.geminiKeyInput.value=Ms()),this.geminiModelSelect&&(this.geminiModelSelect.value=Mr()),this.proxyInput&&(this.proxyInput.value=Vi()),this.keyInput&&(this.keyInput.value=Wi()),this.modelSelect&&(this.modelSelect.value=vr()),this.modalEl.style.display="flex"}close(){this.modalEl.style.display="none"}}class ax{constructor(){this.drawerEl=document.getElementById("code-drawer"),this.codeDisplay=document.getElementById("scad-code-display"),this.btnCopy=document.getElementById("btn-copy-scad"),this.btnClose=document.getElementById("btn-close-code"),this.currentCode="",this.init()}init(){this.btnClose.addEventListener("click",()=>this.close()),this.drawerEl.addEventListener("click",e=>{e.target===this.drawerEl&&this.close()}),this.btnCopy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(this.currentCode);const e=this.btnCopy.textContent;this.btnCopy.textContent="COPIED!",setTimeout(()=>{this.btnCopy.textContent=e},1500)}catch(e){console.error("Failed to copy code:",e)}})}open(e){this.currentCode=e||"// No OpenSCAD code generated yet",this.codeDisplay.textContent=this.currentCode,this.drawerEl.style.display="flex"}close(){this.drawerEl.style.display="none"}}class lx{constructor(e=()=>{}){this.modalEl=document.getElementById("part-prompt-modal"),this.titleEl=document.getElementById("part-modal-title"),this.nameEl=document.getElementById("part-modal-name"),this.inputEl=document.getElementById("part-prompt-input"),this.statusEl=document.getElementById("part-modal-status"),this.btnClose=document.getElementById("btn-close-part-modal"),this.btnCancel=document.getElementById("btn-cancel-part-modal"),this.btnSubmit=document.getElementById("btn-submit-part-prompt"),this.onSubmit=e,this.currentFormId=null,this.currentFormName="",this.isLoading=!1,this.init()}init(){if(!this.modalEl)return;this.btnClose.addEventListener("click",()=>this.close()),this.btnCancel.addEventListener("click",()=>this.close()),this.modalEl.addEventListener("click",t=>{t.target===this.modalEl&&!this.isLoading&&this.close()}),this.btnSubmit.addEventListener("click",()=>{this.handleSubmit()}),this.inputEl.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey?(t.preventDefault(),this.handleSubmit()):t.key==="Escape"&&(this.isLoading||this.close())}),this.modalEl.querySelectorAll(".quick-chip").forEach(t=>{t.addEventListener("click",()=>{const n=t.getAttribute("data-text");n&&(this.inputEl.value.trim().length>0?this.inputEl.value+=", "+n.toLowerCase():this.inputEl.value=n,this.inputEl.focus())})})}open(e,t="Part"){if(Array.isArray(e)&&e.length>1)this.selectedItems=e,this.currentFormId=e.map(n=>n.formId).join(", "),this.currentFormName=e.map(n=>n.name||n.formName||"Part").join(", "),this.titleEl.textContent=`✎ MODIFY SELECTION (${e.length} ITEMS)`,this.nameEl.textContent=e.map(n=>`${n.name||n.formName||"Part"} (${n.formId})`).join(" + ");else{const n=Array.isArray(e)?e[0]:null;this.selectedItems=null,this.currentFormId=n?n.formId:e,this.currentFormName=n?n.name||n.formName||"Part":t,this.titleEl.textContent=`✎ MODIFY PART: ${this.currentFormName.toUpperCase()}`,this.nameEl.textContent=`${this.currentFormName} (${this.currentFormId})`}this.inputEl.value="",this.statusEl.textContent="READY",this.statusEl.style.color="var(--text-secondary)",this.setLoading(!1),this.modalEl.style.display="flex",setTimeout(()=>this.inputEl.focus(),50)}close(e=!1){this.isLoading&&!e||(this.isLoading=!1,this.modalEl.style.display="none")}setLoading(e,t=""){this.isLoading=e;const n=this.btnSubmit.querySelector(".btn-text"),i=this.btnSubmit.querySelector(".btn-spinner");this.btnSubmit.disabled=e,this.btnCancel.disabled=e,this.btnClose.disabled=e,this.inputEl.disabled=e,e?(n&&(n.style.display="none"),i&&(i.style.display="inline"),this.statusEl.textContent=t||"GENERATING...",this.statusEl.style.color="var(--text-accent)"):(n&&(n.style.display="inline"),i&&(i.style.display="none"),t&&(this.statusEl.textContent=t))}setStatus(e,t=!1){this.statusEl.textContent=e,this.statusEl.style.color=t?"var(--text-danger)":"var(--text-accent)"}handleSubmit(){const e=this.inputEl.value.trim();if(!e){this.inputEl.focus();return}const t={formId:this.currentFormId,formName:this.currentFormName,selectedItems:this.selectedItems||null,prompt:e};this.close(!0),this.onSubmit&&this.onSubmit(t)}}function Ht(s){if(!s||typeof s!="string")return[];const e=/\/\/\s*\[?FORM:\s*([^\]\r\n]+)\]?/gi,t=[];let n;for(;(n=e.exec(s))!==null;)t.push({name:n[1].trim(),headerStart:n.index,headerEnd:n.index+n[0].length});const i=/^[ \t]*\/\/\s*(?:\[?(Left\s+Ear|Right\s+Ear|Ears?|Left\s+Eye|Right\s+Eye|Eyes?|Snout|Nose|Mouth|Jaw|Beak|Horns?|Antlers?|Mane|Tail|Left\s+Wing|Right\s+Wing|Antennae?|Visor|Shield|Sword|Left\s+Arm|Right\s+Arm|Left\s+Leg|Right\s+Leg|Head|Torso|Chest|Pelvis|Neck)\]?\s*:?)\s*$/gmi;for(;(n=i.exec(s))!==null;){const o=n[1].trim();t.some(l=>Math.abs(l.headerStart-n.index)<15)||t.push({name:o,headerStart:n.index,headerEnd:n.index+n[0].length})}if(t.sort((o,a)=>o.headerStart-a.headerStart),t.length<2){const o=/^[ \t]*\/\/[ \t]+([A-Z][A-Za-z0-9 &/_,-]{2,30})[ \t]*$/gm,a=[];for(;(n=o.exec(s))!==null;){const l=n[1].trim();/^(Turbo|OpenSCAD|CSG|Author|License|Scale|Created|Default|\$fn)/i.test(l)||a.push({name:l,headerStart:n.index,headerEnd:n.index+n[0].length})}a.length>=2&&(t.length=0,t.push(...a))}if(t.length===0){const o=s.match(/module\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/);if(o){const a=o.index+o[0].length;let l=1,c=s.length;for(let h=a;h<s.length;h++)if(s[h]==="{")l++;else if(s[h]==="}"&&(l--,l===0)){c=h;break}return[{id:"form_0",name:"Whole Model",headerStart:a,contentStart:a,contentEnd:c}]}return[{id:"form_0",name:"Whole Model",headerStart:0,contentStart:0,contentEnd:s.length}]}const r=[];for(let o=0;o<t.length;o++){const a=t[o],l=a.headerEnd;let c;if(o+1<t.length)c=t[o+1].headerStart;else{let h=0;for(let d=0;d<l;d++)s[d]==="{"?h++:s[d]==="}"&&h--;let u=h;c=s.length;for(let d=l;d<s.length;d++)if(s[d]==="{")u++;else if(s[d]==="}"){if(u<=h){c=d;break}u--}}r.push({id:`form_${o}`,name:a.name,headerStart:a.headerStart,contentStart:l,contentEnd:c})}return r}function cx(s,e={}){if(!s||!e||Object.keys(e).length===0)return s;const t=Ht(s);if(t.length===0)return s;let n=s;for(let i=t.length-1;i>=0;i--){const r=t[i],o=e[r.id]||e[r.name]||(r.name?e[r.name.toLowerCase().trim()]:null);if(!o)continue;const a=Number(o.cx)||0,l=Number(o.cy)||0,c=Number(o.cz)||0,h=Number(o.dx)||0,u=Number(o.dy)||0,d=Number(o.dz)||0,f=Number(o.rx)||0,g=Number(o.ry)||0,_=Number(o.rz)||0,m=Number(o.s)!==void 0?Number(o.s):1,p=(Number(o.sx)!==void 0?Number(o.sx):1)*m,M=(Number(o.sy)!==void 0?Number(o.sy):1)*m,y=(Number(o.sz)!==void 0?Number(o.sz):1)*m;if(h!==0||u!==0||d!==0||f!==0||g!==0||_!==0||Math.abs(p-1)>.001||Math.abs(M-1)>.001||Math.abs(y-1)>.001){const C=n.slice(r.contentStart,r.contentEnd),T=`
  translate([${a+h}, ${l+u}, ${c+d}]) rotate([${f}, ${g}, ${_}]) scale([${p.toFixed(3)}, ${M.toFixed(3)}, ${y.toFixed(3)}]) translate([${-a}, ${-l}, ${-c}]) {
${C}
  }
`;n=n.slice(0,r.contentStart)+T+n.slice(r.contentEnd)}}return n}function dh(s,e={},t={}){if(!s)return"";let n=cx(s,t);const i={fn_res:14,...e};let r="";for(const[a,l]of Object.entries(i)){if(a==="scad_template"||a==="fn_res"||a==="_pxl_render_form")continue;new RegExp(`^\\s*${a}\\s*=`,"m").test(n)||(typeof l=="number"||typeof l=="boolean"?r+=`${a} = ${l};
`:typeof l=="string"&&(r+=`${a} = "${l}";
`))}const o=n.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g,(a,l)=>{if(Object.prototype.hasOwnProperty.call(i,l)){const c=i[l];return typeof c=="boolean"?c?"true":"false":String(c)}return a});return(r?r+`
`:"")+o}function mc(s=[]){const e={};for(const t of s)t&&t.id!==void 0&&(e[t.id]=t.default!==void 0?t.default:t.min||0);return e}function hx(s,e={},t={}){if(!s)return[];const n=Ht(s);if(n.length===0)return[];let i=s;for(let o=n.length-1;o>=0;o--){const a=n[o],l=i.slice(a.contentStart,a.contentEnd),c=t[a.id]||t[a.name]||(a.name?t[a.name.toLowerCase().trim()]:null);let h=l;if(c){const d=Number(c.cx)||0,f=Number(c.cy)||0,g=Number(c.cz)||0,_=Number(c.dx)||0,m=Number(c.dy)||0,p=Number(c.dz)||0,M=Number(c.rx)||0,y=Number(c.ry)||0,x=Number(c.rz)||0,C=Number(c.s)!==void 0?Number(c.s):1,T=(Number(c.sx)!==void 0?Number(c.sx):1)*C,R=(Number(c.sy)!==void 0?Number(c.sy):1)*C,P=(Number(c.sz)!==void 0?Number(c.sz):1)*C;(_!==0||m!==0||p!==0||M!==0||y!==0||x!==0||Math.abs(T-1)>.001||Math.abs(R-1)>.001||Math.abs(P-1)>.001)&&(h=`
  translate([${d+_}, ${f+m}, ${g+p}]) rotate([${M}, ${y}, ${x}]) scale([${T.toFixed(3)}, ${R.toFixed(3)}, ${P.toFixed(3)}]) translate([${-d}, ${-f}, ${-g}]) {
${l}
  }
`)}const u=`
if (_pxl_render_form == "" || _pxl_render_form == "${a.id}") {
${h}
}
`;i=i.slice(0,a.contentStart)+u+i.slice(a.contentEnd)}const r=`_pxl_render_form = "{{_pxl_render_form}}";
`+i;return n.map(o=>{const a={...e,_pxl_render_form:o.id},l=dh(r,a);return{id:o.id,name:o.name,code:l}})}function gc(s,e){if(!s)return"";const n=Ht(s).find(i=>i.id===e||i.name===e);return n?s.slice(n.contentStart,n.contentEnd).trim():""}function dx(s,e,t){if(!s||!e||!t)return s;const i=Ht(s).find(a=>a.id===e||a.name===e);if(!i)return s;const r=t.trim();if(/\/\/\s*\[?FORM:/i.test(r)){const a=i.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return new RegExp(`\\[?FORM:\\s*${a}\\]?`,"i").test(r)?s.slice(0,i.headerStart)+`
`+r+`
`+s.slice(i.contentEnd):s.slice(0,i.contentEnd)+`

`+r+`
`+s.slice(i.contentEnd)}return s.slice(0,i.contentStart)+`
  `+r+`
`+s.slice(i.contentEnd)}function ux(s,e,t){if(!s||!e||!e.length||!t)return s;const n=Ht(s);if(!n.length)return s;const i=new Set(e.map(_=>String(_).toLowerCase().trim())),r=n.filter(_=>i.has(_.id.toLowerCase().trim())||i.has(_.name.toLowerCase().trim()));if(!r.length)return s;r.sort((_,m)=>_.headerStart-m.headerStart);const o=r[r.length-1],a=/\/\/\s*\[?FORM:\s*([^\]\r\n]+)\]?/gi,l=[];let c;for(;(c=a.exec(t))!==null;)l.push({name:c[1].trim(),start:c.index,headerEnd:c.index+c[0].length});for(let _=0;_<l.length;_++){const m=_+1<l.length?l[_+1].start:t.length;l[_].code=t.slice(l[_].headerEnd,m).trim()}const h=new Map,u=[];if(l.length>0){const _=[];for(const m of l){const p=m.name.toLowerCase().replace(/[^a-z0-9]/g,""),M=r.find(y=>{const x=y.name.toLowerCase().replace(/[^a-z0-9]/g,"");return x===p||x.includes(p)||p.includes(x)});M&&!h.has(M)?h.set(M,`// [FORM: ${m.name}]
${m.code}`):_.push(m)}if(h.size===0&&l.length===r.length)for(let m=0;m<r.length;m++)h.set(r[m],`// [FORM: ${l[m].name}]
${l[m].code}`);else u.push(..._)}const d=u.map(_=>`// [FORM: ${_.name}]
${_.code.trim()}`).join(`

`),f=[...r].sort((_,m)=>m.headerStart-_.headerStart);let g=s;for(const _ of f){const m=_===o,p=h.get(_);let M="";p?M=p.trim():M=s.slice(_.headerStart,_.contentEnd).trim(),m&&d&&(M=M+`

`+d),(p||m&&d)&&(g=g.slice(0,_.headerStart)+M+`
`+g.slice(_.contentEnd))}return g}const fx={castle_tower:{name:"Castle Watchtower",description:"A fortress tower with configurable battlements, door, and radius.",parameters:[{id:"tower_height",label:"Height",type:"range",min:40,max:90,step:2,default:60},{id:"tower_radius",label:"Radius",type:"range",min:14,max:28,step:1,default:20},{id:"battlement_count",label:"Battlements",type:"range",min:4,max:10,step:1,default:6},{id:"roof_style",label:"Roof Type",type:"select",options:["battlements","cone_roof"],default:"battlements"},{id:"has_door",label:"Base Door",type:"select",options:["yes","no"],default:"yes"}],scad_template:`// Castle Watchtower (Turbo CSG)
$fn = {{fn_res}};

h = {{tower_height}};
r = {{tower_radius}};
b_count = {{battlement_count}};
roof = "{{roof_style}}";
door = "{{has_door}}";

module tower() {
  difference() {
    union() {
      // [FORM: Main Tower Shaft]
      cylinder(h = h, r1 = r * 1.05, r2 = r, center = false);

      // [FORM: Parapet Ledge]
      translate([0, 0, h - 6])
        cylinder(h = 6, r1 = r, r2 = r * 1.2, center = false);
      
      // [FORM: Cone Roof]
      if (roof == "cone_roof") {
        translate([0, 0, h])
          cylinder(h = r * 1.4, r1 = r * 1.25, r2 = 0, center = false);
      }
    }
    
    // Hollow interior
    translate([0, 0, 2])
      cylinder(h = h + 10, r = r * 0.75, center = false);

    // Battlements notches
    if (roof == "battlements") {
      for (i = [0 : b_count - 1]) {
        rotate([0, 0, i * (360 / b_count)])
          translate([r * 0.85, -r * 0.22, h - 3.5])
            cube([r * 0.7, r * 0.44, 10]);
      }
    }

    // Door cutout
    if (door == "yes") {
      translate([0, r * 0.7, r * 0.4])
        cube([r * 0.55, r * 0.8, r * 0.85], center = true);
      translate([0, r * 0.7, r * 0.8])
        rotate([90, 0, 0])
          cylinder(h = r * 0.8, r = r * 0.275, center = true);
    }
  }
}

tower();`},cable_organizer:{name:"Desk Cable Clip",description:"Multi-slot desk cable guide with chamfered slots and weighted base.",parameters:[{id:"slot_count",label:"Cable Slots",type:"range",min:2,max:6,step:1,default:4},{id:"slot_dia",label:"Slot Dia",type:"range",min:4,max:8,step:.5,default:5},{id:"block_height",label:"Block Height",type:"range",min:12,max:24,step:1,default:16},{id:"block_depth",label:"Depth",type:"range",min:18,max:32,step:2,default:24}],scad_template:`// Desk Cable Clip (Turbo CSG)
$fn = {{fn_res}};

slots = {{slot_count}};
slot_d = {{slot_dia}};
bh = {{block_height}};
bd = {{block_depth}};

pitch = slot_d * 2.6;
total_w = (slots + 1) * pitch;

module cable_organizer() {
  difference() {
    // [FORM: Main Base Block]
    translate([-total_w / 2, -bd / 2, 0])
      cube([total_w, bd, bh]);

    // [FORM: Cable Slot Channels]
    union() {
      for (i = [1 : slots]) {
        x_pos = -total_w / 2 + (i * pitch);
        translate([x_pos, 0, bh / 2])
          rotate([90, 0, 0])
            cylinder(h = bd + 6, r = slot_d / 2, center = true);
        translate([x_pos - (slot_d * 0.35), -(bd + 4) / 2, bh / 2])
          cube([slot_d * 0.7, bd + 4, bh + 2]);
      }
    }
  }
}

cable_organizer();`},hex_planter:{name:"Hexagonal Geometric Planter",description:"Minimalist hexagonal succulent planter with drainage hole and faceted rim.",parameters:[{id:"planter_h",label:"Height",type:"range",min:30,max:70,step:2,default:45},{id:"outer_r",label:"Radius",type:"range",min:20,max:40,step:1,default:28},{id:"wall_thk",label:"Wall Thick",type:"range",min:2,max:6,step:.5,default:3},{id:"drain_hole",label:"Drain Hole",type:"select",options:["yes","no"],default:"yes"}],scad_template:`// Hexagonal Planter (Turbo CSG)
$fn = 6; // Hexagonal cylinder

h = {{planter_h}};
r = {{outer_r}};
thk = {{wall_thk}};
drain = "{{drain_hole}}";

module planter() {
  difference() {
    // [FORM: Planter Body]
    cylinder(h = h, r1 = r * 0.85, r2 = r, center = false);

    // [FORM: Inner Cavity]
    translate([0, 0, thk * 1.5])
      cylinder(h = h + 2, r1 = (r * 0.85) - thk, r2 = r - thk, center = false);

    // [FORM: Drainage Hole]
    if (drain == "yes") {
      translate([0, 0, -1])
        cylinder(h = thk * 2 + 4, r = 3.5, $fn = {{fn_res}}, center = false);
    }
  }
}

planter();`},lowpoly_tree:{name:"Low-Poly Pine Tree",description:"Game-ready low-poly pine tree with stacked faceted canopies and tapered trunk.",parameters:[{id:"trunk_h",label:"Trunk Height",type:"range",min:10,max:30,step:2,default:18},{id:"layers",label:"Foliage Layers",type:"range",min:2,max:4,step:1,default:3},{id:"cone_r",label:"Base Radius",type:"range",min:16,max:32,step:2,default:24},{id:"trunk_r",label:"Trunk Thick",type:"range",min:3,max:7,step:.5,default:4.5}],scad_template:`// Low-Poly Pine Tree (Turbo CSG)
$fn = 7; // Faceted low-poly look

th = {{trunk_h}};
n = {{layers}};
r0 = {{cone_r}};
tr = {{trunk_r}};

module pine_tree() {
  // [FORM: Tree Trunk]
  cylinder(h = th + 4, r1 = tr, r2 = tr * 0.7, $fn = 8, center = false);

  // [FORM: Foliage Canopy]
  for (i = [0 : n - 1]) {
    layer_z = th + (i * 12);
    layer_r = r0 * (1 - (i * 0.22));
    layer_h = 18 + (i * 2);

    translate([0, 0, layer_z])
      rotate([0, 0, i * 25])
        cylinder(h = layer_h, r1 = layer_r, r2 = 0, center = false);
  }
}

pine_tree();`},robot_toy:{name:"Retro Block Robot",description:"Vintage robot figure with articulated arms, screen visor, and antennae.",parameters:[{id:"body_w",label:"Width",type:"range",min:18,max:32,step:2,default:24},{id:"body_h",label:"Body Height",type:"range",min:20,max:36,step:2,default:26},{id:"head_s",label:"Head Size",type:"range",min:14,max:22,step:1,default:18},{id:"antenna",label:"Antenna",type:"select",options:["dish","dual_spikes","single_rod"],default:"dual_spikes"},{id:"arm_rot",label:"Arm Pose",type:"range",min:-40,max:40,step:5,default:20}],scad_template:`// Retro Block Robot (Turbo CSG)
$fn = {{fn_res}};

bw = {{body_w}};
bh = {{body_h}};
hs = {{head_s}};
ant = "{{antenna}}";
arot = {{arm_rot}};

leg_h = 12;
leg_w = bw * 0.3;

module robot() {
  // [FORM: Legs]
  union() {
    translate([-bw * 0.25, 0, leg_h / 2])
      cube([leg_w, bw * 0.4, leg_h], center = true);
    translate([bw * 0.25, 0, leg_h / 2])
      cube([leg_w, bw * 0.4, leg_h], center = true);
  }

  // [FORM: Torso]
  translate([0, 0, leg_h + (bh / 2)])
    difference() {
      cube([bw, bw * 0.75, bh], center = true);
      translate([0, bw * 0.35 + 0.5, 0])
        cube([bw * 0.7, 5, bh * 0.6], center = true);
    }

  // [FORM: Neck]
  translate([0, 0, leg_h + bh + 1.5])
    cylinder(h = 3, r = bw * 0.2, center = true);

  // [FORM: Head]
  translate([0, 0, leg_h + bh + 3 + (hs / 2)])
    difference() {
      cube([hs, hs * 0.85, hs], center = true);
      translate([0, hs * 0.4 + 0.5, hs * 0.1])
        cube([hs * 0.8, 4, hs * 0.3], center = true);
    }

  // [FORM: Antenna]
  union() {
    top_z = leg_h + bh + 3 + hs;
    if (ant == "dual_spikes") {
      translate([-hs * 0.35, 0, top_z + 4])
        cylinder(h = 8, r1 = 1.8, r2 = 0.5, center = true);
      translate([hs * 0.35, 0, top_z + 4])
        cylinder(h = 8, r1 = 1.8, r2 = 0.5, center = true);
    }
    if (ant == "dish") {
      translate([0, 0, top_z + 3])
        cylinder(h = 2, r1 = 2, r2 = 7, center = true);
      translate([0, 0, top_z + 5])
        sphere(r = 1.8);
    }
    if (ant == "single_rod") {
      translate([0, 0, top_z + 4])
        cylinder(h = 8, r = 1.5, center = true);
      translate([0, 0, top_z + 9])
        sphere(r = 2.5);
    }
  }

  // [FORM: Left Arm]
  translate([-bw * 0.6, 0, leg_h + bh - 4])
    rotate([arot, 0, 0])
      translate([0, 0, -bh * 0.3])
        cube([bw * 0.2, bw * 0.25, bh * 0.6], center = true);

  // [FORM: Right Arm]
  translate([bw * 0.6, 0, leg_h + bh - 4])
    rotate([-arot, 0, 0])
      translate([0, 0, -bh * 0.3])
        cube([bw * 0.2, bw * 0.25, bh * 0.6], center = true);
}

robot();`}};class px{parse(e,t={}){t=Object.assign({binary:!1},t);const n=t.binary,i=[];let r=0;e.traverse(function(p){if(p.isMesh){const M=p.geometry,y=M.index,x=M.getAttribute("position");r+=y!==null?y.count/3:x.count/3,i.push({object3d:p,geometry:M})}});let o,a=80;if(n===!0){const p=r*2+r*3*4*4+80+4,M=new ArrayBuffer(p);o=new DataView(M),o.setUint32(a,r,!0),a+=4}else o="",o+=`solid exported
`;const l=new A,c=new A,h=new A,u=new A,d=new A,f=new A;for(let p=0,M=i.length;p<M;p++){const y=i[p].object3d,x=i[p].geometry,C=x.index,T=x.getAttribute("position");if(C!==null)for(let R=0;R<C.count;R+=3){const P=C.getX(R+0),S=C.getX(R+1),v=C.getX(R+2);g(P,S,v,T,y)}else for(let R=0;R<T.count;R+=3){const P=R+0,S=R+1,v=R+2;g(P,S,v,T,y)}}return n===!1&&(o+=`endsolid exported
`),o;function g(p,M,y,x,C){l.fromBufferAttribute(x,p),c.fromBufferAttribute(x,M),h.fromBufferAttribute(x,y),C.isSkinnedMesh===!0&&(C.applyBoneTransform(p,l),C.applyBoneTransform(M,c),C.applyBoneTransform(y,h)),l.applyMatrix4(C.matrixWorld),c.applyMatrix4(C.matrixWorld),h.applyMatrix4(C.matrixWorld),_(l,c,h),m(l),m(c),m(h),n===!0?(o.setUint16(a,0,!0),a+=2):(o+=`		endloop
`,o+=`	endfacet
`)}function _(p,M,y){u.subVectors(y,M),d.subVectors(p,M),u.cross(d).normalize(),f.copy(u).normalize(),n===!0?(o.setFloat32(a,f.x,!0),a+=4,o.setFloat32(a,f.y,!0),a+=4,o.setFloat32(a,f.z,!0),a+=4):(o+="	facet normal "+f.x+" "+f.y+" "+f.z+`
`,o+=`		outer loop
`)}function m(p){n===!0?(o.setFloat32(a,p.x,!0),a+=4,o.setFloat32(a,p.y,!0),a+=4,o.setFloat32(a,p.z,!0),a+=4):o+="			vertex "+p.x+" "+p.y+" "+p.z+`
`}}}class mx{constructor(){this.appScreen=document.getElementById("app-screen"),this.scaleBadge=document.getElementById("scale-badge"),this.wasmBadge=document.getElementById("wasm-badge"),this.aiStatus=document.getElementById("ai-status"),this.compilationStats=document.getElementById("compilation-stats"),this.renderStats=document.getElementById("render-stats"),this.viewportSpinner=document.getElementById("viewport-spinner"),this.spinnerText=document.getElementById("spinner-text"),this.btnGenerate=document.getElementById("btn-generate"),this.promptInput=document.getElementById("prompt-input"),this.btnResetParams=document.getElementById("btn-reset-params"),this.btnExportStl=document.getElementById("btn-export-stl"),this.btnExportScad=document.getElementById("btn-export-scad"),this.btnOpenSettings=document.getElementById("btn-open-settings"),this.btnOpenCode=document.getElementById("btn-open-code"),this.btnToggleRes=document.getElementById("btn-toggle-res"),this.tabModeParams=document.getElementById("tab-mode-params"),this.tabModeEdit=document.getElementById("tab-mode-edit"),this.dynamicParamsContainer=document.getElementById("dynamic-params-container"),this.formEditContainer=document.getElementById("form-edit-container"),this.activePanelMode="edit",this.currentModel=null,this.currentScadCode="",this.currentStlBuffer=null,this.compileRequestId=0,this.isWorkerReady=!1,this.isCompiling=!1,this.isTurboMode=!0,this.init()}init(){this.setupIntegerScaling();const e=document.getElementById("canvas-container");this.viewport=new O0(e),this.settingsModal=new ox,this.codeViewer=new ax,this.partPromptModal=new lx(async({formId:n,formName:i,selectedItems:r,prompt:o})=>{r&&r.length>1?await this.handleModifyMultipleParts(r,o):await this.handleModifyPart(n,i,o)});const t=document.getElementById("dynamic-params-container");this.paramControls=new F0(t,n=>{this.recompileCurrentModel(n)}),this.formEditor=new B0(this.formEditContainer,{onResetPart:()=>this.viewport.resetSelectedFormMesh(),onResetAll:()=>this.viewport.resetAllFormMeshes(),onDeselect:()=>this.viewport.tinkerGizmo.detach(),onSelectAll:()=>this.viewport.selectAllForms(),onScaleAll:n=>this.viewport.scaleAllForms(n),onFitToView:()=>this.viewport.fitToView(),onDropToWorkplane:()=>this.viewport.dropToWorkplane(this.viewport.selectedMeshes&&this.viewport.selectedMeshes.size>0),onAiTexture:()=>this.handleAiTexturize()}),this.viewport.onFormSelected=(n,i)=>{this.formEditor.updateSelection(i);const r=document.getElementById("btn-ai-texture");r&&(i&&i.selectedCount>1?r.textContent=`✦ AI TEXTURE (${i.selectedCount})`:i&&i.formId?r.textContent="✦ AI TEXTURE (1)":r.textContent="✦ AI TEXTURE")},this.viewport.onFormTransformed=(n,i)=>{this.formEditor.updateSelection(i)},this.viewport.onFormDoubleClicked=(n,i,r)=>{if(r&&r.length>1)this.partPromptModal.open(r);else{const o=n.userData.formId||i.formId,a=n.userData.formName||i.name||"Part";this.partPromptModal.open(o,a)}},this.setupWorker(),this.bindEvents(),window.addEventListener("pxl3d-load-demo",n=>{this.loadPreset(n.detail||"robot_toy")}),this.setPanelMode("edit"),this.loadPreset("robot_toy"),this.compilationStats.textContent="READY",this.renderStats.textContent=""}loadPreset(e="robot_toy"){const t=fx[e];if(!t)return;this.currentModel={name:t.name,parameters:t.parameters,scad_template:t.scad_template};const n=Ht(t.scad_template);this.formEditor.setForms(n),this.viewport&&this.viewport.clearHistory();const i=mc(t.parameters);this.paramControls.render(t.parameters,i),this.recompileCurrentModel(i),this.btnExportStl.disabled=!1,this.btnExportScad.disabled=!1,this.formEditor.setHasModel(!0),this.aiStatus.textContent="READY"}setupIntegerScaling(){this.scaleModes=["2x","fit","auto","1x"],this.currentScaleMode=localStorage.getItem("pxl3d_scale_mode")||"2x";const e=()=>{const n=window.innerWidth,i=window.innerHeight;let r=2,o=800,a=450;if(this.currentScaleMode==="2x")r=2,this.scaleBadge.textContent="SCALE: 2X",this.scaleBadge.classList.add("badge-success"),o=Math.max(480,Math.floor(n/2)),a=Math.max(300,Math.floor(i/2));else if(this.currentScaleMode==="1x")r=1,this.scaleBadge.textContent="SCALE: 1X",this.scaleBadge.classList.remove("badge-success"),o=n,a=i;else if(this.currentScaleMode==="fit")r=Math.min(n/800,i/450),this.scaleBadge.textContent=`SCALE: ${r.toFixed(2)}X (FIT)`,this.scaleBadge.classList.remove("badge-success"),o=800,a=450;else{const d=n/800,f=i/450;r=Math.max(1,Math.floor(Math.min(d,f))),this.scaleBadge.textContent=`SCALE: ${r}X (AUTO)`,this.scaleBadge.classList.remove("badge-success"),o=Math.floor(n/r),a=Math.floor(i/r)}this.appScreen.style.width=`${o}px`,this.appScreen.style.height=`${a}px`,this.appScreen.style.transform=`translate(-50%, -50%) scale(${r})`;const l=document.getElementById("sidebar"),c=Math.min(280,Math.max(220,Math.floor(o*.35)));l&&(l.style.width=`${c}px`);const h=o-c,u=a-28;this.viewport&&this.viewport.resize(h,u)};window.addEventListener("resize",e),e(),this.scaleBadge.addEventListener("click",()=>{const i=(this.scaleModes.indexOf(this.currentScaleMode)+1)%this.scaleModes.length;this.currentScaleMode=this.scaleModes[i],localStorage.setItem("pxl3d_scale_mode",this.currentScaleMode),e()});const t=document.getElementById("btn-fullscreen");t&&(t.addEventListener("click",()=>{document.fullscreenElement?document.exitFullscreen().catch(()=>{}):document.documentElement.requestFullscreen().catch(()=>{})}),document.addEventListener("fullscreenchange",()=>{t.textContent=document.fullscreenElement?"⛶ EXIT":"⛶ FULL",e()}))}setupWorker(){this.worker=new Worker(new URL("./openscad.worker-jwvTQ61_.js",import.meta.url),{type:"module"}),this.worker.onmessage=e=>{const{type:t,id:n,stlBuffer:i,durationMs:r,error:o}=e.data;if(t==="READY")this.isWorkerReady=!0,this.wasmBadge.textContent="WASM: READY",this.wasmBadge.className="badge badge-success",this.currentModel&&(this.viewport&&(this.viewport.formMeshes.size>0||this.viewport.currentMesh)||(this.isCompiling=!1,this.recompileCurrentModel(this.paramControls.getValues())));else if(t==="INIT_ERROR")this.isCompiling=!1,this.wasmBadge.textContent="WASM: ERROR",this.wasmBadge.className="badge badge-danger",console.error("WASM Worker failed to initialize:",o);else if(t==="SUCCESS"){if(this.isCompiling=!1,n!==this.compileRequestId)return;this.hideSpinner(),this.currentStlBuffer=i,this.btnExportStl.disabled=!1,this.btnExportScad.disabled=!1;const a=this.viewport.loadStlBuffer(i),l=this.isTurboMode?"TURBO":"HQ";this.compilationStats.textContent=`${l}: ${r}ms | ${a.facets.toLocaleString()} FACETS`,this.renderStats.textContent=`SIZE: ${a.dimensions.x}x${a.dimensions.y}x${a.dimensions.z}mm`}else if(t==="PARTS_SUCCESS"){if(this.isCompiling=!1,n!==this.compileRequestId)return;this.hideSpinner(),this.btnExportStl.disabled=!1,this.btnExportScad.disabled=!1,this.formEditor.setHasModel(!0);const a=this.viewport.loadFormMeshes(e.data.parts,this.activePreservedState);this.activePreservedState=null;const l=this.isTurboMode?"TURBO":"HQ";this.compilationStats.textContent=`${l}: ${r}ms | ${a.facets.toLocaleString()} FACETS`,this.renderStats.textContent=`SIZE: ${a.dimensions.x}x${a.dimensions.y}x${a.dimensions.z}mm`}else if(t==="ERROR"){if(this.isCompiling=!1,n!==this.compileRequestId)return;this.hideSpinner(),this.compilationStats.textContent="COMPILE ERROR",console.error("Compilation failed:",o)}}}bindEvents(){this.btnOpenSettings.addEventListener("click",()=>{this.settingsModal.open()}),this.btnOpenCode.addEventListener("click",()=>{this.codeViewer.open(this.currentScadCode||`// No model generated yet.
// Enter a prompt above and click GENERATE.`)}),this.tabModeParams&&this.tabModeParams.addEventListener("click",()=>{this.setPanelMode("params")}),this.tabModeEdit&&this.tabModeEdit.addEventListener("click",()=>{this.setPanelMode("edit")}),this.btnResetParams.addEventListener("click",()=>{this.activePanelMode==="params"?this.currentModel&&this.paramControls.resetToDefaults():this.formEditor&&this.formEditor.resetAll()}),this.btnGenerate.addEventListener("click",()=>{this.handleGeneratePrompt()}),this.promptInput.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),this.handleGeneratePrompt())}),this.btnExportStl.addEventListener("click",()=>{this.exportStl()}),this.btnExportScad.addEventListener("click",()=>{this.exportScad()}),document.querySelectorAll(".view-controls .hud-btn").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-view");this.viewport.setView(o)})}),this.btnToggleRes&&this.btnToggleRes.addEventListener("click",()=>{this.isTurboMode=!this.isTurboMode,this.btnToggleRes.textContent=this.isTurboMode?"TURBO (14)":"HQ (32)",this.btnToggleRes.classList.toggle("active",this.isTurboMode),this.currentModel&&this.recompileCurrentModel(this.paramControls.getValues())});const e=document.getElementById("btn-toggle-wireframe");e.addEventListener("click",()=>{const r=this.viewport.toggleWireframe();e.classList.toggle("active",r)});const t=document.getElementById("btn-toggle-grid");t.addEventListener("click",()=>{const r=this.viewport.toggleGrid();t.classList.toggle("active",r)});const n=document.getElementById("btn-cycle-mat");n.addEventListener("click",()=>{const r=this.viewport.cycleMaterial();n.textContent=r.slice(0,4)});const i=document.getElementById("btn-ai-texture");i&&i.addEventListener("click",()=>{this.handleAiTexturize()}),window.addEventListener("keydown",r=>{const o=document.activeElement?document.activeElement.tagName.toLowerCase():"";if(o==="input"||o==="textarea")return;const a=r.ctrlKey||r.metaKey;if(a&&r.key.toLowerCase()==="z"&&!r.shiftKey){r.preventDefault(),this.viewport&&this.viewport.historyManager&&this.viewport.historyManager.undo();return}if(a&&r.key.toLowerCase()==="y"||a&&r.key.toLowerCase()==="z"&&r.shiftKey){r.preventDefault(),this.viewport&&this.viewport.historyManager&&this.viewport.historyManager.redo();return}if(a&&r.key.toLowerCase()==="a"){this.viewport&&this.activePanelMode==="edit"&&(r.preventDefault(),this.viewport.selectAllForms());return}if(!a&&!r.altKey&&r.key.toLowerCase()==="d"){this.viewport&&this.activePanelMode==="edit"&&(r.preventDefault(),this.viewport.dropToWorkplane(this.viewport.selectedMeshes&&this.viewport.selectedMeshes.size>0));return}if(a&&r.key.toLowerCase()==="c"){this.viewport&&this.viewport.selectedMeshes&&this.viewport.selectedMeshes.size>0&&(r.preventDefault(),this.viewport.copySelection());return}if(a&&r.key.toLowerCase()==="x"){this.viewport&&this.viewport.selectedMeshes&&this.viewport.selectedMeshes.size>0&&(r.preventDefault(),this.viewport.cutSelection());return}if(a&&r.key.toLowerCase()==="v"){this.viewport&&this.viewport.clipboard&&this.viewport.clipboard.length>0&&(r.preventDefault(),this.viewport.pasteClipboard());return}if(r.key==="Delete"||r.key==="Backspace"){this.viewport&&this.viewport.selectedMeshes&&this.viewport.selectedMeshes.size>0&&(r.preventDefault(),this.viewport.deleteSelection());return}})}setPanelMode(e){if(this.activePanelMode=e,e==="edit")this.tabModeEdit&&this.tabModeEdit.classList.add("active"),this.tabModeParams&&this.tabModeParams.classList.remove("active"),this.dynamicParamsContainer&&(this.dynamicParamsContainer.style.display="none"),this.formEditContainer&&(this.formEditContainer.style.display="flex"),this.viewport.setEditMode(!0),this.btnResetParams.title="Reset all form transforms",this.formEditor.render(),this.currentModel&&this.viewport&&this.viewport.formMeshes.size===0&&this.recompileCurrentModel();else if(this.tabModeParams&&this.tabModeParams.classList.add("active"),this.tabModeEdit&&this.tabModeEdit.classList.remove("active"),this.formEditContainer&&(this.formEditContainer.style.display="none"),this.dynamicParamsContainer&&(this.dynamicParamsContainer.style.display="flex"),this.viewport.setEditMode(!1),this.btnResetParams.title="Reset parameters to defaults",this.currentModel&&this.viewport&&this.viewport.formMeshes.size>0){const t=this.viewport.getFormTransforms();!Object.values(t).some(i=>i.dx!==0||i.dy!==0||i.dz!==0||i.rx&&i.rx!==0||i.ry&&i.ry!==0||i.rz&&i.rz!==0||Math.abs(i.sx-1)>.01||Math.abs(i.sy-1)>.01||Math.abs(i.sz-1)>.01)&&this.currentStlBuffer?this.viewport.loadStlBuffer(this.currentStlBuffer):this.recompileCurrentModel()}}async handleGeneratePrompt(){const e=this.promptInput.value.trim();if(!e){this.promptInput.focus();return}if(oh()==="neural"){const o=ah(),a=o==="meshy"?lh():ch();if(!a){alert(`Please configure your ${o==="meshy"?"Meshy.ai":"Tripo3D"} API Key in ⚙ SETUP to generate Neural 3D models.`),this.settingsModal.open();return}this.setAiLoading(!0),this.aiStatus.textContent=`${o.toUpperCase()}: INITIATING...`;try{const l=o==="meshy"?await sx(e,a,u=>this.aiStatus.textContent=u):await rx(e,a,u=>this.aiStatus.textContent=u);this.aiStatus.textContent="LOADING 3D MESH...";const c=await this.viewport.loadGlbUrl(l);this.currentModel={name:e.slice(0,20),isNeural:!0,glbUrl:l},this.currentScadCode=`// Generated via Neural 3D AI (${o.toUpperCase()})
// Prompt: ${e}
// Model URL: ${l}`,this.paramControls.render([],{});const h=document.querySelector(".param-placeholder");h&&(h.textContent=`Neural 3D Mesh (${o.toUpperCase()}):
"${e}"
(No parametric SCAD sliders)`),this.compilationStats.textContent=`NEURAL: ${c.facets.toLocaleString()} FACETS`,this.renderStats.textContent=`SIZE: ${c.dimensions.x}x${c.dimensions.y}x${c.dimensions.z}mm`,this.btnExportStl.disabled=!1,this.btnExportScad.disabled=!1,this.aiStatus.textContent="READY"}catch(l){console.error("Neural 3D error:",l),alert(l.message||"Failed to generate Neural 3D model."),this.aiStatus.textContent="ERROR"}finally{this.setAiLoading(!1)}return}ys(),Ms(),Wi(),Vi(),this.setAiLoading(!0);const n=Date.now();let i="PROMPTING...";this.aiStatus.textContent=i;const r=setInterval(()=>{const o=((Date.now()-n)/1e3).toFixed(1);this.aiStatus.textContent=`${i} (${o}s)`},250);try{const o=await $0(e,h=>{i=h;const u=((Date.now()-n)/1e3).toFixed(1);this.aiStatus.textContent=`${h} (${u}s)`}),a=((Date.now()-n)/1e3).toFixed(1);clearInterval(r),this.currentModel={name:e.slice(0,20),parameters:o.parameters,scad_template:o.scad_template};const l=Ht(o.scad_template);this.formEditor.setForms(l),this.viewport&&this.viewport.clearHistory();const c=mc(o.parameters);this.paramControls.render(o.parameters,c),this.recompileCurrentModel(c),this.aiStatus.textContent=`READY (AI: ${a}s)`}catch(o){clearInterval(r),console.error("Generation error:",o),o.message==="NO_API_KEY"?this.settingsModal.open():alert(o.message||"Failed to generate model."),this.aiStatus.textContent="ERROR"}finally{clearInterval(r),this.setAiLoading(!1)}}setAiLoading(e){const t=this.btnGenerate.querySelector(".btn-text"),n=this.btnGenerate.querySelector(".btn-spinner");this.btnGenerate.disabled=e,e?(t.style.display="none",n.style.display="inline"):(t.style.display="inline",n.style.display="none")}async handleModifyPart(e,t,n){var r,o,a,l,c;if(!this.currentModel||!this.currentModel.scad_template)return;this.partPromptModal.close(!0);const i=(t||e||"Part").toUpperCase();this.showSpinner(`AI: MODIFYING ${i}...`),this.aiStatus.textContent=`PROMPTING ${i}...`;try{const h=(o=(r=this.viewport)==null?void 0:r.formMeshes)==null?void 0:o.get(e),u=h?{cx:Math.round(h.position.x),cy:Math.round(-h.position.z),cz:Math.round(h.position.y)}:{cx:0,cy:0,cz:0},d=new Map;if(this.viewport&&this.viewport.formMeshes)for(const y of this.viewport.formMeshes.values()){const x=(((a=y.userData)==null?void 0:a.formName)||"").toLowerCase().trim(),C=(l=y.userData)==null?void 0:l.formId,T=((c=y.userData)==null?void 0:c.initialPosition)||y.position,R=Math.abs(y.position.x-T.x)>.01||Math.abs(y.position.y-T.y)>.01||Math.abs(y.position.z-T.z)>.01||Math.abs(y.rotation.x)>.01||Math.abs(y.rotation.y)>.01||Math.abs(y.rotation.z)>.01||Math.abs(y.scale.x-1)>.01||Math.abs(y.scale.y-1)>.01||Math.abs(y.scale.z-1)>.01,P={position:y.position.clone(),rotation:y.rotation.clone(),scale:y.scale.clone(),initialPosition:T.clone(),wasExplicitlyMoved:R};C&&d.set(C,P),x&&d.set(x,P)}const f=/\b(move|shift|translate|slide|reposition|offset|relocate|lift|lower|raise)\b/i.test(n);this.activePreservedState={forms:d,promptedTarget:(t||e||"").toLowerCase().trim(),isMovePrompt:f};const g=gc(this.currentModel.scad_template,e),_=await j0({formName:t||e,currentPartCode:g,fullScadTemplate:this.currentModel.scad_template,userPrompt:n,centerPoint:u,onStatusUpdate:y=>{this.showSpinner(y),this.aiStatus.textContent=y}});this.showSpinner("RECOMPILING CSG..."),this.aiStatus.textContent="RECOMPILING CSG...";const m=this.currentModel.scad_template,p=dx(m,e,_.part_scad);this.currentModel.scad_template=p;const M=Ht(p);this.formEditor.setForms(M),this.viewport&&this.viewport.historyManager&&this.viewport.historyManager.push({execute:()=>{this.currentModel.scad_template=p;const y=Ht(p);this.formEditor.setForms(y),this.recompileCurrentModel()},undo:()=>{this.currentModel.scad_template=m;const y=Ht(m);this.formEditor.setForms(y),this.recompileCurrentModel()}}),this.recompileCurrentModel(),this.aiStatus.textContent=`UPDATED: ${i}`}catch(h){console.error("Failed to modify part:",h),this.hideSpinner(),this.aiStatus.textContent="PART MODIFY ERROR",alert(`Failed to modify part "${i}": `+(h.message||String(h)))}}async handleModifyMultipleParts(e,t){var r,o,a,l,c;if(!this.currentModel||!this.currentModel.scad_template)return;this.partPromptModal.close(!0);const n=e.map(h=>(h.name||h.formName||h.formId||"Part").trim()),i=n.join(" & ").toUpperCase();this.showSpinner(`AI: MODIFYING ${i}...`),this.aiStatus.textContent=`PROMPTING ${n.length} ITEMS...`;try{const h=[],u=[];for(const y of e){const x=y.formId,C=y.name||y.formName||x;u.push(C.toLowerCase().trim()),x&&u.push(x.toLowerCase().trim());const T=y.mesh||((o=(r=this.viewport)==null?void 0:r.formMeshes)==null?void 0:o.get(x));let R={cx:0,cy:0,cz:0},P={dx:10,dy:10,dz:10};if(T){const v=new pt().setFromObject(T),I=new A,B=new A;v.getCenter(I),v.getSize(B),R={cx:Math.round(I.x),cy:Math.round(-I.z),cz:Math.round(I.y)},P={dx:Math.round(B.x),dy:Math.round(B.z),dz:Math.round(B.y)}}const S=gc(this.currentModel.scad_template,x);h.push({formId:x,formName:C,currentPartCode:S,center:R,size:P})}const d=new Map;if(this.viewport&&this.viewport.formMeshes)for(const y of this.viewport.formMeshes.values()){const x=(((a=y.userData)==null?void 0:a.formName)||"").toLowerCase().trim(),C=(l=y.userData)==null?void 0:l.formId,T=((c=y.userData)==null?void 0:c.initialPosition)||y.position,R=Math.abs(y.position.x-T.x)>.01||Math.abs(y.position.y-T.y)>.01||Math.abs(y.position.z-T.z)>.01||Math.abs(y.rotation.x)>.01||Math.abs(y.rotation.y)>.01||Math.abs(y.rotation.z)>.01||Math.abs(y.scale.x-1)>.01||Math.abs(y.scale.y-1)>.01||Math.abs(y.scale.z-1)>.01,P={position:y.position.clone(),rotation:y.rotation.clone(),scale:y.scale.clone(),initialPosition:T.clone(),wasExplicitlyMoved:R};C&&d.set(C,P),x&&d.set(x,P)}const f=/\b(move|shift|translate|slide|reposition|offset|relocate|lift|lower|raise)\b/i.test(t);this.activePreservedState={forms:d,promptedTargets:u,isMovePrompt:f};const g=await q0({selectedParts:h,fullScadTemplate:this.currentModel.scad_template,userPrompt:t,onStatusUpdate:y=>{this.showSpinner(y),this.aiStatus.textContent=y}});this.showSpinner("RECOMPILING CSG..."),this.aiStatus.textContent="RECOMPILING CSG...";const _=this.currentModel.scad_template,m=h.map(y=>y.formId||y.formName),p=ux(_,m,g.part_scad);this.currentModel.scad_template=p;const M=Ht(p);this.formEditor.setForms(M),this.viewport&&this.viewport.historyManager&&this.viewport.historyManager.push({execute:()=>{this.currentModel.scad_template=p;const y=Ht(p);this.formEditor.setForms(y),this.recompileCurrentModel()},undo:()=>{this.currentModel.scad_template=_;const y=Ht(_);this.formEditor.setForms(y),this.recompileCurrentModel()}}),this.recompileCurrentModel(),this.aiStatus.textContent=`UPDATED: ${i}`}catch(h){console.error("Failed to modify multiple parts:",h),this.hideSpinner(),this.aiStatus.textContent="PART MODIFY ERROR",alert(`Failed to modify parts "${i}": `+(h.message||String(h)))}}async handleAiTexturize(){if(!this.currentModel){alert("Please generate or load a model first.");return}if(!this.viewport||!this.viewport.formMeshes||this.viewport.formMeshes.size===0){alert("No 3D objects available to texturize.");return}const e=[];this.viewport.formMeshes.forEach((a,l)=>{e.push({formId:l,name:a.userData.formName||l})});const t=this.viewport.selectedMeshes,n=[],i=[];t&&t.size>0&&t.forEach(a=>{const l=a.userData.formId;l&&(i.push(l),n.push({formId:l,name:a.userData.formName||l}))});const r=n.length>0,o=r?`${n.length} SELECTED (${n.map(a=>a.name).join(", ")})`:"WHOLE MODEL";Wi(),Vi();try{this.showSpinner(`AI: TEXTURING ${r?"SELECTION":"ALL"}...`),this.aiStatus.textContent=`TEXTURING: ${o}`;const a=this.promptInput?this.promptInput.value.trim():"",l=await K0({modelName:this.currentModel.name||"Model",modelPrompt:a||this.currentModel.name||"Retro 3D Asset",allParts:e,targetParts:r?n:[],onStatusUpdate:u=>{this.spinnerText.textContent=u,this.aiStatus.textContent=u}});if(!l||!l.textures||Object.keys(l.textures).length===0)throw new Error("AI did not return any texture specifications.");const c=r?i:null,h=this.viewport.applyFormTextures(l.textures,c);if(this.viewport.historyManager){const u={...l.textures};this.viewport.historyManager.push({description:`AI Texture: ${o}`,execute:()=>{this.viewport.applyFormTextures(u,c)},undo:()=>{for(const d of h)d.mesh&&(d.mesh.material=d.material,d.aiTextureSpec?d.mesh.userData.aiTextureSpec=d.aiTextureSpec:delete d.mesh.userData.aiTextureSpec)}})}this.hideSpinner(),this.aiStatus.textContent=`TEXTURED: ${o}`}catch(a){console.error("Failed to generate AI textures:",a),this.hideSpinner(),this.aiStatus.textContent="TEXTURE ERROR",alert("Failed to generate textures: "+(a.message||String(a)))}}recompileCurrentModel(e,t=!1){if(!this.currentModel||!this.currentModel.scad_template)return;const i={fn_res:t||!this.isTurboMode?32:14,...e!==void 0?e:this.paramControls.getValues()},r=this.viewport?this.viewport.getFormTransforms():{};this.currentScadCode=dh(this.currentModel.scad_template,i,r),this.isCompiling&&this.isWorkerReady&&(this.worker.terminate(),this.setupWorker()),this.isCompiling=!0,this.showSpinner(this.isTurboMode?"TURBO CSG...":"HQ CSG..."),this.compileRequestId++;const o=this.compileRequestId,a=hx(this.currentModel.scad_template,i,r);a.length>=2&&this.activePanelMode==="edit"?this.worker.postMessage({type:"COMPILE_PARTS",id:o,parts:a,code:this.currentScadCode}):this.worker.postMessage({type:"COMPILE",id:o,code:this.currentScadCode})}showSpinner(e){this.spinnerText.textContent=e||"COMPILING...",this.viewportSpinner.style.display="flex"}hideSpinner(){this.viewportSpinner.style.display="none"}exportStl(){var r,o,a;if((r=this.currentModel)!=null&&r.isNeural&&this.currentModel.glbUrl){const l=document.createElement("a");l.href=this.currentModel.glbUrl,l.target="_blank",l.download=`${this.sanitizeFilename(this.currentModel.name||"neural_model")}.glb`,l.click();return}if(this.viewport&&this.viewport.formMeshes&&this.viewport.formMeshes.size>0){const c=new px().parse(this.viewport.modelGroup,{binary:!0}),h=new Blob([c],{type:"model/stl"}),u=URL.createObjectURL(h),d=document.createElement("a"),f=`${this.sanitizeFilename(((o=this.currentModel)==null?void 0:o.name)||"pxl3d_model")}.stl`;d.href=u,d.download=f,d.click(),URL.revokeObjectURL(u);return}if(!this.currentStlBuffer)return;const e=new Blob([this.currentStlBuffer],{type:"model/stl"}),t=URL.createObjectURL(e),n=document.createElement("a"),i=`${this.sanitizeFilename(((a=this.currentModel)==null?void 0:a.name)||"pxl3d_model")}.stl`;n.href=t,n.download=i,n.click(),URL.revokeObjectURL(t)}exportScad(){if(!this.currentScadCode)return;const e=new Blob([this.currentScadCode],{type:"text/plain"}),t=URL.createObjectURL(e),n=document.createElement("a"),i=`${this.sanitizeFilename(this.currentModel.name||"pxl3d_model")}.scad`;n.href=t,n.download=i,n.click(),URL.revokeObjectURL(t)}sanitizeFilename(e){return e.toLowerCase().replace(/[^a-z0-9_-]/g,"_").slice(0,30)}}window.addEventListener("DOMContentLoaded",()=>{new mx});
