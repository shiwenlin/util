function clen(s){var n=0;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);n+=(c>255)?2:1;}return n;}
// 按用户 SOP 案例验收：蓝月亮洗手液 9 SKU
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
el('cat2').value='A2'; el('cat3').value='handwash'; el('month').value='10'; el('brand').value='蓝月亮';
el('skus').value='500g单瓶'; el('hero').value='0'; el('specAll').value='';
new Function(src)();
const state=globalThis.__ST, run=globalThis.__RUN;

// 用户 SOP 第六节的词池原样
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

// 用户 SOP 的 9 个 SKU
const SKUS=[
 '芦荟单瓶500g',
 '芦荟500g+补充装500g',
 '芦荟500g+野菊花500g',
 '芦荟500gx2+泡沫抑菌',
 '芦荟500gx2+补充装x2',
 '芦荟x2+野菊花x2',
 '芦荟500gx3+补充装x3',
 '芦荟x3+野菊花x3',
 '野菊花500gx3+补充装x3'
];
el('skus').value=SKUS.join('\n');
el('specAll').value='500g';
el('hero').value='0';
console.log('已选卖点:', JSON.stringify(state.vals.sell));
console.log('已选人群:', JSON.stringify(state.vals.crowd));
console.log('已选场景:', JSON.stringify(state.vals.scene));
run();
const L=globalThis.__LAST();

console.log('\n===== 商品标题 =====');
L.titles.forEach((t,i)=>console.log(' ', i+1, t.text, '  [淘宝字符'+clen(t.text)+'/60]'));

console.log('\n===== SKU 搜索标题（对照用户 SOP 成品）=====');
const USER=[
 '蓝月亮芦荟抑菌洗手液500g','蓝月亮芦荟洗手液含补充装','蓝月亮芦荟野菊花洗手液2瓶',
 '蓝月亮泡沫抑菌洗手液套装','蓝月亮芦荟洗手液家庭装套装','蓝月亮芦荟野菊花洗手液4瓶',
 '蓝月亮芦荟洗手液大容量6件','蓝月亮芦荟野菊花洗手液6瓶','蓝月亮野菊花洗手液大容量6件'
];
L.skus.forEach((s,i)=>{
  console.log(' ', (i+1)+'. 输入:', SKUS[i]);
  console.log('     工作台:', s.title, '  [字符'+s.len+' 汉字'+(s.len/2)+']');
  console.log('     用户SOP:', USER[i], '  [淘宝字符'+clen(USER[i])+']');
  console.log('     意图:', s.intent);
});
console.log('\nSKU标题 是否含品牌:', L.skus.map(s=>s.title.indexOf('蓝月亮')>-1?'Y':'N').join(' '));
console.log('SKU标题 是否含品类词[洗手液]:', L.skus.map(s=>s.title.indexOf('洗手液')>-1?'Y':'N').join(' '));
console.log('低于20字符(10汉字)的SKU:', L.skus.filter(s=>s.len<20).length, '个');
console.log('超30字符的SKU:', L.skus.filter(s=>s.len>30).length, '个');
