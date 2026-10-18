// 验收：双栏固定 + 可拖拽调宽 + 回顶按钮 + SKU清单/规格概览 清空预填
const fs=require('fs');
const html=fs.readFileSync('个护家清标题工作台.html','utf8');
let bad=0; const fail=m=>{console.log('   ❌ '+m);bad++;};
const ok=m=>console.log('   ✅ '+m);

console.log('===== 1. 结构：双栏容器 =====');
['id="paneL"','id="paneR"','id="splitter"','id="toTop"'].forEach(t=>{
  if(html.indexOf(t)<0) fail('缺少 '+t); else ok(t+' 存在');
});
// grid 必须是三块：左 / 分隔条 / 右，且顺序正确
const gi=html.indexOf('<div class="grid">');
const seg=html.slice(gi, gi+8000);
const iL=seg.indexOf('id="paneL"'), iS=seg.indexOf('id="splitter"'), iR=seg.indexOf('id="paneR"');
if(!(iL>-1&&iS>iL&&iR>iS)) fail('grid 内顺序应为 paneL → splitter → paneR'); else ok('grid 顺序 paneL → splitter → paneR');

console.log('\n===== 2. CSS：固定 + 独立滚动 + 可拉伸 =====');
const cssNeeds=[
  ['#paneL','position:sticky'],
  ['#paneR','position:sticky'],
  ['#paneL','max-height:calc(100vh - 40px)'],
  ['#paneR','max-height:calc(100vh - 40px)'],
  ['#paneL','overflow-y:auto'],
  ['#paneR','overflow-y:auto'],
];
cssNeeds.forEach(([sel,decl])=>{
  const i=html.indexOf(sel+'{');
  if(i<0) return fail('缺少 '+sel);
  const block=html.slice(i, html.indexOf('}',i));
  if(block.indexOf(decl)<0) fail(sel+' 缺 '+decl); else ok(sel+' → '+decl);
});
if(/#paneL\{[^}]*var\(--lw/.test(html)) ok('左栏宽度由 --lw 变量驱动'); else fail('左栏宽度未绑定 --lw');
if(/#splitter\{[^}]*cursor:col-resize/.test(html)) ok('分隔条 cursor:col-resize'); else fail('分隔条不可拖拽');
if(/#toTop\{[^}]*position:fixed/.test(html)) ok('回顶按钮 position:fixed'); else fail('回顶按钮未固定');
if(/#toTop\{[^}]*bottom:24px/.test(html)&&/#toTop\{[^}]*right:24px/.test(html)) ok('回顶按钮在右下角'); else fail('回顶按钮不在右下角');
const mi=html.indexOf('@media(max-width:1000px)');
const mblock=mi<0?'':html.slice(mi, mi+300);
if(mblock.indexOf('position:static')>-1 && mblock.indexOf('#splitter{display:none}')>-1) ok('窄屏降级为单栏（取消 sticky / 隐藏分隔条）'); else fail('窄屏未降级');

console.log('\n===== 3. 预填值清空 =====');
const ta=html.match(/<textarea id="skus"[^>]*>([\s\S]*?)<\/textarea>/);
if(!ta) fail('找不到 #skus');
else if(ta[1].trim()==='') ok('SKU 清单 textarea 无预填值');
else fail('SKU 清单仍有预填值：'+JSON.stringify(ta[1].slice(0,30)));
const spec=html.match(/<input type="text" id="specAll"[^>]*>/);
if(!spec) fail('找不到 #specAll');
else if(/placeholder="例：500ml\*2瓶"/.test(spec[0])) ok('规格概览 placeholder = 例：500ml*2瓶');
else fail('规格概览 placeholder 不对：'+spec[0]);
if(!/规格概览[^<]*例：/.test(html)) ok('示例只在 placeholder，label 不重复'); else fail('label 与 placeholder 示例重复');

console.log('\n===== 4. 交互脚本（回顶 + 拖拽）=====');
const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const ui=blocks[blocks.length-1];
if(ui.indexOf('splitter')<0&&ui.indexOf('toTop')<0) fail('末尾交互脚本未包含布局逻辑');
else ok('末尾交互脚本含 splitter + toTop 逻辑');

// ---- 桩 ----
const vars={}; const store={};
const gridRect={left:20,width:1200,getBoundingClientRect(){return gridRect;}};
function mk(id){ if(store[id])return store[id];
  const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},classList:{_s:new Set(),
    add(c){e.classList._s.add(c);},remove(c){e.classList._s.delete(c);},contains(c){return e.classList._s.has(c);}},
    appendChild(){},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(t,f){(e._h=e._h||{})[t]=f;},
    focus(){},click(){if(e._h&&e._h.click)e._h.click();},scrollTo(o){e.scrollTop=(o&&o.top)||0;},
    getBoundingClientRect(){return gridRect;},scrollTop:0};
  store[id]=e; return e; }
const docHandlers={}, winHandlers={};
global.document={getElementById:mk,createElement:()=>mk('tmp'+Math.random()),
  querySelector:s=>{ if(String(s)==='.grid') return gridRect; return null; },
  querySelectorAll:()=>[],addEventListener:(t,f)=>{docHandlers[t]=f;},
  documentElement:{style:{setProperty:(k,v)=>{vars[k]=v;},getPropertyValue:k=>vars[k]||''}},
  body:{classList:{_s:new Set(),add(c){global.document.body.classList._s.add(c);},remove(c){global.document.body.classList._s.delete(c);},contains(c){return global.document.body.classList._s.has(c);}},appendChild(){},style:{}}};
global.window={addEventListener:(t,f)=>{winHandlers[t]=f;},location:{href:''},isSecureContext:true,pageYOffset:0,scrollTo(o){global.window.pageYOffset=(o&&o.top)||0;}};
Object.defineProperty(global,'navigator',{value:{clipboard:{writeText:()=>Promise.resolve()}},configurable:true,writable:true});
const LS={}; global.localStorage={getItem:k=>LS[k]==null?null:LS[k],setItem:(k,v)=>{LS[k]=String(v);}};
global.getComputedStyle=()=>({getPropertyValue:k=>vars[k]||''});
global.alert=()=>{};

try{ new Function(ui)(); ok('交互脚本执行无报错'); }catch(e){ fail('交互脚本执行报错：'+e.message); }

const L=mk('paneL'), R=mk('paneR'), SP=mk('splitter'), TT=mk('toTop');
// 回顶：滚下去 → 出现；点击 → 两栏都归零
L.scrollTop=400; R.scrollTop=200; winHandlers.scroll&&winHandlers.scroll();
if(TT.classList.contains('on')) ok('滚动后回顶按钮显示'); else fail('滚动后回顶按钮未显示');
TT.click();
if(L.scrollTop===0&&R.scrollTop===0) ok('点击回顶：左/右栏均回到顶部'); else fail('点击回顶未归零，L='+L.scrollTop+' R='+R.scrollTop);
L.scrollTop=0; R.scrollTop=0; winHandlers.scroll&&winHandlers.scroll();
if(!TT.classList.contains('on')) ok('回到顶部后按钮自动隐藏'); else fail('按钮未自动隐藏');

// 拖拽：mousedown → mousemove 到 x=600 → 左栏宽度应为 580（clientX - grid.left）
if(SP._h&&SP._h.mousedown){
  SP._h.mousedown({preventDefault(){}});
  docHandlers.mousemove&&docHandlers.mousemove({clientX:600});
  const w=parseInt(vars['--lw'],10);
  if(w===580) ok('拖拽调宽生效：--lw = '+w+'px（clientX 600 − grid.left 20）'); else fail('拖拽宽度不对：'+w);
  docHandlers.mouseup&&docHandlers.mouseup();
  if(LS['wb_lw']&&parseInt(LS['wb_lw'],10)===580) ok('宽度写入 localStorage（下次打开保持）'); else fail('宽度未持久化：'+LS['wb_lw']);
  if(!global.document.body.classList.contains('rs')) ok('拖拽结束已解除 rs 态'); else fail('rs 态未解除');
}else fail('splitter 未绑定 mousedown');

// 边界：拖到极左 / 极右应被夹紧
SP._h.mousedown({preventDefault(){}});
docHandlers.mousemove({clientX:-500});
const wMin=parseInt(vars['--lw'],10);
docHandlers.mousemove({clientX:99999});
const wMax=parseInt(vars['--lw'],10);
docHandlers.mouseup();
if(wMin>=280) ok('拖到最左夹紧为 '+wMin+'px（≥280）'); else fail('左边界失效：'+wMin);
if(wMax<=760) ok('拖到最右夹紧为 '+wMax+'px（≤760）'); else fail('右边界失效：'+wMax);

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
process.exit(bad?1:0);
