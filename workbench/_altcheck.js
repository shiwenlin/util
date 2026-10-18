// 验收：每个 SKU 的主推 + 3 条备选
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__PR=parseResearch;globalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;\n'+src.slice(k);

const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},options:[],children:[],files:[],classList:{add(){},remove(){}},appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},setAttribute(){},getAttribute:()=>null}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''}};
global.navigator={clipboard:{writeText:()=>Promise.resolve()}};
global.alert=()=>{};
el('cat2').value='A2'; el('cat3').value='handwash'; el('month').value='10';
new Function(src)();
const state=globalThis.__ST, run=globalThis.__RUN;

const RESEARCH=`功能点：芦荟 泡沫 抑菌 免洗 无香 滋润 清爽 野菊花
规格：500g 255g 50g 5kg 补充装
人群：儿童 成人 母婴 全家
场景：家用 厨房 卫生间 便携 旅行
热搜词：洗手液家用按压瓶 洗手液补充装大瓶 免洗洗手液便携 儿童洗手液泡沫 抑菌洗手液芦荟 洗手液双11囤货 洗手液不伤手滋润 野菊花洗手液`;
const SKUS=['芦荟单瓶500g','泡沫抑菌255g','芦荟500gx2+泡沫抑菌','500ml免洗抑菌无香','芦荟500g+野菊花500g','5kg大桶装','芦荟x2+野菊花x2','野菊花500gx3+补充装x3','儿童款500g'];

el('cat2').value='A2'; el('cat3').value='handwash';
el('month').value='10'; el('brand').value='蓝月亮';
el('research').value=RESEARCH;
globalThis.__DP();
el('strictSrc').checked=true;      // 严格模式
el('skus').value=SKUS.join('\n');
el('specAll').value='500g';
el('hero').value='0';
run();
const L=globalThis.__LAST();

console.log('已选卖点:', JSON.stringify(state.vals.sell));
console.log('已选人群:', JSON.stringify(state.vals.crowd), ' 已选场景:', JSON.stringify(state.vals.scene));
console.log('\n商品标题:');
L.titles.forEach((t,i)=>console.log('  '+(i+1)+'. '+t.text));

let bad=0;
console.log('\n===== 每个 SKU：主推 + 备选 =====');
L.skus.forEach(s=>{
  console.log('\n【'+s.raw+'】 主推: '+s.title+'  ('+s.len+')');
  if(!s.alts||!s.alts.length){ console.log('   ❌ 无备选'); bad++; return; }
  s.alts.forEach(a=>{
    const okL=a.len<=30;
    console.log('   '+a.lb+' ['+a.route+'] '+a.title+'  ('+a.len+')'+(okL?'':' ❌超30'));
    if(!okL) bad++;
    if(a.title===s.title){ console.log('      ❌ 与主推重复'); bad++; }
  });
  if(s.alts.length<3){ console.log('   ⚠️ 只有 '+s.alts.length+' 条备选'); }
  const dup=s.alts.map(a=>a.title).filter((t,i2,arr)=>arr.indexOf(t)!==i2);
  if(dup.length){ console.log('   ❌ 备选之间重复: '+dup.join(',')); bad++; }
});

// 统计
const cnt=L.skus.map(s=>(s.alts||[]).length);
console.log('\n===== 统计 =====');
console.log('SKU 数:', L.skus.length);
console.log('备选数分布:', JSON.stringify(cnt));
console.log('满 3 条备选的 SKU:', cnt.filter(x=>x>=3).length, '/', L.skus.length);
console.log('全部备选 ≤30 字符:', L.skus.every(s=>(s.alts||[]).every(a=>a.len<=30))?'✅':'❌');
console.log('无备选与主推重复:', L.skus.every(s=>(s.alts||[]).every(a=>a.title!==s.title))?'✅':'❌');

// 未勾选时是否仍有备选：清空所有勾选再跑一次
console.log('\n===== 关键验证：一个词都不勾选，是否仍有备选 =====');
state.vals.sell=[]; state.vals.crowd=[]; state.vals.scene=[];
run();
const L2=globalThis.__LAST();
console.log('已选:', JSON.stringify(state.vals.sell), JSON.stringify(state.vals.crowd), JSON.stringify(state.vals.scene));
const c2=L2.skus.map(s=>(s.alts||[]).length);
console.log('备选数分布:', JSON.stringify(c2), ' 满3条:', c2.filter(x=>x>=3).length+'/'+L2.skus.length);
L2.skus.slice(0,3).forEach(s=>{
  console.log('  '+s.raw+' → 主推 '+s.title);
  (s.alts||[]).forEach(a=>console.log('      '+a.lb+' '+a.title));
});
console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
