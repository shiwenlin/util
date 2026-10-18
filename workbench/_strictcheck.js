function clen(s){var n=0;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);n+=(c>255)?2:1;}return n;}
/* 验收：SKU 标题「不矛盾 + 真实具备」改造（严格模式 ON / OFF 对照） */
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;globalThis.__FC=findConflict;\n'+src.slice(k);
const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},options:[],children:[],files:[],classList:{add(){},remove(){}},appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},setAttribute(){},getAttribute:()=>null}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''}};
global.navigator={clipboard:{writeText:()=>Promise.resolve()}};
global.alert=()=>{};
el('cat2').value='A2'; el('cat3').value='handwash'; el('month').value='10'; el('brand').value='蓝月亮';
el('skus').value='500g单瓶'; el('hero').value='0'; el('specAll').value='';
new Function(src)();
const state=globalThis.__ST, run=globalThis.__RUN;

const RESEARCH=[
 '品类词：洗手液 抑菌洗手液 抗菌洗手液',
 '功效词：抑菌 滋润 清爽 护手 保湿 温和',
 '规格词：500g 补充装 套装 家庭装 大容量 囤货装 2瓶装 6瓶装',
 '成分香型词：芦荟 野菊花 泡沫',
 '品牌词：蓝月亮',
 '场景人群词：家用 全家 厨房'
].join('\n');
el('research').value=RESEARCH;
globalThis.__DP();

const SKUS=[
 '芦荟单瓶500g','芦荟500g+补充装500g','芦荟500g+野菊花500g',
 '芦荟500gx2+泡沫抑菌','芦荟500gx2+补充装x2','芦荟x2+野菊花x2',
 '芦荟500gx3+补充装x3','芦荟x3+野菊花x3','野菊花500gx3+补充装x3'
];
el('skus').value=SKUS.join('\n');
el('specAll').value='500g';
el('hero').value='0';

let bad=0;
function ok(c,m){ console.log((c?'✅ ':'❌ ')+m); if(!c) bad++; }

[true,false].forEach(function(strict){
  el('strictSrc').checked=strict;
  console.log('\n================ 严格模式 = '+(strict?'ON（只用真实词）':'OFF（允许内置词兜底）')+' ================');
  run();
  const L=globalThis.__LAST();
  console.log('商品标题:', L.titles[0].text, ' ['+clen(L.titles[0].text)+'/60]');
  console.log('');
  L.skus.forEach(function(s){
    const cf=(s.conflict||[]).map(c=>c.a+'×'+c.b).join(',');
    console.log('  '+String(s.rank).padEnd(2)+' '+s.raw.padEnd(22)+' -> '+s.title+
      '  ('+s.len+')  ['+s.intent+'] own='+JSON.stringify(s.own)+
      (cf?('  🔴矛盾:'+cf):'')+
      ((s.ghost||[]).length?('  🔴凭空规格:'+s.ghost.join()):'')+
      ((s.builtin||[]).length?('  🟡内置:'+s.builtin.join('/')):'')+
      ((s.borrowed||[]).length?('  🟡借用:'+s.borrowed.join('/')):''));
  });
  const cfN=L.skus.filter(s=>(s.conflict||[]).length).length;
  const biN=L.skus.filter(s=>(s.builtin||[]).length).length;
  const bwN=L.skus.filter(s=>(s.borrowed||[]).length).length;
  const ghN=L.skus.filter(s=>(s.ghost||[]).length).length;
  const overN=L.skus.filter(s=>s.len>30).length;
  const emptyN=L.skus.filter(s=>!s.intent).length;
  console.log('\n  矛盾 '+cfN+' / 凭空规格 '+ghN+' / 内置词 '+biN+' / 借用词 '+bwN+' / 超30字符 '+overN+' / 未分到词 '+emptyN);
  console.log('  已自动丢弃的矛盾词:', JSON.stringify(L.dropped));
  ok(cfN===0, '无自相矛盾标题');
  ok(ghN===0, '无凭空规格');
  ok(overN===0, 'SKU标题均≤30字符');
  if(strict){ ok(biN===0, '严格模式：无内置词'); ok(bwN===0, '严格模式：无借用词'); }
});

console.log('\n===== 互斥检测单元验证 =====');
const FC=globalThis.__FC;
const cases=[
 [['500g*2瓶','袋装'], true,  '瓶装 vs 袋装'],
 [['500g单瓶','整箱'], true,  '单只 vs 多只'],
 [['儿童款300ml','成人'], true, '儿童 vs 成人'],
 [['500g补充装','家庭装'], true,'补充装 vs 家庭装'],
 [['旅行装100g','大桶装'], true,'便携 vs 大容量'],
 [['无香型500g','留香'], true, '无香 vs 留香'],
 [['500g*2瓶','去血渍'], false,'规格 vs 功效（不该冲突）'],
 [['500g单瓶','抑菌'],  false,'规格 vs 功效（不该冲突）']
];
cases.forEach(function(c){
  const r=FC(c[0]).length>0;
  ok(r===c[1], (c[1]?'应冲突':'不该冲突')+' ['+c[0].join(' + ')+'] '+c[2]+' → 实际'+(r?'冲突':'不冲突'));
});

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
