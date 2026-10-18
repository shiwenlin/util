// 验收：词池硬上限 20 + 按搜索价值排序（超出的直接舍弃，不进标题/SKU/备选）
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;globalThis.__BW=blockWord;globalThis.__UB=unblockWord;globalThis.__PF=poolFor;globalThis.__RC=renderChips;globalThis.__HA=hotAttr;globalThis.__CLEN=clen;globalThis.__CLS=classifyWord;\n'+src.slice(k);

const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},options:[],children:[],files:[],
  classList:{_s:new Set(),add(c){e.classList._s.add(c);},remove(c){e.classList._s.delete(c);},contains(c){return e.classList._s.has(c);}},
  appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},
  setAttribute(a,v){e['_attr_'+a]=v;},getAttribute(a){return e['_attr_'+a]==null?null:e['_attr_'+a];}}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''},isSecureContext:true};
Object.defineProperty(global,'navigator',{value:{clipboard:{writeText:()=>Promise.resolve()}},configurable:true,writable:true});
global.alert=()=>{};
el('cat2').value='A2'; el('cat3').value='handwash'; el('month').value='10'; el('brand').value='蓝月亮';
new Function(src)();
const state=globalThis.__ST;

// 故意塞一大段研究文本，让词池远超 20，才能验「舍弃」
const RESEARCH=`功能点：芦荟 泡沫 抑菌 免洗 无香 滋润 清爽 野菊花 不伤手 易冲洗 氨基酸 温和 柠檬 薰衣草 植萃 甘油 保湿 补水 留香 深层 洁净 去油 呵护 修护 天然 浓缩 食品级 不干手 不紧绷 无残留 按压 补充装 替换装 便携 旅行装 家庭装 大桶 囤货 实惠 经济 独立包装 小包装
人群：儿童 成人 母婴 全家 学生 婴儿 男士 女士 老人 孕妇 敏感肌 宠物家庭
场景：家用 厨房 卫生间 便携 旅行 办公室 宿舍 户外 车载 衣柜 冰箱 阳台
热搜词：洗手液家用按压瓶 免洗洗手液便携 儿童洗手液泡沫 抑菌洗手液芦荟 洗手液不伤手滋润 野菊花洗手液 洗手液办公室 洗手液学生宿舍`;
el('research').value=RESEARCH; globalThis.__DP();
el('skus').value='芦荟单瓶500g\n泡沫抑菌255g\n500ml免洗抑菌无香\n5kg大桶装\n儿童款500g\n柠檬清爽500ml\n薰衣草滋润255g';
el('specAll').value='500g'; el('hero').value='0';
globalThis.__RUN();

let bad=0; const fail=m=>{console.log('   ❌ '+m);bad++;};

console.log('===== 1. 词池规模：硬上限 20 =====');
['sell','crowd','scene'].forEach(kk=>{
  const p=globalThis.__PF(kk), raw=(state.poolRaw||{})[kk], cut=(state.poolCut||{})[kk];
  console.log('  '+kk+': 真实 '+raw+' → 保留 '+p.length+'，舍弃 '+cut+
    (p.length<=20?' ✅':' ❌ 超过 20'));
  if(p.length>20) fail(kk+' 池子 '+p.length+' > 20');
});

console.log('\n===== 2. 排序：有真实搜索量的排在前面 =====');
const srcKeep=(state.poolSrc||{}).sell||[];
const head=srcKeep.slice(0,8).map(x=>x.s+':'+x.w);
console.log('  前 8 位:', head.join('  '));
const firstHot=srcKeep.findIndex(x=>x.s==='hot');
const firstDict=srcKeep.findIndex(x=>x.s==='dict');
console.log('  首个热搜词位置:', firstHot, '（应靠前）', firstHot>=0&&firstHot<8?'✅':'❌');
if(!(firstHot>=0&&firstHot<8)) fail('热搜词没排进前 8（排序不是按搜索价值）');
console.log('  首个内置通用词位置:', firstDict, '（应排在热搜/自带/研究之后）', firstDict<0||firstDict>=firstHot?'✅':'❌');
if(firstDict>=0&&firstDict<firstHot) fail('内置通用词排到了热搜词前面');
console.log('  热搜词已削核心词:', JSON.stringify(globalThis.__HA().slice(0,6)),
  globalThis.__HA().every(w=>w.indexOf('洗手液')<0)?'✅ 无「洗手液」残留':'❌ 仍带核心词');
if(!globalThis.__HA().every(w=>w.indexOf('洗手液')<0)) fail('热搜词没削掉核心词');

console.log('\n===== 3. 被舍弃的词：不出现在商品标题 / SKU / 备选 =====');
const L=globalThis.__LAST();
// 找出被舍弃的词 = 全量来源里没进 keep 的
function allWords(kind){
  const c=L.cat; const base=kind==='sell'?c.sell:kind==='crowd'?c.crowd:c.scene;
  let a=[];
  if(kind==='sell') a=a.concat(globalThis.__HA(), state.autoSell||[]);
  a=a.concat((state.res&&state.res[kind])||[], base);
  return Array.from(new Set(a));
}
const keepSell=new Set(globalThis.__PF('sell'));
let dropped=allWords('sell').filter(w=>!keepSell.has(w));
/* v7.5 归类纠偏后：classify 到人群/场景池的词不算「舍弃」（它们归位了，由对应池合法使用） */
const CLS=globalThis.__CLS;
const misclassified=dropped.filter(w=>{ const t=CLS(w); return t && t!=='sell'; });
dropped=dropped.filter(w=>{ const t=CLS(w); return !t || t==='sell'; });
console.log('  归位到人群/场景池的词（不算舍弃）:', misclassified.join(' ')||'无');
console.log('  真正舍弃词数:', dropped.length, '（例：'+dropped.slice(0,10).join(' ')+'）');
if(!dropped.length) fail('没有舍弃任何词，测不到截断效果');
/* 两类词允许出现在产出里，不算泄漏：
   ① 用户已勾选的词（vals）② SKU 规格名自带的词（该 SKU 真实具备的属性，真实性优先） */
const keepOK=new Set([].concat(state.vals.sell||[]));
L.skus.forEach(s=>{ const raw=s.raw||s.spec||''; dropped.forEach(w=>{ if(raw.indexOf(w)>-1) keepOK.add(w); }); });
const chk=dropped.filter(w=>!keepOK.has(w));
console.log('  允许出现的（已勾选 / SKU 自带）: '+dropped.filter(w=>keepOK.has(w)).join(' ')||'无');
const allTitleTxt=L.titles.map(t=>t.text).join('|')+
  '|'+L.skus.map(s=>s.title+'|'+(s.alts||[]).map(a=>a.title).join('|')).join('|');
const leaked=chk.filter(w=>allTitleTxt.indexOf(w)>-1);
console.log('  漏进标题/SKU/备选的舍弃词:', leaked.length, leaked.length?('❌ '+leaked.join(',')):'✅ 0 个');
if(leaked.length) fail('被舍弃的词仍出现在产出里: '+leaked.join(','));

console.log('\n===== 4. 产出仍然合法（不空 / 不超字数）=====');
const clen=globalThis.__CLEN;
const tlen=L.titles.map(t=>clen(t.text));
console.log('  商品标题:', L.titles.length, '条，长度', JSON.stringify(tlen),
  tlen.every(x=>x<=60)?'✅ 均 ≤60':'❌ 有超 60 的');
if(!tlen.every(x=>x<=60)) fail('商品标题超 60 字符');
console.log('  SKU 主推 ≤30 字符:', L.skus.every(s=>s.len<=30)?'✅':'❌');
if(!L.skus.every(s=>s.len<=30)) fail('有 SKU 标题超 30 字符');
console.log('  SKU 标题非空:', L.skus.every(s=>s.title.trim().length>3)?'✅':'❌');
if(!L.skus.every(s=>s.title.trim().length>3)) fail('有空/过短 SKU 标题');
console.log('  备选 ≥3 条的 SKU:', L.skus.filter(s=>(s.alts||[]).length>=3).length+'/'+L.skus.length);
if(L.skus.some(s=>(s.alts||[]).length<3)) console.log('   ⚠️ 池子变小后有 SKU 备选不足 3 条（可接受，报告里会提示补词）');

console.log('\n===== 5. 删除仍然「只减不增」（不因舍弃而补位）=====');
let prev=globalThis.__PF('sell').slice();
for(let n=0;n<3;n++){
  const v=prev[0];
  globalThis.__BW('sell',v);
  const now=globalThis.__PF('sell');
  const added=now.filter(w=>prev.indexOf(w)<0);
  console.log('  删「'+v+'」→ '+prev.length+' → '+now.length+
    (now.length===prev.length-1?' ✅':' ❌')+'，新词 '+(added.length?('❌'+added.join(',')):'✅0'));
  if(now.length!==prev.length-1) fail('删后数量不对');
  if(added.length) fail('删后有新词补位: '+added.join(','));
  prev=now.slice();
}
prev.forEach(()=>{});
(state.blocked.sell||[]).slice().forEach(w=>globalThis.__UB('sell',w));
console.log('  全部恢复 →', globalThis.__PF('sell').length, '条');

console.log('\n===== 6. 计数文案 =====');
globalThis.__RC();
console.log('  sellCnt:', store['sellCnt'].textContent);
console.log('  含「舍弃」字样:', /舍弃/.test(store['sellCnt'].textContent)?'✅':'❌');
if(!/舍弃/.test(store['sellCnt'].textContent)) fail('计数没提示舍弃了多少');

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
