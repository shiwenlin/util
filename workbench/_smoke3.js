/* 解析引擎回归测试：验证「研究文本 → 词池」抽取 */
const fs=require('fs');
const h=fs.readFileSync('个护家清标题工作台.html','utf8');
const src=h.match(/<script>([\s\S]*?)<\/script>/)[1];

/* ---- 最小 DOM stub，让脚本能完整执行（含 init） ---- */
const store={};
function el(id){
  if(store[id]) return store[id];
  const e={
    id:id, value:'', textContent:'', innerHTML:'', checked:false, disabled:false,
    style:{}, className:'', tagName:'DIV', options:[], children:[], files:[], parentNode:null,
    classList:{add(){},remove(){},toggle(){},contains(){return false;}},
    appendChild(c){ e.children.push(c); if(c&&c.tagName==='OPTION') e.options.push(c); return c; },
    removeChild(){}, insertBefore(){}, addEventListener(){}, removeEventListener(){},
    querySelector(){return null;}, querySelectorAll(){return [];},
    focus(){}, click(){}, blur(){}, setAttribute(){}, getAttribute(){return null;},
    getContext(){return null;}, remove(){}, scrollIntoView(){}
  };
  store[id]=e; return e;
}
global.document={
  getElementById:el,
  createElement:function(tag){ const e=el('__'+tag+'_'+(el._n=(el._n||0)+1)); e.tagName=String(tag).toUpperCase(); return e; },
  querySelector:()=>null, querySelectorAll:()=>[],
  addEventListener(){}, createTextNode:()=>({}),
  body:{appendChild(){},style:{}}
};
global.window={addEventListener(){},location:{href:''}};
global.navigator={clipboard:{writeText(){return Promise.resolve();}}};
global.alert=()=>{};
global.Blob=function(){}; global.URL={createObjectURL:()=>'',revokeObjectURL(){}};
global.FileReader=function(){ this.readAsText=function(){}; };

// 预设：洗衣液 / 蓝月亮 / 10月
store['cat2']=el('cat2'); store['cat2'].value='D';
store['cat3']=el('cat3'); store['cat3'].value='liquid';
store['brand']=el('brand'); store['brand'].value='蓝月亮';
store['month']=el('month'); store['month'].value='10';
store['skus']=el('skus'); store['skus'].value='500g单瓶\n1kg瓶\n袋装补充装\n500g*2瓶\n组合装\n整箱';
store['specAll']=el('specAll'); store['specAll'].value='';

// 在 IIFE 收尾处挂出内部函数
const k=src.lastIndexOf('})();');
const src2=src.slice(0,k)+'\nglobalThis.__PR=parseResearch;globalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=function(){return LAST;};\n'+src.slice(k);
new Function(src2)();
const parseResearch=globalThis.__PR, doParse=globalThis.__DP, state=globalThis.__ST, run=globalThis.__RUN;

const T1=`功能点：计量泵头设计 专业手洗配方 让手洗更轻松 去污渍 去血渍 去油渍 留香 强效 温和
规格：500g瓶 1kg瓶 袋装补充装 组合装 实惠装 整箱
香型：风清白兰 薰衣草 茉莉清香
人群：学生 学生党 宿舍 家庭 家用
场景：手洗 内衣裤 贴身衣物 宿舍
祛除（本品不可用）：除菌 抑菌 杀菌 抗菌 除螨 99.9%`;

const T2=`1. 功能点：泡沫丰富、温和、不干手、氨基酸、芦荟、抑菌（有检测报告）
2. 规格：500g单瓶；500g*2瓶；500g补充装；255g；50g便携；5kg大桶
3. 人群：儿童 母婴 全家
4. 场景：厨房 卫生间 办公室 便携
5. 竞品标题：威露士内衣洗衣液抑菌除螨(10万) 汰渍袋装去渍除菌除螨
6. 热搜词：手洗洗衣液学生宿舍 · 内衣洗衣液女士专用 · 洗衣液去血渍 · 蓝月亮手洗专用洗衣液
7. 平台主题：双11预售 + 秋冬换季`;

const T3=`随便粘一堆词，没有标签，用逗号和换行都行
泡沫，芦荟，不干手
儿童 厨房`;

const T4=`功能点：
- 计量泵头设计
- 专业手洗配方
规格：500g瓶`;

function show(t,name){
  const r=parseResearch(t);
  console.log('\n===== '+name+' =====');
  console.log('卖点('+r.sell.length+'): '+r.sell.join(' / '));
  console.log('人群('+r.crowd.length+'): '+r.crowd.join(' / '));
  console.log('场景('+r.scene.length+'): '+r.scene.join(' / '));
  console.log('规格('+r.spec.length+'): '+r.spec.join(' / '));
  console.log('热搜('+r.hot.length+'): '+r.hot.slice(0,8).join(' · '));
  console.log('排除('+r.excl.length+'): '+r.excl.join(' / '));
  // 只有本次研究里声明了排除清单，才检查是否泄漏
  if(r.excl.length){
    const leak=[];
    ['sell','crowd','scene','hot'].forEach(k=>r[k].forEach(w=>r.excl.forEach(b=>{
      if(w.indexOf(b)>-1||b.indexOf(w)>-1) leak.push(k+':'+w);
    })));
    console.log(leak.length?('❌ 排除词泄漏: '+leak.join(', ')):'✅ 排除词已全部剔除');
  }else{
    console.log('— 本次未声明排除清单，功效词按原文保留');
  }
  return r;
}

const r1=show(T1,'用例1 · 蓝月亮洗衣液（带排除行）');
const r2=show(T2,'用例2 · 编号+分号+热搜词');
const r3=show(T3,'用例3 · 无标签纯词堆');
const r4=show(T4,'用例4 · 标签下一行才给词');

let bad=0;
function must(cond,msg){ console.log((cond?'✅ ':'❌ ')+msg); if(!cond) bad++; }
console.log('\n===== 断言 =====');
must(r1.sell.length>=8,'用例1 卖点≥8个（实际'+r1.sell.length+'）');
must(r1.sell.indexOf('去血渍')>-1,'用例1 保留原文用词「去血渍」');
must(r1.sell.indexOf('留香')>-1,'用例1 抽出「留香」');
must(r1.sell.indexOf('温和')>-1,'用例1 抽出「温和」');
must(r1.spec.indexOf('500g瓶')>-1,'用例1 规格进规格池');
must(r1.crowd.indexOf('学生')>-1,'用例1 人群「学生」');
must(r1.scene.indexOf('内衣裤')>-1,'用例1 场景「内衣裤」');
must(r2.hot.length>=3,'用例2 热搜词≥3个（实际'+r2.hot.length+'）');
must(r2.hot[0].indexOf('手洗洗衣液学生宿舍')>-1,'用例2 长尾词完整保留');
must(r2.spec.join('').indexOf('补充装')>-1,'用例2 规格含补充装');
must(r3.sell.indexOf('泡沫')>-1,'用例3 无标签也能抽词');
must(r3.scene.indexOf('厨房')>-1,'用例3 无标签场景归类');
must(r4.sell.length>=2,'用例4 标签行换行后仍能抽词（实际'+r4.sell.length+'）');

console.log('\n===== doParse 端到端（模拟粘贴回填） =====');
store['research']=el('research'); store['research'].value=T1;
doParse();
console.log('resInfo: '+String(store['resInfo'].innerHTML).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,400));
must(store['specAll'].value.indexOf('500g')>-1,'规格自动回填 specAll（值='+store['specAll'].value+'）');
must(state.vals.sell.length>0,'回填后自动选中卖点 '+state.vals.sell.length+' 个');
console.log('选中: '+state.vals.sell.join('/')+' | 人群: '+state.vals.crowd.join('/')+' | 场景: '+state.vals.scene.join('/'));

console.log('\n===== 全链路：回填 → 生成标题 =====');
store['skus']=el('skus');
store['skus'].value='500g单瓶\n1kg瓶\n袋装补充装\n500g*2瓶\n组合装\n整箱';
store['research']=el('research'); store['research'].value=T1;
doParse();
run();
const L=globalThis.__LAST();
console.log('【商品标题 3 候选】');
L.titles.forEach((t,i)=>console.log('  '+['① 宽覆盖','② 卖点型','③ 长尾型'][i]+' '+t.text));
console.log('【SKU 搜索标题】');
let over=0;
L.skus.forEach(s=>{
  const ok=s.len<=30; if(!ok) over++;
  console.log('  '+(ok?'✅':'❌')+' ['+s.raw+'] → '+s.title+'  ('+s.len+'/30)  意图:'+(s.intent||'—'));
});
must(over===0,'全部 SKU 标题 ≤30 字符（超限 '+over+' 条）');
must(!/除菌|抑菌|杀菌|抗菌|除螨|99\.9%/.test(L.titles.map(t=>t.text).join('')+L.skus.map(s=>s.title).join('')),'排除词未出现在任何标题里');

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');

console.log('\n===== 时段词是否进了标题 =====');
console.log('MONTH[10].tag =', JSON.stringify(globalThis.__MT?globalThis.__MT[10]:null));
console.log('标题① =', L.titles[0].text, ' 字符=', L.titles[0].text.length);
console.log('是否含双11/秋冬 =', /双11|秋冬|囤货/.test(L.titles.map(t=>t.text).join('|')));
console.log('vals.sell =', JSON.stringify(state.vals.sell));
console.log('vals.crowd =', JSON.stringify(state.vals.crowd), ' vals.scene =', JSON.stringify(state.vals.scene));
console.log('specAll =', JSON.stringify(store['specAll'].value));

console.log('\n===== 备选词（未勾选）去向检查 =====');
console.log('已选卖点:', JSON.stringify(state.vals.sell));
console.log('备选池共', L.reserve.length, '个:', JSON.stringify(L.reserve));
console.log('其中被SKU消化的', (L.usedReserve||[]).length, '个:', JSON.stringify(L.usedReserve));
const unused=(L.reserve||[]).filter(w=>(L.usedReserve||[]).indexOf(w)<0);
console.log('未排上的', unused.length, '个:', JSON.stringify(unused));
console.log('\nSKU标题用到的意图词:');
L.skus.forEach(s=>console.log('  ', s.spec, '->', s.intent));
