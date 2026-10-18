// 验收：删掉的词不「腾位子」—— 池子只减不增，不会越删越多
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;globalThis.__BW=blockWord;globalThis.__UB=unblockWord;globalThis.__PF=poolFor;globalThis.__RC=renderChips;\n'+src.slice(k);

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

const RESEARCH=`功能点：芦荟 泡沫 抑菌 免洗 无香 滋润 清爽 野菊花 不伤手 易冲洗 氨基酸 温和
人群：儿童 成人 母婴 全家 学生 婴儿
场景：家用 厨房 卫生间 便携 旅行 办公室 宿舍 户外
热搜词：洗手液家用按压瓶 免洗洗手液便携 儿童洗手液泡沫 抑菌洗手液芦荟 洗手液不伤手滋润 野菊花洗手液 洗手液办公室 洗手液学生宿舍`;
el('research').value=RESEARCH; globalThis.__DP();
el('skus').value='芦荟单瓶500g\n泡沫抑菌255g\n500ml免洗抑菌无香\n5kg大桶装\n儿童款500g';
el('specAll').value='500g'; el('hero').value='0';

let bad=0; const fail=m=>{console.log('   ❌ '+m);bad++;};

// chip 区快照（children 会累积，测前清空）
function chipsOf(kind){
  const id='c'+(kind==='sell'?'Sell':kind==='crowd'?'Crowd':'Scene');
  store[id].children.length=0;
  globalThis.__RC();
  return store[id].children.map(c=>c.className);
}

console.log('===== 词池规模 =====');
['sell','crowd','scene'].forEach(kk=>{
  console.log('  '+kk+': 展示 '+globalThis.__PF(kk).length+' 条 / 真实总数 '+(state.poolRaw||{})[kk]);
});

console.log('\n===== 连删 5 个卖点，看池子是否「只减不增」=====');
const start=globalThis.__PF('sell').slice();
console.log('  初始展示:', start.length, '条');
let prev=start.slice();
for(let n=0;n<5;n++){
  const victim=prev[0];
  globalThis.__BW('sell',victim);
  const now=globalThis.__PF('sell');
  const added=now.filter(w=>prev.indexOf(w)<0);
  const gone=now.length===prev.length-1;
  console.log('  删「'+victim+'」→ 剩 '+now.length+' 条'+
    (gone?' ✅少1':' ❌应为 '+(prev.length-1))+
    '，新冒出来的词: '+(added.length?('❌ '+added.join(',')):'✅ 0 个'));
  if(!gone) fail('删后池子数量不对（'+now.length+' vs '+(prev.length-1)+'）');
  if(added.length) fail('删后出现未展示过的新词: '+added.join(','));
  prev=now.slice();
}
console.log('  累计：'+start.length+' → '+prev.length+' 条（应正好少 5）');
if(prev.length!==start.length-5) fail('删 5 个后应为 '+(start.length-5)+'，实际 '+prev.length);

console.log('\n===== 已删区是否折叠（默认只占 1 个入口）=====');
let cls=chipsOf('sell');
const delhd=cls.filter(c=>c.indexOf('delhd')>-1).length;
const delchip=cls.filter(c=>/\bdel\b/.test(c)).length;
console.log('  折叠入口 delhd:', delhd, '个', delhd===1?'✅':'❌');
if(delhd!==1) fail('折叠入口应只有 1 个');
console.log('  未展开时已删 chip:', delchip, '个', delchip===0?'✅ 折叠了':'❌ 仍在撑长');
if(delchip!==0) fail('未展开时不该列出已删词');
state.blockedShow=true;
cls=chipsOf('sell');
const delchip2=cls.filter(c=>/\bdel\b/.test(c)).length;
const undel=cls.filter(c=>c.indexOf('undel')>-1).length;
console.log('  展开后已删 chip:', delchip2, '个（应为 5）', delchip2===5?'✅':'❌');
if(delchip2!==5) fail('展开后应列出 5 个已删词，实际 '+delchip2);
console.log('  全部恢复按钮:', undel, '个', undel===1?'✅':'❌');
if(undel!==1) fail('缺少全部恢复');
state.blockedShow=false;

console.log('\n===== 可见 chip 总数：删 5 个后应比删前少 =====');
// 删前（清空屏蔽）：可见 = 池子 20/30 + 0
globalThis.__PF('sell').slice().forEach(w=>{}); // noop
const bl=state.blocked.sell.slice();
bl.forEach(w=>globalThis.__UB('sell',w));
const visBefore=chipsOf('sell').filter(c=>c.indexOf('delhd')<0).length;
globalThis.__PF('sell').slice(0,5).forEach(w=>globalThis.__BW('sell',w));
const visAfter=chipsOf('sell').filter(c=>c.indexOf('delhd')<0&&c.indexOf('del')<0).length;
console.log('  删前可见:', visBefore, '→ 删 5 个后可见:', visAfter, (visAfter<visBefore?'✅ 变少了':'❌ 反而变多'));
if(visAfter>=visBefore) fail('删完可见项没有变少（仍是"越删越多"）');

console.log('\n===== 全部恢复 =====');
['sell','crowd','scene'].forEach(kk=>{ (state.blocked[kk]||[]).slice().forEach(w=>globalThis.__UB(kk,w)); });
const after=globalThis.__PF('sell');
console.log('  卖点池回到:', after.length, '条', after.length===start.length?'✅ 与初始一致':'❌');
if(after.length!==start.length) fail('恢复后池子没回到初始规模');

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
