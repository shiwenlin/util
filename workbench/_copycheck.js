// 验收：一键复制改动后的 DOM 结构 —— 主推可编辑区不含备选文字 / 复制钩子齐全
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__PR=parseResearch;globalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;globalThis.__CP=cpText;globalThis.__CLEN=clen;\n'+src.slice(k);
// 记录所有被写入剪贴板的内容
const clip=[];
const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},options:[],children:[],files:[],
  classList:{_s:new Set(),add(c){e.classList._s.add(c);},remove(c){e.classList._s.delete(c);},contains(c){return e.classList._s.has(c);}},
  appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},
  setAttribute(a,v){e['_attr_'+a]=v;},getAttribute(a){return e['_attr_'+a]==null?null:e['_attr_'+a];}}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''},isSecureContext:true};
// Node22 内置只读 navigator，必须用 defineProperty 覆盖
Object.defineProperty(global,'navigator',{value:{clipboard:{writeText:t=>{clip.push(t);return Promise.resolve();}}},configurable:true,writable:true});
global.alert=()=>{};
el('cat2').value='A2'; el('cat3').value='handwash'; el('month').value='10'; el('brand').value='蓝月亮';
new Function(src)();
const state=globalThis.__ST, run=globalThis.__RUN;

const RESEARCH=`功能点：芦荟 泡沫 抑菌 免洗 无香 滋润 清爽 野菊花
规格：500g 255g 50g 5kg 补充装
人群：儿童 成人 母婴 全家
场景：家用 厨房 卫生间 便携 旅行
热搜词：洗手液家用按压瓶 洗手液补充装大瓶 免洗洗手液便携 儿童洗手液泡沫 抑菌洗手液芦荟 洗手液不伤手滋润 野菊花洗手液`;
el('cat2').value='A2'; el('cat3').value='handwash'; el('month').value='10'; el('brand').value='蓝月亮';
el('research').value=RESEARCH; globalThis.__DP();
el('strictSrc').checked=true;
el('skus').value='芦荟单瓶500g\n泡沫抑菌255g\n500ml免洗抑菌无香\n5kg大桶装\n儿童款500g'.split('\\n').join('\n');
el('specAll').value='500g'; el('hero').value='0';
run();
const L=globalThis.__LAST();
let bad=0;
const fail=m=>{console.log('   ❌ '+m);bad++;};

console.log('===== 1. 商品标题区：选用按钮 =====');
const th=store['titles'].innerHTML||'';
console.log('  含「选用并复制」按钮:', /选用并复制/.test(th)?'✅':'❌'); if(!/选用并复制/.test(th))fail('缺少选用并复制');
console.log('  按钮带 data-i:', (th.match(/data-i="\d+"/g)||[]).length+' 个');
console.log('  标题文字点击复制已绑定:', /点击复制这条标题/.test(src)?'✅':'❌');
if(!/点击复制这条标题/.test(src))fail('未绑定 .val 点击复制');

console.log('\n===== 2. SKU 区：主推 / 备选 结构分离 =====');
const sk=store['skuOut'].innerHTML||'';
const svs=[...sk.matchAll(/<div class="sv mono edit"[^>]*>([\s\S]*?)<\/div>/g)].map(m=>m[1]);
const cpbs=[...sk.matchAll(/<span class="cpb" data-i="(\d+)"[^>]*>/g)].map(m=>m[1]);
const chips=[...sk.matchAll(/<span class="altchip[^"]*" data-i="(\d+)" data-a="(\d+)"/g)].map(m=>m[1]+'-'+m[2]);
console.log('  主推可编辑区 .sv:', svs.length, '个 / SKU', L.skus.length);
console.log('  「复制」按钮:', cpbs.length, '个');
console.log('  备选 chip:', chips.length, '个');
if(svs.length!==L.skus.length) fail('主推区数量与 SKU 数不符');
if(cpbs.length!==L.skus.length) fail('复制按钮数量与 SKU 数不符');
if(chips.length!==L.skus.length*3) fail('备选 chip 应为每 SKU 3 条，实际 '+chips.length);

// 核心：主推区文本必须等于 s.title，且不能混入备选/标记文字
console.log('\n===== 3. 主推区是否被备选/标记文字污染（旧 bug 复检）=====');
L.skus.forEach((s,i)=>{
  const t=svs[i];
  const clean=t.replace(/<[^>]+>/g,'').trim();
  const ok = clean===s.title;
  console.log('  '+s.rank+' '+s.raw+' → ['+clean+'] '+(ok?'✅':'❌ 主推='+s.title));
  if(!ok) fail('SKU'+s.rank+' 主推区文本与数据不一致');
  if(/altchip|althd|备选/.test(t)) fail('SKU'+s.rank+' 主推区混入了备选区文字');
  if(/矛盾|凭空规格|内置词|借用词/.test(t)) fail('SKU'+s.rank+' 主推区混入了合规标记文字');
});

// 备选区在可编辑区之外
console.log('\n===== 4. 备选区不在 contenteditable 内 =====');
const ceInAlt=/contenteditable="true"[^>]*>(?:(?!<\/div>)[\s\S])*?althd/.test(sk);
console.log('  备选被可编辑区包住:', ceInAlt?'❌ 是':'✅ 否'); if(ceInAlt)fail('备选仍在 contenteditable 内');
console.log('  备选提示文案:', (sk.match(/备选（[^）]*）/g)||['无'])[0]);

console.log('\n===== 5. 复制链路（clipboard 桩）=====');
console.log('  toast 容器存在:', typeof document.getElementById('toast')==='object'?'✅':'❌');
// 直接调 cpText（已在闭包内，通过模拟点击不可行，改为断言函数存在且可写入）
console.log('  剪贴板写入记录:', clip.length, '条（render 阶段不自动复制 = 正常）');
if(clip.length) fail('render 时不该自动复制');
// 真调一次 cpText（模拟点复制）
const cp=globalThis.__CP, clen=globalThis.__CLEN;
cp(L.skus[0].title,null); cp('  '+L.titles[0].text+'  ',null);
console.log('  点复制后写入:', JSON.stringify(clip));
if(clip.length!==2) fail('cpText 未写入剪贴板');
if(clip[0]!==L.skus[0].title) fail('复制内容被改动: '+clip[0]);
if(clip[1]!==L.titles[0].text) fail('复制未去掉首尾空白: '+clip[1]);
// flash 在 Promise 微任务里，异步等一下再断言
setTimeout(function(){
  console.log('  toast 文案:', (store['toast'].textContent||'').slice(0,42)+'…');
  console.log('  toast 已显示:', store['toast'].classList.contains('on')?'✅':'❌');
  if(!store['toast'].classList.contains('on')) fail('toast 未弹出');
  finish();
},20);

function finish(){
console.log('\n===== 6. 导出前取值路径 =====');
console.log('  syncEdits 选择器:', /#skuOut \.sv\.edit/.test(src)?'✅ 已改为 .sv.edit':'❌ 仍是 td.edit');
if(!/#skuOut \.sv\.edit/.test(src)) fail('syncEdits 未改');
console.log('  oninput 选择器:', /querySelectorAll\("\.sv\.edit"\)/.test(src)?'✅':'❌');
if(!/querySelectorAll\("\.sv\.edit"\)/.test(src)) fail('oninput 未改');

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
}
