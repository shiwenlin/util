// 验收：卖点/人群/场景 词可删除 → 全局屏蔽（商品标题 + SKU 主推 + 3 条备选都不再用）
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;globalThis.__BW=blockWord;globalThis.__UB=unblockWord;globalThis.__IB=isBlockedWord;globalThis.__PF=poolFor;\n'+src.slice(k);

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
const state=globalThis.__ST, run=globalThis.__RUN;

const RESEARCH=`功能点：芦荟 泡沫 抑菌 免洗 无香 滋润 清爽 野菊花
规格：500g 255g 50g 5kg 补充装
人群：儿童 成人 母婴 全家
场景：家用 厨房 卫生间 便携 旅行
热搜词：洗手液家用按压瓶 免洗洗手液便携 儿童洗手液泡沫 抑菌洗手液芦荟 洗手液不伤手滋润 野菊花洗手液`;
el('research').value=RESEARCH; globalThis.__DP();
el('strictSrc').checked=false;   // 宽松模式（池子更大，更容易看出屏蔽是否彻底）
el('skus').value='芦荟单瓶500g\n泡沫抑菌255g\n500ml免洗抑菌无香\n5kg大桶装\n儿童款500g\n芦荟500gx2+泡沫抑菌';
el('specAll').value='500g'; el('hero').value='0';

function snapshot(){
  const L=globalThis.__LAST();
  const t=[];
  L.titles.forEach(x=>t.push(x.text));
  L.skus.forEach(s=>{ t.push(s.title); (s.alts||[]).forEach(a=>t.push(a.title)); });
  return {L,txt:t.join(' ')};
}
let bad=0; const fail=m=>{console.log('   ❌ '+m);bad++;};

run();
const A=snapshot();
console.log('===== 删除前 =====');
A.L.skus.forEach(s=>{
  console.log('  '+s.raw+' → '+s.title);
  (s.alts||[]).forEach(a=>console.log('       '+a.lb+' '+a.title));
});

// 挑一个「被真正用上、且不是规格本身」的词来删
const specs=A.L.skus.map(s=>s.spec);
let victim=null;
A.L.skus.forEach(s=>{
  if(victim) return;
  (s.intent||'').split(' / ').map(x=>x.trim()).filter(Boolean).forEach(w=>{
    if(victim) return;
    if(specs.some(sp=>sp.indexOf(w)>-1)) return;
    if(A.txt.indexOf(w)>-1) victim=w;
  });
});
if(!victim){
  // 退而求其次：从商品标题里挑一个池内词
  ['抑菌','芦荟','泡沫','免洗','儿童','家用','厨房','便携','旅行','滋润','清爽'].forEach(w=>{
    if(!victim && A.txt.indexOf(w)>-1 && !specs.some(sp=>sp.indexOf(w)>-1)) victim=w;
  });
}
console.log('\n===== 删除词：'+victim+' =====');
if(!victim){ console.log('❌ 没挑到测试词'); process.exit(1); }

const kind=['sell','crowd','scene'].find(kk=>globalThis.__PF(kk).indexOf(victim)>-1)||'sell';
console.log('  归属词池:', kind);
globalThis.__BW(kind,victim);          // 删除 → 内部自动重算
const B=snapshot();

console.log('\n===== 删除后：屏蔽是否彻底 =====');
console.log('  isBlockedWord:', globalThis.__IB(victim)?'✅ 已屏蔽':'❌ 未屏蔽');
if(!globalThis.__IB(victim)) fail('isBlockedWord 未生效');
console.log('  三个词池里都不再出现:', ['sell','crowd','scene'].every(kk=>globalThis.__PF(kk).indexOf(victim)<0)?'✅':'❌');
if(!['sell','crowd','scene'].every(kk=>globalThis.__PF(kk).indexOf(victim)<0)) fail('词池未过滤');
console.log('  商品标题含该词:', B.L.titles.filter(t=>t.text.indexOf(victim)>-1).length, '条');
console.log('  SKU 主推/备选含该词:', B.txt.indexOf(victim)>-1?'❌ 仍有':'✅ 0 条');
if(B.txt.indexOf(victim)>-1){
  fail('删除后仍出现在标题里');
  B.L.skus.forEach(s=>{
    if(s.title.indexOf(victim)>-1) console.log('      主推残留: '+s.title);
    (s.alts||[]).forEach(a=>{ if(a.title.indexOf(victim)>-1) console.log('      备选残留: '+a.lb+' '+a.title); });
  });
}
console.log('  已勾选列表已剔除:', state.vals[kind].indexOf(victim)<0?'✅':'❌');
if(state.vals[kind].indexOf(victim)>-1) fail('已选列表未剔除');
console.log('  屏蔽数:', state.blocked[kind].length, '个');

console.log('\n  删除后各 SKU（应换其他词，不应出现空格/断层）:');
B.L.skus.forEach(s=>console.log('  '+s.raw+' → '+s.title+'  ('+s.len+')'));
B.L.skus.forEach(s=>{ if(s.len>30) fail('超30字符: '+s.title); if(!s.title) fail('空标题'); });

console.log('\n===== 恢复 =====');
globalThis.__UB(kind,victim);
console.log('  isBlockedWord:', globalThis.__IB(victim)?'❌ 仍屏蔽':'✅ 已恢复');
if(globalThis.__IB(victim)) fail('恢复失败');
console.log('  词池回归:', ['sell','crowd','scene'].some(kk=>globalThis.__PF(kk).indexOf(victim)>-1)?'✅':'❌');
if(!['sell','crowd','scene'].some(kk=>globalThis.__PF(kk).indexOf(victim)>-1)) fail('恢复后词池没回来');
const C=snapshot();
console.log('  恢复后 SKU 数:', C.L.skus.length, '（应与删除前一致）');
if(C.L.skus.length!==A.L.skus.length) fail('恢复后 SKU 数变了');

console.log('\n===== 极端：把卖点池删光 =====');
globalThis.__PF('sell').slice().forEach(w=>globalThis.__BW('sell',w));
const D=snapshot();
console.log('  卖点池剩余:', globalThis.__PF('sell').length, '条');
console.log('  仍能出 SKU 标题:', D.L.skus.every(s=>!!s.title)?'✅':'❌ 出现空标题');
if(!D.L.skus.every(s=>!!s.title)) fail('删光后出空标题');
console.log('  超30字符:', D.L.skus.filter(s=>s.len>30).length, '条');
console.log('  示例:', D.L.skus.slice(0,3).map(s=>s.title).join(' | '));

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
