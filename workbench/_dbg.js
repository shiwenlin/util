const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
src=src.replace('if(!tokOK(w)) return;',
 'if(!tokOK(w)){console.log("REJ",JSON.stringify(w),"len="+w.length,"BAD="+BADTOK.test(w),"dig="+String(/^[\d\W_]+$/.test(w)),"cn="+String(/[\u4e00-\u9fa5]/.test(w)));return;}');
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__PR=parseResearch;\n'+src.slice(k);
const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',style:{},options:[],children:[],files:[],classList:{add(){},remove(){}},appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},setAttribute(){},getAttribute:()=>null}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''}};
global.navigator={clipboard:{writeText:()=>Promise.resolve()}};
global.alert=()=>{};
store['cat2']=el('cat2');store['cat2'].value='D';
store['cat3']=el('cat3');store['cat3'].value='liquid';
store['month']=el('month');store['month'].value='10';
store['skus']=el('skus');store['skus'].value='500g单瓶';
new Function(src)();
globalThis.__PR('功能点：留香 温和 去污渍');
