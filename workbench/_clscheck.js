// 验收：词归类纠偏 —— 热搜削词属性 / 研究词按词典分发到 卖点/人群/场景 对应池
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;globalThis.__PF=poolFor;globalThis.__CLS=classifyWord;globalThis.__HA=hotAttr;globalThis.__RC=renderChips;\n'+src.slice(k);

const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},options:[],children:[],files:[],
  classList:{_s:new Set(),add(c){e.classList._s.add(c);},remove(c){e.classList._s.delete(c);},contains(c){return e.classList._s.has(c);}},
  appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},
  setAttribute(a,v){e['_attr_'+a]=v;},getAttribute(a){return e['_attr_'+a]==null?null:e['_attr_'+a];}}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''},isSecureContext:true};
Object.defineProperty(global,'navigator',{value:{clipboard:{writeText:()=>Promise.resolve()}},configurable:true,writable:true});
global.alert=()=>{};
el('cat2').value='D'; el('cat3').value='liquid'; el('month').value='10'; el('brand').value='蓝月亮';
new Function(src)();
const state=globalThis.__ST;
const CLS=globalThis.__CLS;

let bad=0; const fail=m=>{console.log('   ❌ '+m);bad++;};

/* 模拟用户截图的错位场景：
   - 场景段故意写了衣物类型（内衣裤/真丝/床单被套/宝宝衣物）→ 应挪去卖点池
   - 功能点段写了人群词（儿童）→ 应挪去人群池
   - 热搜词削出「学生宿舍」→ 应进场景池，不进卖点池 */
const RESEARCH=`功能点：去血渍 去汗味 浓缩 预涂 持久留香 深层洁净 真丝 毛类 内衣裤 儿童 除螨
人群：学生 家庭主妇 婴幼儿 住宿群体 差旅人士 贴身衣物用户
场景：宿舍 出差 机洗 家用 内衣裤 真丝 床单被套 宝宝衣物 学生宿舍
热搜词：洗衣液学生宿舍专用 洗衣液手洗专用 洗衣液去血渍 婴儿衣物洗衣液 洗衣液真丝羊毛`;
el('research').value=RESEARCH; globalThis.__DP();
el('skus').value='蓝月亮洗衣液500g瓶\n洗衣液1kg瓶\n洗衣液500g*2瓶';
el('specAll').value='500g'; el('hero').value='0';

console.log('===== 1. classifyWord 单元判定 =====');
const cases=[['学生宿舍','scene'],['手洗专用','sell'],['真丝','sell'],['内衣裤','sell'],['床单被套','sell'],
  ['宝宝衣物','sell'],['贴身衣物用户','crowd'],['住宿群体','crowd'],['差旅人士','crowd'],
  ['去血渍','sell'],['学生','crowd'],['宿舍','scene'],['家用','scene'],['浓缩','sell'],['婴儿衣物','sell']];
cases.forEach(([w,exp])=>{
  const got=CLS(w);
  console.log('  '+w+' → '+(got||'null')+(got===exp?' ✅':' ❌ 应为 '+exp));
  if(got!==exp) fail('classifyWord('+w+')='+got+'，应为 '+exp);
});

console.log('\n===== 2. 池子归位（截图中的错位词）=====');
const sell=globalThis.__PF('sell'), crowd=globalThis.__PF('crowd'), scene=globalThis.__PF('scene');
console.log('  卖点池('+sell.length+'):', sell.join(' '));
console.log('  人群池('+crowd.length+'):', crowd.join(' '));
console.log('  场景池('+scene.length+'):', scene.join(' '));
const inP=(w,p)=>p.indexOf(w)>-1;
/* 「学生宿舍」不得在卖点池（可来自研究场景段或热搜削词），应在场景池 */
if(inP('学生宿舍',sell)) fail('「学生宿舍」仍在卖点池');
if(!inP('学生宿舍',scene) && !inP('宿舍',scene)) fail('「学生宿舍/宿舍」不在场景池');
/* 衣物/材质类型不得在场景池，应在卖点池 */
['内衣裤','真丝','床单被套','宝宝衣物'].forEach(w=>{
  if(inP(w,scene)) fail('「'+w+'」仍在场景池（应归卖点池）');
  if(!inP(w,sell)) fail('「'+w+'」不在卖点池');
});
/* 人群词应在人群池 */
['学生','家庭主妇','婴幼儿','住宿群体','差旅人士','贴身衣物用户'].forEach(w=>{
  if(!inP(w,crowd)) fail('「'+w+'」不在人群池');
  if(inP(w,sell)||inP(w,scene)) fail('「'+w+'」混进了别的池');
});
/* 功能点段的人群词被挪走 */
if(inP('儿童',sell)) fail('「儿童」仍在卖点池（应归人群池）');

console.log('\n===== 3. 热搜削词属性的分发 =====');
const ha=globalThis.__HA();
console.log('  热搜削词输出:', ha.join(' '));
const haCls=ha.map(w=>CLS(w)||'sell');
console.log('  归类:', ha.map((w,i)=>w+'→'+haCls[i]).join(' '));
/* 每个削词都应进它归属的池 */
ha.forEach((w,i)=>{
  const t=haCls[i];
  const p=t==='sell'?sell:t==='crowd'?crowd:scene;
  if(!inP(w,p)) fail('热搜削词「'+w+'」归类 '+t+' 但不在对应池');
});

console.log('\n===== 4. 生成仍合法 =====');
globalThis.__RUN();
const L=globalThis.__LAST();
const clen=src.match(/function clen[\s\S]*?\n}/)?null:null;
console.log('  商品标题:', L.titles.map(t=>t.text).join(' | '));
console.log('  SKU:', L.skus.map(s=>s.title).join(' | '));
if(!L.skus.every(s=>s.title.trim().length>3)) fail('有空 SKU 标题');
if(L.skus.some(s=>(s.alts||[]).length<3)) console.log('   ⚠️ 备选不足 3 条:', L.skus.map(s=>(s.alts||[]).length).join(','));
/* 商品标题的卖点位不得混入人群/场景词（备选 A 路用场景词是合法的，不查备选） */
const badSell=(L.sell||[]).filter(w=>{ const t=CLS(w); return t && t!=='sell'; });
console.log('  商品标题卖点词:', (L.sell||[]).join(' '));
if(badSell.length) fail('商品标题卖点位混入非卖点词: '+badSell.join(','));
const badCrowd=(L.crowd||[]).filter(w=>{ const t=CLS(w); return t && t!=='crowd'; });
if(badCrowd.length) fail('商品标题人群位混入非人群词: '+badCrowd.join(','));

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
