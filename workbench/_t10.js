// 压测：SKU 数量 1~10 全跑一遍，检查重复/超限/空意图
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;\n'+src.slice(k);
const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},options:[],children:[],files:[],classList:{add(){},remove(){}},appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},setAttribute(){},getAttribute:()=>null}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''}};
global.navigator={clipboard:{writeText:()=>Promise.resolve()}};
global.alert=()=>{};
el('cat2').value='D'; el('cat3').value='liquid'; el('month').value='10'; el('brand').value='蓝月亮';
el('skus').value='500g单瓶'; el('hero').value='0'; el('specAll').value='';
new Function(src)();
const state=globalThis.__ST, run=globalThis.__RUN;

const RESEARCH=[
 '功能点：计量泵头设计 专业手洗配方 让手洗更轻松 去污渍 去血渍 去油渍 留香 强效 温和',
 '规格：500g瓶 1kg瓶 袋装补充装 组合装 实惠装 整箱',
 '香型：风清白兰 薰衣草 茉莉清香',
 '人群：学生 学生党 宿舍 家庭',
 '场景：手洗 内衣裤 贴身衣物 宿舍',
 '祛除（本品不可用）：除菌 抑菌 杀菌 抗菌 除螨 99.9%'
].join('\n');
el('research').value=RESEARCH;
globalThis.__DP();

const POOL=['500g单瓶','1kg瓶','袋装补充装','500g*2瓶','组合装','整箱','1kg*2瓶','旅行装100g','300g单瓶','实惠装2kg'];
const SELL4=['计量泵头设计','专业手洗配方','去污渍','留香'];

console.log('SKU数 | 已选4 + 备选消化 | 重复意图词 | 空意图 | 超限 | 备选池剩余');
console.log('------|------------------|-----------|--------|------|----------');
for(let n=1;n<=10;n++){
  state.vals.sell=SELL4.slice();
  el('skus').value=POOL.slice(0,n).join('\n');
  el('specAll').value='500g瓶'; el('hero').value='0';
  run();
  const L=globalThis.__LAST();
  const intents=[];
  L.skus.forEach(s=>s.intent.split(' / ').forEach(w=>{ if(w) intents.push(w); }));
  const dup=Array.from(new Set(intents.filter((w,i)=>intents.indexOf(w)!==i)));
  const empty=L.skus.filter(s=>!s.intent.trim()).length;
  const over=L.skus.filter(s=>s.len>30).length;
  const used=(L.usedReserve||[]).length;
  const left=(L.reserve||[]).length-used;
  console.log(
    String(n).padStart(5)+' | '+
    ('4 + '+used).padStart(15)+' | '+
    (dup.length?dup.join(','):'无').padStart(10)+' | '+
    String(empty).padStart(6)+' | '+
    String(over).padStart(4)+' | '+
    String(left).padStart(9)
  );
}

console.log('\n===== 10 个 SKU 明细 =====');
state.vals.sell=SELL4.slice();
el('skus').value=POOL.join('\n');
el('specAll').value='500g瓶'; el('hero').value='0';
run();
const L=globalThis.__LAST();
L.skus.forEach(function(s,i){ console.log('  '+(i+1)+' '+s.spec+'  ->  '+s.title+'   ('+s.len+'/30)   意图: '+s.intent); });
