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
// init() 在脚本执行时就跑了，得先给关键元素兜底值
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

el('cat2').value='D'; el('cat3').value='liquid';
el('month').value='10'; el('brand').value='蓝月亮';
el('research').value=RESEARCH;
globalThis.__DP();

// 只勾 4 个卖点
state.vals.sell=['计量泵头设计','专业手洗配方','去污渍','留香'];

const SKUS=['500g单瓶','1kg瓶','袋装补充装','500g*2瓶','组合装','整箱','1kg*2瓶','旅行装100g'];
el('skus').value=SKUS.join('\n');
el('specAll').value='500g瓶';
el('hero').value='0';

console.log('已选卖点:', JSON.stringify(state.vals.sell));
console.log('已选人群:', JSON.stringify(state.vals.crowd));
console.log('已选场景:', JSON.stringify(state.vals.scene));
run();
const L=globalThis.__LAST();
console.log('\n【备选池共 ' + L.reserve.length + ' 个】');
console.log(JSON.stringify(L.reserve));
console.log('\n【' + SKUS.length + ' 个 SKU 标题】');
L.skus.forEach(function(s,i){ console.log('  '+(i+1)+' '+s.spec+'  ->  '+s.title+'   ('+s.len+'/30)   意图: '+s.intent); });

const intents=[];
L.skus.forEach(function(s){ s.intent.split(' / ').forEach(function(w){ if(w) intents.push(w); }); });
const dup=intents.filter(function(w,i){ return intents.indexOf(w)!==i; });
console.log('\n重复使用的意图词: ' + (dup.length?JSON.stringify(Array.from(new Set(dup))):'无'));
console.log('消化掉的备选词 ' + (L.usedReserve||[]).length + ' 个: ' + JSON.stringify(L.usedReserve));
const unused=(L.reserve||[]).filter(function(w){ return (L.usedReserve||[]).indexOf(w)<0; });
console.log('没排上的备选词 ' + unused.length + ' 个: ' + JSON.stringify(unused));
console.log('\n超限SKU: ' + L.skus.filter(function(s){ return s.len>30; }).length);
